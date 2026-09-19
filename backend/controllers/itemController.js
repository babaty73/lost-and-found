import mongoose from "mongoose";
import Item from "../models/Items.js";
import Claim from "../models/Claim.js";
import identityProvider from "../services/identityProvider.js";
import { missingFields, isValidDate, pick } from "../utils/validation.js";
import { logAction } from "../utils/audit.js";

/**
 * Strips everything a normal student should never see off an item:
 * reporter/finder identity, intake notes, private verification details,
 * duplicate flags, and the internal side of the resolution record.
 * See architecture notes, "public vs private item information".
 */
function toPublicItem(item) {
  return {
    id: item._id,
    type: item.type,
    title: item.title,
    category: item.category,
    description: item.description,
    location: item.location,
    eventDate: item.eventDate,
    images: item.images,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function toAdminItem(item) {
  return item.toObject ? item.toObject() : item;
}

const LOST_REQUIRED_FIELDS = ["title", "category", "location", "eventDate", "reporterStudentId"];
const FOUND_REQUIRED_FIELDS = ["title", "category", "location", "eventDate"];
const ITEM_UPDATE_ALLOWED_FIELDS = [
  "title",
  "category",
  "description",
  "location",
  "eventDate",
  "images",
  "privateDetails",
  "flaggedDuplicateOf",
];

// GET /api/items — public, filtered/paginated, sanitized.
export const listItems = async (req, res, next) => {
  try {
    const { type, category, location, status, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (type) query.type = type;
    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: "i" };
    if (status) query.status = { $in: String(status).split(",") };
    if (search) query.$text = { $search: String(search) };

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50);

    const [items, total] = await Promise.all([
      Item.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Item.countDocuments(query),
    ]);

    res.json({
      items: items.map(toPublicItem),
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/items/:id — public, sanitized.
export const getItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ message: "Item not found." });
    res.json(toPublicItem(item));
  } catch (err) {
    next(err);
  }
};

// POST /api/items/lost — public. Students never log in; the student ID here
// is an accountability identifier only (see identityProvider.js).
export const createLostItem = async (req, res, next) => {
  try {
    const body = req.body || {};
    const missing = missingFields(body, LOST_REQUIRED_FIELDS);
    if (missing.length) {
      return res.status(400).json({ message: `Missing required field(s): ${missing.join(", ")}` });
    }
    if (!isValidDate(body.eventDate)) {
      return res.status(400).json({ message: "A valid approximate date is required." });
    }

    const studentId = identityProvider.normalizeStudentId(body.reporterStudentId);
    if (!studentId) {
      return res.status(400).json({ message: "A valid institutional student ID is required." });
    }

    const item = await Item.create({
      type: "lost",
      title: body.title,
      category: body.category,
      description: body.description || "",
      location: body.location,
      eventDate: body.eventDate,
      images: Array.isArray(body.images) ? body.images : [],
      reporterStudentId: studentId,
      reporterContact: body.reporterContact || null,
      status: "active",
    });

    res.status(201).json(toPublicItem(item));
  } catch (err) {
    next(err);
  }
};

// POST /api/items/found — admin only. This is the Student Union's intake form.
export const registerFoundItem = async (req, res, next) => {
  try {
    const body = req.body || {};
    const missing = missingFields(body, FOUND_REQUIRED_FIELDS);
    if (missing.length) {
      return res.status(400).json({ message: `Missing required field(s): ${missing.join(", ")}` });
    }
    if (!isValidDate(body.eventDate)) {
      return res.status(400).json({ message: "A valid approximate found date is required." });
    }

    const finderType = ["student", "staff", "unknown"].includes(body.finder?.type)
      ? body.finder.type
      : "unknown";

    const item = await Item.create({
      type: "found",
      title: body.title,
      category: body.category,
      description: body.description || "",
      location: body.location,
      eventDate: body.eventDate,
      images: Array.isArray(body.images) ? body.images : [],
      privateDetails: body.privateDetails || "",
      finder: {
        type: finderType,
        studentId: finderType === "student" ? identityProvider.normalizeStudentId(body.finder?.studentId) : null,
        name: finderType === "staff" ? (body.finder?.name || "").trim() || null : null,
      },
      intake: {
        receivedThrough: body.intake?.receivedThrough || "Other",
        notes: body.intake?.notes || "",
        receivedAt: isValidDate(body.intake?.receivedAt) ? body.intake.receivedAt : Date.now(),
        registeredBy: req.user._id,
      },
      status: "active",
    });

    await logAction({
      actorId: req.user._id,
      action: "ITEM_REGISTERED",
      itemId: item._id,
      details: `Found item registered via ${item.intake.receivedThrough}.`,
    });

    res.status(201).json(toAdminItem(item));
  } catch (err) {
    next(err);
  }
};

// GET /api/items/:id/admin — admin only, full (unsanitized) record.
export const getItemAdmin = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found." });
    res.json(toAdminItem(item));
  } catch (err) {
    next(err);
  }
};

