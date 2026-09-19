import AuditLog from "../models/AuditLog.js";

// GET /api/audit — admin only. A practical, browsable log, not an analytics platform.
export const listAuditLogs = async (req, res, next) => {
  try {
    const { itemId, page = 1, limit = 30 } = req.query;
    const query = {};
    if (itemId) query.item = itemId;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 30, 1), 100);

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate("actor", "name email")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      AuditLog.countDocuments(query),
    ]);

    res.json({ logs, page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) || 1 });
  } catch (err) {
    next(err);
  }
};
