import { describe, it, expect } from 'vitest'
import { CountMinSketch } from '../../src/utils/count-min-sketch.js'

// ─── Constructor ──────────────────────────────────────────
describe('CountMinSketch - constructor', () => {
  it('creates with valid params', () => {
    const cms = new CountMinSketch({ width: 100, depth: 5 })
    const stats = cms.getStats()
    expect(stats.width).toBe(100)
    expect(stats.depth).toBe(5)
    expect(stats.totalCells).toBe(500)
  })

  it('throws on invalid width', () => {
    expect(() => new CountMinSketch({ width: 0, depth: 5 })).toThrow(RangeError)
  })

  it('throws on invalid depth', () => {
    expect(() => new CountMinSketch({ width: 100, depth: 0 })).toThrow(RangeError)
  })
})

// ─── Update and Estimate ──────────────────────────────────
describe('CountMinSketch - update and estimate', () => {
  it('estimates count for single item', () => {
    const cms = new CountMinSketch({ width: 100, depth: 5 })
    cms.update('hello')
    cms.update('hello')
    cms.update('hello')
    expect(cms.estimate('hello')).toBe(3)
  })

  it('estimates count for multiple items', () => {
    const cms = new CountMinSketch({ width: 100, depth: 5 })
    cms.update('a', 10)
    cms.update('b', 5)
    expect(cms.estimate('a')).toBe(10)
    expect(cms.estimate('b')).toBe(5)
    expect(cms.estimate('c')).toBe(0)
  })

  it('provides upper bound estimate', () => {
    const cms = new CountMinSketch({ width: 10, depth: 3 })
    for (let i = 0; i < 100; i++) {
      cms.update(`item-${i}`)
    }
    expect(cms.estimate('item-0')).toBeGreaterThanOrEqual(1)
  })
})

// ─── Reset ────────────────────────────────────────────────
describe('CountMinSketch - reset', () => {
  it('clears all counts', () => {
    const cms = new CountMinSketch({ width: 100, depth: 5 })
    cms.update('a', 100)
    cms.reset()
    expect(cms.estimate('a')).toBe(0)
  })

  it('allows updates after reset', () => {
    const cms = new CountMinSketch({ width: 100, depth: 5 })
    cms.update('a', 100)
    cms.reset()
    cms.update('a', 5)
    expect(cms.estimate('a')).toBe(5)
  })
})

// ─── Edge cases ───────────────────────────────────────────
describe('CountMinSketch - edge cases', () => {
  it('handles negative counts', () => {
    const cms = new CountMinSketch({ width: 100, depth: 5 })
    cms.update('a', 10)
    cms.update('a', -3)
    expect(cms.estimate('a')).toBe(7)
  })

  it('handles empty string key', () => {
    const cms = new CountMinSketch({ width: 100, depth: 5 })
    cms.update('', 5)
    expect(cms.estimate('')).toBe(5)
  })

  it('handles very large counts', () => {
    const cms = new CountMinSketch({ width: 100, depth: 5 })
    cms.update('big', 1_000_000)
    expect(cms.estimate('big')).toBe(1_000_000)
  })

  it('provides consistent estimates for same item', () => {
    const cms = new CountMinSketch({ width: 100, depth: 5 })
    cms.update('x', 42)
    expect(cms.estimate('x')).toBe(cms.estimate('x'))
  })

  it('minimum width and depth work', () => {
    const cms = new CountMinSketch({ width: 1, depth: 1 })
    cms.update('a', 5)
    expect(cms.estimate('a')).toBe(5)
  })

  it('default count parameter is 1', () => {
    const cms = new CountMinSketch({ width: 100, depth: 5 })
    cms.update('default')
    expect(cms.estimate('default')).toBe(1)
  })

  it('handles unicode keys', () => {
    const cms = new CountMinSketch({ width: 100, depth: 5 })
    cms.update('日本語', 3)
    expect(cms.estimate('日本語')).toBe(3)
  })

  it('getStats returns valid data', () => {
    const cms = new CountMinSketch({ width: 50, depth: 3 })
    const stats = cms.getStats()
    expect(stats.totalCells).toBe(150)
    expect(stats.width).toBe(50)
    expect(stats.depth).toBe(3)
  })

  it('multiple updates accumulate correctly', () => {
    const cms = new CountMinSketch({ width: 100, depth: 5 })
    cms.update('key', 3)
    cms.update('key', 7)
    expect(cms.estimate('key')).toBe(10)
  })

  it('estimate for unseen key is small', () => {
    const cms = new CountMinSketch({ width: 1000, depth: 5 })
    for (let i = 0; i < 100; i++) cms.update(`item-${i}`)
    const est = cms.estimate('never-seen')
    expect(est).toBeLessThan(100)
  })

  it('estimate for seen item is at least count', () => {
    const cms = new CountMinSketch(100, 5)
    for (let i = 0; i < 50; i++) cms.update('key')
    expect(cms.estimate('key')).toBeGreaterThanOrEqual(50)
  })

  it('estimate is at least update count', () => {
    const cms = new CountMinSketch(100, 5)
    cms.update('x')
    cms.update('x')
    cms.update('x')
    expect(cms.estimate('x')).toBeGreaterThanOrEqual(3)
  })

  it('estimate for unseen item is small', () => {
    const cms = new CountMinSketch({ width: 1000, depth: 5 })
    expect(cms.estimate('unseen')).toBeLessThan(10)
  })

  it('update and estimate tracked item', () => {
    const cms = new CountMinSketch({ width: 1000, depth: 5 })
    cms.update('hello', 10)
    expect(cms.estimate('hello')).toBeGreaterThanOrEqual(10)
  })

  it('estimate returns 0 for unseen item', () => {
    const cms = new CountMinSketch({ width: 1000, depth: 5 })
    expect(cms.estimate('never-seen')).toBe(0)
  })

  it('estimate after update is positive', () => {
    const cms = new CountMinSketch({ width: 1000, depth: 5 })
    cms.update('item', 5)
    expect(cms.estimate('item')).toBeGreaterThanOrEqual(5)
  })
})
