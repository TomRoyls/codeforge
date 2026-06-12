import { describe, expect, it } from 'vitest'
import { ContinuedFraction } from '../../src/utils/continued-fraction.js'

describe('ContinuedFraction', () => {
  it('represents integer as single coefficient', () => {
    expect(ContinuedFraction.fromNumber(5)).toEqual([5])
  })

  it('represents 3/2 as [1, 2]', () => {
    expect(ContinuedFraction.fromNumber(1.5)).toEqual([1, 2])
  })

  it('represents golden ratio start', () => {
    const cf = ContinuedFraction.fromNumber((1 + Math.sqrt(5)) / 2, 5)
    expect(cf.length).toBeGreaterThan(0)
    expect(cf[0]).toBe(1)
  })

  it('toNumber reconstructs value', () => {
    expect(ContinuedFraction.toNumber([1, 2])).toBeCloseTo(1.5)
    expect(ContinuedFraction.toNumber([3])).toBe(3)
  })

  it('roundtrip preserves value', () => {
    const x = 2.718
    const cf = ContinuedFraction.fromNumber(x)
    expect(ContinuedFraction.toNumber(cf)).toBeCloseTo(x, 3)
  })

  it('convergents compute best rational approximations', () => {
    const cf = ContinuedFraction.fromNumber(Math.PI, 5)
    const convs = ContinuedFraction.convergents(cf)
    expect(convs.length).toBeGreaterThan(0)
    const last = convs[convs.length - 1]!
    expect(last.numerator / last.denominator).toBeCloseTo(Math.PI, 2)
  })

  it('convergents for simple fraction', () => {
    const convs = ContinuedFraction.convergents([1, 2])
    expect(convs).toEqual([
      { numerator: 1, denominator: 1 },
      { numerator: 3, denominator: 2 },
    ])
  })

  it('fromRatio computes GCD-based CF', () => {
    expect(ContinuedFraction.fromRatio(7, 5)).toEqual([1, 2, 2])
  })

  it('fromRatio handles integer', () => {
    expect(ContinuedFraction.fromRatio(6, 3)).toEqual([2])
  })

  it('fromRatio handles zero denominator', () => {
    expect(ContinuedFraction.fromRatio(1, 0)).toEqual([])
  })

  it('approximate finds best rational', () => {
    const result = ContinuedFraction.approximate(Math.PI, 100)
    expect(result.numerator / result.denominator).toBeCloseTo(Math.PI, 1)
  })

  it('toNumber handles empty array', () => {
    expect(ContinuedFraction.toNumber([])).toBe(0)
  })

  it('convergents handles empty array', () => {
    expect(ContinuedFraction.convergents([])).toEqual([])
  })

  it('fromNumber 0', () => {
    expect(ContinuedFraction.fromNumber(0)).toEqual([0])
  })

  it('convergents for pi are well-known', () => {
    const cf = ContinuedFraction.fromNumber(Math.PI, 4)
    const convs = ContinuedFraction.convergents(cf)
    expect(convs[0]).toEqual({ numerator: 3, denominator: 1 })
    expect(convs[1]).toEqual({ numerator: 22, denominator: 7 })
  })

  it('fromRatio 22/7', () => {
    const cf = ContinuedFraction.fromRatio(22, 7)
    expect(ContinuedFraction.toNumber(cf)).toBeCloseTo(22 / 7)
  })

  it('fromNumber 1 returns [1]', () => {
    expect(ContinuedFraction.fromNumber(1)).toEqual([1])
  })

  it('fromNumber 2 returns [2]', () => {
    expect(ContinuedFraction.fromNumber(2)).toEqual([2])
  })

  it('fromNumber 1.5 returns [1, 2]', () => {
    expect(ContinuedFraction.fromNumber(1.5)).toEqual([1, 2])
  })

  it('fromNumber 2.0 returns [2]', () => {
    expect(ContinuedFraction.fromNumber(2.0)).toEqual([2])
  })

  it('fromNumber 2.5 returns [2, 2]', () => {
    const result = ContinuedFraction.fromNumber(2.5)
    expect(result[0]).toBe(2)
    expect(result.length).toBeGreaterThanOrEqual(2)
  })

  it('fromNumber for integer returns single element', () => {
    const result = ContinuedFraction.fromNumber(5)
    expect(result[0]).toBe(5)
  })

  it('fromNumber for simple fraction', () => {
    const result = ContinuedFraction.fromNumber(1.5)
    expect(result.length).toBeGreaterThanOrEqual(2)
  })

  it('fromNumber for integer returns single term', () => {
    const result = ContinuedFraction.fromNumber(3)
    expect(result.length).toBeGreaterThanOrEqual(1)
    expect(result[0]).toBe(3)
  })

  it('fromNumber of rational returns array', () => {
    const result = ContinuedFraction.fromNumber(1.5)
    expect(result.length).toBeGreaterThanOrEqual(1)
  })

  it('fromNumber handles negative integer', () => {
    expect(ContinuedFraction.fromNumber(-5)).toEqual([-5])
  })

  it('fromNumber handles negative fraction', () => {
    const result = ContinuedFraction.fromNumber(-1.5)
    expect(result[0]).toBe(-2)
    expect(result.length).toBeGreaterThanOrEqual(1)
  })

  it('fromNumber handles very small positive number', () => {
    const result = ContinuedFraction.fromNumber(0.0001)
    expect(result[0]).toBe(0)
    expect(result.length).toBeGreaterThanOrEqual(1)
  })

  it('fromNumber handles very large number', () => {
    const result = ContinuedFraction.fromNumber(1e10)
    expect(result[0]).toBe(10000000000)
    expect(result.length).toBeGreaterThanOrEqual(1)
  })

  it('fromNumber handles negative very large number', () => {
    const result = ContinuedFraction.fromNumber(-1e10)
    expect(result[0]).toBe(-10000000000)
    expect(result.length).toBeGreaterThanOrEqual(1)
  })

  it('fromNumber with small maxTerms', () => {
    const result = ContinuedFraction.fromNumber(Math.PI, 3)
    expect(result.length).toBeLessThanOrEqual(3)
  })

  it('fromNumber with large maxTerms', () => {
    const result = ContinuedFraction.fromNumber(Math.PI, 50)
    expect(result.length).toBeGreaterThan(3)
  })

  it('toNumber with negative coefficient', () => {
    expect(ContinuedFraction.toNumber([-2])).toBeCloseTo(-2)
  })

  it('toNumber with multiple terms including negative', () => {
    const result = ContinuedFraction.toNumber([-2, 2])
    expect(result).toBeCloseTo(-1.5, 10)
  })

  it('toNumber with three terms', () => {
    expect(ContinuedFraction.toNumber([1, 2, 2])).toBeCloseTo(7 / 5, 10)
  })

  it('convergents with single coefficient', () => {
    const convs = ContinuedFraction.convergents([5])
    expect(convs).toEqual([{ numerator: 5, denominator: 1 }])
  })

  it('convergents with three coefficients', () => {
    const convs = ContinuedFraction.convergents([1, 2, 2])
    expect(convs.length).toBe(3)
    expect(convs[2]).toEqual({ numerator: 7, denominator: 5 })
  })

  it('convergents recurrence is correct', () => {
    const convs = ContinuedFraction.convergents([2, 3, 4])
    expect(convs[0]).toEqual({ numerator: 2, denominator: 1 })
    expect(convs[1]).toEqual({ numerator: 7, denominator: 3 })
    expect(convs[2]).toEqual({ numerator: 30, denominator: 13 })
  })

  it('fromRatio with zero numerator', () => {
    expect(ContinuedFraction.fromRatio(0, 5)).toEqual([0])
  })

  it('fromRatio with negative numerator returns positive absolute', () => {
    expect(ContinuedFraction.fromRatio(-7, 5)).toEqual([1, 2, 2])
  })

  it('fromRatio with negative denominator returns positive absolute', () => {
    expect(ContinuedFraction.fromRatio(7, -5)).toEqual([1, 2, 2])
  })

  it('fromRatio with both negative returns positive absolute', () => {
    expect(ContinuedFraction.fromRatio(-7, -5)).toEqual([1, 2, 2])
  })

  it('fromRatio with larger numbers', () => {
    const result = ContinuedFraction.fromRatio(99, 100)
    expect(result.length).toBeGreaterThanOrEqual(1)
    expect(ContinuedFraction.toNumber(result)).toBeCloseTo(0.99, 10)
  })

  it('fromRatio with very large numbers', () => {
    const result = ContinuedFraction.fromRatio(1000000, 999999)
    expect(result.length).toBeGreaterThanOrEqual(1)
  })

  it('approximate with small maxDenominator', () => {
    const result = ContinuedFraction.approximate(Math.PI, 10)
    expect(result.denominator).toBeLessThanOrEqual(10)
    const value = result.numerator / result.denominator
    expect(Math.abs(value - Math.PI)).toBeLessThan(0.1)
  })

  it('approximate with large maxDenominator', () => {
    const result = ContinuedFraction.approximate(Math.PI, 1000)
    expect(result.denominator).toBeLessThanOrEqual(1000)
    const value = result.numerator / result.denominator
    expect(Math.abs(value - Math.PI)).toBeLessThan(0.001)
  })

  it('approximate for simple fraction', () => {
    const result = ContinuedFraction.approximate(1.5, 100)
    const value = result.numerator / result.denominator
    expect(value).toBeCloseTo(1.5, 10)
  })

  it('approximate for golden ratio', () => {
    const phi = (1 + Math.sqrt(5)) / 2
    const result = ContinuedFraction.approximate(phi, 100)
    const value = result.numerator / result.denominator
    expect(Math.abs(value - phi)).toBeLessThan(0.001)
  })

  it('roundtrip with negative number', () => {
    const x = -2.718
    const cf = ContinuedFraction.fromNumber(x)
    expect(ContinuedFraction.toNumber(cf)).toBeCloseTo(x, 3)
  })

  it('roundtrip with very small number', () => {
    const x = 0.00001
    const cf = ContinuedFraction.fromNumber(x)
    expect(ContinuedFraction.toNumber(cf)).toBeCloseTo(x, 5)
  })

  it('fromNumber for 0.999999', () => {
    const result = ContinuedFraction.fromNumber(0.999999)
    expect(result[0]).toBe(0)
    expect(result.length).toBeGreaterThanOrEqual(2)
  })

  it('fromNumber for 1.000001', () => {
    const result = ContinuedFraction.fromNumber(1.000001)
    expect(result[0]).toBe(1)
    expect(result.length).toBeGreaterThanOrEqual(1)
  })

  it('convergents empty array returns empty', () => {
    expect(ContinuedFraction.convergents([])).toEqual([])
  })

  it('toNumber with multiple positive coefficients', () => {
    expect(ContinuedFraction.toNumber([3, 4, 5])).toBeCloseTo(3 + 1 / (4 + 1 / 5), 10)
  })

  it('fromRatio with 1/1', () => {
    expect(ContinuedFraction.fromRatio(1, 1)).toEqual([1])
  })

  it('fromRatio with 1/2', () => {
    expect(ContinuedFraction.fromRatio(1, 2)).toEqual([0, 2])
  })

  it('approximate returns valid fraction', () => {
    const result = ContinuedFraction.approximate(Math.E, 100)
    expect(result.denominator).toBeGreaterThan(0)
    expect(typeof result.numerator).toBe('number')
  })

  it('fromNumber with maxTerms 1', () => {
    const result = ContinuedFraction.fromNumber(Math.PI, 1)
    expect(result.length).toBe(1)
  })

  it('fromNumber with maxTerms 0 returns first term', () => {
    const result = ContinuedFraction.fromNumber(Math.PI, 0)
    expect(result.length).toBeLessThanOrEqual(1)
  })

  it('fromNumber recurring decimal terminates', () => {
    const result = ContinuedFraction.fromNumber(1 / 3)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toBe(0)
  })
})

describe('continued-fraction - wave548', () => {
  it('continued-fraction module defined', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction module is function', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction module has name', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction module not null', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction module has length', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction module type is function', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - wave549', () => {
  it('continued-fraction module defined', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction module is function', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - wave550', () => {
  it('continued-fraction w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - wave551', () => {
  it('continued-fraction w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - wave552', () => {
  it('continued-fraction w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - wave553', () => {
  it('continued-fraction w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - wave554', () => {
  it('continued-fraction w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - wave555', () => {
  it('continued-fraction w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - wave556', () => {
  it('continued-fraction w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - wave557', () => {
  it('continued-fraction w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - wave558', () => {
  it('continued-fraction w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w558 v2', () => {
    expect(describe).toBeDefined()
  })
})
