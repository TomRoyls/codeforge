import { beforeEach, describe, expect, it } from 'vitest'
import { IntervalTree } from '../src/utils/interval-tree.js'

describe('IntervalTree', () => {
  let tree: IntervalTree<string>

  beforeEach(() => {
    tree = new IntervalTree<string>()
  })

  // ─── constructor ───

  it('creates an empty tree', () => {
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  // ─── insert ───

  it('adds intervals and increments size', () => {
    tree.insert({ start: 1, end: 5 }, 'a')
    expect(tree.size).toBe(1)
    expect(tree.isEmpty()).toBe(false)

    tree.insert({ start: 3, end: 8 }, 'b')
    expect(tree.size).toBe(2)
  })

  it('rejects invalid intervals where start > end', () => {
    expect(() => tree.insert({ start: 5, end: 1 }, 'x')).toThrow(RangeError)
  })

  // ─── query point ───

  it('finds intervals containing a point', () => {
    tree.insert({ start: 1, end: 5 }, 'a')
    tree.insert({ start: 3, end: 8 }, 'b')

    const results = tree.query(4)
    expect(results).toHaveLength(2)
    expect(results.map((r) => r.value).sort()).toEqual(['a', 'b'])
  })

  // ─── query point no results ───

  it('returns empty for uncovered point', () => {
    tree.insert({ start: 1, end: 5 }, 'a')
    expect(tree.query(10)).toEqual([])
  })

  // ─── query range ───

  it('finds all overlapping intervals', () => {
    tree.insert({ start: 1, end: 5 }, 'a')
    tree.insert({ start: 3, end: 8 }, 'b')
    tree.insert({ start: 10, end: 15 }, 'c')

    const results = tree.queryRange(4, 12)
    expect(results).toHaveLength(3)
    expect(results.map((r) => r.value).sort()).toEqual(['a', 'b', 'c'])
  })

  // ─── query range no overlap ───

  it('returns empty when no intervals overlap', () => {
    tree.insert({ start: 1, end: 5 }, 'a')
    tree.insert({ start: 10, end: 15 }, 'b')

    expect(tree.queryRange(6, 9)).toEqual([])
  })

  // ─── delete ───

  it('removes exact interval match and returns true', () => {
    tree.insert({ start: 1, end: 5 }, 'a')
    tree.insert({ start: 3, end: 8 }, 'b')

    expect(tree.delete({ start: 1, end: 5 })).toBe(true)
    expect(tree.size).toBe(1)
    expect(tree.query(3).map((r) => r.value)).toEqual(['b'])
  })

  // ─── delete no match ───

  it('returns false for non-existing interval', () => {
    tree.insert({ start: 1, end: 5 }, 'a')
    expect(tree.delete({ start: 2, end: 5 })).toBe(false)
    expect(tree.size).toBe(1)
  })

  // ─── clear ───

  it('empties the tree', () => {
    tree.insert({ start: 1, end: 5 }, 'a')
    tree.insert({ start: 3, end: 8 }, 'b')
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
    expect(tree.query(3)).toEqual([])
  })

  // ─── isEmpty ───

  it('returns correct states', () => {
    expect(tree.isEmpty()).toBe(true)
    tree.insert({ start: 1, end: 5 }, 'a')
    expect(tree.isEmpty()).toBe(false)
    tree.delete({ start: 1, end: 5 })
    expect(tree.isEmpty()).toBe(true)
  })

  // ─── forEach ───

  it('visits all intervals', () => {
    tree.insert({ start: 1, end: 5 }, 'a')
    tree.insert({ start: 3, end: 8 }, 'b')
    tree.insert({ start: 10, end: 15 }, 'c')

    const visited: string[] = []
    tree.forEach((_interval, value) => {
      visited.push(value)
    })
    expect(visited.sort()).toEqual(['a', 'b', 'c'])
  })

  // ─── multiple intervals at same point ───

  it('returns all intervals containing same point', () => {
    tree.insert({ start: 2, end: 6 }, 'a')
    tree.insert({ start: 2, end: 6 }, 'b')
    tree.insert({ start: 1, end: 10 }, 'c')

    const results = tree.query(4)
    expect(results).toHaveLength(3)
    expect(results.map((r) => r.value).sort()).toEqual(['a', 'b', 'c'])
  })

  // ─── nested intervals ───

  it('handles nested intervals correctly', () => {
    tree.insert({ start: 1, end: 10 }, 'outer')
    tree.insert({ start: 3, end: 5 }, 'inner1')
    tree.insert({ start: 4, end: 6 }, 'inner2')

    const results = tree.query(4)
    expect(results).toHaveLength(3)
    expect(results.map((r) => r.value).sort()).toEqual([
      'inner1',
      'inner2',
      'outer',
    ])
  })

  // ─── adjacent intervals ───

  it('does not match adjacent non-overlapping intervals', () => {
    tree.insert({ start: 1, end: 5 }, 'a')
    tree.insert({ start: 6, end: 10 }, 'b')

    expect(tree.query(5.5)).toEqual([])
  })

  // ─── single point intervals ───

  it('handles single point intervals', () => {
    tree.insert({ start: 3, end: 3 }, 'point')

    expect(tree.query(3)).toHaveLength(1)
    expect(tree.query(3)[0].value).toBe('point')
    expect(tree.query(2)).toEqual([])
    expect(tree.query(4)).toEqual([])
  })

  // ─── max maintenance ───

  it('maintains max values after inserts and deletes', () => {
    tree.insert({ start: 1, end: 10 }, 'a')
    tree.insert({ start: 2, end: 20 }, 'b')
    tree.insert({ start: 3, end: 5 }, 'c')

    expect(tree.query(15)).toHaveLength(1)
    expect(tree.query(15)[0].value).toBe('b')

    tree.delete({ start: 2, end: 20 })

    expect(tree.query(15)).toEqual([])
    expect(tree.query(4).map((r) => r.value).sort()).toEqual(['a', 'c'])
  })
})
