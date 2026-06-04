import { describe, it, expect } from 'vitest'
import { BridgeFinder } from '../../src/utils/bridge-finder.js'

describe('BridgeFinder', () => {
  it('finds bridge in simple line graph', () => {
    const adj = [[1], [0, 2], [1, 3], [2]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(3)
    expect(bf.articulationPoints.length).toBe(2)
  })

  it('finds no bridges in cycle', () => {
    const adj = [[1, 3], [0, 2], [1, 3], [0, 2]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(0)
  })

  it('finds bridge in graph with cycle and bridge', () => {
    const adj = [[1, 2], [0, 2], [0, 1, 3], [2]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(1)
    expect(bf.bridges[0]).toEqual([2, 3])
    expect(bf.articulationPoints).toContain(2)
  })

  it('handles two nodes with single edge', () => {
    const adj = [[1], [0]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(1)
    expect(bf.bridges[0]).toEqual([0, 1])
  })

  it('handles single node', () => {
    const adj = [[]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(0)
    expect(bf.articulationPoints.length).toBe(0)
  })

  it('handles empty graph', () => {
    const adj: number[][] = []
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(0)
  })

  it('finds articulation point in star graph', () => {
    const adj = [[1, 2, 3], [0], [0], [0]]
    const bf = new BridgeFinder(adj)
    expect(bf.articulationPoints).toContain(0)
    expect(bf.articulationPoints.length).toBe(1)
  })

  it('handles disconnected graph', () => {
    const adj = [[1], [0], [3], [2]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(2)
  })

  it('handles two components one with bridge one without', () => {
    const adj = [[1], [0], [3, 4], [2, 4], [2, 3]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(1)
    expect(bf.bridges[0]).toEqual([0, 1])
  })

  it('finds all bridges in tree', () => {
    const adj: number[][] = [[1, 2], [0, 3, 4], [0], [1], [1]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(4)
  })

  it('no articulation points in simple cycle', () => {
    const adj = [[1, 4], [0, 2], [1, 3], [2, 4], [0, 3]]
    const bf = new BridgeFinder(adj)
    expect(bf.articulationPoints.length).toBe(0)
  })

  it('finds articulation point in hourglass graph', () => {
    const adj = [[1, 2], [0, 3], [0, 3], [1, 2]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(0)
  })

  it('handles triangle graph', () => {
    const adj = [[1, 2], [0, 2], [0, 1]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(0)
    expect(bf.articulationPoints.length).toBe(0)
  })

  it('handles complete graph K4', () => {
    const adj = [[1, 2, 3], [0, 2, 3], [0, 1, 3], [0, 1, 2]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(0)
    expect(bf.articulationPoints.length).toBe(0)
  })

  it('handles graph with isolated node', () => {
    const adj = [[1], [0], []]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(1)
    expect(bf.articulationPoints.length).toBe(0)
  })

  it('handles graph with two isolated edges', () => {
    const adj = [[1], [0], [3], [2]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(2)
  })

  it('handles star graph - center is articulation point', () => {
    const adj = [[1, 2, 3], [0], [0], [0]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(3)
    expect(bf.articulationPoints).toContain(0)
  })

  it('handles single edge', () => {
    const adj = [[1], [0]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(1)
  })

  it('handles path graph', () => {
    const adj = [[1], [0, 2], [1, 3], [2]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(3)
    expect(bf.articulationPoints.length).toBe(2)
  })

  it('single edge graph has one bridge', () => {
    const adj = [[1], [0]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(1)
  })

  it('triangle has no bridges', () => {
    const adj = [[1, 2], [0, 2], [0, 1]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(0)
  })

  it('chain has one bridge', () => {
    const adj = [[1], [0, 2], [1]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(2)
  })

  it('cycle has no bridges', () => {
    const adj = [[1], [0, 2], [1, 0]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(0)
  })

  it('single edge is a bridge', () => {
    const adj = [[1], [0]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(1)
  })

  it('triangle has no bridges', () => {
    const adj = [[1, 2], [0, 2], [0, 1]]
    const bf = new BridgeFinder(adj)
    expect(bf.bridges.length).toBe(0)
  })
})
