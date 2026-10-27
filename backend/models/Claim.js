import mongoose from "mongoose";

// A claim is its own persisted record — never a status flag on the frontend
// only. An item can have any number of claims; the same student cannot
// submit more than one claim on the same item (enforced by the unique index
// below, at the database level, not just in the controller).
const claimSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },

    // Self claims are the only supported claim type. Students may only claim
    // items for themselves; no one may submit a claim representing another
    // student.
    claimType: { type: String, enum: ["self"], default: "self" },

    claimantStudentId: { type: String, required: true, trim: true },
    claimantContact: { type: String, trim: true, default: "" },

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
