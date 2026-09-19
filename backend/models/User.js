import mongoose from "mongoose";

// This system has exactly one application role: "admin", operated by the
// ASTU Student Union. Students never get accounts (see services/identityProvider.js
// and the architecture notes in the final report for why).
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: true },
    role: {
      type: String,
      enum: ["admin"],
      default: "admin",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
