import { describe, it, expect } from 'vitest'
import { BurstSort2 } from '../../src/core/burst-sort-2/index.js'

describe('BurstSort2', () => {

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create a sorter from an array', () => {
      const sorter = new BurstSort2([3, 1, 2])
      expect(sorter.sort()).toEqual([1, 2, 3])
    })

    it('should accept a custom comparator for objects', () => {
      type Obj = { v: number }
      const sorter = new BurstSort2<Obj>([{ v: 3 }, { v: 1 }], (a, b) => a.v - b.v)
      expect(sorter.sort().map(o => o.v)).toEqual([1, 3])
    })

    it('should not mutate the original array', () => {
      const original = [3, 1, 2]
      const sorter = new BurstSort2(original)
      sorter.sort()
      expect(original).toEqual([3, 1, 2])
    })
  })

  // ─── Number Sorting ───

  describe('sort with numbers', () => {
    it('should sort numbers ascending', () => {
      const sorter = new BurstSort2([5, 3, 8, 1, 9, 2])
      expect(sorter.sort()).toEqual([1, 2, 3, 5, 8, 9])
    })

    it('should handle negative numbers', () => {
      const sorter = new BurstSort2([-3, 5, -1, 0, 2, -7])
      expect(sorter.sort()).toEqual([-7, -3, -1, 0, 2, 5])
    })

    it('should handle all negative numbers', () => {
      const sorter = new BurstSort2([-5, -1, -3, -9, -2])
      expect(sorter.sort()).toEqual([-9, -5, -3, -2, -1])
    })

    it('should handle duplicates', () => {
      const sorter = new BurstSort2([3, 1, 2, 1, 3])
      expect(sorter.sort()).toEqual([1, 1, 2, 3, 3])
    })

    it('should handle zeros and positives', () => {
      const sorter = new BurstSort2([0, 5, 0, 3])
      expect(sorter.sort()).toEqual([0, 0, 3, 5])
    })

    it('should handle large numbers', () => {
      const sorter = new BurstSort2([1000000, 500, 999999])
      expect(sorter.sort()).toEqual([500, 999999, 1000000])
    })
  })

  // ─── String Sorting ───

  describe('sort with strings', () => {
    it('should sort strings alphabetically', () => {
      const sorter = new BurstSort2(['banana', 'apple', 'cherry'])
      expect(sorter.sort()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should handle empty strings', () => {
      const sorter = new BurstSort2(['b', '', 'a'])
      expect(sorter.sort()).toEqual(['', 'a', 'b'])
    })

    it('should handle duplicate strings', () => {
      const sorter = new BurstSort2(['a', 'b', 'a', 'c'])
      expect(sorter.sort()).toEqual(['a', 'a', 'b', 'c'])
    })

    it('should handle single character strings', () => {
      const sorter = new BurstSort2(['z', 'a', 'm'])
      expect(sorter.sort()).toEqual(['a', 'm', 'z'])
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('should return a copy for empty array', () => {
      const sorter = new BurstSort2<number>([])
      const result = sorter.sort()
      expect(result).toEqual([])
      expect(result).not.toBe((sorter as unknown as { array: number[] }).array)
    })

    it('should return a copy for single element', () => {
      const sorter = new BurstSort2([42])
      expect(sorter.sort()).toEqual([42])
    })

    it('should return new array from sort (not mutate internal)', () => {
      const sorter = new BurstSort2([3, 1, 2])
      const first = sorter.sort()
      const second = sorter.sort()
      expect(first).toEqual([1, 2, 3])
      expect(second).toEqual([1, 2, 3])
      expect(first).not.toBe(second)
    })

    it('should handle two elements', () => {
      const sorter = new BurstSort2([2, 1])
      expect(sorter.sort()).toEqual([1, 2])
    })

    it('should handle already sorted array', () => {
      const sorter = new BurstSort2([1, 2, 3, 4, 5])
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle reverse sorted array', () => {
      const sorter = new BurstSort2([5, 4, 3, 2, 1])
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5])
    })
  })

  // ─── Custom Comparator ───

  describe('custom comparator', () => {
    it('should sort objects with custom key ascending', () => {
      type Obj = { x: number }
      const sorter = new BurstSort2<Obj>([{ x: 3 }, { x: 1 }, { x: 2 }], (a, b) => a.x - b.x)
      const result = sorter.sort()
      expect(result.map(o => o.x)).toEqual([1, 2, 3])
    })

    it('should sort objects with custom key descending', () => {
      type Obj = { x: number }
      const sorter = new BurstSort2<Obj>([{ x: 1 }, { x: 3 }, { x: 2 }], (a, b) => b.x - a.x)
      const result = sorter.sort()
      expect(result.map(o => o.x)).toEqual([3, 2, 1])
    })

    it('should handle complex objects', () => {
      type Pair = [string, number]
      const sorter = new BurstSort2<Pair>([['c', 3], ['a', 1], ['b', 2]], (a, b) => a[0].localeCompare(b[0]))
      const result = sorter.sort()
      expect(result.map(p => p[0])).toEqual(['a', 'b', 'c'])
    })
  })
})
