import { LRUCache } from "lru-cache";

export interface RateLimitOptions {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max number of unique IPs to track
  maxRequests: number; // Max requests per interval
}

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval,
    ttl: options.interval,
  });

  return {
    check: (token: string): { success: boolean; remaining: number; reset: number } => {
      const tokenCount = (tokenCache.get(token) as number) || 0;

      if (tokenCount >= options.maxRequests) {
        return {
          success: false,
          remaining: 0,
          reset: Date.now() + options.interval,
        };
      }

      tokenCache.set(token, tokenCount + 1);

      return {
        success: true,
        remaining: options.maxRequests - (tokenCount + 1),
        reset: Date.now() + options.interval,
      };
    },
  };
}
