import { describe, it, expect, beforeEach } from 'vitest'
import { AVLTree } from '../../src/core/avl-tree/avl-tree.js'
import { DEFAULT_AVL_TREE_OPTIONS } from '../../src/core/avl-tree/types.js'
import type { AVLNode, AVLTreeOptions, AVLTreeStats } from '../../src/core/avl-tree/types.js'

describe('AVLTree', () => {
  let tree: AVLTree<number>

  beforeEach(() => {
    tree = new AVLTree<number>()
  })

  describe('constructor', () => {
    it('should create an empty tree with default options', () => {
      const t = new AVLTree<number>()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should accept custom options', () => {
      const t = new AVLTree<number>({ allowDuplicates: true })
      t.insert(1, 10)
      t.insert(1, 20)
      expect(t.size()).toBe(2)
    })

    it('should use default allowDuplicates of false', () => {
      tree.insert(5, 100)
      tree.insert(5, 200)
      expect(tree.size()).toBe(1)
      expect(tree.search(5)).toBe(200)
    })

    it('should accept partial options', () => {
      const t = new AVLTree<number>({})
      t.insert(1, 1)
      expect(t.size()).toBe(1)
    })
  })

  describe('insert', () => {
    it('should insert a single node', () => {
      tree.insert(10, 100)
      expect(tree.size()).toBe(1)
      expect(tree.search(10)).toBe(100)
    })

    it('should insert multiple nodes in order', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(30, 300)
      expect(tree.size()).toBe(3)
    })

    it('should insert multiple nodes in reverse order', () => {
      tree.insert(30, 300)
      tree.insert(20, 200)
      tree.insert(10, 100)
      expect(tree.size()).toBe(3)
    })

    it('should update value for duplicate key when allowDuplicates is false', () => {
      tree.insert(10, 100)
      tree.insert(10, 999)
      expect(tree.size()).toBe(1)
      expect(tree.search(10)).toBe(999)
    })

    it('should allow duplicate keys when allowDuplicates is true', () => {
      const t = new AVLTree<number>({ allowDuplicates: true })
      t.insert(10, 100)
      t.insert(10, 200)
      expect(t.size()).toBe(2)
    })

    it('should handle negative keys', () => {
      tree.insert(-5, 50)
      tree.insert(-10, 100)
      tree.insert(5, 500)
      expect(tree.size()).toBe(3)
      expect(tree.search(-5)).toBe(50)
    })

    it('should handle zero key', () => {
      tree.insert(0, 42)
      expect(tree.search(0)).toBe(42)
    })

    it('should return void', () => {
      const result = tree.insert(1, 1)
      expect(result).toBeUndefined()
    })

    it('should maintain balance after sequential insertions', () => {
      for (let i = 0; i < 20; i++) {
        tree.insert(i, i)
      }
      expect(tree.getStats().isBalanced).toBe(true)
    })

    it('should maintain balance after reverse sequential insertions', () => {
      for (let i = 20; i >= 0; i--) {
        tree.insert(i, i)
      }
      expect(tree.getStats().isBalanced).toBe(true)
    })
  })

  describe('search', () => {
    it('should find an existing key', () => {
      tree.insert(10, 100)
      expect(tree.search(10)).toBe(100)
    })

    it('should return undefined for non-existent key', () => {
      expect(tree.search(999)).toBeUndefined()
    })

    it('should return undefined when searching empty tree', () => {
      expect(tree.search(1)).toBeUndefined()
    })

    it('should find nodes after many insertions', () => {
      for (let i = 0; i < 50; i++) {
        tree.insert(i, i * 10)
      }
      expect(tree.search(25)).toBe(250)
      expect(tree.search(49)).toBe(490)
      expect(tree.search(0)).toBe(0)
    })

    it('should find updated value after duplicate insert', () => {
      tree.insert(5, 50)
      tree.insert(5, 99)
      expect(tree.search(5)).toBe(99)
    })
  })

  describe('has', () => {
    it('should return true for existing key', () => {
      tree.insert(10, 100)
      expect(tree.has(10)).toBe(true)
    })

    it('should return false for non-existent key', () => {
      expect(tree.has(999)).toBe(false)
    })

    it('should return false on empty tree', () => {
      expect(tree.has(1)).toBe(false)
    })

    it('should return false after deletion', () => {
      tree.insert(10, 100)
      tree.delete(10)
      expect(tree.has(10)).toBe(false)
    })

    it('should return true for negative keys', () => {
      tree.insert(-5, 50)
      expect(tree.has(-5)).toBe(true)
    })
  })

  describe('delete', () => {
    it('should delete an existing key', () => {
      tree.insert(10, 100)
      expect(tree.delete(10)).toBe(true)
      expect(tree.size()).toBe(0)
      expect(tree.search(10)).toBeUndefined()
    })

    it('should return false for non-existent key', () => {
      expect(tree.delete(999)).toBe(false)
    })

    it('should return false when deleting from empty tree', () => {
      expect(tree.delete(1)).toBe(false)
    })

    it('should delete leaf node', () => {
      tree.insert(10, 100)
      tree.insert(5, 50)
      expect(tree.delete(5)).toBe(true)
      expect(tree.size()).toBe(1)
    })

    it('should delete node with one child', () => {
      tree.insert(10, 100)
      tree.insert(5, 50)
      tree.insert(3, 30)
      expect(tree.delete(5)).toBe(true)
      expect(tree.size()).toBe(2)
    })

    it('should delete node with two children', () => {
      tree.insert(10, 100)
      tree.insert(5, 50)
      tree.insert(15, 150)
      expect(tree.delete(10)).toBe(true)
      expect(tree.size()).toBe(2)
    })

    it('should delete root when it is the only node', () => {
      tree.insert(10, 100)
      expect(tree.delete(10)).toBe(true)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should maintain correct size after multiple deletions', () => {
      for (let i = 0; i < 10; i++) {
        tree.insert(i, i)
      }
      tree.delete(5)
      tree.delete(3)
      tree.delete(7)
      expect(tree.size()).toBe(7)
    })

    it('should maintain balance after deletions', () => {
      for (let i = 0; i < 30; i++) {
        tree.insert(i, i)
      }
      for (let i = 5; i < 25; i++) {
        tree.delete(i)
      }
      expect(tree.getStats().isBalanced).toBe(true)
    })

    it('should handle deleting and re-inserting', () => {
      tree.insert(10, 100)
      tree.delete(10)
      tree.insert(10, 200)
      expect(tree.search(10)).toBe(200)
      expect(tree.size()).toBe(1)
    })
  })

  describe('getMin', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.getMin()).toBeUndefined()
    })

    it('should return value of single node', () => {
      tree.insert(10, 100)
      expect(tree.getMin()).toBe(100)
    })

    it('should return minimum value after many insertions', () => {
      tree.insert(50, 500)
      tree.insert(10, 100)
      tree.insert(30, 300)
      expect(tree.getMin()).toBe(100)
    })

    it('should update min after deletion', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      tree.delete(5)
      expect(tree.getMin()).toBe(100)
    })

    it('should handle negative keys', () => {
      tree.insert(5, 50)
      tree.insert(-10, -100)
      expect(tree.getMin()).toBe(-100)
    })
  })

  describe('getMax', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.getMax()).toBeUndefined()
    })

    it('should return value of single node', () => {
      tree.insert(10, 100)
      expect(tree.getMax()).toBe(100)
    })

    it('should return maximum value after many insertions', () => {
      tree.insert(10, 100)
      tree.insert(50, 500)
      tree.insert(30, 300)
      expect(tree.getMax()).toBe(500)
    })

    it('should update max after deletion', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      tree.delete(20)
      expect(tree.getMax()).toBe(100)
    })

    it('should handle negative keys', () => {
      tree.insert(-5, -50)
      tree.insert(-10, -100)
      expect(tree.getMax()).toBe(-50)
    })
  })

  describe('inOrder', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.inOrder()).toEqual([])
    })

    it('should return single element for single node', () => {
      tree.insert(10, 100)
      expect(tree.inOrder()).toEqual([[10, 100]])
    })

    it('should return sorted order', () => {
      tree.insert(30, 300)
      tree.insert(10, 100)
      tree.insert(20, 200)
      expect(tree.inOrder()).toEqual([[10, 100], [20, 200], [30, 300]])
    })

    it('should return correct order after deletions', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(30, 300)
      tree.delete(20)
      expect(tree.inOrder()).toEqual([[10, 100], [30, 300]])
    })

    it('should handle many elements', () => {
      const keys = [5, 3, 7, 1, 4, 6, 8]
      for (const k of keys) tree.insert(k, k * 10)
      const result = tree.inOrder()
      expect(result.map(([k]) => k)).toEqual([1, 3, 4, 5, 6, 7, 8])
    })
  })

  describe('preOrder', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.preOrder()).toEqual([])
    })

    it('should return single element for single node', () => {
      tree.insert(10, 100)
      expect(tree.preOrder()).toEqual([[10, 100]])
    })

    it('should return root first', () => {
      tree.insert(20, 200)
      tree.insert(10, 100)
      tree.insert(30, 300)
      const result = tree.preOrder()
      expect(result[0]![0]).toBe(20)
      expect(result.length).toBe(3)
    })

    it('should visit all nodes', () => {
      tree.insert(10, 100)
      tree.insert(5, 50)
      tree.insert(15, 150)
      expect(tree.preOrder().length).toBe(3)
    })
  })

  describe('postOrder', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.postOrder()).toEqual([])
    })

    it('should return single element for single node', () => {
      tree.insert(10, 100)
      expect(tree.postOrder()).toEqual([[10, 100]])
    })

    it('should visit children before root', () => {
      tree.insert(20, 200)
      tree.insert(10, 100)
      tree.insert(30, 300)
      const result = tree.postOrder()
      expect(result[result.length - 1]![0]).toBe(20)
      expect(result.length).toBe(3)
    })

    it('should visit all nodes', () => {
      tree.insert(10, 100)
      tree.insert(5, 50)
      tree.insert(15, 150)
      expect(tree.postOrder().length).toBe(3)
    })
  })

  describe('range', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.range(0, 10)).toEqual([])
    })

    it('should return matching entries', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(30, 300)
      expect(tree.range(15, 25)).toEqual([[20, 200]])
    })

    it('should return all entries in range', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(30, 300)
      const result = tree.range(10, 30)
      expect(result).toEqual([[10, 100], [20, 200], [30, 300]])
    })

    it('should return empty when no keys in range', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      expect(tree.range(30, 40)).toEqual([])
    })

    it('should handle single key range', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(30, 300)
      expect(tree.range(20, 20)).toEqual([[20, 200]])
    })

    it('should handle inverted range', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      expect(tree.range(30, 5)).toEqual([])
    })

    it('should return boundary elements', () => {
      for (let i = 0; i <= 10; i++) tree.insert(i, i)
      const result = tree.range(3, 7)
      expect(result.map(([k]) => k)).toEqual([3, 4, 5, 6, 7])
    })
  })

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      expect(tree.size()).toBe(0)
    })

    it('should return correct size after insertions', () => {
      tree.insert(10, 100)
      expect(tree.size()).toBe(1)
      tree.insert(20, 200)
      expect(tree.size()).toBe(2)
    })

    it('should not increase on duplicate insert', () => {
      tree.insert(10, 100)
      tree.insert(10, 200)
      expect(tree.size()).toBe(1)
    })

    it('should decrease after deletion', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.delete(10)
      expect(tree.size()).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new tree', () => {
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return false after insertion', () => {
      tree.insert(1, 1)
      expect(tree.isEmpty()).toBe(false)
    })

    it('should return true after clearing', () => {
      tree.insert(1, 1)
      tree.clear()
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return true after deleting all nodes', () => {
      tree.insert(1, 1)
      tree.delete(1)
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('getHeight', () => {
    it('should return 0 for empty tree', () => {
      expect(tree.getHeight()).toBe(0)
    })

    it('should return 1 for single node', () => {
      tree.insert(1, 1)
      expect(tree.getHeight()).toBe(1)
    })

    it('should return balanced height', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      expect(tree.getHeight()).toBe(2)
    })

    it('should maintain O(log n) height', () => {
      for (let i = 0; i < 1000; i++) {
        tree.insert(i, i)
      }
      const h = tree.getHeight()
      expect(h).toBeLessThan(20)
    })
  })

  describe('clear', () => {
    it('should clear all nodes', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.clear()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should handle clearing empty tree', () => {
      tree.clear()
      expect(tree.size()).toBe(0)
    })

    it('should allow insertions after clear', () => {
      tree.insert(10, 100)
      tree.clear()
      tree.insert(20, 200)
      expect(tree.size()).toBe(1)
      expect(tree.search(20)).toBe(200)
    })

    it('should return void', () => {
      expect(tree.clear()).toBeUndefined()
    })
  })

  describe('getStats', () => {
    it('should return empty stats for empty tree', () => {
      const stats = tree.getStats()
      expect(stats.nodeCount).toBe(0)
      expect(stats.height).toBe(0)
      expect(stats.isBalanced).toBe(true)
      expect(stats.minKey).toBeNull()
      expect(stats.maxKey).toBeNull()
    })

    it('should return correct stats for single node', () => {
      tree.insert(10, 100)
      const stats = tree.getStats()
      expect(stats.nodeCount).toBe(1)
      expect(stats.height).toBe(1)
      expect(stats.isBalanced).toBe(true)
      expect(stats.minKey).toBe(10)
      expect(stats.maxKey).toBe(10)
    })

    it('should return correct stats after multiple insertions', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      const stats = tree.getStats()
      expect(stats.nodeCount).toBe(3)
      expect(stats.isBalanced).toBe(true)
      expect(stats.minKey).toBe(5)
      expect(stats.maxKey).toBe(20)
    })

    it('should update stats after deletion', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      tree.delete(5)
      const stats = tree.getStats()
      expect(stats.nodeCount).toBe(2)
      expect(stats.minKey).toBe(10)
      expect(stats.maxKey).toBe(20)
    })

    it('should always report balanced for a valid AVL tree', () => {
      for (let i = 0; i < 100; i++) {
        tree.insert(i, i)
      }
      expect(tree.getStats().isBalanced).toBe(true)
    })

    it('should report correct minKey and maxKey', () => {
      tree.insert(50, 500)
      tree.insert(10, 100)
      tree.insert(90, 900)
      const stats = tree.getStats()
      expect(stats.minKey).toBe(10)
      expect(stats.maxKey).toBe(90)
    })
  })

  describe('self-balancing rotations', () => {
    it('should perform right rotation (LL case)', () => {
      tree.insert(30, 300)
      tree.insert(20, 200)
      tree.insert(10, 100)
      expect(tree.getStats().isBalanced).toBe(true)
      expect(tree.inOrder().map(([k]) => k)).toEqual([10, 20, 30])
    })

    it('should perform left rotation (RR case)', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(30, 300)
      expect(tree.getStats().isBalanced).toBe(true)
      expect(tree.inOrder().map(([k]) => k)).toEqual([10, 20, 30])
    })

    it('should perform left-right rotation (LR case)', () => {
      tree.insert(30, 300)
      tree.insert(10, 100)
      tree.insert(20, 200)
      expect(tree.getStats().isBalanced).toBe(true)
      expect(tree.inOrder().map(([k]) => k)).toEqual([10, 20, 30])
    })

    it('should perform right-left rotation (RL case)', () => {
      tree.insert(10, 100)
      tree.insert(30, 300)
      tree.insert(20, 200)
      expect(tree.getStats().isBalanced).toBe(true)
      expect(tree.inOrder().map(([k]) => k)).toEqual([10, 20, 30])
    })

    it('should balance after complex insertions', () => {
      const keys = [41, 20, 65, 11, 29, 50, 26]
      for (const k of keys) tree.insert(k, k)
      expect(tree.getStats().isBalanced).toBe(true)
    })

    it('should balance after complex deletions', () => {
      for (let i = 1; i <= 7; i++) tree.insert(i, i)
      tree.delete(1)
      tree.delete(3)
      tree.delete(5)
      expect(tree.getStats().isBalanced).toBe(true)
    })
  })

  describe('string values', () => {
    it('should store string values', () => {
      const t = new AVLTree<string>()
      t.insert(1, 'hello')
      t.insert(2, 'world')
      expect(t.search(1)).toBe('hello')
      expect(t.search(2)).toBe('world')
    })

    it('should update string values', () => {
      const t = new AVLTree<string>()
      t.insert(1, 'old')
      t.insert(1, 'new')
      expect(t.search(1)).toBe('new')
    })
  })

  describe('object values', () => {
    it('should store object values', () => {
      const t = new AVLTree<{ name: string }>()
      t.insert(1, { name: 'a' })
      t.insert(2, { name: 'b' })
      expect(t.search(1)!.name).toBe('a')
      expect(t.search(2)!.name).toBe('b')
    })

    it('should store null values', () => {
      const t = new AVLTree<null>()
      t.insert(1, null)
      expect(t.search(1)).toBeNull()
      expect(t.has(1)).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle large keys', () => {
      tree.insert(Number.MAX_SAFE_INTEGER, 1)
      tree.insert(Number.MIN_SAFE_INTEGER, 2)
      expect(tree.search(Number.MAX_SAFE_INTEGER)).toBe(1)
      expect(tree.search(Number.MIN_SAFE_INTEGER)).toBe(2)
    })

    it('should handle floating point keys', () => {
      tree.insert(1.5, 15)
      tree.insert(2.5, 25)
      expect(tree.search(1.5)).toBe(15)
    })

    it('should handle many sequential deletions', () => {
      for (let i = 0; i < 50; i++) tree.insert(i, i)
      for (let i = 0; i < 50; i++) tree.delete(i)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should handle alternating insertions and deletions', () => {
      for (let i = 0; i < 20; i++) {
        tree.insert(i, i)
        if (i > 5) tree.delete(i - 5)
      }
      expect(tree.getStats().isBalanced).toBe(true)
    })
  })

  describe('large tree', () => {
    it('should handle 1000 insertions', () => {
      for (let i = 0; i < 1000; i++) tree.insert(i, i)
      expect(tree.size()).toBe(1000)
    })

    it('should handle 1000 mixed operations', () => {
      for (let i = 0; i < 500; i++) tree.insert(i, i)
      for (let i = 0; i < 250; i++) tree.delete(i)
      expect(tree.size()).toBe(250)
      expect(tree.getStats().isBalanced).toBe(true)
    })

    it('should find all elements in large tree', () => {
      for (let i = 0; i < 500; i++) tree.insert(i, i * 2)
      for (let i = 0; i < 500; i++) {
        expect(tree.search(i)).toBe(i * 2)
      }
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_AVL_TREE_OPTIONS', () => {
      expect(DEFAULT_AVL_TREE_OPTIONS.allowDuplicates).toBe(false)
    })

    it('should support AVLTreeOptions interface', () => {
      const opts: AVLTreeOptions = { allowDuplicates: true }
      expect(opts.allowDuplicates).toBe(true)
    })

    it('should support AVLNode interface', () => {
      const node: AVLNode<string> = { key: 1, value: 'test', left: null, right: null, height: 1 }
      expect(node.key).toBe(1)
      expect(node.value).toBe('test')
    })

    it('should support AVLTreeStats interface', () => {
      const stats: AVLTreeStats = { nodeCount: 0, height: 0, isBalanced: true, minKey: null, maxKey: null }
      expect(stats.nodeCount).toBe(0)
      expect(stats.isBalanced).toBe(true)
    })
  })
})
