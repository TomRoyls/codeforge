import { describe, it, expect } from 'vitest'
import { SkipListMap3 } from '../../src/core/skip-list-map-3/index.js'

describe('SkipListMap3', () => {

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create an empty map with default maxLevel', () => {
      const map = new SkipListMap3<string>()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('should accept a custom maxLevel', () => {
      const map = new SkipListMap3<string>(4)
      map.set(1, 'a')
      expect(map.size).toBe(1)
      expect(map.get(1)).toBe('a')
    })
  })

  // ─── set ───

  describe('set', () => {
    it('should insert a single key-value pair', () => {
      const map = new SkipListMap3<string>()
      map.set(1, 'hello')
      expect(map.size).toBe(1)
      expect(map.get(1)).toBe('hello')
    })

    it('should update value for existing key', () => {
      const map = new SkipListMap3<string>()
      map.set(1, 'old')
      map.set(1, 'new')
      expect(map.size).toBe(1)
      expect(map.get(1)).toBe('new')
    })

    it('should handle multiple insertions in any order', () => {
      const map = new SkipListMap3<string>()
      map.set(5, 'e')
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(4, 'd')
      map.set(2, 'b')
      expect(map.toArray()).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
        [4, 'd'],
        [5, 'e'],
      ])
    })

    it('should handle negative keys', () => {
      const map = new SkipListMap3<string>()
      map.set(-5, 'neg')
      map.set(0, 'zero')
      map.set(5, 'pos')
      expect(map.toArray()).toEqual([
        [-5, 'neg'],
        [0, 'zero'],
        [5, 'pos'],
      ])
    })

    it('should handle many insertions', () => {
      const map = new SkipListMap3<number>()
      for (let i = 50; i >= 1; i--) map.set(i, i * 10)
      expect(map.size).toBe(50)
      expect(map.get(1)).toBe(10)
      expect(map.get(50)).toBe(500)
    })
  })

  // ─── get ───

  describe('get', () => {
    it('should return undefined for missing key in empty map', () => {
      const map = new SkipListMap3<string>()
      expect(map.get(1)).toBeUndefined()
    })

    it('should return undefined for missing key in non-empty map', () => {
      const map = new SkipListMap3<string>()
      map.set(1, 'a')
      map.set(3, 'c')
      expect(map.get(2)).toBeUndefined()
    })

    it('should return value for existing key', () => {
      const map = new SkipListMap3<string>()
      map.set(42, 'answer')
      expect(map.get(42)).toBe('answer')
    })
  })

  // ─── has ───

  describe('has', () => {
    it('should return false for empty map', () => {
      const map = new SkipListMap3<string>()
      expect(map.has(1)).toBe(false)
    })

    it('should return true for existing key', () => {
      const map = new SkipListMap3<string>()
      map.set(1, 'a')
      expect(map.has(1)).toBe(true)
    })

    it('should return false for missing key', () => {
      const map = new SkipListMap3<string>()
      map.set(1, 'a')
      map.set(3, 'c')
      expect(map.has(2)).toBe(false)
    })
  })

  // ─── delete ───

  describe('delete', () => {
    it('should delete an existing key and return true', () => {
      const map = new SkipListMap3<string>()
      map.set(1, 'a')
      expect(map.delete(1)).toBe(true)
      expect(map.size).toBe(0)
      expect(map.get(1)).toBeUndefined()
    })

    it('should return false when deleting from empty map', () => {
      const map = new SkipListMap3<string>()
      expect(map.delete(1)).toBe(false)
    })

    it('should return false when deleting non-existent key', () => {
      const map = new SkipListMap3<string>()
      map.set(1, 'a')
      map.set(3, 'c')
      expect(map.delete(2)).toBe(false)
      expect(map.size).toBe(2)
    })

    it('should maintain order after deletions', () => {
      const map = new SkipListMap3<string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.set(4, 'd')
      map.set(5, 'e')
      map.delete(3)
      expect(map.toArray()).toEqual([
        [1, 'a'],
        [2, 'b'],
        [4, 'd'],
        [5, 'e'],
      ])
    })

    it('should remove all elements one by one', () => {
      const map = new SkipListMap3<string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      expect(map.delete(2)).toBe(true)
      expect(map.delete(1)).toBe(true)
      expect(map.delete(3)).toBe(true)
      expect(map.isEmpty()).toBe(true)
      expect(map.size).toBe(0)
    })

    it('should handle deleting first and last keys', () => {
      const map = new SkipListMap3<string>()
      map.set(10, 'x')
      map.set(20, 'y')
      map.set(30, 'z')
      expect(map.delete(10)).toBe(true)
      expect(map.toArray()).toEqual([
        [20, 'y'],
        [30, 'z'],
      ])
      expect(map.delete(30)).toBe(true)
      expect(map.toArray()).toEqual([[20, 'y']])
    })
  })

  // ─── min / max ───

  describe('min and max', () => {
    it('should return undefined for empty map', () => {
      const map = new SkipListMap3<string>()
      expect(map.min()).toBeUndefined()
      expect(map.max()).toBeUndefined()
    })

    it('should return same value for single-element map', () => {
      const map = new SkipListMap3<string>()
      map.set(1, 'only')
      expect(map.min()).toBe('only')
      expect(map.max()).toBe('only')
    })

    it('should return correct min and max values', () => {
      const map = new SkipListMap3<string>()
      map.set(5, 'e')
      map.set(1, 'a')
      map.set(9, 'i')
      map.set(3, 'c')
      map.set(7, 'g')
      expect(map.min()).toBe('a')
      expect(map.max()).toBe('i')
    })

    it('should update after deletions', () => {
      const map = new SkipListMap3<string>()
      map.set(1, 'a')
      map.set(5, 'e')
      map.set(10, 'j')
      map.delete(1)
      expect(map.min()).toBe('e')
      map.delete(10)
      expect(map.max()).toBe('e')
    })
  })

  // ─── size / isEmpty ───

  describe('size and isEmpty', () => {
    it('should track size correctly', () => {
      const map = new SkipListMap3<string>()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
      map.set(1, 'a')
      expect(map.size).toBe(1)
      expect(map.isEmpty()).toBe(false)
      map.delete(1)
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('should remove all elements', () => {
      const map = new SkipListMap3<string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
      expect(map.toArray()).toEqual([])
    })

    it('should allow insertions after clear', () => {
      const map = new SkipListMap3<string>()
      map.set(1, 'old')
      map.clear()
      map.set(2, 'new')
      expect(map.size).toBe(1)
      expect(map.get(2)).toBe('new')
      expect(map.get(1)).toBeUndefined()
    })
  })

  // ─── toArray ───

  describe('toArray', () => {
    it('should return empty array for empty map', () => {
      const map = new SkipListMap3<string>()
      expect(map.toArray()).toEqual([])
    })

    it('should return key-value pairs sorted by key', () => {
      const map = new SkipListMap3<string>()
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.toArray()).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
    })
  })

  // ─── forEach ───

  describe('forEach', () => {
    it('should iterate over all pairs in key order', () => {
      const map = new SkipListMap3<string>()
      map.set(10, 'x')
      map.set(20, 'y')
      map.set(30, 'z')
      const result: string[] = []
      map.forEach((v) => result.push(v))
      expect(result).toEqual(['x', 'y', 'z'])
    })

    it('should provide correct keys', () => {
      const map = new SkipListMap3<string>()
      map.set(5, 'a')
      map.set(10, 'b')
      const keys: number[] = []
      map.forEach((_v, k) => keys.push(k))
      expect(keys).toEqual([5, 10])
    })

    it('should not iterate on empty map', () => {
      const map = new SkipListMap3<string>()
      let count = 0
      map.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  // ─── range ───

  describe('range', () => {
    it('should return empty array for empty map', () => {
      const map = new SkipListMap3<string>()
      expect(map.range(1, 10)).toEqual([])
    })

    it('should return entries within range inclusive', () => {
      const map = new SkipListMap3<string>()
      map.set(1, 'a')
      map.set(3, 'c')
      map.set(5, 'e')
      map.set(7, 'g')
      map.set(9, 'i')
      expect(map.range(3, 7)).toEqual([
        [3, 'c'],
        [5, 'e'],
        [7, 'g'],
      ])
    })

    it('should return single entry when range matches one key', () => {
      const map = new SkipListMap3<string>()
      map.set(1, 'a')
      map.set(5, 'e')
      map.set(10, 'j')
      expect(map.range(3, 7)).toEqual([[5, 'e']])
    })

    it('should return empty when no keys in range', () => {
      const map = new SkipListMap3<string>()
      map.set(1, 'a')
      map.set(10, 'j')
      expect(map.range(3, 7)).toEqual([])
    })

    it('should return all entries for full range', () => {
      const map = new SkipListMap3<string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      expect(map.range(0, 100)).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
    })

    it('should handle negative key ranges', () => {
      const map = new SkipListMap3<string>()
      map.set(-5, 'neg')
      map.set(0, 'zero')
      map.set(5, 'pos')
      expect(map.range(-5, 0)).toEqual([
        [-5, 'neg'],
        [0, 'zero'],
      ])
    })
  })
})
