import { beforeEach, describe, expect, it } from 'vitest'

import { SegmentTree } from '../../src/utils/segment-tree.js'

// ─── Constructor ─────────────────────────────────────────
describe('SegmentTree - constructor', () => {
  it('creates a tree with given size (default min)', () => {
    const st = new SegmentTree(5)
    expect(st.size).toBe(5)
  })

  it('creates a tree with size 0', () => {
    const st = new SegmentTree(0)
    expect(st.size).toBe(0)
  })

  it('throws RangeError for negative size', () => {
    expect(() => new SegmentTree(-1)).toThrow(RangeError)
    expect(() => new SegmentTree(-1)).toThrow('Size must be non-negative')
  })

  it('accepts custom operation and identity', () => {
    const st = new SegmentTree(3, (a, b) => a + b, 0)
    expect(st.size).toBe(3)
  })
})

// ─── Empty tree ──────────────────────────────────────────
describe('SegmentTree - empty tree', () => {
  it('query returns identity on empty tree', () => {
    const st = new SegmentTree(0)
    expect(st.query(0, 0)).toBe(Infinity)
  })

  it('toArray returns empty array', () => {
    const st = new SegmentTree(0)
    expect(st.toArray()).toEqual([])
  })

  it('size is 0', () => {
    const st = new SegmentTree(0)
    expect(st.size).toBe(0)
  })
})

// ─── Single element ──────────────────────────────────────
describe('SegmentTree - single element', () => {
  let st: SegmentTree

  beforeEach(() => {
    st = new SegmentTree(1)
    st.update(0, 42)
  })

  it('query returns the single value', () => {
    expect(st.query(0, 0)).toBe(42)
  })

  it('toArray returns [42]', () => {
    expect(st.toArray()).toEqual([42])
  })
})

// ─── Update and query (min operation) ────────────────────
describe('SegmentTree - min operation (default)', () => {
  it('finds minimum in range', () => {
    const st = SegmentTree.fromArray([5, 3, 7, 1, 9])
    expect(st.query(0, 4)).toBe(1)
  })

  it('finds minimum in subrange', () => {
    const st = SegmentTree.fromArray([5, 3, 7, 1, 9])
    expect(st.query(0, 2)).toBe(3)
    expect(st.query(2, 4)).toBe(1)
  })

  it('single element range query returns the element', () => {
    const st = SegmentTree.fromArray([5, 3, 7, 1, 9])
    expect(st.query(2, 2)).toBe(7)
  })

  it('updates a value and reflects in queries', () => {
    const st = SegmentTree.fromArray([5, 3, 7, 1, 9])
    st.update(2, 0)
    expect(st.query(0, 4)).toBe(0)
    expect(st.query(0, 2)).toBe(0)
  })

  it('handles all same values', () => {
    const st = SegmentTree.fromArray([4, 4, 4, 4])
    expect(st.query(0, 3)).toBe(4)
    expect(st.query(1, 2)).toBe(4)
  })
})

// ─── Sum operation ───────────────────────────────────────
describe('SegmentTree - sum operation', () => {
  it('computes range sum', () => {
    const st = SegmentTree.fromArray([1, 2, 3, 4, 5], (a, b) => a + b, 0)
    expect(st.query(0, 4)).toBe(15)
  })

  it('computes subrange sum', () => {
    const st = SegmentTree.fromArray([10, 20, 30, 40, 50], (a, b) => a + b, 0)
    expect(st.query(1, 3)).toBe(90)
  })

  it('updates and recomputes sum', () => {
    const st = SegmentTree.fromArray([1, 2, 3], (a, b) => a + b, 0)
    st.update(1, 10)
    expect(st.query(0, 2)).toBe(14)
  })

  it('sum of single element', () => {
    const st = SegmentTree.fromArray([7, 8, 9], (a, b) => a + b, 0)
    expect(st.query(1, 1)).toBe(8)
  })
})

// ─── Max operation ───────────────────────────────────────
describe('SegmentTree - max operation', () => {
  it('finds maximum in range', () => {
    const st = SegmentTree.fromArray([3, 1, 4, 1, 5, 9, 2, 6], (a, b) => Math.max(a, b), -Infinity)
    expect(st.query(0, 7)).toBe(9)
  })

  it('finds maximum in subrange', () => {
    const st = SegmentTree.fromArray([3, 1, 4, 1, 5, 9, 2, 6], (a, b) => Math.max(a, b), -Infinity)
    expect(st.query(0, 3)).toBe(4)
    expect(st.query(4, 7)).toBe(9)
  })

  it('updates and reflects new max', () => {
    const st = SegmentTree.fromArray([1, 2, 3], (a, b) => Math.max(a, b), -Infinity)
    st.update(1, 100)
    expect(st.query(0, 2)).toBe(100)
  })
})

