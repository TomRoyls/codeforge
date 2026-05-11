import { describe, it, expect } from 'vitest'
import { CartesianTree } from '../../src/core/cartesian-tree-2/index.js'
import type { CTNode } from '../../src/core/cartesian-tree-2/types.js'

describe('CartesianTree (variant 2)', () => {
  describe('constructor', () => {
    it('creates empty tree from empty array', () => {
      const tree = new CartesianTree<number>([])
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.findRoot()).toBeNull()
    })

    it('creates tree from single element', () => {
      const tree = new CartesianTree([42])
      expect(tree.size()).toBe(1)
      expect(tree.isEmpty()).toBe(false)
      expect(tree.findRoot()?.value).toBe(42)
    })

    it('creates min-heap cartesian tree by default', () => {
      const tree = new CartesianTree([3, 2, 1, 6, 4, 5])
      expect(tree.findRoot()?.value).toBe(1)
      expect(tree.isValid()).toBe(true)
    })

    it('creates tree with custom comparator for max-heap', () => {
      const tree = new CartesianTree([3, 2, 1, 6, 4, 5], (a, b) => b - a)
      expect(tree.findRoot()?.value).toBe(6)
      expect(tree.isValid()).toBe(true)
    })

    it('creates tree with string length comparator', () => {
      const tree = new CartesianTree(['bb', 'aaa', 'c'], (a, b) => a.length - b.length)
      expect(tree.findRoot()?.value).toBe('c')
      expect(tree.isValid()).toBe(true)
    })

    it('does not mutate original array', () => {
      const values = [3, 1, 2]
      const tree = new CartesianTree(values)
      values.push(4)
      expect(tree.size()).toBe(3)
    })

    it('handles duplicate values', () => {
      const tree = new CartesianTree([3, 3, 3])
      expect(tree.size()).toBe(3)
      expect(tree.isValid()).toBe(true)
    })

    it('handles strictly increasing sequence', () => {
      const tree = new CartesianTree([1, 2, 3, 4, 5])
      expect(tree.findRoot()?.value).toBe(1)
      expect(tree.isValid()).toBe(true)
    })

    it('handles strictly decreasing sequence', () => {
      const tree = new CartesianTree([5, 4, 3, 2, 1])
      expect(tree.findRoot()?.value).toBe(1)
      expect(tree.isValid()).toBe(true)
    })

    it('handles two elements ascending', () => {
      const tree = new CartesianTree([1, 2])
      expect(tree.findRoot()?.value).toBe(1)
      expect(tree.isValid()).toBe(true)
    })

    it('handles two elements descending', () => {
      const tree = new CartesianTree([2, 1])
      expect(tree.findRoot()?.value).toBe(1)
      expect(tree.isValid()).toBe(true)
    })
  })

  describe('findRoot', () => {
    it('returns null for empty tree', () => {
      const tree = new CartesianTree([])
      expect(tree.findRoot()).toBeNull()
    })

    it('returns root node with correct value and index', () => {
      const tree = new CartesianTree([4, 2, 5, 1, 3])
      const root = tree.findRoot()
      expect(root).not.toBeNull()
      expect(root!.value).toBe(1)
      expect(root!.index).toBe(3)
    })

    it('root has no children when single element', () => {
      const tree = new CartesianTree([7])
      const root = tree.findRoot()!
      expect(root.left).toBeNull()
      expect(root.right).toBeNull()
    })
  })

  describe('size and isEmpty', () => {
    it('returns 0 and isEmpty=true for empty tree', () => {
      const tree = new CartesianTree([])
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('returns correct size for non-empty tree', () => {
      const tree = new CartesianTree([1, 2, 3])
      expect(tree.size()).toBe(3)
      expect(tree.isEmpty()).toBe(false)
    })

    it('returns correct size for large tree', () => {
      const values = Array.from({ length: 100 }, (_, i) => 100 - i)
      const tree = new CartesianTree(values)
      expect(tree.size()).toBe(100)
    })
  })

  describe('inorder', () => {
    it('returns empty for empty tree', () => {
      const tree = new CartesianTree([])
      expect(tree.inorder()).toEqual([])
    })

    it('returns single element for single node', () => {
      const tree = new CartesianTree([5])
      expect(tree.inorder()).toEqual([5])
    })

    it('returns original sequence order', () => {
      const values = [3, 1, 4, 1, 5, 9, 2, 6]
      const tree = new CartesianTree(values)
      expect(tree.inorder()).toEqual(values)
    })

    it('returns original sequence with custom comparator', () => {
      const values = ['hello', 'hi', 'hey', 'yo']
      const tree = new CartesianTree(values, (a, b) => a.length - b.length)
      expect(tree.inorder()).toEqual(values)
    })

    it('returns correct inorder for all duplicates', () => {
      const tree = new CartesianTree([5, 5, 5, 5])
      expect(tree.inorder()).toEqual([5, 5, 5, 5])
    })
  })

  describe('preorder', () => {
    it('returns empty for empty tree', () => {
      const tree = new CartesianTree([])
      expect(tree.preorder()).toEqual([])
    })

    it('returns single element for single node', () => {
      const tree = new CartesianTree([7])
      expect(tree.preorder()).toEqual([7])
    })

    it('root value is first in preorder', () => {
      const tree = new CartesianTree([3, 1, 2])
      expect(tree.preorder()[0]).toBe(1)
    })

    it('preorder length equals size', () => {
      const tree = new CartesianTree([5, 3, 7, 1, 4])
      expect(tree.preorder().length).toBe(5)
    })

    it('preorder contains all elements', () => {
      const values = [3, 1, 4, 1, 5]
      const tree = new CartesianTree(values)
      const sorted = [...tree.preorder()].sort((a, b) => a - b)
      expect(sorted).toEqual([...values].sort((a, b) => a - b))
    })
  })

  describe('postorder', () => {
    it('returns empty for empty tree', () => {
      const tree = new CartesianTree([])
      expect(tree.postorder()).toEqual([])
    })

    it('returns single element for single node', () => {
      const tree = new CartesianTree([9])
      expect(tree.postorder()).toEqual([9])
    })

    it('root value is last in postorder', () => {
      const tree = new CartesianTree([3, 1, 2])
      const post = tree.postorder()
      expect(post[post.length - 1]).toBe(1)
    })

    it('postorder length equals size', () => {
      const tree = new CartesianTree([5, 3, 7, 1, 4])
      expect(tree.postorder().length).toBe(5)
    })
  })

  describe('levelOrder', () => {
    it('returns empty for empty tree', () => {
      const tree = new CartesianTree([])
      expect(tree.levelOrder()).toEqual([])
    })

    it('returns single element for single node', () => {
      const tree = new CartesianTree([1])
      expect(tree.levelOrder()).toEqual([1])
    })

    it('root is first in level order', () => {
      const tree = new CartesianTree([3, 1, 2])
      expect(tree.levelOrder()[0]).toBe(1)
    })

    it('levelOrder length equals size', () => {
      const tree = new CartesianTree([5, 3, 7, 1, 4])
      expect(tree.levelOrder().length).toBe(5)
    })
  })

  describe('toArray', () => {
    it('returns original values for empty tree', () => {
      const tree = new CartesianTree([])
      expect(tree.toArray()).toEqual([])
    })

    it('returns original values in order', () => {
      const values = [3, 1, 4, 1, 5, 9, 2, 6]
      const tree = new CartesianTree(values)
      expect(tree.toArray()).toEqual(values)
    })

    it('returns independent copy', () => {
      const tree = new CartesianTree([1, 2, 3])
      const arr = tree.toArray()
      arr.push(4)
      expect(tree.size()).toBe(3)
    })
  })

  describe('getValues', () => {
    it('returns readonly original values', () => {
      const values = [3, 1, 4]
      const tree = new CartesianTree(values)
      expect(tree.getValues()).toEqual(values)
    })

    it('returns empty for empty tree', () => {
      const tree = new CartesianTree([])
      expect(tree.getValues()).toEqual([])
    })
  })

  describe('getRangeMin', () => {
    it('returns undefined for empty tree', () => {
      const tree = new CartesianTree([])
      expect(tree.getRangeMin(0, 0)).toBeUndefined()
    })

    it('returns minimum in full range', () => {
      const tree = new CartesianTree([9, 3, 7, 1, 8])
      expect(tree.getRangeMin(0, 4)).toBe(1)
    })

    it('returns minimum in subrange', () => {
      const tree = new CartesianTree([9, 3, 7, 1, 8])
      expect(tree.getRangeMin(0, 2)).toBe(3)
    })

    it('returns single element for single-index range', () => {
      const tree = new CartesianTree([9, 3, 7, 1, 8])
      expect(tree.getRangeMin(2, 2)).toBe(7)
    })

    it('returns last element in range', () => {
      const tree = new CartesianTree([9, 3, 7, 1, 8])
      expect(tree.getRangeMin(3, 4)).toBe(1)
    })

    it('returns undefined for invalid range (start > end)', () => {
      const tree = new CartesianTree([1, 2, 3])
      expect(tree.getRangeMin(2, 1)).toBeUndefined()
    })

    it('returns undefined for negative start', () => {
      const tree = new CartesianTree([1, 2, 3])
      expect(tree.getRangeMin(-1, 2)).toBeUndefined()
    })

    it('returns undefined for end >= size', () => {
      const tree = new CartesianTree([1, 2, 3])
      expect(tree.getRangeMin(0, 3)).toBeUndefined()
    })

    it('finds min among duplicates', () => {
      const tree = new CartesianTree([5, 2, 2, 8, 2])
      expect(tree.getRangeMin(1, 4)).toBe(2)
    })

    it('works with negative numbers', () => {
      const tree = new CartesianTree([-3, -1, -4, -1, -5])
      expect(tree.getRangeMin(0, 2)).toBe(-4)
    })
  })

  describe('getRangeMax', () => {
    it('returns undefined for empty tree', () => {
      const tree = new CartesianTree([])
      expect(tree.getRangeMax(0, 0)).toBeUndefined()
    })

    it('returns maximum in full range', () => {
      const tree = new CartesianTree([9, 3, 7, 1, 8])
      expect(tree.getRangeMax(0, 4)).toBe(9)
    })

    it('returns maximum in subrange', () => {
      const tree = new CartesianTree([9, 3, 7, 1, 8])
      expect(tree.getRangeMax(1, 3)).toBe(7)
    })

    it('returns single element for single-index range', () => {
      const tree = new CartesianTree([9, 3, 7, 1, 8])
      expect(tree.getRangeMax(2, 2)).toBe(7)
    })

    it('returns undefined for invalid range', () => {
      const tree = new CartesianTree([1, 2, 3])
      expect(tree.getRangeMax(2, 1)).toBeUndefined()
    })

    it('returns undefined for out-of-bounds range', () => {
      const tree = new CartesianTree([1, 2, 3])
      expect(tree.getRangeMax(-1, 2)).toBeUndefined()
      expect(tree.getRangeMax(0, 5)).toBeUndefined()
    })

    it('works with negative numbers', () => {
      const tree = new CartesianTree([-3, -1, -4, -1, -5])
      expect(tree.getRangeMax(0, 4)).toBe(-1)
    })

    it('works with floating point', () => {
      const tree = new CartesianTree([1.5, 2.3, 0.7, 3.1])
      expect(tree.getRangeMax(0, 3)).toBe(3.1)
    })
  })

  describe('find', () => {
    it('returns null for empty tree', () => {
      const tree = new CartesianTree([])
      expect(tree.find(1)).toBeNull()
    })

    it('finds existing value', () => {
      const tree = new CartesianTree([3, 1, 4, 1, 5])
      const node = tree.find(4)
      expect(node).not.toBeNull()
      expect(node!.value).toBe(4)
    })

    it('returns null for non-existing value', () => {
      const tree = new CartesianTree([3, 1, 4, 1, 5])
      expect(tree.find(99)).toBeNull()
    })

    it('finds root value', () => {
      const tree = new CartesianTree([3, 1, 2])
      const node = tree.find(1)
      expect(node).not.toBeNull()
      expect(node!.index).toBe(1)
    })

    it('finds leaf value', () => {
      const tree = new CartesianTree([5, 3, 1, 4])
      const node = tree.find(5)
      expect(node).not.toBeNull()
    })

    it('finds first occurrence of duplicate', () => {
      const tree = new CartesianTree([3, 1, 4, 1, 5])
      const node = tree.find(1)
      expect(node).not.toBeNull()
      expect(node!.value).toBe(1)
    })

    it('finds with custom comparator', () => {
      const tree = new CartesianTree(['aa', 'b', 'ccc'], (a, b) => a.length - b.length)
      const node = tree.find('b')
      expect(node).not.toBeNull()
      expect(node!.value).toBe('b')
    })
  })

  describe('contains', () => {
    it('returns false for empty tree', () => {
      const tree = new CartesianTree([])
      expect(tree.contains(1)).toBe(false)
    })

    it('returns true for existing value', () => {
      const tree = new CartesianTree([3, 1, 4])
      expect(tree.contains(1)).toBe(true)
      expect(tree.contains(3)).toBe(true)
      expect(tree.contains(4)).toBe(true)
    })

    it('returns false for non-existing value', () => {
      const tree = new CartesianTree([3, 1, 4])
      expect(tree.contains(99)).toBe(false)
    })
  })

  describe('getHeight', () => {
    it('returns -1 for empty tree', () => {
      const tree = new CartesianTree([])
      expect(tree.getHeight()).toBe(-1)
    })

    it('returns 0 for single node', () => {
      const tree = new CartesianTree([1])
      expect(tree.getHeight()).toBe(0)
    })

    it('returns correct height for increasing sequence', () => {
      const tree = new CartesianTree([1, 2, 3, 4, 5])
      expect(tree.getHeight()).toBe(4)
    })

    it('returns correct height for decreasing sequence', () => {
      const tree = new CartesianTree([5, 4, 3, 2, 1])
      expect(tree.getHeight()).toBe(4)
    })

    it('height is non-negative for non-empty', () => {
      const tree = new CartesianTree([3, 1, 4, 1, 5])
      expect(tree.getHeight()).toBeGreaterThanOrEqual(0)
    })
  })

  describe('isValid', () => {
    it('empty tree is valid', () => {
      const tree = new CartesianTree([])
      expect(tree.isValid()).toBe(true)
    })

    it('single element is valid', () => {
      const tree = new CartesianTree([42])
      expect(tree.isValid()).toBe(true)
    })

    it('min-heap tree is valid', () => {
      const tree = new CartesianTree([3, 1, 4, 1, 5, 9, 2, 6, 5])
      expect(tree.isValid()).toBe(true)
    })

    it('increasing sequence is valid', () => {
      const tree = new CartesianTree([1, 2, 3, 4, 5])
      expect(tree.isValid()).toBe(true)
    })

    it('decreasing sequence is valid', () => {
      const tree = new CartesianTree([5, 4, 3, 2, 1])
      expect(tree.isValid()).toBe(true)
    })

    it('random values tree is valid', () => {
      const values = [7, 3, 9, 1, 5, 8, 10, 2, 6, 4]
      const tree = new CartesianTree(values)
      expect(tree.isValid()).toBe(true)
    })

    it('duplicates tree is valid', () => {
      const tree = new CartesianTree([5, 5, 5, 5, 5])
      expect(tree.isValid()).toBe(true)
      expect(tree.inorder()).toEqual([5, 5, 5, 5, 5])
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const tree = new CartesianTree([3, 1, 4, 1, 5])
      const cloned = tree.clone()
      expect(cloned.size()).toBe(tree.size())
      expect(cloned.inorder()).toEqual(tree.inorder())
    })

    it('cloned tree has separate root', () => {
      const tree = new CartesianTree([3, 1, 2])
      const cloned = tree.clone()
      expect(cloned.findRoot()).not.toBe(tree.findRoot())
    })

    it('clone preserves comparator', () => {
      const tree = new CartesianTree(['bb', 'a', 'ccc'], (a, b) => a.length - b.length)
      const cloned = tree.clone()
      expect(cloned.inorder()).toEqual(tree.inorder())
      expect(cloned.findRoot()?.value).toBe(tree.findRoot()?.value)
    })

    it('cloning empty tree works', () => {
      const tree = new CartesianTree([])
      const cloned = tree.clone()
      expect(cloned.isEmpty()).toBe(true)
    })

    it('clone is valid', () => {
      const tree = new CartesianTree([3, 1, 4, 1, 5])
      const cloned = tree.clone()
      expect(cloned.isValid()).toBe(true)
    })
  })

  describe('rangeQuery', () => {
    it('returns empty for empty tree', () => {
      const tree = new CartesianTree([])
      expect(tree.rangeQuery(0, 0)).toEqual([])
    })

    it('returns full range', () => {
      const values = [3, 1, 4, 1, 5]
      const tree = new CartesianTree(values)
      expect(tree.rangeQuery(0, 4)).toEqual(values)
    })

    it('returns single element', () => {
      const tree = new CartesianTree([3, 1, 4, 1, 5])
      expect(tree.rangeQuery(2, 2)).toEqual([4])
    })

    it('returns partial range', () => {
      const tree = new CartesianTree([3, 1, 4, 1, 5])
      expect(tree.rangeQuery(1, 3)).toEqual([1, 4, 1])
    })

    it('returns empty for invalid range', () => {
      const tree = new CartesianTree([1, 2, 3])
      expect(tree.rangeQuery(2, 1)).toEqual([])
    })

    it('returns empty for negative start', () => {
      const tree = new CartesianTree([1, 2, 3])
      expect(tree.rangeQuery(-1, 2)).toEqual([])
    })

    it('returns empty for end >= size', () => {
      const tree = new CartesianTree([1, 2, 3])
      expect(tree.rangeQuery(0, 3)).toEqual([])
    })

    it('returns first element', () => {
      const tree = new CartesianTree([10, 20, 30])
      expect(tree.rangeQuery(0, 0)).toEqual([10])
    })

    it('returns last element', () => {
      const tree = new CartesianTree([10, 20, 30])
      expect(tree.rangeQuery(2, 2)).toEqual([30])
    })
  })

  describe('getNodeCount', () => {
    it('returns 0 for empty tree', () => {
      const tree = new CartesianTree([])
      expect(tree.getNodeCount()).toBe(0)
    })

    it('returns 1 for single node', () => {
      const tree = new CartesianTree([1])
      expect(tree.getNodeCount()).toBe(1)
    })

    it('returns correct count', () => {
      const tree = new CartesianTree([3, 1, 4, 1, 5])
      expect(tree.getNodeCount()).toBe(5)
    })

    it('node count equals size', () => {
      const tree = new CartesianTree([7, 3, 9, 1, 5, 8, 10])
      expect(tree.getNodeCount()).toBe(tree.size())
    })
  })

  describe('node structure', () => {
    it('nodes have correct indices', () => {
      const values = [10, 20, 30, 40, 50]
      const tree = new CartesianTree(values)
      const checkIndices = (node: CTNode<number> | null): void => {
        if (node === null) return
        expect(values[node.index]).toBe(node.value)
        checkIndices(node.left)
        checkIndices(node.right)
      }
      checkIndices(tree.findRoot())
    })

    it('leaf nodes have null children', () => {
      const tree = new CartesianTree([1, 2, 3])
      const findLeaf = (node: CTNode<number> | null): CTNode<number> | null => {
        if (node === null) return null
        if (node.left === null && node.right === null) return node
        return findLeaf(node.left) ?? findLeaf(node.right)
      }
      const leaf = findLeaf(tree.findRoot())
      expect(leaf).not.toBeNull()
      expect(leaf!.left).toBeNull()
      expect(leaf!.right).toBeNull()
    })

    it('root has no parent field (variant 2)', () => {
      const tree = new CartesianTree([3, 1, 2])
      const root = tree.findRoot()
      expect(root).not.toBeNull()
      expect('parent' in root!).toBe(false)
    })
  })

  describe('heap property', () => {
    it('root is minimum value', () => {
      const tree = new CartesianTree([9, 3, 7, 1, 8, 12, 10])
      expect(tree.findRoot()?.value).toBe(1)
    })

    it('parent <= children for all nodes', () => {
      const tree = new CartesianTree([9, 3, 7, 1, 8, 12, 10])
      const checkMinHeap = (node: CTNode<number> | null): boolean => {
        if (node === null) return true
        if (node.left !== null && node.left.value < node.value) return false
        if (node.right !== null && node.right.value < node.value) return false
        return checkMinHeap(node.left) && checkMinHeap(node.right)
      }
      expect(checkMinHeap(tree.findRoot())).toBe(true)
    })

    it('handles all same values', () => {
      const tree = new CartesianTree([5, 5, 5, 5, 5])
      expect(tree.isValid()).toBe(true)
      expect(tree.inorder()).toEqual([5, 5, 5, 5, 5])
    })
  })

  describe('max-heap via custom comparator', () => {
    it('root is maximum value', () => {
      const tree = new CartesianTree([5, 3, 7, 1, 8], (a, b) => b - a)
      expect(tree.findRoot()?.value).toBe(8)
    })

    it('parent >= children for all nodes', () => {
      const tree = new CartesianTree([9, 3, 7, 1, 8, 12, 10], (a, b) => b - a)
      const checkMaxHeap = (node: CTNode<number> | null): boolean => {
        if (node === null) return true
        if (node.left !== null && node.left.value > node.value) return false
        if (node.right !== null && node.right.value > node.value) return false
        return checkMaxHeap(node.left) && checkMaxHeap(node.right)
      }
      expect(checkMaxHeap(tree.findRoot())).toBe(true)
    })

    it('inorder preserves original sequence', () => {
      const values = [9, 3, 7, 1, 8]
      const tree = new CartesianTree(values, (a, b) => b - a)
      expect(tree.inorder()).toEqual(values)
    })

    it('isValid returns true for max-heap tree', () => {
      const tree = new CartesianTree([9, 3, 7, 1, 8], (a, b) => b - a)
      expect(tree.isValid()).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles negative numbers', () => {
      const tree = new CartesianTree([-3, -1, -4, -1, -5])
      expect(tree.findRoot()?.value).toBe(-5)
      expect(tree.isValid()).toBe(true)
    })

    it('handles mixed positive and negative', () => {
      const tree = new CartesianTree([-3, 0, 5, -1, 2])
      expect(tree.isValid()).toBe(true)
      expect(tree.inorder()).toEqual([-3, 0, 5, -1, 2])
    })

    it('handles floating point numbers', () => {
      const tree = new CartesianTree([1.5, 2.3, 0.7, 3.1])
      expect(tree.findRoot()?.value).toBe(0.7)
      expect(tree.isValid()).toBe(true)
    })

    it('handles string values with default comparison', () => {
      const tree = new CartesianTree(['cherry', 'apple', 'banana'])
      expect(tree.findRoot()?.value).toBe('apple')
      expect(tree.isValid()).toBe(true)
      expect(tree.inorder()).toEqual(['cherry', 'apple', 'banana'])
    })

    it('handles object values with custom comparator', () => {
      const tree = new CartesianTree<{ priority: number }>(
        [{ priority: 3 }, { priority: 1 }, { priority: 2 }],
        (a, b) => a.priority - b.priority
      )
      expect(tree.findRoot()?.value.priority).toBe(1)
      expect(tree.isValid()).toBe(true)
    })

    it('handles two equal elements', () => {
      const tree = new CartesianTree([1, 1])
      expect(tree.isValid()).toBe(true)
      expect(tree.inorder()).toEqual([1, 1])
    })
  })

  describe('traversal consistency', () => {
    it('all traversals have same length', () => {
      const values = [3, 1, 4, 1, 5, 9, 2, 6]
      const tree = new CartesianTree(values)
      expect(tree.inorder().length).toBe(values.length)
      expect(tree.preorder().length).toBe(values.length)
      expect(tree.postorder().length).toBe(values.length)
      expect(tree.levelOrder().length).toBe(values.length)
    })

    it('sorted elements match across traversals', () => {
      const values = [3, 1, 4, 1, 5, 9, 2, 6]
      const tree = new CartesianTree(values)
      const sortArr = (arr: number[]) => [...arr].sort((a, b) => a - b)
      const sorted = sortArr(values)
      expect(sortArr(tree.inorder())).toEqual(sorted)
      expect(sortArr(tree.preorder())).toEqual(sorted)
      expect(sortArr(tree.postorder())).toEqual(sorted)
      expect(sortArr(tree.levelOrder())).toEqual(sorted)
    })
  })

  describe('static fromArray', () => {
    it('creates tree from values', () => {
      const tree = CartesianTree.fromArray([3, 1, 4, 1, 5])
      expect(tree.size()).toBe(5)
      expect(tree.inorder()).toEqual([3, 1, 4, 1, 5])
      expect(tree.isValid()).toBe(true)
    })

    it('creates empty tree', () => {
      const tree = CartesianTree.fromArray([])
      expect(tree.isEmpty()).toBe(true)
    })

    it('uses default comparator', () => {
      const tree = CartesianTree.fromArray([5, 3, 1, 4, 2])
      expect(tree.findRoot()?.value).toBe(1)
    })

    it('accepts custom comparator', () => {
      const tree = CartesianTree.fromArray([5, 3, 1, 4, 2], (a, b) => b - a)
      expect(tree.findRoot()?.value).toBe(5)
    })
  })

  describe('static build', () => {
    it('creates tree from values', () => {
      const tree = CartesianTree.build([9, 3, 7, 1, 8])
      expect(tree.size()).toBe(5)
      expect(tree.findRoot()?.value).toBe(1)
      expect(tree.isValid()).toBe(true)
    })

    it('creates empty tree', () => {
      const tree = CartesianTree.build([])
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('range min/max integration', () => {
    it('getRangeMin over single element returns that element', () => {
      const tree = new CartesianTree([10, 20, 30, 40, 50])
      expect(tree.getRangeMin(0, 0)).toBe(10)
      expect(tree.getRangeMin(4, 4)).toBe(50)
    })

    it('getRangeMax over single element returns that element', () => {
      const tree = new CartesianTree([10, 20, 30, 40, 50])
      expect(tree.getRangeMax(0, 0)).toBe(10)
      expect(tree.getRangeMax(4, 4)).toBe(50)
    })

    it('getRangeMin on full range equals root value for min-heap', () => {
      const tree = new CartesianTree([9, 3, 7, 1, 8])
      expect(tree.getRangeMin(0, 4)).toBe(tree.findRoot()?.value)
    })

    it('getRangeMin and getRangeMax work on overlapping ranges', () => {
      const tree = new CartesianTree([5, 2, 8, 1, 9, 4, 7])
      expect(tree.getRangeMin(1, 3)).toBe(1)
      expect(tree.getRangeMax(1, 3)).toBe(8)
      expect(tree.getRangeMin(4, 6)).toBe(4)
      expect(tree.getRangeMax(4, 6)).toBe(9)
    })

    it('getRangeMin with custom max-heap comparator', () => {
      const tree = new CartesianTree([5, 2, 8, 1, 9], (a, b) => b - a)
      expect(tree.getRangeMin(0, 4)).toBe(9)
      expect(tree.getRangeMax(0, 4)).toBe(1)
    })
  })

  describe('divide-and-conquer build verification', () => {
    it('builds correct tree for Wikipedia example', () => {
      const values = [9, 3, 7, 1, 8, 12, 10, 20, 15, 18, 5]
      const tree = new CartesianTree(values)
      expect(tree.findRoot()?.value).toBe(1)
      expect(tree.inorder()).toEqual(values)
      expect(tree.isValid()).toBe(true)
    })

    it('inorder traversal indices are sequential', () => {
      const values = [4, 2, 6, 1, 3, 5, 7]
      const tree = new CartesianTree(values)
      const indices: number[] = []
      const collectIndices = (node: CTNode<number> | null): void => {
        if (node === null) return
        collectIndices(node.left)
        indices.push(node.index)
        collectIndices(node.right)
      }
      collectIndices(tree.findRoot())
      expect(indices).toEqual([0, 1, 2, 3, 4, 5, 6])
    })
  })

  describe('generics', () => {
    it('works with number type', () => {
      const tree = new CartesianTree<number>([3, 1, 2])
      expect(tree.findRoot()?.value).toBe(1)
    })

    it('works with string type', () => {
      const tree = new CartesianTree<string>(['banana', 'apple', 'cherry'])
      expect(tree.findRoot()?.value).toBe('apple')
    })

    it('works with Date type', () => {
      const dates = [new Date(2023, 5, 1), new Date(2023, 1, 1), new Date(2023, 3, 1)]
      const tree = new CartesianTree<Date>(dates, (a, b) => a.getTime() - b.getTime())
      expect(tree.findRoot()?.value).toBe(dates[1])
      expect(tree.isValid()).toBe(true)
    })

    it('works with object type', () => {
      type Item = { id: number; name: string }
      const items: Item[] = [
        { id: 3, name: 'c' },
        { id: 1, name: 'a' },
        { id: 2, name: 'b' },
      ]
      const tree = new CartesianTree<Item>(items, (a, b) => a.id - b.id)
      expect(tree.findRoot()?.value.name).toBe('a')
      expect(tree.isValid()).toBe(true)
    })
  })

  describe('stress tests', () => {
    it('builds 5000 random elements', () => {
      const values = Array.from({ length: 5000 }, () => Math.floor(Math.random() * 10000))
      const tree = new CartesianTree(values)
      expect(tree.size()).toBe(5000)
      expect(tree.inorder()).toEqual(values)
      expect(tree.isValid()).toBe(true)
    })

    it('builds sorted input', () => {
      const values = Array.from({ length: 5000 }, (_, i) => i)
      const tree = new CartesianTree(values)
      expect(tree.size()).toBe(5000)
      expect(tree.inorder()).toEqual(values)
      expect(tree.isValid()).toBe(true)
    })

    it('builds reverse sorted input', () => {
      const values = Array.from({ length: 5000 }, (_, i) => 5000 - i)
      const tree = new CartesianTree(values)
      expect(tree.size()).toBe(5000)
      expect(tree.inorder()).toEqual(values)
      expect(tree.isValid()).toBe(true)
    })

    it('getHeight on sorted input', () => {
      const values = Array.from({ length: 1000 }, (_, i) => i)
      const tree = new CartesianTree(values)
      expect(tree.getHeight()).toBe(999)
    })

    it('rangeQuery on large input', () => {
      const values = Array.from({ length: 1000 }, (_, i) => i)
      const tree = new CartesianTree(values)
      const result = tree.rangeQuery(100, 199)
      expect(result.length).toBe(100)
      expect(result[0]).toBe(100)
      expect(result[99]).toBe(199)
    })

    it('clone on large input', () => {
      const values = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 1000))
      const tree = new CartesianTree(values)
      const cloned = tree.clone()
      expect(cloned.size()).toBe(1000)
      expect(cloned.inorder()).toEqual(values)
    })

    it('find on large input', () => {
      const values = Array.from({ length: 1000 }, (_, i) => i)
      const tree = new CartesianTree(values)
      expect(tree.find(500)).not.toBeNull()
      expect(tree.find(999)).not.toBeNull()
      expect(tree.find(1000)).toBeNull()
    })

    it('getRangeMin/Max on large input', () => {
      const values = Array.from({ length: 1000 }, (_, i) => i * 2)
      const tree = new CartesianTree(values)
      expect(tree.getRangeMin(0, 999)).toBe(0)
      expect(tree.getRangeMax(0, 999)).toBe(1998)
      expect(tree.getRangeMin(100, 200)).toBe(200)
      expect(tree.getRangeMax(100, 200)).toBe(400)
    })

    it('max-heap stress test', () => {
      const values = Array.from({ length: 3000 }, () => Math.floor(Math.random() * 5000))
      const tree = new CartesianTree(values, (a, b) => b - a)
      expect(tree.size()).toBe(3000)
      expect(tree.isValid()).toBe(true)
    })
  })

  describe('comprehensive integration', () => {
    it('all methods work together', () => {
      const values = [9, 3, 7, 1, 8, 12, 10, 20, 15, 6, 2, 11]
      const tree = new CartesianTree(values)

      expect(tree.size()).toBe(12)
      expect(tree.isEmpty()).toBe(false)
      expect(tree.findRoot()).not.toBeNull()
      expect(tree.inorder()).toEqual(values)
      expect(tree.toArray()).toEqual(values)
      expect(tree.isValid()).toBe(true)

      const found = tree.find(8)
      expect(found).not.toBeNull()
      expect(found!.value).toBe(8)

      expect(tree.getHeight()).toBeGreaterThanOrEqual(0)

      expect(tree.getRangeMin(0, 11)).toBe(1)
      expect(tree.getRangeMax(0, 11)).toBe(20)
      expect(tree.getRangeMin(3, 7)).toBe(1)
      expect(tree.getRangeMax(3, 7)).toBe(20)

      const range = tree.rangeQuery(3, 7)
      expect(range).toEqual(values.slice(3, 8))

      const cloned = tree.clone()
      expect(cloned.inorder()).toEqual(values)

      expect(tree.preorder().length).toBe(12)
      expect(tree.postorder().length).toBe(12)
      expect(tree.levelOrder().length).toBe(12)

      expect(tree.getNodeCount()).toBe(12)
      expect(tree.contains(8)).toBe(true)
      expect(tree.contains(99)).toBe(false)

      expect(tree.getValues()).toEqual(values)
    })

    it('handles alternating high-low sequence', () => {
      const values = [10, 1, 9, 2, 8, 3, 7, 4, 6, 5]
      const tree = new CartesianTree(values)
      expect(tree.findRoot()?.value).toBe(1)
      expect(tree.inorder()).toEqual(values)
      expect(tree.isValid()).toBe(true)
    })

    it('handles palindrome sequence', () => {
      const values = [1, 2, 3, 4, 5, 4, 3, 2, 1]
      const tree = new CartesianTree(values)
      expect(tree.findRoot()?.value).toBe(1)
      expect(tree.inorder()).toEqual(values)
      expect(tree.isValid()).toBe(true)
    })
  })
})
