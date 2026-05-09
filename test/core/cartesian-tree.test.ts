import { describe, it, expect } from 'vitest'
import { CartesianTree } from '../../src/core/cartesian-tree/cartesian-tree.js'
import type { CartesianNode } from '../../src/core/cartesian-tree/types.js'

describe('CartesianTree', () => {
  describe('constructor', () => {
    it('creates empty tree from empty array', () => {
      const tree = new CartesianTree({ values: [] })
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.getRoot()).toBeNull()
    })

    it('creates tree from single element', () => {
      const tree = new CartesianTree({ values: [42] })
      expect(tree.size()).toBe(1)
      expect(tree.isEmpty()).toBe(false)
      expect(tree.getRoot()?.value).toBe(42)
    })

    it('creates tree with default min-heap property', () => {
      const tree = new CartesianTree({ values: [3, 2, 1, 6, 4, 5] })
      expect(tree.getRoot()?.value).toBe(1)
      expect(tree.isValid()).toBe(true)
    })

    it('creates tree with max-heap property', () => {
      const tree = new CartesianTree({ values: [3, 2, 1, 6, 4, 5], heapProperty: 'max' })
      expect(tree.getRoot()?.value).toBe(6)
      expect(tree.isValid()).toBe(true)
    })

    it('creates tree with custom comparator', () => {
      const tree = new CartesianTree({
        values: ['bb', 'aaa', 'c'],
        comparator: (a, b) => a.length - b.length,
      })
      expect(tree.getRoot()?.value).toBe('c')
      expect(tree.isValid()).toBe(true)
    })

    it('preserves original values array (no mutation)', () => {
      const values = [3, 1, 2]
      const tree = new CartesianTree({ values })
      values.push(4)
      expect(tree.size()).toBe(3)
    })

    it('handles duplicate values', () => {
      const tree = new CartesianTree({ values: [3, 3, 3] })
      expect(tree.size()).toBe(3)
      expect(tree.isValid()).toBe(true)
    })

    it('handles strictly increasing sequence', () => {
      const tree = new CartesianTree({ values: [1, 2, 3, 4, 5] })
      expect(tree.getRoot()?.value).toBe(1)
      expect(tree.isValid()).toBe(true)
    })

    it('handles strictly decreasing sequence', () => {
      const tree = new CartesianTree({ values: [5, 4, 3, 2, 1] })
      expect(tree.getRoot()?.value).toBe(1)
      expect(tree.isValid()).toBe(true)
    })

    it('handles two elements', () => {
      const tree = new CartesianTree({ values: [2, 1] })
      expect(tree.size()).toBe(2)
      expect(tree.getRoot()?.value).toBe(1)
      expect(tree.isValid()).toBe(true)
    })
  })

  describe('getRoot', () => {
    it('returns null for empty tree', () => {
      const tree = new CartesianTree({ values: [] })
      expect(tree.getRoot()).toBeNull()
    })

    it('returns root node with correct properties', () => {
      const tree = new CartesianTree({ values: [4, 2, 5, 1, 3] })
      const root = tree.getRoot()
      expect(root).not.toBeNull()
      expect(root!.value).toBe(1)
      expect(root!.parent).toBeNull()
      expect(root!.index).toBe(3)
    })
  })

  describe('size and isEmpty', () => {
    it('returns 0 for empty tree', () => {
      const tree = new CartesianTree({ values: [] })
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('returns correct size for non-empty tree', () => {
      const tree = new CartesianTree({ values: [1, 2, 3] })
      expect(tree.size()).toBe(3)
      expect(tree.isEmpty()).toBe(false)
    })

    it('returns correct size for large tree', () => {
      const values = Array.from({ length: 100 }, (_, i) => 100 - i)
      const tree = new CartesianTree({ values })
      expect(tree.size()).toBe(100)
    })
  })

  describe('inorder', () => {
    it('returns empty array for empty tree', () => {
      const tree = new CartesianTree({ values: [] })
      expect(tree.inorder()).toEqual([])
    })

    it('returns single element for single node', () => {
      const tree = new CartesianTree({ values: [5] })
      expect(tree.inorder()).toEqual([5])
    })

    it('returns original sequence order', () => {
      const values = [3, 1, 4, 1, 5, 9, 2, 6]
      const tree = new CartesianTree({ values })
      expect(tree.inorder()).toEqual(values)
    })

    it('returns original sequence for max-heap', () => {
      const values = [3, 1, 4, 1, 5]
      const tree = new CartesianTree({ values, heapProperty: 'max' })
      expect(tree.inorder()).toEqual(values)
    })

    it('returns original sequence with custom comparator', () => {
      const values = ['hello', 'hi', 'hey', 'yo']
      const tree = new CartesianTree({
        values,
        comparator: (a, b) => a.length - b.length,
      })
      expect(tree.inorder()).toEqual(values)
    })
  })

  describe('preorder', () => {
    it('returns empty array for empty tree', () => {
      const tree = new CartesianTree({ values: [] })
      expect(tree.preorder()).toEqual([])
    })

    it('returns single element for single node', () => {
      const tree = new CartesianTree({ values: [7] })
      expect(tree.preorder()).toEqual([7])
    })

    it('root is first in preorder', () => {
      const tree = new CartesianTree({ values: [3, 1, 2] })
      expect(tree.preorder()[0]).toBe(1)
    })

    it('preorder length equals size', () => {
      const tree = new CartesianTree({ values: [5, 3, 7, 1, 4] })
      expect(tree.preorder().length).toBe(5)
    })
  })

  describe('postorder', () => {
    it('returns empty array for empty tree', () => {
      const tree = new CartesianTree({ values: [] })
      expect(tree.postorder()).toEqual([])
    })

    it('returns single element for single node', () => {
      const tree = new CartesianTree({ values: [9] })
      expect(tree.postorder()).toEqual([9])
    })

    it('root is last in postorder', () => {
      const tree = new CartesianTree({ values: [3, 1, 2] })
      const post = tree.postorder()
      expect(post[post.length - 1]).toBe(1)
    })

    it('postorder length equals size', () => {
      const tree = new CartesianTree({ values: [5, 3, 7, 1, 4] })
      expect(tree.postorder().length).toBe(5)
    })
  })

  describe('levelOrder', () => {
    it('returns empty array for empty tree', () => {
      const tree = new CartesianTree({ values: [] })
      expect(tree.levelOrder()).toEqual([])
    })

    it('returns single element for single node', () => {
      const tree = new CartesianTree({ values: [1] })
      expect(tree.levelOrder()).toEqual([1])
    })

    it('root is first in level order', () => {
      const tree = new CartesianTree({ values: [3, 1, 2] })
      expect(tree.levelOrder()[0]).toBe(1)
    })

    it('levelOrder length equals size', () => {
      const tree = new CartesianTree({ values: [5, 3, 7, 1, 4] })
      expect(tree.levelOrder().length).toBe(5)
    })

    it('visits nodes level by level', () => {
      const tree = new CartesianTree({ values: [2, 1, 3] })
      const lo = tree.levelOrder()
      expect(lo[0]).toBe(1)
      expect(lo.length).toBe(3)
    })
  })

  describe('find', () => {
    it('returns null for empty tree', () => {
      const tree = new CartesianTree({ values: [] })
      expect(tree.find(1)).toBeNull()
    })

    it('finds existing value', () => {
      const tree = new CartesianTree({ values: [3, 1, 4, 1, 5] })
      const node = tree.find(4)
      expect(node).not.toBeNull()
      expect(node!.value).toBe(4)
    })

    it('returns null for non-existing value', () => {
      const tree = new CartesianTree({ values: [3, 1, 4, 1, 5] })
      expect(tree.find(99)).toBeNull()
    })

    it('finds root value', () => {
      const tree = new CartesianTree({ values: [3, 1, 2] })
      const node = tree.find(1)
      expect(node).not.toBeNull()
      expect(node!.parent).toBeNull()
    })

    it('finds leaf value', () => {
      const tree = new CartesianTree({ values: [5, 3, 1, 4] })
      const node = tree.find(4)
      expect(node).not.toBeNull()
      expect(node!.left).toBeNull()
      expect(node!.right).toBeNull()
    })

    it('finds first occurrence of duplicate value', () => {
      const tree = new CartesianTree({ values: [3, 1, 4, 1, 5] })
      const node = tree.find(1)
      expect(node).not.toBeNull()
      expect(node!.value).toBe(1)
    })

    it('finds with custom comparator', () => {
      const tree = new CartesianTree({
        values: ['aa', 'b', 'ccc'],
        comparator: (a, b) => a.length - b.length,
      })
      const node = tree.find('b')
      expect(node).not.toBeNull()
      expect(node!.value).toBe('b')
    })
  })

  describe('getHeight', () => {
    it('returns -1 for empty tree', () => {
      const tree = new CartesianTree({ values: [] })
      expect(tree.getHeight()).toBe(-1)
    })

    it('returns 0 for single node', () => {
      const tree = new CartesianTree({ values: [1] })
      expect(tree.getHeight()).toBe(0)
    })

    it('returns correct height for increasing sequence', () => {
      const tree = new CartesianTree({ values: [1, 2, 3, 4, 5] })
      expect(tree.getHeight()).toBe(4)
    })

    it('returns correct height for decreasing sequence', () => {
      const tree = new CartesianTree({ values: [5, 4, 3, 2, 1] })
      expect(tree.getHeight()).toBe(4)
    })

    it('height is non-negative for non-empty tree', () => {
      const tree = new CartesianTree({ values: [3, 1, 4, 1, 5] })
      expect(tree.getHeight()).toBeGreaterThanOrEqual(0)
    })
  })

  describe('toArray', () => {
    it('returns same as inorder', () => {
      const tree = new CartesianTree({ values: [3, 1, 4, 1, 5, 9, 2, 6] })
      expect(tree.toArray()).toEqual(tree.inorder())
    })

    it('returns empty array for empty tree', () => {
      const tree = new CartesianTree({ values: [] })
      expect(tree.toArray()).toEqual([])
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const tree = new CartesianTree({ values: [3, 1, 4, 1, 5] })
      const cloned = tree.clone()
      expect(cloned.size()).toBe(tree.size())
      expect(cloned.inorder()).toEqual(tree.inorder())
    })

    it('cloned tree has separate root', () => {
      const tree = new CartesianTree({ values: [3, 1, 2] })
      const cloned = tree.clone()
      expect(cloned.getRoot()).not.toBe(tree.getRoot())
    })

    it('clone preserves comparator', () => {
      const tree = new CartesianTree({
        values: ['bb', 'a', 'ccc'],
        comparator: (a, b) => a.length - b.length,
      })
      const cloned = tree.clone()
      expect(cloned.inorder()).toEqual(tree.inorder())
      expect(cloned.getRoot()?.value).toBe(tree.getRoot()?.value)
    })

    it('clone preserves heap property', () => {
      const tree = new CartesianTree({ values: [3, 1, 4, 1, 5], heapProperty: 'max' })
      const cloned = tree.clone()
      expect(cloned.getRoot()?.value).toBe(tree.getRoot()?.value)
      expect(cloned.isValid()).toBe(true)
    })

    it('cloning empty tree works', () => {
      const tree = new CartesianTree({ values: [] })
      const cloned = tree.clone()
      expect(cloned.isEmpty()).toBe(true)
    })
  })

  describe('rangeQuery', () => {
    it('returns empty for empty tree', () => {
      const tree = new CartesianTree({ values: [] })
      expect(tree.rangeQuery(0, 0)).toEqual([])
    })

    it('returns full range', () => {
      const values = [3, 1, 4, 1, 5]
      const tree = new CartesianTree({ values })
      expect(tree.rangeQuery(0, 4)).toEqual(values)
    })

    it('returns single element range', () => {
      const tree = new CartesianTree({ values: [3, 1, 4, 1, 5] })
      expect(tree.rangeQuery(2, 2)).toEqual([4])
    })

    it('returns partial range', () => {
      const tree = new CartesianTree({ values: [3, 1, 4, 1, 5] })
      expect(tree.rangeQuery(1, 3)).toEqual([1, 4, 1])
    })

    it('returns empty for invalid range (start > end)', () => {
      const tree = new CartesianTree({ values: [1, 2, 3] })
      expect(tree.rangeQuery(2, 1)).toEqual([])
    })

    it('returns empty for negative start', () => {
      const tree = new CartesianTree({ values: [1, 2, 3] })
      expect(tree.rangeQuery(-1, 2)).toEqual([])
    })

    it('returns empty for end >= size', () => {
      const tree = new CartesianTree({ values: [1, 2, 3] })
      expect(tree.rangeQuery(0, 3)).toEqual([])
    })

    it('returns first element', () => {
      const tree = new CartesianTree({ values: [10, 20, 30] })
      expect(tree.rangeQuery(0, 0)).toEqual([10])
    })

    it('returns last element', () => {
      const tree = new CartesianTree({ values: [10, 20, 30] })
      expect(tree.rangeQuery(2, 2)).toEqual([30])
    })
  })

  describe('lowestCommonAncestor', () => {
    it('returns undefined for empty tree', () => {
      const tree = new CartesianTree({ values: [] })
      expect(tree.lowestCommonAncestor(0, 1)).toBeUndefined()
    })

    it('returns undefined for out-of-range indices', () => {
      const tree = new CartesianTree({ values: [1, 2, 3] })
      expect(tree.lowestCommonAncestor(0, 5)).toBeUndefined()
      expect(tree.lowestCommonAncestor(-1, 2)).toBeUndefined()
    })

    it('returns root when indices span entire tree', () => {
      const tree = new CartesianTree({ values: [4, 2, 5, 1, 3] })
      const lca = tree.lowestCommonAncestor(0, 4)
      expect(lca).toBe(1)
    })

    it('returns value for same index', () => {
      const tree = new CartesianTree({ values: [3, 1, 4, 1, 5] })
      const lca = tree.lowestCommonAncestor(2, 2)
      expect(lca).toBe(4)
    })

    it('finds LCA of adjacent elements', () => {
      const tree = new CartesianTree({ values: [4, 2, 5, 1, 3] })
      const lca = tree.lowestCommonAncestor(0, 1)
      expect(lca).toBeDefined()
    })

    it('LCA value is in original sequence', () => {
      const values = [4, 2, 5, 1, 3]
      const tree = new CartesianTree({ values })
      const lca = tree.lowestCommonAncestor(0, 4)
      expect(values).toContain(lca)
    })

    it('LCA of root and leaf is root', () => {
      const tree = new CartesianTree({ values: [3, 1, 2] })
      const rootVal = tree.getRoot()!.value
      const lca = tree.lowestCommonAncestor(1, 2)
      expect(lca).toBe(rootVal)
    })
  })

  describe('isValid', () => {
    it('empty tree is valid', () => {
      const tree = new CartesianTree({ values: [] })
      expect(tree.isValid()).toBe(true)
    })

    it('single element tree is valid', () => {
      const tree = new CartesianTree({ values: [42] })
      expect(tree.isValid()).toBe(true)
    })

    it('min-heap tree is valid', () => {
      const tree = new CartesianTree({ values: [3, 1, 4, 1, 5, 9, 2, 6, 5] })
      expect(tree.isValid()).toBe(true)
    })

    it('max-heap tree is valid', () => {
      const tree = new CartesianTree({ values: [3, 1, 4, 1, 5, 9, 2, 6, 5], heapProperty: 'max' })
      expect(tree.isValid()).toBe(true)
    })

    it('increasing sequence tree is valid', () => {
      const tree = new CartesianTree({ values: [1, 2, 3, 4, 5] })
      expect(tree.isValid()).toBe(true)
    })

    it('decreasing sequence tree is valid', () => {
      const tree = new CartesianTree({ values: [5, 4, 3, 2, 1] })
      expect(tree.isValid()).toBe(true)
    })

    it('random values tree is valid', () => {
      const values = [7, 3, 9, 1, 5, 8, 10, 2, 6, 4]
      const tree = new CartesianTree({ values })
      expect(tree.isValid()).toBe(true)
    })
  })

  describe('buildFromInorder (static)', () => {
    it('creates tree from values', () => {
      const tree = CartesianTree.buildFromInorder([3, 1, 4, 1, 5])
      expect(tree.size()).toBe(5)
      expect(tree.inorder()).toEqual([3, 1, 4, 1, 5])
      expect(tree.isValid()).toBe(true)
    })

    it('creates empty tree', () => {
      const tree = CartesianTree.buildFromInorder([])
      expect(tree.isEmpty()).toBe(true)
    })

    it('uses default comparator and min-heap', () => {
      const tree = CartesianTree.buildFromInorder([5, 3, 1, 4, 2])
      expect(tree.getRoot()?.value).toBe(1)
    })
  })

  describe('node structure', () => {
    it('root has null parent', () => {
      const tree = new CartesianTree({ values: [3, 1, 2] })
      expect(tree.getRoot()?.parent).toBeNull()
    })

    it('children have correct parent references', () => {
      const tree = new CartesianTree({ values: [2, 1, 3] })
      const root = tree.getRoot()!
      if (root.left !== null) {
        expect(root.left.parent).toBe(root)
      }
      if (root.right !== null) {
        expect(root.right.parent).toBe(root)
      }
    })

    it('indices are correctly assigned', () => {
      const values = [10, 20, 30, 40, 50]
      const tree = new CartesianTree({ values })
      const checkIndices = (node: CartesianNode<number> | null): void => {
        if (node === null) return
        expect(values[node.index]).toBe(node.value)
        checkIndices(node.left)
        checkIndices(node.right)
      }
      checkIndices(tree.getRoot())
    })

    it('leaf nodes have null children', () => {
      const tree = new CartesianTree({ values: [1, 2, 3] })
      const findLeaf = (node: CartesianNode<number> | null): CartesianNode<number> | null => {
        if (node === null) return null
        if (node.left === null && node.right === null) return node
        return findLeaf(node.left) ?? findLeaf(node.right)
      }
      const leaf = findLeaf(tree.getRoot())
      expect(leaf).not.toBeNull()
    })
  })

  describe('min-heap property', () => {
    it('root is minimum value', () => {
      const tree = new CartesianTree({ values: [9, 3, 7, 1, 8, 12, 10] })
      expect(tree.getRoot()?.value).toBe(1)
    })

    it('parent <= children for all nodes', () => {
      const tree = new CartesianTree({ values: [9, 3, 7, 1, 8, 12, 10] })
      const checkMinHeap = (node: CartesianNode<number> | null): boolean => {
        if (node === null) return true
        if (node.left !== null && node.left.value < node.value) return false
        if (node.right !== null && node.right.value < node.value) return false
        return checkMinHeap(node.left) && checkMinHeap(node.right)
      }
      expect(checkMinHeap(tree.getRoot())).toBe(true)
    })

    it('handles all same values', () => {
      const tree = new CartesianTree({ values: [5, 5, 5, 5, 5] })
      expect(tree.isValid()).toBe(true)
      expect(tree.inorder()).toEqual([5, 5, 5, 5, 5])
    })
  })

  describe('max-heap property', () => {
    it('root is first occurrence for max-heap with given input', () => {
      const tree = new CartesianTree({ values: [5, 3, 7, 1, 8], heapProperty: 'max' })
      const root = tree.getRoot()!
      expect(root.value).toBe(8)
    })

    it('parent >= children for all nodes in max-heap', () => {
      const tree = new CartesianTree({ values: [9, 3, 7, 1, 8, 12, 10], heapProperty: 'max' })
      const checkMaxHeap = (node: CartesianNode<number> | null): boolean => {
        if (node === null) return true
        if (node.left !== null && node.left.value > node.value) return false
        if (node.right !== null && node.right.value > node.value) return false
        return checkMaxHeap(node.left) && checkMaxHeap(node.right)
      }
      expect(checkMaxHeap(tree.getRoot())).toBe(true)
    })

    it('inorder preserves original sequence for max-heap', () => {
      const values = [9, 3, 7, 1, 8]
      const tree = new CartesianTree({ values, heapProperty: 'max' })
      expect(tree.inorder()).toEqual(values)
    })
  })

  describe('edge cases', () => {
    it('handles two elements ascending', () => {
      const tree = new CartesianTree({ values: [1, 2] })
      expect(tree.getRoot()?.value).toBe(1)
      expect(tree.isValid()).toBe(true)
      expect(tree.inorder()).toEqual([1, 2])
    })

    it('handles two elements descending', () => {
      const tree = new CartesianTree({ values: [2, 1] })
      expect(tree.getRoot()?.value).toBe(1)
      expect(tree.isValid()).toBe(true)
      expect(tree.inorder()).toEqual([2, 1])
    })

    it('handles two equal elements', () => {
      const tree = new CartesianTree({ values: [1, 1] })
      expect(tree.isValid()).toBe(true)
      expect(tree.inorder()).toEqual([1, 1])
    })

    it('handles negative numbers', () => {
      const tree = new CartesianTree({ values: [-3, -1, -4, -1, -5] })
      expect(tree.getRoot()?.value).toBe(-5)
      expect(tree.isValid()).toBe(true)
    })

    it('handles mixed positive and negative', () => {
      const tree = new CartesianTree({ values: [-3, 0, 5, -1, 2] })
      expect(tree.isValid()).toBe(true)
      expect(tree.inorder()).toEqual([-3, 0, 5, -1, 2])
    })

    it('handles floating point numbers', () => {
      const tree = new CartesianTree({ values: [1.5, 2.3, 0.7, 3.1] })
      expect(tree.getRoot()?.value).toBe(0.7)
      expect(tree.isValid()).toBe(true)
    })

    it('handles string values', () => {
      const tree = new CartesianTree({ values: ['cherry', 'apple', 'banana'] })
      expect(tree.getRoot()?.value).toBe('apple')
      expect(tree.isValid()).toBe(true)
      expect(tree.inorder()).toEqual(['cherry', 'apple', 'banana'])
    })

    it('handles object values with custom comparator', () => {
      const tree = new CartesianTree<{ priority: number }>({
        values: [{ priority: 3 }, { priority: 1 }, { priority: 2 }],
        comparator: (a, b) => a.priority - b.priority,
      })
      expect(tree.getRoot()?.value.priority).toBe(1)
      expect(tree.isValid()).toBe(true)
    })
  })

  describe('traversals consistency', () => {
    it('all traversals contain same elements', () => {
      const values = [3, 1, 4, 1, 5, 9, 2, 6]
      const tree = new CartesianTree({ values })
      const inorder = tree.inorder()
      const preorder = tree.preorder()
      const postorder = tree.postorder()
      const levelOrder = tree.levelOrder()
      expect(inorder.length).toBe(values.length)
      expect(preorder.length).toBe(values.length)
      expect(postorder.length).toBe(values.length)
      expect(levelOrder.length).toBe(values.length)
    })

    it('sorted count of elements matches across traversals', () => {
      const values = [3, 1, 4, 1, 5, 9, 2, 6]
      const tree = new CartesianTree({ values })
      const sortArr = (arr: number[]) => [...arr].sort((a, b) => a - b)
      const sorted = sortArr(values)
      expect(sortArr(tree.inorder())).toEqual(sorted)
      expect(sortArr(tree.preorder())).toEqual(sorted)
      expect(sortArr(tree.postorder())).toEqual(sorted)
      expect(sortArr(tree.levelOrder())).toEqual(sorted)
    })
  })

  describe('O(n) build verification', () => {
    it('builds 10000 elements without stack overflow', () => {
      const values = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 10000))
      const start = performance.now()
      const tree = new CartesianTree({ values })
      const elapsed = performance.now() - start
      expect(tree.size()).toBe(10000)
      expect(tree.inorder()).toEqual(values)
      expect(elapsed).toBeLessThan(1000)
    })

    it('stress test with sorted input', () => {
      const values = Array.from({ length: 10000 }, (_, i) => i)
      const tree = new CartesianTree({ values })
      expect(tree.size()).toBe(10000)
      expect(tree.inorder()).toEqual(values)
      expect(tree.isValid()).toBe(true)
    })

    it('stress test with reverse sorted input', () => {
      const values = Array.from({ length: 10000 }, (_, i) => 10000 - i)
      const tree = new CartesianTree({ values })
      expect(tree.size()).toBe(10000)
      expect(tree.inorder()).toEqual(values)
      expect(tree.isValid()).toBe(true)
    })

    it('stress test getHeight', () => {
      const values = Array.from({ length: 10000 }, (_, i) => i)
      const tree = new CartesianTree({ values })
      expect(tree.getHeight()).toBe(9999)
    })

    it('stress test rangeQuery', () => {
      const values = Array.from({ length: 1000 }, (_, i) => i)
      const tree = new CartesianTree({ values })
      const result = tree.rangeQuery(100, 199)
      expect(result.length).toBe(100)
      expect(result[0]).toBe(100)
      expect(result[99]).toBe(199)
    })

    it('stress test clone', () => {
      const values = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 1000))
      const tree = new CartesianTree({ values })
      const cloned = tree.clone()
      expect(cloned.size()).toBe(1000)
      expect(cloned.inorder()).toEqual(values)
    })

    it('stress test find', () => {
      const values = Array.from({ length: 1000 }, (_, i) => i)
      const tree = new CartesianTree({ values })
      expect(tree.find(500)).not.toBeNull()
      expect(tree.find(999)).not.toBeNull()
      expect(tree.find(1000)).toBeNull()
    })

    it('stress test max-heap', () => {
      const values = Array.from({ length: 5000 }, () => Math.floor(Math.random() * 5000))
      const tree = new CartesianTree({ values, heapProperty: 'max' })
      expect(tree.size()).toBe(5000)
      expect(tree.isValid()).toBe(true)
    })

    it('stress test lowestCommonAncestor', () => {
      const values = Array.from({ length: 1000 }, (_, i) => i)
      const tree = new CartesianTree({ values })
      const lca = tree.lowestCommonAncestor(0, 999)
      expect(lca).toBeDefined()
    })
  })

  describe('comprehensive integration', () => {
    it('all methods work together on complex input', () => {
      const values = [9, 3, 7, 1, 8, 12, 10, 20, 15, 6, 2, 11]
      const tree = new CartesianTree({ values })

      expect(tree.size()).toBe(12)
      expect(tree.isEmpty()).toBe(false)
      expect(tree.getRoot()).not.toBeNull()
      expect(tree.inorder()).toEqual(values)
      expect(tree.toArray()).toEqual(values)
      expect(tree.isValid()).toBe(true)

      const found = tree.find(8)
      expect(found).not.toBeNull()
      expect(found!.value).toBe(8)

      expect(tree.getHeight()).toBeGreaterThanOrEqual(0)

      const range = tree.rangeQuery(3, 7)
      expect(range).toEqual(values.slice(3, 8))

      const cloned = tree.clone()
      expect(cloned.inorder()).toEqual(values)

      expect(tree.preorder().length).toBe(12)
      expect(tree.postorder().length).toBe(12)
      expect(tree.levelOrder().length).toBe(12)

      const lca = tree.lowestCommonAncestor(2, 5)
      expect(lca).toBeDefined()
    })

    it('Wikipedia example: [9, 3, 7, 1, 8, 12, 10, 20, 15, 18, 5]', () => {
      const values = [9, 3, 7, 1, 8, 12, 10, 20, 15, 18, 5]
      const tree = new CartesianTree({ values })
      expect(tree.getRoot()?.value).toBe(1)
      expect(tree.inorder()).toEqual(values)
      expect(tree.isValid()).toBe(true)
    })

    it('maintains BST property by index (in-order traversal)', () => {
      const values = [4, 2, 6, 1, 3, 5, 7]
      const tree = new CartesianTree({ values })
      const indices: number[] = []
      const collectIndices = (node: CartesianNode<number> | null): void => {
        if (node === null) return
        collectIndices(node.left)
        indices.push(node.index)
        collectIndices(node.right)
      }
      collectIndices(tree.getRoot())
      expect(indices).toEqual([0, 1, 2, 3, 4, 5, 6])
    })
  })
})
