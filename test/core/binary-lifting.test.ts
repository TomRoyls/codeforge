import { describe, it, expect } from 'vitest'
import { BinaryLifting } from '../../src/core/binary-lifting/binary-lifting'
import type { BinaryLiftingStats } from '../../src/core/binary-lifting/types'

function buildLinearTree(n: number): BinaryLifting {
  const parents: number[] = []
  parents.push(-1)
  for (let i = 1; i < n; i++) {
    parents.push(i - 1)
  }
  return new BinaryLifting(n, { parents })
}

function buildStarTree(n: number): BinaryLifting {
  const parents: number[] = []
  parents.push(-1)
  for (let i = 1; i < n; i++) {
    parents.push(0)
  }
  return new BinaryLifting(n, { parents })
}

function buildBalancedBinaryTree(levels: number): BinaryLifting {
  const n = (1 << levels) - 1
  const parents: number[] = []
  parents.push(-1)
  for (let i = 1; i < n; i++) {
    parents.push(Math.floor((i - 1) / 2))
  }
  return new BinaryLifting(n, { parents })
}

function buildSampleTree(): BinaryLifting {
  const edges: [number, number][] = [
    [0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6], [4, 7], [4, 8], [6, 9],
  ]
  return new BinaryLifting(10, { edges, root: 0 })
}

function buildSampleTreeParents(): BinaryLifting {
  const parents = [-1, 0, 0, 1, 1, 2, 2, 4, 4, 6]
  return new BinaryLifting(10, { parents })
}

