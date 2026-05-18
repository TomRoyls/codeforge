import { describe, it, expect, beforeEach } from 'vitest'
import { UnionFind } from '../src/utils/union-find.js'

// ─── Constructor ──────────────────────────────────────
describe('UnionFind constructor', () => {
  it('creates empty structure', () => {
    const uf = new UnionFind()
    expect(uf.isEmpty).toBe(true)
    expect(uf.elementCount).toBe(0)
    expect(uf.setCount).toBe(0)
  })

  it('creates with initial capacity', () => {
    const uf = new UnionFind({ initialCapacity: 5 })
    expect(uf.elementCount).toBe(5)
    expect(uf.setCount).toBe(5)
  })

  it('ignores zero initial capacity', () => {
    const uf = new UnionFind({ initialCapacity: 0 })
    expect(uf.elementCount).toBe(0)
  })
})

// ─── makeSet ──────────────────────────────────────────
describe('UnionFind.makeSet', () => {
  let uf: UnionFind

  beforeEach(() => {
    uf = new UnionFind()
  })

  it('returns sequential ids', () => {
    expect(uf.makeSet()).toBe(0)
    expect(uf.makeSet()).toBe(1)
    expect(uf.makeSet()).toBe(2)
  })

  it('increments elementCount', () => {
    uf.makeSet()
    uf.makeSet()
    expect(uf.elementCount).toBe(2)
  })

  it('increments setCount', () => {
    uf.makeSet()
    uf.makeSet()
    expect(uf.setCount).toBe(2)
  })
})

// ─── find ─────────────────────────────────────────────
describe('UnionFind.find', () => {
  let uf: UnionFind

  beforeEach(() => {
    uf = new UnionFind()
  })

  it('returns self for singleton', () => {
    const id = uf.makeSet()
    expect(uf.find(id)).toBe(id)
  })

  it('throws for invalid index', () => {
    expect(() => uf.find(0)).toThrow(RangeError)
    expect(() => uf.find(-1)).toThrow(RangeError)
  })

  it('returns root after union', () => {
    const a = uf.makeSet()
    const b = uf.makeSet()
    uf.union(a, b)
    const rootA = uf.find(a)
    const rootB = uf.find(b)
    expect(rootA).toBe(rootB)
  })
})

// ─── union ────────────────────────────────────────────
describe('UnionFind.union', () => {
  let uf: UnionFind

  beforeEach(() => {
    uf = new UnionFind()
  })

  it('unites two separate sets', () => {
    const a = uf.makeSet()
    const b = uf.makeSet()
    expect(uf.union(a, b)).toBe(true)
    expect(uf.setCount).toBe(1)
  })

  it('returns false for same set', () => {
    const a = uf.makeSet()
    const b = uf.makeSet()
    uf.union(a, b)
    expect(uf.union(a, b)).toBe(false)
  })

  it('throws for invalid indices', () => {
    expect(() => uf.union(0, 1)).toThrow(RangeError)
  })

  it('handles chain of unions', () => {
    const ids = [uf.makeSet(), uf.makeSet(), uf.makeSet(), uf.makeSet()]
    uf.union(ids[0]!, ids[1]!)
    uf.union(ids[2]!, ids[3]!)
    uf.union(ids[0]!, ids[2]!)
    expect(uf.setCount).toBe(1)
    expect(uf.connected(ids[0]!, ids[3]!)).toBe(true)
  })
})

// ─── connected ────────────────────────────────────────
describe('UnionFind.connected', () => {
  let uf: UnionFind

  beforeEach(() => {
    uf = new UnionFind()
  })

  it('returns false for separate sets', () => {
    const a = uf.makeSet()
    const b = uf.makeSet()
    expect(uf.connected(a, b)).toBe(false)
  })

  it('returns true after union', () => {
    const a = uf.makeSet()
    const b = uf.makeSet()
    uf.union(a, b)
    expect(uf.connected(a, b)).toBe(true)
  })

  it('returns true for same element', () => {
    const a = uf.makeSet()
    expect(uf.connected(a, a)).toBe(true)
  })

  it('throws for invalid index', () => {
    expect(() => uf.connected(0, 1)).toThrow(RangeError)
  })
})

// ─── getComponentSize / getSize ───────────────────────
describe('UnionFind.getComponentSize / getSize', () => {
  let uf: UnionFind

  beforeEach(() => {
    uf = new UnionFind()
  })

  it('returns 1 for singleton', () => {
    const a = uf.makeSet()
    expect(uf.getComponentSize(a)).toBe(1)
  })

  it('returns 2 after union', () => {
    const a = uf.makeSet()
    const b = uf.makeSet()
    uf.union(a, b)
    expect(uf.getComponentSize(a)).toBe(2)
    expect(uf.getComponentSize(b)).toBe(2)
  })

  it('getSize is alias for getComponentSize', () => {
    const a = uf.makeSet()
    expect(uf.getSize(a)).toBe(uf.getComponentSize(a))
  })

  it('throws for invalid index', () => {
    expect(() => uf.getComponentSize(99)).toThrow(RangeError)
  })
})

