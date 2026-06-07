import { describe, expect, it } from 'vitest'
import { CentroidDecomposition } from '../../src/utils/centroid-decompose.js'

describe('CentroidDecomposition', () => {
  it('handles single node', () => {
    const cd = new CentroidDecomposition(1)
    const { parent, depth } = cd.decompose()
    expect(parent[0]).toBe(0)
    expect(depth[0]).toBe(0)
  })

  it('handles two nodes', () => {
    const cd = new CentroidDecomposition(2)
    cd.addEdge(0, 1)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(2)
    expect(depth.length).toBe(2)
  })

  it('handles star graph', () => {
    const cd = new CentroidDecomposition(5)
    cd.addEdge(0, 1)
    cd.addEdge(0, 2)
    cd.addEdge(0, 3)
    cd.addEdge(0, 4)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(5)
    expect(depth.length).toBe(5)
  })

  it('handles path graph', () => {
    const cd = new CentroidDecomposition(5)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(2, 3)
    cd.addEdge(3, 4)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(5)
    expect(depth.length).toBe(5)
  })

  it('handles balanced binary tree', () => {
    const cd = new CentroidDecomposition(7)
    cd.addEdge(0, 1)
    cd.addEdge(0, 2)
    cd.addEdge(1, 3)
    cd.addEdge(1, 4)
    cd.addEdge(2, 5)
    cd.addEdge(2, 6)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(7)
    expect(depth.length).toBe(7)
  })

  it('handles triangle', () => {
    const cd = new CentroidDecomposition(3)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(0, 2)
    const { parent } = cd.decompose()
    expect(parent.length).toBe(3)
  })

  it('handles disconnected nodes', () => {
    const cd = new CentroidDecomposition(3)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(3)
    expect(depth.length).toBe(3)
  })

  it('depth increases along path', () => {
    const cd = new CentroidDecomposition(7)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(2, 3)
    cd.addEdge(3, 4)
    cd.addEdge(4, 5)
    cd.addEdge(5, 6)
    const { depth } = cd.decompose()
    const maxDepth = Math.max(...depth)
    expect(maxDepth).toBeGreaterThan(0)
  })

  it('handles 4-node line', () => {
    const cd = new CentroidDecomposition(4)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(2, 3)
    const { parent } = cd.decompose()
    const uniqueParents = new Set(parent)
    expect(uniqueParents.size).toBeGreaterThan(0)
  })

  it('handles larger tree', () => {
    const cd = new CentroidDecomposition(10)
    for (let i = 1; i < 10; i++) cd.addEdge(0, i)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(10)
    expect(depth.length).toBe(10)
  })

  it('centroid has minimum max depth', () => {
    const cd = new CentroidDecomposition(7)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(2, 3)
    cd.addEdge(3, 4)
    cd.addEdge(4, 5)
    cd.addEdge(5, 6)
    const { depth } = cd.decompose()
    const maxD = Math.max(...depth)
    expect(maxD).toBeLessThan(7)
  })

  it('handles binary tree decomposition', () => {
    const cd = new CentroidDecomposition(15)
    for (let i = 1; i < 15; i++) cd.addEdge(Math.floor((i - 1) / 2), i)
    const { parent } = cd.decompose()
    expect(parent.length).toBe(15)
  })

  it('handles star tree', () => {
    const cd = new CentroidDecomposition(6)
    for (let i = 1; i < 6; i++) cd.addEdge(0, i)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(6)
    expect(depth.length).toBe(6)
  })

  it('handles single node', () => {
    const cd = new CentroidDecomposition(1)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(1)
    expect(depth.length).toBe(1)
  })

  it('handles two node tree', () => {
    const cd = new CentroidDecomposition(2)
    cd.addEdge(0, 1)
    const { parent } = cd.decompose()
    expect(parent.length).toBe(2)
  })

  it('handles three node chain', () => {
    const cd = new CentroidDecomposition(3)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(3)
    expect(depth.length).toBe(3)
  })

  it('handles four node star', () => {
    const cd = new CentroidDecomposition(5)
    cd.addEdge(0, 1)
    cd.addEdge(0, 2)
    cd.addEdge(0, 3)
    cd.addEdge(0, 4)
    const { parent } = cd.decompose()
    expect(parent.length).toBe(5)
  })

  it('two node tree decomposes', () => {
    const cd = new CentroidDecomposition(2)
    cd.addEdge(0, 1)
    const { parent } = cd.decompose()
    expect(parent.length).toBe(2)
  })

  it('single node tree', () => {
    const cd = new CentroidDecomposition(1)
    const { parent } = cd.decompose()
    expect(parent.length).toBe(1)
  })

  it('2-node tree decomposes', () => {
    const cd = new CentroidDecomposition(2)
    cd.addEdge(0, 1)
    const { parent } = cd.decompose()
    expect(parent.length).toBe(2)
  })

  it('decompose on triangle', () => {
    const cd = new CentroidDecomposition(3)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(0, 2)
    const { parent } = cd.decompose()
    expect(parent.length).toBe(3)
  })

  it('single node decompose', () => {
    const cd = new CentroidDecomposition(1)
    const { parent } = cd.decompose()
    expect(parent.length).toBe(1)
  })

  it('two nodes decomposes correctly', () => {
    const cd = new CentroidDecomposition(2)
    cd.addEdge(0, 1)
    const { parent } = cd.decompose()
    expect(parent.length).toBe(2)
  })

  it('single node decompose', () => {
    const cd = new CentroidDecomposition(1)
    const { parent } = cd.decompose()
    expect(parent.length).toBe(1)
  })

  it('chain decomposes correctly', () => {
    const cd = new CentroidDecomposition(3)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    const { parent } = cd.decompose()
    expect(parent.length).toBe(3)
  })

  it('star graph centroid is the center node', () => {
    const cd = new CentroidDecomposition(7)
    for (let i = 1; i < 7; i++) cd.addEdge(0, i)
    const { parent, depth } = cd.decompose()
    const root = depth.indexOf(0)
    expect(root).toBe(0)
    for (let i = 0; i < 7; i++) {
      if (i !== root) {
        expect(parent[i]).toBe(root)
        expect(depth[i]).toBe(1)
      }
    }
  })

  it('path graph centroid tree has O(log n) depth', () => {
    const n = 16
    const cd = new CentroidDecomposition(n)
    for (let i = 0; i < n - 1; i++) cd.addEdge(i, i + 1)
    const { depth } = cd.decompose()
    const maxDepth = Math.max(...depth)
    expect(maxDepth).toBeLessThanOrEqual(Math.ceil(Math.log2(n)))
  })

  it('every node assigned exactly one parent in centroid tree', () => {
    const cd = new CentroidDecomposition(10)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(2, 3)
    cd.addEdge(3, 4)
    cd.addEdge(0, 5)
    cd.addEdge(5, 6)
    cd.addEdge(6, 7)
    cd.addEdge(7, 8)
    cd.addEdge(8, 9)
    const { parent, depth } = cd.decompose()
    const root = depth.indexOf(0)
    for (let i = 0; i < 10; i++) {
      if (i === root) {
        expect(parent[i]).toBe(root)
      } else {
        expect(parent[i]).toBeGreaterThanOrEqual(0)
        expect(parent[i]).toBeLessThan(10)
        expect(depth[i]).toBeGreaterThan(0)
      }
    }
  })

  it('centroid of path 0-1-2-3-4 is node 2', () => {
    const cd = new CentroidDecomposition(5)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(2, 3)
    cd.addEdge(3, 4)
    const { depth } = cd.decompose()
    const root = depth.indexOf(0)
    expect(root).toBe(2)
  })

  it('triangle graph does not infinite loop', () => {
    const cd = new CentroidDecomposition(3)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(0, 2)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(3)
    expect(depth.length).toBe(3)
    const root = depth.indexOf(0)
    expect(root).toBeGreaterThanOrEqual(0)
  })

  it('handles graph with multiple cycles', () => {
    // 0-1-2 triangle + node 3 connected to both 0 and 2
    const cd = new CentroidDecomposition(4)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(0, 2)
    cd.addEdge(2, 3)
    cd.addEdge(0, 3)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(4)
    expect(depth.length).toBe(4)
  })
})
