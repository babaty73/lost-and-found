import mongoose from "mongoose";

// --- Image sub-document -----------------------------------------------
// Images are still stored inline as data-URL strings for now (see the audit
// note in the final report on why this should move to object storage later).
// What's new here is that the shape is validated: only a handful of image
// mime types are accepted and each image is size-capped server-side, not
// just in the React form (which a direct API call could always bypass).
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // ~2MB raw per image, checked from the base64 payload
const ALLOWED_IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGES_PER_ITEM = 5;

function validateImages(images) {
  if (!Array.isArray(images)) return false;
  if (images.length > MAX_IMAGES_PER_ITEM) return false;
  return images.every((img) => {
    if (typeof img !== "string") return false;
    const match = img.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (!match) return false;
    const [, mime, base64] = match;
    if (!ALLOWED_IMAGE_MIME.includes(mime)) return false;
    // base64 length -> approximate decoded byte size
    const approxBytes = base64.length * 0.75;
    return approxBytes <= MAX_IMAGE_BYTES;
  });
}

// --- Finder / intake info (found items only) ---------------------------
// "receivedThrough" is intentionally a free-ish string with a short list of
// common suggestions rather than a hard-coded enum of every possible ASTU
// role (librarian/teacher/cafe worker/etc.) — see architecture notes.
const finderSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["student", "staff", "unknown"], default: "unknown" },
    studentId: { type: String, trim: true, default: null },
    name: { type: String, trim: true, default: null },
    // Optional contact info for a student who submits their own found-item
    // report online (see createFoundReport) — distinct from `intake`, which
    // describes the Student Union's physical receipt of the item.
    contact: { type: String, trim: true, default: null },
  },
  { _id: false }
);

const intakeSchema = new mongoose.Schema(
  {
    // Left unset (null) until the Student Union has actually, physically
    // received the item — see acceptFoundHandover. Do not default this to
    // "now", or an online-only report would misleadingly look received.
    receivedThrough: { type: String, trim: true, default: null },
    notes: { type: String, trim: true, default: "" },
    receivedAt: { type: Date, default: null },
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { _id: false }
);

const resolutionSchema = new mongoose.Schema(
  {
    returnedToClaim: { type: mongoose.Schema.Types.ObjectId, ref: "Claim", default: null },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    resolvedAt: { type: Date, default: null },
    method: { type: String, trim: true, default: null }, // e.g. "returned-to-owner", "self-reported", "admin-closed"
    note: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const itemSchema = new mongoose.Schema(
  {
    // Explicit lost/found distinction — this did not exist in the prototype
    // and is required so the platform can actually tell the two workflows apart.
    type: { type: String, enum: ["lost", "found"], required: true },

    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    location: { type: String, required: true, trim: true },
    eventDate: { type: Date, required: true }, // approximate date/time lost or found

    images: {
      type: [String],
      default: [],
      validate: {
        validator: validateImages,
        message: `Images must be JPEG/PNG/WEBP data URLs, at most ${MAX_IMAGES_PER_ITEM}, each under ${Math.round(
          MAX_IMAGE_BYTES / (1024 * 1024)
        )}MB.`,
      },
    },

    // Item lifecycle. "pending_handover" is a found item reported online by
    // a student that the Student Union has not yet physically received —
    // it is never publicly visible and can never be claimed (see
    // itemController.listItems/getItem and claimController.createClaim).
    // Everything else is unchanged from before.
    status: {
      type: String,
      enum: ["pending_handover", "active", "under_review", "unclaimed", "resolved", "cancelled"],
      default: "active",
    },

    // --- Lost-item fields ---
    // Captured for accountability only — never shown on public item views.
    reporterStudentId: { type: String, trim: true, default: null },
    reporterContact: { type: String, trim: true, default: null },

    // --- Found-item fields ---
    finder: { type: finderSchema, default: () => ({}) },
    intake: { type: intakeSchema, default: () => ({}) },

    // Private verification details an admin can compare a claimant's answer
    // against (e.g. "small scratch under left corner"). Never exposed publicly.
    privateDetails: { type: String, trim: true, default: "" },

    // Admin-set, manual flag — never automatic — for a suspected duplicate report.
    flaggedDuplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: "Item", default: null },

    resolution: { type: resolutionSchema, default: () => ({}) },
  },
  { timestamps: true }
);

itemSchema.index({ type: 1, status: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ location: 1 });
itemSchema.index({ title: "text", description: "text" });

export default mongoose.model("Item", itemSchema);
