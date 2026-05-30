import { describe, expect, it } from 'vitest'
import { QuadTree } from '../../../src/utils/quad-tree.js'

describe('QuadTree', () => {
  it('should create a QuadTree with default parameters', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
    expect(tree.size).toBe(0)
    expect(tree.depth).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('should create a QuadTree with custom capacity', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 100, height: 100 }, 8)
    expect(tree.size).toBe(0)
    expect(tree.depth).toBe(0)
  })

  it('should create a QuadTree with custom maxDepth', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 100, height: 100 }, 4, 5)
    expect(tree.size).toBe(0)
    expect(tree.depth).toBe(0)
  })

  it('should insert a point inside bounds', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
    const result = tree.insert({ x: 50, y: 50 })
    expect(result).toBe(true)
    expect(tree.size).toBe(1)
  })

  it('should not insert a point outside bounds', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
    const result = tree.insert({ x: 150, y: 150 })
    expect(result).toBe(false)
    expect(tree.size).toBe(0)
  })

  it('should insert multiple points', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
    tree.insert({ x: 10, y: 10 })
    tree.insert({ x: 20, y: 20 })
    tree.insert({ x: 30, y: 30 })
    expect(tree.size).toBe(3)
  })

  it('should insert points with data', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
    tree.insert({ x: 10, y: 10, data: 'point1' })
    tree.insert({ x: 20, y: 20, data: 'point2' })
    expect(tree.size).toBe(2)
  })

  it('should contain an inserted point', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
    const point = { x: 50, y: 50 }
    tree.insert(point)
    expect(tree.contains(point)).toBe(true)
  })

  it('should not contain a non-inserted point', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
    const point = { x: 50, y: 50 }
    expect(tree.contains(point)).toBe(false)
  })

  it('should remove an inserted point', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
    const point = { x: 50, y: 50 }
    tree.insert(point)
    const result = tree.remove(point)
    expect(result).toBe(true)
    expect(tree.size).toBe(0)
    expect(tree.contains(point)).toBe(false)
  })

  it('should not remove a non-existent point', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
    const point = { x: 50, y: 50 }
    const result = tree.remove(point)
    expect(result).toBe(false)
    expect(tree.size).toBe(0)
  })

  it('should query points in a range', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
    tree.insert({ x: 10, y: 10 })
    tree.insert({ x: 20, y: 20 })
    tree.insert({ x: 60, y: 60 })
    const range = { x: 0, y: 0, width: 50, height: 50 }
    const results = tree.queryRange(range)
    expect(results.length).toBe(2)
  })

  it('should query points with data', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
    tree.insert({ x: 10, y: 10, data: 'a' })
    tree.insert({ x: 20, y: 20, data: 'b' })
    const range = { x: 0, y: 0, width: 50, height: 50 }
    const results = tree.queryRange(range)
    expect(results).toHaveLength(2)
    expect(results[0].data).toBe('a')
  })

  it('should query points by radius', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
    tree.insert({ x: 10, y: 10 })
    tree.insert({ x: 50, y: 50 })
    tree.insert({ x: 60, y: 60 })
    const center = { x: 55, y: 55 }
    const radius = 15
    const results = tree.queryRadius(center, radius)
    expect(results.length).toBe(2)
  })

  it('should find nearest neighbor', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
    tree.insert({ x: 10, y: 10 })
    tree.insert({ x: 20, y: 20 })
    tree.insert({ x: 60, y: 60 })
    const target = { x: 55, y: 55 }
    const nearest = tree.nearestNeighbor(target)
    expect(nearest).toBeDefined()
    expect(nearest?.x).toBe(60)
    expect(nearest?.y).toBe(60)
  })

  it('should return undefined for nearest neighbor in empty tree', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
    const target = { x: 50, y: 50 }
    const nearest = tree.nearestNeighbor(target)
    expect(nearest).toBeUndefined()
  })

  it('should clear all points', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
    tree.insert({ x: 10, y: 10 })
    tree.insert({ x: 20, y: 20 })
    tree.insert({ x: 30, y: 30 })
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.depth).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('should convert to array', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
    tree.insert({ x: 10, y: 10 })
    tree.insert({ x: 20, y: 20 })
    tree.insert({ x: 30, y: 30 })
    const array = tree.toArray()
    expect(array.length).toBe(3)
  })

  it('should subdivide when capacity is exceeded', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 100, height: 100 }, 4)
    tree.insert({ x: 10, y: 10 })
    tree.insert({ x: 20, y: 20 })
    tree.insert({ x: 30, y: 30 })
    tree.insert({ x: 40, y: 40 })
    tree.insert({ x: 50, y: 50 })
    expect(tree.depth).toBeGreaterThan(0)
  })

  it('should handle points on quadrant boundaries', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
    tree.insert({ x: 50, y: 50 })
    tree.insert({ x: 51, y: 51 })
    expect(tree.size).toBe(2)
  })

  it('should insert many points', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 100, height: 100 }, 4, 8)
    for (let i = 0; i < 100; i++) {
      tree.insert({ x: Math.random() * 100, y: Math.random() * 100 })
    }
    expect(tree.size).toBe(100)
  })

  it('should query empty range', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
    tree.insert({ x: 10, y: 10 })
    const range = { x: 200, y: 200, width: 10, height: 10 }
    const results = tree.queryRange(range)
    expect(results.length).toBe(0)
  })

  it('should query entire bounds', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
    tree.insert({ x: 10, y: 10 })
    tree.insert({ x: 20, y: 20 })
    const range = { x: 0, y: 0, width: 100, height: 100 }
    const results = tree.queryRange(range)
    expect(results.length).toBe(2)
  })

  it('should query with zero radius', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
    tree.insert({ x: 50, y: 50 })
    const center = { x: 50, y: 50 }
    const results = tree.queryRadius(center, 0)
    expect(results.length).toBe(1)
  })

  it('should handle negative coordinates', () => {
    const tree = new QuadTree({ x: -100, y: -100, width: 200, height: 200 })
    const result = tree.insert({ x: -50, y: -50 })
    expect(result).toBe(true)
    expect(tree.size).toBe(1)
  })

  it('should handle points on bounds edge', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
    const result = tree.insert({ x: 99, y: 99 })
    expect(result).toBe(true)
    expect(tree.size).toBe(1)
  })

  it('should not insert point on upper bound edge', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
    const result = tree.insert({ x: 100, y: 100 })
    expect(result).toBe(false)
    expect(tree.size).toBe(0)
  })
})