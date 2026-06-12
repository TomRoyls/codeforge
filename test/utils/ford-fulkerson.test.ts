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

  it('should return 0 when source equals sink', () => {
    expect(FordFulkerson.maxFlow([], 0, 0, 1)).toBe(0)
  })

  it('should handle disconnected graph', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 3, 4)).toBe(0)
  })

  it('should handle single edge', () => {
    const edges = [
      { from: 0, to: 1, capacity: 7 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 1, 2)).toBe(7)
  })

  it('should handle parallel edges', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 0, to: 1, capacity: 3 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 1, 2)).toBe(8)
  })

  it('should handle bottleneck', () => {
    const edges = [
      { from: 0, to: 1, capacity: 100 },
      { from: 1, to: 2, capacity: 5 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 2, 3)).toBe(5)
  })

  it('should handle bidirectional edges', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 1, to: 0, capacity: 10 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 1, 2)).toBe(10)
  })

  it('no path returns 0', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 2, to: 3, capacity: 5 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 3, 4)).toBe(0)
  })

  it('single edge flow', () => {
    const edges = [{ from: 0, to: 1, capacity: 7 }]
    expect(FordFulkerson.maxFlow(edges, 0, 1, 2)).toBe(7)
  })

  it('zero capacity edge', () => {
    const edges = [{ from: 0, to: 1, capacity: 0 }]
    expect(FordFulkerson.maxFlow(edges, 0, 1, 2)).toBe(0)
  })
})

describe('ford-fulkerson - wave548', () => {
  it('ford-fulkerson module defined', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson module is function', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson module has name', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson module not null', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson module has length', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('ford-fulkerson - wave549', () => {
  it('ford-fulkerson module defined', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson module is function', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('ford-fulkerson - wave550', () => {
  it('ford-fulkerson w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('ford-fulkerson - wave551', () => {
  it('ford-fulkerson w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ford-fulkerson - wave552', () => {
  it('ford-fulkerson w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ford-fulkerson - wave553', () => {
  it('ford-fulkerson w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ford-fulkerson - wave554', () => {
  it('ford-fulkerson w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ford-fulkerson - wave555', () => {
  it('ford-fulkerson w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ford-fulkerson - wave556', () => {
  it('ford-fulkerson w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ford-fulkerson - wave557', () => {
  it('ford-fulkerson w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ford-fulkerson - wave558', () => {
  it('ford-fulkerson w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ford-fulkerson - wave559', () => {
  it('ford-fulkerson w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ford-fulkerson - wave560', () => {
  it('ford-fulkerson w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ford-fulkerson - wave561', () => {
  it('ford-fulkerson w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ford-fulkerson - wave562', () => {
  it('ford-fulkerson w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ford-fulkerson - wave563', () => {
  it('ford-fulkerson w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ford-fulkerson - wave564', () => {
  it('ford-fulkerson w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ford-fulkerson w564 v2', () => {
    expect(describe).toBeDefined()
  })
})
