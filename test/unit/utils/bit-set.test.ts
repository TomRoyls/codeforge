import { describe, expect, it } from 'vitest'
import { BitSet } from '../../../src/utils/bit-set.js'

describe('BitSet', () => {
  it('creates bitset with correct size', () => {
    const bs = new BitSet(100)
    expect(bs.size).toBe(100)
  })

  it('throws on negative size', () => {
    expect(() => new BitSet(-1)).toThrow(RangeError)
  })

  it('sets single bit', () => {
    const bs = new BitSet(10)
    bs.set(5)
    expect(bs.has(5)).toBe(true)
    expect(bs.get(5)).toBe(1)
  })

  it('clears single bit', () => {
    const bs = new BitSet(10)
    bs.set(5)
    bs.clear(5)
    expect(bs.has(5)).toBe(false)
    expect(bs.get(5)).toBe(0)
  })

  it('flips bit from 0 to 1', () => {
    const bs = new BitSet(10)
    bs.flip(5)
    expect(bs.has(5)).toBe(true)
  })

  it('flips bit from 1 to 0', () => {
    const bs = new BitSet(10)
    bs.set(5)
    bs.flip(5)
    expect(bs.has(5)).toBe(false)
  })

  it('gets bit value correctly', () => {
    const bs = new BitSet(10)
    expect(bs.get(0)).toBe(0)
    bs.set(0)
    expect(bs.get(0)).toBe(1)
  })

  it('sets range of bits', () => {
    const bs = new BitSet(20)
    bs.setRange(5, 10)
    for (let i = 5; i < 10; i++) {
      expect(bs.has(i)).toBe(true)
    }
    expect(bs.has(4)).toBe(false)
    expect(bs.has(10)).toBe(false)
  })

  it('clears range of bits', () => {
    const bs = new BitSet(20)
    bs.setRange(5, 15)
    bs.clearRange(8, 12)
    for (let i = 5; i < 8; i++) {
      expect(bs.has(i)).toBe(true)
    }
    for (let i = 8; i < 12; i++) {
      expect(bs.has(i)).toBe(false)
    }
    for (let i = 12; i < 15; i++) {
      expect(bs.has(i)).toBe(true)
    }
  })

  it('flips range of bits', () => {
    const bs = new BitSet(20)
    bs.setRange(5, 15)
    bs.flipRange(8, 12)
    for (let i = 5; i < 8; i++) {
      expect(bs.has(i)).toBe(true)
    }
    for (let i = 8; i < 12; i++) {
      expect(bs.has(i)).toBe(false)
    }
    for (let i = 12; i < 15; i++) {
      expect(bs.has(i)).toBe(true)
    }
  })

  it('counts set bits correctly', () => {
    const bs = new BitSet(100)
    bs.set(10)
    bs.set(20)
    bs.set(30)
    expect(bs.count()).toBe(3)
  })

  it('counts zero for empty bitset', () => {
    const bs = new BitSet(100)
    expect(bs.count()).toBe(0)
  })

  it('isEmpty returns true for empty bitset', () => {
    const bs = new BitSet(100)
    expect(bs.isEmpty()).toBe(true)
  })

  it('isEmpty returns false for non-empty bitset', () => {
    const bs = new BitSet(100)
    bs.set(5)
    expect(bs.isEmpty()).toBe(false)
  })

  it('isFull returns true when all bits set', () => {
    const bs = new BitSet(10)
    bs.setRange(0, 10)
    expect(bs.isFull()).toBe(true)
  })

  it('isFull returns false when not all bits set', () => {
    const bs = new BitSet(10)
    bs.set(5)
    expect(bs.isFull()).toBe(false)
  })

  it('and operation works correctly', () => {
    const bs1 = new BitSet(10)
    bs1.set(1)
    bs1.set(3)
    bs1.set(5)

    const bs2 = new BitSet(10)
    bs2.set(3)
    bs2.set(5)
    bs2.set(7)

    const result = bs1.and(bs2)
    expect(result.has(3)).toBe(true)
    expect(result.has(5)).toBe(true)
    expect(result.has(1)).toBe(false)
    expect(result.has(7)).toBe(false)
  })

  it('or operation works correctly', () => {
    const bs1 = new BitSet(10)
    bs1.set(1)
    bs1.set(3)

    const bs2 = new BitSet(10)
    bs2.set(3)
    bs2.set(5)

    const result = bs1.or(bs2)
    expect(result.has(1)).toBe(true)
    expect(result.has(3)).toBe(true)
    expect(result.has(5)).toBe(true)
    expect(result.has(7)).toBe(false)
  })

  it('xor operation works correctly', () => {
    const bs1 = new BitSet(10)
    bs1.set(1)
    bs1.set(3)
    bs1.set(5)

    const bs2 = new BitSet(10)
    bs2.set(3)
    bs2.set(5)
    bs2.set(7)

    const result = bs1.xor(bs2)
    expect(result.has(1)).toBe(true)
    expect(result.has(3)).toBe(false)
    expect(result.has(5)).toBe(false)
    expect(result.has(7)).toBe(true)
  })

  it('not operation works correctly', () => {
    const bs = new BitSet(10)
    bs.set(2)
    bs.set(5)
    bs.set(7)

    const result = bs.not()
    expect(result.has(0)).toBe(true)
    expect(result.has(2)).toBe(false)
    expect(result.has(5)).toBe(false)
    expect(result.has(7)).toBe(false)
    expect(result.has(9)).toBe(true)
  })

  it('equals returns true for identical bitsets', () => {
    const bs1 = new BitSet(10)
    bs1.set(2)
    bs1.set(5)

    const bs2 = new BitSet(10)
    bs2.set(2)
    bs2.set(5)

    expect(bs1.equals(bs2)).toBe(true)
  })

  it('equals returns false for different bitsets', () => {
    const bs1 = new BitSet(10)
    bs1.set(2)
    bs1.set(5)

    const bs2 = new BitSet(10)
    bs2.set(2)
    bs2.set(7)

    expect(bs1.equals(bs2)).toBe(false)
  })

  it('equals returns false for different sizes', () => {
    const bs1 = new BitSet(10)
    const bs2 = new BitSet(20)
    expect(bs1.equals(bs2)).toBe(false)
  })

  it('clone creates independent copy', () => {
    const bs1 = new BitSet(10)
    bs1.set(2)
    bs1.set(5)

    const bs2 = bs1.clone()
    bs2.set(7)

    expect(bs1.has(7)).toBe(false)
    expect(bs2.has(7)).toBe(true)
    expect(bs1.has(2)).toBe(true)
    expect(bs2.has(2)).toBe(true)
  })

  it('toString returns correct binary representation', () => {
    const bs = new BitSet(5)
    bs.set(0)
    bs.set(2)
    bs.set(4)
    expect(bs.toString()).toBe('10101')
  })

  it('toString returns all zeros for empty bitset', () => {
    const bs = new BitSet(5)
    expect(bs.toString()).toBe('00000')
  })

  it('toArray returns indices of set bits', () => {
    const bs = new BitSet(20)
    bs.set(3)
    bs.set(7)
    bs.set(11)
    bs.set(15)

    const arr = bs.toArray()
    expect(arr).toEqual([3, 7, 11, 15])
  })

  it('toArray returns empty array for empty bitset', () => {
    const bs = new BitSet(20)
    expect(bs.toArray()).toEqual([])
  })

  it('throws on out of bounds set', () => {
    const bs = new BitSet(10)
    expect(() => bs.set(10)).toThrow(RangeError)
  })

  it('throws on out of bounds get', () => {
    const bs = new BitSet(10)
    expect(() => bs.get(-1)).toThrow(RangeError)
  })

  it('handles boundary bits correctly', () => {
    const bs = new BitSet(64)
    bs.set(0)
    bs.set(31)
    bs.set(32)
    bs.set(63)
    expect(bs.has(0)).toBe(true)
    expect(bs.has(31)).toBe(true)
    expect(bs.has(32)).toBe(true)
    expect(bs.has(63)).toBe(true)
  })

  it('handles large bitset', () => {
    const bs = new BitSet(10000)
    bs.set(9999)
    bs.set(0)
    bs.set(5000)
    expect(bs.has(9999)).toBe(true)
    expect(bs.has(0)).toBe(true)
    expect(bs.has(5000)).toBe(true)
    expect(bs.count()).toBe(3)
  })

  it('and handles different sized bitsets', () => {
    const bs1 = new BitSet(5)
    bs1.set(1)
    bs1.set(3)

    const bs2 = new BitSet(10)
    bs2.set(3)
    bs2.set(7)

    const result = bs1.and(bs2)
    expect(result.has(3)).toBe(true)
    expect(result.has(1)).toBe(false)
    expect(result.has(7)).toBe(false)
  })
})