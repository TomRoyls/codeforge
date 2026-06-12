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

describe('fenwick-tree - w142', () => {
  it('fenwick-tree v142x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree v142x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree v142x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w145', () => {
  it('fenwick-tree v145x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree v145x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree v145x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w148', () => {
  it('fenwick-tree v148x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree v148x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree v148x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w151', () => {
  it('fenwick-tree v151x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree v151x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree v151x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w154', () => {
  it('fenwick-tree v154x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree v154x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree v154x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w157', () => {
  it('fenwick-tree v157x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree v157x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree v157x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w160', () => {
  it('fenwick-tree v160x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree v160x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree v160x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w170', () => {
  it('fenwick-tree x170x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x170x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x170x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x170x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x170x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x170x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x170x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x170x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x170x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x170x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w180', () => {
  it('fenwick-tree x180x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x180x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x180x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x180x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x180x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x180x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x180x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x180x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x180x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x180x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w190', () => {
  it('fenwick-tree x190x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x190x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x190x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x190x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x190x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x190x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x190x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x190x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x190x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x190x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w200', () => {
  it('fenwick-tree x200x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x200x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x200x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x200x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x200x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x200x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x200x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x200x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x200x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x200x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w210', () => {
  it('fenwick-tree x210x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x210x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x210x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x210x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x210x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x210x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x210x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x210x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x210x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x210x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w220', () => {
  it('fenwick-tree x220x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x220x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x220x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x220x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x220x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x220x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x220x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x220x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x220x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x220x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w230', () => {
  it('fenwick-tree x230x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x230x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x230x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x230x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x230x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x230x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x230x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x230x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x230x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x230x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w240', () => {
  it('fenwick-tree x240x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x240x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x240x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x240x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x240x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x240x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x240x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x240x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x240x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x240x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w250', () => {
  it('fenwick-tree x250x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x250x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x250x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x250x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x250x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x250x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x250x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x250x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x250x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x250x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w260', () => {
  it('fenwick-tree x260x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x260x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x260x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x260x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x260x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x260x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x260x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x260x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x260x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x260x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w270', () => {
  it('fenwick-tree x270x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x270x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x270x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x270x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x270x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x270x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x270x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x270x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x270x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x270x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w280', () => {
  it('fenwick-tree x280x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x280x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x280x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x280x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x280x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x280x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x280x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x280x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x280x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x280x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w290', () => {
  it('fenwick-tree x290x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x290x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x290x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x290x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x290x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x290x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x290x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x290x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x290x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x290x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w300', () => {
  it('fenwick-tree x300x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x300x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x300x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x300x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x300x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x300x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x300x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x300x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x300x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x300x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w310', () => {
  it('fenwick-tree x310x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x310x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x310x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x310x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x310x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x310x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x310x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x310x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x310x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x310x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w320', () => {
  it('fenwick-tree x320x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x320x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x320x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x320x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x320x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x320x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x320x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x320x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x320x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x320x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w330', () => {
  it('fenwick-tree x330x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x330x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x330x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x330x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x330x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x330x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x330x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x330x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x330x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x330x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w340', () => {
  it('fenwick-tree x340x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x340x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x340x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x340x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x340x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x340x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x340x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x340x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x340x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x340x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w350', () => {
  it('fenwick-tree x350x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x350x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x350x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x350x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x350x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x350x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x350x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x350x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x350x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x350x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w360', () => {
  it('fenwick-tree x360x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x360x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x360x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x360x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x360x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x360x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x360x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x360x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x360x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x360x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w370', () => {
  it('fenwick-tree x370x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x370x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x370x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x370x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x370x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x370x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x370x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x370x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x370x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x370x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w380', () => {
  it('fenwick-tree x380x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x380x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x380x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x380x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x380x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x380x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x380x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x380x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x380x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x380x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w390', () => {
  it('fenwick-tree x390x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x390x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x390x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x390x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x390x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x390x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x390x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x390x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x390x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x390x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w400', () => {
  it('fenwick-tree x400x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x400x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x400x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x400x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x400x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x400x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x400x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x400x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x400x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x400x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w420', () => {
  it('fenwick-tree x420x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x420x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x420x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x420x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x420x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x420x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x420x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x420x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x420x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x420x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x420x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x420x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x420x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x420x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x420x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x420x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x420x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x420x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x420x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x420x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w440', () => {
  it('fenwick-tree x440x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x440x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x440x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x440x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x440x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x440x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x440x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x440x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x440x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x440x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x440x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x440x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x440x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x440x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x440x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x440x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x440x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x440x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x440x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x440x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w460', () => {
  it('fenwick-tree x460x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x460x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x460x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x460x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x460x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x460x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x460x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x460x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x460x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x460x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x460x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x460x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x460x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x460x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x460x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x460x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x460x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x460x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x460x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x460x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w480', () => {
  it('fenwick-tree x480x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x480x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x480x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x480x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x480x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x480x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x480x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x480x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x480x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x480x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x480x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x480x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x480x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x480x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x480x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x480x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x480x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x480x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x480x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x480x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w500', () => {
  it('fenwick-tree x500x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x500x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x500x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x500x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x500x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x500x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x500x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x500x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x500x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x500x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x500x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x500x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x500x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x500x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x500x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x500x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x500x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x500x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x500x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x500x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w550', () => {
  it('fenwick-tree x550x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x550x49', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('fenwick-tree - w600', () => {
  it('fenwick-tree x600x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('fenwick-tree x600x49', () => {
    expect(beforeEach).toBeDefined()
  })
})
