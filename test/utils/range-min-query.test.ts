import { describe, expect, it } from 'vitest'
import { RangeMinQuery } from '../../src/utils/range-min-query.js'

describe('RangeMinQuery', () => {
  it('queries single element', () => {
    const rmq = new RangeMinQuery([5, 3, 7, 1, 4])
    expect(rmq.query(0, 0)).toBe(5)
    expect(rmq.query(3, 3)).toBe(1)
  })

  it('queries full range', () => {
    const rmq = new RangeMinQuery([5, 3, 7, 1, 4])
    expect(rmq.query(0, 4)).toBe(1)
  })

  it('queries partial range', () => {
    const rmq = new RangeMinQuery([5, 3, 7, 1, 4])
    expect(rmq.query(0, 2)).toBe(3)
    expect(rmq.query(2, 4)).toBe(1)
  })

  it('handles single element array', () => {
    const rmq = new RangeMinQuery([42])
    expect(rmq.query(0, 0)).toBe(42)
  })

  it('handles two elements', () => {
    const rmq = new RangeMinQuery([10, 5])
    expect(rmq.query(0, 1)).toBe(5)
    expect(rmq.query(0, 0)).toBe(10)
    expect(rmq.query(1, 1)).toBe(5)
  })

  it('handles negative numbers', () => {
    const rmq = new RangeMinQuery([-3, -1, -7, -2])
    expect(rmq.query(0, 3)).toBe(-7)
    expect(rmq.query(0, 1)).toBe(-3)
  })

  it('handles large array', () => {
    const arr = Array.from({ length: 100 }, (_, i) => 100 - i)
    const rmq = new RangeMinQuery(arr)
    expect(rmq.query(0, 99)).toBe(1)
    expect(rmq.query(0, 0)).toBe(100)
    expect(rmq.query(50, 99)).toBe(1)
  })

  it('handles repeated values', () => {
    const rmq = new RangeMinQuery([3, 3, 3, 3])
    expect(rmq.query(0, 3)).toBe(3)
  })

  it('handles all same except one', () => {
    const rmq = new RangeMinQuery([5, 5, 1, 5, 5])
    expect(rmq.query(0, 4)).toBe(1)
    expect(rmq.query(0, 1)).toBe(5)
  })

  it('handles power of two length', () => {
    const rmq = new RangeMinQuery([8, 6, 4, 2])
    expect(rmq.query(0, 3)).toBe(2)
    expect(rmq.query(1, 2)).toBe(4)
  })

  it('handles duplicate minimums', () => {
    const rmq = new RangeMinQuery([3, 1, 4, 1, 5])
    expect(rmq.query(0, 4)).toBe(1)
    expect(rmq.query(2, 4)).toBe(1)
  })

  it('handles two elements', () => {
    const rmq = new RangeMinQuery([7, 3])
    expect(rmq.query(0, 1)).toBe(3)
    expect(rmq.query(0, 0)).toBe(7)
  })

  it('handles single element', () => {
    const rmq = new RangeMinQuery([42])
    expect(rmq.query(0, 0)).toBe(42)
  })

  it('handles sorted ascending', () => {
    const rmq = new RangeMinQuery([1, 2, 3, 4, 5])
    expect(rmq.query(0, 4)).toBe(1)
    expect(rmq.query(3, 4)).toBe(4)
  })

  it('handles sorted descending', () => {
    const rmq = new RangeMinQuery([5, 4, 3, 2, 1])
    expect(rmq.query(0, 4)).toBe(1)
    expect(rmq.query(0, 2)).toBe(3)
  })

  it('handles all equal elements', () => {
    const rmq = new RangeMinQuery([7, 7, 7, 7])
    expect(rmq.query(0, 3)).toBe(7)
    expect(rmq.query(1, 2)).toBe(7)
  })

  it('handles single element array', () => {
    const rmq = new RangeMinQuery([42])
    expect(rmq.query(0, 0)).toBe(42)
  })

  it('query full range finds minimum', () => {
    const rmq = new RangeMinQuery([5, 3, 7, 1, 4])
    expect(rmq.query(0, 4)).toBe(1)
  })

  it('query single element', () => {
    const rmq = new RangeMinQuery([42])
    expect(rmq.query(0, 0)).toBe(42)
  })
})
