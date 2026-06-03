import { describe, expect, it } from 'vitest'
import { GaussianElimination } from '../../src/utils/gaussian-elimination.js'

describe('GaussianElimination', () => {
  it('solves 2x2 system', () => {
    const result = GaussianElimination.solve([
      [2, 1, 5],
      [1, 3, 10],
    ])
    expect(result).not.toBeNull()
    expect(result![0]).toBeCloseTo(1, 8)
    expect(result![1]).toBeCloseTo(3, 8)
  })

  it('solves 3x3 system', () => {
    const result = GaussianElimination.solve([
      [2, 1, -1, 8],
      [-3, -1, 2, -11],
      [-2, 1, 2, -3],
    ])
    expect(result).not.toBeNull()
    expect(result![0]).toBeCloseTo(2, 6)
    expect(result![1]).toBeCloseTo(3, 6)
    expect(result![2]).toBeCloseTo(-1, 6)
  })

  it('returns null for singular system', () => {
    const result = GaussianElimination.solve([
      [1, 2, 3],
      [2, 4, 6],
    ])
    expect(result).toBeNull()
  })

  it('solves identity system', () => {
    const result = GaussianElimination.solve([
      [1, 0, 0, 1],
      [0, 1, 0, 2],
      [0, 0, 1, 3],
    ])
    expect(result).toEqual([1, 2, 3])
  })

  it('handles partial pivoting', () => {
    const result = GaussianElimination.solve([
      [0.0001, 1, 1],
      [1, 1, 2],
    ])
    expect(result).not.toBeNull()
    expect(result![0]).toBeCloseTo(1, 3)
    expect(result![1]).toBeCloseTo(1, 3)
  })

  it('solves single equation', () => {
    const result = GaussianElimination.solve([[5, 10]])
    expect(result).not.toBeNull()
    expect(result![0]).toBeCloseTo(2, 8)
  })

  it('computes determinant of identity', () => {
    expect(GaussianElimination.determinant([[1, 0], [0, 1]])).toBeCloseTo(1, 8)
  })

  it('computes determinant of 2x2', () => {
    expect(GaussianElimination.determinant([[1, 2], [3, 4]])).toBeCloseTo(-2, 8)
  })

  it('computes determinant of 3x3', () => {
    expect(GaussianElimination.determinant([[1, 2, 3], [4, 5, 6], [7, 8, 9]])).toBeCloseTo(0, 6)
  })

  it('determinant of singular matrix is 0', () => {
    expect(GaussianElimination.determinant([[1, 2], [2, 4]])).toBeCloseTo(0, 8)
  })

  it('computes rank of full rank matrix', () => {
    expect(GaussianElimination.rank([[1, 0], [0, 1]])).toBe(2)
  })

  it('computes rank of rank-deficient matrix', () => {
    expect(GaussianElimination.rank([[1, 2], [2, 4]])).toBe(1)
  })

  it('computes rank of zero matrix', () => {
    expect(GaussianElimination.rank([[0, 0], [0, 0]])).toBe(0)
  })

  it('rank of 3x2 matrix', () => {
    expect(GaussianElimination.rank([[1, 0], [0, 1], [1, 1]])).toBe(2)
  })

  it('solves system with negative solution', () => {
    const result = GaussianElimination.solve([
      [1, 1, 0],
      [1, -1, -4],
    ])
    expect(result).not.toBeNull()
    expect(result![0]).toBeCloseTo(-2, 8)
    expect(result![1]).toBeCloseTo(2, 8)
  })

  it('rank of identity matrix', () => {
    expect(GaussianElimination.rank([[1, 0], [0, 1]])).toBe(2)
  })

  it('rank of zero matrix is 0', () => {
    expect(GaussianElimination.rank([[0, 0], [0, 0]])).toBe(0)
  })

  it('rank of identity is 2', () => {
    expect(GaussianElimination.rank([[1, 0], [0, 1]])).toBe(2)
  })

  it('rank of zero matrix is 0', () => {
    expect(GaussianElimination.rank([[0, 0], [0, 0]])).toBe(0)
  })

  it('rank of identity matrix is 2', () => {
    expect(GaussianElimination.rank([[1, 0], [0, 1]])).toBe(2)
  })

  it('rank of zero matrix is 0', () => {
    expect(GaussianElimination.rank([[0, 0], [0, 0]])).toBe(0)
  })

  it('rank of identity 2x2 is 2', () => {
    expect(GaussianElimination.rank([[1, 0], [0, 1]])).toBe(2)
  })

  it('rank of zero matrix is 0', () => {
    expect(GaussianElimination.rank([[0, 0], [0, 0]])).toBe(0)
  })
})
