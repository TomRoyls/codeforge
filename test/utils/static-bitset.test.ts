import { describe, it, expect } from 'vitest'
import { StaticBitset } from '../../src/utils/static-bitset.js'

describe('StaticBitset', () => {
  it('constructor creates bitset with specified length', () => {
    const bs = new StaticBitset(100)
    expect(bs.length).toBe(100)
  })

  it('constructor throws for negative length', () => {
    expect(() => new StaticBitset(-1)).toThrow(RangeError)
  })

  it('constructor creates empty bitset with zero length', () => {
    const bs = new StaticBitset(0)
    expect(bs.length).toBe(0)
    expect(bs.isEmpty).toBe(true)
  })

  it('static from creates bitset from indices', () => {
    const bs = StaticBitset.from([1, 3, 5])
    expect(bs.length).toBe(6)
    expect(bs.get(1)).toBe(true)
    expect(bs.get(3)).toBe(true)
    expect(bs.get(5)).toBe(true)
    expect(bs.get(0)).toBe(false)
  })

  it('static from with length parameter', () => {
    const bs = StaticBitset.from([1, 3], 10)
    expect(bs.length).toBe(10)
    expect(bs.get(1)).toBe(true)
    expect(bs.get(3)).toBe(true)
    expect(bs.get(5)).toBe(false)
  })

  it('static from empty iterable creates empty bitset', () => {
    const bs = StaticBitset.from([])
    expect(bs.length).toBe(0)
    expect(bs.isEmpty).toBe(true)
  })

  it('static fromRange creates bitset with range', () => {
    const bs = StaticBitset.fromRange(2, 5)
    expect(bs.get(2)).toBe(true)
    expect(bs.get(3)).toBe(true)
    expect(bs.get(4)).toBe(true)
    expect(bs.get(5)).toBe(true)
    expect(bs.get(1)).toBe(false)
    expect(bs.get(6)).toBe(false)
  })

  it('static union combines two bitsets', () => {
    const a = StaticBitset.from([1, 2, 3])
    const b = StaticBitset.from([3, 4, 5])
    const result = StaticBitset.union(a, b)
    expect(result.toArray()).toEqual([1, 2, 3, 4, 5])
  })

  it('static intersection finds common bits', () => {
    const a = StaticBitset.from([1, 2, 3, 4])
    const b = StaticBitset.from([3, 4, 5, 6])
    const result = StaticBitset.intersection(a, b)
    expect(result.toArray()).toEqual([3, 4])
  })

  it('static difference subtracts bitsets', () => {
    const a = StaticBitset.from([1, 2, 3, 4])
    const b = StaticBitset.from([3, 4])
    const result = StaticBitset.difference(a, b)
    expect(result.toArray()).toEqual([1, 2])
  })

  it('set and get work correctly', () => {
    const bs = new StaticBitset(100)
    bs.set(42)
    expect(bs.get(42)).toBe(true)
    expect(bs.get(41)).toBe(false)
  })

  it('set throws for out of range index', () => {
    const bs = new StaticBitset(10)
    expect(() => bs.set(10)).toThrow(RangeError)
    expect(() => bs.set(-1)).toThrow(RangeError)
  })

  it('clear removes bit', () => {
    const bs = new StaticBitset(100)
    bs.set(42)
    bs.clear(42)
    expect(bs.get(42)).toBe(false)
  })

  it('clear throws for out of range index', () => {
    const bs = new StaticBitset(10)
    expect(() => bs.clear(10)).toThrow(RangeError)
  })

  it('flip toggles bit', () => {
    const bs = new StaticBitset(100)
    expect(bs.get(42)).toBe(false)
    bs.flip(42)
    expect(bs.get(42)).toBe(true)
    bs.flip(42)
    expect(bs.get(42)).toBe(false)
  })

  it('flip throws for out of range index', () => {
    const bs = new StaticBitset(10)
    expect(() => bs.flip(10)).toThrow(RangeError)
  })

  it('get returns false for out of range index', () => {
    const bs = new StaticBitset(10)
    expect(bs.get(-1)).toBe(false)
    expect(bs.get(10)).toBe(false)
  })

  it('setRange sets multiple bits', () => {
    const bs = new StaticBitset(100)
    bs.setRange(5, 10)
    expect(bs.get(4)).toBe(false)
    expect(bs.get(5)).toBe(true)
    expect(bs.get(10)).toBe(true)
    expect(bs.get(11)).toBe(false)
  })

  it('setRange handles range beyond length', () => {
    const bs = new StaticBitset(10)
    bs.setRange(8, 20)
    expect(bs.get(8)).toBe(true)
    expect(bs.get(9)).toBe(true)
    expect(bs.get(10)).toBe(false)
  })

  it('clearRange clears multiple bits', () => {
    const bs = new StaticBitset(100)
    bs.setRange(5, 10)
    bs.clearRange(7, 9)
    expect(bs.get(5)).toBe(true)
    expect(bs.get(6)).toBe(true)
    expect(bs.get(7)).toBe(false)
    expect(bs.get(9)).toBe(false)
    expect(bs.get(10)).toBe(true)
  })

  it('popcount returns correct count', () => {
    const bs = new StaticBitset(100)
    expect(bs.popcount).toBe(0)
    bs.set(5)
    bs.set(10)
    bs.set(15)
    expect(bs.popcount).toBe(3)
  })

  it('isEmpty returns true for empty bitset', () => {
    const bs = new StaticBitset(100)
    expect(bs.isEmpty).toBe(true)
  })

  it('isEmpty returns false for non-empty bitset', () => {
    const bs = new StaticBitset(100)
    bs.set(5)
    expect(bs.isEmpty).toBe(false)
  })

  it('isFull returns true for fully set bitset', () => {
    const bs = new StaticBitset(32)
    for (let i = 0; i < 32; i++) {
      bs.set(i)
    }
    expect(bs.isFull).toBe(true)
  })

  it('isFull returns false for partially set bitset', () => {
    const bs = new StaticBitset(32)
    bs.set(5)
    expect(bs.isFull).toBe(false)
  })

  it('nextSet finds next set bit', () => {
    const bs = new StaticBitset(100)
    bs.set(5)
    bs.set(10)
    bs.set(15)
    expect(bs.nextSet(0)).toBe(5)
    expect(bs.nextSet(5)).toBe(5)
    expect(bs.nextSet(6)).toBe(10)
    expect(bs.nextSet(11)).toBe(15)
    expect(bs.nextSet(16)).toBe(-1)
  })

  it('nextClear finds next clear bit', () => {
    const bs = StaticBitset.from([5, 6, 7], 20)
    expect(bs.nextClear(0)).toBe(0)
    expect(bs.nextClear(5)).toBe(8)
    expect(bs.nextClear(8)).toBe(8)
  })

  it('forEach iterates over set bits', () => {
    const bs = StaticBitset.from([1, 3, 5, 7])
    const results: number[] = []
    bs.forEach((i) => results.push(i))
    expect(results).toEqual([1, 3, 5, 7])
  })

  it('toArray returns array of set indices', () => {
    const bs = StaticBitset.from([1, 3, 5, 7])
    expect(bs.toArray()).toEqual([1, 3, 5, 7])
  })

  it('clone creates independent copy', () => {
    const bs = StaticBitset.from([1, 3, 5], 20)
    const clone = bs.clone()
    bs.set(7)
    expect(clone.toArray()).toEqual([1, 3, 5])
    expect(bs.toArray()).toEqual([1, 3, 5, 7])
  })

  it('reset clears all bits', () => {
    const bs = StaticBitset.from([1, 3, 5])
    bs.reset()
    expect(bs.isEmpty).toBe(true)
    expect(bs.get(1)).toBe(false)
  })
})