import { describe, it, expect } from 'vitest'
import { HyperLogLog } from '../src/utils/hyper-log-log.js'

// ─── Constructor ───

describe('HyperLogLog', () => {
  it('creates with default precision 14', () => {
    const hll = new HyperLogLog()
    expect(hll.precision).toBe(14)
    expect(hll.registerCount).toBe(16384)
  })

  it('creates with custom precision', () => {
    const hll = new HyperLogLog(4)
    expect(hll.precision).toBe(4)
    expect(hll.registerCount).toBe(16)
  })

  it('throws for precision < 4', () => {
    expect(() => new HyperLogLog(3)).toThrow(RangeError)
  })

  it('throws for precision > 16', () => {
    expect(() => new HyperLogLog(17)).toThrow(RangeError)
  })

  // ─── Count ───

  it('count returns 0 on empty', () => {
    const hll = new HyperLogLog(10)
    expect(hll.count()).toBe(0)
  })

  it('count returns 1 after single add', () => {
    const hll = new HyperLogLog(10)
    hll.add('hello')
    expect(hll.count()).toBeGreaterThanOrEqual(1)
  })

  it('count approximates cardinality', () => {
    const hll = new HyperLogLog(12)
    const n = 1000
    for (let i = 0; i < n; i++) {
      hll.add(`item-${i}`)
    }
    const estimate = hll.count()
    const error = Math.abs(estimate - n) / n
    expect(error).toBeLessThan(0.1)
  })

  it('count with duplicates stays same', () => {
    const hll = new HyperLogLog(10)
    for (let i = 0; i < 100; i++) {
      hll.add('same')
    }
    expect(hll.count()).toBeLessThanOrEqual(5)
  })

  // ─── Merge ───

  it('merge combines two HLLs', () => {
    const hll1 = new HyperLogLog(10)
    const hll2 = new HyperLogLog(10)
    for (let i = 0; i < 500; i++) hll1.add(`a-${i}`)
    for (let i = 0; i < 500; i++) hll2.add(`b-${i}`)
    const merged = hll1.merge(hll2)
    const estimate = merged.count()
    const error = Math.abs(estimate - 1000) / 1000
    expect(error).toBeLessThan(0.15)
  })

  it('merge throws for different precision', () => {
    const hll1 = new HyperLogLog(10)
    const hll2 = new HyperLogLog(12)
    expect(() => hll1.merge(hll2)).toThrow()
  })

  // ─── Reset ───

  it('reset clears all registers', () => {
    const hll = new HyperLogLog(10)
    hll.add('test')
    hll.reset()
    expect(hll.count()).toBe(0)
  })

  // ─── Precision levels ───

  it('precision 4 has 16 registers', () => {
    const hll = new HyperLogLog(4)
    expect(hll.registerCount).toBe(16)
  })

  it('precision 16 has 65536 registers', () => {
    const hll = new HyperLogLog(16)
    expect(hll.registerCount).toBe(65536)
  })

  // ─── Edge cases ───

  it('handles empty string', () => {
    const hll = new HyperLogLog(10)
    hll.add('')
    expect(hll.count()).toBeGreaterThanOrEqual(1)
  })

  it('handles unicode strings', () => {
    const hll = new HyperLogLog(10)
    hll.add('日本語')
    hll.add('中文')
    hll.add('العربية')
    expect(hll.count()).toBeGreaterThanOrEqual(3)
  })

  it('large cardinality estimation', () => {
    const hll = new HyperLogLog(14)
    const n = 10000
    for (let i = 0; i < n; i++) {
      hll.add(`item-${i}`)
    }
    const estimate = hll.count()
    const error = Math.abs(estimate - n) / n
    expect(error).toBeLessThan(0.05)
  })

  it('merge with overlapping data', () => {
    const hll1 = new HyperLogLog(10)
    const hll2 = new HyperLogLog(10)
    for (let i = 0; i < 100; i++) hll1.add(`item-${i}`)
    for (let i = 50; i < 150; i++) hll2.add(`item-${i}`)
    const merged = hll1.merge(hll2)
    const estimate = merged.count()
    const error = Math.abs(estimate - 150) / 150
    expect(error).toBeLessThan(0.2)
  })

  it('reset allows reuse', () => {
    const hll = new HyperLogLog(10)
    hll.add('a')
    hll.add('b')
    hll.reset()
    hll.add('c')
    expect(hll.count()).toBeGreaterThanOrEqual(1)
  })
})
