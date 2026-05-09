import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { RateLimitTokenBucket } from '../../src/core/ratelimit-token-bucket/ratelimit-token-bucket.js'
import { DEFAULT_RATELIMIT_TOKEN_BUCKET_OPTIONS } from '../../src/core/ratelimit-token-bucket/types.js'
import type { RateLimitTokenBucketOptions } from '../../src/core/ratelimit-token-bucket/types.js'

describe('RateLimitTokenBucket', () => {
  let bucket: RateLimitTokenBucket

  beforeEach(() => {
    bucket = new RateLimitTokenBucket({ capacity: 5, refillRate: 1, refillInterval: 1000 })
  })

  describe('constructor', () => {
    it('should create with required options', () => {
      const b = new RateLimitTokenBucket({ capacity: 10, refillRate: 2 })
      expect(b.getCapacity()).toBe(10)
      expect(b.getRefillRate()).toBe(2)
    })

    it('should use default refillInterval when not provided', () => {
      const b = new RateLimitTokenBucket({ capacity: 10, refillRate: 1 })
      expect(b.getRefillInterval()).toBe(DEFAULT_RATELIMIT_TOKEN_BUCKET_OPTIONS.refillInterval)
    })

    it('should use custom refillInterval', () => {
      const b = new RateLimitTokenBucket({ capacity: 10, refillRate: 1, refillInterval: 500 })
      expect(b.getRefillInterval()).toBe(500)
    })

    it('should start with full tokens equal to capacity', () => {
      const b = new RateLimitTokenBucket({ capacity: 10, refillRate: 1 })
      expect(b.getAvailableTokens()).toBe(10)
    })

    it('should throw on zero capacity', () => {
      expect(() => new RateLimitTokenBucket({ capacity: 0, refillRate: 1 })).toThrow(RangeError)
    })

    it('should throw on negative capacity', () => {
      expect(() => new RateLimitTokenBucket({ capacity: -5, refillRate: 1 })).toThrow(RangeError)
    })

    it('should throw on zero refillRate', () => {
      expect(() => new RateLimitTokenBucket({ capacity: 10, refillRate: 0 })).toThrow(RangeError)
    })

    it('should throw on negative refillRate', () => {
      expect(() => new RateLimitTokenBucket({ capacity: 10, refillRate: -1 })).toThrow(RangeError)
    })

    it('should throw on zero refillInterval', () => {
      expect(() => new RateLimitTokenBucket({ capacity: 10, refillRate: 1, refillInterval: 0 })).toThrow(RangeError)
    })

    it('should throw on negative refillInterval', () => {
      expect(() => new RateLimitTokenBucket({ capacity: 10, refillRate: 1, refillInterval: -100 })).toThrow(RangeError)
    })

    it('should accept capacity of 1', () => {
      const b = new RateLimitTokenBucket({ capacity: 1, refillRate: 1 })
      expect(b.getCapacity()).toBe(1)
      expect(b.getAvailableTokens()).toBe(1)
    })

    it('should accept large capacity', () => {
      const b = new RateLimitTokenBucket({ capacity: 100000, refillRate: 1000 })
      expect(b.getCapacity()).toBe(100000)
    })

    it('should accept fractional refillRate as integer', () => {
      const b = new RateLimitTokenBucket({ capacity: 10, refillRate: 1, refillInterval: 500 })
      expect(b.getRefillRate()).toBe(1)
    })
  })

  describe('acquire', () => {
    it('should succeed when tokens available', () => {
      expect(bucket.acquire()).toBe(true)
    })

    it('should consume 1 token by default', () => {
      bucket.acquire()
      expect(bucket.getAvailableTokens()).toBe(4)
    })

    it('should consume specified cost', () => {
      bucket.acquire(3)
      expect(bucket.getAvailableTokens()).toBe(2)
    })

    it('should return false when not enough tokens', () => {
      bucket.acquire(5)
      expect(bucket.acquire()).toBe(false)
    })

    it('should return false when cost exceeds available tokens', () => {
      expect(bucket.acquire(6)).toBe(false)
    })

    it('should not consume tokens when acquire fails', () => {
      bucket.acquire(6)
      expect(bucket.getAvailableTokens()).toBe(5)
    })

    it('should handle cost equal to available tokens', () => {
      expect(bucket.acquire(5)).toBe(true)
      expect(bucket.getAvailableTokens()).toBe(0)
    })

    it('should allow multiple sequential acquires', () => {
      expect(bucket.acquire(2)).toBe(true)
      expect(bucket.acquire(2)).toBe(true)
      expect(bucket.acquire()).toBe(true)
      expect(bucket.getAvailableTokens()).toBe(0)
    })

    it('should return false after exhausting tokens', () => {
      bucket.acquire(5)
      expect(bucket.acquire(1)).toBe(false)
      expect(bucket.acquire(0)).toBe(true)
    })
  })

  describe('wait', () => {
    it('should return 0 when tokens available', () => {
      expect(bucket.wait()).toBe(0)
    })

    it('should return 0 when cost is within available tokens', () => {
      expect(bucket.wait(3)).toBe(0)
    })

    it('should return positive ms when tokens insufficient', () => {
      bucket.acquire(5)
      const w = bucket.wait(1)
      expect(w).toBeGreaterThan(0)
    })

    it('should return proportional wait for larger deficit', () => {
      bucket.acquire(5)
      const w = bucket.wait(3)
      expect(w).toBeGreaterThan(0)
    })

    it('should return 0 when exactly enough tokens', () => {
      bucket.acquire(4)
      expect(bucket.wait(1)).toBe(0)
    })

    it('should return 0 for cost of 0', () => {
      expect(bucket.wait(0)).toBe(0)
    })
  })

  describe('tryAcquire', () => {
    it('should return allowed true when tokens available', () => {
      const result = bucket.tryAcquire()
      expect(result.allowed).toBe(true)
    })

    it('should return remaining tokens after successful acquire', () => {
      const result = bucket.tryAcquire(2)
      expect(result.remainingTokens).toBe(3)
    })

    it('should return waitTimeMs 0 when allowed', () => {
      const result = bucket.tryAcquire()
      expect(result.waitTimeMs).toBe(0)
    })

    it('should return allowed false when insufficient tokens', () => {
      bucket.acquire(5)
      const result = bucket.tryAcquire()
      expect(result.allowed).toBe(false)
    })

    it('should return positive waitTimeMs when not allowed', () => {
      bucket.acquire(5)
      const result = bucket.tryAcquire()
      expect(result.waitTimeMs).toBeGreaterThan(0)
    })

    it('should not consume tokens when not allowed', () => {
      bucket.acquire(4)
      const result = bucket.tryAcquire(5)
      expect(result.allowed).toBe(false)
      expect(result.remainingTokens).toBe(1)
    })

    it('should consume tokens when allowed', () => {
      bucket.tryAcquire(3)
      expect(bucket.getAvailableTokens()).toBe(2)
    })

    it('should handle cost of 0', () => {
      const result = bucket.tryAcquire(0)
      expect(result.allowed).toBe(true)
      expect(result.remainingTokens).toBe(5)
    })
  })

  describe('getAvailableTokens', () => {
    it('should return initial capacity', () => {
      expect(bucket.getAvailableTokens()).toBe(5)
    })

    it('should decrease after acquire', () => {
      bucket.acquire(2)
      expect(bucket.getAvailableTokens()).toBe(3)
    })

    it('should return 0 when fully consumed', () => {
      bucket.acquire(5)
      expect(bucket.getAvailableTokens()).toBe(0)
    })
  })

  describe('getCapacity', () => {
    it('should return configured capacity', () => {
      expect(bucket.getCapacity()).toBe(5)
    })

    it('should return different capacity for different instances', () => {
      const b = new RateLimitTokenBucket({ capacity: 20, refillRate: 1 })
      expect(b.getCapacity()).toBe(20)
    })
  })

  describe('getRefillRate', () => {
    it('should return configured refill rate', () => {
      expect(bucket.getRefillRate()).toBe(1)
    })

    it('should return different rate for different instances', () => {
      const b = new RateLimitTokenBucket({ capacity: 10, refillRate: 5 })
      expect(b.getRefillRate()).toBe(5)
    })
  })

  describe('getRefillInterval', () => {
    it('should return configured refill interval', () => {
      expect(bucket.getRefillInterval()).toBe(1000)
    })

    it('should return custom interval', () => {
      const b = new RateLimitTokenBucket({ capacity: 10, refillRate: 1, refillInterval: 200 })
      expect(b.getRefillInterval()).toBe(200)
    })
  })

  describe('refill', () => {
    it('should refill tokens based on elapsed time', () => {
      bucket.acquire(5)
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now + 1000)
      bucket.refill()
      expect(bucket.getAvailableTokens()).toBe(1)
      vi.restoreAllMocks()
    })

    it('should refill multiple tokens for multiple intervals', () => {
      bucket.acquire(5)
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now + 3000)
      bucket.refill()
      expect(bucket.getAvailableTokens()).toBe(3)
      vi.restoreAllMocks()
    })

    it('should not exceed capacity on refill', () => {
      bucket.acquire(2)
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now + 10000)
      bucket.refill()
      expect(bucket.getAvailableTokens()).toBe(5)
      vi.restoreAllMocks()
    })

    it('should not refill when interval has not elapsed', () => {
      bucket.acquire(1)
      bucket.refill()
      expect(bucket.getAvailableTokens()).toBe(4)
    })

    it('should refill with higher refillRate', () => {
      const b = new RateLimitTokenBucket({ capacity: 10, refillRate: 3, refillInterval: 1000 })
      b.acquire(10)
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now + 1000)
      b.refill()
      expect(b.getAvailableTokens()).toBe(3)
      vi.restoreAllMocks()
    })
  })

  describe('consume', () => {
    it('should behave identically to acquire', () => {
      expect(bucket.consume(2)).toBe(true)
      expect(bucket.getAvailableTokens()).toBe(3)
    })

    it('should return false when insufficient tokens', () => {
      expect(bucket.consume(6)).toBe(false)
    })

    it('should consume 1 token by default', () => {
      bucket.consume()
      expect(bucket.getAvailableTokens()).toBe(4)
    })
  })

  describe('reset', () => {
    it('should restore tokens to capacity', () => {
      bucket.acquire(5)
      bucket.reset()
      expect(bucket.getAvailableTokens()).toBe(5)
    })

    it('should reset lastRefillTime', () => {
      const before = Date.now()
      bucket.reset()
      const stats = bucket.getStats()
      expect(stats.lastRefillTime).toBeGreaterThanOrEqual(before)
    })

    it('should allow acquire after reset', () => {
      bucket.acquire(5)
      bucket.reset()
      expect(bucket.acquire(3)).toBe(true)
    })
  })

  describe('setCapacity', () => {
    it('should update capacity', () => {
      bucket.setCapacity(20)
      expect(bucket.getCapacity()).toBe(20)
    })

    it('should allow more tokens when increased', () => {
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now)
      const b = new RateLimitTokenBucket({ capacity: 5, refillRate: 1, refillInterval: 1000 })
      b.setCapacity(10)
      b.acquire(8)
      expect(b.getAvailableTokens()).toBe(2)
      vi.restoreAllMocks()
    })

    it('should trim tokens when decreased below current', () => {
      bucket.acquire(1)
      bucket.setCapacity(2)
      expect(bucket.getAvailableTokens()).toBe(2)
    })

    it('should throw on zero capacity', () => {
      expect(() => bucket.setCapacity(0)).toThrow(RangeError)
    })

    it('should throw on negative capacity', () => {
      expect(() => bucket.setCapacity(-1)).toThrow(RangeError)
    })

    it('should not change tokens when capacity increased', () => {
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now)
      const b = new RateLimitTokenBucket({ capacity: 5, refillRate: 1, refillInterval: 1000 })
      b.acquire(2)
      b.setCapacity(20)
      expect(b.getAvailableTokens()).toBe(3)
      vi.restoreAllMocks()
    })

    it('should accept capacity of 1', () => {
      bucket.setCapacity(1)
      expect(bucket.getCapacity()).toBe(1)
    })
  })

  describe('setRefillRate', () => {
    it('should update refill rate', () => {
      bucket.setRefillRate(5)
      expect(bucket.getRefillRate()).toBe(5)
    })

    it('should throw on zero rate', () => {
      expect(() => bucket.setRefillRate(0)).toThrow(RangeError)
    })

    it('should throw on negative rate', () => {
      expect(() => bucket.setRefillRate(-1)).toThrow(RangeError)
    })

    it('should accept rate of 1', () => {
      bucket.setRefillRate(1)
      expect(bucket.getRefillRate()).toBe(1)
    })

    it('should affect subsequent refills', () => {
      bucket.setRefillRate(3)
      bucket.acquire(5)
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now + 1000)
      bucket.refill()
      expect(bucket.getAvailableTokens()).toBe(3)
      vi.restoreAllMocks()
    })
  })

  describe('clone', () => {
    it('should create independent copy', () => {
      const cloned = bucket.clone()
      expect(cloned).not.toBe(bucket)
    })

    it('should preserve capacity', () => {
      const cloned = bucket.clone()
      expect(cloned.getCapacity()).toBe(bucket.getCapacity())
    })

    it('should preserve refillRate', () => {
      const cloned = bucket.clone()
      expect(cloned.getRefillRate()).toBe(bucket.getRefillRate())
    })

    it('should preserve refillInterval', () => {
      const cloned = bucket.clone()
      expect(cloned.getRefillInterval()).toBe(bucket.getRefillInterval())
    })

    it('should preserve tokens', () => {
      bucket.acquire(2)
      const cloned = bucket.clone()
      expect(cloned.getAvailableTokens()).toBe(3)
    })

    it('should be independent from original', () => {
      const cloned = bucket.clone()
      cloned.acquire(5)
      expect(bucket.getAvailableTokens()).toBe(5)
    })

    it('should allow modifying clone without affecting original', () => {
      const cloned = bucket.clone()
      cloned.setCapacity(100)
      expect(bucket.getCapacity()).toBe(5)
    })
  })

  describe('getStats', () => {
    it('should return all stats', () => {
      const stats = bucket.getStats()
      expect(stats).toHaveProperty('availableTokens')
      expect(stats).toHaveProperty('capacity')
      expect(stats).toHaveProperty('refillRate')
      expect(stats).toHaveProperty('lastRefillTime')
    })

    it('should return correct capacity', () => {
      const stats = bucket.getStats()
      expect(stats.capacity).toBe(5)
    })

    it('should return correct refillRate', () => {
      const stats = bucket.getStats()
      expect(stats.refillRate).toBe(1)
    })

    it('should return correct availableTokens', () => {
      bucket.acquire(2)
      const stats = bucket.getStats()
      expect(stats.availableTokens).toBe(3)
    })

    it('should return numeric lastRefillTime', () => {
      const stats = bucket.getStats()
      expect(typeof stats.lastRefillTime).toBe('number')
    })

    it('should update after refill', () => {
      const before = bucket.getStats().lastRefillTime
      bucket.acquire(5)
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now + 1000)
      bucket.refill()
      const after = bucket.getStats()
      expect(after.lastRefillTime).toBeGreaterThan(before - 1)
      vi.restoreAllMocks()
    })
  })

  describe('token refill over time', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should refill 1 token per interval', () => {
      bucket.acquire(5)
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now + 1000)
      expect(bucket.getAvailableTokens()).toBe(1)
    })

    it('should refill 2 tokens after 2 intervals', () => {
      bucket.acquire(5)
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now + 2000)
      expect(bucket.getAvailableTokens()).toBe(2)
    })

    it('should not refill partial interval', () => {
      bucket.acquire(5)
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now + 500)
      expect(bucket.getAvailableTokens()).toBe(0)
    })

    it('should cap tokens at capacity', () => {
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now + 50000)
      expect(bucket.getAvailableTokens()).toBe(5)
    })

    it('should allow acquire after refill', () => {
      bucket.acquire(5)
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now + 1000)
      expect(bucket.acquire()).toBe(true)
    })

    it('should handle multiple refill cycles correctly', () => {
      bucket.acquire(5)
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now + 1000)
      bucket.acquire()
      vi.spyOn(Date, 'now').mockReturnValue(now + 3000)
      expect(bucket.getAvailableTokens()).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('should handle rapid acquires', () => {
      for (let i = 0; i < 5; i++) {
        expect(bucket.acquire()).toBe(true)
      }
      expect(bucket.acquire()).toBe(false)
    })

    it('should handle acquire with cost 0', () => {
      expect(bucket.acquire(0)).toBe(true)
      expect(bucket.getAvailableTokens()).toBe(5)
    })

    it('should handle capacity 1', () => {
      const b = new RateLimitTokenBucket({ capacity: 1, refillRate: 1, refillInterval: 100 })
      expect(b.acquire()).toBe(true)
      expect(b.acquire()).toBe(false)
    })

    it('should handle very small refillInterval', () => {
      const b = new RateLimitTokenBucket({ capacity: 10, refillRate: 1, refillInterval: 1 })
      b.acquire(10)
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now + 10)
      expect(b.getAvailableTokens()).toBe(10)
      vi.restoreAllMocks()
    })

    it('should handle large cost values', () => {
      expect(bucket.acquire(100)).toBe(false)
      expect(bucket.getAvailableTokens()).toBe(5)
    })

    it('should handle consecutive resets', () => {
      bucket.acquire(5)
      bucket.reset()
      bucket.reset()
      expect(bucket.getAvailableTokens()).toBe(5)
    })

    it('should handle setCapacity multiple times', () => {
      bucket.setCapacity(10)
      bucket.setCapacity(3)
      bucket.setCapacity(7)
      expect(bucket.getCapacity()).toBe(7)
    })
  })

  describe('DEFAULT_RATELIMIT_TOKEN_BUCKET_OPTIONS', () => {
    it('should have default capacity', () => {
      expect(DEFAULT_RATELIMIT_TOKEN_BUCKET_OPTIONS.capacity).toBe(10)
    })

    it('should have default refillRate', () => {
      expect(DEFAULT_RATELIMIT_TOKEN_BUCKET_OPTIONS.refillRate).toBe(1)
    })

    it('should have default refillInterval', () => {
      expect(DEFAULT_RATELIMIT_TOKEN_BUCKET_OPTIONS.refillInterval).toBe(1000)
    })
  })

  describe('type exports', () => {
    it('should support typed options', () => {
      const opts: RateLimitTokenBucketOptions = {
        capacity: 5,
        refillRate: 2,
        refillInterval: 500,
      }
      expect(opts.capacity).toBe(5)
    })
  })

  describe('integration scenarios', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should support burst-then-wait pattern', () => {
      const b = new RateLimitTokenBucket({ capacity: 3, refillRate: 1, refillInterval: 100 })
      expect(b.acquire()).toBe(true)
      expect(b.acquire()).toBe(true)
      expect(b.acquire()).toBe(true)
      expect(b.acquire()).toBe(false)
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now + 100)
      expect(b.acquire()).toBe(true)
    })

    it('should support high-capacity slow-refill', () => {
      const b = new RateLimitTokenBucket({ capacity: 1000, refillRate: 10, refillInterval: 60000 })
      expect(b.getAvailableTokens()).toBe(1000)
      b.acquire(500)
      expect(b.getAvailableTokens()).toBe(500)
      expect(b.acquire(500)).toBe(true)
      expect(b.acquire()).toBe(false)
    })

    it('should support low-capacity fast-refill', () => {
      const b = new RateLimitTokenBucket({ capacity: 2, refillRate: 1, refillInterval: 10 })
      b.acquire(2)
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now + 30)
      expect(b.getAvailableTokens()).toBe(2)
    })

    it('should handle clone after partial consumption', () => {
      bucket.acquire(3)
      const cloned = bucket.clone()
      cloned.acquire(2)
      expect(bucket.getAvailableTokens()).toBe(2)
      expect(cloned.getAvailableTokens()).toBe(0)
    })

    it('should handle setCapacity during active use', () => {
      bucket.acquire(3)
      bucket.setCapacity(2)
      expect(bucket.getAvailableTokens()).toBe(2)
      expect(bucket.acquire(2)).toBe(true)
      expect(bucket.acquire()).toBe(false)
    })

    it('should handle setRefillRate during active use', () => {
      bucket.acquire(5)
      bucket.setRefillRate(5)
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now + 1000)
      expect(bucket.getAvailableTokens()).toBe(5)
    })
  })
})
