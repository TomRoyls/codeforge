import { describe, it, expect } from 'vitest'
import { LazySegmentTree } from '../../src/core/lazy-segment-tree/lazy-segment-tree.js'

describe('LazySegmentTree', () => {
  describe('constructor', () => {
    it('should create empty tree with no arguments', () => {
      const t = new LazySegmentTree()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should create tree with size', () => {
      const t = new LazySegmentTree(5)
      expect(t.size()).toBe(5)
      expect(t.isEmpty()).toBe(false)
    })

    it('should create tree with size and identity', () => {
      const t = new LazySegmentTree(5, 0)
      expect(t.size()).toBe(5)
    })

    it('should create tree with options object', () => {
      const t = new LazySegmentTree({ size: 10 })
      expect(t.size()).toBe(10)
    })

    it('should create tree with options object and identity', () => {
      const t = new LazySegmentTree({ size: 10, identity: 0 })
      expect(t.size()).toBe(10)
    })

    it('should default identity to 0', () => {
      const t = new LazySegmentTree(3)
      expect(t.queryRange(0, 2)).toBe(0)
    })

    it('should handle size 1', () => {
      const t = new LazySegmentTree(1)
      expect(t.size()).toBe(1)
    })

    it('should handle size 0', () => {
      const t = new LazySegmentTree(0)
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })
  })

  describe('build', () => {
    it('should build from array', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3, 4, 5])
      expect(t.size()).toBe(5)
      expect(t.queryRange(0, 4)).toBe(15)
    })

    it('should build from empty array', () => {
      const t = new LazySegmentTree()
      t.build([])
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should build single element', () => {
      const t = new LazySegmentTree()
      t.build([42])
      expect(t.size()).toBe(1)
      expect(t.queryRange(0, 0)).toBe(42)
    })

    it('should build from size constructor then build', () => {
      const t = new LazySegmentTree(10)
      t.build([1, 2, 3])
      expect(t.size()).toBe(3)
      expect(t.queryRange(0, 2)).toBe(6)
    })

    it('should correctly compute sum after build', () => {
      const t = new LazySegmentTree()
      t.build([10, 20, 30, 40, 50])
      expect(t.queryRange(0, 4)).toBe(150)
    })

    it('should correctly compute partial sums after build', () => {
      const t = new LazySegmentTree()
      t.build([10, 20, 30, 40, 50])
      expect(t.queryRange(1, 3)).toBe(90)
    })

    it('should handle rebuild', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3])
      expect(t.queryRange(0, 2)).toBe(6)
      t.build([10, 20, 30, 40])
      expect(t.queryRange(0, 3)).toBe(100)
    })

    it('should handle power-of-2 sizes', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3, 4])
      expect(t.queryRange(0, 3)).toBe(10)
    })

    it('should handle non-power-of-2 sizes', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3, 4, 5, 6, 7])
      expect(t.queryRange(0, 6)).toBe(28)
    })
  })

  describe('updateRange (add)', () => {
    it('should add value to entire range', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3, 4, 5])
      t.updateRange(0, 4, 10)
      expect(t.toArray()).toEqual([11, 12, 13, 14, 15])
    })

    it('should add value to partial range', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3, 4, 5])
      t.updateRange(1, 3, 5)
      expect(t.toArray()).toEqual([1, 7, 8, 9, 5])
    })

    it('should add value to single element', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3])
      t.updateRange(1, 1, 100)
      expect(t.getPoint(1)).toBe(102)
    })

    it('should add zero (no-op)', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3])
      t.updateRange(0, 2, 0)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('should add negative values', () => {
      const t = new LazySegmentTree()
      t.build([10, 20, 30])
      t.updateRange(0, 2, -5)
      expect(t.toArray()).toEqual([5, 15, 25])
    })

    it('should handle multiple overlapping updates', () => {
      const t = new LazySegmentTree()
      t.build([0, 0, 0, 0, 0])
      t.updateRange(0, 4, 1)
      t.updateRange(1, 3, 2)
      t.updateRange(2, 2, 3)
      expect(t.toArray()).toEqual([1, 3, 6, 3, 1])
    })

    it('should handle adjacent updates', () => {
      const t = new LazySegmentTree()
      t.build([0, 0, 0, 0])
      t.updateRange(0, 1, 5)
      t.updateRange(2, 3, 10)
      expect(t.toArray()).toEqual([5, 5, 10, 10])
    })

    it('should handle update on full range then partial query', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3, 4, 5])
      t.updateRange(0, 4, 1)
      expect(t.queryRange(1, 3)).toBe(12)
    })

    it('should do nothing on empty tree', () => {
      const t = new LazySegmentTree()
      t.updateRange(0, 5, 10)
      expect(t.size()).toBe(0)
    })

    it('should handle out-of-bounds range gracefully', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3])
      t.updateRange(-1, 10, 5)
      expect(t.toArray()).toEqual([6, 7, 8])
    })

    it('should handle invalid range (l > r)', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3])
      t.updateRange(2, 0, 5)
      expect(t.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('queryRange (sum)', () => {
    it('should return sum of full range', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3, 4, 5])
      expect(t.queryRange(0, 4)).toBe(15)
    })

    it('should return sum of partial range', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3, 4, 5])
      expect(t.queryRange(2, 4)).toBe(12)
    })

    it('should return single element', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3])
      expect(t.queryRange(1, 1)).toBe(2)
    })

    it('should return identity for empty tree', () => {
      const t = new LazySegmentTree()
      expect(t.queryRange(0, 0)).toBe(0)
    })

    it('should return correct sum after updates', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3, 4, 5])
      t.updateRange(0, 2, 10)
      expect(t.queryRange(0, 4)).toBe(45)
    })

    it('should handle query on out-of-bounds range', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3])
      expect(t.queryRange(-1, 10)).toBe(6)
    })

    it('should handle invalid range (l > r)', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3])
      expect(t.queryRange(3, 0)).toBe(0)
    })
  })

  describe('setPoint', () => {
    it('should set a value at index', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3])
      t.setPoint(1, 100)
      expect(t.getPoint(1)).toBe(100)
    })

    it('should update sum correctly', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3, 4, 5])
      t.setPoint(2, 0)
      expect(t.queryRange(0, 4)).toBe(12)
    })

    it('should handle negative index gracefully', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3])
      t.setPoint(-1, 100)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('should handle out-of-bounds index gracefully', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3])
      t.setPoint(3, 100)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('should work after range update', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3])
      t.updateRange(0, 2, 10)
      t.setPoint(1, 0)
      expect(t.getPoint(0)).toBe(11)
      expect(t.getPoint(1)).toBe(0)
      expect(t.getPoint(2)).toBe(13)
    })
  })

  describe('getPoint', () => {
    it('should get value at index', () => {
      const t = new LazySegmentTree()
      t.build([10, 20, 30])
      expect(t.getPoint(0)).toBe(10)
      expect(t.getPoint(1)).toBe(20)
      expect(t.getPoint(2)).toBe(30)
    })

    it('should return identity for negative index', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3])
      expect(t.getPoint(-1)).toBe(0)
    })

    it('should return identity for out-of-bounds index', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3])
      expect(t.getPoint(3)).toBe(0)
    })

    it('should reflect updates', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3])
      t.updateRange(0, 2, 5)
      expect(t.getPoint(0)).toBe(6)
      expect(t.getPoint(1)).toBe(7)
      expect(t.getPoint(2)).toBe(8)
    })
  })

  describe('size and isEmpty', () => {
    it('should return correct size', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3])
      expect(t.size()).toBe(3)
    })

    it('should return true for isEmpty on empty tree', () => {
      const t = new LazySegmentTree()
      expect(t.isEmpty()).toBe(true)
    })

    it('should return false for isEmpty on non-empty tree', () => {
      const t = new LazySegmentTree()
      t.build([1])
      expect(t.isEmpty()).toBe(false)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty tree', () => {
      const t = new LazySegmentTree()
      expect(t.toArray()).toEqual([])
    })

    it('should return elements after build', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3])
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('should reflect range updates', () => {
      const t = new LazySegmentTree()
      t.build([0, 0, 0, 0])
      t.updateRange(1, 2, 5)
      expect(t.toArray()).toEqual([0, 5, 5, 0])
    })

    it('should reflect point sets', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3])
      t.setPoint(1, 99)
      expect(t.toArray()).toEqual([1, 99, 3])
    })
  })

  describe('toString', () => {
    it('should return empty string for empty tree', () => {
      const t = new LazySegmentTree()
      expect(t.toString()).toBe('')
    })

    it('should return comma-separated values', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3])
      expect(t.toString()).toBe('1,2,3')
    })

    it('should reflect updates', () => {
      const t = new LazySegmentTree()
      t.build([0, 0, 0])
      t.updateRange(0, 2, 1)
      expect(t.toString()).toBe('1,1,1')
    })
  })

  describe('clone', () => {
    it('should create independent copy', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3])
      const c = t.clone()
      expect(c.toArray()).toEqual([1, 2, 3])
      expect(c.size()).toBe(3)
    })

    it('should be independent after update on original', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3])
      const c = t.clone()
      t.updateRange(0, 2, 10)
      expect(t.toArray()).toEqual([11, 12, 13])
      expect(c.toArray()).toEqual([1, 2, 3])
    })

    it('should be independent after update on clone', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3])
      const c = t.clone()
      c.updateRange(0, 2, 10)
      expect(t.toArray()).toEqual([1, 2, 3])
      expect(c.toArray()).toEqual([11, 12, 13])
    })

    it('should clone empty tree', () => {
      const t = new LazySegmentTree()
      const c = t.clone()
      expect(c.isEmpty()).toBe(true)
      expect(c.size()).toBe(0)
    })
  })

  describe('equals', () => {
    it('should return true for identical trees', () => {
      const t1 = new LazySegmentTree()
      t1.build([1, 2, 3])
      const t2 = new LazySegmentTree()
      t2.build([1, 2, 3])
      expect(t1.equals(t2)).toBe(true)
    })

    it('should return false for different values', () => {
      const t1 = new LazySegmentTree()
      t1.build([1, 2, 3])
      const t2 = new LazySegmentTree()
      t2.build([1, 2, 4])
      expect(t1.equals(t2)).toBe(false)
    })

    it('should return false for different sizes', () => {
      const t1 = new LazySegmentTree()
      t1.build([1, 2])
      const t2 = new LazySegmentTree()
      t2.build([1, 2, 3])
      expect(t1.equals(t2)).toBe(false)
    })

    it('should return true for two empty trees', () => {
      const t1 = new LazySegmentTree()
      const t2 = new LazySegmentTree()
      expect(t1.equals(t2)).toBe(true)
    })

    it('should work with clone', () => {
      const t = new LazySegmentTree()
      t.build([5, 10, 15])
      expect(t.equals(t.clone())).toBe(true)
    })
  })

  describe('reset', () => {
    it('should reset to empty state', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3])
      t.reset()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
      expect(t.toArray()).toEqual([])
    })

    it('should allow rebuild after reset', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3])
      t.reset()
      t.build([10, 20])
      expect(t.size()).toBe(2)
      expect(t.queryRange(0, 1)).toBe(30)
    })

    it('should handle reset on empty tree', () => {
      const t = new LazySegmentTree()
      t.reset()
      expect(t.isEmpty()).toBe(true)
    })
  })

  describe('rangeMin', () => {
    it('should return min of range', () => {
      const t = new LazySegmentTree()
      t.build([5, 3, 8, 1, 9])
      expect(t.rangeMin(0, 4)).toBe(1)
    })

    it('should return min of partial range', () => {
      const t = new LazySegmentTree()
      t.build([5, 3, 8, 1, 9])
      expect(t.rangeMin(0, 2)).toBe(3)
    })

    it('should return element for single-element range', () => {
      const t = new LazySegmentTree()
      t.build([5, 3, 8])
      expect(t.rangeMin(1, 1)).toBe(3)
    })

    it('should reflect updates', () => {
      const t = new LazySegmentTree()
      t.build([5, 3, 8])
      t.updateRange(0, 2, -10)
      expect(t.rangeMin(0, 2)).toBe(-7)
    })

    it('should return identity for empty tree', () => {
      const t = new LazySegmentTree()
      expect(t.rangeMin(0, 0)).toBe(0)
    })

    it('should handle out-of-bounds gracefully', () => {
      const t = new LazySegmentTree()
      t.build([5, 3, 8])
      expect(t.rangeMin(-1, 10)).toBe(3)
    })
  })

  describe('rangeMax', () => {
    it('should return max of range', () => {
      const t = new LazySegmentTree()
      t.build([5, 3, 8, 1, 9])
      expect(t.rangeMax(0, 4)).toBe(9)
    })

    it('should return max of partial range', () => {
      const t = new LazySegmentTree()
      t.build([5, 3, 8, 1, 9])
      expect(t.rangeMax(0, 2)).toBe(8)
    })

    it('should return element for single-element range', () => {
      const t = new LazySegmentTree()
      t.build([5, 3, 8])
      expect(t.rangeMax(1, 1)).toBe(3)
    })

    it('should reflect updates', () => {
      const t = new LazySegmentTree()
      t.build([5, 3, 8])
      t.updateRange(0, 2, 10)
      expect(t.rangeMax(0, 2)).toBe(18)
    })

    it('should return identity for empty tree', () => {
      const t = new LazySegmentTree()
      expect(t.rangeMax(0, 0)).toBe(0)
    })

    it('should handle out-of-bounds gracefully', () => {
      const t = new LazySegmentTree()
      t.build([5, 3, 8])
      expect(t.rangeMax(-1, 10)).toBe(8)
    })
  })

  describe('multiplyRange', () => {
    it('should multiply elements in range', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3, 4, 5])
      t.multiplyRange(1, 3, 2)
      expect(t.getPoint(0)).toBe(1)
      expect(t.getPoint(1)).toBe(4)
      expect(t.getPoint(2)).toBe(6)
      expect(t.getPoint(3)).toBe(8)
      expect(t.getPoint(4)).toBe(5)
    })

    it('should multiply single element', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3])
      t.multiplyRange(1, 1, 10)
      expect(t.getPoint(1)).toBe(20)
    })

    it('should multiply entire range', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3])
      t.multiplyRange(0, 2, 3)
      expect(t.toArray()).toEqual([3, 6, 9])
    })

    it('should multiply by zero', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3])
      t.multiplyRange(0, 2, 0)
      expect(t.toArray()).toEqual([0, 0, 0])
    })

    it('should multiply by negative', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3])
      t.multiplyRange(0, 2, -1)
      expect(t.toArray()).toEqual([-1, -2, -3])
    })

    it('should handle out-of-bounds gracefully', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3])
      t.multiplyRange(-1, 10, 2)
      expect(t.toArray()).toEqual([2, 4, 6])
    })

    it('should do nothing on empty tree', () => {
      const t = new LazySegmentTree()
      t.multiplyRange(0, 5, 3)
      expect(t.size()).toBe(0)
    })

    it('should update sum correctly after multiply', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3, 4])
      t.multiplyRange(0, 3, 2)
      expect(t.queryRange(0, 3)).toBe(20)
    })

    it('should update min/max after multiply', () => {
      const t = new LazySegmentTree()
      t.build([1, 5, 3])
      t.multiplyRange(0, 2, 2)
      expect(t.rangeMin(0, 2)).toBe(2)
      expect(t.rangeMax(0, 2)).toBe(10)
    })

    it('should work with add then multiply', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3])
      t.updateRange(0, 2, 1)
      t.multiplyRange(0, 2, 2)
      expect(t.toArray()).toEqual([4, 6, 8])
    })
  })

  describe('combined operations', () => {
    it('should handle add + query sequence', () => {
      const t = new LazySegmentTree()
      t.build([0, 0, 0, 0])
      t.updateRange(0, 3, 1)
      expect(t.queryRange(0, 3)).toBe(4)
      t.updateRange(0, 1, 1)
      expect(t.queryRange(0, 3)).toBe(6)
      expect(t.queryRange(2, 3)).toBe(2)
    })

    it('should handle set + update + query', () => {
      const t = new LazySegmentTree()
      t.build([10, 20, 30, 40])
      t.setPoint(1, 0)
      t.updateRange(0, 2, 5)
      expect(t.queryRange(0, 3)).toBe(95)
    })

    it('should handle many overlapping updates', () => {
      const t = new LazySegmentTree()
      t.build([0, 0, 0, 0, 0, 0, 0, 0])
      t.updateRange(0, 7, 1)
      t.updateRange(0, 3, 1)
      t.updateRange(4, 7, 1)
      t.updateRange(2, 5, 1)
      expect(t.toArray()).toEqual([2, 2, 3, 3, 3, 3, 2, 2])
    })

    it('should handle alternating add and multiply', () => {
      const t = new LazySegmentTree()
      t.build([1, 1, 1, 1])
      t.updateRange(0, 3, 1)
      t.multiplyRange(0, 3, 2)
      t.updateRange(0, 3, 1)
      expect(t.toArray()).toEqual([5, 5, 5, 5])
    })

    it('should handle large number of point sets', () => {
      const t = new LazySegmentTree()
      t.build([0, 0, 0, 0, 0])
      for (let i = 0; i < 5; i++) {
        t.setPoint(i, i * 10)
      }
      expect(t.toArray()).toEqual([0, 10, 20, 30, 40])
      expect(t.queryRange(0, 4)).toBe(100)
    })
  })

  describe('edge cases', () => {
    it('should handle single element operations', () => {
      const t = new LazySegmentTree()
      t.build([5])
      expect(t.queryRange(0, 0)).toBe(5)
      t.updateRange(0, 0, 3)
      expect(t.getPoint(0)).toBe(8)
      t.setPoint(0, 100)
      expect(t.getPoint(0)).toBe(100)
      expect(t.rangeMin(0, 0)).toBe(100)
      expect(t.rangeMax(0, 0)).toBe(100)
    })

    it('should handle two elements', () => {
      const t = new LazySegmentTree()
      t.build([3, 7])
      expect(t.queryRange(0, 1)).toBe(10)
      t.updateRange(0, 0, 5)
      expect(t.queryRange(0, 1)).toBe(15)
      expect(t.rangeMin(0, 1)).toBe(7)
      expect(t.rangeMax(0, 1)).toBe(8)
    })

    it('should handle power-of-2 sizes correctly', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3, 4, 5, 6, 7, 8])
      t.updateRange(2, 5, 10)
      expect(t.queryRange(0, 7)).toBe(76)
    })

    it('should handle size 3 (non-power-of-2)', () => {
      const t = new LazySegmentTree()
      t.build([10, 20, 30])
      t.updateRange(0, 2, 5)
      expect(t.queryRange(0, 2)).toBe(75)
      expect(t.rangeMin(0, 2)).toBe(15)
      expect(t.rangeMax(0, 2)).toBe(35)
    })

    it('should handle size 6', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3, 4, 5, 6])
      expect(t.queryRange(0, 5)).toBe(21)
      t.updateRange(1, 4, 10)
      expect(t.queryRange(0, 5)).toBe(61)
    })

    it('should handle size 7', () => {
      const t = new LazySegmentTree()
      t.build([1, 2, 3, 4, 5, 6, 7])
      expect(t.queryRange(0, 6)).toBe(28)
      t.updateRange(3, 5, 1)
      expect(t.toArray()).toEqual([1, 2, 3, 5, 6, 7, 7])
    })

    it('should handle all zeros', () => {
      const t = new LazySegmentTree()
      t.build([0, 0, 0, 0])
      expect(t.queryRange(0, 3)).toBe(0)
      t.updateRange(0, 3, 0)
      expect(t.queryRange(0, 3)).toBe(0)
    })

    it('should handle all same values', () => {
      const t = new LazySegmentTree()
      t.build([5, 5, 5, 5, 5])
      expect(t.queryRange(0, 4)).toBe(25)
      expect(t.rangeMin(0, 4)).toBe(5)
      expect(t.rangeMax(0, 4)).toBe(5)
    })

    it('should handle negative values throughout', () => {
      const t = new LazySegmentTree()
      t.build([-1, -2, -3, -4])
      expect(t.queryRange(0, 3)).toBe(-10)
      expect(t.rangeMin(0, 3)).toBe(-4)
      expect(t.rangeMax(0, 3)).toBe(-1)
      t.updateRange(0, 3, 10)
      expect(t.queryRange(0, 3)).toBe(30)
    })

    it('should handle large values', () => {
      const t = new LazySegmentTree()
      t.build([1e9, 1e9, 1e9])
      expect(t.queryRange(0, 2)).toBe(3e9)
      t.updateRange(0, 2, 1e9)
      expect(t.queryRange(0, 2)).toBe(6e9)
    })

    it('should handle fractional values', () => {
      const t = new LazySegmentTree()
      t.build([0.5, 1.5, 2.5])
      expect(t.queryRange(0, 2)).toBeCloseTo(4.5)
      t.updateRange(0, 2, 0.5)
      expect(t.queryRange(0, 2)).toBeCloseTo(6.0)
    })
  })

  describe('stress tests', () => {
    it('should handle 10000 elements with range updates and queries', () => {
      const n = 10000
      const t = new LazySegmentTree()
      const arr = new Array(n).fill(0)
      for (let i = 0; i < n; i++) {
        arr[i] = i
      }
      t.build(arr)
      expect(t.queryRange(0, n - 1)).toBe((n - 1) * n / 2)

      t.updateRange(0, n - 1, 1)
      expect(t.queryRange(0, n - 1)).toBe((n - 1) * n / 2 + n)

      t.updateRange(0, Math.floor(n / 2) - 1, 5)
      const half = Math.floor(n / 2)
      const expected = (n - 1) * n / 2 + n + half * 5
      expect(t.queryRange(0, n - 1)).toBe(expected)
    })

    it('should handle 10000 random updates and queries', () => {
      const n = 100
      const t = new LazySegmentTree()
      const arr = new Array(n).fill(0)
      t.build(arr)

      const seed = 42
      let rng = seed
      const nextRand = () => {
        rng = (rng * 1103515245 + 12345) & 0x7fffffff
        return rng
      }

      for (let op = 0; op < 500; op++) {
        const l = nextRand() % n
        const r = l + (nextRand() % (n - l))
        const val = (nextRand() % 201) - 100
        t.updateRange(l, r, val)
        for (let i = l; i <= r; i++) {
          arr[i] += val
        }
      }

      for (let q = 0; q < 100; q++) {
        const l = nextRand() % n
        const r = l + (nextRand() % (n - l))
        let expected = 0
        for (let i = l; i <= r; i++) {
          expected += arr[i]
        }
        expect(t.queryRange(l, r)).toBe(expected)
      }
    })

    it('should handle 10000 elements with many overlapping range updates', () => {
      const n = 10000
      const t = new LazySegmentTree()
      t.build(new Array(n).fill(0))

      for (let i = 0; i < 100; i++) {
        const l = i * 50
        const r = Math.min(l + 200, n - 1)
        t.updateRange(l, r, i)
      }

      expect(t.queryRange(0, n - 1)).toBeGreaterThan(0)
      expect(t.rangeMin(0, n - 1)).toBe(0)
      expect(t.rangeMax(0, n - 1)).toBeGreaterThan(0)
    })

    it('should handle alternating point sets and range queries on 1000 elements', () => {
      const n = 1000
      const t = new LazySegmentTree()
      t.build(new Array(n).fill(0))

      let expectedSum = 0
      for (let i = 0; i < n; i++) {
        t.setPoint(i, i + 1)
        expectedSum += i + 1
      }
      expect(t.queryRange(0, n - 1)).toBe(expectedSum)
    })
  })

  describe('lazy propagation correctness', () => {
    it('should correctly propagate to children after parent update', () => {
      const t = new LazySegmentTree()
      t.build([0, 0, 0, 0])
      t.updateRange(0, 3, 5)
      t.updateRange(0, 1, 3)
      expect(t.getPoint(0)).toBe(8)
      expect(t.getPoint(1)).toBe(8)
      expect(t.getPoint(2)).toBe(5)
      expect(t.getPoint(3)).toBe(5)
    })

    it('should handle deep lazy propagation', () => {
      const t = new LazySegmentTree()
      t.build([0, 0, 0, 0, 0, 0, 0, 0])
      t.updateRange(0, 7, 1)
      t.updateRange(0, 3, 1)
      t.updateRange(0, 1, 1)
      t.updateRange(0, 0, 1)
      expect(t.getPoint(0)).toBe(4)
      expect(t.getPoint(1)).toBe(3)
      expect(t.getPoint(2)).toBe(2)
      expect(t.getPoint(3)).toBe(2)
      expect(t.getPoint(4)).toBe(1)
      expect(t.getPoint(5)).toBe(1)
      expect(t.getPoint(6)).toBe(1)
      expect(t.getPoint(7)).toBe(1)
    })

    it('should handle updates from right then query left', () => {
      const t = new LazySegmentTree()
      t.build([0, 0, 0, 0])
      t.updateRange(2, 3, 10)
      expect(t.queryRange(0, 1)).toBe(0)
      expect(t.queryRange(2, 3)).toBe(20)
    })

    it('should handle updates from left then query right', () => {
      const t = new LazySegmentTree()
      t.build([0, 0, 0, 0])
      t.updateRange(0, 1, 10)
      expect(t.queryRange(2, 3)).toBe(0)
      expect(t.queryRange(0, 1)).toBe(20)
    })

    it('should handle alternating range then point operations', () => {
      const t = new LazySegmentTree()
      t.build([1, 1, 1, 1, 1])
      t.updateRange(0, 4, 1)
      t.setPoint(2, 0)
      expect(t.queryRange(0, 4)).toBe(8)
      t.updateRange(1, 3, 5)
      expect(t.getPoint(0)).toBe(2)
      expect(t.getPoint(1)).toBe(7)
      expect(t.getPoint(2)).toBe(5)
      expect(t.getPoint(3)).toBe(7)
      expect(t.getPoint(4)).toBe(2)
    })

    it('should handle min/max after multiple range updates', () => {
      const t = new LazySegmentTree()
      t.build([10, 20, 30, 40, 50])
      t.updateRange(0, 2, -15)
      t.updateRange(2, 4, 100)
      expect(t.rangeMin(0, 4)).toBe(-5)
      expect(t.rangeMax(0, 4)).toBe(150)
    })
  })
})
