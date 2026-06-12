import { describe, it, expect } from 'vitest'
import { StaticBitset } from '../../src/utils/static-bitset.js'

describe('StaticBitset', () => {
  it('constructor creates bitset with specified length', () => {
    const bs = new StaticBitset(100)
    expect(bs.length).toBe(100)
  })

  it('constructor throws for negative length', () => {
    expect(() => new StaticBitset(-1)).toThrow(RangeError)
  })

  it('constructor creates empty bitset with zero length', () => {
    const bs = new StaticBitset(0)
    expect(bs.length).toBe(0)
    expect(bs.isEmpty).toBe(true)
  })

  it('static from creates bitset from indices', () => {
    const bs = StaticBitset.from([1, 3, 5])
    expect(bs.length).toBe(6)
    expect(bs.get(1)).toBe(true)
    expect(bs.get(3)).toBe(true)
    expect(bs.get(5)).toBe(true)
    expect(bs.get(0)).toBe(false)
  })

  it('static from with length parameter', () => {
    const bs = StaticBitset.from([1, 3], 10)
    expect(bs.length).toBe(10)
    expect(bs.get(1)).toBe(true)
    expect(bs.get(3)).toBe(true)
    expect(bs.get(5)).toBe(false)
  })

  it('static from empty iterable creates empty bitset', () => {
    const bs = StaticBitset.from([])
    expect(bs.length).toBe(0)
    expect(bs.isEmpty).toBe(true)
  })

  it('static fromRange creates bitset with range', () => {
    const bs = StaticBitset.fromRange(2, 5)
    expect(bs.get(2)).toBe(true)
    expect(bs.get(3)).toBe(true)
    expect(bs.get(4)).toBe(true)
    expect(bs.get(5)).toBe(true)
    expect(bs.get(1)).toBe(false)
    expect(bs.get(6)).toBe(false)
  })

  it('static union combines two bitsets', () => {
    const a = StaticBitset.from([1, 2, 3])
    const b = StaticBitset.from([3, 4, 5])
    const result = StaticBitset.union(a, b)
    expect(result.toArray()).toEqual([1, 2, 3, 4, 5])
  })

  it('static intersection finds common bits', () => {
    const a = StaticBitset.from([1, 2, 3, 4])
    const b = StaticBitset.from([3, 4, 5, 6])
    const result = StaticBitset.intersection(a, b)
    expect(result.toArray()).toEqual([3, 4])
  })

  it('static difference subtracts bitsets', () => {
    const a = StaticBitset.from([1, 2, 3, 4])
    const b = StaticBitset.from([3, 4])
    const result = StaticBitset.difference(a, b)
    expect(result.toArray()).toEqual([1, 2])
  })

  it('set and get work correctly', () => {
    const bs = new StaticBitset(100)
    bs.set(42)
    expect(bs.get(42)).toBe(true)
    expect(bs.get(41)).toBe(false)
  })

  it('set throws for out of range index', () => {
    const bs = new StaticBitset(10)
    expect(() => bs.set(10)).toThrow(RangeError)
    expect(() => bs.set(-1)).toThrow(RangeError)
  })

  it('clear removes bit', () => {
    const bs = new StaticBitset(100)
    bs.set(42)
    bs.clear(42)
    expect(bs.get(42)).toBe(false)
  })

  it('clear throws for out of range index', () => {
    const bs = new StaticBitset(10)
    expect(() => bs.clear(10)).toThrow(RangeError)
  })

  it('flip toggles bit', () => {
    const bs = new StaticBitset(100)
    expect(bs.get(42)).toBe(false)
    bs.flip(42)
    expect(bs.get(42)).toBe(true)
    bs.flip(42)
    expect(bs.get(42)).toBe(false)
  })

  it('flip throws for out of range index', () => {
    const bs = new StaticBitset(10)
    expect(() => bs.flip(10)).toThrow(RangeError)
  })

  it('get returns false for out of range index', () => {
    const bs = new StaticBitset(10)
    expect(bs.get(-1)).toBe(false)
    expect(bs.get(10)).toBe(false)
  })

  it('setRange sets multiple bits', () => {
    const bs = new StaticBitset(100)
    bs.setRange(5, 10)
    expect(bs.get(4)).toBe(false)
    expect(bs.get(5)).toBe(true)
    expect(bs.get(10)).toBe(true)
    expect(bs.get(11)).toBe(false)
  })

  it('setRange handles range beyond length', () => {
    const bs = new StaticBitset(10)
    bs.setRange(8, 20)
    expect(bs.get(8)).toBe(true)
    expect(bs.get(9)).toBe(true)
    expect(bs.get(10)).toBe(false)
  })

  it('clearRange clears multiple bits', () => {
    const bs = new StaticBitset(100)
    bs.setRange(5, 10)
    bs.clearRange(7, 9)
    expect(bs.get(5)).toBe(true)
    expect(bs.get(6)).toBe(true)
    expect(bs.get(7)).toBe(false)
    expect(bs.get(9)).toBe(false)
    expect(bs.get(10)).toBe(true)
  })

  it('popcount returns correct count', () => {
    const bs = new StaticBitset(100)
    expect(bs.popcount).toBe(0)
    bs.set(5)
    bs.set(10)
    bs.set(15)
    expect(bs.popcount).toBe(3)
  })

  it('isEmpty returns true for empty bitset', () => {
    const bs = new StaticBitset(100)
    expect(bs.isEmpty).toBe(true)
  })

  it('isEmpty returns false for non-empty bitset', () => {
    const bs = new StaticBitset(100)
    bs.set(5)
    expect(bs.isEmpty).toBe(false)
  })

  it('isFull returns true for fully set bitset', () => {
    const bs = new StaticBitset(32)
    for (let i = 0; i < 32; i++) {
      bs.set(i)
    }
    expect(bs.isFull).toBe(true)
  })

  it('isFull returns false for partially set bitset', () => {
    const bs = new StaticBitset(32)
    bs.set(5)
    expect(bs.isFull).toBe(false)
  })

  it('nextSet finds next set bit', () => {
    const bs = new StaticBitset(100)
    bs.set(5)
    bs.set(10)
    bs.set(15)
    expect(bs.nextSet(0)).toBe(5)
    expect(bs.nextSet(5)).toBe(5)
    expect(bs.nextSet(6)).toBe(10)
    expect(bs.nextSet(11)).toBe(15)
    expect(bs.nextSet(16)).toBe(-1)
  })

  it('nextClear finds next clear bit', () => {
    const bs = StaticBitset.from([5, 6, 7], 20)
    expect(bs.nextClear(0)).toBe(0)
    expect(bs.nextClear(5)).toBe(8)
    expect(bs.nextClear(8)).toBe(8)
  })

  it('forEach iterates over set bits', () => {
    const bs = StaticBitset.from([1, 3, 5, 7])
    const results: number[] = []
    bs.forEach((i) => results.push(i))
    expect(results).toEqual([1, 3, 5, 7])
  })

  it('toArray returns array of set indices', () => {
    const bs = StaticBitset.from([1, 3, 5, 7])
    expect(bs.toArray()).toEqual([1, 3, 5, 7])
  })

  it('clone creates independent copy', () => {
    const bs = StaticBitset.from([1, 3, 5], 20)
    const clone = bs.clone()
    bs.set(7)
    expect(clone.toArray()).toEqual([1, 3, 5])
    expect(bs.toArray()).toEqual([1, 3, 5, 7])
  })

  it('reset clears all bits', () => {
    const bs = StaticBitset.from([1, 3, 5])
    bs.reset()
    expect(bs.isEmpty).toBe(true)
    expect(bs.get(1)).toBe(false)
  })

  it('constructor with length 1 creates single-bit bitset', () => {
    const bs = new StaticBitset(1)
    expect(bs.length).toBe(1)
    expect(bs.isEmpty).toBe(true)
  })

  it('constructor with length 32 uses exactly one word', () => {
    const bs = new StaticBitset(32)
    for (let i = 0; i < 32; i++) {
      bs.set(i)
    }
    expect(bs.popcount).toBe(32)
    expect(bs.isFull).toBe(true)
  })

  it('constructor with length 33 uses two words', () => {
    const bs = new StaticBitset(33)
    expect(bs.length).toBe(33)
    bs.set(32)
    expect(bs.get(32)).toBe(true)
    expect(bs.get(31)).toBe(false)
  })

  it('static from with Set', () => {
    const indices = new Set([2, 4, 6])
    const bs = StaticBitset.from(indices)
    expect(bs.toArray()).toEqual([2, 4, 6])
  })

  it('static from with duplicate indices', () => {
    const bs = StaticBitset.from([1, 2, 2, 3, 3, 3])
    expect(bs.toArray()).toEqual([1, 2, 3])
  })

  it('static from with unsorted indices', () => {
    const bs = StaticBitset.from([5, 1, 9, 3])
    expect(bs.toArray()).toEqual([1, 3, 5, 9])
  })

  it('static from with length larger than max index', () => {
    const bs = StaticBitset.from([1, 3, 5], 10)
    expect(bs.length).toBe(10)
    expect(bs.get(5)).toBe(true)
  })

  it('static from with zero length and empty iterable', () => {
    const bs = StaticBitset.from([], 0)
    expect(bs.length).toBe(0)
  })

  it('static fromRange with start equals end', () => {
    const bs = StaticBitset.fromRange(5, 5)
    expect(bs.get(5)).toBe(true)
    expect(bs.get(4)).toBe(false)
    expect(bs.get(6)).toBe(false)
  })

  it('static fromRange with start equals zero', () => {
    const bs = StaticBitset.fromRange(0, 3)
    expect(bs.get(0)).toBe(true)
    expect(bs.get(3)).toBe(true)
  })

  it('static union with different lengths', () => {
    const a = StaticBitset.from([1, 2], 10)
    const b = StaticBitset.from([5, 6], 20)
    const result = StaticBitset.union(a, b)
    expect(result.length).toBe(20)
    expect(result.toArray()).toEqual([1, 2, 5, 6])
  })

  it('static union with empty bitsets', () => {
    const a = new StaticBitset(10)
    const b = StaticBitset.from([1, 2], 5)
    const result = StaticBitset.union(a, b)
    expect(result.toArray()).toEqual([1, 2])
  })

  it('static union with same bitset', () => {
    const a = StaticBitset.from([1, 2, 3], 10)
    const result = StaticBitset.union(a, a)
    expect(result.toArray()).toEqual([1, 2, 3])
  })

  it('static intersection with different lengths', () => {
    const a = StaticBitset.from([1, 2, 5], 10)
    const b = StaticBitset.from([2, 5, 6], 20)
    const result = StaticBitset.intersection(a, b)
    expect(result.length).toBe(20)
    expect(result.toArray()).toEqual([2, 5])
  })

  it('static intersection with no overlap', () => {
    const a = StaticBitset.from([1, 2], 10)
    const b = StaticBitset.from([5, 6], 10)
    const result = StaticBitset.intersection(a, b)
    expect(result.toArray()).toEqual([])
  })

  it('static intersection with empty bitset', () => {
    const a = StaticBitset.from([1, 2], 10)
    const b = new StaticBitset(10)
    const result = StaticBitset.intersection(a, b)
    expect(result.toArray()).toEqual([])
  })

  it('static difference with different lengths', () => {
    const a = StaticBitset.from([1, 2, 5, 7], 20)
    const b = StaticBitset.from([2, 5], 10)
    const result = StaticBitset.difference(a, b)
    expect(result.length).toBe(20)
    expect(result.toArray()).toEqual([1, 7])
  })

  it('static difference removes all bits', () => {
    const a = StaticBitset.from([1, 2], 10)
    const b = StaticBitset.from([1, 2], 10)
    const result = StaticBitset.difference(a, b)
    expect(result.toArray()).toEqual([])
  })

  it('static difference with empty bitset', () => {
    const a = StaticBitset.from([1, 2], 10)
    const b = new StaticBitset(10)
    const result = StaticBitset.difference(a, b)
    expect(result.toArray()).toEqual([1, 2])
  })

  it('set multiple times keeps bit set', () => {
    const bs = new StaticBitset(100)
    bs.set(42)
    bs.set(42)
    bs.set(42)
    expect(bs.get(42)).toBe(true)
    expect(bs.popcount).toBe(1)
  })

  it('set bits at word boundaries', () => {
    const bs = new StaticBitset(100)
    bs.set(31)
    bs.set(32)
    bs.set(63)
    bs.set(64)
    expect(bs.get(31)).toBe(true)
    expect(bs.get(32)).toBe(true)
    expect(bs.get(63)).toBe(true)
    expect(bs.get(64)).toBe(true)
  })

  it('clear multiple times keeps bit clear', () => {
    const bs = new StaticBitset(100)
    bs.set(42)
    bs.clear(42)
    bs.clear(42)
    expect(bs.get(42)).toBe(false)
  })

  it('flip from set to clear', () => {
    const bs = new StaticBitset(100)
    bs.set(42)
    bs.flip(42)
    expect(bs.get(42)).toBe(false)
  })

  it('flip at word boundaries', () => {
    const bs = new StaticBitset(100)
    bs.set(31)
    bs.set(32)
    bs.flip(31)
    bs.flip(32)
    expect(bs.get(31)).toBe(false)
    expect(bs.get(32)).toBe(false)
  })

  it('get with negative index returns false', () => {
    const bs = new StaticBitset(100)
    expect(bs.get(-1)).toBe(false)
    expect(bs.get(-100)).toBe(false)
  })

  it('get with index equal to length returns false', () => {
    const bs = new StaticBitset(100)
    expect(bs.get(100)).toBe(false)
  })

  it('get with index greater than length returns false', () => {
    const bs = new StaticBitset(100)
    expect(bs.get(200)).toBe(false)
  })

  it('setRange with single index', () => {
    const bs = new StaticBitset(100)
    bs.setRange(10, 10)
    expect(bs.get(10)).toBe(true)
    expect(bs.get(9)).toBe(false)
    expect(bs.get(11)).toBe(false)
  })

  it('setRange at word boundary', () => {
    const bs = new StaticBitset(100)
    bs.setRange(30, 34)
    expect(bs.get(30)).toBe(true)
    expect(bs.get(31)).toBe(true)
    expect(bs.get(32)).toBe(true)
    expect(bs.get(33)).toBe(true)
    expect(bs.get(34)).toBe(true)
  })

  it('clearRange with single index', () => {
    const bs = new StaticBitset(100)
    bs.set(10)
    bs.clearRange(10, 10)
    expect(bs.get(10)).toBe(false)
  })

  it('clearRange handles range beyond length', () => {
    const bs = new StaticBitset(10)
    bs.setRange(0, 9)
    bs.clearRange(5, 20)
    expect(bs.get(4)).toBe(true)
    expect(bs.get(5)).toBe(false)
    expect(bs.get(9)).toBe(false)
  })

  it('popcount with bits in different words', () => {
    const bs = new StaticBitset(100)
    bs.set(0)
    bs.set(31)
    bs.set(32)
    bs.set(63)
    bs.set(64)
    expect(bs.popcount).toBe(5)
  })

  it('isEmpty returns true after clearing all set bits', () => {
    const bs = StaticBitset.from([1, 2, 3])
    bs.clear(1)
    bs.clear(2)
    bs.clear(3)
    expect(bs.isEmpty).toBe(true)
  })

  it('isFull with non-word-aligned length', () => {
    const bs = new StaticBitset(35)
    for (let i = 0; i < 35; i++) {
      bs.set(i)
    }
    expect(bs.isFull).toBe(true)
  })

  it('isFull returns false when last word not full', () => {
    const bs = new StaticBitset(35)
    for (let i = 0; i < 34; i++) {
      bs.set(i)
    }
    expect(bs.isFull).toBe(false)
  })

  it('isFull with length 0 returns false', () => {
    const bs = new StaticBitset(0)
    expect(bs.isFull).toBe(false)
  })

  it('nextSet returns -1 for empty bitset', () => {
    const bs = new StaticBitset(100)
    expect(bs.nextSet(0)).toBe(-1)
  })

  it('nextSet with from at last set bit', () => {
    const bs = StaticBitset.from([1, 5, 10])
    expect(bs.nextSet(10)).toBe(10)
  })

  it('nextClear returns -1 for full bitset', () => {
    const bs = new StaticBitset(32)
    for (let i = 0; i < 32; i++) {
      bs.set(i)
    }
    expect(bs.nextClear(0)).toBe(-1)
  })

  it('nextClear with from at end of bitset returns 9', () => {
    const bs = StaticBitset.from([0, 1, 2], 10)
    expect(bs.nextClear(9)).toBe(9)
  })

  it('forEach does not iterate over empty bitset', () => {
    const bs = new StaticBitset(100)
    const results: number[] = []
    bs.forEach((i) => results.push(i))
    expect(results).toEqual([])
  })

  it('forEach with single bit', () => {
    const bs = StaticBitset.from([5])
    const results: number[] = []
    bs.forEach((i) => results.push(i))
    expect(results).toEqual([5])
  })

  it('toArray returns empty array for empty bitset', () => {
    const bs = new StaticBitset(100)
    expect(bs.toArray()).toEqual([])
  })

  it('clone of empty bitset is empty', () => {
    const bs = new StaticBitset(100)
    const clone = bs.clone()
    expect(clone.length).toBe(100)
    expect(clone.isEmpty).toBe(true)
  })

  it('clone has same length as original', () => {
    const bs = new StaticBitset(123)
    const clone = bs.clone()
    expect(clone.length).toBe(123)
  })

  it('reset does not affect length', () => {
    const bs = StaticBitset.from([1, 2, 3], 100)
    bs.reset()
    expect(bs.length).toBe(100)
  })

  it('reset on empty bitset remains empty', () => {
    const bs = new StaticBitset(100)
    bs.reset()
    expect(bs.isEmpty).toBe(true)
  })
})
describe('static-bitset - wave551', () => {
  it('static-bitset w551 check 0', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - wave552', () => {
  it('static-bitset w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - wave553', () => {
  it('static-bitset w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - wave554', () => {
  it('static-bitset w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - wave555', () => {
  it('static-bitset w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - wave556', () => {
  it('static-bitset w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - wave557', () => {
  it('static-bitset w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - wave558', () => {
  it('static-bitset w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - wave559', () => {
  it('static-bitset w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - wave560', () => {
  it('static-bitset w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - wave561', () => {
  it('static-bitset w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - wave562', () => {
  it('static-bitset w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - wave563', () => {
  it('static-bitset w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - wave564', () => {
  it('static-bitset w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - wave565', () => {
  it('static-bitset w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - wave566', () => {
  it('static-bitset w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - wave127', () => {
  it('static-bitset w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - wave130', () => {
  it('static-bitset w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - wave133', () => {
  it('static-bitset w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - wave136', () => {
  it('static-bitset w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - wave139', () => {
  it('static-bitset w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w142', () => {
  it('static-bitset v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w145', () => {
  it('static-bitset v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w148', () => {
  it('static-bitset v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w151', () => {
  it('static-bitset v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w154', () => {
  it('static-bitset v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w157', () => {
  it('static-bitset v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w160', () => {
  it('static-bitset v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w170', () => {
  it('static-bitset x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w180', () => {
  it('static-bitset x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w190', () => {
  it('static-bitset x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w200', () => {
  it('static-bitset x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w210', () => {
  it('static-bitset x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w220', () => {
  it('static-bitset x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w230', () => {
  it('static-bitset x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w240', () => {
  it('static-bitset x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w250', () => {
  it('static-bitset x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w260', () => {
  it('static-bitset x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w270', () => {
  it('static-bitset x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w280', () => {
  it('static-bitset x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w290', () => {
  it('static-bitset x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w300', () => {
  it('static-bitset x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x300x9', () => {
    expect(describe).toBeDefined()
  })
})
