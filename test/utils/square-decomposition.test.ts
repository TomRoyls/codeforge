import { describe, expect, it } from 'vitest'
import { SquareDecomposition } from '../../src/utils/square-decomposition.js'

describe('SquareDecomposition', () => {
  it('query returns range sum', () => {
    const sd = new SquareDecomposition([1, 2, 3, 4, 5])
    expect(sd.query(0, 4)).toBe(15)
  })

  it('query partial range', () => {
    const sd = new SquareDecomposition([1, 2, 3, 4, 5])
    expect(sd.query(1, 3)).toBe(9)
  })

  it('update changes value', () => {
    const sd = new SquareDecomposition([1, 2, 3, 4, 5])
    sd.update(2, 10)
    expect(sd.get(2)).toBe(10)
    expect(sd.query(0, 4)).toBe(22)
  })

  it('handles single element', () => {
    const sd = new SquareDecomposition([42])
    expect(sd.query(0, 0)).toBe(42)
  })

  it('handles empty array', () => {
    const sd = new SquareDecomposition([])
    expect(sd.length).toBe(0)
  })

  it('get returns value at index', () => {
    const sd = new SquareDecomposition([10, 20, 30])
    expect(sd.get(1)).toBe(20)
  })

  it('toArray returns copy', () => {
    const sd = new SquareDecomposition([1, 2, 3])
    expect(sd.toArray()).toEqual([1, 2, 3])
  })

  it('length returns correctly', () => {
    const sd = new SquareDecomposition([1, 2, 3, 4, 5])
    expect(sd.length).toBe(5)
  })

  it('handles large array', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i + 1)
    const sd = new SquareDecomposition(arr)
    expect(sd.query(0, 99)).toBe(5050)
  })

  it('multiple updates', () => {
    const sd = new SquareDecomposition([1, 2, 3, 4, 5])
    sd.update(0, 10)
    sd.update(4, 10)
    expect(sd.query(0, 4)).toBe(29)
  })

  it('query single element', () => {
    const sd = new SquareDecomposition([10, 20, 30])
    expect(sd.query(1, 1)).toBe(20)
  })

  it('handles custom block size', () => {
    const sd = new SquareDecomposition([1, 2, 3, 4, 5, 6], 2)
    expect(sd.query(0, 5)).toBe(21)
    sd.update(2, 10)
    expect(sd.get(2)).toBe(10)
  })

  it('handles single element', () => {
    const sd = new SquareDecomposition([42])
    expect(sd.query(0, 0)).toBe(42)
  })

  it('handles update then query', () => {
    const sd = new SquareDecomposition([1, 2, 3])
    sd.update(1, 10)
    expect(sd.query(0, 2)).toBe(14)
    expect(sd.get(1)).toBe(10)
  })

  it('handles all same values', () => {
    const sd = new SquareDecomposition([5, 5, 5, 5, 5])
    expect(sd.query(0, 4)).toBe(25)
  })

  it('handles single element', () => {
    const sd = new SquareDecomposition([99])
    expect(sd.query(0, 0)).toBe(99)
    expect(sd.get(0)).toBe(99)
  })

  it('handles update', () => {
    const sd = new SquareDecomposition([1, 2, 3, 4])
    sd.update(1, 10)
    expect(sd.get(1)).toBe(10)
    expect(sd.query(0, 3)).toBe(18)
  })

  it('get returns initial values', () => {
    const sd = new SquareDecomposition([10, 20, 30])
    expect(sd.get(0)).toBe(10)
    expect(sd.get(2)).toBe(30)
  })

  it('query for full array sum', () => {
    const sd = new SquareDecomposition([1, 2, 3, 4])
    expect(sd.query(0, 3)).toBe(10)
  })

  it('query single element', () => {
    const sd = new SquareDecomposition([7])
    expect(sd.query(0, 0)).toBe(7)
  })
})
