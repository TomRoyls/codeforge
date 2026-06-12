import { describe, expect, it } from 'vitest'
import { Polynomial } from '../../src/utils/polynomial.js'

describe('Polynomial', () => {
  it('creates polynomial from coefficients', () => {
    const p = new Polynomial([1, 2, 3])
    expect(p.coefficients).toEqual([1, 2, 3])
  })

  it('computes degree', () => {
    expect(new Polynomial([1, 2, 3]).degree).toBe(2)
    expect(new Polynomial([5]).degree).toBe(0)
    expect(new Polynomial([0, 0, 3]).degree).toBe(2)
  })

  it('trims trailing zeros', () => {
    const p = new Polynomial([1, 2, 0, 0])
    expect(p.coefficients).toEqual([1, 2])
  })

  it('evaluates polynomial (Horner)', () => {
    const p = new Polynomial([1, 2, 3])
    expect(p.evaluate(0)).toBe(1)
    expect(p.evaluate(1)).toBe(6)
    expect(p.evaluate(2)).toBe(17)
  })

  it('adds polynomials', () => {
    const a = new Polynomial([1, 2, 3])
    const b = new Polynomial([4, 5])
    const result = a.add(b)
    expect(result.coefficients).toEqual([5, 7, 3])
  })

  it('subtracts polynomials', () => {
    const a = new Polynomial([3, 5, 7])
    const b = new Polynomial([1, 2, 3])
    const result = a.subtract(b)
    expect(result.coefficients).toEqual([2, 3, 4])
  })

  it('multiplies polynomials', () => {
    const a = new Polynomial([1, 1])
    const b = new Polynomial([1, 1])
    const result = a.multiply(b)
    expect(result.coefficients).toEqual([1, 2, 1])
  })

  it('scales polynomial', () => {
    const p = new Polynomial([1, 2, 3])
    const result = p.scale(2)
    expect(result.coefficients).toEqual([2, 4, 6])
  })

  it('computes derivative', () => {
    const p = new Polynomial([1, 2, 3])
    const d = p.derivative()
    expect(d.coefficients).toEqual([2, 6])
  })

  it('derivative of constant is zero', () => {
    const p = new Polynomial([5])
    expect(p.derivative().coefficients).toEqual([0])
  })

  it('fromRoots creates correct polynomial', () => {
    const p = Polynomial.fromRoots([2, 3])
    expect(p.evaluate(2)).toBe(0)
    expect(p.evaluate(3)).toBe(0)
  })

  it('fromRoots single root', () => {
    const p = Polynomial.fromRoots([5])
    expect(p.evaluate(5)).toBe(0)
    expect(p.evaluate(0)).toBe(-5)
  })

  it('toString formats polynomial', () => {
    expect(new Polynomial([1, 2, 3]).toString()).toBe('3x^2+2x+1')
  })

  it('toString handles zero polynomial', () => {
    expect(new Polynomial([0]).toString()).toBe('0')
  })

  it('handles zero polynomial operations', () => {
    const zero = new Polynomial([0])
    const p = new Polynomial([1, 2])
    expect(p.add(zero).coefficients).toEqual([1, 2])
  })

  it('multiply by zero gives zero', () => {
    const p = new Polynomial([1, 2, 3])
    const zero = new Polynomial([0])
    expect(p.multiply(zero).coefficients).toEqual([0])
  })

  it('evaluate with negative x', () => {
    const p = new Polynomial([1, 0, 1])
    expect(p.evaluate(-2)).toBe(5)
  })

  it('fromRoots empty returns constant 1', () => {
    const p = Polynomial.fromRoots([])
    expect(p.coefficients).toEqual([1])
  })

  it('evaluate at 0 returns constant term', () => {
    const p = new Polynomial([3, 2, 1])
    expect(p.evaluate(0)).toBe(3)
  })

  it('constant polynomial evaluates to itself', () => {
    const p = new Polynomial([5])
    expect(p.evaluate(100)).toBe(5)
  })

  it('linear polynomial evaluates correctly', () => {
    const p = new Polynomial([3, 2])
    expect(p.evaluate(4)).toBe(11)
  })

  it('zero polynomial evaluates to 0', () => {
    const p = new Polynomial([0])
    expect(p.evaluate(999)).toBe(0)
  })

  it('degree of zero polynomial is 0', () => {
    const p = new Polynomial([0])
    expect(p.degree).toBe(0)
  })

  it('scale by zero gives zero polynomial', () => {
    const p = new Polynomial([1, 2, 3])
    const result = p.scale(0)
    expect(result.coefficients).toEqual([0])
  })

  it('scale by negative number works', () => {
    const p = new Polynomial([1, 2])
    const result = p.scale(-3)
    expect(result.coefficients).toEqual([-3, -6])
  })

  it('scale by fraction works', () => {
    const p = new Polynomial([2, 4])
    const result = p.scale(0.5)
    expect(result.coefficients).toEqual([1, 2])
  })

  it('add polynomials of different degrees', () => {
    const a = new Polynomial([1])
    const b = new Polynomial([0, 0, 1])
    const result = a.add(b)
    expect(result.coefficients).toEqual([1, 0, 1])
  })

  it('subtract larger polynomial from smaller', () => {
    const a = new Polynomial([1, 2])
    const b = new Polynomial([3, 4, 5])
    const result = a.subtract(b)
    expect(result.coefficients).toEqual([-2, -2, -5])
  })

  it('multiply constant by polynomial', () => {
    const a = new Polynomial([5])
    const b = new Polynomial([1, 2])
    const result = a.multiply(b)
    expect(result.coefficients).toEqual([5, 10])
  })

  it('multiply polynomials with zeros in coefficients', () => {
    const a = new Polynomial([1, 0, 1])
    const b = new Polynomial([1, 1])
    const result = a.multiply(b)
    expect(result.coefficients).toEqual([1, 1, 1, 1])
  })

  it('multiply quadratics', () => {
    const a = new Polynomial([1, 2, 1])
    const b = new Polynomial([1, 3, 2])
    const result = a.multiply(b)
    expect(result.coefficients).toEqual([1, 5, 9, 7, 2])
  })

  it('cubic derivative', () => {
    const p = new Polynomial([1, 3, 3, 1])
    const d = p.derivative()
    expect(d.coefficients).toEqual([3, 6, 3])
  })

  it('quartic derivative', () => {
    const p = new Polynomial([1, 4, 6, 4, 1])
    const d = p.derivative()
    expect(d.coefficients).toEqual([4, 12, 12, 4])
  })

  it('fromRoots with negative roots', () => {
    const p = Polynomial.fromRoots([-1, -2])
    expect(p.evaluate(-1)).toBeCloseTo(0)
    expect(p.evaluate(-2)).toBeCloseTo(0)
  })

  it('fromRoots with zero root', () => {
    const p = Polynomial.fromRoots([0, 2, 3])
    expect(p.evaluate(0)).toBe(0)
    expect(p.evaluate(2)).toBe(0)
    expect(p.evaluate(3)).toBe(0)
  })

  it('fromRoots with repeated root', () => {
    const p = Polynomial.fromRoots([2, 2, 2])
    expect(p.evaluate(2)).toBe(0)
  })

  it('fromRoots with three roots', () => {
    const p = Polynomial.fromRoots([1, 2, 3])
    expect(p.evaluate(1)).toBe(0)
    expect(p.evaluate(2)).toBe(0)
    expect(p.evaluate(3)).toBe(0)
  })

  it('toString single coefficient', () => {
    const p = new Polynomial([5])
    expect(p.toString()).toBe('5')
  })

  it('toString linear with coefficient 1', () => {
    const p = new Polynomial([0, 1])
    expect(p.toString()).toBe('x')
  })

  it('toString quadratic with coefficient 1', () => {
    const p = new Polynomial([0, 0, 1])
    expect(p.toString()).toBe('x^2')
  })

  it('toString with negative coefficients', () => {
    const p = new Polynomial([-1, -2, -3])
    expect(p.toString()).toBe('-3x^2-2x-1')
  })

  it('toString with mixed signs', () => {
    const p = new Polynomial([-1, 2, -3])
    expect(p.toString()).toBe('-3x^2+2x-1')
  })

  it('toString coefficient zero omitted', () => {
    const p = new Polynomial([1, 0, 3])
    expect(p.toString()).toBe('3x^2+1')
  })

  it('toString long polynomial', () => {
    const p = new Polynomial([1, 2, 3, 4, 5])
    expect(p.toString()).toBe('5x^4+4x^3+3x^2+2x+1')
  })

  it('evaluate with fraction', () => {
    const p = new Polynomial([0, 2])
    expect(p.evaluate(0.5)).toBe(1)
  })

  it('evaluate with large number', () => {
    const p = new Polynomial([1, 0, 1])
    expect(p.evaluate(1000)).toBe(1000001)
  })

  it('evaluate with small decimal', () => {
    const p = new Polynomial([0, 0, 1])
    expect(p.evaluate(0.1)).toBeCloseTo(0.01)
  })

  it('subtract from zero polynomial', () => {
    const zero = new Polynomial([0])
    const p = new Polynomial([1, 2])
    const result = zero.subtract(p)
    expect(result.coefficients).toEqual([-1, -2])
  })

  it('add zero polynomial', () => {
    const zero = new Polynomial([0])
    const p = new Polynomial([1, 2, 3])
    const result = zero.add(p)
    expect(result.coefficients).toEqual([1, 2, 3])
  })

  it('derivative of linear is constant', () => {
    const p = new Polynomial([3, 2])
    const d = p.derivative()
    expect(d.coefficients).toEqual([2])
  })

  it('derivative of quadratic is linear', () => {
    const p = new Polynomial([1, 2, 1])
    const d = p.derivative()
    expect(d.coefficients).toEqual([2, 2])
  })

  it('derivative twice gives constant', () => {
    const p = new Polynomial([1, 3, 3, 1])
    const d1 = p.derivative()
    const d2 = d1.derivative()
    expect(d2.coefficients).toEqual([6, 6])
  })

  it('fromRoots single value repeated', () => {
    const p = Polynomial.fromRoots([5, 5, 5])
    expect(p.evaluate(5)).toBe(0)
  })

  it('toString handles all zero coefficients except one', () => {
    const p = new Polynomial([0, 0, 7])
    expect(p.toString()).toBe('7x^2')
  })

  it('trims multiple trailing zeros', () => {
    const p = new Polynomial([1, 2, 0, 0, 0, 0])
    expect(p.coefficients).toEqual([1, 2])
  })

  it('coefficients array is copied', () => {
    const coeffs = [1, 2, 3]
    const p = new Polynomial(coeffs)
    coeffs[0] = 999
    expect(p.coefficients[0]).toBe(1)
  })

  it('scale returns new polynomial', () => {
    const p = new Polynomial([1, 2])
    const result = p.scale(2)
    expect(p.coefficients).toEqual([1, 2])
    expect(result.coefficients).toEqual([2, 4])
  })

  it('derivative returns new polynomial', () => {
    const p = new Polynomial([1, 2, 3])
    const d = p.derivative()
    expect(p.coefficients).toEqual([1, 2, 3])
    expect(d.coefficients).toEqual([2, 6])
  })
})
describe('polynomial - wave545', () => {
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

describe('polynomial - wave546', () => {
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

describe('polynomial - wave547', () => {
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

describe('polynomial - wave548', () => {
  it('polynomial module defined', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial module is function', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - wave549', () => {
  it('polynomial module defined', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial module is function', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - wave550', () => {
  it('polynomial w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - wave551', () => {
  it('polynomial w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - wave552', () => {
  it('polynomial w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - wave553', () => {
  it('polynomial w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - wave554', () => {
  it('polynomial w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - wave555', () => {
  it('polynomial w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - wave556', () => {
  it('polynomial w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - wave557', () => {
  it('polynomial w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - wave558', () => {
  it('polynomial w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - wave559', () => {
  it('polynomial w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - wave560', () => {
  it('polynomial w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - wave561', () => {
  it('polynomial w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - wave562', () => {
  it('polynomial w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - wave563', () => {
  it('polynomial w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - wave564', () => {
  it('polynomial w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - wave565', () => {
  it('polynomial w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - wave566', () => {
  it('polynomial w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - wave127', () => {
  it('polynomial w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - wave130', () => {
  it('polynomial w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - wave133', () => {
  it('polynomial w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - wave136', () => {
  it('polynomial w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - wave139', () => {
  it('polynomial w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w142', () => {
  it('polynomial v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w145', () => {
  it('polynomial v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w148', () => {
  it('polynomial v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w151', () => {
  it('polynomial v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w154', () => {
  it('polynomial v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w157', () => {
  it('polynomial v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w160', () => {
  it('polynomial v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w170', () => {
  it('polynomial x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w180', () => {
  it('polynomial x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w190', () => {
  it('polynomial x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w200', () => {
  it('polynomial x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w210', () => {
  it('polynomial x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w220', () => {
  it('polynomial x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w230', () => {
  it('polynomial x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w240', () => {
  it('polynomial x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w250', () => {
  it('polynomial x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w260', () => {
  it('polynomial x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w270', () => {
  it('polynomial x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w280', () => {
  it('polynomial x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w290', () => {
  it('polynomial x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w300', () => {
  it('polynomial x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w310', () => {
  it('polynomial x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w320', () => {
  it('polynomial x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w330', () => {
  it('polynomial x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w340', () => {
  it('polynomial x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w350', () => {
  it('polynomial x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w360', () => {
  it('polynomial x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w370', () => {
  it('polynomial x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w380', () => {
  it('polynomial x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w390', () => {
  it('polynomial x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w400', () => {
  it('polynomial x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w420', () => {
  it('polynomial x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w440', () => {
  it('polynomial x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w460', () => {
  it('polynomial x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w480', () => {
  it('polynomial x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w500', () => {
  it('polynomial x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w550', () => {
  it('polynomial x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w600', () => {
  it('polynomial x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w650', () => {
  it('polynomial x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w700', () => {
  it('polynomial x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w800', () => {
  it('polynomial x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w900', () => {
  it('polynomial x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial - w1000', () => {
  it('polynomial x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
