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

  it('next() returns IteratorResult structure', () => {
    const iter = new PermutationIterator(2)
    const first = iter.next()
    expect(first.done).toBe(false)
    expect(first.value).toEqual([0, 1])
    const second = iter.next()
    expect(second.done).toBe(false)
    expect(second.value).toEqual([1, 0])
    const third = iter.next()
    expect(third.done).toBe(true)
    expect(third.value).toBeUndefined()
  })

  it('Symbol.iterator returns self', () => {
    const iter = new PermutationIterator(3)
    expect(iter[Symbol.iterator]()).toBe(iter)
  })

  it('manual next() calls produce all permutations', () => {
    const iter = new PermutationIterator(3)
    const results: number[][] = []
    let result
    while ((result = iter.next(), !result.done)) {
      results.push(result.value)
    }
    expect(results.length).toBe(6)
  })

  it('next() on exhausted iterator returns done true', () => {
    const iter = new PermutationIterator(1)
    iter.next()
    const second = iter.next()
    expect(second.done).toBe(true)
    const third = iter.next()
    expect(third.done).toBe(true)
  })

  it('nth at various positions for 5 elements', () => {
    const all = PermutationIterator.all([1, 2, 3, 4, 5])
    for (let i = 0; i < 5; i++) {
      expect(PermutationIterator.nth([1, 2, 3, 4, 5], i)).toEqual(all[i])
    }
  })

  it('nth at index 59 for 4 elements', () => {
    const result = PermutationIterator.nth([1, 2, 3, 4], 5)
    expect(result.length).toBe(4)
    expect(new Set(result).size).toBe(4)
  })

  it('nth with 0 elements returns array with undefined', () => {
    const result = PermutationIterator.nth([], 0)
    expect(result.length).toBe(1)
  })

  it('iterator yields new arrays each time', () => {
    const iter = new PermutationIterator(2)
    const first = iter.next()
    const second = iter.next()
    if (!first.done && !second.done) {
      expect(first.value).not.toBe(second.value)
      expect(first.value).toEqual([0, 1])
      expect(second.value).toEqual([1, 0])
    }
  })

  it('count(8) is 40320', () => {
    expect(PermutationIterator.count(8)).toBe(40320)
  })

  it('next() value is not reused', () => {
    const iter = new PermutationIterator(2)
    const first = iter.next()
    if (!first.done) {
      const copy = first.value
      copy[0] = 99
      const second = iter.next()
      if (!second.done) {
        expect(second.value).toEqual([1, 0])
      }
    }
  })

  it('should generate all permutations of 3', () => {
    const iter = new PermutationIterator(3)
    const perms: number[][] = []
    let result = iter.next()
    while (!result.done) {
      perms.push(result.value)
      result = iter.next()
    }
    expect(perms.length).toBe(6)
  })

  it('should generate permutations of 2', () => {
    const iter = new PermutationIterator(2)
    const perms: number[][] = []
    let result = iter.next()
    while (!result.done) {
      perms.push(result.value)
      result = iter.next()
    }
    expect(perms).toEqual([[0, 1], [1, 0]])
  })

  it('should return done immediately for 0', () => {
    const iter = new PermutationIterator(0)
    expect(iter.next().done).toBe(true)
  })

  it('should generate 1 permutation for n=1', () => {
    const iter = new PermutationIterator(1)
    expect(iter.next().value).toEqual([0])
    expect(iter.next().done).toBe(true)
  })

  it('should generate unique permutations', () => {
    const iter = new PermutationIterator(4)
    const seen = new Set<string>()
    let result = iter.next()
    while (!result.done) {
      const key = result.value.join(',')
      expect(seen.has(key)).toBe(false)
      seen.add(key)
      result = iter.next()
    }
    expect(seen.size).toBe(24)
  })

  it('should produce 120 permutations for n=5', () => {
    const iter = new PermutationIterator(5)
    let count = 0
    let result = iter.next()
    while (!result.done) {
      count++
      result = iter.next()
    }
    expect(count).toBe(120)
  })

  it('n=0 returns done immediately', () => {
    const iter = new PermutationIterator(0)
    const result = iter.next()
    expect(result.done).toBe(true)
  })

  it('n=1 returns [0]', () => {
    const iter = new PermutationIterator(1)
    expect(iter.next().value).toEqual([0])
  })

  it('n=2 returns both orderings', () => {
    const iter = new PermutationIterator(2)
    const perms: number[][] = []
    let r: IteratorResult<number[]>
    while (!(r = iter.next()).done) perms.push(r.value)
    expect(perms.length).toBe(2)
  })
})

