import { describe, expect, it } from 'vitest'

import { StreamingQuantile } from '../src/core/streaming-quantile/index.js'

// ─── Construction ──────────────────────────────────────
describe('StreamingQuantile construction', () => {
  it('creates empty instance', () => {
    const sq = new StreamingQuantile<number>()
    expect(sq.count).toBe(0)
    expect(sq.isEmpty()).toBe(true)
  })

  it('creates with custom error', () => {
    const sq = new StreamingQuantile<number>({ error: 0.05 })
    expect(sq.error).toBe(0.05)
  })

  it('creates with custom comparator', () => {
    const sq = new StreamingQuantile<string>({
      comparator: (a, b) => a.localeCompare(b),
    })
    sq.insert('b')
    sq.insert('a')
    expect(sq.min()).toBe('a')
    expect(sq.max()).toBe('b')
  })
})

// ─── Insert & Query ────────────────────────────────────
describe('StreamingQuantile insert and query', () => {
  it('queries quantiles on numeric data', () => {
    const sq = new StreamingQuantile<number>()
    for (let i = 1; i <= 100; i++) sq.insert(i)
    const q50 = sq.query(0.5)
    expect(q50).toBeGreaterThanOrEqual(40)
    expect(q50).toBeLessThanOrEqual(60)
  })

  it('query 0 returns min', () => {
    const sq = new StreamingQuantile<number>()
    sq.insert(10)
    sq.insert(20)
    sq.insert(30)
    expect(sq.query(0)).toBe(10)
  })

  it('query 1 returns max', () => {
    const sq = new StreamingQuantile<number>()
    sq.insert(10)
    sq.insert(20)
    sq.insert(30)
    expect(sq.query(1)).toBe(30)
  })

  it('query throws on empty stream', () => {
    const sq = new StreamingQuantile<number>()
    expect(() => sq.query(0.5)).toThrow('Cannot query empty stream')
  })

  it('queryMultiple returns array of quantiles', () => {
    const sq = new StreamingQuantile<number>()
    for (let i = 1; i <= 100; i++) sq.insert(i)
    const results = sq.queryMultiple([0.25, 0.5, 0.75])
    expect(results).toHaveLength(3)
  })
})

// ─── Min, Max, Mean ────────────────────────────────────
describe('StreamingQuantile min max mean', () => {
  it('min returns smallest', () => {
    const sq = new StreamingQuantile<number>()
    sq.insert(10)
    sq.insert(20)
    expect(sq.min()).toBe(10)
  })

  it('max returns largest', () => {
    const sq = new StreamingQuantile<number>()
    sq.insert(10)
    sq.insert(20)
    expect(sq.max()).toBe(20)
  })

  it('mean returns average', () => {
    const sq = new StreamingQuantile<number>()
    sq.insert(10)
    sq.insert(20)
    sq.insert(30)
    expect(sq.mean()).toBeCloseTo(20)
  })

  it('min/max/mean throw on empty', () => {
    const sq = new StreamingQuantile<number>()
    expect(() => sq.min()).toThrow()
    expect(() => sq.max()).toThrow()
    expect(() => sq.mean()).toThrow()
  })
})

// ─── Clone ─────────────────────────────────────────────
describe('StreamingQuantile clone', () => {
  it('clones the quantile sketch', () => {
    const sq = new StreamingQuantile<number>()
    for (let i = 1; i <= 50; i++) sq.insert(i)
    const cloned = sq.clone()
    expect(cloned.count).toBe(50)
    expect(cloned.min()).toBe(1)
    expect(cloned.max()).toBe(50)
  })
})

// ─── Merge ─────────────────────────────────────────────
describe('StreamingQuantile merge', () => {
  it('merges two quantile sketches', () => {
    const a = new StreamingQuantile<number>()
    for (let i = 1; i <= 50; i++) a.insert(i)
    const b = new StreamingQuantile<number>()
    for (let i = 51; i <= 100; i++) b.insert(i)
    const merged = a.merge(b)
    expect(merged.count).toBe(100)
    expect(merged.min()).toBe(1)
    expect(merged.max()).toBe(100)
  })
})

// ─── Clear ─────────────────────────────────────────────
describe('StreamingQuantile clear', () => {
  it('clears the sketch', () => {
    const sq = new StreamingQuantile<number>()
    sq.insert(1)
    sq.insert(2)
    sq.clear()
    expect(sq.count).toBe(0)
    expect(sq.isEmpty()).toBe(true)
  })
})

// ─── Count ─────────────────────────────────────────────
describe('StreamingQuantile count', () => {
  it('tracks count', () => {
    const sq = new StreamingQuantile<number>()
    sq.insert(1)
    sq.insert(2)
    sq.insert(3)
    expect(sq.count).toBe(3)
  })
})
