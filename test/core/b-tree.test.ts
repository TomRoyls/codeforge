import { describe, it, expect, beforeEach } from 'vitest'
import { BTree } from '../../src/core/b-tree/b-tree.js'
import { DEFAULT_BTREE_OPTIONS } from '../../src/core/b-tree/types.js'
import type { BTreeNode, BTreeOptions, BTreeStats } from '../../src/core/b-tree/types.js'

describe('BTree', () => {
  let tree: BTree<number>

  beforeEach(() => {
    tree = new BTree<number>()
  })

  describe('constructor', () => {
    it('should create an empty tree with default options', () => {
      const t = new BTree<number>()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should accept custom order', () => {
      const t = new BTree<number>({ order: 5 })
      const stats = t.getStats()
      expect(stats.order).toBe(5)
    })

    it('should use default order of 3', () => {
      const stats = tree.getStats()
      expect(stats.order).toBe(3)
    })

    it('should throw for order less than 2', () => {
      expect(() => new BTree<number>({ order: 1 })).toThrow()
    })

    it('should accept order of 2', () => {
      const t = new BTree<number>({ order: 2 })
      expect(t.getStats().order).toBe(2)
    })

    it('should accept partial options', () => {
      const t = new BTree<number>({})
      expect(t.getStats().order).toBe(3)
    })
  })

  describe('insert', () => {
    it('should insert a single key', () => {
      tree.insert(10, 100)
      expect(tree.size()).toBe(1)
      expect(tree.search(10)).toBe(100)
    })

    it('should insert multiple keys in order', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(30, 300)
      expect(tree.size()).toBe(3)
    })

    it('should insert multiple keys in reverse order', () => {
      tree.insert(30, 300)
      tree.insert(20, 200)
      tree.insert(10, 100)
      expect(tree.size()).toBe(3)
    })

    it('should update value for duplicate key', () => {
      tree.insert(10, 100)
      tree.insert(10, 999)
      expect(tree.size()).toBe(1)
      expect(tree.search(10)).toBe(999)
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

    it('should cause node splits when order exceeded', () => {
      const t = new BTree<number>({ order: 2 })
      for (let i = 0; i < 10; i++) {
        t.insert(i, i * 10)
      }
      expect(t.size()).toBe(10)
      expect(t.getHeight()).toBeGreaterThan(1)
    })

    it('should maintain sorted order after sequential insertions', () => {
      for (let i = 0; i < 20; i++) {
        tree.insert(i, i)
      }
      const result = tree.inOrder()
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i]![0]).toBeLessThan(result[i + 1]![0])
      }
    })

    it('should handle large number of insertions', () => {
      for (let i = 0; i < 100; i++) {
        tree.insert(i, i)
      }
      expect(tree.size()).toBe(100)
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

    it('should find keys after many insertions', () => {
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

    it('should find keys in tree with higher order', () => {
      const t = new BTree<number>({ order: 5 })
      for (let i = 0; i < 50; i++) {
        t.insert(i, i)
      }
      expect(t.search(25)).toBe(25)
      expect(t.search(0)).toBe(0)
      expect(t.search(49)).toBe(49)
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

    it('should delete from leaf node', () => {
      tree.insert(10, 100)
      tree.insert(5, 50)
      expect(tree.delete(5)).toBe(true)
      expect(tree.size()).toBe(1)
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

    it('should handle deleting and re-inserting', () => {
      tree.insert(10, 100)
      tree.delete(10)
      tree.insert(10, 200)
      expect(tree.search(10)).toBe(200)
      expect(tree.size()).toBe(1)
    })

    it('should handle deleting from internal node', () => {
      const t = new BTree<number>({ order: 2 })
      for (let i = 0; i < 10; i++) {
        t.insert(i, i)
      }
      expect(t.delete(5)).toBe(true)
      expect(t.search(5)).toBeUndefined()
      expect(t.size()).toBe(9)
    })

    it('should maintain sorted order after deletions', () => {
      for (let i = 0; i < 20; i++) {
        tree.insert(i, i)
      }
      tree.delete(5)
      tree.delete(10)
      tree.delete(15)
      const result = tree.inOrder()
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i]![0]).toBeLessThan(result[i + 1]![0])
      }
    })

    it('should handle many sequential deletions', () => {
      for (let i = 0; i < 50; i++) tree.insert(i, i)
      for (let i = 0; i < 50; i++) tree.delete(i)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should handle deleting all keys in reverse order', () => {
      for (let i = 0; i < 20; i++) tree.insert(i, i)
      for (let i = 19; i >= 0; i--) tree.delete(i)
      expect(tree.isEmpty()).toBe(true)
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

    it('should increase height with more nodes', () => {
      const t = new BTree<number>({ order: 2 })
      t.insert(1, 1)
      expect(t.getHeight()).toBe(1)
      t.insert(2, 2)
      expect(t.getHeight()).toBeGreaterThanOrEqual(1)
    })

    it('should maintain logarithmic height', () => {
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
      expect(stats.keyCount).toBe(0)
      expect(stats.order).toBe(3)
    })

    it('should return correct stats for single node', () => {
      tree.insert(10, 100)
      const stats = tree.getStats()
      expect(stats.nodeCount).toBe(1)
      expect(stats.height).toBe(1)
      expect(stats.keyCount).toBe(1)
    })

    it('should return correct stats after multiple insertions', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      const stats = tree.getStats()
      expect(stats.keyCount).toBe(3)
      expect(stats.nodeCount).toBeGreaterThanOrEqual(1)
      expect(stats.height).toBeGreaterThanOrEqual(1)
    })

    it('should update stats after deletion', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      tree.delete(5)
      const stats = tree.getStats()
      expect(stats.keyCount).toBe(2)
    })

    it('should report correct order', () => {
      const t = new BTree<number>({ order: 4 })
      t.insert(1, 1)
      expect(t.getStats().order).toBe(4)
    })
  })

  describe('node splitting and merging', () => {
    it('should split root when full', () => {
      const t = new BTree<number>({ order: 2 })
      t.insert(1, 10)
      t.insert(2, 20)
      t.insert(3, 30)
      expect(t.size()).toBe(3)
      expect(t.search(1)).toBe(10)
      expect(t.search(2)).toBe(20)
      expect(t.search(3)).toBe(30)
    })

    it('should handle multiple splits', () => {
      const t = new BTree<number>({ order: 2 })
      for (let i = 1; i <= 7; i++) {
        t.insert(i, i * 10)
      }
      expect(t.size()).toBe(7)
      expect(t.inOrder().map(([k]) => k)).toEqual([1, 2, 3, 4, 5, 6, 7])
    })

    it('should handle merges during deletion', () => {
      const t = new BTree<number>({ order: 2 })
      for (let i = 0; i < 10; i++) {
        t.insert(i, i)
      }
      for (let i = 0; i < 10; i++) {
        expect(t.delete(i)).toBe(true)
      }
      expect(t.isEmpty()).toBe(true)
    })

    it('should handle borrowing from sibling during deletion', () => {
      const t = new BTree<number>({ order: 3 })
      for (let i = 0; i < 20; i++) {
        t.insert(i, i)
      }
      t.delete(0)
      t.delete(19)
      expect(t.size()).toBe(18)
      expect(t.search(1)).toBe(1)
      expect(t.search(18)).toBe(18)
    })

    it('should maintain invariants after many operations', () => {
      const t = new BTree<number>({ order: 2 })
      for (let i = 0; i < 50; i++) {
        t.insert(i, i)
      }
      for (let i = 10; i < 40; i++) {
        t.delete(i)
      }
      const result = t.inOrder()
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i]![0]).toBeLessThan(result[i + 1]![0])
      }
      expect(t.size()).toBe(20)
    })
  })

  describe('string values', () => {
    it('should store string values', () => {
      const t = new BTree<string>()
      t.insert(1, 'hello')
      t.insert(2, 'world')
      expect(t.search(1)).toBe('hello')
      expect(t.search(2)).toBe('world')
    })

    it('should update string values', () => {
      const t = new BTree<string>()
      t.insert(1, 'old')
      t.insert(1, 'new')
      expect(t.search(1)).toBe('new')
    })
  })

  describe('object values', () => {
    it('should store object values', () => {
      const t = new BTree<{ name: string }>()
      t.insert(1, { name: 'a' })
      t.insert(2, { name: 'b' })
      expect(t.search(1)!.name).toBe('a')
      expect(t.search(2)!.name).toBe('b')
    })

    it('should store null values', () => {
      const t = new BTree<null>()
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

    it('should handle alternating insertions and deletions', () => {
      for (let i = 0; i < 20; i++) {
        tree.insert(i, i)
        if (i > 5) tree.delete(i - 5)
      }
      const result = tree.inOrder()
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i]![0]).toBeLessThan(result[i + 1]![0])
      }
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
    })

    it('should find all elements in large tree', () => {
      for (let i = 0; i < 500; i++) tree.insert(i, i * 2)
      for (let i = 0; i < 500; i++) {
        expect(tree.search(i)).toBe(i * 2)
      }
    })
  })

  describe('different orders', () => {
    it('should work with order 2', () => {
      const t = new BTree<number>({ order: 2 })
      for (let i = 0; i < 50; i++) t.insert(i, i)
      expect(t.size()).toBe(50)
      expect(t.search(25)).toBe(25)
    })

    it('should work with order 4', () => {
      const t = new BTree<number>({ order: 4 })
      for (let i = 0; i < 50; i++) t.insert(i, i)
      expect(t.size()).toBe(50)
      expect(t.inOrder().map(([k]) => k)).toEqual(
        Array.from({ length: 50 }, (_, i) => i)
      )
    })

    it('should work with order 10', () => {
      const t = new BTree<number>({ order: 10 })
      for (let i = 0; i < 100; i++) t.insert(i, i)
      expect(t.size()).toBe(100)
      const stats = t.getStats()
      expect(stats.height).toBeLessThan(5)
    })

    it('should work with order 50', () => {
      const t = new BTree<number>({ order: 50 })
      for (let i = 0; i < 200; i++) t.insert(i, i)
      expect(t.size()).toBe(200)
      expect(t.getHeight()).toBeLessThanOrEqual(4)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_BTREE_OPTIONS', () => {
      expect(DEFAULT_BTREE_OPTIONS.order).toBe(3)
    })

    it('should support BTreeOptions interface', () => {
      const opts: BTreeOptions = { order: 5 }
      expect(opts.order).toBe(5)
    })

    it('should support BTreeNode interface', () => {
      const node: BTreeNode<string> = {
        keys: [1, 2],
        values: ['a', 'b'],
        children: [],
        isLeaf: true,
      }
      expect(node.keys.length).toBe(2)
      expect(node.values[0]).toBe('a')
    })

    it('should support BTreeStats interface', () => {
      const stats: BTreeStats = { nodeCount: 0, height: 0, keyCount: 0, order: 3 }
      expect(stats.nodeCount).toBe(0)
      expect(stats.order).toBe(3)
    })
  })
})
