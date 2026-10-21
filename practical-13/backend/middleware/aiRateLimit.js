// Max 1 AI request per task (same user + same title) per minute, to avoid burning
// API quota when a whole lab batch keeps clicking "Suggest". In-memory, like node-cache.
const WINDOW_MS = Number(process.env.AI_RATE_LIMIT_MS) || 60_000;
const lastRequest = new Map();

module.exports = (req, res, next) => {
  const title = typeof req.body.title === 'string' ? req.body.title.trim().toLowerCase() : '';
  const key = `${req.user.id}:${title}`;
  const now = Date.now();
  const previous = lastRequest.get(key);

  if (previous && now - previous < WINDOW_MS) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - previous)) / 1000);
    res.set('Retry-After', String(retryAfter));
    return res.status(429).json({ error: `Please wait ${retryAfter}s before asking again for this task`, retryAfter });
  }

  lastRequest.set(key, now);
  // Forget old entries so the map doesn't grow forever
  for (const [k, t] of lastRequest) if (now - t >= WINDOW_MS) lastRequest.delete(k);
  next();
};
