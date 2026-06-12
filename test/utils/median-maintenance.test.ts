import { describe, expect, it } from 'vitest'
import { MedianMaintenance } from '../../src/utils/median-maintenance.js'

describe('MedianMaintenance', () => {
  it('returns median of single element', () => {
    const mm = new MedianMaintenance()
    mm.add(5)
    expect(mm.getMedian()).toBe(5)
  })

  it('returns median of two elements', () => {
    const mm = new MedianMaintenance()
    mm.add(1)
    mm.add(3)
    expect(mm.getMedian()).toBe(1)
  })

  it('returns rolling median of two elements', () => {
    const mm = new MedianMaintenance()
    mm.add(1)
    mm.add(3)
    expect(mm.getRollingMedian()).toBe(2)
  })

  it('returns median of three elements', () => {
    const mm = new MedianMaintenance()
    mm.add(3)
    mm.add(1)
    mm.add(2)
    expect(mm.getMedian()).toBe(2)
  })

  it('handles duplicates', () => {
    const mm = new MedianMaintenance()
    mm.add(5)
    mm.add(5)
    mm.add(5)
    expect(mm.getMedian()).toBe(5)
  })

  it('tracks size correctly', () => {
    const mm = new MedianMaintenance()
    expect(mm.size).toBe(0)
    expect(mm.isEmpty).toBe(true)
    mm.add(1)
    expect(mm.size).toBe(1)
    expect(mm.isEmpty).toBe(false)
  })

  it('throws on empty getMedian', () => {
    const mm = new MedianMaintenance()
    expect(() => mm.getMedian()).toThrow()
  })

  it('rolling median for odd count equals median', () => {
    const mm = new MedianMaintenance()
    mm.add(1)
    mm.add(2)
    mm.add(3)
    expect(mm.getRollingMedian()).toBe(2)
    expect(mm.getRollingMedian()).toBe(mm.getMedian())
  })

  it('clear resets state', () => {
    const mm = new MedianMaintenance()
    mm.add(1)
    mm.add(2)
    mm.add(3)
    mm.clear()
    expect(mm.size).toBe(0)
    expect(mm.isEmpty).toBe(true)
  })

  it('handles negative numbers', () => {
    const mm = new MedianMaintenance()
    mm.add(-5)
    mm.add(-1)
    mm.add(-3)
    expect(mm.getMedian()).toBe(-3)
  })

  it('handles large dataset', () => {
    const mm = new MedianMaintenance()
    for (let i = 1; i <= 99; i++) mm.add(i)
    expect(mm.getMedian()).toBe(50)
    expect(mm.getRollingMedian()).toBe(50)
  })

  it('rolling median for even count is average', () => {
    const mm = new MedianMaintenance()
    mm.add(1)
    mm.add(2)
    mm.add(3)
    mm.add(4)
    expect(mm.getRollingMedian()).toBe(2.5)
  })

  it('clear allows re-adding', () => {
    const mm = new MedianMaintenance()
    mm.add(10)
    mm.clear()
    mm.add(20)
    mm.add(30)
    expect(mm.getMedian()).toBe(20)
    expect(mm.size).toBe(2)
  })

  it('handles descending order', () => {
    const mm = new MedianMaintenance()
    mm.add(5)
    mm.add(4)
    mm.add(3)
    mm.add(2)
    mm.add(1)
    expect(mm.getMedian()).toBe(3)
  })

  it('throws on empty getRollingMedian', () => {
    const mm = new MedianMaintenance()
    expect(() => mm.getRollingMedian()).toThrow()
  })

  it('rolling median with single element returns itself', () => {
    const mm = new MedianMaintenance()
    mm.add(42)
    expect(mm.getRollingMedian()).toBe(42)
  })

  it('rolling median with two elements returns average', () => {
    const mm = new MedianMaintenance()
    mm.add(10)
    mm.add(20)
    expect(mm.getRollingMedian()).toBe(15)
  })

  it('clear on empty structure works', () => {
    const mm = new MedianMaintenance()
    mm.clear()
    expect(mm.size).toBe(0)
    expect(mm.isEmpty).toBe(true)
  })

  it('size increases with each add', () => {
    const mm = new MedianMaintenance()
    expect(mm.size).toBe(0)
    mm.add(1)
    expect(mm.size).toBe(1)
    mm.add(2)
    expect(mm.size).toBe(2)
    mm.add(3)
    expect(mm.size).toBe(3)
  })

  it('isEmpty becomes false after first add', () => {
    const mm = new MedianMaintenance()
    expect(mm.isEmpty).toBe(true)
    mm.add(1)
    expect(mm.isEmpty).toBe(false)
  })

  it('getMedian after clear throws', () => {
    const mm = new MedianMaintenance()
    mm.add(1)
    mm.clear()
    expect(() => mm.getMedian()).toThrow()
  })

  it('getRollingMedian after clear throws', () => {
    const mm = new MedianMaintenance()
    mm.add(1)
    mm.clear()
    expect(() => mm.getRollingMedian()).toThrow()
  })

  it('handles zero values', () => {
    const mm = new MedianMaintenance()
    mm.add(0)
    mm.add(-1)
    mm.add(1)
    expect(mm.getMedian()).toBe(0)
  })

  it('handles mixed positive and negative', () => {
    const mm = new MedianMaintenance()
    mm.add(100)
    mm.add(-100)
    mm.add(50)
    mm.add(-50)
    expect(mm.getRollingMedian()).toBe(0)
  })

  it('handles very large numbers', () => {
    const mm = new MedianMaintenance()
    mm.add(Number.MAX_SAFE_INTEGER)
    mm.add(0)
    expect(mm.getRollingMedian()).toBe(Number.MAX_SAFE_INTEGER / 2)
  })

  it('handles very small numbers near zero', () => {
    const mm = new MedianMaintenance()
    mm.add(0.001)
    mm.add(0.002)
    mm.add(0.003)
    expect(mm.getMedian()).toBe(0.002)
  })

  it('all same values with rolling median', () => {
    const mm = new MedianMaintenance()
    for (let i = 0; i < 10; i++) mm.add(42)
    expect(mm.getMedian()).toBe(42)
    expect(mm.getRollingMedian()).toBe(42)
  })

  it('sequential ascending order', () => {
    const mm = new MedianMaintenance()
    for (let i = 1; i <= 10; i++) mm.add(i)
    expect(mm.getMedian()).toBe(5)
  })

  it('alternating pattern', () => {
    const mm = new MedianMaintenance()
    mm.add(1)
    mm.add(100)
    mm.add(2)
    mm.add(99)
    mm.add(3)
    expect(mm.getMedian()).toBe(3)
  })

  it('rolling median preserves precision', () => {
    const mm = new MedianMaintenance()
    mm.add(1)
    mm.add(2)
    mm.add(3)
    mm.add(4)
    const median = mm.getRollingMedian()
    expect(median).toBe(2.5)
    expect(typeof median).toBe('number')
  })

  it('large odd count', () => {
    const mm = new MedianMaintenance()
    for (let i = 1; i <= 101; i++) mm.add(i)
    expect(mm.getMedian()).toBe(51)
  })

  it('large even count', () => {
    const mm = new MedianMaintenance()
    for (let i = 1; i <= 100; i++) mm.add(i)
    expect(mm.getRollingMedian()).toBe(50.5)
  })

  it('many duplicates scattered', () => {
    const mm = new MedianMaintenance()
    mm.add(1)
    mm.add(1)
    mm.add(2)
    mm.add(2)
    mm.add(3)
    mm.add(3)
    expect(mm.getMedian()).toBe(2)
  })

  it('specific pattern: 1, 100, 2, 99, 3, 98', () => {
    const mm = new MedianMaintenance()
    mm.add(1)
    mm.add(100)
    mm.add(2)
    mm.add(99)
    mm.add(3)
    mm.add(98)
    expect(mm.getRollingMedian()).toBe(50.5)
  })

  it('clear multiple times', () => {
    const mm = new MedianMaintenance()
    mm.add(1)
    mm.clear()
    mm.clear()
    expect(mm.size).toBe(0)
    expect(mm.isEmpty).toBe(true)
  })

  it('add after clear multiple times', () => {
    const mm = new MedianMaintenance()
    mm.add(1)
    mm.clear()
    mm.add(2)
    mm.clear()
    mm.add(3)
    expect(mm.getMedian()).toBe(3)
    expect(mm.size).toBe(1)
  })

  it('edge case: positive infinity', () => {
    const mm = new MedianMaintenance()
    mm.add(Infinity)
    mm.add(1)
    expect(mm.getRollingMedian()).toBe(Infinity)
  })

  it('edge case: negative infinity', () => {
    const mm = new MedianMaintenance()
    mm.add(-Infinity)
    mm.add(1)
    expect(mm.getRollingMedian()).toBe(-Infinity)
  })

  it('handles values near max safe integer', () => {
    const mm = new MedianMaintenance()
    mm.add(Number.MAX_SAFE_INTEGER - 2)
    mm.add(Number.MAX_SAFE_INTEGER)
    mm.add(Number.MAX_SAFE_INTEGER - 1)
    expect(mm.getMedian()).toBe(Number.MAX_SAFE_INTEGER - 1)
  })

  it('rolling median returns number type', () => {
    const mm = new MedianMaintenance()
    mm.add(1)
    mm.add(2)
    mm.add(3)
    expect(typeof mm.getRollingMedian()).toBe('number')
  })

  it('getMedian returns number type', () => {
    const mm = new MedianMaintenance()
    mm.add(1)
    expect(typeof mm.getMedian()).toBe('number')
  })

  it('size after clear remains zero', () => {
    const mm = new MedianMaintenance()
    mm.add(1)
    mm.add(2)
    mm.clear()
    expect(mm.size).toBe(0)
  })

  it('isEmpty after clear remains true', () => {
    const mm = new MedianMaintenance()
    mm.add(1)
    mm.clear()
    expect(mm.isEmpty).toBe(true)
  })

  it('handles four elements median', () => {
    const mm = new MedianMaintenance()
    mm.add(4)
    mm.add(1)
    mm.add(3)
    mm.add(2)
    expect(mm.getMedian()).toBe(2)
  })

  it('handles five elements median', () => {
    const mm = new MedianMaintenance()
    mm.add(5)
    mm.add(1)
    mm.add(3)
    mm.add(2)
    mm.add(4)
    expect(mm.getMedian()).toBe(3)
  })

  it('specific sequence: 10, 20, 30', () => {
    const mm = new MedianMaintenance()
    mm.add(10)
    mm.add(20)
    mm.add(30)
    expect(mm.getMedian()).toBe(20)
    expect(mm.getRollingMedian()).toBe(20)
  })

  it('handles negative numbers', () => {
    const mm = new MedianMaintenance()
    mm.add(-5); mm.add(-1); mm.add(-3)
    expect(mm.getMedian()).toBe(-3)
  })

  it('handles mixed positive and negative', () => {
    const mm = new MedianMaintenance()
    mm.add(-2); mm.add(0); mm.add(2)
    expect(mm.getMedian()).toBe(0)
  })

  it('rolling median for two elements', () => {
    const mm = new MedianMaintenance()
    mm.add(10); mm.add(20)
    expect(mm.getRollingMedian()).toBe(15)
  })

  it('size tracks additions after clear and re-add', () => {
    const mm = new MedianMaintenance()
    mm.add(1); mm.add(2); mm.add(3)
    mm.clear()
    expect(mm.size).toBe(0)
    mm.add(10)
    expect(mm.size).toBe(1)
    expect(mm.getMedian()).toBe(10)
  })

  it('handles duplicate values', () => {
    const mm = new MedianMaintenance()
    mm.add(5); mm.add(5); mm.add(5)
    expect(mm.getMedian()).toBe(5)
    expect(mm.getRollingMedian()).toBe(5)
  })
})
