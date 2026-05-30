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
})