import { env } from "./env";

/**
 * Rate limiting for sensitive endpoints (login, register, forgot-password).
 *
 * INTEGRATION POINT: production should use Upstash Redis (or equivalent)
 * so limits are enforced consistently across serverless instances. Set
 * UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN in your environment —
 * see .env.example.
 *
 * When those are unset, we fall back to an in-memory limiter. This is NOT
 * safe for production (each serverless instance has its own memory, so the
 * limit is effectively multiplied by instance count) — it exists purely so
 * `pnpm dev` works out of the box without external services.
 */

type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: number;
};

const memoryStore = new Map<string, { count: number; resetAt: number }>();

async function checkInMemory(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || entry.resetAt < now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

async function checkUpstash(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  // Implemented as a plain REST call rather than pulling in @upstash/ratelimit
  // as a hard dependency, so the module only needs the two env vars to work.
  const url = `${env.UPSTASH_REDIS_REST_URL}/pipeline`;
  const windowSeconds = Math.ceil(windowMs / 1000);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, windowSeconds.toString(), "NX"],
    ]),
  });

  if (!res.ok) {
    // Fail open rather than blocking all traffic if Upstash has an outage —
    // but log loudly so it's visible in monitoring.
    console.error("Rate limit check failed, failing open:", await res.text());
    return { success: true, remaining: limit, resetAt: Date.now() + windowMs };
  }

  const [incrResult] = (await res.json()) as [{ result: number }, unknown];
  const count = incrResult.result;

  return {
    success: count <= limit,
    remaining: Math.max(0, limit - count),
    resetAt: Date.now() + windowMs,
  };
}

/**
 * @param identifier Usually IP address, or `${ip}:${email}` for login-style
 *                    endpoints where you want to limit per-account attempts too.
 * @param limit Max requests allowed within the window.
 * @param windowMs Window duration in milliseconds.
 */
export async function rateLimit(
  identifier: string,
  limit = 5,
  windowMs = 60_000,
): Promise<RateLimitResult> {
  const key = `ratelimit:${identifier}`;
  const useUpstash = Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);
  return useUpstash ? checkUpstash(key, limit, windowMs) : checkInMemory(key, limit, windowMs);
}
