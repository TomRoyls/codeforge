import { describe, it, expect, beforeEach } from 'vitest'
import { SkipList } from '../../src/core/skip-list/skip-list.js'
import type { SkipNode } from '../../src/core/skip-list/types.js'

describe('SkipList', () => {
  let list: SkipList<string>

  beforeEach(() => {
    list = new SkipList<string>()
  })

  describe('constructor', () => {
    it('should create an empty skip list with defaults', () => {
      const sl = new SkipList<string>()
      expect(sl.size).toBe(0)
      expect(sl.isEmpty()).toBe(true)
    })

    it('should accept custom maxLevel', () => {
      const sl = new SkipList<string>(8)
      expect(sl.size).toBe(0)
    })

    it('should accept custom probability', () => {
      const sl = new SkipList<string>(16, 0.25)
      expect(sl.size).toBe(0)
    })

    it('should accept maxLevel and probability together', () => {
      const sl = new SkipList<string>(10, 0.3)
      expect(sl.isEmpty()).toBe(true)
    })

    it('should start with level 0', () => {
      expect(list.getLevel()).toBe(0)
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
      expect(list.get(1)).toBe('updated')
    })

    it('should insert in reverse order', () => {
      list.insert(3, 'three')
      list.insert(2, 'two')
      list.insert(1, 'one')
      expect(list.size).toBe(3)
      expect(list.keys()).toEqual([1, 2, 3])
    })

    it('should insert in random order', () => {
      list.insert(5, 'five')
      list.insert(1, 'one')
      list.insert(3, 'three')
      list.insert(2, 'two')
      list.insert(4, 'four')
      expect(list.keys()).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle negative keys', () => {
      list.insert(-1, 'neg')
      list.insert(0, 'zero')
      list.insert(1, 'pos')
      expect(list.keys()).toEqual([-1, 0, 1])
    })

    it('should handle duplicate key updates preserving size', () => {
      list.insert(1, 'a')
      list.insert(2, 'b')
      list.insert(1, 'c')
      expect(list.size).toBe(2)
      expect(list.get(1)).toBe('c')
    })

    it('should maintain sorted order after many inserts', () => {
      const keys = [10, 5, 15, 3, 7, 12, 20, 1, 8, 18]
      for (const k of keys) {
        list.insert(k, String(k))
      }
      expect(list.keys()).toEqual([1, 3, 5, 7, 8, 10, 12, 15, 18, 20])
    })
  })

  describe('get', () => {
    it('should return undefined for empty list', () => {
      expect(list.get(1)).toBeUndefined()
    })

    it('should return value for existing key', () => {
      list.insert(1, 'one')
      expect(list.get(1)).toBe('one')
    })

    it('should return undefined for non-existent key', () => {
      list.insert(1, 'one')
      expect(list.get(2)).toBeUndefined()
    })

    it('should return updated value after re-insert', () => {
      list.insert(1, 'old')
      list.insert(1, 'new')
      expect(list.get(1)).toBe('new')
    })

    it('should get from list with many elements', () => {
      for (let i = 0; i < 100; i++) {
        list.insert(i, `val-${i}`)
      }
      expect(list.get(50)).toBe('val-50')
      expect(list.get(0)).toBe('val-0')
      expect(list.get(99)).toBe('val-99')
    })

    it('should return undefined for key not in list', () => {
      list.insert(1, 'one')
      list.insert(3, 'three')
      expect(list.get(2)).toBeUndefined()
    })
  })

  describe('has', () => {
    it('should return false for empty list', () => {
      expect(list.has(1)).toBe(false)
    })

    it('should return true for existing key', () => {
      list.insert(1, 'one')
      expect(list.has(1)).toBe(true)
    })

    it('should return false for non-existent key', () => {
      list.insert(1, 'one')
      expect(list.has(2)).toBe(false)
    })

    it('should find keys across range', () => {
      list.insert(1, 'a')
      list.insert(5, 'b')
      list.insert(10, 'c')
      expect(list.has(1)).toBe(true)
      expect(list.has(5)).toBe(true)
      expect(list.has(10)).toBe(true)
      expect(list.has(3)).toBe(false)
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
      expect(list.get(1)).toBeUndefined()
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
      expect(list.keys()).toEqual([1, 3])
    })

    it('should delete first element', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.insert(3, 'three')
      expect(list.delete(1)).toBe(true)
      expect(list.keys()).toEqual([2, 3])
    })

    it('should delete last element', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.insert(3, 'three')
      expect(list.delete(3)).toBe(true)
      expect(list.keys()).toEqual([1, 2])
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
      expect(list.get(4)).toBe('4')
      expect(list.get(6)).toBe('6')
      expect(list.size).toBe(9)
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
      expect(list.get(1)).toBeUndefined()
    })

    it('should allow insertions after clear', () => {
      list.insert(1, 'a')
      list.clear()
      list.insert(2, 'b')
      expect(list.size).toBe(1)
      expect(list.get(2)).toBe('b')
    })

    it('should reset level after clear', () => {
      for (let i = 0; i < 100; i++) {
        list.insert(i, String(i))
      }
      list.clear()
      expect(list.getLevel()).toBe(0)
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

  describe('keys', () => {
    it('should return empty array for empty list', () => {
      expect(list.keys()).toEqual([])
    })

    it('should return all keys in sorted order', () => {
      list.insert(3, 'c')
      list.insert(1, 'a')
      list.insert(2, 'b')
      expect(list.keys()).toEqual([1, 2, 3])
    })

    it('should update after deletion', () => {
      list.insert(1, 'a')
      list.insert(2, 'b')
      list.insert(3, 'c')
      list.delete(2)
      expect(list.keys()).toEqual([1, 3])
    })
  })

  describe('values', () => {
    it('should return empty array for empty list', () => {
      expect(list.values()).toEqual([])
    })

    it('should return values in key order', () => {
      list.insert(3, 'c')
      list.insert(1, 'a')
      list.insert(2, 'b')
      expect(list.values()).toEqual(['a', 'b', 'c'])
    })

    it('should update after deletion', () => {
      list.insert(1, 'a')
      list.insert(2, 'b')
      list.insert(3, 'c')
      list.delete(2)
      expect(list.values()).toEqual(['a', 'c'])
    })
  })

  describe('entries', () => {
    it('should return empty array for empty list', () => {
      expect(list.entries()).toEqual([])
    })

    it('should return all entries sorted by key', () => {
      list.insert(3, 'c')
      list.insert(1, 'a')
      list.insert(2, 'b')
      expect(list.entries()).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
    })

    it('should reflect updates', () => {
      list.insert(1, 'old')
      list.insert(1, 'new')
      expect(list.entries()).toEqual([[1, 'new']])
    })

    it('should update after deletion', () => {
      list.insert(1, 'a')
      list.insert(2, 'b')
      list.insert(3, 'c')
      list.delete(2)
      expect(list.entries()).toEqual([[1, 'a'], [3, 'c']])
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
      expect(cloned.entries()).toEqual(list.entries())
    })

    it('should be independent from original', () => {
      list.insert(1, 'a')
      list.insert(2, 'b')
      const cloned = list.clone()
      cloned.insert(3, 'c')
      cloned.delete(1)
      expect(list.size).toBe(2)
      expect(list.keys()).toEqual([1, 2])
      expect(cloned.size).toBe(2)
      expect(cloned.keys()).toEqual([2, 3])
    })

    it('should preserve values', () => {
      list.insert(10, 'ten')
      const cloned = list.clone()
      expect(cloned.get(10)).toBe('ten')
    })
  })

  describe('Symbol.iterator', () => {
    it('should iterate empty list', () => {
      const result = [...list]
      expect(result).toEqual([])
    })

    it('should iterate in sorted order', () => {
      list.insert(3, 'c')
      list.insert(1, 'a')
      list.insert(2, 'b')
      const result = [...list]
      expect(result).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
    })

    it('should work with for...of', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      const keys: number[] = []
      for (const [key] of list) {
        keys.push(key)
      }
      expect(keys).toEqual([1, 2])
    })

    it('should work with destructuring', () => {
      list.insert(1, 'a')
      list.insert(2, 'b')
      const first = list[Symbol.iterator]().next()
      expect(first.value).toEqual([1, 'a'])
      expect(first.done).toBe(false)
    })
  })

  describe('lowerBound', () => {
    it('should return undefined for empty list', () => {
      expect(list.lowerBound(1)).toBeUndefined()
    })

    it('should return first element >= key when exact match exists', () => {
      list.insert(1, 'a')
      list.insert(3, 'c')
      list.insert(5, 'e')
      expect(list.lowerBound(3)).toEqual([3, 'c'])
    })

    it('should return next element when exact match does not exist', () => {
      list.insert(1, 'a')
      list.insert(3, 'c')
      list.insert(5, 'e')
      expect(list.lowerBound(2)).toEqual([3, 'c'])
    })

    it('should return first element when key is below range', () => {
      list.insert(5, 'e')
      list.insert(10, 'j')
      expect(list.lowerBound(1)).toEqual([5, 'e'])
    })

    it('should return undefined when key is above all elements', () => {
      list.insert(1, 'a')
      list.insert(3, 'c')
      expect(list.lowerBound(5)).toBeUndefined()
    })

    it('should return first element for lowerBound of min', () => {
      list.insert(1, 'a')
      list.insert(5, 'e')
      expect(list.lowerBound(1)).toEqual([1, 'a'])
    })
  })

  describe('upperBound', () => {
    it('should return undefined for empty list', () => {
      expect(list.upperBound(1)).toBeUndefined()
    })

    it('should return next element after exact match', () => {
      list.insert(1, 'a')
      list.insert(3, 'c')
      list.insert(5, 'e')
      expect(list.upperBound(3)).toEqual([5, 'e'])
    })

    it('should return next element when no exact match', () => {
      list.insert(1, 'a')
      list.insert(5, 'e')
      expect(list.upperBound(2)).toEqual([5, 'e'])
    })

    it('should return undefined when key >= max', () => {
      list.insert(1, 'a')
      list.insert(3, 'c')
      expect(list.upperBound(3)).toBeUndefined()
    })

    it('should return first element when key below range', () => {
      list.insert(5, 'e')
      list.insert(10, 'j')
      expect(list.upperBound(0)).toEqual([5, 'e'])
    })

    it('should work with single element list', () => {
      list.insert(5, 'e')
      expect(list.upperBound(4)).toEqual([5, 'e'])
      expect(list.upperBound(5)).toBeUndefined()
    })
  })

  describe('range', () => {
    it('should return empty for empty list', () => {
      expect(list.range(1, 5)).toEqual([])
    })

    it('should return elements in range', () => {
      list.insert(1, 'a')
      list.insert(2, 'b')
      list.insert(3, 'c')
      list.insert(4, 'd')
      list.insert(5, 'e')
      expect(list.range(2, 4)).toEqual([[2, 'b'], [3, 'c'], [4, 'd']])
    })

    it('should return single element when start equals end', () => {
      list.insert(1, 'a')
      list.insert(2, 'b')
      expect(list.range(2, 2)).toEqual([[2, 'b']])
    })

    it('should return empty when no elements in range', () => {
      list.insert(1, 'a')
      list.insert(5, 'e')
      expect(list.range(2, 4)).toEqual([])
    })

    it('should return all elements with full range', () => {
      list.insert(1, 'a')
      list.insert(2, 'b')
      list.insert(3, 'c')
      expect(list.range(1, 3)).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
    })

    it('should handle range beyond elements', () => {
      list.insert(1, 'a')
      list.insert(2, 'b')
      expect(list.range(0, 10)).toEqual([[1, 'a'], [2, 'b']])
    })

    it('should return empty when start > end', () => {
      list.insert(1, 'a')
      list.insert(3, 'c')
      expect(list.range(3, 1)).toEqual([])
    })

    it('should include boundary elements', () => {
      list.insert(1, 'a')
      list.insert(2, 'b')
      list.insert(3, 'c')
      const r = list.range(1, 2)
      expect(r).toEqual([[1, 'a'], [2, 'b']])
    })
  })

  describe('getLevel', () => {
    it('should return 0 for empty list', () => {
      expect(list.getLevel()).toBe(0)
    })

    it('should return >= 1 after insert', () => {
      list.insert(1, 'a')
      expect(list.getLevel()).toBeGreaterThanOrEqual(1)
    })

    it('should return 0 after clear', () => {
      for (let i = 0; i < 50; i++) {
        list.insert(i, String(i))
      }
      list.clear()
      expect(list.getLevel()).toBe(0)
    })

    it('should never exceed maxLevel', () => {
      const sl = new SkipList<string>(4)
      for (let i = 0; i < 1000; i++) {
        sl.insert(i, String(i))
      }
      expect(sl.getLevel()).toBeLessThanOrEqual(4)
    })
  })

  describe('static fromEntries', () => {
    it('should create list from entries', () => {
      const sl = SkipList.fromEntries([[1, 'a'], [2, 'b'], [3, 'c']])
      expect(sl.size).toBe(3)
      expect(sl.get(1)).toBe('a')
      expect(sl.get(2)).toBe('b')
      expect(sl.get(3)).toBe('c')
    })

    it('should create empty list from empty entries', () => {
      const sl = SkipList.fromEntries<string>([])
      expect(sl.size).toBe(0)
    })

    it('should accept maxLevel', () => {
      const sl = SkipList.fromEntries([[1, 'a']], 4)
      expect(sl.size).toBe(1)
    })

    it('should accept maxLevel and probability', () => {
      const sl = SkipList.fromEntries([[1, 'a'], [2, 'b']], 8, 0.25)
      expect(sl.size).toBe(2)
    })

    it('should handle entries with duplicate keys (last wins)', () => {
      const sl = SkipList.fromEntries([[1, 'a'], [1, 'b']])
      expect(sl.size).toBe(1)
      expect(sl.get(1)).toBe('b')
    })

    it('should produce sorted keys regardless of input order', () => {
      const sl = SkipList.fromEntries([[3, 'c'], [1, 'a'], [2, 'b']])
      expect(sl.keys()).toEqual([1, 2, 3])
    })
  })

  describe('generic types', () => {
    it('should work with number values', () => {
      const sl = new SkipList<number>()
      sl.insert(1, 100)
      sl.insert(2, 200)
      expect(sl.get(1)).toBe(100)
    })

    it('should work with object values', () => {
      const sl = new SkipList<{ name: string }>()
      sl.insert(1, { name: 'alice' })
      sl.insert(2, { name: 'bob' })
      expect(sl.get(1)!.name).toBe('alice')
      expect(sl.get(2)!.name).toBe('bob')
    })

    it('should work with null values', () => {
      const sl = new SkipList<string | null>()
      sl.insert(1, null)
      sl.insert(2, 'two')
      expect(sl.get(1)).toBeNull()
      expect(sl.get(2)).toBe('two')
    })

    it('should work with array values', () => {
      const sl = new SkipList<number[]>()
      sl.insert(1, [1, 2, 3])
      sl.insert(2, [4, 5, 6])
      expect(sl.get(1)).toEqual([1, 2, 3])
    })
  })

  describe('edge cases', () => {
    it('should handle single element operations', () => {
      list.insert(1, 'one')
      expect(list.size).toBe(1)
      expect(list.min()).toEqual([1, 'one'])
      expect(list.max()).toEqual([1, 'one'])
      expect(list.keys()).toEqual([1])
      expect(list.values()).toEqual(['one'])
      expect(list.entries()).toEqual([[1, 'one']])
      expect(list.has(1)).toBe(true)
      expect(list.get(1)).toBe('one')
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
      expect(list.get(0)).toBe('zero')
      expect(list.has(0)).toBe(true)
    })

    it('should handle sequential insertions', () => {
      for (let i = 0; i < 50; i++) {
        list.insert(i, String(i))
      }
      expect(list.size).toBe(50)
      expect(list.keys()).toEqual(Array.from({ length: 50 }, (_, i) => i))
    })

    it('should handle reverse sequential insertions', () => {
      for (let i = 49; i >= 0; i--) {
        list.insert(i, String(i))
      }
      expect(list.size).toBe(50)
      expect(list.keys()).toEqual(Array.from({ length: 50 }, (_, i) => i))
    })

    it('should handle alternating insertions', () => {
      const keys = [5, 15, 10, 20, 0]
      for (const k of keys) {
        list.insert(k, String(k))
      }
      expect(list.keys()).toEqual([0, 5, 10, 15, 20])
    })
  })

  describe('combined operations', () => {
    it('should handle insert-delete-reinsert cycle', () => {
      list.insert(1, 'a')
      list.delete(1)
      list.insert(1, 'b')
      expect(list.get(1)).toBe('b')
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
      expect(list.keys()).toEqual([1, 2, 3, 4])
      expect(list.get(2)).toBe('b2')
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
      expect(list.get(5)).toBeUndefined()
      expect(list.get(15)).toBe('15')
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
      expect(list.range(1, 4)).toEqual([[1, 'a'], [3, 'c'], [4, 'd']])
    })

    it('should handle clone after modifications', () => {
      list.insert(1, 'a')
      list.insert(2, 'b')
      list.insert(3, 'c')
      list.delete(2)
      const cloned = list.clone()
      expect(cloned.size).toBe(2)
      expect(cloned.keys()).toEqual([1, 3])
    })
  })

  describe('lowerBound and upperBound combined', () => {
    it('lowerBound(x) should equal upperBound(x-1) when x exists', () => {
      for (let i = 0; i < 10; i += 2) {
        list.insert(i, String(i))
      }
      expect(list.lowerBound(4)).toEqual(list.upperBound(3))
    })

    it('lowerBound should find exact, upperBound should skip', () => {
      list.insert(5, 'five')
      expect(list.lowerBound(5)).toEqual([5, 'five'])
      expect(list.upperBound(5)).toBeUndefined()
    })
  })

  describe('iterator consistency', () => {
    it('should match entries()', () => {
      list.insert(3, 'c')
      list.insert(1, 'a')
      list.insert(2, 'b')
      expect([...list]).toEqual(list.entries())
    })

    it('should work with Array.from', () => {
      list.insert(1, 'a')
      list.insert(2, 'b')
      expect(Array.from(list)).toEqual([[1, 'a'], [2, 'b']])
    })
  })

  describe('stress test', () => {
    it('should handle 1000+ insertions', () => {
      const sl = new SkipList<number>(20)
      for (let i = 0; i < 1500; i++) {
        sl.insert(i, i * 10)
      }
      expect(sl.size).toBe(1500)
      expect(sl.min()).toEqual([0, 0])
      expect(sl.max()).toEqual([1499, 14990])
      expect(sl.keys().length).toBe(1500)
    })

    it('should handle 1000+ random order insertions', () => {
      const sl = new SkipList<number>(20)
      const keys = Array.from({ length: 1000 }, (_, i) => i)
      for (let i = keys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[keys[i], keys[j]] = [keys[j], keys[i]]
      }
      for (const k of keys) {
        sl.insert(k, k * 2)
      }
      const allKeys = sl.keys()
      expect(allKeys.length).toBe(1000)
      for (let i = 1; i < allKeys.length; i++) {
        expect(allKeys[i]!).toBeGreaterThan(allKeys[i - 1]!)
      }
    })

    it('should handle 1000+ deletions', () => {
      const sl = new SkipList<number>(20)
      for (let i = 0; i < 1000; i++) {
        sl.insert(i, i)
      }
      for (let i = 0; i < 500; i++) {
        expect(sl.delete(i)).toBe(true)
      }
      expect(sl.size).toBe(500)
      expect(sl.min()).toEqual([500, 500])
      expect(sl.max()).toEqual([999, 999])
    })

    it('should handle alternating insert and delete', () => {
      const sl = new SkipList<string>()
      for (let i = 0; i < 500; i++) {
        sl.insert(i, String(i))
        if (i > 0) {
          sl.delete(i - 1)
        }
      }
      expect(sl.size).toBe(1)
      expect(sl.get(499)).toBe('499')
    })

    it('should handle range queries on large list', () => {
      const sl = new SkipList<number>(20)
      for (let i = 0; i < 1000; i++) {
        sl.insert(i, i * 10)
      }
      const r = sl.range(100, 200)
      expect(r.length).toBe(101)
      expect(r[0]).toEqual([100, 1000])
      expect(r[100]).toEqual([200, 2000])
    })

    it('should handle lowerBound/upperBound on large list', () => {
      const sl = new SkipList<number>(20)
      for (let i = 0; i < 1000; i += 2) {
        sl.insert(i, i)
      }
      expect(sl.lowerBound(5)).toEqual([6, 6])
      expect(sl.upperBound(4)).toEqual([6, 6])
      expect(sl.lowerBound(6)).toEqual([6, 6])
    })

    it('should handle clone of large list', () => {
      const sl = new SkipList<number>(20)
      for (let i = 0; i < 1000; i++) {
        sl.insert(i, i)
      }
      const cloned = sl.clone()
      expect(cloned.size).toBe(1000)
      expect(cloned.get(500)).toBe(500)
      cloned.delete(500)
      expect(sl.get(500)).toBe(500)
      expect(cloned.get(500)).toBeUndefined()
    })

    it('should handle fromEntries with large dataset', () => {
      const entries: [number, string][] = []
      for (let i = 0; i < 1000; i++) {
        entries.push([i, String(i)])
      }
      entries.reverse()
      const sl = SkipList.fromEntries(entries, 20)
      expect(sl.size).toBe(1000)
      expect(sl.keys()[0]).toBe(0)
      expect(sl.keys()[999]).toBe(999)
    })

    it('should maintain sorted order through heavy mixed operations', () => {
      const sl = new SkipList<number>(20)
      const present = new Set<number>()
      for (let i = 0; i < 500; i++) {
        const key = Math.floor(Math.random() * 1000)
        if (!present.has(key)) {
          sl.insert(key, key)
          present.add(key)
        }
      }
      for (const key of present) {
        expect(sl.has(key)).toBe(true)
      }
      const keys = sl.keys()
      for (let i = 1; i < keys.length; i++) {
        expect(keys[i]!).toBeGreaterThan(keys[i - 1]!)
      }
    })
  })
})
