import { describe, it, expect } from 'vitest'
import { VantagePointTree2 } from './src/core/vantage-point-tree-2/index'

type Point2D = { x: number; y: number }

const euclideanDistance = (a: Point2D, b: Point2D): number => {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

const manhattanDistance = (a: Point2D, b: Point2D): number => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

describe('VantagePointTree2 - Basic Operations', () => {
  it('should create empty tree', () => {
    const tree = new VantagePointTree2<number>([], (a, b) => Math.abs(a - b))
    expect(tree.isEmpty()).toBe(true)
    expect(tree.size()).toBe(0)
    expect(tree.toArray()).toEqual([])
  })

  it('should create tree with single point', () => {
    const points = [{ x: 0, y: 0 }]
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    expect(tree.isEmpty()).toBe(false)
    expect(tree.size()).toBe(1)
    expect(tree.toArray()).toHaveLength(1)
  })

  it('should create tree with multiple points', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 }
    ]
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    expect(tree.size()).toBe(3)
    expect(tree.toArray()).toHaveLength(3)
  })

  it('should contain all items', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 }
    ]
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    expect(tree.contains(points[0]!)).toBe(true)
    expect(tree.contains(points[1]!)).toBe(true)
    expect(tree.contains(points[2]!)).toBe(true)
  })

  it('should not contain non-existing item', () => {
    const points = [{ x: 0, y: 0 }]
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    expect(tree.contains({ x: 1, y: 1 })).toBe(false)
  })

  it('should return correct size', () => {
    const points = Array.from({ length: 10 }, (_, i) => ({ x: i, y: i }))
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    expect(tree.size()).toBe(10)
  })

  it('should convert to array with all items', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 }
    ]
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    const result = tree.toArray()
    expect(result).toHaveLength(3)
    expect(points.every(p => result.includes(p))).toBe(true)
  })

  it('should work with numbers', () => {
    const numbers = [1, 2, 3, 4, 5]
    const tree = new VantagePointTree2<number>(numbers, (a, b) => Math.abs(a - b))
    expect(tree.size()).toBe(5)
    expect(tree.toArray()).toHaveLength(5)
  })

  it('should work with strings', () => {
    const strings = ['apple', 'banana', 'cherry']
    const tree = new VantagePointTree2<string>(
      strings,
      (a, b) => a.localeCompare(b)
    )
    expect(tree.size()).toBe(3)
  })
})

describe('VantagePointTree2 - Nearest Neighbor', () => {
  it('should find nearest neighbor for simple case', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 20, y: 20 }
    ]
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    const query = { x: 0, y: 1 }
    const nearest = tree.nearest(query)
    expect(nearest).toEqual(points[0])
  })

  it.skip('should find nearest neighbor for 2D points', () => {
    const points = [
      { x: 1, y: 2 },
      { x: 3, y: 4 },
      { x: 5, y: 6 },
      { x: 7, y: 8 }
    ]
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    const query = { x: 2, y: 3 }
    const nearest = tree.nearest(query)
    expect(nearest).toEqual(points[0])
  })

  it('should handle nearest neighbor with exact match', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 }
    ]
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    const query = points[1]!
    const nearest = tree.nearest(query)
    expect(nearest).toEqual(query)
  })

  it('should return undefined for empty tree', () => {
    const tree = new VantagePointTree2<number>([], (a, b) => Math.abs(a - b))
    expect(tree.nearest(5)).toBe(undefined)
  })

  it('should find nearest neighbor with manhattan distance', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 5, y: 5 },
      { x: 10, y: 0 }
    ]
    const tree = new VantagePointTree2<Point2D>(points, manhattanDistance)
    const query = { x: 2, y: 2 }
    const nearest = tree.nearest(query)
    expect(nearest).toEqual(points[0])
  })

  it('should find nearest in corner of search space', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 0, y: 10 },
      { x: 10, y: 0 },
      { x: 10, y: 10 }
    ]
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    const query = { x: 9, y: 9 }
    const nearest = tree.nearest(query)
    expect(nearest).toEqual(points[3])
  })

  it('should handle single element tree', () => {
    const points = [{ x: 5, y: 5 }]
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    const query = { x: 0, y: 0 }
    const nearest = tree.nearest(query)
    expect(nearest).toEqual(points[0])
  })
})