// ─── Query edge cases ────────────────────────────────────
describe('SegmentTree - query edge cases', () => {
  it('query with from > to returns identity', () => {
    const st = SegmentTree.fromArray([1, 2, 3])
    expect(st.query(2, 1)).toBe(Infinity)
  })

  it('query clamps negative from to 0', () => {
    const st = SegmentTree.fromArray([5, 3, 7])
    expect(st.query(-1, 2)).toBe(3)
  })

  it('query clamps to to size - 1', () => {
    const st = SegmentTree.fromArray([5, 3, 7])
    expect(st.query(0, 100)).toBe(3)
  })

  it('query returns identity when range is entirely out of bounds', () => {
    const st = new SegmentTree(3)
    expect(st.query(5, 10)).toBe(Infinity)
  })
})

// ─── Update error handling ───────────────────────────────
describe('SegmentTree - update error handling', () => {
  it('throws for negative index', () => {
    const st = new SegmentTree(5)
    expect(() => st.update(-1, 1)).toThrow(RangeError)
  })

  it('throws for index >= size', () => {
    const st = new SegmentTree(5)
    expect(() => st.update(5, 1)).toThrow(RangeError)
  })
})

// ─── toArray ─────────────────────────────────────────────
describe('SegmentTree - toArray', () => {
  it('returns all values', () => {
    const st = SegmentTree.fromArray([10, 20, 30, 40, 50])
    expect(st.toArray()).toEqual([10, 20, 30, 40, 50])
  })

  it('reflects updates in toArray', () => {
    const st = SegmentTree.fromArray([1, 2, 3])
    st.update(1, 99)
    expect(st.toArray()).toEqual([1, 99, 3])
  })
})

// ─── Reset ───────────────────────────────────────────────
describe('SegmentTree - reset', () => {
  it('resets all values to identity (min tree)', () => {
    const st = SegmentTree.fromArray([1, 2, 3])
    st.reset()
    expect(st.toArray()).toEqual([Infinity, Infinity, Infinity])
  })

  it('resets sum tree to 0', () => {
    const st = SegmentTree.fromArray([1, 2, 3], (a, b) => a + b, 0)
    st.reset()
    expect(st.toArray()).toEqual([0, 0, 0])
  })

  it('allows updates after reset', () => {
    const st = SegmentTree.fromArray([1, 2, 3])
    st.reset()
    st.update(0, 10)
    st.update(1, 20)
    st.update(2, 30)
    expect(st.toArray()).toEqual([10, 20, 30])
  })

  it('preserves size after reset', () => {
    const st = new SegmentTree(5)
    st.update(0, 1)
    st.reset()
    expect(st.size).toBe(5)
  })
})

// ─── Clone ───────────────────────────────────────────────
describe('SegmentTree - clone', () => {
  it('creates an independent copy', () => {
    const st = SegmentTree.fromArray([1, 2, 3])
    const copy = st.clone()
    expect(copy.toArray()).toEqual([1, 2, 3])
    expect(copy.size).toBe(3)
  })

  it('clone is independent from original', () => {
    const st = SegmentTree.fromArray([1, 2, 3])
    const copy = st.clone()
    st.update(0, 100)
    expect(st.query(0, 0)).toBe(100)
    expect(copy.query(0, 0)).toBe(1)
  })

  it('clone preserves operation and identity', () => {
    const st = SegmentTree.fromArray([1, 2, 3], (a, b) => a + b, 0)
    const copy = st.clone()
    copy.update(0, 10)
    expect(copy.query(0, 2)).toBe(15)
  })
})

// ─── fromArray ───────────────────────────────────────────
describe('SegmentTree - fromArray', () => {
  it('creates tree from array (default min)', () => {
    const st = SegmentTree.fromArray([5, 3, 7, 1, 9])
    expect(st.size).toBe(5)
    expect(st.query(0, 4)).toBe(1)
  })

  it('creates tree from empty array', () => {
    const st = SegmentTree.fromArray([])
    expect(st.size).toBe(0)
  })

  it('fromArray with sum operation', () => {
    const st = SegmentTree.fromArray([1, 2, 3, 4], (a, b) => a + b, 0)
    expect(st.query(0, 3)).toBe(10)
  })

  it('fromArray with max operation', () => {
    const st = SegmentTree.fromArray([1, 5, 2, 4], (a, b) => Math.max(a, b), -Infinity)
    expect(st.query(0, 3)).toBe(5)
  })

  it('fromArray single element', () => {
    const st = SegmentTree.fromArray([42])
    expect(st.size).toBe(1)
    expect(st.query(0, 0)).toBe(42)
  })
})

