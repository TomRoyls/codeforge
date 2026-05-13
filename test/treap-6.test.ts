/// <reference types="vitest" />
import { describe, it, expect } from 'vitest'
import { Treap6 } from '../src/core/treap-6/index.js'

describe('Treap6', () => {
  describe('Empty treap', () => {
    it('should create empty treap', () => {
      const treap = new Treap6<number>()
      expect(treap.isEmpty).toBe(true)
      expect(treap.size).toBe(0)
    })

    it('should return undefined for min on empty treap', () => {
      const treap = new Treap6<number>()
      expect(treap.min()).toBe(undefined)
    })

    it('should return undefined for max on empty treap', () => {
      const treap = new Treap6<number>()
      expect(treap.max()).toBe(undefined)
    })

    it('should return false for search on empty treap', () => {
      const treap = new Treap6<number>()
      expect(treap.search(5)).toBe(false)
    })

    it('should return false for contains on empty treap', () => {
      const treap = new Treap6<number>()
      expect(treap.contains(5)).toBe(false)
    })

    it('should return empty array for toArray on empty treap', () => {
      const treap = new Treap6<number>()
      expect(treap.toArray()).toEqual([])
    })

    it('should split empty treap into two empty treaps', () => {
      const treap = new Treap6<number>()
      const [left, right] = treap.split(5)
      expect(left.isEmpty).toBe(true)
      expect(right.isEmpty).toBe(true)
    })

    it('should return empty array for rangeSearch on empty treap', () => {
      const treap = new Treap6<number>()
      expect(treap.rangeSearch(1, 10)).toEqual([])
    })

    it('should return 0 for rank on empty treap', () => {
      const treap = new Treap6<number>()
      expect(treap.rank(5)).toBe(0)
    })

    it('should return undefined for select on empty treap', () => {
      const treap = new Treap6<number>()
      expect(treap.select(0)).toBe(undefined)
    })

    it('should delete from empty treap and return false', () => {
      const treap = new Treap6<number>()
      expect(treap.delete(5)).toBe(false)
    })

    it('should return time complexity string', () => {
      const treap = new Treap6<number>()
      expect(treap.getTimeComplexity()).toBe('Average: O(log n), Worst: O(n)')
    })
  })

  describe('Single element', () => {
    it('should insert single element', () => {
      const treap = new Treap6<number>()
      treap.insert(5)
      expect(treap.size).toBe(1)
      expect(treap.isEmpty).toBe(false)
    })

    it('should find single element after insert', () => {
      const treap = new Treap6<number>()
      treap.insert(5)
      expect(treap.search(5)).toBe(true)
    })

    it('should not find element not in single element treap', () => {
      const treap = new Treap6<number>()
      treap.insert(5)
      expect(treap.search(10)).toBe(false)
    })

    it('should return same value for min and max with single element', () => {
      const treap = new Treap6<number>()
      treap.insert(5)
      expect(treap.min()).toBe(5)
      expect(treap.max()).toBe(5)
    })

    it('should delete single element', () => {
      const treap = new Treap6<number>()
      treap.insert(5)
      expect(treap.delete(5)).toBe(true)
      expect(treap.isEmpty).toBe(true)
    })

    it('should clear single element treap', () => {
      const treap = new Treap6<number>()
      treap.insert(5)
      treap.clear()
      expect(treap.isEmpty).toBe(true)
      expect(treap.size).toBe(0)
    })

    it('should return 0 for rank of single element', () => {
      const treap = new Treap6<number>()
      treap.insert(5)
      expect(treap.rank(5)).toBe(0)
    })

    it('should return 0 for rank of value less than single element', () => {
      const treap = new Treap6<number>()
      treap.insert(5)
      expect(treap.rank(3)).toBe(0)
    })

    it('should return 1 for rank of value greater than single element', () => {
      const treap = new Treap6<number>()
      treap.insert(5)
      expect(treap.rank(7)).toBe(1)
    })

    it('should select single element', () => {
      const treap = new Treap6<number>()
      treap.insert(5)
      expect(treap.select(0)).toBe(5)
    })
  })

  describe('Sequential inserts', () => {
    it('should insert multiple elements in order', () => {
      const treap = new Treap6<number>()
      treap.insert(1)
      treap.insert(2)
      treap.insert(3)
      expect(treap.size).toBe(3)
    })

    it('should find all elements after sequential insert', () => {
      const treap = new Treap6<number>()
      treap.insert(1)
      treap.insert(2)
      treap.insert(3)
      expect(treap.search(1)).toBe(true)
      expect(treap.search(2)).toBe(true)
      expect(treap.search(3)).toBe(true)
    })

    it('should return correct min after sequential inserts', () => {
      const treap = new Treap6<number>()
      treap.insert(5)
      treap.insert(3)
      treap.insert(7)
      expect(treap.min()).toBe(3)
    })

    it('should return correct max after sequential inserts', () => {
      const treap = new Treap6<number>()
      treap.insert(5)
      treap.insert(3)
      treap.insert(7)
      expect(treap.max()).toBe(7)
    })

    it('should return sorted array after sequential inserts', () => {
      const treap = new Treap6<number>()
      treap.insert(5)
      treap.insert(3)
      treap.insert(7)
      treap.insert(1)
      expect(treap.toArray()).toEqual([1, 3, 5, 7])
    })
  })

  describe('Delete operations', () => {
    it('should delete element from middle of treap', () => {
      const treap = new Treap6<number>()
      treap.insert(1)
      treap.insert(2)
      treap.insert(3)
      expect(treap.delete(2)).toBe(true)
      expect(treap.size).toBe(2)
    })

    it('should delete min element', () => {
      const treap = new Treap6<number>()
      treap.insert(1)
      treap.insert(2)
      treap.insert(3)
      expect(treap.delete(1)).toBe(true)
      expect(treap.min()).toBe(2)
    })

    it('should delete max element', () => {
      const treap = new Treap6<number>()
      treap.insert(1)
      treap.insert(2)
      treap.insert(3)
      expect(treap.delete(3)).toBe(true)
      expect(treap.max()).toBe(2)
    })

    it('should return false when deleting non-existent element', () => {
      const treap = new Treap6<number>()
      treap.insert(1)
      treap.insert(2)
      treap.insert(3)
      expect(treap.delete(10)).toBe(false)
      expect(treap.size).toBe(3)
    })

    it('should delete all elements one by one', () => {
      const treap = new Treap6<number>()
      treap.insert(1)
      treap.insert(2)
      treap.insert(3)
      expect(treap.delete(1)).toBe(true)
      expect(treap.delete(2)).toBe(true)
      expect(treap.delete(3)).toBe(true)
      expect(treap.isEmpty).toBe(true)
    })
  })

  describe('Contains', () => {
    it('should return true for contains when element exists', () => {
      const treap = new Treap6<number>()
      treap.insert(5)
      expect(treap.contains(5)).toBe(true)
    })

    it('should return false for contains when element does not exist', () => {
      const treap = new Treap6<number>()
      treap.insert(5)
      expect(treap.contains(10)).toBe(false)
    })

    it('should work with string values', () => {
      const treap = new Treap6<string>()
      treap.insert('hello')
      expect(treap.contains('hello')).toBe(true)
      expect(treap.contains('world')).toBe(false)
    })
  })

  describe('Size', () => {
    it('should report correct size after inserts', () => {
      const treap = new Treap6<number>()
      for (let i = 0; i < 10; i++) {
        treap.insert(i)
        expect(treap.size).toBe(i + 1)
      }
    })

    it('should report correct size after deletes', () => {
      const treap = new Treap6<number>()
      for (let i = 0; i < 10; i++) {
        treap.insert(i)
      }
      treap.delete(5)
      expect(treap.size).toBe(9)
    })

    it('should report zero after clear', () => {
      const treap = new Treap6<number>()
      for (let i = 0; i < 10; i++) {
        treap.insert(i)
      }
      treap.clear()
      expect(treap.size).toBe(0)
    })
  })

  describe('IsEmpty', () => {
    it('should return true for empty treap', () => {
      const treap = new Treap6<number>()
      expect(treap.isEmpty).toBe(true)
    })

    it('should return false after insert', () => {
      const treap = new Treap6<number>()
      treap.insert(1)
      expect(treap.isEmpty).toBe(false)
    })

    it('should return true after clear', () => {
      const treap = new Treap6<number>()
      treap.insert(1)
      treap.clear()
      expect(treap.isEmpty).toBe(true)
    })
  })

  describe('Clear', () => {
    it('should clear all elements', () => {
      const treap = new Treap6<number>()
      treap.insert(1)
      treap.insert(2)
      treap.insert(3)
      treap.clear()
      expect(treap.isEmpty).toBe(true)
      expect(treap.size).toBe(0)
    })

    it('should allow inserts after clear', () => {
      const treap = new Treap6<number>()
      treap.insert(1)
      treap.clear()
      treap.insert(2)
      expect(treap.search(2)).toBe(true)
      expect(treap.size).toBe(1)
    })
  })

  describe('ToArray', () => {
    it('should return empty array for empty treap', () => {
      const treap = new Treap6<number>()
      expect(treap.toArray()).toEqual([])
    })

    it('should return sorted array', () => {
      const treap = new Treap6<number>()
      treap.insert(3)
      treap.insert(1)
      treap.insert(2)
      expect(treap.toArray()).toEqual([1, 2, 3])
    })

    it('should work with many elements', () => {
      const treap = new Treap6<number>()
      const values = [5, 3, 7, 1, 9, 2, 8, 4, 6]
      values.forEach(v => treap.insert(v))
      expect(treap.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  describe('Split', () => {
    it('should split empty treap', () => {
      const treap = new Treap6<number>()
      const [left, right] = treap.split(5)
      expect(left.isEmpty).toBe(true)
      expect(right.isEmpty).toBe(true)
    })

    it('should split treap at value', () => {
      const treap = new Treap6<number>()
      treap.insert(1)
      treap.insert(3)
      treap.insert(5)
      const [left, right] = treap.split(3)
      expect(left.toArray()).toEqual([1, 3])
      expect(right.toArray()).toEqual([5])
    })

    it('should split with all elements in left', () => {
      const treap = new Treap6<number>()
      treap.insert(1)
      treap.insert(2)
      treap.insert(3)
      const [left, right] = treap.split(5)
      expect(left.toArray()).toEqual([1, 2, 3])
      expect(right.isEmpty).toBe(true)
    })

    it('should split with all elements in right', () => {
      const treap = new Treap6<number>()
      treap.insert(6)
      treap.insert(7)
      treap.insert(8)
      const [left, right] = treap.split(5)
      expect(left.isEmpty).toBe(true)
      expect(right.toArray()).toEqual([6, 7, 8])
    })

    it('should preserve size in split treaps', () => {
      const treap = new Treap6<number>()
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
      const treap1 = new Treap6<number>()
      const treap2 = new Treap6<number>()
      treap1.merge(treap2)
      expect(treap1.isEmpty).toBe(true)
    })

    it('should merge non-empty with empty', () => {
      const treap1 = new Treap6<number>()
      const treap2 = new Treap6<number>()
      treap1.insert(1)
      treap1.insert(2)
      treap1.merge(treap2)
      expect(treap1.size).toBe(2)
    })

    it('should merge empty with non-empty', () => {
      const treap1 = new Treap6<number>()
      const treap2 = new Treap6<number>()
      treap2.insert(1)
      treap2.insert(2)
      treap1.merge(treap2)
      expect(treap1.size).toBe(2)
    })

    it('should merge two non-empty treaps', () => {
      const treap1 = new Treap6<number>()
      const treap2 = new Treap6<number>()
      treap1.insert(1)
      treap1.insert(2)
      treap2.insert(3)
      treap2.insert(4)
      treap1.merge(treap2)
      expect(treap1.size).toBe(4)
      expect(treap1.toArray()).toEqual([1, 2, 3, 4])
    })

    it('should return this after merge', () => {
      const treap1 = new Treap6<number>()
      const treap2 = new Treap6<number>()
      treap1.insert(1)
      treap2.insert(2)
      const result = treap1.merge(treap2)
      expect(result).toBe(treap1)
    })
  })

  describe('Split and merge combined', () => {
    it('should split and then merge back', () => {
      const treap = new Treap6<number>()
      const values = [1, 2, 3, 4, 5]
      values.forEach(v => treap.insert(v))
      const originalArray = treap.toArray()
      const [left, right] = treap.split(3)
      left.merge(right)
      expect(left.toArray()).toEqual(originalArray)
    })

    it('should preserve all elements through split and merge', () => {
      const treap = new Treap6<number>()
      const values = [5, 3, 7, 1, 9, 2, 8, 4, 6]
      values.forEach(v => treap.insert(v))
      const [left, right] = treap.split(5)
      const merged = new Treap6<number>()
      merged.merge(left).merge(right)
      expect(merged.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  describe('RangeSearch', () => {
    it('should return empty array when range contains no elements', () => {
      const treap = new Treap6<number>()
      treap.insert(5)
      treap.insert(10)
      treap.insert(15)
      expect(treap.rangeSearch(1, 3)).toEqual([])
    })

    it('should find single element in range', () => {
      const treap = new Treap6<number>()
      treap.insert(5)
      treap.insert(10)
      treap.insert(15)
      expect(treap.rangeSearch(3, 7)).toEqual([5])
    })

    it('should find multiple elements in range', () => {
      const treap = new Treap6<number>()
      treap.insert(1)
      treap.insert(3)
      treap.insert(5)
      treap.insert(7)
      treap.insert(9)
      expect(treap.rangeSearch(2, 8)).toEqual([3, 5, 7])
    })

    it('should find all elements when range covers entire treap', () => {
      const treap = new Treap6<number>()
      treap.insert(1)
      treap.insert(3)
      treap.insert(5)
      treap.insert(7)
      treap.insert(9)
      expect(treap.rangeSearch(0, 10)).toEqual([1, 3, 5, 7, 9])
    })

    it('should return empty array when low > high', () => {
      const treap = new Treap6<number>()
      treap.insert(1)
      treap.insert(3)
      treap.insert(5)
      expect(treap.rangeSearch(5, 1)).toEqual([])
    })

    it('should work with boundary values', () => {
      const treap = new Treap6<number>()
      treap.insert(1)
      treap.insert(3)
      treap.insert(5)
      treap.insert(7)
      treap.insert(9)
      expect(treap.rangeSearch(3, 7)).toEqual([3, 5, 7])
    })
  })

  describe('Rank', () => {
    it('should return 0 for smallest element', () => {
      const treap = new Treap6<number>()
      treap.insert(1)
      treap.insert(3)
      treap.insert(5)
      expect(treap.rank(1)).toBe(0)
    })

    it('should return correct rank for middle element', () => {
      const treap = new Treap6<number>()
      treap.insert(1)
      treap.insert(3)
      treap.insert(5)
      expect(treap.rank(3)).toBe(1)
    })

    it('should return correct rank for largest element', () => {
      const treap = new Treap6<number>()
      treap.insert(1)
      treap.insert(3)
      treap.insert(5)
      expect(treap.rank(5)).toBe(2)
    })

    it('should return 0 for value smaller than all elements', () => {
      const treap = new Treap6<number>()
      treap.insert(3)
      treap.insert(5)
      treap.insert(7)
      expect(treap.rank(1)).toBe(0)
    })

    it('should return size for value larger than all elements', () => {
      const treap = new Treap6<number>()
      treap.insert(1)
      treap.insert(3)
      treap.insert(5)
      expect(treap.rank(7)).toBe(3)
    })

    it('should work with non-existent value in range', () => {
      const treap = new Treap6<number>()
      treap.insert(1)
      treap.insert(3)
      treap.insert(5)
      treap.insert(7)
      expect(treap.rank(4)).toBe(2)
    })

    it('should work with duplicates in range', () => {
      const treap = new Treap6<number>()
      treap.insert(1)
      treap.insert(2)
      treap.insert(3)
      treap.insert(4)
      treap.insert(5)
      expect(treap.rank(3)).toBe(2)
    })
  })

  describe('Select', () => {
    it('should return smallest element for k=0', () => {
      const treap = new Treap6<number>()
      treap.insert(1)
      treap.insert(3)
      treap.insert(5)
      expect(treap.select(0)).toBe(1)
    })

    it('should return middle element', () => {
      const treap = new Treap6<number>()
      treap.insert(1)
      treap.insert(3)
      treap.insert(5)
      expect(treap.select(1)).toBe(3)
    })

    it('should return largest element', () => {
      const treap = new Treap6<number>()
      treap.insert(1)
      treap.insert(3)
      treap.insert(5)
      expect(treap.select(2)).toBe(5)
    })

    it('should return undefined for negative k', () => {
      const treap = new Treap6<number>()
      treap.insert(1)
      treap.insert(2)
      treap.insert(3)
      expect(treap.select(-1)).toBe(undefined)
    })

    it('should return undefined for k equal to size', () => {
      const treap = new Treap6<number>()
      treap.insert(1)
      treap.insert(2)
      treap.insert(3)
      expect(treap.select(3)).toBe(undefined)
    })

    it('should return undefined for k larger than size', () => {
      const treap = new Treap6<number>()
      treap.insert(1)
      treap.insert(2)
      treap.insert(3)
      expect(treap.select(10)).toBe(undefined)
    })

    it('should work with many elements', () => {
      const treap = new Treap6<number>()
      const values = [5, 3, 7, 1, 9, 2, 8, 4, 6]
      values.forEach(v => treap.insert(v))
      const sorted = [...values].sort((a, b) => a - b)
      for (let i = 0; i < sorted.length; i++) {
        expect(treap.select(i)).toBe(sorted[i])
      }
    })

    it('should work with single element', () => {
      const treap = new Treap6<number>()
      treap.insert(42)
      expect(treap.select(0)).toBe(42)
    })
  })

  describe('Custom comparator', () => {
    it('should work with custom comparator for strings', () => {
      const treap = new Treap6<string>((a, b) => a.localeCompare(b))
      treap.insert('banana')
      treap.insert('apple')
      treap.insert('cherry')
      expect(treap.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should work with reverse comparator', () => {
      const treap = new Treap6<number>((a, b) => b - a)
      treap.insert(1)
      treap.insert(2)
      treap.insert(3)
      expect(treap.toArray()).toEqual([3, 2, 1])
    })

    it('should work with rangeSearch and custom comparator', () => {
      const treap = new Treap6<number>((a, b) => b - a)
      treap.insert(5)
      treap.insert(3)
      treap.insert(7)
      treap.insert(1)
      expect(treap.rangeSearch(7, 3)).toEqual([7, 5, 3])
    })

    it('should work with rank and custom comparator', () => {
      const treap = new Treap6<number>((a, b) => b - a)
      treap.insert(5)
      treap.insert(3)
      treap.insert(7)
      expect(treap.rank(5)).toBe(1)
    })

    it('should work with select and custom comparator', () => {
      const treap = new Treap6<number>((a, b) => b - a)
      treap.insert(5)
      treap.insert(3)
      treap.insert(7)
      expect(treap.select(0)).toBe(7)
      expect(treap.select(1)).toBe(5)
      expect(treap.select(2)).toBe(3)
    })
  })

  describe('Many elements', () => {
    it('should handle 100 elements', () => {
      const treap = new Treap6<number>()
      for (let i = 0; i < 100; i++) {
        treap.insert(i)
      }
      expect(treap.size).toBe(100)
      expect(treap.min()).toBe(0)
      expect(treap.max()).toBe(99)
    })

    it('should find all elements in large treap', () => {
      const treap = new Treap6<number>()
      for (let i = 0; i < 50; i++) {
        treap.insert(i)
      }
      for (let i = 0; i < 50; i++) {
        expect(treap.search(i)).toBe(true)
      }
    })

    it('should delete all elements from large treap', () => {
      const treap = new Treap6<number>()
      for (let i = 0; i < 50; i++) {
        treap.insert(i)
      }
      for (let i = 0; i < 50; i++) {
        expect(treap.delete(i)).toBe(true)
      }
      expect(treap.isEmpty).toBe(true)
    })

    it('should rangeSearch in large treap', () => {
      const treap = new Treap6<number>()
      for (let i = 0; i < 100; i++) {
        treap.insert(i)
      }
      const result = treap.rangeSearch(20, 30)
      expect(result).toEqual([20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30])
    })

    it('should rank in large treap', () => {
      const treap = new Treap6<number>()
      for (let i = 0; i < 100; i++) {
        treap.insert(i)
      }
      expect(treap.rank(50)).toBe(50)
    })

    it('should select in large treap', () => {
      const treap = new Treap6<number>()
      for (let i = 0; i < 100; i++) {
        treap.insert(i)
      }
      expect(treap.select(50)).toBe(50)
    })
  })

  describe('Duplicate values', () => {
    it('should not insert duplicate value', () => {
      const treap = new Treap6<number>()
      treap.insert(5)
      treap.insert(5)
      expect(treap.size).toBe(1)
    })

    it('should handle duplicate value deletion', () => {
      const treap = new Treap6<number>()
      treap.insert(5)
      expect(treap.delete(5)).toBe(true)
      expect(treap.size).toBe(0)
    })
  })

  describe('Large datasets', () => {
    it('should handle 1000 elements', () => {
      const treap = new Treap6<number>()
      for (let i = 0; i < 1000; i++) {
        treap.insert(i)
      }
      expect(treap.size).toBe(1000)
      expect(treap.min()).toBe(0)
      expect(treap.max()).toBe(999)
      expect(treap.search(500)).toBe(true)
      expect(treap.search(1000)).toBe(false)
    })

    it('should perform rangeSearch on 1000 elements', () => {
      const treap = new Treap6<number>()
      for (let i = 0; i < 1000; i++) {
        treap.insert(i)
      }
      const result = treap.rangeSearch(100, 200)
      expect(result.length).toBe(101)
      expect(result[0]).toBe(100)
      expect(result[100]).toBe(200)
    })

    it('should perform rank on 1000 elements', () => {
      const treap = new Treap6<number>()
      for (let i = 0; i < 1000; i++) {
        treap.insert(i)
      }
      expect(treap.rank(500)).toBe(500)
      expect(treap.rank(999)).toBe(999)
    })

    it('should perform select on 1000 elements', () => {
      const treap = new Treap6<number>()
      for (let i = 0; i < 1000; i++) {
        treap.insert(i)
      }
      expect(treap.select(500)).toBe(500)
      expect(treap.select(999)).toBe(999)
    })
  })

  describe('Combined operations', () => {
    it('should work after split and merge with rangeSearch', () => {
      const treap = new Treap6<number>()
      for (let i = 0; i < 10; i++) {
        treap.insert(i)
      }
      const [left, right] = treap.split(4)
      left.merge(right)
      expect(left.rangeSearch(2, 7)).toEqual([2, 3, 4, 5, 6, 7])
    })

    it('should work after split and merge with rank', () => {
      const treap = new Treap6<number>()
      for (let i = 0; i < 10; i++) {
        treap.insert(i)
      }
      const [left, right] = treap.split(4)
      left.merge(right)
      expect(left.rank(5)).toBe(5)
    })

    it('should work after split and merge with select', () => {
      const treap = new Treap6<number>()
      for (let i = 0; i < 10; i++) {
        treap.insert(i)
      }
      const [left, right] = treap.split(4)
      left.merge(right)
      expect(left.select(5)).toBe(5)
    })

    it('should handle delete and rank combination', () => {
      const treap = new Treap6<number>()
      for (let i = 0; i < 10; i++) {
        treap.insert(i)
      }
      treap.delete(5)
      expect(treap.rank(6)).toBe(5)
    })

    it('should handle delete and select combination', () => {
      const treap = new Treap6<number>()
      for (let i = 0; i < 10; i++) {
        treap.insert(i)
      }
      treap.delete(5)
      expect(treap.select(5)).toBe(6)
    })
  })
})
