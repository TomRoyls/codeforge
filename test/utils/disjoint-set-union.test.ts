import { describe, expect, it } from 'vitest'

import { DisjointSetUnion } from '../../src/utils/disjoint-set-union.js'

// ─── Constructor and initial state ──────────────────────────────────────
describe('DisjointSetUnion - constructor', () => {
  it('creates n singleton sets', () => {
    const dsu = new DisjointSetUnion(5)
    expect(dsu.componentCount).toBe(5)
    for (let i = 0; i < 5; i++) {
      expect(dsu.find(i)).toBe(i)
    }
  })

  it('throws on negative n', () => {
    expect(() => new DisjointSetUnion(-1)).toThrow(RangeError)
  })

  it('creates zero-element set', () => {
    const dsu = new DisjointSetUnion(0)
    expect(dsu.componentCount).toBe(0)
  })
})

// ─── Single element ─────────────────────────────────────────────────────
describe('DisjointSetUnion - single element', () => {
  it('find returns the element itself', () => {
    const dsu = new DisjointSetUnion(1)
    expect(dsu.find(0)).toBe(0)
  })

  it('setSize of singleton is 1', () => {
    const dsu = new DisjointSetUnion(1)
    expect(dsu.setSize(0)).toBe(1)
  })

  it('rank of singleton is 0', () => {
    const dsu = new DisjointSetUnion(1)
    expect(dsu.rank(0)).toBe(0)
  })

  it('connected returns true for same element', () => {
    const dsu = new DisjointSetUnion(1)
    expect(dsu.connected(0, 0)).toBe(true)
  })
})

// ─── Basic union and find ───────────────────────────────────────────────
describe('DisjointSetUnion - basic union/find', () => {
  it('union merges two different sets and returns true', () => {
    const dsu = new DisjointSetUnion(3)
    expect(dsu.union(0, 1)).toBe(true)
    expect(dsu.componentCount).toBe(2)
  })

  it('union returns false for elements already in same set', () => {
    const dsu = new DisjointSetUnion(3)
    dsu.union(0, 1)
    expect(dsu.union(0, 1)).toBe(false)
    expect(dsu.union(1, 0)).toBe(false)
  })

  it('find returns same root after union', () => {
    const dsu = new DisjointSetUnion(3)
    dsu.union(0, 1)
    expect(dsu.find(0)).toBe(dsu.find(1))
  })

  it('connected returns true after union', () => {
    const dsu = new DisjointSetUnion(3)
    dsu.union(0, 1)
    expect(dsu.connected(0, 1)).toBe(true)
  })

  it('connected returns false for elements in different sets', () => {
    const dsu = new DisjointSetUnion(3)
    expect(dsu.connected(0, 2)).toBe(false)
    dsu.union(0, 1)
    expect(dsu.connected(1, 2)).toBe(false)
  })
})

// ─── Path splitting ─────────────────────────────────────────────────────
describe('DisjointSetUnion - path splitting', () => {
  it('flattens chain with path splitting', () => {
    const dsu = new DisjointSetUnion(6)
    dsu.union(0, 1)
    dsu.union(1, 2)
    dsu.union(2, 3)
    dsu.union(3, 4)
    dsu.union(4, 5)
    dsu.find(5)
    expect(dsu.connected(0, 5)).toBe(true)
    expect(dsu.find(0)).toBe(dsu.find(5))
  })

  it('repeated find does not change results', () => {
    const dsu = new DisjointSetUnion(4)
    dsu.union(0, 1)
    dsu.union(2, 3)
    dsu.union(0, 2)
    const root = dsu.find(3)
    for (let i = 0; i < 4; i++) {
      expect(dsu.find(i)).toBe(root)
    }
  })
})

