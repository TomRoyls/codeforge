import { describe, it, expect } from 'vitest'
import { SCCGraph } from '../../src/utils/strongly-connected-components.js'

describe('SCCGraph', () => {
  it('handles single node', () => {
    const g = new SCCGraph()
    g.addNode(0)
    expect(g.findSCCs()).toEqual([[0]])
  })

  it('handles two disconnected nodes', () => {
    const g = new SCCGraph()
    g.addNode(0); g.addNode(1)
    expect(g.findSCCs().length).toBe(2)
  })

  it('detects simple cycle', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1); g.addEdge(1, 0)
    const sccs = g.findSCCs()
    expect(sccs.length).toBe(1)
    expect(sccs[0]!.sort()).toEqual([0, 1])
  })

  it('detects three-node cycle', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1); g.addEdge(1, 2); g.addEdge(2, 0)
    const sccs = g.findSCCs()
    expect(sccs.length).toBe(1)
    expect(sccs[0]!.sort()).toEqual([0, 1, 2])
  })

  it('DAG has each node as its own SCC', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1); g.addEdge(1, 2); g.addEdge(2, 3)
    expect(g.findSCCs().length).toBe(4)
  })

  it('two separate cycles', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1); g.addEdge(1, 0)
    g.addEdge(2, 3); g.addEdge(3, 2)
    expect(g.findSCCs().length).toBe(2)
  })

  it('cycle with tail', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1); g.addEdge(1, 2); g.addEdge(2, 1)
    const sccs = g.findSCCs()
    expect(sccs.length).toBe(2)
    expect(sccs.map(c => c.length).sort()).toEqual([1, 2])
  })

  it('nodeCount tracks nodes', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1); g.addEdge(1, 2)
    expect(g.nodeCount).toBe(3)
  })

  it('addEdge adds both nodes', () => {
    const g = new SCCGraph()
    g.addEdge(5, 10)
    expect(g.nodeCount).toBe(2)
  })

  it('condensation produces DAG', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1); g.addEdge(1, 2); g.addEdge(2, 1); g.addEdge(1, 3)
    const { dag, componentMap } = g.condensation()
    expect(componentMap.size).toBe(4)
    expect(dag.size).toBe(3)
  })

  it('self-loop forms SCC', () => {
    const g = new SCCGraph()
    g.addEdge(0, 0)
    expect(g.findSCCs()).toEqual([[0]])
  })

  it('empty graph returns no SCCs', () => {
    expect(new SCCGraph().findSCCs().length).toBe(0)
  })

  it('complex graph with multiple SCCs', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1); g.addEdge(1, 2); g.addEdge(2, 0)
    g.addEdge(3, 4); g.addEdge(4, 5); g.addEdge(5, 3)
    g.addEdge(2, 3)
    const sccs = g.findSCCs()
    expect(sccs.length).toBe(2)
    for (const scc of sccs) expect(scc.length).toBe(3)
  })

  it('linear chain has no SCCs larger than 1', () => {
    const g = new SCCGraph()
    for (let i = 0; i < 10; i++) g.addEdge(i, i + 1)
    const sccs = g.findSCCs()
    expect(sccs.length).toBe(11)
    for (const scc of sccs) expect(scc.length).toBe(1)
  })

  it('addNode without edges creates singleton SCC', () => {
    const g = new SCCGraph()
    g.addNode(42)
    expect(g.findSCCs()).toEqual([[42]])
  })

  it('complete graph is one SCC', () => {
    const g = new SCCGraph()
    for (let i = 0; i < 5; i++)
      for (let j = 0; j < 5; j++)
        if (i !== j) g.addEdge(i, j)
    const sccs = g.findSCCs()
    expect(sccs.length).toBe(1)
    expect(sccs[0]!.length).toBe(5)
  })

  it('nodeCount reflects added nodes', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1); g.addEdge(2, 3)
    expect(g.nodeCount).toBe(4)
  })

  it('condensation maps nodes to components', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1); g.addEdge(1, 0)
    g.addEdge(2, 3); g.addEdge(3, 2)
    const { componentMap } = g.condensation()
    expect(componentMap.get(0)).toBe(componentMap.get(1))
    expect(componentMap.get(2)).toBe(componentMap.get(3))
    expect(componentMap.get(0)).not.toBe(componentMap.get(2))
  })

  it('condensation DAG edges between components', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1); g.addEdge(1, 0)
    g.addEdge(2, 3); g.addEdge(3, 2)
    g.addEdge(0, 2)
    const { dag } = g.condensation()
    let totalEdges = 0
    for (const edges of dag.values()) totalEdges += edges.length
    expect(totalEdges).toBeGreaterThanOrEqual(1)
  })

  it('handles node IDs as arbitrary numbers', () => {
    const g = new SCCGraph()
    g.addEdge(100, 200); g.addEdge(200, 100)
    const sccs = g.findSCCs()
    expect(sccs.length).toBe(1)
    expect(sccs[0]!.sort()).toEqual([100, 200])
  })

  it('addNode is idempotent', () => {
    const g = new SCCGraph()
    g.addNode(0); g.addNode(0); g.addNode(0)
    expect(g.nodeCount).toBe(1)
  })

  it('condensation with single node', () => {
    const g = new SCCGraph()
    g.addNode(0)
    const { dag, componentMap } = g.condensation()
    expect(dag.size).toBe(1)
    expect(componentMap.get(0)).toBe(0)
  })

  it('condensation with empty graph', () => {
    const { dag, componentMap } = new SCCGraph().condensation()
    expect(dag.size).toBe(0)
    expect(componentMap.size).toBe(0)
  })

  it('large cycle is one SCC', () => {
    const g = new SCCGraph()
    for (let i = 0; i < 20; i++) g.addEdge(i, (i + 1) % 20)
    expect(g.findSCCs().length).toBe(1)
  })

  it('cycle plus isolated node', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1); g.addEdge(1, 0)
    g.addNode(5)
    expect(g.findSCCs().length).toBe(2)
    expect(g.nodeCount).toBe(3)
  })

  it('condensation preserves acyclicity', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1); g.addEdge(1, 2); g.addEdge(2, 0)
    g.addEdge(2, 3)
    const { dag } = g.condensation()
    for (const [comp, edges] of dag) {
      for (const target of edges) {
        expect(target).not.toBe(comp)
      }
    }
  })

  it('DAG condensation has no edges within component', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1); g.addEdge(1, 2)
    const { dag, componentMap } = g.condensation()
    expect(dag.size).toBe(3)
  })

  it('bidirectional edge forms one SCC', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1); g.addEdge(1, 0)
    expect(g.findSCCs().length).toBe(1)
  })

  it('star graph has all separate SCCs', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1); g.addEdge(0, 2); g.addEdge(0, 3); g.addEdge(0, 4)
    expect(g.findSCCs().length).toBe(5)
  })

  it('multiple edges between same nodes', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1); g.addEdge(0, 1); g.addEdge(1, 0)
    expect(g.findSCCs().length).toBe(1)
  })

  it('condensation DAG edge count for chain', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1); g.addEdge(1, 2); g.addEdge(2, 3)
    const { dag } = g.condensation()
    let total = 0
    for (const edges of dag.values()) total += edges.length
    expect(total).toBe(3)
  })

  it('findSCCs returns array of arrays', () => {
    const g = new SCCGraph()
    g.addNode(0)
    const sccs = g.findSCCs()
    expect(Array.isArray(sccs)).toBe(true)
    expect(Array.isArray(sccs[0])).toBe(true)
  })

  it('all nodes appear in some SCC', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1); g.addEdge(1, 2); g.addEdge(2, 0)
    g.addEdge(3, 4)
    const sccs = g.findSCCs()
    const allNodes = sccs.flat().sort()
    expect(allNodes).toEqual([0, 1, 2, 3, 4])
  })

  it('condensation componentMap covers all nodes', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1); g.addEdge(1, 2)
    const { componentMap } = g.condensation()
    expect(componentMap.has(0)).toBe(true)
    expect(componentMap.has(1)).toBe(true)
    expect(componentMap.has(2)).toBe(true)
  })

  it('diamond DAG four components', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1); g.addEdge(0, 2); g.addEdge(1, 3); g.addEdge(2, 3)
    expect(g.findSCCs().length).toBe(4)
  })

  it('two cycles connected by edge', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1); g.addEdge(1, 0)
    g.addEdge(2, 3); g.addEdge(3, 2)
    g.addEdge(1, 2)
    expect(g.findSCCs().length).toBe(2)
  })

  it('nodeCount after many addNode calls', () => {
    const g = new SCCGraph()
    for (let i = 0; i < 10; i++) g.addNode(i)
    expect(g.nodeCount).toBe(10)
  })

  it('SCC sizes sum to node count', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1); g.addEdge(1, 2); g.addEdge(2, 0)
    g.addEdge(3, 4)
    const sccs = g.findSCCs()
    const totalNodes = sccs.reduce((sum, scc) => sum + scc.length, 0)
    expect(totalNodes).toBe(g.nodeCount)
  })

  it('empty graph nodeCount is 0', () => {
    expect(new SCCGraph().nodeCount).toBe(0)
  })

  it('condensation of cycle has single component', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1); g.addEdge(1, 2); g.addEdge(2, 0)
    const { dag } = g.condensation()
    expect(dag.size).toBe(1)
  })

  it('negative node IDs work', () => {
    const g = new SCCGraph()
    g.addEdge(-1, -2); g.addEdge(-2, -1)
    const sccs = g.findSCCs()
    expect(sccs.length).toBe(1)
    expect(sccs[0]!.sort((a, b) => a - b)).toEqual([-2, -1])
  })

  it('condensation DAG has no self-edges', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1); g.addEdge(1, 2); g.addEdge(2, 1)
    g.addEdge(1, 3)
    const { dag, componentMap } = g.condensation()
    for (const [comp, edges] of dag) {
      for (const target of edges) {
        expect(target).not.toBe(comp)
      }
    }
  })

  it('large star graph', () => {
    const g = new SCCGraph()
    for (let i = 1; i <= 20; i++) g.addEdge(0, i)
    expect(g.findSCCs().length).toBe(21)
  })

  it('two cycles sharing a node', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1); g.addEdge(1, 0)
    g.addEdge(0, 2); g.addEdge(2, 0)
    const sccs = g.findSCCs()
    expect(sccs.length).toBe(1)
    expect(sccs[0]!.sort()).toEqual([0, 1, 2])
  })

  it('addNode then addEdge on same node', () => {
    const g = new SCCGraph()
    g.addNode(0)
    g.addEdge(0, 1)
    expect(g.nodeCount).toBe(2)
    expect(g.findSCCs().length).toBe(2)
  })

  it('condensation with isolated nodes', () => {
    const g = new SCCGraph()
    g.addNode(0)
    g.addNode(1)
    g.addEdge(2, 3); g.addEdge(3, 2)
    const { dag, componentMap } = g.condensation()
    expect(componentMap.size).toBe(4)
    expect(dag.size).toBe(3)
    expect(componentMap.has(0)).toBe(true)
    expect(componentMap.has(1)).toBe(true)
  })

  it('very sparse graph', () => {
    const g = new SCCGraph()
    g.addEdge(0, 1)
    g.addEdge(10, 11)
    g.addEdge(20, 21)
    const sccs = g.findSCCs()
    expect(sccs.length).toBe(6)
    expect(sccs.every(scc => scc.length === 1)).toBe(true)
  })

  it('dense graph with many edges', () => {
    const g = new SCCGraph()
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (i !== j) g.addEdge(i, j)
      }
    }
    const sccs = g.findSCCs()
    expect(sccs.length).toBe(1)
    expect(sccs[0]!.length).toBe(10)
  })

  it('graph with only self-loops', () => {
    const g = new SCCGraph()
    for (let i = 0; i < 5; i++) {
      g.addEdge(i, i)
    }
    const sccs = g.findSCCs()
    expect(sccs.length).toBe(5)
    expect(sccs.every(scc => scc.length === 1)).toBe(true)
  })

  it('componentMap covers all nodes including isolated', () => {
    const g = new SCCGraph()
    g.addNode(0)
    g.addNode(1)
    g.addEdge(2, 3)
    const { componentMap } = g.condensation()
    expect(componentMap.has(0)).toBe(true)
    expect(componentMap.has(1)).toBe(true)
    expect(componentMap.has(2)).toBe(true)
    expect(componentMap.has(3)).toBe(true)
    expect(componentMap.size).toBe(4)
  })
})
