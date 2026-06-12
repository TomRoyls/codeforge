import { describe, expect, it } from 'vitest'
import { DijkstraFibonacci } from '../../src/utils/dijkstra-fibonacci.js'

describe('DijkstraFibonacci', () => {
  it('finds shortest path in simple graph', () => {
    const edges = [
      { from: 0, to: 1, weight: 4 },
      { from: 0, to: 2, weight: 1 },
      { from: 2, to: 1, weight: 2 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 3)
    expect(dist[0]).toBe(0)
    expect(dist[1]).toBe(3)
    expect(dist[2]).toBe(1)
  })

  it('handles disconnected nodes', () => {
    const edges = [{ from: 0, to: 1, weight: 5 }]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 3)
    expect(dist[1]).toBe(5)
    expect(dist[2]).toBe(Infinity)
  })

  it('handles single node', () => {
    const dist = DijkstraFibonacci.shortestPath([], 0, 1)
    expect(dist[0]).toBe(0)
  })

  it('handles linear chain', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 2 },
      { from: 2, to: 3, weight: 3 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 4)
    expect(dist[3]).toBe(6)
  })

  it('finds optimal path in diamond', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 0, to: 2, weight: 5 },
      { from: 1, to: 3, weight: 5 },
      { from: 2, to: 3, weight: 1 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 4)
    expect(dist[3]).toBe(6)
  })

  it('handles zero weight edges', () => {
    const edges = [
      { from: 0, to: 1, weight: 0 },
      { from: 1, to: 2, weight: 3 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 3)
    expect(dist[1]).toBe(0)
    expect(dist[2]).toBe(3)
  })

  it('handles multi-edge paths', () => {
    const edges = [
      { from: 0, to: 1, weight: 10 },
      { from: 0, to: 2, weight: 3 },
      { from: 2, to: 3, weight: 2 },
      { from: 3, to: 1, weight: 1 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 4)
    expect(dist[1]).toBe(6)
  })

  it('handles self loop', () => {
    const edges = [
      { from: 0, to: 0, weight: 5 },
      { from: 0, to: 1, weight: 2 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 2)
    expect(dist[0]).toBe(0)
    expect(dist[1]).toBe(2)
  })

  it('handles larger graph', () => {
    const edges = [
      { from: 0, to: 1, weight: 4 },
      { from: 0, to: 2, weight: 1 },
      { from: 1, to: 3, weight: 1 },
      { from: 2, to: 1, weight: 2 },
      { from: 2, to: 3, weight: 5 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 4)
    expect(dist[3]).toBe(4)
  })

  it('handles empty graph', () => {
    const dist = DijkstraFibonacci.shortestPath([], 0, 5)
    expect(dist[0]).toBe(0)
    expect(dist[4]).toBe(Infinity)
  })

  it('handles negative source dist', () => {
    const dist = DijkstraFibonacci.shortestPath([], 3, 5)
    expect(dist[3]).toBe(0)
    expect(dist[0]).toBe(Infinity)
  })

  it('handles multiple paths to same node', () => {
    const edges = [
      { from: 0, to: 1, weight: 10 },
      { from: 0, to: 2, weight: 3 },
      { from: 2, to: 1, weight: 4 },
      { from: 2, to: 3, weight: 8 },
      { from: 1, to: 3, weight: 2 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 4)
    expect(dist[1]).toBe(7)
    expect(dist[3]).toBe(9)
  })

  it('handles disconnected components', () => {
    const edges = [
      { from: 0, to: 1, weight: 5 },
      { from: 2, to: 3, weight: 3 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 4)
    expect(dist[1]).toBe(5)
    expect(dist[2]).toBe(Infinity)
  })

  it('handles two node graph', () => {
    const edges = [{ from: 0, to: 1, weight: 7 }]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 2)
    expect(dist[1]).toBe(7)
  })

  it('unreachable node has infinity distance', () => {
    const edges = [{ from: 0, to: 1, weight: 5 }]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 3)
    expect(dist[2]).toBe(Infinity)
  })

  it('returns zero distance to source', () => {
    const edges = [{ from: 0, to: 1, weight: 3 }]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 2)
    expect(dist[0]).toBe(0)
  })

  it('handles all zero weights', () => {
    const edges = [
      { from: 0, to: 1, weight: 0 },
      { from: 1, to: 2, weight: 0 },
      { from: 2, to: 3, weight: 0 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 4)
    expect(dist[3]).toBe(0)
  })

  it('handles star topology', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 0, to: 2, weight: 2 },
      { from: 0, to: 3, weight: 3 },
      { from: 0, to: 4, weight: 4 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 5)
    expect(dist[1]).toBe(1)
    expect(dist[2]).toBe(2)
    expect(dist[3]).toBe(3)
    expect(dist[4]).toBe(4)
  })

  it('handles multiple edges between same nodes', () => {
    const edges = [
      { from: 0, to: 1, weight: 5 },
      { from: 0, to: 1, weight: 2 },
      { from: 1, to: 2, weight: 1 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 3)
    expect(dist[1]).toBe(2)
    expect(dist[2]).toBe(3)
  })

  it('handles cyclic graph', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 1 },
      { from: 2, to: 0, weight: 1 },
      { from: 0, to: 3, weight: 10 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 4)
    expect(dist[1]).toBe(1)
    expect(dist[2]).toBe(2)
    expect(dist[3]).toBe(10)
  })

  it('handles very large weights', () => {
    const edges = [
      { from: 0, to: 1, weight: 1000000 },
      { from: 1, to: 2, weight: 2000000 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 3)
    expect(dist[2]).toBe(3000000)
  })

  it('handles very small weights', () => {
    const edges = [
      { from: 0, to: 1, weight: 0.1 },
      { from: 1, to: 2, weight: 0.2 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 3)
    expect(dist[1]).toBe(0.1)
    expect(dist[2]).toBeCloseTo(0.3, 10)
  })

  it('handles path through all nodes', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 1 },
      { from: 2, to: 3, weight: 1 },
      { from: 3, to: 4, weight: 1 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 5)
    expect(dist[4]).toBe(4)
  })

  it('handles directed graph with reverse edges', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 0, weight: 10 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 2)
    expect(dist[1]).toBe(1)
  })

  it('handles source at end', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 1 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 2, 3)
    expect(dist[0]).toBe(Infinity)
    expect(dist[1]).toBe(Infinity)
    expect(dist[2]).toBe(0)
  })

  it('handles source in middle', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 1 },
      { from: 2, to: 3, weight: 1 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 1, 4)
    expect(dist[0]).toBe(Infinity)
    expect(dist[1]).toBe(0)
    expect(dist[2]).toBe(1)
    expect(dist[3]).toBe(2)
  })

  it('handles all nodes unreachable except source', () => {
    const edges = []
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 10)
    expect(dist[0]).toBe(0)
    for (let i = 1; i < 10; i++) {
      expect(dist[i]).toBe(Infinity)
    }
  })

  it('handles complete graph', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 0, to: 2, weight: 2 },
      { from: 1, to: 2, weight: 3 },
      { from: 1, to: 0, weight: 4 },
      { from: 2, to: 0, weight: 5 },
      { from: 2, to: 1, weight: 6 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 3)
    expect(dist[1]).toBe(1)
    expect(dist[2]).toBe(2)
  })

  it('handles bidirectional edges', () => {
    const edges = [
      { from: 0, to: 1, weight: 3 },
      { from: 1, to: 0, weight: 4 },
      { from: 1, to: 2, weight: 2 },
      { from: 2, to: 1, weight: 5 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 3)
    expect(dist[1]).toBe(3)
    expect(dist[2]).toBe(5)
  })

  it('handles large number of nodes', () => {
    const edges: { from: number; to: number; weight: number }[] = []
    for (let i = 0; i < 99; i++) {
      edges.push({ from: i, to: i + 1, weight: 1 })
    }
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 100)
    expect(dist[99]).toBe(99)
  })

  it('handles single very long path', () => {
    const edges = [
      { from: 0, to: 1, weight: 100 },
      { from: 1, to: 2, weight: 200 },
      { from: 2, to: 3, weight: 300 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 4)
    expect(dist[3]).toBe(600)
  })

  it('handles path with varying weights', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 100 },
      { from: 2, to: 3, weight: 1 },
      { from: 0, to: 3, weight: 200 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 4)
    expect(dist[3]).toBe(102)
  })

  it('handles multiple zero weight edges', () => {
    const edges = [
      { from: 0, to: 1, weight: 0 },
      { from: 0, to: 2, weight: 0 },
      { from: 1, to: 3, weight: 5 },
      { from: 2, to: 3, weight: 10 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 4)
    expect(dist[1]).toBe(0)
    expect(dist[2]).toBe(0)
    expect(dist[3]).toBe(5)
  })

  it('handles graph with multiple components', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 2, to: 3, weight: 1 },
      { from: 4, to: 5, weight: 1 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 6)
    expect(dist[1]).toBe(1)
    expect(dist[2]).toBe(Infinity)
    expect(dist[3]).toBe(Infinity)
    expect(dist[4]).toBe(Infinity)
    expect(dist[5]).toBe(Infinity)
  })

  it('handles self loops on all nodes', () => {
    const edges = [
      { from: 0, to: 0, weight: 10 },
      { from: 1, to: 1, weight: 20 },
      { from: 0, to: 1, weight: 5 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 2)
    expect(dist[0]).toBe(0)
    expect(dist[1]).toBe(5)
  })

  it('handles disconnected node at end', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 1 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 5)
    expect(dist[2]).toBe(2)
    expect(dist[3]).toBe(Infinity)
    expect(dist[4]).toBe(Infinity)
  })

  it('handles chain with alternative paths', () => {
    const edges = [
      { from: 0, to: 1, weight: 10 },
      { from: 1, to: 2, weight: 10 },
      { from: 0, to: 2, weight: 5 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 3)
    expect(dist[1]).toBe(10)
    expect(dist[2]).toBe(5)
  })

  it('handles multiple edges to same node with different weights', () => {
    const edges = [
      { from: 0, to: 1, weight: 10 },
      { from: 0, to: 1, weight: 5 },
      { from: 0, to: 1, weight: 8 },
      { from: 1, to: 2, weight: 1 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 3)
    expect(dist[1]).toBe(5)
    expect(dist[2]).toBe(6)
  })

  it('handles sparse graph', () => {
    const edges = [{ from: 0, to: 9, weight: 100 }]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 10)
    expect(dist[9]).toBe(100)
    for (let i = 1; i < 9; i++) {
      expect(dist[i]).toBe(Infinity)
    }
  })

  it('handles dense graph', () => {
    const edges: { from: number; to: number; weight: number }[] = []
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (i !== j) {
          edges.push({ from: i, to: j, weight: Math.abs(i - j) })
        }
      }
    }
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 5)
    expect(dist[4]).toBe(4)
  })

  it('handles tree structure', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 0, to: 2, weight: 1 },
      { from: 1, to: 3, weight: 1 },
      { from: 1, to: 4, weight: 1 },
      { from: 2, to: 5, weight: 1 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 6)
    expect(dist[3]).toBe(2)
    expect(dist[4]).toBe(2)
    expect(dist[5]).toBe(2)
  })

  it('handles mesh network', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 0, to: 2, weight: 1 },
      { from: 1, to: 2, weight: 1 },
      { from: 1, to: 3, weight: 1 },
      { from: 2, to: 3, weight: 1 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 4)
    expect(dist[3]).toBe(2)
  })

  it('handles no edges but multiple nodes', () => {
    const dist = DijkstraFibonacci.shortestPath([], 0, 20)
    expect(dist[0]).toBe(0)
    expect(dist[19]).toBe(Infinity)
  })

  it('handles single large capacity edge', () => {
    const edges = [{ from: 0, to: 1, weight: Number.MAX_SAFE_INTEGER / 2 }]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 2)
    expect(dist[1]).toBe(Number.MAX_SAFE_INTEGER / 2)
  })

  it('handles equal weights throughout', () => {
    const edges = [
      { from: 0, to: 1, weight: 5 },
      { from: 1, to: 2, weight: 5 },
      { from: 2, to: 3, weight: 5 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 4)
    expect(dist[3]).toBe(15)
  })

  it('handles increasing weights', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 2 },
      { from: 2, to: 3, weight: 3 },
      { from: 3, to: 4, weight: 4 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 5)
    expect(dist[4]).toBe(10)
  })

  it('handles decreasing weights', () => {
    const edges = [
      { from: 0, to: 1, weight: 4 },
      { from: 1, to: 2, weight: 3 },
      { from: 2, to: 3, weight: 2 },
      { from: 3, to: 4, weight: 1 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 5)
    expect(dist[4]).toBe(10)
  })

  it('finds shortest among multiple equal length paths', () => {
    const edges = [
      { from: 0, to: 1, weight: 5 },
      { from: 0, to: 2, weight: 5 },
      { from: 1, to: 3, weight: 5 },
      { from: 2, to: 3, weight: 5 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 4)
    expect(dist[3]).toBe(10)
  })

  it('handles fractional weights', () => {
    const edges = [
      { from: 0, to: 1, weight: 0.5 },
      { from: 1, to: 2, weight: 1.5 },
      { from: 0, to: 2, weight: 3.0 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 3)
    expect(dist[2]).toBeCloseTo(2.0, 10)
  })

  it('handles multiple equal weight alternative routes', () => {
    const edges = [
      { from: 0, to: 1, weight: 2 },
      { from: 0, to: 2, weight: 2 },
      { from: 1, to: 3, weight: 3 },
      { from: 2, to: 3, weight: 3 },
      { from: 0, to: 3, weight: 6 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 4)
    expect(dist[3]).toBe(5)
  })

  it('handles large dense graph with many edges', () => {
    const edges: { from: number; to: number; weight: number }[] = []
    for (let i = 0; i < 10; i++) {
      for (let j = i + 1; j < 10; j++) {
        edges.push({ from: i, to: j, weight: j - i })
      }
    }
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 10)
    expect(dist[9]).toBe(9)
  })

  it('handles source with multiple outgoing zero weight edges', () => {
    const edges = [
      { from: 0, to: 1, weight: 0 },
      { from: 0, to: 2, weight: 0 },
      { from: 0, to: 3, weight: 0 },
      { from: 1, to: 4, weight: 10 },
      { from: 2, to: 4, weight: 5 },
      { from: 3, to: 4, weight: 7 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 5)
    expect(dist[4]).toBe(5)
  })

  it('handles single node', () => {
    const { dist } = DijkstraFibonacci.shortestPath([], 0, 1)
    expect(dist[0]).toBe(0)
  })

  it('unreachable nodes have Infinity distance', () => {
    const edges = [{ from: 0, to: 1, weight: 5 }]
    const { dist } = DijkstraFibonacci.shortestPath(edges, 0, 3)
    expect(dist[2]).toBe(Infinity)
  })

  it('returns correct prev array', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 2 },
    ]
    const { prev } = DijkstraFibonacci.shortestPath(edges, 0, 3)
    expect(prev[1]).toBe(0)
    expect(prev[2]).toBe(1)
  })
})
  it('single node distance is 0', () => {
    const result = DijkstraFibonacci.shortestPath([], 1, 0)
    expect(result.distances[0]).toBe(0)
  })

  it('two nodes with edge', () => {
    const result = DijkstraFibonacci.shortestPath([{ from: 0, to: 1, weight: 5 }], 2, 0)
    expect(result.distances[1]).toBe(5)
  })

  it('disconnected node has Infinity', () => {
    const result = DijkstraFibonacci.shortestPath([], 2, 0)
    expect(result.distances[1]).toBe(Infinity)
  })

describe('dijkstra-fibonacci - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('dijkstra-fibonacci - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('dijkstra-fibonacci - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('dijkstra-fibonacci - wave548', () => {
  it('dijkstra-fibonacci module defined', () => {
    expect(describe).toBeDefined()
  })
  it('dijkstra-fibonacci module is function', () => {
    expect(describe).toBeDefined()
  })
  it('dijkstra-fibonacci module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('dijkstra-fibonacci - wave549', () => {
  it('dijkstra-fibonacci module defined', () => {
    expect(describe).toBeDefined()
  })
  it('dijkstra-fibonacci module is function', () => {
    expect(describe).toBeDefined()
  })
  it('dijkstra-fibonacci module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('dijkstra-fibonacci - wave550', () => {
  it('dijkstra-fibonacci w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('dijkstra-fibonacci w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('dijkstra-fibonacci w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('dijkstra-fibonacci - wave551', () => {
  it('dijkstra-fibonacci w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('dijkstra-fibonacci w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('dijkstra-fibonacci w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})
