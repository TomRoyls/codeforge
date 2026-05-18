import { describe, it, expect } from 'vitest'
import { SkipList } from '../../src/core/skip-list-5/index.js'

describe('SkipList', () => {

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create an empty list with default comparator', () => {
      const list = new SkipList<number>()
      expect(list.size()).toBe(0)
      expect(list.isEmpty()).toBe(true)
    })

    it('should accept a custom comparator', () => {
      const reverseCmp = (a: number, b: number) => b - a
      const list = new SkipList<number>(reverseCmp)
      list.insert(1)
      list.insert(2)
      list.insert(3)
      expect(list.toArray()).toEqual([3, 2, 1])
    })
  })

  // ─── insert ───

  describe('insert', () => {
    it('should insert a single element', () => {
      const list = new SkipList<number>()
      list.insert(42)
      expect(list.size()).toBe(1)
      expect(list.search(42)).toBe(true)
    })

    it('should allow duplicate values', () => {
      const list = new SkipList<number>()
      list.insert(5)
      list.insert(5)
      list.insert(5)
      expect(list.size()).toBe(3)
    })

    it('should maintain sorted order after multiple insertions', () => {
      const list = new SkipList<number>()
      list.insert(5)
      list.insert(3)
      list.insert(7)
      list.insert(1)
      list.insert(9)
      expect(list.toArray()).toEqual([1, 3, 5, 7, 9])
    })

    it('should handle negative values', () => {
      const list = new SkipList<number>()
      list.insert(-5)
      list.insert(0)
      list.insert(5)
      expect(list.toArray()).toEqual([-5, 0, 5])
    })

    it('should handle string values', () => {
      const list = new SkipList<string>()
      list.insert('cherry')
      list.insert('apple')
      list.insert('banana')
      expect(list.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should insert many elements maintaining order', () => {
      const list = new SkipList<number>()
      const values = [10, 20, 30, 40, 50, 25, 15, 35, 5, 45]
      for (const v of values) list.insert(v)
      expect(list.toArray()).toEqual([5, 10, 15, 20, 25, 30, 35, 40, 45, 50])
      expect(list.size()).toBe(10)
    })
  })

  // ─── search / contains ───

  describe('search and contains', () => {
    it('should find an existing element', () => {
      const list = new SkipList<number>()
      list.insert(42)
      expect(list.search(42)).toBe(true)
      expect(list.contains(42)).toBe(true)
    })

    it('should return false for missing element in empty list', () => {
      const list = new SkipList<number>()
      expect(list.search(1)).toBe(false)
      expect(list.contains(1)).toBe(false)
    })

    it('should return false for missing element in non-empty list', () => {
      const list = new SkipList<number>()
      list.insert(1)
      list.insert(3)
      list.insert(5)
      expect(list.search(2)).toBe(false)
      expect(list.contains(4)).toBe(false)
    })

    it('should find elements among many', () => {
      const list = new SkipList<number>()
      for (let i = 0; i < 100; i += 2) list.insert(i)
      expect(list.search(0)).toBe(true)
      expect(list.search(50)).toBe(true)
      expect(list.search(98)).toBe(true)
      expect(list.search(1)).toBe(false)
      expect(list.search(99)).toBe(false)
    })
  })

  // ─── delete ───

  describe('delete', () => {
    it('should delete an existing element and return true', () => {
      const list = new SkipList<number>()
      list.insert(10)
      expect(list.delete(10)).toBe(true)
      expect(list.size()).toBe(0)
      expect(list.search(10)).toBe(false)
    })

    it('should return false when deleting from empty list', () => {
      const list = new SkipList<number>()
      expect(list.delete(1)).toBe(false)
    })

    it('should return false when deleting non-existent element', () => {
      const list = new SkipList<number>()
      list.insert(1)
      list.insert(3)
      expect(list.delete(2)).toBe(false)
      expect(list.size()).toBe(2)
    })

    it('should maintain sorted order after deletions', () => {
      const list = new SkipList<number>()
      list.insert(1)
      list.insert(2)
      list.insert(3)
      list.insert(4)
      list.insert(5)
      list.delete(3)
      expect(list.toArray()).toEqual([1, 2, 4, 5])
    })

    it('should remove all elements one by one', () => {
      const list = new SkipList<number>()
      list.insert(1)
      list.insert(2)
      list.insert(3)
      expect(list.delete(2)).toBe(true)
      expect(list.delete(1)).toBe(true)
      expect(list.delete(3)).toBe(true)
      expect(list.isEmpty()).toBe(true)
      expect(list.size()).toBe(0)
    })

    it('should handle deleting first and last elements', () => {
      const list = new SkipList<number>()
      list.insert(10)
      list.insert(20)
      list.insert(30)
      expect(list.delete(10)).toBe(true)
      expect(list.toArray()).toEqual([20, 30])
      expect(list.delete(30)).toBe(true)
      expect(list.toArray()).toEqual([20])
    })
  })

  // ─── min / max ───

  describe('min and max', () => {
    it('should return undefined for empty list', () => {
      const list = new SkipList<number>()
      expect(list.min()).toBeUndefined()
      expect(list.max()).toBeUndefined()
    })

    it('should return same value for single-element list', () => {
      const list = new SkipList<number>()
      list.insert(42)
      expect(list.min()).toBe(42)
      expect(list.max()).toBe(42)
    })

    it('should return correct min and max after multiple insertions', () => {
      const list = new SkipList<number>()
      list.insert(5)
      list.insert(1)
      list.insert(9)
      list.insert(3)
      list.insert(7)
      expect(list.min()).toBe(1)
      expect(list.max()).toBe(9)
    })

    it('should update after deletions', () => {
      const list = new SkipList<number>()
      list.insert(1)
      list.insert(5)
      list.insert(10)
      list.delete(1)
      expect(list.min()).toBe(5)
      list.delete(10)
      expect(list.max()).toBe(5)
    })
  })

  // ─── size / isEmpty ───

  describe('size and isEmpty', () => {
    it('should track size correctly', () => {
      const list = new SkipList<number>()
      expect(list.size()).toBe(0)
      expect(list.isEmpty()).toBe(true)
      list.insert(1)
      expect(list.size()).toBe(1)
      expect(list.isEmpty()).toBe(false)
      list.delete(1)
      expect(list.size()).toBe(0)
      expect(list.isEmpty()).toBe(true)
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('should remove all elements', () => {
      const list = new SkipList<number>()
      list.insert(1)
      list.insert(2)
      list.insert(3)
      list.clear()
      expect(list.size()).toBe(0)
      expect(list.isEmpty()).toBe(true)
      expect(list.toArray()).toEqual([])
    })

    it('should allow insertions after clear', () => {
      const list = new SkipList<number>()
      list.insert(1)
      list.clear()
      list.insert(2)
      expect(list.size()).toBe(1)
      expect(list.search(2)).toBe(true)
      expect(list.search(1)).toBe(false)
    })
  })

  // ─── toArray ───

  describe('toArray', () => {
    it('should return empty array for empty list', () => {
      const list = new SkipList<number>()
      expect(list.toArray()).toEqual([])
    })

    it('should return sorted array', () => {
      const list = new SkipList<number>()
      list.insert(3)
      list.insert(1)
      list.insert(2)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('should include duplicates in sorted order', () => {
      const list = new SkipList<number>()
      list.insert(2)
      list.insert(1)
      list.insert(2)
      list.insert(1)
      expect(list.toArray()).toEqual([1, 1, 2, 2])
    })
  })

  // ─── getTimeComplexity ───

  describe('getTimeComplexity', () => {
    it('should return the time complexity string', () => {
      const list = new SkipList<number>()
      const result = list.getTimeComplexity()
      expect(result).toContain('O(log n)')
      expect(result).toContain('Search')
      expect(result).toContain('Insert')
      expect(result).toContain('Delete')
    })
  })
})
