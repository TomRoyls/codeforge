import { describe, it, expect } from 'vitest'
import { EulerTour } from '../../src/utils/euler-tour.js'

describe('EulerTour', () => {
  it('generates tour for simple tree', () => {
    const adj = [[1, 2], [0], [0]]
    const et = new EulerTour(adj, 0)
    expect(et.tour.length).toBe(3)
    expect(et.first[0]).toBe(0)
  })

  it('computes correct first and last positions', () => {
    const adj = [[1, 2], [3], [], []]
    const et = new EulerTour(adj, 0)
    expect(et.first[0]).toBeLessThanOrEqual(et.first[1]!)
    expect(et.first[1]).toBeLessThanOrEqual(et.first[3]!)
    expect(et.last[3]).toBeLessThanOrEqual(et.last[1]!)
    expect(et.last[1]).toBeLessThanOrEqual(et.last[0]!)
  })

  it('computes correct depth', () => {
    const adj = [[1, 2], [3], [], []]
    const et = new EulerTour(adj, 0)
    expect(et.depth[0]).toBe(0)
    expect(et.depth[1]).toBe(1)
    expect(et.depth[3]).toBe(2)
    expect(et.depth[2]).toBe(1)
  })

  it('computes correct parent', () => {
    const adj = [[1, 2], [0], [0]]
    const et = new EulerTour(adj, 0)
    expect(et.parent[0]).toBe(-1)
    expect(et.parent[1]).toBe(0)
    expect(et.parent[2]).toBe(0)
  })

  it('detects ancestor relationship', () => {
    const adj = [[1, 2], [3], [], []]
    const et = new EulerTour(adj, 0)
    expect(et.isAncestor(0, 1)).toBe(true)
    expect(et.isAncestor(0, 3)).toBe(true)
    expect(et.isAncestor(1, 3)).toBe(true)
    expect(et.isAncestor(3, 0)).toBe(false)
    expect(et.isAncestor(2, 3)).toBe(false)
  })

  it('node is ancestor of itself', () => {
    const adj = [[1], [0]]
    const et = new EulerTour(adj, 0)
    expect(et.isAncestor(0, 0)).toBe(true)
    expect(et.isAncestor(1, 1)).toBe(true)
  })

  it('subtree range is correct', () => {
    const adj = [[1, 2], [0], [0]]
    const et = new EulerTour(adj, 0)
    const [lo, hi] = et.getSubtreeRange(0)
    expect(hi - lo + 1).toBe(3)
  })

  it('subtree size is correct', () => {
    const adj = [[1, 2], [3, 4], [], [], []]
    const et = new EulerTour(adj, 0)
    expect(et.getSubtreeSize(0)).toBe(5)
    expect(et.getSubtreeSize(1)).toBe(3)
    expect(et.getSubtreeSize(2)).toBe(1)
  })

  it('handles single node tree', () => {
    const adj = [[]]
    const et = new EulerTour(adj, 0)
    expect(et.tour).toEqual([0])
    expect(et.getSubtreeSize(0)).toBe(1)
  })

  it('handles linear chain', () => {
    const adj: number[][] = Array.from({ length: 5 }, () => [])
    for (let i = 0; i < 4; i++) adj[i]!.push(i + 1)
    const et = new EulerTour(adj, 0)
    expect(et.tour.length).toBe(5)
    expect(et.depth[4]).toBe(4)
  })

  it('getPath between parent and child', () => {
    const adj = [[1], [2], []]
    const et = new EulerTour(adj, 0)
    expect(et.getPath(0, 2)).toEqual([0, 1, 2])
  })

  it('getPath returns empty for disconnected nodes', () => {
    const et = new EulerTour([[], []], 0)
    expect(et.getPath(0, 1)).toEqual([])
  })

  it('handles binary tree', () => {
    const adj: number[][] = Array.from({ length: 7 }, () => [])
    adj[0] = [1, 2]
    adj[1] = [3, 4]
    adj[2] = [5, 6]
    const et = new EulerTour(adj, 0)
    expect(et.tour.length).toBe(7)
    expect(et.isAncestor(0, 6)).toBe(true)
    expect(et.isAncestor(1, 6)).toBe(false)
  })

  it('handles custom root', () => {
    const adj = [[1], [0, 2], [1]]
    const et = new EulerTour(adj, 1)
    expect(et.parent[1]).toBe(-1)
    expect(et.depth[1]).toBe(0)
    expect(et.depth[0]).toBe(1)
  })

  it('getPath for same node returns single element', () => {
    const adj = [[1], [0]]
    const et = new EulerTour(adj, 0)
    expect(et.getPath(0, 0)).toEqual([0])
  })

  it('getPath for direct child', () => {
    const adj = [[1, 2], [0], [0]]
    const et = new EulerTour(adj, 0)
    expect(et.getPath(0, 1)).toEqual([0, 1])
    expect(et.getPath(0, 2)).toEqual([0, 2])
  })

  it('handles single node', () => {
    const et = new EulerTour([[]], 0)
    expect(et.tour).toEqual([0])
    expect(et.depth[0]).toBe(0)
  })

  it('handles deep tree', () => {
    const adj: number[][] = Array.from({ length: 30 }, () => [])
    for (let i = 0; i < 29; i++) adj[i]!.push(i + 1)
    const et = new EulerTour(adj, 0)
    expect(et.depth[29]).toBe(29)
    expect(et.isAncestor(0, 29)).toBe(true)
    expect(et.getSubtreeSize(0)).toBe(30)
  })

  it('single node tour', () => {
    const adj = [[]]
    const et = new EulerTour(adj, 0)
    expect(et.isAncestor(0, 0)).toBe(true)
  })

  it('non-ancestor check', () => {
    const adj = [[1, 2], [], []]
    const et = new EulerTour(adj, 0)
    expect(et.isAncestor(1, 2)).toBe(false)
  })

  it('parent of root is itself', () => {
    const adj = [[1], []]
    const et = new EulerTour(adj, 0)
    expect(et.isAncestor(0, 0)).toBe(true)
  })
})
