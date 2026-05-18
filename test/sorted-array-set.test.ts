import { describe, expect, it } from 'vitest'

import { SortedArraySet } from '../src/core/sorted-array-set/index.js'

// ─── Construction ──────────────────────────────────────
describe('SortedArraySet construction', () => {
  it('creates empty set', () => {
    const set = new SortedArraySet<number>()
    expect(set.size).toBe(0)
    expect(set.isEmpty()).toBe(true)
  })

  it('creates with custom comparator', () => {
    const set = new SortedArraySet<string>({
      comparator: (a, b) => a.localeCompare(b),
    })
    set.add('banana')
    set.add('apple')
    expect(set.toArray()).toEqual(['apple', 'banana'])
  })
})

// ─── Add ───────────────────────────────────────────────
describe('SortedArraySet add', () => {
  it('adds unique values', () => {
    const set = new SortedArraySet<number>()
    expect(set.add(1)).toBe(true)
    expect(set.add(2)).toBe(true)
    expect(set.add(3)).toBe(true)
    expect(set.size).toBe(3)
  })

  it('rejects duplicates', () => {
    const set = new SortedArraySet<number>()
    set.add(1)
    expect(set.add(1)).toBe(false)
    expect(set.size).toBe(1)
  })

  it('maintains sorted order', () => {
    const set = new SortedArraySet<number>()
    set.add(3)
    set.add(1)
    set.add(2)
    expect(set.toArray()).toEqual([1, 2, 3])
  })
})

// ─── Has & Delete ──────────────────────────────────────
describe('SortedArraySet has and delete', () => {
  it('has checks membership', () => {
    const set = new SortedArraySet<number>()
    set.add(5)
    expect(set.has(5)).toBe(true)
    expect(set.has(6)).toBe(false)
  })

  it('delete removes element', () => {
    const set = new SortedArraySet<number>()
    set.add(5)
    expect(set.delete(5)).toBe(true)
    expect(set.has(5)).toBe(false)
    expect(set.size).toBe(0)
  })

  it('delete returns false for missing', () => {
    const set = new SortedArraySet<number>()
    expect(set.delete(99)).toBe(false)
  })
})

// ─── Navigation ────────────────────────────────────────
describe('SortedArraySet navigation', () => {
  let set: SortedArraySet<number>

  beforeEach(() => {
    set = new SortedArraySet<number>()
    set.add(10)
    set.add(20)
    set.add(30)
  })

  it('min returns smallest', () => expect(set.min).toBe(10))
  it('max returns largest', () => expect(set.max).toBe(30))
  it('min/max undefined when empty', () => {
    const empty = new SortedArraySet<number>()
    expect(empty.min).toBeUndefined()
    expect(empty.max).toBeUndefined()
  })
  it('floor returns largest <= value', () => expect(set.floor(15)).toBe(10))
  it('floor returns exact match', () => expect(set.floor(20)).toBe(20))
  it('floor returns undefined when none', () => expect(set.floor(5)).toBeUndefined())
  it('ceiling returns smallest >= value', () => expect(set.ceiling(15)).toBe(20))
  it('lower returns largest < value', () => expect(set.lower(20)).toBe(10))
  it('higher returns smallest > value', () => expect(set.higher(20)).toBe(30))
  it('higher undefined when none exists', () => expect(set.higher(30)).toBeUndefined())
})

// ─── Range ─────────────────────────────────────────────
describe('SortedArraySet range', () => {
  it('returns elements in range', () => {
    const set = new SortedArraySet<number>()
    for (let i = 1; i <= 5; i++) set.add(i)
    expect(set.range(2, 4)).toEqual([2, 3, 4])
  })

  it('returns empty for inverted range', () => {
    const set = new SortedArraySet<number>()
    set.add(1)
    expect(set.range(5, 2)).toEqual([])
  })

  it('returns empty for empty set', () => {
    const set = new SortedArraySet<number>()
    expect(set.range(1, 5)).toEqual([])
  })
})

