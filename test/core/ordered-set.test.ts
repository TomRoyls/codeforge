import { describe, it, expect, beforeEach } from 'vitest'
import { OrderedSet } from '../../src/core/ordered-set/ordered-set.js'
import { DEFAULT_ORDERED_SET_OPTIONS } from '../../src/core/ordered-set/types.js'
import type { OrderedSetOptions, OrderedSetStats } from '../../src/core/ordered-set/types.js'

describe('OrderedSet', () => {
  let s: OrderedSet<number>

  beforeEach(() => {
    s = new OrderedSet<number>()
  })

  describe('construction', () => {
    it('should create empty set with no options', () => {
      const set = new OrderedSet<number>()
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })

    it('should create empty set with empty options', () => {
      const set = new OrderedSet<number>({})
      expect(set.size).toBe(0)
    })

    it('should create set with partial options', () => {
      const set = new OrderedSet<number>({ initialCapacity: 32 })
      expect(set.size).toBe(0)
    })

    it('should create set with full options', () => {
      const opts: Partial<OrderedSetOptions> = { initialCapacity: 64 }
      const set = new OrderedSet<string>(opts)
      expect(set.isEmpty()).toBe(true)
    })

    it('should have default options constant', () => {
      expect(DEFAULT_ORDERED_SET_OPTIONS.initialCapacity).toBe(16)
    })

    it('should work with string type', () => {
      const set = new OrderedSet<string>()
      expect(set.size).toBe(0)
    })

    it('should work with object type', () => {
      const set = new OrderedSet<{ id: number }>()
      expect(set.size).toBe(0)
    })
  })

  describe('add', () => {
    it('should add value and return true', () => {
      expect(s.add(1)).toBe(true)
      expect(s.size).toBe(1)
    })

    it('should add multiple values', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.size).toBe(3)
    })

    it('should return false for duplicate value', () => {
      s.add(1)
      expect(s.add(1)).toBe(false)
      expect(s.size).toBe(1)
    })

    it('should return false for duplicate after many adds', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.add(2)).toBe(false)
      expect(s.size).toBe(3)
    })

    it('should maintain insertion order after duplicate rejection', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      s.add(2)
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('should handle adding zero', () => {
      expect(s.add(0)).toBe(true)
      expect(s.has(0)).toBe(true)
    })

    it('should handle adding negative numbers', () => {
      expect(s.add(-1)).toBe(true)
      expect(s.add(-999)).toBe(true)
      expect(s.size).toBe(2)
    })

    it('should handle string values', () => {
      const set = new OrderedSet<string>()
      expect(set.add('hello')).toBe(true)
      expect(set.add('world')).toBe(true)
      expect(set.add('hello')).toBe(false)
    })

    it('should handle object references', () => {
      const obj = { id: 1 }
      const set = new OrderedSet<object>()
      expect(set.add(obj)).toBe(true)
      expect(set.add(obj)).toBe(false)
    })

    it('should distinguish different object references', () => {
      const set = new OrderedSet<{ id: number }>()
      expect(set.add({ id: 1 })).toBe(true)
      expect(set.add({ id: 1 })).toBe(true)
      expect(set.size).toBe(2)
    })

    it('should add 100 sequential values', () => {
      for (let i = 0; i < 100; i++) {
        expect(s.add(i)).toBe(true)
      }
      expect(s.size).toBe(100)
    })
  })

  describe('delete', () => {
    it('should delete existing value and return true', () => {
      s.add(1)
      expect(s.delete(1)).toBe(true)
      expect(s.size).toBe(0)
    })

    it('should return false for non-existent value', () => {
      expect(s.delete(999)).toBe(false)
    })

    it('should return false on empty set', () => {
      expect(s.delete(1)).toBe(false)
    })

    it('should not affect other elements', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      expect(s.has(1)).toBe(true)
      expect(s.has(3)).toBe(true)
      expect(s.has(2)).toBe(false)
      expect(s.size).toBe(2)
    })

    it('should delete first element', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(1)
      expect(s.first).toBe(2)
      expect(s.toArray()).toEqual([2, 3])
    })

    it('should delete last element', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(3)
      expect(s.last).toBe(2)
      expect(s.toArray()).toEqual([1, 2])
    })

    it('should delete middle element', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      expect(s.toArray()).toEqual([1, 3])
    })

    it('should allow re-adding deleted value at end', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      s.add(2)
      expect(s.toArray()).toEqual([1, 3, 2])
    })

    it('should delete and leave single element', () => {
      s.add(1)
      s.add(2)
      s.delete(1)
      expect(s.size).toBe(1)
      expect(s.first).toBe(2)
      expect(s.last).toBe(2)
    })

    it('should handle deleting all elements one by one', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.delete(2)).toBe(true)
      expect(s.delete(1)).toBe(true)
      expect(s.delete(3)).toBe(true)
      expect(s.isEmpty()).toBe(true)
    })
  })

  describe('has', () => {
    it('should return true for existing value', () => {
      s.add(1)
      expect(s.has(1)).toBe(true)
    })

    it('should return false for non-existent value', () => {
      expect(s.has(1)).toBe(false)
    })

    it('should return false on empty set', () => {
      expect(s.has(0)).toBe(false)
    })

    it('should return false after deletion', () => {
      s.add(1)
      s.delete(1)
      expect(s.has(1)).toBe(false)
    })

    it('should work with many values', () => {
      for (let i = 0; i < 50; i++) {
        s.add(i)
      }
      expect(s.has(0)).toBe(true)
      expect(s.has(49)).toBe(true)
      expect(s.has(50)).toBe(false)
    })
  })

  describe('first and last', () => {
    it('should return undefined for first on empty set', () => {
      expect(s.first).toBeUndefined()
    })

    it('should return undefined for last on empty set', () => {
      expect(s.last).toBeUndefined()
    })

    it('should return same value for first and last with one element', () => {
      s.add(42)
      expect(s.first).toBe(42)
      expect(s.last).toBe(42)
    })

    it('should return first inserted value', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.first).toBe(1)
    })

    it('should return last inserted value', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.last).toBe(3)
    })

    it('should update first after deletion of head', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(1)
      expect(s.first).toBe(2)
    })

    it('should update last after deletion of tail', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(3)
      expect(s.last).toBe(2)
    })

    it('should update first and last after deleting only element', () => {
      s.add(1)
      s.delete(1)
      expect(s.first).toBeUndefined()
      expect(s.last).toBeUndefined()
    })
  })

  describe('forEach', () => {
    it('should not call callback on empty set', () => {
      const items: number[] = []
      s.forEach((v) => items.push(v))
      expect(items).toEqual([])
    })

    it('should iterate single element', () => {
      s.add(1)
      const items: number[] = []
      s.forEach((v) => items.push(v))
      expect(items).toEqual([1])
    })

    it('should iterate in insertion order', () => {
      s.add(3)
      s.add(1)
      s.add(2)
      const items: number[] = []
      s.forEach((v) => items.push(v))
      expect(items).toEqual([3, 1, 2])
    })

    it('should iterate many elements', () => {
      for (let i = 0; i < 10; i++) {
        s.add(i)
      }
      const items: number[] = []
      s.forEach((v) => items.push(v))
      expect(items).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should iterate correctly after deletion', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      const items: number[] = []
      s.forEach((v) => items.push(v))
      expect(items).toEqual([1, 3])
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty set', () => {
      expect(s.toArray()).toEqual([])
    })

    it('should return single element array', () => {
      s.add(1)
      expect(s.toArray()).toEqual([1])
    })

    it('should return elements in insertion order', () => {
      s.add(3)
      s.add(1)
      s.add(4)
      s.add(2)
      expect(s.toArray()).toEqual([3, 1, 4, 2])
    })

    it('should return copy of elements', () => {
      s.add(1)
      s.add(2)
      const arr = s.toArray()
      arr.push(3)
      expect(s.size).toBe(2)
    })

    it('should reflect state after deletion', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      expect(s.toArray()).toEqual([1, 3])
    })
  })

  describe('size and isEmpty', () => {
    it('should report 0 for empty set', () => {
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should report correct size after adds', () => {
      s.add(1)
      s.add(2)
      expect(s.size).toBe(2)
      expect(s.isEmpty()).toBe(false)
    })

    it('should not count duplicates', () => {
      s.add(1)
      s.add(1)
      s.add(1)
      expect(s.size).toBe(1)
    })

    it('should decrease size after delete', () => {
      s.add(1)
      s.add(2)
      s.delete(1)
      expect(s.size).toBe(1)
    })

    it('should be empty after clearing all via delete', () => {
      s.add(1)
      s.add(2)
      s.delete(1)
      s.delete(2)
      expect(s.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear empty set without error', () => {
      s.clear()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should clear set with elements', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      s.clear()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
      expect(s.toArray()).toEqual([])
    })

    it('should reset first and last', () => {
      s.add(1)
      s.add(2)
      s.clear()
      expect(s.first).toBeUndefined()
      expect(s.last).toBeUndefined()
    })

    it('should allow adding after clear', () => {
      s.add(1)
      s.add(2)
      s.clear()
      s.add(3)
      expect(s.size).toBe(1)
      expect(s.first).toBe(3)
      expect(s.last).toBe(3)
    })

    it('should allow operations after clear', () => {
      s.add(1)
      s.clear()
      expect(s.has(1)).toBe(false)
      expect(s.delete(1)).toBe(false)
    })
  })

  describe('clone', () => {
    it('should clone empty set', () => {
      const c = s.clone()
      expect(c.size).toBe(0)
      expect(c.isEmpty()).toBe(true)
    })

    it('should clone set with elements', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      const c = s.clone()
      expect(c.toArray()).toEqual([1, 2, 3])
      expect(c.size).toBe(3)
    })

    it('should produce independent copy', () => {
      s.add(1)
      s.add(2)
      const c = s.clone()
      c.add(3)
      c.delete(1)
      expect(s.size).toBe(2)
      expect(s.toArray()).toEqual([1, 2])
      expect(c.toArray()).toEqual([2, 3])
    })

    it('should preserve insertion order in clone', () => {
      s.add(3)
      s.add(1)
      s.add(2)
      const c = s.clone()
      expect(c.toArray()).toEqual([3, 1, 2])
    })

    it('should clone single element set', () => {
      s.add(42)
      const c = s.clone()
      expect(c.first).toBe(42)
      expect(c.last).toBe(42)
      expect(c.size).toBe(1)
    })
  })

  describe('from factory', () => {
    it('should create set from array', () => {
      const set = OrderedSet.from([1, 2, 3])
      expect(set.toArray()).toEqual([1, 2, 3])
      expect(set.size).toBe(3)
    })

    it('should create set from empty array', () => {
      const set = OrderedSet.from([])
      expect(set.isEmpty()).toBe(true)
    })

    it('should create set from single element array', () => {
      const set = OrderedSet.from([42])
      expect(set.size).toBe(1)
      expect(set.first).toBe(42)
    })

    it('should deduplicate from array', () => {
      const set = OrderedSet.from([1, 2, 1, 3, 2])
      expect(set.toArray()).toEqual([1, 2, 3])
    })

    it('should preserve insertion order from array', () => {
      const set = OrderedSet.from([3, 1, 4, 2])
      expect(set.toArray()).toEqual([3, 1, 4, 2])
    })

    it('should create set from Set', () => {
      const jsSet = new Set([1, 2, 3])
      const set = OrderedSet.from(jsSet)
      expect(set.size).toBe(3)
    })

    it('should create set from generator', () => {
      function* gen() {
        yield 1
        yield 2
        yield 3
      }
      const set = OrderedSet.from(gen())
      expect(set.toArray()).toEqual([1, 2, 3])
    })

    it('should accept options parameter', () => {
      const set = OrderedSet.from([1, 2], { initialCapacity: 32 })
      expect(set.size).toBe(2)
    })

    it('should create set from string iterable', () => {
      const set = OrderedSet.from('hello')
      expect(set.toArray()).toEqual(['h', 'e', 'l', 'o'])
    })
  })

  describe('indexOf', () => {
    it('should return -1 for non-existent value', () => {
      expect(s.indexOf(1)).toBe(-1)
    })

    it('should return -1 on empty set', () => {
      expect(s.indexOf(0)).toBe(-1)
    })

    it('should return 0 for first element', () => {
      s.add(10)
      s.add(20)
      s.add(30)
      expect(s.indexOf(10)).toBe(0)
    })

    it('should return correct index for middle element', () => {
      s.add(10)
      s.add(20)
      s.add(30)
      expect(s.indexOf(20)).toBe(1)
    })

    it('should return correct index for last element', () => {
      s.add(10)
      s.add(20)
      s.add(30)
      expect(s.indexOf(30)).toBe(2)
    })

    it('should return 0 for single element', () => {
      s.add(1)
      expect(s.indexOf(1)).toBe(0)
    })

    it('should update index after deletion', () => {
      s.add(10)
      s.add(20)
      s.add(30)
      s.delete(20)
      expect(s.indexOf(10)).toBe(0)
      expect(s.indexOf(30)).toBe(1)
    })

    it('should return -1 for deleted value', () => {
      s.add(1)
      s.delete(1)
      expect(s.indexOf(1)).toBe(-1)
    })
  })

  describe('atIndex', () => {
    it('should return undefined for empty set', () => {
      expect(s.atIndex(0)).toBeUndefined()
    })

    it('should return undefined for negative index', () => {
      s.add(1)
      expect(s.atIndex(-1)).toBeUndefined()
    })

    it('should return undefined for out-of-bounds index', () => {
      s.add(1)
      expect(s.atIndex(1)).toBeUndefined()
    })

    it('should return element at index 0', () => {
      s.add(10)
      s.add(20)
      s.add(30)
      expect(s.atIndex(0)).toBe(10)
    })

    it('should return element at middle index', () => {
      s.add(10)
      s.add(20)
      s.add(30)
      expect(s.atIndex(1)).toBe(20)
    })

    it('should return element at last index', () => {
      s.add(10)
      s.add(20)
      s.add(30)
      expect(s.atIndex(2)).toBe(30)
    })

    it('should return only element at index 0', () => {
      s.add(42)
      expect(s.atIndex(0)).toBe(42)
    })

    it('should reflect changes after deletion', () => {
      s.add(10)
      s.add(20)
      s.add(30)
      s.delete(20)
      expect(s.atIndex(0)).toBe(10)
      expect(s.atIndex(1)).toBe(30)
      expect(s.atIndex(2)).toBeUndefined()
    })

    it('should work with large index', () => {
      for (let i = 0; i < 100; i++) {
        s.add(i)
      }
      expect(s.atIndex(99)).toBe(99)
      expect(s.atIndex(100)).toBeUndefined()
    })
  })

  describe('moveToFront', () => {
    it('should return false for non-existent value', () => {
      expect(s.moveToFront(1)).toBe(false)
    })

    it('should return true for existing value', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.moveToFront(2)).toBe(true)
    })

    it('should move middle element to front', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      s.moveToFront(2)
      expect(s.toArray()).toEqual([2, 1, 3])
      expect(s.first).toBe(2)
    })

    it('should move last element to front', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      s.moveToFront(3)
      expect(s.toArray()).toEqual([3, 1, 2])
      expect(s.first).toBe(3)
    })

    it('should not change order if already first', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.moveToFront(1)).toBe(true)
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('should work with single element', () => {
      s.add(1)
      expect(s.moveToFront(1)).toBe(true)
      expect(s.toArray()).toEqual([1])
    })

    it('should work with two elements', () => {
      s.add(1)
      s.add(2)
      s.moveToFront(2)
      expect(s.toArray()).toEqual([2, 1])
    })

    it('should maintain size after move', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      s.moveToFront(2)
      expect(s.size).toBe(3)
    })

    it('should work after delete and re-add', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      s.add(2)
      s.moveToFront(2)
      expect(s.toArray()).toEqual([2, 1, 3])
    })
  })

  describe('moveToBack', () => {
    it('should return false for non-existent value', () => {
      expect(s.moveToBack(1)).toBe(false)
    })

    it('should return true for existing value', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.moveToBack(2)).toBe(true)
    })

    it('should move middle element to back', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      s.moveToBack(2)
      expect(s.toArray()).toEqual([1, 3, 2])
      expect(s.last).toBe(2)
    })

    it('should move first element to back', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      s.moveToBack(1)
      expect(s.toArray()).toEqual([2, 3, 1])
      expect(s.last).toBe(1)
    })

    it('should not change order if already last', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      expect(s.moveToBack(3)).toBe(true)
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('should work with single element', () => {
      s.add(1)
      expect(s.moveToBack(1)).toBe(true)
      expect(s.toArray()).toEqual([1])
    })

    it('should work with two elements', () => {
      s.add(1)
      s.add(2)
      s.moveToBack(1)
      expect(s.toArray()).toEqual([2, 1])
    })

    it('should maintain size after move', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      s.moveToBack(1)
      expect(s.size).toBe(3)
    })

    it('should work after delete and re-add', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      s.add(2)
      s.moveToBack(1)
      expect(s.toArray()).toEqual([3, 2, 1])
    })
  })

  describe('set operations', () => {
    it('union should combine two sets', () => {
      s.add(1)
      s.add(2)
      const other = OrderedSet.from([2, 3])
      const result = s.union(other)
      expect(result.toArray()).toEqual([1, 2, 3])
    })

    it('union should preserve order of self then other', () => {
      s.add(1)
      s.add(2)
      const other = OrderedSet.from([3, 4])
      const result = s.union(other)
      expect(result.toArray()).toEqual([1, 2, 3, 4])
    })

    it('union with empty set returns copy', () => {
      s.add(1)
      s.add(2)
      const empty = new OrderedSet<number>()
      const result = s.union(empty)
      expect(result.toArray()).toEqual([1, 2])
    })

    it('union of empty set with other returns copy', () => {
      const other = OrderedSet.from([1, 2])
      const result = s.union(other)
      expect(result.toArray()).toEqual([1, 2])
    })

    it('union of two empty sets is empty', () => {
      const result = s.union(new OrderedSet<number>())
      expect(result.isEmpty()).toBe(true)
    })

    it('union should not modify original sets', () => {
      s.add(1)
      const other = OrderedSet.from([2])
      s.union(other)
      expect(s.toArray()).toEqual([1])
      expect(other.toArray()).toEqual([2])
    })

    it('intersection should return common elements', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      const other = OrderedSet.from([2, 3, 4])
      const result = s.intersection(other)
      expect(result.toArray()).toEqual([2, 3])
    })

    it('intersection with no common elements returns empty', () => {
      s.add(1)
      s.add(2)
      const other = OrderedSet.from([3, 4])
      const result = s.intersection(other)
      expect(result.isEmpty()).toBe(true)
    })

    it('intersection with empty set returns empty', () => {
      s.add(1)
      s.add(2)
      const result = s.intersection(new OrderedSet<number>())
      expect(result.isEmpty()).toBe(true)
    })

    it('intersection of identical sets returns copy', () => {
      s.add(1)
      s.add(2)
      const other = OrderedSet.from([1, 2])
      const result = s.intersection(other)
      expect(result.toArray()).toEqual([1, 2])
    })

    it('intersection should preserve self order', () => {
      s.add(3)
      s.add(1)
      s.add(2)
      const other = OrderedSet.from([2, 3])
      const result = s.intersection(other)
      expect(result.toArray()).toEqual([3, 2])
    })

    it('difference should return elements in self not in other', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      const other = OrderedSet.from([2])
      const result = s.difference(other)
      expect(result.toArray()).toEqual([1, 3])
    })

    it('difference with empty set returns copy of self', () => {
      s.add(1)
      s.add(2)
      const result = s.difference(new OrderedSet<number>())
      expect(result.toArray()).toEqual([1, 2])
    })

    it('difference with identical sets returns empty', () => {
      s.add(1)
      s.add(2)
      const other = OrderedSet.from([1, 2])
      const result = s.difference(other)
      expect(result.isEmpty()).toBe(true)
    })

    it('difference should not modify original sets', () => {
      s.add(1)
      s.add(2)
      const other = OrderedSet.from([2])
      s.difference(other)
      expect(s.toArray()).toEqual([1, 2])
      expect(other.toArray()).toEqual([2])
    })

    it('symmetricDifference should return elements in either but not both', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      const other = OrderedSet.from([2, 3, 4])
      const result = s.symmetricDifference(other)
      expect(result.toArray()).toEqual([1, 4])
    })

    it('symmetricDifference with empty set returns copy of self', () => {
      s.add(1)
      s.add(2)
      const result = s.symmetricDifference(new OrderedSet<number>())
      expect(result.toArray()).toEqual([1, 2])
    })

    it('symmetricDifference of identical sets returns empty', () => {
      s.add(1)
      s.add(2)
      const other = OrderedSet.from([1, 2])
      const result = s.symmetricDifference(other)
      expect(result.isEmpty()).toBe(true)
    })

    it('symmetricDifference should preserve self order then other order', () => {
      s.add(1)
      s.add(2)
      const other = OrderedSet.from([3, 4])
      const result = s.symmetricDifference(other)
      expect(result.toArray()).toEqual([1, 2, 3, 4])
    })

    it('isSubsetOf should return true for subset', () => {
      s.add(1)
      s.add(2)
      const other = OrderedSet.from([1, 2, 3])
      expect(s.isSubsetOf(other)).toBe(true)
    })

    it('isSubsetOf should return true for identical sets', () => {
      s.add(1)
      s.add(2)
      const other = OrderedSet.from([1, 2])
      expect(s.isSubsetOf(other)).toBe(true)
    })

    it('isSubsetOf should return false for non-subset', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      const other = OrderedSet.from([1, 2])
      expect(s.isSubsetOf(other)).toBe(false)
    })

    it('isSubsetOf should return true for empty set', () => {
      const other = OrderedSet.from([1, 2])
      expect(s.isSubsetOf(other)).toBe(true)
    })

    it('isSubsetOf should return false if empty other', () => {
      s.add(1)
      expect(s.isSubsetOf(new OrderedSet<number>())).toBe(false)
    })

    it('isSupersetOf should return true for superset', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      const other = OrderedSet.from([1, 2])
      expect(s.isSupersetOf(other)).toBe(true)
    })

    it('isSupersetOf should return true for identical sets', () => {
      s.add(1)
      s.add(2)
      const other = OrderedSet.from([1, 2])
      expect(s.isSupersetOf(other)).toBe(true)
    })

    it('isSupersetOf should return false for non-superset', () => {
      s.add(1)
      s.add(2)
      const other = OrderedSet.from([1, 2, 3])
      expect(s.isSupersetOf(other)).toBe(false)
    })

    it('isSupersetOf should return true if other is empty', () => {
      s.add(1)
      expect(s.isSupersetOf(new OrderedSet<number>())).toBe(true)
    })

    it('isSupersetOf should return false if self is empty', () => {
      const other = OrderedSet.from([1])
      expect(s.isSupersetOf(other)).toBe(false)
    })
  })

  describe('iteration order verification', () => {
    it('should maintain order across mixed operations', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      s.add(4)
      s.delete(2)
      s.add(5)
      expect(s.toArray()).toEqual([1, 3, 4, 5])
    })

    it('should maintain order after multiple deletes', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      s.add(4)
      s.add(5)
      s.delete(2)
      s.delete(4)
      expect(s.toArray()).toEqual([1, 3, 5])
    })

    it('should maintain order after moveToFront', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      s.add(4)
      s.moveToFront(3)
      expect(s.toArray()).toEqual([3, 1, 2, 4])
    })

    it('should maintain order after moveToBack', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      s.add(4)
      s.moveToBack(1)
      expect(s.toArray()).toEqual([2, 3, 4, 1])
    })

    it('should handle moveToFront then moveToBack', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      s.moveToFront(3)
      s.moveToBack(3)
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('should handle alternating moves', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      s.add(4)
      s.moveToFront(2)
      s.moveToBack(1)
      expect(s.toArray()).toEqual([2, 3, 4, 1])
    })

    it('should verify forEach matches toArray order', () => {
      s.add(5)
      s.add(3)
      s.add(1)
      s.add(4)
      const viaForEach: number[] = []
      s.forEach((v) => viaForEach.push(v))
      expect(viaForEach).toEqual(s.toArray())
    })

    it('should verify indexOf matches toArray positions', () => {
      s.add(10)
      s.add(20)
      s.add(30)
      const arr = s.toArray()
      for (let i = 0; i < arr.length; i++) {
        expect(s.indexOf(arr[i]!)).toBe(i)
      }
    })
  })

  describe('edge cases', () => {
    it('should handle empty set operations gracefully', () => {
      expect(s.first).toBeUndefined()
      expect(s.last).toBeUndefined()
      expect(s.toArray()).toEqual([])
      expect(s.has(1)).toBe(false)
      expect(s.delete(1)).toBe(false)
      expect(s.indexOf(1)).toBe(-1)
      expect(s.atIndex(0)).toBeUndefined()
      expect(s.moveToFront(1)).toBe(false)
      expect(s.moveToBack(1)).toBe(false)
    })

    it('should handle single element add delete re-add', () => {
      s.add(1)
      s.delete(1)
      s.add(1)
      expect(s.size).toBe(1)
      expect(s.first).toBe(1)
      expect(s.last).toBe(1)
    })

    it('should handle delete and re-add goes to end', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(1)
      s.add(1)
      expect(s.toArray()).toEqual([2, 3, 1])
    })

    it('should handle NaN values', () => {
      const set = new OrderedSet<number>()
      set.add(NaN)
      expect(set.has(NaN)).toBe(true)
      expect(set.size).toBe(1)
      expect(set.add(NaN)).toBe(false)
    })

    it('should handle undefined values', () => {
      const set = new OrderedSet<undefined>()
      set.add(undefined)
      expect(set.has(undefined)).toBe(true)
    })

    it('should handle null values', () => {
      const set = new OrderedSet<null>()
      set.add(null)
      expect(set.has(null)).toBe(true)
    })

    it('should handle boolean values', () => {
      const set = new OrderedSet<boolean>()
      set.add(true)
      set.add(false)
      expect(set.size).toBe(2)
      expect(set.add(true)).toBe(false)
    })

    it('should handle clear followed by operations', () => {
      for (let i = 0; i < 10; i++) {
        s.add(i)
      }
      s.clear()
      expect(s.isEmpty()).toBe(true)
      s.add(100)
      expect(s.first).toBe(100)
      expect(s.last).toBe(100)
      expect(s.size).toBe(1)
    })

    it('should handle moveToFront on empty set', () => {
      expect(s.moveToFront(1)).toBe(false)
    })

    it('should handle moveToBack on empty set', () => {
      expect(s.moveToBack(1)).toBe(false)
    })

    it('should handle deleting same value twice', () => {
      s.add(1)
      expect(s.delete(1)).toBe(true)
      expect(s.delete(1)).toBe(false)
    })

    it('should handle adding same value multiple times', () => {
      s.add(1)
      expect(s.add(1)).toBe(false)
      expect(s.add(1)).toBe(false)
      expect(s.add(1)).toBe(false)
      expect(s.size).toBe(1)
    })
  })

  describe('large sets', () => {
    it('should handle 10000 elements', () => {
      for (let i = 0; i < 10000; i++) {
        s.add(i)
      }
      expect(s.size).toBe(10000)
      expect(s.first).toBe(0)
      expect(s.last).toBe(9999)
    })

    it('should handle 10000 elements in correct order', () => {
      for (let i = 0; i < 10000; i++) {
        s.add(i)
      }
      const arr = s.toArray()
      expect(arr.length).toBe(10000)
      expect(arr[0]).toBe(0)
      expect(arr[9999]).toBe(9999)
    })

    it('should handle deletion in large set', () => {
      for (let i = 0; i < 10000; i++) {
        s.add(i)
      }
      s.delete(5000)
      expect(s.size).toBe(9999)
      expect(s.has(5000)).toBe(false)
      expect(s.has(4999)).toBe(true)
      expect(s.has(5001)).toBe(true)
    })

    it('should handle has on large set', () => {
      for (let i = 0; i < 10000; i++) {
        s.add(i)
      }
      expect(s.has(0)).toBe(true)
      expect(s.has(9999)).toBe(true)
      expect(s.has(10000)).toBe(false)
    })

    it('should handle clone of large set', () => {
      for (let i = 0; i < 1000; i++) {
        s.add(i)
      }
      const c = s.clone()
      expect(c.size).toBe(1000)
      expect(c.first).toBe(0)
      expect(c.last).toBe(999)
    })

    it('should handle indexOf on large set', () => {
      for (let i = 0; i < 10000; i++) {
        s.add(i)
      }
      expect(s.indexOf(0)).toBe(0)
      expect(s.indexOf(9999)).toBe(9999)
      expect(s.indexOf(10000)).toBe(-1)
    })

    it('should handle atIndex on large set', () => {
      for (let i = 0; i < 10000; i++) {
        s.add(i)
      }
      expect(s.atIndex(0)).toBe(0)
      expect(s.atIndex(9999)).toBe(9999)
      expect(s.atIndex(10000)).toBeUndefined()
    })

    it('should handle from with large array', () => {
      const arr = Array.from({ length: 10000 }, (_, i) => i)
      const set = OrderedSet.from(arr)
      expect(set.size).toBe(10000)
    })

    it('should handle moveToFront in large set', () => {
      for (let i = 0; i < 10000; i++) {
        s.add(i)
      }
      s.moveToFront(5000)
      expect(s.first).toBe(5000)
      expect(s.size).toBe(10000)
    })

    it('should handle moveToBack in large set', () => {
      for (let i = 0; i < 10000; i++) {
        s.add(i)
      }
      s.moveToBack(0)
      expect(s.last).toBe(0)
      expect(s.size).toBe(10000)
    })

    it('should handle clear on large set', () => {
      for (let i = 0; i < 10000; i++) {
        s.add(i)
      }
      s.clear()
      expect(s.isEmpty()).toBe(true)
      expect(s.size).toBe(0)
    })

    it('should handle forEach on large set', () => {
      for (let i = 0; i < 1000; i++) {
        s.add(i)
      }
      let count = 0
      s.forEach(() => count++)
      expect(count).toBe(1000)
    })
  })

  describe('stats', () => {
    it('should return stats for empty set', () => {
      const st = s.stats()
      expect(st.size).toBe(0)
      expect(st.capacity).toBe(0)
    })

    it('should return stats for set with elements', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      const st = s.stats()
      expect(st.size).toBe(3)
    })

    it('should return stats after deletion', () => {
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      const st = s.stats()
      expect(st.size).toBe(2)
    })

    it('should return stats after clear', () => {
      s.add(1)
      s.add(2)
      s.clear()
      const st = s.stats()
      expect(st.size).toBe(0)
    })

    it('should return typed OrderedSetStats', () => {
      const st: OrderedSetStats = s.stats()
      expect(typeof st.size).toBe('number')
      expect(typeof st.capacity).toBe('number')
    })
  })

  describe('type imports', () => {
    it('should allow type-only import of OrderedSetOptions', () => {
      const _opts: OrderedSetOptions = { initialCapacity: 16 }
      expect(_opts.initialCapacity).toBe(16)
    })

    it('should allow type-only import of OrderedSetStats', () => {
      const _stats: OrderedSetStats = { size: 0, capacity: 0 }
      expect(_stats.size).toBe(0)
    })
  })
})