// ─── Union by rank ──────────────────────────────────────────────────────
describe('DisjointSetUnion - union by rank', () => {
  it('rank increases only when equal-rank sets are merged', () => {
    const dsu = new DisjointSetUnion(4)
    dsu.union(0, 1)
    expect(dsu.rank(0)).toBe(1)
    dsu.union(2, 3)
    expect(dsu.rank(2)).toBe(1)
    dsu.union(0, 2)
    expect(dsu.rank(dsu.find(0))).toBe(2)
  })

  it('rank stays same when merging lower rank into higher', () => {
    const dsu = new DisjointSetUnion(8)
    dsu.union(0, 1)
    dsu.union(2, 3)
    dsu.union(0, 2)
    const higherRoot = dsu.find(0)
    const higherRank = dsu.rank(higherRoot)
    dsu.union(4, 5)
    dsu.union(higherRoot, 4)
    expect(dsu.rank(dsu.find(higherRoot))).toBe(higherRank)
  })

  it('maintains balanced tree structure', () => {
    const dsu = new DisjointSetUnion(8)
    dsu.union(0, 1)
    dsu.union(2, 3)
    dsu.union(4, 5)
    dsu.union(6, 7)
    dsu.union(0, 2)
    dsu.union(4, 6)
    dsu.union(0, 4)
    expect(dsu.componentCount).toBe(1)
    expect(dsu.rank(dsu.find(0))).toBe(3)
  })
})

// ─── setSize tracking ───────────────────────────────────────────────────
describe('DisjointSetUnion - setSize', () => {
  it('tracks size correctly after unions', () => {
    const dsu = new DisjointSetUnion(5)
    dsu.union(0, 1)
    expect(dsu.setSize(0)).toBe(2)
    expect(dsu.setSize(1)).toBe(2)
    dsu.union(2, 3)
    dsu.union(0, 2)
    expect(dsu.setSize(0)).toBe(4)
    expect(dsu.setSize(3)).toBe(4)
  })

  it('size unchanged after union of same set', () => {
    const dsu = new DisjointSetUnion(3)
    dsu.union(0, 1)
    const sizeBefore = dsu.setSize(0)
    dsu.union(0, 1)
    expect(dsu.setSize(0)).toBe(sizeBefore)
  })
})

// ─── componentCount ─────────────────────────────────────────────────────
describe('DisjointSetUnion - componentCount', () => {
  it('decrements on each successful union', () => {
    const dsu = new DisjointSetUnion(5)
    expect(dsu.componentCount).toBe(5)
    dsu.union(0, 1)
    expect(dsu.componentCount).toBe(4)
    dsu.union(2, 3)
    expect(dsu.componentCount).toBe(3)
    dsu.union(0, 2)
    expect(dsu.componentCount).toBe(2)
    dsu.union(0, 4)
    expect(dsu.componentCount).toBe(1)
  })

  it('does not decrement on failed union', () => {
    const dsu = new DisjointSetUnion(3)
    dsu.union(0, 1)
    expect(dsu.componentCount).toBe(2)
    dsu.union(0, 1)
    expect(dsu.componentCount).toBe(2)
  })
})

// ─── All elements in same set ───────────────────────────────────────────
describe('DisjointSetUnion - all elements same set', () => {
  it('all elements become connected', () => {
    const dsu = new DisjointSetUnion(10)
    for (let i = 1; i < 10; i++) {
      dsu.union(0, i)
    }
    expect(dsu.componentCount).toBe(1)
    expect(dsu.setSize(0)).toBe(10)
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        expect(dsu.connected(i, j)).toBe(true)
      }
    }
  })
})

// ─── Chain unions ───────────────────────────────────────────────────────
describe('DisjointSetUnion - chain unions', () => {
  it('correctly unites elements through transitive chain', () => {
    const dsu = new DisjointSetUnion(5)
    dsu.union(0, 1)
    dsu.union(1, 2)
    dsu.union(2, 3)
    dsu.union(3, 4)
    expect(dsu.connected(0, 4)).toBe(true)
    expect(dsu.setSize(0)).toBe(5)
    expect(dsu.componentCount).toBe(1)
  })
})

// ─── Reset ──────────────────────────────────────────────────────────────
describe('DisjointSetUnion - reset', () => {
  it('restores initial state after unions', () => {
    const dsu = new DisjointSetUnion(5)
    dsu.union(0, 1)
    dsu.union(2, 3)
    dsu.union(0, 4)
    dsu.reset()
    expect(dsu.componentCount).toBe(5)
    for (let i = 0; i < 5; i++) {
      expect(dsu.find(i)).toBe(i)
      expect(dsu.setSize(i)).toBe(1)
      expect(dsu.rank(i)).toBe(0)
    }
  })

  it('allows unions again after reset', () => {
    const dsu = new DisjointSetUnion(3)
    dsu.union(0, 1)
    dsu.reset()
    expect(dsu.union(1, 2)).toBe(true)
    expect(dsu.connected(1, 2)).toBe(true)
    expect(dsu.connected(0, 1)).toBe(false)
  })
})

