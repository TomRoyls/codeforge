import { describe, it, expect } from 'vitest'
import { DisjointSet } from '../../src/utils/disjoint-set.js'

// ─── Add and Find ─────────────────────────────────────────
describe('DisjointSet - add and find', () => {
  it('adds elements', () => {
    const ds = new DisjointSet<number>()
    expect(ds.add(1)).toBe(true)
    expect(ds.add(2)).toBe(true)
    expect(ds.add(1)).toBe(false)
    expect(ds.elementCount).toBe(2)
  })

  it('find returns the element itself when alone', () => {
    const ds = new DisjointSet<string>()
    ds.add('a')
    expect(ds.find('a')).toBe('a')
  })

  it('find throws for missing element', () => {
    const ds = new DisjointSet<number>()
    expect(() => ds.find(99)).toThrow(RangeError)
  })
})

// ─── Union and Connected ──────────────────────────────────
describe('DisjointSet - union and connected', () => {
  it('unites two sets', () => {
    const ds = new DisjointSet<number>()
    ds.add(1); ds.add(2)
    expect(ds.union(1, 2)).toBe(true)
    expect(ds.connected(1, 2)).toBe(true)
    expect(ds.setCount).toBe(1)
  })

  it('union returns false for same set', () => {
    const ds = new DisjointSet<number>()
    ds.add(1); ds.add(2)
    ds.union(1, 2)
    expect(ds.union(1, 2)).toBe(false)
  })

  it('chains unions correctly', () => {
    const ds = new DisjointSet<number>()
    for (let i = 1; i <= 5; i++) ds.add(i)
    ds.union(1, 2)
    ds.union(3, 4)
    ds.union(2, 3)
    expect(ds.connected(1, 4)).toBe(true)
    expect(ds.connected(1, 5)).toBe(false)
    expect(ds.setCount).toBe(2)
  })
})

// ─── Component operations ─────────────────────────────────
describe('DisjointSet - component operations', () => {
  it('componentSize returns correct size', () => {
    const ds = new DisjointSet<number>()
    ds.add(1); ds.add(2); ds.add(3)
    ds.union(1, 2)
    expect(ds.componentSize(1)).toBe(2)
    expect(ds.componentSize(3)).toBe(1)
  })

  it('getComponent returns all members', () => {
    const ds = new DisjointSet<number>()
    ds.add(1); ds.add(2); ds.add(3)
    ds.union(1, 2)
    const comp = ds.getComponent(1)
    expect(comp).toContain(1)
    expect(comp).toContain(2)
    expect(comp).not.toContain(3)
  })

  it('toArray returns all groups', () => {
    const ds = new DisjointSet<number>()
    ds.add(1); ds.add(2); ds.add(3)
    ds.union(1, 2)
    const groups = ds.toArray()
    expect(groups).toHaveLength(2)
  })
})

// ─── Has and Size ─────────────────────────────────────────
describe('DisjointSet - has and size', () => {
  it('has checks membership', () => {
    const ds = new DisjointSet<string>()
    ds.add('x')
    expect(ds.has('x')).toBe(true)
    expect(ds.has('y')).toBe(false)
  })

  it('isEmpty reflects state', () => {
    const ds = new DisjointSet<number>()
    expect(ds.isEmpty).toBe(true)
    ds.add(1)
    expect(ds.isEmpty).toBe(false)
  })
})

// ─── Stats and Clear ──────────────────────────────────────
describe('DisjointSet - stats and clear', () => {
  it('returns correct stats', () => {
    const ds = new DisjointSet<number>()
    ds.add(1); ds.add(2); ds.add(3)
    ds.union(1, 2)
    const stats = ds.stats()
    expect(stats.elementCount).toBe(3)
    expect(stats.setCount).toBe(2)
    expect(stats.maxSetSize).toBe(2)
  })

  it('clear removes everything', () => {
    const ds = new DisjointSet<number>()
    ds.add(1); ds.add(2); ds.add(3)
    ds.clear()
    expect(ds.elementCount).toBe(0)
    expect(ds.setCount).toBe(0)
    expect(ds.isEmpty).toBe(true)
  })
})
