import { describe, it, expect } from 'vitest'
import { GraphBFS } from '../../src/core/graph-bfs/index.js'

describe('GraphBFS', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates an undirected graph by default', () => {
      const g = new GraphBFS()
      g.addEdge(1, 2)
      expect(g.hasEdge(1, 2)).toBe(true)
      expect(g.hasEdge(2, 1)).toBe(true)
    })

    it('creates a directed graph when specified', () => {
      const g = new GraphBFS(true)
      g.addEdge(1, 2)
      expect(g.hasEdge(1, 2)).toBe(true)
      expect(g.hasEdge(2, 1)).toBe(false)
    })
  })

  // ─── addVertex / hasVertex ───
  describe('addVertex / hasVertex', () => {
    it('adds a vertex and reports it exists', () => {
      const g = new GraphBFS()
      g.addVertex(5)
      expect(g.hasVertex(5)).toBe(true)
    })

    it('does not duplicate a vertex', () => {
      const g = new GraphBFS()
      g.addVertex(1)
      g.addVertex(1)
      expect(g.vertexCount).toBe(1)
    })

    it('returns false for nonexistent vertex', () => {
      const g = new GraphBFS()
      expect(g.hasVertex(99)).toBe(false)
    })
  })

  // ─── addEdge / hasEdge ───
  describe('addEdge / hasEdge', () => {
    it('adds an edge and auto-creates vertices', () => {
      const g = new GraphBFS()
      g.addEdge(1, 2)
      expect(g.hasEdge(1, 2)).toBe(true)
      expect(g.hasVertex(1)).toBe(true)
      expect(g.hasVertex(2)).toBe(true)
    })

    it('adds weighted edge', () => {
      const g = new GraphBFS()
      g.addEdge(1, 2, 5)
      const e = g.edges()
      expect(e.some(([f, t, w]) => f === 1 && t === 2 && w === 5)).toBe(true)
    })

    it('returns false for nonexistent edge', () => {
      const g = new GraphBFS()
      expect(g.hasEdge(1, 2)).toBe(false)
    })

    it('undirected graph has symmetric edges', () => {
      const g = new GraphBFS()
      g.addEdge(1, 2)
      expect(g.hasEdge(2, 1)).toBe(true)
    })

    it('directed graph does not have reverse edge', () => {
      const g = new GraphBFS(true)
      g.addEdge(1, 2)
      expect(g.hasEdge(2, 1)).toBe(false)
    })
  })

  // ─── removeVertex ───
  describe('removeVertex', () => {
    it('removes a vertex and its incident edges', () => {
      const g = new GraphBFS()
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      g.removeVertex(2)
      expect(g.hasVertex(2)).toBe(false)
      expect(g.hasEdge(1, 2)).toBe(false)
      expect(g.hasEdge(2, 3)).toBe(false)
    })

    it('removing nonexistent vertex is a no-op', () => {
      const g = new GraphBFS()
      g.addVertex(1)
      g.removeVertex(99)
      expect(g.vertexCount).toBe(1)
    })
  })

  // ─── removeEdge ───
  describe('removeEdge', () => {
    it('removes an edge in undirected graph', () => {
      const g = new GraphBFS()
      g.addEdge(1, 2)
      g.removeEdge(1, 2)
      expect(g.hasEdge(1, 2)).toBe(false)
      expect(g.hasEdge(2, 1)).toBe(false)
    })

    it('removes only forward edge in directed graph', () => {
      const g = new GraphBFS(true)
      g.addEdge(1, 2)
      g.addEdge(2, 1)
      g.removeEdge(1, 2)
      expect(g.hasEdge(1, 2)).toBe(false)
      expect(g.hasEdge(2, 1)).toBe(true)
    })
  })

  // ─── vertices / edges ───
  describe('vertices / edges', () => {
    it('returns all vertices', () => {
      const g = new GraphBFS()
      g.addEdge(1, 2)
      g.addEdge(3, 4)
      expect(g.vertices().sort()).toEqual([1, 2, 3, 4])
    })

    it('returns empty array for empty graph', () => {
      const g = new GraphBFS()
      expect(g.vertices()).toEqual([])
      expect(g.edges()).toEqual([])
    })

    it('returns edges without duplicates for undirected graph', () => {
      const g = new GraphBFS()
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      expect(g.edgeCount).toBe(2)
    })

    it('returns all directed edges', () => {
      const g = new GraphBFS(true)
      g.addEdge(1, 2)
      g.addEdge(2, 1)
      expect(g.edgeCount).toBe(2)
    })
  })

  // ─── vertexCount / edgeCount ───
  describe('vertexCount / edgeCount', () => {
    it('reports correct counts', () => {
      const g = new GraphBFS()
      expect(g.vertexCount).toBe(0)
      expect(g.edgeCount).toBe(0)
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      expect(g.vertexCount).toBe(3)
      expect(g.edgeCount).toBe(2)
    })
  })

  // ─── bfs ───
  describe('bfs', () => {
    it('traverses in BFS order', () => {
      const g = new GraphBFS()
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
      const g = new GraphBFS()
      const visited: number[] = []
      g.bfs(99, (n) => visited.push(n))
      expect(visited).toEqual([])
    })

    it('handles single vertex', () => {
      const g = new GraphBFS()
      g.addVertex(1)
      const visited: number[] = []
      g.bfs(1, (n) => visited.push(n))
      expect(visited).toEqual([1])
    })
  })

  // ─── shortestPath ───
  describe('shortestPath', () => {
    it('finds shortest path between two vertices', () => {
      const g = new GraphBFS()
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      g.addEdge(3, 4)
      const path = g.shortestPath(1, 4)
      expect(path).toEqual([1, 2, 3, 4])
    })

    it('returns [from] when from === to', () => {
      const g = new GraphBFS()
      g.addVertex(1)
      expect(g.shortestPath(1, 1)).toEqual([1])
    })

    it('returns null when no path exists', () => {
      const g = new GraphBFS()
      g.addVertex(1)
      g.addVertex(2)
      expect(g.shortestPath(1, 2)).toBeNull()
    })

    it('returns null for nonexistent vertices', () => {
      const g = new GraphBFS()
      expect(g.shortestPath(1, 2)).toBeNull()
    })
  })

  // ─── distances ───
  describe('distances', () => {
    it('computes distances from source', () => {
      const g = new GraphBFS()
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      const d = g.distances(1)
      expect(d.get(1)).toBe(0)
      expect(d.get(2)).toBe(1)
      expect(d.get(3)).toBe(2)
    })

    it('returns -1 for unreachable vertices', () => {
      const g = new GraphBFS()
      g.addVertex(1)
      g.addVertex(2)
      const d = g.distances(1)
      expect(d.get(2)).toBe(-1)
    })

    it('returns -1 for all vertices when source does not exist', () => {
      const g = new GraphBFS()
      g.addVertex(1)
      const d = g.distances(99)
      expect(d.get(1)).toBe(-1)
    })
  })

  // ─── bfsLevelOrder ───
  describe('bfsLevelOrder', () => {
    it('returns levels of BFS traversal', () => {
      const g = new GraphBFS()
      g.addEdge(1, 2)
      g.addEdge(1, 3)
      g.addEdge(2, 4)
      const levels = g.bfsLevelOrder(1)
      expect(levels[0]).toEqual([1])
      expect(levels[1].sort()).toEqual([2, 3])
      expect(levels[2]).toEqual([4])
    })

    it('returns empty for nonexistent start', () => {
      const g = new GraphBFS()
      expect(g.bfsLevelOrder(99)).toEqual([])
    })

    it('handles single vertex', () => {
      const g = new GraphBFS()
      g.addVertex(1)
      expect(g.bfsLevelOrder(1)).toEqual([[1]])
    })
  })

  // ─── isBipartite ───
  describe('isBipartite', () => {
    it('returns true for bipartite graph', () => {
      const g = new GraphBFS()
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      g.addEdge(3, 4)
      expect(g.isBipartite()).toBe(true)
    })

    it('returns false for non-bipartite graph (odd cycle)', () => {
      const g = new GraphBFS()
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      g.addEdge(3, 1)
      expect(g.isBipartite()).toBe(false)
    })

    it('returns true for empty graph', () => {
      const g = new GraphBFS()
      expect(g.isBipartite()).toBe(true)
    })

    it('returns true for single vertex', () => {
      const g = new GraphBFS()
      g.addVertex(1)
      expect(g.isBipartite()).toBe(true)
    })
  })

  // ─── getConnectedComponents ───
  describe('getConnectedComponents', () => {
    it('returns single component for connected graph', () => {
      const g = new GraphBFS()
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      const comps = g.getConnectedComponents()
      expect(comps.length).toBe(1)
      expect(comps[0]!.sort()).toEqual([1, 2, 3])
    })

    it('returns multiple components for disconnected graph', () => {
      const g = new GraphBFS()
      g.addEdge(1, 2)
      g.addEdge(3, 4)
      const comps = g.getConnectedComponents()
      expect(comps.length).toBe(2)
    })

    it('returns empty for empty graph', () => {
      const g = new GraphBFS()
      expect(g.getConnectedComponents()).toEqual([])
    })

    it('handles isolated vertices', () => {
      const g = new GraphBFS()
      g.addVertex(1)
      g.addVertex(2)
      const comps = g.getConnectedComponents()
      expect(comps.length).toBe(2)
    })
  })

  // ─── Edge cases ───
  describe('edge cases', () => {
    it('handles negative vertex IDs', () => {
      const g = new GraphBFS()
      g.addEdge(-1, -2)
      expect(g.hasVertex(-1)).toBe(true)
      expect(g.hasEdge(-1, -2)).toBe(true)
    })

    it('handles self-loop in directed graph', () => {
      const g = new GraphBFS(true)
      g.addEdge(1, 1)
      expect(g.hasEdge(1, 1)).toBe(true)
    })

    it('handles duplicate edges', () => {
      const g = new GraphBFS()
      g.addEdge(1, 2)
      g.addEdge(1, 2)
      expect(g.hasEdge(1, 2)).toBe(true)
    })
  })
})
