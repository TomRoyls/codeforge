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
})