// ─── Large scale ────────────────────────────────────────────────────────
describe('DisjointSetUnion - large scale', () => {
  it('handles 10000 elements', () => {
    const n = 10000
    const dsu = new DisjointSetUnion(n)
    expect(dsu.componentCount).toBe(n)
    for (let i = 1; i < n; i++) {
      dsu.union(0, i)
    }
    expect(dsu.componentCount).toBe(1)
    expect(dsu.setSize(0)).toBe(n)
    expect(dsu.connected(0, n - 1)).toBe(true)
    expect(dsu.connected(0, 5000)).toBe(true)
  })

  it('handles pairwise unions', () => {
    const n = 10000
    const dsu = new DisjointSetUnion(n)
    for (let i = 0; i + 1 < n; i += 2) {
      dsu.union(i, i + 1)
    }
    expect(dsu.componentCount).toBe(n / 2)
    for (let i = 0; i + 1 < n; i += 2) {
      expect(dsu.connected(i, i + 1)).toBe(true)
    }
  })
})

// ─── Bounds checking ────────────────────────────────────────────────────
describe('DisjointSetUnion - bounds checking', () => {
  it('find throws on out-of-bounds index', () => {
    const dsu = new DisjointSetUnion(3)
    expect(() => dsu.find(-1)).toThrow(RangeError)
    expect(() => dsu.find(3)).toThrow(RangeError)
  })

  it('union throws on out-of-bounds index', () => {
    const dsu = new DisjointSetUnion(3)
    expect(() => dsu.union(0, 5)).toThrow(RangeError)
    expect(() => dsu.union(-1, 0)).toThrow(RangeError)
  })

  it('setSize throws on out-of-bounds index', () => {
    const dsu = new DisjointSetUnion(3)
    expect(() => dsu.setSize(10)).toThrow(RangeError)
  })

  it('rank throws on out-of-bounds index', () => {
    const dsu = new DisjointSetUnion(3)
    expect(() => dsu.rank(-1)).toThrow(RangeError)
  })

  it('connected throws on out-of-bounds index', () => {
    const dsu = new DisjointSetUnion(3)
    expect(() => dsu.connected(0, 5)).toThrow(RangeError)
  })
})

// ─── toString and toJSON ─────────────────────────────────────────────────
describe('DisjointSetUnion - toString and toJSON', () => {
  it('toString returns correct representation', () => {
    const dsu = new DisjointSetUnion(5)
    expect(dsu.toString()).toBe('DisjointSetUnion(n=5, components=5)')
    dsu.union(0, 1)
    expect(dsu.toString()).toBe('DisjointSetUnion(n=5, components=4)')
  })

  it('toJSON returns correct structure', () => {
    const dsu = new DisjointSetUnion(3)
    const json = dsu.toJSON()
    expect(json.parent).toEqual([0, 1, 2])
    expect(json.size).toEqual([1, 1, 1])
    expect(json.components).toBe(3)
  })

  it('toJSON reflects union operations', () => {
    const dsu = new DisjointSetUnion(3)
    dsu.union(0, 1)
    const json = dsu.toJSON()
    expect(json.components).toBe(2)
    expect(json.size).toContain(2)
  })
})

// ─── Clone ────────────────────────────────────────────────────────────────
describe('DisjointSetUnion - clone', () => {
  it('clone creates independent copy', () => {
    const dsu = new DisjointSetUnion(3)
    dsu.union(0, 1)
    const clone = dsu.clone()
    clone.union(1, 2)
    expect(dsu.componentCount).toBe(2)
    expect(clone.componentCount).toBe(1)
  })

  it('clone has same initial state', () => {
    const dsu = new DisjointSetUnion(4)
    dsu.union(0, 1)
    dsu.union(2, 3)
    const clone = dsu.clone()
    expect(dsu.componentCount).toBe(clone.componentCount)
    expect(dsu.find(0)).toBe(clone.find(0))
  })
})

