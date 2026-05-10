import { describe, it, expect, beforeEach } from 'vitest'
import { TopTree } from '../../src/core/top-tree/top-tree.js'
import { DEFAULT_TOP_TREE_OPTIONS } from '../../src/core/top-tree/types.js'
import type { TopTreeNode, TopTreeOptions, TopTreeStats, CompareFunction, AggregateType } from '../../src/core/top-tree/types.js'

describe('TopTree', () => {
  let tree: TopTree<number, number>

  beforeEach(() => {
    tree = new TopTree<number, number>()
  })

  describe('constructor', () => {
    it('should create an empty tree with default options', () => {
      const t = new TopTree<number, number>()
      expect(t.size).toBe(0)
    })

    it('should accept custom aggregate option', () => {
      const t = new TopTree<number, number>({ aggregate: 'min' })
      t.insert(1, 10)
      t.insert(2, 20)
      expect(t.size).toBe(2)
    })

    it('should use default aggregate of sum', () => {
      expect(DEFAULT_TOP_TREE_OPTIONS.aggregate).toBe('sum')
    })

    it('should accept partial options', () => {
      const t = new TopTree<number, number>({})
      t.insert(1, 1)
      expect(t.size).toBe(1)
    })

    it('should accept a custom comparator', () => {
      const reverseCmp: CompareFunction<number> = (a, b) => (a > b ? -1 : a < b ? 1 : 0)
      const t = new TopTree<number, number>(undefined, reverseCmp)
      t.insert(1, 10)
      t.insert(2, 20)
      t.insert(3, 30)
      const arr = t.toArray()
      expect(arr[0]![0]).toBe(3)
      expect(arr[2]![0]).toBe(1)
    })

    it('should accept both options and comparator', () => {
      const t = new TopTree<number, number>({ aggregate: 'max' }, (a, b) => a - b)
      t.insert(1, 10)
      t.insert(2, 20)
      expect(t.size).toBe(2)
    })
  })

  describe('insert', () => {
    it('should insert a single node', () => {
      tree.insert(10, 100)
      expect(tree.size).toBe(1)
      expect(tree.get(10)).toBe(100)
    })

    it('should insert multiple nodes in order', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(30, 300)
      expect(tree.size).toBe(3)
    })

    it('should insert multiple nodes in reverse order', () => {
      tree.insert(30, 300)
      tree.insert(20, 200)
      tree.insert(10, 100)
      expect(tree.size).toBe(3)
    })

    it('should update value for duplicate key', () => {
      tree.insert(10, 100)
      tree.insert(10, 999)
      expect(tree.size).toBe(1)
      expect(tree.get(10)).toBe(999)
    })

    it('should handle negative keys', () => {
      tree.insert(-5, 50)
      tree.insert(-10, 100)
      tree.insert(5, 500)
      expect(tree.size).toBe(3)
      expect(tree.get(-5)).toBe(50)
    })

    it('should handle zero key', () => {
      tree.insert(0, 42)
      expect(tree.get(0)).toBe(42)
    })

    it('should return void', () => {
      const result = tree.insert(1, 1)
      expect(result).toBeUndefined()
    })

    it('should maintain BST invariants after sequential insertions', () => {
      for (let i = 0; i < 20; i++) {
        tree.insert(i, i)
      }
      expect(tree.validate()).toBe(true)
    })

    it('should maintain BST invariants after reverse sequential insertions', () => {
      for (let i = 20; i >= 0; i--) {
        tree.insert(i, i)
      }
      expect(tree.validate()).toBe(true)
    })

    it('should handle string keys', () => {
      const t = new TopTree<string, number>()
      t.insert('banana', 2)
      t.insert('apple', 1)
      t.insert('cherry', 3)
      expect(t.size).toBe(3)
      expect(t.get('banana')).toBe(2)
      const arr = t.toArray()
      expect(arr[0]![0]).toBe('apple')
      expect(arr[2]![0]).toBe('cherry')
    })

    it('should insert without value', () => {
      tree.insert(5)
      expect(tree.has(5)).toBe(true)
      expect(tree.size).toBe(1)
    })

    it('should handle many insertions with alternating pattern', () => {
      const keys = [50, 25, 75, 12, 37, 62, 87]
      for (const k of keys) tree.insert(k, k * 10)
      expect(tree.size).toBe(7)
      expect(tree.validate()).toBe(true)
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

    it('should find all inserted keys', () => {
      for (let i = 0; i < 20; i++) {
        tree.insert(i, i * 10)
      }
      for (let i = 0; i < 20; i++) {
        expect(tree.has(i)).toBe(true)
      }
    })
  })

  describe('get', () => {
    it('should find an existing key', () => {
      tree.insert(10, 100)
      expect(tree.get(10)).toBe(100)
    })

    it('should return undefined for non-existent key', () => {
      expect(tree.get(999)).toBeUndefined()
    })

    it('should return undefined when searching empty tree', () => {
      expect(tree.get(1)).toBeUndefined()
    })

    it('should find nodes after many insertions', () => {
      for (let i = 0; i < 50; i++) {
        tree.insert(i, i * 10)
      }
      expect(tree.get(25)).toBe(250)
      expect(tree.get(49)).toBe(490)
      expect(tree.get(0)).toBe(0)
    })

    it('should find updated value after duplicate insert', () => {
      tree.insert(5, 50)
      tree.insert(5, 99)
      expect(tree.get(5)).toBe(99)
    })

    it('should find values with string keys', () => {
      const t = new TopTree<string, number>()
      t.insert('hello', 1)
      t.insert('world', 2)
      expect(t.get('hello')).toBe(1)
      expect(t.get('world')).toBe(2)
      expect(t.get('missing')).toBeUndefined()
    })
  })

  describe('delete', () => {
    it('should delete an existing key', () => {
      tree.insert(10, 100)
      expect(tree.delete(10)).toBe(true)
      expect(tree.size).toBe(0)
      expect(tree.get(10)).toBeUndefined()
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
      expect(tree.size).toBe(1)
    })

    it('should delete node with one child', () => {
      tree.insert(10, 100)
      tree.insert(5, 50)
      tree.insert(3, 30)
      expect(tree.delete(5)).toBe(true)
      expect(tree.size).toBe(2)
    })

    it('should delete node with two children', () => {
      tree.insert(10, 100)
      tree.insert(5, 50)
      tree.insert(15, 150)
      expect(tree.delete(10)).toBe(true)
      expect(tree.size).toBe(2)
    })

    it('should delete root when it is the only node', () => {
      tree.insert(10, 100)
      expect(tree.delete(10)).toBe(true)
      expect(tree.size).toBe(0)
    })

    it('should maintain correct size after multiple deletions', () => {
      for (let i = 0; i < 10; i++) {
        tree.insert(i, i)
      }
      tree.delete(5)
      tree.delete(3)
      tree.delete(7)
      expect(tree.size).toBe(7)
    })

    it('should maintain BST invariants after deletions', () => {
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
      expect(tree.get(10)).toBe(200)
      expect(tree.size).toBe(1)
    })

    it('should handle deleting all nodes', () => {
      for (let i = 0; i < 10; i++) {
        tree.insert(i, i)
      }
      for (let i = 0; i < 10; i++) {
        tree.delete(i)
      }
      expect(tree.size).toBe(0)
    })

    it('should handle deleting in reverse order', () => {
      for (let i = 0; i < 10; i++) {
        tree.insert(i, i)
      }
      for (let i = 9; i >= 0; i--) {
        expect(tree.delete(i)).toBe(true)
      }
      expect(tree.size).toBe(0)
    })

    it('should handle deleting root with two children repeatedly', () => {
      tree.insert(5, 50)
      tree.insert(3, 30)
      tree.insert(7, 70)
      tree.insert(1, 10)
      tree.insert(9, 90)
      tree.delete(5)
      expect(tree.size).toBe(4)
      expect(tree.validate()).toBe(true)
    })

    it('should handle deleting nonexistent keys from non-empty tree', () => {
      tree.insert(5, 50)
      tree.insert(10, 100)
      expect(tree.delete(7)).toBe(false)
      expect(tree.size).toBe(2)
    })
  })

  describe('min', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.min).toBeUndefined()
    })

    it('should return key-value of single node', () => {
      tree.insert(10, 100)
      expect(tree.min).toEqual([10, 100])
    })

    it('should return minimum after many insertions', () => {
      tree.insert(50, 500)
      tree.insert(10, 100)
      tree.insert(30, 300)
      expect(tree.min).toEqual([10, 100])
    })

    it('should update min after deletion', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      tree.delete(5)
      expect(tree.min).toEqual([10, 100])
    })

    it('should handle negative keys', () => {
      tree.insert(5, 50)
      tree.insert(-10, -100)
      expect(tree.min).toEqual([-10, -100])
    })
  })

  describe('max', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.max).toBeUndefined()
    })

    it('should return key-value of single node', () => {
      tree.insert(10, 100)
      expect(tree.max).toEqual([10, 100])
    })

    it('should return maximum after many insertions', () => {
      tree.insert(10, 100)
      tree.insert(50, 500)
      tree.insert(30, 300)
      expect(tree.max).toEqual([50, 500])
    })

    it('should update max after deletion', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      tree.delete(20)
      expect(tree.max).toEqual([10, 100])
    })

    it('should handle negative keys', () => {
      tree.insert(-5, -50)
      tree.insert(-10, -100)
      expect(tree.max).toEqual([-5, -50])
    })
  })

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      expect(tree.size).toBe(0)
    })

    it('should return correct size after insertions', () => {
      tree.insert(10, 100)
      expect(tree.size).toBe(1)
      tree.insert(20, 200)
      expect(tree.size).toBe(2)
    })

    it('should not increase on duplicate insert', () => {
      tree.insert(10, 100)
      tree.insert(10, 200)
      expect(tree.size).toBe(1)
    })

    it('should decrease after deletion', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.delete(10)
      expect(tree.size).toBe(1)
    })
  })

  describe('pathQuery', () => {
    beforeEach(() => {
      tree.insert(5, 50)
      tree.insert(3, 30)
      tree.insert(7, 70)
      tree.insert(1, 10)
      tree.insert(4, 40)
      tree.insert(6, 60)
      tree.insert(8, 80)
    })

    it('should return undefined for empty tree', () => {
      const t = new TopTree<number, number>()
      expect(t.pathQuery(1, 5, 'sum')).toBeUndefined()
    })

    it('should return undefined when from key does not exist', () => {
      expect(tree.pathQuery(99, 5, 'sum')).toBeUndefined()
    })

    it('should return undefined when to key does not exist', () => {
      expect(tree.pathQuery(5, 99, 'sum')).toBeUndefined()
    })

    it('should return the node value for same key', () => {
      expect(tree.pathQuery(5, 5, 'sum')).toBe(50)
    })

    it('should compute sum on path', () => {
      const result = tree.pathQuery(1, 4, 'sum')
      expect(typeof result).toBe('number')
      expect(result! > 0).toBe(true)
    })

    it('should compute min on path', () => {
      const result = tree.pathQuery(1, 4, 'min')
      expect(typeof result).toBe('number')
    })

    it('should compute max on path', () => {
      const result = tree.pathQuery(1, 8, 'max')
      expect(typeof result).toBe('number')
    })

    it('should compute count on path', () => {
      const result = tree.pathQuery(1, 4, 'count')
      expect(typeof result).toBe('number')
      expect(result!).toBeGreaterThanOrEqual(2)
    })

    it('should use default aggregate type from options', () => {
      const t = new TopTree<number, number>({ aggregate: 'sum' })
      t.insert(1, 10)
      t.insert(2, 20)
      t.insert(3, 30)
      const result = t.pathQuery(1, 3)
      expect(typeof result).toBe('number')
    })

    it('should handle path from parent to child', () => {
      const result = tree.pathQuery(5, 3, 'sum')
      expect(typeof result).toBe('number')
    })

    it('should handle path from child to parent', () => {
      const result = tree.pathQuery(3, 5, 'sum')
      expect(typeof result).toBe('number')
    })

    it('should handle path between siblings', () => {
      const result = tree.pathQuery(1, 4, 'sum')
      expect(typeof result).toBe('number')
    })

    it('should handle path with reversed key order', () => {
      const result1 = tree.pathQuery(1, 8, 'sum')
      const result2 = tree.pathQuery(8, 1, 'sum')
      expect(result1).toBe(result2)
    })

    it('should handle path query on single node tree', () => {
      const t = new TopTree<number, number>()
      t.insert(5, 50)
      expect(t.pathQuery(5, 5, 'sum')).toBe(50)
      expect(t.pathQuery(5, 5, 'min')).toBe(50)
      expect(t.pathQuery(5, 5, 'max')).toBe(50)
      expect(t.pathQuery(5, 5, 'count')).toBe(1)
    })

    it('should handle path with two nodes', () => {
      const t = new TopTree<number, number>()
      t.insert(1, 10)
      t.insert(2, 20)
      const result = t.pathQuery(1, 2, 'sum')
      expect(result).toBe(30)
    })

    it('should return correct min aggregate', () => {
      const t = new TopTree<number, number>()
      t.insert(5, 50)
      t.insert(3, 30)
      t.insert(7, 70)
      const result = t.pathQuery(3, 7, 'min')
      expect(result).toBe(30)
    })

    it('should return correct max aggregate', () => {
      const t = new TopTree<number, number>()
      t.insert(5, 50)
      t.insert(3, 30)
      t.insert(7, 70)
      const result = t.pathQuery(3, 7, 'max')
      expect(result).toBe(70)
    })

    it('should return correct count aggregate', () => {
      const t = new TopTree<number, number>()
      t.insert(5, 50)
      t.insert(3, 30)
      t.insert(7, 70)
      const result = t.pathQuery(3, 7, 'count')
      expect(result).toBe(3)
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

  describe('clear', () => {
    it('should clear all nodes', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.clear()
      expect(tree.size).toBe(0)
    })

    it('should handle clearing empty tree', () => {
      tree.clear()
      expect(tree.size).toBe(0)
    })

    it('should allow insertions after clear', () => {
      tree.insert(10, 100)
      tree.clear()
      tree.insert(20, 200)
      expect(tree.size).toBe(1)
      expect(tree.get(20)).toBe(200)
    })

    it('should return void', () => {
      expect(tree.clear()).toBeUndefined()
    })
  })

  describe('clone', () => {
    it('should clone an empty tree', () => {
      const cloned = tree.clone()
      expect(cloned.size).toBe(0)
    })

    it('should clone a tree with elements', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(5, 50)
      const cloned = tree.clone()
      expect(cloned.size).toBe(3)
      expect(cloned.get(10)).toBe(100)
      expect(cloned.get(20)).toBe(200)
      expect(cloned.get(5)).toBe(50)
    })

    it('should create an independent copy', () => {
      tree.insert(10, 100)
      tree.insert(20, 200)
      const cloned = tree.clone()
      cloned.insert(30, 300)
      expect(cloned.size).toBe(3)
      expect(tree.size).toBe(2)
    })

    it('should not affect original on clone mutation', () => {
      tree.insert(10, 100)
      const cloned = tree.clone()
      cloned.delete(10)
      expect(tree.size).toBe(1)
      expect(cloned.size).toBe(0)
    })

    it('should preserve options in clone', () => {
      const t = new TopTree<number, number>({ aggregate: 'min' })
      t.insert(1, 10)
      t.insert(2, 20)
      const cloned = t.clone()
      expect(cloned.size).toBe(2)
    })

    it('should maintain invariants in clone', () => {
      for (let i = 0; i < 20; i++) tree.insert(i, i)
      const cloned = tree.clone()
      expect(cloned.validate()).toBe(true)
    })
  })

  describe('from (static factory)', () => {
    it('should create tree from entries', () => {
      const t = TopTree.from<number, number>([[10, 100], [20, 200], [5, 50]])
      expect(t.size).toBe(3)
      expect(t.get(10)).toBe(100)
    })

    it('should create empty tree from empty entries', () => {
      const t = TopTree.from<number, number>([])
      expect(t.size).toBe(0)
    })

    it('should accept options', () => {
      const t = TopTree.from<number, number>([[1, 10], [2, 20]], { aggregate: 'max' })
      expect(t.size).toBe(2)
    })

    it('should accept custom comparator', () => {
      const t = TopTree.from<string, number>([['b', 2], ['a', 1], ['c', 3]], undefined, (a, b) => a.localeCompare(b))
      const arr = t.toArray()
      expect(arr[0]![0]).toBe('a')
      expect(arr[2]![0]).toBe('c')
    })

    it('should create a valid BST', () => {
      const entries: [number, number][] = []
      for (let i = 0; i < 50; i++) entries.push([i, i * 10])
      const t = TopTree.from(entries)
      expect(t.validate()).toBe(true)
    })

    it('should handle entries without values', () => {
      const t = TopTree.from<number, number>([[1], [2], [3]])
      expect(t.size).toBe(3)
      expect(t.has(1)).toBe(true)
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

    it('should report stats after many insertions', () => {
      for (let i = 0; i < 100; i++) {
        tree.insert(i, i)
      }
      const s = tree.stats()
      expect(s.nodeCount).toBe(100)
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
  })

  describe('edge cases', () => {
    it('should handle empty tree operations', () => {
      expect(tree.min).toBeUndefined()
      expect(tree.max).toBeUndefined()
      expect(tree.toArray()).toEqual([])
    })

    it('should handle single element', () => {
      tree.insert(42, 420)
      expect(tree.size).toBe(1)
      expect(tree.min).toEqual([42, 420])
      expect(tree.max).toEqual([42, 420])
      expect(tree.get(42)).toBe(420)
      expect(tree.has(42)).toBe(true)
    })

    it('should handle sorted insert', () => {
      for (let i = 0; i < 20; i++) tree.insert(i, i)
      expect(tree.validate()).toBe(true)
      expect(tree.size).toBe(20)
    })

    it('should handle reverse sorted insert', () => {
      for (let i = 19; i >= 0; i--) tree.insert(i, i)
      expect(tree.validate()).toBe(true)
      expect(tree.size).toBe(20)
    })

    it('should handle large keys', () => {
      tree.insert(Number.MAX_SAFE_INTEGER, 1)
      tree.insert(Number.MIN_SAFE_INTEGER, 2)
      expect(tree.get(Number.MAX_SAFE_INTEGER)).toBe(1)
      expect(tree.get(Number.MIN_SAFE_INTEGER)).toBe(2)
    })

    it('should handle floating point keys', () => {
      tree.insert(1.5, 15)
      tree.insert(2.5, 25)
      expect(tree.get(1.5)).toBe(15)
    })

    it('should handle many sequential deletions', () => {
      for (let i = 0; i < 50; i++) tree.insert(i, i)
      for (let i = 0; i < 50; i++) tree.delete(i)
      expect(tree.size).toBe(0)
    })

    it('should handle alternating insertions and deletions', () => {
      for (let i = 0; i < 20; i++) {
        tree.insert(i, i)
        if (i > 5) tree.delete(i - 5)
      }
      expect(tree.validate()).toBe(true)
    })

    it('should handle re-inserting deleted key', () => {
      tree.insert(5, 50)
      tree.delete(5)
      tree.insert(5, 100)
      expect(tree.get(5)).toBe(100)
      expect(tree.size).toBe(1)
    })

    it('should handle clearing and reusing tree', () => {
      tree.insert(1, 10)
      tree.insert(2, 20)
      tree.clear()
      expect(tree.size).toBe(0)
      tree.insert(3, 30)
      expect(tree.size).toBe(1)
      expect(tree.get(3)).toBe(30)
    })

    it('should handle degenerate path queries', () => {
      tree.insert(5, 50)
      tree.insert(3, 30)
      tree.insert(7, 70)
      expect(tree.pathQuery(5, 5, 'sum')).toBe(50)
      expect(tree.pathQuery(3, 3, 'min')).toBe(30)
      expect(tree.pathQuery(7, 7, 'max')).toBe(70)
    })
  })

  describe('large trees', () => {
    it('should handle 10000 insertions', () => {
      for (let i = 0; i < 10000; i++) tree.insert(i, i)
      expect(tree.size).toBe(10000)
      expect(tree.validate()).toBe(true)
    })

    it('should handle 10000 mixed operations', () => {
      for (let i = 0; i < 5000; i++) tree.insert(i, i)
      for (let i = 0; i < 2500; i++) tree.delete(i)
      expect(tree.size).toBe(2500)
      expect(tree.validate()).toBe(true)
    })

    it('should find all elements in large tree', () => {
      for (let i = 0; i < 5000; i++) tree.insert(i, i * 2)
      for (let i = 0; i < 5000; i++) {
        expect(tree.get(i)).toBe(i * 2)
      }
    })

    it('should handle 10000 reverse sorted insertions', () => {
      for (let i = 9999; i >= 0; i--) tree.insert(i, i)
      expect(tree.size).toBe(10000)
      expect(tree.validate()).toBe(true)
    })

    it('should handle 10000 random-like insertions', () => {
      const used = new Set<number>()
      for (let i = 0; i < 10000; i++) {
        const k = (i * 7 + 3) % 10000
        if (!used.has(k)) {
          tree.insert(k, k)
          used.add(k)
        }
      }
      expect(tree.size).toBe(used.size)
      expect(tree.validate()).toBe(true)
    })

    it('should maintain sorted order in large tree', () => {
      for (let i = 0; i < 1000; i++) tree.insert(i, i)
      const arr = tree.toArray()
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]![0]).toBeGreaterThan(arr[i - 1]![0])
      }
    })

    it('should handle path queries on large trees', () => {
      for (let i = 0; i < 1000; i++) tree.insert(i, i)
      const result = tree.pathQuery(0, 999, 'sum')
      expect(typeof result).toBe('number')
      expect(result! > 0).toBe(true)
    })
  })

  describe('string values', () => {
    it('should store string values', () => {
      const t = new TopTree<number, string>()
      t.insert(1, 'hello')
      t.insert(2, 'world')
      expect(t.get(1)).toBe('hello')
      expect(t.get(2)).toBe('world')
    })

    it('should update string values', () => {
      const t = new TopTree<number, string>()
      t.insert(1, 'old')
      t.insert(1, 'new')
      expect(t.get(1)).toBe('new')
    })
  })

  describe('object values', () => {
    it('should store object values', () => {
      const t = new TopTree<number, { name: string }>()
      t.insert(1, { name: 'a' })
      t.insert(2, { name: 'b' })
      expect(t.get(1)!.name).toBe('a')
      expect(t.get(2)!.name).toBe('b')
    })

    it('should store null values', () => {
      const t = new TopTree<number, null>()
      t.insert(1, null)
      expect(t.get(1)).toBeNull()
      expect(t.has(1)).toBe(true)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_TOP_TREE_OPTIONS', () => {
      expect(DEFAULT_TOP_TREE_OPTIONS.aggregate).toBe('sum')
    })

    it('should support TopTreeOptions interface', () => {
      const opts: TopTreeOptions = { aggregate: 'min' }
      expect(opts.aggregate).toBe('min')
    })

    it('should support TopTreeNode interface', () => {
      const node: TopTreeNode<string, number> = {
        key: 'a', value: 1, left: null, right: null, parent: null,
        aggregateSum: 1, aggregateMin: 1, aggregateMax: 1, aggregateCount: 1,
      }
      expect(node.key).toBe('a')
      expect(node.value).toBe(1)
    })

    it('should support TopTreeStats interface', () => {
      const s: TopTreeStats = { nodeCount: 0, height: 0, isBalanced: true, minKey: null, maxKey: null }
      expect(s.nodeCount).toBe(0)
      expect(s.isBalanced).toBe(true)
    })

    it('should support CompareFunction type', () => {
      const cmp: CompareFunction<number> = (a, b) => a - b
      expect(cmp(1, 2)).toBe(-1)
      expect(cmp(2, 1)).toBe(1)
      expect(cmp(1, 1)).toBe(0)
    })

    it('should support AggregateType', () => {
      const agg: AggregateType = 'sum'
      expect(agg).toBe('sum')
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

    it('should maintain sorted order after mixed operations', () => {
      const keys = [50, 25, 75, 12, 37, 62, 87]
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

  describe('pathQuery comprehensive', () => {
    it('should compute correct sum for linear tree', () => {
      tree.insert(1, 10)
      tree.insert(2, 20)
      tree.insert(3, 30)
      expect(tree.pathQuery(1, 3, 'sum')).toBe(60)
    })

    it('should compute correct sum for balanced tree', () => {
      tree.insert(5, 50)
      tree.insert(3, 30)
      tree.insert(7, 70)
      expect(tree.pathQuery(3, 7, 'sum')).toBe(150)
    })

    it('should compute correct sum for complex tree', () => {
      tree.insert(10, 100)
      tree.insert(5, 50)
      tree.insert(15, 150)
      tree.insert(3, 30)
      tree.insert(7, 70)
      expect(tree.pathQuery(3, 7, 'sum')).toBe(150)
    })

    it('should handle path query after deletions', () => {
      tree.insert(5, 50)
      tree.insert(3, 30)
      tree.insert(7, 70)
      tree.delete(7)
      const result = tree.pathQuery(3, 5, 'sum')
      expect(result).toBe(80)
    })

    it('should handle path query with negative values', () => {
      tree.insert(5, -50)
      tree.insert(3, -30)
      tree.insert(7, -70)
      expect(tree.pathQuery(3, 7, 'sum')).toBe(-150)
      expect(tree.pathQuery(3, 7, 'min')).toBe(-70)
      expect(tree.pathQuery(3, 7, 'max')).toBe(-30)
    })

    it('should handle all aggregate types in one tree', () => {
      tree.insert(5, 50)
      tree.insert(3, 30)
      tree.insert(7, 70)
      expect(tree.pathQuery(3, 7, 'sum')).toBe(150)
      expect(tree.pathQuery(3, 7, 'min')).toBe(30)
      expect(tree.pathQuery(3, 7, 'max')).toBe(70)
      expect(tree.pathQuery(3, 7, 'count')).toBe(3)
    })

    it('should override default aggregate type', () => {
      const t = new TopTree<number, number>({ aggregate: 'sum' })
      t.insert(1, 10)
      t.insert(2, 20)
      expect(t.pathQuery(1, 2, 'min')).toBe(10)
      expect(t.pathQuery(1, 2, 'max')).toBe(20)
    })

    it('should handle path query with many nodes', () => {
      for (let i = 1; i <= 100; i++) tree.insert(i, i * 10)
      const result = tree.pathQuery(1, 100, 'sum')
      expect(typeof result).toBe('number')
      expect(result! > 0).toBe(true)
    })
  })

  describe('balance verification', () => {
    it('should verify BST invariants after insertions', () => {
      for (let i = 0; i < 100; i++) tree.insert(i, i)
      expect(tree.validate()).toBe(true)
    })

    it('should verify BST invariants after mixed operations', () => {
      for (let i = 0; i < 100; i++) tree.insert(i, i)
      for (let i = 20; i < 80; i++) tree.delete(i)
      expect(tree.validate()).toBe(true)
    })

    it('should verify invariants after deleting min repeatedly', () => {
      for (let i = 0; i < 20; i++) tree.insert(i, i)
      for (let i = 0; i < 10; i++) {
        const m = tree.min
        if (m) tree.delete(m[0])
      }
      expect(tree.validate()).toBe(true)
      expect(tree.size).toBe(10)
    })

    it('should verify invariants after deleting max repeatedly', () => {
      for (let i = 0; i < 20; i++) tree.insert(i, i)
      for (let i = 0; i < 10; i++) {
        const m = tree.max
        if (m) tree.delete(m[0])
      }
      expect(tree.validate()).toBe(true)
      expect(tree.size).toBe(10)
    })
  })

  describe('splay operations', () => {
    it('should bring accessed node to root', () => {
      tree.insert(1, 10)
      tree.insert(2, 20)
      tree.insert(3, 30)
      tree.get(1)
      expect(tree.min).toEqual([1, 10])
    })

    it('should handle sequential accesses', () => {
      for (let i = 0; i < 20; i++) tree.insert(i, i)
      tree.get(0)
      tree.get(19)
      tree.get(10)
      expect(tree.validate()).toBe(true)
      expect(tree.size).toBe(20)
    })

    it('should maintain BST property after splay', () => {
      const keys = [5, 3, 7, 1, 4, 6, 8]
      for (const k of keys) tree.insert(k, k)
      tree.get(1)
      tree.get(8)
      tree.get(4)
      expect(tree.validate()).toBe(true)
    })

    it('should handle zig-zig pattern', () => {
      tree.insert(3, 30)
      tree.insert(2, 20)
      tree.insert(1, 10)
      tree.get(1)
      expect(tree.validate()).toBe(true)
    })

    it('should handle zig-zag pattern', () => {
      tree.insert(3, 30)
      tree.insert(1, 10)
      tree.insert(2, 20)
      tree.get(2)
      expect(tree.validate()).toBe(true)
    })
  })
})
