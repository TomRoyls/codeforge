import { describe, it, expect, beforeEach } from 'vitest'
import { SpacePartitionTree } from '../../src/core/space-partition-tree/space-partition-tree.js'
import { DEFAULT_MAX_DEPTH, DEFAULT_MAX_ITEMS } from '../../src/core/space-partition-tree/types.js'
import type { SpacePartitionTreeOptions, SpatialItem, SpaceNode } from '../../src/core/space-partition-tree/types.js'

describe('SpacePartitionTree', () => {
  const defaultBounds = { minX: 0, minY: 0, maxX: 100, maxY: 100 }
  let tree: SpacePartitionTree<string>

  beforeEach(() => {
    tree = new SpacePartitionTree<string>(defaultBounds)
  })

  describe('constructor', () => {
    it('should create tree with default maxDepth and maxItems', () => {
      const spt = new SpacePartitionTree(defaultBounds)
      expect(spt.size).toBe(0)
      expect(spt.depth).toBe(0)
    })

    it('should accept custom maxDepth', () => {
      const spt = new SpacePartitionTree<string>(defaultBounds, 4, 8)
      expect(spt.size).toBe(0)
    })

    it('should accept custom maxItems', () => {
      const spt = new SpacePartitionTree<string>(defaultBounds, 8, 2)
      expect(spt.size).toBe(0)
    })

    it('should store bounds correctly', () => {
      expect(tree.getBounds()).toEqual(defaultBounds)
    })

    it('should use DEFAULT_MAX_DEPTH', () => {
      expect(DEFAULT_MAX_DEPTH).toBe(8)
    })

    it('should use DEFAULT_MAX_ITEMS', () => {
      expect(DEFAULT_MAX_ITEMS).toBe(4)
    })

    it('should handle negative coordinate bounds', () => {
      const spt = new SpacePartitionTree({ minX: -100, minY: -100, maxX: 0, maxY: 0 })
      expect(spt.getBounds()).toEqual({ minX: -100, minY: -100, maxX: 0, maxY: 0 })
    })

    it('should handle small bounds', () => {
      const spt = new SpacePartitionTree({ minX: 0, minY: 0, maxX: 1, maxY: 1 })
      expect(spt.getBounds().maxX).toBe(1)
    })
  })

  describe('insert', () => {
    it('should insert a single item', () => {
      expect(tree.insert(10, 10, 'a')).toBe(true)
      expect(tree.size).toBe(1)
    })

    it('should return false for point outside bounds', () => {
      expect(tree.insert(-1, -1, 'a')).toBe(false)
      expect(tree.insert(100, 50, 'a')).toBe(false)
      expect(tree.insert(50, 100, 'a')).toBe(false)
      expect(tree.size).toBe(0)
    })

    it('should insert multiple items', () => {
      tree.insert(10, 10, 'a')
      tree.insert(20, 20, 'b')
      tree.insert(30, 30, 'c')
      expect(tree.size).toBe(3)
    })

    it('should subdivide when maxItems is exceeded', () => {
      const spt = new SpacePartitionTree<string>(defaultBounds, 8, 2)
      spt.insert(10, 10, 'a')
      spt.insert(20, 20, 'b')
      spt.insert(30, 30, 'c')
      expect(spt.size).toBe(3)
      expect(spt.depth).toBeGreaterThan(1)
    })

    it('should handle points on boundary edges', () => {
      expect(tree.insert(0, 0, 'origin')).toBe(true)
      expect(tree.insert(99, 0, 'right')).toBe(true)
      expect(tree.insert(0, 99, 'bottom')).toBe(true)
      expect(tree.size).toBe(3)
    })

    it('should reject point at maxX edge', () => {
      expect(tree.insert(100, 50, 'out')).toBe(false)
    })

    it('should reject point at maxY edge', () => {
      expect(tree.insert(50, 100, 'out')).toBe(false)
    })

    it('should handle floating point coordinates', () => {
      expect(tree.insert(1.5, 2.5, 'fp')).toBe(true)
      expect(tree.size).toBe(1)
    })

    it('should handle duplicate positions', () => {
      tree.insert(10, 10, 'first')
      tree.insert(10, 10, 'second')
      expect(tree.size).toBe(2)
    })

    it('should insert up to maxItems without subdividing', () => {
      const spt = new SpacePartitionTree<string>(defaultBounds, 8, 4)
      spt.insert(10, 10, 'a')
      spt.insert(20, 20, 'b')
      spt.insert(30, 30, 'c')
      spt.insert(40, 40, 'd')
      expect(spt.size).toBe(4)
      expect(spt.depth).toBe(1)
    })

    it('should subdivide on the (maxItems+1)th insert', () => {
      const spt = new SpacePartitionTree<string>(defaultBounds, 8, 4)
      spt.insert(10, 10, 'a')
      spt.insert(20, 20, 'b')
      spt.insert(30, 30, 'c')
      spt.insert(40, 40, 'd')
      spt.insert(50, 50, 'e')
      expect(spt.size).toBe(5)
      expect(spt.depth).toBeGreaterThan(1)
    })

    it('should return boolean', () => {
      const r1 = tree.insert(50, 50, 'a')
      const r2 = tree.insert(200, 200, 'b')
      expect(r1).toBe(true)
      expect(r2).toBe(false)
    })

    it('should respect maxDepth limit', () => {
      const spt = new SpacePartitionTree<string>(defaultBounds, 2, 1)
      spt.insert(10, 10, 'a')
      spt.insert(11, 11, 'b')
      spt.insert(12, 12, 'c')
      spt.insert(13, 13, 'd')
      spt.insert(14, 14, 'e')
      expect(spt.size).toBe(5)
    })

    it('should distribute items to correct quadrant NE', () => {
      const spt = new SpacePartitionTree<string>(defaultBounds, 8, 1)
      spt.insert(75, 25, 'ne')
      expect(spt.contains(75, 25, 'ne')).toBe(true)
    })

    it('should distribute items to correct quadrant NW', () => {
      const spt = new SpacePartitionTree<string>(defaultBounds, 8, 1)
      spt.insert(25, 25, 'nw')
      expect(spt.contains(25, 25, 'nw')).toBe(true)
    })

    it('should distribute items to correct quadrant SE', () => {
      const spt = new SpacePartitionTree<string>(defaultBounds, 8, 1)
      spt.insert(75, 75, 'se')
      expect(spt.contains(75, 75, 'se')).toBe(true)
    })

    it('should distribute items to correct quadrant SW', () => {
      const spt = new SpacePartitionTree<string>(defaultBounds, 8, 1)
      spt.insert(25, 75, 'sw')
      expect(spt.contains(25, 75, 'sw')).toBe(true)
    })
  })

  describe('remove', () => {
    it('should remove an existing item', () => {
      tree.insert(10, 10, 'a')
      expect(tree.remove(10, 10)).toBe(true)
      expect(tree.size).toBe(0)
    })

    it('should remove with data match', () => {
      tree.insert(10, 10, 'a')
      expect(tree.remove(10, 10, 'a')).toBe(true)
      expect(tree.size).toBe(0)
    })

    it('should not remove when data does not match', () => {
      tree.insert(10, 10, 'a')
      expect(tree.remove(10, 10, 'b')).toBe(false)
      expect(tree.size).toBe(1)
    })

    it('should return false for non-existent point', () => {
      expect(tree.remove(10, 10)).toBe(false)
    })

    it('should return false for point outside bounds', () => {
      expect(tree.remove(-1, -1)).toBe(false)
    })

    it('should remove correct item among many', () => {
      tree.insert(10, 10, 'a')
      tree.insert(20, 20, 'b')
      tree.insert(30, 30, 'c')
      expect(tree.remove(20, 20)).toBe(true)
      expect(tree.size).toBe(2)
      expect(tree.contains(20, 20)).toBe(false)
      expect(tree.contains(10, 10)).toBe(true)
      expect(tree.contains(30, 30)).toBe(true)
    })

    it('should remove from subdivided tree', () => {
      const spt = new SpacePartitionTree<string>(defaultBounds, 8, 2)
      spt.insert(10, 10, 'a')
      spt.insert(20, 20, 'b')
      spt.insert(30, 30, 'c')
      expect(spt.remove(20, 20)).toBe(true)
      expect(spt.size).toBe(2)
    })

    it('should handle removing first of duplicates', () => {
      tree.insert(10, 10, 'first')
      tree.insert(10, 10, 'second')
      expect(tree.remove(10, 10, 'first')).toBe(true)
      expect(tree.size).toBe(1)
      expect(tree.contains(10, 10)).toBe(true)
    })

    it('should handle removing second of duplicates', () => {
      tree.insert(10, 10, 'first')
      tree.insert(10, 10, 'second')
      expect(tree.remove(10, 10, 'second')).toBe(true)
      expect(tree.size).toBe(1)
      expect(tree.contains(10, 10, 'first')).toBe(true)
    })

    it('should handle removing from empty tree', () => {
      expect(tree.remove(50, 50)).toBe(false)
    })

    it('should remove with data from duplicates at same position', () => {
      tree.insert(10, 10, 'a')
      tree.insert(10, 10, 'b')
      tree.insert(10, 10, 'c')
      expect(tree.remove(10, 10, 'b')).toBe(true)
      expect(tree.size).toBe(2)
      expect(tree.contains(10, 10, 'a')).toBe(true)
      expect(tree.contains(10, 10, 'c')).toBe(true)
      expect(tree.contains(10, 10, 'b')).toBe(false)
    })

    it('should remove all items at position with successive calls', () => {
      tree.insert(10, 10, 'a')
      tree.insert(10, 10, 'b')
      expect(tree.remove(10, 10)).toBe(true)
      expect(tree.remove(10, 10)).toBe(true)
      expect(tree.size).toBe(0)
    })
  })

  describe('query (bounds)', () => {
    it('should return empty array for no matches', () => {
      tree.insert(10, 10, 'a')
      const result = tree.query({ minX: 50, minY: 50, maxX: 60, maxY: 60 })
      expect(result).toEqual([])
    })

    it('should return matching items', () => {
      tree.insert(10, 10, 'a')
      tree.insert(20, 20, 'b')
      tree.insert(30, 30, 'c')
      const result = tree.query({ minX: 0, minY: 0, maxX: 25, maxY: 25 })
      expect(result.length).toBe(2)
    })

    it('should return all items in large query', () => {
      tree.insert(10, 10, 'a')
      tree.insert(50, 50, 'b')
      tree.insert(90, 90, 'c')
      const result = tree.query({ minX: 0, minY: 0, maxX: 100, maxY: 100 })
      expect(result.length).toBe(3)
    })

    it('should return empty for empty tree', () => {
      const result = tree.query({ minX: 0, minY: 0, maxX: 100, maxY: 100 })
      expect(result).toEqual([])
    })

    it('should handle query outside bounds', () => {
      tree.insert(10, 10, 'a')
      const result = tree.query({ minX: 200, minY: 200, maxX: 210, maxY: 210 })
      expect(result).toEqual([])
    })

    it('should find items on query boundary', () => {
      tree.insert(0, 0, 'origin')
      const result = tree.query({ minX: 0, minY: 0, maxX: 10, maxY: 10 })
      expect(result.length).toBe(1)
    })

    it('should exclude items on maxX edge of query', () => {
      tree.insert(10, 10, 'edge')
      const result = tree.query({ minX: 0, minY: 0, maxX: 10, maxY: 10 })
      expect(result.length).toBe(0)
    })

    it('should work on subdivided tree', () => {
      const spt = new SpacePartitionTree<string>(defaultBounds, 8, 1)
      spt.insert(10, 10, 'a')
      spt.insert(80, 80, 'b')
      spt.insert(10, 80, 'c')
      spt.insert(80, 10, 'd')
      const result = spt.query({ minX: 0, minY: 0, maxX: 50, maxY: 50 })
      expect(result.length).toBe(1)
      expect(result[0]!.data).toBe('a')
    })

    it('should return items with correct data', () => {
      tree.insert(42, 43, 'val')
      const result = tree.query({ minX: 0, minY: 0, maxX: 100, maxY: 100 })
      expect(result[0]!.x).toBe(42)
      expect(result[0]!.y).toBe(43)
      expect(result[0]!.data).toBe('val')
    })

    it('should handle partial overlap query', () => {
      tree.insert(95, 50, 'a')
      const result = tree.query({ minX: 90, minY: 0, maxX: 110, maxY: 100 })
      expect(result.length).toBe(1)
    })
  })

  describe('queryRadius', () => {
    it('should return items within radius', () => {
      tree.insert(50, 50, 'center')
      tree.insert(55, 50, 'near')
      tree.insert(90, 90, 'far')
      const result = tree.queryRadius(50, 50, 10)
      expect(result.length).toBe(2)
    })

    it('should return empty when no items within radius', () => {
      tree.insert(90, 90, 'far')
      const result = tree.queryRadius(10, 10, 5)
      expect(result).toEqual([])
    })

    it('should return empty for empty tree', () => {
      const result = tree.queryRadius(50, 50, 10)
      expect(result).toEqual([])
    })

    it('should include items exactly on radius boundary', () => {
      tree.insert(60, 50, 'edge')
      const result = tree.queryRadius(50, 50, 10)
      expect(result.length).toBe(1)
    })

    it('should handle zero radius', () => {
      tree.insert(50, 50, 'center')
      const result = tree.queryRadius(50, 50, 0)
      expect(result.length).toBe(1)
    })

    it('should find all items with large radius', () => {
      tree.insert(10, 10, 'a')
      tree.insert(90, 90, 'b')
      const result = tree.queryRadius(50, 50, 100)
      expect(result.length).toBe(2)
    })

    it('should handle floating point coordinates', () => {
      tree.insert(50.5, 50.5, 'fp')
      const result = tree.queryRadius(50, 50, 1)
      expect(result.length).toBe(1)
    })

    it('should exclude items outside radius but in bounding box', () => {
      tree.insert(50, 50, 'center')
      tree.insert(50, 59, 'corner')
      const result = tree.queryRadius(50, 50, 5)
      expect(result.length).toBe(1)
      expect(result[0]!.data).toBe('center')
    })
  })

  describe('contains', () => {
    it('should return true for existing item', () => {
      tree.insert(10, 10, 'a')
      expect(tree.contains(10, 10)).toBe(true)
    })

    it('should return true with matching data', () => {
      tree.insert(10, 10, 'a')
      expect(tree.contains(10, 10, 'a')).toBe(true)
    })

    it('should return false with non-matching data', () => {
      tree.insert(10, 10, 'a')
      expect(tree.contains(10, 10, 'b')).toBe(false)
    })

    it('should return false for non-existent point', () => {
      expect(tree.contains(5, 5)).toBe(false)
    })

    it('should return false for point outside bounds', () => {
      expect(tree.contains(-1, -1)).toBe(false)
    })

    it('should return false for empty tree', () => {
      expect(tree.contains(50, 50)).toBe(false)
    })

    it('should find item after subdivision', () => {
      const spt = new SpacePartitionTree<string>(defaultBounds, 8, 1)
      spt.insert(10, 10, 'a')
      spt.insert(80, 80, 'b')
      expect(spt.contains(10, 10)).toBe(true)
      expect(spt.contains(80, 80)).toBe(true)
    })

    it('should handle duplicates with data filter', () => {
      tree.insert(10, 10, 'a')
      tree.insert(10, 10, 'b')
      expect(tree.contains(10, 10, 'a')).toBe(true)
      expect(tree.contains(10, 10, 'b')).toBe(true)
      expect(tree.contains(10, 10, 'c')).toBe(false)
    })

    it('should find item without data param when multiple exist at position', () => {
      tree.insert(10, 10, 'a')
      tree.insert(10, 10, 'b')
      expect(tree.contains(10, 10)).toBe(true)
    })
  })

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      expect(tree.size).toBe(0)
    })

    it('should increase after insert', () => {
      tree.insert(10, 10, 'a')
      expect(tree.size).toBe(1)
    })

    it('should decrease after remove', () => {
      tree.insert(10, 10, 'a')
      tree.remove(10, 10)
      expect(tree.size).toBe(0)
    })

    it('should count correctly in subdivided tree', () => {
      const spt = new SpacePartitionTree<string>(defaultBounds, 8, 1)
      spt.insert(10, 10, 'a')
      spt.insert(80, 80, 'b')
      spt.insert(10, 80, 'c')
      expect(spt.size).toBe(3)
    })

    it('should reflect multiple inserts and removes', () => {
      tree.insert(10, 10, 'a')
      tree.insert(20, 20, 'b')
      tree.insert(30, 30, 'c')
      tree.remove(20, 20)
      expect(tree.size).toBe(2)
    })
  })

  describe('depth', () => {
    it('should return 0 for empty tree', () => {
      expect(tree.depth).toBe(0)
    })

    it('should return 1 for non-empty leaf', () => {
      tree.insert(10, 10, 'a')
      expect(tree.depth).toBe(1)
    })

    it('should increase after subdivision', () => {
      const spt = new SpacePartitionTree<string>(defaultBounds, 8, 1)
      spt.insert(10, 10, 'a')
      spt.insert(80, 80, 'b')
      expect(spt.depth).toBeGreaterThan(1)
    })

    it('should grow with more points in same quadrant', () => {
      const spt = new SpacePartitionTree<string>(defaultBounds, 8, 1)
      spt.insert(10, 10, 'a')
      spt.insert(11, 11, 'b')
      spt.insert(12, 12, 'c')
      expect(spt.depth).toBeGreaterThan(2)
    })

    it('should respect maxDepth', () => {
      const spt = new SpacePartitionTree<string>(defaultBounds, 2, 1)
      for (let i = 0; i < 10; i++) {
        spt.insert(10 + i, 10 + i, `p${i}`)
      }
      expect(spt.depth).toBeLessThanOrEqual(3)
    })
  })

  describe('clear', () => {
    it('should remove all items', () => {
      tree.insert(10, 10, 'a')
      tree.insert(20, 20, 'b')
      tree.clear()
      expect(tree.size).toBe(0)
    })

    it('should reset depth', () => {
      tree.insert(10, 10, 'a')
      tree.clear()
      expect(tree.depth).toBe(0)
    })

    it('should handle clearing empty tree', () => {
      tree.clear()
      expect(tree.size).toBe(0)
    })

    it('should allow insertions after clear', () => {
      tree.insert(10, 10, 'a')
      tree.clear()
      tree.insert(20, 20, 'b')
      expect(tree.size).toBe(1)
      expect(tree.contains(20, 20)).toBe(true)
    })

    it('should allow insertions after clearing subdivided tree', () => {
      const spt = new SpacePartitionTree<string>(defaultBounds, 8, 1)
      spt.insert(10, 10, 'a')
      spt.insert(80, 80, 'b')
      spt.clear()
      spt.insert(30, 30, 'c')
      expect(spt.size).toBe(1)
      expect(spt.contains(30, 30)).toBe(true)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.toArray()).toEqual([])
    })

    it('should return all items', () => {
      tree.insert(10, 10, 'a')
      tree.insert(20, 20, 'b')
      const arr = tree.toArray()
      expect(arr.length).toBe(2)
    })

    it('should return items with correct data', () => {
      tree.insert(10, 10, 'a')
      const arr = tree.toArray()
      expect(arr[0]!.x).toBe(10)
      expect(arr[0]!.y).toBe(10)
      expect(arr[0]!.data).toBe('a')
    })

    it('should return all items from subdivided tree', () => {
      const spt = new SpacePartitionTree<string>(defaultBounds, 8, 1)
      spt.insert(10, 10, 'a')
      spt.insert(80, 80, 'b')
      spt.insert(10, 80, 'c')
      spt.insert(80, 10, 'd')
      expect(spt.toArray().length).toBe(4)
    })

    it('should reflect state after removal', () => {
      tree.insert(10, 10, 'a')
      tree.insert(20, 20, 'b')
      tree.remove(10, 10)
      const arr = tree.toArray()
      expect(arr.length).toBe(1)
      expect(arr[0]!.data).toBe('b')
    })
  })

  describe('nearest', () => {
    it('should find single nearest item', () => {
      tree.insert(10, 10, 'a')
      tree.insert(50, 50, 'b')
      const result = tree.nearest(12, 12)
      expect(result.length).toBe(1)
      expect(result[0]!.data).toBe('a')
      expect(result[0]!.distance).toBeCloseTo(Math.sqrt(8))
    })

    it('should find k nearest items', () => {
      tree.insert(10, 10, 'a')
      tree.insert(15, 15, 'b')
      tree.insert(50, 50, 'c')
      tree.insert(80, 80, 'd')
      const result = tree.nearest(12, 12, 2)
      expect(result.length).toBe(2)
      expect(result[0]!.data).toBe('a')
      expect(result[1]!.data).toBe('b')
    })

    it('should return fewer results if tree has fewer items than k', () => {
      tree.insert(10, 10, 'a')
      const result = tree.nearest(50, 50, 5)
      expect(result.length).toBe(1)
    })

    it('should return empty for empty tree', () => {
      const result = tree.nearest(50, 50)
      expect(result).toEqual([])
    })

    it('should return correct distance for exact match', () => {
      tree.insert(50, 50, 'center')
      const result = tree.nearest(50, 50)
      expect(result[0]!.distance).toBe(0)
    })

    it('should sort by distance', () => {
      tree.insert(10, 10, 'a')
      tree.insert(20, 20, 'b')
      tree.insert(30, 30, 'c')
      const result = tree.nearest(25, 25, 3)
      expect(result[0]!.distance).toBeLessThanOrEqual(result[1]!.distance)
      expect(result[1]!.distance).toBeLessThanOrEqual(result[2]!.distance)
    })

    it('should use default k=1', () => {
      tree.insert(10, 10, 'a')
      tree.insert(20, 20, 'b')
      const result = tree.nearest(15, 15)
      expect(result.length).toBe(1)
    })

    it('should find nearest across quadrants', () => {
      tree.insert(10, 10, 'nw')
      tree.insert(90, 90, 'se')
      const result = tree.nearest(85, 85)
      expect(result[0]!.data).toBe('se')
    })

    it('should include distance in results', () => {
      tree.insert(10, 10, 'a')
      const result = tree.nearest(13, 14)
      expect(result[0]!.distance).toBeCloseTo(5)
    })
  })

  describe('getBounds', () => {
    it('should return correct bounds', () => {
      expect(tree.getBounds()).toEqual(defaultBounds)
    })

    it('should return bounds for custom input', () => {
      const spt = new SpacePartitionTree({ minX: -50, minY: -50, maxX: 50, maxY: 50 })
      expect(spt.getBounds()).toEqual({ minX: -50, minY: -50, maxX: 50, maxY: 50 })
    })
  })

  describe('toNode', () => {
    it('should return root node structure', () => {
      const node = tree.toNode()
      expect(node.minX).toBe(0)
      expect(node.minY).toBe(0)
      expect(node.maxX).toBe(100)
      expect(node.maxY).toBe(100)
      expect(node.items).toEqual([])
      expect(node.children).toBeNull()
      expect(node.depth).toBe(0)
    })

    it('should include items in node', () => {
      tree.insert(10, 10, 'a')
      const node = tree.toNode()
      expect(node.items.length).toBe(1)
      expect(node.items[0]!.data).toBe('a')
    })

    it('should show children after subdivision', () => {
      const spt = new SpacePartitionTree<string>(defaultBounds, 8, 1)
      spt.insert(10, 10, 'a')
      spt.insert(80, 80, 'b')
      const node = spt.toNode()
      expect(node.children).not.toBeNull()
      expect(node.children!.length).toBe(4)
    })

    it('should not share references with internal state', () => {
      tree.insert(10, 10, 'a')
      const node = tree.toNode()
      node.items.push({ x: 99, y: 99, data: 'tampered' })
      expect(tree.size).toBe(1)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_MAX_DEPTH', () => {
      expect(DEFAULT_MAX_DEPTH).toBe(8)
    })

    it('should export DEFAULT_MAX_ITEMS', () => {
      expect(DEFAULT_MAX_ITEMS).toBe(4)
    })

    it('should support SpacePartitionTreeOptions interface', () => {
      const opts: SpacePartitionTreeOptions = { minX: 0, minY: 0, maxX: 100, maxY: 100 }
      expect(opts.maxX).toBe(100)
    })

    it('should support SpatialItem interface', () => {
      const item: SpatialItem<string> = { x: 1, y: 2, data: 'test' }
      expect(item.data).toBe('test')
    })

    it('should support SpaceNode interface', () => {
      const node: SpaceNode<string> = {
        minX: 0, minY: 0, maxX: 100, maxY: 100,
        items: [], children: null, depth: 0,
      }
      expect(node.depth).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('should handle single item', () => {
      tree.insert(50, 50, 'only')
      expect(tree.size).toBe(1)
      expect(tree.contains(50, 50)).toBe(true)
      expect(tree.depth).toBe(1)
    })

    it('should handle duplicate positions with different data', () => {
      tree.insert(10, 10, 'first')
      tree.insert(10, 10, 'second')
      expect(tree.size).toBe(2)
      expect(tree.contains(10, 10, 'first')).toBe(true)
      expect(tree.contains(10, 10, 'second')).toBe(true)
    })

    it('should handle points on boundaries', () => {
      expect(tree.insert(0, 0, 'tl')).toBe(true)
      expect(tree.insert(0, 99, 'bl')).toBe(true)
      expect(tree.contains(0, 0)).toBe(true)
      expect(tree.contains(0, 99)).toBe(true)
    })

    it('should handle removing all items', () => {
      tree.insert(10, 10, 'a')
      tree.insert(20, 20, 'b')
      tree.remove(10, 10)
      tree.remove(20, 20)
      expect(tree.size).toBe(0)
    })

    it('should handle very small bounds', () => {
      const spt = new SpacePartitionTree<string>({ minX: 0, minY: 0, maxX: 1, maxY: 1 }, 4, 4)
      expect(spt.insert(0.1, 0.1, 'a')).toBe(true)
      expect(spt.insert(0.9, 0.9, 'b')).toBe(true)
      expect(spt.size).toBe(2)
    })

    it('should handle subdivision with all items in same quadrant', () => {
      const spt = new SpacePartitionTree<string>(defaultBounds, 8, 1)
      spt.insert(10, 10, 'a')
      spt.insert(11, 11, 'b')
      spt.insert(12, 12, 'c')
      spt.insert(13, 13, 'd')
      expect(spt.size).toBe(4)
      expect(spt.contains(13, 13)).toBe(true)
    })

    it('should handle query with partial overlap', () => {
      tree.insert(95, 50, 'a')
      const result = tree.query({ minX: 90, minY: 0, maxX: 110, maxY: 100 })
      expect(result.length).toBe(1)
    })

    it('should handle queryRadius at corner of bounds', () => {
      tree.insert(1, 1, 'a')
      tree.insert(50, 50, 'b')
      const result = tree.queryRadius(0, 0, 5)
      expect(result.length).toBe(1)
      expect(result[0]!.data).toBe('a')
    })

    it('should handle null data values', () => {
      const spt = new SpacePartitionTree<null>(defaultBounds)
      spt.insert(10, 10, null)
      expect(spt.contains(10, 10)).toBe(true)
      expect(spt.contains(10, 10, null)).toBe(true)
    })

    it('should handle numeric data values', () => {
      const spt = new SpacePartitionTree<number>(defaultBounds)
      spt.insert(10, 10, 42)
      spt.insert(20, 20, 0)
      expect(spt.contains(10, 10, 42)).toBe(true)
      expect(spt.contains(20, 20, 0)).toBe(true)
    })

    it('should handle object data values', () => {
      const spt = new SpacePartitionTree<{ name: string }>(defaultBounds)
      const obj = { name: 'point-a' }
      spt.insert(10, 10, obj)
      expect(spt.contains(10, 10, obj)).toBe(true)
    })
  })

  describe('spatial query correctness', () => {
    it('should return correct items for NW quadrant query', () => {
      tree.insert(10, 10, 'nw')
      tree.insert(80, 10, 'ne')
      tree.insert(10, 80, 'sw')
      tree.insert(80, 80, 'se')
      const result = tree.query({ minX: 0, minY: 0, maxX: 50, maxY: 50 })
      expect(result.length).toBe(1)
      expect(result[0]!.data).toBe('nw')
    })

    it('should return correct items for NE quadrant query', () => {
      tree.insert(10, 10, 'nw')
      tree.insert(80, 10, 'ne')
      tree.insert(10, 80, 'sw')
      tree.insert(80, 80, 'se')
      const result = tree.query({ minX: 50, minY: 0, maxX: 100, maxY: 50 })
      expect(result.length).toBe(1)
      expect(result[0]!.data).toBe('ne')
    })

    it('should return correct items for SW quadrant query', () => {
      tree.insert(10, 10, 'nw')
      tree.insert(80, 10, 'ne')
      tree.insert(10, 80, 'sw')
      tree.insert(80, 80, 'se')
      const result = tree.query({ minX: 0, minY: 50, maxX: 50, maxY: 100 })
      expect(result.length).toBe(1)
      expect(result[0]!.data).toBe('sw')
    })

    it('should return correct items for SE quadrant query', () => {
      tree.insert(10, 10, 'nw')
      tree.insert(80, 10, 'ne')
      tree.insert(10, 80, 'sw')
      tree.insert(80, 80, 'se')
      const result = tree.query({ minX: 50, minY: 50, maxX: 100, maxY: 100 })
      expect(result.length).toBe(1)
      expect(result[0]!.data).toBe('se')
    })

    it('should return all items for full range query', () => {
      tree.insert(10, 10, 'a')
      tree.insert(50, 50, 'b')
      tree.insert(90, 90, 'c')
      const result = tree.query({ minX: 0, minY: 0, maxX: 100, maxY: 100 })
      expect(result.length).toBe(3)
    })

    it('should handle query spanning multiple quadrants', () => {
      tree.insert(10, 10, 'a')
      tree.insert(80, 10, 'b')
      tree.insert(10, 80, 'c')
      tree.insert(80, 80, 'd')
      const result = tree.query({ minX: 0, minY: 0, maxX: 100, maxY: 100 })
      expect(result.length).toBe(4)
    })
  })

  describe('mixed operations', () => {
    it('should handle insert, contains, remove cycle', () => {
      tree.insert(10, 10, 'a')
      expect(tree.contains(10, 10)).toBe(true)
      tree.remove(10, 10)
      expect(tree.contains(10, 10)).toBe(false)
      tree.insert(10, 10, 'a2')
      expect(tree.contains(10, 10, 'a2')).toBe(true)
    })

    it('should handle clear and rebuild', () => {
      tree.insert(10, 10, 'a')
      tree.clear()
      expect(tree.size).toBe(0)
      tree.insert(20, 20, 'b')
      tree.insert(30, 30, 'c')
      expect(tree.size).toBe(2)
      expect(tree.toArray().length).toBe(2)
    })

    it('should handle toArray after remove', () => {
      tree.insert(10, 10, 'a')
      tree.insert(20, 20, 'b')
      tree.insert(30, 30, 'c')
      tree.remove(20, 20)
      const arr = tree.toArray()
      expect(arr.length).toBe(2)
    })
  })

  describe('stress tests', () => {
    it('should handle 10000+ items', () => {
      const spt = new SpacePartitionTree<number>(
        { minX: 0, minY: 0, maxX: 1000, maxY: 1000 }, 8, 4,
      )
      for (let i = 0; i < 10000; i++) {
        spt.insert(i % 1000, Math.floor(i / 1000), i)
      }
      expect(spt.size).toBe(10000)
    })

    it('should handle large tree query correctly', () => {
      const spt = new SpacePartitionTree<number>(
        { minX: 0, minY: 0, maxX: 1000, maxY: 1000 }, 8, 4,
      )
      for (let i = 0; i < 1000; i++) {
        for (let j = 0; j < 10; j++) {
          spt.insert(i, j, i * 10 + j)
        }
      }
      const result = spt.query({ minX: 0, minY: 0, maxX: 10, maxY: 10 })
      expect(result.length).toBe(100)
    })

    it('should handle large tree queryRadius correctly', () => {
      const spt = new SpacePartitionTree<number>(
        { minX: 0, minY: 0, maxX: 100, maxY: 100 }, 8, 4,
      )
      for (let i = 0; i < 100; i++) {
        spt.insert(i, 50, i)
      }
      const result = spt.queryRadius(50, 50, 5)
      expect(result.length).toBe(11)
    })

    it('should handle large tree nearest correctly', () => {
      const spt = new SpacePartitionTree<number>(
        { minX: 0, minY: 0, maxX: 100, maxY: 100 }, 8, 4,
      )
      for (let i = 0; i < 100; i++) {
        spt.insert(i, 50, i)
      }
      const result = spt.nearest(50, 50, 3)
      expect(result.length).toBe(3)
      expect(result[0]!.distance).toBe(0)
    })

    it('should handle sequential insert and remove', () => {
      for (let i = 0; i < 100; i++) {
        tree.insert(i, i, `p${i}`)
      }
      expect(tree.size).toBe(100)
      for (let i = 0; i < 50; i++) {
        tree.remove(i, i)
      }
      expect(tree.size).toBe(50)
      expect(tree.contains(75, 75)).toBe(true)
      expect(tree.contains(25, 25)).toBe(false)
    })

    it('should handle large nearest query', () => {
      const spt = new SpacePartitionTree<number>(
        { minX: 0, minY: 0, maxX: 100, maxY: 100 }, 8, 4,
      )
      for (let i = 0; i < 500; i++) {
        spt.insert(i % 100, Math.floor(i / 100), i)
      }
      const result = spt.nearest(50, 50, 20)
      expect(result.length).toBe(20)
      for (let i = 1; i < result.length; i++) {
        expect(result[i]!.distance).toBeGreaterThanOrEqual(result[i - 1]!.distance)
      }
    })
  })
})
