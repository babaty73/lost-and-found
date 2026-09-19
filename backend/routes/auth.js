import express from "express";
import { register, login, me } from "../controllers/authController.js";
import { verifyToken, optionalAuth } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts. Please wait a few minutes and try again.",
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: "Too many registration attempts. Please try again later.",
});

// optionalAuth: lets the handler tell "bootstrap first admin" apart from
// "an existing admin is adding another admin" (see authController.js).
router.post("/register", registerLimiter, optionalAuth, register);
router.post("/login", loginLimiter, login);
router.get("/me", verifyToken, me);

export default router;
