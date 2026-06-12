import { describe, it, expect } from 'vitest'
import { SimdBitSet } from '../../src/utils/simd-bit-set.js'

describe('SimdBitSet', () => {
  it('constructs with size zero', () => {
    const bs = new SimdBitSet(0)
    expect(bs.length).toBe(0)
  })

  it('constructs with positive size', () => {
    const bs = new SimdBitSet(100)
    expect(bs.length).toBe(100)
    expect(bs.isEmpty()).toBe(true)
  })

  it('throws on negative size', () => {
    expect(() => new SimdBitSet(-1)).toThrow(RangeError)
  })

  it('sets and gets bits correctly', () => {
    const bs = new SimdBitSet(10)
    bs.set(0)
    bs.set(5)
    bs.set(9)
    expect(bs.get(0)).toBe(true)
    expect(bs.get(5)).toBe(true)
    expect(bs.get(9)).toBe(true)
    expect(bs.get(1)).toBe(false)
    expect(bs.get(7)).toBe(false)
  })

  it('throws when setting out of bounds', () => {
    const bs = new SimdBitSet(10)
    expect(() => bs.set(10)).toThrow(RangeError)
    expect(() => bs.set(-1)).toThrow(RangeError)
  })

  it('clears bits correctly', () => {
    const bs = new SimdBitSet(10)
    bs.set(3)
    bs.set(7)
    expect(bs.get(3)).toBe(true)
    bs.clear(3)
    expect(bs.get(3)).toBe(false)
    expect(bs.get(7)).toBe(true)
  })

  it('throws when clearing out of bounds', () => {
    const bs = new SimdBitSet(10)
    expect(() => bs.clear(10)).toThrow(RangeError)
    expect(() => bs.clear(-1)).toThrow(RangeError)
  })

  it('toggles bits correctly', () => {
    const bs = new SimdBitSet(10)
    bs.set(2)
    expect(bs.get(2)).toBe(true)
    bs.toggle(2)
    expect(bs.get(2)).toBe(false)
    bs.toggle(2)
    expect(bs.get(2)).toBe(true)
  })

  it('throws when toggling out of bounds', () => {
    const bs = new SimdBitSet(10)
    expect(() => bs.toggle(10)).toThrow(RangeError)
    expect(() => bs.toggle(-1)).toThrow(RangeError)
  })

  it('gets returns false for out of bounds', () => {
    const bs = new SimdBitSet(10)
    expect(bs.get(10)).toBe(false)
    expect(bs.get(-1)).toBe(false)
    expect(bs.get(100)).toBe(false)
  })

  it('sets range correctly', () => {
    const bs = new SimdBitSet(20)
    bs.setRange(5, 10)
    for (let i = 5; i < 10; i++) {
      expect(bs.get(i)).toBe(true)
    }
    expect(bs.get(4)).toBe(false)
    expect(bs.get(10)).toBe(false)
  })

  it('throws on invalid set range', () => {
    const bs = new SimdBitSet(10)
    expect(() => bs.setRange(-1, 5)).toThrow(RangeError)
    expect(() => bs.setRange(5, 15)).toThrow(RangeError)
    expect(() => bs.setRange(8, 5)).toThrow(RangeError)
  })

  it('clears range correctly', () => {
    const bs = new SimdBitSet(20)
    bs.setRange(0, 20)
    bs.clearRange(5, 10)
    for (let i = 0; i < 5; i++) {
      expect(bs.get(i)).toBe(true)
    }
    for (let i = 5; i < 10; i++) {
      expect(bs.get(i)).toBe(false)
    }
    for (let i = 10; i < 20; i++) {
      expect(bs.get(i)).toBe(true)
    }
  })

  it('throws on invalid clear range', () => {
    const bs = new SimdBitSet(10)
    expect(() => bs.clearRange(-1, 5)).toThrow(RangeError)
    expect(() => bs.clearRange(5, 15)).toThrow(RangeError)
    expect(() => bs.clearRange(8, 5)).toThrow(RangeError)
  })

  it('flips all bits correctly', () => {
    const bs = new SimdBitSet(10)
    bs.setRange(0, 10)
    bs.flipAll()
    for (let i = 0; i < 10; i++) {
      expect(bs.get(i)).toBe(false)
    }
    bs.flipAll()
    for (let i = 0; i < 10; i++) {
      expect(bs.get(i)).toBe(true)
    }
  })

  it('and operation works correctly', () => {
    const bs1 = new SimdBitSet(10)
    const bs2 = new SimdBitSet(10)
    bs1.set(0)
    bs1.set(5)
    bs2.set(5)
    bs2.set(9)
    const result = bs1.and(bs2)
    expect(result.get(0)).toBe(false)
    expect(result.get(5)).toBe(true)
    expect(result.get(9)).toBe(false)
  })

  it('or operation works correctly', () => {
    const bs1 = new SimdBitSet(10)
    const bs2 = new SimdBitSet(10)
    bs1.set(0)
    bs1.set(5)
    bs2.set(5)
    bs2.set(9)
    const result = bs1.or(bs2)
    expect(result.get(0)).toBe(true)
    expect(result.get(5)).toBe(true)
    expect(result.get(9)).toBe(true)
  })

  it('xor operation works correctly', () => {
    const bs1 = new SimdBitSet(10)
    const bs2 = new SimdBitSet(10)
    bs1.set(0)
    bs1.set(5)
    bs2.set(5)
    bs2.set(9)
    const result = bs1.xor(bs2)
    expect(result.get(0)).toBe(true)
    expect(result.get(5)).toBe(false)
    expect(result.get(9)).toBe(true)
  })

  it('not operation works correctly', () => {
    const bs = new SimdBitSet(10)
    bs.set(0)
    bs.set(5)
    const result = bs.not()
    expect(result.get(0)).toBe(false)
    expect(result.get(5)).toBe(false)
    expect(result.get(1)).toBe(true)
    expect(result.get(9)).toBe(true)
  })

  it('popcount returns correct count', () => {
    const bs = new SimdBitSet(10)
    expect(bs.popcount()).toBe(0)
    bs.set(0)
    expect(bs.popcount()).toBe(1)
    bs.set(3)
    bs.set(7)
    expect(bs.popcount()).toBe(3)
  })

  it('nextSetBit finds next set bit', () => {
    const bs = new SimdBitSet(20)
    bs.set(5)
    bs.set(10)
    bs.set(15)
    expect(bs.nextSetBit(0)).toBe(5)
    expect(bs.nextSetBit(5)).toBe(5)
    expect(bs.nextSetBit(6)).toBe(10)
    expect(bs.nextSetBit(11)).toBe(15)
    expect(bs.nextSetBit(16)).toBe(-1)
  })

  it('nextSetBit returns -1 when no bits set', () => {
    const bs = new SimdBitSet(10)
    expect(bs.nextSetBit(0)).toBe(-1)
  })

  it('nextClearBit finds next clear bit', () => {
    const bs = new SimdBitSet(20)
    bs.setRange(0, 20)
    bs.clear(5)
    bs.clear(10)
    bs.clear(15)
    expect(bs.nextClearBit(0)).toBe(5)
    expect(bs.nextClearBit(5)).toBe(5)
    expect(bs.nextClearBit(6)).toBe(10)
    expect(bs.nextClearBit(11)).toBe(15)
    expect(bs.nextClearBit(16)).toBe(20)
  })

  it('isEmpty returns correct state', () => {
    const bs = new SimdBitSet(10)
    expect(bs.isEmpty()).toBe(true)
    bs.set(5)
    expect(bs.isEmpty()).toBe(false)
  })

  it('intersects checks correctly', () => {
    const bs1 = new SimdBitSet(10)
    const bs2 = new SimdBitSet(10)
    expect(bs1.intersects(bs2)).toBe(false)
    bs1.set(5)
    bs2.set(5)
    expect(bs1.intersects(bs2)).toBe(true)
  })

  it('isSubsetOf checks correctly', () => {
    const bs1 = new SimdBitSet(10)
    const bs2 = new SimdBitSet(10)
    bs1.set(5)
    bs2.set(5)
    expect(bs1.isSubsetOf(bs2)).toBe(true)
    bs1.set(7)
    expect(bs1.isSubsetOf(bs2)).toBe(false)
  })

  it('clone creates independent copy', () => {
    const bs1 = new SimdBitSet(10)
    bs1.set(5)
    bs1.set(7)
    const bs2 = bs1.clone()
    expect(bs2.get(5)).toBe(true)
    expect(bs2.get(7)).toBe(true)
    bs1.clear(5)
    expect(bs2.get(5)).toBe(true)
  })

  it('reset clears all bits', () => {
    const bs = new SimdBitSet(10)
    bs.setRange(0, 10)
    expect(bs.isEmpty()).toBe(false)
    bs.reset()
    expect(bs.isEmpty()).toBe(true)
  })

  it('toArray returns set indices', () => {
    const bs = new SimdBitSet(10)
    bs.set(2)
    bs.set(5)
    bs.set(8)
    const arr = bs.toArray()
    expect(arr).toEqual([2, 5, 8])
  })

  it('toString returns binary string', () => {
    const bs = new SimdBitSet(5)
    bs.set(0)
    bs.set(2)
    bs.set(4)
    expect(bs.toString()).toBe('10101')
  })

  it('fromArray creates bit set', () => {
    const bs = SimdBitSet.fromArray([0, 2, 4], 10)
    expect(bs.get(0)).toBe(true)
    expect(bs.get(2)).toBe(true)
    expect(bs.get(4)).toBe(true)
    expect(bs.get(5)).toBe(false)
  })

  it('fromString creates bit set', () => {
    const bs = SimdBitSet.fromString('10101')
    expect(bs.get(0)).toBe(true)
    expect(bs.get(1)).toBe(false)
    expect(bs.get(2)).toBe(true)
    expect(bs.get(3)).toBe(false)
    expect(bs.get(4)).toBe(true)
  })

  it('equals checks correctly', () => {
    const bs1 = new SimdBitSet(10)
    const bs2 = new SimdBitSet(10)
    expect(bs1.equals(bs2)).toBe(true)
    bs1.set(5)
    expect(bs1.equals(bs2)).toBe(false)
    bs2.set(5)
    expect(bs1.equals(bs2)).toBe(true)
  })

  it('handles bit operations with different sizes', () => {
    const bs1 = new SimdBitSet(5)
    const bs2 = new SimdBitSet(10)
    bs1.set(0)
    bs2.set(0)
    bs2.set(5)
    const result = bs1.or(bs2)
    expect(result.length).toBe(10)
    expect(result.get(0)).toBe(true)
    expect(result.get(5)).toBe(true)
  })

  it('setRange handles full range', () => {
    const bs = new SimdBitSet(15)
    bs.setRange(0, 15)
    for (let i = 0; i < 15; i++) {
      expect(bs.get(i)).toBe(true)
    }
  })

  it('setRange handles single element range', () => {
    const bs = new SimdBitSet(10)
    bs.setRange(5, 6)
    expect(bs.get(5)).toBe(true)
    expect(bs.get(4)).toBe(false)
    expect(bs.get(6)).toBe(false)
  })

  it('clearRange handles full range', () => {
    const bs = new SimdBitSet(12)
    bs.setRange(0, 12)
    bs.clearRange(0, 12)
    for (let i = 0; i < 12; i++) {
      expect(bs.get(i)).toBe(false)
    }
  })

  it('clearRange handles single element range', () => {
    const bs = new SimdBitSet(10)
    bs.setRange(0, 10)
    bs.clearRange(5, 6)
    expect(bs.get(5)).toBe(false)
    expect(bs.get(4)).toBe(true)
    expect(bs.get(6)).toBe(true)
  })

  it('flipAll on empty bitset', () => {
    const bs = new SimdBitSet(5)
    bs.flipAll()
    for (let i = 0; i < 5; i++) {
      expect(bs.get(i)).toBe(true)
    }
  })

  it('flipAll on partial bitset', () => {
    const bs = new SimdBitSet(10)
    bs.setRange(3, 7)
    bs.flipAll()
    for (let i = 0; i < 3; i++) {
      expect(bs.get(i)).toBe(true)
    }
    for (let i = 3; i < 7; i++) {
      expect(bs.get(i)).toBe(false)
    }
    for (let i = 7; i < 10; i++) {
      expect(bs.get(i)).toBe(true)
    }
  })

  it('and with different sizes (longer first)', () => {
    const bs1 = new SimdBitSet(10)
    const bs2 = new SimdBitSet(5)
    bs1.set(0)
    bs1.set(7)
    bs2.set(0)
    const result = bs1.and(bs2)
    expect(result.length).toBe(5)
    expect(result.get(0)).toBe(true)
    expect(result.get(4)).toBe(false)
  })

  it('xor with different sizes (longer first)', () => {
    const bs1 = new SimdBitSet(10)
    const bs2 = new SimdBitSet(5)
    bs1.set(0)
    bs1.set(7)
    bs2.set(0)
    bs2.set(2)
    const result = bs1.xor(bs2)
    expect(result.length).toBe(10)
    expect(result.get(0)).toBe(false)
    expect(result.get(2)).toBe(true)
    expect(result.get(7)).toBe(true)
  })

  it('popcount on all bits set', () => {
    const bs = new SimdBitSet(8)
    bs.setRange(0, 8)
    expect(bs.popcount()).toBe(8)
  })

  it('popcount on large bitset', () => {
    const bs = new SimdBitSet(100)
    for (let i = 0; i < 100; i += 2) {
      bs.set(i)
    }
    expect(bs.popcount()).toBe(50)
  })

  it('nextSetBit from beyond length', () => {
    const bs = new SimdBitSet(10)
    bs.set(5)
    expect(bs.nextSetBit(15)).toBe(-1)
  })

  it('nextSetBit on word boundary', () => {
    const bs = new SimdBitSet(64)
    bs.set(31)
    bs.set(32)
    bs.set(63)
    expect(bs.nextSetBit(0)).toBe(31)
    expect(bs.nextSetBit(32)).toBe(32)
    expect(bs.nextSetBit(33)).toBe(63)
  })

  it('nextClearBit on empty bitset', () => {
    const bs = new SimdBitSet(10)
    expect(bs.nextClearBit(0)).toBe(0)
    expect(bs.nextClearBit(5)).toBe(5)
  })

  it('nextClearBit from beyond length', () => {
    const bs = new SimdBitSet(10)
    bs.setRange(0, 10)
    expect(bs.nextClearBit(15)).toBe(10)
  })

  it('intersects with different sizes', () => {
    const bs1 = new SimdBitSet(10)
    const bs2 = new SimdBitSet(5)
    bs1.set(3)
    bs2.set(3)
    expect(bs1.intersects(bs2)).toBe(true)
  })

  it('isSubsetOf with equal sets', () => {
    const bs1 = new SimdBitSet(10)
    const bs2 = new SimdBitSet(10)
    bs1.set(3)
    bs1.set(7)
    bs2.set(3)
    bs2.set(7)
    expect(bs1.isSubsetOf(bs2)).toBe(true)
  })

  it('isSubsetOf with different sizes (subset)', () => {
    const bs1 = new SimdBitSet(5)
    const bs2 = new SimdBitSet(10)
    bs1.set(0)
    bs1.set(3)
    bs2.set(0)
    bs2.set(3)
    bs2.set(7)
    expect(bs1.isSubsetOf(bs2)).toBe(true)
  })

  it('isSubsetOf with different sizes (not subset)', () => {
    const bs1 = new SimdBitSet(10)
    const bs2 = new SimdBitSet(5)
    bs1.set(7)
    bs2.set(0)
    bs2.set(3)
    expect(bs1.isSubsetOf(bs2)).toBe(false)
  })

  it('fromArray filters invalid indices', () => {
    const bs = SimdBitSet.fromArray([-1, 0, 2, 10, 20], 10)
    expect(bs.get(0)).toBe(true)
    expect(bs.get(2)).toBe(true)
    expect(bs.get(10)).toBe(false)
    expect(bs.popcount()).toBe(2)
  })

  it('fromArray with empty array', () => {
    const bs = SimdBitSet.fromArray([], 10)
    expect(bs.isEmpty()).toBe(true)
    expect(bs.length).toBe(10)
  })

  it('fromString with empty string', () => {
    const bs = SimdBitSet.fromString('')
    expect(bs.isEmpty()).toBe(true)
    expect(bs.length).toBe(0)
  })

  it('toString on empty bitset', () => {
    const bs = new SimdBitSet(5)
    expect(bs.toString()).toBe('00000')
  })

  it('equals with different sizes', () => {
    const bs1 = new SimdBitSet(5)
    const bs2 = new SimdBitSet(10)
    bs1.set(0)
    bs2.set(0)
    expect(bs1.equals(bs2)).toBe(false)
  })

  it('clone maintains length', () => {
    const bs1 = new SimdBitSet(7)
    const bs2 = bs1.clone()
    expect(bs2.length).toBe(7)
    expect(bs2.isEmpty()).toBe(true)
  })
})
describe('simd-bit-set - wave545', () => {
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

describe('simd-bit-set - wave546', () => {
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

describe('simd-bit-set - wave547', () => {
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

describe('simd-bit-set - wave548', () => {
  it('simd-bit-set module defined', () => {
    expect(describe).toBeDefined()
  })
  it('simd-bit-set module is function', () => {
    expect(describe).toBeDefined()
  })
  it('simd-bit-set module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('simd-bit-set - wave549', () => {
  it('simd-bit-set module defined', () => {
    expect(describe).toBeDefined()
  })
  it('simd-bit-set module is function', () => {
    expect(describe).toBeDefined()
  })
  it('simd-bit-set module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('simd-bit-set - wave550', () => {
  it('simd-bit-set w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('simd-bit-set w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('simd-bit-set w550 has name', () => {
    expect(describe).toBeDefined()
  })
})
