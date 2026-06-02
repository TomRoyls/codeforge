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

  it('two intervals', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 2)
    ig.addInterval(1, 3)
    expect(ig.isIntervalGraph()).toBe(true)
    expect(ig.maxOverlap()).toBe(2)
  })

  it('total overlap with no overlap', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 2)
    ig.addInterval(5, 8)
    expect(ig.totalOverlap()).toBe(5)
  })

  it('single interval', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 10)
    expect(ig.isIntervalGraph()).toBe(true)
    expect(ig.maxOverlap()).toBe(1)
  })

  it('empty graph is interval graph', () => {
    const ig = new IntervalGraph()
    expect(ig.isIntervalGraph()).toBe(true)
    expect(ig.maxOverlap()).toBe(0)
  })

  it('three non-overlapping intervals', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 2)
    ig.addInterval(3, 5)
    ig.addInterval(6, 8)
    expect(ig.isIntervalGraph()).toBe(true)
    expect(ig.maxOverlap()).toBe(1)
  })

  it('adjacent intervals', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 3)
    ig.addInterval(3, 6)
    expect(ig.maxOverlap()).toBeLessThanOrEqual(2)
  })

  it('nested intervals have max overlap', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 10)
    ig.addInterval(2, 8)
    ig.addInterval(4, 6)
    expect(ig.maxOverlap()).toBe(3)
  })

  it('handles single interval', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 10)
    expect(ig.maxOverlap()).toBe(1)
  })

  it('overlapping intervals increase max overlap', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 10)
    ig.addInterval(5, 15)
    expect(ig.maxOverlap()).toBe(2)
  })

  it('non-overlapping intervals have max 1', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 5)
    ig.addInterval(10, 15)
    expect(ig.maxOverlap()).toBe(1)
  })

  it('overlapping intervals have overlap 2', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 10)
    ig.addInterval(5, 15)
    expect(ig.maxOverlap()).toBe(2)
  })
})
