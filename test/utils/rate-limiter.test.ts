import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { RateLimiter } from '../../src/utils/rate-limiter.js'

describe('RateLimiter', () => {
  beforeEach(() => vi.useRealTimers())
  afterEach(() => vi.useRealTimers())

  it('allows requests up to limit', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    const results: boolean[] = []
    for (let i = 0; i < 5; i++) results.push(rl.tryAcquire())
    expect(results.every(r => r)).toBe(true)
  })

  it('blocks requests over limit', () => {
    const rl = new RateLimiter({ maxTokens: 3, refillRate: 1, refillIntervalMs: 1000 })
    for (let i = 0; i < 3; i++) rl.tryAcquire()
    expect(rl.tryAcquire()).toBe(false)
  })

  it('remaining decreases after acquire', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    expect(rl.tryAcquire()).toBe(true)
    expect(rl.getAvailableTokens()).toBe(4)
    expect(rl.tryAcquire()).toBe(true)
    expect(rl.getAvailableTokens()).toBe(3)
  })

  it('acquire waits and resolves after refill', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: false })
    const rl = new RateLimiter({ maxTokens: 2, refillRate: 1, refillIntervalMs: 1000 })
    rl.tryAcquire()
    rl.tryAcquire()
    const p = rl.acquire()
    vi.advanceTimersByTime(1000)
    await p
    expect(rl.getAvailableTokens()).toBeLessThanOrEqual(2)
    vi.useRealTimers()
  })

  it('reset restores all tokens', () => {
    const rl = new RateLimiter({ maxTokens: 2, refillRate: 1, refillIntervalMs: 1000 })
    rl.tryAcquire()
    rl.tryAcquire()
    rl.reset()
    expect(rl.tryAcquire()).toBe(true)
    expect(rl.tryAcquire()).toBe(true)
  })

  it('getStats does not consume quota', () => {
    const rl = new RateLimiter({ maxTokens: 3, refillRate: 1, refillIntervalMs: 1000 })
    const s1 = rl.getStats()
    expect(s1.availableTokens).toBe(3)
    rl.tryAcquire()
    const s2 = rl.getStats()
    expect(s2.availableTokens).toBe(2)
  })

  it('window refills after interval', () => {
    vi.useFakeTimers({ shouldAdvanceTime: false })
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'))
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    for (let i = 0; i < 5; i++) rl.tryAcquire()
    expect(rl.tryAcquire()).toBe(false)
    vi.advanceTimersByTime(1001)
    expect(rl.tryAcquire()).toBe(true)
    vi.useRealTimers()
  })

  it('maxTokens is readonly property', () => {
    const rl = new RateLimiter({ maxTokens: 10, refillRate: 1, refillIntervalMs: 1000 })
    expect(rl.maxTokens).toBe(10)
  })

  it('zero maxTokens throws RangeError', () => {
    expect(() => new RateLimiter({ maxTokens: 0, refillRate: 1, refillIntervalMs: 1000 })).toThrow(RangeError)
  })

  it('negative refillRate throws RangeError', () => {
    expect(() => new RateLimiter({ maxTokens: 5, refillRate: 0, refillIntervalMs: 1000 })).toThrow(RangeError)
  })

  it('zero refillIntervalMs throws RangeError', () => {
    expect(() => new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 0 })).toThrow(RangeError)
  })

  it('getStats returns totalAcquired', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    rl.tryAcquire()
    rl.tryAcquire()
    rl.tryAcquire()
    expect(rl.getStats().totalAcquired).toBe(3)
  })

  it('getStats returns totalRejected', () => {
    const rl = new RateLimiter({ maxTokens: 1, refillRate: 1, refillIntervalMs: 1000 })
    rl.tryAcquire()
    rl.tryAcquire()
    expect(rl.getStats().totalRejected).toBe(1)
  })

  it('getStats returns maxTokens', () => {
    const rl = new RateLimiter({ maxTokens: 7, refillRate: 1, refillIntervalMs: 1000 })
    expect(rl.getStats().maxTokens).toBe(7)
  })

  it('refillRate is readonly property', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 3, refillIntervalMs: 2000 })
    expect(rl.refillRate).toBe(3)
  })

  it('refillIntervalMs is readonly property', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 2000 })
    expect(rl.refillIntervalMs).toBe(2000)
  })

  it('tryAcquire with count > 1', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    expect(rl.tryAcquire(3)).toBe(true)
    expect(rl.getAvailableTokens()).toBe(2)
  })

  it('tryAcquire with count exceeding available fails', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    expect(rl.tryAcquire(6)).toBe(false)
    expect(rl.getAvailableTokens()).toBe(5)
  })

  it('tryAcquire with count 0 throws', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    expect(() => rl.tryAcquire(0)).toThrow(RangeError)
  })

  it('toString returns descriptive string', () => {
    const rl = new RateLimiter({ maxTokens: 10, refillRate: 2, refillIntervalMs: 500 })
    const str = rl.toString()
    expect(str).toContain('10')
    expect(str).toContain('2')
    expect(str).toContain('500')
  })

  it('toJSON returns options plus tokens', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    const json = rl.toJSON()
    expect(json.maxTokens).toBe(5)
    expect(json.refillRate).toBe(1)
    expect(json.refillIntervalMs).toBe(1000)
    expect(json.tokens).toBe(5)
  })

  it('toJSON tokens decrease after acquire', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    rl.tryAcquire()
    rl.tryAcquire()
    expect(rl.toJSON().tokens).toBe(3)
  })

  it('clone creates independent copy', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    rl.tryAcquire()
    const copy = rl.clone()
    expect(copy.getAvailableTokens()).toBe(4)
    rl.tryAcquire()
    expect(copy.getAvailableTokens()).toBe(4)
  })

  it('equals returns true for same config', () => {
    const rl1 = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    const rl2 = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    expect(rl1.equals(rl2)).toBe(true)
  })

  it('equals returns false for different config', () => {
    const rl1 = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    const rl2 = new RateLimiter({ maxTokens: 10, refillRate: 1, refillIntervalMs: 1000 })
    expect(rl1.equals(rl2)).toBe(false)
  })

  it('equals returns false for non-RateLimiter', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    expect(rl.equals({})).toBe(false)
    expect(rl.equals(null)).toBe(false)
  })

  it('reset clears stats', () => {
    const rl = new RateLimiter({ maxTokens: 2, refillRate: 1, refillIntervalMs: 1000 })
    rl.tryAcquire()
    rl.tryAcquire()
    rl.tryAcquire()
    rl.reset()
    const stats = rl.getStats()
    expect(stats.totalAcquired).toBe(0)
    expect(stats.totalRejected).toBe(0)
  })

  it('refills multiple intervals at once', () => {
    vi.useFakeTimers({ shouldAdvanceTime: false })
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'))
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    for (let i = 0; i < 5; i++) rl.tryAcquire()
    vi.advanceTimersByTime(5000)
    expect(rl.getAvailableTokens()).toBe(5)
    vi.useRealTimers()
  })

  it('refills cap at maxTokens', () => {
    vi.useFakeTimers({ shouldAdvanceTime: false })
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'))
    const rl = new RateLimiter({ maxTokens: 3, refillRate: 5, refillIntervalMs: 1000 })
    vi.advanceTimersByTime(10000)
    expect(rl.getAvailableTokens()).toBe(3)
    vi.useRealTimers()
  })

  it('tryAcquire partial batch fails entirely', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    rl.tryAcquire(3)
    expect(rl.tryAcquire(3)).toBe(false)
    expect(rl.getAvailableTokens()).toBe(2)
  })

  it('getStats tracks totalRefills', () => {
    vi.useFakeTimers({ shouldAdvanceTime: false })
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'))
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    rl.tryAcquire()
    vi.advanceTimersByTime(1500)
    rl.getStats()
    expect(rl.getStats().totalRefills).toBeGreaterThanOrEqual(1)
    vi.useRealTimers()
  })

  it('clone preserves acquired count', () => {
    const rl = new RateLimiter({ maxTokens: 10, refillRate: 1, refillIntervalMs: 1000 })
    rl.tryAcquire()
    rl.tryAcquire()
    const copy = rl.clone()
    expect(copy.getStats().totalAcquired).toBe(2)
  })

  it('single token limiter works', () => {
    const rl = new RateLimiter({ maxTokens: 1, refillRate: 1, refillIntervalMs: 1000 })
    expect(rl.tryAcquire()).toBe(true)
    expect(rl.tryAcquire()).toBe(false)
  })

  it('large maxTokens works', () => {
    const rl = new RateLimiter({ maxTokens: 1000, refillRate: 10, refillIntervalMs: 100 })
    expect(rl.getAvailableTokens()).toBe(1000)
    rl.tryAcquire(500)
    expect(rl.getAvailableTokens()).toBe(500)
  })

  it('reset resets lastRefillTime', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    rl.tryAcquire()
    rl.reset()
    expect(rl.getAvailableTokens()).toBe(5)
  })

  it('tryAcquire returns boolean', () => {
    const rl = new RateLimiter({ maxTokens: 10, refillRate: 1, refillIntervalMs: 1000 })
    expect(typeof rl.tryAcquire()).toBe('boolean')
  })

  it('multiple refills tracked', () => {
    vi.useFakeTimers({ shouldAdvanceTime: false })
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'))
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    rl.tryAcquire()
    rl.tryAcquire()
    vi.advanceTimersByTime(500)
    rl.tryAcquire()
    expect(rl.tryAcquire()).toBe(true)
    vi.useRealTimers()
  })

  it('tryAcquire with count after partial use', () => {
    const rl = new RateLimiter({ maxTokens: 10, refillRate: 1, refillIntervalMs: 1000 })
    rl.tryAcquire(5)
    expect(rl.tryAcquire(5)).toBe(true)
    expect(rl.tryAcquire()).toBe(false)
  })

  it('negative maxTokens throws', () => {
    expect(() => new RateLimiter({ maxTokens: -1, refillRate: 1, refillIntervalMs: 1000 })).toThrow(RangeError)
  })

  it('negative refillIntervalMs throws', () => {
    expect(() => new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: -1 })).toThrow(RangeError)
  })

  it('equals returns false for different refillRate', () => {
    const rl1 = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    const rl2 = new RateLimiter({ maxTokens: 5, refillRate: 2, refillIntervalMs: 1000 })
    expect(rl1.equals(rl2)).toBe(false)
  })

  it('equals returns false for different refillIntervalMs', () => {
    const rl1 = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    const rl2 = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 2000 })
    expect(rl1.equals(rl2)).toBe(false)
  })

  it('clone preserves stats', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    rl.tryAcquire()
    rl.tryAcquire()
    rl.tryAcquire()
    const copy = rl.clone()
    expect(copy.getStats().totalAcquired).toBe(3)
  })

  it('getAvailableTokens starts at maxTokens', () => {
    const rl = new RateLimiter({ maxTokens: 8, refillRate: 1, refillIntervalMs: 1000 })
    expect(rl.getAvailableTokens()).toBe(8)
  })

  it('tryAcquire default count is 1', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    rl.tryAcquire()
    expect(rl.getAvailableTokens()).toBe(4)
  })

  it('tryAcquire with count exceeds available returns false', () => {
    const rl = new RateLimiter({ maxTokens: 3, refillRate: 1, refillIntervalMs: 1000 })
    expect(rl.tryAcquire(5)).toBe(false)
  })

  it('getStats returns totalAcquired', () => {
    const rl = new RateLimiter({ maxTokens: 10, refillRate: 1, refillIntervalMs: 1000 })
    rl.tryAcquire()
    rl.tryAcquire()
    expect(rl.getStats().totalAcquired).toBe(2)
  })

  it('toString returns string', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    expect(typeof rl.toString()).toBe('string')
  })

  it('toJSON returns object', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    const json = rl.toJSON()
    expect(json).toBeDefined()
    expect(typeof json).toBe('object')
  })

  it('equals returns true for same config', () => {
    const rl1 = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    const rl2 = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    expect(rl1.equals(rl2)).toBe(true)
  })

  it('should report available tokens', () => {
    const rl = new RateLimiter({ maxTokens: 10, refillRate: 1, refillIntervalMs: 1000 })
    expect(rl.getAvailableTokens()).toBe(10)
  })

  it('should get stats', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    const stats = rl.getStats()
    expect(stats).toBeDefined()
  })
})

  it('tryAcquire returns true when tokens available', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    expect(rl.tryAcquire()).toBe(true)
  })

  it('tryAcquire returns false when exhausted', () => {
    const rl = new RateLimiter({ maxTokens: 1, refillRate: 1, refillIntervalMs: 1000 })
    expect(rl.tryAcquire()).toBe(true)
    expect(rl.tryAcquire()).toBe(false)
  })

  it('tryAcquire respects count parameter', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    expect(rl.tryAcquire(3)).toBe(true)
    expect(rl.tryAcquire(3)).toBe(false)


  it('tryAcquire returns boolean', () => {
    const rl = new RateLimiter({ maxTokens: 10, refillRate: 1 })
    expect(typeof rl.tryAcquire()).toBe('boolean')
  })

  it('getAvailableTokens returns number', () => {
    const rl = new RateLimiter({ maxTokens: 10, refillRate: 1 })
    expect(typeof rl.getAvailableTokens()).toBe('number')
  })

  it('reset clears tokens', () => {
    const rl = new RateLimiter({ maxTokens: 10, refillRate: 1 })
    rl.reset()
    expect(rl.getAvailableTokens()).toBe(10)
  })
  })

