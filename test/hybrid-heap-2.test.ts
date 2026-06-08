import { describe, it, expect, beforeEach } from 'vitest'
import { HybridHeap2 } from '../src/core/hybrid-heap-2/index.js'

describe('HybridHeap2', () => {
  let heap: HybridHeap2<number>

  beforeEach(() => {
    heap = new HybridHeap2<number>()
  })

  describe('constructor', () => {
    it('should create a heap with default comparator', async () => {
      const h = new HybridHeap2<number>()
      expect(h.size).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('should accept custom comparator', async () => {
      const h = new HybridHeap2<number>((a, b) => (a > b ? -1 : a < b ? 1 : 0))
      h.insert(1)
      h.insert(3)
      h.insert(2)
      expect(h.peek()).toBe(3)
    })

    it('should handle custom comparator correctly', async () => {
      const h = new HybridHeap2<{ value: number }>((a, b) => {
        if (a.value < b.value) return -1
        if (a.value > b.value) return 1
        return 0
      })
      h.insert({ value: 3 })
      h.insert({ value: 1 })
      h.insert({ value: 2 })
      expect(h.peek()).toEqual({ value: 1 })
    })
  })

  describe('insert', () => {
    it('should add a single element', async () => {
      heap.insert(5)
      expect(heap.size).toBe(1)
      expect(heap.isEmpty()).toBe(false)
    })

    it('should add multiple elements', async () => {
      heap.insert(3)
      heap.insert(1)
      heap.insert(4)
      expect(heap.size).toBe(3)
    })

    it('should maintain min-heap property on insert', async () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      expect(heap.peek()).toBe(1)
    })

    it('should handle duplicate values', async () => {
      heap.insert(5)
      heap.insert(5)
      heap.insert(5)
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(5)
    })

    it('should handle negative numbers', async () => {
      heap.insert(-5)
      heap.insert(3)
      heap.insert(-1)
      expect(heap.peek()).toBe(-5)
    })
  })

  describe('extractMin', () => {
    it('should return undefined for empty heap', async () => {
      expect(heap.extractMin()).toBeUndefined()
    })

    it('should extract minimum element', async () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.size).toBe(3)
    })

    it('should extract elements in sorted order', async () => {
      const values = [5, 3, 7, 1, 9, 2, 6]
      values.forEach(v => heap.insert(v))
      const extracted: number[] = []
      while (!heap.isEmpty()) {
        extracted.push(heap.extractMin()!)
      }
      expect(extracted).toEqual([1, 2, 3, 5, 6, 7, 9])
    })

    it('should maintain heap property after extraction', async () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      heap.extractMin()
      expect(heap.peek()).toBe(3)
    })

    it('should handle single element', async () => {
      heap.insert(5)
      expect(heap.extractMin()).toBe(5)
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('peek', () => {
    it('should return undefined for empty heap', async () => {
      expect(heap.peek()).toBeUndefined()
    })

    it('should return minimum without removing', async () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      expect(heap.peek()).toBe(1)
      expect(heap.size).toBe(3)
    })

    it('should maintain peek after insert', async () => {
      heap.insert(5)
      heap.insert(3)
      expect(heap.peek()).toBe(3)
      heap.insert(1)
      expect(heap.peek()).toBe(1)
    })

    it('should maintain peek after extract', async () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      heap.extractMin()
      expect(heap.peek()).toBe(3)
    })
  })

  describe('size', () => {
    it('should return 0 for empty heap', async () => {
      expect(heap.size).toBe(0)
    })

    it('should return correct size after inserts', async () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.size).toBe(3)
    })

    it('should return correct size after extracts', async () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.extractMin()
      expect(heap.size).toBe(2)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty heap', async () => {
      expect(heap.isEmpty()).toBe(true)
    })

    it('should return false after insert', async () => {
      heap.insert(1)
      expect(heap.isEmpty()).toBe(false)
    })

    it('should return true after extracting all elements', async () => {
      heap.insert(1)
      heap.insert(2)
      heap.extractMin()
      heap.extractMin()
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all elements', async () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.clear()
      expect(heap.isEmpty()).toBe(true)
      expect(heap.size).toBe(0)
    })

    it('should allow operations after clear', async () => {
      heap.insert(1)
      heap.clear()
      heap.insert(5)
      expect(heap.peek()).toBe(5)
    })

    it('should be safe to clear empty heap', async () => {
      heap.clear()
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty heap', async () => {
      expect(heap.toArray()).toEqual([])
    })

    it('should return sorted array', async () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      heap.insert(9)
      expect(heap.toArray()).toEqual([1, 3, 5, 7, 9])
    })

    it('should not modify original heap', async () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      const arr = heap.toArray()
      expect(heap.size).toBe(3)
      expect(arr).toEqual([1, 3, 5])
    })

    it('should handle duplicates', async () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(5)
      heap.insert(3)
      heap.insert(5)
      expect(heap.toArray()).toEqual([3, 3, 5, 5, 5])
    })
  })

  describe('fromArray', () => {
    it('should create heap from array', async () => {
      const h = HybridHeap2.fromArray([5, 3, 7, 1, 9])
      expect(h.size).toBe(5)
      expect(h.peek()).toBe(1)
    })

    it('should create heap from empty array', async () => {
      const h = HybridHeap2.fromArray<number>([])
      expect(h.size).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('should use default comparator', async () => {
      const h = HybridHeap2.fromArray([5, 3, 7, 1, 9])
      expect(h.toArray()).toEqual([1, 3, 5, 7, 9])
    })

    it('should accept custom comparator', async () => {
      const h = HybridHeap2.fromArray(
        [5, 3, 7, 1, 9],
        (a, b) => (a > b ? -1 : a < b ? 1 : 0)
      )
      expect(h.toArray()).toEqual([9, 7, 5, 3, 1])
    })

    it('should build heap efficiently', async () => {
      const values = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
      const h = HybridHeap2.fromArray(values)
      expect(h.size).toBe(10)
      expect(h.peek()).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('should handle single insert and extract', async () => {
      heap.insert(42)
      expect(heap.extractMin()).toBe(42)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle same value repeated', async () => {
      for (let i = 0; i < 100; i++) {
        heap.insert(5)
      }
      expect(heap.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(heap.extractMin()).toBe(5)
      }
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle alternating inserts and extracts', async () => {
      heap.insert(3)
      expect(heap.extractMin()).toBe(3)
      heap.insert(1)
      heap.insert(5)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(5)
    })

    it('should handle zero as value', async () => {
      heap.insert(0)
      heap.insert(5)
      heap.insert(-3)
      expect(heap.peek()).toBe(-3)
      heap.extractMin()
      expect(heap.peek()).toBe(0)
    })
  })

  describe('heap property', () => {
    it('should maintain heap property after all operations', async () => {
      const values = [10, 5, 8, 2, 7, 3, 9, 1, 6, 4]
      values.forEach(v => heap.insert(v))

      while (!heap.isEmpty()) {
        const min = heap.extractMin()!
        const arr = heap.toArray()
        for (const item of arr) {
          expect(item).toBeGreaterThanOrEqual(min)
        }
      }
    })

    it('should maintain heap property for large dataset', async () => {
      const values = Array.from({ length: 1000 }, (_, i) => i * 2 + 1)
      values.forEach(v => heap.insert(v))

      let prev = -Infinity
      while (!heap.isEmpty()) {
        const current = heap.extractMin()!
        expect(current).toBeGreaterThanOrEqual(prev)
        prev = current
      }
    })
  })

  describe('sequential extract', () => {
    it('should extract elements sequentially in order', async () => {
      const values = [5, 1, 3, 7, 2, 9, 4, 6, 8]
      values.forEach(v => heap.insert(v))

      const result: number[] = []
      while (!heap.isEmpty()) {
        result.push(heap.extractMin()!)
      }

      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should handle interleaved insert and extract', async () => {
      heap.insert(5)
      heap.insert(3)
      expect(heap.extractMin()).toBe(3)
      heap.insert(1)
      expect(heap.extractMin()).toBe(1)
      heap.insert(4)
      heap.insert(2)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(4)
      expect(heap.extractMin()).toBe(5)
    })
  })

  describe('large datasets', () => {
    it('should handle dataset smaller than threshold (63 elements)', async () => {
      const values = Array.from({ length: 63 }, (_, i) => i + 1)
      values.forEach(v => heap.insert(v))

      expect(heap.size).toBe(63)
      expect(heap.peek()).toBe(1)

      const result = heap.toArray()
      expect(result).toEqual(Array.from({ length: 63 }, (_, i) => i + 1))
    })

    it('should handle dataset at threshold (64 elements)', async () => {
      const values = Array.from({ length: 64 }, (_, i) => i + 1)
      values.forEach(v => heap.insert(v))

      expect(heap.size).toBe(64)
      expect(heap.peek()).toBe(1)

      const result = heap.toArray()
      expect(result).toEqual(Array.from({ length: 64 }, (_, i) => i + 1))
    })

    it('should handle dataset larger than threshold (65 elements)', async () => {
      const values = Array.from({ length: 65 }, (_, i) => i + 1)
      values.forEach(v => heap.insert(v))

      expect(heap.size).toBe(65)
      expect(heap.peek()).toBe(1)

      const result = heap.toArray()
      expect(result).toEqual(Array.from({ length: 65 }, (_, i) => i + 1))
    })

    it('should handle large random dataset', async () => {
      const values = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 10000))
      values.forEach(v => heap.insert(v))

      const result = heap.toArray()
      expect(result).toEqual([...result].sort((a, b) => a - b))
    })

    it('should handle transition from binary to 4-ary', async () => {
      for (let i = 0; i < 63; i++) {
        heap.insert(i)
      }
      expect(heap.size).toBe(63)
      heap.insert(63)
      expect(heap.size).toBe(64)
      heap.insert(64)
      expect(heap.size).toBe(65)

      const result = heap.toArray()
      expect(result).toEqual(Array.from({ length: 65 }, (_, i) => i))
    })
  })

  describe('mixed operations', () => {
    it('should handle mix of operations', async () => {
      const h = new HybridHeap2<number>()
      h.insert(5)
      h.insert(3)
      h.insert(7)
      h.extractMin()
      h.insert(1)
      h.insert(9)
      h.extractMin()
      h.insert(2)

      expect(h.toArray()).toEqual([2, 5, 7, 9])
    })

    it('should handle clear and rebuild', async () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      heap.clear()
      heap.insert(9)
      heap.insert(7)
      heap.insert(8)

      expect(heap.toArray()).toEqual([7, 8, 9])
    })
  })

  describe('generic types', () => {
    it('should work with strings', async () => {
      const h = new HybridHeap2<string>()
      h.insert('zebra')
      h.insert('apple')
      h.insert('mango')
      expect(h.extractMin()).toBe('apple')
      expect(h.extractMin()).toBe('mango')
      expect(h.extractMin()).toBe('zebra')
    })

    it('should work with objects', async () => {
      interface Item {
        priority: number
        value: string
      }
      const h = new HybridHeap2<Item>((a, b) => {
        if (a.priority < b.priority) return -1
        if (a.priority > b.priority) return 1
        return 0
      })
      h.insert({ priority: 3, value: 'three' })
      h.insert({ priority: 1, value: 'one' })
      h.insert({ priority: 2, value: 'two' })

      expect(h.extractMin()?.value).toBe('one')
      expect(h.extractMin()?.value).toBe('two')
      expect(h.extractMin()?.value).toBe('three')
    })
  })
})
