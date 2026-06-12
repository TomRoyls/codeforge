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

  it('solves all-positive clause chain', () => {
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

  it('x must be true when forced', () => {
    const sat = new TwoSAT(2)
    sat.addClause(0, false, 1, false)
    sat.addClause(0, false, 1, true)
    const result = sat.solve()
    expect(result).not.toBeNull()
    expect(result![0]).toBe(true)
  })

  it('x must be false when forced', () => {
    const sat = new TwoSAT(2)
    sat.addClause(0, true, 1, false)
    sat.addClause(0, true, 1, true)
    const result = sat.solve()
    expect(result).not.toBeNull()
    expect(result![0]).toBe(false)
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

  it('all must be true: unit clauses', () => {
    const sat = new TwoSAT(3)
    sat.addClause(0, false, 0, false)
    sat.addClause(1, false, 1, false)
    sat.addClause(2, false, 2, false)
    const result = sat.solve()
    expect(result).not.toBeNull()
    expect(result).toEqual([true, true, true])
  })

  it('all must be false: negated unit clauses', () => {
    const sat = new TwoSAT(3)
    sat.addClause(0, true, 0, true)
    sat.addClause(1, true, 1, true)
    sat.addClause(2, true, 2, true)
    const result = sat.solve()
    expect(result).not.toBeNull()
    expect(result).toEqual([false, false, false])
  })

  it('solution respects all clauses', () => {
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

  it('single variable satisfiable no constraints', () => {
    const sat = new TwoSAT(1)
    expect(sat.solve()).not.toBeNull()
    expect(sat.solve()!.length).toBe(1)
  })

  it('two variables with single constraint', () => {
    const sat = new TwoSAT(2)
    sat.addClause(0, false, 1, false)
    expect(sat.solve()).not.toBeNull()
  })

  it('single variable unit clause returns assignment', () => {
    const sat = new TwoSAT(1)
    sat.addClause(0, true, 0, false)
    const result = sat.solve()
    expect(result).not.toBeNull()
    expect(result!.length).toBe(1)
  })

  it('mutual exclusion with 3 variables unsatisfiable', () => {
    const sat = new TwoSAT(3)
    sat.addClause(0, false, 1, false)
    sat.addClause(0, true, 1, true)
    sat.addClause(0, false, 2, false)
    sat.addClause(0, true, 2, true)
    sat.addClause(1, false, 2, false)
    sat.addClause(1, true, 2, true)
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

  it('20 variables chain satisfiable', () => {
    const sat = new TwoSAT(20)
    for (let i = 0; i < 19; i++) {
      sat.addClause(i, false, i + 1, false)
    }
    expect(sat.solve()).not.toBeNull()
  })

  it('addClause is idempotent for same clause', () => {
    const sat = new TwoSAT(2)
    sat.addClause(0, false, 1, false)
    sat.addClause(0, false, 1, false)
    expect(sat.solve()).not.toBeNull()
  })

  it('single variable forced true', () => {
    const sat = new TwoSAT(1)
    sat.addClause(0, false, 0, false)
    expect(sat.solve()).toEqual([true])
  })

  it('single variable forced false', () => {
    const sat = new TwoSAT(1)
    sat.addClause(0, true, 0, true)
    expect(sat.solve()).toEqual([false])
  })

  it('x OR !x is always satisfiable', () => {
    const sat = new TwoSAT(1)
    sat.addClause(0, false, 0, true)
    expect(sat.solve()).not.toBeNull()
  })

  it('contradictory unit clauses unsatisfiable', () => {
    const sat = new TwoSAT(1)
    sat.addClause(0, false, 0, false)
    sat.addClause(0, true, 0, true)
    expect(sat.solve()).toBeNull()
  })

  it('independent variables are all satisfiable', () => {
    const sat = new TwoSAT(5)
    sat.addClause(0, false, 0, false)
    sat.addClause(1, true, 1, true)
    sat.addClause(2, false, 2, false)
    const result = sat.solve()
    expect(result).not.toBeNull()
    expect(result![0]).toBe(true)
    expect(result![1]).toBe(false)
    expect(result![2]).toBe(true)
  })

  it('implication x->y and !x->y forces y true', () => {
    const sat = new TwoSAT(2)
    sat.addClause(0, true, 1, false)
    sat.addClause(0, false, 1, false)
    const result = sat.solve()
    expect(result).not.toBeNull()
    expect(result![1]).toBe(true)
  })

  it('cycle of implications satisfiable', () => {
    const sat = new TwoSAT(3)
    sat.addClause(0, true, 1, false)
    sat.addClause(1, true, 2, false)
    sat.addClause(2, true, 0, false)
    expect(sat.solve()).not.toBeNull()
  })

  it('contradictory cycle unsatisfiable', () => {
    const sat = new TwoSAT(3)
    sat.addClause(0, true, 1, false)
    sat.addClause(1, true, 2, false)
    sat.addClause(2, true, 0, true)
    sat.addClause(0, false, 0, false)
    expect(sat.solve()).toBeNull()
  })

  it('empty TwoSAT with 0 variables', () => {
    const sat = new TwoSAT(0)
    const result = sat.solve()
    expect(result).not.toBeNull()
    expect(result!.length).toBe(0)
  })

  it('large unsatisfiable formula', () => {
    const sat = new TwoSAT(10)
    sat.addClause(0, false, 0, false)
    sat.addClause(0, true, 0, true)
    for (let i = 1; i < 10; i++) {
      sat.addClause(i, false, i, false)
    }
    expect(sat.solve()).toBeNull()
  })

  it('alternating clauses satisfiable', () => {
    const sat = new TwoSAT(4)
    sat.addClause(0, false, 1, false)
    sat.addClause(1, true, 2, true)
    sat.addClause(2, false, 3, true)
    expect(sat.solve()).not.toBeNull()
  })

  it('two independent contradictions unsatisfiable', () => {
    const sat = new TwoSAT(4)
    sat.addClause(0, false, 0, false)
    sat.addClause(0, true, 0, true)
    sat.addClause(1, false, 1, false)
    sat.addClause(1, true, 1, true)
    expect(sat.solve()).toBeNull()
  })

  it('one contradiction makes all unsatisfiable', () => {
    const sat = new TwoSAT(3)
    sat.addClause(0, false, 1, false)
    sat.addClause(1, false, 2, false)
    sat.addClause(2, false, 2, false)
    sat.addClause(2, true, 2, true)
    expect(sat.solve()).toBeNull()
  })

  it('satisfiable with all negated clauses', () => {
    const sat = new TwoSAT(3)
    sat.addClause(0, true, 1, true)
    sat.addClause(1, true, 2, true)
    expect(sat.solve()).not.toBeNull()
  })

  it('mixed positive and negative clauses', () => {
    const sat = new TwoSAT(3)
    sat.addClause(0, false, 1, false)
    sat.addClause(1, true, 2, false)
    sat.addClause(0, true, 2, true)
    const result = sat.solve()
    expect(result).not.toBeNull()
    const sol = result!
    expect(sol[0] || sol[1]).toBe(true)
    expect(!sol[1] || sol[2]).toBe(true)
    expect(!sol[0] || !sol[2]).toBe(true)
  })

  it('same variable appears in many clauses', () => {
    const sat = new TwoSAT(5)
    for (let i = 1; i < 5; i++) {
      sat.addClause(0, false, i, false)
    }
    const result = sat.solve()
    expect(result).not.toBeNull()
    expect(result![0]).toBe(true)
  })

  it('diamond constraint satisfiable', () => {
    const sat = new TwoSAT(4)
    sat.addClause(0, false, 1, false)
    sat.addClause(0, false, 2, false)
    sat.addClause(1, true, 3, false)
    sat.addClause(2, true, 3, false)
    expect(sat.solve()).not.toBeNull()
  })

  it('forced assignment propagates', () => {
    const sat = new TwoSAT(3)
    sat.addClause(0, false, 0, false)
    sat.addClause(0, true, 1, false)
    sat.addClause(1, true, 2, false)
    const result = sat.solve()
    expect(result).not.toBeNull()
    expect(result![0]).toBe(true)
    expect(result![1]).toBe(true)
    expect(result![2]).toBe(true)
  })

  it('partial contradiction among many variables', () => {
    const sat = new TwoSAT(5)
    for (let i = 0; i < 4; i++) {
      sat.addClause(i, false, i + 1, false)
    }
    sat.addClause(2, false, 2, false)
    sat.addClause(2, true, 2, true)
    expect(sat.solve()).toBeNull()
  })

  it('tautology clause always satisfiable', () => {
    const sat = new TwoSAT(3)
    sat.addClause(0, false, 0, true)
    sat.addClause(1, false, 1, true)
    sat.addClause(2, false, 2, true)
    expect(sat.solve()).not.toBeNull()
  })

  it('half negated half positive satisfiable', () => {
    const sat = new TwoSAT(6)
    sat.addClause(0, false, 0, false)
    sat.addClause(1, true, 1, true)
    sat.addClause(2, false, 2, false)
    sat.addClause(3, true, 3, true)
    sat.addClause(4, false, 4, false)
    sat.addClause(5, true, 5, true)
    const result = sat.solve()
    expect(result).not.toBeNull()
    expect(result![0]).toBe(true)
    expect(result![1]).toBe(false)
    expect(result![2]).toBe(true)
    expect(result![3]).toBe(false)
  })

  it('very large satisfiable instance', () => {
    const sat = new TwoSAT(50)
    for (let i = 0; i < 49; i++) {
      sat.addClause(i, false, i + 1, false)
    }
    const result = sat.solve()
    expect(result).not.toBeNull()
    expect(result!.length).toBe(50)
  })

  it('redundant clauses do not break satisfiability', () => {
    const sat = new TwoSAT(2)
    sat.addClause(0, false, 0, false)
    sat.addClause(0, false, 0, false)
    sat.addClause(0, false, 0, false)
    sat.addClause(1, true, 1, true)
    const result = sat.solve()
    expect(result).not.toBeNull()
    expect(result![0]).toBe(true)
    expect(result![1]).toBe(false)
  })

  it('solution contains only boolean values', () => {
    const sat = new TwoSAT(3)
    sat.addClause(0, false, 1, true)
    sat.addClause(1, false, 2, true)
    const result = sat.solve()
    expect(result).not.toBeNull()
    for (let i = 0; i < result!.length; i++) {
      expect(typeof result![i]).toBe('boolean')
    }
  })

  it('same literal appears multiple times in formula', () => {
    const sat = new TwoSAT(2)
    sat.addClause(0, false, 0, false)
    sat.addClause(0, false, 1, false)
    sat.addClause(0, false, 1, true)
    const result = sat.solve()
    expect(result).not.toBeNull()
    expect(result![0]).toBe(true)
  })

  it('variables must be different in XOR-like pattern', () => {
    const sat = new TwoSAT(2)
    sat.addClause(0, false, 1, false)
    sat.addClause(0, true, 1, true)
    const result = sat.solve()
    expect(result).not.toBeNull()
    const sol = result!
    expect(sol[0] !== sol[1]).toBe(true)
  })

  it('variable forced true by multiple clauses', () => {
    const sat = new TwoSAT(3)
    sat.addClause(0, false, 0, false)
    sat.addClause(0, false, 1, false)
    sat.addClause(0, false, 2, false)
    const result = sat.solve()
    expect(result).not.toBeNull()
    expect(result![0]).toBe(true)
  })

  it('implication chain forces last variable true', () => {
    const sat = new TwoSAT(4)
    sat.addClause(0, true, 1, false)
    sat.addClause(1, true, 2, false)
    sat.addClause(2, true, 3, false)
    sat.addClause(3, true, 3, false)
    const result = sat.solve()
    expect(result).not.toBeNull()
    expect(result![3]).toBe(true)
  })

  it('mutually exclusive but not complementary', () => {
    const sat = new TwoSAT(3)
    sat.addClause(0, false, 1, false)
    sat.addClause(0, false, 2, false)
    sat.addClause(1, false, 2, false)
    const result = sat.solve()
    expect(result).not.toBeNull()
    const sol = result!
    const trues = sol.filter(v => v).length
    expect(trues).toBeGreaterThanOrEqual(2)
  })
})
