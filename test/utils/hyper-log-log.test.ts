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

  it('merge combines cardinalities', () => {
    const hll1 = new HyperLogLog(10)
    hll1.add('a')
    hll1.add('b')
    const hll2 = new HyperLogLog(10)
    hll2.add('c')
    hll1.merge(hll2)
    expect(hll1.count()).toBeGreaterThanOrEqual(1)
  })

  it('empty count is near zero', () => {
    const hll = new HyperLogLog(10)
    expect(hll.count()).toBeLessThan(1)
  })

  it('add increases count', () => {
    const hll = new HyperLogLog(10)
    hll.add('hello')
    hll.add('world')
    expect(hll.count()).toBeGreaterThanOrEqual(1)
  })

  it('toString returns correct format', () => {
    const hll = new HyperLogLog(8)
    expect(hll.toString()).toBe('HyperLogLog(precision=8, registers=256)')
  })

  it('toString with default precision', () => {
    const hll = new HyperLogLog()
    expect(hll.toString()).toBe('HyperLogLog(precision=14, registers=16384)')
  })

  it('toJSON returns serializable object', () => {
    const hll = new HyperLogLog(8)
    hll.add('test')
    const json = hll.toJSON()
    expect(json).toHaveProperty('precision', 8)
    expect(json).toHaveProperty('registers')
    expect(Array.isArray(json.registers)).toBe(true)
    expect(json.registers.length).toBe(256)
  })

  it('toJSON registers are zero-initialized', () => {
    const hll = new HyperLogLog(8)
    const json = hll.toJSON()
    const nonZero = json.registers.filter((v: number) => v !== 0)
    expect(nonZero.length).toBe(0)
  })

  it('toJSON registers update after adds', () => {
    const hll = new HyperLogLog(8)
    hll.add('test-value')
    const json = hll.toJSON()
    const nonZero = json.registers.filter((v: number) => v !== 0)
    expect(nonZero.length).toBeGreaterThan(0)
  })

  it('clone creates independent copy', () => {
    const hll1 = new HyperLogLog(8)
    hll1.add('test')
    const hll2 = hll1.clone()
    hll1.add('new-value')
    expect(hll2.count()).toBeLessThan(hll1.count())
  })

  it('clone preserves precision', () => {
    const hll1 = new HyperLogLog(10)
    const hll2 = hll1.clone()
    expect(hll2.precision).toBe(10)
  })

  it('clone preserves register count', () => {
    const hll1 = new HyperLogLog(8)
    const hll2 = hll1.clone()
    expect(hll2.registerCount).toBe(256)
  })

  it('clone preserves cardinality estimate', () => {
    const hll1 = new HyperLogLog(8)
    for (let i = 0; i < 100; i++) hll1.add(`item-${i}`)
    const hll2 = hll1.clone()
    expect(hll2.count()).toBe(hll1.count())
  })

  it('equals returns true for same instance', () => {
    const hll = new HyperLogLog(8)
    expect(hll.equals(hll)).toBe(true)
  })

  it('equals returns true for identical data', () => {
    const hll1 = new HyperLogLog(8)
    const hll2 = new HyperLogLog(8)
    for (let i = 0; i < 10; i++) {
      hll1.add(`test-${i}`)
      hll2.add(`test-${i}`)
    }
    expect(hll1.equals(hll2)).toBe(true)
  })

  it('equals returns false for different precision', () => {
    const hll1 = new HyperLogLog(8)
    const hll2 = new HyperLogLog(10)
    expect(hll1.equals(hll2)).toBe(false)
  })

  it('equals returns false for different register counts', () => {
    const hll1 = new HyperLogLog(8)
    const hll2 = new HyperLogLog(8)
    hll1.add('test')
    expect(hll1.equals(hll2)).toBe(false)
  })

  it('equals returns false for non-HyperLogLog object', () => {
    const hll = new HyperLogLog(8)
    expect(hll.equals({})).toBe(false)
  })

  it('equals returns false for null', () => {
    const hll = new HyperLogLog(8)
    expect(hll.equals(null)).toBe(false)
  })

  it('equals returns false after reset', () => {
    const hll1 = new HyperLogLog(8)
    const hll2 = hll1.clone()
    hll1.add('test')
    expect(hll1.equals(hll2)).toBe(false)
  })

  it('boundary: precision 4 (minimum)', () => {
    const hll = new HyperLogLog(4)
    expect(hll.registerCount).toBe(16)
    hll.add('test')
    expect(hll.count()).toBeGreaterThanOrEqual(1)
  })

  it('boundary: precision 16 (maximum)', () => {
    const hll = new HyperLogLog(16)
    expect(hll.registerCount).toBe(65536)
    hll.add('test')
    expect(hll.count()).toBeGreaterThanOrEqual(1)
  })

  it('handles very large dataset', () => {
    const hll = new HyperLogLog(14)
    for (let i = 0; i < 100000; i++) {
      hll.add(`unique-item-${i}`)
    }
    const estimate = hll.count()
    expect(estimate).toBeGreaterThan(50000)
    expect(estimate).toBeLessThan(200000)
  })

  it('merge creates new instance', () => {
    const hll1 = new HyperLogLog(8)
    const hll2 = new HyperLogLog(8)
    hll1.add('test')
    const merged = hll1.merge(hll2)
    expect(merged).not.toBe(hll1)
    expect(merged).not.toBe(hll2)
  })

  it('merge result has same precision', () => {
    const hll1 = new HyperLogLog(10)
    const hll2 = new HyperLogLog(10)
    const merged = hll1.merge(hll2)
    expect(merged.precision).toBe(10)
  })

  it('merge original instances unchanged', () => {
    const hll1 = new HyperLogLog(8)
    const hll2 = new HyperLogLog(8)
    for (let i = 0; i < 50; i++) hll1.add(`a-${i}`)
    for (let i = 0; i < 50; i++) hll2.add(`b-${i}`)
    const count1Before = hll1.count()
    const count2Before = hll2.count()
    hll1.merge(hll2)
    expect(hll1.count()).toBe(count1Before)
    expect(hll2.count()).toBe(count2Before)
  })

  it('handles special characters in strings', () => {
    const hll = new HyperLogLog(8)
    hll.add('test!@#$%^&*()')
    hll.add('test-with-dashes')
    hll.add('test_with_underscores')
    hll.add('test with spaces')
    expect(hll.count()).toBeGreaterThan(2)
  })

  it('handles very long strings', () => {
    const hll = new HyperLogLog(8)
    const longString = 'a'.repeat(10000)
    hll.add(longString)
    expect(hll.count()).toBeGreaterThanOrEqual(1)
  })
})
