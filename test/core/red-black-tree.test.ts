import { describe, it, expect, beforeEach } from 'vitest'
import { RedBlackTree } from '../../src/core/red-black-tree/red-black-tree.js'
import { DEFAULT_RB_TREE_OPTIONS } from '../../src/core/red-black-tree/types.js'
import type { Color, RBNode, RBTreeOptions, RBTreeStats } from '../../src/core/red-black-tree/types.js'

describe('RedBlackTree', () => {
  let tree: RedBlackTree<number>

  beforeEach(() => {
    tree = new RedBlackTree<number>()
  })

  describe('constructor', () => {
    it('should create an empty tree with default options', () => {
      const t = new RedBlackTree<number>()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should accept custom options', () => {
      const t = new RedBlackTree<number>({ allowDuplicates: true })
      t.insert(5, 1)
      t.insert(5, 2)
      expect(t.size()).toBe(2)
    })

    it('should use default allowDuplicates of false', () => {
      tree.insert(5, 10)
      tree.insert(5, 20)
      expect(tree.size()).toBe(1)
      expect(tree.search(5)).toBe(20)
    })

    it('should accept partial options', () => {
      const t = new RedBlackTree<number>({})
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
      tree.insert(10, 200)
      expect(tree.size()).toBe(1)
      expect(tree.search(10)).toBe(200)
    })

    it('should allow duplicate keys when allowDuplicates is true', () => {
      const t = new RedBlackTree<number>({ allowDuplicates: true })
      t.insert(10, 100)
      t.insert(10, 200)
      expect(t.size()).toBe(2)
    })

    it('should insert negative keys', () => {
      tree.insert(-10, 100)
      tree.insert(-5, 200)
      tree.insert(0, 300)
      expect(tree.size()).toBe(3)
      expect(tree.search(-10)).toBe(100)
    })

    it('should insert zero as key', () => {
      tree.insert(0, 42)
      expect(tree.search(0)).toBe(42)
    })

    it('should return void', () => {
      const result = tree.insert(1, 1)
      expect(result).toBeUndefined()
    })

    it('should handle sequential insertions maintaining balance', () => {
      for (let i = 1; i <= 100; i++) {
        tree.insert(i, i * 10)
      }
      expect(tree.size()).toBe(100)
      const stats = tree.getStats()
      expect(stats.isBalanced).toBe(true)
    })

    it('should handle reverse sequential insertions maintaining balance', () => {
      for (let i = 100; i >= 1; i--) {
        tree.insert(i, i * 10)
      }
      expect(tree.size()).toBe(100)
      const stats = tree.getStats()
      expect(stats.isBalanced).toBe(true)
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

    it('should return undefined when tree is empty', () => {
      expect(tree.search(1)).toBeUndefined()
    })

    it('should find keys after multiple insertions', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      expect(tree.search(5)).toBe(50)
      expect(tree.search(10)).toBe(100)
      expect(tree.search(20)).toBe(200)
    })

    it('should find keys after deletions', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      tree.delete(10)
      expect(tree.search(10)).toBeUndefined()
      expect(tree.search(20)).toBe(200)
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

    it('should return false for empty tree', () => {
      expect(tree.has(1)).toBe(false)
    })

    it('should return false after key is deleted', () => {
      tree.insert(10, 100)
      tree.delete(10)
      expect(tree.has(10)).toBe(false)
    })

    it('should find keys in a large tree', () => {
      for (let i = 0; i < 50; i++) {
        tree.insert(i, i)
      }
      expect(tree.has(0)).toBe(true)
      expect(tree.has(49)).toBe(true)
      expect(tree.has(25)).toBe(true)
      expect(tree.has(50)).toBe(false)
    })
  })

  describe('delete', () => {
    it('should delete an existing key', () => {
      tree.insert(10, 100)
      expect(tree.delete(10)).toBe(true)
      expect(tree.size()).toBe(0)
    })

    it('should return false for non-existent key', () => {
      expect(tree.delete(999)).toBe(false)
    })

    it('should return false for empty tree', () => {
      expect(tree.delete(1)).toBe(false)
    })

    it('should maintain tree after deletion', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      tree.delete(10)
      expect(tree.size()).toBe(2)
      expect(tree.has(5)).toBe(true)
      expect(tree.has(20)).toBe(true)
    })

    it('should handle deleting root node', () => {
      tree.insert(10, 100)
      tree.delete(10)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should handle deleting leaf node', () => {
      tree.insert(10, 100)
      tree.insert(5, 50)
      tree.insert(15, 150)
      tree.delete(5)
      expect(tree.size()).toBe(2)
      expect(tree.has(5)).toBe(false)
    })

    it('should handle deleting node with one child', () => {
      tree.insert(10, 100)
      tree.insert(5, 50)
      tree.insert(15, 150)
      tree.insert(3, 30)
      tree.delete(5)
      expect(tree.size()).toBe(3)
      expect(tree.has(3)).toBe(true)
    })

    it('should handle deleting node with two children', () => {
      tree.insert(10, 100)
      tree.insert(5, 50)
      tree.insert(15, 150)
      tree.insert(3, 30)
      tree.insert(7, 70)
      tree.delete(5)
      expect(tree.size()).toBe(4)
      expect(tree.has(3)).toBe(true)
      expect(tree.has(7)).toBe(true)
    })

    it('should handle deleting all nodes', () => {
      tree.insert(10, 100)
      tree.insert(5, 50)
      tree.insert(15, 150)
      tree.delete(10)
      tree.delete(5)
      tree.delete(15)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should maintain balance after multiple deletions', () => {
      for (let i = 0; i < 50; i++) {
        tree.insert(i, i * 10)
      }
      for (let i = 0; i < 25; i++) {
        tree.delete(i)
      }
      expect(tree.size()).toBe(25)
      expect(tree.getStats().isBalanced).toBe(true)
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

    it('should return minimum value', () => {
      tree.insert(10, 100)
      tree.insert(5, 50)
      tree.insert(20, 200)
      expect(tree.getMin()).toBe(50)
    })

    it('should update after deletion of minimum', () => {
      tree.insert(10, 100)
      tree.insert(5, 50)
      tree.insert(20, 200)
      tree.delete(5)
      expect(tree.getMin()).toBe(100)
    })

    it('should work with negative keys', () => {
      tree.insert(-10, 100)
      tree.insert(0, 200)
      tree.insert(10, 300)
      expect(tree.getMin()).toBe(100)
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

    it('should return maximum value', () => {
      tree.insert(10, 100)
      tree.insert(5, 50)
      tree.insert(20, 200)
      expect(tree.getMax()).toBe(200)
    })

    it('should update after deletion of maximum', () => {
      tree.insert(10, 100)
      tree.insert(5, 50)
      tree.insert(20, 200)
      tree.delete(20)
      expect(tree.getMax()).toBe(100)
    })
  })

  describe('inOrder', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.inOrder()).toEqual([])
    })

    it('should return single element', () => {
      tree.insert(10, 100)
      expect(tree.inOrder()).toEqual([[10, 100]])
    })

    it('should return sorted order', () => {
      tree.insert(20, 200)
      tree.insert(10, 100)
      tree.insert(30, 300)
      const result = tree.inOrder()
      const keys = result.map(([k]) => k)
      expect(keys).toEqual([10, 20, 30])
    })

    it('should handle complex insertions', () => {
      tree.insert(15, 150)
      tree.insert(6, 60)
      tree.insert(18, 180)
      tree.insert(3, 30)
      tree.insert(7, 70)
      tree.insert(17, 170)
      tree.insert(20, 200)
      tree.insert(2, 20)
      tree.insert(4, 40)
      const keys = tree.inOrder().map(([k]) => k)
      expect(keys).toEqual([2, 3, 4, 6, 7, 15, 17, 18, 20])
    })
  })

  describe('preOrder', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.preOrder()).toEqual([])
    })

    it('should return single element', () => {
      tree.insert(10, 100)
      expect(tree.preOrder()).toEqual([[10, 100]])
    })

    it('should visit root before children', () => {
      tree.insert(10, 100)
      tree.insert(5, 50)
      tree.insert(15, 150)
      const result = tree.preOrder()
      expect(result[0]![0]).toBe(10)
    })
  })

  describe('postOrder', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.postOrder()).toEqual([])
    })

    it('should return single element', () => {
      tree.insert(10, 100)
      expect(tree.postOrder()).toEqual([[10, 100]])
    })

    it('should visit children before root', () => {
      tree.insert(10, 100)
      tree.insert(5, 50)
      tree.insert(15, 150)
      const result = tree.postOrder()
      expect(result[result.length - 1]![0]).toBe(10)
    })
  })

  describe('range', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.range(1, 10)).toEqual([])
    })

    it('should return keys within range', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(30, 300)
      tree.insert(5, 50)
      tree.insert(15, 150)
      const result = tree.range(10, 20)
      const keys = result.map(([k]) => k)
      expect(keys).toEqual([10, 15, 20])
    })

    it('should return empty for range with no matches', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      expect(tree.range(100, 200)).toEqual([])
    })

    it('should return single match', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(30, 300)
      const result = tree.range(20, 20)
      expect(result).toEqual([[20, 200]])
    })

    it('should include boundary values', () => {
      tree.insert(1, 10)
      tree.insert(5, 50)
      tree.insert(10, 100)
      const result = tree.range(1, 10)
      expect(result.length).toBe(3)
    })

    it('should return all keys when range covers entire tree', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(30, 300)
      const result = tree.range(0, 100)
      expect(result.length).toBe(3)
    })
  })

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      expect(tree.size()).toBe(0)
    })

    it('should return correct count after insertions', () => {
      tree.insert(1, 10)
      expect(tree.size()).toBe(1)
      tree.insert(2, 20)
      expect(tree.size()).toBe(2)
    })

    it('should decrease after deletion', () => {
      tree.insert(1, 10)
      tree.insert(2, 20)
      tree.delete(1)
      expect(tree.size()).toBe(1)
    })

    it('should not change for duplicate key insert without allowDuplicates', () => {
      tree.insert(1, 10)
      tree.insert(1, 20)
      expect(tree.size()).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty tree', () => {
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return false after insertion', () => {
      tree.insert(1, 10)
      expect(tree.isEmpty()).toBe(false)
    })

    it('should return true after clearing all nodes', () => {
      tree.insert(1, 10)
      tree.delete(1)
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear all nodes', () => {
      tree.insert(1, 10)
      tree.insert(2, 20)
      tree.clear()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should handle clearing empty tree', () => {
      tree.clear()
      expect(tree.size()).toBe(0)
    })

    it('should allow insertions after clear', () => {
      tree.insert(1, 10)
      tree.clear()
      tree.insert(2, 20)
      expect(tree.size()).toBe(1)
      expect(tree.has(1)).toBe(false)
      expect(tree.has(2)).toBe(true)
    })
  })

  describe('getStats', () => {
    it('should return zeros for empty tree', () => {
      const stats = tree.getStats()
      expect(stats.nodeCount).toBe(0)
      expect(stats.blackHeight).toBe(0)
      expect(stats.isBalanced).toBe(true)
      expect(stats.minKey).toBe(null)
      expect(stats.maxKey).toBe(null)
    })

    it('should return correct stats for single node', () => {
      tree.insert(10, 100)
      const stats = tree.getStats()
      expect(stats.nodeCount).toBe(1)
      expect(stats.minKey).toBe(10)
      expect(stats.maxKey).toBe(10)
    })

    it('should return correct stats after multiple insertions', () => {
      tree.insert(10, 100)
      tree.insert(5, 50)
      tree.insert(15, 150)
      const stats = tree.getStats()
      expect(stats.nodeCount).toBe(3)
      expect(stats.minKey).toBe(5)
      expect(stats.maxKey).toBe(15)
      expect(stats.isBalanced).toBe(true)
    })

    it('should report balanced for many insertions', () => {
      for (let i = 0; i < 100; i++) {
        tree.insert(i, i)
      }
      const stats = tree.getStats()
      expect(stats.nodeCount).toBe(100)
      expect(stats.isBalanced).toBe(true)
      expect(stats.minKey).toBe(0)
      expect(stats.maxKey).toBe(99)
    })

    it('should report balanced after deletions', () => {
      for (let i = 0; i < 50; i++) {
        tree.insert(i, i)
      }
      for (let i = 0; i < 25; i++) {
        tree.delete(i)
      }
      const stats = tree.getStats()
      expect(stats.isBalanced).toBe(true)
      expect(stats.nodeCount).toBe(25)
    })

    it('should have positive black height for non-empty tree', () => {
      tree.insert(10, 100)
      tree.insert(5, 50)
      tree.insert(15, 150)
      const stats = tree.getStats()
      expect(stats.blackHeight).toBeGreaterThan(0)
    })
  })

  describe('red-black properties', () => {
    it('should maintain root is always black', () => {
      for (let i = 0; i < 20; i++) {
        tree.insert(i, i)
      }
      expect(tree.getStats().isBalanced).toBe(true)
    })

    it('should maintain balance with alternating insertions', () => {
      const keys = [5, 15, 3, 12, 10, 17, 20, 1, 7, 8]
      for (const k of keys) {
        tree.insert(k, k)
      }
      expect(tree.getStats().isBalanced).toBe(true)
      expect(tree.size()).toBe(keys.length)
    })

    it('should maintain balance after deletion of root', () => {
      tree.insert(10, 100)
      tree.insert(5, 50)
      tree.insert(15, 150)
      tree.insert(3, 30)
      tree.insert(7, 70)
      tree.insert(12, 120)
      tree.insert(20, 200)
      tree.delete(10)
      expect(tree.getStats().isBalanced).toBe(true)
    })

    it('should maintain balance with sequential deletions', () => {
      for (let i = 0; i < 30; i++) {
        tree.insert(i, i)
      }
      for (let i = 0; i < 30; i += 2) {
        tree.delete(i)
      }
      expect(tree.getStats().isBalanced).toBe(true)
      expect(tree.size()).toBe(15)
    })
  })

  describe('string values', () => {
    it('should store string values', () => {
      const t = new RedBlackTree<string>()
      t.insert(1, 'hello')
      t.insert(2, 'world')
      expect(t.search(1)).toBe('hello')
      expect(t.search(2)).toBe('world')
    })

    it('should return string values from traversals', () => {
      const t = new RedBlackTree<string>()
      t.insert(2, 'b')
      t.insert(1, 'a')
      t.insert(3, 'c')
      const result = t.inOrder()
      expect(result).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
    })
  })

  describe('edge cases', () => {
    it('should handle large number of insertions', () => {
      for (let i = 0; i < 1000; i++) {
        tree.insert(i, i)
      }
      expect(tree.size()).toBe(1000)
      expect(tree.getStats().isBalanced).toBe(true)
    })

    it('should handle large range of keys', () => {
      tree.insert(-1000, 1)
      tree.insert(0, 2)
      tree.insert(1000, 3)
      expect(tree.getMin()).toBe(1)
      expect(tree.getMax()).toBe(3)
      expect(tree.search(0)).toBe(2)
    })

    it('should handle insert delete cycles', () => {
      for (let cycle = 0; cycle < 5; cycle++) {
        for (let i = 0; i < 20; i++) {
          tree.insert(i, i)
        }
        for (let i = 0; i < 20; i++) {
          tree.delete(i)
        }
        expect(tree.isEmpty()).toBe(true)
      }
    })

    it('should handle range with min > max', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      const result = tree.range(30, 5)
      expect(result).toEqual([])
    })

    it('should handle null value type', () => {
      const t = new RedBlackTree<null>()
      t.insert(1, null)
      expect(t.search(1)).toBe(null)
    })

    it('should handle object values', () => {
      const t = new RedBlackTree<{ name: string }>()
      t.insert(1, { name: 'first' })
      t.insert(2, { name: 'second' })
      expect(t.search(1)!.name).toBe('first')
      expect(t.search(2)!.name).toBe('second')
    })
  })

  describe('traversals after operations', () => {
    it('should give correct inOrder after deletion', () => {
      tree.insert(10, 100)
      tree.insert(5, 50)
      tree.insert(15, 150)
      tree.insert(3, 30)
      tree.insert(7, 70)
      tree.delete(5)
      const keys = tree.inOrder().map(([k]) => k)
      expect(keys).toEqual([3, 7, 10, 15])
    })

    it('should give correct inOrder after clear and reinsert', () => {
      tree.insert(10, 100)
      tree.clear()
      tree.insert(20, 200)
      tree.insert(10, 100)
      const keys = tree.inOrder().map(([k]) => k)
      expect(keys).toEqual([10, 20])
    })

    it('should produce correct traversal lengths', () => {
      for (let i = 0; i < 10; i++) {
        tree.insert(i, i)
      }
      expect(tree.inOrder().length).toBe(10)
      expect(tree.preOrder().length).toBe(10)
      expect(tree.postOrder().length).toBe(10)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_RB_TREE_OPTIONS', () => {
      expect(DEFAULT_RB_TREE_OPTIONS.allowDuplicates).toBe(false)
    })

    it('should support RBTreeOptions interface', () => {
      const opts: RBTreeOptions = { allowDuplicates: true }
      expect(opts.allowDuplicates).toBe(true)
    })

    it('should support Color type', () => {
      const red: Color = 'red'
      const black: Color = 'black'
      expect(red).toBe('red')
      expect(black).toBe('black')
    })

    it('should support RBNode interface', () => {
      const node: RBNode<number> = {
        key: 1,
        value: 10,
        color: 'red',
        left: null,
        right: null,
        parent: null,
      }
      expect(node.key).toBe(1)
      expect(node.value).toBe(10)
      expect(node.color).toBe('red')
    })

    it('should support RBTreeStats interface', () => {
      const stats: RBTreeStats = {
        nodeCount: 0,
        blackHeight: 0,
        isBalanced: true,
        minKey: null,
        maxKey: null,
      }
      expect(stats.nodeCount).toBe(0)
      expect(stats.isBalanced).toBe(true)
    })
  })

  describe('stress tests', () => {
    it('should handle random insertions and deletions', () => {
      const keys = Array.from({ length: 100 }, (_, i) => i)
      for (let i = keys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[keys[i], keys[j]] = [keys[j]!, keys[i]!]
      }
      for (const k of keys) {
        tree.insert(k, k)
      }
      expect(tree.size()).toBe(100)
      expect(tree.getStats().isBalanced).toBe(true)

      for (let i = 0; i < 50; i++) {
        tree.delete(keys[i]!)
      }
      expect(tree.size()).toBe(50)
      expect(tree.getStats().isBalanced).toBe(true)
    })

    it('should maintain correct inOrder after stress operations', () => {
      for (let i = 0; i < 50; i++) {
        tree.insert(i * 2, i)
      }
      for (let i = 0; i < 50; i++) {
        tree.delete(i * 2)
      }
      expect(tree.inOrder()).toEqual([])
    })

    it('should handle ascending then descending insertions', () => {
      for (let i = 0; i < 50; i++) tree.insert(i, i)
      for (let i = 99; i >= 50; i--) tree.insert(i, i)
      expect(tree.size()).toBe(100)
      expect(tree.getStats().isBalanced).toBe(true)
      const order = tree.inOrder().map(([k]) => k)
      for (let i = 0; i < 100; i++) {
        expect(order[i]).toBe(i)
      }
    })
  })

  describe('range queries with duplicates allowed', () => {
    it('should return all entries in range with duplicates', () => {
      const t = new RedBlackTree<number>({ allowDuplicates: true })
      t.insert(5, 1)
      t.insert(5, 2)
      t.insert(10, 3)
      t.insert(10, 4)
      t.insert(15, 5)
      const result = t.range(5, 10)
      expect(result.length).toBe(4)
    })
  })

  describe('delete specific cases', () => {
    it('should handle deleting the only remaining node after multiple ops', () => {
      tree.insert(10, 100)
      tree.insert(5, 50)
      tree.delete(5)
      tree.delete(10)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.size()).toBe(0)
    })

    it('should handle deleting node that is successor in deletion', () => {
      tree.insert(20, 200)
      tree.insert(10, 100)
      tree.insert(30, 300)
      tree.insert(25, 250)
      tree.insert(35, 350)
      tree.delete(20)
      expect(tree.has(10)).toBe(true)
      expect(tree.has(30)).toBe(true)
      expect(tree.getStats().isBalanced).toBe(true)
    })

    it('should handle reinserting deleted keys', () => {
      tree.insert(10, 100)
      tree.insert(5, 50)
      tree.delete(10)
      tree.insert(10, 150)
      expect(tree.search(10)).toBe(150)
      expect(tree.size()).toBe(2)
    })
  })
})
