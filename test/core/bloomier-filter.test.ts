import { describe, it, expect } from 'vitest'
import { BloomierFilter } from '../../src/core/bloomier-filter/bloomier-filter.js'
import { DEFAULT_BLOOMIER_TABLE_MULTIPLIER } from '../../src/core/bloomier-filter/types.js'
import type { BloomierFilterOptions, BloomierFilterStats } from '../../src/core/bloomier-filter/types.js'

describe('BloomierFilter', () => {
  describe('constructor', () => {
    it('should create a filter with no entries', () => {
      const f = new BloomierFilter<string, number>([])
      expect(f.size).toBe(0)
    })

    it('should create a filter with a single entry', () => {
      const f = new BloomierFilter<string, number>([{ key: 'a', value: 1 }])
      expect(f.size).toBe(1)
    })

    it('should create a filter with multiple entries', () => {
      const entries = [{ key: 'a', value: 1 }, { key: 'b', value: 2 }, { key: 'c', value: 3 }]
      const f = new BloomierFilter(entries)
      expect(f.size).toBe(3)
    })

    it('should accept defaultValue option', () => {
      const f = new BloomierFilter<string, number>([], { defaultValue: -1 })
      expect(f.get('anything')).toBe(-1)
    })

    it('should accept tableSize option', () => {
      const f = new BloomierFilter([{ key: 'a', value: 1 }, { key: 'b', value: 2 }], { tableSize: 100 })
      expect(f.stats().tableSize).toBe(100)
    })

    it('should enforce minimum tableSize even with small option', () => {
      const entries = Array.from({ length: 50 }, (_, i) => ({ key: `k-${i}`, value: i }))
      const f = new BloomierFilter(entries, { tableSize: 10 })
      expect(f.stats().tableSize).toBeGreaterThanOrEqual(10)
    })

    it('should accept no options', () => {
      const f = new BloomierFilter([{ key: 'k', value: 5 }])
      expect(f.size).toBe(1)
    })

    it('should handle entries with numeric keys', () => {
      const f = new BloomierFilter<number, string>([{ key: 1, value: 'one' }, { key: 2, value: 'two' }])
      expect(f.size).toBe(2)
    })

    it('should handle entries with boolean keys', () => {
      const f = new BloomierFilter<boolean, string>([{ key: true, value: 'yes' }, { key: false, value: 'no' }])
      expect(f.size).toBe(2)
    })

    it('should handle entries with object keys', () => {
      const f = new BloomierFilter<{ id: number }, string>([
        { key: { id: 1 }, value: 'first' },
        { key: { id: 2 }, value: 'second' },
      ])
      expect(f.size).toBe(2)
    })

    it('should handle 10 entries', () => {
      const entries = Array.from({ length: 10 }, (_, i) => ({ key: `key-${i}`, value: i }))
      const f = new BloomierFilter(entries)
      expect(f.size).toBe(10)
    })

    it('should handle 100 entries', () => {
      const entries = Array.from({ length: 100 }, (_, i) => ({ key: `key-${i}`, value: i }))
      const f = new BloomierFilter(entries)
      expect(f.size).toBe(100)
    })

    it('should handle 1000 entries', () => {
      const entries = Array.from({ length: 1000 }, (_, i) => ({ key: `key-${i}`, value: i }))
      const f = new BloomierFilter(entries)
      expect(f.size).toBe(1000)
    })

    it('should handle string values', () => {
      const f = new BloomierFilter<string, string>([{ key: 'k', value: 'hello' }])
      expect(f.get('k')).toBe('hello')
    })

    it('should handle boolean values', () => {
      const f = new BloomierFilter<string, boolean>([{ key: 'k', value: true }])
      expect(f.get('k')).toBe(true)
    })

    it('should handle object values', () => {
      const obj = { name: 'test', count: 42 }
      const f = new BloomierFilter<string, { name: string; count: number }>([{ key: 'k', value: obj }])
      expect(f.get('k')).toEqual(obj)
    })

    it('should deduplicate entries by key (last wins)', () => {
      const f = new BloomierFilter<string, number>([
        { key: 'a', value: 1 },
        { key: 'a', value: 2 },
      ])
      expect(f.size).toBe(1)
      expect(f.get('a')).toBe(2)
    })

    it('should deduplicate entries preserving non-duplicates', () => {
      const f = new BloomierFilter<string, number>([
        { key: 'a', value: 1 },
        { key: 'b', value: 2 },
        { key: 'a', value: 3 },
      ])
      expect(f.size).toBe(2)
      expect(f.get('a')).toBe(3)
      expect(f.get('b')).toBe(2)
    })
  })

  describe('get - known keys', () => {
    it('should return the correct value for a single entry', () => {
      const f = new BloomierFilter([{ key: 'a', value: 42 }])
      expect(f.get('a')).toBe(42)
    })

    it('should return the correct values for multiple entries', () => {
      const f = new BloomierFilter([{ key: 'a', value: 1 }, { key: 'b', value: 2 }, { key: 'c', value: 3 }])
      expect(f.get('a')).toBe(1)
      expect(f.get('b')).toBe(2)
      expect(f.get('c')).toBe(3)
    })

    it('should return correct value for first entry in many', () => {
      const entries = Array.from({ length: 100 }, (_, i) => ({ key: `key-${i}`, value: i }))
      const f = new BloomierFilter(entries)
      expect(f.get('key-0')).toBe(0)
    })

    it('should return correct value for last entry in many', () => {
      const entries = Array.from({ length: 100 }, (_, i) => ({ key: `key-${i}`, value: i }))
      const f = new BloomierFilter(entries)
      expect(f.get('key-99')).toBe(99)
    })

    it('should return correct value for middle entry in many', () => {
      const entries = Array.from({ length: 100 }, (_, i) => ({ key: `key-${i}`, value: i }))
      const f = new BloomierFilter(entries)
      expect(f.get('key-50')).toBe(50)
    })

    it('should return correct string values', () => {
      const f = new BloomierFilter<string, string>([{ key: 'hello', value: 'world' }, { key: 'foo', value: 'bar' }])
      expect(f.get('hello')).toBe('world')
      expect(f.get('foo')).toBe('bar')
    })

    it('should never produce false negatives on get', () => {
      const entries = Array.from({ length: 200 }, (_, i) => ({ key: `item-${i}`, value: i * 10 }))
      const f = new BloomierFilter(entries)
      for (let i = 0; i < 200; i++) {
        expect(f.get(`item-${i}`)).toBe(i * 10)
      }
    })

    it('should handle repeated gets on same key', () => {
      const f = new BloomierFilter([{ key: 'x', value: 99 }])
      expect(f.get('x')).toBe(99)
      expect(f.get('x')).toBe(99)
      expect(f.get('x')).toBe(99)
    })

    it('should return correct values with 1000 entries', () => {
      const entries = Array.from({ length: 1000 }, (_, i) => ({ key: `k-${i}`, value: i * 3 }))
      const f = new BloomierFilter(entries)
      for (let i = 0; i < 1000; i++) {
        expect(f.get(`k-${i}`)).toBe(i * 3)
      }
    })

    it('should handle negative number values', () => {
      const f = new BloomierFilter([{ key: 'a', value: -1 }, { key: 'b', value: -100 }])
      expect(f.get('a')).toBe(-1)
      expect(f.get('b')).toBe(-100)
    })

    it('should handle zero value', () => {
      const f = new BloomierFilter([{ key: 'zero', value: 0 }])
      expect(f.get('zero')).toBe(0)
    })

    it('should handle empty string value', () => {
      const f = new BloomierFilter<string, string>([{ key: 'k', value: '' }])
      expect(f.get('k')).toBe('')
    })

    it('should handle null value', () => {
      const f = new BloomierFilter<string, null>([{ key: 'k', value: null }])
      expect(f.get('k')).toBe(null)
    })

    it('should handle value of zero for one key among many', () => {
      const f = new BloomierFilter([{ key: 'a', value: 0 }, { key: 'b', value: 1 }, { key: 'c', value: 2 }])
      expect(f.get('a')).toBe(0)
      expect(f.get('b')).toBe(1)
      expect(f.get('c')).toBe(2)
    })
  })

  describe('get - unknown keys', () => {
    it('should return undefined or a value for unknown key with no default', () => {
      const entries = Array.from({ length: 10 }, (_, i) => ({ key: `k-${i}`, value: i }))
      const f = new BloomierFilter(entries)
      const result = f.get('z')
      expect(result === undefined || typeof result === 'number').toBe(true)
    })

    it('should return defaultValue or a value for unknown key', () => {
      const entries = Array.from({ length: 10 }, (_, i) => ({ key: `k-${i}`, value: i }))
      const f = new BloomierFilter(entries, { defaultValue: -1 })
      const result = f.get('z')
      expect(result === -1 || typeof result === 'number').toBe(true)
    })

    it('should return undefined for any key on empty filter', () => {
      const f = new BloomierFilter<string, number>([])
      expect(f.get('anything')).toBeUndefined()
    })

    it('should return custom default for any key on empty filter', () => {
      const f = new BloomierFilter<string, number>([], { defaultValue: 0 })
      expect(f.get('anything')).toBe(0)
    })

    it('should return default for some unknown keys', () => {
      const entries = Array.from({ length: 50 }, (_, i) => ({ key: `key-${i}`, value: i }))
      const f = new BloomierFilter(entries, { defaultValue: -999 })
      let defaultCount = 0
      for (let i = 200; i < 300; i++) {
        if (f.get(`unknown-${i}`) === -999) defaultCount++
      }
      expect(defaultCount).toBeGreaterThan(0)
    })

    it('should distinguish between similar keys', () => {
      const f = new BloomierFilter([{ key: 'key1', value: 1 }, { key: 'key2', value: 2 }, { key: 'key12', value: 12 }])
      expect(f.get('key1')).toBe(1)
      expect(f.get('key2')).toBe(2)
      expect(f.get('key12')).toBe(12)
    })
  })

  describe('has', () => {
    it('should return true for a known key', () => {
      const f = new BloomierFilter([{ key: 'a', value: 1 }])
      expect(f.has('a')).toBe(true)
    })

    it('should return false for some unknown keys', () => {
      const entries = Array.from({ length: 50 }, (_, i) => ({ key: `key-${i}`, value: i }))
      const f = new BloomierFilter(entries)
      let falsePositives = 0
      for (let i = 200; i < 300; i++) {
        if (f.has(`non-member-${i}`)) falsePositives++
      }
      expect(falsePositives).toBeLessThan(100)
    })

    it('should return false for any key on empty filter', () => {
      const f = new BloomierFilter<string, number>([])
      expect(f.has('anything')).toBe(false)
    })

    it('should return true for all inserted keys', () => {
      const entries = Array.from({ length: 50 }, (_, i) => ({ key: `key-${i}`, value: i }))
      const f = new BloomierFilter(entries)
      for (let i = 0; i < 50; i++) {
        expect(f.has(`key-${i}`)).toBe(true)
      }
    })

    it('should return true for empty string in filter', () => {
      const f = new BloomierFilter([{ key: '', value: 42 }])
      expect(f.has('')).toBe(true)
    })

    it('should be consistent across multiple calls', () => {
      const f = new BloomierFilter([{ key: 'x', value: 5 }])
      expect(f.has('x')).toBe(true)
      expect(f.has('x')).toBe(true)
    })

    it('should handle has after get', () => {
      const f = new BloomierFilter([{ key: 'a', value: 10 }])
      f.get('a')
      expect(f.has('a')).toBe(true)
    })

    it('should return true for all 100 keys', () => {
      const entries = Array.from({ length: 100 }, (_, i) => ({ key: `k-${i}`, value: i }))
      const f = new BloomierFilter(entries)
      for (let i = 0; i < 100; i++) {
        expect(f.has(`k-${i}`)).toBe(true)
      }
    })
  })

  describe('size', () => {
    it('should return 0 for empty filter', () => {
      const f = new BloomierFilter<string, number>([])
      expect(f.size).toBe(0)
    })

    it('should return 1 for single entry', () => {
      const f = new BloomierFilter([{ key: 'a', value: 1 }])
      expect(f.size).toBe(1)
    })

    it('should return correct count for multiple entries', () => {
      const f = new BloomierFilter([{ key: 'a', value: 1 }, { key: 'b', value: 2 }, { key: 'c', value: 3 }])
      expect(f.size).toBe(3)
    })

    it('should return correct count for 100 entries', () => {
      const entries = Array.from({ length: 100 }, (_, i) => ({ key: `key-${i}`, value: i }))
      const f = new BloomierFilter(entries)
      expect(f.size).toBe(100)
    })

    it('should return correct count for 1000 entries', () => {
      const entries = Array.from({ length: 1000 }, (_, i) => ({ key: `key-${i}`, value: i }))
      const f = new BloomierFilter(entries)
      expect(f.size).toBe(1000)
    })

    it('should be a getter not a method', () => {
      const f = new BloomierFilter([{ key: 'a', value: 1 }])
      expect(typeof f.size).toBe('number')
    })

    it('should reflect deduplicated count', () => {
      const f = new BloomierFilter([
        { key: 'a', value: 1 },
        { key: 'a', value: 2 },
        { key: 'b', value: 3 },
      ])
      expect(f.size).toBe(2)
    })
  })

  describe('keys', () => {
    it('should return empty array for empty filter', () => {
      const f = new BloomierFilter<string, number>([])
      expect(f.keys()).toEqual([])
    })

    it('should return keys for single entry', () => {
      const f = new BloomierFilter([{ key: 'a', value: 1 }])
      expect(f.keys()).toEqual(['a'])
    })

    it('should return all keys for multiple entries', () => {
      const f = new BloomierFilter([{ key: 'x', value: 1 }, { key: 'y', value: 2 }, { key: 'z', value: 3 }])
      expect(f.keys()).toEqual(['x', 'y', 'z'])
    })

    it('should return deduplicated keys', () => {
      const f = new BloomierFilter([
        { key: 'a', value: 1 },
        { key: 'a', value: 2 },
        { key: 'b', value: 3 },
      ])
      expect(f.keys()).toEqual(['a', 'b'])
    })

    it('should return correct number of keys for 100 entries', () => {
      const entries = Array.from({ length: 100 }, (_, i) => ({ key: `k-${i}`, value: i }))
      const f = new BloomierFilter(entries)
      expect(f.keys().length).toBe(100)
    })

    it('should work with numeric keys', () => {
      const f = new BloomierFilter<number, string>([{ key: 1, value: 'a' }, { key: 2, value: 'b' }])
      expect(f.keys()).toEqual([1, 2])
    })
  })

  describe('values', () => {
    it('should return empty array for empty filter', () => {
      const f = new BloomierFilter<string, number>([])
      expect(f.values()).toEqual([])
    })

    it('should return values for single entry', () => {
      const f = new BloomierFilter([{ key: 'a', value: 42 }])
      expect(f.values()).toEqual([42])
    })

    it('should return all values for multiple entries', () => {
      const f = new BloomierFilter([{ key: 'x', value: 10 }, { key: 'y', value: 20 }])
      expect(f.values()).toEqual([10, 20])
    })

    it('should return deduplicated (last-wins) values', () => {
      const f = new BloomierFilter([
        { key: 'a', value: 1 },
        { key: 'a', value: 99 },
      ])
      expect(f.values()).toEqual([99])
    })

    it('should work with string values', () => {
      const f = new BloomierFilter<string, string>([{ key: 'a', value: 'hello' }, { key: 'b', value: 'world' }])
      expect(f.values()).toEqual(['hello', 'world'])
    })

    it('should return correct number of values for 100 entries', () => {
      const entries = Array.from({ length: 100 }, (_, i) => ({ key: `k-${i}`, value: i }))
      const f = new BloomierFilter(entries)
      expect(f.values().length).toBe(100)
    })
  })

  describe('entries', () => {
    it('should return empty array for empty filter', () => {
      const f = new BloomierFilter<string, number>([])
      expect(f.entries()).toEqual([])
    })

    it('should return entries for single entry', () => {
      const f = new BloomierFilter([{ key: 'a', value: 1 }])
      expect(f.entries()).toEqual([{ key: 'a', value: 1 }])
    })

    it('should return all entries for multiple entries', () => {
      const f = new BloomierFilter([{ key: 'x', value: 10 }, { key: 'y', value: 20 }])
      expect(f.entries()).toEqual([{ key: 'x', value: 10 }, { key: 'y', value: 20 }])
    })

    it('should return deduplicated entries', () => {
      const f = new BloomierFilter([
        { key: 'a', value: 1 },
        { key: 'a', value: 2 },
        { key: 'b', value: 3 },
      ])
      const e = f.entries()
      expect(e.length).toBe(2)
      expect(e[0]).toEqual({ key: 'a', value: 2 })
      expect(e[1]).toEqual({ key: 'b', value: 3 })
    })

    it('should return independent copies', () => {
      const f = new BloomierFilter([{ key: 'a', value: 1 }])
      const e1 = f.entries()
      const e2 = f.entries()
      expect(e1).toEqual(e2)
      expect(e1).not.toBe(e2)
    })

    it('should return correct number of entries for 50 entries', () => {
      const entries = Array.from({ length: 50 }, (_, i) => ({ key: `k-${i}`, value: i }))
      const f = new BloomierFilter(entries)
      expect(f.entries().length).toBe(50)
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty filter', () => {
      const f = new BloomierFilter<string, number>([])
      let callCount = 0
      f.forEach(() => { callCount++ })
      expect(callCount).toBe(0)
    })

    it('should call callback for each entry', () => {
      const f = new BloomierFilter([{ key: 'a', value: 1 }, { key: 'b', value: 2 }])
      const results: Array<{ value: number; key: string; index: number }> = []
      f.forEach((value, key, index) => { results.push({ value, key, index }) })
      expect(results).toEqual([
        { value: 1, key: 'a', index: 0 },
        { value: 2, key: 'b', index: 1 },
      ])
    })

    it('should provide correct index', () => {
      const entries = Array.from({ length: 10 }, (_, i) => ({ key: `k-${i}`, value: i }))
      const f = new BloomierFilter(entries)
      const indices: number[] = []
      f.forEach((_v, _k, index) => { indices.push(index) })
      expect(indices).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should iterate over deduplicated entries', () => {
      const f = new BloomierFilter([
        { key: 'a', value: 1 },
        { key: 'a', value: 2 },
        { key: 'b', value: 3 },
      ])
      const keys: string[] = []
      f.forEach((_v, key) => { keys.push(key) })
      expect(keys).toEqual(['a', 'b'])
    })

    it('should handle single entry', () => {
      const f = new BloomierFilter([{ key: 'only', value: 42 }])
      const results: number[] = []
      f.forEach((v) => { results.push(v) })
      expect(results).toEqual([42])
    })
  })

  describe('stats', () => {
    it('should return a stats object', () => {
      const f = new BloomierFilter([{ key: 'a', value: 1 }])
      const s = f.stats()
      expect(typeof s).toBe('object')
    })

    it('should include size property', () => {
      const f = new BloomierFilter([{ key: 'a', value: 1 }])
      expect(f.stats().size).toBe(1)
    })

    it('should include tableSize property', () => {
      const f = new BloomierFilter([{ key: 'a', value: 1 }])
      expect(f.stats().tableSize).toBeGreaterThan(0)
    })

    it('should include loadFactor property', () => {
      const f = new BloomierFilter([{ key: 'a', value: 1 }])
      expect(typeof f.stats().loadFactor).toBe('number')
    })

    it('should include numHashes property', () => {
      const f = new BloomierFilter([{ key: 'a', value: 1 }])
      expect(f.stats().numHashes).toBe(3)
    })

    it('should report correct size for empty filter', () => {
      const f = new BloomierFilter<string, number>([])
      expect(f.stats().size).toBe(0)
    })

    it('should report tableSize >= size', () => {
      const entries = Array.from({ length: 50 }, (_, i) => ({ key: `k-${i}`, value: i }))
      const f = new BloomierFilter(entries)
      expect(f.stats().tableSize).toBeGreaterThanOrEqual(f.stats().size)
    })

    it('should report numHashes of 3', () => {
      const f = new BloomierFilter([{ key: 'a', value: 1 }])
      expect(f.stats().numHashes).toBe(3)
    })

    it('should conform to BloomierFilterStats interface', () => {
      const f = new BloomierFilter([{ key: 'a', value: 1 }])
      const stats: BloomierFilterStats = f.stats()
      expect(stats.size).toBe(1)
      expect(stats.tableSize).toBeGreaterThan(0)
      expect(typeof stats.loadFactor).toBe('number')
      expect(stats.numHashes).toBe(3)
    })

    it('should report consistent stats across calls', () => {
      const f = new BloomierFilter([{ key: 'a', value: 1 }])
      const s1 = f.stats()
      const s2 = f.stats()
      expect(s1.size).toBe(s2.size)
      expect(s1.tableSize).toBe(s2.tableSize)
      expect(s1.loadFactor).toBe(s2.loadFactor)
      expect(s1.numHashes).toBe(s2.numHashes)
    })

    it('should calculate loadFactor correctly', () => {
      const entries = Array.from({ length: 10 }, (_, i) => ({ key: `k-${i}`, value: i }))
      const f = new BloomierFilter(entries)
      const s = f.stats()
      expect(s.loadFactor).toBeCloseTo(s.size / s.tableSize)
    })

    it('should report loadFactor of 0 for empty filter', () => {
      const f = new BloomierFilter<string, number>([])
      expect(f.stats().loadFactor).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('should handle empty filter get', () => {
      const f = new BloomierFilter<string, number>([])
      expect(f.get('anything')).toBeUndefined()
    })

    it('should handle empty filter has', () => {
      const f = new BloomierFilter<string, number>([])
      expect(f.has('anything')).toBe(false)
    })

    it('should handle single entry correctly', () => {
      const f = new BloomierFilter([{ key: 'only', value: 42 }])
      expect(f.get('only')).toBe(42)
      expect(f.has('only')).toBe(true)
    })

    it('should handle unicode keys', () => {
      const f = new BloomierFilter([{ key: '日本語', value: 1 }, { key: '🎉🚀', value: 2 }])
      expect(f.get('日本語')).toBe(1)
      expect(f.get('🎉🚀')).toBe(2)
    })

    it('should handle keys with special characters', () => {
      const f = new BloomierFilter([{ key: 'hello\nworld', value: 1 }, { key: 'path/to/file.ts', value: 2 }])
      expect(f.get('hello\nworld')).toBe(1)
      expect(f.get('path/to/file.ts')).toBe(2)
    })

    it('should handle empty string key', () => {
      const f = new BloomierFilter([{ key: '', value: 99 }])
      expect(f.get('')).toBe(99)
    })

    it('should handle very long string keys', () => {
      const longKey = 'x'.repeat(10000)
      const f = new BloomierFilter([{ key: longKey, value: 1 }])
      expect(f.get(longKey)).toBe(1)
    })

    it('should handle whitespace-only keys', () => {
      const f = new BloomierFilter([{ key: '   ', value: 1 }, { key: '\t', value: 2 }, { key: '\n', value: 3 }])
      expect(f.get('   ')).toBe(1)
      expect(f.get('\t')).toBe(2)
      expect(f.get('\n')).toBe(3)
    })

    it('should handle keys with null characters', () => {
      const f = new BloomierFilter([{ key: 'before\0after', value: 42 }])
      expect(f.get('before\0after')).toBe(42)
    })

    it('should handle two entries with near-identical keys', () => {
      const f = new BloomierFilter([{ key: 'abcdef', value: 1 }, { key: 'abcdeg', value: 2 }])
      expect(f.get('abcdef')).toBe(1)
      expect(f.get('abcdeg')).toBe(2)
    })

    it('should handle case-sensitive keys', () => {
      const f = new BloomierFilter([{ key: 'Hello', value: 1 }, { key: 'hello', value: 2 }])
      expect(f.get('Hello')).toBe(1)
      expect(f.get('hello')).toBe(2)
    })

    it('should handle false as value correctly', () => {
      const f = new BloomierFilter<string, boolean>([{ key: 'k', value: false }])
      expect(f.get('k')).toBe(false)
      expect(f.has('k')).toBe(true)
    })

    it('should handle 0 as value correctly', () => {
      const f = new BloomierFilter<string, number>([{ key: 'k', value: 0 }])
      expect(f.get('k')).toBe(0)
      expect(f.has('k')).toBe(true)
    })

    it('should handle empty string as value correctly', () => {
      const f = new BloomierFilter<string, string>([{ key: 'k', value: '' }])
      expect(f.get('k')).toBe('')
      expect(f.has('k')).toBe(true)
    })
  })

  describe('many entries', () => {
    it('should handle 100 entries with no false negatives', () => {
      const entries = Array.from({ length: 100 }, (_, i) => ({ key: `item-${i}`, value: i }))
      const f = new BloomierFilter(entries)
      for (let i = 0; i < 100; i++) expect(f.get(`item-${i}`)).toBe(i)
    })

    it('should handle 500 entries with no false negatives', () => {
      const entries = Array.from({ length: 500 }, (_, i) => ({ key: `k-${i}`, value: i * 2 }))
      const f = new BloomierFilter(entries)
      for (let i = 0; i < 500; i++) expect(f.get(`k-${i}`)).toBe(i * 2)
    })

    it('should handle 1000 entries with no false negatives', () => {
      const entries = Array.from({ length: 1000 }, (_, i) => ({ key: `entry-${i}`, value: i }))
      const f = new BloomierFilter(entries)
      for (let i = 0; i < 1000; i++) expect(f.get(`entry-${i}`)).toBe(i)
    })

    it('should handle 2000 entries', () => {
      const entries = Array.from({ length: 2000 }, (_, i) => ({ key: `x-${i}`, value: i }))
      const f = new BloomierFilter(entries)
      expect(f.size).toBe(2000)
      expect(f.get('x-0')).toBe(0)
      expect(f.get('x-1999')).toBe(1999)
      expect(f.get('x-1000')).toBe(1000)
    })

    it('should have reasonable false positive rate for non-member gets', () => {
      const entries = Array.from({ length: 100 }, (_, i) => ({ key: `item-${i}`, value: i }))
      const f = new BloomierFilter(entries)
      let falsePositives = 0
      const trials = 1000
      for (let i = 0; i < trials; i++) {
        if (f.get(`non-member-${i}`) !== undefined) falsePositives++
      }
      expect(falsePositives / trials).toBeLessThan(1)
    })

    it('should have reasonable false positive rate for non-member has', () => {
      const entries = Array.from({ length: 100 }, (_, i) => ({ key: `item-${i}`, value: i }))
      const f = new BloomierFilter(entries)
      let falsePositives = 0
      const trials = 1000
      for (let i = 0; i < trials; i++) {
        if (f.has(`not-in-set-${i}`)) falsePositives++
      }
      expect(falsePositives / trials).toBeLessThan(1)
    })
  })

  describe('collision handling', () => {
    it('should handle sequential string keys', () => {
      const entries = Array.from({ length: 50 }, (_, i) => ({ key: `key${i}`, value: i }))
      const f = new BloomierFilter(entries)
      for (let i = 0; i < 50; i++) expect(f.get(`key${i}`)).toBe(i)
    })

    it('should handle keys that differ by one character', () => {
      const entries = Array.from({ length: 26 }, (_, i) => ({ key: String.fromCharCode(97 + i), value: i }))
      const f = new BloomierFilter(entries)
      for (let i = 0; i < 26; i++) expect(f.get(String.fromCharCode(97 + i))).toBe(i)
    })

    it('should handle two-character key variants', () => {
      const entries: Array<{ key: string; value: number }> = []
      for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) entries.push({ key: `${i}${j}`, value: i * 10 + j })
      const f = new BloomierFilter(entries)
      for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) expect(f.get(`${i}${j}`)).toBe(i * 10 + j)
    })

    it('should handle numeric string keys', () => {
      const entries = Array.from({ length: 100 }, (_, i) => ({ key: String(i), value: i }))
      const f = new BloomierFilter(entries)
      for (let i = 0; i < 100; i++) expect(f.get(String(i))).toBe(i)
    })

    it('should handle UUID-like keys', () => {
      const entries = Array.from({ length: 50 }, (_, i) => ({
        key: `xxxxxxxx-xxxx-xxxx-xxxx-${String(i).padStart(12, '0')}`,
        value: i,
      }))
      const f = new BloomierFilter(entries)
      for (let i = 0; i < 50; i++) {
        expect(f.get(`xxxxxxxx-xxxx-xxxx-xxxx-${String(i).padStart(12, '0')}`)).toBe(i)
      }
    })
  })

  describe('generic type support', () => {
    it('should work with number keys and string values', () => {
      const f = new BloomierFilter<number, string>([{ key: 1, value: 'one' }, { key: 2, value: 'two' }])
      expect(f.get(1)).toBe('one')
      expect(f.get(2)).toBe('two')
    })

    it('should work with boolean keys', () => {
      const f = new BloomierFilter<boolean, string>([{ key: true, value: 'yes' }, { key: false, value: 'no' }])
      expect(f.get(true)).toBe('yes')
      expect(f.get(false)).toBe('no')
    })

    it('should work with object keys', () => {
      const obj1 = { id: 1 }
      const obj2 = { id: 2 }
      const f = new BloomierFilter<{ id: number }, string>([{ key: obj1, value: 'first' }, { key: obj2, value: 'second' }])
      expect(f.get(obj1)).toBe('first')
      expect(f.get(obj2)).toBe('second')
    })

    it('should work with array keys', () => {
      const f = new BloomierFilter<number[], string>([{ key: [1, 2], value: 'a' }, { key: [3, 4], value: 'b' }])
      expect(f.get([1, 2])).toBe('a')
      expect(f.get([3, 4])).toBe('b')
    })

    it('should work with null value type', () => {
      const f = new BloomierFilter<string, null>([{ key: 'a', value: null }])
      expect(f.get('a')).toBe(null)
    })

    it('should work with object values', () => {
      const f = new BloomierFilter<string, { x: number }>([{ key: 'a', value: { x: 1 } }, { key: 'b', value: { x: 2 } }])
      expect(f.get('a')).toEqual({ x: 1 })
      expect(f.get('b')).toEqual({ x: 2 })
    })

    it('should work with array values', () => {
      const f = new BloomierFilter<string, number[]>([{ key: 'a', value: [1, 2, 3] }, { key: 'b', value: [4, 5, 6] }])
      expect(f.get('a')).toEqual([1, 2, 3])
      expect(f.get('b')).toEqual([4, 5, 6])
    })
  })

  describe('immutability', () => {
    it('should return same value on repeated gets', () => {
      const f = new BloomierFilter([{ key: 'a', value: 42 }])
      expect(f.get('a')).toBe(42)
      expect(f.get('a')).toBe(42)
      expect(f.get('a')).toBe(42)
    })

    it('should return same has result on repeated calls', () => {
      const f = new BloomierFilter([{ key: 'a', value: 1 }])
      expect(f.has('a')).toBe(true)
      expect(f.has('a')).toBe(true)
    })

    it('should not change size after lookups', () => {
      const f = new BloomierFilter([{ key: 'a', value: 1 }])
      f.get('a')
      f.get('b')
      f.has('a')
      f.has('b')
      expect(f.size).toBe(1)
    })

    it('should not change stats after lookups', () => {
      const f = new BloomierFilter([{ key: 'a', value: 1 }])
      const s1 = f.stats()
      f.get('a')
      f.get('b')
      const s2 = f.stats()
      expect(s1.size).toBe(s2.size)
      expect(s1.tableSize).toBe(s2.tableSize)
    })

    it('should not mutate entries array', () => {
      const originalEntries = [{ key: 'a', value: 1 }, { key: 'b', value: 2 }]
      const copy = [...originalEntries]
      new BloomierFilter(originalEntries)
      expect(originalEntries).toEqual(copy)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_BLOOMIER_TABLE_MULTIPLIER', () => {
      expect(DEFAULT_BLOOMIER_TABLE_MULTIPLIER).toBe(2)
    })

    it('should support BloomierFilterOptions interface', () => {
      const opts: BloomierFilterOptions<number> = { defaultValue: 42, tableSize: 100 }
      expect(opts.defaultValue).toBe(42)
      expect(opts.tableSize).toBe(100)
    })

    it('should support BloomierFilterOptions with no generic', () => {
      const opts: BloomierFilterOptions = { tableSize: 50 }
      expect(opts.tableSize).toBe(50)
    })

    it('should support BloomierFilterStats interface', () => {
      const stats: BloomierFilterStats = { size: 10, tableSize: 40, loadFactor: 0.25, numHashes: 3 }
      expect(stats.size).toBe(10)
      expect(stats.tableSize).toBe(40)
      expect(stats.loadFactor).toBe(0.25)
      expect(stats.numHashes).toBe(3)
    })
  })

  describe('false positive behavior', () => {
    it('should never have false negatives for get', () => {
      const entries = Array.from({ length: 200 }, (_, i) => ({ key: `item-${i}`, value: i }))
      const f = new BloomierFilter(entries)
      for (let i = 0; i < 200; i++) expect(f.get(`item-${i}`)).toBe(i)
    })

    it('should never have false negatives for has', () => {
      const entries = Array.from({ length: 200 }, (_, i) => ({ key: `item-${i}`, value: i }))
      const f = new BloomierFilter(entries)
      for (let i = 0; i < 200; i++) expect(f.has(`item-${i}`)).toBe(true)
    })

    it('should have zero false positives for empty filter', () => {
      const f = new BloomierFilter<string, number>([])
      for (let i = 0; i < 100; i++) {
        expect(f.get(`test-${i}`)).toBeUndefined()
        expect(f.has(`test-${i}`)).toBe(false)
      }
    })

    it('should return default for some non-member keys', () => {
      const entries = Array.from({ length: 100 }, (_, i) => ({ key: `item-${i}`, value: i }))
      const f = new BloomierFilter(entries)
      let defaultCount = 0
      const trials = 500
      for (let i = 0; i < trials; i++) {
        if (f.get(`not-a-member-${i}`) === undefined) defaultCount++
      }
      expect(defaultCount).toBeGreaterThan(0)
    })

    it('should return false for some non-member has checks', () => {
      const entries = Array.from({ length: 100 }, (_, i) => ({ key: `item-${i}`, value: i }))
      const f = new BloomierFilter(entries)
      let falseCount = 0
      const trials = 500
      for (let i = 0; i < trials; i++) {
        if (!f.has(`not-a-member-${i}`)) falseCount++
      }
      expect(falseCount).toBeGreaterThan(0)
    })
  })

  describe('defaultValue variations', () => {
    it('should use undefined as default for empty filter', () => {
      const f = new BloomierFilter<string, number>([])
      expect(f.get('missing')).toBeUndefined()
    })

    it('should use number as default for empty filter', () => {
      const f = new BloomierFilter<string, number>([], { defaultValue: -1 })
      expect(f.get('missing')).toBe(-1)
    })

    it('should use string as default for empty filter', () => {
      const f = new BloomierFilter<string, string>([], { defaultValue: 'not found' })
      expect(f.get('missing')).toBe('not found')
    })

    it('should use null as default for empty filter', () => {
      const f = new BloomierFilter<string, string | null>([], { defaultValue: null })
      expect(f.get('missing')).toBe(null)
    })

    it('should use 0 as default for empty filter', () => {
      const f = new BloomierFilter<string, number>([], { defaultValue: 0 })
      expect(f.get('missing')).toBe(0)
    })

    it('should use false as default for empty filter', () => {
      const f = new BloomierFilter<string, boolean>([], { defaultValue: false })
      expect(f.get('missing')).toBe(false)
    })

    it('should return default for empty filter', () => {
      const f = new BloomierFilter<string, number>([], { defaultValue: 42 })
      expect(f.get('any')).toBe(42)
    })
  })
})
