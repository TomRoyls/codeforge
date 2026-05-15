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

  it('should handle maxRequests of 1', () => {
    const limiter = new RateLimiter2({ maxRequests: 1, windowMs: 1000 });

    expect(limiter.tryAcquire()).toBe(true);
    expect(limiter.getAvailableTokens()).toBe(0);
    expect(limiter.tryAcquire()).toBe(false);
  });

  it('should allow requests after reset when previously exhausted', () => {
    const limiter = new RateLimiter2({ maxRequests: 2, windowMs: 1000 });

    expect(limiter.tryAcquire()).toBe(true);
    expect(limiter.tryAcquire()).toBe(true);
    expect(limiter.tryAcquire()).toBe(false);

    limiter.reset();

    expect(limiter.tryAcquire()).toBe(true);
    expect(limiter.tryAcquire()).toBe(true);
    expect(limiter.tryAcquire()).toBe(false);
  });

  it('should handle large maxRequests', () => {
    const limiter = new RateLimiter2({ maxRequests: 1000, windowMs: 1000 });

    expect(limiter.getAvailableTokens()).toBe(1000);

    for (let i = 0; i < 500; i++) {
      expect(limiter.tryAcquire()).toBe(true);
    }

    expect(limiter.getAvailableTokens()).toBe(500);
  });

  it('should return false consistently when exhausted', () => {
    const limiter = new RateLimiter2({ maxRequests: 3, windowMs: 1000 });

    limiter.tryAcquire();
    limiter.tryAcquire();
    limiter.tryAcquire();

    expect(limiter.tryAcquire()).toBe(false);
    expect(limiter.tryAcquire()).toBe(false);
    expect(limiter.tryAcquire()).toBe(false);
  });

  it('should handle multiple reset cycles', () => {
    const limiter = new RateLimiter2({ maxRequests: 2, windowMs: 1000 });

    for (let cycle = 0; cycle < 5; cycle++) {
      expect(limiter.tryAcquire()).toBe(true);
      expect(limiter.tryAcquire()).toBe(true);
      expect(limiter.tryAcquire()).toBe(false);
      limiter.reset();
    }
  });

  it('should track tokens after partial use and reset', () => {
    const limiter = new RateLimiter2({ maxRequests: 10, windowMs: 1000 });

    limiter.tryAcquire();
    limiter.tryAcquire();
    limiter.tryAcquire();
    expect(limiter.getAvailableTokens()).toBe(7);

    limiter.reset();
    expect(limiter.getAvailableTokens()).toBe(10);

    limiter.tryAcquire();
    expect(limiter.getAvailableTokens()).toBe(9);
  });

  it('should allow requests after window expires', async () => {
    const limiter = new RateLimiter2({ maxRequests: 1, windowMs: 100 });

    expect(limiter.tryAcquire()).toBe(true);
    expect(limiter.tryAcquire()).toBe(false);

    await new Promise((r) => setTimeout(r, 150));

    expect(limiter.tryAcquire()).toBe(true);
  });

  it('should clean up old timestamps on getAvailableTokens', async () => {
    const limiter = new RateLimiter2({ maxRequests: 2, windowMs: 100 });

    limiter.tryAcquire();
    limiter.tryAcquire();
    expect(limiter.getAvailableTokens()).toBe(0);

    await new Promise((r) => setTimeout(r, 150));

    expect(limiter.getAvailableTokens()).toBe(2);
  });

  it('should handle window expiry with partial overlap', async () => {
    const limiter = new RateLimiter2({ maxRequests: 2, windowMs: 150 });

    limiter.tryAcquire();
    expect(limiter.getAvailableTokens()).toBe(1);

    await new Promise((r) => setTimeout(r, 80));
    limiter.tryAcquire();
    expect(limiter.getAvailableTokens()).toBe(0);

    await new Promise((r) => setTimeout(r, 100));
    expect(limiter.getAvailableTokens()).toBe(1);
  });

  it('acquire should wait and then succeed', async () => {
    const limiter = new RateLimiter2({ maxRequests: 1, windowMs: 100 });

    limiter.tryAcquire();

    const start = Date.now();
    await limiter.acquire();
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(80);
  });

  it('should handle zero available tokens reporting', () => {
    const limiter = new RateLimiter2({ maxRequests: 1, windowMs: 1000 });

    limiter.tryAcquire();
    expect(limiter.getAvailableTokens()).toBe(0);
    expect(limiter.tryAcquire()).toBe(false);
    expect(limiter.getAvailableTokens()).toBe(0);
  });

  it('acquire with no prior usage succeeds immediately', async () => {
    const limiter = new RateLimiter2({ maxRequests: 5, windowMs: 1000 });
    const start = Date.now();
    await limiter.acquire();
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(50);
    expect(limiter.getAvailableTokens()).toBe(4);
  });

  it('tryAcquire returns true until limit reached', () => {
    const limiter = new RateLimiter2({ maxRequests: 4, windowMs: 1000 });
    expect(limiter.tryAcquire()).toBe(true);
    expect(limiter.tryAcquire()).toBe(true);
    expect(limiter.tryAcquire()).toBe(true);
    expect(limiter.tryAcquire()).toBe(true);
    expect(limiter.tryAcquire()).toBe(false);
    expect(limiter.getAvailableTokens()).toBe(0);
  });

  it('reset mid-cycle allows new burst', () => {
    const limiter = new RateLimiter2({ maxRequests: 2, windowMs: 10000 });
    limiter.tryAcquire();
    limiter.tryAcquire();
    expect(limiter.tryAcquire()).toBe(false);

    limiter.reset();
    expect(limiter.tryAcquire()).toBe(true);
    expect(limiter.tryAcquire()).toBe(true);
    expect(limiter.tryAcquire()).toBe(false);
  });

  it('handles single request maxRequests', async () => {
    const limiter = new RateLimiter2({ maxRequests: 1, windowMs: 100 });
    expect(limiter.tryAcquire()).toBe(true);
    expect(limiter.getAvailableTokens()).toBe(0);
    limiter.reset();
    expect(limiter.tryAcquire()).toBe(true);
  });

  it('tracks available tokens after multiple windows', async () => {
    const limiter = new RateLimiter2({ maxRequests: 3, windowMs: 100 });
    limiter.tryAcquire();
    limiter.tryAcquire();
    limiter.tryAcquire();
    expect(limiter.getAvailableTokens()).toBe(0);

    await new Promise(r => setTimeout(r, 150));
    expect(limiter.getAvailableTokens()).toBe(3);
    expect(limiter.tryAcquire()).toBe(true);
    expect(limiter.getAvailableTokens()).toBe(2);
  });
});
