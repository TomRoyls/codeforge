import { describe, it, expect } from 'vitest'
import { RoaringBitmap3 } from '../../src/core/roaring-bitmap-3/index.js'

describe('RoaringBitmap3', () => {
  // ─── Constructor ───
  it('creates an empty bitmap', () => {
    const bm = new RoaringBitmap3()
    expect(bm.size).toBe(0)
    expect(bm.isEmpty()).toBe(true)
  })

  // ─── add / has ───
  it('adds values and checks membership', () => {
    const bm = new RoaringBitmap3()
    bm.add(5)
    bm.add(100)
    bm.add(0)
    expect(bm.has(5)).toBe(true)
    expect(bm.has(100)).toBe(true)
    expect(bm.has(0)).toBe(true)
    expect(bm.has(1)).toBe(false)
    expect(bm.size).toBe(3)
    expect(bm.isEmpty()).toBe(false)
  })

  it('handles duplicate adds', () => {
    const bm = new RoaringBitmap3()
    bm.add(42)
    bm.add(42)
    bm.add(42)
    expect(bm.size).toBe(1)
    expect(bm.has(42)).toBe(true)
  })

  // ─── delete ───
  it('deletes a value and returns true', () => {
    const bm = new RoaringBitmap3()
    bm.add(10)
    expect(bm.delete(10)).toBe(true)
    expect(bm.has(10)).toBe(false)
    expect(bm.size).toBe(0)
  })

  it('returns false when deleting non-existent value', () => {
    const bm = new RoaringBitmap3()
    expect(bm.delete(999)).toBe(false)
  })

  // ─── and ───
  it('computes intersection with and()', () => {
    const a = new RoaringBitmap3()
    const b = new RoaringBitmap3()
    a.add(1)
    a.add(2)
    a.add(3)
    b.add(2)
    b.add(3)
    b.add(4)
    const result = a.and(b)
    expect(result.toArray()).toEqual([2, 3])
    expect(result.size).toBe(2)
  })

  it('returns empty from and() with no overlap', () => {
    const a = new RoaringBitmap3()
    const b = new RoaringBitmap3()
    a.add(1)
    b.add(2)
    expect(a.and(b).size).toBe(0)
  })

  it('returns empty from and() with empty operand', () => {
    const a = new RoaringBitmap3()
    const b = new RoaringBitmap3()
    a.add(1)
    a.add(2)
    expect(a.and(b).size).toBe(0)
    expect(b.and(a).size).toBe(0)
  })

  // ─── or ───
  it('computes union with or()', () => {
    const a = new RoaringBitmap3()
    const b = new RoaringBitmap3()
    a.add(1)
    a.add(2)
    b.add(2)
    b.add(3)
    const result = a.or(b)
    expect(result.toArray()).toEqual([1, 2, 3])
    expect(result.size).toBe(3)
  })

  it('or() with empty operand returns copy', () => {
    const a = new RoaringBitmap3()
    const b = new RoaringBitmap3()
    a.add(5)
    a.add(10)
    expect(a.or(b).toArray()).toEqual([5, 10])
    expect(b.or(a).toArray()).toEqual([5, 10])
  })

  it('or() of two empty bitmaps is empty', () => {
    const a = new RoaringBitmap3()
    const b = new RoaringBitmap3()
    expect(a.or(b).size).toBe(0)
  })

  // ─── xor ───
  it('computes symmetric difference with xor()', () => {
    const a = new RoaringBitmap3()
    const b = new RoaringBitmap3()
    a.add(1)
    a.add(2)
    a.add(3)
    b.add(2)
    b.add(3)
    b.add(4)
    const result = a.xor(b)
    expect(result.toArray()).toEqual([1, 4])
  })

  it('xor() of identical bitmaps is empty', () => {
    const a = new RoaringBitmap3()
    const b = new RoaringBitmap3()
    a.add(1)
    a.add(2)
    b.add(1)
    b.add(2)
    expect(a.xor(b).size).toBe(0)
  })

  it('xor() with empty operand returns copy', () => {
    const a = new RoaringBitmap3()
    const b = new RoaringBitmap3()
    a.add(7)
    expect(a.xor(b).toArray()).toEqual([7])
  })

  // ─── min / max ───
  it('returns min value', () => {
    const bm = new RoaringBitmap3()
    bm.add(100)
    bm.add(5)
    bm.add(50)
    expect(bm.min()).toBe(5)
  })

  it('returns max value', () => {
    const bm = new RoaringBitmap3()
    bm.add(100)
    bm.add(5)
    bm.add(50)
    expect(bm.max()).toBe(100)
  })

  it('returns undefined min/max on empty bitmap', () => {
    const bm = new RoaringBitmap3()
    expect(bm.min()).toBeUndefined()
    expect(bm.max()).toBeUndefined()
  })

  // ─── toArray ───
  it('returns sorted array', () => {
    const bm = new RoaringBitmap3()
    bm.add(30)
    bm.add(10)
    bm.add(20)
    expect(bm.toArray()).toEqual([10, 20, 30])
  })

  it('returns empty array for empty bitmap', () => {
    const bm = new RoaringBitmap3()
    expect(bm.toArray()).toEqual([])
  })

  // ─── forEach ───
  it('iterates in sorted order via forEach', () => {
    const bm = new RoaringBitmap3()
    bm.add(30)
    bm.add(10)
    bm.add(20)
    const collected: number[] = []
    bm.forEach((v) => collected.push(v))
    expect(collected).toEqual([10, 20, 30])
  })

  // ─── clear ───
  it('clears all values', () => {
    const bm = new RoaringBitmap3()
    bm.add(1)
    bm.add(2)
    bm.add(3)
    bm.clear()
    expect(bm.size).toBe(0)
    expect(bm.isEmpty()).toBe(true)
    expect(bm.has(1)).toBe(false)
  })

  // ─── Edge cases ───
  it('handles large values', () => {
    const bm = new RoaringBitmap3()
    bm.add(Number.MAX_SAFE_INTEGER)
    bm.add(0)
    expect(bm.has(Number.MAX_SAFE_INTEGER)).toBe(true)
    expect(bm.min()).toBe(0)
    expect(bm.max()).toBe(Number.MAX_SAFE_INTEGER)
  })

  it('handles negative values', () => {
    const bm = new RoaringBitmap3()
    bm.add(-5)
    bm.add(-1)
    bm.add(0)
    expect(bm.has(-5)).toBe(true)
    expect(bm.min()).toBe(-5)
    expect(bm.max()).toBe(0)
  })
})
