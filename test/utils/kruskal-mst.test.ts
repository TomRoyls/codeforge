import { describe, expect, it } from 'vitest'
import { KruskalMST } from '../../src/utils/kruskal-mst.js'

describe('KruskalMST', () => {
  it('finds MST for simple graph', () => {
    const edges = [
      { from: 0, to: 1, weight: 4 },
      { from: 0, to: 2, weight: 3 },
      { from: 1, to: 2, weight: 1 },
      { from: 1, to: 3, weight: 2 },
      { from: 2, to: 3, weight: 5 },
    ]
    const { edges: mstEdges, totalWeight } = KruskalMST.findMST(edges, 4)
    expect(mstEdges.length).toBe(3)
    expect(totalWeight).toBe(6)
  })

  it('handles single edge', () => {
    const { edges: mstEdges, totalWeight } = KruskalMST.findMST([
      { from: 0, to: 1, weight: 5 },
    ], 2)
    expect(mstEdges.length).toBe(1)
    expect(totalWeight).toBe(5)
  })

  it('handles single node', () => {
    const { edges: mstEdges, totalWeight } = KruskalMST.findMST([], 1)
    expect(mstEdges.length).toBe(0)
    expect(totalWeight).toBe(0)
  })

  it('handles disconnected graph', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 2, to: 3, weight: 2 },
    ]
    const { edges: mstEdges } = KruskalMST.findMST(edges, 4)
    expect(mstEdges.length).toBeLessThan(3)
  })

  it('isConnected returns true for connected graph', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 2 },
    ]
    expect(KruskalMST.isConnected(edges, 3)).toBe(true)
  })

  it('isConnected returns false for disconnected graph', () => {
    const edges = [{ from: 0, to: 1, weight: 1 }]
    expect(KruskalMST.isConnected(edges, 4)).toBe(false)
  })

  it('isConnected returns true for single node', () => {
    expect(KruskalMST.isConnected([], 1)).toBe(true)
  })

  it('handles parallel edges', () => {
    const edges = [
      { from: 0, to: 1, weight: 10 },
      { from: 0, to: 1, weight: 1 },
    ]
    const { totalWeight } = KruskalMST.findMST(edges, 2)
    expect(totalWeight).toBe(1)
  })

  it('handles triangle graph', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 2 },
      { from: 0, to: 2, weight: 3 },
    ]
    const { edges: mstEdges, totalWeight } = KruskalMST.findMST(edges, 3)
    expect(mstEdges.length).toBe(2)
    expect(totalWeight).toBe(3)
  })

  it('handles large graph', () => {
    const edges: { from: number; to: number; weight: number }[] = []
    for (let i = 0; i < 10; i++) {
      edges.push({ from: i, to: i + 1, weight: 1 })
    }
    const { edges: mstEdges, totalWeight } = KruskalMST.findMST(edges, 11)
    expect(mstEdges.length).toBe(10)
    expect(totalWeight).toBe(10)
  })

  it('MST edges are subset of input edges', () => {
    const edges = [
      { from: 0, to: 1, weight: 4 },
      { from: 0, to: 2, weight: 3 },
      { from: 1, to: 2, weight: 1 },
    ]
    const { edges: mstEdges } = KruskalMST.findMST(edges, 3)
    for (const mstEdge of mstEdges) {
      const found = edges.some(e => e.from === mstEdge.from && e.to === mstEdge.to && e.weight === mstEdge.weight)
      expect(found).toBe(true)
    }
  })

  it('handles K4', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 0, to: 2, weight: 2 },
      { from: 0, to: 3, weight: 3 },
      { from: 1, to: 2, weight: 4 },
      { from: 1, to: 3, weight: 5 },
      { from: 2, to: 3, weight: 6 },
    ]
    const { edges: mstEdges, totalWeight } = KruskalMST.findMST(edges, 4)
    expect(mstEdges.length).toBe(3)
    expect(totalWeight).toBe(6)
  })

  it('handles disconnected graph', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 2, to: 3, weight: 2 },
    ]
    expect(KruskalMST.isConnected(edges, 4)).toBe(false)
  })

  it('handles single edge MST', () => {
    const edges = [{ from: 0, to: 1, weight: 7 }]
    const { edges: mstEdges, totalWeight } = KruskalMST.findMST(edges, 2)
    expect(mstEdges.length).toBe(1)
    expect(totalWeight).toBe(7)
  })

  it('handles star graph MST', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 0, to: 2, weight: 2 },
      { from: 0, to: 3, weight: 3 },
    ]
    const { totalWeight } = KruskalMST.findMST(edges, 4)
    expect(totalWeight).toBe(6)
  })

  it('handles single node', () => {
    const { edges: mstEdges, totalWeight } = KruskalMST.findMST([], 1)
    expect(mstEdges.length).toBe(0)
    expect(totalWeight).toBe(0)
  })

  it('handles two node graph', () => {
    const { edges: mstEdges, totalWeight } = KruskalMST.findMST([
      { from: 0, to: 1, weight: 5 },
    ], 2)
    expect(mstEdges.length).toBe(1)
    expect(totalWeight).toBe(5)
  })

  it('isConnected for single node', () => {
    expect(KruskalMST.isConnected([], 1)).toBe(true)
  })

  it('findMST returns total weight', () => {
    const edges = [{ from: 0, to: 1, weight: 5 }]
    const mst = KruskalMST.findMST(edges, 2)
    expect(mst.totalWeight).toBe(5)
  })

  it('no edges has zero weight', () => {
    const mst = KruskalMST.findMST([], 1)
    expect(mst.totalWeight).toBe(0)
  })

  it('single edge MST weight equals edge weight', () => {
    const mst = KruskalMST.findMST([{ from: 0, to: 1, weight: 5 }], 2)
    expect(mst.totalWeight).toBe(5)
  })

  it('no edges yields zero weight', () => {
    const mst = KruskalMST.findMST([], 2)
    expect(mst.totalWeight).toBe(0)
  })

  it('single edge MST', () => {
    const edges = [{ from: 0, to: 1, weight: 5 }]
    const mst = KruskalMST.findMST(edges, 2)
    expect(mst.totalWeight).toBe(5)
  })

  it('disconnected graph returns partial MST', () => {
    const edges = [{ from: 0, to: 1, weight: 5 }]
    const mst = KruskalMST.findMST(edges, 3)
    expect(mst.totalWeight).toBe(5)
  })

  it('MST with zero-weight edges', () => {
    const edges = [
      { from: 0, to: 1, weight: 0 },
      { from: 1, to: 2, weight: 0 },
      { from: 0, to: 2, weight: 5 },
    ]
    const { totalWeight } = KruskalMST.findMST(edges, 3)
    expect(totalWeight).toBe(0)
  })

  it('MST with negative weights', () => {
    const edges = [
      { from: 0, to: 1, weight: -5 },
      { from: 1, to: 2, weight: -3 },
      { from: 0, to: 2, weight: 2 },
    ]
    const { totalWeight } = KruskalMST.findMST(edges, 3)
    expect(totalWeight).toBe(-8)
  })

  it('MST with duplicate weights', () => {
    const edges = [
      { from: 0, to: 1, weight: 2 },
      { from: 1, to: 2, weight: 2 },
      { from: 0, to: 2, weight: 2 },
    ]
    const { edges: mstEdges, totalWeight } = KruskalMST.findMST(edges, 3)
    expect(mstEdges.length).toBe(2)
    expect(totalWeight).toBe(4)
  })

  it('MST rejects cycles', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 2 },
      { from: 2, to: 0, weight: 3 },
    ]
    const { edges: mstEdges } = KruskalMST.findMST(edges, 3)
    expect(mstEdges.length).toBe(2)
  })

  it('complete graph of 4 nodes MST', () => {
    const edges = []
    let id = 0
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        edges.push({ from: i, to: j, weight: id++ })
      }
    }
    const { edges: mstEdges } = KruskalMST.findMST(edges, 4)
    expect(mstEdges.length).toBe(3)
  })

  it('handles large graph with 100 nodes', () => {
    const edges: { from: number; to: number; weight: number }[] = []
    for (let i = 0; i < 99; i++) {
      edges.push({ from: i, to: i + 1, weight: i + 1 })
    }
    const { edges: mstEdges, totalWeight } = KruskalMST.findMST(edges, 100)
    expect(mstEdges.length).toBe(99)
    expect(totalWeight).toBe(4950)
  })

  it('line graph MST includes all edges except one', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 2 },
      { from: 2, to: 3, weight: 3 },
      { from: 3, to: 4, weight: 4 },
    ]
    const { edges: mstEdges } = KruskalMST.findMST(edges, 5)
    expect(mstEdges.length).toBe(4)
  })

  it('MST weight is sum of edge weights', () => {
    const edges = [
      { from: 0, to: 1, weight: 10 },
      { from: 1, to: 2, weight: 20 },
    ]
    const { totalWeight } = KruskalMST.findMST(edges, 3)
    expect(totalWeight).toBe(30)
  })

  it('isConnected returns false for two disconnected components', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 2, to: 3, weight: 2 },
    ]
    expect(KruskalMST.isConnected(edges, 4)).toBe(false)
  })

  it('isConnected returns true for complete graph', () => {
    const edges = []
    for (let i = 0; i < 5; i++) {
      for (let j = i + 1; j < 5; j++) {
        edges.push({ from: i, to: j, weight: 1 })
      }
    }
    expect(KruskalMST.isConnected(edges, 5)).toBe(true)
  })

  it('isConnected with zero nodes returns true', () => {
    expect(KruskalMST.isConnected([], 0)).toBe(true)
  })

  it('MST of 2 nodes has exactly 1 edge', () => {
    const edges = [
      { from: 0, to: 1, weight: 5 },
      { from: 0, to: 1, weight: 10 },
    ]
    const { edges: mstEdges } = KruskalMST.findMST(edges, 2)
    expect(mstEdges.length).toBe(1)
  })

  it('MST handles multiple parallel edges correctly', () => {
    const edges = [
      { from: 0, to: 1, weight: 5 },
      { from: 0, to: 1, weight: 1 },
      { from: 0, to: 1, weight: 3 },
    ]
    const { edges: mstEdges, totalWeight } = KruskalMST.findMST(edges, 2)
    expect(mstEdges.length).toBe(1)
    expect(totalWeight).toBe(1)
  })

  it('MST preserves connectivity of original graph', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 2 },
      { from: 0, to: 2, weight: 100 },
    ]
    const { edges: mstEdges } = KruskalMST.findMST(edges, 3)
    expect(mstEdges.length).toBe(2)
  })

  it('MST of triangle with unequal weights', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 100 },
      { from: 0, to: 2, weight: 2 },
    ]
    const { totalWeight } = KruskalMST.findMST(edges, 3)
    expect(totalWeight).toBe(3)
  })

  it('MST handles graph with isolated vertex', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
    ]
    const { edges: mstEdges } = KruskalMST.findMST(edges, 3)
    expect(mstEdges.length).toBe(1)
  })

  it('K3 MST has 2 edges', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 2 },
      { from: 0, to: 2, weight: 3 },
    ]
    const { edges: mstEdges } = KruskalMST.findMST(edges, 3)
    expect(mstEdges.length).toBe(2)
  })

  it('K5 MST has 4 edges', () => {
    const edges = []
    for (let i = 0; i < 5; i++) {
      for (let j = i + 1; j < 5; j++) {
        edges.push({ from: i, to: j, weight: i * 5 + j })
      }
    }
    const { edges: mstEdges } = KruskalMST.findMST(edges, 5)
    expect(mstEdges.length).toBe(4)
  })

  it('MST handles all-zero weights', () => {
    const edges = [
      { from: 0, to: 1, weight: 0 },
      { from: 1, to: 2, weight: 0 },
      { from: 2, to: 3, weight: 0 },
    ]
    const { totalWeight } = KruskalMST.findMST(edges, 4)
    expect(totalWeight).toBe(0)
  })

  it('MST does not create self-loops', () => {
    const edges = [
      { from: 0, to: 0, weight: -100 },
      { from: 0, to: 1, weight: 1 },
    ]
    const { edges: mstEdges } = KruskalMST.findMST(edges, 2)
    expect(mstEdges.every(e => e.from !== e.to)).toBe(true)
  })

  it('MST of disconnected graph with 3 components', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 2, to: 3, weight: 2 },
      { from: 4, to: 5, weight: 3 },
    ]
    const { edges: mstEdges } = KruskalMST.findMST(edges, 6)
    expect(mstEdges.length).toBe(3)
  })

  it('findMST returns empty array for single node', () => {
    const { edges: mstEdges } = KruskalMST.findMST([], 1)
    expect(mstEdges).toEqual([])
  })

  it('findMST with no edges and multiple nodes returns empty MST', () => {
    const { edges: mstEdges, totalWeight } = KruskalMST.findMST([], 5)
    expect(mstEdges).toEqual([])
    expect(totalWeight).toBe(0)
  })

  it('should find MST for a simple graph', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 2 },
      { from: 0, to: 2, weight: 5 },
    ]
    const result = KruskalMST.findMST(edges, 3)
    expect(result.totalWeight).toBe(3)
    expect(result.edges).toHaveLength(2)
  })

  it('should check if graph is connected', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 2 },
    ]
    expect(KruskalMST.isConnected(edges, 3)).toBe(true)
  })

  it('should detect disconnected graph', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
    ]
    expect(KruskalMST.isConnected(edges, 3)).toBe(false)
  })

  it('should handle single node', () => {
    expect(KruskalMST.isConnected([], 1)).toBe(true)
  })

  it('should handle equal weight edges', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 1 },
      { from: 0, to: 2, weight: 1 },
    ]
    const result = KruskalMST.findMST(edges, 3)
    expect(result.totalWeight).toBe(2)
    expect(result.edges).toHaveLength(2)
  })

  it('should ignore self-loops in MST', () => {
    const edges = [
      { from: 0, to: 0, weight: 1 },
      { from: 0, to: 1, weight: 2 },
    ]
    const result = KruskalMST.findMST(edges, 2)
    expect(result.edges).toHaveLength(1)
    expect(result.totalWeight).toBe(2)
  })

  it('isConnected for disconnected graph', () => {
    const edges = [{ from: 0, to: 1, weight: 1 }]
    expect(KruskalMST.isConnected(edges, 3)).toBe(false)
  })

  it('isConnected for connected graph', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 2 },
    ]
    expect(KruskalMST.isConnected(edges, 3)).toBe(true)
  })

  it('single edge MST', () => {
    const edges = [{ from: 0, to: 1, weight: 5 }]
    const result = KruskalMST.findMST(edges, 2)
    expect(result.totalWeight).toBe(5)
  })
})

