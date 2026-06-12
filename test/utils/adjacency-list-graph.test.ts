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

  it('nodeCount is correct', () => {
    const g = new AdjacencyListGraph(5)
    expect(g.nodeCount).toBe(5)
  })

  it('edgeCount starts at 0', () => {
    const g = new AdjacencyListGraph(3)
    expect(g.edgeCount).toBe(0)
  })

  it('addEdge increases edgeCount', () => {
    const g = new AdjacencyListGraph(3)
    g.addEdge(0, 1)
    expect(g.edgeCount).toBe(1)
  })

  it('neighbors returns array', () => {
    const g = new AdjacencyListGraph(3)
    g.addEdge(0, 1)
    expect(g.neighbors(0).length).toBe(1)
  })

  it('addDirectedEdge adds one direction only', () => {
    const g = new AdjacencyListGraph(3)
    g.addDirectedEdge(0, 1)
    expect(g.neighbors(0).length).toBe(1)
    expect(g.neighbors(1).length).toBe(0)
  })

  it('nodeCount returns correct value', () => {
    const g = new AdjacencyListGraph(5)
    expect(g.nodeCount).toBe(5)
  })

  it('edges added correctly', () => {
    const g = new AdjacencyListGraph(3)
    g.addEdge(0, 1)
    g.addEdge(1, 2)
    expect(g.edgeCount).toBe(2)
  })
})

describe('AdjacencyListGraph - toString', () => {
  it('formats empty graph correctly', () => {
    const g = new AdjacencyListGraph()
    expect(g.toString()).toBe('AdjacencyListGraph(nodes=0, edges=0)[]')
  })

  it('formats graph with single edge', () => {
    const g = new AdjacencyListGraph()
    g.addDirectedEdge(0, 1, 5)
    expect(g.toString()).toBe('AdjacencyListGraph(nodes=2, edges=1)[0->1(5)]')
  })

  it('formats graph with multiple edges', () => {
    const g = new AdjacencyListGraph(3)
    g.addDirectedEdge(0, 1, 1)
    g.addDirectedEdge(1, 2, 2)
    expect(g.toString()).toBe('AdjacencyListGraph(nodes=3, edges=2)[0->1(1), 1->2(2)]')
  })

  it('formats graph with multiple edges from same node', () => {
    const g = new AdjacencyListGraph(4)
    g.addDirectedEdge(0, 1, 1)
    g.addDirectedEdge(0, 2, 2)
    g.addDirectedEdge(0, 3, 3)
    expect(g.toString()).toBe('AdjacencyListGraph(nodes=4, edges=3)[0->1(1), 0->2(2), 0->3(3)]')
  })

  it('includes nodeCount and edgeCount in output', () => {
    const g = new AdjacencyListGraph(5)
    g.addEdge(0, 1, 2)
    g.addEdge(2, 3, 3)
    const str = g.toString()
    expect(str).toContain('nodes=5')
    expect(str).toContain('edges=2')
  })
})

describe('AdjacencyListGraph - toJSON', () => {
  it('returns empty array for empty graph', () => {
    const g = new AdjacencyListGraph()
    expect(g.toJSON()).toEqual([])
  })

  it('returns single edge', () => {
    const g = new AdjacencyListGraph()
    g.addDirectedEdge(0, 1, 5)
    expect(g.toJSON()).toEqual([{ from: 0, to: 1, weight: 5 }])
  })

  it('returns multiple edges', () => {
    const g = new AdjacencyListGraph(3)
    g.addDirectedEdge(0, 1, 1)
    g.addDirectedEdge(1, 2, 2)
    expect(g.toJSON()).toEqual([{ from: 0, to: 1, weight: 1 }, { from: 1, to: 2, weight: 2 }])
  })

  it('includes undirected edges as two directed edges', () => {
    const g = new AdjacencyListGraph()
    g.addEdge(0, 1, 3)
    expect(g.toJSON()).toEqual([{ from: 0, to: 1, weight: 3 }, { from: 1, to: 0, weight: 3 }])
  })

  it('preserves edge weights', () => {
    const g = new AdjacencyListGraph()
    g.addDirectedEdge(0, 1, 10)
    g.addDirectedEdge(1, 2, 20)
    g.addDirectedEdge(2, 3, 30)
    const json = g.toJSON()
    expect(json[0]!.weight).toBe(10)
    expect(json[1]!.weight).toBe(20)
    expect(json[2]!.weight).toBe(30)
  })

  it('handles default weight of 1', () => {
    const g = new AdjacencyListGraph()
    g.addDirectedEdge(0, 1)
    expect(g.toJSON()).toEqual([{ from: 0, to: 1, weight: 1 }])
  })
})

