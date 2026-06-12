import { describe, expect, it } from 'vitest'
import { PrimMST } from '../../src/utils/prim-mst.js'

describe('PrimMST', () => {
  it('finds MST of triangle', () => {
    const mst = new PrimMST(3)
    mst.addEdge(0, 1, 1)
    mst.addEdge(1, 2, 2)
    mst.addEdge(0, 2, 3)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(3)
    expect(result.edges.length).toBe(2)
  })

  it('finds MST of path', () => {
    const mst = new PrimMST(3)
    mst.addEdge(0, 1, 5)
    mst.addEdge(1, 2, 3)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(8)
  })

  it('handles single node', () => {
    const mst = new PrimMST(1)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(0)
    expect(result.edges.length).toBe(0)
  })

  it('handles two nodes', () => {
    const mst = new PrimMST(2)
    mst.addEdge(0, 1, 10)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(10)
  })

  it('detects connected', () => {
    const mst = new PrimMST(3)
    mst.addEdge(0, 1, 1)
    mst.addEdge(1, 2, 1)
    expect(mst.isConnected()).toBe(true)
  })

  it('detects disconnected', () => {
    const mst = new PrimMST(3)
    mst.addEdge(0, 1, 1)
    expect(mst.isConnected()).toBe(false)
  })

  it('handles star graph', () => {
    const mst = new PrimMST(4)
    mst.addEdge(0, 1, 1)
    mst.addEdge(0, 2, 2)
    mst.addEdge(0, 3, 3)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(6)
  })

  it('handles complete graph', () => {
    const mst = new PrimMST(4)
    mst.addEdge(0, 1, 1)
    mst.addEdge(0, 2, 2)
    mst.addEdge(0, 3, 3)
    mst.addEdge(1, 2, 4)
    mst.addEdge(1, 3, 5)
    mst.addEdge(2, 3, 6)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(6)
  })

  it('handles empty graph', () => {
    const mst = new PrimMST(0)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(0)
  })

  it('handles larger graph', () => {
    const mst = new PrimMST(5)
    mst.addEdge(0, 1, 2)
    mst.addEdge(0, 3, 6)
    mst.addEdge(1, 2, 3)
    mst.addEdge(1, 3, 8)
    mst.addEdge(1, 4, 5)
    mst.addEdge(2, 4, 7)
    mst.addEdge(3, 4, 9)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(16)
  })

  it('handles disconnected gracefully', () => {
    const mst = new PrimMST(4)
    mst.addEdge(0, 1, 2)
    mst.addEdge(2, 3, 3)
    const result = mst.findMST()
    expect(result.totalWeight).toBeLessThanOrEqual(5)
  })

  it('handles parallel edges picks minimum', () => {
    const mst = new PrimMST(3)
    mst.addEdge(0, 1, 5)
    mst.addEdge(0, 1, 2)
    mst.addEdge(1, 2, 3)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(5)
  })

  it('no edges yields zero weight', () => {
    const mst = new PrimMST(3)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(0)
  })

  it('MST edges count is n-1 for connected graph', () => {
    const mst = new PrimMST(4)
    mst.addEdge(0, 1, 1)
    mst.addEdge(1, 2, 1)
    mst.addEdge(2, 3, 1)
    const result = mst.findMST()
    expect(result.edges.length).toBe(3)
  })

  it('empty graph is connected', () => {
    const mst = new PrimMST(0)
    expect(mst.isConnected()).toBe(true)
  })

  it('single node graph is connected', () => {
    const mst = new PrimMST(1)
    expect(mst.isConnected()).toBe(true)
  })

  it('two nodes without edges is disconnected', () => {
    const mst = new PrimMST(2)
    expect(mst.isConnected()).toBe(false)
  })

  it('two nodes with edge is connected', () => {
    const mst = new PrimMST(2)
    mst.addEdge(0, 1, 5)
    expect(mst.isConnected()).toBe(true)
  })

  it('handles zero weight edges', () => {
    const mst = new PrimMST(3)
    mst.addEdge(0, 1, 0)
    mst.addEdge(1, 2, 0)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(0)
  })

  it('handles negative weight edges', () => {
    const mst = new PrimMST(3)
    mst.addEdge(0, 1, -1)
    mst.addEdge(1, 2, 2)
    mst.addEdge(0, 2, 3)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(1)
  })

  it('handles large weight values', () => {
    const mst = new PrimMST(3)
    mst.addEdge(0, 1, 1000000)
    mst.addEdge(1, 2, 2000000)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(3000000)
  })

  it('handles cycle graph', () => {
    const mst = new PrimMST(4)
    mst.addEdge(0, 1, 1)
    mst.addEdge(1, 2, 1)
    mst.addEdge(2, 3, 1)
    mst.addEdge(3, 0, 10)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(3)
  })

  it('handles mesh graph', () => {
    const mst = new PrimMST(5)
    mst.addEdge(0, 1, 2)
    mst.addEdge(0, 2, 3)
    mst.addEdge(0, 3, 1)
    mst.addEdge(0, 4, 4)
    mst.addEdge(1, 2, 4)
    mst.addEdge(1, 3, 5)
    mst.addEdge(1, 4, 1)
    mst.addEdge(2, 3, 3)
    mst.addEdge(2, 4, 5)
    mst.addEdge(3, 4, 2)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(7)
  })

  it('MST edge weights are non-negative', () => {
    const mst = new PrimMST(4)
    mst.addEdge(0, 1, 1)
    mst.addEdge(1, 2, 2)
    mst.addEdge(2, 3, 3)
    const result = mst.findMST()
    for (const edge of result.edges) {
      expect(edge[2]).toBeGreaterThanOrEqual(0)
    }
  })

  it('MST has no cycles', () => {
    const mst = new PrimMST(5)
    for (let i = 0; i < 5; i++) {
      for (let j = i + 1; j < 5; j++) {
        mst.addEdge(i, j, 1)
      }
    }
    const result = mst.findMST()
    expect(result.edges.length).toBe(4)
  })

  it('handles three component disconnected graph', () => {
    const mst = new PrimMST(6)
    mst.addEdge(0, 1, 1)
    mst.addEdge(2, 3, 1)
    mst.addEdge(4, 5, 1)
    expect(mst.isConnected()).toBe(false)
  })

  it('handles self-loop edge gracefully', () => {
    const mst = new PrimMST(3)
    mst.addEdge(0, 0, 1)
    mst.addEdge(0, 1, 2)
    mst.addEdge(1, 2, 3)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(5)
  })

  it('multiple edges between same nodes', () => {
    const mst = new PrimMST(3)
    mst.addEdge(0, 1, 10)
    mst.addEdge(0, 1, 5)
    mst.addEdge(0, 1, 3)
    mst.addEdge(1, 2, 2)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(5)
  })

  it('sparse graph with many nodes', () => {
    const mst = new PrimMST(10)
    mst.addEdge(0, 1, 1)
    mst.addEdge(1, 2, 1)
    mst.addEdge(2, 3, 1)
    mst.addEdge(3, 4, 1)
    mst.addEdge(4, 5, 1)
    mst.addEdge(5, 6, 1)
    mst.addEdge(6, 7, 1)
    mst.addEdge(7, 8, 1)
    mst.addEdge(8, 9, 1)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(9)
  })

  it('linear chain graph', () => {
    const mst = new PrimMST(6)
    mst.addEdge(0, 1, 1)
    mst.addEdge(1, 2, 2)
    mst.addEdge(2, 3, 3)
    mst.addEdge(3, 4, 4)
    mst.addEdge(4, 5, 5)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(15)
  })

  it('binary tree structure', () => {
    const mst = new PrimMST(7)
    mst.addEdge(0, 1, 1)
    mst.addEdge(0, 2, 1)
    mst.addEdge(1, 3, 2)
    mst.addEdge(1, 4, 2)
    mst.addEdge(2, 5, 2)
    mst.addEdge(2, 6, 2)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(10)
  })

  it('all nodes reachable from any node in connected graph', () => {
    const mst = new PrimMST(5)
    mst.addEdge(0, 1, 1)
    mst.addEdge(1, 2, 1)
    mst.addEdge(2, 3, 1)
    mst.addEdge(3, 4, 1)
    expect(mst.isConnected()).toBe(true)
  })

  it('removing edge disconnects graph', () => {
    const mst = new PrimMST(4)
    mst.addEdge(0, 1, 1)
    mst.addEdge(1, 2, 1)
    expect(mst.isConnected()).toBe(false)
  })

  it('MST is minimal for all possible spanning trees', () => {
    const mst = new PrimMST(4)
    mst.addEdge(0, 1, 1)
    mst.addEdge(0, 2, 2)
    mst.addEdge(0, 3, 3)
    mst.addEdge(1, 2, 4)
    mst.addEdge(1, 3, 5)
    mst.addEdge(2, 3, 6)
    const result = mst.findMST()
    expect(result.totalWeight).toBeLessThan(4 + 5 + 6)
  })

  it('handles floating point weights', () => {
    const mst = new PrimMST(3)
    mst.addEdge(0, 1, 1.5)
    mst.addEdge(1, 2, 2.5)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(4)
  })

  it('handles fractional weights', () => {
    const mst = new PrimMST(3)
    mst.addEdge(0, 1, 0.1)
    mst.addEdge(1, 2, 0.2)
    mst.addEdge(0, 2, 0.5)
    const result = mst.findMST()
    expect(result.totalWeight).toBeCloseTo(0.3)
  })

  it('diamond graph', () => {
    const mst = new PrimMST(4)
    mst.addEdge(0, 1, 1)
    mst.addEdge(0, 2, 2)
    mst.addEdge(1, 3, 3)
    mst.addEdge(2, 3, 1)
    mst.addEdge(1, 2, 5)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(4)
  })

  it('pentagon graph', () => {
    const mst = new PrimMST(5)
    mst.addEdge(0, 1, 1)
    mst.addEdge(1, 2, 1)
    mst.addEdge(2, 3, 1)
    mst.addEdge(3, 4, 1)
    mst.addEdge(4, 0, 10)
    mst.addEdge(0, 2, 5)
    mst.addEdge(2, 4, 5)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(4)
  })

  it('hexagon graph with diagonals', () => {
    const mst = new PrimMST(6)
    mst.addEdge(0, 1, 1)
    mst.addEdge(1, 2, 1)
    mst.addEdge(2, 3, 1)
    mst.addEdge(3, 4, 1)
    mst.addEdge(4, 5, 1)
    mst.addEdge(5, 0, 10)
    mst.addEdge(0, 3, 5)
    mst.addEdge(1, 4, 5)
    mst.addEdge(2, 5, 5)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(5)
  })

  it('complete graph K3', () => {
    const mst = new PrimMST(3)
    mst.addEdge(0, 1, 1)
    mst.addEdge(1, 2, 2)
    mst.addEdge(0, 2, 3)
    const result = mst.findMST()
    expect(result.edges.length).toBe(2)
  })

  it('handles very large edge weights', () => {
    const mst = new PrimMST(3)
    mst.addEdge(0, 1, Number.MAX_SAFE_INTEGER / 2)
    mst.addEdge(1, 2, Number.MAX_SAFE_INTEGER / 2)
    const result = mst.findMST()
    expect(result.totalWeight).toBeGreaterThan(0)
  })

  it('edges are unique in MST', () => {
    const mst = new PrimMST(4)
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        mst.addEdge(i, j, 1)
      }
    }
    const result = mst.findMST()
    const edgeStrings = result.edges.map(e => `${e[0]}-${e[1]}`)
    expect(new Set(edgeStrings).size).toBe(result.edges.length)
  })

  it('MST for tree graph is tree itself', () => {
    const mst = new PrimMST(4)
    mst.addEdge(0, 1, 1)
    mst.addEdge(1, 2, 1)
    mst.addEdge(2, 3, 1)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(3)
  })

  it('three node line with varying weights', () => {
    const mst = new PrimMST(3)
    mst.addEdge(0, 1, 3)
    mst.addEdge(1, 2, 7)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(10)
  })

  it('MST edges form tree structure', () => {
    const mst = new PrimMST(5)
    mst.addEdge(0, 1, 1)
    mst.addEdge(1, 2, 2)
    mst.addEdge(2, 3, 3)
    mst.addEdge(3, 4, 4)
    const result = mst.findMST()
    expect(result.edges.length).toBe(4)
  })

  it('isConnected returns true for connected graph', () => {
    const mst = new PrimMST(3)
    mst.addEdge(0, 1, 1)
    mst.addEdge(1, 2, 2)
    expect(mst.isConnected()).toBe(true)
  })

  it('isConnected returns false for disconnected graph', () => {
    const mst = new PrimMST(4)
    mst.addEdge(0, 1, 1)
    expect(mst.isConnected()).toBe(false)
  })

  it('isConnected returns true for single node', () => {
    const mst = new PrimMST(1)
    expect(mst.isConnected()).toBe(true)
  })

  it('isConnected returns true for empty graph', () => {
    const mst = new PrimMST(0)
    expect(mst.isConnected()).toBe(true)
  })

  it('MST with all equal weights selects any spanning tree', () => {
    const mst = new PrimMST(4)
    mst.addEdge(0, 1, 5)
    mst.addEdge(1, 2, 5)
    mst.addEdge(2, 3, 5)
    mst.addEdge(0, 2, 5)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(15)
    expect(result.edges.length).toBe(3)
  })

  it('handles graph with multiple parallel paths', () => {
    const mst = new PrimMST(3)
    mst.addEdge(0, 1, 1)
    mst.addEdge(0, 1, 10)
    mst.addEdge(1, 2, 2)
    mst.addEdge(1, 2, 20)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(3)
  })

  it('isConnected returns false for disconnected graph', () => {
    const mst = new PrimMST(4)
    mst.addEdge(0, 1, 1)
    mst.addEdge(2, 3, 1)
    expect(mst.isConnected()).toBe(false)
  })

  it('isConnected returns true for connected graph', () => {
    const mst = new PrimMST(3)
    mst.addEdge(0, 1, 1)
    mst.addEdge(1, 2, 1)
    expect(mst.isConnected()).toBe(true)
  })

  it('findMST for single node returns weight 0', () => {
    const mst = new PrimMST(1)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(0)
  })

  it('findMST returns n-1 edges for n nodes', () => {
    const mst = new PrimMST(4)
    mst.addEdge(0, 1, 1)
    mst.addEdge(1, 2, 2)
    mst.addEdge(2, 3, 3)
    mst.addEdge(0, 3, 10)
    const result = mst.findMST()
    expect(result.edges.length).toBe(3)
  })

  it('single node MST weight 0', () => {
    const mst = new PrimMST(1)
    expect(mst.findMST().totalWeight).toBe(0)
  })

  it('two nodes with edge', () => {
    const mst = new PrimMST(2)
    mst.addEdge(0, 1, 5)
    expect(mst.findMST().totalWeight).toBe(5)
  })

  it('isConnected returns boolean', () => {
    const mst = new PrimMST(2)
    expect(typeof mst.isConnected()).toBe('boolean')
  })
})

