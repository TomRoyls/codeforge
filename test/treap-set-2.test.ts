/// <reference types="vitest" />
import { describe, it, expect } from 'vitest'
import { TreapSet2 } from './src/core/treap-set-2/index.js'

describe('TreapSet2', () => {
  describe('Empty treap set', () => {
    it('should create empty treap set', () => {
      const treap = new TreapSet2<number>()
      expect(treap.isEmpty()).toBe(true)
      expect(treap.size).toBe(0)
    })

    it('should return undefined for min on empty treap', () => {
      const treap = new TreapSet2<number>()
      expect(treap.min()).toBeUndefined()
    })

    it('should return undefined for max on empty treap', () => {
      const treap = new TreapSet2<number>()
      expect(treap.max()).toBeUndefined()
    })

    it('should return false for has on empty treap', () => {
      const treap = new TreapSet2<number>()
      expect(treap.has(5)).toBe(false)
    })

    it('should return empty array for toArray on empty treap', () => {
      const treap = new TreapSet2<number>()
      expect(treap.toArray()).toEqual([])
    })

    it('should return false for delete on empty treap', () => {
      const treap = new TreapSet2<number>()
      expect(treap.delete(5)).toBe(false)
    })
  })

  describe('Single element', () => {
    it('should add single element', () => {
      const treap = new TreapSet2<number>()
      treap.add(5)
      expect(treap.size).toBe(1)
      expect(treap.isEmpty()).toBe(false)
    })

    it('should find single element after add', () => {
      const treap = new TreapSet2<number>()
      treap.add(5)
      expect(treap.has(5)).toBe(true)
    })

    it('should not find element not in single element treap', () => {
      const treap = new TreapSet2<number>()
      treap.add(5)
      expect(treap.has(10)).toBe(false)
    })

    it('should return same value for min and max with single element', () => {
      const treap = new TreapSet2<number>()
      treap.add(5)
      expect(treap.min()).toBe(5)
      expect(treap.max()).toBe(5)
    })

    it('should delete single element', () => {
      const treap = new TreapSet2<number>()
      treap.add(5)
      expect(treap.delete(5)).toBe(true)
      expect(treap.isEmpty()).toBe(true)
    })

    it('should clear single element treap', () => {
      const treap = new TreapSet2<number>()
      treap.add(5)
      treap.clear()
      expect(treap.isEmpty()).toBe(true)
      expect(treap.size).toBe(0)
    })
  })

  describe('Sequential adds', () => {
    it('should add multiple elements in order', () => {
      const treap = new TreapSet2<number>()
      treap.add(1)
      treap.add(2)
      treap.add(3)
      expect(treap.size).toBe(3)
    })

    it('should find all elements after sequential add', () => {
      const treap = new TreapSet2<number>()
      treap.add(1)
      treap.add(2)
      treap.add(3)
      expect(treap.has(1)).toBe(true)
      expect(treap.has(2)).toBe(true)
      expect(treap.has(3)).toBe(true)
    })

    it('should return correct min after sequential adds', () => {
      const treap = new TreapSet2<number>()
      treap.add(5)
      treap.add(3)
      treap.add(7)
      expect(treap.min()).toBe(3)
    })

    it('should return correct max after sequential adds', () => {
      const treap = new TreapSet2<number>()
      treap.add(5)
      treap.add(3)
      treap.add(7)
      expect(treap.max()).toBe(7)
    })

    it('should return sorted array after sequential adds', () => {
      const treap = new TreapSet2<number>()
      treap.add(5)
      treap.add(3)
      treap.add(7)
      treap.add(1)
      expect(treap.toArray()).toEqual([1, 3, 5, 7])
    })
  })

  describe('Random adds', () => {
    it('should add elements in random order', () => {
      const treap = new TreapSet2<number>()
      treap.add(5)
      treap.add(1)
      treap.add(10)
      treap.add(3)
      treap.add(8)
      expect(treap.size).toBe(5)
    })

    it('should find all elements after random adds', () => {
      const treap = new TreapSet2<number>()
      const values = [5, 1, 10, 3, 8]
      values.forEach(v => treap.add(v))
      values.forEach(v => expect(treap.has(v)).toBe(true))
    })

    it('should maintain correct order after random adds', () => {
      const treap = new TreapSet2<number>()
      treap.add(5)
      treap.add(1)
      treap.add(10)
      treap.add(3)
      treap.add(8)
      expect(treap.min()).toBe(1)
      expect(treap.max()).toBe(10)
    })
  })

  describe('Delete operations', () => {
    it('should delete element from middle of treap', () => {
      const treap = new TreapSet2<number>()
      treap.add(1)
      treap.add(2)
      treap.add(3)
      expect(treap.delete(2)).toBe(true)
      expect(treap.size).toBe(2)
    })

    it('should delete min element', () => {
      const treap = new TreapSet2<number>()
      treap.add(1)
      treap.add(2)
      treap.add(3)
      expect(treap.delete(1)).toBe(true)
      expect(treap.min()).toBe(2)
    })

    it('should delete max element', () => {
      const treap = new TreapSet2<number>()
      treap.add(1)
      treap.add(2)
      treap.add(3)
      expect(treap.delete(3)).toBe(true)
      expect(treap.max()).toBe(2)
    })

    it('should return false when deleting non-existent element', () => {
      const treap = new TreapSet2<number>()
      treap.add(1)
      treap.add(2)
      treap.add(3)
      expect(treap.delete(10)).toBe(false)
      expect(treap.size).toBe(3)
    })

    it('should delete all elements one by one', () => {
      const treap = new TreapSet2<number>()
      treap.add(1)
      treap.add(2)
      treap.add(3)
      expect(treap.delete(1)).toBe(true)
      expect(treap.delete(2)).toBe(true)
      expect(treap.delete(3)).toBe(true)
      expect(treap.isEmpty()).toBe(true)
    })
  })

  describe('Has after delete', () => {
    it('should not find element after delete', () => {
      const treap = new TreapSet2<number>()
      treap.add(5)
      treap.delete(5)
      expect(treap.has(5)).toBe(false)
    })

    it('should find remaining elements after delete', () => {
      const treap = new TreapSet2<number>()
      treap.add(1)
      treap.add(2)
      treap.add(3)
      treap.delete(2)
      expect(treap.has(1)).toBe(true)
      expect(treap.has(3)).toBe(true)
    })
  })

  describe('Size', () => {
    it('should report correct size after adds', () => {
      const treap = new TreapSet2<number>()
      for (let i = 0; i < 10; i++) {
        treap.add(i)
        expect(treap.size).toBe(i + 1)
      }
    })

    it('should report correct size after deletes', () => {
      const treap = new TreapSet2<number>()
      for (let i = 0; i < 10; i++) {
        treap.add(i)
      }
      treap.delete(5)
      expect(treap.size).toBe(9)
    })

    it('should report zero after clear', () => {
      const treap = new TreapSet2<number>()
      for (let i = 0; i < 10; i++) {
        treap.add(i)
      }
      treap.clear()
      expect(treap.size).toBe(0)
    })
  })

  describe('IsEmpty', () => {
    it('should return true for empty treap', () => {
      const treap = new TreapSet2<number>()
      expect(treap.isEmpty()).toBe(true)
    })

    it('should return false after add', () => {
      const treap = new TreapSet2<number>()
      treap.add(1)
      expect(treap.isEmpty()).toBe(false)
    })

    it('should return true after clear', () => {
      const treap = new TreapSet2<number>()
      treap.add(1)
      treap.clear()
      expect(treap.isEmpty()).toBe(true)
    })
  })

  describe('Clear', () => {
    it('should clear all elements', () => {
      const treap = new TreapSet2<number>()
      treap.add(1)
      treap.add(2)
      treap.add(3)
      treap.clear()
      expect(treap.isEmpty()).toBe(true)
      expect(treap.size).toBe(0)
    })

    it('should allow adds after clear', () => {
      const treap = new TreapSet2<number>()
      treap.add(1)
      treap.clear()
      treap.add(2)
      expect(treap.has(2)).toBe(true)
      expect(treap.size).toBe(1)
    })
  })

  describe('ToArray', () => {
    it('should return empty array for empty treap', () => {
      const treap = new TreapSet2<number>()
      expect(treap.toArray()).toEqual([])
    })

    it('should return sorted array', () => {
      const treap = new TreapSet2<number>()
      treap.add(3)
      treap.add(1)
      treap.add(2)
      expect(treap.toArray()).toEqual([1, 2, 3])
    })

    it('should work with many elements', () => {
      const treap = new TreapSet2<number>()
      const values = [5, 3, 7, 1, 9, 2, 8, 4, 6]
      values.forEach(v => treap.add(v))
      expect(treap.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  describe('Union', () => {
    it('should union empty with empty', () => {
      const treap1 = new TreapSet2<number>()
      const treap2 = new TreapSet2<number>()
      const result = treap1.union(treap2)
      expect(result.size).toBe(0)
      expect(result.toArray()).toEqual([])
    })

    it('should union non-empty with empty', () => {
      const treap1 = new TreapSet2<number>()
      treap1.add(1)
      treap1.add(2)
      const treap2 = new TreapSet2<number>()
      const result = treap1.union(treap2)
      expect(result.size).toBe(2)
      expect(result.toArray()).toEqual([1, 2])
    })

    it('should union two non-empty disjoint treaps', () => {
      const treap1 = new TreapSet2<number>()
      treap1.add(1)
      treap1.add(2)
      const treap2 = new TreapSet2<number>()
      treap2.add(3)
      treap2.add(4)
      const result = treap1.union(treap2)
      expect(result.size).toBe(4)
      expect(result.toArray()).toEqual([1, 2, 3, 4])
    })

    it('should union two non-empty overlapping treaps', () => {
      const treap1 = new TreapSet2<number>()
      treap1.add(1)
      treap1.add(2)
      treap1.add(3)
      const treap2 = new TreapSet2<number>()
      treap2.add(2)
      treap2.add(3)
      treap2.add(4)
      const result = treap1.union(treap2)
      expect(result.size).toBe(4)
      expect(result.toArray()).toEqual([1, 2, 3, 4])
    })
  })

  describe('Intersection', () => {
    it('should intersect empty with empty', () => {
      const treap1 = new TreapSet2<number>()
      const treap2 = new TreapSet2<number>()
      const result = treap1.intersection(treap2)
      expect(result.size).toBe(0)
      expect(result.toArray()).toEqual([])
    })

    it('should intersect non-empty with empty', () => {
      const treap1 = new TreapSet2<number>()
      treap1.add(1)
      treap1.add(2)
      const treap2 = new TreapSet2<number>()
      const result = treap1.intersection(treap2)
      expect(result.size).toBe(0)
      expect(result.toArray()).toEqual([])
    })

    it('should intersect two disjoint treaps', () => {
      const treap1 = new TreapSet2<number>()
      treap1.add(1)
      treap1.add(2)
      const treap2 = new TreapSet2<number>()
      treap2.add(3)
      treap2.add(4)
      const result = treap1.intersection(treap2)
      expect(result.size).toBe(0)
      expect(result.toArray()).toEqual([])
    })

    it('should intersect two overlapping treaps', () => {
      const treap1 = new TreapSet2<number>()
      treap1.add(1)
      treap1.add(2)
      treap1.add(3)
      const treap2 = new TreapSet2<number>()
      treap2.add(2)
      treap2.add(3)
      treap2.add(4)
      const result = treap1.intersection(treap2)
      expect(result.size).toBe(2)
      expect(result.toArray()).toEqual([2, 3])
    })

    it('should handle all elements in intersection', () => {
      const treap1 = new TreapSet2<number>()
      treap1.add(1)
      treap1.add(2)
      treap1.add(3)
      const treap2 = new TreapSet2<number>()
      treap2.add(1)
      treap2.add(2)
      treap2.add(3)
      const result = treap1.intersection(treap2)
      expect(result.size).toBe(3)
      expect(result.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('Duplicate values', () => {
    it('should not add duplicate value', () => {
      const treap = new TreapSet2<number>()
      treap.add(5)
      treap.add(5)
      expect(treap.size).toBe(1)
    })

    it('should handle duplicate value deletion', () => {
      const treap = new TreapSet2<number>()
      treap.add(5)
      expect(treap.delete(5)).toBe(true)
      expect(treap.size).toBe(0)
    })
  })

  describe('Custom comparator', () => {
    it('should work with custom comparator for strings', () => {
      const treap = new TreapSet2<string>((a, b) => a.localeCompare(b))
      treap.add('banana')
      treap.add('apple')
      treap.add('cherry')
      expect(treap.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should work with reverse comparator', () => {
      const treap = new TreapSet2<number>((a, b) => b - a)
      treap.add(1)
      treap.add(2)
      treap.add(3)
      expect(treap.toArray()).toEqual([3, 2, 1])
    })
  })

  describe('Many elements', () => {
    it('should handle 100 elements', () => {
      const treap = new TreapSet2<number>()
      for (let i = 0; i < 100; i++) {
        treap.add(i)
      }
      expect(treap.size).toBe(100)
      expect(treap.min()).toBe(0)
      expect(treap.max()).toBe(99)
    })

    it('should find all elements in large treap', () => {
      const treap = new TreapSet2<number>()
      for (let i = 0; i < 50; i++) {
        treap.add(i)
      }
      for (let i = 0; i < 50; i++) {
        expect(treap.has(i)).toBe(true)
      }
    })

    it('should delete all elements from large treap', () => {
      const treap = new TreapSet2<number>()
      for (let i = 0; i < 50; i++) {
        treap.add(i)
      }
      for (let i = 0; i < 50; i++) {
        expect(treap.delete(i)).toBe(true)
      }
      expect(treap.isEmpty()).toBe(true)
    })
  })
})
