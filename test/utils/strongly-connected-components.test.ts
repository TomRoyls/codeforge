import { describe, it, expect } from 'vitest'
import { SCCGraph } from '../../src/utils/strongly-connected-components.js'

describe('SCCGraph', () => {
  it('handles single node', () => {
    const g = new SCCGraph()
    g.addNode(0)
    const sccs = g.findSCCs()
    expect(sccs.length).toBe(1)
    expect(sccs[0]).toEqual([0])
  })

  it('handles two disconnected nodes', () => {
    const g = new SCCGraph()
    g.addNode(0)
    g.addNode(1)
    const sccs = g.findSCCs()
    expect(sccs.length).toBe(2)
  })

  it('detects simple cycle', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1)
    g.addEdge(1, 0)
    const sccs = g.findSCCs()
    expect(sccs.length).toBe(1)
    expect(sccs[0]!.sort()).toEqual([0, 1])
  })

  it('detects three-node cycle', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1)
    g.addEdge(1, 2)
    g.addEdge(2, 0)
    const sccs = g.findSCCs()
    expect(sccs.length).toBe(1)
    expect(sccs[0]!.sort()).toEqual([0, 1, 2])
  })

  it('DAG has each node as its own SCC', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1)
    g.addEdge(1, 2)
    g.addEdge(2, 3)
    const sccs = g.findSCCs()
    expect(sccs.length).toBe(4)
  })

  it('two separate cycles', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1)
    g.addEdge(1, 0)
    g.addEdge(2, 3)
    g.addEdge(3, 2)
    const sccs = g.findSCCs()
    expect(sccs.length).toBe(2)
  })

  it('cycle with tail', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1)
    g.addEdge(1, 2)
    g.addEdge(2, 1)
    const sccs = g.findSCCs()
    expect(sccs.length).toBe(2)
    const sizes = sccs.map((c) => c.length).sort()
    expect(sizes).toEqual([1, 2])
  })

  it('nodeCount tracks nodes', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1)
    g.addEdge(1, 2)
    expect(g.nodeCount).toBe(3)
  })

  it('addEdge adds both nodes', () => {
    const g = new SCCGraph()
    g.addEdge(5, 10)
    expect(g.nodeCount).toBe(2)
  })

  it('condensation produces DAG', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1)
    g.addEdge(1, 2)
    g.addEdge(2, 1)
    g.addEdge(1, 3)
    const { dag, componentMap } = g.condensation()
    expect(componentMap.size).toBe(4)
    expect(dag.size).toBe(3)
  })

  it('self-loop forms SCC', () => {
    const g = new SCCGraph()
    g.addEdge(0, 0)
    const sccs = g.findSCCs()
    expect(sccs.length).toBe(1)
    expect(sccs[0]).toEqual([0])
  })

  it('empty graph returns no SCCs', () => {
    const g = new SCCGraph()
    const sccs = g.findSCCs()
    expect(sccs.length).toBe(0)
  })

  it('complex graph with multiple SCCs', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1)
    g.addEdge(1, 2)
    g.addEdge(2, 0)
    g.addEdge(3, 4)
    g.addEdge(4, 5)
    g.addEdge(5, 3)
    g.addEdge(2, 3)
    const sccs = g.findSCCs()
    expect(sccs.length).toBe(2)
    for (const scc of sccs) {
      expect(scc.length).toBe(3)
    }
  })

  it('linear chain has no SCCs larger than 1', () => {
    const g = new SCCGraph()
    for (let i = 0; i < 10; i++) {
      g.addEdge(i, i + 1)
    }
    const sccs = g.findSCCs()
    expect(sccs.length).toBe(11)
    for (const scc of sccs) {
      expect(scc.length).toBe(1)
    }
  })

  it('addNode without edges creates singleton SCC', () => {
    const g = new SCCGraph()
    g.addNode(42)
    const sccs = g.findSCCs()
    expect(sccs.length).toBe(1)
    expect(sccs[0]).toEqual([42])
  })

  it('complete graph is one SCC', () => {
    const g = new SCCGraph()
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (i !== j) g.addEdge(i, j)
      }
    }
    const sccs = g.findSCCs()
    expect(sccs.length).toBe(1)
    expect(sccs[0]!.length).toBe(5)
  })

  it('nodeCount reflects added nodes', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1)
    g.addEdge(2, 3)
    expect(g.nodeCount).toBe(4)
  })

  it('single edge creates two nodes', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1)
    expect(g.nodeCount).toBe(2)
  })

  it('SCC for cycle has single component', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1)
    g.addEdge(1, 0)
    const comps = g.findSCCs()
    expect(comps.length).toBe(1)
  })

  it('two disconnected nodes have 2 SCCs', () => {
    const g = new SCCGraph()
    g.addNode(0)
    g.addNode(1)
    const comps = g.findSCCs()
    expect(comps.length).toBe(2)
  })

  it('single node has one component', () => {
    const g = new SCCGraph()
    g.addNode(1)
    const comps = g.findSCCs()
    expect(comps.length).toBe(1)
  })

  it('two node cycle is one SCC', () => {
    const g = new SCCGraph()
    g.addNode(0)
    g.addNode(1)
    g.addEdge(0, 1)
    g.addEdge(1, 0)
    const comps = g.findSCCs()
    expect(comps.length).toBe(1)
  })
})
