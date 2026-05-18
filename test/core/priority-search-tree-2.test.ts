import { describe, it, expect } from 'vitest'
import { PrioritySearchTree2, type Point } from '../../src/core/priority-search-tree-2/index.js'

// ─── Constructor ───

describe('PrioritySearchTree2 constructor', () => {
  it('creates empty tree', () => {
    const tree = new PrioritySearchTree2()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty).toBe(true)
  })

  it('creates tree from initial points', () => {
    const points: Point[] = [
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ]
    const tree = new PrioritySearchTree2(points)
    expect(tree.size).toBe(2)
    expect(tree.isEmpty).toBe(false)
  })

  it('creates tree from points with explicit priorities', () => {
    const points: Point[] = [
      { x: 1, y: 2, priority: 10 },
      { x: 3, y: 4, priority: 5 },
    ]
    const tree = new PrioritySearchTree2(points)
    expect(tree.size).toBe(2)
  })
})

// ─── insert ───

describe('PrioritySearchTree2.insert', () => {
  it('inserts a single point', () => {
    const tree = new PrioritySearchTree2()
    tree.insert({ x: 1, y: 2 })
    expect(tree.size).toBe(1)
    expect(tree.isEmpty).toBe(false)
  })

  it('inserts multiple points', () => {
    const tree = new PrioritySearchTree2()
    tree.insert({ x: 5, y: 5 })
    tree.insert({ x: 3, y: 3 })
    tree.insert({ x: 7, y: 7 })
    expect(tree.size).toBe(3)
  })

  it('inserts point with explicit priority', () => {
    const tree = new PrioritySearchTree2()
    tree.insert({ x: 1, y: 2, priority: 42 })
    expect(tree.contains({ x: 1, y: 2 })).toBe(true)
  })

  it('auto-assigns priority when not provided', () => {
    const tree = new PrioritySearchTree2()
    tree.insert({ x: 1, y: 2 })
    tree.insert({ x: 3, y: 4 })
    expect(tree.size).toBe(2)
  })
})

// ─── contains ───

describe('PrioritySearchTree2.contains', () => {
  it('returns false for empty tree', () => {
    const tree = new PrioritySearchTree2()
    expect(tree.contains({ x: 1, y: 2 })).toBe(false)
  })

  it('returns true for existing point', () => {
    const tree = new PrioritySearchTree2()
    tree.insert({ x: 1, y: 2 })
    expect(tree.contains({ x: 1, y: 2 })).toBe(true)
  })

  it('returns false for non-existing point', () => {
    const tree = new PrioritySearchTree2()
    tree.insert({ x: 1, y: 2 })
    expect(tree.contains({ x: 3, y: 4 })).toBe(false)
  })

  it('matches by x and y (not priority)', () => {
    const tree = new PrioritySearchTree2()
    tree.insert({ x: 1, y: 2, priority: 10 })
    expect(tree.contains({ x: 1, y: 2 })).toBe(true)
  })
})

// ─── delete ───

describe('PrioritySearchTree2.delete', () => {
  it('returns false for empty tree', () => {
    const tree = new PrioritySearchTree2()
    expect(tree.delete({ x: 1, y: 2 })).toBe(false)
  })

  it('deletes existing point and returns true', () => {
    const tree = new PrioritySearchTree2()
    tree.insert({ x: 1, y: 2 })
    expect(tree.delete({ x: 1, y: 2 })).toBe(true)
    expect(tree.size).toBe(0)
    expect(tree.isEmpty).toBe(true)
  })

  it('returns false for non-existing point', () => {
    const tree = new PrioritySearchTree2()
    tree.insert({ x: 1, y: 2 })
    expect(tree.delete({ x: 3, y: 4 })).toBe(false)
    expect(tree.size).toBe(1)
  })

  it('deletes from multi-point tree', () => {
    const tree = new PrioritySearchTree2()
    tree.insert({ x: 5, y: 5 })
    tree.insert({ x: 3, y: 3 })
    tree.insert({ x: 7, y: 7 })
    expect(tree.delete({ x: 3, y: 3 })).toBe(true)
    expect(tree.size).toBe(2)
    expect(tree.contains({ x: 3, y: 3 })).toBe(false)
    expect(tree.contains({ x: 5, y: 5 })).toBe(true)
    expect(tree.contains({ x: 7, y: 7 })).toBe(true)
  })

  it('can delete all points', () => {
    const tree = new PrioritySearchTree2()
    tree.insert({ x: 1, y: 2 })
    tree.insert({ x: 3, y: 4 })
    tree.delete({ x: 1, y: 2 })
    tree.delete({ x: 3, y: 4 })
    expect(tree.size).toBe(0)
    expect(tree.isEmpty).toBe(true)
  })
})

