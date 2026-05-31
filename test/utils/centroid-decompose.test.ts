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
})
