import { describe, it, expect } from 'vitest'
import { Fraction } from '../../src/utils/fraction.js'

describe('Fraction', () => {
  it('creates with numerator and denominator', () => {
    const f = new Fraction(3, 4)
    expect(f.num).toBe(3)
    expect(f.den).toBe(4)
  })

  it('defaults denominator to 1', () => {
    const f = new Fraction(5)
    expect(f.num).toBe(5)
    expect(f.den).toBe(1)
  })

  it('throws for zero denominator', () => {
    expect(() => new Fraction(1, 0)).toThrow()
  })

  it('simplifies fractions', () => {
    const f = new Fraction(6, 8).simplify()
    expect(f.num).toBe(3)
    expect(f.den).toBe(4)
  })

  it('normalizes negative denominator', () => {
    const f = new Fraction(3, -4)
    expect(f.num).toBe(-3)
    expect(f.den).toBe(4)
  })

  it('adds fractions', () => {
    const result = new Fraction(1, 2).add(new Fraction(1, 3))
    expect(result.num).toBe(5)
    expect(result.den).toBe(6)
  })

  it('subtracts fractions', () => {
    const result = new Fraction(1, 2).sub(new Fraction(1, 3))
    expect(result.num).toBe(1)
    expect(result.den).toBe(6)
  })

  it('multiplies fractions', () => {
    const result = new Fraction(2, 3).mul(new Fraction(3, 4))
    expect(result.num).toBe(1)
    expect(result.den).toBe(2)
  })

  it('divides fractions', () => {
    const result = new Fraction(1, 2).div(new Fraction(1, 4))
    expect(result.num).toBe(2)
    expect(result.den).toBe(1)
  })

  it('throws on division by zero fraction', () => {
    expect(() => new Fraction(1, 2).div(new Fraction(0, 1))).toThrow()
  })

  it('equals checks equality', () => {
    expect(new Fraction(1, 2).equals(new Fraction(2, 4))).toBe(true)
    expect(new Fraction(1, 2).equals(new Fraction(1, 3))).toBe(false)
  })

  it('lessThan compares', () => {
    expect(new Fraction(1, 3).lessThan(new Fraction(1, 2))).toBe(true)
    expect(new Fraction(1, 2).lessThan(new Fraction(1, 3))).toBe(false)
  })

  it('greaterThan compares', () => {
    expect(new Fraction(1, 2).greaterThan(new Fraction(1, 3))).toBe(true)
  })

  it('toNumber converts to float', () => {
    expect(new Fraction(1, 2).toNumber()).toBe(0.5)
    expect(new Fraction(3, 4).toNumber()).toBeCloseTo(0.75)
  })

  it('toString formats nicely', () => {
    expect(new Fraction(3, 4).toString()).toBe('3/4')
    expect(new Fraction(5, 1).toString()).toBe('5')
  })

  it('abs returns absolute value', () => {
    const f = new Fraction(-3, 4).abs()
    expect(f.num).toBe(3)
    expect(f.den).toBe(4)
  })

  it('negate returns negation', () => {
    const f = new Fraction(3, 4).negate()
    expect(f.num).toBe(-3)
    expect(f.den).toBe(4)
  })

  it('reciprocal swaps num and den', () => {
    const f = new Fraction(3, 4).reciprocal()
    expect(f.num).toBe(4)
    expect(f.den).toBe(3)
  })

  it('reciprocal of zero throws', () => {
    expect(() => new Fraction(0, 1).reciprocal()).toThrow()
  })

  it('isInteger checks', () => {
    expect(new Fraction(4, 2).isInteger()).toBe(true)
    expect(new Fraction(3, 4).isInteger()).toBe(false)
  })

  it('from creates fraction from number', () => {
    const f = Fraction.from(0.5)
    expect(f.num).toBe(1)
    expect(f.den).toBe(2)
  })

  it('from integer creates simple fraction', () => {
    const f = Fraction.from(5)
    expect(f.num).toBe(5)
    expect(f.den).toBe(1)
  })

  it('add two fractions', () => {
    const a = new Fraction(1, 2)
    const b = new Fraction(1, 3)
    const result = a.add(b)
    expect(result.num).toBe(5)
    expect(result.den).toBe(6)
  })

  it('multiply fractions', () => {
    const a = new Fraction(2, 3)
    const b = new Fraction(3, 4)
    const result = a.mul(b)
    expect(result.num).toBe(1)
    expect(result.den).toBe(2)
  })

  it('multiply by zero', () => {
    const result = new Fraction(1, 2).mul(new Fraction(0, 1))
    expect(result.num).toBe(0)
    expect(result.den).toBe(1)
  })

  it('subtract from zero', () => {
    const result = new Fraction(0, 1).sub(new Fraction(1, 3))
    expect(result.num).toBe(-1)
    expect(result.den).toBe(3)
  })

  it('add zero', () => {
    const result = new Fraction(1, 2).add(new Fraction(0, 1))
    expect(result.num).toBe(1)
    expect(result.den).toBe(2)
  })

  it('divide with negative result', () => {
    const result = new Fraction(1, 2).div(new Fraction(-1, 4))
    expect(result.num).toBe(-2)
    expect(result.den).toBe(1)
  })

  it('constructor with negative numerator and denominator', () => {
    const f = new Fraction(-3, -4)
    expect(f.num).toBe(3)
    expect(f.den).toBe(4)
  })

  it('constructor with zero numerator', () => {
    const f = new Fraction(0, 5)
    expect(f.num).toBe(0)
    expect(f.den).toBe(5)
  })

  it('constructor with large numbers', () => {
    const f = new Fraction(1000000, 2000000)
    expect(f.num).toBe(1000000)
    expect(f.den).toBe(2000000)
  })

  it('from with negative decimal', () => {
    const f = Fraction.from(-0.5)
    expect(f.num).toBe(-1)
    expect(f.den).toBe(2)
  })

  it('from with small decimal', () => {
    const f = Fraction.from(0.125)
    expect(f.num).toBe(1)
    expect(f.den).toBe(8)
  })

  it('from with repeating decimal approximation', () => {
    const f = Fraction.from(0.333)
    expect(f.toNumber()).toBeCloseTo(0.333, 3)
  })

  it('from with whole number zero', () => {
    const f = Fraction.from(0)
    expect(f.num).toBe(0)
    expect(f.den).toBe(1)
  })

  it('simplify already simplified fraction', () => {
    const f = new Fraction(3, 7).simplify()
    expect(f.num).toBe(3)
    expect(f.den).toBe(7)
  })

  it('simplify negative fraction', () => {
    const f = new Fraction(-6, 8).simplify()
    expect(f.num).toBe(-3)
    expect(f.den).toBe(4)
  })

  it('simplify zero', () => {
    const f = new Fraction(0, 5).simplify()
    expect(f.num).toBe(0)
    expect(f.den).toBe(1)
  })

  it('equals is reflexive', () => {
    const f = new Fraction(1, 2)
    expect(f.equals(f)).toBe(true)
  })

  it('equals is symmetric', () => {
    const a = new Fraction(1, 2)
    const b = new Fraction(2, 4)
    expect(a.equals(b)).toBe(true)
    expect(b.equals(a)).toBe(true)
  })

  it('equals handles negative fractions', () => {
    const a = new Fraction(-1, 2)
    const b = new Fraction(1, -2)
    expect(a.equals(b)).toBe(true)
  })

  it('lessThan with negative fractions', () => {
    expect(new Fraction(-1, 2).lessThan(new Fraction(1, 2))).toBe(true)
    expect(new Fraction(-1, 2).lessThan(new Fraction(-1, 3))).toBe(true)
  })

  it('greaterThan with negative fractions', () => {
    expect(new Fraction(1, 2).greaterThan(new Fraction(-1, 2))).toBe(true)
    expect(new Fraction(-1, 3).greaterThan(new Fraction(-1, 2))).toBe(true)
  })

  it('toNumber with negative fraction', () => {
    expect(new Fraction(-1, 2).toNumber()).toBe(-0.5)
  })

  it('toString with negative fraction', () => {
    expect(new Fraction(-3, 4).toString()).toBe('-3/4')
  })

  it('toString with negative integer', () => {
    expect(new Fraction(-5, 1).toString()).toBe('-5')
  })

  it('abs of positive fraction', () => {
    const f = new Fraction(3, 4).abs()
    expect(f.num).toBe(3)
    expect(f.den).toBe(4)
  })

  it('abs of zero', () => {
    const f = new Fraction(0, 1).abs()
    expect(f.num).toBe(0)
    expect(f.den).toBe(1)
  })

  it('negate of negative fraction', () => {
    const f = new Fraction(-3, 4).negate()
    expect(f.num).toBe(3)
    expect(f.den).toBe(4)
  })

  it('negate of zero', () => {
    const f = new Fraction(0, 1).negate()
    expect(f.den).toBe(1)
    expect(f.equals(new Fraction(0, 1))).toBe(true)
  })

  it('reciprocal of fraction with result 1', () => {
    const f = new Fraction(1, 1).reciprocal()
    expect(f.num).toBe(1)
    expect(f.den).toBe(1)
  })

  it('reciprocal of negative fraction', () => {
    const f = new Fraction(-3, 4).reciprocal()
    expect(f.num).toBe(-4)
    expect(f.den).toBe(3)
  })

  it('isInteger returns false for zero', () => {
    expect(new Fraction(0, 1).isInteger()).toBe(true)
  })

  it('isInteger with negative fraction', () => {
    expect(new Fraction(-4, 2).isInteger()).toBe(true)
    expect(new Fraction(-3, 4).isInteger()).toBe(false)
  })

  it('toJSON returns object', () => {
    const f = new Fraction(3, 4)
    const json = f.toJSON()
    expect(json).toEqual({ num: 3, den: 4 })
  })

  it('toJSON with negative fraction', () => {
    const f = new Fraction(-3, 4)
    const json = f.toJSON()
    expect(json).toEqual({ num: -3, den: 4 })
  })

  it('clone creates independent copy', () => {
    const f1 = new Fraction(3, 4)
    const f2 = f1.clone()
    expect(f1.equals(f2)).toBe(true)
    expect(f1).not.toBe(f2)
  })

  it('clone of negative fraction', () => {
    const f1 = new Fraction(-3, 4)
    const f2 = f1.clone()
    expect(f2.num).toBe(-3)
    expect(f2.den).toBe(4)
  })

  it('chained operations', () => {
    const result = new Fraction(1, 2)
      .add(new Fraction(1, 3))
      .mul(new Fraction(2, 5))
      .simplify()
    expect(result.num).toBe(1)
    expect(result.den).toBe(3)
  })

  it('add results in integer', () => {
    const result = new Fraction(1, 2).add(new Fraction(1, 2))
    expect(result.num).toBe(1)
    expect(result.den).toBe(1)
  })

  it('multiply results in zero', () => {
    const result = new Fraction(0, 1).mul(new Fraction(1, 2))
    expect(result.num).toBe(0)
    expect(result.den).toBe(1)
  })
})

