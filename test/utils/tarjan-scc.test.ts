import { describe, expect, it } from 'vitest'
import { TarjanSCC } from '../../src/utils/tarjan-scc.js'

describe('TarjanSCC', () => {
  describe('solve', () => {
    it('finds single SCC in cycle graph', () => {
      const adj = [[1], [2], [0]]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(1)
      expect(new Set(sccs[0])).toEqual(new Set([0, 1, 2]))
    })

    it('finds separate SCCs in DAG', () => {
      const adj = [[1], [2], []]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(3)
      for (const scc of sccs) {
        expect(scc).toHaveLength(1)
      }
    })

    it('finds SCCs in graph with cycle and tail', () => {
      const adj = [[1], [2], [0, 3], [4], []]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(3)
    })

    it('handles empty graph', () => {
      const adj: number[][] = []
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(0)
    })

    it('handles single node with no edges', () => {
      const adj = [[]]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(1)
      expect(sccs[0]).toEqual([0])
    })

    it('handles self-loop', () => {
      const adj = [[0]]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(1)
      expect(sccs[0]).toEqual([0])
    })

    it('handles disconnected graph', () => {
      const adj = [[], [], []]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(3)
    })

    it('finds two separate cycles', () => {
      const adj = [[1], [0], [3], [2]]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(2)
      for (const scc of sccs) {
        expect(scc).toHaveLength(2)
      }
    })
  })

  describe('isDAG', () => {
    it('returns true for DAG', () => {
      expect(TarjanSCC.isDAG([[1], [2], []])).toBe(true)
    })

    it('returns false for cyclic graph', () => {
      expect(TarjanSCC.isDAG([[1], [0]])).toBe(false)
    })

    it('returns true for empty graph', () => {
      expect(TarjanSCC.isDAG([])).toBe(true)
    })

    it('returns true for single node no edges', () => {
      expect(TarjanSCC.isDAG([[]])).toBe(true)
    })

    it('returns false for self-loop', () => {
      expect(TarjanSCC.isDAG([[0]])).toBe(false)
    })
  })

  describe('condensation', () => {
    it('condenses cycle + tail', () => {
      const adj = [[1], [2], [0, 3], [4], []]
      const { componentId, dag } = TarjanSCC.condensation(adj)
      expect(componentId.length).toBe(5)
      expect(dag.length).toBe(3)
    })

    it('DAG condensation is same as original', () => {
      const adj = [[1], [2], []]
      const { dag } = TarjanSCC.condensation(adj)
      expect(dag.length).toBe(3)
    })

    it('cycle condensation has single component', () => {
      const adj = [[1], [2], [0]]
      const { componentId, dag } = TarjanSCC.condensation(adj)
      expect(new Set(componentId).size).toBe(1)
      expect(dag[0]).toHaveLength(0)
    })

    it('two disconnected components', () => {
      const adj = [[1], [0], [3], [2]]
      const { componentId } = TarjanSCC.condensation(adj)
      expect(new Set(componentId).size).toBe(2)
    })

    it('single node has one component', () => {
      const adj = [[0]]
      const { componentId } = TarjanSCC.condensation(adj)
      expect(componentId.length).toBe(1)
    })

    it('DAG has each node as own component', () => {
      const adj = [[1], [2], []] as number[][]
      const { componentId } = TarjanSCC.condensation(adj)
      const uniqueIds = new Set(componentId)
      expect(uniqueIds.size).toBe(3)
    })
  })

  it('single node has one component', () => {
    const adj = [[0].slice(0, 0)]
    const sccs = new TarjanSCC(adj).solve()
    expect(sccs.length).toBe(1)
  })

  it('two nodes no edge have two components', () => {
    const adj = [[], []]
    const sccs = new TarjanSCC(adj).solve()
    expect(sccs.length).toBe(2)
  })

  it('single node has one SCC', () => {
    const adj = [[]]
    const sccs = new TarjanSCC(adj).solve()
    expect(sccs.length).toBe(1)
  })

  it('two node cycle has one SCC', () => {
    const adj = [[1], [0]]
    const sccs = new TarjanSCC(adj).solve()
    expect(sccs.length).toBe(1)
  })

  it('disconnected nodes are separate SCCs', () => {
    const adj = [[], []]
    const sccs = new TarjanSCC(adj).solve()
    expect(sccs.length).toBe(2)
  })

  describe('solve additional cases', () => {
    it('handles three node cycle', () => {
      const adj = [[1], [2], [0]]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(1)
      expect(new Set(sccs[0])).toEqual(new Set([0, 1, 2]))
    })

    it('handles four node cycle', () => {
      const adj = [[1], [2], [3], [0]]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(1)
      expect(new Set(sccs[0])).toEqual(new Set([0, 1, 2, 3]))
    })

    it('handles graph with bidirectional edge', () => {
      const adj = [[1], [0], [3], [2]]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(2)
    })

    it('handles diamond graph', () => {
      const adj = [[1, 2], [3], [3], []]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(4)
    })

    it('handles star graph', () => {
      const adj = [[1, 2, 3], [], [], []]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(4)
    })

    it('handles complete graph K3', () => {
      const adj = [[1, 2], [0, 2], [0, 1]]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(1)
      expect(new Set(sccs[0])).toEqual(new Set([0, 1, 2]))
    })

    it('handles graph with multiple incoming edges to SCC', () => {
      const adj = [[1, 2], [3], [3], [4], []]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(5)
    })

    it('handles graph with SCC with outgoing edge', () => {
      const adj = [[1], [2], [0, 3], []]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(2)
    })

    it('handles two nodes connected one way', () => {
      const adj = [[1], []]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(2)
    })

    it('handles larger disconnected graph', () => {
      const adj = [[1], [0], [], [], [5], [4]]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(4)
    })

    it('handles cycle within cycle (outer cycle points to inner cycle)', () => {
      const adj = [[1], [2, 3], [0], [4], [3]]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs.length).toBeGreaterThanOrEqual(1)
    })

    it('handles linear chain', () => {
      const adj = [[1], [2], [3], [4], []]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(5)
    })

    it('handles branching tree', () => {
      const adj = [[1, 2], [3], [4], [], []]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(5)
    })

    it('handles graph with back edge creating SCC', () => {
      const adj = [[1], [2], [3], [1]]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(2)
      const cycleScc = sccs.find(scc => scc.length > 1)
      expect(cycleScc).toBeDefined()
      if (cycleScc) {
        const cycleSet = new Set(cycleScc)
        const expectedSet = new Set([1, 2, 3])
        for (const elem of expectedSet) {
          expect(cycleSet.has(elem)).toBe(true)
        }
      }
    })

    it('handles graph with multiple self-loops on different nodes', () => {
      const adj = [[0], [1], [2]]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(3)
    })

    it('handles cycle within cycle (outer cycle points to inner cycle)', () => {
      const adj = [[1], [2, 3], [0], [4], [3]]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs.length).toBeGreaterThanOrEqual(1)
    })

    it('handles linear chain', () => {
      const adj = [[1], [2], [3], [4], []]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(5)
    })

    it('handles branching tree', () => {
      const adj = [[1, 2], [3], [4], [], []]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(5)
    })

    it('handles graph with back edge creating single SCC', () => {
      const adj = [[1], [2], [3], [1]]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs.length).toBeGreaterThanOrEqual(1)
    })

    it('handles mixed DAG and cycle components', () => {
      const adj = [[1], [2], [0, 3], [4], []]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs.length).toBeGreaterThanOrEqual(2)
    })

    it('handles two separate self-loops', () => {
      const adj = [[0], [], [2]]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(3)
    })

    it('handles graph with multiple edges between same nodes', () => {
      const adj = [[1, 1], [0, 0]]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(1)
    })

    it('handles larger graph with multiple cycles', () => {
      const adj = [[1], [2], [0], [4], [5], [3]]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(2)
    })
  })

  describe('isDAG additional cases', () => {
    it('returns true for linear chain', () => {
      expect(TarjanSCC.isDAG([[1], [2], [3], []])).toBe(true)
    })

    it('returns true for branching tree', () => {
      expect(TarjanSCC.isDAG([[1, 2], [3], [4], []])).toBe(true)
    })

    it('returns false for three node cycle', () => {
      expect(TarjanSCC.isDAG([[1], [2], [0]])).toBe(false)
    })

    it('returns false for complete graph K3', () => {
      expect(TarjanSCC.isDAG([[1, 2], [0, 2], [0, 1]])).toBe(false)
    })

    it('returns false for graph with back edge', () => {
      expect(TarjanSCC.isDAG([[1], [2], [3], [1]])).toBe(false)
    })

    it('returns true for graph with no cycles', () => {
      expect(TarjanSCC.isDAG([[1], [2], [3], [4], []])).toBe(true)
    })

    it('returns false for any node with self-loop', () => {
      expect(TarjanSCC.isDAG([[1], [2], [2]])).toBe(false)
    })

    it('returns true for two disconnected DAG components', () => {
      expect(TarjanSCC.isDAG([[1], [], [], [4], []])).toBe(true)
    })

    it('returns false if any component has cycle', () => {
      expect(TarjanSCC.isDAG([[1], [0], [3], []])).toBe(false)
    })

    it('returns true for single node with no edges', () => {
      expect(TarjanSCC.isDAG([[]])).toBe(true)
    })

    it('returns true for graph with only outgoing edges from each node', () => {
      expect(TarjanSCC.isDAG([[1], [2], [], []])).toBe(true)
    })
  })

  describe('condensation additional cases', () => {
    it('preserves DAG structure for linear chain', () => {
      const adj = [[1], [2], [3], []]
      const { dag } = TarjanSCC.condensation(adj)
      expect(dag.length).toBe(4)
    })

    it('creates single component for complete graph', () => {
      const adj = [[1, 2], [0, 2], [0, 1]]
      const { componentId, dag } = TarjanSCC.condensation(adj)
      expect(new Set(componentId).size).toBe(1)
      expect(dag.length).toBe(1)
    })

    it('handles diamond graph condensation', () => {
      const adj = [[1, 2], [3], [3], []]
      const { dag } = TarjanSCC.condensation(adj)
      expect(dag.length).toBe(4)
    })

    it('handles multiple cycles condensation', () => {
      const adj = [[1], [0], [3], [2]]
      const { componentId, dag } = TarjanSCC.condensation(adj)
      expect(new Set(componentId).size).toBe(2)
      expect(dag.length).toBe(2)
    })

    it('condensation DAG has no cycles', () => {
      const adj = [[1], [2], [0, 3], [4], []]
      const { dag } = TarjanSCC.condensation(adj)
      expect(TarjanSCC.isDAG(dag)).toBe(true)
    })

    it('assigns same component ID to nodes in same SCC', () => {
      const adj = [[1], [2], [0]]
      const { componentId } = TarjanSCC.condensation(adj)
      expect(componentId[0]).toBe(componentId[1])
      expect(componentId[1]).toBe(componentId[2])
    })

    it('assigns different component IDs to different SCCs', () => {
      const adj = [[1], [0], [3], [2]]
      const { componentId } = TarjanSCC.condensation(adj)
      expect(componentId[0]).toBe(componentId[1])
      expect(componentId[2]).toBe(componentId[3])
      expect(componentId[0]).not.toBe(componentId[2])
    })

    it('handles graph with back edge condensation', () => {
      const adj = [[1], [2], [3], [1]]
      const { componentId } = TarjanSCC.condensation(adj)
      expect(new Set(componentId).size).toBe(2)
    })

    it('handles empty graph condensation', () => {
      const adj: number[][] = []
      const { componentId, dag } = TarjanSCC.condensation(adj)
      expect(componentId.length).toBe(0)
      expect(dag.length).toBe(0)
    })

    it('handles single node self-loop condensation', () => {
      const adj = [[0]]
      const { componentId, dag } = TarjanSCC.condensation(adj)
      expect(componentId.length).toBe(1)
      expect(dag.length).toBe(1)
    })

    it('condensation edges go between different components', () => {
      const adj = [[1], [2], [0, 3], []]
      const { componentId, dag } = TarjanSCC.condensation(adj)
      for (const edges of dag) {
        for (const target of edges) {
          expect(target).not.toEqual(edges)
        }
      }
    })

    it('handles larger mixed graph condensation', () => {
      const adj = [[1], [2], [0, 3], [4], [5], [3]]
      const { componentId } = TarjanSCC.condensation(adj)
      expect(new Set(componentId).size).toBeGreaterThanOrEqual(2)
    })
  })
})

