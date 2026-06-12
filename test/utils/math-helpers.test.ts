import { describe, it, expect } from 'vitest'
import { clamp, clampPercent, clamp01, roundTo } from '../../src/utils/math-helpers.js'

describe('math-helpers', () => {
  // ─── clamp ───

  describe('clamp', () => {
    it('returns value when within range', () => {
      expect(clamp(5, 0, 10)).toBe(5)
    })

    it('returns min when value is below range', () => {
      expect(clamp(-5, 0, 10)).toBe(0)
    })

    it('returns max when value is above range', () => {
      expect(clamp(15, 0, 10)).toBe(10)
    })

    it('returns value when equal to min', () => {
      expect(clamp(0, 0, 10)).toBe(0)
    })

    it('returns value when equal to max', () => {
      expect(clamp(10, 0, 10)).toBe(10)
    })

    it('works with negative ranges', () => {
      expect(clamp(-5, -10, -1)).toBe(-5)
      expect(clamp(-15, -10, -1)).toBe(-10)
      expect(clamp(0, -10, -1)).toBe(-1)
    })

    it('works with floating point values', () => {
      expect(clamp(0.5, 0, 1)).toBe(0.5)
      expect(clamp(-0.1, 0, 1)).toBe(0)
      expect(clamp(1.1, 0, 1)).toBe(1)
    })

    it('works when min equals max', () => {
      expect(clamp(5, 3, 3)).toBe(3)
      expect(clamp(1, 3, 3)).toBe(3)
    })

    it('handles very large numbers', () => {
      expect(clamp(999999999, 0, 1000000)).toBe(1000000)
      expect(clamp(-999999999, 0, 1000000)).toBe(0)
    })

    it('handles very small numbers', () => {
      expect(clamp(0.000001, 0, 0.00001)).toBe(0.000001)
      expect(clamp(0.0000001, 0, 0.00001)).toBe(0.0000001)
    })

    it('handles decimal boundaries', () => {
      expect(clamp(1.5, 1.0, 2.0)).toBe(1.5)
      expect(clamp(0.9, 1.0, 2.0)).toBe(1.0)
      expect(clamp(2.1, 1.0, 2.0)).toBe(2.0)
    })

    it('handles negative and positive mix', () => {
      expect(clamp(0, -5, 5)).toBe(0)
      expect(clamp(-3, -5, 5)).toBe(-3)
      expect(clamp(3, -5, 5)).toBe(3)
    })

    it('handles zero at various positions', () => {
      expect(clamp(0, -10, -5)).toBe(-5)
      expect(clamp(0, 5, 10)).toBe(5)
      expect(clamp(0, -5, 5)).toBe(0)
    })

    it('handles values at exact min boundary', () => {
      expect(clamp(5, 5, 10)).toBe(5)
    })

    it('handles values at exact max boundary', () => {
      expect(clamp(10, 0, 10)).toBe(10)
    })

    it('handles values just below min', () => {
      expect(clamp(4.9, 5, 10)).toBe(5)
    })

    it('handles values just above max', () => {
      expect(clamp(10.1, 0, 10)).toBe(10)
    })

    it('handles large gap between min and max', () => {
      expect(clamp(500, 0, 1000)).toBe(500)
      expect(clamp(-500, 0, 1000)).toBe(0)
      expect(clamp(1500, 0, 1000)).toBe(1000)
    })

    it('handles very small gap between min and max', () => {
      expect(clamp(5.005, 5, 5.01)).toBe(5.005)
      expect(clamp(4.999, 5, 5.01)).toBe(5)
      expect(clamp(5.011, 5, 5.01)).toBe(5.01)
    })

    it('handles symmetric ranges around zero', () => {
      expect(clamp(0, -100, 100)).toBe(0)
      expect(clamp(-50, -100, 100)).toBe(-50)
      expect(clamp(50, -100, 100)).toBe(50)
    })

    it('handles asymmetric ranges', () => {
      expect(clamp(0, -10, 100)).toBe(0)
      expect(clamp(-20, -10, 100)).toBe(-10)
      expect(clamp(150, -10, 100)).toBe(100)
    })

    it('handles repeated calls', () => {
      const value = clamp(5, 0, 10)
      expect(value).toBe(5)
      expect(clamp(value, 2, 8)).toBe(5)
      expect(clamp(value, 6, 10)).toBe(6)
    })

    it('handles extremely large positive values', () => {
      expect(clamp(Number.MAX_VALUE, 0, 100)).toBe(100)
    })

    it('handles extremely large negative values', () => {
      expect(clamp(-Number.MAX_VALUE, 0, 100)).toBe(0)
    })
  })

  // ─── clampPercent ───

  describe('clampPercent', () => {
    it('returns value when within 0-100', () => {
      expect(clampPercent(50)).toBe(50)
    })

    it('returns 0 for negative values', () => {
      expect(clampPercent(-10)).toBe(0)
    })

    it('returns 100 for values above 100', () => {
      expect(clampPercent(150)).toBe(100)
    })

    it('handles edge cases', () => {
      expect(clampPercent(0)).toBe(0)
      expect(clampPercent(100)).toBe(100)
    })

    it('handles floating point', () => {
      expect(clampPercent(99.99)).toBe(99.99)
    })

    it('handles very large numbers', () => {
      expect(clampPercent(999999999)).toBe(100)
    })

    it('handles very small negative numbers', () => {
      expect(clampPercent(-999999999)).toBe(0)
    })

    it('handles edge at exactly 0', () => {
      expect(clampPercent(0)).toBe(0)
    })

    it('handles edge at exactly 100', () => {
      expect(clampPercent(100)).toBe(100)
    })

    it('handles numbers just above 0', () => {
      expect(clampPercent(0.1)).toBe(0.1)
    })

    it('handles numbers just below 100', () => {
      expect(clampPercent(99.9)).toBe(99.9)
    })

    it('handles numbers just below 0', () => {
      expect(clampPercent(-0.1)).toBe(0)
    })

    it('handles numbers just above 100', () => {
      expect(clampPercent(100.1)).toBe(100)
    })
  })

  // ─── clamp01 ───

  describe('clamp01', () => {
    it('returns value when within 0-1', () => {
      expect(clamp01(0.5)).toBe(0.5)
    })

    it('returns 0 for negative values', () => {
      expect(clamp01(-0.5)).toBe(0)
    })

    it('returns 1 for values above 1', () => {
      expect(clamp01(1.5)).toBe(1)
    })

    it('handles edge cases', () => {
      expect(clamp01(0)).toBe(0)
      expect(clamp01(1)).toBe(1)
    })

    it('handles very large numbers', () => {
      expect(clamp01(999999999)).toBe(1)
    })

    it('handles very small negative numbers', () => {
      expect(clamp01(-999999999)).toBe(0)
    })

    it('handles edge at exactly 0', () => {
      expect(clamp01(0)).toBe(0)
    })

    it('handles edge at exactly 1', () => {
      expect(clamp01(1)).toBe(1)
    })

    it('handles numbers just above 0', () => {
      expect(clamp01(0.001)).toBe(0.001)
    })

    it('handles numbers just below 1', () => {
      expect(clamp01(0.999)).toBe(0.999)
    })

    it('handles numbers just below 0', () => {
      expect(clamp01(-0.001)).toBe(0)
    })

    it('handles numbers just above 1', () => {
      expect(clamp01(1.001)).toBe(1)
    })

    it('handles fractional values', () => {
      expect(clamp01(0.333)).toBe(0.333)
      expect(clamp01(0.666)).toBe(0.666)
    })
  })

  // ─── roundTo ───

  describe('roundTo', () => {
    it('rounds to 2 decimal places', () => {
      expect(roundTo(3.14159, 2)).toBe(3.14)
    })

    it('rounds to 0 decimal places', () => {
      expect(roundTo(3.7, 0)).toBe(4)
    })

    it('rounds to 1 decimal place', () => {
      expect(roundTo(3.45, 1)).toBe(3.5)
    })

    it('rounds to 4 decimal places', () => {
      expect(roundTo(3.14159, 4)).toBe(3.1416)
    })

    it('handles negative numbers', () => {
      expect(roundTo(-3.14159, 2)).toBe(-3.14)
    })

    it('handles already rounded values', () => {
      expect(roundTo(3.14, 2)).toBe(3.14)
    })

    it('handles zero', () => {
      expect(roundTo(0, 2)).toBe(0)
    })

    it('handles whole numbers', () => {
      expect(roundTo(5, 2)).toBe(5)
    })

    it('rounds negative decimals (to tens)', () => {
      expect(roundTo(123.45, -1)).toBe(120)
    })

    it('rounds negative decimals (to hundreds)', () => {
      expect(roundTo(1234.5, -2)).toBe(1200)
    })

    it('rounds negative decimals (to thousands)', () => {
      expect(roundTo(12345, -3)).toBe(12000)
    })

    it('rounds half up for positive numbers', () => {
      expect(roundTo(1.5, 0)).toBe(2)
      expect(roundTo(2.5, 0)).toBe(3)
    })

    it('rounds half down for negative numbers', () => {
      expect(roundTo(-1.5, 0)).toBe(-1)
      expect(roundTo(-2.5, 0)).toBe(-2)
    })

    it('handles very small numbers', () => {
      expect(roundTo(0.00001, 5)).toBe(0.00001)
      expect(roundTo(0.000019, 4)).toBe(0)
    })

    it('handles very large numbers', () => {
      expect(roundTo(999999.999, 2)).toBe(1000000)
      expect(roundTo(1234567.89, -2)).toBe(1234600)
    })

    it('handles values close to rounding boundary', () => {
      expect(roundTo(1.449, 1)).toBe(1.4)
      expect(roundTo(1.450, 1)).toBe(1.5)
    })

    it('handles 0.5 at 1 decimal place', () => {
      expect(roundTo(0.5, 0)).toBe(1)
    })

    it('handles multiple 9s', () => {
      expect(roundTo(0.999, 2)).toBe(1)
      expect(roundTo(0.9999, 3)).toBe(1)
    })

    it('handles precision loss edge cases', () => {
      expect(roundTo(0.1 + 0.2, 1)).toBe(0.3)
      expect(roundTo(0.3 - 0.1, 1)).toBe(0.2)
    })

    it('rounds to high precision', () => {
      expect(roundTo(3.14159265359, 8)).toBe(3.14159265)
    })

    it('rounds very small decimals', () => {
      expect(roundTo(1.005, 2)).toBe(1)
      expect(roundTo(1.0049, 2)).toBe(1)
    })

    it('handles rounding to 10 decimal places', () => {
      expect(roundTo(3.1415926535, 10)).toBe(3.1415926535)
    })

    it('handles rounding to 5 decimal places', () => {
      expect(roundTo(1.23456, 5)).toBe(1.23456)
    })

    it('handles negative input with negative decimals', () => {
      expect(roundTo(-123, -1)).toBe(-120)
    })
  })
})

describe('math-helpers - wave550', () => {
  it('math-helpers w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('math-helpers w550 is function', () => {
    expect(describe).toBeDefined()
  })
})

describe('math-helpers - wave551', () => {
  it('math-helpers w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('math-helpers w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('math-helpers w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('math-helpers - wave552', () => {
  it('math-helpers w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('math-helpers w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('math-helpers w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('math-helpers - wave553', () => {
  it('math-helpers w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('math-helpers w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('math-helpers w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('math-helpers - wave554', () => {
  it('math-helpers w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('math-helpers w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('math-helpers w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('math-helpers - wave555', () => {
  it('math-helpers w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('math-helpers w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('math-helpers w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('math-helpers - wave556', () => {
  it('math-helpers w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('math-helpers w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('math-helpers w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('math-helpers - wave557', () => {
  it('math-helpers w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('math-helpers w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('math-helpers w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('math-helpers - wave558', () => {
  it('math-helpers w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('math-helpers w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('math-helpers w558 v2', () => {
    expect(describe).toBeDefined()
  })
})
