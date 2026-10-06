import type { Request, Response, NextFunction } from 'express';

const hits = new Map<string, number[]>();

/** Sliding-window limiter per IP and bucket. In-memory; fine for one instance. */
export function rateLimit(bucket: string, max: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${bucket}:${req.ip}`;
    const now = Date.now();
    const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (list.length >= max) {
      res.status(429).json({ error: { code: 'rate_limited', message: 'Easy there — try again in a few minutes.' } });
      return;
    }
    list.push(now);
    hits.set(key, list);
    next();
  };
}

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of hits) if (v.every((t) => now - t > 3_600_000)) hits.delete(k);
}, 600_000).unref();