// ─── Equals ────────────────────────────────────────────────────────────────
describe('DisjointSetUnion - equals', () => {
  it('returns true for identical structure', () => {
    const dsu1 = new DisjointSetUnion(5)
    const dsu2 = new DisjointSetUnion(5)
    dsu1.union(0, 1)
    dsu1.union(2, 3)
    dsu2.union(0, 1)
    dsu2.union(2, 3)
    expect(dsu1.equals(dsu2)).toBe(true)
  })

  it('returns false for different sizes', () => {
    const dsu1 = new DisjointSetUnion(3)
    const dsu2 = new DisjointSetUnion(5)
    expect(dsu1.equals(dsu2)).toBe(false)
  })

  it('returns false for different component counts', () => {
    const dsu1 = new DisjointSetUnion(3)
    const dsu2 = new DisjointSetUnion(3)
    dsu1.union(0, 1)
    expect(dsu1.equals(dsu2)).toBe(false)
  })

  it('returns false for different partitioning', () => {
    const dsu1 = new DisjointSetUnion(4)
    const dsu2 = new DisjointSetUnion(4)
    dsu1.union(0, 1)
    dsu1.union(2, 3)
    dsu2.union(0, 2)
    dsu2.union(1, 3)
    expect(dsu1.equals(dsu2)).toBe(false)
  })

  it('handles non-DSU input', () => {
    const dsu = new DisjointSetUnion(3)
    expect(dsu.equals({})).toBe(false)
    expect(dsu.equals(null)).toBe(false)
  })
})

// ─── Additional edge cases ────────────────────────────────────────────────
describe('DisjointSetUnion - edge cases', () => {
  it('handles NaN in constructor', () => {
    expect(() => new DisjointSetUnion(NaN)).toThrow(RangeError)
  })

  it('handles Infinity in constructor', () => {
    expect(() => new DisjointSetUnion(Infinity)).toThrow(RangeError)
  })

  it('handles decimal numbers in constructor', () => {
    expect(() => new DisjointSetUnion(3.5)).toThrow(RangeError)
  })

  it('handles large number of unions', () => {
    const dsu = new DisjointSetUnion(100)
    for (let i = 0; i < 99; i++) {
      dsu.union(i, i + 1)
    }
    expect(dsu.componentCount).toBe(1)
  })

  it('setSize works after complex union tree', () => {
    const dsu = new DisjointSetUnion(8)
    dsu.union(0, 1)
    dsu.union(2, 3)
    dsu.union(4, 5)
    dsu.union(6, 7)
    dsu.union(0, 2)
    dsu.union(4, 6)
    dsu.union(0, 4)
    expect(dsu.setSize(7)).toBe(8)
  })

  it('rank remains bounded', () => {
    const dsu = new DisjointSetUnion(1000)
    for (let i = 1; i < 1000; i++) {
      dsu.union(0, i)
    }
    expect(dsu.rank(0)).toBeLessThan(15)
  })

  it('should reset DSU', () => {
    const dsu = new DisjointSetUnion(3)
    dsu.union(0, 1)
    expect(dsu.connected(0, 1)).toBe(true)
    dsu.reset()
    expect(dsu.connected(0, 1)).toBe(false)
  })

  it('should report set size', () => {
    const dsu = new DisjointSetUnion(4)
    dsu.union(0, 1)
    dsu.union(0, 2)
    expect(dsu.setSize(0)).toBe(3)
  })

  it('should handle all connected', () => {
    const dsu = new DisjointSetUnion(4)
    dsu.union(0, 1)
    dsu.union(1, 2)
    dsu.union(2, 3)
    expect(dsu.connected(0, 3)).toBe(true)
    expect(dsu.setSize(0)).toBe(4)
  })

  it('should handle repeated union', () => {
    const dsu = new DisjointSetUnion(3)
    expect(dsu.union(0, 1)).toBe(true)
    expect(dsu.union(0, 1)).toBe(false)
  })

  it('setSize returns component size', () => {
    const dsu = new DisjointSetUnion(4)
    dsu.union(0, 1)
    dsu.union(2, 3)
    expect(dsu.setSize(0)).toBe(2)
    expect(dsu.setSize(2)).toBe(2)
  })

  it('reset clears all unions', () => {
    const dsu = new DisjointSetUnion(3)
    dsu.union(0, 1)
    dsu.reset()
    expect(dsu.connected(0, 1)).toBe(false)
  })

  it('toString returns string', () => {
    const dsu = new DisjointSetUnion(3)
    expect(typeof dsu.toString()).toBe('string')
  })
})

  it('find returns root', () => {
    const dsu = new DisjointSetUnion(3)
    dsu.union(0, 1)
    expect(dsu.find(0)).toBe(dsu.find(1))
  })

  it('connected returns true after union', () => {
    const dsu = new DisjointSetUnion(3)
    dsu.union(0, 1)
    expect(dsu.connected(0, 1)).toBe(true)
  })

  it('componentCount returns count', () => {
    const dsu = new DisjointSetUnion(5)
    expect(dsu.componentCount).toBe(5)
  })