// ─── queryRange ───

describe('PrioritySearchTree2.queryRange', () => {
  it('returns empty for empty tree', () => {
    const tree = new PrioritySearchTree2()
    expect(tree.queryRange(0, 10, 0, 10)).toEqual([])
  })

  it('returns matching points in range', () => {
    const tree = new PrioritySearchTree2()
    tree.insert({ x: 1, y: 1 })
    tree.insert({ x: 5, y: 5 })
    tree.insert({ x: 10, y: 10 })
    const results = tree.queryRange(0, 6, 0, 6)
    expect(results).toHaveLength(2)
    expect(results.some((p) => p.x === 1 && p.y === 1)).toBe(true)
    expect(results.some((p) => p.x === 5 && p.y === 5)).toBe(true)
  })

  it('returns empty when no points in range', () => {
    const tree = new PrioritySearchTree2()
    tree.insert({ x: 100, y: 100 })
    expect(tree.queryRange(0, 10, 0, 10)).toEqual([])
  })

  it('returns all points when range covers all', () => {
    const tree = new PrioritySearchTree2()
    tree.insert({ x: 1, y: 2 })
    tree.insert({ x: 3, y: 4 })
    tree.insert({ x: 5, y: 6 })
    expect(tree.queryRange(0, 10, 0, 10)).toHaveLength(3)
  })

  it('handles inclusive boundaries', () => {
    const tree = new PrioritySearchTree2()
    tree.insert({ x: 5, y: 5 })
    const results = tree.queryRange(5, 5, 5, 5)
    expect(results).toHaveLength(1)
  })
})

// ─── findMin ───

describe('PrioritySearchTree2.findMin', () => {
  it('returns null for empty tree', () => {
    const tree = new PrioritySearchTree2()
    expect(tree.findMin()).toBeNull()
  })

  it('returns the single point for one-element tree', () => {
    const tree = new PrioritySearchTree2()
    tree.insert({ x: 1, y: 2, priority: 5 })
    const min = tree.findMin()
    expect(min).not.toBeNull()
    expect(min!.x).toBe(1)
    expect(min!.y).toBe(2)
  })

  it('returns point with lowest priority', () => {
    const tree = new PrioritySearchTree2()
    tree.insert({ x: 1, y: 2, priority: 10 })
    tree.insert({ x: 3, y: 4, priority: 3 })
    tree.insert({ x: 5, y: 6, priority: 7 })
    const min = tree.findMin()
    expect(min).not.toBeNull()
    expect(min!.priority).toBe(3)
  })
})

// ─── size / isEmpty ───

describe('PrioritySearchTree2 size and isEmpty', () => {
  it('empty tree has size 0', () => {
    const tree = new PrioritySearchTree2()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty).toBe(true)
  })

  it('tracks size correctly', () => {
    const tree = new PrioritySearchTree2()
    tree.insert({ x: 1, y: 2 })
    expect(tree.size).toBe(1)
    tree.insert({ x: 3, y: 4 })
    expect(tree.size).toBe(2)
  })
})

// ─── clear ───

describe('PrioritySearchTree2.clear', () => {
  it('clears all points', () => {
    const tree = new PrioritySearchTree2()
    tree.insert({ x: 1, y: 2 })
    tree.insert({ x: 3, y: 4 })
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty).toBe(true)
  })

  it('clear already empty tree', () => {
    const tree = new PrioritySearchTree2()
    tree.clear()
    expect(tree.size).toBe(0)
  })
})

// ─── getTimeComplexity ───

describe('PrioritySearchTree2.getTimeComplexity', () => {
  it('returns O(1) for empty tree', () => {
    const tree = new PrioritySearchTree2()
    expect(tree.getTimeComplexity()).toBe('O(1)')
  })

  it('returns O(1) for single element tree', () => {
    const tree = new PrioritySearchTree2()
    tree.insert({ x: 1, y: 2 })
    expect(tree.getTimeComplexity()).toBe('O(1)')
  })

  it('returns O(log n) for multi-element tree', () => {
    const tree = new PrioritySearchTree2()
    tree.insert({ x: 1, y: 2 })
    tree.insert({ x: 3, y: 4 })
    expect(tree.getTimeComplexity()).toBe('O(log 2)')
  })
})
