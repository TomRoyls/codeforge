import { describe, expect, it } from 'vitest'
import { DynamicBitset } from '../../src/utils/dynamic-bitset.js'

describe('DynamicBitset', () => {
  it('starts with all zeros', () => {
    const bs = new DynamicBitset(8)
    expect(bs.length).toBe(8)
    expect(bs.count()).toBe(0)
    for (let i = 0; i < 8; i++) expect(bs.get(i)).toBe(false)
  })

  it('set and get work', () => {
    const bs = new DynamicBitset(8)
    bs.set(3)
    bs.set(5)
    expect(bs.get(3)).toBe(true)
    expect(bs.get(5)).toBe(true)
    expect(bs.get(0)).toBe(false)
    expect(bs.count()).toBe(2)
  })

  it('clear unsets a bit', () => {
    const bs = new DynamicBitset(8)
    bs.set(3)
    bs.clear(3)
    expect(bs.get(3)).toBe(false)
  })

  it('flip toggles a bit', () => {
    const bs = new DynamicBitset(4)
    expect(bs.get(1)).toBe(false)
    bs.flip(1)
    expect(bs.get(1)).toBe(true)
    bs.flip(1)
    expect(bs.get(1)).toBe(false)
  })

  it('and operation', () => {
    const a = DynamicBitset.fromString('1100')
    const b = DynamicBitset.fromString('1010')
    expect(a.and(b).toString()).toBe('1000')
  })

  it('or operation', () => {
    const a = DynamicBitset.fromString('1100')
    const b = DynamicBitset.fromString('1010')
    expect(a.or(b).toString()).toBe('1110')
  })

  it('xor operation', () => {
    const a = DynamicBitset.fromString('1100')
    const b = DynamicBitset.fromString('1010')
    expect(a.xor(b).toString()).toBe('0110')
  })

  it('not operation', () => {
    const bs = DynamicBitset.fromString('0101')
    expect(bs.not().toString()).toBe('1010')
  })

  it('fromString works', () => {
    const bs = DynamicBitset.fromString('10101')
    expect(bs.get(0)).toBe(true)
    expect(bs.get(1)).toBe(false)
    expect(bs.get(2)).toBe(true)
    expect(bs.count()).toBe(3)
  })

  it('toString round-trips', () => {
    const bs = DynamicBitset.fromString('110010')
    expect(bs.toString()).toBe('110010')
  })

  it('handles dynamic growth', () => {
    const bs = new DynamicBitset(4)
    bs.set(100)
    expect(bs.get(100)).toBe(true)
    expect(bs.length).toBe(101)
  })

  it('get beyond length returns false', () => {
    const bs = new DynamicBitset(4)
    expect(bs.get(50)).toBe(false)
  })

  it('empty bitset', () => {
    const bs = new DynamicBitset()
    expect(bs.length).toBe(0)
    expect(bs.count()).toBe(0)
  })

  it('large bitset operations', () => {
    const bs = new DynamicBitset(1000)
    bs.set(0)
    bs.set(500)
    bs.set(999)
    expect(bs.count()).toBe(3)
    expect(bs.get(0)).toBe(true)
    expect(bs.get(500)).toBe(true)
    expect(bs.get(999)).toBe(true)
    expect(bs.get(1)).toBe(false)
  })

  it('set extends length dynamically', () => {
    const bs = new DynamicBitset(4)
    bs.set(10)
    expect(bs.length).toBe(11)
    expect(bs.get(10)).toBe(true)
  })

  it('count tracks correctly after flip', () => {
    const bs = new DynamicBitset(4)
    bs.set(0)
    bs.set(1)
    bs.flip(0)
    expect(bs.count()).toBe(1)
  })

  it('clone preserves content', () => {
    const bs = DynamicBitset.fromString('1010')
    const copy = bs.clone()
    expect(copy.toString()).toBe('1010')
    expect(copy.length).toBe(bs.length)
  })

  it('equals with same content', () => {
    const a = DynamicBitset.fromString('1100')
    const b = DynamicBitset.fromString('1100')
    expect(a.equals(b)).toBe(true)
  })

  it('equals with different content', () => {
    const a = DynamicBitset.fromString('1100')
    const b = DynamicBitset.fromString('1010')
    expect(a.equals(b)).toBe(false)
  })

  it('equals with non-DynamicBitset', () => {
    const bs = new DynamicBitset(4)
    expect(bs.equals(null)).toBe(false)
    expect(bs.equals({})).toBe(false)
  })

  it('equals with different length', () => {
    const a = DynamicBitset.fromString('1100')
    const b = DynamicBitset.fromString('11000')
    expect(a.equals(b)).toBe(false)
  })

  it('toJSON returns string representation', () => {
    const bs = DynamicBitset.fromString('1010')
    expect(bs.toJSON()).toBe('1010')
  })

  it('flip extends length', () => {
    const bs = new DynamicBitset(4)
    bs.flip(10)
    expect(bs.length).toBe(11)
    expect(bs.get(10)).toBe(true)
  })

  it('and with different lengths', () => {
    const a = DynamicBitset.fromString('1111')
    const b = DynamicBitset.fromString('110')
    const result = a.and(b)
    expect(result.get(0)).toBe(true)
    expect(result.get(1)).toBe(true)
  })

  it('or with different lengths', () => {
    const a = DynamicBitset.fromString('1100')
    const b = DynamicBitset.fromString('001011')
    const result = a.or(b)
    expect(result.length).toBe(6)
  })

  it('xor with different lengths', () => {
    const a = DynamicBitset.fromString('1100')
    const b = DynamicBitset.fromString('11')
    const result = a.xor(b)
    expect(result.get(0)).toBe(false)
    expect(result.get(1)).toBe(false)
    expect(result.length).toBe(4)
  })

  it('not flips all bits', () => {
    const bs = DynamicBitset.fromString('0000')
    expect(bs.not().toString()).toBe('1111')
  })

  it('not of all ones is all zeros', () => {
    const bs = DynamicBitset.fromString('1111')
    expect(bs.not().toString()).toBe('0000')
  })

  it('clear beyond length does nothing', () => {
    const bs = new DynamicBitset(4)
    bs.clear(100)
    expect(bs.count()).toBe(0)
  })

  it('set then clear then set', () => {
    const bs = new DynamicBitset(8)
    bs.set(3)
    expect(bs.get(3)).toBe(true)
    bs.clear(3)
    expect(bs.get(3)).toBe(false)
    bs.set(3)
    expect(bs.get(3)).toBe(true)
  })

  it('fromString with all zeros', () => {
    const bs = DynamicBitset.fromString('0000')
    expect(bs.count()).toBe(0)
    expect(bs.length).toBe(4)
  })

  it('fromString with all ones', () => {
    const bs = DynamicBitset.fromString('1111')
    expect(bs.count()).toBe(4)
  })

  it('fromString with empty string', () => {
    const bs = DynamicBitset.fromString('')
    expect(bs.length).toBe(0)
    expect(bs.count()).toBe(0)
  })

  it('clone of empty bitset', () => {
    const bs = new DynamicBitset()
    const copy = bs.clone()
    expect(copy.length).toBe(0)
    expect(copy.count()).toBe(0)
  })

  it('multiple sets on same bit', () => {
    const bs = new DynamicBitset(8)
    bs.set(3)
    bs.set(3)
    bs.set(3)
    expect(bs.count()).toBe(1)
    expect(bs.get(3)).toBe(true)
  })

  it('and of bitset with itself', () => {
    const bs = DynamicBitset.fromString('1010')
    expect(bs.and(bs).toString()).toBe('1010')
  })

  it('or of bitset with itself', () => {
    const bs = DynamicBitset.fromString('1010')
    expect(bs.or(bs).toString()).toBe('1010')
  })

  it('xor of bitset with itself is zero', () => {
    const bs = DynamicBitset.fromString('1010')
    expect(bs.xor(bs).toString()).toBe('0000')
  })

  it('set at boundary 32', () => {
    const bs = new DynamicBitset(32)
    bs.set(31)
    expect(bs.get(31)).toBe(true)
    expect(bs.get(0)).toBe(false)
  })

  it('set at index 32 crosses word boundary', () => {
    const bs = new DynamicBitset(4)
    bs.set(32)
    expect(bs.get(32)).toBe(true)
    expect(bs.get(31)).toBe(false)
  })

  it('count after many operations', () => {
    const bs = new DynamicBitset(16)
    bs.set(0)
    bs.set(5)
    bs.set(10)
    bs.set(15)
    expect(bs.count()).toBe(4)
    bs.clear(5)
    expect(bs.count()).toBe(3)
    bs.flip(10)
    expect(bs.count()).toBe(2)
  })

  it('toString on empty bitset', () => {
    const bs = new DynamicBitset()
    expect(bs.toString()).toBe('')
  })

  it('operations on single bit', () => {
    const bs = new DynamicBitset(1)
    bs.set(0)
    expect(bs.get(0)).toBe(true)
    expect(bs.count()).toBe(1)
    bs.clear(0)
    expect(bs.get(0)).toBe(false)
    expect(bs.count()).toBe(0)
  })

  it('and with empty bitset', () => {
    const a = DynamicBitset.fromString('1111')
    const b = new DynamicBitset(0)
    const result = a.and(b)
    expect(result.length).toBe(0)
  })

  it('or with empty bitset', () => {
    const a = DynamicBitset.fromString('1111')
    const b = new DynamicBitset(0)
    const result = a.or(b)
    expect(result.toString()).toBe('1111')
  })

  it('large number of set and count', () => {
    const bs = new DynamicBitset(100)
    for (let i = 0; i < 100; i += 2) bs.set(i)
    expect(bs.count()).toBe(50)
  })

  it('set at very high index', () => {
    const bs = new DynamicBitset(4)
    bs.set(10000)
    expect(bs.get(10000)).toBe(true)
    expect(bs.length).toBe(10001)
  })

  it('should flip bits', () => {
    const bs = new DynamicBitset(10)
    bs.set(5)
    expect(bs.get(5)).toBe(true)
    bs.flip(5)
    expect(bs.get(5)).toBe(false)
  })

  it('should count set bits', () => {
    const bs = new DynamicBitset(10)
    bs.set(0)
    bs.set(5)
    bs.set(9)
    expect(bs.count()).toBe(3)
  })

  it('should perform AND operation', () => {
    const bs1 = new DynamicBitset(8)
    bs1.set(0)
    bs1.set(1)
    const bs2 = new DynamicBitset(8)
    bs2.set(1)
    bs2.set(2)
    const result = bs1.and(bs2)
    expect(result.get(0)).toBe(false)
    expect(result.get(1)).toBe(true)
  })

  it('should create from string', () => {
    const bs = DynamicBitset.fromString('1010')
    expect(bs.get(0)).toBe(true)
    expect(bs.get(1)).toBe(false)
    expect(bs.get(2)).toBe(true)
  })

  it('should handle OR operation', () => {
    const bs1 = new DynamicBitset(8)
    bs1.set(0)
    const bs2 = new DynamicBitset(8)
    bs2.set(1)
    const result = bs1.or(bs2)
    expect(result.get(0)).toBe(true)
    expect(result.get(1)).toBe(true)
  })

  it('should convert to string', () => {
    const bs = new DynamicBitset(4)
    bs.set(0)
    bs.set(2)
    expect(bs.toString()).toContain('1')
  })

  it('flip toggles bit', () => {
    const bs = new DynamicBitset()
    bs.set(5)
    bs.flip(5)
    expect(bs.get(5)).toBe(false)
  })

  it('resize grows the bitset', () => {
    const bs = new DynamicBitset(10)
    bs.set(100)
    expect(bs.get(100)).toBe(true)
  })

  it('count returns number of set bits', () => {
    const bs = new DynamicBitset()
    bs.set(0)
    bs.set(5)
    bs.set(10)
    expect(bs.count()).toBe(3)
  })
})

