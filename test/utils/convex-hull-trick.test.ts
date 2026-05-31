import { describe, expect, it } from 'vitest'
import { ConvexHullTrick } from '../../src/utils/convex-hull-trick.js'

describe('ConvexHullTrick', () => {
  it('queries single line', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(2, 3)
    expect(cht.query(5)).toBe(13)
  })

  it('picks minimum of multiple lines', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 0)
    cht.addLine(0, 10)
    cht.addLine(-1, 20)
    expect(cht.query(0)).toBe(0)
    expect(cht.query(15)).toBe(5)
  })

  it('handles maximum mode', () => {
    const cht = new ConvexHullTrick(false)
    cht.addLine(-1, 20)
    cht.addLine(0, 10)
    cht.addLine(1, 0)
    expect(cht.query(0)).toBe(20)
    expect(cht.query(20)).toBe(20)
  })

  it('returns Infinity for empty min', () => {
    const cht = new ConvexHullTrick()
    expect(cht.query(0)).toBe(Infinity)
  })

  it('returns -Infinity for empty max', () => {
    const cht = new ConvexHullTrick(false)
    expect(cht.query(0)).toBe(-Infinity)
  })

  it('lineCount tracks added lines', () => {
    const cht = new ConvexHullTrick()
    expect(cht.lineCount).toBe(0)
    cht.addLine(1, 0)
    expect(cht.lineCount).toBe(1)
    cht.addLine(2, 1)
    expect(cht.lineCount).toBeGreaterThanOrEqual(1)
  })

  it('handles parallel lines', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 5)
    cht.addLine(1, 3)
    expect(cht.query(0)).toBe(3)
  })

  it('handles negative slope', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(-2, 10)
    expect(cht.query(3)).toBe(4)
  })

  it('solves DP optimization example', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(0, 0)
    cht.addLine(-2, 10)
    cht.addLine(-4, 20)
    expect(cht.query(0)).toBe(0)
    expect(cht.query(5)).toBe(0)
  })

  it('handles many lines in order', () => {
    const cht = new ConvexHullTrick()
    for (let i = 0; i < 20; i++) cht.addLine(i, 0)
    expect(cht.query(0)).toBe(0)
  })

  it('single line at negative x', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, -5)
    expect(cht.query(-10)).toBe(-15)
  })
})
