import { describe, it, expect } from 'vitest'
import { LeakyBucket } from '../../src/utils/leaky-bucket.js'

describe('LeakyBucket', () => {
  it('creates instance with capacity and leak rate', () => {
    const bucket = new LeakyBucket(10, 5)
    expect(bucket.level).toBe(0)
    expect(bucket.available).toBe(10)
    expect(bucket.isFull).toBe(false)
  })

  it('pours single unit successfully', () => {
    const bucket = new LeakyBucket(10, 5)
    const result = bucket.pour()
    expect(result).toBe(true)
    expect(bucket.level).toBeGreaterThan(0.8)
    expect(bucket.level).toBeLessThan(1.2)
  })

  it('pours custom amount successfully', () => {
    const bucket = new LeakyBucket(10, 5)
    const result = bucket.pour(5)
    expect(result).toBe(true)
    expect(bucket.level).toBeGreaterThan(4.5)
    expect(bucket.level).toBeLessThan(5.5)
  })

  it('fails to pour when bucket is full', () => {
    const bucket = new LeakyBucket(10, 5)
    const firstResult = bucket.pour(10)
    const secondResult = bucket.pour(1)
    expect(firstResult).toBe(true)
    expect(secondResult).toBe(false)
    expect(bucket.level).toBeGreaterThan(9)
    expect(bucket.level).toBeLessThanOrEqual(10)
  })

  it('returns correct level', () => {
    const bucket = new LeakyBucket(10, 5)
    bucket.pour(3)
    expect(bucket.level).toBeGreaterThan(2.5)
    expect(bucket.level).toBeLessThan(3.5)
  })

  it('returns correct available capacity', () => {
    const bucket = new LeakyBucket(10, 5)
    bucket.pour(7)
    expect(bucket.available).toBeGreaterThan(2.5)
    expect(bucket.available).toBeLessThan(3.5)
  })

  it('correctly identifies when bucket is full', () => {
    const bucket = new LeakyBucket(10, 5)
    expect(bucket.isFull).toBe(false)
    bucket.pour(10)
    expect(bucket.isFull).toBe(true)
  })

  it('leaks water over time', async () => {
    const bucket = new LeakyBucket(10, 10)
    bucket.pour(10)
    expect(bucket.level).toBe(10)
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(bucket.level).toBeLessThan(10)
  })

  it('allows pouring after leak', async () => {
    const bucket = new LeakyBucket(10, 10)
    bucket.pour(10)
    const firstPour = bucket.pour(1)
    expect(firstPour).toBe(false)
    await new Promise((resolve) => setTimeout(resolve, 200))
    const secondPour = bucket.pour(1)
    expect(secondPour).toBe(true)
  })

  it('resets bucket to empty state', async () => {
    const bucket = new LeakyBucket(10, 5)
    bucket.pour(8)
    expect(bucket.level).toBeGreaterThan(0)
    bucket.reset()
    expect(bucket.level).toBe(0)
    expect(bucket.available).toBe(10)
    expect(bucket.isFull).toBe(false)
  })

  it('handles multiple pours correctly', () => {
    const bucket = new LeakyBucket(10, 5)
    bucket.pour(3)
    bucket.pour(2)
    bucket.pour(4)
    expect(bucket.level).toBeGreaterThan(8)
    expect(bucket.level).toBeLessThan(10)
  })

  it('handles edge case with exact capacity', () => {
    const bucket = new LeakyBucket(10, 5)
    const result = bucket.pour(10)
    expect(result).toBe(true)
    expect(bucket.level).toBeGreaterThan(9)
    expect(bucket.level).toBeLessThanOrEqual(10)
  })

  it('handles zero leak rate', () => {
    const bucket = new LeakyBucket(10, 0)
    bucket.pour(5)
    const level1 = bucket.level
    const level2 = bucket.level
    expect(level2).toBe(level1)
  })

  it('handles zero pour amount', () => {
    const bucket = new LeakyBucket(10, 5)
    const result = bucket.pour(0)
    expect(result).toBe(true)
    expect(bucket.level).toBe(0)
  })

  it('handles negative pour amount', () => {
    const bucket = new LeakyBucket(10, 5)
    const initialLevel = bucket.level
    const result = bucket.pour(-1)
    expect(result).toBe(true)
    expect(bucket.level).toBeLessThanOrEqual(initialLevel)
  })

  it('multiple pours with drain between', () => {
    const bucket = new LeakyBucket(10, 100)
    bucket.pour(5)
    expect(bucket.level).toBeGreaterThan(0)
    bucket.pour(5)
    expect(bucket.level).toBeGreaterThan(4)
  })

  it('isFull reflects state correctly', () => {
    const bucket = new LeakyBucket(10, 0)
    expect(bucket.isFull).toBe(false)
    bucket.pour(10)
    expect(bucket.isFull).toBe(true)
  })

  it('pour over capacity returns false', () => {
    const bucket = new LeakyBucket(5, 1)
    expect(bucket.pour(100)).toBe(false)
  })
})