import { describe, it, expect } from 'vitest'
import { TokenBucket } from '../../src/core/rate-limiter/token-bucket.js'
import { SlidingWindow } from '../../src/core/rate-limiter/sliding-window.js'
import { RateLimiter } from '../../src/core/rate-limiter/rate-limiter.js'
import type { RateLimitResult, LimiterStats } from '../../src/core/rate-limiter/types.js'
import { DEFAULT_RATE_LIMITER_CONFIG } from '../../src/core/rate-limiter/types.js'

describe('TokenBucket', () => {
  describe('constructor', () => {
    it('should initialize with full tokens', () => {
      const bucket = new TokenBucket(10, 1)
      expect(bucket.getAvailableTokens()).toBe(10)
    })

    it('should accept custom refill rate', () => {
      const bucket = new TokenBucket(5, 3)
      expect(bucket.getAvailableTokens()).toBe(5)
    })
  })

  describe('tryConsume', () => {
    it('should allow consuming a single token', () => {
      const bucket = new TokenBucket(10, 1)
      const result = bucket.tryConsume()
      expect(result.allowed).toBe(true)
      expect(result.consumed).toBe(1)
      expect(result.remaining).toBe(9)
    })

    it('should allow consuming multiple tokens', () => {
      const bucket = new TokenBucket(10, 1)
      const result = bucket.tryConsume(5)
      expect(result.allowed).toBe(true)
      expect(result.consumed).toBe(5)
      expect(result.remaining).toBe(5)
    })

    it('should reject when not enough tokens', () => {
      const bucket = new TokenBucket(3, 1)
      const result = bucket.tryConsume(5)
      expect(result.allowed).toBe(false)
      expect(result.consumed).toBe(0)
    })

    it('should return correct limit', () => {
      const bucket = new TokenBucket(10, 1)
      const result = bucket.tryConsume()
      expect(result.limit).toBe(10)
    })

    it('should return retryAfter > 0 when rejected', () => {
      const bucket = new TokenBucket(2, 1)
      bucket.tryConsume(2)
      const result = bucket.tryConsume(1)
      expect(result.allowed).toBe(false)
      expect(result.retryAfter).toBeGreaterThan(0)
    })

    it('should return retryAfter = 0 when allowed', () => {
      const bucket = new TokenBucket(10, 1)
      const result = bucket.tryConsume()
      expect(result.retryAfter).toBe(0)
    })

    it('should exhaust all tokens', () => {
      const bucket = new TokenBucket(3, 1)
      expect(bucket.tryConsume().allowed).toBe(true)
      expect(bucket.tryConsume().allowed).toBe(true)
      expect(bucket.tryConsume().allowed).toBe(true)
      expect(bucket.tryConsume().allowed).toBe(false)
    })

    it('should track remaining correctly after multiple consumes', () => {
      const bucket = new TokenBucket(5, 1)
      bucket.tryConsume(2)
      const result = bucket.tryConsume(2)
      expect(result.remaining).toBe(1)
    })
  })

  describe('tryConsumeWithTimeout', () => {
    it('should succeed immediately if tokens available', () => {
      const bucket = new TokenBucket(10, 1)
      const result = bucket.tryConsumeWithTimeout(1, 100)
      expect(result).toBe(true)
    })

    it('should fail if timeout is 0 and no tokens', () => {
      const bucket = new TokenBucket(1, 1)
      bucket.tryConsume(1)
      const result = bucket.tryConsumeWithTimeout(1, 0)
      expect(result).toBe(false)
    })
  })

  describe('refill', () => {
    it('should not refill without time passing', () => {
      const bucket = new TokenBucket(10, 1)
      bucket.tryConsume(5)
      bucket.refill()
      expect(bucket.getAvailableTokens()).toBe(5)
    })
  })

  describe('reset', () => {
    it('should restore all tokens', () => {
      const bucket = new TokenBucket(10, 1)
      bucket.tryConsume(5)
      bucket.reset()
      expect(bucket.getAvailableTokens()).toBe(10)
    })

    it('should reset stats', () => {
      const bucket = new TokenBucket(10, 1)
      bucket.tryConsume(5)
      bucket.reset()
      const stats = bucket.getStats()
      expect(stats.totalRequests).toBe(0)
      expect(stats.allowedRequests).toBe(0)
      expect(stats.rejectedRequests).toBe(0)
    })
  })

  describe('getStats', () => {
    it('should return zero stats initially', () => {
      const bucket = new TokenBucket(10, 1)
      const stats = bucket.getStats()
      expect(stats.totalRequests).toBe(0)
      expect(stats.allowedRequests).toBe(0)
      expect(stats.rejectedRequests).toBe(0)
      expect(stats.currentUsage).toBe(0)
      expect(stats.maxUsage).toBe(0)
    })

    it('should track total requests', () => {
      const bucket = new TokenBucket(10, 1)
      bucket.tryConsume()
      bucket.tryConsume()
      bucket.tryConsume()
      expect(bucket.getStats().totalRequests).toBe(3)
    })

    it('should track allowed requests', () => {
      const bucket = new TokenBucket(10, 1)
      bucket.tryConsume()
      bucket.tryConsume()
      expect(bucket.getStats().allowedRequests).toBe(2)
    })

    it('should track rejected requests', () => {
      const bucket = new TokenBucket(1, 1)
      bucket.tryConsume()
      bucket.tryConsume()
      expect(bucket.getStats().rejectedRequests).toBe(1)
    })

    it('should track current usage', () => {
      const bucket = new TokenBucket(10, 1)
      bucket.tryConsume(3)
      expect(bucket.getStats().currentUsage).toBe(3)
    })

    it('should track max usage', () => {
      const bucket = new TokenBucket(10, 1)
      bucket.tryConsume(7)
      bucket.tryConsume(2)
      expect(bucket.getStats().maxUsage).toBe(9)
    })

    it('should track avg response time', () => {
      const bucket = new TokenBucket(10, 1)
      bucket.tryConsume()
      expect(bucket.getStats().avgResponseTime).toBeGreaterThanOrEqual(0)
    })
  })
})

