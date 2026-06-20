import express from "express";
import Item from "../models/Items.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch items" });
  }
});

router.post("/", async (req, res) => {
  try {
    const newItem = await Item.create(req.body);
    res.status(201).json(newItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create item" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json({ message: "Item deleted", item: deletedItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete item" });
  }
});

export default router;