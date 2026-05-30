import { describe, expect, it } from 'vitest'
import { TDigest } from '../../../src/utils/t-digest.js'

describe('TDigest', () => {
  it('should create empty digest with default maxCentroids', () => {
    const td = new TDigest()
    expect(td.size).toBe(0)
    expect(td.isEmpty()).toBe(true)
    expect(td.centroidCount).toBe(0)
  })

  it('should create empty digest with custom maxCentroids', () => {
    const td = new TDigest({ maxCentroids: 50 })
    expect(td.size).toBe(0)
    expect(td.isEmpty()).toBe(true)
  })

  it('should push single value', () => {
    const td = new TDigest()
    td.push(42)
    expect(td.size).toBe(1)
    expect(td.isEmpty()).toBe(false)
  })

  it('should push multiple values', () => {
    const td = new TDigest()
    td.push(1)
    td.push(2)
    td.push(3)
    expect(td.size).toBe(3)
  })

  it('should push batch of values', () => {
    const td = new TDigest()
    td.pushBatch([1, 2, 3, 4, 5])
    expect(td.size).toBe(5)
  })

  it('should handle empty batch push', () => {
    const td = new TDigest()
    td.pushBatch([])
    expect(td.size).toBe(0)
  })

  it('should ignore non-finite values on push', () => {
    const td = new TDigest()
    td.push(1)
    td.push(NaN)
    td.push(Infinity)
    td.push(-Infinity)
    expect(td.size).toBe(1)
  })

  it('should return NaN for min on empty digest', () => {
    const td = new TDigest()
    expect(td.min).toBeNaN()
  })

  it('should return NaN for max on empty digest', () => {
    const td = new TDigest()
    expect(td.max).toBeNaN()
  })

  it('should return NaN for mean on empty digest', () => {
    const td = new TDigest()
    expect(td.mean).toBeNaN()
  })

  it('should return NaN for quantile on empty digest', () => {
    const td = new TDigest()
    expect(td.quantile(0.5)).toBeNaN()
  })

  it('should return NaN for percentile on empty digest', () => {
    const td = new TDigest()
    expect(td.percentile(50)).toBeNaN()
  })

  it('should return NaN for cdf on empty digest', () => {
    const td = new TDigest()
    expect(td.cdf(5)).toBeNaN()
  })

  it('should return correct min and max for single value', () => {
    const td = new TDigest()
    td.push(42)
    expect(td.min).toBe(42)
    expect(td.max).toBe(42)
  })

  it('should return correct mean for single value', () => {
    const td = new TDigest()
    td.push(42)
    expect(td.mean).toBe(42)
  })

  it('should return correct min and max for two values', () => {
    const td = new TDigest()
    td.push(10)
    td.push(20)
    expect(td.min).toBe(10)
    expect(td.max).toBe(20)
  })

  it('should return correct mean for two values', () => {
    const td = new TDigest()
    td.push(10)
    td.push(20)
    expect(td.mean).toBe(15)
  })

  it('should return correct mean for uniform values', () => {
    const td = new TDigest()
    td.pushBatch([1, 2, 3, 4, 5])
    expect(td.mean).toBe(3)
  })

  it('quantile q=0 returns min', () => {
    const td = new TDigest()
    td.pushBatch([10, 20, 30, 40, 50])
    expect(td.quantile(0)).toBe(td.min)
  })

  it('quantile q=1 returns max', () => {
    const td = new TDigest()
    td.pushBatch([10, 20, 30, 40, 50])
    expect(td.quantile(1)).toBe(td.max)
  })

  it('quantile q=0.5 returns median-ish', () => {
    const td = new TDigest()
    td.pushBatch([10, 20, 30, 40, 50])
    const median = td.quantile(0.5)
    expect(median).toBeGreaterThanOrEqual(20)
    expect(median).toBeLessThanOrEqual(40)
  })

  it('quantile returns NaN for q<0', () => {
    const td = new TDigest()
    td.push(1)
    expect(td.quantile(-0.1)).toBeNaN()
  })

  it('quantile returns NaN for q>1', () => {
    const td = new TDigest()
    td.push(1)
    expect(td.quantile(1.1)).toBeNaN()
  })

  it('percentile p=50 is median', () => {
    const td = new TDigest()
    td.pushBatch([10, 20, 30, 40, 50])
    const median = td.percentile(50)
    expect(median).toBeGreaterThanOrEqual(20)
    expect(median).toBeLessThanOrEqual(40)
  })

  it('percentile p=0 is min', () => {
    const td = new TDigest()
    td.pushBatch([10, 20, 30, 40, 50])
    expect(td.percentile(0)).toBe(td.min)
  })

  it('percentile p=100 is max', () => {
    const td = new TDigest()
    td.pushBatch([10, 20, 30, 40, 50])
    expect(td.percentile(100)).toBe(td.max)
  })

  it('cdf value=min returns ~0', () => {
    const td = new TDigest()
    td.pushBatch([10, 20, 30, 40, 50])
    expect(td.cdf(10)).toBe(0)
  })

  it('cdf value=max returns ~1', () => {
    const td = new TDigest()
    td.pushBatch([10, 20, 30, 40, 50])
    expect(td.cdf(50)).toBe(1)
  })

  it('cdf value=mean returns ~0.5', () => {
    const td = new TDigest()
    td.pushBatch([10, 20, 30, 40, 50])
    const mean = td.mean
    const cdf = td.cdf(mean)
    expect(cdf).toBeGreaterThan(0.4)
    expect(cdf).toBeLessThan(0.6)
  })

  it('merge two digests', () => {
    const td1 = new TDigest()
    td1.pushBatch([1, 2, 3])
    const td2 = new TDigest()
    td2.pushBatch([4, 5, 6])
    const merged = td1.merge(td2)
    expect(merged.size).toBe(6)
    expect(merged.min).toBe(1)
    expect(merged.max).toBe(6)
  })

  it('merge returns new digest', () => {
    const td1 = new TDigest()
    td1.push(1)
    const td2 = new TDigest()
    td2.push(2)
    const merged = td1.merge(td2)
    expect(merged).not.toBe(td1)
    expect(merged).not.toBe(td2)
  })

  it('reset clears digest', () => {
    const td = new TDigest()
    td.pushBatch([1, 2, 3, 4, 5])
    td.reset()
    expect(td.size).toBe(0)
    expect(td.isEmpty()).toBe(true)
    expect(td.min).toBeNaN()
    expect(td.max).toBeNaN()
  })

  it('toArray returns array', () => {
    const td = new TDigest()
    td.pushBatch([1, 2, 3])
    const arr = td.toArray()
    expect(arr.length).toBe(3)
    expect(arr).toContain(1)
    expect(arr).toContain(2)
    expect(arr).toContain(3)
  })

  it('toArray returns empty array on empty digest', () => {
    const td = new TDigest()
    const arr = td.toArray()
    expect(arr.length).toBe(0)
  })

  it('getCentroids returns centroids', () => {
    const td = new TDigest()
    td.pushBatch([1, 2, 3])
    const centroids = td.getCentroids()
    expect(centroids.length).toBeGreaterThan(0)
    expect(centroids[0]).toHaveProperty('mean')
    expect(centroids[0]).toHaveProperty('weight')
  })

  it('getCentroids returns empty on empty digest', () => {
    const td = new TDigest()
    const centroids = td.getCentroids()
    expect(centroids.length).toBe(0)
  })

  it('fromArray creates digest', () => {
    const td = TDigest.fromArray([1, 2, 3, 4, 5])
    expect(td.size).toBe(5)
    expect(td.min).toBe(1)
    expect(td.max).toBe(5)
  })

  it('fromArray with empty array creates empty digest', () => {
    const td = TDigest.fromArray([])
    expect(td.size).toBe(0)
    expect(td.isEmpty()).toBe(true)
  })

  it('fromArray with custom maxCentroids', () => {
    const td = TDigest.fromArray([1, 2, 3], { maxCentroids: 50 })
    expect(td.size).toBe(3)
  })

  it('handles 100 values', () => {
    const td = new TDigest()
    const values = Array.from({ length: 100 }, (_, i) => i)
    td.pushBatch(values)
    expect(td.size).toBe(100)
    expect(td.min).toBe(0)
    expect(td.max).toBe(99)
    expect(td.mean).toBeCloseTo(49.5, 1)
  })

  it('handles 10000 values', () => {
    const td = new TDigest()
    const values = Array.from({ length: 10000 }, (_, i) => i)
    td.pushBatch(values)
    expect(td.size).toBe(10000)
    expect(td.min).toBe(0)
    expect(td.max).toBe(9999)
    expect(td.mean).toBeCloseTo(4999.5, 1)
  })

  it('accuracy: p50 within [400,600] for 1000 uniform values', () => {
    const td = new TDigest()
    const values = Array.from({ length: 1000 }, (_, i) => i)
    td.pushBatch(values)
    const p50 = td.percentile(50)
    expect(p50).toBeGreaterThanOrEqual(400)
    expect(p50).toBeLessThanOrEqual(600)
  })

  it('accuracy: p90 within [850,950] for 1000 uniform values', () => {
    const td = new TDigest()
    const values = Array.from({ length: 1000 }, (_, i) => i)
    td.pushBatch(values)
    const p90 = td.percentile(90)
    expect(p90).toBeGreaterThanOrEqual(850)
    expect(p90).toBeLessThanOrEqual(950)
  })

  it('accuracy: p10 within [50,150] for 1000 uniform values', () => {
    const td = new TDigest()
    const values = Array.from({ length: 1000 }, (_, i) => i)
    td.pushBatch(values)
    const p10 = td.percentile(10)
    expect(p10).toBeGreaterThanOrEqual(50)
    expect(p10).toBeLessThanOrEqual(150)
  })
})