import { describe, it, expect } from 'vitest'
import { CompressedMap } from '../../src/core/compressed-map/compressed-map.js'

describe('CompressedMap', () => {
  describe('constructor', () => {
    it('creates an empty map with no options', () => {
      const m = new CompressedMap()
      expect(m.size).toBe(0)
    })

    it('creates an empty map with options', () => {
      const m = new CompressedMap({ initialCapacity: 100 })
      expect(m.size).toBe(0)
    })

    it('creates a typed map with generic type', () => {
      const m = new CompressedMap<string>()
      m.set(1, 'hello')
      expect(m.get(1)).toBe('hello')
    })
  })

  describe('set and get', () => {
    it('sets and gets a value', () => {
      const m = new CompressedMap<number>()
      m.set(5, 100)
      expect(m.get(5)).toBe(100)
    })

    it('returns undefined for missing key', () => {
      const m = new CompressedMap<number>()
      expect(m.get(1)).toBeUndefined()
    })

    it('sets multiple key-value pairs', () => {
      const m = new CompressedMap<string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      expect(m.get(1)).toBe('a')
      expect(m.get(2)).toBe('b')
      expect(m.get(3)).toBe('c')
    })

    it('sets keys in reverse order and retrieves them', () => {
      const m = new CompressedMap<string>()
      m.set(3, 'c')
      m.set(1, 'a')
      m.set(2, 'b')
      expect(m.get(1)).toBe('a')
      expect(m.get(2)).toBe('b')
      expect(m.get(3)).toBe('c')
    })

    it('overwrites existing key value', () => {
      const m = new CompressedMap<string>()
      m.set(1, 'first')
      m.set(1, 'second')
      expect(m.get(1)).toBe('second')
      expect(m.size).toBe(1)
    })

    it('overwrites does not change size', () => {
      const m = new CompressedMap<number>()
      m.set(1, 10)
      m.set(2, 20)
      m.set(1, 30)
      expect(m.size).toBe(2)
      expect(m.get(1)).toBe(30)
    })

    it('handles object values', () => {
      const m = new CompressedMap<{ x: number }>()
      m.set(1, { x: 42 })
      expect(m.get(1)).toEqual({ x: 42 })
    })

    it('handles null values', () => {
      const m = new CompressedMap<null>()
      m.set(5, null)
      expect(m.get(5)).toBeNull()
    })

    it('handles undefined values', () => {
      const m = new CompressedMap<string | undefined>()
      m.set(5, undefined)
      expect(m.get(5)).toBeUndefined()
      expect(m.has(5)).toBe(true)
    })

    it('throws on non-integer key', () => {
      const m = new CompressedMap<string>()
      expect(() => m.set(1.5, 'x')).toThrow(TypeError)
    })

    it('throws on NaN key', () => {
      const m = new CompressedMap<string>()
      expect(() => m.set(NaN, 'x')).toThrow(TypeError)
    })

    it('throws on Infinity key', () => {
      const m = new CompressedMap<string>()
      expect(() => m.set(Infinity, 'x')).toThrow(TypeError)
    })

    it('throws on -Infinity key', () => {
      const m = new CompressedMap<string>()
      expect(() => m.set(-Infinity, 'x')).toThrow(TypeError)
    })

    it('accepts zero key', () => {
      const m = new CompressedMap<string>()
      m.set(0, 'zero')
      expect(m.get(0)).toBe('zero')
    })

    it('accepts negative key', () => {
      const m = new CompressedMap<string>()
      m.set(-5, 'neg')
      expect(m.get(-5)).toBe('neg')
    })

    it('accepts large key', () => {
      const m = new CompressedMap<string>()
      m.set(1000000, 'large')
      expect(m.get(1000000)).toBe('large')
    })

    it('accepts negative large key', () => {
      const m = new CompressedMap<string>()
      m.set(-1000000, 'neg-large')
      expect(m.get(-1000000)).toBe('neg-large')
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      const m = new CompressedMap<string>()
      m.set(1, 'a')
      expect(m.has(1)).toBe(true)
    })

    it('returns false for missing key', () => {
      const m = new CompressedMap<string>()
      m.set(1, 'a')
      expect(m.has(2)).toBe(false)
    })

    it('returns false for key on empty map', () => {
      const m = new CompressedMap<string>()
      expect(m.has(0)).toBe(false)
    })

    it('returns true after overwrite', () => {
      const m = new CompressedMap<string>()
      m.set(1, 'a')
      m.set(1, 'b')
      expect(m.has(1)).toBe(true)
    })

    it('returns false after delete', () => {
      const m = new CompressedMap<string>()
      m.set(1, 'a')
      m.delete(1)
      expect(m.has(1)).toBe(false)
    })

    it('returns correct results for many keys', () => {
      const m = new CompressedMap<number>()
      for (let i = 0; i < 100; i += 2) {
        m.set(i, i)
      }
      expect(m.has(0)).toBe(true)
      expect(m.has(2)).toBe(true)
      expect(m.has(98)).toBe(true)
      expect(m.has(1)).toBe(false)
      expect(m.has(99)).toBe(false)
    })
  })

  describe('delete', () => {
    it('deletes existing key and returns true', () => {
      const m = new CompressedMap<string>()
      m.set(1, 'a')
      expect(m.delete(1)).toBe(true)
      expect(m.get(1)).toBeUndefined()
    })

    it('returns false for missing key', () => {
      const m = new CompressedMap<string>()
      expect(m.delete(1)).toBe(false)
    })

    it('returns false for key on empty map', () => {
      const m = new CompressedMap<string>()
      expect(m.delete(0)).toBe(false)
    })

    it('decrements size on successful delete', () => {
      const m = new CompressedMap<string>()
      m.set(1, 'a')
      m.set(2, 'b')
      expect(m.size).toBe(2)
      m.delete(1)
      expect(m.size).toBe(1)
    })

    it('does not change size on failed delete', () => {
      const m = new CompressedMap<string>()
      m.set(1, 'a')
      m.delete(2)
      expect(m.size).toBe(1)
    })

    it('can delete first element', () => {
      const m = new CompressedMap<string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      m.delete(1)
      expect(m.keys()).toEqual([2, 3])
    })

    it('can delete last element', () => {
      const m = new CompressedMap<string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      m.delete(3)
      expect(m.keys()).toEqual([1, 2])
    })

    it('can delete middle element', () => {
      const m = new CompressedMap<string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      m.delete(2)
      expect(m.keys()).toEqual([1, 3])
      expect(m.values()).toEqual(['a', 'c'])
    })

    it('can delete and re-add key', () => {
      const m = new CompressedMap<string>()
      m.set(1, 'a')
      m.delete(1)
      m.set(1, 'b')
      expect(m.get(1)).toBe('b')
      expect(m.size).toBe(1)
    })

    it('can delete all elements', () => {
      const m = new CompressedMap<string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.delete(1)
      m.delete(2)
      expect(m.size).toBe(0)
      expect(m.keys()).toEqual([])
    })
  })

  describe('size', () => {
    it('returns 0 for empty map', () => {
      const m = new CompressedMap()
      expect(m.size).toBe(0)
    })

    it('returns 1 after single set', () => {
      const m = new CompressedMap<string>()
      m.set(1, 'a')
      expect(m.size).toBe(1)
    })

    it('tracks size correctly with many sets', () => {
      const m = new CompressedMap<number>()
      for (let i = 0; i < 50; i++) {
        m.set(i, i)
      }
      expect(m.size).toBe(50)
    })

    it('tracks size after deletes', () => {
      const m = new CompressedMap<number>()
      for (let i = 0; i < 10; i++) {
        m.set(i, i)
      }
      m.delete(5)
      m.delete(7)
      expect(m.size).toBe(8)
    })

    it('tracks size after clear', () => {
      const m = new CompressedMap<number>()
      m.set(1, 1)
      m.set(2, 2)
      m.clear()
      expect(m.size).toBe(0)
    })
  })

  describe('clear', () => {
    it('clears empty map without error', () => {
      const m = new CompressedMap()
      m.clear()
      expect(m.size).toBe(0)
    })

    it('clears map with entries', () => {
      const m = new CompressedMap<string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.clear()
      expect(m.size).toBe(0)
      expect(m.get(1)).toBeUndefined()
      expect(m.get(2)).toBeUndefined()
    })

    it('allows adding after clear', () => {
      const m = new CompressedMap<string>()
      m.set(1, 'a')
      m.clear()
      m.set(2, 'b')
      expect(m.size).toBe(1)
      expect(m.get(2)).toBe('b')
    })
  })

  describe('keys', () => {
    it('returns empty array for empty map', () => {
      const m = new CompressedMap()
      expect(m.keys()).toEqual([])
    })

    it('returns keys in sorted order', () => {
      const m = new CompressedMap<string>()
      m.set(3, 'c')
      m.set(1, 'a')
      m.set(2, 'b')
      expect(m.keys()).toEqual([1, 2, 3])
    })

    it('returns a copy of keys', () => {
      const m = new CompressedMap<string>()
      m.set(1, 'a')
      const k = m.keys()
      k.push(99)
      expect(m.keys()).toEqual([1])
    })
  })

  describe('values', () => {
    it('returns empty array for empty map', () => {
      const m = new CompressedMap()
      expect(m.values()).toEqual([])
    })

    it('returns values in key-sorted order', () => {
      const m = new CompressedMap<string>()
      m.set(3, 'c')
      m.set(1, 'a')
      m.set(2, 'b')
      expect(m.values()).toEqual(['a', 'b', 'c'])
    })

    it('returns a copy of values', () => {
      const m = new CompressedMap<number>()
      m.set(1, 10)
      const v = m.values()
      v.push(99)
      expect(m.values()).toEqual([10])
    })
  })

  describe('entries', () => {
    it('returns empty array for empty map', () => {
      const m = new CompressedMap()
      expect(m.entries()).toEqual([])
    })

    it('returns entries sorted by key', () => {
      const m = new CompressedMap<string>()
      m.set(3, 'c')
      m.set(1, 'a')
      m.set(2, 'b')
      expect(m.entries()).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
    })

    it('returns a copy', () => {
      const m = new CompressedMap<string>()
      m.set(1, 'a')
      const e = m.entries()
      e.push([99, 'x'])
      expect(m.entries()).toEqual([[1, 'a']])
    })
  })

  describe('forEach', () => {
    it('does not call callback on empty map', () => {
      const m = new CompressedMap<string>()
      let count = 0
      m.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('iterates all entries in key order', () => {
      const m = new CompressedMap<string>()
      m.set(3, 'c')
      m.set(1, 'a')
      m.set(2, 'b')
      const result: Array<[number, string]> = []
      m.forEach((v, k) => result.push([k, v]))
      expect(result).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
    })

    it('provides correct key and value', () => {
      const m = new CompressedMap<number>()
      m.set(10, 100)
      m.forEach((v, k) => {
        expect(k).toBe(10)
        expect(v).toBe(100)
      })
    })
  })

  describe('first', () => {
    it('returns undefined for empty map', () => {
      const m = new CompressedMap()
      expect(m.first()).toBeUndefined()
    })

    it('returns the smallest key entry', () => {
      const m = new CompressedMap<string>()
      m.set(5, 'e')
      m.set(1, 'a')
      m.set(3, 'c')
      expect(m.first()).toEqual([1, 'a'])
    })

    it('updates after delete', () => {
      const m = new CompressedMap<string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.delete(1)
      expect(m.first()).toEqual([2, 'b'])
    })
  })

  describe('last', () => {
    it('returns undefined for empty map', () => {
      const m = new CompressedMap()
      expect(m.last()).toBeUndefined()
    })

    it('returns the largest key entry', () => {
      const m = new CompressedMap<string>()
      m.set(5, 'e')
      m.set(1, 'a')
      m.set(3, 'c')
      expect(m.last()).toEqual([5, 'e'])
    })

    it('updates after delete', () => {
      const m = new CompressedMap<string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.delete(2)
      expect(m.last()).toEqual([1, 'a'])
    })
  })

  describe('lowerBound', () => {
    it('returns undefined for empty map', () => {
      const m = new CompressedMap()
      expect(m.lowerBound(0)).toBeUndefined()
    })

    it('returns exact key if present', () => {
      const m = new CompressedMap<string>()
      m.set(1, 'a')
      m.set(3, 'c')
      m.set(5, 'e')
      expect(m.lowerBound(3)).toEqual([3, 'c'])
    })

    it('returns next greater key if exact not present', () => {
      const m = new CompressedMap<string>()
      m.set(1, 'a')
      m.set(3, 'c')
      m.set(5, 'e')
      expect(m.lowerBound(2)).toEqual([3, 'c'])
    })

    it('returns undefined if all keys are less', () => {
      const m = new CompressedMap<string>()
      m.set(1, 'a')
      m.set(3, 'c')
      expect(m.lowerBound(10)).toBeUndefined()
    })

    it('returns first key if target is smaller than all', () => {
      const m = new CompressedMap<string>()
      m.set(5, 'e')
      m.set(10, 'j')
      expect(m.lowerBound(0)).toEqual([5, 'e'])
    })

    it('works with negative keys', () => {
      const m = new CompressedMap<string>()
      m.set(-5, 'a')
      m.set(0, 'b')
      m.set(5, 'c')
      expect(m.lowerBound(-3)).toEqual([0, 'b'])
    })

    it('returns first entry when key equals first', () => {
      const m = new CompressedMap<string>()
      m.set(10, 'a')
      m.set(20, 'b')
      expect(m.lowerBound(10)).toEqual([10, 'a'])
    })

    it('returns last entry when key equals last', () => {
      const m = new CompressedMap<string>()
      m.set(10, 'a')
      m.set(20, 'b')
      expect(m.lowerBound(20)).toEqual([20, 'b'])
    })
  })

  describe('upperBound', () => {
    it('returns undefined for empty map', () => {
      const m = new CompressedMap()
      expect(m.upperBound(0)).toBeUndefined()
    })

    it('returns next greater key when exact key present', () => {
      const m = new CompressedMap<string>()
      m.set(1, 'a')
      m.set(3, 'c')
      m.set(5, 'e')
      expect(m.upperBound(3)).toEqual([5, 'e'])
    })

    it('returns next greater key when exact not present', () => {
      const m = new CompressedMap<string>()
      m.set(1, 'a')
      m.set(5, 'e')
      expect(m.upperBound(2)).toEqual([5, 'e'])
    })

    it('returns undefined if all keys are less or equal', () => {
      const m = new CompressedMap<string>()
      m.set(1, 'a')
      m.set(3, 'c')
      expect(m.upperBound(10)).toBeUndefined()
    })

    it('returns undefined when key equals last', () => {
      const m = new CompressedMap<string>()
      m.set(1, 'a')
      m.set(5, 'e')
      expect(m.upperBound(5)).toBeUndefined()
    })

    it('returns first key if target is smaller than all', () => {
      const m = new CompressedMap<string>()
      m.set(5, 'e')
      m.set(10, 'j')
      expect(m.upperBound(0)).toEqual([5, 'e'])
    })

    it('works with negative keys', () => {
      const m = new CompressedMap<string>()
      m.set(-10, 'a')
      m.set(-5, 'b')
      m.set(5, 'c')
      expect(m.upperBound(-10)).toEqual([-5, 'b'])
    })
  })

  describe('sequential keys', () => {
    it('handles keys 0 to 9', () => {
      const m = new CompressedMap<number>()
      for (let i = 0; i < 10; i++) {
        m.set(i, i * 10)
      }
      expect(m.size).toBe(10)
      for (let i = 0; i < 10; i++) {
        expect(m.get(i)).toBe(i * 10)
      }
    })

    it('keys are sorted', () => {
      const m = new CompressedMap<number>()
      for (let i = 0; i < 10; i++) {
        m.set(i, i)
      }
      expect(m.keys()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('handles sequential keys added in reverse', () => {
      const m = new CompressedMap<number>()
      for (let i = 9; i >= 0; i--) {
        m.set(i, i)
      }
      expect(m.keys()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('delta encoding is optimal for sequential keys', () => {
      const m = new CompressedMap<number>()
      for (let i = 0; i < 100; i++) {
        m.set(i, i)
      }
      const stats = m.compressStats()
      expect(stats.keyBytes).toBe(100)
    })
  })

  describe('sparse keys', () => {
    it('handles keys 0, 100, 200', () => {
      const m = new CompressedMap<string>()
      m.set(0, 'a')
      m.set(100, 'b')
      m.set(200, 'c')
      expect(m.get(0)).toBe('a')
      expect(m.get(100)).toBe('b')
      expect(m.get(200)).toBe('c')
    })

    it('keys are sorted for sparse keys', () => {
      const m = new CompressedMap<number>()
      for (let i = 0; i < 10; i++) {
        m.set(i * 100, i)
      }
      expect(m.keys()).toEqual([0, 100, 200, 300, 400, 500, 600, 700, 800, 900])
    })

    it('lowerBound works with sparse keys', () => {
      const m = new CompressedMap<string>()
      m.set(0, 'a')
      m.set(100, 'b')
      m.set(200, 'c')
      expect(m.lowerBound(50)).toEqual([100, 'b'])
    })

    it('upperBound works with sparse keys', () => {
      const m = new CompressedMap<string>()
      m.set(0, 'a')
      m.set(100, 'b')
      m.set(200, 'c')
      expect(m.upperBound(100)).toEqual([200, 'c'])
    })
  })

  describe('random keys', () => {
    it('sorts random keys correctly', () => {
      const m = new CompressedMap<number>()
      const keys = [42, 7, 15, 3, 99, 1, 55]
      keys.forEach(k => m.set(k, k * 2))
      expect(m.keys()).toEqual([1, 3, 7, 15, 42, 55, 99])
    })

    it('retrieves values for random keys', () => {
      const m = new CompressedMap<string>()
      const pairs: Array<[number, string]> = [[42, 'x'], [7, 'y'], [15, 'z']]
      pairs.forEach(([k, v]) => m.set(k, v))
      expect(m.get(42)).toBe('x')
      expect(m.get(7)).toBe('y')
      expect(m.get(15)).toBe('z')
    })

    it('deletes random keys correctly', () => {
      const m = new CompressedMap<number>()
      const keys = [42, 7, 15, 3, 99]
      keys.forEach(k => m.set(k, k))
      m.delete(15)
      expect(m.has(15)).toBe(false)
      expect(m.size).toBe(4)
      expect(m.keys()).toEqual([3, 7, 42, 99])
    })
  })

  describe('negative keys', () => {
    it('handles negative keys', () => {
      const m = new CompressedMap<string>()
      m.set(-5, 'neg5')
      m.set(-3, 'neg3')
      m.set(0, 'zero')
      m.set(2, 'pos2')
      expect(m.keys()).toEqual([-5, -3, 0, 2])
    })

    it('gets values for negative keys', () => {
      const m = new CompressedMap<string>()
      m.set(-10, 'a')
      m.set(-5, 'b')
      expect(m.get(-10)).toBe('a')
      expect(m.get(-5)).toBe('b')
    })

    it('deletes negative keys', () => {
      const m = new CompressedMap<string>()
      m.set(-10, 'a')
      m.set(-5, 'b')
      m.delete(-10)
      expect(m.has(-10)).toBe(false)
      expect(m.size).toBe(1)
    })

    it('first and last with negative keys', () => {
      const m = new CompressedMap<string>()
      m.set(-5, 'a')
      m.set(5, 'b')
      expect(m.first()).toEqual([-5, 'a'])
      expect(m.last()).toEqual([5, 'b'])
    })

    it('all negative keys sorted correctly', () => {
      const m = new CompressedMap<number>()
      m.set(-1, 1)
      m.set(-100, 2)
      m.set(-50, 3)
      expect(m.keys()).toEqual([-100, -50, -1])
    })
  })

  describe('large keys', () => {
    it('handles very large positive keys', () => {
      const m = new CompressedMap<string>()
      m.set(Number.MAX_SAFE_INTEGER, 'max')
      expect(m.get(Number.MAX_SAFE_INTEGER)).toBe('max')
    })

    it('handles very large negative keys', () => {
      const m = new CompressedMap<string>()
      m.set(-Number.MAX_SAFE_INTEGER, 'min')
      expect(m.get(-Number.MAX_SAFE_INTEGER)).toBe('min')
    })

    it('handles mix of large positive and negative', () => {
      const m = new CompressedMap<string>()
      m.set(-Number.MAX_SAFE_INTEGER, 'min')
      m.set(0, 'zero')
      m.set(Number.MAX_SAFE_INTEGER, 'max')
      expect(m.keys()).toEqual([-Number.MAX_SAFE_INTEGER, 0, Number.MAX_SAFE_INTEGER])
    })
  })

  describe('empty map operations', () => {
    it('get returns undefined', () => {
      const m = new CompressedMap()
      expect(m.get(0)).toBeUndefined()
    })

    it('has returns false', () => {
      const m = new CompressedMap()
      expect(m.has(0)).toBe(false)
    })

    it('delete returns false', () => {
      const m = new CompressedMap()
      expect(m.delete(0)).toBe(false)
    })

    it('keys returns empty array', () => {
      const m = new CompressedMap()
      expect(m.keys()).toEqual([])
    })

    it('values returns empty array', () => {
      const m = new CompressedMap()
      expect(m.values()).toEqual([])
    })

    it('entries returns empty array', () => {
      const m = new CompressedMap()
      expect(m.entries()).toEqual([])
    })

    it('first returns undefined', () => {
      const m = new CompressedMap()
      expect(m.first()).toBeUndefined()
    })

    it('last returns undefined', () => {
      const m = new CompressedMap()
      expect(m.last()).toBeUndefined()
    })

    it('lowerBound returns undefined', () => {
      const m = new CompressedMap()
      expect(m.lowerBound(0)).toBeUndefined()
    })

    it('upperBound returns undefined', () => {
      const m = new CompressedMap()
      expect(m.upperBound(0)).toBeUndefined()
    })

    it('compressStats returns zeros', () => {
      const m = new CompressedMap()
      expect(m.compressStats()).toEqual({ keyBytes: 0, valueBytes: 0, totalBytes: 0 })
    })

    it('forEach does nothing', () => {
      const m = new CompressedMap()
      let called = false
      m.forEach(() => { called = true })
      expect(called).toBe(false)
    })
  })

  describe('single entry', () => {
    it('set and get works', () => {
      const m = new CompressedMap<string>()
      m.set(42, 'answer')
      expect(m.get(42)).toBe('answer')
    })

    it('size is 1', () => {
      const m = new CompressedMap<string>()
      m.set(42, 'answer')
      expect(m.size).toBe(1)
    })

    it('first and last return same entry', () => {
      const m = new CompressedMap<string>()
      m.set(42, 'answer')
      expect(m.first()).toEqual([42, 'answer'])
      expect(m.last()).toEqual([42, 'answer'])
    })

    it('delete results in empty map', () => {
      const m = new CompressedMap<string>()
      m.set(42, 'answer')
      m.delete(42)
      expect(m.size).toBe(0)
      expect(m.get(42)).toBeUndefined()
    })

    it('keys returns single-element array', () => {
      const m = new CompressedMap<string>()
      m.set(42, 'answer')
      expect(m.keys()).toEqual([42])
    })

    it('entries returns single entry', () => {
      const m = new CompressedMap<string>()
      m.set(42, 'answer')
      expect(m.entries()).toEqual([[42, 'answer']])
    })
  })

  describe('many entries', () => {
    it('handles 10000 sequential entries', () => {
      const m = new CompressedMap<number>()
      for (let i = 0; i < 10000; i++) {
        m.set(i, i * 2)
      }
      expect(m.size).toBe(10000)
      expect(m.get(0)).toBe(0)
      expect(m.get(5000)).toBe(10000)
      expect(m.get(9999)).toBe(19998)
    })

    it('handles 10000 sparse entries', () => {
      const m = new CompressedMap<number>()
      for (let i = 0; i < 10000; i++) {
        m.set(i * 10, i)
      }
      expect(m.size).toBe(10000)
      expect(m.get(0)).toBe(0)
      expect(m.get(50000)).toBe(5000)
    })

    it('handles 10000 entries added in reverse', () => {
      const m = new CompressedMap<number>()
      for (let i = 9999; i >= 0; i--) {
        m.set(i, i)
      }
      expect(m.size).toBe(10000)
      expect(m.keys()[0]).toBe(0)
      expect(m.keys()[9999]).toBe(9999)
    })

    it('deletes from 10000 entries', () => {
      const m = new CompressedMap<number>()
      for (let i = 0; i < 10000; i++) {
        m.set(i, i)
      }
      for (let i = 0; i < 5000; i++) {
        m.delete(i * 2)
      }
      expect(m.size).toBe(5000)
      expect(m.has(0)).toBe(false)
      expect(m.has(1)).toBe(true)
    })
  })

  describe('compressStats', () => {
    it('returns zero stats for empty map', () => {
      const m = new CompressedMap<string>()
      const stats = m.compressStats()
      expect(stats.keyBytes).toBe(0)
      expect(stats.valueBytes).toBe(0)
      expect(stats.totalBytes).toBe(0)
    })

    it('calculates key bytes for single entry', () => {
      const m = new CompressedMap<string>()
      m.set(0, 'a')
      const stats = m.compressStats()
      expect(stats.keyBytes).toBe(1)
    })

    it('calculates key bytes for sequential keys efficiently', () => {
      const m = new CompressedMap<number>()
      for (let i = 0; i < 10; i++) {
        m.set(i, i)
      }
      const stats = m.compressStats()
      expect(stats.keyBytes).toBe(10)
    })

    it('key bytes increase for sparse keys', () => {
      const m = new CompressedMap<number>()
      m.set(0, 0)
      m.set(100, 1)
      const stats = m.compressStats()
      expect(stats.keyBytes).toBeGreaterThan(2)
    })

    it('calculates value bytes for number values', () => {
      const m = new CompressedMap<number>()
      m.set(0, 42)
      const stats = m.compressStats()
      expect(stats.valueBytes).toBe(8)
    })

    it('calculates value bytes for string values', () => {
      const m = new CompressedMap<string>()
      m.set(0, 'hi')
      const stats = m.compressStats()
      expect(stats.valueBytes).toBe(4)
    })

    it('calculates value bytes for boolean values', () => {
      const m = new CompressedMap<boolean>()
      m.set(0, true)
      const stats = m.compressStats()
      expect(stats.valueBytes).toBe(4)
    })

    it('calculates value bytes for null', () => {
      const m = new CompressedMap<null>()
      m.set(0, null)
      const stats = m.compressStats()
      expect(stats.valueBytes).toBe(8)
    })

    it('calculates value bytes for object values', () => {
      const m = new CompressedMap<{ a: number }>()
      m.set(0, { a: 1 })
      const stats = m.compressStats()
      expect(stats.valueBytes).toBeGreaterThan(0)
    })

    it('totalBytes equals keyBytes plus valueBytes', () => {
      const m = new CompressedMap<string>()
      m.set(0, 'x')
      m.set(1, 'y')
      const stats = m.compressStats()
      expect(stats.totalBytes).toBe(stats.keyBytes + stats.valueBytes)
    })

    it('compressStats updates after modification', () => {
      const m = new CompressedMap<string>()
      m.set(0, 'a')
      const before = m.compressStats()
      m.set(1, 'b')
      const after = m.compressStats()
      expect(after.totalBytes).toBeGreaterThan(before.totalBytes)
    })

    it('compressStats updates after delete', () => {
      const m = new CompressedMap<string>()
      m.set(0, 'a')
      m.set(1, 'b')
      const before = m.compressStats()
      m.delete(0)
      const after = m.compressStats()
      expect(after.totalBytes).toBeLessThan(before.totalBytes)
    })

    it('negative keys use zigzag encoding', () => {
      const m = new CompressedMap<string>()
      m.set(-1, 'a')
      const stats = m.compressStats()
      expect(stats.keyBytes).toBe(1)
    })

    it('large key uses more bytes', () => {
      const m1 = new CompressedMap<string>()
      m1.set(0, 'a')
      const m2 = new CompressedMap<string>()
      m2.set(1000000, 'a')
      expect(m2.compressStats().keyBytes).toBeGreaterThan(m1.compressStats().keyBytes)
    })
  })

  describe('duplicate set overwrites', () => {
    it('overwrites preserve key ordering', () => {
      const m = new CompressedMap<string>()
      m.set(2, 'b')
      m.set(1, 'a')
      m.set(1, 'updated')
      expect(m.keys()).toEqual([1, 2])
      expect(m.values()).toEqual(['updated', 'b'])
    })

    it('multiple overwrites', () => {
      const m = new CompressedMap<number>()
      m.set(1, 10)
      m.set(1, 20)
      m.set(1, 30)
      expect(m.get(1)).toBe(30)
      expect(m.size).toBe(1)
    })

    it('overwrites with different value types', () => {
      const m = new CompressedMap<string | number>()
      m.set(1, 'string')
      m.set(1, 42)
      expect(m.get(1)).toBe(42)
    })
  })

  describe('integration', () => {
    it('set delete set cycle', () => {
      const m = new CompressedMap<string>()
      m.set(1, 'a')
      m.delete(1)
      expect(m.size).toBe(0)
      m.set(1, 'b')
      expect(m.size).toBe(1)
      expect(m.get(1)).toBe('b')
    })

    it('mixed operations maintain consistency', () => {
      const m = new CompressedMap<number>()
      m.set(5, 50)
      m.set(3, 30)
      m.set(7, 70)
      m.delete(3)
      m.set(4, 40)
      m.set(7, 75)
      expect(m.size).toBe(3)
      expect(m.keys()).toEqual([4, 5, 7])
      expect(m.values()).toEqual([40, 50, 75])
      expect(m.first()).toEqual([4, 40])
      expect(m.last()).toEqual([7, 75])
    })

    it('clear and rebuild', () => {
      const m = new CompressedMap<string>()
      for (let i = 0; i < 10; i++) {
        m.set(i, `v${i}`)
      }
      m.clear()
      expect(m.size).toBe(0)
      m.set(100, 'new')
      expect(m.size).toBe(1)
      expect(m.get(100)).toBe('new')
      expect(m.get(5)).toBeUndefined()
    })

    it('forEach after modifications', () => {
      const m = new CompressedMap<number>()
      m.set(1, 10)
      m.set(2, 20)
      m.set(3, 30)
      m.delete(2)
      m.set(4, 40)
      const result: number[] = []
      m.forEach(v => result.push(v))
      expect(result).toEqual([10, 30, 40])
    })

    it('lowerBound and upperBound after delete', () => {
      const m = new CompressedMap<string>()
      m.set(1, 'a')
      m.set(5, 'b')
      m.set(10, 'c')
      m.delete(5)
      expect(m.lowerBound(3)).toEqual([10, 'c'])
      expect(m.upperBound(1)).toEqual([10, 'c'])
    })
  })
})
