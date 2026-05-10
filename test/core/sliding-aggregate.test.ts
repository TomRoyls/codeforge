import { describe, it, expect } from 'vitest'
import { SlidingAggregate } from '../../src/core/sliding-aggregate/sliding-aggregate.js'
import { DEFAULT_SLIDING_AGGREGATE_OPTIONS } from '../../src/core/sliding-aggregate/types.js'
import type { SlidingAggregateOptions, SlidingAggregateStatistics } from '../../src/core/sliding-aggregate/types.js'

describe('SlidingAggregate', () => {
  describe('constructor', () => {
    it('creates instance with default options', () => {
      const sa = new SlidingAggregate()
      expect(sa.size).toBe(0)
      expect(sa.windowSize).toBe(DEFAULT_SLIDING_AGGREGATE_OPTIONS.windowSize)
    })

    it('creates instance with custom windowSize', () => {
      const sa = new SlidingAggregate({ windowSize: 5 })
      expect(sa.windowSize).toBe(5)
    })

    it('creates instance with custom aggregateFn', () => {
      const sa = new SlidingAggregate({ aggregateFn: 'avg' })
      expect(sa.size).toBe(0)
    })

    it('creates instance with all options', () => {
      const sa = new SlidingAggregate({ windowSize: 3, aggregateFn: 'max' })
      expect(sa.windowSize).toBe(3)
    })

    it('creates instance with empty options object', () => {
      const sa = new SlidingAggregate({})
      expect(sa.windowSize).toBe(DEFAULT_SLIDING_AGGREGATE_OPTIONS.windowSize)
    })

    it('throws RangeError for windowSize 0', () => {
      expect(() => new SlidingAggregate({ windowSize: 0 })).toThrow(RangeError)
    })

    it('throws RangeError for negative windowSize', () => {
      expect(() => new SlidingAggregate({ windowSize: -1 })).toThrow(RangeError)
    })

    it('throws RangeError for fractional windowSize', () => {
      expect(() => new SlidingAggregate({ windowSize: 1.5 })).toThrow(RangeError)
    })

    it('throws RangeError for NaN windowSize', () => {
      expect(() => new SlidingAggregate({ windowSize: NaN })).toThrow(RangeError)
    })

    it('throws RangeError for Infinity windowSize', () => {
      expect(() => new SlidingAggregate({ windowSize: Infinity })).toThrow(RangeError)
    })

    it('accepts windowSize of 1', () => {
      const sa = new SlidingAggregate({ windowSize: 1 })
      expect(sa.windowSize).toBe(1)
    })

    it('accepts large windowSize', () => {
      const sa = new SlidingAggregate({ windowSize: 10000 })
      expect(sa.windowSize).toBe(10000)
    })
  })

  describe('push', () => {
    it('adds a value to empty window', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(10)
      expect(sa.size).toBe(1)
    })

    it('adds multiple values up to capacity', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(1)
      sa.push(2)
      sa.push(3)
      expect(sa.size).toBe(3)
    })

    it('evicts oldest when over capacity', () => {
      const sa = new SlidingAggregate({ windowSize: 2 })
      sa.push(1)
      sa.push(2)
      sa.push(3)
      expect(sa.toArray()).toEqual([2, 3])
    })

    it('maintains correct window after many pushes', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      for (let i = 1; i <= 10; i++) sa.push(i)
      expect(sa.toArray()).toEqual([8, 9, 10])
    })

    it('handles single element window', () => {
      const sa = new SlidingAggregate({ windowSize: 1 })
      sa.push(5)
      sa.push(10)
      expect(sa.toArray()).toEqual([10])
    })

    it('handles zero values', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(0)
      sa.push(0)
      sa.push(0)
      expect(sa.getSum()).toBe(0)
    })

    it('handles negative values', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(-1)
      sa.push(-5)
      sa.push(-3)
      expect(sa.getSum()).toBe(-9)
    })

    it('handles mixed positive and negative values', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(-10)
      sa.push(5)
      sa.push(3)
      expect(sa.getSum()).toBe(-2)
    })

    it('handles floating point values', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(1.5)
      sa.push(2.5)
      sa.push(3.0)
      expect(sa.getSum()).toBeCloseTo(7.0)
    })

    it('updates valuesAdded counter', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(1)
      sa.push(2)
      sa.push(3)
      expect(sa.getStatistics().valuesAdded).toBe(3)
    })

    it('updates valuesEvicted counter', () => {
      const sa = new SlidingAggregate({ windowSize: 2 })
      sa.push(1)
      sa.push(2)
      sa.push(3)
      expect(sa.getStatistics().valuesEvicted).toBe(1)
    })

    it('updates valuesEvicted for multiple evictions', () => {
      const sa = new SlidingAggregate({ windowSize: 2 })
      for (let i = 0; i < 10; i++) sa.push(i)
      expect(sa.getStatistics().valuesEvicted).toBe(8)
    })
  })

  describe('getAggregate', () => {
    it('returns 0 when empty (default sum)', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      expect(sa.getAggregate()).toBe(0)
    })

    it('returns sum by default', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(1)
      sa.push(2)
      sa.push(3)
      expect(sa.getAggregate()).toBe(6)
    })

    it('returns sum when aggregateFn is sum', () => {
      const sa = new SlidingAggregate({ windowSize: 3, aggregateFn: 'sum' })
      sa.push(10)
      sa.push(20)
      expect(sa.getAggregate()).toBe(30)
    })

    it('returns avg when aggregateFn is avg', () => {
      const sa = new SlidingAggregate({ windowSize: 3, aggregateFn: 'avg' })
      sa.push(10)
      sa.push(20)
      sa.push(30)
      expect(sa.getAggregate()).toBe(20)
    })

    it('returns undefined for avg on empty window', () => {
      const sa = new SlidingAggregate({ windowSize: 3, aggregateFn: 'avg' })
      expect(sa.getAggregate()).toBeUndefined()
    })

    it('returns min when aggregateFn is min', () => {
      const sa = new SlidingAggregate({ windowSize: 3, aggregateFn: 'min' })
      sa.push(5)
      sa.push(2)
      sa.push(8)
      expect(sa.getAggregate()).toBe(2)
    })

    it('returns undefined for min on empty window', () => {
      const sa = new SlidingAggregate({ windowSize: 3, aggregateFn: 'min' })
      expect(sa.getAggregate()).toBeUndefined()
    })

    it('returns max when aggregateFn is max', () => {
      const sa = new SlidingAggregate({ windowSize: 3, aggregateFn: 'max' })
      sa.push(5)
      sa.push(9)
      sa.push(3)
      expect(sa.getAggregate()).toBe(9)
    })

    it('returns undefined for max on empty window', () => {
      const sa = new SlidingAggregate({ windowSize: 3, aggregateFn: 'max' })
      expect(sa.getAggregate()).toBeUndefined()
    })

    it('returns count when aggregateFn is count', () => {
      const sa = new SlidingAggregate({ windowSize: 5, aggregateFn: 'count' })
      sa.push(1)
      sa.push(2)
      sa.push(3)
      expect(sa.getAggregate()).toBe(3)
    })

    it('returns 0 for count on empty window', () => {
      const sa = new SlidingAggregate({ windowSize: 3, aggregateFn: 'count' })
      expect(sa.getAggregate()).toBe(0)
    })
  })

  describe('getSum', () => {
    it('returns 0 for empty window', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      expect(sa.getSum()).toBe(0)
    })

    it('returns sum of single element', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(7)
      expect(sa.getSum()).toBe(7)
    })

    it('returns sum of all elements', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(1)
      sa.push(2)
      sa.push(3)
      expect(sa.getSum()).toBe(6)
    })

    it('returns sum of only window elements after eviction', () => {
      const sa = new SlidingAggregate({ windowSize: 2 })
      sa.push(10)
      sa.push(20)
      sa.push(30)
      expect(sa.getSum()).toBe(50)
    })

    it('handles floating point sum', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(0.1)
      sa.push(0.2)
      expect(sa.getSum()).toBeCloseTo(0.3)
    })

    it('handles negative sum', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(-5)
      sa.push(-10)
      expect(sa.getSum()).toBe(-15)
    })
  })

  describe('getAvg', () => {
    it('returns undefined for empty window', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      expect(sa.getAvg()).toBeUndefined()
    })

    it('returns average of single element', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(5)
      expect(sa.getAvg()).toBe(5)
    })

    it('returns average of multiple elements', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(2)
      sa.push(4)
      sa.push(6)
      expect(sa.getAvg()).toBe(4)
    })

    it('returns average of partial window', () => {
      const sa = new SlidingAggregate({ windowSize: 5 })
      sa.push(10)
      sa.push(20)
      expect(sa.getAvg()).toBe(15)
    })

    it('returns average after eviction', () => {
      const sa = new SlidingAggregate({ windowSize: 2 })
      sa.push(10)
      sa.push(20)
      sa.push(30)
      expect(sa.getAvg()).toBe(25)
    })

    it('handles floating point average', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(1)
      sa.push(2)
      expect(sa.getAvg()).toBeCloseTo(1.5)
    })
  })

  describe('getMin', () => {
    it('returns undefined for empty window', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      expect(sa.getMin()).toBeUndefined()
    })

    it('returns single element', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(5)
      expect(sa.getMin()).toBe(5)
    })

    it('returns minimum of multiple elements', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(5)
      sa.push(2)
      sa.push(8)
      expect(sa.getMin()).toBe(2)
    })

    it('returns minimum after eviction removes previous min', () => {
      const sa = new SlidingAggregate({ windowSize: 2 })
      sa.push(1)
      sa.push(5)
      sa.push(3)
      expect(sa.getMin()).toBe(3)
    })

    it('returns minimum after eviction keeps min', () => {
      const sa = new SlidingAggregate({ windowSize: 2 })
      sa.push(5)
      sa.push(1)
      sa.push(3)
      expect(sa.getMin()).toBe(1)
    })

    it('handles negative values', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(-5)
      sa.push(3)
      sa.push(-10)
      expect(sa.getMin()).toBe(-10)
    })
  })

  describe('getMax', () => {
    it('returns undefined for empty window', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      expect(sa.getMax()).toBeUndefined()
    })

    it('returns single element', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(5)
      expect(sa.getMax()).toBe(5)
    })

    it('returns maximum of multiple elements', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(5)
      sa.push(9)
      sa.push(3)
      expect(sa.getMax()).toBe(9)
    })

    it('returns maximum after eviction removes previous max', () => {
      const sa = new SlidingAggregate({ windowSize: 2 })
      sa.push(10)
      sa.push(5)
      sa.push(3)
      expect(sa.getMax()).toBe(5)
    })

    it('returns maximum after eviction keeps max', () => {
      const sa = new SlidingAggregate({ windowSize: 2 })
      sa.push(5)
      sa.push(10)
      sa.push(3)
      expect(sa.getMax()).toBe(10)
    })

    it('handles negative values', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(-5)
      sa.push(-3)
      sa.push(-10)
      expect(sa.getMax()).toBe(-3)
    })
  })

  describe('getCount', () => {
    it('returns 0 for empty window', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      expect(sa.getCount()).toBe(0)
    })

    it('returns count of elements', () => {
      const sa = new SlidingAggregate({ windowSize: 5 })
      sa.push(1)
      sa.push(2)
      sa.push(3)
      expect(sa.getCount()).toBe(3)
    })

    it('returns windowSize when full', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(1)
      sa.push(2)
      sa.push(3)
      expect(sa.getCount()).toBe(3)
    })

    it('stays at windowSize after eviction', () => {
      const sa = new SlidingAggregate({ windowSize: 2 })
      sa.push(1)
      sa.push(2)
      sa.push(3)
      sa.push(4)
      expect(sa.getCount()).toBe(2)
    })
  })

  describe('getWindow', () => {
    it('returns empty array for empty window', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      expect(sa.getWindow()).toEqual([])
    })

    it('returns copy of window contents', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(1)
      sa.push(2)
      expect(sa.getWindow()).toEqual([1, 2])
    })

    it('returns oldest to newest order', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(10)
      sa.push(20)
      sa.push(30)
      expect(sa.getWindow()).toEqual([10, 20, 30])
    })

    it('returns correct values after eviction', () => {
      const sa = new SlidingAggregate({ windowSize: 2 })
      sa.push(1)
      sa.push(2)
      sa.push(3)
      expect(sa.getWindow()).toEqual([2, 3])
    })

    it('returns a copy not a reference', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(1)
      const win = sa.getWindow()
      win.push(999)
      expect(sa.size).toBe(1)
    })
  })

  describe('size', () => {
    it('returns 0 for empty', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      expect(sa.size).toBe(0)
    })

    it('returns current size', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(1)
      sa.push(2)
      expect(sa.size).toBe(2)
    })

    it('returns windowSize when full', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(1)
      sa.push(2)
      sa.push(3)
      expect(sa.size).toBe(3)
    })

    it('stays at windowSize after more pushes', () => {
      const sa = new SlidingAggregate({ windowSize: 2 })
      sa.push(1)
      sa.push(2)
      sa.push(3)
      expect(sa.size).toBe(2)
    })
  })

  describe('windowSize', () => {
    it('returns configured windowSize', () => {
      const sa = new SlidingAggregate({ windowSize: 7 })
      expect(sa.windowSize).toBe(7)
    })

    it('returns default windowSize', () => {
      const sa = new SlidingAggregate()
      expect(sa.windowSize).toBe(DEFAULT_SLIDING_AGGREGATE_OPTIONS.windowSize)
    })
  })

  describe('isEmpty', () => {
    it('returns true when empty', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      expect(sa.isEmpty).toBe(true)
    })

    it('returns false after push', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(1)
      expect(sa.isEmpty).toBe(false)
    })

    it('returns true after clear', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(1)
      sa.clear()
      expect(sa.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('empties the window', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(1)
      sa.push(2)
      sa.clear()
      expect(sa.size).toBe(0)
    })

    it('resets isEmpty to true', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(1)
      sa.clear()
      expect(sa.isEmpty).toBe(true)
    })

    it('resets statistics counters', () => {
      const sa = new SlidingAggregate({ windowSize: 2 })
      sa.push(1)
      sa.push(2)
      sa.push(3)
      sa.clear()
      const stats = sa.getStatistics()
      expect(stats.valuesAdded).toBe(0)
      expect(stats.valuesEvicted).toBe(0)
    })

    it('allows pushing after clear', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(1)
      sa.clear()
      sa.push(10)
      expect(sa.size).toBe(1)
      expect(sa.getSum()).toBe(10)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty window', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      expect(sa.toArray()).toEqual([])
    })

    it('returns copy of window', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(1)
      sa.push(2)
      expect(sa.toArray()).toEqual([1, 2])
    })

    it('returns a new array each time', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(1)
      const a1 = sa.toArray()
      const a2 = sa.toArray()
      expect(a1).not.toBe(a2)
      expect(a1).toEqual(a2)
    })
  })

  describe('forEach', () => {
    it('does not call callback for empty window', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      const items: number[] = []
      sa.forEach((v) => items.push(v))
      expect(items).toEqual([])
    })

    it('iterates over all elements', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(10)
      sa.push(20)
      sa.push(30)
      const items: number[] = []
      sa.forEach((v) => items.push(v))
      expect(items).toEqual([10, 20, 30])
    })

    it('provides correct index', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(5)
      sa.push(10)
      const indices: number[] = []
      sa.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1])
    })

    it('iterates oldest to newest', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(1)
      sa.push(2)
      sa.push(3)
      const items: number[] = []
      sa.forEach((v) => items.push(v))
      expect(items).toEqual([1, 2, 3])
    })
  })

  describe('Symbol.iterator', () => {
    it('returns empty iterator for empty window', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      expect([...sa]).toEqual([])
    })

    it('iterates over elements', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(1)
      sa.push(2)
      sa.push(3)
      expect([...sa]).toEqual([1, 2, 3])
    })

    it('works with for...of', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(10)
      sa.push(20)
      const items: number[] = []
      for (const v of sa) {
        items.push(v)
      }
      expect(items).toEqual([10, 20])
    })

    it('works with Array.from', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(1)
      sa.push(2)
      expect(Array.from(sa)).toEqual([1, 2])
    })

    it('works with spread in destructuring', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(10)
      sa.push(20)
      sa.push(30)
      const [first, ...rest] = sa
      expect(first).toBe(10)
      expect(rest).toEqual([20, 30])
    })
  })

  describe('setWindowSize', () => {
    it('changes window size', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.setWindowSize(5)
      expect(sa.windowSize).toBe(5)
    })

    it('trims buffer when shrinking', () => {
      const sa = new SlidingAggregate({ windowSize: 5 })
      sa.push(1)
      sa.push(2)
      sa.push(3)
      sa.push(4)
      sa.push(5)
      sa.setWindowSize(2)
      expect(sa.toArray()).toEqual([4, 5])
    })

    it('keeps all values when growing', () => {
      const sa = new SlidingAggregate({ windowSize: 2 })
      sa.push(1)
      sa.push(2)
      sa.setWindowSize(5)
      expect(sa.toArray()).toEqual([1, 2])
    })

    it('allows more pushes after growing', () => {
      const sa = new SlidingAggregate({ windowSize: 2 })
      sa.push(1)
      sa.push(2)
      sa.setWindowSize(4)
      sa.push(3)
      sa.push(4)
      expect(sa.toArray()).toEqual([1, 2, 3, 4])
    })

    it('throws RangeError for 0', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      expect(() => sa.setWindowSize(0)).toThrow(RangeError)
    })

    it('throws RangeError for negative', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      expect(() => sa.setWindowSize(-1)).toThrow(RangeError)
    })

    it('throws RangeError for fractional', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      expect(() => sa.setWindowSize(1.5)).toThrow(RangeError)
    })

    it('trims to single element', () => {
      const sa = new SlidingAggregate({ windowSize: 5 })
      sa.push(1)
      sa.push(2)
      sa.push(3)
      sa.setWindowSize(1)
      expect(sa.toArray()).toEqual([3])
      expect(sa.size).toBe(1)
    })
  })

  describe('reset', () => {
    it('empties the window', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(1)
      sa.push(2)
      sa.reset()
      expect(sa.size).toBe(0)
    })

    it('resets statistics', () => {
      const sa = new SlidingAggregate({ windowSize: 2 })
      sa.push(1)
      sa.push(2)
      sa.push(3)
      sa.reset()
      const stats = sa.getStatistics()
      expect(stats.valuesAdded).toBe(0)
      expect(stats.valuesEvicted).toBe(0)
      expect(stats.currentSize).toBe(0)
    })

    it('preserves windowSize', () => {
      const sa = new SlidingAggregate({ windowSize: 5 })
      sa.push(1)
      sa.reset()
      expect(sa.windowSize).toBe(5)
    })

    it('allows pushing after reset', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(100)
      sa.reset()
      sa.push(1)
      sa.push(2)
      expect(sa.toArray()).toEqual([1, 2])
    })
  })

  describe('getStatistics', () => {
    it('returns initial statistics', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      const stats = sa.getStatistics()
      expect(stats.valuesAdded).toBe(0)
      expect(stats.valuesEvicted).toBe(0)
      expect(stats.windowSize).toBe(3)
      expect(stats.currentSize).toBe(0)
    })

    it('tracks valuesAdded', () => {
      const sa = new SlidingAggregate({ windowSize: 5 })
      sa.push(1)
      sa.push(2)
      sa.push(3)
      expect(sa.getStatistics().valuesAdded).toBe(3)
    })

    it('tracks valuesEvicted', () => {
      const sa = new SlidingAggregate({ windowSize: 2 })
      sa.push(1)
      sa.push(2)
      sa.push(3)
      sa.push(4)
      expect(sa.getStatistics().valuesEvicted).toBe(2)
    })

    it('tracks currentSize', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(1)
      sa.push(2)
      expect(sa.getStatistics().currentSize).toBe(2)
    })

    it('tracks windowSize', () => {
      const sa = new SlidingAggregate({ windowSize: 7 })
      expect(sa.getStatistics().windowSize).toBe(7)
    })

    it('currentSize equals windowSize when full', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(1)
      sa.push(2)
      sa.push(3)
      const stats = sa.getStatistics()
      expect(stats.currentSize).toBe(stats.windowSize)
    })
  })

  describe('DEFAULT_SLIDING_AGGREGATE_OPTIONS', () => {
    it('has windowSize of 10', () => {
      expect(DEFAULT_SLIDING_AGGREGATE_OPTIONS.windowSize).toBe(10)
    })

    it('has aggregateFn of sum', () => {
      expect(DEFAULT_SLIDING_AGGREGATE_OPTIONS.aggregateFn).toBe('sum')
    })
  })

  describe('integration scenarios', () => {
    it('sliding average over time series', () => {
      const sa = new SlidingAggregate<number>({ windowSize: 3, aggregateFn: 'avg' })
      sa.push(10)
      expect(sa.getAggregate()).toBe(10)
      sa.push(20)
      expect(sa.getAggregate()).toBe(15)
      sa.push(30)
      expect(sa.getAggregate()).toBe(20)
      sa.push(40)
      expect(sa.getAggregate()).toBe(30)
    })

    it('running max in sliding window', () => {
      const sa = new SlidingAggregate({ windowSize: 3, aggregateFn: 'max' })
      sa.push(5)
      expect(sa.getAggregate()).toBe(5)
      sa.push(10)
      expect(sa.getAggregate()).toBe(10)
      sa.push(3)
      expect(sa.getAggregate()).toBe(10)
      sa.push(1)
      expect(sa.getAggregate()).toBe(10)
      sa.push(7)
      expect(sa.getAggregate()).toBe(7)
    })

    it('running min in sliding window', () => {
      const sa = new SlidingAggregate({ windowSize: 3, aggregateFn: 'min' })
      sa.push(5)
      expect(sa.getAggregate()).toBe(5)
      sa.push(3)
      expect(sa.getAggregate()).toBe(3)
      sa.push(7)
      expect(sa.getAggregate()).toBe(3)
      sa.push(10)
      expect(sa.getAggregate()).toBe(3)
      sa.push(8)
      expect(sa.getAggregate()).toBe(7)
    })

    it('count in sliding window', () => {
      const sa = new SlidingAggregate({ windowSize: 3, aggregateFn: 'count' })
      sa.push(1)
      sa.push(2)
      expect(sa.getAggregate()).toBe(2)
      sa.push(3)
      expect(sa.getAggregate()).toBe(3)
      sa.push(4)
      expect(sa.getAggregate()).toBe(3)
    })

    it('sum with large dataset', () => {
      const sa = new SlidingAggregate({ windowSize: 100 })
      for (let i = 1; i <= 200; i++) sa.push(i)
      let expected = 0
      for (let i = 101; i <= 200; i++) expected += i
      expect(sa.getSum()).toBe(expected)
    })

    it('resize during operation', () => {
      const sa = new SlidingAggregate({ windowSize: 5 })
      sa.push(1)
      sa.push(2)
      sa.push(3)
      sa.push(4)
      sa.push(5)
      sa.setWindowSize(3)
      expect(sa.toArray()).toEqual([3, 4, 5])
      expect(sa.getSum()).toBe(12)
      sa.push(6)
      expect(sa.toArray()).toEqual([4, 5, 6])
    })

    it('clear and restart', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(100)
      sa.push(200)
      sa.push(300)
      sa.clear()
      expect(sa.getSum()).toBe(0)
      sa.push(1)
      sa.push(2)
      expect(sa.getSum()).toBe(3)
      expect(sa.getStatistics().valuesAdded).toBe(2)
    })

    it('multiple aggregate functions on same data', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      sa.push(10)
      sa.push(20)
      sa.push(30)
      expect(sa.getSum()).toBe(60)
      expect(sa.getAvg()).toBe(20)
      expect(sa.getMin()).toBe(10)
      expect(sa.getMax()).toBe(30)
      expect(sa.getCount()).toBe(3)
    })

    it('sliding window preserves order', () => {
      const sa = new SlidingAggregate({ windowSize: 4 })
      sa.push(1)
      sa.push(2)
      sa.push(3)
      sa.push(4)
      sa.push(5)
      expect(sa.getWindow()).toEqual([2, 3, 4, 5])
    })

    it('eviction correctness over many operations', () => {
      const sa = new SlidingAggregate({ windowSize: 3 })
      for (let i = 0; i < 100; i++) sa.push(i)
      expect(sa.toArray()).toEqual([97, 98, 99])
      expect(sa.getStatistics().valuesAdded).toBe(100)
      expect(sa.getStatistics().valuesEvicted).toBe(97)
    })
  })

  describe('type exports', () => {
    it('SlidingAggregateOptions type is accessible', () => {
      const opts: SlidingAggregateOptions = { windowSize: 5 }
      expect(opts.windowSize).toBe(5)
    })

    it('SlidingAggregateStatistics type is accessible', () => {
      const stats: SlidingAggregateStatistics = {
        valuesAdded: 0,
        valuesEvicted: 0,
        windowSize: 3,
        currentSize: 0,
      }
      expect(stats.windowSize).toBe(3)
    })
  })
})
