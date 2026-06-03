import { describe, expect, it } from 'vitest'
import { DynamicBitset } from '../../src/utils/dynamic-bitset.js'

describe('DynamicBitset', () => {
  it('starts with all zeros', () => {
    const bs = new DynamicBitset(8)
    expect(bs.length).toBe(8)
    expect(bs.count()).toBe(0)
    for (let i = 0; i < 8; i++) expect(bs.get(i)).toBe(false)
  })

  it('set and get work', () => {
    const bs = new DynamicBitset(8)
    bs.set(3)
    bs.set(5)
    expect(bs.get(3)).toBe(true)
    expect(bs.get(5)).toBe(true)
    expect(bs.get(0)).toBe(false)
    expect(bs.count()).toBe(2)
  })

  it('clear unsets a bit', () => {
    const bs = new DynamicBitset(8)
    bs.set(3)
    bs.clear(3)
    expect(bs.get(3)).toBe(false)
  })

  it('flip toggles a bit', () => {
    const bs = new DynamicBitset(4)
    expect(bs.get(1)).toBe(false)
    bs.flip(1)
    expect(bs.get(1)).toBe(true)
    bs.flip(1)
    expect(bs.get(1)).toBe(false)
  })

  it('and operation', () => {
    const a = DynamicBitset.fromString('1100')
    const b = DynamicBitset.fromString('1010')
    expect(a.and(b).toString()).toBe('1000')
  })

  it('or operation', () => {
    const a = DynamicBitset.fromString('1100')
    const b = DynamicBitset.fromString('1010')
    expect(a.or(b).toString()).toBe('1110')
  })

  it('xor operation', () => {
    const a = DynamicBitset.fromString('1100')
    const b = DynamicBitset.fromString('1010')
    expect(a.xor(b).toString()).toBe('0110')
  })

  it('not operation', () => {
    const bs = DynamicBitset.fromString('0101')
    expect(bs.not().toString()).toBe('1010')
  })

  it('fromString works', () => {
    const bs = DynamicBitset.fromString('10101')
    expect(bs.get(0)).toBe(true)
    expect(bs.get(1)).toBe(false)
    expect(bs.get(2)).toBe(true)
    expect(bs.count()).toBe(3)
  })

  it('toString round-trips', () => {
    const bs = DynamicBitset.fromString('110010')
    expect(bs.toString()).toBe('110010')
  })

  it('handles dynamic growth', () => {
    const bs = new DynamicBitset(4)
    bs.set(100)
    expect(bs.get(100)).toBe(true)
    expect(bs.length).toBe(101)
  })

  it('get beyond length returns false', () => {
    const bs = new DynamicBitset(4)
    expect(bs.get(50)).toBe(false)
  })

  it('empty bitset', () => {
    const bs = new DynamicBitset()
    expect(bs.length).toBe(0)
    expect(bs.count()).toBe(0)
  })

  it('large bitset operations', () => {
    const bs = new DynamicBitset(1000)
    bs.set(0)
    bs.set(500)
    bs.set(999)
    expect(bs.count()).toBe(3)
    expect(bs.get(0)).toBe(true)
    expect(bs.get(500)).toBe(true)
    expect(bs.get(999)).toBe(true)
    expect(bs.get(1)).toBe(false)
  })

  it('set extends length dynamically', () => {
    const bs = new DynamicBitset(4)
    bs.set(10)
    expect(bs.length).toBe(11)
    expect(bs.get(10)).toBe(true)
  })

  it('handles flip operation', () => {
    const bs = new DynamicBitset(4)
    bs.set(0)
    bs.flip(0)
    expect(bs.get(0)).toBe(false)
    bs.flip(0)
    expect(bs.get(0)).toBe(true)
  })

  it('count tracks correctly after flip', () => {
    const bs = new DynamicBitset(4)
    bs.set(0)
    bs.set(1)
    bs.flip(0)
    expect(bs.count()).toBe(1)
  })

  it('flip toggles bits', () => {
    const bs = new DynamicBitset()
    bs.set(0)
    bs.flip(0)
    expect(bs.get(0)).toBe(false)
  })

  it('count returns number of set bits', () => {
    const bs = new DynamicBitset(8)
    bs.set(0)
    bs.set(3)
    bs.set(7)
    expect(bs.count()).toBe(3)
  })

  it('unset individual bits', () => {
    const bs = new DynamicBitset(8)
    bs.set(0)
    bs.set(4)
    bs.clear(0)
    bs.clear(4)
    expect(bs.count()).toBe(0)
  })

  it('length property returns bitset length', () => {
    const bs = new DynamicBitset(8)
    expect(bs.length).toBe(8)
  })

  it('count returns number of set bits', () => {
    const bs = new DynamicBitset(8)
    bs.set(0)
    bs.set(3)
    bs.set(7)
    expect(bs.count()).toBe(3)
  })
})
