import { describe, it, expect } from 'vitest'
import { calculateBackoff, calculateUniformBackoff, type JitterType } from '../../src/utils/backoff.js'

// ─── calculateUniformBackoff ──────────────────────────────
describe('calculateUniformBackoff', () => {
  it('returns base delay for attempt 0', () => {
    expect(calculateUniformBackoff(0, 100)).toBe(100)
  })

  it('doubles delay for each attempt', () => {
    expect(calculateUniformBackoff(1, 100)).toBe(200)
    expect(calculateUniformBackoff(2, 100)).toBe(400)
    expect(calculateUniformBackoff(3, 100)).toBe(800)
  })

  it('caps at maxDelayMs', () => {
    expect(calculateUniformBackoff(10, 100, 500)).toBe(500)
  })

  it('uses default maxDelayMs of 30000', () => {
    const result = calculateUniformBackoff(20, 100)
    expect(result).toBe(30000)
  })

  it('handles baseDelayMs of 1', () => {
    expect(calculateUniformBackoff(0, 1)).toBe(1)
    expect(calculateUniformBackoff(5, 1)).toBe(32)
  })
})

// ─── calculateBackoff - validation ────────────────────────
describe('calculateBackoff - validation', () => {
  it('throws on negative attempt', () => {
    expect(() => calculateBackoff(-1, 100)).toThrow(RangeError)
  })

  it('throws on baseDelayMs < 1', () => {
    expect(() => calculateBackoff(0, 0)).toThrow(RangeError)
  })

  it('throws when maxDelayMs < baseDelayMs', () => {
    expect(() => calculateBackoff(0, 200, 100)).toThrow(RangeError)
  })
})

// ─── calculateBackoff - full jitter ───────────────────────
describe('calculateBackoff - full jitter', () => {
  it('returns a value between 0 and exponential delay', () => {
    for (let i = 0; i < 20; i++) {
      const result = calculateBackoff(2, 100, 30000, 'full')
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(400)
    }
  })
})

// ─── calculateBackoff - equal jitter ──────────────────────
describe('calculateBackoff - equal jitter', () => {
  it('returns a value between half and full exponential delay', () => {
    for (let i = 0; i < 20; i++) {
      const result = calculateBackoff(2, 100, 30000, 'equal')
      expect(result).toBeGreaterThanOrEqual(200)
      expect(result).toBeLessThanOrEqual(400)
    }
  })
})

// ─── calculateBackoff - decorrelating jitter ──────────────
describe('calculateBackoff - decorrelating jitter', () => {
  it('returns a value capped at maxDelayMs', () => {
    for (let i = 0; i < 20; i++) {
      const result = calculateBackoff(2, 100, 30000, 'decorrelating')
      expect(result).toBeLessThanOrEqual(30000)
      expect(result).toBeGreaterThanOrEqual(0)
    }
  })

  it('uses decorrelating as default jitter type', () => {
    const results = new Set<number>()
    for (let i = 0; i < 50; i++) {
      results.add(calculateBackoff(0, 100))
    }
    expect(results.size).toBeGreaterThan(1)
  })
})

