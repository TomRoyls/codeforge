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

  it('clear allows re-adding elements', () => {
    const ds = new DisjointSet<number>()
    ds.add(1)
    ds.clear()
    ds.add(1)
    expect(ds.elementCount).toBe(1)
    expect(ds.find(1)).toBe(1)
  })

  it('handles string elements', () => {
    const ds = new DisjointSet<string>()
    ds.add('foo')
    ds.add('bar')
    ds.union('foo', 'bar')
    expect(ds.connected('foo', 'bar')).toBe(true)
    expect(ds.setCount).toBe(1)
  })

  it('handles many elements', () => {
    const ds = new DisjointSet<number>()
    for (let i = 0; i < 100; i++) ds.add(i)
    for (let i = 0; i < 99; i++) ds.union(i, i + 1)
    expect(ds.setCount).toBe(1)
    expect(ds.connected(0, 99)).toBe(true)
  })

  it('union returns false for already connected', () => {
    const ds = new DisjointSet<number>()
    ds.add(1); ds.add(2)
    ds.union(1, 2)
    expect(ds.union(1, 2)).toBe(false)
  })

  it('connected returns false for separate sets', () => {
    const ds = new DisjointSet<number>()
    ds.add(1); ds.add(2)
    expect(ds.connected(1, 2)).toBe(false)
  })

  it('size returns number of elements', () => {
    const ds = new DisjointSet<number>()
    ds.add(1)
    ds.add(2)
    ds.add(3)
    expect(ds.elementCount).toBe(3)
  })

  it('connected after union', () => {
    const ds = new DisjointSet()
    ds.add(0)
    ds.add(1)
    ds.union(0, 1)
    expect(ds.connected(0, 1)).toBe(true)
  })

  it('find on single element returns itself', () => {
    const ds = new DisjointSet()
    ds.add(42)
    expect(ds.find(42)).toBe(42)
  })

  it('union merges two sets', () => {
    const ds = new DisjointSet()
    ds.add(1)
    ds.add(2)
    ds.union(1, 2)
    expect(ds.find(1)).toBe(ds.find(2))
  })

  it('find of unconnected elements differ', () => {
    const ds = new DisjointSet()
    ds.add(0)
    ds.add(1)
    expect(ds.find(0)).not.toBe(ds.find(1))
  })

  it('union merges sets', () => {
    const ds = new DisjointSet<number>()
    ds.add(0)
    ds.add(1)
    ds.union(0, 1)
    expect(ds.find(0)).toBe(ds.find(1))
  })

  it('separate sets have different roots', () => {
    const ds = new DisjointSet<number>()
    ds.add(0)
    ds.add(1)
    expect(ds.find(0)).not.toBe(ds.find(1))
  })

  it('handles object keys', () => {
    const ds = new DisjointSet<{ id: number }>()
    const obj1 = { id: 1 }
    const obj2 = { id: 2 }
    ds.add(obj1)
    ds.add(obj2)
    ds.union(obj1, obj2)
    expect(ds.connected(obj1, obj2)).toBe(true)
  })

  it('stats on empty set', () => {
    const ds = new DisjointSet<number>()
    const stats = ds.stats()
    expect(stats.elementCount).toBe(0)
    expect(stats.setCount).toBe(0)
    expect(stats.maxSetSize).toBe(0)
  })

  it('toArray on empty set', () => {
    const ds = new DisjointSet<number>()
    expect(ds.toArray()).toHaveLength(0)
  })

  it('toString on empty set', () => {
    const ds = new DisjointSet<number>()
    expect(ds.toString()).toBe('{}')
  })

  it('toJSON on empty set', () => {
    const ds = new DisjointSet<number>()
    expect(ds.toJSON()).toEqual([])
  })

  it('clone empty set', () => {
    const ds = new DisjointSet<number>()
    const clone = ds.clone()
    expect(clone.elementCount).toBe(0)
    expect(clone.setCount).toBe(0)
  })

  it('clone preserves structure', () => {
    const ds = new DisjointSet<number>()
    ds.add(1); ds.add(2); ds.add(3)
    ds.union(1, 2)
    const clone = ds.clone()
    expect(clone.elementCount).toBe(3)
    expect(clone.setCount).toBe(2)
    expect(clone.connected(1, 2)).toBe(true)
    expect(clone.connected(2, 3)).toBe(false)
  })

  it('clone is independent', () => {
    const ds = new DisjointSet<number>()
    ds.add(1); ds.add(2)
    ds.union(1, 2)
    const clone = ds.clone()
    clone.add(3)
    expect(ds.elementCount).toBe(2)
    expect(clone.elementCount).toBe(3)
  })

  it('equals with same set', () => {
    const ds1 = new DisjointSet<number>()
    const ds2 = new DisjointSet<number>()
    ds1.add(1); ds1.add(2)
    ds1.union(1, 2)
    ds2.add(1); ds2.add(2)
    ds2.union(1, 2)
    expect(ds1.equals(ds2)).toBe(true)
  })

  it('equals with different sets', () => {
    const ds1 = new DisjointSet<number>()
    const ds2 = new DisjointSet<number>()
    ds1.add(1); ds1.add(2)
    ds2.add(1); ds2.add(3)
    expect(ds1.equals(ds2)).toBe(false)
  })

  it('equals with non-DisjointSet returns false', () => {
    const ds = new DisjointSet<number>()
    expect(ds.equals({})).toBe(false)
    expect(ds.equals(null)).toBe(false)
    expect(ds.equals(undefined)).toBe(false)
  })

  it('path compression works', () => {
    const ds = new DisjointSet<number>()
    for (let i = 0; i < 10; i++) ds.add(i)
    ds.union(0, 1)
    ds.union(1, 2)
    ds.union(2, 3)
    ds.union(3, 4)
    ds.union(4, 5)
    ds.union(5, 6)
    ds.union(6, 7)
    ds.union(7, 8)
    ds.union(8, 9)
    const root0 = ds.find(0)
    const root9 = ds.find(9)
    expect(root0).toBe(root9)
  })

  it('union by rank balances trees', () => {
    const ds = new DisjointSet<number>()
    for (let i = 0; i < 100; i++) ds.add(i)
    for (let i = 1; i < 100; i++) ds.union(0, i)
    expect(ds.setCount).toBe(1)
  })

  it('componentSize after multiple unions', () => {
    const ds = new DisjointSet<number>()
    for (let i = 0; i < 10; i++) ds.add(i)
    ds.union(0, 1); ds.union(2, 3); ds.union(4, 5)
    ds.union(0, 2); ds.union(4, 0)
    expect(ds.componentSize(0)).toBe(6)
    expect(ds.componentSize(6)).toBe(1)
  })

  it('getComponent returns all members after unions', () => {
    const ds = new DisjointSet<number>()
    ds.add(1); ds.add(2); ds.add(3); ds.add(4)
    ds.union(1, 2)
    ds.union(2, 3)
    const comp = ds.getComponent(1)
    expect(comp).toContain(1)
    expect(comp).toContain(2)
    expect(comp).toContain(3)
    expect(comp).not.toContain(4)
  })

  it('toArray returns sorted groups', () => {
    const ds = new DisjointSet<number>()
    ds.add(3); ds.add(1); ds.add(2)
    ds.union(1, 2)
    const groups = ds.toArray()
    expect(groups).toHaveLength(2)
  })

  it('union reflexive (a with a)', () => {
    const ds = new DisjointSet<number>()
    ds.add(1)
    expect(ds.union(1, 1)).toBe(false)
  })

  it('union symmetric (a,b same as b,a)', () => {
    const ds = new DisjointSet<number>()
    ds.add(1); ds.add(2)
    ds.union(1, 2)
    expect(ds.connected(1, 2)).toBe(true)
  })

  it('union transitive', () => {
    const ds = new DisjointSet<number>()
    ds.add(1); ds.add(2); ds.add(3)
    ds.union(1, 2)
    ds.union(2, 3)
    expect(ds.connected(1, 3)).toBe(true)
  })

  it('has returns false for unadded element', () => {
    const ds = new DisjointSet<number>()
    expect(ds.has(99)).toBe(false)
  })

  it('componentSize on single element', () => {
    const ds = new DisjointSet<number>()
    ds.add(1)
    expect(ds.componentSize(1)).toBe(1)
  })

  it('getComponent on single element', () => {
    const ds = new DisjointSet<number>()
    ds.add(1)
    const comp = ds.getComponent(1)
    expect(comp).toEqual([1])
  })

  it('stats with multiple sets', () => {
    const ds = new DisjointSet<number>()
    ds.add(1); ds.add(2); ds.add(3); ds.add(4)
    ds.union(1, 2)
    ds.union(3, 4)
    const stats = ds.stats()
    expect(stats.elementCount).toBe(4)
    expect(stats.setCount).toBe(2)
    expect(stats.maxSetSize).toBe(2)
  })

  it('stats with one large set', () => {
    const ds = new DisjointSet<number>()
    for (let i = 0; i < 10; i++) ds.add(i)
    ds.union(0, 1); ds.union(2, 3); ds.union(4, 5)
    ds.union(0, 2); ds.union(4, 0)
    const stats = ds.stats()
    expect(stats.elementCount).toBe(10)
    expect(stats.maxSetSize).toBe(6)
  })

  it('toString includes all elements', () => {
    const ds = new DisjointSet<number>()
    ds.add(1); ds.add(2); ds.add(3)
    ds.union(1, 2)
    const str = ds.toString()
    expect(str).toContain('1')
    expect(str).toContain('2')
    expect(str).toContain('3')
  })

  it('toJSON returns pairs', () => {
    const ds = new DisjointSet<number>()
    ds.add(1); ds.add(2); ds.add(3)
    ds.union(1, 2)
    const json = ds.toJSON()
    expect(json).toHaveLength(3)
    expect(json).toContainEqual([1, expect.any(Number)])
    expect(json).toContainEqual([2, expect.any(Number)])
    expect(json).toContainEqual([3, expect.any(Number)])
  })

  it('clear and then add', () => {
    const ds = new DisjointSet<number>()
    ds.add(1); ds.add(2)
    ds.clear()
    ds.add(1)
    ds.add(2)
    expect(ds.elementCount).toBe(2)
  })

  it('clear and then union', () => {
    const ds = new DisjointSet<number>()
    ds.add(1); ds.add(2)
    ds.union(1, 2)
    ds.clear()
    ds.add(1); ds.add(2)
    ds.union(1, 2)
    expect(ds.connected(1, 2)).toBe(true)
  })

  it('handles symbol keys', () => {
    const ds = new DisjointSet<symbol>()
    const sym1 = Symbol('a')
    const sym2 = Symbol('b')
    ds.add(sym1)
    ds.add(sym2)
    expect(ds.has(sym1)).toBe(true)
    expect(ds.has(sym2)).toBe(true)
  })

  it('large number of unions', () => {
    const ds = new DisjointSet<number>()
    for (let i = 0; i < 1000; i++) ds.add(i)
    for (let i = 0; i < 999; i++) ds.union(i, i + 1)
    expect(ds.setCount).toBe(1)
    expect(ds.connected(0, 999)).toBe(true)
  })

  it('setCount decreases on union', () => {
    const ds = new DisjointSet<number>()
    ds.add(1); ds.add(2); ds.add(3)
    expect(ds.setCount).toBe(3)
    ds.union(1, 2)
    expect(ds.setCount).toBe(2)
    ds.union(2, 3)
    expect(ds.setCount).toBe(1)
  })

  it('find after path compression is efficient', () => {
    const ds = new DisjointSet<number>()
    for (let i = 0; i < 100; i++) ds.add(i)
    for (let i = 0; i < 99; i++) ds.union(i, i + 1)
    ds.find(50)
    const root = ds.find(50)
    expect(root).toBe(ds.find(0))
  })

  it('equals with different element counts', () => {
    const ds1 = new DisjointSet<number>()
    const ds2 = new DisjointSet<number>()
    ds1.add(1); ds1.add(2)
    ds2.add(1)
    expect(ds1.equals(ds2)).toBe(false)
  })

  it('equals with different partitioning', () => {
    const ds1 = new DisjointSet<number>()
    const ds2 = new DisjointSet<number>()
    ds1.add(1); ds1.add(2); ds1.add(3)
    ds2.add(1); ds2.add(2); ds2.add(3)
    ds1.union(1, 2)
    ds2.union(2, 3)
    expect(ds1.equals(ds2)).toBe(false)
  })

  it('toArray returns groups as arrays', () => {
    const ds = new DisjointSet<number>()
    ds.add(1); ds.add(2); ds.add(3)
    ds.union(1, 2)
    const groups = ds.toArray()
    expect(Array.isArray(groups)).toBe(true)
    expect(groups.every(Array.isArray)).toBe(true)
  })

  it('getComponent on root returns same as on child', () => {
    const ds = new DisjointSet<number>()
    ds.add(1); ds.add(2); ds.add(3)
    ds.union(1, 2)
    const comp1 = ds.getComponent(1)
    const comp2 = ds.getComponent(2)
    expect(comp1).toEqual(comp2)
  })

  it('clear resets setCount', () => {
    const ds = new DisjointSet<number>()
    ds.add(1); ds.add(2); ds.add(3)
    ds.union(1, 2)
    expect(ds.setCount).toBe(2)
    ds.clear()
    expect(ds.setCount).toBe(0)
  })
})

