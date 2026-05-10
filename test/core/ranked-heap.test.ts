import { describe, it, expect, beforeEach } from 'vitest'
import { RankedHeap } from '../../src/core/ranked-heap/ranked-heap.js'
import { DEFAULT_RANKED_HEAP_OPTIONS } from '../../src/core/ranked-heap/types.js'
import type { RankedHeapOptions, RankedHeapJSON, RankedHeapStatistics, RankedHeapEntry, RankedHeapComparator } from '../../src/core/ranked-heap/types.js'

describe('RankedHeap', () => {
  let heap: RankedHeap<string>

  beforeEach(() => {
    heap = new RankedHeap<string>()
  })

  describe('constructor', () => {
    it('should create with default options (max heap)', () => {
      const h = new RankedHeap<string>()
      expect(h.isEmpty).toBe(true)
      expect(h.size).toBe(0)
    })

    it('should accept empty options object', () => {
      const h = new RankedHeap<string>({})
      expect(h.isEmpty).toBe(true)
    })

    it('should accept max comparator option', () => {
      const h = new RankedHeap<string>({ comparator: 'max' })
      h.push('a', 1)
      h.push('b', 5)
      expect(h.peek()).toBe('b')
    })

    it('should accept min comparator option', () => {
      const h = new RankedHeap<string>({ comparator: 'min' })
      h.push('a', 1)
      h.push('b', 5)
      expect(h.peek()).toBe('a')
    })

    it('should use max as default comparator', () => {
      heap.push('x', 10)
      heap.push('y', 5)
      expect(heap.peek()).toBe('x')
    })
  })

  describe('push', () => {
    it('should add a single element', () => {
      heap.push('a', 5)
      expect(heap.size).toBe(1)
      expect(heap.isEmpty).toBe(false)
    })

    it('should add multiple elements', () => {
      heap.push('a', 5)
      heap.push('b', 3)
      heap.push('c', 7)
      expect(heap.size).toBe(3)
    })

    it('should maintain max heap property', () => {
      heap.push('a', 5)
      heap.push('b', 3)
      heap.push('c', 7)
      expect(heap.peek()).toBe('c')
    })

    it('should maintain min heap property', () => {
      const h = new RankedHeap<string>({ comparator: 'min' })
      h.push('a', 5)
      h.push('b', 3)
      h.push('c', 7)
      expect(h.peek()).toBe('b')
    })

    it('should update score if value already exists', () => {
      heap.push('a', 5)
      heap.push('a', 10)
      expect(heap.size).toBe(1)
      expect(heap.peekScore()).toBe(10)
    })

    it('should track push statistics', () => {
      heap.push('a', 1)
      heap.push('b', 2)
      expect(heap.getStatistics().pushes).toBe(2)
    })

    it('should not increment push count on duplicate value push', () => {
      heap.push('a', 1)
      heap.push('a', 2)
      expect(heap.getStatistics().pushes).toBe(1)
      expect(heap.getStatistics().scoreUpdates).toBe(1)
    })

    it('should handle equal scores', () => {
      heap.push('a', 5)
      heap.push('b', 5)
      expect(heap.size).toBe(2)
    })

    it('should handle negative scores', () => {
      heap.push('a', -5)
      heap.push('b', -10)
      heap.push('c', -1)
      expect(heap.peek()).toBe('c')
      expect(heap.peekScore()).toBe(-1)
    })

    it('should handle zero scores', () => {
      heap.push('a', 0)
      expect(heap.peekScore()).toBe(0)
    })

    it('should handle floating point scores', () => {
      heap.push('a', 3.14)
      heap.push('b', 2.71)
      expect(heap.peek()).toBe('a')
    })

    it('should update maxSize statistic', () => {
      heap.push('a', 1)
      heap.push('b', 2)
      heap.push('c', 3)
      expect(heap.getStatistics().maxSize).toBe(3)
    })
  })

  describe('pop', () => {
    it('should return undefined on empty heap', () => {
      expect(heap.pop()).toBeUndefined()
    })

    it('should return the top element', () => {
      heap.push('a', 5)
      heap.push('b', 10)
      heap.push('c', 3)
      expect(heap.pop()).toBe('b')
    })

    it('should remove the element from heap', () => {
      heap.push('a', 5)
      heap.pop()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('should maintain heap property after pop', () => {
      heap.push('a', 10)
      heap.push('b', 5)
      heap.push('c', 8)
      heap.pop()
      expect(heap.peekScore()).toBe(8)
    })

    it('should pop all elements in order (max heap)', () => {
      heap.push('a', 3)
      heap.push('b', 1)
      heap.push('c', 5)
      heap.push('d', 2)
      heap.push('e', 4)
      expect(heap.pop()).toBe('c')
      expect(heap.pop()).toBe('e')
      expect(heap.pop()).toBe('a')
      expect(heap.pop()).toBe('d')
      expect(heap.pop()).toBe('b')
      expect(heap.pop()).toBeUndefined()
    })

    it('should pop all elements in order (min heap)', () => {
      const h = new RankedHeap<string>({ comparator: 'min' })
      h.push('a', 3)
      h.push('b', 1)
      h.push('c', 5)
      expect(h.pop()).toBe('b')
      expect(h.pop()).toBe('a')
      expect(h.pop()).toBe('c')
    })

    it('should track pop statistics', () => {
      heap.push('a', 1)
      heap.pop()
      expect(heap.getStatistics().pops).toBe(1)
    })

    it('should not increment pop stat on empty pop', () => {
      heap.pop()
      expect(heap.getStatistics().pops).toBe(0)
    })

    it('should handle pop followed by push', () => {
      heap.push('a', 1)
      heap.pop()
      heap.push('b', 2)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe('b')
    })
  })

  describe('peek', () => {
    it('should return undefined on empty heap', () => {
      expect(heap.peek()).toBeUndefined()
    })

    it('should return the top element without removing it', () => {
      heap.push('a', 5)
      expect(heap.peek()).toBe('a')
      expect(heap.size).toBe(1)
    })

    it('should return the element with highest score in max heap', () => {
      heap.push('a', 3)
      heap.push('b', 7)
      heap.push('c', 5)
      expect(heap.peek()).toBe('b')
    })

    it('should return the element with lowest score in min heap', () => {
      const h = new RankedHeap<string>({ comparator: 'min' })
      h.push('a', 3)
      h.push('b', 7)
      h.push('c', 1)
      expect(h.peek()).toBe('c')
    })
  })

  describe('peekScore', () => {
    it('should return undefined on empty heap', () => {
      expect(heap.peekScore()).toBeUndefined()
    })

    it('should return the score of the top element', () => {
      heap.push('a', 42)
      expect(heap.peekScore()).toBe(42)
    })

    it('should return the highest score in max heap', () => {
      heap.push('a', 10)
      heap.push('b', 50)
      heap.push('c', 30)
      expect(heap.peekScore()).toBe(50)
    })

    it('should return the lowest score in min heap', () => {
      const h = new RankedHeap<string>({ comparator: 'min' })
      h.push('a', 10)
      h.push('b', 2)
      h.push('c', 30)
      expect(h.peekScore()).toBe(2)
    })
  })

  describe('rank', () => {
    it('should return undefined for k < 1', () => {
      heap.push('a', 5)
      expect(heap.rank(0)).toBeUndefined()
    })

    it('should return undefined for k > size', () => {
      heap.push('a', 5)
      expect(heap.rank(2)).toBeUndefined()
    })

    it('should return the 1st ranked element', () => {
      heap.push('a', 10)
      heap.push('b', 5)
      heap.push('c', 8)
      expect(heap.rank(1)).toBe('a')
    })

    it('should return the k-th ranked element (max heap)', () => {
      heap.push('a', 10)
      heap.push('b', 5)
      heap.push('c', 8)
      heap.push('d', 3)
      expect(heap.rank(1)).toBe('a')
      expect(heap.rank(2)).toBe('c')
      expect(heap.rank(3)).toBe('b')
      expect(heap.rank(4)).toBe('d')
    })

    it('should return the k-th ranked element (min heap)', () => {
      const h = new RankedHeap<string>({ comparator: 'min' })
      h.push('a', 10)
      h.push('b', 5)
      h.push('c', 8)
      h.push('d', 3)
      expect(h.rank(1)).toBe('d')
      expect(h.rank(2)).toBe('b')
      expect(h.rank(3)).toBe('c')
      expect(h.rank(4)).toBe('a')
    })

    it('should track rank query statistics', () => {
      heap.push('a', 5)
      heap.rank(1)
      heap.rank(2)
      expect(heap.getStatistics().rankQueries).toBe(2)
    })

    it('should track rank query stat even for invalid k', () => {
      heap.rank(0)
      expect(heap.getStatistics().rankQueries).toBe(1)
    })

    it('should work with single element', () => {
      heap.push('only', 42)
      expect(heap.rank(1)).toBe('only')
    })
  })

  describe('rankOf', () => {
    it('should return undefined for value not in heap', () => {
      heap.push('a', 5)
      expect(heap.rankOf('b')).toBeUndefined()
    })

    it('should return 1 for the top element', () => {
      heap.push('a', 10)
      heap.push('b', 5)
      expect(heap.rankOf('a')).toBe(1)
    })

    it('should return correct rank for each element', () => {
      heap.push('a', 10)
      heap.push('b', 5)
      heap.push('c', 8)
      heap.push('d', 3)
      expect(heap.rankOf('a')).toBe(1)
      expect(heap.rankOf('c')).toBe(2)
      expect(heap.rankOf('b')).toBe(3)
      expect(heap.rankOf('d')).toBe(4)
    })

    it('should return correct rank in min heap', () => {
      const h = new RankedHeap<string>({ comparator: 'min' })
      h.push('a', 10)
      h.push('b', 5)
      h.push('c', 3)
      expect(h.rankOf('c')).toBe(1)
      expect(h.rankOf('b')).toBe(2)
      expect(h.rankOf('a')).toBe(3)
    })

    it('should track rank query statistics', () => {
      heap.push('a', 5)
      heap.rankOf('a')
      expect(heap.getStatistics().rankQueries).toBe(1)
    })

    it('should track rank query stat for missing value', () => {
      heap.push('a', 5)
      heap.rankOf('missing')
      expect(heap.getStatistics().rankQueries).toBe(1)
    })
  })

  describe('updateScore', () => {
    it('should return false for value not in heap', () => {
      expect(heap.updateScore('missing', 10)).toBe(false)
    })

    it('should return true for existing value', () => {
      heap.push('a', 5)
      expect(heap.updateScore('a', 10)).toBe(true)
    })

    it('should update the score', () => {
      heap.push('a', 5)
      heap.updateScore('a', 20)
      expect(heap.peekScore()).toBe(20)
    })

    it('should maintain heap property after update', () => {
      heap.push('a', 5)
      heap.push('b', 10)
      heap.updateScore('a', 15)
      expect(heap.peek()).toBe('a')
    })

    it('should update score downward', () => {
      heap.push('a', 10)
      heap.push('b', 5)
      heap.updateScore('a', 3)
      expect(heap.peek()).toBe('b')
    })

    it('should track score update statistics', () => {
      heap.push('a', 5)
      heap.updateScore('a', 10)
      expect(heap.getStatistics().scoreUpdates).toBe(1)
    })

    it('should not track stat for missing value update', () => {
      heap.updateScore('missing', 10)
      expect(heap.getStatistics().scoreUpdates).toBe(0)
    })

    it('should handle multiple updates on same value', () => {
      heap.push('a', 5)
      heap.updateScore('a', 10)
      heap.updateScore('a', 1)
      heap.updateScore('a', 20)
      expect(heap.peekScore()).toBe(20)
      expect(heap.getStatistics().scoreUpdates).toBe(3)
    })
  })

  describe('delete', () => {
    it('should return false for value not in heap', () => {
      expect(heap.delete('missing')).toBe(false)
    })

    it('should return true for existing value', () => {
      heap.push('a', 5)
      expect(heap.delete('a')).toBe(true)
    })

    it('should remove the element', () => {
      heap.push('a', 5)
      heap.delete('a')
      expect(heap.size).toBe(0)
      expect(heap.has('a')).toBe(false)
    })

    it('should maintain heap property after delete', () => {
      heap.push('a', 10)
      heap.push('b', 5)
      heap.push('c', 8)
      heap.delete('a')
      expect(heap.peek()).toBe('c')
    })

    it('should handle deleting the top element', () => {
      heap.push('a', 10)
      heap.push('b', 5)
      heap.delete('a')
      expect(heap.peek()).toBe('b')
    })

    it('should handle deleting a middle element', () => {
      heap.push('a', 10)
      heap.push('b', 5)
      heap.push('c', 8)
      heap.delete('b')
      expect(heap.size).toBe(2)
      expect(heap.has('b')).toBe(false)
    })

    it('should handle deleting the only element', () => {
      heap.push('only', 42)
      heap.delete('only')
      expect(heap.isEmpty).toBe(true)
    })

    it('should track delete statistics', () => {
      heap.push('a', 5)
      heap.delete('a')
      expect(heap.getStatistics().deletes).toBe(1)
    })

    it('should not track stat for missing value delete', () => {
      heap.delete('missing')
      expect(heap.getStatistics().deletes).toBe(0)
    })

    it('should allow re-adding a deleted value', () => {
      heap.push('a', 5)
      heap.delete('a')
      heap.push('a', 10)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe('a')
    })
  })

  describe('has', () => {
    it('should return false on empty heap', () => {
      expect(heap.has('anything')).toBe(false)
    })

    it('should return true for existing value', () => {
      heap.push('a', 5)
      expect(heap.has('a')).toBe(true)
    })

    it('should return false for non-existing value', () => {
      heap.push('a', 5)
      expect(heap.has('b')).toBe(false)
    })

    it('should return false after delete', () => {
      heap.push('a', 5)
      heap.delete('a')
      expect(heap.has('a')).toBe(false)
    })

    it('should return true after score update', () => {
      heap.push('a', 5)
      heap.updateScore('a', 10)
      expect(heap.has('a')).toBe(true)
    })
  })

  describe('size', () => {
    it('should be 0 on empty heap', () => {
      expect(heap.size).toBe(0)
    })

    it('should increase with push', () => {
      heap.push('a', 1)
      expect(heap.size).toBe(1)
      heap.push('b', 2)
      expect(heap.size).toBe(2)
    })

    it('should decrease with pop', () => {
      heap.push('a', 1)
      heap.push('b', 2)
      heap.pop()
      expect(heap.size).toBe(1)
    })

    it('should decrease with delete', () => {
      heap.push('a', 1)
      heap.delete('a')
      expect(heap.size).toBe(0)
    })

    it('should not change on duplicate push', () => {
      heap.push('a', 1)
      heap.push('a', 2)
      expect(heap.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should be true on new heap', () => {
      expect(heap.isEmpty).toBe(true)
    })

    it('should be false after push', () => {
      heap.push('a', 1)
      expect(heap.isEmpty).toBe(false)
    })

    it('should be true after popping all elements', () => {
      heap.push('a', 1)
      heap.pop()
      expect(heap.isEmpty).toBe(true)
    })

    it('should be true after clearing', () => {
      heap.push('a', 1)
      heap.clear()
      expect(heap.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should reset size to 0', () => {
      heap.push('a', 1)
      heap.push('b', 2)
      heap.clear()
      expect(heap.size).toBe(0)
    })

    it('should set isEmpty to true', () => {
      heap.push('a', 1)
      heap.clear()
      expect(heap.isEmpty).toBe(true)
    })

    it('should reset statistics', () => {
      heap.push('a', 1)
      heap.pop()
      heap.clear()
      const stats = heap.getStatistics()
      expect(stats.pushes).toBe(0)
      expect(stats.pops).toBe(0)
      expect(stats.rankQueries).toBe(0)
      expect(stats.scoreUpdates).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.maxSize).toBe(0)
    })

    it('should allow adding after clear', () => {
      heap.push('before', 1)
      heap.clear()
      heap.push('after', 2)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe('after')
    })

    it('should remove all elements from has check', () => {
      heap.push('a', 1)
      heap.push('b', 2)
      heap.clear()
      expect(heap.has('a')).toBe(false)
      expect(heap.has('b')).toBe(false)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      expect(heap.toArray()).toEqual([])
    })

    it('should return elements in ranked order (max)', () => {
      heap.push('a', 3)
      heap.push('b', 1)
      heap.push('c', 5)
      expect(heap.toArray()).toEqual(['c', 'a', 'b'])
    })

    it('should return elements in ranked order (min)', () => {
      const h = new RankedHeap<string>({ comparator: 'min' })
      h.push('a', 3)
      h.push('b', 1)
      h.push('c', 5)
      expect(h.toArray()).toEqual(['b', 'a', 'c'])
    })

    it('should not modify the heap', () => {
      heap.push('a', 1)
      heap.push('b', 2)
      heap.toArray()
      expect(heap.size).toBe(2)
    })
  })

  describe('scores', () => {
    it('should return empty array for empty heap', () => {
      expect(heap.scores()).toEqual([])
    })

    it('should return value and score pairs in order', () => {
      heap.push('a', 10)
      heap.push('b', 5)
      heap.push('c', 8)
      const result = heap.scores()
      expect(result[0]).toEqual({ value: 'a', score: 10 })
      expect(result[1]).toEqual({ value: 'c', score: 8 })
      expect(result[2]).toEqual({ value: 'b', score: 5 })
    })

    it('should return correct structure', () => {
      heap.push('x', 42)
      const result = heap.scores()
      expect(result.length).toBe(1)
      expect(result[0]!.value).toBe('x')
      expect(result[0]!.score).toBe(42)
    })
  })

  describe('forEach', () => {
    it('should not call callback on empty heap', () => {
      let count = 0
      heap.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should call callback for each element in rank order', () => {
      heap.push('a', 10)
      heap.push('b', 5)
      heap.push('c', 8)
      const results: Array<{ value: string; score: number; rank: number }> = []
      heap.forEach((value, score, rank) => {
        results.push({ value, score, rank })
      })
      expect(results[0]).toEqual({ value: 'a', score: 10, rank: 1 })
      expect(results[1]).toEqual({ value: 'c', score: 8, rank: 2 })
      expect(results[2]).toEqual({ value: 'b', score: 5, rank: 3 })
    })

    it('should provide correct rank values', () => {
      heap.push('a', 1)
      heap.push('b', 2)
      heap.push('c', 3)
      const ranks: number[] = []
      heap.forEach((_v, _s, rank) => { ranks.push(rank) })
      expect(ranks).toEqual([1, 2, 3])
    })
  })

  describe('[Symbol.iterator]', () => {
    it('should return empty iterator for empty heap', () => {
      expect([...heap]).toEqual([])
    })

    it('should iterate in ranked order', () => {
      heap.push('a', 3)
      heap.push('b', 1)
      heap.push('c', 5)
      expect([...heap]).toEqual(['c', 'a', 'b'])
    })

    it('should be usable with for-of', () => {
      heap.push('a', 1)
      heap.push('b', 2)
      const values: string[] = []
      for (const v of heap) {
        values.push(v)
      }
      expect(values).toEqual(['b', 'a'])
    })

    it('should not modify the heap', () => {
      heap.push('a', 1)
      ;[...heap]
      expect(heap.size).toBe(1)
    })
  })

  describe('getStatistics', () => {
    it('should return all-zero stats on new heap', () => {
      const stats = heap.getStatistics()
      expect(stats.pushes).toBe(0)
      expect(stats.pops).toBe(0)
      expect(stats.rankQueries).toBe(0)
      expect(stats.scoreUpdates).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.maxSize).toBe(0)
    })

    it('should return a copy of statistics', () => {
      heap.push('a', 1)
      const stats1 = heap.getStatistics()
      heap.push('b', 2)
      const stats2 = heap.getStatistics()
      expect(stats1.pushes).toBe(1)
      expect(stats2.pushes).toBe(2)
    })

    it('should track pushes', () => {
      heap.push('a', 1)
      heap.push('b', 2)
      heap.push('c', 3)
      expect(heap.getStatistics().pushes).toBe(3)
    })

    it('should track pops', () => {
      heap.push('a', 1)
      heap.pop()
      expect(heap.getStatistics().pops).toBe(1)
    })

    it('should track rankQueries', () => {
      heap.push('a', 1)
      heap.rank(1)
      heap.rankOf('a')
      expect(heap.getStatistics().rankQueries).toBe(2)
    })

    it('should track scoreUpdates', () => {
      heap.push('a', 1)
      heap.updateScore('a', 5)
      expect(heap.getStatistics().scoreUpdates).toBe(1)
    })

    it('should track deletes', () => {
      heap.push('a', 1)
      heap.delete('a')
      expect(heap.getStatistics().deletes).toBe(1)
    })

    it('should track maxSize', () => {
      heap.push('a', 1)
      heap.push('b', 2)
      heap.push('c', 3)
      heap.pop()
      expect(heap.getStatistics().maxSize).toBe(3)
    })

    it('should not decrease maxSize after pops', () => {
      heap.push('a', 1)
      heap.push('b', 2)
      heap.pop()
      expect(heap.getStatistics().maxSize).toBe(2)
    })
  })

  describe('toJSON', () => {
    it('should produce correct structure', () => {
      heap.push('a', 5)
      const json = heap.toJSON()
      expect(json).toHaveProperty('entries')
      expect(json).toHaveProperty('comparator')
      expect(json).toHaveProperty('statistics')
    })

    it('should include all entries', () => {
      heap.push('a', 5)
      heap.push('b', 10)
      const json = heap.toJSON()
      expect(json.entries.length).toBe(2)
    })

    it('should include comparator', () => {
      const json = heap.toJSON()
      expect(json.comparator).toBe('max')
    })

    it('should include statistics', () => {
      heap.push('a', 5)
      const json = heap.toJSON()
      expect(json.statistics.pushes).toBe(1)
    })

    it('should include min comparator', () => {
      const h = new RankedHeap<string>({ comparator: 'min' })
      const json = h.toJSON()
      expect(json.comparator).toBe('min')
    })
  })

  describe('fromJSON', () => {
    it('should restore a serialized heap', () => {
      heap.push('a', 10)
      heap.push('b', 5)
      heap.push('c', 8)
      const json = heap.toJSON()
      const restored = RankedHeap.fromJSON<string>(json)
      expect(restored.size).toBe(3)
      expect(restored.peek()).toBe('a')
    })

    it('should round-trip correctly', () => {
      heap.push('a', 10)
      heap.push('b', 5)
      const json = heap.toJSON()
      const restored = RankedHeap.fromJSON<string>(json)
      const json2 = restored.toJSON()
      expect(json.entries.length).toBe(json2.entries.length)
      expect(json.comparator).toBe(json2.comparator)
    })

    it('should preserve comparator', () => {
      const h = new RankedHeap<string>({ comparator: 'min' })
      h.push('a', 5)
      const json = h.toJSON()
      const restored = RankedHeap.fromJSON<string>(json)
      expect(restored.peek()).toBe('a')
    })

    it('should allow operations after restoration', () => {
      heap.push('a', 5)
      const restored = RankedHeap.fromJSON<string>(heap.toJSON())
      restored.push('b', 10)
      expect(restored.size).toBe(2)
      expect(restored.peek()).toBe('b')
    })

    it('should preserve statistics', () => {
      heap.push('a', 5)
      heap.push('b', 10)
      const json = heap.toJSON()
      const restored = RankedHeap.fromJSON<string>(json)
      const stats = restored.getStatistics()
      expect(stats.pushes).toBe(2)
    })

    it('should restore min heap correctly', () => {
      const h = new RankedHeap<string>({ comparator: 'min' })
      h.push('a', 10)
      h.push('b', 2)
      h.push('c', 5)
      const json = h.toJSON()
      const restored = RankedHeap.fromJSON<string>(json)
      expect(restored.rank(1)).toBe('b')
      expect(restored.rank(2)).toBe('c')
      expect(restored.rank(3)).toBe('a')
    })
  })

  describe('DEFAULT_RANKED_HEAP_OPTIONS', () => {
    it('should have comparator set to max', () => {
      expect(DEFAULT_RANKED_HEAP_OPTIONS.comparator).toBe('max')
    })
  })

  describe('generic type support', () => {
    it('should work with number values', () => {
      const h = new RankedHeap<number>()
      h.push(1, 10)
      h.push(2, 20)
      expect(h.peek()).toBe(2)
    })

    it('should work with object values', () => {
      const h = new RankedHeap<{ id: number }>()
      const obj1 = { id: 1 }
      const obj2 = { id: 2 }
      h.push(obj1, 5)
      h.push(obj2, 10)
      expect(h.peek()).toBe(obj2)
    })

    it('should work with boolean values', () => {
      const h = new RankedHeap<boolean>()
      h.push(true, 1)
      h.push(false, 2)
      expect(h.peek()).toBe(false)
    })

    it('should work with number values and scores', () => {
      const h = new RankedHeap<number>()
      for (let i = 1; i <= 10; i++) {
        h.push(i, i * 10)
      }
      expect(h.rank(1)).toBe(10)
      expect(h.rank(10)).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('should handle single element operations', () => {
      heap.push('only', 42)
      expect(heap.peek()).toBe('only')
      expect(heap.peekScore()).toBe(42)
      expect(heap.rank(1)).toBe('only')
      expect(heap.rankOf('only')).toBe(1)
      expect(heap.pop()).toBe('only')
      expect(heap.isEmpty).toBe(true)
    })

    it('should handle many elements', () => {
      for (let i = 0; i < 100; i++) {
        heap.push(`item-${i}`, i)
      }
      expect(heap.size).toBe(100)
      expect(heap.peek()).toBe('item-99')
      expect(heap.rank(1)).toBe('item-99')
      expect(heap.rank(100)).toBe('item-0')
    })

    it('should handle rapid push-pop cycles', () => {
      for (let i = 0; i < 50; i++) {
        heap.push(`item-${i}`, i)
        heap.pop()
      }
      expect(heap.isEmpty).toBe(true)
    })

    it('should handle push-delete cycles', () => {
      for (let i = 0; i < 50; i++) {
        heap.push(`item-${i}`, i)
        heap.delete(`item-${i}`)
      }
      expect(heap.isEmpty).toBe(true)
    })

    it('should handle duplicate score entries', () => {
      heap.push('a', 5)
      heap.push('b', 5)
      heap.push('c', 5)
      expect(heap.size).toBe(3)
      const arr = heap.toArray()
      expect(arr).toContain('a')
      expect(arr).toContain('b')
      expect(arr).toContain('c')
    })

    it('should handle update to same score', () => {
      heap.push('a', 5)
      heap.updateScore('a', 5)
      expect(heap.peekScore()).toBe(5)
      expect(heap.getStatistics().scoreUpdates).toBe(1)
    })

    it('should handle clearing and reusing', () => {
      heap.push('a', 1)
      heap.push('b', 2)
      heap.clear()
      heap.push('c', 3)
      heap.push('d', 4)
      expect(heap.size).toBe(2)
      expect(heap.has('a')).toBe(false)
      expect(heap.has('c')).toBe(true)
    })

    it('should maintain maxSize across operations', () => {
      for (let i = 0; i < 10; i++) {
        heap.push(`item-${i}`, i)
      }
      for (let i = 0; i < 5; i++) {
        heap.pop()
      }
      expect(heap.getStatistics().maxSize).toBe(10)
      expect(heap.size).toBe(5)
    })

    it('should handle all operations on min heap', () => {
      const h = new RankedHeap<string>({ comparator: 'min' })
      h.push('a', 10)
      h.push('b', 5)
      h.push('c', 15)
      expect(h.peek()).toBe('b')
      h.updateScore('a', 1)
      expect(h.peek()).toBe('a')
      h.delete('a')
      expect(h.peek()).toBe('b')
      expect(h.rank(1)).toBe('b')
      expect(h.rank(2)).toBe('c')
    })
  })

  describe('exports', () => {
    it('should export RankedHeap class', () => {
      expect(RankedHeap).toBeDefined()
      expect(typeof RankedHeap).toBe('function')
    })

    it('should export DEFAULT_RANKED_HEAP_OPTIONS', () => {
      expect(DEFAULT_RANKED_HEAP_OPTIONS).toBeDefined()
      expect(DEFAULT_RANKED_HEAP_OPTIONS.comparator).toBe('max')
    })

    it('should allow type-only import for RankedHeapOptions', () => {
      const opts: RankedHeapOptions<string> = { comparator: 'min' }
      const h = new RankedHeap<string>(opts)
      expect(h).toBeDefined()
    })

    it('should allow type-only import for RankedHeapJSON', () => {
      heap.push('a', 1)
      const json: RankedHeapJSON<string> = heap.toJSON()
      expect(json.entries.length).toBe(1)
    })

    it('should allow type-only import for RankedHeapStatistics', () => {
      const stats: RankedHeapStatistics = heap.getStatistics()
      expect(stats.pushes).toBe(0)
    })

    it('should allow type-only import for RankedHeapEntry', () => {
      const entry: RankedHeapEntry<string> = { value: 'test', score: 5 }
      expect(entry.value).toBe('test')
      expect(entry.score).toBe(5)
    })

    it('should allow type-only import for RankedHeapComparator', () => {
      const comp: RankedHeapComparator = 'min'
      expect(comp).toBe('min')
    })
  })
})