describe('SlidingWindow', () => {
  describe('constructor', () => {
    it('should initialize with zero count', () => {
      const sw = new SlidingWindow(5, 1000)
      expect(sw.getCurrentCount()).toBe(0)
    })
  })

  describe('tryRequest', () => {
    it('should allow request under limit', () => {
      const sw = new SlidingWindow(5, 1000)
      const result = sw.tryRequest()
      expect(result.allowed).toBe(true)
      expect(result.consumed).toBe(1)
    })

    it('should reject request over limit', () => {
      const sw = new SlidingWindow(2, 1000)
      sw.tryRequest()
      sw.tryRequest()
      const result = sw.tryRequest()
      expect(result.allowed).toBe(false)
      expect(result.consumed).toBe(0)
    })

    it('should return correct remaining count', () => {
      const sw = new SlidingWindow(5, 1000)
      sw.tryRequest()
      sw.tryRequest()
      const result = sw.tryRequest()
      expect(result.remaining).toBe(2)
    })

    it('should return correct limit', () => {
      const sw = new SlidingWindow(10, 1000)
      const result = sw.tryRequest()
      expect(result.limit).toBe(10)
    })

    it('should return retryAfter > 0 when rejected', () => {
      const sw = new SlidingWindow(1, 5000)
      sw.tryRequest()
      const result = sw.tryRequest()
      expect(result.allowed).toBe(false)
      expect(result.retryAfter).toBeGreaterThan(0)
    })

    it('should return retryAfter = 0 when allowed', () => {
      const sw = new SlidingWindow(5, 1000)
      const result = sw.tryRequest()
      expect(result.retryAfter).toBe(0)
    })
  })

  describe('tryRequestAt', () => {
    it('should allow requests within window', () => {
      const sw = new SlidingWindow(3, 1000)
      const base = 10000
      expect(sw.tryRequestAt(base).allowed).toBe(true)
      expect(sw.tryRequestAt(base + 100).allowed).toBe(true)
      expect(sw.tryRequestAt(base + 200).allowed).toBe(true)
    })

    it('should reject requests exceeding window limit', () => {
      const sw = new SlidingWindow(2, 1000)
      const base = 10000
      sw.tryRequestAt(base)
      sw.tryRequestAt(base + 100)
      expect(sw.tryRequestAt(base + 200).allowed).toBe(false)
    })

    it('should allow after old requests expire', () => {
      const sw = new SlidingWindow(2, 1000)
      const base = 10000
      sw.tryRequestAt(base)
      sw.tryRequestAt(base + 500)
      expect(sw.tryRequestAt(base + 1001).allowed).toBe(true)
    })

    it('should slide window correctly', () => {
      const sw = new SlidingWindow(2, 1000)
      const base = 10000
      sw.tryRequestAt(base)
      sw.tryRequestAt(base + 200)
      expect(sw.tryRequestAt(base + 1100).allowed).toBe(true)
      expect(sw.tryRequestAt(base + 1100).remaining).toBe(0)
      expect(sw.tryRequestAt(base + 1201).allowed).toBe(true)
      expect(sw.tryRequestAt(base + 1201).remaining).toBe(0)
    })

    it('should handle exact window boundary', () => {
      const sw = new SlidingWindow(1, 1000)
      const base = 10000
      sw.tryRequestAt(base)
      expect(sw.tryRequestAt(base + 999).allowed).toBe(false)
      expect(sw.tryRequestAt(base + 1000).allowed).toBe(true)
    })

    it('should handle multiple windows', () => {
      const sw = new SlidingWindow(1, 1000)
      const base = 10000
      sw.tryRequestAt(base)
      expect(sw.tryRequestAt(base + 1000).allowed).toBe(true)
      expect(sw.tryRequestAt(base + 1001).allowed).toBe(false)
      expect(sw.tryRequestAt(base + 2000).allowed).toBe(true)
    })
  })

  describe('getCurrentCount', () => {
    it('should return 0 initially', () => {
      const sw = new SlidingWindow(5, 1000)
      expect(sw.getCurrentCount()).toBe(0)
    })

    it('should increment after request', () => {
      const sw = new SlidingWindow(5, 1000)
      sw.tryRequest()
      expect(sw.getCurrentCount()).toBe(1)
    })

    it('should count multiple requests', () => {
      const sw = new SlidingWindow(5, 1000)
      sw.tryRequest()
      sw.tryRequest()
      sw.tryRequest()
      expect(sw.getCurrentCount()).toBe(3)
    })
  })

  describe('getWindowStart', () => {
    it('should return a timestamp in the past', () => {
      const sw = new SlidingWindow(5, 1000)
      const start = sw.getWindowStart()
      expect(start).toBeLessThan(Date.now())
    })

    it('should be approximately windowMs ago', () => {
      const sw = new SlidingWindow(5, 5000)
      const now = Date.now()
      const start = sw.getWindowStart()
      expect(now - start).toBeGreaterThanOrEqual(4990)
      expect(now - start).toBeLessThanOrEqual(5010)
    })
  })

  describe('reset', () => {
    it('should clear all timestamps', () => {
      const sw = new SlidingWindow(5, 1000)
      sw.tryRequest()
      sw.tryRequest()
      sw.reset()
      expect(sw.getCurrentCount()).toBe(0)
    })

    it('should reset stats', () => {
      const sw = new SlidingWindow(5, 1000)
      sw.tryRequest()
      sw.tryRequest()
      sw.reset()
      const stats = sw.getStats()
      expect(stats.totalRequests).toBe(0)
      expect(stats.allowedRequests).toBe(0)
    })
  })

  describe('getStats', () => {
    it('should return zero stats initially', () => {
      const sw = new SlidingWindow(5, 1000)
      const stats = sw.getStats()
      expect(stats.totalRequests).toBe(0)
      expect(stats.allowedRequests).toBe(0)
      expect(stats.rejectedRequests).toBe(0)
    })

    it('should track total requests', () => {
      const sw = new SlidingWindow(5, 1000)
      sw.tryRequest()
      sw.tryRequest()
      sw.tryRequest()
      expect(sw.getStats().totalRequests).toBe(3)
    })

    it('should track allowed and rejected', () => {
      const sw = new SlidingWindow(2, 1000)
      sw.tryRequest()
      sw.tryRequest()
      sw.tryRequest()
      const stats = sw.getStats()
      expect(stats.allowedRequests).toBe(2)
      expect(stats.rejectedRequests).toBe(1)
    })

    it('should track max usage', () => {
      const sw = new SlidingWindow(3, 1000)
      sw.tryRequest()
      sw.tryRequest()
      sw.tryRequest()
      expect(sw.getStats().maxUsage).toBe(3)
    })
  })
})

