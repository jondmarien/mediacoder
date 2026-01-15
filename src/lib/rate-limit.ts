interface RateLimitContext {
  tokens: number;
  lastRefill: number;
}

const rateLimits = new Map<string, RateLimitContext>();

export interface RateLimitOptions {
  interval: number; // Window size in ms
  uniqueTokenPerInterval: number; // Max requests per window
}

export function rateLimit(options: RateLimitOptions) {
  return {
    check: (limit: number, token: string) => {
      const now = Date.now();
      const existing = rateLimits.get(token);

      if (!existing) {
        rateLimits.set(token, {
          tokens: limit - 1,
          lastRefill: now,
        });
        return Promise.resolve();
      }

      // Refill tokens if interval passed
      if (now - existing.lastRefill >= options.interval) {
        existing.tokens = limit - 1;
        existing.lastRefill = now;
        rateLimits.set(token, existing);
        return Promise.resolve();
      }

      if (existing.tokens > 0) {
        existing.tokens -= 1;
        rateLimits.set(token, existing);
        return Promise.resolve();
      }

      return Promise.reject(new Error("Rate limit exceeded"));
    },
  };
}
