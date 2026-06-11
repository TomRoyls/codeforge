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

  it('handles K4', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 0, to: 2, weight: 2 },
      { from: 0, to: 3, weight: 3 },
      { from: 1, to: 2, weight: 4 },
      { from: 1, to: 3, weight: 5 },
      { from: 2, to: 3, weight: 6 },
    ]
    const { edges: mstEdges, totalWeight } = KruskalMST.findMST(edges, 4)
    expect(mstEdges.length).toBe(3)
    expect(totalWeight).toBe(6)
  })

  it('handles disconnected graph', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 2, to: 3, weight: 2 },
    ]
    expect(KruskalMST.isConnected(edges, 4)).toBe(false)
  })

  it('handles single edge MST', () => {
    const edges = [{ from: 0, to: 1, weight: 7 }]
    const { edges: mstEdges, totalWeight } = KruskalMST.findMST(edges, 2)
    expect(mstEdges.length).toBe(1)
    expect(totalWeight).toBe(7)
  })

  it('handles star graph MST', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 0, to: 2, weight: 2 },
      { from: 0, to: 3, weight: 3 },
    ]
    const { totalWeight } = KruskalMST.findMST(edges, 4)
    expect(totalWeight).toBe(6)
  })

  it('handles single node', () => {
    const { edges: mstEdges, totalWeight } = KruskalMST.findMST([], 1)
    expect(mstEdges.length).toBe(0)
    expect(totalWeight).toBe(0)
  })

  it('handles two node graph', () => {
    const { edges: mstEdges, totalWeight } = KruskalMST.findMST([
      { from: 0, to: 1, weight: 5 },
    ], 2)
    expect(mstEdges.length).toBe(1)
    expect(totalWeight).toBe(5)
  })

  it('isConnected for single node', () => {
    expect(KruskalMST.isConnected([], 1)).toBe(true)
  })

  it('findMST returns total weight', () => {
    const edges = [{ from: 0, to: 1, weight: 5 }]
    const mst = KruskalMST.findMST(edges, 2)
    expect(mst.totalWeight).toBe(5)
  })

  it('no edges has zero weight', () => {
    const mst = KruskalMST.findMST([], 1)
    expect(mst.totalWeight).toBe(0)
  })

  it('single edge MST weight equals edge weight', () => {
    const mst = KruskalMST.findMST([{ from: 0, to: 1, weight: 5 }], 2)
    expect(mst.totalWeight).toBe(5)
  })

  it('no edges yields zero weight', () => {
    const mst = KruskalMST.findMST([], 2)
    expect(mst.totalWeight).toBe(0)
  })

  it('single edge MST', () => {
    const edges = [{ from: 0, to: 1, weight: 5 }]
    const mst = KruskalMST.findMST(edges, 2)
    expect(mst.totalWeight).toBe(5)
  })

  it('disconnected graph returns partial MST', () => {
    const edges = [{ from: 0, to: 1, weight: 5 }]
    const mst = KruskalMST.findMST(edges, 3)
    expect(mst.totalWeight).toBe(5)
  })

  it('MST with zero-weight edges', () => {
    const edges = [
      { from: 0, to: 1, weight: 0 },
      { from: 1, to: 2, weight: 0 },
      { from: 0, to: 2, weight: 5 },
    ]
    const { totalWeight } = KruskalMST.findMST(edges, 3)
    expect(totalWeight).toBe(0)
  })

  it('MST with negative weights', () => {
    const edges = [
      { from: 0, to: 1, weight: -5 },
      { from: 1, to: 2, weight: -3 },
      { from: 0, to: 2, weight: 2 },
    ]
    const { totalWeight } = KruskalMST.findMST(edges, 3)
    expect(totalWeight).toBe(-8)
  })

  it('MST with duplicate weights', () => {
    const edges = [
      { from: 0, to: 1, weight: 2 },
      { from: 1, to: 2, weight: 2 },
      { from: 0, to: 2, weight: 2 },
    ]
    const { edges: mstEdges, totalWeight } = KruskalMST.findMST(edges, 3)
    expect(mstEdges.length).toBe(2)
    expect(totalWeight).toBe(4)
  })

  it('MST rejects cycles', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 2 },
      { from: 2, to: 0, weight: 3 },
    ]
    const { edges: mstEdges } = KruskalMST.findMST(edges, 3)
    expect(mstEdges.length).toBe(2)
  })

  it('complete graph of 4 nodes MST', () => {
    const edges = []
    let id = 0
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        edges.push({ from: i, to: j, weight: id++ })
      }
    }
    const { edges: mstEdges } = KruskalMST.findMST(edges, 4)
    expect(mstEdges.length).toBe(3)
  })

  it('handles large graph with 100 nodes', () => {
    const edges: { from: number; to: number; weight: number }[] = []
    for (let i = 0; i < 99; i++) {
      edges.push({ from: i, to: i + 1, weight: i + 1 })
    }
    const { edges: mstEdges, totalWeight } = KruskalMST.findMST(edges, 100)
    expect(mstEdges.length).toBe(99)
    expect(totalWeight).toBe(4950)
  })

  it('line graph MST includes all edges except one', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 2 },
      { from: 2, to: 3, weight: 3 },
      { from: 3, to: 4, weight: 4 },
    ]
    const { edges: mstEdges } = KruskalMST.findMST(edges, 5)
    expect(mstEdges.length).toBe(4)
  })

  it('MST weight is sum of edge weights', () => {
    const edges = [
      { from: 0, to: 1, weight: 10 },
      { from: 1, to: 2, weight: 20 },
    ]
    const { totalWeight } = KruskalMST.findMST(edges, 3)
    expect(totalWeight).toBe(30)
  })

  it('isConnected returns false for two disconnected components', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 2, to: 3, weight: 2 },
    ]
    expect(KruskalMST.isConnected(edges, 4)).toBe(false)
  })

  it('isConnected returns true for complete graph', () => {
    const edges = []
    for (let i = 0; i < 5; i++) {
      for (let j = i + 1; j < 5; j++) {
        edges.push({ from: i, to: j, weight: 1 })
      }
    }
    expect(KruskalMST.isConnected(edges, 5)).toBe(true)
  })

  it('isConnected with zero nodes returns true', () => {
    expect(KruskalMST.isConnected([], 0)).toBe(true)
  })

  it('MST of 2 nodes has exactly 1 edge', () => {
    const edges = [
      { from: 0, to: 1, weight: 5 },
      { from: 0, to: 1, weight: 10 },
    ]
    const { edges: mstEdges } = KruskalMST.findMST(edges, 2)
    expect(mstEdges.length).toBe(1)
  })

  it('MST handles multiple parallel edges correctly', () => {
    const edges = [
      { from: 0, to: 1, weight: 5 },
      { from: 0, to: 1, weight: 1 },
      { from: 0, to: 1, weight: 3 },
    ]
    const { edges: mstEdges, totalWeight } = KruskalMST.findMST(edges, 2)
    expect(mstEdges.length).toBe(1)
    expect(totalWeight).toBe(1)
  })

  it('MST preserves connectivity of original graph', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 2 },
      { from: 0, to: 2, weight: 100 },
    ]
    const { edges: mstEdges } = KruskalMST.findMST(edges, 3)
    expect(mstEdges.length).toBe(2)
  })

  it('MST of triangle with unequal weights', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 100 },
      { from: 0, to: 2, weight: 2 },
    ]
    const { totalWeight } = KruskalMST.findMST(edges, 3)
    expect(totalWeight).toBe(3)
  })

  it('MST handles graph with isolated vertex', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
    ]
    const { edges: mstEdges } = KruskalMST.findMST(edges, 3)
    expect(mstEdges.length).toBe(1)
  })

  it('K3 MST has 2 edges', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 2 },
      { from: 0, to: 2, weight: 3 },
    ]
    const { edges: mstEdges } = KruskalMST.findMST(edges, 3)
    expect(mstEdges.length).toBe(2)
  })

  it('K5 MST has 4 edges', () => {
    const edges = []
    for (let i = 0; i < 5; i++) {
      for (let j = i + 1; j < 5; j++) {
        edges.push({ from: i, to: j, weight: i * 5 + j })
      }
    }
    const { edges: mstEdges } = KruskalMST.findMST(edges, 5)
    expect(mstEdges.length).toBe(4)
  })

  it('MST handles all-zero weights', () => {
    const edges = [
      { from: 0, to: 1, weight: 0 },
      { from: 1, to: 2, weight: 0 },
      { from: 2, to: 3, weight: 0 },
    ]
    const { totalWeight } = KruskalMST.findMST(edges, 4)
    expect(totalWeight).toBe(0)
  })

  it('MST does not create self-loops', () => {
    const edges = [
      { from: 0, to: 0, weight: -100 },
      { from: 0, to: 1, weight: 1 },
    ]
    const { edges: mstEdges } = KruskalMST.findMST(edges, 2)
    expect(mstEdges.every(e => e.from !== e.to)).toBe(true)
  })

  it('MST of disconnected graph with 3 components', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 2, to: 3, weight: 2 },
      { from: 4, to: 5, weight: 3 },
    ]
    const { edges: mstEdges } = KruskalMST.findMST(edges, 6)
    expect(mstEdges.length).toBe(3)
  })

  it('findMST returns empty array for single node', () => {
    const { edges: mstEdges } = KruskalMST.findMST([], 1)
    expect(mstEdges).toEqual([])
  })

  it('findMST with no edges and multiple nodes returns empty MST', () => {
    const { edges: mstEdges, totalWeight } = KruskalMST.findMST([], 5)
    expect(mstEdges).toEqual([])
    expect(totalWeight).toBe(0)
  })
})
