import { describe, it, expect } from 'vitest'
import { GraphDFS } from '../../src/core/graph-dfs/index.js'

describe('GraphDFS', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates an undirected graph by default', () => {
      const g = new GraphDFS()
      g.addEdge(1, 2)
      expect(g.hasEdge(1, 2)).toBe(true)
      expect(g.hasEdge(2, 1)).toBe(true)
    })

    it('creates a directed graph when specified', () => {
      const g = new GraphDFS(true)
      g.addEdge(1, 2)
      expect(g.hasEdge(1, 2)).toBe(true)
      expect(g.hasEdge(2, 1)).toBe(false)
    })
  })

  // ─── addVertex / hasVertex ───
  describe('addVertex / hasVertex', () => {
    it('adds a vertex and reports it exists', () => {
      const g = new GraphDFS()
      g.addVertex(5)
      expect(g.hasVertex(5)).toBe(true)
    })

    it('does not duplicate a vertex', () => {
      const g = new GraphDFS()
      g.addVertex(1)
      g.addVertex(1)
      expect(g.vertexCount).toBe(1)
    })

    it('returns false for nonexistent vertex', () => {
      const g = new GraphDFS()
      expect(g.hasVertex(99)).toBe(false)
    })
  })

  // ─── addEdge / hasEdge ───
  describe('addEdge / hasEdge', () => {
    it('adds an edge and auto-creates vertices', () => {
      const g = new GraphDFS()
      g.addEdge(1, 2)
      expect(g.hasEdge(1, 2)).toBe(true)
      expect(g.hasVertex(1)).toBe(true)
      expect(g.hasVertex(2)).toBe(true)
    })

    it('returns false for nonexistent edge', () => {
      const g = new GraphDFS()
      expect(g.hasEdge(1, 2)).toBe(false)
    })

    it('undirected graph has symmetric edges', () => {
      const g = new GraphDFS()
      g.addEdge(1, 2)
      expect(g.hasEdge(2, 1)).toBe(true)
    })

    it('directed graph does not have reverse edge', () => {
      const g = new GraphDFS(true)
      g.addEdge(1, 2)
      expect(g.hasEdge(2, 1)).toBe(false)
    })
  })

  // ─── removeVertex ───
  describe('removeVertex', () => {
    it('removes a vertex and returns true', () => {
      const g = new GraphDFS()
      g.addEdge(1, 2)
      expect(g.removeVertex(1)).toBe(true)
      expect(g.hasVertex(1)).toBe(false)
      expect(g.hasEdge(1, 2)).toBe(false)
    })

    it('returns false for nonexistent vertex', () => {
      const g = new GraphDFS()
      expect(g.removeVertex(99)).toBe(false)
    })

    it('cleans up edges to removed vertex', () => {
      const g = new GraphDFS()
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      g.removeVertex(2)
      expect(g.hasEdge(1, 2)).toBe(false)
      expect(g.hasEdge(2, 3)).toBe(false)
      expect(g.hasEdge(1, 3)).toBe(false)
    })
  })

  // ─── removeEdge ───
  describe('removeEdge', () => {
    it('removes an edge and returns true', () => {
      const g = new GraphDFS()
      g.addEdge(1, 2)
      expect(g.removeEdge(1, 2)).toBe(true)
      expect(g.hasEdge(1, 2)).toBe(false)
      expect(g.hasEdge(2, 1)).toBe(false)
    })

    it('returns false for nonexistent edge', () => {
      const g = new GraphDFS()
      expect(g.removeEdge(1, 2)).toBe(false)
    })
  })

  // ─── vertices / edges ───
  describe('vertices / edges', () => {
    it('returns all vertices', () => {
      const g = new GraphDFS()
      g.addEdge(1, 2)
      g.addEdge(3, 4)
      expect(g.vertices().sort()).toEqual([1, 2, 3, 4])
    })

    it('returns empty for empty graph', () => {
      const g = new GraphDFS()
      expect(g.vertices()).toEqual([])
      expect(g.edges()).toEqual([])
    })

    it('deduplicates edges in undirected graph', () => {
      const g = new GraphDFS()
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      expect(g.edgeCount).toBe(2)
    })
  })

  // ─── vertexCount / edgeCount ───
  describe('vertexCount / edgeCount', () => {
    it('reports correct counts', () => {
      const g = new GraphDFS()
      expect(g.vertexCount).toBe(0)
      expect(g.edgeCount).toBe(0)
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      expect(g.vertexCount).toBe(3)
      expect(g.edgeCount).toBe(2)
    })

    it('counts directed edges separately', () => {
      const g = new GraphDFS(true)
      g.addEdge(1, 2)
      g.addEdge(2, 1)
      expect(g.edgeCount).toBe(2)
    })
  })

  // ─── dfs ───
  describe('dfs', () => {
    it('traverses in DFS order using callback', () => {
      const g = new GraphDFS()
      g.addEdge(1, 2)
      g.addEdge(1, 3)
      g.addEdge(2, 4)
      const visited: number[] = []
      g.dfs(1, (n) => visited.push(n))
      expect(visited[0]).toBe(1)
      expect(visited.length).toBe(4)
      expect(visited.sort()).toEqual([1, 2, 3, 4])
    })

    it('does nothing for nonexistent start', () => {
      const g = new GraphDFS()
      const visited: number[] = []
      g.dfs(99, (n) => visited.push(n))
      expect(visited).toEqual([])
    })

    it('handles single vertex', () => {
      const g = new GraphDFS()
      g.addVertex(1)
      const visited: number[] = []
      g.dfs(1, (n) => visited.push(n))
      expect(visited).toEqual([1])
    })
  })

  // ─── dfsIterative ───
  describe('dfsIterative', () => {
    it('traverses all reachable vertices', () => {
      const g = new GraphDFS()
      g.addEdge(1, 2)
      g.addEdge(1, 3)
      g.addEdge(2, 4)
      const visited: number[] = []
      g.dfsIterative(1, (n) => visited.push(n))
      expect(visited[0]).toBe(1)
      expect(visited.length).toBe(4)
      expect(visited.sort()).toEqual([1, 2, 3, 4])
    })

    it('does nothing for nonexistent start', () => {
      const g = new GraphDFS()
      const visited: number[] = []
      g.dfsIterative(99, (n) => visited.push(n))
      expect(visited).toEqual([])
    })
  })

  // ─── hasPath ───
  describe('hasPath', () => {
    it('returns true when path exists', () => {
      const g = new GraphDFS()
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      expect(g.hasPath(1, 3)).toBe(true)
    })

    it('returns true when from === to', () => {
      const g = new GraphDFS()
      g.addVertex(1)
      expect(g.hasPath(1, 1)).toBe(true)
    })

    it('returns false when no path exists', () => {
      const g = new GraphDFS()
      g.addVertex(1)
      g.addVertex(2)
      expect(g.hasPath(1, 2)).toBe(false)
    })

    it('returns false for nonexistent vertices', () => {
      const g = new GraphDFS()
      expect(g.hasPath(1, 2)).toBe(false)
    })
  })

  // ─── getPaths ───
  describe('getPaths', () => {
    it('finds all paths between two vertices', () => {
      const g = new GraphDFS()
      g.addEdge(1, 2)
      g.addEdge(1, 3)
      g.addEdge(2, 4)
      g.addEdge(3, 4)
      const paths = g.getPaths(1, 4)
      expect(paths.length).toBe(2)
      for (const p of paths) {
        expect(p[0]).toBe(1)
        expect(p[p.length - 1]).toBe(4)
      }
    })

    it('returns single path for linear graph', () => {
      const g = new GraphDFS()
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      const paths = g.getPaths(1, 3)
      expect(paths).toEqual([[1, 2, 3]])
    })

    it('returns empty when no path exists', () => {
      const g = new GraphDFS()
      g.addVertex(1)
      g.addVertex(2)
      expect(g.getPaths(1, 2)).toEqual([])
    })

    it('returns empty for nonexistent vertices', () => {
      const g = new GraphDFS()
      expect(g.getPaths(1, 2)).toEqual([])
    })

    it('returns path to self', () => {
      const g = new GraphDFS()
      g.addVertex(1)
      const paths = g.getPaths(1, 1)
      expect(paths).toEqual([[1]])
    })
  })

  // ─── getConnectedComponents ───
  describe('getConnectedComponents', () => {
    it('returns single component for connected graph', () => {
      const g = new GraphDFS()
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      const comps = g.getConnectedComponents()
      expect(comps.length).toBe(1)
      expect(comps[0]!.sort()).toEqual([1, 2, 3])
    })

    it('returns multiple components for disconnected graph', () => {
      const g = new GraphDFS()
      g.addEdge(1, 2)
      g.addEdge(3, 4)
      const comps = g.getConnectedComponents()
      expect(comps.length).toBe(2)
    })

    it('returns empty for empty graph', () => {
      const g = new GraphDFS()
      expect(g.getConnectedComponents()).toEqual([])
    })

    it('handles isolated vertices', () => {
      const g = new GraphDFS()
      g.addVertex(1)
      g.addVertex(2)
      const comps = g.getConnectedComponents()
      expect(comps.length).toBe(2)
    })
  })

  // ─── isCyclic ───
  describe('isCyclic', () => {
    it('returns true for undirected graph with edges (recursion stack sees back-edge)', () => {
      const g = new GraphDFS()
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      expect(g.isCyclic()).toBe(true)
    })

    it('returns false for undirected graph with no edges', () => {
      const g = new GraphDFS()
      g.addVertex(1)
      expect(g.isCyclic()).toBe(false)
    })

    it('returns false for empty graph', () => {
      const g = new GraphDFS()
      expect(g.isCyclic()).toBe(false)
    })

    it('detects cycle in directed graph', () => {
      const g = new GraphDFS(true)
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      g.addEdge(3, 1)
      expect(g.isCyclic()).toBe(true)
    })

    it('returns false for DAG', () => {
      const g = new GraphDFS(true)
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      expect(g.isCyclic()).toBe(false)
    })
  })

  // ─── topologicalSort ───
  describe('topologicalSort', () => {
    it('returns topological order for DAG', () => {
      const g = new GraphDFS(true)
      g.addEdge(1, 2)
      g.addEdge(2, 3)
      const order = g.topologicalSort()
      expect(order).not.toBeNull()
      expect(order!.indexOf(1)).toBeLessThan(order!.indexOf(2))
      expect(order!.indexOf(2)).toBeLessThan(order!.indexOf(3))
    })

    it('returns null for undirected graph', () => {
      const g = new GraphDFS()
      g.addEdge(1, 2)
      expect(g.topologicalSort()).toBeNull()
    })

    it('returns null for cyclic directed graph', () => {
      const g = new GraphDFS(true)
      g.addEdge(1, 2)
      g.addEdge(2, 1)
      expect(g.topologicalSort()).toBeNull()
    })

    it('returns all vertices in result', () => {
      const g = new GraphDFS(true)
      g.addEdge(1, 2)
      g.addEdge(1, 3)
      const order = g.topologicalSort()
      expect(order!.sort()).toEqual([1, 2, 3])
    })
  })

  // ─── Edge cases ───
  describe('edge cases', () => {
    it('handles negative vertex IDs', () => {
      const g = new GraphDFS()
      g.addEdge(-1, -2)
      expect(g.hasVertex(-1)).toBe(true)
      expect(g.hasEdge(-1, -2)).toBe(true)
    })

    it('handles self-loop in directed graph', () => {
      const g = new GraphDFS(true)
      g.addEdge(1, 1)
      expect(g.hasEdge(1, 1)).toBe(true)
    })

    it('handles duplicate edges', () => {
      const g = new GraphDFS()
      g.addEdge(1, 2)
      g.addEdge(1, 2)
      expect(g.hasEdge(1, 2)).toBe(true)
    })
  })
})
