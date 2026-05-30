import { describe, it, expect } from 'vitest'
import { ExponentialCounter } from '../../../src/utils/exponential-counter.js'

describe('ExponentialCounter', () => {
  describe('increment', () => {
    it('increments to 1', () => {
      const ec = new ExponentialCounter()
      ec.increment()
      expect(ec.value).toBe(1)
    })

    it('increments multiple times', () => {
      const ec = new ExponentialCounter()
      for (let i = 0; i < 10; i++) ec.increment()
      expect(ec.value).toBe(10)
    })

    it('tracks large counts', () => {
      const ec = new ExponentialCounter()
      for (let i = 0; i < 1000; i++) ec.increment()
      expect(ec.value).toBe(1000)
    })
  })

  describe('approximate', () => {
    it('returns exact for small counts', () => {
      const ec = new ExponentialCounter(10)
      for (let i = 0; i < 5; i++) ec.increment()
      expect(ec.approximate).toBe(5)
    })

    it('returns approximate for large counts', () => {
      const ec = new ExponentialCounter(10)
      for (let i = 0; i < 100; i++) ec.increment()
      expect(ec.approximate).toBeGreaterThan(0)
      expect(ec.approximate).toBeLessThanOrEqual(100)
    })
  })

  describe('add', () => {
    it('adds a value directly', () => {
      const ec = new ExponentialCounter()
      ec.add(42)
      expect(ec.value).toBe(42)
    })
  })

  describe('reset', () => {
    it('clears counter', () => {
      const ec = new ExponentialCounter()
      ec.increment()
      ec.increment()
      ec.reset()
      expect(ec.value).toBe(0)
      expect(ec.isCompressed).toBe(false)
    })
  })

  describe('merge', () => {
    it('merges two counters', () => {
      const a = new ExponentialCounter()
      const b = new ExponentialCounter()
      a.add(5)
      b.add(7)
      a.merge(b)
      expect(a.value).toBe(12)
    })
  })

  describe('isCompressed', () => {
    it('returns false for small counts', () => {
      const ec = new ExponentialCounter(100)
      ec.add(50)
      expect(ec.isCompressed).toBe(false)
    })

    it('returns true for large counts', () => {
      const ec = new ExponentialCounter(100)
      ec.add(200)
      expect(ec.isCompressed).toBe(true)
    })
  })
})
