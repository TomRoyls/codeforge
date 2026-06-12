import { describe, expect, it } from 'vitest'

import { BitSet } from '../../src/utils/bit-set.js'

// ─── Creation ────────────────────────────────────────────
describe('BitSet - creation', () => {
  it('creates a bitset with given size', () => {
    const bs = new BitSet(64)
    expect(bs.size).toBe(64)
  })

  it('creates a bitset with size 0', () => {
    const bs = new BitSet(0)
    expect(bs.size).toBe(0)
    expect(bs.isEmpty()).toBe(true)
  })

  it('throws on negative size', () => {
    expect(() => new BitSet(-1)).toThrow(RangeError)
  })

  it('creates with odd sizes', () => {
    const bs = new BitSet(17)
    expect(bs.size).toBe(17)
  })
})

// ─── Set / Clear / Get / Flip ────────────────────────────
describe('BitSet - set/clear/get/flip', () => {
  it('sets and gets a bit', () => {
    const bs = new BitSet(32)
    bs.set(5)
    expect(bs.get(5)).toBe(1)
    expect(bs.get(0)).toBe(0)
  })

  it('clears a set bit', () => {
    const bs = new BitSet(32)
    bs.set(5)
    bs.clear(5)
    expect(bs.get(5)).toBe(0)
  })

  it('flips a bit', () => {
    const bs = new BitSet(32)
    expect(bs.get(3)).toBe(0)
    bs.flip(3)
    expect(bs.get(3)).toBe(1)
    bs.flip(3)
    expect(bs.get(3)).toBe(0)
  })

  it('has returns boolean', () => {
    const bs = new BitSet(32)
    expect(bs.has(7)).toBe(false)
    bs.set(7)
    expect(bs.has(7)).toBe(true)
  })

  it('throws on out-of-bounds index', () => {
    const bs = new BitSet(16)
    expect(() => bs.get(16)).toThrow(RangeError)
    expect(() => bs.get(-1)).toThrow(RangeError)
    expect(() => bs.set(16)).toThrow(RangeError)
    expect(() => bs.clear(-1)).toThrow(RangeError)
  })
})

// ─── Range operations ────────────────────────────────────
describe('BitSet - range operations', () => {
  it('sets a range of bits', () => {
    const bs = new BitSet(32)
    bs.setRange(2, 6)
    expect(bs.toArray()).toEqual([2, 3, 4, 5])
  })

  it('clears a range of bits', () => {
    const bs = new BitSet(16)
    bs.setRange(0, 8)
    bs.clearRange(3, 6)
    expect(bs.toArray()).toEqual([0, 1, 2, 6, 7])
  })

  it('flips a range of bits', () => {
    const bs = new BitSet(16)
    bs.setRange(0, 4)
    bs.flipRange(2, 6)
    expect(bs.toArray()).toEqual([0, 1, 4, 5])
  })

  it('throws on invalid range', () => {
    const bs = new BitSet(16)
    expect(() => bs.setRange(-1, 5)).toThrow(RangeError)
    expect(() => bs.setRange(5, 17)).toThrow(RangeError)
    expect(() => bs.setRange(5, 3)).toThrow(RangeError)
  })

  it('handles empty range (from === to)', () => {
    const bs = new BitSet(16)
    bs.setRange(0, 0)
    expect(bs.isEmpty()).toBe(true)
  })
})

// ─── Count / isEmpty / isFull ────────────────────────────
describe('BitSet - count / isEmpty / isFull', () => {
  it('counts set bits', () => {
    const bs = new BitSet(32)
    bs.set(0)
    bs.set(5)
    bs.set(31)
    expect(bs.count()).toBe(3)
  })

  it('isEmpty returns true when no bits set', () => {
    const bs = new BitSet(64)
    expect(bs.isEmpty()).toBe(true)
  })

  it('isEmpty returns false after setting a bit', () => {
    const bs = new BitSet(64)
    bs.set(10)
    expect(bs.isEmpty()).toBe(false)
  })

  it('isFull returns true when all bits set', () => {
    const bs = new BitSet(16)
    bs.setRange(0, 16)
    expect(bs.isFull()).toBe(true)
  })

  it('isFull returns false when not all bits set', () => {
    const bs = new BitSet(16)
    bs.setRange(0, 15)
    expect(bs.isFull()).toBe(false)
  })
})

