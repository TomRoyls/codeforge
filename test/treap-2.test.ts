import { describe, it, expect } from 'vitest'
import { Treap } from '../src/core/treap-2/index.js'

// ─── Construction and Insertion ───

describe('Treap2: construction and insertion', () => {
  it('creates an empty treap', () => {
    const t = new Treap<number>()
    expect(t.size).toBe(0)
    expect(t.isEmpty()).toBe(true)
  })

  it('inserts a single key', () => {
    const t = new Treap<number>()
    t.insert(5)
    expect(t.has(5)).toBe(true)
    expect(t.size).toBe(1)
  })

  it('inserts multiple keys', () => {
    const t = new Treap<number>()
    t.insert(5)
    t.insert(3)
    t.insert(7)
    t.insert(1)
    t.insert(9)
    expect(t.size).toBe(5)
    expect(t.toArray()).toEqual([1, 3, 5, 7, 9])
  })

  it('insert with value', () => {
    const t = new Treap<string, number>()
    t.insert('a', 1)
    t.insert('b', 2)
    expect(t.get('a')).toBe(1)
    expect(t.get('b')).toBe(2)
  })

  it('duplicate insert updates value', () => {
    const t = new Treap<string, number>()
    t.insert('a', 1)
    t.insert('a', 2)
    expect(t.get('a')).toBe(2)
    expect(t.size).toBe(1)
  })

  it('from creates treap from key array', () => {
    const t = Treap.from([5, 3, 7, 1, 9])
    expect(t.size).toBe(5)
    expect(t.toArray()).toEqual([1, 3, 5, 7, 9])
  })

  it('from creates treap with values', () => {
    const t = Treap.from(['a', 'b', 'c'], { values: [1, 2, 3] })
    expect(t.get('a')).toBe(1)
    expect(t.get('b')).toBe(2)
  })

  it('supports custom comparator', () => {
    const t = new Treap<number>({ compare: (a, b) => b - a })
    t.insert(1)
    t.insert(5)
    t.insert(3)
    expect(t.toArray()).toEqual([5, 3, 1])
  })
})

// ─── Lookup Operations ───

describe('Treap2: lookup operations', () => {
  const t = Treap.from([1, 3, 5, 7, 9])

  it('has returns true for existing keys', () => {
    expect(t.has(1)).toBe(true)
    expect(t.has(5)).toBe(true)
    expect(t.has(9)).toBe(true)
  })

  it('has returns false for missing keys', () => {
    expect(t.has(0)).toBe(false)
    expect(t.has(4)).toBe(false)
    expect(t.has(10)).toBe(false)
  })

  it('min returns smallest key', () => {
    expect(t.min()).toBe(1)
  })

  it('max returns largest key', () => {
    expect(t.max()).toBe(9)
  })

  it('min/max return undefined for empty treap', () => {
    const empty = new Treap<number>()
    expect(empty.min()).toBeUndefined()
    expect(empty.max()).toBeUndefined()
  })

  it('floor returns largest key <= given key', () => {
    expect(t.floor(5)).toBe(5)
    expect(t.floor(6)).toBe(5)
    expect(t.floor(1)).toBe(1)
  })

  it('ceiling returns smallest key >= given key', () => {
    expect(t.ceiling(5)).toBe(5)
    expect(t.ceiling(4)).toBe(5)
    expect(t.ceiling(9)).toBe(9)
  })

  it('lower returns largest key < given key', () => {
    expect(t.lower(5)).toBe(3)
    expect(t.lower(1)).toBeUndefined()
  })

  it('higher returns smallest key > given key', () => {
    expect(t.higher(5)).toBe(7)
    expect(t.higher(9)).toBeUndefined()
  })

  it('floor/ceiling/lower/higher return undefined for empty', () => {
    const empty = new Treap<number>()
    expect(empty.floor(5)).toBeUndefined()
    expect(empty.ceiling(5)).toBeUndefined()
    expect(empty.lower(5)).toBeUndefined()
    expect(empty.higher(5)).toBeUndefined()
  })
})

// ─── Deletion ───

describe('Treap2: deletion', () => {
  it('deletes an existing key', () => {
    const t = Treap.from([5, 3, 7])
    expect(t.delete(5)).toBe(true)
    expect(t.has(5)).toBe(false)
    expect(t.size).toBe(2)
  })

  it('returns false for deleting missing key', () => {
    const t = Treap.from([5, 3, 7])
    expect(t.delete(4)).toBe(false)
    expect(t.size).toBe(3)
  })

  it('maintains order after deletions', () => {
    const t = Treap.from([1, 2, 3, 4, 5])
    t.delete(3)
    expect(t.toArray()).toEqual([1, 2, 4, 5])
    t.delete(1)
    expect(t.toArray()).toEqual([2, 4, 5])
  })

  it('can delete all elements', () => {
    const t = Treap.from([1, 2, 3])
    t.delete(1)
    t.delete(2)
    t.delete(3)
    expect(t.isEmpty()).toBe(true)
  })
})

// ─── Range Query ───

describe('Treap2: range query', () => {
  const t = Treap.from([1, 3, 5, 7, 9])

  it('range returns keys in range', () => {
    expect(t.range(3, 7)).toEqual([3, 5, 7])
    expect(t.range(1, 9)).toEqual([1, 3, 5, 7, 9])
    expect(t.range(2, 4)).toEqual([3])
  })

  it('range returns empty for invalid range', () => {
    expect(t.range(7, 3)).toEqual([])
  })

  it('range returns empty for no matching keys', () => {
    expect(t.range(10, 20)).toEqual([])
  })
})

// ─── Iteration ───

describe('Treap2: iteration', () => {
  it('forEach iterates in order', () => {
    const t = Treap.from([5, 3, 7])
    const pairs: [number, number][] = []
    t.forEach((key, idx) => pairs.push([key, idx]))
    expect(pairs).toEqual([[3, 0], [5, 1], [7, 2]])
  })

  it('is iterable with for-of', () => {
    const t = Treap.from([3, 1, 2])
    const collected: number[] = []
    for (const k of t) collected.push(k)
    expect(collected).toEqual([1, 2, 3])
  })
})

// ─── Split and Merge ───

describe('Treap2: split and merge', () => {
  it('splitByKey divides the treap', () => {
    const t = Treap.from([1, 2, 3, 4, 5])
    const [left, right] = t.splitByKey(3)
    expect(left.toArray()).toEqual([1, 2])
    expect(right.toArray()).toEqual([3, 4, 5])
  })

  it('splitByKey empties original treap', () => {
    const t = Treap.from([1, 2, 3])
    t.splitByKey(2)
    expect(t.size).toBe(0)
  })

  it('mergeOther merges two treaps', () => {
    const t1 = Treap.from([1, 3, 5])
    const t2 = Treap.from([2, 4, 6])
    t1.mergeOther(t2)
    expect(t1.toArray()).toEqual([1, 2, 3, 4, 5, 6])
    expect(t2.size).toBe(0)
  })
})

// ─── Clear ───

describe('Treap2: clear', () => {
  it('clear removes all elements', () => {
    const t = Treap.from([1, 2, 3])
    t.clear()
    expect(t.isEmpty()).toBe(true)
    expect(t.size).toBe(0)
  })
})
