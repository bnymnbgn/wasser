import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const hasRedis =
  Boolean(process.env["UPSTASH_REDIS_REST_URL"]) &&
  Boolean(process.env["UPSTASH_REDIS_REST_TOKEN"]);

let limiter: Ratelimit | null = null;

function getLimiter(): Ratelimit | null {
  if (!hasRedis) {
    return null;
  }

  if (!limiter) {
    limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      analytics: true,
    });
  }

  return limiter;
}

export async function checkRateLimit(
  identifier: string
): Promise<{ success: true; headers?: HeadersInit } | { success: false; headers: HeadersInit }> {
  const instance = getLimiter();
  if (!instance) {
    return { success: true };
  }

  const result = await instance.limit(identifier);

  const headers: HeadersInit = {
    "RateLimit-Limit": result.limit.toString(),
    "RateLimit-Remaining": Math.max(0, result.remaining).toString(),
    "RateLimit-Reset": result.reset.toString(),
  };

  if (!result.success) {
    return { success: false, headers };
  }

  return { success: true, headers };
}
