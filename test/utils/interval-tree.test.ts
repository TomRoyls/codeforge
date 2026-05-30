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
})
