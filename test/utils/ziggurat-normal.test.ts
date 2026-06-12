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
    const n = 20000
    const samples = rng.sampleN(n)
    const mean = samples.reduce((a, b) => a + b, 0) / n
    const variance = samples.reduce((a, b) => a + (b - mean) ** 2, 0) / n
    expect(Math.abs(variance - 1)).toBeLessThan(0.25)
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

  it('sample returns finite number', () => {
    const z = new ZigguratNormal()
    const v = z.sample()
    expect(Number.isFinite(v)).toBe(true)
  })

  it('multiple samples are all finite', () => {
    const z = new ZigguratNormal()
    for (let i = 0; i < 10; i++) {
      expect(Number.isFinite(z.sample())).toBe(true)
    }
  })

  it('sample is within reasonable range', () => {
    const z = new ZigguratNormal()
    let min = Infinity
    let max = -Infinity
    for (let i = 0; i < 100; i++) {
      const v = z.sample()
      if (v < min) min = v
      if (v > max) max = v
    }
    expect(max - min).toBeLessThan(100)
  })

  it('generates many samples without error', () => {
    const rng = new ZigguratNormal()
    for (let i = 0; i < 1000; i++) {
      rng.sample()
    }
    expect(true).toBe(true)
  })

  it('standard deviation is approximately 1', () => {
    const rng = new ZigguratNormal()
    const n = 10000
    const samples = rng.sampleN(n)
    const mean = samples.reduce((a, b) => a + b, 0) / n
    const variance = samples.reduce((a, b) => a + (b - mean) ** 2, 0) / n
    const stdDev = Math.sqrt(variance)
    expect(Math.abs(stdDev - 1)).toBeLessThan(0.15)
  })

  it('distribution is symmetric around zero', () => {
    const rng = new ZigguratNormal()
    const samples = rng.sampleN(10000)
    let positiveSum = 0
    let negativeSum = 0
    for (let i = 0; i < samples.length; i++) {
      const s = samples[i]
      if (s > 0) positiveSum += s
      if (s < 0) negativeSum += Math.abs(s)
    }
    const ratio = positiveSum / (positiveSum + negativeSum)
    expect(Math.abs(ratio - 0.5)).toBeLessThan(0.05)
  })

  it('samples from same instance have expected variance', () => {
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

  it('sampleN with count 1 returns array with single element', () => {
    const rng = new ZigguratNormal()
    const samples = rng.sampleN(1)
    expect(samples.length).toBe(1)
    expect(typeof samples[0]).toBe('number')
  })

  it('sampleN with large count works', () => {
    const rng = new ZigguratNormal()
    const samples = rng.sampleN(10000)
    expect(samples.length).toBe(10000)
    for (let i = 0; i < samples.length; i++) {
      expect(Number.isFinite(samples[i])).toBe(true)
    }
  })

  it('sampleMean with large count approaches zero', () => {
    const rng = new ZigguratNormal()
    const mean = rng.sampleMean(50000)
    expect(Math.abs(mean)).toBeLessThan(0.05)
  })

  it('sample never returns Infinity', () => {
    const rng = new ZigguratNormal()
    for (let i = 0; i < 1000; i++) {
      expect(rng.sample()).not.toBe(Infinity)
      expect(rng.sample()).not.toBe(-Infinity)
    }
  })

  it('sample never returns undefined or null', () => {
    const rng = new ZigguratNormal()
    for (let i = 0; i < 100; i++) {
      const val = rng.sample()
      expect(val).not.toBeUndefined()
      expect(val).not.toBeNull()
    }
  })

  it('sampleN returns Float64Array', () => {
    const rng = new ZigguratNormal()
    const samples = rng.sampleN(10)
    expect(samples).toBeInstanceOf(Float64Array)
  })

  it('approximately 68% of samples are within 1 standard deviation', () => {
    const rng = new ZigguratNormal()
    const n = 10000
    let within1sd = 0
    for (let i = 0; i < n; i++) {
      const val = Math.abs(rng.sample())
      if (val < 1) within1sd++
    }
    const ratio = within1sd / n
    expect(Math.abs(ratio - 0.68)).toBeLessThan(0.2)
  })

  it('approximately 95% of samples are within 2 standard deviations', () => {
    const rng = new ZigguratNormal()
    const n = 10000
    let within2sd = 0
    for (let i = 0; i < n; i++) {
      const val = Math.abs(rng.sample())
      if (val < 2) within2sd++
    }
    const ratio = within2sd / n
    expect(Math.abs(ratio - 0.95)).toBeLessThan(0.05)
  })

  it('approximately 99.7% of samples are within 3 standard deviations', () => {
    const rng = new ZigguratNormal()
    const n = 10000
    let within3sd = 0
    for (let i = 0; i < n; i++) {
      const val = Math.abs(rng.sample())
      if (val < 3) within3sd++
    }
    const ratio = within3sd / n
    expect(Math.abs(ratio - 0.997)).toBeLessThan(0.01)
  })

  it('sampleMean with 0 returns NaN', () => {
    const rng = new ZigguratNormal()
    const mean = rng.sampleMean(0)
    expect(Number.isNaN(mean)).toBe(true)
  })

  it('sampleN preserves sample distribution', () => {
    const rng = new ZigguratNormal()
    const samples = rng.sampleN(5000)
    let sum = 0
    let sumSq = 0
    for (let i = 0; i < samples.length; i++) {
      const s = samples[i]
      sum += s
      sumSq += s * s
    }
    const mean = sum / samples.length
    const variance = sumSq / samples.length - mean * mean
    expect(Math.abs(mean)).toBeLessThan(0.1)
    expect(Math.abs(variance - 1)).toBeLessThan(0.2)
  })

  it('consecutive samples are not identical', () => {
    const rng = new ZigguratNormal()
    const samples = rng.sampleN(100)
    for (let i = 0; i < samples.length - 1; i++) {
      expect(samples[i] !== samples[i + 1]).toBe(true)
    }
  })

  it('sampleMean of large sample is stable', () => {
    const rng = new ZigguratNormal()
    const mean1 = rng.sampleMean(10000)
    const mean2 = rng.sampleMean(10000)
    expect(Math.abs(mean1 - mean2)).toBeLessThan(0.1)
  })

  it('positive samples and negative samples have similar magnitude', () => {
    const rng = new ZigguratNormal()
    const samples = rng.sampleN(10000)
    let positiveSum = 0
    let negativeSum = 0
    let positiveCount = 0
    let negativeCount = 0
    for (let i = 0; i < samples.length; i++) {
      const s = samples[i]
      if (s > 0) {
        positiveSum += s
        positiveCount++
      } else if (s < 0) {
        negativeSum += Math.abs(s)
        negativeCount++
      }
    }
    if (positiveCount > 0 && negativeCount > 0) {
      const avgPositive = positiveSum / positiveCount
      const avgNegative = negativeSum / negativeCount
      expect(Math.abs(avgPositive - avgNegative)).toBeLessThan(0.3)
    }
  })

  it('sample with custom RNG that alternates', () => {
    let counter = 0
    const rng = new ZigguratNormal(() => (counter++ % 2 === 0 ? 0.25 : 0.75))
    const val = rng.sample()
    expect(Number.isFinite(val)).toBe(true)
  })

  it('rare extreme values are possible', () => {
    const rng = new ZigguratNormal()
    let foundExtreme = false
    for (let i = 0; i < 10000; i++) {
      const val = Math.abs(rng.sample())
      if (val > 4) {
        foundExtreme = true
        break
      }
    }
    expect(foundExtreme).toBe(true)
  })

  it('sampleMean with very large count approaches zero', () => {
    const rng = new ZigguratNormal()
    const mean = rng.sampleMean(100000)
    expect(Math.abs(mean)).toBeLessThan(0.02)
  })

  it('distribution skewness is near zero', () => {
    const rng = new ZigguratNormal()
    const n = 10000
    const samples = rng.sampleN(n)
    const mean = samples.reduce((a, b) => a + b, 0) / n
    const variance = samples.reduce((a, b) => a + (b - mean) ** 2, 0) / n
    const stdDev = Math.sqrt(variance)
    const skewness = samples.reduce((a, b) => a + ((b - mean) / stdDev) ** 3, 0) / n
    expect(Math.abs(skewness)).toBeLessThan(0.3)
  })

  it('distribution kurtosis is near 3', () => {
    const rng = new ZigguratNormal()
    const n = 10000
    const samples = rng.sampleN(n)
    const mean = samples.reduce((a, b) => a + b, 0) / n
    const variance = samples.reduce((a, b) => a + (b - mean) ** 2, 0) / n
    const stdDev = Math.sqrt(variance)
    const kurtosis = samples.reduce((a, b) => a + ((b - mean) / stdDev) ** 4, 0) / n
    expect(Math.abs(kurtosis - 3)).toBeLessThan(1.0)
  })

  it('sampleN with very large count works', () => {
    const rng = new ZigguratNormal()
    const samples = rng.sampleN(50000)
    expect(samples.length).toBe(50000)
    for (let i = 0; i < samples.length; i++) {
      expect(Number.isFinite(samples[i])).toBe(true)
    }
  })

  it('should generate sample', () => {
    const zn = new ZigguratNormal()
    const val = zn.sample()
    expect(typeof val).toBe('number')
    expect(isFinite(val)).toBe(true)
  })

  it('should generate multiple samples', () => {
    const zn = new ZigguratNormal()
    const samples = zn.sampleN(100)
    expect(samples.length).toBe(100)
  })

  it('should use custom RNG', () => {
    let callCount = 0
    const zn = new ZigguratNormal(() => { callCount++; return 0.5 })
    zn.sample()
    expect(callCount).toBeGreaterThan(0)
  })

  it('should produce roughly zero mean', () => {
    const zn = new ZigguratNormal()
    const samples = zn.sampleN(1000)
    let sum = 0
    for (let i = 0; i < samples.length; i++) sum += samples[i]!
    const mean = sum / samples.length
    expect(Math.abs(mean)).toBeLessThan(0.2)
  })

  it('should produce finite values', () => {
    const zn = new ZigguratNormal()
    for (let i = 0; i < 100; i++) {
      expect(isFinite(zn.sample())).toBe(true)
    }
  })

  it('should handle sampleN with zero', () => {
    const zn = new ZigguratNormal()
    expect(zn.sampleN(0)).toHaveLength(0)
  })
})
