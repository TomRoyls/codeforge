import { describe, expect, it } from 'vitest'
import { IntervalGraph } from '../../src/utils/interval-graph.js'

describe('IntervalGraph', () => {
  it('non-overlapping intervals form valid graph', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 2)
    ig.addInterval(3, 5)
    expect(ig.isIntervalGraph()).toBe(true)
  })

  it('overlapping intervals form valid graph', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 5)
    ig.addInterval(2, 7)
    ig.addInterval(4, 9)
    expect(ig.isIntervalGraph()).toBe(true)
  })

  it('max overlap counts correctly', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 5)
    ig.addInterval(2, 7)
    ig.addInterval(4, 9)
    expect(ig.maxOverlap()).toBe(3)
  })

  it('no overlap gives max 1', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 2)
    ig.addInterval(3, 5)
    expect(ig.maxOverlap()).toBe(1)
  })

  it('single interval', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 10)
    expect(ig.isIntervalGraph()).toBe(true)
    expect(ig.maxOverlap()).toBe(1)
  })

  it('empty graph', () => {
    const ig = new IntervalGraph()
    expect(ig.isIntervalGraph()).toBe(true)
    expect(ig.maxOverlap()).toBe(0)
  })

  it('all same intervals', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 5)
    ig.addInterval(0, 5)
    ig.addInterval(0, 5)
    expect(ig.maxOverlap()).toBe(3)
    expect(ig.isIntervalGraph()).toBe(true)
  })

  it('nested intervals', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 10)
    ig.addInterval(2, 8)
    ig.addInterval(4, 6)
    expect(ig.isIntervalGraph()).toBe(true)
    expect(ig.maxOverlap()).toBe(3)
  })

  it('total overlap calculation', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 5)
    ig.addInterval(3, 8)
    expect(ig.totalOverlap()).toBe(10)
  })

  it('total overlap with no overlap', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 2)
    ig.addInterval(5, 8)
    expect(ig.totalOverlap()).toBe(5)
  })

  it('adjacent intervals', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 3)
    ig.addInterval(3, 6)
    expect(ig.maxOverlap()).toBeLessThanOrEqual(2)
  })

  it('three non-overlapping intervals', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 2)
    ig.addInterval(3, 5)
    ig.addInterval(6, 8)
    expect(ig.isIntervalGraph()).toBe(true)
    expect(ig.maxOverlap()).toBe(1)
  })

  it('overlapping intervals increase max overlap', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 10)
    ig.addInterval(5, 15)
    expect(ig.maxOverlap()).toBe(2)
  })

  it('toString returns descriptive string', () => {
    const ig = new IntervalGraph()
    expect(ig.toString()).toBe('IntervalGraph(0)')
    ig.addInterval(0, 5)
    expect(ig.toString()).toBe('IntervalGraph(1)')
    ig.addInterval(3, 8)
    expect(ig.toString()).toBe('IntervalGraph(2)')
  })

  it('toJSON returns intervals array', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 5)
    ig.addInterval(3, 8)
    expect(ig.toJSON()).toEqual([[0, 5], [3, 8]])
  })

  it('toJSON on empty graph', () => {
    const ig = new IntervalGraph()
    expect(ig.toJSON()).toEqual([])
  })

  it('clone creates independent copy', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 5)
    ig.addInterval(3, 8)
    const c = ig.clone()
    expect(c.toJSON()).toEqual([[0, 5], [3, 8]])
    c.addInterval(10, 20)
    expect(ig.toString()).toBe('IntervalGraph(2)')
    expect(c.toString()).toBe('IntervalGraph(3)')
  })

  it('clone of empty graph', () => {
    const ig = new IntervalGraph()
    const c = ig.clone()
    expect(c.toJSON()).toEqual([])
    expect(c.isIntervalGraph()).toBe(true)
  })

  it('equals returns true for identical graphs', () => {
    const ig1 = new IntervalGraph()
    ig1.addInterval(0, 5)
    ig1.addInterval(3, 8)
    const ig2 = new IntervalGraph()
    ig2.addInterval(0, 5)
    ig2.addInterval(3, 8)
    expect(ig1.equals(ig2)).toBe(true)
  })

  it('equals returns false for different intervals', () => {
    const ig1 = new IntervalGraph()
    ig1.addInterval(0, 5)
    const ig2 = new IntervalGraph()
    ig2.addInterval(0, 10)
    expect(ig1.equals(ig2)).toBe(false)
  })

  it('equals returns false for different count', () => {
    const ig1 = new IntervalGraph()
    ig1.addInterval(0, 5)
    const ig2 = new IntervalGraph()
    expect(ig1.equals(ig2)).toBe(false)
  })

  it('equals returns false for non-IntervalGraph', () => {
    const ig = new IntervalGraph()
    expect(ig.equals(null)).toBe(false)
    expect(ig.equals({})).toBe(false)
  })

  it('equals returns true for empty graphs', () => {
    expect(new IntervalGraph().equals(new IntervalGraph())).toBe(true)
  })

  it('total overlap of single interval', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 5)
    expect(ig.totalOverlap()).toBe(5)
  })

  it('total overlap of empty graph', () => {
    const ig = new IntervalGraph()
    expect(ig.totalOverlap()).toBe(0)
  })

  it('many overlapping intervals', () => {
    const ig = new IntervalGraph()
    for (let i = 0; i < 10; i++) {
      ig.addInterval(i, i + 10)
    }
    expect(ig.maxOverlap()).toBe(10)
  })

  it('point intervals (start == end)', () => {
    const ig = new IntervalGraph()
    ig.addInterval(5, 5)
    ig.addInterval(5, 5)
    expect(ig.maxOverlap()).toBe(2)
  })

  it('negative intervals', () => {
    const ig = new IntervalGraph()
    ig.addInterval(-10, -5)
    ig.addInterval(-7, -3)
    expect(ig.maxOverlap()).toBe(2)
  })

  it('total overlap with three intervals', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 10)
    ig.addInterval(3, 7)
    ig.addInterval(5, 15)
    expect(ig.totalOverlap()).toBeGreaterThan(0)
  })

  it('isIntervalGraph with complex overlap', () => {
    const ig = new IntervalGraph()
    ig.addInterval(1, 4)
    ig.addInterval(2, 5)
    ig.addInterval(3, 6)
    ig.addInterval(0, 3)
    expect(ig.isIntervalGraph()).toBe(true)
  })

  it('max overlap with large gap', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 1)
    ig.addInterval(100, 101)
    ig.addInterval(200, 201)
    expect(ig.maxOverlap()).toBe(1)
  })

  it('clone preserves total overlap', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 5)
    ig.addInterval(3, 8)
    const c = ig.clone()
    expect(c.totalOverlap()).toBe(ig.totalOverlap())
  })

  it('toJSON reflects insertion order', () => {
    const ig = new IntervalGraph()
    ig.addInterval(10, 20)
    ig.addInterval(0, 5)
    const json = ig.toJSON() as number[][]
    expect(json[0]![0]).toBe(10)
    expect(json[1]![0]).toBe(0)
  })

  it('equals with same intervals different order is false', () => {
    const ig1 = new IntervalGraph()
    ig1.addInterval(0, 5)
    ig1.addInterval(10, 15)
    const ig2 = new IntervalGraph()
    ig2.addInterval(10, 15)
    ig2.addInterval(0, 5)
    expect(ig1.equals(ig2)).toBe(false)
  })

  it('max overlap of two identical intervals', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 5)
    ig.addInterval(0, 5)
    expect(ig.maxOverlap()).toBe(2)
  })

  it('deeply nested intervals', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 100)
    ig.addInterval(10, 90)
    ig.addInterval(20, 80)
    ig.addInterval(30, 70)
    ig.addInterval(40, 60)
    expect(ig.maxOverlap()).toBe(5)
  })

  it('total overlap with identical intervals', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 5)
    ig.addInterval(0, 5)
    ig.addInterval(0, 5)
    expect(ig.totalOverlap()).toBe(15)
  })

  it('isIntervalGraph after many additions', () => {
    const ig = new IntervalGraph()
    for (let i = 0; i < 50; i++) {
      ig.addInterval(i * 2, i * 2 + 1)
    }
    expect(ig.isIntervalGraph()).toBe(true)
  })
})
