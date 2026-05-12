import { describe, it, expect } from 'vitest'
import { GraphAdjMatrix } from './src/core/graph-adjmatrix/index.js'

describe('GraphAdjMatrix', () => {
  describe('Basic Operations', () => {
    it('should create empty graph', () => {
      const graph = new GraphAdjMatrix<string>()
      expect(graph.vertexCount).toBe(0)
      expect(graph.edgeCount).toBe(0)
      expect(graph.isEmpty()).toBe(true)
    })

    it('should create directed graph', () => {
      const graph = new GraphAdjMatrix<string>(true, false)
      graph.addVertex('A')
      graph.addVertex('B')
      graph.addEdge('A', 'B')
      expect(graph.hasEdge('A', 'B')).toBe(true)
      expect(graph.hasEdge('B', 'A')).toBe(false)
    })

    it('should create undirected graph', () => {
      const graph = new GraphAdjMatrix<string>(false, false)
      graph.addVertex('A')
      graph.addVertex('B')
      graph.addEdge('A', 'B')
      expect(graph.hasEdge('A', 'B')).toBe(true)
      expect(graph.hasEdge('B', 'A')).toBe(true)
    })

    it('should create weighted graph', () => {
      const graph = new GraphAdjMatrix<number>(true, true)
      graph.addVertex(1)
      graph.addVertex(2)
      graph.addEdge(1, 2, 5)
      expect(graph.getEdgeWeight(1, 2)).toBe(5)
    })

    it('should create unweighted graph', () => {
      const graph = new GraphAdjMatrix<string>(true, false)
      graph.addVertex('A')
      graph.addVertex('B')
      graph.addEdge('A', 'B')
      expect(graph.getEdgeWeight('A', 'B')).toBe(null)
    })
  })

  describe('Vertex Operations', () => {
    it('should add vertex with string type', () => {
      const graph = new GraphAdjMatrix<string>()
      graph.addVertex('A')
      expect(graph.hasVertex('A')).toBe(true)
      expect(graph.vertexCount).toBe(1)
    })

    it('should add vertex with number type', () => {
      const graph = new GraphAdjMatrix<number>()
      graph.addVertex(1)
      expect(graph.hasVertex(1)).toBe(true)
      expect(graph.vertexCount).toBe(1)
    })

    it('should not add duplicate vertex', () => {
      const graph = new GraphAdjMatrix<string>()
      graph.addVertex('A')
      graph.addVertex('A')
      expect(graph.vertexCount).toBe(1)
    })

    it('should add multiple vertices', () => {
      const graph = new GraphAdjMatrix<string>()
      graph.addVertex('A')
      graph.addVertex('B')
      graph.addVertex('C')
      expect(graph.vertexCount).toBe(3)
      expect(graph.getVertices()).toEqual(['A', 'B', 'C'])
    })

    it('should remove vertex', () => {
      const graph = new GraphAdjMatrix<string>()
      graph.addVertex('A')
      graph.addVertex('B')
      graph.removeVertex('A')
      expect(graph.hasVertex('A')).toBe(false)
      expect(graph.vertexCount).toBe(1)
    })

    it('should remove non-existent vertex without error', () => {
      const graph = new GraphAdjMatrix<string>()
      graph.removeVertex('A')
      expect(graph.vertexCount).toBe(0)
    })

    it('should clear all vertices', () => {
      const graph = new GraphAdjMatrix<string>()
      graph.addVertex('A')
      graph.addVertex('B')
      graph.clear()
      expect(graph.isEmpty()).toBe(true)
    })
  })

  describe('Edge Operations', () => {
    it('should add edge to undirected graph', () => {
      const graph = new GraphAdjMatrix<string>(false, false)
      graph.addVertex('A')
      graph.addVertex('B')
      graph.addEdge('A', 'B')
      expect(graph.hasEdge('A', 'B')).toBe(true)
      expect(graph.hasEdge('B', 'A')).toBe(true)
      expect(graph.edgeCount).toBe(1)
    })

    it('should add edge to directed graph', () => {
      const graph = new GraphAdjMatrix<string>(true, false)
      graph.addVertex('A')
      graph.addVertex('B')
      graph.addEdge('A', 'B')
      expect(graph.hasEdge('A', 'B')).toBe(true)
      expect(graph.hasEdge('B', 'A')).toBe(false)
      expect(graph.edgeCount).toBe(1)
    })

    it('should add weighted edge', () => {
      const graph = new GraphAdjMatrix<string>(true, true)
      graph.addVertex('A')
      graph.addVertex('B')
      graph.addEdge('A', 'B', 10)
      expect(graph.getEdgeWeight('A', 'B')).toBe(10)
    })

    it('should add edge with default weight 1', () => {
      const graph = new GraphAdjMatrix<string>(true, true)
      graph.addVertex('A')
      graph.addVertex('B')
      graph.addEdge('A', 'B')
      expect(graph.getEdgeWeight('A', 'B')).toBe(1)
    })

    it('should add edge without weight for unweighted graph', () => {
      const graph = new GraphAdjMatrix<string>(true, false)
      graph.addVertex('A')
      graph.addVertex('B')
      graph.addEdge('A', 'B')
      expect(graph.getEdgeWeight('A', 'B')).toBe(null)
    })

    it('should not add edge if vertex does not exist', () => {
      const graph = new GraphAdjMatrix<string>()
      graph.addVertex('A')
      graph.addEdge('A', 'B')
      expect(graph.hasEdge('A', 'B')).toBe(false)
    })

    it('should remove edge from undirected graph', () => {
      const graph = new GraphAdjMatrix<string>(false, false)
      graph.addVertex('A')
      graph.addVertex('B')
      graph.addEdge('A', 'B')
      graph.removeEdge('A', 'B')
      expect(graph.hasEdge('A', 'B')).toBe(false)
      expect(graph.hasEdge('B', 'A')).toBe(false)
    })

    it('should remove edge from directed graph', () => {
      const graph = new GraphAdjMatrix<string>(true, false)
      graph.addVertex('A')
      graph.addVertex('B')
      graph.addEdge('A', 'B')
      graph.removeEdge('A', 'B')
      expect(graph.hasEdge('A', 'B')).toBe(false)
    })

    it('should remove non-existent edge without error', () => {
      const graph = new GraphAdjMatrix<string>()
      graph.addVertex('A')
      graph.addVertex('B')
      graph.removeEdge('A', 'B')
      expect(graph.vertexCount).toBe(2)
    })
  })

  describe('Vertex Removal Updates', () => {
    it('should update edges when vertex removed', () => {
      const graph = new GraphAdjMatrix<string>(false, false)
      graph.addVertex('A')
      graph.addVertex('B')
      graph.addVertex('C')
      graph.addEdge('A', 'B')
      graph.addEdge('B', 'C')
      graph.removeVertex('B')
      expect(graph.hasEdge('A', 'C')).toBe(false)
    })

    it('should maintain correct indices after removal', () => {
      const graph = new GraphAdjMatrix<string>(false, false)
      graph.addVertex('A')
      graph.addVertex('B')
      graph.addVertex('C')
      graph.addEdge('A', 'C')
      graph.removeVertex('B')
      expect(graph.hasEdge('A', 'C')).toBe(true)
    })
  })

  describe('Neighbor Operations', () => {
    it('should get neighbors of vertex', () => {
      const graph = new GraphAdjMatrix<string>()
      graph.addVertex('A')
      graph.addVertex('B')
      graph.addVertex('C')
      graph.addEdge('A', 'B')
      graph.addEdge('A', 'C')
      const neighbors = graph.getNeighbors('A')
      expect(neighbors).toContain('B')
      expect(neighbors).toContain('C')
    })

    it('should return empty array for isolated vertex', () => {
      const graph = new GraphAdjMatrix<string>()
      graph.addVertex('A')
      const neighbors = graph.getNeighbors('A')
      expect(neighbors).toEqual([])
    })

    it('should return empty array for non-existent vertex', () => {
      const graph = new GraphAdjMatrix<string>()
      const neighbors = graph.getNeighbors('A')
      expect(neighbors).toEqual([])
    })
  })

  describe('Edge Operations in Directed Graph', () => {
    it('should count edges correctly in directed graph', () => {
      const graph = new GraphAdjMatrix<string>(true, false)
      graph.addVertex('A')
      graph.addVertex('B')
      graph.addVertex('C')
      graph.addEdge('A', 'B')
      graph.addEdge('B', 'C')
      graph.addEdge('C', 'A')
      expect(graph.edgeCount).toBe(3)
    })
  })

  describe('Edge Operations in Undirected Graph', () => {
    it('should count edges correctly in undirected graph', () => {
      const graph = new GraphAdjMatrix<string>(false, false)
      graph.addVertex('A')
      graph.addVertex('B')
      graph.addVertex('C')
      graph.addEdge('A', 'B')
      graph.addEdge('B', 'C')
      graph.addEdge('C', 'A')
      expect(graph.edgeCount).toBe(3)
    })
  })

  describe('Get Edges', () => {
    it('should get all edges', () => {
      const graph = new GraphAdjMatrix<string>()
      graph.addVertex('A')
      graph.addVertex('B')
      graph.addVertex('C')
      graph.addEdge('A', 'B')
      graph.addEdge('B', 'C')
      const edges = graph.getEdges()
      expect(edges.length).toBe(2)
    })

    it('should include edge weights', () => {
      const graph = new GraphAdjMatrix<string>(true, true)
      graph.addVertex('A')
      graph.addVertex('B')
      graph.addEdge('A', 'B', 5)
      const edges = graph.getEdges()
      expect(edges[0]).toEqual(['A', 'B', 5])
    })
  })

  describe('BFS Traversal', () => {
    it('should traverse connected graph with BFS', () => {
      const graph = new GraphAdjMatrix<string>()
      graph.addVertex('A')
      graph.addVertex('B')
      graph.addVertex('C')
      graph.addVertex('D')
      graph.addEdge('A', 'B')
      graph.addEdge('A', 'C')
      graph.addEdge('B', 'D')
      const visited: string[] = []
      graph.bfs('A', (v) => visited.push(v))
      expect(visited).toContain('A')
      expect(visited).toContain('B')
      expect(visited).toContain('C')
      expect(visited).toContain('D')
    })

    it('should BFS from middle vertex', () => {
      const graph = new GraphAdjMatrix<string>()
      graph.addVertex('A')
      graph.addVertex('B')
      graph.addVertex('C')
      graph.addEdge('A', 'B')
      graph.addEdge('B', 'C')
      const visited: string[] = []
      graph.bfs('B', (v) => visited.push(v))
      expect(visited[0]).toBe('B')
    })

    it('should BFS single vertex', () => {
      const graph = new GraphAdjMatrix<string>()
      graph.addVertex('A')
      const visited: string[] = []
      graph.bfs('A', (v) => visited.push(v))
      expect(visited).toEqual(['A'])
    })

    it('should BFS disconnected graph', () => {
      const graph = new GraphAdjMatrix<string>()
      graph.addVertex('A')
      graph.addVertex('B')
      graph.addVertex('C')
      graph.addEdge('A', 'B')
      const visited: string[] = []
      graph.bfs('A', (v) => visited.push(v))
      expect(visited).not.toContain('C')
    })
  })

  describe('DFS Traversal', () => {
    it('should traverse connected graph with DFS', () => {
      const graph = new GraphAdjMatrix<string>()
      graph.addVertex('A')
      graph.addVertex('B')
      graph.addVertex('C')
      graph.addVertex('D')
      graph.addEdge('A', 'B')
      graph.addEdge('A', 'C')
      graph.addEdge('B', 'D')
      const visited: string[] = []
      graph.dfs('A', (v) => visited.push(v))
      expect(visited).toContain('A')
      expect(visited).toContain('B')
      expect(visited).toContain('C')
      expect(visited).toContain('D')
    })

    it('should DFS from middle vertex', () => {
      const graph = new GraphAdjMatrix<string>()
      graph.addVertex('A')
      graph.addVertex('B')
      graph.addVertex('C')
      graph.addEdge('A', 'B')
      graph.addEdge('B', 'C')
      const visited: string[] = []
      graph.dfs('B', (v) => visited.push(v))
      expect(visited[0]).toBe('B')
    })

    it('should DFS single vertex', () => {
      const graph = new GraphAdjMatrix<string>()
      graph.addVertex('A')
      const visited: string[] = []
      graph.dfs('A', (v) => visited.push(v))
      expect(visited).toEqual(['A'])
    })

    it('should DFS disconnected graph', () => {
      const graph = new GraphAdjMatrix<string>()
      graph.addVertex('A')
      graph.addVertex('B')
      graph.addVertex('C')
      graph.addEdge('A', 'B')
      const visited: string[] = []
      graph.dfs('A', (v) => visited.push(v))
      expect(visited).not.toContain('C')
    })
  })

  describe('Degree', () => {
    it('should calculate degree in undirected graph', () => {
      const graph = new GraphAdjMatrix<string>(false, false)
      graph.addVertex('A')
      graph.addVertex('B')
      graph.addVertex('C')
      graph.addEdge('A', 'B')
      graph.addEdge('A', 'C')
      expect(graph.degree('A')).toBe(2)
    })

    it('should calculate degree in directed graph', () => {
      const graph = new GraphAdjMatrix<string>(true, false)
      graph.addVertex('A')
      graph.addVertex('B')
      graph.addVertex('C')
      graph.addEdge('A', 'B')
      graph.addEdge('A', 'C')
      expect(graph.degree('A')).toBe(2)
    })

    it('should return 0 for isolated vertex', () => {
      const graph = new GraphAdjMatrix<string>()
      graph.addVertex('A')
      graph.addVertex('B')
      expect(graph.degree('A')).toBe(0)
    })

    it('should return 0 for non-existent vertex', () => {
      const graph = new GraphAdjMatrix<string>()
      expect(graph.degree('A')).toBe(0)
    })
  })

  describe('Path Existence', () => {
    it('should find path in connected graph', () => {
      const graph = new GraphAdjMatrix<string>()
      graph.addVertex('A')
      graph.addVertex('B')
      graph.addVertex('C')
      graph.addEdge('A', 'B')
      graph.addEdge('B', 'C')
      expect(graph.hasPath('A', 'C')).toBe(true)
    })

    it('should not find path in disconnected graph', () => {
      const graph = new GraphAdjMatrix<string>()
      graph.addVertex('A')
      graph.addVertex('B')
      graph.addVertex('C')
      graph.addEdge('A', 'B')
      expect(graph.hasPath('A', 'C')).toBe(false)
    })

    it('should find path from vertex to itself', () => {
      const graph = new GraphAdjMatrix<string>()
      graph.addVertex('A')
      expect(graph.hasPath('A', 'A')).toBe(true)
    })

    it('should not find path from non-existent vertex', () => {
      const graph = new GraphAdjMatrix<string>()
      graph.addVertex('A')
      expect(graph.hasPath('A', 'B')).toBe(false)
    })

    it('should find path in directed graph', () => {
      const graph = new GraphAdjMatrix<string>(true, false)
      graph.addVertex('A')
      graph.addVertex('B')
      graph.addVertex('C')
      graph.addEdge('A', 'B')
      graph.addEdge('B', 'C')
      expect(graph.hasPath('A', 'C')).toBe(true)
      expect(graph.hasPath('C', 'A')).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty graph operations', () => {
      const graph = new GraphAdjMatrix<string>()
      expect(graph.isEmpty()).toBe(true)
      expect(graph.vertexCount).toBe(0)
      expect(graph.edgeCount).toBe(0)
      expect(graph.getVertices()).toEqual([])
      expect(graph.getEdges()).toEqual([])
    })

    it('should add multiple edges to same vertex', () => {
      const graph = new GraphAdjMatrix<string>()
      graph.addVertex('A')
      graph.addVertex('B')
      graph.addVertex('C')
      graph.addVertex('D')
      graph.addEdge('A', 'B')
      graph.addEdge('A', 'C')
      graph.addEdge('A', 'D')
      expect(graph.getNeighbors('A').length).toBe(3)
    })

    it('should handle removing edges and adding new ones', () => {
      const graph = new GraphAdjMatrix<string>()
      graph.addVertex('A')
      graph.addVertex('B')
      graph.addVertex('C')
      graph.addEdge('A', 'B')
      graph.removeEdge('A', 'B')
      graph.addEdge('A', 'C')
      expect(graph.hasEdge('A', 'B')).toBe(false)
      expect(graph.hasEdge('A', 'C')).toBe(true)
    })
  })
})
