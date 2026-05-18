import { CartesianTree } from '../src/core/cartesian-tree/cartesian-tree.js'
import type { CartesianNode, CartesianTreeOptions } from '../src/core/cartesian-tree/types.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('CartesianTree', () => {
  describe('constructor', () => {
    it('creates an empty tree from empty values array', () => {
      const tree = new CartesianTree({ values: [] })
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.getRoot()).toBeNull()
    })

    it('creates a tree with a single element', () => {
      const tree = new CartesianTree({ values: [42] })
      expect(tree.size()).toBe(1)
      expect(tree.isEmpty()).toBe(false)
      const root = tree.getRoot()
      expect(root).not.toBeNull()
      expect(root!.value).toBe(42)
      expect(root!.index).toBe(0)
      expect(root!.left).toBeNull()
      expect(root!.right).toBeNull()
      expect(root!.parent).toBeNull()
    })

    it('creates a tree with multiple elements using default comparator', () => {
      const tree = new CartesianTree({ values: [3, 1, 4, 1, 5] })
      expect(tree.size()).toBe(5)
      expect(tree.isEmpty()).toBe(false)
      expect(tree.getRoot()).not.toBeNull()
    })

    it('uses default min heap property', () => {
      // With min heap, root should be the minimum value
      const tree = new CartesianTree({ values: [5, 3, 1, 4, 2] })
      const root = tree.getRoot()
      expect(root!.value).toBe(1)
    })

    it('creates a max-heap cartesian tree', () => {
      const tree = new CartesianTree({ values: [1, 3, 5, 2, 4], heapProperty: 'max' })
      const root = tree.getRoot()
      expect(root!.value).toBe(5)
    })

    it('accepts a custom comparator', () => {
      const descending = (a: number, b: number) => b - a
      const tree = new CartesianTree<number>({ values: [5, 3, 1, 4, 2], comparator: descending })
      // With descending comparator and min heap, "smallest" by comparator = largest number
      const root = tree.getRoot()
      expect(root!.value).toBe(5)
    })

    it('does not mutate the input values array', () => {
      const values = [3, 1, 4, 1, 5]
      const copy = [...values]
      new CartesianTree({ values })
      expect(values).toEqual(copy)
    })
  })

  // ─── Static factory ─────────────────────────────────────────────────────

  describe('static buildFromInorder', () => {
    it('creates a tree from values array', () => {
      const tree = CartesianTree.buildFromInorder([3, 1, 4])
      expect(tree.size()).toBe(3)
      expect(tree.inorder()).toEqual([3, 1, 4])
    })

    it('creates an empty tree from empty array', () => {
      const tree = CartesianTree.buildFromInorder([])
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('creates a single-element tree', () => {
      const tree = CartesianTree.buildFromInorder([99])
      expect(tree.size()).toBe(1)
      expect(tree.getRoot()!.value).toBe(99)
    })
  })

  // ─── In-order traversal ─────────────────────────────────────────────────

  describe('inorder', () => {
    it('returns empty array for empty tree', () => {
      const tree = new CartesianTree({ values: [] })
      expect(tree.inorder()).toEqual([])
    })

    it('returns single value for single-element tree', () => {
      const tree = new CartesianTree({ values: [10] })
      expect(tree.inorder()).toEqual([10])
    })

    it('preserves original array order (core cartesian tree invariant)', () => {
      const values = [5, 3, 1, 4, 2]
      const tree = new CartesianTree({ values })
      expect(tree.inorder()).toEqual(values)
    })

    it('preserves order for sorted ascending input', () => {
      const values = [1, 2, 3, 4, 5]
      const tree = new CartesianTree({ values })
      expect(tree.inorder()).toEqual(values)
    })

    it('preserves order for sorted descending input', () => {
      const values = [5, 4, 3, 2, 1]
      const tree = new CartesianTree({ values })
      expect(tree.inorder()).toEqual(values)
    })

    it('preserves order for max-heap tree', () => {
      const values = [3, 7, 2, 5, 1]
      const tree = new CartesianTree({ values, heapProperty: 'max' })
      expect(tree.inorder()).toEqual(values)
    })
  })

  // ─── Pre-order traversal ────────────────────────────────────────────────

  describe('preorder', () => {
    it('returns empty array for empty tree', () => {
      const tree = new CartesianTree({ values: [] })
      expect(tree.preorder()).toEqual([])
    })

    it('returns single value for single-element tree', () => {
      const tree = new CartesianTree({ values: [10] })
      expect(tree.preorder()).toEqual([10])
    })

    it('root is first element in preorder', () => {
      const tree = new CartesianTree({ values: [5, 3, 1, 4, 2] })
      const pre = tree.preorder()
      // With min heap, root is 1 (minimum)
      expect(pre[0]).toBe(1)
    })

    it('returns all elements', () => {
      const values = [3, 1, 4, 1, 5, 9, 2, 6]
      const tree = new CartesianTree({ values })
      const pre = tree.preorder()
      expect(pre.length).toBe(values.length)
      // Preorder should contain all values in some order
      const sortedPre = [...pre].sort((a, b) => a - b)
      const sortedVals = [...values].sort((a, b) => a - b)
      expect(sortedPre).toEqual(sortedVals)
    })
  })

  // ─── Post-order traversal ───────────────────────────────────────────────

  describe('postorder', () => {
    it('returns empty array for empty tree', () => {
      const tree = new CartesianTree({ values: [] })
      expect(tree.postorder()).toEqual([])
    })

    it('returns single value for single-element tree', () => {
      const tree = new CartesianTree({ values: [10] })
      expect(tree.postorder()).toEqual([10])
    })

    it('returns all elements', () => {
      const values = [3, 1, 4, 1, 5]
      const tree = new CartesianTree({ values })
      const post = tree.postorder()
      expect(post.length).toBe(values.length)
      const sortedPost = [...post].sort((a, b) => a - b)
      const sortedVals = [...values].sort((a, b) => a - b)
      expect(sortedPost).toEqual(sortedVals)
    })
  })

  // ─── Level-order traversal ──────────────────────────────────────────────

  describe('levelOrder', () => {
    it('returns empty array for empty tree', () => {
      const tree = new CartesianTree({ values: [] })
      expect(tree.levelOrder()).toEqual([])
    })

    it('returns single value for single-element tree', () => {
      const tree = new CartesianTree({ values: [10] })
      expect(tree.levelOrder()).toEqual([10])
    })

    it('root is first element in level order', () => {
      const tree = new CartesianTree({ values: [5, 3, 1, 4, 2] })
      const level = tree.levelOrder()
      expect(level[0]).toBe(1) // min heap root
    })

    it('returns all elements', () => {
      const values = [3, 1, 4, 1, 5]
      const tree = new CartesianTree({ values })
      const level = tree.levelOrder()
      expect(level.length).toBe(values.length)
    })

    it('level order starts with root for max-heap', () => {
      const tree = new CartesianTree({ values: [1, 3, 5, 2, 4], heapProperty: 'max' })
      const level = tree.levelOrder()
      expect(level[0]).toBe(5) // max heap root
    })
  })

  // ─── toArray ────────────────────────────────────────────────────────────

  describe('toArray', () => {
    it('returns empty array for empty tree', () => {
      const tree = new CartesianTree({ values: [] })
      expect(tree.toArray()).toEqual([])
    })

    it('returns values in in-order (original order)', () => {
      const values = [3, 1, 4, 1, 5, 9]
      const tree = new CartesianTree({ values })
      expect(tree.toArray()).toEqual(values)
    })
  })

  // ─── find ───────────────────────────────────────────────────────────────

  describe('find', () => {
    it('returns null for empty tree', () => {
      const tree = new CartesianTree({ values: [] })
      expect(tree.find(1)).toBeNull()
    })

    it('finds the root in single-element tree', () => {
      const tree = new CartesianTree({ values: [42] })
      const node = tree.find(42)
      expect(node).not.toBeNull()
      expect(node!.value).toBe(42)
      expect(node!.index).toBe(0)
    })

    it('finds a value that exists', () => {
      const tree = new CartesianTree({ values: [5, 3, 1, 4, 2] })
      const node = tree.find(3)
      expect(node).not.toBeNull()
      expect(node!.value).toBe(3)
    })

    it('returns null for value that does not exist', () => {
      const tree = new CartesianTree({ values: [1, 2, 3] })
      expect(tree.find(99)).toBeNull()
    })

    it('finds a node with correct index', () => {
      const tree = new CartesianTree({ values: [10, 20, 30, 40] })
      const node = tree.find(30)
      expect(node!.index).toBe(2)
    })

    it('finds duplicate values (returns first match via DFS)', () => {
      const tree = new CartesianTree({ values: [3, 1, 1, 4] })
      const node = tree.find(1)
      expect(node).not.toBeNull()
      expect(node!.value).toBe(1)
    })

    it('finds values with custom comparator', () => {
      interface Item {
        id: number
      }
      const items: Item[] = [{ id: 1 }, { id: 2 }, { id: 3 }]
      const tree = new CartesianTree<Item>({
        values: items,
        comparator: (a, b) => a.id - b.id,
      })
      const node = tree.find({ id: 2 })
      expect(node).not.toBeNull()
      expect(node!.value.id).toBe(2)
    })
  })

  // ─── size and isEmpty ───────────────────────────────────────────────────

  describe('size and isEmpty', () => {
    it('size returns 0 for empty tree', () => {
      const tree = new CartesianTree({ values: [] })
      expect(tree.size()).toBe(0)
    })

    it('isEmpty returns true for empty tree', () => {
      const tree = new CartesianTree({ values: [] })
      expect(tree.isEmpty()).toBe(true)
    })

    it('size returns correct count', () => {
      const tree = new CartesianTree({ values: [1, 2, 3, 4, 5] })
      expect(tree.size()).toBe(5)
      expect(tree.isEmpty()).toBe(false)
    })

    it('size returns 1 for single element', () => {
      const tree = new CartesianTree({ values: [42] })
      expect(tree.size()).toBe(1)
      expect(tree.isEmpty()).toBe(false)
    })
  })

  // ─── getHeight ──────────────────────────────────────────────────────────

  describe('getHeight', () => {
    it('returns -1 for empty tree', () => {
      const tree = new CartesianTree({ values: [] })
      expect(tree.getHeight()).toBe(-1)
    })

    it('returns 0 for single element tree', () => {
      const tree = new CartesianTree({ values: [1] })
      expect(tree.getHeight()).toBe(0)
    })

    it('returns a non-negative height for multi-element tree', () => {
      const tree = new CartesianTree({ values: [3, 1, 4, 1, 5] })
      expect(tree.getHeight()).toBeGreaterThanOrEqual(0)
    })

    it('sorted ascending input creates a right-skewed tree', () => {
      // [1,2,3,4,5] with min heap: each next element is greater, so chain right
      const tree = new CartesianTree({ values: [1, 2, 3, 4, 5] })
      // Height should be 4 (chain of 5 nodes)
      expect(tree.getHeight()).toBe(4)
    })

    it('sorted descending input creates a left-skewed tree', () => {
      // [5,4,3,2,1] with min heap: each next element is smaller, becomes new root
      const tree = new CartesianTree({ values: [5, 4, 3, 2, 1] })
      // Height should be 4 (chain of 5 nodes)
      expect(tree.getHeight()).toBe(4)
    })

    it('min element in middle creates a shorter tree', () => {
      // [5, 1, 4, 3, 2] - 1 is at index 1, splits roughly in half
      const tree = new CartesianTree({ values: [5, 1, 4, 3, 2] })
      expect(tree.getHeight()).toBeLessThan(4)
    })
  })

  // ─── getRoot ────────────────────────────────────────────────────────────

  describe('getRoot', () => {
    it('returns null for empty tree', () => {
      const tree = new CartesianTree({ values: [] })
      expect(tree.getRoot()).toBeNull()
    })

    it('returns the root node with correct properties', () => {
      const tree = new CartesianTree({ values: [5, 3, 1, 4, 2] })
      const root = tree.getRoot()
      expect(root).not.toBeNull()
      expect(root!.value).toBe(1) // min element with min heap
      expect(root!.parent).toBeNull()
    })

    it('root has null parent', () => {
      const tree = new CartesianTree({ values: [1, 2, 3] })
      const root = tree.getRoot()
      expect(root!.parent).toBeNull()
    })

    it('max-heap root is the maximum value', () => {
      const tree = new CartesianTree({ values: [1, 5, 3, 2, 4], heapProperty: 'max' })
      const root = tree.getRoot()
      expect(root!.value).toBe(5)
    })
  })

  // ─── clone ──────────────────────────────────────────────────────────────

  describe('clone', () => {
    it('clones an empty tree', () => {
      const tree = new CartesianTree({ values: [] })
      const cloned = tree.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('clones a non-empty tree with same values', () => {
      const tree = new CartesianTree({ values: [3, 1, 4, 1, 5] })
      const cloned = tree.clone()
      expect(cloned.size()).toBe(tree.size())
      expect(cloned.toArray()).toEqual(tree.toArray())
    })

    it('clone is independent of original', () => {
      const tree = new CartesianTree({ values: [3, 1, 4] })
      const cloned = tree.clone()
      // They have separate root nodes
      expect(cloned.getRoot()).not.toBe(tree.getRoot())
    })

    it('preserves heap property in clone', () => {
      const tree = new CartesianTree({ values: [1, 3, 2], heapProperty: 'max' })
      const cloned = tree.clone()
      expect(cloned.getRoot()!.value).toBe(tree.getRoot()!.value)
    })

    it('preserves custom comparator in clone', () => {
      const comp = (a: number, b: number) => b - a
      const tree = new CartesianTree({ values: [1, 2, 3], comparator: comp })
      const cloned = tree.clone()
      expect(cloned.getRoot()!.value).toBe(tree.getRoot()!.value)
    })
  })

  // ─── rangeQuery ─────────────────────────────────────────────────────────

  describe('rangeQuery', () => {
    it('returns empty for empty tree', () => {
      const tree = new CartesianTree({ values: [] })
      expect(tree.rangeQuery(0, 0)).toEqual([])
    })

    it('returns single element range', () => {
      const tree = new CartesianTree({ values: [10, 20, 30] })
      expect(tree.rangeQuery(1, 1)).toEqual([20])
    })

    it('returns full range', () => {
      const values = [10, 20, 30, 40, 50]
      const tree = new CartesianTree({ values })
      expect(tree.rangeQuery(0, 4)).toEqual(values)
    })

    it('returns partial range preserving original order', () => {
      const values = [5, 3, 1, 4, 2]
      const tree = new CartesianTree({ values })
      expect(tree.rangeQuery(1, 3)).toEqual([3, 1, 4])
    })

    it('returns empty for invalid range (start > end)', () => {
      const tree = new CartesianTree({ values: [1, 2, 3] })
      expect(tree.rangeQuery(2, 1)).toEqual([])
    })

    it('returns empty for negative start', () => {
      const tree = new CartesianTree({ values: [1, 2, 3] })
      expect(tree.rangeQuery(-1, 2)).toEqual([])
    })

    it('returns empty for end beyond array', () => {
      const tree = new CartesianTree({ values: [1, 2, 3] })
      expect(tree.rangeQuery(0, 10)).toEqual([])
    })

    it('returns first element', () => {
      const tree = new CartesianTree({ values: [7, 8, 9] })
      expect(tree.rangeQuery(0, 0)).toEqual([7])
    })

    it('returns last element', () => {
      const tree = new CartesianTree({ values: [7, 8, 9] })
      expect(tree.rangeQuery(2, 2)).toEqual([9])
    })
  })

  // ─── lowestCommonAncestor ───────────────────────────────────────────────

  describe('lowestCommonAncestor', () => {
    it('returns undefined for empty tree', () => {
      const tree = new CartesianTree({ values: [] })
      expect(tree.lowestCommonAncestor(0, 1)).toBeUndefined()
    })

    it('returns root value for any two indices', () => {
      const tree = new CartesianTree({ values: [5, 1, 3, 2, 4] })
      // LCA of any two nodes must exist
      const lca = tree.lowestCommonAncestor(0, 4)
      expect(lca).not.toBeUndefined()
    })

    it('LCA of same index is the value at that index', () => {
      const tree = new CartesianTree({ values: [5, 3, 1, 4, 2] })
      expect(tree.lowestCommonAncestor(2, 2)).toBe(1)
    })

    it('returns the root for nodes in left and right subtrees', () => {
      // [5, 3, 1, 4, 2] - root is 1 (min) at index 2
      // Left subtree: [5, 3], Right subtree: [4, 2]
      const tree = new CartesianTree({ values: [5, 3, 1, 4, 2] })
      const lca = tree.lowestCommonAncestor(0, 3)
      expect(lca).toBe(1) // root
    })

    it('returns undefined for out-of-bounds indices', () => {
      const tree = new CartesianTree({ values: [1, 2, 3] })
      expect(tree.lowestCommonAncestor(0, 10)).toBeUndefined()
      expect(tree.lowestCommonAncestor(-1, 2)).toBeUndefined()
    })

    it('returns correct LCA for adjacent indices', () => {
      const tree = new CartesianTree({ values: [3, 1, 2] })
      // Root is 1 (index 1), left child is 3 (index 0), right child is 2 (index 2)
      const lca = tree.lowestCommonAncestor(0, 2)
      expect(lca).toBe(1)
    })
  })

  // ─── isValid ────────────────────────────────────────────────────────────

  describe('isValid', () => {
    it('returns true for empty tree', () => {
      const tree = new CartesianTree({ values: [] })
      expect(tree.isValid()).toBe(true)
    })

    it('returns true for single element tree', () => {
      const tree = new CartesianTree({ values: [1] })
      expect(tree.isValid()).toBe(true)
    })

    it('returns true for a valid min-heap tree', () => {
      const tree = new CartesianTree({ values: [5, 3, 1, 4, 2] })
      expect(tree.isValid()).toBe(true)
    })

    it('returns true for sorted ascending input', () => {
      const tree = new CartesianTree({ values: [1, 2, 3, 4, 5] })
      expect(tree.isValid()).toBe(true)
    })

    it('returns true for sorted descending input', () => {
      const tree = new CartesianTree({ values: [5, 4, 3, 2, 1] })
      expect(tree.isValid()).toBe(true)
    })

    it('returns true for a valid max-heap tree', () => {
      const tree = new CartesianTree({ values: [1, 3, 5, 2, 4], heapProperty: 'max' })
      expect(tree.isValid()).toBe(true)
    })

    it('returns true for tree with duplicate values', () => {
      const tree = new CartesianTree({ values: [3, 1, 1, 4, 1] })
      expect(tree.isValid()).toBe(true)
    })
  })

  // ─── Edge cases ─────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles all identical values', () => {
      const tree = new CartesianTree({ values: [5, 5, 5, 5, 5] })
      expect(tree.size()).toBe(5)
      expect(tree.inorder()).toEqual([5, 5, 5, 5, 5])
      expect(tree.isValid()).toBe(true)
      // Root is the first 5 since all are equal (cmp <= 0 means first stays parent)
      expect(tree.getRoot()!.value).toBe(5)
    })

    it('handles two elements', () => {
      const tree = new CartesianTree({ values: [3, 1] })
      expect(tree.size()).toBe(2)
      expect(tree.inorder()).toEqual([3, 1])
      // 1 is smaller, so 1 becomes root, 3 becomes left child
      expect(tree.getRoot()!.value).toBe(1)
    })

    it('handles two elements in ascending order', () => {
      const tree = new CartesianTree({ values: [1, 3] })
      expect(tree.inorder()).toEqual([1, 3])
      // 1 is min, root is 1, 3 is right child
      expect(tree.getRoot()!.value).toBe(1)
    })

    it('handles large input', () => {
      const values = Array.from({ length: 1000 }, (_, i) => Math.floor(Math.random() * 10000))
      const tree = new CartesianTree({ values })
      expect(tree.size()).toBe(1000)
      expect(tree.inorder()).toEqual(values)
      expect(tree.isValid()).toBe(true)
    })

    it('handles negative numbers', () => {
      const tree = new CartesianTree({ values: [-3, -1, -4, -1, -5] })
      expect(tree.inorder()).toEqual([-3, -1, -4, -1, -5])
      expect(tree.getRoot()!.value).toBe(-5)
      expect(tree.isValid()).toBe(true)
    })

    it('handles floating point numbers', () => {
      const tree = new CartesianTree({ values: [1.5, 2.3, 0.7, 3.1] })
      expect(tree.inorder()).toEqual([1.5, 2.3, 0.7, 3.1])
      expect(tree.getRoot()!.value).toBe(0.7)
    })

    it('handles string values', () => {
      const tree = new CartesianTree({ values: ['cherry', 'apple', 'banana'] })
      expect(tree.inorder()).toEqual(['cherry', 'apple', 'banana'])
      expect(tree.getRoot()!.value).toBe('apple')
      expect(tree.isValid()).toBe(true)
    })

    it('handles object values with custom comparator', () => {
      interface Score {
        name: string
        value: number
      }
      const scores: Score[] = [
        { name: 'a', value: 80 },
        { name: 'b', value: 95 },
        { name: 'c', value: 60 },
      ]
      const tree = new CartesianTree<Score>({
        values: scores,
        comparator: (a, b) => a.value - b.value,
      })
      expect(tree.size()).toBe(3)
      expect(tree.getRoot()!.value.name).toBe('c')
      expect(tree.inorder()).toEqual(scores)
    })

    it('node structure: parent links are correct', () => {
      const tree = new CartesianTree({ values: [5, 3, 1, 4, 2] })
      const root = tree.getRoot()
      expect(root!.parent).toBeNull()
      // Recursively check that children point back to parent
      const checkParentLinks = (node: CartesianNode<number> | null): void => {
        if (node === null) return
        if (node.left !== null) {
          expect(node.left.parent).toBe(node)
          checkParentLinks(node.left)
        }
        if (node.right !== null) {
          expect(node.right.parent).toBe(node)
          checkParentLinks(node.right)
        }
      }
      checkParentLinks(root)
    })

    it('node structure: indices are correct', () => {
      const values = [10, 20, 30, 40, 50]
      const tree = new CartesianTree({ values })
      // Verify every node has the correct index by checking inorder traversal nodes
      const collectNodes = (node: CartesianNode<number> | null): CartesianNode<number>[] => {
        if (node === null) return []
        return [...collectNodes(node.left), node, ...collectNodes(node.right)]
      }
      const nodes = collectNodes(tree.getRoot())
      for (let i = 0; i < nodes.length; i++) {
        expect(nodes[i]!.index).toBe(i)
        expect(nodes[i]!.value).toBe(values[i])
      }
    })

    it('sorted ascending creates a right chain', () => {
      const tree = new CartesianTree({ values: [1, 2, 3, 4, 5] })
      const root = tree.getRoot()
      // Root is 1, everything chains right
      expect(root!.value).toBe(1)
      expect(root!.left).toBeNull()
      expect(root!.right).not.toBeNull()
    })

    it('sorted descending creates a left chain', () => {
      const tree = new CartesianTree({ values: [5, 4, 3, 2, 1] })
      const root = tree.getRoot()
      // Root is 1 (the min), everything is to the left
      expect(root!.value).toBe(1)
      expect(root!.right).toBeNull()
      expect(root!.left).not.toBeNull()
    })

    it('max-heap with ascending input creates left chain', () => {
      const tree = new CartesianTree({ values: [1, 2, 3, 4, 5], heapProperty: 'max' })
      const root = tree.getRoot()
      // Root is 5 (max), chains to the left
      expect(root!.value).toBe(5)
      expect(root!.right).toBeNull()
      expect(root!.left).not.toBeNull()
    })

    it('max-heap with descending input creates right chain', () => {
      const tree = new CartesianTree({ values: [5, 4, 3, 2, 1], heapProperty: 'max' })
      const root = tree.getRoot()
      // Root is 5 (max), everything chains right
      expect(root!.value).toBe(5)
      expect(root!.left).toBeNull()
      expect(root!.right).not.toBeNull()
    })

    it('range query full range equals toArray', () => {
      const values = [3, 1, 4, 1, 5, 9, 2, 6]
      const tree = new CartesianTree({ values })
      expect(tree.rangeQuery(0, values.length - 1)).toEqual(tree.toArray())
    })

    it('traversals all return same length', () => {
      const values = [3, 1, 4, 1, 5]
      const tree = new CartesianTree({ values })
      const n = values.length
      expect(tree.inorder().length).toBe(n)
      expect(tree.preorder().length).toBe(n)
      expect(tree.postorder().length).toBe(n)
      expect(tree.levelOrder().length).toBe(n)
    })

    it('clone produces identical traversals', () => {
      const values = [7, 2, 8, 1, 9, 3]
      const tree = new CartesianTree({ values })
      const cloned = tree.clone()
      expect(cloned.inorder()).toEqual(tree.inorder())
      expect(cloned.preorder()).toEqual(tree.preorder())
      expect(cloned.postorder()).toEqual(tree.postorder())
      expect(cloned.levelOrder()).toEqual(tree.levelOrder())
    })
  })
})
