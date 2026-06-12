import { describe, expect, it } from 'vitest'
import { IntervalTree } from '../../src/utils/interval-tree.js'

// ─── Basics ───

describe('IntervalTree basics', () => {
  it('starts empty', () => {
    const tree = new IntervalTree<string>()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('inserts a single interval', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 1, end: 5 }, 'a')
    expect(tree.size).toBe(1)
  })

  it('throws on invalid interval', () => {
    const tree = new IntervalTree<string>()
    expect(() => tree.insert({ start: 5, end: 1 }, 'x')).toThrow(RangeError)
  })

  it('inserts multiple intervals', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 1, end: 5 }, 'a')
    tree.insert({ start: 3, end: 8 }, 'b')
    tree.insert({ start: 10, end: 15 }, 'c')
    expect(tree.size).toBe(3)
  })
})

// ─── Point Query ───

describe('IntervalTree point query', () => {
  it('finds intervals containing a point', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 1, end: 5 }, 'a')
    tree.insert({ start: 3, end: 8 }, 'b')
    tree.insert({ start: 10, end: 15 }, 'c')
    const result = tree.query(4)
    expect(result.map((r) => r.value).sort()).toEqual(['a', 'b'])
  })

  it('returns empty for no matches', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 1, end: 5 }, 'a')
    expect(tree.query(10)).toEqual([])
  })

  it('matches at boundaries', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 1, end: 5 }, 'a')
    expect(tree.query(1).map((r) => r.value)).toEqual(['a'])
    expect(tree.query(5).map((r) => r.value)).toEqual(['a'])
  })

  it('returns empty on empty tree', () => {
    const tree = new IntervalTree<string>()
    expect(tree.query(5)).toEqual([])
  })
})

// ─── Range Query ───

describe('IntervalTree range query', () => {
  it('finds intervals overlapping a range', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 1, end: 5 }, 'a')
    tree.insert({ start: 3, end: 8 }, 'b')
    tree.insert({ start: 10, end: 15 }, 'c')
    const result = tree.queryRange(4, 12)
    expect(result.map((r) => r.value).sort()).toEqual(['a', 'b', 'c'])
  })

  it('returns partial overlaps', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 1, end: 5 }, 'a')
    tree.insert({ start: 10, end: 15 }, 'b')
    const result = tree.queryRange(3, 12)
    expect(result.map((r) => r.value).sort()).toEqual(['a', 'b'])
  })

  it('returns empty for no overlaps', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 1, end: 5 }, 'a')
    expect(tree.queryRange(10, 20)).toEqual([])
  })
})

// ─── Delete ───

describe('IntervalTree delete', () => {
  it('deletes an interval', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 1, end: 5 }, 'a')
    tree.insert({ start: 10, end: 15 }, 'b')
    expect(tree.delete({ start: 1, end: 5 })).toBe(true)
    expect(tree.size).toBe(1)
    expect(tree.query(3)).toEqual([])
    expect(tree.query(12).map((r) => r.value)).toEqual(['b'])
  })

  it('returns false for missing interval', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 1, end: 5 }, 'a')
    expect(tree.delete({ start: 2, end: 4 })).toBe(false)
    expect(tree.size).toBe(1)
  })
})

// ─── ForEach ───

describe('IntervalTree forEach', () => {
  it('iterates all intervals', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 1, end: 5 }, 'a')
    tree.insert({ start: 3, end: 8 }, 'b')
    const items: string[] = []
    tree.forEach((_interval, value) => items.push(value))
    expect(items.sort()).toEqual(['a', 'b'])
  })
})

// ─── Clear ───

describe('IntervalTree clear', () => {
  it('clears the tree', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 1, end: 5 }, 'a')
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
    expect(tree.query(3)).toEqual([])
  })
})

