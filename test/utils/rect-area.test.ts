import { describe, expect, it } from 'vitest'
import { RectArea } from '../../src/utils/rect-area.js'

describe('RectArea', () => {
  it('computes single rect area', () => {
    expect(RectArea.area({ x1: 0, y1: 0, x2: 5, y2: 3 })).toBe(15)
  })

  it('computes union of non-overlapping rects', () => {
    const rects = [
      { x1: 0, y1: 0, x2: 2, y2: 2 },
      { x1: 3, y1: 0, x2: 5, y2: 2 },
    ]
    expect(RectArea.unionArea(rects)).toBe(8)
  })

  it('computes union of overlapping rects', () => {
    const rects = [
      { x1: 0, y1: 0, x2: 4, y2: 4 },
      { x1: 2, y1: 2, x2: 6, y2: 6 },
    ]
    expect(RectArea.unionArea(rects)).toBe(28)
  })

  it('computes intersection of overlapping rects', () => {
    const r1 = { x1: 0, y1: 0, x2: 4, y2: 4 }
    const r2 = { x1: 2, y1: 2, x2: 6, y2: 6 }
    const inter = RectArea.intersection(r1, r2)
    expect(inter).toEqual({ x1: 2, y1: 2, x2: 4, y2: 4 })
  })

  it('returns null for non-overlapping intersection', () => {
    const r1 = { x1: 0, y1: 0, x2: 2, y2: 2 }
    const r2 = { x1: 3, y1: 3, x2: 5, y2: 5 }
    expect(RectArea.intersection(r1, r2)).toBeNull()
  })

  it('handles empty rects', () => {
    expect(RectArea.unionArea([])).toBe(0)
  })

  it('handles zero-area rect', () => {
    expect(RectArea.area({ x1: 2, y1: 2, x2: 2, y2: 5 })).toBe(0)
  })

  it('union of identical rects equals one rect', () => {
    const r = { x1: 0, y1: 0, x2: 3, y2: 3 }
    expect(RectArea.unionArea([r, r])).toBe(9)
  })

  it('union of three rects with partial overlap', () => {
    const rects = [
      { x1: 0, y1: 0, x2: 4, y2: 4 },
      { x1: 1, y1: 1, x2: 5, y2: 5 },
      { x1: 2, y1: 2, x2: 6, y2: 6 },
    ]
    expect(RectArea.unionArea(rects)).toBe(30)
  })

  it('handles negative coordinates', () => {
    expect(RectArea.area({ x1: -3, y1: -2, x2: 1, y2: 3 })).toBe(20)
  })

  it('intersection of touching rects returns null', () => {
    const r1 = { x1: 0, y1: 0, x2: 2, y2: 2 }
    const r2 = { x1: 2, y1: 0, x2: 4, y2: 2 }
    expect(RectArea.intersection(r1, r2)).toBeNull()
  })

  it('union of single rect equals its area', () => {
    const r = { x1: 1, y1: 1, x2: 4, y2: 5 }
    expect(RectArea.unionArea([r])).toBe(12)
  })

  it('handles zero area rect', () => {
    const r = { x1: 1, y1: 1, x2: 1, y2: 1 }
    expect(RectArea.area(r)).toBe(0)
  })

  it('intersection of overlapping rects', () => {
    const r1 = { x1: 0, y1: 0, x2: 4, y2: 4 }
    const r2 = { x1: 2, y1: 2, x2: 6, y2: 6 }
    const inter = RectArea.intersection(r1, r2)
    expect(inter).not.toBeNull()
    expect(RectArea.area(inter!)).toBe(4)
  })

  it('union of disjoint rects sums areas', () => {
    const r1 = { x1: 0, y1: 0, x2: 2, y2: 2 }
    const r2 = { x1: 5, y1: 5, x2: 7, y2: 7 }
    expect(RectArea.unionArea([r1, r2])).toBe(8)
  })

  it('area of unit rect is 1', () => {
    expect(RectArea.area({ x1: 0, y1: 0, x2: 1, y2: 1 })).toBe(1)
  })

  it('area of zero-size rect is 0', () => {
    expect(RectArea.area({ x1: 3, y1: 3, x2: 3, y2: 3 })).toBe(0)
  })

  it('area of 2x3 rect is 6', () => {
    expect(RectArea.area({ x1: 0, y1: 0, x2: 2, y2: 3 })).toBe(6)
  })

  it('area of unit square is 1', () => {
    expect(RectArea.area({ x1: 0, y1: 0, x2: 1, y2: 1 })).toBe(1)
  })

  it('area of 2x3 rect is 6', () => {
    expect(RectArea.area({ x1: 0, y1: 0, x2: 2, y2: 3 })).toBe(6)
  })

  it('area of unit square is 1', () => {
    expect(RectArea.area({ x1: 0, y1: 0, x2: 1, y2: 1 })).toBe(1)
  })

  it('area of 2x3 rectangle is 6', () => {
    expect(RectArea.area({ x1: 0, y1: 0, x2: 2, y2: 3 })).toBe(6)
  })
})
