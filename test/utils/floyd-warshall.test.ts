import { describe, expect, it } from 'vitest'
import { FloydWarshall } from '../../src/utils/floyd-warshall.js'

describe('FloydWarshall', () => {
  it('finds all-pairs shortest paths', () => {
    const edges = [
      { from: 0, to: 1, weight: 3 },
      { from: 1, to: 2, weight: 1 },
      { from: 0, to: 2, weight: 10 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 3)
    expect(dist[0]![0]).toBe(0)
    expect(dist[0]![1]).toBe(3)
    expect(dist[0]![2]).toBe(4)
    expect(dist[1]![2]).toBe(1)
  })

  it('handles single node', () => {
    const dist = FloydWarshall.allPairsShortestPath([], 1)
    expect(dist[0]![0]).toBe(0)
  })

  it('handles disconnected nodes', () => {
    const dist = FloydWarshall.allPairsShortestPath([], 2)
    expect(dist[0]![0]).toBe(0)
    expect(dist[0]![1]).toBe(Infinity)
    expect(dist[1]![0]).toBe(Infinity)
  })

  it('hasNegativeCycle detects negative cycle', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: -3 },
      { from: 2, to: 0, weight: 1 },
    ]
    expect(FloydWarshall.hasNegativeCycle(edges, 3)).toBe(true)
  })

  it('hasNegativeCycle returns false for valid graph', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 2 },
    ]
    expect(FloydWarshall.hasNegativeCycle(edges, 3)).toBe(false)
  })

  it('transitiveClosure computes reachability', () => {
    const edges = [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
    ]
    const reach = FloydWarshall.transitiveClosure(edges, 3)
    expect(reach[0]![0]).toBe(true)
    expect(reach[0]![1]).toBe(true)
    expect(reach[0]![2]).toBe(true)
    expect(reach[2]![0]).toBe(false)
  })

  it('transitiveClosure handles empty edges', () => {
    const reach = FloydWarshall.transitiveClosure([], 3)
    expect(reach[0]![0]).toBe(true)
    expect(reach[0]![1]).toBe(false)
  })

  it('handles graph with all nodes connected', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 1 },
      { from: 2, to: 0, weight: 1 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 3)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        expect(dist[i]![j]!).toBeLessThanOrEqual(2)
      }
    }
  })

  it('handles bidirectional edges', () => {
    const edges = [
      { from: 0, to: 1, weight: 3 },
      { from: 1, to: 0, weight: 5 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 2)
    expect(dist[0]![1]).toBe(3)
    expect(dist[1]![0]).toBe(5)
  })

  it('transitiveClosure for cycle', () => {
    const edges = [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 0 },
    ]
    const reach = FloydWarshall.transitiveClosure(edges, 3)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        expect(reach[i]![j]).toBe(true)
      }
    }
  })

  it('handles two-node graph', () => {
    const dist = FloydWarshall.allPairsShortestPath([
      { from: 0, to: 1, weight: 7 },
    ], 2)
    expect(dist[0]![0]).toBe(0)
    expect(dist[0]![1]).toBe(7)
    expect(dist[1]![0]).toBe(Infinity)
    expect(dist[1]![1]).toBe(0)
  })

  it('handles disconnected graph', () => {
    const dist = FloydWarshall.allPairsShortestPath([
      { from: 0, to: 1, weight: 1 },
      { from: 2, to: 3, weight: 1 },
    ], 4)
    expect(dist[0]![1]).toBe(1)
    expect(dist[0]![2]).toBe(Infinity)
    expect(dist[2]![3]).toBe(1)
  })

  it('handles self-loop', () => {
    const dist = FloydWarshall.allPairsShortestPath([
      { from: 0, to: 0, weight: 3 },
      { from: 0, to: 1, weight: 5 },
    ], 2)
    expect(dist[0]![0]).toBe(0)
    expect(dist[0]![1]).toBe(5)
  })

  it('handles single node', () => {
    const dist = FloydWarshall.allPairsShortestPath([], 1)
    expect(dist[0]![0]).toBe(0)
  })

  it('handles negative weight edge', () => {
    const edges = [
      { from: 0, to: 1, weight: 2 },
      { from: 1, to: 2, weight: -1 },
      { from: 0, to: 2, weight: 5 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 3)
    expect(dist[0]![2]).toBe(1)
  })

  it('handles triangle graph', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 2 },
      { from: 2, to: 0, weight: 3 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 3)
    expect(dist[0]![2]).toBe(3)
  })

  it('handles linear chain', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 2 },
      { from: 2, to: 3, weight: 3 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 4)
    expect(dist[0]![3]).toBe(6)
  })

  it('single node has zero distance to self', () => {
    const dist = FloydWarshall.allPairsShortestPath([], 1)
    expect(dist[0]![0]).toBe(0)
  })

  it('two node graph distance', () => {
    const edges = [{ from: 0, to: 1, weight: 5 }]
    const dist = FloydWarshall.allPairsShortestPath(edges, 2)
    expect(dist[0]![1]).toBe(5)
    expect(dist[1]![0]).toBe(Infinity)
  })

  it('self distance is zero', () => {
    const edges = [{ from: 0, to: 1, weight: 5 }]
    const dist = FloydWarshall.allPairsShortestPath(edges, 2)
    expect(dist[0]![0]).toBe(0)
  })

  it('distance to self is 0', () => {
    const edges: { from: number; to: number; weight: number }[] = []
    const dist = FloydWarshall.allPairsShortestPath(edges, 3)
    expect(dist[0]![0]).toBe(0)
    expect(dist[1]![1]).toBe(0)
  })

  it('distance to unreachable is Infinity', () => {
    const edges = [{ from: 0, to: 1, weight: 5 }]
    const dist = FloydWarshall.allPairsShortestPath(edges, 3)
    expect(dist[0]![2]).toBe(Infinity)
  })

  it('self distance is 0', () => {
    const edges = [{ from: 0, to: 1, weight: 5 }]
    const dist = FloydWarshall.allPairsShortestPath(edges, 2)
    expect(dist[0]![0]).toBe(0)
  })

  it('self distance is zero for all nodes', () => {
    const edges = [{ from: 0, to: 1, weight: 5 }]
    const dist = FloydWarshall.allPairsShortestPath(edges, 2)
    expect(dist[1]![1]).toBe(0)
  })

  it('handles zero weight edges', () => {
    const edges = [
      { from: 0, to: 1, weight: 0 },
      { from: 1, to: 2, weight: 5 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 3)
    expect(dist[0]![2]).toBe(5)
  })

  it('handles multiple edges between same nodes', () => {
    const edges = [
      { from: 0, to: 1, weight: 3 },
      { from: 0, to: 1, weight: 7 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 2)
    expect(dist[0]![1]).toBe(3)
  })

  it('handles large graph with 10 nodes', () => {
    const edges: { from: number; to: number; weight: number }[] = []
    for (let i = 0; i < 9; i++) {
      edges.push({ from: i, to: i + 1, weight: 1 })
    }
    const dist = FloydWarshall.allPairsShortestPath(edges, 10)
    expect(dist[0]![9]).toBe(9)
    expect(dist[5]![8]).toBe(3)
  })

  it('handles star graph topology', () => {
    const edges = [
      { from: 0, to: 1, weight: 2 },
      { from: 0, to: 2, weight: 3 },
      { from: 0, to: 3, weight: 1 },
      { from: 0, to: 4, weight: 4 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 5)
    expect(dist[1]![2]).toBe(Infinity)
    expect(dist[3]![4]).toBe(Infinity)
    expect(dist[0]![4]).toBe(4)
  })

  it('handles complete graph', () => {
    const edges: { from: number; to: number; weight: number }[] = []
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (i !== j) edges.push({ from: i, to: j, weight: 1 })
      }
    }
    const dist = FloydWarshall.allPairsShortestPath(edges, 4)
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (i !== j) expect(dist[i]![j]).toBe(1)
      }
    }
  })

  it('hasNegativeCycle returns false for disconnected graph', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 2, to: 3, weight: -1 },
    ]
    expect(FloydWarshall.hasNegativeCycle(edges, 4)).toBe(false)
  })

  it('hasNegativeCycle detects self-loop negative edge', () => {
    const edges = [{ from: 0, to: 0, weight: -1 }]
    expect(FloydWarshall.hasNegativeCycle(edges, 1)).toBe(true)
  })

  it('hasNegativeCycle handles graph without cycles', () => {
    const edges = [
      { from: 0, to: 1, weight: 5 },
      { from: 1, to: 2, weight: 3 },
      { from: 2, to: 3, weight: 2 },
    ]
    expect(FloydWarshall.hasNegativeCycle(edges, 4)).toBe(false)
  })

  it('transitiveClosure handles single node', () => {
    const reach = FloydWarshall.transitiveClosure([], 1)
    expect(reach[0]![0]).toBe(true)
  })

  it('transitiveClosure handles complete graph', () => {
    const edges: { from: number; to: number }[] = []
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (i !== j) edges.push({ from: i, to: j })
      }
    }
    const reach = FloydWarshall.transitiveClosure(edges, 4)
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        expect(reach[i]![j]).toBe(true)
      }
    }
  })

  it('transitiveClosure handles no edges', () => {
    const reach = FloydWarshall.transitiveClosure([], 4)
    for (let i = 0; i < 4; i++) {
      expect(reach[i]![i]).toBe(true)
      for (let j = 0; j < 4; j++) {
        if (i !== j) expect(reach[i]![j]).toBe(false)
      }
    }
  })

  it('transitiveClosure handles star graph', () => {
    const edges = [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 0, to: 3 },
    ]
    const reach = FloydWarshall.transitiveClosure(edges, 4)
    expect(reach[0]![1]).toBe(true)
    expect(reach[0]![2]).toBe(true)
    expect(reach[0]![3]).toBe(true)
    expect(reach[1]![0]).toBe(false)
    expect(reach[1]![2]).toBe(false)
  })

  it('transitiveClosure handles linear chain', () => {
    const edges = [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 },
    ]
    const reach = FloydWarshall.transitiveClosure(edges, 4)
    expect(reach[0]![3]).toBe(true)
    expect(reach[3]![0]).toBe(false)
    expect(reach[1]![2]).toBe(true)
    expect(reach[2]![1]).toBe(false)
  })

  it('handles graph with zero-weight self-loops', () => {
    const edges = [
      { from: 0, to: 0, weight: 0 },
      { from: 0, to: 1, weight: 5 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 2)
    expect(dist[0]![0]).toBe(0)
    expect(dist[0]![1]).toBe(5)
  })

  it('handles graph with mixed positive and zero weights', () => {
    const edges = [
      { from: 0, to: 1, weight: 0 },
      { from: 1, to: 2, weight: 0 },
      { from: 2, to: 3, weight: 5 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 4)
    expect(dist[0]![3]).toBe(5)
  })

  it('handles duplicate edges with different weights', () => {
    const edges = [
      { from: 0, to: 1, weight: 10 },
      { from: 0, to: 1, weight: 3 },
      { from: 0, to: 1, weight: 7 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 2)
    expect(dist[0]![1]).toBe(3)
  })

  it('handles large negative weights without cycles', () => {
    const edges = [
      { from: 0, to: 1, weight: -100 },
      { from: 1, to: 2, weight: -50 },
      { from: 2, to: 3, weight: -25 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 4)
    expect(dist[0]![3]).toBe(-175)
  })

  it('handles graph with isolated node in middle', () => {
    const edges = [
      { from: 0, to: 1, weight: 2 },
      { from: 3, to: 4, weight: 3 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 5)
    expect(dist[0]![1]).toBe(2)
    expect(dist[0]![2]).toBe(Infinity)
    expect(dist[2]![3]).toBe(Infinity)
    expect(dist[3]![4]).toBe(3)
  })

  it('handles directed vs undirected paths', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 1 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 3)
    expect(dist[0]![2]).toBe(2)
    expect(dist[2]![0]).toBe(Infinity)
  })

  it('hasNegativeCycle handles single positive edge', () => {
    const edges = [{ from: 0, to: 1, weight: 5 }]
    expect(FloydWarshall.hasNegativeCycle(edges, 2)).toBe(false)
  })

  it('hasNegativeCycle handles zero weight cycle', () => {
    const edges = [
      { from: 0, to: 1, weight: 0 },
      { from: 1, to: 2, weight: 0 },
      { from: 2, to: 0, weight: 0 },
    ]
    expect(FloydWarshall.hasNegativeCycle(edges, 3)).toBe(false)
  })

  it('transitiveClosure self-reachability for disconnected nodes', () => {
    const reach = FloydWarshall.transitiveClosure([], 5)
    for (let i = 0; i < 5; i++) {
      expect(reach[i]![i]).toBe(true)
    }
  })

  it('handles graph with multiple components', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 1 },
      { from: 3, to: 4, weight: 1 },
      { from: 4, to: 5, weight: 1 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 6)
    expect(dist[0]![2]).toBe(2)
    expect(dist[3]![5]).toBe(2)
    expect(dist[0]![3]).toBe(Infinity)
  })

  it('handles very small weight differences', () => {
    const edges = [
      { from: 0, to: 1, weight: 0.001 },
      { from: 1, to: 2, weight: 0.002 },
      { from: 0, to: 2, weight: 0.004 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 3)
    expect(dist[0]![2]).toBe(0.003)
  })

  it('should detect negative cycles', () => {
    const edges = [{ from: 0, to: 1, weight: -1 }, { from: 1, to: 0, weight: -1 }]
    expect(FloydWarshall.hasNegativeCycle(edges, 2)).toBe(true)
  })

  it('should compute transitive closure', () => {
    const edges = [{ from: 0, to: 1, weight: 1 }, { from: 1, to: 2, weight: 1 }]
    const tc = FloydWarshall.transitiveClosure(edges, 3)
    expect(tc[0]![2]).toBe(true)
  })

  it('should handle single node', () => {
    const dist = FloydWarshall.allPairsShortestPath([], 1)
    expect(dist[0]![0]).toBe(0)
  })
})
