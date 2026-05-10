import { describe, it, expect, beforeEach } from 'vitest'
import { AdaptiveSet } from '../../src/core/adaptive-set/adaptive-set.js'
import type { AdaptiveSetOptions } from '../../src/core/adaptive-set/adaptive-set.js'

describe('AdaptiveSet', () => {
  describe('constructor', () => {
    it('creates empty set with default thresholds', () => {
      const set = new AdaptiveSet<number>()
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
      expect(set.mode).toBe('array')
    })

    it('creates set with custom thresholds', () => {
      const set = new AdaptiveSet<number>({ sorted: 4, hashed: 10 })
      expect(set.size).toBe(0)
      expect(set.mode).toBe('array')
    })

    it('creates set with AdaptiveSetOptions', () => {
      const options: AdaptiveSetOptions = { threshold: { sorted: 5, hashed: 15 } }
      const set = new AdaptiveSet<number>(undefined, options)
      expect(set.size).toBe(0)
      expect(set.mode).toBe('array')
    })

    it('uses default thresholds when thresholds argument is undefined', () => {
      const set = new AdaptiveSet<string>()
      expect(set.mode).toBe('array')
    })

    it('accepts partial thresholds using defaults for missing', () => {
      const set = new AdaptiveSet<number>({ sorted: 8 })
      expect(set.mode).toBe('array')
    })

    it('accepts partial thresholds with only hashed', () => {
      const set = new AdaptiveSet<number>({ hashed: 100 })
      expect(set.mode).toBe('array')
    })
  })

  describe('add', () => {
    it('adds a single value', () => {
      const set = new AdaptiveSet<number>()
      set.add(1)
      expect(set.size).toBe(1)
      expect(set.has(1)).toBe(true)
    })

    it('adds multiple values', () => {
      const set = new AdaptiveSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      expect(set.size).toBe(3)
    })

    it('ignores duplicate values', () => {
      const set = new AdaptiveSet<number>()
      set.add(1)
      set.add(1)
      expect(set.size).toBe(1)
    })

    it('returns this for chaining', () => {
      const set = new AdaptiveSet<number>()
      const result = set.add(1)
      expect(result).toBe(set)
    })

    it('supports chained adds', () => {
      const set = new AdaptiveSet<number>()
      set.add(1).add(2).add(3)
      expect(set.size).toBe(3)
    })

    it('handles string values', () => {
      const set = new AdaptiveSet<string>()
      set.add('hello')
      set.add('world')
      expect(set.has('hello')).toBe(true)
      expect(set.has('world')).toBe(true)
      expect(set.size).toBe(2)
    })

    it('handles boolean values', () => {
      const set = new AdaptiveSet<boolean>()
      set.add(true)
      set.add(false)
      expect(set.size).toBe(2)
    })

    it('handles null values', () => {
      const set = new AdaptiveSet<null>()
      set.add(null)
      expect(set.size).toBe(1)
      expect(set.has(null)).toBe(true)
    })

    it('handles undefined values', () => {
      const set = new AdaptiveSet<undefined>()
      set.add(undefined)
      expect(set.size).toBe(1)
      expect(set.has(undefined)).toBe(true)
    })

    it('handles object references', () => {
      const obj = { id: 1 }
      const set = new AdaptiveSet<{ id: number }>()
      set.add(obj)
      expect(set.has(obj)).toBe(true)
      expect(set.size).toBe(1)
    })

    it('distinguishes different object references', () => {
      const set = new AdaptiveSet<{ id: number }>()
      set.add({ id: 1 })
      set.add({ id: 1 })
      expect(set.size).toBe(2)
    })
  })

  describe('delete', () => {
    it('removes an existing value', () => {
      const set = new AdaptiveSet<number>()
      set.add(1)
      expect(set.delete(1)).toBe(true)
      expect(set.size).toBe(0)
    })

    it('returns false for non-existent value', () => {
      const set = new AdaptiveSet<number>()
      expect(set.delete(1)).toBe(false)
    })

    it('returns false when deleting from empty set', () => {
      const set = new AdaptiveSet<number>()
      expect(set.delete(42)).toBe(false)
    })

    it('removes correct value from middle', () => {
      const set = new AdaptiveSet<number>()
      set.add(1).add(2).add(3)
      expect(set.delete(2)).toBe(true)
      expect(set.has(1)).toBe(true)
      expect(set.has(3)).toBe(true)
      expect(set.has(2)).toBe(false)
      expect(set.size).toBe(2)
    })

    it('only removes one instance of a value', () => {
      const set = new AdaptiveSet<number>()
      set.add(1).add(2).add(3)
      set.delete(1)
      expect(set.has(1)).toBe(false)
      expect(set.size).toBe(2)
    })

    it('allows re-adding after deletion', () => {
      const set = new AdaptiveSet<number>()
      set.add(1)
      set.delete(1)
      set.add(1)
      expect(set.size).toBe(1)
      expect(set.has(1)).toBe(true)
    })

    it('handles deleting string values', () => {
      const set = new AdaptiveSet<string>()
      set.add('hello')
      expect(set.delete('hello')).toBe(true)
      expect(set.delete('hello')).toBe(false)
    })
  })

  describe('has', () => {
    it('returns true for existing value', () => {
      const set = new AdaptiveSet<number>()
      set.add(1)
      expect(set.has(1)).toBe(true)
    })

    it('returns false for non-existent value', () => {
      const set = new AdaptiveSet<number>()
      set.add(1)
      expect(set.has(2)).toBe(false)
    })

    it('returns false for empty set', () => {
      const set = new AdaptiveSet<number>()
      expect(set.has(1)).toBe(false)
    })

    it('returns false after deletion', () => {
      const set = new AdaptiveSet<number>()
      set.add(1)
      set.delete(1)
      expect(set.has(1)).toBe(false)
    })

    it('works with zero value', () => {
      const set = new AdaptiveSet<number>()
      set.add(0)
      expect(set.has(0)).toBe(true)
    })

    it('works with empty string', () => {
      const set = new AdaptiveSet<string>()
      set.add('')
      expect(set.has('')).toBe(true)
    })

    it('works with false value', () => {
      const set = new AdaptiveSet<boolean>()
      set.add(false)
      expect(set.has(false)).toBe(true)
    })
  })

  describe('size', () => {
    it('returns 0 for empty set', () => {
      const set = new AdaptiveSet<number>()
      expect(set.size).toBe(0)
    })

    it('returns correct size after adds', () => {
      const set = new AdaptiveSet<number>()
      set.add(1).add(2).add(3)
      expect(set.size).toBe(3)
    })

    it('does not count duplicates', () => {
      const set = new AdaptiveSet<number>()
      set.add(1).add(1).add(1)
      expect(set.size).toBe(1)
    })

    it('decreases after delete', () => {
      const set = new AdaptiveSet<number>()
      set.add(1).add(2)
      set.delete(1)
      expect(set.size).toBe(1)
    })

    it('returns 0 after clear', () => {
      const set = new AdaptiveSet<number>()
      set.add(1).add(2).add(3)
      set.clear()
      expect(set.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new set', () => {
      const set = new AdaptiveSet<number>()
      expect(set.isEmpty()).toBe(true)
    })

    it('returns false after add', () => {
      const set = new AdaptiveSet<number>()
      set.add(1)
      expect(set.isEmpty()).toBe(false)
    })

    it('returns true after removing all', () => {
      const set = new AdaptiveSet<number>()
      set.add(1)
      set.delete(1)
      expect(set.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const set = new AdaptiveSet<number>()
      set.add(1).add(2)
      set.clear()
      expect(set.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('removes all elements', () => {
      const set = new AdaptiveSet<number>()
      set.add(1).add(2).add(3)
      set.clear()
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })

    it('resets mode to array', () => {
      const set = new AdaptiveSet<number>({ sorted: 2, hashed: 5 })
      for (let i = 0; i < 10; i++) set.add(i)
      expect(set.mode).toBe('hashed')
      set.clear()
      expect(set.mode).toBe('array')
    })

    it('works on already empty set', () => {
      const set = new AdaptiveSet<number>()
      set.clear()
      expect(set.size).toBe(0)
    })

    it('allows adding after clear', () => {
      const set = new AdaptiveSet<number>()
      set.add(1).add(2)
      set.clear()
      set.add(3)
      expect(set.size).toBe(1)
      expect(set.has(3)).toBe(true)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty set', () => {
      const set = new AdaptiveSet<number>()
      expect(set.toArray()).toEqual([])
    })

    it('returns all elements', () => {
      const set = new AdaptiveSet<number>()
      set.add(1).add(2).add(3)
      const arr = set.toArray()
      expect(arr.length).toBe(3)
      expect(arr).toContain(1)
      expect(arr).toContain(2)
      expect(arr).toContain(3)
    })

    it('returns a copy not internal reference', () => {
      const set = new AdaptiveSet<number>()
      set.add(1).add(2)
      const arr = set.toArray()
      arr.push(999)
      expect(set.size).toBe(2)
    })
  })

  describe('values', () => {
    it('returns same as toArray', () => {
      const set = new AdaptiveSet<number>()
      set.add(1).add(2).add(3)
      expect(set.values()).toEqual(set.toArray())
    })

    it('returns empty array for empty set', () => {
      const set = new AdaptiveSet<number>()
      expect(set.values()).toEqual([])
    })
  })

  describe('forEach', () => {
    it('iterates over all elements', () => {
      const set = new AdaptiveSet<number>()
      set.add(1).add(2).add(3)
      const collected: number[] = []
      set.forEach((v) => collected.push(v))
      expect(collected.length).toBe(3)
    })

    it('passes value as both first and second argument', () => {
      const set = new AdaptiveSet<number>()
      set.add(42)
      set.forEach((v1, v2) => {
        expect(v1).toBe(v2)
        expect(v1).toBe(42)
      })
    })

    it('passes set as third argument', () => {
      const set = new AdaptiveSet<number>()
      set.add(1)
      set.forEach((_v1, _v2, s) => {
        expect(s).toBe(set)
      })
    })

    it('does not iterate on empty set', () => {
      const set = new AdaptiveSet<number>()
      let count = 0
      set.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable', () => {
      const set = new AdaptiveSet<number>()
      set.add(1).add(2).add(3)
      const collected: number[] = []
      for (const v of set) collected.push(v)
      expect(collected.length).toBe(3)
    })

    it('works with spread', () => {
      const set = new AdaptiveSet<number>()
      set.add(1).add(2)
      const arr = [...set]
      expect(arr.length).toBe(2)
    })

    it('works with destructuring', () => {
      const set = new AdaptiveSet<number>()
      set.add(10)
      const [first] = set
      expect(first).toBe(10)
    })

    it('works with Array.from', () => {
      const set = new AdaptiveSet<string>()
      set.add('a').add('b')
      const arr = Array.from(set)
      expect(arr.length).toBe(2)
    })
  })

  describe('union', () => {
    it('returns union of two sets', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2)
      const b = new AdaptiveSet<number>()
      b.add(2).add(3)
      const result = a.union(b)
      expect(result.size).toBe(3)
      expect(result.has(1)).toBe(true)
      expect(result.has(2)).toBe(true)
      expect(result.has(3)).toBe(true)
    })

    it('returns copy when no overlap', () => {
      const a = new AdaptiveSet<number>()
      a.add(1)
      const b = new AdaptiveSet<number>()
      b.add(2)
      const result = a.union(b)
      expect(result.size).toBe(2)
    })

    it('returns copy when sets are identical', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2)
      const b = new AdaptiveSet<number>()
      b.add(1).add(2)
      const result = a.union(b)
      expect(result.size).toBe(2)
    })

    it('returns copy of a when b is empty', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2)
      const b = new AdaptiveSet<number>()
      const result = a.union(b)
      expect(result.size).toBe(2)
    })

    it('returns copy of b when a is empty', () => {
      const a = new AdaptiveSet<number>()
      const b = new AdaptiveSet<number>()
      b.add(1).add(2)
      const result = a.union(b)
      expect(result.size).toBe(2)
    })

    it('returns new set not modifying originals', () => {
      const a = new AdaptiveSet<number>()
      a.add(1)
      const b = new AdaptiveSet<number>()
      b.add(2)
      a.union(b)
      expect(a.size).toBe(1)
      expect(b.size).toBe(1)
    })

    it('returns empty when both empty', () => {
      const a = new AdaptiveSet<number>()
      const b = new AdaptiveSet<number>()
      expect(a.union(b).size).toBe(0)
    })
  })

  describe('intersection', () => {
    it('returns intersection of two sets', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2).add(3)
      const b = new AdaptiveSet<number>()
      b.add(2).add(3).add(4)
      const result = a.intersection(b)
      expect(result.size).toBe(2)
      expect(result.has(2)).toBe(true)
      expect(result.has(3)).toBe(true)
    })

    it('returns empty when no overlap', () => {
      const a = new AdaptiveSet<number>()
      a.add(1)
      const b = new AdaptiveSet<number>()
      b.add(2)
      expect(a.intersection(b).size).toBe(0)
    })

    it('returns copy when identical', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2)
      const b = new AdaptiveSet<number>()
      b.add(1).add(2)
      const result = a.intersection(b)
      expect(result.size).toBe(2)
    })

    it('returns empty when a is empty', () => {
      const a = new AdaptiveSet<number>()
      const b = new AdaptiveSet<number>()
      b.add(1)
      expect(a.intersection(b).size).toBe(0)
    })

    it('returns empty when b is empty', () => {
      const a = new AdaptiveSet<number>()
      a.add(1)
      const b = new AdaptiveSet<number>()
      expect(a.intersection(b).size).toBe(0)
    })

    it('does not modify originals', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2)
      const b = new AdaptiveSet<number>()
      b.add(2).add(3)
      a.intersection(b)
      expect(a.size).toBe(2)
      expect(b.size).toBe(2)
    })
  })

  describe('difference', () => {
    it('returns elements in a not in b', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2).add(3)
      const b = new AdaptiveSet<number>()
      b.add(2).add(3).add(4)
      const result = a.difference(b)
      expect(result.size).toBe(1)
      expect(result.has(1)).toBe(true)
    })

    it('returns copy of a when no overlap', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2)
      const b = new AdaptiveSet<number>()
      b.add(3).add(4)
      const result = a.difference(b)
      expect(result.size).toBe(2)
    })

    it('returns empty when b contains all of a', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2)
      const b = new AdaptiveSet<number>()
      b.add(1).add(2).add(3)
      expect(a.difference(b).size).toBe(0)
    })

    it('returns empty when a is empty', () => {
      const a = new AdaptiveSet<number>()
      const b = new AdaptiveSet<number>()
      b.add(1)
      expect(a.difference(b).size).toBe(0)
    })

    it('returns copy of a when b is empty', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2)
      const b = new AdaptiveSet<number>()
      const result = a.difference(b)
      expect(result.size).toBe(2)
    })

    it('does not modify originals', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2)
      const b = new AdaptiveSet<number>()
      b.add(2)
      a.difference(b)
      expect(a.size).toBe(2)
      expect(b.size).toBe(1)
    })
  })

  describe('isSubsetOf', () => {
    it('returns true for subset', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2)
      const b = new AdaptiveSet<number>()
      b.add(1).add(2).add(3)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns true for identical sets', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2)
      const b = new AdaptiveSet<number>()
      b.add(1).add(2)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns true for empty set', () => {
      const a = new AdaptiveSet<number>()
      const b = new AdaptiveSet<number>()
      b.add(1)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns true for both empty', () => {
      const a = new AdaptiveSet<number>()
      const b = new AdaptiveSet<number>()
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('returns false for non-subset', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2).add(3)
      const b = new AdaptiveSet<number>()
      b.add(1).add(2)
      expect(a.isSubsetOf(b)).toBe(false)
    })

    it('returns false when a has element not in b', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(99)
      const b = new AdaptiveSet<number>()
      b.add(1).add(2).add(3)
      expect(a.isSubsetOf(b)).toBe(false)
    })

    it('returns false when a is larger than b', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2).add(3)
      const b = new AdaptiveSet<number>()
      b.add(1).add(2)
      expect(a.isSubsetOf(b)).toBe(false)
    })
  })

  describe('isSupersetOf', () => {
    it('returns true for superset', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2).add(3)
      const b = new AdaptiveSet<number>()
      b.add(1).add(2)
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('returns true for identical sets', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2)
      const b = new AdaptiveSet<number>()
      b.add(1).add(2)
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('returns true when b is empty', () => {
      const a = new AdaptiveSet<number>()
      a.add(1)
      const b = new AdaptiveSet<number>()
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('returns false for non-superset', () => {
      const a = new AdaptiveSet<number>()
      a.add(1)
      const b = new AdaptiveSet<number>()
      b.add(1).add(2)
      expect(a.isSupersetOf(b)).toBe(false)
    })

    it('returns true for both empty', () => {
      const a = new AdaptiveSet<number>()
      const b = new AdaptiveSet<number>()
      expect(a.isSupersetOf(b)).toBe(true)
    })
  })

  describe('equals', () => {
    it('returns true for identical sets', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2).add(3)
      const b = new AdaptiveSet<number>()
      b.add(1).add(2).add(3)
      expect(a.equals(b)).toBe(true)
    })

    it('returns true for both empty', () => {
      const a = new AdaptiveSet<number>()
      const b = new AdaptiveSet<number>()
      expect(a.equals(b)).toBe(true)
    })

    it('returns false for different sizes', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2)
      const b = new AdaptiveSet<number>()
      b.add(1).add(2).add(3)
      expect(a.equals(b)).toBe(false)
    })

    it('returns false for same size different elements', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2)
      const b = new AdaptiveSet<number>()
      b.add(3).add(4)
      expect(a.equals(b)).toBe(false)
    })

    it('returns false for partial overlap', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2)
      const b = new AdaptiveSet<number>()
      b.add(2).add(3)
      expect(a.equals(b)).toBe(false)
    })
  })

  describe('map', () => {
    it('maps values through function', () => {
      const set = new AdaptiveSet<number>()
      set.add(1).add(2).add(3)
      const result = set.map((v) => v * 2)
      expect(result.size).toBe(3)
      expect(result.has(2)).toBe(true)
      expect(result.has(4)).toBe(true)
      expect(result.has(6)).toBe(true)
    })

    it('returns new set not modifying original', () => {
      const set = new AdaptiveSet<number>()
      set.add(1).add(2)
      set.map((v) => v * 2)
      expect(set.has(1)).toBe(true)
      expect(set.has(2)).toBe(true)
      expect(set.has(4)).toBe(false)
    })

    it('deduplicates mapped values', () => {
      const set = new AdaptiveSet<number>()
      set.add(1).add(2).add(3)
      const result = set.map(() => 42)
      expect(result.size).toBe(1)
      expect(result.has(42)).toBe(true)
    })

    it('maps strings', () => {
      const set = new AdaptiveSet<number>()
      set.add(1).add(2).add(3)
      const result = set.map((v) => String(v))
      expect(result.has('1')).toBe(true)
      expect(result.has('2')).toBe(true)
      expect(result.has('3')).toBe(true)
    })

    it('works on empty set', () => {
      const set = new AdaptiveSet<number>()
      const result = set.map((v) => v * 2)
      expect(result.size).toBe(0)
    })
  })

  describe('filter', () => {
    it('filters values by predicate', () => {
      const set = new AdaptiveSet<number>()
      set.add(1).add(2).add(3).add(4).add(5)
      const result = set.filter((v) => v % 2 === 0)
      expect(result.size).toBe(2)
      expect(result.has(2)).toBe(true)
      expect(result.has(4)).toBe(true)
    })

    it('returns new set not modifying original', () => {
      const set = new AdaptiveSet<number>()
      set.add(1).add(2).add(3)
      set.filter((v) => v > 1)
      expect(set.size).toBe(3)
    })

    it('returns empty when nothing matches', () => {
      const set = new AdaptiveSet<number>()
      set.add(1).add(2).add(3)
      const result = set.filter(() => false)
      expect(result.size).toBe(0)
    })

    it('returns copy when all match', () => {
      const set = new AdaptiveSet<number>()
      set.add(1).add(2).add(3)
      const result = set.filter(() => true)
      expect(result.size).toBe(3)
    })

    it('works on empty set', () => {
      const set = new AdaptiveSet<number>()
      const result = set.filter(() => true)
      expect(result.size).toBe(0)
    })
  })

  describe('some', () => {
    it('returns true when element matches', () => {
      const set = new AdaptiveSet<number>()
      set.add(1).add(2).add(3)
      expect(set.some((v) => v === 2)).toBe(true)
    })

    it('returns false when no element matches', () => {
      const set = new AdaptiveSet<number>()
      set.add(1).add(2).add(3)
      expect(set.some((v) => v === 99)).toBe(false)
    })

    it('returns false for empty set', () => {
      const set = new AdaptiveSet<number>()
      expect(set.some(() => true)).toBe(false)
    })

    it('returns true when all match', () => {
      const set = new AdaptiveSet<number>()
      set.add(2).add(4).add(6)
      expect(set.some((v) => v % 2 === 0)).toBe(true)
    })
  })

  describe('every', () => {
    it('returns true when all elements match', () => {
      const set = new AdaptiveSet<number>()
      set.add(2).add(4).add(6)
      expect(set.every((v) => v % 2 === 0)).toBe(true)
    })

    it('returns false when some do not match', () => {
      const set = new AdaptiveSet<number>()
      set.add(1).add(2).add(3)
      expect(set.every((v) => v % 2 === 0)).toBe(false)
    })

    it('returns true for empty set', () => {
      const set = new AdaptiveSet<number>()
      expect(set.every(() => false)).toBe(true)
    })

    it('returns true for single matching element', () => {
      const set = new AdaptiveSet<number>()
      set.add(42)
      expect(set.every((v) => v === 42)).toBe(true)
    })
  })

  describe('min', () => {
    it('returns minimum value', () => {
      const set = new AdaptiveSet<number>()
      set.add(5).add(3).add(8).add(1).add(9)
      expect(set.min).toBe(1)
    })

    it('returns the only value for singleton', () => {
      const set = new AdaptiveSet<number>()
      set.add(42)
      expect(set.min).toBe(42)
    })

    it('returns undefined for empty set', () => {
      const set = new AdaptiveSet<number>()
      expect(set.min).toBeUndefined()
    })

    it('works with string values', () => {
      const set = new AdaptiveSet<string>()
      set.add('banana').add('apple').add('cherry')
      expect(set.min).toBe('apple')
    })

    it('works with negative numbers', () => {
      const set = new AdaptiveSet<number>()
      set.add(-5).add(-10).add(-1)
      expect(set.min).toBe(-10)
    })
  })

  describe('max', () => {
    it('returns maximum value', () => {
      const set = new AdaptiveSet<number>()
      set.add(5).add(3).add(8).add(1).add(9)
      expect(set.max).toBe(9)
    })

    it('returns the only value for singleton', () => {
      const set = new AdaptiveSet<number>()
      set.add(42)
      expect(set.max).toBe(42)
    })

    it('returns undefined for empty set', () => {
      const set = new AdaptiveSet<number>()
      expect(set.max).toBeUndefined()
    })

    it('works with string values', () => {
      const set = new AdaptiveSet<string>()
      set.add('banana').add('apple').add('cherry')
      expect(set.max).toBe('cherry')
    })

    it('works with negative numbers', () => {
      const set = new AdaptiveSet<number>()
      set.add(-5).add(-10).add(-1)
      expect(set.max).toBe(-1)
    })
  })

  describe('mode transitions', () => {
    it('starts in array mode', () => {
      const set = new AdaptiveSet<number>()
      expect(set.mode).toBe('array')
    })

    it('transitions to sorted at threshold', () => {
      const set = new AdaptiveSet<number>({ sorted: 4, hashed: 20 })
      for (let i = 0; i < 3; i++) set.add(i)
      expect(set.mode).toBe('array')
      set.add(3)
      expect(set.mode).toBe('sorted')
    })

    it('transitions to hashed at hashed threshold', () => {
      const set = new AdaptiveSet<number>({ sorted: 4, hashed: 10 })
      for (let i = 0; i < 10; i++) set.add(i)
      expect(set.mode).toBe('hashed')
    })

    it('stays in array mode below thresholds', () => {
      const set = new AdaptiveSet<number>({ sorted: 10, hashed: 100 })
      for (let i = 0; i < 5; i++) set.add(i)
      expect(set.mode).toBe('array')
    })

    it('stays in sorted mode between thresholds', () => {
      const set = new AdaptiveSet<number>({ sorted: 4, hashed: 20 })
      for (let i = 0; i < 10; i++) set.add(i)
      expect(set.mode).toBe('sorted')
    })

    it('downgrades from sorted to array after deletions', () => {
      const set = new AdaptiveSet<number>({ sorted: 4, hashed: 20 })
      for (let i = 0; i < 5; i++) set.add(i)
      expect(set.mode).toBe('sorted')
      for (let i = 0; i < 5; i++) set.delete(i)
      expect(set.mode).toBe('array')
    })

    it('works correctly after array to sorted transition', () => {
      const set = new AdaptiveSet<number>({ sorted: 3, hashed: 100 })
      set.add(10).add(20).add(30)
      expect(set.mode).toBe('sorted')
      expect(set.has(10)).toBe(true)
      expect(set.has(20)).toBe(true)
      expect(set.has(30)).toBe(true)
      expect(set.has(40)).toBe(false)
    })

    it('works correctly after sorted to hashed transition', () => {
      const set = new AdaptiveSet<number>({ sorted: 3, hashed: 5 })
      for (let i = 0; i < 6; i++) set.add(i)
      expect(set.mode).toBe('hashed')
      for (let i = 0; i < 6; i++) {
        expect(set.has(i)).toBe(true)
      }
      expect(set.has(99)).toBe(false)
    })

    it('add works in sorted mode', () => {
      const set = new AdaptiveSet<number>({ sorted: 2, hashed: 100 })
      set.add(5).add(3)
      expect(set.mode).toBe('sorted')
      set.add(7)
      expect(set.has(7)).toBe(true)
      expect(set.size).toBe(3)
    })

    it('delete works in sorted mode', () => {
      const set = new AdaptiveSet<number>({ sorted: 2, hashed: 100 })
      set.add(5).add(3).add(7)
      expect(set.mode).toBe('sorted')
      expect(set.delete(5)).toBe(true)
      expect(set.has(5)).toBe(false)
    })

    it('has works in sorted mode', () => {
      const set = new AdaptiveSet<number>({ sorted: 2, hashed: 100 })
      set.add(10).add(20).add(30)
      expect(set.mode).toBe('sorted')
      expect(set.has(20)).toBe(true)
      expect(set.has(25)).toBe(false)
    })

    it('add works in hashed mode', () => {
      const set = new AdaptiveSet<number>({ sorted: 2, hashed: 4 })
      for (let i = 0; i < 5; i++) set.add(i)
      expect(set.mode).toBe('hashed')
      set.add(100)
      expect(set.has(100)).toBe(true)
    })

    it('delete works in hashed mode', () => {
      const set = new AdaptiveSet<number>({ sorted: 2, hashed: 4 })
      for (let i = 0; i < 5; i++) set.add(i)
      expect(set.mode).toBe('hashed')
      expect(set.delete(2)).toBe(true)
      expect(set.delete(2)).toBe(false)
    })

    it('has works in hashed mode', () => {
      const set = new AdaptiveSet<number>({ sorted: 2, hashed: 4 })
      for (let i = 0; i < 5; i++) set.add(i)
      expect(set.mode).toBe('hashed')
      expect(set.has(3)).toBe(true)
      expect(set.has(99)).toBe(false)
    })

    it('clear resets to array mode from sorted', () => {
      const set = new AdaptiveSet<number>({ sorted: 2, hashed: 100 })
      set.add(1).add(2).add(3)
      expect(set.mode).toBe('sorted')
      set.clear()
      expect(set.mode).toBe('array')
    })

    it('clear resets to array mode from hashed', () => {
      const set = new AdaptiveSet<number>({ sorted: 2, hashed: 4 })
      for (let i = 0; i < 5; i++) set.add(i)
      expect(set.mode).toBe('hashed')
      set.clear()
      expect(set.mode).toBe('array')
    })

    it('skips sorted and goes directly to hashed when adding many at once', () => {
      const set = new AdaptiveSet<number>({ sorted: 3, hashed: 5 })
      for (let i = 0; i < 5; i++) set.add(i)
      expect(set.mode).toBe('hashed')
    })

    it('forEach works across mode transitions', () => {
      const set = new AdaptiveSet<number>({ sorted: 2, hashed: 4 })
      for (let i = 0; i < 6; i++) set.add(i)
      expect(set.mode).toBe('hashed')
      const collected: number[] = []
      set.forEach((v) => collected.push(v))
      expect(collected.length).toBe(6)
    })

    it('toArray works in all modes', () => {
      const set = new AdaptiveSet<number>({ sorted: 2, hashed: 5 })
      set.add(1)
      expect(set.toArray().length).toBe(1)
      set.add(2).add(3)
      expect(set.toArray().length).toBe(3)
      for (let i = 4; i <= 6; i++) set.add(i)
      expect(set.toArray().length).toBe(6)
    })

    it('min and max work across all modes', () => {
      const set = new AdaptiveSet<number>({ sorted: 2, hashed: 5 })
      set.add(5).add(3)
      expect(set.min).toBe(3)
      expect(set.max).toBe(5)
      set.add(1).add(9)
      expect(set.min).toBe(1)
      expect(set.max).toBe(9)
      set.add(10)
      expect(set.min).toBe(1)
      expect(set.max).toBe(10)
    })

    it('iterator works across all modes', () => {
      const set = new AdaptiveSet<number>({ sorted: 2, hashed: 5 })
      set.add(1).add(2)
      expect([...set].length).toBe(2)
      set.add(3)
      expect([...set].length).toBe(3)
      set.add(4).add(5).add(6)
      expect([...set].length).toBe(6)
    })

    it('size property works across all modes', () => {
      const set = new AdaptiveSet<number>({ sorted: 2, hashed: 5 })
      expect(set.size).toBe(0)
      set.add(1)
      expect(set.size).toBe(1)
      set.add(2).add(3)
      expect(set.size).toBe(3)
      set.add(4).add(5).add(6)
      expect(set.size).toBe(6)
    })

    it('isEmpty works across all modes', () => {
      const set = new AdaptiveSet<number>({ sorted: 2, hashed: 5 })
      expect(set.isEmpty()).toBe(true)
      set.add(1)
      expect(set.isEmpty()).toBe(false)
      set.add(2).add(3)
      expect(set.isEmpty()).toBe(false)
      set.add(4).add(5).add(6)
      expect(set.isEmpty()).toBe(false)
      set.clear()
      expect(set.isEmpty()).toBe(true)
    })

    it('set operations work with different modes', () => {
      const a = new AdaptiveSet<number>({ sorted: 2, hashed: 5 })
      const b = new AdaptiveSet<number>({ sorted: 2, hashed: 5 })
      for (let i = 0; i < 6; i++) a.add(i)
      b.add(3).add(4).add(5).add(6)
      const union = a.union(b)
      expect(union.size).toBe(7)
      const intersection = a.intersection(b)
      expect(intersection.size).toBe(3)
      const diff = a.difference(b)
      expect(diff.size).toBe(3)
    })
  })

  describe('edge cases', () => {
    it('handles NaN values', () => {
      const set = new AdaptiveSet<number>()
      set.add(NaN)
      expect(set.has(NaN)).toBe(true)
      expect(set.size).toBe(1)
    })

    it('handles mixed number types', () => {
      const set = new AdaptiveSet<number>()
      set.add(0)
      set.add(-0)
      expect(set.size).toBe(1)
    })

    it('handles large number of adds', () => {
      const set = new AdaptiveSet<number>()
      for (let i = 0; i < 1000; i++) set.add(i)
      expect(set.size).toBe(1000)
    })

    it('handles rapid add/delete cycles', () => {
      const set = new AdaptiveSet<number>()
      for (let i = 0; i < 100; i++) {
        set.add(i)
        if (i % 2 === 0) set.delete(i)
      }
      expect(set.size).toBe(50)
    })

    it('handles clearing and re-adding', () => {
      const set = new AdaptiveSet<number>({ sorted: 2, hashed: 5 })
      for (let i = 0; i < 10; i++) set.add(i)
      set.clear()
      expect(set.size).toBe(0)
      expect(set.mode).toBe('array')
      set.add(42)
      expect(set.size).toBe(1)
      expect(set.has(42)).toBe(true)
    })

    it('map returns different type', () => {
      const set = new AdaptiveSet<number>()
      set.add(1).add(2).add(3)
      const mapped = set.map((v) => `num_${v}`)
      expect(mapped.has('num_1')).toBe(true)
      expect(mapped.has('num_2')).toBe(true)
      expect(mapped.has('num_3')).toBe(true)
    })

    it('multiple operations chained correctly', () => {
      const set = new AdaptiveSet<number>()
      set.add(1).add(2).add(3).add(4).add(5)
      const filtered = set.filter((v) => v > 2).map((v) => v * 10)
      expect(filtered.has(30)).toBe(true)
      expect(filtered.has(40)).toBe(true)
      expect(filtered.has(50)).toBe(true)
      expect(filtered.size).toBe(3)
    })

    it('isSubsetOf and isSupersetOf are symmetric', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2)
      const b = new AdaptiveSet<number>()
      b.add(1).add(2).add(3)
      expect(a.isSubsetOf(b)).toBe(true)
      expect(b.isSupersetOf(a)).toBe(true)
      expect(b.isSubsetOf(a)).toBe(false)
      expect(a.isSupersetOf(b)).toBe(false)
    })

    it('difference and union compose correctly', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2).add(3)
      const b = new AdaptiveSet<number>()
      b.add(2).add(3).add(4)
      const diff = a.difference(b)
      const union = diff.union(a.intersection(b))
      expect(union.size).toBe(3)
      expect(union.has(1)).toBe(true)
      expect(union.has(2)).toBe(true)
      expect(union.has(3)).toBe(true)
    })

    it('filter then some', () => {
      const set = new AdaptiveSet<number>()
      set.add(1).add(2).add(3).add(4)
      const evens = set.filter((v) => v % 2 === 0)
      expect(evens.some((v) => v > 3)).toBe(true)
      expect(evens.some((v) => v > 10)).toBe(false)
    })

    it('filter then every', () => {
      const set = new AdaptiveSet<number>()
      set.add(2).add(4).add(6).add(8)
      const evens = set.filter((v) => v > 3)
      expect(evens.every((v) => v % 2 === 0)).toBe(true)
    })

    it('values returns copy', () => {
      const set = new AdaptiveSet<number>()
      set.add(1).add(2)
      const v = set.values()
      v.push(999)
      expect(set.size).toBe(2)
    })

    it('re-adding duplicate in sorted mode does not increase size', () => {
      const set = new AdaptiveSet<number>({ sorted: 2, hashed: 100 })
      set.add(1).add(2).add(3)
      expect(set.mode).toBe('sorted')
      set.add(2)
      expect(set.size).toBe(3)
    })

    it('re-adding duplicate in hashed mode does not increase size', () => {
      const set = new AdaptiveSet<number>({ sorted: 2, hashed: 4 })
      for (let i = 0; i < 5; i++) set.add(i)
      expect(set.mode).toBe('hashed')
      set.add(2)
      expect(set.size).toBe(5)
    })

    it('delete non-existent in sorted mode returns false', () => {
      const set = new AdaptiveSet<number>({ sorted: 2, hashed: 100 })
      set.add(1).add(2).add(3)
      expect(set.delete(99)).toBe(false)
    })

    it('delete non-existent in hashed mode returns false', () => {
      const set = new AdaptiveSet<number>({ sorted: 2, hashed: 4 })
      for (let i = 0; i < 5; i++) set.add(i)
      expect(set.delete(99)).toBe(false)
    })

    it('handles adding after downgrade', () => {
      const set = new AdaptiveSet<number>({ sorted: 4, hashed: 20 })
      for (let i = 0; i < 5; i++) set.add(i)
      expect(set.mode).toBe('sorted')
      for (let i = 0; i < 5; i++) set.delete(i)
      expect(set.mode).toBe('array')
      set.add(100)
      expect(set.has(100)).toBe(true)
      expect(set.size).toBe(1)
    })

    it('min and max same for single element', () => {
      const set = new AdaptiveSet<number>()
      set.add(42)
      expect(set.min).toBe(42)
      expect(set.max).toBe(42)
    })

    it('min and max with strings', () => {
      const set = new AdaptiveSet<string>()
      set.add('z').add('a').add('m')
      expect(set.min).toBe('a')
      expect(set.max).toBe('z')
    })

    it('set operations with identical sets', () => {
      const a = new AdaptiveSet<number>()
      a.add(1).add(2).add(3)
      expect(a.equals(a)).toBe(true)
      expect(a.union(a).size).toBe(3)
      expect(a.intersection(a).size).toBe(3)
      expect(a.difference(a).size).toBe(0)
      expect(a.isSubsetOf(a)).toBe(true)
      expect(a.isSupersetOf(a)).toBe(true)
    })

    it('threshold of 1 transitions immediately', () => {
      const set = new AdaptiveSet<number>({ sorted: 1, hashed: 2 })
      set.add(1)
      expect(set.mode).toBe('sorted')
      set.add(2)
      expect(set.mode).toBe('hashed')
    })
  })
})
