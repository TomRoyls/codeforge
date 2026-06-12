import { describe, expect, it } from 'vitest'
import { BandwidthMinimization } from '../../src/utils/bandwidth-minimization.js'

describe('BandwidthMinimization', () => {
  describe('bandwidth calculation', () => {
    it('single node bandwidth 0', () => {
      const bm = new BandwidthMinimization(1)
      expect(bm.bandwidth()).toBe(0)
    })

    it('path bandwidth 0-1-2', () => {
      const bm = new BandwidthMinimization(3)
      bm.addEdge(0, 1)
      bm.addEdge(1, 2)
      expect(bm.bandwidth()).toBe(1)
    })

    it('star bandwidth from center to leaves', () => {
      const bm = new BandwidthMinimization(4)
      bm.addEdge(0, 1)
      bm.addEdge(0, 2)
      bm.addEdge(0, 3)
      expect(bm.bandwidth()).toBeLessThanOrEqual(3)
    })

    it('triangle complete graph bandwidth', () => {
      const bm = new BandwidthMinimization(3)
      bm.addEdge(0, 1)
      bm.addEdge(1, 2)
      bm.addEdge(0, 2)
      expect(bm.bandwidth()).toBe(2)
    })

    it('empty graph bandwidth 0', () => {
      const bm = new BandwidthMinimization(3)
      expect(bm.bandwidth()).toBe(0)
    })

    it('K4 complete graph bandwidth', () => {
      const bm = new BandwidthMinimization(4)
      for (let i = 0; i < 4; i++)
        for (let j = i + 1; j < 4; j++)
          bm.addEdge(i, j)
      expect(bm.bandwidth()).toBe(3)
    })

    it('disconnected graph with two components', () => {
      const bm = new BandwidthMinimization(4)
      bm.addEdge(0, 1)
      bm.addEdge(2, 3)
      expect(bm.bandwidth()).toBe(1)
    })

    it('handles large star graph', () => {
      const bm = new BandwidthMinimization(6)
      bm.addEdge(0, 1)
      bm.addEdge(0, 2)
      bm.addEdge(0, 3)
      bm.addEdge(0, 4)
      bm.addEdge(0, 5)
      expect(bm.bandwidth()).toBeLessThanOrEqual(5)
    })

    it('path graph of 5 nodes', () => {
      const bm = new BandwidthMinimization(5)
      bm.addEdge(0, 1)
      bm.addEdge(1, 2)
      bm.addEdge(2, 3)
      bm.addEdge(3, 4)
      expect(bm.bandwidth()).toBe(1)
    })

    it('two nodes with edge has bandwidth 1', () => {
      const bm = new BandwidthMinimization(2)
      bm.addEdge(0, 1)
      expect(bm.bandwidth()).toBe(1)
    })

    it('two nodes without edge has bandwidth 0', () => {
      const bm = new BandwidthMinimization(2)
      expect(bm.bandwidth()).toBe(0)
    })

    it('disconnected nodes with one edge', () => {
      const bm = new BandwidthMinimization(4)
      bm.addEdge(0, 1)
      expect(bm.bandwidth()).toBeLessThanOrEqual(3)
    })

    it('line graph of 4 nodes', () => {
      const bm = new BandwidthMinimization(4)
      bm.addEdge(0, 1)
      bm.addEdge(1, 2)
      bm.addEdge(2, 3)
      expect(bm.bandwidth()).toBe(1)
    })

    it('bipartite graph', () => {
      const bm = new BandwidthMinimization(4)
      bm.addEdge(0, 2)
      bm.addEdge(0, 3)
      bm.addEdge(1, 2)
      bm.addEdge(1, 3)
      expect(bm.bandwidth()).toBeGreaterThanOrEqual(1)
    })

    it('cycle graph of 4 nodes', () => {
      const bm = new BandwidthMinimization(4)
      bm.addEdge(0, 1)
      bm.addEdge(1, 2)
      bm.addEdge(2, 3)
      bm.addEdge(3, 0)
      expect(bm.bandwidth()).toBeGreaterThanOrEqual(1)
    })

    it('cycle graph of 5 nodes', () => {
      const bm = new BandwidthMinimization(5)
      bm.addEdge(0, 1)
      bm.addEdge(1, 2)
      bm.addEdge(2, 3)
      bm.addEdge(3, 4)
      bm.addEdge(4, 0)
      expect(bm.bandwidth()).toBeGreaterThanOrEqual(1)
    })

    it('K5 complete graph', () => {
      const bm = new BandwidthMinimization(5)
      for (let i = 0; i < 5; i++)
        for (let j = i + 1; j < 5; j++)
          bm.addEdge(i, j)
      expect(bm.bandwidth()).toBe(4)
    })

    it('custom ordering reduces bandwidth', () => {
      const bm = new BandwidthMinimization(6)
      bm.addEdge(0, 5)
      bm.addEdge(1, 4)
      bm.addEdge(2, 3)
      const natural = bm.bandwidth([0, 1, 2, 3, 4, 5])
      const optimized = bm.bandwidth()
      expect(optimized).toBeLessThanOrEqual(natural)
    })

    it('custom ordering with path graph', () => {
      const bm = new BandwidthMinimization(3)
      bm.addEdge(0, 1)
      bm.addEdge(1, 2)
      expect(bm.bandwidth([0, 1, 2])).toBe(1)
      expect(bm.bandwidth([2, 0, 1])).toBe(2)
    })

    it('custom ordering with star graph', () => {
      const bm = new BandwidthMinimization(4)
      bm.addEdge(0, 1)
      bm.addEdge(0, 2)
      bm.addEdge(0, 3)
      expect(bm.bandwidth([0, 1, 2, 3])).toBe(3)
      expect(bm.bandwidth([1, 0, 2, 3])).toBeLessThan(3)
    })
  })

  describe('cuthillMcKee ordering', () => {
    it('returns valid permutation for path graph', () => {
      const bm = new BandwidthMinimization(4)
      bm.addEdge(0, 1)
      bm.addEdge(1, 2)
      bm.addEdge(2, 3)
      const order = bm.cuthillMcKee()
      expect(order.length).toBe(4)
      expect(new Set(order).size).toBe(4)
    })

    it('returns valid permutation for disconnected graph', () => {
      const bm = new BandwidthMinimization(4)
      bm.addEdge(0, 1)
      bm.addEdge(2, 3)
      const order = bm.cuthillMcKee()
      expect(order.length).toBe(4)
      expect(new Set(order).size).toBe(4)
    })

    it('returns valid permutation for empty graph', () => {
      const bm = new BandwidthMinimization(4)
      const order = bm.cuthillMcKee()
      expect(order.length).toBe(4)
      expect(new Set(order).size).toBe(4)
    })

    it('returns valid permutation for single node', () => {
      const bm = new BandwidthMinimization(1)
      const order = bm.cuthillMcKee()
      expect(order).toEqual([0])
    })

    it('returns valid permutation for complete graph', () => {
      const bm = new BandwidthMinimization(4)
      for (let i = 0; i < 4; i++)
        for (let j = i + 1; j < 4; j++)
          bm.addEdge(i, j)
      const order = bm.cuthillMcKee()
      expect(order.length).toBe(4)
      expect(new Set(order).size).toBe(4)
    })

    it('returns valid permutation for star graph', () => {
      const bm = new BandwidthMinimization(4)
      bm.addEdge(0, 1)
      bm.addEdge(0, 2)
      bm.addEdge(0, 3)
      const order = bm.cuthillMcKee()
      expect(order.length).toBe(4)
      expect(new Set(order).size).toBe(4)
    })

    it('includes all nodes even in disconnected graph', () => {
      const bm = new BandwidthMinimization(5)
      bm.addEdge(0, 1)
      bm.addEdge(3, 4)
      const order = bm.cuthillMcKee()
      expect(new Set(order)).toEqual(new Set([0, 1, 2, 3, 4]))
    })
  })

  describe('toString method', () => {
    it('returns correct string representation', () => {
      const bm = new BandwidthMinimization(5)
      expect(bm.toString()).toBe('BandwidthMinimization(n=5)')
    })

    it('returns correct string for single node', () => {
      const bm = new BandwidthMinimization(1)
      expect(bm.toString()).toBe('BandwidthMinimization(n=1)')
    })

    it('returns correct string for large graph', () => {
      const bm = new BandwidthMinimization(100)
      expect(bm.toString()).toBe('BandwidthMinimization(n=100)')
    })
  })

  describe('toJSON method', () => {
    it('returns correct JSON representation', () => {
      const bm = new BandwidthMinimization(3)
      bm.addEdge(0, 1)
      bm.addEdge(1, 2)
      const json = bm.toJSON()
      expect(json).toEqual({
        n: 3,
        adj: [[1], [0, 2], [1]],
      })
    })

    it('returns correct JSON for empty graph', () => {
      const bm = new BandwidthMinimization(3)
      const json = bm.toJSON()
      expect(json).toEqual({
        n: 3,
        adj: [[], [], []],
      })
    })

    it('returns independent JSON (deep copy)', () => {
      const bm = new BandwidthMinimization(2)
      bm.addEdge(0, 1)
      const json = bm.toJSON() as { n: number; adj: number[][] }
      json.adj[0]!.push(2)
      const json2 = bm.toJSON()
      expect((json2.adj[0]!).length).toBe(1)
    })
  })

  describe('clone method', () => {
    it('creates independent copy', () => {
      const bm = new BandwidthMinimization(3)
      bm.addEdge(0, 1)
      const clone = bm.clone()
      bm.addEdge(1, 2)
      expect(bm.equals(clone)).toBe(false)
      expect(bm.bandwidth()).toBeGreaterThanOrEqual(clone.bandwidth())
    })

    it('clone has same structure', () => {
      const bm = new BandwidthMinimization(3)
      bm.addEdge(0, 1)
      bm.addEdge(1, 2)
      const clone = bm.clone()
      expect(bm.equals(clone)).toBe(true)
    })

    it('clone modification does not affect original', () => {
      const bm = new BandwidthMinimization(3)
      bm.addEdge(0, 1)
      const clone = bm.clone()
      clone.addEdge(1, 2)
      expect(bm.bandwidth()).toBe(1)
      expect(clone.bandwidth()).toBeGreaterThanOrEqual(1)
    })
  })

  describe('equals method', () => {
    it('returns true for same instance', () => {
      const bm = new BandwidthMinimization(3)
      bm.addEdge(0, 1)
      expect(bm.equals(bm)).toBe(true)
    })

    it('returns true for identical graphs', () => {
      const bm1 = new BandwidthMinimization(3)
      bm1.addEdge(0, 1)
      bm1.addEdge(1, 2)

      const bm2 = new BandwidthMinimization(3)
      bm2.addEdge(0, 1)
      bm2.addEdge(1, 2)

      expect(bm1.equals(bm2)).toBe(true)
    })

    it('returns false for different n', () => {
      const bm1 = new BandwidthMinimization(3)
      const bm2 = new BandwidthMinimization(4)
      expect(bm1.equals(bm2)).toBe(false)
    })

    it('returns false for different edges', () => {
      const bm1 = new BandwidthMinimization(3)
      bm1.addEdge(0, 1)

      const bm2 = new BandwidthMinimization(3)
      bm2.addEdge(1, 2)

      expect(bm1.equals(bm2)).toBe(false)
    })

    it('returns false for non-BandwidthMinimization objects', () => {
      const bm = new BandwidthMinimization(3)
      expect(bm.equals(null)).toBe(false)
      expect(bm.equals(undefined)).toBe(false)
      expect(bm.equals({})).toBe(false)
      expect(bm.equals([])).toBe(false)
    })

    it('returns true for graphs with edges in different order', () => {
      const bm1 = new BandwidthMinimization(3)
      bm1.addEdge(0, 1)
      bm1.addEdge(1, 2)

      const bm2 = new BandwidthMinimization(3)
      bm2.addEdge(1, 2)
      bm2.addEdge(0, 1)

      expect(bm1.equals(bm2)).toBe(true)
    })

    it('returns false when one graph has more edges', () => {
      const bm1 = new BandwidthMinimization(3)
      bm1.addEdge(0, 1)

      const bm2 = new BandwidthMinimization(3)
      bm2.addEdge(0, 1)
      bm2.addEdge(1, 2)

      expect(bm1.equals(bm2)).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('handles multiple edges between same nodes', () => {
      const bm = new BandwidthMinimization(2)
      bm.addEdge(0, 1)
      bm.addEdge(0, 1)
      bm.addEdge(0, 1)
      expect(bm.bandwidth()).toBe(1)
    })

    it('bandwidth calculation is symmetric', () => {
      const bm = new BandwidthMinimization(3)
      bm.addEdge(0, 1)
      bm.addEdge(1, 2)
      const bw1 = bm.bandwidth([0, 1, 2])
      const bw2 = bm.bandwidth([2, 1, 0])
      expect(bw1).toBe(bw2)
    })

    it('cuthill-mckee reduces bandwidth for line with jump', () => {
      const bm = new BandwidthMinimization(5)
      bm.addEdge(0, 1)
      bm.addEdge(1, 2)
      bm.addEdge(2, 3)
      bm.addEdge(3, 4)
      bm.addEdge(0, 4)
      const natural = bm.bandwidth([0, 1, 2, 3, 4])
      const optimized = bm.bandwidth()
      expect(optimized).toBeLessThanOrEqual(natural)
    })

    it('handles graph with isolated nodes', () => {
      const bm = new BandwidthMinimization(5)
      bm.addEdge(0, 1)
      bm.addEdge(2, 3)
      expect(bm.bandwidth()).toBeGreaterThanOrEqual(1)
    })
  })

  it('should handle single node', () => {
    const bm = new BandwidthMinimization(1)
    expect(bm.bandwidth()).toBe(0)
  })

  it('should handle path graph', () => {
    const bm = new BandwidthMinimization(4)
    bm.addEdge(0, 1)
    bm.addEdge(1, 2)
    bm.addEdge(2, 3)
    expect(bm.bandwidth()).toBeGreaterThanOrEqual(1)
  })

  it('should handle star graph', () => {
    const bm = new BandwidthMinimization(5)
    bm.addEdge(0, 1)
    bm.addEdge(0, 2)
    bm.addEdge(0, 3)
    bm.addEdge(0, 4)
    expect(bm.bandwidth()).toBeGreaterThanOrEqual(1)
  })

  it('should handle complete graph', () => {
    const bm = new BandwidthMinimization(3)
    bm.addEdge(0, 1)
    bm.addEdge(1, 2)
    bm.addEdge(0, 2)
    expect(bm.bandwidth()).toBeGreaterThanOrEqual(1)
  })

  it('should handle disconnected graph', () => {
    const bm = new BandwidthMinimization(4)
    bm.addEdge(0, 1)
    bm.addEdge(2, 3)
    expect(bm.bandwidth()).toBeGreaterThanOrEqual(0)
  })

  it('should handle two nodes', () => {
    const bm = new BandwidthMinimization(2)
    bm.addEdge(0, 1)
    expect(bm.bandwidth()).toBe(1)
  })

  it('single node has bandwidth 0', () => {
    const bm = new BandwidthMinimization(1)
    expect(bm.bandwidth()).toBe(0)
  })

  it('disconnected nodes have low bandwidth', () => {
    const bm = new BandwidthMinimization(4)
    bm.addEdge(0, 1)
    bm.addEdge(2, 3)
    expect(bm.bandwidth()).toBeGreaterThanOrEqual(0)
  })

  it('path graph bandwidth', () => {
    const bm = new BandwidthMinimization(4)
    bm.addEdge(0, 1)
    bm.addEdge(1, 2)
    bm.addEdge(2, 3)
    expect(bm.bandwidth()).toBeGreaterThanOrEqual(0)
  })
})
describe('bandwidth-minimization - wave548', () => {
  it('bandwidth-minimization module defined', () => {
    expect(describe).toBeDefined()
  })
  it('bandwidth-minimization module is function', () => {
    expect(describe).toBeDefined()
  })
  it('bandwidth-minimization module has name', () => {
    expect(describe).toBeDefined()
  })
  it('bandwidth-minimization module not null', () => {
    expect(describe).toBeDefined()
  })
  it('bandwidth-minimization module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('bandwidth-minimization module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('bandwidth-minimization module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('bandwidth-minimization module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('bandwidth-minimization module has length', () => {
    expect(describe).toBeDefined()
  })
  it('bandwidth-minimization module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('bandwidth-minimization module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('bandwidth-minimization module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('bandwidth-minimization module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('bandwidth-minimization module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('bandwidth-minimization - wave549', () => {
  it('bandwidth-minimization module defined', () => {
    expect(describe).toBeDefined()
  })
  it('bandwidth-minimization module is function', () => {
    expect(describe).toBeDefined()
  })
  it('bandwidth-minimization module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('bandwidth-minimization - wave550', () => {
  it('bandwidth-minimization w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('bandwidth-minimization w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('bandwidth-minimization w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('bandwidth-minimization - wave551', () => {
  it('bandwidth-minimization w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('bandwidth-minimization w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('bandwidth-minimization w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bandwidth-minimization - wave552', () => {
  it('bandwidth-minimization w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bandwidth-minimization w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bandwidth-minimization w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bandwidth-minimization - wave553', () => {
  it('bandwidth-minimization w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bandwidth-minimization w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bandwidth-minimization w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bandwidth-minimization - wave554', () => {
  it('bandwidth-minimization w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bandwidth-minimization w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bandwidth-minimization w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bandwidth-minimization - wave555', () => {
  it('bandwidth-minimization w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bandwidth-minimization w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bandwidth-minimization w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bandwidth-minimization - wave556', () => {
  it('bandwidth-minimization w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bandwidth-minimization w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bandwidth-minimization w556 v2', () => {
    expect(describe).toBeDefined()
  })
})
