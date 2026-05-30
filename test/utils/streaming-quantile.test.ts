import { describe, it, expect } from 'vitest'
import { StreamingQuantile } from '../../src/utils/streaming-quantile.js'

describe('StreamingQuantile', () => {
  it('should create with default maxSize', () => {
    const sq = new StreamingQuantile()
    expect(sq.capacity).toBe(10000)
  })

  it('should create with custom maxSize', () => {
    const sq = new StreamingQuantile(5000)
    expect(sq.capacity).toBe(5000)
  })

  it('should return 0 for quantile when empty', () => {
    const sq = new StreamingQuantile()
    expect(sq.quantile(0.5)).toBe(0)
  })

  it('should return 0 for median when empty', () => {
    const sq = new StreamingQuantile()
    expect(sq.median()).toBe(0)
  })

  it('should return 0 for p90 when empty', () => {
    const sq = new StreamingQuantile()
    expect(sq.p90()).toBe(0)
  })

  it('should return 0 for p95 when empty', () => {
    const sq = new StreamingQuantile()
    expect(sq.p95()).toBe(0)
  })

  it('should return 0 for p99 when empty', () => {
    const sq = new StreamingQuantile()
    expect(sq.p99()).toBe(0)
  })

  it('should return 0 for min when empty', () => {
    const sq = new StreamingQuantile()
    expect(sq.min()).toBe(0)
  })

  it('should return 0 for max when empty', () => {
    const sq = new StreamingQuantile()
    expect(sq.max()).toBe(0)
  })

  it('should have count 0 when empty', () => {
    const sq = new StreamingQuantile()
    expect(sq.count).toBe(0)
  })

  it('should calculate correct median for single value', () => {
    const sq = new StreamingQuantile()
    sq.push(5)
    expect(sq.median()).toBe(5)
  })

  it('should calculate correct median for odd number of values', () => {
    const sq = new StreamingQuantile()
    sq.push(1)
    sq.push(5)
    sq.push(3)
    expect(sq.median()).toBe(3)
  })

  it('should calculate correct median for even number of values', () => {
    const sq = new StreamingQuantile()
    sq.push(1)
    sq.push(2)
    sq.push(3)
    sq.push(4)
    expect(sq.median()).toBe(2.5)
  })

  it('should calculate correct p90', () => {
    const sq = new StreamingQuantile()
    for (let i = 1; i <= 10; i++) {
      sq.push(i * 10)
    }
    expect(sq.p90()).toBe(91)
  })

  it('should calculate correct p95', () => {
    const sq = new StreamingQuantile()
    for (let i = 1; i <= 20; i++) {
      sq.push(i)
    }
    expect(sq.p95()).toBe(19.05)
  })

  it('should calculate correct p99', () => {
    const sq = new StreamingQuantile()
    for (let i = 1; i <= 100; i++) {
      sq.push(i)
    }
    expect(sq.p99()).toBe(99.01)
  })

  it('should find correct min', () => {
    const sq = new StreamingQuantile()
    sq.push(5)
    sq.push(2)
    sq.push(8)
    sq.push(1)
    sq.push(9)
    expect(sq.min()).toBe(1)
  })

  it('should find correct max', () => {
    const sq = new StreamingQuantile()
    sq.push(5)
    sq.push(2)
    sq.push(8)
    sq.push(1)
    sq.push(9)
    expect(sq.max()).toBe(9)
  })

  it('should track correct count', () => {
    const sq = new StreamingQuantile()
    sq.push(1)
    sq.push(2)
    sq.push(3)
    expect(sq.count).toBe(3)
  })

  it('should calculate arbitrary quantile', () => {
    const sq = new StreamingQuantile()
    for (let i = 1; i <= 100; i++) {
      sq.push(i)
    }
    expect(sq.quantile(0.25)).toBe(25.75)
    expect(sq.quantile(0.75)).toBe(75.25)
  })

  it('should handle quantile at 0', () => {
    const sq = new StreamingQuantile()
    sq.push(5)
    sq.push(10)
    sq.push(15)
    expect(sq.quantile(0)).toBe(5)
  })

  it('should handle quantile at 1', () => {
    const sq = new StreamingQuantile()
    sq.push(5)
    sq.push(10)
    sq.push(15)
    expect(sq.quantile(1)).toBe(15)
  })

  it('should handle negative numbers', () => {
    const sq = new StreamingQuantile()
    sq.push(-5)
    sq.push(-2)
    sq.push(-8)
    sq.push(-1)
    sq.push(-9)
    expect(sq.median()).toBe(-5)
    expect(sq.min()).toBe(-9)
    expect(sq.max()).toBe(-1)
  })

  it('should handle mixed positive and negative numbers', () => {
    const sq = new StreamingQuantile()
    sq.push(-5)
    sq.push(0)
    sq.push(5)
    expect(sq.median()).toBe(0)
  })

  it('should handle duplicate values', () => {
    const sq = new StreamingQuantile()
    sq.push(5)
    sq.push(5)
    sq.push(5)
    expect(sq.median()).toBe(5)
    expect(sq.p90()).toBe(5)
    expect(sq.p95()).toBe(5)
    expect(sq.p99()).toBe(5)
  })

  it('should handle decimal values', () => {
    const sq = new StreamingQuantile()
    sq.push(1.5)
    sq.push(2.5)
    sq.push(3.5)
    expect(sq.median()).toBe(2.5)
    expect(sq.min()).toBe(1.5)
    expect(sq.max()).toBe(3.5)
  })

  it('should handle large values', () => {
    const sq = new StreamingQuantile()
    sq.push(1000000)
    sq.push(2000000)
    sq.push(3000000)
    expect(sq.median()).toBe(2000000)
    expect(sq.min()).toBe(1000000)
    expect(sq.max()).toBe(3000000)
  })

  it('should handle zero values', () => {
    const sq = new StreamingQuantile()
    sq.push(0)
    sq.push(0)
    sq.push(0)
    expect(sq.median()).toBe(0)
    expect(sq.min()).toBe(0)
    expect(sq.max()).toBe(0)
  })
})