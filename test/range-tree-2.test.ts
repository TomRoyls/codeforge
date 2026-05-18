import { describe, it, expect } from 'vitest'
import { RangeTree } from '../src/core/range-tree-2/index.js'

describe('RangeTree', () => {
  // ─── Construction & Insert ───
  describe('construction and insert', () => {
    it('creates empty tree', () => {
      const tree = new RangeTree<number>()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })

    it('creates from iterable', () => {
      const tree = new RangeTree<number>([5, 3, 7, 1])
      expect(tree.size).toBe(4)
    })

    it('insert adds value', () => {
      const tree = new RangeTree<number>()
      tree.insert(5)
      expect(tree.size).toBe(1)
      expect(tree.isEmpty).toBe(false)
    })
  })

  // ─── Query ───
  describe('query', () => {
    it('queryRange returns values in range', () => {
      const tree = new RangeTree<number>([1, 3, 5, 7, 9])
      expect(tree.queryRange(3, 7)).toEqual([3, 5, 7])
    })

    it('queryPoint checks existence', () => {
      const tree = new RangeTree<number>([1, 3, 5])
      expect(tree.queryPoint(3)).toBe(true)
      expect(tree.queryPoint(4)).toBe(false)
    })

    it('contains delegates to queryPoint', () => {
      const tree = new RangeTree<number>([1, 5])
      expect(tree.contains(1)).toBe(true)
      expect(tree.contains(2)).toBe(false)
    })

    it('count returns count in range', () => {
      const tree = new RangeTree<number>([1, 3, 5, 7, 9])
      expect(tree.count(3, 7)).toBe(3)
    })
  })

  // ─── Min/Max & Nearest ───
  describe('min max and nearest', () => {
    it('minX returns minimum', () => {
      const tree = new RangeTree<number>([5, 3, 7])
      expect(tree.minX).toBe(3)
    })

    it('maxX returns maximum', () => {
      const tree = new RangeTree<number>([5, 3, 7])
      expect(tree.maxX).toBe(7)
    })

    it('minX undefined for empty tree', () => {
      expect(new RangeTree<number>().minX).toBeUndefined()
    })

    it('nearest finds closest value', () => {
      const tree = new RangeTree<number>([1, 5, 10])
      expect(tree.nearest(6)).toBe(5)
    })

    it('kNearest returns k closest', () => {
      const tree = new RangeTree<number>([1, 5, 10, 20])
      const result = tree.kNearest(6, 2)
      expect(result).toHaveLength(2)
    })

    it('kNearest returns empty for k <= 0', () => {
      const tree = new RangeTree<number>([1])
      expect(tree.kNearest(1, 0)).toEqual([])
    })
  })

  // ─── Remove ───
  describe('remove', () => {
    it('removes existing value', () => {
      const tree = new RangeTree<number>([1, 3, 5])
      expect(tree.remove(3)).toBe(true)
      expect(tree.size).toBe(2)
      expect(tree.contains(3)).toBe(false)
    })

    it('returns false for non-existing', () => {
      const tree = new RangeTree<number>([1])
      expect(tree.remove(99)).toBe(false)
    })
  })

  // ─── Utilities ───
  describe('utilities', () => {
    it('toArray returns sorted values', () => {
      const tree = new RangeTree<number>([5, 1, 3])
      expect(tree.toArray()).toEqual([1, 3, 5])
    })

    it('forEach iterates in order', () => {
      const tree = new RangeTree<number>([3, 1, 2])
      const vals: number[] = []
      tree.forEach((v) => vals.push(v))
      expect(vals).toEqual([1, 2, 3])
    })

    it('clear removes all', () => {
      const tree = new RangeTree<number>([1, 2, 3])
      tree.clear()
      expect(tree.size).toBe(0)
    })

    it('custom comparator works', () => {
      const tree = new RangeTree<string>(['banana', 'apple', 'cherry'], {
        comparator: (a, b) => a.localeCompare(b),
      })
      expect(tree.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })
  })
})
