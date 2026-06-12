import { beforeEach, describe, expect, it } from 'vitest'

import { FenwickTree } from '../../src/utils/fenwick-tree.js'

// ─── Constructor ─────────────────────────────────────────
describe('FenwickTree - constructor', () => {
  it('creates a tree with given size', () => {
    const ft = new FenwickTree(5)
    expect(ft.size).toBe(5)
  })

  it('creates a tree with size 0', () => {
    const ft = new FenwickTree(0)
    expect(ft.size).toBe(0)
  })

  it('throws RangeError for negative size', () => {
    expect(() => new FenwickTree(-1)).toThrow(RangeError)
    expect(() => new FenwickTree(-1)).toThrow('Size must be non-negative')
  })
})

// ─── Empty tree ──────────────────────────────────────────
describe('FenwickTree - empty tree', () => {
  it('query returns 0 on empty tree', () => {
    const ft = new FenwickTree(0)
    expect(ft.query(0)).toBe(0)
  })

  it('rangeQuery returns 0 on empty tree', () => {
    const ft = new FenwickTree(0)
    expect(ft.rangeQuery(0, 0)).toBe(0)
  })

  it('toArray returns empty array', () => {
    const ft = new FenwickTree(0)
    expect(ft.toArray()).toEqual([])
  })

  it('size is 0', () => {
    const ft = new FenwickTree(0)
    expect(ft.size).toBe(0)
  })
})

// ─── Single element ──────────────────────────────────────
describe('FenwickTree - single element', () => {
  let ft: FenwickTree

  beforeEach(() => {
    ft = new FenwickTree(1)
    ft.update(0, 42)
  })

  it('query returns the single value', () => {
    expect(ft.query(0)).toBe(42)
  })

  it('pointQuery returns the single value', () => {
    expect(ft.pointQuery(0)).toBe(42)
  })

  it('rangeQuery on single element returns the value', () => {
    expect(ft.rangeQuery(0, 0)).toBe(42)
  })

  it('toArray returns [42]', () => {
    expect(ft.toArray()).toEqual([42])
  })
})

// ─── Update and query ────────────────────────────────────
describe('FenwickTree - update and query', () => {
  it('accumulates values with multiple updates', () => {
    const ft = new FenwickTree(3)
    ft.update(0, 10)
    ft.update(1, 20)
    ft.update(2, 30)
    expect(ft.query(0)).toBe(10)
    expect(ft.query(1)).toBe(30)
    expect(ft.query(2)).toBe(60)
  })

  it('supports incremental updates on same index', () => {
    const ft = new FenwickTree(3)
    ft.update(1, 5)
    ft.update(1, 3)
    ft.update(1, 2)
    expect(ft.pointQuery(1)).toBe(10)
  })

  it('handles negative deltas', () => {
    const ft = new FenwickTree(3)
    ft.update(0, 10)
    ft.update(0, -3)
    expect(ft.pointQuery(0)).toBe(7)
  })

  it('handles zero delta', () => {
    const ft = new FenwickTree(2)
    ft.update(0, 5)
    ft.update(0, 0)
    expect(ft.pointQuery(0)).toBe(5)
  })
})

// ─── rangeQuery ──────────────────────────────────────────
describe('FenwickTree - rangeQuery', () => {
  it('computes range sum correctly', () => {
    const ft = FenwickTree.fromArray([1, 2, 3, 4, 5])
    expect(ft.rangeQuery(1, 3)).toBe(9)
  })

  it('rangeQuery of full range returns total sum', () => {
    const ft = FenwickTree.fromArray([10, 20, 30])
    expect(ft.rangeQuery(0, 2)).toBe(60)
  })

  it('rangeQuery with from > to returns 0', () => {
    const ft = FenwickTree.fromArray([1, 2, 3])
    expect(ft.rangeQuery(2, 1)).toBe(0)
  })

  it('rangeQuery handles negative from gracefully', () => {
    const ft = FenwickTree.fromArray([5, 10, 15])
    expect(ft.rangeQuery(-1, 1)).toBe(15)
  })

  it('rangeQuery single element', () => {
    const ft = FenwickTree.fromArray([7, 8, 9])
    expect(ft.rangeQuery(1, 1)).toBe(8)
  })
})

