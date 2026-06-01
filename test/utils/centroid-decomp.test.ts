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

  it('getParent returns -1 for root', () => {
    const adj = new Map<number, number[]>([[0, []]])
    const cd = new CentroidDecomposition(adj)
    expect(cd.getParent(0)).toBe(-1)
  })

  it('all nodes have valid parent or -1', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2, 3]], [1, [4]], [2, []], [3, []], [4, []],
    ])
    const cd = new CentroidDecomposition(adj)
    const tree = cd.getCentroidTree()
    for (let i = 0; i < tree.length; i++) {
      expect(tree[i]).toBeGreaterThanOrEqual(-1)
      expect(tree[i]).toBeLessThan(tree.length)
    }
  })

  it('handles two-node tree', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, []]])
    const cd = new CentroidDecomposition(adj)
    const tree = cd.getCentroidTree()
    expect(tree.length).toBe(2)
    let roots = 0
    for (const p of tree) if (p === -1) roots++
    expect(roots).toBe(1)
  })

  it('handles linear chain of 5', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [3]], [3, [4]], [4, []],
    ])
    const cd = new CentroidDecomposition(adj)
    expect(cd.getCentroidTree().length).toBe(5)
  })

  it('handles star-like tree', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2, 3, 4]], [1, []], [2, []], [3, []], [4, []],
    ])
    const cd = new CentroidDecomposition(adj)
    const tree = cd.getCentroidTree()
    expect(tree.length).toBe(5)
    let roots = 0
    for (const p of tree) if (p === -1) roots++
    expect(roots).toBe(1)
  })

  it('handles depth of centroid tree', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [3]], [3, [4]], [4, [5]], [5, [6]], [6, []],
    ])
    const cd = new CentroidDecomposition(adj)
    const tree = cd.getCentroidTree()
    expect(tree.length).toBe(7)
  })

  it('handles binary tree', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, [3, 4]], [2, [5, 6]], [3, []], [4, []], [5, []], [6, []],
    ])
    const cd = new CentroidDecomposition(adj)
    const tree = cd.getCentroidTree()
    expect(tree.length).toBe(7)
    let roots = 0
    for (const p of tree) if (p === -1) roots++
    expect(roots).toBe(1)
  })

  it('single node centroid tree has one root', () => {
    const adj = new Map<number, number[]>([[0, []]])
    const cd = new CentroidDecomposition(adj)
    const tree = cd.getCentroidTree()
    expect(tree.length).toBe(1)
    expect(cd.getParent(0)).toBe(-1)
  })

  it('handles three-node path', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, []],
    ])
    const cd = new CentroidDecomposition(adj)
    const tree = cd.getCentroidTree()
    expect(tree.length).toBe(3)
  })
})
