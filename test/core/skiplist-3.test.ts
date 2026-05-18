import { describe, it, expect } from 'vitest'
import { SkipList3 } from '../../src/core/skiplist-3/index.js'

describe('SkipList3', () => {
  describe('constructor', () => {
    it('should create an empty skip list with default comparator', () => {
      const sl = new SkipList3<number>()
      expect(sl.size).toBe(0)
      expect(sl.isEmpty).toBe(true)
    })

    it('should accept a custom comparator', () => {
      const sl = new SkipList3<string>((a, b) => b.localeCompare(a))
      sl.insert('a')
      sl.insert('b')
      sl.insert('c')
      expect(sl.toArray()).toEqual(['c', 'b', 'a'])
    })
  })

  // ─── Insert & Search ───

  describe('insert and search', () => {
    it('should insert a single element and find it', () => {
      const sl = new SkipList3<number>()
      sl.insert(42)
      expect(sl.search(42)).toBe(true)
      expect(sl.size).toBe(1)
      expect(sl.isEmpty).toBe(false)
    })

    it('should insert multiple elements and find them all', () => {
      const sl = new SkipList3<number>()
      const values = [5, 3, 8, 1, 9, 2, 7]
      for (const v of values) sl.insert(v)
      for (const v of values) {
        expect(sl.search(v)).toBe(true)
      }
      expect(sl.size).toBe(values.length)
    })

    it('should return false for non-existent element', () => {
      const sl = new SkipList3<number>()
      sl.insert(1)
      expect(sl.search(99)).toBe(false)
    })

    it('should handle duplicate insertions', () => {
      const sl = new SkipList3<number>()
      sl.insert(5)
      sl.insert(5)
      sl.insert(5)
      expect(sl.size).toBe(3)
      expect(sl.search(5)).toBe(true)
    })

    it('should report contains same as search', () => {
      const sl = new SkipList3<number>()
      sl.insert(10)
      expect(sl.contains(10)).toBe(true)
      expect(sl.contains(20)).toBe(false)
    })

    it('should search in empty list', () => {
      const sl = new SkipList3<number>()
      expect(sl.search(1)).toBe(false)
      expect(sl.contains(1)).toBe(false)
    })
  })

  // ─── Delete ───

  describe('delete', () => {
    it('should delete an existing element', () => {
      const sl = new SkipList3<number>()
      sl.insert(10)
      expect(sl.delete(10)).toBe(true)
      expect(sl.search(10)).toBe(false)
      expect(sl.size).toBe(0)
    })

    it('should return false for non-existent element', () => {
      const sl = new SkipList3<number>()
      sl.insert(1)
      expect(sl.delete(99)).toBe(false)
      expect(sl.size).toBe(1)
    })

    it('should return false when deleting from empty list', () => {
      const sl = new SkipList3<number>()
      expect(sl.delete(1)).toBe(false)
    })

    it('should maintain structure after multiple deletes', () => {
      const sl = new SkipList3<number>()
      const values = [1, 2, 3, 4, 5]
      for (const v of values) sl.insert(v)
      expect(sl.delete(3)).toBe(true)
      expect(sl.search(3)).toBe(false)
      for (const v of [1, 2, 4, 5]) {
        expect(sl.search(v)).toBe(true)
      }
      expect(sl.size).toBe(4)
    })

    it('should handle deleting one of duplicates', () => {
      const sl = new SkipList3<number>()
      sl.insert(5)
      sl.insert(5)
      expect(sl.delete(5)).toBe(true)
      expect(sl.size).toBe(1)
      expect(sl.search(5)).toBe(true)
    })
  })

  // ─── findMin / findMax ───

  describe('findMin and findMax', () => {
    it('should return undefined for empty list', () => {
      const sl = new SkipList3<number>()
      expect(sl.findMin()).toBeUndefined()
      expect(sl.findMax()).toBeUndefined()
    })

    it('should return the only element for both min and max', () => {
      const sl = new SkipList3<number>()
      sl.insert(42)
      expect(sl.findMin()).toBe(42)
      expect(sl.findMax()).toBe(42)
    })

    it('should return correct min and max for multiple elements', () => {
      const sl = new SkipList3<number>()
      const values = [10, -5, 3, 100, 0, 7]
      for (const v of values) sl.insert(v)
      expect(sl.findMin()).toBe(-5)
      expect(sl.findMax()).toBe(100)
    })
  })

  // ─── rangeQuery ───

  describe('rangeQuery', () => {
    it('should return empty for range with no matches', () => {
      const sl = new SkipList3<number>()
      sl.insert(1)
      sl.insert(10)
      expect(sl.rangeQuery(3, 5)).toEqual([])
    })

    it('should return elements within range inclusive', () => {
      const sl = new SkipList3<number>()
      for (const v of [1, 2, 3, 4, 5]) sl.insert(v)
      expect(sl.rangeQuery(2, 4)).toEqual([2, 3, 4])
    })

    it('should handle single element range', () => {
      const sl = new SkipList3<number>()
      for (const v of [1, 3, 5]) sl.insert(v)
      expect(sl.rangeQuery(3, 3)).toEqual([3])
    })

    it('should return empty for empty list', () => {
      const sl = new SkipList3<number>()
      expect(sl.rangeQuery(0, 10)).toEqual([])
    })
  })

  // ─── forEach ───

  describe('forEach', () => {
    it('should iterate over all elements in order', () => {
      const sl = new SkipList3<number>()
      const values = [5, 1, 3, 2, 4]
      for (const v of values) sl.insert(v)
      const collected: number[] = []
      sl.forEach((v) => collected.push(v))
      expect(collected).toEqual([1, 2, 3, 4, 5])
    })

    it('should provide correct indices', () => {
      const sl = new SkipList3<number>()
      sl.insert(10)
      sl.insert(20)
      sl.insert(30)
      const indices: number[] = []
      sl.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should not call callback on empty list', () => {
      const sl = new SkipList3<number>()
      let called = false
      sl.forEach(() => { called = true })
      expect(called).toBe(false)
    })
  })

  // ─── toArray ───

  describe('toArray', () => {
    it('should return empty array for empty list', () => {
      const sl = new SkipList3<number>()
      expect(sl.toArray()).toEqual([])
    })

    it('should return sorted array', () => {
      const sl = new SkipList3<number>()
      for (const v of [3, 1, 2]) sl.insert(v)
      expect(sl.toArray()).toEqual([1, 2, 3])
    })
  })

  // ─── getRank / getByRank ───

  describe('getRank and getByRank', () => {
    it('should return -1 for non-existent value', () => {
      const sl = new SkipList3<number>()
      expect(sl.getRank(99)).toBe(-1)
    })

    it('should return correct rank for existing values', () => {
      const sl = new SkipList3<number>()
      for (const v of [10, 20, 30, 40, 50]) sl.insert(v)
      expect(sl.getRank(10)).toBe(0)
      expect(sl.getRank(30)).toBe(2)
      expect(sl.getRank(50)).toBe(4)
    })

    it('getByRank should return undefined for out of bounds', () => {
      const sl = new SkipList3<number>()
      sl.insert(1)
      expect(sl.getByRank(-1)).toBeUndefined()
      expect(sl.getByRank(5)).toBeUndefined()
    })

    it('getByRank should return element at given rank', () => {
      const sl = new SkipList3<number>()
      for (const v of [10, 20, 30]) sl.insert(v)
      expect(sl.getByRank(0)).toBe(10)
      expect(sl.getByRank(1)).toBe(20)
      expect(sl.getByRank(2)).toBe(30)
    })

    it('getByRank should return undefined for empty list', () => {
      const sl = new SkipList3<number>()
      expect(sl.getByRank(0)).toBeUndefined()
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('should remove all elements', () => {
      const sl = new SkipList3<number>()
      for (const v of [1, 2, 3]) sl.insert(v)
      sl.clear()
      expect(sl.size).toBe(0)
      expect(sl.isEmpty).toBe(true)
      expect(sl.toArray()).toEqual([])
    })
  })

  // ─── getTimeComplexity ───

  describe('getTimeComplexity', () => {
    it('should return complexity string', () => {
      const sl = new SkipList3<number>()
      expect(sl.getTimeComplexity()).toBe('Search: O(log n), Insert: O(log n), Delete: O(log n), Space: O(n)')
    })
  })

  // ─── Edge cases ───

  describe('edge cases', () => {
    it('should handle negative numbers', () => {
      const sl = new SkipList3<number>()
      for (const v of [-10, -5, 0, 5, 10]) sl.insert(v)
      expect(sl.findMin()).toBe(-10)
      expect(sl.findMax()).toBe(10)
      expect(sl.toArray()).toEqual([-10, -5, 0, 5, 10])
    })

    it('should handle string values', () => {
      const sl = new SkipList3<string>()
      sl.insert('cherry')
      sl.insert('apple')
      sl.insert('banana')
      expect(sl.toArray()).toEqual(['apple', 'banana', 'cherry'])
      expect(sl.search('banana')).toBe(true)
      expect(sl.search('grape')).toBe(false)
    })

    it('should handle large number of insertions', () => {
      const sl = new SkipList3<number>()
      const n = 500
      for (let i = 0; i < n; i++) sl.insert(i)
      expect(sl.size).toBe(n)
      expect(sl.findMin()).toBe(0)
      expect(sl.findMax()).toBe(n - 1)
      for (let i = 0; i < n; i++) {
        expect(sl.search(i)).toBe(true)
      }
    })

    it('should handle insert after delete', () => {
      const sl = new SkipList3<number>()
      sl.insert(1)
      sl.insert(2)
      sl.delete(1)
      sl.insert(3)
      expect(sl.size).toBe(2)
      expect(sl.toArray()).toEqual([2, 3])
    })
  })
})
