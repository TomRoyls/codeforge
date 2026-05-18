import { describe, it, expect } from 'vitest'
import { QuadTreeMap2 } from '../../src/core/quadtree-map-2/index.js'

// ─── Constructor ───

describe('QuadTreeMap2 constructor', () => {
  it('creates a tree with given bounds', () => {
    const tree = new QuadTreeMap2<string>({ x: 0, y: 0, width: 100, height: 100 })
    expect(tree.size()).toBe(0)
  })

  it('creates with custom maxPointsPerNode and maxDepth', () => {
    const tree = new QuadTreeMap2<string>(
      { x: 0, y: 0, width: 100, height: 100 },
      2,
      4,
    )
    expect(tree.size()).toBe(0)
  })
})

// ─── insert ───

describe('QuadTreeMap2 insert', () => {
  it('inserts a single point', () => {
    const tree = new QuadTreeMap2<string>({ x: 0, y: 0, width: 100, height: 100 })
    expect(tree.insert(10, 10, 'a')).toBe(true)
    expect(tree.size()).toBe(1)
  })

  it('inserts multiple points', () => {
    const tree = new QuadTreeMap2<string>({ x: 0, y: 0, width: 100, height: 100 })
    tree.insert(10, 10, 'a')
    tree.insert(20, 20, 'b')
    tree.insert(30, 30, 'c')
    expect(tree.size()).toBe(3)
  })

  it('returns false for point outside bounds', () => {
    const tree = new QuadTreeMap2<string>({ x: 0, y: 0, width: 100, height: 100 })
    expect(tree.insert(200, 200, 'out')).toBe(false)
    expect(tree.size()).toBe(0)
  })

  it('returns false for point on right/bottom edge (exclusive)', () => {
    const tree = new QuadTreeMap2<string>({ x: 0, y: 0, width: 100, height: 100 })
    expect(tree.insert(100, 50, 'edge')).toBe(false)
  })

  it('accepts point on left/top edge (inclusive)', () => {
    const tree = new QuadTreeMap2<string>({ x: 0, y: 0, width: 100, height: 100 })
    expect(tree.insert(0, 0, 'corner')).toBe(true)
    expect(tree.size()).toBe(1)
  })

  it('handles duplicate positions', () => {
    const tree = new QuadTreeMap2<string>({ x: 0, y: 0, width: 100, height: 100 })
    tree.insert(10, 10, 'a')
    tree.insert(10, 10, 'b')
    expect(tree.size()).toBe(2)
  })

  it('triggers subdivision when capacity exceeded', () => {
    const tree = new QuadTreeMap2<string>({ x: 0, y: 0, width: 100, height: 100 }, 2, 8)
    tree.insert(5, 5, 'a')
    tree.insert(15, 15, 'b')
    tree.insert(25, 25, 'c')
    expect(tree.size()).toBe(3)
  })

  it('inserts at negative coordinates', () => {
    const tree = new QuadTreeMap2<string>({ x: -50, y: -50, width: 100, height: 100 })
    expect(tree.insert(-10, -10, 'neg')).toBe(true)
    expect(tree.size()).toBe(1)
  })
})

// ─── query ───

describe('QuadTreeMap2 query', () => {
  it('returns empty for empty tree', () => {
    const tree = new QuadTreeMap2<string>({ x: 0, y: 0, width: 100, height: 100 })
    expect(tree.query({ x: 0, y: 0, width: 50, height: 50 })).toEqual([])
  })

  it('returns points within region', () => {
    const tree = new QuadTreeMap2<string>({ x: 0, y: 0, width: 100, height: 100 })
    tree.insert(10, 10, 'inside')
    tree.insert(80, 80, 'outside')
    const results = tree.query({ x: 0, y: 0, width: 50, height: 50 })
    expect(results).toHaveLength(1)
    expect(results[0]!.value).toBe('inside')
  })

  it('returns all points when region covers entire bounds', () => {
    const tree = new QuadTreeMap2<string>({ x: 0, y: 0, width: 100, height: 100 })
    tree.insert(10, 10, 'a')
    tree.insert(50, 50, 'b')
    tree.insert(90, 90, 'c')
    expect(tree.query({ x: 0, y: 0, width: 100, height: 100 })).toHaveLength(3)
  })

  it('returns empty when region does not overlap', () => {
    const tree = new QuadTreeMap2<string>({ x: 0, y: 0, width: 100, height: 100 })
    tree.insert(10, 10, 'a')
    expect(tree.query({ x: 50, y: 50, width: 50, height: 50 })).toEqual([])
  })

  it('handles query across subdivisions', () => {
    const tree = new QuadTreeMap2<string>({ x: 0, y: 0, width: 100, height: 100 }, 1, 8)
    tree.insert(5, 5, 'nw')
    tree.insert(55, 5, 'ne')
    tree.insert(5, 55, 'sw')
    tree.insert(55, 55, 'se')
    const results = tree.query({ x: 0, y: 0, width: 100, height: 100 })
    expect(results).toHaveLength(4)
  })

  it('includes coordinate data in results', () => {
    const tree = new QuadTreeMap2<string>({ x: 0, y: 0, width: 100, height: 100 })
    tree.insert(10, 20, 'val')
    const results = tree.query({ x: 0, y: 0, width: 50, height: 50 })
    expect(results[0]!.x).toBe(10)
    expect(results[0]!.y).toBe(20)
    expect(results[0]!.value).toBe('val')
  })
})

