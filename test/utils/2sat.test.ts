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

  it('solves single variable', () => {
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

  it('handles trivial single variable', () => {
    const ts = new TwoSAT(1)
    const result = ts.solve()
    expect(result).not.toBeNull()
    expect(result!.length).toBe(1)
  })

  it('handles no clauses', () => {
    const ts = new TwoSAT(3)
    const result = ts.solve()
    expect(result).not.toBeNull()
    expect(result!.length).toBe(3)
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
})
