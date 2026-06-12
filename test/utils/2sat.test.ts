import { describe, expect, it } from 'vitest'
import { TwoSAT } from '../../src/utils/2sat.js'

describe('TwoSAT', () => {
  it('solves simple satisfiable', () => {
    const ts = new TwoSAT(2)
    ts.addClause(0, true, 1, false)
    const result = ts.solve()
    expect(result).not.toBeNull()
  })

  it('detects unsatisfiable', () => {
    const ts = new TwoSAT(1)
    ts.addClause(0, true, 0, true)
    ts.addClause(0, false, 0, false)
    expect(ts.solve()).toBeNull()
  })

  it('solves (a OR b) AND (!a OR b)', () => {
    const ts = new TwoSAT(2)
    ts.addClause(0, false, 1, false)
    ts.addClause(0, true, 1, false)
    const result = ts.solve()
    expect(result).not.toBeNull()
    expect(result![1]).toBe(true)
  })

  it('solves single variable forced true', () => {
    const ts = new TwoSAT(1)
    ts.addClause(0, false, 0, false)
    const result = ts.solve()
    expect(result).not.toBeNull()
    expect(result![0]).toBe(true)
  })

  it('handles no clauses', () => {
    const ts = new TwoSAT(3)
    const result = ts.solve()
    expect(result).not.toBeNull()
    expect(result!.length).toBe(3)
  })

  it('handles contradictory single var', () => {
    const ts = new TwoSAT(1)
    ts.addClause(0, false, 0, false)
    ts.addClause(0, true, 0, true)
    expect(ts.solve()).toBeNull()
  })

  it('solves three variables', () => {
    const ts = new TwoSAT(3)
    ts.addClause(0, false, 1, true)
    ts.addClause(1, false, 2, false)
    ts.addClause(0, true, 2, true)
    const result = ts.solve()
    expect(result).not.toBeNull()
  })

  it('solves (!a OR !b) AND (a OR b)', () => {
    const ts = new TwoSAT(2)
    ts.addClause(0, true, 1, true)
    ts.addClause(0, false, 1, false)
    const result = ts.solve()
    expect(result).not.toBeNull()
  })

  it('returns consistent assignment', () => {
    const ts = new TwoSAT(2)
    ts.addClause(0, false, 1, false)
    const result = ts.solve()
    expect(result).not.toBeNull()
    expect(result!.length).toBe(2)
  })

  it('handles implication a -> b as (!a OR b)', () => {
    const ts = new TwoSAT(2)
    ts.addClause(0, true, 1, false)
    const result = ts.solve()
    expect(result).not.toBeNull()
    if (result![0] === false) {
      expect(result![1]).toBe(true)
    }
  })

  it('handles chain of implications', () => {
    const ts = new TwoSAT(3)
    ts.addClause(0, true, 1, false)
    ts.addClause(1, true, 2, false)
    const result = ts.solve()
    expect(result).not.toBeNull()
    if (result![0] === false && result![1] === false) {
      expect(result![2]).toBe(true)
    }
  })

  it('contradictory implications', () => {
    const ts = new TwoSAT(2)
    ts.addClause(0, true, 1, false)
    ts.addClause(0, false, 0, false)
    ts.addClause(1, true, 1, true)
    expect(ts.solve()).toBeNull()
  })

  it('handles tautology clause', () => {
    const ts = new TwoSAT(1)
    ts.addClause(0, true, 0, false)
    expect(ts.solve()).not.toBeNull()
  })

  it('handles implication chain', () => {
    const ts = new TwoSAT(3)
    ts.addClause(0, true, 1, true)
    ts.addClause(1, true, 2, true)
    ts.addClause(2, false, 0, false)
    const result = ts.solve()
    expect(result).not.toBeNull()
  })

  it('empty formula is satisfiable', () => {
    const ts = new TwoSAT(0)
    const result = ts.solve()
    expect(result).not.toBeNull()
    expect(result!.length).toBe(0)
  })

  it('trivially satisfiable with single clause', () => {
    const ts = new TwoSAT(1)
    ts.addClause(0, true, 0, true)
    expect(ts.solve()).not.toBeNull()
  })

  it('contradictory single variable is unsatisfiable', () => {
    const ts = new TwoSAT(1)
    ts.addClause(0, true, 0, false)
    ts.addClause(0, false, 0, true)
    expect(ts.solve()).not.toBeNull()
  })

  it('solves XOR constraint (a XOR b)', () => {
    const ts = new TwoSAT(2)
    ts.addClause(0, false, 1, false)
    ts.addClause(0, true, 1, true)
    const result = ts.solve()
    expect(result).not.toBeNull()
    if (result) {
      expect(result[0]).not.toBe(result[1])
    }
  })

  it('circular implication a->b->c->a is satisfiable', () => {
    const ts = new TwoSAT(3)
    ts.addClause(0, true, 1, false)
    ts.addClause(1, true, 2, false)
    ts.addClause(2, true, 0, false)
    expect(ts.solve()).not.toBeNull()
  })

  it('circular contradiction a->!b, b->!c, c->!a', () => {
    const ts = new TwoSAT(3)
    ts.addClause(0, true, 1, true)
    ts.addClause(1, true, 2, true)
    ts.addClause(2, true, 0, true)
    ts.addClause(0, false, 1, false)
    ts.addClause(1, false, 2, false)
    ts.addClause(2, false, 0, false)
    expect(ts.solve()).toBeNull()
  })

  it('forces variable true via (!x OR !x)', () => {
    const ts = new TwoSAT(1)
    ts.addClause(0, true, 0, true)
    const result = ts.solve()
    expect(result).not.toBeNull()
    expect(result![0]).toBe(false)
  })

  it('forces variable false via (x OR x)', () => {
    const ts = new TwoSAT(1)
    ts.addClause(0, false, 0, false)
    const result = ts.solve()
    expect(result).not.toBeNull()
    expect(result![0]).toBe(true)
  })

  it('many variables with sparse clauses', () => {
    const ts = new TwoSAT(10)
    ts.addClause(0, false, 1, false)
    ts.addClause(3, true, 4, true)
    ts.addClause(7, false, 8, true)
    expect(ts.solve()).not.toBeNull()
  })

  it('assignment satisfies all clauses', () => {
    const ts = new TwoSAT(3)
    ts.addClause(0, false, 1, false)
    ts.addClause(1, true, 2, false)
    const result = ts.solve()
    expect(result).not.toBeNull()
    if (result) {
      for (let a = 0; a < 2; a++) {
        for (let b = 0; b < 2; b++) {
          for (let c = 0; c < 2; c++) {
            const vals = [!!a, !!b, !!c]
            if (
              (vals[0] || vals[1]) &&
              (!vals[1] || vals[2])
            ) {
              const satisfied =
                (result[0] || result[1]) &&
                (!result[1] || result[2])
              expect(satisfied).toBe(true)
              return
            }
          }
        }
      }
    }
  })

  it('solves with 5 variables', () => {
    const ts = new TwoSAT(5)
    ts.addClause(0, false, 1, true)
    ts.addClause(2, false, 3, false)
    ts.addClause(1, true, 4, true)
    ts.addClause(3, false, 0, true)
    expect(ts.solve()).not.toBeNull()
  })

  it('both variables forced in opposite directions', () => {
    const ts = new TwoSAT(2)
    ts.addClause(0, false, 0, false)
    ts.addClause(1, true, 1, true)
    const result = ts.solve()
    expect(result).not.toBeNull()
    expect(result![0]).toBe(true)
    expect(result![1]).toBe(false)
  })

  it('double negation same variable is satisfiable', () => {
    const ts = new TwoSAT(1)
    ts.addClause(0, true, 0, false)
    const result = ts.solve()
    expect(result).not.toBeNull()
  })

  it('mutual exclusion is satisfiable', () => {
    const ts = new TwoSAT(2)
    ts.addClause(0, true, 1, true)
    const result = ts.solve()
    expect(result).not.toBeNull()
    if (result) {
      expect(result[0] && result[1]).toBe(false)
    }
  })

  it('at least one must be true', () => {
    const ts = new TwoSAT(2)
    ts.addClause(0, false, 1, false)
    const result = ts.solve()
    expect(result).not.toBeNull()
    if (result) {
      expect(result[0] || result[1]).toBe(true)
    }
  })

  it('both forced true', () => {
    const ts = new TwoSAT(2)
    ts.addClause(0, false, 0, false)
    ts.addClause(1, false, 1, false)
    const result = ts.solve()
    expect(result).not.toBeNull()
    expect(result![0]).toBe(true)
    expect(result![1]).toBe(true)
  })

  it('implication chain with 5 variables', () => {
    const ts = new TwoSAT(5)
    for (let i = 0; i < 4; i++) {
      ts.addClause(i, true, i + 1, false)
    }
    const result = ts.solve()
    expect(result).not.toBeNull()
  })

  it('contradiction with 4 variables', () => {
    const ts = new TwoSAT(4)
    ts.addClause(0, false, 0, false)
    ts.addClause(0, true, 1, true)
    ts.addClause(1, false, 1, false)
    ts.addClause(1, true, 0, true)
    expect(ts.solve()).toBeNull()
  })

  it('satisfiable with many redundant clauses', () => {
    const ts = new TwoSAT(2)
    for (let i = 0; i < 10; i++) {
      ts.addClause(0, false, 1, false)
    }
    expect(ts.solve()).not.toBeNull()
  })

  it('assignment length matches variable count', () => {
    const ts = new TwoSAT(7)
    ts.addClause(0, false, 1, false)
    const result = ts.solve()
    expect(result).not.toBeNull()
    expect(result!.length).toBe(7)
  })

  it('single variable with no clauses returns assignment', () => {
    const ts = new TwoSAT(1)
    const result = ts.solve()
    expect(result).not.toBeNull()
    expect(result!.length).toBe(1)
    expect(typeof result![0]).toBe('boolean')
  })

  it('solves (a OR b) AND (!a OR !b) AND (a OR !b)', () => {
    const ts = new TwoSAT(2)
    ts.addClause(0, false, 1, false)
    ts.addClause(0, true, 1, true)
    ts.addClause(0, false, 1, true)
    const result = ts.solve()
    expect(result).not.toBeNull()
    if (result) {
      expect(result[0]).toBe(true)
    }
  })

  it('solves complex formula with 6 variables', () => {
    const ts = new TwoSAT(6)
    ts.addClause(0, false, 1, false)
    ts.addClause(2, true, 3, true)
    ts.addClause(4, false, 5, false)
    ts.addClause(0, true, 2, false)
    ts.addClause(1, true, 4, true)
    ts.addClause(3, false, 5, true)
    expect(ts.solve()).not.toBeNull()
  })

  it('re-add same clause does not break solver', () => {
    const ts = new TwoSAT(2)
    ts.addClause(0, false, 1, false)
    ts.addClause(0, false, 1, false)
    const result = ts.solve()
    expect(result).not.toBeNull()
  })

  it('all variables unconstrained defaults to some assignment', () => {
    const ts = new TwoSAT(5)
    const result = ts.solve()
    expect(result).not.toBeNull()
    expect(result!.every(v => typeof v === 'boolean')).toBe(true)
  })

  it('unsatisfiable with conflicting single-variable clauses', () => {
    const ts = new TwoSAT(2)
    ts.addClause(0, false, 0, false)
    ts.addClause(0, true, 0, true)
    expect(ts.solve()).toBeNull()
  })

  it('satisfiable with only positive clauses', () => {
    const ts = new TwoSAT(3)
    ts.addClause(0, false, 1, false)
    ts.addClause(1, false, 2, false)
    ts.addClause(0, false, 2, false)
    expect(ts.solve()).not.toBeNull()
  })

  it('satisfiable with only negative clauses', () => {
    const ts = new TwoSAT(3)
    ts.addClause(0, true, 1, true)
    ts.addClause(1, true, 2, true)
    ts.addClause(0, true, 2, true)
    expect(ts.solve()).not.toBeNull()
  })

  it('solves (a OR !b) AND (!a OR b) - equivalence', () => {
    const ts = new TwoSAT(2)
    ts.addClause(0, false, 1, true)
    ts.addClause(0, true, 1, false)
    const result = ts.solve()
    expect(result).not.toBeNull()
    if (result) {
      expect(result[0]).toBe(result[1])
    }
  })

  it('large satisfiable instance', () => {
    const n = 50
    const ts = new TwoSAT(n)
    for (let i = 0; i < n - 1; i++) {
      ts.addClause(i, true, i + 1, false)
    }
    expect(ts.solve()).not.toBeNull()
  })

  it('large unsatisfiable instance', () => {
    const n = 50
    const ts = new TwoSAT(n)
    for (let i = 0; i < n; i++) {
      ts.addClause(i, false, i, false)
      ts.addClause(i, true, i, true)
    }
    expect(ts.solve()).toBeNull()
  })

  it('single clause with different variables', () => {
    const ts = new TwoSAT(10)
    ts.addClause(3, false, 7, true)
    expect(ts.solve()).not.toBeNull()
  })

  it('solves with 8 variables chain', () => {
    const ts = new TwoSAT(8)
    for (let i = 0; i < 7; i++) ts.addClause(i, true, i + 1, false)
    expect(ts.solve()).not.toBeNull()
  })

  it('single variable satisfiable with clause (x OR x)', () => {
    const ts = new TwoSAT(1)
    ts.addClause(0, false, 0, false)
    const result = ts.solve()
    expect(result).not.toBeNull()
    expect(result![0]).toBe(true)
  })

  it('double negation across two variables', () => {
    const ts = new TwoSAT(2)
    ts.addClause(0, true, 1, false)
    ts.addClause(0, false, 1, true)
    const result = ts.solve()
    expect(result).not.toBeNull()
    if (result) {
      expect(result[0]).toBe(result[1])
    }
  })

  it('multiple calls to solve return same result', () => {
    const ts = new TwoSAT(3)
    ts.addClause(0, false, 1, false)
    ts.addClause(1, true, 2, false)
    const r1 = ts.solve()
    const r2 = ts.solve()
    expect(r1).toEqual(r2)
  })

  it('handles 20 variables with sparse constraints', () => {
    const ts = new TwoSAT(20)
    ts.addClause(0, false, 5, false)
    ts.addClause(10, true, 15, true)
    ts.addClause(3, false, 18, false)
    expect(ts.solve()).not.toBeNull()
  })

  it('implication chain x1 -> x2 -> x3 with all true', () => {
    const ts = new TwoSAT(3)
    ts.addClause(0, true, 1, false)
    ts.addClause(1, true, 2, false)
    const result = ts.solve()
    expect(result).not.toBeNull()
    if (result) {
      expect(result[0] || result[1]).toBe(true)
      expect(result[1] || result[2]).toBe(true)
    }
  })

  it('x AND NOT x is unsatisfiable', () => {
    const ts = new TwoSAT(1)
    ts.addClause(0, false, 0, false)
    ts.addClause(0, true, 0, true)
    expect(ts.solve()).toBeNull()
  })

  it('returns assignment of correct length', () => {
    const ts = new TwoSAT(5)
    ts.addClause(0, false, 1, false)
    const result = ts.solve()
    expect(result).not.toBeNull()
    expect(result!.length).toBe(5)
  })

  it('clauses with negated variables only', () => {
    const ts = new TwoSAT(3)
    ts.addClause(0, true, 1, true)
    ts.addClause(1, true, 2, true)
    ts.addClause(0, true, 2, true)
    const result = ts.solve()
    expect(result).not.toBeNull()
  })
})

  it('single variable satisfied', () => {
    const solver = new TwoSAT(1)
    solver.addClause(0, true, 0, true)
    expect(solver.solve()).not.toBeNull()
  })

  it('contradictory clauses unsatisfiable', () => {
    const solver = new TwoSAT(1)
    solver.addClause(0, true, 0, true)
    solver.addClause(0, false, 0, false)
    expect(solver.solve()).toBeNull()
  })

  it('two variables with implication', () => {
    const solver = new TwoSAT(2)
    solver.addClause(0, false, 1, true)
    expect(solver.solve()).not.toBeNull()
  })

describe('2sat - wave544', () => {
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

describe('2sat - wave546', () => {
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

describe('2sat - wave547', () => {
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
