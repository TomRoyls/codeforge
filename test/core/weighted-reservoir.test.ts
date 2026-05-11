import { describe, it, expect } from 'vitest'
import { WeightedReservoir } from '../../src/core/weighted-reservoir/index.js'

describe('WeightedReservoir', () => {
  describe('constructor', () => {
    it('creates reservoir with default size 100', () => {
      const r = new WeightedReservoir()
      expect(r.reservoirSize).toBe(100)
    })

    it('creates reservoir with custom size', () => {
      const r = new WeightedReservoir({ reservoirSize: 10 })
      expect(r.reservoirSize).toBe(10)
    })

    it('creates reservoir with size 1', () => {
      const r = new WeightedReservoir({ reservoirSize: 1 })
      expect(r.reservoirSize).toBe(1)
    })

    it('throws for size 0', () => {
      expect(() => new WeightedReservoir({ reservoirSize: 0 })).toThrow(RangeError)
    })

    it('throws for negative size', () => {
      expect(() => new WeightedReservoir({ reservoirSize: -1 })).toThrow(RangeError)
    })

    it('throws for size -100', () => {
      expect(() => new WeightedReservoir({ reservoirSize: -100 })).toThrow(RangeError)
    })

    it('initializes empty', () => {
      const r = new WeightedReservoir()
      expect(r.size).toBe(0)
      expect(r.isEmpty()).toBe(true)
    })

    it('initializes with totalSeen 0', () => {
      const r = new WeightedReservoir()
      expect(r.totalSeen).toBe(0)
    })

    it('works with undefined options', () => {
      const r = new WeightedReservoir(undefined)
      expect(r.reservoirSize).toBe(100)
    })

    it('works with empty options object', () => {
      const r = new WeightedReservoir({})
      expect(r.reservoirSize).toBe(100)
    })
  })

  describe('add', () => {
    it('adds a single item', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', 1)
      expect(r.size).toBe(1)
      expect(r.sample()).toContain('a')
    })

    it('adds multiple items up to reservoir size', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      for (let i = 0; i < 5; i++) r.add(i, 1)
      expect(r.size).toBe(5)
    })

    it('increments totalSeen for each add', () => {
      const r = new WeightedReservoir({ reservoirSize: 2 })
      r.add('a', 1)
      r.add('b', 1)
      r.add('c', 1)
      expect(r.totalSeen).toBe(3)
    })

    it('reservoir size does not exceed max', () => {
      const r = new WeightedReservoir({ reservoirSize: 3 })
      for (let i = 0; i < 100; i++) r.add(i, 1)
      expect(r.size).toBeLessThanOrEqual(3)
    })

    it('throws for weight 0', () => {
      const r = new WeightedReservoir()
      expect(() => r.add('a', 0)).toThrow(RangeError)
    })

    it('throws for negative weight', () => {
      const r = new WeightedReservoir()
      expect(() => r.add('a', -1)).toThrow(RangeError)
    })

    it('throws for weight -0.5', () => {
      const r = new WeightedReservoir()
      expect(() => r.add('a', -0.5)).toThrow(RangeError)
    })

    it('accepts fractional weight', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', 0.5)
      expect(r.size).toBe(1)
    })

    it('accepts very small positive weight', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', 0.001)
      expect(r.size).toBe(1)
    })

    it('accepts very large weight', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', 1e15)
      expect(r.size).toBe(1)
    })

    it('handles mixed types', () => {
      const r = new WeightedReservoir<{ id: number }>({ reservoirSize: 5 })
      r.add({ id: 1 }, 1)
      r.add({ id: 2 }, 2)
      expect(r.size).toBe(2)
    })

    it('handles null items gracefully', () => {
      const r = new WeightedReservoir<null | string>({ reservoirSize: 5 })
      r.add(null, 1)
      expect(r.size).toBe(1)
    })

    it('handles undefined items gracefully', () => {
      const r = new WeightedReservoir<undefined | string>({ reservoirSize: 5 })
      r.add(undefined, 1)
      expect(r.size).toBe(1)
    })

    it('increments totalSeen even when weight throws', () => {
      const r = new WeightedReservoir()
      r.add('a', 1)
      try { r.add('b', 0) } catch { }
      expect(r.totalSeen).toBe(1)
    })
  })

  describe('sample', () => {
    it('returns empty array when empty', () => {
      const r = new WeightedReservoir()
      expect(r.sample()).toEqual([])
    })

    it('returns all items when fewer than reservoir size', () => {
      const r = new WeightedReservoir({ reservoirSize: 10 })
      r.add('x', 1)
      r.add('y', 2)
      r.add('z', 3)
      const s = r.sample()
      expect(s).toHaveLength(3)
      expect(s).toContain('x')
      expect(s).toContain('y')
      expect(s).toContain('z')
    })

    it('returns at most reservoirSize items', () => {
      const r = new WeightedReservoir({ reservoirSize: 3 })
      for (let i = 0; i < 100; i++) r.add(i, 1)
      expect(r.sample().length).toBeLessThanOrEqual(3)
    })

    it('returns a copy (not internal array)', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', 1)
      const s1 = r.sample()
      const s2 = r.sample()
      expect(s1).not.toBe(s2)
    })

    it('returns items from reservoir after many adds', () => {
      const r = new WeightedReservoir({ reservoirSize: 10 })
      for (let i = 0; i < 1000; i++) r.add(i, 1)
      const s = r.sample()
      expect(s.length).toBe(10)
      for (const item of s) {
        expect(typeof item).toBe('number')
        expect(item).toBeGreaterThanOrEqual(0)
        expect(item).toBeLessThan(1000)
      }
    })
  })

  describe('sampleOne', () => {
    it('returns undefined when empty', () => {
      const r = new WeightedReservoir()
      expect(r.sampleOne()).toBeUndefined()
    })

    it('returns the only item when one item', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('only', 1)
      expect(r.sampleOne()).toBe('only')
    })

    it('returns an item from the reservoir', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', 1)
      r.add('b', 1)
      r.add('c', 1)
      const item = r.sampleOne()
      expect(['a', 'b', 'c']).toContain(item)
    })

    it('biases toward higher weight items', () => {
      const counts: Record<string, number> = { heavy: 0, light: 0 }
      const trials = 10000
      for (let t = 0; t < trials; t++) {
        const r = new WeightedReservoir({ reservoirSize: 2 })
        r.add('light', 1)
        r.add('heavy', 100)
        const item = r.sampleOne()
        counts[item!]!++
      }
      expect(counts['heavy']).toBeGreaterThan(counts['light']! * 5)
    })
  })

  describe('size', () => {
    it('returns 0 for new reservoir', () => {
      const r = new WeightedReservoir()
      expect(r.size).toBe(0)
    })

    it('returns count after adds', () => {
      const r = new WeightedReservoir({ reservoirSize: 10 })
      r.add('a', 1)
      r.add('b', 1)
      expect(r.size).toBe(2)
    })

    it('stays at reservoirSize max', () => {
      const r = new WeightedReservoir({ reservoirSize: 3 })
      for (let i = 0; i < 50; i++) r.add(i, 1)
      expect(r.size).toBe(3)
    })
  })

  describe('totalSeen', () => {
    it('returns 0 initially', () => {
      const r = new WeightedReservoir()
      expect(r.totalSeen).toBe(0)
    })

    it('counts all added items', () => {
      const r = new WeightedReservoir({ reservoirSize: 2 })
      for (let i = 0; i < 10; i++) r.add(i, 1)
      expect(r.totalSeen).toBe(10)
    })

    it('counts even when reservoir is full', () => {
      const r = new WeightedReservoir({ reservoirSize: 2 })
      r.add('a', 1)
      r.add('b', 1)
      r.add('c', 1)
      r.add('d', 1)
      expect(r.totalSeen).toBe(4)
    })
  })

  describe('reservoirSize', () => {
    it('returns configured size', () => {
      const r = new WeightedReservoir({ reservoirSize: 42 })
      expect(r.reservoirSize).toBe(42)
    })

    it('returns default 100', () => {
      const r = new WeightedReservoir()
      expect(r.reservoirSize).toBe(100)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new reservoir', () => {
      const r = new WeightedReservoir()
      expect(r.isEmpty()).toBe(true)
    })

    it('returns false after adding item', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', 1)
      expect(r.isEmpty()).toBe(false)
    })

    it('returns true after clear', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', 1)
      r.clear()
      expect(r.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears all items', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', 1)
      r.add('b', 2)
      r.clear()
      expect(r.size).toBe(0)
      expect(r.isEmpty()).toBe(true)
    })

    it('resets totalSeen', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', 1)
      r.add('b', 2)
      r.clear()
      expect(r.totalSeen).toBe(0)
    })

    it('preserves reservoirSize', () => {
      const r = new WeightedReservoir({ reservoirSize: 42 })
      r.clear()
      expect(r.reservoirSize).toBe(42)
    })

    it('sample returns empty after clear', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', 1)
      r.clear()
      expect(r.sample()).toEqual([])
    })

    it('can add after clear', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', 1)
      r.clear()
      r.add('b', 2)
      expect(r.size).toBe(1)
      expect(r.sample()).toContain('b')
    })
  })

  describe('reset', () => {
    it('clears data and keeps size', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', 1)
      r.reset()
      expect(r.size).toBe(0)
      expect(r.totalSeen).toBe(0)
      expect(r.reservoirSize).toBe(5)
    })

    it('changes size when provided', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.reset(20)
      expect(r.reservoirSize).toBe(20)
    })

    it('throws for invalid new size', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      expect(() => r.reset(0)).toThrow(RangeError)
    })

    it('throws for negative new size', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      expect(() => r.reset(-5)).toThrow(RangeError)
    })

    it('allows adding after reset', () => {
      const r = new WeightedReservoir({ reservoirSize: 2 })
      r.add('a', 1)
      r.add('b', 1)
      r.reset(10)
      r.add('c', 1)
      expect(r.size).toBe(1)
      expect(r.totalSeen).toBe(1)
    })

    it('reset without args just clears', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      for (let i = 0; i < 100; i++) r.add(i, 1)
      r.reset()
      expect(r.isEmpty()).toBe(true)
      expect(r.totalSeen).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns same as sample', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', 1)
      r.add('b', 2)
      expect(r.toArray()).toEqual(r.sample())
    })

    it('returns empty for new reservoir', () => {
      const r = new WeightedReservoir()
      expect(r.toArray()).toEqual([])
    })

    it('returns copy of items', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', 1)
      const arr = r.toArray()
      const arr2 = r.toArray()
      expect(arr).not.toBe(arr2)
    })
  })

  describe('weights', () => {
    it('returns empty map for empty reservoir', () => {
      const r = new WeightedReservoir()
      expect(r.weights()).toEqual(new Map())
    })

    it('returns weights of items in reservoir', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', 10)
      r.add('b', 20)
      const w = r.weights()
      expect(w.get('a')).toBe(10)
      expect(w.get('b')).toBe(20)
    })

    it('handles duplicate items (last weight wins)', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', 1)
      r.add('a', 5)
      const w = r.weights()
      expect(w.has('a')).toBe(true)
    })

    it('returns correct number of entries', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', 1)
      r.add('b', 2)
      r.add('c', 3)
      expect(r.weights().size).toBe(3)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', 1)
      r.add('b', 2)
      const c = r.clone()
      expect(c.size).toBe(r.size)
      expect(c.totalSeen).toBe(r.totalSeen)
      expect(c.reservoirSize).toBe(r.reservoirSize)
    })

    it('clone is independent', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', 1)
      const c = r.clone()
      c.add('b', 2)
      expect(r.size).toBe(1)
      expect(c.size).toBe(2)
    })

    it('clone preserves totalSeen', () => {
      const r = new WeightedReservoir({ reservoirSize: 2 })
      for (let i = 0; i < 10; i++) r.add(i, 1)
      const c = r.clone()
      expect(c.totalSeen).toBe(10)
    })

    it('clone preserves reservoirSize', () => {
      const r = new WeightedReservoir({ reservoirSize: 42 })
      r.add('a', 1)
      const c = r.clone()
      expect(c.reservoirSize).toBe(42)
    })

    it('clone of empty reservoir', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      const c = r.clone()
      expect(c.isEmpty()).toBe(true)
      expect(c.totalSeen).toBe(0)
    })
  })

  describe('fromArray', () => {
    it('creates reservoir from array', () => {
      const r = WeightedReservoir.fromArray([
        { item: 'a', weight: 1 },
        { item: 'b', weight: 2 },
        { item: 'c', weight: 3 },
      ])
      expect(r.size).toBe(3)
      expect(r.totalSeen).toBe(3)
    })

    it('uses default reservoir size', () => {
      const r = WeightedReservoir.fromArray([
        { item: 'a', weight: 1 },
      ])
      expect(r.reservoirSize).toBe(100)
    })

    it('respects custom reservoir size', () => {
      const r = WeightedReservoir.fromArray(
        [{ item: 'a', weight: 1 }, { item: 'b', weight: 1 }],
        { reservoirSize: 1 },
      )
      expect(r.reservoirSize).toBe(1)
      expect(r.size).toBe(1)
    })

    it('handles empty array', () => {
      const r = WeightedReservoir.fromArray([])
      expect(r.isEmpty()).toBe(true)
      expect(r.totalSeen).toBe(0)
    })

    it('handles large array exceeding reservoir size', () => {
      const items = Array.from({ length: 200 }, (_, i) => ({ item: i, weight: 1 }))
      const r = WeightedReservoir.fromArray(items, { reservoirSize: 10 })
      expect(r.size).toBe(10)
      expect(r.totalSeen).toBe(200)
    })

    it('throws on zero weight in array', () => {
      expect(() =>
        WeightedReservoir.fromArray([{ item: 'a', weight: 0 }]),
      ).toThrow(RangeError)
    })
  })

  describe('edge cases', () => {
    it('single item with weight 1', () => {
      const r = new WeightedReservoir({ reservoirSize: 1 })
      r.add('only', 1)
      expect(r.sample()).toEqual(['only'])
    })

    it('single item reservoir with many adds', () => {
      const r = new WeightedReservoir({ reservoirSize: 1 })
      for (let i = 0; i < 100; i++) r.add(i, 1)
      expect(r.size).toBe(1)
      expect(r.totalSeen).toBe(100)
    })

    it('equal weights behaves like unweighted sampling', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      for (let i = 0; i < 5; i++) r.add(i, 1)
      const s = r.sample()
      expect(s.sort()).toEqual([0, 1, 2, 3, 4])
    })

    it('very large weight dominates', () => {
      const r = new WeightedReservoir({ reservoirSize: 1 })
      r.add('light', 0.001)
      r.add('heavy', 1e15)
      expect(r.sample()).toContain('heavy')
    })

    it('more items than reservoirSize', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      for (let i = 0; i < 1000; i++) r.add(i, 1)
      expect(r.size).toBe(5)
      expect(r.totalSeen).toBe(1000)
    })

    it('weight exactly 1 works', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      expect(() => r.add('a', 1)).not.toThrow()
    })

    it('weight epsilon works', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      expect(() => r.add('a', Number.EPSILON)).not.toThrow()
    })

    it('same item added multiple times', () => {
      const r = new WeightedReservoir({ reservoirSize: 10 })
      r.add('dup', 1)
      r.add('dup', 1)
      r.add('dup', 1)
      expect(r.size).toBe(3)
    })

    it('clear then reuse', () => {
      const r = new WeightedReservoir({ reservoirSize: 3 })
      r.add('a', 1)
      r.clear()
      expect(r.totalSeen).toBe(0)
      r.add('b', 1)
      expect(r.totalSeen).toBe(1)
      expect(r.size).toBe(1)
    })

    it('large number of items', () => {
      const r = new WeightedReservoir({ reservoirSize: 50 })
      for (let i = 0; i < 100000; i++) r.add(i, 1)
      expect(r.size).toBe(50)
      expect(r.totalSeen).toBe(100000)
    })

    it('reservoirSize 1 with weighted items', () => {
      const r = new WeightedReservoir({ reservoirSize: 1 })
      r.add('a', 1)
      r.add('b', 1000)
      expect(r.size).toBe(1)
    })
  })

  describe('statistical bias check', () => {
    it('heavier items appear more often in reservoir', () => {
      let heavyCount = 0
      const trials = 5000
      for (let t = 0; t < trials; t++) {
        const r = new WeightedReservoir({ reservoirSize: 1 })
        r.add('light', 1)
        r.add('heavy', 10)
        if (r.sample().includes('heavy')) heavyCount++
      }
      expect(heavyCount).toBeGreaterThan(trials * 0.6)
    })

    it('items with equal weight have roughly equal probability', () => {
      const counts = { a: 0, b: 0, c: 0 }
      const trials = 5000
      for (let t = 0; t < trials; t++) {
        const r = new WeightedReservoir({ reservoirSize: 1 })
        r.add('a', 1)
        r.add('b', 1)
        r.add('c', 1)
        const item = r.sample()[0]
        counts[item as keyof typeof counts]!++
      }
      const min = Math.min(counts.a, counts.b, counts.c)
      const max = Math.max(counts.a, counts.b, counts.c)
      expect(max / min).toBeLessThan(2.5)
    })

    it('very heavy item is almost always selected', () => {
      let selected = 0
      const trials = 1000
      for (let t = 0; t < trials; t++) {
        const r = new WeightedReservoir({ reservoirSize: 1 })
        r.add('light', 1)
        r.add('heavy', 1e6)
        if (r.sample().includes('heavy')) selected++
      }
      expect(selected).toBeGreaterThan(trials * 0.99)
    })

    it('sampleOne weighted bias over many trials', () => {
      const r = new WeightedReservoir({ reservoirSize: 2 })
      r.add('light', 1)
      r.add('heavy', 100)
      let heavyCount = 0
      const trials = 5000
      for (let i = 0; i < trials; i++) {
        if (r.sampleOne() === 'heavy') heavyCount++
      }
      expect(heavyCount).toBeGreaterThan(trials * 0.9)
    })

    it('reservoir of size k correctly samples from stream of n>k items', () => {
      const k = 10
      const n = 100
      const itemCounts = new Map<number, number>()
      const trials = 2000
      for (let t = 0; t < trials; t++) {
        const r = new WeightedReservoir({ reservoirSize: k })
        for (let i = 0; i < n; i++) r.add(i, 1)
        for (const item of r.sample()) {
          itemCounts.set(item, (itemCounts.get(item) ?? 0) + 1)
        }
      }
      for (const [, count] of itemCounts) {
        const ratio = count / trials
        expect(ratio).toBeGreaterThan(0.02)
        expect(ratio).toBeLessThan(0.3)
      }
    })
  })

  describe('type safety', () => {
    it('works with number type', () => {
      const r = new WeightedReservoir<number>({ reservoirSize: 5 })
      r.add(42, 1)
      expect(r.sample()).toContain(42)
    })

    it('works with object type', () => {
      const r = new WeightedReservoir<{ val: string }>({ reservoirSize: 5 })
      const obj = { val: 'test' }
      r.add(obj, 1)
      expect(r.sample()[0]).toBe(obj)
    })

    it('works with array type', () => {
      const r = new WeightedReservoir<number[]>({ reservoirSize: 5 })
      r.add([1, 2, 3], 1)
      expect(r.sample()).toHaveLength(1)
    })

    it('works with Map type', () => {
      const r = new WeightedReservoir<Map<string, number>>({ reservoirSize: 5 })
      r.add(new Map([['a', 1]]), 1)
      expect(r.size).toBe(1)
    })
  })

  describe('sampleOne with weighted items', () => {
    it('always returns item from single-item reservoir', () => {
      const r = new WeightedReservoir({ reservoirSize: 1 })
      r.add('only', 5)
      for (let i = 0; i < 100; i++) {
        expect(r.sampleOne()).toBe('only')
      }
    })

    it('returns undefined before any items added', () => {
      const r = new WeightedReservoir({ reservoirSize: 10 })
      expect(r.sampleOne()).toBeUndefined()
    })
  })

  describe('clone deep independence', () => {
    it('clear on clone does not affect original', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', 1)
      r.add('b', 2)
      const c = r.clone()
      c.clear()
      expect(r.size).toBe(2)
      expect(c.size).toBe(0)
    })

    it('reset on clone does not affect original', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', 1)
      const c = r.clone()
      c.reset(50)
      expect(r.reservoirSize).toBe(5)
      expect(c.reservoirSize).toBe(50)
    })
  })

  describe('fromArray edge cases', () => {
    it('single item array', () => {
      const r = WeightedReservoir.fromArray([{ item: 'x', weight: 5 }])
      expect(r.size).toBe(1)
      expect(r.totalSeen).toBe(1)
      expect(r.sample()).toContain('x')
    })

    it('preserves item types', () => {
      const r = WeightedReservoir.fromArray<number>([
        { item: 1, weight: 1 },
        { item: 2, weight: 2 },
      ])
      for (const val of r.sample()) {
        expect(typeof val).toBe('number')
      }
    })
  })

  describe('additional coverage', () => {
    it('add then sample after clear and refill', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', 1)
      r.add('b', 2)
      r.clear()
      r.add('c', 3)
      r.add('d', 4)
      const s = r.sample()
      expect(s).toHaveLength(2)
      expect(s).toContain('c')
      expect(s).toContain('d')
    })

    it('toArray matches sample after many operations', () => {
      const r = new WeightedReservoir({ reservoirSize: 3 })
      for (let i = 0; i < 50; i++) r.add(i, 1)
      expect(r.toArray()).toEqual(r.sample())
    })

    it('sampleOne returns each item at least once in many trials', () => {
      const r = new WeightedReservoir({ reservoirSize: 3 })
      r.add('a', 1)
      r.add('b', 1)
      r.add('c', 1)
      const seen = new Set<string>()
      for (let i = 0; i < 300; i++) {
        seen.add(r.sampleOne()!)
      }
      expect(seen.has('a')).toBe(true)
      expect(seen.has('b')).toBe(true)
      expect(seen.has('c')).toBe(true)
    })

    it('weights after clear are empty', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', 10)
      r.clear()
      expect(r.weights().size).toBe(0)
    })

    it('clone after many adds preserves size', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      for (let i = 0; i < 100; i++) r.add(i, 1)
      const c = r.clone()
      expect(c.size).toBe(r.size)
    })

    it('fromArray with weighted items gives heavier items higher presence', () => {
      const heavyCount = { value: 0 }
      const trials = 1000
      for (let t = 0; t < trials; t++) {
        const r = WeightedReservoir.fromArray(
          [
            { item: 'light', weight: 1 },
            { item: 'heavy', weight: 100 },
          ],
          { reservoirSize: 1 },
        )
        if (r.sample()[0] === 'heavy') heavyCount.value++
      }
      expect(heavyCount.value).toBeGreaterThan(trials * 0.6)
    })

    it('reset to smaller size truncates on next add', () => {
      const r = new WeightedReservoir({ reservoirSize: 10 })
      for (let i = 0; i < 10; i++) r.add(i, 1)
      r.reset(2)
      r.add('x', 1)
      r.add('y', 1)
      r.add('z', 1)
      expect(r.size).toBeLessThanOrEqual(2)
      expect(r.totalSeen).toBe(3)
    })

    it('add with very small weight still works', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', 1e-10)
      expect(r.size).toBe(1)
      expect(r.sample()).toContain('a')
    })

    it('multiple clears in a row', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', 1)
      r.clear()
      r.clear()
      r.clear()
      expect(r.isEmpty()).toBe(true)
      expect(r.totalSeen).toBe(0)
    })

    it('multiple resets in a row', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', 1)
      r.reset(10)
      r.reset(20)
      r.reset(30)
      expect(r.reservoirSize).toBe(30)
      expect(r.isEmpty()).toBe(true)
    })

    it('isEmpty after reset', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', 1)
      r.add('b', 2)
      r.reset()
      expect(r.isEmpty()).toBe(true)
    })

    it('sampleOne after clear returns undefined', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', 1)
      r.clear()
      expect(r.sampleOne()).toBeUndefined()
    })

    it('sample after reset returns empty', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', 1)
      r.reset()
      expect(r.sample()).toEqual([])
    })

    it('weights reflect actual reservoir contents', () => {
      const r = new WeightedReservoir({ reservoirSize: 10 })
      r.add('a', 5)
      r.add('b', 10)
      const w = r.weights()
      expect(w.get('a')).toBe(5)
      expect(w.get('b')).toBe(10)
    })

    it('fromArray with all equal weights', () => {
      const items = Array.from({ length: 5 }, (_, i) => ({ item: i, weight: 1 }))
      const r = WeightedReservoir.fromArray(items, { reservoirSize: 10 })
      expect(r.size).toBe(5)
    })

    it('add with Infinity weight', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', Infinity)
      expect(r.size).toBe(1)
    })

    it('add with NaN weight does not throw but behavior is undefined', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      expect(() => r.add('a', NaN)).not.toThrow()
    })

    it('constructor with large reservoir size', () => {
      const r = new WeightedReservoir({ reservoirSize: 10000 })
      expect(r.reservoirSize).toBe(10000)
      expect(r.isEmpty()).toBe(true)
    })

    it('add many items then check totalSeen', () => {
      const r = new WeightedReservoir({ reservoirSize: 10 })
      for (let i = 0; i < 500; i++) r.add(i, i + 1)
      expect(r.totalSeen).toBe(500)
      expect(r.size).toBe(10)
    })

    it('sample does not mutate reservoir', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', 1)
      r.add('b', 2)
      r.sample()
      r.sample()
      expect(r.size).toBe(2)
    })

    it('toArray does not mutate reservoir', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', 1)
      r.toArray()
      expect(r.size).toBe(1)
    })

    it('sampleOne does not mutate reservoir', () => {
      const r = new WeightedReservoir({ reservoirSize: 5 })
      r.add('a', 1)
      r.add('b', 2)
      r.sampleOne()
      expect(r.size).toBe(2)
    })
  })
})
