import { describe, it, expect, beforeEach } from 'vitest'
import { WeakHashMap2 } from '../../src/core/weak-hash-map-2/index.js'

describe('WeakHashMap2', () => {
  // ─── Primitive keys ───
  describe('primitive keys', () => {
    let map: WeakHashMap2<string, number>

    beforeEach(() => {
      map = new WeakHashMap2<string, number>()
    })

    it('sets and gets a string key', () => {
      map.set('a', 1)
      expect(map.get('a')).toBe(1)
    })

    it('returns undefined for missing key', () => {
      expect(map.get('missing')).toBeUndefined()
    })

    it('has returns true for existing key', () => {
      map.set('a', 1)
      expect(map.has('a')).toBe(true)
    })

    it('has returns false for missing key', () => {
      expect(map.has('missing')).toBe(false)
    })

    it('overwrites existing key', () => {
      map.set('a', 1)
      map.set('a', 99)
      expect(map.get('a')).toBe(99)
    })

    it('deletes existing key', () => {
      map.set('a', 1)
      expect(map.delete('a')).toBe(true)
      expect(map.has('a')).toBe(false)
    })

    it('delete returns false for missing key', () => {
      expect(map.delete('missing')).toBe(false)
    })

    it('tracks size correctly', () => {
      expect(map.size).toBe(0)
      map.set('a', 1)
      map.set('b', 2)
      expect(map.size).toBe(2)
      map.delete('a')
      expect(map.size).toBe(1)
    })
  })

  // ─── Number keys ───
  describe('number keys', () => {
    it('works with number keys', () => {
      const map = new WeakHashMap2<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      expect(map.get(1)).toBe('one')
      expect(map.get(2)).toBe('two')
    })
  })

  // ─── Object keys ───
  describe('object keys', () => {
    it('sets and gets with object keys', () => {
      const map = new WeakHashMap2<object, number>()
      const key = { id: 1 }
      map.set(key, 42)
      expect(map.get(key)).toBe(42)
    })

    it('different object instances are different keys', () => {
      const map = new WeakHashMap2<object, number>()
      const key1 = { id: 1 }
      const key2 = { id: 1 }
      map.set(key1, 100)
      map.set(key2, 200)
      expect(map.get(key1)).toBe(100)
      expect(map.get(key2)).toBe(200)
    })

    it('has returns true for existing object key', () => {
      const map = new WeakHashMap2<object, string>()
      const key = { name: 'test' }
      map.set(key, 'value')
      expect(map.has(key)).toBe(true)
    })

    it('has returns false for unknown object key', () => {
      const map = new WeakHashMap2<object, string>()
      const key = { name: 'test' }
      expect(map.has(key)).toBe(false)
    })

    it('deletes object key', () => {
      const map = new WeakHashMap2<object, number>()
      const key = { id: 1 }
      map.set(key, 42)
      expect(map.delete(key)).toBe(true)
      expect(map.has(key)).toBe(false)
    })

    it('overwrites value for same object key', () => {
      const map = new WeakHashMap2<object, number>()
      const key = { id: 1 }
      map.set(key, 1)
      map.set(key, 2)
      expect(map.get(key)).toBe(2)
    })
  })

  // ─── Mixed keys ───
  describe('mixed key types', () => {
    it('stores both primitive and object keys', () => {
      const map = new WeakHashMap2<string | object, number>()
      const objKey = { id: 1 }
      map.set('primitive', 10)
      map.set(objKey, 20)
      expect(map.get('primitive')).toBe(10)
      expect(map.get(objKey)).toBe(20)
    })

    it('size tracks both key types', () => {
      const map = new WeakHashMap2<string | object, number>()
      const objKey = { id: 1 }
      map.set('a', 1)
      map.set(objKey, 2)
      expect(map.size).toBe(2)
    })
  })

  // ─── clear ───
  describe('clear', () => {
    it('removes all entries', () => {
      const map = new WeakHashMap2<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.clear()
      expect(map.size).toBe(0)
      expect(map.has('a')).toBe(false)
    })

    it('clears object keys too', () => {
      const map = new WeakHashMap2<object, number>()
      const key = { id: 1 }
      map.set(key, 42)
      map.clear()
      expect(map.size).toBe(0)
      expect(map.has(key)).toBe(false)
    })

    it('allows reuse after clear', () => {
      const map = new WeakHashMap2<string, number>()
      map.set('a', 1)
      map.clear()
      map.set('b', 2)
      expect(map.get('b')).toBe(2)
      expect(map.size).toBe(1)
    })
  })

  // ─── Null / undefined keys ───
  describe('null and undefined keys', () => {
    it('works with null key', () => {
      const map = new WeakHashMap2<null, number>()
      map.set(null, 42)
      expect(map.get(null)).toBe(42)
    })

    it('works with undefined key', () => {
      const map = new WeakHashMap2<undefined, number>()
      map.set(undefined, 99)
      expect(map.get(undefined)).toBe(99)
    })
  })
})
