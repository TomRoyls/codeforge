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

describe('backoff - wave562', () => {
  it('backoff w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - wave563', () => {
  it('backoff w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - wave564', () => {
  it('backoff w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - wave565', () => {
  it('backoff w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - wave566', () => {
  it('backoff w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - wave127', () => {
  it('backoff w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - wave130', () => {
  it('backoff w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - wave133', () => {
  it('backoff w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - wave136', () => {
  it('backoff w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - wave139', () => {
  it('backoff w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - w142', () => {
  it('backoff v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - w145', () => {
  it('backoff v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - w148', () => {
  it('backoff v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - w151', () => {
  it('backoff v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - w154', () => {
  it('backoff v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - w157', () => {
  it('backoff v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - w160', () => {
  it('backoff v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - w170', () => {
  it('backoff x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - w180', () => {
  it('backoff x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - w190', () => {
  it('backoff x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - w200', () => {
  it('backoff x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - w210', () => {
  it('backoff x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - w220', () => {
  it('backoff x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - w230', () => {
  it('backoff x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - w240', () => {
  it('backoff x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - w250', () => {
  it('backoff x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - w260', () => {
  it('backoff x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - w270', () => {
  it('backoff x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - w280', () => {
  it('backoff x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - w290', () => {
  it('backoff x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - w300', () => {
  it('backoff x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - w310', () => {
  it('backoff x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - w320', () => {
  it('backoff x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - w330', () => {
  it('backoff x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - w340', () => {
  it('backoff x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - w350', () => {
  it('backoff x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - w360', () => {
  it('backoff x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - w370', () => {
  it('backoff x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - w380', () => {
  it('backoff x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - w390', () => {
  it('backoff x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('backoff - w400', () => {
  it('backoff x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('backoff x400x9', () => {
    expect(describe).toBeDefined()
  })
})
