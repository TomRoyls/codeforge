import { describe, it, expect } from 'vitest'
import { GraphTopoSort } from '../../src/core/graph-toposort/index.js'

describe('GraphTopoSort', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates an empty directed graph', () => {
      const g = new GraphTopoSort()
      expect(g.vertexCount).toBe(0)
      expect(g.edgeCount).toBe(0)
    })
  })

  // ─── addVertex / hasVertex ───
  describe('addVertex / hasVertex', () => {
    it('adds a vertex and reports it exists', () => {
      const g = new GraphTopoSort()
      g.addVertex(5)
      expect(g.hasVertex(5)).toBe(true)
    })

    it('does not duplicate a vertex', () => {
      const g = new GraphTopoSort()
      g.addVertex(1)
      g.addVertex(1)
      expect(g.vertexCount).toBe(1)
    })

    it('returns false for nonexistent vertex', () => {
      const g = new GraphTopoSort()
      expect(g.hasVertex(99)).toBe(false)
    })
  })

  // ─── addEdge / hasEdge ───
  describe('addEdge / hasEdge', () => {
    it('adds an edge and auto-creates vertices', () => {
      const g = new GraphTopoSort()
      g.addEdge(1, 2)
      expect(g.hasEdge(1, 2)).toBe(true)
      expect(g.hasVertex(1)).toBe(true)
      expect(g.hasVertex(2)).toBe(true)
    })

    it('returns false for nonexistent edge', () => {
      const g = new GraphTopoSort()
      expect(g.hasEdge(1, 2)).toBe(false)
    })

    it('supports multiple edges from same vertex', () => {
      const g = new GraphTopoSort()
      g.addEdge(1, 2)
      g.addEdge(1, 3)
      expect(g.hasEdge(1, 2)).toBe(true)
      expect(g.hasEdge(1, 3)).toBe(true)
    })

    it('is directed (no reverse edge)', () => {
      const g = new GraphTopoSort()
      g.addEdge(1, 2)
      expect(g.hasEdge(2, 1)).toBe(false)
    })
  })

  // ─── removeVertex ───
  describe('removeVertex', () => {
    it('removes a vertex and its incident edges', () => {
      const g = new GraphTopoSort()
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      g.removeVertex(2)
      expect(g.hasVertex(2)).toBe(false)
      expect(g.hasEdge(1, 2)).toBe(false)
      expect(g.hasEdge(2, 3)).toBe(false)
    })

    it('removing nonexistent vertex is a no-op', () => {
      const g = new GraphTopoSort()
      g.addVertex(1)
      g.removeVertex(99)
      expect(g.vertexCount).toBe(1)
    })
  })

  // ─── removeEdge ───
  describe('removeEdge', () => {
    it('removes an edge', () => {
      const g = new GraphTopoSort()
      g.addEdge(1, 2)
      g.removeEdge(1, 2)
      expect(g.hasEdge(1, 2)).toBe(false)
    })

    it('removing nonexistent edge is a no-op', () => {
      const g = new GraphTopoSort()
      g.addVertex(1)
      g.addVertex(2)
      g.removeEdge(1, 2)
      expect(g.hasEdge(1, 2)).toBe(false)
    })
  })

  // ─── vertices / edges ───
  describe('vertices / edges', () => {
    it('returns all vertices', () => {
      const g = new GraphTopoSort()
      g.addEdge(1, 2)
      g.addEdge(3, 4)
      expect(g.vertices().sort()).toEqual([1, 2, 3, 4])
    })

    it('returns all edges', () => {
      const g = new GraphTopoSort()
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      const e = g.edges()
      expect(e.length).toBe(2)
    })

    it('returns empty for empty graph', () => {
      const g = new GraphTopoSort()
      expect(g.vertices()).toEqual([])
      expect(g.edges()).toEqual([])
    })
  })

  // ─── vertexCount / edgeCount ───
  describe('vertexCount / edgeCount', () => {
    it('reports correct counts', () => {
      const g = new GraphTopoSort()
      expect(g.vertexCount).toBe(0)
      expect(g.edgeCount).toBe(0)
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      expect(g.vertexCount).toBe(3)
      expect(g.edgeCount).toBe(2)
    })
  })

  // ─── getInDegree / getOutDegree ───
  describe('getInDegree / getOutDegree', () => {
    it('computes in-degree correctly', () => {
      const g = new GraphTopoSort()
      g.addEdge(1, 3)
      g.addEdge(2, 3)
      expect(g.getInDegree(3)).toBe(2)
      expect(g.getInDegree(1)).toBe(0)
    })

    it('computes out-degree correctly', () => {
      const g = new GraphTopoSort()
      g.addEdge(1, 2)
      g.addEdge(1, 3)
      expect(g.getOutDegree(1)).toBe(2)
      expect(g.getOutDegree(2)).toBe(0)
    })

    it('returns 0 for nonexistent vertex', () => {
      const g = new GraphTopoSort()
      expect(g.getInDegree(99)).toBe(0)
      expect(g.getOutDegree(99)).toBe(0)
    })
  })

  // ─── getSourceVertices / getSinkVertices ───
  describe('getSourceVertices / getSinkVertices', () => {
    it('finds source vertices (in-degree 0)', () => {
      const g = new GraphTopoSort()
      g.addEdge(1, 2)
      g.addEdge(1, 3)
      const sources = g.getSourceVertices()
      expect(sources).toContain(1)
      expect(sources).not.toContain(2)
    })

    it('finds sink vertices (out-degree 0)', () => {
      const g = new GraphTopoSort()
      g.addEdge(1, 2)
      g.addEdge(1, 3)
      const sinks = g.getSinkVertices()
      expect(sinks).toContain(2)
      expect(sinks).toContain(3)
      expect(sinks).not.toContain(1)
    })

    it('returns all vertices as sources for empty graph with vertices', () => {
      const g = new GraphTopoSort()
      g.addVertex(1)
      g.addVertex(2)
      expect(g.getSourceVertices().sort()).toEqual([1, 2])
      expect(g.getSinkVertices().sort()).toEqual([1, 2])
    })
  })

  // ─── topologicalSort (DFS) ───
  describe('topologicalSort', () => {
    it('returns valid topological order for DAG', () => {
      const g = new GraphTopoSort()
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      const order = g.topologicalSort()
      expect(order).not.toBeNull()
      expect(order!.indexOf(1)).toBeLessThan(order!.indexOf(2))
      expect(order!.indexOf(2)).toBeLessThan(order!.indexOf(3))
    })

    it('returns null for cyclic graph', () => {
      const g = new GraphTopoSort()
      g.addEdge(1, 2)
      g.addEdge(2, 1)
      expect(g.topologicalSort()).toBeNull()
    })

    it('returns all vertices', () => {
      const g = new GraphTopoSort()
      g.addEdge(1, 2)
      g.addEdge(1, 3)
      const order = g.topologicalSort()
      expect(order!.sort()).toEqual([1, 2, 3])
    })

    it('handles single vertex', () => {
      const g = new GraphTopoSort()
      g.addVertex(1)
      expect(g.topologicalSort()).toEqual([1])
    })

    it('handles empty graph', () => {
      const g = new GraphTopoSort()
      expect(g.topologicalSort()).toEqual([])
    })

    it('handles diamond dependency', () => {
      const g = new GraphTopoSort()
      g.addEdge(1, 2)
      g.addEdge(1, 3)
      g.addEdge(2, 4)
      g.addEdge(3, 4)
      const order = g.topologicalSort()
      expect(order).not.toBeNull()
      expect(order!.indexOf(1)).toBeLessThan(order!.indexOf(2))
      expect(order!.indexOf(1)).toBeLessThan(order!.indexOf(3))
      expect(order!.indexOf(2)).toBeLessThan(order!.indexOf(4))
      expect(order!.indexOf(3)).toBeLessThan(order!.indexOf(4))
    })
  })

  // ─── topologicalSortKahn ───
  describe('topologicalSortKahn', () => {
    it('returns valid topological order for DAG', () => {
      const g = new GraphTopoSort()
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      const order = g.topologicalSortKahn()
      expect(order).not.toBeNull()
      expect(order!.indexOf(1)).toBeLessThan(order!.indexOf(2))
      expect(order!.indexOf(2)).toBeLessThan(order!.indexOf(3))
    })

    it('returns null for cyclic graph', () => {
      const g = new GraphTopoSort()
      g.addEdge(1, 2)
      g.addEdge(2, 1)
      expect(g.topologicalSortKahn()).toBeNull()
    })

    it('returns all vertices', () => {
      const g = new GraphTopoSort()
      g.addEdge(1, 2)
      g.addEdge(1, 3)
      const order = g.topologicalSortKahn()
      expect(order!.sort()).toEqual([1, 2, 3])
    })

    it('handles single vertex', () => {
      const g = new GraphTopoSort()
      g.addVertex(1)
      expect(g.topologicalSortKahn()).toEqual([1])
    })

    it('handles empty graph', () => {
      const g = new GraphTopoSort()
      expect(g.topologicalSortKahn()).toEqual([])
    })
  })

  // ─── isDAG / hasCycle ───
  describe('isDAG / hasCycle', () => {
    it('isDAG returns true for acyclic graph', () => {
      const g = new GraphTopoSort()
      g.addEdge(1, 2)
      expect(g.isDAG()).toBe(true)
    })

    it('isDAG returns false for cyclic graph', () => {
      const g = new GraphTopoSort()
      g.addEdge(1, 2)
      g.addEdge(2, 1)
      expect(g.isDAG()).toBe(false)
    })

    it('hasCycle returns true for cyclic graph', () => {
      const g = new GraphTopoSort()
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      g.addEdge(3, 1)
      expect(g.hasCycle()).toBe(true)
    })

    it('hasCycle returns false for acyclic graph', () => {
      const g = new GraphTopoSort()
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      expect(g.hasCycle()).toBe(false)
    })

    it('empty graph is a DAG with no cycle', () => {
      const g = new GraphTopoSort()
      expect(g.isDAG()).toBe(true)
      expect(g.hasCycle()).toBe(false)
    })
  })

  // ─── Edge cases ───
  describe('edge cases', () => {
    it('handles negative vertex IDs', () => {
      const g = new GraphTopoSort()
      g.addEdge(-1, -2)
      expect(g.hasVertex(-1)).toBe(true)
      expect(g.hasEdge(-1, -2)).toBe(true)
    })

    it('handles self-loop as a cycle', () => {
      const g = new GraphTopoSort()
      g.addEdge(1, 1)
      expect(g.hasCycle()).toBe(true)
      expect(g.isDAG()).toBe(false)
    })

    it('handles isolated vertices in topo sort', () => {
      const g = new GraphTopoSort()
      g.addVertex(1)
      g.addVertex(2)
      g.addEdge(3, 4)
      const order = g.topologicalSort()
      expect(order).not.toBeNull()
      expect(order!.length).toBe(4)
    })
  })
})
