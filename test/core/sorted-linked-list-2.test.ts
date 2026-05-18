import { describe, it, expect } from 'vitest'
import { SortedLinkedList2 } from '../../src/core/sorted-linked-list-2/index.js'

describe('SortedLinkedList2', () => {
  describe('constructor', () => {
    it('should create an empty list with default comparator', () => {
      const list = new SortedLinkedList2<number>()
      expect(list.size()).toBe(0)
      expect(list.toArray()).toEqual([])
    })

    it('should accept a custom comparator', () => {
      const list = new SortedLinkedList2<number>((a, b) => b - a)
      expect(list.size()).toBe(0)
    })
  })

  // ─── Insert ───

  describe('insert', () => {
    it('should insert a single element', () => {
      const list = new SortedLinkedList2<number>()
      list.insert(5)
      expect(list.size()).toBe(1)
      expect(list.toArray()).toEqual([5])
    })

    it('should maintain sorted order (ascending)', () => {
      const list = new SortedLinkedList2<number>()
      list.insert(3)
      list.insert(1)
      list.insert(2)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('should insert at the beginning', () => {
      const list = new SortedLinkedList2<number>()
      list.insert(5)
      list.insert(1)
      expect(list.toArray()).toEqual([1, 5])
    })

    it('should insert at the end', () => {
      const list = new SortedLinkedList2<number>()
      list.insert(1)
      list.insert(5)
      expect(list.toArray()).toEqual([1, 5])
    })

    it('should handle duplicates', () => {
      const list = new SortedLinkedList2<number>()
      list.insert(3)
      list.insert(3)
      list.insert(3)
      expect(list.toArray()).toEqual([3, 3, 3])
      expect(list.size()).toBe(3)
    })

    it('should handle negative numbers', () => {
      const list = new SortedLinkedList2<number>()
      list.insert(-3)
      list.insert(0)
      list.insert(-7)
      list.insert(2)
      expect(list.toArray()).toEqual([-7, -3, 0, 2])
    })

    it('should handle single element', () => {
      const list = new SortedLinkedList2<number>()
      list.insert(42)
      expect(list.size()).toBe(1)
      expect(list.min()).toBe(42)
      expect(list.max()).toBe(42)
    })
  })

  // ─── Has ───

  describe('has', () => {
    it('should return false for empty list', () => {
      const list = new SortedLinkedList2<number>()
      expect(list.has(5)).toBe(false)
    })

    it('should find existing element', () => {
      const list = new SortedLinkedList2<number>()
      list.insert(1)
      list.insert(3)
      list.insert(5)
      expect(list.has(1)).toBe(true)
      expect(list.has(3)).toBe(true)
      expect(list.has(5)).toBe(true)
    })

    it('should return false for non-existing element', () => {
      const list = new SortedLinkedList2<number>()
      list.insert(1)
      list.insert(3)
      expect(list.has(2)).toBe(false)
      expect(list.has(99)).toBe(false)
    })

    it('should handle duplicates', () => {
      const list = new SortedLinkedList2<number>()
      list.insert(3)
      list.insert(3)
      expect(list.has(3)).toBe(true)
    })
  })

  // ─── Delete ───

  describe('delete', () => {
    it('should return false for empty list', () => {
      const list = new SortedLinkedList2<number>()
      expect(list.delete(5)).toBe(false)
    })

    it('should delete the only element', () => {
      const list = new SortedLinkedList2<number>()
      list.insert(10)
      expect(list.delete(10)).toBe(true)
      expect(list.size()).toBe(0)
      expect(list.toArray()).toEqual([])
    })

    it('should delete head element', () => {
      const list = new SortedLinkedList2<number>()
      list.insert(1)
      list.insert(2)
      list.insert(3)
      expect(list.delete(1)).toBe(true)
      expect(list.toArray()).toEqual([2, 3])
    })

    it('should delete middle element', () => {
      const list = new SortedLinkedList2<number>()
      list.insert(1)
      list.insert(2)
      list.insert(3)
      expect(list.delete(2)).toBe(true)
      expect(list.toArray()).toEqual([1, 3])
    })

    it('should delete tail element', () => {
      const list = new SortedLinkedList2<number>()
      list.insert(1)
      list.insert(2)
      list.insert(3)
      expect(list.delete(3)).toBe(true)
      expect(list.toArray()).toEqual([1, 2])
    })

    it('should return false for non-existing element', () => {
      const list = new SortedLinkedList2<number>()
      list.insert(1)
      list.insert(3)
      expect(list.delete(2)).toBe(false)
      expect(list.size()).toBe(2)
    })

    it('should delete only first occurrence of duplicates', () => {
      const list = new SortedLinkedList2<number>()
      list.insert(3)
      list.insert(3)
      list.insert(3)
      expect(list.delete(3)).toBe(true)
      expect(list.size()).toBe(2)
      expect(list.toArray()).toEqual([3, 3])
    })
  })

  // ─── Min and Max ───

  describe('min and max', () => {
    it('should return undefined for empty list', () => {
      const list = new SortedLinkedList2<number>()
      expect(list.min()).toBeUndefined()
      expect(list.max()).toBeUndefined()
    })

    it('should return same value for single element', () => {
      const list = new SortedLinkedList2<number>()
      list.insert(5)
      expect(list.min()).toBe(5)
      expect(list.max()).toBe(5)
    })

    it('should return correct min and max', () => {
      const list = new SortedLinkedList2<number>()
      list.insert(3)
      list.insert(1)
      list.insert(5)
      list.insert(2)
      expect(list.min()).toBe(1)
      expect(list.max()).toBe(5)
    })

    it('should handle negatives', () => {
      const list = new SortedLinkedList2<number>()
      list.insert(-5)
      list.insert(-1)
      list.insert(-3)
      expect(list.min()).toBe(-5)
      expect(list.max()).toBe(-1)
    })
  })

  // ─── Size ───

  describe('size', () => {
    it('should track size through operations', () => {
      const list = new SortedLinkedList2<number>()
      expect(list.size()).toBe(0)
      list.insert(1)
      expect(list.size()).toBe(1)
      list.insert(2)
      expect(list.size()).toBe(2)
      list.delete(1)
      expect(list.size()).toBe(1)
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('should clear all elements', () => {
      const list = new SortedLinkedList2<number>()
      list.insert(1)
      list.insert(2)
      list.insert(3)
      list.clear()
      expect(list.size()).toBe(0)
      expect(list.toArray()).toEqual([])
      expect(list.min()).toBeUndefined()
      expect(list.max()).toBeUndefined()
    })

    it('should allow insertions after clear', () => {
      const list = new SortedLinkedList2<number>()
      list.insert(5)
      list.clear()
      list.insert(3)
      expect(list.size()).toBe(1)
      expect(list.toArray()).toEqual([3])
    })
  })

  // ─── ToArray ───

  describe('toArray', () => {
    it('should return empty array for empty list', () => {
      const list = new SortedLinkedList2<number>()
      expect(list.toArray()).toEqual([])
    })

    it('should return sorted array', () => {
      const list = new SortedLinkedList2<number>()
      list.insert(5)
      list.insert(1)
      list.insert(3)
      expect(list.toArray()).toEqual([1, 3, 5])
    })

    it('should not modify the list', () => {
      const list = new SortedLinkedList2<number>()
      list.insert(2)
      list.insert(1)
      list.toArray()
      expect(list.size()).toBe(2)
    })
  })

  // ─── ForEach ───

  describe('forEach', () => {
    it('should not call callback for empty list', () => {
      const list = new SortedLinkedList2<number>()
      const items: number[] = []
      list.forEach(item => items.push(item))
      expect(items).toEqual([])
    })

    it('should iterate all elements in order', () => {
      const list = new SortedLinkedList2<number>()
      list.insert(3)
      list.insert(1)
      list.insert(2)
      const items: number[] = []
      list.forEach(item => items.push(item))
      expect(items).toEqual([1, 2, 3])
    })

    it('should provide correct index', () => {
      const list = new SortedLinkedList2<number>()
      list.insert(10)
      list.insert(20)
      list.insert(30)
      const indices: number[] = []
      list.forEach((_item, index) => indices.push(index))
      expect(indices).toEqual([0, 1, 2])
    })
  })

  // ─── Custom Comparator ───

  describe('custom comparator', () => {
    it('should sort in descending order', () => {
      const list = new SortedLinkedList2<number>((a, b) => b - a)
      list.insert(3)
      list.insert(1)
      list.insert(2)
      expect(list.toArray()).toEqual([3, 2, 1])
    })

    it('should work with has/delete using descending comparator', () => {
      const list = new SortedLinkedList2<number>((a, b) => b - a)
      list.insert(3)
      list.insert(1)
      expect(list.has(3)).toBe(true)
      expect(list.has(1)).toBe(true)
      expect(list.has(2)).toBe(false)
      expect(list.delete(3)).toBe(true)
      expect(list.toArray()).toEqual([1])
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('should handle many insertions', () => {
      const list = new SortedLinkedList2<number>()
      const n = 50
      for (let i = n; i >= 1; i--) {
        list.insert(i)
      }
      expect(list.size()).toBe(n)
      expect(list.min()).toBe(1)
      expect(list.max()).toBe(n)
      const arr = list.toArray()
      for (let i = 0; i < arr.length - 1; i++) {
        expect(arr[i]! <= arr[i + 1]!).toBe(true)
      }
    })

    it('should handle all same values', () => {
      const list = new SortedLinkedList2<number>()
      for (let i = 0; i < 5; i++) {
        list.insert(7)
      }
      expect(list.size()).toBe(5)
      expect(list.toArray()).toEqual([7, 7, 7, 7, 7])
    })
  })
})
