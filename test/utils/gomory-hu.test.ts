import { describe, expect, it } from 'vitest'
import { GomoryHu } from '../../src/utils/gomory-hu.js'

describe('GomoryHu', () => {
  it('handles single edge', () => {
    const gh = new GomoryHu(2)
    gh.addEdge(0, 1, 5)
    const cuts = gh.allPairsMinCut()
    expect(cuts[0]![1]).toBe(5)
    expect(cuts[1]![0]).toBe(5)
  })

  it('handles triangle', () => {
    const gh = new GomoryHu(3)
    gh.addEdge(0, 1, 2)
    gh.addEdge(1, 2, 3)
    gh.addEdge(0, 2, 4)
    const cuts = gh.allPairsMinCut()
    expect(cuts[0]![1]).toBe(5)
    expect(cuts[0]![2]).toBe(6)
    expect(cuts[1]![2]).toBe(5)
  })

  it('handles path', () => {
    const gh = new GomoryHu(3)
    gh.addEdge(0, 1, 5)
    gh.addEdge(1, 2, 3)
    const cuts = gh.allPairsMinCut()
    expect(cuts[0]![1]).toBe(5)
    expect(cuts[1]![2]).toBe(3)
    expect(cuts[0]![2]).toBe(3)
  })

  it('handles single node', () => {
    const gh = new GomoryHu(1)
    const cuts = gh.allPairsMinCut()
    expect(cuts[0]![0]).toBe(0)
  })

  it('handles two nodes no edge', () => {
    const gh = new GomoryHu(2)
    const cuts = gh.allPairsMinCut()
    expect(cuts[0]![1]).toBe(0)
  })

  it('builds min cut values', () => {
    const gh = new GomoryHu(4)
    gh.addEdge(0, 1, 10)
    gh.addEdge(1, 2, 3)
    gh.addEdge(2, 3, 10)
    expect(gh.minCut(0, 1)).toBe(10)
    expect(gh.minCut(1, 2)).toBe(3)
    expect(gh.minCut(0, 3)).toBe(3)
  })

  it('handles star graph', () => {
    const gh = new GomoryHu(4)
    gh.addEdge(0, 1, 5)
    gh.addEdge(0, 2, 5)
    gh.addEdge(0, 3, 5)
    const cuts = gh.allPairsMinCut()
    expect(cuts[0]![1]).toBe(5)
    expect(cuts[1]![2]).toBe(5)
  })

  it('handles disconnected', () => {
    const gh = new GomoryHu(4)
    gh.addEdge(0, 1, 5)
    gh.addEdge(2, 3, 5)
    const cuts = gh.allPairsMinCut()
    expect(cuts[0]![1]).toBe(5)
    expect(cuts[0]![2]).toBe(0)
  })

  it('handles diamond', () => {
    const gh = new GomoryHu(4)
    gh.addEdge(0, 1, 3)
    gh.addEdge(0, 2, 3)
    gh.addEdge(1, 3, 3)
    gh.addEdge(2, 3, 3)
    const cuts = gh.allPairsMinCut()
    expect(cuts[0]![3]).toBe(6)
  })

  it('handles parallel edges', () => {
    const gh = new GomoryHu(2)
    gh.addEdge(0, 1, 3)
    gh.addEdge(0, 1, 4)
    const cuts = gh.allPairsMinCut()
    expect(cuts[0]![1]).toBe(7)
  })

  it('handles larger graph', () => {
    const gh = new GomoryHu(5)
    gh.addEdge(0, 1, 10)
    gh.addEdge(1, 2, 5)
    gh.addEdge(2, 3, 8)
    gh.addEdge(3, 4, 3)
    expect(gh.minCut(0, 4)).toBe(3)
  })

  it('handles single edge', () => {
    const gh = new GomoryHu(2)
    gh.addEdge(0, 1, 7)
    expect(gh.minCut(0, 1)).toBe(7)
  })

  it('same node cut is zero', () => {
    const gh = new GomoryHu(3)
    gh.addEdge(0, 1, 5)
    gh.addEdge(1, 2, 3)
    expect(gh.minCut(0, 0)).toBe(0)
  })

  it('handles single node', () => {
    const gh = new GomoryHu(1)
    expect(gh.minCut(0, 0)).toBe(0)
  })

  it('handles triangle graph', () => {
    const gh = new GomoryHu(3)
    gh.addEdge(0, 1, 5)
    gh.addEdge(1, 2, 5)
    gh.addEdge(0, 2, 5)
    const cuts = gh.allPairsMinCut()
    expect(cuts[0]![1]).toBe(10)
  })

  it('handles disconnected nodes', () => {
    const gh = new GomoryHu(3)
    gh.addEdge(0, 1, 5)
    expect(gh.minCut(0, 2)).toBe(0)
  })

  it('handles star graph', () => {
    const gh = new GomoryHu(4)
    gh.addEdge(0, 1, 3)
    gh.addEdge(0, 2, 5)
    gh.addEdge(0, 3, 7)
    expect(gh.minCut(1, 2)).toBe(3)
  })

  it('same node cut is zero', () => {
    const gh = new GomoryHu(3)
    gh.addEdge(0, 1, 5)
    expect(gh.minCut(0, 0)).toBe(0)
  })

  it('two node min cut equals edge weight', () => {
    const gh = new GomoryHu(2)
    gh.addEdge(0, 1, 10)
    expect(gh.minCut(0, 1)).toBe(10)
  })

  it('no edges has zero min cut', () => {
    const gh = new GomoryHu(3)
    expect(gh.minCut(0, 1)).toBe(0)
  })

  it('single edge min cut equals capacity', () => {
    const gh = new GomoryHu(2)
    gh.addEdge(0, 1, 5)
    expect(gh.minCut(0, 1)).toBe(5)
  })

  it('no edges yields zero min cut', () => {
    const gh = new GomoryHu(3)
    expect(gh.minCut(0, 1)).toBe(0)
  })

  it('single edge min cut equals weight', () => {
    const gh = new GomoryHu(2)
    gh.addEdge(0, 1, 5)
    expect(gh.minCut(0, 1)).toBe(5)
  })

  it('no edges gives zero min cut', () => {
    const gh = new GomoryHu(3)
    expect(gh.minCut(0, 1)).toBe(0)
  })

  it('toString returns correct format', () => {
    const gh = new GomoryHu(5)
    expect(gh.toString()).toBe('GomoryHu(5)')
  })

  it('toString for single node', () => {
    const gh = new GomoryHu(1)
    expect(gh.toString()).toBe('GomoryHu(1)')
  })

  it('toJSON returns structure with n and edges', () => {
    const gh = new GomoryHu(3)
    gh.addEdge(0, 1, 5)
    gh.addEdge(1, 2, 3)
    const json = gh.toJSON()
    expect(json).toHaveProperty('n', 3)
    expect(json).toHaveProperty('edges')
    expect(Array.isArray(json.edges)).toBe(true)
    expect(json.edges.length).toBe(3)
  })

  it('toJSON for empty graph', () => {
    const gh = new GomoryHu(2)
    const json = gh.toJSON()
    expect(json).toEqual({ n: 2, edges: [[], []] })
  })

  it('clone creates independent copy', () => {
    const gh1 = new GomoryHu(3)
    gh1.addEdge(0, 1, 5)
    gh1.addEdge(1, 2, 3)
    const gh2 = gh1.clone()
    gh2.addEdge(0, 2, 7)
    expect(gh1.minCut(0, 2)).toBe(3)
    expect(gh2.minCut(0, 2)).toBe(10)
  })

  it('clone preserves all edges', () => {
    const gh1 = new GomoryHu(3)
    gh1.addEdge(0, 1, 5)
    gh1.addEdge(1, 2, 3)
    gh1.addEdge(0, 2, 7)
    const gh2 = gh1.clone()
    expect(gh2.allPairsMinCut()).toEqual(gh1.allPairsMinCut())
  })

  it('clone of empty graph', () => {
    const gh1 = new GomoryHu(2)
    const gh2 = gh1.clone()
    expect(gh2.allPairsMinCut()).toEqual(gh1.allPairsMinCut())
  })

  it('clone of single node', () => {
    const gh1 = new GomoryHu(1)
    const gh2 = gh1.clone()
    expect(gh2.allPairsMinCut()).toEqual(gh1.allPairsMinCut())
  })

  it('equals returns true for identical graphs', () => {
    const gh1 = new GomoryHu(3)
    gh1.addEdge(0, 1, 5)
    gh1.addEdge(1, 2, 3)
    const gh2 = new GomoryHu(3)
    gh2.addEdge(0, 1, 5)
    gh2.addEdge(1, 2, 3)
    expect(gh1.equals(gh2)).toBe(true)
  })

  it('equals returns false for different node count', () => {
    const gh1 = new GomoryHu(2)
    gh1.addEdge(0, 1, 5)
    const gh2 = new GomoryHu(3)
    gh2.addEdge(0, 1, 5)
    expect(gh1.equals(gh2)).toBe(false)
  })

  it('equals returns false for different edge weights', () => {
    const gh1 = new GomoryHu(2)
    gh1.addEdge(0, 1, 5)
    const gh2 = new GomoryHu(2)
    gh2.addEdge(0, 1, 3)
    expect(gh1.equals(gh2)).toBe(false)
  })

  it('equals returns false for missing edges', () => {
    const gh1 = new GomoryHu(3)
    gh1.addEdge(0, 1, 5)
    gh1.addEdge(1, 2, 3)
    const gh2 = new GomoryHu(3)
    gh2.addEdge(0, 1, 5)
    expect(gh1.equals(gh2)).toBe(false)
  })

  it('equals returns false for non-GomoryHu object', () => {
    const gh = new GomoryHu(2)
    expect(gh.equals({})).toBe(false)
    expect(gh.equals(null)).toBe(false)
    expect(gh.equals(undefined)).toBe(false)
  })

  it('equals handles parallel edges', () => {
    const gh1 = new GomoryHu(2)
    gh1.addEdge(0, 1, 3)
    gh1.addEdge(0, 1, 4)
    const gh2 = new GomoryHu(2)
    gh2.addEdge(0, 1, 3)
    gh2.addEdge(0, 1, 4)
    expect(gh1.equals(gh2)).toBe(true)
  })

  it('equals is independent of edge insertion order', () => {
    const gh1 = new GomoryHu(3)
    gh1.addEdge(0, 1, 5)
    gh1.addEdge(1, 2, 3)
    gh1.addEdge(0, 2, 7)
    const gh2 = new GomoryHu(3)
    gh2.addEdge(0, 2, 7)
    gh2.addEdge(0, 1, 5)
    gh2.addEdge(1, 2, 3)
    expect(gh1.equals(gh2)).toBe(true)
  })
})
