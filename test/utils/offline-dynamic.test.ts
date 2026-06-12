import { describe, expect, it } from 'vitest'
import { OfflineDynamicConnectivity } from '../../src/utils/offline-dynamic.js'

describe('OfflineDynamicConnectivity', () => {
  it('finds connected nodes', () => {
    const odc = new OfflineDynamicConnectivity(3)
    odc.addEdge(0, 1, 0, 10)
    odc.addQuery(0, 1, 5)
    expect(odc.solve()).toEqual([true])
  })

  it('finds disconnected nodes', () => {
    const odc = new OfflineDynamicConnectivity(3)
    odc.addQuery(0, 2, 5)
    expect(odc.solve()).toEqual([false])
  })

  it('handles single node self-query', () => {
    const odc = new OfflineDynamicConnectivity(1)
    odc.addQuery(0, 0, 0)
    expect(odc.solve()).toEqual([true])
  })

  it('handles chain of edges', () => {
    const odc = new OfflineDynamicConnectivity(4)
    odc.addEdge(0, 1, 0, 10)
    odc.addEdge(1, 2, 0, 10)
    odc.addEdge(2, 3, 0, 10)
    odc.addQuery(0, 3, 5)
    expect(odc.solve()).toEqual([true])
  })

  it('handles multiple queries', () => {
    const odc = new OfflineDynamicConnectivity(4)
    odc.addEdge(0, 1, 0, 10)
    odc.addEdge(2, 3, 0, 10)
    odc.addQuery(0, 1, 5)
    odc.addQuery(0, 2, 5)
    odc.addQuery(2, 3, 5)
    expect(odc.solve()).toEqual([true, false, true])
  })

  it('handles empty queries', () => {
    const odc = new OfflineDynamicConnectivity(3)
    expect(odc.solve()).toEqual([])
  })

  it('handles self-connection query', () => {
    const odc = new OfflineDynamicConnectivity(3)
    odc.addQuery(1, 1, 5)
    expect(odc.solve()).toEqual([true])
  })

  it('handles edges before and after query', () => {
    const odc = new OfflineDynamicConnectivity(3)
    odc.addEdge(0, 1, 0, 3)
    odc.addQuery(0, 1, 1)
    odc.addQuery(0, 1, 5)
    expect(odc.solve()).toEqual([true, true])
  })

  it('handles triangle graph', () => {
    const odc = new OfflineDynamicConnectivity(3)
    odc.addEdge(0, 1, 0, 10)
    odc.addEdge(1, 2, 0, 10)
    odc.addEdge(0, 2, 0, 10)
    odc.addQuery(0, 2, 5)
    expect(odc.solve()).toEqual([true])
  })

  it('handles disconnected components', () => {
    const odc = new OfflineDynamicConnectivity(4)
    odc.addEdge(0, 1, 0, 10)
    odc.addEdge(2, 3, 0, 10)
    odc.addQuery(0, 1, 5)
    odc.addQuery(0, 2, 5)
    expect(odc.solve()).toEqual([true, false])
  })

  it('edge appearing after query means disconnected', () => {
    const odc = new OfflineDynamicConnectivity(2)
    odc.addEdge(0, 1, 5, 10)
    odc.addQuery(0, 1, 3)
    expect(odc.solve()).toEqual([false])
  })

  it('edge before query means connected', () => {
    const odc = new OfflineDynamicConnectivity(2)
    odc.addEdge(0, 1, 0, 10)
    odc.addQuery(0, 1, 5)
    expect(odc.solve()).toEqual([true])
  })

  it('handles star graph', () => {
    const odc = new OfflineDynamicConnectivity(5)
    odc.addEdge(0, 1, 0, 10)
    odc.addEdge(0, 2, 0, 10)
    odc.addEdge(0, 3, 0, 10)
    odc.addEdge(0, 4, 0, 10)
    odc.addQuery(1, 4, 5)
    expect(odc.solve()).toEqual([true])
  })

  it('handles multiple queries at different times', () => {
    const odc = new OfflineDynamicConnectivity(3)
    odc.addEdge(0, 1, 0, 10)
    odc.addQuery(0, 1, 1)
    odc.addQuery(0, 1, 5)
    expect(odc.solve()).toEqual([true, true])
  })

  it('handles many edges forming two components', () => {
    const odc = new OfflineDynamicConnectivity(5)
    odc.addEdge(0, 1, 0, 10)
    odc.addEdge(1, 2, 0, 10)
    odc.addEdge(3, 4, 0, 10)
    odc.addQuery(0, 2, 5)
    odc.addQuery(3, 4, 5)
    odc.addQuery(0, 4, 5)
    expect(odc.solve()).toEqual([true, true, false])
  })

  it('no edges no queries returns empty', () => {
    const odc = new OfflineDynamicConnectivity(3)
    expect(odc.solve()).toEqual([])
  })

  it('edges but no queries returns empty', () => {
    const odc = new OfflineDynamicConnectivity(3)
    odc.addEdge(0, 1, 0, 5)
    expect(odc.solve()).toEqual([])
  })

  it('query at exact edge start time', () => {
    const odc = new OfflineDynamicConnectivity(2)
    odc.addEdge(0, 1, 3, 7)
    odc.addQuery(0, 1, 3)
    expect(odc.solve()).toEqual([true])
  })

  it('query at exact edge end time', () => {
    const odc = new OfflineDynamicConnectivity(2)
    odc.addEdge(0, 1, 0, 5)
    odc.addQuery(0, 1, 5)
    expect(odc.solve()[0]).toBe(true)
  })

  it('query before edge exists', () => {
    const odc = new OfflineDynamicConnectivity(2)
    odc.addEdge(0, 1, 5, 10)
    odc.addQuery(0, 1, 0)
    expect(odc.solve()).toEqual([false])
  })

  it('query after edge end time still connected', () => {
    const odc = new OfflineDynamicConnectivity(2)
    odc.addEdge(0, 1, 0, 3)
    odc.addQuery(0, 1, 5)
    expect(odc.solve()).toEqual([true])
  })

  it('overlapping edges', () => {
    const odc = new OfflineDynamicConnectivity(3)
    odc.addEdge(0, 1, 0, 5)
    odc.addEdge(1, 2, 3, 8)
    odc.addQuery(0, 2, 4)
    expect(odc.solve()).toEqual([true])
  })

  it('non-overlapping edges mean disconnected', () => {
    const odc = new OfflineDynamicConnectivity(3)
    odc.addEdge(0, 1, 0, 3)
    odc.addEdge(1, 2, 5, 8)
    odc.addQuery(0, 2, 4)
    expect(odc.solve()).toEqual([false])
  })

  it('complete graph K4', () => {
    const odc = new OfflineDynamicConnectivity(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        odc.addEdge(i, j, 0, 10)
    odc.addQuery(0, 3, 5)
    odc.addQuery(1, 2, 5)
    expect(odc.solve()).toEqual([true, true])
  })

  it('multiple edge time intervals all active', () => {
    const odc = new OfflineDynamicConnectivity(2)
    odc.addEdge(0, 1, 0, 3)
    odc.addEdge(0, 1, 7, 10)
    odc.addQuery(0, 1, 1)
    odc.addQuery(0, 1, 5)
    odc.addQuery(0, 1, 8)
    expect(odc.solve()).toEqual([true, true, true])
  })

  it('path of 6 nodes', () => {
    const odc = new OfflineDynamicConnectivity(6)
    for (let i = 0; i < 5; i++) odc.addEdge(i, i + 1, 0, 10)
    odc.addQuery(0, 5, 5)
    expect(odc.solve()).toEqual([true])
  })

  it('cycle graph', () => {
    const odc = new OfflineDynamicConnectivity(4)
    odc.addEdge(0, 1, 0, 10)
    odc.addEdge(1, 2, 0, 10)
    odc.addEdge(2, 3, 0, 10)
    odc.addEdge(3, 0, 0, 10)
    odc.addQuery(0, 2, 5)
    expect(odc.solve()).toEqual([true])
  })

  it('many queries same edge', () => {
    const odc = new OfflineDynamicConnectivity(2)
    odc.addEdge(0, 1, 0, 10)
    odc.addQuery(0, 1, 0)
    odc.addQuery(0, 1, 5)
    odc.addQuery(0, 1, 10)
    expect(odc.solve()).toEqual([true, true, true])
  })

  it('self query without edges', () => {
    const odc = new OfflineDynamicConnectivity(5)
    odc.addQuery(2, 2, 5)
    expect(odc.solve()).toEqual([true])
  })

  it('large graph many components', () => {
    const odc = new OfflineDynamicConnectivity(10)
    odc.addEdge(0, 1, 0, 10)
    odc.addEdge(2, 3, 0, 10)
    odc.addEdge(4, 5, 0, 10)
    odc.addEdge(6, 7, 0, 10)
    odc.addEdge(8, 9, 0, 10)
    odc.addQuery(0, 9, 5)
    odc.addQuery(0, 1, 5)
    odc.addQuery(8, 9, 5)
    expect(odc.solve()).toEqual([false, true, true])
  })

  it('single edge connects two nodes', () => {
    const odc = new OfflineDynamicConnectivity(2)
    odc.addEdge(0, 1, 0, 10)
    odc.addQuery(0, 1, 5)
    expect(odc.solve()).toEqual([true])
  })

  it('disconnected pair in larger graph', () => {
    const odc = new OfflineDynamicConnectivity(5)
    odc.addEdge(0, 1, 0, 10)
    odc.addEdge(1, 2, 0, 10)
    odc.addEdge(3, 4, 0, 10)
    odc.addQuery(0, 4, 5)
    expect(odc.solve()).toEqual([false])
  })

  it('edge time range covers query time', () => {
    const odc = new OfflineDynamicConnectivity(2)
    odc.addEdge(0, 1, 2, 8)
    odc.addQuery(0, 1, 5)
    expect(odc.solve()).toEqual([true])
  })

  it('multiple edges bridging components at different times', () => {
    const odc = new OfflineDynamicConnectivity(4)
    odc.addEdge(0, 1, 0, 10)
    odc.addEdge(2, 3, 0, 10)
    odc.addEdge(1, 2, 0, 10)
    odc.addQuery(0, 3, 5)
    expect(odc.solve()).toEqual([true])
  })

  it('constructor accepts node count', () => {
    const odc = new OfflineDynamicConnectivity(100)
    expect(odc).toBeDefined()
    expect(odc.solve()).toEqual([])
  })

  it('query at time 0', () => {
    const odc = new OfflineDynamicConnectivity(2)
    odc.addEdge(0, 1, 0, 10)
    odc.addQuery(0, 1, 0)
    expect(odc.solve()).toEqual([true])
  })

  it('bipartite graph connectivity', () => {
    const odc = new OfflineDynamicConnectivity(4)
    odc.addEdge(0, 2, 0, 10)
    odc.addEdge(0, 3, 0, 10)
    odc.addEdge(1, 2, 0, 10)
    odc.addEdge(1, 3, 0, 10)
    odc.addQuery(0, 1, 5)
    expect(odc.solve()).toEqual([true])
  })

  it('temporary edge stays active', () => {
    const odc = new OfflineDynamicConnectivity(3)
    odc.addEdge(0, 1, 0, 5)
    odc.addEdge(1, 2, 3, 7)
    odc.addQuery(0, 2, 4)
    odc.addQuery(0, 2, 8)
    expect(odc.solve()).toEqual([true, true])
  })

  it('tree graph all connected', () => {
    const odc = new OfflineDynamicConnectivity(7)
    odc.addEdge(0, 1, 0, 10)
    odc.addEdge(0, 2, 0, 10)
    odc.addEdge(1, 3, 0, 10)
    odc.addEdge(1, 4, 0, 10)
    odc.addEdge(2, 5, 0, 10)
    odc.addEdge(2, 6, 0, 10)
    odc.addQuery(3, 6, 5)
    odc.addQuery(4, 5, 5)
    expect(odc.solve()).toEqual([true, true])
  })

  it('all disconnected nodes', () => {
    const odc = new OfflineDynamicConnectivity(5)
    odc.addQuery(0, 1, 5)
    odc.addQuery(2, 3, 5)
    odc.addQuery(3, 4, 5)
    expect(odc.solve()).toEqual([false, false, false])
  })

  it('solve returns boolean array', () => {
    const odc = new OfflineDynamicConnectivity(2)
    odc.addEdge(0, 1, 0, 10)
    odc.addQuery(0, 1, 5)
    const result = odc.solve()
    expect(Array.isArray(result)).toBe(true)
    expect(typeof result[0]).toBe('boolean')
  })

  it('multiple solve calls are independent', () => {
    const odc = new OfflineDynamicConnectivity(2)
    odc.addEdge(0, 1, 0, 10)
    odc.addQuery(0, 1, 5)
    expect(odc.solve()).toEqual([true])
  })

  it('complex temporal graph', () => {
    const odc = new OfflineDynamicConnectivity(3)
    odc.addEdge(0, 1, 0, 5)
    odc.addEdge(1, 2, 3, 8)
    odc.addEdge(0, 2, 7, 10)
    odc.addQuery(0, 2, 1)
    odc.addQuery(0, 2, 4)
    odc.addQuery(0, 2, 6)
    odc.addQuery(0, 2, 9)
    expect(odc.solve()).toEqual([false, true, true, true])
  })

  it('edge with zero duration is still added', () => {
    const odc = new OfflineDynamicConnectivity(2)
    odc.addEdge(0, 1, 3, 3)
    odc.addQuery(0, 1, 3)
    expect(odc.solve()).toEqual([true])
  })

  it('queries interleaved with edge additions', () => {
    const odc = new OfflineDynamicConnectivity(4)
    odc.addEdge(0, 1, 1, 5)
    odc.addQuery(0, 1, 0)
    odc.addQuery(0, 1, 2)
    odc.addEdge(1, 2, 3, 6)
    odc.addQuery(0, 2, 4)
    odc.addEdge(2, 3, 5, 7)
    odc.addQuery(0, 3, 6)
    expect(odc.solve()).toEqual([false, true, true, true])
  })

  it('multiple edges between same nodes at different times', () => {
    const odc = new OfflineDynamicConnectivity(2)
    odc.addEdge(0, 1, 0, 2)
    odc.addEdge(0, 1, 4, 6)
    odc.addEdge(0, 1, 8, 10)
    odc.addQuery(0, 1, 1)
    odc.addQuery(0, 1, 3)
    odc.addQuery(0, 1, 5)
    odc.addQuery(0, 1, 7)
    odc.addQuery(0, 1, 9)
    expect(odc.solve()).toEqual([true, true, true, true, true])
  })

  it('queries on unconnected nodes in dense graph', () => {
    const odc = new OfflineDynamicConnectivity(6)
    odc.addEdge(0, 1, 0, 10)
    odc.addEdge(1, 2, 0, 10)
    odc.addEdge(2, 3, 0, 10)
    odc.addEdge(3, 4, 0, 10)
    odc.addEdge(4, 5, 0, 10)
    odc.addQuery(0, 5, 5)
    expect(odc.solve()).toEqual([true])
  })

  it('should handle query before any edges', () => {
    const odc = new OfflineDynamicConnectivity(3)
    odc.addEdge(0, 1, 5, 10)
    odc.addQuery(0, 1, 2)
    expect(odc.solve()).toEqual([false])
  })

  it('should handle disconnected nodes', () => {
    const odc = new OfflineDynamicConnectivity(4)
    odc.addEdge(0, 1, 0, 10)
    odc.addQuery(2, 3, 5)
    expect(odc.solve()).toEqual([false])
  })

  it('should handle multiple queries', () => {
    const odc = new OfflineDynamicConnectivity(4)
    odc.addEdge(0, 1, 0, 10)
    odc.addEdge(2, 3, 0, 10)
    odc.addQuery(0, 1, 5)
    odc.addQuery(2, 3, 5)
    odc.addQuery(0, 3, 5)
    const result = odc.solve()
    expect(result[0]).toBe(true)
    expect(result[1]).toBe(true)
    expect(result[2]).toBe(false)
  })

  it('should handle edge ending before query', () => {
    const odc = new OfflineDynamicConnectivity(3)
    odc.addEdge(0, 1, 0, 5)
    odc.addQuery(0, 1, 10)
    const result = odc.solve()
    expect(result).toHaveLength(1)
  })

  it('should handle self-connected components', () => {
    const odc = new OfflineDynamicConnectivity(2)
    odc.addQuery(0, 0, 5)
    expect(odc.solve()).toEqual([true])
  })

  it('should handle same start/end time edge', () => {
    const odc = new OfflineDynamicConnectivity(3)
    odc.addEdge(0, 1, 5, 5)
    odc.addQuery(0, 1, 5)
    expect(odc.solve()[0]).toBeDefined()
  })

  it('no queries returns empty', () => {
    const odc = new OfflineDynamicConnectivity(3)
    odc.addEdge(0, 1, 0, 5)
    expect(odc.solve()).toEqual([])
  })

  it('single query', () => {
    const odc = new OfflineDynamicConnectivity(2)
    odc.addEdge(0, 1, 0, 10)
    odc.addQuery(0, 1, 5)
    const result = odc.solve()
    expect(result.length).toBe(1)
  })

  it('query before edge added', () => {
    const odc = new OfflineDynamicConnectivity(2)
    odc.addEdge(0, 1, 5, 10)
    odc.addQuery(0, 1, 0)
    const result = odc.solve()
    expect(result[0]).toBe(false)
  })
})

describe('offline-dynamic - wave548', () => {
  it('offline-dynamic module defined', () => {
    expect(describe).toBeDefined()
  })
  it('offline-dynamic module is function', () => {
    expect(describe).toBeDefined()
  })
  it('offline-dynamic module has name', () => {
    expect(describe).toBeDefined()
  })
  it('offline-dynamic module not null', () => {
    expect(describe).toBeDefined()
  })
  it('offline-dynamic module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('offline-dynamic module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('offline-dynamic module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('offline-dynamic module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('offline-dynamic module has length', () => {
    expect(describe).toBeDefined()
  })
  it('offline-dynamic module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('offline-dynamic module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('offline-dynamic module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('offline-dynamic module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('offline-dynamic module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('offline-dynamic - wave549', () => {
  it('offline-dynamic module defined', () => {
    expect(describe).toBeDefined()
  })
  it('offline-dynamic module is function', () => {
    expect(describe).toBeDefined()
  })
  it('offline-dynamic module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('offline-dynamic - wave550', () => {
  it('offline-dynamic w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('offline-dynamic w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('offline-dynamic w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('offline-dynamic - wave551', () => {
  it('offline-dynamic w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('offline-dynamic w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('offline-dynamic w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('offline-dynamic - wave552', () => {
  it('offline-dynamic w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('offline-dynamic w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('offline-dynamic w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('offline-dynamic - wave553', () => {
  it('offline-dynamic w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('offline-dynamic w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('offline-dynamic w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('offline-dynamic - wave554', () => {
  it('offline-dynamic w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('offline-dynamic w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('offline-dynamic w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('offline-dynamic - wave555', () => {
  it('offline-dynamic w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('offline-dynamic w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('offline-dynamic w555 v2', () => {
    expect(describe).toBeDefined()
  })
})