describe('RateLimiter', () => {
  describe('constructor', () => {
    it('should use default config when no config provided', () => {
      const rl = new RateLimiter()
      const config = rl.getConfig()
      expect(config.algorithm).toBe(DEFAULT_RATE_LIMITER_CONFIG.algorithm)
      expect(config.maxRequests).toBe(DEFAULT_RATE_LIMITER_CONFIG.maxRequests)
      expect(config.windowMs).toBe(DEFAULT_RATE_LIMITER_CONFIG.windowMs)
    })

    it('should accept partial config', () => {
      const rl = new RateLimiter({ algorithm: 'sliding-window', maxRequests: 50 })
      const config = rl.getConfig()
      expect(config.algorithm).toBe('sliding-window')
      expect(config.maxRequests).toBe(50)
      expect(config.windowMs).toBe(DEFAULT_RATE_LIMITER_CONFIG.windowMs)
    })

    it('should accept full config', () => {
      const rl = new RateLimiter({
        algorithm: 'token-bucket',
        maxRequests: 200,
        windowMs: 30000,
        burstSize: 20,
        refillRate: 5,
      })
      const config = rl.getConfig()
      expect(config.maxRequests).toBe(200)
      expect(config.windowMs).toBe(30000)
      expect(config.burstSize).toBe(20)
      expect(config.refillRate).toBe(5)
    })
  })

  describe('tryAcquire with token-bucket', () => {
    it('should allow request under burst size', () => {
      const rl = new RateLimiter({ algorithm: 'token-bucket', burstSize: 10, refillRate: 1 })
      const result = rl.tryAcquire()
      expect(result.allowed).toBe(true)
    })

    it('should reject when tokens exhausted', () => {
      const rl = new RateLimiter({ algorithm: 'token-bucket', burstSize: 2, refillRate: 1 })
      rl.tryAcquire()
      rl.tryAcquire()
      const result = rl.tryAcquire()
      expect(result.allowed).toBe(false)
    })

    it('should isolate keys', () => {
      const rl = new RateLimiter({ algorithm: 'token-bucket', burstSize: 1, refillRate: 1 })
      const r1 = rl.tryAcquire('user-a')
      const r2 = rl.tryAcquire('user-b')
      expect(r1.allowed).toBe(true)
      expect(r2.allowed).toBe(true)
    })

    it('should reject same key after exhaustion', () => {
      const rl = new RateLimiter({ algorithm: 'token-bucket', burstSize: 1, refillRate: 1 })
      rl.tryAcquire('user-a')
      const result = rl.tryAcquire('user-a')
      expect(result.allowed).toBe(false)
    })
  })

  describe('tryAcquire with sliding-window', () => {
    it('should allow request under limit', () => {
      const rl = new RateLimiter({ algorithm: 'sliding-window', maxRequests: 5, windowMs: 1000 })
      const result = rl.tryAcquire()
      expect(result.allowed).toBe(true)
    })

    it('should reject when limit reached', () => {
      const rl = new RateLimiter({ algorithm: 'sliding-window', maxRequests: 2, windowMs: 60000 })
      rl.tryAcquire()
      rl.tryAcquire()
      const result = rl.tryAcquire()
      expect(result.allowed).toBe(false)
    })

    it('should isolate keys', () => {
      const rl = new RateLimiter({ algorithm: 'sliding-window', maxRequests: 1, windowMs: 60000 })
      expect(rl.tryAcquire('a').allowed).toBe(true)
      expect(rl.tryAcquire('b').allowed).toBe(true)
      expect(rl.tryAcquire('a').allowed).toBe(false)
    })
  })

  describe('tryAcquireN', () => {
    it('should acquire multiple tokens in token-bucket mode', () => {
      const rl = new RateLimiter({ algorithm: 'token-bucket', burstSize: 10, refillRate: 1 })
      const result = rl.tryAcquireN('batch', 5)
      expect(result.allowed).toBe(true)
      expect(result.consumed).toBe(5)
    })

    it('should reject batch larger than capacity', () => {
      const rl = new RateLimiter({ algorithm: 'token-bucket', burstSize: 3, refillRate: 1 })
      const result = rl.tryAcquireN('batch', 5)
      expect(result.allowed).toBe(false)
      expect(result.consumed).toBe(0)
    })

    it('should acquire multiple in sliding-window mode', () => {
      const rl = new RateLimiter({ algorithm: 'sliding-window', maxRequests: 10, windowMs: 60000 })
      const result = rl.tryAcquireN('batch', 3)
      expect(result.allowed).toBe(true)
      expect(result.consumed).toBe(3)
    })

    it('should partially acquire in sliding-window mode', () => {
      const rl = new RateLimiter({ algorithm: 'sliding-window', maxRequests: 4, windowMs: 60000 })
      rl.tryAcquireN('batch', 3)
      const result = rl.tryAcquireN('batch', 3)
      expect(result.allowed).toBe(false)
      expect(result.consumed).toBe(1)
    })
  })

  describe('getStatus', () => {
    it('should return full availability for unused limiter', () => {
      const rl = new RateLimiter({ algorithm: 'token-bucket', burstSize: 10, refillRate: 1 })
      const status = rl.getStatus()
      expect(status.remaining).toBe(10)
      expect(status.allowed).toBe(true)
    })

    it('should return reduced remaining after use', () => {
      const rl = new RateLimiter({ algorithm: 'token-bucket', burstSize: 10, refillRate: 1 })
      rl.tryAcquire()
      rl.tryAcquire()
      const status = rl.getStatus()
      expect(status.remaining).toBe(8)
    })

    it('should return default status for unknown key', () => {
      const rl = new RateLimiter({ algorithm: 'sliding-window', maxRequests: 5, windowMs: 1000 })
      const status = rl.getStatus('unknown')
      expect(status.remaining).toBe(5)
      expect(status.allowed).toBe(true)
    })

    it('should reflect sliding-window usage', () => {
      const rl = new RateLimiter({ algorithm: 'sliding-window', maxRequests: 5, windowMs: 60000 })
      rl.tryAcquire('k')
      rl.tryAcquire('k')
      const status = rl.getStatus('k')
      expect(status.remaining).toBe(3)
    })
  })

  describe('reset', () => {
    it('should reset default limiter', () => {
      const rl = new RateLimiter({ algorithm: 'token-bucket', burstSize: 2, refillRate: 1 })
      rl.tryAcquire()
      rl.tryAcquire()
      rl.reset()
      const result = rl.tryAcquire()
      expect(result.allowed).toBe(true)
    })

    it('should reset specific key', () => {
      const rl = new RateLimiter({ algorithm: 'token-bucket', burstSize: 1, refillRate: 1 })
      rl.tryAcquire('user-a')
      rl.reset('user-a')
      const result = rl.tryAcquire('user-a')
      expect(result.allowed).toBe(true)
    })

    it('should not affect other keys when resetting one', () => {
      const rl = new RateLimiter({ algorithm: 'token-bucket', burstSize: 1, refillRate: 1 })
      rl.tryAcquire('user-a')
      rl.tryAcquire('user-b')
      rl.reset('user-a')
      expect(rl.getStatus('user-b').remaining).toBe(0)
    })
  })

  describe('resetAll', () => {
    it('should clear all limiters', () => {
      const rl = new RateLimiter({ algorithm: 'token-bucket', burstSize: 1, refillRate: 1 })
      rl.tryAcquire('a')
      rl.tryAcquire('b')
      rl.resetAll()
      expect(rl.tryAcquire('a').allowed).toBe(true)
      expect(rl.tryAcquire('b').allowed).toBe(true)
    })
  })

  describe('getStats', () => {
    it('should return zero stats for unknown key', () => {
      const rl = new RateLimiter()
      const stats = rl.getStats('unknown')
      expect(stats.totalRequests).toBe(0)
    })

    it('should track stats for default key', () => {
      const rl = new RateLimiter({ algorithm: 'token-bucket', burstSize: 10, refillRate: 1 })
      rl.tryAcquire()
      rl.tryAcquire()
      const stats = rl.getStats()
      expect(stats.totalRequests).toBe(2)
      expect(stats.allowedRequests).toBe(2)
    })

    it('should track per-key stats', () => {
      const rl = new RateLimiter({ algorithm: 'token-bucket', burstSize: 10, refillRate: 1 })
      rl.tryAcquire('a')
      rl.tryAcquire('a')
      rl.tryAcquire('b')
      expect(rl.getStats('a').totalRequests).toBe(2)
      expect(rl.getStats('b').totalRequests).toBe(1)
    })
  })

  describe('getConfig', () => {
    it('should return current config', () => {
      const rl = new RateLimiter({ algorithm: 'sliding-window', maxRequests: 50 })
      const config = rl.getConfig()
      expect(config.algorithm).toBe('sliding-window')
      expect(config.maxRequests).toBe(50)
    })

    it('should return a copy of config', () => {
      const rl = new RateLimiter({ maxRequests: 100 })
      const config = rl.getConfig()
      config.maxRequests = 999
      expect(rl.getConfig().maxRequests).toBe(100)
    })
  })

  describe('setConfig', () => {
    it('should update config', () => {
      const rl = new RateLimiter()
      rl.setConfig({ maxRequests: 500 })
      expect(rl.getConfig().maxRequests).toBe(500)
    })

    it('should clear existing limiters on config change', () => {
      const rl = new RateLimiter({ algorithm: 'token-bucket', burstSize: 1, refillRate: 1 })
      rl.tryAcquire()
      rl.setConfig({ algorithm: 'token-bucket', burstSize: 10, refillRate: 1 })
      expect(rl.tryAcquire().allowed).toBe(true)
    })

    it('should merge partial config', () => {
      const rl = new RateLimiter({ algorithm: 'sliding-window', maxRequests: 50, windowMs: 30000 })
      rl.setConfig({ maxRequests: 200 })
      expect(rl.getConfig().maxRequests).toBe(200)
      expect(rl.getConfig().windowMs).toBe(30000)
    })
  })

  describe('onRejected', () => {
    it('should call callback on rejection', () => {
      const rl = new RateLimiter({ algorithm: 'token-bucket', burstSize: 1, refillRate: 1 })
      const rejectedKeys: string[] = []
      rl.onRejected((key) => rejectedKeys.push(key))
      rl.tryAcquire()
      rl.tryAcquire()
      rl.tryAcquire('user')
      rl.tryAcquire('user')
      expect(rejectedKeys).toEqual(['__default__', 'user'])
    })

    it('should call multiple callbacks', () => {
      const rl = new RateLimiter({ algorithm: 'token-bucket', burstSize: 1, refillRate: 1 })
      let count1 = 0
      let count2 = 0
      rl.onRejected(() => count1++)
      rl.onRejected(() => count2++)
      rl.tryAcquire()
      rl.tryAcquire()
      expect(count1).toBe(1)
      expect(count2).toBe(1)
    })

    it('should not call on success', () => {
      const rl = new RateLimiter({ algorithm: 'token-bucket', burstSize: 10, refillRate: 1 })
      let called = false
      rl.onRejected(() => { called = true })
      rl.tryAcquire()
      expect(called).toBe(false)
    })
  })

  describe('keyGenerator', () => {
    it('should use custom key generator', () => {
      const rl = new RateLimiter({
        algorithm: 'token-bucket',
        burstSize: 1,
        refillRate: 1,
        keyGenerator: (id) => `prefix:${id}`,
      })
      const r1 = rl.tryAcquire('user')
      const r2 = rl.tryAcquire('user')
      expect(r1.allowed).toBe(true)
      expect(r2.allowed).toBe(false)
    })

    it('should transform keys via generator', () => {
      const rl = new RateLimiter({
        algorithm: 'token-bucket',
        burstSize: 5,
        refillRate: 1,
        keyGenerator: (id) => id.toUpperCase(),
      })
      rl.tryAcquire('alice')
      const stats = rl.getStats('ALICE')
      expect(stats.totalRequests).toBe(1)
    })
  })

  describe('fixed-window algorithm', () => {
    it('should work with fixed-window algorithm', () => {
      const rl = new RateLimiter({ algorithm: 'fixed-window', maxRequests: 3, windowMs: 60000 })
      expect(rl.tryAcquire().allowed).toBe(true)
      expect(rl.tryAcquire().allowed).toBe(true)
      expect(rl.tryAcquire().allowed).toBe(true)
      expect(rl.tryAcquire().allowed).toBe(false)
    })

    it('should isolate keys in fixed-window mode', () => {
      const rl = new RateLimiter({ algorithm: 'fixed-window', maxRequests: 1, windowMs: 60000 })
      expect(rl.tryAcquire('a').allowed).toBe(true)
      expect(rl.tryAcquire('b').allowed).toBe(true)
      expect(rl.tryAcquire('a').allowed).toBe(false)
    })
  })
})

