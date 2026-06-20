import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json([
    { name: "Phone" },
    { name: "Wallet" }
  ]);
});

export default router;