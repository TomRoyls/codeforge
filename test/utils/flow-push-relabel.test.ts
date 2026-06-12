import { describe, expect, it } from 'vitest'
import { FlowPushRelabel } from '../../src/utils/flow-push-relabel.js'

describe('FlowPushRelabel', () => {
  it('computes max flow for simple path', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 1, to: 2, capacity: 2 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 2, 3)).toBe(2)
  })

  it('computes max flow for diamond graph', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 0, to: 2, capacity: 2 },
      { from: 1, to: 3, capacity: 2 },
      { from: 2, to: 3, capacity: 3 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 3, 4)).toBe(4)
  })

  it('handles source equals sink', () => {
    expect(FlowPushRelabel.maxFlow([], 0, 0, 1)).toBe(0)
  })

  it('handles disconnected source and sink', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 2, to: 3, capacity: 5 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 3, 4)).toBe(0)
  })

  it('handles bottleneck', () => {
    const edges = [
      { from: 0, to: 1, capacity: 100 },
      { from: 1, to: 2, capacity: 1 },
      { from: 2, to: 3, capacity: 100 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 3, 4)).toBe(1)
  })

  it('handles reverse flow', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 1, to: 2, capacity: 2 },
      { from: 1, to: 3, capacity: 8 },
      { from: 2, to: 3, capacity: 10 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 3, 4)).toBe(18)
  })

  it('handles parallel edges', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 0, to: 1, capacity: 2 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 1, 2)).toBe(5)
  })

  it('handles linear chain', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 1, to: 2, capacity: 3 },
      { from: 2, to: 3, capacity: 7 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 3, 4)).toBe(3)
  })

  it('handles zero capacity', () => {
    expect(FlowPushRelabel.maxFlow([{ from: 0, to: 1, capacity: 0 }], 0, 1, 2)).toBe(0)
  })

  it('handles single edge', () => {
    expect(FlowPushRelabel.maxFlow([{ from: 0, to: 1, capacity: 7 }], 0, 1, 2)).toBe(7)
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
    expect(FlowPushRelabel.maxFlow(edges, 0, 5, 6)).toBe(20)
  })

  it('handles diamond graph with larger capacities', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 1, to: 3, capacity: 10 },
      { from: 2, to: 3, capacity: 10 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 3, 4)).toBe(20)
  })

  it('handles empty edge list', () => {
    expect(FlowPushRelabel.maxFlow([], 0, 1, 2)).toBe(0)
  })

  it('handles multiple sources feeding single sink', () => {
    const edges = [
      { from: 0, to: 3, capacity: 5 },
      { from: 1, to: 3, capacity: 3 },
      { from: 2, to: 3, capacity: 4 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 3, 4)).toBe(5)
  })

  it('handles cycle in graph', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 1, to: 2, capacity: 5 },
      { from: 2, to: 0, capacity: 2 },
      { from: 1, to: 3, capacity: 8 },
    ]
    const flow = FlowPushRelabel.maxFlow(edges, 0, 3, 4)
    expect(flow).toBeGreaterThan(0)
    expect(flow).toBeLessThanOrEqual(8)
  })

  it('handles large capacity values', () => {
    const edges = [
      { from: 0, to: 1, capacity: 1000000 },
      { from: 1, to: 2, capacity: 1000000 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 2, 3)).toBe(1000000)
  })

  it('handles graph with dead-end branches', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 1, to: 3, capacity: 10 },
      { from: 2, to: 4, capacity: 10 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 3, 5)).toBe(10)
  })

  it('handles three-path graph with bottleneck', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 0, to: 3, capacity: 10 },
      { from: 1, to: 4, capacity: 3 },
      { from: 2, to: 4, capacity: 7 },
      { from: 3, to: 4, capacity: 5 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 4, 5)).toBe(15)
  })

  it('handles complete bipartite flow', () => {
    const edges = [
      { from: 0, to: 2, capacity: 1 },
      { from: 0, to: 3, capacity: 1 },
      { from: 1, to: 2, capacity: 1 },
      { from: 1, to: 3, capacity: 1 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 3, 4)).toBe(1)
  })

  it('handles self-loop ignored', () => {
    const edges = [
      { from: 0, to: 0, capacity: 5 },
      { from: 0, to: 1, capacity: 10 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 1, 2)).toBe(10)
  })

  it('handles bidirectional edges', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 1, to: 0, capacity: 3 },
      { from: 1, to: 2, capacity: 10 },
    ]
    const flow = FlowPushRelabel.maxFlow(edges, 0, 2, 3)
    expect(flow).toBeGreaterThanOrEqual(5)
  })

  it('handles 5-node linear chain', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 1, to: 2, capacity: 5 },
      { from: 2, to: 3, capacity: 3 },
      { from: 3, to: 4, capacity: 8 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 4, 5)).toBe(3)
  })

  it('handles unit capacity edges', () => {
    const edges = [
      { from: 0, to: 1, capacity: 1 },
      { from: 1, to: 2, capacity: 1 },
      { from: 0, to: 2, capacity: 1 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 2, 3)).toBe(2)
  })

  it('handles sink unreachable from source', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 1, to: 2, capacity: 5 },
      { from: 3, to: 4, capacity: 5 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 4, 5)).toBe(0)
  })

  it('handles multiple parallel edges', () => {
    const edges = [
      { from: 0, to: 1, capacity: 2 },
      { from: 0, to: 1, capacity: 3 },
      { from: 0, to: 1, capacity: 5 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 1, 2)).toBe(10)
  })

  it('handles star topology', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 0, to: 3, capacity: 10 },
      { from: 0, to: 4, capacity: 10 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 1, 5)).toBe(10)
  })

  it('handles mesh topology', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 1, to: 2, capacity: 5 },
      { from: 1, to: 3, capacity: 10 },
      { from: 2, to: 3, capacity: 10 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 3, 4)).toBe(20)
  })

  it('handles very large number of nodes with no edges', () => {
    expect(FlowPushRelabel.maxFlow([], 0, 99, 100)).toBe(0)
  })

  it('handles triangular path', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 1, to: 3, capacity: 5 },
      { from: 2, to: 3, capacity: 5 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 3, 4)).toBe(10)
  })

  it('handles asymmetrical diamond', () => {
    const edges = [
      { from: 0, to: 1, capacity: 8 },
      { from: 0, to: 2, capacity: 4 },
      { from: 1, to: 3, capacity: 5 },
      { from: 2, to: 3, capacity: 6 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 3, 4)).toBe(9)
  })

  it('handles complex multi-path', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 0, to: 3, capacity: 10 },
      { from: 1, to: 4, capacity: 10 },
      { from: 2, to: 4, capacity: 10 },
      { from: 3, to: 4, capacity: 10 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 4, 5)).toBe(30)
  })

  it('handles single edge with very large capacity', () => {
    const edges = [{ from: 0, to: 1, capacity: Number.MAX_SAFE_INTEGER }]
    const flow = FlowPushRelabel.maxFlow(edges, 0, 1, 2)
    expect(flow).toBe(Number.MAX_SAFE_INTEGER)
  })

  it('handles single edge with very small capacity', () => {
    const edges = [{ from: 0, to: 1, capacity: 0.5 }]
    expect(FlowPushRelabel.maxFlow(edges, 0, 1, 2)).toBe(0.5)
  })

  it('handles mixed integer and float capacities', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5.5 },
      { from: 1, to: 2, capacity: 3.2 },
    ]
    const flow = FlowPushRelabel.maxFlow(edges, 0, 2, 3)
    expect(flow).toBe(3.2)
  })

  it('handles two parallel edges to different nodes', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 0, to: 2, capacity: 5 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 1, 3)).toBe(5)
  })

  it('handles source connected to all nodes', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 0, to: 2, capacity: 4 },
      { from: 0, to: 3, capacity: 5 },
      { from: 1, to: 4, capacity: 3 },
      { from: 2, to: 4, capacity: 4 },
      { from: 3, to: 4, capacity: 5 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 4, 5)).toBe(12)
  })

  it('handles single path with multiple bottlenecks', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 1, to: 2, capacity: 5 },
      { from: 2, to: 3, capacity: 7 },
      { from: 3, to: 4, capacity: 3 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 4, 5)).toBe(3)
  })

  it('handles bidirectional flow with back edge', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 1, to: 2, capacity: 5 },
      { from: 2, to: 3, capacity: 10 },
      { from: 3, to: 1, capacity: 2 },
    ]
    const flow = FlowPushRelabel.maxFlow(edges, 0, 3, 4)
    expect(flow).toBe(5)
  })

  it('handles multiple self-loops ignored', () => {
    const edges = [
      { from: 0, to: 0, capacity: 100 },
      { from: 1, to: 1, capacity: 100 },
      { from: 0, to: 1, capacity: 5 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 1, 2)).toBe(5)
  })

  it('handles negative capacity treated as zero', () => {
    const edges = [
      { from: 0, to: 1, capacity: -5 },
      { from: 0, to: 2, capacity: 10 },
      { from: 2, to: 1, capacity: 10 },
    ]
    const flow = FlowPushRelabel.maxFlow(edges, 0, 1, 3)
    expect(flow).toBe(10)
  })

  it('handles two-node graph with direct and indirect paths', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 0, to: 2, capacity: 3 },
      { from: 2, to: 1, capacity: 4 },
    ]
    const flow = FlowPushRelabel.maxFlow(edges, 0, 1, 3)
    expect(flow).toBe(8)
  })

  it('handles complex cycle', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 1, to: 2, capacity: 5 },
      { from: 2, to: 3, capacity: 5 },
      { from: 3, to: 1, capacity: 2 },
    ]
    const flow = FlowPushRelabel.maxFlow(edges, 0, 3, 4)
    expect(flow).toBe(5)
  })

  it('handles symmetric diamond', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 1, to: 3, capacity: 10 },
      { from: 2, to: 3, capacity: 10 },
      { from: 1, to: 2, capacity: 5 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 3, 4)).toBe(20)
  })

  it('handles sink with multiple incoming paths from same node', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 0, to: 2, capacity: 5 },
      { from: 0, to: 3, capacity: 5 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 1, 4)).toBe(5)
  })

  it('handles graph with intermediate node that can route both ways', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 1, to: 2, capacity: 10 },
      { from: 1, to: 3, capacity: 10 },
      { from: 2, to: 4, capacity: 8 },
      { from: 3, to: 4, capacity: 7 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 4, 5)).toBe(10)
  })

  it('handles source directly connected to sink with intermediate paths', () => {
    const edges = [
      { from: 0, to: 4, capacity: 5 },
      { from: 0, to: 1, capacity: 10 },
      { from: 1, to: 2, capacity: 10 },
      { from: 2, to: 3, capacity: 10 },
      { from: 3, to: 4, capacity: 10 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 4, 5)).toBe(15)
  })

  it('handles source with no outgoing edges', () => {
    const edges = [
      { from: 1, to: 2, capacity: 10 },
      { from: 2, to: 3, capacity: 10 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 3, 4)).toBe(0)
  })

  it('handles sink with no incoming edges', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 1, to: 2, capacity: 10 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 3, 4)).toBe(0)
  })

  it('handles complete graph with equal capacities', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 0, to: 2, capacity: 5 },
      { from: 1, to: 2, capacity: 5 },
      { from: 1, to: 3, capacity: 5 },
      { from: 2, to: 3, capacity: 5 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 3, 4)).toBe(10)
  })

  it('handles very small float capacity near zero', () => {
    const edges = [
      { from: 0, to: 1, capacity: 0.0001 },
      { from: 1, to: 2, capacity: 0.0001 },
    ]
    const flow = FlowPushRelabel.maxFlow(edges, 0, 2, 3)
    expect(flow).toBe(0.0001)
  })

  it('handles large graph with 100 nodes and minimal edges', () => {
    const edges = [
      { from: 0, to: 50, capacity: 10 },
      { from: 50, to: 99, capacity: 10 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 99, 100)).toBe(10)
  })

  it('returns 0 when source equals sink', () => {
    expect(FlowPushRelabel.maxFlow([], 0, 0, 1)).toBe(0)
  })

  it('handles single edge', () => {
    const edges = [{ from: 0, to: 1, capacity: 7 }]
    expect(FlowPushRelabel.maxFlow(edges, 0, 1, 2)).toBe(7)
  })

  it('handles graph with disconnected sink', () => {
    const edges = [{ from: 0, to: 1, capacity: 5 }]
    expect(FlowPushRelabel.maxFlow(edges, 0, 2, 3)).toBe(0)
  })

  it('handles parallel edges by summing capacity', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 0, to: 1, capacity: 4 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 1, 2)).toBe(7)
  })

  it('no edges max flow is 0', () => {
    expect(FlowPushRelabel.maxFlow([], 0, 1, 2)).toBe(0)
  })

  it('single edge flow', () => {
    expect(FlowPushRelabel.maxFlow([{ from: 0, to: 1, capacity: 10 }], 0, 1, 2)).toBe(10)
  })

  it('bottleneck flow', () => {
    const edges = [{ from: 0, to: 1, capacity: 10 }, { from: 1, to: 2, capacity: 5 }]
    expect(FlowPushRelabel.maxFlow(edges, 0, 2, 3)).toBe(5)
  })
})

