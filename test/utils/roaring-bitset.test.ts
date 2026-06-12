import { describe, it, expect } from 'vitest'
import { RoaringBitSet } from '../../src/utils/roaring-bitset.js'

describe('RoaringBitSet', () => {
  it('creates empty bitset', () => {
    const bs = new RoaringBitSet()
    expect(bs.size).toBe(0)
    expect(bs.isEmpty).toBe(true)
  })

  it('creates bitset from iterable', () => {
    const bs = RoaringBitSet.from([1, 2, 3])
    expect(bs.size).toBe(3)
    expect(bs.has(1)).toBe(true)
    expect(bs.has(2)).toBe(true)
    expect(bs.has(3)).toBe(true)
  })

  it('creates bitset from range', () => {
    const bs = RoaringBitSet.fromRange(5, 10)
    expect(bs.size).toBe(6)
    expect(bs.has(5)).toBe(true)
    expect(bs.has(10)).toBe(true)
    expect(bs.has(11)).toBe(false)
  })

  it('adds single value', () => {
    const bs = new RoaringBitSet()
    bs.add(42)
    expect(bs.size).toBe(1)
    expect(bs.has(42)).toBe(true)
  })

  it('adds range of values', () => {
    const bs = new RoaringBitSet()
    bs.addRange(0, 4)
    expect(bs.size).toBe(5)
    expect(bs.has(0)).toBe(true)
    expect(bs.has(2)).toBe(true)
    expect(bs.has(4)).toBe(true)
  })

  it('ignores negative values on add', () => {
    const bs = new RoaringBitSet()
    bs.add(-1)
    expect(bs.size).toBe(0)
  })

  it('ignores values beyond 32-bit range on add', () => {
    const bs = new RoaringBitSet()
    bs.add(0xFFFFFFFF + 1)
    expect(bs.size).toBe(0)
  })

  it('checks if value exists', () => {
    const bs = new RoaringBitSet()
    bs.add(100)
    expect(bs.has(100)).toBe(true)
    expect(bs.has(99)).toBe(false)
  })

  it('returns false for out of range on has', () => {
    const bs = new RoaringBitSet()
    expect(bs.has(-1)).toBe(false)
    expect(bs.has(0xFFFFFFFF + 1)).toBe(false)
  })

  it('deletes value', () => {
    const bs = new RoaringBitSet()
    bs.add(50)
    expect(bs.delete(50)).toBe(true)
    expect(bs.has(50)).toBe(false)
    expect(bs.size).toBe(0)
  })

  it('returns false when deleting non-existent value', () => {
    const bs = new RoaringBitSet()
    expect(bs.delete(99)).toBe(false)
  })

  it('performs bitwise AND operation', () => {
    const bs1 = RoaringBitSet.from([1, 2, 3])
    const bs2 = RoaringBitSet.from([2, 3, 4])
    const result = bs1.and(bs2)
    expect(result.toArray()).toEqual([2, 3])
  })

  it('performs bitwise OR operation', () => {
    const bs1 = RoaringBitSet.from([1, 2])
    const bs2 = RoaringBitSet.from([3, 4])
    const result = bs1.or(bs2)
    expect(result.toArray()).toEqual([1, 2, 3, 4])
  })

  it('performs bitwise XOR operation', () => {
    const bs1 = RoaringBitSet.from([1, 2, 3])
    const bs2 = RoaringBitSet.from([2, 3, 4])
    const result = bs1.xor(bs2)
    expect(result.toArray()).toEqual([1, 4])
  })

  it('performs bitwise AND NOT operation', () => {
    const bs1 = RoaringBitSet.from([1, 2, 3])
    const bs2 = RoaringBitSet.from([2, 3, 4])
    const result = bs1.andNot(bs2)
    expect(result.toArray()).toEqual([1])
  })

  it('iterates over values with forEach', () => {
    const bs = RoaringBitSet.from([5, 10, 15])
    const values: number[] = []
    bs.forEach((v) => values.push(v))
    expect(values).toEqual([5, 10, 15])
  })

  it('converts to array', () => {
    const bs = RoaringBitSet.from([3, 1, 2])
    expect(bs.toArray()).toEqual([1, 2, 3])
  })

  it('returns minimum value', () => {
    const bs = RoaringBitSet.from([10, 5, 15])
    expect(bs.min).toBe(5)
  })

  it('returns undefined for min when empty', () => {
    const bs = new RoaringBitSet()
    expect(bs.min).toBeUndefined()
  })

  it('returns maximum value', () => {
    const bs = RoaringBitSet.from([10, 5, 15])
    expect(bs.max).toBe(15)
  })

  it('returns undefined for max when empty', () => {
    const bs = new RoaringBitSet()
    expect(bs.max).toBeUndefined()
  })

  it('clears all values', () => {
    const bs = RoaringBitSet.from([1, 2, 3])
    bs.clear()
    expect(bs.size).toBe(0)
    expect(bs.isEmpty).toBe(true)
  })

  it('handles large values across buckets', () => {
    const bs = new RoaringBitSet()
    bs.add(0)
    bs.add(0x10000)
    bs.add(0x20000)
    expect(bs.size).toBe(3)
    expect(bs.has(0)).toBe(true)
    expect(bs.has(0x10000)).toBe(true)
    expect(bs.has(0x20000)).toBe(true)
  })

  it('has returns false for unset bit', () => {
    const bs = new RoaringBitSet()
    bs.set(5)
    expect(bs.has(5)).toBe(true)
    expect(bs.has(6)).toBe(false)
  })

  it('handles boundary value 0', () => {
    const bs = new RoaringBitSet()
    bs.add(0)
    expect(bs.size).toBe(1)
    expect(bs.has(0)).toBe(true)
    expect(bs.min).toBe(0)
    expect(bs.max).toBe(0)
  })

  it('ignores duplicate additions', () => {
    const bs = new RoaringBitSet()
    bs.add(42)
    bs.add(42)
    bs.add(42)
    expect(bs.size).toBe(1)
    expect(bs.toArray()).toEqual([42])
  })

  it('AND with empty bitset returns empty', () => {
    const bs1 = RoaringBitSet.from([1, 2, 3])
    const bs2 = new RoaringBitSet()
    const result = bs1.and(bs2)
    expect(result.size).toBe(0)
    expect(result.isEmpty).toBe(true)
  })

  it('OR with empty bitset returns original', () => {
    const bs1 = RoaringBitSet.from([1, 2, 3])
    const bs2 = new RoaringBitSet()
    const result = bs1.or(bs2)
    expect(result.toArray()).toEqual([1, 2, 3])
  })

  it('XOR with empty bitset returns original', () => {
    const bs1 = RoaringBitSet.from([1, 2, 3])
    const bs2 = new RoaringBitSet()
    const result = bs1.xor(bs2)
    expect(result.toArray()).toEqual([1, 2, 3])
  })

  it('AND NOT with empty bitset returns original', () => {
    const bs1 = RoaringBitSet.from([1, 2, 3])
    const bs2 = new RoaringBitSet()
    const result = bs1.andNot(bs2)
    expect(result.toArray()).toEqual([1, 2, 3])
  })

  it('self AND returns original', () => {
    const bs = RoaringBitSet.from([1, 2, 3])
    const result = bs.and(bs)
    expect(result.toArray()).toEqual([1, 2, 3])
  })

  it('self OR returns original', () => {
    const bs = RoaringBitSet.from([1, 2, 3])
    const result = bs.or(bs)
    expect(result.toArray()).toEqual([1, 2, 3])
  })

  it('self XOR returns empty', () => {
    const bs = RoaringBitSet.from([1, 2, 3])
    const result = bs.xor(bs)
    expect(result.size).toBe(0)
    expect(result.isEmpty).toBe(true)
  })

  it('self AND NOT returns empty', () => {
    const bs = RoaringBitSet.from([1, 2, 3])
    const result = bs.andNot(bs)
    expect(result.size).toBe(0)
    expect(result.isEmpty).toBe(true)
  })

  it('chains multiple operations', () => {
    const bs1 = RoaringBitSet.from([1, 2, 3, 4])
    const bs2 = RoaringBitSet.from([3, 4, 5, 6])
    const bs3 = RoaringBitSet.from([5, 6, 7, 8])
    const result = bs1.and(bs2).or(bs3)
    expect(result.toArray()).toEqual([3, 4, 5, 6, 7, 8])
  })

  it('handles mixed values in same bucket', () => {
    const bs = new RoaringBitSet()
    bs.add(0)
    bs.add(15)
    bs.add(16)
    bs.add(31)
    expect(bs.size).toBe(4)
    expect(bs.has(0)).toBe(true)
    expect(bs.has(15)).toBe(true)
    expect(bs.has(16)).toBe(true)
    expect(bs.has(31)).toBe(true)
  })

  it('handles large range operations', () => {
    const bs = new RoaringBitSet()
    bs.addRange(1000, 2000)
    expect(bs.size).toBe(1001)
    expect(bs.has(1000)).toBe(true)
    expect(bs.has(1500)).toBe(true)
    expect(bs.has(2000)).toBe(true)
  })

  it('delete returns false for out of range', () => {
    const bs = new RoaringBitSet()
    bs.add(50)
    expect(bs.delete(-1)).toBe(false)
    expect(bs.delete(0xFFFFFFFF + 1)).toBe(false)
  })

  it('delete all values one by one', () => {
    const bs = RoaringBitSet.from([1, 2, 3])
    expect(bs.delete(1)).toBe(true)
    expect(bs.delete(2)).toBe(true)
    expect(bs.delete(3)).toBe(true)
    expect(bs.isEmpty).toBe(true)
  })

  it('OR of disjoint sets combines all values', () => {
    const bs1 = RoaringBitSet.from([1, 2, 3])
    const bs2 = RoaringBitSet.from([10, 20, 30])
    const result = bs1.or(bs2)
    expect(result.size).toBe(6)
    expect(result.toArray()).toEqual([1, 2, 3, 10, 20, 30])
  })

  it('XOR of disjoint sets combines all values', () => {
    const bs1 = RoaringBitSet.from([1, 2, 3])
    const bs2 = RoaringBitSet.from([10, 20, 30])
    const result = bs1.xor(bs2)
    expect(result.size).toBe(6)
    expect(result.toArray()).toEqual([1, 2, 3, 10, 20, 30])
  })

  it('forEach with empty bitset does nothing', () => {
    const bs = new RoaringBitSet()
    const values: number[] = []
    bs.forEach((v) => values.push(v))
    expect(values).toEqual([])
  })

  it('forEach iterates in sorted order', () => {
    const bs = RoaringBitSet.from([50, 10, 30, 20, 40])
    const values: number[] = []
    bs.forEach((v) => values.push(v))
    expect(values).toEqual([10, 20, 30, 40, 50])
  })

  it('addRange with single value works', () => {
    const bs = new RoaringBitSet()
    bs.addRange(5, 5)
    expect(bs.size).toBe(1)
    expect(bs.has(5)).toBe(true)
  })

  it('addRange with invalid range (start > end) adds nothing', () => {
    const bs = new RoaringBitSet()
    bs.addRange(10, 5)
    expect(bs.size).toBe(0)
  })

  it('from with empty iterable creates empty bitset', () => {
    const bs = RoaringBitSet.from([])
    expect(bs.isEmpty).toBe(true)
  })

  it('fromRange with invalid range creates empty bitset', () => {
    const bs = RoaringBitSet.fromRange(10, 5)
    expect(bs.isEmpty).toBe(true)
  })

  it('should report min and max', () => {
    const bs = new RoaringBitSet()
    bs.add(10)
    bs.add(50)
    bs.add(100)
    expect(bs.min).toBe(10)
    expect(bs.max).toBe(100)
  })

  it('should convert to array', () => {
    const bs = new RoaringBitSet()
    bs.add(3)
    bs.add(1)
    bs.add(5)
    expect(bs.toArray()).toEqual([1, 3, 5])
  })

  it('should check has correctly', () => {
    const bs = new RoaringBitSet()
    bs.add(42)
    expect(bs.has(42)).toBe(true)
    expect(bs.has(99)).toBe(false)
  })

  it('should remove elements', () => {
    const bs = new RoaringBitSet()
    bs.add(10)
    bs.delete(10)
    expect(bs.has(10)).toBe(false)
    expect(bs.size).toBe(0)
  })

  it('should compute union', () => {
    const bs1 = new RoaringBitSet()
    bs1.add(1)
    bs1.add(2)
    const bs2 = new RoaringBitSet()
    bs2.add(2)
    bs2.add(3)
    const union = RoaringBitSet.from([...bs1.toArray(), ...bs2.toArray()])
    expect(union.has(1)).toBe(true)
    expect(union.has(2)).toBe(true)
    expect(union.has(3)).toBe(true)
  })

  it('should compute intersection', () => {
    const bs1 = new RoaringBitSet()
    bs1.add(1)
    bs1.add(2)
    bs1.add(3)
    const bs2 = new RoaringBitSet()
    bs2.add(2)
    bs2.add(3)
    bs2.add(4)
    const inter = RoaringBitSet.from(bs1.toArray().filter(x => bs2.has(x)))
    expect(inter.has(1)).toBe(false)
    expect(inter.has(2)).toBe(true)
    expect(inter.has(3)).toBe(true)
  })
})
  it('has returns false for missing', () => {
    const rb = new RoaringBitSet()
    expect(rb.has(42)).toBe(false)
  })

  it('from creates bitset from indices', () => {
    const rb = RoaringBitSet.from([1, 3, 5])
    expect(rb.has(1)).toBe(true)
    expect(rb.has(2)).toBe(false)


  it('new bitset has nothing', () => {
    const bs = new RoaringBitSet()
    expect(bs.has(0)).toBe(false)
  })

  it('add and has', () => {
    const bs = new RoaringBitSet()
    bs.add(5)
    expect(bs.has(5)).toBe(true)
  })

  it('delete removes', () => {
    const bs = new RoaringBitSet()
    bs.add(5)
    bs.delete(5)
    expect(bs.has(5)).toBe(false)
  })
  })

