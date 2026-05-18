import { describe, it, expect } from 'vitest'
import { SuccinctBitvector2 } from '../../src/core/succinct-bitvector-2/index.js'

describe('SuccinctBitvector2', () => {
  // ─── Constructor ───
  it('creates from boolean array', () => {
    const bv = new SuccinctBitvector2([true, false, true])
    expect(bv.length).toBe(3)
    expect(bv.isEmpty()).toBe(false)
  })

  it('creates from empty array', () => {
    const bv = new SuccinctBitvector2([])
    expect(bv.length).toBe(0)
    expect(bv.isEmpty()).toBe(true)
  })

  it('creates from all-true array', () => {
    const bv = new SuccinctBitvector2([true, true, true, true])
    expect(bv.countOnes()).toBe(4)
    expect(bv.countZeros()).toBe(0)
  })

  it('creates from all-false array', () => {
    const bv = new SuccinctBitvector2([false, false, false])
    expect(bv.countOnes()).toBe(0)
    expect(bv.countZeros()).toBe(3)
  })

  // ─── get ───
  it('gets individual bits', () => {
    const bv = new SuccinctBitvector2([true, false, true, false])
    expect(bv.get(0)).toBe(true)
    expect(bv.get(1)).toBe(false)
    expect(bv.get(2)).toBe(true)
    expect(bv.get(3)).toBe(false)
  })

  it('throws on out of bounds get', () => {
    const bv = new SuccinctBitvector2([true, false])
    expect(() => bv.get(-1)).toThrow('Index out of bounds')
    expect(() => bv.get(2)).toThrow('Index out of bounds')
  })

  // ─── rank1 ───
  it('computes rank1 (count of 1s up to index)', () => {
    const bv = new SuccinctBitvector2([true, false, true, true, false])
    expect(bv.rank1(0)).toBe(0)
    expect(bv.rank1(1)).toBe(1)
    expect(bv.rank1(2)).toBe(1)
    expect(bv.rank1(3)).toBe(2)
    expect(bv.rank1(4)).toBe(3)
    expect(bv.rank1(5)).toBe(3)
  })

  it('rank1 handles negative index', () => {
    const bv = new SuccinctBitvector2([true])
    expect(bv.rank1(-1)).toBe(0)
  })

  it('rank1 handles index beyond length', () => {
    const bv = new SuccinctBitvector2([true, false])
    expect(bv.rank1(100)).toBe(1)
  })

  // ─── rank0 ───
  it('computes rank0 (count of 0s up to index)', () => {
    const bv = new SuccinctBitvector2([true, false, true, false])
    expect(bv.rank0(0)).toBe(0)
    expect(bv.rank0(1)).toBe(0)
    expect(bv.rank0(2)).toBe(1)
    expect(bv.rank0(3)).toBe(1)
    expect(bv.rank0(4)).toBe(2)
  })

  it('rank0 handles index at length', () => {
    const bv = new SuccinctBitvector2([true, false, false])
    expect(bv.rank0(3)).toBe(2)
  })

  // ─── select1 ───
  it('finds position of k-th 1-bit', () => {
    const bv = new SuccinctBitvector2([false, true, false, true, false, true])
    expect(bv.select1(0)).toBe(1)
    expect(bv.select1(1)).toBe(3)
    expect(bv.select1(2)).toBe(5)
  })

  it('select1 returns -1 for out of range k', () => {
    const bv = new SuccinctBitvector2([true, false])
    expect(bv.select1(-1)).toBe(-1)
    expect(bv.select1(1)).toBe(-1)
  })

  it('select1 returns -1 for all-zero bitvector', () => {
    const bv = new SuccinctBitvector2([false, false, false])
    expect(bv.select1(0)).toBe(-1)
  })

  // ─── select0 ───
  it('finds position of k-th 0-bit', () => {
    const bv = new SuccinctBitvector2([true, false, true, false, true])
    expect(bv.select0(0)).toBe(1)
    expect(bv.select0(1)).toBe(3)
  })

  it('select0 returns -1 for out of range k', () => {
    const bv = new SuccinctBitvector2([true, false])
    expect(bv.select0(-1)).toBe(-1)
    expect(bv.select0(1)).toBe(-1)
  })

  it('select0 returns -1 for all-one bitvector', () => {
    const bv = new SuccinctBitvector2([true, true, true])
    expect(bv.select0(0)).toBe(-1)
  })

  // ─── countOnes / countZeros ───
  it('counts ones and zeros', () => {
    const bv = new SuccinctBitvector2([true, false, true, false, true])
    expect(bv.countOnes()).toBe(3)
    expect(bv.countZeros()).toBe(2)
  })

  // ─── toArray ───
  it('converts back to boolean array', () => {
    const bits = [true, false, true, true, false]
    const bv = new SuccinctBitvector2(bits)
    expect(bv.toArray()).toEqual(bits)
  })

  // ─── Edge cases ───
  it('handles large bitvector spanning multiple blocks', () => {
    const bits: boolean[] = []
    for (let i = 0; i < 200; i++) {
      bits.push(i % 3 === 0)
    }
    const bv = new SuccinctBitvector2(bits)
    expect(bv.length).toBe(200)
    for (let i = 0; i < 200; i++) {
      expect(bv.get(i)).toBe(i % 3 === 0)
    }
    expect(bv.toArray()).toEqual(bits)
  })

  it('handles single element', () => {
    const bvTrue = new SuccinctBitvector2([true])
    expect(bvTrue.get(0)).toBe(true)
    expect(bvTrue.countOnes()).toBe(1)
    expect(bvTrue.rank1(1)).toBe(1)
    expect(bvTrue.select1(0)).toBe(0)

    const bvFalse = new SuccinctBitvector2([false])
    expect(bvFalse.get(0)).toBe(false)
    expect(bvFalse.countZeros()).toBe(1)
    expect(bvFalse.rank0(1)).toBe(1)
    expect(bvFalse.select0(0)).toBe(0)
  })

  it('rank and select are consistent', () => {
    const bits = [true, true, false, true, false, false, true, true, false, true]
    const bv = new SuccinctBitvector2(bits)

    let oneCount = 0
    for (let i = 0; i < bits.length; i++) {
      expect(bv.rank1(i + 1)).toBe(oneCount + (bits[i] ? 1 : 0))
      if (bits[i]) oneCount++
    }

    for (let k = 0; k < bv.countOnes(); k++) {
      const pos = bv.select1(k)
      expect(pos).toBeGreaterThanOrEqual(0)
      expect(bv.get(pos!)).toBe(true)
    }
  })
})
