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
})
