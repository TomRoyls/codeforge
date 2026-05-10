import { describe, it, expect, beforeEach } from 'vitest'
import { CuckooMap } from '../../src/core/cuckoo-map/cuckoo-map.js'
import type { CuckooMapOptions, CuckooMapStats } from '../../src/core/cuckoo-map/types.js'
import { DEFAULT_CUCKOO_MAP_OPTIONS } from '../../src/core/cuckoo-map/types.js'

describe('CuckooMap', () => {
  describe('construction', () => {
    it('should create map with default capacity', () => {
      const map = new CuckooMap<string, number>()
      expect(map.capacity).toBe(16)
    })

    it('should create map with custom numeric capacity', () => {
      const map = new CuckooMap<string, number>(32)
      expect(map.capacity).toBe(32)
    })

    it('should enforce minimum capacity of 2', () => {
      const map = new CuckooMap<string, number>(1)
      expect(map.capacity).toBe(2)
    })

    it('should handle zero capacity gracefully', () => {
      const map = new CuckooMap<string, number>(0)
      expect(map.capacity).toBe(2)
    })

    it('should handle negative capacity gracefully', () => {
      const map = new CuckooMap<string, number>(-5)
      expect(map.capacity).toBe(2)
    })

    it('should start empty', () => {
      const map = new CuckooMap<string, number>()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('should create map from options object', () => {
      const map = new CuckooMap<string, number>({ capacity: 64 })
      expect(map.capacity).toBe(64)
    })

    it('should create map from options with maxKicks', () => {
      const map = new CuckooMap<string, number>({ capacity: 16, maxKicks: 100 })
      expect(map.capacity).toBe(16)
    })

    it('should create map from empty options object', () => {
      const map = new CuckooMap<string, number>({})
      expect(map.capacity).toBe(16)
    })

    it('should create map from partial options', () => {
      const map = new CuckooMap<string, number>({ maxKicks: 200 })
      expect(map.capacity).toBe(16)
    })

    it('should handle capacity of 2', () => {
      const map = new CuckooMap<string, number>(2)
      expect(map.capacity).toBe(2)
    })
  })

  describe('set', () => {
    let map: CuckooMap<string, number>

    beforeEach(() => {
      map = new CuckooMap<string, number>()
    })

    it('should set a key-value pair', () => {
      map.set('a', 1)
      expect(map.get('a')).toBe(1)
    })

    it('should overwrite existing key', () => {
      map.set('a', 1)
      map.set('a', 2)
      expect(map.get('a')).toBe(2)
      expect(map.size).toBe(1)
    })

    it('should add multiple distinct keys', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.size).toBe(3)
    })

    it('should not increase size on overwrite', () => {
      map.set('a', 1)
      expect(map.size).toBe(1)
      map.set('a', 99)
      expect(map.size).toBe(1)
    })

    it('should handle numeric keys', () => {
      const m = new CuckooMap<number, string>()
      m.set(1, 'one')
      m.set(2, 'two')
      expect(m.get(1)).toBe('one')
      expect(m.get(2)).toBe('two')
    })

    it('should handle boolean keys', () => {
      const m = new CuckooMap<boolean, string>()
      m.set(true, 'yes')
      m.set(false, 'no')
      expect(m.size).toBe(2)
    })

    it('should handle empty string key', () => {
      map.set('', 42)
      expect(map.get('')).toBe(42)
    })

    it('should handle special character keys', () => {
      map.set('!@#$%', 1)
      map.set('你好', 2)
      map.set('🎉', 3)
      expect(map.get('!@#$%')).toBe(1)
      expect(map.get('你好')).toBe(2)
      expect(map.get('🎉')).toBe(3)
    })

    it('should handle single character keys', () => {
      for (let i = 0; i < 26; i++) {
        map.set(String.fromCharCode(97 + i), i)
      }
      expect(map.size).toBe(26)
    })

    it('should handle undefined value', () => {
      map.set('a', undefined)
      expect(map.get('a')).toBeUndefined()
      expect(map.has('a')).toBe(true)
    })

    it('should handle null value', () => {
      map.set('a', null)
      expect(map.get('a')).toBeNull()
    })

    it('should handle object values', () => {
      const obj = { x: 1, y: 2 }
      map.set('key', obj)
      expect(map.get('key')).toBe(obj)
    })

    it('should handle object keys', () => {
      const m = new CuckooMap<object, number>()
      const key = { id: 1 }
      m.set(key, 100)
      expect(m.get(key)).toBe(100)
    })

    it('should handle null key', () => {
      const m = new CuckooMap<null, string>()
      m.set(null, 'null-key')
      expect(m.get(null)).toBe('null-key')
    })

    it('should handle undefined key', () => {
      const m = new CuckooMap<undefined, string>()
      m.set(undefined, 'undef-key')
      expect(m.get(undefined)).toBe('undef-key')
    })

    it('should handle zero as key', () => {
      const m = new CuckooMap<number, string>()
      m.set(0, 'zero')
      expect(m.get(0)).toBe('zero')
    })

    it('should handle false as key', () => {
      const m = new CuckooMap<boolean, string>()
      m.set(false, 'nope')
      expect(m.get(false)).toBe('nope')
    })

    it('should handle array values', () => {
      map.set('arr', [1, 2, 3])
      expect(map.get('arr')).toEqual([1, 2, 3])
    })

    it('should handle function values', () => {
      const fn = () => 42
      map.set('fn', fn)
      expect(map.get('fn')).toBe(fn)
    })
  })

  describe('get', () => {
    let map: CuckooMap<string, number>

    beforeEach(() => {
      map = new CuckooMap<string, number>()
    })

    it('should return value for existing key', () => {
      map.set('a', 1)
      expect(map.get('a')).toBe(1)
    })

    it('should return undefined for missing key', () => {
      expect(map.get('missing')).toBeUndefined()
    })

    it('should return undefined after deletion', () => {
      map.set('a', 1)
      map.delete('a')
      expect(map.get('a')).toBeUndefined()
    })

    it('should return updated value after overwrite', () => {
      map.set('a', 1)
      map.set('a', 2)
      expect(map.get('a')).toBe(2)
    })

    it('should return correct values for multiple keys', () => {
      map.set('x', 10)
      map.set('y', 20)
      map.set('z', 30)
      expect(map.get('x')).toBe(10)
      expect(map.get('y')).toBe(20)
      expect(map.get('z')).toBe(30)
    })

    it('should handle get on empty map', () => {
      expect(map.get('anything')).toBeUndefined()
    })

    it('should return distinct values for distinct keys', () => {
      map.set('a', 100)
      map.set('b', 200)
      expect(map.get('a')).not.toBe(map.get('b'))
    })
  })

  describe('delete', () => {
    let map: CuckooMap<string, number>

    beforeEach(() => {
      map = new CuckooMap<string, number>()
    })

    it('should delete existing key', () => {
      map.set('a', 1)
      expect(map.delete('a')).toBe(true)
      expect(map.has('a')).toBe(false)
    })

    it('should return false for missing key', () => {
      expect(map.delete('missing')).toBe(false)
    })

    it('should decrease size on deletion', () => {
      map.set('a', 1)
      map.set('b', 2)
      expect(map.size).toBe(2)
      map.delete('a')
      expect(map.size).toBe(1)
    })

    it('should not affect other keys on deletion', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.delete('b')
      expect(map.has('a')).toBe(true)
      expect(map.has('c')).toBe(true)
    })

    it('should handle delete then re-set', () => {
      map.set('a', 1)
      map.delete('a')
      map.set('a', 2)
      expect(map.get('a')).toBe(2)
      expect(map.size).toBe(1)
    })

    it('should handle delete on empty map', () => {
      expect(map.delete('x')).toBe(false)
    })

    it('should handle multiple deletions', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.delete('a')).toBe(true)
      expect(map.delete('b')).toBe(true)
      expect(map.delete('c')).toBe(true)
      expect(map.size).toBe(0)
    })

    it('should handle deleting same key twice', () => {
      map.set('a', 1)
      expect(map.delete('a')).toBe(true)
      expect(map.delete('a')).toBe(false)
    })

    it('should handle deleting non-existent after previous delete', () => {
      map.set('a', 1)
      map.delete('a')
      expect(map.delete('a')).toBe(false)
    })

    it('should not corrupt map after partial deletion', () => {
      const m = new CuckooMap<number, number>(16)
      for (let i = 0; i < 20; i++) {
        m.set(i, i * 10)
      }
      for (let i = 0; i < 10; i++) {
        m.delete(i)
      }
      for (let i = 0; i < 10; i++) {
        expect(m.has(i)).toBe(false)
      }
      for (let i = 10; i < 20; i++) {
        expect(m.has(i)).toBe(true)
        expect(m.get(i)).toBe(i * 10)
      }
    })

    it('should handle delete all then re-set', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      map.delete('b')
      expect(map.size).toBe(0)
      map.set('a', 10)
      map.set('b', 20)
      expect(map.size).toBe(2)
    })
  })

  describe('has', () => {
    let map: CuckooMap<string, number>

    beforeEach(() => {
      map = new CuckooMap<string, number>()
    })

    it('should return true for existing key', () => {
      map.set('a', 1)
      expect(map.has('a')).toBe(true)
    })

    it('should return false for missing key', () => {
      expect(map.has('a')).toBe(false)
    })

    it('should return false after deletion', () => {
      map.set('a', 1)
      map.delete('a')
      expect(map.has('a')).toBe(false)
    })

    it('should return true for multiple existing keys', () => {
      map.set('a', 1)
      map.set('b', 2)
      expect(map.has('a')).toBe(true)
      expect(map.has('b')).toBe(true)
    })

    it('should handle has on empty map', () => {
      expect(map.has('anything')).toBe(false)
    })

    it('should return true after overwrite', () => {
      map.set('a', 1)
      map.set('a', 2)
      expect(map.has('a')).toBe(true)
    })
  })

  describe('size', () => {
    it('should return 0 for empty map', () => {
      const map = new CuckooMap<string, number>()
      expect(map.size).toBe(0)
    })

    it('should track size correctly', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      expect(map.size).toBe(1)
      map.set('b', 2)
      expect(map.size).toBe(2)
    })

    it('should not increase size on overwrite', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.set('a', 2)
      expect(map.size).toBe(1)
    })

    it('should decrease size on delete', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.delete('a')
      expect(map.size).toBe(0)
    })

    it('should track size after mixed operations', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.delete('b')
      map.set('d', 4)
      map.set('a', 10)
      expect(map.size).toBe(3)
    })
  })

  describe('capacity', () => {
    it('should return initial capacity', () => {
      const map = new CuckooMap<string, number>(64)
      expect(map.capacity).toBe(64)
    })

    it('should return default capacity', () => {
      const map = new CuckooMap<string, number>()
      expect(map.capacity).toBe(DEFAULT_CUCKOO_MAP_OPTIONS.capacity)
    })

    it('should change after rehash', () => {
      const map = new CuckooMap<string, number>(16)
      map.set('a', 1)
      map.rehash(64)
      expect(map.capacity).toBe(64)
    })
  })

  describe('loadFactor', () => {
    it('should be 0 for empty map', () => {
      const map = new CuckooMap<string, number>(16)
      expect(map.loadFactor).toBe(0)
    })

    it('should calculate load factor correctly', () => {
      const map = new CuckooMap<string, number>(16)
      map.set('a', 1)
      expect(map.loadFactor).toBeCloseTo(1 / 16)
    })

    it('should increase with more inserts', () => {
      const map = new CuckooMap<string, number>(16)
      for (let i = 0; i < 8; i++) {
        map.set(`k${i}`, i)
      }
      expect(map.loadFactor).toBe(0.5)
    })

    it('should decrease after delete', () => {
      const map = new CuckooMap<string, number>(16)
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      expect(map.loadFactor).toBeCloseTo(1 / 16)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty map', () => {
      const map = new CuckooMap<string, number>()
      expect(map.isEmpty()).toBe(true)
    })

    it('should return false when not empty', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      expect(map.isEmpty()).toBe(false)
    })

    it('should return true after clearing all entries', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      map.delete('b')
      expect(map.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.clear()
      expect(map.isEmpty()).toBe(true)
    })

    it('should return false after set following clear', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.clear()
      map.set('b', 2)
      expect(map.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear all entries', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('should preserve capacity after clear', () => {
      const map = new CuckooMap<string, number>(32)
      map.set('a', 1)
      map.clear()
      expect(map.capacity).toBe(32)
    })

    it('should allow insertion after clear', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.clear()
      map.set('b', 2)
      expect(map.has('b')).toBe(true)
      expect(map.size).toBe(1)
    })

    it('should handle clearing empty map', () => {
      const map = new CuckooMap<string, number>()
      map.clear()
      expect(map.size).toBe(0)
    })

    it('should handle clear then re-use with many elements', () => {
      const map = new CuckooMap<string, number>()
      for (let i = 0; i < 50; i++) {
        map.set(`k${i}`, i)
      }
      map.clear()
      expect(map.size).toBe(0)
      for (let i = 0; i < 50; i++) {
        map.set(`new${i}`, i * 2)
      }
      for (let i = 0; i < 50; i++) {
        expect(map.has(`new${i}`)).toBe(true)
        expect(map.get(`new${i}`)).toBe(i * 2)
      }
    })
  })

  describe('clone', () => {
    it('should clone the map', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const cloned = map.clone()
      expect(cloned.get('a')).toBe(1)
      expect(cloned.get('b')).toBe(2)
    })

    it('should create independent copy', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      const cloned = map.clone()
      cloned.set('b', 2)
      expect(map.has('b')).toBe(false)
      expect(cloned.has('b')).toBe(true)
    })

    it('should preserve capacity in clone', () => {
      const map = new CuckooMap<string, number>(64)
      map.set('a', 1)
      const cloned = map.clone()
      expect(cloned.capacity).toBe(64)
    })

    it('should preserve size in clone', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const cloned = map.clone()
      expect(cloned.size).toBe(3)
    })

    it('should clone empty map', () => {
      const map = new CuckooMap<string, number>()
      const cloned = map.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should handle deletion from clone not affecting original', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const cloned = map.clone()
      cloned.delete('a')
      expect(map.has('a')).toBe(true)
      expect(cloned.has('a')).toBe(false)
    })

    it('should handle addition to clone not affecting original', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      const cloned = map.clone()
      cloned.set('b', 2)
      expect(map.has('b')).toBe(false)
      expect(cloned.has('b')).toBe(true)
    })

    it('should handle overwrite in clone not affecting original', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      const cloned = map.clone()
      cloned.set('a', 999)
      expect(map.get('a')).toBe(1)
      expect(cloned.get('a')).toBe(999)
    })

    it('should handle clone after many operations', () => {
      const map = new CuckooMap<number, number>(16)
      for (let i = 0; i < 50; i++) {
        map.set(i, i * 10)
      }
      for (let i = 0; i < 25; i++) {
        map.delete(i)
      }
      const cloned = map.clone()
      expect(cloned.size).toBe(25)
      for (let i = 25; i < 50; i++) {
        expect(cloned.has(i)).toBe(true)
        expect(cloned.get(i)).toBe(i * 10)
      }
    })
  })

  describe('toArray', () => {
    it('should return all entries', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const arr = map.toArray()
      expect(arr.length).toBe(3)
      const sorted = arr.sort((a, b) => String(a[0]).localeCompare(String(b[0])))
      expect(sorted).toEqual([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
    })

    it('should return empty array for empty map', () => {
      const map = new CuckooMap<string, number>()
      expect(map.toArray()).toEqual([])
    })

    it('should reflect deletions', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.delete('b')
      const arr = map.toArray()
      expect(arr.length).toBe(2)
    })

    it('should return correct count after mixed operations', () => {
      const map = new CuckooMap<number, string>()
      for (let i = 0; i < 10; i++) {
        map.set(i, `v${i}`)
      }
      for (let i = 0; i < 5; i++) {
        map.delete(i)
      }
      expect(map.toArray().length).toBe(5)
    })

    it('should not include deleted entries', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.delete('a')
      expect(map.toArray()).toEqual([])
    })
  })

  describe('keys', () => {
    it('should return all keys', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const k = map.keys()
      expect(k.length).toBe(3)
      expect(k.sort()).toEqual(['a', 'b', 'c'])
    })

    it('should return empty array for empty map', () => {
      const map = new CuckooMap<string, number>()
      expect(map.keys()).toEqual([])
    })

    it('should reflect deletions', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      expect(map.keys()).toEqual(['b'])
    })

    it('should return keys after overwrite', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.set('a', 2)
      expect(map.keys()).toEqual(['a'])
    })
  })

  describe('values', () => {
    it('should return all values', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const v = map.values()
      expect(v.length).toBe(3)
      expect(v.sort()).toEqual([1, 2, 3])
    })

    it('should return empty array for empty map', () => {
      const map = new CuckooMap<string, number>()
      expect(map.values()).toEqual([])
    })

    it('should reflect updated values', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.set('a', 2)
      expect(map.values()).toEqual([2])
    })

    it('should reflect deletions', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      expect(map.values()).toEqual([2])
    })
  })

  describe('entries', () => {
    it('should return all entries', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const e = map.entries()
      expect(e.length).toBe(2)
    })

    it('should equal toArray', () => {
      const map = new CuckooMap<string, number>()
      map.set('x', 10)
      map.set('y', 20)
      expect(map.entries()).toEqual(map.toArray())
    })

    it('should return empty for empty map', () => {
      const map = new CuckooMap<string, number>()
      expect(map.entries()).toEqual([])
    })
  })

  describe('forEach', () => {
    it('should iterate over all entries', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const result: [string, number][] = []
      map.forEach((key, value) => result.push([key, value]))
      expect(result.length).toBe(3)
      const sorted = result.sort((a, b) => a[0].localeCompare(b[0]))
      expect(sorted).toEqual([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
    })

    it('should not iterate on empty map', () => {
      const map = new CuckooMap<string, number>()
      let count = 0
      map.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should iterate after deletions', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      const entries: [string, number][] = []
      map.forEach((key, value) => entries.push([key, value]))
      expect(entries).toEqual([['b', 2]])
    })

    it('should handle forEach with numeric keys', () => {
      const map = new CuckooMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      const result: string[] = []
      map.forEach((_key, value) => result.push(value))
      expect(result.sort()).toEqual(['one', 'three', 'two'])
    })

    it('should reflect updates in forEach', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.set('a', 2)
      const result: [string, number][] = []
      map.forEach((key, value) => result.push([key, value]))
      expect(result).toEqual([['a', 2]])
    })
  })

  describe('from factory', () => {
    it('should create map from array of entries', () => {
      const map = CuckooMap.from([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      expect(map.size).toBe(3)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
    })

    it('should create map from empty array', () => {
      const map = CuckooMap.from<string, number>([])
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('should create map with custom capacity', () => {
      const map = CuckooMap.from(
        [
          ['a', 1],
          ['b', 2],
        ],
        64,
      )
      expect(map.capacity).toBe(64)
    })

    it('should overwrite duplicate keys in from', () => {
      const map = CuckooMap.from([
        ['a', 1],
        ['a', 2],
        ['b', 3],
      ])
      expect(map.size).toBe(2)
      expect(map.get('a')).toBe(2)
    })

    it('should create map from Map', () => {
      const native = new Map([
        ['x', 10],
        ['y', 20],
        ['z', 30],
      ])
      const map = CuckooMap.from(native)
      expect(map.size).toBe(3)
    })

    it('should create map from numeric entries', () => {
      const map = CuckooMap.from([
        [1, 'one'],
        [2, 'two'],
        [3, 'three'],
      ])
      expect(map.size).toBe(3)
      expect(map.get(3)).toBe('three')
    })

    it('should handle single element', () => {
      const map = CuckooMap.from([['only', 42]])
      expect(map.size).toBe(1)
      expect(map.get('only')).toBe(42)
    })

    it('should create map from generator', () => {
      function* gen(): Generator<[string, number]> {
        yield ['a', 1]
        yield ['b', 2]
        yield ['c', 3]
      }
      const map = CuckooMap.from(gen())
      expect(map.size).toBe(3)
    })
  })

  describe('stats', () => {
    it('should return stats for empty map', () => {
      const map = new CuckooMap<string, number>(16)
      const s = map.stats()
      expect(s.size).toBe(0)
      expect(s.capacity).toBe(16)
      expect(s.loadFactor).toBe(0)
      expect(s.maxChainLength).toBe(0)
      expect(s.table1Occupancy).toBe(0)
      expect(s.table2Occupancy).toBe(0)
      expect(s.resizeCount).toBe(0)
    })

    it('should return stats after inserts', () => {
      const map = new CuckooMap<string, number>(16)
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const s = map.stats()
      expect(s.size).toBe(3)
      expect(s.capacity).toBe(16)
      expect(s.loadFactor).toBeCloseTo(3 / 16)
      expect(s.table1Occupancy + s.table2Occupancy).toBe(3)
    })

    it('should return correct table occupancy', () => {
      const map = new CuckooMap<string, number>(16)
      map.set('a', 1)
      const s = map.stats()
      expect(s.table1Occupancy + s.table2Occupancy).toBe(1)
    })

    it('should return CuckooMapStats type', () => {
      const map = new CuckooMap<string, number>()
      const s: CuckooMapStats = map.stats()
      expect(typeof s.size).toBe('number')
      expect(typeof s.capacity).toBe('number')
      expect(typeof s.loadFactor).toBe('number')
      expect(typeof s.maxChainLength).toBe('number')
      expect(typeof s.table1Occupancy).toBe('number')
      expect(typeof s.table2Occupancy).toBe('number')
      expect(typeof s.resizeCount).toBe('number')
    })

    it('should track maxChainLength', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      const s = map.stats()
      expect(s.maxChainLength).toBeGreaterThanOrEqual(0)
    })
  })

  describe('rehash', () => {
    it('should rehash with new capacity', () => {
      const map = new CuckooMap<string, number>(4)
      map.set('a', 1)
      map.set('b', 2)
      map.rehash(32)
      expect(map.capacity).toBe(32)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
    })

    it('should rehash with same capacity', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.rehash()
      expect(map.get('a')).toBe(1)
    })

    it('should preserve all entries through rehash', () => {
      const map = new CuckooMap<string, number>(16)
      for (let i = 0; i < 10; i++) {
        map.set(`k${i}`, i * 10)
      }
      map.rehash(64)
      for (let i = 0; i < 10; i++) {
        expect(map.get(`k${i}`)).toBe(i * 10)
      }
      expect(map.size).toBe(10)
    })

    it('should enforce minimum capacity on rehash', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.rehash(1)
      expect(map.capacity).toBe(2)
      expect(map.get('a')).toBe(1)
    })

    it('should rehash to smaller capacity', () => {
      const map = new CuckooMap<string, number>(64)
      map.set('a', 1)
      map.rehash(4)
      expect(map.get('a')).toBe(1)
      expect(map.capacity).toBe(4)
    })

    it('should handle rehash with empty map', () => {
      const map = new CuckooMap<string, number>(4)
      map.rehash(32)
      expect(map.capacity).toBe(32)
      expect(map.size).toBe(0)
    })

    it('should handle toArray after rehash', () => {
      const map = new CuckooMap<string, number>(4)
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.rehash(32)
      const arr = map.toArray()
      expect(arr.length).toBe(3)
    })

    it('should handle forEach after rehash', () => {
      const map = new CuckooMap<string, number>(4)
      map.set('x', 10)
      map.set('y', 20)
      map.rehash(32)
      const result: [string, number][] = []
      map.forEach((key, value) => result.push([key, value]))
      expect(result.length).toBe(2)
    })
  })

  describe('resize behavior', () => {
    it('should auto-resize when table fills up', () => {
      const map = new CuckooMap<number, string>(4)
      for (let i = 0; i < 100; i++) {
        map.set(i, `v${i}`)
      }
      expect(map.size).toBe(100)
      expect(map.capacity).toBeGreaterThan(4)
    })

    it('should preserve all values after resize', () => {
      const map = new CuckooMap<number, string>(4)
      for (let i = 0; i < 100; i++) {
        map.set(i, `v${i}`)
      }
      for (let i = 0; i < 100; i++) {
        expect(map.has(i)).toBe(true)
        expect(map.get(i)).toBe(`v${i}`)
      }
    })

    it('should handle resize with many elements', () => {
      const map = new CuckooMap<number, string>(4)
      for (let i = 0; i < 500; i++) {
        map.set(i, `v${i}`)
      }
      expect(map.size).toBe(500)
    })
  })

  describe('edge cases', () => {
    it('should handle single entry lifecycle', () => {
      const map = new CuckooMap<string, number>()
      map.set('only', 42)
      expect(map.has('only')).toBe(true)
      expect(map.get('only')).toBe(42)
      expect(map.size).toBe(1)
      expect(map.isEmpty()).toBe(false)
      map.delete('only')
      expect(map.has('only')).toBe(false)
      expect(map.get('only')).toBeUndefined()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('should handle empty string key', () => {
      const map = new CuckooMap<string, number>()
      map.set('', 42)
      expect(map.has('')).toBe(true)
      expect(map.delete('')).toBe(true)
      expect(map.has('')).toBe(false)
    })

    it('should handle very large values', () => {
      const map = new CuckooMap<string, number>()
      map.set('max', Number.MAX_SAFE_INTEGER)
      expect(map.get('max')).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('should handle collision-heavy inputs', () => {
      const map = new CuckooMap<string, number>(8)
      for (let i = 0; i < 50; i++) {
        map.set(`item-${i}`, i)
      }
      for (let i = 0; i < 50; i++) {
        expect(map.get(`item-${i}`)).toBe(i)
      }
    })

    it('should handle rapid set/delete cycles', () => {
      const map = new CuckooMap<string, number>()
      for (let cycle = 0; cycle < 5; cycle++) {
        for (let i = 0; i < 20; i++) {
          map.set(`k${i}`, i)
        }
        for (let i = 0; i < 20; i++) {
          map.delete(`k${i}`)
        }
        expect(map.size).toBe(0)
      }
    })

    it('should handle interleaved insert and delete', () => {
      const map = new CuckooMap<string, number>()
      for (let i = 0; i < 100; i++) {
        map.set(`k${i}`, i)
      }
      for (let i = 0; i < 50; i++) {
        map.delete(`k${i}`)
      }
      for (let i = 100; i < 150; i++) {
        map.set(`k${i}`, i)
      }
      expect(map.size).toBe(100)
      for (let i = 50; i < 150; i++) {
        expect(map.has(`k${i}`)).toBe(true)
      }
    })

    it('should survive auto-rehash on cycle detection', () => {
      const map = new CuckooMap<string, number>(4)
      for (let i = 0; i < 100; i++) {
        map.set(`k${i}`, i)
      }
      for (let i = 0; i < 100; i++) {
        expect(map.get(`k${i}`)).toBe(i)
      }
    })

    it('should distinguish numeric strings from numbers', () => {
      const map = new CuckooMap<number, string>()
      map.set(1, 'number')
      expect(map.get(1)).toBe('number')
    })

    it('should handle overwriting with different value types', () => {
      const map = new CuckooMap<string, unknown>()
      map.set('a', 1)
      map.set('a', 'string')
      map.set('a', { obj: true })
      expect(map.get('a')).toEqual({ obj: true })
    })

    it('should handle same hash keys via String coercion', () => {
      const map = new CuckooMap<string, number>()
      map.set('1', 1)
      map.set('01', 2)
      expect(map.size).toBe(2)
      expect(map.get('1')).toBe(1)
      expect(map.get('01')).toBe(2)
    })
  })

  describe('large maps', () => {
    it('should handle 10000+ string entries', () => {
      const map = new CuckooMap<string, number>(256)
      for (let i = 0; i < 10000; i++) {
        map.set(`item-${i}`, i)
      }
      expect(map.size).toBe(10000)
      for (let i = 0; i < 10000; i++) {
        expect(map.get(`item-${i}`)).toBe(i)
      }
    })

    it('should handle 10000+ numeric entries', () => {
      const map = new CuckooMap<number, string>(256)
      for (let i = 0; i < 10000; i++) {
        map.set(i, `v${i}`)
      }
      expect(map.size).toBe(10000)
      for (let i = 0; i < 10000; i++) {
        expect(map.get(i)).toBe(`v${i}`)
      }
    })

    it('should handle 10000+ entries with deletions', () => {
      const map = new CuckooMap<number, string>(256)
      for (let i = 0; i < 10000; i++) {
        map.set(i, `v${i}`)
      }
      for (let i = 0; i < 5000; i++) {
        map.delete(i)
      }
      expect(map.size).toBe(5000)
      for (let i = 5000; i < 10000; i++) {
        expect(map.has(i)).toBe(true)
      }
      for (let i = 0; i < 5000; i++) {
        expect(map.has(i)).toBe(false)
      }
    })

    it('should handle clone of large map', () => {
      const map = new CuckooMap<number, string>(256)
      for (let i = 0; i < 1000; i++) {
        map.set(i, `v${i}`)
      }
      const cloned = map.clone()
      expect(cloned.size).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(cloned.get(i)).toBe(`v${i}`)
      }
    })

    it('should handle toArray on large map', () => {
      const map = new CuckooMap<number, string>(256)
      for (let i = 0; i < 1000; i++) {
        map.set(i, `v${i}`)
      }
      const arr = map.toArray()
      expect(arr.length).toBe(1000)
    })

    it('should handle forEach on large map', () => {
      const map = new CuckooMap<number, string>(256)
      for (let i = 0; i < 1000; i++) {
        map.set(i, `v${i}`)
      }
      let count = 0
      map.forEach(() => count++)
      expect(count).toBe(1000)
    })

    it('should handle from with large input', () => {
      const entries: [number, string][] = []
      for (let i = 0; i < 5000; i++) {
        entries.push([i, `v${i}`])
      }
      const map = CuckooMap.from(entries)
      expect(map.size).toBe(5000)
    })
  })

  describe('DEFAULT_CUCKOO_MAP_OPTIONS', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_CUCKOO_MAP_OPTIONS.capacity).toBe(16)
      expect(DEFAULT_CUCKOO_MAP_OPTIONS.maxKicks).toBe(500)
    })

    it('should be usable as CuckooMapOptions', () => {
      const opts: CuckooMapOptions = DEFAULT_CUCKOO_MAP_OPTIONS
      expect(opts.capacity).toBeTypeOf('number')
      expect(opts.maxKicks).toBeTypeOf('number')
    })
  })

  describe('randomized stress', () => {
    it('should maintain correctness with random operations', () => {
      const map = new CuckooMap<number, number>(64)
      const reference = new Map<number, number>()
      for (let i = 0; i < 2000; i++) {
        const key = Math.floor(Math.random() * 500)
        const op = Math.random()
        if (op < 0.6) {
          const value = Math.floor(Math.random() * 1000)
          map.set(key, value)
          reference.set(key, value)
          expect(map.get(key)).toBe(value)
        } else {
          const result = map.delete(key)
          const expected = reference.has(key)
          expect(result).toBe(expected)
          reference.delete(key)
        }
      }
      expect(map.size).toBe(reference.size)
      for (const [key, value] of reference) {
        expect(map.has(key)).toBe(true)
        expect(map.get(key)).toBe(value)
      }
    })
  })
})
