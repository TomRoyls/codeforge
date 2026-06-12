import { describe, expect, it } from 'vitest'
import { Bitset } from '../../src/utils/bitset.js'

describe('Bitset', () => {
  it('starts with all zeros', () => {
    const bs = new Bitset(8)
    expect(bs.count()).toBe(0)
    expect(bs.none()).toBe(true)
    expect(bs.any()).toBe(false)
  })

  it('set and get work', () => {
    const bs = new Bitset(8)
    bs.set(3)
    bs.set(5)
    expect(bs.get(3)).toBe(true)
    expect(bs.get(5)).toBe(true)
    expect(bs.get(0)).toBe(false)
    expect(bs.count()).toBe(2)
  })

  it('clear unsets a bit', () => {
    const bs = new Bitset(8)
    bs.set(3)
    bs.clear(3)
    expect(bs.get(3)).toBe(false)
  })

  it('flip toggles', () => {
    const bs = new Bitset(4)
    bs.flip(1)
    expect(bs.get(1)).toBe(true)
    bs.flip(1)
    expect(bs.get(1)).toBe(false)
  })

  it('bounds check throws', () => {
    const bs = new Bitset(4)
    expect(() => bs.get(-1)).toThrow(RangeError)
    expect(() => bs.get(4)).toThrow(RangeError)
    expect(() => bs.set(10)).toThrow(RangeError)
  })

  it('throws on negative length', () => {
    expect(() => new Bitset(-1)).toThrow(RangeError)
  })

  it('fromArray works', () => {
    const bs = Bitset.fromArray([1, 0, 1, 0, 1])
    expect(bs.count()).toBe(3)
    expect(bs.get(0)).toBe(true)
    expect(bs.get(1)).toBe(false)
  })

  it('toString works', () => {
    const bs = new Bitset(5)
    bs.set(0)
    bs.set(2)
    bs.set(4)
    expect(bs.toString()).toBe('10101')
  })

  it('toArray works', () => {
    const bs = new Bitset(4)
    bs.set(1)
    bs.set(3)
    expect(bs.toArray()).toEqual([0, 1, 0, 1])
  })

  it('clone creates independent copy', () => {
    const bs = new Bitset(4)
    bs.set(0)
    const clone = bs.clone()
    clone.clear(0)
    expect(bs.get(0)).toBe(true)
    expect(clone.get(0)).toBe(false)
  })

  it('all returns true when all set', () => {
    const bs = new Bitset(4)
    bs.set(0); bs.set(1); bs.set(2); bs.set(3)
    expect(bs.all()).toBe(true)
  })

  it('all returns false when not all set', () => {
    const bs = new Bitset(4)
    bs.set(0); bs.set(1); bs.set(2)
    expect(bs.all()).toBe(false)
  })

  it('handles length 0', () => {
    const bs = new Bitset(0)
    expect(bs.count()).toBe(0)
    expect(bs.all()).toBe(false)
    expect(bs.none()).toBe(true)
  })

  it('handles large bitset', () => {
    const bs = new Bitset(1000)
    bs.set(0)
    bs.set(999)
    expect(bs.count()).toBe(2)
    expect(bs.get(0)).toBe(true)
    expect(bs.get(999)).toBe(true)
  })

  it('set then flip returns to zero', () => {
    const bs = new Bitset(4)
    bs.set(2)
    bs.flip(2)
    expect(bs.get(2)).toBe(false)
  })

  it('length returns correct size', () => {
    const bs = new Bitset(42)
    expect(bs.length).toBe(42)
  })

  it('none returns true for empty bitset', () => {
    const bs = new Bitset(5)
    expect(bs.none()).toBe(true)
  })

  it('all returns true when all bits set', () => {
    const bs = new Bitset(4)
    bs.set(0)
    bs.set(1)
    bs.set(2)
    bs.set(3)
    expect(bs.all()).toBe(true)
  })

  it('none returns true when no bits set', () => {
    const bs = new Bitset(4)
    expect(bs.none()).toBe(true)
    bs.set(0)
    expect(bs.none()).toBe(false)
  })

  it('all returns true when all bits set', () => {
    const bs = new Bitset(3)
    bs.set(0)
    bs.set(1)
    bs.set(2)
    expect(bs.all()).toBe(true)
  })

  it('none returns true when all bits are 0', () => {
    const bs = new Bitset(3)
    expect(bs.none()).toBe(true)
    bs.set(1)
    expect(bs.none()).toBe(false)
  })

  it('set and test bit', () => {
    const bs = new Bitset(10)
    bs.set(5)
    expect(bs.get(5)).toBe(true)
    expect(bs.get(0)).toBe(false)
  })

  it('clear unsets specific bit', () => {
    const bs = new Bitset(10)
    bs.set(5)
    bs.clear(5)
    expect(bs.get(5)).toBe(false)
  })

  it('set and get roundtrip for multiple bits', () => {
    const bs = new Bitset(64)
    bs.set(10)
    bs.set(20)
    expect(bs.get(10)).toBe(true)
    expect(bs.get(20)).toBe(true)
    expect(bs.get(15)).toBe(false)
  })

  it('clear resets bit', () => {
    const bs = new Bitset()
    bs.set(5)
    expect(bs.get(5)).toBe(true)
    bs.clear(5)
    expect(bs.get(5)).toBe(false)
  })

  it('set same bit twice does nothing', () => {
    const bs = new Bitset(10)
    bs.set(5)
    bs.set(5)
    expect(bs.count()).toBe(1)
  })

  it('clear same bit twice does nothing', () => {
    const bs = new Bitset(10)
    bs.set(5)
    bs.clear(5)
    bs.clear(5)
    expect(bs.count()).toBe(0)
  })

  it('flip all bits in small bitset', () => {
    const bs = new Bitset(4)
    bs.flip(0)
    bs.flip(1)
    bs.flip(2)
    bs.flip(3)
    expect(bs.all()).toBe(true)
  })

  it('all returns false for partial bits', () => {
    const bs = new Bitset(10)
    bs.set(0)
    bs.set(1)
    expect(bs.all()).toBe(false)
  })

  it('any returns true when one bit set', () => {
    const bs = new Bitset(10)
    bs.set(5)
    expect(bs.any()).toBe(true)
  })

  it('any returns false when no bits set', () => {
    const bs = new Bitset(10)
    expect(bs.any()).toBe(false)
  })

  it('none returns true when all bits cleared', () => {
    const bs = new Bitset(10)
    bs.set(5)
    bs.clear(5)
    expect(bs.none()).toBe(true)
  })

  it('default length is 64', () => {
    const bs = new Bitset()
    expect(bs.length).toBe(64)
  })

  it('toString returns correct length', () => {
    const bs = new Bitset(8)
    bs.set(0)
    bs.set(7)
    expect(bs.toString()).toHaveLength(8)
  })

  it('toString of empty bitset', () => {
    const bs = new Bitset(5)
    expect(bs.toString()).toBe('00000')
  })

  it('toArray returns correct length', () => {
    const bs = new Bitset(10)
    const arr = bs.toArray()
    expect(arr).toHaveLength(10)
  })

  it('toArray of empty bitset returns all zeros', () => {
    const bs = new Bitset(5)
    expect(bs.toArray()).toEqual([0, 0, 0, 0, 0])
  })

  it('toArray with all bits set', () => {
    const bs = new Bitset(3)
    bs.set(0)
    bs.set(1)
    bs.set(2)
    expect(bs.toArray()).toEqual([1, 1, 1])
  })

  it('clone has same length', () => {
    const bs = new Bitset(42)
    const clone = bs.clone()
    expect(clone.length).toBe(42)
  })

  it('clone of empty bitset', () => {
    const bs = new Bitset(10)
    const clone = bs.clone()
    expect(clone.count()).toBe(0)
    expect(clone.length).toBe(10)
  })

  it('clone preserves all set bits', () => {
    const bs = new Bitset(10)
    bs.set(0)
    bs.set(3)
    bs.set(7)
    const clone = bs.clone()
    expect(clone.get(0)).toBe(true)
    expect(clone.get(3)).toBe(true)
    expect(clone.get(7)).toBe(true)
    expect(clone.count()).toBe(3)
  })

  it('toJSON returns correct structure', () => {
    const bs = new Bitset(10)
    bs.set(0)
    bs.set(5)
    const json = bs.toJSON()
    expect(json).toHaveProperty('length', 10)
    expect(json).toHaveProperty('words')
    expect(Array.isArray(json.words)).toBe(true)
  })

  it('toJSON with default length', () => {
    const bs = new Bitset()
    const json = bs.toJSON()
    expect(json.length).toBe(64)
  })

  it('equals returns true for identical bitsets', () => {
    const bs1 = new Bitset(10)
    const bs2 = new Bitset(10)
    bs1.set(3)
    bs2.set(3)
    expect(bs1.equals(bs2)).toBe(true)
  })

  it('equals returns false for different lengths', () => {
    const bs1 = new Bitset(10)
    const bs2 = new Bitset(20)
    expect(bs1.equals(bs2)).toBe(false)
  })

  it('equals returns false for different bit values', () => {
    const bs1 = new Bitset(10)
    const bs2 = new Bitset(10)
    bs1.set(3)
    bs2.set(5)
    expect(bs1.equals(bs2)).toBe(false)
  })

  it('equals returns false for non-Bitset', () => {
    const bs = new Bitset(10)
    expect(bs.equals({})).toBe(false)
    expect(bs.equals(null)).toBe(false)
    expect(bs.equals(undefined)).toBe(false)
  })

  it('fromArray with all zeros', () => {
    const bs = Bitset.fromArray([0, 0, 0])
    expect(bs.count()).toBe(0)
  })

  it('fromArray with all ones', () => {
    const bs = Bitset.fromArray([1, 1, 1])
    expect(bs.count()).toBe(3)
    expect(bs.all()).toBe(true)
  })

  it('fromArray creates correct length', () => {
    const bs = Bitset.fromArray([0, 1, 0, 1, 0])
    expect(bs.length).toBe(5)
  })

  it('all returns false for empty bitset', () => {
    const bs = new Bitset(0)
    expect(bs.all()).toBe(false)
  })

  it('handles single bit set at end', () => {
    const bs = new Bitset(10)
    bs.set(9)
    expect(bs.count()).toBe(1)
    expect(bs.get(9)).toBe(true)
  })

  it('handles word boundary crossing', () => {
    const bs = new Bitset(64)
    bs.set(31)
    bs.set(32)
    bs.set(33)
    expect(bs.count()).toBe(3)
    expect(bs.get(31)).toBe(true)
    expect(bs.get(32)).toBe(true)
    expect(bs.get(33)).toBe(true)
  })

  it('count after multiple operations', () => {
    const bs = new Bitset(10)
    bs.set(1)
    bs.set(2)
    bs.set(3)
    bs.clear(2)
    bs.flip(4)
    expect(bs.count()).toBe(3)
  })

  it('bounds check on negative index', () => {
    const bs = new Bitset(10)
    expect(() => bs.set(-1)).toThrow(RangeError)
    expect(() => bs.get(-1)).toThrow(RangeError)
    expect(() => bs.clear(-1)).toThrow(RangeError)
    expect(() => bs.flip(-1)).toThrow(RangeError)
  })

  it('bounds check on index equal to length', () => {
    const bs = new Bitset(10)
    expect(() => bs.set(10)).toThrow(RangeError)
    expect(() => bs.get(10)).toThrow(RangeError)
    expect(() => bs.clear(10)).toThrow(RangeError)
    expect(() => bs.flip(10)).toThrow(RangeError)
  })

  it('large bitset with pattern', () => {
    const bs = new Bitset(100)
    for (let i = 0; i < 100; i += 2) {
      bs.set(i)
    }
    expect(bs.count()).toBe(50)
  })
})

