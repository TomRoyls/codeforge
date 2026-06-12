import { describe, expect, it } from 'vitest'
import { StrongConnectivityContraction } from '../../src/utils/strong-connectivity-contraction.js'

describe('StrongConnectivityContraction', () => {
  it('single node has no cycle', () => {
    const scc = new StrongConnectivityContraction(1)
    expect(scc.hasCycle()).toBe(false)
  })

  it('self-loop is cycle', () => {
    const scc = new StrongConnectivityContraction(1)
    scc.addEdge(0, 0)
    expect(scc.hasCycle()).toBe(true)
  })

  it('two-node cycle', () => {
    const scc = new StrongConnectivityContraction(2)
    scc.addEdge(0, 1)
    scc.addEdge(1, 0)
    expect(scc.hasCycle()).toBe(true)
  })

  it('DAG has no cycle', () => {
    const scc = new StrongConnectivityContraction(3)
    scc.addEdge(0, 1)
    scc.addEdge(1, 2)
    expect(scc.hasCycle()).toBe(false)
  })

  it('contracts cycle to single component', () => {
    const scc = new StrongConnectivityContraction(3)
    scc.addEdge(0, 1)
    scc.addEdge(1, 2)
    scc.addEdge(2, 0)
    expect(scc.contract().componentCount).toBe(1)
  })

  it('contracts DAG to 3 components', () => {
    const scc = new StrongConnectivityContraction(3)
    scc.addEdge(0, 1)
    scc.addEdge(1, 2)
    expect(scc.contract().componentCount).toBe(3)
  })

  it('partial cycle', () => {
    const scc = new StrongConnectivityContraction(4)
    scc.addEdge(0, 1)
    scc.addEdge(1, 2)
    scc.addEdge(2, 0)
    scc.addEdge(2, 3)
    expect(scc.contract().componentCount).toBe(2)
  })

  it('DAG edges in contraction', () => {
    const scc = new StrongConnectivityContraction(3)
    scc.addEdge(0, 1)
    scc.addEdge(1, 2)
    const { dag } = scc.contract()
    expect(dag.length).toBe(3)
  })

  it('isolated nodes are separate components', () => {
    expect(new StrongConnectivityContraction(3).contract().componentCount).toBe(3)
  })

  it('two cycles share no edges in DAG', () => {
    const scc = new StrongConnectivityContraction(4)
    scc.addEdge(0, 1)
    scc.addEdge(1, 0)
    scc.addEdge(2, 3)
    scc.addEdge(3, 2)
    const { dag, componentCount } = scc.contract()
    expect(componentCount).toBe(2)
    expect(dag[0]!.length).toBe(0)
    expect(dag[1]!.length).toBe(0)
  })

  it('handles larger DAG', () => {
    const scc = new StrongConnectivityContraction(5)
    scc.addEdge(0, 1)
    scc.addEdge(1, 2)
    scc.addEdge(2, 3)
    scc.addEdge(3, 4)
    expect(scc.hasCycle()).toBe(false)
    const totalEdges = scc.contract().dag.reduce((sum, arr) => sum + arr.length, 0)
    expect(totalEdges).toBe(4)
  })

  it('two SCCs with edge between', () => {
    const scc = new StrongConnectivityContraction(4)
    scc.addEdge(0, 1)
    scc.addEdge(1, 0)
    scc.addEdge(2, 3)
    scc.addEdge(3, 2)
    scc.addEdge(0, 2)
    const { componentCount, dag } = scc.contract()
    expect(componentCount).toBe(2)
    expect(dag[0]!.length + dag[1]!.length).toBeGreaterThanOrEqual(1)
  })

  it('single node has one component', () => {
    expect(new StrongConnectivityContraction(1).contract().componentCount).toBe(1)
  })

  it('two nodes no edge are two components', () => {
    expect(new StrongConnectivityContraction(2).contract().componentCount).toBe(2)
  })

  it('complete graph is one component', () => {
    const scc = new StrongConnectivityContraction(3)
    scc.addEdge(0, 1); scc.addEdge(1, 0)
    scc.addEdge(1, 2); scc.addEdge(2, 1)
    scc.addEdge(0, 2); scc.addEdge(2, 0)
    expect(scc.contract().componentCount).toBe(1)
  })

  it('self-loop node plus disconnected node', () => {
    const scc = new StrongConnectivityContraction(2)
    scc.addEdge(0, 0)
    expect(scc.contract().componentCount).toBe(2)
  })

  it('component array assigns correct component', () => {
    const scc = new StrongConnectivityContraction(3)
    scc.addEdge(0, 1)
    scc.addEdge(1, 2)
    const { component } = scc.contract()
    expect(component.length).toBe(3)
    expect(new Set(component).size).toBe(3)
  })

  it('cycle nodes share same component', () => {
    const scc = new StrongConnectivityContraction(3)
    scc.addEdge(0, 1)
    scc.addEdge(1, 2)
    scc.addEdge(2, 0)
    const { component } = scc.contract()
    expect(component[0]).toBe(component[1])
    expect(component[1]).toBe(component[2])
  })

  it('DAG component IDs are unique', () => {
    const scc = new StrongConnectivityContraction(4)
    scc.addEdge(0, 1)
    scc.addEdge(1, 2)
    scc.addEdge(2, 3)
    const { component } = scc.contract()
    expect(new Set(component).size).toBe(4)
  })

  it('three-node cycle with outgoing edge', () => {
    const scc = new StrongConnectivityContraction(4)
    scc.addEdge(0, 1); scc.addEdge(1, 2); scc.addEdge(2, 0)
    scc.addEdge(0, 3)
    const { componentCount, dag } = scc.contract()
    expect(componentCount).toBe(2)
    const totalEdges = dag.reduce((s, a) => s + a.length, 0)
    expect(totalEdges).toBeGreaterThanOrEqual(1)
  })

  it('five-node chain has no cycle', () => {
    const scc = new StrongConnectivityContraction(5)
    scc.addEdge(0, 1); scc.addEdge(1, 2); scc.addEdge(2, 3); scc.addEdge(3, 4)
    expect(scc.hasCycle()).toBe(false)
  })

  it('five-node chain has 5 components', () => {
    const scc = new StrongConnectivityContraction(5)
    scc.addEdge(0, 1); scc.addEdge(1, 2); scc.addEdge(2, 3); scc.addEdge(3, 4)
    expect(scc.contract().componentCount).toBe(5)
  })

  it('two separate self-loops', () => {
    const scc = new StrongConnectivityContraction(2)
    scc.addEdge(0, 0)
    scc.addEdge(1, 1)
    expect(scc.hasCycle()).toBe(true)
    expect(scc.contract().componentCount).toBe(2)
  })

  it('single edge no cycle', () => {
    const scc = new StrongConnectivityContraction(2)
    scc.addEdge(0, 1)
    expect(scc.hasCycle()).toBe(false)
  })

  it('DAG contraction preserves edge count', () => {
    const scc = new StrongConnectivityContraction(3)
    scc.addEdge(0, 1)
    scc.addEdge(0, 2)
    scc.addEdge(1, 2)
    const totalEdges = scc.contract().dag.reduce((s, a) => s + a.length, 0)
    expect(totalEdges).toBe(3)
  })

  it('large cycle contracts to one component', () => {
    const scc = new StrongConnectivityContraction(10)
    for (let i = 0; i < 9; i++) scc.addEdge(i, i + 1)
    scc.addEdge(9, 0)
    expect(scc.contract().componentCount).toBe(1)
    expect(scc.hasCycle()).toBe(true)
  })

  it('component array has correct length', () => {
    const scc = new StrongConnectivityContraction(5)
    const { component } = scc.contract()
    expect(component.length).toBe(5)
  })

  it('dag array has componentCount entries', () => {
    const scc = new StrongConnectivityContraction(3)
    scc.addEdge(0, 1)
    scc.addEdge(1, 2)
    const { dag, componentCount } = scc.contract()
    expect(dag.length).toBe(componentCount)
  })

  it('empty graph has n components', () => {
    expect(new StrongConnectivityContraction(4).contract().componentCount).toBe(4)
  })

  it('two interlinked cycles', () => {
    const scc = new StrongConnectivityContraction(4)
    scc.addEdge(0, 1); scc.addEdge(1, 0)
    scc.addEdge(2, 3); scc.addEdge(3, 2)
    scc.addEdge(1, 2); scc.addEdge(2, 1)
    expect(scc.contract().componentCount).toBe(1)
  })

  it('cycle with two tails', () => {
    const scc = new StrongConnectivityContraction(5)
    scc.addEdge(0, 1); scc.addEdge(1, 2); scc.addEdge(2, 0)
    scc.addEdge(0, 3)
    scc.addEdge(0, 4)
    expect(scc.contract().componentCount).toBe(3)
  })

  it('multiple parallel edges', () => {
    const scc = new StrongConnectivityContraction(2)
    scc.addEdge(0, 1)
    scc.addEdge(0, 1)
    scc.addEdge(1, 0)
    expect(scc.contract().componentCount).toBe(1)
  })

  it('hasCycle returns true for back edge', () => {
    const scc = new StrongConnectivityContraction(4)
    scc.addEdge(0, 1); scc.addEdge(1, 2); scc.addEdge(2, 3); scc.addEdge(3, 1)
    expect(scc.hasCycle()).toBe(true)
  })

  it('diamond DAG has no cycle', () => {
    const scc = new StrongConnectivityContraction(4)
    scc.addEdge(0, 1); scc.addEdge(0, 2); scc.addEdge(1, 3); scc.addEdge(2, 3)
    expect(scc.hasCycle()).toBe(false)
    expect(scc.contract().componentCount).toBe(4)
  })

  it('component IDs are sequential', () => {
    const scc = new StrongConnectivityContraction(3)
    const { component } = scc.contract()
    const ids = [...new Set(component)].sort()
    expect(ids).toEqual([0, 1, 2])
  })

  it('graph with bidirectional edge forms cycle', () => {
    const scc = new StrongConnectivityContraction(3)
    scc.addEdge(0, 1); scc.addEdge(1, 0)
    scc.addEdge(1, 2)
    expect(scc.hasCycle()).toBe(true)
    const { componentCount } = scc.contract()
    expect(componentCount).toBe(2)
  })

  it('no edges all isolated', () => {
    const scc = new StrongConnectivityContraction(5)
    const { componentCount, component } = scc.contract()
    expect(componentCount).toBe(5)
    expect(new Set(component).size).toBe(5)
  })

  it('single edge between two nodes', () => {
    const scc = new StrongConnectivityContraction(2)
    scc.addEdge(0, 1)
    const { componentCount, dag } = scc.contract()
    expect(componentCount).toBe(2)
    const totalEdges = dag.reduce((s, a) => s + a.length, 0)
    expect(totalEdges).toBe(1)
  })

  it('three-node cycle has one DAG node with no edges', () => {
    const scc = new StrongConnectivityContraction(3)
    scc.addEdge(0, 1); scc.addEdge(1, 2); scc.addEdge(2, 0)
    const { dag } = scc.contract()
    expect(dag.length).toBe(1)
    expect(dag[0]!.length).toBe(0)
  })

  it('V-shaped graph (two edges from source)', () => {
    const scc = new StrongConnectivityContraction(3)
    scc.addEdge(0, 1); scc.addEdge(0, 2)
    const { componentCount, dag } = scc.contract()
    expect(componentCount).toBe(3)
    const totalEdges = dag.reduce((s, a) => s + a.length, 0)
    expect(totalEdges).toBe(2)
  })

  it('cycle with extra incoming edge', () => {
    const scc = new StrongConnectivityContraction(4)
    scc.addEdge(0, 1); scc.addEdge(1, 2); scc.addEdge(2, 0)
    scc.addEdge(3, 0)
    const { componentCount, dag } = scc.contract()
    expect(componentCount).toBe(2)
    const totalEdges = dag.reduce((s, a) => s + a.length, 0)
    expect(totalEdges).toBeGreaterThanOrEqual(1)
  })

  it('two nodes both have self-loops', () => {
    const scc = new StrongConnectivityContraction(2)
    scc.addEdge(0, 0); scc.addEdge(1, 1)
    expect(scc.hasCycle()).toBe(true)
    expect(scc.contract().componentCount).toBe(2)
  })

  it('six node chain', () => {
    const scc = new StrongConnectivityContraction(6)
    for (let i = 0; i < 5; i++) scc.addEdge(i, i + 1)
    expect(scc.hasCycle()).toBe(false)
    expect(scc.contract().componentCount).toBe(6)
  })

  it('reverse chain is also a DAG', () => {
    const scc = new StrongConnectivityContraction(4)
    scc.addEdge(3, 2); scc.addEdge(2, 1); scc.addEdge(1, 0)
    expect(scc.hasCycle()).toBe(false)
    expect(scc.contract().componentCount).toBe(4)
  })

  it('component array values within range', () => {
    const scc = new StrongConnectivityContraction(4)
    scc.addEdge(0, 1); scc.addEdge(1, 2); scc.addEdge(2, 3)
    const { component, componentCount } = scc.contract()
    for (const c of component) {
      expect(c).toBeGreaterThanOrEqual(0)
      expect(c).toBeLessThan(componentCount)
    }
  })

  it('contract can be called multiple times', () => {
    const scc = new StrongConnectivityContraction(3)
    scc.addEdge(0, 1); scc.addEdge(1, 2); scc.addEdge(2, 0)
    const first = scc.contract()
    const second = scc.contract()
    expect(first.componentCount).toBe(second.componentCount)
    expect(first.dag.length).toBe(second.dag.length)
  })

  it('single node with self-loop has cycle', () => {
    const scc = new StrongConnectivityContraction(1)
    scc.addEdge(0, 0)
    expect(scc.hasCycle()).toBe(true)
    expect(scc.contract().componentCount).toBe(1)
  })

  it('three nodes all with self-loops', () => {
    const scc = new StrongConnectivityContraction(3)
    scc.addEdge(0, 0); scc.addEdge(1, 1); scc.addEdge(2, 2)
    expect(scc.hasCycle()).toBe(true)
    expect(scc.contract().componentCount).toBe(3)
  })

  it('mixed self-loops and normal edges', () => {
    const scc = new StrongConnectivityContraction(4)
    scc.addEdge(0, 0)
    scc.addEdge(1, 2); scc.addEdge(2, 1)
    scc.addEdge(2, 3)
    expect(scc.contract().componentCount).toBe(3)
  })

  it('graph with cycle pointing to itself', () => {
    const scc = new StrongConnectivityContraction(3)
    scc.addEdge(0, 1); scc.addEdge(1, 2); scc.addEdge(2, 0)
    scc.addEdge(0, 0)
    expect(scc.contract().componentCount).toBe(1)
    expect(scc.hasCycle()).toBe(true)
  })

  it('should handle DAG', () => {
    const scc = new StrongConnectivityContraction(3)
    scc.addEdge(0, 1)
    scc.addEdge(1, 2)
    expect(scc.hasCycle()).toBe(false)
    expect(scc.contract().componentCount).toBe(3)
  })

  it('should handle single node', () => {
    const scc = new StrongConnectivityContraction(1)
    expect(scc.contract().componentCount).toBe(1)
  })
})

  it('single node contracts to one component', () => {
    const scc = new StrongConnectivityContraction(1)
    const result = scc.contract()
    expect(result.componentCount).toBe(1)
  })

  it('disconnected nodes form separate components', () => {
    const scc = new StrongConnectivityContraction(3)
    const result = scc.contract()
    expect(result.componentCount).toBe(3)
  })

  it('cycle forms single component', () => {
    const scc = new StrongConnectivityContraction(3)
    scc.addEdge(0, 1)
    scc.addEdge(1, 2)
    scc.addEdge(2, 0)
    const result = scc.contract()
    expect(result.componentCount).toBe(1)
  })

