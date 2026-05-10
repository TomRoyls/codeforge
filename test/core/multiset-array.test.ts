import { describe, it, expect, beforeEach } from 'vitest'
import { MultisetArray } from '../../src/core/multiset-array/multiset-array.js'
import type { MultisetArrayOptions } from '../../src/core/multiset-array/types.js'
import { DEFAULT_MULTISET_ARRAY_OPTIONS } from '../../src/core/multiset-array/types.js'

describe('MultisetArray', () => {
  let ms: MultisetArray<string>

  beforeEach(() => {
    ms = new MultisetArray()
  })

  describe('constructor', () => {
    it('should create empty multiset with no args', () => {
      const m = new MultisetArray()
      expect(m.isEmpty()).toBe(true)
      expect(m.size).toBe(0)
      expect(m.uniqueSize).toBe(0)
    })

    it('should accept iterable of initial elements', () => {
      const m = new MultisetArray<string>(['a', 'b', 'a', 'c'])
      expect(m.size).toBe(4)
      expect(m.count('a')).toBe(2)
      expect(m.count('b')).toBe(1)
      expect(m.count('c')).toBe(1)
    })

    it('should accept options with initialElements', () => {
      const m = new MultisetArray<string>({ initialElements: ['x', 'y', 'x'] })
      expect(m.size).toBe(3)
      expect(m.count('x')).toBe(2)
      expect(m.count('y')).toBe(1)
    })

    it('should accept empty iterable', () => {
      const m = new MultisetArray<string>([])
      expect(m.isEmpty()).toBe(true)
    })

    it('should accept empty options', () => {
      const m = new MultisetArray<string>({})
      expect(m.isEmpty()).toBe(true)
    })

    it('should handle single element iterable', () => {
      const m = new MultisetArray<string>(['only'])
      expect(m.size).toBe(1)
      expect(m.count('only')).toBe(1)
    })

    it('should handle duplicate elements in initial iterable', () => {
      const m = new MultisetArray<number>([1, 1, 1, 1, 1])
      expect(m.size).toBe(5)
      expect(m.count(1)).toBe(5)
      expect(m.uniqueSize).toBe(1)
    })

    it('should handle number elements', () => {
      const m = new MultisetArray<number>([1, 2, 3, 2, 1])
      expect(m.count(1)).toBe(2)
      expect(m.count(2)).toBe(2)
      expect(m.count(3)).toBe(1)
    })

    it('should handle object elements by reference', () => {
      const obj = { id: 1 }
      const m = new MultisetArray<object>([obj, obj])
      expect(m.count(obj)).toBe(2)
    })
  })

  describe('add', () => {
    it('should add a single element', () => {
      ms.add('hello')
      expect(ms.count('hello')).toBe(1)
      expect(ms.size).toBe(1)
    })

    it('should add multiple different elements', () => {
      ms.add('a')
      ms.add('b')
      ms.add('c')
      expect(ms.size).toBe(3)
      expect(ms.uniqueSize).toBe(3)
    })

    it('should add duplicate elements', () => {
      ms.add('x')
      ms.add('x')
      ms.add('x')
      expect(ms.count('x')).toBe(3)
      expect(ms.size).toBe(3)
      expect(ms.uniqueSize).toBe(1)
    })

    it('should maintain insertion order in elements array', () => {
      ms.add('a')
      ms.add('b')
      ms.add('a')
      ms.add('c')
      expect(ms.toArray()).toEqual(['a', 'b', 'a', 'c'])
    })

    it('should handle adding after removal', () => {
      ms.add('x')
      ms.add('x')
      ms.remove('x')
      ms.add('x')
      expect(ms.count('x')).toBe(2)
      expect(ms.size).toBe(2)
    })

    it('should handle adding numbers', () => {
      const numMs = new MultisetArray<number>()
      numMs.add(42)
      numMs.add(42)
      numMs.add(7)
      expect(numMs.count(42)).toBe(2)
      expect(numMs.count(7)).toBe(1)
    })

    it('should handle adding undefined and null', () => {
      const m = new MultisetArray<unknown>()
      m.add(null)
      m.add(undefined)
      m.add(null)
      expect(m.count(null)).toBe(2)
      expect(m.count(undefined)).toBe(1)
    })

    it('should handle adding boolean values', () => {
      const m = new MultisetArray<boolean>()
      m.add(true)
      m.add(false)
      m.add(true)
      expect(m.count(true)).toBe(2)
      expect(m.count(false)).toBe(1)
    })
  })

  describe('addMany', () => {
    it('should add multiple copies of an element', () => {
      ms.addMany('x', 5)
      expect(ms.count('x')).toBe(5)
      expect(ms.size).toBe(5)
    })

    it('should add to existing count', () => {
      ms.add('a')
      ms.addMany('a', 3)
      expect(ms.count('a')).toBe(4)
      expect(ms.size).toBe(4)
    })

    it('should handle count of 1', () => {
      ms.addMany('z', 1)
      expect(ms.count('z')).toBe(1)
      expect(ms.size).toBe(1)
    })

    it('should do nothing with count of 0', () => {
      ms.addMany('z', 0)
      expect(ms.count('z')).toBe(0)
      expect(ms.size).toBe(0)
    })

    it('should do nothing with negative count', () => {
      ms.addMany('z', -5)
      expect(ms.count('z')).toBe(0)
      expect(ms.size).toBe(0)
    })

    it('should add elements to the array', () => {
      ms.addMany('p', 3)
      const arr = ms.toArray()
      expect(arr).toEqual(['p', 'p', 'p'])
    })

    it('should handle large count', () => {
      ms.addMany('big', 1000)
      expect(ms.count('big')).toBe(1000)
      expect(ms.size).toBe(1000)
    })

    it('should add many of different items', () => {
      ms.addMany('a', 2)
      ms.addMany('b', 3)
      expect(ms.count('a')).toBe(2)
      expect(ms.count('b')).toBe(3)
      expect(ms.uniqueSize).toBe(2)
      expect(ms.size).toBe(5)
    })
  })

  describe('remove', () => {
    it('should remove one occurrence', () => {
      ms.add('x')
      ms.add('x')
      ms.add('x')
      const result = ms.remove('x')
      expect(result).toBe(true)
      expect(ms.count('x')).toBe(2)
      expect(ms.size).toBe(2)
    })

    it('should return false for missing element', () => {
      const result = ms.remove('missing')
      expect(result).toBe(false)
    })

    it('should remove last occurrence and delete from counts', () => {
      ms.add('y')
      const result = ms.remove('y')
      expect(result).toBe(true)
      expect(ms.count('y')).toBe(0)
      expect(ms.has('y')).toBe(false)
      expect(ms.uniqueSize).toBe(0)
    })

    it('should remove from empty multiset', () => {
      const result = ms.remove('nothing')
      expect(result).toBe(false)
      expect(ms.size).toBe(0)
    })

    it('should maintain correct counts after multiple removes', () => {
      ms.addMany('a', 5)
      ms.remove('a')
      ms.remove('a')
      ms.remove('a')
      expect(ms.count('a')).toBe(2)
      expect(ms.size).toBe(2)
    })

    it('should remove all occurrences one by one', () => {
      ms.add('z')
      ms.add('z')
      expect(ms.remove('z')).toBe(true)
      expect(ms.remove('z')).toBe(true)
      expect(ms.remove('z')).toBe(false)
      expect(ms.count('z')).toBe(0)
      expect(ms.has('z')).toBe(false)
    })

    it('should not affect other elements when removing', () => {
      ms.add('a')
      ms.add('b')
      ms.add('a')
      ms.remove('a')
      expect(ms.count('a')).toBe(1)
      expect(ms.count('b')).toBe(1)
    })
  })

  describe('removeAll', () => {
    it('should remove all occurrences and return count', () => {
      ms.addMany('x', 5)
      const removed = ms.removeAll('x')
      expect(removed).toBe(5)
      expect(ms.count('x')).toBe(0)
      expect(ms.has('x')).toBe(false)
      expect(ms.size).toBe(0)
    })

    it('should return 0 for missing element', () => {
      const removed = ms.removeAll('missing')
      expect(removed).toBe(0)
    })

    it('should remove from empty multiset', () => {
      const removed = ms.removeAll('anything')
      expect(removed).toBe(0)
    })

    it('should not affect other elements', () => {
      ms.addMany('a', 3)
      ms.addMany('b', 2)
      ms.removeAll('a')
      expect(ms.count('a')).toBe(0)
      expect(ms.count('b')).toBe(2)
      expect(ms.size).toBe(2)
    })

    it('should remove single occurrence', () => {
      ms.add('solo')
      const removed = ms.removeAll('solo')
      expect(removed).toBe(1)
      expect(ms.has('solo')).toBe(false)
    })

    it('should clear from internal array completely', () => {
      ms.add('a')
      ms.add('b')
      ms.add('a')
      ms.add('c')
      ms.removeAll('a')
      expect(ms.toArray()).toEqual(['b', 'c'])
    })

    it('should handle removeAll then re-add', () => {
      ms.addMany('x', 3)
      ms.removeAll('x')
      ms.add('x')
      expect(ms.count('x')).toBe(1)
      expect(ms.size).toBe(1)
    })
  })

  describe('size and uniqueSize', () => {
    it('should return 0 for empty multiset', () => {
      expect(ms.size).toBe(0)
      expect(ms.uniqueSize).toBe(0)
    })

    it('should track total size correctly', () => {
      ms.add('a')
      ms.add('b')
      ms.add('a')
      expect(ms.size).toBe(3)
    })

    it('should track unique size correctly', () => {
      ms.add('a')
      ms.add('b')
      ms.add('a')
      expect(ms.uniqueSize).toBe(2)
    })

    it('should update after removal', () => {
      ms.addMany('x', 3)
      ms.remove('x')
      expect(ms.size).toBe(2)
      expect(ms.uniqueSize).toBe(1)
    })

    it('should update after removeAll', () => {
      ms.addMany('x', 3)
      ms.add('y')
      ms.removeAll('x')
      expect(ms.size).toBe(1)
      expect(ms.uniqueSize).toBe(1)
    })

    it('should update after clear', () => {
      ms.addMany('a', 10)
      ms.clear()
      expect(ms.size).toBe(0)
      expect(ms.uniqueSize).toBe(0)
    })
  })

  describe('count', () => {
    it('should return 0 for missing element', () => {
      expect(ms.count('missing')).toBe(0)
    })

    it('should return correct count for present element', () => {
      ms.addMany('x', 7)
      expect(ms.count('x')).toBe(7)
    })

    it('should update after add', () => {
      ms.add('a')
      expect(ms.count('a')).toBe(1)
      ms.add('a')
      expect(ms.count('a')).toBe(2)
    })

    it('should update after remove', () => {
      ms.addMany('a', 3)
      ms.remove('a')
      expect(ms.count('a')).toBe(2)
    })

    it('should return 0 after removeAll', () => {
      ms.addMany('a', 5)
      ms.removeAll('a')
      expect(ms.count('a')).toBe(0)
    })

    it('should return 0 after removing all individually', () => {
      ms.add('a')
      ms.add('a')
      ms.remove('a')
      ms.remove('a')
      expect(ms.count('a')).toBe(0)
    })
  })

  describe('has', () => {
    it('should return false for missing element', () => {
      expect(ms.has('missing')).toBe(false)
    })

    it('should return true for present element', () => {
      ms.add('present')
      expect(ms.has('present')).toBe(true)
    })

    it('should return false after all removed', () => {
      ms.add('temp')
      ms.remove('temp')
      expect(ms.has('temp')).toBe(false)
    })

    it('should return true when count is greater than 0', () => {
      ms.addMany('x', 5)
      expect(ms.has('x')).toBe(true)
    })

    it('should return false for element never added', () => {
      ms.add('a')
      expect(ms.has('b')).toBe(false)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty multiset', () => {
      expect(ms.toArray()).toEqual([])
    })

    it('should return elements in insertion order', () => {
      ms.add('a')
      ms.add('b')
      ms.add('a')
      expect(ms.toArray()).toEqual(['a', 'b', 'a'])
    })

    it('should return a copy', () => {
      ms.add('x')
      const arr = ms.toArray()
      arr.push('y')
      expect(ms.count('y')).toBe(0)
    })

    it('should reflect removals', () => {
      ms.add('a')
      ms.add('b')
      ms.add('a')
      ms.removeAll('a')
      expect(ms.toArray()).toEqual(['b'])
    })

    it('should handle many elements', () => {
      ms.addMany('x', 100)
      const arr = ms.toArray()
      expect(arr.length).toBe(100)
      expect(arr.every((e) => e === 'x')).toBe(true)
    })
  })

  describe('toArrayUnique', () => {
    it('should return empty array for empty multiset', () => {
      expect(ms.toArrayUnique()).toEqual([])
    })

    it('should return only unique elements', () => {
      ms.add('a')
      ms.add('b')
      ms.add('a')
      ms.add('c')
      const unique = ms.toArrayUnique()
      expect(unique.sort()).toEqual(['a', 'b', 'c'])
    })

    it('should return a copy', () => {
      ms.add('x')
      const arr = ms.toArrayUnique()
      arr.push('y')
      expect(ms.uniqueSize).toBe(1)
    })

    it('should update after removal', () => {
      ms.add('a')
      ms.add('b')
      ms.removeAll('a')
      expect(ms.toArrayUnique()).toEqual(['b'])
    })
  })

  describe('forEach', () => {
    it('should iterate over unique elements with counts', () => {
      ms.add('a')
      ms.add('a')
      ms.add('b')
      const result: Array<[string, number]> = []
      ms.forEach((item, count) => {
        result.push([item, count])
      })
      expect(result.sort((a, b) => a[0].localeCompare(b[0]))).toEqual([
        ['a', 2],
        ['b', 1],
      ])
    })

    it('should not iterate on empty multiset', () => {
      let called = false
      ms.forEach(() => {
        called = true
      })
      expect(called).toBe(false)
    })

    it('should provide correct counts', () => {
      ms.addMany('x', 5)
      ms.addMany('y', 3)
      const result: Record<string, number> = {}
      ms.forEach((item, count) => {
        result[item] = count
      })
      expect(result).toEqual({ x: 5, y: 3 })
    })

    it('should iterate single element', () => {
      ms.add('only')
      const result: Array<[string, number]> = []
      ms.forEach((item, count) => {
        result.push([item, count])
      })
      expect(result).toEqual([['only', 1]])
    })
  })

  describe('entries', () => {
    it('should return empty array for empty multiset', () => {
      expect(ms.entries()).toEqual([])
    })

    it('should return entries with correct counts', () => {
      ms.add('a')
      ms.add('a')
      ms.add('b')
      const entries = ms.entries()
      expect(entries.length).toBe(2)
      const sorted = entries.sort((a, b) => a[0].localeCompare(b[0]))
      expect(sorted).toEqual([
        ['a', 2],
        ['b', 1],
      ])
    })

    it('should return entries for single element', () => {
      ms.add('x')
      expect(ms.entries()).toEqual([['x', 1]])
    })
  })

  describe('keys', () => {
    it('should return empty array for empty multiset', () => {
      expect(ms.keys()).toEqual([])
    })

    it('should return all unique keys', () => {
      ms.add('a')
      ms.add('b')
      ms.add('a')
      const keys = ms.keys()
      expect(keys.sort()).toEqual(['a', 'b'])
    })

    it('should return keys after removal', () => {
      ms.add('a')
      ms.add('b')
      ms.removeAll('a')
      expect(ms.keys()).toEqual(['b'])
    })
  })

  describe('values', () => {
    it('should return empty array for empty multiset', () => {
      expect(ms.values()).toEqual([])
    })

    it('should return all counts', () => {
      ms.addMany('a', 3)
      ms.addMany('b', 7)
      const vals = ms.values().sort()
      expect(vals).toEqual([3, 7])
    })
  })

  describe('containsAll', () => {
    it('should return true for empty other', () => {
      ms.add('a')
      const other = new MultisetArray<string>()
      expect(ms.containsAll(other)).toBe(true)
    })

    it('should return true when all elements contained', () => {
      ms.addMany('a', 3)
      ms.addMany('b', 2)
      const other = new MultisetArray<string>()
      other.addMany('a', 2)
      other.add('b')
      expect(ms.containsAll(other)).toBe(true)
    })

    it('should return false when count insufficient', () => {
      ms.addMany('a', 2)
      const other = new MultisetArray<string>()
      other.addMany('a', 3)
      expect(ms.containsAll(other)).toBe(false)
    })

    it('should return false for missing element', () => {
      ms.add('a')
      const other = new MultisetArray<string>()
      other.add('b')
      expect(ms.containsAll(other)).toBe(false)
    })

    it('should return true for equal multisets', () => {
      ms.addMany('x', 3)
      const other = new MultisetArray<string>()
      other.addMany('x', 3)
      expect(ms.containsAll(other)).toBe(true)
    })

    it('should work with number type', () => {
      const numMs = new MultisetArray<number>([1, 1, 2, 3])
      const other = new MultisetArray<number>([1, 2])
      expect(numMs.containsAll(other)).toBe(true)
    })

    it('should return false when partially missing', () => {
      ms.addMany('a', 5)
      ms.add('b')
      const other = new MultisetArray<string>()
      other.addMany('a', 3)
      other.add('c')
      expect(ms.containsAll(other)).toBe(false)
    })
  })

  describe('union', () => {
    it('should return empty for two empty multisets', () => {
      const other = new MultisetArray<string>()
      const result = ms.union(other)
      expect(result.isEmpty()).toBe(true)
    })

    it('should return copy when other is empty', () => {
      ms.addMany('a', 3)
      const other = new MultisetArray<string>()
      const result = ms.union(other)
      expect(result.count('a')).toBe(3)
    })

    it('should return copy when this is empty', () => {
      const other = new MultisetArray<string>()
      other.addMany('b', 2)
      const result = ms.union(other)
      expect(result.count('b')).toBe(2)
    })

    it('should take max count for common elements', () => {
      ms.addMany('a', 3)
      ms.add('b')
      const other = new MultisetArray<string>()
      other.addMany('a', 5)
      other.add('c')
      const result = ms.union(other)
      expect(result.count('a')).toBe(5)
      expect(result.count('b')).toBe(1)
      expect(result.count('c')).toBe(1)
    })

    it('should not modify original multisets', () => {
      ms.addMany('x', 2)
      const other = new MultisetArray<string>()
      other.addMany('x', 5)
      ms.union(other)
      expect(ms.count('x')).toBe(2)
      expect(other.count('x')).toBe(5)
    })

    it('should handle disjoint multisets', () => {
      ms.add('a')
      const other = new MultisetArray<string>()
      other.add('b')
      const result = ms.union(other)
      expect(result.count('a')).toBe(1)
      expect(result.count('b')).toBe(1)
      expect(result.uniqueSize).toBe(2)
    })
  })

  describe('intersect', () => {
    it('should return empty for two empty multisets', () => {
      const other = new MultisetArray<string>()
      const result = ms.intersect(other)
      expect(result.isEmpty()).toBe(true)
    })

    it('should return empty when this is empty', () => {
      const other = new MultisetArray<string>()
      other.add('a')
      const result = ms.intersect(other)
      expect(result.isEmpty()).toBe(true)
    })

    it('should return empty when other is empty', () => {
      ms.add('a')
      const other = new MultisetArray<string>()
      const result = ms.intersect(other)
      expect(result.isEmpty()).toBe(true)
    })

    it('should take min count for common elements', () => {
      ms.addMany('a', 3)
      ms.addMany('b', 5)
      const other = new MultisetArray<string>()
      other.addMany('a', 7)
      other.addMany('b', 2)
      const result = ms.intersect(other)
      expect(result.count('a')).toBe(3)
      expect(result.count('b')).toBe(2)
    })

    it('should exclude elements not in both', () => {
      ms.add('a')
      ms.add('c')
      const other = new MultisetArray<string>()
      other.add('a')
      other.add('b')
      const result = ms.intersect(other)
      expect(result.count('a')).toBe(1)
      expect(result.count('c')).toBe(0)
      expect(result.count('b')).toBe(0)
    })

    it('should not modify original multisets', () => {
      ms.addMany('x', 3)
      const other = new MultisetArray<string>()
      other.addMany('x', 1)
      ms.intersect(other)
      expect(ms.count('x')).toBe(3)
      expect(other.count('x')).toBe(1)
    })

    it('should return empty for disjoint multisets', () => {
      ms.add('a')
      const other = new MultisetArray<string>()
      other.add('b')
      const result = ms.intersect(other)
      expect(result.isEmpty()).toBe(true)
    })
  })

  describe('isSubsetOf', () => {
    it('should return true for empty multiset', () => {
      const other = new MultisetArray<string>()
      other.add('a')
      expect(ms.isSubsetOf(other)).toBe(true)
    })

    it('should return true when all elements are contained', () => {
      ms.addMany('a', 2)
      ms.add('b')
      const other = new MultisetArray<string>()
      other.addMany('a', 5)
      other.addMany('b', 3)
      expect(ms.isSubsetOf(other)).toBe(true)
    })

    it('should return false when count insufficient', () => {
      ms.addMany('a', 5)
      const other = new MultisetArray<string>()
      other.addMany('a', 3)
      expect(ms.isSubsetOf(other)).toBe(false)
    })

    it('should return false for missing element', () => {
      ms.add('a')
      ms.add('b')
      const other = new MultisetArray<string>()
      other.add('a')
      expect(ms.isSubsetOf(other)).toBe(false)
    })

    it('should return true for equal multisets', () => {
      ms.addMany('x', 3)
      const other = new MultisetArray<string>()
      other.addMany('x', 3)
      expect(ms.isSubsetOf(other)).toBe(true)
    })

    it('should return true when both empty', () => {
      const other = new MultisetArray<string>()
      expect(ms.isSubsetOf(other)).toBe(true)
    })
  })

  describe('equals', () => {
    it('should return true for two empty multisets', () => {
      const other = new MultisetArray<string>()
      expect(ms.equals(other)).toBe(true)
    })

    it('should return true for identical multisets', () => {
      ms.add('a')
      ms.add('b')
      ms.add('a')
      const other = new MultisetArray<string>()
      other.add('a')
      other.add('b')
      other.add('a')
      expect(ms.equals(other)).toBe(true)
    })

    it('should return false for different counts', () => {
      ms.add('a')
      ms.add('a')
      const other = new MultisetArray<string>()
      other.add('a')
      expect(ms.equals(other)).toBe(false)
    })

    it('should return false for different unique sizes', () => {
      ms.add('a')
      ms.add('b')
      const other = new MultisetArray<string>()
      other.add('a')
      other.add('c')
      expect(ms.equals(other)).toBe(false)
    })

    it('should return false for missing element', () => {
      ms.add('a')
      ms.add('b')
      const other = new MultisetArray<string>()
      other.add('a')
      expect(ms.equals(other)).toBe(false)
    })

    it('should return true regardless of insertion order', () => {
      ms.add('a')
      ms.add('b')
      ms.add('a')
      const other = new MultisetArray<string>()
      other.add('b')
      other.add('a')
      other.add('a')
      expect(ms.equals(other)).toBe(true)
    })

    it('should return false when other has extra element', () => {
      ms.add('a')
      const other = new MultisetArray<string>()
      other.add('a')
      other.add('b')
      expect(ms.equals(other)).toBe(false)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new multiset', () => {
      expect(ms.isEmpty()).toBe(true)
    })

    it('should return false after add', () => {
      ms.add('x')
      expect(ms.isEmpty()).toBe(false)
    })

    it('should return true after removing all', () => {
      ms.add('x')
      ms.remove('x')
      expect(ms.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      ms.addMany('a', 10)
      ms.clear()
      expect(ms.isEmpty()).toBe(true)
    })

    it('should return true after removeAll', () => {
      ms.addMany('a', 5)
      ms.removeAll('a')
      expect(ms.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear empty multiset', () => {
      ms.clear()
      expect(ms.isEmpty()).toBe(true)
      expect(ms.size).toBe(0)
      expect(ms.uniqueSize).toBe(0)
    })

    it('should clear populated multiset', () => {
      ms.add('a')
      ms.add('b')
      ms.add('a')
      ms.clear()
      expect(ms.isEmpty()).toBe(true)
      expect(ms.count('a')).toBe(0)
      expect(ms.count('b')).toBe(0)
    })

    it('should allow adding after clear', () => {
      ms.add('a')
      ms.clear()
      ms.add('b')
      expect(ms.count('b')).toBe(1)
      expect(ms.count('a')).toBe(0)
      expect(ms.size).toBe(1)
    })

    it('should clear counts map', () => {
      ms.addMany('x', 100)
      ms.clear()
      expect(ms.keys()).toEqual([])
      expect(ms.values()).toEqual([])
      expect(ms.entries()).toEqual([])
    })
  })

  describe('many elements (10000+)', () => {
    it('should handle 10000 adds', () => {
      const m = new MultisetArray<number>()
      for (let i = 0; i < 10000; i++) {
        m.add(i % 100)
      }
      expect(m.size).toBe(10000)
      expect(m.uniqueSize).toBe(100)
      expect(m.count(0)).toBe(100)
      expect(m.count(99)).toBe(100)
    })

    it('should handle addMany with large count', () => {
      ms.addMany('x', 10000)
      expect(ms.size).toBe(10000)
      expect(ms.uniqueSize).toBe(1)
    })

    it('should handle removeAll on large dataset', () => {
      ms.addMany('a', 5000)
      ms.addMany('b', 5000)
      const removed = ms.removeAll('a')
      expect(removed).toBe(5000)
      expect(ms.size).toBe(5000)
      expect(ms.uniqueSize).toBe(1)
    })

    it('should handle containsAll on large dataset', () => {
      ms.addMany('x', 10000)
      const other = new MultisetArray<string>()
      other.addMany('x', 5000)
      expect(ms.containsAll(other)).toBe(true)
    })

    it('should handle union of large multisets', () => {
      ms.addMany('a', 5000)
      const other = new MultisetArray<string>()
      other.addMany('a', 7000)
      other.addMany('b', 3000)
      const result = ms.union(other)
      expect(result.count('a')).toBe(7000)
      expect(result.count('b')).toBe(3000)
    })

    it('should handle intersect of large multisets', () => {
      ms.addMany('a', 5000)
      ms.addMany('b', 3000)
      const other = new MultisetArray<string>()
      other.addMany('a', 7000)
      other.addMany('b', 1000)
      const result = ms.intersect(other)
      expect(result.count('a')).toBe(5000)
      expect(result.count('b')).toBe(1000)
    })

    it('should handle equals on large identical multisets', () => {
      ms.addMany('x', 10000)
      const other = new MultisetArray<string>()
      other.addMany('x', 10000)
      expect(ms.equals(other)).toBe(true)
    })

    it('should handle forEach on large dataset', () => {
      ms.addMany('a', 10000)
      ms.addMany('b', 5000)
      let sum = 0
      ms.forEach((_item, count) => {
        sum += count
      })
      expect(sum).toBe(15000)
    })
  })

  describe('empty multiset operations', () => {
    it('should return empty toArray', () => {
      expect(ms.toArray()).toEqual([])
    })

    it('should return empty toArrayUnique', () => {
      expect(ms.toArrayUnique()).toEqual([])
    })

    it('should return empty entries', () => {
      expect(ms.entries()).toEqual([])
    })

    it('should return empty keys', () => {
      expect(ms.keys()).toEqual([])
    })

    it('should return empty values', () => {
      expect(ms.values()).toEqual([])
    })

    it('should not iterate forEach', () => {
      let count = 0
      ms.forEach(() => {
        count++
      })
      expect(count).toBe(0)
    })

    it('should return false for has on any element', () => {
      expect(ms.has('anything')).toBe(false)
    })

    it('should return 0 for count on any element', () => {
      expect(ms.count('anything')).toBe(0)
    })

    it('should return false for remove', () => {
      expect(ms.remove('anything')).toBe(false)
    })

    it('should return 0 for removeAll', () => {
      expect(ms.removeAll('anything')).toBe(0)
    })

    it('should union with empty produce empty', () => {
      const other = new MultisetArray<string>()
      expect(ms.union(other).isEmpty()).toBe(true)
    })

    it('should intersect with empty produce empty', () => {
      const other = new MultisetArray<string>()
      expect(ms.intersect(other).isEmpty()).toBe(true)
    })

    it('should be subset of any multiset', () => {
      const other = new MultisetArray<string>()
      other.add('a')
      expect(ms.isSubsetOf(other)).toBe(true)
    })

    it('should equal another empty multiset', () => {
      const other = new MultisetArray<string>()
      expect(ms.equals(other)).toBe(true)
    })

    it('should not equal non-empty multiset', () => {
      const other = new MultisetArray<string>()
      other.add('a')
      expect(ms.equals(other)).toBe(false)
    })

    it('should contain empty multiset', () => {
      const other = new MultisetArray<string>()
      expect(ms.containsAll(other)).toBe(true)
    })
  })

  describe('single element', () => {
    it('should handle add single', () => {
      ms.add('only')
      expect(ms.size).toBe(1)
      expect(ms.uniqueSize).toBe(1)
      expect(ms.count('only')).toBe(1)
      expect(ms.has('only')).toBe(true)
    })

    it('should handle remove single', () => {
      ms.add('only')
      expect(ms.remove('only')).toBe(true)
      expect(ms.isEmpty()).toBe(true)
    })

    it('should handle removeAll single', () => {
      ms.add('only')
      expect(ms.removeAll('only')).toBe(1)
      expect(ms.isEmpty()).toBe(true)
    })

    it('should handle toArray with single', () => {
      ms.add('only')
      expect(ms.toArray()).toEqual(['only'])
    })

    it('should handle toArrayUnique with single', () => {
      ms.add('only')
      expect(ms.toArrayUnique()).toEqual(['only'])
    })

    it('should handle entries with single', () => {
      ms.add('only')
      expect(ms.entries()).toEqual([['only', 1]])
    })

    it('should handle forEach with single', () => {
      ms.add('only')
      const result: Array<[string, number]> = []
      ms.forEach((item, count) => result.push([item, count]))
      expect(result).toEqual([['only', 1]])
    })

    it('should handle equals with single', () => {
      ms.add('a')
      const other = new MultisetArray<string>()
      other.add('a')
      expect(ms.equals(other)).toBe(true)
    })

    it('should handle containsAll with single', () => {
      ms.add('a')
      const other = new MultisetArray<string>()
      other.add('a')
      expect(ms.containsAll(other)).toBe(true)
    })
  })

  describe('duplicate operations', () => {
    it('should handle multiple adds of same element', () => {
      for (let i = 0; i < 10; i++) {
        ms.add('x')
      }
      expect(ms.count('x')).toBe(10)
      expect(ms.size).toBe(10)
      expect(ms.uniqueSize).toBe(1)
    })

    it('should handle addMany then addMany again', () => {
      ms.addMany('x', 5)
      ms.addMany('x', 3)
      expect(ms.count('x')).toBe(8)
    })

    it('should handle add then addMany', () => {
      ms.add('x')
      ms.addMany('x', 4)
      expect(ms.count('x')).toBe(5)
    })

    it('should handle addMany then add', () => {
      ms.addMany('x', 4)
      ms.add('x')
      expect(ms.count('x')).toBe(5)
    })

    it('should handle repeated remove calls', () => {
      ms.addMany('x', 3)
      expect(ms.remove('x')).toBe(true)
      expect(ms.remove('x')).toBe(true)
      expect(ms.remove('x')).toBe(true)
      expect(ms.remove('x')).toBe(false)
      expect(ms.count('x')).toBe(0)
    })

    it('should handle removeAll then add again', () => {
      ms.addMany('x', 5)
      ms.removeAll('x')
      ms.add('x')
      expect(ms.count('x')).toBe(1)
      expect(ms.size).toBe(1)
    })

    it('should handle clear then add again', () => {
      ms.addMany('x', 5)
      ms.add('y')
      ms.clear()
      ms.add('z')
      expect(ms.count('x')).toBe(0)
      expect(ms.count('y')).toBe(0)
      expect(ms.count('z')).toBe(1)
      expect(ms.size).toBe(1)
    })

    it('should handle interleaved add and remove', () => {
      ms.add('x')
      ms.add('x')
      ms.remove('x')
      ms.add('x')
      ms.add('x')
      ms.remove('x')
      expect(ms.count('x')).toBe(2)
    })
  })

  describe('DEFAULT_MULTISET_ARRAY_OPTIONS', () => {
    it('should have empty initialElements', () => {
      expect(DEFAULT_MULTISET_ARRAY_OPTIONS.initialElements).toBeDefined()
    })
  })

  describe('type safety', () => {
    it('should work with number type', () => {
      const numMs = new MultisetArray<number>()
      numMs.add(1)
      numMs.add(2)
      numMs.add(1)
      expect(numMs.count(1)).toBe(2)
      expect(numMs.count(2)).toBe(1)
    })

    it('should work with object type', () => {
      const obj1 = { id: 1 }
      const obj2 = { id: 2 }
      const objMs = new MultisetArray<object>()
      objMs.add(obj1)
      objMs.add(obj2)
      objMs.add(obj1)
      expect(objMs.count(obj1)).toBe(2)
      expect(objMs.count(obj2)).toBe(1)
    })

    it('should work with boolean type', () => {
      const boolMs = new MultisetArray<boolean>()
      boolMs.add(true)
      boolMs.add(false)
      boolMs.add(true)
      expect(boolMs.count(true)).toBe(2)
      expect(boolMs.count(false)).toBe(1)
    })

    it('should work with null type', () => {
      const nullMs = new MultisetArray<null>()
      nullMs.add(null)
      nullMs.add(null)
      expect(nullMs.count(null)).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('should handle NaN elements', () => {
      const nanMs = new MultisetArray<number>()
      nanMs.add(NaN)
      nanMs.add(NaN)
      expect(nanMs.count(NaN)).toBe(2)
    })

    it('should handle empty string', () => {
      ms.add('')
      ms.add('')
      expect(ms.count('')).toBe(2)
    })

    it('should handle zero', () => {
      const numMs = new MultisetArray<number>()
      numMs.add(0)
      numMs.add(0)
      expect(numMs.count(0)).toBe(2)
    })

    it('should handle false values', () => {
      const boolMs = new MultisetArray<boolean>()
      boolMs.add(false)
      boolMs.add(false)
      expect(boolMs.count(false)).toBe(2)
    })

    it('should handle chaining operations', () => {
      ms.add('a')
      ms.add('b')
      ms.add('a')
      ms.remove('b')
      expect(ms.size).toBe(2)
      expect(ms.uniqueSize).toBe(1)
      expect(ms.count('a')).toBe(2)
    })
  })

  describe('union edge cases', () => {
    it('should handle union with self', () => {
      ms.addMany('a', 3)
      const result = ms.union(ms)
      expect(result.count('a')).toBe(3)
      expect(result.size).toBe(3)
    })

    it('should handle union preserving all unique keys', () => {
      ms.add('a')
      const other = new MultisetArray<string>()
      other.add('b')
      const result = ms.union(other)
      expect(result.uniqueSize).toBe(2)
    })
  })

  describe('intersect edge cases', () => {
    it('should handle intersect with self', () => {
      ms.addMany('a', 3)
      const result = ms.intersect(ms)
      expect(result.count('a')).toBe(3)
    })

    it('should handle intersect where all elements are common', () => {
      ms.addMany('a', 2)
      ms.addMany('b', 3)
      const other = new MultisetArray<string>()
      other.addMany('a', 5)
      other.addMany('b', 1)
      const result = ms.intersect(other)
      expect(result.count('a')).toBe(2)
      expect(result.count('b')).toBe(1)
    })
  })

  describe('isSubsetOf edge cases', () => {
    it('should handle isSubsetOf with self', () => {
      ms.add('a')
      expect(ms.isSubsetOf(ms)).toBe(true)
    })

    it('should handle isSubsetOf with larger multiset', () => {
      ms.add('a')
      const other = new MultisetArray<string>()
      other.add('a')
      other.add('b')
      expect(ms.isSubsetOf(other)).toBe(true)
    })
  })

  describe('containsAll edge cases', () => {
    it('should handle containsAll with self', () => {
      ms.add('a')
      expect(ms.containsAll(ms)).toBe(true)
    })

    it('should handle containsAll with empty other', () => {
      ms.add('a')
      expect(ms.containsAll(new MultisetArray<string>())).toBe(true)
    })
  })

  describe('equals edge cases', () => {
    it('should handle equals with self', () => {
      ms.add('a')
      ms.add('b')
      expect(ms.equals(ms)).toBe(true)
    })

    it('should return false for different element counts', () => {
      ms.add('a')
      ms.add('a')
      ms.add('b')
      const other = new MultisetArray<string>()
      other.add('a')
      other.add('b')
      other.add('b')
      expect(ms.equals(other)).toBe(false)
    })
  })

  describe('mixed operations', () => {
    it('should handle add remove add cycle', () => {
      ms.add('x')
      ms.remove('x')
      ms.add('x')
      expect(ms.count('x')).toBe(1)
    })

    it('should handle addMany removeAll addMany', () => {
      ms.addMany('a', 5)
      ms.removeAll('a')
      ms.addMany('a', 3)
      expect(ms.count('a')).toBe(3)
      expect(ms.size).toBe(3)
    })

    it('should handle complex sequence', () => {
      ms.add('a')
      ms.add('b')
      ms.add('c')
      ms.add('a')
      ms.remove('b')
      ms.addMany('c', 2)
      expect(ms.count('a')).toBe(2)
      expect(ms.count('b')).toBe(0)
      expect(ms.count('c')).toBe(3)
      expect(ms.size).toBe(5)
      expect(ms.uniqueSize).toBe(2)
    })

    it('should handle union and intersect together', () => {
      ms.addMany('a', 3)
      ms.add('b')
      const other = new MultisetArray<string>()
      other.addMany('a', 5)
      other.add('c')
      const u = ms.union(other)
      const i = ms.intersect(other)
      expect(u.count('a')).toBe(5)
      expect(u.count('b')).toBe(1)
      expect(u.count('c')).toBe(1)
      expect(i.count('a')).toBe(3)
      expect(i.count('b')).toBe(0)
      expect(i.count('c')).toBe(0)
    })
  })
})
