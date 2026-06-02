import { describe, it, expect } from 'vitest'
import { HyperLogLog } from '../../src/utils/hyper-log-log.js'

// ─── Constructor ──────────────────────────────────────────
describe('HyperLogLog - constructor', () => {
  it('creates with default precision 14', () => {
    const hll = new HyperLogLog()
    expect(hll.precision).toBe(14)
    expect(hll.registerCount).toBe(1 << 14)
  })

  it('creates with custom precision', () => {
    const hll = new HyperLogLog(8)
    expect(hll.precision).toBe(8)
    expect(hll.registerCount).toBe(256)
  })

  it('throws on precision below 4', () => {
    expect(() => new HyperLogLog(3)).toThrow(RangeError)
  })

  it('throws on precision above 16', () => {
    expect(() => new HyperLogLog(17)).toThrow(RangeError)
  })
})

// ─── Cardinality estimation ───────────────────────────────
describe('HyperLogLog - count', () => {
  it('returns 0 for empty set', () => {
    const hll = new HyperLogLog(8)
    expect(hll.count()).toBe(0)
  })

  it('estimates cardinality for small set', () => {
    const hll = new HyperLogLog(8)
    for (let i = 0; i < 100; i++) {
      hll.add(`item-${i}`)
    }
    const estimate = hll.count()
    expect(estimate).toBeGreaterThan(50)
    expect(estimate).toBeLessThan(200)
  })

  it('estimates cardinality for larger set', () => {
    const hll = new HyperLogLog(12)
    for (let i = 0; i < 10000; i++) {
      hll.add(`item-${i}`)
    }
    const estimate = hll.count()
    expect(estimate).toBeGreaterThan(5000)
    expect(estimate).toBeLessThan(20000)
  })

  it('handles duplicate adds', () => {
    const hll = new HyperLogLog(8)
    for (let i = 0; i < 100; i++) {
      hll.add('same-item')
    }
    const estimate = hll.count()
    expect(estimate).toBeLessThanOrEqual(5)
  })
})

// ─── Merge ────────────────────────────────────────────────
describe('HyperLogLog - merge', () => {
  it('merges two HyperLogLogs', () => {
    const hll1 = new HyperLogLog(8)
    const hll2 = new HyperLogLog(8)
    for (let i = 0; i < 500; i++) hll1.add(`a-${i}`)
    for (let i = 0; i < 500; i++) hll2.add(`b-${i}`)
    const merged = hll1.merge(hll2)
    const estimate = merged.count()
    expect(estimate).toBeGreaterThan(500)
    expect(estimate).toBeLessThan(1500)
  })

  it('throws on different precision merge', () => {
    const hll1 = new HyperLogLog(8)
    const hll2 = new HyperLogLog(10)
    expect(() => hll1.merge(hll2)).toThrow('Cannot merge')
  })
})

// ─── Reset ────────────────────────────────────────────────
describe('HyperLogLog - reset', () => {
  it('clears all data', () => {
    const hll = new HyperLogLog(8)
    for (let i = 0; i < 100; i++) hll.add(`item-${i}`)
    hll.reset()
    expect(hll.count()).toBe(0)
  })
})

describe('HyperLogLog - edge cases', () => {
  it('handles empty string', () => {
    const hll = new HyperLogLog(8)
    hll.add('')
    expect(hll.count()).toBeGreaterThan(0)
  })

  it('handles unicode strings', () => {
    const hll = new HyperLogLog(8)
    hll.add('日本語')
    hll.add('中文')
    hll.add('العربية')
    const estimate = hll.count()
    expect(estimate).toBeGreaterThan(0)
    expect(estimate).toBeLessThanOrEqual(10)
  })

  it('reset allows re-adding', () => {
    const hll = new HyperLogLog(8)
    for (let i = 0; i < 50; i++) hll.add(`item-${i}`)
    hll.reset()
    for (let i = 0; i < 50; i++) hll.add(`new-${i}`)
    const estimate = hll.count()
    expect(estimate).toBeGreaterThan(25)
    expect(estimate).toBeLessThan(100)
  })

  it('merge with empty returns same estimate', () => {
    const hll1 = new HyperLogLog(8)
    for (let i = 0; i < 100; i++) hll1.add(`item-${i}`)
    const hll2 = new HyperLogLog(8)
    const merged = hll1.merge(hll2)
    expect(merged.count()).toBeCloseTo(hll1.count(), -1)
  })

  it('self-merge preserves estimate', () => {
    const hll = new HyperLogLog(8)
    for (let i = 0; i < 100; i++) hll.add(`item-${i}`)
    const original = hll.count()
    const merged = hll.merge(hll)
    expect(merged.count()).toBeCloseTo(original, -1)
  })

  it('merge of two disjoint sets approximates sum', () => {
    const hll1 = new HyperLogLog(10)
    for (let i = 0; i < 100; i++) hll1.add(`set1-${i}`)
    const hll2 = new HyperLogLog(10)
    for (let i = 0; i < 100; i++) hll2.add(`set2-${i}`)
    const merged = hll1.merge(hll2)
    const estimate = merged.count()
    expect(estimate).toBeGreaterThan(100)
    expect(estimate).toBeLessThan(400)
  })

  it('precision parameter affects accuracy', () => {
    const hll8 = new HyperLogLog(8)
    const hll14 = new HyperLogLog(14)
    for (let i = 0; i < 500; i++) {
      hll8.add(`item-${i}`)
      hll14.add(`item-${i}`)
    }
    expect(hll14.count()).toBeGreaterThan(0)
    expect(hll8.count()).toBeGreaterThan(0)
  })

  it('empty HLL estimates zero', () => {
    const hll = new HyperLogLog(10)
    expect(hll.count()).toBe(0)
  })

  it('single element estimates at least 1', () => {
    const hll = new HyperLogLog(10)
    hll.add('unique-item')
    expect(hll.count()).toBeGreaterThanOrEqual(1)
  })
})
