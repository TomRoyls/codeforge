import { describe, expect, it } from 'vitest'
import { StochasticMatrix2 } from '../../src/core/stochastic-matrix-2/index.js'

// ─── Constructor ───

describe('StochasticMatrix2 – constructor', () => {
  it('creates a matrix with given states', () => {
    const m = new StochasticMatrix2(['a', 'b', 'c'])
    expect(m.stateCount()).toBe(3)
    expect(m.getStates()).toEqual(['a', 'b', 'c'])
  })

  it('creates a matrix with empty states', () => {
    const m = new StochasticMatrix2([])
    expect(m.stateCount()).toBe(0)
    expect(m.getStates()).toEqual([])
  })

  it('creates a single-state matrix', () => {
    const m = new StochasticMatrix2(['x'])
    expect(m.stateCount()).toBe(1)
    expect(m.getStates()).toEqual(['x'])
  })

  it('does not mutate the original states array', () => {
    const states = ['a', 'b']
    const m = new StochasticMatrix2(states)
    m.getStates().push('c')
    expect(states).toEqual(['a', 'b'])
  })
})

// ─── setTransition / getTransition ───

describe('StochasticMatrix2 – setTransition / getTransition', () => {
  it('sets and gets a transition probability', () => {
    const m = new StochasticMatrix2(['a', 'b'])
    m.setTransition('a', 'b', 0.5)
    expect(m.getTransition('a', 'b')).toBe(0.5)
  })

  it('default transition probability is 0', () => {
    const m = new StochasticMatrix2(['a', 'b'])
    expect(m.getTransition('a', 'b')).toBe(0)
  })

  it('sets self-transition', () => {
    const m = new StochasticMatrix2(['a'])
    m.setTransition('a', 'a', 1)
    expect(m.getTransition('a', 'a')).toBe(1)
  })

  it('throws for unknown "from" state', () => {
    const m = new StochasticMatrix2(['a'])
    expect(() => m.setTransition('z', 'a', 0.5)).toThrow('Unknown state: z')
    expect(() => m.getTransition('z', 'a')).toThrow('Unknown state: z')
  })

  it('throws for unknown "to" state', () => {
    const m = new StochasticMatrix2(['a'])
    expect(() => m.setTransition('a', 'z', 0.5)).toThrow('Unknown state: z')
    expect(() => m.getTransition('a', 'z')).toThrow('Unknown state: z')
  })

  it('throws for negative probability', () => {
    const m = new StochasticMatrix2(['a', 'b'])
    expect(() => m.setTransition('a', 'b', -0.1)).toThrow('Probability must be non-negative')
  })

  it('allows zero probability', () => {
    const m = new StochasticMatrix2(['a', 'b'])
    m.setTransition('a', 'b', 0)
    expect(m.getTransition('a', 'b')).toBe(0)
  })

  it('overwrites previous transition', () => {
    const m = new StochasticMatrix2(['a', 'b'])
    m.setTransition('a', 'b', 0.3)
    m.setTransition('a', 'b', 0.7)
    expect(m.getTransition('a', 'b')).toBe(0.7)
  })
})

// ─── getTransitionsFrom ───

describe('StochasticMatrix2 – getTransitionsFrom', () => {
  it('returns all transitions from a state', () => {
    const m = new StochasticMatrix2(['a', 'b', 'c'])
    m.setTransition('a', 'b', 0.5)
    m.setTransition('a', 'c', 0.5)
    const trans = m.getTransitionsFrom('a')
    expect(trans.get('b')).toBe(0.5)
    expect(trans.get('c')).toBe(0.5)
    expect(trans.has('a')).toBe(false)
  })

  it('returns empty map for state with no transitions set', () => {
    const m = new StochasticMatrix2(['a', 'b'])
    const trans = m.getTransitionsFrom('a')
    expect(trans.size).toBe(0)
  })

  it('throws for unknown state', () => {
    const m = new StochasticMatrix2(['a'])
    expect(() => m.getTransitionsFrom('z')).toThrow('Unknown state: z')
  })

  it('returns a copy (not the internal map)', () => {
    const m = new StochasticMatrix2(['a', 'b'])
    m.setTransition('a', 'b', 0.5)
    const trans = m.getTransitionsFrom('a')
    trans.set('b', 99)
    expect(m.getTransition('a', 'b')).toBe(0.5)
  })
})

