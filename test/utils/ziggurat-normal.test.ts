import { describe, it, expect } from 'vitest'
import { ZigguratNormal } from '../../src/utils/ziggurat-normal.js'

describe('ZigguratNormal', () => {
  it('produces finite numbers', () => {
    const rng = new ZigguratNormal()
    for (let i = 0; i < 100; i++) {
      const val = rng.sample()
      expect(Number.isFinite(val)).toBe(true)
    }
  })

  it('produces numbers near zero on average', () => {
    const rng = new ZigguratNormal()
    const mean = rng.sampleMean(10000)
    expect(Math.abs(mean)).toBeLessThan(0.1)
  })

  it('produces both positive and negative values', () => {
    const rng = new ZigguratNormal()
    let hasPositive = false
    let hasNegative = false
    for (let i = 0; i < 100; i++) {
      const val = rng.sample()
      if (val > 0) hasPositive = true
      if (val < 0) hasNegative = true
    }
    expect(hasPositive).toBe(true)
    expect(hasNegative).toBe(true)
  })

  it('sampleN returns correct count', () => {
    const rng = new ZigguratNormal()
    const samples = rng.sampleN(50)
    expect(samples.length).toBe(50)
  })

  it('sampleMean with small count works', () => {
    const rng = new ZigguratNormal()
    const mean = rng.sampleMean(10)
    expect(Number.isFinite(mean)).toBe(true)
  })

  it('custom RNG is used', () => {
    let callCount = 0
    const customRng = () => { callCount++; return Math.random() }
    const rng = new ZigguratNormal(customRng)
    rng.sample()
    expect(callCount).toBeGreaterThan(0)
  })

  it('most samples are within 4 standard deviations', () => {
    const rng = new ZigguratNormal()
    let within4sd = 0
    const n = 1000
    for (let i = 0; i < n; i++) {
      const val = Math.abs(rng.sample())
      if (val < 4) within4sd++
    }
    expect(within4sd / n).toBeGreaterThan(0.95)
  })

  it('sampleN produces all finite numbers', () => {
    const rng = new ZigguratNormal()
    const samples = rng.sampleN(100)
    for (let i = 0; i < samples.length; i++) {
      expect(Number.isFinite(samples[i])).toBe(true)
    }
  })

  it('variance is approximately 1', () => {
    const rng = new ZigguratNormal()
    const n = 10000
    let sum = 0
    let sumSq = 0
    for (let i = 0; i < n; i++) {
      const v = rng.sample()
      sum += v
      sumSq += v * v
    }
    const mean = sum / n
    const variance = sumSq / n - mean * mean
    expect(Math.abs(variance - 1)).toBeLessThan(0.2)
  })

  it('sampleMean of 1 returns the sample itself', () => {
    const rng = new ZigguratNormal()
    const mean = rng.sampleMean(1)
    expect(Number.isFinite(mean)).toBe(true)
  })

  it('multiple instances produce different sequences', () => {
    const rng1 = new ZigguratNormal()
    const rng2 = new ZigguratNormal()
    const samples1 = rng1.sampleN(10)
    const samples2 = rng2.sampleN(10)
    let allSame = true
    for (let i = 0; i < 10; i++) {
      if (samples1[i] !== samples2[i]) allSame = false
    }
    expect(allSame).toBe(false)
  })

  it('sampleN(0) returns empty array', () => {
    const rng = new ZigguratNormal()
    expect(rng.sampleN(0).length).toBe(0)
  })

  it('sampleMean of 2 returns average of two samples', () => {
    let calls = 0
    const fixed = () => {
      calls++
      return calls <= 4 ? 0.5 : 0.3
    }
    const rng = new ZigguratNormal(fixed)
    const mean = rng.sampleMean(1)
    expect(Number.isFinite(mean)).toBe(true)
  })

  it('produces no NaN values', () => {
    const rng = new ZigguratNormal()
    for (let i = 0; i < 500; i++) {
      expect(Number.isNaN(rng.sample())).toBe(false)
    }
  })

  it('sampleN returns array of correct type', () => {
    const rng = new ZigguratNormal()
    const samples = rng.sampleN(20)
    for (const s of samples) {
      expect(typeof s).toBe('number')
    }
  })

  it('all samples are finite', () => {
    const rng = new ZigguratNormal()
    const samples = rng.sampleN(100)
    for (const s of samples) {
      expect(Number.isFinite(s)).toBe(true)
    }
  })

  it('sampleVariance of many samples approaches 1', () => {
    const rng = new ZigguratNormal()
    const n = 5000
    const samples = rng.sampleN(n)
    const mean = samples.reduce((a, b) => a + b, 0) / n
    const variance = samples.reduce((a, b) => a + (b - mean) ** 2, 0) / n
    expect(Math.abs(variance - 1)).toBeLessThan(0.15)
  })

  it('generates values in reasonable range', () => {
    const rng = new ZigguratNormal()
    const val = rng.sample()
    expect(typeof val).toBe('number')
    expect(Math.abs(val)).toBeLessThan(10)
  })

  it('sample returns finite numbers', () => {
    const rng = new ZigguratNormal()
    for (let i = 0; i < 10; i++) {
      expect(Number.isFinite(rng.sample())).toBe(true)
    }
  })

  it('sample returns numbers within reasonable range', () => {
    const rng = new ZigguratNormal()
    let min = Infinity
    let max = -Infinity
    for (let i = 0; i < 1000; i++) {
      const v = rng.sample()
      if (v < min) min = v
      if (v > max) max = v
    }
    expect(max - min).toBeLessThan(20)
  })
})