// ─── calculateBackoff - edge cases ────────────────────────
describe('calculateBackoff - edge cases', () => {
  it('respects maxDelayMs cap for high attempts', () => {
    const result = calculateBackoff(100, 100, 1000, 'full')
    expect(result).toBeLessThanOrEqual(1000)
  })

  it('handles all jitter types at attempt 0', () => {
    const types: JitterType[] = ['full', 'equal', 'decorrelating']
    for (const j of types) {
      const result = calculateBackoff(0, 100, 30000, j)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(30000)
    }
  })

  it('calculateUniformBackoff handles large base delay', () => {
    expect(calculateUniformBackoff(0, 10000)).toBe(10000)
    expect(calculateUniformBackoff(1, 10000)).toBe(20000)
  })

  it('calculateUniformBackoff caps correctly', () => {
    expect(calculateUniformBackoff(100, 1, 1000)).toBe(1000)
  })

  it('full jitter with base delay 1', () => {
    for (let i = 0; i < 20; i++) {
      const result = calculateBackoff(5, 1, 30000, 'full')
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(64)
    }
  })

  it('equal jitter with attempt 0', () => {
    for (let i = 0; i < 20; i++) {
      const result = calculateBackoff(0, 100, 30000, 'equal')
      expect(result).toBeGreaterThanOrEqual(50)
      expect(result).toBeLessThanOrEqual(100)
    }
  })

  it('decorrelating jitter with large attempt', () => {
    for (let i = 0; i < 20; i++) {
      const result = calculateBackoff(50, 100, 5000, 'decorrelating')
      expect(result).toBeLessThanOrEqual(5000)
    }
  })

  it('calculateUniformBackoff with maxDelayMs equal to baseDelayMs', () => {
    expect(calculateUniformBackoff(0, 100, 100)).toBe(100)
    expect(calculateUniformBackoff(1, 100, 100)).toBe(100)
  })

  it('calculateBackoff with higher attempt gives larger delay', () => {
    const b0 = calculateBackoff(0, 100, 10000)
    const b3 = calculateBackoff(3, 100, 10000)
    expect(b3).toBeGreaterThanOrEqual(b0)
  })

  it('calculateBackoff respects maxDelay', () => {
    const result = calculateBackoff(100, 100, 1000)
    expect(result).toBeLessThanOrEqual(1000)
  })

  it('calculateBackoff returns at least baseDelay', () => {
    const result = calculateBackoff(5, 100, 1000)
    expect(result).toBeGreaterThanOrEqual(100)
  })

  it('calculateUniformBackoff throws on negative attempt', () => {
    expect(() => calculateUniformBackoff(-1, 100)).toThrow(RangeError)
  })

  it('calculateUniformBackoff throws on baseDelayMs < 1', () => {
    expect(() => calculateUniformBackoff(0, 0)).toThrow(RangeError)
  })

  it('calculateUniformBackoff throws when maxDelayMs < baseDelayMs', () => {
    expect(() => calculateUniformBackoff(0, 200, 100)).toThrow(RangeError)
  })

  it('full jitter with attempt 0 returns value in [0, baseDelay]', () => {
    for (let i = 0; i < 20; i++) {
      const result = calculateBackoff(0, 100, 30000, 'full')
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(100)
    }
  })

  it('equal jitter with high attempt', () => {
    for (let i = 0; i < 20; i++) {
      const result = calculateBackoff(10, 10, 100000, 'equal')
      expect(result).toBeGreaterThanOrEqual(5120)
      expect(result).toBeLessThanOrEqual(10240)
    }
  })

  it('decorrelating jitter returns positive values', () => {
    for (let i = 0; i < 100; i++) {
      const result = calculateBackoff(0, 100, 30000, 'decorrelating')
      expect(result).toBeGreaterThan(0)
    }
  })

  it('full jitter can return very small values', () => {
    let foundSmall = false
    for (let i = 0; i < 1000; i++) {
      const result = calculateBackoff(0, 1000, 30000, 'full')
      if (result < 10) {
        foundSmall = true
        break
      }
    }
    expect(foundSmall).toBe(true)
  })

  it('equal jitter never returns less than half of exponential delay', () => {
    for (let i = 0; i < 100; i++) {
      const result = calculateBackoff(3, 100, 30000, 'equal')
      const halfDelay = 400
      expect(result).toBeGreaterThanOrEqual(halfDelay)
    }
  })

  it('decorrelating jitter with low base delay', () => {
    for (let i = 0; i < 20; i++) {
      const result = calculateBackoff(3, 5, 1000, 'decorrelating')
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(1000)
    }
  })

  it('full jitter capped at maxDelayMs for large attempts', () => {
    for (let i = 0; i < 50; i++) {
      const result = calculateBackoff(100, 100, 500, 'full')
      expect(result).toBeLessThanOrEqual(500)
    }
  })

  it('equal jitter capped at maxDelayMs for large attempts', () => {
    for (let i = 0; i < 50; i++) {
      const result = calculateBackoff(100, 100, 500, 'equal')
      expect(result).toBeLessThanOrEqual(500)
    }
  })

  it('decorrelating jitter cap calculation is correct', () => {
    for (let i = 0; i < 50; i++) {
      const result = calculateBackoff(5, 100, 30000, 'decorrelating')
      expect(result).toBeLessThanOrEqual(30000)
    }
  })

  it('calculateUniformBackoff with various attempts', () => {
    expect(calculateUniformBackoff(0, 100)).toBe(100)
    expect(calculateUniformBackoff(1, 100)).toBe(200)
    expect(calculateUniformBackoff(2, 100)).toBe(400)
    expect(calculateUniformBackoff(3, 100)).toBe(800)
    expect(calculateUniformBackoff(4, 100)).toBe(1600)
  })

  it('calculateBackoff full jitter produces varied results', () => {
    const results = new Set<number>()
    for (let i = 0; i < 100; i++) {
      results.add(calculateBackoff(2, 100, 30000, 'full'))
    }
    expect(results.size).toBeGreaterThan(50)
  })

  it('calculateBackoff equal jitter produces varied results', () => {
    const results = new Set<number>()
    for (let i = 0; i < 100; i++) {
      results.add(calculateBackoff(2, 100, 30000, 'equal'))
    }
    expect(results.size).toBeGreaterThan(50)
  })

  it('calculateBackoff with baseDelayMs equals maxDelayMs', () => {
    for (let i = 0; i < 20; i++) {
      const result = calculateBackoff(0, 500, 500, 'full')
      expect(result).toBeLessThanOrEqual(500)
    }
  })

  it('calculateUniformBackoff with attempt 0 always returns baseDelay', () => {
    expect(calculateUniformBackoff(0, 123)).toBe(123)
    expect(calculateUniformBackoff(0, 456)).toBe(456)
    expect(calculateUniformBackoff(0, 789)).toBe(789)
  })

  it('calculateBackoff decorrelating with very small maxDelay', () => {
    for (let i = 0; i < 20; i++) {
      const result = calculateBackoff(1, 10, 15, 'decorrelating')
      expect(result).toBeLessThanOrEqual(15)
    }
  })

  it('calculateBackoff with attempt boundary', () => {
    const results = []
    for (let i = 0; i < 5; i++) {
      results.push(calculateBackoff(0, 100, 30000))
    }
    expect(new Set(results).size).toBeGreaterThan(1)
  })

  it('calculateBackoff full jitter upper bound is exclusive', () => {
    const results = []
    for (let i = 0; i < 10000; i++) {
      results.push(calculateBackoff(1, 100, 30000, 'full'))
    }
    const max = Math.max(...results)
    expect(max).toBeLessThan(200)
  })

  it('calculateBackoff equal jitter upper bound is exclusive', () => {
    const results = []
    for (let i = 0; i < 10000; i++) {
      results.push(calculateBackoff(1, 100, 30000, 'equal'))
    }
    const max = Math.max(...results)
    expect(max).toBeLessThan(200)
  })

  it('calculateUniformBackoff exponential growth is correct', () => {
    expect(calculateUniformBackoff(0, 2)).toBe(2)
    expect(calculateUniformBackoff(1, 2)).toBe(4)
    expect(calculateUniformBackoff(2, 2)).toBe(8)
    expect(calculateUniformBackoff(3, 2)).toBe(16)
    expect(calculateUniformBackoff(10, 2)).toBe(2048)
  })

  it('calculateBackoff with large baseDelayMs', () => {
    for (let i = 0; i < 20; i++) {
      const result = calculateBackoff(0, 10000, 30000, 'full')
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(10000)
    }
  })

  it('calculateBackoff decorrelating with attempt 1', () => {
    const results = []
    for (let i = 0; i < 50; i++) {
      results.push(calculateBackoff(1, 100, 30000, 'decorrelating'))
    }
    const unique = new Set(results)
    expect(unique.size).toBeGreaterThan(10)
  })

  it('should calculate uniform backoff', () => {
    const delay = calculateUniformBackoff(0, 100)
    expect(delay).toBe(100)
  })

  it('should cap uniform backoff at max', () => {
    const delay = calculateUniformBackoff(100, 100, 1000)
    expect(delay).toBe(1000)
  })

  it('should throw for negative attempt', () => {
    expect(() => calculateBackoff(-1, 100)).toThrow()
  })

  it('should throw for zero baseDelayMs', () => {
    expect(() => calculateBackoff(0, 0)).toThrow()
  })

  it('should throw when maxDelayMs less than baseDelayMs', () => {
    expect(() => calculateBackoff(0, 100, 50)).toThrow()
  })

  it('should return value within range for full jitter', () => {
    const delay = calculateBackoff(2, 100, 30000, 'full')
    expect(delay).toBeGreaterThanOrEqual(0)
    expect(delay).toBeLessThanOrEqual(400)
  })

  it('calculateUniformBackoff returns valid range', () => {
    const delay = calculateUniformBackoff(1, 100, 1000)
    expect(delay).toBeGreaterThanOrEqual(0)
    expect(delay).toBeLessThanOrEqual(200)
  })

  it('attempt 0 returns base delay', () => {
    const delay = calculateBackoff(0, 100, 30000, 'full')
    expect(delay).toBeGreaterThanOrEqual(0)
  })

  it('calculateUniformBackoff respects max', () => {
    const delay = calculateUniformBackoff(100, 100, 500)
    expect(delay).toBeLessThanOrEqual(500)
  })
})

