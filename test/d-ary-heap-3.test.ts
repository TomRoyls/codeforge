import { describe, it, expect } from 'vitest'
import { DAryHeap } from '../src/core/d-ary-heap-3/index.js'

describe.skip('DAryHeap', () => {
  describe('empty heap', () => {
    it('should return undefined from peek on empty heap', () => {
      const heap = new DAryHeap<number>()
      expect(heap.peek()).toBeUndefined()
    })

    it('should return undefined from extract on empty heap', () => {
      const heap = new DAryHeap<number>()
      expect(heap.extract()).toBeUndefined()
    })

    it('should report size 0 for empty heap', () => {
      const heap = new DAryHeap<number>()
      expect(heap.size()).toBe(0)
    })

    it('should report isEmpty true for empty heap', () => {
      const heap = new DAryHeap<number>()
      expect(heap.isEmpty()).toBe(true)
    })

    it('should return false from contains on empty heap', () => {
      const heap = new DAryHeap<number>()
      expect(heap.contains(5)).toBe(false)
    })
  })

  describe('insert and extract', () => {
    it('should insert and extract in max-heap order', () => {
      const heap = new DAryHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(8)
      heap.insert(1)
      heap.insert(10)

      expect(heap.extract()).toBe(10)
      expect(heap.extract()).toBe(8)
      expect(heap.extract()).toBe(5)
      expect(heap.extract()).toBe(3)
      expect(heap.extract()).toBe(1)
    })

    it('should handle single element', () => {
      const heap = new DAryHeap<number>()
      heap.insert(42)
      expect(heap.peek()).toBe(42)
      expect(heap.extract()).toBe(42)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle duplicate values', () => {
      const heap = new DAryHeap<number>()
      heap.insert(5)
      heap.insert(5)
      heap.insert(3)
      heap.insert(5)

      expect(heap.extract()).toBe(5)
      expect(heap.extract()).toBe(5)
      expect(heap.extract()).toBe(5)
      expect(heap.extract()).toBe(3)
    })

    it('should maintain heap property after multiple inserts', () => {
      const heap = new DAryHeap<number>()
      const values = [7, 3, 9, 2, 5, 1, 8, 4, 6]
      values.forEach((v) => heap.insert(v))

      const result: number[] = []
      while (!heap.isEmpty()) {
        result.push(heap.extract()!)
      }

      expect(result).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1])
    })
  })

  describe('peek', () => {
    it('should return the max element without removing it', () => {
      const heap = new DAryHeap<number>()
      heap.insert(5)
      heap.insert(10)
      heap.insert(3)

      expect(heap.peek()).toBe(10)
      expect(heap.size()).toBe(3)
      expect(heap.peek()).toBe(10)
    })

    it('should return undefined for empty heap', () => {
      const heap = new DAryHeap<number>()
      expect(heap.peek()).toBeUndefined()
    })
  })

  describe('size', () => {
    it('should track size correctly', () => {
      const heap = new DAryHeap<number>()
      expect(heap.size()).toBe(0)

      heap.insert(1)
      expect(heap.size()).toBe(1)

      heap.insert(2)
      heap.insert(3)
      expect(heap.size()).toBe(3)

      heap.extract()
      expect(heap.size()).toBe(2)
    })
  })

  describe('isEmpty', () => {
    it('should return true only when empty', () => {
      const heap = new DAryHeap<number>()
      expect(heap.isEmpty()).toBe(true)

      heap.insert(1)
      expect(heap.isEmpty()).toBe(false)

      heap.extract()
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('heapify', () => {
    it('should build heap from array', () => {
      const heap = new DAryHeap<number>()
      heap.heapify([5, 3, 8, 1, 10, 7, 2])

      const result: number[] = []
      while (!heap.isEmpty()) {
        result.push(heap.extract()!)
      }

      expect(result).toEqual([10, 8, 7, 5, 3, 2, 1])
    })

    it('should handle empty array', () => {
      const heap = new DAryHeap<number>()
      heap.heapify([])
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle single element array', () => {
      const heap = new DAryHeap<number>()
      heap.heapify([42])
      expect(heap.size()).toBe(1)
      expect(heap.peek()).toBe(42)
    })
  })

  describe('toArray', () => {
    it('should return copy of heap array', () => {
      const heap = new DAryHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(8)

      const arr = heap.toArray()
      expect(arr).toEqual([8, 5, 3])
      expect(arr).not.toBe(heap['heap'])
    })

    it('should return empty array for empty heap', () => {
      const heap = new DAryHeap<number>()
      expect(heap.toArray()).toEqual([])
    })
  })

  describe('contains', () => {
    it('should find existing element', () => {
      const heap = new DAryHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(8)

      expect(heap.contains(5)).toBe(true)
      expect(heap.contains(8)).toBe(true)
    })

    it('should not find non-existent element', () => {
      const heap = new DAryHeap<number>()
      heap.insert(5)
      heap.insert(3)

      expect(heap.contains(8)).toBe(false)
      expect(heap.contains(0)).toBe(false)
    })

    it('should handle duplicates', () => {
      const heap = new DAryHeap<number>()
      heap.insert(5)
      heap.insert(5)
      heap.insert(3)

      expect(heap.contains(5)).toBe(true)
    })
  })

  describe('merge', () => {
    it('should merge two heaps', () => {
      const heap1 = new DAryHeap<number>()
      heap1.insert(5)
      heap1.insert(3)
      heap1.insert(8)

      const heap2 = new DAryHeap<number>()
      heap2.insert(10)
      heap2.insert(2)
      heap2.insert(7)

      const merged = heap1.merge(heap2)

      const result: number[] = []
      while (!merged.isEmpty()) {
        result.push(merged.extract()!)
      }

      expect(result).toEqual([10, 8, 7, 5, 3, 2])
    })

    it('should not modify original heaps', () => {
      const heap1 = new DAryHeap<number>()
      heap1.insert(5)
      heap1.insert(3)

      const heap2 = new DAryHeap<number>()
      heap2.insert(10)
      heap2.insert(2)

      const merged = heap1.merge(heap2)

      expect(heap1.size()).toBe(2)
      expect(heap2.size()).toBe(2)
      expect(merged.size()).toBe(4)
    })

    it('should handle merging empty heap', () => {
      const heap1 = new DAryHeap<number>()
      heap1.insert(5)
      heap1.insert(3)

      const heap2 = new DAryHeap<number>()
      const merged = heap1.merge(heap2)

      const result: number[] = []
      while (!merged.isEmpty()) {
        result.push(merged.extract()!)
      }

      expect(result).toEqual([5, 3])
    })
  })

  describe('clear', () => {
    it('should clear all elements', () => {
      const heap = new DAryHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(8)

      heap.clear()

      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
      expect(heap.peek()).toBeUndefined()
    })

    it('should handle clearing empty heap', () => {
      const heap = new DAryHeap<number>()
      heap.clear()
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('update', () => {
    it('should increase value and maintain heap', () => {
      const heap = new DAryHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(8)
      heap.insert(1)
      heap.insert(10)

      heap.update(2, 15)

      expect(heap.extract()).toBe(15)
      expect(heap.extract()).toBe(8)
      expect(heap.extract()).toBe(5)
    })

    it('should decrease value and maintain heap', () => {
      const heap = new DAryHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(8)
      heap.insert(1)
      heap.insert(10)

      heap.update(0, 2)

      expect(heap.extract()).toBe(8)
      expect(heap.extract()).toBe(5)
    })

    it('should handle invalid index', () => {
      const heap = new DAryHeap<number>()
      heap.insert(5)
      heap.insert(3)

      heap.update(10, 100)

      expect(heap.size()).toBe(2)
      expect(heap.peek()).toBe(5)
    })

    it('should handle updating to same value', () => {
      const heap = new DAryHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(8)

      heap.update(1, 8)

      expect(heap.size()).toBe(3)
      expect(heap.extract()).toBe(8)
    })
  })

  describe('custom d value', () => {
    it('should work with d=2 (binary heap)', () => {
      const heap = new DAryHeap<number>(2)
      heap.insert(5)
      heap.insert(3)
      heap.insert(8)
      heap.insert(1)
      heap.insert(10)

      expect(heap.extract()).toBe(10)
      expect(heap.extract()).toBe(8)
      expect(heap.extract()).toBe(5)
      expect(heap.extract()).toBe(3)
      expect(heap.extract()).toBe(1)
    })

    it('should work with d=3 (ternary heap)', () => {
      const heap = new DAryHeap<number>(3)
      heap.insert(5)
      heap.insert(3)
      heap.insert(8)
      heap.insert(1)
      heap.insert(10)

      expect(heap.extract()).toBe(10)
      expect(heap.extract()).toBe(8)
      expect(heap.extract()).toBe(5)
      expect(heap.extract()).toBe(3)
      expect(heap.extract()).toBe(1)
    })

    it('should work with d=4 (quaternary heap)', () => {
      const heap = new DAryHeap<number>(4)
      heap.insert(5)
      heap.insert(3)
      heap.insert(8)
      heap.insert(1)
      heap.insert(10)

      expect(heap.extract()).toBe(10)
      expect(heap.extract()).toBe(8)
      expect(heap.extract()).toBe(5)
      expect(heap.extract()).toBe(3)
      expect(heap.extract()).toBe(1)
    })

    it('should default to d=4', () => {
      const heap = new DAryHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(8)

      expect(heap.extract()).toBe(8)
      expect(heap.extract()).toBe(5)
      expect(heap.extract()).toBe(3)
    })

    it('should clamp d=1 to d=2', () => {
      const heap = new DAryHeap<number>(1)
      heap.insert(5)
      heap.insert(3)
      heap.insert(8)

      expect(heap.extract()).toBe(8)
      expect(heap.extract()).toBe(5)
      expect(heap.extract()).toBe(3)
    })
  })

  describe('custom comparator', () => {
    it('should work as min-heap with reverse comparator', () => {
      const heap = new DAryHeap<number>(4, (a, b) => {
        if (a < b) return 1
        if (a > b) return -1
        return 0
      })

      heap.insert(5)
      heap.insert(3)
      heap.insert(8)
      heap.insert(1)
      heap.insert(10)

      expect(heap.extract()).toBe(1)
      expect(heap.extract()).toBe(3)
      expect(heap.extract()).toBe(5)
      expect(heap.extract()).toBe(8)
      expect(heap.extract()).toBe(10)
    })

    it('should work with string comparator', () => {
      const heap = new DAryHeap<string>(4, (a, b) => {
        if (a < b) return -1
        if (a > b) return 1
        return 0
      })

      heap.insert('zebra')
      heap.insert('apple')
      heap.insert('banana')
      heap.insert('cherry')

      expect(heap.extract()).toBe('apple')
      expect(heap.extract()).toBe('banana')
      expect(heap.extract()).toBe('cherry')
      expect(heap.extract()).toBe('zebra')
    })

    it('should work with object comparator', () => {
      interface Item {
        value: number
        priority: number
      }

      const heap = new DAryHeap<Item>(4, (a, b) => {
        return a.priority - b.priority
      })

      heap.insert({ value: 'a', priority: 3 })
      heap.insert({ value: 'b', priority: 1 })
      heap.insert({ value: 'c', priority: 5 })
      heap.insert({ value: 'd', priority: 2 })

      expect(heap.extract()!.value).toBe('c')
      expect(heap.extract()!.value).toBe('a')
      expect(heap.extract()!.value).toBe('d')
      expect(heap.extract()!.value).toBe('b')
    })
  })

  describe('getTimeComplexity', () => {
    it('should return correct complexity for d=2', () => {
      const heap = new DAryHeap<number>(2)
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)

      const complexity = heap.getTimeComplexity()
      expect(complexity).toContain('insert: O(log2(n))')
      expect(complexity).toContain('extract: O(2 * log2(n))')
    })

    it('should return correct complexity for d=4', () => {
      const heap = new DAryHeap<number>(4)
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)

      const complexity = heap.getTimeComplexity()
      expect(complexity).toContain('insert: O(log4(n))')
      expect(complexity).toContain('extract: O(4 * log4(n))')
    })

    it('should return complexity for default d=4', () => {
      const heap = new DAryHeap<number>()
      heap.insert(1)

      const complexity = heap.getTimeComplexity()
      expect(complexity).toContain('log4')
    })
  })

  describe('large datasets', () => {
    it('should handle 1000 elements', () => {
      const heap = new DAryHeap<number>()
      const values = Array.from({ length: 1000 }, (_, i) => i)
      values.forEach((v) => heap.insert(v))

      expect(heap.size()).toBe(1000)

      const result: number[] = []
      while (!heap.isEmpty()) {
        result.push(heap.extract()!)
      }

      expect(result).toHaveLength(1000)
      for (let i = 0; i < 999; i++) {
        expect(result[i]).toBeGreaterThan(result[i + 1])
      }
    })

    it('should heapify large array efficiently', () => {
      const heap = new DAryHeap<number>()
      const values = Array.from({ length: 1000 }, (_, i) => Math.floor(Math.random() * 10000))

      heap.heapify(values)

      expect(heap.size()).toBe(1000)

      let prev = Infinity
      while (!heap.isEmpty()) {
        const curr = heap.extract()!
        expect(curr).toBeLessThanOrEqual(prev)
        prev = curr
      }
    })

    it('should handle insert and extract interleaved', () => {
      const heap = new DAryHeap<number>()
      const values = [50, 25, 75, 12, 37, 62, 87, 6, 18, 31]

      values.forEach((v) => heap.insert(v))

      expect(heap.extract()).toBe(87)
      heap.insert(100)
      expect(heap.extract()).toBe(100)
      expect(heap.extract()).toBe(75)
      heap.insert(80)
      expect(heap.extract()).toBe(80)
    })
  })
})
