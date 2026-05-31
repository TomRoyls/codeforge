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
})