// ─── getComponentMembers ──────────────────────────────
describe('UnionFind.getComponentMembers', () => {
  it('returns all members of the set', () => {
    const uf = new UnionFind()
    const a = uf.makeSet()
    const b = uf.makeSet()
    const c = uf.makeSet()
    uf.union(a, b)
    const members = uf.getComponentMembers(a)
    expect(members).toContain(a)
    expect(members).toContain(b)
    expect(members).not.toContain(c)
  })
})

// ─── clear ────────────────────────────────────────────
describe('UnionFind.clear', () => {
  it('removes all elements', () => {
    const uf = new UnionFind()
    uf.makeSet()
    uf.makeSet()
    uf.clear()
    expect(uf.isEmpty).toBe(true)
    expect(uf.elementCount).toBe(0)
    expect(uf.setCount).toBe(0)
  })
})

// ─── reset ────────────────────────────────────────────
describe('UnionFind.reset', () => {
  it('resets to individual sets', () => {
    const uf = new UnionFind()
    const a = uf.makeSet()
    const b = uf.makeSet()
    uf.union(a, b)
    expect(uf.setCount).toBe(1)
    uf.reset()
    expect(uf.setCount).toBe(2)
    expect(uf.connected(a, b)).toBe(false)
  })

  it('preserves element count', () => {
    const uf = new UnionFind()
    uf.makeSet()
    uf.makeSet()
    uf.makeSet()
    uf.union(0, 1)
    uf.reset()
    expect(uf.elementCount).toBe(3)
  })
})

// ─── toArray ──────────────────────────────────────────
describe('UnionFind.toArray', () => {
  it('returns single-element groups', () => {
    const uf = new UnionFind()
    uf.makeSet()
    uf.makeSet()
    const groups = uf.toArray()
    expect(groups).toHaveLength(2)
  })

  it('returns merged group', () => {
    const uf = new UnionFind()
    uf.makeSet()
    uf.makeSet()
    uf.union(0, 1)
    const groups = uf.toArray()
    expect(groups).toHaveLength(1)
    expect(groups[0]).toHaveLength(2)
  })
})

// ─── getRoots ─────────────────────────────────────────
describe('UnionFind.getRoots', () => {
  it('returns all roots for separate sets', () => {
    const uf = new UnionFind()
    uf.makeSet()
    uf.makeSet()
    expect(uf.getRoots()).toHaveLength(2)
  })

  it('returns single root after all unions', () => {
    const uf = new UnionFind()
    uf.makeSet()
    uf.makeSet()
    uf.makeSet()
    uf.union(0, 1)
    uf.union(1, 2)
    expect(uf.getRoots()).toHaveLength(1)
  })
})

// ─── getStatistics ────────────────────────────────────
describe('UnionFind.getStatistics', () => {
  it('returns zeros for empty', () => {
    const uf = new UnionFind()
    const stats = uf.getStatistics()
    expect(stats).toEqual({
      elementCount: 0,
      setCount: 0,
      findOperations: 0,
      unionOperations: 0,
      maxDepth: 0,
    })
  })

  it('tracks operations', () => {
    const uf = new UnionFind()
    uf.makeSet()
    uf.makeSet()
    uf.union(0, 1)
    uf.find(0)
    const stats = uf.getStatistics()
    expect(stats.elementCount).toBe(2)
    expect(stats.setCount).toBe(1)
    expect(stats.findOperations).toBeGreaterThan(0)
    expect(stats.unionOperations).toBe(1)
  })
})

// ─── clone ────────────────────────────────────────────
describe('UnionFind.clone', () => {
  it('creates independent copy', () => {
    const uf = new UnionFind()
    uf.makeSet()
    uf.makeSet()
    uf.union(0, 1)
    const copy = uf.clone()
    expect(copy.elementCount).toBe(2)
    expect(copy.setCount).toBe(1)
    copy.makeSet()
    expect(uf.elementCount).toBe(2)
    expect(copy.elementCount).toBe(3)
  })
})

// ─── Edge Cases ───────────────────────────────────────
describe('UnionFind edge cases', () => {
  it('handles large number of elements', () => {
    const uf = new UnionFind({ initialCapacity: 100 })
    for (let i = 1; i < 100; i++) {
      uf.union(0, i)
    }
    expect(uf.setCount).toBe(1)
    expect(uf.connected(0, 99)).toBe(true)
    expect(uf.getComponentSize(0)).toBe(100)
  })

  it('path compression works', () => {
    const uf = new UnionFind()
    for (let i = 0; i < 10; i++) uf.makeSet()
    for (let i = 1; i < 10; i++) uf.union(0, i)
    const stats = uf.getStatistics()
    expect(stats.maxDepth).toBeLessThanOrEqual(1)
  })
})
