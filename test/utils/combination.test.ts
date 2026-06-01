import { describe, expect, it } from 'vitest'
import { Combination } from '../../src/utils/combination.js'

describe('Combination', () => {
  it('generates combinations of 3 choose 2', () => {
    expect(Combination.generate([1, 2, 3], 2)).toEqual([[1, 2], [1, 3], [2, 3]])
  })

  it('generates combinations of 4 choose 3', () => {
    expect(Combination.generate([1, 2, 3, 4], 3)).toEqual([
      [1, 2, 3], [1, 2, 4], [1, 3, 4], [2, 3, 4],
    ])
  })

  it('handles k=0', () => {
    expect(Combination.generate([1, 2, 3], 0)).toEqual([[]])
  })

  it('handles k > n', () => {
    expect(Combination.generate([1, 2], 3)).toEqual([])
  })

  it('handles k = n', () => {
    expect(Combination.generate([1, 2, 3], 3)).toEqual([[1, 2, 3]])
  })

  it('handles empty array', () => {
    expect(Combination.generate([], 0)).toEqual([[]])
    expect(Combination.generate([], 1)).toEqual([])
  })

  it('count returns binomial coefficient', () => {
    expect(Combination.count(5, 2)).toBe(10)
    expect(Combination.count(4, 0)).toBe(1)
    expect(Combination.count(4, 4)).toBe(1)
    expect(Combination.count(10, 3)).toBe(120)
  })

  it('count handles edge cases', () => {
    expect(Combination.count(5, -1)).toBe(0)
    expect(Combination.count(5, 6)).toBe(0)
  })

  it('lazy generates same results as eager', () => {
    const eager = Combination.generate([1, 2, 3, 4], 2)
    const lazy = [...Combination.lazy([1, 2, 3, 4], 2)]
    expect(lazy).toEqual(eager)
  })

  it('withReplacement generates combinations with repetition', () => {
    const result = Combination.withReplacement([1, 2], 2)
    expect(result).toEqual([[1, 1], [1, 2], [2, 1], [2, 2]])
  })

  it('withReplacement k=0', () => {
    expect(Combination.withReplacement([1, 2], 0)).toEqual([[]])
  })

  it('countWithReplacement returns correct count', () => {
    expect(Combination.countWithReplacement(3, 2)).toBe(6)
  })

  it('generates correct count of combinations', () => {
    const result = Combination.generate([1, 2, 3, 4, 5], 3)
    expect(result.length).toBe(Combination.count(5, 3))
  })

  it('all combinations are unique', () => {
    const result = Combination.generate([1, 2, 3, 4], 2)
    const strings = result.map(c => c.join(','))
    expect(new Set(strings).size).toBe(result.length)
  })

  it('with strings', () => {
    expect(Combination.generate(['a', 'b', 'c'], 2)).toEqual([['a', 'b'], ['a', 'c'], ['b', 'c']])
  })

  it('handles choose 1', () => {
    expect(Combination.generate([1, 2, 3], 1)).toEqual([[1], [2], [3]])
  })

  it('choose 0 returns empty combination', () => {
    expect(Combination.generate([1, 2, 3], 0)).toEqual([[]])
  })
})
