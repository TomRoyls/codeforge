import { describe, it, expect } from 'vitest'
import { TreapSet } from '../src/core/treap-set/index.js'

// ─── Construction and Insertion ───

describe('TreapSet: construction and insertion', () => {
  it('creates an empty set', () => {
    const s = new TreapSet<number>()
    expect(s.size).toBe(0)
    expect(s.isEmpty).toBe(true)
  })

  it('adds elements', () => {
    const s = new TreapSet<number>()
    s.add(5)
    s.add(3)
    s.add(7)
    expect(s.size).toBe(3)
    expect(s.has(5)).toBe(true)
  })

  it('ignores duplicate additions', () => {
    const s = new TreapSet<number>()
    s.add(5)
    s.add(5)
    expect(s.size).toBe(1)
  })

  it('fromArray creates set from array', () => {
    const s = TreapSet.fromArray([5, 3, 7, 1, 3])
    expect(s.toArray()).toEqual([1, 3, 5, 7])
  })

  it('supports custom comparator', () => {
    const s = new TreapSet<number>({ comparator: (a, b) => b - a })
    s.add(1)
    s.add(5)
    s.add(3)
    expect(s.toArray()).toEqual([5, 3, 1])
  })
})

// ─── Lookup ───

describe('TreapSet: lookup', () => {
  const s = TreapSet.fromArray([1, 3, 5, 7, 9])

  it('has returns true for existing elements', () => {
    expect(s.has(1)).toBe(true)
    expect(s.has(5)).toBe(true)
  })

  it('has returns false for missing elements', () => {
    expect(s.has(2)).toBe(false)
    expect(s.has(10)).toBe(false)
  })

  it('min returns smallest element', () => {
    expect(s.min()).toBe(1)
  })

  it('max returns largest element', () => {
    expect(s.max()).toBe(9)
  })

  it('min/max return undefined for empty', () => {
    const empty = new TreapSet<number>()
    expect(empty.min()).toBeUndefined()
    expect(empty.max()).toBeUndefined()
  })

  it('first returns min, last returns max', () => {
    expect(s.first()).toBe(1)
    expect(s.last()).toBe(9)
  })
})

// ─── Deletion ───

describe('TreapSet: deletion', () => {
  it('deletes an existing element', () => {
    const s = TreapSet.fromArray([5, 3, 7])
    expect(s.delete(5)).toBe(true)
    expect(s.has(5)).toBe(false)
    expect(s.size).toBe(2)
  })

  it('returns false for deleting missing element', () => {
    const s = TreapSet.fromArray([5, 3, 7])
    expect(s.delete(4)).toBe(false)
  })

  it('maintains order after deletions', () => {
    const s = TreapSet.fromArray([1, 2, 3, 4, 5])
    s.delete(3)
    expect(s.toArray()).toEqual([1, 2, 4, 5])
  })
})

// ─── Bounds Queries ───

describe('TreapSet: bounds queries', () => {
  const s = TreapSet.fromArray([1, 3, 5, 7, 9])

  it('lowerBound returns first element >= value', () => {
    expect(s.lowerBound(3)).toBe(3)
    expect(s.lowerBound(4)).toBe(5)
    expect(s.lowerBound(0)).toBe(1)
  })

  it('upperBound returns first element > value', () => {
    expect(s.upperBound(3)).toBe(5)
    expect(s.upperBound(7)).toBe(9)
  })

  it('predecessor returns largest element < value', () => {
    expect(s.predecessor(5)).toBe(3)
    expect(s.predecessor(1)).toBeUndefined()
  })

  it('successor returns smallest element > value', () => {
    expect(s.successor(5)).toBe(7)
    expect(s.successor(9)).toBeUndefined()
  })
})

// ─── Rank and Select ───

describe('TreapSet: rank and select', () => {
  const s = TreapSet.fromArray([10, 20, 30, 40])

  it('rank returns number of elements less than value', () => {
    expect(s.rank(10)).toBe(0)
    expect(s.rank(20)).toBe(1)
    expect(s.rank(30)).toBe(2)
  })

  it('select returns element at given index', () => {
    expect(s.select(0)).toBe(10)
    expect(s.select(3)).toBe(40)
  })

  it('select returns undefined for out of range', () => {
    expect(s.select(-1)).toBeUndefined()
    expect(s.select(4)).toBeUndefined()
  })
})

// ─── Count ───

describe('TreapSet: count', () => {
  const s = TreapSet.fromArray([1, 3, 5, 7, 9])

  it('count returns number of elements in range', () => {
    expect(s.count(1, 9)).toBe(5)
    expect(s.count(3, 7)).toBe(3)
    expect(s.count(4, 6)).toBe(1)
    expect(s.count(10, 20)).toBe(0)
  })
})

// ─── Iteration ───

describe('TreapSet: iteration', () => {
  it('forEach iterates in order', () => {
    const s = TreapSet.fromArray([3, 1, 2])
    const collected: number[] = []
    s.forEach(v => collected.push(v))
    expect(collected).toEqual([1, 2, 3])
  })

  it('is iterable with for-of', () => {
    const s = TreapSet.fromArray([3, 1, 2])
    expect([...s]).toEqual([1, 2, 3])
  })

  it('toArraySorted returns sorted array', () => {
    const s = TreapSet.fromArray([5, 3, 7])
    expect(s.toArraySorted()).toEqual([3, 5, 7])
  })
})

// ─── Clone, Split, Merge ───

describe('TreapSet: clone, split, merge', () => {
  it('clone creates independent copy', () => {
    const s = TreapSet.fromArray([1, 2, 3])
    const cloned = s.clone()
    s.add(4)
    expect(cloned.has(4)).toBe(false)
  })

  it('split divides the set', () => {
    const s = TreapSet.fromArray([1, 2, 3, 4, 5])
    const [left, right] = s.split(3)
    expect(left.toArray()).toEqual([1, 2])
    expect(right.toArray()).toEqual([3, 4, 5])
  })

  it('merge creates new merged set from disjoint ranges', () => {
    const s1 = TreapSet.fromArray([1, 2])
    const s2 = TreapSet.fromArray([3, 4])
    const merged = s1.merge(s2)
    expect(merged.size).toBe(4)
    expect(merged.toArray()).toEqual([1, 2, 3, 4])
  })
})

// ─── Set Operations ───

describe('TreapSet: set operations', () => {
  const s1 = TreapSet.fromArray([1, 2, 3, 4])
  const s2 = TreapSet.fromArray([3, 4, 5, 6])

  it('union returns all unique elements', () => {
    const u = s1.union(s2)
    expect(u.toArray()).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('intersection returns common elements', () => {
    const i = s1.intersection(s2)
    expect(i.toArray()).toEqual([3, 4])
  })

  it('difference returns elements only in first', () => {
    const d = s1.difference(s2)
    expect(d.toArray()).toEqual([1, 2])
  })

  it('isSubsetOf returns true for subset', () => {
    const sub = TreapSet.fromArray([1, 2])
    expect(sub.isSubsetOf(s1)).toBe(true)
    expect(sub.isSubsetOf(s2)).toBe(false)
  })

  it('isSupersetOf returns true for superset', () => {
    expect(s1.isSupersetOf(TreapSet.fromArray([1, 2]))).toBe(true)
    expect(s1.isSupersetOf(s2)).toBe(false)
  })
})

// ─── Clear ───

describe('TreapSet: clear', () => {
  it('clear empties the set', () => {
    const s = TreapSet.fromArray([1, 2, 3])
    s.clear()
    expect(s.isEmpty).toBe(true)
    expect(s.size).toBe(0)
  })
})
