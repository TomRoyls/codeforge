import { describe, it, expect, vi } from 'vitest'
import { AdaptiveBST } from '../src/core/adaptive-bst/index.js'

describe('AdaptiveBST', () => {
  describe('Empty tree', () => {
    it('should create empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.isEmpty).toBe(true)
      expect(tree.size).toBe(0)
    })

    it('should throw error for findMin on empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(() => tree.findMin()).toThrow('findMin called on empty tree')
    })

    it('should throw error for findMax on empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(() => tree.findMax()).toThrow('findMax called on empty tree')
    })

    it('should return null for search on empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.search(5)).toBe(null)
    })

    it('should return false for contains on empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.contains(5)).toBe(false)
    })

    it('should return empty array for toArray on empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.toArray()).toEqual([])
    })

    it('should return empty generator for traversal on empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect([...tree.inOrderTraversal()]).toEqual([])
      expect([...tree.preOrderTraversal()]).toEqual([])
      expect([...tree.postOrderTraversal()]).toEqual([])
    })

    it('should return null for lowerBound on empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.lowerBound(5)).toBe(null)
    })

    it('should return null for upperBound on empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.upperBound(5)).toBe(null)
    })

    it('should return 0 for count on empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.count(5)).toBe(0)
    })

    it('should return empty array for rangeQuery on empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.rangeQuery(1, 10)).toEqual([])
    })

    it('should return null for predecessor on empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.predecessor(5)).toBe(null)
    })

    it('should return null for successor on empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.successor(5)).toBe(null)
    })

    it('should return 0 for rank on empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.rank(5)).toBe(0)
    })

    it('should throw error for select on empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(() => tree.select(0)).toThrow('Index 0 out of bounds [0, 0)')
    })

    it('should return -1 for height on empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.height()).toBe(-1)
    })

    it('should return true for isValid on empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.isValid()).toBe(true)
    })

    it('should return false for delete on empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.delete(5)).toBe(false)
    })

    it('should clone empty tree', () => {
      const tree = new AdaptiveBST<number>()
      const cloned = tree.clone()
      expect(cloned.isEmpty).toBe(true)
      expect(cloned.size).toBe(0)
    })

    it('should iterate over empty tree', () => {
      const tree = new AdaptiveBST<number>()
      const values: number[] = []
      for (const value of tree) {
        values.push(value)
      }
      expect(values).toEqual([])
    })
  })

  describe('Single element', () => {
    it('should insert single element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      expect(tree.size).toBe(1)
      expect(tree.isEmpty).toBe(false)
    })

    it('should find single element after insert', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      expect(tree.search(5)).toBe(5)
    })

    it('should not find element not in single element tree', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      expect(tree.search(10)).toBe(null)
    })

    it('should contain single element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      expect(tree.contains(5)).toBe(true)
      expect(tree.contains(10)).toBe(false)
    })

    it('should return same value for min and max with single element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      expect(tree.findMin()).toBe(5)
      expect(tree.findMax()).toBe(5)
    })

    it('should delete single element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      expect(tree.delete(5)).toBe(true)
      expect(tree.isEmpty).toBe(true)
    })

    it('should clear single element tree', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.clear()
      expect(tree.isEmpty).toBe(true)
      expect(tree.size).toBe(0)
    })

    it('should toArray return single element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      expect(tree.toArray()).toEqual([5])
    })

    it('should return correct traversals for single element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      expect([...tree.inOrderTraversal()]).toEqual([5])
      expect([...tree.preOrderTraversal()]).toEqual([5])
      expect([...tree.postOrderTraversal()]).toEqual([5])
    })

    it('should return 0 for count of single element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      expect(tree.count(5)).toBe(1)
      expect(tree.count(10)).toBe(0)
    })

    it('should return null for predecessor and successor of single element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      expect(tree.predecessor(5)).toBe(null)
      expect(tree.successor(5)).toBe(null)
    })

    it('should return correct rank for single element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      expect(tree.rank(5)).toBe(0)
      expect(tree.rank(10)).toBe(1)
      expect(tree.rank(1)).toBe(0)
    })

    it('should select single element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      expect(tree.select(0)).toBe(5)
    })

    it('should return 0 for height of single element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      expect(tree.height()).toBe(0)
    })

    it('should be valid after single insert', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      expect(tree.isValid()).toBe(true)
    })
  })

  describe('Sequential inserts', () => {
    it('should insert multiple elements in order', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.size).toBe(3)
    })

    it('should find all elements after sequential insert', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.search(1)).toBe(1)
      expect(tree.search(2)).toBe(2)
      expect(tree.search(3)).toBe(3)
    })

    it('should contain all elements after sequential insert', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.contains(1)).toBe(true)
      expect(tree.contains(2)).toBe(true)
      expect(tree.contains(3)).toBe(true)
    })

    it('should return correct min after sequential inserts', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.findMin()).toBe(3)
    })

    it('should return correct max after sequential inserts', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.findMax()).toBe(7)
    })

    it('should return sorted array after sequential inserts', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      expect(tree.toArray()).toEqual([1, 3, 5, 7])
    })
  })

  describe('Random inserts', () => {
    it('should insert elements in random order', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(1)
      tree.insert(10)
      tree.insert(3)
      tree.insert(8)
      expect(tree.size).toBe(5)
    })

    it('should find all elements after random inserts', () => {
      const tree = new AdaptiveBST<number>()
      const values = [5, 1, 10, 3, 8]
      values.forEach(v => tree.insert(v))
      values.forEach(v => expect(tree.search(v)).toBe(v))
    })

    it('should maintain correct order after random inserts', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(1)
      tree.insert(10)
      tree.insert(3)
      tree.insert(8)
      expect(tree.findMin()).toBe(1)
      expect(tree.findMax()).toBe(10)
    })
  })

  describe('Delete operations', () => {
    it('should delete element from middle of tree', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.delete(2)).toBe(true)
      expect(tree.size).toBe(2)
    })

    it('should delete min element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.delete(1)).toBe(true)
      expect(tree.findMin()).toBe(2)
    })

    it('should delete max element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.delete(3)).toBe(true)
      expect(tree.findMax()).toBe(2)
    })

    it('should return false when deleting non-existent element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.delete(10)).toBe(false)
      expect(tree.size).toBe(3)
    })

    it('should delete all elements one by one', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.delete(1)).toBe(true)
      expect(tree.delete(2)).toBe(true)
      expect(tree.delete(3)).toBe(true)
      expect(tree.isEmpty).toBe(true)
    })
  })

  describe('Delete then search', () => {
    it('should not find element after delete', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.delete(5)
      expect(tree.search(5)).toBe(null)
    })

    it('should not contain element after delete', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.delete(5)
      expect(tree.contains(5)).toBe(false)
    })

    it('should find remaining elements after delete', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.delete(2)
      expect(tree.search(1)).toBe(1)
      expect(tree.search(3)).toBe(3)
    })

    it('should maintain correct structure after multiple deletes', () => {
      const tree = new AdaptiveBST<number>()
      for (let i = 0; i < 10; i++) {
        tree.insert(i)
      }
      tree.delete(5)
      tree.delete(7)
      expect(tree.search(5)).toBe(null)
      expect(tree.search(7)).toBe(null)
      expect(tree.search(6)).toBe(6)
      expect(tree.search(8)).toBe(8)
    })
  })

  describe('Size', () => {
    it('should report correct size after inserts', () => {
      const tree = new AdaptiveBST<number>()
      for (let i = 0; i < 10; i++) {
        tree.insert(i)
        expect(tree.size).toBe(i + 1)
      }
    })

    it('should report correct size after deletes', () => {
      const tree = new AdaptiveBST<number>()
      for (let i = 0; i < 10; i++) {
        tree.insert(i)
      }
      tree.delete(5)
      expect(tree.size).toBe(9)
    })

    it('should report zero after clear', () => {
      const tree = new AdaptiveBST<number>()
      for (let i = 0; i < 10; i++) {
        tree.insert(i)
      }
      tree.clear()
      expect(tree.size).toBe(0)
    })
  })

  describe('IsEmpty', () => {
    it('should return true for empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.isEmpty).toBe(true)
    })

    it('should return false after insert', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      expect(tree.isEmpty).toBe(false)
    })

    it('should return true after clear', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.clear()
      expect(tree.isEmpty).toBe(true)
    })
  })

  describe('Clear', () => {
    it('should clear all elements', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.clear()
      expect(tree.isEmpty).toBe(true)
      expect(tree.size).toBe(0)
    })

    it('should allow inserts after clear', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.clear()
      tree.insert(2)
      expect(tree.search(2)).toBe(2)
      expect(tree.size).toBe(1)
    })
  })

  describe('ToArray', () => {
    it('should return empty array for empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.toArray()).toEqual([])
    })

    it('should return sorted array', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(2)
      expect(tree.toArray()).toEqual([1, 2, 3])
    })

    it('should work with many elements', () => {
      const tree = new AdaptiveBST<number>()
      const values = [5, 3, 7, 1, 9, 2, 8, 4, 6]
      values.forEach(v => tree.insert(v))
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  describe('InOrderTraversal', () => {
    it('should return empty array for empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect([...tree.inOrderTraversal()]).toEqual([])
    })

    it('should return elements in sorted order', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      expect([...tree.inOrderTraversal()]).toEqual([1, 3, 5, 7])
    })
  })

  describe('PreOrderTraversal', () => {
    it('should return empty array for empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect([...tree.preOrderTraversal()]).toEqual([])
    })

    it('should return elements in pre-order', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(2)
      tree.insert(1)
      tree.insert(3)
      const result = [...tree.preOrderTraversal()]
      expect(result).toContain(2)
      expect(result).toContain(1)
      expect(result).toContain(3)
      expect(result.length).toBe(3)
    })
  })

  describe('PostOrderTraversal', () => {
    it('should return empty array for empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect([...tree.postOrderTraversal()]).toEqual([])
    })

    it('should return elements in post-order', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(2)
      tree.insert(1)
      tree.insert(3)
      const result = [...tree.postOrderTraversal()]
      expect(result).toContain(2)
      expect(result).toContain(1)
      expect(result).toContain(3)
      expect(result.length).toBe(3)
    })
  })

  describe('ForEach', () => {
    it('should call callback for each element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      const values: number[] = []
      tree.forEach((v) => values.push(v))
      expect(values).toEqual([1, 2, 3])
    })

    it('should pass correct index to callback', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      const indices: number[] = []
      tree.forEach((_, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should not call callback on empty tree', () => {
      const tree = new AdaptiveBST<number>()
      const callback = vi.fn()
      tree.forEach(callback)
      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe('Iterator', () => {
    it('should iterate over empty tree', () => {
      const tree = new AdaptiveBST<number>()
      const values: number[] = []
      for (const value of tree) {
        values.push(value)
      }
      expect(values).toEqual([])
    })

    it('should iterate over all elements', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      const values: number[] = []
      for (const value of tree) {
        values.push(value)
      }
      expect(values).toEqual([1, 3, 5, 7])
    })
  })

  describe('Clone', () => {
    it('should clone empty tree', () => {
      const tree = new AdaptiveBST<number>()
      const cloned = tree.clone()
      expect(cloned.isEmpty).toBe(true)
      expect(cloned.size).toBe(0)
    })

    it('should clone single element tree', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      const cloned = tree.clone()
      expect(cloned.size).toBe(1)
      expect(cloned.toArray()).toEqual([5])
    })

    it('should clone multiple elements', () => {
      const tree = new AdaptiveBST<number>()
      const values = [5, 3, 7, 1, 9]
      values.forEach(v => tree.insert(v))
      const cloned = tree.clone()
      expect(cloned.size).toBe(5)
      expect(cloned.toArray()).toEqual([1, 3, 5, 7, 9])
    })

    it('should create independent clone', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      const cloned = tree.clone()
      cloned.insert(4)
      tree.delete(2)
      expect(tree.size).toBe(2)
      expect(cloned.size).toBe(4)
    })
  })

  describe('FromArray', () => {
    it('should create tree from empty array', () => {
      const tree = AdaptiveBST.fromArray<number>([])
      expect(tree.isEmpty).toBe(true)
    })

    it('should create tree from array', () => {
      const tree = AdaptiveBST.fromArray<number>([5, 3, 7, 1, 9])
      expect(tree.size).toBe(5)
      expect(tree.toArray()).toEqual([1, 3, 5, 7, 9])
    })

    it('should create tree with custom comparator', () => {
      const tree = AdaptiveBST.fromArray<string>(['banana', 'apple', 'cherry'], {
        comparator: (a, b) => a.localeCompare(b)
      })
      expect(tree.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  describe('IsValid', () => {
    it('should return true for empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.isValid()).toBe(true)
    })

    it('should return true after valid insert', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.isValid()).toBe(true)
    })

    it('should remain valid after multiple operations', () => {
      const tree = new AdaptiveBST<number>()
      for (let i = 0; i < 100; i++) {
        tree.insert(i)
      }
      expect(tree.isValid()).toBe(true)
      for (let i = 0; i < 50; i++) {
        tree.delete(i)
      }
      expect(tree.isValid()).toBe(true)
    })
  })

  describe('Height', () => {
    it('should return -1 for empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.height()).toBe(-1)
    })

    it('should return 0 for single element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      expect(tree.height()).toBe(0)
    })

    it('should calculate correct height for multiple elements', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(2)
      tree.insert(1)
      tree.insert(3)
      const height = tree.height()
      expect(height).toBeGreaterThanOrEqual(1)
      expect(height).toBeLessThan(10)
    })
  })

  describe('LowerBound', () => {
    it('should return null for empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.lowerBound(5)).toBe(null)
    })

    it('should return smallest element >= value', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      tree.insert(7)
      expect(tree.lowerBound(4)).toBe(5)
    })

    it('should return exact value if present', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.lowerBound(3)).toBe(3)
    })

    it('should return null if no element >= value', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.lowerBound(10)).toBe(null)
    })
  })

  describe('UpperBound', () => {
    it('should return null for empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.upperBound(5)).toBe(null)
    })

    it('should return smallest element > value', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      tree.insert(7)
      expect(tree.upperBound(3)).toBe(5)
    })

    it('should return null if no element > value', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.upperBound(10)).toBe(null)
    })
  })

  describe('Count', () => {
    it('should return 0 for empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.count(5)).toBe(0)
    })

    it('should return 1 if element exists', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      expect(tree.count(5)).toBe(1)
    })

    it('should return 0 if element does not exist', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      expect(tree.count(10)).toBe(0)
    })
  })

  describe('RangeQuery', () => {
    it('should return empty array for empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.rangeQuery(1, 10)).toEqual([])
    })

    it('should return elements in range', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      tree.insert(7)
      tree.insert(9)
      expect(tree.rangeQuery(3, 7)).toEqual([3, 5, 7])
    })

    it('should handle empty range', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.rangeQuery(10, 20)).toEqual([])
    })

    it('should handle full range', () => {
      const tree = new AdaptiveBST<number>()
      const values = [1, 3, 5, 7, 9]
      values.forEach(v => tree.insert(v))
      expect(tree.rangeQuery(1, 9)).toEqual(values)
    })
  })

  describe('Predecessor', () => {
    it('should return null for empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.predecessor(5)).toBe(null)
    })

    it('should return null if element not found', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.predecessor(10)).toBe(null)
    })

    it('should return null for min element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.predecessor(1)).toBe(null)
    })

    it('should return predecessor for middle element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      tree.insert(7)
      expect(tree.predecessor(5)).toBe(3)
    })

    it('should return predecessor for max element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      tree.insert(7)
      expect(tree.predecessor(7)).toBe(5)
    })
  })

  describe('Successor', () => {
    it('should return null for empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.successor(5)).toBe(null)
    })

    it('should return null if element not found', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.successor(10)).toBe(null)
    })

    it('should return null for max element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.successor(5)).toBe(null)
    })

    it('should return successor for middle element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      tree.insert(7)
      expect(tree.successor(5)).toBe(7)
    })

    it('should return successor for min element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      tree.insert(7)
      expect(tree.successor(1)).toBe(3)
    })
  })

  describe('Rank', () => {
    it('should return 0 for empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.rank(5)).toBe(0)
    })

    it('should return 0 for min element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.rank(1)).toBe(0)
    })

    it('should return correct rank for middle element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.rank(3)).toBe(1)
    })

    it('should return size-1 for max element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.rank(5)).toBe(2)
    })

    it('should return index for non-existent element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.rank(4)).toBe(2)
    })
  })

  describe('Select', () => {
    it('should throw error on empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(() => tree.select(0)).toThrow('Index 0 out of bounds [0, 0)')
    })

    it('should throw error for negative index', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(() => tree.select(-1)).toThrow('Index -1 out of bounds [0, 3)')
    })

    it('should throw error for index >= size', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(() => tree.select(3)).toThrow('Index 3 out of bounds [0, 3)')
    })

    it('should select min element at index 0', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.select(0)).toBe(3)
    })

    it('should select middle element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.select(1)).toBe(2)
    })

    it('should select max element at index size-1', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.select(2)).toBe(3)
    })

    it('should select all elements in order', () => {
      const tree = new AdaptiveBST<number>()
      const values = [5, 3, 7, 1, 9, 2, 8, 4, 6]
      values.forEach(v => tree.insert(v))
      const sorted = [...tree].sort((a, b) => a - b)
      for (let i = 0; i < sorted.length; i++) {
        expect(tree.select(i)).toBe(sorted[i])
      }
    })
  })

  describe('Custom comparator', () => {
    it('should work with custom comparator for strings', () => {
      const tree = new AdaptiveBST<string>({ comparator: (a, b) => a.localeCompare(b) })
      tree.insert('banana')
      tree.insert('apple')
      tree.insert('cherry')
      expect(tree.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should work with reverse comparator', () => {
      const tree = new AdaptiveBST<number>({ comparator: (a, b) => b - a })
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.toArray()).toEqual([3, 2, 1])
    })

    it('should work with custom object comparator', () => {
      const tree = new AdaptiveBST<{ id: number }>({ comparator: (a, b) => a.id - b.id })
      tree.insert({ id: 3 })
      tree.insert({ id: 1 })
      tree.insert({ id: 2 })
      expect(tree.search({ id: 2 })?.id).toBe(2)
    })
  })

  describe('Many elements', () => {
    it('should handle 100 elements', () => {
      const tree = new AdaptiveBST<number>()
      for (let i = 0; i < 100; i++) {
        tree.insert(i)
      }
      expect(tree.size).toBe(100)
      expect(tree.findMin()).toBe(0)
      expect(tree.findMax()).toBe(99)
    })

    it('should find all elements in large tree', () => {
      const tree = new AdaptiveBST<number>()
      for (let i = 0; i < 50; i++) {
        tree.insert(i)
      }
      for (let i = 0; i < 50; i++) {
        expect(tree.search(i)).toBe(i)
      }
    })

    it('should delete all elements from large tree', () => {
      const tree = new AdaptiveBST<number>()
      for (let i = 0; i < 50; i++) {
        tree.insert(i)
      }
      for (let i = 0; i < 50; i++) {
        expect(tree.delete(i)).toBe(true)
      }
      expect(tree.isEmpty).toBe(true)
    })

    it('should maintain validity with many operations', () => {
      const tree = new AdaptiveBST<number>()
      for (let i = 0; i < 200; i++) {
        tree.insert(i)
      }
      expect(tree.isValid()).toBe(true)
      for (let i = 0; i < 100; i++) {
        tree.delete(i * 2)
      }
      expect(tree.isValid()).toBe(true)
    })
  })

  describe('Mixed operations', () => {
    it('should handle mixed insert, search, and delete', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(3)
      expect(tree.search(5)).toBe(5)
      tree.insert(7)
      expect(tree.search(3)).toBe(3)
      tree.insert(1)
      tree.delete(5)
      expect(tree.contains(5)).toBe(false)
      tree.insert(2)
      expect(tree.size).toBe(4)
      expect(tree.toArray().length).toBe(4)
    })

    it('should clear and reuse tree', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.clear()
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      expect(tree.size).toBe(3)
      expect(tree.search(10)).toBe(10)
      expect(tree.findMin()).toBe(10)
      expect(tree.findMax()).toBe(30)
    })
  })

  describe('Negative numbers', () => {
    it('should handle negative numbers', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(-3)
      tree.insert(-1)
      tree.insert(-2)
      expect(tree.toArray()).toEqual([-3, -2, -1])
      expect(tree.findMin()).toBe(-3)
      expect(tree.findMax()).toBe(-1)
    })

    it('should handle mix of positive and negative numbers', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(-3)
      tree.insert(5)
      tree.insert(-1)
      tree.insert(3)
      tree.insert(0)
      expect(tree.toArray()).toEqual([-3, -1, 0, 3, 5])
    })
  })

  describe('String values', () => {
    it('should work with string values', () => {
      const tree = new AdaptiveBST<string>()
      tree.insert('hello')
      tree.insert('world')
      tree.insert('foo')
      expect(tree.contains('hello')).toBe(true)
      expect(tree.contains('world')).toBe(true)
      expect(tree.contains('bar')).toBe(false)
    })

    it('should return sorted strings', () => {
      const tree = new AdaptiveBST<string>()
      tree.insert('banana')
      tree.insert('apple')
      tree.insert('cherry')
      expect(tree.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  describe('Edge cases', () => {
    it('should allow duplicate inserts', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(5)
      const result = tree.toArray()
      expect(result.filter(v => v === 5).length).toBe(2)
    })

    it('should delete after search', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.search(5)
      tree.delete(5)
      expect(tree.contains(5)).toBe(false)
    })

    it('should maintain structure after alternating insert/delete', () => {
      const tree = new AdaptiveBST<number>()
      for (let i = 0; i < 10; i++) {
        tree.insert(i)
        if (i > 0 && i % 2 === 0) {
          tree.delete(i - 1)
        }
      }
      expect(tree.isValid()).toBe(true)
    })
  })
})
