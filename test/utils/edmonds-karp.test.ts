import { describe, expect, it } from 'vitest'
import { EdmondsKarp } from '../../src/utils/edmonds-karp.js'

describe('EdmondsKarp', () => {
  it('computes max flow for simple path', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 1, to: 2, capacity: 2 },
    ]
    expect(EdmondsKarp.maxFlow(edges, 0, 2, 3)).toBe(2)
  })

  it('computes max flow for diamond', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 0, to: 2, capacity: 2 },
      { from: 1, to: 3, capacity: 2 },
      { from: 2, to: 3, capacity: 3 },
    ]
    expect(EdmondsKarp.maxFlow(edges, 0, 3, 4)).toBe(4)
  })

  it('handles source = sink', () => {
    expect(EdmondsKarp.maxFlow([], 0, 0, 1)).toBe(0)
  })

  it('handles disconnected', () => {
    expect(EdmondsKarp.maxFlow([{ from: 0, to: 1, capacity: 5 }], 0, 2, 3)).toBe(0)
  })

  it('handles bottleneck', () => {
    const edges = [
      { from: 0, to: 1, capacity: 100 },
      { from: 1, to: 2, capacity: 1 },
    ]
    expect(EdmondsKarp.maxFlow(edges, 0, 2, 3)).toBe(1)
  })

  it('minCut returns reachable set', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 1, to: 2, capacity: 1 },
    ]
    const { maxFlow, reachable } = EdmondsKarp.minCut(edges, 0, 2, 3)
    expect(maxFlow).toBe(1)
    expect(reachable.has(0)).toBe(true)
  })

  it('handles parallel edges', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 0, to: 1, capacity: 2 },
    ]
    expect(EdmondsKarp.maxFlow(edges, 0, 1, 2)).toBe(5)
  })

  it('handles single edge', () => {
    expect(EdmondsKarp.maxFlow([{ from: 0, to: 1, capacity: 7 }], 0, 1, 2)).toBe(7)
  })

  it('handles zero capacity', () => {
    expect(EdmondsKarp.maxFlow([{ from: 0, to: 1, capacity: 0 }], 0, 1, 2)).toBe(0)
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
    expect(EdmondsKarp.maxFlow(edges, 0, 5, 6)).toBe(20)
  })

  it('handles reverse edge capacity', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 1, to: 0, capacity: 3 },
    ]
    expect(EdmondsKarp.maxFlow(edges, 0, 1, 2)).toBe(5)
  })

  it('handles diamond graph', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 1, to: 3, capacity: 10 },
      { from: 2, to: 3, capacity: 10 },
    ]
    expect(EdmondsKarp.maxFlow(edges, 0, 3, 4)).toBe(20)
  })

  it('handles disconnected source-sink', () => {
    expect(EdmondsKarp.maxFlow([{ from: 1, to: 2, capacity: 5 }], 0, 3, 4)).toBe(0)
  })

  it('handles single node', () => {
    expect(EdmondsKarp.maxFlow([], 0, 0, 1)).toBe(0)
  })
})
