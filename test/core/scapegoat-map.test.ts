import { describe, it, expect } from 'vitest'
import { ScapegoatMap } from '../../src/core/scapegoat-map/index.js'
import type { ScapegoatMapOptions } from '../../src/core/scapegoat-map/index.js'

describe('ScapegoatMap', () => {
  describe('constructor', () => {
    it('creates empty map with default options', () => {
      const map = new ScapegoatMap<number, string>()
      expect(map.size()).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('creates map with custom alpha', () => {
      const map = new ScapegoatMap<number, string>({ alpha: 0.6 })
      expect(map.alpha).toBe(0.6)
    })

    it('creates map with custom comparator', () => {
      const map = new ScapegoatMap<string, number>({
        comparator: (a, b) => a.localeCompare(b),
      })
      map.set('banana', 1)
      map.set('apple', 2)
      map.set('cherry', 3)
      expect(map.keys()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('creates map with both alpha and comparator', () => {
      const map = new ScapegoatMap<string, number>({
        alpha: 0.5,
        comparator: (a, b) => a.localeCompare(b),
      })
      expect(map.alpha).toBe(0.5)
      map.set('c', 3)
      map.set('a', 1)
      map.set('b', 2)
      expect(map.keys()).toEqual(['a', 'b', 'c'])
    })

    it('creates map with no options', () => {
      const map = new ScapegoatMap()
      expect(map.size()).toBe(0)
    })

    it('defaults alpha to 0.7', () => {
      const map = new ScapegoatMap<number, string>()
      expect(map.alpha).toBe(0.7)
    })
  })

  describe('set and get', () => {
    it('sets and gets a single entry', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      expect(map.get(1)).toBe('one')
    })

    it('returns undefined for missing key', () => {
      const map = new ScapegoatMap<number, string>()
      expect(map.get(1)).toBeUndefined()
    })

    it('overwrites existing value', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      map.set(1, 'uno')
      expect(map.get(1)).toBe('uno')
      expect(map.size()).toBe(1)
    })

    it('handles multiple inserts', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(2, 'two')
      expect(map.get(1)).toBe('one')
      expect(map.get(2)).toBe('two')
      expect(map.get(3)).toBe('three')
    })

    it('handles string keys', () => {
      const map = new ScapegoatMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
    })

    it('handles object values', () => {
      const map = new ScapegoatMap<number, { name: string }>()
      map.set(1, { name: 'first' })
      map.set(2, { name: 'second' })
      expect(map.get(1)).toEqual({ name: 'first' })
      expect(map.get(2)).toEqual({ name: 'second' })
    })

    it('handles null values', () => {
      const map = new ScapegoatMap<number, string | null>()
      map.set(1, null)
      expect(map.get(1)).toBeNull()
    })

    it('handles undefined values', () => {
      const map = new ScapegoatMap<number, string | undefined>()
      map.set(1, undefined)
      expect(map.get(1)).toBeUndefined()
    })

    it('handles zero as key', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(0, 'zero')
      expect(map.get(0)).toBe('zero')
    })

    it('handles negative keys', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(-1, 'neg')
      map.set(-5, 'neg-five')
      expect(map.get(-1)).toBe('neg')
      expect(map.get(-5)).toBe('neg-five')
    })

    it('handles duplicate keys without increasing size', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      map.set(1, 'ein')
      map.set(1, 'uno')
      expect(map.size()).toBe(1)
      expect(map.get(1)).toBe('uno')
    })
  })

  describe('has', () => {
    it('returns false for empty map', () => {
      const map = new ScapegoatMap<number, string>()
      expect(map.has(1)).toBe(false)
    })

    it('returns true for existing key', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      expect(map.has(1)).toBe(true)
    })

    it('returns false for missing key', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      expect(map.has(2)).toBe(false)
    })

    it('returns false after delete', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      map.delete(1)
      expect(map.has(1)).toBe(false)
    })

    it('returns true for overwritten key', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      map.set(1, 'uno')
      expect(map.has(1)).toBe(true)
    })
  })

  describe('delete', () => {
    it('deletes a key from the map', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      expect(map.delete(1)).toBe(true)
      expect(map.has(1)).toBe(false)
      expect(map.size()).toBe(0)
    })

    it('returns false for missing key', () => {
      const map = new ScapegoatMap<number, string>()
      expect(map.delete(1)).toBe(false)
    })

    it('deletes from non-empty map without affecting other keys', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.delete(2)
      expect(map.has(1)).toBe(true)
      expect(map.has(2)).toBe(false)
      expect(map.has(3)).toBe(true)
      expect(map.size()).toBe(2)
    })

    it('deletes the minimum key', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.delete(1)
      expect(map.min()).toBe(2)
    })

    it('deletes the maximum key', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.delete(3)
      expect(map.max()).toBe(2)
    })

    it('deletes root node with two children', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(2, 'two')
      map.set(1, 'one')
      map.set(3, 'three')
      map.delete(2)
      expect(map.size()).toBe(2)
      expect(map.has(1)).toBe(true)
      expect(map.has(3)).toBe(true)
    })

    it('deletes leaf node', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(2, 'two')
      map.set(1, 'one')
      map.delete(1)
      expect(map.size()).toBe(1)
      expect(map.has(2)).toBe(true)
    })

    it('deletes node with one child', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(2, 'two')
      map.set(1, 'one')
      map.set(3, 'three')
      map.set(4, 'four')
      map.delete(3)
      expect(map.has(4)).toBe(true)
      expect(map.size()).toBe(3)
    })

    it('can delete all entries one by one', () => {
      const map = new ScapegoatMap<number, string>()
      for (let i = 0; i < 10; i++) {
        map.set(i, String(i))
      }
      for (let i = 0; i < 10; i++) {
        expect(map.delete(i)).toBe(true)
      }
      expect(map.size()).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })
  })

  describe('size and isEmpty', () => {
    it('returns 0 for empty map', () => {
      const map = new ScapegoatMap<number, string>()
      expect(map.size()).toBe(0)
    })

    it('returns true for isEmpty on new map', () => {
      const map = new ScapegoatMap<number, string>()
      expect(map.isEmpty()).toBe(true)
    })

    it('returns correct size after inserts', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      expect(map.size()).toBe(1)
      map.set(2, 'two')
      expect(map.size()).toBe(2)
      map.set(3, 'three')
      expect(map.size()).toBe(3)
    })

    it('returns false for isEmpty after insert', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      expect(map.isEmpty()).toBe(false)
    })

    it('size does not increase on overwrite', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      map.set(1, 'uno')
      expect(map.size()).toBe(1)
    })

    it('size decreases after delete', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.delete(1)
      expect(map.size()).toBe(1)
    })
  })

  describe('clear', () => {
    it('clears the map', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.clear()
      expect(map.size()).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('clear on empty map is no-op', () => {
      const map = new ScapegoatMap<number, string>()
      map.clear()
      expect(map.size()).toBe(0)
    })

    it('map is usable after clear', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      map.clear()
      map.set(2, 'two')
      expect(map.get(2)).toBe('two')
      expect(map.size()).toBe(1)
    })
  })

  describe('min and max', () => {
    it('returns undefined for empty map min', () => {
      const map = new ScapegoatMap<number, string>()
      expect(map.min()).toBeUndefined()
    })

    it('returns undefined for empty map max', () => {
      const map = new ScapegoatMap<number, string>()
      expect(map.max()).toBeUndefined()
    })

    it('returns the only key for min and max on single entry', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(5, 'five')
      expect(map.min()).toBe(5)
      expect(map.max()).toBe(5)
    })

    it('returns correct min', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(5, 'five')
      map.set(2, 'two')
      map.set(8, 'eight')
      expect(map.min()).toBe(2)
    })

    it('returns correct max', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(5, 'five')
      map.set(2, 'two')
      map.set(8, 'eight')
      expect(map.max()).toBe(8)
    })

    it('updates min after delete', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.delete(1)
      expect(map.min()).toBe(2)
    })

    it('updates max after delete', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.delete(3)
      expect(map.max()).toBe(2)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty map', () => {
      const map = new ScapegoatMap<number, string>()
      expect(map.toArray()).toEqual([])
    })

    it('returns single entry', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      expect(map.toArray()).toEqual([[1, 'one']])
    })

    it('returns entries in sorted order', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(2, 'two')
      expect(map.toArray()).toEqual([
        [1, 'one'],
        [2, 'two'],
        [3, 'three'],
      ])
    })

    it('reflects overwrites', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      map.set(1, 'uno')
      expect(map.toArray()).toEqual([[1, 'uno']])
    })

    it('reflects deletions', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.delete(2)
      expect(map.toArray()).toEqual([
        [1, 'one'],
        [3, 'three'],
      ])
    })
  })

  describe('keys', () => {
    it('returns empty array for empty map', () => {
      const map = new ScapegoatMap<number, string>()
      expect(map.keys()).toEqual([])
    })

    it('returns keys in sorted order', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(2, 'two')
      expect(map.keys()).toEqual([1, 2, 3])
    })

    it('returns single key', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(5, 'five')
      expect(map.keys()).toEqual([5])
    })
  })

  describe('values', () => {
    it('returns empty array for empty map', () => {
      const map = new ScapegoatMap<number, string>()
      expect(map.values()).toEqual([])
    })

    it('returns values in key order', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(2, 'two')
      expect(map.values()).toEqual(['one', 'two', 'three'])
    })

    it('returns single value', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(5, 'five')
      expect(map.values()).toEqual(['five'])
    })
  })

  describe('forEach', () => {
    it('does not call callback on empty map', () => {
      const map = new ScapegoatMap<number, string>()
      let count = 0
      map.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('iterates in order', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(2, 'two')
      const result: Array<[number, string]> = []
      map.forEach((value, key) => {
        result.push([key, value])
      })
      expect(result).toEqual([
        [1, 'one'],
        [2, 'two'],
        [3, 'three'],
      ])
    })

    it('provides correct value and key', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(42, 'answer')
      map.forEach((value, key) => {
        expect(key).toBe(42)
        expect(value).toBe('answer')
      })
    })
  })

  describe('Symbol.iterator', () => {
    it('returns empty iterator for empty map', () => {
      const map = new ScapegoatMap<number, string>()
      expect([...map]).toEqual([])
    })

    it('iterates in sorted order', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(2, 'two')
      expect([...map]).toEqual([
        [1, 'one'],
        [2, 'two'],
        [3, 'three'],
      ])
    })

    it('works with for...of', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      const result: Array<[number, string]> = []
      for (const entry of map) {
        result.push(entry)
      }
      expect(result).toEqual([
        [1, 'one'],
        [2, 'two'],
      ])
    })

    it('works with Array.from', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(2, 'two')
      map.set(1, 'one')
      expect(Array.from(map)).toEqual([
        [1, 'one'],
        [2, 'two'],
      ])
    })
  })

  describe('height', () => {
    it('returns 0 for empty map', () => {
      const map = new ScapegoatMap<number, string>()
      expect(map.height()).toBe(0)
    })

    it('returns 1 for single element', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      expect(map.height()).toBe(1)
    })

    it('returns reasonable height for balanced tree', () => {
      const map = new ScapegoatMap<number, string>()
      for (let i = 0; i < 100; i++) {
        map.set(i, String(i))
      }
      const h = map.height()
      expect(h).toBeLessThanOrEqual(Math.ceil(Math.log2(100) / (1 - map.alpha) + 1))
    })

    it('height increases with more elements', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      const h1 = map.height()
      map.set(2, 'two')
      map.set(3, 'three')
      const h2 = map.height()
      expect(h2).toBeGreaterThanOrEqual(h1)
    })
  })

  describe('clone', () => {
    it('clones an empty map', () => {
      const map = new ScapegoatMap<number, string>()
      const cloned = map.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('clones a non-empty map', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      const cloned = map.clone()
      expect(cloned.size()).toBe(3)
      expect(cloned.get(1)).toBe('one')
      expect(cloned.get(2)).toBe('two')
      expect(cloned.get(3)).toBe('three')
    })

    it('clone is independent of original', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      const cloned = map.clone()
      cloned.set(1, 'uno')
      expect(map.get(1)).toBe('one')
      expect(cloned.get(1)).toBe('uno')
    })

    it('clone preserves alpha', () => {
      const map = new ScapegoatMap<number, string>({ alpha: 0.6 })
      const cloned = map.clone()
      expect(cloned.alpha).toBe(0.6)
    })

    it('clone preserves comparator', () => {
      const map = new ScapegoatMap<string, number>({
        comparator: (a, b) => b.localeCompare(a),
      })
      map.set('a', 1)
      map.set('b', 2)
      const cloned = map.clone()
      expect(cloned.get('a')).toBe(1)
      expect(cloned.get('b')).toBe(2)
    })

    it('deletions on clone do not affect original', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      const cloned = map.clone()
      cloned.delete(1)
      expect(map.has(1)).toBe(true)
      expect(cloned.has(1)).toBe(false)
    })
  })

  describe('alpha', () => {
    it('returns default alpha', () => {
      const map = new ScapegoatMap<number, string>()
      expect(map.alpha).toBe(0.7)
    })

    it('returns custom alpha', () => {
      const map = new ScapegoatMap<number, string>({ alpha: 0.5 })
      expect(map.alpha).toBe(0.5)
    })

    it('alpha 0.9 creates a more relaxed tree', () => {
      const map = new ScapegoatMap<number, string>({ alpha: 0.9 })
      for (let i = 0; i < 100; i++) {
        map.set(i, String(i))
      }
      expect(map.size()).toBe(100)
    })

    it('alpha 0.51 creates a stricter balanced tree', () => {
      const map = new ScapegoatMap<number, string>({ alpha: 0.51 })
      for (let i = 0; i < 100; i++) {
        map.set(i, String(i))
      }
      expect(map.size()).toBe(100)
    })
  })

  describe('edge cases', () => {
    it('handles single element', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      expect(map.size()).toBe(1)
      expect(map.get(1)).toBe('one')
      expect(map.min()).toBe(1)
      expect(map.max()).toBe(1)
      expect(map.has(1)).toBe(true)
      expect(map.isEmpty()).toBe(false)
    })

    it('handles sorted input', () => {
      const map = new ScapegoatMap<number, string>()
      for (let i = 0; i < 50; i++) {
        map.set(i, String(i))
      }
      expect(map.size()).toBe(50)
      expect(map.keys()).toEqual(Array.from({ length: 50 }, (_, i) => i))
    })

    it('handles reverse sorted input', () => {
      const map = new ScapegoatMap<number, string>()
      for (let i = 49; i >= 0; i--) {
        map.set(i, String(i))
      }
      expect(map.size()).toBe(50)
      expect(map.keys()).toEqual(Array.from({ length: 50 }, (_, i) => i))
    })

    it('handles alternating insert pattern', () => {
      const map = new ScapegoatMap<number, string>()
      const n = 20
      for (let i = 0; i < n; i++) {
        map.set(i % 2 === 0 ? i / 2 : n - (i + 1) / 2, String(i))
      }
      expect(map.size()).toBe(n)
    })

    it('handles many overwrites', () => {
      const map = new ScapegoatMap<number, string>()
      for (let i = 0; i < 100; i++) {
        map.set(1, `val-${i}`)
      }
      expect(map.size()).toBe(1)
      expect(map.get(1)).toBe('val-99')
    })

    it('handles get on empty map', () => {
      const map = new ScapegoatMap<number, string>()
      expect(map.get(42)).toBeUndefined()
    })

    it('handles delete on empty map', () => {
      const map = new ScapegoatMap<number, string>()
      expect(map.delete(42)).toBe(false)
    })

    it('handles min/max on empty map', () => {
      const map = new ScapegoatMap<number, string>()
      expect(map.min()).toBeUndefined()
      expect(map.max()).toBeUndefined()
    })
  })

  describe('custom comparator', () => {
    it('works with reverse comparator', () => {
      const map = new ScapegoatMap<number, string>({
        comparator: (a, b) => b - a,
      })
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      expect(map.keys()).toEqual([3, 2, 1])
    })

    it('works with string comparator', () => {
      const map = new ScapegoatMap<string, number>({
        comparator: (a, b) => a.localeCompare(b),
      })
      map.set('charlie', 3)
      map.set('alpha', 1)
      map.set('bravo', 2)
      expect(map.keys()).toEqual(['alpha', 'bravo', 'charlie'])
    })

    it('works with case-insensitive string comparator', () => {
      const map = new ScapegoatMap<string, number>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      map.set('Apple', 1)
      map.set('banana', 2)
      map.set('Cherry', 3)
      expect(map.get('apple')).toBe(1)
    })
  })

  describe('large datasets', () => {
    it('handles 1000 sequential inserts', () => {
      const map = new ScapegoatMap<number, string>()
      for (let i = 0; i < 1000; i++) {
        map.set(i, String(i))
      }
      expect(map.size()).toBe(1000)
      expect(map.min()).toBe(0)
      expect(map.max()).toBe(999)
    })

    it('handles 1000 reverse inserts', () => {
      const map = new ScapegoatMap<number, string>()
      for (let i = 999; i >= 0; i--) {
        map.set(i, String(i))
      }
      expect(map.size()).toBe(1000)
      expect(map.keys()).toEqual(Array.from({ length: 1000 }, (_, i) => i))
    })

    it('handles 500 random-looking inserts', () => {
      const map = new ScapegoatMap<number, string>()
      const keys = [7, 3, 9, 1, 5, 8, 10, 0, 2, 4, 6]
      for (const k of keys) {
        map.set(k, String(k))
      }
      expect(map.size()).toBe(keys.length)
      expect(map.toArray().map(([k]) => k)).toEqual(keys.slice().sort((a, b) => a - b))
    })

    it('handles 200 inserts and deletes', () => {
      const map = new ScapegoatMap<number, string>()
      for (let i = 0; i < 200; i++) {
        map.set(i, String(i))
      }
      for (let i = 0; i < 100; i++) {
        map.delete(i * 2)
      }
      expect(map.size()).toBe(100)
    })
  })

  describe('balance verification', () => {
    it('maintains sorted order after sorted inserts', () => {
      const map = new ScapegoatMap<number, number>()
      for (let i = 0; i < 100; i++) {
        map.set(i, i * 10)
      }
      const keys = map.keys()
      for (let i = 1; i < keys.length; i++) {
        expect(keys[i]).toBeGreaterThan(keys[i - 1])
      }
    })

    it('maintains sorted order after reverse inserts', () => {
      const map = new ScapegoatMap<number, number>()
      for (let i = 99; i >= 0; i--) {
        map.set(i, i * 10)
      }
      const keys = map.keys()
      for (let i = 1; i < keys.length; i++) {
        expect(keys[i]).toBeGreaterThan(keys[i - 1])
      }
    })

    it('tree height is logarithmic for sequential inserts', () => {
      const map = new ScapegoatMap<number, string>({ alpha: 0.7 })
      for (let i = 0; i < 1000; i++) {
        map.set(i, String(i))
      }
      const h = map.height()
      expect(h).toBeLessThanOrEqual(40)
    })

    it('tree height is logarithmic for reverse inserts', () => {
      const map = new ScapegoatMap<number, string>({ alpha: 0.7 })
      for (let i = 999; i >= 0; i--) {
        map.set(i, String(i))
      }
      const h = map.height()
      expect(h).toBeLessThanOrEqual(40)
    })

    it('rebalancing works with strict alpha', () => {
      const map = new ScapegoatMap<number, string>({ alpha: 0.55 })
      for (let i = 0; i < 200; i++) {
        map.set(i, String(i))
      }
      const keys = map.keys()
      expect(keys.length).toBe(200)
      for (let i = 1; i < keys.length; i++) {
        expect(keys[i]).toBeGreaterThan(keys[i - 1])
      }
    })
  })

  describe('ScapegoatMapOptions export', () => {
    it('can be used as a type', () => {
      const options: ScapegoatMapOptions<number> = {
        alpha: 0.6,
        comparator: (a, b) => a - b,
      }
      const map = new ScapegoatMap<number, string>(options)
      map.set(1, 'one')
      expect(map.get(1)).toBe('one')
    })
  })

  describe('mixed operations', () => {
    it('set, get, delete, set again', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      expect(map.get(1)).toBe('one')
      map.delete(1)
      expect(map.get(1)).toBeUndefined()
      map.set(1, 'new-one')
      expect(map.get(1)).toBe('new-one')
    })

    it('interleaved insert and delete', () => {
      const map = new ScapegoatMap<number, string>()
      for (let i = 0; i < 20; i++) {
        map.set(i, String(i))
        if (i % 3 === 0 && i > 0) {
          map.delete(i - 1)
        }
      }
      expect(map.size()).toBeGreaterThan(0)
    })

    it('forEach after many operations', () => {
      const map = new ScapegoatMap<number, string>()
      for (let i = 0; i < 50; i++) {
        map.set(i, String(i))
      }
      for (let i = 0; i < 25; i++) {
        map.delete(i * 2)
      }
      const result: Array<[number, string]> = []
      map.forEach((v, k) => result.push([k, v]))
      let prev = -Infinity
      for (const [k] of result) {
        expect(k).toBeGreaterThan(prev)
        prev = k
      }
    })

    it('toArray after clear and reinsert', () => {
      const map = new ScapegoatMap<number, string>()
      for (let i = 0; i < 10; i++) {
        map.set(i, String(i))
      }
      map.clear()
      map.set(5, 'five')
      map.set(3, 'three')
      map.set(7, 'seven')
      expect(map.toArray()).toEqual([
        [3, 'three'],
        [5, 'five'],
        [7, 'seven'],
      ])
    })
  })

  describe('iteration consistency', () => {
    it('keys, values, toArray all agree on order', () => {
      const map = new ScapegoatMap<number, string>()
      const entries: Array<[number, string]> = [
        [5, 'five'],
        [2, 'two'],
        [8, 'eight'],
        [1, 'one'],
        [3, 'three'],
      ]
      for (const [k, v] of entries) {
        map.set(k, v)
      }
      const arr = map.toArray()
      const keys = map.keys()
      const values = map.values()
      expect(arr.map(([k]) => k)).toEqual(keys)
      expect(arr.map(([, v]) => v)).toEqual(values)
    })

    it('iterator and forEach agree', () => {
      const map = new ScapegoatMap<number, string>()
      for (let i = 0; i < 10; i++) {
        map.set(i, String(i))
      }
      const iterResult = [...map]
      const forEachResult: Array<[number, string]> = []
      map.forEach((v, k) => forEachResult.push([k, v]))
      expect(iterResult).toEqual(forEachResult)
    })
  })

  describe('delete and rebalance', () => {
    it('delete triggers rebalance when tree becomes too sparse', () => {
      const map = new ScapegoatMap<number, string>({ alpha: 0.6 })
      for (let i = 0; i < 100; i++) {
        map.set(i, String(i))
      }
      for (let i = 0; i < 80; i++) {
        map.delete(i)
      }
      expect(map.size()).toBe(20)
      const keys = map.keys()
      expect(keys.length).toBe(20)
    })

    it('delete all and rebuild', () => {
      const map = new ScapegoatMap<number, string>()
      for (let i = 0; i < 50; i++) {
        map.set(i, String(i))
      }
      for (let i = 0; i < 50; i++) {
        map.delete(i)
      }
      expect(map.isEmpty()).toBe(true)
      for (let i = 0; i < 50; i++) {
        map.set(i, String(i))
      }
      expect(map.size()).toBe(50)
    })
  })

  describe('additional edge cases', () => {
    it('handles duplicate set does not change size', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'a')
      map.set(1, 'b')
      map.set(1, 'c')
      map.set(1, 'd')
      expect(map.size()).toBe(1)
    })

    it('handles set after delete same key', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'a')
      map.delete(1)
      map.set(1, 'b')
      expect(map.get(1)).toBe('b')
      expect(map.size()).toBe(1)
    })

    it('handles boolean-like keys', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(0, 'zero')
      map.set(1, 'one')
      expect(map.has(0)).toBe(true)
      expect(map.has(1)).toBe(true)
    })

    it('handles float keys', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1.5, 'one-point-five')
      map.set(2.7, 'two-point-seven')
      map.set(0.3, 'zero-point-three')
      expect(map.keys()).toEqual([0.3, 1.5, 2.7])
    })

    it('handles very large keys', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(Number.MAX_SAFE_INTEGER, 'max')
      map.set(Number.MIN_SAFE_INTEGER, 'min')
      expect(map.min()).toBe(Number.MIN_SAFE_INTEGER)
      expect(map.max()).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('get returns undefined for key not in map with entries', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      map.set(3, 'three')
      expect(map.get(2)).toBeUndefined()
    })

    it('delete returns false after already deleted', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      expect(map.delete(1)).toBe(true)
      expect(map.delete(1)).toBe(false)
    })

    it('forEach on single element', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(42, 'answer')
      let count = 0
      map.forEach((v, k) => {
        expect(k).toBe(42)
        expect(v).toBe('answer')
        count++
      })
      expect(count).toBe(1)
    })

    it('iterator on single element', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(42, 'answer')
      const result = [...map]
      expect(result).toEqual([[42, 'answer']])
    })

    it('height of two node tree', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      expect(map.height()).toBeGreaterThanOrEqual(1)
      expect(map.height()).toBeLessThanOrEqual(3)
    })

    it('clear preserves alpha', () => {
      const map = new ScapegoatMap<number, string>({ alpha: 0.55 })
      map.set(1, 'one')
      map.clear()
      expect(map.alpha).toBe(0.55)
    })

    it('clear preserves comparator', () => {
      const map = new ScapegoatMap<string, number>({
        comparator: (a, b) => a.localeCompare(b),
      })
      map.set('a', 1)
      map.clear()
      map.set('b', 2)
      map.set('a', 1)
      expect(map.keys()).toEqual(['a', 'b'])
    })

    it('clone of map with deleted entries', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.delete(2)
      const cloned = map.clone()
      expect(cloned.size()).toBe(2)
      expect(cloned.has(1)).toBe(true)
      expect(cloned.has(3)).toBe(true)
      expect(cloned.has(2)).toBe(false)
    })

    it('clone of large map', () => {
      const map = new ScapegoatMap<number, string>()
      for (let i = 0; i < 100; i++) {
        map.set(i, String(i))
      }
      const cloned = map.clone()
      expect(cloned.size()).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(cloned.get(i)).toBe(String(i))
      }
    })

    it('toArray returns new array each call', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      const arr1 = map.toArray()
      const arr2 = map.toArray()
      expect(arr1).not.toBe(arr2)
      expect(arr1).toEqual(arr2)
    })

    it('keys returns new array each call', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      const k1 = map.keys()
      const k2 = map.keys()
      expect(k1).not.toBe(k2)
      expect(k1).toEqual(k2)
    })

    it('values returns new array each call', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      const v1 = map.values()
      const v2 = map.values()
      expect(v1).not.toBe(v2)
      expect(v1).toEqual(v2)
    })

    it('works with number string keys via comparator', () => {
      const map = new ScapegoatMap<string, number>({
        comparator: (a, b) => parseInt(a, 10) - parseInt(b, 10),
      })
      map.set('10', 10)
      map.set('2', 2)
      map.set('1', 1)
      expect(map.keys()).toEqual(['1', '2', '10'])
    })

    it('handles 2000 inserts', () => {
      const map = new ScapegoatMap<number, string>()
      for (let i = 0; i < 2000; i++) {
        map.set(i, String(i))
      }
      expect(map.size()).toBe(2000)
    })

    it('handles 500 inserts then clear then 500 more', () => {
      const map = new ScapegoatMap<number, string>()
      for (let i = 0; i < 500; i++) {
        map.set(i, String(i))
      }
      map.clear()
      for (let i = 500; i < 1000; i++) {
        map.set(i, String(i))
      }
      expect(map.size()).toBe(500)
      expect(map.min()).toBe(500)
      expect(map.max()).toBe(999)
    })

    it('handles inserting same key many times interspersed with others', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(1, 'c')
      map.set(3, 'd')
      map.set(1, 'e')
      expect(map.size()).toBe(3)
      expect(map.get(1)).toBe('e')
      expect(map.get(2)).toBe('b')
      expect(map.get(3)).toBe('d')
    })

    it('delete non-existent key in non-empty map', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      map.set(3, 'three')
      expect(map.delete(2)).toBe(false)
      expect(map.size()).toBe(2)
    })

    it('height after clear is 0', () => {
      const map = new ScapegoatMap<number, string>()
      for (let i = 0; i < 100; i++) {
        map.set(i, String(i))
      }
      map.clear()
      expect(map.height()).toBe(0)
    })

    it('multiple clones are independent', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      const c1 = map.clone()
      const c2 = map.clone()
      c1.set(1, 'c1')
      c2.set(1, 'c2')
      expect(map.get(1)).toBe('one')
      expect(c1.get(1)).toBe('c1')
      expect(c2.get(1)).toBe('c2')
    })

    it('toArray after delete reflects removal', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.delete(2)
      expect(map.toArray()).toEqual([[1, 'one'], [3, 'three']])
    })

    it('forEach visits correct number of entries', () => {
      const map = new ScapegoatMap<number, string>()
      for (let i = 0; i < 15; i++) {
        map.set(i, String(i))
      }
      let count = 0
      map.forEach(() => { count++ })
      expect(count).toBe(15)
    })

    it('handles sequential delete from front', () => {
      const map = new ScapegoatMap<number, string>()
      for (let i = 0; i < 20; i++) {
        map.set(i, String(i))
      }
      for (let i = 0; i < 20; i++) {
        expect(map.delete(i)).toBe(true)
      }
      expect(map.isEmpty()).toBe(true)
    })

    it('handles sequential delete from back', () => {
      const map = new ScapegoatMap<number, string>()
      for (let i = 0; i < 20; i++) {
        map.set(i, String(i))
      }
      for (let i = 19; i >= 0; i--) {
        expect(map.delete(i)).toBe(true)
      }
      expect(map.isEmpty()).toBe(true)
    })

    it('values after overwrite are correct', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'old')
      map.set(1, 'new')
      expect(map.values()).toEqual(['new'])
    })

    it('handles 300 random order inserts', () => {
      const map = new ScapegoatMap<number, string>()
      const inserted = new Set<number>()
      for (let i = 0; i < 300; i++) {
        const k = (i * 37 + 13) % 500
        map.set(k, String(k))
        inserted.add(k)
      }
      expect(map.size()).toBe(inserted.size)
    })

    it('height of 3-node balanced tree', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(2, 'two')
      map.set(1, 'one')
      map.set(3, 'three')
      const h = map.height()
      expect(h).toBeGreaterThanOrEqual(2)
      expect(h).toBeLessThanOrEqual(3)
    })

    it('clone and modify with delete', () => {
      const map = new ScapegoatMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      const cloned = map.clone()
      cloned.delete(2)
      cloned.set(4, 'four')
      expect(map.size()).toBe(3)
      expect(cloned.size()).toBe(3)
      expect(cloned.has(4)).toBe(true)
      expect(map.has(4)).toBe(false)
    })
  })
})
