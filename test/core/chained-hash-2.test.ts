import { describe, it, expect } from 'vitest'
import { ChainedHash2 } from '../../src/core/chained-hash-2/index.js'

describe('ChainedHash2', () => {

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create with default capacity', () => {
      const hash = new ChainedHash2<number>()
      expect(hash.size()).toBe(0)
      expect(hash.isEmpty()).toBe(true)
      expect(hash.getCapacity()).toBe(16)
    })

    it('should create with custom capacity', () => {
      const hash = new ChainedHash2<string>(32)
      expect(hash.getCapacity()).toBe(32)
    })

    it('should enforce minimum capacity of 1', () => {
      const hash = new ChainedHash2<number>(0)
      expect(hash.getCapacity()).toBe(1)
    })

    it('should handle negative capacity', () => {
      const hash = new ChainedHash2<number>(-5)
      expect(hash.getCapacity()).toBe(1)
    })
  })

  // ─── Put & Get ───

  describe('put and get', () => {
    it('should store and retrieve a value', () => {
      const hash = new ChainedHash2<number>()
      hash.put('key', 42)
      expect(hash.get('key')).toBe(42)
    })

    it('should return undefined for missing key', () => {
      const hash = new ChainedHash2<number>()
      expect(hash.get('missing')).toBeUndefined()
    })

    it('should overwrite existing key', () => {
      const hash = new ChainedHash2<number>()
      hash.put('key', 1)
      hash.put('key', 2)
      expect(hash.get('key')).toBe(2)
      expect(hash.size()).toBe(1)
    })

    it('should handle multiple keys', () => {
      const hash = new ChainedHash2<string>()
      hash.put('a', 'alpha')
      hash.put('b', 'beta')
      hash.put('c', 'gamma')
      expect(hash.get('a')).toBe('alpha')
      expect(hash.get('b')).toBe('beta')
      expect(hash.get('c')).toBe('gamma')
    })

    it('should handle empty string key', () => {
      const hash = new ChainedHash2<number>()
      hash.put('', 99)
      expect(hash.get('')).toBe(99)
    })

    it('should handle object values', () => {
      const hash = new ChainedHash2<{ x: number }>()
      hash.put('obj', { x: 10 })
      expect(hash.get('obj')).toEqual({ x: 10 })
    })
  })

  // ─── Remove ───

  describe('remove', () => {
    it('should remove an existing key', () => {
      const hash = new ChainedHash2<number>()
      hash.put('key', 1)
      expect(hash.remove('key')).toBe(true)
      expect(hash.get('key')).toBeUndefined()
      expect(hash.size()).toBe(0)
    })

    it('should return false for missing key', () => {
      const hash = new ChainedHash2<number>()
      expect(hash.remove('missing')).toBe(false)
    })

    it('should only remove the specified key', () => {
      const hash = new ChainedHash2<number>()
      hash.put('a', 1)
      hash.put('b', 2)
      hash.remove('a')
      expect(hash.get('a')).toBeUndefined()
      expect(hash.get('b')).toBe(2)
    })

    it('should handle removing from chain', () => {
      const hash = new ChainedHash2<number>(1)
      hash.put('a', 1)
      hash.put('b', 2)
      hash.put('c', 3)
      expect(hash.remove('b')).toBe(true)
      expect(hash.get('a')).toBe(1)
      expect(hash.get('c')).toBe(3)
      expect(hash.size()).toBe(2)
    })
  })

  // ─── Contains ───

  describe('contains', () => {
    it('should return true for existing key', () => {
      const hash = new ChainedHash2<number>()
      hash.put('key', 1)
      expect(hash.contains('key')).toBe(true)
    })

    it('should return false for missing key', () => {
      const hash = new ChainedHash2<number>()
      expect(hash.contains('key')).toBe(false)
    })
  })

  // ─── Keys, Values, Entries ───

  describe('keys, values, entries', () => {
    it('should return all keys', () => {
      const hash = new ChainedHash2<number>()
      hash.put('a', 1)
      hash.put('b', 2)
      const keys = hash.keys().sort()
      expect(keys).toEqual(['a', 'b'])
    })

    it('should return all values', () => {
      const hash = new ChainedHash2<number>()
      hash.put('a', 1)
      hash.put('b', 2)
      const vals = hash.values().sort()
      expect(vals).toEqual([1, 2])
    })

    it('should return all entries', () => {
      const hash = new ChainedHash2<number>()
      hash.put('a', 1)
      hash.put('b', 2)
      const entries = hash.entries().sort((x, y) => x[0].localeCompare(y[0]))
      expect(entries).toEqual([['a', 1], ['b', 2]])
    })

    it('should return empty arrays for empty hash', () => {
      const hash = new ChainedHash2<number>()
      expect(hash.keys()).toEqual([])
      expect(hash.values()).toEqual([])
      expect(hash.entries()).toEqual([])
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('should remove all entries', () => {
      const hash = new ChainedHash2<number>()
      hash.put('a', 1)
      hash.put('b', 2)
      hash.clear()
      expect(hash.size()).toBe(0)
      expect(hash.isEmpty()).toBe(true)
      expect(hash.get('a')).toBeUndefined()
    })

    it('should allow puts after clearing', () => {
      const hash = new ChainedHash2<number>()
      hash.put('old', 1)
      hash.clear()
      hash.put('new', 2)
      expect(hash.get('new')).toBe(2)
      expect(hash.size()).toBe(1)
    })
  })

  // ─── LoadFactor ───

  describe('loadFactor', () => {
    it('should return 0 for empty hash', () => {
      const hash = new ChainedHash2<number>()
      expect(hash.loadFactor()).toBe(0)
    })

    it('should increase with entries', () => {
      const hash = new ChainedHash2<number>(4)
      hash.put('a', 1)
      expect(hash.loadFactor()).toBe(0.25)
      hash.put('b', 2)
      hash.put('c', 3)
      hash.put('d', 4)
      expect(hash.loadFactor()).toBe(1)
    })
  })

  // ─── GetBucketSizes ───

  describe('getBucketSizes', () => {
    it('should return array matching capacity', () => {
      const hash = new ChainedHash2<number>(4)
      expect(hash.getBucketSizes()).toEqual([0, 0, 0, 0])
    })

    it('should reflect chain lengths', () => {
      const hash = new ChainedHash2<number>(1)
      hash.put('a', 1)
      hash.put('b', 2)
      hash.put('c', 3)
      expect(hash.getBucketSizes()).toEqual([3])
    })
  })

  // ─── ForEach ───

  describe('forEach', () => {
    it('should iterate over all entries', () => {
      const hash = new ChainedHash2<number>()
      hash.put('a', 1)
      hash.put('b', 2)
      const collected: [string, number][] = []
      hash.forEach((k, v) => collected.push([k, v]))
      expect(collected.sort((x, y) => x[0].localeCompare(y[0]))).toEqual([['a', 1], ['b', 2]])
    })

    it('should not call callback for empty hash', () => {
      const hash = new ChainedHash2<number>()
      let called = false
      hash.forEach(() => { called = true })
      expect(called).toBe(false)
    })
  })

  // ─── Size & IsEmpty ───

  describe('size and isEmpty', () => {
    it('should track size through put and remove', () => {
      const hash = new ChainedHash2<number>()
      expect(hash.size()).toBe(0)
      hash.put('a', 1)
      expect(hash.size()).toBe(1)
      hash.put('b', 2)
      expect(hash.size()).toBe(2)
      hash.remove('a')
      expect(hash.size()).toBe(1)
    })

    it('should track empty state', () => {
      const hash = new ChainedHash2<number>()
      expect(hash.isEmpty()).toBe(true)
      hash.put('x', 1)
      expect(hash.isEmpty()).toBe(false)
      hash.remove('x')
      expect(hash.isEmpty()).toBe(true)
    })
  })
})
