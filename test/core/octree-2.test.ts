import { describe, it, expect } from 'vitest'
import { Octree2 } from '../../src/core/octree-2/index.js'

// ─── Constructor ───

describe('Octree2: constructor', () => {
  it('creates an empty octree with given bounds', () => {
    const tree = new Octree2<string>({ x: 0, y: 0, z: 0, size: 100 })
    expect(tree.size()).toBe(0)
  })

  it('accepts custom maxPointsPerNode and maxDepth', () => {
    const tree = new Octree2<number>(
      { x: 0, y: 0, z: 0, size: 100 },
      4,
      4
    )
    expect(tree.size()).toBe(0)
  })
})

// ─── insert ───

describe('Octree2: insert', () => {
  it('inserts a point within bounds', () => {
    const tree = new Octree2<string>({ x: 0, y: 0, z: 0, size: 100 })
    expect(tree.insert(10, 20, 30, 'a')).toBe(true)
    expect(tree.size()).toBe(1)
  })

  it('rejects a point outside bounds', () => {
    const tree = new Octree2<string>({ x: 0, y: 0, z: 0, size: 100 })
    expect(tree.insert(200, 0, 0, 'out')).toBe(false)
    expect(tree.size()).toBe(0)
  })

  it('rejects a point at the far edge (exclusive upper bound)', () => {
    const tree = new Octree2<string>({ x: 0, y: 0, z: 0, size: 100 })
    expect(tree.insert(100, 50, 50, 'edge')).toBe(false)
    expect(tree.insert(50, 100, 50, 'edge')).toBe(false)
    expect(tree.insert(50, 50, 100, 'edge')).toBe(false)
  })

  it('inserts multiple points', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 })
    tree.insert(1, 1, 1, 1)
    tree.insert(2, 2, 2, 2)
    tree.insert(3, 3, 3, 3)
    expect(tree.size()).toBe(3)
  })

  it('handles negative coordinates in bounds', () => {
    const tree = new Octree2<number>({ x: -50, y: -50, z: -50, size: 100 })
    expect(tree.insert(-10, -10, -10, 42)).toBe(true)
    expect(tree.size()).toBe(1)
  })

  it('forces subdivision when maxPointsPerNode is exceeded', () => {
    const tree = new Octree2<number>(
      { x: 0, y: 0, z: 0, size: 100 },
      2,
      8
    )
    tree.insert(1, 1, 1, 1)
    tree.insert(2, 2, 2, 2)
    tree.insert(3, 3, 3, 3)
    tree.insert(4, 4, 4, 4)
    expect(tree.size()).toBe(4)
  })
})

// ─── queryRange ───

describe('Octree2: queryRange', () => {
  it('returns empty for empty tree', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 })
    expect(tree.queryRange({ x: 0, y: 0, z: 0, size: 100 })).toEqual([])
  })

  it('finds points within range', () => {
    const tree = new Octree2<string>({ x: 0, y: 0, z: 0, size: 100 })
    tree.insert(5, 5, 5, 'a')
    tree.insert(50, 50, 50, 'b')
    tree.insert(90, 90, 90, 'c')
    const results = tree.queryRange({ x: 0, y: 0, z: 0, size: 10 })
    expect(results).toHaveLength(1)
    expect(results[0]!.value).toBe('a')
  })

  it('returns all points when range covers entire bounds', () => {
    const tree = new Octree2<string>({ x: 0, y: 0, z: 0, size: 100 })
    tree.insert(10, 10, 10, 'a')
    tree.insert(20, 20, 20, 'b')
    tree.insert(30, 30, 30, 'c')
    expect(tree.queryRange({ x: 0, y: 0, z: 0, size: 100 })).toHaveLength(3)
  })

  it('returns empty when range does not overlap', () => {
    const tree = new Octree2<string>({ x: 0, y: 0, z: 0, size: 100 })
    tree.insert(5, 5, 5, 'a')
    expect(tree.queryRange({ x: 50, y: 50, z: 50, size: 10 })).toEqual([])
  })
})

// ─── contains ───

describe('Octree2: contains', () => {
  it('returns false for empty tree', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 })
    expect(tree.contains(1, 1, 1)).toBe(false)
  })

  it('returns true for existing point', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 })
    tree.insert(10, 20, 30, 1)
    expect(tree.contains(10, 20, 30)).toBe(true)
  })

  it('returns false for non-existing point', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 })
    tree.insert(10, 20, 30, 1)
    expect(tree.contains(99, 99, 99)).toBe(false)
  })
})

// ─── remove ───

describe('Octree2: remove', () => {
  it('removes an existing point', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 })
    tree.insert(10, 20, 30, 1)
    expect(tree.remove(10, 20, 30)).toBe(true)
    expect(tree.size()).toBe(0)
    expect(tree.contains(10, 20, 30)).toBe(false)
  })

  it('returns false for non-existing point', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 })
    expect(tree.remove(1, 2, 3)).toBe(false)
  })

  it('returns false for empty tree', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 })
    expect(tree.remove(0, 0, 0)).toBe(false)
  })

  it('removes only the specified point among many', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 })
    tree.insert(1, 1, 1, 1)
    tree.insert(2, 2, 2, 2)
    tree.insert(3, 3, 3, 3)
    expect(tree.remove(2, 2, 2)).toBe(true)
    expect(tree.size()).toBe(2)
    expect(tree.contains(1, 1, 1)).toBe(true)
    expect(tree.contains(3, 3, 3)).toBe(true)
    expect(tree.contains(2, 2, 2)).toBe(false)
  })
})

// ─── clear ───

describe('Octree2: clear', () => {
  it('removes all points', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 })
    tree.insert(1, 1, 1, 1)
    tree.insert(2, 2, 2, 2)
    tree.clear()
    expect(tree.size()).toBe(0)
    expect(tree.contains(1, 1, 1)).toBe(false)
  })

  it('allows reuse after clear', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 })
    tree.insert(1, 1, 1, 1)
    tree.clear()
    tree.insert(5, 5, 5, 42)
    expect(tree.size()).toBe(1)
    expect(tree.contains(5, 5, 5)).toBe(true)
  })
})

// ─── Edge cases ───

describe('Octree2: edge cases', () => {
  it('handles insertion at origin (0, 0, 0)', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 })
    expect(tree.insert(0, 0, 0, 0)).toBe(true)
    expect(tree.size()).toBe(1)
  })

  it('handles single element lifecycle', () => {
    const tree = new Octree2<string>({ x: 0, y: 0, z: 0, size: 100 })
    tree.insert(1, 2, 3, 'only')
    expect(tree.contains(1, 2, 3)).toBe(true)
    expect(tree.size()).toBe(1)
    const results = tree.queryRange({ x: 0, y: 0, z: 0, size: 100 })
    expect(results).toHaveLength(1)
    expect(results[0]!.value).toBe('only')
    expect(tree.remove(1, 2, 3)).toBe(true)
    expect(tree.size()).toBe(0)
  })
})