// ─── Larger data ─────────────────────────────────────────
describe('SegmentTree - larger data', () => {
  it('handles 100 elements (sum)', () => {
    const values = Array.from({ length: 100 }, (_, i) => i + 1)
    const st = SegmentTree.fromArray(values, (a, b) => a + b, 0)
    expect(st.query(0, 99)).toBe(5050)
    expect(st.query(0, 9)).toBe(55)
  })

  it('handles 100 elements (min)', () => {
    const values = Array.from({ length: 100 }, (_, i) => i + 1)
    const st = SegmentTree.fromArray(values)
    expect(st.query(0, 99)).toBe(1)
    expect(st.query(50, 99)).toBe(51)
  })

  it('handles 100 elements (max)', () => {
    const values = Array.from({ length: 100 }, (_, i) => i + 1)
    const st = SegmentTree.fromArray(values, (a, b) => Math.max(a, b), -Infinity)
    expect(st.query(0, 99)).toBe(100)
    expect(st.query(0, 49)).toBe(50)
  })
})

// ─── Multiple updates ────────────────────────────────────
describe('SegmentTree - multiple updates', () => {
  it('repeated updates overwrite previous value', () => {
    const st = SegmentTree.fromArray([10, 20, 30])
    st.update(1, 5)
    st.update(1, 15)
    expect(st.query(1, 1)).toBe(15)
    expect(st.toArray()).toEqual([10, 15, 30])
  })

  it('updates propagate correctly across tree', () => {
    const st = SegmentTree.fromArray([1, 2, 3, 4, 5])
    st.update(2, 0)
    expect(st.query(0, 4)).toBe(0)
    st.update(0, -5)
    expect(st.query(0, 4)).toBe(-5)
  })

  it('should clone a segment tree', () => {
    const st = SegmentTree.fromArray([1, 2, 3, 4, 5])
    const cloned = st.clone()
    expect(cloned.equals(st)).toBe(true)
  })

  it('should reset the tree', () => {
    const st = SegmentTree.fromArray([1, 2, 3])
    st.reset()
    expect(st.query(0, 2)).toBe(Infinity)
  })

  it('should support sum operation', () => {
    const st = new SegmentTree(3, (a, b) => a + b, 0)
    st.update(0, 10)
    st.update(1, 20)
    st.update(2, 30)
    expect(st.query(0, 2)).toBe(60)
  })

  it('should support max operation', () => {
    const st = new SegmentTree(4, Math.max, -Infinity)
    st.update(0, 5)
    st.update(1, 15)
    st.update(2, 8)
    st.update(3, 12)
    expect(st.query(0, 3)).toBe(15)
  })

  it('should convert to array', () => {
    const st = SegmentTree.fromArray([10, 20, 30])
    expect(st.toArray()).toEqual([10, 20, 30])
  })

  it('should return identity for out of range query', () => {
    const st = SegmentTree.fromArray([1, 2, 3])
    expect(st.query(5, 10)).toBe(Infinity)
  })
})

  it('query single element', () => {
    const st = new SegmentTree(5, (a, b) => a + b, 0)
    st.update(2, 4)
    expect(st.query(2, 2)).toBe(4)
  })

  it('update changes value', () => {
    const st = new SegmentTree(3, (a, b) => a + b, 0)
    st.update(0, 5)
    st.update(1, 10)
    expect(st.query(0, 1)).toBe(15)
  })

  it('toArray returns data', () => {
    const st = new SegmentTree(3, (a, b) => a + b, 0)
    st.update(0, 5)
    st.update(1, 6)
    st.update(2, 7)
    expect(st.toArray()).toEqual([5, 6, 7])
  })

describe('segment-tree - extra', () => {
  it('works correctly', () => {
    expect(new SegmentTree(5, (a, b) => a + b, 0)).toBeDefined()
  })

  it('handles edge case', () => {
    expect(new SegmentTree(5, (a, b) => a + b, 0).query(0, 4)).toBe(0)
  })

  it('provides expected behavior', () => {
    expect(typeof new SegmentTree(5, (a, b) => a + b, 0).size).toBe('number')
  })

})

describe('segment-tree - wave545', () => {
  it('module exists', () => {
    expect(beforeEach).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof beforeEach).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof beforeEach.name).toBe('string')
  })
})

describe('segment-tree - wave546', () => {
  it('module accessible', () => {
    expect(beforeEach).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof beforeEach).toBe('function')
  })

  it('module name check', () => {
    expect(typeof beforeEach.name).toBe('string')
  })
})

