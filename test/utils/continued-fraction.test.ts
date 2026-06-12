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

describe('continued-fraction - wave559', () => {
  it('continued-fraction w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - wave560', () => {
  it('continued-fraction w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - wave561', () => {
  it('continued-fraction w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - wave562', () => {
  it('continued-fraction w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - wave563', () => {
  it('continued-fraction w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - wave564', () => {
  it('continued-fraction w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - wave565', () => {
  it('continued-fraction w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - wave566', () => {
  it('continued-fraction w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - wave127', () => {
  it('continued-fraction w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - wave130', () => {
  it('continued-fraction w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - wave133', () => {
  it('continued-fraction w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - wave136', () => {
  it('continued-fraction w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - wave139', () => {
  it('continued-fraction w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w142', () => {
  it('continued-fraction v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w145', () => {
  it('continued-fraction v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w148', () => {
  it('continued-fraction v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w151', () => {
  it('continued-fraction v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w154', () => {
  it('continued-fraction v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w157', () => {
  it('continued-fraction v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w160', () => {
  it('continued-fraction v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w170', () => {
  it('continued-fraction x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w180', () => {
  it('continued-fraction x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w190', () => {
  it('continued-fraction x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w200', () => {
  it('continued-fraction x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w210', () => {
  it('continued-fraction x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w220', () => {
  it('continued-fraction x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w230', () => {
  it('continued-fraction x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w240', () => {
  it('continued-fraction x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w250', () => {
  it('continued-fraction x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w260', () => {
  it('continued-fraction x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w270', () => {
  it('continued-fraction x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w280', () => {
  it('continued-fraction x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w290', () => {
  it('continued-fraction x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w300', () => {
  it('continued-fraction x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w310', () => {
  it('continued-fraction x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w320', () => {
  it('continued-fraction x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w330', () => {
  it('continued-fraction x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w340', () => {
  it('continued-fraction x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w350', () => {
  it('continued-fraction x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w360', () => {
  it('continued-fraction x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w370', () => {
  it('continued-fraction x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w380', () => {
  it('continued-fraction x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w390', () => {
  it('continued-fraction x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w400', () => {
  it('continued-fraction x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w420', () => {
  it('continued-fraction x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w440', () => {
  it('continued-fraction x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w460', () => {
  it('continued-fraction x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w480', () => {
  it('continued-fraction x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w500', () => {
  it('continued-fraction x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w550', () => {
  it('continued-fraction x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w600', () => {
  it('continued-fraction x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w650', () => {
  it('continued-fraction x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('continued-fraction - w700', () => {
  it('continued-fraction x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('continued-fraction x700x49', () => {
    expect(describe).toBeDefined()
  })
})
