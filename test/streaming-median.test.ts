import { describe, expect, it } from 'vitest'

import { StreamingMedian } from '../src/core/streaming-median/index.js'

// ─── Construction ──────────────────────────────────────
describe('StreamingMedian construction', () => {
  it('creates empty instance', () => {
    const sm = new StreamingMedian()
    expect(sm.size).toBe(0)
    expect(sm.isEmpty).toBe(true)
  })
})

// ─── Single Element ────────────────────────────────────
describe('StreamingMedian single element', () => {
  it('median of single element is itself', () => {
    const sm = new StreamingMedian()
    sm.add(5)
    expect(sm.getMedian()).toBe(5)
  })
})

// ─── Odd Count ─────────────────────────────────────────
describe('StreamingMedian odd count', () => {
  it('median of three elements is middle', () => {
    const sm = new StreamingMedian()
    sm.add(1)
    sm.add(5)
    sm.add(3)
    expect(sm.getMedian()).toBe(3)
  })
})

// ─── Even Count ────────────────────────────────────────
describe('StreamingMedian even count', () => {
  it('median of even count is average of middle two', () => {
    const sm = new StreamingMedian()
    sm.add(1)
    sm.add(3)
    expect(sm.getMedian()).toBe(2)
  })

  it('median of four elements', () => {
    const sm = new StreamingMedian()
    sm.add(1)
    sm.add(2)
    sm.add(3)
    sm.add(4)
    expect(sm.getMedian()).toBe(2.5)
  })
})

// ─── Sequential Adds ───────────────────────────────────
describe('StreamingMedian sequential adds', () => {
  it('tracks median as elements are added', () => {
    const sm = new StreamingMedian()
    sm.add(1)
    expect(sm.getMedian()).toBe(1)
    sm.add(2)
    expect(sm.getMedian()).toBe(1.5)
    sm.add(3)
    expect(sm.getMedian()).toBe(2)
    sm.add(4)
    expect(sm.getMedian()).toBe(2.5)
  })

  it('handles reverse order', () => {
    const sm = new StreamingMedian()
    sm.add(5)
    sm.add(3)
    sm.add(1)
    expect(sm.getMedian()).toBe(3)
  })

  it('handles duplicates', () => {
    const sm = new StreamingMedian()
    sm.add(5)
    sm.add(5)
    sm.add(5)
    expect(sm.getMedian()).toBe(5)
  })
})

// ─── Negative Numbers ─────────────────────────────────
describe('StreamingMedian negative numbers', () => {
  it('handles negative values', () => {
    const sm = new StreamingMedian()
    sm.add(-5)
    sm.add(-1)
    sm.add(-3)
    expect(sm.getMedian()).toBe(-3)
  })

  it('handles mix of positive and negative', () => {
    const sm = new StreamingMedian()
    sm.add(-2)
    sm.add(0)
    sm.add(2)
    expect(sm.getMedian()).toBe(0)
  })
})

// ─── Size ──────────────────────────────────────────────
describe('StreamingMedian size', () => {
  it('tracks size correctly', () => {
    const sm = new StreamingMedian()
    expect(sm.size).toBe(0)
    sm.add(1)
    expect(sm.size).toBe(1)
    sm.add(2)
    expect(sm.size).toBe(2)
  })
})

// ─── GetMedian Throws ─────────────────────────────────
describe('StreamingMedian error handling', () => {
  it('throws on empty getMedian', () => {
    const sm = new StreamingMedian()
    expect(() => sm.getMedian()).toThrow('Cannot get median of empty streaming median')
  })
})

// ─── Clear ─────────────────────────────────────────────
describe('StreamingMedian clear', () => {
  it('clears the state', () => {
    const sm = new StreamingMedian()
    sm.add(1)
    sm.add(2)
    sm.clear()
    expect(sm.size).toBe(0)
    expect(sm.isEmpty).toBe(true)
  })
})

// ─── ToArray ───────────────────────────────────────────
describe('StreamingMedian toArray', () => {
  it('returns sorted array', () => {
    const sm = new StreamingMedian()
    sm.add(3)
    sm.add(1)
    sm.add(2)
    expect(sm.toArray()).toEqual([1, 2, 3])
  })

  it('returns empty array for empty', () => {
    const sm = new StreamingMedian()
    expect(sm.toArray()).toEqual([])
  })
})
