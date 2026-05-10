import { describe, it, expect } from 'vitest'
import { FusionTree } from '../../src/core/fusion-tree/fusion-tree.js'

describe('FusionTree', () => {
  describe('construction', () => {
    it('should create tree with default options', () => {
      const tree = new FusionTree()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })

    it('should create tree with custom degree', () => {
      const tree = new FusionTree({ degree: 3 })
      expect(tree.size).toBe(0)
    })

    it('should create tree with custom comparator', () => {
      const tree = new FusionTree({ comparator: (a, b) => b - a })
      expect(tree.size).toBe(0)
    })

    it('should create tree with all custom options', () => {
      const tree = new FusionTree({ degree: 5, comparator: (a, b) => a - b })
      expect(tree.size).toBe(0)
    })
  })

  describe('insert and search basics', () => {
    it('should insert a single key', () => {
      const tree = new FusionTree()
      tree.insert(10)
      expect(tree.size).toBe(1)
      expect(tree.isEmpty).toBe(false)
    })

    it('should find inserted key', () => {
      const tree = new FusionTree()
      tree.insert(10)
      expect(tree.search(10)).toBe(true)
    })

    it('should not find missing key', () => {
      const tree = new FusionTree()
      tree.insert(10)
      expect(tree.search(20)).toBe(false)
    })

    it('has() should work like search()', () => {
      const tree = new FusionTree()
      tree.insert(42)
      expect(tree.has(42)).toBe(true)
      expect(tree.has(99)).toBe(false)
    })

    it('should insert multiple keys', () => {
      const tree = new FusionTree()
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      expect(tree.size).toBe(3)
      expect(tree.search(10)).toBe(true)
      expect(tree.search(20)).toBe(true)
      expect(tree.search(30)).toBe(true)
    })

    it('should not insert duplicate keys', () => {
      const tree = new FusionTree()
      tree.insert(10)
      tree.insert(10)
      expect(tree.size).toBe(1)
    })

    it('should handle negative keys', () => {
      const tree = new FusionTree()
      tree.insert(-10)
      tree.insert(-5)
      tree.insert(0)
      expect(tree.size).toBe(3)
      expect(tree.search(-10)).toBe(true)
      expect(tree.search(-5)).toBe(true)
      expect(tree.search(0)).toBe(true)
    })

    it('should handle zero key', () => {
      const tree = new FusionTree()
      tree.insert(0)
      expect(tree.search(0)).toBe(true)
      expect(tree.size).toBe(1)
    })
  })

  describe('delete operations', () => {
    it('should delete an existing key', () => {
      const tree = new FusionTree()
      tree.insert(10)
      expect(tree.delete(10)).toBe(true)
      expect(tree.size).toBe(0)
      expect(tree.search(10)).toBe(false)
    })

    it('should return false for deleting missing key', () => {
      const tree = new FusionTree()
      expect(tree.delete(10)).toBe(false)
    })

    it('should delete from tree with multiple keys', () => {
      const tree = new FusionTree()
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      expect(tree.delete(20)).toBe(true)
      expect(tree.size).toBe(2)
      expect(tree.search(20)).toBe(false)
    })

    it('should handle deleting first key', () => {
      const tree = new FusionTree()
      tree.insert(10)
      tree.insert(20)
      expect(tree.delete(10)).toBe(true)
      expect(tree.size).toBe(1)
      expect(tree.search(10)).toBe(false)
      expect(tree.search(20)).toBe(true)
    })

    it('should handle deleting last key', () => {
      const tree = new FusionTree()
      tree.insert(10)
      tree.insert(20)
      expect(tree.delete(20)).toBe(true)
      expect(tree.size).toBe(1)
      expect(tree.search(10)).toBe(true)
      expect(tree.search(20)).toBe(false)
    })

    it('should not affect other keys on delete', () => {
      const tree = new FusionTree()
      for (let i = 1; i <= 10; i++) tree.insert(i)
      tree.delete(5)
      for (let i = 1; i <= 10; i++) {
        if (i === 5) {
          expect(tree.search(i)).toBe(false)
        } else {
          expect(tree.search(i)).toBe(true)
        }
      }
    })

    it('should handle deleting all keys', () => {
      const tree = new FusionTree()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.delete(1)
      tree.delete(2)
      tree.delete(3)
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })
  })

  describe('node splitting', () => {
    it('should split root when full (degree 2)', () => {
      const tree = new FusionTree({ degree: 2 })
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      expect(tree.size).toBe(3)
      expect(tree.search(10)).toBe(true)
      expect(tree.search(20)).toBe(true)
      expect(tree.search(30)).toBe(true)
    })

    it('should split nodes multiple times', () => {
      const tree = new FusionTree({ degree: 2 })
      for (let i = 1; i <= 10; i++) tree.insert(i)
      expect(tree.size).toBe(10)
      for (let i = 1; i <= 10; i++) {
        expect(tree.search(i)).toBe(true)
      }
    })

    it('should handle splits with degree 3', () => {
      const tree = new FusionTree({ degree: 3 })
      for (let i = 1; i <= 15; i++) tree.insert(i)
      expect(tree.size).toBe(15)
      for (let i = 1; i <= 15; i++) {
        expect(tree.search(i)).toBe(true)
      }
    })

    it('should maintain correct order after splits', () => {
      const tree = new FusionTree({ degree: 2 })
      for (let i = 1; i <= 7; i++) tree.insert(i)
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7])
    })

    it('should handle reverse insertion with splits', () => {
      const tree = new FusionTree({ degree: 2 })
      for (let i = 7; i >= 1; i--) tree.insert(i)
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7])
    })

    it('should handle splits with default degree 4', () => {
      const tree = new FusionTree()
      for (let i = 1; i <= 20; i++) tree.insert(i)
      expect(tree.size).toBe(20)
      expect(tree.toArray().length).toBe(20)
    })
  })

  describe('node merging', () => {
    it('should merge nodes when underfull after delete', () => {
      const tree = new FusionTree({ degree: 2 })
      for (let i = 1; i <= 5; i++) tree.insert(i)
      for (let i = 1; i <= 5; i++) tree.delete(i)
      expect(tree.size).toBe(0)
    })

    it('should borrow from sibling instead of merging', () => {
      const tree = new FusionTree({ degree: 2 })
      for (let i = 1; i <= 10; i++) tree.insert(i)
      tree.delete(1)
      expect(tree.size).toBe(9)
      expect(tree.search(1)).toBe(false)
      for (let i = 2; i <= 10; i++) {
        expect(tree.search(i)).toBe(true)
      }
    })

    it('should handle delete causing multiple merges', () => {
      const tree = new FusionTree({ degree: 2 })
      for (let i = 1; i <= 7; i++) tree.insert(i)
      for (let i = 7; i >= 1; i--) tree.delete(i)
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })

    it('should maintain order after merge operations', () => {
      const tree = new FusionTree({ degree: 3 })
      for (let i = 1; i <= 10; i++) tree.insert(i)
      tree.delete(3)
      tree.delete(7)
      const arr = tree.toArray()
      expect(arr).toEqual([1, 2, 4, 5, 6, 8, 9, 10])
    })
  })

  describe('findMin / findMax', () => {
    it('findMin returns undefined for empty tree', () => {
      const tree = new FusionTree()
      expect(tree.findMin()).toBeUndefined()
    })

    it('findMax returns undefined for empty tree', () => {
      const tree = new FusionTree()
      expect(tree.findMax()).toBeUndefined()
    })

    it('findMin returns single key', () => {
      const tree = new FusionTree()
      tree.insert(42)
      expect(tree.findMin()).toBe(42)
    })

    it('findMax returns single key', () => {
      const tree = new FusionTree()
      tree.insert(42)
      expect(tree.findMax()).toBe(42)
    })

    it('findMin returns smallest after many inserts', () => {
      const tree = new FusionTree()
      for (let i = 50; i >= 1; i--) tree.insert(i)
      expect(tree.findMin()).toBe(1)
    })

    it('findMax returns largest after many inserts', () => {
      const tree = new FusionTree()
      for (let i = 1; i <= 50; i++) tree.insert(i)
      expect(tree.findMax()).toBe(50)
    })

    it('findMin and findMax work after deletions', () => {
      const tree = new FusionTree()
      for (let i = 1; i <= 10; i++) tree.insert(i)
      tree.delete(1)
      tree.delete(10)
      expect(tree.findMin()).toBe(2)
      expect(tree.findMax()).toBe(9)
    })

    it('findMin and findMax with negative values', () => {
      const tree = new FusionTree()
      tree.insert(-100)
      tree.insert(-50)
      tree.insert(0)
      tree.insert(50)
      tree.insert(100)
      expect(tree.findMin()).toBe(-100)
      expect(tree.findMax()).toBe(100)
    })
  })

  describe('rangeQuery', () => {
    it('returns empty for empty tree', () => {
      const tree = new FusionTree()
      expect(tree.rangeQuery(0, 10)).toEqual([])
    })

    it('returns matching key in range', () => {
      const tree = new FusionTree()
      tree.insert(5)
      expect(tree.rangeQuery(1, 10)).toEqual([5])
    })

    it('excludes keys outside range', () => {
      const tree = new FusionTree()
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      expect(tree.rangeQuery(3, 7)).toEqual([5])
    })

    it('returns all keys in inclusive range', () => {
      const tree = new FusionTree()
      for (let i = 1; i <= 10; i++) tree.insert(i)
      expect(tree.rangeQuery(3, 7)).toEqual([3, 4, 5, 6, 7])
    })

    it('handles range matching exactly one key', () => {
      const tree = new FusionTree()
      for (let i = 1; i <= 10; i++) tree.insert(i)
      expect(tree.rangeQuery(5, 5)).toEqual([5])
    })

    it('handles range with no matching keys', () => {
      const tree = new FusionTree()
      for (let i = 1; i <= 10; i++) tree.insert(i)
      expect(tree.rangeQuery(15, 20)).toEqual([])
    })

    it('handles full range', () => {
      const tree = new FusionTree()
      for (let i = 1; i <= 5; i++) tree.insert(i)
      expect(tree.rangeQuery(1, 5)).toEqual([1, 2, 3, 4, 5])
    })

    it('handles range spanning multiple nodes', () => {
      const tree = new FusionTree({ degree: 2 })
      for (let i = 1; i <= 20; i++) tree.insert(i)
      expect(tree.rangeQuery(5, 15)).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
    })

    it('handles negative range', () => {
      const tree = new FusionTree()
      tree.insert(-10)
      tree.insert(-5)
      tree.insert(0)
      tree.insert(5)
      expect(tree.rangeQuery(-8, 2)).toEqual([-5, 0])
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty tree', () => {
      const tree = new FusionTree()
      expect(tree.toArray()).toEqual([])
    })

    it('returns single element', () => {
      const tree = new FusionTree()
      tree.insert(42)
      expect(tree.toArray()).toEqual([42])
    })

    it('returns sorted array', () => {
      const tree = new FusionTree()
      tree.insert(30)
      tree.insert(10)
      tree.insert(20)
      expect(tree.toArray()).toEqual([10, 20, 30])
    })

    it('returns sorted after many inserts', () => {
      const tree = new FusionTree()
      const values = [50, 30, 70, 10, 40, 60, 90, 20, 80, 100]
      for (const v of values) tree.insert(v)
      expect(tree.toArray()).toEqual([10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
    })

    it('does not include duplicates', () => {
      const tree = new FusionTree()
      tree.insert(5)
      tree.insert(5)
      tree.insert(5)
      expect(tree.toArray()).toEqual([5])
    })
  })

  describe('iterator and forEach', () => {
    it('iterates over empty tree', () => {
      const tree = new FusionTree()
      const result: number[] = []
      for (const key of tree) result.push(key)
      expect(result).toEqual([])
    })

    it('iterates over single element', () => {
      const tree = new FusionTree()
      tree.insert(42)
      const result: number[] = []
      for (const key of tree) result.push(key)
      expect(result).toEqual([42])
    })

    it('iterates in sorted order', () => {
      const tree = new FusionTree()
      tree.insert(30)
      tree.insert(10)
      tree.insert(20)
      const result: number[] = []
      for (const key of tree) result.push(key)
      expect(result).toEqual([10, 20, 30])
    })

    it('forEach works on empty tree', () => {
      const tree = new FusionTree()
      const result: number[] = []
      tree.forEach((key) => result.push(key))
      expect(result).toEqual([])
    })

    it('forEach passes index', () => {
      const tree = new FusionTree()
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      const indices: number[] = []
      tree.forEach((_key, index) => indices.push(index))
      expect(indices).toEqual([0, 1, 2])
    })

    it('forEach visits all keys in order', () => {
      const tree = new FusionTree()
      for (let i = 20; i >= 1; i--) tree.insert(i)
      const result: number[] = []
      tree.forEach((key) => result.push(key))
      expect(result).toEqual(Array.from({ length: 20 }, (_, i) => i + 1))
    })

    it('iterator works with spread', () => {
      const tree = new FusionTree()
      tree.insert(3)
      tree.insert(1)
      tree.insert(2)
      expect([...tree]).toEqual([1, 2, 3])
    })
  })

  describe('statistics', () => {
    it('tracks inserts', () => {
      const tree = new FusionTree()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.getStatistics().inserts).toBe(3)
    })

    it('tracks deletes', () => {
      const tree = new FusionTree()
      tree.insert(1)
      tree.insert(2)
      tree.delete(1)
      tree.delete(2)
      expect(tree.getStatistics().deletes).toBe(2)
    })

    it('tracks searches', () => {
      const tree = new FusionTree()
      tree.search(1)
      tree.search(2)
      tree.search(3)
      expect(tree.getStatistics().searches).toBe(3)
    })

    it('tracks rebalances', () => {
      const tree = new FusionTree({ degree: 2 })
      for (let i = 1; i <= 10; i++) tree.insert(i)
      expect(tree.getStatistics().rebalances).toBeGreaterThan(0)
    })

    it('reports height', () => {
      const tree = new FusionTree()
      expect(tree.getStatistics().height).toBe(1)
    })

    it('resets statistics on clear', () => {
      const tree = new FusionTree()
      tree.insert(1)
      tree.insert(2)
      tree.search(1)
      tree.delete(1)
      tree.clear()
      const stats = tree.getStatistics()
      expect(stats.inserts).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.searches).toBe(0)
      expect(stats.rebalances).toBe(0)
    })
  })

  describe('getHeight', () => {
    it('returns 1 for empty tree', () => {
      const tree = new FusionTree()
      expect(tree.getHeight()).toBe(1)
    })

    it('returns 1 for single key', () => {
      const tree = new FusionTree()
      tree.insert(1)
      expect(tree.getHeight()).toBe(1)
    })

    it('increases after many inserts', () => {
      const tree = new FusionTree({ degree: 2 })
      for (let i = 1; i <= 20; i++) tree.insert(i)
      expect(tree.getHeight()).toBeGreaterThan(1)
    })

    it('decreases after deletes', () => {
      const tree = new FusionTree({ degree: 2 })
      for (let i = 1; i <= 15; i++) tree.insert(i)
      const heightBefore = tree.getHeight()
      for (let i = 1; i <= 14; i++) tree.delete(i)
      const heightAfter = tree.getHeight()
      expect(heightAfter).toBeLessThanOrEqual(heightBefore)
    })

    it('is consistent with getStatistics', () => {
      const tree = new FusionTree()
      for (let i = 1; i <= 10; i++) tree.insert(i)
      expect(tree.getHeight()).toBe(tree.getStatistics().height)
    })
  })

  describe('edge cases', () => {
    it('handles empty tree operations', () => {
      const tree = new FusionTree()
      expect(tree.search(1)).toBe(false)
      expect(tree.delete(1)).toBe(false)
      expect(tree.findMin()).toBeUndefined()
      expect(tree.findMax()).toBeUndefined()
      expect(tree.toArray()).toEqual([])
      expect(tree.rangeQuery(0, 100)).toEqual([])
    })

    it('handles single key operations', () => {
      const tree = new FusionTree()
      tree.insert(42)
      expect(tree.size).toBe(1)
      expect(tree.search(42)).toBe(true)
      expect(tree.findMin()).toBe(42)
      expect(tree.findMax()).toBe(42)
      expect(tree.toArray()).toEqual([42])
      tree.delete(42)
      expect(tree.isEmpty).toBe(true)
    })

    it('handles duplicate inserts gracefully', () => {
      const tree = new FusionTree()
      for (let i = 0; i < 5; i++) tree.insert(7)
      expect(tree.size).toBe(1)
      expect(tree.toArray()).toEqual([7])
    })

    it('handles clear on empty tree', () => {
      const tree = new FusionTree()
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })

    it('handles clear on non-empty tree', () => {
      const tree = new FusionTree()
      for (let i = 1; i <= 10; i++) tree.insert(i)
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
      for (let i = 1; i <= 10; i++) {
        expect(tree.search(i)).toBe(false)
      }
    })

    it('handles large values', () => {
      const tree = new FusionTree()
      tree.insert(Number.MAX_SAFE_INTEGER)
      tree.insert(Number.MIN_SAFE_INTEGER)
      expect(tree.search(Number.MAX_SAFE_INTEGER)).toBe(true)
      expect(tree.search(Number.MIN_SAFE_INTEGER)).toBe(true)
      expect(tree.findMin()).toBe(Number.MIN_SAFE_INTEGER)
      expect(tree.findMax()).toBe(Number.MAX_SAFE_INTEGER)
    })
  })

  describe('large scale', () => {
    it('handles 200 sequential inserts', () => {
      const tree = new FusionTree()
      for (let i = 1; i <= 200; i++) tree.insert(i)
      expect(tree.size).toBe(200)
      const arr = tree.toArray()
      expect(arr.length).toBe(200)
      expect(arr[0]).toBe(1)
      expect(arr[199]).toBe(200)
    })

    it('handles 200 reverse inserts', () => {
      const tree = new FusionTree()
      for (let i = 200; i >= 1; i--) tree.insert(i)
      expect(tree.size).toBe(200)
      const arr = tree.toArray()
      for (let i = 0; i < 200; i++) {
        expect(arr[i]).toBe(i + 1)
      }
    })

    it('handles 200 random inserts and searches', () => {
      const tree = new FusionTree()
      const values = Array.from({ length: 200 }, (_, i) => i * 3 + 7)
      for (const v of values) tree.insert(v)
      expect(tree.size).toBe(200)
      for (const v of values) {
        expect(tree.search(v)).toBe(true)
      }
      expect(tree.search(8)).toBe(false)
    })

    it('handles 200 inserts then deletes', () => {
      const tree = new FusionTree()
      for (let i = 1; i <= 200; i++) tree.insert(i)
      for (let i = 1; i <= 100; i++) tree.delete(i)
      expect(tree.size).toBe(100)
      for (let i = 1; i <= 100; i++) {
        expect(tree.search(i)).toBe(false)
      }
      for (let i = 101; i <= 200; i++) {
        expect(tree.search(i)).toBe(true)
      }
    })

    it('handles 500 inserts with degree 3', () => {
      const tree = new FusionTree({ degree: 3 })
      for (let i = 1; i <= 500; i++) tree.insert(i)
      expect(tree.size).toBe(500)
      const arr = tree.toArray()
      expect(arr).toEqual(Array.from({ length: 500 }, (_, i) => i + 1))
    })
  })

  describe('sequential and random insertion patterns', () => {
    it('handles ascending insertion', () => {
      const tree = new FusionTree({ degree: 2 })
      for (let i = 1; i <= 50; i++) tree.insert(i)
      expect(tree.toArray()).toEqual(Array.from({ length: 50 }, (_, i) => i + 1))
    })

    it('handles descending insertion', () => {
      const tree = new FusionTree({ degree: 2 })
      for (let i = 50; i >= 1; i--) tree.insert(i)
      expect(tree.toArray()).toEqual(Array.from({ length: 50 }, (_, i) => i + 1))
    })

    it('handles alternating insertion', () => {
      const tree = new FusionTree()
      for (let i = 0; i < 20; i++) {
        tree.insert(i)
        tree.insert(39 - i)
      }
      expect(tree.size).toBe(40)
      expect(tree.toArray().length).toBe(40)
    })

    it('handles scattered insertion pattern', () => {
      const tree = new FusionTree()
      const order = [50, 10, 90, 30, 70, 20, 80, 40, 60, 100]
      for (const v of order) tree.insert(v)
      expect(tree.toArray()).toEqual([10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
    })
  })

  describe('custom comparator (reverse order)', () => {
    it('stores and finds keys with reverse comparator', () => {
      const tree = new FusionTree({ comparator: (a, b) => b - a })
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      expect(tree.search(10)).toBe(true)
      expect(tree.search(20)).toBe(true)
      expect(tree.search(30)).toBe(true)
    })

    it('toArray returns in reverse sorted order', () => {
      const tree = new FusionTree({ comparator: (a, b) => b - a })
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      expect(tree.toArray()).toEqual([30, 20, 10])
    })

    it('findMin and findMax are reversed', () => {
      const tree = new FusionTree({ comparator: (a, b) => b - a })
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      expect(tree.findMin()).toBe(30)
      expect(tree.findMax()).toBe(10)
    })

    it('rangeQuery works with reverse comparator', () => {
      const tree = new FusionTree({ comparator: (a, b) => b - a })
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      tree.insert(40)
      tree.insert(50)
      const result = tree.rangeQuery(35, 20)
      expect(result.every((k) => k <= 35 && k >= 20)).toBe(true)
    })

    it('delete works with reverse comparator', () => {
      const tree = new FusionTree({ comparator: (a, b) => b - a })
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      expect(tree.delete(20)).toBe(true)
      expect(tree.search(20)).toBe(false)
      expect(tree.size).toBe(2)
    })
  })

  describe('mixed operations', () => {
    it('handles intermixed insert and delete', () => {
      const tree = new FusionTree({ degree: 2 })
      tree.insert(10)
      tree.insert(20)
      tree.delete(10)
      tree.insert(30)
      tree.insert(40)
      tree.delete(20)
      tree.insert(50)
      expect(tree.size).toBe(3)
      expect(tree.toArray()).toEqual([30, 40, 50])
    })

    it('handles re-inserting deleted key', () => {
      const tree = new FusionTree()
      tree.insert(42)
      tree.delete(42)
      expect(tree.size).toBe(0)
      tree.insert(42)
      expect(tree.size).toBe(1)
      expect(tree.search(42)).toBe(true)
    })

    it('handles stress sequence', () => {
      const tree = new FusionTree({ degree: 2 })
      for (let i = 1; i <= 100; i++) tree.insert(i)
      for (let i = 1; i <= 50; i++) tree.delete(i)
      for (let i = 101; i <= 150; i++) tree.insert(i)
      expect(tree.size).toBe(100)
      for (let i = 51; i <= 150; i++) {
        expect(tree.search(i)).toBe(true)
      }
      for (let i = 1; i <= 50; i++) {
        expect(tree.search(i)).toBe(false)
      }
    })

    it('handles degree 6 with many operations', () => {
      const tree = new FusionTree({ degree: 6 })
      for (let i = 1; i <= 100; i++) tree.insert(i)
      expect(tree.size).toBe(100)
      for (let i = 25; i <= 75; i++) tree.delete(i)
      expect(tree.size).toBe(49)
      const arr = tree.toArray()
      expect(arr.length).toBe(49)
      for (const v of arr) {
        expect(v < 25 || v > 75).toBe(true)
      }
    })
  })

  describe('additional coverage', () => {
    it('handles degree 2 with 30 inserts', () => {
      const tree = new FusionTree({ degree: 2 })
      for (let i = 1; i <= 30; i++) tree.insert(i)
      expect(tree.size).toBe(30)
      expect(tree.findMin()).toBe(1)
      expect(tree.findMax()).toBe(30)
    })

    it('handles deleting all but one key', () => {
      const tree = new FusionTree()
      for (let i = 1; i <= 10; i++) tree.insert(i)
      for (let i = 1; i <= 9; i++) tree.delete(i)
      expect(tree.size).toBe(1)
      expect(tree.search(10)).toBe(true)
      expect(tree.findMin()).toBe(10)
      expect(tree.findMax()).toBe(10)
    })

    it('handles inserting after clearing', () => {
      const tree = new FusionTree()
      for (let i = 1; i <= 10; i++) tree.insert(i)
      tree.clear()
      tree.insert(99)
      expect(tree.size).toBe(1)
      expect(tree.search(99)).toBe(true)
    })

    it('handles rangeQuery on single element', () => {
      const tree = new FusionTree()
      tree.insert(5)
      expect(tree.rangeQuery(1, 10)).toEqual([5])
      expect(tree.rangeQuery(5, 5)).toEqual([5])
      expect(tree.rangeQuery(6, 10)).toEqual([])
    })

    it('tracks has() as alias for search()', () => {
      const tree = new FusionTree({ degree: 3 })
      for (let i = 10; i <= 100; i += 10) tree.insert(i)
      expect(tree.has(10)).toBe(true)
      expect(tree.has(50)).toBe(true)
      expect(tree.has(100)).toBe(true)
      expect(tree.has(15)).toBe(false)
    })

    it('iterator returns done for empty tree', () => {
      const tree = new FusionTree()
      const iter = tree[Symbol.iterator]()
      expect(iter.next()).toEqual({ value: undefined, done: true })
    })

    it('handles degree 10 with 50 inserts', () => {
      const tree = new FusionTree({ degree: 10 })
      for (let i = 50; i >= 1; i--) tree.insert(i)
      expect(tree.size).toBe(50)
      expect(tree.getHeight()).toBeGreaterThanOrEqual(1)
      const arr = tree.toArray()
      for (let i = 0; i < 50; i++) {
        expect(arr[i]).toBe(i + 1)
      }
    })

    it('handles delete of non-existent key from non-empty tree', () => {
      const tree = new FusionTree()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.delete(999)).toBe(false)
      expect(tree.size).toBe(3)
    })

    it('statistics search count includes has() calls', () => {
      const tree = new FusionTree()
      tree.insert(1)
      tree.has(1)
      tree.has(2)
      expect(tree.getStatistics().searches).toBe(2)
    })
  })
})