// ─── isRowStochastic ───

describe('StochasticMatrix2 – isRowStochastic', () => {
  it('returns true for identity matrix', () => {
    const m = new StochasticMatrix2(['a', 'b'])
    m.setTransition('a', 'a', 1)
    m.setTransition('b', 'b', 1)
    expect(m.isRowStochastic()).toBe(true)
  })

  it('returns true for valid row-stochastic matrix', () => {
    const m = new StochasticMatrix2(['a', 'b'])
    m.setTransition('a', 'a', 0.3)
    m.setTransition('a', 'b', 0.7)
    m.setTransition('b', 'a', 0.5)
    m.setTransition('b', 'b', 0.5)
    expect(m.isRowStochastic()).toBe(true)
  })

  it('returns false when rows do not sum to 1', () => {
    const m = new StochasticMatrix2(['a', 'b'])
    m.setTransition('a', 'a', 0.5)
    m.setTransition('a', 'b', 0.3)
    expect(m.isRowStochastic()).toBe(false)
  })

  it('returns false for zero matrix', () => {
    const m = new StochasticMatrix2(['a', 'b'])
    expect(m.isRowStochastic()).toBe(false)
  })
})

// ─── isColumnStochastic ───

describe('StochasticMatrix2 – isColumnStochastic', () => {
  it('returns true for identity matrix', () => {
    const m = new StochasticMatrix2(['a', 'b'])
    m.setTransition('a', 'a', 1)
    m.setTransition('b', 'b', 1)
    expect(m.isColumnStochastic()).toBe(true)
  })

  it('returns true for doubly stochastic matrix', () => {
    const m = new StochasticMatrix2(['a', 'b'])
    m.setTransition('a', 'a', 0.5)
    m.setTransition('a', 'b', 0.5)
    m.setTransition('b', 'a', 0.5)
    m.setTransition('b', 'b', 0.5)
    expect(m.isColumnStochastic()).toBe(true)
  })

  it('returns false when columns do not sum to 1', () => {
    const m = new StochasticMatrix2(['a', 'b'])
    m.setTransition('a', 'a', 1)
    m.setTransition('a', 'b', 0)
    m.setTransition('b', 'a', 0)
    m.setTransition('b', 'b', 0.5)
    expect(m.isColumnStochastic()).toBe(false)
  })
})

// ─── isDoublyStochastic ───

describe('StochasticMatrix2 – isDoublyStochastic', () => {
  it('returns true for doubly stochastic matrix', () => {
    const m = new StochasticMatrix2(['a', 'b'])
    m.setTransition('a', 'a', 0.5)
    m.setTransition('a', 'b', 0.5)
    m.setTransition('b', 'a', 0.5)
    m.setTransition('b', 'b', 0.5)
    expect(m.isDoublyStochastic()).toBe(true)
  })

  it('returns true for identity matrix', () => {
    const m = new StochasticMatrix2(['a', 'b'])
    m.setTransition('a', 'a', 1)
    m.setTransition('b', 'b', 1)
    expect(m.isDoublyStochastic()).toBe(true)
  })

  it('returns false for row-stochastic but not column-stochastic', () => {
    const m = new StochasticMatrix2(['a', 'b'])
    m.setTransition('a', 'a', 0.3)
    m.setTransition('a', 'b', 0.7)
    m.setTransition('b', 'a', 0.8)
    m.setTransition('b', 'b', 0.2)
    expect(m.isDoublyStochastic()).toBe(false)
  })
})

// ─── normalize ───

