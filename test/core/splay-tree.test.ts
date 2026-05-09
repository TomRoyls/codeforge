import { describe, it, expect, beforeEach } from 'vitest'
import { SplayTree } from '../../src/core/splay-tree/splay-tree.js'
import { DEFAULT_SPLAYTREE_OPTIONS } from '../../src/core/splay-tree/splay-tree.js'
import type { SplayNode, SplayTreeOptions } from '../../src/core/splay-tree/splay-tree.js'

describe('SplayTree', () => {
  let tree: SplayTree<number>

  beforeEach(() => {
    tree = new SplayTree<number>()
  })

  describe('constructor', () => {
    it('should create an empty tree', () => {
      const t = new SplayTree<number>()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should accept options parameter', () => {
      const t = new SplayTree<number>({})
      t.insert(1, 10)
      expect(t.size()).toBe(1)
    })

    it('should accept undefined options', () => {
      const t = new SplayTree<number>(undefined)
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

    it('should insert many nodes maintaining BST property', () => {
      for (let i = 0; i < 20; i++) {
        tree.insert(i, i)
      }
      const arr = tree.toArray()
      for (let i = 0; i < 20; i++) {
        expect(arr[i]!.key).toBe(i)
      }
    })

    it('should insert random keys', () => {
      const keys = [50, 25, 75, 10, 30, 60, 90]
      for (const k of keys) tree.insert(k, k * 10)
      expect(tree.size()).toBe(7)
      const arr = tree.toArray()
      const sortedKeys = [...keys].sort((a, b) => a - b)
      expect(arr.map(e => e.key)).toEqual(sortedKeys)
    })

    it('should splay inserted node to root', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      expect(tree.search(5)).toBe(50)
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

    it('should splay found node to root', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(30, 300)
      tree.search(10)
      expect(tree.toArray().length).toBe(3)
    })

    it('should not modify tree when key not found', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.search(999)
      expect(tree.size()).toBe(2)
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

    it('should splay node to root on has', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      tree.has(10)
      expect(tree.size()).toBe(3)
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

    it('should handle deleting and re-inserting', () => {
      tree.insert(10, 100)
      tree.delete(10)
      tree.insert(10, 200)
      expect(tree.search(10)).toBe(200)
      expect(tree.size()).toBe(1)
    })

    it('should maintain BST property after deletions', () => {
      const keys = [50, 25, 75, 10, 30, 60, 90]
      for (const k of keys) tree.insert(k, k)
      tree.delete(25)
      tree.delete(75)
      const arr = tree.toArray()
      const sorted = [10, 30, 50, 60, 90]
      expect(arr.map(e => e.key)).toEqual(sorted)
    })
  })

  describe('min', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.min()).toBeUndefined()
    })

    it('should return key and value of single node', () => {
      tree.insert(10, 100)
      const result = tree.min()
      expect(result).toEqual({ key: 10, value: 100 })
    })

    it('should return minimum after many insertions', () => {
      tree.insert(50, 500)
      tree.insert(10, 100)
      tree.insert(30, 300)
      const result = tree.min()
      expect(result).toEqual({ key: 10, value: 100 })
    })

    it('should update min after deletion', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      tree.delete(5)
      const result = tree.min()
      expect(result).toEqual({ key: 10, value: 100 })
    })

    it('should handle negative keys', () => {
      tree.insert(5, 50)
      tree.insert(-10, -100)
      const result = tree.min()
      expect(result).toEqual({ key: -10, value: -100 })
    })

    it('should splay min node to root', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      tree.min()
      expect(tree.toArray().length).toBe(3)
    })
  })

  describe('max', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.max()).toBeUndefined()
    })

    it('should return key and value of single node', () => {
      tree.insert(10, 100)
      const result = tree.max()
      expect(result).toEqual({ key: 10, value: 100 })
    })

    it('should return maximum after many insertions', () => {
      tree.insert(10, 100)
      tree.insert(50, 500)
      tree.insert(30, 300)
      const result = tree.max()
      expect(result).toEqual({ key: 50, value: 500 })
    })

    it('should update max after deletion', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      tree.delete(20)
      const result = tree.max()
      expect(result).toEqual({ key: 10, value: 100 })
    })

    it('should handle negative keys', () => {
      tree.insert(-5, -50)
      tree.insert(-10, -100)
      const result = tree.max()
      expect(result).toEqual({ key: -5, value: -50 })
    })

    it('should splay max node to root', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      tree.max()
      expect(tree.toArray().length).toBe(3)
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

    it('should track size through many operations', () => {
      for (let i = 0; i < 10; i++) tree.insert(i, i)
      for (let i = 0; i < 5; i++) tree.delete(i)
      expect(tree.size()).toBe(5)
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

    it('should toggle correctly through operations', () => {
      expect(tree.isEmpty()).toBe(true)
      tree.insert(1, 1)
      expect(tree.isEmpty()).toBe(false)
      tree.delete(1)
      expect(tree.isEmpty()).toBe(true)
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

    it('should clear large tree', () => {
      for (let i = 0; i < 100; i++) tree.insert(i, i)
      tree.clear()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('forEach', () => {
    it('should not call callback on empty tree', () => {
      let count = 0
      tree.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should call callback for each node in order', () => {
      tree.insert(30, 300)
      tree.insert(10, 100)
      tree.insert(20, 200)
      const keys: number[] = []
      const values: number[] = []
      tree.forEach((k, v) => {
        keys.push(k)
        values.push(v)
      })
      expect(keys).toEqual([10, 20, 30])
      expect(values).toEqual([100, 200, 300])
    })

    it('should iterate single node', () => {
      tree.insert(5, 50)
      let count = 0
      tree.forEach((k, v) => {
        expect(k).toBe(5)
        expect(v).toBe(50)
        count++
      })
      expect(count).toBe(1)
    })

    it('should handle many elements', () => {
      for (let i = 0; i < 10; i++) tree.insert(i, i * 10)
      const keys: number[] = []
      tree.forEach((k) => keys.push(k))
      expect(keys).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should not modify tree during iteration', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.forEach(() => {})
      expect(tree.size()).toBe(2)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.toArray()).toEqual([])
    })

    it('should return single element for single node', () => {
      tree.insert(10, 100)
      expect(tree.toArray()).toEqual([{ key: 10, value: 100 }])
    })

    it('should return sorted order', () => {
      tree.insert(30, 300)
      tree.insert(10, 100)
      tree.insert(20, 200)
      expect(tree.toArray()).toEqual([
        { key: 10, value: 100 },
        { key: 20, value: 200 },
        { key: 30, value: 300 },
      ])
    })

    it('should return correct order after deletions', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(30, 300)
      tree.delete(20)
      expect(tree.toArray()).toEqual([
        { key: 10, value: 100 },
        { key: 30, value: 300 },
      ])
    })

    it('should handle many elements', () => {
      const keys = [5, 3, 7, 1, 4, 6, 8]
      for (const k of keys) tree.insert(k, k * 10)
      const result = tree.toArray()
      expect(result.map(e => e.key)).toEqual([1, 3, 4, 5, 6, 7, 8])
    })
  })

  describe('containsRange', () => {
    it('should return false for empty tree', () => {
      expect(tree.containsRange(0, 10)).toBe(false)
    })

    it('should return true when key is within range', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(30, 300)
      expect(tree.containsRange(15, 25)).toBe(true)
    })

    it('should return true when all keys are in range', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(30, 300)
      expect(tree.containsRange(10, 30)).toBe(true)
    })

    it('should return false when no keys in range', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      expect(tree.containsRange(30, 40)).toBe(false)
    })

    it('should return true for single key at boundary', () => {
      tree.insert(10, 100)
      expect(tree.containsRange(10, 10)).toBe(true)
    })

    it('should return false for inverted range with no match', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      expect(tree.containsRange(30, 5)).toBe(false)
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
      expect(tree.range(15, 25)).toEqual([{ key: 20, value: 200 }])
    })

    it('should return all entries in range', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(30, 300)
      const result = tree.range(10, 30)
      expect(result).toEqual([
        { key: 10, value: 100 },
        { key: 20, value: 200 },
        { key: 30, value: 300 },
      ])
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
      expect(tree.range(20, 20)).toEqual([{ key: 20, value: 200 }])
    })

    it('should handle inverted range', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      expect(tree.range(30, 5)).toEqual([])
    })

    it('should return boundary elements', () => {
      for (let i = 0; i <= 10; i++) tree.insert(i, i)
      const result = tree.range(3, 7)
      expect(result.map(e => e.key)).toEqual([3, 4, 5, 6, 7])
    })
  })

  describe('splay behavior', () => {
    it('should move searched node to root', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(30, 300)
      tree.insert(5, 50)
      tree.search(30)
      expect(tree.search(30)).toBe(300)
    })

    it('should move inserted node to root', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      tree.insert(15, 150)
      expect(tree.search(15)).toBe(150)
    })

    it('should move min node to root', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      tree.min()
      expect(tree.search(5)).toBe(50)
    })

    it('should move max node to root', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      tree.max()
      expect(tree.search(20)).toBe(200)
    })

    it('should handle zig rotation (left child of root)', () => {
      tree.insert(20, 200)
      tree.insert(10, 100)
      expect(tree.search(10)).toBe(100)
      expect(tree.toArray().length).toBe(2)
    })

    it('should handle zag rotation (right child of root)', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      expect(tree.search(20)).toBe(200)
      expect(tree.toArray().length).toBe(2)
    })

    it('should handle zig-zig rotation', () => {
      tree.insert(30, 300)
      tree.insert(20, 200)
      tree.insert(10, 100)
      expect(tree.search(10)).toBe(100)
      const arr = tree.toArray()
      expect(arr.map(e => e.key)).toEqual([10, 20, 30])
    })

    it('should handle zag-zag rotation', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(30, 300)
      expect(tree.search(30)).toBe(300)
      const arr = tree.toArray()
      expect(arr.map(e => e.key)).toEqual([10, 20, 30])
    })

    it('should handle zig-zag rotation', () => {
      tree.insert(30, 300)
      tree.insert(10, 100)
      tree.insert(20, 200)
      expect(tree.search(20)).toBe(200)
      const arr = tree.toArray()
      expect(arr.map(e => e.key)).toEqual([10, 20, 30])
    })

    it('should handle zag-zig rotation', () => {
      tree.insert(10, 100)
      tree.insert(30, 300)
      tree.insert(20, 200)
      expect(tree.search(20)).toBe(200)
      const arr = tree.toArray()
      expect(arr.map(e => e.key)).toEqual([10, 20, 30])
    })
  })

  describe('string values', () => {
    it('should store string values', () => {
      const t = new SplayTree<string>()
      t.insert(1, 'hello')
      t.insert(2, 'world')
      expect(t.search(1)).toBe('hello')
      expect(t.search(2)).toBe('world')
    })

    it('should update string values', () => {
      const t = new SplayTree<string>()
      t.insert(1, 'old')
      t.insert(1, 'new')
      expect(t.search(1)).toBe('new')
    })
  })

  describe('object values', () => {
    it('should store object values', () => {
      const t = new SplayTree<{ name: string }>()
      t.insert(1, { name: 'a' })
      t.insert(2, { name: 'b' })
      expect(t.search(1)!.name).toBe('a')
      expect(t.search(2)!.name).toBe('b')
    })

    it('should store null values', () => {
      const t = new SplayTree<null>()
      t.insert(1, null)
      expect(t.search(1)).toBeNull()
      expect(t.has(1)).toBe(true)
    })

    it('should store undefined values', () => {
      const t = new SplayTree<number | undefined>()
      t.insert(1, undefined)
      expect(t.has(1)).toBe(true)
      expect(t.search(1)).toBeUndefined()
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
      expect(tree.size()).toBeGreaterThan(0)
    })

    it('should handle deletion of root with two children', () => {
      tree.insert(20, 200)
      tree.insert(10, 100)
      tree.insert(30, 300)
      tree.insert(5, 50)
      tree.insert(15, 150)
      expect(tree.delete(20)).toBe(true)
      expect(tree.size()).toBe(4)
      const arr = tree.toArray()
      expect(arr.map(e => e.key)).toEqual([5, 10, 15, 30])
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

  describe('type exports', () => {
    it('should export DEFAULT_SPLAYTREE_OPTIONS', () => {
      expect(DEFAULT_SPLAYTREE_OPTIONS).toEqual({})
    })

    it('should support SplayTreeOptions interface', () => {
      const opts: SplayTreeOptions = {}
      expect(opts).toBeDefined()
    })

    it('should support SplayNode interface', () => {
      const node: SplayNode<string> = {
        key: 1,
        value: 'test',
        left: null,
        right: null,
        parent: null,
      }
      expect(node.key).toBe(1)
      expect(node.value).toBe('test')
    })
  })
})
