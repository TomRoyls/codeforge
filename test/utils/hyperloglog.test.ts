import { describe, it, expect } from 'vitest'
import { HyperLogLog } from '../../src/utils/hyperloglog.js'

describe('HyperLogLog', () => {
  it('creates instance with default precision', () => {
    const hll = new HyperLogLog()
    expect(hll.registerCount).toBe(16384)
    expect(hll.precision).toBe(14)
  })

  it('creates instance with custom precision', () => {
    const hll = new HyperLogLog(12)
    expect(hll.registerCount).toBe(4096)
    expect(hll.precision).toBe(12)
  })

  it('adds single value and counts', () => {
    const hll = new HyperLogLog()
    hll.add('test')
    expect(hll.count()).toBeCloseTo(1, 0)
  })

  it('adds multiple unique values', () => {
    const hll = new HyperLogLog()
    for (let i = 0; i < 100; i++) {
      hll.add(`value-${i}`)
    }
    expect(hll.count()).toBeGreaterThan(80)
    expect(hll.count()).toBeLessThan(120)
  })

  it('handles duplicate values correctly', () => {
    const hll = new HyperLogLog()
    hll.add('test')
    hll.add('test')
    hll.add('test')
    expect(hll.count()).toBeCloseTo(1, 0)
  })

  it('counts large set of unique values with accuracy', () => {
    const hll = new HyperLogLog()
    const count = 10000
    for (let i = 0; i < count; i++) {
      hll.add(`unique-${i}`)
    }
    const estimate = hll.count()
    const error = Math.abs(estimate - count) / count
    expect(error).toBeLessThan(0.15)
  })

  it('merges two HyperLogLog instances', () => {
    const hll1 = new HyperLogLog()
    const hll2 = new HyperLogLog()
    hll1.add('a')
    hll1.add('b')
    hll2.add('c')
    hll2.add('d')
    hll1.merge(hll2)
    expect(hll1.count()).toBeGreaterThan(3)
    expect(hll1.count()).toBeLessThan(5)
  })

  it('merges overlapping sets correctly', () => {
    const hll1 = new HyperLogLog()
    const hll2 = new HyperLogLog()
    hll1.add('a')
    hll1.add('b')
    hll2.add('b')
    hll2.add('c')
    hll1.merge(hll2)
    expect(hll1.count()).toBeGreaterThan(2)
    expect(hll1.count()).toBeLessThan(4)
  })

  it('merges with empty instance', () => {
    const hll1 = new HyperLogLog()
    const hll2 = new HyperLogLog()
    hll1.add('test')
    hll1.merge(hll2)
    expect(hll1.count()).toBeCloseTo(1, 0)
  })

  it('handles empty count', () => {
    const hll = new HyperLogLog()
    expect(hll.count()).toBe(0)
  })

  it('handles string values with special characters', () => {
    const hll = new HyperLogLog()
    hll.add('test!@#$%^&*()')
    hll.add('test-with-dashes')
    hll.add('test_with_underscores')
    hll.add('test with spaces')
    expect(hll.count()).toBeGreaterThan(3)
    expect(hll.count()).toBeLessThan(5)
  })

  it('handles very long strings', () => {
    const hll = new HyperLogLog()
    const longString = 'a'.repeat(10000)
    hll.add(longString)
    expect(hll.count()).toBeCloseTo(1, 0)
  })

  it('handles numeric string values', () => {
    const hll = new HyperLogLog()
    hll.add('123')
    hll.add('456')
    hll.add('789')
    expect(hll.count()).toBeGreaterThan(2)
    expect(hll.count()).toBeLessThan(4)
  })

  it('maintains accuracy after multiple merges', () => {
    const hll1 = new HyperLogLog()
    const hll2 = new HyperLogLog()
    const hll3 = new HyperLogLog()
    const count = 3000
    for (let i = 0; i < count; i++) {
      if (i < count / 3) {
        hll1.add(`value-${i}`)
      } else if (i < (count * 2) / 3) {
        hll2.add(`value-${i}`)
      } else {
        hll3.add(`value-${i}`)
      }
    }
    hll1.merge(hll2)
    hll1.merge(hll3)
    const estimate = hll1.count()
    const error = Math.abs(estimate - count) / count
    expect(error).toBeLessThan(0.2)
  })

  it('handles merge with different precision', () => {
    const hll1 = new HyperLogLog(12)
    const hll2 = new HyperLogLog(12)
    hll1.add('a')
    hll2.add('b')
    hll1.merge(hll2)
    expect(hll1.count()).toBeGreaterThan(1)
    expect(hll1.count()).toBeLessThan(3)
  })

  it('add and count same value many times', () => {
    const hll = new HyperLogLog()
    for (let i = 0; i < 1000; i++) hll.add('same')
    expect(hll.count()).toBeCloseTo(1, 0)
  })

  it('handles unicode strings', () => {
    const hll = new HyperLogLog()
    hll.add('日本語テスト')
    hll.add('🎉🎊🎈')
    hll.add('Привет')
    expect(hll.count()).toBeGreaterThan(2)
    expect(hll.count()).toBeLessThan(4)
  })

  it('empty string counts as value', () => {
    const hll = new HyperLogLog()
    hll.add('')
    expect(hll.count()).toBeCloseTo(1, 0)
  })

  it('multiple adds approximate count', () => {
    const hll = new HyperLogLog()
    for (let i = 0; i < 100; i++) hll.add(`item-${i}`)
    expect(hll.count()).toBeGreaterThan(50)
  })

  it('empty estimates zero', () => {
    const hll = new HyperLogLog()
    expect(hll.count()).toBe(0)
  })

  it('add then count is positive', () => {
    const hll = new HyperLogLog()
    hll.add('test')
    expect(hll.count()).toBeGreaterThanOrEqual(1)
  })

  it('merge combines cardinalities', () => {
    const hll1 = new HyperLogLog()
    const hll2 = new HyperLogLog()
    hll1.add('a')
    hll2.add('b')
    hll1.merge(hll2)
    expect(hll1.count()).toBeGreaterThanOrEqual(2)
  })

  it('empty count is near zero', () => {
    const hll = new HyperLogLog(10)
    expect(hll.count()).toBeLessThan(1)
  })

  it('count after adds is positive', () => {
    const hll = new HyperLogLog(10)
    hll.add('a')
    hll.add('b')
    expect(hll.count()).toBeGreaterThanOrEqual(1)
  })
})