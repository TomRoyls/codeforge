import { describe, it, expect } from 'vitest'
import { RedBlackMap3 } from '../../src/core/red-black-map-3/index.js'

describe('RedBlackMap3', () => {

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create an empty map with default comparator', () => {
      const map = new RedBlackMap3<number, string>()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('should accept a custom comparator', () => {
      const reverseCmp = (a: number, b: number) => b - a
      const map = new RedBlackMap3<number, string>(reverseCmp)
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      expect(map.keys()).toEqual([3, 2, 1])
    })
  })

  // ─── set / get ───

  describe('set and get', () => {
    it('should store and retrieve a single entry', () => {
      const map = new RedBlackMap3<number, string>()
      map.set(1, 'one')
      expect(map.get(1)).toBe('one')
      expect(map.size).toBe(1)
    })

    it('should return undefined for missing key', () => {
      const map = new RedBlackMap3<number, string>()
      expect(map.get(42)).toBeUndefined()
    })

    it('should overwrite existing key value', () => {
      const map = new RedBlackMap3<number, string>()
      map.set(1, 'one')
      map.set(1, 'uno')
      expect(map.get(1)).toBe('uno')
      expect(map.size).toBe(1)
    })

    it('should handle multiple insertions preserving order', () => {
      const map = new RedBlackMap3<number, string>()
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(2, 'two')
      expect(map.entries()).toEqual([[1, 'one'], [2, 'two'], [3, 'three']])
    })

    it('should handle negative keys', () => {
      const map = new RedBlackMap3<number, string>()
      map.set(-5, 'neg5')
      map.set(0, 'zero')
      map.set(5, 'pos5')
      expect(map.keys()).toEqual([-5, 0, 5])
      expect(map.get(-5)).toBe('neg5')
      expect(map.get(0)).toBe('zero')
      expect(map.get(5)).toBe('pos5')
    })

    it('should handle string keys', () => {
      const map = new RedBlackMap3<string, number>()
      map.set('banana', 2)
      map.set('apple', 1)
      map.set('cherry', 3)
      expect(map.get('banana')).toBe(2)
      expect(map.keys()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should handle object values', () => {
      const map = new RedBlackMap3<number, { name: string }>()
      map.set(1, { name: 'first' })
      map.set(2, { name: 'second' })
      expect(map.get(1)).toEqual({ name: 'first' })
      expect(map.get(2)).toEqual({ name: 'second' })
    })
  })

  // ─── has ───

  describe('has', () => {
    it('should return true for existing key', () => {
      const map = new RedBlackMap3<number, string>()
      map.set(1, 'one')
      expect(map.has(1)).toBe(true)
    })

    it('should return false for missing key', () => {
      const map = new RedBlackMap3<number, string>()
      expect(map.has(1)).toBe(false)
    })

    it('should return false after deletion', () => {
      const map = new RedBlackMap3<number, string>()
      map.set(1, 'one')
      map.delete(1)
      expect(map.has(1)).toBe(false)
    })
  })

  // ─── delete ───

  describe('delete', () => {
    it('should return false for missing key', () => {
      const map = new RedBlackMap3<number, string>()
      expect(map.delete(42)).toBe(false)
    })

    it('should remove a leaf node', () => {
      const map = new RedBlackMap3<number, string>()
      map.set(1, 'one')
      expect(map.delete(1)).toBe(true)
      expect(map.size).toBe(0)
      expect(map.get(1)).toBeUndefined()
    })

    it('should remove root with one child', () => {
      const map = new RedBlackMap3<number, string>()
      map.set(2, 'two')
      map.set(1, 'one')
      map.delete(2)
      expect(map.size).toBe(1)
      expect(map.get(1)).toBe('one')
      expect(map.get(2)).toBeUndefined()
    })

    it('should remove node with two children using successor', () => {
      const map = new RedBlackMap3<number, string>()
      map.set(5, 'five')
      map.set(3, 'three')
      map.set(7, 'seven')
      map.set(2, 'two')
      map.set(4, 'four')
      map.delete(3)
      expect(map.size).toBe(4)
      expect(map.get(3)).toBeUndefined()
      expect(map.keys()).toEqual([2, 4, 5, 7])
    })

    it('should handle deleting all elements one by one', () => {
      const map = new RedBlackMap3<number, string>()
      const items: Array<[number, string]> = [[5, 'a'], [3, 'b'], [7, 'c'], [1, 'd'], [9, 'e']]
      for (const [k, v] of items) map.set(k, v)
      for (const [k] of items) {
        expect(map.delete(k)).toBe(true)
      }
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('should handle duplicate delete calls', () => {
      const map = new RedBlackMap3<number, string>()
      map.set(1, 'one')
      expect(map.delete(1)).toBe(true)
      expect(map.delete(1)).toBe(false)
    })
  })

  // ─── min / max ───

  describe('min and max', () => {
    it('should return undefined for empty map', () => {
      const map = new RedBlackMap3<number, string>()
      expect(map.min()).toBeUndefined()
      expect(map.max()).toBeUndefined()
    })

    it('should return the only key for single-element map', () => {
      const map = new RedBlackMap3<number, string>()
      map.set(5, 'five')
      expect(map.min()).toBe(5)
      expect(map.max()).toBe(5)
    })

    it('should return correct min and max after multiple insertions', () => {
      const map = new RedBlackMap3<number, string>()
      map.set(10, 'a')
      map.set(5, 'b')
      map.set(15, 'c')
      map.set(1, 'd')
      map.set(20, 'e')
      expect(map.min()).toBe(1)
      expect(map.max()).toBe(20)
    })

    it('should update min/max after deletions', () => {
      const map = new RedBlackMap3<number, string>()
      map.set(1, 'a')
      map.set(5, 'b')
      map.set(10, 'c')
      map.delete(1)
      expect(map.min()).toBe(5)
      map.delete(10)
      expect(map.max()).toBe(5)
    })
  })

  // ─── size / isEmpty ───

  describe('size and isEmpty', () => {
    it('should track size correctly', () => {
      const map = new RedBlackMap3<number, string>()
      expect(map.size).toBe(0)
      map.set(1, 'a')
      expect(map.size).toBe(1)
      map.set(2, 'b')
      expect(map.size).toBe(2)
      map.set(1, 'updated') // overwrite
      expect(map.size).toBe(2)
      map.delete(1)
      expect(map.size).toBe(1)
    })

    it('should reflect isEmpty correctly', () => {
      const map = new RedBlackMap3<number, string>()
      expect(map.isEmpty()).toBe(true)
      map.set(1, 'a')
      expect(map.isEmpty()).toBe(false)
      map.delete(1)
      expect(map.isEmpty()).toBe(true)
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('should remove all entries', () => {
      const map = new RedBlackMap3<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
      expect(map.get(1)).toBeUndefined()
      expect(map.keys()).toEqual([])
    })

    it('should work on already empty map', () => {
      const map = new RedBlackMap3<number, string>()
      map.clear()
      expect(map.size).toBe(0)
    })
  })

  // ─── keys / values / entries ───

  describe('keys, values, entries', () => {
    it('should return empty arrays for empty map', () => {
      const map = new RedBlackMap3<number, string>()
      expect(map.keys()).toEqual([])
      expect(map.values()).toEqual([])
      expect(map.entries()).toEqual([])
    })

    it('should return keys in sorted order', () => {
      const map = new RedBlackMap3<number, string>()
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.keys()).toEqual([1, 2, 3])
    })

    it('should return values in key order', () => {
      const map = new RedBlackMap3<number, string>()
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.values()).toEqual(['a', 'b', 'c'])
    })

    it('should return entries in key order', () => {
      const map = new RedBlackMap3<number, string>()
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.entries()).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
    })

    it('should handle single element', () => {
      const map = new RedBlackMap3<number, string>()
      map.set(1, 'one')
      expect(map.keys()).toEqual([1])
      expect(map.values()).toEqual(['one'])
      expect(map.entries()).toEqual([[1, 'one']])
    })

    it('should reflect updates in values and entries', () => {
      const map = new RedBlackMap3<number, string>()
      map.set(1, 'old')
      map.set(1, 'new')
      expect(map.values()).toEqual(['new'])
      expect(map.entries()).toEqual([[1, 'new']])
    })
  })

  // ─── Stress / edge cases ───

  describe('edge cases', () => {
    it('should handle sequential insertions (ascending)', () => {
      const map = new RedBlackMap3<number, number>()
      for (let i = 0; i < 100; i++) map.set(i, i * 10)
      expect(map.size).toBe(100)
      expect(map.min()).toBe(0)
      expect(map.max()).toBe(99)
      for (let i = 0; i < 100; i++) {
        expect(map.get(i)).toBe(i * 10)
      }
    })

    it('should handle sequential insertions (descending)', () => {
      const map = new RedBlackMap3<number, number>()
      for (let i = 99; i >= 0; i--) map.set(i, i * 10)
      expect(map.size).toBe(100)
      expect(map.keys()).toEqual(Array.from({ length: 100 }, (_, i) => i))
    })

    it('should handle duplicates correctly', () => {
      const map = new RedBlackMap3<number, string>()
      map.set(1, 'a')
      map.set(1, 'b')
      map.set(1, 'c')
      expect(map.size).toBe(1)
      expect(map.get(1)).toBe('c')
    })

    it('should handle mixed insert and delete', () => {
      const map = new RedBlackMap3<number, string>()
      map.set(10, 'a')
      map.set(5, 'b')
      map.set(15, 'c')
      map.delete(5)
      map.set(3, 'd')
      map.set(7, 'e')
      expect(map.size).toBe(4)
      expect(map.keys()).toEqual([3, 7, 10, 15])
    })
  })
})
