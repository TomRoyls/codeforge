/// <reference types="vitest" />
import { describe, it, expect, vi } from 'vitest'
import { Treap4 } from './src/core/treap-4/index.js'

describe('Treap4', () => {
  describe('Empty treap', () => {
    it('should create empty treap', () => {
      const treap = new Treap4<number>()
      expect(treap.isEmpty).toBe(true)
      expect(treap.size).toBe(0)
    })

    it('should return null for min on empty treap', () => {
      const treap = new Treap4<number>()
      expect(treap.min()).toBe(null)
    })

    it('should return null for max on empty treap', () => {
      const treap = new Treap4<number>()
      expect(treap.max()).toBe(null)
    })

    it('should return false for search on empty treap', () => {
      const treap = new Treap4<number>()
      expect(treap.search(5)).toBe(false)
    })

    it('should return false for contains on empty treap', () => {
      const treap = new Treap4<number>()
      expect(treap.contains(5)).toBe(false)
    })

    it('should return empty array for toArray on empty treap', () => {
      const treap = new Treap4<number>()
      expect(treap.toArray()).toEqual([])
    })

    it('should not throw error on forEach with empty treap', () => {
      const treap = new Treap4<number>()
      const callback = vi.fn()
      treap.forEach(callback)
      expect(callback).not.toHaveBeenCalled()
    })

    it('should split empty treap into two empty treaps', () => {
      const treap = new Treap4<number>()
      const [left, right] = treap.split(5)
      expect(left.isEmpty).toBe(true)
      expect(right.isEmpty).toBe(true)
    })

    it('should delete from empty treap and return false', () => {
      const treap = new Treap4<number>()
      expect(treap.delete(5)).toBe(false)
    })
  })

  describe('Single element', () => {
    it('should insert single element', () => {
      const treap = new Treap4<number>()
      treap.insert(5)
      expect(treap.size).toBe(1)
      expect(treap.isEmpty).toBe(false)
    })

    it('should find single element after insert', () => {
      const treap = new Treap4<number>()
      treap.insert(5)
      expect(treap.search(5)).toBe(true)
    })

    it('should not find element not in single element treap', () => {
      const treap = new Treap4<number>()
      treap.insert(5)
      expect(treap.search(10)).toBe(false)
    })

    it('should return same value for min and max with single element', () => {
      const treap = new Treap4<number>()
      treap.insert(5)
      expect(treap.min()).toBe(5)
      expect(treap.max()).toBe(5)
    })

    it('should delete single element', () => {
      const treap = new Treap4<number>()
      treap.insert(5)
      expect(treap.delete(5)).toBe(true)
      expect(treap.isEmpty).toBe(true)
    })

    it('should clear single element treap', () => {
      const treap = new Treap4<number>()
      treap.insert(5)
      treap.clear()
      expect(treap.isEmpty).toBe(true)
      expect(treap.size).toBe(0)
    })
  })

  describe('Sequential inserts', () => {
    it('should insert multiple elements in order', () => {
      const treap = new Treap4<number>()
      treap.insert(1)
      treap.insert(2)
      treap.insert(3)
      expect(treap.size).toBe(3)
    })

    it('should find all elements after sequential insert', () => {
      const treap = new Treap4<number>()
      treap.insert(1)
      treap.insert(2)
      treap.insert(3)
      expect(treap.search(1)).toBe(true)
      expect(treap.search(2)).toBe(true)
      expect(treap.search(3)).toBe(true)
    })

    it('should return correct min after sequential inserts', () => {
      const treap = new Treap4<number>()
      treap.insert(5)
      treap.insert(3)
      treap.insert(7)
      expect(treap.min()).toBe(3)
    })

    it('should return correct max after sequential inserts', () => {
      const treap = new Treap4<number>()
      treap.insert(5)
      treap.insert(3)
      treap.insert(7)
      expect(treap.max()).toBe(7)
    })

    it('should return sorted array after sequential inserts', () => {
      const treap = new Treap4<number>()
      treap.insert(5)
      treap.insert(3)
      treap.insert(7)
      treap.insert(1)
      expect(treap.toArray()).toEqual([1, 3, 5, 7])
    })
  })

  describe('Random inserts', () => {
    it('should insert elements in random order', () => {
      const treap = new Treap4<number>()
      treap.insert(5)
      treap.insert(1)
      treap.insert(10)
      treap.insert(3)
      treap.insert(8)
      expect(treap.size).toBe(5)
    })

    it('should find all elements after random inserts', () => {
      const treap = new Treap4<number>()
      const values = [5, 1, 10, 3, 8]
      values.forEach(v => treap.insert(v))
      values.forEach(v => expect(treap.search(v)).toBe(true))
    })

    it('should maintain correct order after random inserts', () => {
      const treap = new Treap4<number>()
      treap.insert(5)
      treap.insert(1)
      treap.insert(10)
      treap.insert(3)
      treap.insert(8)
      expect(treap.min()).toBe(1)
      expect(treap.max()).toBe(10)
    })
  })

  describe('Delete operations', () => {
    it('should delete element from middle of treap', () => {
      const treap = new Treap4<number>()
      treap.insert(1)
      treap.insert(2)
      treap.insert(3)
      expect(treap.delete(2)).toBe(true)
      expect(treap.size).toBe(2)
    })

    it('should delete min element', () => {
      const treap = new Treap4<number>()
      treap.insert(1)
      treap.insert(2)
      treap.insert(3)
      expect(treap.delete(1)).toBe(true)
      expect(treap.min()).toBe(2)
    })

    it('should delete max element', () => {
      const treap = new Treap4<number>()
      treap.insert(1)
      treap.insert(2)
      treap.insert(3)
      expect(treap.delete(3)).toBe(true)
      expect(treap.max()).toBe(2)
    })

    it('should return false when deleting non-existent element', () => {
      const treap = new Treap4<number>()
      treap.insert(1)
      treap.insert(2)
      treap.insert(3)
      expect(treap.delete(10)).toBe(false)
      expect(treap.size).toBe(3)
    })

    it('should delete all elements one by one', () => {
      const treap = new Treap4<number>()
      treap.insert(1)
      treap.insert(2)
      treap.insert(3)
      expect(treap.delete(1)).toBe(true)
      expect(treap.delete(2)).toBe(true)
      expect(treap.delete(3)).toBe(true)
      expect(treap.isEmpty).toBe(true)
    })
  })

  describe('Delete then search', () => {
    it('should not find element after delete', () => {
      const treap = new Treap4<number>()
      treap.insert(5)
      treap.delete(5)
      expect(treap.search(5)).toBe(false)
    })

    it('should find remaining elements after delete', () => {
      const treap = new Treap4<number>()
      treap.insert(1)
      treap.insert(2)
      treap.insert(3)
      treap.delete(2)
      expect(treap.search(1)).toBe(true)
      expect(treap.search(3)).toBe(true)
    })

    it('should maintain correct structure after multiple deletes', () => {
      const treap = new Treap4<number>()
      for (let i = 0; i < 10; i++) {
        treap.insert(i)
      }
      treap.delete(5)
      treap.delete(7)
      expect(treap.search(5)).toBe(false)
      expect(treap.search(7)).toBe(false)
      expect(treap.search(6)).toBe(true)
      expect(treap.search(8)).toBe(true)
    })
  })

  describe('Contains', () => {
    it('should return true for contains when element exists', () => {
      const treap = new Treap4<number>()
      treap.insert(5)
      expect(treap.contains(5)).toBe(true)
    })

    it('should return false for contains when element does not exist', () => {
      const treap = new Treap4<number>()
      treap.insert(5)
      expect(treap.contains(10)).toBe(false)
    })

    it('should work with string values', () => {
      const treap = new Treap4<string>()
      treap.insert('hello')
      expect(treap.contains('hello')).toBe(true)
      expect(treap.contains('world')).toBe(false)
    })
  })

  describe('Size', () => {
    it('should report correct size after inserts', () => {
      const treap = new Treap4<number>()
      for (let i = 0; i < 10; i++) {
        treap.insert(i)
        expect(treap.size).toBe(i + 1)
      }
    })

    it('should report correct size after deletes', () => {
      const treap = new Treap4<number>()
      for (let i = 0; i < 10; i++) {
        treap.insert(i)
      }
      treap.delete(5)
      expect(treap.size).toBe(9)
    })

    it('should report zero after clear', () => {
      const treap = new Treap4<number>()
      for (let i = 0; i < 10; i++) {
        treap.insert(i)
      }
      treap.clear()
      expect(treap.size).toBe(0)
    })
  })

  describe('IsEmpty', () => {
    it('should return true for empty treap', () => {
      const treap = new Treap4<number>()
      expect(treap.isEmpty).toBe(true)
    })

    it('should return false after insert', () => {
      const treap = new Treap4<number>()
      treap.insert(1)
      expect(treap.isEmpty).toBe(false)
    })

    it('should return true after clear', () => {
      const treap = new Treap4<number>()
      treap.insert(1)
      treap.clear()
      expect(treap.isEmpty).toBe(true)
    })
  })

  describe('Clear', () => {
    it('should clear all elements', () => {
      const treap = new Treap4<number>()
      treap.insert(1)
      treap.insert(2)
      treap.insert(3)
      treap.clear()
      expect(treap.isEmpty).toBe(true)
      expect(treap.size).toBe(0)
    })

    it('should allow inserts after clear', () => {
      const treap = new Treap4<number>()
      treap.insert(1)
      treap.clear()
      treap.insert(2)
      expect(treap.search(2)).toBe(true)
      expect(treap.size).toBe(1)
    })
  })

  describe('ToArray', () => {
    it('should return empty array for empty treap', () => {
      const treap = new Treap4<number>()
      expect(treap.toArray()).toEqual([])
    })

    it('should return sorted array', () => {
      const treap = new Treap4<number>()
      treap.insert(3)
      treap.insert(1)
      treap.insert(2)
      expect(treap.toArray()).toEqual([1, 2, 3])
    })

    it('should work with many elements', () => {
      const treap = new Treap4<number>()
      const values = [5, 3, 7, 1, 9, 2, 8, 4, 6]
      values.forEach(v => treap.insert(v))
      expect(treap.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  describe('ForEach', () => {
    it('should call callback for each element', () => {
      const treap = new Treap4<number>()
      treap.insert(1)
      treap.insert(2)
      treap.insert(3)
      const values: number[] = []
      treap.forEach((v) => values.push(v))
      expect(values).toEqual([1, 2, 3])
    })

    it('should pass correct index to callback', () => {
      const treap = new Treap4<number>()
      treap.insert(1)
      treap.insert(2)
      treap.insert(3)
      const indices: number[] = []
      treap.forEach((_, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should not call callback on empty treap', () => {
      const treap = new Treap4<number>()
      const callback = vi.fn()
      treap.forEach(callback)
      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe('Split', () => {
    it('should split empty treap', () => {
      const treap = new Treap4<number>()
      const [left, right] = treap.split(5)
      expect(left.isEmpty).toBe(true)
      expect(right.isEmpty).toBe(true)
    })

    it('should split treap at value', () => {
      const treap = new Treap4<number>()
      treap.insert(1)
      treap.insert(3)
      treap.insert(5)
      const [left, right] = treap.split(3)
      expect(left.toArray()).toEqual([1, 3])
      expect(right.toArray()).toEqual([5])
    })

    it('should split with all elements in left', () => {
      const treap = new Treap4<number>()
      treap.insert(1)
      treap.insert(2)
      treap.insert(3)
      const [left, right] = treap.split(5)
      expect(left.toArray()).toEqual([1, 2, 3])
      expect(right.isEmpty).toBe(true)
    })

    it('should split with all elements in right', () => {
      const treap = new Treap4<number>()
      treap.insert(6)
      treap.insert(7)
      treap.insert(8)
      const [left, right] = treap.split(5)
      expect(left.isEmpty).toBe(true)
      expect(right.toArray()).toEqual([6, 7, 8])
    })

    it('should preserve size in split treaps', () => {
      const treap = new Treap4<number>()
      treap.insert(1)
      treap.insert(2)
      treap.insert(3)
      treap.insert(4)
      treap.insert(5)
      const [left, right] = treap.split(3)
      expect(left.size + right.size).toBe(5)
    })
  })

  describe('Merge', () => {
    it('should merge empty with empty', () => {
      const treap1 = new Treap4<number>()
      const treap2 = new Treap4<number>()
      treap1.merge(treap2)
      expect(treap1.isEmpty).toBe(true)
    })

    it('should merge non-empty with empty', () => {
      const treap1 = new Treap4<number>()
      const treap2 = new Treap4<number>()
      treap1.insert(1)
      treap1.insert(2)
      treap1.merge(treap2)
      expect(treap1.size).toBe(2)
    })

    it('should merge empty with non-empty', () => {
      const treap1 = new Treap4<number>()
      const treap2 = new Treap4<number>()
      treap2.insert(1)
      treap2.insert(2)
      treap1.merge(treap2)
      expect(treap1.size).toBe(2)
    })

    it('should merge two non-empty treaps', () => {
      const treap1 = new Treap4<number>()
      const treap2 = new Treap4<number>()
      treap1.insert(1)
      treap1.insert(2)
      treap2.insert(3)
      treap2.insert(4)
      treap1.merge(treap2)
      expect(treap1.size).toBe(4)
      expect(treap1.toArray()).toEqual([1, 2, 3, 4])
    })

    it('should maintain heap property after merge', () => {
      const treap1 = new Treap4<number>()
      const treap2 = new Treap4<number>()
      for (let i = 0; i < 5; i++) {
        treap1.insert(i)
      }
      for (let i = 5; i < 10; i++) {
        treap2.insert(i)
      }
      treap1.merge(treap2)
      expect(treap1.min()).toBe(0)
      expect(treap1.max()).toBe(9)
    })
  })

  describe('Split and merge combined', () => {
    it('should split and then merge back', () => {
      const treap = new Treap4<number>()
      const values = [1, 2, 3, 4, 5]
      values.forEach(v => treap.insert(v))
      const originalArray = treap.toArray()
      const [left, right] = treap.split(3)
      left.merge(right)
      expect(left.toArray()).toEqual(originalArray)
    })

    it('should preserve all elements through split and merge', () => {
      const treap = new Treap4<number>()
      const values = [5, 3, 7, 1, 9, 2, 8, 4, 6]
      values.forEach(v => treap.insert(v))
      const [left, right] = treap.split(5)
      const merged = new Treap4<number>()
      merged.merge(left).merge(right)
      expect(merged.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  describe('Custom comparator', () => {
    it('should work with custom comparator for strings', () => {
      const treap = new Treap4<string>((a, b) => a.localeCompare(b))
      treap.insert('banana')
      treap.insert('apple')
      treap.insert('cherry')
      expect(treap.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should work with reverse comparator', () => {
      const treap = new Treap4<number>((a, b) => b - a)
      treap.insert(1)
      treap.insert(2)
      treap.insert(3)
      expect(treap.toArray()).toEqual([3, 2, 1])
    })
  })

  describe('Many elements', () => {
    it('should handle 100 elements', () => {
      const treap = new Treap4<number>()
      for (let i = 0; i < 100; i++) {
        treap.insert(i)
      }
      expect(treap.size).toBe(100)
      expect(treap.min()).toBe(0)
      expect(treap.max()).toBe(99)
    })

    it('should find all elements in large treap', () => {
      const treap = new Treap4<number>()
      for (let i = 0; i < 50; i++) {
        treap.insert(i)
      }
      for (let i = 0; i < 50; i++) {
        expect(treap.search(i)).toBe(true)
      }
    })

    it('should delete all elements from large treap', () => {
      const treap = new Treap4<number>()
      for (let i = 0; i < 50; i++) {
        treap.insert(i)
      }
      for (let i = 0; i < 50; i++) {
        expect(treap.delete(i)).toBe(true)
      }
      expect(treap.isEmpty).toBe(true)
    })
  })

  describe('Duplicate values', () => {
    it('should not insert duplicate value', () => {
      const treap = new Treap4<number>()
      treap.insert(5)
      treap.insert(5)
      expect(treap.size).toBe(1)
    })

    it('should handle duplicate value deletion', () => {
      const treap = new Treap4<number>()
      treap.insert(5)
      expect(treap.delete(5)).toBe(true)
      expect(treap.size).toBe(0)
    })
  })

  describe('Random seed', () => {
    it('should produce same structure with same seed', () => {
      const treap1 = new Treap4<number>(undefined, 12345)
      const treap2 = new Treap4<number>(undefined, 12345)
      const values = [5, 3, 7, 1, 9, 2, 8, 4, 6]
      values.forEach(v => {
        treap1.insert(v)
        treap2.insert(v)
      })
      expect(treap1.toArray()).toEqual(treap2.toArray())
    })
  })
})