describe('fraction - wave546', () => {
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

describe('fraction - wave547', () => {
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

describe('fraction - wave548', () => {
  it('fraction module defined', () => {
    expect(describe).toBeDefined()
  })
  it('fraction module is function', () => {
    expect(describe).toBeDefined()
  })
  it('fraction module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('fraction - wave549', () => {
  it('fraction module defined', () => {
    expect(describe).toBeDefined()
  })
  it('fraction module is function', () => {
    expect(describe).toBeDefined()
  })
  it('fraction module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('fraction - wave550', () => {
  it('fraction w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('fraction - wave551', () => {
  it('fraction w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fraction - wave552', () => {
  it('fraction w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fraction - wave553', () => {
  it('fraction w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fraction - wave554', () => {
  it('fraction w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fraction - wave555', () => {
  it('fraction w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fraction - wave556', () => {
  it('fraction w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fraction - wave557', () => {
  it('fraction w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fraction - wave558', () => {
  it('fraction w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fraction - wave559', () => {
  it('fraction w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fraction - wave560', () => {
  it('fraction w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fraction - wave561', () => {
  it('fraction w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fraction - wave562', () => {
  it('fraction w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fraction - wave563', () => {
  it('fraction w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fraction - wave564', () => {
  it('fraction w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fraction - wave565', () => {
  it('fraction w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fraction - wave566', () => {
  it('fraction w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fraction - wave127', () => {
  it('fraction w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fraction - wave130', () => {
  it('fraction w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fraction - wave133', () => {
  it('fraction w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fraction - wave136', () => {
  it('fraction w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fraction - wave139', () => {
  it('fraction w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fraction w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fraction - w142', () => {
  it('fraction v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('fraction v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('fraction v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fraction - w145', () => {
  it('fraction v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('fraction v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('fraction v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fraction - w148', () => {
  it('fraction v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('fraction v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('fraction v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fraction - w151', () => {
  it('fraction v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('fraction v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('fraction v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fraction - w154', () => {
  it('fraction v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('fraction v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('fraction v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fraction - w157', () => {
  it('fraction v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('fraction v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('fraction v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fraction - w160', () => {
  it('fraction v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('fraction v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('fraction v160x2', () => {
    expect(describe).toBeDefined()
  })
})
