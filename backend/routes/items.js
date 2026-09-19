import express from "express";
import {
  listItems,
  getItem,
  createLostItem,
  registerFoundItem,
  getItemAdmin,
  updateItem,
  markUnclaimed,
  resolveLostItem,
  recordReturn,
  deleteItem,
  findPossibleDuplicates,
} from "../controllers/itemController.js";
import { createClaim, listClaimsForItem } from "../controllers/claimController.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";

const router = express.Router();

// Public reports/claims are the two most abuse-prone unauthenticated
// endpoints in the whole app (no login gate can stop spam here by design —
// see architecture notes) — so both get their own rate limit.
const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: "Too many reports submitted from this connection. Please try again later.",
});
const claimLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: "Too many claims submitted from this connection. Please try again later.",
});

// --- Public ---
router.get("/", listItems);
router.get("/:id", getItem);
router.post("/lost", reportLimiter, createLostItem);
router.post("/:itemId/claims", claimLimiter, createClaim);

// --- Admin only ---
router.post("/found", verifyToken, isAdmin, registerFoundItem);
router.get("/:id/admin", verifyToken, isAdmin, getItemAdmin);
router.get("/:id/possible-duplicates", verifyToken, isAdmin, findPossibleDuplicates);
router.get("/:itemId/claims", verifyToken, isAdmin, listClaimsForItem);
router.patch("/:id", verifyToken, isAdmin, updateItem);
router.patch("/:id/unclaimed", verifyToken, isAdmin, markUnclaimed);
router.patch("/:id/resolve", verifyToken, isAdmin, resolveLostItem);
router.post("/:id/return", verifyToken, isAdmin, recordReturn);
router.delete("/:id", verifyToken, isAdmin, deleteItem);

export default router;
