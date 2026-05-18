import { describe, expect, it } from 'vitest'
import { AVLMultiset } from '../src/core/avl-multiset/avl-multiset.js'
import type {
  AVLMultisetOptions,
  AVLMultisetJSON,
  AVLMultisetStatistics,
} from '../src/core/avl-multiset/types.js'

describe('AVLMultiset', () => {
  // ─── Constructor ───────────────────────────────────────────────
  describe('constructor', () => {
    it('should create an empty multiset with default options', () => {
      const ms = new AVLMultiset()
      expect(ms.size).toBe(0)
      expect(ms.uniqueSize).toBe(0)
      expect(ms.isEmpty).toBe(true)
    })

    it('should create a multiset with a custom comparator', () => {
      const ms = new AVLMultiset<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      ms.add('charlie')
      ms.add('alpha')
      ms.add('bravo')
      expect(ms.min).toBe('alpha')
      expect(ms.max).toBe('charlie')
    })

    it('should accept no options argument', () => {
      const ms = new AVLMultiset<number>()
      ms.add(5)
      expect(ms.has(5)).toBe(true)
    })
  })

  // ─── Add / Has / Count ─────────────────────────────────────────
  describe('add / has / count', () => {
    it('should add a single element and report it present', () => {
      const ms = new AVLMultiset<number>()
      ms.add(10)
      expect(ms.has(10)).toBe(true)
      expect(ms.count(10)).toBe(1)
    })

    it('should not report absent elements', () => {
      const ms = new AVLMultiset<number>()
      ms.add(1)
      expect(ms.has(2)).toBe(false)
      expect(ms.count(2)).toBe(0)
    })

    it('should increment count when adding the same value multiple times', () => {
      const ms = new AVLMultiset<number>()
      ms.add(5)
      ms.add(5)
      ms.add(5)
      expect(ms.count(5)).toBe(3)
      expect(ms.uniqueSize).toBe(1)
      expect(ms.size).toBe(3)
    })

    it('should handle multiple distinct values', () => {
      const ms = new AVLMultiset<number>()
      ms.add(1)
      ms.add(2)
      ms.add(3)
      expect(ms.has(1)).toBe(true)
      expect(ms.has(2)).toBe(true)
      expect(ms.has(3)).toBe(true)
      expect(ms.count(1)).toBe(1)
      expect(ms.count(2)).toBe(1)
      expect(ms.count(3)).toBe(1)
    })

    it('should handle mixed duplicates and distinct values', () => {
      const ms = new AVLMultiset<number>()
      ms.add(1)
      ms.add(2)
      ms.add(1)
      ms.add(3)
      ms.add(2)
      ms.add(1)
      expect(ms.count(1)).toBe(3)
      expect(ms.count(2)).toBe(2)
      expect(ms.count(3)).toBe(1)
      expect(ms.size).toBe(6)
      expect(ms.uniqueSize).toBe(3)
    })
  })

  // ─── Size vs UniqueSize ────────────────────────────────────────
  describe('size vs uniqueSize', () => {
    it('should track total size as sum of counts', () => {
      const ms = new AVLMultiset<number>()
      ms.add(1)
      ms.add(1)
      ms.add(2)
      ms.add(2)
      ms.add(2)
      expect(ms.size).toBe(5)
      expect(ms.uniqueSize).toBe(2)
    })

    it('should return 0 for both on empty set', () => {
      const ms = new AVLMultiset<number>()
      expect(ms.size).toBe(0)
      expect(ms.uniqueSize).toBe(0)
    })

    it('should update size after remove', () => {
      const ms = new AVLMultiset<number>()
      ms.add(1)
      ms.add(1)
      ms.add(1)
      expect(ms.size).toBe(3)
      ms.remove(1)
      expect(ms.size).toBe(2)
      expect(ms.uniqueSize).toBe(1)
    })
  })

  // ─── Remove ────────────────────────────────────────────────────
  describe('remove', () => {
    it('should decrement count on remove', () => {
      const ms = new AVLMultiset<number>()
      ms.add(5)
      ms.add(5)
      expect(ms.remove(5)).toBe(true)
      expect(ms.count(5)).toBe(1)
      expect(ms.size).toBe(1)
    })

    it('should remove the node when count reaches 0', () => {
      const ms = new AVLMultiset<number>()
      ms.add(10)
      expect(ms.remove(10)).toBe(true)
      expect(ms.has(10)).toBe(false)
      expect(ms.count(10)).toBe(0)
      expect(ms.uniqueSize).toBe(0)
    })

    it('should return false when removing a non-existent value', () => {
      const ms = new AVLMultiset<number>()
      ms.add(1)
      expect(ms.remove(99)).toBe(false)
    })

    it('should return false when removing from an empty set', () => {
      const ms = new AVLMultiset<number>()
      expect(ms.remove(1)).toBe(false)
    })

    it('should handle removing from the middle of duplicates', () => {
      const ms = new AVLMultiset<number>()
      ms.add(7)
      ms.add(7)
      ms.add(7)
      ms.remove(7)
      expect(ms.count(7)).toBe(2)
      ms.remove(7)
      expect(ms.count(7)).toBe(1)
      ms.remove(7)
      expect(ms.count(7)).toBe(0)
      expect(ms.has(7)).toBe(false)
    })

    it('should correctly update uniqueSize only when fully removed', () => {
      const ms = new AVLMultiset<number>()
      ms.add(1)
      ms.add(1)
      ms.add(2)
      expect(ms.uniqueSize).toBe(2)
      ms.remove(1)
      expect(ms.uniqueSize).toBe(2)
      ms.remove(1)
      expect(ms.uniqueSize).toBe(1)
    })
  })

  // ─── isEmpty ──────────────────────────────────────────────────
  describe('isEmpty', () => {
    it('should be true on empty set', () => {
      const ms = new AVLMultiset<number>()
      expect(ms.isEmpty).toBe(true)
    })

    it('should be false after adding', () => {
      const ms = new AVLMultiset<number>()
      ms.add(1)
      expect(ms.isEmpty).toBe(false)
    })

    it('should be true after removing all elements', () => {
      const ms = new AVLMultiset<number>()
      ms.add(1)
      ms.remove(1)
      expect(ms.isEmpty).toBe(true)
    })

    it('should be true after clear', () => {
      const ms = new AVLMultiset<number>()
      ms.add(1)
      ms.add(2)
      ms.clear()
      expect(ms.isEmpty).toBe(true)
    })
  })

  // ─── Min / Max ────────────────────────────────────────────────
  describe('min / max', () => {
    it('should return undefined for empty set', () => {
      const ms = new AVLMultiset<number>()
      expect(ms.min).toBeUndefined()
      expect(ms.max).toBeUndefined()
    })

    it('should return the only element for single-element set', () => {
      const ms = new AVLMultiset<number>()
      ms.add(42)
      expect(ms.min).toBe(42)
      expect(ms.max).toBe(42)
    })

    it('should return leftmost and rightmost values', () => {
      const ms = new AVLMultiset<number>()
      ms.add(5)
      ms.add(3)
      ms.add(8)
      ms.add(1)
      ms.add(10)
      expect(ms.min).toBe(1)
      expect(ms.max).toBe(10)
    })

    it('should update min/max after removal', () => {
      const ms = new AVLMultiset<number>()
      ms.add(1)
      ms.add(5)
      ms.add(10)
      ms.remove(1)
      expect(ms.min).toBe(5)
      ms.remove(10)
      expect(ms.max).toBe(5)
    })

    it('should handle duplicates at min/max', () => {
      const ms = new AVLMultiset<number>()
      ms.add(1)
      ms.add(1)
      ms.add(5)
      ms.remove(1)
      expect(ms.min).toBe(1)
      expect(ms.count(1)).toBe(1)
    })
  })

  // ─── LowerBound / UpperBound ──────────────────────────────────
  describe('lowerBound / upperBound', () => {
    it('should return undefined on empty set', () => {
      const ms = new AVLMultiset<number>()
      expect(ms.lowerBound(5)).toBeUndefined()
      expect(ms.upperBound(5)).toBeUndefined()
    })

    it('lowerBound should find smallest element >= value', () => {
      const ms = new AVLMultiset<number>()
      ms.add(1)
      ms.add(3)
      ms.add(5)
      ms.add(7)
      expect(ms.lowerBound(4)).toBe(5)
      expect(ms.lowerBound(3)).toBe(3)
      expect(ms.lowerBound(0)).toBe(1)
    })

    it('upperBound should find smallest element > value', () => {
      const ms = new AVLMultiset<number>()
      ms.add(1)
      ms.add(3)
      ms.add(5)
      ms.add(7)
      expect(ms.upperBound(3)).toBe(5)
      expect(ms.upperBound(5)).toBe(7)
    })

    it('should return undefined when no element satisfies bound', () => {
      const ms = new AVLMultiset<number>()
      ms.add(1)
      ms.add(3)
      expect(ms.lowerBound(10)).toBeUndefined()
      expect(ms.upperBound(10)).toBeUndefined()
    })

    it('lowerBound with exact match returns that element', () => {
      const ms = new AVLMultiset<number>()
      ms.add(10)
      ms.add(20)
      ms.add(30)
      expect(ms.lowerBound(20)).toBe(20)
    })

    it('upperBound with exact match returns next element', () => {
      const ms = new AVLMultiset<number>()
      ms.add(10)
      ms.add(20)
      ms.add(30)
      expect(ms.upperBound(20)).toBe(30)
    })

    it('should work with single-element set', () => {
      const ms = new AVLMultiset<number>()
      ms.add(5)
      expect(ms.lowerBound(5)).toBe(5)
      expect(ms.lowerBound(4)).toBe(5)
      expect(ms.upperBound(5)).toBeUndefined()
      expect(ms.upperBound(4)).toBe(5)
    })
  })

  // ─── toArray / toArraySorted ──────────────────────────────────
  describe('toArray / toArraySorted', () => {
    it('should return empty array for empty set', () => {
      const ms = new AVLMultiset<number>()
      expect(ms.toArray()).toEqual([])
      expect(ms.toArraySorted()).toEqual([])
    })

    it('should return elements in sorted order', () => {
      const ms = new AVLMultiset<number>()
      ms.add(3)
      ms.add(1)
      ms.add(2)
      expect(ms.toArray()).toEqual([1, 2, 3])
      expect(ms.toArraySorted()).toEqual([1, 2, 3])
    })

    it('should include duplicates according to count', () => {
      const ms = new AVLMultiset<number>()
      ms.add(5)
      ms.add(5)
      ms.add(5)
      expect(ms.toArray()).toEqual([5, 5, 5])
    })

    it('should include duplicates in sorted order among distinct values', () => {
      const ms = new AVLMultiset<number>()
      ms.add(3)
      ms.add(1)
      ms.add(3)
      ms.add(2)
      ms.add(1)
      expect(ms.toArray()).toEqual([1, 1, 2, 3, 3])
    })
  })

  // ─── forEach ──────────────────────────────────────────────────
  describe('forEach', () => {
    it('should not call callback on empty set', () => {
      const ms = new AVLMultiset<number>()
      const items: [number, number][] = []
      ms.forEach((v, c) => items.push([v, c]))
      expect(items).toEqual([])
    })

    it('should iterate unique elements in order with their counts', () => {
      const ms = new AVLMultiset<number>()
      ms.add(1)
      ms.add(2)
      ms.add(2)
      ms.add(3)
      ms.add(3)
      ms.add(3)
      const items: [number, number][] = []
      ms.forEach((v, c) => items.push([v, c]))
      expect(items).toEqual([
        [1, 1],
        [2, 2],
        [3, 3],
      ])
    })

    it('should visit elements in sorted order', () => {
      const ms = new AVLMultiset<number>()
      ms.add(30)
      ms.add(10)
      ms.add(20)
      const values: number[] = []
      ms.forEach((v) => values.push(v))
      expect(values).toEqual([10, 20, 30])
    })
  })

  // ─── Iterator ─────────────────────────────────────────────────
  describe('[Symbol.iterator]', () => {
    it('should produce no elements for empty set', () => {
      const ms = new AVLMultiset<number>()
      expect([...ms]).toEqual([])
    })

    it('should yield each element count times', () => {
      const ms = new AVLMultiset<number>()
      ms.add(5)
      ms.add(5)
      ms.add(5)
      expect([...ms]).toEqual([5, 5, 5])
    })

    it('should yield elements in sorted order with duplicates', () => {
      const ms = new AVLMultiset<number>()
      ms.add(3)
      ms.add(1)
      ms.add(1)
      ms.add(2)
      expect([...ms]).toEqual([1, 1, 2, 3])
    })

    it('should be usable with for-of', () => {
      const ms = new AVLMultiset<number>()
      ms.add(10)
      ms.add(20)
      ms.add(30)
      const collected: number[] = []
      for (const val of ms) {
        collected.push(val)
      }
      expect(collected).toEqual([10, 20, 30])
    })

    it('should work with Array.from', () => {
      const ms = new AVLMultiset<number>()
      ms.add(4)
      ms.add(4)
      ms.add(2)
      expect(Array.from(ms)).toEqual([2, 4, 4])
    })
  })

  // ─── Clear ────────────────────────────────────────────────────
  describe('clear', () => {
    it('should empty the set', () => {
      const ms = new AVLMultiset<number>()
      ms.add(1)
      ms.add(2)
      ms.add(3)
      ms.clear()
      expect(ms.size).toBe(0)
      expect(ms.uniqueSize).toBe(0)
      expect(ms.isEmpty).toBe(true)
    })

    it('should allow adding after clear', () => {
      const ms = new AVLMultiset<number>()
      ms.add(1)
      ms.clear()
      ms.add(2)
      expect(ms.size).toBe(1)
      expect(ms.has(2)).toBe(true)
      expect(ms.has(1)).toBe(false)
    })

    it('should reset statistics', () => {
      const ms = new AVLMultiset<number>()
      ms.add(1)
      ms.add(2)
      ms.remove(1)
      ms.clear()
      const stats = ms.getStatistics()
      expect(stats.adds).toBe(0)
      expect(stats.removes).toBe(0)
      expect(stats.rotations).toBe(0)
      expect(stats.maxDepth).toBe(0)
      expect(stats.uniqueCount).toBe(0)
    })

    it('should clear min and max', () => {
      const ms = new AVLMultiset<number>()
      ms.add(10)
      ms.add(20)
      ms.clear()
      expect(ms.min).toBeUndefined()
      expect(ms.max).toBeUndefined()
    })
  })

  // ─── Statistics ───────────────────────────────────────────────
  describe('getStatistics', () => {
    it('should start with zero statistics', () => {
      const ms = new AVLMultiset<number>()
      const stats = ms.getStatistics()
      expect(stats.adds).toBe(0)
      expect(stats.removes).toBe(0)
      expect(stats.rotations).toBe(0)
    })

    it('should count adds', () => {
      const ms = new AVLMultiset<number>()
      ms.add(1)
      ms.add(2)
      ms.add(3)
      expect(ms.getStatistics().adds).toBe(3)
    })

    it('should count duplicate adds', () => {
      const ms = new AVLMultiset<number>()
      ms.add(1)
      ms.add(1)
      ms.add(1)
      expect(ms.getStatistics().adds).toBe(3)
    })

    it('should count removes', () => {
      const ms = new AVLMultiset<number>()
      ms.add(1)
      ms.add(1)
      ms.remove(1)
      expect(ms.getStatistics().removes).toBe(1)
    })

    it('should track maxDepth', () => {
      const ms = new AVLMultiset<number>()
      ms.add(1)
      expect(ms.getStatistics().maxDepth).toBe(1)
      ms.add(2)
      expect(ms.getStatistics().maxDepth).toBeGreaterThanOrEqual(1)
    })

    it('should track uniqueCount', () => {
      const ms = new AVLMultiset<number>()
      ms.add(1)
      ms.add(2)
      ms.add(2)
      expect(ms.getStatistics().uniqueCount).toBe(2)
    })

    it('should return a copy (not a reference)', () => {
      const ms = new AVLMultiset<number>()
      ms.add(1)
      const stats1 = ms.getStatistics()
      stats1.adds = 999
      const stats2 = ms.getStatistics()
      expect(stats2.adds).toBe(1)
    })
  })

  // ─── JSON Serialization ───────────────────────────────────────
  describe('toJSON / fromJSON', () => {
    it('should serialize an empty set', () => {
      const ms = new AVLMultiset<number>()
      const json = ms.toJSON()
      expect(json.root).toBeNull()
      expect(json.size).toBe(0)
      expect(json.uniqueSize).toBe(0)
      expect(json.statistics).toBeDefined()
    })

    it('should round-trip an empty set', () => {
      const ms = new AVLMultiset<number>()
      const restored = AVLMultiset.fromJSON(ms.toJSON())
      expect(restored.size).toBe(0)
      expect(restored.uniqueSize).toBe(0)
      expect(restored.isEmpty).toBe(true)
    })

    it('should serialize elements with counts', () => {
      const ms = new AVLMultiset<number>()
      ms.add(5)
      ms.add(5)
      ms.add(10)
      const json = ms.toJSON()
      expect(json.size).toBe(3)
      expect(json.uniqueSize).toBe(2)
      expect(json.root).not.toBeNull()
    })

    it('should round-trip a populated set preserving data', () => {
      const ms = new AVLMultiset<number>()
      ms.add(1)
      ms.add(2)
      ms.add(2)
      ms.add(3)
      ms.add(3)
      ms.add(3)
      const json = ms.toJSON()
      const restored = AVLMultiset.fromJSON(json)
      expect(restored.size).toBe(6)
      expect(restored.uniqueSize).toBe(3)
      expect(restored.count(1)).toBe(1)
      expect(restored.count(2)).toBe(2)
      expect(restored.count(3)).toBe(3)
      expect(restored.min).toBe(1)
      expect(restored.max).toBe(3)
    })

    it('should preserve statistics in round-trip', () => {
      const ms = new AVLMultiset<number>()
      ms.add(1)
      ms.add(2)
      ms.remove(1)
      const json = ms.toJSON()
      const restored = AVLMultiset.fromJSON(json)
      const stats = restored.getStatistics()
      expect(stats.adds).toBe(2)
      expect(stats.removes).toBe(1)
    })

    it('should preserve toArray after round-trip', () => {
      const ms = new AVLMultiset<number>()
      ms.add(3)
      ms.add(1)
      ms.add(2)
      ms.add(1)
      const restored = AVLMultiset.fromJSON(ms.toJSON())
      expect(restored.toArray()).toEqual([1, 1, 2, 3])
    })

    it('should preserve forEach behavior after round-trip', () => {
      const ms = new AVLMultiset<number>()
      ms.add(10)
      ms.add(10)
      ms.add(20)
      const restored = AVLMultiset.fromJSON(ms.toJSON())
      const items: [number, number][] = []
      restored.forEach((v, c) => items.push([v, c]))
      expect(items).toEqual([
        [10, 2],
        [20, 1],
      ])
    })
  })

  // ─── Custom Comparator ────────────────────────────────────────
  describe('custom comparator', () => {
    it('should work with string values', () => {
      const ms = new AVLMultiset<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      ms.add('banana')
      ms.add('apple')
      ms.add('cherry')
      ms.add('banana')
      expect(ms.size).toBe(4)
      expect(ms.uniqueSize).toBe(3)
      expect(ms.count('banana')).toBe(2)
      expect(ms.min).toBe('apple')
      expect(ms.max).toBe('cherry')
    })

    it('should work with reverse order comparator', () => {
      const ms = new AVLMultiset<number>({
        comparator: (a, b) => b - a,
      })
      ms.add(1)
      ms.add(2)
      ms.add(3)
      expect(ms.min).toBe(3)
      expect(ms.max).toBe(1)
    })

    it('should serialize and deserialize with custom comparator data', () => {
      const ms = new AVLMultiset<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      ms.add('x')
      ms.add('a')
      ms.add('m')
      const json = ms.toJSON()
      const restored = AVLMultiset.fromJSON<string>(json)
      expect(restored.size).toBe(3)
      expect(restored.uniqueSize).toBe(3)
    })

    it('should handle lowerBound/upperBound with custom comparator', () => {
      const ms = new AVLMultiset<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      ms.add('apple')
      ms.add('banana')
      ms.add('cherry')
      expect(ms.lowerBound('blueberry')).toBe('cherry')
      expect(ms.upperBound('banana')).toBe('cherry')
    })
  })

  // ─── Edge Cases ───────────────────────────────────────────────
  describe('edge cases', () => {
    it('should handle a single element added and removed', () => {
      const ms = new AVLMultiset<number>()
      ms.add(42)
      expect(ms.size).toBe(1)
      expect(ms.uniqueSize).toBe(1)
      expect(ms.isEmpty).toBe(false)
      ms.remove(42)
      expect(ms.size).toBe(0)
      expect(ms.uniqueSize).toBe(0)
      expect(ms.isEmpty).toBe(true)
    })

    it('should handle all same elements', () => {
      const ms = new AVLMultiset<number>()
      for (let i = 0; i < 10; i++) ms.add(7)
      expect(ms.size).toBe(10)
      expect(ms.uniqueSize).toBe(1)
      expect(ms.count(7)).toBe(10)
      expect(ms.min).toBe(7)
      expect(ms.max).toBe(7)
    })

    it('should handle removing from all-same set until empty', () => {
      const ms = new AVLMultiset<number>()
      ms.add(5)
      ms.add(5)
      ms.add(5)
      expect(ms.remove(5)).toBe(true)
      expect(ms.remove(5)).toBe(true)
      expect(ms.remove(5)).toBe(true)
      expect(ms.isEmpty).toBe(true)
      expect(ms.remove(5)).toBe(false)
    })

    it('should handle negative numbers', () => {
      const ms = new AVLMultiset<number>()
      ms.add(-10)
      ms.add(-5)
      ms.add(0)
      ms.add(5)
      ms.add(10)
      expect(ms.min).toBe(-10)
      expect(ms.max).toBe(10)
      expect(ms.size).toBe(5)
    })

    it('should handle zero as a value', () => {
      const ms = new AVLMultiset<number>()
      ms.add(0)
      expect(ms.has(0)).toBe(true)
      expect(ms.count(0)).toBe(1)
    })
  })

  // ─── AVL Balancing ────────────────────────────────────────────
  describe('AVL balancing', () => {
    it('should handle inserting a sorted sequence', () => {
      const ms = new AVLMultiset<number>()
      for (let i = 0; i < 20; i++) ms.add(i)
      expect(ms.size).toBe(20)
      expect(ms.uniqueSize).toBe(20)
      expect(ms.min).toBe(0)
      expect(ms.max).toBe(19)
      const arr = ms.toArray()
      for (let i = 0; i < 20; i++) {
        expect(arr[i]).toBe(i)
      }
    })

    it('should handle inserting a reverse-sorted sequence', () => {
      const ms = new AVLMultiset<number>()
      for (let i = 19; i >= 0; i--) ms.add(i)
      expect(ms.size).toBe(20)
      expect(ms.min).toBe(0)
      expect(ms.max).toBe(19)
      expect(ms.toArray()).toEqual(Array.from({ length: 20 }, (_, i) => i))
    })

    it('should remain functional after many mixed add/remove operations', () => {
      const ms = new AVLMultiset<number>()
      for (let i = 1; i <= 10; i++) ms.add(i)
      for (let i = 1; i <= 10; i += 2) ms.remove(i)
      expect(ms.size).toBe(5)
      expect(ms.uniqueSize).toBe(5)
      expect(ms.toArray()).toEqual([2, 4, 6, 8, 10])
    })

    it('should track rotations during insertions', () => {
      const ms = new AVLMultiset<number>()
      for (let i = 0; i < 10; i++) ms.add(i)
      expect(ms.getStatistics().rotations).toBeGreaterThan(0)
    })

    it('should handle removing root of tree', () => {
      const ms = new AVLMultiset<number>()
      ms.add(5)
      ms.add(3)
      ms.add(7)
      ms.remove(5)
      expect(ms.has(5)).toBe(false)
      expect(ms.has(3)).toBe(true)
      expect(ms.has(7)).toBe(true)
      expect(ms.size).toBe(2)
    })

    it('should handle deep tree removals without corruption', () => {
      const ms = new AVLMultiset<number>()
      for (let i = 0; i < 15; i++) ms.add(i)
      for (let i = 0; i < 15; i += 2) ms.remove(i)
      const remaining = ms.toArray()
      expect(remaining).toEqual([1, 3, 5, 7, 9, 11, 13])
    })
  })

  // ─── Large Dataset ────────────────────────────────────────────
  describe('large dataset', () => {
    it('should handle 100 elements correctly', () => {
      const ms = new AVLMultiset<number>()
      for (let i = 0; i < 100; i++) ms.add(i)
      expect(ms.size).toBe(100)
      expect(ms.uniqueSize).toBe(100)
      const arr = ms.toArray()
      expect(arr.length).toBe(100)
      expect(arr[0]).toBe(0)
      expect(arr[99]).toBe(99)
    })

    it('should handle bulk add then bulk remove', () => {
      const ms = new AVLMultiset<number>()
      for (let i = 0; i < 50; i++) ms.add(i)
      for (let i = 0; i < 50; i++) ms.remove(i)
      expect(ms.isEmpty).toBe(true)
      expect(ms.size).toBe(0)
      expect(ms.uniqueSize).toBe(0)
    })
  })

  // ─── forEach iteration order ──────────────────────────────────
  describe('forEach iteration details', () => {
    it('should receive correct count for each unique value', () => {
      const ms = new AVLMultiset<number>()
      ms.add(1)
      ms.add(1)
      ms.add(1)
      ms.add(2)
      const results = new Map<number, number>()
      ms.forEach((v, c) => results.set(v, c))
      expect(results.get(1)).toBe(3)
      expect(results.get(2)).toBe(1)
    })

    it('should visit all unique elements exactly once', () => {
      const ms = new AVLMultiset<number>()
      ms.add(5)
      ms.add(3)
      ms.add(7)
      ms.add(3)
      let count = 0
      ms.forEach(() => count++)
      expect(count).toBe(3)
    })
  })
})
