import { describe, it, expect, beforeEach } from 'vitest'
import { SplayMap } from '../../src/core/splay-map/splay-map.js'
import { DEFAULT_SPLAY_MAP_OPTIONS } from '../../src/core/splay-map/types.js'
import type { SplayMapOptions, SplayMapStatistics, SplayMapJSON, SplayMapNodeJSON } from '../../src/core/splay-map/types.js'

describe('SplayMap', () => {
  let map: SplayMap<number, string>

  beforeEach(() => {
    map = new SplayMap<number, string>()
  })

  describe('constructor', () => {
    it('should create empty map with no args', () => {
      const m = new SplayMap()
      expect(m.size).toBe(0)
      expect(m.isEmpty).toBe(true)
    })

    it('should accept empty options object', () => {
      const m = new SplayMap<number, string>({})
      expect(m.size).toBe(0)
    })

    it('should accept custom comparator', () => {
      const reverseComp = (a: number, b: number): number => b - a
      const m = new SplayMap<number, string>({ comparator: reverseComp })
      m.set(1, 'one')
      m.set(2, 'two')
      m.set(3, 'three')
      expect(m.keys()).toEqual([3, 2, 1])
    })

    it('should use default comparator when none provided', () => {
      const m = new SplayMap<number, string>()
      m.set(3, 'three')
      m.set(1, 'one')
      m.set(2, 'two')
      expect(m.keys()).toEqual([1, 2, 3])
    })
  })

  describe('set', () => {
    it('should insert first element', () => {
      map.set(1, 'one')
      expect(map.size).toBe(1)
      expect(map.isEmpty).toBe(false)
    })

    it('should insert multiple elements', () => {
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      expect(map.size).toBe(3)
    })

    it('should update existing key', () => {
      map.set(1, 'one')
      map.set(1, 'updated')
      expect(map.size).toBe(1)
      expect(map.get(1)).toBe('updated')
    })

    it('should track set statistics', () => {
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      expect(map.getStatistics().sets).toBe(3)
    })

    it('should track set stat on update', () => {
      map.set(1, 'one')
      map.set(1, 'updated')
      expect(map.getStatistics().sets).toBe(2)
    })

    it('should handle insertions in descending order', () => {
      map.set(5, 'five')
      map.set(4, 'four')
      map.set(3, 'three')
      map.set(2, 'two')
      map.set(1, 'one')
      expect(map.size).toBe(5)
      expect(map.keys()).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle insertions in ascending order', () => {
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      expect(map.keys()).toEqual([1, 2, 3])
    })

    it('should handle mixed order insertions', () => {
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(4, 'four')
      map.set(2, 'two')
      expect(map.keys()).toEqual([1, 2, 3, 4])
    })

    it('should maintain BST invariants', () => {
      map.set(5, 'a')
      map.set(3, 'b')
      map.set(7, 'c')
      map.set(1, 'd')
      map.set(4, 'e')
      expect(map.keys()).toEqual([1, 3, 4, 5, 7])
    })

    it('should splay inserted key to root', () => {
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.set(5, 'five')
      expect(map.get(5)).toBe('five')
    })

    it('should update maxDepth on insert', () => {
      map.set(1, 'a')
      expect(map.getStatistics().maxDepth).toBeGreaterThanOrEqual(1)
    })

    it('should handle many insertions', () => {
      for (let i = 0; i < 100; i++) {
        map.set(i, `val-${i}`)
      }
      expect(map.size).toBe(100)
    })
  })

  describe('get', () => {
    it('should return undefined for missing key', () => {
      expect(map.get(99)).toBeUndefined()
    })

    it('should return undefined on empty map', () => {
      expect(map.get(1)).toBeUndefined()
    })

    it('should return value for existing key', () => {
      map.set(1, 'one')
      expect(map.get(1)).toBe('one')
    })

    it('should return updated value', () => {
      map.set(1, 'one')
      map.set(1, 'updated')
      expect(map.get(1)).toBe('updated')
    })

    it('should splay accessed key to root', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.get(1)
      const stats = map.getStatistics()
      expect(stats.splayOperations).toBeGreaterThan(0)
    })

    it('should track get statistics for found key', () => {
      map.set(1, 'one')
      map.get(1)
      expect(map.getStatistics().gets).toBe(1)
    })

    it('should track get statistics for missing key', () => {
      map.get(99)
      expect(map.getStatistics().gets).toBe(1)
    })

    it('should accumulate get statistics', () => {
      map.set(1, 'one')
      map.get(1)
      map.get(2)
      map.get(1)
      expect(map.getStatistics().gets).toBe(3)
    })

    it('should handle get after delete', () => {
      map.set(1, 'one')
      map.delete(1)
      expect(map.get(1)).toBeUndefined()
    })

    it('should not change size on get', () => {
      map.set(1, 'one')
      map.get(1)
      expect(map.size).toBe(1)
    })
  })

  describe('delete', () => {
    it('should return false for missing key', () => {
      expect(map.delete(99)).toBe(false)
    })

    it('should return false on empty map', () => {
      expect(map.delete(1)).toBe(false)
    })

    it('should return true for existing key', () => {
      map.set(1, 'one')
      expect(map.delete(1)).toBe(true)
    })

    it('should decrease size', () => {
      map.set(1, 'one')
      map.set(2, 'two')
      map.delete(1)
      expect(map.size).toBe(1)
    })

    it('should make key not found', () => {
      map.set(1, 'one')
      map.delete(1)
      expect(map.get(1)).toBeUndefined()
      expect(map.has(1)).toBe(false)
    })

    it('should track delete statistics', () => {
      map.set(1, 'one')
      map.delete(1)
      expect(map.getStatistics().deletes).toBe(1)
    })

    it('should not track delete stat on failed delete', () => {
      map.delete(99)
      expect(map.getStatistics().deletes).toBe(0)
    })

    it('should handle delete root', () => {
      map.set(1, 'one')
      map.delete(1)
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('should handle delete with only left child', () => {
      map.set(5, 'a')
      map.set(3, 'b')
      map.delete(5)
      expect(map.size).toBe(1)
      expect(map.get(3)).toBe('b')
    })

    it('should handle delete with only right child', () => {
      map.set(3, 'a')
      map.set(5, 'b')
      map.delete(3)
      expect(map.size).toBe(1)
      expect(map.get(5)).toBe('b')
    })

    it('should handle delete with both children', () => {
      map.set(5, 'a')
      map.set(3, 'b')
      map.set(7, 'c')
      map.delete(5)
      expect(map.size).toBe(2)
      expect(map.has(3)).toBe(true)
      expect(map.has(7)).toBe(true)
    })

    it('should handle delete all elements', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.delete(1)
      map.delete(2)
      map.delete(3)
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('should maintain order after delete', () => {
      map.set(5, 'a')
      map.set(3, 'b')
      map.set(7, 'c')
      map.set(1, 'd')
      map.set(4, 'e')
      map.delete(3)
      expect(map.keys()).toEqual([1, 4, 5, 7])
    })
  })

  describe('has', () => {
    it('should return false on empty map', () => {
      expect(map.has(1)).toBe(false)
    })

    it('should return true for existing key', () => {
      map.set(1, 'one')
      expect(map.has(1)).toBe(true)
    })

    it('should return false for missing key', () => {
      map.set(1, 'one')
      expect(map.has(2)).toBe(false)
    })

    it('should return false after delete', () => {
      map.set(1, 'one')
      map.delete(1)
      expect(map.has(1)).toBe(false)
    })

    it('should return true after update', () => {
      map.set(1, 'one')
      map.set(1, 'updated')
      expect(map.has(1)).toBe(true)
    })

    it('should not change size', () => {
      map.set(1, 'one')
      map.has(1)
      expect(map.size).toBe(1)
    })
  })

  describe('size', () => {
    it('should be 0 on new map', () => {
      expect(map.size).toBe(0)
    })

    it('should increase on set', () => {
      map.set(1, 'a')
      expect(map.size).toBe(1)
      map.set(2, 'b')
      expect(map.size).toBe(2)
    })

    it('should not increase on update', () => {
      map.set(1, 'a')
      map.set(1, 'b')
      expect(map.size).toBe(1)
    })

    it('should decrease on delete', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.delete(1)
      expect(map.size).toBe(1)
    })

    it('should be 0 after clear', () => {
      map.set(1, 'a')
      map.clear()
      expect(map.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should be true on new map', () => {
      expect(map.isEmpty).toBe(true)
    })

    it('should be false after set', () => {
      map.set(1, 'a')
      expect(map.isEmpty).toBe(false)
    })

    it('should be true after deleting all', () => {
      map.set(1, 'a')
      map.delete(1)
      expect(map.isEmpty).toBe(true)
    })

    it('should be true after clear', () => {
      map.set(1, 'a')
      map.clear()
      expect(map.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should reset size to 0', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.clear()
      expect(map.size).toBe(0)
    })

    it('should reset isEmpty', () => {
      map.set(1, 'a')
      map.clear()
      expect(map.isEmpty).toBe(true)
    })

    it('should make all keys absent', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.clear()
      expect(map.has(1)).toBe(false)
      expect(map.has(2)).toBe(false)
    })

    it('should reset statistics', () => {
      map.set(1, 'a')
      map.get(1)
      map.delete(1)
      map.clear()
      const stats = map.getStatistics()
      expect(stats.sets).toBe(0)
      expect(stats.gets).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.splayOperations).toBe(0)
      expect(stats.rotations).toBe(0)
      expect(stats.maxDepth).toBe(0)
    })

    it('should allow set after clear', () => {
      map.set(1, 'a')
      map.clear()
      map.set(2, 'b')
      expect(map.size).toBe(1)
      expect(map.get(2)).toBe('b')
    })

    it('should be safe to clear empty map', () => {
      map.clear()
      expect(map.size).toBe(0)
    })
  })

  describe('min', () => {
    it('should return undefined on empty map', () => {
      expect(map.min()).toBeUndefined()
    })

    it('should return the only entry', () => {
      map.set(5, 'five')
      expect(map.min()).toEqual([5, 'five'])
    })

    it('should return smallest key', () => {
      map.set(5, 'five')
      map.set(3, 'three')
      map.set(7, 'seven')
      expect(map.min()).toEqual([3, 'three'])
    })

    it('should find min after deletions', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.delete(1)
      expect(map.min()).toEqual([2, 'b'])
    })

    it('should find min regardless of insertion order', () => {
      map.set(10, 'a')
      map.set(1, 'b')
      map.set(5, 'c')
      expect(map.min()).toEqual([1, 'b'])
    })
  })

  describe('max', () => {
    it('should return undefined on empty map', () => {
      expect(map.max()).toBeUndefined()
    })

    it('should return the only entry', () => {
      map.set(5, 'five')
      expect(map.max()).toEqual([5, 'five'])
    })

    it('should return largest key', () => {
      map.set(5, 'five')
      map.set(3, 'three')
      map.set(7, 'seven')
      expect(map.max()).toEqual([7, 'seven'])
    })

    it('should find max after deletions', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.delete(3)
      expect(map.max()).toEqual([2, 'b'])
    })

    it('should find max regardless of insertion order', () => {
      map.set(1, 'a')
      map.set(10, 'b')
      map.set(5, 'c')
      expect(map.max()).toEqual([10, 'b'])
    })
  })

  describe('first', () => {
    it('should return undefined on empty map', () => {
      expect(map.first()).toBeUndefined()
    })

    it('should return min value', () => {
      map.set(5, 'five')
      map.set(3, 'three')
      map.set(7, 'seven')
      expect(map.first()).toBe('three')
    })

    it('should return only value', () => {
      map.set(1, 'one')
      expect(map.first()).toBe('one')
    })
  })

  describe('last', () => {
    it('should return undefined on empty map', () => {
      expect(map.last()).toBeUndefined()
    })

    it('should return max value', () => {
      map.set(5, 'five')
      map.set(3, 'three')
      map.set(7, 'seven')
      expect(map.last()).toBe('seven')
    })

    it('should return only value', () => {
      map.set(1, 'one')
      expect(map.last()).toBe('one')
    })
  })

  describe('lowerBound', () => {
    it('should return undefined on empty map', () => {
      expect(map.lowerBound(5)).toBeUndefined()
    })

    it('should return exact match', () => {
      map.set(5, 'five')
      expect(map.lowerBound(5)).toEqual([5, 'five'])
    })

    it('should return next greater when no exact match', () => {
      map.set(1, 'one')
      map.set(5, 'five')
      map.set(10, 'ten')
      expect(map.lowerBound(3)).toEqual([5, 'five'])
    })

    it('should return smallest when key <= min', () => {
      map.set(5, 'five')
      map.set(10, 'ten')
      expect(map.lowerBound(1)).toEqual([5, 'five'])
    })

    it('should return undefined when key > max', () => {
      map.set(1, 'one')
      map.set(5, 'five')
      expect(map.lowerBound(10)).toBeUndefined()
    })

    it('should return exact match when equal to max', () => {
      map.set(1, 'one')
      map.set(5, 'five')
      expect(map.lowerBound(5)).toEqual([5, 'five'])
    })

    it('should work with many elements', () => {
      for (let i = 0; i < 20; i += 2) {
        map.set(i, `v${i}`)
      }
      expect(map.lowerBound(5)).toEqual([6, 'v6'])
      expect(map.lowerBound(6)).toEqual([6, 'v6'])
    })
  })

  describe('upperBound', () => {
    it('should return undefined on empty map', () => {
      expect(map.upperBound(5)).toBeUndefined()
    })

    it('should return next greater after exact match', () => {
      map.set(1, 'one')
      map.set(5, 'five')
      map.set(10, 'ten')
      expect(map.upperBound(5)).toEqual([10, 'ten'])
    })

    it('should return next greater when no exact match', () => {
      map.set(1, 'one')
      map.set(5, 'five')
      map.set(10, 'ten')
      expect(map.upperBound(3)).toEqual([5, 'five'])
    })

    it('should return undefined when key >= max', () => {
      map.set(1, 'one')
      map.set(5, 'five')
      expect(map.upperBound(5)).toBeUndefined()
    })

    it('should return first element when key < min', () => {
      map.set(5, 'five')
      map.set(10, 'ten')
      expect(map.upperBound(1)).toEqual([5, 'five'])
    })

    it('should work with many elements', () => {
      for (let i = 0; i < 20; i += 2) {
        map.set(i, `v${i}`)
      }
      expect(map.upperBound(4)).toEqual([6, 'v6'])
      expect(map.upperBound(6)).toEqual([8, 'v8'])
    })
  })

  describe('keys', () => {
    it('should return empty array on empty map', () => {
      expect(map.keys()).toEqual([])
    })

    it('should return single key', () => {
      map.set(1, 'a')
      expect(map.keys()).toEqual([1])
    })

    it('should return sorted keys', () => {
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.keys()).toEqual([1, 2, 3])
    })

    it('should not include deleted keys', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.delete(2)
      expect(map.keys()).toEqual([1, 3])
    })

    it('should handle many keys', () => {
      for (let i = 50; i >= 0; i--) {
        map.set(i, `v${i}`)
      }
      const keys = map.keys()
      expect(keys).toHaveLength(51)
      for (let i = 1; i < keys.length; i++) {
        expect(keys[i]).toBeGreaterThan(keys[i - 1]!)
      }
    })
  })

  describe('values', () => {
    it('should return empty array on empty map', () => {
      expect(map.values()).toEqual([])
    })

    it('should return values in key order', () => {
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.values()).toEqual(['a', 'b', 'c'])
    })

    it('should handle duplicate values', () => {
      map.set(1, 'same')
      map.set(2, 'same')
      expect(map.values()).toEqual(['same', 'same'])
    })
  })

  describe('entries', () => {
    it('should return empty array on empty map', () => {
      expect(map.entries()).toEqual([])
    })

    it('should return sorted entries', () => {
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.entries()).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
    })

    it('should return correct entries after update', () => {
      map.set(1, 'old')
      map.set(1, 'new')
      expect(map.entries()).toEqual([[1, 'new']])
    })

    it('should return correct entries after delete', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.delete(2)
      expect(map.entries()).toEqual([[1, 'a'], [3, 'c']])
    })
  })

  describe('forEach', () => {
    it('should not call callback on empty map', () => {
      let count = 0
      map.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should call callback for each entry', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      let count = 0
      map.forEach(() => { count++ })
      expect(count).toBe(3)
    })

    it('should pass value, key, and map', () => {
      map.set(1, 'one')
      const results: Array<{ value: string; key: number; mapRef: SplayMap<number, string> }> = []
      map.forEach((value, key, m) => {
        results.push({ value, key, mapRef: m })
      })
      expect(results).toHaveLength(1)
      expect(results[0]!.value).toBe('one')
      expect(results[0]!.key).toBe(1)
      expect(results[0]!.mapRef).toBe(map)
    })

    it('should iterate in key order', () => {
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      const keys: number[] = []
      map.forEach((_v, k) => keys.push(k))
      expect(keys).toEqual([1, 2, 3])
    })
  })

  describe('[Symbol.iterator]', () => {
    it('should return empty iterator on empty map', () => {
      expect([...map]).toEqual([])
    })

    it('should yield entries in order', () => {
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect([...map]).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
    })

    it('should be usable in for-of', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      const results: Array<[number, string]> = []
      for (const entry of map) {
        results.push(entry)
      }
      expect(results).toEqual([[1, 'a'], [2, 'b']])
    })

    it('should work with destructuring', () => {
      map.set(1, 'one')
      const [key, value] = [...map][0]!
      expect(key).toBe(1)
      expect(value).toBe('one')
    })
  })

  describe('getStatistics', () => {
    it('should return zero stats on new map', () => {
      const stats = map.getStatistics()
      expect(stats.sets).toBe(0)
      expect(stats.gets).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.splayOperations).toBe(0)
      expect(stats.rotations).toBe(0)
      expect(stats.maxDepth).toBe(0)
    })

    it('should track sets', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.getStatistics().sets).toBe(2)
    })

    it('should track gets', () => {
      map.set(1, 'a')
      map.get(1)
      map.get(2)
      expect(map.getStatistics().gets).toBe(2)
    })

    it('should track deletes', () => {
      map.set(1, 'a')
      map.delete(1)
      expect(map.getStatistics().deletes).toBe(1)
    })

    it('should track splayOperations', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.get(1)
      const stats = map.getStatistics()
      expect(stats.splayOperations).toBeGreaterThan(0)
    })

    it('should track rotations', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.get(1)
      const stats = map.getStatistics()
      expect(stats.rotations).toBeGreaterThan(0)
    })

    it('should track maxDepth', () => {
      for (let i = 0; i < 10; i++) {
        map.set(i, `v${i}`)
      }
      const stats = map.getStatistics()
      expect(stats.maxDepth).toBeGreaterThan(0)
    })

    it('should return a copy', () => {
      map.set(1, 'a')
      const stats1 = map.getStatistics()
      map.set(2, 'b')
      const stats2 = map.getStatistics()
      expect(stats1.sets).toBe(1)
      expect(stats2.sets).toBe(2)
    })

    it('should reset on clear', () => {
      map.set(1, 'a')
      map.get(1)
      map.clear()
      const stats = map.getStatistics()
      expect(stats.sets).toBe(0)
      expect(stats.gets).toBe(0)
    })
  })

  describe('toJSON', () => {
    it('should serialize empty map', () => {
      const json = map.toJSON()
      expect(json.root).toBeNull()
      expect(json.size).toBe(0)
    })

    it('should serialize single entry', () => {
      map.set(1, 'one')
      const json = map.toJSON()
      expect(json.root).not.toBeNull()
      expect(json.root!.key).toBe(1)
      expect(json.root!.value).toBe('one')
    })

    it('should serialize multiple entries', () => {
      map.set(2, 'two')
      map.set(1, 'one')
      map.set(3, 'three')
      const json = map.toJSON()
      expect(json.size).toBe(3)
    })

    it('should include statistics', () => {
      map.set(1, 'one')
      map.get(1)
      const json = map.toJSON()
      expect(json.statistics.sets).toBe(1)
      expect(json.statistics.gets).toBe(1)
    })

    it('should include left and right children', () => {
      map.set(2, 'root')
      map.set(1, 'left')
      map.set(3, 'right')
      const json = map.toJSON()
      expect(json.root).not.toBeNull()
    })

    it('should have null children for leaf nodes', () => {
      map.set(1, 'leaf')
      const json = map.toJSON()
      expect(json.root!.left).toBeNull()
      expect(json.root!.right).toBeNull()
    })
  })

  describe('fromJSON', () => {
    it('should restore empty map', () => {
      const json = map.toJSON()
      const restored = SplayMap.fromJSON(json)
      expect(restored.size).toBe(0)
      expect(restored.isEmpty).toBe(true)
    })

    it('should restore single entry', () => {
      map.set(1, 'one')
      const restored = SplayMap.fromJSON(map.toJSON())
      expect(restored.size).toBe(1)
      expect(restored.get(1)).toBe('one')
    })

    it('should restore multiple entries', () => {
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      const restored = SplayMap.fromJSON(map.toJSON())
      expect(restored.size).toBe(3)
      expect(restored.keys()).toEqual([1, 2, 3])
    })

    it('should round-trip correctly', () => {
      for (let i = 0; i < 20; i++) {
        map.set(i, `val-${i}`)
      }
      const json = map.toJSON()
      const restored = SplayMap.fromJSON<number, string>(json)
      expect(restored.size).toBe(20)
      for (let i = 0; i < 20; i++) {
        expect(restored.has(i)).toBe(true)
      }
    })

    it('should preserve statistics', () => {
      map.set(1, 'a')
      map.get(1)
      const json = map.toJSON()
      const restored = SplayMap.fromJSON(json)
      expect(restored.getStatistics().sets).toBe(1)
      expect(restored.getStatistics().gets).toBe(1)
    })

    it('should allow operations after restore', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      const restored = SplayMap.fromJSON(map.toJSON())
      restored.set(3, 'c')
      expect(restored.size).toBe(3)
      restored.delete(1)
      expect(restored.has(2)).toBe(true)
      expect(restored.has(3)).toBe(true)
    })

    it('should preserve values', () => {
      map.set(1, 'hello')
      map.set(2, 'world')
      const restored = SplayMap.fromJSON(map.toJSON())
      expect(restored.get(1)).toBe('hello')
      expect(restored.get(2)).toBe('world')
    })
  })

  describe('DEFAULT_SPLAY_MAP_OPTIONS', () => {
    it('should have comparator defined', () => {
      expect(DEFAULT_SPLAY_MAP_OPTIONS.comparator).toBeDefined()
      expect(typeof DEFAULT_SPLAY_MAP_OPTIONS.comparator).toBe('function')
    })

    it('should have comparator that returns 0 for equal values', () => {
      expect(DEFAULT_SPLAY_MAP_OPTIONS.comparator(1, 1)).toBe(0)
    })

    it('should have comparator that returns -1 for a < b', () => {
      expect(DEFAULT_SPLAY_MAP_OPTIONS.comparator(1, 2)).toBe(-1)
    })

    it('should have comparator that returns 1 for a > b', () => {
      expect(DEFAULT_SPLAY_MAP_OPTIONS.comparator(2, 1)).toBe(1)
    })

    it('should work with string comparator', () => {
      expect(DEFAULT_SPLAY_MAP_OPTIONS.comparator('a', 'b')).toBe(-1)
      expect(DEFAULT_SPLAY_MAP_OPTIONS.comparator('b', 'a')).toBe(1)
      expect(DEFAULT_SPLAY_MAP_OPTIONS.comparator('a', 'a')).toBe(0)
    })
  })

  describe('exports', () => {
    it('should export SplayMap class', () => {
      expect(SplayMap).toBeDefined()
      expect(typeof SplayMap).toBe('function')
    })

    it('should export DEFAULT_SPLAY_MAP_OPTIONS', () => {
      expect(DEFAULT_SPLAY_MAP_OPTIONS).toBeDefined()
    })

    it('should allow type-only imports for options', () => {
      const opts: SplayMapOptions<number> = {}
      const m = new SplayMap<number, string>(opts)
      expect(m.size).toBe(0)
    })

    it('should allow type import for SplayMapJSON', () => {
      const m = new SplayMap<number, string>()
      const json: SplayMapJSON<number, string> = m.toJSON()
      expect(json.size).toBe(0)
    })

    it('should allow type import for SplayMapStatistics', () => {
      const m = new SplayMap()
      const stats: SplayMapStatistics = m.getStatistics()
      expect(stats.sets).toBe(0)
    })

    it('should allow type import for SplayMapNodeJSON', () => {
      const node: SplayMapNodeJSON<number, string> | null = null
      expect(node).toBeNull()
    })
  })

  describe('splay behavior', () => {
    it('should splay on get', () => {
      for (let i = 1; i <= 5; i++) map.set(i, `v${i}`)
      const before = map.getStatistics().splayOperations
      map.get(1)
      expect(map.getStatistics().splayOperations).toBeGreaterThan(before)
    })

    it('should splay on set', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      expect(map.getStatistics().splayOperations).toBeGreaterThan(0)
    })

    it('should splay on delete', () => {
      for (let i = 1; i <= 5; i++) map.set(i, `v${i}`)
      const before = map.getStatistics().splayOperations
      map.delete(3)
      expect(map.getStatistics().splayOperations).toBeGreaterThan(before)
    })

    it('should splay on has', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      const before = map.getStatistics().splayOperations
      map.has(1)
      expect(map.getStatistics().splayOperations).toBeGreaterThan(before)
    })

    it('should produce rotations during splay', () => {
      for (let i = 1; i <= 10; i++) map.set(i, `v${i}`)
      map.get(1)
      expect(map.getStatistics().rotations).toBeGreaterThan(0)
    })
  })

  describe('string keys', () => {
    it('should work with string keys', () => {
      const m = new SplayMap<string, number>()
      m.set('banana', 2)
      m.set('apple', 1)
      m.set('cherry', 3)
      expect(m.keys()).toEqual(['apple', 'banana', 'cherry'])
      expect(m.get('banana')).toBe(2)
    })

    it('should maintain string order', () => {
      const m = new SplayMap<string, number>()
      m.set('z', 1)
      m.set('a', 2)
      m.set('m', 3)
      expect(m.keys()).toEqual(['a', 'm', 'z'])
    })
  })

  describe('edge cases', () => {
    it('should handle set-delete-set cycle', () => {
      map.set(1, 'first')
      map.delete(1)
      map.set(1, 'second')
      expect(map.get(1)).toBe('second')
      expect(map.size).toBe(1)
    })

    it('should handle many operations', () => {
      for (let i = 0; i < 50; i++) {
        map.set(i, `v${i}`)
      }
      for (let i = 0; i < 25; i++) {
        map.delete(i)
      }
      expect(map.size).toBe(25)
      for (let i = 25; i < 50; i++) {
        expect(map.has(i)).toBe(true)
      }
      for (let i = 0; i < 25; i++) {
        expect(map.has(i)).toBe(false)
      }
    })

    it('should handle rapid clear and refill', () => {
      for (let cycle = 0; cycle < 5; cycle++) {
        for (let i = 0; i < 10; i++) {
          map.set(i, `cycle-${cycle}-val-${i}`)
        }
        map.clear()
      }
      expect(map.size).toBe(0)
    })

    it('should handle accessing min after many operations', () => {
      for (let i = 100; i >= 0; i--) {
        map.set(i, `v${i}`)
      }
      for (let i = 0; i <= 50; i++) {
        map.delete(i)
      }
      expect(map.min()).toEqual([51, 'v51'])
    })

    it('should handle accessing max after many operations', () => {
      for (let i = 0; i <= 100; i++) {
        map.set(i, `v${i}`)
      }
      for (let i = 51; i <= 100; i++) {
        map.delete(i)
      }
      expect(map.max()).toEqual([50, 'v50'])
    })

    it('should handle update after many splay operations', () => {
      for (let i = 0; i < 20; i++) {
        map.set(i, `v${i}`)
      }
      for (let i = 0; i < 20; i++) {
        map.get(i)
      }
      map.set(10, 'updated')
      expect(map.get(10)).toBe('updated')
      expect(map.size).toBe(20)
    })

    it('should handle duplicate key set many times', () => {
      for (let i = 0; i < 100; i++) {
        map.set(1, `val-${i}`)
      }
      expect(map.size).toBe(1)
      expect(map.get(1)).toBe('val-99')
    })

    it('should handle negative keys', () => {
      map.set(-5, 'neg5')
      map.set(0, 'zero')
      map.set(5, 'pos5')
      expect(map.keys()).toEqual([-5, 0, 5])
    })

    it('should handle sequential delete from front', () => {
      for (let i = 0; i < 10; i++) map.set(i, `v${i}`)
      for (let i = 0; i < 10; i++) {
        expect(map.delete(i)).toBe(true)
      }
      expect(map.size).toBe(0)
    })

    it('should handle sequential delete from back', () => {
      for (let i = 0; i < 10; i++) map.set(i, `v${i}`)
      for (let i = 9; i >= 0; i--) {
        expect(map.delete(i)).toBe(true)
      }
      expect(map.size).toBe(0)
    })
  })

  describe('integration', () => {
    it('should handle mixed operations', () => {
      map.set(5, 'a')
      map.set(3, 'b')
      map.set(7, 'c')
      expect(map.get(5)).toBe('a')
      map.set(5, 'updated')
      expect(map.has(3)).toBe(true)
      map.delete(3)
      expect(map.size).toBe(2)
      expect(map.keys()).toEqual([5, 7])
      expect(map.min()).toEqual([5, 'updated'])
      expect(map.max()).toEqual([7, 'c'])
    })

    it('should maintain correctness after stress', () => {
      const reference = new Map<number, string>()
      for (let i = 0; i < 200; i++) {
        const key = Math.floor(Math.random() * 100)
        const op = Math.random()
        if (op < 0.5) {
          map.set(key, `v${key}`)
          reference.set(key, `v${key}`)
        } else if (op < 0.8 && reference.has(key)) {
          map.delete(key)
          reference.delete(key)
        } else {
          map.set(key, `v${key}`)
          reference.set(key, `v${key}`)
        }
      }
      expect(map.size).toBe(reference.size)
      for (const key of reference.keys()) {
        expect(map.has(key)).toBe(true)
      }
      if (reference.size > 0) {
        const sortedKeys = [...reference.keys()].sort((a, b) => a - b)
        expect(map.keys()).toEqual(sortedKeys)
      }
    })
  })
})