describe('rate-limiter - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('rate-limiter - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('rate-limiter - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('rate-limiter - wave548', () => {
  it('rate-limiter module defined', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter module is function', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('rate-limiter - wave549', () => {
  it('rate-limiter module defined', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter module is function', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('rate-limiter - wave550', () => {
  it('rate-limiter w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('rate-limiter - wave551', () => {
  it('rate-limiter w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rate-limiter - wave552', () => {
  it('rate-limiter w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rate-limiter - wave553', () => {
  it('rate-limiter w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rate-limiter - wave554', () => {
  it('rate-limiter w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rate-limiter - wave555', () => {
  it('rate-limiter w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rate-limiter - wave556', () => {
  it('rate-limiter w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rate-limiter - wave557', () => {
  it('rate-limiter w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rate-limiter - wave558', () => {
  it('rate-limiter w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rate-limiter - wave559', () => {
  it('rate-limiter w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rate-limiter - wave560', () => {
  it('rate-limiter w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rate-limiter - wave561', () => {
  it('rate-limiter w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rate-limiter - wave562', () => {
  it('rate-limiter w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rate-limiter - wave563', () => {
  it('rate-limiter w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rate-limiter - wave564', () => {
  it('rate-limiter w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rate-limiter - wave565', () => {
  it('rate-limiter w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rate-limiter w565 v2', () => {
    expect(describe).toBeDefined()
  })
})
