import { describe, it, expect, beforeEach } from 'vitest'
import { SkipList } from '../../src/core/skip-list/skip-list.js'
import { DEFAULT_SKIP_LIST_OPTIONS } from '../../src/core/skip-list/types.js'
import type { SkipListOptions, SkipListStats } from '../../src/core/skip-list/types.js'

describe('SkipList', () => {
  let list: SkipList<string>

  beforeEach(() => {
    list = new SkipList<string>()
  })

  describe('constructor', () => {
    it('should create an empty skip list with default options', () => {
      const sl = new SkipList<string>()
      expect(sl.isEmpty()).toBe(true)
      expect(sl.size()).toBe(0)
    })

    it('should accept custom maxLevel', () => {
      const sl = new SkipList<string>({ maxLevel: 8 })
      expect(sl.getStats().maxLevel).toBe(8)
    })

    it('should accept custom probability', () => {
      const sl = new SkipList<string>({ probability: 0.25 })
      expect(sl.getStats().maxLevel).toBe(DEFAULT_SKIP_LIST_OPTIONS.maxLevel)
    })

    it('should accept partial options with defaults', () => {
      const sl = new SkipList<string>({ maxLevel: 4 })
      const stats = sl.getStats()
      expect(stats.maxLevel).toBe(4)
    })

    it('should accept all options combined', () => {
      const sl = new SkipList<string>({ maxLevel: 10, probability: 0.3 })
      const stats = sl.getStats()
      expect(stats.maxLevel).toBe(10)
    })

    it('should have currentLevel of 0 for empty list', () => {
      expect(list.getStats().currentLevel).toBe(0)
    })
  })

  describe('insert', () => {
    it('should insert a single element', () => {
      list.insert(1, 'one')
      expect(list.size()).toBe(1)
    })

    it('should insert multiple elements', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.insert(3, 'three')
      expect(list.size()).toBe(3)
    })

    it('should update value for duplicate key', () => {
      list.insert(1, 'one')
      list.insert(1, 'updated')
      expect(list.size()).toBe(1)
      expect(list.search(1)).toBe('updated')
    })

    it('should insert elements with negative keys', () => {
      list.insert(-5, 'negative')
      expect(list.search(-5)).toBe('negative')
    })

    it('should insert elements with zero key', () => {
      list.insert(0, 'zero')
      expect(list.search(0)).toBe('zero')
    })

    it('should insert elements with large keys', () => {
      list.insert(Number.MAX_SAFE_INTEGER, 'max')
      expect(list.search(Number.MAX_SAFE_INTEGER)).toBe('max')
    })

    it('should insert elements in reverse order', () => {
      list.insert(3, 'three')
      list.insert(2, 'two')
      list.insert(1, 'one')
      expect(list.size()).toBe(3)
      expect(list.search(1)).toBe('one')
      expect(list.search(2)).toBe('two')
      expect(list.search(3)).toBe('three')
    })

    it('should insert elements in random order', () => {
      list.insert(5, 'five')
      list.insert(1, 'one')
      list.insert(3, 'three')
      list.insert(2, 'two')
      list.insert(4, 'four')
      expect(list.size()).toBe(5)
      const arr = list.toArray()
      expect(arr[0]![0]).toBe(1)
      expect(arr[4]![0]).toBe(5)
    })
  })

  describe('search', () => {
    it('should find an inserted element', () => {
      list.insert(1, 'one')
      expect(list.search(1)).toBe('one')
    })

    it('should return undefined for missing key', () => {
      expect(list.search(99)).toBeUndefined()
    })

    it('should return undefined for search on empty list', () => {
      expect(list.search(1)).toBeUndefined()
    })

    it('should find elements after multiple inserts', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.insert(3, 'three')
      expect(list.search(1)).toBe('one')
      expect(list.search(2)).toBe('two')
      expect(list.search(3)).toBe('three')
    })

    it('should find element after value update', () => {
      list.insert(1, 'old')
      list.insert(1, 'new')
      expect(list.search(1)).toBe('new')
    })

    it('should find elements with negative keys', () => {
      list.insert(-10, 'neg')
      expect(list.search(-10)).toBe('neg')
    })

    it('should find element at the beginning', () => {
      list.insert(1, 'first')
      list.insert(100, 'last')
      expect(list.search(1)).toBe('first')
    })

    it('should find element at the end', () => {
      list.insert(1, 'first')
      list.insert(100, 'last')
      expect(list.search(100)).toBe('last')
    })
  })

  describe('delete', () => {
    it('should delete an existing element', () => {
      list.insert(1, 'one')
      expect(list.delete(1)).toBe(true)
      expect(list.size()).toBe(0)
    })

    it('should return false for missing key', () => {
      expect(list.delete(99)).toBe(false)
    })

    it('should return false for delete on empty list', () => {
      expect(list.delete(1)).toBe(false)
    })

    it('should delete from middle of list', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.insert(3, 'three')
      expect(list.delete(2)).toBe(true)
      expect(list.size()).toBe(2)
      expect(list.search(2)).toBeUndefined()
    })

    it('should delete from beginning of list', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      expect(list.delete(1)).toBe(true)
      expect(list.getMin()).toBe('two')
    })

    it('should delete from end of list', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      expect(list.delete(2)).toBe(true)
      expect(list.getMax()).toBe('one')
    })

    it('should handle deleting all elements', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.delete(1)
      list.delete(2)
      expect(list.isEmpty()).toBe(true)
    })

    it('should not affect other elements after deletion', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.insert(3, 'three')
      list.delete(2)
      expect(list.search(1)).toBe('one')
      expect(list.search(3)).toBe('three')
    })

    it('should handle deleting reinserted element', () => {
      list.insert(1, 'one')
      list.delete(1)
      list.insert(1, 'new one')
      expect(list.search(1)).toBe('new one')
    })
  })

  describe('has', () => {
    it('should return true for existing key', () => {
      list.insert(1, 'one')
      expect(list.has(1)).toBe(true)
    })

    it('should return false for missing key', () => {
      list.insert(1, 'one')
      expect(list.has(2)).toBe(false)
    })

    it('should return false on empty list', () => {
      expect(list.has(1)).toBe(false)
    })

    it('should return false after deletion', () => {
      list.insert(1, 'one')
      list.delete(1)
      expect(list.has(1)).toBe(false)
    })
  })

  describe('getMin', () => {
    it('should return undefined for empty list', () => {
      expect(list.getMin()).toBeUndefined()
    })

    it('should return the minimum value', () => {
      list.insert(5, 'five')
      list.insert(1, 'one')
      list.insert(10, 'ten')
      expect(list.getMin()).toBe('one')
    })

    it('should update min after deletion', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.delete(1)
      expect(list.getMin()).toBe('two')
    })

    it('should return the only element', () => {
      list.insert(42, 'forty-two')
      expect(list.getMin()).toBe('forty-two')
    })
  })

  describe('getMax', () => {
    it('should return undefined for empty list', () => {
      expect(list.getMax()).toBeUndefined()
    })

    it('should return the maximum value', () => {
      list.insert(5, 'five')
      list.insert(1, 'one')
      list.insert(10, 'ten')
      expect(list.getMax()).toBe('ten')
    })

    it('should update max after deletion', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.delete(2)
      expect(list.getMax()).toBe('one')
    })

    it('should return the only element', () => {
      list.insert(42, 'forty-two')
      expect(list.getMax()).toBe('forty-two')
    })
  })

  describe('range', () => {
    it('should return empty array for no matches', () => {
      list.insert(1, 'one')
      expect(list.range(5, 10)).toEqual([])
    })

    it('should return matching elements in range', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.insert(3, 'three')
      list.insert(4, 'four')
      list.insert(5, 'five')
      expect(list.range(2, 4)).toEqual(['two', 'three', 'four'])
    })

    it('should return single element range', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      expect(list.range(1, 1)).toEqual(['one'])
    })

    it('should return all elements for full range', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.insert(3, 'three')
      expect(list.range(1, 3)).toEqual(['one', 'two', 'three'])
    })

    it('should return empty array on empty list', () => {
      expect(list.range(1, 10)).toEqual([])
    })

    it('should handle range with no elements in bounds', () => {
      list.insert(1, 'one')
      list.insert(10, 'ten')
      expect(list.range(3, 7)).toEqual([])
    })

    it('should include boundary elements', () => {
      list.insert(1, 'one')
      list.insert(5, 'five')
      list.insert(10, 'ten')
      expect(list.range(1, 5)).toEqual(['one', 'five'])
    })

    it('should handle range where min equals max and key exists', () => {
      list.insert(5, 'five')
      expect(list.range(5, 5)).toEqual(['five'])
    })

    it('should handle range where min equals max and key does not exist', () => {
      list.insert(5, 'five')
      expect(list.range(3, 3)).toEqual([])
    })
  })

  describe('forEach', () => {
    it('should iterate over all elements in order', () => {
      list.insert(3, 'three')
      list.insert(1, 'one')
      list.insert(2, 'two')
      const result: string[] = []
      list.forEach((value) => result.push(value))
      expect(result).toEqual(['one', 'two', 'three'])
    })

    it('should not iterate on empty list', () => {
      let count = 0
      list.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should provide correct key and value', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      const pairs: [number, string][] = []
      list.forEach((value, key) => pairs.push([key, value]))
      expect(pairs).toEqual([[1, 'one'], [2, 'two']])
    })

    it('should iterate single element', () => {
      list.insert(1, 'one')
      const result: string[] = []
      list.forEach((value) => result.push(value))
      expect(result).toEqual(['one'])
    })
  })

  describe('size', () => {
    it('should return 0 for empty list', () => {
      expect(list.size()).toBe(0)
    })

    it('should return correct size after inserts', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      expect(list.size()).toBe(2)
    })

    it('should return correct size after deletion', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.delete(1)
      expect(list.size()).toBe(1)
    })

    it('should not change size on duplicate insert', () => {
      list.insert(1, 'one')
      list.insert(1, 'updated')
      expect(list.size()).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new list', () => {
      expect(list.isEmpty()).toBe(true)
    })

    it('should return false after insert', () => {
      list.insert(1, 'one')
      expect(list.isEmpty()).toBe(false)
    })

    it('should return true after deleting all elements', () => {
      list.insert(1, 'one')
      list.delete(1)
      expect(list.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      list.insert(1, 'one')
      list.clear()
      expect(list.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear all elements', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.clear()
      expect(list.size()).toBe(0)
      expect(list.isEmpty()).toBe(true)
    })

    it('should reset current level', () => {
      list.insert(1, 'one')
      list.clear()
      expect(list.getStats().currentLevel).toBe(0)
    })

    it('should allow inserts after clear', () => {
      list.insert(1, 'one')
      list.clear()
      list.insert(2, 'two')
      expect(list.size()).toBe(1)
      expect(list.search(2)).toBe('two')
    })

    it('should handle clearing an empty list', () => {
      list.clear()
      expect(list.isEmpty()).toBe(true)
    })

    it('should make search return undefined after clear', () => {
      list.insert(1, 'one')
      list.clear()
      expect(list.search(1)).toBeUndefined()
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty list', () => {
      expect(list.toArray()).toEqual([])
    })

    it('should return all elements in order', () => {
      list.insert(3, 'three')
      list.insert(1, 'one')
      list.insert(2, 'two')
      expect(list.toArray()).toEqual([[1, 'one'], [2, 'two'], [3, 'three']])
    })

    it('should return single element', () => {
      list.insert(1, 'one')
      expect(list.toArray()).toEqual([[1, 'one']])
    })

    it('should reflect deletions', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.insert(3, 'three')
      list.delete(2)
      expect(list.toArray()).toEqual([[1, 'one'], [3, 'three']])
    })

    it('should reflect updates', () => {
      list.insert(1, 'old')
      list.insert(1, 'new')
      expect(list.toArray()).toEqual([[1, 'new']])
    })
  })

  describe('getStats', () => {
    it('should return correct stats for empty list', () => {
      const stats = list.getStats()
      expect(stats.size).toBe(0)
      expect(stats.nodeCount).toBe(0)
      expect(stats.currentLevel).toBe(0)
    })

    it('should return correct stats after inserts', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      const stats = list.getStats()
      expect(stats.size).toBe(2)
      expect(stats.nodeCount).toBe(2)
      expect(stats.currentLevel).toBeGreaterThanOrEqual(1)
    })

    it('should return correct maxLevel', () => {
      const sl = new SkipList<string>({ maxLevel: 8 })
      expect(sl.getStats().maxLevel).toBe(8)
    })

    it('should update stats after deletion', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.delete(1)
      expect(list.getStats().size).toBe(1)
    })

    it('should reset stats after clear', () => {
      list.insert(1, 'one')
      list.clear()
      const stats = list.getStats()
      expect(stats.size).toBe(0)
      expect(stats.currentLevel).toBe(0)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_SKIP_LIST_OPTIONS', () => {
      expect(DEFAULT_SKIP_LIST_OPTIONS.maxLevel).toBe(16)
      expect(DEFAULT_SKIP_LIST_OPTIONS.probability).toBe(0.5)
    })

    it('should support SkipListOptions interface', () => {
      const opts: SkipListOptions = {
        maxLevel: 10,
        probability: 0.3,
      }
      expect(opts.maxLevel).toBe(10)
    })

    it('should support SkipListStats interface', () => {
      const stats: SkipListStats = {
        size: 5,
        maxLevel: 16,
        currentLevel: 3,
        nodeCount: 5,
      }
      expect(stats.size).toBe(5)
      expect(stats.nodeCount).toBe(5)
    })
  })

  describe('large datasets', () => {
    it('should handle 1000 inserts', () => {
      for (let i = 0; i < 1000; i++) {
        list.insert(i, `val-${i}`)
      }
      expect(list.size()).toBe(1000)
      expect(list.search(0)).toBe('val-0')
      expect(list.search(999)).toBe('val-999')
    })

    it('should handle 1000 inserts and searches', () => {
      for (let i = 0; i < 1000; i++) {
        list.insert(i, `val-${i}`)
      }
      for (let i = 0; i < 1000; i++) {
        expect(list.has(i)).toBe(true)
      }
    })

    it('should handle insert delete reinsert cycle', () => {
      for (let i = 0; i < 100; i++) {
        list.insert(i, `val-${i}`)
      }
      for (let i = 0; i < 50; i++) {
        list.delete(i)
      }
      expect(list.size()).toBe(50)
      for (let i = 0; i < 50; i++) {
        list.insert(i, `new-${i}`)
      }
      expect(list.size()).toBe(100)
    })

    it('should maintain sort order for random inserts', () => {
      const keys = [5, 2, 8, 1, 9, 3, 7, 4, 6, 10]
      for (const k of keys) {
        list.insert(k, `val-${k}`)
      }
      const arr = list.toArray()
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]![0]).toBeGreaterThan(arr[i - 1]![0])
      }
    })
  })

  describe('edge cases', () => {
    it('should handle number values', () => {
      const numList = new SkipList<number>()
      numList.insert(1, 100)
      numList.insert(2, 200)
      expect(numList.search(1)).toBe(100)
    })

    it('should handle object values', () => {
      const objList = new SkipList<{ name: string }>()
      objList.insert(1, { name: 'test' })
      expect(objList.search(1)?.name).toBe('test')
    })

    it('should handle null value', () => {
      const nullList = new SkipList<null>()
      nullList.insert(1, null)
      expect(nullList.search(1)).toBeNull()
    })

    it('should handle undefined value', () => {
      const undefList = new SkipList<undefined>()
      undefList.insert(1, undefined)
      expect(undefList.search(1)).toBeUndefined()
      expect(undefList.has(1)).toBe(true)
    })

    it('should handle sequential keys', () => {
      for (let i = 0; i < 10; i++) {
        list.insert(i, `val-${i}`)
      }
      expect(list.size()).toBe(10)
      expect(list.getMin()).toBe('val-0')
      expect(list.getMax()).toBe('val-9')
    })

    it('should handle duplicate key value update', () => {
      list.insert(1, 'first')
      list.insert(1, 'second')
      list.insert(1, 'third')
      expect(list.size()).toBe(1)
      expect(list.search(1)).toBe('third')
    })

    it('should handle getMin and getMax on single element', () => {
      list.insert(5, 'five')
      expect(list.getMin()).toBe('five')
      expect(list.getMax()).toBe('five')
    })

    it('should handle range on single element in range', () => {
      list.insert(5, 'five')
      expect(list.range(1, 10)).toEqual(['five'])
    })

    it('should handle range on single element outside range', () => {
      list.insert(5, 'five')
      expect(list.range(6, 10)).toEqual([])
    })

    it('should handle deleting non-existent key from populated list', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      expect(list.delete(3)).toBe(false)
      expect(list.size()).toBe(2)
    })

    it('should work with low maxLevel', () => {
      const sl = new SkipList<string>({ maxLevel: 2, probability: 0.5 })
      for (let i = 0; i < 10; i++) {
        sl.insert(i, `val-${i}`)
      }
      expect(sl.size()).toBe(10)
      expect(sl.search(5)).toBe('val-5')
    })

    it('should work with high probability', () => {
      const sl = new SkipList<string>({ maxLevel: 4, probability: 0.99 })
      for (let i = 0; i < 10; i++) {
        sl.insert(i, `val-${i}`)
      }
      expect(sl.size()).toBe(10)
      expect(sl.getStats().currentLevel).toBeGreaterThanOrEqual(1)
    })
  })
})