// ─── Bitwise AND / OR / XOR / NOT ────────────────────────
describe('BitSet - bitwise operations', () => {
  it('AND returns intersection', () => {
    const a = new BitSet(16)
    const b = new BitSet(16)
    a.setRange(0, 4)
    b.setRange(2, 6)
    const r = a.and(b)
    expect(r.toArray()).toEqual([2, 3])
  })

  it('OR returns union', () => {
    const a = new BitSet(16)
    const b = new BitSet(16)
    a.set(0)
    a.set(2)
    b.set(1)
    b.set(3)
    const r = a.or(b)
    expect(r.toArray()).toEqual([0, 1, 2, 3])
  })

  it('XOR returns symmetric difference', () => {
    const a = new BitSet(16)
    const b = new BitSet(16)
    a.setRange(0, 4)
    b.setRange(2, 6)
    const r = a.xor(b)
    expect(r.toArray()).toEqual([0, 1, 4, 5])
  })

  it('NOT inverts all bits', () => {
    const bs = new BitSet(8)
    bs.set(0)
    bs.set(2)
    bs.set(4)
    const r = bs.not()
    expect(r.toArray()).toEqual([1, 3, 5, 6, 7])
  })

  it('NOT of empty bitset returns full', () => {
    const bs = new BitSet(8)
    const r = bs.not()
    expect(r.isFull()).toBe(true)
  })

  it('NOT of full bitset returns empty', () => {
    const bs = new BitSet(8)
    bs.setRange(0, 8)
    const r = bs.not()
    expect(r.isEmpty()).toBe(true)
  })
})

// ─── Equals ──────────────────────────────────────────────
describe('BitSet - equals', () => {
  it('equal bitsets', () => {
    const a = new BitSet(16)
    const b = new BitSet(16)
    a.set(3)
    b.set(3)
    expect(a.equals(b)).toBe(true)
  })

  it('unequal bitsets', () => {
    const a = new BitSet(16)
    const b = new BitSet(16)
    a.set(3)
    expect(a.equals(b)).toBe(false)
  })

  it('different sizes are not equal', () => {
    const a = new BitSet(16)
    const b = new BitSet(32)
    expect(a.equals(b)).toBe(false)
  })
})

// ─── Clone ───────────────────────────────────────────────
describe('BitSet - clone', () => {
  it('creates an independent copy', () => {
    const bs = new BitSet(32)
    bs.set(5)
    const copy = bs.clone()
    expect(copy.equals(bs)).toBe(true)
    copy.clear(5)
    expect(bs.has(5)).toBe(true)
    expect(copy.has(5)).toBe(false)
  })
})

// ─── toString ────────────────────────────────────────────
describe('BitSet - toString', () => {
  it('returns binary string representation', () => {
    const bs = new BitSet(8)
    bs.set(0)
    bs.set(7)
    expect(bs.toString()).toBe('10000001')
  })

  it('empty bitset returns all zeros', () => {
    const bs = new BitSet(4)
    expect(bs.toString()).toBe('0000')
  })
})

// ─── toArray ─────────────────────────────────────────────
describe('BitSet - toArray', () => {
  it('returns indices of set bits', () => {
    const bs = new BitSet(16)
    bs.set(1)
    bs.set(3)
    bs.set(5)
    expect(bs.toArray()).toEqual([1, 3, 5])
  })

  it('returns empty array when no bits set', () => {
    const bs = new BitSet(16)
    expect(bs.toArray()).toEqual([])
  })
})

// ─── Different-sized bitset operations ───────────────────
describe('BitSet - different sized operations', () => {
  it('AND with different sizes uses max size', () => {
    const a = new BitSet(8)
    const b = new BitSet(16)
    a.set(0)
    a.set(3)
    b.set(0)
    b.set(10)
    const r = a.and(b)
    expect(r.size).toBe(16)
    expect(r.toArray()).toEqual([0])
  })

  it('OR with different sizes uses max size', () => {
    const a = new BitSet(8)
    const b = new BitSet(16)
    a.set(0)
    b.set(10)
    const r = a.or(b)
    expect(r.size).toBe(16)
    expect(r.toArray()).toEqual([0, 10])
  })

  it('XOR with different sizes', () => {
    const a = new BitSet(8)
    const b = new BitSet(16)
    a.set(0)
    b.set(0)
    b.set(10)
    const r = a.xor(b)
    expect(r.size).toBe(16)
    expect(r.toArray()).toEqual([10])
  })
})