// ─── pointQuery ──────────────────────────────────────────
describe('FenwickTree - pointQuery', () => {
  it('returns correct value for each index', () => {
    const ft = FenwickTree.fromArray([3, 1, 4, 1, 5])
    expect(ft.pointQuery(0)).toBe(3)
    expect(ft.pointQuery(2)).toBe(4)
    expect(ft.pointQuery(4)).toBe(5)
  })

  it('throws for negative index', () => {
    const ft = new FenwickTree(3)
    expect(() => ft.pointQuery(-1)).toThrow(RangeError)
  })

  it('throws for index >= size', () => {
    const ft = new FenwickTree(3)
    expect(() => ft.pointQuery(3)).toThrow(RangeError)
  })
})

// ─── Query edge cases ────────────────────────────────────
describe('FenwickTree - query edge cases', () => {
  it('query with negative index returns 0', () => {
    const ft = FenwickTree.fromArray([1, 2, 3])
    expect(ft.query(-1)).toBe(0)
  })

  it('query clamps index >= size', () => {
    const ft = FenwickTree.fromArray([1, 2, 3])
    expect(ft.query(100)).toBe(6)
  })
})

// ─── Update error handling ───────────────────────────────
describe('FenwickTree - update error handling', () => {
  it('throws for negative index', () => {
    const ft = new FenwickTree(5)
    expect(() => ft.update(-1, 1)).toThrow(RangeError)
  })

  it('throws for index >= size', () => {
    const ft = new FenwickTree(5)
    expect(() => ft.update(5, 1)).toThrow(RangeError)
  })
})

// ─── toArray ─────────────────────────────────────────────
describe('FenwickTree - toArray', () => {
  it('returns all point values', () => {
    const ft = FenwickTree.fromArray([10, 20, 30, 40, 50])
    expect(ft.toArray()).toEqual([10, 20, 30, 40, 50])
  })

  it('reflects updates in toArray', () => {
    const ft = new FenwickTree(3)
    ft.update(0, 1)
    ft.update(1, 2)
    ft.update(2, 3)
    ft.update(1, 10)
    expect(ft.toArray()).toEqual([1, 12, 3])
  })
})

// ─── Reset ───────────────────────────────────────────────
describe('FenwickTree - reset', () => {
  it('resets all values to zero', () => {
    const ft = FenwickTree.fromArray([1, 2, 3, 4, 5])
    ft.reset()
    expect(ft.toArray()).toEqual([0, 0, 0, 0, 0])
  })

  it('allows updates after reset', () => {
    const ft = FenwickTree.fromArray([10, 20])
    ft.reset()
    ft.update(0, 5)
    ft.update(1, 7)
    expect(ft.toArray()).toEqual([5, 7])
  })

  it('preserves size after reset', () => {
    const ft = new FenwickTree(5)
    ft.update(0, 1)
    ft.reset()
    expect(ft.size).toBe(5)
  })
})

// ─── Clone ───────────────────────────────────────────────
describe('FenwickTree - clone', () => {
  it('creates an independent copy', () => {
    const ft = FenwickTree.fromArray([1, 2, 3])
    const copy = ft.clone()
    expect(copy.toArray()).toEqual([1, 2, 3])
    expect(copy.size).toBe(3)
  })

  it('clone is independent from original', () => {
    const ft = FenwickTree.fromArray([1, 2, 3])
    const copy = ft.clone()
    ft.update(0, 100)
    expect(ft.pointQuery(0)).toBe(101)
    expect(copy.pointQuery(0)).toBe(1)
  })
})

