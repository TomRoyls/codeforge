import { describe, it, expect } from 'vitest'
import { BinaryLifting } from '../src/core/binary-lifting/binary-lifting.js'

describe('BinaryLifting', () => {
  describe('constructor with parents', () => {
    it('builds from parents array (linear chain)', () => {
      const bl = new BinaryLifting(5, { parents: [-1, 0, 1, 2, 3] })
      expect(bl.depth(0)).toBe(0)
      expect(bl.depth(4)).toBe(4)
    })

    it('builds from parents array (star graph)', () => {
      const bl = new BinaryLifting(5, { parents: [-1, 0, 0, 0, 0] })
      expect(bl.depth(0)).toBe(0)
      expect(bl.depth(1)).toBe(1)
      expect(bl.depth(4)).toBe(1)
    })

    it('handles single node', () => {
      const bl = new BinaryLifting(1, { parents: [-1] })
      expect(bl.depth(0)).toBe(0)
    })

    it('handles explicit root', () => {
      const bl = new BinaryLifting(4, { parents: [-1, 0, 1, 2], root: 0 })
      expect(bl.lca(3, 1)).toBe(1)
    })

    it('handles empty tree (n=0)', () => {
      const bl = new BinaryLifting(0)
      expect(bl.depth(0)).toBe(-1)
    })
  })

  describe('constructor with edges', () => {
    it('builds from edges', () => {
      const bl = new BinaryLifting(5, {
        edges: [[0, 1], [0, 2], [1, 3], [1, 4]],
        root: 0,
      })
      expect(bl.depth(0)).toBe(0)
      expect(bl.depth(1)).toBe(1)
      expect(bl.depth(3)).toBe(2)
    })

    it('builds linear chain from edges', () => {
      const bl = new BinaryLifting(4, {
        edges: [[0, 1], [1, 2], [2, 3]],
        root: 0,
      })
      expect(bl.depth(3)).toBe(3)
    })
  })

  describe('constructor with no tree data', () => {
    it('creates isolated nodes', () => {
      const bl = new BinaryLifting(5)
      expect(bl.depth(0)).toBe(0)
      expect(bl.depth(4)).toBe(0)
    })
  })

  describe('kthAncestor', () => {
    it('returns ancestor at distance k', () => {
      const bl = new BinaryLifting(5, { parents: [-1, 0, 1, 2, 3] })
      expect(bl.kthAncestor(4, 0)).toBe(4)
      expect(bl.kthAncestor(4, 1)).toBe(3)
      expect(bl.kthAncestor(4, 2)).toBe(2)
      expect(bl.kthAncestor(4, 4)).toBe(0)
    })

    it('returns -1 if k exceeds depth', () => {
      const bl = new BinaryLifting(5, { parents: [-1, 0, 1, 2, 3] })
      expect(bl.kthAncestor(4, 5)).toBe(-1)
    })

    it('returns -1 for invalid node', () => {
      const bl = new BinaryLifting(5, { parents: [-1, 0, 1, 2, 3] })
      expect(bl.kthAncestor(-1, 0)).toBe(-1)
      expect(bl.kthAncestor(10, 1)).toBe(-1)
    })

    it('returns -1 for negative k', () => {
      const bl = new BinaryLifting(5, { parents: [-1, 0, 1, 2, 3] })
      expect(bl.kthAncestor(0, -1)).toBe(-1)
    })
  })

  describe('lca', () => {
    it('finds LCA in linear chain', () => {
      const bl = new BinaryLifting(5, { parents: [-1, 0, 1, 2, 3] })
      expect(bl.lca(3, 4)).toBe(3)
      expect(bl.lca(2, 4)).toBe(2)
      expect(bl.lca(0, 4)).toBe(0)
    })

    it('finds LCA in star graph', () => {
      const bl = new BinaryLifting(5, { parents: [-1, 0, 0, 0, 0] })
      expect(bl.lca(1, 2)).toBe(0)
      expect(bl.lca(3, 4)).toBe(0)
    })

    it('finds LCA in tree', () => {
      const bl = new BinaryLifting(7, { parents: [-1, 0, 0, 1, 1, 2, 2] })
      expect(bl.lca(3, 4)).toBe(1)
      expect(bl.lca(5, 6)).toBe(2)
      expect(bl.lca(3, 5)).toBe(0)
    })

    it('returns same node when both equal', () => {
      const bl = new BinaryLifting(5, { parents: [-1, 0, 1, 2, 3] })
      expect(bl.lca(3, 3)).toBe(3)
    })

    it('returns -1 for invalid nodes', () => {
      const bl = new BinaryLifting(5, { parents: [-1, 0, 1, 2, 3] })
      expect(bl.lca(-1, 0)).toBe(-1)
      expect(bl.lca(0, 10)).toBe(-1)
    })

    it('root is ancestor of everyone', () => {
      const bl = new BinaryLifting(7, { parents: [-1, 0, 0, 1, 1, 2, 2] })
      expect(bl.lca(0, 6)).toBe(0)
      expect(bl.lca(0, 3)).toBe(0)
    })
  })

  describe('depth', () => {
    it('returns correct depths', () => {
      const bl = new BinaryLifting(5, { parents: [-1, 0, 1, 2, 3] })
      expect(bl.depth(0)).toBe(0)
      expect(bl.depth(1)).toBe(1)
      expect(bl.depth(4)).toBe(4)
    })

    it('returns -1 for invalid node', () => {
      const bl = new BinaryLifting(5)
      expect(bl.depth(-1)).toBe(-1)
      expect(bl.depth(10)).toBe(-1)
    })
  })

  describe('isAncestor', () => {
    it('returns true for direct parent', () => {
      const bl = new BinaryLifting(5, { parents: [-1, 0, 1, 2, 3] })
      expect(bl.isAncestor(0, 1)).toBe(true)
      expect(bl.isAncestor(1, 2)).toBe(true)
    })

    it('returns true for distant ancestor', () => {
      const bl = new BinaryLifting(5, { parents: [-1, 0, 1, 2, 3] })
      expect(bl.isAncestor(0, 4)).toBe(true)
      expect(bl.isAncestor(2, 4)).toBe(true)
    })

    it('returns false for non-ancestor', () => {
      const bl = new BinaryLifting(5, { parents: [-1, 0, 1, 2, 3] })
      expect(bl.isAncestor(4, 0)).toBe(false)
      expect(bl.isAncestor(3, 1)).toBe(false)
    })

    it('returns true for same node', () => {
      const bl = new BinaryLifting(5, { parents: [-1, 0, 1, 2, 3] })
      expect(bl.isAncestor(2, 2)).toBe(true)
    })

    it('returns false for invalid nodes', () => {
      const bl = new BinaryLifting(5)
      expect(bl.isAncestor(-1, 0)).toBe(false)
      expect(bl.isAncestor(0, 10)).toBe(false)
    })
  })

  describe('distance', () => {
    it('computes distance between nodes', () => {
      const bl = new BinaryLifting(5, { parents: [-1, 0, 1, 2, 3] })
      expect(bl.distance(0, 4)).toBe(4)
      expect(bl.distance(2, 4)).toBe(2)
      expect(bl.distance(3, 3)).toBe(0)
    })

    it('computes distance via LCA', () => {
      const bl = new BinaryLifting(7, { parents: [-1, 0, 0, 1, 1, 2, 2] })
      expect(bl.distance(3, 5)).toBe(4)
      expect(bl.distance(3, 4)).toBe(2)
    })
  })

  describe('pathToRoot', () => {
    it('returns path from node to root', () => {
      const bl = new BinaryLifting(5, { parents: [-1, 0, 1, 2, 3] })
      expect(bl.pathToRoot(4)).toEqual([4, 3, 2, 1, 0])
    })

    it('returns single node for root', () => {
      const bl = new BinaryLifting(5, { parents: [-1, 0, 1, 2, 3] })
      expect(bl.pathToRoot(0)).toEqual([0])
    })

    it('returns empty for invalid node', () => {
      const bl = new BinaryLifting(5)
      expect(bl.pathToRoot(-1)).toEqual([])
    })
  })

  describe('stats', () => {
    it('returns correct stats', () => {
      const bl = new BinaryLifting(5, { parents: [-1, 0, 1, 2, 3], root: 0 })
      const s = bl.stats()
      expect(s.nodeCount).toBe(5)
      expect(s.maxDepth).toBe(4)
      expect(s.root).toBe(0)
      expect(s.logHeight).toBeGreaterThanOrEqual(1)
    })

    it('returns zero stats for empty tree', () => {
      const bl = new BinaryLifting(0)
      const s = bl.stats()
      expect(s.nodeCount).toBe(0)
      expect(s.maxDepth).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('handles binary tree', () => {
      const bl = new BinaryLifting(7, {
        parents: [-1, 0, 0, 1, 1, 2, 2],
        root: 0,
      })
      expect(bl.lca(3, 4)).toBe(1)
      expect(bl.lca(5, 6)).toBe(2)
      expect(bl.lca(3, 6)).toBe(0)
      expect(bl.depth(3)).toBe(2)
      expect(bl.depth(6)).toBe(2)
    })

    it('handles larger tree', () => {
      const n = 16
      const parents = [-1]
      for (let i = 1; i < n; i++) parents.push(i - 1)
      const bl = new BinaryLifting(n, { parents, root: 0 })
      expect(bl.lca(15, 7)).toBe(7)
      expect(bl.kthAncestor(15, 8)).toBe(7)
    })
  })
})