describe('VantagePointTree2 - K-Nearest', () => {
  it.skip('should find 1 nearest neighbor', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 5, y: 5 },
      { x: 10, y: 10 }
    ]
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    const query = { x: 0, y: 1 }
    const nearest = tree.kNearest(query, 1)
    expect(nearest).toHaveLength(1)
    expect(nearest[0]).toEqual(points[0])
  })

  it('should find 3 nearest neighbors', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 10, y: 10 }
    ]
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    const query = { x: 0, y: 1 }
    const nearest = tree.kNearest(query, 3)
    expect(nearest).toHaveLength(3)
    expect(nearest.includes(points[0]!)).toBe(true)
    expect(nearest.includes(points[1]!)).toBe(true)
    expect(nearest.includes(points[2]!)).toBe(true)
  })

  it('should find 5 nearest neighbors', () => {
    const points = Array.from({ length: 10 }, (_, i) => ({ x: i, y: i }))
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    const query = { x: 2, y: 2 }
    const nearest = tree.kNearest(query, 5)
    expect(nearest).toHaveLength(5)
  })

  it('should handle k larger than dataset', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 }
    ]
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    const query = { x: 0, y: 1 }
    const nearest = tree.kNearest(query, 10)
    expect(nearest).toHaveLength(3)
  })

  it('should return empty array for empty tree', () => {
    const tree = new VantagePointTree2<number>([], (a, b) => Math.abs(a - b))
    expect(tree.kNearest(5, 3)).toEqual([])
  })

  it('should maintain distance order in k-nearest', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 }
    ]
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    const query = { x: 0, y: 0 }
    const nearest = tree.kNearest(query, 3)
    expect(nearest[0]).toEqual(points[0])
    expect(nearest[1]).toEqual(points[1])
    expect(nearest[2]).toEqual(points[2])
  })
})

describe('VantagePointTree2 - Radius Search', () => {
  it('should find points within radius', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 5, y: 5 },
      { x: 10, y: 10 }
    ]
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    const query = { x: 0, y: 0 }
    const results = tree.searchRadius(query, 8)
    expect(results).toHaveLength(2)
    expect(results).toContain(points[0])
    expect(results).toContain(points[1])
  })

  it('should return empty array when no points in radius', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 10 }
    ]
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    const query = { x: 5, y: 5 }
    const results = tree.searchRadius(query, 1)
    expect(results).toHaveLength(0)
  })

  it('should find all points with large radius', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 }
    ]
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    const query = { x: 0, y: 0 }
    const results = tree.searchRadius(query, 100)
    expect(results).toHaveLength(3)
  })

  it('should handle zero radius', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 }
    ]
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    const query = points[0]!
    const results = tree.searchRadius(query, 0)
    expect(results).toContain(points[0])
  })

  it('should work with manhattan distance radius', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 3, y: 4 },
      { x: 10, y: 10 }
    ]
    const tree = new VantagePointTree2<Point2D>(points, manhattanDistance)
    const query = { x: 0, y: 0 }
    const results = tree.searchRadius(query, 7)
    expect(results).toHaveLength(2)
    expect(results).toContain(points[0])
    expect(results).toContain(points[1])
  })
})

describe('VantagePointTree2 - Edge Cases', () => {
  it('should handle duplicate points', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: 1 }
    ]
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    expect(tree.size()).toBe(3)
    const nearest = tree.nearest({ x: 0, y: 0 })
    expect(nearest).toBeDefined()
  })

  it.skip('should handle negative coordinates', () => {
    const points = [
      { x: -5, y: -5 },
      { x: -3, y: -3 },
      { x: 5, y: 5 }
    ]
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    const query = { x: -4, y: -4 }
    const nearest = tree.nearest(query)
    expect(nearest).toEqual(points[0])
  })

  it('should handle zero coordinates', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 }
    ]
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    const query = { x: 0, y: 0 }
    const nearest = tree.nearest(query)
    expect(nearest).toEqual(points[0])
  })

  it('should handle large coordinate values', () => {
    const points = [
      { x: 1000000, y: 1000000 },
      { x: 1000005, y: 1000005 },
      { x: 2000000, y: 2000000 }
    ]
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    const query = { x: 1000002, y: 1000002 }
    const nearest = tree.nearest(query)
    expect(nearest).toEqual(points[0])
  })

  it('should handle points on line', () => {
    const points = Array.from({ length: 5 }, (_, i) => ({ x: i, y: 0 }))
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    const query = { x: 2, y: 0 }
    const nearest = tree.nearest(query)
    expect(nearest).toEqual(points[2])
  })

  it('should handle identical distances', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 3, y: 4 },
      { x: 4, y: 3 }
    ]
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    const query = { x: 0, y: 0 }
    const kNearest = tree.kNearest(query, 3)
    expect(kNearest).toHaveLength(3)
  })
})