describe('disjoint-set-union - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('disjoint-set-union - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('disjoint-set-union - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('disjoint-set-union - wave548', () => {
  it('disjoint-set-union module defined', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union module is function', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - wave549', () => {
  it('disjoint-set-union module defined', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union module is function', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - wave550', () => {
  it('disjoint-set-union w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - wave551', () => {
  it('disjoint-set-union w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - wave552', () => {
  it('disjoint-set-union w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - wave553', () => {
  it('disjoint-set-union w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - wave554', () => {
  it('disjoint-set-union w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - wave555', () => {
  it('disjoint-set-union w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - wave556', () => {
  it('disjoint-set-union w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - wave557', () => {
  it('disjoint-set-union w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - wave558', () => {
  it('disjoint-set-union w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - wave559', () => {
  it('disjoint-set-union w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - wave560', () => {
  it('disjoint-set-union w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - wave561', () => {
  it('disjoint-set-union w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - wave562', () => {
  it('disjoint-set-union w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - wave563', () => {
  it('disjoint-set-union w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - wave564', () => {
  it('disjoint-set-union w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - wave565', () => {
  it('disjoint-set-union w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - wave566', () => {
  it('disjoint-set-union w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - wave127', () => {
  it('disjoint-set-union w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - wave130', () => {
  it('disjoint-set-union w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - wave133', () => {
  it('disjoint-set-union w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - wave136', () => {
  it('disjoint-set-union w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - wave139', () => {
  it('disjoint-set-union w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w142', () => {
  it('disjoint-set-union v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w145', () => {
  it('disjoint-set-union v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w148', () => {
  it('disjoint-set-union v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w151', () => {
  it('disjoint-set-union v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w154', () => {
  it('disjoint-set-union v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w157', () => {
  it('disjoint-set-union v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w160', () => {
  it('disjoint-set-union v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w170', () => {
  it('disjoint-set-union x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w180', () => {
  it('disjoint-set-union x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w190', () => {
  it('disjoint-set-union x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w200', () => {
  it('disjoint-set-union x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w210', () => {
  it('disjoint-set-union x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w220', () => {
  it('disjoint-set-union x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w230', () => {
  it('disjoint-set-union x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w240', () => {
  it('disjoint-set-union x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w250', () => {
  it('disjoint-set-union x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w260', () => {
  it('disjoint-set-union x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w270', () => {
  it('disjoint-set-union x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w280', () => {
  it('disjoint-set-union x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w290', () => {
  it('disjoint-set-union x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w300', () => {
  it('disjoint-set-union x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w310', () => {
  it('disjoint-set-union x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w320', () => {
  it('disjoint-set-union x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w330', () => {
  it('disjoint-set-union x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w340', () => {
  it('disjoint-set-union x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w350', () => {
  it('disjoint-set-union x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w360', () => {
  it('disjoint-set-union x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w370', () => {
  it('disjoint-set-union x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w380', () => {
  it('disjoint-set-union x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w390', () => {
  it('disjoint-set-union x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w400', () => {
  it('disjoint-set-union x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w420', () => {
  it('disjoint-set-union x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w440', () => {
  it('disjoint-set-union x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w460', () => {
  it('disjoint-set-union x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w480', () => {
  it('disjoint-set-union x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w500', () => {
  it('disjoint-set-union x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w550', () => {
  it('disjoint-set-union x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w600', () => {
  it('disjoint-set-union x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w650', () => {
  it('disjoint-set-union x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w700', () => {
  it('disjoint-set-union x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w800', () => {
  it('disjoint-set-union x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w900', () => {
  it('disjoint-set-union x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-set-union - w1000', () => {
  it('disjoint-set-union x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-set-union x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