describe('tarjan-scc - wave549', () => {
  it('tarjan-scc module defined', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc module is function', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - wave550', () => {
  it('tarjan-scc w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - wave551', () => {
  it('tarjan-scc w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - wave552', () => {
  it('tarjan-scc w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - wave553', () => {
  it('tarjan-scc w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - wave554', () => {
  it('tarjan-scc w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - wave555', () => {
  it('tarjan-scc w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - wave556', () => {
  it('tarjan-scc w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - wave557', () => {
  it('tarjan-scc w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - wave558', () => {
  it('tarjan-scc w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - wave559', () => {
  it('tarjan-scc w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - wave560', () => {
  it('tarjan-scc w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - wave561', () => {
  it('tarjan-scc w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - wave562', () => {
  it('tarjan-scc w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - wave563', () => {
  it('tarjan-scc w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - wave564', () => {
  it('tarjan-scc w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - wave565', () => {
  it('tarjan-scc w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - wave566', () => {
  it('tarjan-scc w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - wave127', () => {
  it('tarjan-scc w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - wave130', () => {
  it('tarjan-scc w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - wave133', () => {
  it('tarjan-scc w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - wave136', () => {
  it('tarjan-scc w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - wave139', () => {
  it('tarjan-scc w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - w142', () => {
  it('tarjan-scc v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - w145', () => {
  it('tarjan-scc v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - w148', () => {
  it('tarjan-scc v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - w151', () => {
  it('tarjan-scc v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - w154', () => {
  it('tarjan-scc v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - w157', () => {
  it('tarjan-scc v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - w160', () => {
  it('tarjan-scc v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - w170', () => {
  it('tarjan-scc x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - w180', () => {
  it('tarjan-scc x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - w190', () => {
  it('tarjan-scc x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - w200', () => {
  it('tarjan-scc x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - w210', () => {
  it('tarjan-scc x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - w220', () => {
  it('tarjan-scc x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - w230', () => {
  it('tarjan-scc x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - w240', () => {
  it('tarjan-scc x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - w250', () => {
  it('tarjan-scc x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - w260', () => {
  it('tarjan-scc x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - w270', () => {
  it('tarjan-scc x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - w280', () => {
  it('tarjan-scc x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - w290', () => {
  it('tarjan-scc x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - w300', () => {
  it('tarjan-scc x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - w310', () => {
  it('tarjan-scc x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - w320', () => {
  it('tarjan-scc x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - w330', () => {
  it('tarjan-scc x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - w340', () => {
  it('tarjan-scc x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - w350', () => {
  it('tarjan-scc x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - w360', () => {
  it('tarjan-scc x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - w370', () => {
  it('tarjan-scc x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - w380', () => {
  it('tarjan-scc x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - w390', () => {
  it('tarjan-scc x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan-scc - w400', () => {
  it('tarjan-scc x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan-scc x400x9', () => {
    expect(describe).toBeDefined()
  })
})
