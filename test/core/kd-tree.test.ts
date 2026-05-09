import { describe, it, expect, beforeEach } from 'vitest'
import { KDTree } from '../../src/core/kd-tree/kd-tree.js'
import { DEFAULT_KD_TREE_OPTIONS } from '../../src/core/kd-tree/types.js'
import type { KDTreeOptions, KDPoint, KDNode } from '../../src/core/kd-tree/types.js'

describe('KDTree', () => {
  describe('constructor', () => {
    it('should create a kd tree with default options', () => {
      const tree = new KDTree<string>()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should accept custom options', () => {
      const tree = new KDTree<string>({ dimensions: 3 })
      tree.insert([1, 2, 3], 'a')
      expect(tree.size()).toBe(1)
    })

    it('should accept partial options', () => {
      const tree = new KDTree<string>({ dimensions: 5 })
      expect(tree.size()).toBe(0)
    })

    it('should use DEFAULT_KD_TREE_OPTIONS defaults', () => {
      expect(DEFAULT_KD_TREE_OPTIONS.dimensions).toBe(2)
    })

    it('should create empty tree', () => {
      const tree = new KDTree<number>()
      expect(tree.isEmpty()).toBe(true)
      expect(tree.size()).toBe(0)
    })
  })

  describe('insert', () => {
    let tree: KDTree<string>

    beforeEach(() => {
      tree = new KDTree<string>()
    })

    it('should insert a single point', () => {
      tree.insert([5, 5], 'a')
      expect(tree.size()).toBe(1)
    })

    it('should insert multiple points', () => {
      tree.insert([1, 1], 'a')
      tree.insert([2, 2], 'b')
      tree.insert([3, 3], 'c')
      expect(tree.size()).toBe(3)
    })

    it('should handle negative coordinates', () => {
      tree.insert([-5, -10], 'neg')
      expect(tree.size()).toBe(1)
    })

    it('should handle floating point coordinates', () => {
      tree.insert([0.5, 0.5], 'fp')
      expect(tree.size()).toBe(1)
    })

    it('should handle duplicate points', () => {
      tree.insert([1, 1], 'a')
      tree.insert([1, 1], 'b')
      expect(tree.size()).toBe(2)
    })

    it('should handle zero coordinates', () => {
      tree.insert([0, 0], 'origin')
      expect(tree.size()).toBe(1)
    })

    it('should insert large values', () => {
      tree.insert([1000000, -1000000], 'big')
      expect(tree.size()).toBe(1)
    })

    it('should build correct tree structure by alternating axis', () => {
      tree.insert([5, 5], 'root')
      tree.insert([3, 8], 'left')
      tree.insert([7, 2], 'right')
      expect(tree.search([5, 5])).toBe('root')
      expect(tree.search([3, 8])).toBe('left')
      expect(tree.search([7, 2])).toBe('right')
    })

    it('should insert many points', () => {
      for (let i = 0; i < 50; i++) {
        tree.insert([i, i], `p${i}`)
      }
      expect(tree.size()).toBe(50)
    })
  })

  describe('search', () => {
    let tree: KDTree<string>

    beforeEach(() => {
      tree = new KDTree<string>()
      tree.insert([5, 5], 'a')
      tree.insert([3, 8], 'b')
      tree.insert([7, 2], 'c')
      tree.insert([2, 4], 'd')
      tree.insert([8, 6], 'e')
    })

    it('should find an existing point', () => {
      expect(tree.search([5, 5])).toBe('a')
    })

    it('should find another existing point', () => {
      expect(tree.search([3, 8])).toBe('b')
    })

    it('should return undefined for non-existent point', () => {
      expect(tree.search([99, 99])).toBeUndefined()
    })

    it('should return undefined on empty tree', () => {
      const empty = new KDTree<string>()
      expect(empty.search([1, 1])).toBeUndefined()
    })

    it('should return first value for duplicate points', () => {
      tree.insert([5, 5], 'dup')
      expect(tree.search([5, 5])).toBe('a')
    })

    it('should find all inserted points', () => {
      expect(tree.search([2, 4])).toBe('d')
      expect(tree.search([8, 6])).toBe('e')
    })

    it('should work after removal', () => {
      tree.remove([5, 5])
      expect(tree.search([5, 5])).toBeUndefined()
    })

    it('should handle floating point search', () => {
      tree.insert([0.5, 0.5], 'fp')
      expect(tree.search([0.5, 0.5])).toBe('fp')
    })
  })

  describe('nearestNeighbor', () => {
    let tree: KDTree<string>

    beforeEach(() => {
      tree = new KDTree<string>()
      tree.insert([0, 0], 'origin')
      tree.insert([10, 10], 'far')
      tree.insert([5, 5], 'mid')
    })

    it('should find nearest neighbor', () => {
      const result = tree.nearestNeighbor([4, 4])
      expect(result).toBeDefined()
      expect(result!.value).toBe('mid')
    })

    it('should return exact match when point exists', () => {
      const result = tree.nearestNeighbor([0, 0])
      expect(result).toBeDefined()
      expect(result!.value).toBe('origin')
    })

    it('should return undefined on empty tree', () => {
      const empty = new KDTree<string>()
      expect(empty.nearestNeighbor([1, 1])).toBeUndefined()
    })

    it('should find nearest with single point tree', () => {
      const single = new KDTree<string>()
      single.insert([5, 5], 'only')
      const result = single.nearestNeighbor([0, 0])
      expect(result!.value).toBe('only')
    })

    it('should return point coordinates', () => {
      const result = tree.nearestNeighbor([1, 1])
      expect(result).toBeDefined()
      expect(result!.point).toEqual([0, 0])
    })

    it('should handle equidistant points', () => {
      const eq = new KDTree<string>()
      eq.insert([1, 0], 'a')
      eq.insert([-1, 0], 'b')
      const result = eq.nearestNeighbor([0, 0])
      expect(result).toBeDefined()
      expect(['a', 'b']).toContain(result!.value)
    })

    it('should find nearest among many points', () => {
      const big = new KDTree<string>()
      for (let i = 0; i < 20; i++) {
        big.insert([i * 5, i * 5], `p${i}`)
      }
      const result = big.nearestNeighbor([12, 12])
      expect(result).toBeDefined()
      expect(result!.value).toBe('p2')
    })
  })

  describe('kNearestNeighbors', () => {
    let tree: KDTree<string>

    beforeEach(() => {
      tree = new KDTree<string>()
      tree.insert([0, 0], 'a')
      tree.insert([1, 1], 'b')
      tree.insert([5, 5], 'c')
      tree.insert([10, 10], 'd')
      tree.insert([20, 20], 'e')
    })

    it('should return k nearest neighbors', () => {
      const results = tree.kNearestNeighbors([0, 0], 2)
      expect(results).toHaveLength(2)
      expect(results[0]!.value).toBe('a')
      expect(results[1]!.value).toBe('b')
    })

    it('should return all points if k exceeds tree size', () => {
      const results = tree.kNearestNeighbors([0, 0], 10)
      expect(results).toHaveLength(5)
    })

    it('should return empty array for empty tree', () => {
      const empty = new KDTree<string>()
      expect(empty.kNearestNeighbors([0, 0], 3)).toEqual([])
    })

    it('should return empty array for k = 0', () => {
      expect(tree.kNearestNeighbors([0, 0], 0)).toEqual([])
    })

    it('should include distances', () => {
      const results = tree.kNearestNeighbors([0, 0], 1)
      expect(results[0]!.distance).toBeCloseTo(0)
    })

    it('should sort by distance', () => {
      const results = tree.kNearestNeighbors([3, 3], 5)
      for (let i = 1; i < results.length; i++) {
        expect(results[i]!.distance).toBeGreaterThanOrEqual(results[i - 1]!.distance)
      }
    })

    it('should return correct distances', () => {
      const results = tree.kNearestNeighbors([0, 0], 2)
      expect(results[0]!.distance).toBeCloseTo(0)
      expect(results[1]!.distance).toBeCloseTo(Math.SQRT2)
    })

    it('should return point coordinates', () => {
      const results = tree.kNearestNeighbors([0, 0], 1)
      expect(results[0]!.point).toEqual([0, 0])
    })

    it('should handle k = 1', () => {
      const results = tree.kNearestNeighbors([6, 6], 1)
      expect(results).toHaveLength(1)
      expect(results[0]!.value).toBe('c')
    })
  })

  describe('rangeSearch', () => {
    let tree: KDTree<string>

    beforeEach(() => {
      tree = new KDTree<string>()
      tree.insert([1, 1], 'a')
      tree.insert([5, 5], 'b')
      tree.insert([10, 10], 'c')
      tree.insert([15, 15], 'd')
      tree.insert([20, 20], 'e')
    })

    it('should return points within range', () => {
      const results = tree.rangeSearch([0, 0], [6, 6])
      expect(results).toHaveLength(2)
      const values = results.map((r) => r.value).sort()
      expect(values).toEqual(['a', 'b'])
    })

    it('should return all points for wide range', () => {
      const results = tree.rangeSearch([-100, -100], [100, 100])
      expect(results).toHaveLength(5)
    })

    it('should return empty array for range with no points', () => {
      const results = tree.rangeSearch([50, 50], [60, 60])
      expect(results).toHaveLength(0)
    })

    it('should return single point for exact range', () => {
      const results = tree.rangeSearch([5, 5], [5, 5])
      expect(results).toHaveLength(1)
      expect(results[0]!.value).toBe('b')
    })

    it('should return empty for empty tree', () => {
      const empty = new KDTree<string>()
      expect(empty.rangeSearch([0, 0], [10, 10])).toEqual([])
    })

    it('should include boundary points', () => {
      const results = tree.rangeSearch([10, 10], [20, 20])
      expect(results).toHaveLength(3)
    })

    it('should return point and value pairs', () => {
      const results = tree.rangeSearch([0, 0], [2, 2])
      expect(results).toHaveLength(1)
      expect(results[0]).toEqual({ point: [1, 1], value: 'a' })
    })
  })

  describe('remove', () => {
    let tree: KDTree<string>

    beforeEach(() => {
      tree = new KDTree<string>()
      tree.insert([5, 5], 'a')
      tree.insert([3, 3], 'b')
      tree.insert([7, 7], 'c')
    })

    it('should remove an existing point', () => {
      expect(tree.remove([5, 5])).toBe(true)
      expect(tree.size()).toBe(2)
    })

    it('should return false for non-existent point', () => {
      expect(tree.remove([99, 99])).toBe(false)
      expect(tree.size()).toBe(3)
    })

    it('should remove all points one by one', () => {
      tree.remove([5, 5])
      tree.remove([3, 3])
      tree.remove([7, 7])
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should handle removing from empty tree', () => {
      tree.clear()
      expect(tree.remove([5, 5])).toBe(false)
    })

    it('should not affect other points when removing', () => {
      tree.remove([5, 5])
      expect(tree.search([3, 3])).toBe('b')
      expect(tree.search([7, 7])).toBe('c')
    })

    it('should allow re-insertion after removal', () => {
      tree.remove([5, 5])
      tree.insert([5, 5], 'new')
      expect(tree.search([5, 5])).toBe('new')
    })

    it('should handle removing leaf node', () => {
      expect(tree.remove([3, 3])).toBe(true)
      expect(tree.size()).toBe(2)
    })

    it('should return boolean', () => {
      expect(typeof tree.remove([5, 5])).toBe('boolean')
    })

    it('should remove first match when duplicates exist', () => {
      tree.insert([5, 5], 'dup')
      expect(tree.remove([5, 5])).toBe(true)
      expect(tree.size()).toBe(3)
    })

    it('should maintain tree integrity after removal', () => {
      tree.insert([1, 1], 'd')
      tree.insert([9, 9], 'e')
      tree.remove([5, 5])
      expect(tree.search([1, 1])).toBe('d')
      expect(tree.search([9, 9])).toBe('e')
      expect(tree.search([3, 3])).toBe('b')
    })
  })

  describe('has', () => {
    let tree: KDTree<string>

    beforeEach(() => {
      tree = new KDTree<string>()
      tree.insert([5, 5], 'a')
    })

    it('should return true for existing point', () => {
      expect(tree.has([5, 5])).toBe(true)
    })

    it('should return false for non-existent point', () => {
      expect(tree.has([99, 99])).toBe(false)
    })

    it('should return false on empty tree', () => {
      const empty = new KDTree<string>()
      expect(empty.has([1, 1])).toBe(false)
    })

    it('should work after removal', () => {
      tree.remove([5, 5])
      expect(tree.has([5, 5])).toBe(false)
    })
  })

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      const tree = new KDTree<string>()
      expect(tree.size()).toBe(0)
    })

    it('should return correct count after inserts', () => {
      const tree = new KDTree<string>()
      tree.insert([1, 1], 'a')
      tree.insert([2, 2], 'b')
      expect(tree.size()).toBe(2)
    })

    it('should return correct count after removals', () => {
      const tree = new KDTree<string>()
      tree.insert([1, 1], 'a')
      tree.insert([2, 2], 'b')
      tree.remove([1, 1])
      expect(tree.size()).toBe(1)
    })

    it('should return 0 after clear', () => {
      const tree = new KDTree<string>()
      tree.insert([1, 1], 'a')
      tree.clear()
      expect(tree.size()).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty tree', () => {
      const tree = new KDTree<string>()
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return false after insert', () => {
      const tree = new KDTree<string>()
      tree.insert([1, 1], 'a')
      expect(tree.isEmpty()).toBe(false)
    })

    it('should return true after clearing all points', () => {
      const tree = new KDTree<string>()
      tree.insert([1, 1], 'a')
      tree.clear()
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return true after removing all points', () => {
      const tree = new KDTree<string>()
      tree.insert([1, 1], 'a')
      tree.remove([1, 1])
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all points', () => {
      const tree = new KDTree<string>()
      tree.insert([1, 1], 'a')
      tree.insert([2, 2], 'b')
      tree.clear()
      expect(tree.size()).toBe(0)
    })

    it('should allow insert after clear', () => {
      const tree = new KDTree<string>()
      tree.insert([1, 1], 'a')
      tree.clear()
      tree.insert([3, 3], 'c')
      expect(tree.size()).toBe(1)
    })

    it('should return void', () => {
      const tree = new KDTree<string>()
      expect(tree.clear()).toBeUndefined()
    })

    it('should handle clearing empty tree', () => {
      const tree = new KDTree<string>()
      tree.clear()
      expect(tree.size()).toBe(0)
    })
  })

  describe('forEach', () => {
    it('should iterate over all points', () => {
      const tree = new KDTree<string>()
      tree.insert([1, 1], 'a')
      tree.insert([2, 2], 'b')
      const results: Array<{ point: number[]; value: string }> = []
      tree.forEach((point, value) => results.push({ point, value }))
      expect(results).toHaveLength(2)
    })

    it('should not iterate on empty tree', () => {
      const tree = new KDTree<string>()
      let count = 0
      tree.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should provide correct point and value', () => {
      const tree = new KDTree<string>()
      tree.insert([5, 5], 'test')
      tree.forEach((point, value) => {
        expect(point).toEqual([5, 5])
        expect(value).toBe('test')
      })
    })

    it('should return void', () => {
      const tree = new KDTree<string>()
      expect(tree.forEach(() => {})).toBeUndefined()
    })

    it('should iterate in-order (left-root-right)', () => {
      const tree = new KDTree<string>()
      tree.insert([5, 5], 'root')
      tree.insert([3, 3], 'left')
      tree.insert([7, 7], 'right')
      const values: string[] = []
      tree.forEach((_p, v) => values.push(v))
      expect(values).toEqual(['left', 'root', 'right'])
    })

    it('should handle many points', () => {
      const tree = new KDTree<number>()
      for (let i = 0; i < 50; i++) {
        tree.insert([i, i], i)
      }
      let count = 0
      tree.forEach(() => count++)
      expect(count).toBe(50)
    })
  })

  describe('3D operations', () => {
    let tree: KDTree<string>

    beforeEach(() => {
      tree = new KDTree<string>({ dimensions: 3 })
      tree.insert([0, 0, 0], 'origin')
      tree.insert([1, 2, 3], 'a')
      tree.insert([4, 5, 6], 'b')
      tree.insert([-1, -2, -3], 'c')
    })

    it('should insert and search in 3D', () => {
      expect(tree.search([1, 2, 3])).toBe('a')
    })

    it('should find nearest neighbor in 3D', () => {
      const result = tree.nearestNeighbor([0.5, 0.5, 0.5])
      expect(result).toBeDefined()
      expect(result!.value).toBe('origin')
    })

    it('should do range search in 3D', () => {
      const results = tree.rangeSearch([0, 0, 0], [2, 3, 4])
      expect(results).toHaveLength(2)
    })

    it('should remove in 3D', () => {
      expect(tree.remove([1, 2, 3])).toBe(true)
      expect(tree.size()).toBe(3)
    })

    it('should k nearest neighbors in 3D', () => {
      const results = tree.kNearestNeighbors([0, 0, 0], 3)
      expect(results).toHaveLength(3)
      expect(results[0]!.value).toBe('origin')
    })

    it('should has in 3D', () => {
      expect(tree.has([4, 5, 6])).toBe(true)
      expect(tree.has([99, 99, 99])).toBe(false)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_KD_TREE_OPTIONS', () => {
      expect(DEFAULT_KD_TREE_OPTIONS.dimensions).toBe(2)
    })

    it('should support KDTreeOptions interface', () => {
      const opts: KDTreeOptions = { dimensions: 5 }
      expect(opts.dimensions).toBe(5)
    })

    it('should support KDPoint interface', () => {
      const p: KDPoint = { coordinates: [1, 2] }
      expect(p.coordinates).toEqual([1, 2])
    })

    it('should support KDNode interface', () => {
      const node: KDNode<string> = {
        point: [1, 2],
        value: 'test',
        left: null,
        right: null,
        axis: 0,
      }
      expect(node.value).toBe('test')
      expect(node.point).toEqual([1, 2])
    })
  })

  describe('edge cases', () => {
    it('should handle many points at same location', () => {
      const tree = new KDTree<number>()
      for (let i = 0; i < 10; i++) {
        tree.insert([5, 5], i)
      }
      expect(tree.size()).toBe(10)
    })

    it('should handle generic value types', () => {
      const tree = new KDTree<{ name: string }>()
      tree.insert([1, 1], { name: 'test' })
      const result = tree.search([1, 1])
      expect(result?.name).toBe('test')
    })

    it('should handle null value type', () => {
      const tree = new KDTree<null>()
      tree.insert([1, 1], null)
      expect(tree.search([1, 1])).toBeNull()
    })

    it('should handle undefined value type', () => {
      const tree = new KDTree<undefined>()
      tree.insert([1, 1], undefined)
      expect(tree.search([1, 1])).toBeUndefined()
    })

    it('should handle very close points', () => {
      const tree = new KDTree<string>()
      tree.insert([0, 0], 'a')
      tree.insert([0.0001, 0.0001], 'b')
      const result = tree.nearestNeighbor([0.00005, 0.00005])
      expect(result).toBeDefined()
    })

    it('should handle single element operations', () => {
      const tree = new KDTree<string>()
      tree.insert([1, 1], 'only')
      expect(tree.nearestNeighbor([5, 5])!.value).toBe('only')
      expect(tree.kNearestNeighbors([5, 5], 1)).toHaveLength(1)
      expect(tree.rangeSearch([0, 0], [2, 2])).toHaveLength(1)
    })
  })

  describe('large datasets', () => {
    it('should handle 100 points', () => {
      const tree = new KDTree<number>()
      for (let i = 0; i < 100; i++) {
        tree.insert([i, i], i)
      }
      expect(tree.size()).toBe(100)
    })

    it('should find nearest in large dataset', () => {
      const tree = new KDTree<string>()
      for (let i = 0; i < 100; i++) {
        tree.insert([i, i], `p${i}`)
      }
      const result = tree.nearestNeighbor([50.5, 50.5])
      expect(result).toBeDefined()
      expect(result!.value).toBe('p50')
    })

    it('should handle k nearest on large dataset', () => {
      const tree = new KDTree<number>()
      for (let i = 0; i < 50; i++) {
        tree.insert([i, i], i)
      }
      const results = tree.kNearestNeighbors([0, 0], 5)
      expect(results).toHaveLength(5)
    })

    it('should handle range search on large dataset', () => {
      const tree = new KDTree<number>()
      for (let i = 0; i < 50; i++) {
        tree.insert([i, i], i)
      }
      const results = tree.rangeSearch([10, 10], [20, 20])
      expect(results).toHaveLength(11)
    })

    it('should handle many removals', () => {
      const tree = new KDTree<number>()
      for (let i = 0; i < 50; i++) {
        tree.insert([i, i], i)
      }
      for (let i = 0; i < 25; i++) {
        tree.remove([i, i])
      }
      expect(tree.size()).toBe(25)
    })

    it('should handle forEach on large dataset', () => {
      const tree = new KDTree<number>()
      for (let i = 0; i < 50; i++) {
        tree.insert([i, i], i)
      }
      let count = 0
      tree.forEach(() => count++)
      expect(count).toBe(50)
    })
  })

  describe('combined operations', () => {
    it('should maintain consistency across mixed operations', () => {
      const tree = new KDTree<string>()
      tree.insert([1, 1], 'a')
      tree.insert([2, 2], 'b')
      tree.insert([3, 3], 'c')
      tree.remove([2, 2])
      tree.insert([4, 4], 'd')
      expect(tree.size()).toBe(3)
      expect(tree.search([1, 1])).toBe('a')
      expect(tree.search([2, 2])).toBeUndefined()
      expect(tree.search([3, 3])).toBe('c')
      expect(tree.search([4, 4])).toBe('d')
    })

    it('should handle clear and rebuild', () => {
      const tree = new KDTree<string>()
      tree.insert([1, 1], 'a')
      tree.clear()
      tree.insert([2, 2], 'b')
      expect(tree.size()).toBe(1)
      expect(tree.search([1, 1])).toBeUndefined()
      expect(tree.search([2, 2])).toBe('b')
    })

    it('should handle insert-remove-insert cycle', () => {
      const tree = new KDTree<string>()
      tree.insert([5, 5], 'first')
      tree.remove([5, 5])
      tree.insert([5, 5], 'second')
      expect(tree.search([5, 5])).toBe('second')
      expect(tree.size()).toBe(1)
    })

    it('should handle nearest after removal', () => {
      const tree = new KDTree<string>()
      tree.insert([0, 0], 'a')
      tree.insert([10, 10], 'b')
      tree.insert([5, 5], 'c')
      tree.remove([5, 5])
      const result = tree.nearestNeighbor([6, 6])
      expect(result!.value).toBe('b')
    })

    it('should handle range search after removal', () => {
      const tree = new KDTree<string>()
      tree.insert([1, 1], 'a')
      tree.insert([5, 5], 'b')
      tree.remove([5, 5])
      const results = tree.rangeSearch([0, 0], [10, 10])
      expect(results).toHaveLength(1)
      expect(results[0]!.value).toBe('a')
    })
  })
})
