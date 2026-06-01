import { describe, expect, it } from 'vitest'
import { Bitset } from '../../src/utils/bitset.js'

describe('Bitset', () => {
  it('starts with all zeros', () => {
    const bs = new Bitset(8)
    expect(bs.count()).toBe(0)
    expect(bs.none()).toBe(true)
    expect(bs.any()).toBe(false)
  })

  it('set and get work', () => {
    const bs = new Bitset(8)
    bs.set(3)
    bs.set(5)
    expect(bs.get(3)).toBe(true)
    expect(bs.get(5)).toBe(true)
    expect(bs.get(0)).toBe(false)
    expect(bs.count()).toBe(2)
  })

  it('clear unsets a bit', () => {
    const bs = new Bitset(8)
    bs.set(3)
    bs.clear(3)
    expect(bs.get(3)).toBe(false)
  })

  it('flip toggles', () => {
    const bs = new Bitset(4)
    bs.flip(1)
    expect(bs.get(1)).toBe(true)
    bs.flip(1)
    expect(bs.get(1)).toBe(false)
  })

  it('bounds check throws', () => {
    const bs = new Bitset(4)
    expect(() => bs.get(-1)).toThrow(RangeError)
    expect(() => bs.get(4)).toThrow(RangeError)
    expect(() => bs.set(10)).toThrow(RangeError)
  })

  it('throws on negative length', () => {
    expect(() => new Bitset(-1)).toThrow(RangeError)
  })

  it('fromArray works', () => {
    const bs = Bitset.fromArray([1, 0, 1, 0, 1])
    expect(bs.count()).toBe(3)
    expect(bs.get(0)).toBe(true)
    expect(bs.get(1)).toBe(false)
  })

  it('toString works', () => {
    const bs = new Bitset(5)
    bs.set(0)
    bs.set(2)
    bs.set(4)
    expect(bs.toString()).toBe('10101')
  })

  it('toArray works', () => {
    const bs = new Bitset(4)
    bs.set(1)
    bs.set(3)
    expect(bs.toArray()).toEqual([0, 1, 0, 1])
  })

  it('clone creates independent copy', () => {
    const bs = new Bitset(4)
    bs.set(0)
    const clone = bs.clone()
    clone.clear(0)
    expect(bs.get(0)).toBe(true)
    expect(clone.get(0)).toBe(false)
  })

  it('all returns true when all set', () => {
    const bs = new Bitset(4)
    bs.set(0); bs.set(1); bs.set(2); bs.set(3)
    expect(bs.all()).toBe(true)
  })

  it('all returns false when not all set', () => {
    const bs = new Bitset(4)
    bs.set(0); bs.set(1); bs.set(2)
    expect(bs.all()).toBe(false)
  })

  it('handles length 0', () => {
    const bs = new Bitset(0)
    expect(bs.count()).toBe(0)
    expect(bs.all()).toBe(false)
    expect(bs.none()).toBe(true)
  })

  it('handles large bitset', () => {
    const bs = new Bitset(1000)
    bs.set(0)
    bs.set(999)
    expect(bs.count()).toBe(2)
    expect(bs.get(0)).toBe(true)
    expect(bs.get(999)).toBe(true)
  })

  it('set then flip returns to zero', () => {
    const bs = new Bitset(4)
    bs.set(2)
    bs.flip(2)
    expect(bs.get(2)).toBe(false)
  })

  it('length returns correct size', () => {
    const bs = new Bitset(42)
    expect(bs.length).toBe(42)
  })

  it('none returns true for empty bitset', () => {
    const bs = new Bitset(5)
    expect(bs.none()).toBe(true)
  })
})
