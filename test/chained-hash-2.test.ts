import { describe, it, expect } from 'vitest'
import { ChainedHash2 } from '../src/core/chained-hash-2/index.js'

describe('ChainedHash2', () => {
  describe('constructor', () => {
    it('creates a hash table with default capacity', () => {
      const ht = new ChainedHash2()
      expect(ht.getCapacity()).toBe(16)
      expect(ht.size()).toBe(0)
      expect(ht.isEmpty()).toBe(true)
    })

    it('creates a hash table with custom capacity', () => {
      const ht = new ChainedHash2(32)
      expect(ht.getCapacity()).toBe(32)
    })

    it('uses minimum capacity of 1', () => {
      const ht = new ChainedHash2(0)
      expect(ht.getCapacity()).toBe(1)
    })

    it('uses minimum capacity of 1 for negative values', () => {
      const ht = new ChainedHash2(-5)
      expect(ht.getCapacity()).toBe(1)
    })
  })

  describe('put and get', () => {
    it('stores and retrieves a value', () => {
      const ht = new ChainedHash2<string>()
      ht.put('name', 'Alice')
      expect(ht.get('name')).toBe('Alice')
    })

    it('returns undefined for missing key', () => {
      const ht = new ChainedHash2<string>()
      expect(ht.get('missing')).toBeUndefined()
    })

    it('overwrites existing value', () => {
      const ht = new ChainedHash2<number>()
      ht.put('x', 1)
      ht.put('x', 2)
      expect(ht.get('x')).toBe(2)
      expect(ht.size()).toBe(1)
    })

    it('stores multiple key-value pairs', () => {
      const ht = new ChainedHash2<number>()
      ht.put('a', 1)
      ht.put('b', 2)
      ht.put('c', 3)
      expect(ht.get('a')).toBe(1)
      expect(ht.get('b')).toBe(2)
      expect(ht.get('c')).toBe(3)
      expect(ht.size()).toBe(3)
    })

    it('handles single-bucket table (capacity 1) with collisions', () => {
      const ht = new ChainedHash2<number>(1)
      ht.put('a', 1)
      ht.put('b', 2)
      ht.put('c', 3)
      expect(ht.get('a')).toBe(1)
      expect(ht.get('b')).toBe(2)
      expect(ht.get('c')).toBe(3)
      expect(ht.size()).toBe(3)
    })
  })

  describe('remove', () => {
    it('removes an existing key', () => {
      const ht = new ChainedHash2<number>()
      ht.put('x', 10)
      expect(ht.remove('x')).toBe(true)
      expect(ht.get('x')).toBeUndefined()
      expect(ht.size()).toBe(0)
    })

    it('returns false for missing key', () => {
      const ht = new ChainedHash2<number>()
      expect(ht.remove('missing')).toBe(false)
    })

    it('removes from middle of chain', () => {
      const ht = new ChainedHash2<number>(1)
      ht.put('a', 1)
      ht.put('b', 2)
      ht.put('c', 3)
      expect(ht.remove('b')).toBe(true)
      expect(ht.get('a')).toBe(1)
      expect(ht.get('b')).toBeUndefined()
      expect(ht.get('c')).toBe(3)
      expect(ht.size()).toBe(2)
    })

    it('removes head of chain', () => {
      const ht = new ChainedHash2<number>(1)
      ht.put('a', 1)
      ht.put('b', 2)
      expect(ht.remove('b')).toBe(true)
      expect(ht.get('a')).toBe(1)
      expect(ht.get('b')).toBeUndefined()
    })
  })

  describe('contains', () => {
    it('returns true for existing key', () => {
      const ht = new ChainedHash2<string>()
      ht.put('key', 'value')
      expect(ht.contains('key')).toBe(true)
    })

    it('returns false for missing key', () => {
      const ht = new ChainedHash2<string>()
      expect(ht.contains('key')).toBe(false)
    })
  })

  describe('keys, values, entries', () => {
    it('returns all keys', () => {
      const ht = new ChainedHash2<number>()
      ht.put('a', 1)
      ht.put('b', 2)
      ht.put('c', 3)
      expect(ht.keys().sort()).toEqual(['a', 'b', 'c'])
    })

    it('returns all values', () => {
      const ht = new ChainedHash2<number>()
      ht.put('a', 1)
      ht.put('b', 2)
      expect(ht.values().sort()).toEqual([1, 2])
    })

    it('returns all entries', () => {
      const ht = new ChainedHash2<number>()
      ht.put('x', 10)
      ht.put('y', 20)
      const entries = ht.entries()
      expect(entries).toHaveLength(2)
      expect(entries.sort((a, b) => a[1] - b[1])).toEqual([
        ['x', 10],
        ['y', 20],
      ])
    })

    it('returns empty arrays for empty table', () => {
      const ht = new ChainedHash2<number>()
      expect(ht.keys()).toEqual([])
      expect(ht.values()).toEqual([])
      expect(ht.entries()).toEqual([])
    })
  })

  describe('clear', () => {
    it('removes all entries', () => {
      const ht = new ChainedHash2<number>()
      ht.put('a', 1)
      ht.put('b', 2)
      ht.clear()
      expect(ht.size()).toBe(0)
      expect(ht.isEmpty()).toBe(true)
      expect(ht.get('a')).toBeUndefined()
    })
  })

  describe('loadFactor', () => {
    it('returns 0 for empty table', () => {
      const ht = new ChainedHash2<number>(4)
      expect(ht.loadFactor()).toBe(0)
    })

    it('returns correct load factor', () => {
      const ht = new ChainedHash2<number>(4)
      ht.put('a', 1)
      expect(ht.loadFactor()).toBe(0.25)
    })
  })

  describe('getBucketSizes', () => {
    it('returns all zeros for empty table', () => {
      const ht = new ChainedHash2<number>(4)
      expect(ht.getBucketSizes()).toEqual([0, 0, 0, 0])
    })

    it('returns bucket sizes after insertions', () => {
      const ht = new ChainedHash2<number>(4)
      ht.put('a', 1)
      ht.put('b', 2)
      const sizes = ht.getBucketSizes()
      const total = sizes.reduce((s, n) => s + n, 0)
      expect(total).toBe(2)
      expect(sizes).toHaveLength(4)
    })
  })

  describe('forEach', () => {
    it('iterates over all entries', () => {
      const ht = new ChainedHash2<number>()
      ht.put('a', 1)
      ht.put('b', 2)
      ht.put('c', 3)
      const result: Record<string, number> = {}
      ht.forEach((key, value) => {
        result[key] = value
      })
      expect(result).toEqual({ a: 1, b: 2, c: 3 })
    })

    it('does not call callback for empty table', () => {
      const ht = new ChainedHash2<number>()
      let called = false
      ht.forEach(() => {
        called = true
      })
      expect(called).toBe(false)
    })
  })
})
