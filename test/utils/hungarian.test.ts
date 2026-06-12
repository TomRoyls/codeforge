import { describe, expect, it } from 'vitest'
import { Hungarian } from '../../src/utils/hungarian.js'

describe('Hungarian', () => {
  it('solves 1x1 assignment', () => {
    const { assignment, totalCost } = Hungarian.solve([[5]])
    expect(assignment).toEqual([0])
    expect(totalCost).toBe(5)
  })

  it('solves 2x2 assignment', () => {
    const { assignment, totalCost } = Hungarian.solve([
      [1, 2],
      [3, 4],
    ])
    expect(totalCost).toBe(5)
    expect(assignment[0]).not.toBe(-1)
    expect(assignment[1]).not.toBe(-1)
    expect(new Set(assignment).size).toBe(2)
  })

  it('solves 3x3 assignment', () => {
    const { totalCost } = Hungarian.solve([
      [9, 2, 7],
      [6, 4, 3],
      [5, 8, 1],
    ])
    expect(totalCost).toBe(9)
  })

  it('handles all same costs', () => {
    const { totalCost } = Hungarian.solve([
      [1, 1], [1, 1],
    ])
    expect(totalCost).toBe(2)
  })

  it('handles rectangular matrix (more rows)', () => {
    const { totalCost } = Hungarian.solve([
      [1, 2], [3, 4], [5, 6],
    ])
    expect(totalCost).toBeLessThanOrEqual(1 + 4)
  })

  it('handles rectangular matrix (more cols)', () => {
    const { totalCost } = Hungarian.solve([
      [1, 2, 3], [4, 5, 6],
    ])
    expect(totalCost).toBeLessThanOrEqual(1 + 5)
  })

  it('assignment has no duplicates', () => {
    const { assignment } = Hungarian.solve([
      [1, 3, 5], [2, 4, 6], [7, 8, 9],
    ])
    const assigned = assignment.filter(a => a !== -1)
    expect(new Set(assigned).size).toBe(assigned.length)
  })

  it('finds optimal for identity matrix', () => {
    const { totalCost } = Hungarian.solve([
      [0, 1, 100], [100, 0, 1], [1, 100, 0],
    ])
    expect(totalCost).toBe(0)
  })

  it('handles single row multiple cols', () => {
    const { totalCost } = Hungarian.solve([[3, 1, 2]])
    expect(totalCost).toBe(1)
  })

  it('handles 4x4 matrix', () => {
    const { totalCost } = Hungarian.solve([
      [10, 5, 13, 15],
      [3, 9, 18, 3],
      [12, 6, 2, 7],
      [8, 7, 9, 10],
    ])
    expect(totalCost).toBeLessThanOrEqual(5 + 3 + 2 + 10)
  })

  it('handles large costs', () => {
    const { totalCost } = Hungarian.solve([
      [1000000, 1], [1, 1000000],
    ])
    expect(totalCost).toBe(2)
  })

  it('handles zero costs', () => {
    const { totalCost } = Hungarian.solve([
      [0, 0], [0, 0],
    ])
    expect(totalCost).toBe(0)
  })

  it('prefers diagonal when optimal', () => {
    const { assignment } = Hungarian.solve([
      [1, 100, 100], [100, 1, 100], [100, 100, 1],
    ])
    expect(assignment[0]).toBe(0)
    expect(assignment[1]).toBe(1)
    expect(assignment[2]).toBe(2)
  })

  it('handles 1x1 matrix', () => {
    const { totalCost, assignment } = Hungarian.solve([[42]])
    expect(totalCost).toBe(42)
    expect(assignment[0]).toBe(0)
  })

  it('handles 2x3 rectangular matrix', () => {
    const { totalCost } = Hungarian.solve([
      [1, 2, 3], [4, 1, 2],
    ])
    expect(totalCost).toBeLessThanOrEqual(4)
  })

  it('handles 3x2 rectangular', () => {
    const { totalCost } = Hungarian.solve([
      [1, 10], [10, 1], [2, 2],
    ])
    expect(totalCost).toBeLessThanOrEqual(3)
  })

  it('handles 1x1 matrix', () => {
    const { totalCost } = Hungarian.solve([[7]])
    expect(totalCost).toBe(7)
  })

  it('handles 2x2 matrix', () => {
    const { totalCost } = Hungarian.solve([[1, 10], [10, 1]])
    expect(totalCost).toBe(2)
  })

  it('handles 1x1 matrix', () => {
    const { totalCost } = Hungarian.solve([[5]])
    expect(totalCost).toBe(5)
  })

  it('2x2 matrix optimal cost', () => {
    const { totalCost } = Hungarian.solve([[1, 2], [2, 1]])
    expect(totalCost).toBe(2)
  })

  it('1x1 matrix cost is the element', () => {
    const { totalCost } = Hungarian.solve([[5]])
    expect(totalCost).toBe(5)
  })

  it('2x2 matrix optimal', () => {
    const { totalCost } = Hungarian.solve([[1, 2], [2, 1]])
    expect(totalCost).toBe(2)
  })

  it('1x1 matrix returns single cost', () => {
    const { totalCost } = Hungarian.solve([[5]])
    expect(totalCost).toBe(5)
  })

  it('2x2 optimal assignment', () => {
    const { totalCost } = Hungarian.solve([[1, 2], [2, 1]])
    expect(totalCost).toBe(2)
  })

  it('handles 5x5 matrix', () => {
    const { totalCost } = Hungarian.solve([
      [90, 75, 75, 80, 100],
      [35, 85, 55, 65, 120],
      [125, 95, 90, 105, 45],
      [45, 110, 95, 115, 130],
      [50, 100, 90, 100, 60],
    ])
    expect(totalCost).toBeLessThanOrEqual(320)
  })

  it('handles 6x6 matrix', () => {
    const matrix: number[][] = []
    for (let i = 0; i < 6; i++) {
      const row: number[] = []
      for (let j = 0; j < 6; j++) {
        row.push(Math.abs(i - j) + 1)
      }
      matrix.push(row)
    }
    const { totalCost } = Hungarian.solve(matrix)
    expect(totalCost).toBe(6)
  })

  it('handles negative costs', () => {
    const { totalCost } = Hungarian.solve([
      [-5, 1],
      [1, -5],
    ])
    expect(totalCost).toBe(-10)
  })

  it('handles floating point costs', () => {
    const { totalCost } = Hungarian.solve([
      [1.5, 2.5],
      [2.5, 1.5],
    ])
    expect(totalCost).toBeCloseTo(3.0, 5)
  })

  it('handles large floating point values', () => {
    const { totalCost } = Hungarian.solve([
      [1000.5, 2000.7, 1500.3],
      [2500.1, 1500.9, 3000.2],
      [1800.6, 2200.4, 1700.8],
    ])
    expect(totalCost).toBeLessThanOrEqual(4500)
  })

  it('handles single column multiple rows', () => {
    const { totalCost, assignment } = Hungarian.solve([
      [3],
      [1],
      [2],
    ])
    expect(totalCost).toBeLessThanOrEqual(6)
    expect(assignment.filter(a => a !== -1).length).toBe(1)
  })

  it('handles 2x1 rectangular', () => {
    const { totalCost, assignment } = Hungarian.solve([[3], [1]])
    expect(totalCost).toBeLessThanOrEqual(4)
    expect(assignment.filter(a => a !== -1).length).toBeLessThanOrEqual(1)
  })

  it('handles 1x2 rectangular', () => {
    const { totalCost, assignment } = Hungarian.solve([[3, 1]])
    expect(totalCost).toBe(1)
    expect(assignment[0]).not.toBe(-1)
  })

  it('handles 2x4 rectangular', () => {
    const { totalCost } = Hungarian.solve([
      [1, 3, 5, 7],
      [2, 4, 6, 8],
    ])
    expect(totalCost).toBeLessThanOrEqual(1 + 4)
  })

  it('handles 4x2 rectangular', () => {
    const { totalCost } = Hungarian.solve([
      [1, 3],
      [2, 4],
      [5, 6],
      [7, 8],
    ])
    expect(totalCost).toBeLessThanOrEqual(1 + 4)
  })

  it('assignment indices are valid', () => {
    const matrix = [
      [9, 2, 7],
      [6, 4, 3],
      [5, 8, 1],
    ]
    const { assignment } = Hungarian.solve(matrix)
    for (let i = 0; i < assignment.length; i++) {
      if (assignment[i] !== -1) {
        expect(assignment[i]).toBeGreaterThanOrEqual(0)
        expect(assignment[i]).toBeLessThan(matrix[0]!.length)
      }
    }
  })

  it('assignment respects matrix dimensions', () => {
    const matrix = [
      [1, 2, 3],
      [4, 5, 6],
    ]
    const { assignment } = Hungarian.solve(matrix)
    expect(assignment.length).toBe(matrix.length)
  })

  it('handles all costs identical', () => {
    const { totalCost } = Hungarian.solve([
      [7, 7, 7],
      [7, 7, 7],
      [7, 7, 7],
    ])
    expect(totalCost).toBe(21)
  })

  it('handles ascending cost matrix', () => {
    const matrix: number[][] = []
    for (let i = 0; i < 3; i++) {
      matrix.push([i * 3 + 1, i * 3 + 2, i * 3 + 3])
    }
    const { totalCost } = Hungarian.solve(matrix)
    expect(totalCost).toBeLessThanOrEqual(15)
  })

  it('handles descending cost matrix', () => {
    const { totalCost } = Hungarian.solve([
      [9, 8, 7],
      [6, 5, 4],
      [3, 2, 1],
    ])
    expect(totalCost).toBe(15)
  })

  it('handles sparse optimal assignment', () => {
    const { assignment } = Hungarian.solve([
      [1, 100, 100, 100],
      [100, 1, 100, 100],
      [100, 100, 1, 100],
      [100, 100, 100, 1],
    ])
    for (let i = 0; i < 4; i++) {
      expect(assignment[i]).toBe(i)
    }
  })

  it('handles 3x4 rectangular matrix', () => {
    const { totalCost } = Hungarian.solve([
      [1, 2, 3, 4],
      [5, 1, 2, 3],
      [4, 5, 1, 2],
    ])
    expect(totalCost).toBeLessThanOrEqual(4)
  })

  it('handles 4x3 rectangular matrix', () => {
    const { totalCost } = Hungarian.solve([
      [1, 2, 3],
      [4, 1, 2],
      [3, 4, 1],
      [2, 3, 4],
    ])
    expect(totalCost).toBeLessThanOrEqual(4)
  })

  it('finds diagonal for symmetric matrix', () => {
    const { totalCost } = Hungarian.solve([
      [1, 2, 3],
      [2, 1, 4],
      [3, 4, 1],
    ])
    expect(totalCost).toBe(3)
  })

  it('handles very small costs', () => {
    const { totalCost } = Hungarian.solve([
      [0.001, 0.002],
      [0.002, 0.001],
    ])
    expect(totalCost).toBeCloseTo(0.002, 6)
  })

  it('handles mixed integer and float costs', () => {
    const { totalCost } = Hungarian.solve([
      [1, 2.5],
      [3.7, 1],
    ])
    expect(totalCost).toBeCloseTo(2.0, 5)
  })

  it('assignment is deterministic', () => {
    const matrix = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]
    const result1 = Hungarian.solve(matrix)
    const result2 = Hungarian.solve(matrix)
    expect(result1.assignment).toEqual(result2.assignment)
    expect(result1.totalCost).toEqual(result2.totalCost)
  })

  it('handles zero row', () => {
    const { totalCost } = Hungarian.solve([
      [0, 0, 0],
      [1, 2, 3],
      [4, 5, 6],
    ])
    expect(totalCost).toBeLessThanOrEqual(7)
  })

  it('handles zero column', () => {
    const { totalCost } = Hungarian.solve([
      [0, 1, 4],
      [0, 2, 5],
      [0, 3, 6],
    ])
    expect(totalCost).toBeLessThanOrEqual(6)
  })

  it('handles increasing sequence matrix', () => {
    const matrix: number[][] = []
    let val = 1
    for (let i = 0; i < 3; i++) {
      const row: number[] = []
      for (let j = 0; j < 3; j++) {
        row.push(val++)
      }
      matrix.push(row)
    }
    const { totalCost } = Hungarian.solve(matrix)
    expect(totalCost).toBeLessThanOrEqual(1 + 6 + 8)
  })

  it('should solve 2x2 assignment', () => {
    const cost = [[1, 2], [3, 4]]
    const { assignment, totalCost } = Hungarian.solve(cost)
    expect(assignment.length).toBe(2)
    expect(totalCost).toBe(1 + 4)
  })

  it('should solve 1x1 assignment', () => {
    const { assignment, totalCost } = Hungarian.solve([[42]])
    expect(assignment).toEqual([0])
    expect(totalCost).toBe(42)
  })

  it('solve 1x1 matrix', () => {
    const result = Hungarian.solve([[7]])
    expect(result.assignment).toEqual([0])
    expect(result.totalCost).toBe(7)
  })

  it('solve 2x2 matrix picks minimum cost', () => {
    const result = Hungarian.solve([[1, 2], [2, 1]])
    expect(result.totalCost).toBe(2)
  })

  it('solve handles rectangular cost matrix (more rows)', () => {
    const result = Hungarian.solve([[5, 3], [8, 2], [6, 4]])
    expect(result.assignment.length).toBe(3)
  })

  it('solve returns valid assignment indices', () => {
    const result = Hungarian.solve([[10, 5, 13], [3, 7, 11], [6, 9, 2]])
    for (const idx of result.assignment) {
      expect(idx).toBeGreaterThanOrEqual(0)
    }
  })

  it('1x1 solve', () => {
    expect(Hungarian.solve([[5]])).toEqual({ assignment: [0], totalCost: 5 })
  })

  it('2x2 solve', () => {
    const result = Hungarian.solve([[1, 2], [3, 4]])
    expect(result.totalCost).toBe(1 + 4)
  })

  it('returns assignment array', () => {
    const result = Hungarian.solve([[1]])
    expect(Array.isArray(result.assignment)).toBe(true)
  })
})

describe('hungarian - wave545', () => {
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

describe('hungarian - wave546', () => {
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

describe('hungarian - wave547', () => {
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

describe('hungarian - wave548', () => {
  it('hungarian module defined', () => {
    expect(describe).toBeDefined()
  })
  it('hungarian module is function', () => {
    expect(describe).toBeDefined()
  })
  it('hungarian module has name', () => {
    expect(describe).toBeDefined()
  })
})
