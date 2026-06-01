import { describe, expect, it } from 'vitest'
import { BiconnectedComponents } from '../../src/utils/biconnected-components.js'

describe('BiconnectedComponents', () => {
  it('finds components in triangle', () => {
    const bc = new BiconnectedComponents(3)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    bc.addEdge(2, 0)
    const comps = bc.findComponents()
    expect(comps.length).toBe(1)
  })

  it('finds articulation point in bridge', () => {
    const bc = new BiconnectedComponents(3)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    const ap = bc.findArticulationPoints()
    expect(ap).toEqual([1])
  })

  it('handles single edge', () => {
    const bc = new BiconnectedComponents(2)
    bc.addEdge(0, 1)
    const comps = bc.findComponents()
    expect(comps.length).toBe(1)
  })

  it('handles single node', () => {
    const bc = new BiconnectedComponents(1)
    const comps = bc.findComponents()
    expect(comps.length).toBe(0)
  })

  it('no articulation point in cycle', () => {
    const bc = new BiconnectedComponents(4)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    bc.addEdge(2, 3)
    bc.addEdge(3, 0)
    expect(bc.findArticulationPoints()).toEqual([])
  })

  it('handles disconnected graph', () => {
    const bc = new BiconnectedComponents(4)
    bc.addEdge(0, 1)
    bc.addEdge(2, 3)
    const ap = bc.findArticulationPoints()
    expect(ap.length).toBe(0)
  })

  it('finds multiple articulation points', () => {
    const bc = new BiconnectedComponents(4)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    bc.addEdge(2, 3)
    const ap = bc.findArticulationPoints()
    expect(ap.sort()).toEqual([1, 2])
  })

  it('handles star graph', () => {
    const bc = new BiconnectedComponents(5)
    bc.addEdge(0, 1)
    bc.addEdge(0, 2)
    bc.addEdge(0, 3)
    bc.addEdge(0, 4)
    const ap = bc.findArticulationPoints()
    expect(ap).toEqual([0])
  })

  it('finds components in complex graph', () => {
    const bc = new BiconnectedComponents(5)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    bc.addEdge(2, 0)
    bc.addEdge(2, 3)
    bc.addEdge(3, 4)
    bc.addEdge(4, 2)
    const comps = bc.findComponents()
    expect(comps.length).toBe(2)
  })

  it('handles two triangles sharing vertex', () => {
    const bc = new BiconnectedComponents(5)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    bc.addEdge(2, 0)
    bc.addEdge(2, 3)
    bc.addEdge(3, 4)
    bc.addEdge(4, 2)
    const ap = bc.findArticulationPoints()
    expect(ap).toEqual([2])
  })

  it('handles K3 plus pendant', () => {
    const bc = new BiconnectedComponents(4)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    bc.addEdge(2, 0)
    bc.addEdge(2, 3)
    const ap = bc.findArticulationPoints()
    const comps = bc.findComponents()
    expect(ap).toContain(2)
    expect(comps.length).toBe(2)
  })

  it('handles two edges sharing node', () => {
    const bc = new BiconnectedComponents(3)
    bc.addEdge(0, 1)
    bc.addEdge(0, 2)
    const ap = bc.findArticulationPoints()
    expect(ap).toEqual([0])
  })

  it('handles K4 no articulation points', () => {
    const bc = new BiconnectedComponents(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        bc.addEdge(i, j)
    expect(bc.findArticulationPoints()).toEqual([])
  })

  it('handles isolated nodes', () => {
    const bc = new BiconnectedComponents(3)
    const ap = bc.findArticulationPoints()
    expect(ap).toEqual([])
  })

  it('handles single edge graph', () => {
    const bc = new BiconnectedComponents(2)
    bc.addEdge(0, 1)
    expect(bc.findArticulationPoints()).toEqual([])
    expect(bc.findComponents().length).toBe(1)
  })

  it('handles chain graph articulation', () => {
    const bc = new BiconnectedComponents(4)
    bc.addEdge(0, 1)
    bc.addEdge(1, 2)
    bc.addEdge(2, 3)
    const ap = bc.findArticulationPoints()
    expect(ap).toContain(1)
    expect(ap).toContain(2)
  })
})