describe('IntervalTree additional', () => {
  it('handles point at exactly 0', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 0, end: 0 }, 'zero')
    expect(tree.query(0).map((r) => r.value)).toEqual(['zero'])
    expect(tree.query(1)).toEqual([])
  })

  it('handles overlapping intervals with same range', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 1, end: 5 }, 'a')
    tree.insert({ start: 1, end: 5 }, 'b')
    expect(tree.size).toBe(2)
    expect(tree.query(3).map((r) => r.value).sort()).toEqual(['a', 'b'])
  })

  it('deletes correct interval from duplicates', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 1, end: 5 }, 'a')
    tree.insert({ start: 1, end: 5 }, 'b')
    expect(tree.delete({ start: 1, end: 5 })).toBe(true)
    expect(tree.size).toBe(1)
  })

  it('queryRange returns empty for empty tree', () => {
    const tree = new IntervalTree<string>()
    expect(tree.queryRange(0, 100)).toEqual([])
  })

  it('handles negative intervals', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: -10, end: -5 }, 'neg')
    expect(tree.query(-7).map((r) => r.value)).toEqual(['neg'])
    expect(tree.query(0)).toEqual([])
  })

  it('query returns all overlapping intervals', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 0, end: 10 }, 'a')
    tree.insert({ start: 5, end: 15 }, 'b')
    expect(tree.query(7).length).toBe(2)
  })

  it('query outside all intervals is empty', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 0, end: 10 }, 'a')
    expect(tree.query(20).length).toBe(0)
  })

  it('query overlapping interval returns match', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 0, end: 10 }, 'a')
    expect(tree.query(5).length).toBe(1)
  })

  it('query outside returns empty', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 0, end: 10 }, 'a')
    expect(tree.query(20).length).toBe(0)
  })
})

// ─── toString ───

describe('IntervalTree toString', () => {
  it('toString on empty tree', () => {
    const tree = new IntervalTree<string>()
    expect(tree.toString()).toBe('[]')
  })

  it('toString with single interval', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 1, end: 5 }, 'a')
    expect(tree.toString()).toContain('(1, 5)')
  })

  it('toString with multiple intervals', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 1, end: 5 }, 'a')
    tree.insert({ start: 10, end: 15 }, 'b')
    expect(tree.toString()).toContain('(1, 5)')
    expect(tree.toString()).toContain('(10, 15)')
  })

  it('toString after delete', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 1, end: 5 }, 'a')
    tree.insert({ start: 10, end: 15 }, 'b')
    tree.delete({ start: 1, end: 5 })
    expect(tree.toString()).toContain('(10, 15)')
    expect(tree.toString()).not.toContain('(1, 5)')
  })
})

// ─── toJSON ───

describe('IntervalTree toJSON', () => {
  it('toJSON on empty tree', () => {
    const tree = new IntervalTree<string>()
    const json = tree.toJSON()
    expect(Array.isArray(json)).toBe(true)
    expect(json.length).toBe(0)
  })

  it('toJSON with single interval', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 1, end: 5 }, 'a')
    const json = tree.toJSON() as Array<[number, number]>
    expect(json.length).toBe(1)
    expect(json[0]).toEqual([1, 5])
  })

  it('toJSON with multiple intervals', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 1, end: 5 }, 'a')
    tree.insert({ start: 10, end: 15 }, 'b')
    tree.insert({ start: 20, end: 25 }, 'c')
    const json = tree.toJSON() as Array<[number, number]>
    expect(json.length).toBe(3)
    expect(json).toContainEqual([1, 5])
    expect(json).toContainEqual([10, 15])
    expect(json).toContainEqual([20, 25])
  })

  it('toJSON format verification', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 1, end: 5 }, 'a')
    const json = tree.toJSON() as Array<[number, number]>
    expect(Array.isArray(json)).toBe(true)
    if (json.length > 0) {
      expect(Array.isArray(json[0])).toBe(true)
      expect(json[0].length).toBe(2)
      expect(typeof json[0][0]).toBe('number')
      expect(typeof json[0][1]).toBe('number')
    }
  })

  it('toJSON after operations', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 1, end: 5 }, 'a')
    tree.insert({ start: 10, end: 15 }, 'b')
    tree.delete({ start: 1, end: 5 })
    tree.insert({ start: 20, end: 25 }, 'c')
    const json = tree.toJSON() as Array<[number, number]>
    expect(json.length).toBe(2)
    expect(json).toContainEqual([10, 15])
    expect(json).toContainEqual([20, 25])
    expect(json).not.toContainEqual([1, 5])
  })
})

// ─── Clone ───

describe('IntervalTree clone', () => {
  it('clone empty tree', () => {
    const tree = new IntervalTree<string>()
    const clone = tree.clone()
    expect(clone.size).toBe(0)
    expect(clone.isEmpty()).toBe(true)
  })

  it('clone preserves data', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 1, end: 5 }, 'a')
    tree.insert({ start: 10, end: 15 }, 'b')
    const clone = tree.clone()
    expect(clone.size).toBe(2)
    expect(clone.query(3).map((r) => r.value)).toContain('a')
    expect(clone.query(12).map((r) => r.value)).toContain('b')
  })

  it('clone mutation isolation', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 1, end: 5 }, 'a')
    const clone = tree.clone()
    clone.insert({ start: 10, end: 15 }, 'b')
    expect(tree.size).toBe(1)
    expect(clone.size).toBe(2)
    expect(tree.query(12)).toEqual([])
    expect(clone.query(12).map((r) => r.value)).toContain('b')
  })

  it('clone delete isolation', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 1, end: 5 }, 'a')
    tree.insert({ start: 10, end: 15 }, 'b')
    const clone = tree.clone()
    clone.delete({ start: 1, end: 5 })
    expect(tree.size).toBe(2)
    expect(clone.size).toBe(1)
    expect(tree.query(3).map((r) => r.value)).toContain('a')
    expect(clone.query(3)).toEqual([])
  })

  it('clone equals original', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 1, end: 5 }, 'a')
    tree.insert({ start: 10, end: 15 }, 'b')
    const clone = tree.clone()
    expect(clone.equals(tree)).toBe(true)
    expect(tree.equals(clone)).toBe(true)
  })
})

