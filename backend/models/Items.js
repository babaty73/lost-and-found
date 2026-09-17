import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: String,
  description: String,
  location: String,
  date: String,
  category: String,
  image: String,
  status: { type: String, default: "available" },
  userId: String
});

export default mongoose.model("Item", itemSchema);