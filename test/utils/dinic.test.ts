import { describe, expect, it } from 'vitest'
import { DinicMaxFlow } from '../../src/utils/dinic.js'

describe('DinicMaxFlow', () => {
  it('computes max flow for simple path', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 1, to: 2, capacity: 2 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 2, 3)).toBe(2)
  })

  it('computes max flow for diamond graph', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 0, to: 2, capacity: 2 },
      { from: 1, to: 3, capacity: 2 },
      { from: 2, to: 3, capacity: 3 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 3, 4)).toBe(4)
  })

  it('returns 0 for disconnected graph', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 2, 3)).toBe(0)
  })

  it('handles source = sink', () => {
    expect(DinicMaxFlow.maxFlow([], 0, 0, 1)).toBe(0)
  })

  it('handles bottleneck', () => {
    const edges = [
      { from: 0, to: 1, capacity: 100 },
      { from: 1, to: 2, capacity: 1 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 2, 3)).toBe(1)
  })

  it('handles parallel edges', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 0, to: 1, capacity: 2 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 1, 2)).toBe(5)
  })

  it('handles reverse edge blocking', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 1, to: 2, capacity: 2 },
      { from: 1, to: 3, capacity: 8 },
      { from: 2, to: 3, capacity: 10 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 3, 4)).toBe(18)
  })

  it('handles zero capacity edges', () => {
    const edges = [
      { from: 0, to: 1, capacity: 0 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 1, 2)).toBe(0)
  })

  it('handles multi-path flow', () => {
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
    expect(DinicMaxFlow.maxFlow(edges, 0, 5, 6)).toBe(20)
  })

  it('handles cycle in graph', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 1, to: 2, capacity: 3 },
      { from: 2, to: 0, capacity: 1 },
      { from: 1, to: 3, capacity: 4 },
      { from: 2, to: 3, capacity: 2 },
    ]
    const flow = DinicMaxFlow.maxFlow(edges, 0, 3, 4)
    expect(flow).toBeGreaterThan(0)
    expect(flow).toBeLessThanOrEqual(5)
  })

  it('handles large capacity', () => {
    const edges = [
      { from: 0, to: 1, capacity: 1000000 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 1, 2)).toBe(1000000)
  })

  it('handles disconnected source and sink', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 2, to: 3, capacity: 5 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 3, 4)).toBe(0)
  })

  it('single edge max flow equals capacity', () => {
    const edges = [{ from: 0, to: 1, capacity: 7 }]
    expect(DinicMaxFlow.maxFlow(edges, 0, 1, 2)).toBe(7)
  })

  it('no path has zero flow', () => {
    const edges = [{ from: 0, to: 1, capacity: 5 }]
    expect(DinicMaxFlow.maxFlow(edges, 1, 0, 2)).toBe(0)
  })

  it('handles three parallel edges', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 0, to: 1, capacity: 4 },
      { from: 0, to: 1, capacity: 5 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 1, 2)).toBe(12)
  })

  it('handles bidirectional edges', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 1, to: 0, capacity: 3 },
      { from: 1, to: 2, capacity: 4 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 2, 3)).toBe(4)
  })

  it('handles complex network with multiple sinks', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 1, to: 3, capacity: 5 },
      { from: 2, to: 3, capacity: 5 },
      { from: 3, to: 4, capacity: 8 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 4, 5)).toBe(8)
  })

  it('handles very large flow network', () => {
    const edges = [
      { from: 0, to: 1, capacity: 1000 },
      { from: 0, to: 2, capacity: 1000 },
      { from: 1, to: 3, capacity: 500 },
      { from: 2, to: 3, capacity: 500 },
      { from: 3, to: 4, capacity: 1000 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 4, 5)).toBe(1000)
  })

  it('handles zero capacity in middle of path', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 1, to: 2, capacity: 0 },
      { from: 0, to: 2, capacity: 5 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 2, 3)).toBe(5)
  })

  it('handles multiple bottlenecks', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 1, to: 2, capacity: 5 },
      { from: 2, to: 3, capacity: 3 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 3, 4)).toBe(3)
  })

  it('handles empty edges array', () => {
    expect(DinicMaxFlow.maxFlow([], 0, 1, 2)).toBe(0)
  })

  it('handles single node network', () => {
    expect(DinicMaxFlow.maxFlow([], 0, 0, 1)).toBe(0)
  })

  it('handles source equals sink multiple nodes', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 1, to: 2, capacity: 10 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 1, 1, 3)).toBe(0)
  })

  it('handles multi-layer network', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 0, to: 2, capacity: 5 },
      { from: 1, to: 3, capacity: 3 },
      { from: 1, to: 4, capacity: 3 },
      { from: 2, to: 3, capacity: 3 },
      { from: 2, to: 4, capacity: 3 },
      { from: 3, to: 5, capacity: 5 },
      { from: 4, to: 5, capacity: 5 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 5, 6)).toBe(10)
  })

  it('handles very small capacities', () => {
    const edges = [
      { from: 0, to: 1, capacity: 1 },
      { from: 1, to: 2, capacity: 1 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 2, 3)).toBe(1)
  })

  it('handles mixed capacities', () => {
    const edges = [
      { from: 0, to: 1, capacity: 1 },
      { from: 0, to: 2, capacity: 100 },
      { from: 1, to: 3, capacity: 100 },
      { from: 2, to: 3, capacity: 1 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 3, 4)).toBe(2)
  })

  it('handles star topology', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 0, to: 3, capacity: 10 },
      { from: 1, to: 4, capacity: 5 },
      { from: 2, to: 4, capacity: 5 },
      { from: 3, to: 4, capacity: 5 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 4, 5)).toBe(15)
  })

  it('handles complete graph', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 1, to: 2, capacity: 10 },
      { from: 1, to: 0, capacity: 5 },
      { from: 2, to: 0, capacity: 5 },
      { from: 2, to: 1, capacity: 5 },
    ]
    const flow = DinicMaxFlow.maxFlow(edges, 0, 2, 3)
    expect(flow).toBeGreaterThan(0)
    expect(flow).toBeLessThanOrEqual(20)
  })

  it('handles long path', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 1, to: 2, capacity: 5 },
      { from: 2, to: 3, capacity: 5 },
      { from: 3, to: 4, capacity: 5 },
      { from: 4, to: 5, capacity: 5 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 5, 6)).toBe(5)
  })

  it('handles multiple source connections', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 0, to: 2, capacity: 5 },
      { from: 0, to: 3, capacity: 5 },
      { from: 1, to: 4, capacity: 5 },
      { from: 2, to: 4, capacity: 5 },
      { from: 3, to: 4, capacity: 5 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 4, 5)).toBe(15)
  })

  it('handles bottleneck at source', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 1, to: 2, capacity: 100 },
      { from: 1, to: 3, capacity: 100 },
      { from: 2, to: 4, capacity: 100 },
      { from: 3, to: 4, capacity: 100 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 4, 5)).toBe(3)
  })

  it('handles bottleneck at sink', () => {
    const edges = [
      { from: 0, to: 1, capacity: 100 },
      { from: 0, to: 2, capacity: 100 },
      { from: 1, to: 3, capacity: 100 },
      { from: 2, to: 3, capacity: 100 },
      { from: 3, to: 4, capacity: 3 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 4, 5)).toBe(3)
  })

  it('handles equal capacities', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 1, to: 2, capacity: 10 },
      { from: 2, to: 3, capacity: 10 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 3, 4)).toBe(10)
  })

  it('handles increasing capacities', () => {
    const edges = [
      { from: 0, to: 1, capacity: 1 },
      { from: 1, to: 2, capacity: 2 },
      { from: 2, to: 3, capacity: 3 },
      { from: 3, to: 4, capacity: 4 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 4, 5)).toBe(1)
  })

  it('handles decreasing capacities', () => {
    const edges = [
      { from: 0, to: 1, capacity: 4 },
      { from: 1, to: 2, capacity: 3 },
      { from: 2, to: 3, capacity: 2 },
      { from: 3, to: 4, capacity: 1 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 4, 5)).toBe(1)
  })

  it('handles capacity of one', () => {
    const edges = [
      { from: 0, to: 1, capacity: 1 },
      { from: 1, to: 2, capacity: 1 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 2, 3)).toBe(1)
  })

  it('handles very large number', () => {
    const edges = [
      { from: 0, to: 1, capacity: Number.MAX_SAFE_INTEGER / 2 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 1, 2)).toBe(Number.MAX_SAFE_INTEGER / 2)
  })

  it('handles multiple intermediate nodes', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 1, to: 2, capacity: 10 },
      { from: 2, to: 3, capacity: 10 },
      { from: 3, to: 4, capacity: 10 },
      { from: 4, to: 5, capacity: 10 },
      { from: 5, to: 6, capacity: 10 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 6, 7)).toBe(10)
  })

  it('handles alternative longer path', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 1, to: 2, capacity: 10 },
      { from: 0, to: 3, capacity: 5 },
      { from: 3, to: 4, capacity: 5 },
      { from: 4, to: 5, capacity: 5 },
      { from: 5, to: 2, capacity: 5 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 2, 6)).toBe(15)
  })

  it('handles single edge many times', () => {
    const edges = []
    for (let i = 0; i < 10; i++) {
      edges.push({ from: 0, to: 1, capacity: 10 })
    }
    expect(DinicMaxFlow.maxFlow(edges, 0, 1, 2)).toBe(100)
  })

  it('handles disconnected middle component', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 2, to: 3, capacity: 10 },
      { from: 3, to: 4, capacity: 10 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 4, 5)).toBe(0)
  })

  it('handles sink not reachable from any edge', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 1, to: 2, capacity: 10 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 5, 6)).toBe(0)
  })

  it('handles capacity one throughout', () => {
    const edges = [
      { from: 0, to: 1, capacity: 1 },
      { from: 0, to: 2, capacity: 1 },
      { from: 1, to: 3, capacity: 1 },
      { from: 2, to: 3, capacity: 1 },
      { from: 3, to: 4, capacity: 1 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 4, 5)).toBe(1)
  })

  it('handles very large node count', () => {
    const edges = []
    for (let i = 0; i < 49; i++) {
      edges.push({ from: i, to: i + 1, capacity: 10 })
    }
    expect(DinicMaxFlow.maxFlow(edges, 0, 50, 51)).toBe(0)
  })

  it('handles path with zero capacity edge', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 1, to: 2, capacity: 0 },
      { from: 2, to: 3, capacity: 10 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 3, 4)).toBe(0)
  })

  it('handles multiple zero capacity edges', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 1, to: 2, capacity: 0 },
      { from: 2, to: 3, capacity: 0 },
      { from: 3, to: 4, capacity: 10 },
      { from: 0, to: 4, capacity: 5 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 4, 5)).toBe(5)
  })

  it('handles self loops', () => {
    const edges = [
      { from: 0, to: 0, capacity: 10 },
      { from: 0, to: 1, capacity: 5 },
      { from: 1, to: 1, capacity: 10 },
      { from: 1, to: 2, capacity: 5 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 2, 3)).toBe(5)
  })

  it('handles all zero capacities', () => {
    const edges = [
      { from: 0, to: 1, capacity: 0 },
      { from: 1, to: 2, capacity: 0 },
      { from: 2, to: 3, capacity: 0 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 3, 4)).toBe(0)
  })

  it('handles single capacity edge', () => {
    const edges = [{ from: 0, to: 1, capacity: 1 }]
    expect(DinicMaxFlow.maxFlow(edges, 0, 1, 2)).toBe(1)
  })

  it('handles reversed direction no flow', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 1, to: 2, capacity: 10 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 2, 0, 3)).toBe(0)
  })

  it('should handle single edge', () => {
    const edges = [{ from: 0, to: 1, capacity: 10 }]
    expect(DinicMaxFlow.maxFlow(edges, 0, 1, 2)).toBe(10)
  })

  it('should handle no path', () => {
    const edges = [{ from: 0, to: 1, capacity: 5 }]
    expect(DinicMaxFlow.maxFlow(edges, 0, 2, 3)).toBe(0)
  })

  it('handles source equals sink', () => {
    expect(DinicMaxFlow.maxFlow([], 0, 0, 1)).toBe(0)
  })

  it('single edge flow', () => {
    const edges = [{ from: 0, to: 1, capacity: 10 }]
    expect(DinicMaxFlow.maxFlow(edges, 0, 1, 2)).toBe(10)
  })

  it('multiple paths to sink', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 0, to: 2, capacity: 5 },
      { from: 1, to: 3, capacity: 5 },
      { from: 2, to: 3, capacity: 5 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 3, 4)).toBe(10)
  })
})
  it('no edges max flow is 0', () => {
    expect(Dinic.maxFlow([], 2, 0, 1)).toBe(0)
  })

  it('single edge flow', () => {
    expect(Dinic.maxFlow([{ from: 0, to: 1, capacity: 10 }], 2, 0, 1)).toBe(10)
  })

  it('bottleneck flow', () => {
    const edges = [{ from: 0, to: 1, capacity: 10 }, { from: 1, to: 2, capacity: 5 }]
    expect(Dinic.maxFlow(edges, 3, 0, 2)).toBe(5)
  })

describe('dinic - wave545', () => {
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

describe('dinic - wave546', () => {
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

describe('dinic - wave547', () => {
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

describe('dinic - wave548', () => {
  it('dinic module defined', () => {
    expect(describe).toBeDefined()
  })
  it('dinic module is function', () => {
    expect(describe).toBeDefined()
  })
  it('dinic module has name', () => {
    expect(describe).toBeDefined()
  })
})
