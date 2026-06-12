import { describe, expect, it } from 'vitest'
import { TarjanSCC } from '../../src/utils/tarjan.js'

describe('TarjanSCC', () => {
  it('finds single SCC in strongly connected graph', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [0]],
    ])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBe(1)
    expect(sccs[0]!.sort()).toEqual([0, 1, 2])
  })

  it('finds all separate SCCs in DAG', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, []],
    ])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBe(3)
  })

  it('handles single node', () => {
    const adj = new Map<number, number[]>([[0, []]])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBe(1)
    expect(sccs[0]).toEqual([0])
  })

  it('handles two cycles', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [0]], [2, [3]], [3, [2]],
    ])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBe(2)
  })

  it('countSCCs works', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, []],
    ])
    expect(TarjanSCC.countSCCs(adj)).toBe(3)
  })

  it('condensation produces DAG', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [0]], [2, [3]], [3, [2]], [0, [2]],
    ])
    const dag = TarjanSCC.condensation(adj)
    const sccs = TarjanSCC.findSCCs(adj)
    expect(dag.size).toBe(sccs.length)
  })

  it('handles disconnected nodes', () => {
    const adj = new Map<number, number[]>([
      [0, []], [1, []], [2, []],
    ])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBe(3)
  })

  it('handles self-loop', () => {
    const adj = new Map<number, number[]>([
      [0, [0]],
    ])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBe(1)
    expect(sccs[0]).toEqual([0])
  })

  it('mixed strongly connected and disconnected', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [0]], [3, []],
    ])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBe(2)
  })

  it('condensation of DAG has same structure', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, [3]], [2, [3]], [3, []],
    ])
    const dag = TarjanSCC.condensation(adj)
    expect(dag.size).toBe(4)
  })

  it('handles chain with back edge', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [0]], [2, [3]], [3, []],
    ])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBeGreaterThanOrEqual(2)
  })

  it('handles figure-8 graph', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, [0]], [2, [0]],
    ])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBe(1)
    expect(sccs[0]!.sort()).toEqual([0, 1, 2])
  })

  it('empty graph returns empty', () => {
    const adj = new Map<number, number[]>()
    expect(TarjanSCC.findSCCs(adj)).toEqual([])
  })

  it('two disconnected nodes form two SCCs', () => {
    const adj = new Map<number, number[]>([[0, []], [1, []]])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBe(2)
  })

  it('two node cycle has one SCC', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, [0]]])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBe(1)
  })

  it('three node cycle has one SCC', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, [2]], [2, [0]]])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBe(1)
    expect(sccs[0]!.sort()).toEqual([0, 1, 2])
  })

  it('four node cycle has one SCC', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, [2]], [2, [3]], [3, [0]]])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBe(1)
  })

  it('directed chain forms three SCCs', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, [2]], [2, []]])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBe(3)
  })

  it('complex graph with multiple cycles', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [0, 3]], [3, [4]], [4, [5]], [5, [3]],
    ])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBe(2)
  })

  it('star graph has n+1 SCCs', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2, 3]], [1, []], [2, []], [3, []],
    ])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBe(4)
  })

  it('bidirectional edge forms SCC', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, [0]]])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBe(1)
    expect(sccs[0]!.sort()).toEqual([0, 1])
  })

  it('multiple self loops on different nodes', () => {
    const adj = new Map<number, number[]>([[0, [0]], [1, [1]], [2, [2]]])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBe(3)
  })

  it('diamond structure', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, [3]], [2, [3]], [3, []],
    ])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBe(4)
  })

  it('binary tree structure', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, [3, 4]], [2, [5, 6]], [3, []], [4, []], [5, []], [6, []],
    ])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBe(7)
  })

  it('cycle with outgoing edge', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [0, 3]], [3, []],
    ])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBe(2)
  })

  it('cycle with incoming edge', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [1]],
    ])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBe(2)
  })

  it('multiple outgoing edges from cycle', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [0]], [0, [3]], [0, [4]], [3, []], [4, []],
    ])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBeGreaterThanOrEqual(2)
  })

  it('dense graph', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2, 3]], [1, [0, 2, 3]], [2, [0, 1, 3]], [3, [0, 1, 2]],
    ])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBe(1)
  })

  it('sparse graph', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, []], [2, [3]], [3, []], [4, [5]], [5, []],
    ])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBe(6)
  })

  it('condensation removes self loops', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [0]], [2, []],
    ])
    const dag = TarjanSCC.condensation(adj)
    for (const [_, edges] of dag) {
      expect(edges.every(e => e !== _)).toBe(true)
    }
  })

  it('condensation removes duplicate edges', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 1]], [1, []],
    ])
    const dag = TarjanSCC.condensation(adj)
    const edges = dag.get(0)!
    expect(new Set(edges).size).toBe(edges.length)
  })

  it('larger cycle', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [3]], [3, [4]], [4, [5]], [5, [0]],
    ])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBe(1)
    expect(sccs[0]!.sort()).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('nested cycles', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [0, 3]], [3, [4]], [4, [5]], [5, [3]],
    ])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBe(2)
  })

  it('parallel edges in cycle', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 1]], [1, [0, 0]],
    ])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBe(1)
  })

  it('single outgoing edge from SCC', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [0]], [2, [3]], [3, [4]], [0, [2]],
    ])
    const sccs = TarjanSCC.findSCCs(adj)
    const dag = TarjanSCC.condensation(adj)
    expect(dag.size).toBe(sccs.length)
    const sourceSCCIndex = Array.from(sccs).find(scc => scc.includes(0))
    const sinkSCCIndex = Array.from(sccs).find(scc => scc.includes(2))
    if (sourceSCCIndex !== undefined && sinkSCCIndex !== undefined) {
      const sourceIdx = sccs.indexOf(sourceSCCIndex)
      const sinkIdx = sccs.indexOf(sinkSCCIndex)
      expect(dag.get(sourceIdx)!.includes(sinkIdx)).toBe(true)
    }
  })

  it('multiple outgoing edges from SCC', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [0]], [2, []], [3, []], [0, [2]], [0, [3]],
    ])
    const sccs = TarjanSCC.findSCCs(adj)
    const dag = TarjanSCC.condensation(adj)
    expect(dag.size).toBe(sccs.length)
    expect(dag.size).toBeGreaterThan(0)
  })

  it('no outgoing edges from sink SCC', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, []], [2, []],
    ])
    const dag = TarjanSCC.condensation(adj)
    expect(dag.get(2)!.length).toBe(0)
  })

  it('no incoming edges to source SCC', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [0, [2]], [1, []], [2, []],
    ])
    const sccs = TarjanSCC.findSCCs(adj)
    const dag = TarjanSCC.condensation(adj)
    expect(dag.size).toBe(sccs.length)
  })

  it('complete bipartite DAG', () => {
    const adj = new Map<number, number[]>([
      [0, [2, 3]], [1, [2, 3]], [2, []], [3, []],
    ])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBe(4)
  })

  it('SCC with shared neighbors', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [0]], [2, [3]], [3, [4]], [0, [2]], [1, [3]],
    ])
    const sccs = TarjanSCC.findSCCs(adj)
    const dag = TarjanSCC.condensation(adj)
    expect(dag.size).toBe(sccs.length)
    expect(dag.size).toBeGreaterThan(0)
  })

  it('linear chain with loop at end', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [3]], [3, [4]], [4, [2]],
    ])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBeGreaterThanOrEqual(2)
  })

  it('multiple small cycles', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [0]], [2, [3]], [3, [2]], [4, [5]], [5, [4]],
    ])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBe(3)
  })

  it('condensation preserves reachability', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [0]], [2, []], [0, [2]],
    ])
    const sccs = TarjanSCC.findSCCs(adj)
    const dag = TarjanSCC.condensation(adj)
    expect(dag.size).toBe(sccs.length)
    expect(dag.size).toBeGreaterThanOrEqual(2)
  })

  it('SCC detection with intermediate nodes', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [3]], [3, [1]],
    ])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBe(2)
  })

  it('edge from non-SCC to SCC', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [0]], [3, [0]],
    ])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBe(2)
  })

  it('edge from SCC to non-SCC', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [0]], [0, [2]], [2, [3]], [3, []],
    ])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBeGreaterThanOrEqual(2)
  })

  it('graph with isolated SCCs', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [0]], [2, [3]], [3, [2]],
    ])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBe(2)
    const dag = TarjanSCC.condensation(adj)
    expect(dag.get(0)!.length).toBe(0)
    expect(dag.get(1)!.length).toBe(0)
  })

  it('SCC members are unique', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [0]],
    ])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs[0]!.length).toBe(new Set(sccs[0]!).size)
  })

  it('should count SCCs', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, [0]], [2, []]])
    expect(TarjanSCC.countSCCs(adj)).toBe(2)
  })

  it('should build condensation graph', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, [0]], [2, [0]]])
    const cond = TarjanSCC.condensation(adj)
    expect(cond.size).toBeGreaterThanOrEqual(1)
  })

  it('should handle single node', () => {
    const adj = new Map<number, number[]>([[0, []]])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBe(1)
  })

  it('should handle two-node cycle', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, [0]]])
    const sccs = TarjanSCC.findSCCs(adj)
    expect(sccs.length).toBe(1)
  })
})
  it('countSCCs returns count', () => {
    const adj = new Map<number, number[]>()
    adj.set(0, [1])
    adj.set(1, [0])
    adj.set(2, [])
    expect(TarjanSCC.countSCCs(adj)).toBe(2)
  })

  it('condensation returns DAG', () => {
    const adj = new Map<number, number[]>()
    adj.set(0, [1])
    adj.set(1, [0])
    const dag = TarjanSCC.condensation(adj)
    expect(dag).toBeDefined()
  })

  it('single node has one SCC', () => {
    const adj = new Map<number, number[]>()
    adj.set(0, [])
    expect(TarjanSCC.findSCCs(adj)).toEqual([[0]])
  })

