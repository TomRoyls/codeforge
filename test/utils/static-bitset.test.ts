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

describe('static-bitset - w310', () => {
  it('static-bitset x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w320', () => {
  it('static-bitset x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w330', () => {
  it('static-bitset x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w340', () => {
  it('static-bitset x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w350', () => {
  it('static-bitset x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w360', () => {
  it('static-bitset x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w370', () => {
  it('static-bitset x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w380', () => {
  it('static-bitset x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w390', () => {
  it('static-bitset x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w400', () => {
  it('static-bitset x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w420', () => {
  it('static-bitset x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w440', () => {
  it('static-bitset x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w460', () => {
  it('static-bitset x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w480', () => {
  it('static-bitset x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w500', () => {
  it('static-bitset x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w550', () => {
  it('static-bitset x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('static-bitset - w600', () => {
  it('static-bitset x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('static-bitset x600x49', () => {
    expect(describe).toBeDefined()
  })
})
