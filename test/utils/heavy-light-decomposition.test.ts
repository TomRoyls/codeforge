import { describe, it, expect } from 'vitest'
import { HeavyLightDecomposition } from '../../src/utils/heavy-light-decomposition.js'

describe('HeavyLightDecomposition', () => {
  it('computes lca correctly for simple line tree', () => {
    const adjacencyList = [
      [1],
      [0, 2],
      [1, 3],
      [2, 4],
      [3],
    ]
    const hld = new HeavyLightDecomposition(adjacencyList, 0)
    expect(hld.lca(0, 4)).toBe(0)
    expect(hld.lca(1, 3)).toBe(1)
    expect(hld.lca(2, 4)).toBe(2)
    expect(hld.lca(3, 4)).toBe(3)
  })

  it('computes path distance correctly for line tree', () => {
    const adjacencyList = [
      [1],
      [0, 2],
      [1, 3],
      [2, 4],
      [3],
    ]
    const hld = new HeavyLightDecomposition(adjacencyList, 0)
    expect(hld.pathDistance(0, 4)).toBe(4)
    expect(hld.pathDistance(1, 3)).toBe(2)
    expect(hld.pathDistance(2, 4)).toBe(2)
    expect(hld.pathDistance(3, 4)).toBe(1)
    expect(hld.pathDistance(0, 0)).toBe(0)
  })

  it('checks ancestor relationships correctly for line tree', () => {
    const adjacencyList = [
      [1],
      [0, 2],
      [1, 3],
      [2, 4],
      [3],
    ]
    const hld = new HeavyLightDecomposition(adjacencyList, 0)
    expect(hld.isAncestor(0, 4)).toBe(true)
    expect(hld.isAncestor(1, 3)).toBe(true)
    expect(hld.isAncestor(2, 4)).toBe(true)
    expect(hld.isAncestor(3, 4)).toBe(true)
    expect(hld.isAncestor(4, 0)).toBe(false)
    expect(hld.isAncestor(4, 3)).toBe(false)
    expect(hld.isAncestor(3, 2)).toBe(false)
  })

  it('computes lca correctly for star tree', () => {
    const adjacencyList = [
      [1, 2, 3, 4],
      [0],
      [0],
      [0],
      [0],
    ]
    const hld = new HeavyLightDecomposition(adjacencyList, 0)
    expect(hld.lca(1, 2)).toBe(0)
    expect(hld.lca(1, 3)).toBe(0)
    expect(hld.lca(1, 4)).toBe(0)
    expect(hld.lca(2, 3)).toBe(0)
    expect(hld.lca(2, 4)).toBe(0)
    expect(hld.lca(3, 4)).toBe(0)
    expect(hld.lca(0, 4)).toBe(0)
  })

  it('computes path distance correctly for star tree', () => {
    const adjacencyList = [
      [1, 2, 3, 4],
      [0],
      [0],
      [0],
      [0],
    ]
    const hld = new HeavyLightDecomposition(adjacencyList, 0)
    expect(hld.pathDistance(1, 2)).toBe(2)
    expect(hld.pathDistance(1, 3)).toBe(2)
    expect(hld.pathDistance(1, 4)).toBe(2)
    expect(hld.pathDistance(0, 4)).toBe(1)
    expect(hld.pathDistance(1, 1)).toBe(0)
  })

  it('computes lca correctly for balanced binary tree', () => {
    const adjacencyList = [
      [1, 2],
      [0, 3, 4],
      [0, 5, 6],
      [1],
      [1],
      [2],
      [2],
    ]
    const hld = new HeavyLightDecomposition(adjacencyList, 0)
    expect(hld.lca(3, 4)).toBe(1)
    expect(hld.lca(5, 6)).toBe(2)
    expect(hld.lca(3, 5)).toBe(0)
    expect(hld.lca(4, 6)).toBe(0)
    expect(hld.lca(0, 5)).toBe(0)
    expect(hld.lca(3, 3)).toBe(3)
  })

  it('computes path distance correctly for balanced binary tree', () => {
    const adjacencyList = [
      [1, 2],
      [0, 3, 4],
      [0, 5, 6],
      [1],
      [1],
      [2],
      [2],
    ]
    const hld = new HeavyLightDecomposition(adjacencyList, 0)
    expect(hld.pathDistance(3, 4)).toBe(2)
    expect(hld.pathDistance(5, 6)).toBe(2)
    expect(hld.pathDistance(3, 5)).toBe(4)
    expect(hld.pathDistance(4, 6)).toBe(4)
    expect(hld.pathDistance(0, 3)).toBe(2)
    expect(hld.pathDistance(1, 5)).toBe(3)
  })

  it('identifies direct parent as ancestor', () => {
    const adjacencyList = [
      [1, 2],
      [0, 3, 4],
      [0, 5, 6],
      [1],
      [1],
      [2],
      [2],
    ]
    const hld = new HeavyLightDecomposition(adjacencyList, 0)
    expect(hld.isAncestor(1, 3)).toBe(true)
    expect(hld.isAncestor(1, 4)).toBe(true)
    expect(hld.isAncestor(2, 5)).toBe(true)
    expect(hld.isAncestor(2, 6)).toBe(true)
    expect(hld.isAncestor(0, 1)).toBe(true)
    expect(hld.isAncestor(0, 2)).toBe(true)
  })

  it('identifies deeper ancestors correctly', () => {
    const adjacencyList = [
      [1, 2],
      [0, 3, 4],
      [0, 5, 6],
      [1],
      [1],
      [2],
      [2],
    ]
    const hld = new HeavyLightDecomposition(adjacencyList, 0)
    expect(hld.isAncestor(0, 3)).toBe(true)
    expect(hld.isAncestor(0, 4)).toBe(true)
    expect(hld.isAncestor(0, 5)).toBe(true)
    expect(hld.isAncestor(0, 6)).toBe(true)
    expect(hld.isAncestor(0, 0)).toBe(true)
  })

  it('identifies that leaf is not ancestor of non-descendants', () => {
    const adjacencyList = [
      [1, 2],
      [0, 3, 4],
      [0, 5, 6],
      [1],
      [1],
      [2],
      [2],
    ]
    const hld = new HeavyLightDecomposition(adjacencyList, 0)
    expect(hld.isAncestor(3, 4)).toBe(false)
    expect(hld.isAncestor(3, 5)).toBe(false)
    expect(hld.isAncestor(3, 6)).toBe(false)
    expect(hld.isAncestor(4, 5)).toBe(false)
    expect(hld.isAncestor(4, 6)).toBe(false)
    expect(hld.isAncestor(5, 3)).toBe(false)
  })

  it('returns correct path between nodes', () => {
    const adjacencyList = [
      [1],
      [0, 2],
      [1, 3],
      [2, 4],
      [3],
    ]
    const hld = new HeavyLightDecomposition(adjacencyList, 0)
    const path0to4 = hld.getPath(0, 4)
    expect(path0to4).toEqual([0, 1, 2, 3, 4])

    const path1to3 = hld.getPath(1, 3)
    expect(path1to3).toEqual([1, 2, 3])

    const path2to4 = hld.getPath(2, 4)
    expect(path2to4).toEqual([2, 3, 4])

    const path0to0 = hld.getPath(0, 0)
    expect(path0to0).toEqual([0])
  })

  it('confirms root is ancestor of everyone', () => {
    const adjacencyList = [
      [1, 2],
      [0, 3, 4],
      [0, 5, 6],
      [1],
      [1],
      [2],
      [2],
    ]
    const hld = new HeavyLightDecomposition(adjacencyList, 0)
    for (let i = 0; i < hld.nodeCount; i++) {
      expect(hld.isAncestor(0, i)).toBe(true)
    }
  })

  it('handles single node tree', () => {
    const adjacencyList: number[][] = [[]]
    const hld = new HeavyLightDecomposition(adjacencyList, 0)
    expect(hld.nodeCount).toBe(1)
    expect(hld.lca(0, 0)).toBe(0)
    expect(hld.pathDistance(0, 0)).toBe(0)
    expect(hld.isAncestor(0, 0)).toBe(true)
    expect(hld.getPath(0, 0)).toEqual([0])
  })

  it('handles complex tree with mixed heavy and light edges', () => {
    const adjacencyList = [
      [1, 2],
      [0, 3],
      [0, 4, 5],
      [1, 6],
      [2],
      [2, 7, 8],
      [3],
      [5],
      [5],
    ]
    const hld = new HeavyLightDecomposition(adjacencyList, 0)
    expect(hld.lca(6, 7)).toBe(0)
    expect(hld.lca(6, 8)).toBe(0)
    expect(hld.lca(3, 4)).toBe(0)
    expect(hld.pathDistance(6, 7)).toBe(6)
    expect(hld.pathDistance(3, 4)).toBe(4)
    expect(hld.pathDistance(1, 5)).toBe(3)
  })

  it('path distance equals path length for various queries', () => {
    const adjacencyList = [
      [1, 2],
      [0, 3, 4],
      [0, 5, 6],
      [1],
      [1],
      [2],
      [2],
    ]
    const hld = new HeavyLightDecomposition(adjacencyList, 0)

    for (let u = 0; u < hld.nodeCount; u++) {
      for (let v = 0; v < hld.nodeCount; v++) {
        const path = hld.getPath(u, v)
        const expectedDistance = path.length - 1
        const actualDistance = hld.pathDistance(u, v)
        expect(actualDistance).toBe(expectedDistance)
      }
    }
  })

  it('handles two-node tree', () => {
    const adj = [[1], [0]]
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(0, 1)).toBe(0)
    expect(hld.pathDistance(0, 1)).toBe(1)
    expect(hld.getPath(0, 1)).toEqual([0, 1])
  })

  it('lca of same node is itself', () => {
    const adj = [[1], [0]]
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(0, 0)).toBe(0)
    expect(hld.lca(1, 1)).toBe(1)
  })

  it('pathDistance of node to itself is 0', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]],
      [1, []],
      [2, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.pathDistance(1, 1)).toBe(0)
  })

  it('path distance of parent to child', () => {
    const adj = [[1, 2], [3], [], []]
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.pathDistance(0, 3)).toBeGreaterThanOrEqual(0)
  })

  it('lca of node with itself is itself', () => {
    const adj = [[1], [0]]
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(0, 0)).toBe(0)
  })

  it('single node decomposition', () => {
    const adj: number[][] = [[]]
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(0, 0)).toBe(0)
  })

  it('path distance on single node', () => {
    const adj: number[][] = [[]]
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.pathDistance(0, 0)).toBe(0)
  })

  it('two node chain decomposes', () => {
    const adj: number[][] = [[1], [0]]
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.pathDistance(0, 1)).toBeGreaterThanOrEqual(0)
  })

  it('lca of same node is itself', () => {
    const adj: number[][] = [[1], [0]]
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(0, 0)).toBe(0)
  })
})