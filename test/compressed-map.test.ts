import { CompressedMap } from '../src/core/compressed-map/compressed-map.js'
import type { CompressedMapOptions, CompressStats } from '../src/core/compressed-map/types.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('CompressedMap', () => {
  describe('constructor', () => {
    it('creates an empty map with no options', () => {
      const map = new CompressedMap<string>()
      expect(map.size).toBe(0)
    })

    it('creates an empty map with empty options', () => {
      const map = new CompressedMap<string>({})
      expect(map.size).toBe(0)
    })

    it('creates an empty map with initialCapacity option', () => {
      const opts: CompressedMapOptions = { initialCapacity: 100 }
      const map = new CompressedMap<string>(opts)
      expect(map.size).toBe(0)
    })

    it('defaults to zero size', () => {
      const map = new CompressedMap<number>()
      expect(map.size).toBe(0)
      expect(map.keys()).toEqual([])
      expect(map.values()).toEqual([])
    })
  })

  // ─── set ──────────────────────────────────────────────────────────────

  describe('set', () => {
    it('adds a key-value pair to an empty map', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'one')
      expect(map.size).toBe(1)
      expect(map.get(1)).toBe('one')
    })

    it('adds a key-value pair with key 0', () => {
      const map = new CompressedMap<string>()
      map.set(0, 'zero')
      expect(map.get(0)).toBe('zero')
    })

    it('adds multiple entries in arbitrary order (maintains sorted keys)', () => {
      const map = new CompressedMap<string>()
      map.set(5, 'five')
      map.set(2, 'two')
      map.set(8, 'eight')
      map.set(1, 'one')
      expect(map.keys()).toEqual([1, 2, 5, 8])
      expect(map.values()).toEqual(['one', 'two', 'five', 'eight'])
    })

    it('overwrites an existing value', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'original')
      map.set(1, 'updated')
      expect(map.size).toBe(1)
      expect(map.get(1)).toBe('updated')
    })

    it('overwrites value and preserves size', () => {
      const map = new CompressedMap<number>()
      map.set(1, 10)
      map.set(2, 20)
      map.set(1, 100)
      expect(map.size).toBe(2)
    })

    it('throws TypeError for non-integer key (float)', () => {
      const map = new CompressedMap<string>()
      expect(() => map.set(1.5, 'bad')).toThrow(TypeError)
      expect(() => map.set(1.5, 'bad')).toThrow('Key must be a finite integer')
    })

    it('throws TypeError for NaN key', () => {
      const map = new CompressedMap<string>()
      expect(() => map.set(NaN, 'bad')).toThrow(TypeError)
    })

    it('throws TypeError for Infinity key', () => {
      const map = new CompressedMap<string>()
      expect(() => map.set(Infinity, 'bad')).toThrow(TypeError)
      expect(() => map.set(-Infinity, 'bad')).toThrow(TypeError)
    })

    it('accepts negative integer keys', () => {
      const map = new CompressedMap<string>()
      map.set(-3, 'neg')
      map.set(-1, 'neg1')
      map.set(2, 'pos')
      expect(map.keys()).toEqual([-3, -1, 2])
      expect(map.get(-3)).toBe('neg')
      expect(map.get(-1)).toBe('neg1')
    })

    it('accepts large integer keys', () => {
      const map = new CompressedMap<string>()
      map.set(Number.MAX_SAFE_INTEGER, 'max')
      expect(map.get(Number.MAX_SAFE_INTEGER)).toBe('max')
    })

    it('handles number values', () => {
      const map = new CompressedMap<number>()
      map.set(1, 42)
      expect(map.get(1)).toBe(42)
    })

    it('handles object values', () => {
      const map = new CompressedMap<{ name: string }>()
      const obj = { name: 'test' }
      map.set(1, obj)
      expect(map.get(1)).toBe(obj)
    })

    it('handles null values', () => {
      const map = new CompressedMap<string | null>()
      map.set(1, null)
      expect(map.get(1)).toBeNull()
    })

    it('handles undefined values', () => {
      const map = new CompressedMap<string | undefined>()
      map.set(1, undefined)
      expect(map.get(1)).toBeUndefined()
    })

    it('handles boolean values', () => {
      const map = new CompressedMap<boolean>()
      map.set(1, true)
      map.set(2, false)
      expect(map.get(1)).toBe(true)
      expect(map.get(2)).toBe(false)
    })

    it('inserts at beginning of sorted keys', () => {
      const map = new CompressedMap<string>()
      map.set(5, 'five')
      map.set(10, 'ten')
      map.set(1, 'one')
      expect(map.keys()).toEqual([1, 5, 10])
    })

    it('inserts at end of sorted keys', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'one')
      map.set(5, 'five')
      map.set(10, 'ten')
      expect(map.keys()).toEqual([1, 5, 10])
    })

    it('inserts in the middle of sorted keys', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'one')
      map.set(10, 'ten')
      map.set(5, 'five')
      expect(map.keys()).toEqual([1, 5, 10])
      expect(map.values()).toEqual(['one', 'five', 'ten'])
    })
  })

  // ─── get ──────────────────────────────────────────────────────────────

  describe('get', () => {
    it('returns the value for an existing key', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'one')
      expect(map.get(1)).toBe('one')
    })

    it('returns undefined for a non-existent key', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'one')
      expect(map.get(2)).toBeUndefined()
    })

    it('returns undefined on an empty map', () => {
      const map = new CompressedMap<string>()
      expect(map.get(0)).toBeUndefined()
      expect(map.get(1)).toBeUndefined()
    })

    it('returns correct values after multiple sets', () => {
      const map = new CompressedMap<number>()
      map.set(1, 10)
      map.set(2, 20)
      map.set(3, 30)
      expect(map.get(1)).toBe(10)
      expect(map.get(2)).toBe(20)
      expect(map.get(3)).toBe(30)
    })

    it('returns updated value after overwrite', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'old')
      map.set(1, 'new')
      expect(map.get(1)).toBe('new')
    })

    it('returns correct value for negative keys', () => {
      const map = new CompressedMap<string>()
      map.set(-5, 'neg')
      expect(map.get(-5)).toBe('neg')
      expect(map.get(5)).toBeUndefined()
    })
  })

  // ─── has ──────────────────────────────────────────────────────────────

  describe('has', () => {
    it('returns true for an existing key', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'one')
      expect(map.has(1)).toBe(true)
    })

    it('returns false for a non-existent key', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'one')
      expect(map.has(2)).toBe(false)
    })

    it('returns false on an empty map', () => {
      const map = new CompressedMap<string>()
      expect(map.has(0)).toBe(false)
    })

    it('returns true after overwrite', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'one')
      map.set(1, 'updated')
      expect(map.has(1)).toBe(true)
    })

    it('returns false after deletion', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'one')
      map.delete(1)
      expect(map.has(1)).toBe(false)
    })

    it('returns correct results for multiple keys', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'a')
      map.set(3, 'c')
      map.set(5, 'e')
      expect(map.has(1)).toBe(true)
      expect(map.has(2)).toBe(false)
      expect(map.has(3)).toBe(true)
      expect(map.has(4)).toBe(false)
      expect(map.has(5)).toBe(true)
    })
  })

  // ─── delete ───────────────────────────────────────────────────────────

  describe('delete', () => {
    it('removes an existing key and returns true', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'one')
      expect(map.delete(1)).toBe(true)
      expect(map.size).toBe(0)
    })

    it('returns false for a non-existent key', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'one')
      expect(map.delete(2)).toBe(false)
    })

    it('returns false on an empty map', () => {
      const map = new CompressedMap<string>()
      expect(map.delete(1)).toBe(false)
    })

    it('deletes from the beginning', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.delete(1)
      expect(map.keys()).toEqual([2, 3])
      expect(map.values()).toEqual(['two', 'three'])
    })

    it('deletes from the middle', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.delete(2)
      expect(map.keys()).toEqual([1, 3])
      expect(map.values()).toEqual(['one', 'three'])
    })

    it('deletes from the end', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.delete(3)
      expect(map.keys()).toEqual([1, 2])
      expect(map.values()).toEqual(['one', 'two'])
    })

    it('deletes all entries leaving an empty map', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.delete(1)
      map.delete(2)
      expect(map.size).toBe(0)
      expect(map.keys()).toEqual([])
    })

    it('deletes and re-adds the same key', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'first')
      map.delete(1)
      map.set(1, 'second')
      expect(map.get(1)).toBe('second')
      expect(map.size).toBe(1)
    })
  })

  // ─── size ─────────────────────────────────────────────────────────────

  describe('size', () => {
    it('returns 0 for a new empty map', () => {
      const map = new CompressedMap<string>()
      expect(map.size).toBe(0)
    })

    it('increments on set (new key)', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'one')
      expect(map.size).toBe(1)
      map.set(2, 'two')
      expect(map.size).toBe(2)
    })

    it('does not increment on set (existing key)', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'one')
      expect(map.size).toBe(1)
      map.set(1, 'updated')
      expect(map.size).toBe(1)
    })

    it('decrements on delete', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.delete(1)
      expect(map.size).toBe(1)
    })

    it('resets to 0 on clear', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.clear()
      expect(map.size).toBe(0)
    })
  })

  // ─── clear ────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('clears an empty map without error', () => {
      const map = new CompressedMap<string>()
      map.clear()
      expect(map.size).toBe(0)
    })

    it('clears a populated map', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.clear()
      expect(map.size).toBe(0)
      expect(map.keys()).toEqual([])
      expect(map.values()).toEqual([])
    })

    it('allows operations after clear', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'one')
      map.clear()
      map.set(2, 'two')
      expect(map.size).toBe(1)
      expect(map.get(2)).toBe('two')
    })
  })

  // ─── keys ─────────────────────────────────────────────────────────────

  describe('keys', () => {
    it('returns an empty array for an empty map', () => {
      const map = new CompressedMap<string>()
      expect(map.keys()).toEqual([])
    })

    it('returns all keys in sorted order', () => {
      const map = new CompressedMap<string>()
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.keys()).toEqual([1, 2, 3])
    })

    it('returns a copy (not a reference)', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'one')
      const k = map.keys()
      k.push(99)
      expect(map.keys()).toEqual([1])
    })
  })

  // ─── values ───────────────────────────────────────────────────────────

  describe('values', () => {
    it('returns an empty array for an empty map', () => {
      const map = new CompressedMap<string>()
      expect(map.values()).toEqual([])
    })

    it('returns values corresponding to sorted keys', () => {
      const map = new CompressedMap<string>()
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.values()).toEqual(['a', 'b', 'c'])
    })

    it('returns a copy (not a reference)', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'one')
      const v = map.values()
      v.push('extra')
      expect(map.values()).toEqual(['one'])
    })
  })

  // ─── entries ──────────────────────────────────────────────────────────

  describe('entries', () => {
    it('returns an empty array for an empty map', () => {
      const map = new CompressedMap<string>()
      expect(map.entries()).toEqual([])
    })

    it('returns [key, value] pairs in key order', () => {
      const map = new CompressedMap<string>()
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.entries()).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
    })

    it('returns updated pairs after overwrite', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'old')
      map.set(1, 'new')
      expect(map.entries()).toEqual([[1, 'new']])
    })

    it('returns updated pairs after deletion', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.delete(2)
      expect(map.entries()).toEqual([
        [1, 'a'],
        [3, 'c'],
      ])
    })
  })

  // ─── forEach ──────────────────────────────────────────────────────────

  describe('forEach', () => {
    it('iterates over all entries in key order', () => {
      const map = new CompressedMap<string>()
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      const results: Array<{ value: string; key: number }> = []
      map.forEach((value, key) => {
        results.push({ value, key })
      })
      expect(results).toEqual([
        { value: 'a', key: 1 },
        { value: 'b', key: 2 },
        { value: 'c', key: 3 },
      ])
    })

    it('does not call callback on empty map', () => {
      const map = new CompressedMap<string>()
      let callCount = 0
      map.forEach(() => {
        callCount++
      })
      expect(callCount).toBe(0)
    })

    it('iterates correctly after delete', () => {
      const map = new CompressedMap<number>()
      map.set(1, 10)
      map.set(2, 20)
      map.set(3, 30)
      map.delete(2)
      const keys: number[] = []
      map.forEach((_v, k) => keys.push(k))
      expect(keys).toEqual([1, 3])
    })
  })

  // ─── first ────────────────────────────────────────────────────────────

  describe('first', () => {
    it('returns undefined for an empty map', () => {
      const map = new CompressedMap<string>()
      expect(map.first()).toBeUndefined()
    })

    it('returns the entry with the smallest key', () => {
      const map = new CompressedMap<string>()
      map.set(5, 'five')
      map.set(1, 'one')
      map.set(10, 'ten')
      expect(map.first()).toEqual([1, 'one'])
    })

    it('returns the only entry in a single-entry map', () => {
      const map = new CompressedMap<string>()
      map.set(42, 'answer')
      expect(map.first()).toEqual([42, 'answer'])
    })

    it('updates after deletion of the first key', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.delete(1)
      expect(map.first()).toEqual([2, 'b'])
    })
  })

  // ─── last ─────────────────────────────────────────────────────────────

  describe('last', () => {
    it('returns undefined for an empty map', () => {
      const map = new CompressedMap<string>()
      expect(map.last()).toBeUndefined()
    })

    it('returns the entry with the largest key', () => {
      const map = new CompressedMap<string>()
      map.set(5, 'five')
      map.set(1, 'one')
      map.set(10, 'ten')
      expect(map.last()).toEqual([10, 'ten'])
    })

    it('returns the only entry in a single-entry map', () => {
      const map = new CompressedMap<string>()
      map.set(42, 'answer')
      expect(map.last()).toEqual([42, 'answer'])
    })

    it('updates after deletion of the last key', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.delete(2)
      expect(map.last()).toEqual([1, 'a'])
    })
  })

  // ─── lowerBound ───────────────────────────────────────────────────────

  describe('lowerBound', () => {
    it('returns undefined for an empty map', () => {
      const map = new CompressedMap<string>()
      expect(map.lowerBound(1)).toBeUndefined()
    })

    it('returns the first key >= target when exact match exists', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'a')
      map.set(3, 'c')
      map.set(5, 'e')
      expect(map.lowerBound(3)).toEqual([3, 'c'])
    })

    it('returns the next greater key when no exact match', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'a')
      map.set(5, 'e')
      map.set(10, 'j')
      expect(map.lowerBound(3)).toEqual([5, 'e'])
    })

    it('returns the first key when target is smaller than all', () => {
      const map = new CompressedMap<string>()
      map.set(5, 'e')
      map.set(10, 'j')
      expect(map.lowerBound(1)).toEqual([5, 'e'])
    })

    it('returns undefined when target is larger than all keys', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'a')
      map.set(5, 'e')
      expect(map.lowerBound(10)).toBeUndefined()
    })

    it('returns the first key when target equals the smallest key', () => {
      const map = new CompressedMap<string>()
      map.set(2, 'b')
      map.set(4, 'd')
      expect(map.lowerBound(2)).toEqual([2, 'b'])
    })

    it('returns the last key when target equals the largest key', () => {
      const map = new CompressedMap<string>()
      map.set(2, 'b')
      map.set(4, 'd')
      expect(map.lowerBound(4)).toEqual([4, 'd'])
    })
  })

  // ─── upperBound ───────────────────────────────────────────────────────

  describe('upperBound', () => {
    it('returns undefined for an empty map', () => {
      const map = new CompressedMap<string>()
      expect(map.upperBound(1)).toBeUndefined()
    })

    it('returns the first key strictly greater than target', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'a')
      map.set(3, 'c')
      map.set(5, 'e')
      expect(map.upperBound(3)).toEqual([5, 'e'])
    })

    it('returns the next key when no exact match', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'a')
      map.set(5, 'e')
      map.set(10, 'j')
      expect(map.upperBound(3)).toEqual([5, 'e'])
    })

    it('returns the first key when target is smaller than all', () => {
      const map = new CompressedMap<string>()
      map.set(5, 'e')
      map.set(10, 'j')
      expect(map.upperBound(1)).toEqual([5, 'e'])
    })

    it('returns undefined when target equals the largest key', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'a')
      map.set(5, 'e')
      expect(map.upperBound(5)).toBeUndefined()
    })

    it('returns undefined when target is larger than all keys', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'a')
      map.set(5, 'e')
      expect(map.upperBound(10)).toBeUndefined()
    })

    it('returns correct result with duplicate-like keys in sequence', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      expect(map.upperBound(1)).toEqual([2, 'b'])
      expect(map.upperBound(2)).toEqual([3, 'c'])
    })
  })

  // ─── compressStats ────────────────────────────────────────────────────

  describe('compressStats', () => {
    it('returns zero stats for an empty map', () => {
      const map = new CompressedMap<string>()
      const stats: CompressStats = map.compressStats()
      expect(stats.keyBytes).toBe(0)
      expect(stats.valueBytes).toBe(0)
      expect(stats.totalBytes).toBe(0)
    })

    it('returns correct keyBytes for a single entry', () => {
      const map = new CompressedMap<string>()
      map.set(0, 'hello')
      const stats = map.compressStats()
      // zigzagEncode(0) = 0, vlqSize(0) = 1
      expect(stats.keyBytes).toBe(1)
    })

    it('returns correct keyBytes for sequential keys', () => {
      const map = new CompressedMap<string>()
      map.set(0, 'a')
      map.set(1, 'b')
      map.set(2, 'c')
      const stats = map.compressStats()
      // key 0: vlqSize(0) = 1
      // delta 1-0=1: zigzagEncode(1)=2, vlqSize(2)=1
      // delta 2-1=1: zigzagEncode(1)=2, vlqSize(2)=1
      expect(stats.keyBytes).toBe(3)
    })

    it('returns correct valueBytes for string values', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'ab') // 2 chars * 2 bytes = 4
      const stats = map.compressStats()
      expect(stats.valueBytes).toBe(4)
    })

    it('returns correct valueBytes for number values', () => {
      const map = new CompressedMap<number>()
      map.set(1, 42)
      const stats = map.compressStats()
      expect(stats.valueBytes).toBe(8)
    })

    it('returns correct valueBytes for boolean values', () => {
      const map = new CompressedMap<boolean>()
      map.set(1, true)
      map.set(2, false)
      const stats = map.compressStats()
      expect(stats.valueBytes).toBe(8) // 4 + 4
    })

    it('returns correct valueBytes for null values', () => {
      const map = new CompressedMap<string | null>()
      map.set(1, null)
      const stats = map.compressStats()
      expect(stats.valueBytes).toBe(8)
    })

    it('returns correct valueBytes for undefined values', () => {
      const map = new CompressedMap<string | undefined>()
      map.set(1, undefined)
      const stats = map.compressStats()
      expect(stats.valueBytes).toBe(8)
    })

    it('returns correct valueBytes for object values', () => {
      const map = new CompressedMap<{ x: number }>()
      map.set(1, { x: 1 })
      const stats = map.compressStats()
      // JSON.stringify({x:1}) = '{"x":1}' = 7 bytes
      expect(stats.valueBytes).toBe(7)
    })

    it('computes totalBytes as keyBytes + valueBytes', () => {
      const map = new CompressedMap<number>()
      map.set(0, 42)
      const stats = map.compressStats()
      expect(stats.totalBytes).toBe(stats.keyBytes + stats.valueBytes)
    })

    it('handles large key gaps with delta encoding', () => {
      const map = new CompressedMap<string>()
      map.set(0, 'a')
      map.set(1000, 'b')
      const stats = map.compressStats()
      // key 0: vlqSize(0) = 1
      // delta 1000-0=1000: zigzagEncode(1000)=2000, vlqSize(2000) > 1
      expect(stats.keyBytes).toBeGreaterThan(2)
    })
  })

  // ─── Type Exports ─────────────────────────────────────────────────────

  describe('type exports', () => {
    it('CompressedMapOptions can be used as a typed object', () => {
      const opts: CompressedMapOptions = { initialCapacity: 50 }
      const map = new CompressedMap<string>(opts)
      expect(map.size).toBe(0)
    })

    it('CompressStats fields are accessible', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'x')
      const stats: CompressStats = map.compressStats()
      expect(typeof stats.keyBytes).toBe('number')
      expect(typeof stats.valueBytes).toBe('number')
      expect(typeof stats.totalBytes).toBe('number')
    })
  })

  // ─── Edge Cases ───────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles many insertions', () => {
      const map = new CompressedMap<number>()
      for (let i = 0; i < 500; i++) {
        map.set(i, i * 10)
      }
      expect(map.size).toBe(500)
      expect(map.get(0)).toBe(0)
      expect(map.get(499)).toBe(4990)
    })

    it('handles reverse-order insertions', () => {
      const map = new CompressedMap<string>()
      for (let i = 100; i >= 0; i--) {
        map.set(i, `v${i}`)
      }
      expect(map.size).toBe(101)
      expect(map.first()?.[0]).toBe(0)
      expect(map.last()?.[0]).toBe(100)
    })

    it('handles alternating insert and delete', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.delete(1)
      map.set(3, 'c')
      map.delete(2)
      map.set(4, 'd')
      expect(map.size).toBe(2)
      expect(map.keys()).toEqual([3, 4])
    })

    it('handles set-delete-re_set cycle', () => {
      const map = new CompressedMap<string>()
      map.set(5, 'first')
      map.delete(5)
      map.set(5, 'second')
      expect(map.size).toBe(1)
      expect(map.get(5)).toBe('second')
    })

    it('handles clear then repopulate', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.clear()
      expect(map.size).toBe(0)
      map.set(10, 'x')
      map.set(20, 'y')
      expect(map.size).toBe(2)
      expect(map.get(10)).toBe('x')
    })

    it('lowerBound and upperBound with single entry', () => {
      const map = new CompressedMap<string>()
      map.set(5, 'five')
      expect(map.lowerBound(5)).toEqual([5, 'five'])
      expect(map.lowerBound(4)).toEqual([5, 'five'])
      expect(map.lowerBound(6)).toBeUndefined()
      expect(map.upperBound(5)).toBeUndefined()
      expect(map.upperBound(4)).toEqual([5, 'five'])
    })

    it('forEach on single-entry map', () => {
      const map = new CompressedMap<string>()
      map.set(1, 'one')
      const results: string[] = []
      map.forEach((v) => results.push(v))
      expect(results).toEqual(['one'])
    })

    it('handles many deletions down to empty', () => {
      const map = new CompressedMap<number>()
      for (let i = 0; i < 20; i++) {
        map.set(i, i)
      }
      for (let i = 0; i < 20; i++) {
        map.delete(i)
      }
      expect(map.size).toBe(0)
      expect(map.keys()).toEqual([])
      expect(map.values()).toEqual([])
      expect(map.first()).toBeUndefined()
      expect(map.last()).toBeUndefined()
    })

    it('compressStats on map with mixed value types', () => {
      const map = new CompressedMap<string | number | boolean | null>()
      map.set(1, 'hello')
      map.set(2, 42)
      map.set(3, true)
      map.set(4, null)
      const stats = map.compressStats()
      expect(stats.totalBytes).toBeGreaterThan(0)
      expect(stats.totalBytes).toBe(stats.keyBytes + stats.valueBytes)
    })

    it('entries returns correct pairs after complex operations', () => {
      const map = new CompressedMap<string>()
      map.set(5, 'e')
      map.set(1, 'a')
      map.set(3, 'c')
      map.delete(3)
      map.set(2, 'b')
      map.set(4, 'd')
      expect(map.entries()).toEqual([
        [1, 'a'],
        [2, 'b'],
        [4, 'd'],
        [5, 'e'],
      ])
    })

    it('handles keys with large gaps', () => {
      const map = new CompressedMap<string>()
      map.set(0, 'zero')
      map.set(1000000, 'million')
      map.set(1000000000, 'billion')
      expect(map.size).toBe(3)
      expect(map.get(0)).toBe('zero')
      expect(map.get(1000000)).toBe('million')
      expect(map.get(1000000000)).toBe('billion')
      expect(map.get(500)).toBeUndefined()
    })

    it('handles negative keys with positive keys mixed', () => {
      const map = new CompressedMap<string>()
      map.set(-10, 'neg10')
      map.set(0, 'zero')
      map.set(10, 'pos10')
      expect(map.keys()).toEqual([-10, 0, 10])
      expect(map.lowerBound(-5)).toEqual([0, 'zero'])
      expect(map.upperBound(-10)).toEqual([0, 'zero'])
    })

    it('size remains consistent after many overwrites', () => {
      const map = new CompressedMap<number>()
      for (let i = 0; i < 10; i++) {
        map.set(i, i)
      }
      expect(map.size).toBe(10)
      for (let i = 0; i < 10; i++) {
        map.set(i, i * 100)
      }
      expect(map.size).toBe(10)
      for (let i = 0; i < 10; i++) {
        expect(map.get(i)).toBe(i * 100)
      }
    })
  })
})
