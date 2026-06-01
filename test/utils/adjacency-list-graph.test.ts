import { describe, it, expect } from 'vitest'
import { AdjacencyListGraph } from '../../src/utils/adjacency-list-graph.js'

describe('AdjacencyListGraph - construction', () => {
  it('creates empty graph', () => {
    const g = new AdjacencyListGraph()
    expect(g.nodeCount).toBe(0)
    expect(g.edgeCount).toBe(0)
  })

  it('creates graph with predefined node count', () => {
    const g = new AdjacencyListGraph(5)
    expect(g.nodeCount).toBe(5)
  })

  it('auto-extends node count on edge add', () => {
    const g = new AdjacencyListGraph()
    g.addDirectedEdge(0, 1)
    g.addDirectedEdge(1, 5)
    expect(g.nodeCount).toBe(6)
  })
})

describe('AdjacencyListGraph - edges', () => {
  it('adds directed edges', () => {
    const g = new AdjacencyListGraph()
    g.addDirectedEdge(0, 1, 5)
    expect(g.edgeCount).toBe(1)
    expect(g.neighbors(0)).toEqual([{ to: 1, weight: 5 }])
    expect(g.neighbors(1)).toEqual([])
  })

  it('adds undirected edges', () => {
    const g = new AdjacencyListGraph()
    g.addEdge(0, 1, 3)
    expect(g.edgeCount).toBe(1)
    expect(g.neighbors(0)).toEqual([{ to: 1, weight: 3 }])
    expect(g.neighbors(1)).toEqual([{ to: 0, weight: 3 }])
  })

  it('adds multiple edges from same node', () => {
    const g = new AdjacencyListGraph()
    g.addDirectedEdge(0, 1, 1)
    g.addDirectedEdge(0, 2, 2)
    g.addDirectedEdge(0, 3, 3)
    expect(g.neighbors(0).length).toBe(3)
  })
})

describe('AdjacencyListGraph - dijkstra', () => {
  it('finds shortest paths in simple graph', () => {
    const g = new AdjacencyListGraph(4)
    g.addDirectedEdge(0, 1, 1)
    g.addDirectedEdge(0, 2, 4)
    g.addDirectedEdge(1, 2, 2)
    g.addDirectedEdge(2, 3, 1)
    const { dist } = g.dijkstra(0)
    expect(dist[0]).toBe(0)
    expect(dist[1]).toBe(1)
    expect(dist[2]).toBe(3)
    expect(dist[3]).toBe(4)
  })

  it('handles disconnected nodes', () => {
    const g = new AdjacencyListGraph(3)
    g.addDirectedEdge(0, 1, 1)
    const { dist } = g.dijkstra(0)
    expect(dist[1]).toBe(1)
    expect(dist[2]).toBe(Infinity)
  })

  it('handles single node graph', () => {
    const g = new AdjacencyListGraph(1)
    const { dist } = g.dijkstra(0)
    expect(dist[0]).toBe(0)
  })
})

describe('AdjacencyListGraph - bellmanFord', () => {
  it('finds shortest paths', () => {
    const g = new AdjacencyListGraph(3)
    g.addDirectedEdge(0, 1, 1)
    g.addDirectedEdge(1, 2, 2)
    const { dist, hasNegativeCycle } = g.bellmanFord(0)
    expect(dist[2]).toBe(3)
    expect(hasNegativeCycle).toBe(false)
  })

  it('detects negative cycle', () => {
    const g = new AdjacencyListGraph(3)
    g.addDirectedEdge(0, 1, 1)
    g.addDirectedEdge(1, 2, -3)
    g.addDirectedEdge(2, 0, 1)
    const { hasNegativeCycle } = g.bellmanFord(0)
    expect(hasNegativeCycle).toBe(true)
  })

  it('handles negative weights without cycle', () => {
    const g = new AdjacencyListGraph(3)
    g.addDirectedEdge(0, 1, -1)
    g.addDirectedEdge(1, 2, -1)
    const { dist, hasNegativeCycle } = g.bellmanFord(0)
    expect(dist[1]).toBe(-1)
    expect(dist[2]).toBe(-2)
    expect(hasNegativeCycle).toBe(false)
  })
})

describe('AdjacencyListGraph - bfs', () => {
  it('finds BFS distances', () => {
    const g = new AdjacencyListGraph(4)
    g.addEdge(0, 1)
    g.addEdge(0, 2)
    g.addEdge(1, 3)
    const { dist, prev } = g.bfs(0)
    expect(dist[0]).toBe(0)
    expect(dist[1]).toBe(1)
    expect(dist[2]).toBe(1)
    expect(dist[3]).toBe(2)
    expect(prev[1]).toBe(0)
    expect(prev[3]).toBe(1)
  })

  it('handles disconnected graph', () => {
    const g = new AdjacencyListGraph(3)
    g.addEdge(0, 1)
    const { dist } = g.bfs(0)
    expect(dist[0]).toBe(0)
    expect(dist[1]).toBe(1)
    expect(dist[2]).toBe(-1)
  })
})

describe('AdjacencyListGraph - topologicalSort', () => {
  it('sorts DAG', () => {
    const g = new AdjacencyListGraph(4)
    g.addDirectedEdge(0, 1)
    g.addDirectedEdge(0, 2)
    g.addDirectedEdge(1, 3)
    g.addDirectedEdge(2, 3)
    const result = g.topologicalSort()
    expect(result).not.toBeNull()
    expect(result![0]).toBe(0)
    expect(result![3]).toBe(3)
    expect(result!.length).toBe(4)
  })

  it('returns null for cyclic graph', () => {
    const g = new AdjacencyListGraph(3)
    g.addDirectedEdge(0, 1)
    g.addDirectedEdge(1, 2)
    g.addDirectedEdge(2, 0)
    expect(g.topologicalSort()).toBeNull()
  })

  it('handles single node', () => {
    const g = new AdjacencyListGraph(1)
    expect(g.topologicalSort()).toEqual([0])
  })

  it('edgeCount tracks edges', () => {
    const g = new AdjacencyListGraph(3)
    g.addEdge(0, 1)
    g.addEdge(1, 2)
    expect(g.edgeCount).toBeGreaterThanOrEqual(2)
  })
})
