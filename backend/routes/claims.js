import express from "express";
import { listAllClaims, reviewClaim } from "../controllers/claimController.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// All cross-item claim operations are admin-only: students never authenticate,
// so there is no notion of "my claims" endpoint to expose here.
router.get("/", verifyToken, isAdmin, listAllClaims);
router.patch("/:id/review", verifyToken, isAdmin, reviewClaim);

export default router;