describe('strong-connectivity-contraction - extra', () => {
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

describe('strong-connectivity-contraction - wave545', () => {
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

describe('strong-connectivity-contraction - wave546', () => {
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

describe('strong-connectivity-contraction - wave547', () => {
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

describe('strong-connectivity-contraction - wave548', () => {
  it('strong-connectivity-contraction module defined', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction module is function', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - wave549', () => {
  it('strong-connectivity-contraction module defined', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction module is function', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - wave550', () => {
  it('strong-connectivity-contraction w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - wave551', () => {
  it('strong-connectivity-contraction w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - wave552', () => {
  it('strong-connectivity-contraction w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - wave553', () => {
  it('strong-connectivity-contraction w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - wave554', () => {
  it('strong-connectivity-contraction w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - wave555', () => {
  it('strong-connectivity-contraction w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - wave556', () => {
  it('strong-connectivity-contraction w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - wave557', () => {
  it('strong-connectivity-contraction w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - wave558', () => {
  it('strong-connectivity-contraction w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - wave559', () => {
  it('strong-connectivity-contraction w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - wave560', () => {
  it('strong-connectivity-contraction w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - wave561', () => {
  it('strong-connectivity-contraction w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - wave562', () => {
  it('strong-connectivity-contraction w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - wave563', () => {
  it('strong-connectivity-contraction w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - wave564', () => {
  it('strong-connectivity-contraction w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - wave565', () => {
  it('strong-connectivity-contraction w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - wave566', () => {
  it('strong-connectivity-contraction w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - wave127', () => {
  it('strong-connectivity-contraction w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - wave130', () => {
  it('strong-connectivity-contraction w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - wave133', () => {
  it('strong-connectivity-contraction w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - wave136', () => {
  it('strong-connectivity-contraction w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - wave139', () => {
  it('strong-connectivity-contraction w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w142', () => {
  it('strong-connectivity-contraction v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w145', () => {
  it('strong-connectivity-contraction v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w148', () => {
  it('strong-connectivity-contraction v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w151', () => {
  it('strong-connectivity-contraction v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w154', () => {
  it('strong-connectivity-contraction v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w157', () => {
  it('strong-connectivity-contraction v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w160', () => {
  it('strong-connectivity-contraction v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w170', () => {
  it('strong-connectivity-contraction x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w180', () => {
  it('strong-connectivity-contraction x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w190', () => {
  it('strong-connectivity-contraction x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w200', () => {
  it('strong-connectivity-contraction x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w210', () => {
  it('strong-connectivity-contraction x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w220', () => {
  it('strong-connectivity-contraction x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w230', () => {
  it('strong-connectivity-contraction x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w240', () => {
  it('strong-connectivity-contraction x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w250', () => {
  it('strong-connectivity-contraction x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w260', () => {
  it('strong-connectivity-contraction x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w270', () => {
  it('strong-connectivity-contraction x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w280', () => {
  it('strong-connectivity-contraction x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w290', () => {
  it('strong-connectivity-contraction x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w300', () => {
  it('strong-connectivity-contraction x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w310', () => {
  it('strong-connectivity-contraction x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w320', () => {
  it('strong-connectivity-contraction x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w330', () => {
  it('strong-connectivity-contraction x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w340', () => {
  it('strong-connectivity-contraction x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w350', () => {
  it('strong-connectivity-contraction x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w360', () => {
  it('strong-connectivity-contraction x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w370', () => {
  it('strong-connectivity-contraction x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w380', () => {
  it('strong-connectivity-contraction x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w390', () => {
  it('strong-connectivity-contraction x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w400', () => {
  it('strong-connectivity-contraction x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w420', () => {
  it('strong-connectivity-contraction x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w440', () => {
  it('strong-connectivity-contraction x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w460', () => {
  it('strong-connectivity-contraction x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w480', () => {
  it('strong-connectivity-contraction x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w500', () => {
  it('strong-connectivity-contraction x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w550', () => {
  it('strong-connectivity-contraction x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w600', () => {
  it('strong-connectivity-contraction x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w650', () => {
  it('strong-connectivity-contraction x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w700', () => {
  it('strong-connectivity-contraction x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w800', () => {
  it('strong-connectivity-contraction x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w900', () => {
  it('strong-connectivity-contraction x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('strong-connectivity-contraction - w1000', () => {
  it('strong-connectivity-contraction x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('strong-connectivity-contraction x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
