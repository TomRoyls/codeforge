import { describe, it, expect } from 'vitest'
import { TokenBucket } from '../../src/core/token-bucket/token-bucket.js'
import type { TokenBucketOptions, TokenBucketStatistics } from '../../src/core/token-bucket/types.js'

function createBucket(overrides: Partial<{ capacity: number; refillRate: number; refillInterval: number; now: () => number }> = {}): TokenBucket {
  return new TokenBucket(
    overrides.capacity ?? 10,
    overrides.refillRate ?? 1,
    overrides.refillInterval ?? 1000,
    overrides.now,
  )
}

describe('TokenBucket', () => {
  describe('constructor', () => {
    it('should initialize with default values', () => {
      const bucket = new TokenBucket()
      expect(bucket.capacity).toBe(10)
      expect(bucket.refillRate).toBe(1)
      expect(bucket.refillInterval).toBe(1000)
      expect(bucket.tokens).toBe(10)
    })

    it('should initialize with custom capacity', () => {
      const bucket = new TokenBucket(20)
      expect(bucket.capacity).toBe(20)
      expect(bucket.tokens).toBe(20)
    })

    it('should initialize with custom refillRate', () => {
      const bucket = new TokenBucket(10, 5)
      expect(bucket.refillRate).toBe(5)
    })

    it('should initialize with custom refillInterval', () => {
      const bucket = new TokenBucket(10, 1, 500)
      expect(bucket.refillInterval).toBe(500)
    })

    it('should start full at capacity', () => {
      const bucket = new TokenBucket(7, 2)
      expect(bucket.tokens).toBe(7)
    })

    it('should throw for capacity <= 0', () => {
      expect(() => new TokenBucket(0)).toThrow(RangeError)
    })

    it('should throw for negative capacity', () => {
      expect(() => new TokenBucket(-1)).toThrow(RangeError)
    })

    it('should throw for refillRate <= 0', () => {
      expect(() => new TokenBucket(10, 0)).toThrow(RangeError)
    })

    it('should throw for negative refillRate', () => {
      expect(() => new TokenBucket(10, -1)).toThrow(RangeError)
    })

    it('should throw for refillInterval <= 0', () => {
      expect(() => new TokenBucket(10, 1, 0)).toThrow(RangeError)
    })

    it('should throw for negative refillInterval', () => {
      expect(() => new TokenBucket(10, 1, -100)).toThrow(RangeError)
    })

    it('should accept custom time provider', () => {
      let time = 1000
      const bucket = new TokenBucket(5, 1, 1000, () => time)
      expect(bucket.tokens).toBe(5)
      expect(bucket.lastRefill).toBe(1000)
    })
  })

  describe('fromOptions', () => {
    it('should create bucket from options', () => {
      const options: TokenBucketOptions = { capacity: 20, refillRate: 2 }
      const bucket = TokenBucket.fromOptions(options)
      expect(bucket.capacity).toBe(20)
      expect(bucket.refillRate).toBe(2)
    })

    it('should create bucket with refillInterval from options', () => {
      const options: TokenBucketOptions = { capacity: 10, refillRate: 1, refillInterval: 500 }
      const bucket = TokenBucket.fromOptions(options)
      expect(bucket.refillInterval).toBe(500)
    })

    it('should default refillInterval when not in options', () => {
      const options: TokenBucketOptions = { capacity: 10, refillRate: 1 }
      const bucket = TokenBucket.fromOptions(options)
      expect(bucket.refillInterval).toBe(1000)
    })

    it('should accept custom time provider', () => {
      let time = 5000
      const bucket = TokenBucket.fromOptions({ capacity: 5, refillRate: 1 }, () => time)
      expect(bucket.lastRefill).toBe(5000)
    })
  })

  describe('consume', () => {
    it('should consume 1 token by default', () => {
      const bucket = createBucket({ capacity: 10 })
      const result = bucket.consume()
      expect(result).toBe(true)
      expect(bucket.tokens).toBe(9)
    })

    it('should consume specified tokens', () => {
      const bucket = createBucket({ capacity: 10 })
      const result = bucket.consume(3)
      expect(result).toBe(true)
      expect(bucket.tokens).toBe(7)
    })

    it('should return true when enough tokens', () => {
      const bucket = createBucket({ capacity: 5 })
      expect(bucket.consume(5)).toBe(true)
    })

    it('should return false when not enough tokens', () => {
      const bucket = createBucket({ capacity: 3 })
      expect(bucket.consume(5)).toBe(false)
    })

    it('should not deduct tokens when rejected', () => {
      const bucket = createBucket({ capacity: 2 })
      bucket.consume(5)
      expect(bucket.tokens).toBe(2)
    })

    it('should throw for tokens <= 0', () => {
      const bucket = createBucket()
      expect(() => bucket.consume(0)).toThrow(RangeError)
    })

    it('should throw for negative tokens', () => {
      const bucket = createBucket()
      expect(() => bucket.consume(-1)).toThrow(RangeError)
    })

    it('should drain all tokens', () => {
      const bucket = createBucket({ capacity: 5 })
      expect(bucket.consume(5)).toBe(true)
      expect(bucket.tokens).toBe(0)
    })

    it('should reject after draining', () => {
      const bucket = createBucket({ capacity: 3 })
      bucket.consume(3)
      expect(bucket.consume(1)).toBe(false)
    })

    it('should track totalConsumed', () => {
      const bucket = createBucket({ capacity: 10 })
      bucket.consume(3)
      bucket.consume(2)
      expect(bucket.statistics.totalConsumed).toBe(5)
    })

    it('should track totalRejected', () => {
      const bucket = createBucket({ capacity: 2 })
      bucket.consume(2)
      bucket.consume(5)
      expect(bucket.statistics.totalRejected).toBe(5)
    })

    it('should allow consuming all capacity', () => {
      const bucket = createBucket({ capacity: 10 })
      expect(bucket.consume(10)).toBe(true)
      expect(bucket.tokens).toBe(0)
    })

    it('should reject consuming more than capacity', () => {
      const bucket = createBucket({ capacity: 5 })
      expect(bucket.consume(6)).toBe(false)
    })
  })

  describe('tryConsume', () => {
    it('should consume 1 token by default', () => {
      const bucket = createBucket({ capacity: 10 })
      expect(bucket.tryConsume()).toBe(true)
      expect(bucket.tokens).toBe(9)
    })

    it('should consume specified tokens', () => {
      const bucket = createBucket({ capacity: 10 })
      expect(bucket.tryConsume(4)).toBe(true)
      expect(bucket.tokens).toBe(6)
    })

    it('should return true when enough tokens available', () => {
      const bucket = createBucket({ capacity: 10 })
      expect(bucket.tryConsume(10)).toBe(true)
    })

    it('should return false when not enough tokens', () => {
      const bucket = createBucket({ capacity: 5 })
      expect(bucket.tryConsume(6)).toBe(false)
    })

    it('should be non-blocking (not modify state on failure)', () => {
      const bucket = createBucket({ capacity: 2 })
      bucket.tryConsume(2)
      const tokensBefore = bucket.tokens
      bucket.tryConsume(1)
      expect(bucket.tokens).toBe(tokensBefore)
    })

    it('should throw for tokens <= 0', () => {
      const bucket = createBucket()
      expect(() => bucket.tryConsume(0)).toThrow(RangeError)
    })

    it('should track totalConsumed correctly', () => {
      const bucket = createBucket({ capacity: 10 })
      bucket.tryConsume(2)
      bucket.tryConsume(3)
      expect(bucket.statistics.totalConsumed).toBe(5)
    })

    it('should track totalRejected correctly', () => {
      const bucket = createBucket({ capacity: 1 })
      bucket.tryConsume(1)
      bucket.tryConsume(1)
      expect(bucket.statistics.totalRejected).toBe(1)
    })

    it('should handle multiple sequential consumes', () => {
      const bucket = createBucket({ capacity: 5 })
      expect(bucket.tryConsume(1)).toBe(true)
      expect(bucket.tryConsume(1)).toBe(true)
      expect(bucket.tryConsume(1)).toBe(true)
      expect(bucket.tryConsume(1)).toBe(true)
      expect(bucket.tryConsume(1)).toBe(true)
      expect(bucket.tryConsume(1)).toBe(false)
    })
  })

  describe('waitUntilAvailable', () => {
    it('should return 0 when tokens available', () => {
      const bucket = createBucket({ capacity: 10 })
      expect(bucket.waitUntilAvailable()).toBe(0)
    })

    it('should return 0 when enough tokens for request', () => {
      const bucket = createBucket({ capacity: 5 })
      expect(bucket.waitUntilAvailable(5)).toBe(0)
    })

    it('should return ms wait time when no tokens', () => {
      let time = 1000
      const bucket = createBucket({ capacity: 5, refillRate: 1, refillInterval: 1000, now: () => time })
      bucket.consume(5)
      time = 1100
      const wait = bucket.waitUntilAvailable(1)
      expect(wait).toBeGreaterThan(0)
    })

    it('should calculate correct wait for single token', () => {
      let time = 0
      const bucket = createBucket({ capacity: 1, refillRate: 1, refillInterval: 1000, now: () => time })
      bucket.drain()
      time = 100
      const wait = bucket.waitUntilAvailable(1)
      expect(wait).toBe(900)
    })

    it('should calculate wait for multiple tokens', () => {
      let time = 0
      const bucket = createBucket({ capacity: 10, refillRate: 2, refillInterval: 1000, now: () => time })
      bucket.drain()
      time = 100
      const wait = bucket.waitUntilAvailable(5)
      expect(wait).toBeGreaterThan(0)
    })

    it('should throw for tokens <= 0', () => {
      const bucket = createBucket()
      expect(() => bucket.waitUntilAvailable(0)).toThrow(RangeError)
    })

    it('should throw for negative tokens', () => {
      const bucket = createBucket()
      expect(() => bucket.waitUntilAvailable(-1)).toThrow(RangeError)
    })

    it('should track totalWaitTime', () => {
      let time = 0
      const bucket = createBucket({ capacity: 1, refillRate: 1, refillInterval: 1000, now: () => time })
      bucket.drain()
      time = 100
      bucket.waitUntilAvailable(1)
      expect(bucket.statistics.totalWaitTime).toBeGreaterThan(0)
    })

    it('should return 0 for partial availability', () => {
      const bucket = createBucket({ capacity: 10 })
      bucket.consume(3)
      expect(bucket.waitUntilAvailable(5)).toBe(0)
    })

    it('should return wait time when partially available but not enough', () => {
      let time = 0
      const bucket = createBucket({ capacity: 10, refillRate: 1, refillInterval: 1000, now: () => time })
      bucket.consume(8)
      time = 100
      const wait = bucket.waitUntilAvailable(5)
      expect(wait).toBeGreaterThan(0)
    })
  })

  describe('tokens getter', () => {
    it('should return current token count', () => {
      const bucket = createBucket({ capacity: 10 })
      expect(bucket.tokens).toBe(10)
    })

    it('should reflect consumption', () => {
      const bucket = createBucket({ capacity: 10 })
      bucket.consume(3)
      expect(bucket.tokens).toBe(7)
    })

    it('should trigger refill before returning', () => {
      let time = 0
      const bucket = createBucket({ capacity: 10, refillRate: 1, refillInterval: 1000, now: () => time })
      bucket.consume(5)
      time = 2000
      expect(bucket.tokens).toBe(7)
    })

    it('should not exceed capacity after refill', () => {
      let time = 0
      const bucket = createBucket({ capacity: 5, refillRate: 1, refillInterval: 1000, now: () => time })
      bucket.consume(1)
      time = 10000
      expect(bucket.tokens).toBe(5)
    })
  })

  describe('availableTokens', () => {
    it('should return same as tokens', () => {
      const bucket = createBucket({ capacity: 10 })
      expect(bucket.availableTokens).toBe(bucket.tokens)
    })

    it('should reflect changes', () => {
      const bucket = createBucket({ capacity: 10 })
      bucket.consume(3)
      expect(bucket.availableTokens).toBe(7)
    })

    it('should reflect refill', () => {
      let time = 0
      const bucket = createBucket({ capacity: 10, refillRate: 2, refillInterval: 1000, now: () => time })
      bucket.consume(4)
      time = 1000
      expect(bucket.availableTokens).toBe(8)
    })
  })

  describe('capacity getter', () => {
    it('should return configured capacity', () => {
      const bucket = createBucket({ capacity: 25 })
      expect(bucket.capacity).toBe(25)
    })

    it('should not change after consumption', () => {
      const bucket = createBucket({ capacity: 10 })
      bucket.consume(5)
      expect(bucket.capacity).toBe(10)
    })
  })

  describe('refillRate getter', () => {
    it('should return configured refillRate', () => {
      const bucket = createBucket({ refillRate: 3 })
      expect(bucket.refillRate).toBe(3)
    })
  })

  describe('refillInterval getter', () => {
    it('should return configured refillInterval', () => {
      const bucket = createBucket({ refillInterval: 500 })
      expect(bucket.refillInterval).toBe(500)
    })
  })

  describe('lastRefill getter', () => {
    it('should return initial timestamp', () => {
      let time = 5000
      const bucket = createBucket({ now: () => time })
      expect(bucket.lastRefill).toBe(5000)
    })

    it('should update after refill', () => {
      let time = 0
      const bucket = createBucket({ capacity: 10, refillRate: 1, refillInterval: 1000, now: () => time })
      const initial = bucket.lastRefill
      time = 1500
      bucket.tokens
      expect(bucket.lastRefill).toBeGreaterThan(initial)
    })
  })

  describe('reset', () => {
    it('should restore tokens to capacity', () => {
      const bucket = createBucket({ capacity: 10 })
      bucket.consume(7)
      bucket.reset()
      expect(bucket.tokens).toBe(10)
    })

    it('should reset all statistics', () => {
      const bucket = createBucket({ capacity: 5 })
      bucket.consume(3)
      bucket.consume(10)
      bucket.reset()
      const stats = bucket.statistics
      expect(stats.totalConsumed).toBe(0)
      expect(stats.totalRejected).toBe(0)
      expect(stats.totalRefilled).toBe(0)
      expect(stats.totalWaitTime).toBe(0)
    })

    it('should update lastRefillTime', () => {
      let time = 0
      const bucket = createBucket({ now: () => time })
      time = 5000
      bucket.reset()
      expect(bucket.lastRefill).toBe(5000)
    })

    it('should allow consuming after reset', () => {
      const bucket = createBucket({ capacity: 2 })
      bucket.consume(2)
      expect(bucket.consume(1)).toBe(false)
      bucket.reset()
      expect(bucket.consume(1)).toBe(true)
    })
  })

  describe('fill', () => {
    it('should set tokens to capacity', () => {
      const bucket = createBucket({ capacity: 10 })
      bucket.consume(7)
      bucket.fill()
      expect(bucket.tokens).toBe(10)
    })

    it('should work when already full', () => {
      const bucket = createBucket({ capacity: 10 })
      bucket.fill()
      expect(bucket.tokens).toBe(10)
    })

    it('should work when empty', () => {
      const bucket = createBucket({ capacity: 5 })
      bucket.drain()
      bucket.fill()
      expect(bucket.tokens).toBe(5)
    })

    it('should track refilled tokens in statistics', () => {
      const bucket = createBucket({ capacity: 10 })
      bucket.consume(5)
      bucket.fill()
      expect(bucket.statistics.totalRefilled).toBe(5)
    })

    it('should not change statistics when already full', () => {
      const bucket = createBucket({ capacity: 10 })
      bucket.fill()
      expect(bucket.statistics.totalRefilled).toBe(0)
    })
  })

  describe('drain', () => {
    it('should set tokens to 0', () => {
      const bucket = createBucket({ capacity: 10 })
      bucket.drain()
      expect(bucket.tokens).toBe(0)
    })

    it('should work when already empty', () => {
      const bucket = createBucket({ capacity: 10 })
      bucket.drain()
      bucket.drain()
      expect(bucket.tokens).toBe(0)
    })

    it('should reject consume after drain', () => {
      const bucket = createBucket({ capacity: 5 })
      bucket.drain()
      expect(bucket.consume(1)).toBe(false)
    })
  })

  describe('setCapacity', () => {
    it('should update capacity', () => {
      const bucket = createBucket({ capacity: 10 })
      bucket.setCapacity(20)
      expect(bucket.capacity).toBe(20)
    })

    it('should trim tokens if new capacity is lower', () => {
      const bucket = createBucket({ capacity: 10 })
      bucket.setCapacity(5)
      expect(bucket.tokens).toBe(5)
    })

    it('should not trim tokens if new capacity is higher', () => {
      const bucket = createBucket({ capacity: 10 })
      bucket.consume(3)
      bucket.setCapacity(20)
      expect(bucket.tokens).toBe(7)
    })

    it('should throw for n <= 0', () => {
      const bucket = createBucket()
      expect(() => bucket.setCapacity(0)).toThrow(RangeError)
    })

    it('should throw for negative n', () => {
      const bucket = createBucket()
      expect(() => bucket.setCapacity(-5)).toThrow(RangeError)
    })

    it('should affect subsequent refills', () => {
      let time = 0
      const bucket = createBucket({ capacity: 10, refillRate: 1, refillInterval: 1000, now: () => time })
      bucket.drain()
      bucket.setCapacity(3)
      time = 5000
      expect(bucket.tokens).toBe(3)
    })
  })

  describe('setRefillRate', () => {
    it('should update refillRate', () => {
      const bucket = createBucket({ refillRate: 1 })
      bucket.setRefillRate(5)
      expect(bucket.refillRate).toBe(5)
    })

    it('should throw for n <= 0', () => {
      const bucket = createBucket()
      expect(() => bucket.setRefillRate(0)).toThrow(RangeError)
    })

    it('should throw for negative n', () => {
      const bucket = createBucket()
      expect(() => bucket.setRefillRate(-1)).toThrow(RangeError)
    })

    it('should affect subsequent refills', () => {
      let time = 0
      const bucket = createBucket({ capacity: 10, refillRate: 1, refillInterval: 1000, now: () => time })
      bucket.drain()
      bucket.setRefillRate(5)
      time = 2000
      expect(bucket.tokens).toBe(10)
    })
  })

  describe('statistics', () => {
    it('should return initial zero stats', () => {
      const bucket = createBucket()
      const stats: TokenBucketStatistics = bucket.statistics
      expect(stats.totalConsumed).toBe(0)
      expect(stats.totalRejected).toBe(0)
      expect(stats.totalRefilled).toBe(0)
      expect(stats.totalWaitTime).toBe(0)
    })

    it('should track totalConsumed across multiple operations', () => {
      const bucket = createBucket({ capacity: 20 })
      bucket.consume(3)
      bucket.consume(2)
      bucket.consume(1)
      expect(bucket.statistics.totalConsumed).toBe(6)
    })

    it('should track totalRejected', () => {
      const bucket = createBucket({ capacity: 2 })
      bucket.consume(2)
      bucket.consume(3)
      bucket.consume(4)
      expect(bucket.statistics.totalRejected).toBe(7)
    })

    it('should track totalRefilled via time-based refill', () => {
      let time = 0
      const bucket = createBucket({ capacity: 10, refillRate: 1, refillInterval: 1000, now: () => time })
      bucket.consume(5)
      time = 3000
      const _tokens = bucket.tokens
      expect(bucket.statistics.totalRefilled).toBe(3)
    })

    it('should track totalRefilled via fill()', () => {
      const bucket = createBucket({ capacity: 10 })
      bucket.consume(7)
      bucket.fill()
      expect(bucket.statistics.totalRefilled).toBe(7)
    })

    it('should accumulate totalRefilled from both refill and fill', () => {
      let time = 0
      const bucket = createBucket({ capacity: 10, refillRate: 1, refillInterval: 1000, now: () => time })
      bucket.consume(5)
      time = 2000
      const _tokens = bucket.tokens
      bucket.consume(3)
      bucket.fill()
      expect(bucket.statistics.totalRefilled).toBeGreaterThan(0)
    })

    it('should return a snapshot object', () => {
      const bucket = createBucket({ capacity: 10 })
      const stats1 = bucket.statistics
      bucket.consume(1)
      const stats2 = bucket.statistics
      expect(stats1.totalConsumed).toBe(0)
      expect(stats2.totalConsumed).toBe(1)
    })

    it('should track totalWaitTime', () => {
      let time = 0
      const bucket = createBucket({ capacity: 1, refillRate: 1, refillInterval: 1000, now: () => time })
      bucket.drain()
      time = 100
      bucket.waitUntilAvailable(1)
      expect(bucket.statistics.totalWaitTime).toBe(900)
    })

    it('should accumulate totalWaitTime across calls', () => {
      let time = 0
      const bucket = createBucket({ capacity: 1, refillRate: 1, refillInterval: 1000, now: () => time })
      bucket.drain()
      time = 100
      bucket.waitUntilAvailable(1)
      time = 200
      bucket.waitUntilAvailable(1)
      expect(bucket.statistics.totalWaitTime).toBeGreaterThan(900)
    })
  })

  describe('refill behavior', () => {
    it('should not refill before interval passes', () => {
      let time = 0
      const bucket = createBucket({ capacity: 10, refillRate: 1, refillInterval: 1000, now: () => time })
      bucket.consume(5)
      time = 500
      expect(bucket.tokens).toBe(5)
    })

    it('should refill 1 token per interval', () => {
      let time = 0
      const bucket = createBucket({ capacity: 10, refillRate: 1, refillInterval: 1000, now: () => time })
      bucket.consume(5)
      time = 1000
      expect(bucket.tokens).toBe(6)
    })

    it('should refill multiple tokens for multiple intervals', () => {
      let time = 0
      const bucket = createBucket({ capacity: 10, refillRate: 1, refillInterval: 1000, now: () => time })
      bucket.consume(5)
      time = 3000
      expect(bucket.tokens).toBe(8)
    })

    it('should refill with higher refillRate', () => {
      let time = 0
      const bucket = createBucket({ capacity: 10, refillRate: 3, refillInterval: 1000, now: () => time })
      bucket.consume(9)
      time = 2000
      expect(bucket.tokens).toBe(7)
    })

    it('should not exceed capacity on refill', () => {
      let time = 0
      const bucket = createBucket({ capacity: 5, refillRate: 1, refillInterval: 1000, now: () => time })
      bucket.consume(1)
      time = 10000
      expect(bucket.tokens).toBe(5)
    })

    it('should work with custom refillInterval', () => {
      let time = 0
      const bucket = createBucket({ capacity: 10, refillRate: 1, refillInterval: 500, now: () => time })
      bucket.consume(5)
      time = 1000
      expect(bucket.tokens).toBe(7)
    })

    it('should handle partial interval correctly', () => {
      let time = 0
      const bucket = createBucket({ capacity: 10, refillRate: 1, refillInterval: 1000, now: () => time })
      bucket.consume(5)
      time = 1500
      expect(bucket.tokens).toBe(6)
    })

    it('should update lastRefillTime after refill', () => {
      let time = 0
      const bucket = createBucket({ capacity: 10, refillRate: 1, refillInterval: 1000, now: () => time })
      bucket.consume(5)
      time = 2500
      const _tokens = bucket.tokens
      expect(bucket.lastRefill).toBe(2000)
    })

    it('should handle zero elapsed time', () => {
      let time = 0
      const bucket = createBucket({ capacity: 10, refillRate: 1, refillInterval: 1000, now: () => time })
      bucket.consume(5)
      expect(bucket.tokens).toBe(5)
    })

    it('should handle very large elapsed time', () => {
      let time = 0
      const bucket = createBucket({ capacity: 5, refillRate: 1, refillInterval: 1000, now: () => time })
      bucket.consume(3)
      time = 999999
      expect(bucket.tokens).toBe(5)
    })
  })

  describe('combined operations', () => {
    it('should consume then refill then consume', () => {
      let time = 0
      const bucket = createBucket({ capacity: 5, refillRate: 1, refillInterval: 1000, now: () => time })
      expect(bucket.consume(4)).toBe(true)
      time = 2000
      expect(bucket.tokens).toBe(3)
      expect(bucket.consume(2)).toBe(true)
      expect(bucket.tokens).toBe(1)
    })

    it('should handle drain then refill', () => {
      let time = 0
      const bucket = createBucket({ capacity: 5, refillRate: 1, refillInterval: 1000, now: () => time })
      bucket.drain()
      expect(bucket.tokens).toBe(0)
      time = 3000
      expect(bucket.tokens).toBe(3)
    })

    it('should handle fill then consume then drain', () => {
      const bucket = createBucket({ capacity: 10 })
      bucket.consume(5)
      bucket.fill()
      expect(bucket.tokens).toBe(10)
      bucket.drain()
      expect(bucket.tokens).toBe(0)
    })

    it('should handle reset after complex operations', () => {
      const bucket = createBucket({ capacity: 10 })
      bucket.consume(3)
      bucket.consume(8)
      bucket.fill()
      bucket.drain()
      bucket.reset()
      expect(bucket.tokens).toBe(10)
      expect(bucket.statistics.totalConsumed).toBe(0)
    })

    it('should handle setCapacity during operation', () => {
      const bucket = createBucket({ capacity: 10 })
      bucket.consume(3)
      bucket.setCapacity(5)
      expect(bucket.tokens).toBe(5)
      bucket.fill()
      expect(bucket.tokens).toBe(5)
    })

    it('should handle setRefillRate during operation', () => {
      let time = 0
      const bucket = createBucket({ capacity: 10, refillRate: 1, refillInterval: 1000, now: () => time })
      bucket.consume(8)
      bucket.setRefillRate(3)
      time = 2000
      expect(bucket.tokens).toBe(8)
    })

    it('should handle tryConsume and consume interchangeably', () => {
      const bucket = createBucket({ capacity: 10 })
      expect(bucket.tryConsume(3)).toBe(true)
      expect(bucket.consume(3)).toBe(true)
      expect(bucket.tryConsume(3)).toBe(true)
      expect(bucket.consume(3)).toBe(false)
      expect(bucket.tokens).toBe(1)
    })
  })

  describe('time injection for tests', () => {
    it('should use injected time provider', () => {
      let time = 1000
      const bucket = createBucket({ capacity: 10, refillRate: 1, refillInterval: 1000, now: () => time })
      expect(bucket.lastRefill).toBe(1000)
      bucket.consume(5)
      time = 2500
      expect(bucket.tokens).toBe(6)
    })

    it('should allow manual time advancement', () => {
      let time = 0
      const bucket = createBucket({ capacity: 10, refillRate: 1, refillInterval: 1000, now: () => time })
      bucket.consume(10)
      time += 1000
      expect(bucket.tokens).toBe(1)
      time += 1000
      expect(bucket.tokens).toBe(2)
      time += 8000
      expect(bucket.tokens).toBe(10)
    })

    it('should handle backward time gracefully', () => {
      let time = 5000
      const bucket = createBucket({ capacity: 10, refillRate: 1, refillInterval: 1000, now: () => time })
      bucket.consume(5)
      time = 3000
      expect(bucket.tokens).toBe(5)
    })

    it('should support deterministic refill testing', () => {
      let time = 0
      const bucket = createBucket({ capacity: 3, refillRate: 2, refillInterval: 500, now: () => time })
      bucket.consume(3)
      expect(bucket.consume(1)).toBe(false)
      time = 500
      expect(bucket.consume(1)).toBe(true)
      expect(bucket.tokens).toBe(1)
      time = 1000
      expect(bucket.consume(2)).toBe(true)
      expect(bucket.tokens).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('should handle capacity of 1', () => {
      const bucket = createBucket({ capacity: 1 })
      expect(bucket.consume(1)).toBe(true)
      expect(bucket.consume(1)).toBe(false)
    })

    it('should handle very large capacity', () => {
      const bucket = createBucket({ capacity: 1000000 })
      expect(bucket.tokens).toBe(1000000)
      expect(bucket.consume(999999)).toBe(true)
      expect(bucket.tokens).toBe(1)
    })

    it('should handle refillRate > capacity', () => {
      let time = 0
      const bucket = createBucket({ capacity: 2, refillRate: 10, refillInterval: 1000, now: () => time })
      bucket.drain()
      time = 1000
      expect(bucket.tokens).toBe(2)
    })

    it('should handle very small refillInterval', () => {
      let time = 0
      const bucket = createBucket({ capacity: 10, refillRate: 1, refillInterval: 1, now: () => time })
      bucket.consume(9)
      time = 10
      expect(bucket.tokens).toBe(10)
    })

    it('should handle consuming exactly remaining tokens', () => {
      const bucket = createBucket({ capacity: 5 })
      bucket.consume(2)
      expect(bucket.consume(3)).toBe(true)
      expect(bucket.tokens).toBe(0)
    })

    it('should handle consuming one more than available', () => {
      const bucket = createBucket({ capacity: 5 })
      bucket.consume(2)
      expect(bucket.consume(4)).toBe(false)
      expect(bucket.tokens).toBe(3)
    })

    it('should handle fill after partial consume', () => {
      const bucket = createBucket({ capacity: 10 })
      bucket.consume(3)
      bucket.fill()
      expect(bucket.tokens).toBe(10)
    })

    it('should handle multiple drains', () => {
      const bucket = createBucket({ capacity: 10 })
      bucket.drain()
      bucket.drain()
      bucket.drain()
      expect(bucket.tokens).toBe(0)
    })

    it('should handle multiple fills', () => {
      const bucket = createBucket({ capacity: 10 })
      bucket.consume(5)
      bucket.fill()
      bucket.fill()
      expect(bucket.tokens).toBe(10)
    })

    it('should handle setCapacity to current value', () => {
      const bucket = createBucket({ capacity: 10 })
      bucket.setCapacity(10)
      expect(bucket.capacity).toBe(10)
      expect(bucket.tokens).toBe(10)
    })

    it('should handle setRefillRate to current value', () => {
      const bucket = createBucket({ refillRate: 1 })
      bucket.setRefillRate(1)
      expect(bucket.refillRate).toBe(1)
    })

    it('should handle statistics after many operations', () => {
      const bucket = createBucket({ capacity: 100 })
      for (let i = 0; i < 50; i++) {
        bucket.consume(1)
      }
      bucket.consume(200)
      expect(bucket.statistics.totalConsumed).toBe(50)
      expect(bucket.statistics.totalRejected).toBe(200)
    })
  })

  describe('statistics accuracy', () => {
    it('should track consumed and rejected independently', () => {
      const bucket = createBucket({ capacity: 5 })
      bucket.consume(3)
      bucket.consume(5)
      expect(bucket.statistics.totalConsumed).toBe(3)
      expect(bucket.statistics.totalRejected).toBe(5)
    })

    it('should track refilled from natural refill', () => {
      let time = 0
      const bucket = createBucket({ capacity: 10, refillRate: 2, refillInterval: 1000, now: () => time })
      bucket.consume(6)
      time = 1000
      const _tokens = bucket.tokens
      expect(bucket.statistics.totalRefilled).toBe(2)
    })

    it('should track refilled from fill()', () => {
      const bucket = createBucket({ capacity: 10 })
      bucket.consume(4)
      bucket.fill()
      expect(bucket.statistics.totalRefilled).toBe(4)
    })

    it('should accumulate refilled from both sources', () => {
      let time = 0
      const bucket = createBucket({ capacity: 10, refillRate: 1, refillInterval: 1000, now: () => time })
      bucket.consume(5)
      time = 2000
      const _tokens = bucket.tokens
      bucket.consume(2)
      bucket.fill()
      expect(bucket.statistics.totalRefilled).toBe(7)
    })

    it('should reset all stats on reset()', () => {
      const bucket = createBucket({ capacity: 5 })
      bucket.consume(2)
      bucket.consume(10)
      bucket.fill()
      bucket.reset()
      const stats = bucket.statistics
      expect(stats.totalConsumed).toBe(0)
      expect(stats.totalRejected).toBe(0)
      expect(stats.totalRefilled).toBe(0)
      expect(stats.totalWaitTime).toBe(0)
    })
  })

  describe('concurrent-like access patterns', () => {
    it('should handle rapid sequential consumes', () => {
      const bucket = createBucket({ capacity: 100 })
      let consumed = 0
      for (let i = 0; i < 100; i++) {
        if (bucket.consume(1)) consumed++
      }
      expect(consumed).toBe(100)
      expect(bucket.consume(1)).toBe(false)
    })

    it('should handle alternating consume and check', () => {
      const bucket = createBucket({ capacity: 5 })
      for (let i = 5; i > 0; i--) {
        expect(bucket.tokens).toBe(i)
        bucket.consume(1)
      }
      expect(bucket.tokens).toBe(0)
    })

    it('should handle burst then wait pattern', () => {
      let time = 0
      const bucket = createBucket({ capacity: 5, refillRate: 1, refillInterval: 1000, now: () => time })
      for (let i = 0; i < 5; i++) bucket.consume(1)
      expect(bucket.tokens).toBe(0)
      time = 3000
      expect(bucket.tokens).toBe(3)
      bucket.consume(2)
      expect(bucket.tokens).toBe(1)
    })

    it('should handle repeated drain and fill cycles', () => {
      const bucket = createBucket({ capacity: 10 })
      for (let i = 0; i < 5; i++) {
        bucket.drain()
        expect(bucket.tokens).toBe(0)
        bucket.fill()
        expect(bucket.tokens).toBe(10)
      }
    })
  })

  describe('TokenBucketOptions type', () => {
    it('should work with minimal options', () => {
      const options: TokenBucketOptions = { capacity: 10, refillRate: 1 }
      const bucket = TokenBucket.fromOptions(options)
      expect(bucket.capacity).toBe(10)
    })

    it('should work with full options', () => {
      const options: TokenBucketOptions = { capacity: 20, refillRate: 5, refillInterval: 500 }
      const bucket = TokenBucket.fromOptions(options)
      expect(bucket.capacity).toBe(20)
      expect(bucket.refillRate).toBe(5)
      expect(bucket.refillInterval).toBe(500)
    })
  })

  describe('TokenBucketStatistics type', () => {
    it('should contain all required fields', () => {
      const bucket = createBucket()
      const stats: TokenBucketStatistics = bucket.statistics
      expect(typeof stats.totalConsumed).toBe('number')
      expect(typeof stats.totalRejected).toBe('number')
      expect(typeof stats.totalRefilled).toBe('number')
      expect(typeof stats.totalWaitTime).toBe('number')
    })
  })

  describe('regression tests', () => {
    it('should not lose tokens on failed consume', () => {
      const bucket = createBucket({ capacity: 3 })
      expect(bucket.consume(3)).toBe(true)
      expect(bucket.consume(1)).toBe(false)
      expect(bucket.tokens).toBe(0)
    })

    it('should handle setCapacity reducing to less than current tokens', () => {
      const bucket = createBucket({ capacity: 10 })
      bucket.consume(1)
      bucket.setCapacity(2)
      expect(bucket.tokens).toBe(2)
    })

    it('should handle waitUntilAvailable after drain', () => {
      let time = 0
      const bucket = createBucket({ capacity: 5, refillRate: 1, refillInterval: 1000, now: () => time })
      bucket.drain()
      time = 100
      const wait = bucket.waitUntilAvailable(3)
      expect(wait).toBeGreaterThan(0)
    })

    it('should handle consume after setCapacity increase', () => {
      const bucket = createBucket({ capacity: 5 })
      bucket.consume(5)
      bucket.setCapacity(10)
      bucket.fill()
      expect(bucket.consume(8)).toBe(true)
    })

    it('should preserve stats across fill/drain', () => {
      const bucket = createBucket({ capacity: 10 })
      bucket.consume(5)
      const consumedBefore = bucket.statistics.totalConsumed
      bucket.drain()
      bucket.fill()
      expect(bucket.statistics.totalConsumed).toBe(consumedBefore)
    })

    it('should handle exactly one interval elapsed', () => {
      let time = 0
      const bucket = createBucket({ capacity: 10, refillRate: 1, refillInterval: 1000, now: () => time })
      bucket.consume(5)
      time = 1000
      expect(bucket.tokens).toBe(6)
    })

    it('should handle just under one interval', () => {
      let time = 0
      const bucket = createBucket({ capacity: 10, refillRate: 1, refillInterval: 1000, now: () => time })
      bucket.consume(5)
      time = 999
      expect(bucket.tokens).toBe(5)
    })

    it('should handle reset statistics not affecting token count', () => {
      const bucket = createBucket({ capacity: 10 })
      bucket.consume(3)
      const tokensBefore = bucket.tokens
      bucket.reset()
      expect(bucket.tokens).toBe(10)
      expect(tokensBefore).toBe(7)
    })
  })
})
