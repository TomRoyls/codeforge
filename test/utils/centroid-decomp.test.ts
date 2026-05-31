import { describe, expect, it } from 'vitest'
import { CentroidDecomposition } from '../../src/utils/centroid-decomp.js'

describe('CentroidDecomposition', () => {
  it('decomposes simple tree', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, []], [2, []],
    ])
    const cd = new CentroidDecomposition(adj)
    const tree = cd.getCentroidTree()
    expect(tree.length).toBe(3)
  })

  it('handles single node', () => {
    const adj = new Map<number, number[]>([[0, []]])
    const cd = new CentroidDecomposition(adj)
    expect(cd.getParent(0)).toBe(-1)
  })

  it('handles chain tree', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [3]], [3, []],
    ])
    const cd = new CentroidDecomposition(adj)
    const tree = cd.getCentroidTree()
    expect(tree.length).toBe(4)
  })

  it('centroid tree is a valid tree', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2, 3]], [1, []], [2, []], [3, []],
    ])
    const cd = new CentroidDecomposition(adj)
    const tree = cd.getCentroidTree()
    let roots = 0
    for (const p of tree) if (p === -1) roots++
    expect(roots).toBe(1)
  })

  it('handles star graph', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2, 3, 4]], [1, []], [2, []], [3, []], [4, []],
    ])
    const cd = new CentroidDecomposition(adj)
    const tree = cd.getCentroidTree()
    expect(tree[0]).toBe(-1)
  })

  it('handles deeper tree', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, [3, 4]], [2, [5, 6]], [3, []], [4, []], [5, []], [6, [],
    ]])
    const cd = new CentroidDecomposition(adj)
    expect(cd.getCentroidTree().length).toBe(7)
  })
})
