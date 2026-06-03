import { describe, expect, it } from 'vitest'
import { IntegerPartition } from '../../src/utils/integer-partition.js'

describe('IntegerPartition', () => {
  it('generates partitions of 4', () => {
    const result = IntegerPartition.generate(4)
    expect(result).toEqual([
      [4], [3, 1], [2, 2], [2, 1, 1], [1, 1, 1, 1],
    ])
  })

  it('generates partitions of 1', () => {
    expect(IntegerPartition.generate(1)).toEqual([[1]])
  })

  it('generates partitions of 2', () => {
    expect(IntegerPartition.generate(2)).toEqual([[2], [1, 1]])
  })

  it('handles 0', () => {
    expect(IntegerPartition.generate(0)).toEqual([])
  })

  it('handles negative', () => {
    expect(IntegerPartition.generate(-1)).toEqual([])
  })

  it('count returns partition number', () => {
    expect(IntegerPartition.count(1)).toBe(1)
    expect(IntegerPartition.count(4)).toBe(5)
    expect(IntegerPartition.count(5)).toBe(7)
    expect(IntegerPartition.count(10)).toBe(42)
  })

  it('count matches generate length', () => {
    for (let n = 1; n <= 10; n++) {
      expect(IntegerPartition.generate(n).length).toBe(IntegerPartition.count(n))
    }
  })

  it('all parts sum to n', () => {
    for (const partition of IntegerPartition.generate(6)) {
      expect(partition.reduce((a, b) => a + b, 0)).toBe(6)
    }
  })

  it('generateDistinct returns distinct parts', () => {
    const result = IntegerPartition.generateDistinct(5)
    for (const partition of result) {
      expect(new Set(partition).size).toBe(partition.length)
    }
  })

  it('generateDistinct of 5', () => {
    const result = IntegerPartition.generateDistinct(5)
    expect(result).toEqual([[1, 4], [2, 3], [5]])
  })

  it('generateDistinct handles 0', () => {
    expect(IntegerPartition.generateDistinct(0)).toEqual([[]])
  })

  it('generateFixedLength returns partitions of exact length', () => {
    const result = IntegerPartition.generateFixedLength(5, 2)
    for (const p of result) {
      expect(p.length).toBe(2)
      expect(p.reduce((a, b) => a + b, 0)).toBe(5)
    }
  })

  it('generateFixedLength of 5 into 3 parts', () => {
    const result = IntegerPartition.generateFixedLength(5, 3)
    expect(result).toEqual([[1, 1, 3], [1, 2, 2]])
  })

  it('partitions are in non-increasing order', () => {
    for (const partition of IntegerPartition.generate(7)) {
      for (let i = 1; i < partition.length; i++) {
        expect(partition[i]!).toBeLessThanOrEqual(partition[i - 1]!)
      }
    }
  })

  it('generateDistinct of 6', () => {
    const result = IntegerPartition.generateDistinct(6)
    expect(result.length).toBe(4)
  })

  it('counts partitions correctly', () => {
    expect(IntegerPartition.count(1)).toBe(1)
    expect(IntegerPartition.count(4)).toBe(5)
  })

  it('counts partitions of 5', () => {
    expect(IntegerPartition.count(5)).toBe(7)
  })

  it('counts partitions of 1', () => {
    expect(IntegerPartition.count(1)).toBe(1)
  })

  it('counts partitions of 4', () => {
    expect(IntegerPartition.count(4)).toBe(5)
  })

  it('counts partitions of 1', () => {
    expect(IntegerPartition.count(1)).toBe(1)
  })

  it('counts partitions of 4', () => {
    expect(IntegerPartition.count(4)).toBe(5)
  })

  it('counts partitions of 5', () => {
    expect(IntegerPartition.count(5)).toBe(7)
  })

  it('count of 1 is 1', () => {
    expect(IntegerPartition.count(1)).toBe(1)
  })
})
