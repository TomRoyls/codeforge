import { describe, it, expect, beforeEach } from 'vitest'
import { AATree } from '../../src/core/aa-tree/aa-tree.js'
import { DEFAULT_AA_TREE_OPTIONS } from '../../src/core/aa-tree/types.js'
import type { AANode, AATreeOptions, AATreeStats, CompareFunction } from '../../src/core/aa-tree/types.js'

describe('AATree', () => {
  let tree: AATree<number, number>

  beforeEach(() => {
    tree = new AATree<number, number>()
  })

  describe('constructor', () => {
    it('should create an empty tree with default options', () => {
      const t = new AATree<number, number>()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should accept custom options with allowDuplicates', () => {
      const t = new AATree<number, number>({ allowDuplicates: true })
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
      const t = new AATree<number, number>({})
      t.insert(1, 1)
      expect(t.size()).toBe(1)
    })

    it('should accept a custom comparator', () => {
      const reverseCmp: CompareFunction<number> = (a, b) => (a > b ? -1 : a < b ? 1 : 0)
      const t = new AATree<number, number>(undefined, reverseCmp)
      t.insert(1, 10)
      t.insert(2, 20)
      t.insert(3, 30)
      const arr = t.toArray()
      expect(arr[0]![0]).toBe(3)
      expect(arr[2]![0]).toBe(1)
    })

    it('should accept both options and comparator', () => {
      const t = new AATree<number, number>({ allowDuplicates: true }, (a, b) => a - b)
      t.insert(1, 10)
      t.insert(1, 20)
      expect(t.size()).toBe(2)
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
      const t = new AATree<number, number>({ allowDuplicates: true })
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

    it('should maintain AA invariants after sequential insertions', () => {
      for (let i = 0; i < 20; i++) {
        tree.insert(i, i)
      }
      expect(tree.validate()).toBe(true)
    })

    it('should maintain AA invariants after reverse sequential insertions', () => {
      for (let i = 20; i >= 0; i--) {
        tree.insert(i, i)
      }
      expect(tree.validate()).toBe(true)
    })

    it('should handle many duplicate keys with allowDuplicates', () => {
      const t = new AATree<number, number>({ allowDuplicates: true })
      for (let i = 0; i < 5; i++) {
        t.insert(10, i)
      }
      expect(t.size()).toBe(5)
      expect(t.validate()).toBe(true)
    })

    it('should handle string keys', () => {
      const t = new AATree<string, number>()
      t.insert('banana', 2)
      t.insert('apple', 1)
      t.insert('cherry', 3)
      expect(t.size()).toBe(3)
      expect(t.search('banana')).toBe(2)
      const arr = t.toArray()
      expect(arr[0]![0]).toBe('apple')
      expect(arr[2]![0]).toBe('cherry')
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

    it('should find values with string keys', () => {
      const t = new AATree<string, number>()
      t.insert('hello', 1)
      t.insert('world', 2)
      expect(t.search('hello')).toBe(1)
      expect(t.search('world')).toBe(2)
      expect(t.search('missing')).toBeUndefined()
    })
  })

  describe('contains', () => {
    it('should return true for existing key', () => {
      tree.insert(10, 100)
      expect(tree.contains(10)).toBe(true)
    })

    it('should return false for non-existent key', () => {
      expect(tree.contains(999)).toBe(false)
    })

    it('should return false on empty tree', () => {
      expect(tree.contains(1)).toBe(false)
    })

    it('should return false after deletion', () => {
      tree.insert(10, 100)
      tree.delete(10)
      expect(tree.contains(10)).toBe(false)
    })

    it('should return true for negative keys', () => {
      tree.insert(-5, 50)
      expect(tree.contains(-5)).toBe(true)
    })

    it('should find all inserted keys', () => {
      for (let i = 0; i < 20; i++) {
        tree.insert(i, i * 10)
      }
      for (let i = 0; i < 20; i++) {
        expect(tree.contains(i)).toBe(true)
      }
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

    it('should maintain AA invariants after deletions', () => {
      for (let i = 0; i < 30; i++) {
        tree.insert(i, i)
      }
      for (let i = 5; i < 25; i++) {
        tree.delete(i)
      }
      expect(tree.validate()).toBe(true)
    })

    it('should handle deleting and re-inserting', () => {
      tree.insert(10, 100)
      tree.delete(10)
      tree.insert(10, 200)
      expect(tree.search(10)).toBe(200)
      expect(tree.size()).toBe(1)
    })

    it('should handle deleting all nodes', () => {
      for (let i = 0; i < 10; i++) {
        tree.insert(i, i)
      }
      for (let i = 0; i < 10; i++) {
        tree.delete(i)
      }
      expect(tree.isEmpty()).toBe(true)
      expect(tree.size()).toBe(0)
    })

    it('should handle deleting in reverse order', () => {
      for (let i = 0; i < 10; i++) {
        tree.insert(i, i)
      }
      for (let i = 9; i >= 0; i--) {
        expect(tree.delete(i)).toBe(true)
      }
      expect(tree.isEmpty()).toBe(true)
    })

    it('should handle deleting root with two children repeatedly', () => {
      tree.insert(5, 50)
      tree.insert(3, 30)
      tree.insert(7, 70)
      tree.insert(1, 10)
      tree.insert(9, 90)
      tree.delete(5)
      expect(tree.size()).toBe(4)
      expect(tree.validate()).toBe(true)
    })
  })

  describe('min', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.min()).toBeUndefined()
    })

    it('should return key-value of single node', () => {
      tree.insert(10, 100)
      expect(tree.min()).toEqual([10, 100])
    })

    it('should return minimum after many insertions', () => {
      tree.insert(50, 500)
      tree.insert(10, 100)
      tree.insert(30, 300)
      expect(tree.min()).toEqual([10, 100])
    })

    it('should update min after deletion', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      tree.delete(5)
      expect(tree.min()).toEqual([10, 100])
    })

    it('should handle negative keys', () => {
      tree.insert(5, 50)
      tree.insert(-10, -100)
      expect(tree.min()).toEqual([-10, -100])
    })
  })

  describe('max', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.max()).toBeUndefined()
    })

    it('should return key-value of single node', () => {
      tree.insert(10, 100)
      expect(tree.max()).toEqual([10, 100])
    })

    it('should return maximum after many insertions', () => {
      tree.insert(10, 100)
      tree.insert(50, 500)
      tree.insert(30, 300)
      expect(tree.max()).toEqual([50, 500])
    })

    it('should update max after deletion', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      tree.delete(20)
      expect(tree.max()).toEqual([10, 100])
    })

    it('should handle negative keys', () => {
      tree.insert(-5, -50)
      tree.insert(-10, -100)
      expect(tree.max()).toEqual([-5, -50])
    })
  })

  describe('successor', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.successor(5)).toBeUndefined()
    })

    it('should return the next larger key', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(30, 300)
      expect(tree.successor(10)).toEqual([20, 200])
    })

    it('should return undefined if key is the maximum', () => {
      tree.insert(10, 100)
      expect(tree.successor(10)).toBeUndefined()
    })

    it('should return next larger even if key is not in tree', () => {
      tree.insert(10, 100)
      tree.insert(30, 300)
      expect(tree.successor(15)).toEqual([30, 300])
    })

    it('should return undefined if no larger key exists', () => {
      tree.insert(10, 100)
      expect(tree.successor(15)).toBeUndefined()
    })

    it('should find successor across many nodes', () => {
      for (let i = 0; i < 20; i += 2) {
        tree.insert(i, i * 10)
      }
      expect(tree.successor(10)).toEqual([12, 120])
      expect(tree.successor(0)).toEqual([2, 20])
    })
  })

  describe('predecessor', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.predecessor(5)).toBeUndefined()
    })

    it('should return the next smaller key', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(30, 300)
      expect(tree.predecessor(20)).toEqual([10, 100])
    })

    it('should return undefined if key is the minimum', () => {
      tree.insert(10, 100)
      expect(tree.predecessor(10)).toBeUndefined()
    })

    it('should return next smaller even if key is not in tree', () => {
      tree.insert(10, 100)
      tree.insert(30, 300)
      expect(tree.predecessor(25)).toEqual([10, 100])
    })

    it('should return undefined if no smaller key exists', () => {
      tree.insert(10, 100)
      expect(tree.predecessor(5)).toBeUndefined()
    })

    it('should find predecessor across many nodes', () => {
      for (let i = 0; i < 20; i += 2) {
        tree.insert(i, i * 10)
      }
      expect(tree.predecessor(10)).toEqual([8, 80])
      expect(tree.predecessor(2)).toEqual([0, 0])
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

    it('should handle range with no matching elements', () => {
      for (let i = 0; i < 10; i++) tree.insert(i * 10, i)
      expect(tree.range(15, 25)).toEqual([[20, 2]])
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty tree', () => {
      let count = 0
      tree.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should call callback for each node in order', () => {
      tree.insert(30, 300)
      tree.insert(10, 100)
      tree.insert(20, 200)
      const keys: number[] = []
      tree.forEach((_v, k) => { keys.push(k) })
      expect(keys).toEqual([10, 20, 30])
    })

    it('should call callback with value and key', () => {
      tree.insert(1, 10)
      tree.insert(2, 20)
      const entries: [number, number][] = []
      tree.forEach((v, k) => { entries.push([k, v]) })
      expect(entries).toEqual([[1, 10], [2, 20]])
    })

    it('should traverse all nodes', () => {
      for (let i = 0; i < 10; i++) tree.insert(i, i)
      let count = 0
      tree.forEach(() => { count++ })
      expect(count).toBe(10)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.toArray()).toEqual([])
    })

    it('should return single element for single node', () => {
      tree.insert(10, 100)
      expect(tree.toArray()).toEqual([[10, 100]])
    })

    it('should return sorted order', () => {
      tree.insert(30, 300)
      tree.insert(10, 100)
      tree.insert(20, 200)
      expect(tree.toArray()).toEqual([[10, 100], [20, 200], [30, 300]])
    })

    it('should return correct order after deletions', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(30, 300)
      tree.delete(20)
      expect(tree.toArray()).toEqual([[10, 100], [30, 300]])
    })

    it('should handle many elements', () => {
      const keys = [5, 3, 7, 1, 4, 6, 8]
      for (const k of keys) tree.insert(k, k * 10)
      const result = tree.toArray()
      expect(result.map(([k]) => k)).toEqual([1, 3, 4, 5, 6, 7, 8])
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

  describe('height', () => {
    it('should return 0 for empty tree', () => {
      expect(tree.height()).toBe(0)
    })

    it('should return 1 for single node', () => {
      tree.insert(1, 1)
      expect(tree.height()).toBe(1)
    })

    it('should return balanced height', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      expect(tree.height()).toBe(2)
    })

    it('should maintain O(log n) height', () => {
      for (let i = 0; i < 1000; i++) {
        tree.insert(i, i)
      }
      const h = tree.height()
      expect(h).toBeLessThan(20)
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

  describe('clone', () => {
    it('should clone an empty tree', () => {
      const cloned = tree.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should clone a tree with elements', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      const cloned = tree.clone()
      expect(cloned.size()).toBe(3)
      expect(cloned.search(10)).toBe(100)
      expect(cloned.search(20)).toBe(200)
      expect(cloned.search(5)).toBe(50)
    })

    it('should create an independent copy', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      const cloned = tree.clone()
      cloned.insert(30, 300)
      expect(cloned.size()).toBe(3)
      expect(tree.size()).toBe(2)
    })

    it('should not affect original on clone mutation', () => {
      tree.insert(10, 100)
      const cloned = tree.clone()
      cloned.delete(10)
      expect(tree.size()).toBe(1)
      expect(cloned.size()).toBe(0)
    })

    it('should preserve options in clone', () => {
      const t = new AATree<number, number>({ allowDuplicates: true })
      t.insert(1, 10)
      t.insert(1, 20)
      const cloned = t.clone()
      expect(cloned.size()).toBe(2)
      cloned.insert(1, 30)
      expect(cloned.size()).toBe(3)
    })

    it('should maintain invariants in clone', () => {
      for (let i = 0; i < 20; i++) tree.insert(i, i)
      const cloned = tree.clone()
      expect(cloned.validate()).toBe(true)
    })
  })

  describe('from (static factory)', () => {
    it('should create tree from entries', () => {
      const t = AATree.from<number, number>([[10, 100], [20, 200], [5, 50]])
      expect(t.size()).toBe(3)
      expect(t.search(10)).toBe(100)
    })

    it('should create empty tree from empty entries', () => {
      const t = AATree.from<number, number>([])
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should accept options', () => {
      const t = AATree.from<number, number>([[1, 10], [1, 20]], { allowDuplicates: true })
      expect(t.size()).toBe(2)
    })

    it('should accept custom comparator', () => {
      const t = AATree.from<string, number>([['b', 2], ['a', 1], ['c', 3]], undefined, (a, b) => a.localeCompare(b))
      const arr = t.toArray()
      expect(arr[0]![0]).toBe('a')
      expect(arr[2]![0]).toBe('c')
    })

    it('should create a valid AA tree', () => {
      const entries: [number, number][] = []
      for (let i = 0; i < 50; i++) entries.push([i, i * 10])
      const t = AATree.from(entries)
      expect(t.validate()).toBe(true)
    })
  })

  describe('stats', () => {
    it('should return empty stats for empty tree', () => {
      const s = tree.stats()
      expect(s.nodeCount).toBe(0)
      expect(s.height).toBe(0)
      expect(s.isBalanced).toBe(true)
      expect(s.minKey).toBeNull()
      expect(s.maxKey).toBeNull()
    })

    it('should return correct stats for single node', () => {
      tree.insert(10, 100)
      const s = tree.stats()
      expect(s.nodeCount).toBe(1)
      expect(s.height).toBe(1)
      expect(s.isBalanced).toBe(true)
      expect(s.minKey).toBe(10)
      expect(s.maxKey).toBe(10)
    })

    it('should return correct stats after multiple insertions', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      const s = tree.stats()
      expect(s.nodeCount).toBe(3)
      expect(s.isBalanced).toBe(true)
      expect(s.minKey).toBe(5)
      expect(s.maxKey).toBe(20)
    })

    it('should update stats after deletion', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      tree.delete(5)
      const s = tree.stats()
      expect(s.nodeCount).toBe(2)
      expect(s.minKey).toBe(10)
      expect(s.maxKey).toBe(20)
    })

    it('should always report balanced for a valid AA tree', () => {
      for (let i = 0; i < 100; i++) {
        tree.insert(i, i)
      }
      expect(tree.stats().isBalanced).toBe(true)
    })
  })

  describe('validate', () => {
    it('should return true for empty tree', () => {
      expect(tree.validate()).toBe(true)
    })

    it('should return true for single node', () => {
      tree.insert(10, 100)
      expect(tree.validate()).toBe(true)
    })

    it('should return true after many insertions', () => {
      for (let i = 0; i < 50; i++) {
        tree.insert(i, i)
      }
      expect(tree.validate()).toBe(true)
    })

    it('should return true after insertions and deletions', () => {
      for (let i = 0; i < 30; i++) tree.insert(i, i)
      for (let i = 10; i < 20; i++) tree.delete(i)
      expect(tree.validate()).toBe(true)
    })

    it('should return true for reverse sorted insertions', () => {
      for (let i = 50; i >= 0; i--) tree.insert(i, i)
      expect(tree.validate()).toBe(true)
    })

    it('should return true for random-looking insertions', () => {
      const keys = [50, 25, 75, 12, 37, 62, 87, 6, 18, 31, 43]
      for (const k of keys) tree.insert(k, k)
      expect(tree.validate()).toBe(true)
    })
  })

  describe('skew and split correctness', () => {
    it('should maintain invariants after sequential insert (triggers split)', () => {
      tree.insert(1, 1)
      tree.insert(2, 2)
      tree.insert(3, 3)
      expect(tree.validate()).toBe(true)
      const arr = tree.toArray()
      expect(arr.map(([k]) => k)).toEqual([1, 2, 3])
    })

    it('should maintain invariants after reverse insert (triggers skew)', () => {
      tree.insert(3, 3)
      tree.insert(2, 2)
      tree.insert(1, 1)
      expect(tree.validate()).toBe(true)
      const arr = tree.toArray()
      expect(arr.map(([k]) => k)).toEqual([1, 2, 3])
    })

    it('should handle alternating insert pattern', () => {
      tree.insert(3, 3)
      tree.insert(1, 1)
      tree.insert(5, 5)
      tree.insert(2, 2)
      tree.insert(4, 4)
      expect(tree.validate()).toBe(true)
      const arr = tree.toArray()
      expect(arr.map(([k]) => k)).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle zigzag insertions', () => {
      const keys = [5, 1, 9, 3, 7, 2, 8, 4, 6]
      for (const k of keys) tree.insert(k, k)
      expect(tree.validate()).toBe(true)
      expect(tree.size()).toBe(9)
    })

    it('should balance correctly after split chain', () => {
      for (let i = 1; i <= 7; i++) tree.insert(i, i)
      expect(tree.validate()).toBe(true)
      expect(tree.toArray().map(([k]) => k)).toEqual([1, 2, 3, 4, 5, 6, 7])
    })

    it('should maintain correct levels after skew', () => {
      tree.insert(5, 5)
      tree.insert(3, 3)
      tree.insert(1, 1)
      expect(tree.validate()).toBe(true)
    })

    it('should maintain correct levels after split', () => {
      tree.insert(1, 1)
      tree.insert(2, 2)
      tree.insert(3, 3)
      tree.insert(4, 4)
      tree.insert(5, 5)
      expect(tree.validate()).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle empty tree operations', () => {
      expect(tree.min()).toBeUndefined()
      expect(tree.max()).toBeUndefined()
      expect(tree.toArray()).toEqual([])
      expect(tree.range(0, 10)).toEqual([])
    })

    it('should handle single element', () => {
      tree.insert(42, 420)
      expect(tree.size()).toBe(1)
      expect(tree.min()).toEqual([42, 420])
      expect(tree.max()).toEqual([42, 420])
      expect(tree.successor(42)).toBeUndefined()
      expect(tree.predecessor(42)).toBeUndefined()
      expect(tree.search(42)).toBe(420)
      expect(tree.contains(42)).toBe(true)
    })

    it('should handle all duplicates', () => {
      const t = new AATree<number, number>({ allowDuplicates: true })
      for (let i = 0; i < 10; i++) t.insert(5, i)
      expect(t.size()).toBe(10)
      expect(t.validate()).toBe(true)
    })

    it('should handle sorted insert', () => {
      for (let i = 0; i < 20; i++) tree.insert(i, i)
      expect(tree.validate()).toBe(true)
      expect(tree.size()).toBe(20)
    })

    it('should handle reverse sorted insert', () => {
      for (let i = 19; i >= 0; i--) tree.insert(i, i)
      expect(tree.validate()).toBe(true)
      expect(tree.size()).toBe(20)
    })

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
      expect(tree.validate()).toBe(true)
    })

    it('should handle deleting nonexistent keys from non-empty tree', () => {
      tree.insert(5, 50)
      tree.insert(10, 100)
      expect(tree.delete(7)).toBe(false)
      expect(tree.size()).toBe(2)
    })

    it('should handle re-inserting deleted key', () => {
      tree.insert(5, 50)
      tree.delete(5)
      tree.insert(5, 100)
      expect(tree.search(5)).toBe(100)
      expect(tree.size()).toBe(1)
    })

    it('should handle clearing and reusing tree', () => {
      tree.insert(1, 10)
      tree.insert(2, 20)
      tree.clear()
      expect(tree.isEmpty()).toBe(true)
      tree.insert(3, 30)
      expect(tree.size()).toBe(1)
      expect(tree.search(3)).toBe(30)
    })
  })

  describe('large trees', () => {
    it('should handle 10000 insertions', () => {
      for (let i = 0; i < 10000; i++) tree.insert(i, i)
      expect(tree.size()).toBe(10000)
      expect(tree.validate()).toBe(true)
    })

    it('should handle 10000 mixed operations', () => {
      for (let i = 0; i < 5000; i++) tree.insert(i, i)
      for (let i = 0; i < 2500; i++) tree.delete(i)
      expect(tree.size()).toBe(2500)
      expect(tree.validate()).toBe(true)
    })

    it('should find all elements in large tree', () => {
      for (let i = 0; i < 5000; i++) tree.insert(i, i * 2)
      for (let i = 0; i < 5000; i++) {
        expect(tree.search(i)).toBe(i * 2)
      }
    })

    it('should maintain O(log n) height for 10000 elements', () => {
      for (let i = 0; i < 10000; i++) tree.insert(i, i)
      expect(tree.height()).toBeLessThan(30)
    })

    it('should handle 10000 reverse sorted insertions', () => {
      for (let i = 9999; i >= 0; i--) tree.insert(i, i)
      expect(tree.size()).toBe(10000)
      expect(tree.validate()).toBe(true)
    })

    it('should handle 10000 random-like insertions and maintain invariants', () => {
      const keys: number[] = []
      for (let i = 0; i < 10000; i++) keys.push((i * 7 + 3) % 10000)
      const used = new Set<number>()
      for (const k of keys) {
        if (!used.has(k)) {
          tree.insert(k, k)
          used.add(k)
        }
      }
      expect(tree.size()).toBe(used.size)
      expect(tree.validate()).toBe(true)
    })
  })

  describe('string values', () => {
    it('should store string values', () => {
      const t = new AATree<number, string>()
      t.insert(1, 'hello')
      t.insert(2, 'world')
      expect(t.search(1)).toBe('hello')
      expect(t.search(2)).toBe('world')
    })

    it('should update string values', () => {
      const t = new AATree<number, string>()
      t.insert(1, 'old')
      t.insert(1, 'new')
      expect(t.search(1)).toBe('new')
    })
  })

  describe('object values', () => {
    it('should store object values', () => {
      const t = new AATree<number, { name: string }>()
      t.insert(1, { name: 'a' })
      t.insert(2, { name: 'b' })
      expect(t.search(1)!.name).toBe('a')
      expect(t.search(2)!.name).toBe('b')
    })

    it('should store null values', () => {
      const t = new AATree<number, null>()
      t.insert(1, null)
      expect(t.search(1)).toBeNull()
      expect(t.contains(1)).toBe(true)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_AA_TREE_OPTIONS', () => {
      expect(DEFAULT_AA_TREE_OPTIONS.allowDuplicates).toBe(false)
    })

    it('should support AATreeOptions interface', () => {
      const opts: AATreeOptions = { allowDuplicates: true }
      expect(opts.allowDuplicates).toBe(true)
    })

    it('should support AANode interface', () => {
      const node: AANode<string, number> = { key: 'a', value: 1, left: null, right: null, level: 1 }
      expect(node.key).toBe('a')
      expect(node.value).toBe(1)
      expect(node.level).toBe(1)
    })

    it('should support AATreeStats interface', () => {
      const s: AATreeStats = { nodeCount: 0, height: 0, isBalanced: true, minKey: null, maxKey: null }
      expect(s.nodeCount).toBe(0)
      expect(s.isBalanced).toBe(true)
    })

    it('should support CompareFunction type', () => {
      const cmp: CompareFunction<number> = (a, b) => a - b
      expect(cmp(1, 2)).toBe(-1)
      expect(cmp(2, 1)).toBe(1)
      expect(cmp(1, 1)).toBe(0)
    })
  })

  describe('balance verification', () => {
    it('should verify all AA tree invariants after insertions', () => {
      for (let i = 0; i < 100; i++) tree.insert(i, i)
      expect(tree.validate()).toBe(true)
    })

    it('should verify all AA tree invariants after mixed operations', () => {
      for (let i = 0; i < 100; i++) tree.insert(i, i)
      for (let i = 20; i < 80; i++) tree.delete(i)
      expect(tree.validate()).toBe(true)
    })

    it('should verify invariants for tree with only deletions from left', () => {
      for (let i = 0; i < 50; i++) tree.insert(i, i)
      for (let i = 0; i < 25; i++) tree.delete(i)
      expect(tree.validate()).toBe(true)
    })

    it('should verify invariants for tree with only deletions from right', () => {
      for (let i = 0; i < 50; i++) tree.insert(i, i)
      for (let i = 25; i < 50; i++) tree.delete(i)
      expect(tree.validate()).toBe(true)
    })

    it('should verify invariants after deleting min repeatedly', () => {
      for (let i = 0; i < 20; i++) tree.insert(i, i)
      for (let i = 0; i < 10; i++) {
        const m = tree.min()
        if (m) tree.delete(m[0])
      }
      expect(tree.validate()).toBe(true)
      expect(tree.size()).toBe(10)
    })

    it('should verify invariants after deleting max repeatedly', () => {
      for (let i = 0; i < 20; i++) tree.insert(i, i)
      for (let i = 0; i < 10; i++) {
        const m = tree.max()
        if (m) tree.delete(m[0])
      }
      expect(tree.validate()).toBe(true)
      expect(tree.size()).toBe(10)
    })

    it('should keep in-order traversal sorted after all operations', () => {
      const keys = [50, 25, 75, 12, 37, 62, 87, 6, 18, 31, 43, 56, 68, 81, 93]
      for (const k of keys) tree.insert(k, k)
      tree.delete(25)
      tree.delete(75)
      tree.insert(100, 100)
      tree.insert(1, 1)
      const arr = tree.toArray()
      const keyArr = arr.map(([k]) => k)
      for (let i = 1; i < keyArr.length; i++) {
        expect(keyArr[i]! > keyArr[i - 1]!).toBe(true)
      }
    })
  })

  describe('traversal order verification', () => {
    it('should produce correct in-order from forEach', () => {
      const keys = [5, 2, 8, 1, 3, 7, 9]
      for (const k of keys) tree.insert(k, k * 10)
      const result: number[] = []
      tree.forEach((_v, k) => result.push(k))
      expect(result).toEqual([1, 2, 3, 5, 7, 8, 9])
    })

    it('should produce correct in-order from toArray', () => {
      const keys = [5, 2, 8, 1, 3, 7, 9]
      for (const k of keys) tree.insert(k, k * 10)
      const result = tree.toArray().map(([k]) => k)
      expect(result).toEqual([1, 2, 3, 5, 7, 8, 9])
    })

    it('should produce correct range traversal', () => {
      for (let i = 0; i < 20; i++) tree.insert(i, i)
      const r = tree.range(5, 15)
      expect(r.map(([k]) => k)).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
    })
  })
})
