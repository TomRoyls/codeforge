import { describe, it, expect } from 'vitest'
import { GraphBFS2 } from '../../src/core/graph-bfs-2/index.js'

describe('GraphBFS2', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates an undirected graph by default', () => {
      const g = new GraphBFS2()
      g.addEdge(1, 2)
      expect(g.hasEdge(1, 2)).toBe(true)
      expect(g.hasEdge(2, 1)).toBe(true)
    })

    it('creates a directed graph when specified', () => {
      const g = new GraphBFS2(true)
      g.addEdge(1, 2)
      expect(g.hasEdge(1, 2)).toBe(true)
      expect(g.hasEdge(2, 1)).toBe(false)
    })
  })

  // ─── addVertex / hasVertex ───
  describe('addVertex / hasVertex', () => {
    it('adds a vertex and reports it exists', () => {
      const g = new GraphBFS2()
      g.addVertex(5)
      expect(g.hasVertex(5)).toBe(true)
    })

    it('does not duplicate a vertex', () => {
      const g = new GraphBFS2()
      g.addVertex(1)
      g.addVertex(1)
      expect(g.getVertexCount()).toBe(1)
    })

    it('returns false for nonexistent vertex', () => {
      const g = new GraphBFS2()
      expect(g.hasVertex(99)).toBe(false)
    })
  })

  // ─── addEdge / hasEdge ───
  describe('addEdge / hasEdge', () => {
    it('adds an edge and auto-creates vertices', () => {
      const g = new GraphBFS2()
      g.addEdge(1, 2)
      expect(g.hasEdge(1, 2)).toBe(true)
      expect(g.hasVertex(1)).toBe(true)
      expect(g.hasVertex(2)).toBe(true)
    })

    it('returns false for nonexistent edge', () => {
      const g = new GraphBFS2()
      expect(g.hasEdge(1, 2)).toBe(false)
    })

    it('undirected graph has symmetric edges', () => {
      const g = new GraphBFS2()
      g.addEdge(1, 2)
      expect(g.hasEdge(2, 1)).toBe(true)
    })

    it('directed graph does not have reverse edge', () => {
      const g = new GraphBFS2(true)
      g.addEdge(1, 2)
      expect(g.hasEdge(2, 1)).toBe(false)
    })
  })

  // ─── getVertexCount / getEdgeCount ───
  describe('getVertexCount / getEdgeCount', () => {
    it('reports correct counts', () => {
      const g = new GraphBFS2()
      expect(g.getVertexCount()).toBe(0)
      expect(g.getEdgeCount()).toBe(0)
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      expect(g.getVertexCount()).toBe(3)
      expect(g.getEdgeCount()).toBe(2)
    })

    it('directed graph counts all directed edges', () => {
      const g = new GraphBFS2(true)
      g.addEdge(1, 2)
      g.addEdge(2, 1)
      expect(g.getEdgeCount()).toBe(2)
    })
  })

  // ─── bfs ───
  describe('bfs', () => {
    it('traverses in BFS order', () => {
      const g = new GraphBFS2()
      g.addEdge(1, 2)
      g.addEdge(1, 3)
      g.addEdge(2, 4)
      const visited: number[] = []
      g.bfs(1, (n) => visited.push(n))
      expect(visited[0]).toBe(1)
      expect(visited).toContain(2)
      expect(visited).toContain(3)
      expect(visited).toContain(4)
      expect(visited.length).toBe(4)
    })

    it('does nothing for nonexistent start vertex', () => {
      const g = new GraphBFS2()
      const visited: number[] = []
      g.bfs(99, (n) => visited.push(n))
      expect(visited).toEqual([])
    })

    it('handles single vertex', () => {
      const g = new GraphBFS2()
      g.addVertex(1)
      const visited: number[] = []
      g.bfs(1, (n) => visited.push(n))
      expect(visited).toEqual([1])
    })
  })

  // ─── shortestPath ───
  describe('shortestPath', () => {
    it('finds shortest path between two vertices', () => {
      const g = new GraphBFS2()
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      g.addEdge(3, 4)
      expect(g.shortestPath(1, 4)).toEqual([1, 2, 3, 4])
    })

    it('returns [start] when start === end', () => {
      const g = new GraphBFS2()
      g.addVertex(1)
      expect(g.shortestPath(1, 1)).toEqual([1])
    })

    it('returns null when no path exists', () => {
      const g = new GraphBFS2()
      g.addVertex(1)
      g.addVertex(2)
      expect(g.shortestPath(1, 2)).toBeNull()
    })

    it('returns null for nonexistent vertices', () => {
      const g = new GraphBFS2()
      expect(g.shortestPath(1, 2)).toBeNull()
    })
  })

  // ─── bfsLevels ───
  describe('bfsLevels', () => {
    it('returns levels of BFS traversal', () => {
      const g = new GraphBFS2()
      g.addEdge(1, 2)
      g.addEdge(1, 3)
      g.addEdge(2, 4)
      const levels = g.bfsLevels(1)
      expect(levels[0]).toEqual([1])
      expect(levels[1].sort()).toEqual([2, 3])
      expect(levels[2]).toEqual([4])
    })

    it('returns empty for nonexistent start', () => {
      const g = new GraphBFS2()
      expect(g.bfsLevels(99)).toEqual([])
    })

    it('handles single vertex', () => {
      const g = new GraphBFS2()
      g.addVertex(1)
      expect(g.bfsLevels(1)).toEqual([[1]])
    })
  })

  // ─── findConnectedComponents ───
  describe('findConnectedComponents', () => {
    it('returns single component for connected graph', () => {
      const g = new GraphBFS2()
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      const comps = g.findConnectedComponents()
      expect(comps.length).toBe(1)
      expect(comps[0]!.sort()).toEqual([1, 2, 3])
    })

    it('returns multiple components for disconnected graph', () => {
      const g = new GraphBFS2()
      g.addEdge(1, 2)
      g.addEdge(3, 4)
      const comps = g.findConnectedComponents()
      expect(comps.length).toBe(2)
    })

    it('returns empty for empty graph', () => {
      const g = new GraphBFS2()
      expect(g.findConnectedComponents()).toEqual([])
    })

    it('handles isolated vertices', () => {
      const g = new GraphBFS2()
      g.addVertex(1)
      g.addVertex(2)
      const comps = g.findConnectedComponents()
      expect(comps.length).toBe(2)
    })
  })

  // ─── isBipartite ───
  describe('isBipartite', () => {
    it('returns true for bipartite graph', () => {
      const g = new GraphBFS2()
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      g.addEdge(3, 4)
      expect(g.isBipartite()).toBe(true)
    })

    it('returns false for non-bipartite graph (odd cycle)', () => {
      const g = new GraphBFS2()
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      g.addEdge(3, 1)
      expect(g.isBipartite()).toBe(false)
    })

    it('returns true for empty graph', () => {
      const g = new GraphBFS2()
      expect(g.isBipartite()).toBe(true)
    })
  })

  // ─── hasCycle ───
  describe('hasCycle', () => {
    it('returns false for tree (acyclic undirected)', () => {
      const g = new GraphBFS2()
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      expect(g.hasCycle()).toBe(false)
    })

    it('returns true for graph with cycle', () => {
      const g = new GraphBFS2()
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      g.addEdge(3, 1)
      expect(g.hasCycle()).toBe(true)
    })

    it('returns false for single vertex', () => {
      const g = new GraphBFS2()
      g.addVertex(1)
      expect(g.hasCycle()).toBe(false)
    })

    it('returns false for empty graph', () => {
      const g = new GraphBFS2()
      expect(g.hasCycle()).toBe(false)
    })
  })

  // ─── getTimeComplexity ───
  describe('getTimeComplexity', () => {
    it('returns known complexity for valid operations', () => {
      const g = new GraphBFS2()
      expect(g.getTimeComplexity('addVertex')).toBe('O(1)')
      expect(g.getTimeComplexity('bfs')).toBe('O(V + E)')
    })

    it('returns Unknown for unknown operations', () => {
      const g = new GraphBFS2()
      expect(g.getTimeComplexity('nonexistent')).toBe('Unknown')
    })
  })

  // ─── Edge cases ───
  describe('edge cases', () => {
    it('handles negative vertex IDs', () => {
      const g = new GraphBFS2()
      g.addEdge(-1, -2)
      expect(g.hasVertex(-1)).toBe(true)
      expect(g.hasEdge(-1, -2)).toBe(true)
    })

    it('handles duplicate edges', () => {
      const g = new GraphBFS2()
      g.addEdge(1, 2)
      g.addEdge(1, 2)
      expect(g.hasEdge(1, 2)).toBe(true)
    })
  })
})
