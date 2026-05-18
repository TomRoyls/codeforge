import { describe, it, expect } from 'vitest'
import { SparseBitSet } from '../src/utils/sparse-bit-set.js'

// ─── Constructor ───

describe('SparseBitSet', () => {
  it('starts empty', () => {
    const bs = new SparseBitSet()
    expect(bs.size).toBe(0)
    expect(bs.isEmpty).toBe(true)
    expect(bs.chunkCount).toBe(0)
  })

  // ─── Set / Has ───

  it('set returns true for new bit', () => {
    const bs = new SparseBitSet()
    expect(bs.set(5)).toBe(true)
    expect(bs.set(5)).toBe(false)
    expect(bs.size).toBe(1)
  })

  it('set rejects negative bits', () => {
    const bs = new SparseBitSet()
    expect(bs.set(-1)).toBe(false)
    expect(bs.size).toBe(0)
  })

  it('has returns true for set bits', () => {
    const bs = new SparseBitSet()
    bs.set(0)
    bs.set(100)
    bs.set(2048)
    expect(bs.has(0)).toBe(true)
    expect(bs.has(100)).toBe(true)
    expect(bs.has(2048)).toBe(true)
    expect(bs.has(1)).toBe(false)
    expect(bs.has(-1)).toBe(false)
  })

  // ─── Clear ───

  it('clear removes a set bit', () => {
    const bs = new SparseBitSet()
    bs.set(42)
    expect(bs.clear(42)).toBe(true)
    expect(bs.clear(42)).toBe(false)
    expect(bs.size).toBe(0)
  })

  it('clear on unset bit returns false', () => {
    const bs = new SparseBitSet()
    expect(bs.clear(0)).toBe(false)
    expect(bs.clear(-1)).toBe(false)
  })

  // ─── nextSetBit / prevSetBit ───

  it('nextSetBit finds next set bit from position', () => {
    const bs = new SparseBitSet()
    bs.set(10)
    bs.set(20)
    bs.set(30)
    expect(bs.nextSetBit(0)).toBe(10)
    expect(bs.nextSetBit(10)).toBe(10)
    expect(bs.nextSetBit(11)).toBe(20)
    expect(bs.nextSetBit(21)).toBe(30)
    expect(bs.nextSetBit(31)).toBe(-1)
  })

  it('prevSetBit finds previous set bit', () => {
    const bs = new SparseBitSet()
    bs.set(10)
    bs.set(20)
    expect(bs.prevSetBit(20)).toBe(20)
    expect(bs.prevSetBit(19)).toBe(10)
    expect(bs.prevSetBit(9)).toBe(-1)
  })

  // ─── Chunk allocation ───

  it('allocates chunks lazily', () => {
    const bs = new SparseBitSet()
    bs.set(0)
    expect(bs.chunkCount).toBe(1)
    bs.set(1024)
    expect(bs.chunkCount).toBe(2)
    bs.set(2048)
    expect(bs.chunkCount).toBe(3)
  })

  // ─── forEach / toArray ───

  it('forEach iterates all set bits', () => {
    const bs = new SparseBitSet()
    bs.set(3)
    bs.set(7)
    bs.set(1025)
    const bits: number[] = []
    bs.forEach((b) => bits.push(b))
    expect(bits).toEqual([3, 7, 1025])
  })

  it('toArray returns sorted set bits', () => {
    const bs = new SparseBitSet()
    bs.set(50)
    bs.set(10)
    bs.set(30)
    expect(bs.toArray()).toEqual([10, 30, 50])
  })

  it('forEach on empty does nothing', () => {
    const bs = new SparseBitSet()
    const bits: number[] = []
    bs.forEach((b) => bits.push(b))
    expect(bits).toEqual([])
  })

  // ─── clone ───

  it('clone produces independent copy', () => {
    const bs = new SparseBitSet()
    bs.set(1)
    bs.set(2)
    const copy = bs.clone()
    expect(copy.toArray()).toEqual([1, 2])
    copy.set(3)
    expect(bs.has(3)).toBe(false)
    expect(copy.has(3)).toBe(true)
  })

  // ─── reset ───

  it('reset clears all bits', () => {
    const bs = new SparseBitSet()
    bs.set(0)
    bs.set(100)
    bs.set(2000)
    bs.reset()
    expect(bs.size).toBe(0)
    expect(bs.isEmpty).toBe(true)
    expect(bs.chunkCount).toBe(0)
  })

  // ─── AND operation ───

  it('and returns intersection', () => {
    const a = new SparseBitSet()
    a.set(1)
    a.set(2)
    a.set(3)
    const b = new SparseBitSet()
    b.set(2)
    b.set(3)
    b.set(4)
    const result = a.and(b)
    expect(result.toArray()).toEqual([2, 3])
  })

  it('and with empty returns empty', () => {
    const a = new SparseBitSet()
    a.set(1)
    const b = new SparseBitSet()
    expect(a.and(b).toArray()).toEqual([])
  })

  // ─── OR operation ───

  it('or returns union', () => {
    const a = new SparseBitSet()
    a.set(1)
    a.set(3)
    const b = new SparseBitSet()
    b.set(2)
    b.set(3)
    const result = a.or(b)
    expect(result.toArray()).toEqual([1, 2, 3])
  })

  // ─── XOR operation ───

  it('xor returns symmetric difference', () => {
    const a = new SparseBitSet()
    a.set(1)
    a.set(2)
    const b = new SparseBitSet()
    b.set(2)
    b.set(3)
    const result = a.xor(b)
    expect(result.toArray()).toEqual([1, 3])
  })

  // ─── Large sparse keys ───

  it('handles very large bit positions', () => {
    const bs = new SparseBitSet()
    bs.set(1_000_000)
    bs.set(1_000_005)
    expect(bs.has(1_000_000)).toBe(true)
    expect(bs.has(1_000_005)).toBe(true)
    expect(bs.has(999_999)).toBe(false)
    expect(bs.size).toBe(2)
    expect(bs.nextSetBit(999_999)).toBe(1_000_000)
  })

  // ─── Stress ───

  it('handles many set/clear operations', () => {
    const bs = new SparseBitSet()
    for (let i = 0; i < 500; i++) {
      bs.set(i * 2)
    }
    expect(bs.size).toBe(500)
    for (let i = 0; i < 500; i++) {
      expect(bs.has(i * 2)).toBe(true)
      expect(bs.has(i * 2 + 1)).toBe(false)
    }
    for (let i = 0; i < 250; i++) {
      bs.clear(i * 4)
    }
    expect(bs.size).toBe(250)
  })

  it('handles dense set within one chunk', () => {
    const bs = new SparseBitSet()
    for (let i = 0; i < 64; i++) {
      bs.set(i)
    }
    expect(bs.size).toBe(64)
    expect(bs.chunkCount).toBe(1)
    expect(bs.toArray()).toHaveLength(64)
  })
})
