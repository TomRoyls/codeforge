import { describe, it, expect, beforeEach } from 'vitest'
import { SortedLinkedList } from '../../src/core/sorted-linked-list/sorted-linked-list.js'
import { DEFAULT_SORTED_LIST_OPTIONS } from '../../src/core/sorted-linked-list/types.js'
import type { SortedListOptions, SortedListJSON, SortedListStatistics } from '../../src/core/sorted-linked-list/types.js'

describe('SortedLinkedList', () => {
  let list: SortedLinkedList<number>

  beforeEach(() => {
    list = new SortedLinkedList<number>()
  })

  describe('constructor', () => {
    it('should create empty list with default options', () => {
      const l = new SortedLinkedList<number>()
      expect(l.isEmpty).toBe(true)
      expect(l.size).toBe(0)
    })

    it('should accept options object', () => {
      const l = new SortedLinkedList<number>({})
      expect(l.isEmpty).toBe(true)
    })

    it('should accept custom comparator', () => {
      const l = new SortedLinkedList<number>({ comparator: (a, b) => b - a })
      l.insert(1)
      l.insert(3)
      l.insert(2)
      expect(l.toArray()).toEqual([3, 2, 1])
    })

    it('should use default comparator when no options', () => {
      const l = new SortedLinkedList<number>()
      l.insert(3)
      l.insert(1)
      l.insert(2)
      expect(l.toArray()).toEqual([1, 2, 3])
    })

    it('should accept undefined options', () => {
      const l = new SortedLinkedList<number>(undefined)
      expect(l.isEmpty).toBe(true)
    })
  })

  describe('insert', () => {
    it('should insert single element', () => {
      list.insert(5)
      expect(list.size).toBe(1)
      expect(list.first()).toBe(5)
      expect(list.last()).toBe(5)
    })

    it('should maintain sorted order on insert', () => {
      list.insert(3)
      list.insert(1)
      list.insert(2)
      list.insert(5)
      list.insert(4)
      expect(list.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should insert at head when smallest', () => {
      list.insert(5)
      list.insert(3)
      list.insert(1)
      expect(list.first()).toBe(1)
    })

    it('should insert at tail when largest', () => {
      list.insert(1)
      list.insert(3)
      list.insert(5)
      expect(list.last()).toBe(5)
    })

    it('should insert duplicates', () => {
      list.insert(3)
      list.insert(3)
      list.insert(3)
      expect(list.size).toBe(3)
      expect(list.toArray()).toEqual([3, 3, 3])
    })

    it('should track insert statistics', () => {
      list.insert(1)
      list.insert(2)
      const stats = list.getStatistics()
      expect(stats.inserts).toBe(2)
    })

    it('should track maxSize', () => {
      list.insert(1)
      list.insert(2)
      list.insert(3)
      list.remove(2)
      expect(list.getStatistics().maxSize).toBe(3)
    })

    it('should insert negative numbers', () => {
      list.insert(-3)
      list.insert(0)
      list.insert(-1)
      list.insert(2)
      expect(list.toArray()).toEqual([-3, -1, 0, 2])
    })

    it('should insert many elements in order', () => {
      for (let i = 0; i < 100; i++) {
        list.insert(i)
      }
      expect(list.size).toBe(100)
      const arr = list.toArray()
      for (let i = 0; i < 99; i++) {
        expect(arr[i]! <= arr[i + 1]!).toBe(true)
      }
    })

    it('should insert many elements in reverse order', () => {
      for (let i = 99; i >= 0; i--) {
        list.insert(i)
      }
      expect(list.size).toBe(100)
      expect(list.toArray()).toEqual(Array.from({ length: 100 }, (_, i) => i))
    })
  })

  describe('remove', () => {
    it('should remove existing element', () => {
      list.insert(1)
      list.insert(2)
      list.insert(3)
      expect(list.remove(2)).toBe(true)
      expect(list.toArray()).toEqual([1, 3])
      expect(list.size).toBe(2)
    })

    it('should return false for non-existing element', () => {
      list.insert(1)
      expect(list.remove(5)).toBe(false)
      expect(list.size).toBe(1)
    })

    it('should return false on empty list', () => {
      expect(list.remove(1)).toBe(false)
    })

    it('should remove first element', () => {
      list.insert(1)
      list.insert(2)
      list.insert(3)
      expect(list.remove(1)).toBe(true)
      expect(list.first()).toBe(2)
      expect(list.toArray()).toEqual([2, 3])
    })

    it('should remove last element', () => {
      list.insert(1)
      list.insert(2)
      list.insert(3)
      expect(list.remove(3)).toBe(true)
      expect(list.last()).toBe(2)
      expect(list.toArray()).toEqual([1, 2])
    })

    it('should remove only element', () => {
      list.insert(42)
      expect(list.remove(42)).toBe(true)
      expect(list.isEmpty).toBe(true)
      expect(list.first()).toBeUndefined()
      expect(list.last()).toBeUndefined()
    })

    it('should remove first occurrence of duplicate', () => {
      list.insert(2)
      list.insert(1)
      list.insert(2)
      expect(list.remove(2)).toBe(true)
      expect(list.size).toBe(2)
      expect(list.toArray()).toEqual([1, 2])
    })

    it('should track remove statistics', () => {
      list.insert(1)
      list.insert(2)
      list.remove(1)
      const stats = list.getStatistics()
      expect(stats.removes).toBe(1)
    })

    it('should not track remove stats on failed removal', () => {
      list.insert(1)
      list.remove(99)
      expect(list.getStatistics().removes).toBe(0)
    })
  })

  describe('removeAll', () => {
    it('should remove all occurrences', () => {
      list.insert(2)
      list.insert(1)
      list.insert(2)
      list.insert(3)
      list.insert(2)
      expect(list.removeAll(2)).toBe(3)
      expect(list.toArray()).toEqual([1, 3])
    })

    it('should return 0 when value not found', () => {
      list.insert(1)
      expect(list.removeAll(5)).toBe(0)
      expect(list.size).toBe(1)
    })

    it('should return 0 on empty list', () => {
      expect(list.removeAll(1)).toBe(0)
    })

    it('should track remove statistics', () => {
      list.insert(2)
      list.insert(2)
      list.insert(2)
      list.removeAll(2)
      expect(list.getStatistics().removes).toBe(3)
    })

    it('should handle removing all elements', () => {
      list.insert(1)
      list.insert(1)
      list.insert(1)
      expect(list.removeAll(1)).toBe(3)
      expect(list.isEmpty).toBe(true)
    })
  })

  describe('has', () => {
    it('should return false on empty list', () => {
      expect(list.has(1)).toBe(false)
    })

    it('should return true for existing element', () => {
      list.insert(5)
      expect(list.has(5)).toBe(true)
    })

    it('should return false for non-existing element', () => {
      list.insert(1)
      list.insert(2)
      expect(list.has(3)).toBe(false)
    })

    it('should find element after removal', () => {
      list.insert(1)
      list.insert(2)
      list.insert(3)
      list.remove(2)
      expect(list.has(1)).toBe(true)
      expect(list.has(2)).toBe(false)
      expect(list.has(3)).toBe(true)
    })

    it('should track find statistics', () => {
      list.has(1)
      list.has(2)
      expect(list.getStatistics().finds).toBe(2)
    })
  })

  describe('get', () => {
    it('should return element at index', () => {
      list.insert(3)
      list.insert(1)
      list.insert(2)
      expect(list.get(0)).toBe(1)
      expect(list.get(1)).toBe(2)
      expect(list.get(2)).toBe(3)
    })

    it('should return undefined for out of bounds', () => {
      list.insert(1)
      expect(list.get(-1)).toBeUndefined()
      expect(list.get(1)).toBeUndefined()
    })

    it('should return undefined on empty list', () => {
      expect(list.get(0)).toBeUndefined()
    })

    it('should return undefined for large index', () => {
      list.insert(1)
      expect(list.get(100)).toBeUndefined()
    })
  })

  describe('indexOf', () => {
    it('should return index of existing element', () => {
      list.insert(3)
      list.insert(1)
      list.insert(2)
      expect(list.indexOf(1)).toBe(0)
      expect(list.indexOf(2)).toBe(1)
      expect(list.indexOf(3)).toBe(2)
    })

    it('should return -1 for non-existing element', () => {
      list.insert(1)
      expect(list.indexOf(5)).toBe(-1)
    })

    it('should return -1 on empty list', () => {
      expect(list.indexOf(1)).toBe(-1)
    })

    it('should return first index of duplicate', () => {
      list.insert(2)
      list.insert(1)
      list.insert(2)
      expect(list.indexOf(2)).toBe(1)
    })

    it('should track find statistics', () => {
      list.insert(1)
      list.indexOf(1)
      expect(list.getStatistics().finds).toBe(1)
    })
  })

  describe('first', () => {
    it('should return undefined on empty list', () => {
      expect(list.first()).toBeUndefined()
    })

    it('should return first element', () => {
      list.insert(5)
      list.insert(1)
      list.insert(3)
      expect(list.first()).toBe(1)
    })
  })

  describe('last', () => {
    it('should return undefined on empty list', () => {
      expect(list.last()).toBeUndefined()
    })

    it('should return last element', () => {
      list.insert(5)
      list.insert(1)
      list.insert(3)
      expect(list.last()).toBe(5)
    })
  })

  describe('size', () => {
    it('should be 0 on new list', () => {
      expect(list.size).toBe(0)
    })

    it('should increment on insert', () => {
      list.insert(1)
      expect(list.size).toBe(1)
      list.insert(2)
      expect(list.size).toBe(2)
    })

    it('should decrement on remove', () => {
      list.insert(1)
      list.insert(2)
      list.remove(1)
      expect(list.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should be true on new list', () => {
      expect(list.isEmpty).toBe(true)
    })

    it('should be false after insert', () => {
      list.insert(1)
      expect(list.isEmpty).toBe(false)
    })

    it('should be true after removing all elements', () => {
      list.insert(1)
      list.remove(1)
      expect(list.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should reset size to 0', () => {
      list.insert(1)
      list.insert(2)
      list.clear()
      expect(list.size).toBe(0)
    })

    it('should set isEmpty to true', () => {
      list.insert(1)
      list.clear()
      expect(list.isEmpty).toBe(true)
    })

    it('should reset head and tail', () => {
      list.insert(1)
      list.clear()
      expect(list.first()).toBeUndefined()
      expect(list.last()).toBeUndefined()
    })

    it('should reset statistics', () => {
      list.insert(1)
      list.remove(1)
      list.has(1)
      list.clear()
      const stats = list.getStatistics()
      expect(stats.inserts).toBe(0)
      expect(stats.removes).toBe(0)
      expect(stats.finds).toBe(0)
      expect(stats.merges).toBe(0)
      expect(stats.maxSize).toBe(0)
    })

    it('should allow adding after clear', () => {
      list.insert(1)
      list.clear()
      list.insert(2)
      expect(list.size).toBe(1)
      expect(list.first()).toBe(2)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty list', () => {
      expect(list.toArray()).toEqual([])
    })

    it('should return sorted array', () => {
      list.insert(3)
      list.insert(1)
      list.insert(2)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('should reflect modifications', () => {
      list.insert(3)
      list.insert(1)
      list.insert(2)
      list.remove(2)
      expect(list.toArray()).toEqual([1, 3])
    })
  })

  describe('range', () => {
    it('should return empty for invalid range', () => {
      list.insert(1)
      expect(list.range(2, 1)).toEqual([])
    })

    it('should return elements in range [start, end)', () => {
      for (let i = 0; i < 10; i++) list.insert(i)
      expect(list.range(2, 5)).toEqual([2, 3, 4])
    })

    it('should return empty for empty list', () => {
      expect(list.range(0, 5)).toEqual([])
    })

    it('should clamp negative start to 0', () => {
      for (let i = 0; i < 5; i++) list.insert(i)
      expect(list.range(-2, 3)).toEqual([0, 1, 2])
    })

    it('should clamp end to size', () => {
      for (let i = 0; i < 5; i++) list.insert(i)
      expect(list.range(3, 100)).toEqual([3, 4])
    })

    it('should return single element range', () => {
      for (let i = 0; i < 5; i++) list.insert(i)
      expect(list.range(2, 3)).toEqual([2])
    })

    it('should return all elements', () => {
      for (let i = 0; i < 5; i++) list.insert(i)
      expect(list.range(0, 5)).toEqual([0, 1, 2, 3, 4])
    })

    it('should return empty when start equals end', () => {
      list.insert(1)
      expect(list.range(0, 0)).toEqual([])
    })
  })

  describe('filter', () => {
    it('should filter elements', () => {
      for (let i = 0; i < 10; i++) list.insert(i)
      const evens = list.filter(v => v % 2 === 0)
      expect(evens).toEqual([0, 2, 4, 6, 8])
    })

    it('should return empty for no matches', () => {
      list.insert(1)
      list.insert(2)
      expect(list.filter(v => v > 10)).toEqual([])
    })

    it('should pass index to predicate', () => {
      list.insert(10)
      list.insert(20)
      list.insert(30)
      const indices: number[] = []
      list.filter((_v, i) => { indices.push(i); return true })
      expect(indices).toEqual([0, 1, 2])
    })

    it('should return empty for empty list', () => {
      expect(list.filter(() => true)).toEqual([])
    })

    it('should not modify the list', () => {
      list.insert(1)
      list.insert(2)
      list.insert(3)
      list.filter(v => v > 1)
      expect(list.size).toBe(3)
    })
  })

  describe('forEach', () => {
    it('should iterate all elements', () => {
      list.insert(3)
      list.insert(1)
      list.insert(2)
      const values: number[] = []
      list.forEach(v => values.push(v))
      expect(values).toEqual([1, 2, 3])
    })

    it('should pass index to callback', () => {
      list.insert(1)
      list.insert(2)
      const indices: number[] = []
      list.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1])
    })

    it('should not iterate empty list', () => {
      let count = 0
      list.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('[Symbol.iterator]', () => {
    it('should iterate in sorted order', () => {
      list.insert(3)
      list.insert(1)
      list.insert(2)
      const values = [...list]
      expect(values).toEqual([1, 2, 3])
    })

    it('should yield nothing for empty list', () => {
      expect([...list]).toEqual([])
    })

    it('should work with for-of', () => {
      list.insert(1)
      list.insert(2)
      const values: number[] = []
      for (const v of list) values.push(v)
      expect(values).toEqual([1, 2])
    })
  })

  describe('reverseIterator', () => {
    it('should iterate in reverse sorted order', () => {
      list.insert(1)
      list.insert(3)
      list.insert(2)
      const values: number[] = []
      for (const v of list.reverseIterator()) values.push(v)
      expect(values).toEqual([3, 2, 1])
    })

    it('should yield nothing for empty list', () => {
      const values: number[] = []
      for (const v of list.reverseIterator()) values.push(v)
      expect(values).toEqual([])
    })

    it('should work with single element', () => {
      list.insert(5)
      const values: number[] = []
      for (const v of list.reverseIterator()) values.push(v)
      expect(values).toEqual([5])
    })
  })

  describe('count', () => {
    it('should return 0 on empty list', () => {
      expect(list.count(1)).toBe(0)
    })

    it('should return 1 for single occurrence', () => {
      list.insert(1)
      list.insert(2)
      expect(list.count(1)).toBe(1)
    })

    it('should count duplicates', () => {
      list.insert(2)
      list.insert(2)
      list.insert(2)
      expect(list.count(2)).toBe(3)
    })

    it('should return 0 for non-existing', () => {
      list.insert(1)
      expect(list.count(5)).toBe(0)
    })

    it('should track find statistics', () => {
      list.count(1)
      expect(list.getStatistics().finds).toBe(1)
    })
  })

  describe('lowerBound', () => {
    it('should return first index where element >= value', () => {
      list.insert(1)
      list.insert(3)
      list.insert(5)
      expect(list.lowerBound(3)).toBe(1)
    })

    it('should return size when all elements < value', () => {
      list.insert(1)
      list.insert(2)
      list.insert(3)
      expect(list.lowerBound(10)).toBe(3)
    })

    it('should return 0 when first element >= value', () => {
      list.insert(5)
      list.insert(10)
      expect(list.lowerBound(3)).toBe(0)
    })

    it('should return 0 on empty list', () => {
      expect(list.lowerBound(1)).toBe(0)
    })

    it('should work with duplicates', () => {
      list.insert(2)
      list.insert(2)
      list.insert(3)
      expect(list.lowerBound(2)).toBe(0)
    })
  })

  describe('upperBound', () => {
    it('should return first index where element > value', () => {
      list.insert(1)
      list.insert(3)
      list.insert(5)
      expect(list.upperBound(3)).toBe(2)
    })

    it('should return size when all elements <= value', () => {
      list.insert(1)
      list.insert(2)
      list.insert(3)
      expect(list.upperBound(10)).toBe(3)
    })

    it('should return 0 when first element > value', () => {
      list.insert(5)
      list.insert(10)
      expect(list.upperBound(2)).toBe(0)
    })

    it('should return 0 on empty list', () => {
      expect(list.upperBound(1)).toBe(0)
    })

    it('should work with duplicates', () => {
      list.insert(2)
      list.insert(2)
      list.insert(3)
      expect(list.upperBound(2)).toBe(2)
    })
  })

  describe('merge', () => {
    it('should merge two sorted lists', () => {
      list.insert(1)
      list.insert(3)
      const other = new SortedLinkedList<number>()
      other.insert(2)
      other.insert(4)
      list.merge(other)
      expect(list.toArray()).toEqual([1, 2, 3, 4])
    })

    it('should merge empty list', () => {
      list.insert(1)
      const other = new SortedLinkedList<number>()
      list.merge(other)
      expect(list.size).toBe(1)
    })

    it('should merge into empty list', () => {
      const other = new SortedLinkedList<number>()
      other.insert(1)
      other.insert(2)
      list.merge(other)
      expect(list.toArray()).toEqual([1, 2])
    })

    it('should track merge statistics', () => {
      const other = new SortedLinkedList<number>()
      other.insert(1)
      list.merge(other)
      expect(list.getStatistics().merges).toBe(1)
    })

    it('should merge two empty lists', () => {
      const other = new SortedLinkedList<number>()
      list.merge(other)
      expect(list.isEmpty).toBe(true)
      expect(list.getStatistics().merges).toBe(1)
    })

    it('should maintain sorted order after merge', () => {
      for (let i = 10; i < 20; i++) list.insert(i)
      const other = new SortedLinkedList<number>()
      for (let i = 0; i < 10; i++) other.insert(i)
      list.merge(other)
      const arr = list.toArray()
      for (let i = 0; i < arr.length - 1; i++) {
        expect(arr[i]! <= arr[i + 1]!).toBe(true)
      }
    })
  })

  describe('unique', () => {
    it('should remove duplicate values', () => {
      list.insert(1)
      list.insert(1)
      list.insert(2)
      list.insert(2)
      list.insert(3)
      list.unique()
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('should handle no duplicates', () => {
      list.insert(1)
      list.insert(2)
      list.insert(3)
      list.unique()
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('should handle empty list', () => {
      list.unique()
      expect(list.isEmpty).toBe(true)
    })

    it('should handle all duplicates', () => {
      list.insert(1)
      list.insert(1)
      list.insert(1)
      list.unique()
      expect(list.toArray()).toEqual([1])
      expect(list.size).toBe(1)
    })

    it('should handle single element', () => {
      list.insert(5)
      list.unique()
      expect(list.toArray()).toEqual([5])
    })
  })

  describe('getStatistics', () => {
    it('should return all-zero stats on new list', () => {
      const stats = list.getStatistics()
      expect(stats.inserts).toBe(0)
      expect(stats.removes).toBe(0)
      expect(stats.finds).toBe(0)
      expect(stats.merges).toBe(0)
      expect(stats.maxSize).toBe(0)
    })

    it('should track inserts', () => {
      list.insert(1)
      list.insert(2)
      expect(list.getStatistics().inserts).toBe(2)
    })

    it('should track removes', () => {
      list.insert(1)
      list.remove(1)
      expect(list.getStatistics().removes).toBe(1)
    })

    it('should track finds from has', () => {
      list.has(1)
      expect(list.getStatistics().finds).toBe(1)
    })

    it('should track finds from indexOf', () => {
      list.indexOf(1)
      expect(list.getStatistics().finds).toBe(1)
    })

    it('should track finds from count', () => {
      list.count(1)
      expect(list.getStatistics().finds).toBe(1)
    })

    it('should track merges', () => {
      list.merge(new SortedLinkedList<number>())
      expect(list.getStatistics().merges).toBe(1)
    })

    it('should track maxSize', () => {
      for (let i = 0; i < 10; i++) list.insert(i)
      for (let i = 0; i < 5; i++) list.remove(i)
      expect(list.getStatistics().maxSize).toBe(10)
    })

    it('should return a copy', () => {
      list.insert(1)
      const stats1 = list.getStatistics()
      list.insert(2)
      expect(stats1.inserts).toBe(1)
      expect(list.getStatistics().inserts).toBe(2)
    })
  })

  describe('toJSON', () => {
    it('should produce correct structure', () => {
      list.insert(1)
      list.insert(2)
      const json = list.toJSON()
      expect(json).toHaveProperty('values')
      expect(json).toHaveProperty('statistics')
      expect(json.values).toEqual([1, 2])
    })

    it('should include statistics', () => {
      list.insert(1)
      list.has(1)
      const json = list.toJSON()
      expect(json.statistics.inserts).toBe(1)
      expect(json.statistics.finds).toBe(1)
    })

    it('should serialize empty list', () => {
      const json = list.toJSON()
      expect(json.values).toEqual([])
      expect(json.statistics.inserts).toBe(0)
    })
  })

  describe('fromJSON', () => {
    it('should restore a serialized list', () => {
      list.insert(1)
      list.insert(2)
      list.insert(3)
      const json = list.toJSON()
      const restored = SortedLinkedList.fromJSON(json)
      expect(restored.toArray()).toEqual([1, 2, 3])
    })

    it('should round-trip correctly', () => {
      for (let i = 0; i < 20; i++) list.insert(i)
      const json = list.toJSON()
      const restored = SortedLinkedList.fromJSON(json)
      expect(restored.toJSON().values).toEqual(json.values)
    })

    it('should preserve statistics', () => {
      list.insert(1)
      list.has(1)
      const json = list.toJSON()
      const restored = SortedLinkedList.fromJSON(json)
      expect(restored.getStatistics().inserts).toBe(1)
      expect(restored.getStatistics().finds).toBe(1)
    })

    it('should allow operations after restoration', () => {
      list.insert(1)
      const restored = SortedLinkedList.fromJSON(list.toJSON())
      restored.insert(2)
      expect(restored.size).toBe(2)
      expect(restored.toArray()).toEqual([1, 2])
    })

    it('should restore with custom comparator', () => {
      const json: SortedListJSON<number> = { values: [3, 1, 2], statistics: { inserts: 3, removes: 0, finds: 0, merges: 0, maxSize: 3 } }
      const restored = SortedLinkedList.fromJSON(json)
      expect(restored.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('sorted order maintenance', () => {
    it('should maintain order after many random inserts', () => {
      const values = [5, 2, 8, 1, 9, 3, 7, 4, 6, 0]
      for (const v of values) list.insert(v)
      expect(list.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should maintain order after removes', () => {
      for (let i = 0; i < 10; i++) list.insert(i)
      list.remove(5)
      list.remove(2)
      list.remove(8)
      expect(list.toArray()).toEqual([0, 1, 3, 4, 6, 7, 9])
    })

    it('should maintain order after merge', () => {
      list.insert(1)
      list.insert(5)
      const other = new SortedLinkedList<number>()
      other.insert(2)
      other.insert(3)
      other.insert(4)
      list.merge(other)
      expect(list.toArray()).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('custom comparator', () => {
    it('should sort strings', () => {
      const sl = new SortedLinkedList<string>()
      sl.insert('cherry')
      sl.insert('apple')
      sl.insert('banana')
      expect(sl.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should sort objects by property', () => {
      const sl = new SortedLinkedList<{ age: number }>({
        comparator: (a, b) => a.age - b.age,
      })
      sl.insert({ age: 30 })
      sl.insert({ age: 20 })
      sl.insert({ age: 25 })
      expect(sl.toArray().map(o => o.age)).toEqual([20, 25, 30])
    })

    it('should sort in descending order', () => {
      const sl = new SortedLinkedList<number>({ comparator: (a, b) => b - a })
      sl.insert(1)
      sl.insert(3)
      sl.insert(2)
      expect(sl.toArray()).toEqual([3, 2, 1])
    })
  })

  describe('edge cases', () => {
    it('should handle single element operations', () => {
      list.insert(42)
      expect(list.first()).toBe(42)
      expect(list.last()).toBe(42)
      expect(list.get(0)).toBe(42)
      expect(list.indexOf(42)).toBe(0)
      expect(list.has(42)).toBe(true)
      expect(list.count(42)).toBe(1)
    })

    it('should handle insert after clear', () => {
      list.insert(1)
      list.insert(2)
      list.clear()
      list.insert(3)
      expect(list.size).toBe(1)
      expect(list.first()).toBe(3)
    })

    it('should handle remove then insert', () => {
      list.insert(1)
      list.insert(2)
      list.insert(3)
      list.remove(2)
      list.insert(2)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('should handle many duplicate inserts', () => {
      for (let i = 0; i < 50; i++) list.insert(5)
      expect(list.size).toBe(50)
      expect(list.count(5)).toBe(50)
    })

    it('should handle alternating insert and remove', () => {
      for (let i = 0; i < 10; i++) {
        list.insert(i)
        list.remove(i)
      }
      expect(list.isEmpty).toBe(true)
    })

    it('should handle range on single element list', () => {
      list.insert(5)
      expect(list.range(0, 1)).toEqual([5])
      expect(list.range(0, 0)).toEqual([])
      expect(list.range(1, 2)).toEqual([])
    })

    it('should handle lowerBound/upperBound on single element', () => {
      list.insert(5)
      expect(list.lowerBound(5)).toBe(0)
      expect(list.lowerBound(4)).toBe(0)
      expect(list.lowerBound(6)).toBe(1)
      expect(list.upperBound(5)).toBe(1)
      expect(list.upperBound(4)).toBe(0)
      expect(list.upperBound(6)).toBe(1)
    })
  })

  describe('DEFAULT_SORTED_LIST_OPTIONS', () => {
    it('should have comparator function', () => {
      expect(typeof DEFAULT_SORTED_LIST_OPTIONS.comparator).toBe('function')
    })

    it('should sort numbers correctly with default comparator', () => {
      const c = DEFAULT_SORTED_LIST_OPTIONS.comparator
      expect(c(1, 2)).toBeLessThan(0)
      expect(c(2, 1)).toBeGreaterThan(0)
      expect(c(1, 1)).toBe(0)
    })
  })

  describe('exports', () => {
    it('should export SortedLinkedList class', () => {
      expect(SortedLinkedList).toBeDefined()
      expect(typeof SortedLinkedList).toBe('function')
    })

    it('should export DEFAULT_SORTED_LIST_OPTIONS', () => {
      expect(DEFAULT_SORTED_LIST_OPTIONS).toBeDefined()
    })

    it('should allow type-only imports for options', () => {
      const opts: SortedListOptions<number> = { comparator: (a, b) => a - b }
      const l = new SortedLinkedList<number>(opts)
      l.insert(1)
      expect(l.size).toBe(1)
    })

    it('should allow type import for SortedListJSON', () => {
      list.insert(1)
      const json: SortedListJSON<number> = list.toJSON()
      expect(json.values).toEqual([1])
    })

    it('should allow type import for SortedListStatistics', () => {
      const stats: SortedListStatistics = list.getStatistics()
      expect(stats.inserts).toBe(0)
    })
  })

  describe('integration', () => {
    it('should handle full workflow', () => {
      list.insert(5)
      list.insert(2)
      list.insert(8)
      list.insert(1)
      list.insert(3)
      expect(list.size).toBe(5)
      expect(list.toArray()).toEqual([1, 2, 3, 5, 8])
      expect(list.has(3)).toBe(true)
      expect(list.has(4)).toBe(false)
      expect(list.indexOf(5)).toBe(3)
      expect(list.get(2)).toBe(3)
      expect(list.range(1, 4)).toEqual([2, 3, 5])
      expect(list.lowerBound(3)).toBe(2)
      expect(list.upperBound(3)).toBe(3)
      list.remove(3)
      expect(list.toArray()).toEqual([1, 2, 5, 8])
      const other = new SortedLinkedList<number>()
      other.insert(4)
      other.insert(6)
      list.merge(other)
      expect(list.toArray()).toEqual([1, 2, 4, 5, 6, 8])
    })

    it('should handle serialization round trip with operations', () => {
      for (let i = 10; i > 0; i--) list.insert(i)
      const json = list.toJSON()
      const restored = SortedLinkedList.fromJSON(json)
      restored.insert(11)
      restored.remove(5)
      expect(restored.size).toBe(10)
      expect(restored.has(5)).toBe(false)
      expect(restored.has(11)).toBe(true)
    })
  })
})
