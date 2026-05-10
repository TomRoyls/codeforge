import { describe, it, expect } from 'vitest'
import { WeightedRoundRobin } from '../../src/core/weighted-round-robin/weighted-round-robin.js'
import type { WeightedRoundRobinOptions, WeightedRoundRobinStatistics } from '../../src/core/weighted-round-robin/types.js'
import { DEFAULT_WEIGHTED_ROUND_ROBIN_OPTIONS } from '../../src/core/weighted-round-robin/types.js'

describe('DEFAULT_WEIGHTED_ROUND_ROBIN_OPTIONS', () => {
  it('should have smooth default to true', () => {
    expect(DEFAULT_WEIGHTED_ROUND_ROBIN_OPTIONS.smooth).toBe(true)
  })
})

describe('WeightedRoundRobin', () => {
  describe('constructor', () => {
    it('should create instance with default options', () => {
      const wrr = new WeightedRoundRobin<string>()
      expect(wrr.size).toBe(0)
      expect(wrr.isEmpty).toBe(true)
    })

    it('should create instance with smooth option', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: true })
      expect(wrr.isEmpty).toBe(true)
    })

    it('should create instance with non-smooth option', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: false })
      expect(wrr.isEmpty).toBe(true)
    })

    it('should accept empty options object', () => {
      const wrr = new WeightedRoundRobin<string>({})
      expect(wrr.isEmpty).toBe(true)
    })
  })

  describe('add', () => {
    it('should add an item with a weight', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      expect(wrr.size).toBe(1)
      expect(wrr.isEmpty).toBe(false)
    })

    it('should add multiple items', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      wrr.add('b', 3)
      wrr.add('c', 2)
      expect(wrr.size).toBe(3)
    })

    it('should throw for zero weight', () => {
      const wrr = new WeightedRoundRobin<string>()
      expect(() => wrr.add('a', 0)).toThrow('Weight must be a positive number')
    })

    it('should throw for negative weight', () => {
      const wrr = new WeightedRoundRobin<string>()
      expect(() => wrr.add('a', -1)).toThrow('Weight must be a positive number')
    })

    it('should throw for duplicate item', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      expect(() => wrr.add('a', 3)).toThrow('Item already exists')
    })

    it('should increment adds statistic', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 1)
      wrr.add('b', 2)
      expect(wrr.getStatistics().adds).toBe(2)
    })

    it('should accept fractional weights', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 0.5)
      expect(wrr.getWeight('a')).toBe(0.5)
    })

    it('should accept very large weights', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 1000000)
      expect(wrr.getWeight('a')).toBe(1000000)
    })

    it('should work with number items', () => {
      const wrr = new WeightedRoundRobin<number>()
      wrr.add(1, 5)
      wrr.add(2, 3)
      expect(wrr.size).toBe(2)
    })

    it('should work with object items', () => {
      const wrr = new WeightedRoundRobin<{ id: number }>()
      const obj1 = { id: 1 }
      const obj2 = { id: 2 }
      wrr.add(obj1, 5)
      wrr.add(obj2, 3)
      expect(wrr.size).toBe(2)
    })
  })

  describe('remove', () => {
    it('should remove an existing item', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      expect(wrr.remove('a')).toBe(true)
      expect(wrr.size).toBe(0)
    })

    it('should return false for non-existent item', () => {
      const wrr = new WeightedRoundRobin<string>()
      expect(wrr.remove('a')).toBe(false)
    })

    it('should remove item and not affect others', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      wrr.add('b', 3)
      wrr.add('c', 2)
      wrr.remove('b')
      expect(wrr.items()).toEqual(['a', 'c'])
    })

    it('should increment removes statistic', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      wrr.remove('a')
      expect(wrr.getStatistics().removes).toBe(1)
    })

    it('should not increment removes statistic on failed removal', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.remove('nonexistent')
      expect(wrr.getStatistics().removes).toBe(0)
    })

    it('should allow re-adding removed item', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      wrr.remove('a')
      wrr.add('a', 3)
      expect(wrr.size).toBe(1)
      expect(wrr.getWeight('a')).toBe(3)
    })

    it('should handle removing all items', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      wrr.add('b', 3)
      wrr.remove('a')
      wrr.remove('b')
      expect(wrr.isEmpty).toBe(true)
    })
  })

  describe('next (smooth mode)', () => {
    it('should return undefined when empty', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: true })
      expect(wrr.next()).toBeUndefined()
    })

    it('should return the only item when one exists', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: true })
      wrr.add('a', 5)
      expect(wrr.next()).toBe('a')
    })

    it('should distribute proportionally with equal weights', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: true })
      wrr.add('a', 1)
      wrr.add('b', 1)
      const counts: Record<string, number> = { a: 0, b: 0 }
      for (let i = 0; i < 100; i++) {
        const item = wrr.next()!
        counts[item]++
      }
      expect(counts.a).toBe(50)
      expect(counts.b).toBe(50)
    })

    it('should distribute proportionally with unequal weights', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: true })
      wrr.add('a', 5)
      wrr.add('b', 1)
      const counts: Record<string, number> = { a: 0, b: 0 }
      for (let i = 0; i < 60; i++) {
        const item = wrr.next()!
        counts[item]++
      }
      expect(counts.a).toBe(50)
      expect(counts.b).toBe(10)
    })

    it('should distribute proportionally with three items', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: true })
      wrr.add('a', 5)
      wrr.add('b', 3)
      wrr.add('c', 2)
      const counts: Record<string, number> = { a: 0, b: 0, c: 0 }
      for (let i = 0; i < 100; i++) {
        const item = wrr.next()!
        counts[item]++
      }
      expect(counts.a).toBe(50)
      expect(counts.b).toBe(30)
      expect(counts.c).toBe(20)
    })

    it('should increment selections statistic', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: true })
      wrr.add('a', 5)
      wrr.next()
      wrr.next()
      expect(wrr.getStatistics().selections).toBe(2)
    })

    it('should increment totalCycles after full round', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: true })
      wrr.add('a', 1)
      wrr.add('b', 1)
      wrr.next()
      expect(wrr.getStatistics().totalCycles).toBe(0)
      wrr.next()
      expect(wrr.getStatistics().totalCycles).toBe(1)
    })

    it('should handle weight ratio 4:2:1', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: true })
      wrr.add('a', 4)
      wrr.add('b', 2)
      wrr.add('c', 1)
      const counts: Record<string, number> = { a: 0, b: 0, c: 0 }
      for (let i = 0; i < 70; i++) {
        const item = wrr.next()!
        counts[item]++
      }
      expect(counts.a).toBe(40)
      expect(counts.b).toBe(20)
      expect(counts.c).toBe(10)
    })

    it('should produce smooth interleaving', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: true })
      wrr.add('a', 5)
      wrr.add('b', 1)
      const results: string[] = []
      for (let i = 0; i < 6; i++) {
        results.push(wrr.next()!)
      }
      expect(results).toEqual(['a', 'a', 'a', 'b', 'a', 'a'])
    })

    it('should handle single item with high weight', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: true })
      wrr.add('only', 100)
      for (let i = 0; i < 10; i++) {
        expect(wrr.next()).toBe('only')
      }
    })

    it('should handle weight 1 for all items', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: true })
      wrr.add('a', 1)
      wrr.add('b', 1)
      wrr.add('c', 1)
      const results: string[] = []
      for (let i = 0; i < 3; i++) {
        results.push(wrr.next()!)
      }
      expect(results.sort()).toEqual(['a', 'b', 'c'])
    })

    it('should work after removing an item', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: true })
      wrr.add('a', 1)
      wrr.add('b', 1)
      wrr.add('c', 1)
      wrr.remove('b')
      const results: string[] = []
      for (let i = 0; i < 4; i++) {
        results.push(wrr.next()!)
      }
      expect(results.sort()).toEqual(['a', 'a', 'c', 'c'])
    })

    it('should work after adding items mid-stream', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: true })
      wrr.add('a', 2)
      wrr.add('b', 1)
      wrr.next()
      wrr.add('c', 1)
      const item = wrr.next()
      expect(['a', 'b', 'c']).toContain(item)
    })
  })

  describe('next (basic mode)', () => {
    it('should return items in basic round-robin with weights', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: false })
      wrr.add('a', 2)
      wrr.add('b', 1)
      const results: string[] = []
      for (let i = 0; i < 3; i++) {
        results.push(wrr.next()!)
      }
      expect(results).toEqual(['a', 'a', 'b'])
    })

    it('should cycle through repeatedly', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: false })
      wrr.add('a', 2)
      wrr.add('b', 1)
      const results: string[] = []
      for (let i = 0; i < 6; i++) {
        results.push(wrr.next()!)
      }
      expect(results).toEqual(['a', 'a', 'b', 'a', 'a', 'b'])
    })

    it('should return undefined when empty', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: false })
      expect(wrr.next()).toBeUndefined()
    })

    it('should handle single item', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: false })
      wrr.add('a', 5)
      for (let i = 0; i < 5; i++) {
        expect(wrr.next()).toBe('a')
      }
    })

    it('should handle equal weights', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: false })
      wrr.add('a', 2)
      wrr.add('b', 2)
      const results: string[] = []
      for (let i = 0; i < 4; i++) {
        results.push(wrr.next()!)
      }
      expect(results).toEqual(['a', 'b', 'a', 'b'])
    })

    it('should handle three items with different weights', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: false })
      wrr.add('a', 3)
      wrr.add('b', 2)
      wrr.add('c', 1)
      const results: string[] = []
      for (let i = 0; i < 6; i++) {
        results.push(wrr.next()!)
      }
      expect(results).toEqual(['a', 'a', 'b', 'a', 'b', 'c'])
    })

    it('should track cycles', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: false })
      wrr.add('a', 2)
      wrr.add('b', 1)
      wrr.next()
      wrr.next()
      expect(wrr.getStatistics().totalCycles).toBe(0)
      wrr.next()
      expect(wrr.getStatistics().totalCycles).toBe(1)
    })
  })

  describe('reset', () => {
    it('should reset internal state', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: true })
      wrr.add('a', 5)
      wrr.add('b', 3)
      wrr.next()
      wrr.next()
      wrr.reset()
      expect(wrr.getStatistics().selections).toBe(2)
    })

    it('should allow fresh selection after reset', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: true })
      wrr.add('a', 5)
      wrr.add('b', 3)
      const first = wrr.next()
      wrr.reset()
      const afterReset = wrr.next()
      expect(first).toBe(afterReset)
    })

    it('should work on empty instance', () => {
      const wrr = new WeightedRoundRobin<string>()
      expect(() => wrr.reset()).not.toThrow()
    })

    it('should reset basic mode index', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: false })
      wrr.add('a', 2)
      wrr.add('b', 1)
      wrr.next()
      wrr.next()
      wrr.reset()
      const results: string[] = []
      for (let i = 0; i < 3; i++) {
        results.push(wrr.next()!)
      }
      expect(results).toEqual(['a', 'a', 'b'])
    })
  })

  describe('updateWeight', () => {
    it('should update weight of existing item', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      wrr.updateWeight('a', 10)
      expect(wrr.getWeight('a')).toBe(10)
    })

    it('should return true for existing item', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      expect(wrr.updateWeight('a', 10)).toBe(true)
    })

    it('should return false for non-existent item', () => {
      const wrr = new WeightedRoundRobin<string>()
      expect(wrr.updateWeight('a', 10)).toBe(false)
    })

    it('should throw for zero weight', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      expect(() => wrr.updateWeight('a', 0)).toThrow('Weight must be a positive number')
    })

    it('should throw for negative weight', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      expect(() => wrr.updateWeight('a', -5)).toThrow('Weight must be a positive number')
    })

    it('should increment weightUpdates statistic', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      wrr.updateWeight('a', 10)
      wrr.updateWeight('a', 3)
      expect(wrr.getStatistics().weightUpdates).toBe(2)
    })

    it('should affect next() distribution', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: true })
      wrr.add('a', 1)
      wrr.add('b', 1)
      wrr.updateWeight('a', 9)
      const counts: Record<string, number> = { a: 0, b: 0 }
      for (let i = 0; i < 100; i++) {
        const item = wrr.next()!
        counts[item]++
      }
      expect(counts.a).toBe(90)
      expect(counts.b).toBe(10)
    })
  })

  describe('getWeight', () => {
    it('should return weight of existing item', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      expect(wrr.getWeight('a')).toBe(5)
    })

    it('should return undefined for non-existent item', () => {
      const wrr = new WeightedRoundRobin<string>()
      expect(wrr.getWeight('a')).toBeUndefined()
    })

    it('should return updated weight after updateWeight', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      wrr.updateWeight('a', 10)
      expect(wrr.getWeight('a')).toBe(10)
    })

    it('should return undefined after removal', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      wrr.remove('a')
      expect(wrr.getWeight('a')).toBeUndefined()
    })
  })

  describe('items', () => {
    it('should return empty array when empty', () => {
      const wrr = new WeightedRoundRobin<string>()
      expect(wrr.items()).toEqual([])
    })

    it('should return all items in insertion order', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      wrr.add('b', 3)
      wrr.add('c', 2)
      expect(wrr.items()).toEqual(['a', 'b', 'c'])
    })

    it('should reflect removals', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      wrr.add('b', 3)
      wrr.remove('a')
      expect(wrr.items()).toEqual(['b'])
    })
  })

  describe('totalWeight', () => {
    it('should return 0 when empty', () => {
      const wrr = new WeightedRoundRobin<string>()
      expect(wrr.totalWeight()).toBe(0)
    })

    it('should return sum of all weights', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      wrr.add('b', 3)
      wrr.add('c', 2)
      expect(wrr.totalWeight()).toBe(10)
    })

    it('should update after removal', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      wrr.add('b', 3)
      wrr.remove('a')
      expect(wrr.totalWeight()).toBe(3)
    })

    it('should update after weight update', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      wrr.add('b', 3)
      wrr.updateWeight('a', 10)
      expect(wrr.totalWeight()).toBe(13)
    })
  })

  describe('size', () => {
    it('should return 0 for empty instance', () => {
      const wrr = new WeightedRoundRobin<string>()
      expect(wrr.size).toBe(0)
    })

    it('should return number of items', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 1)
      wrr.add('b', 2)
      wrr.add('c', 3)
      expect(wrr.size).toBe(3)
    })

    it('should decrease after removal', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 1)
      wrr.add('b', 2)
      wrr.remove('a')
      expect(wrr.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty instance', () => {
      const wrr = new WeightedRoundRobin<string>()
      expect(wrr.isEmpty).toBe(true)
    })

    it('should return false after adding item', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 1)
      expect(wrr.isEmpty).toBe(false)
    })

    it('should return true after removing all items', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 1)
      wrr.remove('a')
      expect(wrr.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all items', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      wrr.add('b', 3)
      wrr.add('c', 2)
      wrr.clear()
      expect(wrr.size).toBe(0)
      expect(wrr.isEmpty).toBe(true)
    })

    it('should clear items array', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      wrr.clear()
      expect(wrr.items()).toEqual([])
    })

    it('should allow adding after clear', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      wrr.clear()
      wrr.add('a', 3)
      expect(wrr.size).toBe(1)
      expect(wrr.getWeight('a')).toBe(3)
    })

    it('should not reset statistics', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      wrr.add('b', 3)
      wrr.next()
      wrr.clear()
      const stats = wrr.getStatistics()
      expect(stats.adds).toBe(2)
      expect(stats.selections).toBe(1)
    })
  })

  describe('toArray', () => {
    it('should return empty array when empty', () => {
      const wrr = new WeightedRoundRobin<string>()
      expect(wrr.toArray()).toEqual([])
    })

    it('should return items in insertion order', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      wrr.add('b', 3)
      expect(wrr.toArray()).toEqual(['a', 'b'])
    })

    it('should return same result as items()', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      wrr.add('b', 3)
      expect(wrr.toArray()).toEqual(wrr.items())
    })
  })

  describe('forEach', () => {
    it('should iterate over all items', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      wrr.add('b', 3)
      wrr.add('c', 2)
      const results: Array<{ item: string; weight: number; index: number }> = []
      wrr.forEach((item, weight, index) => {
        results.push({ item, weight, index })
      })
      expect(results).toEqual([
        { item: 'a', weight: 5, index: 0 },
        { item: 'b', weight: 3, index: 1 },
        { item: 'c', weight: 2, index: 2 },
      ])
    })

    it('should not iterate when empty', () => {
      const wrr = new WeightedRoundRobin<string>()
      let count = 0
      wrr.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should iterate in insertion order', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('x', 10)
      wrr.add('y', 20)
      const items: string[] = []
      wrr.forEach((item) => { items.push(item) })
      expect(items).toEqual(['x', 'y'])
    })
  })

  describe('getStatistics', () => {
    it('should return initial statistics', () => {
      const wrr = new WeightedRoundRobin<string>()
      const stats = wrr.getStatistics()
      expect(stats).toEqual({
        adds: 0,
        removes: 0,
        selections: 0,
        weightUpdates: 0,
        totalCycles: 0,
      })
    })

    it('should return a copy of statistics', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      const stats1 = wrr.getStatistics()
      stats1.adds = 999
      const stats2 = wrr.getStatistics()
      expect(stats2.adds).toBe(1)
    })

    it('should track all operations', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      wrr.add('b', 3)
      wrr.updateWeight('a', 10)
      wrr.next()
      wrr.next()
      wrr.remove('a')
      const stats = wrr.getStatistics()
      expect(stats.adds).toBe(2)
      expect(stats.removes).toBe(1)
      expect(stats.selections).toBe(2)
      expect(stats.weightUpdates).toBe(1)
    })

    it('should track totalCycles in smooth mode', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: true })
      wrr.add('a', 1)
      wrr.add('b', 1)
      for (let i = 0; i < 10; i++) {
        wrr.next()
      }
      expect(wrr.getStatistics().totalCycles).toBe(5)
    })
  })

  describe('Symbol.iterator', () => {
    it('should iterate over items', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      wrr.add('b', 3)
      wrr.add('c', 2)
      const items: string[] = []
      for (const item of wrr) {
        items.push(item)
      }
      expect(items).toEqual(['a', 'b', 'c'])
    })

    it('should work with spread operator', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      wrr.add('b', 3)
      expect([...wrr]).toEqual(['a', 'b'])
    })

    it('should work with empty instance', () => {
      const wrr = new WeightedRoundRobin<string>()
      expect([...wrr]).toEqual([])
    })

    it('should work with Array.from', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 1)
      wrr.add('b', 2)
      expect(Array.from(wrr)).toEqual(['a', 'b'])
    })
  })

  describe('integration', () => {
    it('should handle load balancing scenario', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: true })
      wrr.add('server1', 5)
      wrr.add('server2', 3)
      wrr.add('server3', 2)
      const counts: Record<string, number> = { server1: 0, server2: 0, server3: 0 }
      for (let i = 0; i < 1000; i++) {
        const server = wrr.next()!
        counts[server]++
      }
      expect(counts.server1).toBe(500)
      expect(counts.server2).toBe(300)
      expect(counts.server3).toBe(200)
    })

    it('should handle dynamic weight changes', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: true })
      wrr.add('a', 1)
      wrr.add('b', 1)
      for (let i = 0; i < 10; i++) wrr.next()
      wrr.updateWeight('a', 4)
      const counts: Record<string, number> = { a: 0, b: 0 }
      for (let i = 0; i < 50; i++) {
        counts[wrr.next()!]!++
      }
      expect(counts.a).toBe(40)
      expect(counts.b).toBe(10)
    })

    it('should handle server addition mid-operation', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: true })
      wrr.add('a', 2)
      wrr.add('b', 1)
      wrr.next()
      wrr.next()
      wrr.add('c', 3)
      const counts: Record<string, number> = { a: 0, b: 0, c: 0 }
      for (let i = 0; i < 60; i++) {
        counts[wrr.next()!]!++
      }
      expect(counts.a).toBe(20)
      expect(counts.b).toBe(10)
      expect(counts.c).toBe(30)
    })

    it('should handle server removal mid-operation', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: true })
      wrr.add('a', 2)
      wrr.add('b', 1)
      wrr.add('c', 1)
      wrr.next()
      wrr.remove('c')
      const counts: Record<string, number> = { a: 0, b: 0 }
      for (let i = 0; i < 60; i++) {
        counts[wrr.next()!]!++
      }
      expect(counts.a).toBe(40)
      expect(counts.b).toBe(20)
    })

    it('should handle complete rebuild', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: true })
      wrr.add('a', 5)
      wrr.add('b', 3)
      for (let i = 0; i < 8; i++) wrr.next()
      wrr.clear()
      wrr.add('x', 1)
      wrr.add('y', 1)
      const counts: Record<string, number> = { x: 0, y: 0 }
      for (let i = 0; i < 10; i++) {
        counts[wrr.next()!]!++
      }
      expect(counts.x).toBe(5)
      expect(counts.y).toBe(5)
    })

    it('should handle reset and continue', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: true })
      wrr.add('a', 3)
      wrr.add('b', 1)
      const before: string[] = []
      for (let i = 0; i < 4; i++) {
        before.push(wrr.next()!)
      }
      wrr.reset()
      const after: string[] = []
      for (let i = 0; i < 4; i++) {
        after.push(wrr.next()!)
      }
      expect(before).toEqual(after)
    })

    it('should handle basic mode full cycle', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: false })
      wrr.add('a', 3)
      wrr.add('b', 2)
      wrr.add('c', 1)
      const results: string[] = []
      for (let i = 0; i < 6; i++) {
        results.push(wrr.next()!)
      }
      expect(results).toEqual(['a', 'a', 'b', 'a', 'b', 'c'])
      expect(wrr.getStatistics().totalCycles).toBe(1)
    })

    it('should handle large number of items', () => {
      const wrr = new WeightedRoundRobin<number>({ smooth: true })
      for (let i = 0; i < 100; i++) {
        wrr.add(i, 1)
      }
      expect(wrr.size).toBe(100)
      const results: Set<number> = new Set()
      for (let i = 0; i < 100; i++) {
        results.add(wrr.next()!)
      }
      expect(results.size).toBe(100)
    })

    it('should handle weight of 1 for all items in basic mode', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: false })
      wrr.add('a', 1)
      wrr.add('b', 1)
      wrr.add('c', 1)
      const results: string[] = []
      for (let i = 0; i < 3; i++) {
        results.push(wrr.next()!)
      }
      expect(results.sort()).toEqual(['a', 'b', 'c'])
    })

    it('should preserve statistics across clear', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      wrr.add('b', 3)
      wrr.next()
      wrr.clear()
      const stats = wrr.getStatistics()
      expect(stats.adds).toBe(2)
      expect(stats.selections).toBe(1)
      expect(stats.removes).toBe(0)
    })

    it('should handle number items in iterator', () => {
      const wrr = new WeightedRoundRobin<number>()
      wrr.add(10, 1)
      wrr.add(20, 2)
      wrr.add(30, 3)
      const items: number[] = []
      for (const item of wrr) {
        items.push(item)
      }
      expect(items).toEqual([10, 20, 30])
    })

    it('should handle next() after adding to previously empty instance', () => {
      const wrr = new WeightedRoundRobin<string>()
      expect(wrr.next()).toBeUndefined()
      wrr.add('a', 1)
      expect(wrr.next()).toBe('a')
    })

    it('should track multiple complete cycles in basic mode', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: false })
      wrr.add('a', 2)
      wrr.add('b', 1)
      for (let i = 0; i < 9; i++) {
        wrr.next()
      }
      expect(wrr.getStatistics().totalCycles).toBe(3)
    })

    it('should handle basic mode with single item after removal', () => {
      const wrr = new WeightedRoundRobin<string>({ smooth: false })
      wrr.add('a', 2)
      wrr.add('b', 1)
      wrr.remove('b')
      for (let i = 0; i < 5; i++) {
        expect(wrr.next()).toBe('a')
      }
    })

    it('should handle updateWeight to same value', () => {
      const wrr = new WeightedRoundRobin<string>()
      wrr.add('a', 5)
      wrr.updateWeight('a', 5)
      expect(wrr.getWeight('a')).toBe(5)
      expect(wrr.getStatistics().weightUpdates).toBe(1)
    })
  })
})
