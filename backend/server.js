import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import itemRoutes from "./routes/items.js";
import claimRoutes from "./routes/claims.js";
import auditRoutes from "./routes/audit.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

// Fail fast and loudly if required configuration is missing, instead of
// discovering it later at the first request that happens to need it.
const REQUIRED_ENV_VARS = ["MONGO_URI", "JWT_SECRET"];
const missingEnv = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missingEnv.length) {
  console.error(`Missing required environment variable(s): ${missingEnv.join(", ")}`);
  console.error("Copy .env.example to .env and fill these in before starting the server.");
  process.exit(1);
}

const app = express();

// CORS: restrict to the configured frontend origin(s) in production. In
// development, with no FRONTEND_URL set, fall back to allowing any origin
// so local `vite dev` on a random port isn't blocked.
const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  })
);

app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ extended: true, limit: "12mb" }));

// Minimal request logging, in-house rather than pulling in a new dependency.
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

app.get("/", (req, res) => {
  res.send("ASTU Lost & Found API running");
});

app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState; // 1 === connected
  res.status(dbState === 1 ? 200 : 503).json({
    status: dbState === 1 ? "ok" : "degraded",
    database: dbState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/audit", auditRoutes);

app.use(notFound);
app.use(errorHandler);

// Only connect to MongoDB and bind a port when this file is run directly
// (`node server.js` / `npm start`). When it's imported instead — as the test
// suite does, via supertest — the caller is responsible for its own database
// connection (see tests/setup.js), and no port needs to be bound at all.
const isMainModule = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
