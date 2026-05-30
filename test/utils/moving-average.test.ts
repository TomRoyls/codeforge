import { describe, it, expect } from 'vitest'
import { MovingAverage } from '../../src/utils/moving-average.js'

describe('MovingAverage', () => {
  it('creates with default window size of 10', () => {
    const ma = new MovingAverage()
    expect(ma.windowSize).toBe(10)
  })

  it('creates with custom window size', () => {
    const ma = new MovingAverage(5)
    expect(ma.windowSize).toBe(5)
  })

  it('calculates average for single value', () => {
    const ma = new MovingAverage()
    ma.push(10)
    expect(ma.average).toBe(10)
  })

  it('calculates average for multiple values', () => {
    const ma = new MovingAverage()
    ma.push(10)
    ma.push(20)
    ma.push(30)
    expect(ma.average).toBe(20)
  })

  it('slides window when size exceeds max', () => {
    const ma = new MovingAverage(3)
    ma.push(1)
    ma.push(2)
    ma.push(3)
    ma.push(4)
    expect(ma.size).toBe(3)
    expect(ma.average).toBe(3)
  })

  it('correctly tracks size', () => {
    const ma = new MovingAverage(5)
    expect(ma.size).toBe(0)
    ma.push(1)
    expect(ma.size).toBe(1)
    ma.push(2)
    expect(ma.size).toBe(2)
    ma.push(3)
    expect(ma.size).toBe(3)
    ma.push(4)
    expect(ma.size).toBe(4)
    ma.push(5)
    expect(ma.size).toBe(5)
    ma.push(6)
    expect(ma.size).toBe(5)
  })

  it('calculates min correctly', () => {
    const ma = new MovingAverage()
    ma.push(5)
    ma.push(2)
    ma.push(8)
    ma.push(1)
    expect(ma.min).toBe(1)
  })

  it('calculates max correctly', () => {
    const ma = new MovingAverage()
    ma.push(5)
    ma.push(2)
    ma.push(8)
    ma.push(1)
    expect(ma.max).toBe(8)
  })

  it('returns 0 for min on empty window', () => {
    const ma = new MovingAverage()
    expect(ma.min).toBe(0)
  })

  it('returns 0 for max on empty window', () => {
    const ma = new MovingAverage()
    expect(ma.max).toBe(0)
  })

  it('calculates variance correctly', () => {
    const ma = new MovingAverage()
    ma.push(1)
    ma.push(2)
    ma.push(3)
    const expectedVariance = ((1 - 2) * (1 - 2) + (2 - 2) * (2 - 2) + (3 - 2) * (3 - 2)) / 3
    expect(ma.variance).toBe(expectedVariance)
  })

  it('calculates standard deviation correctly', () => {
    const ma = new MovingAverage()
    ma.push(1)
    ma.push(2)
    ma.push(3)
    expect(ma.stddev).toBe(Math.sqrt(ma.variance))
  })

  it('returns 0 for variance on empty window', () => {
    const ma = new MovingAverage()
    expect(ma.variance).toBe(0)
  })

  it('returns 0 for stddev on empty window', () => {
    const ma = new MovingAverage()
    expect(ma.stddev).toBe(0)
  })

  it('resets all state', () => {
    const ma = new MovingAverage()
    ma.push(10)
    ma.push(20)
    ma.push(30)
    ma.reset()
    expect(ma.size).toBe(0)
    expect(ma.average).toBe(0)
    expect(ma.min).toBe(0)
    expect(ma.max).toBe(0)
    expect(ma.variance).toBe(0)
  })

  it('converts to array', () => {
    const ma = new MovingAverage()
    ma.push(1)
    ma.push(2)
    ma.push(3)
    expect(ma.toArray()).toEqual([1, 2, 3])
  })

  it('returns empty array when empty', () => {
    const ma = new MovingAverage()
    expect(ma.toArray()).toEqual([])
  })

  it('handles negative numbers', () => {
    const ma = new MovingAverage()
    ma.push(-5)
    ma.push(-10)
    ma.push(0)
    expect(ma.average).toBe(-5)
    expect(ma.min).toBe(-10)
    expect(ma.max).toBe(0)
  })

  it('handles zero values', () => {
    const ma = new MovingAverage()
    ma.push(0)
    ma.push(0)
    ma.push(0)
    expect(ma.average).toBe(0)
    expect(ma.min).toBe(0)
    expect(ma.max).toBe(0)
  })

  it('handles fractional values', () => {
    const ma = new MovingAverage()
    ma.push(1.5)
    ma.push(2.5)
    ma.push(3.5)
    expect(ma.average).toBe(2.5)
  })

  it('compacts internal array after many operations', () => {
    const ma = new MovingAverage(10)
    for (let i = 0; i < 100; i++) {
      ma.push(i)
    }
    expect(ma.size).toBe(10)
  })

  it('maintains correct stats after sliding window', () => {
    const ma = new MovingAverage(3)
    ma.push(10)
    ma.push(20)
    ma.push(30)
    ma.push(40)
    expect(ma.average).toBe(30)
    expect(ma.min).toBe(20)
    expect(ma.max).toBe(40)
  })

  it('handles rapid successive pushes', () => {
    const ma = new MovingAverage(100)
    for (let i = 0; i < 1000; i++) {
      ma.push(i)
    }
    expect(ma.size).toBe(100)
  })

  it('returns correct stats after reset and refill', () => {
    const ma = new MovingAverage()
    ma.push(10)
    ma.push(20)
    ma.reset()
    ma.push(5)
    ma.push(10)
    ma.push(15)
    expect(ma.average).toBe(10)
    expect(ma.min).toBe(5)
    expect(ma.max).toBe(15)
  })

  it('handles single element window', () => {
    const ma = new MovingAverage(1)
    ma.push(10)
    expect(ma.average).toBe(10)
    expect(ma.min).toBe(10)
    expect(ma.max).toBe(10)
    ma.push(20)
    expect(ma.average).toBe(20)
    expect(ma.min).toBe(20)
    expect(ma.max).toBe(20)
  })

  it('calculates variance correctly after window slide', () => {
    const ma = new MovingAverage(3)
    ma.push(1)
    ma.push(2)
    ma.push(3)
    const var1 = ma.variance
    ma.push(4)
    const var2 = ma.variance
    expect(var1).toBe(0.6666666666666666)
    expect(var2).toBe(0.6666666666666666)
  })
})