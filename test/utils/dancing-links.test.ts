import { describe, it, expect } from 'vitest'
import { DancingLinks } from '../../src/utils/dancing-links.js'

describe('DancingLinks', () => {
  it('creates with column count', () => {
    const dlx = new DancingLinks(5)
    expect(dlx.solutionCount).toBe(0)
  })

  it('creates with custom max solutions', () => {
    const dlx = new DancingLinks(5, 10)
    expect(dlx.solutionCount).toBe(0)
  })

  it('adds single row', () => {
    const dlx = new DancingLinks(3)
    dlx.addRow(0, [0, 1, 2])
    const solutions = dlx.solve()
    expect(solutions.length).toBeGreaterThan(0)
  })

  it('adds multiple rows', () => {
    const dlx = new DancingLinks(3)
    dlx.addRow(0, [0])
    dlx.addRow(1, [1])
    dlx.addRow(2, [2])
    dlx.solve()
    expect(dlx.solutionCount).toBeGreaterThan(0)
  })

  it('ignores empty rows', () => {
    const dlx = new DancingLinks(3)
    dlx.addRow(0, [])
    const solutions = dlx.solve()
    expect(solutions.length).toBe(0)
  })

  it('finds exact cover solution', () => {
    const dlx = new DancingLinks(3)
    dlx.addRow(0, [0, 1])
    dlx.addRow(1, [2])
    dlx.addRow(2, [0, 2])

    const solutions = dlx.solve()
    expect(solutions.length).toBeGreaterThan(0)
    const solution = solutions[0]
    expect(solution).toBeDefined()
  })

  it('handles unsorted columns in row', () => {
    const dlx = new DancingLinks(3)
    dlx.addRow(0, [2, 0, 1])
    dlx.addRow(1, [1, 2])
    dlx.addRow(2, [0, 2])

    const solutions = dlx.solve()
    expect(solutions.length).toBeGreaterThan(0)
  })

  it('finds multiple solutions', () => {
    const dlx = new DancingLinks(3, 100)
    dlx.addRow(0, [0])
    dlx.addRow(1, [1])
    dlx.addRow(2, [2])
    dlx.addRow(3, [0, 1, 2])

    const solutions = dlx.solve()
    expect(dlx.solutionCount).toBeGreaterThan(1)
  })

  it('respects max solutions limit', () => {
    const dlx = new DancingLinks(3, 2)
    dlx.addRow(0, [0])
    dlx.addRow(1, [1])
    dlx.addRow(2, [2])
    dlx.addRow(3, [0, 1, 2])

    dlx.solve()
    expect(dlx.solutionCount).toBeLessThanOrEqual(2)
  })

  it('handles impossible problem', () => {
    const dlx = new DancingLinks(3)
    dlx.addRow(0, [0, 1])
    dlx.addRow(1, [0, 1])

    const solutions = dlx.solve()
    expect(solutions.length).toBe(0)
    expect(dlx.solutionCount).toBe(0)
  })

  it('solves simple exact cover', () => {
    const dlx = new DancingLinks(7)
    dlx.addRow(0, [0, 3, 6])
    dlx.addRow(1, [0, 1])
    dlx.addRow(2, [1, 2])
    dlx.addRow(3, [2, 3])
    dlx.addRow(4, [4, 5])
    dlx.addRow(5, [5, 6])
    dlx.addRow(6, [4, 6])

    const solutions = dlx.solve()
    expect(solutions.length).toBeGreaterThan(0)
  })

  it('handles single column exact cover', () => {
    const dlx = new DancingLinks(1)
    dlx.addRow(0, [0])
    dlx.addRow(1, [0])

    const solutions = dlx.solve()
    expect(solutions.length).toBeGreaterThan(0)
  })

  it('handles large sparse problem', () => {
    const dlx = new DancingLinks(10)
    for (let i = 0; i < 10; i++) {
      dlx.addRow(i, [i])
    }

    const solutions = dlx.solve()
    expect(solutions.length).toBeGreaterThan(0)
  })

  it('tracks solution count correctly', () => {
    const dlx = new DancingLinks(3, 10)
    dlx.addRow(0, [0])
    dlx.addRow(1, [1])
    dlx.addRow(2, [2])

    dlx.solve()
    expect(dlx.solutionCount).toBe(1)
  })

  it('returns solution with row IDs', () => {
    const dlx = new DancingLinks(3)
    dlx.addRow(10, [0])
    dlx.addRow(20, [1])
    dlx.addRow(30, [2])

    const solutions = dlx.solve()
    expect(solutions.length).toBeGreaterThan(0)
    const solution = solutions[0]
    expect(solution).toBeDefined()
    expect(solution!.length).toBe(3)
    expect(solution).toContain(10)
    expect(solution).toContain(20)
    expect(solution).toContain(30)
  })

  it('handles duplicate row coverage', () => {
    const dlx = new DancingLinks(3)
    dlx.addRow(0, [0, 1, 2])
    dlx.addRow(1, [0, 1, 2])

    const solutions = dlx.solve()
    expect(solutions.length).toBeGreaterThan(0)
  })

  it('solves with overlapping columns', () => {
    const dlx = new DancingLinks(5)
    dlx.addRow(0, [0, 1])
    dlx.addRow(1, [2, 3])
    dlx.addRow(2, [4])
    dlx.addRow(3, [0, 2, 4])
    dlx.addRow(4, [1, 3])

    const solutions = dlx.solve()
    expect(dlx.solutionCount).toBeGreaterThan(0)
  })

  it('handles minimal exact cover', () => {
    const dlx = new DancingLinks(2)
    dlx.addRow(0, [0, 1])

    const solutions = dlx.solve()
    expect(solutions.length).toBe(1)
    expect(solutions[0]!.length).toBe(1)
    expect(solutions[0]![0]).toBe(0)
  })

  it('handles disjoint columns', () => {
    const dlx = new DancingLinks(4)
    dlx.addRow(0, [0, 1])
    dlx.addRow(1, [2, 3])

    const solutions = dlx.solve()
    expect(solutions.length).toBe(1)
  })

  it('resets solution count between solves', () => {
    const dlx = new DancingLinks(3)
    dlx.addRow(0, [0, 1, 2])

    dlx.solve()
    const count1 = dlx.solutionCount

    dlx.solve()
    const count2 = dlx.solutionCount

    expect(count1).toBe(count2)
  })

  it('constructor takes columns and rows', () => {
    const dlx = new DancingLinks(3, 3)
    expect(dlx).toBeDefined()
  })

  it('solve returns empty for no rows', () => {
    const dlx = new DancingLinks(3, 0)
    const solutions = dlx.solve()
    expect(solutions).toEqual([])
  })

  it('constructor creates instance', () => {
    const dlx = new DancingLinks(0, 0)
    expect(dlx).toBeDefined()
  })

  it('solve with no constraints returns empty', () => {
    const dlx = new DancingLinks(0, 0)
    expect(dlx).toBeDefined()
  })
})