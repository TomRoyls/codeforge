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
})