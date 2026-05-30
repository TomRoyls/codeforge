import { describe, expect, it } from 'vitest'
import { SparseBitSet } from '../../../src/utils/sparse-bit-set.js'

describe('SparseBitSet', () => {
  it('set returns true when bit was not set', () => {
    const set = new SparseBitSet()
    expect(set.set(5)).toBe(true)
  })

  it('set returns false when bit was already set', () => {
    const set = new SparseBitSet()
    set.set(5)
    expect(set.set(5)).toBe(false)
  })

  it('set returns false for negative bit', () => {
    const set = new SparseBitSet()
    expect(set.set(-1)).toBe(false)
  })

  it('clear returns true when bit was set', () => {
    const set = new SparseBitSet()
    set.set(5)
    expect(set.clear(5)).toBe(true)
  })

  it('clear returns false when bit was not set', () => {
    const set = new SparseBitSet()
    expect(set.clear(5)).toBe(false)
  })

  it('clear returns false for negative bit', () => {
    const set = new SparseBitSet()
    expect(set.clear(-1)).toBe(false)
  })

  it('has returns true for set bit', () => {
    const set = new SparseBitSet()
    set.set(10)
    expect(set.has(10)).toBe(true)
  })

  it('has returns false for unset bit', () => {
    const set = new SparseBitSet()
    expect(set.has(10)).toBe(false)
  })

  it('has returns false for negative bit', () => {
    const set = new SparseBitSet()
    set.set(10)
    expect(set.has(-1)).toBe(false)
  })

  it('size returns zero for empty set', () => {
    const set = new SparseBitSet()
    expect(set.size).toBe(0)
  })

  it('size increments on set', () => {
    const set = new SparseBitSet()
    set.set(1)
    set.set(2)
    set.set(3)
    expect(set.size).toBe(3)
  })

  it('size does not increment on duplicate set', () => {
    const set = new SparseBitSet()
    set.set(1)
    set.set(1)
    expect(set.size).toBe(1)
  })

  it('size decrements on clear', () => {
    const set = new SparseBitSet()
    set.set(1)
    set.set(2)
    set.clear(1)
    expect(set.size).toBe(1)
  })

  it('size does not decrement on clear of unset bit', () => {
    const set = new SparseBitSet()
    set.set(1)
    set.clear(2)
    expect(set.size).toBe(1)
  })

  it('isEmpty returns true for empty set', () => {
    const set = new SparseBitSet()
    expect(set.isEmpty).toBe(true)
  })

  it('isEmpty returns false for non-empty set', () => {
    const set = new SparseBitSet()
    set.set(1)
    expect(set.isEmpty).toBe(false)
  })

  it('isEmpty returns true after clearing all bits', () => {
    const set = new SparseBitSet()
    set.set(1)
    set.set(2)
    set.clear(1)
    set.clear(2)
    expect(set.isEmpty).toBe(true)
  })

  it('reset clears all bits and resets size', () => {
    const set = new SparseBitSet()
    set.set(1)
    set.set(2)
    set.set(3)
    set.reset()
    expect(set.size).toBe(0)
    expect(set.isEmpty).toBe(true)
  })

  it('nextSetBit returns -1 for empty set', () => {
    const set = new SparseBitSet()
    expect(set.nextSetBit(0)).toBe(-1)
  })

  it('nextSetBit finds next set bit', () => {
    const set = new SparseBitSet()
    set.set(5)
    set.set(10)
    expect(set.nextSetBit(0)).toBe(5)
  })

  it('nextSetBit returns -1 after last set bit', () => {
    const set = new SparseBitSet()
    set.set(5)
    expect(set.nextSetBit(10)).toBe(-1)
  })

  it('nextSetBit handles sparse indices', () => {
    const set = new SparseBitSet()
    set.set(1000)
    set.set(10000)
    expect(set.nextSetBit(500)).toBe(1000)
  })

  it('nextSetBit returns first set bit when from is negative', () => {
    const set = new SparseBitSet()
    set.set(5)
    expect(set.nextSetBit(-10)).toBe(5)
  })

  it('prevSetBit returns -1 for empty set', () => {
    const set = new SparseBitSet()
    expect(set.prevSetBit(100)).toBe(-1)
  })

  it('prevSetBit finds previous set bit', () => {
    const set = new SparseBitSet()
    set.set(5)
    set.set(10)
    expect(set.prevSetBit(15)).toBe(10)
  })

  it('prevSetBit returns -1 before first set bit', () => {
    const set = new SparseBitSet()
    set.set(10)
    expect(set.prevSetBit(5)).toBe(-1)
  })

  it('prevSetBit returns -1 for negative from', () => {
    const set = new SparseBitSet()
    set.set(5)
    expect(set.prevSetBit(-1)).toBe(-1)
  })

  it('forEach iterates over set bits', () => {
    const set = new SparseBitSet()
    set.set(1)
    set.set(3)
    set.set(5)
    const bits: number[] = []
    set.forEach((bit) => bits.push(bit))
    expect(bits).toEqual([1, 3, 5])
  })

  it('toArray returns all set bits', () => {
    const set = new SparseBitSet()
    set.set(2)
    set.set(4)
    set.set(6)
    expect(set.toArray()).toEqual([2, 4, 6])
  })

  it('toArray returns empty array for empty set', () => {
    const set = new SparseBitSet()
    expect(set.toArray()).toEqual([])
  })

  it('clone creates independent copy', () => {
    const set = new SparseBitSet()
    set.set(1)
    set.set(2)
    const clone = set.clone()
    clone.set(3)
    expect(set.size).toBe(2)
    expect(clone.size).toBe(3)
  })

  it('clone preserves all bits', () => {
    const set = new SparseBitSet()
    set.set(10)
    set.set(20)
    set.set(30)
    const clone = set.clone()
    expect(clone.has(10)).toBe(true)
    expect(clone.has(20)).toBe(true)
    expect(clone.has(30)).toBe(true)
  })

  it('chunkCount returns zero for empty set', () => {
    const set = new SparseBitSet()
    expect(set.chunkCount).toBe(0)
  })

  it('chunkCount increments when bits in different chunks', () => {
    const set = new SparseBitSet()
    set.set(0)
    set.set(1024)
    expect(set.chunkCount).toBe(2)
  })

  it('and computes intersection', () => {
    const set1 = new SparseBitSet()
    set1.set(1)
    set1.set(2)
    set1.set(3)
    const set2 = new SparseBitSet()
    set2.set(2)
    set2.set(3)
    set2.set(4)
    const result = set1.and(set2)
    expect(result.toArray()).toEqual([2, 3])
  })

  it('or computes union', () => {
    const set1 = new SparseBitSet()
    set1.set(1)
    set1.set(2)
    const set2 = new SparseBitSet()
    set2.set(3)
    set2.set(4)
    const result = set1.or(set2)
    expect(result.toArray()).toEqual([1, 2, 3, 4])
  })

  it('xor computes symmetric difference', () => {
    const set1 = new SparseBitSet()
    set1.set(1)
    set1.set(2)
    set1.set(3)
    const set2 = new SparseBitSet()
    set2.set(2)
    set2.set(4)
    const result = set1.xor(set2)
    expect(result.toArray()).toEqual([1, 3, 4])
  })
})