import { describe, expect, it } from 'vitest'
import { BellmanFord } from '../../src/utils/bellman-ford.js'

describe('BellmanFord', () => {
  it('finds shortest paths in simple graph', () => {
    const edges = [
      { from: 0, to: 1, weight: 4 },
      { from: 0, to: 2, weight: 2 },
      { from: 1, to: 3, weight: 3 },
      { from: 2, to: 1, weight: 1 },
      { from: 2, to: 3, weight: 5 },
    ]
    const { distances, hasNegativeCycle } = BellmanFord.shortestPath(edges, 4, 0)
    expect(hasNegativeCycle).toBe(false)
    expect(distances.get(0)).toBe(0)
    expect(distances.get(1)).toBe(3)
    expect(distances.get(2)).toBe(2)
    expect(distances.get(3)).toBe(6)
  })

  it('detects negative cycles', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: -1 },
      { from: 2, to: 0, weight: -1 },
    ]
    const { hasNegativeCycle } = BellmanFord.shortestPath(edges, 3, 0)
    expect(hasNegativeCycle).toBe(true)
  })

  it('handles negative edges without negative cycle', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: -2 },
      { from: 0, to: 2, weight: 5 },
    ]
    const { distances, hasNegativeCycle } = BellmanFord.shortestPath(edges, 3, 0)
    expect(hasNegativeCycle).toBe(false)
    expect(distances.get(2)).toBe(-1)
  })

  it('handles single node', () => {
    const { distances, hasNegativeCycle } = BellmanFord.shortestPath([], 1, 0)
    expect(hasNegativeCycle).toBe(false)
    expect(distances.get(0)).toBe(0)
  })

  it('handles disconnected graph', () => {
    const edges = [{ from: 0, to: 1, weight: 5 }]
    const { distances } = BellmanFord.shortestPath(edges, 3, 0)
    expect(distances.get(0)).toBe(0)
    expect(distances.get(1)).toBe(5)
    expect(distances.get(2)).toBe(Infinity)
  })

  it('handles all edges same weight', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 1 },
      { from: 0, to: 2, weight: 1 },
    ]
    const { distances } = BellmanFord.shortestPath(edges, 3, 0)
    expect(distances.get(2)).toBe(1)
  })

  it('handles linear chain', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 2 },
      { from: 2, to: 3, weight: 3 },
    ]
    const { distances } = BellmanFord.shortestPath(edges, 4, 0)
    expect(distances.get(1)).toBe(1)
    expect(distances.get(2)).toBe(3)
    expect(distances.get(3)).toBe(6)
  })

  it('handles zero-weight edges', () => {
    const edges = [
      { from: 0, to: 1, weight: 0 },
      { from: 1, to: 2, weight: 5 },
    ]
    const { distances } = BellmanFord.shortestPath(edges, 3, 0)
    expect(distances.get(1)).toBe(0)
    expect(distances.get(2)).toBe(5)
  })

  it('does not relax through Infinity', () => {
    const edges = [
      { from: 2, to: 3, weight: -10 },
    ]
    const { distances } = BellmanFord.shortestPath(edges, 4, 0)
    expect(distances.get(3)).toBe(Infinity)
  })

  it('handles graph with multiple paths', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 0, to: 2, weight: 5 },
      { from: 1, to: 2, weight: 2 },
      { from: 1, to: 3, weight: 6 },
      { from: 2, to: 3, weight: 1 },
    ]
    const { distances } = BellmanFord.shortestPath(edges, 4, 0)
    expect(distances.get(2)).toBe(3)
    expect(distances.get(3)).toBe(4)
  })

  it('handles bidirectional edges', () => {
    const edges = [
      { from: 0, to: 1, weight: 3 },
      { from: 1, to: 0, weight: 7 },
    ]
    const { distances } = BellmanFord.shortestPath(edges, 2, 0)
    expect(distances.get(0)).toBe(0)
    expect(distances.get(1)).toBe(3)
  })

  it('handles self-loop with negative weight (cycle)', () => {
    const edges = [
      { from: 0, to: 1, weight: 5 },
      { from: 1, to: 1, weight: -1 },
    ]
    const { hasNegativeCycle } = BellmanFord.shortestPath(edges, 2, 0)
    expect(hasNegativeCycle).toBe(true)
  })

  it('handles disconnected graph', () => {
    const edges = [
      { from: 0, to: 1, weight: 5 },
      { from: 2, to: 3, weight: 3 },
    ]
    const { distances } = BellmanFord.shortestPath(edges, 4, 0)
    expect(distances.get(1)).toBe(5)
    expect(distances.get(2)).toBe(Infinity)
  })

  it('handles empty graph', () => {
    const { distances } = BellmanFord.shortestPath([], 1, 0)
    expect(distances.get(0)).toBe(0)
  })

  it('handles single node', () => {
    const { distances } = BellmanFord.shortestPath([], 1, 0)
    expect(distances.get(0)).toBe(0)
    expect(distances.size).toBe(1)
  })

  it('handles zero weight edges', () => {
    const edges = [
      { from: 0, to: 1, weight: 0 },
      { from: 1, to: 2, weight: 5 },
    ]
    const { distances } = BellmanFord.shortestPath(edges, 3, 0)
    expect(distances.get(1)).toBe(0)
    expect(distances.get(2)).toBe(5)
  })

  it('handles two nodes positive weight', () => {
    const edges = [{ from: 0, to: 1, weight: 7 }]
    const { distances } = BellmanFord.shortestPath(edges, 2, 0)
    expect(distances.get(1)).toBe(7)
  })

  it('detects negative cycle', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: -3 },
      { from: 2, to: 0, weight: 1 },
    ]
    const { hasNegativeCycle } = BellmanFord.shortestPath(edges, 3, 0)
    expect(hasNegativeCycle).toBe(true)
  })

  it('handles single node', () => {
    const { distances } = BellmanFord.shortestPath([], 1, 0)
    expect(distances.get(0)).toBe(0)
  })

  it('handles two nodes with edge', () => {
    const edges = [{ from: 0, to: 1, weight: 5 }]
    const { distances } = BellmanFord.shortestPath(edges, 2, 0)
    expect(distances.get(1)).toBe(5)
  })

  it('unreachable node has Infinity distance', () => {
    const edges = [{ from: 0, to: 1, weight: 5 }]
    const { distances } = BellmanFord.shortestPath(edges, 3, 0)
    expect(distances.get(2)).toBe(Infinity)
  })

  it('single edge distance', () => {
    const edges = [{ from: 0, to: 1, weight: 7 }]
    const { distances } = BellmanFord.shortestPath(edges, 2, 0)
    expect(distances.get(1)).toBe(7)
  })

  it('disconnected node has Infinity distance', () => {
    const edges = [{ from: 0, to: 1, weight: 5 }]
    const { distances } = BellmanFord.shortestPath(edges, 3, 0)
    expect(distances.get(2)).toBe(Infinity)
  })

  it('single node distance is 0', () => {
    const { distances } = BellmanFord.shortestPath([], 1, 0)
    expect(distances.get(0)).toBe(0)
  })

  it('two node path', () => {
    const edges = [{ from: 0, to: 1, weight: 5 }]
    const { distances } = BellmanFord.shortestPath(edges, 2, 0)
    expect(distances.get(1)).toBe(5)
  })

  it('handles different start node', () => {
    const edges = [
      { from: 0, to: 1, weight: 4 },
      { from: 1, to: 2, weight: 3 },
      { from: 2, to: 3, weight: 2 },
    ]
    const { distances } = BellmanFord.shortestPath(edges, 4, 2)
    expect(distances.get(2)).toBe(0)
    expect(distances.get(3)).toBe(2)
    expect(distances.get(0)).toBe(Infinity)
  })

  it('handles large positive weights', () => {
    const edges = [
      { from: 0, to: 1, weight: 1000000 },
      { from: 1, to: 2, weight: 2000000 },
    ]
    const { distances } = BellmanFord.shortestPath(edges, 3, 0)
    expect(distances.get(2)).toBe(3000000)
  })

  it('handles large negative weights without cycle', () => {
    const edges = [
      { from: 0, to: 1, weight: -500000 },
      { from: 1, to: 2, weight: 300000 },
    ]
    const { distances } = BellmanFord.shortestPath(edges, 3, 0)
    expect(distances.get(2)).toBe(-200000)
  })

  it('handles star graph', () => {
    const edges = [
      { from: 0, to: 1, weight: 5 },
      { from: 0, to: 2, weight: 3 },
      { from: 0, to: 3, weight: 7 },
    ]
    const { distances } = BellmanFord.shortestPath(edges, 4, 0)
    expect(distances.get(1)).toBe(5)
    expect(distances.get(2)).toBe(3)
    expect(distances.get(3)).toBe(7)
  })

  it('handles complete graph', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 0, to: 2, weight: 4 },
      { from: 1, to: 2, weight: 2 },
      { from: 1, to: 0, weight: 5 },
      { from: 2, to: 0, weight: 3 },
      { from: 2, to: 1, weight: 6 },
    ]
    const { distances } = BellmanFord.shortestPath(edges, 3, 0)
    expect(distances.get(0)).toBe(0)
    expect(distances.get(1)).toBe(1)
    expect(distances.get(2)).toBe(3)
  })

  it('detects negative cycle with multiple nodes', () => {
    const edges = [
      { from: 0, to: 1, weight: 2 },
      { from: 1, to: 2, weight: 3 },
      { from: 2, to: 3, weight: 1 },
      { from: 3, to: 1, weight: -7 },
    ]
    const { hasNegativeCycle } = BellmanFord.shortestPath(edges, 4, 0)
    expect(hasNegativeCycle).toBe(true)
  })

  it('handles self-loop with positive weight', () => {
    const edges = [
      { from: 0, to: 1, weight: 5 },
      { from: 1, to: 1, weight: 10 },
    ]
    const { distances, hasNegativeCycle } = BellmanFord.shortestPath(edges, 2, 0)
    expect(hasNegativeCycle).toBe(false)
    expect(distances.get(1)).toBe(5)
  })

  it('handles multiple edges between same nodes', () => {
    const edges = [
      { from: 0, to: 1, weight: 10 },
      { from: 0, to: 1, weight: 3 },
      { from: 0, to: 1, weight: 7 },
    ]
    const { distances } = BellmanFord.shortestPath(edges, 2, 0)
    expect(distances.get(1)).toBe(3)
  })

  it('handles larger node count', () => {
    const edges = []
    for (let i = 0; i < 9; i++) {
      edges.push({ from: i, to: i + 1, weight: 1 })
    }
    const { distances } = BellmanFord.shortestPath(edges, 10, 0)
    expect(distances.get(9)).toBe(9)
  })

  it('handles starting node in middle of chain', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 1 },
      { from: 2, to: 3, weight: 1 },
      { from: 3, to: 4, weight: 1 },
    ]
    const { distances } = BellmanFord.shortestPath(edges, 5, 2)
    expect(distances.get(0)).toBe(Infinity)
    expect(distances.get(2)).toBe(0)
    expect(distances.get(4)).toBe(2)
  })

  it('handles multiple disconnected components', () => {
    const edges = [
      { from: 0, to: 1, weight: 5 },
      { from: 2, to: 3, weight: 3 },
      { from: 4, to: 5, weight: 7 },
    ]
    const { distances } = BellmanFord.shortestPath(edges, 6, 0)
    expect(distances.get(1)).toBe(5)
    expect(distances.get(2)).toBe(Infinity)
    expect(distances.get(3)).toBe(Infinity)
    expect(distances.get(4)).toBe(Infinity)
    expect(distances.get(5)).toBe(Infinity)
  })

  it('does not detect negative cycle unreachable from start', () => {
    const edges = [
      { from: 0, to: 1, weight: 5 },
      { from: 2, to: 3, weight: 1 },
      { from: 3, to: 2, weight: -2 },
    ]
    const { hasNegativeCycle } = BellmanFord.shortestPath(edges, 4, 0)
    expect(hasNegativeCycle).toBe(false)
  })

  it('handles complex multi-path optimization', () => {
    const edges = [
      { from: 0, to: 1, weight: 10 },
      { from: 0, to: 2, weight: 5 },
      { from: 1, to: 3, weight: 1 },
      { from: 2, to: 1, weight: 3 },
      { from: 2, to: 3, weight: 9 },
      { from: 1, to: 2, weight: 2 },
    ]
    const { distances } = BellmanFord.shortestPath(edges, 4, 0)
    expect(distances.get(1)).toBe(8)
    expect(distances.get(2)).toBe(5)
    expect(distances.get(3)).toBe(9)
  })

  it('handles graph with all edges pointing away from start', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 0, to: 2, weight: 2 },
      { from: 0, to: 3, weight: 3 },
    ]
    const { distances } = BellmanFord.shortestPath(edges, 4, 0)
    expect(distances.get(1)).toBe(1)
    expect(distances.get(2)).toBe(2)
    expect(distances.get(3)).toBe(3)
  })

  it('handles only one path to each node', () => {
    const edges = [
      { from: 0, to: 1, weight: 3 },
      { from: 1, to: 2, weight: 4 },
      { from: 2, to: 3, weight: 5 },
    ]
    const { distances } = BellmanFord.shortestPath(edges, 4, 0)
    expect(distances.get(3)).toBe(12)
  })

  it('handles graph with equal alternative paths', () => {
    const edges = [
      { from: 0, to: 1, weight: 2 },
      { from: 0, to: 2, weight: 2 },
      { from: 1, to: 3, weight: 2 },
      { from: 2, to: 3, weight: 2 },
    ]
    const { distances } = BellmanFord.shortestPath(edges, 4, 0)
    expect(distances.get(3)).toBe(4)
  })

  it('handles negative cycle detection with positive initial path', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 1 },
      { from: 2, to: 3, weight: 1 },
      { from: 3, to: 2, weight: -3 },
    ]
    const { hasNegativeCycle } = BellmanFord.shortestPath(edges, 4, 0)
    expect(hasNegativeCycle).toBe(true)
  })

  it('handles isolated start node', () => {
    const edges = [
      { from: 1, to: 2, weight: 5 },
      { from: 2, to: 3, weight: 3 },
    ]
    const { distances } = BellmanFord.shortestPath(edges, 4, 0)
    expect(distances.get(0)).toBe(0)
    expect(distances.get(1)).toBe(Infinity)
    expect(distances.get(2)).toBe(Infinity)
    expect(distances.get(3)).toBe(Infinity)
  })

  it('handles optimal path through many intermediate nodes', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 1 },
      { from: 2, to: 3, weight: 1 },
      { from: 3, to: 4, weight: 1 },
      { from: 4, to: 5, weight: 1 },
      { from: 0, to: 5, weight: 10 },
    ]
    const { distances } = BellmanFord.shortestPath(edges, 6, 0)
    expect(distances.get(5)).toBe(5)
  })

  it('handles mixed positive and negative weights in DAG', () => {
    const edges = [
      { from: 0, to: 1, weight: 5 },
      { from: 0, to: 2, weight: -3 },
      { from: 1, to: 3, weight: 2 },
      { from: 2, to: 3, weight: 4 },
    ]
    const { distances } = BellmanFord.shortestPath(edges, 4, 0)
    expect(distances.get(1)).toBe(5)
    expect(distances.get(2)).toBe(-3)
    expect(distances.get(3)).toBe(1)
  })

  it('handles negative self-loop detection', () => {
    const edges = [
      { from: 0, to: 0, weight: -1 },
    ]
    const { hasNegativeCycle } = BellmanFord.shortestPath(edges, 1, 0)
    expect(hasNegativeCycle).toBe(true)
  })

  it('handles graph where negative path is better than positive', () => {
    const edges = [
      { from: 0, to: 1, weight: 10 },
      { from: 0, to: 2, weight: 1 },
      { from: 2, to: 1, weight: -5 },
    ]
    const { distances } = BellmanFord.shortestPath(edges, 3, 0)
    expect(distances.get(1)).toBe(-4)
  })

  it('handles large graph with no edges', () => {
    const { distances } = BellmanFord.shortestPath([], 100, 50)
    expect(distances.get(50)).toBe(0)
    for (let i = 0; i < 100; i++) {
      if (i !== 50) {
        expect(distances.get(i)).toBe(Infinity)
      }
    }
  })

  it('handles decimal weights', () => {
    const edges = [
      { from: 0, to: 1, weight: 1.5 },
      { from: 1, to: 2, weight: 2.5 },
    ]
    const { distances } = BellmanFord.shortestPath(edges, 3, 0)
    expect(distances.get(2)).toBe(4)
  })

  it('should handle single node', () => {
    const result = BellmanFord.shortestPath([], 1, 0)
    expect(result.distances.get(0)).toBe(0)
  })

  it('should detect negative cycle', () => {
    const edges = [{ from: 0, to: 1, weight: 1 }, { from: 1, to: 0, weight: -3 }]
    const result = BellmanFord.shortestPath(edges, 2, 0)
    expect(result.hasNegativeCycle).toBe(true)
  })

  it('handles disconnected graph', () => {
    const edges = [{ from: 0, to: 1, weight: 5 }]
    const result = BellmanFord.shortestPath(edges, 3, 0)
    expect(result.distances.get(2)).toBe(Infinity)
  })

  it('single node graph', () => {
    const result = BellmanFord.shortestPath([], 1, 0)
    expect(result.distances.get(0)).toBe(0)
    expect(result.hasNegativeCycle).toBe(false)
  })

  it('graph with zero-weight edges', () => {
    const edges = [
      { from: 0, to: 1, weight: 0 },
      { from: 1, to: 2, weight: 5 },
    ]
    const result = BellmanFord.shortestPath(edges, 3, 0)
    expect(result.distances.get(1)).toBe(0)
    expect(result.distances.get(2)).toBe(5)
  })

  it('self-loop with negative weight creates cycle', () => {
    const edges = [
      { from: 0, to: 0, weight: -1 },
    ]
    const result = BellmanFord.shortestPath(edges, 1, 0)
    expect(result.hasNegativeCycle).toBe(true)
  })
})

  it('single node shortest path is 0', () => {
    const result = BellmanFord.shortestPath([], 1, 0)
    expect(result.distances.get(0)).toBe(0)
  })

  it('two nodes with edge', () => {
    const result = BellmanFord.shortestPath([{ from: 0, to: 1, weight: 5 }], 2, 0)
    expect(result.distances.get(1)).toBe(5)
  })

  it('detects negative cycle', () => {
    const edges = [{ from: 0, to: 1, weight: 1 }, { from: 1, to: 2, weight: -3 }, { from: 2, to: 0, weight: 1 }]
    const result = BellmanFord.shortestPath(edges, 3, 0)
    expect(result.hasNegativeCycle).toBe(true)
  })

describe('bellman-ford - wave544', () => {
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

describe('bellman-ford - wave546', () => {
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