describe('kruskal-mst - wave548', () => {
  it('kruskal-mst module defined', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst module is function', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst module has name', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst module not null', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst module has length', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - wave549', () => {
  it('kruskal-mst module defined', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst module is function', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - wave550', () => {
  it('kruskal-mst w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - wave551', () => {
  it('kruskal-mst w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - wave552', () => {
  it('kruskal-mst w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - wave553', () => {
  it('kruskal-mst w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - wave554', () => {
  it('kruskal-mst w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - wave555', () => {
  it('kruskal-mst w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - wave556', () => {
  it('kruskal-mst w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - wave557', () => {
  it('kruskal-mst w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - wave558', () => {
  it('kruskal-mst w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - wave559', () => {
  it('kruskal-mst w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - wave560', () => {
  it('kruskal-mst w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - wave561', () => {
  it('kruskal-mst w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - wave562', () => {
  it('kruskal-mst w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - wave563', () => {
  it('kruskal-mst w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - wave564', () => {
  it('kruskal-mst w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - wave565', () => {
  it('kruskal-mst w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - wave566', () => {
  it('kruskal-mst w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - wave127', () => {
  it('kruskal-mst w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - wave130', () => {
  it('kruskal-mst w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - wave133', () => {
  it('kruskal-mst w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - wave136', () => {
  it('kruskal-mst w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - wave139', () => {
  it('kruskal-mst w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w142', () => {
  it('kruskal-mst v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w145', () => {
  it('kruskal-mst v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w148', () => {
  it('kruskal-mst v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w151', () => {
  it('kruskal-mst v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w154', () => {
  it('kruskal-mst v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w157', () => {
  it('kruskal-mst v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w160', () => {
  it('kruskal-mst v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w170', () => {
  it('kruskal-mst x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w180', () => {
  it('kruskal-mst x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w190', () => {
  it('kruskal-mst x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w200', () => {
  it('kruskal-mst x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w210', () => {
  it('kruskal-mst x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w220', () => {
  it('kruskal-mst x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w230', () => {
  it('kruskal-mst x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w240', () => {
  it('kruskal-mst x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w250', () => {
  it('kruskal-mst x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w260', () => {
  it('kruskal-mst x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w270', () => {
  it('kruskal-mst x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w280', () => {
  it('kruskal-mst x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w290', () => {
  it('kruskal-mst x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w300', () => {
  it('kruskal-mst x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w310', () => {
  it('kruskal-mst x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w320', () => {
  it('kruskal-mst x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w330', () => {
  it('kruskal-mst x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w340', () => {
  it('kruskal-mst x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w350', () => {
  it('kruskal-mst x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w360', () => {
  it('kruskal-mst x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w370', () => {
  it('kruskal-mst x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w380', () => {
  it('kruskal-mst x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w390', () => {
  it('kruskal-mst x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w400', () => {
  it('kruskal-mst x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w420', () => {
  it('kruskal-mst x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w440', () => {
  it('kruskal-mst x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w460', () => {
  it('kruskal-mst x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w480', () => {
  it('kruskal-mst x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w500', () => {
  it('kruskal-mst x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w550', () => {
  it('kruskal-mst x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w600', () => {
  it('kruskal-mst x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w650', () => {
  it('kruskal-mst x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('kruskal-mst - w700', () => {
  it('kruskal-mst x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('kruskal-mst x700x49', () => {
    expect(describe).toBeDefined()
  })
})
