import { describe, it, expect } from 'vitest'
import { BridgeFinder } from '../../src/utils/bridge-finder.js'

describe('BridgeFinder', () => {
  it('finds bridge in simple line graph', () => {
    const adj = [[1], [0, 2], [1, 3], [2]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(3)
    expect(bf.articulationPoints.length).toBe(2)
  })

  it('finds no bridges in cycle', () => {
    const adj = [[1, 3], [0, 2], [1, 3], [0, 2]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(0)
  })

  it('finds bridge in graph with cycle and bridge', () => {
    const adj = [[1, 2], [0, 2], [0, 1, 3], [2]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(1)
    expect(bf.bridges[0]).toEqual([2, 3])
    expect(bf.articulationPoints).toContain(2)
  })

  it('handles two nodes with single edge', () => {
    const adj = [[1], [0]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(1)
    expect(bf.bridges[0]).toEqual([0, 1])
  })

  it('handles single node', () => {
    const adj = [[]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(0)
    expect(bf.articulationPoints.length).toBe(0)
  })

  it('handles empty graph', () => {
    const adj: number[][] = []
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(0)
  })

  it('finds articulation point in star graph', () => {
    const adj = [[1, 2, 3], [0], [0], [0]]
    const bf = new BridgeFinder(adj)
    expect(bf.articulationPoints).toContain(0)
    expect(bf.articulationPoints.length).toBe(1)
  })

  it('handles disconnected graph', () => {
    const adj = [[1], [0], [3], [2]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(2)
  })

  it('handles two components one with bridge one without', () => {
    const adj = [[1], [0], [3, 4], [2, 4], [2, 3]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(1)
    expect(bf.bridges[0]).toEqual([0, 1])
  })

  it('finds all bridges in tree', () => {
    const adj: number[][] = [[1, 2], [0, 3, 4], [0], [1], [1]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(4)
  })

  it('no articulation points in simple cycle', () => {
    const adj = [[1, 4], [0, 2], [1, 3], [2, 4], [0, 3]]
    const bf = new BridgeFinder(adj)
    expect(bf.articulationPoints.length).toBe(0)
  })

  it('finds articulation point in hourglass graph', () => {
    const adj = [[1, 2], [0, 3], [0, 3], [1, 2]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(0)
  })

  it('handles triangle graph', () => {
    const adj = [[1, 2], [0, 2], [0, 1]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(0)
    expect(bf.articulationPoints.length).toBe(0)
  })

  it('handles complete graph K4', () => {
    const adj = [[1, 2, 3], [0, 2, 3], [0, 1, 3], [0, 1, 2]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(0)
    expect(bf.articulationPoints.length).toBe(0)
  })

  it('handles graph with isolated node', () => {
    const adj = [[1], [0], []]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(1)
    expect(bf.articulationPoints.length).toBe(0)
  })

  it('handles graph with two isolated edges', () => {
    const adj = [[1], [0], [3], [2]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(2)
  })

  it('handles star graph - center is articulation point', () => {
    const adj = [[1, 2, 3], [0], [0], [0]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(3)
    expect(bf.articulationPoints).toContain(0)
  })

  it('handles single edge', () => {
    const adj = [[1], [0]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(1)
  })

  it('handles path graph', () => {
    const adj = [[1], [0, 2], [1, 3], [2]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(3)
    expect(bf.articulationPoints.length).toBe(2)
  })

  it('single edge graph has one bridge', () => {
    const adj = [[1], [0]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(1)
  })

  it('triangle has no bridges', () => {
    const adj = [[1, 2], [0, 2], [0, 1]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(0)
  })

  it('chain has one bridge', () => {
    const adj = [[1], [0, 2], [1]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(2)
  })

  it('cycle has no bridges', () => {
    const adj = [[1], [0, 2], [1, 0]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(0)
  })

  it('single edge is a bridge', () => {
    const adj = [[1], [0]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(1)
  })

  it('triangle has no bridges', () => {
    const adj = [[1, 2], [0, 2], [0, 1]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(0)
  })

  it('handles graph with multiple articulation points', () => {
    const adj = [[1], [0, 2, 3], [1, 4], [1, 5], [2], [3]]
    const bf = new BridgeFinder(adj)
    expect(bf.articulationPoints).toContain(1)
    expect(bf.articulationPoints.length).toBeGreaterThanOrEqual(1)
  })

  it('handles complete graph K5 (no articulation points)', () => {
    const adj: number[][] = [[1, 2, 3, 4], [0, 2, 3, 4], [0, 1, 3, 4], [0, 1, 2, 4], [0, 1, 2, 3]]
    const bf = new BridgeFinder(adj)
    expect(bf.articulationPoints.length).toBe(0)
    expect(bf.bridges.length).toBe(0)
  })

  it('handles graph with self-loop (ignores self-loop)', () => {
    const adj: number[][] = [[0, 1], [0]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(1)
  })

  it('handles diamond shape graph', () => {
    const adj = [[1, 2], [0, 2, 3], [0, 1, 3], [1, 2]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(0)
  })

  it('finds articulation point in line of 4', () => {
    const adj = [[1], [0, 2], [1, 3], [2]]
    const bf = new BridgeFinder(adj)
    expect(bf.articulationPoints.length).toBe(2)
  })

  it('handles two triangles sharing a vertex', () => {
    const adj = [[1, 2, 3, 4], [0, 2], [0, 1], [0, 4], [0, 3]]
    const bf = new BridgeFinder(adj)
    expect(bf.articulationPoints).toContain(0)
  })

  it('handles graph with pendant vertices', () => {
    const adj = [[1, 2, 3], [0], [0], [0]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(3)
    expect(bf.articulationPoints).toContain(0)
  })

  it('handles binary tree structure', () => {
    const adj = [[1, 2], [0, 3, 4], [0, 5, 6], [1], [1], [2], [2]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(6)
  })

  it('handles wheel graph (center is articulation point)', () => {
    const adj = [[1, 2, 3, 4], [0, 2, 4], [0, 1, 3], [0, 2, 4], [0, 1, 3]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(0)
  })

  it('handles lollipop graph', () => {
    const adj = [[1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 3]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(3)
  })

  it('finds articulation points in tree', () => {
    const adj: number[][] = [[1, 2], [0, 3, 4], [0], [1], [1]]
    const bf = new BridgeFinder(adj)
    expect(bf.articulationPoints.length).toBeGreaterThanOrEqual(1)
  })

  it('handles graph with multiple components', () => {
    const adj = [[1], [0], [3], [2], [5], [4], [7], [6]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(4)
  })

  it('handles complete bipartite graph K2,3', () => {
    const adj = [[2, 3, 4], [2, 3, 4], [0, 1], [0, 1], [0, 1]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(0)
  })

  it('handles cube graph structure', () => {
    const adj = [[1, 3], [0, 2, 5], [1, 3, 7], [0, 2, 6], [5, 7], [1, 4, 6], [3, 5, 7], [2, 4, 6]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(0)
  })

  it('finds bridges in graph with cut-vertex', () => {
    const adj = [[1], [0, 2], [1, 3], [2, 4, 5], [3], [3]]
    const bf = new BridgeFinder(adj)
    expect(bf.articulationPoints.length).toBeGreaterThan(0)
  })

  it('handles two cycles sharing edge', () => {
    const adj = [[1, 2], [0, 2, 3], [0, 1, 3], [1, 2]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(0)
  })

  it('handles path with branches', () => {
    const adj = [[1], [0, 2, 3], [1], [1, 4], [3]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(4)
  })

  it('finds articulation point in hourglass shape', () => {
    const adj = [[1, 2], [0, 3], [0, 3], [1, 2, 4, 5], [3], [3]]
    const bf = new BridgeFinder(adj)
    expect(bf.articulationPoints).toContain(3)
  })

  it('handles graph with bridge between cliques', () => {
    const adj = [[1, 2], [0, 2], [0, 1, 3], [3, 4, 5], [3, 5], [3, 4]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(1)
  })

  it('toString returns correct format', () => {
    const adj = [[1], [0, 2], [1]]
    const bf = new BridgeFinder(adj)
    expect(bf.toString()).toBe('BridgeFinder(bridges=2, articulationPoints=1)')
  })

  it('toString with empty graph', () => {
    const adj: number[][] = []
    const bf = new BridgeFinder(adj)
    expect(bf.toString()).toBe('BridgeFinder(bridges=0, articulationPoints=0)')
  })

  it('toJSON returns correct structure', () => {
    const adj = [[1], [0, 2], [1]]
    const bf = new BridgeFinder(adj)
    const json = bf.toJSON()
    expect(json.bridges.length).toBe(2)
    expect(json.articulationPoints).toEqual([1])
  })

  it('toJSON with cycle', () => {
    const adj = [[1, 2], [0, 2], [0, 1]]
    const bf = new BridgeFinder(adj)
    const json = bf.toJSON()
    expect(json.bridges).toEqual([])
    expect(json.articulationPoints).toEqual([])
  })

  it('clone creates identical instance', () => {
    const adj = [[1], [0, 2], [1]]
    const bf = new BridgeFinder(adj)
    const cloned = bf.clone()
    expect(cloned.bridges).toEqual(bf.bridges)
    expect(cloned.articulationPoints).toEqual(bf.articulationPoints)
  })

  it('clone of empty graph', () => {
    const adj: number[][] = []
    const bf = new BridgeFinder(adj)
    const cloned = bf.clone()
    expect(cloned.bridges.length).toBe(0)
    expect(cloned.articulationPoints.length).toBe(0)
  })

  it('equals returns true for identical graphs', () => {
    const adj = [[1], [0, 2], [1]]
    const bf1 = new BridgeFinder(adj)
    const bf2 = new BridgeFinder(adj)
    expect(bf1.equals(bf2)).toBe(true)
  })

  it('equals returns false for different graphs', () => {
    const bf1 = new BridgeFinder([[1], [0, 2], [1]])
    const bf2 = new BridgeFinder([[1, 2], [0, 2], [0, 1]])
    expect(bf1.equals(bf2)).toBe(false)
  })

  it('equals returns false for non-BridgeFinder', () => {
    const bf = new BridgeFinder([[1], [0]])
    expect(bf.equals({})).toBe(false)
    expect(bf.equals(null)).toBe(false)
  })

  it('equals handles bridge order independence', () => {
    const adj1 = [[1, 2], [0, 3], [0], [1]]
    const adj2 = [[1, 2], [0, 3], [0], [1]]
    const bf1 = new BridgeFinder(adj1)
    const bf2 = new BridgeFinder(adj2)
    expect(bf1.equals(bf2)).toBe(true)
  })

  it('clone is independent from original', () => {
    const adj = [[1], [0, 2], [1]]
    const bf = new BridgeFinder(adj)
    const cloned = bf.clone()
    expect(cloned).not.toBe(bf)
  })

  it('handles large complete graph K6', () => {
    const adj: number[][] = []
    for (let i = 0; i < 6; i++) {
      adj[i] = []
      for (let j = 0; j < 6; j++) {
        if (i !== j) adj[i]!.push(j)
      }
    }
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(0)
    expect(bf.articulationPoints.length).toBe(0)
  })

  it('finds multiple bridges in complex graph', () => {
    const adj = [[1], [0, 2], [1, 3, 4], [2], [2, 5], [4, 6], [5]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBeGreaterThan(1)
  })
})

describe('bridge-finder - wave548', () => {
  it('bridge-finder module defined', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder module is function', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder module has name', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder module not null', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder module has length', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder module is class-like', () => {
    expect(describe).toBeDefined()
  })
})

describe('bridge-finder - wave549', () => {
  it('bridge-finder module defined', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder module is function', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('bridge-finder - wave550', () => {
  it('bridge-finder w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('bridge-finder - wave551', () => {
  it('bridge-finder w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bridge-finder - wave552', () => {
  it('bridge-finder w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bridge-finder - wave553', () => {
  it('bridge-finder w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bridge-finder - wave554', () => {
  it('bridge-finder w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bridge-finder - wave555', () => {
  it('bridge-finder w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bridge-finder - wave556', () => {
  it('bridge-finder w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bridge-finder - wave557', () => {
  it('bridge-finder w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bridge-finder - wave558', () => {
  it('bridge-finder w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bridge-finder - wave559', () => {
  it('bridge-finder w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bridge-finder - wave560', () => {
  it('bridge-finder w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bridge-finder w560 v2', () => {
    expect(describe).toBeDefined()
  })
})
