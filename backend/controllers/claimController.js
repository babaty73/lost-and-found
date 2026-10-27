import Item from "../models/Items.js";
import Claim from "../models/Claim.js";
import identityProvider from "../services/identityProvider.js";
import { missingFields } from "../utils/validation.js";
import { logAction } from "../utils/audit.js";
import { PUBLIC_VISIBLE_STATUSES, CLAIMABLE_STATUSES } from "./itemController.js";

// POST /api/items/:itemId/claims — public. No student account exists to
// authenticate this request; the claimantStudentId is an accountability
// identifier, not a password (see identityProvider.js).
export const createClaim = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const body = req.body || {};

    const item = await Item.findById(itemId);
    // A pending-handover (or otherwise non-public) item behaves exactly like
    // one that doesn't exist here too — a claim attempt must never be how a
    // public caller discovers an unpublished report.
    if (!item || !PUBLIC_VISIBLE_STATUSES.includes(item.status)) {
      return res.status(404).json({ message: "Item not found." });
    }
    if (item.type !== "found") {
      return res.status(400).json({ message: "Only found items can be claimed." });
    }
    if (!CLAIMABLE_STATUSES.includes(item.status)) {
      return res.status(409).json({ message: "This item is no longer open for claims." });
    }

    const claimType = "self";
    const required = ["claimantStudentId", "explanation"];

    const missing = missingFields(body, required);
    if (missing.length) {
      return res.status(400).json({ message: `Missing required field(s): ${missing.join(", ")}` });
    }

    const claimantStudentId = identityProvider.normalizeStudentId(body.claimantStudentId);
    if (!claimantStudentId) {
      return res.status(400).json({ message: "A valid institutional student ID is required." });
    }

    if (body.claimType === "on_behalf" || body.ownerStudentId) {
      return res.status(400).json({ message: "Claims can only be submitted for yourself." });
    }

    let claim;
    try {
      claim = await Claim.create({
        item: item._id,
        claimType,
        claimantStudentId,
        claimantContact: body.claimantContact || "",
        ownerStudentId: null,
        explanation: body.explanation,
        evidence: body.evidence || "",
        status: "pending",
      });
    } catch (err) {
      // Unique index on (item, claimantStudentId) -> this student already has
      // a claim on this item.
      if (err.code === 11000) {
        return res.status(409).json({ message: "You have already submitted a claim for this item." });
      }
      throw err;
    }

    // Claim submission is evidence-only. A public claim does not automatically
    // move the item into an admin review state or mark it as resolved; the
    // admin queue remains the place where operational escalation happens.
    await logAction({
      actorId: null,
      action: "CLAIM_SUBMITTED",
      itemId: item._id,
      claimId: claim._id,
      details: `claimType=${claimType}`,
    });

    // Never echo back other claimants' info; this response only reflects the
    // claim the caller themselves just submitted.
    res.status(201).json({
      id: claim._id,
      item: claim.item,
      claimType: claim.claimType,
      status: claim.status,
      createdAt: claim.createdAt,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/items/:itemId/claims — admin only. Full detail, for the item's
// operational review view.
export const listClaimsForItem = async (req, res, next) => {
  try {
    const claims = await Claim.find({ item: req.params.itemId }).sort({ createdAt: 1 });
    res.json(claims);
  } catch (err) {
    next(err);
  }
};

// GET /api/claims — admin only. Cross-item queue for the dashboard, e.g. ?status=pending
export const listAllClaims = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = { $in: String(status).split(",") };

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50);

    const [claims, total] = await Promise.all([
      Claim.find(query)
        .populate("item", "title category location type status")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Claim.countDocuments(query),
    ]);

    res.json({ claims, page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) || 1 });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/claims/:id/review — admin only. The admin decides each claim
// individually; the system never auto-rejects competing claims when one is
// verified (see architecture notes on why that would be an automatic
// ownership decision the software is not supposed to make).
export const reviewClaim = async (req, res, next) => {
  try {
    const { action, note } = req.body || {};
    const statusMap = { verify: "verified", reject: "rejected", cancel: "cancelled" };
    const nextStatus = statusMap[action];
    if (!nextStatus) {
      return res.status(400).json({ message: "action must be one of: verify, reject, cancel." });
    }

    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ message: "Claim not found." });
    if (claim.status !== "pending") {
      return res.status(409).json({ message: `This claim has already been ${claim.status}.` });
    }

    claim.status = nextStatus;
    claim.review = { reviewedBy: req.user._id, reviewedAt: new Date(), note: note || "" };
    await claim.save();

    await logAction({
      actorId: req.user._id,
      action: `CLAIM_${nextStatus.toUpperCase()}`,
      itemId: claim.item,
      claimId: claim._id,
      details: note || "",
    });

    res.json(claim);
  } catch (err) {
    next(err);
  }
};