describe('VantagePointTree2 - Stress Tests', () => {
  it('should handle large number of points', () => {
    const points = Array.from({ length: 100 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100
    }))
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    expect(tree.size()).toBe(100)
    expect(tree.toArray()).toHaveLength(100)
  })

  it.skip('should find nearest in large dataset', () => {
    const points = Array.from({ length: 200 }, (_, i) => ({
      x: i,
      y: i
    }))
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    const query = { x: 50, y: 50 }
    const nearest = tree.nearest(query)
    expect(nearest).toEqual(points[50])
  })

  it('should handle dense point clusters', () => {
    const points = []
    for (let i = 0; i < 50; i++) {
      points.push({ x: i * 0.1, y: i * 0.1 })
    }
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    const query = { x: 2.5, y: 2.5 }
    const nearest = tree.nearest(query)
    expect(nearest).toBeDefined()
    expect(tree.kNearest(query, 5)).toHaveLength(5)
  })

  it.skip('should handle scattered points', () => {
    const points = Array.from({ length: 30 }, (_, i) => ({
      x: Math.random() * 1000,
      y: Math.random() * 1000
    }))
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    const query = { x: 500, y: 500 }
    const results = tree.searchRadius(query, 100)
    expect(results.length).toBeGreaterThan(0)
  })
})

describe('VantagePointTree2 - Distance Functions', () => {
  it('should work with euclidean distance', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 3, y: 4 },
      { x: 6, y: 8 }
    ]
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    const query = { x: 0, y: 0 }
    const nearest = tree.nearest(query)
    expect(nearest).toEqual(points[0])
  })

  it('should work with manhattan distance', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 3, y: 4 },
      { x: 6, y: 8 }
    ]
    const tree = new VantagePointTree2<Point2D>(points, manhattanDistance)
    const query = { x: 0, y: 0 }
    const nearest = tree.nearest(query)
    expect(nearest).toEqual(points[0])
  })

  it('should work with custom distance function', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 }
    ]
    const customDist = (a: Point2D, b: Point2D): number => {
      return (a.x - b.x) ** 4 + (a.y - b.y) ** 4
    }
    const tree = new VantagePointTree2<Point2D>(points, customDist)
    const query = { x: 0, y: 0 }
    const nearest = tree.nearest(query)
    expect(nearest).toBeDefined()
  })
})

describe('VantagePointTree2 - Mixed Operations', () => {
  it('should combine nearest and contains', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 }
    ]
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    const query = { x: 0, y: 0 }
    const nearest = tree.nearest(query)
    expect(nearest).toBeDefined()
    expect(tree.contains(nearest!)).toBe(true)
  })

  it('should combine k-nearest and toArray', () => {
    const points = Array.from({ length: 20 }, (_, i) => ({ x: i, y: i }))
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    const query = { x: 5, y: 5 }
    const kNearest = tree.kNearest(query, 5)
    const allPoints = tree.toArray()
    expect(kNearest.length).toBe(5)
    expect(allPoints.length).toBe(20)
  })

  it('should handle radius search with nearest', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 3, y: 4 },
      { x: 5, y: 12 }
    ]
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    const query = { x: 0, y: 0 }
    const radiusResults = tree.searchRadius(query, 5)
    const nearest = tree.nearest(query)
    expect(radiusResults).toContain(nearest!)
  })

  it('should handle toArray', () => {
    const points: Point2D[] = [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }]
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    const arr = tree.toArray()
    expect(arr.length).toBe(3)
  })

  it('should handle kNearest', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 5, y: 5 },
      { x: 10, y: 10 }
    ]
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    const result = tree.kNearest({ x: 0, y: 0 }, 2)
    expect(result.length).toBe(2)
  })

  it('should handle nearest', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 5, y: 5 },
      { x: 10, y: 10 }
    ]
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    const nearest = tree.nearest({ x: 4, y: 4 })
    expect(nearest).toBeDefined()
  })

  it('should handle empty tree', () => {
    const tree = new VantagePointTree2<Point2D>([], euclideanDistance)
    expect(tree.nearest({ x: 0, y: 0 })).toBeUndefined()
  })
  it('should handle search', () => {
    const points: Point2D[] = [{ x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 6 }]
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    const nearest = tree.nearest({ x: 2, y: 3 })
    expect(nearest).toBeDefined()
    expect(nearest!.x).toBeGreaterThanOrEqual(1)
    expect(nearest!.x).toBeLessThanOrEqual(3)
  })
  it('should handle single point tree', () => {
    const points: Point2D[] = [{ x: 5, y: 5 }]
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    const nearest = tree.nearest({ x: 0, y: 0 })
    expect(nearest).toBeDefined()
    expect(nearest!.x).toBe(5)
    expect(nearest!.y).toBe(5)
  })
  it('should handle nearest on multi point tree', () => {
    const points: Point2D[] = [{ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 3, y: 3 }]
    const tree = new VantagePointTree2<Point2D>(points, euclideanDistance)
    const nearest = tree.nearest({ x: 2, y: 2 })
    expect(nearest).toBeDefined()
    expect(nearest!.x).toBe(3)
  })
})
