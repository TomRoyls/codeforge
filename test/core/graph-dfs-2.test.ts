import { describe, it, expect } from 'vitest'
import { GraphDFS2 } from '../../src/core/graph-dfs-2/index.js'

describe('GraphDFS2', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates an undirected graph by default', () => {
      const g = new GraphDFS2()
      g.addEdge(1, 2)
      expect(g.hasEdge(1, 2)).toBe(true)
      expect(g.hasEdge(2, 1)).toBe(true)
    })

    it('creates a directed graph when specified', () => {
      const g = new GraphDFS2(true)
      g.addEdge(1, 2)
      expect(g.hasEdge(1, 2)).toBe(true)
      expect(g.hasEdge(2, 1)).toBe(false)
    })
  })

  // ─── addVertex / hasVertex ───
  describe('addVertex / hasVertex', () => {
    it('adds a vertex and reports it exists', () => {
      const g = new GraphDFS2()
      g.addVertex(5)
      expect(g.hasVertex(5)).toBe(true)
    })

    it('does not duplicate a vertex', () => {
      const g = new GraphDFS2()
      g.addVertex(1)
      g.addVertex(1)
      expect(g.vertexCount).toBe(1)
    })

    it('returns false for nonexistent vertex', () => {
      const g = new GraphDFS2()
      expect(g.hasVertex(99)).toBe(false)
    })
  })

  // ─── addEdge / hasEdge ───
  describe('addEdge / hasEdge', () => {
    it('adds an edge and auto-creates vertices', () => {
      const g = new GraphDFS2()
      g.addEdge(1, 2)
      expect(g.hasEdge(1, 2)).toBe(true)
      expect(g.hasVertex(1)).toBe(true)
      expect(g.hasVertex(2)).toBe(true)
    })

    it('returns false for nonexistent edge', () => {
      const g = new GraphDFS2()
      expect(g.hasEdge(1, 2)).toBe(false)
    })

    it('undirected graph has symmetric edges', () => {
      const g = new GraphDFS2()
      g.addEdge(1, 2)
      expect(g.hasEdge(2, 1)).toBe(true)
    })

    it('directed graph does not have reverse edge', () => {
      const g = new GraphDFS2(true)
      g.addEdge(1, 2)
      expect(g.hasEdge(2, 1)).toBe(false)
    })
  })

  // ─── vertexCount / edgeCount ───
  describe('vertexCount / edgeCount', () => {
    it('reports correct counts', () => {
      const g = new GraphDFS2()
      expect(g.vertexCount).toBe(0)
      expect(g.edgeCount).toBe(0)
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      expect(g.vertexCount).toBe(3)
      expect(g.edgeCount).toBe(2)
    })

    it('counts directed edges separately', () => {
      const g = new GraphDFS2(true)
      g.addEdge(1, 2)
      g.addEdge(2, 1)
      expect(g.edgeCount).toBe(2)
    })
  })

  // ─── dfs ───
  describe('dfs', () => {
    it('returns DFS traversal order', () => {
      const g = new GraphDFS2()
      g.addEdge(1, 2)
      g.addEdge(1, 3)
      g.addEdge(2, 4)
      const result = g.dfs(1)
      expect(result[0]).toBe(1)
      expect(result.length).toBe(4)
      expect(result.sort()).toEqual([1, 2, 3, 4])
    })

    it('returns empty for nonexistent start', () => {
      const g = new GraphDFS2()
      expect(g.dfs(99)).toEqual([])
    })

    it('handles single vertex', () => {
      const g = new GraphDFS2()
      g.addVertex(1)
      expect(g.dfs(1)).toEqual([1])
    })
  })

  // ─── topologicalSort ───
  describe('topologicalSort', () => {
    it('returns topological order for DAG', () => {
      const g = new GraphDFS2(true)
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      const order = g.topologicalSort()
      expect(order).not.toBeNull()
      expect(order!.indexOf(1)).toBeLessThan(order!.indexOf(2))
      expect(order!.indexOf(2)).toBeLessThan(order!.indexOf(3))
    })

    it('returns null for undirected graph', () => {
      const g = new GraphDFS2()
      g.addEdge(1, 2)
      expect(g.topologicalSort()).toBeNull()
    })

    it('returns null for cyclic directed graph', () => {
      const g = new GraphDFS2(true)
      g.addEdge(1, 2)
      g.addEdge(2, 1)
      expect(g.topologicalSort()).toBeNull()
    })

    it('returns all vertices in result', () => {
      const g = new GraphDFS2(true)
      g.addEdge(1, 2)
      g.addEdge(1, 3)
      const order = g.topologicalSort()
      expect(order!.sort()).toEqual([1, 2, 3])
    })
  })

  // ─── detectCycle ───
  describe('detectCycle', () => {
    it('returns false for DAG', () => {
      const g = new GraphDFS2(true)
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      expect(g.detectCycle()).toBe(false)
    })

    it('detects cycle in directed graph', () => {
      const g = new GraphDFS2(true)
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      g.addEdge(3, 1)
      expect(g.detectCycle()).toBe(true)
    })

    it('returns false for empty graph', () => {
      const g = new GraphDFS2()
      expect(g.detectCycle()).toBe(false)
    })

    it('returns false for single vertex', () => {
      const g = new GraphDFS2()
      g.addVertex(1)
      expect(g.detectCycle()).toBe(false)
    })
  })

  // ─── findPath ───
  describe('findPath', () => {
    it('finds a path between two vertices', () => {
      const g = new GraphDFS2()
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      const path = g.findPath(1, 3)
      expect(path).not.toBeNull()
      expect(path![0]).toBe(1)
      expect(path![path!.length - 1]).toBe(3)
    })

    it('returns [start] when start === end', () => {
      const g = new GraphDFS2()
      g.addVertex(1)
      expect(g.findPath(1, 1)).toEqual([1])
    })

    it('returns null when no path exists', () => {
      const g = new GraphDFS2()
      g.addVertex(1)
      g.addVertex(2)
      expect(g.findPath(1, 2)).toBeNull()
    })

    it('returns null for nonexistent vertices', () => {
      const g = new GraphDFS2()
      expect(g.findPath(1, 2)).toBeNull()
    })
  })

  // ─── findConnectedComponents ───
  describe('findConnectedComponents', () => {
    it('returns single component for connected graph', () => {
      const g = new GraphDFS2()
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      const comps = g.findConnectedComponents()
      expect(comps.length).toBe(1)
      expect(comps[0]!.sort()).toEqual([1, 2, 3])
    })

    it('returns multiple components for disconnected graph', () => {
      const g = new GraphDFS2()
      g.addEdge(1, 2)
      g.addEdge(3, 4)
      const comps = g.findConnectedComponents()
      expect(comps.length).toBe(2)
    })

    it('returns empty for empty graph', () => {
      const g = new GraphDFS2()
      expect(g.findConnectedComponents()).toEqual([])
    })

    it('handles isolated vertices', () => {
      const g = new GraphDFS2()
      g.addVertex(1)
      g.addVertex(2)
      const comps = g.findConnectedComponents()
      expect(comps.length).toBe(2)
    })
  })

  // ─── isBipartite ───
  describe('isBipartite', () => {
    it('returns true for bipartite graph', () => {
      const g = new GraphDFS2()
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      g.addEdge(3, 4)
      expect(g.isBipartite()).toBe(true)
    })

    it('returns false for non-bipartite graph (odd cycle)', () => {
      const g = new GraphDFS2()
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      g.addEdge(3, 1)
      expect(g.isBipartite()).toBe(false)
    })

    it('returns true for empty graph', () => {
      const g = new GraphDFS2()
      expect(g.isBipartite()).toBe(true)
    })

    it('returns true for single vertex', () => {
      const g = new GraphDFS2()
      g.addVertex(1)
      expect(g.isBipartite()).toBe(true)
    })
  })

  // ─── getTimeComplexity ───
  describe('getTimeComplexity', () => {
    it('returns complexity info for all operations', () => {
      const g = new GraphDFS2()
      const info = g.getTimeComplexity()
      expect(info.length).toBeGreaterThan(0)
      const addVertex = info.find((i) => i.operation === 'addVertex')
      expect(addVertex).toBeDefined()
      expect(addVertex!.time).toBe('O(1)')
      expect(addVertex!.space).toBe('O(1)')
    })

    it('includes all expected operations', () => {
      const g = new GraphDFS2()
      const info = g.getTimeComplexity()
      const ops = info.map((i) => i.operation)
      expect(ops).toContain('addVertex')
      expect(ops).toContain('addEdge')
      expect(ops).toContain('dfs')
      expect(ops).toContain('topologicalSort')
      expect(ops).toContain('detectCycle')
      expect(ops).toContain('findPath')
      expect(ops).toContain('findConnectedComponents')
      expect(ops).toContain('isBipartite')
    })
  })

  // ─── Edge cases ───
  describe('edge cases', () => {
    it('handles negative vertex IDs', () => {
      const g = new GraphDFS2()
      g.addEdge(-1, -2)
      expect(g.hasVertex(-1)).toBe(true)
      expect(g.hasEdge(-1, -2)).toBe(true)
    })

    it('handles duplicate edges', () => {
      const g = new GraphDFS2()
      g.addEdge(1, 2)
      g.addEdge(1, 2)
      expect(g.hasEdge(1, 2)).toBe(true)
    })
  })
})
