import { describe, expect, it } from 'vitest'
import { TernarySearch } from '../../src/utils/ternary-search.js'

describe('TernarySearch', () => {
  it('finds maximum of -x^2', () => {
    const x = TernarySearch.findMax((x) => -(x * x), -10, 10)
    expect(x).toBeCloseTo(0, 3)
  })

  it('finds minimum of x^2', () => {
    const x = TernarySearch.findMin((x) => x * x, -10, 10)
    expect(x).toBeCloseTo(0, 3)
  })

  it('finds maximum of -(x-3)^2', () => {
    const x = TernarySearch.findMax((x) => -(x - 3) * (x - 3), 0, 10)
    expect(x).toBeCloseTo(3, 3)
  })

  it('finds minimum of (x+2)^2', () => {
    const x = TernarySearch.findMin((x) => (x + 2) * (x + 2), -10, 10)
    expect(x).toBeCloseTo(-2, 3)
  })

  it('finds maximum of -|x-5|', () => {
    const x = TernarySearch.findMax((x) => -Math.abs(x - 5), 0, 10)
    expect(x).toBeCloseTo(5, 2)
  })

  it('findMaxInteger works', () => {
    const result = TernarySearch.findMaxInteger((x) => -(x - 5) * (x - 5), 0, 10)
    expect(result.index).toBe(5)
    expect(result.value).toBeCloseTo(0)
  })

  it('findMinInteger works', () => {
    const result = TernarySearch.findMinInteger((x) => (x - 3) * (x - 3), 0, 10)
    expect(result.index).toBe(3)
    expect(result.value).toBe(0)
  })

  it('findMaxInteger with narrow range', () => {
    const result = TernarySearch.findMaxInteger((x) => x, 0, 5)
    expect(result.index).toBe(5)
  })

  it('findMinInteger with narrow range', () => {
    const result = TernarySearch.findMinInteger((x) => x, 3, 7)
    expect(result.index).toBe(3)
  })

  it('handles negative quadratic', () => {
    const x = TernarySearch.findMax((x) => -x * x + 4 * x - 3, -10, 10)
    expect(x).toBeCloseTo(2, 3)
  })

  it('respects bounds', () => {
    const x = TernarySearch.findMax((x) => x, 0, 100)
    expect(x).toBeGreaterThan(99)
  })

  it('custom iterations', () => {
    const x = TernarySearch.findMax((x) => -(x * x), -10, 10, 50)
    expect(x).toBeCloseTo(0, 2)
  })

  it('findMin of shifted parabola', () => {
    const x = TernarySearch.findMin((x) => (x - 7) * (x - 7), 0, 15)
    expect(x).toBeCloseTo(7, 3)
  })

  it('findMax of cosine near 0', () => {
    const x = TernarySearch.findMax((x) => Math.cos(x), -3, 3)
    expect(x).toBeCloseTo(0, 2)
  })

  it('findMinInteger handles equal endpoints', () => {
    const result = TernarySearch.findMinInteger((x) => x * x, 3, 3)
    expect(result.index).toBe(3)
  })

  it('findMinInteger finds minimum', () => {
    const result = TernarySearch.findMinInteger((x) => Math.abs(x - 5), 0, 10)
    expect(result.index).toBe(5)
  })
})