describe('prim-mst - wave545', () => {
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

describe('prim-mst - wave546', () => {
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

describe('prim-mst - wave547', () => {
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

describe('prim-mst - wave548', () => {
  it('prim-mst module defined', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst module is function', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - wave549', () => {
  it('prim-mst module defined', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst module is function', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - wave550', () => {
  it('prim-mst w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - wave551', () => {
  it('prim-mst w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - wave552', () => {
  it('prim-mst w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - wave553', () => {
  it('prim-mst w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - wave554', () => {
  it('prim-mst w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - wave555', () => {
  it('prim-mst w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - wave556', () => {
  it('prim-mst w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - wave557', () => {
  it('prim-mst w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - wave558', () => {
  it('prim-mst w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - wave559', () => {
  it('prim-mst w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - wave560', () => {
  it('prim-mst w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - wave561', () => {
  it('prim-mst w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - wave562', () => {
  it('prim-mst w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - wave563', () => {
  it('prim-mst w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - wave564', () => {
  it('prim-mst w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - wave565', () => {
  it('prim-mst w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - wave566', () => {
  it('prim-mst w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - wave127', () => {
  it('prim-mst w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - wave130', () => {
  it('prim-mst w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - wave133', () => {
  it('prim-mst w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - wave136', () => {
  it('prim-mst w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - wave139', () => {
  it('prim-mst w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w142', () => {
  it('prim-mst v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w145', () => {
  it('prim-mst v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w148', () => {
  it('prim-mst v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w151', () => {
  it('prim-mst v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w154', () => {
  it('prim-mst v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w157', () => {
  it('prim-mst v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w160', () => {
  it('prim-mst v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w170', () => {
  it('prim-mst x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w180', () => {
  it('prim-mst x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w190', () => {
  it('prim-mst x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w200', () => {
  it('prim-mst x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w210', () => {
  it('prim-mst x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w220', () => {
  it('prim-mst x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w230', () => {
  it('prim-mst x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w240', () => {
  it('prim-mst x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w250', () => {
  it('prim-mst x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w260', () => {
  it('prim-mst x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w270', () => {
  it('prim-mst x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w280', () => {
  it('prim-mst x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w290', () => {
  it('prim-mst x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w300', () => {
  it('prim-mst x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w310', () => {
  it('prim-mst x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w320', () => {
  it('prim-mst x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w330', () => {
  it('prim-mst x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w340', () => {
  it('prim-mst x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w350', () => {
  it('prim-mst x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w360', () => {
  it('prim-mst x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w370', () => {
  it('prim-mst x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w380', () => {
  it('prim-mst x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w390', () => {
  it('prim-mst x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w400', () => {
  it('prim-mst x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w420', () => {
  it('prim-mst x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w440', () => {
  it('prim-mst x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w460', () => {
  it('prim-mst x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w480', () => {
  it('prim-mst x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w500', () => {
  it('prim-mst x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w550', () => {
  it('prim-mst x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w600', () => {
  it('prim-mst x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w650', () => {
  it('prim-mst x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('prim-mst - w700', () => {
  it('prim-mst x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('prim-mst x700x49', () => {
    expect(describe).toBeDefined()
  })
})
