import { describe, it, expect, beforeEach } from 'vitest'
import { ConcurrentSkipList } from '../../src/core/concurrent-skip-list/concurrent-skip-list.js'
import type { SkipNode, ConcurrentSkipListOptions, ConcurrentSkipListStats } from '../../src/core/concurrent-skip-list/types.js'

describe('ConcurrentSkipList', () => {
  let list: ConcurrentSkipList<number, string>

  beforeEach(() => {
    list = new ConcurrentSkipList<number, string>()
  })

  describe('construction', () => {
    it('should create an empty list with no options', () => {
      const sl = new ConcurrentSkipList<number, string>()
      expect(sl.size).toBe(0)
      expect(sl.isEmpty()).toBe(true)
    })

    it('should accept empty options object', () => {
      const sl = new ConcurrentSkipList<number, string>({})
      expect(sl.size).toBe(0)
    })

    it('should accept custom maxLevel', () => {
      const sl = new ConcurrentSkipList<number, string>({ maxLevel: 8 })
      expect(sl.size).toBe(0)
      expect(sl.isEmpty()).toBe(true)
    })

    it('should accept custom probability', () => {
      const sl = new ConcurrentSkipList<number, string>({ probability: 0.25 })
      expect(sl.size).toBe(0)
    })

    it('should accept custom comparator', () => {
      const comp = (a: number, b: number) => a - b
      const sl = new ConcurrentSkipList<number, string>({ comparator: comp })
      expect(sl.size).toBe(0)
    })

    it('should accept all options together', () => {
      const sl = new ConcurrentSkipList<number, string>({
        maxLevel: 10,
        probability: 0.3,
        comparator: (a, b) => a - b,
      })
      expect(sl.isEmpty()).toBe(true)
    })

    it('should start with height 0', () => {
      expect(list.height()).toBe(0)
    })
  })

  describe('insert', () => {
    it('should insert a single element', () => {
      list.insert(1, 'one')
      expect(list.size).toBe(1)
      expect(list.isEmpty()).toBe(false)
    })

    it('should insert multiple elements', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.insert(3, 'three')
      expect(list.size).toBe(3)
    })

    it('should update value for existing key', () => {
      list.insert(1, 'one')
      list.insert(1, 'updated')
      expect(list.size).toBe(1)
      expect(list.search(1)).toBe('updated')
    })

    it('should insert in reverse order', () => {
      list.insert(3, 'three')
      list.insert(2, 'two')
      list.insert(1, 'one')
      expect(list.size).toBe(3)
      expect(list.toArray().map(e => e[0])).toEqual([1, 2, 3])
    })

    it('should insert in random order', () => {
      list.insert(5, 'five')
      list.insert(1, 'one')
      list.insert(3, 'three')
      list.insert(2, 'two')
      list.insert(4, 'four')
      expect(list.toArray().map(e => e[0])).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle negative keys', () => {
      list.insert(-1, 'neg')
      list.insert(0, 'zero')
      list.insert(1, 'pos')
      expect(list.toArray().map(e => e[0])).toEqual([-1, 0, 1])
    })

    it('should handle duplicate key updates preserving size', () => {
      list.insert(1, 'a')
      list.insert(2, 'b')
      list.insert(1, 'c')
      expect(list.size).toBe(2)
      expect(list.search(1)).toBe('c')
    })

    it('should maintain sorted order after many inserts', () => {
      const keys = [10, 5, 15, 3, 7, 12, 20, 1, 8, 18]
      for (const k of keys) {
        list.insert(k, String(k))
      }
      expect(list.toArray().map(e => e[0])).toEqual([1, 3, 5, 7, 8, 10, 12, 15, 18, 20])
    })
  })

  describe('search', () => {
    it('should return undefined for empty list', () => {
      expect(list.search(1)).toBeUndefined()
    })

    it('should return value for existing key', () => {
      list.insert(1, 'one')
      expect(list.search(1)).toBe('one')
    })

    it('should return undefined for non-existent key', () => {
      list.insert(1, 'one')
      expect(list.search(2)).toBeUndefined()
    })

    it('should return updated value after re-insert', () => {
      list.insert(1, 'old')
      list.insert(1, 'new')
      expect(list.search(1)).toBe('new')
    })

    it('should search from list with many elements', () => {
      for (let i = 0; i < 100; i++) {
        list.insert(i, `val-${i}`)
      }
      expect(list.search(50)).toBe('val-50')
      expect(list.search(0)).toBe('val-0')
      expect(list.search(99)).toBe('val-99')
    })

    it('should return undefined for key between existing keys', () => {
      list.insert(1, 'one')
      list.insert(3, 'three')
      expect(list.search(2)).toBeUndefined()
    })
  })

  describe('contains', () => {
    it('should return false for empty list', () => {
      expect(list.contains(1)).toBe(false)
    })

    it('should return true for existing key', () => {
      list.insert(1, 'one')
      expect(list.contains(1)).toBe(true)
    })

    it('should return false for non-existent key', () => {
      list.insert(1, 'one')
      expect(list.contains(2)).toBe(false)
    })

    it('should find keys across range', () => {
      list.insert(1, 'a')
      list.insert(5, 'b')
      list.insert(10, 'c')
      expect(list.contains(1)).toBe(true)
      expect(list.contains(5)).toBe(true)
      expect(list.contains(10)).toBe(true)
      expect(list.contains(3)).toBe(false)
    })

    it('should find after update', () => {
      list.insert(1, 'a')
      list.insert(1, 'b')
      expect(list.contains(1)).toBe(true)
    })
  })

  describe('delete', () => {
    it('should return false for empty list', () => {
      expect(list.delete(1)).toBe(false)
    })

    it('should delete existing key and return true', () => {
      list.insert(1, 'one')
      expect(list.delete(1)).toBe(true)
      expect(list.size).toBe(0)
      expect(list.search(1)).toBeUndefined()
    })

    it('should return false for non-existent key', () => {
      list.insert(1, 'one')
      expect(list.delete(2)).toBe(false)
      expect(list.size).toBe(1)
    })

    it('should delete from middle', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.insert(3, 'three')
      expect(list.delete(2)).toBe(true)
      expect(list.toArray().map(e => e[0])).toEqual([1, 3])
    })

    it('should delete first element', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.insert(3, 'three')
      expect(list.delete(1)).toBe(true)
      expect(list.toArray().map(e => e[0])).toEqual([2, 3])
    })

    it('should delete last element', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.insert(3, 'three')
      expect(list.delete(3)).toBe(true)
      expect(list.toArray().map(e => e[0])).toEqual([1, 2])
    })

    it('should delete all elements', () => {
      list.insert(1, 'a')
      list.insert(2, 'b')
      list.insert(3, 'c')
      list.delete(2)
      list.delete(1)
      list.delete(3)
      expect(list.size).toBe(0)
      expect(list.isEmpty()).toBe(true)
    })

    it('should not affect other elements after delete', () => {
      for (let i = 1; i <= 10; i++) {
        list.insert(i, String(i))
      }
      list.delete(5)
      expect(list.search(4)).toBe('4')
      expect(list.search(6)).toBe('6')
      expect(list.size).toBe(9)
    })
  })

  describe('min', () => {
    it('should return undefined for empty list', () => {
      expect(list.min()).toBeUndefined()
    })

    it('should return only element', () => {
      list.insert(1, 'one')
      expect(list.min()).toEqual([1, 'one'])
    })

    it('should return smallest key', () => {
      list.insert(5, 'five')
      list.insert(1, 'one')
      list.insert(3, 'three')
      expect(list.min()).toEqual([1, 'one'])
    })

    it('should update after deletion', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.delete(1)
      expect(list.min()).toEqual([2, 'two'])
    })

    it('should handle negative keys', () => {
      list.insert(-5, 'neg')
      list.insert(0, 'zero')
      expect(list.min()).toEqual([-5, 'neg'])
    })
  })

  describe('max', () => {
    it('should return undefined for empty list', () => {
      expect(list.max()).toBeUndefined()
    })

    it('should return only element', () => {
      list.insert(1, 'one')
      expect(list.max()).toEqual([1, 'one'])
    })

    it('should return largest key', () => {
      list.insert(1, 'one')
      list.insert(5, 'five')
      list.insert(3, 'three')
      expect(list.max()).toEqual([5, 'five'])
    })

    it('should update after deletion', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.delete(2)
      expect(list.max()).toEqual([1, 'one'])
    })
  })

  describe('range queries', () => {
    beforeEach(() => {
      list.insert(1, 'a')
      list.insert(2, 'b')
      list.insert(3, 'c')
      list.insert(4, 'd')
      list.insert(5, 'e')
    })

    it('should return empty for empty list', () => {
      const empty = new ConcurrentSkipList<number, string>()
      expect(empty.rangeQuery(1, 5)).toEqual([])
    })

    it('should return elements in range', () => {
      expect(list.rangeQuery(2, 4)).toEqual([[2, 'b'], [3, 'c'], [4, 'd']])
    })

    it('should return single element when lo equals hi', () => {
      expect(list.rangeQuery(2, 2)).toEqual([[2, 'b']])
    })

    it('should return empty when no elements in range', () => {
      expect(list.rangeQuery(6, 8)).toEqual([])
    })

    it('should return all elements with full range', () => {
      expect(list.rangeQuery(1, 5)).toEqual([[1, 'a'], [2, 'b'], [3, 'c'], [4, 'd'], [5, 'e']])
    })

    it('should handle range beyond elements', () => {
      expect(list.rangeQuery(0, 10)).toEqual([[1, 'a'], [2, 'b'], [3, 'c'], [4, 'd'], [5, 'e']])
    })

    it('should return empty when lo > hi', () => {
      expect(list.rangeQuery(3, 1)).toEqual([])
    })

    it('should include boundary elements', () => {
      expect(list.rangeQuery(1, 2)).toEqual([[1, 'a'], [2, 'b']])
    })

    it('should handle range at start', () => {
      expect(list.rangeQuery(1, 1)).toEqual([[1, 'a']])
    })

    it('should handle range at end', () => {
      expect(list.rangeQuery(5, 5)).toEqual([[5, 'e']])
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty list', () => {
      let count = 0
      list.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should iterate all elements in order', () => {
      list.insert(3, 'c')
      list.insert(1, 'a')
      list.insert(2, 'b')
      const result: [number, string][] = []
      list.forEach((v, k) => result.push([k, v]))
      expect(result).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
    })

    it('should provide correct arguments', () => {
      list.insert(1, 'one')
      list.forEach((value, key) => {
        expect(key).toBe(1)
        expect(value).toBe('one')
      })
    })

    it('should iterate single element', () => {
      list.insert(42, 'answer')
      const result: string[] = []
      list.forEach((v) => result.push(v))
      expect(result).toEqual(['answer'])
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty list', () => {
      expect(list.toArray()).toEqual([])
    })

    it('should return all entries sorted by key', () => {
      list.insert(3, 'c')
      list.insert(1, 'a')
      list.insert(2, 'b')
      expect(list.toArray()).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
    })

    it('should reflect updates', () => {
      list.insert(1, 'old')
      list.insert(1, 'new')
      expect(list.toArray()).toEqual([[1, 'new']])
    })

    it('should update after deletion', () => {
      list.insert(1, 'a')
      list.insert(2, 'b')
      list.insert(3, 'c')
      list.delete(2)
      expect(list.toArray()).toEqual([[1, 'a'], [3, 'c']])
    })
  })

  describe('size', () => {
    it('should return 0 for empty list', () => {
      expect(list.size).toBe(0)
    })

    it('should reflect insertions', () => {
      list.insert(1, 'a')
      list.insert(2, 'b')
      expect(list.size).toBe(2)
    })

    it('should reflect deletions', () => {
      list.insert(1, 'a')
      list.insert(2, 'b')
      list.delete(1)
      expect(list.size).toBe(1)
    })

    it('should not change on duplicate insert', () => {
      list.insert(1, 'a')
      list.insert(1, 'b')
      expect(list.size).toBe(1)
    })
  })

  describe('height', () => {
    it('should return 0 for empty list', () => {
      expect(list.height()).toBe(0)
    })

    it('should return >= 1 after insert', () => {
      list.insert(1, 'a')
      expect(list.height()).toBeGreaterThanOrEqual(1)
    })

    it('should return 0 after clear', () => {
      for (let i = 0; i < 50; i++) {
        list.insert(i, String(i))
      }
      list.clear()
      expect(list.height()).toBe(0)
    })

    it('should never exceed maxLevel', () => {
      const sl = new ConcurrentSkipList<number, string>({ maxLevel: 4 })
      for (let i = 0; i < 1000; i++) {
        sl.insert(i, String(i))
      }
      expect(sl.height()).toBeLessThanOrEqual(4)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new list', () => {
      expect(list.isEmpty()).toBe(true)
    })

    it('should return false after insert', () => {
      list.insert(1, 'a')
      expect(list.isEmpty()).toBe(false)
    })

    it('should return true after deleting all', () => {
      list.insert(1, 'a')
      list.delete(1)
      expect(list.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      list.insert(1, 'a')
      list.clear()
      expect(list.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear empty list', () => {
      list.clear()
      expect(list.size).toBe(0)
    })

    it('should clear populated list', () => {
      list.insert(1, 'a')
      list.insert(2, 'b')
      list.insert(3, 'c')
      list.clear()
      expect(list.size).toBe(0)
      expect(list.isEmpty()).toBe(true)
      expect(list.search(1)).toBeUndefined()
    })

    it('should allow insertions after clear', () => {
      list.insert(1, 'a')
      list.clear()
      list.insert(2, 'b')
      expect(list.size).toBe(1)
      expect(list.search(2)).toBe('b')
    })

    it('should reset height after clear', () => {
      for (let i = 0; i < 100; i++) {
        list.insert(i, String(i))
      }
      list.clear()
      expect(list.height()).toBe(0)
    })
  })

  describe('clone', () => {
    it('should clone empty list', () => {
      const cloned = list.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should clone populated list', () => {
      list.insert(1, 'a')
      list.insert(2, 'b')
      list.insert(3, 'c')
      const cloned = list.clone()
      expect(cloned.size).toBe(3)
      expect(cloned.toArray()).toEqual(list.toArray())
    })

    it('should be independent from original', () => {
      list.insert(1, 'a')
      list.insert(2, 'b')
      const cloned = list.clone()
      cloned.insert(3, 'c')
      cloned.delete(1)
      expect(list.size).toBe(2)
      expect(list.toArray().map(e => e[0])).toEqual([1, 2])
      expect(cloned.size).toBe(2)
      expect(cloned.toArray().map(e => e[0])).toEqual([2, 3])
    })

    it('should preserve values', () => {
      list.insert(10, 'ten')
      const cloned = list.clone()
      expect(cloned.search(10)).toBe('ten')
    })
  })

  describe('from factory', () => {
    it('should create list from entries', () => {
      const sl = ConcurrentSkipList.from<number, string>([[1, 'a'], [2, 'b'], [3, 'c']])
      expect(sl.size).toBe(3)
      expect(sl.search(1)).toBe('a')
      expect(sl.search(2)).toBe('b')
      expect(sl.search(3)).toBe('c')
    })

    it('should create empty list from empty entries', () => {
      const sl = ConcurrentSkipList.from<number, string>([])
      expect(sl.size).toBe(0)
    })

    it('should accept options', () => {
      const sl = ConcurrentSkipList.from<number, string>([[1, 'a']], { maxLevel: 4 })
      expect(sl.size).toBe(1)
    })

    it('should accept all options', () => {
      const sl = ConcurrentSkipList.from<number, string>([[1, 'a'], [2, 'b']], {
        maxLevel: 8,
        probability: 0.25,
        comparator: (a, b) => a - b,
      })
      expect(sl.size).toBe(2)
    })

    it('should handle entries with duplicate keys (last wins)', () => {
      const sl = ConcurrentSkipList.from<number, string>([[1, 'a'], [1, 'b']])
      expect(sl.size).toBe(1)
      expect(sl.search(1)).toBe('b')
    })

    it('should produce sorted keys regardless of input order', () => {
      const sl = ConcurrentSkipList.from<number, string>([[3, 'c'], [1, 'a'], [2, 'b']])
      expect(sl.toArray().map(e => e[0])).toEqual([1, 2, 3])
    })
  })

  describe('getRank', () => {
    it('should return -1 for empty list', () => {
      expect(list.getRank(1)).toBe(-1)
    })

    it('should return -1 for non-existent key', () => {
      list.insert(1, 'a')
      expect(list.getRank(2)).toBe(-1)
    })

    it('should return 0 for first element', () => {
      list.insert(1, 'a')
      expect(list.getRank(1)).toBe(0)
    })

    it('should return correct rank for elements', () => {
      list.insert(10, 'ten')
      list.insert(20, 'twenty')
      list.insert(30, 'thirty')
      expect(list.getRank(10)).toBe(0)
      expect(list.getRank(20)).toBe(1)
      expect(list.getRank(30)).toBe(2)
    })

    it('should handle reverse insertion order', () => {
      list.insert(30, 'thirty')
      list.insert(20, 'twenty')
      list.insert(10, 'ten')
      expect(list.getRank(10)).toBe(0)
      expect(list.getRank(20)).toBe(1)
      expect(list.getRank(30)).toBe(2)
    })

    it('should update rank after deletion', () => {
      list.insert(10, 'ten')
      list.insert(20, 'twenty')
      list.insert(30, 'thirty')
      list.delete(10)
      expect(list.getRank(20)).toBe(0)
      expect(list.getRank(30)).toBe(1)
    })

    it('should handle rank with many elements', () => {
      for (let i = 0; i < 100; i++) {
        list.insert(i, String(i))
      }
      expect(list.getRank(0)).toBe(0)
      expect(list.getRank(50)).toBe(50)
      expect(list.getRank(99)).toBe(99)
    })
  })

  describe('atIndex', () => {
    it('should return undefined for empty list', () => {
      expect(list.atIndex(0)).toBeUndefined()
    })

    it('should return undefined for negative index', () => {
      list.insert(1, 'a')
      expect(list.atIndex(-1)).toBeUndefined()
    })

    it('should return undefined for out-of-bounds index', () => {
      list.insert(1, 'a')
      expect(list.atIndex(1)).toBeUndefined()
    })

    it('should return first element at index 0', () => {
      list.insert(1, 'a')
      list.insert(2, 'b')
      list.insert(3, 'c')
      expect(list.atIndex(0)).toEqual([1, 'a'])
    })

    it('should return last element at last index', () => {
      list.insert(1, 'a')
      list.insert(2, 'b')
      list.insert(3, 'c')
      expect(list.atIndex(2)).toEqual([3, 'c'])
    })

    it('should return correct element at each index', () => {
      list.insert(10, 'ten')
      list.insert(20, 'twenty')
      list.insert(30, 'thirty')
      expect(list.atIndex(0)).toEqual([10, 'ten'])
      expect(list.atIndex(1)).toEqual([20, 'twenty'])
      expect(list.atIndex(2)).toEqual([30, 'thirty'])
    })

    it('should handle reverse insertion order', () => {
      list.insert(30, 'thirty')
      list.insert(20, 'twenty')
      list.insert(10, 'ten')
      expect(list.atIndex(0)).toEqual([10, 'ten'])
      expect(list.atIndex(1)).toEqual([20, 'twenty'])
      expect(list.atIndex(2)).toEqual([30, 'thirty'])
    })

    it('should update after deletion', () => {
      list.insert(1, 'a')
      list.insert(2, 'b')
      list.insert(3, 'c')
      list.delete(2)
      expect(list.atIndex(0)).toEqual([1, 'a'])
      expect(list.atIndex(1)).toEqual([3, 'c'])
    })

    it('should handle many elements', () => {
      for (let i = 0; i < 100; i++) {
        list.insert(i, `val-${i}`)
      }
      expect(list.atIndex(0)).toEqual([0, 'val-0'])
      expect(list.atIndex(50)).toEqual([50, 'val-50'])
      expect(list.atIndex(99)).toEqual([99, 'val-99'])
    })
  })

  describe('stats', () => {
    it('should return stats for empty list', () => {
      const s = list.stats()
      expect(s.size).toBe(0)
      expect(s.height).toBe(0)
      expect(s.maxLevel).toBe(16)
      expect(s.probability).toBe(0.5)
      expect(s.nodeCount).toBe(0)
    })

    it('should return stats for populated list', () => {
      list.insert(1, 'a')
      list.insert(2, 'b')
      list.insert(3, 'c')
      const s = list.stats()
      expect(s.size).toBe(3)
      expect(s.height).toBeGreaterThanOrEqual(1)
      expect(s.nodeCount).toBe(3)
    })

    it('should return correct maxLevel from options', () => {
      const sl = new ConcurrentSkipList<number, string>({ maxLevel: 8 })
      sl.insert(1, 'a')
      const s = sl.stats()
      expect(s.maxLevel).toBe(8)
    })

    it('should return correct probability from options', () => {
      const sl = new ConcurrentSkipList<number, string>({ probability: 0.25 })
      sl.insert(1, 'a')
      const s = sl.stats()
      expect(s.probability).toBe(0.25)
    })

    it('should return level distribution', () => {
      for (let i = 0; i < 100; i++) {
        list.insert(i, String(i))
      }
      const s = list.stats()
      expect(s.levelDistribution.length).toBe(s.height)
      expect(s.levelDistribution[0]).toBe(100)
    })
  })

  describe('generic types', () => {
    it('should work with number values', () => {
      const sl = new ConcurrentSkipList<number, number>()
      sl.insert(1, 100)
      sl.insert(2, 200)
      expect(sl.search(1)).toBe(100)
    })

    it('should work with object values', () => {
      const sl = new ConcurrentSkipList<number, { name: string }>()
      sl.insert(1, { name: 'alice' })
      sl.insert(2, { name: 'bob' })
      expect(sl.search(1)!.name).toBe('alice')
      expect(sl.search(2)!.name).toBe('bob')
    })

    it('should work with null values', () => {
      const sl = new ConcurrentSkipList<number, string | null>()
      sl.insert(1, null)
      sl.insert(2, 'two')
      expect(sl.search(1)).toBeNull()
      expect(sl.search(2)).toBe('two')
    })

    it('should work with array values', () => {
      const sl = new ConcurrentSkipList<number, number[]>()
      sl.insert(1, [1, 2, 3])
      sl.insert(2, [4, 5, 6])
      expect(sl.search(1)).toEqual([1, 2, 3])
    })

    it('should work with string keys and custom comparator', () => {
      const sl = new ConcurrentSkipList<string, number>({
        comparator: (a, b) => a < b ? -1 : a > b ? 1 : 0,
      })
      sl.insert('banana', 2)
      sl.insert('apple', 1)
      sl.insert('cherry', 3)
      expect(sl.toArray().map(e => e[0])).toEqual(['apple', 'banana', 'cherry'])
      expect(sl.search('banana')).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('should handle single element operations', () => {
      list.insert(1, 'one')
      expect(list.size).toBe(1)
      expect(list.min()).toEqual([1, 'one'])
      expect(list.max()).toEqual([1, 'one'])
      expect(list.toArray()).toEqual([[1, 'one']])
      expect(list.contains(1)).toBe(true)
      expect(list.search(1)).toBe('one')
      list.delete(1)
      expect(list.isEmpty()).toBe(true)
    })

    it('should handle large key values', () => {
      list.insert(Number.MAX_SAFE_INTEGER, 'max')
      list.insert(Number.MIN_SAFE_INTEGER, 'min')
      expect(list.min()).toEqual([Number.MIN_SAFE_INTEGER, 'min'])
      expect(list.max()).toEqual([Number.MAX_SAFE_INTEGER, 'max'])
    })

    it('should handle zero key', () => {
      list.insert(0, 'zero')
      expect(list.search(0)).toBe('zero')
      expect(list.contains(0)).toBe(true)
    })

    it('should handle sequential insertions', () => {
      for (let i = 0; i < 50; i++) {
        list.insert(i, String(i))
      }
      expect(list.size).toBe(50)
      expect(list.toArray().map(e => e[0])).toEqual(Array.from({ length: 50 }, (_, i) => i))
    })

    it('should handle reverse sequential insertions', () => {
      for (let i = 49; i >= 0; i--) {
        list.insert(i, String(i))
      }
      expect(list.size).toBe(50)
      expect(list.toArray().map(e => e[0])).toEqual(Array.from({ length: 50 }, (_, i) => i))
    })

    it('should handle alternating insertions', () => {
      const keys = [5, 15, 10, 20, 0]
      for (const k of keys) {
        list.insert(k, String(k))
      }
      expect(list.toArray().map(e => e[0])).toEqual([0, 5, 10, 15, 20])
    })
  })

  describe('ordered insertion', () => {
    it('should handle ascending insertion', () => {
      for (let i = 0; i < 100; i++) {
        list.insert(i, String(i))
      }
      const arr = list.toArray()
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]![0]).toBeGreaterThan(arr[i - 1]![0])
      }
    })

    it('should handle descending insertion', () => {
      for (let i = 99; i >= 0; i--) {
        list.insert(i, String(i))
      }
      const arr = list.toArray()
      expect(arr.length).toBe(100)
      expect(arr[0]![0]).toBe(0)
      expect(arr[99]![0]).toBe(99)
    })
  })

  describe('random insertion', () => {
    it('should maintain sorted order with random keys', () => {
      const shuffled = Array.from({ length: 200 }, (_, i) => i)
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
      }
      for (const k of shuffled) {
        list.insert(k, String(k))
      }
      const arr = list.toArray()
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]![0]).toBeGreaterThan(arr[i - 1]![0])
      }
    })
  })

  describe('combined operations', () => {
    it('should handle insert-delete-reinsert cycle', () => {
      list.insert(1, 'a')
      list.delete(1)
      list.insert(1, 'b')
      expect(list.search(1)).toBe('b')
      expect(list.size).toBe(1)
    })

    it('should handle mixed operations', () => {
      list.insert(1, 'a')
      list.insert(2, 'b')
      list.insert(3, 'c')
      list.delete(2)
      list.insert(4, 'd')
      list.insert(2, 'b2')
      expect(list.size).toBe(4)
      expect(list.toArray().map(e => e[0])).toEqual([1, 2, 3, 4])
      expect(list.search(2)).toBe('b2')
    })

    it('should handle clear and rebuild', () => {
      for (let i = 0; i < 10; i++) {
        list.insert(i, String(i))
      }
      list.clear()
      for (let i = 10; i < 20; i++) {
        list.insert(i, String(i))
      }
      expect(list.size).toBe(10)
      expect(list.search(5)).toBeUndefined()
      expect(list.search(15)).toBe('15')
    })

    it('should handle forEach after modifications', () => {
      list.insert(1, 'a')
      list.insert(2, 'b')
      list.insert(3, 'c')
      list.delete(2)
      const result: string[] = []
      list.forEach((v) => result.push(v))
      expect(result).toEqual(['a', 'c'])
    })

    it('should handle range after deletions', () => {
      list.insert(1, 'a')
      list.insert(2, 'b')
      list.insert(3, 'c')
      list.insert(4, 'd')
      list.delete(2)
      expect(list.rangeQuery(1, 4)).toEqual([[1, 'a'], [3, 'c'], [4, 'd']])
    })

    it('should handle clone after modifications', () => {
      list.insert(1, 'a')
      list.insert(2, 'b')
      list.insert(3, 'c')
      list.delete(2)
      const cloned = list.clone()
      expect(cloned.size).toBe(2)
      expect(cloned.toArray().map(e => e[0])).toEqual([1, 3])
    })

    it('should handle getRank and atIndex together', () => {
      list.insert(10, 'a')
      list.insert(20, 'b')
      list.insert(30, 'c')
      expect(list.getRank(10)).toBe(0)
      expect(list.getRank(20)).toBe(1)
      expect(list.getRank(30)).toBe(2)
      expect(list.atIndex(0)).toEqual([10, 'a'])
      expect(list.atIndex(1)).toEqual([20, 'b'])
      expect(list.atIndex(2)).toEqual([30, 'c'])
    })

    it('should verify getRank and atIndex are inverses', () => {
      for (let i = 0; i < 50; i++) {
        list.insert(i * 2, String(i * 2))
      }
      for (let i = 0; i < 50; i++) {
        const entry = list.atIndex(i)
        expect(entry).toBeDefined()
        expect(list.getRank(entry![0])).toBe(i)
      }
    })
  })

  describe('large lists', () => {
    it('should handle 10000+ insertions', () => {
      const sl = new ConcurrentSkipList<number, number>({ maxLevel: 20 })
      for (let i = 0; i < 10000; i++) {
        sl.insert(i, i * 10)
      }
      expect(sl.size).toBe(10000)
      expect(sl.min()).toEqual([0, 0])
      expect(sl.max()).toEqual([9999, 99990])
    })

    it('should handle 10000+ random order insertions', () => {
      const sl = new ConcurrentSkipList<number, number>({ maxLevel: 20 })
      const keys = Array.from({ length: 10000 }, (_, i) => i)
      for (let i = keys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[keys[i], keys[j]] = [keys[j]!, keys[i]!]
      }
      for (const k of keys) {
        sl.insert(k, k * 2)
      }
      const arr = sl.toArray()
      expect(arr.length).toBe(10000)
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]![0]).toBeGreaterThan(arr[i - 1]![0])
      }
    })

    it('should handle 10000+ deletions', () => {
      const sl = new ConcurrentSkipList<number, number>({ maxLevel: 20 })
      for (let i = 0; i < 10000; i++) {
        sl.insert(i, i)
      }
      for (let i = 0; i < 5000; i++) {
        expect(sl.delete(i)).toBe(true)
      }
      expect(sl.size).toBe(5000)
      expect(sl.min()).toEqual([5000, 5000])
      expect(sl.max()).toEqual([9999, 9999])
    })

    it('should handle range queries on large list', () => {
      const sl = new ConcurrentSkipList<number, number>({ maxLevel: 20 })
      for (let i = 0; i < 10000; i++) {
        sl.insert(i, i * 10)
      }
      const r = sl.rangeQuery(100, 200)
      expect(r.length).toBe(101)
      expect(r[0]).toEqual([100, 1000])
      expect(r[100]).toEqual([200, 2000])
    })

    it('should handle getRank on large list', () => {
      const sl = new ConcurrentSkipList<number, string>({ maxLevel: 20 })
      for (let i = 0; i < 10000; i++) {
        sl.insert(i, String(i))
      }
      expect(sl.getRank(0)).toBe(0)
      expect(sl.getRank(5000)).toBe(5000)
      expect(sl.getRank(9999)).toBe(9999)
      expect(sl.getRank(10000)).toBe(-1)
    })

    it('should handle atIndex on large list', () => {
      const sl = new ConcurrentSkipList<number, string>({ maxLevel: 20 })
      for (let i = 0; i < 10000; i++) {
        sl.insert(i, String(i))
      }
      expect(sl.atIndex(0)).toEqual([0, '0'])
      expect(sl.atIndex(5000)).toEqual([5000, '5000'])
      expect(sl.atIndex(9999)).toEqual([9999, '9999'])
      expect(sl.atIndex(10000)).toBeUndefined()
    })

    it('should handle clone of large list', () => {
      const sl = new ConcurrentSkipList<number, number>({ maxLevel: 20 })
      for (let i = 0; i < 10000; i++) {
        sl.insert(i, i)
      }
      const cloned = sl.clone()
      expect(cloned.size).toBe(10000)
      expect(cloned.search(5000)).toBe(5000)
      cloned.delete(5000)
      expect(sl.search(5000)).toBe(5000)
      expect(cloned.search(5000)).toBeUndefined()
    })

    it('should handle from factory with large dataset', () => {
      const entries: [number, string][] = []
      for (let i = 0; i < 10000; i++) {
        entries.push([i, String(i)])
      }
      entries.reverse()
      const sl = ConcurrentSkipList.from(entries, { maxLevel: 20 })
      expect(sl.size).toBe(10000)
      expect(sl.atIndex(0)![0]).toBe(0)
      expect(sl.atIndex(9999)![0]).toBe(9999)
    })

    it('should handle alternating insert and delete', () => {
      const sl = new ConcurrentSkipList<number, string>()
      for (let i = 0; i < 500; i++) {
        sl.insert(i, String(i))
        if (i > 0) {
          sl.delete(i - 1)
        }
      }
      expect(sl.size).toBe(1)
      expect(sl.search(499)).toBe('499')
    })

    it('should maintain sorted order through heavy mixed operations', () => {
      const sl = new ConcurrentSkipList<number, number>({ maxLevel: 20 })
      const present = new Set<number>()
      for (let i = 0; i < 5000; i++) {
        const key = Math.floor(Math.random() * 1000)
        if (!present.has(key)) {
          sl.insert(key, key)
          present.add(key)
        }
      }
      for (const key of present) {
        expect(sl.contains(key)).toBe(true)
      }
      const arr = sl.toArray()
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]![0]).toBeGreaterThan(arr[i - 1]![0])
      }
    })
  })

  describe('type imports', () => {
    it('should allow importing SkipNode type', () => {
      const node: SkipNode<number, string> = {
        key: 1,
        value: 'test',
        forward: [null],
        span: [1],
      }
      expect(node.key).toBe(1)
      expect(node.value).toBe('test')
    })

    it('should allow importing ConcurrentSkipListOptions type', () => {
      const opts: ConcurrentSkipListOptions<number> = {
        maxLevel: 8,
        probability: 0.5,
      }
      expect(opts.maxLevel).toBe(8)
    })

    it('should allow importing ConcurrentSkipListStats type', () => {
      const s: ConcurrentSkipListStats = {
        size: 10,
        height: 5,
        maxLevel: 16,
        probability: 0.5,
        nodeCount: 10,
        levelDistribution: [10, 5, 2, 1],
      }
      expect(s.size).toBe(10)
    })
  })
})
