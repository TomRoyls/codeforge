import { describe, expect, it } from 'vitest'
import { KruskalMST } from '../../src/utils/kruskal-mst.js'

describe('KruskalMST', () => {
  it('finds MST for simple graph', () => {
    const edges = [
      { from: 0, to: 1, weight: 4 },
      { from: 0, to: 2, weight: 3 },
      { from: 1, to: 2, weight: 1 },
      { from: 1, to: 3, weight: 2 },
      { from: 2, to: 3, weight: 5 },
    ]
    const { edges: mstEdges, totalWeight } = KruskalMST.findMST(edges, 4)
    expect(mstEdges.length).toBe(3)
    expect(totalWeight).toBe(6)
  })

  it('handles single edge', () => {
    const { edges: mstEdges, totalWeight } = KruskalMST.findMST([
      { from: 0, to: 1, weight: 5 },
    ], 2)
    expect(mstEdges.length).toBe(1)
    expect(totalWeight).toBe(5)
  })

  it('handles single node', () => {
    const { edges: mstEdges, totalWeight } = KruskalMST.findMST([], 1)
    expect(mstEdges.length).toBe(0)
    expect(totalWeight).toBe(0)
  })

  it('handles disconnected graph', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 2, to: 3, weight: 2 },
    ]
    const { edges: mstEdges } = KruskalMST.findMST(edges, 4)
    expect(mstEdges.length).toBeLessThan(3)
  })

  it('isConnected returns true for connected graph', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 2 },
    ]
    expect(KruskalMST.isConnected(edges, 3)).toBe(true)
  })

  it('isConnected returns false for disconnected graph', () => {
    const edges = [{ from: 0, to: 1, weight: 1 }]
    expect(KruskalMST.isConnected(edges, 4)).toBe(false)
  })

  it('isConnected returns true for single node', () => {
    expect(KruskalMST.isConnected([], 1)).toBe(true)
  })

  it('handles parallel edges', () => {
    const edges = [
      { from: 0, to: 1, weight: 10 },
      { from: 0, to: 1, weight: 1 },
    ]
    const { totalWeight } = KruskalMST.findMST(edges, 2)
    expect(totalWeight).toBe(1)
  })

  it('handles triangle graph', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 2 },
      { from: 0, to: 2, weight: 3 },
    ]
    const { edges: mstEdges, totalWeight } = KruskalMST.findMST(edges, 3)
    expect(mstEdges.length).toBe(2)
    expect(totalWeight).toBe(3)
  })

  it('handles large graph', () => {
    const edges: { from: number; to: number; weight: number }[] = []
    for (let i = 0; i < 10; i++) {
      edges.push({ from: i, to: i + 1, weight: 1 })
    }
    const { edges: mstEdges, totalWeight } = KruskalMST.findMST(edges, 11)
    expect(mstEdges.length).toBe(10)
    expect(totalWeight).toBe(10)
  })

  it('MST edges are subset of input edges', () => {
    const edges = [
      { from: 0, to: 1, weight: 4 },
      { from: 0, to: 2, weight: 3 },
      { from: 1, to: 2, weight: 1 },
    ]
    const { edges: mstEdges } = KruskalMST.findMST(edges, 3)
    for (const mstEdge of mstEdges) {
      const found = edges.some(e => e.from === mstEdge.from && e.to === mstEdge.to && e.weight === mstEdge.weight)
      expect(found).toBe(true)
    }
  })
})