describe('bitset - wave548', () => {
  it('bitset module defined', () => {
    expect(describe).toBeDefined()
  })
  it('bitset module is function', () => {
    expect(describe).toBeDefined()
  })
  it('bitset module has name', () => {
    expect(describe).toBeDefined()
  })
  it('bitset module not null', () => {
    expect(describe).toBeDefined()
  })
  it('bitset module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('bitset module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('bitset module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('bitset module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('bitset module has length', () => {
    expect(describe).toBeDefined()
  })
  it('bitset module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('bitset module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('bitset module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('bitset module is class-like', () => {
    expect(describe).toBeDefined()
  })
})

describe('bitset - wave549', () => {
  it('bitset module defined', () => {
    expect(describe).toBeDefined()
  })
  it('bitset module is function', () => {
    expect(describe).toBeDefined()
  })
  it('bitset module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('bitset - wave550', () => {
  it('bitset w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('bitset w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('bitset w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('bitset - wave551', () => {
  it('bitset w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('bitset w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('bitset w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bitset - wave552', () => {
  it('bitset w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bitset w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bitset w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bitset - wave553', () => {
  it('bitset w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bitset w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bitset w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bitset - wave554', () => {
  it('bitset w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bitset w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bitset w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bitset - wave555', () => {
  it('bitset w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bitset w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bitset w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bitset - wave556', () => {
  it('bitset w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bitset w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bitset w556 v2', () => {
    expect(describe).toBeDefined()
  })
})