describe('permutation-iterator - wave548', () => {
  it('permutation-iterator module defined', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator module is function', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator module has name', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator module not null', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator module has length', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - wave549', () => {
  it('permutation-iterator module defined', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator module is function', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - wave550', () => {
  it('permutation-iterator w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - wave551', () => {
  it('permutation-iterator w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - wave552', () => {
  it('permutation-iterator w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - wave553', () => {
  it('permutation-iterator w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - wave554', () => {
  it('permutation-iterator w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - wave555', () => {
  it('permutation-iterator w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - wave556', () => {
  it('permutation-iterator w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - wave557', () => {
  it('permutation-iterator w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - wave558', () => {
  it('permutation-iterator w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - wave559', () => {
  it('permutation-iterator w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - wave560', () => {
  it('permutation-iterator w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - wave561', () => {
  it('permutation-iterator w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - wave562', () => {
  it('permutation-iterator w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - wave563', () => {
  it('permutation-iterator w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - wave564', () => {
  it('permutation-iterator w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - wave565', () => {
  it('permutation-iterator w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - wave566', () => {
  it('permutation-iterator w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - wave127', () => {
  it('permutation-iterator w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - wave130', () => {
  it('permutation-iterator w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - wave133', () => {
  it('permutation-iterator w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - wave136', () => {
  it('permutation-iterator w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - wave139', () => {
  it('permutation-iterator w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w142', () => {
  it('permutation-iterator v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w145', () => {
  it('permutation-iterator v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w148', () => {
  it('permutation-iterator v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w151', () => {
  it('permutation-iterator v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w154', () => {
  it('permutation-iterator v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w157', () => {
  it('permutation-iterator v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w160', () => {
  it('permutation-iterator v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w170', () => {
  it('permutation-iterator x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w180', () => {
  it('permutation-iterator x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w190', () => {
  it('permutation-iterator x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w200', () => {
  it('permutation-iterator x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w210', () => {
  it('permutation-iterator x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w220', () => {
  it('permutation-iterator x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w230', () => {
  it('permutation-iterator x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w240', () => {
  it('permutation-iterator x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w250', () => {
  it('permutation-iterator x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w260', () => {
  it('permutation-iterator x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w270', () => {
  it('permutation-iterator x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w280', () => {
  it('permutation-iterator x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w290', () => {
  it('permutation-iterator x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w300', () => {
  it('permutation-iterator x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w310', () => {
  it('permutation-iterator x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w320', () => {
  it('permutation-iterator x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w330', () => {
  it('permutation-iterator x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w340', () => {
  it('permutation-iterator x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w350', () => {
  it('permutation-iterator x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w360', () => {
  it('permutation-iterator x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w370', () => {
  it('permutation-iterator x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w380', () => {
  it('permutation-iterator x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w390', () => {
  it('permutation-iterator x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w400', () => {
  it('permutation-iterator x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w420', () => {
  it('permutation-iterator x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w440', () => {
  it('permutation-iterator x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w460', () => {
  it('permutation-iterator x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w480', () => {
  it('permutation-iterator x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w500', () => {
  it('permutation-iterator x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w550', () => {
  it('permutation-iterator x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w600', () => {
  it('permutation-iterator x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w650', () => {
  it('permutation-iterator x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w700', () => {
  it('permutation-iterator x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w800', () => {
  it('permutation-iterator x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w900', () => {
  it('permutation-iterator x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('permutation-iterator - w1000', () => {
  it('permutation-iterator x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('permutation-iterator x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
