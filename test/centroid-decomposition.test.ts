import { describe, it, expect } from 'vitest'
import { CentroidDecomposition } from '../src/core/centroid-decomposition/centroid-decomposition.js'

// ─── Constructor ───

describe('CentroidDecomposition', () => {
  it('creates with n nodes', () => {
    const cd = new CentroidDecomposition(5)
    expect(cd.getSize()).toBe(5)
  })

  it('creates with 0 nodes', () => {
    const cd = new CentroidDecomposition(0)
    cd.build()
    expect(cd.getCentroid()).toBe(-1)
  })

  it('creates with 1 node', () => {
    const cd = new CentroidDecomposition(1)
    cd.build()
    expect(cd.getCentroid()).toBe(0)
    expect(cd.getSize()).toBe(1)
  })

  it('throws when querying before build', () => {
    const cd = new CentroidDecomposition(3)
    expect(() => cd.getCentroid()).toThrow('Must call build()')
  })

  // ─── Single node ───

  it('single node: depth is 0', () => {
    const cd = new CentroidDecomposition(1)
    cd.build()
    expect(cd.getDepth(0)).toBe(0)
    expect(cd.getParent(0)).toBe(-1)
    expect(cd.getSubtreeSize(0)).toBe(1)
    expect(cd.getLevel(0)).toBe(0)
    expect(cd.getChildren(0)).toEqual([])
  })

  // ─── Line graph ───

  it('line graph: 0-1-2-3', () => {
    const cd = new CentroidDecomposition(4)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(2, 3)
    cd.build()
    expect(cd.getSize()).toBe(4)
    expect(cd.getCentroid()).toBeGreaterThanOrEqual(0)
    expect(cd.getCentroid()).toBeLessThan(4)
  })

  it('line graph: centroid has children', () => {
    const cd = new CentroidDecomposition(4)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(2, 3)
    cd.build()
    const root = cd.getCentroid()
    expect(cd.getChildren(root).length).toBeGreaterThan(0)
  })

  it('line graph: all nodes reachable via toArray', () => {
    const cd = new CentroidDecomposition(4)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(2, 3)
    cd.build()
    const arr = cd.toArray()
    expect(arr.sort()).toEqual([0, 1, 2, 3])
  })

  // ─── Star graph ───

  it('star graph: 0 is center', () => {
    const cd = new CentroidDecomposition(5)
    cd.addEdge(0, 1)
    cd.addEdge(0, 2)
    cd.addEdge(0, 3)
    cd.addEdge(0, 4)
    cd.build()
    expect(cd.getCentroid()).toBe(0)
    expect(cd.getSubtreeSize(0)).toBe(5)
    expect(cd.getDepth(0)).toBe(0)
  })

  it('star graph: leaves have depth 1', () => {
    const cd = new CentroidDecomposition(5)
    cd.addEdge(0, 1)
    cd.addEdge(0, 2)
    cd.addEdge(0, 3)
    cd.addEdge(0, 4)
    cd.build()
    for (let i = 1; i <= 4; i++) {
      expect(cd.getDepth(i)).toBe(1)
      expect(cd.getParent(i)).toBe(0)
    }
  })

  // ─── Complete binary tree ───

  it('binary tree: 0-1, 0-2, 1-3, 1-4', () => {
    const cd = new CentroidDecomposition(5)
    cd.addEdge(0, 1)
    cd.addEdge(0, 2)
    cd.addEdge(1, 3)
    cd.addEdge(1, 4)
    cd.build()
    expect(cd.getSize()).toBe(5)
    const root = cd.getCentroid()
    expect(root).toBeGreaterThanOrEqual(0)
    expect(root).toBeLessThan(5)
    expect(cd.getSubtreeSize(root)).toBe(5)
  })

  it('binary tree: toArray returns all nodes', () => {
    const cd = new CentroidDecomposition(5)
    cd.addEdge(0, 1)
    cd.addEdge(0, 2)
    cd.addEdge(1, 3)
    cd.addEdge(1, 4)
    cd.build()
    expect(cd.toArray().sort()).toEqual([0, 1, 2, 3, 4])
  })

  // ─── Triangle ───

  it('triangle graph: 0-1, 1-2, 0-2', () => {
    const cd = new CentroidDecomposition(3)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(0, 2)
    cd.build()
    const root = cd.getCentroid()
    expect(cd.getSubtreeSize(root)).toBe(3)
  })

  // ─── getDistance ───

  it('distance in line graph', () => {
    const cd = new CentroidDecomposition(4)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(2, 3)
    cd.build()
    expect(cd.getDistance(0, 0)).toBe(0)
    expect(cd.getDistance(0, 1)).toBe(1)
    expect(cd.getDistance(0, 2)).toBe(2)
    expect(cd.getDistance(0, 3)).toBe(3)
    expect(cd.getDistance(1, 3)).toBe(2)
  })

  it('distance in star graph', () => {
    const cd = new CentroidDecomposition(5)
    cd.addEdge(0, 1)
    cd.addEdge(0, 2)
    cd.addEdge(0, 3)
    cd.addEdge(0, 4)
    cd.build()
    expect(cd.getDistance(1, 2)).toBe(2)
    expect(cd.getDistance(0, 3)).toBe(1)
  })

  it('distance is symmetric', () => {
    const cd = new CentroidDecomposition(5)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(2, 3)
    cd.addEdge(3, 4)
    cd.build()
    expect(cd.getDistance(0, 4)).toBe(cd.getDistance(4, 0))
    expect(cd.getDistance(1, 3)).toBe(cd.getDistance(3, 1))
  })

  // ─── getLCA ───

  it('LCA in star graph', () => {
    const cd = new CentroidDecomposition(5)
    cd.addEdge(0, 1)
    cd.addEdge(0, 2)
    cd.addEdge(0, 3)
    cd.addEdge(0, 4)
    cd.build()
    expect(cd.getLCA(1, 2)).toBe(0)
    expect(cd.getLCA(0, 3)).toBe(0)
  })

  it('LCA of node with itself', () => {
    const cd = new CentroidDecomposition(3)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.build()
    expect(cd.getLCA(0, 0)).toBe(0)
    expect(cd.getLCA(1, 1)).toBe(1)
  })

  // ─── getPath ───

  it('path from node to itself', () => {
    const cd = new CentroidDecomposition(3)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.build()
    expect(cd.getPath(1, 1)).toEqual([1])
  })

  it('path in line graph', () => {
    const cd = new CentroidDecomposition(4)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(2, 3)
    cd.build()
    const path = cd.getPath(0, 3)
    expect(path[0]).toBe(0)
    expect(path[path.length - 1]).toBe(3)
    expect(path.length).toBe(4)
  })

  // ─── isInSameComponent ───

  it('all nodes in same component for connected graph', () => {
    const cd = new CentroidDecomposition(4)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(2, 3)
    cd.build()
    expect(cd.isInSameComponent(0, 3)).toBe(true)
    expect(cd.isInSameComponent(1, 2)).toBe(true)
  })

  // ─── clone ───

  it('clones the decomposition', () => {
    const cd = new CentroidDecomposition(4)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(2, 3)
    cd.build()
    const cl = cd.clone()
    expect(cl.getSize()).toBe(4)
    expect(cl.getCentroid()).toBe(cd.getCentroid())
  })

  it('clone before build', () => {
    const cd = new CentroidDecomposition(3)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    const cl = cd.clone()
    cl.build()
    expect(cl.getCentroid()).toBeGreaterThanOrEqual(0)
  })

  // ─── Larger graph ───

  it('handles 6-node line graph', () => {
    const cd = new CentroidDecomposition(6)
    for (let i = 0; i < 5; i++) cd.addEdge(i, i + 1)
    cd.build()
    expect(cd.getSize()).toBe(6)
    expect(cd.toArray().sort()).toEqual([0, 1, 2, 3, 4, 5])
    expect(cd.getDistance(0, 5)).toBe(5)
    expect(cd.getDistance(1, 4)).toBe(3)
  })

  it('handles balanced binary tree with 7 nodes', () => {
    const cd = new CentroidDecomposition(7)
    cd.addEdge(0, 1)
    cd.addEdge(0, 2)
    cd.addEdge(1, 3)
    cd.addEdge(1, 4)
    cd.addEdge(2, 5)
    cd.addEdge(2, 6)
    cd.build()
    expect(cd.getSize()).toBe(7)
    expect(cd.toArray().sort()).toEqual([0, 1, 2, 3, 4, 5, 6])
    expect(cd.getDistance(3, 6)).toBe(4)
    expect(cd.getDistance(0, 5)).toBe(2)
  })

  // ─── Level ───

  it('root has level 0', () => {
    const cd = new CentroidDecomposition(4)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(2, 3)
    cd.build()
    expect(cd.getLevel(cd.getCentroid())).toBe(0)
  })

  it('deeper nodes have higher levels', () => {
    const cd = new CentroidDecomposition(5)
    cd.addEdge(0, 1)
    cd.addEdge(0, 2)
    cd.addEdge(0, 3)
    cd.addEdge(0, 4)
    cd.build()
    for (let i = 1; i <= 4; i++) {
      expect(cd.getLevel(i)).toBeGreaterThanOrEqual(1)
    }
  })
})
