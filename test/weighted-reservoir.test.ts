import { describe, it, expect } from 'vitest'
import { WeightedReservoir } from '../src/core/weighted-reservoir/index.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('WeightedReservoir', () => {
  describe('constructor', () => {
    it('creates with default reservoirSize of 100', () => {
      const r = new WeightedReservoir<number>()
      expect(r.reservoirSize).toBe(100)
    })

    it('creates with custom reservoirSize', () => {
      const r = new WeightedReservoir<number>({ reservoirSize: 5 })
      expect(r.reservoirSize).toBe(5)
    })

    it('throws RangeError for reservoirSize < 1', () => {
      expect(() => new WeightedReservoir({ reservoirSize: 0 })).toThrow(RangeError)
      expect(() => new WeightedReservoir({ reservoirSize: -1 })).toThrow(RangeError)
    })

    it('starts empty with zero totalSeen', () => {
      const r = new WeightedReservoir<string>()
      expect(r.isEmpty()).toBe(true)
      expect(r.size).toBe(0)
      expect(r.totalSeen).toBe(0)
    })
  })

  // ─── add ──────────────────────────────────────────────────────────────

  describe('add', () => {
    it('adds items and increases size and totalSeen', () => {
      const r = new WeightedReservoir<string>({ reservoirSize: 10 })
      r.add('a', 1)
      r.add('b', 2)
      r.add('c', 3)
      expect(r.size).toBe(3)
      expect(r.totalSeen).toBe(3)
    })

    it('throws RangeError for weight <= 0', () => {
      const r = new WeightedReservoir<number>()
      expect(() => r.add(1, 0)).toThrow(RangeError)
      expect(() => r.add(2, -1)).toThrow(RangeError)
    })

    it('respects the reservoirSize limit', () => {
      const r = new WeightedReservoir<number>({ reservoirSize: 3 })
      for (let i = 0; i < 100; i++) {
        r.add(i, 1)
      }
      expect(r.size).toBe(3)
      expect(r.totalSeen).toBe(100)
    })

    it('accepts items with same weight', () => {
      const r = new WeightedReservoir<number>({ reservoirSize: 10 })
      r.add(1, 5)
      r.add(2, 5)
      r.add(3, 5)
      expect(r.size).toBe(3)
    })
  })

  // ─── sample / sampleOne ───────────────────────────────────────────────

  describe('sample', () => {
    it('returns all items when fewer than reservoirSize', () => {
      const r = new WeightedReservoir<string>({ reservoirSize: 10 })
      r.add('x', 1)
      r.add('y', 2)
      const s = r.sample()
      expect(s).toContain('x')
      expect(s).toContain('y')
      expect(s.length).toBe(2)
    })

    it('returns exactly reservoirSize items when more added', () => {
      const r = new WeightedReservoir<number>({ reservoirSize: 2 })
      for (let i = 0; i < 50; i++) r.add(i, 1)
      expect(r.sample().length).toBe(2)
    })
  })

  describe('sampleOne', () => {
    it('returns undefined on empty reservoir', () => {
      const r = new WeightedReservoir<number>()
      expect(r.sampleOne()).toBeUndefined()
    })

    it('returns one of the sampled items', () => {
      const r = new WeightedReservoir<string>({ reservoirSize: 10 })
      r.add('a', 1)
      r.add('b', 1)
      r.add('c', 1)
      const result = r.sampleOne()
      expect(['a', 'b', 'c']).toContain(result)
    })
  })

  // ─── weights ──────────────────────────────────────────────────────────

  describe('weights', () => {
    it('returns a Map of items to their weights', () => {
      const r = new WeightedReservoir<string>({ reservoirSize: 10 })
      r.add('a', 10)
      r.add('b', 20)
      const w = r.weights()
      expect(w.get('a')).toBe(10)
      expect(w.get('b')).toBe(20)
      expect(w.size).toBe(2)
    })

    it('returns empty Map for empty reservoir', () => {
      const r = new WeightedReservoir<number>()
      expect(r.weights().size).toBe(0)
    })
  })

  // ─── clear / reset ────────────────────────────────────────────────────

  describe('clear', () => {
    it('clears all items and resets totalSeen', () => {
      const r = new WeightedReservoir<number>({ reservoirSize: 5 })
      r.add(1, 1)
      r.add(2, 2)
      r.clear()
      expect(r.isEmpty()).toBe(true)
      expect(r.size).toBe(0)
      expect(r.totalSeen).toBe(0)
    })
  })

  describe('reset', () => {
    it('clears items but keeps original reservoirSize', () => {
      const r = new WeightedReservoir<number>({ reservoirSize: 5 })
      r.add(1, 1)
      r.reset()
      expect(r.isEmpty()).toBe(true)
      expect(r.reservoirSize).toBe(5)
    })

    it('sets new reservoirSize when provided', () => {
      const r = new WeightedReservoir<number>({ reservoirSize: 5 })
      r.add(1, 1)
      r.reset(10)
      expect(r.isEmpty()).toBe(true)
      expect(r.reservoirSize).toBe(10)
    })

    it('throws RangeError for newSize < 1', () => {
      const r = new WeightedReservoir<number>()
      expect(() => r.reset(0)).toThrow(RangeError)
    })
  })

  // ─── clone ────────────────────────────────────────────────────────────

  describe('clone', () => {
    it('produces an independent copy', () => {
      const r = new WeightedReservoir<number>({ reservoirSize: 10 })
      r.add(1, 1)
      r.add(2, 2)
      const c = r.clone()
      expect(c.size).toBe(r.size)
      expect(c.totalSeen).toBe(r.totalSeen)
      expect(c.reservoirSize).toBe(r.reservoirSize)
      r.clear()
      expect(c.size).toBe(2)
    })
  })

  // ─── fromArray ────────────────────────────────────────────────────────

  describe('fromArray', () => {
    it('creates a reservoir from an array of items', () => {
      const r = WeightedReservoir.fromArray([
        { item: 'a', weight: 1 },
        { item: 'b', weight: 2 },
        { item: 'c', weight: 3 },
      ])
      expect(r.size).toBe(3)
      expect(r.totalSeen).toBe(3)
    })

    it('respects custom options', () => {
      const r = WeightedReservoir.fromArray(
        [{ item: 1, weight: 1 }, { item: 2, weight: 1 }],
        { reservoirSize: 1 },
      )
      expect(r.reservoirSize).toBe(1)
      expect(r.size).toBe(1)
    })
  })

  // ─── toArray ──────────────────────────────────────────────────────────

  describe('toArray', () => {
    it('returns same result as sample', () => {
      const r = new WeightedReservoir<number>({ reservoirSize: 10 })
      r.add(1, 1)
      r.add(2, 2)
      expect(r.toArray()).toEqual(r.sample())
    })
  })
})
