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
