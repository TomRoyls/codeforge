import { describe, it, expect } from 'vitest'
import { SkipList3 } from '../src/core/skip-list-3/index.js'

// ─── Insert and Has ───
describe('SkipList3 insert and has', () => {
  it('inserts and finds elements', () => {
    const sl = new SkipList3<number>()
    sl.insert(5)
    sl.insert(3)
    sl.insert(7)
    expect(sl.has(5)).toBe(true)
    expect(sl.has(3)).toBe(true)
    expect(sl.has(10)).toBe(false)
  })

  it('ignores duplicate insert', () => {
    const sl = new SkipList3<number>()
    sl.insert(5)
    sl.insert(5)
    expect(sl.size).toBe(1)
  })

  it('isEmpty on new list', () => {
    const sl = new SkipList3<number>()
    expect(sl.isEmpty()).toBe(true)
    expect(sl.size).toBe(0)
  })
})

// ─── Delete ───
describe('SkipList3 delete', () => {
  it('deletes existing element', () => {
    const sl = new SkipList3<number>()
    sl.insert(1)
    sl.insert(2)
    sl.insert(3)
    expect(sl.delete(2)).toBe(true)
    expect(sl.has(2)).toBe(false)
    expect(sl.size).toBe(2)
  })

  it('returns false for missing element', () => {
    const sl = new SkipList3<number>()
    expect(sl.delete(1)).toBe(false)
  })
})

// ─── Get / Rank / At ───
describe('SkipList3 get, rank, at', () => {
  it('get returns key', () => {
    const sl = new SkipList3<number>()
    sl.insert(42)
    expect(sl.get(42)).toBe(42)
    expect(sl.get(99)).toBeUndefined()
  })

  it('rank returns position', () => {
    const sl = new SkipList3<number>()
    sl.insert(10)
    sl.insert(20)
    sl.insert(30)
    expect(sl.rank(10)).toBe(0)
    expect(sl.rank(20)).toBe(1)
    expect(sl.rank(30)).toBe(2)
    expect(sl.rank(99)).toBe(-1)
  })

  it('at returns element at index', () => {
    const sl = new SkipList3<number>()
    sl.insert(10)
    sl.insert(20)
    sl.insert(30)
    expect(sl.at(0)).toBe(10)
    expect(sl.at(2)).toBe(30)
    expect(sl.at(5)).toBeUndefined()
  })

  it('indexOf is alias for rank', () => {
    const sl = new SkipList3<number>()
    sl.insert(10)
    expect(sl.indexOf(10)).toBe(sl.rank(10))
  })

  it('select is alias for at', () => {
    const sl = new SkipList3<number>()
    sl.insert(10)
    expect(sl.select(0)).toBe(sl.at(0))
  })
})

// ─── Min / Max ───
describe('SkipList3 min and max', () => {
  it('returns min and max', () => {
    const sl = new SkipList3<number>()
    sl.insert(5)
    sl.insert(1)
    sl.insert(10)
    expect(sl.min()).toBe(1)
    expect(sl.max()).toBe(10)
  })

  it('returns undefined for empty', () => {
    const sl = new SkipList3<number>()
    expect(sl.min()).toBeUndefined()
    expect(sl.max()).toBeUndefined()
  })
})

// ─── Floor / Ceiling / Lower / Higher ───
describe('SkipList3 floor, ceiling, lower, higher', () => {
  const sl = new SkipList3<number>()
  sl.insert(10)
  sl.insert(20)
  sl.insert(30)

  it('floor returns largest <= key', () => {
    expect(sl.floor(15)).toBe(10)
    expect(sl.floor(20)).toBe(20)
  })

  it('ceiling returns smallest >= key', () => {
    expect(sl.ceiling(15)).toBe(20)
    expect(sl.ceiling(20)).toBe(20)
  })

  it('lower returns largest < key', () => {
    expect(sl.lower(20)).toBe(10)
  })

  it('higher returns smallest > key', () => {
    expect(sl.higher(20)).toBe(30)
  })
})

// ─── Range / Count ───
describe('SkipList3 range and count', () => {
  it('range returns keys in [lo, hi]', () => {
    const sl = new SkipList3<number>()
    sl.insert(1)
    sl.insert(5)
    sl.insert(10)
    sl.insert(15)
    expect([...sl.range(5, 10)]).toEqual([5, 10])
  })

  it('count returns number of keys in range', () => {
    const sl = new SkipList3<number>()
    sl.insert(1)
    sl.insert(5)
    sl.insert(10)
    expect(sl.count(1, 10)).toBe(3)
  })
})

// ─── Iteration ───
describe('SkipList3 iteration', () => {
  it('toArray returns sorted keys', () => {
    const sl = new SkipList3<number>()
    sl.insert(3)
    sl.insert(1)
    sl.insert(2)
    expect(sl.toArray()).toEqual([1, 2, 3])
  })

  it('forEach iterates in order', () => {
    const sl = new SkipList3<number>()
    sl.insert(2)
    sl.insert(1)
    const keys: number[] = []
    sl.forEach((k) => keys.push(k))
    expect(keys).toEqual([1, 2])
  })

  it('Symbol.iterator works', () => {
    const sl = new SkipList3<number>()
    sl.insert(1)
    sl.insert(2)
    expect([...sl]).toEqual([1, 2])
  })

  it('keys iterator', () => {
    const sl = new SkipList3<number>()
    sl.insert(1)
    sl.insert(2)
    expect([...sl.keys()]).toEqual([1, 2])
  })

  it('entries iterator', () => {
    const sl = new SkipList3<number>()
    sl.insert(10)
    sl.insert(20)
    expect([...sl.entries()]).toEqual([[0, 10], [1, 20]])
  })

  it('clear resets', () => {
    const sl = new SkipList3<number>()
    sl.insert(1)
    sl.clear()
    expect(sl.size).toBe(0)
    expect(sl.isEmpty()).toBe(true)
  })
})
