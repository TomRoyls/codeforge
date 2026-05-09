import { describe, it, expect, beforeEach } from 'vitest'
import { EulerTourTree } from '../../src/core/euler-tour-tree/euler-tour-tree.js'
import { DEFAULT_EULER_TOUR_TREE_OPTIONS } from '../../src/core/euler-tour-tree/euler-tour-tree.js'
import type { TourNode, EulerTourTreeOptions } from '../../src/core/euler-tour-tree/euler-tour-tree.js'

describe('EulerTourTree', () => {
  let ett: EulerTourTree

  beforeEach(() => {
    ett = new EulerTourTree(10)
  })

  describe('constructor', () => {
    it('should create a forest with all isolated vertices', () => {
      const e = new EulerTourTree(5)
      expect(e.getComponentSize()).toBe(5)
      expect(e.getEdges()).toEqual([])
    })

    it('should create a single-vertex forest', () => {
      const e = new EulerTourTree(1)
      expect(e.getComponentSize()).toBe(1)
      expect(e.getSize(0)).toBe(1)
    })

    it('should create a zero-vertex forest', () => {
      const e = new EulerTourTree(0)
      expect(e.getComponentSize()).toBe(0)
    })

    it('should accept undefined options', () => {
      const e = new EulerTourTree(5, undefined)
      expect(e.getComponentSize()).toBe(5)
    })

    it('should accept empty options', () => {
      const e = new EulerTourTree(5, {})
      expect(e.getComponentSize()).toBe(5)
    })

    it('should have each vertex as its own root', () => {
      const e = new EulerTourTree(5)
      for (let i = 0; i < 5; i++) {
        expect(e.findRoot(i)).toBe(i)
      }
    })

    it('should have all vertices isolated', () => {
      const e = new EulerTourTree(5)
      for (let i = 0; i < 5; i++) {
        expect(e.degree(i)).toBe(0)
      }
    })
  })

  describe('link', () => {
    it('should link two isolated vertices', () => {
      ett.link(0, 1)
      expect(ett.isConnected(0, 1)).toBe(true)
    })

    it('should update edges after link', () => {
      ett.link(0, 1)
      expect(ett.getEdges()).toEqual([[0, 1]])
    })

    it('should update degree after link', () => {
      ett.link(0, 1)
      expect(ett.degree(0)).toBe(1)
      expect(ett.degree(1)).toBe(1)
    })

    it('should link multiple edges forming a chain', () => {
      ett.link(0, 1)
      ett.link(1, 2)
      ett.link(2, 3)
      expect(ett.isConnected(0, 3)).toBe(true)
      expect(ett.getEdges().length).toBe(3)
    })

    it('should link forming a star', () => {
      ett.link(0, 1)
      ett.link(0, 2)
      ett.link(0, 3)
      ett.link(0, 4)
      expect(ett.degree(0)).toBe(4)
      for (let i = 1; i <= 4; i++) {
        expect(ett.isConnected(0, i)).toBe(true)
      }
    })

    it('should not link a vertex to itself', () => {
      ett.link(0, 0)
      expect(ett.degree(0)).toBe(0)
      expect(ett.getEdges()).toEqual([])
    })

    it('should not link already connected vertices', () => {
      ett.link(0, 1)
      ett.link(0, 1)
      expect(ett.getEdges().length).toBe(1)
    })

    it('should not link vertices that become connected through path', () => {
      ett.link(0, 1)
      ett.link(1, 2)
      ett.link(0, 2)
      expect(ett.getEdges().length).toBe(2)
    })

    it('should ignore invalid vertex indices (negative)', () => {
      ett.link(-1, 0)
      expect(ett.getEdges()).toEqual([])
    })

    it('should ignore invalid vertex indices (out of range)', () => {
      ett.link(0, 100)
      expect(ett.getEdges()).toEqual([])
    })

    it('should update component size after link', () => {
      ett.link(0, 1)
      ett.link(2, 3)
      expect(ett.getSize(0)).toBe(2)
      expect(ett.getSize(2)).toBe(2)
      ett.link(1, 2)
      expect(ett.getSize(0)).toBe(4)
    })

    it('should update findRoot after link', () => {
      ett.link(5, 3)
      expect(ett.findRoot(5)).toBe(3)
      expect(ett.findRoot(3)).toBe(3)
    })

    it('should link forming a tree with branch', () => {
      ett.link(0, 1)
      ett.link(0, 2)
      ett.link(1, 3)
      ett.link(1, 4)
      expect(ett.isConnected(3, 4)).toBe(true)
      expect(ett.isConnected(2, 4)).toBe(true)
    })
  })

  describe('cut', () => {
    it('should cut an existing edge', () => {
      ett.link(0, 1)
      ett.cut(0, 1)
      expect(ett.isConnected(0, 1)).toBe(false)
    })

    it('should update degree after cut', () => {
      ett.link(0, 1)
      ett.cut(0, 1)
      expect(ett.degree(0)).toBe(0)
      expect(ett.degree(1)).toBe(0)
    })

    it('should update edges after cut', () => {
      ett.link(0, 1)
      ett.cut(0, 1)
      expect(ett.getEdges()).toEqual([])
    })

    it('should split component on cut', () => {
      ett.link(0, 1)
      ett.link(1, 2)
      ett.cut(0, 1)
      expect(ett.isConnected(0, 1)).toBe(false)
      expect(ett.isConnected(1, 2)).toBe(true)
    })

    it('should not affect non-edge cut', () => {
      ett.link(0, 1)
      ett.cut(0, 2)
      expect(ett.isConnected(0, 1)).toBe(true)
    })

    it('should ignore cut on non-existent edge', () => {
      ett.cut(0, 1)
      expect(ett.getEdges()).toEqual([])
    })

    it('should ignore cut with invalid indices', () => {
      ett.link(0, 1)
      ett.cut(-1, 0)
      ett.cut(0, 100)
      expect(ett.isConnected(0, 1)).toBe(true)
    })

    it('should handle cut in middle of chain', () => {
      ett.link(0, 1)
      ett.link(1, 2)
      ett.link(2, 3)
      ett.cut(1, 2)
      expect(ett.isConnected(0, 1)).toBe(true)
      expect(ett.isConnected(2, 3)).toBe(true)
      expect(ett.isConnected(0, 3)).toBe(false)
    })

    it('should handle cut in star topology', () => {
      ett.link(0, 1)
      ett.link(0, 2)
      ett.link(0, 3)
      ett.cut(0, 2)
      expect(ett.isConnected(0, 1)).toBe(true)
      expect(ett.isConnected(0, 3)).toBe(true)
      expect(ett.isConnected(0, 2)).toBe(false)
    })

    it('should handle re-linking after cut', () => {
      ett.link(0, 1)
      ett.cut(0, 1)
      ett.link(0, 1)
      expect(ett.isConnected(0, 1)).toBe(true)
    })

    it('should update findRoot after cut', () => {
      ett.link(5, 3)
      ett.cut(5, 3)
      expect(ett.findRoot(5)).toBe(5)
      expect(ett.findRoot(3)).toBe(3)
    })

    it('should update getSize after cut', () => {
      ett.link(0, 1)
      ett.link(1, 2)
      ett.cut(0, 1)
      expect(ett.getSize(0)).toBe(1)
      expect(ett.getSize(1)).toBe(2)
    })
  })

  describe('isConnected', () => {
    it('should return true for same vertex', () => {
      expect(ett.isConnected(0, 0)).toBe(true)
    })

    it('should return false for isolated vertices', () => {
      expect(ett.isConnected(0, 1)).toBe(false)
    })

    it('should return true for directly linked vertices', () => {
      ett.link(0, 1)
      expect(ett.isConnected(0, 1)).toBe(true)
    })

    it('should return true for indirectly connected vertices', () => {
      ett.link(0, 1)
      ett.link(1, 2)
      ett.link(2, 3)
      expect(ett.isConnected(0, 3)).toBe(true)
    })

    it('should return false after cut separates components', () => {
      ett.link(0, 1)
      ett.link(1, 2)
      ett.cut(1, 2)
      expect(ett.isConnected(0, 2)).toBe(false)
    })

    it('should return false for invalid vertices', () => {
      expect(ett.isConnected(-1, 0)).toBe(false)
      expect(ett.isConnected(0, 100)).toBe(false)
    })

    it('should handle connectivity across large tree', () => {
      for (let i = 0; i < 9; i++) {
        ett.link(i, i + 1)
      }
      expect(ett.isConnected(0, 9)).toBe(true)
      expect(ett.isConnected(0, 5)).toBe(true)
    })
  })

  describe('findRoot', () => {
    it('should return vertex itself for isolated node', () => {
      expect(ett.findRoot(0)).toBe(0)
    })

    it('should return minimum vertex in component', () => {
      ett.link(3, 7)
      ett.link(7, 2)
      expect(ett.findRoot(3)).toBe(2)
      expect(ett.findRoot(7)).toBe(2)
    })

    it('should return -1 for invalid vertex', () => {
      expect(ett.findRoot(-1)).toBe(-1)
      expect(ett.findRoot(100)).toBe(-1)
    })

    it('should update root after link merges components', () => {
      ett.link(5, 3)
      ett.link(7, 9)
      expect(ett.findRoot(5)).toBe(3)
      expect(ett.findRoot(7)).toBe(7)
      ett.link(3, 9)
      expect(ett.findRoot(5)).toBe(3)
      expect(ett.findRoot(7)).toBe(3)
    })

    it('should update root after cut splits component', () => {
      ett.link(0, 1)
      ett.link(1, 2)
      ett.cut(1, 2)
      expect(ett.findRoot(0)).toBe(0)
      expect(ett.findRoot(2)).toBe(2)
    })
  })

  describe('getSize', () => {
    it('should return 1 for isolated vertex', () => {
      expect(ett.getSize(0)).toBe(1)
    })

    it('should return component size after links', () => {
      ett.link(0, 1)
      ett.link(1, 2)
      expect(ett.getSize(0)).toBe(3)
      expect(ett.getSize(1)).toBe(3)
      expect(ett.getSize(2)).toBe(3)
    })

    it('should return 0 for invalid vertex', () => {
      expect(ett.getSize(-1)).toBe(0)
      expect(ett.getSize(100)).toBe(0)
    })

    it('should update after cut', () => {
      ett.link(0, 1)
      ett.link(1, 2)
      ett.cut(1, 2)
      expect(ett.getSize(0)).toBe(2)
      expect(ett.getSize(2)).toBe(1)
    })

    it('should count correctly for star topology', () => {
      ett.link(0, 1)
      ett.link(0, 2)
      ett.link(0, 3)
      ett.link(0, 4)
      expect(ett.getSize(0)).toBe(5)
    })
  })

  describe('getComponentSize', () => {
    it('should return total number of nodes', () => {
      expect(ett.getComponentSize()).toBe(10)
    })

    it('should remain constant after link/cut', () => {
      ett.link(0, 1)
      expect(ett.getComponentSize()).toBe(10)
      ett.cut(0, 1)
      expect(ett.getComponentSize()).toBe(10)
    })
  })

  describe('getEdges', () => {
    it('should return empty array for empty forest', () => {
      expect(ett.getEdges()).toEqual([])
    })

    it('should return single edge', () => {
      ett.link(0, 1)
      const edges = ett.getEdges()
      expect(edges).toEqual([[0, 1]])
    })

    it('should return edges with smaller vertex first', () => {
      ett.link(5, 2)
      const edges = ett.getEdges()
      expect(edges).toEqual([[2, 5]])
    })

    it('should return all edges in forest', () => {
      ett.link(0, 1)
      ett.link(2, 3)
      ett.link(4, 5)
      const edges = ett.getEdges()
      expect(edges.length).toBe(3)
    })

    it('should not return duplicate edges', () => {
      ett.link(0, 1)
      ett.link(1, 0)
      expect(ett.getEdges().length).toBe(1)
    })

    it('should update after cut', () => {
      ett.link(0, 1)
      ett.link(1, 2)
      ett.cut(1, 2)
      expect(ett.getEdges()).toEqual([[0, 1]])
    })
  })

  describe('getPath', () => {
    it('should return single vertex for same u and v', () => {
      expect(ett.getPath(0, 0)).toEqual([0])
    })

    it('should return direct path for adjacent vertices', () => {
      ett.link(0, 1)
      const path = ett.getPath(0, 1)
      expect(path[0]).toBe(0)
      expect(path[path.length - 1]).toBe(1)
    })

    it('should return empty for disconnected vertices', () => {
      expect(ett.getPath(0, 1)).toEqual([])
    })

    it('should return path through intermediate vertices', () => {
      ett.link(0, 1)
      ett.link(1, 2)
      ett.link(2, 3)
      const path = ett.getPath(0, 3)
      expect(path[0]).toBe(0)
      expect(path[path.length - 1]).toBe(3)
      expect(path.length).toBe(4)
    })

    it('should return empty for invalid vertices', () => {
      expect(ett.getPath(-1, 0)).toEqual([])
      expect(ett.getPath(0, 100)).toEqual([])
    })

    it('should find path in branching tree', () => {
      ett.link(0, 1)
      ett.link(0, 2)
      ett.link(1, 3)
      ett.link(1, 4)
      const path = ett.getPath(3, 4)
      expect(path[0]).toBe(3)
      expect(path).toContain(1)
      expect(path[path.length - 1]).toBe(4)
    })

    it('should return reverse path correctly', () => {
      ett.link(0, 1)
      ett.link(1, 2)
      const pathForward = ett.getPath(0, 2)
      const pathBackward = ett.getPath(2, 0)
      expect(pathForward.length).toBe(3)
      expect(pathBackward.length).toBe(3)
      expect(pathForward[0]).toBe(0)
      expect(pathBackward[0]).toBe(2)
    })
  })

  describe('getNeighbors', () => {
    it('should return empty for isolated vertex', () => {
      expect(ett.getNeighbors(0)).toEqual([])
    })

    it('should return neighbors after link', () => {
      ett.link(0, 1)
      ett.link(0, 2)
      const neighbors = ett.getNeighbors(0)
      expect(neighbors).toContain(1)
      expect(neighbors).toContain(2)
      expect(neighbors.length).toBe(2)
    })

    it('should update neighbors after cut', () => {
      ett.link(0, 1)
      ett.link(0, 2)
      ett.cut(0, 1)
      const neighbors = ett.getNeighbors(0)
      expect(neighbors).toEqual([2])
    })

    it('should return empty for invalid vertex', () => {
      expect(ett.getNeighbors(-1)).toEqual([])
      expect(ett.getNeighbors(100)).toEqual([])
    })
  })

  describe('degree', () => {
    it('should return 0 for isolated vertex', () => {
      expect(ett.degree(0)).toBe(0)
    })

    it('should return 1 for leaf vertex', () => {
      ett.link(0, 1)
      expect(ett.degree(0)).toBe(1)
    })

    it('should return correct degree for internal vertex', () => {
      ett.link(0, 1)
      ett.link(0, 2)
      ett.link(0, 3)
      expect(ett.degree(0)).toBe(3)
    })

    it('should return 0 for invalid vertex', () => {
      expect(ett.degree(-1)).toBe(0)
      expect(ett.degree(100)).toBe(0)
    })

    it('should update after cut', () => {
      ett.link(0, 1)
      ett.link(0, 2)
      ett.cut(0, 1)
      expect(ett.degree(0)).toBe(1)
    })
  })

  describe('getDepth', () => {
    it('should return 0 for root vertex', () => {
      ett.link(0, 1)
      expect(ett.getDepth(0)).toBe(0)
    })

    it('should return 0 for isolated vertex', () => {
      expect(ett.getDepth(0)).toBe(0)
    })

    it('should return correct depth in chain', () => {
      ett.link(0, 1)
      ett.link(1, 2)
      ett.link(2, 3)
      expect(ett.getDepth(0)).toBe(0)
      expect(ett.getDepth(1)).toBe(1)
      expect(ett.getDepth(2)).toBe(2)
      expect(ett.getDepth(3)).toBe(3)
    })

    it('should return -1 for invalid vertex', () => {
      expect(ett.getDepth(-1)).toBe(-1)
      expect(ett.getDepth(100)).toBe(-1)
    })

    it('should compute depth relative to component root', () => {
      ett.link(5, 3)
      ett.link(5, 7)
      const root = ett.findRoot(5)
      expect(ett.getDepth(root)).toBe(0)
    })
  })

  describe('lca', () => {
    it('should return same vertex for u === v', () => {
      expect(ett.lca(0, 0)).toBe(0)
    })

    it('should return -1 for disconnected vertices', () => {
      expect(ett.lca(0, 1)).toBe(-1)
    })

    it('should return -1 for invalid vertices', () => {
      expect(ett.lca(-1, 0)).toBe(-1)
      expect(ett.lca(0, 100)).toBe(-1)
    })

    it('should return parent for parent-child pair', () => {
      ett.link(0, 1)
      ett.link(0, 2)
      expect(ett.lca(1, 2)).toBe(0)
    })

    it('should return root for deep nodes', () => {
      ett.link(0, 1)
      ett.link(1, 2)
      ett.link(2, 3)
      expect(ett.lca(0, 3)).toBe(0)
    })

    it('should return node itself when one is ancestor of other', () => {
      ett.link(0, 1)
      ett.link(1, 2)
      expect(ett.lca(0, 2)).toBe(0)
      expect(ett.lca(1, 2)).toBe(1)
    })

    it('should compute lca in branching tree', () => {
      ett.link(0, 1)
      ett.link(0, 2)
      ett.link(1, 3)
      ett.link(1, 4)
      ett.link(2, 5)
      expect(ett.lca(3, 4)).toBe(1)
      expect(ett.lca(3, 5)).toBe(0)
      expect(ett.lca(4, 5)).toBe(0)
    })
  })

  describe('clone', () => {
    it('should clone empty forest', () => {
      const cloned = ett.clone()
      expect(cloned.getComponentSize()).toBe(10)
      expect(cloned.getEdges()).toEqual([])
    })

    it('should clone forest with edges', () => {
      ett.link(0, 1)
      ett.link(1, 2)
      const cloned = ett.clone()
      expect(cloned.isConnected(0, 1)).toBe(true)
      expect(cloned.isConnected(1, 2)).toBe(true)
      expect(cloned.getEdges().length).toBe(2)
    })

    it('should produce independent copy', () => {
      ett.link(0, 1)
      const cloned = ett.clone()
      cloned.cut(0, 1)
      expect(ett.isConnected(0, 1)).toBe(true)
      expect(cloned.isConnected(0, 1)).toBe(false)
    })

    it('should preserve component structure', () => {
      ett.link(0, 1)
      ett.link(2, 3)
      const cloned = ett.clone()
      expect(cloned.isConnected(0, 1)).toBe(true)
      expect(cloned.isConnected(2, 3)).toBe(true)
      expect(cloned.isConnected(0, 2)).toBe(false)
    })

    it('should preserve vertex count', () => {
      const e = new EulerTourTree(100)
      e.link(0, 1)
      const cloned = e.clone()
      expect(cloned.getComponentSize()).toBe(100)
    })
  })

  describe('complex operations', () => {
    it('should handle sequence of links and cuts', () => {
      ett.link(0, 1)
      ett.link(1, 2)
      ett.link(2, 3)
      ett.cut(1, 2)
      ett.link(0, 2)
      expect(ett.isConnected(0, 3)).toBe(true)
      expect(ett.isConnected(0, 1)).toBe(true)
      expect(ett.isConnected(1, 2)).toBe(true)
    })

    it('should handle creating and destroying a binary tree', () => {
      ett.link(0, 1)
      ett.link(0, 2)
      ett.link(1, 3)
      ett.link(1, 4)
      ett.link(2, 5)
      ett.link(2, 6)
      expect(ett.getSize(0)).toBe(7)
      ett.cut(0, 1)
      expect(ett.getSize(0)).toBe(4)
      expect(ett.getSize(1)).toBe(3)
      expect(ett.isConnected(3, 4)).toBe(true)
      expect(ett.isConnected(0, 3)).toBe(false)
    })

    it('should handle path in complex tree', () => {
      ett.link(0, 1)
      ett.link(0, 2)
      ett.link(1, 3)
      ett.link(1, 4)
      const path = ett.getPath(3, 4)
      expect(path).toEqual([3, 1, 4])
    })

    it('should handle lca in complex tree', () => {
      ett.link(0, 1)
      ett.link(0, 2)
      ett.link(1, 3)
      ett.link(1, 4)
      ett.link(2, 5)
      ett.link(2, 6)
      ett.link(6, 7)
      expect(ett.lca(3, 7)).toBe(0)
      expect(ett.lca(5, 7)).toBe(2)
    })

    it('should handle linking into chain then cutting middle', () => {
      for (let i = 0; i < 9; i++) {
        ett.link(i, i + 1)
      }
      ett.cut(4, 5)
      expect(ett.getSize(0)).toBe(5)
      expect(ett.getSize(5)).toBe(5)
      expect(ett.isConnected(3, 5)).toBe(false)
    })

    it('should handle reusing edges after cut', () => {
      ett.link(0, 1)
      ett.cut(0, 1)
      ett.link(0, 1)
      ett.cut(0, 1)
      ett.link(0, 1)
      expect(ett.isConnected(0, 1)).toBe(true)
      expect(ett.getEdges().length).toBe(1)
    })

    it('should handle large chain of links', () => {
      const e = new EulerTourTree(50)
      for (let i = 0; i < 49; i++) {
        e.link(i, i + 1)
      }
      expect(e.isConnected(0, 49)).toBe(true)
      expect(e.getSize(0)).toBe(50)
    })

    it('should handle alternating link and cut', () => {
      ett.link(0, 1)
      ett.cut(0, 1)
      ett.link(0, 2)
      ett.cut(0, 2)
      ett.link(1, 2)
      expect(ett.isConnected(0, 1)).toBe(false)
      expect(ett.isConnected(1, 2)).toBe(true)
    })

    it('should handle forming multiple separate components', () => {
      ett.link(0, 1)
      ett.link(2, 3)
      ett.link(4, 5)
      ett.link(6, 7)
      expect(ett.isConnected(0, 1)).toBe(true)
      expect(ett.isConnected(2, 3)).toBe(true)
      expect(ett.isConnected(0, 2)).toBe(false)
      expect(ett.isConnected(4, 6)).toBe(false)
    })

    it('should merge separate components', () => {
      ett.link(0, 1)
      ett.link(2, 3)
      ett.link(4, 5)
      ett.link(1, 2)
      ett.link(3, 4)
      expect(ett.isConnected(0, 5)).toBe(true)
      expect(ett.getSize(0)).toBe(6)
    })
  })

  describe('edge cases', () => {
    it('should handle single vertex operations', () => {
      const e = new EulerTourTree(1)
      expect(e.findRoot(0)).toBe(0)
      expect(e.getSize(0)).toBe(1)
      expect(e.degree(0)).toBe(0)
      expect(e.getDepth(0)).toBe(0)
      expect(e.getNeighbors(0)).toEqual([])
      expect(e.lca(0, 0)).toBe(0)
      expect(e.getPath(0, 0)).toEqual([0])
    })

    it('should handle two-vertex tree', () => {
      const e = new EulerTourTree(2)
      e.link(0, 1)
      expect(e.isConnected(0, 1)).toBe(true)
      expect(e.findRoot(0)).toBe(0)
      expect(e.getSize(0)).toBe(2)
      expect(e.degree(0)).toBe(1)
      expect(e.getDepth(1)).toBe(1)
      expect(e.lca(0, 1)).toBe(0)
      e.cut(0, 1)
      expect(e.isConnected(0, 1)).toBe(false)
    })

    it('should handle cut with reversed argument order', () => {
      ett.link(0, 1)
      ett.cut(1, 0)
      expect(ett.isConnected(0, 1)).toBe(false)
    })

    it('should handle link with reversed argument order', () => {
      ett.link(1, 0)
      expect(ett.isConnected(0, 1)).toBe(true)
      expect(ett.getEdges()).toEqual([[0, 1]])
    })

    it('should handle all vertices in one component', () => {
      const e = new EulerTourTree(5)
      for (let i = 0; i < 4; i++) {
        e.link(i, i + 1)
      }
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          expect(e.isConnected(i, j)).toBe(true)
        }
      }
    })

    it('should handle degenerate tree (path graph)', () => {
      const e = new EulerTourTree(6)
      for (let i = 0; i < 5; i++) {
        e.link(i, i + 1)
      }
      expect(e.getDepth(5)).toBe(5)
      expect(e.lca(0, 5)).toBe(0)
      const path = e.getPath(0, 5)
      expect(path.length).toBe(6)
      expect(path[0]).toBe(0)
      expect(path[5]).toBe(5)
    })

    it('should handle cutting root edge', () => {
      ett.link(0, 1)
      ett.link(0, 2)
      ett.link(0, 3)
      ett.cut(0, 1)
      expect(ett.isConnected(0, 2)).toBe(true)
      expect(ett.isConnected(0, 3)).toBe(true)
      expect(ett.isConnected(0, 1)).toBe(false)
    })

    it('should handle many cuts leaving isolated vertices', () => {
      ett.link(0, 1)
      ett.link(1, 2)
      ett.link(2, 3)
      ett.cut(0, 1)
      ett.cut(1, 2)
      ett.cut(2, 3)
      for (let i = 0; i < 4; i++) {
        expect(ett.degree(i)).toBe(0)
        expect(ett.getSize(i)).toBe(1)
      }
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_EULER_TOUR_TREE_OPTIONS', () => {
      expect(DEFAULT_EULER_TOUR_TREE_OPTIONS).toEqual({})
    })

    it('should support EulerTourTreeOptions interface', () => {
      const opts: EulerTourTreeOptions = {}
      expect(opts).toBeDefined()
    })

    it('should support TourNode interface', () => {
      const node: TourNode = {
        vertex: 1,
        left: null,
        right: null,
        parent: null,
        subtreeSize: 1,
      }
      expect(node.vertex).toBe(1)
      expect(node.subtreeSize).toBe(1)
    })
  })

  describe('additional edge cases', () => {
    it('should handle getPath between adjacent vertices in chain', () => {
      ett.link(0, 1)
      ett.link(1, 2)
      const path = ett.getPath(1, 2)
      expect(path).toEqual([1, 2])
    })

    it('should handle getPath between same vertex in connected component', () => {
      ett.link(0, 1)
      expect(ett.getPath(0, 0)).toEqual([0])
    })

    it('should handle degree of zero for isolated node', () => {
      expect(ett.degree(5)).toBe(0)
    })

    it('should handle getDepth of zero for isolated node', () => {
      expect(ett.getDepth(5)).toBe(0)
    })

    it('should handle lca of disconnected vertices in different components', () => {
      ett.link(0, 1)
      ett.link(2, 3)
      expect(ett.lca(0, 2)).toBe(-1)
    })

    it('should handle getNeighbors for node with single neighbor', () => {
      ett.link(0, 1)
      expect(ett.getNeighbors(0)).toEqual([1])
      expect(ett.getNeighbors(1)).toEqual([0])
    })

    it('should handle cut leaf edge in large tree', () => {
      ett.link(0, 1)
      ett.link(1, 2)
      ett.link(2, 3)
      ett.link(3, 4)
      ett.cut(3, 4)
      expect(ett.isConnected(0, 3)).toBe(true)
      expect(ett.isConnected(0, 4)).toBe(false)
      expect(ett.getSize(4)).toBe(1)
    })

    it('should handle reconnecting components after full disconnection', () => {
      ett.link(0, 1)
      ett.link(1, 2)
      ett.cut(0, 1)
      ett.cut(1, 2)
      expect(ett.isConnected(0, 1)).toBe(false)
      expect(ett.isConnected(1, 2)).toBe(false)
      ett.link(0, 2)
      expect(ett.isConnected(0, 2)).toBe(true)
      expect(ett.isConnected(0, 1)).toBe(false)
    })

    it('should handle findRoot consistency across operations', () => {
      ett.link(5, 3)
      ett.link(8, 2)
      ett.link(3, 2)
      const root = ett.findRoot(5)
      expect(ett.findRoot(3)).toBe(root)
      expect(ett.findRoot(8)).toBe(root)
      expect(ett.findRoot(2)).toBe(root)
    })

    it('should handle getEdges with multiple separate components', () => {
      ett.link(0, 1)
      ett.link(2, 3)
      ett.link(4, 5)
      const edges = ett.getEdges()
      expect(edges.length).toBe(3)
      for (const [a, b] of edges) {
        expect(a).toBeLessThan(b)
      }
    })

    it('should handle getPath for vertices separated by multiple edges', () => {
      ett.link(0, 1)
      ett.link(1, 2)
      ett.link(2, 3)
      ett.link(3, 4)
      const path = ett.getPath(0, 4)
      expect(path.length).toBe(5)
      expect(path).toEqual([0, 1, 2, 3, 4])
    })

    it('should handle depth after reconnection', () => {
      ett.link(0, 1)
      ett.link(1, 2)
      expect(ett.getDepth(2)).toBe(2)
      ett.cut(1, 2)
      ett.link(0, 2)
      expect(ett.getDepth(2)).toBe(1)
    })

    it('should handle lca of siblings in balanced tree', () => {
      ett.link(0, 1)
      ett.link(0, 2)
      ett.link(1, 3)
      ett.link(1, 4)
      ett.link(2, 5)
      ett.link(2, 6)
      expect(ett.lca(3, 4)).toBe(1)
      expect(ett.lca(5, 6)).toBe(2)
    })

    it('should handle getSize consistency', () => {
      ett.link(0, 1)
      ett.link(0, 2)
      ett.link(0, 3)
      const size0 = ett.getSize(0)
      const size1 = ett.getSize(1)
      const size2 = ett.getSize(2)
      const size3 = ett.getSize(3)
      expect(size0).toBe(size1)
      expect(size0).toBe(size2)
      expect(size0).toBe(size3)
      expect(size0).toBe(4)
    })

    it('should handle clone preserving all edges', () => {
      ett.link(0, 1)
      ett.link(2, 3)
      ett.link(4, 5)
      const cloned = ett.clone()
      const origEdges = ett.getEdges().sort((a, b) => a[0] - b[0])
      const cloneEdges = cloned.getEdges().sort((a, b) => a[0] - b[0])
      expect(origEdges).toEqual(cloneEdges)
    })

    it('should handle getNeighbors after multiple links and cuts', () => {
      ett.link(0, 1)
      ett.link(0, 2)
      ett.link(0, 3)
      ett.cut(0, 2)
      const neighbors = ett.getNeighbors(0)
      expect(neighbors).toContain(1)
      expect(neighbors).toContain(3)
      expect(neighbors).not.toContain(2)
      expect(neighbors.length).toBe(2)
    })

    it('should handle large star cut to smaller star', () => {
      for (let i = 1; i < 10; i++) {
        ett.link(0, i)
      }
      ett.cut(0, 5)
      expect(ett.getSize(0)).toBe(9)
      expect(ett.getSize(5)).toBe(1)
      expect(ett.degree(0)).toBe(8)
    })

    it('should handle connecting chain to form cycle attempt (prevented)', () => {
      ett.link(0, 1)
      ett.link(1, 2)
      ett.link(2, 3)
      ett.link(0, 3)
      expect(ett.getEdges().length).toBe(3)
      expect(ett.isConnected(0, 3)).toBe(true)
    })

    it('should handle getPath on long chain with branch', () => {
      ett.link(0, 1)
      ett.link(1, 2)
      ett.link(2, 3)
      ett.link(2, 4)
      ett.link(4, 5)
      const path = ett.getPath(3, 5)
      expect(path[0]).toBe(3)
      expect(path).toContain(2)
      expect(path).toContain(4)
      expect(path[path.length - 1]).toBe(5)
    })

    it('should handle multiple cut operations on same component', () => {
      ett.link(0, 1)
      ett.link(1, 2)
      ett.link(2, 3)
      ett.link(3, 4)
      ett.cut(1, 2)
      ett.cut(3, 4)
      expect(ett.getSize(0)).toBe(2)
      expect(ett.getSize(2)).toBe(2)
      expect(ett.getSize(4)).toBe(1)
    })
  })
})
