import { describe, it, expect } from 'vitest'
import { SpatialIndex2 } from '../src/core/spatial-index-2/index'

describe('SpatialIndex2', () => {
  describe('insert', () => {
    it('should insert a point with unique id', async () => {
      const index = new SpatialIndex2()
      index.insert('p1', 10, 20)

      expect(index.size).toBe(1)
      expect(index.has('p1')).toBe(true)
    })

    it('should insert multiple points', async () => {
      const index = new SpatialIndex2()
      index.insert('p1', 10, 20)
      index.insert('p2', 30, 40)
      index.insert('p3', 50, 60)

      expect(index.size).toBe(3)
      expect(index.has('p1')).toBe(true)
      expect(index.has('p2')).toBe(true)
      expect(index.has('p3')).toBe(true)
    })

    it('should replace point when inserting with same id', async () => {
      const index = new SpatialIndex2()
      index.insert('p1', 10, 20)
      index.insert('p1', 30, 40)

      expect(index.size).toBe(1)
      const point = index.get('p1')
      expect(point!.x).toBe(30)
      expect(point!.y).toBe(40)
    })
  })

  describe('remove', () => {
    it('should remove existing point', async () => {
      const index = new SpatialIndex2()
      index.insert('p1', 10, 20)

      const result = index.remove('p1')

      expect(result).toBe(true)
      expect(index.size).toBe(0)
      expect(index.has('p1')).toBe(false)
    })

    it('should return false for non-existent point', async () => {
      const index = new SpatialIndex2()
      const result = index.remove('p1')

      expect(result).toBe(false)
      expect(index.size).toBe(0)
    })

    it('should not affect other points', async () => {
      const index = new SpatialIndex2()
      index.insert('p1', 10, 20)
      index.insert('p2', 30, 40)

      index.remove('p1')

      expect(index.size).toBe(1)
      expect(index.has('p2')).toBe(true)
    })
  })

  describe('get', () => {
    it('should return point coordinates for existing id', async () => {
      const index = new SpatialIndex2()
      index.insert('p1', 10, 20)

      const point = index.get('p1')

      expect(point).toBeDefined()
      expect(point!.x).toBe(10)
      expect(point!.y).toBe(20)
    })

    it('should return undefined for non-existent id', async () => {
      const index = new SpatialIndex2()
      const point = index.get('p1')

      expect(point).toBeUndefined()
    })
  })

  describe('has', () => {
    it('should return true for existing id', async () => {
      const index = new SpatialIndex2()
      index.insert('p1', 10, 20)

      expect(index.has('p1')).toBe(true)
    })

    it('should return false for non-existent id', async () => {
      const index = new SpatialIndex2()
      expect(index.has('p1')).toBe(false)
    })
  })

  describe('queryRange', () => {
    it('should return ids within bounding box', async () => {
      const index = new SpatialIndex2()
      index.insert('p1', 10, 20)
      index.insert('p2', 30, 40)
      index.insert('p3', 50, 60)

      const result = index.queryRange(5, 15, 35, 45)

      expect(result).toContain('p1')
      expect(result).toContain('p2')
      expect(result).not.toContain('p3')
    })

    it('should return empty array when no points in range', async () => {
      const index = new SpatialIndex2()
      index.insert('p1', 100, 200)

      const result = index.queryRange(5, 15, 35, 45)

      expect(result).toHaveLength(0)
    })

    it('should include points on boundary', async () => {
      const index = new SpatialIndex2()
      index.insert('p1', 10, 20)
      index.insert('p2', 30, 40)

      const result = index.queryRange(10, 20, 30, 40)

      expect(result).toContain('p1')
      expect(result).toContain('p2')
    })

    it('should handle range spanning multiple grid cells', async () => {
      const index = new SpatialIndex2()
      index.insert('p1', 50, 50)
      index.insert('p2', 150, 50)
      index.insert('p3', 250, 50)

      const result = index.queryRange(0, 0, 300, 100)

      expect(result).toHaveLength(3)
      expect(result).toContain('p1')
      expect(result).toContain('p2')
      expect(result).toContain('p3')
    })
  })

  describe('queryNearest', () => {
    it('should return k nearest neighbor ids', async () => {
      const index = new SpatialIndex2()
      index.insert('p1', 10, 10)
      index.insert('p2', 20, 20)
      index.insert('p3', 30, 30)

      const result = index.queryNearest(15, 15, 2)

      expect(result).toHaveLength(2)
      expect(result[0]).toBe('p1')
      expect(result[1]).toBe('p2')
    })

    it('should return all points if k exceeds total', async () => {
      const index = new SpatialIndex2()
      index.insert('p1', 10, 10)
      index.insert('p2', 20, 20)

      const result = index.queryNearest(15, 15, 10)

      expect(result).toHaveLength(2)
    })

    it('should return empty array for k=0', async () => {
      const index = new SpatialIndex2()
      index.insert('p1', 10, 10)

      const result = index.queryNearest(15, 15, 0)

      expect(result).toHaveLength(0)
    })

    it('should handle negative coordinates', async () => {
      const index = new SpatialIndex2()
      index.insert('p1', -10, -10)
      index.insert('p2', -20, -20)

      const result = index.queryNearest(-15, -15, 2)

      expect(result).toHaveLength(2)
    })
  })

  describe('queryRadius', () => {
    it('should return ids within radius', async () => {
      const index = new SpatialIndex2()
      index.insert('p1', 10, 10)
      index.insert('p2', 20, 20)
      index.insert('p3', 50, 50)

      const result = index.queryRadius(15, 15, 15)

      expect(result).toContain('p1')
      expect(result).toContain('p2')
      expect(result).not.toContain('p3')
    })

    it('should return empty array when no points in radius', async () => {
      const index = new SpatialIndex2()
      index.insert('p1', 100, 100)

      const result = index.queryRadius(0, 0, 10)

      expect(result).toHaveLength(0)
    })

    it('should include points on boundary', async () => {
      const index = new SpatialIndex2()
      index.insert('p1', 10, 10)

      const result = index.queryRadius(0, 0, 14.1422)

      expect(result).toContain('p1')
    })

    it('should handle radius spanning multiple grid cells', async () => {
      const index = new SpatialIndex2()
      index.insert('p1', 50, 50)
      index.insert('p2', 150, 50)
      index.insert('p3', 150, 150)

      const result = index.queryRadius(100, 100, 80)

      expect(result).toContain('p1')
      expect(result).toContain('p2')
      expect(result).toContain('p3')
    })
  })

  describe('size', () => {
    it('should return 0 for empty index', async () => {
      const index = new SpatialIndex2()
      expect(index.size).toBe(0)
    })

    it('should return count of points', async () => {
      const index = new SpatialIndex2()
      index.insert('p1', 10, 20)
      index.insert('p2', 30, 40)

      expect(index.size).toBe(2)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty index', async () => {
      const index = new SpatialIndex2()
      expect(index.isEmpty()).toBe(true)
    })

    it('should return false for non-empty index', async () => {
      const index = new SpatialIndex2()
      index.insert('p1', 10, 20)

      expect(index.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('should remove all points', async () => {
      const index = new SpatialIndex2()
      index.insert('p1', 10, 20)
      index.insert('p2', 30, 40)

      index.clear()

      expect(index.size).toBe(0)
      expect(index.isEmpty()).toBe(true)
      expect(index.has('p1')).toBe(false)
      expect(index.has('p2')).toBe(false)
    })

    it('should be safe to call on empty index', async () => {
      const index = new SpatialIndex2()
      index.clear()

      expect(index.size).toBe(0)
      expect(index.isEmpty()).toBe(true)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty index', async () => {
      const index = new SpatialIndex2()
      const result = index.toArray()

      expect(result).toHaveLength(0)
    })

    it('should return all points', async () => {
      const index = new SpatialIndex2()
      index.insert('p1', 10, 20)
      index.insert('p2', 30, 40)

      const result = index.toArray()

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({id: 'p1', x: 10, y: 20})
      expect(result[1]).toEqual({id: 'p2', x: 30, y: 40})
    })
  })

  describe('edge cases', () => {
    it('should handle duplicate insertions correctly', async () => {
      const index = new SpatialIndex2()
      index.insert('p1', 10, 20)
      index.insert('p1', 10, 20)

      expect(index.size).toBe(1)
    })

    it('should handle removal of non-existent id', async () => {
      const index = new SpatialIndex2()
      const result = index.remove('nonexistent')

      expect(result).toBe(false)
    })

    it('should handle large coordinates', async () => {
      const index = new SpatialIndex2()
      index.insert('p1', 1000000, 2000000)

      expect(index.get('p1')).toEqual({x: 1000000, y: 2000000})
    })
  })

  describe('overlapping points', () => {
    it('should handle points at same location with different ids', async () => {
      const index = new SpatialIndex2()
      index.insert('p1', 10, 20)
      index.insert('p2', 10, 20)

      expect(index.size).toBe(2)
      expect(index.get('p1')).toEqual({x: 10, y: 20})
      expect(index.get('p2')).toEqual({x: 10, y: 20})
    })

    it('should query correctly for overlapping points', async () => {
      const index = new SpatialIndex2()
      index.insert('p1', 10, 20)
      index.insert('p2', 10, 20)

      const result = index.queryRange(5, 15, 15, 25)

      expect(result).toContain('p1')
      expect(result).toContain('p2')
    })
  })

  describe('large datasets', () => {
    it('should handle inserting many points', async () => {
      const index = new SpatialIndex2()
      const count = 1000

      for (let i = 0; i < count; i++) {
        index.insert(`p${i}`, i * 10, i * 20)
      }

      expect(index.size).toBe(count)
    })

    it('should efficiently query range in large dataset', async () => {
      const index = new SpatialIndex2()
      const count = 1000

      for (let i = 0; i < count; i++) {
        index.insert(`p${i}`, i * 10, i * 20)
      }

      const result = index.queryRange(100, 200, 300, 400)

      expect(result.length).toBeGreaterThan(0)
      expect(result.length).toBeLessThan(count)
    })

    it('should efficiently query nearest in large dataset', async () => {
      const index = new SpatialIndex2()
      const count = 1000

      for (let i = 0; i < count; i++) {
        index.insert(`p${i}`, i * 10, i * 20)
      }

      const result = index.queryNearest(150, 250, 10)

      expect(result).toHaveLength(10)
    })

    it('should efficiently query radius in large dataset', async () => {
      const index = new SpatialIndex2()
      const count = 1000

      for (let i = 0; i < count; i++) {
        index.insert(`p${i}`, i * 10, i * 20)
      }

      const result = index.queryRadius(150, 250, 50)

      expect(result.length).toBeGreaterThan(0)
      expect(result.length).toBeLessThan(count)
    })

    it('should handle clearing large dataset', async () => {
      const index = new SpatialIndex2()
      const count = 1000

      for (let i = 0; i < count; i++) {
        index.insert(`p${i}`, i * 10, i * 20)
      }

      index.clear()

      expect(index.size).toBe(0)
      expect(index.isEmpty()).toBe(true)
    })

    it('should handle queryNearest', () => {
      const index = new SpatialIndex2()
      index.insert('a', 0, 0)
      index.insert('b', 10, 10)
      index.insert('c', 5, 5)
      const nearest = index.queryNearest(4, 4, 2)
      expect(nearest.length).toBeGreaterThan(0)
    })
  })
})
