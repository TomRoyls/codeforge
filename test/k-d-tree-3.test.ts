import { describe, it, expect } from 'vitest'
import { KDTree3 } from '../src/core/k-d-tree-3/index'

describe('KDTree3', () => {
  it('should create empty tree', async () => {
    const tree = new KDTree3([])
    expect(tree.isEmpty()).toBe(true)
    expect(tree.size).toBe(0)
    expect(tree.toArray()).toEqual([])
  })

  it('should create tree with single point', async () => {
    const tree = new KDTree3([{x: 1, y: 2}])
    expect(tree.isEmpty()).toBe(false)
    expect(tree.size).toBe(1)
    expect(tree.toArray()).toEqual([{x: 1, y: 2}])
  })

  it('should create tree with multiple points', async () => {
    const tree = new KDTree3([
      {x: 1, y: 2},
      {x: 3, y: 4},
      {x: 5, y: 6}
    ])
    expect(tree.isEmpty()).toBe(false)
    expect(tree.size).toBe(3)
    expect(tree.toArray()).toEqual([
      {x: 1, y: 2},
      {x: 3, y: 4},
      {x: 5, y: 6}
    ])
  })

  it('should find nearest neighbor', async () => {
    const tree = new KDTree3([
      {x: 1, y: 2},
      {x: 4, y: 6},
      {x: 8, y: 2}
    ])
    const nearest = tree.nearestNeighbor({x: 5, y: 4})
    expect(nearest).toEqual({x: 4, y: 6})
  })

  it('should find nearest neighbor for empty tree', async () => {
    const tree = new KDTree3([])
    const nearest = tree.nearestNeighbor({x: 1, y: 1})
    expect(nearest).toBeUndefined()
  })

  it('should find k nearest neighbors', async () => {
    const tree = new KDTree3([
      {x: 1, y: 2},
      {x: 2, y: 3},
      {x: 4, y: 6},
      {x: 8, y: 2},
      {x: 5, y: 5}
    ])
    const nearest = tree.kNearestNeighbors({x: 4, y: 4}, 2)
    expect(nearest).toHaveLength(2)
    expect(nearest).toContainEqual({x: 4, y: 6})
    expect(nearest).toContainEqual({x: 5, y: 5})
  })

  it('should handle k larger than tree size', async () => {
    const tree = new KDTree3([
      {x: 1, y: 2},
      {x: 2, y: 3}
    ])
    const nearest = tree.kNearestNeighbors({x: 1, y: 1}, 5)
    expect(nearest).toHaveLength(2)
  })

  it('should handle kNearestNeighbors on empty tree', async () => {
    const tree = new KDTree3([])
    const nearest = tree.kNearestNeighbors({x: 1, y: 1}, 3)
    expect(nearest).toEqual([])
  })

  it('should perform range search', async () => {
    const tree = new KDTree3([
      {x: 1, y: 2},
      {x: 3, y: 4},
      {x: 5, y: 6},
      {x: 7, y: 8}
    ])
    const results = tree.rangeSearch({x: 2, y: 3}, {x: 6, y: 7})
    expect(results).toContainEqual({x: 3, y: 4})
    expect(results).toContainEqual({x: 5, y: 6})
    expect(results).toHaveLength(2)
  })

  it('should handle range search with no results', async () => {
    const tree = new KDTree3([
      {x: 1, y: 2},
      {x: 3, y: 4}
    ])
    const results = tree.rangeSearch({x: 10, y: 10}, {x: 20, y: 20})
    expect(results).toEqual([])
  })

  it('should check if point exists', async () => {
    const tree = new KDTree3([
      {x: 1, y: 2},
      {x: 3, y: 4},
      {x: 5, y: 6}
    ])
    expect(tree.contains({x: 3, y: 4})).toBe(true)
    expect(tree.contains({x: 2, y: 3})).toBe(false)
  })

  it('should handle contains on empty tree', async () => {
    const tree = new KDTree3([])
    expect(tree.contains({x: 1, y: 1})).toBe(false)
  })

  it('should handle duplicate points', async () => {
    const tree = new KDTree3([
      {x: 1, y: 2},
      {x: 1, y: 2},
      {x: 3, y: 4}
    ])
    expect(tree.size).toBe(3)
    expect(tree.contains({x: 1, y: 2})).toBe(true)
  })

  it('should handle negative coordinates', async () => {
    const tree = new KDTree3([
      {x: -1, y: -2},
      {x: 3, y: -4},
      {x: -5, y: 6}
    ])
    const nearest = tree.nearestNeighbor({x: 0, y: 0})
    expect(nearest).toEqual({x: -1, y: -2})
  })

  it('should return all points from toArray', () => {
    const points = [
      {x: 1, y: 2},
      {x: 3, y: 4},
      {x: 5, y: 6}
    ]
    const tree = new KDTree3(points)
    const arr = tree.toArray()
    expect(arr).toHaveLength(3)
    expect(arr).toContainEqual({x: 1, y: 2})
    expect(arr).toContainEqual({x: 3, y: 4})
    expect(arr).toContainEqual({x: 5, y: 6})
  })

  it('should return correct size', () => {
    const tree = new KDTree3([
      {x: 1, y: 1},
      {x: 2, y: 2},
      {x: 3, y: 3}
    ])
    expect(tree.size).toBe(3)
  })

  it('should report empty correctly', () => {
    const tree = new KDTree3([])
    expect(tree.isEmpty()).toBe(true)
    expect(tree.size).toBe(0)
  })

  it('should handle single point', () => {
    const tree = new KDTree3([{x: 5, y: 5}])
    expect(tree.nearestNeighbor({x: 0, y: 0})).toEqual({x: 5, y: 5})
    expect(tree.contains({x: 5, y: 5})).toBe(true)
    expect(tree.contains({x: 0, y: 0})).toBe(false)
  })

  it('kNearestNeighbors with k larger than tree size', () => {
    const tree = new KDTree3([
      {x: 1, y: 1},
      {x: 2, y: 2}
    ])
    const neighbors = tree.kNearestNeighbors({x: 0, y: 0}, 5)
    expect(neighbors).toHaveLength(2)
  })

  it('should return undefined nearestNeighbor on empty tree', () => {
    const tree = new KDTree3([])
    expect(tree.nearestNeighbor({x: 0, y: 0})).toBeUndefined()
  })

  it('should return empty kNearestNeighbors for k=0', () => {
    const tree = new KDTree3([{x: 1, y: 1}])
    expect(tree.kNearestNeighbors({x: 0, y: 0}, 0)).toEqual([])
  })

  it('should return all points via toArray', () => {
    const points = [{x: 1, y: 2}, {x: 3, y: 4}, {x: 5, y: 6}]
    const tree = new KDTree3(points)
    const arr = tree.toArray()
    expect(arr).toHaveLength(3)
  })

  it('should find exact nearest neighbor', () => {
    const tree = new KDTree3([
      {x: 0, y: 0},
      {x: 10, y: 10},
      {x: 5, y: 5}
    ])
    expect(tree.nearestNeighbor({x: 4, y: 4})).toEqual({x: 5, y: 5})
  })

  it('should find k nearest neighbors', () => {
    const tree = new KDTree3([
      {x: 0, y: 0},
      {x: 1, y: 1},
      {x: 10, y: 10},
      {x: 20, y: 20}
    ])
    const neighbors = tree.kNearestNeighbors({x: 0, y: 0}, 2)
    expect(neighbors).toHaveLength(2)
    expect(neighbors).toContainEqual({x: 0, y: 0})
  })

  it('should find range of points', () => {
    const tree = new KDTree3([
      {x: 1, y: 1},
      {x: 5, y: 5},
      {x: 10, y: 10},
      {x: 15, y: 15}
    ])
    const result = tree.rangeSearch({x: 0, y: 0}, {x: 6, y: 6})
    expect(result.length).toBeGreaterThanOrEqual(2)
  })

  it('should handle range search on single point tree', () => {
    const tree = new KDTree3([{x: 5, y: 5}])
    const inside = tree.rangeSearch({x: 0, y: 0}, {x: 10, y: 10})
    expect(inside).toHaveLength(1)
    const outside = tree.rangeSearch({x: 6, y: 6}, {x: 10, y: 10})
    expect(outside).toHaveLength(0)
  })

  it('should handle nearest neighbor for exact point', () => {
    const tree = new KDTree3([
      {x: 1, y: 1},
      {x: 5, y: 5},
      {x: 10, y: 10}
    ])
    expect(tree.nearestNeighbor({x: 5, y: 5})).toEqual({x: 5, y: 5})
  })

  it('should handle large dataset', () => {
    const points = Array.from({length: 1000}, (_, i) => ({x: i % 50, y: Math.floor(i / 50)}))
    const tree = new KDTree3(points)
    expect(tree.size).toBe(1000)
    const nearest = tree.nearestNeighbor({x: 25, y: 10})
    expect(nearest).toBeDefined()
  })

  it('should handle kNearestNeighbors with k=1', () => {
    const tree = new KDTree3([
      {x: 0, y: 0},
      {x: 10, y: 10}
    ])
    const neighbors = tree.kNearestNeighbors({x: 9, y: 9}, 1)
    expect(neighbors).toHaveLength(1)
    expect(neighbors[0]).toEqual({x: 10, y: 10})
  })

  it('should handle empty tree nearestNeighbor', () => {
    const tree = new KDTree3([])
    expect(tree.nearestNeighbor({x: 0, y: 0})).toBeUndefined()
  })

  it('should handle range search returning empty', () => {
    const tree = new KDTree3([{x: 50, y: 50}])
    const result = tree.rangeSearch({x: 0, y: 0}, {x: 10, y: 10})
    expect(result).toHaveLength(0)
  })

  it('should handle size of empty tree', () => {
    const tree = new KDTree3([])
    expect(tree.size).toBe(0)
  })
})
