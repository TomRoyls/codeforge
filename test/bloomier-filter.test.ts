import {
  BloomierFilter,
  DEFAULT_BLOOMIER_TABLE_MULTIPLIER,
} from '../src/core/bloomier-filter/bloomier-filter.js'
import type { BloomierFilterOptions, BloomierFilterStats } from '../src/core/bloomier-filter/bloomier-filter.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('BloomierFilter', () => {
  describe('constructor', () => {
    it('creates a filter with an empty entries array', () => {
      const bf = new BloomierFilter<string, number>([])
      expect(bf.size).toBe(0)
    })

    it('creates a filter with entries', () => {
      const bf = new BloomierFilter<string, number>([
        { key: 'a', value: 1 },
        { key: 'b', value: 2 },
      ])
      expect(bf.size).toBe(2)
    })

    it('creates a filter with options containing defaultValue', () => {
      const bf = new BloomierFilter<string, number>([], { defaultValue: -1 })
      expect(bf.get('missing')).toBe(-1)
    })

    it('creates a filter with options containing tableSize', () => {
      const bf = new BloomierFilter<string, number>(
        [{ key: 'x', value: 10 }],
        { tableSize: 1000 },
      )
      expect(bf.stats().tableSize).toBe(1000)
    })

    it('uses minimum tableSize when provided value is too small', () => {
      const entries = [{ key: 'a', value: 1 }]
      const bf = new BloomierFilter<string, number>(entries, { tableSize: 1 })
      // minTableSize = 1 * 2 * 3 + 1 = 7
      expect(bf.stats().tableSize).toBeGreaterThanOrEqual(7)
    })

    it('deduplicates entries by key (last value wins)', () => {
      const bf = new BloomierFilter<string, number>([
        { key: 'a', value: 1 },
        { key: 'a', value: 2 },
        { key: 'a', value: 3 },
      ])
      expect(bf.size).toBe(1)
      expect(bf.get('a')).toBe(3)
    })

    it('deduplicates object keys by JSON serialization', () => {
      const bf = new BloomierFilter<object, string>([
        { key: { id: 1 }, value: 'first' },
        { key: { id: 1 }, value: 'second' },
      ])
      expect(bf.size).toBe(1)
      expect(bf.get({ id: 1 })).toBe('second')
    })

    it('sets tableSize to 1 for empty entries when no option given', () => {
      const bf = new BloomierFilter<string, number>([])
      expect(bf.stats().tableSize).toBe(1)
    })

    it('respects tableSize option for empty entries', () => {
      const bf = new BloomierFilter<string, number>([], { tableSize: 50 })
      expect(bf.stats().tableSize).toBe(50)
    })

    it('computes tableSize from entry count when no option given', () => {
      const entries = Array.from({ length: 10 }, (_, i) => ({
        key: `k${i}`,
        value: i,
      }))
      const bf = new BloomierFilter<string, number>(entries)
      // minTableSize = 10 * 2 * 3 + 1 = 61
      expect(bf.stats().tableSize).toBe(61)
    })

    it('handles a single entry', () => {
      const bf = new BloomierFilter<string, number>([{ key: 'only', value: 42 }])
      expect(bf.size).toBe(1)
      expect(bf.get('only')).toBe(42)
    })
  })

  // ─── get / lookup ────────────────────────────────────────────────────

  describe('get', () => {
    it('returns the value for an existing string key', () => {
      const bf = new BloomierFilter<string, number>([
        { key: 'hello', value: 100 },
      ])
      expect(bf.get('hello')).toBe(100)
    })

    it('returns the value for an existing number key', () => {
      const bf = new BloomierFilter<number, string>([
        { key: 42, value: 'answer' },
      ])
      expect(bf.get(42)).toBe('answer')
    })

    it('returns undefined for a missing key when no defaultValue', () => {
      const bf = new BloomierFilter<string, number>([
        { key: 'a', value: 1 },
      ])
      expect(bf.get('missing')).toBeUndefined()
    })

    it('returns defaultValue for a missing key', () => {
      const bf = new BloomierFilter<string, number>(
        [{ key: 'a', value: 1 }],
        { defaultValue: -999 },
      )
      expect(bf.get('missing')).toBe(-999)
    })

    it('returns defaultValue for any key when filter is empty', () => {
      const bf = new BloomierFilter<string, number>([], { defaultValue: 0 })
      expect(bf.get('anything')).toBe(0)
    })

    it('returns undefined for any key when filter is empty and no defaultValue', () => {
      const bf = new BloomierFilter<string, number>([])
      expect(bf.get('anything')).toBeUndefined()
    })

    it('returns value for object key matching by JSON serialization', () => {
      const bf = new BloomierFilter<{ id: number }, string>([
        { key: { id: 5 }, value: 'found' },
      ])
      expect(bf.get({ id: 5 })).toBe('found')
    })

    it('distinguishes different object keys', () => {
      const bf = new BloomierFilter<{ id: number }, string>([
        { key: { id: 1 }, value: 'one' },
        { key: { id: 2 }, value: 'two' },
      ])
      expect(bf.get({ id: 1 })).toBe('one')
      expect(bf.get({ id: 2 })).toBe('two')
    })

    it('returns the correct value after deduplication', () => {
      const bf = new BloomierFilter<string, number>([
        { key: 'x', value: 10 },
        { key: 'x', value: 20 },
      ])
      expect(bf.get('x')).toBe(20)
    })
  })

  // ─── has / contains ──────────────────────────────────────────────────

  describe('has', () => {
    it('returns true for an existing string key', () => {
      const bf = new BloomierFilter<string, number>([
        { key: 'exists', value: 1 },
      ])
      expect(bf.has('exists')).toBe(true)
    })

    it('returns false for a missing key', () => {
      const bf = new BloomierFilter<string, number>([
        { key: 'a', value: 1 },
      ])
      expect(bf.has('nonexistent')).toBe(false)
    })

    it('returns false for any key when filter is empty', () => {
      const bf = new BloomierFilter<string, number>([])
      expect(bf.has('anything')).toBe(false)
    })

    it('returns true for a number key', () => {
      const bf = new BloomierFilter<number, string>([
        { key: 99, value: 'ninety-nine' },
      ])
      expect(bf.has(99)).toBe(true)
      expect(bf.has(100)).toBe(false)
    })

    it('returns true for object keys by JSON serialization', () => {
      const bf = new BloomierFilter<Array<number>, string>([
        { key: [1, 2, 3], value: 'array' },
      ])
      expect(bf.has([1, 2, 3])).toBe(true)
      expect(bf.has([4, 5, 6])).toBe(false)
    })

    it('returns false for keys that were never inserted', () => {
      const entries = Array.from({ length: 50 }, (_, i) => ({
        key: `key-${i}`,
        value: i,
      }))
      const bf = new BloomierFilter<string, number>(entries)
      expect(bf.has('key-0')).toBe(true)
      expect(bf.has('key-49')).toBe(true)
      expect(bf.has('key-50')).toBe(false)
    })
  })

  // ─── size ────────────────────────────────────────────────────────────

  describe('size', () => {
    it('returns 0 for empty filter', () => {
      const bf = new BloomierFilter<string, number>([])
      expect(bf.size).toBe(0)
    })

    it('returns the count of unique keys', () => {
      const bf = new BloomierFilter<string, number>([
        { key: 'a', value: 1 },
        { key: 'b', value: 2 },
        { key: 'c', value: 3 },
      ])
      expect(bf.size).toBe(3)
    })

    it('counts deduplicated entries', () => {
      const bf = new BloomierFilter<string, number>([
        { key: 'a', value: 1 },
        { key: 'a', value: 2 },
        { key: 'b', value: 3 },
      ])
      expect(bf.size).toBe(2)
    })

    it('returns correct size for a large number of entries', () => {
      const entries = Array.from({ length: 200 }, (_, i) => ({
        key: `key-${i}`,
        value: i,
      }))
      const bf = new BloomierFilter<string, number>(entries)
      expect(bf.size).toBe(200)
    })
  })

  // ─── keys / values / entries ─────────────────────────────────────────

  describe('keys', () => {
    it('returns empty array for empty filter', () => {
      const bf = new BloomierFilter<string, number>([])
      expect(bf.keys()).toEqual([])
    })

    it('returns all keys', () => {
      const bf = new BloomierFilter<string, number>([
        { key: 'x', value: 1 },
        { key: 'y', value: 2 },
      ])
      expect(bf.keys()).toEqual(['x', 'y'])
    })

    it('returns deduplicated keys', () => {
      const bf = new BloomierFilter<string, number>([
        { key: 'a', value: 1 },
        { key: 'a', value: 2 },
      ])
      expect(bf.keys()).toEqual(['a'])
    })
  })

  describe('values', () => {
    it('returns empty array for empty filter', () => {
      const bf = new BloomierFilter<string, number>([])
      expect(bf.values()).toEqual([])
    })

    it('returns all values', () => {
      const bf = new BloomierFilter<string, number>([
        { key: 'x', value: 10 },
        { key: 'y', value: 20 },
      ])
      expect(bf.values()).toEqual([10, 20])
    })

    it('returns the winning value after deduplication', () => {
      const bf = new BloomierFilter<string, number>([
        { key: 'a', value: 1 },
        { key: 'a', value: 99 },
      ])
      expect(bf.values()).toEqual([99])
    })
  })

  describe('entries', () => {
    it('returns empty array for empty filter', () => {
      const bf = new BloomierFilter<string, number>([])
      expect(bf.entries()).toEqual([])
    })

    it('returns all key-value pairs', () => {
      const bf = new BloomierFilter<string, number>([
        { key: 'p', value: 1 },
        { key: 'q', value: 2 },
      ])
      const e = bf.entries()
      expect(e).toEqual([
        { key: 'p', value: 1 },
        { key: 'q', value: 2 },
      ])
    })

    it('returns a shallow copy (modifying result does not affect filter)', () => {
      const bf = new BloomierFilter<string, number>([
        { key: 'a', value: 1 },
      ])
      const e = bf.entries()
      e[0]!.value = 999
      expect(bf.get('a')).toBe(1)
    })
  })

  // ─── forEach ─────────────────────────────────────────────────────────

  describe('forEach', () => {
    it('does not call callback for empty filter', () => {
      const bf = new BloomierFilter<string, number>([])
      let callCount = 0
      bf.forEach(() => { callCount++ })
      expect(callCount).toBe(0)
    })

    it('calls callback for each entry with correct arguments', () => {
      const bf = new BloomierFilter<string, number>([
        { key: 'a', value: 10 },
        { key: 'b', value: 20 },
      ])
      const results: Array<{ value: number; key: string; index: number }> = []
      bf.forEach((value, key, index) => {
        results.push({ value, key, index })
      })
      expect(results).toEqual([
        { value: 10, key: 'a', index: 0 },
        { value: 20, key: 'b', index: 1 },
      ])
    })

    it('iterates in insertion order (after dedup)', () => {
      const bf = new BloomierFilter<string, number>([
        { key: 'first', value: 1 },
        { key: 'second', value: 2 },
        { key: 'third', value: 3 },
      ])
      const keys: string[] = []
      bf.forEach((_v, key) => keys.push(key))
      expect(keys).toEqual(['first', 'second', 'third'])
    })

    it('calls callback exactly size times', () => {
      const entries = Array.from({ length: 25 }, (_, i) => ({
        key: `k${i}`,
        value: i,
      }))
      const bf = new BloomierFilter<string, number>(entries)
      let count = 0
      bf.forEach(() => count++)
      expect(count).toBe(25)
    })
  })

  // ─── stats ───────────────────────────────────────────────────────────

  describe('stats', () => {
    it('returns correct stats for empty filter', () => {
      const bf = new BloomierFilter<string, number>([])
      const s = bf.stats()
      expect(s.size).toBe(0)
      expect(s.tableSize).toBe(1)
      expect(s.loadFactor).toBe(0)
      expect(s.numHashes).toBe(3)
    })

    it('returns correct stats for populated filter', () => {
      const entries = Array.from({ length: 5 }, (_, i) => ({
        key: `k${i}`,
        value: i,
      }))
      const bf = new BloomierFilter<string, number>(entries)
      const s = bf.stats()
      expect(s.size).toBe(5)
      // minTableSize = 5 * 2 * 3 + 1 = 31
      expect(s.tableSize).toBe(31)
      expect(s.numHashes).toBe(3)
    })

    it('computes loadFactor correctly', () => {
      const entries = Array.from({ length: 10 }, (_, i) => ({
        key: `k${i}`,
        value: i,
      }))
      const bf = new BloomierFilter<string, number>(entries)
      const s = bf.stats()
      // minTableSize = 10 * 2 * 3 + 1 = 61
      const expectedLoadFactor = 10 / 61
      expect(s.loadFactor).toBeCloseTo(expectedLoadFactor)
    })

    it('uses custom tableSize in loadFactor', () => {
      const bf = new BloomierFilter<string, number>(
        [{ key: 'a', value: 1 }],
        { tableSize: 100 },
      )
      const s = bf.stats()
      expect(s.tableSize).toBe(100)
      expect(s.loadFactor).toBeCloseTo(1 / 100)
    })

    it('numHashes is always 3', () => {
      const bf1 = new BloomierFilter<string, number>([])
      const bf2 = new BloomierFilter<string, number>(
        Array.from({ length: 50 }, (_, i) => ({ key: `k${i}`, value: i })),
      )
      expect(bf1.stats().numHashes).toBe(3)
      expect(bf2.stats().numHashes).toBe(3)
    })
  })

  // ─── String keys ─────────────────────────────────────────────────────

  describe('string keys', () => {
    it('handles empty string key', () => {
      const bf = new BloomierFilter<string, number>([
        { key: '', value: 0 },
      ])
      expect(bf.has('')).toBe(true)
      expect(bf.get('')).toBe(0)
    })

    it('handles special characters in keys', () => {
      const bf = new BloomierFilter<string, number>([
        { key: 'hello\nworld', value: 1 },
        { key: 'tab\there', value: 2 },
        { key: 'quote"inside', value: 3 },
      ])
      expect(bf.get('hello\nworld')).toBe(1)
      expect(bf.get('tab\there')).toBe(2)
      expect(bf.get('quote"inside')).toBe(3)
    })

    it('handles unicode keys', () => {
      const bf = new BloomierFilter<string, string>([
        { key: '你好', value: 'hello' },
        { key: '🌍', value: 'world' },
        { key: 'café', value: 'coffee' },
      ])
      expect(bf.get('你好')).toBe('hello')
      expect(bf.get('🌍')).toBe('world')
      expect(bf.get('café')).toBe('coffee')
    })

    it('handles very long string keys', () => {
      const longKey = 'a'.repeat(10000)
      const bf = new BloomierFilter<string, number>([
        { key: longKey, value: 1 },
      ])
      expect(bf.has(longKey)).toBe(true)
      expect(bf.get(longKey)).toBe(1)
    })

    it('distinguishes similar string keys', () => {
      const bf = new BloomierFilter<string, number>([
        { key: 'abc', value: 1 },
        { key: 'abd', value: 2 },
        { key: 'ab', value: 3 },
      ])
      expect(bf.get('abc')).toBe(1)
      expect(bf.get('abd')).toBe(2)
      expect(bf.get('ab')).toBe(3)
      expect(bf.get('abcd')).toBeUndefined()
    })
  })

  // ─── Number keys ─────────────────────────────────────────────────────

  describe('number keys', () => {
    it('handles zero as a key', () => {
      const bf = new BloomierFilter<number, string>([
        { key: 0, value: 'zero' },
      ])
      expect(bf.has(0)).toBe(true)
      expect(bf.get(0)).toBe('zero')
    })

    it('handles negative numbers as keys', () => {
      const bf = new BloomierFilter<number, string>([
        { key: -1, value: 'neg-one' },
        { key: -100, value: 'neg-hundred' },
      ])
      expect(bf.get(-1)).toBe('neg-one')
      expect(bf.get(-100)).toBe('neg-hundred')
      expect(bf.get(-2)).toBeUndefined()
    })

    it('handles floating point numbers as keys', () => {
      const bf = new BloomierFilter<number, string>([
        { key: 3.14, value: 'pi' },
        { key: 2.718, value: 'e' },
      ])
      expect(bf.get(3.14)).toBe('pi')
      expect(bf.get(2.718)).toBe('e')
    })

    it('handles large numbers as keys', () => {
      const bf = new BloomierFilter<number, string>([
        { key: Number.MAX_SAFE_INTEGER, value: 'max' },
      ])
      expect(bf.get(Number.MAX_SAFE_INTEGER)).toBe('max')
    })
  })

  // ─── Edge cases ──────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles boolean keys', () => {
      const bf = new BloomierFilter<boolean, string>([
        { key: true, value: 'yes' },
        { key: false, value: 'no' },
      ])
      expect(bf.get(true)).toBe('yes')
      expect(bf.get(false)).toBe('no')
    })

    it('handles null key', () => {
      const bf = new BloomierFilter<null, string>([
        { key: null, value: 'null-value' },
      ])
      expect(bf.has(null)).toBe(true)
      expect(bf.get(null)).toBe('null-value')
    })

    it('handles array keys', () => {
      const bf = new BloomierFilter<number[], string>([
        { key: [1, 2, 3], value: 'triple' },
      ])
      expect(bf.has([1, 2, 3])).toBe(true)
      expect(bf.has([1, 2])).toBe(false)
    })

    it('handles object value types', () => {
      const bf = new BloomierFilter<string, { name: string }>([
        { key: 'user', value: { name: 'Alice' } },
      ])
      expect(bf.get('user')).toEqual({ name: 'Alice' })
    })

    it('handles string value type', () => {
      const bf = new BloomierFilter<string, string>([
        { key: 'greeting', value: 'hello' },
        { key: 'farewell', value: 'goodbye' },
      ])
      expect(bf.get('greeting')).toBe('hello')
      expect(bf.get('farewell')).toBe('goodbye')
    })

    it('handles many entries without error', () => {
      const entries = Array.from({ length: 1000 }, (_, i) => ({
        key: `key-${i}`,
        value: i,
      }))
      const bf = new BloomierFilter<string, number>(entries)
      expect(bf.size).toBe(1000)
      expect(bf.has('key-0')).toBe(true)
      expect(bf.has('key-500')).toBe(true)
      expect(bf.has('key-999')).toBe(true)
      expect(bf.has('key-1000')).toBe(false)
    })

    it('correctly returns values for many entries', () => {
      const entries = Array.from({ length: 100 }, (_, i) => ({
        key: `k${i}`,
        value: i * 10,
      }))
      const bf = new BloomierFilter<string, number>(entries)
      for (let i = 0; i < 100; i++) {
        expect(bf.get(`k${i}`)).toBe(i * 10)
      }
    })

    it('handles defaultValue of null', () => {
      const bf = new BloomierFilter<string, string | null>(
        [],
        { defaultValue: null },
      )
      expect(bf.get('missing')).toBeNull()
    })

    it('handles defaultValue of zero', () => {
      const bf = new BloomierFilter<string, number>(
        [{ key: 'a', value: 5 }],
        { defaultValue: 0 },
      )
      expect(bf.get('a')).toBe(5)
      expect(bf.get('missing')).toBe(0)
    })

    it('handles defaultValue of empty string', () => {
      const bf = new BloomierFilter<string, string>(
        [],
        { defaultValue: '' },
      )
      expect(bf.get('any')).toBe('')
    })
  })

  // ─── Hash collision / key distinctness ───────────────────────────────

  describe('key distinctness', () => {
    it('distinguishes string "1" from number 1', () => {
      const bf = new BloomierFilter<string | number, string>([
        { key: '1', value: 'string-one' },
        { key: 1, value: 'number-one' },
      ])
      expect(bf.get('1')).toBe('string-one')
      expect(bf.get(1)).toBe('number-one')
    })

    it('distinguishes "true" from boolean true', () => {
      const bf = new BloomierFilter<string | boolean, string>([
        { key: 'true', value: 'string-true' },
        { key: true, value: 'bool-true' },
      ])
      expect(bf.get('true')).toBe('string-true')
      expect(bf.get(true)).toBe('bool-true')
    })

    it('distinguishes "null" from null', () => {
      const bf = new BloomierFilter<string | null, string>([
        { key: 'null', value: 'string-null' },
        { key: null, value: 'real-null' },
      ])
      expect(bf.get('null')).toBe('string-null')
      expect(bf.get(null)).toBe('real-null')
    })

    it('distinguishes object keys with same properties in different order', () => {
      // JSON.stringify is order-dependent
      const bf = new BloomierFilter<{ a: number; b: number }, string>([
        { key: { a: 1, b: 2 }, value: 'ab' },
        { key: { b: 2, a: 1 }, value: 'ba' },
      ])
      expect(bf.get({ a: 1, b: 2 })).toBe('ab')
      expect(bf.get({ b: 2, a: 1 })).toBe('ba')
    })
  })

  // ─── DEFAULT_BLOOMIER_TABLE_MULTIPLIER ──────────────────────────────

  describe('DEFAULT_BLOOMIER_TABLE_MULTIPLIER', () => {
    it('is exported and equals 2', () => {
      expect(DEFAULT_BLOOMIER_TABLE_MULTIPLIER).toBe(2)
    })
  })

  // ─── Type exports ────────────────────────────────────────────────────

  describe('type exports', () => {
    it('BloomierFilterOptions type is usable', () => {
      const options: BloomierFilterOptions<number> = {
        defaultValue: 42,
        tableSize: 100,
      }
      const bf = new BloomierFilter<string, number>([], options)
      expect(bf.get('x')).toBe(42)
      expect(bf.stats().tableSize).toBe(100)
    })

    it('BloomierFilterStats type is usable', () => {
      const bf = new BloomierFilter<string, number>([
        { key: 'a', value: 1 },
      ])
      const s: BloomierFilterStats = bf.stats()
      expect(s.size).toBe(1)
      expect(typeof s.tableSize).toBe('number')
      expect(typeof s.loadFactor).toBe('number')
      expect(typeof s.numHashes).toBe('number')
    })
  })

  // ─── Comprehensive integration tests ─────────────────────────────────

  describe('integration', () => {
    it('behaves as a lookup table for word counts', () => {
      const words = [
        { key: 'the', value: 10 },
        { key: 'quick', value: 3 },
        { key: 'brown', value: 5 },
        { key: 'fox', value: 2 },
      ]
      const bf = new BloomierFilter<string, number>(words, { defaultValue: 0 })
      expect(bf.get('the')).toBe(10)
      expect(bf.get('fox')).toBe(2)
      expect(bf.get('unknown')).toBe(0)
    })

    it('behaves as a dictionary with string values', () => {
      const dict = [
        { key: 'hello', value: 'a greeting' },
        { key: 'world', value: 'the earth' },
      ]
      const bf = new BloomierFilter<string, string>(dict)
      expect(bf.get('hello')).toBe('a greeting')
      expect(bf.get('world')).toBe('the earth')
      expect(bf.has('hello')).toBe(true)
    })

    it('supports forEach accumulation pattern', () => {
      const entries = Array.from({ length: 10 }, (_, i) => ({
        key: `item-${i}`,
        value: i + 1,
      }))
      const bf = new BloomierFilter<string, number>(entries)
      let sum = 0
      bf.forEach((v) => { sum += v })
      // sum 1..10 = 55
      expect(sum).toBe(55)
    })

    it('keys, values, entries are consistent', () => {
      const data = [
        { key: 'a', value: 1 },
        { key: 'b', value: 2 },
        { key: 'c', value: 3 },
      ]
      const bf = new BloomierFilter<string, number>(data)
      const keys = bf.keys()
      const values = bf.values()
      const entries = bf.entries()
      expect(keys.length).toBe(values.length)
      expect(keys.length).toBe(entries.length)
      for (let i = 0; i < keys.length; i++) {
        expect(entries[i]!.key).toBe(keys[i])
        expect(entries[i]!.value).toBe(values[i])
      }
    })

    it('handles all entries being duplicates (single unique key)', () => {
      const bf = new BloomierFilter<string, number>([
        { key: 'only', value: 1 },
        { key: 'only', value: 2 },
        { key: 'only', value: 3 },
        { key: 'only', value: 4 },
      ])
      expect(bf.size).toBe(1)
      expect(bf.get('only')).toBe(4)
      expect(bf.keys()).toEqual(['only'])
      expect(bf.values()).toEqual([4])
    })

    it('tableSize scales with entry count', () => {
      const makeFilter = (n: number) =>
        new BloomierFilter<string, number>(
          Array.from({ length: n }, (_, i) => ({ key: `k${i}`, value: i })),
        )
      const bf10 = makeFilter(10)
      const bf100 = makeFilter(100)
      const bf1000 = makeFilter(1000)
      expect(bf100.stats().tableSize).toBeGreaterThan(bf10.stats().tableSize)
      expect(bf1000.stats().tableSize).toBeGreaterThan(bf100.stats().tableSize)
    })

    it('loadFactor decreases with larger tableSize', () => {
      const entries = Array.from({ length: 10 }, (_, i) => ({
        key: `k${i}`,
        value: i,
      }))
      const bfSmall = new BloomierFilter<string, number>(entries)
      const bfLarge = new BloomierFilter<string, number>(entries, {
        tableSize: 10000,
      })
      expect(bfLarge.stats().loadFactor).toBeLessThan(bfSmall.stats().loadFactor)
    })
  })
})
