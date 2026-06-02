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
})
