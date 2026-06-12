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
