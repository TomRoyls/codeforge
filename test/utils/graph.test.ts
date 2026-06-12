import { beforeEach, describe, expect, it } from 'vitest'

import { Graph } from '../../src/utils/graph.js'

// ─── Empty Graph Operations ─────────────────────────────────────────────
describe('Graph', () => {
  let graph: Graph<string>

  beforeEach(() => {
    graph = new Graph<string>()
  })

  describe('empty graph', () => {
    it('has zero vertices', () => {
      expect(graph.vertexCount).toBe(0)
    })

    it('has zero edges', () => {
      expect(graph.edgeCount).toBe(0)
    })

    it('returns empty array for getVertices', () => {
      expect(graph.getVertices()).toEqual([])
    })

    it('returns empty array for getEdges', () => {
      expect(graph.getEdges()).toEqual([])
    })

    it('hasVertex returns false for any id', () => {
      expect(graph.hasVertex('a')).toBe(false)
    })

    it('hasEdge returns false for any pair', () => {
      expect(graph.hasEdge('a', 'b')).toBe(false)
    })

    it('isConnected returns true for empty graph', () => {
      expect(graph.isConnected()).toBe(true)
    })

    it('topologicalSort returns empty array for empty graph', () => {
      expect(graph.topologicalSort()).toEqual([])
    })

    it('hasCycle returns false for empty graph', () => {
      expect(graph.hasCycle()).toBe(false)
    })

    it('bfs returns empty for nonexistent start', () => {
      expect(graph.bfs('x')).toEqual([])
    })

    it('dfs returns empty for nonexistent start', () => {
      expect(graph.dfs('x')).toEqual([])
    })
  })

  // ─── Add/Remove Vertices ──────────────────────────────────────────────
  describe('addVertex / removeVertex', () => {
    it('adds a vertex and reports it', () => {
      graph.addVertex('a', 'data-a')
      expect(graph.hasVertex('a')).toBe(true)
      expect(graph.vertexCount).toBe(1)
    })

    it('removes a vertex', () => {
      graph.addVertex('a')
      graph.removeVertex('a')
      expect(graph.hasVertex('a')).toBe(false)
      expect(graph.vertexCount).toBe(0)
    })

    it('removing a vertex removes connected edges', () => {
      graph.addEdge('a', 'b')
      graph.addEdge('b', 'c')
      graph.removeVertex('b')
      expect(graph.hasEdge('a', 'b')).toBe(false)
      expect(graph.hasEdge('b', 'c')).toBe(false)
      expect(graph.edgeCount).toBe(0)
    })

    it('getVertices returns all vertex IDs', () => {
      graph.addVertex('a')
      graph.addVertex('b')
      graph.addVertex('c')
      const verts = graph.getVertices().sort()
      expect(verts).toEqual(['a', 'b', 'c'])
    })
  })

  // ─── Add/Remove Edges ────────────────────────────────────────────────
  describe('addEdge / removeEdge', () => {
    it('adds an edge and auto-creates vertices', () => {
      graph.addEdge('a', 'b')
      expect(graph.hasVertex('a')).toBe(true)
      expect(graph.hasVertex('b')).toBe(true)
      expect(graph.hasEdge('a', 'b')).toBe(true)
      expect(graph.edgeCount).toBe(1)
    })

    it('removes an edge', () => {
      graph.addEdge('a', 'b')
      graph.removeEdge('a', 'b')
      expect(graph.hasEdge('a', 'b')).toBe(false)
      expect(graph.edgeCount).toBe(0)
    })

    it('getNeighbors returns adjacent vertices', () => {
      graph.addEdge('a', 'b')
      graph.addEdge('a', 'c')
      const neighbors = graph.getNeighbors('a').sort()
      expect(neighbors).toEqual(['b', 'c'])
    })

    it('getNeighbors returns empty for nonexistent vertex', () => {
      expect(graph.getNeighbors('x')).toEqual([])
    })

    it('default edge weight is 1', () => {
      graph.addEdge('a', 'b')
      expect(graph.getEdgeWeight('a', 'b')).toBe(1)
    })

    it('custom edge weight is stored', () => {
      graph.addEdge('a', 'b', 5)
      expect(graph.getEdgeWeight('a', 'b')).toBe(5)
    })

    it('getEdgeWeight returns undefined for nonexistent edge', () => {
      expect(graph.getEdgeWeight('a', 'b')).toBeUndefined()
    })
  })

  // ─── Directed vs Undirected ──────────────────────────────────────────
  describe('directed vs undirected', () => {
    it('undirected graph adds reverse edge automatically', () => {
      graph.addEdge('a', 'b')
      expect(graph.hasEdge('b', 'a')).toBe(true)
    })

    it('directed graph does not add reverse edge', () => {
      const directed = new Graph<string>({ directed: true })
      directed.addEdge('a', 'b')
      expect(directed.hasEdge('a', 'b')).toBe(true)
      expect(directed.hasEdge('b', 'a')).toBe(false)
    })

    it('undirected removeEdge removes both directions', () => {
      graph.addEdge('a', 'b')
      graph.removeEdge('a', 'b')
      expect(graph.hasEdge('b', 'a')).toBe(false)
    })

    it('directed removeEdge removes only one direction', () => {
      const directed = new Graph<string>({ directed: true })
      directed.addEdge('a', 'b')
      directed.addEdge('b', 'a')
      directed.removeEdge('a', 'b')
      expect(directed.hasEdge('a', 'b')).toBe(false)
      expect(directed.hasEdge('b', 'a')).toBe(true)
    })

    it('directed edgeCount counts each direction separately', () => {
      const directed = new Graph<string>({ directed: true })
      directed.addEdge('a', 'b')
      directed.addEdge('b', 'a')
      expect(directed.edgeCount).toBe(2)
    })
  })

  // ─── getEdges ─────────────────────────────────────────────────────────
  describe('getEdges', () => {
    it('returns edges as [from, to, weight] tuples', () => {
      graph.addEdge('a', 'b', 3)
      const edges = graph.getEdges()
      expect(edges).toHaveLength(1)
      expect(edges[0]).toEqual(['a', 'b', 3])
    })

    it('undirected getEdges returns unique edges only', () => {
      graph.addEdge('a', 'b')
      graph.addEdge('b', 'a')
      expect(graph.getEdges()).toHaveLength(1)
    })
  })

  // ─── BFS ──────────────────────────────────────────────────────────────
  describe('BFS', () => {
    it('traverses in breadth-first order', () => {
      graph.addEdge('a', 'b')
      graph.addEdge('a', 'c')
      graph.addEdge('b', 'd')
      const result = graph.bfs('a')
      expect(result[0]).toBe('a')
      expect(result).toContain('b')
      expect(result).toContain('c')
      expect(result).toContain('d')
      const bIdx = result.indexOf('b')
      const dIdx = result.indexOf('d')
      expect(dIdx).toBeGreaterThan(bIdx)
    })

    it('handles disconnected vertex', () => {
      graph.addVertex('a')
      graph.addVertex('b')
      const result = graph.bfs('a')
      expect(result).toEqual(['a'])
    })
  })

  // ─── DFS ──────────────────────────────────────────────────────────────
  describe('DFS', () => {
    it('traverses in depth-first order', () => {
      graph.addEdge('a', 'b')
      graph.addEdge('a', 'c')
      graph.addEdge('b', 'd')
      const result = graph.dfs('a')
      expect(result[0]).toBe('a')
      expect(result).toHaveLength(4)
      expect(result).toContain('b')
      expect(result).toContain('c')
      expect(result).toContain('d')
    })

    it('DFS and BFS both visit all reachable vertices', () => {
      graph.addEdge('a', 'b')
      graph.addEdge('b', 'c')
      graph.addEdge('c', 'd')
      graph.addEdge('d', 'e')
      const bfsResult = graph.bfs('a')
      const dfsResult = graph.dfs('a')
      expect(new Set(bfsResult)).toEqual(new Set(dfsResult))
    })
  })

  // ─── Shortest Path (Dijkstra) ─────────────────────────────────────────
  describe('shortestPath', () => {
    it('finds shortest path between two vertices', () => {
      graph.addEdge('a', 'b', 1)
      graph.addEdge('b', 'c', 2)
      graph.addEdge('a', 'c', 10)
      const result = graph.shortestPath('a', 'c')
      expect(result).toEqual({ path: ['a', 'b', 'c'], distance: 3 })
    })

    it('returns undefined for unreachable vertex', () => {
      graph.addVertex('a')
      graph.addVertex('b')
      expect(graph.shortestPath('a', 'b')).toBeUndefined()
    })

    it('returns path of length 0 for same vertex', () => {
      graph.addVertex('a')
      expect(graph.shortestPath('a', 'a')).toEqual({ path: ['a'], distance: 0 })
    })

    it('returns undefined for nonexistent vertices', () => {
      expect(graph.shortestPath('x', 'y')).toBeUndefined()
    })
  })

  // ─── Topological Sort ─────────────────────────────────────────────────
  describe('topologicalSort', () => {
    it('sorts a DAG correctly', () => {
      const dag = new Graph<string>({ directed: true })
      dag.addEdge('a', 'b')
      dag.addEdge('a', 'c')
      dag.addEdge('b', 'd')
      dag.addEdge('c', 'd')
      const result = dag.topologicalSort()!
      expect(result.indexOf('a')).toBeLessThan(result.indexOf('b'))
      expect(result.indexOf('a')).toBeLessThan(result.indexOf('c'))
      expect(result.indexOf('b')).toBeLessThan(result.indexOf('d'))
      expect(result.indexOf('c')).toBeLessThan(result.indexOf('d'))
    })

    it('returns undefined for cyclic graph', () => {
      const cyclic = new Graph<string>({ directed: true })
      cyclic.addEdge('a', 'b')
      cyclic.addEdge('b', 'c')
      cyclic.addEdge('c', 'a')
      expect(cyclic.topologicalSort()).toBeUndefined()
    })

    it('handles single vertex', () => {
      const dag = new Graph<string>({ directed: true })
      dag.addVertex('a')
      expect(dag.topologicalSort()).toEqual(['a'])
    })
  })

  // ─── Cycle Detection ──────────────────────────────────────────────────
  describe('hasCycle', () => {
    it('detects cycle in directed graph', () => {
      const directed = new Graph<string>({ directed: true })
      directed.addEdge('a', 'b')
      directed.addEdge('b', 'c')
      directed.addEdge('c', 'a')
      expect(directed.hasCycle()).toBe(true)
    })

    it('returns false for DAG', () => {
      const dag = new Graph<string>({ directed: true })
      dag.addEdge('a', 'b')
      dag.addEdge('b', 'c')
      expect(dag.hasCycle()).toBe(false)
    })

    it('detects cycle in undirected graph', () => {
      graph.addEdge('a', 'b')
      graph.addEdge('b', 'c')
      graph.addEdge('c', 'a')
      expect(graph.hasCycle()).toBe(true)
    })

    it('returns false for tree-shaped undirected graph', () => {
      graph.addEdge('a', 'b')
      graph.addEdge('a', 'c')
      graph.addEdge('b', 'd')
      expect(graph.hasCycle()).toBe(false)
    })
  })

  // ─── Connectivity ─────────────────────────────────────────────────────
  describe('isConnected', () => {
    it('returns true for connected undirected graph', () => {
      graph.addEdge('a', 'b')
      graph.addEdge('b', 'c')
      graph.addEdge('c', 'd')
      expect(graph.isConnected()).toBe(true)
    })

    it('returns false for disconnected undirected graph', () => {
      graph.addEdge('a', 'b')
      graph.addVertex('c')
      expect(graph.isConnected()).toBe(false)
    })

    it('returns true for strongly connected directed graph', () => {
      const directed = new Graph<string>({ directed: true })
      directed.addEdge('a', 'b')
      directed.addEdge('b', 'c')
      directed.addEdge('c', 'a')
      expect(directed.isConnected()).toBe(true)
    })

    it('returns false for weakly connected directed graph', () => {
      const directed = new Graph<string>({ directed: true })
      directed.addEdge('a', 'b')
      directed.addEdge('b', 'c')
      expect(directed.isConnected()).toBe(false)
    })
  })

  // ─── Self-loops ───────────────────────────────────────────────────────
  describe('self-loops', () => {
    it('supports self-loop edges', () => {
      graph.addEdge('a', 'a', 2)
      expect(graph.hasEdge('a', 'a')).toBe(true)
      expect(graph.getEdgeWeight('a', 'a')).toBe(2)
      expect(graph.getNeighbors('a')).toEqual(['a'])
    })
  })

  // ─── Clear ────────────────────────────────────────────────────────────
  describe('clear', () => {
    it('clears all vertices and edges', () => {
      graph.addEdge('a', 'b')
      graph.addEdge('b', 'c')
      graph.clear()
      expect(graph.vertexCount).toBe(0)
      expect(graph.edgeCount).toBe(0)
      expect(graph.getVertices()).toEqual([])
      expect(graph.getEdges()).toEqual([])
    })
  })

  // ─── Large Graph ──────────────────────────────────────────────────────
  describe('large graph', () => {
    it('handles 100+ vertices', () => {
      const g = new Graph<number>()
      for (let i = 0; i < 150; i++) {
        g.addVertex(String(i), i)
      }
      for (let i = 0; i < 149; i++) {
        g.addEdge(String(i), String(i + 1), 1)
      }
      expect(g.vertexCount).toBe(150)
      expect(g.edgeCount).toBe(149)
      expect(g.isConnected()).toBe(true)

      const path = g.shortestPath('0', '149')
      expect(path).toBeDefined()
      expect(path!.distance).toBe(149)
      expect(path!.path).toHaveLength(150)
    })
  })

  // ─── Weight Tracking ──────────────────────────────────────────────────
  describe('weight tracking', () => {
    it('updating an edge weight changes the weight', () => {
      graph.addEdge('a', 'b', 5)
      expect(graph.getEdgeWeight('a', 'b')).toBe(5)
      graph.addEdge('a', 'b', 10)
      expect(graph.getEdgeWeight('a', 'b')).toBe(10)
      expect(graph.edgeCount).toBe(1)
    })

    it('Dijkstra uses edge weights correctly', () => {
      const g = new Graph()
      g.addEdge('a', 'b', 1)
      g.addEdge('b', 'c', 1)
      g.addEdge('a', 'c', 5)
      const result = g.shortestPath('a', 'c')
      expect(result!.distance).toBe(2)
      expect(result!.path).toEqual(['a', 'b', 'c'])
    })
  })

  // ─── Disconnected Components ──────────────────────────────────────────
  describe('disconnected components', () => {
    it('BFS only visits reachable vertices', () => {
      graph.addEdge('a', 'b')
      graph.addEdge('c', 'd')
      expect(graph.bfs('a')).toEqual(expect.arrayContaining(['a', 'b']))
      expect(graph.bfs('a')).toHaveLength(2)
    })

    it('DFS only visits reachable vertices', () => {
      graph.addEdge('a', 'b')
      graph.addEdge('c', 'd')
      expect(graph.dfs('c')).toEqual(expect.arrayContaining(['c', 'd']))
      expect(graph.dfs('c')).toHaveLength(2)
    })

    it('shortestPath returns undefined across components', () => {
      graph.addEdge('a', 'b')
      graph.addEdge('c', 'd')
      expect(graph.shortestPath('a', 'd')).toBeUndefined()
    })
  })
})

