import { describe, it, expect } from 'vitest'
import { SparseBitSet } from '../../src/utils/sparse-bitset.js'

describe('SparseBitSet', () => {
  it('initializes empty', () => {
    const bs = new SparseBitSet()
    expect(bs.size).toBe(0)
    expect(bs.isEmpty).toBe(true)
    expect(bs.memoryChunks).toBe(0)
  })

  it('sets a single bit', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    expect(bs.size).toBe(1)
    expect(bs.isEmpty).toBe(false)
    expect(bs.get(5)).toBe(true)
  })

  it('gets bit that is not set', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    expect(bs.get(10)).toBe(false)
  })

  it('gets negative index returns false', () => {
    const bs = new SparseBitSet()
    expect(bs.get(-1)).toBe(false)
    expect(bs.get(-5)).toBe(false)
  })

  it('sets multiple bits', () => {
    const bs = new SparseBitSet()
    bs.set(0)
    bs.set(10)
    bs.set(100)
    expect(bs.size).toBe(3)
    expect(bs.get(0)).toBe(true)
    expect(bs.get(10)).toBe(true)
    expect(bs.get(100)).toBe(true)
  })

  it('clears a set bit', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    expect(bs.get(5)).toBe(true)
    bs.clear(5)
    expect(bs.get(5)).toBe(false)
    expect(bs.size).toBe(0)
  })

  it('clears bit that is not set', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    bs.clear(10)
    expect(bs.size).toBe(1)
    expect(bs.get(5)).toBe(true)
  })

  it('clears negative index does nothing', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    bs.clear(-1)
    expect(bs.size).toBe(1)
  })

  it('flips bit from unset to set', () => {
    const bs = new SparseBitSet()
    expect(bs.get(5)).toBe(false)
    bs.flip(5)
    expect(bs.get(5)).toBe(true)
    expect(bs.size).toBe(1)
  })

  it('flips bit from set to unset', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    expect(bs.get(5)).toBe(true)
    bs.flip(5)
    expect(bs.get(5)).toBe(false)
    expect(bs.size).toBe(0)
  })

  it('flips negative index does nothing', () => {
    const bs = new SparseBitSet()
    bs.flip(-1)
    expect(bs.size).toBe(0)
  })

  it('performs AND with empty set', () => {
    const bs1 = new SparseBitSet()
    const bs2 = new SparseBitSet()
    bs1.set(5)
    bs1.and(bs2)
    expect(bs1.size).toBe(0)
  })

  it('performs AND with overlapping bits', () => {
    const bs1 = new SparseBitSet()
    const bs2 = new SparseBitSet()
    bs1.set(5)
    bs1.set(10)
    bs2.set(5)
    bs2.set(15)
    bs1.and(bs2)
    expect(bs1.size).toBe(1)
    expect(bs1.get(5)).toBe(true)
    expect(bs1.get(10)).toBe(false)
    expect(bs1.get(15)).toBe(false)
  })

  it('performs OR with empty set', () => {
    const bs1 = new SparseBitSet()
    const bs2 = new SparseBitSet()
    bs1.set(5)
    bs1.or(bs2)
    expect(bs1.size).toBe(1)
    expect(bs1.get(5)).toBe(true)
  })

  it('performs OR with overlapping bits', () => {
    const bs1 = new SparseBitSet()
    const bs2 = new SparseBitSet()
    bs1.set(5)
    bs1.set(10)
    bs2.set(5)
    bs2.set(15)
    bs1.or(bs2)
    expect(bs1.size).toBe(3)
    expect(bs1.get(5)).toBe(true)
    expect(bs1.get(10)).toBe(true)
    expect(bs1.get(15)).toBe(true)
  })

  it('performs XOR with empty set', () => {
    const bs1 = new SparseBitSet()
    const bs2 = new SparseBitSet()
    bs1.set(5)
    bs1.xor(bs2)
    expect(bs1.size).toBe(1)
    expect(bs1.get(5)).toBe(true)
  })

  it('performs XOR with overlapping bits', () => {
    const bs1 = new SparseBitSet()
    const bs2 = new SparseBitSet()
    bs1.set(5)
    bs1.set(10)
    bs2.set(5)
    bs2.set(15)
    bs1.xor(bs2)
    expect(bs1.size).toBe(2)
    expect(bs1.get(5)).toBe(false)
    expect(bs1.get(10)).toBe(true)
    expect(bs1.get(15)).toBe(true)
  })

  it('finds next set bit from start', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    bs.set(10)
    bs.set(15)
    expect(bs.nextSetBit(0)).toBe(5)
  })

  it('finds next set bit from middle', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    bs.set(10)
    bs.set(15)
    expect(bs.nextSetBit(6)).toBe(10)
  })

  it('finds next set bit returns -1 when none exists', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    bs.set(10)
    expect(bs.nextSetBit(11)).toBe(-1)
  })

  it('finds next set bit returns -1 for empty set', () => {
    const bs = new SparseBitSet()
    expect(bs.nextSetBit(0)).toBe(-1)
  })

  it('finds next set bit with negative from', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    expect(bs.nextSetBit(-1)).toBe(5)
  })

  it('converts to array', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    bs.set(10)
    bs.set(15)
    expect(bs.toArray()).toEqual([5, 10, 15])
  })

  it('converts empty set to empty array', () => {
    const bs = new SparseBitSet()
    expect(bs.toArray()).toEqual([])
  })

  it('handles bits in same chunk', () => {
    const bs = new SparseBitSet()
    bs.set(0)
    bs.set(1)
    bs.set(2)
    bs.set(31)
    expect(bs.size).toBe(4)
    expect(bs.memoryChunks).toBe(1)
  })

  it('handles bits across multiple chunks', () => {
    const bs = new SparseBitSet()
    bs.set(0)
    bs.set(32)
    bs.set(64)
    expect(bs.size).toBe(3)
    expect(bs.memoryChunks).toBe(3)
  })

  it('sets same bit twice does not increase size', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    bs.set(5)
    expect(bs.size).toBe(1)
  })

  it('clears bit removes chunk when empty', () => {
    const bs = new SparseBitSet()
    bs.set(0)
    bs.set(32)
    bs.clear(0)
    expect(bs.size).toBe(1)
    expect(bs.memoryChunks).toBe(1)
  })
})