describe('StochasticMatrix2 – normalize', () => {
  it('normalizes each row to sum to 1', () => {
    const m = new StochasticMatrix2(['a', 'b'])
    m.setTransition('a', 'a', 3)
    m.setTransition('a', 'b', 7)
    m.setTransition('b', 'a', 4)
    m.setTransition('b', 'b', 6)
    m.normalize()
    expect(m.getTransition('a', 'a')).toBeCloseTo(0.3)
    expect(m.getTransition('a', 'b')).toBeCloseTo(0.7)
    expect(m.getTransition('b', 'a')).toBeCloseTo(0.4)
    expect(m.getTransition('b', 'b')).toBeCloseTo(0.6)
    expect(m.isRowStochastic()).toBe(true)
  })

  it('does not divide by zero for empty rows', () => {
    const m = new StochasticMatrix2(['a', 'b'])
    m.normalize()
    expect(m.getTransition('a', 'a')).toBe(0)
    expect(m.getTransition('a', 'b')).toBe(0)
  })

  it('normalizes single-state matrix', () => {
    const m = new StochasticMatrix2(['a'])
    m.setTransition('a', 'a', 5)
    m.normalize()
    expect(m.getTransition('a', 'a')).toBeCloseTo(1)
  })
})

// ─── multiply ───

describe('StochasticMatrix2 – multiply', () => {
  it('multiplies two matrices', () => {
    const m1 = new StochasticMatrix2(['a', 'b'])
    m1.setTransition('a', 'a', 0.5)
    m1.setTransition('a', 'b', 0.5)
    m1.setTransition('b', 'a', 0.3)
    m1.setTransition('b', 'b', 0.7)

    const m2 = new StochasticMatrix2(['a', 'b'])
    m2.setTransition('a', 'a', 1)
    m2.setTransition('a', 'b', 0)
    m2.setTransition('b', 'a', 0)
    m2.setTransition('b', 'b', 1)

    const result = m1.multiply(m2)
    expect(result.getTransition('a', 'a')).toBeCloseTo(0.5)
    expect(result.getTransition('a', 'b')).toBeCloseTo(0.5)
    expect(result.getTransition('b', 'a')).toBeCloseTo(0.3)
    expect(result.getTransition('b', 'b')).toBeCloseTo(0.7)
  })

  it('throws for mismatched dimensions', () => {
    const m1 = new StochasticMatrix2(['a', 'b'])
    const m2 = new StochasticMatrix2(['x', 'y', 'z'])
    expect(() => m1.multiply(m2)).toThrow('Matrices must have same dimensions')
  })

  it('identity multiplied by identity is identity', () => {
    const m = new StochasticMatrix2(['a', 'b'])
    m.setTransition('a', 'a', 1)
    m.setTransition('b', 'b', 1)
    const result = m.multiply(m)
    expect(result.getTransition('a', 'a')).toBeCloseTo(1)
    expect(result.getTransition('b', 'b')).toBeCloseTo(1)
    expect(result.getTransition('a', 'b')).toBeCloseTo(0)
    expect(result.getTransition('b', 'a')).toBeCloseTo(0)
  })
})

// ─── power ───

describe('StochasticMatrix2 – power', () => {
  it('returns identity for power 0', () => {
    const m = new StochasticMatrix2(['a', 'b'])
    m.setTransition('a', 'a', 0.5)
    m.setTransition('a', 'b', 0.5)
    m.setTransition('b', 'a', 0.3)
    m.setTransition('b', 'b', 0.7)
    const result = m.power(0)
    expect(result.getTransition('a', 'a')).toBe(1)
    expect(result.getTransition('b', 'b')).toBe(1)
    expect(result.getTransition('a', 'b')).toBe(0)
    expect(result.getTransition('b', 'a')).toBe(0)
  })

  it('returns copy of self for power 1', () => {
    const m = new StochasticMatrix2(['a', 'b'])
    m.setTransition('a', 'a', 0.5)
    m.setTransition('a', 'b', 0.5)
    const result = m.power(1)
    expect(result.getTransition('a', 'a')).toBe(0.5)
    expect(result.getTransition('a', 'b')).toBe(0.5)
  })

  it('throws for negative power', () => {
    const m = new StochasticMatrix2(['a'])
    expect(() => m.power(-1)).toThrow('Power must be non-negative')
  })

  it('computes power 2 correctly', () => {
    const m = new StochasticMatrix2(['a', 'b'])
    m.setTransition('a', 'a', 0.5)
    m.setTransition('a', 'b', 0.5)
    m.setTransition('b', 'a', 0.3)
    m.setTransition('b', 'b', 0.7)
    const result = m.power(2)
    expect(result.getTransition('a', 'a')).toBeCloseTo(0.4)
    expect(result.getTransition('a', 'b')).toBeCloseTo(0.6)
    expect(result.getTransition('b', 'a')).toBeCloseTo(0.36)
    expect(result.getTransition('b', 'b')).toBeCloseTo(0.64)
  })
})

