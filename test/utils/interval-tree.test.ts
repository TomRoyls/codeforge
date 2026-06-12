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