// ─── remove ───

describe('QuadTreeMap2 remove', () => {
  it('removes existing point and returns true', () => {
    const tree = new QuadTreeMap2<string>({ x: 0, y: 0, width: 100, height: 100 })
    tree.insert(10, 10, 'a')
    expect(tree.remove(10, 10)).toBe(true)
    expect(tree.size()).toBe(0)
  })

  it('returns false for non-existing point', () => {
    const tree = new QuadTreeMap2<string>({ x: 0, y: 0, width: 100, height: 100 })
    expect(tree.remove(10, 10)).toBe(false)
  })

  it('removes correct point among multiple', () => {
    const tree = new QuadTreeMap2<string>({ x: 0, y: 0, width: 100, height: 100 })
    tree.insert(10, 10, 'a')
    tree.insert(20, 20, 'b')
    tree.insert(30, 30, 'c')
    tree.remove(20, 20)
    expect(tree.size()).toBe(2)
    expect(tree.contains(10, 10)).toBe(true)
    expect(tree.contains(20, 20)).toBe(false)
    expect(tree.contains(30, 30)).toBe(true)
  })

  it('removes from subdivided tree', () => {
    const tree = new QuadTreeMap2<string>({ x: 0, y: 0, width: 100, height: 100 }, 1, 8)
    tree.insert(5, 5, 'a')
    tree.insert(55, 5, 'b')
    tree.insert(5, 55, 'c')
    expect(tree.remove(55, 5)).toBe(true)
    expect(tree.size()).toBe(2)
  })

  it('can remove all points', () => {
    const tree = new QuadTreeMap2<string>({ x: 0, y: 0, width: 100, height: 100 })
    tree.insert(10, 10, 'a')
    tree.insert(20, 20, 'b')
    tree.remove(10, 10)
    tree.remove(20, 20)
    expect(tree.size()).toBe(0)
  })
})

// ─── contains ───

describe('QuadTreeMap2 contains', () => {
  it('returns false for empty tree', () => {
    const tree = new QuadTreeMap2<string>({ x: 0, y: 0, width: 100, height: 100 })
    expect(tree.contains(10, 10)).toBe(false)
  })

  it('returns true for existing point', () => {
    const tree = new QuadTreeMap2<string>({ x: 0, y: 0, width: 100, height: 100 })
    tree.insert(10, 10, 'a')
    expect(tree.contains(10, 10)).toBe(true)
  })

  it('returns false for non-existing point', () => {
    const tree = new QuadTreeMap2<string>({ x: 0, y: 0, width: 100, height: 100 })
    tree.insert(10, 10, 'a')
    expect(tree.contains(20, 20)).toBe(false)
  })

  it('returns false after removal', () => {
    const tree = new QuadTreeMap2<string>({ x: 0, y: 0, width: 100, height: 100 })
    tree.insert(10, 10, 'a')
    tree.remove(10, 10)
    expect(tree.contains(10, 10)).toBe(false)
  })

  it('returns false for point outside bounds', () => {
    const tree = new QuadTreeMap2<string>({ x: 0, y: 0, width: 100, height: 100 })
    expect(tree.contains(200, 200)).toBe(false)
  })
})

// ─── size ───

describe('QuadTreeMap2 size', () => {
  it('returns 0 for empty tree', () => {
    const tree = new QuadTreeMap2<string>({ x: 0, y: 0, width: 100, height: 100 })
    expect(tree.size()).toBe(0)
  })

  it('tracks size after insertions and deletions', () => {
    const tree = new QuadTreeMap2<string>({ x: 0, y: 0, width: 100, height: 100 })
    tree.insert(10, 10, 'a')
    expect(tree.size()).toBe(1)
    tree.insert(20, 20, 'b')
    expect(tree.size()).toBe(2)
    tree.remove(10, 10)
    expect(tree.size()).toBe(1)
  })
})

// ─── clear ───

describe('QuadTreeMap2 clear', () => {
  it('clears all points', () => {
    const tree = new QuadTreeMap2<string>({ x: 0, y: 0, width: 100, height: 100 })
    tree.insert(10, 10, 'a')
    tree.insert(20, 20, 'b')
    tree.clear()
    expect(tree.size()).toBe(0)
    expect(tree.contains(10, 10)).toBe(false)
  })

  it('allows insertions after clear', () => {
    const tree = new QuadTreeMap2<string>({ x: 0, y: 0, width: 100, height: 100 })
    tree.insert(10, 10, 'a')
    tree.clear()
    tree.insert(30, 30, 'b')
    expect(tree.size()).toBe(1)
    expect(tree.contains(30, 30)).toBe(true)
  })
})
