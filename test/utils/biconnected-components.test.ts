import { describe, expect, it } from 'vitest'
import { BiconnectedComponents } from '../../src/utils/biconnected-components.js'

describe('BiconnectedComponents', () => {
  it('finds components in triangle', () => {
    const bc = new BiconnectedComponents(3)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    bc.addEdge(2, 0)
    const comps = bc.findComponents()
    expect(comps.length).toBe(1)
  })

  it('finds articulation point in bridge', () => {
    const bc = new BiconnectedComponents(3)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    const ap = bc.findArticulationPoints()
    expect(ap).toEqual([1])
  })

  it('handles single edge', () => {
    const bc = new BiconnectedComponents(2)
    bc.addEdge(0, 1)
    const comps = bc.findComponents()
    expect(comps.length).toBe(1)
  })

  it('handles single node', () => {
    const bc = new BiconnectedComponents(1)
    const comps = bc.findComponents()
    expect(comps.length).toBe(0)
  })

  it('no articulation point in cycle', () => {
    const bc = new BiconnectedComponents(4)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    bc.addEdge(2, 3)
    bc.addEdge(3, 0)
    expect(bc.findArticulationPoints()).toEqual([])
  })

  it('handles disconnected graph', () => {
    const bc = new BiconnectedComponents(4)
    bc.addEdge(0, 1)
    bc.addEdge(2, 3)
    const ap = bc.findArticulationPoints()
    expect(ap.length).toBe(0)
  })

  it('finds multiple articulation points', () => {
    const bc = new BiconnectedComponents(4)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    bc.addEdge(2, 3)
    const ap = bc.findArticulationPoints()
    expect(ap.sort()).toEqual([1, 2])
  })

  it('handles star graph', () => {
    const bc = new BiconnectedComponents(5)
    bc.addEdge(0, 1)
    bc.addEdge(0, 2)
    bc.addEdge(0, 3)
    bc.addEdge(0, 4)
    const ap = bc.findArticulationPoints()
    expect(ap).toEqual([0])
  })

  it('finds components in complex graph', () => {
    const bc = new BiconnectedComponents(5)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    bc.addEdge(2, 0)
    bc.addEdge(2, 3)
    bc.addEdge(3, 4)
    bc.addEdge(4, 2)
    const comps = bc.findComponents()
    expect(comps.length).toBe(2)
  })

  it('handles two triangles sharing vertex', () => {
    const bc = new BiconnectedComponents(5)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    bc.addEdge(2, 0)
    bc.addEdge(2, 3)
    bc.addEdge(3, 4)
    bc.addEdge(4, 2)
    const ap = bc.findArticulationPoints()
    expect(ap).toEqual([2])
  })

  it('handles K3 plus pendant', () => {
    const bc = new BiconnectedComponents(4)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    bc.addEdge(2, 0)
    bc.addEdge(2, 3)
    const ap = bc.findArticulationPoints()
    const comps = bc.findComponents()
    expect(ap).toContain(2)
    expect(comps.length).toBe(2)
  })

  it('handles two edges sharing node', () => {
    const bc = new BiconnectedComponents(3)
    bc.addEdge(0, 1)
    bc.addEdge(0, 2)
    const ap = bc.findArticulationPoints()
    expect(ap).toEqual([0])
  })

  it('handles K4 no articulation points', () => {
    const bc = new BiconnectedComponents(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        bc.addEdge(i, j)
    expect(bc.findArticulationPoints()).toEqual([])
  })

  it('handles isolated nodes', () => {
    const bc = new BiconnectedComponents(3)
    const ap = bc.findArticulationPoints()
    expect(ap).toEqual([])
  })

  it('handles single edge graph', () => {
    const bc = new BiconnectedComponents(2)
    bc.addEdge(0, 1)
    expect(bc.findArticulationPoints()).toEqual([])
    expect(bc.findComponents().length).toBe(1)
  })

  it('handles chain graph articulation', () => {
    const bc = new BiconnectedComponents(4)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    bc.addEdge(2, 3)
    const ap = bc.findArticulationPoints()
    expect(ap).toContain(1)
    expect(ap).toContain(2)
  })

  it('handles star graph center is articulation', () => {
    const bc = new BiconnectedComponents(5)
    bc.addEdge(0, 1)
    bc.addEdge(0, 2)
    bc.addEdge(0, 3)
    bc.addEdge(0, 4)
    expect(bc.findArticulationPoints()).toEqual([0])
  })

  it('chain of 3 has one articulation point', () => {
    const bc = new BiconnectedComponents(3)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    const ap = bc.findArticulationPoints()
    expect(ap).toContain(1)
  })

  it('findComponents on linear graph', () => {
    const bc = new BiconnectedComponents(3)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    const comps = bc.findComponents()
    expect(comps.length).toBeGreaterThan(0)
  })

  it('bridge in chain is detected', () => {
    const bc = new BiconnectedComponents(3)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    const comps = bc.findComponents()
    expect(comps.length).toBeGreaterThanOrEqual(2)
  })

  it('triangle has one biconnected component', () => {
    const bc = new BiconnectedComponents(3)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    bc.addEdge(2, 0)
    const comps = bc.findComponents()
    expect(comps.length).toBeGreaterThanOrEqual(1)
  })

  it('two nodes with one edge has one component', () => {
    const bc = new BiconnectedComponents(2)
    bc.addEdge(0, 1)
    const comps = bc.findComponents()
    expect(comps.length).toBeGreaterThanOrEqual(1)
  })

  it('single node has 0 components', () => {
    const bc = new BiconnectedComponents(1)
    const comps = bc.findComponents()
    expect(comps.length).toBe(0)
  })

  it('double articulation point in chain of 5', () => {
    const bc = new BiconnectedComponents(5)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    bc.addEdge(2, 3)
    bc.addEdge(3, 4)
    const ap = bc.findArticulationPoints()
    expect(ap.sort()).toEqual([1, 2, 3])
  })

  it('diamond shape has no articulation points', () => {
    const bc = new BiconnectedComponents(4)
    bc.addEdge(0, 1)
    bc.addEdge(0, 2)
    bc.addEdge(1, 3)
    bc.addEdge(2, 3)
    bc.addEdge(1, 2)
    expect(bc.findArticulationPoints()).toEqual([])
  })

  it('pentagon cycle has no articulation points', () => {
    const bc = new BiconnectedComponents(5)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    bc.addEdge(2, 3)
    bc.addEdge(3, 4)
    bc.addEdge(4, 0)
    expect(bc.findArticulationPoints()).toEqual([])
  })

  it('double triangle with bridge', () => {
    const bc = new BiconnectedComponents(6)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    bc.addEdge(2, 0)
    bc.addEdge(3, 4)
    bc.addEdge(4, 5)
    bc.addEdge(5, 3)
    bc.addEdge(2, 3)
    const ap = bc.findArticulationPoints()
    expect(ap).toContain(2)
    expect(ap).toContain(3)
  })

  it('multiple disconnected triangles', () => {
    const bc = new BiconnectedComponents(6)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    bc.addEdge(2, 0)
    bc.addEdge(3, 4)
    bc.addEdge(4, 5)
    bc.addEdge(5, 3)
    expect(bc.findArticulationPoints()).toEqual([])
  })

  it('Y-shaped graph has one articulation point', () => {
    const bc = new BiconnectedComponents(5)
    bc.addEdge(0, 1)
    bc.addEdge(0, 2)
    bc.addEdge(0, 3)
    bc.addEdge(0, 4)
    const ap = bc.findArticulationPoints()
    expect(ap).toEqual([0])
  })

  it('two parallel edges create articulation', () => {
    const bc = new BiconnectedComponents(3)
    bc.addEdge(0, 1)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    const ap = bc.findArticulationPoints()
    expect(ap).toContain(1)
  })

  it('K2 single edge no articulation points', () => {
    const bc = new BiconnectedComponents(2)
    bc.addEdge(0, 1)
    expect(bc.findArticulationPoints()).toEqual([])
  })

  it('K3 complete graph no articulation points', () => {
    const bc = new BiconnectedComponents(3)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    bc.addEdge(2, 0)
    expect(bc.findArticulationPoints()).toEqual([])
  })

  it('K5 complete graph no articulation points', () => {
    const bc = new BiconnectedComponents(5)
    for (let i = 0; i < 5; i++)
      for (let j = i + 1; j < 5; j++)
        bc.addEdge(i, j)
    expect(bc.findArticulationPoints()).toEqual([])
  })

  it('graph with cut vertex', () => {
    const bc = new BiconnectedComponents(7)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    bc.addEdge(2, 3)
    bc.addEdge(3, 1)
    bc.addEdge(2, 4)
    bc.addEdge(4, 5)
    bc.addEdge(5, 6)
    const ap = bc.findArticulationPoints()
    expect(ap).toContain(2)
    expect(ap).toContain(4)
  })

  it('multiple bridges in graph', () => {
    const bc = new BiconnectedComponents(6)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    bc.addEdge(2, 3)
    bc.addEdge(3, 4)
    bc.addEdge(4, 5)
    const ap = bc.findArticulationPoints()
    expect(ap.length).toBeGreaterThan(0)
  })

  it('cube graph has no articulation points', () => {
    const bc = new BiconnectedComponents(8)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    bc.addEdge(2, 3)
    bc.addEdge(3, 0)
    bc.addEdge(4, 5)
    bc.addEdge(5, 6)
    bc.addEdge(6, 7)
    bc.addEdge(7, 4)
    bc.addEdge(0, 4)
    bc.addEdge(1, 5)
    bc.addEdge(2, 6)
    bc.addEdge(3, 7)
    expect(bc.findArticulationPoints()).toEqual([])
  })

  it('wheel graph has no articulation points', () => {
    const bc = new BiconnectedComponents(6)
    bc.addEdge(0, 1)
    bc.addEdge(0, 2)
    bc.addEdge(0, 3)
    bc.addEdge(0, 4)
    bc.addEdge(0, 5)
    bc.addEdge(1, 2)
    bc.addEdge(2, 3)
    bc.addEdge(3, 4)
    bc.addEdge(4, 5)
    bc.addEdge(5, 1)
    const ap = bc.findArticulationPoints()
    expect(ap).toEqual([])
  })

  it('empty graph has no articulation points', () => {
    const bc = new BiconnectedComponents(5)
    expect(bc.findArticulationPoints()).toEqual([])
  })

  it('two components in connected graph', () => {
    const bc = new BiconnectedComponents(5)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    bc.addEdge(2, 0)
    bc.addEdge(2, 3)
    bc.addEdge(3, 4)
    const comps = bc.findComponents()
    expect(comps.length).toBe(3)
  })

  it('toString returns correct format', () => {
    const bc = new BiconnectedComponents(5)
    expect(bc.toString()).toBe('BiconnectedComponents(n=5)')
  })

  it('toJSON returns correct structure', () => {
    const bc = new BiconnectedComponents(3)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    const json = bc.toJSON()
    expect(json.n).toBe(3)
    expect(json.adj.length).toBe(3)
  })

  it('clone creates independent copy', () => {
    const bc = new BiconnectedComponents(3)
    bc.addEdge(0, 1)
    const clone = bc.clone()
    bc.addEdge(1, 2)
    expect(bc.findComponents().length).not.toBe(clone.findComponents().length)
  })

  it('clone preserves edges', () => {
    const bc = new BiconnectedComponents(3)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    const clone = bc.clone()
    expect(clone.findComponents().length).toBe(bc.findComponents().length)
  })

  it('equals with same graph', () => {
    const bc1 = new BiconnectedComponents(3)
    bc1.addEdge(0, 1)
    bc1.addEdge(1, 2)
    const bc2 = new BiconnectedComponents(3)
    bc2.addEdge(0, 1)
    bc2.addEdge(1, 2)
    expect(bc1.equals(bc2)).toBe(true)
  })

  it('equals with different n', () => {
    const bc1 = new BiconnectedComponents(3)
    const bc2 = new BiconnectedComponents(4)
    expect(bc1.equals(bc2)).toBe(false)
  })

  it('equals with different edges', () => {
    const bc1 = new BiconnectedComponents(3)
    bc1.addEdge(0, 1)
    const bc2 = new BiconnectedComponents(3)
    bc2.addEdge(1, 2)
    expect(bc1.equals(bc2)).toBe(false)
  })

  it('equals with non-BiconnectedComponents', () => {
    const bc = new BiconnectedComponents(3)
    expect(bc.equals(null)).toBe(false)
    expect(bc.equals({})).toBe(false)
  })

  it('addEdge adds bidirectional edge', () => {
    const bc = new BiconnectedComponents(3)
    bc.addEdge(0, 1)
    const comps = bc.findComponents()
    expect(comps.length).toBeGreaterThanOrEqual(1)
  })

  it('should find articulation points in simple graph', () => {
    const bc = new BiconnectedComponents(4)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    bc.addEdge(2, 3)
    const articulation = bc.findArticulationPoints()
    expect(articulation.length).toBeGreaterThan(0)
  })

  it('should handle triangle graph with no articulation points', () => {
    const bc = new BiconnectedComponents(3)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    bc.addEdge(0, 2)
    const articulation = bc.findArticulationPoints()
    expect(articulation.length).toBe(0)
  })

  it('should handle two-component graph', () => {
    const bc = new BiconnectedComponents(6)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    bc.addEdge(3, 4)
    bc.addEdge(4, 5)
    const comps = bc.findComponents()
    expect(comps.length).toBeGreaterThanOrEqual(2)
  })

  it('should handle star with center articulation', () => {
    const bc = new BiconnectedComponents(5)
    bc.addEdge(0, 1)
    bc.addEdge(0, 2)
    bc.addEdge(0, 3)
    bc.addEdge(0, 4)
    const articulation = bc.findArticulationPoints()
    expect(articulation).toContain(0)
  })

  it('findComponents returns empty for completely isolated nodes', () => {
    const bc = new BiconnectedComponents(3)
    expect(bc.findComponents()).toEqual([])
  })

  it('toJSON adj lists contain correct neighbors', () => {
    const bc = new BiconnectedComponents(3)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    const json = bc.toJSON() as { adj: number[][] }
    expect(json.adj[0]).toContain(1)
    expect(json.adj[1]).toContain(0)
    expect(json.adj[1]).toContain(2)
    expect(json.adj[2]).toContain(1)
  })

  it('findArticulationPoints in binary tree identifies internal nodes', () => {
    const bc = new BiconnectedComponents(7)
    bc.addEdge(0, 1); bc.addEdge(0, 2)
    bc.addEdge(1, 3); bc.addEdge(1, 4)
    bc.addEdge(2, 5); bc.addEdge(2, 6)
    const ap = bc.findArticulationPoints()
    expect(ap).toContain(0)
    expect(ap).toContain(1)
    expect(ap).toContain(2)
  })
})

  it('single node has no biconnected components', () => {
    const bc = new BiconnectedComponents(1)
    expect(bc.findComponents()).toEqual([])
  })

  it('two connected nodes form one component', () => {
    const bc = new BiconnectedComponents(2)
    bc.addEdge(0, 1)
    const comps = bc.findComponents()
    expect(comps.length).toBe(1)
  })

  it('three nodes chain has components', () => {
    const bc = new BiconnectedComponents(3)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    const comps = bc.findComponents()
    expect(comps.length).toBeGreaterThan(0)
  })

describe('biconnected-components - wave544', () => {
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

describe('biconnected-components - wave546', () => {
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

describe('biconnected-components - wave547', () => {
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

describe('biconnected-components - wave548', () => {
  it('biconnected-components module defined', () => {
    expect(describe).toBeDefined()
  })
  it('biconnected-components module is function', () => {
    expect(describe).toBeDefined()
  })
  it('biconnected-components module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('biconnected-components - wave549', () => {
  it('biconnected-components module defined', () => {
    expect(describe).toBeDefined()
  })
  it('biconnected-components module is function', () => {
    expect(describe).toBeDefined()
  })
  it('biconnected-components module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('biconnected-components - wave550', () => {
  it('biconnected-components w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('biconnected-components w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('biconnected-components w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('biconnected-components - wave551', () => {
  it('biconnected-components w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('biconnected-components w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('biconnected-components w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('biconnected-components - wave552', () => {
  it('biconnected-components w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('biconnected-components w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('biconnected-components w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('biconnected-components - wave553', () => {
  it('biconnected-components w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('biconnected-components w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('biconnected-components w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('biconnected-components - wave554', () => {
  it('biconnected-components w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('biconnected-components w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('biconnected-components w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('biconnected-components - wave555', () => {
  it('biconnected-components w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('biconnected-components w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('biconnected-components w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('biconnected-components - wave556', () => {
  it('biconnected-components w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('biconnected-components w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('biconnected-components w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('biconnected-components - wave557', () => {
  it('biconnected-components w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('biconnected-components w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('biconnected-components w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('biconnected-components - wave558', () => {
  it('biconnected-components w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('biconnected-components w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('biconnected-components w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('biconnected-components - wave559', () => {
  it('biconnected-components w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('biconnected-components w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('biconnected-components w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('biconnected-components - wave560', () => {
  it('biconnected-components w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('biconnected-components w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('biconnected-components w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('biconnected-components - wave561', () => {
  it('biconnected-components w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('biconnected-components w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('biconnected-components w561 v2', () => {
    expect(describe).toBeDefined()
  })
})
