import { describe, it, expect } from 'vitest'
import { SkipList4 } from '../../src/core/skip-list-4/index.js'

describe('SkipList4', () => {

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create an empty list with default comparator', () => {
      const list = new SkipList4<number>()
      expect(list.size).toBe(0)
      expect(list.isEmpty()).toBe(true)
    })

    it('should accept a custom comparator', () => {
      const reverseCmp = (a: number, b: number) => b - a
      const list = new SkipList4<number>(reverseCmp)
      list.insert(1)
      list.insert(2)
      list.insert(3)
      expect(list.toArray()).toEqual([3, 2, 1])
    })

    it('should accept a custom maxHeight', () => {
      const list = new SkipList4<number>(undefined, 4)
      list.insert(5)
      expect(list.size).toBe(1)
      expect(list.height()).toBeLessThanOrEqual(4)
    })

    it('should work with default maxHeight', () => {
      const list = new SkipList4<number>()
      expect(list.size).toBe(0)
      expect(list.height()).toBe(0)
    })
  })

  // ─── insert ───

  describe('insert', () => {
    it('should insert a single element', () => {
      const list = new SkipList4<number>()
      list.insert(42)
      expect(list.size).toBe(1)
      expect(list.search(42)).toBe(true)
    })

    it('should reject duplicate values', () => {
      const list = new SkipList4<number>()
      list.insert(5)
      list.insert(5)
      list.insert(5)
      expect(list.size).toBe(1)
    })

    it('should maintain sorted order after multiple insertions', () => {
      const list = new SkipList4<number>()
      list.insert(5)
      list.insert(3)
      list.insert(7)
      list.insert(1)
      list.insert(9)
      expect(list.toArray()).toEqual([1, 3, 5, 7, 9])
    })

    it('should handle negative values', () => {
      const list = new SkipList4<number>()
      list.insert(-5)
      list.insert(0)
      list.insert(5)
      expect(list.toArray()).toEqual([-5, 0, 5])
    })

    it('should handle string values', () => {
      const list = new SkipList4<string>()
      list.insert('cherry')
      list.insert('apple')
      list.insert('banana')
      expect(list.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should insert many elements in sorted order', () => {
      const list = new SkipList4<number>()
      const values = [10, 20, 30, 40, 50, 25, 15, 35, 5, 45]
      for (const v of values) list.insert(v)
      expect(list.toArray()).toEqual([5, 10, 15, 20, 25, 30, 35, 40, 45, 50])
      expect(list.size).toBe(10)
    })
  })

  // ─── search / contains ───

  describe('search and contains', () => {
    it('should find an existing element', () => {
      const list = new SkipList4<number>()
      list.insert(42)
      expect(list.search(42)).toBe(true)
      expect(list.contains(42)).toBe(true)
    })

    it('should return false for missing element in empty list', () => {
      const list = new SkipList4<number>()
      expect(list.search(1)).toBe(false)
      expect(list.contains(1)).toBe(false)
    })

    it('should return false for missing element in non-empty list', () => {
      const list = new SkipList4<number>()
      list.insert(1)
      list.insert(3)
      list.insert(5)
      expect(list.search(2)).toBe(false)
      expect(list.contains(4)).toBe(false)
    })

    it('should find elements among many', () => {
      const list = new SkipList4<number>()
      for (let i = 0; i < 100; i += 2) list.insert(i)
      expect(list.search(0)).toBe(true)
      expect(list.search(50)).toBe(true)
      expect(list.search(98)).toBe(true)
      expect(list.search(1)).toBe(false)
      expect(list.search(99)).toBe(false)
    })
  })

  // ─── remove ───

  describe('remove', () => {
    it('should remove an existing element and return true', () => {
      const list = new SkipList4<number>()
      list.insert(10)
      expect(list.remove(10)).toBe(true)
      expect(list.size).toBe(0)
      expect(list.search(10)).toBe(false)
    })

    it('should return false when removing from empty list', () => {
      const list = new SkipList4<number>()
      expect(list.remove(1)).toBe(false)
    })

    it('should return false when removing non-existent element', () => {
      const list = new SkipList4<number>()
      list.insert(1)
      list.insert(3)
      expect(list.remove(2)).toBe(false)
      expect(list.size).toBe(2)
    })

    it('should maintain sorted order after removals', () => {
      const list = new SkipList4<number>()
      list.insert(1)
      list.insert(2)
      list.insert(3)
      list.insert(4)
      list.insert(5)
      list.remove(3)
      expect(list.toArray()).toEqual([1, 2, 4, 5])
    })

    it('should remove all elements one by one', () => {
      const list = new SkipList4<number>()
      list.insert(1)
      list.insert(2)
      list.insert(3)
      expect(list.remove(2)).toBe(true)
      expect(list.remove(1)).toBe(true)
      expect(list.remove(3)).toBe(true)
      expect(list.isEmpty()).toBe(true)
      expect(list.size).toBe(0)
    })

    it('should handle removing first and last elements', () => {
      const list = new SkipList4<number>()
      list.insert(10)
      list.insert(20)
      list.insert(30)
      expect(list.remove(10)).toBe(true)
      expect(list.toArray()).toEqual([20, 30])
      expect(list.remove(30)).toBe(true)
      expect(list.toArray()).toEqual([20])
    })
  })

  // ─── min / max ───

  describe('min and max', () => {
    it('should return undefined for empty list', () => {
      const list = new SkipList4<number>()
      expect(list.min()).toBeUndefined()
      expect(list.max()).toBeUndefined()
    })

    it('should return same value for single-element list', () => {
      const list = new SkipList4<number>()
      list.insert(42)
      expect(list.min()).toBe(42)
      expect(list.max()).toBe(42)
    })

    it('should return correct min and max after multiple insertions', () => {
      const list = new SkipList4<number>()
      list.insert(5)
      list.insert(1)
      list.insert(9)
      list.insert(3)
      list.insert(7)
      expect(list.min()).toBe(1)
      expect(list.max()).toBe(9)
    })

    it('should update after removals', () => {
      const list = new SkipList4<number>()
      list.insert(1)
      list.insert(5)
      list.insert(10)
      list.remove(1)
      expect(list.min()).toBe(5)
      list.remove(10)
      expect(list.max()).toBe(5)
    })
  })

  // ─── size / isEmpty ───

  describe('size and isEmpty', () => {
    it('should track size correctly', () => {
      const list = new SkipList4<number>()
      expect(list.size).toBe(0)
      expect(list.isEmpty()).toBe(true)
      list.insert(1)
      expect(list.size).toBe(1)
      expect(list.isEmpty()).toBe(false)
      list.remove(1)
      expect(list.size).toBe(0)
      expect(list.isEmpty()).toBe(true)
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('should remove all elements', () => {
      const list = new SkipList4<number>()
      list.insert(1)
      list.insert(2)
      list.insert(3)
      list.clear()
      expect(list.size).toBe(0)
      expect(list.isEmpty()).toBe(true)
      expect(list.toArray()).toEqual([])
    })

    it('should allow insertions after clear', () => {
      const list = new SkipList4<number>()
      list.insert(1)
      list.clear()
      list.insert(2)
      expect(list.size).toBe(1)
      expect(list.search(2)).toBe(true)
      expect(list.search(1)).toBe(false)
    })
  })

  // ─── toArray ───

  describe('toArray', () => {
    it('should return empty array for empty list', () => {
      const list = new SkipList4<number>()
      expect(list.toArray()).toEqual([])
    })

    it('should return sorted array', () => {
      const list = new SkipList4<number>()
      list.insert(3)
      list.insert(1)
      list.insert(2)
      expect(list.toArray()).toEqual([1, 2, 3])
    })
  })

  // ─── forEach ───

  describe('forEach', () => {
    it('should iterate over all elements in order', () => {
      const list = new SkipList4<number>()
      list.insert(10)
      list.insert(20)
      list.insert(30)
      const result: number[] = []
      list.forEach((v) => result.push(v))
      expect(result).toEqual([10, 20, 30])
    })

    it('should provide correct index', () => {
      const list = new SkipList4<number>()
      list.insert(5)
      list.insert(10)
      const indices: number[] = []
      list.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1])
    })

    it('should not iterate on empty list', () => {
      const list = new SkipList4<number>()
      let count = 0
      list.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  // ─── predecessor / successor ───

  describe('predecessor', () => {
    it('should return undefined for empty list', () => {
      const list = new SkipList4<number>()
      expect(list.predecessor(5)).toBeUndefined()
    })

    it('should return undefined when value is the minimum', () => {
      const list = new SkipList4<number>()
      list.insert(10)
      list.insert(20)
      list.insert(30)
      expect(list.predecessor(10)).toBeUndefined()
    })

    it('should return the greatest element less than value', () => {
      const list = new SkipList4<number>()
      list.insert(10)
      list.insert(20)
      list.insert(30)
      expect(list.predecessor(20)).toBe(10)
      expect(list.predecessor(30)).toBe(20)
    })

    it('should return predecessor for value not in list', () => {
      const list = new SkipList4<number>()
      list.insert(10)
      list.insert(30)
      expect(list.predecessor(25)).toBe(10)
    })

    it('should return undefined when all elements are greater', () => {
      const list = new SkipList4<number>()
      list.insert(10)
      list.insert(20)
      expect(list.predecessor(5)).toBeUndefined()
    })
  })

  describe('successor', () => {
    it('should return undefined for empty list', () => {
      const list = new SkipList4<number>()
      expect(list.successor(5)).toBeUndefined()
    })

    it('should return undefined when value is the maximum', () => {
      const list = new SkipList4<number>()
      list.insert(10)
      list.insert(20)
      list.insert(30)
      expect(list.successor(30)).toBeUndefined()
    })

    it('should return the smallest element greater than value', () => {
      const list = new SkipList4<number>()
      list.insert(10)
      list.insert(20)
      list.insert(30)
      expect(list.successor(10)).toBe(20)
      expect(list.successor(20)).toBe(30)
    })

    it('should return successor for value not in list', () => {
      const list = new SkipList4<number>()
      list.insert(10)
      list.insert(30)
      expect(list.successor(15)).toBe(30)
    })

    it('should return undefined when all elements are less', () => {
      const list = new SkipList4<number>()
      list.insert(10)
      list.insert(20)
      expect(list.successor(25)).toBeUndefined()
    })
  })

  // ─── rangeSearch ───

  describe('rangeSearch', () => {
    it('should return empty array for empty list', () => {
      const list = new SkipList4<number>()
      expect(list.rangeSearch(1, 10)).toEqual([])
    })

    it('should return elements within range inclusive', () => {
      const list = new SkipList4<number>()
      list.insert(1)
      list.insert(3)
      list.insert(5)
      list.insert(7)
      list.insert(9)
      expect(list.rangeSearch(3, 7)).toEqual([3, 5, 7])
    })

    it('should return single element when range matches one value', () => {
      const list = new SkipList4<number>()
      list.insert(1)
      list.insert(5)
      list.insert(10)
      expect(list.rangeSearch(3, 7)).toEqual([5])
    })

    it('should return empty when no elements in range', () => {
      const list = new SkipList4<number>()
      list.insert(1)
      list.insert(10)
      expect(list.rangeSearch(3, 7)).toEqual([])
    })

    it('should return all elements for full range', () => {
      const list = new SkipList4<number>()
      list.insert(1)
      list.insert(2)
      list.insert(3)
      expect(list.rangeSearch(0, 100)).toEqual([1, 2, 3])
    })
  })

  // ─── height ───

  describe('height', () => {
    it('should be 0 for empty list', () => {
      const list = new SkipList4<number>()
      expect(list.height()).toBe(0)
    })

    it('should be >= 0 after insertions', () => {
      const list = new SkipList4<number>()
      list.insert(1)
      list.insert(2)
      list.insert(3)
      expect(list.height()).toBeGreaterThanOrEqual(0)
    })

    it('should not exceed maxLevel', () => {
      const list = new SkipList4<number>(undefined, 4)
      for (let i = 0; i < 100; i++) list.insert(i)
      expect(list.height()).toBeLessThanOrEqual(4)
    })
  })
})
