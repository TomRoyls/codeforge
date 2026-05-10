import { describe, it, expect, beforeEach } from 'vitest'
import { MergeSkipList } from '../../src/core/merge-skip-list/merge-skip-list.js'
import { DEFAULT_MERGE_SKIP_LIST_OPTIONS } from '../../src/core/merge-skip-list/types.js'

describe('MergeSkipList', () => {
  let list: MergeSkipList

  beforeEach(() => {
    list = new MergeSkipList()
  })

  describe('construction', () => {
    it('should create an empty list with no options', () => {
      const sl = new MergeSkipList()
      expect(sl.size).toBe(0)
      expect(sl.isEmpty).toBe(true)
    })

    it('should create an empty list with empty options object', () => {
      const sl = new MergeSkipList({})
      expect(sl.size).toBe(0)
    })

    it('should accept custom maxLevel', () => {
      const sl = new MergeSkipList({ maxLevel: 8 })
      expect(sl.size).toBe(0)
      expect(sl.isEmpty).toBe(true)
    })

    it('should accept custom probability', () => {
      const sl = new MergeSkipList({ probability: 0.25 })
      expect(sl.size).toBe(0)
    })

    it('should accept both maxLevel and probability', () => {
      const sl = new MergeSkipList({ maxLevel: 4, probability: 0.3 })
      expect(sl.size).toBe(0)
      expect(sl.getLevel()).toBe(0)
    })

    it('should export correct default options', () => {
      expect(DEFAULT_MERGE_SKIP_LIST_OPTIONS.maxLevel).toBe(16)
      expect(DEFAULT_MERGE_SKIP_LIST_OPTIONS.probability).toBe(0.5)
    })
  })

  describe('insert', () => {
    it('should insert a single key', () => {
      list.insert(1)
      expect(list.size).toBe(1)
      expect(list.isEmpty).toBe(false)
    })

    it('should insert a key with value', () => {
      list.insert(1, 100)
      expect(list.search(1)).toBe(100)
    })

    it('should insert a key without value (undefined)', () => {
      list.insert(1)
      expect(list.search(1)).toBeUndefined()
      expect(list.has(1)).toBe(true)
    })

    it('should insert multiple keys in order', () => {
      list.insert(1)
      list.insert(2)
      list.insert(3)
      expect(list.size).toBe(3)
    })

    it('should insert multiple keys in reverse order', () => {
      list.insert(3)
      list.insert(2)
      list.insert(1)
      expect(list.size).toBe(3)
      expect(list.toArray()).toEqual([
        [1, undefined],
        [2, undefined],
        [3, undefined],
      ])
    })

    it('should insert duplicate key (update value)', () => {
      list.insert(1, 10)
      list.insert(1, 20)
      expect(list.size).toBe(1)
      expect(list.search(1)).toBe(20)
    })

    it('should insert duplicate key without changing size', () => {
      list.insert(1)
      list.insert(2)
      list.insert(1)
      expect(list.size).toBe(2)
    })

    it('should insert many keys and maintain sorted order', () => {
      const keys = [5, 3, 8, 1, 9, 2, 7, 4, 6]
      for (const k of keys) list.insert(k)
      const arr = list.toArray()
      const sortedKeys = arr.map(([k]) => k)
      for (let i = 1; i < sortedKeys.length; i++) {
        expect(sortedKeys[i]!).toBeGreaterThan(sortedKeys[i - 1]!)
      }
    })

    it('should handle negative keys', () => {
      list.insert(-5, 1)
      list.insert(-3, 2)
      list.insert(0, 3)
      expect(list.size).toBe(3)
      expect(list.search(-5)).toBe(1)
    })

    it('should handle zero key', () => {
      list.insert(0, 42)
      expect(list.has(0)).toBe(true)
      expect(list.search(0)).toBe(42)
    })

    it('should handle large keys', () => {
      list.insert(1000000, 1)
      list.insert(999999, 2)
      expect(list.size).toBe(2)
      expect(list.search(1000000)).toBe(1)
    })

    it('should update value on duplicate insert with undefined', () => {
      list.insert(1, 10)
      list.insert(1)
      expect(list.search(1)).toBeUndefined()
    })

    it('should update value from undefined to defined', () => {
      list.insert(1)
      list.insert(1, 50)
      expect(list.search(1)).toBe(50)
    })
  })

  describe('delete', () => {
    it('should delete an existing key', () => {
      list.insert(1)
      expect(list.delete(1)).toBe(true)
      expect(list.size).toBe(0)
    })

    it('should return false for non-existent key', () => {
      expect(list.delete(99)).toBe(false)
    })

    it('should return false when deleting from empty list', () => {
      expect(list.delete(1)).toBe(false)
    })

    it('should not affect other keys after deletion', () => {
      list.insert(1, 10)
      list.insert(2, 20)
      list.insert(3, 30)
      list.delete(2)
      expect(list.size).toBe(2)
      expect(list.has(1)).toBe(true)
      expect(list.has(3)).toBe(true)
      expect(list.has(2)).toBe(false)
    })

    it('should allow re-inserting a deleted key', () => {
      list.insert(1, 10)
      list.delete(1)
      list.insert(1, 20)
      expect(list.size).toBe(1)
      expect(list.search(1)).toBe(20)
    })

    it('should delete the first key', () => {
      list.insert(1)
      list.insert(2)
      list.insert(3)
      list.delete(1)
      const arr = list.toArray()
      expect(arr[0]![0]).toBe(2)
    })

    it('should delete the last key', () => {
      list.insert(1)
      list.insert(2)
      list.insert(3)
      list.delete(3)
      const arr = list.toArray()
      expect(arr[arr.length - 1]![0]).toBe(2)
    })

    it('should delete the middle key', () => {
      list.insert(1)
      list.insert(2)
      list.insert(3)
      list.delete(2)
      expect(list.toArray().map(([k]) => k)).toEqual([1, 3])
    })

    it('should handle deleting all keys one by one', () => {
      list.insert(1)
      list.insert(2)
      list.insert(3)
      list.delete(2)
      list.delete(1)
      list.delete(3)
      expect(list.size).toBe(0)
      expect(list.isEmpty).toBe(true)
    })

    it('should return false when deleting same key twice', () => {
      list.insert(1)
      expect(list.delete(1)).toBe(true)
      expect(list.delete(1)).toBe(false)
    })

    it('should handle delete of negative key', () => {
      list.insert(-5, 1)
      expect(list.delete(-5)).toBe(true)
      expect(list.has(-5)).toBe(false)
    })
  })

  describe('search', () => {
    it('should find an existing key with value', () => {
      list.insert(5, 50)
      expect(list.search(5)).toBe(50)
    })

    it('should return undefined for non-existent key', () => {
      expect(list.search(99)).toBeUndefined()
    })

    it('should return undefined for key in empty list', () => {
      expect(list.search(1)).toBeUndefined()
    })

    it('should find keys after multiple inserts', () => {
      list.insert(1, 10)
      list.insert(5, 50)
      list.insert(10, 100)
      expect(list.search(1)).toBe(10)
      expect(list.search(5)).toBe(50)
      expect(list.search(10)).toBe(100)
    })

    it('should find keys after deletions', () => {
      list.insert(1, 10)
      list.insert(2, 20)
      list.insert(3, 30)
      list.delete(2)
      expect(list.search(1)).toBe(10)
      expect(list.search(3)).toBe(30)
    })

    it('should return updated value after re-insert', () => {
      list.insert(1, 10)
      list.insert(1, 99)
      expect(list.search(1)).toBe(99)
    })
  })

  describe('has', () => {
    it('should return true for existing key', () => {
      list.insert(1)
      expect(list.has(1)).toBe(true)
    })

    it('should return false for non-existent key', () => {
      expect(list.has(1)).toBe(false)
    })

    it('should return false after deletion', () => {
      list.insert(1)
      list.delete(1)
      expect(list.has(1)).toBe(false)
    })

    it('should return true for key with undefined value', () => {
      list.insert(1)
      expect(list.has(1)).toBe(true)
    })

    it('should work correctly after many operations', () => {
      for (let i = 0; i < 50; i++) list.insert(i, i * 10)
      list.delete(25)
      expect(list.has(25)).toBe(false)
      expect(list.has(24)).toBe(true)
      expect(list.has(26)).toBe(true)
    })
  })

  describe('findMin', () => {
    it('should return undefined for empty list', () => {
      expect(list.findMin()).toBeUndefined()
    })

    it('should return the only key', () => {
      list.insert(5, 50)
      expect(list.findMin()).toEqual([5, 50])
    })

    it('should return the smallest key after multiple inserts', () => {
      list.insert(10, 100)
      list.insert(3, 30)
      list.insert(7, 70)
      expect(list.findMin()).toEqual([3, 30])
    })

    it('should return correct min after deletion of min', () => {
      list.insert(1, 10)
      list.insert(5, 50)
      list.delete(1)
      expect(list.findMin()).toEqual([5, 50])
    })

    it('should handle negative keys', () => {
      list.insert(-10, 1)
      list.insert(5, 2)
      expect(list.findMin()).toEqual([-10, 1])
    })

    it('should return min with undefined value', () => {
      list.insert(1)
      expect(list.findMin()).toEqual([1, undefined])
    })
  })

  describe('findMax', () => {
    it('should return undefined for empty list', () => {
      expect(list.findMax()).toBeUndefined()
    })

    it('should return the only key', () => {
      list.insert(5, 50)
      expect(list.findMax()).toEqual([5, 50])
    })

    it('should return the largest key after multiple inserts', () => {
      list.insert(3, 30)
      list.insert(10, 100)
      list.insert(7, 70)
      expect(list.findMax()).toEqual([10, 100])
    })

    it('should return correct max after deletion of max', () => {
      list.insert(1, 10)
      list.insert(5, 50)
      list.delete(5)
      expect(list.findMax()).toEqual([1, 10])
    })

    it('should handle large keys', () => {
      list.insert(1, 1)
      list.insert(999999, 2)
      expect(list.findMax()).toEqual([999999, 2])
    })

    it('should return max with undefined value', () => {
      list.insert(5)
      expect(list.findMax()).toEqual([5, undefined])
    })
  })

  describe('merge', () => {
    it('should merge an empty list into non-empty', () => {
      list.insert(1, 10)
      const other = new MergeSkipList()
      list.merge(other)
      expect(list.size).toBe(1)
    })

    it('should merge non-empty list into empty', () => {
      const other = new MergeSkipList()
      other.insert(1, 10)
      list.merge(other)
      expect(list.size).toBe(1)
      expect(list.search(1)).toBe(10)
    })

    it('should merge two non-empty lists', () => {
      list.insert(1, 10)
      list.insert(3, 30)
      const other = new MergeSkipList()
      other.insert(2, 20)
      other.insert(4, 40)
      list.merge(other)
      expect(list.size).toBe(4)
      expect(list.toArray()).toEqual([
        [1, 10],
        [2, 20],
        [3, 30],
        [4, 40],
      ])
    })

    it('should overwrite values on key collision during merge', () => {
      list.insert(1, 10)
      list.insert(2, 20)
      const other = new MergeSkipList()
      other.insert(2, 99)
      other.insert(3, 30)
      list.merge(other)
      expect(list.search(2)).toBe(99)
      expect(list.size).toBe(3)
    })

    it('should merge two empty lists', () => {
      const other = new MergeSkipList()
      list.merge(other)
      expect(list.size).toBe(0)
    })

    it('should merge lists with negative keys', () => {
      list.insert(-5, 1)
      const other = new MergeSkipList()
      other.insert(-10, 2)
      other.insert(0, 3)
      list.merge(other)
      expect(list.size).toBe(3)
      expect(list.findMin()).toEqual([-10, 2])
    })

    it('should merge large list into small list', () => {
      list.insert(1)
      const other = new MergeSkipList()
      for (let i = 2; i <= 50; i++) other.insert(i, i)
      list.merge(other)
      expect(list.size).toBe(50)
    })

    it('should maintain sorted order after merge', () => {
      list.insert(5)
      list.insert(1)
      list.insert(9)
      const other = new MergeSkipList()
      other.insert(3)
      other.insert(7)
      other.insert(2)
      list.merge(other)
      const arr = list.toArray().map(([k]) => k)
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]!).toBeGreaterThan(arr[i - 1]!)
      }
    })

    it('should increment merges statistic', () => {
      list.merge(new MergeSkipList())
      expect(list.getStatistics().merges).toBe(1)
    })

    it('should handle merge with same keys', () => {
      list.insert(1, 100)
      list.insert(2, 200)
      const other = new MergeSkipList()
      other.insert(1, 111)
      other.insert(2, 222)
      list.merge(other)
      expect(list.search(1)).toBe(111)
      expect(list.search(2)).toBe(222)
      expect(list.size).toBe(2)
    })
  })

  describe('rangeQuery', () => {
    it('should return empty array for empty list', () => {
      expect(list.rangeQuery(0, 10)).toEqual([])
    })

    it('should return all entries in range', () => {
      for (let i = 1; i <= 10; i++) list.insert(i, i * 10)
      const result = list.rangeQuery(3, 7)
      expect(result).toEqual([
        [3, 30],
        [4, 40],
        [5, 50],
        [6, 60],
        [7, 70],
      ])
    })

    it('should return single entry when min equals max and key exists', () => {
      list.insert(5, 50)
      expect(list.rangeQuery(5, 5)).toEqual([[5, 50]])
    })

    it('should return empty when min equals max and key does not exist', () => {
      list.insert(5, 50)
      expect(list.rangeQuery(3, 3)).toEqual([])
    })

    it('should return empty when min greater than max', () => {
      list.insert(5, 50)
      expect(list.rangeQuery(10, 1)).toEqual([])
    })

    it('should return all entries when range covers everything', () => {
      list.insert(1, 10)
      list.insert(2, 20)
      list.insert(3, 30)
      expect(list.rangeQuery(0, 100).length).toBe(3)
    })

    it('should handle range with no matching entries', () => {
      list.insert(1, 10)
      list.insert(10, 100)
      expect(list.rangeQuery(3, 7)).toEqual([])
    })

    it('should include boundary keys', () => {
      list.insert(1, 10)
      list.insert(5, 50)
      list.insert(10, 100)
      const result = list.rangeQuery(1, 10)
      expect(result.length).toBe(3)
    })

    it('should work with negative range', () => {
      list.insert(-5, 1)
      list.insert(-3, 2)
      list.insert(0, 3)
      const result = list.rangeQuery(-5, -3)
      expect(result).toEqual([
        [-5, 1],
        [-3, 2],
      ])
    })

    it('should return entries with undefined values', () => {
      list.insert(1)
      list.insert(2)
      const result = list.rangeQuery(1, 2)
      expect(result).toEqual([
        [1, undefined],
        [2, undefined],
      ])
    })
  })

  describe('size and isEmpty', () => {
    it('should report size 0 for empty list', () => {
      expect(list.size).toBe(0)
    })

    it('should report correct size after inserts', () => {
      list.insert(1)
      list.insert(2)
      list.insert(3)
      expect(list.size).toBe(3)
    })

    it('should report correct size after deletions', () => {
      list.insert(1)
      list.insert(2)
      list.delete(1)
      expect(list.size).toBe(1)
    })

    it('should report correct size after clear', () => {
      list.insert(1)
      list.insert(2)
      list.clear()
      expect(list.size).toBe(0)
    })

    it('isEmpty should return true for new list', () => {
      expect(list.isEmpty).toBe(true)
    })

    it('isEmpty should return false after insert', () => {
      list.insert(1)
      expect(list.isEmpty).toBe(false)
    })

    it('isEmpty should return true after deleting all', () => {
      list.insert(1)
      list.delete(1)
      expect(list.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear an empty list without error', () => {
      list.clear()
      expect(list.size).toBe(0)
    })

    it('should clear a populated list', () => {
      for (let i = 0; i < 10; i++) list.insert(i, i)
      list.clear()
      expect(list.size).toBe(0)
      expect(list.isEmpty).toBe(true)
    })

    it('should allow inserts after clear', () => {
      list.insert(1, 10)
      list.clear()
      list.insert(2, 20)
      expect(list.size).toBe(1)
      expect(list.search(2)).toBe(20)
    })

    it('should reset level after clear', () => {
      for (let i = 0; i < 100; i++) list.insert(i)
      list.clear()
      expect(list.getLevel()).toBe(0)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty list', () => {
      expect(list.toArray()).toEqual([])
    })

    it('should return single entry', () => {
      list.insert(1, 10)
      expect(list.toArray()).toEqual([[1, 10]])
    })

    it('should return all entries in sorted order', () => {
      list.insert(3, 30)
      list.insert(1, 10)
      list.insert(2, 20)
      expect(list.toArray()).toEqual([
        [1, 10],
        [2, 20],
        [3, 30],
      ])
    })

    it('should reflect deletions', () => {
      list.insert(1, 10)
      list.insert(2, 20)
      list.insert(3, 30)
      list.delete(2)
      expect(list.toArray()).toEqual([
        [1, 10],
        [3, 30],
      ])
    })

    it('should return a new array each call', () => {
      list.insert(1)
      const a = list.toArray()
      const b = list.toArray()
      expect(a).not.toBe(b)
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty list', () => {
      let count = 0
      list.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should call callback for each entry', () => {
      list.insert(1, 10)
      list.insert(2, 20)
      list.insert(3, 30)
      const keys: number[] = []
      list.forEach((key) => { keys.push(key) })
      expect(keys).toEqual([1, 2, 3])
    })

    it('should provide key and value to callback', () => {
      list.insert(1, 10)
      const entries: [number, number | undefined][] = []
      list.forEach((key, value) => { entries.push([key, value]) })
      expect(entries).toEqual([[1, 10]])
    })

    it('should iterate in sorted order', () => {
      list.insert(3, 30)
      list.insert(1, 10)
      list.insert(2, 20)
      const keys: number[] = []
      list.forEach((key) => { keys.push(key) })
      expect(keys).toEqual([1, 2, 3])
    })

    it('should handle undefined values in forEach', () => {
      list.insert(1)
      list.insert(2)
      const values: (number | undefined)[] = []
      list.forEach((_key, value) => { values.push(value) })
      expect(values).toEqual([undefined, undefined])
    })
  })

  describe('Symbol.iterator', () => {
    it('should produce no entries for empty list', () => {
      const entries = [...list]
      expect(entries).toEqual([])
    })

    it('should iterate over all entries', () => {
      list.insert(1, 10)
      list.insert(2, 20)
      const entries = [...list]
      expect(entries).toEqual([
        [1, 10],
        [2, 20],
      ])
    })

    it('should iterate in sorted order', () => {
      list.insert(3, 30)
      list.insert(1, 10)
      list.insert(2, 20)
      const keys = [...list].map(([k]) => k)
      expect(keys).toEqual([1, 2, 3])
    })

    it('should work with for...of', () => {
      list.insert(1, 10)
      list.insert(2, 20)
      const keys: number[] = []
      for (const [key] of list) {
        keys.push(key)
      }
      expect(keys).toEqual([1, 2])
    })

    it('should work with destructuring', () => {
      list.insert(1, 10)
      const [[firstKey, firstValue]] = list
      expect(firstKey).toBe(1)
      expect(firstValue).toBe(10)
    })
  })

  describe('getLevel', () => {
    it('should return 0 for empty list', () => {
      expect(list.getLevel()).toBe(0)
    })

    it('should return at least 0 after inserts', () => {
      list.insert(1)
      expect(list.getLevel()).toBeGreaterThanOrEqual(0)
    })

    it('should return 0 after clear', () => {
      for (let i = 0; i < 20; i++) list.insert(i)
      list.clear()
      expect(list.getLevel()).toBe(0)
    })
  })

  describe('getStatistics', () => {
    it('should return initial statistics', () => {
      const stats = list.getStatistics()
      expect(stats.inserts).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.searches).toBe(0)
      expect(stats.merges).toBe(0)
      expect(stats.level).toBe(0)
    })

    it('should count inserts', () => {
      list.insert(1)
      list.insert(2)
      list.insert(3)
      expect(list.getStatistics().inserts).toBe(3)
    })

    it('should count duplicate inserts', () => {
      list.insert(1)
      list.insert(1)
      expect(list.getStatistics().inserts).toBe(2)
    })

    it('should count deletes including failed deletes', () => {
      list.insert(1)
      list.delete(1)
      list.delete(99)
      expect(list.getStatistics().deletes).toBe(2)
    })

    it('should count searches', () => {
      list.search(1)
      list.search(2)
      list.search(3)
      expect(list.getStatistics().searches).toBe(3)
    })

    it('should count merges', () => {
      list.merge(new MergeSkipList())
      list.merge(new MergeSkipList())
      expect(list.getStatistics().merges).toBe(2)
    })

    it('should track level', () => {
      for (let i = 0; i < 100; i++) list.insert(i)
      const stats = list.getStatistics()
      expect(stats.level).toBe(list.getLevel())
      expect(stats.level).toBeGreaterThanOrEqual(0)
    })

    it('should reflect operations after clear', () => {
      list.insert(1)
      list.delete(1)
      list.search(1)
      list.merge(new MergeSkipList())
      list.clear()
      const stats = list.getStatistics()
      expect(stats.inserts).toBe(1)
      expect(stats.deletes).toBe(1)
      expect(stats.searches).toBe(1)
      expect(stats.merges).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('should handle sequential inserts 1..100', () => {
      for (let i = 1; i <= 100; i++) list.insert(i, i)
      expect(list.size).toBe(100)
      expect(list.findMin()).toEqual([1, 1])
      expect(list.findMax()).toEqual([100, 100])
    })

    it('should handle sequential inserts 100..1', () => {
      for (let i = 100; i >= 1; i--) list.insert(i, i)
      expect(list.size).toBe(100)
      expect(list.findMin()).toEqual([1, 1])
      expect(list.findMax()).toEqual([100, 100])
    })

    it('should handle interleaved insert and delete', () => {
      list.insert(1, 10)
      list.delete(1)
      list.insert(1, 20)
      expect(list.search(1)).toBe(20)
      expect(list.size).toBe(1)
    })

    it('should work with custom low maxLevel', () => {
      const sl = new MergeSkipList({ maxLevel: 1, probability: 0.5 })
      for (let i = 0; i < 20; i++) sl.insert(i, i)
      expect(sl.size).toBe(20)
      expect(sl.search(10)).toBe(10)
    })

    it('should work with high probability', () => {
      const sl = new MergeSkipList({ maxLevel: 4, probability: 0.99 })
      for (let i = 0; i < 10; i++) sl.insert(i)
      expect(sl.size).toBe(10)
    })

    it('should work with low probability', () => {
      const sl = new MergeSkipList({ maxLevel: 16, probability: 0.01 })
      for (let i = 0; i < 10; i++) sl.insert(i)
      expect(sl.size).toBe(10)
    })

    it('should handle merge then delete', () => {
      list.insert(1, 10)
      const other = new MergeSkipList()
      other.insert(2, 20)
      list.merge(other)
      list.delete(1)
      expect(list.size).toBe(1)
      expect(list.search(2)).toBe(20)
    })

    it('should handle range query after merge', () => {
      list.insert(1, 10)
      list.insert(5, 50)
      const other = new MergeSkipList()
      other.insert(3, 30)
      other.insert(7, 70)
      list.merge(other)
      const range = list.rangeQuery(2, 6)
      expect(range).toEqual([
        [3, 30],
        [5, 50],
      ])
    })

    it('should handle clearing and reusing', () => {
      for (let i = 0; i < 50; i++) list.insert(i)
      list.clear()
      expect(list.size).toBe(0)
      list.insert(42, 420)
      expect(list.size).toBe(1)
      expect(list.search(42)).toBe(420)
    })

    it('should handle iterator after modifications', () => {
      list.insert(1, 10)
      list.insert(2, 20)
      list.insert(3, 30)
      list.delete(2)
      const entries = [...list]
      expect(entries).toEqual([
        [1, 10],
        [3, 30],
      ])
    })

    it('should handle forEach after modifications', () => {
      list.insert(1)
      list.insert(3)
      list.insert(5)
      list.delete(3)
      const keys: number[] = []
      list.forEach((k) => keys.push(k))
      expect(keys).toEqual([1, 5])
    })

    it('should handle toArray after modifications', () => {
      list.insert(1)
      list.insert(5)
      list.insert(3)
      list.delete(1)
      list.insert(2)
      expect(list.toArray().map(([k]) => k)).toEqual([2, 3, 5])
    })

    it('should handle many sequential deletions', () => {
      for (let i = 0; i < 50; i++) list.insert(i, i)
      for (let i = 0; i < 50; i++) {
        expect(list.delete(i)).toBe(true)
      }
      expect(list.size).toBe(0)
      expect(list.isEmpty).toBe(true)
    })

    it('should handle alternating insert and delete', () => {
      for (let i = 0; i < 20; i++) {
        list.insert(i, i)
        expect(list.size).toBe(i + 1)
      }
      for (let i = 0; i < 20; i++) {
        list.delete(i)
        expect(list.size).toBe(19 - i)
      }
    })
  })
})
