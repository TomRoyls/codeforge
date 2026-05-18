import { LeftistTree } from '../src/core/leftist-tree/index.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('LeftistTree', () => {
  describe('constructor', () => {
    it('creates an empty tree', () => {
      const tree = new LeftistTree<number>()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('accepts custom comparator', () => {
      const tree = new LeftistTree<number>((a, b) => b - a)
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.extractMin()).toBe(3)
    })
  })

  // ─── Insert ──────────────────────────────────────────────────────────────

  describe('insert', () => {
    it('inserts a single element', () => {
      const tree = new LeftistTree<number>()
      tree.insert(10)
      expect(tree.size).toBe(1)
      expect(tree.peek()).toBe(10)
    })

    it('inserts multiple elements maintaining min-heap', () => {
      const tree = new LeftistTree<number>()
      tree.insert(30)
      tree.insert(10)
      tree.insert(20)
      expect(tree.peek()).toBe(10)
    })
  })

  // ─── ExtractMin ──────────────────────────────────────────────────────────

  describe('extractMin', () => {
    it('extracts elements in sorted order', () => {
      const tree = new LeftistTree<number>()
      tree.insert(30)
      tree.insert(10)
      tree.insert(20)
      expect(tree.extractMin()).toBe(10)
      expect(tree.extractMin()).toBe(20)
      expect(tree.extractMin()).toBe(30)
    })

    it('returns undefined for empty tree', () => {
      const tree = new LeftistTree<number>()
      expect(tree.extractMin()).toBe(undefined)
    })

    it('handles single element', () => {
      const tree = new LeftistTree<number>()
      tree.insert(42)
      expect(tree.extractMin()).toBe(42)
      expect(tree.isEmpty()).toBe(true)
    })
  })

  // ─── Peek ────────────────────────────────────────────────────────────────

  describe('peek', () => {
    it('returns minimum without removing', () => {
      const tree = new LeftistTree<number>()
      tree.insert(5)
      tree.insert(3)
      expect(tree.peek()).toBe(3)
      expect(tree.size).toBe(2)
    })

    it('returns undefined for empty tree', () => {
      const tree = new LeftistTree<number>()
      expect(tree.peek()).toBe(undefined)
    })
  })

  // ─── Merge ───────────────────────────────────────────────────────────────

  describe('merge', () => {
    it('merges two trees', () => {
      const tree1 = new LeftistTree<number>()
      tree1.insert(10)
      tree1.insert(30)
      const tree2 = new LeftistTree<number>()
      tree2.insert(20)
      tree2.insert(5)
      tree1.merge(tree2)
      expect(tree1.size).toBe(4)
      expect(tree1.extractMin()).toBe(5)
      expect(tree2.isEmpty()).toBe(true)
    })
  })

  // ─── DecreaseKey ─────────────────────────────────────────────────────────

  describe('decreaseKey', () => {
    it('decreases key and restructures', () => {
      const tree = new LeftistTree<number>()
      tree.insert(10)
      const node = tree.getNode(10)
      expect(node).toBeDefined()
      expect(tree.decreaseKey(node!, 5)).toBe(true)
      expect(tree.peek()).toBe(5)
    })

    it('returns false for non-existent node', () => {
      const tree = new LeftistTree<number>()
      tree.insert(10)
      expect(tree.decreaseKey({ value: 99, rank: 1, left: null, right: null }, 5)).toBe(false)
    })
  })

  // ─── Delete ──────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('deletes a node from tree', () => {
      const tree = new LeftistTree<number>()
      tree.insert(10)
      tree.insert(20)
      const node = tree.getNode(10)
      tree.delete(node!)
      expect(tree.size).toBe(1)
      expect(tree.peek()).toBe(20)
    })
  })

  // ─── Utility Methods ─────────────────────────────────────────────────────

  describe('utility methods', () => {
    it('clear empties tree', () => {
      const tree = new LeftistTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.clear()
      expect(tree.isEmpty()).toBe(true)
      expect(tree.size).toBe(0)
    })

    it('toArray returns sorted elements', () => {
      const tree = new LeftistTree<number>()
      tree.insert(30)
      tree.insert(10)
      tree.insert(20)
      expect(tree.toArray()).toEqual([10, 20, 30])
    })

    it('getNode finds node by value', () => {
      const tree = new LeftistTree<number>()
      tree.insert(42)
      expect(tree.getNode(42)).toBeDefined()
      expect(tree.getNode(99)).toBeUndefined()
    })
  })
})
