import { describe, expect, it } from 'vitest'
import { Welford } from '../../src/utils/welford.js'

describe('Welford', () => {
  it('computes mean of single value', () => {
    const w = new Welford()
    w.update(5)
    expect(w.meanValue).toBe(5)
    expect(w.n).toBe(1)
  })

  it('computes mean of multiple values', () => {
    const w = new Welford()
    w.update(2)
    w.update(4)
    w.update(6)
    expect(w.meanValue).toBe(4)
  })

  it('computes variance', () => {
    const w = Welford.fromArray([2, 4, 4, 4, 5, 5, 7, 9])
    expect(w.meanValue).toBe(5)
    expect(w.variance).toBeCloseTo(4, 5)
  })

  it('computes sample variance', () => {
    const w = Welford.fromArray([2, 4, 4, 4, 5, 5, 7, 9])
    expect(w.sampleVariance).toBeCloseTo(4.571, 2)
  })

  it('computes std deviation', () => {
    const w = Welford.fromArray([2, 4, 4, 4, 5, 5, 7, 9])
    expect(w.stdDev).toBeCloseTo(2, 5)
  })

  it('returns 0 variance for single element', () => {
    const w = new Welford()
    w.update(42)
    expect(w.variance).toBe(0)
    expect(w.sampleVariance).toBe(0)
  })

  it('isEmpty reflects state', () => {
    const w = new Welford()
    expect(w.isEmpty).toBe(true)
    w.update(1)
    expect(w.isEmpty).toBe(false)
  })

  it('meanValue returns 0 for empty', () => {
    const w = new Welford()
    expect(w.meanValue).toBe(0)
  })

  it('addBatch processes iterable', () => {
    const w = new Welford()
    w.addBatch([1, 2, 3, 4, 5])
    expect(w.meanValue).toBe(3)
    expect(w.n).toBe(5)
  })

  it('merge combines two statistics', () => {
    const w1 = Welford.fromArray([1, 2, 3])
    const w2 = Welford.fromArray([4, 5, 6])
    w1.merge(w2)
    expect(w1.meanValue).toBe(3.5)
    expect(w1.n).toBe(6)
  })

  it('merge with empty does nothing', () => {
    const w1 = Welford.fromArray([1, 2, 3])
    const w2 = new Welford()
    w1.merge(w2)
    expect(w1.meanValue).toBe(2)
    expect(w1.n).toBe(3)
  })

  it('reset clears all state', () => {
    const w = Welford.fromArray([1, 2, 3])
    w.reset()
    expect(w.n).toBe(0)
    expect(w.isEmpty).toBe(true)
    expect(w.meanValue).toBe(0)
  })

  it('handles negative values', () => {
    const w = Welford.fromArray([-3, -1, 1, 3])
    expect(w.meanValue).toBe(0)
  })

  it('handles large numbers', () => {
    const w = new Welford()
    for (let i = 0; i < 10000; i++) w.update(i)
    expect(w.meanValue).toBeCloseTo(4999.5, 1)
    expect(w.n).toBe(10000)
  })

  it('fromArray creates from static', () => {
    const w = Welford.fromArray([10, 20, 30])
    expect(w.meanValue).toBe(20)
    expect(w.n).toBe(3)
  })

  it('variance is 0 for identical values', () => {
    const w = Welford.fromArray([5, 5, 5, 5])
    expect(w.variance).toBe(0)
  })
})
