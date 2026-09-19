import jwt from "jsonwebtoken";
import User from "../models/User.js";

function extractToken(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7).trim();
  return null;
}

/**
 * Requires a valid JWT. Re-fetches the user from the database on every
 * request rather than trusting the token's embedded role claim at face
 * value — this way a role change or a deleted account takes effect
 * immediately instead of only when the token expires.
 */
export const verifyToken = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Invalid session." });
    }

    req.user = user;
    next();
  } catch (_err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

/**
 * Like verifyToken, but never rejects the request if no/invalid token is
 * present — it just leaves req.user unset. Used only for the one endpoint
 * (admin registration) whose behavior legitimately differs based on whether
 * the caller happens to already be a logged-in admin.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) return next();

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("-password");
    if (user) req.user = user;
  } catch (_err) {
    // Treat an invalid/expired token on this optional path as "anonymous"
    // rather than an error — the required-auth routes are what enforce access.
  }
  next();
};

/**
 * Must run after verifyToken. Never trusts a role supplied by the client —
 * only the role attached to req.user by verifyToken's database lookup.
 */
export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }
  next();
};