// ─── Index & Get ───────────────────────────────────────
describe('SortedArraySet index access', () => {
  it('get returns element at index', () => {
    const set = new SortedArraySet<number>()
    set.add(10)
    set.add(20)
    set.add(30)
    expect(set.get(0)).toBe(10)
    expect(set.get(1)).toBe(20)
    expect(set.get(-1)).toBeUndefined()
    expect(set.get(99)).toBeUndefined()
  })

  it('indexOf returns position', () => {
    const set = new SortedArraySet<number>()
    set.add(10)
    set.add(20)
    expect(set.indexOf(20)).toBe(1)
    expect(set.indexOf(99)).toBe(-1)
  })
})

// ─── Set Operations ────────────────────────────────────
describe('SortedArraySet set operations', () => {
  it('union combines sets', () => {
    const a = new SortedArraySet<number>()
    a.add(1)
    a.add(2)
    const b = new SortedArraySet<number>()
    b.add(2)
    b.add(3)
    expect(a.union(b).toArray()).toEqual([1, 2, 3])
  })

  it('intersection returns common elements', () => {
    const a = new SortedArraySet<number>()
    a.add(1)
    a.add(2)
    a.add(3)
    const b = new SortedArraySet<number>()
    b.add(2)
    b.add(3)
    b.add(4)
    expect(a.intersection(b).toArray()).toEqual([2, 3])
  })

  it('difference returns elements only in first', () => {
    const a = new SortedArraySet<number>()
    a.add(1)
    a.add(2)
    const b = new SortedArraySet<number>()
    b.add(2)
    b.add(3)
    expect(a.difference(b).toArray()).toEqual([1])
  })

  it('symmetricDifference returns non-common elements', () => {
    const a = new SortedArraySet<number>()
    a.add(1)
    a.add(2)
    const b = new SortedArraySet<number>()
    b.add(2)
    b.add(3)
    expect(a.symmetricDifference(b).toArray()).toEqual([1, 3])
  })

  it('isSubsetOf checks containment', () => {
    const a = new SortedArraySet<number>()
    a.add(1)
    a.add(2)
    const b = new SortedArraySet<number>()
    b.add(1)
    b.add(2)
    b.add(3)
    expect(a.isSubsetOf(b)).toBe(true)
    expect(b.isSubsetOf(a)).toBe(false)
  })

  it('isSupersetOf checks containment', () => {
    const a = new SortedArraySet<number>()
    a.add(1)
    a.add(2)
    a.add(3)
    const b = new SortedArraySet<number>()
    b.add(2)
    expect(a.isSupersetOf(b)).toBe(true)
  })

  it('empty set is subset of everything', () => {
    const empty = new SortedArraySet<number>()
    const other = new SortedArraySet<number>()
    other.add(1)
    expect(empty.isSubsetOf(other)).toBe(true)
  })
})

// ─── Iteration ─────────────────────────────────────────
describe('SortedArraySet iteration', () => {
  it('forEach iterates in order', () => {
    const set = new SortedArraySet<number>()
    set.add(3)
    set.add(1)
    set.add(2)
    const result: number[] = []
    set.forEach((v) => result.push(v))
    expect(result).toEqual([1, 2, 3])
  })

  it('is iterable', () => {
    const set = new SortedArraySet<number>()
    set.add(2)
    set.add(1)
    expect([...set]).toEqual([1, 2])
  })
})

// ─── Clear & Stats ─────────────────────────────────────
describe('SortedArraySet clear and stats', () => {
  it('clear empties the set', () => {
    const set = new SortedArraySet<number>()
    set.add(1)
    set.clear()
    expect(set.size).toBe(0)
    expect(set.isEmpty()).toBe(true)
  })

  it('stats returns correct info', () => {
    const set = new SortedArraySet<number>()
    set.add(5)
    set.add(10)
    const s = set.stats()
    expect(s.size).toBe(2)
    expect(s.min).toBe(5)
    expect(s.max).toBe(10)
  })

  it('stats on empty set', () => {
    const set = new SortedArraySet<number>()
    const s = set.stats()
    expect(s.size).toBe(0)
    expect(s.min).toBeUndefined()
    expect(s.max).toBeUndefined()
  })
})
