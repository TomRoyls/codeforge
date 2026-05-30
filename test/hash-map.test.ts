import { describe, it, expect } from 'vitest'
import { HashMap } from '../src/utils/hash-map.js'

describe('HashMap', () => {
  describe('constructor', () => {
    it('creates empty map with default capacity', () => {
      const map = new HashMap<string, number>()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
      expect(map.capacity).toBe(16)
    })

    it('accepts custom capacity and load factor', () => {
      const map = new HashMap<string, number>(4, 0.5)
      expect(map.capacity).toBe(4)
    })
  })

  describe('set and get', () => {
    it('sets and gets a value', () => {
      const map = new HashMap<string, number>()
      map.set('key', 42)
      expect(map.get('key')).toBe(42)
    })

    it('overwrites existing key', () => {
      const map = new HashMap<string, number>()
      map.set('key', 1)
      map.set('key', 2)
      expect(map.get('key')).toBe(2)
      expect(map.size).toBe(1)
    })

    it('returns undefined for missing key', () => {
      expect(new HashMap<string, number>().get('missing')).toBeUndefined()
    })

    it('handles multiple keys', () => {
      const map = new HashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
      expect(map.size).toBe(3)
    })

    it('handles number keys', () => {
      const map = new HashMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      expect(map.get(1)).toBe('one')
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      const map = new HashMap<string, number>()
      map.set('key', 1)
      expect(map.has('key')).toBe(true)
    })

    it('returns false for missing key', () => {
      expect(new HashMap<string, number>().has('key')).toBe(false)
    })
  })

  describe('delete', () => {
    it('deletes a key', () => {
      const map = new HashMap<string, number>()
      map.set('key', 1)
      expect(map.delete('key')).toBe(true)
      expect(map.get('key')).toBeUndefined()
      expect(map.size).toBe(0)
    })

    it('returns false for missing key', () => {
      expect(new HashMap<string, number>().delete('key')).toBe(false)
    })

    it('can re-insert after delete', () => {
      const map = new HashMap<string, number>(4)
      map.set('key', 1)
      map.delete('key')
      map.set('key', 2)
      expect(map.get('key')).toBe(2)
      expect(map.size).toBe(1)
    })
  })

  describe('resize', () => {
    it('resizes when load factor exceeded', () => {
      const map = new HashMap<string, number>(4)
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.capacity).toBeGreaterThan(4)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
    })
  })

  describe('keys / values / entries', () => {
    it('returns all keys', () => {
      const map = new HashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      expect(map.keys().sort()).toEqual(['a', 'b'])
    })

    it('returns all values', () => {
      const map = new HashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      expect(map.values().sort()).toEqual([1, 2])
    })

    it('returns all entries', () => {
      const map = new HashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      expect(map.entries().length).toBe(2)
    })
  })

  describe('forEach', () => {
    it('iterates over entries', () => {
      const map = new HashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const result: [string, number][] = []
      map.forEach((v, k) => result.push([k, v]))
      expect(result.length).toBe(2)
    })
  })

  describe('clear', () => {
    it('clears all entries', () => {
      const map = new HashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.clear()
      expect(map.isEmpty()).toBe(true)
      expect(map.size).toBe(0)
    })
  })

  describe('loadFactor', () => {
    it('computes load factor', () => {
      const map = new HashMap<string, number>(4)
      expect(map.loadFactor).toBe(0)
      map.set('a', 1)
      expect(map.loadFactor).toBeGreaterThan(0)
    })
  })

  describe('stress test', () => {
    it('handles many insertions and deletions', () => {
      const map = new HashMap<number, number>(8)
      for (let i = 0; i < 100; i++) {
        map.set(i, i * 10)
      }
      expect(map.size).toBe(100)
      for (let i = 0; i < 50; i++) {
        map.delete(i)
      }
      expect(map.size).toBe(50)
      for (let i = 50; i < 100; i++) {
        expect(map.get(i)).toBe(i * 10)
      }
    })
  })
})
