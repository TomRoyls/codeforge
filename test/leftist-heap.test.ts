import { describe, it, expect } from 'vitest'
import { LeftistHeap } from '../src/core/leftist-heap/index.js'

describe('LeftistHeap', () => {
  describe('constructor', () => {
    it.skip('should create empty heap with no arguments', () => {
      const heap = new LeftistHeap<number>()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should create heap from array', () => {
      const heap = new LeftistHeap<number>([5, 3, 7, 1])
      expect(heap.size).toBe(4)
      expect(heap.peek()).toBe(1)
    })

    it('should create heap from empty array', () => {
      const heap = new LeftistHeap<number>([])
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should accept options with comparator', () => {
      const heap = new LeftistHeap<number>({ comparator: (a, b) => b - a })
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.peek()).toBe(7)
    })

    it('should accept array and options', () => {
      const heap = new LeftistHeap<number>([5, 3, 7], { comparator: (a, b) => b - a })
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(7)
    })

    it('should use default comparator for numbers', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.peek()).toBe(3)
    })

    it('should work with strings using default comparator', () => {
      const heap = new LeftistHeap<string>()
      heap.insert('zebra')
      heap.insert('apple')
      heap.insert('banana')
      expect(heap.peek()).toBe('apple')
    })
  })

  describe('insert', () => {
    it('should insert single element', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      expect(heap.size).toBe(1)
      expect(heap.isEmpty()).toBe(false)
      expect(heap.peek()).toBe(5)
    })

    it('should insert multiple elements', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.size).toBe(3)
    })

    it('should maintain min on insert', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      expect(heap.peek()).toBe(5)
      heap.insert(3)
      expect(heap.peek()).toBe(3)
      heap.insert(7)
      expect(heap.peek()).toBe(3)
      heap.insert(1)
      expect(heap.peek()).toBe(1)
    })

    it('should handle negative values', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(-5)
      heap.insert(-10)
      heap.insert(3)
      expect(heap.peek()).toBe(-10)
    })

    it('should handle zero', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(0)
      expect(heap.peek()).toBe(0)
    })

    it('should handle duplicate values', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      heap.insert(5)
      heap.insert(5)
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(5)
    })

    it('should handle floating point values', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(3.14)
      heap.insert(2.71)
      expect(heap.peek()).toBeCloseTo(2.71)
    })
  })

  describe('extractMin', () => {
    it('should throw on empty heap', () => {
      const heap = new LeftistHeap<number>()
      expect(() => heap.extractMin()).toThrow('extractMin called on empty heap')
    })

    it('should extract single element', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(10)
      const result = heap.extractMin()
      expect(result).toBe(10)
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should extract min from two elements', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      heap.insert(3)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(5)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should extract in sorted order', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      heap.insert(4)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(4)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(7)
    })

    it('should update size after extraction', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.extractMin()
      expect(heap.size).toBe(2)
      heap.extractMin()
      expect(heap.size).toBe(1)
    })

    it('should handle extract after many inserts', () => {
      const heap = new LeftistHeap<number>()
      for (let i = 50; i >= 1; i--) {
        heap.insert(i)
      }
      for (let i = 1; i <= 50; i++) {
        expect(heap.extractMin()).toBe(i)
      }
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle alternating insert and extract', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      heap.insert(3)
      expect(heap.extractMin()).toBe(3)
      heap.insert(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(5)
    })

    it('should handle duplicate values extraction', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(1)
      heap.insert(1)
      heap.insert(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(1)
    })
  })

  describe('peek', () => {
    it('should throw on empty heap', () => {
      const heap = new LeftistHeap<number>()
      expect(() => heap.peek()).toThrow('peek called on empty heap')
    })

    it('should return min without removing', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.peek()).toBe(3)
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(3)
    })

    it('should update after insert', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(10)
      expect(heap.peek()).toBe(10)
      heap.insert(5)
      expect(heap.peek()).toBe(5)
    })

    it('should update after extractMin', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.peek()).toBe(1)
      heap.extractMin()
      expect(heap.peek()).toBe(2)
    })
  })

  describe('size getter', () => {
    it('should return 0 on empty heap', () => {
      const heap = new LeftistHeap<number>()
      expect(heap.size).toBe(0)
    })

    it('should return 1 after single insert', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(1)
      expect(heap.size).toBe(1)
    })

    it('should return correct size after multiple inserts', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.size).toBe(3)
    })

    it('should decrease after extractMin', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.extractMin()
      expect(heap.size).toBe(1)
    })

    it('should return 0 after clear', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.clear()
      expect(heap.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true on new heap', () => {
      const heap = new LeftistHeap<number>()
      expect(heap.isEmpty()).toBe(true)
    })

    it('should return false after insert', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(1)
      expect(heap.isEmpty()).toBe(false)
    })

    it('should return true after all elements extracted', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.extractMin()
      heap.extractMin()
      expect(heap.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(1)
      heap.clear()
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should empty non-empty heap', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should clear heap with one element', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(1)
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should allow reuse after clear', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(1)
      heap.clear()
      heap.insert(5)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(5)
    })

    it('should handle clear on already empty heap', () => {
      const heap = new LeftistHeap<number>()
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('merge', () => {
    it('should merge two non-empty heaps', () => {
      const heap1 = new LeftistHeap<number>()
      const heap2 = new LeftistHeap<number>()
      heap1.insert(5)
      heap1.insert(10)
      heap2.insert(3)
      heap2.insert(7)
      const merged = heap1.merge(heap2)
      expect(merged.size).toBe(4)
      expect(merged.peek()).toBe(3)
      expect(heap1.size).toBe(2)
      expect(heap2.size).toBe(2)
    })

    it('should merge empty with non-empty', () => {
      const heap1 = new LeftistHeap<number>()
      const heap2 = new LeftistHeap<number>()
      heap2.insert(1)
      const merged = heap1.merge(heap2)
      expect(merged.size).toBe(1)
      expect(merged.peek()).toBe(1)
    })

    it('should merge non-empty with empty', () => {
      const heap1 = new LeftistHeap<number>()
      const heap2 = new LeftistHeap<number>()
      heap1.insert(1)
      const merged = heap1.merge(heap2)
      expect(merged.size).toBe(1)
    })

    it('should merge two empty heaps', () => {
      const heap1 = new LeftistHeap<number>()
      const heap2 = new LeftistHeap<number>()
      const merged = heap1.merge(heap2)
      expect(merged.size).toBe(0)
      expect(merged.isEmpty()).toBe(true)
    })

    it('should extract in order after merge', () => {
      const heap1 = new LeftistHeap<number>()
      const heap2 = new LeftistHeap<number>()
      heap1.insert(5)
      heap1.insert(1)
      heap2.insert(3)
      heap2.insert(2)
      heap2.insert(4)
      const merged = heap1.merge(heap2)
      expect(merged.extractMin()).toBe(1)
      expect(merged.extractMin()).toBe(2)
      expect(merged.extractMin()).toBe(3)
      expect(merged.extractMin()).toBe(4)
      expect(merged.extractMin()).toBe(5)
    })

    it('should not modify original heaps', () => {
      const heap1 = new LeftistHeap<number>()
      const heap2 = new LeftistHeap<number>()
      heap1.insert(1)
      heap2.insert(2)
      const merged = heap1.merge(heap2)
      expect(heap1.size).toBe(1)
      expect(heap2.size).toBe(1)
      expect(merged.size).toBe(2)
    })
  })

  describe('static merge', () => {
    it('should merge two heaps into new heap', () => {
      const heap1 = new LeftistHeap<number>()
      const heap2 = new LeftistHeap<number>()
      heap1.insert(5)
      heap1.insert(1)
      heap2.insert(3)
      heap2.insert(2)
      const merged = LeftistHeap.merge(heap1, heap2)
      expect(merged.size).toBe(4)
      expect(merged.extractMin()).toBe(1)
      expect(merged.extractMin()).toBe(2)
      expect(heap1.size).toBe(2)
      expect(heap2.size).toBe(2)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      const heap = new LeftistHeap<number>()
      expect(heap.toArray()).toEqual([])
    })

    it('should return all elements', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const arr = heap.toArray()
      expect(arr.length).toBe(3)
    })

    it('should contain all inserted values', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      const arr = heap.toArray()
      expect(arr).toContain(10)
      expect(arr).toContain(20)
      expect(arr).toContain(30)
    })

    it('should return correct count after operations', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.extractMin()
      expect(heap.toArray().length).toBe(2)
    })

    it('should not modify original heap', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      const sizeBefore = heap.size
      const peekBefore = heap.peek()
      heap.toArray()
      expect(heap.size).toBe(sizeBefore)
      expect(heap.peek()).toBe(peekBefore)
    })
  })

  describe('toSortedArray', () => {
    it('should return empty array for empty heap', () => {
      const heap = new LeftistHeap<number>()
      expect(heap.toSortedArray()).toEqual([])
    })

    it('should return sorted array', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      const arr = heap.toSortedArray()
      expect(arr).toEqual([1, 3, 5, 7])
    })

    it('should not modify original heap', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.toSortedArray()
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(3)
    })

    it('should handle duplicate values', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(5)
      heap.insert(3)
      const arr = heap.toSortedArray()
      expect(arr).toEqual([3, 3, 5, 5])
    })
  })

  describe('contains', () => {
    it('should return false on empty heap', () => {
      const heap = new LeftistHeap<number>()
      expect(heap.contains(1)).toBe(false)
    })

    it('should return true for existing value', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.contains(5)).toBe(true)
      expect(heap.contains(3)).toBe(true)
      expect(heap.contains(7)).toBe(true)
    })

    it('should return false for non-existing value', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.contains(1)).toBe(false)
      expect(heap.contains(10)).toBe(false)
    })

    it('should find values after multiple inserts', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(3)
      heap.insert(1)
      heap.insert(4)
      expect(heap.contains(3)).toBe(true)
      expect(heap.contains(1)).toBe(true)
      expect(heap.contains(4)).toBe(true)
      expect(heap.contains(2)).toBe(false)
    })

    it('should handle duplicate values', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      heap.insert(5)
      expect(heap.contains(5)).toBe(true)
    })

    it('should find value after extractMin', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.extractMin()
      expect(heap.contains(2)).toBe(true)
      expect(heap.contains(1)).toBe(false)
    })

    it('should return false after clear', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      heap.clear()
      expect(heap.contains(5)).toBe(false)
    })
  })

  describe('decreaseKey', () => {
    it('should throw on empty heap', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      heap.clear()
      expect(() => heap.decreaseKey(5, 1)).toThrow('value not found in heap')
    })

    it('should decrease key of existing element', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(10)
      heap.decreaseKey(10, 1)
      expect(heap.peek()).toBe(1)
      expect(heap.size).toBe(4)
      expect(heap.contains(10)).toBe(false)
    })

    it('should throw if new value is greater', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(() => heap.decreaseKey(3, 10)).toThrow('newValue must be less than or equal to oldValue')
    })

    it('should allow same value', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.decreaseKey(3, 3)
      expect(heap.peek()).toBe(3)
      expect(heap.size).toBe(3)
    })

    it('should decrease root element', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      heap.insert(10)
      heap.insert(15)
      heap.decreaseKey(5, 2)
      expect(heap.peek()).toBe(2)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(10)
      expect(heap.extractMin()).toBe(15)
    })

    it('should throw for non-existing element', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(() => heap.decreaseKey(1, 0)).toThrow('value not found in heap')
    })
  })

  describe('delete', () => {
    it('should return false for empty heap', () => {
      const heap = new LeftistHeap<number>()
      expect(heap.delete(5)).toBe(false)
      expect(heap.size).toBe(0)
    })

    it('should return false for non-existing element', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      heap.insert(3)
      expect(heap.delete(1)).toBe(false)
      expect(heap.size).toBe(2)
    })

    it('should delete single element', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      expect(heap.delete(5)).toBe(true)
      expect(heap.isEmpty()).toBe(true)
      expect(heap.size).toBe(0)
    })

    it('should delete element and maintain heap property', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      heap.insert(9)
      expect(heap.delete(5)).toBe(true)
      expect(heap.size).toBe(4)
      const result = []
      while (!heap.isEmpty()) {
        result.push(heap.extractMin())
      }
      expect(result).toEqual([1, 3, 7, 9])
    })

    it('should delete duplicate values', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(5)
      heap.insert(1)
      heap.insert(3)
      expect(heap.delete(5)).toBe(true)
      expect(heap.size).toBe(4)
      expect(heap.delete(5)).toBe(true)
      expect(heap.size).toBe(3)
      expect(heap.delete(5)).toBe(false)
      expect(heap.size).toBe(3)
    })

    it('should delete root element', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      heap.insert(9)
      expect(heap.delete(1)).toBe(true)
      expect(heap.peek()).toBe(3)
      expect(heap.size).toBe(4)
    })
  })

  describe('clone', () => {
    it('should clone empty heap', () => {
      const heap = new LeftistHeap<number>()
      const cloned = heap.clone()
      expect(cloned.isEmpty()).toBe(true)
      expect(cloned.size).toBe(0)
    })

    it('should clone heap with elements', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const cloned = heap.clone()
      expect(cloned.size).toBe(3)
      expect(cloned.extractMin()).toBe(1)
      expect(cloned.extractMin()).toBe(2)
      expect(cloned.extractMin()).toBe(3)
    })

    it('should not modify original when clone is modified', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(1)
      heap.insert(2)
      const cloned = heap.clone()
      cloned.insert(3)
      expect(heap.size).toBe(2)
      expect(cloned.size).toBe(3)
    })

    it('should not modify clone when original is modified', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(1)
      heap.insert(2)
      const cloned = heap.clone()
      heap.insert(3)
      expect(cloned.size).toBe(2)
      expect(heap.size).toBe(3)
    })

    it('should clone with same comparator', () => {
      const heap = new LeftistHeap<number>({ comparator: (a, b) => b - a })
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      const cloned = heap.clone()
      cloned.insert(1)
      expect(cloned.peek()).toBe(7)
    })
  })

  describe('forEach', () => {
    it('should iterate over empty heap', () => {
      const heap = new LeftistHeap<number>()
      let count = 0
      heap.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should iterate over all elements', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const values = []
      heap.forEach((v) => values.push(v))
      expect(values.length).toBe(3)
      expect(values).toContain(1)
      expect(values).toContain(2)
      expect(values).toContain(3)
    })

    it('should not modify heap', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.forEach(() => {})
      expect(heap.size).toBe(3)
    })

    it('should provide correct index', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const indices = []
      heap.forEach((_, idx) => indices.push(idx))
      expect(indices).toEqual([0, 1, 2])
    })
  })

  describe('Symbol.iterator', () => {
    it('should iterate over empty heap', () => {
      const heap = new LeftistHeap<number>()
      const values = [...heap]
      expect(values).toEqual([])
    })

    it('should iterate over all elements', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const values = [...heap]
      expect(values.length).toBe(3)
      expect(values).toContain(1)
      expect(values).toContain(2)
      expect(values).toContain(3)
    })

    it('should work with for-of loop', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const values = []
      for (const value of heap) {
        values.push(value)
      }
      expect(values.length).toBe(3)
    })

    it('should iterate in sorted order', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      heap.insert(4)
      const values = [...heap]
      expect(values).toEqual([1, 3, 4, 5, 7])
    })
  })

  describe('static fromArray', () => {
    it('should create heap from array', () => {
      const heap = LeftistHeap.fromArray([5, 3, 7, 1, 4])
      expect(heap.size).toBe(5)
      expect(heap.peek()).toBe(1)
    })

    it('should create empty heap from empty array', () => {
      const heap = LeftistHeap.fromArray([])
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should create heap from single element array', () => {
      const heap = LeftistHeap.fromArray([42])
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(42)
    })

    it('should extract in sorted order', () => {
      const heap = LeftistHeap.fromArray([5, 3, 7, 1, 4, 6, 2, 8])
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(4)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(6)
      expect(heap.extractMin()).toBe(7)
      expect(heap.extractMin()).toBe(8)
    })

    it('should accept custom comparator', () => {
      const heap = LeftistHeap.fromArray([5, 3, 7], { comparator: (a, b) => b - a })
      expect(heap.peek()).toBe(7)
    })
  })

  describe('isValid', () => {
    it('should return true for empty heap', () => {
      const heap = new LeftistHeap<number>()
      expect(heap.isValid()).toBe(true)
    })

    it('should return true for single element', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      expect(heap.isValid()).toBe(true)
    })

    it('should return true for valid heap', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      heap.insert(9)
      expect(heap.isValid()).toBe(true)
    })

    it('should return true after operations', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.extractMin()
      heap.insert(1)
      expect(heap.isValid()).toBe(true)
    })

    it('should return true after merge', () => {
      const heap1 = new LeftistHeap<number>()
      const heap2 = new LeftistHeap<number>()
      heap1.insert(5)
      heap1.insert(1)
      heap2.insert(3)
      heap2.insert(2)
      const merged = heap1.merge(heap2)
      expect(merged.isValid()).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle string values', () => {
      const heap = new LeftistHeap<string>()
      heap.insert('banana')
      heap.insert('apple')
      heap.insert('cherry')
      expect(heap.extractMin()).toBe('apple')
      expect(heap.extractMin()).toBe('banana')
      expect(heap.extractMin()).toBe('cherry')
    })

    it('should handle object values with comparator', () => {
      const heap = new LeftistHeap<{ id: number }>({
        comparator: (a, b) => a.id - b.id,
      })
      heap.insert({ id: 3 })
      heap.insert({ id: 1 })
      heap.insert({ id: 2 })
      expect(heap.extractMin()!.id).toBe(1)
      expect(heap.extractMin()!.id).toBe(2)
      expect(heap.extractMin()!.id).toBe(3)
    })

    it('should handle negative values extraction', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(-3)
      heap.insert(-1)
      heap.insert(-5)
      expect(heap.extractMin()).toBe(-5)
      expect(heap.extractMin()).toBe(-3)
      expect(heap.extractMin()).toBe(-1)
    })

    it('should handle large range of values', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(-100)
      heap.insert(0)
      heap.insert(100)
      expect(heap.extractMin()).toBe(-100)
      expect(heap.extractMin()).toBe(0)
      expect(heap.extractMin()).toBe(100)
    })

    it('should handle interleaved operations', () => {
      const heap = new LeftistHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.extractMin()
      heap.insert(1)
      heap.insert(7)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(7)
    })
  })

  describe('stress tests', () => {
    it('should handle 1000 elements', () => {
      const heap = new LeftistHeap<number>()
      for (let i = 1000; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.size).toBe(1000)
      for (let i = 1; i <= 1000; i++) {
        expect(heap.extractMin()).toBe(i)
      }
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle 1000 random elements', () => {
      const heap = new LeftistHeap<number>()
      const values = []
      for (let i = 0; i < 1000; i++) {
        const v = Math.floor(Math.random() * 10000)
        values.push(v)
        heap.insert(v)
      }
      values.sort((a, b) => a - b)
      for (let i = 0; i < 1000; i++) {
        expect(heap.extractMin()).toBe(values[i])
      }
    })

    it('should handle bulk insert via fromArray', () => {
      const values = []
      for (let i = 0; i < 1000; i++) {
        values.push(i)
      }
      const heap = LeftistHeap.fromArray(values)
      expect(heap.size).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })
  })
})
