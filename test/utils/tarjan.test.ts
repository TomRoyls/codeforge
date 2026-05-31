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
})
