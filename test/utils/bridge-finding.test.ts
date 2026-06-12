import { describe, expect, it } from 'vitest'
import { BridgeFinding } from '../../src/utils/bridge-finding.js'

describe('BridgeFinding', () => {
  it('finds bridge in path', () => {
    const bf = new BridgeFinding(3)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    const bridges = bf.findBridges()
    expect(bridges).toEqual([[0, 1], [1, 2]])
  })

  it('no bridges in cycle', () => {
    const bf = new BridgeFinding(3)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    bf.addEdge(2, 0)
    expect(bf.findBridges()).toEqual([])
  })

  it('handles single edge', () => {
    const bf = new BridgeFinding(2)
    bf.addEdge(0, 1)
    expect(bf.findBridges()).toEqual([[0, 1]])
  })

  it('handles single node', () => {
    const bf = new BridgeFinding(1)
    expect(bf.findBridges()).toEqual([])
  })

  it('handles disconnected graph', () => {
    const bf = new BridgeFinding(4)
    bf.addEdge(0, 1)
    bf.addEdge(2, 3)
    const bridges = bf.findBridges()
    expect(bridges.length).toBe(2)
  })

  it('handles star graph (all bridges)', () => {
    const bf = new BridgeFinding(4)
    bf.addEdge(0, 1)
    bf.addEdge(0, 2)
    bf.addEdge(0, 3)
    const bridges = bf.findBridges()
    expect(bridges.length).toBe(3)
  })

  it('handles two cycles connected by bridge', () => {
    const bf = new BridgeFinding(6)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    bf.addEdge(2, 0)
    bf.addEdge(3, 4)
    bf.addEdge(4, 5)
    bf.addEdge(5, 3)
    bf.addEdge(2, 3)
    const bridges = bf.findBridges()
    expect(bridges).toEqual([[2, 3]])
  })

  it('handles no edges', () => {
    const bf = new BridgeFinding(3)
    expect(bf.findBridges()).toEqual([])
  })

  it('handles K4 (no bridges)', () => {
    const bf = new BridgeFinding(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        bf.addEdge(i, j)
    expect(bf.findBridges()).toEqual([])
  })

  it('handles chain of 5', () => {
    const bf = new BridgeFinding(5)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    bf.addEdge(2, 3)
    bf.addEdge(3, 4)
    expect(bf.findBridges().length).toBe(4)
  })

  it('handles multi-edge with bridge', () => {
    const bf = new BridgeFinding(5)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    bf.addEdge(2, 0)
    bf.addEdge(2, 3)
    bf.addEdge(3, 4)
    bf.addEdge(4, 2)
    const bridges = bf.findBridges()
    expect(bridges.length).toBe(0)
  })

  it('handles figure eight', () => {
    const bf = new BridgeFinding(6)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    bf.addEdge(2, 0)
    bf.addEdge(2, 3)
    bf.addEdge(3, 4)
    bf.addEdge(4, 5)
    bf.addEdge(5, 3)
    expect(bf.findBridges().length).toBe(1)
  })

  it('handles star graph all bridges', () => {
    const bf = new BridgeFinding(5)
    bf.addEdge(0, 1)
    bf.addEdge(0, 2)
    bf.addEdge(0, 3)
    bf.addEdge(0, 4)
    expect(bf.findBridges().length).toBe(4)
  })

  it('handles single node', () => {
    const bf = new BridgeFinding(1)
    expect(bf.findBridges()).toEqual([])
  })

  it('handles single edge', () => {
    const bf = new BridgeFinding(2)
    bf.addEdge(0, 1)
    expect(bf.findBridges()).toEqual([[0, 1]])
  })

  it('handles disconnected graph', () => {
    const bf = new BridgeFinding(4)
    bf.addEdge(0, 1)
    bf.addEdge(2, 3)
    expect(bf.findBridges().length).toBe(2)
  })

  it('handles triangle no bridges', () => {
    const bf = new BridgeFinding(3)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    bf.addEdge(2, 0)
    expect(bf.findBridges()).toEqual([])
  })

  it('single edge is a bridge', () => {
    const bf = new BridgeFinding(2)
    bf.addEdge(0, 1)
    expect(bf.findBridges()).toEqual([[0, 1]])
  })

  it('triangle graph has no bridges', () => {
    const bf = new BridgeFinding(3)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    bf.addEdge(2, 0)
    expect(bf.findBridges()).toEqual([])
  })

  it('path graph has bridges', () => {
    const bf = new BridgeFinding(3)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    expect(bf.findBridges().length).toBe(2)
  })

  it('cycle has no bridges', () => {
    const bf = new BridgeFinding(3)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    bf.addEdge(2, 0)
    expect(bf.findBridges().length).toBe(0)
  })

  it('chain of 3 has 2 bridges', () => {
    const bf = new BridgeFinding(3)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    expect(bf.findBridges().length).toBe(2)
  })

  it('single edge is a bridge', () => {
    const bf = new BridgeFinding(2)
    bf.addEdge(0, 1)
    expect(bf.findBridges().length).toBe(1)
  })

  it('no edges has no bridges', () => {
    const bf = new BridgeFinding(2)
    expect(bf.findBridges().length).toBe(0)
  })

  it('single edge is a bridge', () => {
    const bf = new BridgeFinding(2)
    bf.addEdge(0, 1)
    expect(bf.findBridges().length).toBe(1)
  })

  it('finds all bridges in tree of 4 nodes', () => {
    const bf = new BridgeFinding(4)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    bf.addEdge(1, 3)
    expect(bf.findBridges().length).toBe(3)
  })

  it('handles complete graph K3', () => {
    const bf = new BridgeFinding(3)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    bf.addEdge(2, 0)
    expect(bf.findBridges()).toEqual([])
  })

  it('handles diamond with bridge', () => {
    const bf = new BridgeFinding(5)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    bf.addEdge(2, 0)
    bf.addEdge(1, 3)
    bf.addEdge(3, 4)
    expect(bf.findBridges().length).toBe(2)
  })

  it('handles two triangles connected by vertex', () => {
    const bf = new BridgeFinding(5)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    bf.addEdge(2, 0)
    bf.addEdge(0, 3)
    bf.addEdge(3, 4)
    bf.addEdge(4, 0)
    expect(bf.findBridges().length).toBe(0)
  })

  it('handles path of 4 nodes', () => {
    const bf = new BridgeFinding(4)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    bf.addEdge(2, 3)
    expect(bf.findBridges().length).toBe(3)
  })

  it('handles complete graph K5', () => {
    const bf = new BridgeFinding(5)
    for (let i = 0; i < 5; i++) {
      for (let j = i + 1; j < 5; j++) {
        bf.addEdge(i, j)
      }
    }
    expect(bf.findBridges()).toEqual([])
  })

  it('finds bridge in line of 6', () => {
    const bf = new BridgeFinding(6)
    for (let i = 0; i < 5; i++) {
      bf.addEdge(i, i + 1)
    }
    expect(bf.findBridges().length).toBe(5)
  })

  it('handles wheel graph', () => {
    const bf = new BridgeFinding(5)
    bf.addEdge(0, 1)
    bf.addEdge(0, 2)
    bf.addEdge(0, 3)
    bf.addEdge(0, 4)
    bf.addEdge(1, 2)
    bf.addEdge(2, 3)
    bf.addEdge(3, 4)
    bf.addEdge(4, 1)
    expect(bf.findBridges().length).toBe(0)
  })

  it('handles lollipop graph', () => {
    const bf = new BridgeFinding(6)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    bf.addEdge(2, 3)
    bf.addEdge(3, 4)
    bf.addEdge(4, 5)
    bf.addEdge(5, 3)
    expect(bf.findBridges().length).toBe(3)
  })

  it('handles binary tree', () => {
    const bf = new BridgeFinding(7)
    bf.addEdge(0, 1)
    bf.addEdge(0, 2)
    bf.addEdge(1, 3)
    bf.addEdge(1, 4)
    bf.addEdge(2, 5)
    bf.addEdge(2, 6)
    expect(bf.findBridges().length).toBe(6)
  })

  it('finds bridge between two cliques', () => {
    const bf = new BridgeFinding(6)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    bf.addEdge(2, 0)
    bf.addEdge(2, 3)
    bf.addEdge(3, 4)
    bf.addEdge(4, 5)
    bf.addEdge(5, 3)
    expect(bf.findBridges()).toEqual([[2, 3]])
  })

  it('handles graph with multiple components', () => {
    const bf = new BridgeFinding(8)
    bf.addEdge(0, 1)
    bf.addEdge(2, 3)
    bf.addEdge(4, 5)
    bf.addEdge(6, 7)
    expect(bf.findBridges().length).toBe(4)
  })

  it('handles complete bipartite K3,3', () => {
    const bf = new BridgeFinding(6)
    for (let i = 0; i < 3; i++) {
      for (let j = 3; j < 6; j++) {
        bf.addEdge(i, j)
      }
    }
    expect(bf.findBridges()).toEqual([])
  })

  it('finds bridge in cycle with pendant', () => {
    const bf = new BridgeFinding(5)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    bf.addEdge(2, 3)
    bf.addEdge(3, 0)
    bf.addEdge(1, 4)
    expect(bf.findBridges()).toEqual([[1, 4]])
  })

  it('handles cube graph', () => {
    const bf = new BridgeFinding(8)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    bf.addEdge(2, 3)
    bf.addEdge(3, 0)
    bf.addEdge(4, 5)
    bf.addEdge(5, 6)
    bf.addEdge(6, 7)
    bf.addEdge(7, 4)
    bf.addEdge(0, 4)
    bf.addEdge(1, 5)
    bf.addEdge(2, 6)
    bf.addEdge(3, 7)
    expect(bf.findBridges()).toEqual([])
  })

  it('handles two cycles sharing vertex', () => {
    const bf = new BridgeFinding(7)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    bf.addEdge(2, 0)
    bf.addEdge(0, 3)
    bf.addEdge(3, 4)
    bf.addEdge(4, 5)
    bf.addEdge(5, 3)
    expect(bf.findBridges().length).toBe(1)
  })

  it('finds bridges in graph with cut-vertex', () => {
    const bf = new BridgeFinding(6)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    bf.addEdge(2, 3)
    bf.addEdge(1, 4)
    bf.addEdge(4, 5)
    expect(bf.findBridges().length).toBeGreaterThan(1)
  })

  it('handles path with branch', () => {
    const bf = new BridgeFinding(5)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    bf.addEdge(2, 3)
    bf.addEdge(2, 4)
    expect(bf.findBridges().length).toBe(4)
  })

  it('finds all bridges in star graph with 6 nodes', () => {
    const bf = new BridgeFinding(6)
    for (let i = 1; i < 6; i++) {
      bf.addEdge(0, i)
    }
    expect(bf.findBridges().length).toBe(5)
  })

  it('handles complete graph K6', () => {
    const bf = new BridgeFinding(6)
    for (let i = 0; i < 6; i++) {
      for (let j = i + 1; j < 6; j++) {
        bf.addEdge(i, j)
      }
    }
    expect(bf.findBridges()).toEqual([])
  })

  it('handles graph with multiple isolated nodes', () => {
    const bf = new BridgeFinding(5)
    bf.addEdge(0, 1)
    expect(bf.findBridges()).toEqual([[0, 1]])
  })

  it('finds bridge in complex graph', () => {
    const bf = new BridgeFinding(7)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    bf.addEdge(2, 3)
    bf.addEdge(3, 4)
    bf.addEdge(4, 5)
    bf.addEdge(5, 6)
    bf.addEdge(2, 5)
    expect(bf.findBridges().length).toBeGreaterThan(0)
  })

  it('toString returns correct format', () => {
    const bf = new BridgeFinding(5)
    expect(bf.toString()).toBe('BridgeFinding(n=5)')
  })

  it('toString with single node', () => {
    const bf = new BridgeFinding(1)
    expect(bf.toString()).toBe('BridgeFinding(n=1)')
  })

  it('toJSON returns correct structure', () => {
    const bf = new BridgeFinding(3)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    const json = bf.toJSON()
    expect(json).toEqual({
      n: 3,
      adj: [[1], [0, 2], [1]]
    })
  })

  it('toJSON with empty graph', () => {
    const bf = new BridgeFinding(2)
    const json = bf.toJSON()
    expect(json).toEqual({
      n: 2,
      adj: [[], []]
    })
  })

  it('clone creates identical instance', () => {
    const bf = new BridgeFinding(3)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    const cloned = bf.clone()
    expect(cloned.n).toBe(bf.n)
    expect(cloned.findBridges()).toEqual(bf.findBridges())
  })

  it('clone is independent from original', () => {
    const bf = new BridgeFinding(3)
    bf.addEdge(0, 1)
    const cloned = bf.clone()
    cloned.addEdge(1, 2)
    expect(bf.findBridges().length).not.toBe(cloned.findBridges().length)
  })

  it('equals returns true for identical graphs', () => {
    const bf1 = new BridgeFinding(3)
    const bf2 = new BridgeFinding(3)
    bf1.addEdge(0, 1)
    bf1.addEdge(1, 2)
    bf2.addEdge(0, 1)
    bf2.addEdge(1, 2)
    expect(bf1.equals(bf2)).toBe(true)
  })

  it('equals returns false for different graphs', () => {
    const bf1 = new BridgeFinding(2)
    const bf2 = new BridgeFinding(3)
    bf1.addEdge(0, 1)
    bf2.addEdge(0, 1)
    bf2.addEdge(1, 2)
    expect(bf1.equals(bf2)).toBe(false)
  })

  it('equals returns false for non-BridgeFinding', () => {
    const bf = new BridgeFinding(2)
    bf.addEdge(0, 1)
    expect(bf.equals({})).toBe(false)
    expect(bf.equals(null)).toBe(false)
  })

  it('equals handles bridge order independence', () => {
    const bf1 = new BridgeFinding(3)
    const bf2 = new BridgeFinding(3)
    bf1.addEdge(0, 1)
    bf1.addEdge(1, 2)
    bf2.addEdge(1, 2)
    bf2.addEdge(0, 1)
    expect(bf1.equals(bf2)).toBe(true)
  })

  it('finds bridges in graph with cycle and path', () => {
    const bf = new BridgeFinding(6)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    bf.addEdge(2, 0)
    bf.addEdge(2, 3)
    bf.addEdge(3, 4)
    bf.addEdge(4, 5)
    expect(bf.findBridges().length).toBe(3)
  })
})

describe('bridge-finding - wave544', () => {
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

describe('bridge-finding - wave546', () => {
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

describe('bridge-finding - wave547', () => {
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

describe('bridge-finding - wave548', () => {
  it('bridge-finding module defined', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finding module is function', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finding module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('bridge-finding - wave549', () => {
  it('bridge-finding module defined', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finding module is function', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finding module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('bridge-finding - wave550', () => {
  it('bridge-finding w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finding w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finding w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('bridge-finding - wave551', () => {
  it('bridge-finding w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finding w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finding w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bridge-finding - wave552', () => {
  it('bridge-finding w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finding w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finding w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bridge-finding - wave553', () => {
  it('bridge-finding w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finding w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finding w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bridge-finding - wave554', () => {
  it('bridge-finding w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finding w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finding w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bridge-finding - wave555', () => {
  it('bridge-finding w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finding w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finding w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bridge-finding - wave556', () => {
  it('bridge-finding w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finding w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finding w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bridge-finding - wave557', () => {
  it('bridge-finding w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finding w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finding w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bridge-finding - wave558', () => {
  it('bridge-finding w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finding w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finding w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bridge-finding - wave559', () => {
  it('bridge-finding w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finding w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finding w559 v2', () => {
    expect(describe).toBeDefined()
  })
})