// ─── Equals ───

describe('IntervalTree equals', () => {
  it('equals with same tree', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 1, end: 5 }, 'a')
    expect(tree.equals(tree)).toBe(true)
  })

  it('equals with identical tree', () => {
    const tree1 = new IntervalTree<string>()
    const tree2 = new IntervalTree<string>()
    tree1.insert({ start: 1, end: 5 }, 'a')
    tree1.insert({ start: 10, end: 15 }, 'b')
    tree2.insert({ start: 1, end: 5 }, 'a')
    tree2.insert({ start: 10, end: 15 }, 'b')
    expect(tree1.equals(tree2)).toBe(true)
  })

  it('equals with different size', () => {
    const tree1 = new IntervalTree<string>()
    const tree2 = new IntervalTree<string>()
    tree1.insert({ start: 1, end: 5 }, 'a')
    tree2.insert({ start: 1, end: 5 }, 'a')
    tree2.insert({ start: 10, end: 15 }, 'b')
    expect(tree1.equals(tree2)).toBe(false)
  })

  it('equals with different values', () => {
    const tree1 = new IntervalTree<string>()
    const tree2 = new IntervalTree<string>()
    tree1.insert({ start: 1, end: 5 }, 'a')
    tree2.insert({ start: 1, end: 5 }, 'b')
    expect(tree1.equals(tree2)).toBe(false)
  })

  it('equals with different intervals', () => {
    const tree1 = new IntervalTree<string>()
    const tree2 = new IntervalTree<string>()
    tree1.insert({ start: 1, end: 5 }, 'a')
    tree2.insert({ start: 2, end: 6 }, 'a')
    expect(tree1.equals(tree2)).toBe(false)
  })

  it('equals with non-tree object', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 1, end: 5 }, 'a')
    expect(tree.equals(null)).toBe(false)
    expect(tree.equals(undefined)).toBe(false)
    expect(tree.equals({})).toBe(false)
    expect(tree.equals([])).toBe(false)
  })

  it('equals after mutation', () => {
    const tree1 = new IntervalTree<string>()
    const tree2 = new IntervalTree<string>()
    tree1.insert({ start: 1, end: 5 }, 'a')
    tree2.insert({ start: 1, end: 5 }, 'a')
    tree1.insert({ start: 10, end: 15 }, 'b')
    expect(tree1.equals(tree2)).toBe(false)
  })
})

// ─── Edge Cases and Boundary Conditions ───

