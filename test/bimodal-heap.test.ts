import { describe, expect, it } from 'vitest'
import { BimodalHeap } from '../src/core/bimodal-heap/bimodal-heap.js'

describe('BimodalHeap', () => {
  describe('constructor', () => {
    it('should create an empty heap with default comparator', () => {
      const heap = new BimodalHeap()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should create a heap with custom comparator', () => {
      const heap = new BimodalHeap<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      heap.insert('charlie')
      heap.insert('alpha')
      heap.insert('bravo')
      expect(heap.findMin()).toBe('alpha')
      expect(heap.findMax()).toBe('charlie')
    })

    it('should work with numeric default comparator', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(5)
      heap.insert(1)
      heap.insert(10)
      expect(heap.findMin()).toBe(1)
      expect(heap.findMax()).toBe(10)
    })
  })

  describe('insert', () => {
    it('should insert a single element', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(42)
      expect(heap.size()).toBe(1)
      expect(heap.isEmpty()).toBe(false)
      expect(heap.findMin()).toBe(42)
      expect(heap.findMax()).toBe(42)
    })

    it('should insert multiple elements', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(3)
      heap.insert(1)
      heap.insert(4)
      heap.insert(1)
      heap.insert(5)
      expect(heap.size()).toBe(5)
    })

    it('should maintain min and max after multiple inserts', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(10)
      heap.insert(5)
      heap.insert(20)
      heap.insert(1)
      heap.insert(15)
      expect(heap.findMin()).toBe(1)
      expect(heap.findMax()).toBe(20)
    })

    it('should handle negative numbers', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(-5)
      heap.insert(-10)
      heap.insert(0)
      heap.insert(5)
      expect(heap.findMin()).toBe(-10)
      expect(heap.findMax()).toBe(5)
    })

    it('should handle duplicate values', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(5)
      heap.insert(5)
      heap.insert(5)
      expect(heap.size()).toBe(3)
      expect(heap.findMin()).toBe(5)
      expect(heap.findMax()).toBe(5)
    })
  })

  describe('findMin', () => {
    it('should return undefined for empty heap', () => {
      const heap = new BimodalHeap<number>()
      expect(heap.findMin()).toBeUndefined()
    })

    it('should return the minimum element without removing it', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(10)
      heap.insert(5)
      heap.insert(20)
      expect(heap.findMin()).toBe(5)
      expect(heap.size()).toBe(3)
      expect(heap.findMin()).toBe(5)
    })
  })

  describe('findMax', () => {
    it('should return undefined for empty heap', () => {
      const heap = new BimodalHeap<number>()
      expect(heap.findMax()).toBeUndefined()
    })

    it('should return the maximum element without removing it', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(10)
      heap.insert(5)
      heap.insert(20)
      expect(heap.findMax()).toBe(20)
      expect(heap.size()).toBe(3)
      expect(heap.findMax()).toBe(20)
    })
  })

  describe('deleteMin', () => {
    it('should return undefined for empty heap', () => {
      const heap = new BimodalHeap<number>()
      expect(heap.deleteMin()).toBeUndefined()
    })

    it('should remove and return the minimum element', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(10)
      heap.insert(5)
      heap.insert(20)
      expect(heap.deleteMin()).toBe(5)
      expect(heap.size()).toBe(2)
    })

    it('should update min after deletion', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(10)
      heap.insert(5)
      heap.insert(20)
      heap.deleteMin()
      expect(heap.findMin()).toBe(10)
    })

    it('should delete all elements in ascending order', () => {
      const heap = new BimodalHeap<number>()
      const values = [5, 3, 8, 1, 9, 2, 7]
      for (const v of values) heap.insert(v)
      const sorted: number[] = []
      while (!heap.isEmpty()) {
        sorted.push(heap.deleteMin()!)
      }
      expect(sorted).toEqual([1, 2, 3, 5, 7, 8, 9])
    })

    it('should handle single element', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(42)
      expect(heap.deleteMin()).toBe(42)
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('deleteMax', () => {
    it('should return undefined for empty heap', () => {
      const heap = new BimodalHeap<number>()
      expect(heap.deleteMax()).toBeUndefined()
    })

    it('should remove and return the maximum element', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(10)
      heap.insert(5)
      heap.insert(20)
      expect(heap.deleteMax()).toBe(20)
      expect(heap.size()).toBe(2)
    })

    it('should update max after deletion', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(10)
      heap.insert(5)
      heap.insert(20)
      heap.deleteMax()
      expect(heap.findMax()).toBe(10)
    })

    it('should delete all elements in descending order', () => {
      const heap = new BimodalHeap<number>()
      const values = [5, 3, 8, 1, 9, 2, 7]
      for (const v of values) heap.insert(v)
      const sorted: number[] = []
      while (!heap.isEmpty()) {
        sorted.push(heap.deleteMax()!)
      }
      expect(sorted).toEqual([9, 8, 7, 5, 3, 2, 1])
    })

    it('should handle single element', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(42)
      expect(heap.deleteMax()).toBe(42)
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('mixed deleteMin and deleteMax', () => {
    it('should interleave min and max deletions', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.insert(4)
      heap.insert(5)
      expect(heap.deleteMin()).toBe(1)
      expect(heap.deleteMax()).toBe(5)
      expect(heap.deleteMin()).toBe(2)
      expect(heap.deleteMax()).toBe(4)
      expect(heap.deleteMin()).toBe(3)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle alternating operations correctly', () => {
      const heap = new BimodalHeap<number>()
      for (let i = 1; i <= 10; i++) heap.insert(i)
      expect(heap.deleteMax()).toBe(10)
      expect(heap.deleteMin()).toBe(1)
      expect(heap.deleteMax()).toBe(9)
      expect(heap.deleteMin()).toBe(2)
      expect(heap.size()).toBe(6)
    })
  })

  describe('size and isEmpty', () => {
    it('should track size correctly', () => {
      const heap = new BimodalHeap<number>()
      expect(heap.size()).toBe(0)
      heap.insert(1)
      expect(heap.size()).toBe(1)
      heap.insert(2)
      expect(heap.size()).toBe(2)
      heap.deleteMin()
      expect(heap.size()).toBe(1)
      heap.deleteMax()
      expect(heap.size()).toBe(0)
    })

    it('should track isEmpty correctly', () => {
      const heap = new BimodalHeap<number>()
      expect(heap.isEmpty()).toBe(true)
      heap.insert(1)
      expect(heap.isEmpty()).toBe(false)
      heap.deleteMin()
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all elements', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.clear()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
      expect(heap.findMin()).toBeUndefined()
      expect(heap.findMax()).toBeUndefined()
    })

    it('should allow insertions after clear', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(1)
      heap.clear()
      heap.insert(10)
      expect(heap.size()).toBe(1)
      expect(heap.findMin()).toBe(10)
    })
  })

  describe('contains', () => {
    it('should find existing elements', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(5)
      heap.insert(10)
      heap.insert(15)
      expect(heap.contains(5)).toBe(true)
      expect(heap.contains(10)).toBe(true)
      expect(heap.contains(15)).toBe(true)
    })

    it('should return false for missing elements', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(5)
      heap.insert(10)
      expect(heap.contains(7)).toBe(false)
      expect(heap.contains(1)).toBe(false)
    })

    it('should return false for empty heap', () => {
      const heap = new BimodalHeap<number>()
      expect(heap.contains(1)).toBe(false)
    })

    it('should return false for deleted elements', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(5)
      heap.insert(10)
      heap.deleteMin()
      expect(heap.contains(5)).toBe(false)
      expect(heap.contains(10)).toBe(true)
    })
  })

  describe('delete (by value)', () => {
    it('should delete a specific value', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(5)
      heap.insert(10)
      heap.insert(15)
      expect(heap.delete(10)).toBe(true)
      expect(heap.size()).toBe(2)
      expect(heap.contains(10)).toBe(false)
    })

    it('should return false for missing value', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(5)
      expect(heap.delete(10)).toBe(false)
      expect(heap.size()).toBe(1)
    })

    it('should maintain correct min and max after value deletion', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(1)
      heap.insert(5)
      heap.insert(10)
      heap.delete(5)
      expect(heap.findMin()).toBe(1)
      expect(heap.findMax()).toBe(10)
    })

    it('should delete only first occurrence of duplicate', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(5)
      heap.insert(5)
      heap.insert(5)
      expect(heap.delete(5)).toBe(true)
      expect(heap.size()).toBe(2)
      expect(heap.contains(5)).toBe(true)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      const heap = new BimodalHeap<number>()
      expect(heap.toArray()).toEqual([])
    })

    it('should return all elements', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      const arr = heap.toArray()
      expect(arr.sort()).toEqual([1, 2, 3])
    })

    it('should not include deleted elements', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.deleteMin()
      const arr = heap.toArray()
      expect(arr.sort()).toEqual([2, 3])
    })
  })

  describe('fromArray', () => {
    it('should build heap from array', () => {
      const heap = new BimodalHeap<number>()
      heap.fromArray([5, 3, 8, 1, 9])
      expect(heap.size()).toBe(5)
      expect(heap.findMin()).toBe(1)
      expect(heap.findMax()).toBe(9)
    })

    it('should replace existing elements', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(100)
      heap.insert(200)
      heap.fromArray([1, 2, 3])
      expect(heap.size()).toBe(3)
      expect(heap.findMin()).toBe(1)
      expect(heap.findMax()).toBe(3)
    })

    it('should handle empty array', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(1)
      heap.fromArray([])
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('merge', () => {
    it('should merge two heaps', () => {
      const heap1 = new BimodalHeap<number>()
      heap1.insert(1)
      heap1.insert(5)

      const heap2 = new BimodalHeap<number>()
      heap2.insert(3)
      heap2.insert(10)

      heap1.merge(heap2)
      expect(heap1.size()).toBe(4)
      expect(heap1.findMin()).toBe(1)
      expect(heap1.findMax()).toBe(10)
    })

    it('should not modify the source heap', () => {
      const heap1 = new BimodalHeap<number>()
      heap1.insert(1)

      const heap2 = new BimodalHeap<number>()
      heap2.insert(10)

      heap1.merge(heap2)
      expect(heap2.size()).toBe(1)
      expect(heap2.findMin()).toBe(10)
    })

    it('should merge with empty heap', () => {
      const heap1 = new BimodalHeap<number>()
      heap1.insert(5)

      const heap2 = new BimodalHeap<number>()
      heap1.merge(heap2)
      expect(heap1.size()).toBe(1)
    })
  })

  describe('replaceMin', () => {
    it('should replace the minimum and return old min', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(1)
      heap.insert(5)
      heap.insert(10)
      const old = heap.replaceMin(3)
      expect(old).toBe(1)
      expect(heap.size()).toBe(3)
      expect(heap.findMin()).toBe(3)
    })

    it('should throw on empty heap (and insert value)', () => {
      const heap = new BimodalHeap<number>()
      expect(() => heap.replaceMin(5)).toThrow('Heap was empty')
      expect(heap.size()).toBe(1)
      expect(heap.findMin()).toBe(5)
    })
  })

  describe('replaceMax', () => {
    it('should replace the maximum and return old max', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(1)
      heap.insert(5)
      heap.insert(10)
      const old = heap.replaceMax(7)
      expect(old).toBe(10)
      expect(heap.size()).toBe(3)
      expect(heap.findMax()).toBe(7)
    })

    it('should throw on empty heap (and insert value)', () => {
      const heap = new BimodalHeap<number>()
      expect(() => heap.replaceMax(5)).toThrow('Heap was empty')
      expect(heap.size()).toBe(1)
      expect(heap.findMax()).toBe(5)
    })
  })

  describe('custom comparator', () => {
    it('should work with reverse comparator', () => {
      const heap = new BimodalHeap<number>({
        comparator: (a, b) => b - a,
      })
      heap.insert(1)
      heap.insert(5)
      heap.insert(10)
      expect(heap.findMin()).toBe(10)
      expect(heap.findMax()).toBe(1)
    })

    it('should work with string values', () => {
      const heap = new BimodalHeap<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      heap.insert('cherry')
      heap.insert('apple')
      heap.insert('banana')
      expect(heap.findMin()).toBe('apple')
      expect(heap.findMax()).toBe('cherry')
    })

    it('should work with object values using key comparator', () => {
      interface Item {
        priority: number
        name: string
      }
      const heap = new BimodalHeap<Item>({
        comparator: (a, b) => a.priority - b.priority,
      })
      heap.insert({ priority: 3, name: 'low' })
      heap.insert({ priority: 1, name: 'high' })
      heap.insert({ priority: 2, name: 'medium' })
      expect(heap.findMin()!.name).toBe('high')
      expect(heap.findMax()!.name).toBe('low')
    })
  })

  describe('large scale operations', () => {
    it('should handle many insertions and deletions', () => {
      const heap = new BimodalHeap<number>()
      const count = 100
      for (let i = 0; i < count; i++) {
        heap.insert(i)
      }
      expect(heap.size()).toBe(count)
      expect(heap.findMin()).toBe(0)
      expect(heap.findMax()).toBe(count - 1)

      for (let i = 0; i < count / 2; i++) {
        heap.deleteMin()
      }
      expect(heap.size()).toBe(count / 2)
      expect(heap.findMin()).toBe(count / 2)
    })

    it('should handle mixed operations at scale', () => {
      const heap = new BimodalHeap<number>()
      for (let i = 0; i < 50; i++) heap.insert(i)
      for (let i = 0; i < 10; i++) heap.deleteMin()
      for (let i = 0; i < 10; i++) heap.deleteMax()
      for (let i = 50; i < 60; i++) heap.insert(i)
      expect(heap.size()).toBe(40)
    })
  })

  describe('cleanup behavior', () => {
    it('should handle many value deletions triggering cleanup', () => {
      const heap = new BimodalHeap<number>()
      for (let i = 0; i < 50; i++) heap.insert(i)
      for (let i = 0; i < 35; i++) {
        heap.delete(i)
      }
      expect(heap.size()).toBe(15)
      expect(heap.findMin()).toBe(35)
      expect(heap.findMax()).toBe(49)
    })

    it('should handle interleaved min/max deletions with cleanup', () => {
      const heap = new BimodalHeap<number>()
      for (let i = 0; i < 40; i++) heap.insert(i)
      for (let i = 0; i < 20; i++) heap.deleteMin()
      for (let i = 0; i < 15; i++) heap.deleteMax()
      expect(heap.size()).toBe(5)
      expect(heap.findMin()).toBe(20)
      expect(heap.findMax()).toBe(24)
    })
  })

  describe('edge cases', () => {
    it('should handle inserting then deleting all via deleteMin', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.deleteMin()
      heap.deleteMin()
      heap.deleteMin()
      expect(heap.isEmpty()).toBe(true)
      expect(heap.findMin()).toBeUndefined()
      expect(heap.findMax()).toBeUndefined()
    })

    it('should handle inserting then deleting all via deleteMax', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.deleteMax()
      heap.deleteMax()
      heap.deleteMax()
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle clear after deletions', () => {
      const heap = new BimodalHeap<number>()
      for (let i = 0; i < 20; i++) heap.insert(i)
      heap.deleteMin()
      heap.deleteMax()
      heap.clear()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle repeated min/max on two elements', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(1)
      heap.insert(2)
      expect(heap.deleteMin()).toBe(1)
      expect(heap.deleteMax()).toBe(2)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle zero values', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(0)
      heap.insert(-1)
      heap.insert(1)
      expect(heap.findMin()).toBe(-1)
      expect(heap.findMax()).toBe(1)
    })

    it('should handle floating point values', () => {
      const heap = new BimodalHeap<number>()
      heap.insert(1.5)
      heap.insert(2.7)
      heap.insert(0.3)
      expect(heap.findMin()).toBeCloseTo(0.3)
      expect(heap.findMax()).toBeCloseTo(2.7)
    })
  })
})
