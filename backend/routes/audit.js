import express from "express";
import { listAuditLogs } from "../controllers/auditController.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", verifyToken, isAdmin, listAuditLogs);

export default router;
