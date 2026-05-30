import { describe, expect, it } from 'vitest'
import { BloomierFilter } from '../../../src/utils/bloomier-filter.js'

describe('BloomierFilter', () => {
  describe('create', () => {
    it('creates empty filter', () => {
      const entries = new Map<string, number>()
      const filter = BloomierFilter.create(entries)
      expect(filter.size).toBe(0)
      expect(filter.capacity).toBe(0)
      expect(filter.falsePositiveRate).toBe(0)
    })

    it('creates filter with single entry', () => {
      const entries = new Map([['key1', 42]])
      const filter = BloomierFilter.create(entries)
      expect(filter.size).toBe(1)
      expect(filter.capacity).toBeGreaterThan(0)
    })

    it('creates filter with multiple entries', () => {
      const entries = new Map([
        ['key1', 1],
        ['key2', 2],
        ['key3', 3],
      ])
      const filter = BloomierFilter.create(entries)
      expect(filter.size).toBe(3)
      expect(filter.capacity).toBeGreaterThanOrEqual(3)
    })

    it('uses default seed', () => {
      const entries = new Map([['key1', 1]])
      const filter1 = BloomierFilter.create(entries)
      const filter2 = BloomierFilter.create(entries)
      expect(filter1.capacity).toBe(filter2.capacity)
    })

    it('uses custom seed', () => {
      const entries = new Map([['key1', 1]])
      const filter1 = BloomierFilter.create(entries, 100)
      const filter2 = BloomierFilter.create(entries, 200)
      expect(filter1.capacity).toBe(filter2.capacity)
    })

    it('handles many entries', () => {
      const entries = new Map<string, number>()
      for (let i = 0; i < 100; i++) {
        entries.set(`key${i}`, i)
      }
      const filter = BloomierFilter.create(entries)
      expect(filter.size).toBe(100)
    })

    it('handles zero values', () => {
      const entries = new Map([['key1', 0]])
      const filter = BloomierFilter.create(entries)
      expect(filter.get('key1')).toBe(0)
    })

    it('handles negative values', () => {
      const entries = new Map([['key1', -42]])
      const filter = BloomierFilter.create(entries)
      expect(filter.get('key1')).toBe(-42)
    })

    it('handles large values', () => {
      const entries = new Map([['key1', 999999999]])
      const filter = BloomierFilter.create(entries)
      expect(filter.get('key1')).toBe(999999999)
    })
  })

  describe('get', () => {
    it('returns undefined for empty filter', () => {
      const entries = new Map<string, number>()
      const filter = BloomierFilter.create(entries)
      expect(filter.get('anykey')).toBeUndefined()
    })

    it('returns correct value for existing key', () => {
      const entries = new Map([['key1', 42]])
      const filter = BloomierFilter.create(entries)
      expect(filter.get('key1')).toBe(42)
    })

    it('returns correct value for multiple keys', () => {
      const entries = new Map([
        ['key1', 1],
        ['key2', 2],
        ['key3', 3],
      ])
      const filter = BloomierFilter.create(entries)
      expect(filter.get('key1')).toBe(1)
      expect(filter.get('key2')).toBe(2)
      expect(filter.get('key3')).toBe(3)
    })

    it('checks for non-existent key with has', () => {
      const entries = new Map([['key1', 1]])
      const filter = BloomierFilter.create(entries)
      expect(filter.has('nonexistent')).toBe(false)
    })

    it('handles string keys with special characters', () => {
      const entries = new Map([
        ['key-1', 1],
        ['key_2', 2],
        ['key.3', 3],
        ['key:4', 4],
        ['key/5', 5],
      ])
      const filter = BloomierFilter.create(entries)
      expect(filter.get('key-1')).toBe(1)
      expect(filter.get('key_2')).toBe(2)
      expect(filter.get('key.3')).toBe(3)
      expect(filter.get('key:4')).toBe(4)
      expect(filter.get('key/5')).toBe(5)
    })

    it('handles empty string key', () => {
      const entries = new Map([['', 42]])
      const filter = BloomierFilter.create(entries)
      expect(filter.get('')).toBe(42)
    })

    it('handles very long keys', () => {
      const longKey = 'a'.repeat(1000)
      const entries = new Map([[longKey, 123]])
      const filter = BloomierFilter.create(entries)
      expect(filter.get(longKey)).toBe(123)
    })

    it('consistently returns same value for same key', () => {
      const entries = new Map([['key1', 42]])
      const filter = BloomierFilter.create(entries)
      const value1 = filter.get('key1')
      const value2 = filter.get('key1')
      const value3 = filter.get('key1')
      expect(value1).toBe(42)
      expect(value2).toBe(42)
      expect(value3).toBe(42)
    })
  })

  describe('has', () => {
    it('returns false for empty filter', () => {
      const entries = new Map<string, number>()
      const filter = BloomierFilter.create(entries)
      expect(filter.has('anykey')).toBe(false)
    })

    it('returns true for existing key', () => {
      const entries = new Map([['key1', 1]])
      const filter = BloomierFilter.create(entries)
      expect(filter.has('key1')).toBe(true)
    })

    it('returns false for non-existent key', () => {
      const entries = new Map([['key1', 1]])
      const filter = BloomierFilter.create(entries)
      expect(filter.has('nonexistent')).toBe(false)
    })

    it('returns true for all existing keys', () => {
      const entries = new Map([
        ['key1', 1],
        ['key2', 2],
        ['key3', 3],
      ])
      const filter = BloomierFilter.create(entries)
      expect(filter.has('key1')).toBe(true)
      expect(filter.has('key2')).toBe(true)
      expect(filter.has('key3')).toBe(true)
    })

    it('handles many keys', () => {
      const entries = new Map<string, number>()
      for (let i = 0; i < 100; i++) {
        entries.set(`key${i}`, i)
      }
      const filter = BloomierFilter.create(entries)
      expect(filter.has('key0')).toBe(true)
      expect(filter.has('key50')).toBe(true)
      expect(filter.has('key99')).toBe(true)
      expect(filter.has('key100')).toBe(false)
    })
  })

  describe('size', () => {
    it('returns 0 for empty filter', () => {
      const entries = new Map<string, number>()
      const filter = BloomierFilter.create(entries)
      expect(filter.size).toBe(0)
    })

    it('returns 1 for single entry', () => {
      const entries = new Map([['key1', 1]])
      const filter = BloomierFilter.create(entries)
      expect(filter.size).toBe(1)
    })

    it('returns correct size for multiple entries', () => {
      const entries = new Map([
        ['key1', 1],
        ['key2', 2],
        ['key3', 3],
      ])
      const filter = BloomierFilter.create(entries)
      expect(filter.size).toBe(3)
    })

    it('returns size for large number of entries', () => {
      const entries = new Map<string, number>()
      for (let i = 0; i < 1000; i++) {
        entries.set(`key${i}`, i)
      }
      const filter = BloomierFilter.create(entries)
      expect(filter.size).toBe(1000)
    })
  })

  describe('capacity', () => {
    it('returns 0 for empty filter', () => {
      const entries = new Map<string, number>()
      const filter = BloomierFilter.create(entries)
      expect(filter.capacity).toBe(0)
    })

    it('returns positive capacity for single entry', () => {
      const entries = new Map([['key1', 1]])
      const filter = BloomierFilter.create(entries)
      expect(filter.capacity).toBeGreaterThan(0)
    })

    it('capacity is greater than or equal to size', () => {
      const entries = new Map<string, number>()
      for (let i = 0; i < 100; i++) {
        entries.set(`key${i}`, i)
      }
      const filter = BloomierFilter.create(entries)
      expect(filter.capacity).toBeGreaterThanOrEqual(filter.size)
    })
  })

  describe('falsePositiveRate', () => {
    it('returns 0 for empty filter', () => {
      const entries = new Map<string, number>()
      const filter = BloomierFilter.create(entries)
      expect(filter.falsePositiveRate).toBe(0)
    })

    it('returns rate between 0 and 1', () => {
      const entries = new Map([['key1', 1]])
      const filter = BloomierFilter.create(entries)
      expect(filter.falsePositiveRate).toBeGreaterThanOrEqual(0)
      expect(filter.falsePositiveRate).toBeLessThanOrEqual(1)
    })

    it('returns rate for multiple entries', () => {
      const entries = new Map([
        ['key1', 1],
        ['key2', 2],
        ['key3', 3],
      ])
      const filter = BloomierFilter.create(entries)
      expect(filter.falsePositiveRate).toBeGreaterThanOrEqual(0)
      expect(filter.falsePositiveRate).toBeLessThanOrEqual(1)
    })
  })

  describe('stats', () => {
    it('returns correct stats for empty filter', () => {
      const entries = new Map<string, number>()
      const filter = BloomierFilter.create(entries)
      const stats = filter.stats()
      expect(stats.size).toBe(0)
      expect(stats.capacity).toBe(0)
      expect(stats.hashCount).toBe(0)
      expect(stats.falsePositiveRate).toBe(0)
    })

    it('returns correct stats for filter with entries', () => {
      const entries = new Map([
        ['key1', 1],
        ['key2', 2],
      ])
      const filter = BloomierFilter.create(entries)
      const stats = filter.stats()
      expect(stats.size).toBe(2)
      expect(stats.capacity).toBeGreaterThan(0)
      expect(stats.hashCount).toBe(3)
      expect(stats.falsePositiveRate).toBeGreaterThanOrEqual(0)
    })

    it('stats match individual getters', () => {
      const entries = new Map([
        ['key1', 1],
        ['key2', 2],
        ['key3', 3],
      ])
      const filter = BloomierFilter.create(entries)
      const stats = filter.stats()
      expect(stats.size).toBe(filter.size)
      expect(stats.capacity).toBe(filter.capacity)
      expect(stats.falsePositiveRate).toBe(filter.falsePositiveRate)
    })
  })
})