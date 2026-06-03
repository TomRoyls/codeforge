import { describe, it, expect } from 'vitest'
import { EliasFano } from '../../src/utils/elias-fano.js'

describe('EliasFano', () => {
  it('creates encoding from sorted array', () => {
    const values = [3, 7, 15, 23, 42]
    const ef = new EliasFano(values)
    expect(ef.length).toBe(5)
  })

  it('creates encoding from sorted array using fromSorted', () => {
    const values = [3, 7, 15, 23, 42]
    const ef = EliasFano.fromSorted(values)
    expect(ef.length).toBe(5)
  })

  it('accesses values by index', () => {
    const values = [3, 7, 15, 23, 42]
    const ef = new EliasFano(values)
    expect(ef.get(0)).toBe(3)
    expect(ef.get(1)).toBe(7)
    expect(ef.get(2)).toBe(15)
    expect(ef.get(3)).toBe(23)
    expect(ef.get(4)).toBe(42)
  })

  it('throws error for out of bounds index', () => {
    const values = [3, 7, 15]
    const ef = new EliasFano(values)
    expect(() => ef.get(-1)).toThrow(RangeError)
    expect(() => ef.get(3)).toThrow(RangeError)
  })

  it('finds index of existing value', () => {
    const values = [3, 7, 15, 23, 42]
    const ef = new EliasFano(values)
    expect(ef.indexOf(15)).toBe(2)
    expect(ef.indexOf(42)).toBe(4)
  })

  it('returns -1 for non-existing value', () => {
    const values = [3, 7, 15, 23, 42]
    const ef = new EliasFano(values)
    expect(ef.indexOf(5)).toBe(-1)
    expect(ef.indexOf(100)).toBe(-1)
  })

  it('finds next greater or equal value', () => {
    const values = [3, 7, 15, 23, 42]
    const ef = new EliasFano(values)
    expect(ef.nextGEQ(5)).toBe(1)
    expect(ef.nextGEQ(15)).toBe(2)
    expect(ef.nextGEQ(20)).toBe(3)
  })

  it('returns -1 when no value is greater or equal', () => {
    const values = [3, 7, 15, 23, 42]
    const ef = new EliasFano(values)
    expect(ef.nextGEQ(100)).toBe(-1)
  })

  it('handles empty array', () => {
    const ef = new EliasFano([])
    expect(ef.length).toBe(0)
    expect(ef.encodedSize).toBe(0)
  })

  it('handles single element array', () => {
    const values = [42]
    const ef = new EliasFano(values)
    expect(ef.length).toBe(1)
    expect(ef.get(0)).toBe(42)
  })

  it('handles monotonic sequence', () => {
    const values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    const ef = new EliasFano(values)
    expect(ef.length).toBe(10)
    expect(ef.get(5)).toBe(5)
    expect(ef.indexOf(7)).toBe(7)
  })

  it('handles large values', () => {
    const values = [1000000, 2000000, 3000000, 4000000, 5000000]
    const ef = new EliasFano(values)
    expect(ef.length).toBe(5)
    expect(ef.get(2)).toBe(3000000)
    expect(ef.indexOf(4000000)).toBe(3)
  })

  it('converts to array', () => {
    const values = [3, 7, 15, 23, 42]
    const ef = new EliasFano(values)
    const result = ef.toArray()
    expect(result).toEqual(values)
  })

  it('iterates with forEach', () => {
    const values = [3, 7, 15, 23, 42]
    const ef = new EliasFano(values)
    const result: number[] = []
    ef.forEach((v, i) => {
      result.push(v)
      expect(v).toBe(values[i]!)
    })
    expect(result).toEqual(values)
  })

  it('handles all zero values', () => {
    const values = [0, 0, 0, 0]
    const ef = new EliasFano(values)
    expect(ef.length).toBe(4)
    expect(ef.get(0)).toBe(0)
    expect(ef.get(3)).toBe(0)
  })

  it('throws error on empty encoding get', () => {
    const ef = new EliasFano([])
    expect(() => ef.get(0)).toThrow(RangeError)
  })

  it('returns encoded size', () => {
    const values = [3, 7, 15, 23, 42]
    const ef = new EliasFano(values)
    expect(ef.encodedSize).toBeGreaterThan(0)
  })

  it('handles consecutive numbers', () => {
    const values = [100, 101, 102, 103, 104]
    const ef = new EliasFano(values)
    expect(ef.length).toBe(5)
    expect(ef.get(2)).toBe(102)
  })

  it('handles large gap between values', () => {
    const values = [1, 1000, 1000000]
    const ef = new EliasFano(values)
    expect(ef.length).toBe(3)
    expect(ef.get(0)).toBe(1)
    expect(ef.get(1)).toBe(1000)
    expect(ef.get(2)).toBe(1000000)
  })

  it('length returns correct count', () => {
    const ef = EliasFano.fromSorted([10, 20, 30])
    expect(ef.length).toBe(3)
  })

  it('get returns value at index', () => {
    const ef = EliasFano.fromSorted([10, 20, 30])
    expect(ef.get(0)).toBe(10)
    expect(ef.get(2)).toBe(30)
  })

  it('indexOf existing value', () => {
    const ef = EliasFano.fromSorted([10, 20, 30])
    expect(ef.indexOf(20)).toBe(1)
  })

  it('indexOf missing value returns -1', () => {
    const ef = EliasFano.fromSorted([10, 20, 30])
    expect(ef.indexOf(15)).toBeLessThan(0)
  })
})