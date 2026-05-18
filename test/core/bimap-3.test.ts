import { describe, it, expect } from 'vitest'
import { BiMap3 } from '../../src/core/bimap-3/index.js'

// ─── Constructor ───

describe('BiMap3', () => {
  describe('constructor', () => {
    it('creates an empty bimap', () => {
      const map = new BiMap3<string, number>()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })
  })

  // ─── Set ───

  describe('set', () => {
    it('sets a key-value pair', () => {
      const map = new BiMap3<string, number>()
      map.set('a', 1)
      expect(map.get('a')).toBe(1)
      expect(map.getKey(1)).toBe('a')
      expect(map.size).toBe(1)
    })

    it('sets multiple key-value pairs', () => {
      const map = new BiMap3<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.size).toBe(3)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
    })

    it('overwrites existing key with new value', () => {
      const map = new BiMap3<string, number>()
      map.set('a', 1)
      map.set('a', 2)
      expect(map.get('a')).toBe(2)
      expect(map.getKey(1)).toBeUndefined()
      expect(map.getKey(2)).toBe('a')
      expect(map.size).toBe(1)
    })

    it('overwrites existing value by ejecting old key', () => {
      const map = new BiMap3<string, number>()
      map.set('a', 1)
      map.set('b', 1)
      expect(map.get('a')).toBeUndefined()
      expect(map.get('b')).toBe(1)
      expect(map.getKey(1)).toBe('b')
      expect(map.size).toBe(1)
    })

    it('handles same key with same value (idempotent)', () => {
      const map = new BiMap3<string, number>()
      map.set('a', 1)
      map.set('a', 1)
      expect(map.size).toBe(1)
      expect(map.get('a')).toBe(1)
      expect(map.getKey(1)).toBe('a')
    })
  })

  // ─── Get / GetKey ───

  describe('get', () => {
    it('returns undefined for non-existent key', () => {
      const map = new BiMap3<string, number>()
      expect(map.get('missing')).toBeUndefined()
    })

    it('returns undefined on empty map', () => {
      const map = new BiMap3<string, number>()
      expect(map.get('a')).toBeUndefined()
    })

    it('retrieves value by key', () => {
      const map = new BiMap3<string, number>()
      map.set('x', 42)
      expect(map.get('x')).toBe(42)
    })
  })

  describe('getKey', () => {
    it('returns undefined for non-existent value', () => {
      const map = new BiMap3<string, number>()
      map.set('a', 1)
      expect(map.getKey(99)).toBeUndefined()
    })

    it('returns undefined on empty map', () => {
      const map = new BiMap3<string, number>()
      expect(map.getKey(1)).toBeUndefined()
    })

    it('retrieves key by value', () => {
      const map = new BiMap3<string, number>()
      map.set('x', 42)
      expect(map.getKey(42)).toBe('x')
    })
  })

  // ─── Has / HasValue ───

  describe('has', () => {
    it('returns true for existing key', () => {
      const map = new BiMap3<string, number>()
      map.set('a', 1)
      expect(map.has('a')).toBe(true)
    })

    it('returns false for non-existent key', () => {
      const map = new BiMap3<string, number>()
      expect(map.has('a')).toBe(false)
    })

    it('returns false after deletion', () => {
      const map = new BiMap3<string, number>()
      map.set('a', 1)
      map.delete('a')
      expect(map.has('a')).toBe(false)
    })
  })

  describe('hasValue', () => {
    it('returns true for existing value', () => {
      const map = new BiMap3<string, number>()
      map.set('a', 1)
      expect(map.hasValue(1)).toBe(true)
    })

    it('returns false for non-existent value', () => {
      const map = new BiMap3<string, number>()
      expect(map.hasValue(1)).toBe(false)
    })

    it('returns false after key overwrite removes old value', () => {
      const map = new BiMap3<string, number>()
      map.set('a', 1)
      map.set('a', 2)
      expect(map.hasValue(1)).toBe(false)
      expect(map.hasValue(2)).toBe(true)
    })
  })

  // ─── Delete / DeleteValue ───

  describe('delete', () => {
    it('deletes an existing key and returns true', () => {
      const map = new BiMap3<string, number>()
      map.set('a', 1)
      expect(map.delete('a')).toBe(true)
      expect(map.size).toBe(0)
      expect(map.get('a')).toBeUndefined()
      expect(map.getKey(1)).toBeUndefined()
    })

    it('returns false for non-existent key', () => {
      const map = new BiMap3<string, number>()
      expect(map.delete('missing')).toBe(false)
    })

    it('returns false on empty map', () => {
      const map = new BiMap3<string, number>()
      expect(map.delete('a')).toBe(false)
    })

    it('deletes multiple entries one by one', () => {
      const map = new BiMap3<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.delete('b')
      expect(map.size).toBe(2)
      expect(map.has('b')).toBe(false)
      expect(map.hasValue(2)).toBe(false)
      expect(map.has('a')).toBe(true)
      expect(map.has('c')).toBe(true)
    })
  })

  describe('deleteValue', () => {
    it('deletes by value and returns true', () => {
      const map = new BiMap3<string, number>()
      map.set('a', 1)
      expect(map.deleteValue(1)).toBe(true)
      expect(map.size).toBe(0)
      expect(map.get('a')).toBeUndefined()
      expect(map.getKey(1)).toBeUndefined()
    })

    it('returns false for non-existent value', () => {
      const map = new BiMap3<string, number>()
      expect(map.deleteValue(99)).toBe(false)
    })

    it('returns false on empty map', () => {
      const map = new BiMap3<string, number>()
      expect(map.deleteValue(1)).toBe(false)
    })
  })

  // ─── Size / isEmpty / clear ───

  describe('size', () => {
    it('tracks size correctly', () => {
      const map = new BiMap3<string, number>()
      expect(map.size).toBe(0)
      map.set('a', 1)
      expect(map.size).toBe(1)
      map.set('b', 2)
      expect(map.size).toBe(2)
      map.delete('a')
      expect(map.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('returns true when empty', () => {
      const map = new BiMap3<string, number>()
      expect(map.isEmpty()).toBe(true)
    })

    it('returns false when not empty', () => {
      const map = new BiMap3<string, number>()
      map.set('a', 1)
      expect(map.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('removes all entries', () => {
      const map = new BiMap3<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
      expect(map.get('a')).toBeUndefined()
      expect(map.getKey(1)).toBeUndefined()
    })
  })

  // ─── Keys / Values / Entries ───

  describe('keys', () => {
    it('returns empty array for empty map', () => {
      const map = new BiMap3<string, number>()
      expect(map.keys()).toEqual([])
    })

    it('returns all keys', () => {
      const map = new BiMap3<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.keys().sort()).toEqual(['a', 'b', 'c'])
    })
  })

  describe('values', () => {
    it('returns empty array for empty map', () => {
      const map = new BiMap3<string, number>()
      expect(map.values()).toEqual([])
    })

    it('returns all values', () => {
      const map = new BiMap3<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.values().sort()).toEqual([1, 2, 3])
    })
  })

  describe('entries', () => {
    it('returns empty array for empty map', () => {
      const map = new BiMap3<string, number>()
      expect(map.entries()).toEqual([])
    })

    it('returns all key-value pairs', () => {
      const map = new BiMap3<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const entries = map.entries()
      expect(entries.length).toBe(2)
      expect(entries).toContainEqual(['a', 1])
      expect(entries).toContainEqual(['b', 2])
    })
  })

  // ─── forEach ───

  describe('forEach', () => {
    it('does nothing on empty map', () => {
      const map = new BiMap3<string, number>()
      const collected: [string, number][] = []
      map.forEach((k, v) => collected.push([k, v]))
      expect(collected).toEqual([])
    })

    it('iterates all entries', () => {
      const map = new BiMap3<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const collected: [string, number][] = []
      map.forEach((k, v) => collected.push([k, v]))
      expect(collected.length).toBe(3)
      expect(collected).toContainEqual(['a', 1])
      expect(collected).toContainEqual(['b', 2])
      expect(collected).toContainEqual(['c', 3])
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles number-keyed bimap', () => {
      const map = new BiMap3<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      expect(map.get(1)).toBe('one')
      expect(map.getKey('two')).toBe(2)
    })

    it('maintains bidirectional integrity after many operations', () => {
      const map = new BiMap3<number, string>()
      for (let i = 0; i < 20; i++) {
        map.set(i, `val-${i}`)
      }
      expect(map.size).toBe(20)
      for (let i = 0; i < 20; i++) {
        expect(map.get(i)).toBe(`val-${i}`)
        expect(map.getKey(`val-${i}`)).toBe(i)
      }
      for (let i = 0; i < 20; i++) {
        map.delete(i)
      }
      expect(map.isEmpty()).toBe(true)
    })

    it('handles value collision replacing old key', () => {
      const map = new BiMap3<string, number>()
      map.set('first', 10)
      map.set('second', 10)
      expect(map.get('first')).toBeUndefined()
      expect(map.get('second')).toBe(10)
      expect(map.size).toBe(1)
    })

    it('handles key overwrite with different value cleans up old value reverse', () => {
      const map = new BiMap3<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('a', 3)
      expect(map.get('a')).toBe(3)
      expect(map.getKey(1)).toBeUndefined()
      expect(map.getKey(3)).toBe('a')
      expect(map.size).toBe(2)
    })
  })
})
