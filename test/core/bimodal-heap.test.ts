import { describe, it, expect, beforeEach } from 'vitest'
import { BimodalHeap } from '../../src/core/bimodal-heap/bimodal-heap.js'
import { defaultComparator } from '../../src/core/bimodal-heap/types.js'
import type { BimodalHeapOptions, HeapEntry } from '../../src/core/bimodal-heap/types.js'


describe('BimodalHeap', () => {
  let heap: BimodalHeap<number>

  beforeEach(() => {
    heap = new BimodalHeap<number>()
  })

  describe('constructor', () => {
    it('should create empty heap', () => {
      const h = new BimodalHeap<number>()
      expect(h.size()).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('should accept custom comparator', () => {
      const h = new BimodalHeap<number>({ comparator: (a, b) => b - a })
      h.insert(1)
      h.insert(2)
      h.insert(3)
      expect(h.findMin()).toBe(3)
      expect(h.findMax()).toBe(1)
    })

    it('should accept no options', () => {
      const h = new BimodalHeap()
      h.insert(5)
      expect(h.findMin()).toBe(5)
      expect(h.findMax()).toBe(5)
    })

    it('should use default comparator when none provided', () => {
      expect(defaultComparator(1, 2)).toBe(-1)
      expect(defaultComparator(2, 1)).toBe(1)
      expect(defaultComparator(1, 1)).toBe(0)
    })

    it('should work with string type', () => {
      const h = new BimodalHeap<string>()
      h.insert('banana')
      h.insert('apple')
      h.insert('cherry')
      expect(h.findMin()).toBe('apple')
      expect(h.findMax()).toBe('cherry')
    })
  })

  describe('insert', () => {
    it('should insert single element', () => {
      heap.insert(42)
      expect(heap.size()).toBe(1)
      expect(heap.isEmpty()).toBe(false)
    })

    it('should insert multiple elements', () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.size()).toBe(3)
    })

    it('should insert duplicate values', () => {
      heap.insert(5)
      heap.insert(5)
      heap.insert(5)
      expect(heap.size()).toBe(3)
      expect(heap.findMin()).toBe(5)
      expect(heap.findMax()).toBe(5)
    })

    it('should insert negative numbers', () => {
      heap.insert(-5)
      heap.insert(-10)
      heap.insert(3)
      expect(heap.findMin()).toBe(-10)
      expect(heap.findMax()).toBe(3)
    })

    it('should insert zero', () => {
      heap.insert(0)
      expect(heap.findMin()).toBe(0)
      expect(heap.findMax()).toBe(0)
    })

    it('should insert in ascending order', () => {
      for (let i = 1; i <= 10; i++) heap.insert(i)
      expect(heap.findMin()).toBe(1)
      expect(heap.findMax()).toBe(10)
    })

    it('should insert in descending order', () => {
      for (let i = 10; i >= 1; i--) heap.insert(i)
      expect(heap.findMin()).toBe(1)
      expect(heap.findMax()).toBe(10)
    })

    it('should handle many inserts', () => {
      for (let i = 0; i < 100; i++) heap.insert(i)
      expect(heap.size()).toBe(100)
      expect(heap.findMin()).toBe(0)
      expect(heap.findMax()).toBe(99)
    })
  })

  describe('findMin', () => {
    it('should return undefined on empty heap', () => {
      expect(heap.findMin()).toBeUndefined()
    })

    it('should return only element', () => {
      heap.insert(42)
      expect(heap.findMin()).toBe(42)
    })

    it('should return minimum of multiple elements', () => {
      heap.insert(10)
      heap.insert(5)
      heap.insert(20)
      expect(heap.findMin()).toBe(5)
    })

    it('should not remove element', () => {
      heap.insert(10)
      heap.insert(5)
      heap.findMin()
      expect(heap.size()).toBe(2)
      expect(heap.findMin()).toBe(5)
    })

    it('should update after insertions', () => {
      heap.insert(10)
      expect(heap.findMin()).toBe(10)
      heap.insert(3)
      expect(heap.findMin()).toBe(3)
      heap.insert(1)
      expect(heap.findMin()).toBe(1)
    })
  })

  describe('findMax', () => {
    it('should return undefined on empty heap', () => {
      expect(heap.findMax()).toBeUndefined()
    })

    it('should return only element', () => {
      heap.insert(42)
      expect(heap.findMax()).toBe(42)
    })

    it('should return maximum of multiple elements', () => {
      heap.insert(10)
      heap.insert(50)
      heap.insert(20)
      expect(heap.findMax()).toBe(50)
    })

    it('should not remove element', () => {
      heap.insert(10)
      heap.insert(50)
      heap.findMax()
      expect(heap.size()).toBe(2)
      expect(heap.findMax()).toBe(50)
    })

    it('should update after insertions', () => {
      heap.insert(10)
      expect(heap.findMax()).toBe(10)
      heap.insert(30)
      expect(heap.findMax()).toBe(30)
      heap.insert(100)
      expect(heap.findMax()).toBe(100)
    })
  })

  describe('deleteMin', () => {
    it('should return undefined on empty heap', () => {
      expect(heap.deleteMin()).toBeUndefined()
    })

    it('should remove and return single element', () => {
      heap.insert(42)
      expect(heap.deleteMin()).toBe(42)
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should remove minimum element', () => {
      heap.insert(10)
      heap.insert(5)
      heap.insert(20)
      expect(heap.deleteMin()).toBe(5)
      expect(heap.size()).toBe(2)
      expect(heap.findMin()).toBe(10)
    })

    it('should remove all elements in order', () => {
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      expect(heap.deleteMin()).toBe(1)
      expect(heap.deleteMin()).toBe(2)
      expect(heap.deleteMin()).toBe(3)
      expect(heap.deleteMin()).toBeUndefined()
    })

    it('should maintain max after deleting min', () => {
      heap.insert(10)
      heap.insert(5)
      heap.insert(20)
      heap.deleteMin()
      expect(heap.findMax()).toBe(20)
    })

    it('should handle interleaved deleteMin and deleteMax', () => {
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      expect(heap.deleteMin()).toBe(1)
      expect(heap.deleteMax()).toBe(5)
      expect(heap.deleteMin()).toBe(3)
    })
  })

  describe('deleteMax', () => {
    it('should return undefined on empty heap', () => {
      expect(heap.deleteMax()).toBeUndefined()
    })

    it('should remove and return single element', () => {
      heap.insert(42)
      expect(heap.deleteMax()).toBe(42)
      expect(heap.size()).toBe(0)
    })

    it('should remove maximum element', () => {
      heap.insert(10)
      heap.insert(50)
      heap.insert(20)
      expect(heap.deleteMax()).toBe(50)
      expect(heap.size()).toBe(2)
      expect(heap.findMax()).toBe(20)
    })

    it('should remove all elements in reverse order', () => {
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      expect(heap.deleteMax()).toBe(3)
      expect(heap.deleteMax()).toBe(2)
      expect(heap.deleteMax()).toBe(1)
      expect(heap.deleteMax()).toBeUndefined()
    })

    it('should maintain min after deleting max', () => {
      heap.insert(10)
      heap.insert(5)
      heap.insert(20)
      heap.deleteMax()
      expect(heap.findMin()).toBe(5)
    })
  })

  describe('contains', () => {
    it('should return false on empty heap', () => {
      expect(heap.contains(1)).toBe(false)
    })

    it('should find existing element', () => {
      heap.insert(42)
      expect(heap.contains(42)).toBe(true)
    })

    it('should return false for missing element', () => {
      heap.insert(42)
      expect(heap.contains(99)).toBe(false)
    })

    it('should find element among many', () => {
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      expect(heap.contains(20)).toBe(true)
    })

    it('should not find deleted min element', () => {
      heap.insert(10)
      heap.insert(20)
      heap.deleteMin()
      expect(heap.contains(10)).toBe(false)
      expect(heap.contains(20)).toBe(true)
    })

    it('should not find deleted max element', () => {
      heap.insert(10)
      heap.insert(20)
      heap.deleteMax()
      expect(heap.contains(20)).toBe(false)
      expect(heap.contains(10)).toBe(true)
    })

    it('should find duplicate values', () => {
      heap.insert(5)
      heap.insert(5)
      heap.deleteMin()
      expect(heap.contains(5)).toBe(true)
    })
  })

  describe('delete', () => {
    it('should return false on empty heap', () => {
      expect(heap.delete(1)).toBe(false)
    })

    it('should delete existing element', () => {
      heap.insert(42)
      expect(heap.delete(42)).toBe(true)
      expect(heap.size()).toBe(0)
    })

    it('should return false for missing element', () => {
      heap.insert(42)
      expect(heap.delete(99)).toBe(false)
      expect(heap.size()).toBe(1)
    })

    it('should delete middle element', () => {
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      expect(heap.delete(20)).toBe(true)
      expect(heap.size()).toBe(2)
      expect(heap.contains(20)).toBe(false)
    })

    it('should delete min element', () => {
      heap.insert(10)
      heap.insert(20)
      expect(heap.delete(10)).toBe(true)
      expect(heap.findMin()).toBe(20)
    })

    it('should delete max element', () => {
      heap.insert(10)
      heap.insert(20)
      expect(heap.delete(20)).toBe(true)
      expect(heap.findMax()).toBe(10)
    })

    it('should delete first occurrence of duplicate', () => {
      heap.insert(5)
      heap.insert(5)
      expect(heap.delete(5)).toBe(true)
      expect(heap.size()).toBe(1)
      expect(heap.contains(5)).toBe(true)
    })
  })

  describe('replaceMin', () => {
    it('should replace min and return old value', () => {
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      const old = heap.replaceMin(5)
      expect(old).toBe(10)
      expect(heap.findMin()).toBe(5)
      expect(heap.size()).toBe(3)
    })

    it('should work with single element', () => {
      heap.insert(10)
      const old = heap.replaceMin(5)
      expect(old).toBe(10)
      expect(heap.findMin()).toBe(5)
      expect(heap.size()).toBe(1)
    })

    it('should maintain correct max after replaceMin', () => {
      heap.insert(10)
      heap.insert(30)
      heap.replaceMin(5)
      expect(heap.findMax()).toBe(30)
    })

    it('should allow replacing with larger value', () => {
      heap.insert(10)
      heap.insert(20)
      const old = heap.replaceMin(100)
      expect(old).toBe(10)
      expect(heap.findMin()).toBe(20)
      expect(heap.findMax()).toBe(100)
    })
  })

  describe('replaceMax', () => {
    it('should replace max and return old value', () => {
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      const old = heap.replaceMax(50)
      expect(old).toBe(30)
      expect(heap.findMax()).toBe(50)
      expect(heap.size()).toBe(3)
    })

    it('should work with single element', () => {
      heap.insert(10)
      const old = heap.replaceMax(5)
      expect(old).toBe(10)
      expect(heap.findMax()).toBe(5)
      expect(heap.size()).toBe(1)
    })

    it('should maintain correct min after replaceMax', () => {
      heap.insert(10)
      heap.insert(30)
      heap.replaceMax(50)
      expect(heap.findMin()).toBe(10)
    })

    it('should allow replacing with smaller value', () => {
      heap.insert(10)
      heap.insert(30)
      const old = heap.replaceMax(1)
      expect(old).toBe(30)
      expect(heap.findMin()).toBe(1)
      expect(heap.findMax()).toBe(10)
    })
  })

  describe('merge', () => {
    it('should merge two empty heaps', () => {
      const other = new BimodalHeap<number>()
      heap.merge(other)
      expect(heap.size()).toBe(0)
    })

    it('should merge into empty heap', () => {
      const other = new BimodalHeap<number>()
      other.insert(1)
      other.insert(2)
      heap.merge(other)
      expect(heap.size()).toBe(2)
      expect(heap.findMin()).toBe(1)
      expect(heap.findMax()).toBe(2)
    })

    it('should merge empty into non-empty', () => {
      heap.insert(1)
      const other = new BimodalHeap<number>()
      heap.merge(other)
      expect(heap.size()).toBe(1)
    })

    it('should merge two non-empty heaps', () => {
      heap.insert(10)
      heap.insert(20)
      const other = new BimodalHeap<number>()
      other.insert(5)
      other.insert(30)
      heap.merge(other)
      expect(heap.size()).toBe(4)
      expect(heap.findMin()).toBe(5)
      expect(heap.findMax()).toBe(30)
    })

    it('should not modify source heap', () => {
      heap.insert(10)
      const other = new BimodalHeap<number>()
      other.insert(5)
      heap.merge(other)
      expect(other.size()).toBe(1)
      expect(other.findMin()).toBe(5)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      expect(heap.toArray()).toEqual([])
    })

    it('should return all elements', () => {
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      const arr = heap.toArray()
      expect(arr).toHaveLength(3)
      expect(arr).toContain(10)
      expect(arr).toContain(20)
      expect(arr).toContain(30)
    })

    it('should not include deleted elements', () => {
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      heap.deleteMin()
      const arr = heap.toArray()
      expect(arr).toHaveLength(2)
      expect(arr).not.toContain(10)
    })

    it('should return copy not reference', () => {
      heap.insert(10)
      const arr = heap.toArray()
      arr.push(99)
      expect(heap.size()).toBe(1)
    })
  })

  describe('fromArray', () => {
    it('should create heap from empty array', () => {
      heap.fromArray([])
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should create heap from single element', () => {
      heap.fromArray([42])
      expect(heap.size()).toBe(1)
      expect(heap.findMin()).toBe(42)
      expect(heap.findMax()).toBe(42)
    })

    it('should create heap from multiple elements', () => {
      heap.fromArray([30, 10, 20])
      expect(heap.size()).toBe(3)
      expect(heap.findMin()).toBe(10)
      expect(heap.findMax()).toBe(30)
    })

    it('should clear existing elements', () => {
      heap.insert(100)
      heap.fromArray([1, 2, 3])
      expect(heap.size()).toBe(3)
      expect(heap.contains(100)).toBe(false)
    })

    it('should handle unsorted input', () => {
      heap.fromArray([5, 1, 4, 2, 3])
      expect(heap.findMin()).toBe(1)
      expect(heap.findMax()).toBe(5)
    })
  })

  describe('size and isEmpty', () => {
    it('should track size correctly', () => {
      expect(heap.size()).toBe(0)
      heap.insert(1)
      expect(heap.size()).toBe(1)
      heap.insert(2)
      expect(heap.size()).toBe(2)
    })

    it('should track isEmpty correctly', () => {
      expect(heap.isEmpty()).toBe(true)
      heap.insert(1)
      expect(heap.isEmpty()).toBe(false)
      heap.deleteMin()
      expect(heap.isEmpty()).toBe(true)
    })

    it('should update size on delete', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.deleteMin()
      expect(heap.size()).toBe(2)
      heap.deleteMax()
      expect(heap.size()).toBe(1)
    })
  })

  describe('clear', () => {
    it('should clear empty heap', () => {
      heap.clear()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should clear non-empty heap', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.clear()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
      expect(heap.findMin()).toBeUndefined()
      expect(heap.findMax()).toBeUndefined()
    })

    it('should allow reuse after clear', () => {
      heap.insert(1)
      heap.clear()
      heap.insert(2)
      expect(heap.size()).toBe(1)
      expect(heap.findMin()).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('should handle alternating deleteMin and deleteMax', () => {
      for (let i = 1; i <= 6; i++) heap.insert(i)
      expect(heap.deleteMin()).toBe(1)
      expect(heap.deleteMax()).toBe(6)
      expect(heap.deleteMin()).toBe(2)
      expect(heap.deleteMax()).toBe(5)
      expect(heap.deleteMin()).toBe(3)
      expect(heap.deleteMax()).toBe(4)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle all same values', () => {
      for (let i = 0; i < 5; i++) heap.insert(42)
      expect(heap.findMin()).toBe(42)
      expect(heap.findMax()).toBe(42)
      expect(heap.deleteMin()).toBe(42)
      expect(heap.deleteMax()).toBe(42)
      expect(heap.size()).toBe(3)
    })

    it('should handle many duplicates with different values', () => {
      for (let i = 0; i < 10; i++) {
        heap.insert(1)
        heap.insert(100)
      }
      expect(heap.size()).toBe(20)
      expect(heap.findMin()).toBe(1)
      expect(heap.findMax()).toBe(100)
    })

    it('should handle floating point numbers', () => {
      heap.insert(1.5)
      heap.insert(2.7)
      heap.insert(0.3)
      expect(heap.findMin()).toBeCloseTo(0.3)
      expect(heap.findMax()).toBeCloseTo(2.7)
    })

    it('should handle very large numbers', () => {
      heap.insert(Number.MAX_SAFE_INTEGER)
      heap.insert(Number.MIN_SAFE_INTEGER)
      heap.insert(0)
      expect(heap.findMin()).toBe(Number.MIN_SAFE_INTEGER)
      expect(heap.findMax()).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('should handle delete then reinsert', () => {
      heap.insert(10)
      heap.deleteMin()
      expect(heap.isEmpty()).toBe(true)
      heap.insert(20)
      expect(heap.findMin()).toBe(20)
      expect(heap.findMax()).toBe(20)
    })

    it('should handle replaceMin on heap where min was already deleted from other heap', () => {
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      heap.delete(10)
      const old = heap.replaceMin(5)
      expect(old).toBe(20)
    })

    it('should handle replaceMax on heap where max was already deleted', () => {
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      heap.delete(30)
      const old = heap.replaceMax(50)
      expect(old).toBe(20)
    })
  })

  describe('object comparator', () => {
    interface Person {
      name: string
      age: number
    }

    it('should work with custom object comparator', () => {
      const h = new BimodalHeap<Person>({
        comparator: (a, b) => a.age - b.age,
      })
      h.insert({ name: 'Alice', age: 30 })
      h.insert({ name: 'Bob', age: 20 })
      h.insert({ name: 'Charlie', age: 40 })
      expect(h.findMin()!.name).toBe('Bob')
      expect(h.findMax()!.name).toBe('Charlie')
    })

    it('should delete with custom comparator', () => {
      const h = new BimodalHeap<Person>({
        comparator: (a, b) => a.age - b.age,
      })
      const alice = { name: 'Alice', age: 30 }
      const bob = { name: 'Bob', age: 20 }
      h.insert(alice)
      h.insert(bob)
      expect(h.deleteMin()!.name).toBe('Bob')
      expect(h.size()).toBe(1)
    })

    it('should replaceMin with custom comparator', () => {
      const h = new BimodalHeap<Person>({
        comparator: (a, b) => a.age - b.age,
      })
      h.insert({ name: 'Alice', age: 30 })
      h.insert({ name: 'Bob', age: 20 })
      const old = h.replaceMin({ name: 'Dave', age: 10 })
      expect(old.name).toBe('Bob')
      expect(h.findMin()!.name).toBe('Dave')
    })
  })

  describe('stress tests', () => {
    it('should handle 1000 elements', () => {
      for (let i = 0; i < 1000; i++) {
        heap.insert(Math.random() * 10000)
      }
      expect(heap.size()).toBe(1000)
      const min = heap.findMin()!
      const max = heap.findMax()!
      expect(min).toBeLessThanOrEqual(max)
    })

    it('should extract all in sorted order via deleteMin', () => {
      const values = []
      for (let i = 0; i < 100; i++) {
        values.push(Math.floor(Math.random() * 1000))
      }
      heap.fromArray(values)
      const sorted = [...values].sort((a, b) => a - b)
      for (let i = 0; i < sorted.length; i++) {
        expect(heap.deleteMin()).toBe(sorted[i])
      }
      expect(heap.isEmpty()).toBe(true)
    })

    it('should extract all in reverse sorted order via deleteMax', () => {
      const values = []
      for (let i = 0; i < 100; i++) {
        values.push(Math.floor(Math.random() * 1000))
      }
      heap.fromArray(values)
      const sorted = [...values].sort((a, b) => b - a)
      for (let i = 0; i < sorted.length; i++) {
        expect(heap.deleteMax()).toBe(sorted[i])
      }
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle mixed deleteMin and deleteMax', () => {
      const values = [5, 3, 8, 1, 9, 2, 7, 4, 6, 10]
      heap.fromArray(values)
      const sorted = [...values].sort((a, b) => a - b)
      let lo = 0
      let hi = sorted.length - 1
      for (let i = 0; i < values.length; i++) {
        if (i % 2 === 0) {
          expect(heap.deleteMin()).toBe(sorted[lo])
          lo++
        } else {
          expect(heap.deleteMax()).toBe(sorted[hi])
          hi--
        }
      }
    })

    it('should handle many delete operations triggering cleanup', () => {
      for (let i = 0; i < 200; i++) heap.insert(i)
      for (let i = 0; i < 100; i++) heap.deleteMin()
      expect(heap.size()).toBe(100)
      expect(heap.findMin()).toBe(100)
      expect(heap.findMax()).toBe(199)
    })

    it('should handle random operations', () => {
      const rng = (seed: number) => () => {
        seed = (seed * 1664525 + 1013904223) & 0x7fffffff
        return seed / 0x7fffffff
      }
      const rand = rng(42)
      const reference: number[] = []

      for (let i = 0; i < 500; i++) {
        const op = rand()
        if (op < 0.4) {
          const val = Math.floor(rand() * 1000)
          heap.insert(val)
          reference.push(val)
        } else if (op < 0.55 && reference.length > 0) {
          reference.sort((a, b) => a - b)
          const expected = reference.shift()!
          expect(heap.deleteMin()).toBe(expected)
        } else if (op < 0.7 && reference.length > 0) {
          reference.sort((a, b) => a - b)
          const expected = reference.pop()!
          expect(heap.deleteMax()).toBe(expected)
        } else if (op < 0.8 && reference.length > 0) {
          const idx = Math.floor(rand() * reference.length)
          const val = reference[idx]!
          expect(heap.delete(val)).toBe(true)
          reference.splice(idx, 1)
        } else if (op < 0.85) {
          expect(heap.isEmpty()).toBe(reference.length === 0)
        } else if (op < 0.9) {
          expect(heap.size()).toBe(reference.length)
        } else if (op < 0.95 && reference.length > 0) {
          expect(heap.contains(reference[Math.floor(rand() * reference.length)]!)).toBe(true)
        } else {
          heap.toArray()
        }
      }
    })

    it('should handle delete followed by many operations', () => {
      for (let i = 0; i < 50; i++) heap.insert(i)
      for (let i = 0; i < 25; i++) heap.delete(i * 2)
      for (let i = 100; i < 150; i++) heap.insert(i)
      expect(heap.size()).toBe(75)
    })

    it('should handle merge with large heaps', () => {
      for (let i = 0; i < 100; i++) heap.insert(i)
      const other = new BimodalHeap<number>()
      for (let i = 100; i < 200; i++) other.insert(i)
      heap.merge(other)
      expect(heap.size()).toBe(200)
      expect(heap.findMin()).toBe(0)
      expect(heap.findMax()).toBe(199)
    })

    it('should handle fromArray with large dataset', () => {
      const values = Array.from({ length: 500 }, (_, i) => 500 - i)
      heap.fromArray(values)
      expect(heap.size()).toBe(500)
      expect(heap.findMin()).toBe(1)
      expect(heap.findMax()).toBe(500)
    })

    it('should handle alternating replaceMin and replaceMax', () => {
      heap.insert(50)
      for (let i = 1; i <= 20; i++) {
        if (i % 2 === 0) {
          heap.replaceMin(i * -1)
        } else {
          heap.replaceMax(i * 10)
        }
      }
      expect(heap.size()).toBe(1)
    })
  })

  describe('lazy deletion cleanup', () => {
    it('should correctly handle deleted entries in min heap', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.delete(2)
      expect(heap.size()).toBe(2)
      expect(heap.contains(2)).toBe(false)
      expect(heap.findMin()).toBe(1)
      expect(heap.findMax()).toBe(3)
    })

    it('should correctly handle deleted entries in max heap', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.delete(3)
      expect(heap.findMax()).toBe(2)
    })

    it('should handle deleting all elements via delete()', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.delete(2)
      heap.delete(1)
      heap.delete(3)
      expect(heap.isEmpty()).toBe(true)
      expect(heap.size()).toBe(0)
    })

    it('should handle cleanup after many lazy deletions', () => {
      for (let i = 0; i < 100; i++) heap.insert(i)
      for (let i = 0; i < 50; i++) heap.delete(i)
      expect(heap.size()).toBe(50)
      expect(heap.findMin()).toBe(50)
    })
  })

  describe('HeapEntry type', () => {
    it('should export HeapEntry interface', () => {
      const entry: HeapEntry<number> = { id: 1, value: 42 }
      expect(entry.id).toBe(1)
      expect(entry.value).toBe(42)
    })
  })

  describe('BimodalHeapOptions type', () => {
    it('should accept empty options', () => {
      const opts: BimodalHeapOptions<number> = {}
      const h = new BimodalHeap<number>(opts)
      h.insert(1)
      expect(h.findMin()).toBe(1)
    })

    it('should accept comparator option', () => {
      const opts: BimodalHeapOptions<number> = {
        comparator: (a, b) => b - a,
      }
      const h = new BimodalHeap<number>(opts)
      h.insert(1)
      h.insert(2)
      expect(h.findMin()).toBe(2)
      expect(h.findMax()).toBe(1)
    })
  })

  describe('delete value by value method', () => {
    it('should delete value that is both min and max (only element)', () => {
      heap.insert(42)
      expect(heap.delete(42)).toBe(true)
      expect(heap.isEmpty()).toBe(true)
      expect(heap.findMin()).toBeUndefined()
      expect(heap.findMax()).toBeUndefined()
    })

    it('should not affect other elements when deleting', () => {
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      heap.delete(20)
      expect(heap.findMin()).toBe(10)
      expect(heap.findMax()).toBe(30)
      expect(heap.size()).toBe(2)
    })

    it('should handle delete of non-existent after modifications', () => {
      heap.insert(10)
      heap.insert(20)
      heap.deleteMin()
      expect(heap.delete(10)).toBe(false)
      expect(heap.delete(20)).toBe(true)
    })
  })

  describe('replaceMin edge cases', () => {
    it('should handle replacing with value smaller than all', () => {
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      heap.replaceMin(-100)
      expect(heap.findMin()).toBe(-100)
    })

    it('should handle replacing with value larger than max', () => {
      heap.insert(10)
      heap.insert(20)
      const old = heap.replaceMin(100)
      expect(old).toBe(10)
      expect(heap.findMax()).toBe(100)
    })
  })

  describe('replaceMax edge cases', () => {
    it('should handle replacing with value larger than all', () => {
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      heap.replaceMax(1000)
      expect(heap.findMax()).toBe(1000)
    })

    it('should handle replacing with value smaller than min', () => {
      heap.insert(10)
      heap.insert(20)
      const old = heap.replaceMax(-100)
      expect(old).toBe(20)
      expect(heap.findMin()).toBe(-100)
    })
  })

  describe('double ended extraction correctness', () => {
    it('should maintain heap property with many interleaved operations', () => {
      const inserted: number[] = []
      for (let i = 0; i < 20; i++) {
        const val = Math.floor(Math.random() * 100)
        heap.insert(val)
        inserted.push(val)
      }
      const sorted = [...inserted].sort((a, b) => a - b)
      let lo = 0
      let hi = sorted.length - 1
      let turn = 0
      while (lo <= hi) {
        if (turn % 2 === 0) {
          expect(heap.deleteMin()).toBe(sorted[lo])
          lo++
        } else {
          expect(heap.deleteMax()).toBe(sorted[hi])
          hi--
        }
        turn++
      }
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('clear and reuse', () => {
    it('should work correctly after multiple clear cycles', () => {
      for (let cycle = 0; cycle < 5; cycle++) {
        heap.insert(cycle * 10)
        heap.insert(cycle * 10 + 5)
        expect(heap.size()).toBe(2)
        heap.clear()
        expect(heap.isEmpty()).toBe(true)
      }
    })
  })

  describe('defaultComparator', () => {
    it('should be exported', () => {
      expect(typeof defaultComparator).toBe('function')
    })

    it('should compare numbers correctly', () => {
      expect(defaultComparator(1, 2)).toBe(-1)
      expect(defaultComparator(2, 1)).toBe(1)
      expect(defaultComparator(1, 1)).toBe(0)
    })

    it('should compare strings correctly', () => {
      expect(defaultComparator('a', 'b')).toBe(-1)
      expect(defaultComparator('b', 'a')).toBe(1)
      expect(defaultComparator('a', 'a')).toBe(0)
    })
  })
})
