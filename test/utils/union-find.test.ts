import { describe, expect, it } from 'vitest'
import { UnionFind } from '../../src/utils/union-find.js'

// ─── Construction ───

describe('UnionFind construction', () => {
  it('starts empty', () => {
    const uf = new UnionFind()
    expect(uf.elementCount).toBe(0)
    expect(uf.setCount).toBe(0)
    expect(uf.isEmpty).toBe(true)
  })

  it('creates with initial capacity', () => {
    const uf = new UnionFind({ initialCapacity: 5 })
    expect(uf.elementCount).toBe(5)
    expect(uf.setCount).toBe(5)
    expect(uf.isEmpty).toBe(false)
  })
})

// ─── makeSet ───

describe('UnionFind makeSet', () => {
  it('returns sequential ids', () => {
    const uf = new UnionFind()
    expect(uf.makeSet()).toBe(0)
    expect(uf.makeSet()).toBe(1)
    expect(uf.makeSet()).toBe(2)
    expect(uf.elementCount).toBe(3)
    expect(uf.setCount).toBe(3)
  })
})

// ─── Find ───

describe('UnionFind find', () => {
  it('returns the element itself as root', () => {
    const uf = new UnionFind({ initialCapacity: 3 })
    expect(uf.find(0)).toBe(0)
    expect(uf.find(1)).toBe(1)
    expect(uf.find(2)).toBe(2)
  })

  it('throws on invalid index', () => {
    const uf = new UnionFind({ initialCapacity: 3 })
    expect(() => uf.find(-1)).toThrow(RangeError)
    expect(() => uf.find(3)).toThrow(RangeError)
  })
})

// ─── Union ───

describe('UnionFind union', () => {
  it('unites two elements', () => {
    const uf = new UnionFind({ initialCapacity: 3 })
    expect(uf.union(0, 1)).toBe(true)
    expect(uf.setCount).toBe(2)
    expect(uf.connected(0, 1)).toBe(true)
  })

  it('returns false for already connected', () => {
    const uf = new UnionFind({ initialCapacity: 3 })
    uf.union(0, 1)
    expect(uf.union(0, 1)).toBe(false)
    expect(uf.setCount).toBe(2)
  })

  it('connects through chains', () => {
    const uf = new UnionFind({ initialCapacity: 5 })
    uf.union(0, 1)
    uf.union(2, 3)
    uf.union(1, 2)
    expect(uf.connected(0, 3)).toBe(true)
    expect(uf.connected(0, 4)).toBe(false)
    expect(uf.setCount).toBe(2)
  })

  it('throws on invalid index', () => {
    const uf = new UnionFind({ initialCapacity: 3 })
    expect(() => uf.union(0, 5)).toThrow(RangeError)
  })
})

// ─── Connected ───

describe('UnionFind connected', () => {
  it('returns false for unconnected elements', () => {
    const uf = new UnionFind({ initialCapacity: 3 })
    expect(uf.connected(0, 1)).toBe(false)
  })

  it('element is connected to itself', () => {
    const uf = new UnionFind({ initialCapacity: 3 })
    expect(uf.connected(0, 0)).toBe(true)
  })
})

// ─── Component Info ───

describe('UnionFind component info', () => {
  it('getComponentSize returns correct size', () => {
    const uf = new UnionFind({ initialCapacity: 5 })
    uf.union(0, 1)
    uf.union(0, 2)
    expect(uf.getComponentSize(0)).toBe(3)
    expect(uf.getComponentSize(3)).toBe(1)
  })

  it('getSize is alias for getComponentSize', () => {
    const uf = new UnionFind({ initialCapacity: 3 })
    uf.union(0, 1)
    expect(uf.getSize(0)).toBe(uf.getComponentSize(0))
  })

  it('getComponentMembers returns all members', () => {
    const uf = new UnionFind({ initialCapacity: 5 })
    uf.union(0, 1)
    uf.union(0, 2)
    const members = uf.getComponentMembers(0)
    expect(members.sort()).toEqual([0, 1, 2])
  })
})

// ─── toArray & getRoots ───

describe('UnionFind toArray & getRoots', () => {
  it('toArray returns groups', () => {
    const uf = new UnionFind({ initialCapacity: 4 })
    uf.union(0, 1)
    uf.union(2, 3)
    const groups = uf.toArray()
    expect(groups.length).toBe(2)
    const sorted = groups.map((g) => g.sort()).sort((a, b) => a[0]! - b[0]!)
    expect(sorted).toEqual([[0, 1], [2, 3]])
  })

  it('getRoots returns root representatives', () => {
    const uf = new UnionFind({ initialCapacity: 4 })
    uf.union(0, 1)
    uf.union(2, 3)
    const roots = uf.getRoots()
    expect(roots.length).toBe(2)
  })
})

// ─── Statistics ───

describe('UnionFind statistics', () => {
  it('tracks operations', () => {
    const uf = new UnionFind({ initialCapacity: 3 })
    uf.union(0, 1)
    uf.find(0)
    uf.find(1)
    const stats = uf.getStatistics()
    expect(stats.elementCount).toBe(3)
    expect(stats.setCount).toBe(2)
    expect(stats.unionOperations).toBe(1)
    expect(stats.findOperations).toBeGreaterThanOrEqual(2)
  })
})

// ─── Clone ───

describe('UnionFind clone', () => {
  it('clones the structure', () => {
    const uf = new UnionFind({ initialCapacity: 4 })
    uf.union(0, 1)
    const copy = uf.clone()
    expect(copy.elementCount).toBe(4)
    expect(copy.setCount).toBe(3)
    expect(copy.connected(0, 1)).toBe(true)
    expect(copy.connected(2, 3)).toBe(false)
  })

  it('clone is independent', () => {
    const uf = new UnionFind({ initialCapacity: 4 })
    const copy = uf.clone()
    copy.union(0, 1)
    expect(uf.connected(0, 1)).toBe(false)
    expect(copy.connected(0, 1)).toBe(true)
  })
})

// ─── Clear & Reset ───

describe('UnionFind clear & reset', () => {
  it('clear empties everything', () => {
    const uf = new UnionFind({ initialCapacity: 5 })
    uf.clear()
    expect(uf.elementCount).toBe(0)
    expect(uf.setCount).toBe(0)
    expect(uf.isEmpty).toBe(true)
  })

  it('reset restores to individual sets', () => {
    const uf = new UnionFind({ initialCapacity: 5 })
    uf.union(0, 1)
    uf.union(2, 3)
    uf.union(0, 2)
    expect(uf.setCount).toBe(2)
    uf.reset()
    expect(uf.elementCount).toBe(5)
    expect(uf.setCount).toBe(5)
    expect(uf.connected(0, 1)).toBe(false)
  })

  it('union merges two sets', () => {
    const uf = new UnionFind({ initialCapacity: 3 })
    uf.union(0, 1)
    expect(uf.connected(0, 1)).toBe(true)
    expect(uf.setCount).toBe(2)
  })

  it('find returns same root for connected', () => {
    const uf = new UnionFind({ initialCapacity: 3 })
    uf.union(0, 1)
    expect(uf.find(0)).toBe(uf.find(1))
  })

  it('separate sets have different roots', () => {
    const uf = new UnionFind({ initialCapacity: 3 })
    expect(uf.find(0)).not.toBe(uf.find(2))
  })
})
