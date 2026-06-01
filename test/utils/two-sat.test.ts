import { describe, expect, it } from 'vitest'
import { TwoSAT } from '../../src/utils/two-sat.js'

describe('TwoSAT', () => {
  it('solves trivially satisfiable (x OR x)', () => {
    const sat = new TwoSAT(1)
    sat.addClause(0, false, 0, false)
    expect(sat.solve()).not.toBeNull()
  })

  it('solves (x OR y) AND (!x OR y)', () => {
    const sat = new TwoSAT(2)
    sat.addClause(0, false, 1, false)
    sat.addClause(0, true, 1, false)
    const result = sat.solve()
    expect(result).not.toBeNull()
    expect(result![1]).toBe(true)
  })

  it('detects unsatisfiable (x) AND (!x)', () => {
    const sat = new TwoSAT(1)
    sat.addClause(0, false, 0, false)
    sat.addClause(0, true, 0, true)
    expect(sat.solve()).toBeNull()
  })

  it('solves all-positive clause', () => {
    const sat = new TwoSAT(3)
    sat.addClause(0, false, 1, false)
    sat.addClause(1, false, 2, false)
    const result = sat.solve()
    expect(result).not.toBeNull()
  })

  it('solves with negated variables', () => {
    const sat = new TwoSAT(2)
    sat.addClause(0, false, 1, true)
    sat.addClause(0, true, 1, false)
    const result = sat.solve()
    expect(result).not.toBeNull()
    expect(result![0]).toBe(result![1])
  })

  it('handles empty formula', () => {
    const sat = new TwoSAT(3)
    const result = sat.solve()
    expect(result).not.toBeNull()
    expect(result!.length).toBe(3)
  })

  it('solves complex formula', () => {
    const sat = new TwoSAT(4)
    sat.addClause(0, false, 1, false)
    sat.addClause(1, true, 2, false)
    sat.addClause(2, true, 3, false)
    sat.addClause(3, true, 0, true)
    expect(sat.solve()).not.toBeNull()
  })

  it('contradiction with 3 variables', () => {
    const sat = new TwoSAT(3)
    sat.addClause(0, false, 1, false)
    sat.addClause(0, true, 1, true)
    sat.addClause(0, false, 1, true)
    sat.addClause(0, true, 1, false)
    expect(sat.solve()).toBeNull()
  })

  it('solves (x OR y) AND (x OR !y) = x must be true', () => {
    const sat = new TwoSAT(2)
    sat.addClause(0, false, 1, false)
    sat.addClause(0, false, 1, true)
    const result = sat.solve()
    expect(result).not.toBeNull()
    expect(result![0]).toBe(true)
  })

  it('solves implication chain', () => {
    const sat = new TwoSAT(3)
    sat.addClause(0, false, 1, false)
    sat.addClause(1, false, 2, false)
    sat.addClause(2, true, 0, true)
    expect(sat.solve()).not.toBeNull()
  })

  it('large satisfiable formula', () => {
    const sat = new TwoSAT(10)
    for (let i = 0; i < 9; i++) {
      sat.addClause(i, false, i + 1, false)
    }
    expect(sat.solve()).not.toBeNull()
  })

  it('all must be true: (x0) AND (x1) AND ...', () => {
    const sat = new TwoSAT(3)
    sat.addClause(0, false, 0, false)
    sat.addClause(1, false, 1, false)
    sat.addClause(2, false, 2, false)
    const result = sat.solve()
    expect(result).not.toBeNull()
    expect(result).toEqual([true, true, true])
  })

  it('satisfies solution respects all clauses', () => {
    const sat = new TwoSAT(4)
    sat.addClause(0, false, 1, true)
    sat.addClause(1, false, 2, true)
    sat.addClause(2, false, 3, true)
    const result = sat.solve()
    expect(result).not.toBeNull()
    const sol = result!
    for (const [i, ni, j, nj] of [[0, false, 1, true], [1, false, 2, true], [2, false, 3, true]] as const) {
      const vi = ni ? !sol[i] : sol[i]
      const vj = nj ? !sol[j] : sol[j]
      expect(vi || vj).toBe(true)
    }
  })

  it('handles single variable unsatisfiable via mutual exclusion', () => {
    const sat = new TwoSAT(1)
    sat.addClause(0, false, 0, false)
    sat.addClause(0, true, 0, true)
    sat.addClause(0, false, 0, true)
    expect(sat.solve()).toBeNull()
  })

  it('5 variables chain satisfiable', () => {
    const sat = new TwoSAT(5)
    for (let i = 0; i < 4; i++) {
      sat.addClause(i, false, i + 1, false)
    }
    const result = sat.solve()
    expect(result).not.toBeNull()
    expect(result!.length).toBe(5)
  })

  it('all pairs must be different: x != y and y != z and x != z', () => {
    const sat = new TwoSAT(3)
    sat.addClause(0, false, 1, false)
    sat.addClause(0, true, 1, true)
    sat.addClause(0, false, 2, false)
    sat.addClause(0, true, 2, true)
    sat.addClause(1, false, 2, false)
    sat.addClause(1, true, 2, true)
    expect(sat.solve()).toBeNull()
  })

  it('single variable satisfiable', () => {
    const sat = new TwoSAT(1)
    expect(sat.solve()).not.toBeNull()
  })
})
