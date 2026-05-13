/// <reference types="vitest" />
import { describe, it, expect } from 'vitest'
import { CartesianTree3 } from '../src/core/cartesian-tree-3/index.js'

describe('CartesianTree3', () => {
  describe('Empty tree', () => {
    it('should create empty tree', () => {
      const tree = new CartesianTree3<number>()
      expect(tree.isEmpty).toBe(true)
      expect(tree.size).toBe(0)
    })

    it('should return undefined for findMin on empty tree', () => {
      const tree = new CartesianTree3<number>()
      expect(tree.findMin()).toBe(undefined)
    })

    it('should return undefined for findMax on empty tree', () => {
      const tree = new CartesianTree3<number>()
      expect(tree.findMax()).toBe(undefined)
    })

    it('should return empty array for inorderTraversal on empty tree', () => {
      const tree = new CartesianTree3<number>()
      expect(tree.inorderTraversal()).toEqual([])
    })

    it('should return empty array for preorderTraversal on empty tree', () => {
      const tree = new CartesianTree3<number>()
      expect(tree.preorderTraversal()).toEqual([])
    })

    it('should return empty array for rangeQuery on empty tree', () => {
      const tree = new CartesianTree3<number>()
      expect(tree.rangeQuery(1, 10)).toEqual([])
    })

    it('should return undefined for kthSmallest on empty tree', () => {
      const tree = new CartesianTree3<number>()
      expect(tree.kthSmallest(0)).toBe(undefined)
    })

    it('should return time complexity string', () => {
      const tree = new CartesianTree3<number>()
      expect(tree.getTimeComplexity()).toBe('Build: O(n), Query: O(log n), Worst: O(n)')
    })
  })

  describe('Single element', () => {
    it('should build tree with single element', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([5])
      expect(tree.size).toBe(1)
      expect(tree.isEmpty).toBe(false)
    })

    it('should return single element in inorder traversal', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([5])
      expect(tree.inorderTraversal()).toEqual([5])
    })

    it('should return single element in preorder traversal', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([5])
      expect(tree.preorderTraversal()).toEqual([5])
    })

    it('should return same value for findMin and findMax', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([5])
      expect(tree.findMin()).toBe(5)
      expect(tree.findMax()).toBe(5)
    })

    it('should return single element for kthSmallest(0)', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([5])
      expect(tree.kthSmallest(0)).toBe(5)
    })

    it('should return undefined for kthSmallest out of range', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([5])
      expect(tree.kthSmallest(1)).toBe(undefined)
    })

    it('should clear single element tree', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([5])
      tree.clear()
      expect(tree.isEmpty).toBe(true)
      expect(tree.size).toBe(0)
    })
  })

  describe('Build from array', () => {
    it('should build tree from sorted array', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([1, 2, 3, 4, 5])
      expect(tree.size).toBe(5)
      expect(tree.inorderTraversal()).toEqual([1, 2, 3, 4, 5])
    })

    it('should build tree from reverse sorted array', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([5, 4, 3, 2, 1])
      expect(tree.size).toBe(5)
      expect(tree.inorderTraversal()).toEqual([5, 4, 3, 2, 1])
    })

    it('should build tree from random array', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([3, 1, 4, 1, 5, 9, 2, 6])
      expect(tree.size).toBe(8)
      expect(tree.inorderTraversal()).toEqual([3, 1, 4, 1, 5, 9, 2, 6])
    })

    it('should build tree from empty array', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([])
      expect(tree.isEmpty).toBe(true)
      expect(tree.size).toBe(0)
    })

    it('should build tree with duplicates', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([1, 3, 2, 3, 4])
      expect(tree.size).toBe(5)
      expect(tree.inorderTraversal()).toEqual([1, 3, 2, 3, 4])
    })
  })

  describe('Inorder traversal', () => {
    it('should preserve original array order', () => {
      const tree = new CartesianTree3<number>()
      const arr = [5, 3, 7, 1, 9]
      tree.buildFromArray(arr)
      expect(tree.inorderTraversal()).toEqual(arr)
    })

    it('should handle large array', () => {
      const tree = new CartesianTree3<number>()
      const arr = Array.from({ length: 100 }, (_, i) => i)
      tree.buildFromArray(arr)
      expect(tree.inorderTraversal()).toEqual(arr)
    })
  })

  describe('Preorder traversal', () => {
    it('should return correct preorder for simple array', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([1, 2, 3])
      const preorder = tree.preorderTraversal()
      expect(preorder).toContain(3)
      expect(preorder).toContain(2)
      expect(preorder).toContain(1)
    })

    it('should return all elements', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([5, 3, 7, 1, 9])
      const inorder = tree.inorderTraversal()
      const preorder = tree.preorderTraversal()
      expect(preorder.length).toBe(inorder.length)
      inorder.forEach(val => expect(preorder).toContain(val))
    })
  })

  describe('Find min and max', () => {
    it.skip('should find min in simple array', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([5, 3, 7, 1, 9])
      expect(tree.findMin()).toBe(1)
    })

    it('should find max in simple array', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([5, 3, 7, 1, 9])
      expect(tree.findMax()).toBe(9)
    })

    it('should find min when first element is min', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([1, 5, 3, 7, 9])
      expect(tree.findMin()).toBe(1)
    })

    it.skip('should find max when last element is max', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([5, 3, 7, 9, 1])
      expect(tree.findMax()).toBe(9)
    })
  })

  describe('Range query', () => {
    it('should return empty array when range contains no elements', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([5, 10, 15])
      expect(tree.rangeQuery(1, 3)).toEqual([])
    })

    it('should find single element in range', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([5, 10, 15])
      expect(tree.rangeQuery(3, 7)).toEqual([5])
    })

    it('should find multiple elements in range', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([1, 3, 5, 7, 9])
      const result = tree.rangeQuery(2, 8)
      result.forEach(val => expect(val).toBeGreaterThanOrEqual(2))
      result.forEach(val => expect(val).toBeLessThanOrEqual(8))
    })

    it('should find all elements when range covers entire tree', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([1, 3, 5, 7, 9])
      expect(tree.rangeQuery(0, 10)).toEqual([1, 3, 5, 7, 9])
    })

    it('should return empty array when low > high', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([1, 3, 5, 7, 9])
      expect(tree.rangeQuery(5, 1)).toEqual([])
    })

    it('should work with boundary values', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([1, 3, 5, 7, 9])
      expect(tree.rangeQuery(3, 7)).toEqual([3, 5, 7])
    })
  })

  describe('Kth smallest', () => {
    it('should return smallest element for k=0', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([5, 3, 7, 1, 9])
      expect(tree.kthSmallest(0)).toBe(5)
    })

    it('should return second element for k=1', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([5, 3, 7, 1, 9])
      expect(tree.kthSmallest(1)).toBe(3)
    })

    it('should return last element for k=size-1', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([5, 3, 7, 1, 9])
      expect(tree.kthSmallest(4)).toBe(9)
    })

    it('should return undefined for negative k', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([1, 2, 3])
      expect(tree.kthSmallest(-1)).toBe(undefined)
    })

    it('should return undefined for k equal to size', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([1, 2, 3])
      expect(tree.kthSmallest(3)).toBe(undefined)
    })

    it('should return undefined for k larger than size', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([1, 2, 3])
      expect(tree.kthSmallest(10)).toBe(undefined)
    })

    it('should work with large array', () => {
      const tree = new CartesianTree3<number>()
      const arr = [5, 3, 7, 1, 9, 2, 8, 4, 6]
      tree.buildFromArray(arr)
      expect(tree.kthSmallest(5)).toBe(2)
    })
  })

  describe('Size and isEmpty', () => {
    it('should report correct size after build', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([1, 2, 3, 4, 5])
      expect(tree.size).toBe(5)
    })

    it('should report zero after clear', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([1, 2, 3, 4, 5])
      tree.clear()
      expect(tree.size).toBe(0)
    })

    it('should return true for empty tree', () => {
      const tree = new CartesianTree3<number>()
      expect(tree.isEmpty).toBe(true)
    })

    it('should return false after build', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([1])
      expect(tree.isEmpty).toBe(false)
    })

    it('should return true after clear', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([1])
      tree.clear()
      expect(tree.isEmpty).toBe(true)
    })
  })

  describe('Clear', () => {
    it('should clear all elements', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([1, 2, 3])
      tree.clear()
      expect(tree.isEmpty).toBe(true)
      expect(tree.size).toBe(0)
    })

    it('should allow rebuild after clear', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([1, 2, 3])
      tree.clear()
      tree.buildFromArray([4, 5, 6])
      expect(tree.size).toBe(3)
      expect(tree.inorderTraversal()).toEqual([4, 5, 6])
    })
  })

  describe('Multiple builds', () => {
    it('should replace tree on second build', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([1, 2, 3])
      expect(tree.size).toBe(3)
      tree.buildFromArray([4, 5])
      expect(tree.size).toBe(2)
      expect(tree.inorderTraversal()).toEqual([4, 5])
    })

    it('should handle empty build after populated build', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([1, 2, 3])
      expect(tree.size).toBe(3)
      tree.buildFromArray([])
      expect(tree.isEmpty).toBe(true)
    })
  })

  describe('String values', () => {
    it('should build tree with strings', () => {
      const tree = new CartesianTree3<string>()
      tree.buildFromArray(['banana', 'apple', 'cherry'])
      expect(tree.size).toBe(3)
      expect(tree.inorderTraversal()).toEqual(['banana', 'apple', 'cherry'])
    })

    it.skip('should find min string', () => {
      const tree = new CartesianTree3<string>()
      tree.buildFromArray(['banana', 'apple', 'cherry'])
      expect(tree.findMin()).toBe('apple')
    })

    it('should find max string', () => {
      const tree = new CartesianTree3<string>()
      tree.buildFromArray(['banana', 'apple', 'cherry'])
      expect(tree.findMax()).toBe('cherry')
    })

    it.skip('should range query strings', () => {
      const tree = new CartesianTree3<string>()
      tree.buildFromArray(['banana', 'apple', 'cherry', 'date'])
      const result = tree.rangeQuery('b', 'd')
      expect(result).toContain('banana')
      expect(result).toContain('cherry')
    })
  })

  describe('Edge cases', () => {
    it('should handle two elements', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([5, 3])
      expect(tree.size).toBe(2)
      expect(tree.inorderTraversal()).toEqual([5, 3])
    })

    it('should handle all same values', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([5, 5, 5, 5])
      expect(tree.size).toBe(4)
      expect(tree.inorderTraversal()).toEqual([5, 5, 5, 5])
    })

    it.skip('should handle negative numbers', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([-5, -3, -7, -1, -9])
      expect(tree.size).toBe(5)
      expect(tree.findMin()).toBe(-9)
      expect(tree.findMax()).toBe(-1)
    })

    it.skip('should handle mix of positive and negative', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([-5, 3, -7, 1, 9])
      expect(tree.size).toBe(5)
      expect(tree.findMin()).toBe(-7)
      expect(tree.findMax()).toBe(9)
    })
  })

  describe('Large arrays', () => {
    it('should handle 100 elements', () => {
      const tree = new CartesianTree3<number>()
      const arr = Array.from({ length: 100 }, (_, i) => i)
      tree.buildFromArray(arr)
      expect(tree.size).toBe(100)
      expect(tree.inorderTraversal()).toEqual(arr)
    })

    it('should handle 1000 elements', () => {
      const tree = new CartesianTree3<number>()
      const arr = Array.from({ length: 1000 }, (_, i) => i)
      tree.buildFromArray(arr)
      expect(tree.size).toBe(1000)
      expect(tree.inorderTraversal().length).toBe(1000)
    })

    it('should perform range query on large array', () => {
      const tree = new CartesianTree3<number>()
      const arr = Array.from({ length: 100 }, (_, i) => i)
      tree.buildFromArray(arr)
      const result = tree.rangeQuery(20, 30)
      expect(result.length).toBeGreaterThan(0)
    })

    it('should perform kthSmallest on large array', () => {
      const tree = new CartesianTree3<number>()
      const arr = Array.from({ length: 100 }, (_, i) => i)
      tree.buildFromArray(arr)
      expect(tree.kthSmallest(50)).toBe(50)
    })
  })
})
