import { describe, it, expect } from 'vitest'
import { CuckooHashMap } from '../../../src/utils/cuckoo-hash-map.js'

describe('CuckooHashMap', () => {
  describe('construction', () => {
    it('creates empty map with defaults', () => {
      const map = new CuckooHashMap<string, number>()
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('creates with custom capacity', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 16 })
      expect(map.size).toBe(0)
      expect(map.loadFactor).toBe(0)
    })
  })

  describe('set and get', () => {
    it('sets and gets a value', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      expect(map.get('a')).toBe(1)
      expect(map.size).toBe(1)
    })

    it('returns undefined for missing key', () => {
      const map = new CuckooHashMap<string, number>()
      expect(map.get('missing')).toBeUndefined()
    })

    it('overwrites existing key', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('a', 2)
      expect(map.get('a')).toBe(2)
      expect(map.size).toBe(1)
    })

    it('handles many entries', () => {
      const map = new CuckooHashMap<number, string>({ capacity: 32 })
      for (let i = 0; i < 100; i++) {
        map.set(i, `val${i}`)
      }
      expect(map.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(map.get(i)).toBe(`val${i}`)
      }
    })

    it('handles string keys', () => {
      const map = new CuckooHashMap<string, number>()
      const keys = ['hello', 'world', 'foo', 'bar', 'baz']
      keys.forEach((k, i) => map.set(k, i))
      keys.forEach((k, i) => expect(map.get(k)).toBe(i))
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      expect(map.has('a')).toBe(true)
    })

    it('returns false for missing key', () => {
      const map = new CuckooHashMap<string, number>()
      expect(map.has('a')).toBe(false)
    })
  })

  describe('delete', () => {
    it('deletes a key', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      expect(map.delete('a')).toBe(true)
      expect(map.get('a')).toBeUndefined()
      expect(map.size).toBe(0)
    })

    it('returns false for missing key', () => {
      const map = new CuckooHashMap<string, number>()
      expect(map.delete('missing')).toBe(false)
    })

    it('delete does not affect other entries', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.delete('b')
      expect(map.get('a')).toBe(1)
      expect(map.get('c')).toBe(3)
      expect(map.size).toBe(2)
    })
  })

  describe('clear', () => {
    it('clears all entries', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
      expect(map.get('a')).toBeUndefined()
    })
  })

  describe('loadFactor', () => {
    it('computes load factor', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 32 })
      expect(map.loadFactor).toBe(0)
      map.set('a', 1)
      expect(map.loadFactor).toBeGreaterThan(0)
      expect(map.loadFactor).toBeLessThan(1)
    })
  })

  describe('iteration', () => {
    it('forEach visits all entries', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const collected: Array<[string, number]> = []
      map.forEach((v, k) => collected.push([k, v]))
      expect(collected.length).toBe(3)
      expect(collected.sort()).toEqual([['a', 1], ['b', 2], ['c', 3]])
    })

    it('keys returns all keys', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      expect(map.keys().sort()).toEqual(['a', 'b'])
    })

    it('values returns all values', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      expect(map.values().sort()).toEqual([1, 2])
    })

    it('entries returns all pairs', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      expect(map.entries().sort()).toEqual([['a', 1], ['b', 2]])
    })
  })

  describe('resize', () => {
    it('handles resize when filling up', () => {
      const map = new CuckooHashMap<number, number>({ capacity: 8 })
      for (let i = 0; i < 50; i++) {
        map.set(i, i * 10)
      }
      expect(map.size).toBe(50)
      for (let i = 0; i < 50; i++) {
        expect(map.get(i)).toBe(i * 10)
      }
    })
  })

  describe('stress test', () => {
    it('handles mixed operations', () => {
      const map = new CuckooHashMap<number, string>({ capacity: 16 })
      for (let i = 0; i < 50; i++) map.set(i, `v${i}`)
      for (let i = 0; i < 25; i++) map.delete(i)
      expect(map.size).toBe(25)
      for (let i = 25; i < 50; i++) {
        expect(map.get(i)).toBe(`v${i}`)
      }
      for (let i = 50; i < 75; i++) map.set(i, `v${i}`)
      expect(map.size).toBe(50)
    })
  })
})
