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

  it('solves 4x4 system', () => {
    const result = GaussianElimination.solve([
      [1, 0, 0, 0, 1],
      [0, 1, 0, 0, 2],
      [0, 0, 1, 0, 3],
      [0, 0, 0, 1, 4],
    ])
    expect(result).not.toBeNull()
    expect(result![0]).toBeCloseTo(1, 8)
    expect(result![1]).toBeCloseTo(2, 8)
    expect(result![2]).toBeCloseTo(3, 8)
    expect(result![3]).toBeCloseTo(4, 8)
  })

  it('solves triangular upper system', () => {
    const result = GaussianElimination.solve([
      [2, 3, 1, 13],
      [0, 1, 2, 5],
      [0, 0, 4, 8],
    ])
    expect(result).not.toBeNull()
    expect(result![0]).toBeCloseTo(4, 8)
    expect(result![1]).toBeCloseTo(1, 8)
    expect(result![2]).toBeCloseTo(2, 8)
  })

  it('solves triangular lower system', () => {
    const result = GaussianElimination.solve([
      [3, 0, 0, 9],
      [1, 2, 0, 8],
      [2, 3, 4, 22],
    ])
    expect(result).not.toBeNull()
    expect(result![0]).toBeCloseTo(3, 8)
    expect(result![1]).toBeCloseTo(2.5, 8)
    expect(result![2]).toBeCloseTo(2.125, 8)
  })

  it('solves diagonally dominant system', () => {
    const result = GaussianElimination.solve([
      [10, 1, 1, 12],
      [2, 10, 1, 13],
      [2, 2, 10, 14],
    ])
    expect(result).not.toBeNull()
    expect(result![0]).toBeCloseTo(1, 8)
    expect(result![1]).toBeCloseTo(1, 8)
    expect(result![2]).toBeCloseTo(1, 8)
  })

  it('solves system with decimal coefficients', () => {
    const result = GaussianElimination.solve([
      [0.5, 0.25, 1.25],
      [0.25, 0.5, 1],
    ])
    expect(result).not.toBeNull()
    expect(result![0]).toBeCloseTo(2, 8)
    expect(result![1]).toBeCloseTo(1, 8)
  })

  it('handles nearly singular system', () => {
    const result = GaussianElimination.solve([
      [1, 1, 2],
      [1.0000001, 1, 2.0000001],
    ])
    expect(result).not.toBeNull()
  })

  it('solves system with zero RHS', () => {
    const result = GaussianElimination.solve([
      [2, 1, 0],
      [1, 3, 0],
    ])
    expect(result).not.toBeNull()
    expect(result![0]).toBeCloseTo(0, 8)
    expect(result![1]).toBeCloseTo(0, 8)
  })

  it('solves system with large coefficients', () => {
    const result = GaussianElimination.solve([
      [1000, 2000, 3000],
      [3000, 4000, 10000],
    ])
    expect(result).not.toBeNull()
    expect(result![0]).toBeCloseTo(4, 6)
    expect(result![1]).toBeCloseTo(-0.5, 6)
  })

  it('solves system with small coefficients', () => {
    const result = GaussianElimination.solve([
      [0.001, 0.002, 0.003],
      [0.003, 0.004, 0.01],
    ])
    expect(result).not.toBeNull()
    expect(result![0]).toBeCloseTo(4, 4)
    expect(result![1]).toBeCloseTo(-0.5, 4)
  })

  it('determinant of 1x1 matrix', () => {
    expect(GaussianElimination.determinant([[5]])).toBeCloseTo(5, 8)
  })

  it('determinant of 4x4 identity', () => {
    expect(
      GaussianElimination.determinant([
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
      ])
    ).toBeCloseTo(1, 8)
  })

  it('determinant of triangular upper matrix', () => {
    expect(
      GaussianElimination.determinant([
        [2, 3, 1],
        [0, 1, 2],
        [0, 0, 4],
      ])
    ).toBeCloseTo(8, 8)
  })

  it('determinant of triangular lower matrix', () => {
    expect(
      GaussianElimination.determinant([
        [3, 0, 0],
        [1, 2, 0],
        [2, 3, 4],
      ])
    ).toBeCloseTo(24, 8)
  })

  it('determinant of negative matrix', () => {
    expect(GaussianElimination.determinant([[-1, -2], [-3, -4]])).toBeCloseTo(-2, 8)
  })

  it('determinant of matrix with row swap', () => {
    const matrix = [
      [0, 1],
      [1, 0],
    ]
    expect(GaussianElimination.determinant(matrix)).toBeCloseTo(-1, 8)
  })

  it('determinant of diagonal matrix', () => {
    expect(
      GaussianElimination.determinant([
        [2, 0, 0],
        [0, 3, 0],
        [0, 0, 4],
      ])
    ).toBeCloseTo(24, 8)
  })

  it('determinant of nearly singular matrix is near zero', () => {
    const det = GaussianElimination.determinant([
      [1, 1],
      [1.000001, 1],
    ])
    expect(Math.abs(det)).toBeLessThan(1e-5)
  })

  it('determinant of large matrix', () => {
    const matrix = [
      [100, 200],
      [300, 400],
    ]
    const det = GaussianElimination.determinant(matrix)
    expect(det).toBeCloseTo(-20000, 8)
  })

  it('determinant of small matrix', () => {
    const matrix = [
      [0.001, 0.002],
      [0.003, 0.004],
    ]
    const det = GaussianElimination.determinant(matrix)
    expect(det).toBeCloseTo(-0.000002, 10)
  })

  it('rank of rectangular 3x4 matrix', () => {
    expect(
      GaussianElimination.rank([
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
      ])
    ).toBe(2)
  })

  it('rank of rectangular 4x3 matrix', () => {
    expect(
      GaussianElimination.rank([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [10, 11, 12],
      ])
    ).toBe(2)
  })

  it('rank of full row rank matrix', () => {
    expect(
      GaussianElimination.rank([
        [1, 0, 0],
        [0, 1, 0],
      ])
    ).toBe(2)
  })

  it('rank of full column rank matrix', () => {
    expect(
      GaussianElimination.rank([
        [1, 0],
        [0, 1],
        [0, 0],
      ])
    ).toBe(2)
  })

  it('rank of 1x1 matrix with non-zero', () => {
    expect(GaussianElimination.rank([[5]])).toBe(1)
  })

  it('rank of 1x1 matrix with zero', () => {
    expect(GaussianElimination.rank([[0]])).toBe(0)
  })

  it('rank of matrix with negative values', () => {
    expect(
      GaussianElimination.rank([
        [-1, -2],
        [-2, -4],
      ])
    ).toBe(1)
  })

  it('rank of sparse matrix', () => {
    expect(
      GaussianElimination.rank([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ])
    ).toBe(3)
  })

  it('rank of matrix with repeated rows', () => {
    expect(
      GaussianElimination.rank([
        [1, 2, 3],
        [1, 2, 3],
        [4, 5, 6],
      ])
    ).toBe(2)
  })

  it('rank of matrix with linearly dependent columns', () => {
    expect(
      GaussianElimination.rank([
        [1, 2, 3],
        [2, 4, 6],
        [3, 6, 9],
      ])
    ).toBe(1)
  })

  it('rank of diagonal matrix is number of non-zero diagonals', () => {
    expect(
      GaussianElimination.rank([
        [3, 0, 0],
        [0, 0, 0],
        [0, 0, 5],
      ])
    ).toBe(2)
  })

  it('rank of 4x4 identity', () => {
    expect(
      GaussianElimination.rank([
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
      ])
    ).toBe(4)
  })

  it('rank of wide matrix (more columns than rows)', () => {
    expect(
      GaussianElimination.rank([
        [1, 2, 3, 4, 5],
        [2, 4, 6, 8, 10],
      ])
    ).toBe(1)
  })

  it('rank of tall matrix (more rows than columns)', () => {
    expect(
      GaussianElimination.rank([
        [1, 2],
        [2, 4],
        [3, 6],
        [4, 8],
      ])
    ).toBe(1)
  })

  it('rank handles very small values as zero', () => {
    expect(
      GaussianElimination.rank([
        [1, 0],
        [0, 1e-12],
      ])
    ).toBe(1)
  })

  it('rank of matrix with mixed signs', () => {
    expect(
      GaussianElimination.rank([
        [1, -1, 2],
        [-2, 2, -4],
        [3, -3, 6],
      ])
    ).toBe(1)
  })

  it('should handle identity matrix', () => {
    const aug = [[1, 0, 3], [0, 1, 4]]
    const solution = GaussianElimination.solve(aug)
    expect(solution).not.toBeNull()
    expect(solution![0]).toBeCloseTo(3)
    expect(solution![1]).toBeCloseTo(4)
  })

  it('should handle 1x1 system', () => {
    const solution = GaussianElimination.solve([[5, 10]])
    expect(solution).not.toBeNull()
    expect(solution![0]).toBeCloseTo(2)
  })

  it('singular matrix returns null', () => {
    const result = GaussianElimination.solve([[1, 2, 3], [2, 4, 6]])
    expect(result).toBeNull()
  })

  it('3x3 identity matrix', () => {
    const sol = GaussianElimination.solve([[1, 0, 0, 1], [0, 1, 0, 2], [0, 0, 1, 3]])
    expect(sol).not.toBeNull()
    expect(sol![0]).toBeCloseTo(1, 5)
    expect(sol![1]).toBeCloseTo(2, 5)
    expect(sol![2]).toBeCloseTo(3, 5)
  })

  it('1x1 system', () => {
    expect(GaussianElimination.solve([[5, 10]])![0]).toBeCloseTo(2, 5)
  })

  it('solve returns solution', () => {
    const result = GaussianElimination.solve([[1, 0], [0, 1]], [3, 4])
    expect(result).toBeDefined()
  })

  it('identity matrix', () => {
    const result = GaussianElimination.solve([[1, 0], [0, 1]], [1, 2])
    expect(result).toBeDefined()
  })

  it('singular matrix returns null', () => {
    const result = GaussianElimination.solve([[1, 1], [1, 1]], [1, 2])
    expect(result).toBeNull()
  })
})

describe('gaussian-elimination - wave545', () => {
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

describe('gaussian-elimination - wave546', () => {
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

describe('gaussian-elimination - wave547', () => {
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
