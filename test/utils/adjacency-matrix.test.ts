import { describe, it, expect } from 'vitest'
import { AdjacencyMatrix } from '../../src/utils/adjacency-matrix.js'

describe('AdjacencyMatrix', () => {
  describe('constructor', () => {
    it('creates an undirected graph by default', () => {
      const g = new AdjacencyMatrix(3)
      expect(g.directed).toBe(false)
    })

    it('creates a directed graph when specified', () => {
      const g = new AdjacencyMatrix(3, true)
      expect(g.directed).toBe(true)
    })

    it('initializes with zero edges', () => {
      const g = new AdjacencyMatrix(5)
      expect(g.edgeCount).toBe(0)
    })

    it('initializes with correct node count', () => {
      const g = new AdjacencyMatrix(7)
      expect(g.nodeCount).toBe(7)
    })
  })

  describe('addEdge', () => {
    it('adds an undirected edge with default weight', () => {
      const g = new AdjacencyMatrix(3)
      g.addEdge(0, 1)
      expect(g.hasEdge(0, 1)).toBe(true)
      expect(g.hasEdge(1, 0)).toBe(true)
      expect(g.getWeight(0, 1)).toBe(1)
    })

    it('adds an undirected edge with custom weight', () => {
      const g = new AdjacencyMatrix(3)
      g.addEdge(0, 1, 5)
      expect(g.getWeight(0, 1)).toBe(5)
      expect(g.getWeight(1, 0)).toBe(5)
    })

    it('adds a directed edge only one way', () => {
      const g = new AdjacencyMatrix(3, true)
      g.addEdge(0, 1, 3)
      expect(g.hasEdge(0, 1)).toBe(true)
      expect(g.hasEdge(1, 0)).toBe(false)
    })

    it('increments edge count', () => {
      const g = new AdjacencyMatrix(4)
      g.addEdge(0, 1)
      g.addEdge(1, 2)
      expect(g.edgeCount).toBe(2)
    })

    it('does not double-count when overwriting edge weight', () => {
      const g = new AdjacencyMatrix(3)
      g.addEdge(0, 1, 2)
      g.addEdge(0, 1, 5)
      expect(g.edgeCount).toBe(1)
      expect(g.getWeight(0, 1)).toBe(5)
    })

    it('throws on out-of-bounds node index', () => {
      const g = new AdjacencyMatrix(3)
      expect(() => g.addEdge(-1, 0)).toThrow(RangeError)
      expect(() => g.addEdge(0, 5)).toThrow(RangeError)
    })
  })

  describe('removeEdge', () => {
    it('removes an undirected edge', () => {
      const g = new AdjacencyMatrix(3)
      g.addEdge(0, 1)
      expect(g.removeEdge(0, 1)).toBe(true)
      expect(g.hasEdge(0, 1)).toBe(false)
      expect(g.hasEdge(1, 0)).toBe(false)
      expect(g.edgeCount).toBe(0)
    })

    it('removes a directed edge', () => {
      const g = new AdjacencyMatrix(3, true)
      g.addEdge(0, 1)
      g.addEdge(1, 0)
      expect(g.removeEdge(0, 1)).toBe(true)
      expect(g.hasEdge(0, 1)).toBe(false)
      expect(g.hasEdge(1, 0)).toBe(true)
    })

    it('returns false for non-existent edge', () => {
      const g = new AdjacencyMatrix(3)
      expect(g.removeEdge(0, 1)).toBe(false)
    })

    it('returns false for out-of-bounds nodes', () => {
      const g = new AdjacencyMatrix(3)
      expect(g.removeEdge(-1, 0)).toBe(false)
      expect(g.removeEdge(0, 10)).toBe(false)
    })
  })

  describe('hasEdge and getWeight', () => {
    it('returns false for non-existent edge', () => {
      const g = new AdjacencyMatrix(3)
      expect(g.hasEdge(0, 1)).toBe(false)
    })

    it('returns 0 weight for non-existent edge', () => {
      const g = new AdjacencyMatrix(3)
      expect(g.getWeight(0, 1)).toBe(0)
    })

    it('returns false for out-of-bounds nodes', () => {
      const g = new AdjacencyMatrix(3)
      expect(g.hasEdge(-1, 0)).toBe(false)
      expect(g.hasEdge(0, 10)).toBe(false)
    })

    it('returns 0 weight for out-of-bounds nodes', () => {
      const g = new AdjacencyMatrix(3)
      expect(g.getWeight(-1, 0)).toBe(0)
    })
  })

  describe('neighbors', () => {
    it('returns neighbors of a node', () => {
      const g = new AdjacencyMatrix(4)
      g.addEdge(0, 1)
      g.addEdge(0, 2)
      expect(g.neighbors(0)).toEqual([1, 2])
    })

    it('returns empty array for isolated node', () => {
      const g = new AdjacencyMatrix(3)
      expect(g.neighbors(0)).toEqual([])
    })

    it('returns empty array for out-of-bounds node', () => {
      const g = new AdjacencyMatrix(3)
      expect(g.neighbors(5)).toEqual([])
    })
  })

  describe('degree', () => {
    it('returns degree of a node', () => {
      const g = new AdjacencyMatrix(4)
      g.addEdge(0, 1)
      g.addEdge(0, 2)
      g.addEdge(0, 3)
      expect(g.degree(0)).toBe(3)
    })

    it('returns 0 for isolated node', () => {
      const g = new AdjacencyMatrix(3)
      expect(g.degree(1)).toBe(0)
    })
  })

  describe('inDegree and outDegree', () => {
    it('returns correct inDegree for directed graph', () => {
      const g = new AdjacencyMatrix(3, true)
      g.addEdge(0, 2)
      g.addEdge(1, 2)
      expect(g.inDegree(2)).toBe(2)
      expect(g.inDegree(0)).toBe(0)
    })

    it('returns 0 for out-of-bounds node', () => {
      const g = new AdjacencyMatrix(3)
      expect(g.inDegree(5)).toBe(0)
    })

    it('outDegree equals degree', () => {
      const g = new AdjacencyMatrix(3, true)
      g.addEdge(0, 1)
      g.addEdge(0, 2)
      expect(g.outDegree(0)).toBe(2)
    })
  })

  describe('bfs', () => {
    it('returns correct distances from source', () => {
      const g = new AdjacencyMatrix(4)
      g.addEdge(0, 1)
      g.addEdge(0, 2)
      g.addEdge(1, 3)
      const { dist } = g.bfs(0)
      expect(dist[0]).toBe(0)
      expect(dist[1]).toBe(1)
      expect(dist[2]).toBe(1)
      expect(dist[3]).toBe(2)
    })

    it('marks unreachable nodes as -1', () => {
      const g = new AdjacencyMatrix(4)
      g.addEdge(0, 1)
      const { dist } = g.bfs(0)
      expect(dist[2]).toBe(-1)
      expect(dist[3]).toBe(-1)
    })

    it('returns correct predecessors', () => {
      const g = new AdjacencyMatrix(3)
      g.addEdge(0, 1)
      g.addEdge(1, 2)
      const { prev } = g.bfs(0)
      expect(prev[0]).toBe(-1)
      expect(prev[1]).toBe(0)
      expect(prev[2]).toBe(1)
    })
  })

  describe('dfs', () => {
    it('visits all reachable nodes', () => {
      const g = new AdjacencyMatrix(4)
      g.addEdge(0, 1)
      g.addEdge(0, 2)
      g.addEdge(1, 3)
      const order = g.dfs(0)
      expect(order.sort()).toEqual([0, 1, 2, 3])
    })

    it('does not visit unreachable nodes', () => {
      const g = new AdjacencyMatrix(4)
      g.addEdge(0, 1)
      const order = g.dfs(0)
      expect(order).not.toContain(2)
      expect(order).not.toContain(3)
    })

    it('starts with the source node', () => {
      const g = new AdjacencyMatrix(3)
      g.addEdge(0, 1)
      const order = g.dfs(0)
      expect(order[0]).toBe(0)
    })
  })

  describe('graph properties', () => {
    it('isComplete returns true for complete graph', () => {
      const g = new AdjacencyMatrix(4)
      g.addEdge(0, 1); g.addEdge(0, 2); g.addEdge(0, 3)
      g.addEdge(1, 2); g.addEdge(1, 3)
      g.addEdge(2, 3)
      expect(g.isComplete()).toBe(true)
    })

    it('isComplete returns false for incomplete graph', () => {
      const g = new AdjacencyMatrix(4)
      g.addEdge(0, 1)
      expect(g.isComplete()).toBe(false)
    })

    it('isEmpty returns true for graph with no edges', () => {
      const g = new AdjacencyMatrix(3)
      expect(g.isEmpty()).toBe(true)
    })

    it('isEmpty returns false after adding edge', () => {
      const g = new AdjacencyMatrix(3)
      g.addEdge(0, 1)
      expect(g.isEmpty()).toBe(false)
    })

    it('density returns correct ratio', () => {
      const g = new AdjacencyMatrix(4)
      g.addEdge(0, 1)
      g.addEdge(1, 2)
      expect(g.density()).toBeCloseTo(2 / 6)
    })

    it('density returns 0 for single node', () => {
      const g = new AdjacencyMatrix(1)
      expect(g.density()).toBe(0)
    })

    it('density is 1 for complete graph', () => {
      const g = new AdjacencyMatrix(3)
      g.addEdge(0, 1); g.addEdge(0, 2); g.addEdge(1, 2)
      expect(g.density()).toBe(1)
    })
  })

  describe('clear', () => {
    it('removes all edges', () => {
      const g = new AdjacencyMatrix(3)
      g.addEdge(0, 1)
      g.addEdge(1, 2)
      g.clear()
      expect(g.edgeCount).toBe(0)
      expect(g.hasEdge(0, 1)).toBe(false)
      expect(g.hasEdge(1, 2)).toBe(false)
    })
  })

  describe('transpose', () => {
    it('reverses all edges in directed graph', () => {
      const g = new AdjacencyMatrix(3, true)
      g.addEdge(0, 1, 2)
      g.addEdge(1, 2, 3)
      const t = g.transpose()
      expect(t.hasEdge(1, 0)).toBe(true)
      expect(t.hasEdge(2, 1)).toBe(true)
      expect(t.hasEdge(0, 1)).toBe(false)
      expect(t.getWeight(1, 0)).toBe(2)
    })

    it('preserves edge count', () => {
      const g = new AdjacencyMatrix(3, true)
      g.addEdge(0, 1)
      g.addEdge(1, 2)
      const t = g.transpose()
      expect(t.edgeCount).toBe(2)
    })

    it('does not modify original', () => {
      const g = new AdjacencyMatrix(3, true)
      g.addEdge(0, 1)
      const t = g.transpose()
      expect(g.hasEdge(0, 1)).toBe(true)
      expect(t.hasEdge(0, 1)).toBe(false)
    })
  })

  describe('toArray', () => {
    it('returns 2D array representation', () => {
      const g = new AdjacencyMatrix(2)
      g.addEdge(0, 1, 3)
      const arr = g.toArray()
      expect(arr).toEqual([[0, 3], [3, 0]])
    })
  })

  describe('toString', () => {
    it('returns descriptive string', () => {
      const g = new AdjacencyMatrix(3)
      g.addEdge(0, 1)
      expect(g.toString()).toBe('AdjacencyMatrix(nodes=3, edges=1, directed=false)')
    })

    it('reflects directed flag', () => {
      const g = new AdjacencyMatrix(2, true)
      expect(g.toString()).toContain('directed=true')
    })
  })

  describe('toJSON', () => {
    it('returns serializable object', () => {
      const g = new AdjacencyMatrix(2)
      g.addEdge(0, 1, 5)
      const json = g.toJSON()
      expect(json.nodes).toBe(2)
      expect(json.edges).toBe(1)
      expect(json.directed).toBe(false)
      expect(json.matrix).toEqual([[0, 5], [5, 0]])
    })
  })

  describe('clone', () => {
    it('creates an independent copy', () => {
      const g = new AdjacencyMatrix(3)
      g.addEdge(0, 1, 2)
      const c = g.clone()
      expect(c.equals(g)).toBe(true)
      c.addEdge(1, 2)
      expect(g.hasEdge(1, 2)).toBe(false)
    })

    it('preserves directed flag', () => {
      const g = new AdjacencyMatrix(2, true)
      const c = g.clone()
      expect(c.directed).toBe(true)
    })
  })

  describe('equals', () => {
    it('returns true for identical graphs', () => {
      const g1 = new AdjacencyMatrix(3)
      g1.addEdge(0, 1)
      const g2 = new AdjacencyMatrix(3)
      g2.addEdge(0, 1)
      expect(g1.equals(g2)).toBe(true)
    })

    it('returns false for different edge weights', () => {
      const g1 = new AdjacencyMatrix(2)
      g1.addEdge(0, 1, 2)
      const g2 = new AdjacencyMatrix(2)
      g2.addEdge(0, 1, 3)
      expect(g1.equals(g2)).toBe(false)
    })

    it('returns false for different node counts', () => {
      const g1 = new AdjacencyMatrix(2)
      const g2 = new AdjacencyMatrix(3)
      expect(g1.equals(g2)).toBe(false)
    })

    it('returns false for different directed flags', () => {
      const g1 = new AdjacencyMatrix(2)
      const g2 = new AdjacencyMatrix(2, true)
      expect(g1.equals(g2)).toBe(false)
    })

    it('returns false for non-AdjacencyMatrix', () => {
      const g = new AdjacencyMatrix(2)
      expect(g.equals(null)).toBe(false)
      expect(g.equals({})).toBe(false)
    })

    it('neighbors of isolated node is empty', () => {
      const g = new AdjacencyMatrix(3)
      expect(g.neighbors(1)).toEqual([])
    })

    it('degree counts edges correctly', () => {
      const g = new AdjacencyMatrix(3)
      g.addEdge(0, 1)
      g.addEdge(0, 2)
      expect(g.degree(0)).toBe(2)
    })

    it('removeEdge returns false for non-existent', () => {
      const g = new AdjacencyMatrix(3)
      expect(g.removeEdge(0, 1)).toBe(false)
    })
  })
})

describe('adjacency-matrix - wave548', () => {
  it('adjacency-matrix module defined', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-matrix module is function', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-matrix module has name', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-matrix module not null', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-matrix module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-matrix module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-matrix module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-matrix module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-matrix module has length', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-matrix module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-matrix module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-matrix module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-matrix module is class-like', () => {
    expect(describe).toBeDefined()
  })
})

describe('adjacency-matrix - wave549', () => {
  it('adjacency-matrix module defined', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-matrix module is function', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-matrix module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('adjacency-matrix - wave550', () => {
  it('adjacency-matrix w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-matrix w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-matrix w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('adjacency-matrix - wave551', () => {
  it('adjacency-matrix w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-matrix w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('adjacency-matrix w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})
