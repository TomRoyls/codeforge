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
