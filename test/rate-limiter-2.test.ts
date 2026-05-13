import { describe, it, expect } from 'vitest';
import { RateLimiter2 } from '../src/core/rate-limiter-2/index.js';

describe('RateLimiter2', () => {
  it('should handle empty and single request', async () => {
    const limiter = new RateLimiter2({ maxRequests: 5, windowMs: 1000 });

    expect(limiter.tryAcquire()).toBe(true);
    expect(limiter.getAvailableTokens()).toBe(4);
  });

  it('should acquire tokens successfully', async () => {
    const limiter = new RateLimiter2({ maxRequests: 3, windowMs: 1000 });

    expect(await limiter.acquire()).toBeUndefined();
    expect(await limiter.acquire()).toBeUndefined();
    expect(await limiter.acquire()).toBeUndefined();
  });

  it('should enforce rate limit', async () => {
    const limiter = new RateLimiter2({ maxRequests: 2, windowMs: 1000 });

    expect(limiter.tryAcquire()).toBe(true);
    expect(limiter.tryAcquire()).toBe(true);
    expect(limiter.tryAcquire()).toBe(false);
  });

  it('should track available tokens correctly', async () => {
    const limiter = new RateLimiter2({ maxRequests: 5, windowMs: 1000 });

    expect(limiter.getAvailableTokens()).toBe(5);

    limiter.tryAcquire();
    expect(limiter.getAvailableTokens()).toBe(4);

    limiter.tryAcquire();
    limiter.tryAcquire();
    expect(limiter.getAvailableTokens()).toBe(2);
  });

  it('should reset token count', async () => {
    const limiter = new RateLimiter2({ maxRequests: 5, windowMs: 1000 });

    limiter.tryAcquire();
    limiter.tryAcquire();
    limiter.tryAcquire();

    expect(limiter.getAvailableTokens()).toBe(2);

    limiter.reset();

    expect(limiter.getAvailableTokens()).toBe(5);
    expect(limiter.tryAcquire()).toBe(true);
  });
});
