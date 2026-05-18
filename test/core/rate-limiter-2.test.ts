import { afterEach, describe, expect, it, vi } from 'vitest'
import { RateLimiter2 } from '../../src/core/rate-limiter-2/index.js'

// ─── Constructor ───

describe('RateLimiter2', () => {
  describe('constructor', () => {
    it('creates a rate limiter with specified options', () => {
      const rl = new RateLimiter2({ maxRequests: 5, windowMs: 1000 })
      expect(rl.getAvailableTokens()).toBe(5)
    })

    it('creates with single request limit', () => {
      const rl = new RateLimiter2({ maxRequests: 1, windowMs: 100 })
      expect(rl.getAvailableTokens()).toBe(1)
    })
  })

  // ─── tryAcquire ───

  describe('tryAcquire', () => {
    it('returns true when under the limit', () => {
      const rl = new RateLimiter2({ maxRequests: 3, windowMs: 1000 })
      expect(rl.tryAcquire()).toBe(true)
    })

    it('returns false when limit is reached', () => {
      const rl = new RateLimiter2({ maxRequests: 2, windowMs: 10000 })
      rl.tryAcquire()
      rl.tryAcquire()
      expect(rl.tryAcquire()).toBe(false)
    })

    it('tracks multiple acquisitions', () => {
      const rl = new RateLimiter2({ maxRequests: 5, windowMs: 1000 })
      for (let i = 0; i < 5; i++) {
        expect(rl.tryAcquire()).toBe(true)
      }
      expect(rl.tryAcquire()).toBe(false)
    })

    it('allows requests again after window expires', () => {
      vi.useFakeTimers()
      const rl = new RateLimiter2({ maxRequests: 1, windowMs: 100 })
      expect(rl.tryAcquire()).toBe(true)
      expect(rl.tryAcquire()).toBe(false)
      vi.advanceTimersByTime(150)
      expect(rl.tryAcquire()).toBe(true)
      vi.useRealTimers()
    })

    it('handles single-request limit correctly', () => {
      vi.useFakeTimers()
      const rl = new RateLimiter2({ maxRequests: 1, windowMs: 50 })
      expect(rl.tryAcquire()).toBe(true)
      expect(rl.tryAcquire()).toBe(false)
      vi.advanceTimersByTime(60)
      expect(rl.tryAcquire()).toBe(true)
      vi.useRealTimers()
    })
  })

  // ─── getAvailableTokens ───

  describe('getAvailableTokens', () => {
    it('returns maxRequests initially', () => {
      const rl = new RateLimiter2({ maxRequests: 10, windowMs: 1000 })
      expect(rl.getAvailableTokens()).toBe(10)
    })

    it('decreases after acquisitions', () => {
      const rl = new RateLimiter2({ maxRequests: 5, windowMs: 10000 })
      rl.tryAcquire()
      rl.tryAcquire()
      expect(rl.getAvailableTokens()).toBe(3)
    })

    it('returns 0 when all tokens are used', () => {
      const rl = new RateLimiter2({ maxRequests: 3, windowMs: 10000 })
      rl.tryAcquire()
      rl.tryAcquire()
      rl.tryAcquire()
      expect(rl.getAvailableTokens()).toBe(0)
    })

    it('recovers tokens after window expires', () => {
      vi.useFakeTimers()
      const rl = new RateLimiter2({ maxRequests: 2, windowMs: 100 })
      rl.tryAcquire()
      rl.tryAcquire()
      vi.advanceTimersByTime(150)
      expect(rl.getAvailableTokens()).toBe(2)
      vi.useRealTimers()
    })
  })

  // ─── reset ───

  describe('reset', () => {
    it('restores all tokens', () => {
      const rl = new RateLimiter2({ maxRequests: 3, windowMs: 10000 })
      rl.tryAcquire()
      rl.tryAcquire()
      rl.reset()
      expect(rl.getAvailableTokens()).toBe(3)
    })

    it('allows acquisitions after reset', () => {
      const rl = new RateLimiter2({ maxRequests: 1, windowMs: 10000 })
      rl.tryAcquire()
      rl.reset()
      expect(rl.tryAcquire()).toBe(true)
    })
  })

  // ─── acquire ───

  describe('acquire', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it('resolves immediately when under limit', async () => {
      const rl = new RateLimiter2({ maxRequests: 5, windowMs: 1000 })
      await expect(rl.acquire()).resolves.toBeUndefined()
    })

    it('waits until a token is available', async () => {
      vi.useFakeTimers()
      const rl = new RateLimiter2({ maxRequests: 1, windowMs: 100 })
      await rl.acquire()
      const promise = rl.acquire()
      vi.advanceTimersByTime(150)
      await expect(promise).resolves.toBeUndefined()
    })

    it('handles multiple sequential acquires', async () => {
      const rl = new RateLimiter2({ maxRequests: 3, windowMs: 1000 })
      await rl.acquire()
      await rl.acquire()
      await rl.acquire()
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it('handles zero window correctly', () => {
      const rl = new RateLimiter2({ maxRequests: 1, windowMs: 0 })
      expect(rl.tryAcquire()).toBe(true)
    })

    it('handles rapid tryAcquire calls', () => {
      const rl = new RateLimiter2({ maxRequests: 100, windowMs: 1000 })
      let acquired = 0
      for (let i = 0; i < 200; i++) {
        if (rl.tryAcquire()) acquired++
      }
      expect(acquired).toBe(100)
    })

    it('partial window expiry recovers some tokens', () => {
      vi.useFakeTimers()
      const rl = new RateLimiter2({ maxRequests: 3, windowMs: 100 })
      rl.tryAcquire()
      vi.advanceTimersByTime(30)
      rl.tryAcquire()
      rl.tryAcquire()
      expect(rl.tryAcquire()).toBe(false)
      vi.advanceTimersByTime(80)
      expect(rl.getAvailableTokens()).toBe(1)
      vi.useRealTimers()
    })
  })
})
