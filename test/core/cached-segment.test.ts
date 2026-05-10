import { describe, it, expect } from 'vitest'
import { CachedSegment } from '../../src/core/cached-segment/cached-segment.js'
import { DEFAULT_CACHED_SEGMENT_OPTIONS } from '../../src/core/cached-segment/types.js'
import type { CachedSegmentStatistics } from '../../src/core/cached-segment/types.js'

describe('CachedSegment', () => {
  describe('constructor', () => {
    it('should create with default options', () => {
      const cs = new CachedSegment<number>()
      expect(cs.size).toBe(0)
      expect(cs.isEmpty()).toBe(true)
    })

    it('should create with custom segmentSize', () => {
      const cs = new CachedSegment<number>({ segmentSize: 16 })
      cs.push(1)
      cs.push(2)
      expect(cs.size).toBe(2)
    })

    it('should create with custom cacheCapacity', () => {
      const cs = new CachedSegment<number>({ cacheCapacity: 4 })
      expect(cs.cacheSize()).toBe(0)
    })

    it('should create with both custom options', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4, cacheCapacity: 2 })
      expect(cs.size).toBe(0)
    })

    it('should throw on segmentSize 0', () => {
      expect(() => new CachedSegment<number>({ segmentSize: 0 })).toThrow(RangeError)
    })

    it('should throw on negative segmentSize', () => {
      expect(() => new CachedSegment<number>({ segmentSize: -1 })).toThrow(RangeError)
    })

    it('should throw on cacheCapacity 0', () => {
      expect(() => new CachedSegment<number>({ cacheCapacity: 0 })).toThrow(RangeError)
    })

    it('should throw on negative cacheCapacity', () => {
      expect(() => new CachedSegment<number>({ cacheCapacity: -1 })).toThrow(RangeError)
    })

    it('should use defaults when no options provided', () => {
      const cs = new CachedSegment<number>()
      const stats = cs.getStatistics()
      expect(stats.reads).toBe(0)
      expect(stats.writes).toBe(0)
    })
  })

  describe('push', () => {
    it('should push a single element', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(42)
      expect(cs.size).toBe(1)
      expect(cs.isEmpty()).toBe(false)
    })

    it('should push multiple elements', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      expect(cs.size).toBe(3)
    })

    it('should return the new size', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      expect(cs.push(1)).toBe(1)
      expect(cs.push(2)).toBe(2)
      expect(cs.push(3)).toBe(3)
    })

    it('should handle crossing segment boundaries', () => {
      const cs = new CachedSegment<number>({ segmentSize: 2 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      cs.push(4)
      cs.push(5)
      expect(cs.size).toBe(5)
      expect(cs.segmentCount()).toBe(3)
    })

    it('should increment writes stat', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.push(2)
      expect(cs.getStatistics().writes).toBe(2)
    })

    it('should push strings', () => {
      const cs = new CachedSegment<string>({ segmentSize: 4 })
      cs.push('hello')
      cs.push('world')
      expect(cs.size).toBe(2)
      expect(cs.get(0)).toBe('hello')
      expect(cs.get(1)).toBe('world')
    })

    it('should push objects', () => {
      const cs = new CachedSegment<{ id: number }>({ segmentSize: 4 })
      cs.push({ id: 1 })
      cs.push({ id: 2 })
      expect(cs.size).toBe(2)
      expect(cs.get(0)).toEqual({ id: 1 })
    })

    it('should push null values', () => {
      const cs = new CachedSegment<number | null>({ segmentSize: 4 })
      cs.push(null)
      expect(cs.get(0)).toBe(null)
    })

    it('should push undefined values', () => {
      const cs = new CachedSegment<number | undefined>({ segmentSize: 4 })
      cs.push(undefined)
      expect(cs.get(0)).toBe(undefined)
    })

    it('should push many elements across many segments', () => {
      const cs = new CachedSegment<number>({ segmentSize: 3 })
      for (let i = 0; i < 100; i++) {
        cs.push(i)
      }
      expect(cs.size).toBe(100)
      expect(cs.segmentCount()).toBe(34)
    })
  })

  describe('get', () => {
    it('should get element at index 0', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(10)
      cs.push(20)
      expect(cs.get(0)).toBe(10)
    })

    it('should get element at last index', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(10)
      cs.push(20)
      cs.push(30)
      expect(cs.get(2)).toBe(30)
    })

    it('should get element across segments', () => {
      const cs = new CachedSegment<number>({ segmentSize: 2 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      cs.push(4)
      cs.push(5)
      expect(cs.get(0)).toBe(1)
      expect(cs.get(2)).toBe(3)
      expect(cs.get(4)).toBe(5)
    })

    it('should throw on index out of bounds (negative)', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      expect(() => cs.get(-1)).toThrow(RangeError)
    })

    it('should throw on index out of bounds (too large)', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      expect(() => cs.get(1)).toThrow(RangeError)
    })

    it('should throw on empty structure', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      expect(() => cs.get(0)).toThrow(RangeError)
    })

    it('should record cache miss on first access', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.flush()
      cs.get(0)
      expect(cs.cacheMisses()).toBe(1)
      expect(cs.cacheHits()).toBe(0)
    })

    it('should record cache hit on repeated access', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.flush()
      cs.get(0)
      cs.get(0)
      expect(cs.cacheHits()).toBe(1)
    })

    it('should increment reads stat', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.flush()
      cs.get(0)
      expect(cs.getStatistics().reads).toBe(1)
    })

    it('should get all elements in sequence', () => {
      const cs = new CachedSegment<number>({ segmentSize: 3 })
      for (let i = 0; i < 10; i++) {
        cs.push(i)
      }
      for (let i = 0; i < 10; i++) {
        expect(cs.get(i)).toBe(i)
      }
    })
  })

  describe('set', () => {
    it('should set element at index 0', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.set(0, 99)
      expect(cs.get(0)).toBe(99)
    })

    it('should set element at middle index', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      cs.set(1, 99)
      expect(cs.get(1)).toBe(99)
      expect(cs.get(0)).toBe(1)
      expect(cs.get(2)).toBe(3)
    })

    it('should set element across segments', () => {
      const cs = new CachedSegment<number>({ segmentSize: 2 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      cs.push(4)
      cs.set(2, 99)
      expect(cs.get(2)).toBe(99)
    })

    it('should throw on index out of bounds (negative)', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      expect(() => cs.set(-1, 99)).toThrow(RangeError)
    })

    it('should throw on index out of bounds (too large)', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      expect(() => cs.set(1, 99)).toThrow(RangeError)
    })

    it('should increment writes stat', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.set(0, 99)
      expect(cs.getStatistics().writes).toBe(2)
    })

    it('should allow setting same index multiple times', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.set(0, 10)
      cs.set(0, 20)
      cs.set(0, 30)
      expect(cs.get(0)).toBe(30)
    })

    it('should not affect other elements when setting', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      cs.set(1, 99)
      expect(cs.get(0)).toBe(1)
      expect(cs.get(2)).toBe(3)
    })
  })

  describe('pop', () => {
    it('should pop from single element', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(42)
      expect(cs.pop()).toBe(42)
      expect(cs.size).toBe(0)
    })

    it('should pop from multiple elements', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      expect(cs.pop()).toBe(3)
      expect(cs.pop()).toBe(2)
      expect(cs.pop()).toBe(1)
    })

    it('should return undefined on empty', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      expect(cs.pop()).toBe(undefined)
    })

    it('should handle popping across segment boundaries', () => {
      const cs = new CachedSegment<number>({ segmentSize: 2 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      expect(cs.pop()).toBe(3)
      expect(cs.segmentCount()).toBe(1)
      expect(cs.size).toBe(2)
    })

    it('should remove empty segments after pop', () => {
      const cs = new CachedSegment<number>({ segmentSize: 2 })
      cs.push(1)
      cs.push(2)
      expect(cs.segmentCount()).toBe(1)
      expect(cs.pop()).toBe(2)
      expect(cs.pop()).toBe(1)
      expect(cs.segmentCount()).toBe(0)
    })

    it('should record cache stats on pop', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.flush()
      cs.pop()
      expect(cs.getStatistics().reads).toBe(1)
    })

    it('should pop all elements', () => {
      const cs = new CachedSegment<number>({ segmentSize: 3 })
      for (let i = 0; i < 10; i++) {
        cs.push(i)
      }
      for (let i = 9; i >= 0; i--) {
        expect(cs.pop()).toBe(i)
      }
      expect(cs.size).toBe(0)
      expect(cs.isEmpty()).toBe(true)
    })
  })

  describe('size and isEmpty', () => {
    it('should report size 0 when empty', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      expect(cs.size).toBe(0)
    })

    it('should report isEmpty true when empty', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      expect(cs.isEmpty()).toBe(true)
    })

    it('should report isEmpty false after push', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      expect(cs.isEmpty()).toBe(false)
    })

    it('should report isEmpty true after popping all', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.pop()
      expect(cs.isEmpty()).toBe(true)
    })

    it('should track size correctly through pushes and pops', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      expect(cs.size).toBe(3)
      cs.pop()
      expect(cs.size).toBe(2)
      cs.push(4)
      expect(cs.size).toBe(3)
    })
  })

  describe('clear', () => {
    it('should clear all data', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      cs.clear()
      expect(cs.size).toBe(0)
      expect(cs.isEmpty()).toBe(true)
    })

    it('should clear segments', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      cs.clear()
      expect(cs.segmentCount()).toBe(0)
    })

    it('should clear cache', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.push(2)
      cs.clear()
      expect(cs.cacheSize()).toBe(0)
    })

    it('should reset statistics', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.flush()
      cs.push(2)
      cs.clear()
      const stats = cs.getStatistics()
      expect(stats.reads).toBe(0)
      expect(stats.writes).toBe(0)
      expect(stats.cacheHits).toBe(0)
      expect(stats.cacheMisses).toBe(0)
      expect(stats.evictions).toBe(0)
      expect(stats.flushes).toBe(0)
      expect(stats.segmentsLoaded).toBe(0)
    })

    it('should be safe to clear empty structure', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.clear()
      expect(cs.size).toBe(0)
      expect(cs.isEmpty()).toBe(true)
    })

    it('should allow operations after clear', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.clear()
      cs.push(2)
      expect(cs.size).toBe(1)
      expect(cs.get(0)).toBe(2)
    })
  })

  describe('flush', () => {
    it('should clear the cache', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.push(2)
      cs.flush()
      expect(cs.cacheSize()).toBe(0)
    })

    it('should not clear data', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.push(2)
      cs.flush()
      expect(cs.size).toBe(2)
      expect(cs.segmentCount()).toBe(1)
    })

    it('should increment flushes stat', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.flush()
      cs.flush()
      cs.flush()
      expect(cs.getStatistics().flushes).toBe(3)
    })

    it('should allow access after flush (reload from backing store)', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.push(2)
      cs.flush()
      expect(cs.get(0)).toBe(1)
      expect(cs.get(1)).toBe(2)
    })

    it('should record cache miss after flush', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.flush()
      cs.get(0)
      expect(cs.cacheMisses()).toBe(1)
    })
  })

  describe('cacheSize', () => {
    it('should return 0 for new structure', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      expect(cs.cacheSize()).toBe(0)
    })

    it('should reflect cached segments after push', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      expect(cs.cacheSize()).toBe(1)
    })

    it('should reflect multiple segments', () => {
      const cs = new CachedSegment<number>({ segmentSize: 2 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      cs.push(4)
      cs.push(5)
      expect(cs.cacheSize()).toBe(3)
    })

    it('should decrease after flush', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.push(2)
      cs.flush()
      expect(cs.cacheSize()).toBe(0)
    })

    it('should respect cache capacity', () => {
      const cs = new CachedSegment<number>({ segmentSize: 2, cacheCapacity: 2 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      cs.push(4)
      cs.push(5)
      cs.push(6)
      expect(cs.cacheSize()).toBeLessThanOrEqual(2)
    })
  })

  describe('cacheHitRate', () => {
    it('should return 0 with no accesses', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      expect(cs.cacheHitRate()).toBe(0)
    })

    it('should return 0 with only misses', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.flush()
      cs.get(0)
      expect(cs.cacheHitRate()).toBe(0)
    })

    it('should return 1 with only hits', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.get(0)
      cs.get(0)
      expect(cs.cacheHitRate()).toBe(1)
    })

    it('should calculate rate correctly', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.push(2)
      cs.flush()
      cs.get(0)
      cs.get(0)
      expect(cs.cacheHitRate()).toBeCloseTo(0.5)
    })

    it('should handle many accesses', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      for (let i = 0; i < 10; i++) {
        cs.push(i)
      }
      cs.flush()
      cs.get(0)
      cs.get(0)
      cs.get(0)
      cs.get(1)
      cs.get(1)
      const hits = cs.cacheHits()
      const misses = cs.cacheMisses()
      expect(cs.cacheHitRate()).toBeCloseTo(hits / (hits + misses))
    })
  })

  describe('cacheMisses and cacheHits', () => {
    it('should track misses', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.flush()
      cs.get(0)
      expect(cs.cacheMisses()).toBe(1)
    })

    it('should track hits', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.flush()
      cs.get(0)
      cs.get(0)
      expect(cs.cacheHits()).toBe(1)
    })

    it('should reset after clear', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.flush()
      cs.get(0)
      cs.clear()
      expect(cs.cacheHits()).toBe(0)
      expect(cs.cacheMisses()).toBe(0)
    })
  })

  describe('segmentCount', () => {
    it('should return 0 for empty', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      expect(cs.segmentCount()).toBe(0)
    })

    it('should return 1 for partial segment', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.push(2)
      expect(cs.segmentCount()).toBe(1)
    })

    it('should return correct count for full segments', () => {
      const cs = new CachedSegment<number>({ segmentSize: 2 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      cs.push(4)
      expect(cs.segmentCount()).toBe(2)
    })

    it('should return correct count for mixed', () => {
      const cs = new CachedSegment<number>({ segmentSize: 2 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      expect(cs.segmentCount()).toBe(2)
    })

    it('should decrease when segments are emptied', () => {
      const cs = new CachedSegment<number>({ segmentSize: 2 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      cs.pop()
      expect(cs.segmentCount()).toBe(1)
    })

    it('should handle segment size 1', () => {
      const cs = new CachedSegment<number>({ segmentSize: 1 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      expect(cs.segmentCount()).toBe(3)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty structure', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      expect(cs.toArray()).toEqual([])
    })

    it('should return single element', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(42)
      expect(cs.toArray()).toEqual([42])
    })

    it('should return all elements in order', () => {
      const cs = new CachedSegment<number>({ segmentSize: 2 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      cs.push(4)
      cs.push(5)
      expect(cs.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should reflect modifications', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      cs.set(1, 99)
      expect(cs.toArray()).toEqual([1, 99, 3])
    })

    it('should reflect pops', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      cs.pop()
      expect(cs.toArray()).toEqual([1, 2])
    })
  })

  describe('forEach', () => {
    it('should not call callback on empty', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      const results: number[] = []
      cs.forEach((v) => results.push(v))
      expect(results).toEqual([])
    })

    it('should iterate all elements in order', () => {
      const cs = new CachedSegment<number>({ segmentSize: 2 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      cs.push(4)
      cs.push(5)
      const results: number[] = []
      cs.forEach((v) => results.push(v))
      expect(results).toEqual([1, 2, 3, 4, 5])
    })

    it('should provide correct indices', () => {
      const cs = new CachedSegment<number>({ segmentSize: 2 })
      cs.push(10)
      cs.push(20)
      cs.push(30)
      const indices: number[] = []
      cs.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should provide correct values and indices', () => {
      const cs = new CachedSegment<string>({ segmentSize: 3 })
      cs.push('a')
      cs.push('b')
      cs.push('c')
      const pairs: [string, number][] = []
      cs.forEach((v, i) => pairs.push([v, i]))
      expect(pairs).toEqual([['a', 0], ['b', 1], ['c', 2]])
    })
  })

  describe('Symbol.iterator', () => {
    it('should iterate empty structure', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      const result = [...cs]
      expect(result).toEqual([])
    })

    it('should iterate single element', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(42)
      expect([...cs]).toEqual([42])
    })

    it('should iterate multiple elements', () => {
      const cs = new CachedSegment<number>({ segmentSize: 2 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      cs.push(4)
      cs.push(5)
      expect([...cs]).toEqual([1, 2, 3, 4, 5])
    })

    it('should work with for...of', () => {
      const cs = new CachedSegment<number>({ segmentSize: 3 })
      cs.push(10)
      cs.push(20)
      cs.push(30)
      const sum = () => {
        let total = 0
        for (const v of cs) {
          total += v
        }
        return total
      }
      expect(sum()).toBe(60)
    })

    it('should work with spread in array literal', () => {
      const cs = new CachedSegment<number>({ segmentSize: 2 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      const arr = [0, ...cs, 4]
      expect(arr).toEqual([0, 1, 2, 3, 4])
    })
  })

  describe('getStatistics', () => {
    it('should return initial statistics', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      const stats = cs.getStatistics()
      expect(stats).toEqual({
        reads: 0,
        writes: 0,
        cacheHits: 0,
        cacheMisses: 0,
        evictions: 0,
        flushes: 0,
        segmentsLoaded: 0,
      })
    })

    it('should track reads', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.flush()
      cs.get(0)
      expect(cs.getStatistics().reads).toBe(1)
    })

    it('should track writes', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.set(0, 2)
      expect(cs.getStatistics().writes).toBe(2)
    })

    it('should track cache hits', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.flush()
      cs.get(0)
      cs.get(0)
      expect(cs.getStatistics().cacheHits).toBe(1)
    })

    it('should track cache misses', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.flush()
      cs.get(0)
      expect(cs.getStatistics().cacheMisses).toBe(1)
    })

    it('should track evictions', () => {
      const cs = new CachedSegment<number>({ segmentSize: 2, cacheCapacity: 2 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      cs.push(4)
      cs.push(5)
      cs.push(6)
      expect(cs.getStatistics().evictions).toBeGreaterThan(0)
    })

    it('should track flushes', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.flush()
      cs.flush()
      expect(cs.getStatistics().flushes).toBe(2)
    })

    it('should track segments loaded', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      cs.push(4)
      cs.flush()
      const before = cs.getStatistics().segmentsLoaded
      cs.get(0)
      expect(cs.getStatistics().segmentsLoaded).toBe(before + 1)
    })

    it('should return a copy', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      const stats1 = cs.getStatistics()
      stats1.reads = 999
      const stats2 = cs.getStatistics()
      expect(stats2.reads).toBe(0)
    })

    it('should track comprehensive workflow', () => {
      const cs = new CachedSegment<number>({ segmentSize: 2, cacheCapacity: 2 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      cs.flush()
      cs.get(0)
      cs.get(0)
      cs.get(2)
      const stats = cs.getStatistics()
      expect(stats.writes).toBe(3)
      expect(stats.flushes).toBe(1)
      expect(stats.reads).toBe(3)
      expect(stats.cacheHits).toBe(1)
      expect(stats.cacheMisses).toBe(2)
    })
  })

  describe('LRU eviction', () => {
    it('should evict LRU segment when cache is full', () => {
      const cs = new CachedSegment<number>({ segmentSize: 2, cacheCapacity: 2 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      cs.push(4)
      cs.push(5)
      cs.push(6)
      expect(cs.getStatistics().evictions).toBeGreaterThan(0)
    })

    it('should still access data after eviction', () => {
      const cs = new CachedSegment<number>({ segmentSize: 2, cacheCapacity: 2 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      cs.push(4)
      cs.push(5)
      cs.push(6)
      expect(cs.get(0)).toBe(1)
      expect(cs.get(1)).toBe(2)
      expect(cs.get(2)).toBe(3)
      expect(cs.get(3)).toBe(4)
      expect(cs.get(4)).toBe(5)
      expect(cs.get(5)).toBe(6)
    })

    it('should record miss when accessing evicted segment', () => {
      const cs = new CachedSegment<number>({ segmentSize: 2, cacheCapacity: 2 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      cs.push(4)
      cs.push(5)
      cs.push(6)
      cs.flush()
      const missesBefore = cs.cacheMisses()
      cs.get(0)
      cs.get(2)
      cs.get(4)
      expect(cs.cacheMisses()).toBe(missesBefore + 3)
    })

    it('should maintain cache within capacity', () => {
      const cs = new CachedSegment<number>({ segmentSize: 1, cacheCapacity: 3 })
      for (let i = 0; i < 20; i++) {
        cs.push(i)
      }
      expect(cs.cacheSize()).toBeLessThanOrEqual(3)
    })

    it('should track total evictions', () => {
      const cs = new CachedSegment<number>({ segmentSize: 1, cacheCapacity: 2 })
      for (let i = 0; i < 10; i++) {
        cs.push(i)
      }
      const stats = cs.getStatistics()
      expect(stats.evictions).toBeGreaterThan(0)
    })
  })

  describe('DEFAULT_CACHED_SEGMENT_OPTIONS', () => {
    it('should have segmentSize 64', () => {
      expect(DEFAULT_CACHED_SEGMENT_OPTIONS.segmentSize).toBe(64)
    })

    it('should have cacheCapacity 8', () => {
      expect(DEFAULT_CACHED_SEGMENT_OPTIONS.cacheCapacity).toBe(8)
    })
  })

  describe('type exports', () => {
    it('should export CachedSegmentStatistics type', () => {
      const stats: CachedSegmentStatistics = {
        reads: 0,
        writes: 0,
        cacheHits: 0,
        cacheMisses: 0,
        evictions: 0,
        flushes: 0,
        segmentsLoaded: 0,
      }
      expect(stats.reads).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('should handle segment size 1', () => {
      const cs = new CachedSegment<number>({ segmentSize: 1 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      expect(cs.get(0)).toBe(1)
      expect(cs.get(1)).toBe(2)
      expect(cs.get(2)).toBe(3)
      expect(cs.segmentCount()).toBe(3)
    })

    it('should handle cache capacity 1', () => {
      const cs = new CachedSegment<number>({ segmentSize: 2, cacheCapacity: 1 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      expect(cs.cacheSize()).toBeLessThanOrEqual(1)
      expect(cs.get(0)).toBe(1)
      expect(cs.get(2)).toBe(3)
    })

    it('should handle large number of elements', () => {
      const cs = new CachedSegment<number>({ segmentSize: 16, cacheCapacity: 4 })
      for (let i = 0; i < 1000; i++) {
        cs.push(i)
      }
      expect(cs.size).toBe(1000)
      expect(cs.get(0)).toBe(0)
      expect(cs.get(999)).toBe(999)
      expect(cs.get(500)).toBe(500)
    })

    it('should handle push-pop-push cycles', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.push(2)
      cs.pop()
      cs.push(3)
      cs.pop()
      cs.push(4)
      expect(cs.toArray()).toEqual([1, 4])
    })

    it('should handle mixed operations', () => {
      const cs = new CachedSegment<number>({ segmentSize: 2 })
      cs.push(10)
      cs.push(20)
      cs.push(30)
      cs.set(1, 25)
      expect(cs.get(1)).toBe(25)
      cs.pop()
      expect(cs.size).toBe(2)
      expect(cs.toArray()).toEqual([10, 25])
    })

    it('should work with boolean values', () => {
      const cs = new CachedSegment<boolean>({ segmentSize: 4 })
      cs.push(true)
      cs.push(false)
      cs.push(true)
      expect(cs.toArray()).toEqual([true, false, true])
    })

    it('should work with array values', () => {
      const cs = new CachedSegment<number[]>({ segmentSize: 4 })
      cs.push([1, 2])
      cs.push([3, 4])
      expect(cs.get(0)).toEqual([1, 2])
      expect(cs.get(1)).toEqual([3, 4])
    })

    it('should handle flush on empty cache', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.flush()
      expect(cs.getStatistics().flushes).toBe(1)
      expect(cs.cacheSize()).toBe(0)
    })

    it('should handle repeated flush', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.flush()
      cs.flush()
      cs.flush()
      expect(cs.getStatistics().flushes).toBe(3)
    })

    it('should maintain data integrity after many operations', () => {
      const cs = new CachedSegment<number>({ segmentSize: 3, cacheCapacity: 2 })
      for (let i = 0; i < 50; i++) {
        cs.push(i)
      }
      for (let i = 0; i < 50; i++) {
        expect(cs.get(i)).toBe(i)
      }
      expect(cs.toArray().length).toBe(50)
    })

    it('should handle clearing and reusing', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.push(2)
      cs.clear()
      cs.push(3)
      cs.push(4)
      cs.push(5)
      expect(cs.toArray()).toEqual([3, 4, 5])
    })
  })

  describe('cache behavior patterns', () => {
    it('should cache on push', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      expect(cs.cacheSize()).toBe(1)
    })

    it('should reuse cached segment on get', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.flush()
      cs.get(0)
      cs.get(0)
      expect(cs.cacheHits()).toBe(1)
    })

    it('should load segment on miss after flush', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.flush()
      const before = cs.getStatistics().segmentsLoaded
      cs.get(0)
      expect(cs.getStatistics().segmentsLoaded).toBe(before + 1)
    })

    it('should track segments loaded across multiple misses', () => {
      const cs = new CachedSegment<number>({ segmentSize: 2 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      cs.push(4)
      cs.flush()
      const before = cs.getStatistics().segmentsLoaded
      cs.get(0)
      cs.get(2)
      expect(cs.getStatistics().segmentsLoaded).toBe(before + 2)
    })

    it('should not count hits as segments loaded', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.push(2)
      cs.flush()
      const segmentsLoadedBefore = cs.getStatistics().segmentsLoaded
      cs.get(0)
      cs.get(0)
      cs.get(0)
      const stats = cs.getStatistics()
      expect(stats.cacheHits).toBe(2)
      expect(stats.segmentsLoaded).toBe(segmentsLoadedBefore + 1)
    })

    it('should handle get set and get pattern', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      expect(cs.get(1)).toBe(2)
      cs.set(1, 99)
      expect(cs.get(1)).toBe(99)
    })

    it('should evict correct LRU segment', () => {
      const cs = new CachedSegment<number>({ segmentSize: 1, cacheCapacity: 2 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      cs.flush()
      cs.get(0)
      cs.get(1)
      cs.get(2)
      expect(cs.get(0)).toBe(1)
    })
  })

  describe('statistical accuracy', () => {
    it('should accurately count reads from get and pop only', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      expect(cs.getStatistics().reads).toBe(0)
      cs.flush()
      cs.get(0)
      expect(cs.getStatistics().reads).toBe(1)
      cs.pop()
      expect(cs.getStatistics().reads).toBe(2)
    })

    it('should accurately count writes from push and set only', () => {
      const cs = new CachedSegment<number>({ segmentSize: 4 })
      cs.push(1)
      expect(cs.getStatistics().writes).toBe(1)
      cs.set(0, 99)
      expect(cs.getStatistics().writes).toBe(2)
    })

    it('should have reads equal to cacheHits + cacheMisses', () => {
      const cs = new CachedSegment<number>({ segmentSize: 2 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      cs.flush()
      cs.get(0)
      cs.get(0)
      cs.get(2)
      cs.pop()
      const stats = cs.getStatistics()
      expect(stats.reads).toBe(stats.cacheHits + stats.cacheMisses)
    })

    it('should track all statistics through complete workflow', () => {
      const cs = new CachedSegment<number>({ segmentSize: 2, cacheCapacity: 2 })
      cs.push(1)
      cs.push(2)
      cs.push(3)
      cs.push(4)
      cs.push(5)
      cs.flush()
      cs.get(0)
      cs.get(2)
      cs.get(4)
      cs.get(0)
      cs.set(2, 99)
      cs.pop()
      const stats = cs.getStatistics()
      expect(stats.writes).toBe(6)
      expect(stats.flushes).toBe(1)
      expect(stats.reads).toBeGreaterThan(0)
      expect(stats.cacheHits + stats.cacheMisses).toBe(stats.reads)
    })
  })
})
