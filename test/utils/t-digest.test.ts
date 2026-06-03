import { describe, it, expect } from 'vitest'
import { TDigest } from '../../src/utils/t-digest.js'

describe('TDigest', () => {
  it('creates empty digest', () => {
    const td = new TDigest()
    expect(td.isEmpty()).toBe(true)
    expect(td.size).toBe(0)
  })

  it('pushes values and tracks size', () => {
    const td = new TDigest()
    td.push(1)
    td.push(2)
    td.push(3)
    expect(td.size).toBe(3)
    expect(td.isEmpty()).toBe(false)
  })

  it('pushBatch adds multiple values', () => {
    const td = new TDigest()
    td.pushBatch([1, 2, 3, 4, 5])
    expect(td.size).toBe(5)
  })

  it('computes min and max', () => {
    const td = TDigest.fromArray([10, 20, 30, 40, 50])
    expect(td.min).toBe(10)
    expect(td.max).toBe(50)
  })

  it('computes mean', () => {
    const td = TDigest.fromArray([10, 20, 30])
    expect(td.mean).toBeCloseTo(20, 0)
  })

  it('computes median quantile', () => {
    const td = TDigest.fromArray([1, 2, 3, 4, 5])
    const median = td.quantile(0.5)
    expect(median).toBeGreaterThanOrEqual(2)
    expect(median).toBeLessThanOrEqual(4)
  })

  it('computes percentile', () => {
    const td = TDigest.fromArray([1, 2, 3, 4, 5])
    const p50 = td.percentile(50)
    expect(p50).toBeGreaterThanOrEqual(2)
    expect(p50).toBeLessThanOrEqual(4)
  })

  it('quantile 0 returns min', () => {
    const td = TDigest.fromArray([1, 2, 3])
    expect(td.quantile(0)).toBe(1)
  })

  it('quantile 1 returns max', () => {
    const td = TDigest.fromArray([1, 2, 3])
    expect(td.quantile(1)).toBe(3)
  })

  it('quantile out of range returns NaN', () => {
    const td = TDigest.fromArray([1, 2, 3])
    expect(td.quantile(-1)).toBeNaN()
    expect(td.quantile(2)).toBeNaN()
  })

  it('computes cdf', () => {
    const td = TDigest.fromArray([1, 2, 3, 4, 5])
    expect(td.cdf(1)).toBe(0)
    expect(td.cdf(5)).toBe(1)
    const mid = td.cdf(3)
    expect(mid).toBeGreaterThan(0)
    expect(mid).toBeLessThan(1)
  })

  it('resets the digest', () => {
    const td = TDigest.fromArray([1, 2, 3])
    td.reset()
    expect(td.isEmpty()).toBe(true)
    expect(td.size).toBe(0)
  })

  it('merges two digests', () => {
    const td1 = TDigest.fromArray([1, 2, 3])
    const td2 = TDigest.fromArray([4, 5, 6])
    const merged = td1.merge(td2)
    expect(merged.min).toBe(1)
    expect(merged.max).toBe(6)
  })

  it('fromArray creates digest from data', () => {
    const td = TDigest.fromArray([10, 20, 30])
    expect(td.size).toBe(3)
    expect(td.min).toBe(10)
    expect(td.max).toBe(30)
  })

  it('getCentroids returns centroid data', () => {
    const td = TDigest.fromArray([1, 2, 3])
    const centroids = td.getCentroids()
    expect(centroids.length).toBeGreaterThan(0)
    for (const c of centroids) {
      expect(c.weight).toBeGreaterThan(0)
    }
  })

  it('toArray returns representative values', () => {
    const td = TDigest.fromArray([1, 2, 3])
    const arr = td.toArray()
    expect(arr.length).toBeGreaterThan(0)
  })

  it('handles large datasets', () => {
    const data = Array.from({ length: 1000 }, (_, i) => i + 1)
    const td = TDigest.fromArray(data, { maxCentroids: 50 })
    expect(td.min).toBe(1)
    expect(td.max).toBe(1000)
    expect(td.centroidCount).toBeGreaterThan(0)
  })

  it('ignores non-finite values', () => {
    const td = new TDigest()
    td.push(1)
    td.push(NaN)
    td.push(Infinity)
    td.push(-Infinity)
    td.push(2)
    td.flush()
    expect(td.size).toBe(2)
  })

  it('returns NaN for min/max of empty digest', () => {
    const td = new TDigest()
    expect(td.min).toBeNaN()
    expect(td.max).toBeNaN()
    expect(td.mean).toBeNaN()
  })

  it('handles single value', () => {
    const td = TDigest.fromArray([42])
    expect(td.min).toBe(42)
    expect(td.max).toBe(42)
    expect(td.mean).toBe(42)
    expect(td.quantile(0.5)).toBe(42)
  })

  it('handles two values', () => {
    const td = new TDigest()
    td.push(10)
    td.push(20)
    expect(td.size).toBe(2)
  })
})
