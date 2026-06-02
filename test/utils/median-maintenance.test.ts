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

  it('handles duplicate values', () => {
    const mm = new MedianMaintenance()
    mm.add(5)
    mm.add(5)
    mm.add(5)
    expect(mm.getMedian()).toBe(5)
    expect(mm.getRollingMedian()).toBe(5)
  })

  it('size tracks count correctly', () => {
    const mm = new MedianMaintenance()
    expect(mm.size).toBe(0)
    mm.add(1)
    expect(mm.size).toBe(1)
    mm.add(2)
    expect(mm.size).toBe(2)
  })

  it('isEmpty works', () => {
    const mm = new MedianMaintenance()
    expect(mm.isEmpty).toBe(true)
    mm.add(1)
    expect(mm.isEmpty).toBe(false)
  })

  it('median of odd count is middle element', () => {
    const mm = new MedianMaintenance()
    mm.add(1)
    mm.add(2)
    mm.add(3)
    expect(mm.getMedian()).toBe(2)
  })

  it('median of single element', () => {
    const mm = new MedianMaintenance()
    mm.add(42)
    expect(mm.getMedian()).toBe(42)
  })

  it('two elements returns first', () => {
    const mm = new MedianMaintenance()
    mm.add(10)
    mm.add(20)
    expect(mm.getMedian()).toBe(10)
  })
})
