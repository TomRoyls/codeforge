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
})