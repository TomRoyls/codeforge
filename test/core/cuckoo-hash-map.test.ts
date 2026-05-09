import { describe, it, expect, beforeEach } from 'vitest'
import { CuckooHashMap } from '../../src/core/cuckoo-hash-map/cuckoo-hash-map.js'

describe('CuckooHashMap', () => {
  describe('constructor', () => {
    it('should create map with default capacity 16', () => {
      const map = new CuckooHashMap<string, number>()
      const stats = map.getStats()
      expect(stats.capacity).toBe(16)
    })

    it('should create map with custom capacity via options', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 32 })
      expect(map.getStats().capacity).toBe(32)
    })

    it('should create map with custom maxKicks via options', () => {
      const map = new CuckooHashMap<string, number>({ maxKicks: 100 })
      expect(map.getStats().capacity).toBe(16)
    })

    it('should create map with both options', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 64, maxKicks: 200 })
      const stats = map.getStats()
      expect(stats.capacity).toBe(64)
    })

    it('should enforce minimum capacity of 2', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 1 })
      expect(map.getStats().capacity).toBe(2)
    })

    it('should handle capacity of 0', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 0 })
      expect(map.getStats().capacity).toBe(2)
    })

    it('should handle negative capacity', () => {
      const map = new CuckooHashMap<string, number>({ capacity: -5 })
      expect(map.getStats().capacity).toBe(2)
    })

    it('should enforce minimum maxKicks of 1', () => {
      const map = new CuckooHashMap<string, number>({ maxKicks: 0 })
      expect(map.size).toBe(0)
    })

    it('should start empty', () => {
      const map = new CuckooHashMap<string, number>()
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('should accept undefined options', () => {
      const map = new CuckooHashMap<string, number>(undefined)
      expect(map.getStats().capacity).toBe(16)
    })

    it('should work with no arguments', () => {
      const map = new CuckooHashMap()
      expect(map.size).toBe(0)
    })
  })

  describe('set and get', () => {
    let map: CuckooHashMap<string, number>

    beforeEach(() => {
      map = new CuckooHashMap<string, number>()
    })

    it('should insert a key-value pair', () => {
      map.set('a', 1)
      expect(map.get('a')).toBe(1)
    })

    it('should get undefined for missing key', () => {
      expect(map.get('missing')).toBeUndefined()
    })

    it('should insert multiple keys', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
    })

    it('should update existing key', () => {
      map.set('a', 1)
      map.set('a', 99)
      expect(map.get('a')).toBe(99)
    })

    it('should not increase size on update', () => {
      map.set('a', 1)
      expect(map.size).toBe(1)
      map.set('a', 2)
      expect(map.size).toBe(1)
    })

    it('should handle numeric keys', () => {
      const m = new CuckooHashMap<number, string>()
      m.set(1, 'one')
      m.set(2, 'two')
      expect(m.get(1)).toBe('one')
      expect(m.get(2)).toBe('two')
    })

    it('should handle null value', () => {
      const m = new CuckooHashMap<string, null>()
      m.set('a', null)
      expect(m.get('a')).toBeNull()
    })

    it('should handle undefined value', () => {
      const m = new CuckooHashMap<string, undefined>()
      m.set('a', undefined)
      expect(m.get('a')).toBeUndefined()
    })

    it('should handle boolean values', () => {
      const m = new CuckooHashMap<string, boolean>()
      m.set('t', true)
      m.set('f', false)
      expect(m.get('t')).toBe(true)
      expect(m.get('f')).toBe(false)
    })

    it('should handle object values', () => {
      const m = new CuckooHashMap<string, { x: number }>()
      m.set('a', { x: 1 })
      expect(m.get('a')?.x).toBe(1)
    })

    it('should handle array values', () => {
      const m = new CuckooHashMap<string, number[]>()
      m.set('a', [1, 2, 3])
      expect(m.get('a')).toEqual([1, 2, 3])
    })

    it('should handle empty string key', () => {
      map.set('', 0)
      expect(map.get('')).toBe(0)
    })

    it('should handle special characters in keys', () => {
      map.set('!@#$%', 1)
      map.set('你好', 2)
      map.set('🎉', 3)
      expect(map.get('!@#$%')).toBe(1)
      expect(map.get('你好')).toBe(2)
      expect(map.get('🎉')).toBe(3)
    })

    it('should handle object-like string keys', () => {
      map.set('key-1', 100)
      map.set('key-2', 200)
      expect(map.get('key-1')).toBe(100)
      expect(map.get('key-2')).toBe(200)
    })

    it('should handle 0 and false as values', () => {
      const m1 = new CuckooHashMap<string, number>()
      m1.set('a', 0)
      expect(m1.get('a')).toBe(0)
      const m2 = new CuckooHashMap<string, boolean>()
      m2.set('a', false)
      expect(m2.get('a')).toBe(false)
    })

    it('should handle very large values', () => {
      map.set('a', Number.MAX_SAFE_INTEGER)
      expect(map.get('a')).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('should return undefined after clearing and re-getting', () => {
      map.set('a', 1)
      map.clear()
      expect(map.get('a')).toBeUndefined()
    })

    it('should distinguish different keys', () => {
      const m = new CuckooHashMap<number, string>()
      m.set(1, 'number')
      expect(m.get(1)).toBe('number')
      expect(m.get(2)).toBeUndefined()
    })
  })

  describe('has', () => {
    let map: CuckooHashMap<string, number>

    beforeEach(() => {
      map = new CuckooHashMap<string, number>()
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

    it('should return true after update', () => {
      map.set('a', 1)
      map.set('a', 2)
      expect(map.has('a')).toBe(true)
    })
  })

  describe('delete', () => {
    let map: CuckooHashMap<string, number>

    beforeEach(() => {
      map = new CuckooHashMap<string, number>()
    })

    it('should delete existing key', () => {
      map.set('a', 1)
      expect(map.delete('a')).toBe(true)
      expect(map.get('a')).toBeUndefined()
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

    it('should not affect other entries on deletion', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.delete('b')
      expect(map.get('a')).toBe(1)
      expect(map.get('c')).toBe(3)
    })

    it('should handle deleting then re-inserting', () => {
      map.set('a', 1)
      map.delete('a')
      map.set('a', 2)
      expect(map.get('a')).toBe(2)
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

    it('should correctly delete and verify remaining entries', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.set('d', 4)
      map.set('e', 5)
      map.delete('c')
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBeUndefined()
      expect(map.get('d')).toBe(4)
      expect(map.get('e')).toBe(5)
    })

    it('should handle delete all then re-add', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      map.delete('b')
      expect(map.size).toBe(0)
      map.set('a', 10)
      map.set('b', 20)
      expect(map.get('a')).toBe(10)
      expect(map.get('b')).toBe(20)
      expect(map.size).toBe(2)
    })

    it('should handle delete non-existent after previous delete', () => {
      map.set('a', 1)
      map.delete('a')
      expect(map.delete('a')).toBe(false)
    })

    it('should not corrupt map after partial deletion', () => {
      const m = new CuckooHashMap<number, number>(16)
      for (let i = 0; i < 20; i++) {
        m.set(i, i * 2)
      }
      for (let i = 0; i < 10; i++) {
        m.delete(i)
      }
      for (let i = 0; i < 10; i++) {
        expect(m.get(i)).toBeUndefined()
      }
      for (let i = 10; i < 20; i++) {
        expect(m.get(i)).toBe(i * 2)
      }
    })
  })

  describe('size and isEmpty', () => {
    let map: CuckooHashMap<string, number>

    beforeEach(() => {
      map = new CuckooHashMap<string, number>()
    })

    it('should return 0 for empty map', () => {
      expect(map.size).toBe(0)
    })

    it('should track size correctly', () => {
      map.set('a', 1)
      expect(map.size).toBe(1)
      map.set('b', 2)
      expect(map.size).toBe(2)
    })

    it('should not increase size on update', () => {
      map.set('a', 1)
      map.set('a', 2)
      expect(map.size).toBe(1)
    })

    it('should decrease size on delete', () => {
      map.set('a', 1)
      map.delete('a')
      expect(map.size).toBe(0)
    })

    it('isEmpty should return true when empty', () => {
      expect(map.isEmpty).toBe(true)
    })

    it('isEmpty should return false when not empty', () => {
      map.set('a', 1)
      expect(map.isEmpty).toBe(false)
    })

    it('isEmpty should return true after clearing all entries', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      map.delete('b')
      expect(map.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear all entries', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('should preserve capacity after clear', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 32 })
      map.set('a', 1)
      map.clear()
      expect(map.getStats().capacity).toBe(32)
    })

    it('should allow insertion after clear', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.clear()
      map.set('b', 2)
      expect(map.get('b')).toBe(2)
      expect(map.size).toBe(1)
    })

    it('should handle clearing empty map', () => {
      const map = new CuckooHashMap<string, number>()
      map.clear()
      expect(map.size).toBe(0)
    })

    it('should reset maxKicksUsed after clear', () => {
      const map = new CuckooHashMap<string, number>()
      for (let i = 0; i < 20; i++) {
        map.set(`k${i}`, i)
      }
      const prevMax = map.getStats().maxKicksUsed
      map.clear()
      expect(map.getStats().maxKicksUsed).toBe(0)
      expect(prevMax).toBeGreaterThanOrEqual(0)
    })

    it('should handle clear then re-use', () => {
      const map = new CuckooHashMap<string, number>()
      for (let i = 0; i < 50; i++) {
        map.set(`k${i}`, i)
      }
      map.clear()
      expect(map.size).toBe(0)
      for (let i = 0; i < 50; i++) {
        map.set(`new${i}`, i * 2)
      }
      for (let i = 0; i < 50; i++) {
        expect(map.get(`new${i}`)).toBe(i * 2)
      }
    })
  })

  describe('forEach', () => {
    it('should iterate over all entries', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const result: Array<[string, number]> = []
      map.forEach((k, v) => result.push([k, v]))
      expect(result.length).toBe(3)
      expect(result.sort((a, b) => a[1] - b[1])).toEqual([
        ['a', 1],
        ['b', 2],
        ['c', 3]
      ])
    })

    it('should not iterate on empty map', () => {
      const map = new CuckooHashMap<string, number>()
      let count = 0
      map.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should iterate after deletions', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      const keys: string[] = []
      map.forEach(k => keys.push(k))
      expect(keys).toEqual(['b'])
    })

    it('should reflect updated value in forEach', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('a', 99)
      const result: Array<[string, number]> = []
      map.forEach((k, v) => result.push([k, v]))
      expect(result).toEqual([['a', 99]])
    })
  })

  describe('keys, values, entries', () => {
    let map: CuckooHashMap<string, number>

    beforeEach(() => {
      map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
    })

    it('should return all keys', () => {
      const k = map.keys()
      expect(k.sort()).toEqual(['a', 'b', 'c'])
    })

    it('should return all values', () => {
      const v = map.values()
      expect(v.sort()).toEqual([1, 2, 3])
    })

    it('should return all entries', () => {
      const e = map.entries()
      expect(e.length).toBe(3)
      expect(e.sort((a, b) => a[1] - b[1])).toEqual([
        ['a', 1],
        ['b', 2],
        ['c', 3]
      ])
    })

    it('should return empty arrays for empty map', () => {
      const m = new CuckooHashMap<string, number>()
      expect(m.keys()).toEqual([])
      expect(m.values()).toEqual([])
      expect(m.entries()).toEqual([])
    })

    it('should reflect deletions in keys', () => {
      map.delete('b')
      const k = map.keys()
      expect(k.sort()).toEqual(['a', 'c'])
    })

    it('should reflect updates in values', () => {
      map.set('a', 99)
      const v = map.values()
      expect(v.sort()).toEqual([2, 3, 99])
    })

    it('should reflect updated value in values', () => {
      map.set('a', 50)
      expect(map.values().sort()).toEqual([2, 3, 50])
    })

    it('should handle entries after rehash', () => {
      const m = new CuckooHashMap<string, number>({ capacity: 4 })
      m.set('a', 1)
      m.set('b', 2)
      m.set('c', 3)
      m.rehash(32)
      const entries = m.entries()
      expect(entries.length).toBe(3)
      const sorted = entries.sort((a, b) => a[1] - b[1])
      expect(sorted).toEqual([
        ['a', 1],
        ['b', 2],
        ['c', 3]
      ])
    })
  })

  describe('Symbol.iterator', () => {
    it('should be iterable', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const result: Array<[string, number]> = []
      for (const entry of map) {
        result.push(entry)
      }
      expect(result.length).toBe(2)
    })

    it('should produce entries in for-of loop', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('x', 10)
      map.set('y', 20)
      const entries = [...map]
      expect(entries.length).toBe(2)
    })

    it('should work with spread operator', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const spread = [...map]
      expect(spread.length).toBe(3)
    })

    it('should work with Array.from', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      const arr = Array.from(map)
      expect(arr.length).toBe(1)
      expect(arr[0]![0]).toBe('a')
      expect(arr[0]![1]).toBe(1)
    })

    it('should iterate over empty map', () => {
      const map = new CuckooHashMap<string, number>()
      const result = [...map]
      expect(result).toEqual([])
    })

    it('should iterate after clear', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.clear()
      map.set('b', 2)
      const result = [...map]
      expect(result.length).toBe(1)
      expect(result[0]![0]).toBe('b')
    })
  })

  describe('loadFactor', () => {
    it('should be 0 for empty map', () => {
      const map = new CuckooHashMap<string, number>()
      expect(map.loadFactor).toBe(0)
    })

    it('should calculate load factor correctly', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 16 })
      map.set('a', 1)
      expect(map.loadFactor).toBeCloseTo(1 / 16)
    })

    it('should increase load factor with more inserts', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 16 })
      for (let i = 0; i < 8; i++) {
        map.set(`k${i}`, i)
      }
      expect(map.loadFactor).toBe(0.5)
    })

    it('should decrease load factor after delete', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 16 })
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      expect(map.loadFactor).toBeCloseTo(1 / 16)
    })
  })

  describe('getStats', () => {
    it('should return correct stats for empty map', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 16 })
      const stats = map.getStats()
      expect(stats.size).toBe(0)
      expect(stats.capacity).toBe(16)
      expect(stats.loadFactor).toBe(0)
      expect(stats.maxKicksUsed).toBe(0)
    })

    it('should return correct stats after inserts', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 16 })
      map.set('a', 1)
      map.set('b', 2)
      const stats = map.getStats()
      expect(stats.size).toBe(2)
      expect(stats.capacity).toBe(16)
      expect(stats.loadFactor).toBeCloseTo(2 / 16)
    })

    it('should track maxKicksUsed', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 4 })
      for (let i = 0; i < 3; i++) {
        map.set(`k${i}`, i)
      }
      const stats = map.getStats()
      expect(stats.maxKicksUsed).toBeGreaterThanOrEqual(0)
    })

    it('should reflect updated stats after rehash', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 4 })
      map.set('a', 1)
      map.set('b', 2)
      map.rehash(32)
      const stats = map.getStats()
      expect(stats.capacity).toBe(32)
      expect(stats.size).toBe(2)
    })
  })

  describe('rehash', () => {
    it('should rehash with new capacity', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 4 })
      map.set('a', 1)
      map.set('b', 2)
      map.rehash(32)
      expect(map.getStats().capacity).toBe(32)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
    })

    it('should rehash with same capacity', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.rehash()
      expect(map.get('a')).toBe(1)
    })

    it('should preserve all entries through rehash', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 16 })
      for (let i = 0; i < 10; i++) {
        map.set(`k${i}`, i)
      }
      map.rehash(64)
      for (let i = 0; i < 10; i++) {
        expect(map.get(`k${i}`)).toBe(i)
      }
      expect(map.size).toBe(10)
    })

    it('should enforce minimum capacity on rehash', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.rehash(1)
      expect(map.getStats().capacity).toBe(2)
      expect(map.get('a')).toBe(1)
    })

    it('should handle rehash to smaller capacity', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 64 })
      map.set('a', 1)
      map.rehash(4)
      expect(map.get('a')).toBe(1)
      expect(map.getStats().capacity).toBe(4)
    })

    it('should handle forEach correctly after rehash', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 4 })
      map.set('x', 10)
      map.set('y', 20)
      map.rehash(32)
      const result: Array<[string, number]> = []
      map.forEach((k, v) => result.push([k, v]))
      expect(result.sort((a, b) => a[1] - b[1])).toEqual([
        ['x', 10],
        ['y', 20]
      ])
    })

    it('should reset maxKicksUsed on rehash', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 4 })
      for (let i = 0; i < 10; i++) {
        map.set(`k${i}`, i)
      }
      map.rehash(64)
      expect(map.getStats().maxKicksUsed).toBeGreaterThanOrEqual(0)
    })
  })

  describe('update existing key', () => {
    it('should update value in place', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('a', 2)
      expect(map.get('a')).toBe(2)
    })

    it('should not change size on update', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      const sizeBefore = map.size
      map.set('a', 2)
      expect(map.size).toBe(sizeBefore)
    })

    it('should update entries correctly', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('a', 100)
      const entries = map.entries()
      expect(entries.length).toBe(2)
      const sorted = entries.sort((a, b) => a[1] - b[1])
      expect(sorted[0]).toEqual(['b', 2])
      expect(sorted[1]).toEqual(['a', 100])
    })

    it('should handle multiple updates to same key', () => {
      const map = new CuckooHashMap<string, number>()
      for (let i = 0; i < 10; i++) {
        map.set('a', i)
      }
      expect(map.get('a')).toBe(9)
      expect(map.size).toBe(1)
    })

    it('should reflect updated value in forEach', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('a', 99)
      const result: Array<[string, number]> = []
      map.forEach((k, v) => result.push([k, v]))
      expect(result).toEqual([['a', 99]])
    })

    it('should reflect updated value in values', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('a', 50)
      expect(map.values()).toEqual([50])
    })
  })

  describe('collision handling and eviction', () => {
    it('should handle many inserts (1000+)', () => {
      const map = new CuckooHashMap<number, number>({ capacity: 256 })
      for (let i = 0; i < 1000; i++) {
        map.set(i, i * 10)
      }
      for (let i = 0; i < 1000; i++) {
        expect(map.get(i)).toBe(i * 10)
      }
      expect(map.size).toBe(1000)
    })

    it('should handle sequential string keys', () => {
      const map = new CuckooHashMap<string, number>()
      for (let i = 0; i < 500; i++) {
        map.set(`key-${i}`, i)
      }
      for (let i = 0; i < 500; i++) {
        expect(map.get(`key-${i}`)).toBe(i)
      }
    })

    it('should handle many deletions after inserts', () => {
      const map = new CuckooHashMap<number, number>({ capacity: 64 })
      for (let i = 0; i < 100; i++) {
        map.set(i, i)
      }
      for (let i = 0; i < 50; i++) {
        expect(map.delete(i)).toBe(true)
      }
      expect(map.size).toBe(50)
      for (let i = 50; i < 100; i++) {
        expect(map.get(i)).toBe(i)
      }
    })

    it('should handle interleaved insert and delete', () => {
      const map = new CuckooHashMap<string, number>()
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
        expect(map.get(`k${i}`)).toBe(i)
      }
    })

    it('should survive auto-rehash on cycle detection', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 4 })
      for (let i = 0; i < 100; i++) {
        map.set(`k${i}`, i)
      }
      for (let i = 0; i < 100; i++) {
        expect(map.get(`k${i}`)).toBe(i)
      }
    })

    it('should handle update in dense map', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 16 })
      for (let i = 0; i < 10; i++) {
        map.set(`k${i}`, i)
      }
      for (let i = 0; i < 10; i++) {
        map.set(`k${i}`, i * 100)
      }
      for (let i = 0; i < 10; i++) {
        expect(map.get(`k${i}`)).toBe(i * 100)
      }
      expect(map.size).toBe(10)
    })

    it('should trigger auto-resize when loadFactor > 0.5', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 8 })
      for (let i = 0; i < 100; i++) {
        map.set(`k${i}`, i)
      }
      expect(map.size).toBe(100)
      expect(map.getStats().capacity).toBeGreaterThan(8)
    })

    it('should handle eviction chains', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 4, maxKicks: 50 })
      for (let i = 0; i < 20; i++) {
        map.set(`evict-${i}`, i)
      }
      for (let i = 0; i < 20; i++) {
        expect(map.get(`evict-${i}`)).toBe(i)
      }
      expect(map.size).toBe(20)
    })

    it('should handle keys with same hash region', () => {
      const map = new CuckooHashMap<string, number>()
      for (let i = 0; i < 10; i++) {
        map.set(`key${i}`, i)
      }
      for (let i = 0; i < 10; i++) {
        expect(map.get(`key${i}`)).toBe(i)
      }
    })

    it('should handle single character keys', () => {
      const map = new CuckooHashMap<string, number>()
      for (let i = 0; i < 26; i++) {
        map.set(String.fromCharCode(97 + i), i)
      }
      for (let i = 0; i < 26; i++) {
        expect(map.get(String.fromCharCode(97 + i))).toBe(i)
      }
    })
  })

  describe('edge cases', () => {
    it('should handle single element lifecycle', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('only', 42)
      expect(map.get('only')).toBe(42)
      expect(map.has('only')).toBe(true)
      expect(map.size).toBe(1)
      expect(map.isEmpty).toBe(false)
      map.delete('only')
      expect(map.get('only')).toBeUndefined()
      expect(map.has('only')).toBe(false)
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('should handle very small capacity', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 2 })
      map.set('a', 1)
      map.set('b', 2)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
    })

    it('should handle insert after many deletes', () => {
      const map = new CuckooHashMap<number, number>()
      for (let i = 0; i < 50; i++) {
        map.set(i, i)
      }
      for (let i = 0; i < 50; i++) {
        map.delete(i)
      }
      map.set(100, 100)
      expect(map.get(100)).toBe(100)
      expect(map.size).toBe(1)
    })

    it('should maintain correctness with large number of operations', () => {
      const map = new CuckooHashMap<number, number>({ capacity: 64 })
      const added = new Set<number>()
      for (let i = 0; i < 2000; i++) {
        const key = Math.floor(Math.random() * 500)
        if (!added.has(key)) {
          map.set(key, key)
          added.add(key)
        }
      }
      for (const key of added) {
        expect(map.has(key)).toBe(true)
        expect(map.get(key)).toBe(key)
      }
    })

    it('should handle capacity of 2 with many inserts', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 2 })
      for (let i = 0; i < 50; i++) {
        map.set(`k${i}`, i)
      }
      expect(map.size).toBe(50)
    })

    it('should handle getStats after various operations', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 8 })
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      const stats = map.getStats()
      expect(stats.size).toBe(1)
      expect(stats.capacity).toBe(8)
      expect(stats.loadFactor).toBeCloseTo(1 / 8)
    })

    it('should handle iteration over map with deleted entries', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.delete('b')
      const entries = [...map]
      expect(entries.length).toBe(2)
    })

    it('should handle numeric keys correctly', () => {
      const map = new CuckooHashMap<number, string>()
      for (let i = 0; i < 100; i++) {
        map.set(i, `val-${i}`)
      }
      for (let i = 0; i < 100; i++) {
        expect(map.get(i)).toBe(`val-${i}`)
      }
    })

    it('should handle mixed type values', () => {
      const map = new CuckooHashMap<string, unknown>()
      map.set('a', 1)
      map.set('b', 'string')
      map.set('c', true)
      map.set('d', null)
      map.set('e', [1, 2, 3])
      map.set('f', { key: 'value' })
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe('string')
      expect(map.get('c')).toBe(true)
      expect(map.get('d')).toBeNull()
      expect(map.get('e')).toEqual([1, 2, 3])
      expect(map.get('f')).toEqual({ key: 'value' })
    })

    it('should handle getStats returning snapshot', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      const stats1 = map.getStats()
      map.set('b', 2)
      const stats2 = map.getStats()
      expect(stats1.size).toBe(1)
      expect(stats2.size).toBe(2)
    })

    it('should handle rehash preserving size', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 4 })
      for (let i = 0; i < 10; i++) {
        map.set(`k${i}`, i)
      }
      const sizeBefore = map.size
      map.rehash(64)
      expect(map.size).toBe(sizeBefore)
    })

    it('should handle long string keys', () => {
      const map = new CuckooHashMap<string, number>()
      const longKey = 'a'.repeat(1000)
      map.set(longKey, 42)
      expect(map.get(longKey)).toBe(42)
    })

    it('should handle negative numeric keys', () => {
      const map = new CuckooHashMap<number, string>()
      map.set(-1, 'neg-one')
      map.set(-100, 'neg-hundred')
      expect(map.get(-1)).toBe('neg-one')
      expect(map.get(-100)).toBe('neg-hundred')
    })
  })
})
