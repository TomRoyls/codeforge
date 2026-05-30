import { describe, it, expect } from 'vitest'
import { ExponentialMovingAverage, DoubleExponentialMovingAverage } from '../../src/utils/exponential-moving-average.js'

describe('ExponentialMovingAverage', () => {
  it('constructor accepts valid alpha', () => {
    const ema = new ExponentialMovingAverage(0.5)
    expect(ema).toBeDefined()
  })

  it('constructor throws for alpha <= 0', () => {
    expect(() => new ExponentialMovingAverage(0)).toThrow(RangeError)
    expect(() => new ExponentialMovingAverage(-0.1)).toThrow(RangeError)
  })

  it('constructor throws for alpha > 1', () => {
    expect(() => new ExponentialMovingAverage(1.1)).toThrow(RangeError)
    expect(() => new ExponentialMovingAverage(2)).toThrow(RangeError)
  })

  it('constructor accepts alpha = 1', () => {
    const ema = new ExponentialMovingAverage(1)
    expect(ema).toBeDefined()
  })

  it('constructor defaults alpha to 0.1', () => {
    const ema = new ExponentialMovingAverage()
    expect(ema).toBeDefined()
  })

  it('first push sets value', () => {
    const ema = new ExponentialMovingAverage(0.5)
    ema.push(10)
    expect(ema.value).toBe(10)
  })

  it('subsequent push updates value', () => {
    const ema = new ExponentialMovingAverage(0.5)
    ema.push(10)
    ema.push(20)
    expect(ema.value).toBeCloseTo(15)
  })

  it('value returns 0 before first push', () => {
    const ema = new ExponentialMovingAverage()
    expect(ema.value).toBe(0)
  })

  it('count increments with each push', () => {
    const ema = new ExponentialMovingAverage()
    expect(ema.count).toBe(0)
    ema.push(10)
    expect(ema.count).toBe(1)
    ema.push(20)
    expect(ema.count).toBe(2)
  })

  it('reset clears value and count', () => {
    const ema = new ExponentialMovingAverage()
    ema.push(10)
    ema.push(20)
    ema.reset()
    expect(ema.value).toBe(0)
    expect(ema.count).toBe(0)
  })

  it('smoothing factor works correctly', () => {
    const ema1 = new ExponentialMovingAverage(0.1)
    const ema2 = new ExponentialMovingAverage(0.9)
    ema1.push(100)
    ema1.push(200)
    ema2.push(100)
    ema2.push(200)
    expect(ema2.value).toBeGreaterThan(ema1.value)
  })

  it('handles negative values', () => {
    const ema = new ExponentialMovingAverage(0.5)
    ema.push(-10)
    ema.push(-20)
    expect(ema.value).toBeCloseTo(-15)
  })

  it('handles decimal values', () => {
    const ema = new ExponentialMovingAverage(0.5)
    ema.push(10.5)
    ema.push(20.7)
    expect(ema.value).toBeCloseTo(15.6)
  })
})

describe('DoubleExponentialMovingAverage', () => {
  it('constructor accepts valid alpha', () => {
    const dema = new DoubleExponentialMovingAverage(0.5)
    expect(dema).toBeDefined()
  })

  it('constructor defaults alpha to 0.1', () => {
    const dema = new DoubleExponentialMovingAverage()
    expect(dema).toBeDefined()
  })

  it('level returns 0 before first push', () => {
    const dema = new DoubleExponentialMovingAverage()
    expect(dema.level).toBe(0)
  })

  it('trend returns 0 before first push', () => {
    const dema = new DoubleExponentialMovingAverage()
    expect(dema.trend).toBe(0)
  })

  it('forecast returns level before first push', () => {
    const dema = new DoubleExponentialMovingAverage()
    expect(dema.forecast()).toBe(0)
  })

  it('count returns 0 before first push', () => {
    const dema = new DoubleExponentialMovingAverage()
    expect(dema.count).toBe(0)
  })

  it('level updates after push', () => {
    const dema = new DoubleExponentialMovingAverage(0.5)
    dema.push(10)
    expect(dema.level).toBeCloseTo(10)
  })

  it('trend calculates correctly', () => {
    const dema = new DoubleExponentialMovingAverage(0.5)
    dema.push(10)
    dema.push(20)
    expect(dema.trend).toBeCloseTo(2.5)
  })

  it('forecast predicts future values', () => {
    const dema = new DoubleExponentialMovingAverage(0.5)
    dema.push(10)
    dema.push(20)
    const forecast = dema.forecast(1)
    expect(forecast).toBeGreaterThan(dema.level)
  })

  it('count increments with each push', () => {
    const dema = new DoubleExponentialMovingAverage()
    dema.push(10)
    expect(dema.count).toBe(1)
    dema.push(20)
    expect(dema.count).toBe(2)
  })

  it('reset clears all state', () => {
    const dema = new DoubleExponentialMovingAverage()
    dema.push(10)
    dema.push(20)
    dema.reset()
    expect(dema.level).toBe(0)
    expect(dema.trend).toBe(0)
    expect(dema.count).toBe(0)
  })

  it('forecast with multiple steps extrapolates', () => {
    const dema = new DoubleExponentialMovingAverage(0.5)
    dema.push(10)
    dema.push(20)
    const forecast1 = dema.forecast(1)
    const forecast2 = dema.forecast(2)
    expect(forecast2).toBeGreaterThan(forecast1)
  })
})