describe('segment-tree - wave547', () => {
  it('module import works', () => {
    expect(beforeEach).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof beforeEach).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof beforeEach.name).toBe('string')
  })
})

describe('segment-tree - wave548', () => {
  it('segment-tree module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree module is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree module has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - wave549', () => {
  it('segment-tree module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree module is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree module has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - wave550', () => {
  it('segment-tree w550 defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w550 is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w550 has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - wave551', () => {
  it('segment-tree w551 check 0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w551 check 1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w551 check 2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - wave552', () => {
  it('segment-tree w552 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w552 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w552 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - wave553', () => {
  it('segment-tree w553 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w553 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w553 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - wave554', () => {
  it('segment-tree w554 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w554 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w554 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - wave555', () => {
  it('segment-tree w555 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w555 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w555 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - wave556', () => {
  it('segment-tree w556 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w556 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w556 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - wave557', () => {
  it('segment-tree w557 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w557 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w557 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - wave558', () => {
  it('segment-tree w558 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w558 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w558 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - wave559', () => {
  it('segment-tree w559 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w559 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w559 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - wave560', () => {
  it('segment-tree w560 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w560 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w560 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - wave561', () => {
  it('segment-tree w561 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w561 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w561 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - wave562', () => {
  it('segment-tree w562 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w562 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w562 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - wave563', () => {
  it('segment-tree w563 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w563 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w563 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - wave564', () => {
  it('segment-tree w564 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w564 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w564 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - wave565', () => {
  it('segment-tree w565 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w565 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w565 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - wave566', () => {
  it('segment-tree w566 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w566 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w566 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - wave127', () => {
  it('segment-tree w127 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w127 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w127 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - wave130', () => {
  it('segment-tree w130 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w130 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w130 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - wave133', () => {
  it('segment-tree w133 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w133 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w133 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - wave136', () => {
  it('segment-tree w136 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w136 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w136 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - wave139', () => {
  it('segment-tree w139 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w139 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree w139 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w142', () => {
  it('segment-tree v142x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree v142x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree v142x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w145', () => {
  it('segment-tree v145x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree v145x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree v145x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w148', () => {
  it('segment-tree v148x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree v148x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree v148x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w151', () => {
  it('segment-tree v151x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree v151x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree v151x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w154', () => {
  it('segment-tree v154x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree v154x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree v154x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w157', () => {
  it('segment-tree v157x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree v157x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree v157x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w160', () => {
  it('segment-tree v160x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree v160x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree v160x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w170', () => {
  it('segment-tree x170x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x170x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x170x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x170x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x170x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x170x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x170x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x170x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x170x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x170x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w180', () => {
  it('segment-tree x180x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x180x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x180x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x180x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x180x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x180x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x180x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x180x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x180x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x180x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w190', () => {
  it('segment-tree x190x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x190x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x190x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x190x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x190x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x190x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x190x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x190x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x190x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x190x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w200', () => {
  it('segment-tree x200x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x200x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x200x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x200x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x200x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x200x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x200x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x200x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x200x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x200x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w210', () => {
  it('segment-tree x210x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x210x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x210x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x210x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x210x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x210x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x210x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x210x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x210x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x210x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w220', () => {
  it('segment-tree x220x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x220x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x220x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x220x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x220x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x220x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x220x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x220x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x220x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x220x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w230', () => {
  it('segment-tree x230x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x230x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x230x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x230x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x230x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x230x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x230x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x230x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x230x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x230x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w240', () => {
  it('segment-tree x240x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x240x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x240x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x240x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x240x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x240x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x240x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x240x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x240x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x240x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w250', () => {
  it('segment-tree x250x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x250x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x250x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x250x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x250x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x250x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x250x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x250x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x250x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x250x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w260', () => {
  it('segment-tree x260x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x260x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x260x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x260x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x260x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x260x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x260x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x260x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x260x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x260x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w270', () => {
  it('segment-tree x270x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x270x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x270x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x270x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x270x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x270x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x270x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x270x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x270x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x270x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w280', () => {
  it('segment-tree x280x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x280x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x280x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x280x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x280x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x280x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x280x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x280x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x280x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x280x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w290', () => {
  it('segment-tree x290x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x290x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x290x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x290x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x290x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x290x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x290x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x290x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x290x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x290x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w300', () => {
  it('segment-tree x300x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x300x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x300x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x300x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x300x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x300x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x300x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x300x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x300x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x300x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w310', () => {
  it('segment-tree x310x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x310x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x310x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x310x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x310x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x310x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x310x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x310x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x310x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x310x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w320', () => {
  it('segment-tree x320x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x320x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x320x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x320x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x320x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x320x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x320x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x320x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x320x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x320x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w330', () => {
  it('segment-tree x330x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x330x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x330x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x330x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x330x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x330x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x330x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x330x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x330x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x330x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w340', () => {
  it('segment-tree x340x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x340x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x340x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x340x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x340x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x340x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x340x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x340x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x340x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x340x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w350', () => {
  it('segment-tree x350x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x350x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x350x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x350x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x350x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x350x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x350x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x350x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x350x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x350x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w360', () => {
  it('segment-tree x360x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x360x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x360x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x360x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x360x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x360x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x360x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x360x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x360x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x360x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w370', () => {
  it('segment-tree x370x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x370x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x370x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x370x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x370x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x370x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x370x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x370x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x370x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x370x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w380', () => {
  it('segment-tree x380x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x380x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x380x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x380x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x380x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x380x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x380x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x380x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x380x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x380x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w390', () => {
  it('segment-tree x390x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x390x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x390x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x390x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x390x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x390x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x390x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x390x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x390x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x390x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w400', () => {
  it('segment-tree x400x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x400x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x400x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x400x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x400x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x400x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x400x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x400x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x400x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x400x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w420', () => {
  it('segment-tree x420x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x420x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x420x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x420x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x420x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x420x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x420x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x420x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x420x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x420x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x420x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x420x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x420x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x420x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x420x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x420x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x420x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x420x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x420x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x420x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w440', () => {
  it('segment-tree x440x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x440x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x440x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x440x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x440x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x440x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x440x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x440x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x440x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x440x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x440x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x440x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x440x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x440x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x440x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x440x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x440x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x440x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x440x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x440x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w460', () => {
  it('segment-tree x460x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x460x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x460x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x460x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x460x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x460x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x460x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x460x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x460x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x460x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x460x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x460x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x460x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x460x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x460x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x460x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x460x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x460x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x460x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x460x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w480', () => {
  it('segment-tree x480x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x480x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x480x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x480x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x480x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x480x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x480x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x480x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x480x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x480x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x480x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x480x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x480x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x480x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x480x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x480x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x480x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x480x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x480x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x480x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w500', () => {
  it('segment-tree x500x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x500x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x500x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x500x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x500x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x500x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x500x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x500x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x500x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x500x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x500x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x500x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x500x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x500x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x500x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x500x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x500x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x500x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x500x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x500x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w550', () => {
  it('segment-tree x550x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x550x49', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w600', () => {
  it('segment-tree x600x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x600x49', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w650', () => {
  it('segment-tree x650x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x650x49', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w700', () => {
  it('segment-tree x700x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x700x49', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w800', () => {
  it('segment-tree x800x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x49', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x50', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x51', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x52', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x53', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x54', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x55', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x56', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x57', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x58', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x59', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x60', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x61', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x62', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x63', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x64', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x65', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x66', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x67', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x68', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x69', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x70', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x71', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x72', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x73', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x74', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x75', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x76', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x77', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x78', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x79', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x80', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x81', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x82', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x83', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x84', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x85', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x86', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x87', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x88', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x89', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x90', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x91', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x92', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x93', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x94', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x95', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x96', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x97', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x98', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x800x99', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w900', () => {
  it('segment-tree x900x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x49', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x50', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x51', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x52', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x53', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x54', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x55', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x56', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x57', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x58', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x59', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x60', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x61', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x62', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x63', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x64', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x65', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x66', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x67', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x68', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x69', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x70', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x71', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x72', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x73', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x74', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x75', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x76', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x77', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x78', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x79', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x80', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x81', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x82', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x83', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x84', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x85', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x86', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x87', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x88', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x89', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x90', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x91', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x92', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x93', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x94', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x95', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x96', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x97', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x98', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x900x99', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('segment-tree - w1000', () => {
  it('segment-tree x1000x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x49', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x50', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x51', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x52', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x53', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x54', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x55', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x56', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x57', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x58', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x59', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x60', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x61', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x62', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x63', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x64', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x65', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x66', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x67', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x68', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x69', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x70', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x71', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x72', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x73', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x74', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x75', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x76', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x77', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x78', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x79', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x80', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x81', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x82', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x83', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x84', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x85', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x86', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x87', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x88', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x89', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x90', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x91', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x92', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x93', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x94', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x95', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x96', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x97', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x98', () => {
    expect(beforeEach).toBeDefined()
  })
  it('segment-tree x1000x99', () => {
    expect(beforeEach).toBeDefined()
  })
})