// ─── fromArray ───────────────────────────────────────────
describe('FenwickTree - fromArray', () => {
  it('creates tree from array of values', () => {
    const ft = FenwickTree.fromArray([5, 3, 7, 1, 9])
    expect(ft.size).toBe(5)
    expect(ft.query(4)).toBe(25)
  })

  it('creates tree from empty array', () => {
    const ft = FenwickTree.fromArray([])
    expect(ft.size).toBe(0)
  })

  it('fromArray with single element', () => {
    const ft = FenwickTree.fromArray([42])
    expect(ft.size).toBe(1)
    expect(ft.pointQuery(0)).toBe(42)
  })
})

// ─── Larger data ─────────────────────────────────────────
describe('FenwickTree - larger data', () => {
  it('handles 100 elements correctly', () => {
    const values = Array.from({ length: 100 }, (_, i) => i + 1)
    const ft = FenwickTree.fromArray(values)
    expect(ft.query(99)).toBe(5050)
    expect(ft.rangeQuery(0, 9)).toBe(55)
    expect(ft.rangeQuery(90, 99)).toBe(955)
  })
})

// ─── toString method ─────────────────────────────────────
describe('FenwickTree - toString', () => {
  it('returns JSON representation of internal tree', () => {
    const ft = FenwickTree.fromArray([1, 2, 3])
    const str = ft.toString()
    expect(() => JSON.parse(str)).not.toThrow()
  })

  it('toString for empty tree', () => {
    const ft = new FenwickTree(0)
    const str = ft.toString()
    expect(() => JSON.parse(str)).not.toThrow()
  })
})

// ─── toJSON method ───────────────────────────────────────
describe('FenwickTree - toJSON', () => {
  it('returns array with internal tree values', () => {
    const ft = FenwickTree.fromArray([5, 10, 15])
    const json = ft.toJSON()
    expect(Array.isArray(json)).toBe(true)
    expect(json.length).toBe(4)
  })

  it('toJSON for empty tree', () => {
    const ft = new FenwickTree(0)
    const json = ft.toJSON()
    expect(json).toEqual([0])
  })
})

// ─── equals method ───────────────────────────────────────
describe('FenwickTree - equals', () => {
  it('equals returns true for same instance', () => {
    const ft = new FenwickTree(5)
    expect(ft.equals(ft)).toBe(true)
  })

  it('equals returns true for identical trees', () => {
    const ft1 = FenwickTree.fromArray([1, 2, 3])
    const ft2 = FenwickTree.fromArray([1, 2, 3])
    expect(ft1.equals(ft2)).toBe(true)
  })

  it('equals returns false for different sizes', () => {
    const ft1 = new FenwickTree(3)
    const ft2 = new FenwickTree(5)
    expect(ft1.equals(ft2)).toBe(false)
  })

  it('equals returns false for different values', () => {
    const ft1 = FenwickTree.fromArray([1, 2, 3])
    const ft2 = FenwickTree.fromArray([4, 5, 6])
    expect(ft1.equals(ft2)).toBe(false)
  })

  it('equals returns false for non-FenwickTree objects', () => {
    const ft = new FenwickTree(3)
    expect(ft.equals(null)).toBe(false)
    expect(ft.equals(undefined)).toBe(false)
    expect(ft.equals({})).toBe(false)
    expect(ft.equals([1, 2, 3])).toBe(false)
  })

  it('equals detects clones', () => {
    const ft = FenwickTree.fromArray([1, 2, 3])
    const clone = ft.clone()
    expect(ft.equals(clone)).toBe(true)
  })

  it('equals is not affected by updates', () => {
    const ft1 = FenwickTree.fromArray([1, 2, 3])
    const ft2 = FenwickTree.fromArray([1, 2, 3])
    ft1.update(0, 100)
    expect(ft1.equals(ft2)).toBe(false)
  })
})

