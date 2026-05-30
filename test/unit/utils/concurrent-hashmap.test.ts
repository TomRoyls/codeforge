import { describe, it, expect } from 'vitest'
import { ConcurrentHashMap } from '../../../src/utils/concurrent-hashmap.js'

describe('ConcurrentHashMap', () => {
  describe('construction', () => {
    it('creates with default stripes', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('creates with custom stripe count', () => {
      const map = new ConcurrentHashMap<string, number>({ stripes: 4 })
      expect(map.stripeCount_).toBe(4)
    })

    it('creates with custom hash', () => {
      const map = new ConcurrentHashMap<number, string>({
        hash: (k) => k % 4,
        stripes: 4,
      })
      map.set(1, 'a')
      map.set(5, 'b')
      expect(map.get(1)).toBe('a')
      expect(map.get(5)).toBe('b')
    })
  })

  describe('set and get', () => {
    it('stores and retrieves values', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
    })

    it('returns undefined for missing keys', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.get('missing')).toBeUndefined()
    })

    it('overwrites existing values', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('a', 2)
      expect(map.get('a')).toBe(2)
      expect(map.size).toBe(1)
    })
  })

  describe('has', () => {
    it('returns true for existing', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      expect(map.has('a')).toBe(true)
    })

    it('returns false for missing', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.has('a')).toBe(false)
    })
  })

  describe('delete', () => {
    it('deletes existing key', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      expect(map.delete('a')).toBe(true)
      expect(map.has('a')).toBe(false)
      expect(map.size).toBe(0)
    })

    it('returns false for missing', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.delete('a')).toBe(false)
    })
  })

  describe('size tracking', () => {
    it('tracks size across stripes', () => {
      const map = new ConcurrentHashMap<number, string>({ stripes: 4 })
      for (let i = 0; i < 20; i++) {
        map.set(i, `val${i}`)
      }
      expect(map.size).toBe(20)
    })
  })

  describe('clear', () => {
    it('clears all stripes', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })
  })

  describe('getOrDefault', () => {
    it('returns existing value', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      expect(map.getOrDefault('a', 99)).toBe(1)
    })

    it('sets and returns default for missing', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.getOrDefault('a', 42)).toBe(42)
      expect(map.get('a')).toBe(42)
    })
  })

  describe('computeIfAbsent', () => {
    it('returns existing without calling factory', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      let factoryCalled = false
      expect(map.computeIfAbsent('a', () => { factoryCalled = true; return 99 })).toBe(1)
      expect(factoryCalled).toBe(false)
    })

    it('computes and stores new value', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.computeIfAbsent('a', (k) => k.length)).toBe(1)
      expect(map.get('a')).toBe(1)
    })
  })

  describe('compute', () => {
    it('updates existing value', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.compute('a', (_k, v) => (v ?? 0) * 2)
      expect(map.get('a')).toBe(2)
    })

    it('removes when remapper returns undefined', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.compute('a', () => undefined)
      expect(map.has('a')).toBe(false)
    })

    it('adds when key missing', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.compute('a', () => 42)
      expect(map.get('a')).toBe(42)
    })
  })

  describe('merge', () => {
    it('adds when key missing', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.merge('a', 10, (e, n) => e + n)).toBe(10)
    })

    it('merges with existing', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 5)
      expect(map.merge('a', 10, (e, n) => e + n)).toBe(15)
    })
  })

  describe('keys/values/entries', () => {
    it('returns all keys', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const keys = map.keys()
      expect(keys).toHaveLength(3)
      expect(keys).toContain('a')
    })

    it('returns all values', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const vals = map.values()
      expect(vals).toHaveLength(2)
      expect(vals).toContain(1)
      expect(vals).toContain(2)
    })

    it('returns all entries', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const entries = map.entries()
      expect(entries).toHaveLength(2)
    })
  })

  describe('forEach', () => {
    it('iterates all entries', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const result: Array<[string, number]> = []
      map.forEach((v, k) => result.push([k, v]))
      expect(result).toHaveLength(2)
    })
  })

  describe('toMap', () => {
    it('converts to plain Map', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const plain = map.toMap()
      expect(plain).toBeInstanceOf(Map)
      expect(plain.size).toBe(2)
    })
  })

  describe('distribution', () => {
    it('distributes keys across stripes', () => {
      const map = new ConcurrentHashMap<number, string>({ stripes: 4 })
      for (let i = 0; i < 100; i++) {
        map.set(i, `v${i}`)
      }
      const sizes = map.stripeSizes
      const nonEmpty = sizes.filter((s) => s > 0).length
      expect(nonEmpty).toBeGreaterThan(1)
    })
  })

  describe('large map', () => {
    it('handles 1000 entries', () => {
      const map = new ConcurrentHashMap<number, string>()
      for (let i = 0; i < 1000; i++) {
        map.set(i, `val${i}`)
      }
      expect(map.size).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(map.get(i)).toBe(`val${i}`)
      }
    })

    it('handles mixed operations', () => {
      const map = new ConcurrentHashMap<number, number>()
      for (let i = 0; i < 500; i++) map.set(i, i)
      for (let i = 0; i < 250; i++) map.delete(i)
      for (let i = 500; i < 750; i++) map.set(i, i)
      expect(map.size).toBe(500)
    })
  })

  describe('number keys', () => {
    it('works with number keys', () => {
      const map = new ConcurrentHashMap<number, string>()
      map.set(42, 'answer')
      expect(map.get(42)).toBe('answer')
    })
  })

  describe('object values', () => {
    it('works with object values', () => {
      const map = new ConcurrentHashMap<string, { x: number }>()
      map.set('a', { x: 1 })
      expect(map.get('a')!.x).toBe(1)
    })
  })
})
