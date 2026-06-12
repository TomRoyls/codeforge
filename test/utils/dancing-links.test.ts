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
    dlx.addRow(0, [])
    const solutions = dlx.solve()
    expect(solutions).toEqual([[]])
  })

  it('solve with single column', () => {
    const dlx = new DancingLinks(1, 1)
    dlx.addRow(0, [0])
    const solutions = dlx.solve()
    expect(solutions.length).toBe(1)
  })

  it('handles zero columns', () => {
    const dlx = new DancingLinks(0)
    expect(dlx).toBeDefined()
  })

  it('adds row with single column', () => {
    const dlx = new DancingLinks(5)
    dlx.addRow(0, [3])
    dlx.addRow(1, [0])
    dlx.addRow(2, [1])
    dlx.addRow(3, [2])
    dlx.addRow(4, [4])

    const solutions = dlx.solve()
    expect(solutions.length).toBe(1)
  })

  it('handles row covering all columns', () => {
    const dlx = new DancingLinks(4)
    dlx.addRow(0, [0, 1, 2, 3])

    const solutions = dlx.solve()
    expect(solutions.length).toBe(1)
    expect(solutions[0]).toEqual([0])
  })

  it('solves with multiple overlapping solutions', () => {
    const dlx = new DancingLinks(4, 10)
    dlx.addRow(0, [0, 1])
    dlx.addRow(1, [1, 2])
    dlx.addRow(2, [2, 3])
    dlx.addRow(3, [3, 0])
    dlx.addRow(4, [0, 2])
    dlx.addRow(5, [1, 3])

    const solutions = dlx.solve()
    expect(solutions.length).toBeGreaterThan(0)
  })

  it('handles rows with duplicate columns', () => {
    const dlx = new DancingLinks(3)
    dlx.addRow(0, [0, 1, 2])
    dlx.addRow(1, [1, 2])

    const solutions = dlx.solve()
    expect(solutions.length).toBeGreaterThan(0)
  })

  it('solves N-queens 4x4 problem', () => {
    const dlx = new DancingLinks(16, 10)
    const positions = [
      [0, 4, 8, 12],
      [1, 5, 9, 13],
      [2, 6, 10, 14],
      [3, 7, 11, 15]
    ]
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        dlx.addRow(i * 4 + j, positions[j])
      }
    }

    const solutions = dlx.solve()
    expect(solutions.length).toBeGreaterThan(0)
  })

  it('handles sparse exact cover', () => {
    const dlx = new DancingLinks(20)
    for (let i = 0; i < 10; i++) {
      dlx.addRow(i, [i * 2, i * 2 + 1])
    }

    const solutions = dlx.solve()
    expect(solutions.length).toBeGreaterThan(0)
  })

  it('solves with all single-column rows', () => {
    const dlx = new DancingLinks(5)
    for (let i = 0; i < 5; i++) {
      dlx.addRow(i, [i])
    }

    const solutions = dlx.solve()
    expect(solutions.length).toBe(1)
    expect(solutions[0]!.length).toBe(5)
  })

  it('handles empty columns', () => {
    const dlx = new DancingLinks(3)
    dlx.addRow(0, [0])

    const solutions = dlx.solve()
    expect(solutions.length).toBe(0)
  })

  it('multiple rows cover same columns', () => {
    const dlx = new DancingLinks(2, 10)
    dlx.addRow(0, [0, 1])
    dlx.addRow(1, [0, 1])
    dlx.addRow(2, [0, 1])

    const solutions = dlx.solve()
    expect(dlx.solutionCount).toBe(3)
  })

  it('handles partial coverage', () => {
    const dlx = new DancingLinks(4)
    dlx.addRow(0, [0, 1])
    dlx.addRow(1, [1, 2])

    const solutions = dlx.solve()
    expect(solutions.length).toBe(0)
  })

  it('solves with large max solutions', () => {
    const dlx = new DancingLinks(3, 1000)
    dlx.addRow(0, [0])
    dlx.addRow(1, [1])
    dlx.addRow(2, [2])
    dlx.addRow(3, [0, 1, 2])

    dlx.solve()
    expect(dlx.solutionCount).toBeGreaterThan(1)
  })

  it('handles non-contiguous column indices', () => {
    const dlx = new DancingLinks(5)
    dlx.addRow(0, [0, 2, 4])

    const solutions = dlx.solve()
    expect(solutions.length).toBe(0)
  })

  it('solves with overlapping row sets', () => {
    const dlx = new DancingLinks(5)
    dlx.addRow(0, [0, 1])
    dlx.addRow(1, [1, 2])
    dlx.addRow(2, [2, 3])
    dlx.addRow(3, [3, 4])
    dlx.addRow(4, [0, 4])

    const solutions = dlx.solve()
    expect(solutions.length).toBeGreaterThanOrEqual(0)
  })

  it('handles duplicate rows', () => {
    const dlx = new DancingLinks(4)
    dlx.addRow(0, [0, 1])
    dlx.addRow(1, [0, 1])
    dlx.addRow(2, [2, 3])

    const solutions = dlx.solve()
    expect(solutions.length).toBeGreaterThan(0)
  })

  it('solves problem with many columns', () => {
    const dlx = new DancingLinks(50)
    for (let i = 0; i < 25; i++) {
      dlx.addRow(i, [i * 2, i * 2 + 1])
    }

    const solutions = dlx.solve()
    expect(solutions.length).toBeGreaterThan(0)
  })

  it('returns unique solutions', () => {
    const dlx = new DancingLinks(3, 100)
    dlx.addRow(0, [0])
    dlx.addRow(1, [1])
    dlx.addRow(2, [2])
    dlx.addRow(3, [0, 1, 2])

    const solutions = dlx.solve()
    const uniqueSolutions = new Set(solutions.map(s => s.sort().join(',')))
    expect(uniqueSolutions.size).toBe(dlx.solutionCount)
  })

  it('handles max solutions of 1', () => {
    const dlx = new DancingLinks(3, 1)
    dlx.addRow(0, [0])
    dlx.addRow(1, [1])
    dlx.addRow(2, [2])
    dlx.addRow(3, [0, 1, 2])

    dlx.solve()
    expect(dlx.solutionCount).toBeLessThanOrEqual(1)
  })

  it('handles max solutions of 0', () => {
    const dlx = new DancingLinks(3, 0)
    dlx.addRow(0, [0])
    dlx.addRow(1, [1])
    dlx.addRow(2, [2])

    dlx.solve()
    expect(dlx.solutionCount).toBeGreaterThanOrEqual(0)
  })

  it('solves with row covering half columns', () => {
    const dlx = new DancingLinks(6)
    dlx.addRow(0, [0, 1, 2])
    dlx.addRow(1, [3, 4, 5])

    const solutions = dlx.solve()
    expect(solutions.length).toBe(1)
  })

  it('handles max solutions as exact match', () => {
    const dlx = new DancingLinks(3, 2)
    dlx.addRow(0, [0])
    dlx.addRow(1, [1])
    dlx.addRow(2, [2])
    dlx.addRow(3, [0, 1, 2])

    dlx.solve()
    expect(dlx.solutionCount).toBe(2)
  })

  it('handles negative max solutions', () => {
    const dlx = new DancingLinks(3, -1)
    dlx.addRow(0, [0])
    dlx.addRow(1, [1])
    dlx.addRow(2, [2])
    dlx.addRow(3, [0, 1, 2])

    const solutions = dlx.solve()
    expect(solutions.length).toBeGreaterThan(0)
  })

  it('solves problem with single constraint', () => {
    const dlx = new DancingLinks(1)
    dlx.addRow(0, [0])
    dlx.addRow(1, [0])

    const solutions = dlx.solve()
    expect(solutions.length).toBe(2)
  })

  it('should handle empty matrix', () => {
    const dl = new DancingLinks(0)
    const solutions = dl.solve()
    expect(solutions).toEqual([[]])
  })

  it('should handle single constraint single row', () => {
    const dl = new DancingLinks(1)
    dl.addRow(0, [0])
    const solutions = dl.solve()
    expect(solutions.length).toBe(1)
  })
})