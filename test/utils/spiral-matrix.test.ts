import { describe, expect, it } from 'vitest'
import { SpiralMatrix } from '../../src/utils/spiral-matrix.js'

describe('SpiralMatrix', () => {
  it('generates 1x1 spiral', () => {
    expect(SpiralMatrix.generate(1)).toEqual([[1]])
  })

  it('generates 2x2 spiral', () => {
    expect(SpiralMatrix.generate(2)).toEqual([[1, 2], [4, 3]])
  })

  it('generates 3x3 spiral', () => {
    expect(SpiralMatrix.generate(3)).toEqual([
      [1, 2, 3],
      [8, 9, 4],
      [7, 6, 5],
    ])
  })

  it('generates 4x4 spiral', () => {
    const m = SpiralMatrix.generate(4)
    expect(m[0]).toEqual([1, 2, 3, 4])
    expect(m[3]![0]).toBe(10)
    expect(m[3]![3]).toBe(7)
  })

  it('handles n=0', () => {
    expect(SpiralMatrix.generate(0)).toEqual([])
  })

  it('generates 5x5 spiral', () => {
    const m = SpiralMatrix.generate(5)
    expect(m.length).toBe(5)
    expect(m[0]![0]).toBe(1)
    expect(m[0]![4]).toBe(5)
    expect(m[2]![2]).toBe(25)
  })

  it('generates 6x6 spiral', () => {
    const m = SpiralMatrix.generate(6)
    expect(m.length).toBe(6)
    expect(m[0]![0]).toBe(1)
    expect(m[0]![5]).toBe(6)
    expect(m[5]![0]).toBe(16)
  })

  it('generates 7x7 spiral', () => {
    const m = SpiralMatrix.generate(7)
    expect(m.length).toBe(7)
    expect(m[3]![3]).toBe(49)
  })

  it('traverse reads in spiral order', () => {
    const m = SpiralMatrix.generate(3)
    expect(SpiralMatrix.traverse(m)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('traverse handles empty matrix', () => {
    expect(SpiralMatrix.traverse([])).toEqual([])
  })

  it('traverse handles 1x1', () => {
    expect(SpiralMatrix.traverse([[42]])).toEqual([42])
  })

  it('traverse 2x2 matrix', () => {
    const m = [[1, 2], [3, 4]]
    expect(SpiralMatrix.traverse(m)).toEqual([1, 2, 4, 3])
  })

  it('traverse 3x3 matrix', () => {
    const m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    expect(SpiralMatrix.traverse(m)).toEqual([1, 2, 3, 6, 9, 8, 7, 4, 5])
  })

  it('traverse non-square matrix 2x3', () => {
    const m = [[1, 2, 3], [4, 5, 6]]
    expect(SpiralMatrix.traverse(m)).toEqual([1, 2, 3, 6, 5, 4])
  })

  it('traverse non-square matrix 3x2', () => {
    const m = [[1, 2], [3, 4], [5, 6]]
    expect(SpiralMatrix.traverse(m)).toEqual([1, 2, 4, 6, 5, 3])
  })

  it('traverse 4x3 matrix', () => {
    const m = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]]
    const result = SpiralMatrix.traverse(m)
    expect(result.length).toBe(12)
  })

  it('traverse 3x4 matrix', () => {
    const m = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]
    const result = SpiralMatrix.traverse(m)
    expect(result.length).toBe(12)
  })

  it('diagonalSum computes main + anti diagonal', () => {
    const m = SpiralMatrix.generate(3)
    expect(SpiralMatrix.diagonalSum(m)).toBe(25)
  })

  it('diagonalSum handles 1x1', () => {
    expect(SpiralMatrix.diagonalSum([[5]])).toBe(5)
  })

  it('diagonalSum for 2x2', () => {
    const m = [[1, 2], [3, 4]]
    expect(SpiralMatrix.diagonalSum(m)).toBe(10)
  })

  it('diagonalSum for 4x4', () => {
    const m = SpiralMatrix.generate(4)
    const sum = SpiralMatrix.diagonalSum(m)
    expect(sum).toBeGreaterThan(0)
  })

  it('diagonalSum for 5x5', () => {
    const m = SpiralMatrix.generate(5)
    const sum = SpiralMatrix.diagonalSum(m)
    expect(sum).toBe(133)
  })

  it('diagonalSum for odd size matrix avoids double counting center', () => {
    const m = SpiralMatrix.generate(3)
    const sum = SpiralMatrix.diagonalSum(m)
    expect(sum).toBe(25)
  })

  it('rotate90 rotates clockwise', () => {
    const m = [[1, 2], [3, 4]]
    expect(SpiralMatrix.rotate90(m)).toEqual([[3, 1], [4, 2]])
  })

  it('rotate90 preserves size', () => {
    const m = SpiralMatrix.generate(4)
    const r = SpiralMatrix.rotate90(m)
    expect(r.length).toBe(4)
    expect(r[0]!.length).toBe(4)
  })

  it('rotate90 3x3 matrix', () => {
    const m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    const r = SpiralMatrix.rotate90(m)
    expect(r).toEqual([[7, 4, 1], [8, 5, 2], [9, 6, 3]])
  })

  it('rotate90 twice is 180 degrees', () => {
    const m = [[1, 2], [3, 4]]
    const r = SpiralMatrix.rotate90(SpiralMatrix.rotate90(m))
    expect(r).toEqual([[4, 3], [2, 1]])
  })

  it('rotate90 four times returns original', () => {
    const m = [[1, 2], [3, 4]]
    const r = SpiralMatrix.rotate90(SpiralMatrix.rotate90(SpiralMatrix.rotate90(SpiralMatrix.rotate90(m))))
    expect(r).toEqual([[1, 2], [3, 4]])
  })

  it('rotate90 three times is 270 degrees', () => {
    const m = [[1, 2], [3, 4]]
    const r = SpiralMatrix.rotate90(SpiralMatrix.rotate90(SpiralMatrix.rotate90(m)))
    expect(r).toEqual([[2, 4], [1, 3]])
  })

  it('generate produces values 1 to n*n', () => {
    const m = SpiralMatrix.generate(4)
    const flat = m.flat()
    expect(flat.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])
  })

  it('generate produces correct number of elements', () => {
    const m = SpiralMatrix.generate(5)
    expect(m.flat().length).toBe(25)
  })

  it('generate produces correct number of elements for 6x6', () => {
    const m = SpiralMatrix.generate(6)
    expect(m.flat().length).toBe(36)
  })

  it('generate produces correct number of elements for 7x7', () => {
    const m = SpiralMatrix.generate(7)
    expect(m.flat().length).toBe(49)
  })

  it('generate has first row filled left to right', () => {
    const m = SpiralMatrix.generate(5)
    expect(m[0]![0]).toBe(1)
    expect(m[0]![1]).toBe(2)
    expect(m[0]![2]).toBe(3)
    expect(m[0]![3]).toBe(4)
    expect(m[0]![4]).toBe(5)
  })

  it('generate has last column filled top to bottom', () => {
    const m = SpiralMatrix.generate(5)
    expect(m[0]![4]).toBe(5)
    expect(m[1]![4]).toBe(6)
    expect(m[2]![4]).toBe(7)
    expect(m[3]![4]).toBe(8)
    expect(m[4]![4]).toBe(9)
  })

  it('generate has last row filled right to left', () => {
    const m = SpiralMatrix.generate(5)
    expect(m[4]![4]).toBe(9)
    expect(m[4]![3]).toBe(10)
    expect(m[4]![2]).toBe(11)
    expect(m[4]![1]).toBe(12)
    expect(m[4]![0]).toBe(13)
  })

  it('generate has first column filled bottom to top', () => {
    const m = SpiralMatrix.generate(5)
    expect(m[4]![0]).toBe(13)
    expect(m[3]![0]).toBe(14)
    expect(m[2]![0]).toBe(15)
    expect(m[1]![0]).toBe(16)
    expect(m[0]![0]).toBe(1)
  })

  it('traverse returns same values as generate produces', () => {
    const m = SpiralMatrix.generate(4)
    const traversed = SpiralMatrix.traverse(m)
    const sorted = traversed.sort((a, b) => a - b)
    expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])
  })

  it('traverse handles single row matrix', () => {
    const m = [[1, 2, 3, 4, 5]]
    expect(SpiralMatrix.traverse(m)).toEqual([1, 2, 3, 4, 5])
  })

  it('traverse handles single column matrix', () => {
    const m = [[1], [2], [3], [4], [5]]
    expect(SpiralMatrix.traverse(m)).toEqual([1, 2, 3, 4, 5])
  })

  it('diagonalSum for even size matrix', () => {
    const m = SpiralMatrix.generate(4)
    const sum = SpiralMatrix.diagonalSum(m)
    expect(sum % 2).toBe(0)
  })

  it('diagonalSum sum is always positive', () => {
    const m = SpiralMatrix.generate(3)
    expect(SpiralMatrix.diagonalSum(m)).toBeGreaterThan(0)
  })

  it('rotate90 handles 4x4 matrix', () => {
    const m = SpiralMatrix.generate(4)
    const r = SpiralMatrix.rotate90(m)
    expect(r.length).toBe(4)
    expect(r[0]!.length).toBe(4)
  })

  it('rotate90 handles 5x5 matrix', () => {
    const m = SpiralMatrix.generate(5)
    const r = SpiralMatrix.rotate90(m)
    expect(r.length).toBe(5)
    expect(r[0]!.length).toBe(5)
  })

  it('rotate90 preserves total sum', () => {
    const m = [[1, 2], [3, 4]]
    const originalSum = m.flat().reduce((a, b) => a + b, 0)
    const r = SpiralMatrix.rotate90(m)
    const rotatedSum = r.flat().reduce((a, b) => a + b, 0)
    expect(originalSum).toBe(rotatedSum)
  })

  it('generate 8x8 spiral has correct dimensions', () => {
    const m = SpiralMatrix.generate(8)
    expect(m.length).toBe(8)
    expect(m[0]!.length).toBe(8)
  })

  it('generate produces unique values', () => {
    const m = SpiralMatrix.generate(5)
    const flat = m.flat()
    const unique = new Set(flat)
    expect(unique.size).toBe(25)
  })

  it('traverse handles large matrix', () => {
    const m = SpiralMatrix.generate(10)
    const result = SpiralMatrix.traverse(m)
    expect(result.length).toBe(100)
  })

  it('generate 10x10 spiral has correct range', () => {
    const m = SpiralMatrix.generate(10)
    const flat = m.flat()
    expect(Math.min(...flat)).toBe(1)
    expect(Math.max(...flat)).toBe(100)
  })

  it('diagonalSum for 10x10 matrix', () => {
    const m = SpiralMatrix.generate(10)
    const sum = SpiralMatrix.diagonalSum(m)
    expect(sum).toBeGreaterThan(0)
    expect(sum).toBeLessThan(10000)
  })

  it('should handle 1x1 matrix', () => {
    const sm = new SpiralMatrix(1)
    expect(sm).toBeDefined()
  })

  it('should handle 2x2 matrix', () => {
    const sm = new SpiralMatrix(2)
    expect(sm).toBeDefined()
  })
})
