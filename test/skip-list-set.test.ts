import { describe, it, expect } from 'vitest'
import { SkipListSet } from '../src/core/skip-list-set/index.js'

// ─── Add / Has ───
describe('SkipListSet add and has', () => {
  it('adds and checks membership', () => {
    const sl = new SkipListSet<number>()
    expect(sl.add(5)).toBe(true)
    expect(sl.has(5)).toBe(true)
    expect(sl.has(10)).toBe(false)
  })

  it('returns false for duplicate add', () => {
    const sl = new SkipListSet<number>()
    sl.add(5)
    expect(sl.add(5)).toBe(false)
    expect(sl.size).toBe(1)
  })

  it('isEmpty on new set', () => {
    const sl = new SkipListSet<number>()
    expect(sl.isEmpty()).toBe(true)
  })
})

// ─── Delete ───
describe('SkipListSet delete', () => {
  it('deletes existing element', () => {
    const sl = new SkipListSet<number>()
    sl.add(1)
    sl.add(2)
    expect(sl.delete(1)).toBe(true)
    expect(sl.has(1)).toBe(false)
    expect(sl.size).toBe(1)
  })

  it('returns false for missing', () => {
    const sl = new SkipListSet<number>()
    expect(sl.delete(1)).toBe(false)
  })
})

// ─── Get / IndexOf ───
describe('SkipListSet get and indexOf', () => {
  it('get returns element at index', () => {
    const sl = new SkipListSet<number>()
    sl.add(10)
    sl.add(20)
    sl.add(30)
    expect(sl.get(0)).toBe(10)
    expect(sl.get(2)).toBe(30)
    expect(sl.get(5)).toBeUndefined()
  })

  it('indexOf returns position', () => {
    const sl = new SkipListSet<number>()
    sl.add(10)
    sl.add(20)
    expect(sl.indexOf(10)).toBe(0)
    expect(sl.indexOf(20)).toBe(1)
    expect(sl.indexOf(99)).toBe(-1)
  })
})

// ─── Floor / Ceiling / Lower / Higher ───
describe('SkipListSet floor, ceiling, lower, higher', () => {
  const sl = new SkipListSet<number>()
  sl.add(10)
  sl.add(20)
  sl.add(30)

  it('floor returns largest <= value', () => {
    expect(sl.floor(15)).toBe(10)
    expect(sl.floor(20)).toBe(20)
    expect(sl.floor(5)).toBeUndefined()
  })

  it('ceiling returns smallest >= value', () => {
    expect(sl.ceiling(15)).toBe(20)
    expect(sl.ceiling(20)).toBe(20)
  })

  it('lower returns largest < value', () => {
    expect(sl.lower(20)).toBe(10)
    expect(sl.lower(10)).toBeUndefined()
  })

  it('higher returns smallest > value', () => {
    expect(sl.higher(20)).toBe(30)
    expect(sl.higher(30)).toBeUndefined()
  })
})

// ─── Range ───
describe('SkipListSet range', () => {
  it('range returns values in [lo, hi]', () => {
    const sl = new SkipListSet<number>()
    sl.add(1)
    sl.add(5)
    sl.add(10)
    sl.add(15)
    expect([...sl.range(5, 10)]).toEqual([5, 10])
  })
})

// ─── Min / Max ───
describe('SkipListSet min and max', () => {
  it('returns min and max', () => {
    const sl = new SkipListSet<number>()
    sl.add(5)
    sl.add(1)
    sl.add(10)
    expect(sl.min()).toBe(1)
    expect(sl.max()).toBe(10)
  })

  it('returns undefined for empty', () => {
    const sl = new SkipListSet<number>()
    expect(sl.min()).toBeUndefined()
    expect(sl.max()).toBeUndefined()
  })
})

// ─── Iteration ───
describe('SkipListSet iteration', () => {
  it('toArray returns sorted', () => {
    const sl = new SkipListSet<number>()
    sl.add(3)
    sl.add(1)
    sl.add(2)
    expect(sl.toArray()).toEqual([1, 2, 3])
  })

  it('forEach iterates in order', () => {
    const sl = new SkipListSet<number>()
    sl.add(2)
    sl.add(1)
    const items: number[] = []
    sl.forEach((v) => items.push(v))
    expect(items).toEqual([1, 2])
  })

  it('Symbol.iterator works', () => {
    const sl = new SkipListSet<number>()
    sl.add(1)
    sl.add(2)
    expect([...sl]).toEqual([1, 2])
  })

  it('values iterator', () => {
    const sl = new SkipListSet<number>()
    sl.add(1)
    sl.add(2)
    expect([...sl.values()]).toEqual([1, 2])
  })

  it('clear resets', () => {
    const sl = new SkipListSet<number>()
    sl.add(1)
    sl.clear()
    expect(sl.size).toBe(0)
    expect(sl.isEmpty()).toBe(true)
  })
})
