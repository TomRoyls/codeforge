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

  it('handles increasing slopes', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 0)
    cht.addLine(3, 0)
    cht.addLine(5, 0)
    expect(cht.query(1)).toBe(1)
    expect(cht.query(5)).toBe(5)
  })

  it('handles intersecting lines', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(0, 10)
    cht.addLine(1, 0)
    expect(cht.query(0)).toBe(0)
    expect(cht.query(20)).toBe(10)
  })

  it('handles zero slope', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(0, 5)
    expect(cht.query(0)).toBe(5)
    expect(cht.query(100)).toBe(5)
  })

  it('handles decreasing slopes min', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(5, 0)
    cht.addLine(3, 0)
    cht.addLine(1, 0)
    expect(cht.query(0)).toBe(0)
    expect(cht.query(100)).toBe(100)
  })



  it('handles two parallel lines different intercepts', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 5)
    cht.addLine(1, 10)
    expect(cht.query(0)).toBe(5)
  })

  it('shallower line wins at large x for min query', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 0)
    cht.addLine(2, 0)
    expect(cht.query(10)).toBe(10)
  })

  it('single line query', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(2, 3)
    expect(cht.query(0)).toBe(3)
    expect(cht.query(5)).toBe(13)
  })

  it('single line query', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 0)
    expect(cht.query(5)).toBe(5)
  })

  it('two lines minimum', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 0)
    cht.addLine(2, 0)
    expect(cht.query(0)).toBe(0)
  })

  it('query at x=1 returns min y', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 0)
    cht.addLine(0, 5)
    expect(cht.query(1)).toBe(1)
  })

  it('query at 0 returns intercept', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(2, 5)
    expect(cht.query(0)).toBe(5)
  })

  it('query at different x', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 0)
    cht.addLine(0, 10)
    expect(cht.query(5)).toBe(5)
  })

  it('handles identical lines', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 5)
    cht.addLine(1, 5)
    expect(cht.query(0)).toBe(5)
  })

  it('handles steep positive slope', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(10, 0)
    cht.addLine(1, 100)
    expect(cht.query(0)).toBe(0)
    expect(cht.query(20)).toBe(120)
  })

  it('handles steep negative slope', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(-10, 100)
    cht.addLine(-1, 0)
    expect(cht.query(0)).toBe(0)
    expect(cht.query(5)).toBe(-5)
  })

  it('handles large x values', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 0)
    cht.addLine(0, 1000)
    expect(cht.query(1000000)).toBe(1000)
  })

  it('handles lines with same slope decreasing order', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(2, 10)
    cht.addLine(2, 5)
    cht.addLine(2, 0)
    expect(cht.query(0)).toBe(0)
    expect(cht.query(10)).toBe(20)
  })

  it('handles lines crossing at x=0', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, -5)
    cht.addLine(-1, 5)
    expect(cht.query(0)).toBe(-5)
  })

  it('handles negative x values', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 0)
    cht.addLine(-1, 10)
    expect(cht.query(-5)).toBe(-5)
  })

  it('handles fractional slopes', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(0.5, 0)
    cht.addLine(0.3, 1)
    expect(cht.query(0)).toBe(0)
    expect(cht.query(10)).toBe(4)
  })

  it('handles fractional intercepts', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 0.5)
    cht.addLine(0, 0.7)
    expect(cht.query(0)).toBe(0.5)
  })

  it('maximum mode picks steeper positive slope', () => {
    const cht = new ConvexHullTrick(false)
    cht.addLine(1, 0)
    cht.addLine(2, 0)
    expect(cht.query(10)).toBe(20)
  })

  it('maximum mode with decreasing slopes', () => {
    const cht = new ConvexHullTrick(false)
    cht.addLine(5, 0)
    cht.addLine(3, 0)
    cht.addLine(1, 0)
    expect(cht.query(0)).toBe(0)
    expect(cht.query(10)).toBe(50)
  })

  it('handles very large slope', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1000, -999900)
    cht.addLine(0, 100)
    expect(cht.query(100)).toBe(-899900)
  })

  it('handles lines with negative intercept', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, -10)
    cht.addLine(0, 0)
    expect(cht.query(0)).toBe(-10)
    expect(cht.query(20)).toBe(0)
  })

  it('handles three lines with increasing slopes', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 10)
    cht.addLine(2, 5)
    cht.addLine(3, 0)
    expect(cht.query(0)).toBe(0)
    expect(cht.query(5)).toBe(15)
  })

  it('handles three lines with decreasing slopes', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(3, 0)
    cht.addLine(2, 5)
    cht.addLine(1, 10)
    expect(cht.query(0)).toBe(0)
    expect(cht.query(10)).toBe(20)
  })

  it('handles x=0 query after adding many lines', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 0)
    cht.addLine(2, 1)
    cht.addLine(3, 2)
    cht.addLine(4, 3)
    expect(cht.query(0)).toBe(0)
  })

  it('handles large number of lines', () => {
    const cht = new ConvexHullTrick()
    for (let i = 0; i < 50; i++) {
      cht.addLine(i, 0)
    }
    expect(cht.query(0)).toBe(0)
    expect(cht.lineCount).toBeGreaterThan(0)
  })

  it('handles lines removed by bad check', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(0, 5)
    cht.addLine(1, 4)
    cht.addLine(2, 3)
    cht.addLine(3, 2)
    cht.addLine(4, 1)
    expect(cht.lineCount).toBeLessThan(5)
    expect(cht.query(0)).toBe(1)
  })

  it('maximum mode with intersecting lines', () => {
    const cht = new ConvexHullTrick(false)
    cht.addLine(0, 10)
    cht.addLine(1, 0)
    expect(cht.query(0)).toBe(10)
    expect(cht.query(20)).toBe(20)
  })

  it('handles zero slope lines', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(0, 10)
    cht.addLine(0, 5)
    cht.addLine(0, 15)
    expect(cht.query(0)).toBe(10)
    expect(cht.query(100)).toBe(10)
  })

  it('handles negative slopes in increasing order', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(-5, 100)
    cht.addLine(-3, 50)
    cht.addLine(-1, 0)
    expect(cht.query(0)).toBe(0)
    expect(cht.query(10)).toBe(-10)
  })

  it('handles very small x values', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 0)
    cht.addLine(0, 1)
    expect(cht.query(0.001)).toBeCloseTo(0.001, 5)
  })

  it('handles mixed positive and negative slopes', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(-2, 10)
    cht.addLine(1, 0)
    cht.addLine(3, -5)
    expect(cht.query(0)).toBe(-5)
    expect(cht.query(5)).toBe(0)
  })

  it('maximum mode with negative slopes', () => {
    const cht = new ConvexHullTrick(false)
    cht.addLine(-2, 10)
    cht.addLine(-1, 5)
    expect(cht.query(0)).toBe(10)
    expect(cht.query(10)).toBe(-5)
  })

  it('handles lines with large intercepts', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(0, 1000000)
    cht.addLine(1, 0)
    expect(cht.query(500000)).toBe(500000)
  })

  it('handles duplicate lines with same slope and intercept', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(2, 3)
    cht.addLine(2, 3)
    cht.addLine(2, 3)
    expect(cht.query(5)).toBe(13)
  })

  it('handles lines with very small slopes', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(0.001, 0)
    cht.addLine(0, 1)
    expect(cht.query(1000)).toBe(1)
  })

  it('handles equal slope different intercept min mode', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 5)
    cht.addLine(1, 3)
    cht.addLine(1, 7)
    expect(cht.query(0)).toBe(5)
    expect(cht.query(10)).toBe(15)
  })
})
