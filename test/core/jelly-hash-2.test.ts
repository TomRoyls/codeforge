import { describe, it, expect, beforeEach } from 'vitest'
import { JellyHash2 } from '../../src/core/jelly-hash-2/index.js'

describe('JellyHash2', () => {
  let hash: JellyHash2<string, number>

  beforeEach(() => {
    hash = new JellyHash2()
  })

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create with default options', () => {
      const h = new JellyHash2<string, number>()
      expect(h.size).toBe(0)
      expect(h.capacity).toBe(16)
    })

    it('should accept custom initialCapacity', () => {
      const h = new JellyHash2<string, number>({ initialCapacity: 32 })
      expect(h.capacity).toBe(32)
    })

    it('should accept custom loadFactor', () => {
      const h = new JellyHash2<string, number>({ loadFactor: 0.5 })
      expect(h.loadFactor()).toBe(0)
    })

    it('should accept custom hashFn', () => {
      const h = new JellyHash2<string, number>({ hashFn: () => 0 })
      h.set('a', 1)
      h.set('b', 2)
      expect(h.get('a')).toBe(1)
      expect(h.get('b')).toBe(2)
    })
  })

  // ─── set/get ───

  describe('set and get', () => {
    it('should set and get a value', () => {
      hash.set('key', 42)
      expect(hash.get('key')).toBe(42)
    })

    it('should return undefined for missing key', () => {
      expect(hash.get('missing')).toBeUndefined()
    })

    it('should overwrite existing key', () => {
      hash.set('key', 1)
      hash.set('key', 2)
      expect(hash.get('key')).toBe(2)
      expect(hash.size).toBe(1)
    })

    it('should handle multiple keys', () => {
      hash.set('a', 1)
      hash.set('b', 2)
      hash.set('c', 3)
      expect(hash.size).toBe(3)
      expect(hash.get('a')).toBe(1)
      expect(hash.get('b')).toBe(2)
      expect(hash.get('c')).toBe(3)
    })

    it('should handle number keys', () => {
      const h = new JellyHash2<number, string>()
      h.set(1, 'one')
      h.set(2, 'two')
      expect(h.get(1)).toBe('one')
      expect(h.get(2)).toBe('two')
    })
  })

  // ─── has ───

  describe('has', () => {
    it('should return true for existing key', () => {
      hash.set('key', 1)
      expect(hash.has('key')).toBe(true)
    })

    it('should return false for missing key', () => {
      expect(hash.has('missing')).toBe(false)
    })
  })

  // ─── delete ───

  describe('delete', () => {
    it('should delete an existing key', () => {
      hash.set('key', 1)
      expect(hash.delete('key')).toBe(true)
      expect(hash.has('key')).toBe(false)
      expect(hash.size).toBe(0)
    })

    it('should return false for missing key', () => {
      expect(hash.delete('missing')).toBe(false)
    })

    it('should handle collision chain deletion (head)', () => {
      const h = new JellyHash2<string, number>({ hashFn: () => 0 })
      h.set('a', 1)
      h.set('b', 2)
      expect(h.delete('a')).toBe(true)
      expect(h.get('b')).toBe(2)
      expect(h.size).toBe(1)
    })

    it('should handle collision chain deletion (middle)', () => {
      const h = new JellyHash2<string, number>({ hashFn: () => 0 })
      h.set('a', 1)
      h.set('b', 2)
      h.set('c', 3)
      expect(h.delete('b')).toBe(true)
      expect(h.get('a')).toBe(1)
      expect(h.get('c')).toBe(3)
      expect(h.size).toBe(2)
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('should clear all entries', () => {
      hash.set('a', 1)
      hash.set('b', 2)
      hash.clear()
      expect(hash.size).toBe(0)
      expect(hash.get('a')).toBeUndefined()
    })

    it('should not change capacity', () => {
      const initialCapacity = hash.capacity
      hash.set('a', 1)
      hash.clear()
      expect(hash.capacity).toBe(initialCapacity)
    })
  })

  // ─── keys/values/entries ───

  describe('keys, values, entries', () => {
    it('should return empty arrays for empty hash', () => {
      expect(hash.keys()).toEqual([])
      expect(hash.values()).toEqual([])
      expect(hash.entries()).toEqual([])
    })

    it('should return all keys', () => {
      hash.set('a', 1)
      hash.set('b', 2)
      const keys = hash.keys()
      expect(keys).toHaveLength(2)
      expect(keys.sort()).toEqual(['a', 'b'])
    })

    it('should return all values', () => {
      hash.set('a', 1)
      hash.set('b', 2)
      const vals = hash.values()
      expect(vals).toHaveLength(2)
      expect(vals.sort()).toEqual([1, 2])
    })

    it('should return all entries', () => {
      hash.set('a', 1)
      hash.set('b', 2)
      const entries = hash.entries()
      expect(entries).toHaveLength(2)
      expect(entries.sort((x, y) => x[0].localeCompare(y[0]))).toEqual([['a', 1], ['b', 2]])
    })
  })

  // ─── Resizing ───

  describe('resizing', () => {
    it('should resize when load factor exceeded', () => {
      const h = new JellyHash2<string, number>({ initialCapacity: 4, loadFactor: 0.5 })
      const initialCapacity = h.capacity
      h.set('a', 1)
      h.set('b', 2)
      h.set('c', 3)
      expect(h.capacity).toBeGreaterThan(initialCapacity)
      expect(h.get('a')).toBe(1)
      expect(h.get('b')).toBe(2)
      expect(h.get('c')).toBe(3)
    })
  })

  // ─── size/capacity/loadFactor ───

  describe('size, capacity, loadFactor', () => {
    it('should track size correctly', () => {
      expect(hash.size).toBe(0)
      hash.set('a', 1)
      expect(hash.size).toBe(1)
      hash.set('b', 2)
      expect(hash.size).toBe(2)
      hash.delete('a')
      expect(hash.size).toBe(1)
    })

    it('should compute loadFactor', () => {
      const h = new JellyHash2<string, number>({ initialCapacity: 4 })
      expect(h.loadFactor()).toBe(0)
      h.set('a', 1)
      expect(h.loadFactor()).toBeCloseTo(0.25)
    })
  })
})
