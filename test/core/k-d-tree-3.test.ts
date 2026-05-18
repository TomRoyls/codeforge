import { describe, it, expect } from 'vitest'
import { KDTree3 } from '../../src/core/k-d-tree-3/index.js'

describe('KDTree3', () => {
  // ─── Constructor ───
  it('builds from points', () => {
    const tree = new KDTree3([{ x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 6 }])
    expect(tree.size).toBe(3)
    expect(tree.isEmpty()).toBe(false)
  })

  it('builds from empty array', () => {
    const tree = new KDTree3([])
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('builds from single point', () => {
    const tree = new KDTree3([{ x: 1, y: 1 }])
    expect(tree.size).toBe(1)
    expect(tree.isEmpty()).toBe(false)
  })

  // ─── size / isEmpty ───
  it('reports correct size', () => {
    const tree = new KDTree3([{ x: 0, y: 0 }, { x: 1, y: 1 }])
    expect(tree.size).toBe(2)
  })

  // ─── toArray ───
  it('returns original points via toArray', () => {
    const pts = [{ x: 1, y: 2 }, { x: 3, y: 4 }]
    const tree = new KDTree3(pts)
    const arr = tree.toArray()
    expect(arr.length).toBe(2)
    expect(arr).toEqual(expect.arrayContaining(pts))
  })

  // ─── contains ───
  it('finds existing point via contains', () => {
    const tree = new KDTree3([{ x: 1, y: 2 }, { x: 3, y: 4 }])
    expect(tree.contains({ x: 1, y: 2 })).toBe(true)
    expect(tree.contains({ x: 3, y: 4 })).toBe(true)
  })

  it('returns false for non-existent point', () => {
    const tree = new KDTree3([{ x: 1, y: 2 }])
    expect(tree.contains({ x: 9, y: 9 })).toBe(false)
  })

  it('returns false on empty tree', () => {
    const tree = new KDTree3([])
    expect(tree.contains({ x: 0, y: 0 })).toBe(false)
  })

  // ─── nearestNeighbor ───
  it('finds nearest neighbor', () => {
    const tree = new KDTree3([
      { x: 0, y: 0 },
      { x: 5, y: 5 },
      { x: 10, y: 10 },
    ])
    const nn = tree.nearestNeighbor({ x: 1, y: 1 })
    expect(nn).toEqual({ x: 0, y: 0 })
  })

  it('returns undefined on empty tree', () => {
    const tree = new KDTree3([])
    expect(tree.nearestNeighbor({ x: 0, y: 0 })).toBeUndefined()
  })

  it('finds exact match as nearest', () => {
    const tree = new KDTree3([{ x: 3, y: 3 }, { x: 10, y: 10 }])
    expect(tree.nearestNeighbor({ x: 3, y: 3 })).toEqual({ x: 3, y: 3 })
  })

  it('finds nearest among many points', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 100, y: 100 },
      { x: 50, y: 50 },
      { x: 25, y: 25 },
    ]
    const tree = new KDTree3(pts)
    expect(tree.nearestNeighbor({ x: 26, y: 26 })).toEqual({ x: 25, y: 25 })
  })

  // ─── kNearestNeighbors ───
  it('finds k nearest neighbors', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 10, y: 10 },
      { x: 20, y: 20 },
    ]
    const tree = new KDTree3(pts)
    const knn = tree.kNearestNeighbors({ x: 0, y: 0 }, 2)
    expect(knn.length).toBe(2)
    expect(knn).toContainEqual({ x: 0, y: 0 })
    expect(knn).toContainEqual({ x: 1, y: 1 })
  })

  it('returns empty for k <= 0', () => {
    const tree = new KDTree3([{ x: 0, y: 0 }])
    expect(tree.kNearestNeighbors({ x: 0, y: 0 }, 0)).toEqual([])
    expect(tree.kNearestNeighbors({ x: 0, y: 0 }, -1)).toEqual([])
  })

  it('returns empty on empty tree', () => {
    const tree = new KDTree3([])
    expect(tree.kNearestNeighbors({ x: 0, y: 0 }, 3)).toEqual([])
  })

  it('returns fewer if k > size', () => {
    const tree = new KDTree3([{ x: 0, y: 0 }, { x: 1, y: 1 }])
    const knn = tree.kNearestNeighbors({ x: 0, y: 0 }, 10)
    expect(knn.length).toBe(2)
  })

  // ─── rangeSearch ───
  it('finds points in rectangular range', () => {
    const pts = [
      { x: 1, y: 1 },
      { x: 5, y: 5 },
      { x: 10, y: 10 },
      { x: 15, y: 15 },
    ]
    const tree = new KDTree3(pts)
    const inRange = tree.rangeSearch({ x: 0, y: 0 }, { x: 6, y: 6 })
    expect(inRange.length).toBe(2)
    expect(inRange).toContainEqual({ x: 1, y: 1 })
    expect(inRange).toContainEqual({ x: 5, y: 5 })
  })

  it('returns empty for range with no points', () => {
    const tree = new KDTree3([{ x: 100, y: 100 }])
    expect(tree.rangeSearch({ x: 0, y: 0 }, { x: 1, y: 1 })).toEqual([])
  })

  it('returns all points for wide range', () => {
    const pts = [{ x: 1, y: 1 }, { x: 5, y: 5 }]
    const tree = new KDTree3(pts)
    expect(tree.rangeSearch({ x: -100, y: -100 }, { x: 100, y: 100 }).length).toBe(2)
  })

  // ─── Edge cases ───
  it('handles duplicate coordinate points', () => {
    const pts = [{ x: 1, y: 1 }, { x: 1, y: 1 }]
    const tree = new KDTree3(pts)
    expect(tree.size).toBe(2)
    expect(tree.contains({ x: 1, y: 1 })).toBe(true)
  })

  it('handles negative coordinates', () => {
    const pts = [{ x: -5, y: -5 }, { x: 5, y: 5 }]
    const tree = new KDTree3(pts)
    expect(tree.nearestNeighbor({ x: -4, y: -4 })).toEqual({ x: -5, y: -5 })
  })
})
