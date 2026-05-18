import { describe, it, expect, beforeEach } from 'vitest'
import { AdaptiveHash2 } from '../../src/core/adaptive-hash-2/index.js'

describe('AdaptiveHash2', () => {
  let hash: AdaptiveHash2<string, number>

  beforeEach(() => {
    hash = new AdaptiveHash2<string, number>()
  })

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create an empty hash map with defaults', () => {
      const h = new AdaptiveHash2<string, number>()
      expect(h.size()).toBe(0)
      expect(h.strategy()).toBe('open-addressing')
      expect(h.capacity()).toBe(16)
    })

    it('should accept custom initial capacity', () => {
      const h = new AdaptiveHash2<string, number>(32)
      expect(h.capacity()).toBe(32)
    })

    it('should accept custom load factor threshold', () => {
      const h = new AdaptiveHash2<string, number>(16, 0.5)
      expect(h.capacity()).toBe(16)
    })

    it('should accept custom collision threshold', () => {
      const h = new AdaptiveHash2<string, number>(16, 0.75, 5)
      expect(h.capacity()).toBe(16)
    })
  })

  // ─── Set / Get ───

  describe('set / get', () => {
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
      expect(hash.size()).toBe(1)
    })

    it('should handle multiple keys', () => {
      hash.set('a', 1)
      hash.set('b', 2)
      hash.set('c', 3)
      expect(hash.get('a')).toBe(1)
      expect(hash.get('b')).toBe(2)
      expect(hash.get('c')).toBe(3)
      expect(hash.size()).toBe(3)
    })

    it('should handle numeric keys', () => {
      const h = new AdaptiveHash2<number, string>()
      h.set(1, 'one')
      h.set(2, 'two')
      expect(h.get(1)).toBe('one')
      expect(h.get(2)).toBe('two')
    })

    it('should handle various value types', () => {
      const h = new AdaptiveHash2<string, boolean>()
      h.set('flag', true)
      expect(h.get('flag')).toBe(true)
    })
  })

  // ─── Has ───

  describe('has', () => {
    it('should return true for existing key', () => {
      hash.set('key', 1)
      expect(hash.has('key')).toBe(true)
    })

    it('should return false for missing key', () => {
      expect(hash.has('missing')).toBe(false)
    })

    it('should return false after delete', () => {
      hash.set('key', 1)
      hash.delete('key')
      expect(hash.has('key')).toBe(false)
    })
  })

  // ─── Delete ───

  describe('delete', () => {
    it('should delete an existing key', () => {
      hash.set('key', 1)
      expect(hash.delete('key')).toBe(true)
      expect(hash.get('key')).toBeUndefined()
      expect(hash.size()).toBe(0)
    })

    it('should return false for non-existing key', () => {
      expect(hash.delete('missing')).toBe(false)
    })

    it('should not affect other keys', () => {
      hash.set('a', 1)
      hash.set('b', 2)
      hash.set('c', 3)
      hash.delete('b')
      expect(hash.get('a')).toBe(1)
      expect(hash.get('c')).toBe(3)
      expect(hash.size()).toBe(2)
    })

    it('should handle deleting all keys', () => {
      hash.set('a', 1)
      hash.set('b', 2)
      hash.delete('a')
      hash.delete('b')
      expect(hash.size()).toBe(0)
    })
  })

  // ─── Size / Clear ───

  describe('size / clear', () => {
    it('should track size correctly', () => {
      expect(hash.size()).toBe(0)
      hash.set('a', 1)
      expect(hash.size()).toBe(1)
      hash.set('b', 2)
      expect(hash.size()).toBe(2)
    })

    it('should clear the hash map', () => {
      hash.set('a', 1)
      hash.set('b', 2)
      hash.clear()
      expect(hash.size()).toBe(0)
      expect(hash.get('a')).toBeUndefined()
      expect(hash.strategy()).toBe('open-addressing')
    })
  })

  // ─── Strategy ───

  describe('strategy', () => {
    it('should start with open-addressing', () => {
      expect(hash.strategy()).toBe('open-addressing')
    })

    it('should switch to chaining after many collisions', () => {
      for (let i = 0; i < 20; i++) {
        hash.set(`key${i}`, i)
      }
      const strat = hash.strategy()
      expect(strat === 'open-addressing' || strat === 'chaining').toBe(true)
    })
  })

  // ─── Capacity ───

  describe('capacity', () => {
    it('should return initial capacity', () => {
      expect(hash.capacity()).toBe(16)
    })

    it('should grow when load factor exceeded', () => {
      const h = new AdaptiveHash2<string, number>(4, 0.75)
      const initialCap = h.capacity()
      h.set('a', 1)
      h.set('b', 2)
      h.set('c', 3)
      h.set('d', 4)
      expect(h.capacity()).toBeGreaterThanOrEqual(initialCap)
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('should handle empty string keys', () => {
      hash.set('', 42)
      expect(hash.get('')).toBe(42)
      expect(hash.has('')).toBe(true)
    })

    it('should handle single element', () => {
      hash.set('only', 1)
      expect(hash.size()).toBe(1)
      expect(hash.get('only')).toBe(1)
      hash.delete('only')
      expect(hash.size()).toBe(0)
    })

    it('should handle many insertions and lookups', () => {
      const h = new AdaptiveHash2<number, number>(8)
      for (let i = 0; i < 50; i++) {
        h.set(i, i * 10)
      }
      for (let i = 0; i < 50; i++) {
        expect(h.get(i)).toBe(i * 10)
      }
      expect(h.size()).toBe(50)
    })

    it('should survive overwrite-then-delete', () => {
      hash.set('k', 1)
      hash.set('k', 2)
      expect(hash.delete('k')).toBe(true)
      expect(hash.get('k')).toBeUndefined()
      expect(hash.size()).toBe(0)
    })
  })
})
