import { describe, expect, it } from 'vitest'
import { KosarajuSCC } from '../../src/utils/kosaraju.js'

describe('KosarajuSCC', () => {
  it('finds single SCC in cycle', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [0]],
    ])
    const sccs = KosarajuSCC.findSCCs(adj)
    expect(sccs.length).toBe(1)
    expect(sccs[0]!.sort()).toEqual([0, 1, 2])
  })

  it('finds all separate SCCs in DAG', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, []],
    ])
    expect(KosarajuSCC.findSCCs(adj).length).toBe(3)
  })

  it('handles single node', () => {
    const adj = new Map<number, number[]>([[0, []]])
    expect(KosarajuSCC.findSCCs(adj)).toEqual([[0]])
  })

  it('handles two separate cycles', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [0]], [2, [3]], [3, [2]],
    ])
    expect(KosarajuSCC.findSCCs(adj).length).toBe(2)
  })

  it('countSCCs works', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, []],
    ])
    expect(KosarajuSCC.countSCCs(adj)).toBe(3)
  })

  it('isStronglyConnected returns true for cycle', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [0]],
    ])
    expect(KosarajuSCC.isStronglyConnected(adj)).toBe(true)
  })

  it('isStronglyConnected returns false for DAG', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, []],
    ])
    expect(KosarajuSCC.isStronglyConnected(adj)).toBe(false)
  })

  it('condensation produces DAG', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [0]], [2, [3]], [3, [2]], [0, [2]],
    ])
    const dag = KosarajuSCC.condensation(adj)
    expect(dag.size).toBeGreaterThanOrEqual(2)
  })

  it('handles empty graph', () => {
    expect(KosarajuSCC.findSCCs(new Map())).toEqual([])
  })

  it('handles self-loop', () => {
    const adj = new Map<number, number[]>([[0, [0]]])
    const sccs = KosarajuSCC.findSCCs(adj)
    expect(sccs.length).toBe(1)
    expect(sccs[0]).toEqual([0])
  })

  it('handles disconnected nodes', () => {
    const adj = new Map<number, number[]>([
      [0, []], [1, []], [2, []],
    ])
    expect(KosarajuSCC.findSCCs(adj).length).toBe(3)
  })

  it('mixed SCC and disconnected', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [0]], [3, []],
    ])
    expect(KosarajuSCC.findSCCs(adj).length).toBe(2)
  })

  it('single node is own SCC', () => {
    const adj = new Map<number, number[]>([[0, []]])
    const sccs = KosarajuSCC.findSCCs(adj)
    expect(sccs.length).toBe(1)
    expect(sccs[0]).toEqual([0])
  })

  it('two separate SCCs with 2 nodes each', () => {
    const adj = new Map<number, number[]>(([
      [0, [1]], [1, [0]], [2, [3]], [3, [2]],
    ] as [number, number[]][]))
    const sccs = KosarajuSCC.findSCCs(adj)
    expect(sccs.length).toBe(2)
  })

  it('handles chain DAG each node own SCC', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, []],
    ])
    expect(KosarajuSCC.findSCCs(adj).length).toBe(3)
  })

  it('handles two nodes no edges', () => {
    const adj = new Map<number, number[]>([[0, []], [1, []]])
    expect(KosarajuSCC.findSCCs(adj).length).toBe(2)
  })
})
