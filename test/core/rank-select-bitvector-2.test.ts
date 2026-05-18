import { describe, it, expect } from 'vitest'
import { RankSelectBitvector2 } from '../../src/core/rank-select-bitvector-2/index.js'

describe('RankSelectBitvector2', () => {
  // ─── Constructor from boolean array ───
  it('creates from boolean array', () => {
    const bv = new RankSelectBitvector2([true, false, true])
    expect(bv.length).toBe(3)
    expect(bv.countOnes()).toBe(2)
  })

  it('creates from empty boolean array', () => {
    const bv = new RankSelectBitvector2([])
    expect(bv.length).toBe(0)
    expect(bv.countOnes()).toBe(0)
    expect(bv.isEmpty()).toBe(true)
  })

  // ─── Constructor from size ───
  it('creates from size number', () => {
    const bv = new RankSelectBitvector2(64)
    expect(bv.length).toBe(64)
    expect(bv.countOnes()).toBe(0)
    expect(bv.isEmpty()).toBe(true)
  })

  // ─── set / unset / flip ───
  it('sets a bit', () => {
    const bv = new RankSelectBitvector2(10)
    bv.set(3)
    expect(bv.get(3)).toBe(true)
    expect(bv.countOnes()).toBe(1)
  })

  it('set is idempotent', () => {
    const bv = new RankSelectBitvector2(10)
    bv.set(5)
    bv.set(5)
    expect(bv.countOnes()).toBe(1)
  })

  it('unsets a bit', () => {
    const bv = new RankSelectBitvector2([true, true, true])
    bv.unset(1)
    expect(bv.get(0)).toBe(true)
    expect(bv.get(1)).toBe(false)
    expect(bv.get(2)).toBe(true)
    expect(bv.countOnes()).toBe(2)
  })

  it('unset on already-unset bit is idempotent', () => {
    const bv = new RankSelectBitvector2(10)
    bv.set(0)
    bv.unset(5)
    expect(bv.countOnes()).toBe(1)
  })

  it('flips a bit', () => {
    const bv = new RankSelectBitvector2(10)
    bv.set(3)
    bv.flip(3)
    expect(bv.get(3)).toBe(false)
    bv.flip(3)
    expect(bv.get(3)).toBe(true)
  })

  // ─── get ───
  it('gets individual bits from boolean constructor', () => {
    const bv = new RankSelectBitvector2([true, false, true, false])
    expect(bv.get(0)).toBe(true)
    expect(bv.get(1)).toBe(false)
    expect(bv.get(2)).toBe(true)
    expect(bv.get(3)).toBe(false)
  })

  // ─── rank1 ───
  it('computes rank1', () => {
    const bv = new RankSelectBitvector2([true, false, true, true, false])
    expect(bv.rank1(0)).toBe(0)
    expect(bv.rank1(1)).toBe(1)
    expect(bv.rank1(2)).toBe(1)
    expect(bv.rank1(3)).toBe(2)
    expect(bv.rank1(4)).toBe(3)
    expect(bv.rank1(5)).toBe(3)
  })

  // ─── rank0 ───
  it('computes rank0', () => {
    const bv = new RankSelectBitvector2([true, false, true, false])
    expect(bv.rank0(0)).toBe(0)
    expect(bv.rank0(1)).toBe(0)
    expect(bv.rank0(2)).toBe(1)
    expect(bv.rank0(3)).toBe(1)
    expect(bv.rank0(4)).toBe(2)
  })

  // ─── select1 ───
  it('finds position of k-th 1-bit', () => {
    const bv = new RankSelectBitvector2([false, true, false, true, false, true])
    expect(bv.select1(0)).toBe(1)
    expect(bv.select1(1)).toBe(3)
    expect(bv.select1(2)).toBe(5)
  })

  it('select1 returns -1 for invalid k', () => {
    const bv = new RankSelectBitvector2([true, false])
    expect(bv.select1(-1)).toBe(-1)
    expect(bv.select1(1)).toBe(-1)
  })

  // ─── select0 ───
  it('finds position of k-th 0-bit', () => {
    const bv = new RankSelectBitvector2([true, false, true, false, true])
    expect(bv.select0(0)).toBe(1)
    expect(bv.select0(1)).toBe(3)
  })

  it('select0 returns -1 for invalid k', () => {
    const bv = new RankSelectBitvector2([true, false])
    expect(bv.select0(-1)).toBe(-1)
    expect(bv.select0(1)).toBe(-1)
  })

  // ─── countOnes / countZeros / isEmpty ───
  it('counts ones and zeros', () => {
    const bv = new RankSelectBitvector2([true, false, true, false, true])
    expect(bv.countOnes()).toBe(3)
    expect(bv.countZeros()).toBe(2)
    expect(bv.isEmpty()).toBe(false)
  })

  it('isEmpty is true for all-zero bitvector', () => {
    const bv = new RankSelectBitvector2([false, false])
    expect(bv.isEmpty()).toBe(true)
    expect(bv.countOnes()).toBe(0)
  })

  // ─── toArray ───
  it('converts to boolean array', () => {
    const bits = [true, false, true, true, false]
    const bv = new RankSelectBitvector2(bits)
    expect(bv.toArray()).toEqual(bits)
  })

  // ─── Dynamic operations ───
  it('maintains consistency after multiple set/unset/flip', () => {
    const bv = new RankSelectBitvector2(32)
    bv.set(0)
    bv.set(5)
    bv.set(10)
    bv.flip(10)
    bv.set(15)
    bv.unset(5)
    expect(bv.get(0)).toBe(true)
    expect(bv.get(5)).toBe(false)
    expect(bv.get(10)).toBe(false)
    expect(bv.get(15)).toBe(true)
    expect(bv.countOnes()).toBe(2)
    expect(bv.rank1(16)).toBe(2)
    expect(bv.select1(0)).toBe(0)
    expect(bv.select1(1)).toBe(15)
  })

  // ─── Edge cases ───
  it('handles large bitvector from size constructor', () => {
    const bv = new RankSelectBitvector2(100)
    for (let i = 0; i < 100; i += 2) {
      bv.set(i)
    }
    expect(bv.countOnes()).toBe(50)
    expect(bv.countZeros()).toBe(50)
    for (let i = 0; i < 100; i++) {
      expect(bv.get(i)).toBe(i % 2 === 0)
    }
  })

  it('handles single bit', () => {
    const bv = new RankSelectBitvector2(1)
    expect(bv.get(0)).toBe(false)
    bv.set(0)
    expect(bv.get(0)).toBe(true)
    expect(bv.select1(0)).toBe(0)
    expect(bv.rank1(1)).toBe(1)
  })

  it('rank and select are consistent', () => {
    const bits = [true, true, false, true, false, false, true, true, false, true]
    const bv = new RankSelectBitvector2(bits)

    for (let k = 0; k < bv.countOnes(); k++) {
      const pos = bv.select1(k)
      expect(pos).toBeGreaterThanOrEqual(0)
      expect(bv.get(pos!)).toBe(true)
    }

    let oneCount = 0
    for (let i = 0; i < bits.length; i++) {
      expect(bv.rank1(i + 1)).toBe(oneCount + (bits[i] ? 1 : 0))
      if (bits[i]) oneCount++
    }
  })

  it('handles all-ones bitvector', () => {
    const bits = [true, true, true, true, true]
    const bv = new RankSelectBitvector2(bits)
    expect(bv.countOnes()).toBe(5)
    expect(bv.countZeros()).toBe(0)
    expect(bv.rank1(5)).toBe(5)
    expect(bv.select1(0)).toBe(0)
    expect(bv.select1(4)).toBe(4)
  })

  it('handles all-zeros bitvector', () => {
    const bv = new RankSelectBitvector2([false, false, false, false])
    expect(bv.countOnes()).toBe(0)
    expect(bv.select1(0)).toBe(-1)
    expect(bv.select0(0)).toBe(0)
    expect(bv.select0(3)).toBe(3)
  })
})
