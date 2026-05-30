import { describe, it, expect } from 'vitest'
import { KdTree, KdPoint } from '../../../src/utils/kd-tree.js'

interface TestPoint extends KdPoint {
  coords: number[]
  name: string
}

function p(x: number, y: number, name?: string): TestPoint {
  return { coords: [x, y], name: name ?? `(${x},${y})` }
}

describe('KdTree', () => {
  describe('construction', () => {
    it('creates empty tree', () => {
      const tree = new KdTree<TestPoint>()
      expect(tree.size).toBe(0)
    })

    it('creates from points', () => {
      const tree = new KdTree<TestPoint>([p(1, 2), p(3, 4), p(5, 6)])
      expect(tree.size).toBe(3)
    })
  })

  describe('insert', () => {
    it('inserts into empty tree', () => {
      const tree = new KdTree<TestPoint>()
      tree.insert(p(1, 2))
      expect(tree.size).toBe(1)
    })

    it('inserts multiple points', () => {
      const tree = new KdTree<TestPoint>()
      tree.insert(p(3, 3))
      tree.insert(p(1, 1))
      tree.insert(p(5, 5))
      expect(tree.size).toBe(3)
    })
  })

  describe('nearest', () => {
    it('finds nearest point', () => {
      const tree = new KdTree<TestPoint>([p(0, 0), p(10, 10), p(5, 5)])
      const result = tree.nearest([4, 4])
      expect(result.length).toBe(1)
      expect(result[0]!.coords).toEqual([5, 5])
    })

    it('finds k nearest points', () => {
      const tree = new KdTree<TestPoint>([
        p(0, 0), p(1, 1), p(2, 2), p(10, 10),
      ])
      const result = tree.nearest([1.5, 1.5], 2)
      expect(result.length).toBe(2)
    })

    it('finds exact match', () => {
      const tree = new KdTree<TestPoint>([p(3, 7), p(1, 2)])
      const result = tree.nearest([3, 7])
      expect(result[0]!.coords).toEqual([3, 7])
    })

    it('handles empty tree', () => {
      const tree = new KdTree<TestPoint>()
      expect(tree.nearest([0, 0])).toEqual([])
    })
  })

  describe('rangeSearch', () => {
    it('finds points in range', () => {
      const tree = new KdTree<TestPoint>([
        p(1, 1), p(2, 2), p(3, 3), p(8, 8), p(9, 9),
      ])
      const result = tree.rangeSearch([0, 0], [4, 4])
      expect(result.length).toBe(3)
    })

    it('returns empty for no matches', () => {
      const tree = new KdTree<TestPoint>([p(10, 10), p(20, 20)])
      const result = tree.rangeSearch([0, 0], [5, 5])
      expect(result).toEqual([])
    })

    it('finds single point', () => {
      const tree = new KdTree<TestPoint>([p(5, 5), p(10, 10)])
      const result = tree.rangeSearch([4, 4], [6, 6])
      expect(result.length).toBe(1)
      expect(result[0]!.coords).toEqual([5, 5])
    })

    it('handles empty tree', () => {
      const tree = new KdTree<TestPoint>()
      expect(tree.rangeSearch([0, 0], [10, 10])).toEqual([])
    })
  })

  describe('spatial queries', () => {
    it('finds nearby restaurants', () => {
      const tree = new KdTree<TestPoint>([
        p(0, 0, 'home'), p(1, 0, 'cafe'), p(0, 1, 'store'),
        p(50, 50, 'far place'),
      ])
      const nearby = tree.nearest([0.5, 0.5], 3)
      expect(nearby.length).toBe(3)
      expect(nearby.every(p => p.name !== 'far place')).toBe(true)
    })

    it('3D nearest neighbor', () => {
      interface Point3D extends KdPoint { coords: number[] }
      const tree = new KdTree<Point3D>([
        { coords: [0, 0, 0] }, { coords: [1, 1, 1] }, { coords: [5, 5, 5] },
      ], 3)
      const result = tree.nearest([0.5, 0.5, 0.5])
      expect(result[0]!.coords).toEqual([1, 1, 1])
    })
  })
})