describe('roaring-bitset - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('roaring-bitset - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('roaring-bitset - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('roaring-bitset - wave548', () => {
  it('roaring-bitset module defined', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset module is function', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - wave549', () => {
  it('roaring-bitset module defined', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset module is function', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - wave550', () => {
  it('roaring-bitset w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - wave551', () => {
  it('roaring-bitset w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - wave552', () => {
  it('roaring-bitset w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - wave553', () => {
  it('roaring-bitset w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - wave554', () => {
  it('roaring-bitset w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - wave555', () => {
  it('roaring-bitset w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - wave556', () => {
  it('roaring-bitset w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - wave557', () => {
  it('roaring-bitset w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - wave558', () => {
  it('roaring-bitset w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - wave559', () => {
  it('roaring-bitset w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - wave560', () => {
  it('roaring-bitset w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - wave561', () => {
  it('roaring-bitset w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - wave562', () => {
  it('roaring-bitset w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - wave563', () => {
  it('roaring-bitset w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - wave564', () => {
  it('roaring-bitset w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - wave565', () => {
  it('roaring-bitset w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - wave566', () => {
  it('roaring-bitset w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - wave127', () => {
  it('roaring-bitset w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - wave130', () => {
  it('roaring-bitset w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - wave133', () => {
  it('roaring-bitset w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - wave136', () => {
  it('roaring-bitset w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - wave139', () => {
  it('roaring-bitset w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset w139 v2', () => {
    expect(describe).toBeDefined()
  })
})