// ─── stationaryDistribution ───

describe('StochasticMatrix2 – stationaryDistribution', () => {
  it('computes uniform distribution for symmetric matrix', () => {
    const m = new StochasticMatrix2(['a', 'b'])
    m.setTransition('a', 'a', 0.5)
    m.setTransition('a', 'b', 0.5)
    m.setTransition('b', 'a', 0.5)
    m.setTransition('b', 'b', 0.5)
    const dist = m.stationaryDistribution()
    expect(dist.get('a')).toBeCloseTo(0.5)
    expect(dist.get('b')).toBeCloseTo(0.5)
  })

  it('computes correct distribution for asymmetric chain', () => {
    const m = new StochasticMatrix2(['a', 'b'])
    m.setTransition('a', 'a', 0.7)
    m.setTransition('a', 'b', 0.3)
    m.setTransition('b', 'a', 0.4)
    m.setTransition('b', 'b', 0.6)
    const dist = m.stationaryDistribution()
    expect(dist.get('a')! + dist.get('b')!).toBeCloseTo(1)
    expect(dist.get('a')).toBeCloseTo(4 / 7)
    expect(dist.get('b')).toBeCloseTo(3 / 7)
  })

  it('returns point distribution for absorbing state', () => {
    const m = new StochasticMatrix2(['a'])
    m.setTransition('a', 'a', 1)
    const dist = m.stationaryDistribution()
    expect(dist.get('a')).toBeCloseTo(1)
  })

  it('throws if matrix is not row-stochastic', () => {
    const m = new StochasticMatrix2(['a', 'b'])
    m.setTransition('a', 'a', 0.5)
    expect(() => m.stationaryDistribution()).toThrow('Matrix must be row stochastic')
  })

  it('distribution sums to 1', () => {
    const m = new StochasticMatrix2(['a', 'b', 'c'])
    m.setTransition('a', 'a', 0.1)
    m.setTransition('a', 'b', 0.6)
    m.setTransition('a', 'c', 0.3)
    m.setTransition('b', 'a', 0.2)
    m.setTransition('b', 'b', 0.5)
    m.setTransition('b', 'c', 0.3)
    m.setTransition('c', 'a', 0.4)
    m.setTransition('c', 'b', 0.1)
    m.setTransition('c', 'c', 0.5)
    const dist = m.stationaryDistribution()
    const sum = Array.from(dist.values()).reduce((a, b) => a + b, 0)
    expect(sum).toBeCloseTo(1)
  })
})

// ─── Edge cases ───

describe('StochasticMatrix2 – edge cases', () => {
  it('handles three-state transition matrix', () => {
    const m = new StochasticMatrix2(['a', 'b', 'c'])
    m.setTransition('a', 'b', 1)
    m.setTransition('b', 'c', 1)
    m.setTransition('c', 'a', 1)
    expect(m.isRowStochastic()).toBe(true)
  })

  it('handles states with numeric-like string names', () => {
    const m = new StochasticMatrix2(['0', '1'])
    m.setTransition('0', '1', 0.5)
    m.setTransition('0', '0', 0.5)
    m.setTransition('1', '0', 1)
    m.setTransition('1', '1', 0)
    expect(m.isRowStochastic()).toBe(true)
    expect(m.getTransition('0', '1')).toBe(0.5)
  })

  it('works with single state self-loop', () => {
    const m = new StochasticMatrix2(['only'])
    m.setTransition('only', 'only', 1)
    expect(m.isRowStochastic()).toBe(true)
    expect(m.isColumnStochastic()).toBe(true)
    expect(m.isDoublyStochastic()).toBe(true)
  })
})