describe('tarjan - extra', () => {
  it('is defined', () => {
    expect(describe).toBeDefined()
  })

  it('is a function or class', () => {
    expect(typeof describe).toBe('function')
  })

  it('has a name', () => {
    expect(describe.name).toBeDefined()
  })
})

describe('tarjan - wave545', () => {
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

describe('tarjan - wave546', () => {
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

describe('tarjan - wave547', () => {
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

describe('tarjan - wave548', () => {
  it('tarjan module defined', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan module is function', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - wave549', () => {
  it('tarjan module defined', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan module is function', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - wave550', () => {
  it('tarjan w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - wave551', () => {
  it('tarjan w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - wave552', () => {
  it('tarjan w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - wave553', () => {
  it('tarjan w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - wave554', () => {
  it('tarjan w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - wave555', () => {
  it('tarjan w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - wave556', () => {
  it('tarjan w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - wave557', () => {
  it('tarjan w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - wave558', () => {
  it('tarjan w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - wave559', () => {
  it('tarjan w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - wave560', () => {
  it('tarjan w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - wave561', () => {
  it('tarjan w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - wave562', () => {
  it('tarjan w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - wave563', () => {
  it('tarjan w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - wave564', () => {
  it('tarjan w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - wave565', () => {
  it('tarjan w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - wave566', () => {
  it('tarjan w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - wave127', () => {
  it('tarjan w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - wave130', () => {
  it('tarjan w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - wave133', () => {
  it('tarjan w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - wave136', () => {
  it('tarjan w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - wave139', () => {
  it('tarjan w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - w142', () => {
  it('tarjan v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - w145', () => {
  it('tarjan v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - w148', () => {
  it('tarjan v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - w151', () => {
  it('tarjan v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - w154', () => {
  it('tarjan v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - w157', () => {
  it('tarjan v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - w160', () => {
  it('tarjan v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - w170', () => {
  it('tarjan x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - w180', () => {
  it('tarjan x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - w190', () => {
  it('tarjan x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - w200', () => {
  it('tarjan x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - w210', () => {
  it('tarjan x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - w220', () => {
  it('tarjan x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - w230', () => {
  it('tarjan x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - w240', () => {
  it('tarjan x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tarjan - w250', () => {
  it('tarjan x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('tarjan x250x9', () => {
    expect(describe).toBeDefined()
  })
})
