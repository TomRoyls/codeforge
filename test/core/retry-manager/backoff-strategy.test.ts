import { describe, expect, it } from 'vitest'

import { BackoffStrategy } from '../../../src/core/retry-manager/backoff-strategy.js'

// ─── Constructor ───

describe('BackoffStrategy', () => {
  describe('constructor', () => {
    it('uses default config when no config provided', () => {
      const strategy = new BackoffStrategy()
      expect(strategy.getInitialDelay()).toBe(100)
      expect(strategy.getMaxDelay()).toBe(30000)
    })

    it('merges partial config with defaults', () => {
      const strategy = new BackoffStrategy({ initialDelay: 200 })
      expect(strategy.getInitialDelay()).toBe(200)
      expect(strategy.getMaxDelay()).toBe(30000)
    })

    it('overrides maxDelay', () => {
      const strategy = new BackoffStrategy({ maxDelay: 5000 })
      expect(strategy.getMaxDelay()).toBe(5000)
    })
  })

  // ─── calculateDelay ───

  describe('calculateDelay', () => {
    it('returns initialDelay for attempt 0', () => {
      const strategy = new BackoffStrategy({ initialDelay: 100, backoffMultiplier: 2 })
      expect(strategy.calculateDelay(0)).toBe(100)
    })

    it('multiplies by backoffMultiplier for attempt 1', () => {
      const strategy = new BackoffStrategy({ initialDelay: 100, backoffMultiplier: 2 })
      expect(strategy.calculateDelay(1)).toBe(200)
    })

    it('multiplies exponentially', () => {
      const strategy = new BackoffStrategy({ initialDelay: 100, backoffMultiplier: 2 })
      expect(strategy.calculateDelay(2)).toBe(400)
      expect(strategy.calculateDelay(3)).toBe(800)
    })

    it('caps at maxDelay', () => {
      const strategy = new BackoffStrategy({ initialDelay: 100, backoffMultiplier: 2, maxDelay: 500 })
      expect(strategy.calculateDelay(10)).toBe(500)
    })

    it('works with backoffMultiplier of 1 (constant delay)', () => {
      const strategy = new BackoffStrategy({ initialDelay: 100, backoffMultiplier: 1 })
      expect(strategy.calculateDelay(0)).toBe(100)
      expect(strategy.calculateDelay(5)).toBe(100)
    })
  })

  // ─── addJitter ───

  describe('addJitter', () => {
    it('returns a value between 50% and 100% of input', () => {
      const strategy = new BackoffStrategy()
      const delay = 1000
      for (let i = 0; i < 50; i++) {
        const jittered = strategy.addJitter(delay)
        expect(jittered).toBeGreaterThanOrEqual(500)
        expect(jittered).toBeLessThanOrEqual(1000)
      }
    })

    it('returns 0 for delay 0', () => {
      const strategy = new BackoffStrategy()
      expect(strategy.addJitter(0)).toBe(0)
    })
  })

  // ─── getConfig ───

  describe('getConfig', () => {
    it('returns a copy of the config', () => {
      const strategy = new BackoffStrategy({ initialDelay: 200 })
      const config = strategy.getConfig()
      expect(config.initialDelay).toBe(200)
      config.initialDelay = 999
      expect(strategy.getInitialDelay()).toBe(200)
    })
  })
})
