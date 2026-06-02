import { describe, it, expect } from 'vitest'
import { KdTree } from '../../src/utils/kd-tree.js'

interface Point {
  coords: number[]
}

describe('KdTree', () => {
  it('creates empty tree with default dims', () => {
    const tree = new KdTree<Point>()
    expect(tree.size).toBe(0)
  })

  it('creates tree from initial points', () => {
    const points: Point[] = [
      { coords: [1, 2] },
      { coords: [3, 4] },
    ]
    const tree = new KdTree<Point>(points)
    expect(tree.size).toBe(2)
  })

  it('inserts points into empty tree', () => {
    const tree = new KdTree<Point>()
    tree.insert({ coords: [1, 2] })
    expect(tree.size).toBe(1)
  })

  it('inserts points into existing tree', () => {
    const tree = new KdTree<Point>()
    tree.insert({ coords: [1, 2] })
    tree.insert({ coords: [3, 4] })
    expect(tree.size).toBe(2)
  })

  it('finds nearest neighbor', () => {
    const tree = new KdTree<Point>()
    tree.insert({ coords: [1, 2] })
    tree.insert({ coords: [10, 10] })
    const nearest = tree.nearest([0, 0])
    expect(nearest.length).toBe(1)
    expect(nearest[0]!.coords[0]).toBe(1)
  })

  it('finds k nearest neighbors', () => {
    const tree = new KdTree<Point>()
    tree.insert({ coords: [1, 2] })
    tree.insert({ coords: [3, 4] })
    tree.insert({ coords: [10, 10] })
    const nearest = tree.nearest([0, 0], 2)
    expect(nearest.length).toBe(2)
  })

  it('range search finds points in range', () => {
    const tree = new KdTree<Point>()
    tree.insert({ coords: [1, 2] })
    tree.insert({ coords: [5, 6] })
    tree.insert({ coords: [10, 10] })
    const results = tree.rangeSearch([0, 0], [5, 5])
    expect(results.length).toBe(1)
  })

  it('range search returns empty when no points in range', () => {
    const tree = new KdTree<Point>()
    tree.insert({ coords: [1, 2] })
    tree.insert({ coords: [10, 10] })
    const results = tree.rangeSearch([20, 20], [30, 30])
    expect(results).toEqual([])
  })

  it('handles 3D points', () => {
    const points: Point[] = [
      { coords: [1, 2, 3] },
      { coords: [4, 5, 6] },
    ]
    const tree = new KdTree<Point>(points, 3)
    const nearest = tree.nearest([0, 0, 0])
    expect(nearest.length).toBe(1)
  })

  it('handles points on axis boundaries', () => {
    const tree = new KdTree<Point>()
    tree.insert({ coords: [5, 5] })
    tree.insert({ coords: [5, 10] })
    tree.insert({ coords: [10, 5] })
    const results = tree.rangeSearch([5, 5], [5, 10])
    expect(results.length).toBe(2)
  })

  it('nearest returns points sorted by distance', () => {
    const tree = new KdTree<Point>()
    tree.insert({ coords: [10, 10] })
    tree.insert({ coords: [5, 5] })
    tree.insert({ coords: [1, 1] })
    const nearest = tree.nearest([0, 0], 3)
    expect(nearest[0]!.coords[0]).toBe(1)
    expect(nearest[1]!.coords[0]).toBe(5)
    expect(nearest[2]!.coords[0]).toBe(10)
  })

  it('range search includes boundary points', () => {
    const tree = new KdTree<Point>()
    tree.insert({ coords: [1, 1] })
    tree.insert({ coords: [5, 5] })
    tree.insert({ coords: [10, 10] })
    const results = tree.rangeSearch([1, 1], [5, 5])
    expect(results.length).toBe(2)
  })

  it('handles duplicate points', () => {
    const tree = new KdTree<Point>()
    tree.insert({ coords: [5, 5] })
    tree.insert({ coords: [5, 5] })
    expect(tree.size).toBe(2)
  })

  it('nearest with k larger than tree size', () => {
    const tree = new KdTree<Point>()
    tree.insert({ coords: [1, 2] })
    tree.insert({ coords: [3, 4] })
    const nearest = tree.nearest([0, 0], 10)
    expect(nearest.length).toBe(2)
  })

  it('range search in empty tree', () => {
    const tree = new KdTree<Point>()
    const results = tree.rangeSearch([0, 0], [10, 10])
    expect(results).toEqual([])
  })

  it('nearest in empty tree', () => {
    const tree = new KdTree<Point>()
    const nearest = tree.nearest([0, 0])
    expect(nearest).toEqual([])
  })

  it('size returns correct count after multiple inserts', () => {
    const tree = new KdTree<Point>()
    for (let i = 0; i < 10; i++) {
      tree.insert({ coords: [i, i] })
    }
    expect(tree.size).toBe(10)
  })

  it('handles negative coordinates', () => {
    const tree = new KdTree<Point>()
    tree.insert({ coords: [-5, -5] })
    tree.insert({ coords: [5, 5] })
    const nearest = tree.nearest([-10, -10])
    expect(nearest[0]!.coords[0]).toBe(-5)
  })

  it('nearest returns single point', () => {
    const tree = new KdTree<{ coords: [number, number] }>(2, p => p.coords)
    tree.insert({ coords: [3, 3] })
    const nearest = tree.nearest([0, 0])
    expect(nearest.length).toBe(1)
    expect(nearest[0]!.coords).toEqual([3, 3])
  })
})