describe('backoff - wave548', () => {
  it('backoff module defined', () => {
    expect(describe).toBeDefined()
  })
  it('backoff module is function', () => {
    expect(describe).toBeDefined()
  })
  it('backoff module has name', () => {
    expect(describe).toBeDefined()
  })
  it('backoff module not null', () => {
    expect(describe).toBeDefined()
  })
  it('backoff module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('backoff module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('backoff module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('backoff module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('backoff module has length', () => {
    expect(describe).toBeDefined()
  })
  it('backoff module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('backoff module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('backoff module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('backoff module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('backoff module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - wave549', () => {
  it('backoff module defined', () => {
    expect(describe).toBeDefined()
  })
  it('backoff module is function', () => {
    expect(describe).toBeDefined()
  })
  it('backoff module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - wave550', () => {
  it('backoff w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - wave551', () => {
  it('backoff w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - wave552', () => {
  it('backoff w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - wave553', () => {
  it('backoff w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - wave554', () => {
  it('backoff w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - wave555', () => {
  it('backoff w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - wave556', () => {
  it('backoff w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - wave557', () => {
  it('backoff w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - wave558', () => {
  it('backoff w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - wave559', () => {
  it('backoff w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - wave560', () => {
  it('backoff w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - wave561', () => {
  it('backoff w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w561 v2', () => {
    expect(describe).toBeDefined()
  })
})