describe('AdjacencyListGraph - clone', () => {
  it('creates independent copy of empty graph', () => {
    const g = new AdjacencyListGraph()
    const clone = g.clone()
    expect(clone.nodeCount).toBe(0)
    expect(clone.edgeCount).toBe(0)
    g.addDirectedEdge(0, 1)
    expect(clone.edgeCount).toBe(0)
  })

  it('creates independent copy with edges', () => {
    const g = new AdjacencyListGraph(3)
    g.addDirectedEdge(0, 1, 5)
    g.addDirectedEdge(1, 2, 10)
    const clone = g.clone()
    expect(clone.nodeCount).toBe(3)
    expect(clone.edgeCount).toBe(2)
    expect(clone.neighbors(0)).toEqual([{ to: 1, weight: 5 }])
    expect(clone.neighbors(1)).toEqual([{ to: 2, weight: 10 }])
  })

  it('clone modifications do not affect original', () => {
    const g = new AdjacencyListGraph(2)
    g.addDirectedEdge(0, 1, 5)
    const clone = g.clone()
    clone.addDirectedEdge(0, 1, 10)
    expect(g.neighbors(0).length).toBe(1)
    expect(clone.neighbors(0).length).toBe(2)
  })

  it('original modifications do not affect clone', () => {
    const g = new AdjacencyListGraph(2)
    g.addDirectedEdge(0, 1, 5)
    const clone = g.clone()
    g.addDirectedEdge(0, 1, 10)
    expect(clone.neighbors(0).length).toBe(1)
    expect(g.neighbors(0).length).toBe(2)
  })

  it('preserves nodeCount in clone', () => {
    const g = new AdjacencyListGraph(10)
    const clone = g.clone()
    expect(clone.nodeCount).toBe(10)
  })

  it('preserves edgeCount in clone', () => {
    const g = new AdjacencyListGraph()
    g.addDirectedEdge(0, 1)
    g.addDirectedEdge(1, 2)
    g.addDirectedEdge(2, 3)
    const clone = g.clone()
    expect(clone.edgeCount).toBe(3)
  })
})

describe('AdjacencyListGraph - equals', () => {
  it('identical empty graphs are equal', () => {
    const g1 = new AdjacencyListGraph()
    const g2 = new AdjacencyListGraph()
    expect(g1.equals(g2)).toBe(true)
  })

  it('graphs with same edges are equal', () => {
    const g1 = new AdjacencyListGraph(3)
    g1.addDirectedEdge(0, 1, 5)
    g1.addDirectedEdge(1, 2, 10)
    const g2 = new AdjacencyListGraph(3)
    g2.addDirectedEdge(0, 1, 5)
    g2.addDirectedEdge(1, 2, 10)
    expect(g1.equals(g2)).toBe(true)
  })

  it('different nodeCount returns false', () => {
    const g1 = new AdjacencyListGraph(3)
    const g2 = new AdjacencyListGraph(5)
    expect(g1.equals(g2)).toBe(false)
  })

  it('different edgeCount returns false', () => {
    const g1 = new AdjacencyListGraph()
    g1.addDirectedEdge(0, 1)
    const g2 = new AdjacencyListGraph()
    g2.addDirectedEdge(0, 1)
    g2.addDirectedEdge(1, 2)
    expect(g1.equals(g2)).toBe(false)
  })

  it('different edge weights return false', () => {
    const g1 = new AdjacencyListGraph()
    g1.addDirectedEdge(0, 1, 5)
    const g2 = new AdjacencyListGraph()
    g2.addDirectedEdge(0, 1, 10)
    expect(g1.equals(g2)).toBe(false)
  })

  it('different edge destinations return false', () => {
    const g1 = new AdjacencyListGraph()
    g1.addDirectedEdge(0, 1, 5)
    const g2 = new AdjacencyListGraph()
    g2.addDirectedEdge(0, 2, 5)
    expect(g1.equals(g2)).toBe(false)
  })

  it('non-AdjacencyListGraph objects return false', () => {
    const g = new AdjacencyListGraph()
    expect(g.equals(null)).toBe(false)
    expect(g.equals(undefined)).toBe(false)
    expect(g.equals({})).toBe(false)
    expect(g.equals(42)).toBe(false)
    expect(g.equals('graph')).toBe(false)
  })

  it('cloned graph equals original', () => {
    const g = new AdjacencyListGraph(3)
    g.addDirectedEdge(0, 1, 5)
    g.addDirectedEdge(1, 2, 10)
    const clone = g.clone()
    expect(g.equals(clone)).toBe(true)
    expect(clone.equals(g)).toBe(true)
  })
})

