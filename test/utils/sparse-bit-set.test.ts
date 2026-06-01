import { describe, it, expect } from 'vitest'
import { SparseBitSet } from '../../src/utils/sparse-bit-set.js'

// ─── Set and Clear ────────────────────────────────────────
describe('SparseBitSet - set and clear', () => {
  it('sets and checks bits', () => {
    const bs = new SparseBitSet()
    expect(bs.set(5)).toBe(true)
    expect(bs.has(5)).toBe(true)
    expect(bs.has(6)).toBe(false)
  })

  it('set returns false for already set bit', () => {
    const bs = new SparseBitSet()
    bs.set(10)
    expect(bs.set(10)).toBe(false)
  })

  it('clear removes a bit', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    expect(bs.clear(5)).toBe(true)
    expect(bs.has(5)).toBe(false)
    expect(bs.size).toBe(0)
  })

  it('clear returns false for unset bit', () => {
    const bs = new SparseBitSet()
    expect(bs.clear(5)).toBe(false)
  })

  it('handles negative indices', () => {
    const bs = new SparseBitSet()
    expect(bs.set(-1)).toBe(false)
    expect(bs.has(-1)).toBe(false)
    expect(bs.clear(-1)).toBe(false)
  })
})

// ─── Size and Empty ───────────────────────────────────────
describe('SparseBitSet - size', () => {
  it('tracks size', () => {
    const bs = new SparseBitSet()
    expect(bs.size).toBe(0)
    expect(bs.isEmpty).toBe(true)
    bs.set(1)
    bs.set(100)
    bs.set(1000000)
    expect(bs.size).toBe(3)
    expect(bs.isEmpty).toBe(false)
  })

  it('tracks chunkCount', () => {
    const bs = new SparseBitSet()
    bs.set(0)
    bs.set(1000000)
    expect(bs.chunkCount).toBe(2)
  })
})

// ─── Navigation ───────────────────────────────────────────
describe('SparseBitSet - navigation', () => {
  it('nextSetBit', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    bs.set(10)
    expect(bs.nextSetBit(0)).toBe(5)
    expect(bs.nextSetBit(6)).toBe(10)
    expect(bs.nextSetBit(11)).toBe(-1)
  })

  it('prevSetBit', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    bs.set(10)
    expect(bs.prevSetBit(10)).toBe(10)
    expect(bs.prevSetBit(9)).toBe(5)
    expect(bs.prevSetBit(4)).toBe(-1)
  })
})

// ─── Set operations ───────────────────────────────────────
describe('SparseBitSet - set operations', () => {
  it('and', () => {
    const a = new SparseBitSet()
    a.set(1); a.set(2); a.set(3)
    const b = new SparseBitSet()
    b.set(2); b.set(3); b.set(4)
    const result = a.and(b)
    expect(result.toArray()).toEqual([2, 3])
  })

  it('or', () => {
    const a = new SparseBitSet()
    a.set(1); a.set(2)
    const b = new SparseBitSet()
    b.set(3); b.set(4)
    const result = a.or(b)
    expect(result.toArray()).toEqual([1, 2, 3, 4])
  })

  it('xor', () => {
    const a = new SparseBitSet()
    a.set(1); a.set(2); a.set(3)
    const b = new SparseBitSet()
    b.set(2); b.set(3); b.set(4)
    const result = a.xor(b)
    expect(result.toArray()).toEqual([1, 4])
  })
})

// ─── Iteration and Clone ──────────────────────────────────
describe('SparseBitSet - iteration', () => {
  it('forEach', () => {
    const bs = new SparseBitSet()
    bs.set(1); bs.set(3); bs.set(5)
    const bits: number[] = []
    bs.forEach((b) => bits.push(b))
    expect(bits).toEqual([1, 3, 5])
  })

  it('toArray', () => {
    const bs = new SparseBitSet()
    bs.set(10); bs.set(20)
    expect(bs.toArray()).toEqual([10, 20])
  })

  it('clone is independent', () => {
    const bs = new SparseBitSet()
    bs.set(1); bs.set(2)
    const copy = bs.clone()
    bs.clear(1)
    expect(copy.has(1)).toBe(true)
  })

  it('reset clears all', () => {
    const bs = new SparseBitSet()
    bs.set(1); bs.set(2); bs.set(3)
    bs.reset()
    expect(bs.size).toBe(0)
    expect(bs.isEmpty).toBe(true)
  })

  it('clear unsets a bit', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    expect(bs.has(5)).toBe(true)
    bs.clear(5)
    expect(bs.has(5)).toBe(false)
  })

  it('has returns false for unset bit', () => {
    const bs = new SparseBitSet()
    expect(bs.has(0)).toBe(false)
    bs.set(0)
    expect(bs.has(0)).toBe(true)
  })
})
