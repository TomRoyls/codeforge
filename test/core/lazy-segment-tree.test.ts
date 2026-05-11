import { describe, it, expect } from 'vitest'
import { LazySegmentTree } from '../../src/core/lazy-segment-tree/index.js'
import type { SegmentTreeOptions } from '../../src/core/lazy-segment-tree/types.js'

describe('LazySegmentTree', () => {
  describe('constructor', () => {
    it('creates a sum tree from array', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3, 4, 5])
      expect(tree.size).toBe(5)
      expect(tree.isEmpty).toBe(false)
    })

    it('creates an empty tree', () => {
      const tree = LazySegmentTree.sumTree([])
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })

    it('creates a single element tree', () => {
      const tree = LazySegmentTree.sumTree([42])
      expect(tree.size).toBe(1)
      expect(tree.get(0)).toBe(42)
    })

    it('creates a min tree', () => {
      const tree = LazySegmentTree.minTree([5, 3, 1, 4, 2])
      expect(tree.queryRange(0, 4)).toBe(1)
    })

    it('creates a max tree', () => {
      const tree = LazySegmentTree.maxTree([5, 3, 1, 4, 2])
      expect(tree.queryRange(0, 4)).toBe(5)
    })

    it('creates a tree with custom options', () => {
      const opts: SegmentTreeOptions<number, number> = {
        identity: 0,
        lazyIdentity: 0,
        combine: (a, b) => a + b,
        lazyApply: (value, lazy, len) => value + lazy * len,
        lazyCombine: (existing, incoming) => existing + incoming,
      }
      const tree = new LazySegmentTree([1, 2, 3], opts)
      expect(tree.sum()).toBe(6)
    })

    it('handles two-element array', () => {
      const tree = LazySegmentTree.sumTree([10, 20])
      expect(tree.size).toBe(2)
      expect(tree.sum()).toBe(30)
    })

    it('handles power-of-two sized array', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3, 4])
      expect(tree.sum()).toBe(10)
    })

    it('handles non-power-of-two sized array', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3, 4, 5, 6, 7])
      expect(tree.sum()).toBe(28)
    })
  })

  describe('queryRange', () => {
    it('queries full range sum', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3, 4, 5])
      expect(tree.queryRange(0, 4)).toBe(15)
    })

    it('queries partial range', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3, 4, 5])
      expect(tree.queryRange(1, 3)).toBe(9)
    })

    it('queries single element', () => {
      const tree = LazySegmentTree.sumTree([10, 20, 30])
      expect(tree.queryRange(1, 1)).toBe(20)
    })

    it('queries first element', () => {
      const tree = LazySegmentTree.sumTree([10, 20, 30])
      expect(tree.queryRange(0, 0)).toBe(10)
    })

    it('queries last element', () => {
      const tree = LazySegmentTree.sumTree([10, 20, 30])
      expect(tree.queryRange(2, 2)).toBe(30)
    })

    it('returns identity for out-of-bounds range', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      expect(tree.queryRange(5, 10)).toBe(0)
    })

    it('returns identity for inverted range', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      expect(tree.queryRange(3, 1)).toBe(0)
    })

    it('clamps range to valid bounds', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      expect(tree.queryRange(-1, 10)).toBe(6)
    })

    it('returns identity for empty tree', () => {
      const tree = LazySegmentTree.sumTree([])
      expect(tree.queryRange(0, 0)).toBe(0)
    })

    it('queries range on min tree', () => {
      const tree = LazySegmentTree.minTree([5, 3, 1, 4, 2])
      expect(tree.queryRange(0, 2)).toBe(1)
      expect(tree.queryRange(3, 4)).toBe(2)
    })

    it('queries range on max tree', () => {
      const tree = LazySegmentTree.maxTree([5, 3, 1, 4, 2])
      expect(tree.queryRange(0, 2)).toBe(5)
      expect(tree.queryRange(2, 4)).toBe(4)
    })
  })

  describe('updateRange', () => {
    it('adds to full range', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3, 4, 5])
      tree.updateRange(0, 4, 10)
      expect(tree.toArray()).toEqual([11, 12, 13, 14, 15])
    })

    it('adds to partial range', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3, 4, 5])
      tree.updateRange(1, 3, 5)
      expect(tree.toArray()).toEqual([1, 7, 8, 9, 5])
    })

    it('adds to single element', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3, 4, 5])
      tree.updateRange(2, 2, 100)
      expect(tree.toArray()).toEqual([1, 2, 103, 4, 5])
    })

    it('adds to first element', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      tree.updateRange(0, 0, 10)
      expect(tree.get(0)).toBe(11)
    })

    it('adds to last element', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      tree.updateRange(2, 2, 10)
      expect(tree.get(2)).toBe(13)
    })

    it('handles negative values', () => {
      const tree = LazySegmentTree.sumTree([10, 20, 30])
      tree.updateRange(0, 2, -5)
      expect(tree.toArray()).toEqual([5, 15, 25])
    })

    it('handles multiple range updates', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3, 4, 5])
      tree.updateRange(0, 2, 10)
      tree.updateRange(2, 4, 20)
      expect(tree.toArray()).toEqual([11, 12, 33, 24, 25])
    })

    it('handles overlapping range updates', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3, 4, 5])
      tree.updateRange(0, 4, 1)
      tree.updateRange(2, 4, 2)
      expect(tree.toArray()).toEqual([2, 3, 6, 7, 8])
    })

    it('no-ops on empty tree', () => {
      const tree = LazySegmentTree.sumTree([])
      tree.updateRange(0, 0, 10)
      expect(tree.size).toBe(0)
    })

    it('no-ops on out-of-bounds range', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      tree.updateRange(5, 10, 10)
      expect(tree.toArray()).toEqual([1, 2, 3])
    })

    it('clamps range to valid bounds', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      tree.updateRange(-1, 10, 1)
      expect(tree.toArray()).toEqual([2, 3, 4])
    })

    it('updates range on min tree correctly', () => {
      const tree = LazySegmentTree.minTree([5, 3, 1, 4, 2])
      tree.updateRange(0, 4, 10)
      expect(tree.queryRange(0, 4)).toBe(11)
    })

    it('updates range on max tree correctly', () => {
      const tree = LazySegmentTree.maxTree([5, 3, 1, 4, 2])
      tree.updateRange(0, 4, 10)
      expect(tree.queryRange(0, 4)).toBe(15)
    })

    it('large range update', () => {
      const arr = Array.from({ length: 100 }, (_, i) => i + 1)
      const tree = LazySegmentTree.sumTree(arr)
      tree.updateRange(0, 99, 1)
      expect(tree.get(0)).toBe(2)
      expect(tree.get(99)).toBe(101)
      expect(tree.sum()).toBe(5050 + 100)
    })
  })

  describe('updatePoint', () => {
    it('updates a single point', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3, 4, 5])
      tree.updatePoint(2, 100)
      expect(tree.get(2)).toBe(100)
    })

    it('updates first element', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      tree.updatePoint(0, 999)
      expect(tree.get(0)).toBe(999)
    })

    it('updates last element', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      tree.updatePoint(2, 999)
      expect(tree.get(2)).toBe(999)
    })

    it('updates negative value', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      tree.updatePoint(1, -10)
      expect(tree.get(1)).toBe(-10)
    })

    it('updates zero value', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      tree.updatePoint(1, 0)
      expect(tree.get(1)).toBe(0)
    })

    it('ignores out-of-bounds index', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      tree.updatePoint(-1, 100)
      tree.updatePoint(5, 100)
      expect(tree.toArray()).toEqual([1, 2, 3])
    })

    it('updates sum after point update', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3, 4, 5])
      tree.updatePoint(2, 10)
      expect(tree.sum()).toBe(22)
    })

    it('updates range query after point update', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3, 4, 5])
      tree.updatePoint(2, 10)
      expect(tree.queryRange(0, 4)).toBe(22)
    })
  })

  describe('get', () => {
    it('gets element at index', () => {
      const tree = LazySegmentTree.sumTree([10, 20, 30])
      expect(tree.get(0)).toBe(10)
      expect(tree.get(1)).toBe(20)
      expect(tree.get(2)).toBe(30)
    })

    it('returns undefined for out-of-bounds', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      expect(tree.get(-1)).toBeUndefined()
      expect(tree.get(3)).toBeUndefined()
    })

    it('returns undefined for empty tree', () => {
      const tree = LazySegmentTree.sumTree([])
      expect(tree.get(0)).toBeUndefined()
    })

    it('reflects range updates', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3, 4, 5])
      tree.updateRange(1, 3, 10)
      expect(tree.get(0)).toBe(1)
      expect(tree.get(1)).toBe(12)
      expect(tree.get(2)).toBe(13)
      expect(tree.get(3)).toBe(14)
      expect(tree.get(4)).toBe(5)
    })

    it('reflects point updates', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      tree.updatePoint(1, 100)
      expect(tree.get(1)).toBe(100)
    })

    it('reflects combined updates', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3, 4, 5])
      tree.updateRange(0, 4, 1)
      tree.updatePoint(2, 100)
      expect(tree.get(0)).toBe(2)
      expect(tree.get(1)).toBe(3)
      expect(tree.get(2)).toBe(100)
      expect(tree.get(3)).toBe(5)
      expect(tree.get(4)).toBe(6)
    })
  })

  describe('size and isEmpty', () => {
    it('returns correct size', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      expect(tree.size).toBe(3)
    })

    it('returns 0 for empty tree', () => {
      const tree = LazySegmentTree.sumTree([])
      expect(tree.size).toBe(0)
    })

    it('isEmpty is true for empty tree', () => {
      const tree = LazySegmentTree.sumTree([])
      expect(tree.isEmpty).toBe(true)
    })

    it('isEmpty is false for non-empty tree', () => {
      const tree = LazySegmentTree.sumTree([1])
      expect(tree.isEmpty).toBe(false)
    })
  })

  describe('toArray', () => {
    it('returns original array', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3, 4, 5])
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('returns empty array for empty tree', () => {
      const tree = LazySegmentTree.sumTree([])
      expect(tree.toArray()).toEqual([])
    })

    it('reflects range updates', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      tree.updateRange(0, 2, 10)
      expect(tree.toArray()).toEqual([11, 12, 13])
    })

    it('reflects point updates', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      tree.updatePoint(1, 50)
      expect(tree.toArray()).toEqual([1, 50, 3])
    })

    it('reflects mixed updates', () => {
      const tree = LazySegmentTree.sumTree([0, 0, 0, 0, 0])
      tree.updateRange(0, 4, 1)
      tree.updatePoint(2, 10)
      expect(tree.toArray()).toEqual([1, 1, 10, 1, 1])
    })
  })

  describe('forEach', () => {
    it('iterates all elements', () => {
      const tree = LazySegmentTree.sumTree([10, 20, 30])
      const result: number[] = []
      tree.forEach((v, i) => {
        result.push(v)
      })
      expect(result).toEqual([10, 20, 30])
    })

    it('provides correct indices', () => {
      const tree = LazySegmentTree.sumTree([10, 20, 30])
      const indices: number[] = []
      tree.forEach((_v, i) => {
        indices.push(i)
      })
      expect(indices).toEqual([0, 1, 2])
    })

    it('does nothing for empty tree', () => {
      const tree = LazySegmentTree.sumTree([])
      let count = 0
      tree.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('reflects updates', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      tree.updateRange(0, 2, 5)
      const result: number[] = []
      tree.forEach((v) => { result.push(v) })
      expect(result).toEqual([6, 7, 8])
    })
  })

  describe('min', () => {
    it('finds minimum value', () => {
      const tree = LazySegmentTree.sumTree([5, 3, 1, 4, 2])
      expect(tree.min()).toBe(1)
    })

    it('returns undefined for empty tree', () => {
      const tree = LazySegmentTree.sumTree([])
      expect(tree.min()).toBeUndefined()
    })

    it('returns the element for single element tree', () => {
      const tree = LazySegmentTree.sumTree([42])
      expect(tree.min()).toBe(42)
    })

    it('handles negative values', () => {
      const tree = LazySegmentTree.sumTree([-5, -1, -3, -2])
      expect(tree.min()).toBe(-5)
    })

    it('reflects updates', () => {
      const tree = LazySegmentTree.sumTree([5, 3, 1, 4, 2])
      tree.updateRange(0, 4, -10)
      expect(tree.min()).toBe(-9)
    })
  })

  describe('max', () => {
    it('finds maximum value', () => {
      const tree = LazySegmentTree.sumTree([5, 3, 1, 4, 2])
      expect(tree.max()).toBe(5)
    })

    it('returns undefined for empty tree', () => {
      const tree = LazySegmentTree.sumTree([])
      expect(tree.max()).toBeUndefined()
    })

    it('returns the element for single element tree', () => {
      const tree = LazySegmentTree.sumTree([42])
      expect(tree.max()).toBe(42)
    })

    it('handles negative values', () => {
      const tree = LazySegmentTree.sumTree([-5, -1, -3, -2])
      expect(tree.max()).toBe(-1)
    })

    it('reflects updates', () => {
      const tree = LazySegmentTree.sumTree([5, 3, 1, 4, 2])
      tree.updateRange(0, 4, 100)
      expect(tree.max()).toBe(105)
    })
  })

  describe('sum', () => {
    it('returns total sum', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3, 4, 5])
      expect(tree.sum()).toBe(15)
    })

    it('returns identity for empty tree', () => {
      const tree = LazySegmentTree.sumTree([])
      expect(tree.sum()).toBe(0)
    })

    it('returns single element sum', () => {
      const tree = LazySegmentTree.sumTree([42])
      expect(tree.sum()).toBe(42)
    })

    it('reflects range updates', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      tree.updateRange(0, 2, 5)
      expect(tree.sum()).toBe(6 + 15)
    })

    it('reflects point updates', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      tree.updatePoint(1, 10)
      expect(tree.sum()).toBe(14)
    })
  })

  describe('build', () => {
    it('rebuilds from new array', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      tree.build([10, 20, 30, 40])
      expect(tree.size).toBe(4)
      expect(tree.toArray()).toEqual([10, 20, 30, 40])
    })

    it('builds empty array', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      tree.build([])
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })

    it('builds single element', () => {
      const tree = LazySegmentTree.sumTree([])
      tree.build([99])
      expect(tree.size).toBe(1)
      expect(tree.get(0)).toBe(99)
    })

    it('resets lazy state on rebuild', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      tree.updateRange(0, 2, 100)
      tree.build([10, 20, 30])
      expect(tree.toArray()).toEqual([10, 20, 30])
    })

    it('builds larger array', () => {
      const tree = LazySegmentTree.sumTree([1])
      const arr = Array.from({ length: 50 }, (_, i) => i)
      tree.build(arr)
      expect(tree.size).toBe(50)
      expect(tree.sum()).toBe(1225)
    })
  })

  describe('lazy propagation correctness', () => {
    it('lazy propagates on query after update', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3, 4, 5, 6, 7, 8])
      tree.updateRange(0, 7, 1)
      expect(tree.queryRange(0, 3)).toBe(14)
      expect(tree.queryRange(4, 7)).toBe(30)
    })

    it('lazy propagates on point get after update', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3, 4, 5, 6, 7, 8])
      tree.updateRange(0, 7, 10)
      expect(tree.get(0)).toBe(11)
      expect(tree.get(7)).toBe(18)
    })

    it('multiple lazy updates combine correctly', () => {
      const tree = LazySegmentTree.sumTree([1, 1, 1, 1])
      tree.updateRange(0, 3, 1)
      tree.updateRange(0, 3, 2)
      tree.updateRange(0, 3, 3)
      expect(tree.toArray()).toEqual([7, 7, 7, 7])
    })

    it('lazy updates on sub-ranges', () => {
      const tree = LazySegmentTree.sumTree([0, 0, 0, 0, 0, 0, 0, 0])
      tree.updateRange(0, 3, 5)
      tree.updateRange(4, 7, 10)
      expect(tree.queryRange(0, 3)).toBe(20)
      expect(tree.queryRange(4, 7)).toBe(40)
      expect(tree.queryRange(0, 7)).toBe(60)
    })

    it('point update after range update', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3, 4, 5])
      tree.updateRange(0, 4, 10)
      tree.updatePoint(2, 0)
      expect(tree.toArray()).toEqual([11, 12, 0, 14, 15])
    })

    it('range update after point update', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3, 4, 5])
      tree.updatePoint(2, 100)
      tree.updateRange(0, 4, 1)
      expect(tree.toArray()).toEqual([2, 3, 101, 5, 6])
    })

    it('nested range updates', () => {
      const tree = LazySegmentTree.sumTree([0, 0, 0, 0, 0, 0, 0, 0])
      tree.updateRange(0, 7, 1)
      tree.updateRange(2, 5, 1)
      tree.updateRange(3, 4, 1)
      expect(tree.toArray()).toEqual([1, 1, 2, 3, 3, 2, 1, 1])
    })

    it('lazy propagation with non-power-of-two', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3, 4, 5])
      tree.updateRange(1, 3, 10)
      expect(tree.get(0)).toBe(1)
      expect(tree.get(1)).toBe(12)
      expect(tree.get(2)).toBe(13)
      expect(tree.get(3)).toBe(14)
      expect(tree.get(4)).toBe(5)
    })
  })

  describe('static factory methods', () => {
    it('sumTree works correctly', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      expect(tree.sum()).toBe(6)
      tree.updateRange(0, 2, 1)
      expect(tree.sum()).toBe(9)
    })

    it('minTree works correctly', () => {
      const tree = LazySegmentTree.minTree([5, 3, 1, 4, 2])
      expect(tree.queryRange(0, 4)).toBe(1)
      tree.updateRange(0, 4, 10)
      expect(tree.queryRange(0, 4)).toBe(11)
    })

    it('maxTree works correctly', () => {
      const tree = LazySegmentTree.maxTree([5, 3, 1, 4, 2])
      expect(tree.queryRange(0, 4)).toBe(5)
      tree.updateRange(0, 4, 10)
      expect(tree.queryRange(0, 4)).toBe(15)
    })

    it('gcdTree works correctly', () => {
      const tree = LazySegmentTree.gcdTree([12, 18, 24, 9])
      expect(tree.queryRange(0, 3)).toBe(3)
      expect(tree.queryRange(0, 1)).toBe(6)
    })
  })

  describe('min tree with lazy updates', () => {
    it('tracks min after range update', () => {
      const tree = LazySegmentTree.minTree([10, 20, 30, 40, 50])
      tree.updateRange(0, 4, -5)
      expect(tree.queryRange(0, 4)).toBe(5)
    })

    it('tracks min with partial update', () => {
      const tree = LazySegmentTree.minTree([10, 20, 30, 40, 50])
      tree.updateRange(2, 4, -25)
      expect(tree.queryRange(0, 1)).toBe(10)
      expect(tree.queryRange(2, 4)).toBe(5)
      expect(tree.queryRange(0, 4)).toBe(5)
    })

    it('min with multiple updates', () => {
      const tree = LazySegmentTree.minTree([10, 20, 30])
      tree.updateRange(0, 2, -5)
      tree.updateRange(1, 2, -10)
      expect(tree.toArray()).toEqual([5, 5, 15])
      expect(tree.queryRange(0, 2)).toBe(5)
    })
  })

  describe('max tree with lazy updates', () => {
    it('tracks max after range update', () => {
      const tree = LazySegmentTree.maxTree([10, 20, 30, 40, 50])
      tree.updateRange(0, 2, 100)
      expect(tree.queryRange(0, 2)).toBe(130)
      expect(tree.queryRange(0, 4)).toBe(130)
    })

    it('tracks max with partial update', () => {
      const tree = LazySegmentTree.maxTree([10, 20, 30, 40, 50])
      tree.updateRange(0, 1, 100)
      expect(tree.queryRange(0, 4)).toBe(120)
    })
  })

  describe('edge cases', () => {
    it('handles large numbers', () => {
      const tree = LazySegmentTree.sumTree([1e15, 2e15, 3e15])
      expect(tree.sum()).toBe(6e15)
    })

    it('handles negative numbers', () => {
      const tree = LazySegmentTree.sumTree([-1, -2, -3])
      expect(tree.sum()).toBe(-6)
    })

    it('handles mix of positive and negative', () => {
      const tree = LazySegmentTree.sumTree([-5, 10, -3, 8])
      expect(tree.sum()).toBe(10)
    })

    it('handles zero array', () => {
      const tree = LazySegmentTree.sumTree([0, 0, 0, 0])
      expect(tree.sum()).toBe(0)
      tree.updateRange(0, 3, 5)
      expect(tree.toArray()).toEqual([5, 5, 5, 5])
    })

    it('handles update with zero value', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      tree.updateRange(0, 2, 0)
      expect(tree.toArray()).toEqual([1, 2, 3])
    })

    it('handles point update with same value', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      tree.updatePoint(1, 2)
      expect(tree.toArray()).toEqual([1, 2, 3])
    })

    it('handles very large array', () => {
      const arr = Array.from({ length: 1000 }, (_, i) => i + 1)
      const tree = LazySegmentTree.sumTree(arr)
      expect(tree.sum()).toBe(500500)
      tree.updateRange(0, 999, 1)
      expect(tree.get(0)).toBe(2)
      expect(tree.get(999)).toBe(1001)
    })

    it('handles alternating updates and queries', () => {
      const tree = LazySegmentTree.sumTree([0, 0, 0, 0, 0])
      tree.updateRange(0, 4, 1)
      expect(tree.queryRange(0, 4)).toBe(5)
      tree.updateRange(0, 2, 1)
      expect(tree.queryRange(0, 4)).toBe(8)
      tree.updatePoint(4, 100)
      expect(tree.queryRange(0, 4)).toBe(107)
    })

    it('handles size 1 array with updates', () => {
      const tree = LazySegmentTree.sumTree([10])
      tree.updateRange(0, 0, 5)
      expect(tree.get(0)).toBe(15)
      tree.updatePoint(0, 100)
      expect(tree.get(0)).toBe(100)
    })

    it('handles size 2 array with updates', () => {
      const tree = LazySegmentTree.sumTree([1, 2])
      tree.updateRange(0, 1, 10)
      expect(tree.toArray()).toEqual([11, 12])
      tree.updatePoint(0, 0)
      expect(tree.toArray()).toEqual([0, 12])
    })

    it('handles many sequential range updates', () => {
      const tree = LazySegmentTree.sumTree([0, 0, 0, 0, 0, 0, 0, 0])
      for (let i = 0; i < 8; i++) {
        tree.updateRange(i, i, 1)
      }
      expect(tree.toArray()).toEqual([1, 1, 1, 1, 1, 1, 1, 1])
    })
  })

  describe('custom operations', () => {
    it('supports multiplication combine', () => {
      const tree = new LazySegmentTree([2, 3, 4], {
        identity: 1,
        lazyIdentity: 1,
        combine: (a, b) => a * b,
        lazyApply: (value, lazy, _len) => value * lazy,
        lazyCombine: (_existing, incoming) => incoming,
      })
      expect(tree.queryRange(0, 2)).toBe(24)
    })

    it('supports bitwise AND combine', () => {
      const tree = new LazySegmentTree([0b1111, 0b1100, 0b1010], {
        identity: 0b1111,
        lazyIdentity: 0b1111,
        combine: (a, b) => a & b,
        lazyApply: (value, lazy, _len) => value & lazy,
        lazyCombine: (_existing, incoming) => incoming,
      })
      expect(tree.queryRange(0, 2)).toBe(0b1000)
    })

    it('supports bitwise OR combine', () => {
      const tree = new LazySegmentTree([0b1000, 0b0100, 0b0010], {
        identity: 0,
        lazyIdentity: 0,
        combine: (a, b) => a | b,
        lazyApply: (value, lazy, _len) => value | lazy,
        lazyCombine: (_existing, incoming) => incoming,
      })
      expect(tree.queryRange(0, 2)).toBe(0b1110)
    })

    it('supports XOR combine', () => {
      const tree = new LazySegmentTree([1, 1, 0], {
        identity: 0,
        lazyIdentity: 0,
        combine: (a, b) => a ^ b,
        lazyApply: (value, lazy, _len) => value ^ lazy,
        lazyCombine: (_existing, incoming) => incoming,
      })
      expect(tree.queryRange(0, 2)).toBe(0)
      expect(tree.queryRange(0, 1)).toBe(0)
      expect(tree.queryRange(1, 2)).toBe(1)
    })

    it('supports string concatenation', () => {
      const tree = new LazySegmentTree(['a', 'b', 'c'], {
        identity: '',
        lazyIdentity: '',
        combine: (a, b) => a + b,
        lazyApply: (value, lazy, _len) => value + lazy,
        lazyCombine: (_existing, incoming) => incoming,
      })
      expect(tree.queryRange(0, 2)).toBe('abc')
    })

    it('supports max with set operation', () => {
      const tree = new LazySegmentTree([1, 2, 3, 4, 5], {
        identity: -Infinity,
        lazyIdentity: -Infinity,
        combine: (a, b) => Math.max(a, b),
        lazyApply: (value, lazy, _len) => Math.max(value, lazy),
        lazyCombine: (a, b) => Math.max(a, b),
      })
      expect(tree.queryRange(0, 4)).toBe(5)
      tree.updateRange(0, 4, 3)
      expect(tree.queryRange(0, 4)).toBe(5)
      tree.updateRange(0, 4, 10)
      expect(tree.queryRange(0, 4)).toBe(10)
    })

    it('supports count of odd numbers', () => {
      const tree = new LazySegmentTree([1, 2, 3, 4, 5], {
        identity: 0,
        lazyIdentity: 0,
        combine: (a, b) => a + b,
        lazyApply: (value, _lazy, _len) => value,
        lazyCombine: (_existing, incoming) => incoming,
      })
      const arr = tree.toArray()
      let oddCount = 0
      for (const v of arr) {
        if (v % 2 !== 0) oddCount++
      }
      expect(oddCount).toBe(3)
    })
  })

  describe('query after multiple operations', () => {
    it('correct sum after many updates', () => {
      const tree = LazySegmentTree.sumTree([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
      tree.updateRange(0, 9, 1)
      tree.updateRange(3, 7, 2)
      tree.updatePoint(5, 100)
      expect(tree.toArray()).toEqual([1, 1, 1, 3, 3, 100, 3, 3, 1, 1])
      expect(tree.sum()).toBe(117)
    })

    it('range query on sub-range after updates', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3, 4, 5, 6, 7, 8])
      tree.updateRange(0, 7, 1)
      tree.updateRange(2, 5, 2)
      expect(tree.queryRange(0, 1)).toBe(5)
      expect(tree.queryRange(2, 5)).toBe(30)
      expect(tree.queryRange(6, 7)).toBe(17)
    })

    it('point query between range updates', () => {
      const tree = LazySegmentTree.sumTree([0, 0, 0, 0, 0, 0])
      tree.updateRange(0, 2, 1)
      tree.updateRange(3, 5, 2)
      expect(tree.get(2)).toBe(1)
      expect(tree.get(3)).toBe(2)
    })
  })

  describe('property methods', () => {
    it('min returns correct after build', () => {
      const tree = LazySegmentTree.sumTree([3, 1, 4, 1, 5])
      expect(tree.min()).toBe(1)
    })

    it('max returns correct after build', () => {
      const tree = LazySegmentTree.sumTree([3, 1, 4, 1, 5])
      expect(tree.max()).toBe(5)
    })

    it('min/max with all same values', () => {
      const tree = LazySegmentTree.sumTree([7, 7, 7, 7])
      expect(tree.min()).toBe(7)
      expect(tree.max()).toBe(7)
    })

    it('min/max after updates', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3, 4, 5])
      tree.updateRange(0, 2, -100)
      expect(tree.min()).toBe(-99)
      expect(tree.max()).toBe(5)
    })

    it('forEach collects correctly', () => {
      const tree = LazySegmentTree.sumTree([10, 20, 30, 40])
      const values: Array<{ v: number; i: number }> = []
      tree.forEach((v, i) => values.push({ v, i }))
      expect(values).toEqual([
        { v: 10, i: 0 },
        { v: 20, i: 1 },
        { v: 30, i: 2 },
        { v: 40, i: 3 },
      ])
    })
  })

  describe('build resets state', () => {
    it('build clears previous updates', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      tree.updateRange(0, 2, 100)
      tree.build([4, 5, 6])
      expect(tree.toArray()).toEqual([4, 5, 6])
      expect(tree.sum()).toBe(15)
    })

    it('build changes size', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      expect(tree.size).toBe(3)
      tree.build([1, 2, 3, 4, 5, 6, 7, 8])
      expect(tree.size).toBe(8)
    })

    it('build to empty', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      tree.build([])
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })
  })

  describe('stress tests', () => {
    it.skip('many range updates then query', () => {
      const n = 100
      const arr = new Array(n).fill(0)
      const tree = LazySegmentTree.sumTree(arr)
      for (let i = 0; i < n; i++) {
        tree.updateRange(i, n - 1, 1)
      }
      expect(tree.get(0)).toBe(1)
      expect(tree.get(1)).toBe(2)
      expect(tree.get(99)).toBe(100)
      expect(tree.sum()).toBe(n * (n + 1) / 2)
    })

    it('alternating updates and queries', () => {
      const tree = LazySegmentTree.sumTree([0, 0, 0, 0, 0, 0, 0, 0])
      for (let i = 0; i < 8; i++) {
        tree.updateRange(i, i, i + 1)
        expect(tree.get(i)).toBe(i + 1)
      }
      expect(tree.sum()).toBe(36)
    })

    it('large range update and verify each element', () => {
      const n = 50
      const arr = Array.from({ length: n }, (_, i) => i)
      const tree = LazySegmentTree.sumTree(arr)
      tree.updateRange(10, 39, 100)
      for (let i = 0; i < n; i++) {
        const expected = i >= 10 && i <= 39 ? i + 100 : i
        expect(tree.get(i)).toBe(expected)
      }
    })

    it('random operations consistency', () => {
      const n = 20
      const naive = Array.from({ length: n }, (_, i) => i + 1)
      const tree = LazySegmentTree.sumTree([...naive])

      const seed = 42
      let s = seed
      function rand(): number {
        s = (s * 1103515245 + 12345) & 0x7fffffff
        return s
      }

      for (let op = 0; op < 50; op++) {
        const lo = rand() % n
        const hi = lo + (rand() % (n - lo))
        const val = (rand() % 100) - 50

        for (let i = lo; i <= hi; i++) {
          naive[i]! += val
        }
        tree.updateRange(lo, hi, val)

        const qLo = rand() % n
        const qHi = qLo + (rand() % (n - qLo))
        let expected = 0
        for (let i = qLo; i <= qHi; i++) {
          expected += naive[i]!
        }
        expect(tree.queryRange(qLo, qHi)).toBe(expected)
      }
    })
  })

  describe('min tree specific', () => {
    it('queries sub-ranges', () => {
      const tree = LazySegmentTree.minTree([8, 3, 5, 1, 9, 2, 7, 4])
      expect(tree.queryRange(0, 3)).toBe(1)
      expect(tree.queryRange(4, 7)).toBe(2)
      expect(tree.queryRange(0, 7)).toBe(1)
    })

    it('after range update, queries correctly', () => {
      const tree = LazySegmentTree.minTree([8, 3, 5, 1, 9, 2, 7, 4])
      tree.updateRange(4, 7, -5)
      expect(tree.queryRange(4, 7)).toBe(-3)
      expect(tree.queryRange(0, 7)).toBe(-3)
    })
  })

  describe('max tree specific', () => {
    it('queries sub-ranges', () => {
      const tree = LazySegmentTree.maxTree([8, 3, 5, 1, 9, 2, 7, 4])
      expect(tree.queryRange(0, 3)).toBe(8)
      expect(tree.queryRange(4, 7)).toBe(9)
      expect(tree.queryRange(0, 7)).toBe(9)
    })

    it('after range update, queries correctly', () => {
      const tree = LazySegmentTree.maxTree([8, 3, 5, 1, 9, 2, 7, 4])
      tree.updateRange(0, 3, 10)
      expect(tree.queryRange(0, 3)).toBe(18)
      expect(tree.queryRange(0, 7)).toBe(18)
    })
  })

  describe('gcd tree specific', () => {
    it('computes gcd of full range', () => {
      const tree = LazySegmentTree.gcdTree([24, 36, 48, 60])
      expect(tree.queryRange(0, 3)).toBe(12)
    })

    it('computes gcd of sub-range', () => {
      const tree = LazySegmentTree.gcdTree([24, 36, 48, 60])
      expect(tree.queryRange(0, 1)).toBe(12)
      expect(tree.queryRange(2, 3)).toBe(12)
    })

    it('gcd with zero', () => {
      const tree = LazySegmentTree.gcdTree([0, 5, 10])
      expect(tree.queryRange(0, 2)).toBe(5)
    })

    it('gcd with same numbers', () => {
      const tree = LazySegmentTree.gcdTree([6, 6, 6, 6])
      expect(tree.queryRange(0, 3)).toBe(6)
    })
  })

  describe('boundary queries', () => {
    it('query left boundary only', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3, 4, 5])
      expect(tree.queryRange(0, 0)).toBe(1)
    })

    it('query right boundary only', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3, 4, 5])
      expect(tree.queryRange(4, 4)).toBe(5)
    })

    it('query with left beyond array', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      expect(tree.queryRange(-5, 1)).toBe(3)
    })

    it('query with right beyond array', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      expect(tree.queryRange(1, 100)).toBe(5)
    })

    it('update left boundary only', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3, 4, 5])
      tree.updateRange(0, 0, 10)
      expect(tree.get(0)).toBe(11)
      expect(tree.get(1)).toBe(2)
    })

    it('update right boundary only', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3, 4, 5])
      tree.updateRange(4, 4, 10)
      expect(tree.get(3)).toBe(4)
      expect(tree.get(4)).toBe(15)
    })
  })

  describe('immutability of source array', () => {
    it('does not modify source array on build', () => {
      const arr = [1, 2, 3, 4, 5]
      const copy = [...arr]
      LazySegmentTree.sumTree(arr)
      expect(arr).toEqual(copy)
    })

    it('does not modify source array on update', () => {
      const arr = [1, 2, 3]
      const copy = [...arr]
      const tree = LazySegmentTree.sumTree(arr)
      tree.updateRange(0, 2, 100)
      expect(arr).toEqual(copy)
    })
  })
})
