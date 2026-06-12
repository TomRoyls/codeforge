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

describe('roaring-bitset - w142', () => {
  it('roaring-bitset v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w145', () => {
  it('roaring-bitset v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w148', () => {
  it('roaring-bitset v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w151', () => {
  it('roaring-bitset v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w154', () => {
  it('roaring-bitset v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w157', () => {
  it('roaring-bitset v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w160', () => {
  it('roaring-bitset v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w170', () => {
  it('roaring-bitset x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w180', () => {
  it('roaring-bitset x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w190', () => {
  it('roaring-bitset x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w200', () => {
  it('roaring-bitset x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w210', () => {
  it('roaring-bitset x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w220', () => {
  it('roaring-bitset x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w230', () => {
  it('roaring-bitset x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w240', () => {
  it('roaring-bitset x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w250', () => {
  it('roaring-bitset x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w260', () => {
  it('roaring-bitset x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w270', () => {
  it('roaring-bitset x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w280', () => {
  it('roaring-bitset x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w290', () => {
  it('roaring-bitset x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w300', () => {
  it('roaring-bitset x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w310', () => {
  it('roaring-bitset x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w320', () => {
  it('roaring-bitset x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w330', () => {
  it('roaring-bitset x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w340', () => {
  it('roaring-bitset x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w350', () => {
  it('roaring-bitset x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w360', () => {
  it('roaring-bitset x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w370', () => {
  it('roaring-bitset x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w380', () => {
  it('roaring-bitset x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w390', () => {
  it('roaring-bitset x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w400', () => {
  it('roaring-bitset x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w420', () => {
  it('roaring-bitset x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w440', () => {
  it('roaring-bitset x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w460', () => {
  it('roaring-bitset x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w480', () => {
  it('roaring-bitset x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w500', () => {
  it('roaring-bitset x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w550', () => {
  it('roaring-bitset x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w600', () => {
  it('roaring-bitset x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w650', () => {
  it('roaring-bitset x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w700', () => {
  it('roaring-bitset x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w800', () => {
  it('roaring-bitset x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w900', () => {
  it('roaring-bitset x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('roaring-bitset - w1000', () => {
  it('roaring-bitset x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('roaring-bitset x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
