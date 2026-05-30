import { describe, it, expect } from 'vitest'
import { StreamingMedian } from '../../src/utils/streaming-median.js'

describe('StreamingMedian', () => {
  it('should return 0 for median when empty', () => {
    const sm = new StreamingMedian()
    expect(sm.median()).toBe(0)
  })

  it('should return 0 for mean when empty', () => {
    const sm = new StreamingMedian()
    expect(sm.mean()).toBe(0)
  })

  it('should return 0 for min when empty', () => {
    const sm = new StreamingMedian()
    expect(sm.min()).toBe(0)
  })

  it('should return 0 for max when empty', () => {
    const sm = new StreamingMedian()
    expect(sm.max()).toBe(0)
  })

  it('should have count 0 when empty', () => {
    const sm = new StreamingMedian()
    expect(sm.count).toBe(0)
  })

  it('should have sum 0 when empty', () => {
    const sm = new StreamingMedian()
    expect(sm.sum).toBe(0)
  })

  it('should calculate correct median for single value', () => {
    const sm = new StreamingMedian()
    sm.push(5)
    expect(sm.median()).toBe(5)
  })

  it('should calculate correct median for two values', () => {
    const sm = new StreamingMedian()
    sm.push(3)
    sm.push(7)
    expect(sm.median()).toBe(5)
  })

  it('should calculate correct median for odd number of values', () => {
    const sm = new StreamingMedian()
    sm.push(1)
    sm.push(5)
    sm.push(3)
    expect(sm.median()).toBe(3)
  })

  it('should calculate correct median for even number of values', () => {
    const sm = new StreamingMedian()
    sm.push(1)
    sm.push(2)
    sm.push(3)
    sm.push(4)
    expect(sm.median()).toBe(2.5)
  })

  it('should calculate correct mean', () => {
    const sm = new StreamingMedian()
    sm.push(1)
    sm.push(2)
    sm.push(3)
    sm.push(4)
    sm.push(5)
    expect(sm.mean()).toBe(3)
  })

  it('should track correct count', () => {
    const sm = new StreamingMedian()
    sm.push(1)
    sm.push(2)
    sm.push(3)
    expect(sm.count).toBe(3)
  })

  it('should track correct sum', () => {
    const sm = new StreamingMedian()
    sm.push(1)
    sm.push(2)
    sm.push(3)
    expect(sm.sum).toBe(6)
  })

  it('should find correct min', () => {
    const sm = new StreamingMedian()
    sm.push(5)
    sm.push(2)
    sm.push(8)
    sm.push(1)
    sm.push(9)
    expect(sm.min()).toBe(1)
  })

  it('should find correct max', () => {
    const sm = new StreamingMedian()
    sm.push(5)
    sm.push(2)
    sm.push(8)
    sm.push(1)
    sm.push(9)
    expect(sm.max()).toBe(9)
  })

  it('should handle negative numbers', () => {
    const sm = new StreamingMedian()
    sm.push(-5)
    sm.push(-2)
    sm.push(-8)
    sm.push(-1)
    sm.push(-9)
    expect(sm.median()).toBe(-5)
    expect(sm.mean()).toBe(-5)
    expect(sm.min()).toBe(-9)
    expect(sm.max()).toBe(-1)
  })

  it('should handle mixed positive and negative numbers', () => {
    const sm = new StreamingMedian()
    sm.push(-5)
    sm.push(0)
    sm.push(5)
    expect(sm.median()).toBe(0)
    expect(sm.mean()).toBe(0)
  })

  it('should handle duplicate values', () => {
    const sm = new StreamingMedian()
    sm.push(5)
    sm.push(5)
    sm.push(5)
    sm.push(5)
    expect(sm.median()).toBe(5)
    expect(sm.mean()).toBe(5)
  })

  it('should maintain accuracy after many pushes', () => {
    const sm = new StreamingMedian()
    for (let i = 1; i <= 100; i++) {
      sm.push(i)
    }
    expect(sm.median()).toBe(50.5)
    expect(sm.mean()).toBe(50.5)
  })

  it('should handle decimal values', () => {
    const sm = new StreamingMedian()
    sm.push(1.5)
    sm.push(2.5)
    sm.push(3.5)
    expect(sm.median()).toBe(2.5)
    expect(sm.mean()).toBe(2.5)
  })

  it('should handle large values', () => {
    const sm = new StreamingMedian()
    sm.push(1000000)
    sm.push(2000000)
    sm.push(3000000)
    expect(sm.median()).toBe(2000000)
    expect(sm.mean()).toBe(2000000)
  })

  it('should handle zero values', () => {
    const sm = new StreamingMedian()
    sm.push(0)
    sm.push(0)
    sm.push(0)
    expect(sm.median()).toBe(0)
    expect(sm.mean()).toBe(0)
  })

  it('should handle alternating large and small values', () => {
    const sm = new StreamingMedian()
    sm.push(100)
    sm.push(1)
    sm.push(99)
    sm.push(2)
    expect(sm.median()).toBe(50.5)
  })
})