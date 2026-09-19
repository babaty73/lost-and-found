import mongoose from "mongoose";

// A claim is its own persisted record — never a status flag on the frontend
// only. An item can have any number of claims; the same student cannot
// submit more than one claim on the same item (enforced by the unique index
// below, at the database level, not just in the controller).
const claimSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },

    // "self"   -> the person submitting the claim says the item is theirs
    // "on_behalf" -> the person submitting the claim is helping someone else
    // recover it. The two identities are always kept separate; submitting a
    // claim never implies the submitter is entitled to collect the item.
    claimType: { type: String, enum: ["self", "on_behalf"], default: "self" },

    claimantStudentId: { type: String, required: true, trim: true },
    claimantContact: { type: String, trim: true, default: "" },

    // Only meaningful when claimType === "on_behalf".
    ownerStudentId: { type: String, trim: true, default: null },

    explanation: { type: String, required: true, trim: true }, // "why do you believe this is yours"
    evidence: { type: String, trim: true, default: "" }, // additional identifying details

    status: {
      type: String,
      enum: ["pending", "verified", "rejected", "cancelled"],
      default: "pending",
    },

    review: {
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      reviewedAt: { type: Date, default: null },
      note: { type: String, trim: true, default: "" },
    },
  },
  { timestamps: true }
);

// Enforces "the same student must not be able to submit multiple claims for
// the same item" at the database level, not only in application code.
claimSchema.index({ item: 1, claimantStudentId: 1 }, { unique: true });
claimSchema.index({ status: 1 });

export default mongoose.model("Claim", claimSchema);
