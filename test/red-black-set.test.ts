import { describe, it, expect } from 'vitest'
import { RedBlackSet } from '../src/core/red-black-set/index.js'

function buildSet<T>(values: T[]): RedBlackSet<T> {
  const set = new RedBlackSet<T>()
  for (const v of values) set.add(v)
  return set
}

// ─── Construction and Basic Properties ───

describe('RedBlackSet: construction and basic properties', () => {
  it('constructs an empty set', () => {
    const set = new RedBlackSet<number>()
    expect(set.size).toBe(0)
    expect(set.isEmpty).toBe(true)
  })

  it('constructs with a custom comparator', () => {
    const set = new RedBlackSet<string>({
      compare: (a, b) => a.localeCompare(b),
    })
    set.add('banana')
    set.add('apple')
    expect(set.toArray()).toEqual(['apple', 'banana'])
  })
})

// ─── Add and Has ───

describe('RedBlackSet: add and has', () => {
  it('add returns true for new elements', () => {
    const set = new RedBlackSet<number>()
    expect(set.add(1)).toBe(true)
    expect(set.add(2)).toBe(true)
    expect(set.add(3)).toBe(true)
    expect(set.size).toBe(3)
  })

  it('add returns false for duplicate elements', () => {
    const set = new RedBlackSet<number>()
    set.add(1)
    expect(set.add(1)).toBe(false)
    expect(set.size).toBe(1)
  })

  it('has returns true for existing elements', () => {
    const set = new RedBlackSet<number>()
    set.add(42)
    expect(set.has(42)).toBe(true)
    expect(set.has(99)).toBe(false)
  })

  it('handles many insertions maintaining order', () => {
    const set = new RedBlackSet<number>()
    for (let i = 10; i >= 1; i--) set.add(i)
    expect(set.size).toBe(10)
    expect(set.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })
})

// ─── Delete ───

describe('RedBlackSet: delete', () => {
  it('delete returns true for existing element', () => {
    const set = new RedBlackSet<number>()
    set.add(1)
    set.add(2)
    set.add(3)
    expect(set.delete(2)).toBe(true)
    expect(set.size).toBe(2)
    expect(set.has(2)).toBe(false)
  })

  it('delete returns false for non-existing element', () => {
    const set = new RedBlackSet<number>()
    set.add(1)
    expect(set.delete(99)).toBe(false)
    expect(set.size).toBe(1)
  })

  it('delete maintains tree balance after many deletions', () => {
    const set = new RedBlackSet<number>()
    for (let i = 1; i <= 20; i++) set.add(i)
    for (let i = 1; i <= 10; i++) set.delete(i)
    expect(set.size).toBe(10)
    expect(set.min()).toBe(11)
    expect(set.max()).toBe(20)
  })

  it('clear empties the set', () => {
    const set = new RedBlackSet<number>()
    set.add(1)
    set.add(2)
    set.clear()
    expect(set.size).toBe(0)
    expect(set.isEmpty).toBe(true)
  })
})

// ─── Min, Max, Floor, Ceiling, Lower, Higher ───

describe('RedBlackSet: order queries', () => {
  it('min returns smallest element', () => {
    const set = buildSet([5, 3, 7])
    expect(set.min()).toBe(3)
  })

  it('min returns undefined for empty set', () => {
    expect(new RedBlackSet<number>().min()).toBeUndefined()
  })

  it('max returns largest element', () => {
    const set = buildSet([5, 3, 7])
    expect(set.max()).toBe(7)
  })

  it('max returns undefined for empty set', () => {
    expect(new RedBlackSet<number>().max()).toBeUndefined()
  })

  it('floor returns greatest element <= value', () => {
    const set = buildSet([5, 3, 7, 1, 9])
    expect(set.floor(5)).toBe(5)
    expect(set.floor(4)).toBe(3)
    expect(set.floor(0)).toBeUndefined()
  })

  it('ceiling returns smallest element >= value', () => {
    const set = buildSet([5, 3, 7, 1, 9])
    expect(set.ceiling(5)).toBe(5)
    expect(set.ceiling(6)).toBe(7)
    expect(set.ceiling(10)).toBeUndefined()
  })

  it('lower returns greatest element strictly less than value', () => {
    const set = buildSet([1, 3, 5, 7])
    expect(set.lower(5)).toBe(3)
    expect(set.lower(1)).toBeUndefined()
  })

  it('higher returns smallest element strictly greater than value', () => {
    const set = buildSet([1, 3, 5, 7])
    expect(set.higher(5)).toBe(7)
    expect(set.higher(7)).toBeUndefined()
  })
})

// ─── Rank, Select, Range ───

describe('RedBlackSet: rank, select, range', () => {
  it('indexOf returns rank of element', () => {
    const set = buildSet([10, 20, 30, 40, 50])
    expect(set.indexOf(10)).toBe(0)
    expect(set.indexOf(30)).toBe(2)
    expect(set.indexOf(50)).toBe(4)
  })

  it('indexOf returns -1 for missing element', () => {
    const set = buildSet([1, 2, 3])
    expect(set.indexOf(99)).toBe(-1)
  })

  it('at returns element at index', () => {
    const set = buildSet([10, 20, 30, 40, 50])
    expect(set.at(0)).toBe(10)
    expect(set.at(2)).toBe(30)
    expect(set.at(4)).toBe(50)
  })

  it('at returns undefined for out of range', () => {
    const set = buildSet([1, 2, 3])
    expect(set.at(-1)).toBeUndefined()
    expect(set.at(3)).toBeUndefined()
  })

  it('range returns elements between lo and hi inclusive', () => {
    const set = buildSet([1, 3, 5, 7, 9])
    expect(set.range(3, 7)).toEqual([3, 5, 7])
    expect(set.range(0, 10)).toEqual([1, 3, 5, 7, 9])
    expect(set.range(10, 20)).toEqual([])
  })
})

// ─── Iteration and Conversion ───

describe('RedBlackSet: iteration and conversion', () => {
  it('toArray returns sorted array', () => {
    const set = buildSet([3, 1, 2])
    expect(set.toArray()).toEqual([1, 2, 3])
  })

  it('forEach iterates in order with correct indices', () => {
    const set = buildSet([10, 20, 30])
    const items: [number, number][] = []
    set.forEach((v, i) => items.push([v, i]))
    expect(items).toEqual([[10, 0], [20, 1], [30, 2]])
  })

  it('is iterable with for-of', () => {
    const set = buildSet([3, 1, 2])
    const result: number[] = []
    for (const v of set) result.push(v)
    expect(result).toEqual([1, 2, 3])
  })
})

// ─── Set Operations ───

describe('RedBlackSet: set operations', () => {
  it('union returns all elements from both sets', () => {
    const a = buildSet([1, 2])
    const b = buildSet([2, 3])
    const u = a.union(b)
    expect(u.toArray()).toEqual([1, 2, 3])
    expect(u.size).toBe(3)
  })

  it('intersection returns common elements', () => {
    const a = buildSet([1, 2, 3])
    const b = buildSet([2, 3, 4])
    const i = a.intersection(b)
    expect(i.toArray()).toEqual([2, 3])
  })

  it('difference returns elements in a not in b', () => {
    const a = buildSet([1, 2, 3, 4])
    const b = buildSet([3, 4, 5])
    const d = a.difference(b)
    expect(d.toArray()).toEqual([1, 2])
  })

  it('symmetricDifference returns elements in either but not both', () => {
    const a = buildSet([1, 2, 3])
    const b = buildSet([2, 3, 4])
    const sd = a.symmetricDifference(b)
    expect(sd.toArray()).toEqual([1, 4])
  })

  it('isSubsetOf returns true when all elements are contained', () => {
    const a = buildSet([1, 2])
    const b = buildSet([1, 2, 3])
    expect(a.isSubsetOf(b)).toBe(true)
    expect(b.isSubsetOf(a)).toBe(false)
  })

  it('isSupersetOf returns true when containing all elements', () => {
    const a = buildSet([1, 2, 3])
    const b = buildSet([1, 2])
    expect(a.isSupersetOf(b)).toBe(true)
    expect(b.isSupersetOf(a)).toBe(false)
  })
})