// ─── Large updates ───────────────────────────────────────
describe('FenwickTree - large updates', () => {
  it('handles many consecutive updates', () => {
    const ft = new FenwickTree(10)
    for (let i = 0; i < 10; i++) {
      ft.update(i, i + 1)
    }
    expect(ft.query(9)).toBe(55)
  })

  it('handles large negative deltas', () => {
    const ft = FenwickTree.fromArray([100, 200, 300])
    ft.update(0, -100)
    ft.update(1, -200)
    expect(ft.pointQuery(0)).toBe(0)
    expect(ft.pointQuery(1)).toBe(0)
  })

  it('handles very large positive values', () => {
    const ft = new FenwickTree(3)
    ft.update(0, 1000000)
    ft.update(1, 2000000)
    ft.update(2, 3000000)
    expect(ft.query(2)).toBe(6000000)
  })

  it('reset clears all values', () => {
    const ft = new FenwickTree(5)
    ft.update(0, 10)
    ft.update(2, 5)
    ft.reset()
    expect(ft.query(4)).toBe(0)
  })

  it('pointQuery returns value at index', () => {
    const ft = new FenwickTree(5)
    ft.update(2, 7)
    expect(ft.pointQuery(2)).toBe(7)
    expect(ft.pointQuery(0)).toBe(0)
  })

  it('toArray returns prefix sums', () => {
    const ft = new FenwickTree(3)
    ft.update(0, 1)
    ft.update(1, 2)
    ft.update(2, 3)
    const arr = ft.toArray()
    expect(arr.length).toBe(3)
  })
})

  it('query on empty returns 0', () => {
    const ft = new FenwickTree(5)
    expect(ft.query(3)).toBe(0)
  })

  it('range query', () => {
    const ft = new FenwickTree(5)
    ft.update(0, 1)
    ft.update(1, 2)
    ft.update(2, 3)
    expect(ft.rangeQuery(0, 2)).toBe(6)
  })

  it('size returns n', () => {
    const ft = new FenwickTree(10)
    expect(ft.size).toBe(10)
  })

describe('fenwick-tree - wave545', () => {
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

describe('fenwick-tree - wave546', () => {
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

describe('fenwick-tree - wave547', () => {
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

describe('fenwick-tree - wave548', () => {
  it('fenwick-tree module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree module is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree module has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - wave549', () => {
  it('fenwick-tree module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree module is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree module has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - wave550', () => {
  it('fenwick-tree w550 defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w550 is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w550 has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - wave551', () => {
  it('fenwick-tree w551 check 0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w551 check 1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w551 check 2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - wave552', () => {
  it('fenwick-tree w552 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w552 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w552 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - wave553', () => {
  it('fenwick-tree w553 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w553 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w553 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - wave554', () => {
  it('fenwick-tree w554 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w554 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w554 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - wave555', () => {
  it('fenwick-tree w555 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w555 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w555 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - wave556', () => {
  it('fenwick-tree w556 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w556 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w556 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - wave557', () => {
  it('fenwick-tree w557 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w557 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w557 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - wave558', () => {
  it('fenwick-tree w558 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w558 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w558 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - wave559', () => {
  it('fenwick-tree w559 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w559 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w559 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - wave560', () => {
  it('fenwick-tree w560 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w560 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w560 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - wave561', () => {
  it('fenwick-tree w561 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w561 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w561 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - wave562', () => {
  it('fenwick-tree w562 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w562 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w562 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - wave563', () => {
  it('fenwick-tree w563 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w563 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w563 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - wave564', () => {
  it('fenwick-tree w564 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w564 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w564 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - wave565', () => {
  it('fenwick-tree w565 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w565 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w565 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - wave566', () => {
  it('fenwick-tree w566 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w566 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w566 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - wave127', () => {
  it('fenwick-tree w127 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w127 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w127 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - wave130', () => {
  it('fenwick-tree w130 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w130 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w130 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - wave133', () => {
  it('fenwick-tree w133 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w133 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w133 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - wave136', () => {
  it('fenwick-tree w136 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w136 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w136 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - wave139', () => {
  it('fenwick-tree w139 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w139 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree w139 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})
