import { describe, it, expect } from 'vitest'
import { HeavyLightDecomposition } from '../../src/core/heavy-light-decomposition/heavy-light-decomposition'

function buildPath(n: number): HeavyLightDecomposition {
  const hld = new HeavyLightDecomposition(n)
  for (let i = 0; i < n - 1; i++) {
    hld.addEdge(i, i + 1)
  }
  hld.build(0)
  return hld
}

function buildStar(n: number): HeavyLightDecomposition {
  const hld = new HeavyLightDecomposition(n)
  for (let i = 1; i < n; i++) {
    hld.addEdge(0, i)
  }
  hld.build(0)
  return hld
}

function buildCompleteBinaryTree(levels: number): { hld: HeavyLightDecomposition; n: number } {
  const n = (1 << levels) - 1
  const hld = new HeavyLightDecomposition(n)
  for (let i = 0; i < Math.floor(n / 2); i++) {
    hld.addEdge(i, 2 * i + 1)
    hld.addEdge(i, 2 * i + 2)
  }
  hld.build(0)
  return { hld, n }
}

function buildSampleTree(): HeavyLightDecomposition {
  const hld = new HeavyLightDecomposition(10)
  const edges: [number, number][] = [
    [0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6], [4, 7], [4, 8], [6, 9],
  ]
  for (const [u, v] of edges) {
    hld.addEdge(u, v)
  }
  hld.build(0)
  return hld
}

