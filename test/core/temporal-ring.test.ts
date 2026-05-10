import { describe, it, expect, beforeEach } from 'vitest'
import { TemporalRing } from '../../src/core/temporal-ring/temporal-ring.js'
import { DEFAULT_TEMPORAL_RING_OPTIONS } from '../../src/core/temporal-ring/temporal-ring.js'
import type { TemporalRingOptions, TemporalRingStatistics } from '../../src/core/temporal-ring/temporal-ring.js'

describe('TemporalRing', () => {
  let ring: TemporalRing<number>

  beforeEach(() => {
    ring = new TemporalRing<number>({ capacity: 5 })
  })

  describe('constructor', () => {
    it('should create ring with specified capacity', () => {
      const r = new TemporalRing<number>({ capacity: 10 })
      expect(r.capacity).toBe(10)
      expect(r.size).toBe(0)
      expect(r.isEmpty()).toBe(true)
    })

    it('should default capacity to 1024', () => {
      const r = new TemporalRing<number>()
      expect(r.capacity).toBe(1024)
    })

    it('should clamp capacity to at least 1', () => {
      const r = new TemporalRing<number>({ capacity: 0 })
      expect(r.capacity).toBe(1)
    })

    it('should clamp negative capacity to 1', () => {
      const r = new TemporalRing<number>({ capacity: -5 })
      expect(r.capacity).toBe(1)
    })

    it('should accept autoExpire option', () => {
      const r = new TemporalRing<number>({ autoExpire: true, ttlMs: 1000 })
      expect(r.capacity).toBe(1024)
    })

    it('should accept empty options object', () => {
      const r = new TemporalRing<number>({})
      expect(r.capacity).toBe(1024)
    })

    it('should work without options', () => {
      const r = new TemporalRing<number>()
      expect(r.capacity).toBe(1024)
      expect(r.size).toBe(0)
    })
  })

  describe('DEFAULT_TEMPORAL_RING_OPTIONS', () => {
    it('should have correct defaults', () => {
      expect(DEFAULT_TEMPORAL_RING_OPTIONS.capacity).toBe(1024)
      expect(DEFAULT_TEMPORAL_RING_OPTIONS.autoExpire).toBe(false)
      expect(DEFAULT_TEMPORAL_RING_OPTIONS.ttlMs).toBe(0)
    })

    it('should be a complete options object', () => {
      expect(DEFAULT_TEMPORAL_RING_OPTIONS).toEqual({
        capacity: 1024,
        autoExpire: false,
        ttlMs: 0,
      })
    })
  })

  describe('push', () => {
    it('should add element to ring', () => {
      ring.push(42, 1000)
      expect(ring.size).toBe(1)
      expect(ring.get(0)).toBe(42)
    })

    it('should use Date.now() when timestamp not provided', () => {
      const before = Date.now()
      ring.push(1)
      const after = Date.now()
      const oldest = ring.oldest()
      expect(oldest).toBe(1)
    })

    it('should add multiple elements maintaining order', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.push(3, 300)
      expect(ring.toArray()).toEqual([1, 2, 3])
    })

    it('should wrap around when capacity exceeded', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.push(3, 300)
      ring.push(4, 400)
      ring.push(5, 500)
      ring.push(6, 600)
      expect(ring.size).toBe(5)
      expect(ring.toArray()).toEqual([2, 3, 4, 5, 6])
    })

    it('should increment pushes statistic', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      expect(ring.getStatistics().pushes).toBe(2)
    })

    it('should update maxSeenSize', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.push(3, 300)
      expect(ring.getStatistics().maxSeenSize).toBe(3)
    })

    it('should track maxSeenSize through wrap-around', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.push(3, 300)
      ring.push(4, 400)
      ring.push(5, 500)
      ring.push(6, 600)
      expect(ring.getStatistics().maxSeenSize).toBe(5)
    })

    it('should handle single capacity ring', () => {
      const r = new TemporalRing<number>({ capacity: 1 })
      r.push(1, 100)
      r.push(2, 200)
      expect(r.size).toBe(1)
      expect(ring.get(0))
      expect(r.get(0)).toBe(2)
    })

    it('should work with string values', () => {
      const r = new TemporalRing<string>({ capacity: 3 })
      r.push('a', 100)
      r.push('b', 200)
      expect(r.toArray()).toEqual(['a', 'b'])
    })

    it('should work with object values', () => {
      const r = new TemporalRing<{ x: number }>({ capacity: 3 })
      r.push({ x: 1 }, 100)
      r.push({ x: 2 }, 200)
      expect(r.get(0)?.x).toBe(1)
      expect(r.get(1)?.x).toBe(2)
    })

    it('should handle many pushes over capacity', () => {
      const r = new TemporalRing<number>({ capacity: 3 })
      for (let i = 0; i < 100; i++) {
        r.push(i, i * 10)
      }
      expect(r.size).toBe(3)
      expect(r.toArray()).toEqual([97, 98, 99])
    })
  })

  describe('get', () => {
    it('should return element at valid index', () => {
      ring.push(10, 100)
      ring.push(20, 200)
      ring.push(30, 300)
      expect(ring.get(0)).toBe(10)
      expect(ring.get(1)).toBe(20)
      expect(ring.get(2)).toBe(30)
    })

    it('should return undefined for negative index', () => {
      ring.push(1, 100)
      expect(ring.get(-1)).toBeUndefined()
    })

    it('should return undefined for out-of-bounds index', () => {
      ring.push(1, 100)
      expect(ring.get(5)).toBeUndefined()
    })

    it('should return undefined when ring is empty', () => {
      expect(ring.get(0)).toBeUndefined()
    })

    it('should increment queries statistic', () => {
      ring.push(1, 100)
      ring.get(0)
      ring.get(0)
      expect(ring.getStatistics().queries).toBe(2)
    })

    it('should handle index after wrap-around', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.push(3, 300)
      ring.push(4, 400)
      ring.push(5, 500)
      ring.push(6, 600)
      expect(ring.get(0)).toBe(2)
      expect(ring.get(4)).toBe(6)
    })
  })

  describe('getRecent', () => {
    it('should return elements within window', () => {
      ring.push(1, 1000)
      ring.push(2, 2000)
      ring.push(3, 3000)
      ring.push(4, 4000)
      ring.push(5, 5000)
      expect(ring.getRecent(1500, 5000)).toEqual([4, 5])
    })

    it('should return all elements if window covers all', () => {
      ring.push(1, 1000)
      ring.push(2, 2000)
      ring.push(3, 3000)
      expect(ring.getRecent(5000, 3000)).toEqual([1, 2, 3])
    })

    it('should return empty array if no elements in window', () => {
      ring.push(1, 1000)
      ring.push(2, 2000)
      expect(ring.getRecent(100, 5000)).toEqual([])
    })

    it('should return empty array for empty ring', () => {
      expect(ring.getRecent(1000)).toEqual([])
    })

    it('should use Date.now() when now not provided', () => {
      ring.push(1)
      const result = ring.getRecent(60000)
      expect(result).toEqual([1])
    })

    it('should include elements exactly at cutoff boundary', () => {
      ring.push(1, 1000)
      ring.push(2, 2000)
      ring.push(3, 3000)
      const result = ring.getRecent(2000, 3000)
      expect(result).toEqual([1, 2, 3])
    })

    it('should increment queries statistic', () => {
      ring.push(1, 1000)
      ring.getRecent(500, 1000)
      expect(ring.getStatistics().queries).toBe(1)
    })

    it('should handle single element in window', () => {
      ring.push(1, 1000)
      ring.push(2, 2000)
      ring.push(3, 3000)
      expect(ring.getRecent(500, 3000)).toEqual([3])
    })
  })

  describe('expireOlderThan', () => {
    it('should remove elements older than timestamp', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.push(3, 300)
      ring.push(4, 400)
      const count = ring.expireOlderThan(300)
      expect(count).toBe(2)
      expect(ring.toArray()).toEqual([3, 4])
    })

    it('should return 0 if no elements to expire', () => {
      ring.push(1, 300)
      ring.push(2, 400)
      const count = ring.expireOlderThan(100)
      expect(count).toBe(0)
      expect(ring.size).toBe(2)
    })

    it('should handle expiring all elements', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      const count = ring.expireOlderThan(500)
      expect(count).toBe(2)
      expect(ring.isEmpty()).toBe(true)
    })

    it('should handle empty ring', () => {
      const count = ring.expireOlderThan(1000)
      expect(count).toBe(0)
    })

    it('should update statistics', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.push(3, 300)
      ring.expireOlderThan(250)
      const stats = ring.getStatistics()
      expect(stats.expirations).toBe(1)
      expect(stats.totalExpired).toBe(2)
    })

    it('should not count as expiration if nothing removed', () => {
      ring.push(1, 500)
      ring.expireOlderThan(100)
      const stats = ring.getStatistics()
      expect(stats.expirations).toBe(0)
      expect(stats.totalExpired).toBe(0)
    })

    it('should stop at first non-expired element', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.push(3, 300)
      ring.push(4, 400)
      ring.expireOlderThan(350)
      expect(ring.toArray()).toEqual([4])
    })

    it('should not remove elements when timestamps equal to cutoff', () => {
      ring.push(1, 200)
      ring.push(2, 300)
      ring.expireOlderThan(200)
      expect(ring.size).toBe(2)
    })

    it('should handle multiple expiration calls', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.push(3, 300)
      ring.expireOlderThan(150)
      expect(ring.size).toBe(2)
      ring.expireOlderThan(250)
      expect(ring.size).toBe(1)
      const stats = ring.getStatistics()
      expect(stats.expirations).toBe(2)
      expect(stats.totalExpired).toBe(2)
    })
  })

  describe('autoExpire', () => {
    it('should auto-expire on push when enabled', () => {
      const r = new TemporalRing<number>({ capacity: 10, autoExpire: true, ttlMs: 200 })
      r.push(1, 100)
      r.push(2, 200)
      r.push(3, 300)
      r.push(4, 400)
      r.push(5, 500)
      expect(r.toArray()).toEqual([3, 4, 5])
    })

    it('should not auto-expire when disabled', () => {
      const r = new TemporalRing<number>({ capacity: 10, autoExpire: false, ttlMs: 200 })
      r.push(1, 100)
      r.push(2, 200)
      r.push(3, 300)
      expect(r.size).toBe(3)
    })

    it('should auto-expire with ttlMs 0 as no-op', () => {
      const r = new TemporalRing<number>({ capacity: 10, autoExpire: true, ttlMs: 0 })
      r.push(1, 100)
      r.push(2, 200)
      expect(r.size).toBe(2)
    })

    it('should track expirations from auto-expire', () => {
      const r = new TemporalRing<number>({ capacity: 10, autoExpire: true, ttlMs: 100 })
      r.push(1, 100)
      r.push(2, 200)
      r.push(3, 300)
      const stats = r.getStatistics()
      expect(stats.totalExpired).toBeGreaterThan(0)
    })
  })

  describe('size', () => {
    it('should return 0 for empty ring', () => {
      expect(ring.size).toBe(0)
    })

    it('should return correct size after pushes', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      expect(ring.size).toBe(2)
    })

    it('should return capacity when full', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.push(3, 300)
      ring.push(4, 400)
      ring.push(5, 500)
      expect(ring.size).toBe(5)
    })

    it('should not exceed capacity', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.push(3, 300)
      ring.push(4, 400)
      ring.push(5, 500)
      ring.push(6, 600)
      expect(ring.size).toBe(5)
    })
  })

  describe('capacity', () => {
    it('should return configured capacity', () => {
      expect(ring.capacity).toBe(5)
    })

    it('should return 1 for minimum capacity', () => {
      const r = new TemporalRing<number>({ capacity: 1 })
      expect(r.capacity).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new ring', () => {
      expect(ring.isEmpty()).toBe(true)
    })

    it('should return false after push', () => {
      ring.push(1, 100)
      expect(ring.isEmpty()).toBe(false)
    })

    it('should return true after clear', () => {
      ring.push(1, 100)
      ring.clear()
      expect(ring.isEmpty()).toBe(true)
    })

    it('should return true after expiring all elements', () => {
      ring.push(1, 100)
      ring.expireOlderThan(500)
      expect(ring.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all elements', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.push(3, 300)
      ring.clear()
      expect(ring.size).toBe(0)
      expect(ring.isEmpty()).toBe(true)
      expect(ring.toArray()).toEqual([])
    })

    it('should work on already empty ring', () => {
      ring.clear()
      expect(ring.size).toBe(0)
    })

    it('should allow pushes after clear', () => {
      ring.push(1, 100)
      ring.clear()
      ring.push(2, 200)
      expect(ring.size).toBe(1)
      expect(ring.get(0)).toBe(2)
    })

    it('should not reset statistics', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.clear()
      const stats = ring.getStatistics()
      expect(stats.pushes).toBe(2)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty ring', () => {
      expect(ring.toArray()).toEqual([])
    })

    it('should return all elements in order', () => {
      ring.push(10, 100)
      ring.push(20, 200)
      ring.push(30, 300)
      expect(ring.toArray()).toEqual([10, 20, 30])
    })

    it('should return correct elements after wrap-around', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.push(3, 300)
      ring.push(4, 400)
      ring.push(5, 500)
      ring.push(6, 600)
      ring.push(7, 700)
      expect(ring.toArray()).toEqual([3, 4, 5, 6, 7])
    })
  })

  describe('forEach', () => {
    it('should iterate over all elements', () => {
      ring.push(10, 100)
      ring.push(20, 200)
      ring.push(30, 300)
      const result: number[] = []
      ring.forEach((value) => result.push(value))
      expect(result).toEqual([10, 20, 30])
    })

    it('should provide correct index', () => {
      ring.push(10, 100)
      ring.push(20, 200)
      const indices: number[] = []
      ring.forEach((_value, index) => indices.push(index))
      expect(indices).toEqual([0, 1])
    })

    it('should provide timestamp', () => {
      ring.push(10, 100)
      ring.push(20, 200)
      const timestamps: number[] = []
      ring.forEach((_value, _index, timestamp) => timestamps.push(timestamp))
      expect(timestamps).toEqual([100, 200])
    })

    it('should not iterate over empty ring', () => {
      let called = false
      ring.forEach(() => { called = true })
      expect(called).toBe(false)
    })

    it('should iterate after wrap-around', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.push(3, 300)
      ring.push(4, 400)
      ring.push(5, 500)
      ring.push(6, 600)
      const result: number[] = []
      ring.forEach((value) => result.push(value))
      expect(result).toEqual([2, 3, 4, 5, 6])
    })
  })

  describe('Symbol.iterator', () => {
    it('should be iterable', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.push(3, 300)
      const result = [...ring]
      expect(result).toEqual([1, 2, 3])
    })

    it('should work with for-of loop', () => {
      ring.push(10, 100)
      ring.push(20, 200)
      const sum: number[] = []
      for (const val of ring) {
        sum.push(val)
      }
      expect(sum).toEqual([10, 20])
    })

    it('should produce empty array for empty ring', () => {
      expect([...ring]).toEqual([])
    })

    it('should work after wrap-around', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.push(3, 300)
      ring.push(4, 400)
      ring.push(5, 500)
      ring.push(6, 600)
      expect([...ring]).toEqual([2, 3, 4, 5, 6])
    })
  })

  describe('oldest', () => {
    it('should return the first element', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.push(3, 300)
      expect(ring.oldest()).toBe(1)
    })

    it('should return undefined for empty ring', () => {
      expect(ring.oldest()).toBeUndefined()
    })

    it('should update after wrap-around', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.push(3, 300)
      ring.push(4, 400)
      ring.push(5, 500)
      ring.push(6, 600)
      expect(ring.oldest()).toBe(2)
    })

    it('should increment queries statistic', () => {
      ring.push(1, 100)
      ring.oldest()
      expect(ring.getStatistics().queries).toBe(1)
    })
  })

  describe('newest', () => {
    it('should return the last element', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.push(3, 300)
      expect(ring.newest()).toBe(3)
    })

    it('should return undefined for empty ring', () => {
      expect(ring.newest()).toBeUndefined()
    })

    it('should update after wrap-around', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.push(3, 300)
      ring.push(4, 400)
      ring.push(5, 500)
      ring.push(6, 600)
      expect(ring.newest()).toBe(6)
    })

    it('should return same element for single element ring', () => {
      ring.push(42, 100)
      expect(ring.oldest()).toBe(42)
      expect(ring.newest()).toBe(42)
    })

    it('should increment queries statistic', () => {
      ring.push(1, 100)
      ring.newest()
      expect(ring.getStatistics().queries).toBe(1)
    })
  })

  describe('timeSpan', () => {
    it('should return time difference between oldest and newest', () => {
      ring.push(1, 100)
      ring.push(2, 500)
      expect(ring.timeSpan()).toBe(400)
    })

    it('should return 0 for empty ring', () => {
      expect(ring.timeSpan()).toBe(0)
    })

    it('should return 0 for single element ring', () => {
      ring.push(1, 100)
      expect(ring.timeSpan()).toBe(0)
    })

    it('should handle large time spans', () => {
      ring.push(1, 0)
      ring.push(2, 1000000)
      expect(ring.timeSpan()).toBe(1000000)
    })

    it('should increment queries statistic', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.timeSpan()
      expect(ring.getStatistics().queries).toBe(1)
    })

    it('should work after wrap-around', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.push(3, 300)
      ring.push(4, 400)
      ring.push(5, 500)
      ring.push(6, 600)
      expect(ring.timeSpan()).toBe(400)
    })
  })

  describe('getInRange', () => {
    beforeEach(() => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.push(3, 300)
      ring.push(4, 400)
      ring.push(5, 500)
    })

    it('should return elements in time range inclusive', () => {
      expect(ring.getInRange(200, 400)).toEqual([2, 3, 4])
    })

    it('should return single element for exact match', () => {
      expect(ring.getInRange(300, 300)).toEqual([3])
    })

    it('should return empty array for range with no matches', () => {
      expect(ring.getInRange(600, 700)).toEqual([])
    })

    it('should return all elements for full range', () => {
      expect(ring.getInRange(0, 1000)).toEqual([1, 2, 3, 4, 5])
    })

    it('should include start boundary', () => {
      expect(ring.getInRange(100, 100)).toEqual([1])
    })

    it('should include end boundary', () => {
      expect(ring.getInRange(500, 500)).toEqual([5])
    })

    it('should increment queries statistic', () => {
      ring.getInRange(100, 300)
      expect(ring.getStatistics().queries).toBe(1)
    })

    it('should work on empty ring', () => {
      ring.clear()
      expect(ring.getInRange(0, 1000)).toEqual([])
    })
  })

  describe('countInRange', () => {
    beforeEach(() => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.push(3, 300)
      ring.push(4, 400)
      ring.push(5, 500)
    })

    it('should count elements in range', () => {
      expect(ring.countInRange(200, 400)).toBe(3)
    })

    it('should return 0 for range with no matches', () => {
      expect(ring.countInRange(600, 700)).toBe(0)
    })

    it('should count all elements for full range', () => {
      expect(ring.countInRange(0, 1000)).toBe(5)
    })

    it('should count single element for exact match', () => {
      expect(ring.countInRange(300, 300)).toBe(1)
    })

    it('should increment queries statistic', () => {
      ring.countInRange(100, 300)
      expect(ring.getStatistics().queries).toBe(1)
    })

    it('should return 0 for empty ring', () => {
      ring.clear()
      expect(ring.countInRange(0, 1000)).toBe(0)
    })
  })

  describe('getStatistics', () => {
    it('should return initial statistics', () => {
      const stats = ring.getStatistics()
      expect(stats.pushes).toBe(0)
      expect(stats.expirations).toBe(0)
      expect(stats.queries).toBe(0)
      expect(stats.totalExpired).toBe(0)
      expect(stats.maxSeenSize).toBe(0)
    })

    it('should track pushes', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      expect(ring.getStatistics().pushes).toBe(2)
    })

    it('should track expirations', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.push(3, 300)
      ring.expireOlderThan(250)
      expect(ring.getStatistics().expirations).toBe(1)
      expect(ring.getStatistics().totalExpired).toBe(2)
    })

    it('should track queries from get', () => {
      ring.push(1, 100)
      ring.get(0)
      expect(ring.getStatistics().queries).toBe(1)
    })

    it('should track queries from oldest', () => {
      ring.push(1, 100)
      ring.oldest()
      expect(ring.getStatistics().queries).toBe(1)
    })

    it('should track queries from newest', () => {
      ring.push(1, 100)
      ring.newest()
      expect(ring.getStatistics().queries).toBe(1)
    })

    it('should track queries from timeSpan', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.timeSpan()
      expect(ring.getStatistics().queries).toBe(1)
    })

    it('should track queries from getRecent', () => {
      ring.push(1, 100)
      ring.getRecent(1000, 200)
      expect(ring.getStatistics().queries).toBe(1)
    })

    it('should track queries from getInRange', () => {
      ring.push(1, 100)
      ring.getInRange(0, 1000)
      expect(ring.getStatistics().queries).toBe(1)
    })

    it('should track queries from countInRange', () => {
      ring.push(1, 100)
      ring.countInRange(0, 1000)
      expect(ring.getStatistics().queries).toBe(1)
    })

    it('should return a copy of statistics', () => {
      ring.push(1, 100)
      const stats1 = ring.getStatistics()
      ring.push(2, 200)
      expect(stats1.pushes).toBe(1)
      expect(ring.getStatistics().pushes).toBe(2)
    })

    it('should track maxSeenSize correctly', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.push(3, 300)
      ring.clear()
      ring.push(4, 400)
      expect(ring.getStatistics().maxSeenSize).toBe(3)
    })
  })

  describe('combined operations', () => {
    it('should handle push then expire then push', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.push(3, 300)
      ring.expireOlderThan(250)
      ring.push(4, 400)
      expect(ring.toArray()).toEqual([3, 4])
      expect(ring.size).toBe(2)
    })

    it('should handle clear then re-fill', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.clear()
      ring.push(3, 300)
      ring.push(4, 400)
      ring.push(5, 500)
      expect(ring.toArray()).toEqual([3, 4, 5])
    })

    it('should handle full ring with expiration', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.push(3, 300)
      ring.push(4, 400)
      ring.push(5, 500)
      ring.expireOlderThan(300)
      expect(ring.size).toBe(3)
      ring.push(6, 600)
      ring.push(7, 700)
      expect(ring.toArray()).toEqual([3, 4, 5, 6, 7])
    })

    it('should handle repeated wrap-around', () => {
      const r = new TemporalRing<number>({ capacity: 3 })
      for (let i = 0; i < 20; i++) {
        r.push(i, i * 100)
      }
      expect(r.size).toBe(3)
      expect(r.toArray()).toEqual([17, 18, 19])
    })

    it('should handle expire all then push', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.expireOlderThan(1000)
      expect(ring.isEmpty()).toBe(true)
      ring.push(3, 3000)
      expect(ring.size).toBe(1)
      expect(ring.get(0)).toBe(3)
    })

    it('should maintain time ordering after operations', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.push(3, 300)
      ring.expireOlderThan(150)
      ring.push(4, 400)
      expect(ring.oldest()).toBe(2)
      expect(ring.newest()).toBe(4)
      expect(ring.timeSpan()).toBe(200)
    })
  })

  describe('edge cases', () => {
    it('should handle capacity 1', () => {
      const r = new TemporalRing<number>({ capacity: 1 })
      r.push(1, 100)
      expect(r.size).toBe(1)
      r.push(2, 200)
      expect(r.size).toBe(1)
      expect(r.get(0)).toBe(2)
      expect(r.oldest()).toBe(2)
      expect(r.newest()).toBe(2)
    })

    it('should handle capacity 1 with expire', () => {
      const r = new TemporalRing<number>({ capacity: 1 })
      r.push(1, 100)
      r.expireOlderThan(200)
      expect(r.isEmpty()).toBe(true)
    })

    it('should handle capacity 1 with wrap-around then expire', () => {
      const r = new TemporalRing<number>({ capacity: 1 })
      r.push(1, 100)
      r.push(2, 200)
      r.expireOlderThan(150)
      expect(r.size).toBe(1)
      expect(r.get(0)).toBe(2)
    })

    it('should handle pushing with same timestamp', () => {
      ring.push(1, 100)
      ring.push(2, 100)
      ring.push(3, 100)
      expect(ring.toArray()).toEqual([1, 2, 3])
      expect(ring.timeSpan()).toBe(0)
    })

    it('should handle getRecent with zero window', () => {
      ring.push(1, 1000)
      expect(ring.getRecent(0, 1000)).toEqual([1])
    })

    it('should handle expireOlderThan with timestamp equal to oldest', () => {
      ring.push(1, 100)
      ring.push(2, 200)
      ring.expireOlderThan(100)
      expect(ring.size).toBe(2)
    })

    it('should handle forEach with no unused variables', () => {
      ring.push(1, 100)
      let sum = 0
      ring.forEach((v) => { sum += v })
      expect(sum).toBe(1)
    })

    it('should handle large number of pushes', () => {
      const r = new TemporalRing<number>({ capacity: 100 })
      for (let i = 0; i < 10000; i++) {
        r.push(i, i)
      }
      expect(r.size).toBe(100)
      expect(r.getStatistics().pushes).toBe(10000)
      expect(r.getStatistics().maxSeenSize).toBe(100)
    })

    it('should handle null values in generic type', () => {
      const r = new TemporalRing<number | null>({ capacity: 5 })
      r.push(null, 100)
      r.push(2, 200)
      expect(r.get(0)).toBeNull()
      expect(r.get(1)).toBe(2)
    })

    it('should handle undefined values in generic type', () => {
      const r = new TemporalRing<number | undefined>({ capacity: 5 })
      r.push(undefined, 100)
      r.push(2, 200)
      expect(r.get(0)).toBeUndefined()
      expect(r.get(1)).toBe(2)
    })
  })

  describe('type exports', () => {
    it('should export TemporalRingOptions type', () => {
      const opts: TemporalRingOptions = { capacity: 10, autoExpire: true, ttlMs: 500 }
      const r = new TemporalRing<number>(opts)
      expect(r.capacity).toBe(10)
    })

    it('should export TemporalRingStatistics type', () => {
      ring.push(1, 100)
      const stats: TemporalRingStatistics = ring.getStatistics()
      expect(stats.pushes).toBe(1)
    })
  })
})
