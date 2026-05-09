import { describe, it, expect, beforeEach } from 'vitest'
import { RadixHeap } from '../../src/core/radix-heap/radix-heap.js'
import { DEFAULT_RADIX_HEAP_OPTIONS } from '../../src/core/radix-heap/types.js'
import type { RadixHeapEntry, RadixHeapOptions } from '../../src/core/radix-heap/types.js'

describe('RadixHeap', () => {
  let heap: RadixHeap

  beforeEach(() => {
    heap = new RadixHeap()
  })

  describe('constructor', () => {
    it('should create an empty heap', () => {
      const h = new RadixHeap()
      expect(h.size()).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('should initialize with size 0', () => {
      expect(new RadixHeap().size()).toBe(0)
    })

    it('should initialize as empty', () => {
      expect(new RadixHeap().isEmpty()).toBe(true)
    })
  })

  describe('push', () => {
    it('should add a single entry', () => {
      heap.push(1, 100)
      expect(heap.size()).toBe(1)
    })

    it('should add multiple entries with increasing keys', () => {
      heap.push(1, 10)
      heap.push(2, 20)
      heap.push(3, 30)
      expect(heap.size()).toBe(3)
    })

    it('should add entries with equal keys', () => {
      heap.push(5, 10)
      heap.push(5, 20)
      expect(heap.size()).toBe(2)
    })

    it('should add entries with key 0', () => {
      heap.push(0, 42)
      expect(heap.size()).toBe(1)
    })

    it('should throw on negative key', () => {
      expect(() => heap.push(-1, 10)).toThrow()
    })

    it('should throw on non-integer key', () => {
      expect(() => heap.push(1.5, 10)).toThrow()
    })

    it('should throw when key is less than last popped key', () => {
      heap.push(5, 10)
      heap.pop()
      expect(() => heap.push(3, 20)).toThrow()
    })

    it('should allow pushing key equal to last popped key', () => {
      heap.push(5, 10)
      heap.pop()
      expect(() => heap.push(5, 20)).not.toThrow()
    })

    it('should allow pushing key greater than last popped key', () => {
      heap.push(5, 10)
      heap.pop()
      expect(() => heap.push(6, 20)).not.toThrow()
    })

    it('should handle large keys', () => {
      heap.push(1000000, 1)
      expect(heap.size()).toBe(1)
    })

    it('should handle many pushes', () => {
      for (let i = 0; i < 100; i++) {
        heap.push(i, i * 10)
      }
      expect(heap.size()).toBe(100)
    })

    it('should track keys in has()', () => {
      heap.push(7, 70)
      expect(heap.has(7)).toBe(true)
    })

    it('should track values in get()', () => {
      heap.push(7, 70)
      expect(heap.get(7)).toBe(70)
    })
  })

  describe('pop', () => {
    it('should return undefined on empty heap', () => {
      expect(heap.pop()).toBeUndefined()
    })

    it('should return the only entry', () => {
      heap.push(1, 100)
      const entry = heap.pop()
      expect(entry).toEqual({ key: 1, value: 100 })
    })

    it('should decrease size after pop', () => {
      heap.push(1, 10)
      heap.push(2, 20)
      heap.pop()
      expect(heap.size()).toBe(1)
    })

    it('should pop entries in non-decreasing key order', () => {
      heap.push(3, 30)
      heap.push(1, 10)
      heap.push(2, 20)
      const first = heap.pop()
      const second = heap.pop()
      const third = heap.pop()
      expect(first!.key).toBeLessThanOrEqual(second!.key)
      expect(second!.key).toBeLessThanOrEqual(third!.key)
    })

    it('should pop all entries', () => {
      heap.push(1, 10)
      heap.push(2, 20)
      heap.pop()
      heap.pop()
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle pop of entries with same key', () => {
      heap.push(5, 10)
      heap.push(5, 20)
      const first = heap.pop()
      const second = heap.pop()
      expect(first!.key).toBe(5)
      expect(second!.key).toBe(5)
    })

    it('should return undefined after all entries popped', () => {
      heap.push(1, 10)
      heap.pop()
      expect(heap.pop()).toBeUndefined()
    })

    it('should handle sequential push-pop', () => {
      heap.push(1, 10)
      expect(heap.pop()).toEqual({ key: 1, value: 10 })
      heap.push(2, 20)
      expect(heap.pop()).toEqual({ key: 2, value: 20 })
    })

    it('should maintain monotone property across multiple pops', () => {
      heap.push(5, 50)
      heap.push(5, 51)
      heap.push(10, 100)
      heap.push(10, 101)
      const results: number[] = []
      while (!heap.isEmpty()) {
        results.push(heap.pop()!.key)
      }
      for (let i = 1; i < results.length; i++) {
        expect(results[i]).toBeGreaterThanOrEqual(results[i - 1])
      }
    })

    it('should remove key from has after pop', () => {
      heap.push(5, 50)
      heap.pop()
      expect(heap.has(5)).toBe(false)
    })

    it('should pop entries sorted by key', () => {
      heap.push(10, 1)
      heap.push(1, 2)
      heap.push(5, 3)
      heap.push(3, 4)
      const keys: number[] = []
      while (!heap.isEmpty()) {
        keys.push(heap.pop()!.key)
      }
      expect(keys).toEqual([1, 3, 5, 10])
    })
  })

  describe('peek', () => {
    it('should return undefined on empty heap', () => {
      expect(heap.peek()).toBeUndefined()
    })

    it('should return the minimum key entry without removing it', () => {
      heap.push(1, 10)
      heap.push(3, 30)
      const entry = heap.peek()
      expect(entry).toEqual({ key: 1, value: 10 })
      expect(heap.size()).toBe(2)
    })

    it('should not modify the heap', () => {
      heap.push(1, 10)
      heap.push(2, 20)
      heap.peek()
      expect(heap.size()).toBe(2)
    })

    it('should return the same entry on repeated peeks', () => {
      heap.push(5, 50)
      expect(heap.peek()).toEqual({ key: 5, value: 50 })
      expect(heap.peek()).toEqual({ key: 5, value: 50 })
    })

    it('should return entry with smallest key', () => {
      heap.push(10, 1)
      heap.push(2, 2)
      heap.push(7, 3)
      expect(heap.peek()!.key).toBe(2)
    })

    it('should work after pop', () => {
      heap.push(1, 10)
      heap.push(2, 20)
      heap.push(3, 30)
      heap.pop()
      expect(heap.peek()).toEqual({ key: 2, value: 20 })
    })
  })

  describe('update', () => {
    it('should update value for existing key', () => {
      heap.push(1, 10)
      heap.update(1, 99)
      expect(heap.get(1)).toBe(99)
    })

    it('should do nothing for non-existent key', () => {
      heap.push(1, 10)
      heap.update(5, 99)
      expect(heap.get(5)).toBeUndefined()
    })

    it('should work on empty heap without error', () => {
      expect(() => heap.update(1, 10)).not.toThrow()
    })

    it('should update the correct entry', () => {
      heap.push(1, 10)
      heap.push(2, 20)
      heap.push(3, 30)
      heap.update(2, 99)
      expect(heap.get(2)).toBe(99)
      expect(heap.get(1)).toBe(10)
      expect(heap.get(3)).toBe(30)
    })

    it('should reflect in entries()', () => {
      heap.push(1, 10)
      heap.update(1, 99)
      const e = heap.entries()
      expect(e).toContainEqual([1, 99])
    })

    it('should handle update to 0', () => {
      heap.push(1, 10)
      heap.update(1, 0)
      expect(heap.get(1)).toBe(0)
    })

    it('should handle update to negative value', () => {
      heap.push(1, 10)
      heap.update(1, -5)
      expect(heap.get(1)).toBe(-5)
    })

    it('should not change size', () => {
      heap.push(1, 10)
      heap.push(2, 20)
      heap.update(1, 99)
      expect(heap.size()).toBe(2)
    })
  })

  describe('has', () => {
    it('should return false on empty heap', () => {
      expect(heap.has(1)).toBe(false)
    })

    it('should return true for existing key', () => {
      heap.push(5, 50)
      expect(heap.has(5)).toBe(true)
    })

    it('should return false for non-existent key', () => {
      heap.push(5, 50)
      expect(heap.has(3)).toBe(false)
    })

    it('should return false after pop', () => {
      heap.push(5, 50)
      heap.pop()
      expect(heap.has(5)).toBe(false)
    })

    it('should return false after clear', () => {
      heap.push(5, 50)
      heap.clear()
      expect(heap.has(5)).toBe(false)
    })

    it('should handle key 0', () => {
      heap.push(0, 42)
      expect(heap.has(0)).toBe(true)
    })

    it('should handle duplicate key pushes', () => {
      heap.push(5, 10)
      heap.push(5, 20)
      expect(heap.has(5)).toBe(true)
    })
  })

  describe('get', () => {
    it('should return undefined on empty heap', () => {
      expect(heap.get(1)).toBeUndefined()
    })

    it('should return value for existing key', () => {
      heap.push(5, 50)
      expect(heap.get(5)).toBe(50)
    })

    it('should return undefined for non-existent key', () => {
      heap.push(5, 50)
      expect(heap.get(3)).toBeUndefined()
    })

    it('should return updated value after update', () => {
      heap.push(5, 50)
      heap.update(5, 99)
      expect(heap.get(5)).toBe(99)
    })

    it('should return undefined after pop', () => {
      heap.push(5, 50)
      heap.pop()
      expect(heap.get(5)).toBeUndefined()
    })

    it('should return last pushed value for duplicate key', () => {
      heap.push(5, 10)
      heap.push(5, 20)
      expect(heap.get(5)).toBe(20)
    })
  })

  describe('size', () => {
    it('should return 0 for empty heap', () => {
      expect(heap.size()).toBe(0)
    })

    it('should return correct size after pushes', () => {
      heap.push(1, 10)
      heap.push(2, 20)
      heap.push(3, 30)
      expect(heap.size()).toBe(3)
    })

    it('should return correct size after pops', () => {
      heap.push(1, 10)
      heap.push(2, 20)
      heap.pop()
      expect(heap.size()).toBe(1)
    })

    it('should return 0 after clear', () => {
      heap.push(1, 10)
      heap.push(2, 20)
      heap.clear()
      expect(heap.size()).toBe(0)
    })

    it('should return 0 after draining all', () => {
      heap.push(1, 10)
      heap.push(2, 20)
      heap.drain()
      expect(heap.size()).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new heap', () => {
      expect(heap.isEmpty()).toBe(true)
    })

    it('should return false after push', () => {
      heap.push(1, 10)
      expect(heap.isEmpty()).toBe(false)
    })

    it('should return true after popping all', () => {
      heap.push(1, 10)
      heap.push(2, 20)
      heap.pop()
      heap.pop()
      expect(heap.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      heap.push(1, 10)
      heap.clear()
      expect(heap.isEmpty()).toBe(true)
    })

    it('should return true after drain', () => {
      heap.push(1, 10)
      heap.push(2, 20)
      heap.drain()
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all entries', () => {
      heap.push(1, 10)
      heap.push(2, 20)
      heap.push(3, 30)
      heap.clear()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should work on empty heap', () => {
      heap.clear()
      expect(heap.size()).toBe(0)
    })

    it('should allow pushes after clear', () => {
      heap.push(1, 10)
      heap.clear()
      heap.push(5, 50)
      expect(heap.size()).toBe(1)
      expect(heap.peek()).toEqual({ key: 5, value: 50 })
    })

    it('should reset has()', () => {
      heap.push(5, 50)
      heap.clear()
      expect(heap.has(5)).toBe(false)
    })

    it('should reset get()', () => {
      heap.push(5, 50)
      heap.clear()
      expect(heap.get(5)).toBeUndefined()
    })

    it('should allow popping after clear and push', () => {
      heap.push(10, 100)
      heap.clear()
      heap.push(1, 10)
      expect(heap.pop()).toEqual({ key: 1, value: 10 })
    })
  })

  describe('keys', () => {
    it('should return empty array for empty heap', () => {
      expect(heap.keys()).toEqual([])
    })

    it('should return all keys', () => {
      heap.push(1, 10)
      heap.push(2, 20)
      heap.push(3, 30)
      const keys = heap.keys()
      expect(keys).toHaveLength(3)
      expect(keys).toContain(1)
      expect(keys).toContain(2)
      expect(keys).toContain(3)
    })

    it('should include duplicate keys', () => {
      heap.push(5, 10)
      heap.push(5, 20)
      const keys = heap.keys()
      expect(keys.filter((k) => k === 5)).toHaveLength(2)
    })
  })

  describe('values', () => {
    it('should return empty array for empty heap', () => {
      expect(heap.values()).toEqual([])
    })

    it('should return all values', () => {
      heap.push(1, 10)
      heap.push(2, 20)
      heap.push(3, 30)
      const values = heap.values()
      expect(values).toHaveLength(3)
      expect(values).toContain(10)
      expect(values).toContain(20)
      expect(values).toContain(30)
    })

    it('should reflect updates', () => {
      heap.push(1, 10)
      heap.update(1, 99)
      const values = heap.values()
      expect(values).toContain(99)
    })
  })

  describe('entries', () => {
    it('should return empty array for empty heap', () => {
      expect(heap.entries()).toEqual([])
    })

    it('should return all entries as tuples', () => {
      heap.push(1, 10)
      heap.push(2, 20)
      const e = heap.entries()
      expect(e).toHaveLength(2)
      expect(e).toContainEqual([1, 10])
      expect(e).toContainEqual([2, 20])
    })

    it('should reflect updates', () => {
      heap.push(1, 10)
      heap.update(1, 99)
      expect(heap.entries()).toContainEqual([1, 99])
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      expect(heap.toArray()).toEqual([])
    })

    it('should return entries sorted by key', () => {
      heap.push(3, 30)
      heap.push(1, 10)
      heap.push(2, 20)
      const arr = heap.toArray()
      expect(arr[0].key).toBe(1)
      expect(arr[1].key).toBe(2)
      expect(arr[2].key).toBe(3)
    })

    it('should not modify the original heap', () => {
      heap.push(3, 30)
      heap.push(1, 10)
      heap.push(2, 20)
      heap.toArray()
      expect(heap.size()).toBe(3)
    })

    it('should handle single element', () => {
      heap.push(5, 50)
      expect(heap.toArray()).toEqual([{ key: 5, value: 50 }])
    })

    it('should handle entries with same key', () => {
      heap.push(5, 10)
      heap.push(5, 20)
      const arr = heap.toArray()
      expect(arr).toHaveLength(2)
      expect(arr.every((e) => e.key === 5)).toBe(true)
    })
  })

  describe('clone', () => {
    it('should create an independent copy', () => {
      heap.push(1, 10)
      heap.push(2, 20)
      const cloned = heap.clone()
      expect(cloned.size()).toBe(2)
      expect(cloned.peek()).toEqual(heap.peek())
    })

    it('should not affect original when modified', () => {
      heap.push(1, 10)
      heap.push(2, 20)
      const cloned = heap.clone()
      cloned.pop()
      expect(heap.size()).toBe(2)
      expect(cloned.size()).toBe(1)
    })

    it('should clone an empty heap', () => {
      const cloned = heap.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should preserve entries', () => {
      heap.push(1, 10)
      heap.push(2, 20)
      heap.push(3, 30)
      const cloned = heap.clone()
      expect(cloned.toArray()).toEqual(heap.toArray())
    })

    it('should not affect original on clear', () => {
      heap.push(1, 10)
      const cloned = heap.clone()
      cloned.clear()
      expect(heap.size()).toBe(1)
      expect(cloned.size()).toBe(0)
    })

    it('should preserve has/get state', () => {
      heap.push(5, 50)
      const cloned = heap.clone()
      expect(cloned.has(5)).toBe(true)
      expect(cloned.get(5)).toBe(50)
    })

    it('should preserve lastPoppedKey', () => {
      heap.push(1, 10)
      heap.push(5, 50)
      heap.pop()
      const cloned = heap.clone()
      expect(() => cloned.push(0, 30)).toThrow()
    })

    it('should allow push on clone after pop on original', () => {
      heap.push(1, 10)
      const cloned = heap.clone()
      heap.pop()
      cloned.push(5, 50)
      expect(cloned.size()).toBe(2)
    })
  })

  describe('minKey', () => {
    it('should return undefined on empty heap', () => {
      expect(heap.minKey()).toBeUndefined()
    })

    it('should return the minimum key', () => {
      heap.push(5, 50)
      heap.push(1, 10)
      heap.push(3, 30)
      expect(heap.minKey()).toBe(1)
    })

    it('should return the only key', () => {
      heap.push(7, 70)
      expect(heap.minKey()).toBe(7)
    })

    it('should return 0 for key 0', () => {
      heap.push(0, 42)
      heap.push(5, 50)
      expect(heap.minKey()).toBe(0)
    })

    it('should update after pop', () => {
      heap.push(1, 10)
      heap.push(5, 50)
      heap.pop()
      expect(heap.minKey()).toBe(5)
    })
  })

  describe('maxKey', () => {
    it('should return undefined on empty heap', () => {
      expect(heap.maxKey()).toBeUndefined()
    })

    it('should return the maximum key', () => {
      heap.push(5, 50)
      heap.push(1, 10)
      heap.push(10, 100)
      expect(heap.maxKey()).toBe(10)
    })

    it('should return the only key', () => {
      heap.push(7, 70)
      expect(heap.maxKey()).toBe(7)
    })

    it('should update after pop', () => {
      heap.push(1, 10)
      heap.push(5, 50)
      heap.pop()
      expect(heap.maxKey()).toBe(5)
    })
  })

  describe('drain', () => {
    it('should return empty array for empty heap', () => {
      expect(heap.drain()).toEqual([])
    })

    it('should return all entries in sorted order', () => {
      heap.push(3, 30)
      heap.push(1, 10)
      heap.push(2, 20)
      const drained = heap.drain()
      expect(drained[0].key).toBe(1)
      expect(drained[1].key).toBe(2)
      expect(drained[2].key).toBe(3)
    })

    it('should empty the heap', () => {
      heap.push(1, 10)
      heap.push(2, 20)
      heap.drain()
      expect(heap.isEmpty()).toBe(true)
      expect(heap.size()).toBe(0)
    })

    it('should handle single element', () => {
      heap.push(5, 50)
      expect(heap.drain()).toEqual([{ key: 5, value: 50 }])
    })

    it('should not affect subsequent operations', () => {
      heap.push(1, 10)
      heap.drain()
      heap.push(5, 50)
      expect(heap.size()).toBe(1)
      expect(heap.pop()).toEqual({ key: 5, value: 50 })
    })
  })

  describe('static fromEntries', () => {
    it('should create heap from entries', () => {
      const h = RadixHeap.fromEntries([
        [1, 10],
        [2, 20],
        [3, 30],
      ])
      expect(h.size()).toBe(3)
    })

    it('should create empty heap from empty array', () => {
      const h = RadixHeap.fromEntries([])
      expect(h.size()).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('should create heap that pops in correct order', () => {
      const h = RadixHeap.fromEntries([
        [3, 30],
        [1, 10],
        [2, 20],
      ])
      expect(h.pop()).toEqual({ key: 1, value: 10 })
      expect(h.pop()).toEqual({ key: 2, value: 20 })
      expect(h.pop()).toEqual({ key: 3, value: 30 })
    })

    it('should handle single entry', () => {
      const h = RadixHeap.fromEntries([[5, 50]])
      expect(h.size()).toBe(1)
      expect(h.pop()).toEqual({ key: 5, value: 50 })
    })

    it('should handle entries with same keys', () => {
      const h = RadixHeap.fromEntries([
        [5, 10],
        [5, 20],
      ])
      expect(h.size()).toBe(2)
    })

    it('should create independent heap', () => {
      const entries: [number, number][] = [
        [1, 10],
        [2, 20],
      ]
      const h = RadixHeap.fromEntries(entries)
      h.pop()
      expect(entries).toHaveLength(2)
    })

    it('should create heap that supports has/get', () => {
      const h = RadixHeap.fromEntries([
        [5, 50],
        [10, 100],
      ])
      expect(h.has(5)).toBe(true)
      expect(h.get(10)).toBe(100)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_RADIX_HEAP_OPTIONS', () => {
      expect(DEFAULT_RADIX_HEAP_OPTIONS).toBeDefined()
      expect(DEFAULT_RADIX_HEAP_OPTIONS.maxKey).toBeGreaterThan(0)
    })

    it('should export RadixHeapEntry type', () => {
      const entry: RadixHeapEntry = { key: 1, value: 10 }
      expect(entry.key).toBe(1)
      expect(entry.value).toBe(10)
    })

    it('should export RadixHeapOptions type', () => {
      const opts: RadixHeapOptions = DEFAULT_RADIX_HEAP_OPTIONS
      expect(opts.maxKey).toBeDefined()
    })
  })

  describe('monotone property', () => {
    it('should enforce monotone push after pop', () => {
      heap.push(10, 1)
      heap.pop()
      expect(() => heap.push(5, 2)).toThrow()
    })

    it('should allow push after pop with same key', () => {
      heap.push(10, 1)
      heap.pop()
      heap.push(10, 2)
      expect(heap.size()).toBe(1)
    })

    it('should allow push after pop with larger key', () => {
      heap.push(10, 1)
      heap.pop()
      heap.push(20, 2)
      expect(heap.size()).toBe(1)
    })

    it('should enforce monotone across multiple pops', () => {
      heap.push(1, 1)
      heap.push(5, 2)
      heap.push(10, 3)
      heap.pop()
      heap.pop()
      expect(() => heap.push(3, 4)).toThrow()
      expect(() => heap.push(5, 4)).not.toThrow()
    })
  })

  describe('edge cases', () => {
    it('should handle key 0', () => {
      heap.push(0, 42)
      expect(heap.pop()).toEqual({ key: 0, value: 42 })
    })

    it('should handle large number of entries', () => {
      const n = 500
      for (let i = 0; i < n; i++) {
        heap.push(i, i * 10)
      }
      expect(heap.size()).toBe(n)
      const drained = heap.drain()
      expect(drained).toHaveLength(n)
      for (let i = 0; i < n; i++) {
        expect(drained[i].key).toBe(i)
      }
    })

    it('should handle negative values', () => {
      heap.push(1, -10)
      heap.push(2, -20)
      expect(heap.pop()).toEqual({ key: 1, value: -10 })
    })

    it('should handle value 0', () => {
      heap.push(1, 0)
      expect(heap.get(1)).toBe(0)
    })

    it('should handle alternating push and pop', () => {
      heap.push(1, 10)
      expect(heap.pop()).toEqual({ key: 1, value: 10 })
      heap.push(2, 20)
      heap.push(3, 30)
      expect(heap.pop()).toEqual({ key: 2, value: 20 })
      expect(heap.pop()).toEqual({ key: 3, value: 30 })
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle clear and reuse', () => {
      heap.push(1, 10)
      heap.push(2, 20)
      heap.clear()
      expect(heap.isEmpty()).toBe(true)
      heap.push(100, 1)
      heap.push(200, 2)
      expect(heap.pop()).toEqual({ key: 100, value: 1 })
    })

    it('should handle drain and reuse', () => {
      heap.push(1, 10)
      heap.drain()
      heap.push(5, 50)
      expect(heap.size()).toBe(1)
      expect(heap.pop()).toEqual({ key: 5, value: 50 })
    })

    it('should handle clone of empty heap', () => {
      const c = heap.clone()
      expect(c.size()).toBe(0)
      c.push(1, 10)
      expect(c.size()).toBe(1)
    })

    it('should handle large key gap', () => {
      heap.push(1, 10)
      heap.push(1000000, 20)
      const drained = heap.drain()
      expect(drained[0].key).toBe(1)
      expect(drained[1].key).toBe(1000000)
    })

    it('should handle toArray not modifying heap', () => {
      heap.push(3, 30)
      heap.push(1, 10)
      heap.push(2, 20)
      const arr = heap.toArray()
      expect(arr).toHaveLength(3)
      expect(heap.size()).toBe(3)
      expect(heap.isEmpty()).toBe(false)
    })

    it('should handle sequential pops preserving order', () => {
      for (let i = 1; i <= 20; i++) {
        heap.push(i, i)
      }
      let prev = -1
      while (!heap.isEmpty()) {
        const entry = heap.pop()!
        expect(entry.key).toBeGreaterThan(prev)
        prev = entry.key
      }
    })
  })

  describe('integration', () => {
    it('should work as Dijkstra-like priority queue', () => {
      heap.push(0, 0)
      heap.push(3, 1)
      heap.push(1, 2)
      heap.push(2, 3)
      heap.push(5, 4)
      const results: number[] = []
      while (!heap.isEmpty()) {
        results.push(heap.pop()!.value)
      }
      expect(results).toEqual([0, 2, 3, 1, 4])
    })

    it('should handle update then drain', () => {
      heap.push(1, 10)
      heap.push(2, 20)
      heap.push(3, 30)
      heap.update(2, 99)
      const drained = heap.drain()
      expect(drained).toContainEqual({ key: 2, value: 99 })
    })

    it('should handle fromEntries then clone', () => {
      const h = RadixHeap.fromEntries([
        [1, 10],
        [2, 20],
      ])
      const c = h.clone()
      expect(c.size()).toBe(2)
      expect(c.pop()).toEqual({ key: 1, value: 10 })
    })

    it('should handle fromEntries then toArray', () => {
      const h = RadixHeap.fromEntries([
        [3, 30],
        [1, 10],
        [2, 20],
      ])
      const arr = h.toArray()
      expect(arr[0].key).toBe(1)
      expect(arr[1].key).toBe(2)
      expect(arr[2].key).toBe(3)
    })

    it('should handle multiple cycles of push-pop-clear', () => {
      for (let cycle = 0; cycle < 5; cycle++) {
        for (let i = 0; i < 10; i++) {
          heap.push(i, cycle * 10 + i)
        }
        expect(heap.size()).toBe(10)
        const first = heap.pop()
        expect(first!.key).toBe(0)
        heap.clear()
        expect(heap.size()).toBe(0)
      }
    })

    it('should handle mixed operations', () => {
      heap.push(1, 10)
      heap.push(3, 30)
      expect(heap.has(1)).toBe(true)
      expect(heap.get(3)).toBe(30)
      heap.update(1, 15)
      expect(heap.get(1)).toBe(15)
      const entry = heap.pop()
      expect(entry).toEqual({ key: 1, value: 15 })
      expect(heap.has(1)).toBe(false)
      heap.push(5, 50)
      expect(heap.size()).toBe(2)
      const drained = heap.drain()
      expect(drained).toHaveLength(2)
    })
  })
})
