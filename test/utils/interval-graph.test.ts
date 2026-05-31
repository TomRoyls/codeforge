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
})
