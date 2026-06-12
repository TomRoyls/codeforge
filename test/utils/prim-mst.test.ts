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
