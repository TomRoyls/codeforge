import { describe, it, expect, beforeEach } from 'vitest'
import { LinkedHashMap } from '../../src/core/linked-hash-map-4/index.js'

describe('LinkedHashMap', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates empty map with defaults', () => {
      const map = new LinkedHashMap<string, number>()
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('creates map with custom initial capacity', () => {
      const map = new LinkedHashMap<string, number>(64, 0.5)
      expect(map.size).toBe(0)
    })
  })

  // ─── set / get ───
  describe('set and get', () => {
    let map: LinkedHashMap<string, number>

    beforeEach(() => {
      map = new LinkedHashMap<string, number>()
    })

    it('sets and gets a value', () => {
      map.set('a', 1)
      expect(map.get('a')).toBe(1)
    })

    it('returns undefined for missing key', () => {
      expect(map.get('missing')).toBeUndefined()
    })

    it('overwrites existing key', () => {
      map.set('a', 1)
      map.set('a', 99)
      expect(map.get('a')).toBe(99)
      expect(map.size).toBe(1)
    })

    it('sets multiple key-value pairs', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.size).toBe(3)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
    })
  })

  // ─── has ───
  describe('has', () => {
    it('returns true for existing key', () => {
      const map = new LinkedHashMap<string, number>()
      map.set('a', 1)
      expect(map.has('a')).toBe(true)
    })

    it('returns false for missing key', () => {
      const map = new LinkedHashMap<string, number>()
      expect(map.has('a')).toBe(false)
    })

    it('returns false after delete', () => {
      const map = new LinkedHashMap<string, number>()
      map.set('a', 1)
      map.delete('a')
      expect(map.has('a')).toBe(false)
    })
  })

  // ─── delete ───
  describe('delete', () => {
    it('deletes existing key and returns true', () => {
      const map = new LinkedHashMap<string, number>()
      map.set('a', 1)
      expect(map.delete('a')).toBe(true)
      expect(map.size).toBe(0)
    })

    it('returns false for missing key', () => {
      const map = new LinkedHashMap<string, number>()
      expect(map.delete('missing')).toBe(false)
    })

    it('deletes head element', () => {
      const map = new LinkedHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      expect(map.keys()).toEqual(['b'])
    })

    it('deletes tail element', () => {
      const map = new LinkedHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.delete('b')
      expect(map.keys()).toEqual(['a'])
    })

    it('deletes middle element', () => {
      const map = new LinkedHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.delete('b')
      expect(map.keys()).toEqual(['a', 'c'])
    })
  })

  // ─── Insertion order ───
  describe('insertion order', () => {
    it('keys returns keys in insertion order', () => {
      const map = new LinkedHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.keys()).toEqual(['a', 'b', 'c'])
    })

    it('values returns values in insertion order', () => {
      const map = new LinkedHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.values()).toEqual([1, 2, 3])
    })

    it('entries returns pairs in insertion order', () => {
      const map = new LinkedHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      expect(map.entries()).toEqual([['a', 1], ['b', 2]])
    })

    it('returns empty arrays when empty', () => {
      const map = new LinkedHashMap<string, number>()
      expect(map.keys()).toEqual([])
      expect(map.values()).toEqual([])
      expect(map.entries()).toEqual([])
    })
  })

  // ─── first / last ───
  describe('first and last', () => {
    it('first returns undefined on empty map', () => {
      const map = new LinkedHashMap<string, number>()
      expect(map.first()).toBeUndefined()
    })

    it('last returns undefined on empty map', () => {
      const map = new LinkedHashMap<string, number>()
      expect(map.last()).toBeUndefined()
    })

    it('first returns first inserted entry', () => {
      const map = new LinkedHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      expect(map.first()).toEqual(['a', 1])
    })

    it('last returns last inserted entry', () => {
      const map = new LinkedHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      expect(map.last()).toEqual(['b', 2])
    })
  })

  // ─── deleteFirst / deleteLast ───
  describe('deleteFirst and deleteLast', () => {
    it('deleteFirst returns false on empty', () => {
      const map = new LinkedHashMap<string, number>()
      expect(map.deleteFirst()).toBe(false)
    })

    it('deleteLast returns false on empty', () => {
      const map = new LinkedHashMap<string, number>()
      expect(map.deleteLast()).toBe(false)
    })

    it('deleteFirst removes first entry', () => {
      const map = new LinkedHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.deleteFirst()
      expect(map.keys()).toEqual(['b'])
    })

    it('deleteLast removes last entry', () => {
      const map = new LinkedHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.deleteLast()
      expect(map.keys()).toEqual(['a'])
    })
  })

  // ─── clear / isEmpty ───
  describe('clear and isEmpty', () => {
    it('clear removes all entries', () => {
      const map = new LinkedHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('isEmpty returns false with entries', () => {
      const map = new LinkedHashMap<string, number>()
      map.set('a', 1)
      expect(map.isEmpty).toBe(false)
    })
  })

  // ─── forEach ───
  describe('forEach', () => {
    it('iterates all entries in insertion order', () => {
      const map = new LinkedHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const collected: string[] = []
      map.forEach((v, k) => collected.push(`${k}:${v}`))
      expect(collected).toEqual(['a:1', 'b:2'])
    })

    it('does not call callback on empty map', () => {
      const map = new LinkedHashMap<string, number>()
      let called = false
      map.forEach(() => { called = true })
      expect(called).toBe(false)
    })
  })

  // ─── getTimeComplexity ───
  describe('getTimeComplexity', () => {
    it('returns expected complexity string', () => {
      const map = new LinkedHashMap<string, number>()
      expect(map.getTimeComplexity()).toBe('O(1) average case, O(n) worst case')
    })
  })
})