describe('RateLimitResult', () => {
  it('should have all required fields', () => {
    const bucket = new TokenBucket(10, 1)
    const result: RateLimitResult = bucket.tryConsume()
    expect(result).toHaveProperty('allowed')
    expect(result).toHaveProperty('remaining')
    expect(result).toHaveProperty('limit')
    expect(result).toHaveProperty('resetAt')
    expect(result).toHaveProperty('retryAfter')
    expect(result).toHaveProperty('consumed')
  })
})

describe('LimiterStats', () => {
  it('should have all required fields', () => {
    const bucket = new TokenBucket(10, 1)
    const stats: LimiterStats = bucket.getStats()
    expect(stats).toHaveProperty('totalRequests')
    expect(stats).toHaveProperty('allowedRequests')
    expect(stats).toHaveProperty('rejectedRequests')
    expect(stats).toHaveProperty('currentUsage')
    expect(stats).toHaveProperty('maxUsage')
    expect(stats).toHaveProperty('avgResponseTime')
  })
})

describe('DEFAULT_RATE_LIMITER_CONFIG', () => {
  it('should have default values', () => {
    expect(DEFAULT_RATE_LIMITER_CONFIG.algorithm).toBe('token-bucket')
    expect(DEFAULT_RATE_LIMITER_CONFIG.maxRequests).toBe(100)
    expect(DEFAULT_RATE_LIMITER_CONFIG.windowMs).toBe(60000)
    expect(DEFAULT_RATE_LIMITER_CONFIG.burstSize).toBe(10)
    expect(DEFAULT_RATE_LIMITER_CONFIG.refillRate).toBe(1)
  })
})