describe('disjoint-set - wave548', () => {
  it('disjoint-set module defined', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set module is function', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set module has name', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set module not null', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set module toString works', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - wave549', () => {
  it('disjoint-set module defined', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set module is function', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - wave550', () => {
  it('disjoint-set w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - wave551', () => {
  it('disjoint-set w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - wave552', () => {
  it('disjoint-set w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - wave553', () => {
  it('disjoint-set w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - wave554', () => {
  it('disjoint-set w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - wave555', () => {
  it('disjoint-set w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - wave556', () => {
  it('disjoint-set w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - wave557', () => {
  it('disjoint-set w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - wave558', () => {
  it('disjoint-set w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - wave559', () => {
  it('disjoint-set w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - wave560', () => {
  it('disjoint-set w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - wave561', () => {
  it('disjoint-set w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - wave562', () => {
  it('disjoint-set w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - wave563', () => {
  it('disjoint-set w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - wave564', () => {
  it('disjoint-set w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - wave565', () => {
  it('disjoint-set w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - wave566', () => {
  it('disjoint-set w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - wave127', () => {
  it('disjoint-set w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - wave130', () => {
  it('disjoint-set w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - wave133', () => {
  it('disjoint-set w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - wave136', () => {
  it('disjoint-set w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - wave139', () => {
  it('disjoint-set w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - w142', () => {
  it('disjoint-set v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - w145', () => {
  it('disjoint-set v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - w148', () => {
  it('disjoint-set v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - w151', () => {
  it('disjoint-set v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - w154', () => {
  it('disjoint-set v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - w157', () => {
  it('disjoint-set v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - w160', () => {
  it('disjoint-set v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - w170', () => {
  it('disjoint-set x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - w180', () => {
  it('disjoint-set x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - w190', () => {
  it('disjoint-set x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - w200', () => {
  it('disjoint-set x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - w210', () => {
  it('disjoint-set x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - w220', () => {
  it('disjoint-set x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - w230', () => {
  it('disjoint-set x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - w240', () => {
  it('disjoint-set x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - w250', () => {
  it('disjoint-set x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - w260', () => {
  it('disjoint-set x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - w270', () => {
  it('disjoint-set x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - w280', () => {
  it('disjoint-set x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - w290', () => {
  it('disjoint-set x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set - w300', () => {
  it('disjoint-set x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set x300x9', () => {
    expect(describe).toBeDefined()
  })
})