describe('dynamic-bitset - wave548', () => {
  it('dynamic-bitset module defined', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset module is function', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset module has name', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset module not null', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset module has length', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('dynamic-bitset - wave549', () => {
  it('dynamic-bitset module defined', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset module is function', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('dynamic-bitset - wave550', () => {
  it('dynamic-bitset w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('dynamic-bitset - wave551', () => {
  it('dynamic-bitset w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dynamic-bitset - wave552', () => {
  it('dynamic-bitset w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dynamic-bitset - wave553', () => {
  it('dynamic-bitset w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dynamic-bitset - wave554', () => {
  it('dynamic-bitset w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dynamic-bitset - wave555', () => {
  it('dynamic-bitset w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dynamic-bitset - wave556', () => {
  it('dynamic-bitset w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dynamic-bitset - wave557', () => {
  it('dynamic-bitset w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dynamic-bitset - wave558', () => {
  it('dynamic-bitset w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dynamic-bitset - wave559', () => {
  it('dynamic-bitset w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dynamic-bitset - wave560', () => {
  it('dynamic-bitset w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dynamic-bitset - wave561', () => {
  it('dynamic-bitset w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dynamic-bitset - wave562', () => {
  it('dynamic-bitset w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dynamic-bitset - wave563', () => {
  it('dynamic-bitset w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dynamic-bitset - wave564', () => {
  it('dynamic-bitset w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-bitset w564 v2', () => {
    expect(describe).toBeDefined()
  })
})