describe('BinaryLifting', () => {
  describe('construction with parent array', () => {
    it('should construct with single node', () => {
      const bl = new BinaryLifting(1, { parents: [-1] })
      expect(bl.depth(0)).toBe(0)
    })

    it('should construct with two nodes', () => {
      const bl = new BinaryLifting(2, { parents: [-1, 0] })
      expect(bl.depth(0)).toBe(0)
      expect(bl.depth(1)).toBe(1)
    })

    it('should construct with empty parents', () => {
      const bl = new BinaryLifting(5, {})
      expect(bl.depth(0)).toBe(0)
    })

    it('should construct with linear tree', () => {
      const bl = buildLinearTree(5)
      expect(bl.depth(0)).toBe(0)
      expect(bl.depth(4)).toBe(4)
    })

    it('should construct with star tree', () => {
      const bl = buildStarTree(5)
      expect(bl.depth(0)).toBe(0)
      for (let i = 1; i < 5; i++) {
        expect(bl.depth(i)).toBe(1)
      }
    })

    it('should construct with balanced binary tree', () => {
      const bl = buildBalancedBinaryTree(4)
      expect(bl.depth(0)).toBe(0)
      expect(bl.depth(1)).toBe(1)
      expect(bl.depth(3)).toBe(2)
      expect(bl.depth(7)).toBe(3)
    })

    it('should handle custom root', () => {
      const bl = new BinaryLifting(4, { parents: [-1, 0, 0, 1] }, )
      expect(bl.depth(0)).toBe(0)
    })

    it('should construct with zero nodes', () => {
      const bl = new BinaryLifting(0, {})
      expect(bl.stats().nodeCount).toBe(0)
    })
  })

  describe('construction with edges', () => {
    it('should construct with edges for single node', () => {
      const bl = new BinaryLifting(1, { edges: [], root: 0 })
      expect(bl.depth(0)).toBe(0)
    })

    it('should construct with edges for two nodes', () => {
      const bl = new BinaryLifting(2, { edges: [[0, 1]], root: 0 })
      expect(bl.depth(0)).toBe(0)
      expect(bl.depth(1)).toBe(1)
    })

    it('should construct with edges for sample tree', () => {
      const bl = buildSampleTree()
      expect(bl.depth(0)).toBe(0)
      expect(bl.depth(1)).toBe(1)
      expect(bl.depth(2)).toBe(1)
      expect(bl.depth(3)).toBe(2)
      expect(bl.depth(4)).toBe(2)
      expect(bl.depth(5)).toBe(2)
      expect(bl.depth(6)).toBe(2)
      expect(bl.depth(7)).toBe(3)
      expect(bl.depth(8)).toBe(3)
      expect(bl.depth(9)).toBe(3)
    })

    it('should construct edges for linear tree', () => {
      const edges: [number, number][] = []
      for (let i = 0; i < 4; i++) {
        edges.push([i, i + 1])
      }
      const bl = new BinaryLifting(5, { edges, root: 0 })
      expect(bl.depth(0)).toBe(0)
      expect(bl.depth(4)).toBe(4)
    })

    it('should construct edges for star tree', () => {
      const edges: [number, number][] = []
      for (let i = 1; i < 5; i++) {
        edges.push([0, i])
      }
      const bl = new BinaryLifting(5, { edges, root: 0 })
      expect(bl.depth(0)).toBe(0)
      for (let i = 1; i < 5; i++) {
        expect(bl.depth(i)).toBe(1)
      }
    })

    it('should construct with custom root via edges', () => {
      const edges: [number, number][] = [[0, 1], [1, 2], [2, 3]]
      const bl = new BinaryLifting(4, { edges, root: 1 })
      expect(bl.depth(1)).toBe(0)
      expect(bl.depth(0)).toBe(1)
      expect(bl.depth(2)).toBe(1)
      expect(bl.depth(3)).toBe(2)
    })
  })

  describe('kthAncestor', () => {
    it('should return node itself for k=0', () => {
      const bl = buildSampleTreeParents()
      expect(bl.kthAncestor(5, 0)).toBe(5)
      expect(bl.kthAncestor(0, 0)).toBe(0)
      expect(bl.kthAncestor(9, 0)).toBe(9)
    })

    it('should return immediate parent for k=1', () => {
      const bl = buildSampleTreeParents()
      expect(bl.kthAncestor(1, 1)).toBe(0)
      expect(bl.kthAncestor(2, 1)).toBe(0)
      expect(bl.kthAncestor(3, 1)).toBe(1)
      expect(bl.kthAncestor(7, 1)).toBe(4)
    })

    it('should return ancestor at various depths', () => {
      const bl = buildSampleTreeParents()
      expect(bl.kthAncestor(7, 1)).toBe(4)
      expect(bl.kthAncestor(7, 2)).toBe(1)
      expect(bl.kthAncestor(7, 3)).toBe(0)
    })

    it('should return root for k equal to depth', () => {
      const bl = buildSampleTreeParents()
      expect(bl.kthAncestor(9, 3)).toBe(0)
      expect(bl.kthAncestor(7, 3)).toBe(0)
      expect(bl.kthAncestor(3, 2)).toBe(0)
    })

    it('should return -1 for k beyond root', () => {
      const bl = buildSampleTreeParents()
      expect(bl.kthAncestor(0, 1)).toBe(-1)
      expect(bl.kthAncestor(5, 10)).toBe(-1)
      expect(bl.kthAncestor(3, 5)).toBe(-1)
    })

    it('should return -1 for invalid node', () => {
      const bl = buildSampleTreeParents()
      expect(bl.kthAncestor(-1, 1)).toBe(-1)
      expect(bl.kthAncestor(10, 1)).toBe(-1)
    })

    it('should return -1 for negative k', () => {
      const bl = buildSampleTreeParents()
      expect(bl.kthAncestor(5, -1)).toBe(-1)
    })

    it('should work on linear tree', () => {
      const bl = buildLinearTree(10)
      for (let i = 0; i < 10; i++) {
        expect(bl.kthAncestor(i, i)).toBe(0)
      }
      expect(bl.kthAncestor(9, 5)).toBe(4)
      expect(bl.kthAncestor(9, 9)).toBe(0)
      expect(bl.kthAncestor(9, 10)).toBe(-1)
    })

    it('should work on star tree', () => {
      const bl = buildStarTree(10)
      for (let i = 1; i < 10; i++) {
        expect(bl.kthAncestor(i, 1)).toBe(0)
        expect(bl.kthAncestor(i, 2)).toBe(-1)
      }
      expect(bl.kthAncestor(0, 1)).toBe(-1)
    })

    it('should work on balanced binary tree', () => {
      const bl = buildBalancedBinaryTree(4)
      expect(bl.kthAncestor(7, 1)).toBe(3)
      expect(bl.kthAncestor(7, 2)).toBe(1)
      expect(bl.kthAncestor(7, 3)).toBe(0)
      expect(bl.kthAncestor(14, 1)).toBe(6)
      expect(bl.kthAncestor(14, 2)).toBe(2)
      expect(bl.kthAncestor(14, 3)).toBe(0)
    })

    it('should handle power-of-2 jumps correctly', () => {
      const bl = buildLinearTree(20)
      expect(bl.kthAncestor(16, 8)).toBe(8)
      expect(bl.kthAncestor(16, 4)).toBe(12)
      expect(bl.kthAncestor(16, 16)).toBe(0)
      expect(bl.kthAncestor(16, 2)).toBe(14)
    })
  })

  describe('lca', () => {
    it('should return node itself for lca of same node', () => {
      const bl = buildSampleTreeParents()
      expect(bl.lca(0, 0)).toBe(0)
      expect(bl.lca(5, 5)).toBe(5)
      expect(bl.lca(9, 9)).toBe(9)
    })

    it('should return root for nodes in different subtrees', () => {
      const bl = buildSampleTreeParents()
      expect(bl.lca(3, 5)).toBe(0)
      expect(bl.lca(3, 9)).toBe(0)
      expect(bl.lca(7, 6)).toBe(0)
    })

    it('should return parent for node and its direct child', () => {
      const bl = buildSampleTreeParents()
      expect(bl.lca(0, 1)).toBe(0)
      expect(bl.lca(1, 3)).toBe(1)
      expect(bl.lca(4, 7)).toBe(4)
      expect(bl.lca(2, 6)).toBe(2)
    })

    it('should return correct lca for siblings', () => {
      const bl = buildSampleTreeParents()
      expect(bl.lca(3, 4)).toBe(1)
      expect(bl.lca(5, 6)).toBe(2)
      expect(bl.lca(7, 8)).toBe(4)
    })

    it('should handle deeper ancestor relationships', () => {
      const bl = buildSampleTreeParents()
      expect(bl.lca(7, 3)).toBe(1)
      expect(bl.lca(9, 5)).toBe(2)
      expect(bl.lca(8, 3)).toBe(1)
    })

    it('should return -1 for invalid nodes', () => {
      const bl = buildSampleTreeParents()
      expect(bl.lca(-1, 0)).toBe(-1)
      expect(bl.lca(0, -1)).toBe(-1)
      expect(bl.lca(10, 0)).toBe(-1)
    })

    it('should work on linear tree', () => {
      const bl = buildLinearTree(5)
      expect(bl.lca(2, 4)).toBe(2)
      expect(bl.lca(0, 4)).toBe(0)
      expect(bl.lca(3, 3)).toBe(3)
      expect(bl.lca(1, 3)).toBe(1)
    })

    it('should work on star tree', () => {
      const bl = buildStarTree(5)
      expect(bl.lca(1, 2)).toBe(0)
      expect(bl.lca(1, 4)).toBe(0)
      expect(bl.lca(0, 3)).toBe(0)
    })

    it('should work on balanced binary tree', () => {
      const bl = buildBalancedBinaryTree(4)
      expect(bl.lca(4, 5)).toBe(0)
      expect(bl.lca(3, 4)).toBe(1)
      expect(bl.lca(7, 8)).toBe(3)
      expect(bl.lca(7, 14)).toBe(0)
    })

    it('should work with edges-based construction', () => {
      const bl = buildSampleTree()
      expect(bl.lca(3, 5)).toBe(0)
      expect(bl.lca(3, 4)).toBe(1)
      expect(bl.lca(7, 8)).toBe(4)
      expect(bl.lca(9, 5)).toBe(2)
    })
  })

  describe('distance', () => {
    it('should return 0 for same node', () => {
      const bl = buildSampleTreeParents()
      expect(bl.distance(0, 0)).toBe(0)
      expect(bl.distance(5, 5)).toBe(0)
      expect(bl.distance(9, 9)).toBe(0)
    })

    it('should return correct distance for parent-child', () => {
      const bl = buildSampleTreeParents()
      expect(bl.distance(0, 1)).toBe(1)
      expect(bl.distance(1, 3)).toBe(1)
      expect(bl.distance(4, 7)).toBe(1)
    })

    it('should return correct distance for siblings', () => {
      const bl = buildSampleTreeParents()
      expect(bl.distance(3, 4)).toBe(2)
      expect(bl.distance(5, 6)).toBe(2)
      expect(bl.distance(7, 8)).toBe(2)
    })

    it('should return correct distance across subtrees', () => {
      const bl = buildSampleTreeParents()
      expect(bl.distance(3, 5)).toBe(4)
      expect(bl.distance(7, 9)).toBe(6)
      expect(bl.distance(3, 9)).toBe(5)
    })

    it('should return -1 for invalid nodes', () => {
      const bl = buildSampleTreeParents()
      expect(bl.distance(-1, 0)).toBe(-1)
      expect(bl.distance(0, 10)).toBe(-1)
    })

    it('should work on linear tree', () => {
      const bl = buildLinearTree(5)
      expect(bl.distance(0, 4)).toBe(4)
      expect(bl.distance(2, 4)).toBe(2)
      expect(bl.distance(1, 3)).toBe(2)
    })

    it('should work on star tree', () => {
      const bl = buildStarTree(5)
      expect(bl.distance(1, 2)).toBe(2)
      expect(bl.distance(0, 3)).toBe(1)
      expect(bl.distance(1, 4)).toBe(2)
    })

    it('should be symmetric', () => {
      const bl = buildSampleTreeParents()
      expect(bl.distance(3, 7)).toBe(bl.distance(7, 3))
      expect(bl.distance(0, 9)).toBe(bl.distance(9, 0))
      expect(bl.distance(5, 8)).toBe(bl.distance(8, 5))
    })
  })

  describe('isAncestor', () => {
    it('should return true for node itself', () => {
      const bl = buildSampleTreeParents()
      expect(bl.isAncestor(0, 0)).toBe(true)
      expect(bl.isAncestor(5, 5)).toBe(true)
      expect(bl.isAncestor(9, 9)).toBe(true)
    })

    it('should return true for direct parent', () => {
      const bl = buildSampleTreeParents()
      expect(bl.isAncestor(0, 1)).toBe(true)
      expect(bl.isAncestor(0, 2)).toBe(true)
      expect(bl.isAncestor(1, 3)).toBe(true)
      expect(bl.isAncestor(1, 4)).toBe(true)
      expect(bl.isAncestor(4, 7)).toBe(true)
      expect(bl.isAncestor(6, 9)).toBe(true)
    })

    it('should return true for distant ancestor', () => {
      const bl = buildSampleTreeParents()
      expect(bl.isAncestor(0, 9)).toBe(true)
      expect(bl.isAncestor(0, 7)).toBe(true)
      expect(bl.isAncestor(1, 7)).toBe(true)
      expect(bl.isAncestor(2, 9)).toBe(true)
    })

    it('should return false for non-ancestor', () => {
      const bl = buildSampleTreeParents()
      expect(bl.isAncestor(1, 2)).toBe(false)
      expect(bl.isAncestor(3, 4)).toBe(false)
      expect(bl.isAncestor(5, 6)).toBe(false)
      expect(bl.isAncestor(7, 8)).toBe(false)
    })

    it('should return false for descendant as "ancestor"', () => {
      const bl = buildSampleTreeParents()
      expect(bl.isAncestor(1, 0)).toBe(false)
      expect(bl.isAncestor(9, 0)).toBe(false)
      expect(bl.isAncestor(7, 4)).toBe(false)
    })

    it('should return false for invalid nodes', () => {
      const bl = buildSampleTreeParents()
      expect(bl.isAncestor(-1, 0)).toBe(false)
      expect(bl.isAncestor(0, -1)).toBe(false)
      expect(bl.isAncestor(10, 0)).toBe(false)
    })

    it('should work on root as ancestor of all', () => {
      const bl = buildSampleTreeParents()
      for (let i = 0; i < 10; i++) {
        expect(bl.isAncestor(0, i)).toBe(true)
      }
    })
  })

  describe('depth', () => {
    it('should return correct depths for sample tree', () => {
      const bl = buildSampleTreeParents()
      expect(bl.depth(0)).toBe(0)
      expect(bl.depth(1)).toBe(1)
      expect(bl.depth(2)).toBe(1)
      expect(bl.depth(3)).toBe(2)
      expect(bl.depth(4)).toBe(2)
      expect(bl.depth(5)).toBe(2)
      expect(bl.depth(6)).toBe(2)
      expect(bl.depth(7)).toBe(3)
      expect(bl.depth(8)).toBe(3)
      expect(bl.depth(9)).toBe(3)
    })

    it('should return -1 for invalid node', () => {
      const bl = buildSampleTreeParents()
      expect(bl.depth(-1)).toBe(-1)
      expect(bl.depth(10)).toBe(-1)
    })

    it('should return 0 for root', () => {
      const bl = buildLinearTree(5)
      expect(bl.depth(0)).toBe(0)
    })

    it('should return n-1 for deepest node in linear tree', () => {
      const bl = buildLinearTree(10)
      expect(bl.depth(9)).toBe(9)
    })

    it('should return 1 for all leaves in star tree', () => {
      const bl = buildStarTree(6)
      for (let i = 1; i < 6; i++) {
        expect(bl.depth(i)).toBe(1)
      }
    })
  })

  describe('pathToRoot', () => {
    it('should return [root] for root node', () => {
      const bl = buildSampleTreeParents()
      expect(bl.pathToRoot(0)).toEqual([0])
    })

    it('should return correct path for leaf', () => {
      const bl = buildSampleTreeParents()
      expect(bl.pathToRoot(3)).toEqual([3, 1, 0])
      expect(bl.pathToRoot(7)).toEqual([7, 4, 1, 0])
      expect(bl.pathToRoot(9)).toEqual([9, 6, 2, 0])
    })

    it('should return correct path for internal node', () => {
      const bl = buildSampleTreeParents()
      expect(bl.pathToRoot(1)).toEqual([1, 0])
      expect(bl.pathToRoot(2)).toEqual([2, 0])
      expect(bl.pathToRoot(4)).toEqual([4, 1, 0])
    })

    it('should return empty for invalid node', () => {
      const bl = buildSampleTreeParents()
      expect(bl.pathToRoot(-1)).toEqual([])
      expect(bl.pathToRoot(10)).toEqual([])
    })

    it('should return full path for linear tree', () => {
      const bl = buildLinearTree(5)
      expect(bl.pathToRoot(4)).toEqual([4, 3, 2, 1, 0])
      expect(bl.pathToRoot(0)).toEqual([0])
    })

    it('should return length-2 path for star tree leaves', () => {
      const bl = buildStarTree(5)
      for (let i = 1; i < 5; i++) {
        expect(bl.pathToRoot(i)).toEqual([i, 0])
      }
    })
  })

  describe('stats', () => {
    it('should return correct stats for sample tree', () => {
      const bl = buildSampleTreeParents()
      const s = bl.stats()
      expect(s.nodeCount).toBe(10)
      expect(s.maxDepth).toBe(3)
      expect(s.root).toBe(0)
    })

    it('should return correct stats for linear tree', () => {
      const bl = buildLinearTree(10)
      const s = bl.stats()
      expect(s.nodeCount).toBe(10)
      expect(s.maxDepth).toBe(9)
      expect(s.root).toBe(0)
    })

    it('should return correct stats for star tree', () => {
      const bl = buildStarTree(7)
      const s = bl.stats()
      expect(s.nodeCount).toBe(7)
      expect(s.maxDepth).toBe(1)
      expect(s.root).toBe(0)
    })

    it('should return correct stats for single node', () => {
      const bl = new BinaryLifting(1, { parents: [-1] })
      const s = bl.stats()
      expect(s.nodeCount).toBe(1)
      expect(s.maxDepth).toBe(0)
      expect(s.root).toBe(0)
    })

    it('should return correct stats for zero nodes', () => {
      const bl = new BinaryLifting(0, {})
      const s = bl.stats()
      expect(s.nodeCount).toBe(0)
      expect(s.maxDepth).toBe(0)
    })

    it('should include logHeight', () => {
      const bl = buildBalancedBinaryTree(4)
      const s = bl.stats()
      expect(s.logHeight).toBeGreaterThanOrEqual(1)
      expect(s.logHeight).toBeLessThanOrEqual(4)
    })

    it('should report custom root', () => {
      const edges: [number, number][] = [[0, 1], [1, 2]]
      const bl = new BinaryLifting(3, { edges, root: 1 })
      const s = bl.stats()
      expect(s.root).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('should handle single node tree', () => {
      const bl = new BinaryLifting(1, { parents: [-1] })
      expect(bl.depth(0)).toBe(0)
      expect(bl.kthAncestor(0, 0)).toBe(0)
      expect(bl.kthAncestor(0, 1)).toBe(-1)
      expect(bl.lca(0, 0)).toBe(0)
      expect(bl.distance(0, 0)).toBe(0)
      expect(bl.isAncestor(0, 0)).toBe(true)
      expect(bl.pathToRoot(0)).toEqual([0])
    })

    it('should handle two node tree', () => {
      const bl = new BinaryLifting(2, { parents: [-1, 0] })
      expect(bl.lca(0, 1)).toBe(0)
      expect(bl.distance(0, 1)).toBe(1)
      expect(bl.isAncestor(0, 1)).toBe(true)
      expect(bl.isAncestor(1, 0)).toBe(false)
    })

    it('should handle linear tree of depth 100', () => {
      const n = 100
      const bl = buildLinearTree(n)
      expect(bl.depth(99)).toBe(99)
      expect(bl.kthAncestor(99, 50)).toBe(49)
      expect(bl.lca(25, 75)).toBe(25)
      expect(bl.distance(0, 99)).toBe(99)
      expect(bl.pathToRoot(99).length).toBe(100)
    })

    it('should handle star tree with many children', () => {
      const n = 100
      const bl = buildStarTree(n)
      expect(bl.depth(50)).toBe(1)
      expect(bl.lca(25, 75)).toBe(0)
      expect(bl.distance(25, 75)).toBe(2)
      for (let i = 1; i < n; i++) {
        expect(bl.isAncestor(0, i)).toBe(true)
      }
    })

    it('should handle balanced binary tree with 4 levels', () => {
      const bl = buildBalancedBinaryTree(4)
      const n = 15
      expect(bl.depth(0)).toBe(0)
      expect(bl.depth(7)).toBe(3)
      expect(bl.depth(14)).toBe(3)
      expect(bl.lca(7, 8)).toBe(3)
      expect(bl.lca(7, 14)).toBe(0)
      expect(bl.distance(7, 14)).toBe(6)
    })

    it('should handle balanced binary tree with 5 levels', () => {
      const bl = buildBalancedBinaryTree(5)
      expect(bl.depth(15)).toBe(4)
      expect(bl.depth(30)).toBe(4)
      expect(bl.lca(16, 17)).toBe(3)
      expect(bl.distance(16, 30)).toBe(8)
    })

    it('should handle kthAncestor at exact power of 2', () => {
      const bl = buildLinearTree(20)
      expect(bl.kthAncestor(8, 8)).toBe(0)
      expect(bl.kthAncestor(16, 8)).toBe(8)
      expect(bl.kthAncestor(16, 4)).toBe(12)
      expect(bl.kthAncestor(16, 2)).toBe(14)
      expect(bl.kthAncestor(16, 1)).toBe(15)
    })
  })

  describe('large trees', () => {
    it('should handle 10000 node linear tree', () => {
      const n = 10000
      const bl = buildLinearTree(n)
      expect(bl.depth(9999)).toBe(9999)
      expect(bl.kthAncestor(9999, 5000)).toBe(4999)
      expect(bl.lca(1000, 5000)).toBe(1000)
      expect(bl.distance(0, 9999)).toBe(9999)
    })

    it('should handle 10000 node star tree', () => {
      const n = 10000
      const bl = buildStarTree(n)
      expect(bl.depth(9999)).toBe(1)
      expect(bl.lca(5000, 9999)).toBe(0)
      expect(bl.distance(5000, 9999)).toBe(2)
      expect(bl.kthAncestor(9999, 1)).toBe(0)
    })

    it('should handle 10000 node balanced binary tree', () => {
      const levels = 14
      const n = (1 << levels) - 1
      const bl = buildBalancedBinaryTree(levels)
      expect(bl.depth(n - 1)).toBe(levels - 1)
      expect(bl.kthAncestor(n - 1, levels - 1)).toBe(0)
      expect(bl.lca(1, 2)).toBe(0)
      expect(bl.lca(3, 4)).toBe(1)
    })

    it('should handle 10000 node tree with edges', () => {
      const n = 10000
      const edges: [number, number][] = []
      for (let i = 1; i < n; i++) {
        edges.push([Math.floor(i / 2), i])
      }
      const bl = new BinaryLifting(n, { edges, root: 0 })
      expect(bl.depth(9999)).toBeGreaterThanOrEqual(1)
      expect(bl.lca(0, 9999)).toBe(0)
    })
  })

  describe('parent array vs edges equivalence', () => {
    it('should produce same results for sample tree', () => {
      const blParents = buildSampleTreeParents()
      const blEdges = buildSampleTree()
      for (let i = 0; i < 10; i++) {
        expect(blParents.depth(i)).toBe(blEdges.depth(i))
      }
      for (let u = 0; u < 10; u++) {
        for (let v = 0; v < 10; v++) {
          expect(blParents.lca(u, v)).toBe(blEdges.lca(u, v))
          expect(blParents.distance(u, v)).toBe(blEdges.distance(u, v))
        }
      }
    })

    it('should produce same kthAncestor for both constructions', () => {
      const blParents = buildSampleTreeParents()
      const blEdges = buildSampleTree()
      for (let node = 0; node < 10; node++) {
        for (let k = 0; k <= 5; k++) {
          expect(blParents.kthAncestor(node, k)).toBe(blEdges.kthAncestor(node, k))
        }
      }
    })

    it('should produce same isAncestor for both constructions', () => {
      const blParents = buildSampleTreeParents()
      const blEdges = buildSampleTree()
      for (let a = 0; a < 10; a++) {
        for (let d = 0; d < 10; d++) {
          expect(blParents.isAncestor(a, d)).toBe(blEdges.isAncestor(a, d))
        }
      }
    })

    it('should produce same pathToRoot for both constructions', () => {
      const blParents = buildSampleTreeParents()
      const blEdges = buildSampleTree()
      for (let i = 0; i < 10; i++) {
        expect(blParents.pathToRoot(i)).toEqual(blEdges.pathToRoot(i))
      }
    })
  })

  describe('lca correctness on all pairs (small tree)', () => {
    it('should compute correct lca for all node pairs in 7-node tree', () => {
      const parents = [-1, 0, 0, 1, 1, 2, 2]
      const bl = new BinaryLifting(7, { parents })
      expect(bl.lca(3, 4)).toBe(1)
      expect(bl.lca(5, 6)).toBe(2)
      expect(bl.lca(3, 5)).toBe(0)
      expect(bl.lca(4, 6)).toBe(0)
      expect(bl.lca(3, 6)).toBe(0)
      expect(bl.lca(1, 2)).toBe(0)
      expect(bl.lca(3, 1)).toBe(1)
      expect(bl.lca(5, 2)).toBe(2)
      for (let i = 0; i < 7; i++) {
        expect(bl.lca(i, 0)).toBe(0)
        expect(bl.lca(0, i)).toBe(0)
      }
    })
  })

  describe('distance properties', () => {
    it('should satisfy triangle inequality', () => {
      const bl = buildSampleTreeParents()
      for (let u = 0; u < 10; u++) {
        for (let v = 0; v < 10; v++) {
          for (let w = 0; w < 10; w++) {
            const duv = bl.distance(u, v)!
            const dvw = bl.distance(v, w)!
            const duw = bl.distance(u, w)!
            expect(duv + dvw).toBeGreaterThanOrEqual(duw)
          }
        }
      }
    })

    it('should equal depth(u) + depth(v) - 2*depth(lca)', () => {
      const bl = buildSampleTreeParents()
      for (let u = 0; u < 10; u++) {
        for (let v = 0; v < 10; v++) {
          const lca = bl.lca(u, v)!
          const expected = bl.depth(u)! + bl.depth(v)! - 2 * bl.depth(lca)!
          expect(bl.distance(u, v)).toBe(expected)
        }
      }
    })
  })

  describe('kthAncestor consistency with pathToRoot', () => {
    it('should match path entries', () => {
      const bl = buildSampleTreeParents()
      for (let node = 0; node < 10; node++) {
        const path = bl.pathToRoot(node)
        for (let k = 0; k < path.length; k++) {
          expect(bl.kthAncestor(node, k)).toBe(path[k])
        }
        expect(bl.kthAncestor(node, path.length)).toBe(-1)
      }
    })
  })

  describe('stats return type', () => {
    it('should return object matching BinaryLiftingStats interface', () => {
      const bl = buildSampleTreeParents()
      const s: BinaryLiftingStats = bl.stats()
      expect(typeof s.nodeCount).toBe('number')
      expect(typeof s.maxDepth).toBe('number')
      expect(typeof s.logHeight).toBe('number')
      expect(typeof s.root).toBe('number')
    })
  })

  describe('additional kthAncestor tests', () => {
    it('should handle kthAncestor on single node', () => {
      const bl = new BinaryLifting(1, { parents: [-1] })
      expect(bl.kthAncestor(0, 0)).toBe(0)
      expect(bl.kthAncestor(0, 1)).toBe(-1)
      expect(bl.kthAncestor(0, 100)).toBe(-1)
    })

    it('should handle kthAncestor on empty tree', () => {
      const bl = new BinaryLifting(0, {})
      expect(bl.kthAncestor(0, 0)).toBe(-1)
    })

    it('should handle kthAncestor with large k on small tree', () => {
      const bl = buildSampleTreeParents()
      expect(bl.kthAncestor(9, 100)).toBe(-1)
      expect(bl.kthAncestor(0, 100)).toBe(-1)
    })

    it('should handle kthAncestor at depth boundary', () => {
      const bl = buildLinearTree(8)
      expect(bl.kthAncestor(7, 7)).toBe(0)
      expect(bl.kthAncestor(7, 8)).toBe(-1)
    })

    it('should handle kthAncestor with binary decomposition', () => {
      const bl = buildLinearTree(32)
      expect(bl.kthAncestor(31, 7)).toBe(24)
      expect(bl.kthAncestor(31, 15)).toBe(16)
      expect(bl.kthAncestor(31, 31)).toBe(0)
    })
  })

  describe('additional lca tests', () => {
    it('should handle lca where one node is ancestor of other', () => {
      const bl = buildSampleTreeParents()
      expect(bl.lca(1, 7)).toBe(1)
      expect(bl.lca(2, 9)).toBe(2)
      expect(bl.lca(0, 8)).toBe(0)
    })

    it('should handle lca with root as one argument', () => {
      const bl = buildSampleTreeParents()
      for (let i = 0; i < 10; i++) {
        expect(bl.lca(0, i)).toBe(0)
        expect(bl.lca(i, 0)).toBe(0)
      }
    })

    it('should handle lca on empty tree', () => {
      const bl = new BinaryLifting(0, {})
      expect(bl.lca(0, 0)).toBe(-1)
    })

    it('should handle lca on single node', () => {
      const bl = new BinaryLifting(1, { parents: [-1] })
      expect(bl.lca(0, 0)).toBe(0)
    })

    it('should handle lca on caterpillar tree', () => {
      const parents = [-1, 0, 0, 1, 1, 2, 2, 3, 4, 5, 6]
      const bl = new BinaryLifting(11, { parents })
      expect(bl.lca(7, 8)).toBe(1)
      expect(bl.lca(9, 10)).toBe(2)
      expect(bl.lca(7, 10)).toBe(0)
      expect(bl.lca(8, 9)).toBe(0)
    })
  })

  describe('additional distance tests', () => {
    it('should handle distance on single node', () => {
      const bl = new BinaryLifting(1, { parents: [-1] })
      expect(bl.distance(0, 0)).toBe(0)
    })

    it('should handle distance on empty tree', () => {
      const bl = new BinaryLifting(0, {})
      expect(bl.distance(0, 0)).toBe(-1)
    })

    it('should verify distance equals path length overlap', () => {
      const bl = buildSampleTreeParents()
      for (let u = 0; u < 10; u++) {
        expect(bl.distance(u, u)).toBe(0)
        expect(bl.distance(u, 0)).toBe(bl.depth(u))
        expect(bl.distance(0, u)).toBe(bl.depth(u))
      }
    })
  })

  describe('additional isAncestor tests', () => {
    it('should return true for root as ancestor of all in large tree', () => {
      const bl = buildLinearTree(100)
      for (let i = 0; i < 100; i++) {
        expect(bl.isAncestor(0, i)).toBe(true)
      }
    })

    it('should return false for leaf as ancestor of another leaf', () => {
      const bl = buildBalancedBinaryTree(4)
      expect(bl.isAncestor(7, 8)).toBe(false)
      expect(bl.isAncestor(14, 13)).toBe(false)
    })

    it('should work correctly on single node', () => {
      const bl = new BinaryLifting(1, { parents: [-1] })
      expect(bl.isAncestor(0, 0)).toBe(true)
    })
  })

  describe('additional depth tests', () => {
    it('should have increasing depth on linear tree', () => {
      const bl = buildLinearTree(10)
      for (let i = 1; i < 10; i++) {
        expect(bl.depth(i)).toBe(bl.depth(i - 1)! + 1)
      }
    })

    it('should have depth 1 for all non-root in star tree', () => {
      const bl = buildStarTree(20)
      for (let i = 1; i < 20; i++) {
        expect(bl.depth(i)).toBe(1)
      }
    })

    it('should have correct depth for balanced tree levels', () => {
      const bl = buildBalancedBinaryTree(5)
      for (let level = 0; level < 5; level++) {
        const start = (1 << level) - 1
        const end = (1 << (level + 1)) - 2
        for (let i = start; i <= end; i++) {
          expect(bl.depth(i)).toBe(level)
        }
      }
    })
  })

  describe('additional pathToRoot tests', () => {
    it('should have length equal to depth + 1', () => {
      const bl = buildSampleTreeParents()
      for (let i = 0; i < 10; i++) {
        expect(bl.pathToRoot(i).length).toBe(bl.depth(i)! + 1)
      }
    })

    it('should always end at root', () => {
      const bl = buildLinearTree(50)
      for (let i = 0; i < 50; i++) {
        const path = bl.pathToRoot(i)
        expect(path[path.length - 1]).toBe(0)
      }
    })

    it('should have no duplicates in path', () => {
      const bl = buildSampleTreeParents()
      for (let i = 0; i < 10; i++) {
        const path = bl.pathToRoot(i)
        const unique = new Set(path)
        expect(unique.size).toBe(path.length)
      }
    })
  })

  describe('consistency checks on random-ish tree', () => {
    it('should have all distances symmetric on skewed tree', () => {
      const parents = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8]
      const bl = new BinaryLifting(10, { parents })
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          expect(bl.distance(i, j)).toBe(bl.distance(j, i))
        }
      }
    })

    it('should have lca as ancestor of both nodes', () => {
      const bl = buildSampleTreeParents()
      for (let u = 0; u < 10; u++) {
        for (let v = 0; v < 10; v++) {
          const a = bl.lca(u, v)!
          expect(bl.isAncestor(a, u)).toBe(true)
          expect(bl.isAncestor(a, v)).toBe(true)
        }
      }
    })

    it('should have lca as deepest common ancestor', () => {
      const bl = buildSampleTreeParents()
      for (let u = 0; u < 10; u++) {
        for (let v = 0; v < 10; v++) {
          const a = bl.lca(u, v)!
          for (let x = 0; x < 10; x++) {
            if (bl.isAncestor(x, u) && bl.isAncestor(x, v)) {
              expect(bl.depth(x)!).toBeLessThanOrEqual(bl.depth(a)!)
            }
          }
        }
      }
    })

    it('should satisfy depth(u) = depth(lca(u,v)) + distance(u, lca(u,v))', () => {
      const bl = buildSampleTreeParents()
      for (let u = 0; u < 10; u++) {
        for (let v = 0; v < 10; v++) {
          const a = bl.lca(u, v)!
          expect(bl.depth(u)).toBe(bl.depth(a)! + bl.distance(u, a)!)
        }
      }
    })
  })

  describe('additional construction edge cases', () => {
    it('should construct with parents using self-referencing root', () => {
      const parents = [0, 0, 0, 1, 1]
      const bl = new BinaryLifting(5, { parents, root: 0 })
      expect(bl.depth(0)).toBe(0)
      expect(bl.depth(1)).toBe(1)
      expect(bl.lca(3, 4)).toBe(1)
    })

    it('should handle tree with root at non-zero index', () => {
      const parents = [1, -1, 1, 2, 2]
      const bl = new BinaryLifting(5, { parents, root: 1 })
      expect(bl.depth(1)).toBe(0)
      expect(bl.depth(0)).toBe(1)
      expect(bl.depth(2)).toBe(1)
      expect(bl.depth(3)).toBe(2)
      expect(bl.lca(0, 3)).toBe(1)
    })

    it('should handle three node chain via edges', () => {
      const bl = new BinaryLifting(3, { edges: [[0, 1], [1, 2]], root: 1 })
      expect(bl.depth(1)).toBe(0)
      expect(bl.depth(0)).toBe(1)
      expect(bl.depth(2)).toBe(1)
      expect(bl.lca(0, 2)).toBe(1)
      expect(bl.distance(0, 2)).toBe(2)
    })

    it('should handle V-shaped tree via edges', () => {
      const bl = new BinaryLifting(3, { edges: [[0, 1], [0, 2]], root: 0 })
      expect(bl.lca(1, 2)).toBe(0)
      expect(bl.distance(1, 2)).toBe(2)
      expect(bl.isAncestor(0, 1)).toBe(true)
      expect(bl.isAncestor(0, 2)).toBe(true)
      expect(bl.isAncestor(1, 2)).toBe(false)
    })

    it('should handle kthAncestor returning -1 for nodes not reachable from root', () => {
      const bl = new BinaryLifting(5, { parents: [-1, 0, -1, 2, 2] })
      expect(bl.kthAncestor(2, 1)).toBe(-1)
    })

    it('should handle large power of 2 tree size', () => {
      const n = 1024
      const bl = buildLinearTree(n)
      expect(bl.depth(n - 1)).toBe(n - 1)
      expect(bl.kthAncestor(n - 1, 512)).toBe(511)
      expect(bl.kthAncestor(n - 1, 1024)).toBe(-1)
    })
  })
})
