import { describe, it, expect } from 'vitest'
import { Octree3 } from '../../src/core/octree-3/index.js'

// ─── Constructor ───

describe('Octree3: constructor', () => {
  it('creates an empty octree', () => {
    const tree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100)
    expect(tree.size).toBe(0)
  })

  it('throws on non-positive size', () => {
    expect(() => new Octree3<number>({ x: 0, y: 0, z: 0 }, 0)).toThrow('Size must be positive')
    expect(() => new Octree3<number>({ x: 0, y: 0, z: 0 }, -10)).toThrow('Size must be positive')
  })

  it('throws on non-positive maxItems', () => {
    expect(() => new Octree3<number>({ x: 0, y: 0, z: 0 }, 100, 0)).toThrow('maxItems must be positive')
    expect(() => new Octree3<number>({ x: 0, y: 0, z: 0 }, 100, -1)).toThrow('maxItems must be positive')
  })

  it('accepts custom maxItems', () => {
    const tree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100, 4)
    expect(tree.size).toBe(0)
  })
})

// ─── insert ───

describe('Octree3: insert', () => {
  it('inserts a point within bounds', () => {
    const tree = new Octree3<string>({ x: 50, y: 50, z: 50 }, 100)
    expect(tree.insert({ x: 10, y: 10, z: 10 }, 'a')).toBe(true)
    expect(tree.size).toBe(1)
  })

  it('rejects a point outside bounds', () => {
    const tree = new Octree3<string>({ x: 0, y: 0, z: 0 }, 100)
    expect(tree.insert({ x: 200, y: 0, z: 0 }, 'out')).toBe(false)
    expect(tree.size).toBe(0)
  })

  it('inserts multiple points', () => {
    const tree = new Octree3<number>({ x: 50, y: 50, z: 50 }, 100)
    tree.insert({ x: 10, y: 10, z: 10 }, 1)
    tree.insert({ x: 20, y: 20, z: 20 }, 2)
    tree.insert({ x: 80, y: 80, z: 80 }, 3)
    expect(tree.size).toBe(3)
  })

  it('handles points at boundary edges', () => {
    const tree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100)
    expect(tree.insert({ x: -50, y: -50, z: -50 }, 0)).toBe(true)
    expect(tree.insert({ x: 50, y: 50, z: 50 }, 1)).toBe(true)
    expect(tree.size).toBe(2)
  })

  it('forces subdivision when maxItems exceeded', () => {
    const tree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100, 2)
    tree.insert({ x: 1, y: 1, z: 1 }, 1)
    tree.insert({ x: -10, y: -10, z: -10 }, 2)
    tree.insert({ x: 10, y: 10, z: 10 }, 3)
    expect(tree.size).toBe(3)
  })
})

// ─── contains ───

describe('Octree3: contains', () => {
  it('returns false for empty tree', () => {
    const tree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100)
    expect(tree.contains({ x: 1, y: 1, z: 1 })).toBe(false)
  })

  it('returns true for existing point', () => {
    const tree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100)
    tree.insert({ x: 10, y: 20, z: 30 }, 1)
    expect(tree.contains({ x: 10, y: 20, z: 30 })).toBe(true)
  })

  it('returns false for non-existing point', () => {
    const tree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100)
    tree.insert({ x: 10, y: 20, z: 30 }, 1)
    expect(tree.contains({ x: 99, y: 99, z: 99 })).toBe(false)
  })
})

// ─── query ───

