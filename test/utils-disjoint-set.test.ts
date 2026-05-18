import { beforeEach, describe, expect, it } from 'vitest'

import { DisjointSet } from '../src/utils/disjoint-set.js'

// ─── add ────────────────────────────────────────────────
describe('DisjointSet add', () => {
  let ds: DisjointSet<string>

  beforeEach(() => {
    ds = new DisjointSet()
  })

  it('adds a new element and returns true', () => {
    expect(ds.add('a')).toBe(true)
    expect(ds.elementCount).toBe(1)
    expect(ds.setCount).toBe(1)
  })

  it('returns false for duplicate element', () => {
    ds.add('a')
    expect(ds.add('a')).toBe(false)
    expect(ds.elementCount).toBe(1)
  })

  it('adds multiple elements', () => {
    ds.add('a')
    ds.add('b')
    ds.add('c')
    expect(ds.elementCount).toBe(3)
    expect(ds.setCount).toBe(3)
  })
})

// ─── find ───────────────────────────────────────────────
describe('DisjointSet find', () => {
  let ds: DisjointSet<string>

  beforeEach(() => {
    ds = new DisjointSet()
    ds.add('a')
    ds.add('b')
  })

  it('returns the element itself as root', () => {
    expect(ds.find('a')).toBe('a')
    expect(ds.find('b')).toBe('b')
  })

  it('throws for missing element', () => {
    expect(() => ds.find('z')).toThrow(RangeError)
  })

  it('returns same root after union', () => {
    ds.union('a', 'b')
    expect(ds.find('a')).toBe(ds.find('b'))
  })
})

// ─── union ──────────────────────────────────────────────
describe('DisjointSet union', () => {
  let ds: DisjointSet<string>

  beforeEach(() => {
    ds = new DisjointSet()
    ds.add('a')
    ds.add('b')
    ds.add('c')
  })

  it('merges two separate sets', () => {
    expect(ds.union('a', 'b')).toBe(true)
    expect(ds.setCount).toBe(2)
  })

  it('returns false for same set', () => {
    ds.union('a', 'b')
    expect(ds.union('a', 'b')).toBe(false)
    expect(ds.setCount).toBe(2)
  })

  it('handles chain of unions', () => {
    ds.union('a', 'b')
    ds.union('b', 'c')
    expect(ds.setCount).toBe(1)
    expect(ds.connected('a', 'c')).toBe(true)
  })
})

// ─── connected ──────────────────────────────────────────
describe('DisjointSet connected', () => {
  it('returns false for separate elements', () => {
    const ds = new DisjointSet<number>()
    ds.add(1)
    ds.add(2)
    expect(ds.connected(1, 2)).toBe(false)
  })

  it('returns true after union', () => {
    const ds = new DisjointSet<number>()
    ds.add(1)
    ds.add(2)
    ds.union(1, 2)
    expect(ds.connected(1, 2)).toBe(true)
  })

  it('returns true for same element', () => {
    const ds = new DisjointSet<number>()
    ds.add(1)
    expect(ds.connected(1, 1)).toBe(true)
  })
})

// ─── componentSize ──────────────────────────────────────
describe('DisjointSet componentSize', () => {
  it('returns 1 for singleton', () => {
    const ds = new DisjointSet<string>()
    ds.add('a')
    expect(ds.componentSize('a')).toBe(1)
  })

  it('returns merged size', () => {
    const ds = new DisjointSet<string>()
    ds.add('a')
    ds.add('b')
    ds.add('c')
    ds.union('a', 'b')
    expect(ds.componentSize('a')).toBe(2)
    expect(ds.componentSize('c')).toBe(1)
  })
})

// ─── has ────────────────────────────────────────────────
describe('DisjointSet has', () => {
  it('returns true for added element', () => {
    const ds = new DisjointSet<string>()
    ds.add('x')
    expect(ds.has('x')).toBe(true)
  })

  it('returns false for missing element', () => {
    const ds = new DisjointSet<string>()
    expect(ds.has('x')).toBe(false)
  })
})

// ─── getComponent ───────────────────────────────────────
describe('DisjointSet getComponent', () => {
  it('returns all members of a component', () => {
    const ds = new DisjointSet<string>()
    ds.add('a')
    ds.add('b')
    ds.add('c')
    ds.union('a', 'c')
    const comp = ds.getComponent('a')
    expect(comp.sort()).toEqual(['a', 'c'])
  })
})

// ─── toArray ────────────────────────────────────────────
describe('DisjointSet toArray', () => {
  it('returns singletons', () => {
    const ds = new DisjointSet<number>()
    ds.add(1)
    ds.add(2)
    const groups = ds.toArray()
    expect(groups.length).toBe(2)
  })

  it('returns merged groups', () => {
    const ds = new DisjointSet<number>()
    ds.add(1)
    ds.add(2)
    ds.add(3)
    ds.union(1, 3)
    const groups = ds.toArray()
    expect(groups.length).toBe(2)
    const sorted = groups.map(g => g.sort()).sort((a, b) => a[0]! - b[0]!)
    expect(sorted).toEqual([[1, 3], [2]])
  })
})

// ─── clear ──────────────────────────────────────────────
describe('DisjointSet clear', () => {
  it('empties the set', () => {
    const ds = new DisjointSet<number>()
    ds.add(1)
    ds.add(2)
    ds.union(1, 2)
    ds.clear()
    expect(ds.elementCount).toBe(0)
    expect(ds.setCount).toBe(0)
    expect(ds.isEmpty).toBe(true)
  })
})

// ─── isEmpty ────────────────────────────────────────────
describe('DisjointSet isEmpty', () => {
  it('is true when empty', () => {
    const ds = new DisjointSet<string>()
    expect(ds.isEmpty).toBe(true)
  })

  it('is false after add', () => {
    const ds = new DisjointSet<string>()
    ds.add('x')
    expect(ds.isEmpty).toBe(false)
  })
})

// ─── stats ──────────────────────────────────────────────
describe('DisjointSet stats', () => {
  it('returns correct stats', () => {
    const ds = new DisjointSet<string>()
    ds.add('a')
    ds.add('b')
    ds.add('c')
    ds.union('a', 'b')
    const s = ds.stats()
    expect(s.elementCount).toBe(3)
    expect(s.setCount).toBe(2)
    expect(s.maxSetSize).toBe(2)
  })
})

// ─── generic types ──────────────────────────────────────
describe('DisjointSet generic types', () => {
  it('works with number keys', () => {
    const ds = new DisjointSet<number>()
    ds.add(1)
    ds.add(2)
    ds.union(1, 2)
    expect(ds.connected(1, 2)).toBe(true)
  })
})

// ─── path compression ──────────────────────────────────
describe('DisjointSet path compression', () => {
  it('flattens deep chains', () => {
    const ds = new DisjointSet<number>()
    for (let i = 0; i < 100; i++) ds.add(i)
    for (let i = 1; i < 100; i++) ds.union(i - 1, i)
    expect(ds.setCount).toBe(1)
    expect(ds.connected(0, 99)).toBe(true)
    expect(ds.componentSize(0)).toBe(100)
  })
})
