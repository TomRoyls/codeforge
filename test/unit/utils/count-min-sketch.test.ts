import { describe, expect, it } from 'vitest'
import { CountMinSketch } from '../../../src/utils/count-min-sketch.js'

describe('CountMinSketch', () => {
  it('should construct with width and depth', () => {
    const cms = new CountMinSketch({ width: 100, depth: 5 })
    const stats = cms.getStats()
    expect(stats.width).toBe(100)
    expect(stats.depth).toBe(5)
    expect(stats.totalCells).toBe(500)
  })

  it('should throw on width less than 1', () => {
    expect(() => new CountMinSketch({ width: 0, depth: 5 })).toThrow(RangeError)
  })

  it('should throw on depth less than 1', () => {
    expect(() => new CountMinSketch({ width: 100, depth: 0 })).toThrow(RangeError)
  })

  it('should throw on negative width', () => {
    expect(() => new CountMinSketch({ width: -10, depth: 5 })).toThrow(RangeError)
  })

  it('should throw on negative depth', () => {
    expect(() => new CountMinSketch({ width: 100, depth: -5 })).toThrow(RangeError)
  })

  it('should construct with width 1', () => {
    expect(() => new CountMinSketch({ width: 1, depth: 1 })).not.toThrow()
  })

  it('should construct with depth 1', () => {
    expect(() => new CountMinSketch({ width: 100, depth: 1 })).not.toThrow()
  })

  it('should return 0 for empty sketch', () => {
    const cms = new CountMinSketch({ width: 100, depth: 5 })
    expect(cms.estimate('nonexistent')).toBe(0)
  })

  it('should estimate 1 for single item added once', () => {
    const cms = new CountMinSketch({ width: 100, depth: 5 })
    cms.update('item1')
    expect(cms.estimate('item1')).toBe(1)
  })

  it('should estimate 5 for single item added 5 times', () => {
    const cms = new CountMinSketch({ width: 100, depth: 5 })
    cms.update('item1', 5)
    expect(cms.estimate('item1')).toBe(5)
  })

  it('should estimate correctly for multiple items', () => {
    const cms = new CountMinSketch({ width: 100, depth: 5 })
    cms.update('item1', 10)
    cms.update('item2', 5)
    cms.update('item3', 3)
    expect(cms.estimate('item1')).toBe(10)
    expect(cms.estimate('item2')).toBe(5)
    expect(cms.estimate('item3')).toBe(3)
  })

  it('should estimate correctly for many items', () => {
    const cms = new CountMinSketch({ width: 1000, depth: 7 })
    for (let i = 0; i < 100; i++) {
      cms.update(`item${i}`, i + 1)
    }
    for (let i = 0; i < 100; i++) {
      expect(cms.estimate(`item${i}`)).toBeGreaterThan(0)
    }
  })

  it('should handle duplicate items', () => {
    const cms = new CountMinSketch({ width: 100, depth: 5 })
    cms.update('item1')
    cms.update('item1')
    cms.update('item1')
    expect(cms.estimate('item1')).toBe(3)
  })

  it('should return 0 for items not in sketch', () => {
    const cms = new CountMinSketch({ width: 100, depth: 5 })
    cms.update('item1')
    cms.update('item2')
    expect(cms.estimate('nonexistent')).toBe(0)
  })

  it('should update with default count of 1', () => {
    const cms = new CountMinSketch({ width: 100, depth: 5 })
    cms.update('item1')
    expect(cms.estimate('item1')).toBe(1)
  })

  it('should update with custom count', () => {
    const cms = new CountMinSketch({ width: 100, depth: 5 })
    cms.update('item1', 10)
    expect(cms.estimate('item1')).toBe(10)
  })

  it('should reset sketch', () => {
    const cms = new CountMinSketch({ width: 100, depth: 5 })
    cms.update('item1', 10)
    cms.update('item2', 5)
    cms.reset()
    expect(cms.estimate('item1')).toBe(0)
    expect(cms.estimate('item2')).toBe(0)
  })

  it('should return correct stats', () => {
    const cms = new CountMinSketch({ width: 200, depth: 10 })
    const stats = cms.getStats()
    expect(stats.width).toBe(200)
    expect(stats.depth).toBe(10)
    expect(stats.totalCells).toBe(2000)
  })

  it('should handle empty string', () => {
    const cms = new CountMinSketch({ width: 100, depth: 5 })
    cms.update('', 5)
    expect(cms.estimate('')).toBe(5)
  })

  it('should handle very long strings', () => {
    const cms = new CountMinSketch({ width: 100, depth: 5 })
    const longString = 'a'.repeat(10000)
    cms.update(longString, 3)
    expect(cms.estimate(longString)).toBe(3)
  })

  it('should handle special characters', () => {
    const cms = new CountMinSketch({ width: 100, depth: 5 })
    cms.update('!@#$%^&*()', 1)
    cms.update('日本語', 2)
    cms.update('😀', 3)
    expect(cms.estimate('!@#$%^&*()')).toBe(1)
    expect(cms.estimate('日本語')).toBe(2)
    expect(cms.estimate('😀')).toBe(3)
  })

  it('should handle zero count update', () => {
    const cms = new CountMinSketch({ width: 100, depth: 5 })
    cms.update('item1', 5)
    cms.update('item1', 0)
    expect(cms.estimate('item1')).toBe(5)
  })

  it('should handle large counts', () => {
    const cms = new CountMinSketch({ width: 100, depth: 5 })
    cms.update('item1', 1000000)
    expect(cms.estimate('item1')).toBe(1000000)
  })

  it('should estimate correctly after reset and re-add', () => {
    const cms = new CountMinSketch({ width: 100, depth: 5 })
    cms.update('item1', 10)
    cms.update('item2', 5)
    cms.reset()
    cms.update('item1', 3)
    cms.update('item2', 7)
    expect(cms.estimate('item1')).toBe(3)
    expect(cms.estimate('item2')).toBe(7)
  })

  it('should handle multiple updates to same item', () => {
    const cms = new CountMinSketch({ width: 100, depth: 5 })
    cms.update('item1', 1)
    cms.update('item1', 2)
    cms.update('item1', 3)
    cms.update('item1', 4)
    expect(cms.estimate('item1')).toBe(10)
  })

  it('should maintain estimates for different items', () => {
    const cms = new CountMinSketch({ width: 100, depth: 5 })
    cms.update('item1', 100)
    cms.update('item2', 200)
    cms.update('item3', 300)
    cms.update('item1', 50)
    cms.update('item2', 100)
    cms.update('item3', 150)
    expect(cms.estimate('item1')).toBe(150)
    expect(cms.estimate('item2')).toBe(300)
    expect(cms.estimate('item3')).toBe(450)
  })
})