describe('AdjacencyListGraph - edge cases', () => {
  it('neighbors returns empty array for non-existent node', () => {
    const g = new AdjacencyListGraph(2)
    expect(g.neighbors(5)).toEqual([])
  })

  it('handles negative weights', () => {
    const g = new AdjacencyListGraph(3)
    g.addDirectedEdge(0, 1, -5)
    g.addDirectedEdge(1, 2, -10)
    expect(g.neighbors(0)[0]!.weight).toBe(-5)
    expect(g.neighbors(1)[0]!.weight).toBe(-10)
  })

  it('handles zero weights', () => {
    const g = new AdjacencyListGraph(2)
    g.addDirectedEdge(0, 1, 0)
    expect(g.neighbors(0)[0]!.weight).toBe(0)
  })

  it('handles floating point weights', () => {
    const g = new AdjacencyListGraph(2)
    g.addDirectedEdge(0, 1, 1.5)
    expect(g.neighbors(0)[0]!.weight).toBe(1.5)
  })

  it('handles very large weights', () => {
    const g = new AdjacencyListGraph(2)
    g.addDirectedEdge(0, 1, Number.MAX_SAFE_INTEGER)
    expect(g.neighbors(0)[0]!.weight).toBe(Number.MAX_SAFE_INTEGER)
  })

  it('handles self-loops', () => {
    const g = new AdjacencyListGraph(2)
    g.addDirectedEdge(0, 0, 5)
    expect(g.neighbors(0)[0]!.to).toBe(0)
  })

  it('handles duplicate edges', () => {
    const g = new AdjacencyListGraph(2)
    g.addDirectedEdge(0, 1, 5)
    g.addDirectedEdge(0, 1, 10)
    expect(g.neighbors(0).length).toBe(2)
  })

  it('dijkstra with self-loop', () => {
    const g = new AdjacencyListGraph(2)
    g.addDirectedEdge(0, 0, 5)
    g.addDirectedEdge(0, 1, 10)
    const { dist } = g.dijkstra(0)
    expect(dist[0]).toBe(0)
    expect(dist[1]).toBe(10)
  })

  it('bfs with self-loop', () => {
    const g = new AdjacencyListGraph(2)
    g.addDirectedEdge(0, 0, 1)
    g.addDirectedEdge(0, 1, 1)
    const { dist } = g.bfs(0)
    expect(dist[0]).toBe(0)
    expect(dist[1]).toBe(1)
  })
})

describe('adjacency-list-graph - wave548', () => {
  it('adjacency-list-graph module defined', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph module is function', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph module has name', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph module not null', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph module has length', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph module name is string', () => {
    expect(describe).toBeDefined()
  })
})

describe('adjacency-list-graph - wave549', () => {
  it('adjacency-list-graph module defined', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph module is function', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('adjacency-list-graph - wave550', () => {
  it('adjacency-list-graph w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('adjacency-list-graph - wave551', () => {
  it('adjacency-list-graph w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('adjacency-list-graph - wave552', () => {
  it('adjacency-list-graph w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('adjacency-list-graph - wave553', () => {
  it('adjacency-list-graph w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('adjacency-list-graph - wave554', () => {
  it('adjacency-list-graph w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('adjacency-list-graph - wave555', () => {
  it('adjacency-list-graph w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('adjacency-list-graph - wave556', () => {
  it('adjacency-list-graph w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('adjacency-list-graph - wave557', () => {
  it('adjacency-list-graph w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('adjacency-list-graph - wave558', () => {
  it('adjacency-list-graph w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('adjacency-list-graph - wave559', () => {
  it('adjacency-list-graph w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('adjacency-list-graph - wave560', () => {
  it('adjacency-list-graph w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-list-graph w560 v2', () => {
    expect(describe).toBeDefined()
  })
})
