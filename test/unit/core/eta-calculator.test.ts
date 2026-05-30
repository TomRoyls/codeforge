import { describe, expect, it } from 'vitest'

import { ETACalculator } from '../../../src/core/progress-tracker/eta-calculator.js'

describe('ETACalculator', () => {
  it('returns 0 rate with no history', () => {
    const calc = new ETACalculator()
    expect(calc.calculateRate()).toBe(0)
  })

  it('returns 0 rate with single point', () => {
    const calc = new ETACalculator()
    calc.record(1000, 0)
    expect(calc.calculateRate()).toBe(0)
  })

  it('calculates rate from two points', () => {
    const calc = new ETACalculator()
    calc.record(0, 0)
    calc.record(1000, 10)
    expect(calc.calculateRate()).toBe(10)
  })

  it('calculates rate per second', () => {
    const calc = new ETACalculator()
    calc.record(0, 0)
    calc.record(2000, 100)
    expect(calc.calculateRate()).toBe(50)
  })

  it('calculates ETA from rate', () => {
    const calc = new ETACalculator()
    calc.record(0, 0)
    calc.record(1000, 50)
    const eta = calc.calculateETA(50, 100)
    expect(eta).toBe(1000)
  })

  it('returns 0 ETA when rate is 0', () => {
    const calc = new ETACalculator()
    expect(calc.calculateETA(0, 100)).toBe(0)
  })

  it('returns 0 ETA when already complete', () => {
    const calc = new ETACalculator()
    calc.record(0, 0)
    calc.record(1000, 100)
    expect(calc.calculateETA(100, 100)).toBe(0)
  })

  it('calculates percent', () => {
    const calc = new ETACalculator()
    expect(calc.calculatePercent(50, 100)).toBe(50)
  })

  it('clamps percent above 100', () => {
    const calc = new ETACalculator()
    expect(calc.calculatePercent(150, 100)).toBe(100)
  })

  it('returns 0 percent for zero total', () => {
    const calc = new ETACalculator()
    expect(calc.calculatePercent(0, 0)).toBe(0)
  })

  it('trims history to maxSize', () => {
    const calc = new ETACalculator(5)
    for (let i = 0; i < 10; i++) {
      calc.record(i * 100, i * 10)
    }
    expect(calc.getHistory()).toHaveLength(5)
  })

  it('getHistory returns copy', () => {
    const calc = new ETACalculator()
    calc.record(0, 0)
    const h1 = calc.getHistory()
    const h2 = calc.getHistory()
    expect(h1).not.toBe(h2)
  })

  it('clear removes all history', () => {
    const calc = new ETACalculator()
    calc.record(0, 0)
    calc.record(1000, 10)
    calc.clear()
    expect(calc.getHistory()).toHaveLength(0)
    expect(calc.calculateRate()).toBe(0)
  })
})
