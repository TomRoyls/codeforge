import { describe, it, expect, beforeEach } from 'vitest'
import { TreapMultimap } from '../../src/core/treap-multimap/treap-multimap.js'
import { DEFAULT_TREAP_MULTIMAP_OPTIONS } from '../../src/core/treap-multimap/types.js'
import type { TreapMultimapOptions, TreapMultimapJSON, TreapMultimapStatistics } from '../../src/core/treap-multimap/types.js'

describe('TreapMultimap', () => {
  let treap: TreapMultimap<string, number>

  beforeEach(() => {
    treap = new TreapMultimap()
  })

  describe('constructor', () => {
    it('should create with default options', () => {
      const t = new TreapMultimap()
      expect(t.isEmpty).toBe(true)
      expect(t.size).toBe(0)
      expect(t.keyCount).toBe(0)
    })

    it('should accept empty options object', () => {
      const t = new TreapMultimap({})
      expect(t.isEmpty).toBe(true)
    })

    it('should accept custom comparator', () => {
      const reverseCmp = (a: number, b: number) => b - a
      const t = new TreapMultimap<number, string>({ comparator: reverseCmp })
      t.set(1, 'a')
      t.set(2, 'b')
      t.set(3, 'c')
      const keys = t.keys()
      expect(keys[0]).toBe(3)
      expect(keys[2]).toBe(1)
    })

    it('should accept custom priority generator', () => {
      let counter = 0
      const t = new TreapMultimap<string, number>({
        priorityGenerator: () => counter++,
      })
      t.set('a', 1)
      t.set('b', 2)
      t.set('c', 3)
      expect(t.keyCount).toBe(3)
    })

    it('should work with no arguments', () => {
      const t = new TreapMultimap()
      t.set('x', 1)
      expect(t.get('x')).toEqual([1])
    })

    it('should use default comparator for strings', () => {
      const t = new TreapMultimap<string, number>()
      t.set('b', 2)
      t.set('a', 1)
      t.set('c', 3)
      expect(t.keys()).toEqual(['a', 'b', 'c'])
    })

    it('should use default comparator for numbers', () => {
      const t = new TreapMultimap<number, string>()
      t.set(3, 'c')
      t.set(1, 'a')
      t.set(2, 'b')
      expect(t.keys()).toEqual([1, 2, 3])
    })

    it('should accept options with only comparator', () => {
      const t = new TreapMultimap<number, number>({
        comparator: (a, b) => a - b,
      })
      t.set(5, 50)
      expect(t.get(5)).toEqual([50])
    })

    it('should accept options with only priorityGenerator', () => {
      const t = new TreapMultimap<string, number>({
        priorityGenerator: () => 0.5,
      })
      t.set('a', 1)
      expect(t.get('a')).toEqual([1])
    })
  })

  describe('set', () => {
    it('should add a single key-value pair', () => {
      treap.set('a', 1)
      expect(treap.get('a')).toEqual([1])
      expect(treap.size).toBe(1)
      expect(treap.keyCount).toBe(1)
    })

    it('should add multiple values to same key', () => {
      treap.set('a', 1)
      treap.set('a', 2)
      treap.set('a', 3)
      expect(treap.get('a')).toEqual([1, 2, 3])
      expect(treap.size).toBe(3)
      expect(treap.keyCount).toBe(1)
    })

    it('should add values to different keys', () => {
      treap.set('a', 1)
      treap.set('b', 2)
      treap.set('c', 3)
      expect(treap.size).toBe(3)
      expect(treap.keyCount).toBe(3)
    })

    it('should track set statistics', () => {
      treap.set('a', 1)
      treap.set('b', 2)
      treap.set('a', 3)
      expect(treap.getStatistics().sets).toBe(3)
    })

    it('should handle duplicate values on same key', () => {
      treap.set('a', 1)
      treap.set('a', 1)
      expect(treap.get('a')).toEqual([1, 1])
      expect(treap.size).toBe(2)
    })

    it('should handle many keys', () => {
      for (let i = 0; i < 100; i++) {
        treap.set(`key-${i}`, i)
      }
      expect(treap.keyCount).toBe(100)
      expect(treap.size).toBe(100)
    })

    it('should handle many values per key', () => {
      for (let i = 0; i < 50; i++) {
        treap.set('a', i)
      }
      expect(treap.get('a').length).toBe(50)
      expect(treap.keyCount).toBe(1)
      expect(treap.size).toBe(50)
    })

    it('should maintain BST ordering after many inserts', () => {
      const keys = ['e', 'b', 'd', 'a', 'c']
      for (const k of keys) {
        treap.set(k, 1)
      }
      expect(treap.keys()).toEqual(['a', 'b', 'c', 'd', 'e'])
    })

    it('should set isEmpty to false', () => {
      expect(treap.isEmpty).toBe(true)
      treap.set('a', 1)
      expect(treap.isEmpty).toBe(false)
    })

    it('should update maxDepth statistic', () => {
      treap.set('a', 1)
      treap.set('b', 2)
      treap.set('c', 3)
      expect(treap.getStatistics().maxDepth).toBeGreaterThan(0)
    })
  })

  describe('get', () => {
    it('should return empty array for missing key', () => {
      expect(treap.get('missing')).toEqual([])
    })

    it('should return single value array', () => {
      treap.set('a', 1)
      expect(treap.get('a')).toEqual([1])
    })

    it('should return all values for key', () => {
      treap.set('a', 1)
      treap.set('a', 2)
      treap.set('a', 3)
      expect(treap.get('a')).toEqual([1, 2, 3])
    })

    it('should return a copy of the values array', () => {
      treap.set('a', 1)
      const vals = treap.get('a')
      vals.push(999)
      expect(treap.get('a')).toEqual([1])
    })

    it('should return empty array on empty treap', () => {
      expect(treap.get('anything')).toEqual([])
    })
  })

  describe('getAll', () => {
    it('should behave identically to get', () => {
      treap.set('a', 1)
      treap.set('a', 2)
      expect(treap.getAll('a')).toEqual(treap.get('a'))
    })

    it('should return empty array for missing key', () => {
      expect(treap.getAll('missing')).toEqual([])
    })

    it('should return all values', () => {
      treap.set('b', 10)
      treap.set('b', 20)
      treap.set('b', 30)
      expect(treap.getAll('b')).toEqual([10, 20, 30])
    })
  })

  describe('delete', () => {
    it('should delete entire key when no value specified', () => {
      treap.set('a', 1)
      treap.set('a', 2)
      const result = treap.delete('a')
      expect(result).toBe(true)
      expect(treap.has('a')).toBe(false)
      expect(treap.size).toBe(0)
      expect(treap.keyCount).toBe(0)
    })

    it('should delete specific value from key', () => {
      treap.set('a', 1)
      treap.set('a', 2)
      treap.set('a', 3)
      const result = treap.delete('a', 2)
      expect(result).toBe(true)
      expect(treap.get('a')).toEqual([1, 3])
      expect(treap.size).toBe(2)
    })

    it('should return false for missing key', () => {
      expect(treap.delete('missing')).toBe(false)
    })

    it('should return false for missing value on existing key', () => {
      treap.set('a', 1)
      expect(treap.delete('a', 999)).toBe(false)
    })

    it('should remove key when last value is deleted', () => {
      treap.set('a', 1)
      treap.delete('a', 1)
      expect(treap.has('a')).toBe(false)
      expect(treap.keyCount).toBe(0)
    })

    it('should track delete statistics', () => {
      treap.set('a', 1)
      treap.delete('a')
      expect(treap.getStatistics().deletes).toBe(1)
    })

    it('should not track delete stats on failed delete', () => {
      treap.delete('missing')
      expect(treap.getStatistics().deletes).toBe(0)
    })

    it('should handle delete on empty treap', () => {
      expect(treap.delete('a')).toBe(false)
    })

    it('should maintain correct counts after multiple deletes', () => {
      treap.set('a', 1)
      treap.set('b', 2)
      treap.set('c', 3)
      treap.delete('b')
      expect(treap.keyCount).toBe(2)
      expect(treap.size).toBe(2)
    })

    it('should maintain BST ordering after deletes', () => {
      treap.set('c', 3)
      treap.set('a', 1)
      treap.set('b', 2)
      treap.set('d', 4)
      treap.delete('b')
      expect(treap.keys()).toEqual(['a', 'c', 'd'])
    })
  })

  describe('deleteKey', () => {
    it('should delete a key entirely', () => {
      treap.set('a', 1)
      treap.set('a', 2)
      treap.set('a', 3)
      const result = treap.deleteKey('a')
      expect(result).toBe(true)
      expect(treap.has('a')).toBe(false)
      expect(treap.size).toBe(0)
    })

    it('should return false for missing key', () => {
      expect(treap.deleteKey('missing')).toBe(false)
    })

    it('should track delete statistics', () => {
      treap.set('a', 1)
      treap.deleteKey('a')
      expect(treap.getStatistics().deletes).toBe(1)
    })

    it('should maintain other keys after deleteKey', () => {
      treap.set('a', 1)
      treap.set('b', 2)
      treap.set('c', 3)
      treap.deleteKey('b')
      expect(treap.has('a')).toBe(true)
      expect(treap.has('c')).toBe(true)
      expect(treap.keyCount).toBe(2)
    })

    it('should allow re-adding deleted key', () => {
      treap.set('a', 1)
      treap.deleteKey('a')
      treap.set('a', 2)
      expect(treap.get('a')).toEqual([2])
    })
  })

  describe('has', () => {
    it('should return false on empty treap', () => {
      expect(treap.has('a')).toBe(false)
    })

    it('should return true for existing key', () => {
      treap.set('a', 1)
      expect(treap.has('a')).toBe(true)
    })

    it('should return false after key is deleted', () => {
      treap.set('a', 1)
      treap.deleteKey('a')
      expect(treap.has('a')).toBe(false)
    })

    it('should return true for key with multiple values', () => {
      treap.set('a', 1)
      treap.set('a', 2)
      expect(treap.has('a')).toBe(true)
    })

    it('should return false for never-added key', () => {
      treap.set('b', 1)
      expect(treap.has('a')).toBe(false)
    })
  })

  describe('hasEntry', () => {
    it('should return true for existing key-value pair', () => {
      treap.set('a', 1)
      expect(treap.hasEntry('a', 1)).toBe(true)
    })

    it('should return false for missing key', () => {
      expect(treap.hasEntry('missing', 1)).toBe(false)
    })

    it('should return false for missing value on existing key', () => {
      treap.set('a', 1)
      expect(treap.hasEntry('a', 999)).toBe(false)
    })

    it('should return true for each value in multimap', () => {
      treap.set('a', 1)
      treap.set('a', 2)
      treap.set('a', 3)
      expect(treap.hasEntry('a', 1)).toBe(true)
      expect(treap.hasEntry('a', 2)).toBe(true)
      expect(treap.hasEntry('a', 3)).toBe(true)
    })

    it('should return false after value is deleted', () => {
      treap.set('a', 1)
      treap.set('a', 2)
      treap.delete('a', 1)
      expect(treap.hasEntry('a', 1)).toBe(false)
      expect(treap.hasEntry('a', 2)).toBe(true)
    })

    it('should return false after key is deleted', () => {
      treap.set('a', 1)
      treap.deleteKey('a')
      expect(treap.hasEntry('a', 1)).toBe(false)
    })
  })

  describe('size', () => {
    it('should be 0 on empty treap', () => {
      expect(treap.size).toBe(0)
    })

    it('should count total values across all keys', () => {
      treap.set('a', 1)
      treap.set('a', 2)
      treap.set('b', 3)
      expect(treap.size).toBe(3)
    })

    it('should decrease after delete', () => {
      treap.set('a', 1)
      treap.set('b', 2)
      treap.delete('a')
      expect(treap.size).toBe(1)
    })

    it('should be 0 after clear', () => {
      treap.set('a', 1)
      treap.set('b', 2)
      treap.clear()
      expect(treap.size).toBe(0)
    })
  })

  describe('keyCount', () => {
    it('should be 0 on empty treap', () => {
      expect(treap.keyCount).toBe(0)
    })

    it('should count unique keys', () => {
      treap.set('a', 1)
      treap.set('a', 2)
      treap.set('b', 3)
      expect(treap.keyCount).toBe(2)
    })

    it('should decrease when key is removed', () => {
      treap.set('a', 1)
      treap.set('b', 2)
      treap.deleteKey('a')
      expect(treap.keyCount).toBe(1)
    })

    it('should not change when value is added to existing key', () => {
      treap.set('a', 1)
      expect(treap.keyCount).toBe(1)
      treap.set('a', 2)
      expect(treap.keyCount).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should be true on new treap', () => {
      expect(treap.isEmpty).toBe(true)
    })

    it('should be false after set', () => {
      treap.set('a', 1)
      expect(treap.isEmpty).toBe(false)
    })

    it('should be true after removing all keys', () => {
      treap.set('a', 1)
      treap.deleteKey('a')
      expect(treap.isEmpty).toBe(true)
    })

    it('should be true after clear', () => {
      treap.set('a', 1)
      treap.clear()
      expect(treap.isEmpty).toBe(true)
    })

    it('should be false with keys having values', () => {
      treap.set('a', 1)
      treap.set('a', 2)
      expect(treap.isEmpty).toBe(false)
    })
  })

  describe('clear', () => {
    it('should reset size to 0', () => {
      treap.set('a', 1)
      treap.set('b', 2)
      treap.clear()
      expect(treap.size).toBe(0)
    })

    it('should reset keyCount to 0', () => {
      treap.set('a', 1)
      treap.set('b', 2)
      treap.clear()
      expect(treap.keyCount).toBe(0)
    })

    it('should reset isEmpty to true', () => {
      treap.set('a', 1)
      treap.clear()
      expect(treap.isEmpty).toBe(true)
    })

    it('should reset statistics', () => {
      treap.set('a', 1)
      treap.delete('a')
      treap.clear()
      const stats = treap.getStatistics()
      expect(stats.sets).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.rotations).toBe(0)
      expect(stats.maxDepth).toBe(0)
      expect(stats.totalValues).toBe(0)
    })

    it('should allow operations after clear', () => {
      treap.set('a', 1)
      treap.clear()
      treap.set('b', 2)
      expect(treap.get('b')).toEqual([2])
    })

    it('should not preserve old data', () => {
      treap.set('a', 1)
      treap.clear()
      expect(treap.has('a')).toBe(false)
      expect(treap.get('a')).toEqual([])
    })
  })

  describe('keys', () => {
    it('should return empty array on empty treap', () => {
      expect(treap.keys()).toEqual([])
    })

    it('should return all keys in sorted order', () => {
      treap.set('c', 1)
      treap.set('a', 2)
      treap.set('b', 3)
      expect(treap.keys()).toEqual(['a', 'b', 'c'])
    })

    it('should not duplicate keys', () => {
      treap.set('a', 1)
      treap.set('a', 2)
      treap.set('a', 3)
      expect(treap.keys()).toEqual(['a'])
    })

    it('should reflect deletions', () => {
      treap.set('a', 1)
      treap.set('b', 2)
      treap.set('c', 3)
      treap.deleteKey('b')
      expect(treap.keys()).toEqual(['a', 'c'])
    })

    it('should return keys in numeric order for number keys', () => {
      const t = new TreapMultimap<number, string>()
      t.set(3, 'c')
      t.set(1, 'a')
      t.set(2, 'b')
      expect(t.keys()).toEqual([1, 2, 3])
    })
  })

  describe('values', () => {
    it('should return empty array on empty treap', () => {
      expect(treap.values()).toEqual([])
    })

    it('should return all values in key order', () => {
      treap.set('a', 1)
      treap.set('b', 2)
      treap.set('c', 3)
      expect(treap.values()).toEqual([1, 2, 3])
    })

    it('should include all values for multimap keys', () => {
      treap.set('a', 1)
      treap.set('a', 2)
      treap.set('b', 3)
      const vals = treap.values()
      expect(vals).toEqual([1, 2, 3])
    })

    it('should reflect deletions', () => {
      treap.set('a', 1)
      treap.set('b', 2)
      treap.delete('a', 1)
      expect(treap.values()).toEqual([2])
    })
  })

  describe('entries', () => {
    it('should return empty array on empty treap', () => {
      expect(treap.entries()).toEqual([])
    })

    it('should return key-value pairs in sorted order', () => {
      treap.set('b', 2)
      treap.set('a', 1)
      treap.set('c', 3)
      const entries = treap.entries()
      expect(entries[0]).toEqual(['a', [1]])
      expect(entries[1]).toEqual(['b', [2]])
      expect(entries[2]).toEqual(['c', [3]])
    })

    it('should include all values per key', () => {
      treap.set('a', 1)
      treap.set('a', 2)
      const entries = treap.entries()
      expect(entries).toEqual([['a', [1, 2]]])
    })

    it('should return copies of value arrays', () => {
      treap.set('a', 1)
      const entries = treap.entries()
      entries[0][1].push(999)
      expect(treap.get('a')).toEqual([1])
    })
  })

  describe('forEach', () => {
    it('should not call callback on empty treap', () => {
      let count = 0
      treap.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should iterate all entries in key order', () => {
      treap.set('c', 3)
      treap.set('a', 1)
      treap.set('b', 2)
      const visited: string[] = []
      treap.forEach((_vals, key) => { visited.push(key) })
      expect(visited).toEqual(['a', 'b', 'c'])
    })

    it('should pass values as array copies', () => {
      treap.set('a', 1)
      treap.forEach((vals) => {
        vals.push(999)
      })
      expect(treap.get('a')).toEqual([1])
    })

    it('should pass the map as third argument', () => {
      treap.set('a', 1)
      let received: TreapMultimap<string, number> | undefined
      treap.forEach((_v, _k, map) => { received = map })
      expect(received).toBe(treap)
    })

    it('should iterate all key-value pairs', () => {
      treap.set('a', 1)
      treap.set('a', 2)
      treap.set('b', 3)
      const result: Array<[string, number[]]> = []
      treap.forEach((vals, key) => { result.push([key, vals]) })
      expect(result).toEqual([['a', [1, 2]], ['b', [3]]])
    })
  })

  describe('[Symbol.iterator]', () => {
    it('should yield nothing on empty treap', () => {
      expect([...treap]).toEqual([])
    })

    it('should yield entries in sorted order', () => {
      treap.set('b', 2)
      treap.set('a', 1)
      treap.set('c', 3)
      const entries = [...treap]
      expect(entries).toEqual([['a', [1]], ['b', [2]], ['c', [3]]])
    })

    it('should yield value array copies', () => {
      treap.set('a', 1)
      const entries = [...treap]
      entries[0][1].push(999)
      expect(treap.get('a')).toEqual([1])
    })

    it('should work with destructuring in for-of', () => {
      treap.set('a', 1)
      treap.set('b', 2)
      const result: string[] = []
      for (const [key] of treap) {
        result.push(key)
      }
      expect(result).toEqual(['a', 'b'])
    })

    it('should yield multiple values per key', () => {
      treap.set('a', 1)
      treap.set('a', 2)
      const entries = [...treap]
      expect(entries).toEqual([['a', [1, 2]]])
    })
  })

  describe('min', () => {
    it('should return undefined on empty treap', () => {
      expect(treap.min).toBeUndefined()
    })

    it('should return the minimum key', () => {
      treap.set('c', 1)
      treap.set('a', 2)
      treap.set('b', 3)
      expect(treap.min).toBe('a')
    })

    it('should update after deletion', () => {
      treap.set('a', 1)
      treap.set('b', 2)
      treap.set('c', 3)
      treap.deleteKey('a')
      expect(treap.min).toBe('b')
    })

    it('should return the only key', () => {
      treap.set('only', 1)
      expect(treap.min).toBe('only')
    })

    it('should work with numeric keys', () => {
      const t = new TreapMultimap<number, string>()
      t.set(5, 'e')
      t.set(1, 'a')
      t.set(3, 'c')
      expect(t.min).toBe(1)
    })
  })

  describe('max', () => {
    it('should return undefined on empty treap', () => {
      expect(treap.max).toBeUndefined()
    })

    it('should return the maximum key', () => {
      treap.set('a', 1)
      treap.set('c', 2)
      treap.set('b', 3)
      expect(treap.max).toBe('c')
    })

    it('should update after deletion', () => {
      treap.set('a', 1)
      treap.set('b', 2)
      treap.set('c', 3)
      treap.deleteKey('c')
      expect(treap.max).toBe('b')
    })

    it('should return the only key', () => {
      treap.set('only', 1)
      expect(treap.max).toBe('only')
    })

    it('should work with numeric keys', () => {
      const t = new TreapMultimap<number, string>()
      t.set(5, 'e')
      t.set(1, 'a')
      t.set(3, 'c')
      expect(t.max).toBe(5)
    })
  })

  describe('getStatistics', () => {
    it('should return all-zero stats on new treap', () => {
      const stats = treap.getStatistics()
      expect(stats.sets).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.rotations).toBe(0)
      expect(stats.maxDepth).toBe(0)
      expect(stats.totalValues).toBe(0)
    })

    it('should track sets', () => {
      treap.set('a', 1)
      treap.set('b', 2)
      treap.set('a', 3)
      expect(treap.getStatistics().sets).toBe(3)
    })

    it('should track deletes', () => {
      treap.set('a', 1)
      treap.delete('a')
      expect(treap.getStatistics().deletes).toBe(1)
    })

    it('should track rotations', () => {
      const t = new TreapMultimap<string, number>({
        priorityGenerator: () => Math.random(),
      })
      for (let i = 0; i < 100; i++) {
        t.set(`key-${i}`, i)
      }
      expect(t.getStatistics().rotations).toBeGreaterThan(0)
    })

    it('should track maxDepth', () => {
      treap.set('a', 1)
      treap.set('b', 2)
      treap.set('c', 3)
      expect(treap.getStatistics().maxDepth).toBeGreaterThan(0)
    })

    it('should track totalValues', () => {
      treap.set('a', 1)
      treap.set('a', 2)
      treap.set('b', 3)
      expect(treap.getStatistics().totalValues).toBe(3)
    })

    it('should return a snapshot copy', () => {
      treap.set('a', 1)
      const stats1 = treap.getStatistics()
      treap.set('b', 2)
      const stats2 = treap.getStatistics()
      expect(stats1.sets).toBe(1)
      expect(stats2.sets).toBe(2)
    })

    it('should have maxDepth of 0 for empty treap', () => {
      expect(treap.getStatistics().maxDepth).toBe(0)
    })

    it('should have maxDepth of 1 for single node', () => {
      treap.set('a', 1)
      expect(treap.getStatistics().maxDepth).toBe(1)
    })
  })

  describe('toJSON', () => {
    it('should produce correct structure', () => {
      treap.set('a', 1)
      const json = treap.toJSON()
      expect(json).toHaveProperty('nodes')
      expect(json).toHaveProperty('statistics')
    })

    it('should include all nodes', () => {
      treap.set('a', 1)
      treap.set('b', 2)
      treap.set('c', 3)
      const json = treap.toJSON()
      expect(json.nodes.length).toBe(3)
    })

    it('should include key, values, and priority per node', () => {
      treap.set('a', 1)
      treap.set('a', 2)
      const json = treap.toJSON()
      const node = json.nodes[0]
      expect(node.key).toBe('a')
      expect(node.values).toEqual([1, 2])
      expect(typeof node.priority).toBe('number')
    })

    it('should include statistics', () => {
      treap.set('a', 1)
      const json = treap.toJSON()
      expect(json.statistics.sets).toBe(1)
      expect(json.statistics.totalValues).toBe(1)
    })

    it('should return empty nodes for empty treap', () => {
      const json = treap.toJSON()
      expect(json.nodes).toEqual([])
    })

    it('should serialize nodes in sorted order', () => {
      treap.set('c', 3)
      treap.set('a', 1)
      treap.set('b', 2)
      const json = treap.toJSON()
      expect(json.nodes.map(n => n.key)).toEqual(['a', 'b', 'c'])
    })
  })

  describe('fromJSON', () => {
    it('should restore a serialized treap', () => {
      treap.set('a', 1)
      treap.set('b', 2)
      treap.set('a', 3)
      const json = treap.toJSON()
      const restored = TreapMultimap.fromJSON(json)
      expect(restored.size).toBe(3)
      expect(restored.keyCount).toBe(2)
      expect(restored.get('a')).toEqual([1, 3])
      expect(restored.get('b')).toEqual([2])
    })

    it('should restore empty treap', () => {
      const json = treap.toJSON()
      const restored = TreapMultimap.fromJSON(json)
      expect(restored.isEmpty).toBe(true)
      expect(restored.size).toBe(0)
    })

    it('should allow operations after restore', () => {
      treap.set('a', 1)
      const restored = TreapMultimap.fromJSON(treap.toJSON())
      restored.set('b', 2)
      expect(restored.size).toBe(2)
      expect(restored.get('b')).toEqual([2])
    })

    it('should preserve key ordering', () => {
      treap.set('c', 3)
      treap.set('a', 1)
      treap.set('b', 2)
      const restored = TreapMultimap.fromJSON(treap.toJSON())
      expect(restored.keys()).toEqual(['a', 'b', 'c'])
    })

    it('should accept options in fromJSON', () => {
      treap.set('a', 1)
      const json = treap.toJSON()
      const restored = TreapMultimap.fromJSON<number, string>(json, {
        comparator: (a, b) => a - b,
      })
      expect(restored.get(1 as unknown as number)).toBeDefined()
    })

    it('should preserve statistics from JSON', () => {
      treap.set('a', 1)
      treap.set('b', 2)
      treap.delete('a')
      const json = treap.toJSON()
      const restored = TreapMultimap.fromJSON(json)
      expect(restored.getStatistics().sets).toBe(json.statistics.sets)
      expect(restored.getStatistics().deletes).toBe(json.statistics.deletes)
    })
  })

  describe('rotations', () => {
    it('should perform rotations with decreasing priorities', () => {
      let priority = 100
      const t = new TreapMultimap<string, number>({
        priorityGenerator: () => priority--,
      })
      t.set('a', 1)
      t.set('b', 2)
      t.set('c', 3)
      expect(t.getStatistics().rotations).toBeGreaterThan(0)
    })

    it('should perform rotations during delete', () => {
      let priority = 0
      const t = new TreapMultimap<string, number>({
        priorityGenerator: () => priority++,
      })
      t.set('a', 1)
      t.set('b', 2)
      t.set('c', 3)
      const rotationsBefore = t.getStatistics().rotations
      t.deleteKey('a')
      expect(t.getStatistics().rotations).toBeGreaterThanOrEqual(rotationsBefore)
    })

    it('should maintain BST property after rotations', () => {
      let priority = 100
      const t = new TreapMultimap<string, number>({
        priorityGenerator: () => priority--,
      })
      t.set('e', 5)
      t.set('c', 3)
      t.set('g', 7)
      t.set('a', 1)
      t.set('d', 4)
      expect(t.keys()).toEqual(['a', 'c', 'd', 'e', 'g'])
    })

    it('should maintain heap property via priorities', () => {
      let priority = 100
      const t = new TreapMultimap<string, number>({
        priorityGenerator: () => priority--,
      })
      t.set('a', 1)
      t.set('b', 2)
      t.set('c', 3)
      expect(t.keys()).toEqual(['a', 'b', 'c'])
      expect(t.getStatistics().rotations).toBeGreaterThan(0)
    })
  })

  describe('edge cases', () => {
    it('should handle insert-delete-reinsert cycle', () => {
      treap.set('a', 1)
      treap.deleteKey('a')
      treap.set('a', 2)
      expect(treap.get('a')).toEqual([2])
      expect(treap.keyCount).toBe(1)
    })

    it('should handle many rapid operations', () => {
      for (let i = 0; i < 200; i++) {
        treap.set(`key-${i}`, i)
      }
      expect(treap.keyCount).toBe(200)
      for (let i = 0; i < 200; i += 2) {
        treap.deleteKey(`key-${i}`)
      }
      expect(treap.keyCount).toBe(100)
    })

    it('should handle clear and rebuild', () => {
      treap.set('a', 1)
      treap.set('b', 2)
      treap.clear()
      treap.set('c', 3)
      expect(treap.keyCount).toBe(1)
      expect(treap.has('a')).toBe(false)
      expect(treap.has('c')).toBe(true)
    })

    it('should handle equal priority values', () => {
      const t = new TreapMultimap<string, number>({
        priorityGenerator: () => 0.5,
      })
      t.set('a', 1)
      t.set('b', 2)
      t.set('c', 3)
      expect(t.keyCount).toBe(3)
      expect(t.keys()).toEqual(['a', 'b', 'c'])
    })

    it('should handle single element operations', () => {
      treap.set('only', 1)
      expect(treap.min).toBe('only')
      expect(treap.max).toBe('only')
      expect(treap.has('only')).toBe(true)
      treap.deleteKey('only')
      expect(treap.isEmpty).toBe(true)
      expect(treap.min).toBeUndefined()
      expect(treap.max).toBeUndefined()
    })

    it('should handle deleting only value from multimap key', () => {
      treap.set('a', 1)
      treap.set('a', 2)
      treap.delete('a', 1)
      treap.delete('a', 2)
      expect(treap.has('a')).toBe(false)
      expect(treap.isEmpty).toBe(true)
    })

    it('should handle deleting wrong value from key', () => {
      treap.set('a', 1)
      expect(treap.delete('a', 999)).toBe(false)
      expect(treap.get('a')).toEqual([1])
    })

    it('should maintain ordering after complex operations', () => {
      const keys = ['e', 'b', 'h', 'a', 'c', 'f', 'g']
      for (const k of keys) {
        treap.set(k, 1)
      }
      treap.deleteKey('b')
      treap.deleteKey('f')
      treap.set('d', 1)
      expect(treap.keys()).toEqual(['a', 'c', 'd', 'e', 'g', 'h'])
    })
  })

  describe('generic type support', () => {
    it('should work with string keys and number values', () => {
      const t = new TreapMultimap<string, number>()
      t.set('a', 1)
      t.set('b', 2)
      expect(t.get('a')).toEqual([1])
    })

    it('should work with number keys and string values', () => {
      const t = new TreapMultimap<number, string>()
      t.set(1, 'one')
      t.set(2, 'two')
      expect(t.get(1)).toEqual(['one'])
    })

    it('should work with object values', () => {
      const t = new TreapMultimap<string, { id: number }>()
      t.set('a', { id: 1 })
      t.set('a', { id: 2 })
      const vals = t.get('a')
      expect(vals.length).toBe(2)
      expect(vals[0].id).toBe(1)
      expect(vals[1].id).toBe(2)
    })

    it('should work with custom comparator for complex keys', () => {
      type Point = { x: number; y: number }
      const t = new TreapMultimap<Point, string>({
        comparator: (a, b) => a.x - b.x || a.y - b.y,
      })
      t.set({ x: 1, y: 2 }, 'a')
      t.set({ x: 1, y: 3 }, 'b')
      expect(t.keyCount).toBe(2)
    })
  })

  describe('DEFAULT_TREAP_MULTIMAP_OPTIONS', () => {
    it('should have a comparator function', () => {
      expect(typeof DEFAULT_TREAP_MULTIMAP_OPTIONS.comparator).toBe('function')
    })

    it('should have a priorityGenerator function', () => {
      expect(typeof DEFAULT_TREAP_MULTIMAP_OPTIONS.priorityGenerator).toBe('function')
    })

    it('should have comparator that returns -1 for a < b', () => {
      expect(DEFAULT_TREAP_MULTIMAP_OPTIONS.comparator(1, 2)).toBe(-1)
    })

    it('should have comparator that returns 1 for a > b', () => {
      expect(DEFAULT_TREAP_MULTIMAP_OPTIONS.comparator(2, 1)).toBe(1)
    })

    it('should have comparator that returns 0 for equal values', () => {
      expect(DEFAULT_TREAP_MULTIMAP_OPTIONS.comparator(1, 1)).toBe(0)
    })

    it('should have priorityGenerator that returns number between 0 and 1', () => {
      const val = DEFAULT_TREAP_MULTIMAP_OPTIONS.priorityGenerator()
      expect(typeof val).toBe('number')
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThanOrEqual(1)
    })
  })

  describe('exports', () => {
    it('should export TreapMultimap class', () => {
      expect(TreapMultimap).toBeDefined()
      expect(typeof TreapMultimap).toBe('function')
    })

    it('should export DEFAULT_TREAP_MULTIMAP_OPTIONS', () => {
      expect(DEFAULT_TREAP_MULTIMAP_OPTIONS).toBeDefined()
    })

    it('should allow type-only import for TreapMultimapOptions', () => {
      const opts: TreapMultimapOptions<string, number> = {}
      const t = new TreapMultimap(opts)
      expect(t.isEmpty).toBe(true)
    })

    it('should allow type-only import for TreapMultimapJSON', () => {
      treap.set('a', 1)
      const json: TreapMultimapJSON<string, number> = treap.toJSON()
      expect(json.nodes.length).toBe(1)
    })

    it('should allow type-only import for TreapMultimapStatistics', () => {
      const stats: TreapMultimapStatistics = treap.getStatistics()
      expect(stats.sets).toBe(0)
    })
  })

  describe('treap balancing', () => {
    it('should keep depth logarithmic for sequential inserts', () => {
      const t = new TreapMultimap<number, number>()
      for (let i = 0; i < 1000; i++) {
        t.set(i, i)
      }
      const maxDepth = t.getStatistics().maxDepth
      expect(maxDepth).toBeLessThan(100)
    })

    it('should keep depth reasonable for reverse sequential inserts', () => {
      const t = new TreapMultimap<number, number>()
      for (let i = 999; i >= 0; i--) {
        t.set(i, i)
      }
      const maxDepth = t.getStatistics().maxDepth
      expect(maxDepth).toBeLessThan(100)
    })

    it('should find all keys after many inserts', () => {
      const t = new TreapMultimap<number, number>()
      for (let i = 0; i < 500; i++) {
        t.set(i, i * 10)
      }
      for (let i = 0; i < 500; i++) {
        expect(t.has(i)).toBe(true)
        expect(t.get(i)).toEqual([i * 10])
      }
    })

    it('should handle alternating insert-delete', () => {
      const t = new TreapMultimap<number, number>()
      for (let i = 0; i < 100; i++) {
        t.set(i, i)
        if (i > 0 && i % 3 === 0) {
          t.deleteKey(i - 1)
        }
      }
      expect(t.keyCount).toBeGreaterThan(0)
      const keys = t.keys()
      for (let i = 1; i < keys.length; i++) {
        expect(keys[i]).toBeGreaterThan(keys[i - 1])
      }
    })
  })
})
