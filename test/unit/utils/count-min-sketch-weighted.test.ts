import { describe, expect, it } from 'vitest'
import { CountMinSketchWeighted } from '../../../src/utils/count-min-sketch-weighted.js'

describe('CountMinSketchWeighted', () => {
  it('constructs with valid width and depth', () => {
    const sketch = new CountMinSketchWeighted(10, 5)
    expect(sketch.width).toBe(10)
    expect(sketch.depth).toBe(5)
    expect(sketch.total).toBe(0)
  })

  it('throws error when width is less than 1', () => {
    expect(() => new CountMinSketchWeighted(0, 5)).toThrow(RangeError)
    expect(() => new CountMinSketchWeighted(-1, 5)).toThrow(RangeError)
  })

  it('throws error when depth is less than 1', () => {
    expect(() => new CountMinSketchWeighted(10, 0)).toThrow(RangeError)
    expect(() => new CountMinSketchWeighted(10, -1)).toThrow(RangeError)
  })

  it('creates sketch with withAccuracy factory', () => {
    const sketch = CountMinSketchWeighted.withAccuracy(0.1, 0.01)
    expect(sketch.width).toBeGreaterThan(0)
    expect(sketch.depth).toBeGreaterThan(0)
    expect(sketch.total).toBe(0)
  })

  it('throws error when epsilon is out of range in withAccuracy', () => {
    expect(() => CountMinSketchWeighted.withAccuracy(0, 0.01)).toThrow(RangeError)
    expect(() => CountMinSketchWeighted.withAccuracy(1, 0.01)).toThrow(RangeError)
    expect(() => CountMinSketchWeighted.withAccuracy(-0.1, 0.01)).toThrow(RangeError)
  })

  it('throws error when delta is out of range in withAccuracy', () => {
    expect(() => CountMinSketchWeighted.withAccuracy(0.1, 0)).toThrow(RangeError)
    expect(() => CountMinSketchWeighted.withAccuracy(0.1, 1)).toThrow(RangeError)
    expect(() => CountMinSketchWeighted.withAccuracy(0.1, -0.01)).toThrow(RangeError)
  })

  it('adds item with default count of 1', () => {
    const sketch = new CountMinSketchWeighted(10, 5)
    sketch.add('apple')
    expect(sketch.total).toBe(1)
    expect(sketch.count('apple')).toBeGreaterThan(0)
  })

  it('adds item with custom count', () => {
    const sketch = new CountMinSketchWeighted(10, 5)
    sketch.add('apple', 5)
    expect(sketch.total).toBe(5)
    expect(sketch.count('apple')).toBeGreaterThan(0)
  })

  it('throws error when count is negative', () => {
    const sketch = new CountMinSketchWeighted(10, 5)
    expect(() => sketch.add('apple', -1)).toThrow(RangeError)
  })

  it('counts zero for non-existent item', () => {
    const sketch = new CountMinSketchWeighted(10, 5)
    expect(sketch.count('nonexistent')).toBe(0)
  })

  it('counts zero for item added with count 0', () => {
    const sketch = new CountMinSketchWeighted(10, 5)
    sketch.add('apple', 0)
    expect(sketch.total).toBe(0)
    expect(sketch.count('apple')).toBe(0)
  })

  it('returns zero for heavyHitters with no items', () => {
    const sketch = new CountMinSketchWeighted(10, 5)
    expect(sketch.heavyHitters(0.5)).toEqual([])
  })

  it('throws error for threshold greater than 1 in heavyHitters', () => {
    const sketch = new CountMinSketchWeighted(10, 5)
    sketch.add('apple', 5)
    expect(() => sketch.heavyHitters(1.5)).toThrow(RangeError)
  })

  it('returns all items when threshold is 0', () => {
    const sketch = new CountMinSketchWeighted(10, 5)
    sketch.add('apple', 5)
    sketch.add('banana', 3)
    const hitters = sketch.heavyHitters(0)
    expect(hitters).toContain('apple')
    expect(hitters).toContain('banana')
  })

  it('returns items above threshold', () => {
    const sketch = new CountMinSketchWeighted(10, 5)
    sketch.add('apple', 10)
    sketch.add('banana', 5)
    sketch.add('cherry', 3)
    const hitters = sketch.heavyHitters(0.2)
    expect(hitters.length).toBeGreaterThan(0)
    expect(hitters.length).toBeLessThanOrEqual(3)
  })

  it('throws error for negative threshold in heavyHitters', () => {
    const sketch = new CountMinSketchWeighted(10, 5)
    sketch.add('apple', 5)
    expect(() => sketch.heavyHitters(-0.1)).toThrow(RangeError)
  })

  it('throws error for threshold greater than 1 in heavyHitters', () => {
    const sketch = new CountMinSketchWeighted(10, 5)
    sketch.add('apple', 5)
    expect(() => sketch.heavyHitters(1.1)).toThrow(RangeError)
  })

  it('merges two sketches with same dimensions', () => {
    const sketch1 = new CountMinSketchWeighted(10, 5)
    const sketch2 = new CountMinSketchWeighted(10, 5)
    sketch1.add('apple', 5)
    sketch2.add('apple', 3)
    const merged = sketch1.merge(sketch2)
    expect(merged.total).toBe(8)
    expect(merged.width).toBe(10)
    expect(merged.depth).toBe(5)
  })

  it('throws error when merging sketches with different width', () => {
    const sketch1 = new CountMinSketchWeighted(10, 5)
    const sketch2 = new CountMinSketchWeighted(20, 5)
    expect(() => sketch1.merge(sketch2)).toThrow('Cannot merge sketches with different dimensions')
  })

  it('throws error when merging sketches with different depth', () => {
    const sketch1 = new CountMinSketchWeighted(10, 5)
    const sketch2 = new CountMinSketchWeighted(10, 3)
    expect(() => sketch1.merge(sketch2)).toThrow('Cannot merge sketches with different dimensions')
  })

  it('merges sketches with different items', () => {
    const sketch1 = new CountMinSketchWeighted(10, 5)
    const sketch2 = new CountMinSketchWeighted(10, 5)
    sketch1.add('apple', 5)
    sketch2.add('banana', 3)
    const merged = sketch1.merge(sketch2)
    expect(merged.total).toBe(8)
    expect(merged.count('apple')).toBeGreaterThan(0)
    expect(merged.count('banana')).toBeGreaterThan(0)
  })

  it('returns total count from total getter', () => {
    const sketch = new CountMinSketchWeighted(10, 5)
    sketch.add('apple', 5)
    sketch.add('banana', 3)
    expect(sketch.total).toBe(8)
  })

  it('returns width from getter', () => {
    const sketch = new CountMinSketchWeighted(15, 7)
    expect(sketch.width).toBe(15)
  })

  it('returns depth from getter', () => {
    const sketch = new CountMinSketchWeighted(10, 8)
    expect(sketch.depth).toBe(8)
  })

  it('calculates errorBound for empty sketch', () => {
    const sketch = new CountMinSketchWeighted(10, 5)
    expect(sketch.errorBound()).toBe(0)
  })

  it('calculates errorBound for sketch with items', () => {
    const sketch = new CountMinSketchWeighted(10, 5)
    sketch.add('apple', 10)
    expect(sketch.errorBound()).toBeGreaterThan(0)
  })

  it('calculates confidence based on depth', () => {
    const sketch = new CountMinSketchWeighted(10, 5)
    const confidence = sketch.confidence()
    expect(confidence).toBeGreaterThan(0)
    expect(confidence).toBeLessThan(1)
  })

  it('handles multiple adds for same item', () => {
    const sketch = new CountMinSketchWeighted(10, 5)
    sketch.add('apple', 5)
    sketch.add('apple', 3)
    sketch.add('apple', 2)
    expect(sketch.total).toBe(10)
  })

  it('handles empty string items', () => {
    const sketch = new CountMinSketchWeighted(10, 5)
    sketch.add('', 5)
    expect(sketch.total).toBe(5)
    expect(sketch.count('')).toBeGreaterThan(0)
  })

  it('handles special character items', () => {
    const sketch = new CountMinSketchWeighted(10, 5)
    sketch.add('item!@#$%', 3)
    expect(sketch.total).toBe(3)
    expect(sketch.count('item!@#$%')).toBeGreaterThan(0)
  })

  it('handles large count values', () => {
    const sketch = new CountMinSketchWeighted(10, 5)
    sketch.add('apple', 1000000)
    expect(sketch.total).toBe(1000000)
    expect(sketch.count('apple')).toBeGreaterThan(0)
  })

  it('handles many distinct items', () => {
    const sketch = new CountMinSketchWeighted(100, 10)
    for (let i = 0; i < 50; i++) {
      sketch.add(`item${i}`, 1)
    }
    expect(sketch.total).toBe(50)
  })

  it('creates independent sketches from merge', () => {
    const sketch1 = new CountMinSketchWeighted(10, 5)
    const sketch2 = new CountMinSketchWeighted(10, 5)
    sketch1.add('apple', 5)
    sketch2.add('banana', 3)
    const merged = sketch1.merge(sketch2)
    merged.add('cherry', 2)
    expect(merged.total).toBe(10)
    expect(sketch1.total).toBe(5)
    expect(sketch2.total).toBe(3)
  })

  it('computes withAccuracy parameters correctly', () => {
    const sketch = CountMinSketchWeighted.withAccuracy(0.01, 0.001)
    const expectedWidth = Math.ceil(Math.E / 0.01)
    const expectedDepth = Math.ceil(Math.log(1 / 0.001))
    expect(sketch.width).toBe(expectedWidth)
    expect(sketch.depth).toBe(expectedDepth)
  })
})