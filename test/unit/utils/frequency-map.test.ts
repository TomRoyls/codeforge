import { describe, expect, it } from 'vitest'
import { FrequencyMap } from '../../../src/utils/frequency-map.js'

describe('FrequencyMap', () => {
  describe('constructor', () => {
    it('should create empty map', () => {
      const fm = new FrequencyMap<string>()
      expect(fm.size).toBe(0)
      expect(fm.isEmpty).toBe(true)
      expect(fm.totalObservations).toBe(0)
    })
  })

  describe('add', () => {
    it('should add a single observation', () => {
      const fm = new FrequencyMap<string>()
      fm.add('hello')
      expect(fm.get('hello')).toBe(1)
      expect(fm.size).toBe(1)
      expect(fm.totalObservations).toBe(1)
    })

    it('should add multiple observations of same key', () => {
      const fm = new FrequencyMap<string>()
      fm.add('hello')
      fm.add('hello')
      fm.add('hello')
      expect(fm.get('hello')).toBe(3)
      expect(fm.size).toBe(1)
      expect(fm.totalObservations).toBe(3)
    })

    it('should add with count parameter', () => {
      const fm = new FrequencyMap<string>()
      fm.add('hello', 5)
      expect(fm.get('hello')).toBe(5)
      expect(fm.totalObservations).toBe(5)
    })

    it('should ignore zero or negative counts', () => {
      const fm = new FrequencyMap<string>()
      fm.add('hello', 0)
      fm.add('world', -1)
      expect(fm.size).toBe(0)
    })

    it('should track multiple keys', () => {
      const fm = new FrequencyMap<string>()
      fm.add('a', 3)
      fm.add('b', 5)
      fm.add('c', 1)
      expect(fm.size).toBe(3)
      expect(fm.totalObservations).toBe(9)
    })

    it('should update maxKey when new max found', () => {
      const fm = new FrequencyMap<string>()
      fm.add('a', 3)
      expect(fm.maxKey).toBe('a')
      expect(fm.maxCount).toBe(3)
      fm.add('b', 5)
      expect(fm.maxKey).toBe('b')
      expect(fm.maxCount).toBe(5)
    })
  })

  describe('remove', () => {
    it('should remove a key entirely', () => {
      const fm = new FrequencyMap<string>()
      fm.add('hello', 5)
      expect(fm.remove('hello')).toBe(true)
      expect(fm.has('hello')).toBe(false)
      expect(fm.totalObservations).toBe(0)
    })

    it('should return false for missing key', () => {
      const fm = new FrequencyMap<string>()
      expect(fm.remove('missing')).toBe(false)
    })

    it('should recompute maxKey after removing max', () => {
      const fm = new FrequencyMap<string>()
      fm.add('a', 3)
      fm.add('b', 5)
      fm.add('c', 2)
      fm.remove('b')
      expect(fm.maxKey).toBe('a')
      expect(fm.maxCount).toBe(3)
    })
  })

  describe('decrease', () => {
    it('should decrease count by 1', () => {
      const fm = new FrequencyMap<string>()
      fm.add('hello', 5)
      fm.decrease('hello')
      expect(fm.get('hello')).toBe(4)
      expect(fm.totalObservations).toBe(4)
    })

    it('should decrease by specified count', () => {
      const fm = new FrequencyMap<string>()
      fm.add('hello', 5)
      fm.decrease('hello', 3)
      expect(fm.get('hello')).toBe(2)
    })

    it('should remove key when count drops to zero', () => {
      const fm = new FrequencyMap<string>()
      fm.add('hello', 3)
      fm.decrease('hello', 3)
      expect(fm.has('hello')).toBe(false)
    })

    it('should remove key when count exceeds total', () => {
      const fm = new FrequencyMap<string>()
      fm.add('hello', 2)
      fm.decrease('hello', 10)
      expect(fm.has('hello')).toBe(false)
    })

    it('should return false for missing key', () => {
      const fm = new FrequencyMap<string>()
      expect(fm.decrease('missing')).toBe(false)
    })
  })

  describe('get and has', () => {
    it('should return 0 for missing key', () => {
      const fm = new FrequencyMap<string>()
      expect(fm.get('missing')).toBe(0)
    })

    it('has should return false for missing key', () => {
      const fm = new FrequencyMap<string>()
      expect(fm.has('missing')).toBe(false)
    })

    it('has should return true for existing key', () => {
      const fm = new FrequencyMap<string>()
      fm.add('hello')
      expect(fm.has('hello')).toBe(true)
    })
  })

  describe('top', () => {
    it('should return top K entries sorted by count desc', () => {
      const fm = new FrequencyMap<string>()
      fm.add('a', 5)
      fm.add('b', 10)
      fm.add('c', 3)
      fm.add('d', 7)
      const top = fm.top(2)
      expect(top).toEqual([
        { key: 'b', count: 10 },
        { key: 'd', count: 7 },
      ])
    })

    it('should return all entries if K exceeds size', () => {
      const fm = new FrequencyMap<string>()
      fm.add('a', 1)
      fm.add('b', 2)
      expect(fm.top(10).length).toBe(2)
    })

    it('should return empty for empty map', () => {
      const fm = new FrequencyMap<string>()
      expect(fm.top(5)).toEqual([])
    })
  })

  describe('bottom', () => {
    it('should return bottom K entries sorted by count asc', () => {
      const fm = new FrequencyMap<string>()
      fm.add('a', 5)
      fm.add('b', 10)
      fm.add('c', 3)
      const bottom = fm.bottom(2)
      expect(bottom).toEqual([
        { key: 'c', count: 3 },
        { key: 'a', count: 5 },
      ])
    })
  })

  describe('above and below', () => {
    it('above should return entries above threshold', () => {
      const fm = new FrequencyMap<string>()
      fm.add('a', 3)
      fm.add('b', 5)
      fm.add('c', 10)
      const result = fm.above(4)
      expect(result.map((e) => e.key)).toEqual(['c', 'b'])
    })

    it('below should return entries below threshold', () => {
      const fm = new FrequencyMap<string>()
      fm.add('a', 3)
      fm.add('b', 5)
      fm.add('c', 10)
      const result = fm.below(6)
      expect(result.map((e) => e.key)).toEqual(['a', 'b'])
    })
  })

  describe('merge', () => {
    it('should merge another FrequencyMap', () => {
      const fm1 = new FrequencyMap<string>()
      fm1.add('a', 3)
      const fm2 = new FrequencyMap<string>()
      fm2.add('a', 2)
      fm2.add('b', 5)
      fm1.merge(fm2)
      expect(fm1.get('a')).toBe(5)
      expect(fm1.get('b')).toBe(5)
      expect(fm1.totalObservations).toBe(10)
    })
  })

  describe('clone', () => {
    it('should create independent copy', () => {
      const fm = new FrequencyMap<string>()
      fm.add('a', 5)
      fm.add('b', 3)
      const copy = fm.clone()
      expect(copy.get('a')).toBe(5)
      expect(copy.get('b')).toBe(3)
      expect(copy.totalObservations).toBe(8)
      copy.add('a', 10)
      expect(fm.get('a')).toBe(5)
    })
  })

  describe('clear', () => {
    it('should clear all data', () => {
      const fm = new FrequencyMap<string>()
      fm.add('a', 5)
      fm.add('b', 3)
      fm.clear()
      expect(fm.size).toBe(0)
      expect(fm.totalObservations).toBe(0)
      expect(fm.maxKey).toBeUndefined()
      expect(fm.maxCount).toBe(0)
    })
  })

  describe('keys, values, entries', () => {
    it('should return all keys', () => {
      const fm = new FrequencyMap<string>()
      fm.add('a')
      fm.add('b')
      fm.add('c')
      expect(fm.keys().sort()).toEqual(['a', 'b', 'c'])
    })

    it('should return all values', () => {
      const fm = new FrequencyMap<string>()
      fm.add('a', 3)
      fm.add('b', 7)
      expect(fm.values().sort()).toEqual([3, 7])
    })

    it('should return all entries', () => {
      const fm = new FrequencyMap<string>()
      fm.add('x', 1)
      fm.add('y', 2)
      const entries = fm.entries()
      expect(entries.length).toBe(2)
    })
  })

  describe('forEach', () => {
    it('should iterate over all entries', () => {
      const fm = new FrequencyMap<string>()
      fm.add('a', 3)
      fm.add('b', 5)
      const result: Array<[string, number]> = []
      fm.forEach((key, count) => result.push([key, count]))
      expect(result.length).toBe(2)
    })
  })

  describe('getStatistics', () => {
    it('should return comprehensive statistics', () => {
      const fm = new FrequencyMap<string>()
      fm.add('a', 3)
      fm.add('b', 10)
      fm.add('c', 1)
      const stats = fm.getStatistics()
      expect(stats.uniqueKeys).toBe(3)
      expect(stats.totalObservations).toBe(14)
      expect(stats.maxCount).toBe(10)
      expect(stats.minCount).toBe(1)
      expect(stats.topKey).toBe('b')
    })

    it('should handle empty map', () => {
      const fm = new FrequencyMap<string>()
      const stats = fm.getStatistics()
      expect(stats.uniqueKeys).toBe(0)
      expect(stats.totalObservations).toBe(0)
      expect(stats.maxCount).toBe(0)
      expect(stats.minCount).toBe(0)
      expect(stats.topKey).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    it('should work with number keys', () => {
      const fm = new FrequencyMap<number>()
      fm.add(1, 10)
      fm.add(2, 20)
      expect(fm.get(1)).toBe(10)
      expect(fm.top(1)).toEqual([{ key: 2, count: 20 }])
    })

    it('should handle large number of keys', () => {
      const fm = new FrequencyMap<number>()
      for (let i = 0; i < 1000; i++) fm.add(i)
      expect(fm.size).toBe(1000)
      expect(fm.totalObservations).toBe(1000)
      expect(fm.top(1)![0]!.count).toBe(1)
    })

    it('should handle add then remove then add', () => {
      const fm = new FrequencyMap<string>()
      fm.add('a', 5)
      fm.remove('a')
      fm.add('a', 3)
      expect(fm.get('a')).toBe(3)
      expect(fm.totalObservations).toBe(3)
    })
  })
})
