import { describe, expect, it } from 'vitest'

import { ETACalculator } from '../../../src/core/progress-tracker/eta-calculator.js'

// ─── Constructor ───

describe('ETACalculator', () => {
  describe('constructor', () => {
    it('creates with default history size', () => {
      const eta = new ETACalculator()
      expect(eta.getHistory()).toEqual([])
    })

    it('creates with custom history size', () => {
      const eta = new ETACalculator(10)
      expect(eta.getHistory()).toEqual([])
    })
  })

  // ─── record ───

  describe('record', () => {
    it('records history points', () => {
      const eta = new ETACalculator()
      eta.record(1000, 10)
      eta.record(2000, 20)

      const history = eta.getHistory()
      expect(history).toHaveLength(2)
      expect(history[0]).toEqual({ timestamp: 1000, value: 10 })
      expect(history[1]).toEqual({ timestamp: 2000, value: 20 })
    })

    it('trims history to maxSize', () => {
      const eta = new ETACalculator(3)
      eta.record(1000, 1)
      eta.record(2000, 2)
      eta.record(3000, 3)
      eta.record(4000, 4)

      expect(eta.getHistory()).toHaveLength(3)
      expect(eta.getHistory()[0]!.value).toBe(2)
    })
  })

  // ─── calculateRate ───

  describe('calculateRate', () => {
    it('returns 0 with no history', () => {
      const eta = new ETACalculator()
      expect(eta.calculateRate()).toBe(0)
    })

    it('returns 0 with single point', () => {
      const eta = new ETACalculator()
      eta.record(1000, 50)
      expect(eta.calculateRate()).toBe(0)
    })

    it('calculates rate as value change per second', () => {
      const eta = new ETACalculator()
      eta.record(0, 0)
      eta.record(1000, 100)

      expect(eta.calculateRate()).toBe(100)
    })

    it('handles 2-second span', () => {
      const eta = new ETACalculator()
      eta.record(0, 0)
      eta.record(2000, 100)

      expect(eta.calculateRate()).toBe(50)
    })

    it('returns 0 when timeDiff is 0', () => {
      const eta = new ETACalculator()
      eta.record(1000, 10)
      eta.record(1000, 20)

      expect(eta.calculateRate()).toBe(0)
    })
  })

  // ─── calculateETA ───

  describe('calculateETA', () => {
    it('returns 0 when rate is 0', () => {
      const eta = new ETACalculator()
      expect(eta.calculateETA(50, 100)).toBe(0)
    })

    it('calculates ETA in milliseconds', () => {
      const eta = new ETACalculator()
      eta.record(0, 0)
      eta.record(1000, 50)

      const etaMs = eta.calculateETA(50, 100)
      expect(etaMs).toBe(1000)
    })

    it('returns 0 when current >= total', () => {
      const eta = new ETACalculator()
      eta.record(0, 0)
      eta.record(1000, 100)

      expect(eta.calculateETA(100, 100)).toBe(0)
      expect(eta.calculateETA(200, 100)).toBe(0)
    })

    it('returns 0 when remaining is 0', () => {
      const eta = new ETACalculator()
      eta.record(0, 0)
      eta.record(1000, 100)

      expect(eta.calculateETA(100, 100)).toBe(0)
    })
  })

  // ─── calculatePercent ───

  describe('calculatePercent', () => {
    it('returns 0 when total is 0', () => {
      const eta = new ETACalculator()
      expect(eta.calculatePercent(0, 0)).toBe(0)
    })

    it('calculates percentage correctly', () => {
      const eta = new ETACalculator()
      expect(eta.calculatePercent(50, 100)).toBe(50)
    })

    it('clamps to 100', () => {
      const eta = new ETACalculator()
      expect(eta.calculatePercent(200, 100)).toBe(100)
    })

    it('returns 0 for 0 progress', () => {
      const eta = new ETACalculator()
      expect(eta.calculatePercent(0, 100)).toBe(0)
    })

    it('handles fractional progress', () => {
      const eta = new ETACalculator()
      expect(eta.calculatePercent(1, 3)).toBeCloseTo(33.333)
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('clears history', () => {
      const eta = new ETACalculator()
      eta.record(1000, 50)
      eta.clear()
      expect(eta.getHistory()).toEqual([])
    })
  })

  // ─── getHistory ───

  describe('getHistory', () => {
    it('returns a copy of history', () => {
      const eta = new ETACalculator()
      eta.record(1000, 50)
      const history = eta.getHistory()
      history.push({ timestamp: 9999, value: 999 })
      expect(eta.getHistory()).toHaveLength(1)
    })
  })
})