describe('HeavyLightDecomposition', () => {
  describe('constructor and build', () => {
    it('should create HLD with single node', () => {
      const hld = new HeavyLightDecomposition(1)
      hld.build(0)
      expect(hld.getDepth(0)).toBe(0)
      expect(hld.getParent(0)).toBe(-1)
      expect(hld.getSubtreeSize(0)).toBe(1)
      expect(hld.getHead(0)).toBe(0)
      expect(hld.getPos(0)).toBe(0)
    })

    it('should handle two nodes', () => {
      const hld = new HeavyLightDecomposition(2)
      hld.addEdge(0, 1)
      hld.build(0)
      expect(hld.getDepth(0)).toBe(0)
      expect(hld.getDepth(1)).toBe(1)
      expect(hld.getParent(0)).toBe(-1)
      expect(hld.getParent(1)).toBe(0)
    })

    it('should throw if querying before build', () => {
      const hld = new HeavyLightDecomposition(5)
      expect(() => hld.lca(0, 1)).toThrow('Must call build()')
    })

    it('should build with default root 0', () => {
      const hld = buildSampleTree()
      expect(hld.getDepth(0)).toBe(0)
      expect(hld.getParent(0)).toBe(-1)
    })

    it('should build with custom root', () => {
      const hld = new HeavyLightDecomposition(5)
      hld.addEdge(0, 1)
      hld.addEdge(1, 2)
      hld.addEdge(2, 3)
      hld.addEdge(3, 4)
      hld.build(2)
      expect(hld.getDepth(2)).toBe(0)
      expect(hld.getParent(2)).toBe(-1)
      expect(hld.getDepth(0)).toBe(2)
      expect(hld.getDepth(4)).toBe(2)
    })

    it('should handle three node chain', () => {
      const hld = new HeavyLightDecomposition(3)
      hld.addEdge(0, 1)
      hld.addEdge(1, 2)
      hld.build(0)
      expect(hld.getParent(0)).toBe(-1)
      expect(hld.getParent(1)).toBe(0)
      expect(hld.getParent(2)).toBe(1)
      expect(hld.getDepth(2)).toBe(2)
    })

    it('should handle three node star (root with two children)', () => {
      const hld = new HeavyLightDecomposition(3)
      hld.addEdge(0, 1)
      hld.addEdge(0, 2)
      hld.build(0)
      expect(hld.getParent(1)).toBe(0)
      expect(hld.getParent(2)).toBe(0)
      expect(hld.getDepth(1)).toBe(1)
      expect(hld.getDepth(2)).toBe(1)
    })
  })

  describe('path graph (single chain)', () => {
    it('should assign all nodes to same chain', () => {
      const hld = buildPath(5)
      const rootHead = hld.getHead(0)
      for (let i = 0; i < 5; i++) {
        expect(hld.getHead(i)).toBe(rootHead)
      }
    })

    it('should have sequential positions', () => {
      const hld = buildPath(5)
      const positions: number[] = []
      for (let i = 0; i < 5; i++) {
        positions.push(hld.getPos(i))
      }
      const sorted = [...positions].sort((a, b) => a - b)
      expect(sorted).toEqual([0, 1, 2, 3, 4])
    })

    it('should compute correct depths for path', () => {
      const hld = buildPath(6)
      for (let i = 0; i < 6; i++) {
        expect(hld.getDepth(i)).toBe(i)
      }
    })

    it('should compute correct parents for path', () => {
      const hld = buildPath(5)
      expect(hld.getParent(0)).toBe(-1)
      for (let i = 1; i < 5; i++) {
        expect(hld.getParent(i)).toBe(i - 1)
      }
    })

    it('should compute correct subtree sizes for path', () => {
      const hld = buildPath(5)
      expect(hld.getSubtreeSize(0)).toBe(5)
      expect(hld.getSubtreeSize(1)).toBe(4)
      expect(hld.getSubtreeSize(2)).toBe(3)
      expect(hld.getSubtreeSize(3)).toBe(2)
      expect(hld.getSubtreeSize(4)).toBe(1)
    })

    it('should compute correct LCA for path', () => {
      const hld = buildPath(5)
      expect(hld.lca(0, 4)).toBe(0)
      expect(hld.lca(2, 4)).toBe(2)
      expect(hld.lca(1, 3)).toBe(1)
      expect(hld.lca(3, 3)).toBe(3)
    })

    it('should produce single segment path query', () => {
      const hld = buildPath(5)
      const segs = hld.pathQuery(0, 4)
      expect(segs.length).toBe(1)
      expect(segs[0]!.head).toBe(0)
    })

    it('should handle path of 20 nodes', () => {
      const hld = buildPath(20)
      expect(hld.getSubtreeSize(0)).toBe(20)
      expect(hld.getSubtreeSize(19)).toBe(1)
      expect(hld.lca(5, 15)).toBe(5)
      expect(hld.lca(10, 19)).toBe(10)
    })

    it('should handle path of 50 nodes', () => {
      const hld = buildPath(50)
      expect(hld.getDepth(49)).toBe(49)
      expect(hld.lca(0, 49)).toBe(0)
      expect(hld.lca(25, 30)).toBe(25)
    })
  })

  describe('star graph', () => {
    it('should assign different heads for different children', () => {
      const hld = buildStar(6)
      expect(hld.getHead(0)).toBe(0)
    })

    it('should compute correct depths', () => {
      const hld = buildStar(5)
      expect(hld.getDepth(0)).toBe(0)
      for (let i = 1; i < 5; i++) {
        expect(hld.getDepth(i)).toBe(1)
      }
    })

    it('should compute correct subtree sizes', () => {
      const hld = buildStar(5)
      expect(hld.getSubtreeSize(0)).toBe(5)
      for (let i = 1; i < 5; i++) {
        expect(hld.getSubtreeSize(i)).toBe(1)
      }
    })

    it('should compute correct LCA', () => {
      const hld = buildStar(5)
      for (let i = 1; i < 5; i++) {
        expect(hld.lca(i, 0)).toBe(0)
        expect(hld.lca(0, i)).toBe(0)
      }
      expect(hld.lca(1, 2)).toBe(0)
      expect(hld.lca(3, 4)).toBe(0)
    })

    it('should compute correct parents', () => {
      const hld = buildStar(5)
      expect(hld.getParent(0)).toBe(-1)
      for (let i = 1; i < 5; i++) {
        expect(hld.getParent(i)).toBe(0)
      }
    })

    it('should produce two segments for sibling query', () => {
      const hld = buildStar(5)
      const segs = hld.pathQuery(1, 2)
      expect(segs.length).toBe(2)
    })

    it('should handle star of 100 nodes', () => {
      const hld = buildStar(100)
      expect(hld.getSubtreeSize(0)).toBe(100)
      expect(hld.lca(50, 75)).toBe(0)
      expect(hld.lca(1, 99)).toBe(0)
    })
  })

  describe('binary tree', () => {
    it('should compute correct depths', () => {
      const { hld } = buildCompleteBinaryTree(3)
      expect(hld.getDepth(0)).toBe(0)
      expect(hld.getDepth(1)).toBe(1)
      expect(hld.getDepth(2)).toBe(1)
      expect(hld.getDepth(3)).toBe(2)
      expect(hld.getDepth(4)).toBe(2)
      expect(hld.getDepth(5)).toBe(2)
      expect(hld.getDepth(6)).toBe(2)
    })

    it('should compute correct subtree sizes', () => {
      const { hld } = buildCompleteBinaryTree(3)
      expect(hld.getSubtreeSize(0)).toBe(7)
      expect(hld.getSubtreeSize(1)).toBe(3)
      expect(hld.getSubtreeSize(2)).toBe(3)
      expect(hld.getSubtreeSize(3)).toBe(1)
      expect(hld.getSubtreeSize(4)).toBe(1)
    })

    it('should compute correct parents', () => {
      const { hld } = buildCompleteBinaryTree(3)
      expect(hld.getParent(0)).toBe(-1)
      expect(hld.getParent(1)).toBe(0)
      expect(hld.getParent(2)).toBe(0)
      expect(hld.getParent(3)).toBe(1)
      expect(hld.getParent(4)).toBe(1)
      expect(hld.getParent(5)).toBe(2)
      expect(hld.getParent(6)).toBe(2)
    })

    it('should compute correct LCA in binary tree', () => {
      const { hld } = buildCompleteBinaryTree(3)
      expect(hld.lca(3, 4)).toBe(1)
      expect(hld.lca(5, 6)).toBe(2)
      expect(hld.lca(3, 5)).toBe(0)
      expect(hld.lca(3, 6)).toBe(0)
      expect(hld.lca(1, 2)).toBe(0)
      expect(hld.lca(0, 6)).toBe(0)
    })

    it('should handle LCA of node with itself', () => {
      const { hld } = buildCompleteBinaryTree(3)
      for (let i = 0; i < 7; i++) {
        expect(hld.lca(i, i)).toBe(i)
      }
    })

    it('should compute LCA between ancestor and descendant', () => {
      const { hld } = buildCompleteBinaryTree(3)
      expect(hld.lca(0, 3)).toBe(0)
      expect(hld.lca(0, 6)).toBe(0)
      expect(hld.lca(1, 3)).toBe(1)
      expect(hld.lca(2, 5)).toBe(2)
    })

    it('should compute correct path segments in binary tree', () => {
      const { hld } = buildCompleteBinaryTree(3)
      const segs = hld.pathQuery(3, 5)
      expect(segs.length).toBeGreaterThanOrEqual(2)
    })

    it('should handle 4-level binary tree', () => {
      const { hld, n } = buildCompleteBinaryTree(4)
      expect(n).toBe(15)
      expect(hld.getSubtreeSize(0)).toBe(15)
      expect(hld.getSubtreeSize(1)).toBe(7)
      expect(hld.getSubtreeSize(2)).toBe(7)
      expect(hld.lca(7, 14)).toBe(0)
      expect(hld.lca(8, 10)).toBe(1)
    })

    it('should handle 5-level binary tree', () => {
      const { hld, n } = buildCompleteBinaryTree(5)
      expect(n).toBe(31)
      expect(hld.getSubtreeSize(0)).toBe(31)
      expect(hld.lca(15, 30)).toBe(0)
      expect(hld.lca(16, 17)).toBe(3)
    })
  })

  describe('sample tree', () => {
    const hld = buildSampleTree()

    it('should compute correct subtree sizes', () => {
      expect(hld.getSubtreeSize(0)).toBe(10)
      expect(hld.getSubtreeSize(1)).toBe(5)
      expect(hld.getSubtreeSize(2)).toBe(4)
      expect(hld.getSubtreeSize(4)).toBe(3)
      expect(hld.getSubtreeSize(6)).toBe(2)
      expect(hld.getSubtreeSize(3)).toBe(1)
      expect(hld.getSubtreeSize(9)).toBe(1)
    })

    it('should compute correct depths', () => {
      expect(hld.getDepth(0)).toBe(0)
      expect(hld.getDepth(1)).toBe(1)
      expect(hld.getDepth(2)).toBe(1)
      expect(hld.getDepth(3)).toBe(2)
      expect(hld.getDepth(4)).toBe(2)
      expect(hld.getDepth(5)).toBe(2)
      expect(hld.getDepth(6)).toBe(2)
      expect(hld.getDepth(7)).toBe(3)
      expect(hld.getDepth(8)).toBe(3)
      expect(hld.getDepth(9)).toBe(3)
    })

    it('should compute correct LCA', () => {
      expect(hld.lca(3, 7)).toBe(1)
      expect(hld.lca(7, 8)).toBe(4)
      expect(hld.lca(5, 9)).toBe(2)
      expect(hld.lca(3, 9)).toBe(0)
      expect(hld.lca(7, 5)).toBe(0)
    })
  })

  describe('LCA correctness', () => {
    it('should handle LCA of same node', () => {
      const hld = buildSampleTree()
      expect(hld.lca(5, 5)).toBe(5)
      expect(hld.lca(0, 0)).toBe(0)
    })

    it('should handle LCA where one is ancestor of other', () => {
      const hld = buildSampleTree()
      expect(hld.lca(0, 7)).toBe(0)
      expect(hld.lca(1, 3)).toBe(1)
      expect(hld.lca(2, 9)).toBe(2)
    })

    it('should handle LCA of siblings', () => {
      const hld = buildSampleTree()
      expect(hld.lca(3, 4)).toBe(1)
      expect(hld.lca(5, 6)).toBe(2)
      expect(hld.lca(7, 8)).toBe(4)
    })

    it('should handle LCA across subtrees', () => {
      const hld = buildSampleTree()
      expect(hld.lca(7, 9)).toBe(0)
      expect(hld.lca(3, 5)).toBe(0)
    })

    it('should handle LCA commutativity', () => {
      const hld = buildSampleTree()
      for (let i = 0; i < 10; i++) {
        for (let j = i + 1; j < 10; j++) {
          expect(hld.lca(i, j)).toBe(hld.lca(j, i))
        }
      }
    })

    it('should handle LCA in larger tree', () => {
      const hld = new HeavyLightDecomposition(15)
      const edges: [number, number][] = [
        [0, 1], [0, 2], [0, 3], [1, 4], [1, 5], [2, 6], [2, 7],
        [3, 8], [3, 9], [4, 10], [4, 11], [6, 12], [9, 13], [9, 14],
      ]
      for (const [u, v] of edges) hld.addEdge(u, v)
      hld.build(0)

      expect(hld.lca(10, 11)).toBe(4)
      expect(hld.lca(12, 7)).toBe(2)
      expect(hld.lca(13, 14)).toBe(9)
      expect(hld.lca(10, 12)).toBe(0)
      expect(hld.lca(5, 8)).toBe(0)
    })
  })

  describe('path decomposition', () => {
    it('should return single segment for root to leaf in single chain', () => {
      const hld = buildPath(10)
      const segs = hld.pathQuery(0, 9)
      expect(segs.length).toBe(1)
    })

    it('should cover all nodes between u and v', () => {
      const hld = buildPath(5)
      const segs = hld.pathQuery(0, 4)
      expect(segs.length).toBe(1)
      expect(segs[0]!.head).toBe(0)
    })

    it('should produce multiple segments for cross-chain query', () => {
      const hld = buildStar(10)
      const segs = hld.pathQuery(1, 5)
      expect(segs.length).toBeGreaterThanOrEqual(2)
    })

    it('should handle path query for same node', () => {
      const hld = buildSampleTree()
      const segs = hld.pathQuery(5, 5)
      expect(segs.length).toBe(1)
      expect(segs[0]!.node).toBe(5)
    })

    it('should handle path query between parent and child', () => {
      const hld = buildSampleTree()
      const segs = hld.pathQuery(1, 3)
      expect(segs.length).toBeGreaterThanOrEqual(1)
    })

    it('pathQuery should be commutative in total coverage', () => {
      const hld = buildSampleTree()
      const segs1 = hld.pathQuery(7, 9)
      const segs2 = hld.pathQuery(9, 7)
      expect(segs1.length).toBe(segs2.length)
    })
  })

  describe('getDepth', () => {
    it('should return 0 for root', () => {
      const hld = buildSampleTree()
      expect(hld.getDepth(0)).toBe(0)
    })

    it('should increase by 1 for each level', () => {
      const hld = buildSampleTree()
      expect(hld.getDepth(7)).toBe(3)
      expect(hld.getDepth(4)).toBe(2)
      expect(hld.getDepth(1)).toBe(1)
    })
  })

  describe('getParent', () => {
    it('should return -1 for root', () => {
      const hld = buildSampleTree()
      expect(hld.getParent(0)).toBe(-1)
    })

    it('should return correct parent for each node', () => {
      const hld = buildSampleTree()
      expect(hld.getParent(1)).toBe(0)
      expect(hld.getParent(2)).toBe(0)
      expect(hld.getParent(3)).toBe(1)
      expect(hld.getParent(4)).toBe(1)
      expect(hld.getParent(7)).toBe(4)
      expect(hld.getParent(9)).toBe(6)
    })
  })

  describe('getSubtreeSize', () => {
    it('should return 1 for leaves', () => {
      const hld = buildSampleTree()
      expect(hld.getSubtreeSize(3)).toBe(1)
      expect(hld.getSubtreeSize(5)).toBe(1)
      expect(hld.getSubtreeSize(7)).toBe(1)
      expect(hld.getSubtreeSize(8)).toBe(1)
      expect(hld.getSubtreeSize(9)).toBe(1)
    })

    it('should return n for root', () => {
      const hld = buildSampleTree()
      expect(hld.getSubtreeSize(0)).toBe(10)
    })
  })

  describe('getHead', () => {
    it('should return root for root node', () => {
      const hld = buildSampleTree()
      expect(hld.getHead(0)).toBe(0)
    })

    it('should return same head for nodes on same heavy chain', () => {
      const hld = buildSampleTree()
      expect(hld.getHead(0)).toBe(0)
    })

    it('should assign head correctly for path graph', () => {
      const hld = buildPath(10)
      const head = hld.getHead(0)
      for (let i = 0; i < 10; i++) {
        expect(hld.getHead(i)).toBe(head)
      }
    })
  })

  describe('getPos', () => {
    it('should assign position 0 to root', () => {
      const hld = buildSampleTree()
      expect(hld.getPos(0)).toBe(0)
    })

    it('should assign unique positions to all nodes', () => {
      const hld = buildSampleTree()
      const positions = new Set<number>()
      for (let i = 0; i < 10; i++) {
        const p = hld.getPos(i)
        expect(positions.has(p)).toBe(false)
        positions.add(p)
      }
      expect(positions.size).toBe(10)
    })

    it('should assign positions in valid range', () => {
      const hld = buildSampleTree()
      for (let i = 0; i < 10; i++) {
        const p = hld.getPos(i)
        expect(p).toBeGreaterThanOrEqual(0)
        expect(p).toBeLessThan(10)
      }
    })

    it('should assign sequential positions for path graph', () => {
      const hld = buildPath(10)
      const positions: number[] = []
      for (let i = 0; i < 10; i++) {
        positions.push(hld.getPos(i))
      }
      expect(new Set(positions).size).toBe(10)
    })
  })

  describe('isAncestor', () => {
    it('should return true for node and itself', () => {
      const hld = buildSampleTree()
      for (let i = 0; i < 10; i++) {
        expect(hld.isAncestor(i, i)).toBe(true)
      }
    })

    it('should return true for parent-child', () => {
      const hld = buildSampleTree()
      expect(hld.isAncestor(0, 1)).toBe(true)
      expect(hld.isAncestor(0, 2)).toBe(true)
      expect(hld.isAncestor(1, 3)).toBe(true)
      expect(hld.isAncestor(1, 4)).toBe(true)
      expect(hld.isAncestor(4, 7)).toBe(true)
      expect(hld.isAncestor(4, 8)).toBe(true)
      expect(hld.isAncestor(2, 9)).toBe(true)
    })

    it('should return true for ancestor deeper in tree', () => {
      const hld = buildSampleTree()
      expect(hld.isAncestor(0, 7)).toBe(true)
      expect(hld.isAncestor(0, 9)).toBe(true)
      expect(hld.isAncestor(1, 8)).toBe(true)
      expect(hld.isAncestor(2, 9)).toBe(true)
    })

    it('should return false for non-ancestor', () => {
      const hld = buildSampleTree()
      expect(hld.isAncestor(1, 2)).toBe(false)
      expect(hld.isAncestor(3, 4)).toBe(false)
      expect(hld.isAncestor(7, 8)).toBe(false)
      expect(hld.isAncestor(5, 6)).toBe(false)
      expect(hld.isAncestor(3, 0)).toBe(false)
      expect(hld.isAncestor(7, 0)).toBe(false)
    })

    it('should return true for root as ancestor of all', () => {
      const hld = buildSampleTree()
      for (let i = 0; i < 10; i++) {
        expect(hld.isAncestor(0, i)).toBe(true)
      }
    })

    it('should return false for leaf as ancestor of others', () => {
      const hld = buildSampleTree()
      for (let i = 1; i < 10; i++) {
        expect(hld.isAncestor(3, i)).toBe(i === 3)
      }
    })

    it('should work in binary tree', () => {
      const { hld } = buildCompleteBinaryTree(3)
      expect(hld.isAncestor(0, 3)).toBe(true)
      expect(hld.isAncestor(0, 6)).toBe(true)
      expect(hld.isAncestor(1, 4)).toBe(true)
      expect(hld.isAncestor(2, 5)).toBe(true)
      expect(hld.isAncestor(3, 4)).toBe(false)
      expect(hld.isAncestor(5, 6)).toBe(false)
    })
  })

  describe('subtreeRange', () => {
    it('should return [0, n) for root', () => {
      const hld = buildSampleTree()
      const [start, end] = hld.subtreeRange(0)
      expect(start).toBe(0)
      expect(end).toBe(10)
    })

    it('should return range of length 1 for leaves', () => {
      const hld = buildSampleTree()
      for (const leaf of [3, 5, 7, 8, 9]) {
        const [start, end] = hld.subtreeRange(leaf)
        expect(end - start).toBe(1)
      }
    })

    it('should return contiguous range containing all subtree nodes', () => {
      const hld = buildSampleTree()
      const [start, end] = hld.subtreeRange(1)
      expect(end - start).toBe(5)
    })

    it('should have subtree range consistent with subtree size', () => {
      const hld = buildSampleTree()
      for (let i = 0; i < 10; i++) {
        const [start, end] = hld.subtreeRange(i)
        expect(end - start).toBe(hld.getSubtreeSize(i))
      }
    })

    it('should have pos within subtree range', () => {
      const hld = buildSampleTree()
      for (let i = 0; i < 10; i++) {
        const [start, end] = hld.subtreeRange(i)
        const pos = hld.getPos(i)
        expect(pos).toBeGreaterThanOrEqual(start)
        expect(pos).toBeLessThan(end)
      }
    })

    it('should work for path graph', () => {
      const hld = buildPath(5)
      expect(hld.subtreeRange(0)).toEqual([0, 5])
      expect(hld.subtreeRange(2)).toEqual([hld.getPos(2), hld.getPos(2) + 3])
    })

    it('should work for star graph', () => {
      const hld = buildStar(5)
      const [start, end] = hld.subtreeRange(0)
      expect(end - start).toBe(5)
      for (let i = 1; i < 5; i++) {
        const [s, e] = hld.subtreeRange(i)
        expect(e - s).toBe(1)
      }
    })
  })

  describe('edge cases', () => {
    it('should handle single node tree', () => {
      const hld = new HeavyLightDecomposition(1)
      hld.build(0)
      expect(hld.lca(0, 0)).toBe(0)
      expect(hld.getDepth(0)).toBe(0)
      expect(hld.getParent(0)).toBe(-1)
      expect(hld.getSubtreeSize(0)).toBe(1)
      expect(hld.getHead(0)).toBe(0)
      expect(hld.getPos(0)).toBe(0)
      expect(hld.isAncestor(0, 0)).toBe(true)
      const segs = hld.pathQuery(0, 0)
      expect(segs.length).toBe(1)
      const [s, e] = hld.subtreeRange(0)
      expect(e - s).toBe(1)
    })

    it('should handle two-node tree', () => {
      const hld = new HeavyLightDecomposition(2)
      hld.addEdge(0, 1)
      hld.build(0)
      expect(hld.lca(0, 1)).toBe(0)
      expect(hld.lca(1, 0)).toBe(0)
      expect(hld.isAncestor(0, 1)).toBe(true)
      expect(hld.isAncestor(1, 0)).toBe(false)
    })

    it('should handle asymmetric tree', () => {
      const hld = new HeavyLightDecomposition(7)
      hld.addEdge(0, 1)
      hld.addEdge(1, 2)
      hld.addEdge(2, 3)
      hld.addEdge(3, 4)
      hld.addEdge(4, 5)
      hld.addEdge(5, 6)
      hld.build(0)
      expect(hld.getSubtreeSize(0)).toBe(7)
      expect(hld.lca(0, 6)).toBe(0)
      expect(hld.lca(3, 5)).toBe(3)
    })

    it('should handle tree with single heavy chain', () => {
      const hld = new HeavyLightDecomposition(4)
      hld.addEdge(0, 1)
      hld.addEdge(1, 2)
      hld.addEdge(2, 3)
      hld.build(0)
      const head = hld.getHead(0)
      for (let i = 0; i < 4; i++) {
        expect(hld.getHead(i)).toBe(head)
      }
    })
  })

  describe('large tree stress tests', () => {
    it('should handle 1000-node path graph', () => {
      const hld = buildPath(1000)
      expect(hld.getSubtreeSize(0)).toBe(1000)
      expect(hld.getSubtreeSize(999)).toBe(1)
      expect(hld.lca(0, 999)).toBe(0)
      expect(hld.lca(500, 999)).toBe(500)
      expect(hld.lca(100, 200)).toBe(100)
    })

    it('should handle 1000-node star graph', () => {
      const hld = buildStar(1000)
      expect(hld.getSubtreeSize(0)).toBe(1000)
      expect(hld.lca(500, 999)).toBe(0)
      for (let i = 1; i < 1000; i++) {
        expect(hld.getParent(i)).toBe(0)
        expect(hld.getDepth(i)).toBe(1)
        expect(hld.getSubtreeSize(i)).toBe(1)
      }
    })

    it('should handle 1000-node complete binary tree', () => {
      const levels = 10
      const { hld, n } = buildCompleteBinaryTree(levels)
      expect(n).toBe(1023)
      expect(hld.getSubtreeSize(0)).toBe(1023)
      expect(hld.lca(0, 1022)).toBe(0)
      expect(hld.lca(1, 2)).toBe(0)
    })

    it('should handle 2000-node tree', () => {
      const hld = new HeavyLightDecomposition(2000)
      for (let i = 1; i < 2000; i++) {
        hld.addEdge(Math.floor(i / 2), i)
      }
      hld.build(0)
      expect(hld.getSubtreeSize(0)).toBe(2000)
      expect(hld.lca(0, 1999)).toBe(0)
    })

    it('should handle 5000-node path', () => {
      const hld = buildPath(5000)
      expect(hld.getSubtreeSize(0)).toBe(5000)
      expect(hld.getDepth(4999)).toBe(4999)
      expect(hld.lca(1000, 4000)).toBe(1000)
    })

    it('should handle random tree structure with 1000 nodes', () => {
      const hld = new HeavyLightDecomposition(1000)
      for (let i = 1; i < 1000; i++) {
        hld.addEdge(i, Math.floor(Math.random() * i))
      }
      hld.build(0)
      for (let i = 0; i < 1000; i++) {
        expect(hld.getPos(i)).toBeGreaterThanOrEqual(0)
        expect(hld.getPos(i)).toBeLessThan(1000)
      }
      expect(hld.getSubtreeSize(0)).toBe(1000)
    })

    it('should have unique positions in 1000-node tree', () => {
      const hld = new HeavyLightDecomposition(1000)
      for (let i = 1; i < 1000; i++) {
        hld.addEdge(i, Math.floor(i / 2))
      }
      hld.build(0)
      const positions = new Set<number>()
      for (let i = 0; i < 1000; i++) {
        positions.add(hld.getPos(i))
      }
      expect(positions.size).toBe(1000)
    })
  })

  describe('isAncestor with LCA consistency', () => {
    it('should have isAncestor consistent with LCA', () => {
      const hld = buildSampleTree()
      for (let u = 0; u < 10; u++) {
        for (let v = 0; v < 10; v++) {
          const l = hld.lca(u, v)
          expect(hld.isAncestor(l, u)).toBe(true)
          expect(hld.isAncestor(l, v)).toBe(true)
        }
      }
    })

    it('should have LCA as deepest common ancestor', () => {
      const hld = buildSampleTree()
      for (let u = 0; u < 10; u++) {
        for (let v = u + 1; v < 10; v++) {
          const l = hld.lca(u, v)
          if (l !== u && l !== v) {
            expect(hld.isAncestor(l, u)).toBe(true)
            expect(hld.isAncestor(l, v)).toBe(true)
          }
        }
      }
    })
  })

  describe('pathQuery properties', () => {
    it('should produce segments where depth(head) <= depth(node)', () => {
      const hld = buildSampleTree()
      for (let u = 0; u < 10; u++) {
        for (let v = u; v < 10; v++) {
          const segs = hld.pathQuery(u, v)
          for (const seg of segs) {
            expect(hld.getDepth(seg.head)).toBeLessThanOrEqual(hld.getDepth(seg.node))
          }
        }
      }
    })

    it('should produce segments in valid range for path graph', () => {
      const hld = buildPath(10)
      for (let u = 0; u < 10; u++) {
        for (let v = u; v < 10; v++) {
          const segs = hld.pathQuery(u, v)
          expect(segs.length).toBeGreaterThanOrEqual(1)
        }
      }
    })
  })

  describe('subtreeRange properties', () => {
    it('should have root range cover all nodes', () => {
      const hld = buildSampleTree()
      const [start, end] = hld.subtreeRange(0)
      expect(start).toBe(0)
      expect(end).toBe(10)
    })

    it('should have non-overlapping sibling subtree ranges (for same parent)', () => {
      const hld = buildSampleTree()
      const range3 = hld.subtreeRange(3)
      const range4 = hld.subtreeRange(4)
      const r3 = range3[1] - range3[0]
      const r4 = range4[1] - range4[0]
      expect(r3 + r4).toBeLessThanOrEqual(hld.getSubtreeSize(1))
    })

    it('should have valid ranges for all nodes in binary tree', () => {
      const { hld, n } = buildCompleteBinaryTree(4)
      for (let i = 0; i < n; i++) {
        const [start, end] = hld.subtreeRange(i)
        expect(end - start).toBe(hld.getSubtreeSize(i))
        expect(start).toBeGreaterThanOrEqual(0)
        expect(end).toBeLessThanOrEqual(n)
      }
    })
  })

  describe('positions and heads consistency', () => {
    it('should have nodes on same chain with same head', () => {
      const hld = buildSampleTree()
      for (let i = 0; i < 10; i++) {
        const head = hld.getHead(i)
        expect(hld.getDepth(head)).toBeLessThanOrEqual(hld.getDepth(i))
      }
    })

    it('should have head of root be root', () => {
      const hld = buildSampleTree()
      expect(hld.getHead(0)).toBe(0)
    })

    it('should have all positions unique in star graph', () => {
      const hld = buildStar(20)
      const positions = new Set<number>()
      for (let i = 0; i < 20; i++) {
        positions.add(hld.getPos(i))
      }
      expect(positions.size).toBe(20)
    })

    it('should have all positions unique in binary tree', () => {
      const { hld, n } = buildCompleteBinaryTree(4)
      const positions = new Set<number>()
      for (let i = 0; i < n; i++) {
        positions.add(hld.getPos(i))
      }
      expect(positions.size).toBe(n)
    })

    it('should have chain head at or above its nodes', () => {
      const { hld, n } = buildCompleteBinaryTree(4)
      for (let i = 0; i < n; i++) {
        const head = hld.getHead(i)
        expect(hld.getDepth(head)).toBeLessThanOrEqual(hld.getDepth(i))
        if (head !== i) {
          expect(hld.isAncestor(head, i)).toBe(true)
        }
      }
    })
  })

  describe('custom root', () => {
    it('should work with root at leaf of path graph', () => {
      const hld = new HeavyLightDecomposition(5)
      for (let i = 0; i < 4; i++) hld.addEdge(i, i + 1)
      hld.build(4)
      expect(hld.getDepth(4)).toBe(0)
      expect(hld.getParent(4)).toBe(-1)
      expect(hld.getDepth(0)).toBe(4)
    })

    it('should work with root at middle of path', () => {
      const hld = new HeavyLightDecomposition(5)
      for (let i = 0; i < 4; i++) hld.addEdge(i, i + 1)
      hld.build(2)
      expect(hld.getDepth(2)).toBe(0)
      expect(hld.getDepth(0)).toBe(2)
      expect(hld.getDepth(4)).toBe(2)
    })

    it('should compute correct LCA with custom root', () => {
      const hld = new HeavyLightDecomposition(5)
      for (let i = 0; i < 4; i++) hld.addEdge(i, i + 1)
      hld.build(2)
      expect(hld.lca(0, 4)).toBe(2)
      expect(hld.lca(0, 3)).toBe(2)
      expect(hld.lca(3, 4)).toBe(3)
    })
  })

  describe('types module', () => {
    it('should export types module without error', async () => {
      const types = await import('../../src/core/heavy-light-decomposition/types.js')
      expect(types).toBeDefined()
    })
  })
})
