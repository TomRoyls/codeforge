import { beforeEach, describe, expect, it } from 'vitest'
import { RedBlackTree, type RBNode } from '../src/utils/red-black-tree.js'

function blackHeight<K, V>(node: RBNode<K, V> | null): number {
  if (node === null) return 1
  const left = blackHeight(node.left)
  const right = blackHeight(node.right)
  if (left !== right) return -1
  return left + (node.color === 'black' ? 1 : 0)
}

function hasNoRedRed<K, V>(node: RBNode<K, V> | null): boolean {
  if (node === null) return true
  if (node.color === 'red') {
    if (node.left !== null && node.left.color === 'red') return false
    if (node.right !== null && node.right.color === 'red') return false
  }
  return hasNoRedRed(node.left) && hasNoRedRed(node.right)
}

// ─── Constructor ───

describe('RedBlackTree', () => {
  describe('constructor', () => {
    it('creates tree with default number comparator', () => {
      const tree = new RedBlackTree<number, string>()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('creates tree with custom comparator', () => {
      const tree = new RedBlackTree<string, number>((a, b) => a.localeCompare(b))
      tree.insert('banana', 2)
      tree.insert('apple', 1)
      expect(tree.min).toBe('apple')
      expect(tree.max).toBe('banana')
    })
  })

  // ─── Insert ───

  describe('insert', () => {
    it('adds nodes and increments size', () => {
      const tree = new RedBlackTree<number, string>()
      tree.insert(5, 'five')
      expect(tree.size).toBe(1)
      tree.insert(3, 'three')
      expect(tree.size).toBe(2)
      tree.insert(7, 'seven')
      expect(tree.size).toBe(3)
    })

    it('handles single element', () => {
      const tree = new RedBlackTree<number, string>()
      tree.insert(10, 'ten')
      expect(tree.find(10)).toBe('ten')
      expect(tree.size).toBe(1)
    })
  })

  // ─── Find ───

  describe('find', () => {
    it('returns value for existing key', () => {
      const tree = new RedBlackTree<number, string>()
      tree.insert(5, 'five')
      tree.insert(3, 'three')
      tree.insert(7, 'seven')
      expect(tree.find(5)).toBe('five')
      expect(tree.find(3)).toBe('three')
      expect(tree.find(7)).toBe('seven')
    })

    it('returns undefined for missing key', () => {
      const tree = new RedBlackTree<number, string>()
      tree.insert(1, 'one')
      expect(tree.find(99)).toBeUndefined()
      expect(tree.find(0)).toBeUndefined()
    })

    it('returns undefined on empty tree', () => {
      const tree = new RedBlackTree<number, string>()
      expect(tree.find(1)).toBeUndefined()
    })
  })

  // ─── Contains ───

  describe('contains', () => {
    it('returns true for existing key', () => {
      const tree = new RedBlackTree<number, string>()
      tree.insert(5, 'five')
      expect(tree.contains(5)).toBe(true)
    })

    it('returns false for missing key', () => {
      const tree = new RedBlackTree<number, string>()
      tree.insert(5, 'five')
      expect(tree.contains(99)).toBe(false)
    })
  })

  // ─── Min / Max ───

  describe('min/max', () => {
    it('returns correct min and max', () => {
      const tree = new RedBlackTree<number, string>()
      tree.insert(5, 'five')
      tree.insert(3, 'three')
      tree.insert(7, 'seven')
      tree.insert(1, 'one')
      tree.insert(9, 'nine')
      expect(tree.min).toBe(1)
      expect(tree.max).toBe(9)
    })

    it('returns undefined on empty tree', () => {
      const tree = new RedBlackTree<number, string>()
      expect(tree.min).toBeUndefined()
      expect(tree.max).toBeUndefined()
    })
  })

  // ─── InOrder ───

  describe('inOrder', () => {
    it('returns elements in sorted order', () => {
      const tree = new RedBlackTree<number, string>()
      tree.insert(5, 'five')
      tree.insert(3, 'three')
      tree.insert(7, 'seven')
      tree.insert(1, 'one')
      tree.insert(9, 'nine')
      const result = tree.inOrder()
      expect(result.map((e) => e.key)).toEqual([1, 3, 5, 7, 9])
      expect(result.map((e) => e.value)).toEqual(['one', 'three', 'five', 'seven', 'nine'])
    })

    it('returns empty array for empty tree', () => {
      const tree = new RedBlackTree<number, string>()
      expect(tree.inOrder()).toEqual([])
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('empties the tree', () => {
      const tree = new RedBlackTree<number, string>()
      tree.insert(1, 'a')
      tree.insert(2, 'b')
      tree.insert(3, 'c')
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.inOrder()).toEqual([])
      expect(tree.find(1)).toBeUndefined()
    })
  })

  // ─── IsEmpty ───

  describe('isEmpty', () => {
    it('returns true for new tree', () => {
      const tree = new RedBlackTree<number, string>()
      expect(tree.isEmpty()).toBe(true)
    })

    it('returns false after insert', () => {
      const tree = new RedBlackTree<number, string>()
      tree.insert(1, 'one')
      expect(tree.isEmpty()).toBe(false)
    })

    it('returns true after clear', () => {
      const tree = new RedBlackTree<number, string>()
      tree.insert(1, 'one')
      tree.clear()
      expect(tree.isEmpty()).toBe(true)
    })
  })

  // ─── Balance Verification ───

  describe('balance verification', () => {
    it('height stays within 2*log2(n+1) after sequential inserts 1..15', () => {
      const tree = new RedBlackTree<number, number>()
      for (let i = 1; i <= 15; i++) {
        tree.insert(i, i)
      }
      expect(tree.size).toBe(15)
      const maxHeight = 2 * Math.ceil(Math.log2(16))
      expect(tree.height).toBeLessThanOrEqual(maxHeight)
    })

    it('height stays balanced for reverse sequential inserts', () => {
      const tree = new RedBlackTree<number, number>()
      for (let i = 15; i >= 1; i--) {
        tree.insert(i, i)
      }
      const maxHeight = 2 * Math.ceil(Math.log2(16))
      expect(tree.height).toBeLessThanOrEqual(maxHeight)
    })
  })

  // ─── Duplicate Key ───

  describe('duplicate key', () => {
    it('updates value without changing size', () => {
      const tree = new RedBlackTree<number, string>()
      tree.insert(5, 'five')
      expect(tree.size).toBe(1)
      tree.insert(5, 'FIVE')
      expect(tree.size).toBe(1)
      expect(tree.find(5)).toBe('FIVE')
    })
  })

  // ─── Red-Black Properties ───

  describe('red-black properties', () => {
    it('all paths from root to leaf have same black-height', () => {
      const tree = new RedBlackTree<number, number>()
      for (let i = 1; i <= 20; i++) {
        tree.insert(i, i)
      }
      const bh = blackHeight(tree.getRoot())
      expect(bh).toBeGreaterThan(0)
    })

    it('no red node has a red child', () => {
      const tree = new RedBlackTree<number, number>()
      for (let i = 1; i <= 20; i++) {
        tree.insert(i, i)
      }
      expect(hasNoRedRed(tree.getRoot())).toBe(true)
    })

    it('root is always black after multiple inserts', () => {
      const tree = new RedBlackTree<number, number>()
      for (let i = 1; i <= 10; i++) {
        tree.insert(i, i)
        expect(tree.getRoot()!.color).toBe('black')
      }
    })
  })

  // ─── Custom Comparator ───

  describe('custom comparator with string keys', () => {
    it('works with string keys', () => {
      const tree = new RedBlackTree<string, number>((a, b) => a.localeCompare(b))
      tree.insert('cherry', 3)
      tree.insert('apple', 1)
      tree.insert('banana', 2)
      tree.insert('date', 4)
      expect(tree.size).toBe(4)
      expect(tree.min).toBe('apple')
      expect(tree.max).toBe('date')
      expect(tree.find('banana')).toBe(2)
      expect(tree.inOrder().map((e) => e.key)).toEqual(['apple', 'banana', 'cherry', 'date'])
    })
  })

  // ─── Delete ───

  describe('delete', () => {
    it('deletes a leaf node', () => {
      const tree = new RedBlackTree<number, string>()
      tree.insert(5, 'five')
      tree.insert(3, 'three')
      tree.insert(7, 'seven')
      expect(tree.delete(3)).toBe(true)
      expect(tree.size).toBe(2)
      expect(tree.contains(3)).toBe(false)
    })

    it('deletes the root', () => {
      const tree = new RedBlackTree<number, string>()
      tree.insert(5, 'five')
      tree.insert(3, 'three')
      tree.insert(7, 'seven')
      expect(tree.delete(5)).toBe(true)
      expect(tree.size).toBe(2)
      expect(tree.contains(5)).toBe(false)
    })

    it('returns false for missing key', () => {
      const tree = new RedBlackTree<number, string>()
      tree.insert(1, 'one')
      expect(tree.delete(99)).toBe(false)
      expect(tree.size).toBe(1)
    })

    it('maintains inOrder after deletions', () => {
      const tree = new RedBlackTree<number, number>()
      for (let i = 1; i <= 10; i++) tree.insert(i, i)
      tree.delete(3)
      tree.delete(7)
      tree.delete(1)
      expect(tree.inOrder().map((e) => e.key)).toEqual([2, 4, 5, 6, 8, 9, 10])
    })

    it('maintains red-black properties after deletions', () => {
      const tree = new RedBlackTree<number, number>()
      for (let i = 1; i <= 15; i++) tree.insert(i, i)
      tree.delete(5)
      tree.delete(10)
      tree.delete(1)
      tree.delete(15)
      expect(hasNoRedRed(tree.getRoot())).toBe(true)
      const bh = blackHeight(tree.getRoot())
      expect(bh).toBeGreaterThan(0)
      if (tree.getRoot()) {
        expect(tree.getRoot()!.color).toBe('black')
      }
    })

    it('can delete all nodes', () => {
      const tree = new RedBlackTree<number, number>()
      tree.insert(1, 1)
      tree.insert(2, 2)
      tree.insert(3, 3)
      expect(tree.delete(2)).toBe(true)
      expect(tree.delete(1)).toBe(true)
      expect(tree.delete(3)).toBe(true)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.size).toBe(0)
    })
  })

  // ─── Height property ───

  describe('height', () => {
    it('returns 0 for empty tree', () => {
      const tree = new RedBlackTree<number, string>()
      expect(tree.height).toBe(0)
    })

    it('returns 1 for single node', () => {
      const tree = new RedBlackTree<number, string>()
      tree.insert(1, 'one')
      expect(tree.height).toBe(1)
    })
  })
})
