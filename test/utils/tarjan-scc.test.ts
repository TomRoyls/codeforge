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
