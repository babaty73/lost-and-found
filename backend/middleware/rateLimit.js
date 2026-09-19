// A small, dependency-free, in-memory fixed-window rate limiter.
//
// This is intentionally simple: it is appropriate for a single-process
// deployment of the size this project targets (one Student Union office),
// not for a horizontally-scaled production fleet. If this app is ever run
// as multiple instances behind a load balancer, this in-memory store should
// be replaced with a shared one (e.g. Redis) — noted here rather than
// pretending this already handles that case.

const buckets = new Map();

// Periodically forget old buckets so this map doesn't grow forever.
const SWEEP_INTERVAL_MS = 10 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (now - bucket.start > SWEEP_INTERVAL_MS) buckets.delete(key);
  }
}, SWEEP_INTERVAL_MS).unref?.();

export function rateLimit({ windowMs, max, message }) {
  return (req, res, next) => {
    const key = `${req.ip || req.socket?.remoteAddress || "unknown"}:${req.baseUrl}${req.path}`;
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || now - bucket.start > windowMs) {
      buckets.set(key, { start: now, count: 1 });
      return next();
    }

    bucket.count += 1;
    if (bucket.count > max) {
      return res.status(429).json({ message: message || "Too many requests. Please try again later." });
    }
    next();
  };
}