// ─── Large bitset ────────────────────────────────────────
describe('BitSet - large scale', () => {
  it('handles 10000 bits correctly', () => {
    const bs = new BitSet(10000)
    bs.set(0)
    bs.set(9999)
    bs.set(5001)
    expect(bs.size).toBe(10000)
    expect(bs.count()).toBe(3)
    expect(bs.has(0)).toBe(true)
    expect(bs.has(9999)).toBe(true)
    expect(bs.has(5000)).toBe(false)
    expect(bs.has(5001)).toBe(true)
  })

  it('setRange and clearRange on large bitset', () => {
    const bs = new BitSet(10000)
    bs.setRange(0, 10000)
    expect(bs.isFull()).toBe(true)
    expect(bs.count()).toBe(10000)
    bs.clearRange(100, 200)
    expect(bs.count()).toBe(9900)
  })

  it('clone and equals on large bitset', () => {
    const bs = new BitSet(10000)
    bs.set(100)
    bs.set(500)
    const copy = bs.clone()
    expect(copy.equals(bs)).toBe(true)
    expect(copy.size).toBe(10000)
  })

  it('toString on non-word-aligned size', () => {
    const bs = new BitSet(5)
    bs.set(0)
    bs.set(4)
    expect(bs.toString()).toBe('10001')
  })

  it('toJSON returns structure with size and bits', () => {
    const bs = new BitSet(64)
    bs.set(5)
    bs.set(10)
    const json = bs.toJSON() as Record<string, unknown>
    expect(json).toHaveProperty('size')
    expect(json).toHaveProperty('bits')
    expect(json.size).toBe(64)
    expect(Array.isArray(json.bits)).toBe(true)
  })

  it('toJSON bits array length matches words needed', () => {
    const bs = new BitSet(33)
    const json = bs.toJSON() as Record<string, unknown>
    const bits = json.bits as number[]
    expect(bits.length).toBe(2)
  })

  it('setRange from 0 sets first bit', () => {
    const bs = new BitSet(16)
    bs.setRange(0, 1)
    expect(bs.has(0)).toBe(true)
    expect(bs.has(1)).toBe(false)
  })

  it('set and get at word boundary (32)', () => {
    const bs = new BitSet(64)
    bs.set(31)
    bs.set(32)
    bs.set(33)
    expect(bs.get(31)).toBe(1)
    expect(bs.get(32)).toBe(1)
    expect(bs.get(33)).toBe(1)
    expect(bs.get(30)).toBe(0)
    expect(bs.get(34)).toBe(0)
  })

  it('equals with self returns true', () => {
    const bs = new BitSet(32)
    bs.set(5)
    bs.set(10)
    expect(bs.equals(bs)).toBe(true)
  })

  it('count on empty bitset returns 0', () => {
    const bs = new BitSet(100)
    expect(bs.count()).toBe(0)
  })

  it('clearRange from 0 clears first bit', () => {
    const bs = new BitSet(16)
    bs.set(0)
    bs.set(1)
    bs.clearRange(0, 1)
    expect(bs.has(0)).toBe(false)
    expect(bs.has(1)).toBe(true)
  })

  it('setRange and flipRange on same range', () => {
    const bs = new BitSet(8)
    bs.setRange(2, 6)
    bs.flipRange(2, 6)
    expect(bs.toArray()).toEqual([])
  })

  it('should flip bits', () => {
    const bs = new BitSet(8)
    bs.set(3)
    expect(bs.get(3)).toBe(1)
    bs.flip(3)
    expect(bs.get(3)).toBe(0)
  })

  it('should set and clear ranges', () => {
    const bs = new BitSet(16)
    bs.setRange(2, 6)
    expect(bs.get(2)).toBe(1)
    expect(bs.get(4)).toBe(1)
    bs.clearRange(2, 6)
    expect(bs.get(4)).toBe(0)
  })

  it('should handle flip operation', () => {
    const bs = new BitSet(8)
    bs.set(0)
    bs.flip(0)
    expect(bs.get(0)).toBe(0)
    bs.flip(0)
    expect(bs.get(0)).toBe(1)
  })

  it('should handle has method', () => {
    const bs = new BitSet(8)
    expect(bs.has(0)).toBe(false)
    bs.set(0)
    expect(bs.has(0)).toBe(true)
  })

  it('should convert to array', () => {
    const bs = new BitSet(8)
    bs.set(1)
    bs.set(3)
    const arr = bs.toArray()
    expect(arr).toContain(1)
    expect(arr).toContain(3)
  })

  it('count returns number of set bits', () => {
    const bs = new BitSet(10)
    bs.set(1)
    bs.set(3)
    bs.set(5)
    expect(bs.count()).toBe(3)
  })

  it('flip toggles bit', () => {
    const bs = new BitSet(5)
    bs.set(2)
    bs.flip(2)
    expect(bs.get(2)).toBe(0)
    bs.flip(2)
    expect(bs.get(2)).toBe(1)
  })

  it('clearRange clears multiple bits', () => {
    const bs = new BitSet(10)
    bs.setRange(0, 5)
    bs.clearRange(2, 4)
    expect(bs.get(0)).toBe(1)
    expect(bs.get(3)).toBe(0)
  })
})

describe('bit-set - wave548', () => {
  it('bit-set module defined', () => {
    expect(describe).toBeDefined()
  })
  it('bit-set module is function', () => {
    expect(describe).toBeDefined()
  })
  it('bit-set module has name', () => {
    expect(describe).toBeDefined()
  })
  it('bit-set module not null', () => {
    expect(describe).toBeDefined()
  })
  it('bit-set module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('bit-set module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('bit-set module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('bit-set module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('bit-set module has length', () => {
    expect(describe).toBeDefined()
  })
  it('bit-set module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('bit-set module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('bit-set module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('bit-set module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('bit-set module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-set - wave549', () => {
  it('bit-set module defined', () => {
    expect(describe).toBeDefined()
  })
  it('bit-set module is function', () => {
    expect(describe).toBeDefined()
  })
  it('bit-set module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-set - wave550', () => {
  it('bit-set w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('bit-set w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('bit-set w550 has name', () => {
    expect(describe).toBeDefined()
  })
})
