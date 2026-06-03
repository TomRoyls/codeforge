import { describe, expect, it } from 'vitest'
import { SCCTarjan } from '../../src/utils/scc-tarjan.js'

describe('SCCTarjan', () => {
  it('finds SCCs in simple cycle', () => {
    const scc = new SCCTarjan(3)
    scc.addEdge(0, 1)
    scc.addEdge(1, 2)
    scc.addEdge(2, 0)
    const comps = scc.solve()
    expect(comps.length).toBe(1)
    expect(comps[0]!.sort()).toEqual([0, 1, 2])
  })

  it('finds SCCs in DAG', () => {
    const scc = new SCCTarjan(3)
    scc.addEdge(0, 1)
    scc.addEdge(1, 2)
    const comps = scc.solve()
    expect(comps.length).toBe(3)
  })

  it('handles single node', () => {
    const scc = new SCCTarjan(1)
    const comps = scc.solve()
    expect(comps.length).toBe(1)
    expect(comps[0]).toEqual([0])
  })

  it('handles disconnected graph', () => {
    const scc = new SCCTarjan(4)
    scc.addEdge(0, 1)
    scc.addEdge(2, 3)
    const comps = scc.solve()
    expect(comps.length).toBe(4)
  })

  it('finds two SCCs', () => {
    const scc = new SCCTarjan(4)
    scc.addEdge(0, 1)
    scc.addEdge(1, 0)
    scc.addEdge(2, 3)
    scc.addEdge(3, 2)
    const comps = scc.solve()
    expect(comps.length).toBe(2)
  })

  it('handles self loop', () => {
    const scc = new SCCTarjan(1)
    scc.addEdge(0, 0)
    const comps = scc.solve()
    expect(comps.length).toBe(1)
  })

  it('handles empty graph', () => {
    const scc = new SCCTarjan(3)
    const comps = scc.solve()
    expect(comps.length).toBe(3)
  })

  it('finds SCC in complex graph', () => {
    const scc = new SCCTarjan(5)
    scc.addEdge(0, 2)
    scc.addEdge(2, 1)
    scc.addEdge(1, 0)
    scc.addEdge(0, 3)
    scc.addEdge(3, 4)
    const comps = scc.solve()
    expect(comps.length).toBe(3)
  })

  it('handles linear chain', () => {
    const scc = new SCCTarjan(4)
    scc.addEdge(0, 1)
    scc.addEdge(1, 2)
    scc.addEdge(2, 3)
    const comps = scc.solve()
    expect(comps.length).toBe(4)
  })

  it('handles complete graph', () => {
    const scc = new SCCTarjan(3)
    scc.addEdge(0, 1)
    scc.addEdge(1, 0)
    scc.addEdge(1, 2)
    scc.addEdge(2, 1)
    scc.addEdge(0, 2)
    scc.addEdge(2, 0)
    const comps = scc.solve()
    expect(comps.length).toBe(1)
  })

  it('finds SCC in figure-eight graph', () => {
    const scc = new SCCTarjan(6)
    scc.addEdge(0, 1)
    scc.addEdge(1, 2)
    scc.addEdge(2, 0)
    scc.addEdge(2, 3)
    scc.addEdge(3, 4)
    scc.addEdge(4, 5)
    scc.addEdge(5, 3)
    const comps = scc.solve()
    expect(comps.length).toBe(2)
  })

  it('handles large DAG', () => {
    const scc = new SCCTarjan(10)
    for (let i = 0; i < 9; i++) scc.addEdge(i, i + 1)
    const comps = scc.solve()
    expect(comps.length).toBe(10)
  })

  it('handles single node', () => {
    const scc = new SCCTarjan(1)
    const comps = scc.solve()
    expect(comps.length).toBe(1)
  })

  it('handles two separate cycles', () => {
    const scc = new SCCTarjan(4)
    scc.addEdge(0, 1)
    scc.addEdge(1, 0)
    scc.addEdge(2, 3)
    scc.addEdge(3, 2)
    const comps = scc.solve()
    expect(comps.length).toBe(2)
  })

  it('handles cycle with tail', () => {
    const scc = new SCCTarjan(4)
    scc.addEdge(0, 1)
    scc.addEdge(1, 2)
    scc.addEdge(2, 1)
    scc.addEdge(2, 3)
    const comps = scc.solve()
    expect(comps.length).toBe(3)
  })

  it('handles self loop', () => {
    const scc = new SCCTarjan(2)
    scc.addEdge(0, 0)
    scc.addEdge(0, 1)
    const comps = scc.solve()
    expect(comps.length).toBe(2)
  })

  it('self-loop forms SCC', () => {
    const scc = new SCCTarjan(2)
    scc.addEdge(0, 0)
    scc.addEdge(0, 1)
    const comps = scc.solve()
    expect(comps.length).toBeGreaterThanOrEqual(1)
  })

  it('two nodes no edges gives two components', () => {
    const scc = new SCCTarjan(2)
    const comps = scc.solve()
    expect(comps.length).toBe(2)
  })

  it('single node has one component', () => {
    const scc = new SCCTarjan(1)
    const comps = scc.solve()
    expect(comps.length).toBe(1)
    expect(comps[0]).toEqual([0])
  })

  it('two separate nodes have two SCCs', () => {
    const scc = new SCCTarjan(2)
    const comps = scc.solve()
    expect(comps.length).toBe(2)
  })

  it('self loop forms single component', () => {
    const scc = new SCCTarjan(1)
    scc.addEdge(0, 0)
    const comps = scc.solve()
    expect(comps.length).toBe(1)
  })

  it('no edges each node is own SCC', () => {
    const scc = new SCCTarjan(3)
    const comps = scc.solve()
    expect(comps.length).toBe(3)
  })
})
