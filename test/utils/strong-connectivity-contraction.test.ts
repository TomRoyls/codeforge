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

  it('contracts to single component', () => {
    const scc = new StrongConnectivityContraction(3)
    scc.addEdge(0, 1)
    scc.addEdge(1, 2)
    scc.addEdge(2, 0)
    const { componentCount } = scc.contract()
    expect(componentCount).toBe(1)
  })

  it('contracts DAG to 3 components', () => {
    const scc = new StrongConnectivityContraction(3)
    scc.addEdge(0, 1)
    scc.addEdge(1, 2)
    const { componentCount } = scc.contract()
    expect(componentCount).toBe(3)
  })

  it('partial cycle', () => {
    const scc = new StrongConnectivityContraction(4)
    scc.addEdge(0, 1)
    scc.addEdge(1, 2)
    scc.addEdge(2, 0)
    scc.addEdge(2, 3)
    const { componentCount } = scc.contract()
    expect(componentCount).toBe(2)
  })

  it('DAG edges in contraction', () => {
    const scc = new StrongConnectivityContraction(3)
    scc.addEdge(0, 1)
    scc.addEdge(1, 2)
    const { dag } = scc.contract()
    expect(dag.length).toBe(3)
  })

  it('isolated nodes are separate components', () => {
    const scc = new StrongConnectivityContraction(3)
    const { componentCount } = scc.contract()
    expect(componentCount).toBe(3)
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
    const { dag } = scc.contract()
    const totalEdges = dag.reduce((sum, arr) => sum + arr.length, 0)
    expect(totalEdges).toBe(4)
  })

  it('handles two SCCs with edge between', () => {
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

  it('handles single node', () => {
    const scc = new StrongConnectivityContraction(1)
    const { componentCount } = scc.contract()
    expect(componentCount).toBe(1)
  })

  it('handles two nodes no edge', () => {
    const scc = new StrongConnectivityContraction(2)
    const { componentCount } = scc.contract()
    expect(componentCount).toBe(2)
  })

  it('handles complete graph is one component', () => {
    const scc = new StrongConnectivityContraction(3)
    scc.addEdge(0, 1)
    scc.addEdge(1, 0)
    scc.addEdge(1, 2)
    scc.addEdge(2, 1)
    scc.addEdge(0, 2)
    scc.addEdge(2, 0)
    const { componentCount } = scc.contract()
    expect(componentCount).toBe(1)
  })

  it('handles self loop is one component', () => {
    const scc = new StrongConnectivityContraction(2)
    scc.addEdge(0, 0)
    const { componentCount } = scc.contract()
    expect(componentCount).toBe(2)
  })

  it('disconnected nodes form separate components', () => {
    const scc = new StrongConnectivityContraction(3)
    const { componentCount } = scc.contract()
    expect(componentCount).toBe(3)
  })

  it('single node has one component', () => {
    const scc = new StrongConnectivityContraction(1)
    const { componentCount } = scc.contract()
    expect(componentCount).toBe(1)
  })

  it('two nodes with edge form one component', () => {
    const scc = new StrongConnectivityContraction(2)
    scc.addEdge(0, 1)
    scc.addEdge(1, 0)
    const { componentCount } = scc.contract()
    expect(componentCount).toBe(1)
  })

  it('two disconnected nodes have 2 components', () => {
    const scc = new StrongConnectivityContraction(2)
    const { componentCount } = scc.contract()
    expect(componentCount).toBe(2)
  })

  it('single node has one component', () => {
    const scc = new StrongConnectivityContraction(1)
    const { componentCount } = scc.contract()
    expect(componentCount).toBe(1)
  })

  it('two nodes with cycle have one component', () => {
    const scc = new StrongConnectivityContraction(2)
    scc.addEdge(0, 1)
    scc.addEdge(1, 0)
    const { componentCount } = scc.contract()
    expect(componentCount).toBe(1)
  })

  it('DAG has each node as own SCC', () => {
    const scc = new StrongConnectivityContraction(3)
    scc.addEdge(0, 1)
    scc.addEdge(1, 2)
    const { componentCount } = scc.contract()
    expect(componentCount).toBe(3)
  })

  it('single node is one component', () => {
    const scc = new StrongConnectivityContraction(1)
    const { componentCount } = scc.contract()
    expect(componentCount).toBe(1)
  })
})
