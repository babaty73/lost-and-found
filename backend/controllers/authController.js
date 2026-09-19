import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { isValidEmail, missingFields } from "../utils/validation.js";

function signToken(user) {
  // Keep the JWT payload minimal — id + role only. No student information,
  // no email, nothing sensitive travels inside the token itself.
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

/**
 * Admin registration is intentionally restrictive: this system has exactly
 * one application role (admin), run by the ASTU Student Union office.
 *   - If no admin account exists yet, this endpoint may be called with no
 *     token, to bootstrap the very first admin (a one-time setup step).
 *   - Once at least one admin exists, creating another admin requires an
 *     existing, authenticated admin to make the request.
 * This avoids both a chicken-and-egg setup problem and an "anyone can
 * become admin" public endpoint.
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    const missing = missingFields(req.body || {}, ["name", "email", "password"]);
    if (missing.length) {
      return res.status(400).json({ message: `Missing required field(s): ${missing.join(", ")}` });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }
    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    const existingAdminCount = await User.countDocuments();
    if (existingAdminCount > 0 && (!req.user || req.user.role !== "admin")) {
      return res.status(403).json({
        message: "Admin accounts can only be created by an existing logged-in admin.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashed,
      role: "admin",
    });

    // Never return the password hash, even hashed, in an API response.
    return res.status(201).json(publicUser(user));
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    // Same generic message whether the email doesn't exist or the password is
    // wrong — don't help an attacker enumerate valid admin emails.
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken(user);
    return res.json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res) => {
  res.json(publicUser(req.user));
};
