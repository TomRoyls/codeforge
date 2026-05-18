import { describe, expect, it } from 'vitest'

import { SplayTreeSet } from '../src/core/splay-tree-set/index.js'

// ─── Construction ──────────────────────────────────────
describe('SplayTreeSet construction', () => {
  it('creates empty set', () => {
    const set = new SplayTreeSet<number>()
    expect(set.size).toBe(0)
    expect(set.isEmpty()).toBe(true)
  })
})

// ─── Add ───────────────────────────────────────────────
describe('SplayTreeSet add', () => {
  it('adds unique elements', () => {
    const set = new SplayTreeSet<number>()
    expect(set.add(5)).toBe(true)
    expect(set.add(3)).toBe(true)
    expect(set.size).toBe(2)
  })

  it('rejects duplicates', () => {
    const set = new SplayTreeSet<number>()
    set.add(5)
    expect(set.add(5)).toBe(false)
    expect(set.size).toBe(1)
  })
})

// ─── Has & Delete ──────────────────────────────────────
describe('SplayTreeSet has and delete', () => {
  it('has checks membership', () => {
    const set = new SplayTreeSet<number>()
    set.add(5)
    expect(set.has(5)).toBe(true)
    expect(set.has(6)).toBe(false)
  })

  it('delete removes element', () => {
    const set = new SplayTreeSet<number>()
    set.add(5)
    expect(set.delete(5)).toBe(true)
    expect(set.has(5)).toBe(false)
  })

  it('delete returns false for missing', () => {
    const set = new SplayTreeSet<number>()
    expect(set.delete(99)).toBe(false)
  })
})

// ─── Min & Max ─────────────────────────────────────────
describe('SplayTreeSet min and max', () => {
  it('returns min element', () => {
    const set = new SplayTreeSet<number>()
    set.add(10)
    set.add(5)
    set.add(20)
    expect(set.min()).toBe(5)
  })

  it('returns max element', () => {
    const set = new SplayTreeSet<number>()
    set.add(10)
    set.add(5)
    set.add(20)
    expect(set.max()).toBe(20)
  })

  it('returns undefined on empty', () => {
    const set = new SplayTreeSet<number>()
    expect(set.min()).toBeUndefined()
    expect(set.max()).toBeUndefined()
  })
})

// ─── Navigation ────────────────────────────────────────
describe('SplayTreeSet navigation', () => {
  let set: SplayTreeSet<number>

  beforeEach(() => {
    set = new SplayTreeSet<number>()
    set.add(10)
    set.add(20)
    set.add(30)
  })

  it('floor returns largest <= value', () => expect(set.floor(15)).toBe(10))
  it('floor returns exact match', () => expect(set.floor(20)).toBe(20))
  it('ceiling returns smallest >= value', () => expect(set.ceiling(15)).toBe(20))
  it('lower returns largest < value', () => expect(set.lower(20)).toBe(10))
  it('higher returns smallest > value', () => expect(set.higher(20)).toBe(30))
  it('floor returns undefined when none', () => expect(set.floor(5)).toBeUndefined())
  it('higher returns undefined when none', () => expect(set.higher(30)).toBeUndefined())
})

// ─── Range ─────────────────────────────────────────────
describe('SplayTreeSet range', () => {
  it('returns elements in range', () => {
    const set = new SplayTreeSet<number>()
    for (let i = 1; i <= 5; i++) set.add(i)
    expect([...set.range(2, 4)]).toEqual([2, 3, 4])
  })

  it('count returns number of elements in range', () => {
    const set = new SplayTreeSet<number>()
    for (let i = 1; i <= 5; i++) set.add(i)
    expect(set.count(2, 4)).toBe(3)
  })
})

// ─── IndexOf & At ──────────────────────────────────────
describe('SplayTreeSet indexOf and at', () => {
  it('indexOf returns position', () => {
    const set = new SplayTreeSet<number>()
    set.add(10)
    set.add(20)
    set.add(30)
    expect(set.indexOf(20)).toBe(1)
    expect(set.indexOf(99)).toBe(-1)
  })

  it('at returns element at index', () => {
    const set = new SplayTreeSet<number>()
    set.add(10)
    set.add(20)
    set.add(30)
    expect(set.at(0)).toBe(10)
    expect(set.at(1)).toBe(20)
    expect(set.at(-1)).toBeUndefined()
    expect(set.at(99)).toBeUndefined()
  })
})

// ─── Set Operations ────────────────────────────────────
describe('SplayTreeSet set operations', () => {
  it('union combines sets', () => {
    const a = new SplayTreeSet<number>()
    a.add(1)
    a.add(2)
    const b = new SplayTreeSet<number>()
    b.add(2)
    b.add(3)
    expect(a.union(b).toArray()).toEqual([1, 2, 3])
  })

  it('intersection returns common elements', () => {
    const a = new SplayTreeSet<number>()
    a.add(1)
    a.add(2)
    a.add(3)
    const b = new SplayTreeSet<number>()
    b.add(2)
    b.add(3)
    b.add(4)
    expect(a.intersection(b).toArray()).toEqual([2, 3])
  })

  it('difference returns elements only in first', () => {
    const a = new SplayTreeSet<number>()
    a.add(1)
    a.add(2)
    const b = new SplayTreeSet<number>()
    b.add(2)
    b.add(3)
    expect(a.difference(b).toArray()).toEqual([1])
  })
})

// ─── Iteration ─────────────────────────────────────────
describe('SplayTreeSet iteration', () => {
  it('toArray returns sorted array', () => {
    const set = new SplayTreeSet<number>()
    set.add(3)
    set.add(1)
    set.add(2)
    expect(set.toArray()).toEqual([1, 2, 3])
  })

  it('forEach iterates in order', () => {
    const set = new SplayTreeSet<number>()
    set.add(3)
    set.add(1)
    const result: number[] = []
    set.forEach((v) => result.push(v))
    expect(result).toEqual([1, 3])
  })

  it('is iterable', () => {
    const set = new SplayTreeSet<number>()
    set.add(2)
    set.add(1)
    expect([...set]).toEqual([1, 2])
  })
})

// ─── Clear ─────────────────────────────────────────────
describe('SplayTreeSet clear', () => {
  it('clears the set', () => {
    const set = new SplayTreeSet<number>()
    set.add(1)
    set.add(2)
    set.clear()
    expect(set.size).toBe(0)
    expect(set.isEmpty()).toBe(true)
  })
})
