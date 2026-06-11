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

  it('count(4) is 24', () => {
    expect(PermutationIterator.count(4)).toBe(24)
  })

  it('count(6) is 720', () => {
    expect(PermutationIterator.count(6)).toBe(720)
  })

  it('generates correct number of permutations for 4 elements', () => {
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

  it('handles duplicate elements treats as distinct', () => {
    const result = PermutationIterator.all([1, 1, 2])
    expect(result.length).toBe(6)
  })

  it('nth first permutation is identity', () => {
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

  it('iterator yields arrays of indices', () => {
    const iter = new PermutationIterator(2)
    const results: number[][] = []
    for (const p of iter) results.push(p)
    expect(results).toEqual([[0, 1], [1, 0]])
  })

  it('nth last permutation is reverse sorted', () => {
    expect(PermutationIterator.nth([1, 2, 3, 4], 23)).toEqual([4, 3, 2, 1])
  })

  it('iterator for n=1 yields single permutation', () => {
    const iter = new PermutationIterator(1)
    const results: number[][] = []
    for (const p of iter) results.push(p)
    expect(results).toEqual([[0]])
  })

  it('nth with 4 elements at index 0', () => {
    expect(PermutationIterator.nth([1, 2, 3, 4], 0)).toEqual([1, 2, 3, 4])
  })

  it('nth with 4 elements at mid index', () => {
    const result = PermutationIterator.nth([1, 2, 3, 4], 12)
    expect(result.length).toBe(4)
    expect(new Set(result).size).toBe(4)
  })

  it('all returns arrays of correct length', () => {
    const result = PermutationIterator.all([1, 2, 3])
    for (const p of result) {
      expect(p.length).toBe(3)
    }
  })

  it('each permutation contains all original elements', () => {
    const original = [1, 2, 3, 4]
    const result = PermutationIterator.all(original)
    for (const p of result) {
      expect([...p].sort()).toEqual([...original].sort())
    }
  })

  it('works with boolean elements', () => {
    const result = PermutationIterator.all([true, false])
    expect(result.length).toBe(2)
  })

  it('works with object elements', () => {
    const a = { x: 1 }
    const b = { x: 2 }
    const result = PermutationIterator.all([a, b])
    expect(result.length).toBe(2)
    expect(result[0]).toEqual([a, b])
    expect(result[1]).toEqual([b, a])
  })

  it('count(7) is 5040', () => {
    expect(PermutationIterator.count(7)).toBe(5040)
  })

  it('nth with 2 elements covers both', () => {
    expect(PermutationIterator.nth([1, 2], 0)).toEqual([1, 2])
    expect(PermutationIterator.nth([1, 2], 1)).toEqual([2, 1])
  })

  it('nth returns new array each time', () => {
    const a = PermutationIterator.nth([1, 2, 3], 0)
    const b = PermutationIterator.nth([1, 2, 3], 0)
    expect(a).toEqual(b)
    a[0] = 99
    expect(b[0]).toBe(1)
  })

  it('all returns new arrays', () => {
    const result = PermutationIterator.all([1, 2])
    result[0]![0] = 99
    const fresh = PermutationIterator.all([1, 2])
    expect(fresh[0]![0]).toBe(1)
  })

  it('iterator for n=0 yields nothing', () => {
    const iter = new PermutationIterator(0)
    const results: number[][] = []
    for (const p of iter) results.push(p)
    expect(results).toEqual([])
  })

  it('all with strings produces correct elements', () => {
    const result = PermutationIterator.all(['a', 'b', 'c'])
    expect(result.length).toBe(6)
    for (const p of result) {
      expect(p.sort()).toEqual(['a', 'b', 'c'])
    }
  })

  it('nth with 5 elements', () => {
    const result = PermutationIterator.nth([1, 2, 3, 4, 5], 0)
    expect(result).toEqual([1, 2, 3, 4, 5])
  })

  it('nth with 5 elements last', () => {
    const result = PermutationIterator.nth([1, 2, 3, 4, 5], 119)
    expect(result).toEqual([5, 4, 3, 2, 1])
  })

  it('count matches all length', () => {
    const n = 4
    expect(PermutationIterator.all(Array.from({ length: n }, (_, i) => i)).length)
      .toBe(PermutationIterator.count(n))
  })

  it('duplicates produce factorial count', () => {
    const result = PermutationIterator.all([1, 1])
    expect(result.length).toBe(2)
  })

  it('3 duplicates produce 6', () => {
    const result = PermutationIterator.all([1, 1, 1])
    expect(result.length).toBe(6)
  })
})
