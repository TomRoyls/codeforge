import { describe, expect, it } from 'vitest'
import { PermutationIterator } from '../../src/utils/permutation-iterator.js'

describe('PermutationIterator', () => {
  it('generates all permutations of 3 elements', () => {
    const result = PermutationIterator.all([1, 2, 3])
    expect(result).toEqual([
      [1, 2, 3], [1, 3, 2], [2, 1, 3],
      [2, 3, 1], [3, 1, 2], [3, 2, 1],
    ])
  })

  it('handles single element', () => {
    expect(PermutationIterator.all([42])).toEqual([[42]])
  })

  it('handles empty array', () => {
    expect(PermutationIterator.all([])).toEqual([])
  })

  it('count returns factorial', () => {
    expect(PermutationIterator.count(0)).toBe(1)
    expect(PermutationIterator.count(1)).toBe(1)
    expect(PermutationIterator.count(3)).toBe(6)
    expect(PermutationIterator.count(5)).toBe(120)
  })

  it('generates correct number of permutations', () => {
    const result = PermutationIterator.all(['a', 'b', 'c', 'd'])
    expect(result.length).toBe(24)
  })

  it('all permutations are unique', () => {
    const result = PermutationIterator.all([1, 2, 3, 4])
    const strings = result.map(p => p.join(','))
    expect(new Set(strings).size).toBe(result.length)
  })

  it('nth returns kth permutation', () => {
    expect(PermutationIterator.nth([1, 2, 3], 0)).toEqual([1, 2, 3])
    expect(PermutationIterator.nth([1, 2, 3], 5)).toEqual([3, 2, 1])
  })

  it('nth with strings', () => {
    expect(PermutationIterator.nth(['a', 'b', 'c'], 3)).toEqual(['b', 'c', 'a'])
  })

  it('works with for-of loop', () => {
    let count = 0
    for (const _perm of new PermutationIterator(3)) {
      count++
    }
    expect(count).toBe(6)
  })

  it('handles 2 elements', () => {
    expect(PermutationIterator.all([1, 2])).toEqual([[1, 2], [2, 1]])
  })

  it('preserves element types', () => {
    const result = PermutationIterator.all(['x', 'y'])
    expect(result).toEqual([['x', 'y'], ['y', 'x']])
  })

  it('nth covers all permutations', () => {
    const all = PermutationIterator.all([1, 2, 3])
    for (let k = 0; k < 6; k++) {
      expect(PermutationIterator.nth([1, 2, 3], k)).toEqual(all[k])
    }
  })

  it('handles duplicate elements (treats as distinct positions)', () => {
    const result = PermutationIterator.all([1, 1, 2])
    expect(result.length).toBe(6)
  })

  it('nth returns first permutation for k=0', () => {
    expect(PermutationIterator.nth(['a', 'b', 'c'], 0)).toEqual(['a', 'b', 'c'])
  })

  it('all permutations in lexicographic order', () => {
    const result = PermutationIterator.all([1, 2, 3, 4])
    for (let i = 1; i < result.length; i++) {
      const prev = result[i - 1]!.join(',')
      const curr = result[i]!.join(',')
      expect(curr > prev).toBe(true)
    }
  })

  it('handles duplicate elements', () => {
    const result = PermutationIterator.all([1, 1])
    expect(result.length).toBe(2)
  })

  it('handles single element', () => {
    const result = PermutationIterator.all([42])
    expect(result.length).toBe(1)
    expect(result[0]).toEqual([42])
  })

  it('all for two elements gives 2 permutations', () => {
    const result = PermutationIterator.all([1, 2])
    expect(result.length).toBe(2)
  })

  it('all for single element gives 1 permutation', () => {
    const result = PermutationIterator.all([42])
    expect(result.length).toBe(1)
    expect(result[0]).toEqual([42])
  })

  it('two elements have 2 permutations', () => {
    const result = PermutationIterator.all([1, 2])
    expect(result.length).toBe(2)
  })

  it('single element has 1 permutation', () => {
    const result = PermutationIterator.all([42])
    expect(result).toEqual([[42]])
  })

  it('two elements have 2 permutations', () => {
    const result = PermutationIterator.all([1, 2])
    expect(result.length).toBe(2)
  })
})
