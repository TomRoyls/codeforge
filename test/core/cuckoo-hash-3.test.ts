import { describe, it, expect } from 'vitest'
import { CuckooHash3 } from '../../src/core/cuckoo-hash-3/index.js'

// ─── Constructor ───

describe('CuckooHash3', () => {
  describe('constructor', () => {
    it('should create a hash table with default capacity', () => {
      const table = new CuckooHash3<string, number>()
      expect(table.size).toBe(0)
    })

    it('should create a hash table with custom capacity', () => {
      const table = new CuckooHash3<string, number>(32)
      expect(table.size).toBe(0)
    })

    it('should round capacity up to next power of two', () => {
      const table = new CuckooHash3<string, number>(5)
      table.set('a', 1)
      expect(table.size).toBe(1)
    })
  })

  // ─── set / get ───

  describe('set and get', () => {
    it('should store and retrieve a value', () => {
      const table = new CuckooHash3<string, number>()
      table.set('key', 42)
      expect(table.get('key')).toBe(42)
    })

    it('should return undefined for missing key', () => {
      const table = new CuckooHash3<string, number>()
      expect(table.get('missing')).toBeUndefined()
    })

    it('should update an existing key', () => {
      const table = new CuckooHash3<string, number>()
      table.set('key', 1)
      table.set('key', 2)
      expect(table.get('key')).toBe(2)
      expect(table.size).toBe(1)
    })

    it('should handle multiple keys', () => {
      const table = new CuckooHash3<string, number>(32)
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
      expect(table.get('a')).toBe(1)
      expect(table.get('b')).toBe(2)
      expect(table.get('c')).toBe(3)
      expect(table.size).toBe(3)
    })

    it('should handle number keys', () => {
      const table = new CuckooHash3<number, string>()
      table.set(1, 'one')
      table.set(2, 'two')
      expect(table.get(1)).toBe('one')
      expect(table.get(2)).toBe('two')
    })
  })

  // ─── has ───

  describe('has', () => {
    it('should return true for existing key', () => {
      const table = new CuckooHash3<string, number>()
      table.set('key', 1)
      expect(table.has('key')).toBe(true)
    })

    it('should return false for missing key', () => {
      const table = new CuckooHash3<string, number>()
      expect(table.has('key')).toBe(false)
    })

    it('should return false after deletion', () => {
      const table = new CuckooHash3<string, number>()
      table.set('key', 1)
      table.delete('key')
      expect(table.has('key')).toBe(false)
    })
  })

  // ─── delete ───

  describe('delete', () => {
    it('should delete an existing key', () => {
      const table = new CuckooHash3<string, number>()
      table.set('key', 1)
      expect(table.delete('key')).toBe(true)
      expect(table.get('key')).toBeUndefined()
      expect(table.size).toBe(0)
    })

    it('should return false for missing key', () => {
      const table = new CuckooHash3<string, number>()
      expect(table.delete('nope')).toBe(false)
    })

    it('should not affect other keys', () => {
      const table = new CuckooHash3<string, number>(32)
      table.set('a', 1)
      table.set('b', 2)
      table.delete('a')
      expect(table.get('b')).toBe(2)
      expect(table.size).toBe(1)
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('should remove all entries', () => {
      const table = new CuckooHash3<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      table.clear()
      expect(table.size).toBe(0)
      expect(table.get('a')).toBeUndefined()
    })

    it('should allow new insertions after clear', () => {
      const table = new CuckooHash3<string, number>()
      table.set('a', 1)
      table.clear()
      table.set('b', 2)
      expect(table.get('b')).toBe(2)
    })
  })

  // ─── loadFactor ───

  describe('loadFactor', () => {
    it('should be 0 when empty', () => {
      const table = new CuckooHash3<string, number>()
      expect(table.loadFactor()).toBe(0)
    })

    it('should increase with insertions', () => {
      const table = new CuckooHash3<string, number>(4)
      table.set('a', 1)
      expect(table.loadFactor()).toBeGreaterThan(0)
    })
  })

  // ─── size ───

  describe('size', () => {
    it('should track size correctly', () => {
      const table = new CuckooHash3<string, number>(16)
      expect(table.size).toBe(0)
      table.set('a', 1)
      expect(table.size).toBe(1)
      table.set('b', 2)
      expect(table.size).toBe(2)
      table.delete('a')
      expect(table.size).toBe(1)
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('should handle empty string key', () => {
      const table = new CuckooHash3<string, number>()
      table.set('', 0)
      expect(table.get('')).toBe(0)
    })

    it('should handle object-like string keys', () => {
      const table = new CuckooHash3<string, number>()
      table.set('[object]', 1)
      table.set('null', 2)
      expect(table.get('[object]')).toBe(1)
      expect(table.get('null')).toBe(2)
    })

    it('should handle many insertions', () => {
      const table = new CuckooHash3<string, number>(64)
      for (let i = 0; i < 30; i++) {
        table.set(`key-${i}`, i)
      }
      for (let i = 0; i < 30; i++) {
        expect(table.get(`key-${i}`)).toBe(i)
      }
      expect(table.size).toBe(30)
    })

    it('should handle duplicate set operations', () => {
      const table = new CuckooHash3<string, number>(16)
      for (let i = 0; i < 10; i++) {
        table.set('same-key', i)
      }
      expect(table.size).toBe(1)
      expect(table.get('same-key')).toBe(9)
    })
  })
})
