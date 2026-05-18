import { describe, it, expect } from 'vitest'
import { Treap3 } from '../src/core/treap-3/index.js'

// ─── Construction and Insertion ───

describe('Treap3: construction and insertion', () => {
  it('creates an empty treap', () => {
    const t = new Treap3<number, string>()
    expect(t.isEmpty).toBe(true)
    expect(t.size).toBe(0)
  })

  it('inserts a single key-value pair', () => {
    const t = new Treap3<number, string>()
    t.insert(5, 'five')
    expect(t.contains(5)).toBe(true)
    expect(t.search(5)).toBe('five')
    expect(t.size).toBe(1)
  })

  it('inserts multiple keys maintaining order', () => {
    const t = new Treap3<number, string>()
    t.insert(5, 'five')
    t.insert(3, 'three')
    t.insert(7, 'seven')
    t.insert(1, 'one')
    t.insert(9, 'nine')
    expect(t.toArray()).toEqual([[1, 'one'], [3, 'three'], [5, 'five'], [7, 'seven'], [9, 'nine']])
  })

  it('updates value on duplicate key', () => {
    const t = new Treap3<number, string>()
    t.insert(5, 'old')
    t.insert(5, 'new')
    expect(t.search(5)).toBe('new')
    expect(t.size).toBe(1)
  })
})

// ─── Search and Contains ───

describe('Treap3: search and contains', () => {
  const t = new Treap3<number, string>()
  t.insert(1, 'one')
  t.insert(3, 'three')
  t.insert(5, 'five')

  it('search returns value for existing key', () => {
    expect(t.search(1)).toBe('one')
    expect(t.search(3)).toBe('three')
    expect(t.search(5)).toBe('five')
  })

  it('search returns undefined for missing key', () => {
    expect(t.search(2)).toBeUndefined()
    expect(t.search(10)).toBeUndefined()
  })

  it('contains returns boolean', () => {
    expect(t.contains(1)).toBe(true)
    expect(t.contains(2)).toBe(false)
  })
})

// ─── Min and Max ───

describe('Treap3: min and max', () => {
  it('min returns smallest key', () => {
    const t = new Treap3<number, string>()
    t.insert(5, 'five')
    t.insert(3, 'three')
    t.insert(7, 'seven')
    expect(t.min()).toBe(3)
  })

  it('max returns largest key', () => {
    const t = new Treap3<number, string>()
    t.insert(5, 'five')
    t.insert(3, 'three')
    t.insert(7, 'seven')
    expect(t.max()).toBe(7)
  })

  it('min and max return undefined for empty treap', () => {
    const t = new Treap3<number, string>()
    expect(t.min()).toBeUndefined()
    expect(t.max()).toBeUndefined()
  })
})

// ─── Deletion ───

describe('Treap3: deletion', () => {
  it('deletes an existing key', () => {
    const t = new Treap3<number, string>()
    t.insert(5, 'five')
    t.insert(3, 'three')
    t.insert(7, 'seven')
    t.delete(5)
    expect(t.contains(5)).toBe(false)
    expect(t.size).toBe(2)
  })

  it('delete on missing key does nothing', () => {
    const t = new Treap3<number, string>()
    t.insert(5, 'five')
    t.delete(10)
    expect(t.size).toBe(1)
  })

  it('maintains correct order after deletions', () => {
    const t = new Treap3<number, string>()
    for (let i = 1; i <= 5; i++) t.insert(i, String(i))
    t.delete(3)
    expect(t.toArray().map(([k]) => k)).toEqual([1, 2, 4, 5])
  })

  it('can delete all elements', () => {
    const t = new Treap3<number, string>()
    t.insert(1, 'a')
    t.insert(2, 'b')
    t.delete(1)
    t.delete(2)
    expect(t.isEmpty).toBe(true)
  })
})

// ─── Traversal ───

describe('Treap3: traversal', () => {
  it('toArray returns key-value pairs in order', () => {
    const t = new Treap3<number, string>()
    t.insert(3, 'c')
    t.insert(1, 'a')
    t.insert(2, 'b')
    expect(t.toArray()).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
  })

  it('inOrderTraversal is alias for toArray', () => {
    const t = new Treap3<number, string>()
    t.insert(2, 'b')
    t.insert(1, 'a')
    expect(t.inOrderTraversal()).toEqual([[1, 'a'], [2, 'b']])
  })
})

// ─── Split ───

describe('Treap3: split', () => {
  it('splits treap at a given key', () => {
    const t = new Treap3<number, string>()
    t.insert(1, 'a')
    t.insert(2, 'b')
    t.insert(3, 'c')
    t.insert(4, 'd')
    t.insert(5, 'e')
    const [left, right] = t.split(3)
    expect(left.toArray().map(([k]) => k)).toEqual([1, 2])
    expect(right.toArray().map(([k]) => k)).toEqual([3, 4, 5])
  })

  it('split at low end yields empty left', () => {
    const t = new Treap3<number, string>()
    t.insert(1, 'a')
    t.insert(2, 'b')
    const [left, right] = t.split(0)
    expect(left.isEmpty).toBe(true)
    expect(right.toArray().map(([k]) => k)).toEqual([1, 2])
  })

  it('split at high end yields empty right', () => {
    const t = new Treap3<number, string>()
    t.insert(1, 'a')
    t.insert(2, 'b')
    const [left, right] = t.split(10)
    expect(left.toArray().map(([k]) => k)).toEqual([1, 2])
    expect(right.isEmpty).toBe(true)
  })
})

// ─── Merge ───

describe('Treap3: merge', () => {
  it('merges two treaps with disjoint key ranges', () => {
    const t1 = new Treap3<number, string>()
    t1.insert(1, 'a')
    t1.insert(2, 'b')
    const t2 = new Treap3<number, string>()
    t2.insert(3, 'c')
    t2.insert(4, 'd')
    t1.merge(t2)
    expect(t1.size).toBe(4)
    expect(t1.toArray()).toEqual([[1, 'a'], [2, 'b'], [3, 'c'], [4, 'd']])
  })

  it('merge with empty treap is no-op', () => {
    const t1 = new Treap3<number, string>()
    t1.insert(1, 'a')
    const t2 = new Treap3<number, string>()
    t1.merge(t2)
    expect(t1.toArray()).toEqual([[1, 'a']])
  })
})

// ─── Clear ───

describe('Treap3: clear', () => {
  it('clear removes all elements', () => {
    const t = new Treap3<number, string>()
    t.insert(1, 'a')
    t.insert(2, 'b')
    t.clear()
    expect(t.isEmpty).toBe(true)
    expect(t.size).toBe(0)
  })
})
