import mongoose from "mongoose";

// A practical, minimal audit trail — not an enterprise audit platform.
// "actor" is nullable to allow a small number of system-triggered entries
// (e.g. an item automatically moving to "under_review" when its first claim
// arrives) to be recorded without inventing a fake admin actor for them.
const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    action: { type: String, required: true, trim: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", default: null },
    claim: { type: mongoose.Schema.Types.ObjectId, ref: "Claim", default: null },
    details: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

auditLogSchema.index({ item: 1, createdAt: -1 });

export default mongoose.model("AuditLog", auditLogSchema);
