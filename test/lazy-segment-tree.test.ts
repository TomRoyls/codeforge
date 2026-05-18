import { LazySegmentTree } from '../src/core/lazy-segment-tree/index.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('LazySegmentTree', () => {
  describe('constructor', () => {
    it('creates tree from array', () => {
      const tree = new LazySegmentTree([1, 2, 3, 4], {
        identity: 0,
        lazyIdentity: 0,
        combine: (a, b) => a + b,
        lazyApply: (v, l, len) => v + l * len,
        lazyCombine: (a, b) => a + b,
      })
      expect(tree.size).toBe(4)
      expect(tree.isEmpty).toBe(false)
    })

    it('handles empty array', () => {
      const tree = LazySegmentTree.sumTree([])
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })
  })

  // ─── Static Factories ───────────────────────────────────────────────────

  describe('static factories', () => {
    it('sumTree computes sums', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3, 4, 5])
      expect(tree.sum()).toBe(15)
      expect(tree.queryRange(0, 2)).toBe(6)
    })

    it('minTree finds minimums', () => {
      const tree = LazySegmentTree.minTree([5, 3, 7, 1, 4])
      expect(tree.queryRange(0, 4)).toBe(1)
      expect(tree.queryRange(0, 1)).toBe(3)
    })

    it('maxTree finds maximums', () => {
      const tree = LazySegmentTree.maxTree([1, 5, 3, 8, 2])
      expect(tree.queryRange(0, 4)).toBe(8)
    })
  })

  // ─── Range Queries ──────────────────────────────────────────────────────

  describe('range queries', () => {
    it('queries single element', () => {
      const tree = LazySegmentTree.sumTree([10, 20, 30])
      expect(tree.queryRange(1, 1)).toBe(20)
    })

    it('queries full range', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      expect(tree.queryRange(0, 2)).toBe(6)
    })

    it('returns identity for empty/invalid range', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      expect(tree.queryRange(5, 10)).toBe(0)
      expect(tree.queryRange(2, 1)).toBe(0)
    })
  })

  // ─── Range Updates ──────────────────────────────────────────────────────

  describe('range updates', () => {
    it('updates range with lazy propagation', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3, 4])
      tree.updateRange(0, 2, 10)
      expect(tree.queryRange(0, 2)).toBe(36)
      expect(tree.queryRange(3, 3)).toBe(4)
    })

    it('multiple range updates compose', () => {
      const tree = LazySegmentTree.sumTree([1, 1, 1, 1])
      tree.updateRange(0, 3, 5)
      tree.updateRange(1, 2, 3)
      expect(tree.queryRange(0, 3)).toBe(4 * 1 + 4 * 5 + 2 * 3)
    })
  })

  // ─── Point Updates ──────────────────────────────────────────────────────

  describe('point updates', () => {
    it('updates single point', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      tree.updatePoint(1, 10)
      expect(tree.get(1)).toBe(10)
      expect(tree.sum()).toBe(14)
    })

    it('get returns individual element', () => {
      const tree = LazySegmentTree.sumTree([10, 20, 30])
      expect(tree.get(0)).toBe(10)
      expect(tree.get(1)).toBe(20)
      expect(tree.get(5)).toBe(undefined)
    })
  })

  // ─── Min / Max / Sum ────────────────────────────────────────────────────

  describe('min, max, sum', () => {
    it('min and max return extremes', () => {
      const tree = LazySegmentTree.sumTree([3, 1, 4, 1, 5])
      expect(tree.min()).toBe(1)
      expect(tree.max()).toBe(5)
    })

    it('returns undefined for empty tree', () => {
      const tree = LazySegmentTree.sumTree([])
      expect(tree.min()).toBe(undefined)
      expect(tree.max()).toBe(undefined)
      expect(tree.sum()).toBe(0)
    })
  })

  // ─── ToArray / ForEach / Build ──────────────────────────────────────────

  describe('toArray, forEach, build', () => {
    it('toArray returns current values', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      expect(tree.toArray()).toEqual([1, 2, 3])
    })

    it('forEach iterates elements', () => {
      const tree = LazySegmentTree.sumTree([10, 20])
      const collected: number[] = []
      tree.forEach((v) => collected.push(v))
      expect(collected).toEqual([10, 20])
    })

    it('build rebuilds tree', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3])
      tree.build([10, 20, 30, 40])
      expect(tree.size).toBe(4)
      expect(tree.sum()).toBe(100)
    })
  })

  // ─── Mixed Operations ───────────────────────────────────────────────────

  describe('mixed operations', () => {
    it('combines point updates with range queries', () => {
      const tree = LazySegmentTree.sumTree([1, 2, 3, 4, 5])
      tree.updateRange(1, 3, 10)
      tree.updatePoint(0, 100)
      expect(tree.get(0)).toBe(100)
      expect(tree.queryRange(1, 3)).toBe(39)
    })
  })
})
