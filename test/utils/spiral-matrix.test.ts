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

  it('diagonalSum computes main + anti diagonal', () => {
    const m = SpiralMatrix.generate(3)
    expect(SpiralMatrix.diagonalSum(m)).toBe(25)
  })

  it('diagonalSum handles 1x1', () => {
    expect(SpiralMatrix.diagonalSum([[5]])).toBe(5)
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

  it('generate produces values 1 to n*n', () => {
    const m = SpiralMatrix.generate(4)
    const flat = m.flat()
    expect(flat.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])
  })

  it('rotate90 twice is 180 degrees', () => {
    const m = [[1, 2], [3, 4]]
    const r = SpiralMatrix.rotate90(SpiralMatrix.rotate90(m))
    expect(r).toEqual([[4, 3], [2, 1]])
  })

  it('traverse non-square matrix', () => {
    const m = [[1, 2, 3], [4, 5, 6]]
    expect(SpiralMatrix.traverse(m)).toEqual([1, 2, 3, 6, 5, 4])
  })

  it('5x5 spiral center is 25', () => {
    const m = SpiralMatrix.generate(5)
    expect(m[2]![2]).toBe(25)
    expect(m.flat().length).toBe(25)
  })

  it('1x1 matrix is [[1]]', () => {
    const m = SpiralMatrix.generate(1)
    expect(m).toEqual([[1]])
  })

  it('2x2 matrix fills clockwise', () => {
    const m = SpiralMatrix.generate(2)
    expect(m).toEqual([[1, 2], [4, 3]])
  })

  it('3x3 matrix center is 9', () => {
    const m = SpiralMatrix.generate(3)
    expect(m[1]![1]).toBe(9)
  })
})
