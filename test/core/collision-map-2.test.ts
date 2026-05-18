import { describe, it, expect } from 'vitest'
import { CollisionMap2 } from '../../src/core/collision-map-2/index.js'

describe('CollisionMap2', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates map with default bucket count', () => {
      const map = new CollisionMap2<number>()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('creates map with custom bucket count', () => {
      const map = new CollisionMap2<number>(4)
      expect(map.size).toBe(0)
    })

    it('creates map with bucket count of 1', () => {
      const map = new CollisionMap2<number>(1)
      map.set('a', 1)
      map.set('b', 2)
      expect(map.size).toBe(2)
      expect(map.collisionCount()).toBe(1)
    })
  })

  // ─── set() / get() ───
  describe('set and get', () => {
    it('sets and gets a value', () => {
      const map = new CollisionMap2<number>()
      map.set('key', 42)
      expect(map.get('key')).toBe(42)
    })

    it('returns undefined for missing key', () => {
      const map = new CollisionMap2<number>()
      expect(map.get('missing')).toBeUndefined()
    })

    it('overwrites existing key', () => {
      const map = new CollisionMap2<number>()
      map.set('key', 1)
      map.set('key', 2)
      expect(map.get('key')).toBe(2)
      expect(map.size).toBe(1)
    })

    it('handles multiple keys', () => {
      const map = new CollisionMap2<number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
    })

    it('handles empty string key', () => {
      const map = new CollisionMap2<number>()
      map.set('', 99)
      expect(map.get('')).toBe(99)
    })

    it('handles string values', () => {
      const map = new CollisionMap2<string>()
      map.set('greeting', 'hello')
      expect(map.get('greeting')).toBe('hello')
    })

    it('handles object values', () => {
      const map = new CollisionMap2<{ name: string }>()
      map.set('user', { name: 'Alice' })
      expect(map.get('user')!.name).toBe('Alice')
    })
  })

  // ─── has() ───
  describe('has', () => {
    it('returns true for existing key', () => {
      const map = new CollisionMap2<number>()
      map.set('key', 1)
      expect(map.has('key')).toBe(true)
    })

    it('returns false for missing key', () => {
      const map = new CollisionMap2<number>()
      expect(map.has('key')).toBe(false)
    })

    it('returns false after key is deleted', () => {
      const map = new CollisionMap2<number>()
      map.set('key', 1)
      map.delete('key')
      expect(map.has('key')).toBe(false)
    })
  })

  // ─── delete() ───
  describe('delete', () => {
    it('removes an existing key', () => {
      const map = new CollisionMap2<number>()
      map.set('key', 1)
      expect(map.delete('key')).toBe(true)
      expect(map.get('key')).toBeUndefined()
      expect(map.size).toBe(0)
    })

    it('returns false for missing key', () => {
      const map = new CollisionMap2<number>()
      expect(map.delete('missing')).toBe(false)
    })

    it('decreases size correctly', () => {
      const map = new CollisionMap2<number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.delete('b')
      expect(map.size).toBe(2)
      expect(map.get('a')).toBe(1)
      expect(map.get('c')).toBe(3)
    })
  })

  // ─── size / isEmpty() ───
  describe('size and isEmpty', () => {
    it('tracks size correctly', () => {
      const map = new CollisionMap2<number>()
      expect(map.size).toBe(0)
      map.set('a', 1)
      expect(map.size).toBe(1)
      map.set('b', 2)
      expect(map.size).toBe(2)
      map.delete('a')
      expect(map.size).toBe(1)
    })

    it('isEmpty reflects state', () => {
      const map = new CollisionMap2<number>()
      expect(map.isEmpty()).toBe(true)
      map.set('a', 1)
      expect(map.isEmpty()).toBe(false)
      map.delete('a')
      expect(map.isEmpty()).toBe(true)
    })
  })

  // ─── clear() ───
  describe('clear', () => {
    it('removes all entries', () => {
      const map = new CollisionMap2<number>()
      map.set('a', 1)
      map.set('b', 2)
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
      expect(map.collisionCount()).toBe(0)
    })

    it('is safe on empty map', () => {
      const map = new CollisionMap2<number>()
      map.clear()
      expect(map.size).toBe(0)
    })
  })

  // ─── keys() / values() / entries() ───
  describe('keys, values, entries', () => {
    it('returns all keys', () => {
      const map = new CollisionMap2<number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const keys = map.keys().sort()
      expect(keys).toEqual(['a', 'b', 'c'])
    })

    it('returns all values', () => {
      const map = new CollisionMap2<number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const values = map.values().sort()
      expect(values).toEqual([1, 2, 3])
    })

    it('returns all entries', () => {
      const map = new CollisionMap2<number>()
      map.set('a', 1)
      map.set('b', 2)
      const entries = map.entries().sort((a, b) => a[0].localeCompare(b[0]))
      expect(entries).toEqual([['a', 1], ['b', 2]])
    })

    it('returns empty arrays for empty map', () => {
      const map = new CollisionMap2<number>()
      expect(map.keys()).toEqual([])
      expect(map.values()).toEqual([])
      expect(map.entries()).toEqual([])
    })
  })

  // ─── collisionCount() ───
  describe('collisionCount', () => {
    it('returns 0 when no collisions', () => {
      const map = new CollisionMap2<number>(16)
      map.set('a', 1)
      expect(map.collisionCount()).toBe(0)
    })

    it('increments on collision', () => {
      const map = new CollisionMap2<number>(1)
      map.set('a', 1)
      expect(map.collisionCount()).toBe(0)
      map.set('b', 2)
      expect(map.collisionCount()).toBe(1)
      map.set('c', 3)
      expect(map.collisionCount()).toBe(2)
    })

    it('does not increment on overwrite', () => {
      const map = new CollisionMap2<number>(1)
      map.set('a', 1)
      map.set('a', 2)
      expect(map.collisionCount()).toBe(0)
    })
  })

  // ─── maxChainLength() ───
  describe('maxChainLength', () => {
    it('returns 0 for empty map', () => {
      const map = new CollisionMap2<number>()
      expect(map.maxChainLength()).toBe(0)
    })

    it('tracks maximum chain length', () => {
      const map = new CollisionMap2<number>(1)
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.maxChainLength()).toBe(3)
    })

    it('updates after delete', () => {
      const map = new CollisionMap2<number>(1)
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      expect(map.maxChainLength()).toBe(1)
    })
  })

  // ─── bucketUtilization() ───
  describe('bucketUtilization', () => {
    it('returns 0 for empty map', () => {
      const map = new CollisionMap2<number>(4)
      expect(map.bucketUtilization()).toBe(0)
    })

    it('returns fraction of used buckets', () => {
      const map = new CollisionMap2<number>(4)
      map.set('a', 1)
      expect(map.bucketUtilization()).toBeGreaterThan(0)
      expect(map.bucketUtilization()).toBeLessThanOrEqual(1)
    })
  })

  // ─── rehash() ───
  describe('rehash', () => {
    it('rehashes to new bucket count preserving data', () => {
      const map = new CollisionMap2<number>(1)
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const collisionsBefore = map.collisionCount()
      map.rehash(16)
      expect(map.size).toBe(3)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
      expect(map.collisionCount()).toBeLessThanOrEqual(collisionsBefore)
    })

    it('can rehash to smaller bucket count', () => {
      const map = new CollisionMap2<number>(16)
      map.set('a', 1)
      map.set('b', 2)
      map.rehash(2)
      expect(map.size).toBe(2)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
    })

    it('works on empty map', () => {
      const map = new CollisionMap2<number>(4)
      map.rehash(8)
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })
  })

  // ─── Edge cases ───
  describe('edge cases', () => {
    it('handles many entries', () => {
      const map = new CollisionMap2<number>(4)
      for (let i = 0; i < 100; i++) {
        map.set(`key${i}`, i)
      }
      expect(map.size).toBe(100)
      expect(map.get('key50')).toBe(50)
    })

    it('handles keys with special characters', () => {
      const map = new CollisionMap2<number>()
      map.set('hello world', 1)
      map.set('你好', 2)
      map.set('🔑', 3)
      expect(map.get('hello world')).toBe(1)
      expect(map.get('你好')).toBe(2)
      expect(map.get('🔑')).toBe(3)
    })
  })
})
