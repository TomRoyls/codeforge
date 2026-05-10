import { describe, it, expect, beforeEach } from 'vitest'
import { ThreadedBinaryTree, DEFAULT_THREADED_BINARY_TREE_OPTIONS } from '../../src/core/threaded-binary-tree/threaded-binary-tree.js'
import type { ThreadedBinaryTreeOptions, ThreadedBinaryTreeStatistics } from '../../src/core/threaded-binary-tree/types.js'

describe('ThreadedBinaryTree', () => {
  let tree: ThreadedBinaryTree<number, string>

  beforeEach(() => {
    tree = new ThreadedBinaryTree<number, string>()
  })

  describe('constructor', () => {
    it('should create an empty tree with no arguments', () => {
      const t = new ThreadedBinaryTree<number, string>()
      expect(t.size).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should create tree with custom comparator', () => {
      const t = new ThreadedBinaryTree<string, number>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      t.insert('Hello', 1)
      t.insert('hello', 2)
      expect(t.size).toBe(1)
      expect(t.get('Hello')).toBe(2)
    })

    it('should use default comparator for numbers', () => {
      const t = new ThreadedBinaryTree<number, string>()
      t.insert(3, 'c')
      t.insert(1, 'a')
      t.insert(2, 'b')
      expect(t.toArray()).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
    })

    it('should use default comparator for strings', () => {
      const t = new ThreadedBinaryTree<string, number>()
      t.insert('c', 3)
      t.insert('a', 1)
      t.insert('b', 2)
      expect(t.toArray()).toEqual([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
    })

    it('should accept empty options object', () => {
      const t = new ThreadedBinaryTree<number, string>({})
      expect(t.size).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })
  })

  describe('insert', () => {
    it('should insert a single node', () => {
      tree.insert(1, 'one')
      expect(tree.size).toBe(1)
      expect(tree.get(1)).toBe('one')
    })

    it('should insert multiple nodes in order', () => {
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      tree.insert(3, 'three')
      expect(tree.size).toBe(3)
      expect(tree.inOrderTraversal()).toEqual([
        [1, 'one'],
        [2, 'two'],
        [3, 'three'],
      ])
    })

    it('should insert multiple nodes in reverse order', () => {
      tree.insert(3, 'three')
      tree.insert(2, 'two')
      tree.insert(1, 'one')
      expect(tree.size).toBe(3)
      expect(tree.inOrderTraversal()).toEqual([
        [1, 'one'],
        [2, 'two'],
        [3, 'three'],
      ])
    })

    it('should update value for duplicate key', () => {
      tree.insert(1, 'one')
      tree.insert(1, 'updated')
      expect(tree.size).toBe(1)
      expect(tree.get(1)).toBe('updated')
    })

    it('should not count duplicate insert toward size', () => {
      tree.insert(1, 'one')
      tree.insert(1, 'two')
      expect(tree.size).toBe(1)
    })

    it('should handle inserting without value', () => {
      const t = new ThreadedBinaryTree<number>()
      t.insert(1)
      expect(t.get(1)).toBeUndefined()
      expect(t.size).toBe(1)
    })

    it('should build a left-skewed tree', () => {
      tree.insert(5, 'five')
      tree.insert(4, 'four')
      tree.insert(3, 'three')
      tree.insert(2, 'two')
      tree.insert(1, 'one')
      expect(tree.inOrderTraversal().map(([k]) => k)).toEqual([1, 2, 3, 4, 5])
    })

    it('should build a right-skewed tree', () => {
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      tree.insert(3, 'three')
      tree.insert(4, 'four')
      tree.insert(5, 'five')
      expect(tree.inOrderTraversal().map(([k]) => k)).toEqual([1, 2, 3, 4, 5])
    })

    it('should build a balanced tree', () => {
      tree.insert(3, 'three')
      tree.insert(1, 'one')
      tree.insert(5, 'five')
      tree.insert(2, 'two')
      tree.insert(4, 'four')
      expect(tree.inOrderTraversal().map(([k]) => k)).toEqual([1, 2, 3, 4, 5])
    })

    it('should track insert statistics', () => {
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      tree.insert(3, 'three')
      expect(tree.getStatistics().inserts).toBe(3)
    })

    it('should not count duplicate insert in statistics', () => {
      tree.insert(1, 'one')
      tree.insert(1, 'updated')
      expect(tree.getStatistics().inserts).toBe(1)
    })

    it('should handle many insertions', () => {
      for (let i = 100; i >= 1; i--) {
        tree.insert(i, String(i))
      }
      expect(tree.size).toBe(100)
      const result = tree.inOrderTraversal().map(([k]) => k)
      for (let i = 1; i <= 100; i++) {
        expect(result[i - 1]).toBe(i)
      }
    })

    it('should insert negative numbers', () => {
      tree.insert(-5, 'neg5')
      tree.insert(0, 'zero')
      tree.insert(5, 'pos5')
      expect(tree.inOrderTraversal().map(([k]) => k)).toEqual([-5, 0, 5])
    })
  })

  describe('delete', () => {
    it('should delete a leaf node', () => {
      tree.insert(2, 'two')
      tree.insert(1, 'one')
      tree.insert(3, 'three')
      expect(tree.delete(1)).toBe(true)
      expect(tree.size).toBe(2)
      expect(tree.has(1)).toBe(false)
    })

    it('should delete a node with only right child', () => {
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      tree.insert(3, 'three')
      expect(tree.delete(2)).toBe(true)
      expect(tree.size).toBe(2)
      expect(tree.has(2)).toBe(false)
      expect(tree.inOrderTraversal().map(([k]) => k)).toEqual([1, 3])
    })

    it('should delete a node with only left child', () => {
      tree.insert(3, 'three')
      tree.insert(2, 'two')
      tree.insert(1, 'one')
      expect(tree.delete(2)).toBe(true)
      expect(tree.size).toBe(2)
      expect(tree.has(2)).toBe(false)
      expect(tree.inOrderTraversal().map(([k]) => k)).toEqual([1, 3])
    })

    it('should delete a node with two children', () => {
      tree.insert(2, 'two')
      tree.insert(1, 'one')
      tree.insert(3, 'three')
      expect(tree.delete(2)).toBe(true)
      expect(tree.size).toBe(2)
      expect(tree.inOrderTraversal().map(([k]) => k)).toEqual([1, 3])
    })

    it('should delete the root node', () => {
      tree.insert(1, 'one')
      expect(tree.delete(1)).toBe(true)
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return false for non-existent key', () => {
      tree.insert(1, 'one')
      expect(tree.delete(2)).toBe(false)
      expect(tree.size).toBe(1)
    })

    it('should return false when deleting from empty tree', () => {
      expect(tree.delete(1)).toBe(false)
    })

    it('should maintain correct in-order after multiple deletions', () => {
      for (let i = 1; i <= 7; i++) tree.insert(i, String(i))
      tree.delete(3)
      tree.delete(5)
      expect(tree.inOrderTraversal().map(([k]) => k)).toEqual([1, 2, 4, 6, 7])
    })

    it('should handle deleting all nodes', () => {
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      tree.insert(3, 'three')
      tree.delete(1)
      tree.delete(2)
      tree.delete(3)
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should track delete statistics', () => {
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      tree.delete(1)
      expect(tree.getStatistics().deletes).toBe(1)
    })

    it('should not count failed delete in statistics', () => {
      tree.insert(1, 'one')
      tree.delete(99)
      expect(tree.getStatistics().deletes).toBe(0)
    })

    it('should maintain correct threading after deletion', () => {
      tree.insert(4, 'four')
      tree.insert(2, 'two')
      tree.insert(6, 'six')
      tree.insert(1, 'one')
      tree.insert(3, 'three')
      tree.insert(5, 'five')
      tree.insert(7, 'seven')
      tree.delete(4)
      const result = tree.inOrderTraversal().map(([k]) => k)
      expect(result).toEqual([1, 2, 3, 5, 6, 7])
    })

    it('should handle deleting min element', () => {
      tree.insert(3, 'three')
      tree.insert(1, 'one')
      tree.insert(5, 'five')
      tree.delete(1)
      expect(tree.findMin()).toEqual([3, 'three'])
    })

    it('should handle deleting max element', () => {
      tree.insert(3, 'three')
      tree.insert(1, 'one')
      tree.insert(5, 'five')
      tree.delete(5)
      expect(tree.findMax()).toEqual([3, 'three'])
    })
  })

  describe('has / contains', () => {
    it('should return true for existing key', () => {
      tree.insert(1, 'one')
      expect(tree.has(1)).toBe(true)
    })

    it('should return false for non-existing key', () => {
      tree.insert(1, 'one')
      expect(tree.has(2)).toBe(false)
    })

    it('should return false on empty tree', () => {
      expect(tree.has(1)).toBe(false)
    })

    it('should find keys after multiple insertions', () => {
      for (let i = 1; i <= 10; i++) tree.insert(i, String(i))
      for (let i = 1; i <= 10; i++) {
        expect(tree.has(i)).toBe(true)
      }
      expect(tree.has(11)).toBe(false)
    })

    it('should not find deleted keys', () => {
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      tree.delete(1)
      expect(tree.has(1)).toBe(false)
      expect(tree.has(2)).toBe(true)
    })

    it('contains should behave same as has', () => {
      tree.insert(1, 'one')
      expect(tree.contains(1)).toBe(true)
      expect(tree.contains(2)).toBe(false)
    })

    it('should increment lookup statistics', () => {
      tree.insert(1, 'one')
      tree.has(1)
      tree.has(2)
      expect(tree.getStatistics().lookups).toBe(2)
    })
  })

  describe('get', () => {
    it('should return value for existing key', () => {
      tree.insert(1, 'one')
      expect(tree.get(1)).toBe('one')
    })

    it('should return undefined for non-existing key', () => {
      expect(tree.get(1)).toBeUndefined()
    })

    it('should return updated value after re-insert', () => {
      tree.insert(1, 'one')
      tree.insert(1, 'updated')
      expect(tree.get(1)).toBe('updated')
    })

    it('should return undefined for deleted key', () => {
      tree.insert(1, 'one')
      tree.delete(1)
      expect(tree.get(1)).toBeUndefined()
    })

    it('should increment lookup statistics', () => {
      tree.insert(1, 'one')
      tree.get(1)
      tree.get(2)
      expect(tree.getStatistics().lookups).toBe(2)
    })
  })

  describe('findMin / findMax', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.findMin()).toBeUndefined()
      expect(tree.findMax()).toBeUndefined()
    })

    it('should return root when only one node', () => {
      tree.insert(5, 'five')
      expect(tree.findMin()).toEqual([5, 'five'])
      expect(tree.findMax()).toEqual([5, 'five'])
    })

    it('should find min in a multi-node tree', () => {
      tree.insert(5, 'five')
      tree.insert(3, 'three')
      tree.insert(7, 'seven')
      tree.insert(1, 'one')
      expect(tree.findMin()).toEqual([1, 'one'])
    })

    it('should find max in a multi-node tree', () => {
      tree.insert(5, 'five')
      tree.insert(3, 'three')
      tree.insert(7, 'seven')
      tree.insert(9, 'nine')
      expect(tree.findMax()).toEqual([9, 'nine'])
    })

    it('should update min after deletion', () => {
      tree.insert(3, 'three')
      tree.insert(1, 'one')
      tree.insert(5, 'five')
      tree.delete(1)
      expect(tree.findMin()).toEqual([3, 'three'])
    })

    it('should update max after deletion', () => {
      tree.insert(3, 'three')
      tree.insert(1, 'one')
      tree.insert(5, 'five')
      tree.delete(5)
      expect(tree.findMax()).toEqual([3, 'three'])
    })
  })

  describe('findPredecessor / findSuccessor', () => {
    beforeEach(() => {
      tree.insert(5, 'five')
      tree.insert(3, 'three')
      tree.insert(7, 'seven')
      tree.insert(2, 'two')
      tree.insert(4, 'four')
      tree.insert(6, 'six')
      tree.insert(8, 'eight')
    })

    it('should find successor of root', () => {
      expect(tree.findSuccessor(5)).toEqual([6, 'six'])
    })

    it('should find predecessor of root', () => {
      expect(tree.findPredecessor(5)).toEqual([4, 'four'])
    })

    it('should return undefined for predecessor of min', () => {
      expect(tree.findPredecessor(2)).toBeUndefined()
    })

    it('should return undefined for successor of max', () => {
      expect(tree.findSuccessor(8)).toBeUndefined()
    })

    it('should find successor of leaf node', () => {
      expect(tree.findSuccessor(4)).toEqual([5, 'five'])
    })

    it('should find predecessor of leaf node', () => {
      expect(tree.findPredecessor(6)).toEqual([5, 'five'])
    })

    it('should return undefined for non-existent key predecessor', () => {
      expect(tree.findPredecessor(99)).toBeUndefined()
    })

    it('should return undefined for non-existent key successor', () => {
      expect(tree.findSuccessor(99)).toBeUndefined()
    })

    it('should use threads for successor lookup', () => {
      const beforeThreads = tree.getStatistics().threadsUsed
      tree.findSuccessor(2)
      expect(tree.getStatistics().threadsUsed).toBeGreaterThan(beforeThreads)
    })

    it('should use threads for predecessor lookup', () => {
      const beforeThreads = tree.getStatistics().threadsUsed
      tree.findPredecessor(8)
      expect(tree.getStatistics().threadsUsed).toBeGreaterThan(beforeThreads)
    })

    it('should increment lookups for predecessor', () => {
      const beforeLookups = tree.getStatistics().lookups
      tree.findPredecessor(5)
      expect(tree.getStatistics().lookups).toBe(beforeLookups + 1)
    })

    it('should increment lookups for successor', () => {
      const beforeLookups = tree.getStatistics().lookups
      tree.findSuccessor(5)
      expect(tree.getStatistics().lookups).toBe(beforeLookups + 1)
    })
  })

  describe('inOrderTraversal', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.inOrderTraversal()).toEqual([])
    })

    it('should return single element for single node', () => {
      tree.insert(1, 'one')
      expect(tree.inOrderTraversal()).toEqual([[1, 'one']])
    })

    it('should return sorted order for multiple elements', () => {
      tree.insert(3, 'three')
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      expect(tree.inOrderTraversal()).toEqual([
        [1, 'one'],
        [2, 'two'],
        [3, 'three'],
      ])
    })

    it('should handle large tree', () => {
      const keys = [5, 3, 7, 1, 4, 6, 8, 2]
      for (const k of keys) tree.insert(k, String(k))
      const result = tree.inOrderTraversal().map(([k]) => k)
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    })

    it('should use threads during traversal', () => {
      tree.insert(3, 'three')
      tree.insert(1, 'one')
      tree.insert(5, 'five')
      const beforeThreads = tree.getStatistics().threadsUsed
      tree.inOrderTraversal()
      expect(tree.getStatistics().threadsUsed).toBeGreaterThan(beforeThreads)
    })
  })

  describe('preOrderTraversal', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.preOrderTraversal()).toEqual([])
    })

    it('should return root first', () => {
      tree.insert(2, 'two')
      tree.insert(1, 'one')
      tree.insert(3, 'three')
      expect(tree.preOrderTraversal()[0]![0]).toBe(2)
    })

    it('should return correct pre-order for balanced tree', () => {
      tree.insert(4, 'four')
      tree.insert(2, 'two')
      tree.insert(6, 'six')
      tree.insert(1, 'one')
      tree.insert(3, 'three')
      tree.insert(5, 'five')
      tree.insert(7, 'seven')
      const keys = tree.preOrderTraversal().map(([k]) => k)
      expect(keys[0]).toBe(4)
      expect(keys).toContain(1)
      expect(keys).toContain(7)
    })

    it('should handle single node tree', () => {
      tree.insert(1, 'one')
      expect(tree.preOrderTraversal()).toEqual([[1, 'one']])
    })
  })

  describe('postOrderTraversal', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.postOrderTraversal()).toEqual([])
    })

    it('should return root last', () => {
      tree.insert(2, 'two')
      tree.insert(1, 'one')
      tree.insert(3, 'three')
      const result = tree.postOrderTraversal()
      expect(result[result.length - 1]![0]).toBe(2)
    })

    it('should return correct post-order', () => {
      tree.insert(2, 'two')
      tree.insert(1, 'one')
      tree.insert(3, 'three')
      const keys = tree.postOrderTraversal().map(([k]) => k)
      expect(keys).toEqual([1, 3, 2])
    })

    it('should handle single node tree', () => {
      tree.insert(1, 'one')
      expect(tree.postOrderTraversal()).toEqual([[1, 'one']])
    })
  })

  describe('reverseOrderTraversal', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.reverseOrderTraversal()).toEqual([])
    })

    it('should return descending order', () => {
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      tree.insert(3, 'three')
      expect(tree.reverseOrderTraversal().map(([k]) => k)).toEqual([3, 2, 1])
    })

    it('should use threads during reverse traversal', () => {
      tree.insert(3, 'three')
      tree.insert(1, 'one')
      tree.insert(5, 'five')
      const beforeThreads = tree.getStatistics().threadsUsed
      tree.reverseOrderTraversal()
      expect(tree.getStatistics().threadsUsed).toBeGreaterThan(beforeThreads)
    })

    it('should handle single node tree', () => {
      tree.insert(1, 'one')
      expect(tree.reverseOrderTraversal()).toEqual([[1, 'one']])
    })
  })

  describe('forEach', () => {
    it('should not call callback on empty tree', () => {
      let count = 0
      tree.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should iterate all elements in order', () => {
      tree.insert(3, 'three')
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      const keys: number[] = []
      tree.forEach((_v, k) => keys.push(k))
      expect(keys).toEqual([1, 2, 3])
    })

    it('should pass correct values', () => {
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      const values: string[] = []
      tree.forEach((v) => { values.push(v as string) })
      expect(values).toEqual(['one', 'two'])
    })

    it('should iterate with undefined values', () => {
      const t = new ThreadedBinaryTree<number>()
      t.insert(1)
      t.insert(2)
      const entries: [number, unknown][] = []
      t.forEach((v, k) => entries.push([k, v]))
      expect(entries).toEqual([[1, undefined], [2, undefined]])
    })

    it('should use threads during iteration', () => {
      tree.insert(3, 'three')
      tree.insert(1, 'one')
      tree.insert(5, 'five')
      const beforeThreads = tree.getStatistics().threadsUsed
      tree.forEach(() => {})
      expect(tree.getStatistics().threadsUsed).toBeGreaterThan(beforeThreads)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.toArray()).toEqual([])
    })

    it('should return in-order array', () => {
      tree.insert(3, 'three')
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      expect(tree.toArray()).toEqual(tree.inOrderTraversal())
    })

    it('should reflect modifications', () => {
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      tree.delete(1)
      expect(tree.toArray()).toEqual([[2, 'two']])
    })
  })

  describe('clear', () => {
    it('should clear an empty tree', () => {
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should clear a non-empty tree', () => {
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.has(1)).toBe(false)
    })

    it('should reset statistics', () => {
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      tree.delete(1)
      tree.has(2)
      tree.clear()
      const stats = tree.getStatistics()
      expect(stats.inserts).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.lookups).toBe(0)
      expect(stats.threadsUsed).toBe(0)
    })

    it('should allow insertions after clear', () => {
      tree.insert(1, 'one')
      tree.clear()
      tree.insert(2, 'two')
      expect(tree.size).toBe(1)
      expect(tree.get(2)).toBe('two')
    })
  })

  describe('size / getNodeCount', () => {
    it('should return 0 for empty tree', () => {
      expect(tree.size).toBe(0)
      expect(tree.getNodeCount()).toBe(0)
    })

    it('should return correct size after insertions', () => {
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      tree.insert(3, 'three')
      expect(tree.size).toBe(3)
      expect(tree.getNodeCount()).toBe(3)
    })

    it('should update after deletion', () => {
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      tree.delete(1)
      expect(tree.size).toBe(1)
    })

    it('getNodeCount should equal size', () => {
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      expect(tree.getNodeCount()).toBe(tree.size)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new tree', () => {
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return false after insertion', () => {
      tree.insert(1, 'one')
      expect(tree.isEmpty()).toBe(false)
    })

    it('should return true after clearing all', () => {
      tree.insert(1, 'one')
      tree.delete(1)
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('height', () => {
    it('should return -1 for empty tree', () => {
      expect(tree.height()).toBe(-1)
    })

    it('should return 0 for single node', () => {
      tree.insert(1, 'one')
      expect(tree.height()).toBe(0)
    })

    it('should return correct height for balanced tree', () => {
      tree.insert(2, 'two')
      tree.insert(1, 'one')
      tree.insert(3, 'three')
      expect(tree.height()).toBe(1)
    })

    it('should return correct height for skewed tree', () => {
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      tree.insert(3, 'three')
      tree.insert(4, 'four')
      expect(tree.height()).toBe(3)
    })

    it('should update after deletion', () => {
      tree.insert(3, 'three')
      tree.insert(2, 'two')
      tree.insert(1, 'one')
      tree.delete(2)
      expect(tree.height()).toBe(1)
    })

    it('should return -1 after clearing', () => {
      tree.insert(1, 'one')
      tree.clear()
      expect(tree.height()).toBe(-1)
    })
  })

  describe('rangeQuery', () => {
    beforeEach(() => {
      tree.insert(5, 'five')
      tree.insert(3, 'three')
      tree.insert(7, 'seven')
      tree.insert(1, 'one')
      tree.insert(9, 'nine')
      tree.insert(2, 'two')
      tree.insert(4, 'four')
      tree.insert(6, 'six')
      tree.insert(8, 'eight')
    })

    it('should return empty for empty tree', () => {
      const t = new ThreadedBinaryTree<number, string>()
      expect(t.rangeQuery(1, 5)).toEqual([])
    })

    it('should return all elements in range', () => {
      const result = tree.rangeQuery(3, 7).map(([k]) => k)
      expect(result).toEqual([3, 4, 5, 6, 7])
    })

    it('should return single element for exact match range', () => {
      const result = tree.rangeQuery(5, 5).map(([k]) => k)
      expect(result).toEqual([5])
    })

    it('should return empty for range with no matches', () => {
      const result = tree.rangeQuery(10, 20)
      expect(result).toEqual([])
    })

    it('should return empty when min > max', () => {
      expect(tree.rangeQuery(5, 1)).toEqual([])
    })

    it('should return all elements when range covers everything', () => {
      const result = tree.rangeQuery(1, 9).map(([k]) => k)
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should include values in range query results', () => {
      const result = tree.rangeQuery(3, 5)
      expect(result).toEqual([
        [3, 'three'],
        [4, 'four'],
        [5, 'five'],
      ])
    })

    it('should handle range at boundaries', () => {
      const result = tree.rangeQuery(1, 3).map(([k]) => k)
      expect(result).toEqual([1, 2, 3])
    })

    it('should handle range at upper boundary', () => {
      const result = tree.rangeQuery(7, 9).map(([k]) => k)
      expect(result).toEqual([7, 8, 9])
    })

    it('should work with string keys', () => {
      const t = new ThreadedBinaryTree<string, number>()
      t.insert('c', 3)
      t.insert('a', 1)
      t.insert('e', 5)
      t.insert('b', 2)
      t.insert('d', 4)
      const result = t.rangeQuery('b', 'd')
      expect(result).toEqual([
        ['b', 2],
        ['c', 3],
        ['d', 4],
      ])
    })
  })

  describe('getStatistics', () => {
    it('should return initial statistics', () => {
      const stats = tree.getStatistics()
      expect(stats).toEqual({
        inserts: 0,
        deletes: 0,
        lookups: 0,
        rotations: 0,
        threadsUsed: 0,
      })
    })

    it('should track inserts', () => {
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      expect(tree.getStatistics().inserts).toBe(2)
    })

    it('should track deletes', () => {
      tree.insert(1, 'one')
      tree.delete(1)
      expect(tree.getStatistics().deletes).toBe(1)
    })

    it('should track lookups', () => {
      tree.insert(1, 'one')
      tree.get(1)
      tree.has(1)
      expect(tree.getStatistics().lookups).toBe(2)
    })

    it('should track rotations as always 0 for plain BST', () => {
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      tree.insert(3, 'three')
      expect(tree.getStatistics().rotations).toBe(0)
    })

    it('should track threadsUsed', () => {
      tree.insert(3, 'three')
      tree.insert(1, 'one')
      tree.insert(5, 'five')
      const before = tree.getStatistics().threadsUsed
      tree.inOrderTraversal()
      expect(tree.getStatistics().threadsUsed).toBeGreaterThan(before)
    })

    it('should return a copy of statistics', () => {
      tree.insert(1, 'one')
      const stats1 = tree.getStatistics()
      tree.insert(2, 'two')
      const stats2 = tree.getStatistics()
      expect(stats1.inserts).toBe(1)
      expect(stats2.inserts).toBe(2)
    })
  })

  describe('Symbol.iterator', () => {
    it('should iterate empty tree', () => {
      const result = [...tree]
      expect(result).toEqual([])
    })

    it('should iterate single element', () => {
      tree.insert(1, 'one')
      const result = [...tree]
      expect(result).toEqual([[1, 'one']])
    })

    it('should iterate in-order', () => {
      tree.insert(3, 'three')
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      const result = [...tree]
      expect(result).toEqual([
        [1, 'one'],
        [2, 'two'],
        [3, 'three'],
      ])
    })

    it('should work with for-of loop', () => {
      tree.insert(2, 'two')
      tree.insert(1, 'one')
      tree.insert(3, 'three')
      const keys: number[] = []
      for (const [key] of tree) {
        keys.push(key)
      }
      expect(keys).toEqual([1, 2, 3])
    })

    it('should work with destructuring', () => {
      tree.insert(1, 'one')
      const [[key, value]] = [...tree]
      expect(key).toBe(1)
      expect(value).toBe('one')
    })
  })

  describe('threading behavior', () => {
    it('should enable O(1) successor access via threads', () => {
      tree.insert(4, 'four')
      tree.insert(2, 'two')
      tree.insert(6, 'six')
      tree.insert(1, 'one')
      tree.insert(3, 'three')
      tree.insert(5, 'five')
      tree.insert(7, 'seven')
      const beforeThreads = tree.getStatistics().threadsUsed
      const succ = tree.findSuccessor(1)
      expect(succ).toEqual([2, 'two'])
      expect(tree.getStatistics().threadsUsed).toBeGreaterThan(beforeThreads)
    })

    it('should enable O(1) predecessor access via threads', () => {
      tree.insert(4, 'four')
      tree.insert(2, 'two')
      tree.insert(6, 'six')
      tree.insert(1, 'one')
      tree.insert(3, 'three')
      tree.insert(5, 'five')
      tree.insert(7, 'seven')
      const beforeThreads = tree.getStatistics().threadsUsed
      const pred = tree.findPredecessor(7)
      expect(pred).toEqual([6, 'six'])
      expect(tree.getStatistics().threadsUsed).toBeGreaterThan(beforeThreads)
    })

    it('should maintain correct threads after insertions', () => {
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      tree.insert(3, 'three')
      tree.insert(4, 'four')
      tree.insert(5, 'five')
      expect(tree.findSuccessor(1)).toEqual([2, 'two'])
      expect(tree.findSuccessor(2)).toEqual([3, 'three'])
      expect(tree.findSuccessor(3)).toEqual([4, 'four'])
      expect(tree.findSuccessor(4)).toEqual([5, 'five'])
      expect(tree.findSuccessor(5)).toBeUndefined()
    })

    it('should maintain correct threads after deletions', () => {
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      tree.insert(3, 'three')
      tree.insert(4, 'four')
      tree.insert(5, 'five')
      tree.insert(6, 'six')
      tree.insert(7, 'seven')
      tree.delete(3)
      tree.delete(5)
      expect(tree.findSuccessor(2)).toEqual([4, 'four'])
      expect(tree.findPredecessor(6)).toEqual([4, 'four'])
    })

    it('should maintain threads through complete tree lifecycle', () => {
      tree.insert(5, 'five')
      tree.insert(3, 'three')
      tree.insert(7, 'seven')
      tree.delete(3)
      tree.insert(2, 'two')
      tree.insert(4, 'four')
      tree.delete(7)
      expect(tree.inOrderTraversal().map(([k]) => k)).toEqual([2, 4, 5])
      expect(tree.findPredecessor(4)).toEqual([2, 'two'])
      expect(tree.findSuccessor(4)).toEqual([5, 'five'])
    })
  })

  describe('DEFAULT_THREADED_BINARY_TREE_OPTIONS', () => {
    it('should be an empty object', () => {
      expect(DEFAULT_THREADED_BINARY_TREE_OPTIONS).toEqual({})
    })

    it('should have undefined comparator', () => {
      expect(DEFAULT_THREADED_BINARY_TREE_OPTIONS.comparator).toBeUndefined()
    })
  })

  describe('type exports', () => {
    it('should export ThreadedBinaryTreeOptions type', () => {
      const opts: ThreadedBinaryTreeOptions<number> = {
        comparator: (a, b) => a - b,
      }
      const t = new ThreadedBinaryTree<number, string>(opts)
      t.insert(1, 'one')
      expect(t.get(1)).toBe('one')
    })

    it('should export ThreadedBinaryTreeStatistics type', () => {
      tree.insert(1, 'one')
      const stats: ThreadedBinaryTreeStatistics = tree.getStatistics()
      expect(stats.inserts).toBe(1)
    })
  })

  describe('stress tests', () => {
    it('should handle sequential insertions and deletions', () => {
      for (let i = 1; i <= 50; i++) tree.insert(i, String(i))
      expect(tree.size).toBe(50)
      for (let i = 1; i <= 25; i++) tree.delete(i)
      expect(tree.size).toBe(25)
      expect(tree.findMin()).toEqual([26, '26'])
      expect(tree.findMax()).toEqual([50, '50'])
    })

    it('should handle alternating insertions and deletions', () => {
      for (let i = 1; i <= 20; i++) {
        tree.insert(i, String(i))
        if (i % 3 === 0) tree.delete(i)
      }
      expect(tree.has(3)).toBe(false)
      expect(tree.has(6)).toBe(false)
      expect(tree.has(18)).toBe(false)
      expect(tree.has(20)).toBe(true)
    })

    it('should handle reverse order insertions', () => {
      for (let i = 50; i >= 1; i--) tree.insert(i, String(i))
      const result = tree.inOrderTraversal().map(([k]) => k)
      expect(result[0]).toBe(1)
      expect(result[49]).toBe(50)
      expect(result.length).toBe(50)
    })

    it('should maintain correct traversal after complex operations', () => {
      const keys = [5, 3, 7, 1, 9, 2, 8, 4, 6]
      for (const k of keys) tree.insert(k, String(k))
      tree.delete(5)
      tree.delete(1)
      tree.insert(10, 'ten')
      tree.insert(0, 'zero')
      const inOrder = tree.inOrderTraversal().map(([k]) => k)
      for (let i = 0; i < inOrder.length - 1; i++) {
        expect(inOrder[i]! < inOrder[i + 1]!).toBe(true)
      }
    })
  })
})