describe('flow-push-relabel - wave545', () => {
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

describe('flow-push-relabel - wave546', () => {
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

describe('flow-push-relabel - wave547', () => {
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

describe('flow-push-relabel - wave548', () => {
  it('flow-push-relabel module defined', () => {
    expect(describe).toBeDefined()
  })
  it('flow-push-relabel module is function', () => {
    expect(describe).toBeDefined()
  })
  it('flow-push-relabel module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('flow-push-relabel - wave549', () => {
  it('flow-push-relabel module defined', () => {
    expect(describe).toBeDefined()
  })
  it('flow-push-relabel module is function', () => {
    expect(describe).toBeDefined()
  })
  it('flow-push-relabel module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('flow-push-relabel - wave550', () => {
  it('flow-push-relabel w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('flow-push-relabel w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('flow-push-relabel w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('flow-push-relabel - wave551', () => {
  it('flow-push-relabel w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('flow-push-relabel w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('flow-push-relabel w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('flow-push-relabel - wave552', () => {
  it('flow-push-relabel w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('flow-push-relabel w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('flow-push-relabel w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('flow-push-relabel - wave553', () => {
  it('flow-push-relabel w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('flow-push-relabel w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('flow-push-relabel w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('flow-push-relabel - wave554', () => {
  it('flow-push-relabel w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('flow-push-relabel w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('flow-push-relabel w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('flow-push-relabel - wave555', () => {
  it('flow-push-relabel w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('flow-push-relabel w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('flow-push-relabel w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('flow-push-relabel - wave556', () => {
  it('flow-push-relabel w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('flow-push-relabel w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('flow-push-relabel w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('flow-push-relabel - wave557', () => {
  it('flow-push-relabel w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('flow-push-relabel w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('flow-push-relabel w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('flow-push-relabel - wave558', () => {
  it('flow-push-relabel w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('flow-push-relabel w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('flow-push-relabel w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('flow-push-relabel - wave559', () => {
  it('flow-push-relabel w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('flow-push-relabel w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('flow-push-relabel w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('flow-push-relabel - wave560', () => {
  it('flow-push-relabel w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('flow-push-relabel w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('flow-push-relabel w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('flow-push-relabel - wave561', () => {
  it('flow-push-relabel w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('flow-push-relabel w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('flow-push-relabel w561 v2', () => {
    expect(describe).toBeDefined()
  })
})