// PATCH /api/items/:id — admin only. Explicit allow-list, never `req.body` passthrough.
export const updateItem = async (req, res, next) => {
  try {
    const updates = pick(req.body || {}, ITEM_UPDATE_ALLOWED_FIELDS);
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update." });
    }
    if (updates.eventDate && !isValidDate(updates.eventDate)) {
      return res.status(400).json({ message: "Invalid eventDate." });
    }

    const item = await Item.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ message: "Item not found." });

    await logAction({
      actorId: req.user._id,
      action: "ITEM_UPDATED",
      itemId: item._id,
      details: `Fields updated: ${Object.keys(updates).join(", ")}.`,
    });

    res.json(toAdminItem(item));
  } catch (err) {
    next(err);
  }
};

// PATCH /api/items/:id/unclaimed — admin only. Manual, non-destructive label;
// no automatic retention policy is invented here (that is an ASTU policy decision).
export const markUnclaimed = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found." });
    if (item.type !== "found") {
      return res.status(400).json({ message: "Only found items can be marked unclaimed." });
    }

    const hasActiveClaim = await Claim.exists({ item: item._id, status: { $in: ["pending", "verified"] } });
    if (hasActiveClaim) {
      return res.status(409).json({ message: "This item has an active claim and cannot be marked unclaimed." });
    }

    item.status = "unclaimed";
    await item.save();

    await logAction({ actorId: req.user._id, action: "ITEM_MARKED_UNCLAIMED", itemId: item._id });

    res.json(toAdminItem(item));
  } catch (err) {
    next(err);
  }
};

// PATCH /api/items/:id/resolve — admin only. For closing out a lost report
// (student found it themselves, withdrew it, etc.) with no claim involved.
export const resolveLostItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found." });
    if (item.type !== "lost") {
      return res.status(400).json({ message: "This endpoint is for lost-item reports only." });
    }
    if (item.status === "resolved" || item.status === "cancelled") {
      return res.status(409).json({ message: "This report is already closed." });
    }

    item.status = "resolved";
    item.resolution = {
      resolvedBy: req.user._id,
      resolvedAt: new Date(),
      method: req.body?.method || "self-reported",
      note: req.body?.note || "",
    };
    await item.save();

    await logAction({
      actorId: req.user._id,
      action: "LOST_ITEM_RESOLVED",
      itemId: item._id,
      details: item.resolution.note,
    });

    res.json(toAdminItem(item));
  } catch (err) {
    next(err);
  }
};

// POST /api/items/:id/return — admin only. The frontend can never move an
// item to "resolved" on its own; this is the only path that does it, and it
// requires a claim that an admin has already verified.
export const recordReturn = async (req, res, next) => {
  try {
    const { claimId, note } = req.body || {};
    if (!claimId || !mongoose.Types.ObjectId.isValid(claimId)) {
      return res.status(400).json({ message: "A valid claimId is required." });
    }

    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found." });
    if (item.type !== "found") {
      return res.status(400).json({ message: "Only found items can be returned." });
    }
    if (item.status === "resolved") {
      return res.status(409).json({ message: "This item has already been resolved." });
    }

    const claim = await Claim.findOne({ _id: claimId, item: item._id });
    if (!claim) {
      return res.status(404).json({ message: "Claim not found for this item." });
    }
    if (claim.status !== "verified") {
      return res.status(409).json({ message: "Only a verified claim can be used to record a return." });
    }

    item.status = "resolved";
    item.resolution = {
      returnedToClaim: claim._id,
      resolvedBy: req.user._id,
      resolvedAt: new Date(),
      method: "returned-to-owner",
      note: note || "",
    };
    await item.save();

    await logAction({
      actorId: req.user._id,
      action: "ITEM_RETURNED",
      itemId: item._id,
      claimId: claim._id,
      details: "Physical identity verified at the Student Union; item released.",
    });

    res.json(toAdminItem(item));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/items/:id — admin only, and only when the item has no claim
// history at all. This is for correcting mistaken/test entries, not for
// making a real report (or a rejected-claim record) disappear.
export const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found." });

    const hasAnyClaim = await Claim.exists({ item: item._id });
    if (hasAnyClaim) {
      return res.status(409).json({
        message: "This item has claim history and cannot be deleted. Use status changes instead.",
      });
    }

    await item.deleteOne();
    await logAction({ actorId: req.user._id, action: "ITEM_DELETED", details: `Deleted item "${item.title}".` });

    res.json({ message: "Item deleted." });
  } catch (err) {
    next(err);
  }
};

// GET /api/items/:id/possible-duplicates — admin only. A simple heuristic,
// never automatic — the admin decides what (if anything) to do about it.
export const findPossibleDuplicates = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found." });

    const windowMs = 7 * 24 * 60 * 60 * 1000;
    const candidates = await Item.find({
      _id: { $ne: item._id },
      type: item.type,
      category: item.category,
      eventDate: {
        $gte: new Date(item.eventDate.getTime() - windowMs),
        $lte: new Date(item.eventDate.getTime() + windowMs),
      },
    }).lean();

    const titleWords = item.title.toLowerCase().split(/\s+/).filter(Boolean);
    const scored = candidates
      .map((c) => {
        const cTitle = c.title.toLowerCase();
        const overlap = titleWords.filter((w) => cTitle.includes(w)).length;
        return { item: toAdminItem(c), overlapScore: overlap };
      })
      .filter((c) => c.overlapScore > 0)
      .sort((a, b) => b.overlapScore - a.overlapScore);

    res.json({ possibleDuplicates: scored });
  } catch (err) {
    next(err);
  }
};