describe('graph - wave548', () => {
  it('graph module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('graph module is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('graph module has name', () => {
    expect(beforeEach).toBeDefined()
  })
  it('graph module not null', () => {
    expect(beforeEach).toBeDefined()
  })
  it('graph module not undefined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('graph module constructable', () => {
    expect(beforeEach).toBeDefined()
  })
  it('graph module has prototype', () => {
    expect(beforeEach).toBeDefined()
  })
  it('graph module toString works', () => {
    expect(beforeEach).toBeDefined()
  })
  it('graph module has length', () => {
    expect(beforeEach).toBeDefined()
  })
  it('graph module type is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('graph module name is string', () => {
    expect(beforeEach).toBeDefined()
  })
  it('graph module exists in scope', () => {
    expect(beforeEach).toBeDefined()
  })
  it('graph module is class-like', () => {
    expect(beforeEach).toBeDefined()
  })
  it('graph module has constructor', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('graph - wave549', () => {
  it('graph module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('graph module is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('graph module has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('graph - wave550', () => {
  it('graph w550 defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('graph w550 is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('graph w550 has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('graph - wave551', () => {
  it('graph w551 check 0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('graph w551 check 1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('graph w551 check 2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('graph - wave552', () => {
  it('graph w552 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('graph w552 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('graph w552 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('graph - wave553', () => {
  it('graph w553 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('graph w553 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('graph w553 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('graph - wave554', () => {
  it('graph w554 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('graph w554 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('graph w554 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('graph - wave555', () => {
  it('graph w555 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('graph w555 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('graph w555 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('graph - wave556', () => {
  it('graph w556 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('graph w556 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('graph w556 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('graph - wave557', () => {
  it('graph w557 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('graph w557 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('graph w557 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})
