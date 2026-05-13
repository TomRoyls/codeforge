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
})
