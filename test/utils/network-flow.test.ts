import { describe, expect, it } from 'vitest'
import { NetworkFlow } from '../../src/utils/network-flow.js'

describe('NetworkFlow', () => {
  it('computes max flow for simple path', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 1, to: 2, capacity: 2 },
    ]
    expect(NetworkFlow.maxFlow(edges, 0, 2, 3)).toBe(2)
  })

  it('computes max flow for diamond', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 0, to: 2, capacity: 2 },
      { from: 1, to: 3, capacity: 2 },
      { from: 2, to: 3, capacity: 3 },
    ]
    expect(NetworkFlow.maxFlow(edges, 0, 3, 4)).toBe(4)
  })

  it('handles source = sink', () => {
    expect(NetworkFlow.maxFlow([], 0, 0, 1)).toBe(0)
  })

  it('handles disconnected', () => {
    expect(NetworkFlow.maxFlow([{ from: 0, to: 1, capacity: 5 }], 0, 2, 3)).toBe(0)
  })

  it('handles bottleneck', () => {
    const edges = [
      { from: 0, to: 1, capacity: 100 },
      { from: 1, to: 2, capacity: 1 },
    ]
    expect(NetworkFlow.maxFlow(edges, 0, 2, 3)).toBe(1)
  })

  it('handles reverse flow', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 1, to: 2, capacity: 2 },
      { from: 1, to: 3, capacity: 8 },
      { from: 2, to: 3, capacity: 10 },
    ]
    expect(NetworkFlow.maxFlow(edges, 0, 3, 4)).toBe(18)
  })

  it('hasAugmentingPath returns correct boolean', () => {
    const edges = [{ from: 0, to: 1, capacity: 5 }]
    expect(NetworkFlow.hasAugmentingPath(edges, 0, 1, 2)).toBe(true)
    expect(NetworkFlow.hasAugmentingPath(edges, 0, 2, 3)).toBe(false)
  })

  it('handles parallel edges', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 0, to: 1, capacity: 2 },
    ]
    expect(NetworkFlow.maxFlow(edges, 0, 1, 2)).toBe(5)
  })

  it('handles multi-level graph', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 1, to: 3, capacity: 5 },
      { from: 1, to: 4, capacity: 5 },
      { from: 2, to: 3, capacity: 5 },
      { from: 2, to: 4, capacity: 5 },
      { from: 3, to: 5, capacity: 10 },
      { from: 4, to: 5, capacity: 10 },
    ]
    expect(NetworkFlow.maxFlow(edges, 0, 5, 6)).toBe(20)
  })

  it('handles linear chain', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 1, to: 2, capacity: 3 },
      { from: 2, to: 3, capacity: 7 },
    ]
    expect(NetworkFlow.maxFlow(edges, 0, 3, 4)).toBe(3)
  })

  it('handles single node with source equals sink', () => {
    expect(NetworkFlow.maxFlow([], 0, 0, 1)).toBe(0)
  })

  it('handles zero capacity edges on path', () => {
    const edges = [
      { from: 0, to: 1, capacity: 0 },
      { from: 1, to: 2, capacity: 5 },
    ]
    expect(NetworkFlow.maxFlow(edges, 0, 2, 3)).toBe(0)
  })

  it('handles diamond graph with equal capacities', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 1, to: 3, capacity: 10 },
      { from: 2, to: 3, capacity: 10 },
    ]
    expect(NetworkFlow.maxFlow(edges, 0, 3, 4)).toBe(20)
  })

  it('handles two node single edge with capacity', () => {
    const edges = [{ from: 0, to: 1, capacity: 7 }]
    expect(NetworkFlow.maxFlow(edges, 0, 1, 2)).toBe(7)
  })

  it('handles reverse edges with flow', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 1, to: 0, capacity: 5 },
      { from: 1, to: 2, capacity: 10 },
    ]
    expect(NetworkFlow.maxFlow(edges, 0, 2, 3)).toBe(10)
  })

  it('handles bottleneck graph in middle', () => {
    const edges = [
      { from: 0, to: 1, capacity: 100 },
      { from: 1, to: 2, capacity: 1 },
      { from: 2, to: 3, capacity: 100 },
    ]
    expect(NetworkFlow.maxFlow(edges, 0, 3, 4)).toBe(1)
  })

  it('no path from source to sink gives zero flow', () => {
    const edges = [{ from: 0, to: 1, capacity: 5 }]
    expect(NetworkFlow.maxFlow(edges, 1, 0, 2)).toBe(0)
  })

  it('handles single edge of capacity 5', () => {
    const edges = [{ from: 0, to: 1, capacity: 5 }]
    expect(NetworkFlow.maxFlow(edges, 0, 1, 2)).toBe(5)
  })

  it('handles single edge of capacity 10', () => {
    const edges = [{ from: 0, to: 1, capacity: 10 }]
    expect(NetworkFlow.maxFlow(edges, 0, 1, 2)).toBe(10)
  })

  it('handles no path with capacity 5', () => {
    const edges = [{ from: 0, to: 1, capacity: 5 }]
    expect(NetworkFlow.maxFlow(edges, 1, 0, 2)).toBe(0)
  })

  it('handles no path with capacity 10', () => {
    const edges = [{ from: 0, to: 1, capacity: 10 }]
    expect(NetworkFlow.maxFlow(edges, 1, 0, 2)).toBe(0)
  })

  it('handles three parallel paths', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 20 },
      { from: 0, to: 3, capacity: 30 },
      { from: 1, to: 4, capacity: 10 },
      { from: 2, to: 4, capacity: 20 },
      { from: 3, to: 4, capacity: 30 },
    ]
    expect(NetworkFlow.maxFlow(edges, 0, 4, 5)).toBe(60)
  })

  it('handles complex multi-bottleneck graph', () => {
    const edges = [
      { from: 0, to: 1, capacity: 100 },
      { from: 0, to: 2, capacity: 100 },
      { from: 1, to: 3, capacity: 50 },
      { from: 1, to: 4, capacity: 50 },
      { from: 2, to: 3, capacity: 50 },
      { from: 2, to: 4, capacity: 50 },
      { from: 3, to: 5, capacity: 75 },
      { from: 4, to: 5, capacity: 75 },
    ]
    expect(NetworkFlow.maxFlow(edges, 0, 5, 6)).toBe(150)
  })

  it('handles mixed capacities on parallel paths', () => {
    const edges = [
      { from: 0, to: 1, capacity: 15 },
      { from: 0, to: 2, capacity: 25 },
      { from: 1, to: 3, capacity: 15 },
      { from: 2, to: 3, capacity: 25 },
    ]
    expect(NetworkFlow.maxFlow(edges, 0, 3, 4)).toBe(40)
  })

  it('handles graph with multiple sinks', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 1, to: 3, capacity: 10 },
      { from: 2, to: 4, capacity: 10 },
    ]
    expect(NetworkFlow.maxFlow(edges, 0, 3, 5)).toBe(10)
    expect(NetworkFlow.maxFlow(edges, 0, 4, 5)).toBe(10)
  })

  it('handles graph with multiple sources', () => {
    const edges = [
      { from: 0, to: 2, capacity: 10 },
      { from: 1, to: 2, capacity: 10 },
      { from: 2, to: 3, capacity: 10 },
    ]
    expect(NetworkFlow.maxFlow(edges, 0, 3, 4)).toBe(10)
    expect(NetworkFlow.maxFlow(edges, 1, 3, 4)).toBe(10)
  })

  it('handles capacity of 1 on single edge', () => {
    const edges = [{ from: 0, to: 1, capacity: 1 }]
    expect(NetworkFlow.maxFlow(edges, 0, 1, 2)).toBe(1)
  })

  it('handles very large capacity', () => {
    const edges = [{ from: 0, to: 1, capacity: 1000000 }]
    expect(NetworkFlow.maxFlow(edges, 0, 1, 2)).toBe(1000000)
  })

  it('handles four-node linear path', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 1, to: 2, capacity: 8 },
      { from: 2, to: 3, capacity: 6 },
    ]
    expect(NetworkFlow.maxFlow(edges, 0, 3, 4)).toBe(6)
  })

  it('handles five-node linear path', () => {
    const edges = [
      { from: 0, to: 1, capacity: 20 },
      { from: 1, to: 2, capacity: 15 },
      { from: 2, to: 3, capacity: 10 },
      { from: 3, to: 4, capacity: 5 },
    ]
    expect(NetworkFlow.maxFlow(edges, 0, 4, 5)).toBe(5)
  })

  it('handles bidirectional edges with different capacities', () => {
    const edges = [
      { from: 0, to: 1, capacity: 20 },
      { from: 1, to: 0, capacity: 10 },
    ]
    expect(NetworkFlow.maxFlow(edges, 0, 1, 2)).toBe(20)
    expect(NetworkFlow.maxFlow(edges, 1, 0, 2)).toBe(10)
  })

  it('handles graph with isolated nodes', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 1, to: 2, capacity: 10 },
    ]
    expect(NetworkFlow.maxFlow(edges, 0, 2, 5)).toBe(10)
  })

  it('handles path through multiple nodes with varying capacities', () => {
    const edges = [
      { from: 0, to: 1, capacity: 30 },
      { from: 1, to: 2, capacity: 20 },
      { from: 2, to: 3, capacity: 10 },
    ]
    expect(NetworkFlow.maxFlow(edges, 0, 3, 4)).toBe(10)
  })

  it('handles triangular graph', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 1, to: 2, capacity: 10 },
      { from: 0, to: 2, capacity: 5 },
    ]
    expect(NetworkFlow.maxFlow(edges, 0, 2, 3)).toBe(15)
  })

  it('handles star graph', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 0, to: 3, capacity: 10 },
    ]
    expect(NetworkFlow.maxFlow(edges, 0, 1, 4)).toBe(10)
    expect(NetworkFlow.maxFlow(edges, 0, 2, 4)).toBe(10)
    expect(NetworkFlow.maxFlow(edges, 0, 3, 4)).toBe(10)
  })

  it('hasAugmentingPath with connected graph', () => {
    const edges = [{ from: 0, to: 1, capacity: 5 }]
    expect(NetworkFlow.hasAugmentingPath(edges, 0, 1, 2)).toBe(true)
  })

  it('hasAugmentingPath with disconnected graph', () => {
    const edges = [{ from: 0, to: 1, capacity: 5 }]
    expect(NetworkFlow.hasAugmentingPath(edges, 0, 2, 3)).toBe(false)
  })

  it('hasAugmentingPath with zero capacity edge', () => {
    const edges = [{ from: 0, to: 1, capacity: 0 }]
    expect(NetworkFlow.hasAugmentingPath(edges, 0, 1, 2)).toBe(false)
  })

  it('hasAugmentingPath with source equals sink', () => {
    const edges = [{ from: 0, to: 1, capacity: 5 }]
    expect(NetworkFlow.hasAugmentingPath(edges, 0, 0, 2)).toBe(false)
  })

  it('handles completely disconnected graph', () => {
    const edges = []
    expect(NetworkFlow.maxFlow(edges, 0, 5, 10)).toBe(0)
  })

  it('handles graph with only self-loops', () => {
    const edges = [
      { from: 0, to: 0, capacity: 10 },
      { from: 1, to: 1, capacity: 10 },
    ]
    expect(NetworkFlow.maxFlow(edges, 0, 1, 2)).toBe(0)
  })

  it('handles edge with capacity 2', () => {
    const edges = [{ from: 0, to: 1, capacity: 2 }]
    expect(NetworkFlow.maxFlow(edges, 0, 1, 2)).toBe(2)
  })

  it('handles edge with capacity 3', () => {
    const edges = [{ from: 0, to: 1, capacity: 3 }]
    expect(NetworkFlow.maxFlow(edges, 0, 1, 2)).toBe(3)
  })

  it('handles six-node complex network', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 1, to: 3, capacity: 8 },
      { from: 1, to: 4, capacity: 2 },
      { from: 2, to: 4, capacity: 5 },
      { from: 2, to: 5, capacity: 5 },
      { from: 3, to: 5, capacity: 8 },
      { from: 4, to: 5, capacity: 7 },
    ]
    expect(NetworkFlow.maxFlow(edges, 0, 5, 6)).toBe(20)
  })

  it('handles graph with multiple edges from source to same node', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 0, to: 1, capacity: 5 },
      { from: 0, to: 1, capacity: 5 },
      { from: 1, to: 2, capacity: 15 },
    ]
    expect(NetworkFlow.maxFlow(edges, 0, 2, 3)).toBe(15)
  })
})
