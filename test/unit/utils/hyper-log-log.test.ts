import { describe, expect, it } from 'vitest'
import { HyperLogLog } from '../../../src/utils/hyper-log-log.js'

describe('HyperLogLog', () => {
  it('should construct with default precision', () => {
    const hll = new HyperLogLog()
    expect(hll.precision).toBe(14)
    expect(hll.registerCount).toBe(16384)
  })

  it('should construct with custom precision', () => {
    const hll = new HyperLogLog(8)
    expect(hll.precision).toBe(8)
    expect(hll.registerCount).toBe(256)
  })

  it('should throw on precision below 4', () => {
    expect(() => new HyperLogLog(3)).toThrow(RangeError)
  })

  it('should throw on precision above 16', () => {
    expect(() => new HyperLogLog(17)).toThrow(RangeError)
  })

  it('should throw with precision 4', () => {
    expect(() => new HyperLogLog(4)).not.toThrow()
  })

  it('should throw with precision 16', () => {
    expect(() => new HyperLogLog(16)).not.toThrow()
  })

  it('should return 0 for empty sketch', () => {
    const hll = new HyperLogLog()
    expect(hll.count()).toBe(0)
  })

  it('should estimate 1 for single item', () => {
    const hll = new HyperLogLog()
    hll.add('hello')
    expect(hll.count()).toBe(1)
  })

  it('should estimate cardinality for multiple unique items', () => {
    const hll = new HyperLogLog()
    for (let i = 0; i < 1000; i++) {
      hll.add(`item${i}`)
    }
    const estimate = hll.count()
    expect(estimate).toBeGreaterThan(900)
    expect(estimate).toBeLessThan(1100)
  })

  it('should estimate cardinality for many items', () => {
    const hll = new HyperLogLog()
    for (let i = 0; i < 10000; i++) {
      hll.add(`item${i}`)
    }
    const estimate = hll.count()
    expect(estimate).toBeGreaterThan(9000)
    expect(estimate).toBeLessThan(11000)
  })

  it('should handle duplicate items', () => {
    const hll = new HyperLogLog()
    for (let i = 0; i < 100; i++) {
      hll.add('duplicate')
    }
    expect(hll.count()).toBe(1)
  })

  it('should merge two sketches with same precision', () => {
    const hll1 = new HyperLogLog(8)
    const hll2 = new HyperLogLog(8)
    for (let i = 0; i < 500; i++) {
      hll1.add(`set1-${i}`)
      hll2.add(`set2-${i}`)
    }
    const merged = hll1.merge(hll2)
    const count1 = hll1.count()
    const count2 = hll2.count()
    const mergedCount = merged.count()
    expect(mergedCount).toBeGreaterThan(count1)
    expect(mergedCount).toBeGreaterThan(count2)
  })

  it('should throw when merging sketches with different precision', () => {
    const hll1 = new HyperLogLog(8)
    const hll2 = new HyperLogLog(12)
    expect(() => hll1.merge(hll2)).toThrow('Cannot merge HyperLogLog with different precision')
  })

  it('should reset sketch', () => {
    const hll = new HyperLogLog()
    hll.add('item1')
    hll.add('item2')
    hll.add('item3')
    expect(hll.count()).toBeGreaterThan(0)
    hll.reset()
    expect(hll.count()).toBe(0)
  })

  it('should have correct precision getter', () => {
    const hll = new HyperLogLog(10)
    expect(hll.precision).toBe(10)
  })

  it('should have correct registerCount getter', () => {
    const hll = new HyperLogLog(10)
    expect(hll.registerCount).toBe(1024)
  })

  it('should estimate cardinality for 10 unique items', () => {
    const hll = new HyperLogLog()
    for (let i = 0; i < 10; i++) {
      hll.add(`item${i}`)
    }
    const estimate = hll.count()
    expect(estimate).toBeCloseTo(10, 0)
  })

  it('should estimate cardinality for 100 unique items', () => {
    const hll = new HyperLogLog()
    for (let i = 0; i < 100; i++) {
      hll.add(`item${i}`)
    }
    const estimate = hll.count()
    expect(estimate).toBeGreaterThan(90)
    expect(estimate).toBeLessThan(110)
  })

  it('should handle empty string', () => {
    const hll = new HyperLogLog()
    hll.add('')
    expect(hll.count()).toBe(1)
  })

  it('should handle very long strings', () => {
    const hll = new HyperLogLog()
    const longString = 'a'.repeat(10000)
    hll.add(longString)
    expect(hll.count()).toBe(1)
  })

  it('should handle special characters', () => {
    const hll = new HyperLogLog()
    hll.add('!@#$%^&*()')
    hll.add('日本語')
    hll.add('😀')
    const estimate = hll.count()
    expect(estimate).toBe(3)
  })

  it('should merge empty sketches', () => {
    const hll1 = new HyperLogLog()
    const hll2 = new HyperLogLog()
    const merged = hll1.merge(hll2)
    expect(merged.count()).toBe(0)
  })

  it('should merge empty with non-empty sketch', () => {
    const hll1 = new HyperLogLog()
    const hll2 = new HyperLogLog()
    hll1.add('item1')
    hll1.add('item2')
    const merged = hll1.merge(hll2)
    expect(merged.count()).toBeGreaterThan(0)
  })

  it('should return a new instance after merge', () => {
    const hll1 = new HyperLogLog()
    const hll2 = new HyperLogLog()
    hll1.add('item1')
    const merged = hll1.merge(hll2)
    expect(merged).not.toBe(hll1)
    expect(merged).not.toBe(hll2)
  })

  it('should estimate correctly after reset and re-add', () => {
    const hll = new HyperLogLog()
    hll.add('item1')
    hll.add('item2')
    hll.reset()
    hll.add('item3')
    hll.add('item4')
    const estimate = hll.count()
    expect(estimate).toBe(2)
  })
})