import { describe, it, expect } from 'vitest'
import { Graph } from '../../../src/utils/graph.js'

describe('Graph', () => {
  describe('constructor', () => {
    it('creates an undirected graph by default', () => {
      const g = new Graph()
      g.addEdge('a', 'b')
      expect(g.hasEdge('a', 'b')).toBe(true)
      expect(g.hasEdge('b', 'a')).toBe(true)
    })

    it('creates a directed graph when directed option is true', () => {
      const g = new Graph({ directed: true })
      g.addEdge('a', 'b')
      expect(g.hasEdge('a', 'b')).toBe(true)
      expect(g.hasEdge('b', 'a')).toBe(false)
    })

    it('accepts empty options object', () => {
      const g = new Graph({})
      g.addEdge('a', 'b')
      expect(g.hasEdge('b', 'a')).toBe(true)
    })
  })

  describe('addVertex / hasVertex', () => {
    it('adds a vertex and reports it exists', () => {
      const g = new Graph()
      g.addVertex('x')
      expect(g.hasVertex('x')).toBe(true)
    })

    it('reports missing vertex as false', () => {
      const g = new Graph()
      expect(g.hasVertex('missing')).toBe(false)
    })

    it('stores vertex data', () => {
      const g = new Graph<string>()
      g.addVertex('n', 'hello')
      expect(g.hasVertex('n')).toBe(true)
    })

    it('does not overwrite existing vertex data when called without data', () => {
      const g = new Graph<string>()
      g.addVertex('n', 'first')
      g.addVertex('n')
      expect(g.hasVertex('n')).toBe(true)
    })

    it('handles duplicate addVertex gracefully', () => {
      const g = new Graph()
      g.addVertex('a')
      g.addVertex('a')
      expect(g.vertexCount).toBe(1)
    })
  })

  describe('removeVertex', () => {
    it('removes a vertex from the graph', () => {
      const g = new Graph()
      g.addVertex('a')
      g.addVertex('b')
      g.removeVertex('a')
      expect(g.hasVertex('a')).toBe(false)
      expect(g.vertexCount).toBe(1)
    })

    it('is a no-op for a non-existent vertex', () => {
      const g = new Graph()
      g.addVertex('a')
      g.removeVertex('z')
      expect(g.vertexCount).toBe(1)
    })

    it('removes incident edges in undirected graph', () => {
      const g = new Graph()
      g.addEdge('a', 'b')
      g.addEdge('a', 'c')
      g.removeVertex('a')
      expect(g.edgeCount).toBe(0)
      expect(g.hasEdge('b', 'c')).toBe(false)
    })

    it('removes reverse edges in undirected graph', () => {
      const g = new Graph()
      g.addEdge('a', 'b')
      g.addEdge('a', 'c')
      g.removeVertex('a')
      expect(g.hasEdge('b', 'a')).toBe(false)
      expect(g.hasEdge('c', 'a')).toBe(false)
    })

    it('removes outgoing edges in directed graph', () => {
      const g = new Graph({ directed: true })
      g.addEdge('a', 'b')
      g.addEdge('a', 'c')
      g.removeVertex('a')
      expect(g.edgeCount).toBe(0)
    })

    it('removes incoming edge references in directed graph', () => {
      const g = new Graph({ directed: true })
      g.addEdge('b', 'a')
      g.addEdge('c', 'a')
      g.removeVertex('a')
      expect(g.hasEdge('b', 'a')).toBe(false)
      expect(g.hasEdge('c', 'a')).toBe(false)
      expect(g.edgeCount).toBe(0)
    })

    it('maintains correct edge count after removal in undirected graph', () => {
      const g = new Graph()
      g.addEdge('a', 'b')
      g.addEdge('b', 'c')
      g.addEdge('c', 'd')
      expect(g.edgeCount).toBe(3)
      g.removeVertex('b')
      expect(g.edgeCount).toBe(1)
    })

    it('maintains correct edge count after removal in directed graph', () => {
      const g = new Graph({ directed: true })
      g.addEdge('a', 'b')
      g.addEdge('b', 'c')
      g.addEdge('c', 'a')
      expect(g.edgeCount).toBe(3)
      g.removeVertex('a')
      expect(g.edgeCount).toBe(1)
    })
  })

  describe('addEdge / hasEdge / getEdgeWeight', () => {
    it('adds an edge between two existing vertices', () => {
      const g = new Graph()
      g.addVertex('a')
      g.addVertex('b')
      g.addEdge('a', 'b')
      expect(g.hasEdge('a', 'b')).toBe(true)
    })

    it('auto-creates vertices when adding edge', () => {
      const g = new Graph()
      g.addEdge('x', 'y')
      expect(g.hasVertex('x')).toBe(true)
      expect(g.hasVertex('y')).toBe(true)
    })

    it('returns default weight of 1', () => {
      const g = new Graph()
      g.addEdge('a', 'b')
      expect(g.getEdgeWeight('a', 'b')).toBe(1)
    })

    it('stores custom weight', () => {
      const g = new Graph()
      g.addEdge('a', 'b', 5)
      expect(g.getEdgeWeight('a', 'b')).toBe(5)
    })

    it('updates weight when edge is re-added', () => {
      const g = new Graph()
      g.addEdge('a', 'b', 2)
      g.addEdge('a', 'b', 7)
      expect(g.getEdgeWeight('a', 'b')).toBe(7)
    })

    it('updates reverse edge weight in undirected graph on re-add', () => {
      const g = new Graph()
      g.addEdge('a', 'b', 2)
      g.addEdge('a', 'b', 7)
      expect(g.getEdgeWeight('b', 'a')).toBe(7)
    })

    it('does not double-count edge on re-add', () => {
      const g = new Graph()
      g.addEdge('a', 'b')
      g.addEdge('a', 'b')
      expect(g.edgeCount).toBe(1)
    })

    it('adds reverse edge in undirected graph', () => {
      const g = new Graph()
      g.addEdge('a', 'b', 3)
      expect(g.hasEdge('b', 'a')).toBe(true)
      expect(g.getEdgeWeight('b', 'a')).toBe(3)
    })

    it('does not add reverse edge in directed graph', () => {
      const g = new Graph({ directed: true })
      g.addEdge('a', 'b', 3)
      expect(g.hasEdge('b', 'a')).toBe(false)
    })

    it('returns undefined weight for missing edge', () => {
      const g = new Graph()
      g.addVertex('a')
      expect(g.getEdgeWeight('a', 'z')).toBeUndefined()
    })

    it('returns undefined weight for missing vertex', () => {
      const g = new Graph()
      expect(g.getEdgeWeight('x', 'y')).toBeUndefined()
    })

    it('handles self-loop without double counting in undirected graph', () => {
      const g = new Graph()
      g.addEdge('a', 'a')
      expect(g.hasEdge('a', 'a')).toBe(true)
      expect(g.edgeCount).toBe(1)
    })
  })

  describe('removeEdge', () => {
    it('removes an edge in undirected graph', () => {
      const g = new Graph()
      g.addEdge('a', 'b')
      g.removeEdge('a', 'b')
      expect(g.hasEdge('a', 'b')).toBe(false)
      expect(g.edgeCount).toBe(0)
    })

    it('removes reverse edge in undirected graph', () => {
      const g = new Graph()
      g.addEdge('a', 'b')
      g.removeEdge('a', 'b')
      expect(g.hasEdge('b', 'a')).toBe(false)
    })

    it('does not remove reverse edge in directed graph', () => {
      const g = new Graph({ directed: true })
      g.addEdge('a', 'b')
      g.addEdge('b', 'a')
      g.removeEdge('a', 'b')
      expect(g.hasEdge('a', 'b')).toBe(false)
      expect(g.hasEdge('b', 'a')).toBe(true)
    })

    it('is a no-op when edge does not exist', () => {
      const g = new Graph()
      g.addVertex('a')
      g.addVertex('b')
      g.removeEdge('a', 'b')
      expect(g.edgeCount).toBe(0)
    })

    it('is a no-op when vertex does not exist', () => {
      const g = new Graph()
      g.removeEdge('x', 'y')
      expect(g.edgeCount).toBe(0)
    })

    it('decrements edge count correctly', () => {
      const g = new Graph()
      g.addEdge('a', 'b')
      g.addEdge('b', 'c')
      expect(g.edgeCount).toBe(2)
      g.removeEdge('a', 'b')
      expect(g.edgeCount).toBe(1)
    })
  })

  describe('getNeighbors', () => {
    it('returns neighbors of a vertex', () => {
      const g = new Graph()
      g.addEdge('a', 'b')
      g.addEdge('a', 'c')
      expect(g.getNeighbors('a')).toEqual(expect.arrayContaining(['b', 'c']))
    })

    it('returns empty array for missing vertex', () => {
      const g = new Graph()
      expect(g.getNeighbors('z')).toEqual([])
    })

    it('returns empty array for isolated vertex', () => {
      const g = new Graph()
      g.addVertex('a')
      expect(g.getNeighbors('a')).toEqual([])
    })

    it('includes self-loop neighbor', () => {
      const g = new Graph()
      g.addEdge('a', 'a')
      expect(g.getNeighbors('a')).toEqual(['a'])
    })
  })

  describe('getVertices', () => {
    it('returns all vertex IDs', () => {
      const g = new Graph()
      g.addVertex('a')
      g.addVertex('b')
      g.addVertex('c')
      expect(g.getVertices()).toEqual(expect.arrayContaining(['a', 'b', 'c']))
    })

    it('returns empty array for empty graph', () => {
      const g = new Graph()
      expect(g.getVertices()).toEqual([])
    })
  })

  describe('getEdges', () => {
    it('returns edges for undirected graph without duplicates', () => {
      const g = new Graph()
      g.addEdge('a', 'b', 2)
      g.addEdge('b', 'c', 3)
      const edges = g.getEdges()
      expect(edges).toHaveLength(2)
      const sorted = edges.map((e) => e[0] < e[1] ? e : [e[1], e[0], e[2]] as [string, string, number])
      expect(sorted).toEqual(expect.arrayContaining([
        ['a', 'b', 2],
        ['b', 'c', 3],
      ]))
    })

    it('returns edges for directed graph with direction preserved', () => {
      const g = new Graph({ directed: true })
      g.addEdge('a', 'b', 5)
      g.addEdge('b', 'a', 10)
      const edges = g.getEdges()
      expect(edges).toHaveLength(2)
      expect(edges).toEqual(expect.arrayContaining([
        ['a', 'b', 5],
        ['b', 'a', 10],
      ]))
    })

    it('returns self-loop as single edge', () => {
      const g = new Graph()
      g.addEdge('a', 'a', 1)
      const edges = g.getEdges()
      expect(edges).toHaveLength(1)
      expect(edges[0]).toEqual(['a', 'a', 1])
    })

    it('returns empty array for graph with no edges', () => {
      const g = new Graph()
      g.addVertex('a')
      expect(g.getEdges()).toEqual([])
    })
  })

  describe('vertexCount', () => {
    it('returns 0 for empty graph', () => {
      const g = new Graph()
      expect(g.vertexCount).toBe(0)
    })

    it('returns correct count after additions', () => {
      const g = new Graph()
      g.addVertex('a')
      g.addVertex('b')
      expect(g.vertexCount).toBe(2)
    })

    it('returns correct count after removal', () => {
      const g = new Graph()
      g.addVertex('a')
      g.addVertex('b')
      g.removeVertex('a')
      expect(g.vertexCount).toBe(1)
    })
  })

  describe('edgeCount', () => {
    it('returns 0 for empty graph', () => {
      const g = new Graph()
      expect(g.edgeCount).toBe(0)
    })

    it('counts edges in undirected graph', () => {
      const g = new Graph()
      g.addEdge('a', 'b')
      g.addEdge('b', 'c')
      expect(g.edgeCount).toBe(2)
    })

    it('counts edges in directed graph', () => {
      const g = new Graph({ directed: true })
      g.addEdge('a', 'b')
      g.addEdge('b', 'a')
      expect(g.edgeCount).toBe(2)
    })
  })

  describe('bfs', () => {
    it('traverses a simple connected graph from start', () => {
      const g = new Graph()
      g.addEdge('a', 'b')
      g.addEdge('a', 'c')
      g.addEdge('b', 'd')
      const result = g.bfs('a')
      expect(result).toEqual(['a', 'b', 'c', 'd'])
    })

    it('returns only reachable vertices from start', () => {
      const g = new Graph()
      g.addEdge('a', 'b')
      g.addEdge('c', 'd')
      const result = g.bfs('a')
      expect(result).toEqual(expect.arrayContaining(['a', 'b']))
      expect(result).toHaveLength(2)
    })

    it('returns empty array for missing start vertex', () => {
      const g = new Graph()
      g.addVertex('a')
      expect(g.bfs('z')).toEqual([])
    })

    it('returns single element for isolated vertex', () => {
      const g = new Graph()
      g.addVertex('a')
      expect(g.bfs('a')).toEqual(['a'])
    })

    it('works on directed graph following edge direction', () => {
      const g = new Graph({ directed: true })
      g.addEdge('a', 'b')
      g.addEdge('b', 'c')
      g.addEdge('c', 'a')
      const result = g.bfs('a')
      expect(result).toEqual(['a', 'b', 'c'])
    })
  })

  describe('dfs', () => {
    it('traverses all reachable vertices', () => {
      const g = new Graph()
      g.addEdge('a', 'b')
      g.addEdge('a', 'c')
      g.addEdge('b', 'd')
      const result = g.dfs('a')
      expect(result).toHaveLength(4)
      expect(result).toEqual(expect.arrayContaining(['a', 'b', 'c', 'd']))
    })

    it('visits in depth-first order', () => {
      const g = new Graph()
      g.addEdge('a', 'b')
      g.addEdge('a', 'c')
      g.addEdge('b', 'd')
      const result = g.dfs('a')
      expect(result[0]).toBe('a')
      expect(result).toEqual(expect.arrayContaining(['a', 'b', 'c', 'd']))
    })

    it('returns only reachable vertices for disconnected graph', () => {
      const g = new Graph()
      g.addEdge('a', 'b')
      g.addEdge('c', 'd')
      const result = g.dfs('a')
      expect(result).toEqual(expect.arrayContaining(['a', 'b']))
      expect(result).toHaveLength(2)
    })

    it('returns empty array for missing start vertex', () => {
      const g = new Graph()
      expect(g.dfs('z')).toEqual([])
    })

    it('returns single element for isolated vertex', () => {
      const g = new Graph()
      g.addVertex('a')
      expect(g.dfs('a')).toEqual(['a'])
    })
  })

  describe('shortestPath', () => {
    it('finds shortest path in unweighted graph', () => {
      const g = new Graph()
      g.addEdge('a', 'b')
      g.addEdge('b', 'c')
      g.addEdge('a', 'c')
      const result = g.shortestPath('a', 'c')
      expect(result).toBeDefined()
      expect(result!.path).toEqual(['a', 'c'])
      expect(result!.distance).toBe(1)
    })

    it('returns path of distance 0 when start equals end', () => {
      const g = new Graph()
      g.addVertex('a')
      const result = g.shortestPath('a', 'a')
      expect(result).toEqual({ path: ['a'], distance: 0 })
    })

    it('returns undefined when no path exists', () => {
      const g = new Graph()
      g.addEdge('a', 'b')
      g.addEdge('c', 'd')
      expect(g.shortestPath('a', 'd')).toBeUndefined()
    })

    it('returns undefined when start vertex is missing', () => {
      const g = new Graph()
      g.addVertex('a')
      expect(g.shortestPath('z', 'a')).toBeUndefined()
    })

    it('returns undefined when end vertex is missing', () => {
      const g = new Graph()
      g.addVertex('a')
      expect(g.shortestPath('a', 'z')).toBeUndefined()
    })

    it('finds shortest path in weighted graph', () => {
      const g = new Graph()
      g.addEdge('a', 'b', 1)
      g.addEdge('b', 'c', 1)
      g.addEdge('a', 'c', 10)
      const result = g.shortestPath('a', 'c')
      expect(result).toBeDefined()
      expect(result!.path).toEqual(['a', 'b', 'c'])
      expect(result!.distance).toBe(2)
    })

    it('finds path in directed graph', () => {
      const g = new Graph({ directed: true })
      g.addEdge('a', 'b', 3)
      g.addEdge('b', 'c', 4)
      const result = g.shortestPath('a', 'c')
      expect(result).toBeDefined()
      expect(result!.path).toEqual(['a', 'b', 'c'])
      expect(result!.distance).toBe(7)
    })

    it('returns undefined when path goes against edge direction in directed graph', () => {
      const g = new Graph({ directed: true })
      g.addEdge('a', 'b')
      expect(g.shortestPath('b', 'a')).toBeUndefined()
    })
  })

  describe('isConnected', () => {
    it('returns true for empty graph', () => {
      const g = new Graph()
      expect(g.isConnected()).toBe(true)
    })

    it('returns true for single vertex', () => {
      const g = new Graph()
      g.addVertex('a')
      expect(g.isConnected()).toBe(true)
    })

    it('returns true for fully connected undirected graph', () => {
      const g = new Graph()
      g.addEdge('a', 'b')
      g.addEdge('b', 'c')
      g.addEdge('c', 'a')
      expect(g.isConnected()).toBe(true)
    })

    it('returns false for two disconnected components', () => {
      const g = new Graph()
      g.addEdge('a', 'b')
      g.addEdge('c', 'd')
      expect(g.isConnected()).toBe(false)
    })

    it('returns true for strongly connected directed graph', () => {
      const g = new Graph({ directed: true })
      g.addEdge('a', 'b')
      g.addEdge('b', 'c')
      g.addEdge('c', 'a')
      expect(g.isConnected()).toBe(true)
    })

    it('returns false for weakly connected directed graph', () => {
      const g = new Graph({ directed: true })
      g.addEdge('a', 'b')
      g.addEdge('b', 'c')
      expect(g.isConnected()).toBe(false)
    })

    it('returns true for two vertices with one undirected edge', () => {
      const g = new Graph()
      g.addEdge('a', 'b')
      expect(g.isConnected()).toBe(true)
    })

    it('returns false for isolated vertices with no edges', () => {
      const g = new Graph()
      g.addVertex('a')
      g.addVertex('b')
      expect(g.isConnected()).toBe(false)
    })
  })

  describe('topologicalSort', () => {
    it('sorts a simple DAG', () => {
      const g = new Graph({ directed: true })
      g.addEdge('a', 'b')
      g.addEdge('b', 'c')
      const result = g.topologicalSort()
      expect(result).toBeDefined()
      expect(result).toEqual(['a', 'b', 'c'])
    })

    it('returns single node for graph with one vertex', () => {
      const g = new Graph({ directed: true })
      g.addVertex('a')
      const result = g.topologicalSort()
      expect(result).toEqual(['a'])
    })

    it('returns undefined for cyclic directed graph', () => {
      const g = new Graph({ directed: true })
      g.addEdge('a', 'b')
      g.addEdge('b', 'c')
      g.addEdge('c', 'a')
      expect(g.topologicalSort()).toBeUndefined()
    })

    it('sorts a complex DAG with multiple branches', () => {
      const g = new Graph({ directed: true })
      g.addEdge('a', 'b')
      g.addEdge('a', 'c')
      g.addEdge('b', 'd')
      g.addEdge('c', 'd')
      const result = g.topologicalSort()
      expect(result).toBeDefined()
      const idx = (v: string) => result!.indexOf(v)
      expect(idx('a')).toBeLessThan(idx('b'))
      expect(idx('a')).toBeLessThan(idx('c'))
      expect(idx('b')).toBeLessThan(idx('d'))
      expect(idx('c')).toBeLessThan(idx('d'))
    })

    it('sorts a DAG with independent subgraphs', () => {
      const g = new Graph({ directed: true })
      g.addEdge('a', 'b')
      g.addEdge('c', 'd')
      const result = g.topologicalSort()
      expect(result).toBeDefined()
      expect(result).toHaveLength(4)
      const idx = (v: string) => result!.indexOf(v)
      expect(idx('a')).toBeLessThan(idx('b'))
      expect(idx('c')).toBeLessThan(idx('d'))
    })

    it('returns empty array for empty graph', () => {
      const g = new Graph({ directed: true })
      expect(g.topologicalSort()).toEqual([])
    })
  })

  describe('hasCycle', () => {
    it('detects cycle in directed graph', () => {
      const g = new Graph({ directed: true })
      g.addEdge('a', 'b')
      g.addEdge('b', 'c')
      g.addEdge('c', 'a')
      expect(g.hasCycle()).toBe(true)
    })

    it('returns false for DAG', () => {
      const g = new Graph({ directed: true })
      g.addEdge('a', 'b')
      g.addEdge('b', 'c')
      expect(g.hasCycle()).toBe(false)
    })

    it('returns false for directed forest', () => {
      const g = new Graph({ directed: true })
      g.addEdge('a', 'b')
      g.addEdge('c', 'd')
      expect(g.hasCycle()).toBe(false)
    })

    it('detects cycle in undirected graph', () => {
      const g = new Graph()
      g.addEdge('a', 'b')
      g.addEdge('b', 'c')
      g.addEdge('c', 'a')
      expect(g.hasCycle()).toBe(true)
    })

    it('returns false for tree (undirected acyclic)', () => {
      const g = new Graph()
      g.addEdge('a', 'b')
      g.addEdge('b', 'c')
      expect(g.hasCycle()).toBe(false)
    })

    it('returns false for undirected forest', () => {
      const g = new Graph()
      g.addEdge('a', 'b')
      g.addEdge('c', 'd')
      expect(g.hasCycle()).toBe(false)
    })

    it('detects self-loop as a cycle in directed graph', () => {
      const g = new Graph({ directed: true })
      g.addEdge('a', 'a')
      expect(g.hasCycle()).toBe(true)
    })

    it('detects self-loop as a cycle in undirected graph', () => {
      const g = new Graph()
      g.addEdge('a', 'a')
      expect(g.hasCycle()).toBe(true)
    })

    it('returns false for empty graph', () => {
      const g = new Graph()
      expect(g.hasCycle()).toBe(false)
    })

    it('returns false for single vertex with no edges', () => {
      const g = new Graph()
      g.addVertex('a')
      expect(g.hasCycle()).toBe(false)
    })
  })

  describe('clear', () => {
    it('removes all vertices and edges', () => {
      const g = new Graph()
      g.addEdge('a', 'b')
      g.addEdge('b', 'c')
      g.clear()
      expect(g.vertexCount).toBe(0)
      expect(g.edgeCount).toBe(0)
      expect(g.getVertices()).toEqual([])
      expect(g.getEdges()).toEqual([])
    })

    it('allows adding after clear', () => {
      const g = new Graph()
      g.addEdge('a', 'b')
      g.clear()
      g.addEdge('c', 'd')
      expect(g.vertexCount).toBe(2)
      expect(g.edgeCount).toBe(1)
    })

    it('clears directed graph', () => {
      const g = new Graph({ directed: true })
      g.addEdge('a', 'b')
      g.clear()
      expect(g.vertexCount).toBe(0)
      expect(g.edgeCount).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('handles empty graph operations', () => {
      const g = new Graph()
      expect(g.getVertices()).toEqual([])
      expect(g.getEdges()).toEqual([])
      expect(g.getNeighbors('a')).toEqual([])
      expect(g.vertexCount).toBe(0)
      expect(g.edgeCount).toBe(0)
      expect(g.hasVertex('a')).toBe(false)
      expect(g.hasEdge('a', 'b')).toBe(false)
      expect(g.bfs('a')).toEqual([])
      expect(g.dfs('a')).toEqual([])
      expect(g.shortestPath('a', 'b')).toBeUndefined()
      expect(g.isConnected()).toBe(true)
      expect(g.hasCycle()).toBe(false)
    })

    it('handles single vertex with no edges', () => {
      const g = new Graph()
      g.addVertex('a')
      expect(g.vertexCount).toBe(1)
      expect(g.edgeCount).toBe(0)
      expect(g.getNeighbors('a')).toEqual([])
      expect(g.bfs('a')).toEqual(['a'])
      expect(g.dfs('a')).toEqual(['a'])
      expect(g.shortestPath('a', 'a')).toEqual({ path: ['a'], distance: 0 })
      expect(g.isConnected()).toBe(true)
      expect(g.hasCycle()).toBe(false)
    })

    it('handles self-loop in undirected graph', () => {
      const g = new Graph()
      g.addEdge('a', 'a', 5)
      expect(g.hasEdge('a', 'a')).toBe(true)
      expect(g.getEdgeWeight('a', 'a')).toBe(5)
      expect(g.edgeCount).toBe(1)
      expect(g.getNeighbors('a')).toEqual(['a'])
    })

    it('handles self-loop in directed graph', () => {
      const g = new Graph({ directed: true })
      g.addEdge('a', 'a', 3)
      expect(g.hasEdge('a', 'a')).toBe(true)
      expect(g.getEdgeWeight('a', 'a')).toBe(3)
      expect(g.edgeCount).toBe(1)
    })

    it('removes self-loop vertex correctly in undirected graph', () => {
      const g = new Graph()
      g.addEdge('a', 'a')
      g.addEdge('a', 'b')
      g.removeVertex('a')
      expect(g.hasVertex('a')).toBe(false)
      expect(g.edgeCount).toBe(0)
    })

    it('handles removeEdge on self-loop undirected', () => {
      const g = new Graph()
      g.addEdge('a', 'a')
      g.removeEdge('a', 'a')
      expect(g.hasEdge('a', 'a')).toBe(false)
      expect(g.edgeCount).toBe(0)
    })

    it('handles getEdges for empty directed graph', () => {
      const g = new Graph({ directed: true })
      expect(g.getEdges()).toEqual([])
    })

    it('handles topological sort of undirected graph with edges', () => {
      const g = new Graph()
      g.addEdge('a', 'b')
      expect(g.topologicalSort()).toBeUndefined()
    })

    it('handles large undirected graph traversal', () => {
      const g = new Graph()
      for (let i = 0; i < 10; i++) {
        g.addEdge(`v${i}`, `v${i + 1}`)
      }
      expect(g.vertexCount).toBe(11)
      expect(g.edgeCount).toBe(10)
      const bfsResult = g.bfs('v0')
      expect(bfsResult).toHaveLength(11)
      const dfsResult = g.dfs('v0')
      expect(dfsResult).toHaveLength(11)
    })
  })
})
