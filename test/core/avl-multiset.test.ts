import { describe, it, expect, beforeEach } from 'vitest'
import { AVLMultiset } from '../../src/core/avl-multiset/avl-multiset.js'
import { DEFAULT_AVL_MULTISET_OPTIONS } from '../../src/core/avl-multiset/types.js'
import type {
  AVLMultisetOptions,
  AVLMultisetJSON,
  AVLMultisetNodeJSON,
  AVLMultisetStatistics,
} from '../../src/core/avl-multiset/types.js'

describe('AVLMultiset', () => {
  let ms: AVLMultiset<number>

  beforeEach(() => {
    ms = new AVLMultiset()
  })

  describe('constructor', () => {
    it('should create with default options', () => {
      const s = new AVLMultiset()
      expect(s.isEmpty).toBe(true)
      expect(s.size).toBe(0)
    })

    it('should accept custom comparator', () => {
      const s = new AVLMultiset<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      s.add('banana')
      s.add('apple')
      s.add('cherry')
      expect(s.min).toBe('apple')
      expect(s.max).toBe('cherry')
    })

    it('should accept empty options object', () => {
      const s = new AVLMultiset({})
      expect(s.isEmpty).toBe(true)
    })

    it('should accept undefined options', () => {
      const s = new AVLMultiset(undefined)
      expect(s.isEmpty).toBe(true)
    })
  })

  describe('add', () => {
    it('should add a single value', () => {
      ms.add(5)
      expect(ms.size).toBe(1)
      expect(ms.uniqueSize).toBe(1)
    })

    it('should add duplicate values incrementing count', () => {
      ms.add(5)
      ms.add(5)
      ms.add(5)
      expect(ms.size).toBe(3)
      expect(ms.uniqueSize).toBe(1)
      expect(ms.count(5)).toBe(3)
    })

    it('should add multiple distinct values', () => {
      ms.add(1)
      ms.add(2)
      ms.add(3)
      expect(ms.size).toBe(3)
      expect(ms.uniqueSize).toBe(3)
    })

    it('should track add statistics', () => {
      ms.add(1)
      ms.add(2)
      ms.add(3)
      expect(ms.getStatistics().adds).toBe(3)
    })

    it('should add values in any order', () => {
      ms.add(5)
      ms.add(1)
      ms.add(10)
      ms.add(3)
      expect(ms.has(1)).toBe(true)
      expect(ms.has(3)).toBe(true)
      expect(ms.has(5)).toBe(true)
      expect(ms.has(10)).toBe(true)
    })

    it('should handle negative numbers', () => {
      ms.add(-5)
      ms.add(-10)
      ms.add(0)
      expect(ms.min).toBe(-10)
      expect(ms.max).toBe(0)
    })

    it('should handle zero', () => {
      ms.add(0)
      expect(ms.has(0)).toBe(true)
      expect(ms.count(0)).toBe(1)
    })

    it('should handle adding many values maintaining balance', () => {
      for (let i = 0; i < 100; i++) {
        ms.add(i)
      }
      expect(ms.size).toBe(100)
      expect(ms.uniqueSize).toBe(100)
      expect(ms.getStatistics().maxDepth).toBeLessThanOrEqual(
        Math.ceil(1.44 * Math.log2(101)),
      )
    })

    it('should handle mixed adds and duplicates', () => {
      ms.add(5)
      ms.add(3)
      ms.add(5)
      ms.add(7)
      ms.add(3)
      ms.add(3)
      expect(ms.size).toBe(6)
      expect(ms.uniqueSize).toBe(3)
      expect(ms.count(5)).toBe(2)
      expect(ms.count(3)).toBe(3)
      expect(ms.count(7)).toBe(1)
    })
  })

  describe('remove', () => {
    it('should remove an existing value', () => {
      ms.add(5)
      const result = ms.remove(5)
      expect(result).toBe(true)
      expect(ms.size).toBe(0)
      expect(ms.uniqueSize).toBe(0)
    })

    it('should return false for non-existing value', () => {
      const result = ms.remove(99)
      expect(result).toBe(false)
    })

    it('should return false on empty set', () => {
      expect(ms.remove(1)).toBe(false)
    })

    it('should decrement count for duplicate values', () => {
      ms.add(5)
      ms.add(5)
      ms.add(5)
      ms.remove(5)
      expect(ms.count(5)).toBe(2)
      expect(ms.size).toBe(2)
      expect(ms.uniqueSize).toBe(1)
    })

    it('should remove node when count reaches zero', () => {
      ms.add(5)
      ms.add(3)
      ms.remove(5)
      expect(ms.has(5)).toBe(false)
      expect(ms.uniqueSize).toBe(1)
    })

    it('should track remove statistics', () => {
      ms.add(1)
      ms.add(2)
      ms.remove(1)
      expect(ms.getStatistics().removes).toBe(1)
    })

    it('should not track remove stats on failed removal', () => {
      ms.remove(99)
      expect(ms.getStatistics().removes).toBe(0)
    })

    it('should handle remove of min value', () => {
      ms.add(1)
      ms.add(5)
      ms.add(10)
      ms.remove(1)
      expect(ms.min).toBe(5)
    })

    it('should handle remove of max value', () => {
      ms.add(1)
      ms.add(5)
      ms.add(10)
      ms.remove(10)
      expect(ms.max).toBe(5)
    })

    it('should handle remove with two children', () => {
      ms.add(5)
      ms.add(3)
      ms.add(7)
      ms.add(1)
      ms.add(4)
      ms.add(6)
      ms.add(8)
      ms.remove(5)
      expect(ms.has(5)).toBe(false)
      expect(ms.size).toBe(6)
      expect(ms.has(3)).toBe(true)
      expect(ms.has(7)).toBe(true)
    })

    it('should handle multiple removes maintaining balance', () => {
      for (let i = 0; i < 50; i++) ms.add(i)
      for (let i = 0; i < 50; i++) {
        expect(ms.remove(i)).toBe(true)
      }
      expect(ms.size).toBe(0)
      expect(ms.isEmpty).toBe(true)
    })

    it('should handle remove after add-remove-add cycle', () => {
      ms.add(5)
      ms.remove(5)
      ms.add(5)
      expect(ms.has(5)).toBe(true)
      ms.remove(5)
      expect(ms.has(5)).toBe(false)
    })
  })

  describe('has', () => {
    it('should return false on empty set', () => {
      expect(ms.has(1)).toBe(false)
    })

    it('should return true for existing value', () => {
      ms.add(5)
      expect(ms.has(5)).toBe(true)
    })

    it('should return false for non-existing value', () => {
      ms.add(5)
      expect(ms.has(3)).toBe(false)
    })

    it('should return true for duplicate value with count > 0', () => {
      ms.add(5)
      ms.add(5)
      expect(ms.has(5)).toBe(true)
    })

    it('should return false after all duplicates removed', () => {
      ms.add(5)
      ms.add(5)
      ms.remove(5)
      ms.remove(5)
      expect(ms.has(5)).toBe(false)
    })

    it('should find values in large set', () => {
      for (let i = 0; i < 100; i++) ms.add(i)
      for (let i = 0; i < 100; i++) {
        expect(ms.has(i)).toBe(true)
      }
      expect(ms.has(100)).toBe(false)
      expect(ms.has(-1)).toBe(false)
    })
  })

  describe('count', () => {
    it('should return 0 on empty set', () => {
      expect(ms.count(1)).toBe(0)
    })

    it('should return 1 after single add', () => {
      ms.add(5)
      expect(ms.count(5)).toBe(1)
    })

    it('should return correct count for duplicates', () => {
      ms.add(5)
      ms.add(5)
      ms.add(5)
      expect(ms.count(5)).toBe(3)
    })

    it('should return 0 for non-existing value', () => {
      ms.add(5)
      expect(ms.count(3)).toBe(0)
    })

    it('should decrement after remove', () => {
      ms.add(5)
      ms.add(5)
      ms.remove(5)
      expect(ms.count(5)).toBe(1)
    })

    it('should return 0 after all removes', () => {
      ms.add(5)
      ms.remove(5)
      expect(ms.count(5)).toBe(0)
    })
  })

  describe('size', () => {
    it('should be 0 on new set', () => {
      expect(ms.size).toBe(0)
    })

    it('should increment with each add', () => {
      ms.add(1)
      expect(ms.size).toBe(1)
      ms.add(2)
      expect(ms.size).toBe(2)
      ms.add(1)
      expect(ms.size).toBe(3)
    })

    it('should decrement with each remove', () => {
      ms.add(1)
      ms.add(1)
      ms.remove(1)
      expect(ms.size).toBe(1)
    })
  })

  describe('uniqueSize', () => {
    it('should be 0 on new set', () => {
      expect(ms.uniqueSize).toBe(0)
    })

    it('should count distinct values', () => {
      ms.add(1)
      ms.add(2)
      ms.add(3)
      expect(ms.uniqueSize).toBe(3)
    })

    it('should not increment for duplicates', () => {
      ms.add(1)
      ms.add(1)
      ms.add(1)
      expect(ms.uniqueSize).toBe(1)
    })

    it('should decrement when last duplicate removed', () => {
      ms.add(1)
      ms.add(2)
      ms.remove(1)
      expect(ms.uniqueSize).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should be true on new set', () => {
      expect(ms.isEmpty).toBe(true)
    })

    it('should be false after add', () => {
      ms.add(1)
      expect(ms.isEmpty).toBe(false)
    })

    it('should be true after removing all', () => {
      ms.add(1)
      ms.remove(1)
      expect(ms.isEmpty).toBe(true)
    })

    it('should be true after clear', () => {
      ms.add(1)
      ms.clear()
      expect(ms.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should reset size to 0', () => {
      ms.add(1)
      ms.add(2)
      ms.clear()
      expect(ms.size).toBe(0)
    })

    it('should reset uniqueSize to 0', () => {
      ms.add(1)
      ms.add(2)
      ms.clear()
      expect(ms.uniqueSize).toBe(0)
    })

    it('should set isEmpty to true', () => {
      ms.add(1)
      ms.clear()
      expect(ms.isEmpty).toBe(true)
    })

    it('should reset statistics', () => {
      ms.add(1)
      ms.remove(1)
      ms.clear()
      const stats = ms.getStatistics()
      expect(stats.adds).toBe(0)
      expect(stats.removes).toBe(0)
      expect(stats.rotations).toBe(0)
      expect(stats.maxDepth).toBe(0)
      expect(stats.uniqueCount).toBe(0)
    })

    it('should allow adding after clear', () => {
      ms.add(1)
      ms.clear()
      ms.add(2)
      expect(ms.size).toBe(1)
      expect(ms.has(2)).toBe(true)
      expect(ms.has(1)).toBe(false)
    })
  })

  describe('min', () => {
    it('should return undefined on empty set', () => {
      expect(ms.min).toBeUndefined()
    })

    it('should return the smallest value', () => {
      ms.add(5)
      ms.add(3)
      ms.add(7)
      expect(ms.min).toBe(3)
    })

    it('should update after remove', () => {
      ms.add(1)
      ms.add(5)
      ms.add(10)
      ms.remove(1)
      expect(ms.min).toBe(5)
    })

    it('should return value with duplicates', () => {
      ms.add(1)
      ms.add(1)
      ms.add(5)
      expect(ms.min).toBe(1)
    })
  })

  describe('max', () => {
    it('should return undefined on empty set', () => {
      expect(ms.max).toBeUndefined()
    })

    it('should return the largest value', () => {
      ms.add(5)
      ms.add(3)
      ms.add(7)
      expect(ms.max).toBe(7)
    })

    it('should update after remove', () => {
      ms.add(1)
      ms.add(5)
      ms.add(10)
      ms.remove(10)
      expect(ms.max).toBe(5)
    })

    it('should return value with duplicates', () => {
      ms.add(1)
      ms.add(5)
      ms.add(5)
      expect(ms.max).toBe(5)
    })
  })

  describe('lowerBound', () => {
    it('should return undefined on empty set', () => {
      expect(ms.lowerBound(5)).toBeUndefined()
    })

    it('should return exact value if present', () => {
      ms.add(1)
      ms.add(3)
      ms.add(5)
      ms.add(7)
      expect(ms.lowerBound(3)).toBe(3)
    })

    it('should return next greater if exact not present', () => {
      ms.add(1)
      ms.add(5)
      ms.add(10)
      expect(ms.lowerBound(3)).toBe(5)
    })

    it('should return undefined if all values are less', () => {
      ms.add(1)
      ms.add(2)
      ms.add(3)
      expect(ms.lowerBound(10)).toBeUndefined()
    })

    it('should return smallest value for very low query', () => {
      ms.add(5)
      ms.add(10)
      expect(ms.lowerBound(-100)).toBe(5)
    })
  })

  describe('upperBound', () => {
    it('should return undefined on empty set', () => {
      expect(ms.upperBound(5)).toBeUndefined()
    })

    it('should return next greater value for exact match', () => {
      ms.add(1)
      ms.add(3)
      ms.add(5)
      ms.add(7)
      expect(ms.upperBound(3)).toBe(5)
    })

    it('should return next greater if between values', () => {
      ms.add(1)
      ms.add(5)
      ms.add(10)
      expect(ms.upperBound(3)).toBe(5)
    })

    it('should return undefined if all values are less or equal', () => {
      ms.add(1)
      ms.add(2)
      ms.add(3)
      expect(ms.upperBound(3)).toBeUndefined()
    })

    it('should return first value for very low query', () => {
      ms.add(5)
      ms.add(10)
      expect(ms.upperBound(-100)).toBe(5)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty set', () => {
      expect(ms.toArray()).toEqual([])
    })

    it('should return sorted array', () => {
      ms.add(5)
      ms.add(1)
      ms.add(3)
      expect(ms.toArray()).toEqual([1, 3, 5])
    })

    it('should include duplicates', () => {
      ms.add(3)
      ms.add(1)
      ms.add(3)
      ms.add(3)
      expect(ms.toArray()).toEqual([1, 3, 3, 3])
    })

    it('should return in-order traversal', () => {
      ms.add(7)
      ms.add(3)
      ms.add(10)
      ms.add(1)
      ms.add(5)
      expect(ms.toArray()).toEqual([1, 3, 5, 7, 10])
    })
  })

  describe('forEach', () => {
    it('should not call callback on empty set', () => {
      const items: Array<{ value: number; count: number }> = []
      ms.forEach((value, count) => items.push({ value, count }))
      expect(items).toEqual([])
    })

    it('should iterate in sorted order', () => {
      ms.add(5)
      ms.add(1)
      ms.add(3)
      const values: number[] = []
      ms.forEach((value) => values.push(value))
      expect(values).toEqual([1, 3, 5])
    })

    it('should provide correct counts', () => {
      ms.add(3)
      ms.add(3)
      ms.add(1)
      const results: Array<{ value: number; count: number }> = []
      ms.forEach((value, count) => results.push({ value, count }))
      expect(results).toEqual([
        { value: 1, count: 1 },
        { value: 3, count: 2 },
      ])
    })
  })

  describe('[Symbol.iterator]', () => {
    it('should return empty iterator for empty set', () => {
      expect([...ms]).toEqual([])
    })

    it('should iterate in sorted order with duplicates', () => {
      ms.add(3)
      ms.add(1)
      ms.add(3)
      expect([...ms]).toEqual([1, 3, 3])
    })

    it('should work with for-of loop', () => {
      ms.add(5)
      ms.add(3)
      ms.add(7)
      const values: number[] = []
      for (const v of ms) {
        values.push(v)
      }
      expect(values).toEqual([3, 5, 7])
    })
  })

  describe('toArraySorted', () => {
    it('should return same as toArray', () => {
      ms.add(5)
      ms.add(1)
      ms.add(3)
      expect(ms.toArraySorted()).toEqual(ms.toArray())
    })

    it('should return sorted with duplicates', () => {
      ms.add(3)
      ms.add(3)
      ms.add(1)
      expect(ms.toArraySorted()).toEqual([1, 3, 3])
    })
  })

  describe('getStatistics', () => {
    it('should return zero stats on new set', () => {
      const stats = ms.getStatistics()
      expect(stats.adds).toBe(0)
      expect(stats.removes).toBe(0)
      expect(stats.rotations).toBe(0)
      expect(stats.maxDepth).toBe(0)
      expect(stats.uniqueCount).toBe(0)
    })

    it('should track adds', () => {
      ms.add(1)
      ms.add(2)
      ms.add(3)
      expect(ms.getStatistics().adds).toBe(3)
    })

    it('should track removes', () => {
      ms.add(1)
      ms.remove(1)
      expect(ms.getStatistics().removes).toBe(1)
    })

    it('should track rotations', () => {
      ms.add(3)
      ms.add(2)
      ms.add(1)
      expect(ms.getStatistics().rotations).toBeGreaterThan(0)
    })

    it('should track maxDepth', () => {
      ms.add(5)
      expect(ms.getStatistics().maxDepth).toBe(1)
      ms.add(3)
      expect(ms.getStatistics().maxDepth).toBe(2)
    })

    it('should track uniqueCount', () => {
      ms.add(1)
      ms.add(2)
      ms.add(2)
      expect(ms.getStatistics().uniqueCount).toBe(2)
    })

    it('should return a copy', () => {
      ms.add(1)
      const s1 = ms.getStatistics()
      ms.add(2)
      const s2 = ms.getStatistics()
      expect(s1.adds).toBe(1)
      expect(s2.adds).toBe(2)
    })
  })

  describe('toJSON', () => {
    it('should produce correct structure', () => {
      ms.add(5)
      ms.add(3)
      const json = ms.toJSON()
      expect(json).toHaveProperty('root')
      expect(json).toHaveProperty('size')
      expect(json).toHaveProperty('uniqueSize')
      expect(json).toHaveProperty('statistics')
    })

    it('should reflect current size', () => {
      ms.add(1)
      ms.add(2)
      ms.add(2)
      const json = ms.toJSON()
      expect(json.size).toBe(3)
      expect(json.uniqueSize).toBe(2)
    })

    it('should include statistics', () => {
      ms.add(1)
      const json = ms.toJSON()
      expect(json.statistics.adds).toBe(1)
    })

    it('should have null root for empty set', () => {
      expect(ms.toJSON().root).toBeNull()
    })

    it('should serialize node structure', () => {
      ms.add(5)
      const root = ms.toJSON().root!
      expect(root.value).toBe(5)
      expect(root.count).toBe(1)
      expect(root.height).toBe(1)
    })

    it('should serialize left and right children', () => {
      ms.add(5)
      ms.add(3)
      ms.add(7)
      const root = ms.toJSON().root!
      expect(root.left).not.toBeNull()
      expect(root.right).not.toBeNull()
    })
  })

  describe('fromJSON', () => {
    it('should restore a serialized set', () => {
      ms.add(5)
      ms.add(3)
      ms.add(7)
      const json = ms.toJSON()
      const restored = AVLMultiset.fromJSON(json)
      expect(restored.size).toBe(3)
      expect(restored.has(5)).toBe(true)
      expect(restored.has(3)).toBe(true)
      expect(restored.has(7)).toBe(true)
    })

    it('should preserve counts', () => {
      ms.add(5)
      ms.add(5)
      ms.add(5)
      const json = ms.toJSON()
      const restored = AVLMultiset.fromJSON(json)
      expect(restored.count(5)).toBe(3)
    })

    it('should round-trip correctly', () => {
      ms.add(5)
      ms.add(3)
      ms.add(7)
      ms.add(3)
      const json = ms.toJSON()
      const restored = AVLMultiset.fromJSON(json)
      const json2 = restored.toJSON()
      expect(json.size).toBe(json2.size)
      expect(json.uniqueSize).toBe(json2.uniqueSize)
    })

    it('should preserve statistics', () => {
      ms.add(1)
      ms.add(2)
      const json = ms.toJSON()
      const restored = AVLMultiset.fromJSON(json)
      expect(restored.getStatistics().adds).toBe(2)
    })

    it('should allow operations after restoration', () => {
      ms.add(1)
      const restored = AVLMultiset.fromJSON(ms.toJSON())
      restored.add(2)
      expect(restored.size).toBe(2)
      restored.remove(1)
      expect(restored.has(2)).toBe(true)
    })

    it('should handle empty set', () => {
      const json = ms.toJSON()
      const restored = AVLMultiset.fromJSON(json)
      expect(restored.isEmpty).toBe(true)
      expect(restored.size).toBe(0)
    })
  })

  describe('AVL balance', () => {
    it('should handle right-right case', () => {
      ms.add(1)
      ms.add(2)
      ms.add(3)
      expect(ms.toArray()).toEqual([1, 2, 3])
      expect(ms.getStatistics().rotations).toBeGreaterThan(0)
    })

    it('should handle left-left case', () => {
      ms.add(3)
      ms.add(2)
      ms.add(1)
      expect(ms.toArray()).toEqual([1, 2, 3])
      expect(ms.getStatistics().rotations).toBeGreaterThan(0)
    })

    it('should handle left-right case', () => {
      ms.add(3)
      ms.add(1)
      ms.add(2)
      expect(ms.toArray()).toEqual([1, 2, 3])
      expect(ms.getStatistics().rotations).toBeGreaterThanOrEqual(2)
    })

    it('should handle right-left case', () => {
      ms.add(1)
      ms.add(3)
      ms.add(2)
      expect(ms.toArray()).toEqual([1, 2, 3])
      expect(ms.getStatistics().rotations).toBeGreaterThanOrEqual(2)
    })

    it('should maintain balance after many inserts', () => {
      for (let i = 0; i < 1000; i++) {
        ms.add(i)
      }
      const depth = ms.getStatistics().maxDepth
      expect(depth).toBeLessThanOrEqual(Math.ceil(1.44 * Math.log2(1001)))
    })

    it('should maintain balance after reverse inserts', () => {
      for (let i = 100; i >= 0; i--) {
        ms.add(i)
      }
      const depth = ms.getStatistics().maxDepth
      expect(depth).toBeLessThanOrEqual(Math.ceil(1.44 * Math.log2(102)))
    })

    it('should maintain balance after alternating inserts', () => {
      for (let i = 50; i >= 0; i--) {
        ms.add(i)
        ms.add(100 - i)
      }
      expect(ms.size).toBe(102)
      const depth = ms.getStatistics().maxDepth
      expect(depth).toBeLessThanOrEqual(Math.ceil(1.44 * Math.log2(103)))
    })

    it('should maintain balance after removals', () => {
      for (let i = 0; i < 50; i++) ms.add(i)
      for (let i = 0; i < 25; i++) ms.remove(i)
      expect(ms.size).toBe(25)
      const depth = ms.getStatistics().maxDepth
      expect(depth).toBeLessThanOrEqual(Math.ceil(1.44 * Math.log2(26)))
    })
  })

  describe('custom comparator', () => {
    it('should work with string comparator', () => {
      const s = new AVLMultiset<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      s.add('cherry')
      s.add('apple')
      s.add('banana')
      expect(s.toArray()).toEqual(['apple', 'banana', 'cherry'])
      expect(s.min).toBe('apple')
      expect(s.max).toBe('cherry')
    })

    it('should work with reverse comparator', () => {
      const s = new AVLMultiset<number>({
        comparator: (a, b) => b - a,
      })
      s.add(1)
      s.add(5)
      s.add(3)
      expect(s.toArray()).toEqual([5, 3, 1])
    })

    it('should work with object comparator', () => {
      const s = new AVLMultiset<{ id: number }>({
        comparator: (a, b) => a.id - b.id,
      })
      s.add({ id: 3 })
      s.add({ id: 1 })
      s.add({ id: 2 })
      const arr = s.toArray()
      expect(arr.map((x) => x.id)).toEqual([1, 2, 3])
    })
  })

  describe('edge cases', () => {
    it('should handle single element', () => {
      ms.add(42)
      expect(ms.min).toBe(42)
      expect(ms.max).toBe(42)
      expect(ms.size).toBe(1)
      expect(ms.uniqueSize).toBe(1)
    })

    it('should handle add-remove-add cycle', () => {
      ms.add(5)
      ms.remove(5)
      ms.add(5)
      expect(ms.has(5)).toBe(true)
      expect(ms.size).toBe(1)
    })

    it('should handle rapid clear cycles', () => {
      for (let i = 0; i < 5; i++) {
        ms.add(i)
        ms.clear()
      }
      expect(ms.isEmpty).toBe(true)
    })

    it('should handle large number of duplicates', () => {
      for (let i = 0; i < 100; i++) {
        ms.add(42)
      }
      expect(ms.count(42)).toBe(100)
      expect(ms.size).toBe(100)
      expect(ms.uniqueSize).toBe(1)
    })

    it('should handle interleaved add and remove', () => {
      ms.add(1)
      ms.add(1)
      ms.remove(1)
      expect(ms.count(1)).toBe(1)
      ms.add(1)
      expect(ms.count(1)).toBe(2)
      ms.remove(1)
      ms.remove(1)
      expect(ms.has(1)).toBe(false)
    })

    it('should handle sequential removes from middle', () => {
      for (let i = 0; i < 10; i++) ms.add(i)
      for (let i = 3; i < 7; i++) ms.remove(i)
      expect(ms.toArray()).toEqual([0, 1, 2, 7, 8, 9])
    })

    it('should handle removing root with successor swap', () => {
      ms.add(5)
      ms.add(3)
      ms.add(7)
      ms.add(6)
      ms.remove(5)
      expect(ms.has(5)).toBe(false)
      expect(ms.toArray()).toEqual([3, 6, 7])
    })
  })

  describe('DEFAULT_AVL_MULTISET_OPTIONS', () => {
    it('should have a comparator function', () => {
      expect(typeof DEFAULT_AVL_MULTISET_OPTIONS.comparator).toBe('function')
    })

    it('comparator should return -1 for a < b', () => {
      expect(DEFAULT_AVL_MULTISET_OPTIONS.comparator(1, 2)).toBe(-1)
    })

    it('comparator should return 1 for a > b', () => {
      expect(DEFAULT_AVL_MULTISET_OPTIONS.comparator(2, 1)).toBe(1)
    })

    it('comparator should return 0 for a === b', () => {
      expect(DEFAULT_AVL_MULTISET_OPTIONS.comparator(1, 1)).toBe(0)
    })
  })

  describe('exports', () => {
    it('should export AVLMultiset class', () => {
      expect(AVLMultiset).toBeDefined()
      expect(typeof AVLMultiset).toBe('function')
    })

    it('should export DEFAULT_AVL_MULTISET_OPTIONS', () => {
      expect(DEFAULT_AVL_MULTISET_OPTIONS).toBeDefined()
    })

    it('should allow type-only imports for options', () => {
      const opts: AVLMultisetOptions<number> = {}
      const s = new AVLMultiset(opts)
      expect(s.isEmpty).toBe(true)
    })

    it('should allow type import for AVLMultisetJSON', () => {
      ms.add(1)
      const json: AVLMultisetJSON<number> = ms.toJSON()
      expect(json.size).toBe(1)
    })

    it('should allow type import for AVLMultisetNodeJSON', () => {
      ms.add(1)
      const json = ms.toJSON()
      const root: AVLMultisetNodeJSON<number> | null = json.root
      expect(root).not.toBeNull()
    })

    it('should allow type import for AVLMultisetStatistics', () => {
      const stats: AVLMultisetStatistics = ms.getStatistics()
      expect(stats.adds).toBe(0)
    })
  })
})
