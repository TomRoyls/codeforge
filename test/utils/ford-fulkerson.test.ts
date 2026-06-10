import { describe, expect, it } from 'vitest'
import { FordFulkerson } from '../../src/utils/ford-fulkerson.js'

describe('FordFulkerson', () => {
  it('computes max flow for simple path', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 1, to: 2, capacity: 2 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 2, 3)).toBe(2)
  })

  it('computes max flow for diamond graph', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 0, to: 2, capacity: 2 },
      { from: 1, to: 3, capacity: 2 },
      { from: 2, to: 3, capacity: 3 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 3, 4)).toBe(4)
  })

  it('returns 0 for disconnected', () => {
    const edges = [{ from: 0, to: 1, capacity: 5 }]
    expect(FordFulkerson.maxFlow(edges, 0, 2, 3)).toBe(0)
  })

  it('handles source = sink', () => {
    expect(FordFulkerson.maxFlow([], 0, 0, 1)).toBe(0)
  })

  it('handles bottleneck', () => {
    const edges = [
      { from: 0, to: 1, capacity: 100 },
      { from: 1, to: 2, capacity: 1 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 2, 3)).toBe(1)
  })

  it('handles parallel paths', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 0, to: 2, capacity: 5 },
      { from: 1, to: 3, capacity: 5 },
      { from: 2, to: 3, capacity: 5 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 3, 4)).toBe(10)
  })

  it('handles single edge', () => {
    const edges = [{ from: 0, to: 1, capacity: 7 }]
    expect(FordFulkerson.maxFlow(edges, 0, 1, 2)).toBe(7)
  })

  it('handles zero capacity', () => {
    const edges = [{ from: 0, to: 1, capacity: 0 }]
    expect(FordFulkerson.maxFlow(edges, 0, 1, 2)).toBe(0)
  })

  it('handles reverse flow graph', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 1, to: 2, capacity: 2 },
      { from: 1, to: 3, capacity: 8 },
      { from: 2, to: 3, capacity: 10 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 3, 4)).toBe(18)
  })

  it('handles linear chain', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 1, to: 2, capacity: 3 },
      { from: 2, to: 3, capacity: 7 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 3, 4)).toBe(3)
  })

  it('handles bidirectional edges', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 1, to: 0, capacity: 3 },
      { from: 1, to: 2, capacity: 4 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 2, 3)).toBe(4)
  })

  it('handles diamond graph', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 1, to: 3, capacity: 10 },
      { from: 2, to: 3, capacity: 10 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 3, 4)).toBe(20)
  })

  it('handles disconnected source-sink', () => {
    expect(FordFulkerson.maxFlow([{ from: 1, to: 2, capacity: 5 }], 0, 3, 4)).toBe(0)
  })

  it('handles source equals sink', () => {
    expect(FordFulkerson.maxFlow([], 0, 0, 1)).toBe(0)
  })

  it('handles parallel edges', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 0, to: 1, capacity: 7 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 1, 2)).toBe(10)
  })

  it('handles bottleneck graph', () => {
    const edges = [
      { from: 0, to: 1, capacity: 100 },
      { from: 1, to: 2, capacity: 1 },
      { from: 2, to: 3, capacity: 100 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 3, 4)).toBe(1)
  })

  it('handles single edge', () => {
    const edges = [{ from: 0, to: 1, capacity: 5 }]
    expect(FordFulkerson.maxFlow(edges, 0, 1, 2)).toBe(5)
  })

  it('no path gives zero flow', () => {
    const edges = [{ from: 0, to: 1, capacity: 5 }]
    expect(FordFulkerson.maxFlow(edges, 1, 0, 2)).toBe(0)
  })

  it('single edge max flow equals capacity', () => {
    const edges = [{ from: 0, to: 1, capacity: 8 }]
    expect(FordFulkerson.maxFlow(edges, 0, 1, 2)).toBe(8)
  })

  it('disconnected nodes have zero flow', () => {
    const edges = [{ from: 0, to: 1, capacity: 8 }]
    expect(FordFulkerson.maxFlow(edges, 2, 3, 4)).toBe(0)
  })

  it('single edge flow equals capacity', () => {
    const edges = [{ from: 0, to: 1, capacity: 7 }]
    expect(FordFulkerson.maxFlow(edges, 0, 1, 2)).toBe(7)
  })

  it('no path yields zero flow', () => {
    const edges = [{ from: 0, to: 1, capacity: 5 }]
    expect(FordFulkerson.maxFlow(edges, 1, 0, 2)).toBe(0)
  })

  it('single edge flow equals capacity', () => {
    const edges = [{ from: 0, to: 1, capacity: 10 }]
    expect(FordFulkerson.maxFlow(edges, 0, 1, 2)).toBe(10)
  })

  it('no path yields zero flow', () => {
    const edges = [{ from: 0, to: 1, capacity: 10 }]
    expect(FordFulkerson.maxFlow(edges, 1, 0, 2)).toBe(0)
  })

  it('handles multiple disjoint paths', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 0, to: 2, capacity: 5 },
      { from: 1, to: 3, capacity: 5 },
      { from: 2, to: 3, capacity: 5 },
      { from: 0, to: 4, capacity: 5 },
      { from: 4, to: 3, capacity: 5 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 3, 5)).toBe(15)
  })

  it('handles capacity constraints at source', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 0, to: 2, capacity: 4 },
      { from: 1, to: 3, capacity: 10 },
      { from: 2, to: 3, capacity: 10 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 3, 4)).toBe(7)
  })

  it('handles capacity constraints at sink', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 1, to: 3, capacity: 3 },
      { from: 2, to: 3, capacity: 4 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 3, 4)).toBe(7)
  })

  it('handles complex network with back edges', () => {
    const edges = [
      { from: 0, to: 1, capacity: 16 },
      { from: 0, to: 2, capacity: 13 },
      { from: 1, to: 2, capacity: 10 },
      { from: 1, to: 3, capacity: 12 },
      { from: 2, to: 1, capacity: 4 },
      { from: 2, to: 4, capacity: 14 },
      { from: 3, to: 2, capacity: 9 },
      { from: 3, to: 5, capacity: 20 },
      { from: 4, to: 3, capacity: 7 },
      { from: 4, to: 5, capacity: 4 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 5, 6)).toBe(23)
  })

  it('handles graph with intermediate bottleneck', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 1, to: 3, capacity: 10 },
      { from: 2, to: 3, capacity: 10 },
      { from: 3, to: 4, capacity: 5 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 4, 5)).toBe(5)
  })

  it('handles multiple bottlenecks', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 1, to: 2, capacity: 3 },
      { from: 2, to: 3, capacity: 4 },
      { from: 3, to: 4, capacity: 2 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 4, 5)).toBe(2)
  })

  it('handles star network from source', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 0, to: 2, capacity: 4 },
      { from: 0, to: 3, capacity: 2 },
      { from: 1, to: 4, capacity: 3 },
      { from: 2, to: 4, capacity: 4 },
      { from: 3, to: 4, capacity: 2 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 4, 5)).toBe(9)
  })

  it('handles star network into sink', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 0, to: 2, capacity: 4 },
      { from: 0, to: 3, capacity: 2 },
      { from: 1, to: 4, capacity: 3 },
      { from: 2, to: 4, capacity: 4 },
      { from: 3, to: 4, capacity: 2 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 4, 5)).toBe(9)
  })

  it('handles graph with cycle allowing backflow', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 1, to: 3, capacity: 8 },
      { from: 2, to: 3, capacity: 8 },
      { from: 1, to: 2, capacity: 3 },
      { from: 2, to: 1, capacity: 3 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 3, 4)).toBe(16)
  })

  it('handles multi-level network', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 1, to: 3, capacity: 5 },
      { from: 1, to: 4, capacity: 5 },
      { from: 2, to: 4, capacity: 5 },
      { from: 2, to: 5, capacity: 5 },
      { from: 3, to: 6, capacity: 5 },
      { from: 4, to: 6, capacity: 10 },
      { from: 5, to: 6, capacity: 5 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 6, 7)).toBe(20)
  })

  it('handles very small capacities', () => {
    const edges = [
      { from: 0, to: 1, capacity: 1 },
      { from: 1, to: 2, capacity: 1 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 2, 3)).toBe(1)
  })

  it('handles large capacities', () => {
    const edges = [
      { from: 0, to: 1, capacity: 1000000 },
      { from: 1, to: 2, capacity: 1000000 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 2, 3)).toBe(1000000)
  })

  it('handles graph with isolated intermediate nodes', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 1, to: 3, capacity: 5 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 3, 4)).toBe(5)
  })

  it('handles graph with unused parallel paths', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 0, to: 2, capacity: 5 },
      { from: 1, to: 3, capacity: 5 },
      { from: 2, to: 3, capacity: 10 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 3, 4)).toBe(10)
  })

  it('handles sink with multiple incoming edges', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 0, to: 2, capacity: 4 },
      { from: 1, to: 3, capacity: 5 },
      { from: 2, to: 3, capacity: 6 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 3, 4)).toBe(7)
  })

  it('handles source with multiple outgoing edges', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 0, to: 2, capacity: 4 },
      { from: 0, to: 3, capacity: 5 },
      { from: 1, to: 4, capacity: 3 },
      { from: 2, to: 4, capacity: 4 },
      { from: 3, to: 4, capacity: 5 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 4, 5)).toBe(12)
  })

  it('handles graph where source connects to sink directly and indirectly', () => {
    const edges = [
      { from: 0, to: 4, capacity: 5 },
      { from: 0, to: 1, capacity: 5 },
      { from: 1, to: 2, capacity: 5 },
      { from: 2, to: 3, capacity: 5 },
      { from: 3, to: 4, capacity: 5 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 4, 5)).toBe(10)
  })

  it('handles graph with asymmetric capacities', () => {
    const edges = [
      { from: 0, to: 1, capacity: 1 },
      { from: 0, to: 2, capacity: 100 },
      { from: 1, to: 3, capacity: 100 },
      { from: 2, to: 3, capacity: 1 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 3, 4)).toBe(2)
  })

  it('handles single edge with unit capacity', () => {
    const edges = [{ from: 0, to: 1, capacity: 1 }]
    expect(FordFulkerson.maxFlow(edges, 0, 1, 2)).toBe(1)
  })

  it('handles empty graph', () => {
    expect(FordFulkerson.maxFlow([], 0, 1, 2)).toBe(0)
  })

  it('handles graph with no edges', () => {
    expect(FordFulkerson.maxFlow([], 0, 1, 5)).toBe(0)
  })

  it('handles disconnected components with flow', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 2, to: 3, capacity: 5 },
      { from: 4, to: 5, capacity: 5 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 1, 6)).toBe(5)
  })

  it('handles flow network with residual redistribution', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 1, to: 2, capacity: 2 },
      { from: 1, to: 3, capacity: 8 },
      { from: 2, to: 3, capacity: 10 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 3, 4)).toBe(18)
  })
})