describe('Octree3: query', () => {
  it('returns empty for empty tree', () => {
    const tree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100)
    expect(tree.query({ x: 50, y: 50, z: 50 }, 10)).toEqual([])
  })

  it('finds points within radius', () => {
    const tree = new Octree3<string>({ x: 0, y: 0, z: 0 }, 100)
    tree.insert({ x: 5, y: 5, z: 5 }, 'near')
    tree.insert({ x: 90, y: 90, z: 90 }, 'far')
    const results = tree.query({ x: 5, y: 5, z: 5 }, 1)
    expect(results).toHaveLength(1)
    expect(results[0]!.data).toBe('near')
  })

  it('finds multiple points within radius', () => {
    const tree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100)
    tree.insert({ x: 0, y: 0, z: 0 }, 1)
    tree.insert({ x: 1, y: 1, z: 1 }, 2)
    tree.insert({ x: 50, y: 50, z: 50 }, 3)
    const results = tree.query({ x: 0, y: 0, z: 0 }, 5)
    expect(results).toHaveLength(2)
  })

  it('returns empty when no points in radius', () => {
    const tree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100)
    tree.insert({ x: 90, y: 90, z: 90 }, 1)
    expect(tree.query({ x: 0, y: 0, z: 0 }, 1)).toEqual([])
  })
})

// ─── remove ───

describe('Octree3: remove', () => {
  it('removes an existing point', () => {
    const tree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100)
    tree.insert({ x: 10, y: 20, z: 30 }, 1)
    expect(tree.remove({ x: 10, y: 20, z: 30 })).toBe(true)
    expect(tree.size).toBe(0)
    expect(tree.contains({ x: 10, y: 20, z: 30 })).toBe(false)
  })

  it('returns false for non-existing point', () => {
    const tree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100)
    expect(tree.remove({ x: 1, y: 2, z: 3 })).toBe(false)
  })

  it('removes only the specified point', () => {
    const tree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100)
    tree.insert({ x: 1, y: 1, z: 1 }, 1)
    tree.insert({ x: 2, y: 2, z: 2 }, 2)
    tree.insert({ x: 3, y: 3, z: 3 }, 3)
    expect(tree.remove({ x: 2, y: 2, z: 2 })).toBe(true)
    expect(tree.size).toBe(2)
    expect(tree.contains({ x: 1, y: 1, z: 1 })).toBe(true)
    expect(tree.contains({ x: 3, y: 3, z: 3 })).toBe(true)
  })

  it('merges nodes after removal when count drops below maxItems', () => {
    const tree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100, 2)
    tree.insert({ x: 1, y: 1, z: 1 }, 1)
    tree.insert({ x: 2, y: 2, z: 2 }, 2)
    tree.insert({ x: 80, y: 80, z: 80 }, 3)
    tree.remove({ x: 80, y: 80, z: 80 })
    expect(tree.size).toBe(2)
    expect(tree.contains({ x: 1, y: 1, z: 1 })).toBe(true)
  })
})

// ─── getBounds ───

describe('Octree3: getBounds', () => {
  it('returns the configured bounds', () => {
    const tree = new Octree3<number>({ x: 50, y: 50, z: 50 }, 100)
    const bounds = tree.getBounds()
    expect(bounds.center).toEqual({ x: 50, y: 50, z: 50 })
    expect(bounds.size).toBe(100)
  })
})

// ─── toArray ───

describe('Octree3: toArray', () => {
  it('returns empty array for empty tree', () => {
    const tree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100)
    expect(tree.toArray()).toEqual([])
  })

  it('returns all inserted items', () => {
    const tree = new Octree3<string>({ x: 0, y: 0, z: 0 }, 100)
    tree.insert({ x: 1, y: 1, z: 1 }, 'a')
    tree.insert({ x: 2, y: 2, z: 2 }, 'b')
    const items = tree.toArray()
    expect(items).toHaveLength(2)
    const dataValues = items.map((i) => i.data).sort()
    expect(dataValues).toEqual(['a', 'b'])
  })
})

// ─── clear ───

describe('Octree3: clear', () => {
  it('removes all points', () => {
    const tree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100)
    tree.insert({ x: 1, y: 1, z: 1 }, 1)
    tree.insert({ x: 2, y: 2, z: 2 }, 2)
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.toArray()).toEqual([])
  })

  it('allows reuse after clear', () => {
    const tree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100)
    tree.insert({ x: 1, y: 1, z: 1 }, 1)
    tree.clear()
    tree.insert({ x: 5, y: 5, z: 5 }, 42)
    expect(tree.size).toBe(1)
    expect(tree.contains({ x: 5, y: 5, z: 5 })).toBe(true)
  })
})
