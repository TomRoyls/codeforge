import { describe, it, expect } from 'vitest'
import { VectorHeap2 } from '../../src/core/vector-heap-2/index.js'

describe('VectorHeap2', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('should create a heap with default capacity', () => {
      const heap = new VectorHeap2()
      expect(heap.size).toBe(0)
      expect(heap.capacity).toBe(1024)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should create a heap with custom capacity', () => {
      const heap = new VectorHeap2(64)
      expect(heap.capacity).toBe(64)
      expect(heap.size).toBe(0)
    })

    it('should create a heap with capacity 1', () => {
      const heap = new VectorHeap2(1)
      expect(heap.capacity).toBe(1)
    })
  })

  // ─── isEmpty ───
  describe('isEmpty', () => {
    it('should return true for new heap', () => {
      const heap = new VectorHeap2()
      expect(heap.isEmpty()).toBe(true)
    })

    it('should return false after push', () => {
      const heap = new VectorHeap2()
      heap.push(1)
      expect(heap.isEmpty()).toBe(false)
    })

    it('should return true after clearing all elements', () => {
      const heap = new VectorHeap2()
      heap.push(1)
      heap.pop()
      expect(heap.isEmpty()).toBe(true)
    })
  })

  // ─── size / capacity ───
  describe('size and capacity', () => {
    it('should track size correctly', () => {
      const heap = new VectorHeap2()
      expect(heap.size).toBe(0)
      heap.push(1)
      expect(heap.size).toBe(1)
      heap.push(2)
      expect(heap.size).toBe(2)
      heap.push(3)
      expect(heap.size).toBe(3)
    })

    it('should decrement size on pop', () => {
      const heap = new VectorHeap2()
      heap.push(1)
      heap.push(2)
      heap.pop()
      expect(heap.size).toBe(1)
    })
  })

  // ─── push ───
  describe('push', () => {
    it('should insert a single element', () => {
      const heap = new VectorHeap2()
      heap.push(42)
      expect(heap.peek()).toBe(42)
      expect(heap.size).toBe(1)
    })

    it('should maintain min-heap property', () => {
      const heap = new VectorHeap2()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      heap.push(1)
      heap.push(4)
      expect(heap.peek()).toBe(1)
    })

    it('should handle negative values', () => {
      const heap = new VectorHeap2()
      heap.push(-5)
      heap.push(-10)
      heap.push(-1)
      expect(heap.peek()).toBe(-10)
    })

    it('should handle zero', () => {
      const heap = new VectorHeap2()
      heap.push(0)
      heap.push(5)
      heap.push(-3)
      expect(heap.peek()).toBe(-3)
    })

    it('should handle duplicate values', () => {
      const heap = new VectorHeap2()
      heap.push(5)
      heap.push(5)
      heap.push(5)
      expect(heap.peek()).toBe(5)
      expect(heap.size).toBe(3)
    })

    it('should auto-grow when capacity is exceeded', () => {
      const heap = new VectorHeap2(2)
      heap.push(3)
      heap.push(1)
      heap.push(2)
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(1)
      expect(heap.capacity).toBeGreaterThanOrEqual(3)
    })
  })

  // ─── pop ───
  describe('pop', () => {
    it('should return undefined for empty heap', () => {
      const heap = new VectorHeap2()
      expect(heap.pop()).toBeUndefined()
    })

    it('should return the minimum element', () => {
      const heap = new VectorHeap2()
      heap.push(5)
      heap.push(1)
      heap.push(3)
      expect(heap.pop()).toBe(1)
    })

    it('should return elements in sorted order', () => {
      const heap = new VectorHeap2()
      const values = [5, 3, 7, 1, 4, 6, 2]
      for (const v of values) heap.push(v)
      const sorted: number[] = []
      while (!heap.isEmpty()) {
        sorted.push(heap.pop()!)
      }
      expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7])
    })

    it('should handle single element pop', () => {
      const heap = new VectorHeap2()
      heap.push(42)
      expect(heap.pop()).toBe(42)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle negative values in pop order', () => {
      const heap = new VectorHeap2()
      heap.push(-5)
      heap.push(3)
      heap.push(-10)
      heap.push(0)
      expect(heap.pop()).toBe(-10)
      expect(heap.pop()).toBe(-5)
      expect(heap.pop()).toBe(0)
      expect(heap.pop()).toBe(3)
    })
  })

  // ─── peek ───
  describe('peek', () => {
    it('should return undefined for empty heap', () => {
      const heap = new VectorHeap2()
      expect(heap.peek()).toBeUndefined()
    })

    it('should return min without removing it', () => {
      const heap = new VectorHeap2()
      heap.push(5)
      heap.push(1)
      heap.push(3)
      expect(heap.peek()).toBe(1)
      expect(heap.size).toBe(3)
    })

    it('should update after pop', () => {
      const heap = new VectorHeap2()
      heap.push(1)
      heap.push(3)
      heap.pop()
      expect(heap.peek()).toBe(3)
    })
  })

  // ─── toArray ───
  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      const heap = new VectorHeap2()
      expect(heap.toArray()).toEqual([])
    })

    it('should return all elements', () => {
      const heap = new VectorHeap2()
      heap.push(3)
      heap.push(1)
      heap.push(2)
      const arr = heap.toArray()
      expect(arr.sort((a, b) => a - b)).toEqual([1, 2, 3])
    })
  })

  // ─── contains ───
  describe('contains', () => {
    it('should return false for empty heap', () => {
      const heap = new VectorHeap2()
      expect(heap.contains(1)).toBe(false)
    })

    it('should find existing elements', () => {
      const heap = new VectorHeap2()
      heap.push(3)
      heap.push(1)
      heap.push(5)
      expect(heap.contains(1)).toBe(true)
      expect(heap.contains(3)).toBe(true)
      expect(heap.contains(5)).toBe(true)
    })

    it('should not find missing elements', () => {
      const heap = new VectorHeap2()
      heap.push(1)
      heap.push(3)
      expect(heap.contains(2)).toBe(false)
      expect(heap.contains(0)).toBe(false)
    })

    it('should find duplicate values', () => {
      const heap = new VectorHeap2()
      heap.push(5)
      heap.push(5)
      heap.pop()
      expect(heap.contains(5)).toBe(true)
    })
  })

  // ─── remove ───
  describe('remove', () => {
    it('should return false for empty heap', () => {
      const heap = new VectorHeap2()
      expect(heap.remove(1)).toBe(false)
    })

    it('should remove existing element', () => {
      const heap = new VectorHeap2()
      heap.push(1)
      heap.push(2)
      heap.push(3)
      expect(heap.remove(2)).toBe(true)
      expect(heap.contains(2)).toBe(false)
      expect(heap.size).toBe(2)
    })

    it('should return false for non-existent element', () => {
      const heap = new VectorHeap2()
      heap.push(1)
      expect(heap.remove(99)).toBe(false)
      expect(heap.size).toBe(1)
    })

    it('should maintain heap property after removal', () => {
      const heap = new VectorHeap2()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      heap.push(1)
      heap.remove(3)
      expect(heap.peek()).toBe(1)
      const remaining: number[] = []
      while (!heap.isEmpty()) remaining.push(heap.pop()!)
      expect(remaining).toEqual([1, 5, 7])
    })

    it('should remove the minimum element', () => {
      const heap = new VectorHeap2()
      heap.push(1)
      heap.push(3)
      heap.push(5)
      expect(heap.remove(1)).toBe(true)
      expect(heap.peek()).toBe(3)
    })

    it('should remove single element leaving empty heap', () => {
      const heap = new VectorHeap2()
      heap.push(42)
      expect(heap.remove(42)).toBe(true)
      expect(heap.isEmpty()).toBe(true)
    })
  })

  // ─── update ───
  describe('update', () => {
    it('should return false for empty heap', () => {
      const heap = new VectorHeap2()
      expect(heap.update(1, 2)).toBe(false)
    })

    it('should update existing value to a smaller value', () => {
      const heap = new VectorHeap2()
      heap.push(5)
      heap.push(10)
      heap.push(3)
      expect(heap.update(10, 1)).toBe(true)
      expect(heap.peek()).toBe(1)
    })

    it('should update existing value to a larger value', () => {
      const heap = new VectorHeap2()
      heap.push(1)
      heap.push(5)
      heap.push(3)
      expect(heap.update(1, 10)).toBe(true)
      expect(heap.peek()).toBe(3)
    })

    it('should return false for non-existent old value', () => {
      const heap = new VectorHeap2()
      heap.push(1)
      expect(heap.update(99, 2)).toBe(false)
    })

    it('should maintain heap property after update', () => {
      const heap = new VectorHeap2()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      heap.update(7, 1)
      const sorted: number[] = []
      while (!heap.isEmpty()) sorted.push(heap.pop()!)
      expect(sorted).toEqual([1, 3, 5])
    })

    it('should update to same value', () => {
      const heap = new VectorHeap2()
      heap.push(5)
      expect(heap.update(5, 5)).toBe(true)
      expect(heap.peek()).toBe(5)
    })
  })

  // ─── clear ───
  describe('clear', () => {
    it('should clear all elements', () => {
      const heap = new VectorHeap2()
      heap.push(1)
      heap.push(2)
      heap.push(3)
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
      expect(heap.peek()).toBeUndefined()
    })

    it('should work on already empty heap', () => {
      const heap = new VectorHeap2()
      heap.clear()
      expect(heap.size).toBe(0)
    })
  })

  // ─── reserve ───
  describe('reserve', () => {
    it('should increase capacity', () => {
      const heap = new VectorHeap2(8)
      heap.reserve(64)
      expect(heap.capacity).toBe(64)
    })

    it('should not decrease capacity', () => {
      const heap = new VectorHeap2(64)
      heap.reserve(8)
      expect(heap.capacity).toBe(64)
    })

    it('should preserve existing elements on reserve', () => {
      const heap = new VectorHeap2(4)
      heap.push(1)
      heap.push(2)
      heap.reserve(100)
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(1)
    })
  })

  // ─── Integration ───
  describe('integration', () => {
    it('should handle push-pop interleaved operations', () => {
      const heap = new VectorHeap2()
      heap.push(5)
      heap.push(3)
      expect(heap.pop()).toBe(3)
      heap.push(1)
      heap.push(7)
      expect(heap.pop()).toBe(1)
      expect(heap.pop()).toBe(5)
      expect(heap.pop()).toBe(7)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle large number of elements', () => {
      const heap = new VectorHeap2(10)
      const count = 500
      for (let i = count; i > 0; i--) {
        heap.push(i)
      }
      expect(heap.size).toBe(count)
      for (let i = 1; i <= count; i++) {
        expect(heap.pop()).toBe(i)
      }
    })

    it('should handle remove-update-pop cycle', () => {
      const heap = new VectorHeap2()
      heap.push(10)
      heap.push(20)
      heap.push(30)
      heap.remove(20)
      heap.update(30, 5)
      expect(heap.pop()).toBe(5)
      expect(heap.pop()).toBe(10)
      expect(heap.isEmpty()).toBe(true)
    })
  })
})
