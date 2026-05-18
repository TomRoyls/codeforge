import { describe, it, expect } from 'vitest'
import { SkipListMap } from '../src/core/skip-list-map/index.js'

// ─── Set / Get / Has ───
describe('SkipListMap set, get, has', () => {
  it('sets and gets values', () => {
    const m = new SkipListMap<number, string>()
    m.set(1, 'one')
    m.set(2, 'two')
    expect(m.get(1)).toBe('one')
    expect(m.get(2)).toBe('two')
    expect(m.get(3)).toBeUndefined()
  })

  it('overwrites existing key', () => {
    const m = new SkipListMap<number, string>()
    m.set(1, 'one')
    m.set(1, 'uno')
    expect(m.get(1)).toBe('uno')
    expect(m.size).toBe(1)
  })

  it('has checks existence', () => {
    const m = new SkipListMap<number, string>()
    m.set(1, 'one')
    expect(m.has(1)).toBe(true)
    expect(m.has(2)).toBe(false)
  })

  it('isEmpty on new map', () => {
    const m = new SkipListMap<number, string>()
    expect(m.isEmpty()).toBe(true)
  })
})

// ─── Delete ───
describe('SkipListMap delete', () => {
  it('deletes existing key', () => {
    const m = new SkipListMap<number, string>()
    m.set(1, 'one')
    m.set(2, 'two')
    expect(m.delete(1)).toBe(true)
    expect(m.has(1)).toBe(false)
    expect(m.size).toBe(1)
  })

  it('returns false for missing key', () => {
    const m = new SkipListMap<number, string>()
    expect(m.delete(1)).toBe(false)
  })
})

// ─── Min / Max ───
describe('SkipListMap min and max', () => {
  it('returns min and max keys', () => {
    const m = new SkipListMap<number, string>()
    m.set(5, 'a')
    m.set(2, 'b')
    m.set(8, 'c')
    expect(m.min()).toBe(2)
    expect(m.max()).toBe(8)
  })

  it('minEntry and maxEntry', () => {
    const m = new SkipListMap<number, string>()
    m.set(1, 'a')
    m.set(3, 'c')
    expect(m.minEntry()).toEqual([1, 'a'])
    expect(m.maxEntry()).toEqual([3, 'c'])
  })

  it('returns undefined for empty', () => {
    const m = new SkipListMap<number, string>()
    expect(m.min()).toBeUndefined()
    expect(m.max()).toBeUndefined()
  })
})

// ─── Bounds / Rank / Select ───
describe('SkipListMap bounds, rank, select', () => {
  const m = new SkipListMap<number, string>()
  m.set(10, 'a')
  m.set(20, 'b')
  m.set(30, 'c')

  it('lowerBound returns first >= key', () => {
    expect(m.lowerBound(15)).toEqual([20, 'b'])
  })

  it('upperBound returns first > key', () => {
    expect(m.upperBound(20)).toEqual([30, 'c'])
  })

  it('rank returns position', () => {
    expect(m.rank(10)).toBe(1)
    expect(m.rank(20)).toBe(2)
    expect(m.rank(99)).toBe(-1)
  })

  it('select returns k-th entry', () => {
    expect(m.select(1)).toEqual([10, 'a'])
    expect(m.select(3)).toEqual([30, 'c'])
    expect(m.select(0)).toBeUndefined()
  })

  it('floor returns largest <= key', () => {
    expect(m.floor(15)).toEqual([10, 'a'])
    expect(m.floor(10)).toEqual([10, 'a'])
  })

  it('ceil returns first >= key', () => {
    expect(m.ceil(15)).toEqual([20, 'b'])
  })

  it('predecessor returns element before', () => {
    expect(m.predecessor(20)).toEqual([10, 'a'])
  })

  it('successor returns element after', () => {
    expect(m.successor(20)).toEqual([30, 'c'])
  })
})

// ─── Iteration ───
describe('SkipListMap iteration', () => {
  it('keys iterator', () => {
    const m = new SkipListMap<number, string>()
    m.set(2, 'b')
    m.set(1, 'a')
    expect([...m.keys()]).toEqual([1, 2])
  })

  it('values iterator', () => {
    const m = new SkipListMap<number, string>()
    m.set(2, 'b')
    m.set(1, 'a')
    expect([...m.values()]).toEqual(['a', 'b'])
  })

  it('entries iterator', () => {
    const m = new SkipListMap<number, string>()
    m.set(1, 'a')
    m.set(2, 'b')
    expect([...m.entries()]).toEqual([[1, 'a'], [2, 'b']])
  })

  it('Symbol.iterator yields entries', () => {
    const m = new SkipListMap<number, string>()
    m.set(1, 'a')
    expect([...m][0]).toEqual([1, 'a'])
  })

  it('forEach', () => {
    const m = new SkipListMap<number, string>()
    m.set(1, 'a')
    m.set(2, 'b')
    const items: [number, string][] = []
    m.forEach((v, k) => items.push([k, v]))
    expect(items).toEqual([[1, 'a'], [2, 'b']])
  })

  it('rangeEntries', () => {
    const m = new SkipListMap<number, string>()
    m.set(1, 'a')
    m.set(5, 'b')
    m.set(10, 'c')
    expect([...m.rangeEntries(1, 5)]).toEqual([[1, 'a'], [5, 'b']])
  })
})

// ─── Clone / Clear / Static ───
describe('SkipListMap clone, clear, static', () => {
  it('clone produces independent copy', () => {
    const m = new SkipListMap<number, string>()
    m.set(1, 'a')
    const c = m.clone()
    c.set(2, 'b')
    expect(m.has(2)).toBe(false)
  })

  it('clear empties map', () => {
    const m = new SkipListMap<number, string>()
    m.set(1, 'a')
    m.clear()
    expect(m.isEmpty()).toBe(true)
  })

  it('static fromEntries', () => {
    const m = SkipListMap.fromEntries([[1, 'a'], [2, 'b']])
    expect(m.get(1)).toBe('a')
    expect(m.size).toBe(2)
  })
})
