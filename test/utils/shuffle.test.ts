import { describe, expect, it } from 'vitest'
import { Shuffle } from '../../src/utils/shuffle.js'

describe('Shuffle', () => {
  it('fisherYates returns same elements', () => {
    const arr = [1, 2, 3, 4, 5]
    const shuffled = Shuffle.fisherYates(arr)
    expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5])
  })

  it('fisherYates does not modify original', () => {
    const arr = [1, 2, 3]
    Shuffle.fisherYates(arr)
    expect(arr).toEqual([1, 2, 3])
  })

  it('fisherYates returns new array', () => {
    const arr = [1, 2, 3]
    const shuffled = Shuffle.fisherYates(arr)
    expect(shuffled).not.toBe(arr)
  })

  it('inPlace modifies original', () => {
    const arr = [1, 2, 3, 4, 5]
    const result = Shuffle.inPlace(arr)
    expect(result).toBe(arr)
    expect(arr.sort()).toEqual([1, 2, 3, 4, 5])
  })

  it('handles empty array', () => {
    expect(Shuffle.fisherYates([])).toEqual([])
  })

  it('handles single element', () => {
    expect(Shuffle.fisherYates([42])).toEqual([42])
  })

  it('isShuffled detects valid shuffle', () => {
    expect(Shuffle.isShuffled([1, 2, 3], [3, 1, 2])).toBe(true)
  })

  it('isShuffled detects invalid length', () => {
    expect(Shuffle.isShuffled([1, 2], [1, 2, 3])).toBe(false)
  })

  it('isShuffled detects different elements', () => {
    expect(Shuffle.isShuffled([1, 2, 3], [1, 2, 4])).toBe(false)
  })

  it('isShuffled handles duplicates', () => {
    expect(Shuffle.isShuffled([1, 1, 2], [2, 1, 1])).toBe(true)
  })

  it('weightedSample returns correct count', () => {
    const items = ['a', 'b', 'c', 'd']
    const weights = [1, 1, 1, 1]
    const sample = Shuffle.weightedSample(items, weights, 2)
    expect(sample.length).toBe(2)
    expect(items).toContain(sample[0])
    expect(items).toContain(sample[1])
  })

  it('weightedSample no duplicates', () => {
    const items = ['a', 'b', 'c']
    const weights = [1, 1, 1]
    const sample = Shuffle.weightedSample(items, weights, 3)
    expect(sample.sort()).toEqual(['a', 'b', 'c'])
  })

  it('weightedSample throws for excessive count', () => {
    expect(() => Shuffle.weightedSample([1], [1], 2)).toThrow(RangeError)
  })

  it('fisherYates preserves elements after many shuffles', () => {
    const arr = [1, 2, 3, 4, 5]
    for (let i = 0; i < 10; i++) {
      const shuffled = Shuffle.fisherYates(arr)
      expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5])
    }
  })

  it('isShuffled handles empty arrays', () => {
    expect(Shuffle.isShuffled([], [])).toBe(true)
  })

  it('isShuffled handles single element', () => {
    expect(Shuffle.isShuffled([1], [1])).toBe(true)
  })

  it('shuffle returns same length', () => {
    const arr = [1, 2, 3, 4, 5]
    const shuffled = Shuffle.fisherYates([...arr])
    expect(shuffled.length).toBe(5)
    expect([...shuffled].sort()).toEqual([1, 2, 3, 4, 5])
  })
})
