import { describe, it, expect, beforeEach } from 'vitest'
import { IntervalSkipList } from '../../src/core/interval-skiplist/interval-skiplist.js'
import { DEFAULT_INTERVAL_SKIPLIST_OPTIONS } from '../../src/core/interval-skiplist/interval-skiplist.js'
import type { IntervalEntry } from '../../src/core/interval-skiplist/interval-skiplist.js'

describe('IntervalSkipList', () => {
  let list: IntervalSkipList<string>

  beforeEach(() => {
    list = new IntervalSkipList<string>()
  })

  describe('constructor', () => {
    it('should create empty list with defaults', () => {
      const sl = new IntervalSkipList<string>()
      expect(sl.size).toBe(0)
      expect(sl.isEmpty).toBe(true)
    })

    it('should accept custom maxLevel', () => {
      const sl = new IntervalSkipList<string>({ maxLevel: 8 })
      expect(sl.size).toBe(0)
    })

    it('should accept custom probability', () => {
      const sl = new IntervalSkipList<string>({ probability: 0.25 })
      expect(sl.isEmpty).toBe(true)
    })

    it('should accept all options together', () => {
      const sl = new IntervalSkipList<string>({ maxLevel: 10, probability: 0.3 })
      expect(sl.size).toBe(0)
    })

    it('should accept empty options object', () => {
      const sl = new IntervalSkipList<string>({})
      expect(sl.isEmpty).toBe(true)
    })
  })

  describe('DEFAULT_INTERVAL_SKIPLIST_OPTIONS', () => {
    it('should have maxLevel 16', () => {
      expect(DEFAULT_INTERVAL_SKIPLIST_OPTIONS.maxLevel).toBe(16)
    })

    it('should have probability 0.5', () => {
      expect(DEFAULT_INTERVAL_SKIPLIST_OPTIONS.probability).toBe(0.5)
    })
  })

  describe('insert', () => {
    it('should insert a single interval', () => {
      list.insert(1, 5, 'a')
      expect(list.size).toBe(1)
    })

    it('should insert multiple intervals', () => {
      list.insert(1, 5, 'a')
      list.insert(3, 7, 'b')
      list.insert(6, 10, 'c')
      expect(list.size).toBe(3)
    })

    it('should insert without value', () => {
      const sl = new IntervalSkipList()
      sl.insert(1, 5)
      expect(sl.size).toBe(1)
    })

    it('should not insert when low > high', () => {
      list.insert(5, 1, 'a')
      expect(list.size).toBe(0)
    })

    it('should insert point interval (low === high)', () => {
      list.insert(3, 3, 'point')
      expect(list.size).toBe(1)
      expect(list.contains(3, 3)).toBe(true)
    })

    it('should maintain sorted order by low', () => {
      list.insert(5, 10, 'b')
      list.insert(1, 3, 'a')
      list.insert(3, 7, 'c')
      const arr = list.toArray()
      expect(arr[0]!.low).toBe(1)
      expect(arr[1]!.low).toBe(3)
      expect(arr[2]!.low).toBe(5)
    })

    it('should sort by high when low is equal', () => {
      list.insert(1, 10, 'wide')
      list.insert(1, 3, 'narrow')
      const arr = list.toArray()
      expect(arr[0]!.high).toBe(3)
      expect(arr[1]!.high).toBe(10)
    })

    it('should allow duplicate intervals', () => {
      list.insert(1, 5, 'a')
      list.insert(1, 5, 'b')
      expect(list.size).toBe(2)
    })

    it('should handle negative intervals', () => {
      list.insert(-10, -5, 'neg')
      expect(list.size).toBe(1)
      expect(list.contains(-10, -5)).toBe(true)
    })

    it('should handle intervals spanning negative to positive', () => {
      list.insert(-5, 5, 'span')
      expect(list.size).toBe(1)
    })

    it('should update statistics inserts', () => {
      list.insert(1, 5, 'a')
      list.insert(3, 7, 'b')
      expect(list.getStatistics().inserts).toBe(2)
    })

    it('should insert large number of intervals', () => {
      for (let i = 0; i < 200; i++) {
        list.insert(i, i + 10, `item-${i}`)
      }
      expect(list.size).toBe(200)
    })
  })

  describe('remove', () => {
    it('should return false for non-existing interval', () => {
      expect(list.remove(1, 5)).toBe(false)
    })

    it('should remove existing interval', () => {
      list.insert(1, 5, 'a')
      expect(list.remove(1, 5)).toBe(true)
      expect(list.size).toBe(0)
    })

    it('should return false when low matches but high does not', () => {
      list.insert(1, 5, 'a')
      expect(list.remove(1, 10)).toBe(false)
      expect(list.size).toBe(1)
    })

    it('should maintain order after removal', () => {
      list.insert(1, 3, 'a')
      list.insert(5, 7, 'b')
      list.insert(9, 11, 'c')
      list.remove(5, 7)
      const arr = list.toArray()
      expect(arr).toHaveLength(2)
      expect(arr[0]!.low).toBe(1)
      expect(arr[1]!.low).toBe(9)
    })

    it('should handle removing first interval', () => {
      list.insert(1, 3, 'a')
      list.insert(5, 7, 'b')
      list.remove(1, 3)
      expect(list.min()!.low).toBe(5)
    })

    it('should handle removing last interval', () => {
      list.insert(1, 3, 'a')
      list.insert(5, 7, 'b')
      list.remove(5, 7)
      expect(list.max()!.low).toBe(1)
    })

    it('should handle removing from single element list', () => {
      list.insert(1, 5, 'a')
      list.remove(1, 5)
      expect(list.isEmpty).toBe(true)
    })

    it('should update statistics removes', () => {
      list.insert(1, 5, 'a')
      list.remove(1, 5)
      expect(list.getStatistics().removes).toBe(1)
    })

    it('should allow re-insert after removal', () => {
      list.insert(1, 5, 'a')
      list.remove(1, 5)
      list.insert(1, 5, 'b')
      expect(list.size).toBe(1)
    })

    it('should only remove one of duplicates', () => {
      list.insert(1, 5, 'a')
      list.insert(1, 5, 'b')
      list.remove(1, 5)
      expect(list.size).toBe(1)
    })
  })

  describe('query (stabbing query)', () => {
    it('should return empty for empty list', () => {
      expect(list.query(5)).toEqual([])
    })

    it('should find interval containing point', () => {
      list.insert(1, 10, 'a')
      const result = list.query(5)
      expect(result).toHaveLength(1)
      expect(result[0]!.low).toBe(1)
      expect(result[0]!.high).toBe(10)
    })

    it('should not find interval not containing point', () => {
      list.insert(1, 3, 'a')
      expect(list.query(5)).toEqual([])
    })

    it('should find multiple overlapping intervals', () => {
      list.insert(1, 10, 'wide')
      list.insert(3, 7, 'narrow')
      list.insert(5, 15, 'right')
      const result = list.query(6)
      expect(result).toHaveLength(3)
    })

    it('should find point interval at exact point', () => {
      list.insert(5, 5, 'point')
      const result = list.query(5)
      expect(result).toHaveLength(1)
    })

    it('should not find point interval at different point', () => {
      list.insert(5, 5, 'point')
      expect(list.query(6)).toEqual([])
    })

    it('should handle query at interval boundary (low)', () => {
      list.insert(5, 10, 'a')
      const result = list.query(5)
      expect(result).toHaveLength(1)
    })

    it('should handle query at interval boundary (high)', () => {
      list.insert(5, 10, 'a')
      const result = list.query(10)
      expect(result).toHaveLength(1)
    })

    it('should handle query just outside interval', () => {
      list.insert(5, 10, 'a')
      expect(list.query(4)).toEqual([])
      expect(list.query(11)).toEqual([])
    })

    it('should handle disjoint intervals', () => {
      list.insert(1, 3, 'a')
      list.insert(7, 9, 'b')
      list.insert(13, 15, 'c')
      expect(list.query(2)).toHaveLength(1)
      expect(list.query(8)).toHaveLength(1)
      expect(list.query(5)).toHaveLength(0)
    })

    it('should handle fully nested intervals', () => {
      list.insert(1, 20, 'outer')
      list.insert(5, 15, 'middle')
      list.insert(8, 12, 'inner')
      const result = list.query(10)
      expect(result).toHaveLength(3)
    })

    it('should handle touching intervals', () => {
      list.insert(1, 5, 'a')
      list.insert(5, 10, 'b')
      const result5 = list.query(5)
      expect(result5).toHaveLength(2)
    })

    it('should update statistics queries', () => {
      list.insert(1, 10, 'a')
      list.query(5)
      list.query(7)
      expect(list.getStatistics().queries).toBe(2)
    })
  })

  describe('queryRange', () => {
    it('should return empty for empty list', () => {
      expect(list.queryRange(1, 5)).toEqual([])
    })

    it('should find overlapping intervals', () => {
      list.insert(1, 10, 'a')
      list.insert(5, 15, 'b')
      list.insert(20, 30, 'c')
      const result = list.queryRange(3, 12)
      expect(result).toHaveLength(2)
    })

    it('should find interval fully contained in query range', () => {
      list.insert(5, 8, 'a')
      const result = list.queryRange(1, 15)
      expect(result).toHaveLength(1)
    })

    it('should find interval fully containing query range', () => {
      list.insert(1, 20, 'a')
      const result = list.queryRange(5, 10)
      expect(result).toHaveLength(1)
    })

    it('should not find non-overlapping intervals', () => {
      list.insert(1, 3, 'a')
      list.insert(10, 15, 'b')
      expect(list.queryRange(5, 8)).toHaveLength(0)
    })

    it('should handle touching query range', () => {
      list.insert(1, 5, 'a')
      const result = list.queryRange(5, 10)
      expect(result).toHaveLength(1)
    })

    it('should handle point query range', () => {
      list.insert(1, 10, 'a')
      const result = list.queryRange(5, 5)
      expect(result).toHaveLength(1)
    })

    it('should find all intervals with large query range', () => {
      list.insert(1, 5, 'a')
      list.insert(3, 8, 'b')
      list.insert(10, 15, 'c')
      const result = list.queryRange(0, 100)
      expect(result).toHaveLength(3)
    })

    it('should update statistics queries', () => {
      list.insert(1, 10, 'a')
      list.queryRange(1, 10)
      expect(list.getStatistics().queries).toBe(1)
    })

    it('should handle negative ranges', () => {
      list.insert(-10, -5, 'a')
      list.insert(-7, 0, 'b')
      const result = list.queryRange(-8, -6)
      expect(result).toHaveLength(2)
    })
  })

  describe('contains', () => {
    it('should return false for empty list', () => {
      expect(list.contains(1, 5)).toBe(false)
    })

    it('should return true for existing interval', () => {
      list.insert(1, 5, 'a')
      expect(list.contains(1, 5)).toBe(true)
    })

    it('should return false for non-existing interval', () => {
      list.insert(1, 5, 'a')
      expect(list.contains(1, 10)).toBe(false)
    })

    it('should return false after removal', () => {
      list.insert(1, 5, 'a')
      list.remove(1, 5)
      expect(list.contains(1, 5)).toBe(false)
    })

    it('should return false for overlapping but different interval', () => {
      list.insert(1, 10, 'a')
      expect(list.contains(1, 5)).toBe(false)
      expect(list.contains(5, 10)).toBe(false)
    })

    it('should find exact match among duplicates', () => {
      list.insert(1, 5, 'a')
      list.insert(1, 5, 'b')
      expect(list.contains(1, 5)).toBe(true)
    })

    it('should handle point intervals', () => {
      list.insert(3, 3, 'point')
      expect(list.contains(3, 3)).toBe(true)
      expect(list.contains(3, 4)).toBe(false)
    })
  })

  describe('size', () => {
    it('should return 0 for empty list', () => {
      expect(list.size).toBe(0)
    })

    it('should increment on insert', () => {
      list.insert(1, 5, 'a')
      expect(list.size).toBe(1)
      list.insert(3, 7, 'b')
      expect(list.size).toBe(2)
    })

    it('should decrement on remove', () => {
      list.insert(1, 5, 'a')
      list.insert(3, 7, 'b')
      list.remove(1, 5)
      expect(list.size).toBe(1)
    })

    it('should not change on failed remove', () => {
      list.insert(1, 5, 'a')
      list.remove(2, 6)
      expect(list.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new list', () => {
      expect(list.isEmpty).toBe(true)
    })

    it('should return false after insert', () => {
      list.insert(1, 5, 'a')
      expect(list.isEmpty).toBe(false)
    })

    it('should return true after removing all', () => {
      list.insert(1, 5, 'a')
      list.remove(1, 5)
      expect(list.isEmpty).toBe(true)
    })

    it('should return true after clear', () => {
      list.insert(1, 5, 'a')
      list.insert(3, 7, 'b')
      list.clear()
      expect(list.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear empty list', () => {
      list.clear()
      expect(list.size).toBe(0)
    })

    it('should clear single interval', () => {
      list.insert(1, 5, 'a')
      list.clear()
      expect(list.size).toBe(0)
      expect(list.isEmpty).toBe(true)
    })

    it('should clear multiple intervals', () => {
      list.insert(1, 5, 'a')
      list.insert(3, 7, 'b')
      list.insert(6, 10, 'c')
      list.clear()
      expect(list.size).toBe(0)
    })

    it('should allow operations after clear', () => {
      list.insert(1, 5, 'a')
      list.clear()
      list.insert(1, 5, 'b')
      expect(list.size).toBe(1)
    })
  })

  describe('min', () => {
    it('should return undefined for empty list', () => {
      expect(list.min()).toBeUndefined()
    })

    it('should return interval with smallest low', () => {
      list.insert(5, 10, 'b')
      list.insert(1, 3, 'a')
      list.insert(8, 12, 'c')
      const m = list.min()!
      expect(m.low).toBe(1)
      expect(m.high).toBe(3)
    })

    it('should return correct value', () => {
      list.insert(1, 5, 'val')
      expect(list.min()!.value).toBe('val')
    })
  })

  describe('max', () => {
    it('should return undefined for empty list', () => {
      expect(list.max()).toBeUndefined()
    })

    it('should return interval with largest low', () => {
      list.insert(1, 3, 'a')
      list.insert(8, 12, 'c')
      list.insert(5, 10, 'b')
      const m = list.max()!
      expect(m.low).toBe(8)
    })

    it('should return correct value', () => {
      list.insert(1, 5, 'val')
      expect(list.max()!.value).toBe('val')
    })
  })

  describe('overlaps', () => {
    it('should return false for empty list', () => {
      expect(list.overlaps(1, 5)).toBe(false)
    })

    it('should return true when interval overlaps', () => {
      list.insert(3, 7, 'a')
      expect(list.overlaps(1, 5)).toBe(true)
      expect(list.overlaps(5, 10)).toBe(true)
      expect(list.overlaps(2, 8)).toBe(true)
      expect(list.overlaps(3, 7)).toBe(true)
    })

    it('should return false when no overlap', () => {
      list.insert(3, 7, 'a')
      expect(list.overlaps(1, 2)).toBe(false)
      expect(list.overlaps(8, 10)).toBe(false)
    })

    it('should handle touching intervals', () => {
      list.insert(5, 10, 'a')
      expect(list.overlaps(10, 15)).toBe(true)
      expect(list.overlaps(1, 5)).toBe(true)
    })

    it('should return false when low > high', () => {
      list.insert(1, 5, 'a')
      expect(list.overlaps(10, 1)).toBe(false)
    })
  })

  describe('cover', () => {
    it('should return false for empty list', () => {
      expect(list.cover(1, 5)).toBe(false)
    })

    it('should return true when single interval covers range', () => {
      list.insert(1, 10, 'a')
      expect(list.cover(3, 7)).toBe(true)
      expect(list.cover(1, 10)).toBe(true)
    })

    it('should return false when gap exists', () => {
      list.insert(1, 3, 'a')
      list.insert(7, 10, 'b')
      expect(list.cover(1, 10)).toBe(false)
    })

    it('should return true when intervals tile the range', () => {
      list.insert(1, 5, 'a')
      list.insert(5, 10, 'b')
      expect(list.cover(1, 10)).toBe(true)
    })

    it('should return true with overlapping intervals', () => {
      list.insert(1, 7, 'a')
      list.insert(5, 10, 'b')
      expect(list.cover(1, 10)).toBe(true)
    })

    it('should return false when start not covered', () => {
      list.insert(5, 10, 'a')
      expect(list.cover(1, 10)).toBe(false)
    })

    it('should return false when end not covered', () => {
      list.insert(1, 5, 'a')
      expect(list.cover(1, 10)).toBe(false)
    })

    it('should return false when low > high', () => {
      list.insert(1, 5, 'a')
      expect(list.cover(10, 1)).toBe(false)
    })

    it('should handle point coverage', () => {
      list.insert(5, 5, 'point')
      expect(list.cover(5, 5)).toBe(true)
      expect(list.cover(4, 6)).toBe(false)
    })

    it('should handle complex coverage', () => {
      list.insert(1, 4, 'a')
      list.insert(3, 6, 'b')
      list.insert(5, 8, 'c')
      list.insert(8, 12, 'd')
      expect(list.cover(1, 12)).toBe(true)
      expect(list.cover(2, 10)).toBe(true)
      expect(list.cover(0, 12)).toBe(false)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty list', () => {
      expect(list.toArray()).toEqual([])
    })

    it('should return sorted by low', () => {
      list.insert(5, 10, 'b')
      list.insert(1, 3, 'a')
      list.insert(3, 7, 'c')
      const arr = list.toArray()
      expect(arr[0]!.low).toBe(1)
      expect(arr[1]!.low).toBe(3)
      expect(arr[2]!.low).toBe(5)
    })

    it('should return new array each call', () => {
      list.insert(1, 5, 'a')
      const a1 = list.toArray()
      const a2 = list.toArray()
      expect(a1).not.toBe(a2)
      expect(a1).toEqual(a2)
    })

    it('should include values', () => {
      list.insert(1, 5, 'a')
      list.insert(3, 7, 'b')
      const arr = list.toArray()
      expect(arr[0]!.value).toBe('a')
      expect(arr[1]!.value).toBe('b')
    })

    it('should not include value when not provided', () => {
      const sl = new IntervalSkipList()
      sl.insert(1, 5)
      const arr = sl.toArray()
      expect(arr[0]!.value).toBeUndefined()
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty list', () => {
      let count = 0
      list.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should iterate in order', () => {
      list.insert(5, 10, 'b')
      list.insert(1, 3, 'a')
      list.insert(3, 7, 'c')
      const entries: Array<IntervalEntry<string>> = []
      list.forEach((e) => { entries.push(e) })
      expect(entries[0]!.low).toBe(1)
      expect(entries[1]!.low).toBe(3)
      expect(entries[2]!.low).toBe(5)
    })

    it('should provide correct indices', () => {
      list.insert(1, 3, 'a')
      list.insert(5, 7, 'b')
      list.insert(9, 11, 'c')
      const indices: number[] = []
      list.forEach((_e, i) => { indices.push(i) })
      expect(indices).toEqual([0, 1, 2])
    })

    it('should handle single item', () => {
      list.insert(1, 5, 'a')
      let count = 0
      list.forEach(() => { count++ })
      expect(count).toBe(1)
    })
  })

  describe('[Symbol.iterator]', () => {
    it('should return empty iterator for empty list', () => {
      expect([...list]).toEqual([])
    })

    it('should iterate in order', () => {
      list.insert(5, 10, 'b')
      list.insert(1, 3, 'a')
      list.insert(3, 7, 'c')
      const arr = [...list]
      expect(arr[0]!.low).toBe(1)
      expect(arr[1]!.low).toBe(3)
      expect(arr[2]!.low).toBe(5)
    })

    it('should work with for...of', () => {
      list.insert(1, 5, 'a')
      list.insert(3, 7, 'b')
      const entries: Array<IntervalEntry<string>> = []
      for (const e of list) {
        entries.push(e)
      }
      expect(entries).toHaveLength(2)
    })

    it('should work with Array.from', () => {
      list.insert(1, 5, 'a')
      expect(Array.from(list)).toHaveLength(1)
    })
  })

  describe('getStatistics', () => {
    it('should return initial statistics', () => {
      const stats = list.getStatistics()
      expect(stats.inserts).toBe(0)
      expect(stats.removes).toBe(0)
      expect(stats.queries).toBe(0)
      expect(stats.maxLevel).toBe(0)
      expect(stats.avgNodesPerLevel).toBe(0)
    })

    it('should track inserts', () => {
      list.insert(1, 5, 'a')
      list.insert(3, 7, 'b')
      expect(list.getStatistics().inserts).toBe(2)
    })

    it('should track removes', () => {
      list.insert(1, 5, 'a')
      list.remove(1, 5)
      expect(list.getStatistics().removes).toBe(1)
    })

    it('should not increment removes on failed remove', () => {
      list.remove(1, 5)
      expect(list.getStatistics().removes).toBe(0)
    })

    it('should track queries', () => {
      list.insert(1, 10, 'a')
      list.query(5)
      list.queryRange(1, 10)
      expect(list.getStatistics().queries).toBe(2)
    })

    it('should track maxLevel', () => {
      for (let i = 0; i < 100; i++) {
        list.insert(i, i + 10, `item-${i}`)
      }
      const stats = list.getStatistics()
      expect(stats.maxLevel).toBeGreaterThanOrEqual(1)
    })

    it('should track levelDistribution', () => {
      for (let i = 0; i < 50; i++) {
        list.insert(i, i + 5, `item-${i}`)
      }
      const stats = list.getStatistics()
      expect(Object.keys(stats.levelDistribution).length).toBeGreaterThan(0)
    })

    it('should track avgNodesPerLevel', () => {
      for (let i = 0; i < 50; i++) {
        list.insert(i, i + 5, `item-${i}`)
      }
      const stats = list.getStatistics()
      expect(stats.avgNodesPerLevel).toBeGreaterThan(0)
    })

    it('should return a copy', () => {
      list.insert(1, 5, 'a')
      const stats1 = list.getStatistics()
      list.insert(3, 7, 'b')
      expect(stats1.inserts).toBe(1)
      expect(list.getStatistics().inserts).toBe(2)
    })
  })

  describe('toJSON', () => {
    it('should serialize empty list', () => {
      const json = list.toJSON()
      expect(json).toEqual({ entries: [], options: { maxLevel: 16, probability: 0.5 } })
    })

    it('should serialize intervals', () => {
      list.insert(1, 5, 'a')
      list.insert(3, 7, 'b')
      const json = list.toJSON() as { entries: Array<{ low: number; high: number; value?: string }> }
      expect(json.entries).toHaveLength(2)
      expect(json.entries[0]!.low).toBe(1)
      expect(json.entries[0]!.high).toBe(5)
      expect(json.entries[0]!.value).toBe('a')
    })

    it('should serialize options', () => {
      const sl = new IntervalSkipList<string>({ maxLevel: 8, probability: 0.25 })
      const json = sl.toJSON() as { options: { maxLevel: number; probability: number } }
      expect(json.options.maxLevel).toBe(8)
      expect(json.options.probability).toBe(0.25)
    })

    it('should not include undefined values', () => {
      const sl = new IntervalSkipList()
      sl.insert(1, 5)
      const json = sl.toJSON() as { entries: Array<{ low: number; high: number; value?: undefined }> }
      expect(json.entries[0]!.value).toBeUndefined()
    })
  })

  describe('fromJSON', () => {
    it('should deserialize empty list', () => {
      const sl = IntervalSkipList.fromJSON<string>({ entries: [] })
      expect(sl.size).toBe(0)
      expect(sl.isEmpty).toBe(true)
    })

    it('should deserialize intervals', () => {
      const sl = IntervalSkipList.fromJSON<string>({
        entries: [
          { low: 1, high: 5, value: 'a' },
          { low: 3, high: 7, value: 'b' },
        ],
      })
      expect(sl.size).toBe(2)
      expect(sl.contains(1, 5)).toBe(true)
      expect(sl.contains(3, 7)).toBe(true)
    })

    it('should deserialize with options', () => {
      const sl = IntervalSkipList.fromJSON<string>({
        entries: [],
        options: { maxLevel: 8, probability: 0.25 },
      })
      expect(sl.size).toBe(0)
    })

    it('should round-trip through JSON', () => {
      list.insert(1, 5, 'a')
      list.insert(3, 7, 'b')
      list.insert(6, 10, 'c')
      const restored = IntervalSkipList.fromJSON<string>(list.toJSON())
      expect(restored.size).toBe(3)
      expect(restored.contains(1, 5)).toBe(true)
      expect(restored.contains(3, 7)).toBe(true)
      expect(restored.contains(6, 10)).toBe(true)
    })

    it('should preserve query behavior after round-trip', () => {
      list.insert(1, 10, 'a')
      list.insert(5, 15, 'b')
      const restored = IntervalSkipList.fromJSON<string>(list.toJSON())
      const r1 = restored.query(7)
      expect(r1).toHaveLength(2)
      const r2 = restored.queryRange(3, 12)
      expect(r2).toHaveLength(2)
    })
  })

  describe('edge cases', () => {
    it('should handle point intervals in stabbing queries', () => {
      list.insert(5, 5, 'p')
      expect(list.query(5)).toHaveLength(1)
      expect(list.query(4)).toHaveLength(0)
      expect(list.query(6)).toHaveLength(0)
    })

    it('should handle many disjoint intervals', () => {
      for (let i = 0; i < 50; i++) {
        list.insert(i * 10, i * 10 + 5, `d-${i}`)
      }
      expect(list.size).toBe(50)
      expect(list.query(25)).toHaveLength(1)
      expect(list.query(7)).toHaveLength(0)
    })

    it('should handle fully nested intervals query', () => {
      list.insert(1, 100, 'outer')
      list.insert(10, 90, 'mid')
      list.insert(20, 80, 'inner')
      const result = list.query(50)
      expect(result).toHaveLength(3)
    })

    it('should handle touching intervals stabbing query', () => {
      list.insert(1, 5, 'a')
      list.insert(5, 10, 'b')
      list.insert(10, 15, 'c')
      const r5 = list.query(5)
      expect(r5).toHaveLength(2)
      const r10 = list.query(10)
      expect(r10).toHaveLength(2)
    })

    it('should handle empty list operations gracefully', () => {
      expect(list.query(5)).toEqual([])
      expect(list.queryRange(1, 10)).toEqual([])
      expect(list.contains(1, 5)).toBe(false)
      expect(list.remove(1, 5)).toBe(false)
      expect(list.min()).toBeUndefined()
      expect(list.max()).toBeUndefined()
      expect(list.overlaps(1, 5)).toBe(false)
      expect(list.cover(1, 5)).toBe(false)
      expect(list.toArray()).toEqual([])
      expect(list.isEmpty).toBe(true)
    })

    it('should handle Infinity values', () => {
      list.insert(-Infinity, Infinity, 'inf')
      expect(list.query(0)).toHaveLength(1)
      expect(list.query(Infinity)).toHaveLength(1)
      expect(list.query(-Infinity)).toHaveLength(1)
    })

    it('should handle very large intervals', () => {
      list.insert(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 'big')
      expect(list.query(0)).toHaveLength(1)
      expect(list.size).toBe(1)
    })

    it('should handle remove from list with many items', () => {
      for (let i = 0; i < 100; i++) {
        list.insert(i, i + 5, `item-${i}`)
      }
      for (let i = 0; i < 100; i += 2) {
        list.remove(i, i + 5)
      }
      expect(list.size).toBe(50)
    })

    it('should handle insert after removing all', () => {
      list.insert(1, 5, 'a')
      list.remove(1, 5)
      expect(list.isEmpty).toBe(true)
      list.insert(1, 5, 'b')
      expect(list.size).toBe(1)
    })

    it('should handle query after removal', () => {
      list.insert(1, 10, 'a')
      list.insert(5, 15, 'b')
      list.remove(5, 15)
      expect(list.query(7)).toHaveLength(1)
    })

    it('should handle clear and refill multiple times', () => {
      for (let round = 0; round < 5; round++) {
        for (let i = 0; i < 20; i++) {
          list.insert(i, i + 5, `r${round}-${i}`)
        }
        expect(list.size).toBe(20)
        list.clear()
        expect(list.isEmpty).toBe(true)
      }
    })
  })

  describe('large dataset', () => {
    it('should handle large number of inserts and queries', () => {
      for (let i = 0; i < 500; i++) {
        list.insert(i * 2, i * 2 + 10, `item-${i}`)
      }
      expect(list.size).toBe(500)

      for (let i = 0; i < 100; i++) {
        const result = list.query(i * 5)
        expect(result.length).toBeGreaterThanOrEqual(0)
      }

      for (let i = 0; i < 100; i++) {
        const result = list.queryRange(i * 5, i * 5 + 20)
        expect(result.length).toBeGreaterThanOrEqual(0)
      }
    })

    it('should maintain sorted order with large dataset', () => {
      const items: number[] = []
      for (let i = 0; i < 200; i++) {
        const low = Math.floor(Math.random() * 1000)
        list.insert(low, low + 10, `item-${i}`)
        items.push(low)
      }
      const arr = list.toArray()
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]!.low).toBeGreaterThanOrEqual(arr[i - 1]!.low)
      }
    })

    it('should handle interleaved insert and remove', () => {
      for (let i = 0; i < 100; i++) {
        list.insert(i, i + 5, `item-${i}`)
      }
      for (let i = 0; i < 50; i++) {
        list.remove(i * 2, i * 2 + 5)
      }
      expect(list.size).toBe(50)
      for (let i = 100; i < 150; i++) {
        list.insert(i, i + 5, `item-${i}`)
      }
      expect(list.size).toBe(100)
    })
  })

  describe('value handling', () => {
    it('should store and retrieve values via query', () => {
      list.insert(1, 10, 'hello')
      const result = list.query(5)
      expect(result[0]!.value).toBe('hello')
    })

    it('should store number values', () => {
      const sl = new IntervalSkipList<number>()
      sl.insert(1, 5, 42)
      const result = sl.query(3)
      expect(result[0]!.value).toBe(42)
    })

    it('should store object values', () => {
      const obj = { name: 'test', id: 1 }
      const sl = new IntervalSkipList<{ name: string; id: number }>()
      sl.insert(1, 5, obj)
      const result = sl.query(3)
      expect(result[0]!.value).toEqual(obj)
    })

    it('should store null-like values', () => {
      const sl = new IntervalSkipList<number | null>()
      sl.insert(1, 5, null)
      expect(sl.size).toBe(1)
    })
  })

  describe('iteration order', () => {
    it('should iterate in ascending low order', () => {
      list.insert(10, 20, 'c')
      list.insert(1, 5, 'a')
      list.insert(5, 15, 'b')
      const lows: number[] = []
      list.forEach((e) => { lows.push(e.low) })
      expect(lows).toEqual([1, 5, 10])
    })

    it('should iterate with consistent order after removals', () => {
      list.insert(1, 3, 'a')
      list.insert(5, 7, 'b')
      list.insert(9, 11, 'c')
      list.insert(13, 15, 'd')
      list.remove(5, 7)
      const lows: number[] = []
      list.forEach((e) => { lows.push(e.low) })
      expect(lows).toEqual([1, 9, 13])
    })

    it('should maintain order with equal low values sorted by high', () => {
      list.insert(1, 10, 'wide')
      list.insert(1, 3, 'narrow')
      list.insert(1, 7, 'mid')
      const arr = list.toArray()
      expect(arr[0]!.high).toBe(3)
      expect(arr[1]!.high).toBe(7)
      expect(arr[2]!.high).toBe(10)
    })
  })

  describe('serialization edge cases', () => {
    it('should round-trip with complex values', () => {
      const sl = new IntervalSkipList<{ x: number; y: number }>()
      sl.insert(1, 5, { x: 1, y: 2 })
      sl.insert(3, 7, { x: 3, y: 4 })
      const restored = IntervalSkipList.fromJSON<{ x: number; y: number }>(sl.toJSON())
      expect(restored.size).toBe(2)
    })

    it('should round-trip with many intervals', () => {
      for (let i = 0; i < 50; i++) {
        list.insert(i, i + 10, `item-${i}`)
      }
      const restored = IntervalSkipList.fromJSON<string>(list.toJSON())
      expect(restored.size).toBe(50)
      expect(restored.toArray()).toEqual(list.toArray())
    })

    it('should round-trip empty list', () => {
      const restored = IntervalSkipList.fromJSON<string>(list.toJSON())
      expect(restored.size).toBe(0)
      expect(restored.isEmpty).toBe(true)
    })
  })

  describe('custom options', () => {
    it('should work with low maxLevel', () => {
      const sl = new IntervalSkipList<string>({ maxLevel: 4 })
      for (let i = 0; i < 100; i++) {
        sl.insert(i, i + 5, `item-${i}`)
      }
      expect(sl.size).toBe(100)
    })

    it('should work with low probability', () => {
      const sl = new IntervalSkipList<string>({ probability: 0.1 })
      for (let i = 0; i < 100; i++) {
        sl.insert(i, i + 5, `item-${i}`)
      }
      expect(sl.size).toBe(100)
    })

    it('should work with high probability', () => {
      const sl = new IntervalSkipList<string>({ probability: 0.9 })
      for (let i = 0; i < 100; i++) {
        sl.insert(i, i + 5, `item-${i}`)
      }
      expect(sl.size).toBe(100)
    })
  })
})
