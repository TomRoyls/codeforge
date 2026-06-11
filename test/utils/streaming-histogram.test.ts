import { describe, it, expect } from 'vitest'
import { StreamingHistogram } from '../../src/utils/streaming-histogram.js'

describe('StreamingHistogram', () => {
  it('constructor with default maxBins', () => {
    const hist = new StreamingHistogram()
    expect(hist.count).toBe(0)
    expect(hist.binCount).toBe(0)
  })

  it('constructor with custom maxBins', () => {
    const hist = new StreamingHistogram(50)
    expect(hist.count).toBe(0)
    expect(hist.binCount).toBe(0)
  })

  it('add increments count', () => {
    const hist = new StreamingHistogram()
    hist.add(5)
    expect(hist.count).toBe(1)
    hist.add(10)
    expect(hist.count).toBe(2)
  })

  it('add creates bins', () => {
    const hist = new StreamingHistogram()
    hist.add(5)
    expect(hist.binCount).toBe(1)
    hist.add(10)
    expect(hist.binCount).toBe(2)
  })

  it('add merges identical values', () => {
    const hist = new StreamingHistogram()
    hist.add(5)
    hist.add(5)
    hist.add(5)
    expect(hist.binCount).toBe(1)
    expect(hist.count).toBe(3)
  })

  it('quantile returns 0 for empty histogram', () => {
    const hist = new StreamingHistogram()
    expect(hist.quantile(0.5)).toBe(0)
  })

  it('quantile(0) returns minimum', () => {
    const hist = new StreamingHistogram()
    hist.add(10)
    hist.add(20)
    hist.add(30)
    expect(hist.quantile(0)).toBe(10)
  })

  it('quantile(1) returns maximum', () => {
    const hist = new StreamingHistogram()
    hist.add(10)
    hist.add(20)
    hist.add(30)
    expect(hist.quantile(1)).toBe(30)
  })

  it('quantile(0.5) returns median', () => {
    const hist = new StreamingHistogram()
    hist.add(10)
    hist.add(20)
    hist.add(30)
    expect(hist.quantile(0.5)).toBe(20)
  })

  it('quantile handles repeated values', () => {
    const hist = new StreamingHistogram()
    hist.add(10)
    hist.add(10)
    hist.add(20)
    hist.add(30)
    expect(hist.quantile(0.5)).toBe(10)
  })

  it('min returns 0 for empty histogram', () => {
    const hist = new StreamingHistogram()
    expect(hist.min).toBe(0)
  })

  it('min returns minimum value', () => {
    const hist = new StreamingHistogram()
    hist.add(10)
    hist.add(5)
    hist.add(20)
    expect(hist.min).toBe(5)
  })

  it('max returns 0 for empty histogram', () => {
    const hist = new StreamingHistogram()
    expect(hist.max).toBe(0)
  })

  it('max returns maximum value', () => {
    const hist = new StreamingHistogram()
    hist.add(10)
    hist.add(20)
    hist.add(5)
    expect(hist.max).toBe(20)
  })

  it('mean returns 0 for empty histogram', () => {
    const hist = new StreamingHistogram()
    expect(hist.mean).toBe(0)
  })

  it('mean calculates average', () => {
    const hist = new StreamingHistogram()
    hist.add(10)
    hist.add(20)
    hist.add(30)
    expect(hist.mean).toBe(20)
  })

  it('mean handles repeated values', () => {
    const hist = new StreamingHistogram()
    hist.add(10)
    hist.add(10)
    hist.add(20)
    expect(hist.mean).toBeCloseTo(13.33, 2)
  })

  it('count returns number of values', () => {
    const hist = new StreamingHistogram()
    expect(hist.count).toBe(0)
    hist.add(5)
    expect(hist.count).toBe(1)
    hist.add(5)
    hist.add(10)
    expect(hist.count).toBe(3)
  })

  it('binCount returns number of bins', () => {
    const hist = new StreamingHistogram()
    expect(hist.binCount).toBe(0)
    hist.add(5)
    expect(hist.binCount).toBe(1)
    hist.add(10)
    expect(hist.binCount).toBe(2)
    hist.add(5)
    expect(hist.binCount).toBe(2)
  })

  it('reset clears histogram', () => {
    const hist = new StreamingHistogram()
    hist.add(5)
    hist.add(10)
    hist.add(15)
    hist.reset()
    expect(hist.count).toBe(0)
    expect(hist.binCount).toBe(0)
    expect(hist.min).toBe(0)
    expect(hist.max).toBe(0)
    expect(hist.mean).toBe(0)
  })

  it('compress merges bins when exceeding maxBins', () => {
    const hist = new StreamingHistogram(10)
    for (let i = 0; i < 20; i++) {
      hist.add(i)
    }
    expect(hist.binCount).toBeLessThanOrEqual(10)
  })

  it('compress preserves count', () => {
    const hist = new StreamingHistogram(5)
    for (let i = 0; i < 20; i++) {
      hist.add(i)
    }
    expect(hist.count).toBe(20)
  })

  it('quantile after compression returns reasonable values', () => {
    const hist = new StreamingHistogram(5)
    for (let i = 0; i < 100; i++) {
      hist.add(i)
    }
    const p50 = hist.quantile(0.5)
    expect(p50).toBeGreaterThanOrEqual(40)
    expect(p50).toBeLessThanOrEqual(60)
  })

  it('handles negative values', () => {
    const hist = new StreamingHistogram()
    hist.add(-10)
    hist.add(-5)
    hist.add(0)
    expect(hist.min).toBe(-10)
    expect(hist.max).toBe(0)
    expect(hist.mean).toBeCloseTo(-5, 2)
  })

  it('handles floating point values', () => {
    const hist = new StreamingHistogram()
    hist.add(1.5)
    hist.add(2.7)
    hist.add(3.3)
    expect(hist.mean).toBeCloseTo(2.5, 2)
  })

  it('quantile(0.25) returns first quartile', () => {
    const hist = new StreamingHistogram()
    hist.add(10)
    hist.add(20)
    hist.add(30)
    hist.add(40)
    expect(hist.quantile(0.25)).toBe(10)
  })

  it('quantile(0.75) returns third quartile', () => {
    const hist = new StreamingHistogram()
    hist.add(10)
    hist.add(20)
    hist.add(30)
    hist.add(40)
    expect(hist.quantile(0.75)).toBe(30)
  })

  it('quantile(0.99) returns near maximum', () => {
    const hist = new StreamingHistogram()
    for (let i = 0; i < 100; i++) {
      hist.add(i)
    }
    expect(hist.quantile(0.99)).toBeGreaterThanOrEqual(98)
  })

  it('quantile(0.01) returns near minimum', () => {
    const hist = new StreamingHistogram()
    for (let i = 0; i < 100; i++) {
      hist.add(i)
    }
    expect(hist.quantile(0.01)).toBeLessThanOrEqual(2)
  })

  it('quantile with single value returns that value', () => {
    const hist = new StreamingHistogram()
    hist.add(42)
    expect(hist.quantile(0.5)).toBe(42)
    expect(hist.quantile(0)).toBe(42)
    expect(hist.quantile(1)).toBe(42)
  })

  it('min returns 0 for empty histogram after reset', () => {
    const hist = new StreamingHistogram()
    hist.add(10)
    hist.reset()
    expect(hist.min).toBe(0)
  })

  it('max returns 0 for empty histogram after reset', () => {
    const hist = new StreamingHistogram()
    hist.add(20)
    hist.reset()
    expect(hist.max).toBe(0)
  })

  it('mean returns 0 for empty histogram after reset', () => {
    const hist = new StreamingHistogram()
    hist.add(10)
    hist.add(20)
    hist.reset()
    expect(hist.mean).toBe(0)
  })

  it('handles very large values', () => {
    const hist = new StreamingHistogram()
    hist.add(1e10)
    hist.add(2e10)
    hist.add(3e10)
    expect(hist.min).toBe(1e10)
    expect(hist.max).toBe(3e10)
    expect(hist.mean).toBe(2e10)
  })

  it('handles very small values', () => {
    const hist = new StreamingHistogram()
    hist.add(1e-10)
    hist.add(2e-10)
    hist.add(3e-10)
    expect(hist.min).toBe(1e-10)
    expect(hist.max).toBe(3e-10)
  })

  it('handles zero values', () => {
    const hist = new StreamingHistogram()
    hist.add(0)
    hist.add(5)
    hist.add(10)
    expect(hist.min).toBe(0)
    expect(hist.mean).toBeCloseTo(5, 2)
  })

  it('mean with many identical values', () => {
    const hist = new StreamingHistogram()
    for (let i = 0; i < 100; i++) {
      hist.add(50)
    }
    expect(hist.mean).toBe(50)
  })

  it('compress with repeated values reduces bin count', () => {
    const hist = new StreamingHistogram(5)
    hist.add(1)
    hist.add(1)
    hist.add(2)
    hist.add(2)
    hist.add(3)
    hist.add(3)
    for (let i = 4; i < 10; i++) {
      hist.add(i)
    }
    expect(hist.binCount).toBeLessThanOrEqual(5)
  })

  it('quantile at exact boundary', () => {
    const hist = new StreamingHistogram()
    hist.add(10)
    hist.add(20)
    hist.add(30)
    hist.add(40)
    const p25 = hist.quantile(0.25)
    expect(p25).toBe(10)
  })

  it('binCount updates after reset', () => {
    const hist = new StreamingHistogram()
    hist.add(1)
    hist.add(2)
    hist.add(3)
    expect(hist.binCount).toBe(3)
    hist.reset()
    expect(hist.binCount).toBe(0)
  })

  it('count updates after reset', () => {
    const hist = new StreamingHistogram()
    hist.add(1)
    hist.add(2)
    expect(hist.count).toBe(2)
    hist.reset()
    expect(hist.count).toBe(0)
  })

  it('quantile with alternating values', () => {
    const hist = new StreamingHistogram()
    hist.add(10)
    hist.add(20)
    hist.add(10)
    hist.add(20)
    expect(hist.quantile(0.5)).toBe(10)
  })

  it('mean with negative and positive values', () => {
    const hist = new StreamingHistogram()
    hist.add(-10)
    hist.add(10)
    hist.add(-5)
    hist.add(5)
    expect(hist.mean).toBe(0)
  })

  it('compress preserves total count', () => {
    const hist = new StreamingHistogram(5)
    const totalValues = 100
    for (let i = 0; i < totalValues; i++) {
      hist.add(i)
    }
    expect(hist.count).toBe(totalValues)
  })

  it('min with single value', () => {
    const hist = new StreamingHistogram()
    hist.add(42)
    expect(hist.min).toBe(42)
  })

  it('max with single value', () => {
    const hist = new StreamingHistogram()
    hist.add(42)
    expect(hist.max).toBe(42)
  })

  it('mean with single value', () => {
    const hist = new StreamingHistogram()
    hist.add(42)
    expect(hist.mean).toBe(42)
  })

  it('handles values in reverse order', () => {
    const hist = new StreamingHistogram()
    hist.add(30)
    hist.add(20)
    hist.add(10)
    expect(hist.min).toBe(10)
    expect(hist.max).toBe(30)
    expect(hist.mean).toBe(20)
  })

  it('quantile returns maximum for very high percentile', () => {
    const hist = new StreamingHistogram()
    for (let i = 0; i < 10; i++) {
      hist.add(i * 10)
    }
    expect(hist.quantile(0.999)).toBe(90)
  })

  it('quantile returns minimum for very low percentile', () => {
    const hist = new StreamingHistogram()
    for (let i = 0; i < 10; i++) {
      hist.add(i * 10)
    }
    expect(hist.quantile(0.001)).toBe(0)
  })
})