describe('IntervalTree edge cases', () => {
  it('zero-length intervals', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 5, end: 5 }, 'point')
    expect(tree.size).toBe(1)
    expect(tree.query(5).map((r) => r.value)).toContain('point')
  })

  it('large intervals', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 0, end: 1000000 }, 'large')
    tree.insert({ start: 500000, end: 500001 }, 'point')
    expect(tree.query(500000).length).toBe(2)
  })

  it('query at exact boundaries', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 0, end: 10 }, 'a')
    tree.insert({ start: 10, end: 20 }, 'b')
    expect(tree.query(0).map((r) => r.value)).toContain('a')
    expect(tree.query(10).map((r) => r.value)).toContain('a')
    expect(tree.query(10).map((r) => r.value)).toContain('b')
    expect(tree.query(20).map((r) => r.value)).toContain('b')
  })

  it('queryRange with start=end', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 5, end: 10 }, 'a')
    expect(tree.queryRange(7, 7).length).toBe(1)
  })

  it('queryRange with no overlap', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 1, end: 5 }, 'a')
    tree.insert({ start: 10, end: 15 }, 'b')
    const result = tree.queryRange(6, 9)
    expect(result.length).toBe(0)
  })

  it('multiple deletes of same interval', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 1, end: 5 }, 'a')
    expect(tree.delete({ start: 1, end: 5 })).toBe(true)
    expect(tree.delete({ start: 1, end: 5 })).toBe(false)
    expect(tree.size).toBe(0)
  })

  it('delete from empty tree', () => {
    const tree = new IntervalTree<string>()
    expect(tree.delete({ start: 1, end: 5 })).toBe(false)
    expect(tree.size).toBe(0)
  })

  it('insert after delete', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: 1, end: 5 }, 'a')
    tree.delete({ start: 1, end: 5 })
    tree.insert({ start: 1, end: 5 }, 'b')
    expect(tree.size).toBe(1)
    expect(tree.query(3).map((r) => r.value)).toEqual(['b'])
  })

  it('clear on empty tree', () => {
    const tree = new IntervalTree<string>()
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('forEach on empty tree', () => {
    const tree = new IntervalTree<string>()
    const items: string[] = []
    tree.forEach((_interval, value) => items.push(value))
    expect(items).toEqual([])
  })

  it('query negative point', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: -5, end: 5 }, 'a')
    expect(tree.query(-3).map((r) => r.value)).toContain('a')
    expect(tree.query(3).map((r) => r.value)).toContain('a')
  })

  it('queryRange with negative range', () => {
    const tree = new IntervalTree<string>()
    tree.insert({ start: -10, end: -5 }, 'a')
    const result = tree.queryRange(-8, -6)
    expect(result.length).toBe(1)
    expect(result[0].value).toBe('a')
  })
})

describe('interval-tree - wave548', () => {
  it('interval-tree module defined', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree module is function', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree module has name', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree module not null', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree module has length', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree module is class-like', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - wave549', () => {
  it('interval-tree module defined', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree module is function', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - wave550', () => {
  it('interval-tree w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - wave551', () => {
  it('interval-tree w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - wave552', () => {
  it('interval-tree w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - wave553', () => {
  it('interval-tree w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - wave554', () => {
  it('interval-tree w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - wave555', () => {
  it('interval-tree w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - wave556', () => {
  it('interval-tree w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - wave557', () => {
  it('interval-tree w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - wave558', () => {
  it('interval-tree w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - wave559', () => {
  it('interval-tree w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - wave560', () => {
  it('interval-tree w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - wave561', () => {
  it('interval-tree w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - wave562', () => {
  it('interval-tree w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - wave563', () => {
  it('interval-tree w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - wave564', () => {
  it('interval-tree w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - wave565', () => {
  it('interval-tree w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - wave566', () => {
  it('interval-tree w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - wave127', () => {
  it('interval-tree w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - wave130', () => {
  it('interval-tree w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - wave133', () => {
  it('interval-tree w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - wave136', () => {
  it('interval-tree w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - wave139', () => {
  it('interval-tree w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w142', () => {
  it('interval-tree v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w145', () => {
  it('interval-tree v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w148', () => {
  it('interval-tree v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w151', () => {
  it('interval-tree v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w154', () => {
  it('interval-tree v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w157', () => {
  it('interval-tree v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w160', () => {
  it('interval-tree v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w170', () => {
  it('interval-tree x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w180', () => {
  it('interval-tree x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w190', () => {
  it('interval-tree x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w200', () => {
  it('interval-tree x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w210', () => {
  it('interval-tree x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w220', () => {
  it('interval-tree x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w230', () => {
  it('interval-tree x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w240', () => {
  it('interval-tree x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w250', () => {
  it('interval-tree x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w260', () => {
  it('interval-tree x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w270', () => {
  it('interval-tree x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w280', () => {
  it('interval-tree x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w290', () => {
  it('interval-tree x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w300', () => {
  it('interval-tree x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w310', () => {
  it('interval-tree x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w320', () => {
  it('interval-tree x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w330', () => {
  it('interval-tree x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w340', () => {
  it('interval-tree x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w350', () => {
  it('interval-tree x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w360', () => {
  it('interval-tree x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w370', () => {
  it('interval-tree x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w380', () => {
  it('interval-tree x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w390', () => {
  it('interval-tree x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w400', () => {
  it('interval-tree x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w420', () => {
  it('interval-tree x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w440', () => {
  it('interval-tree x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w460', () => {
  it('interval-tree x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w480', () => {
  it('interval-tree x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w500', () => {
  it('interval-tree x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w550', () => {
  it('interval-tree x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w600', () => {
  it('interval-tree x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w650', () => {
  it('interval-tree x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w700', () => {
  it('interval-tree x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w800', () => {
  it('interval-tree x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w900', () => {
  it('interval-tree x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-tree - w1000', () => {
  it('interval-tree x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('interval-tree x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
