import { describe, it, expect, beforeEach } from 'vitest'
import { TreeMap } from '../../src/core/tree-map/tree-map.js'

describe('TreeMap', () => {
  let map: TreeMap<number, string>

  beforeEach(() => {
    map = new TreeMap<number, string>()
  })

  describe('constructor', () => {
    it('should create an empty map', () => {
      const m = new TreeMap<number, string>()
      expect(m.size()).toBe(0)
      expect(m.isEmpty()).toBe(true)
    })

    it('should accept a custom compare function', () => {
      const reverseCompare = (a: number, b: number) => b - a
      const m = new TreeMap<number, string>(reverseCompare)
      m.set(1, 'one')
      m.set(2, 'two')
      m.set(3, 'three')
      expect(m.keys()).toEqual([3, 2, 1])
    })

    it('should use default numeric compare', () => {
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(2, 'two')
      expect(map.keys()).toEqual([1, 2, 3])
    })

    it('should work with undefined compare', () => {
      const m = new TreeMap<number, string>(undefined)
      m.set(1, 'a')
      expect(m.get(1)).toBe('a')
    })
  })

  describe('set', () => {
    it('should insert a single key-value pair', () => {
      map.set(10, 'ten')
      expect(map.size()).toBe(1)
      expect(map.get(10)).toBe('ten')
    })

    it('should insert multiple keys in order', () => {
      map.set(10, 'ten')
      map.set(20, 'twenty')
      map.set(30, 'thirty')
      expect(map.size()).toBe(3)
    })

    it('should insert multiple keys in reverse order', () => {
      map.set(30, 'thirty')
      map.set(20, 'twenty')
      map.set(10, 'ten')
      expect(map.size()).toBe(3)
    })

    it('should update value for duplicate key', () => {
      map.set(10, 'ten')
      map.set(10, 'TEN')
      expect(map.size()).toBe(1)
      expect(map.get(10)).toBe('TEN')
    })

    it('should handle negative keys', () => {
      map.set(-5, 'neg5')
      map.set(-10, 'neg10')
      map.set(5, 'pos5')
      expect(map.size()).toBe(3)
      expect(map.get(-5)).toBe('neg5')
    })

    it('should handle zero key', () => {
      map.set(0, 'zero')
      expect(map.get(0)).toBe('zero')
    })

    it('should return void', () => {
      const result = map.set(1, 'one')
      expect(result).toBeUndefined()
    })

    it('should maintain sorted order after insertions', () => {
      map.set(5, 'five')
      map.set(3, 'three')
      map.set(8, 'eight')
      map.set(1, 'one')
      map.set(4, 'four')
      expect(map.keys()).toEqual([1, 3, 4, 5, 8])
    })

    it('should handle many sequential insertions', () => {
      for (let i = 0; i < 100; i++) {
        map.set(i, `val${i}`)
      }
      expect(map.size()).toBe(100)
      expect(map.keys()).toEqual(Array.from({ length: 100 }, (_, i) => i))
    })

    it('should handle many reverse sequential insertions', () => {
      for (let i = 99; i >= 0; i--) {
        map.set(i, `val${i}`)
      }
      expect(map.size()).toBe(100)
      expect(map.keys()).toEqual(Array.from({ length: 100 }, (_, i) => i))
    })
  })

  describe('get', () => {
    it('should return undefined for missing key on empty map', () => {
      expect(map.get(1)).toBeUndefined()
    })

    it('should return undefined for missing key', () => {
      map.set(1, 'one')
      expect(map.get(2)).toBeUndefined()
    })

    it('should return value for existing key', () => {
      map.set(1, 'one')
      expect(map.get(1)).toBe('one')
    })

    it('should return updated value', () => {
      map.set(1, 'one')
      map.set(1, 'ONE')
      expect(map.get(1)).toBe('ONE')
    })

    it('should return values for all inserted keys', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      expect(map.get(1)).toBe('a')
      expect(map.get(2)).toBe('b')
      expect(map.get(3)).toBe('c')
    })

    it('should return undefined after deletion', () => {
      map.set(1, 'one')
      map.delete(1)
      expect(map.get(1)).toBeUndefined()
    })
  })

  describe('has', () => {
    it('should return false for empty map', () => {
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

    it('should return false after deletion', () => {
      map.set(1, 'one')
      map.delete(1)
      expect(map.has(1)).toBe(false)
    })

    it('should return true for keys at boundary', () => {
      map.set(1, 'a')
      map.set(100, 'b')
      expect(map.has(1)).toBe(true)
      expect(map.has(100)).toBe(true)
    })
  })

  describe('delete', () => {
    it('should return false for empty map', () => {
      expect(map.delete(1)).toBe(false)
    })

    it('should return false for missing key', () => {
      map.set(1, 'one')
      expect(map.delete(2)).toBe(false)
    })

    it('should return true and remove key', () => {
      map.set(1, 'one')
      expect(map.delete(1)).toBe(true)
      expect(map.size()).toBe(0)
      expect(map.get(1)).toBeUndefined()
    })

    it('should delete leaf node (no children)', () => {
      map.set(2, 'two')
      map.set(1, 'one')
      map.set(3, 'three')
      expect(map.delete(1)).toBe(true)
      expect(map.keys()).toEqual([2, 3])
    })

    it('should delete node with one child (left)', () => {
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(2, 'two')
      map.delete(3)
      expect(map.keys()).toEqual([1, 2])
    })

    it('should delete node with one child (right)', () => {
      map.set(1, 'one')
      map.set(3, 'three')
      map.set(2, 'two')
      map.delete(1)
      expect(map.keys()).toEqual([2, 3])
    })

    it('should delete node with two children', () => {
      map.set(2, 'two')
      map.set(1, 'one')
      map.set(3, 'three')
      expect(map.delete(2)).toBe(true)
      expect(map.keys()).toEqual([1, 3])
    })

    it('should delete root node', () => {
      map.set(1, 'one')
      expect(map.delete(1)).toBe(true)
      expect(map.isEmpty()).toBe(true)
    })

    it('should maintain order after multiple deletions', () => {
      map.set(5, 'five')
      map.set(3, 'three')
      map.set(7, 'seven')
      map.set(1, 'one')
      map.set(4, 'four')
      map.set(6, 'six')
      map.set(8, 'eight')
      map.delete(3)
      map.delete(7)
      expect(map.keys()).toEqual([1, 4, 5, 6, 8])
    })

    it('should handle deleting all elements', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.delete(1)
      map.delete(2)
      map.delete(3)
      expect(map.isEmpty()).toBe(true)
      expect(map.size()).toBe(0)
    })

    it('should not affect other entries when deleting', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.delete(2)
      expect(map.get(1)).toBe('a')
      expect(map.get(3)).toBe('c')
    })
  })

  describe('min', () => {
    it('should return undefined for empty map', () => {
      expect(map.min()).toBeUndefined()
    })

    it('should return the only entry', () => {
      map.set(5, 'five')
      expect(map.min()).toEqual([5, 'five'])
    })

    it('should return smallest key', () => {
      map.set(5, 'five')
      map.set(3, 'three')
      map.set(8, 'eight')
      expect(map.min()).toEqual([3, 'three'])
    })

    it('should update after deletion of min', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.delete(1)
      expect(map.min()).toEqual([2, 'b'])
    })

    it('should work with negative keys', () => {
      map.set(-10, 'neg')
      map.set(0, 'zero')
      map.set(10, 'pos')
      expect(map.min()).toEqual([-10, 'neg'])
    })
  })

  describe('max', () => {
    it('should return undefined for empty map', () => {
      expect(map.max()).toBeUndefined()
    })

    it('should return the only entry', () => {
      map.set(5, 'five')
      expect(map.max()).toEqual([5, 'five'])
    })

    it('should return largest key', () => {
      map.set(5, 'five')
      map.set(3, 'three')
      map.set(8, 'eight')
      expect(map.max()).toEqual([8, 'eight'])
    })

    it('should update after deletion of max', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.delete(3)
      expect(map.max()).toEqual([2, 'b'])
    })

    it('should work with negative keys', () => {
      map.set(-10, 'neg')
      map.set(0, 'zero')
      map.set(10, 'pos')
      expect(map.max()).toEqual([10, 'pos'])
    })
  })

  describe('size', () => {
    it('should return 0 for empty map', () => {
      expect(map.size()).toBe(0)
    })

    it('should return 1 after single insert', () => {
      map.set(1, 'a')
      expect(map.size()).toBe(1)
    })

    it('should not increment on duplicate key', () => {
      map.set(1, 'a')
      map.set(1, 'b')
      expect(map.size()).toBe(1)
    })

    it('should decrement on delete', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.delete(1)
      expect(map.size()).toBe(1)
    })

    it('should not change on failed delete', () => {
      map.set(1, 'a')
      map.delete(2)
      expect(map.size()).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new map', () => {
      expect(map.isEmpty()).toBe(true)
    })

    it('should return false after insert', () => {
      map.set(1, 'a')
      expect(map.isEmpty()).toBe(false)
    })

    it('should return true after clearing all', () => {
      map.set(1, 'a')
      map.delete(1)
      expect(map.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear empty map without error', () => {
      map.clear()
      expect(map.isEmpty()).toBe(true)
    })

    it('should clear populated map', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.clear()
      expect(map.size()).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('should return void', () => {
      expect(map.clear()).toBeUndefined()
    })

    it('should allow reuse after clear', () => {
      map.set(1, 'a')
      map.clear()
      map.set(2, 'b')
      expect(map.size()).toBe(1)
      expect(map.get(2)).toBe('b')
    })
  })

  describe('keys', () => {
    it('should return empty array for empty map', () => {
      expect(map.keys()).toEqual([])
    })

    it('should return sorted keys', () => {
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.keys()).toEqual([1, 2, 3])
    })

    it('should reflect insertions and deletions', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.delete(2)
      expect(map.keys()).toEqual([1, 3])
    })
  })

  describe('values', () => {
    it('should return empty array for empty map', () => {
      expect(map.values()).toEqual([])
    })

    it('should return values in key order', () => {
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.values()).toEqual(['a', 'b', 'c'])
    })

    it('should reflect deletions', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.delete(2)
      expect(map.values()).toEqual(['a', 'c'])
    })
  })

  describe('entries', () => {
    it('should return empty array for empty map', () => {
      expect(map.entries()).toEqual([])
    })

    it('should return sorted key-value pairs', () => {
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.entries()).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
    })

    it('should reflect updates', () => {
      map.set(1, 'a')
      map.set(1, 'updated')
      expect(map.entries()).toEqual([[1, 'updated']])
    })
  })

  describe('rangeSearch', () => {
    beforeEach(() => {
      map.set(1, 'a')
      map.set(3, 'c')
      map.set(5, 'e')
      map.set(7, 'g')
      map.set(9, 'i')
    })

    it('should return entries within range', () => {
      expect(map.rangeSearch(3, 7)).toEqual([[3, 'c'], [5, 'e'], [7, 'g']])
    })

    it('should return single entry range', () => {
      expect(map.rangeSearch(5, 5)).toEqual([[5, 'e']])
    })

    it('should return empty for range with no matches', () => {
      expect(map.rangeSearch(4, 4)).toEqual([])
    })

    it('should return empty for inverted range', () => {
      expect(map.rangeSearch(7, 3)).toEqual([])
    })

    it('should return full range', () => {
      expect(map.rangeSearch(1, 9)).toEqual([[1, 'a'], [3, 'c'], [5, 'e'], [7, 'g'], [9, 'i']])
    })

    it('should handle range beyond data', () => {
      expect(map.rangeSearch(0, 100)).toEqual([[1, 'a'], [3, 'c'], [5, 'e'], [7, 'g'], [9, 'i']])
    })

    it('should handle range partially outside data (low)', () => {
      expect(map.rangeSearch(0, 3)).toEqual([[1, 'a'], [3, 'c']])
    })

    it('should handle range partially outside data (high)', () => {
      expect(map.rangeSearch(7, 100)).toEqual([[7, 'g'], [9, 'i']])
    })

    it('should return empty for empty map', () => {
      const emptyMap = new TreeMap<number, string>()
      expect(emptyMap.rangeSearch(1, 10)).toEqual([])
    })
  })

  describe('lowerBound', () => {
    beforeEach(() => {
      map.set(10, 'a')
      map.set(20, 'b')
      map.set(30, 'c')
      map.set(40, 'd')
      map.set(50, 'e')
    })

    it('should return exact match', () => {
      expect(map.lowerBound(30)).toEqual([30, 'c'])
    })

    it('should return next greater when no exact match', () => {
      expect(map.lowerBound(25)).toEqual([30, 'c'])
    })

    it('should return first entry for key below min', () => {
      expect(map.lowerBound(1)).toEqual([10, 'a'])
    })

    it('should return undefined for key above max', () => {
      expect(map.lowerBound(100)).toBeUndefined()
    })

    it('should return undefined for empty map', () => {
      const emptyMap = new TreeMap<number, string>()
      expect(emptyMap.lowerBound(1)).toBeUndefined()
    })

    it('should return first entry for key equal to min', () => {
      expect(map.lowerBound(10)).toEqual([10, 'a'])
    })
  })

  describe('upperBound', () => {
    beforeEach(() => {
      map.set(10, 'a')
      map.set(20, 'b')
      map.set(30, 'c')
      map.set(40, 'd')
      map.set(50, 'e')
    })

    it('should return next greater after exact match', () => {
      expect(map.upperBound(30)).toEqual([40, 'd'])
    })

    it('should return next greater for non-existing key', () => {
      expect(map.upperBound(25)).toEqual([30, 'c'])
    })

    it('should return first entry for key below min', () => {
      expect(map.upperBound(1)).toEqual([10, 'a'])
    })

    it('should return undefined for key equal to max', () => {
      expect(map.upperBound(50)).toBeUndefined()
    })

    it('should return undefined for key above max', () => {
      expect(map.upperBound(100)).toBeUndefined()
    })

    it('should return undefined for empty map', () => {
      const emptyMap = new TreeMap<number, string>()
      expect(emptyMap.upperBound(1)).toBeUndefined()
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty map', () => {
      const items: [number, string][] = []
      map.forEach((v, k) => items.push([k, v]))
      expect(items).toEqual([])
    })

    it('should iterate in order', () => {
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      const items: [number, string][] = []
      map.forEach((v, k) => items.push([k, v]))
      expect(items).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
    })

    it('should pass value and key correctly', () => {
      map.set(1, 'one')
      let receivedKey: number | undefined
      let receivedValue: string | undefined
      map.forEach((v, k) => {
        receivedKey = k
        receivedValue = v
      })
      expect(receivedKey).toBe(1)
      expect(receivedValue).toBe('one')
    })
  })

  describe('map', () => {
    it('should transform values', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      const mapped = map.map((v) => v.toUpperCase())
      expect(mapped.get(1)).toBe('A')
      expect(mapped.get(2)).toBe('B')
    })

    it('should preserve keys', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      const mapped = map.map((v) => v.length)
      expect(mapped.keys()).toEqual([1, 2])
    })

    it('should return empty map for empty input', () => {
      const mapped = map.map((v) => v)
      expect(mapped.isEmpty()).toBe(true)
    })

    it('should use key in transformation', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      const mapped = map.map((v, k) => `${k}:${v}`)
      expect(mapped.get(1)).toBe('1:a')
      expect(mapped.get(2)).toBe('2:b')
    })

    it('should not modify original map', () => {
      map.set(1, 'a')
      map.map((v) => v.toUpperCase())
      expect(map.get(1)).toBe('a')
    })
  })

  describe('filter', () => {
    it('should filter entries by value', () => {
      map.set(1, 'apple')
      map.set(2, 'banana')
      map.set(3, 'avocado')
      const filtered = map.filter((v) => v.startsWith('a'))
      expect(filtered.keys()).toEqual([1, 3])
    })

    it('should filter entries by key', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      const filtered = map.filter((_v, k) => k > 1)
      expect(filtered.keys()).toEqual([2, 3])
    })

    it('should return empty map when all filtered out', () => {
      map.set(1, 'a')
      const filtered = map.filter(() => false)
      expect(filtered.isEmpty()).toBe(true)
    })

    it('should return all entries when all pass', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      const filtered = map.filter(() => true)
      expect(filtered.size()).toBe(2)
    })

    it('should not modify original map', () => {
      map.set(1, 'a')
      map.filter(() => false)
      expect(map.size()).toBe(1)
    })

    it('should preserve compare function', () => {
      const reverse = new TreeMap<number, string>((a, b) => b - a)
      reverse.set(1, 'a')
      reverse.set(2, 'b')
      const filtered = reverse.filter(() => true)
      expect(filtered.keys()).toEqual([2, 1])
    })
  })

  describe('reduce', () => {
    it('should sum values', () => {
      const numMap = new TreeMap<number, number>()
      numMap.set(1, 10)
      numMap.set(2, 20)
      numMap.set(3, 30)
      expect(numMap.reduce((acc, v) => acc + v, 0)).toBe(60)
    })

    it('should return initial for empty map', () => {
      expect(map.reduce((acc, _v, _k) => acc, 42)).toBe(42)
    })

    it('should concatenate strings', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      expect(map.reduce((acc, v) => acc + v, '')).toBe('abc')
    })

    it('should pass key to callback', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      const keys: number[] = []
      map.reduce<number>((_, _v, k) => {
        keys.push(k)
        return 0
      }, 0)
      expect(keys).toEqual([1, 2])
    })
  })

  describe('clone', () => {
    it('should create independent copy', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      const cloned = map.clone()
      cloned.set(3, 'c')
      expect(map.size()).toBe(2)
      expect(cloned.size()).toBe(3)
    })

    it('should preserve all entries', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      const cloned = map.clone()
      expect(cloned.entries()).toEqual(map.entries())
    })

    it('should clone empty map', () => {
      const cloned = map.clone()
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should preserve compare function', () => {
      const reverse = new TreeMap<number, string>((a, b) => b - a)
      reverse.set(1, 'a')
      reverse.set(2, 'b')
      const cloned = reverse.clone()
      expect(cloned.keys()).toEqual([2, 1])
    })

    it('should not affect original on update', () => {
      map.set(1, 'a')
      const cloned = map.clone()
      cloned.set(1, 'updated')
      expect(map.get(1)).toBe('a')
      expect(cloned.get(1)).toBe('updated')
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty map', () => {
      expect(map.toArray()).toEqual([])
    })

    it('should return sorted entries', () => {
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.toArray()).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
    })

    it('should be same as entries', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.toArray()).toEqual(map.entries())
    })
  })

  describe('fromEntries', () => {
    it('should create map from entries', () => {
      const m = TreeMap.fromEntries([[1, 'a'], [2, 'b'], [3, 'c']])
      expect(m.size()).toBe(3)
      expect(m.get(2)).toBe('b')
    })

    it('should create empty map from empty entries', () => {
      const m = TreeMap.fromEntries([])
      expect(m.isEmpty()).toBe(true)
    })

    it('should accept custom compare', () => {
      const m = TreeMap.fromEntries([[1, 'a'], [2, 'b']], (a, b) => b - a)
      expect(m.keys()).toEqual([2, 1])
    })

    it('should handle duplicate keys keeping last', () => {
      const m = TreeMap.fromEntries([[1, 'a'], [1, 'b']])
      expect(m.size()).toBe(1)
      expect(m.get(1)).toBe('b')
    })
  })

  describe('update', () => {
    it('should update existing key', () => {
      map.set(1, 'a')
      map.update(1, (v) => v!.toUpperCase())
      expect(map.get(1)).toBe('A')
    })

    it('should insert with undefined for new key', () => {
      map.update(1, (v) => v === undefined ? 'new' : 'old')
      expect(map.get(1)).toBe('new')
    })

    it('should increment size for new key', () => {
      map.update(1, () => 'new')
      expect(map.size()).toBe(1)
    })

    it('should not increment size for existing key', () => {
      map.set(1, 'a')
      map.update(1, () => 'b')
      expect(map.size()).toBe(1)
    })

    it('should pass undefined to updater for missing key', () => {
      let received: string | undefined = 'sentinel'
      map.update(1, (v) => { received = v; return 'result' })
      expect(received).toBeUndefined()
    })
  })

  describe('Symbol.iterator', () => {
    it('should iterate over empty map', () => {
      const items = [...map]
      expect(items).toEqual([])
    })

    it('should iterate in sorted order', () => {
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      const items = [...map]
      expect(items).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
    })

    it('should work with for...of', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      const keys: number[] = []
      for (const [k] of map) {
        keys.push(k)
      }
      expect(keys).toEqual([1, 2])
    })

    it('should work with destructuring', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      const [[, v1], [, v2]] = map
      expect(v1).toBe('a')
      expect(v2).toBe('b')
    })
  })

  describe('AVL balancing', () => {
    it('should handle left-left rotation', () => {
      map.set(30, 'thirty')
      map.set(20, 'twenty')
      map.set(10, 'ten')
      expect(map.keys()).toEqual([10, 20, 30])
      expect(map.size()).toBe(3)
    })

    it('should handle right-right rotation', () => {
      map.set(10, 'ten')
      map.set(20, 'twenty')
      map.set(30, 'thirty')
      expect(map.keys()).toEqual([10, 20, 30])
      expect(map.size()).toBe(3)
    })

    it('should handle left-right rotation', () => {
      map.set(30, 'thirty')
      map.set(10, 'ten')
      map.set(20, 'twenty')
      expect(map.keys()).toEqual([10, 20, 30])
      expect(map.size()).toBe(3)
    })

    it('should handle right-left rotation', () => {
      map.set(10, 'ten')
      map.set(30, 'thirty')
      map.set(20, 'twenty')
      expect(map.keys()).toEqual([10, 20, 30])
      expect(map.size()).toBe(3)
    })

    it('should maintain balance after many operations', () => {
      for (let i = 1; i <= 50; i++) {
        map.set(i, `v${i}`)
      }
      expect(map.keys()).toEqual(Array.from({ length: 50 }, (_, i) => i + 1))
      for (let i = 1; i <= 25; i++) {
        map.delete(i)
      }
      expect(map.keys()).toEqual(Array.from({ length: 25 }, (_, i) => i + 26))
    })
  })

  describe('string keys', () => {
    it('should work with string keys and custom comparator', () => {
      const sm = new TreeMap<string, number>((a, b) => a.localeCompare(b))
      sm.set('banana', 2)
      sm.set('apple', 1)
      sm.set('cherry', 3)
      expect(sm.keys()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should support range search with strings', () => {
      const sm = new TreeMap<string, number>((a, b) => a.localeCompare(b))
      sm.set('apple', 1)
      sm.set('banana', 2)
      sm.set('cherry', 3)
      sm.set('date', 4)
      expect(sm.rangeSearch('banana', 'cherry')).toEqual([['banana', 2], ['cherry', 3]])
    })
  })

  describe('object values', () => {
    it('should store object values', () => {
      const om = new TreeMap<number, { name: string }>()
      om.set(1, { name: 'Alice' })
      om.set(2, { name: 'Bob' })
      expect(om.get(1)?.name).toBe('Alice')
      expect(om.get(2)?.name).toBe('Bob')
    })
  })

  describe('edge cases', () => {
    it('should handle large dataset', () => {
      for (let i = 0; i < 1000; i++) {
        map.set(i, `v${i}`)
      }
      expect(map.size()).toBe(1000)
      expect(map.min()).toEqual([0, 'v0'])
      expect(map.max()).toEqual([999, 'v999'])
    })

    it('should handle random insert order', () => {
      const items = [5, 2, 8, 1, 9, 3, 7, 4, 6, 0]
      for (const i of items) {
        map.set(i, `v${i}`)
      }
      expect(map.keys()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should handle reinsert after delete', () => {
      map.set(1, 'a')
      map.delete(1)
      map.set(1, 'b')
      expect(map.get(1)).toBe('b')
      expect(map.size()).toBe(1)
    })

    it('should handle update on deleted key', () => {
      map.set(1, 'a')
      map.delete(1)
      map.update(1, (v) => v === undefined ? 'restored' : 'updated')
      expect(map.get(1)).toBe('restored')
    })

    it('should handle mixed operations', () => {
      map.set(5, 'five')
      map.set(3, 'three')
      map.set(7, 'seven')
      map.delete(5)
      map.set(2, 'two')
      map.set(6, 'six')
      map.update(3, (v) => v!.toUpperCase())
      map.delete(7)
      expect(map.keys()).toEqual([2, 3, 6])
      expect(map.get(3)).toBe('THREE')
    })
  })
})
