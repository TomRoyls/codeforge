import { describe, it, expect } from 'vitest'
import { PrioritySearchTree } from '../../src/utils/priority-search-tree.js'

describe('PrioritySearchTree', () => {
  it('inserts and queries single point', () => {
    const tree = new PrioritySearchTree()
    tree.insert(5, 10, 'point1')
    const results = tree.query(0, 10, 15)
    expect(results.length).toBe(1)
    expect(results[0]!.data).toBe('point1')
  })

  it('returns empty for non-matching query', () => {
    const tree = new PrioritySearchTree()
    tree.insert(5, 10, 'point1')
    const results = tree.query(10, 20, 5)
    expect(results.length).toBe(0)
  })

  it('filters by xMin', () => {
    const tree = new PrioritySearchTree()
    tree.insert(2, 5, 'a')
    tree.insert(8, 5, 'b')
    const results = tree.query(5, 10, 10)
    expect(results.every(r => r.x >= 5)).toBe(true)
  })

  it('filters by xMax', () => {
    const tree = new PrioritySearchTree()
    tree.insert(2, 5, 'a')
    tree.insert(8, 5, 'b')
    const results = tree.query(0, 5, 10)
    expect(results.every(r => r.x <= 5)).toBe(true)
  })

  it('filters by yMax', () => {
    const tree = new PrioritySearchTree()
    tree.insert(5, 3, 'low')
    tree.insert(5, 8, 'high')
    const results = tree.query(0, 10, 5)
    expect(results.every(r => r.y <= 5)).toBe(true)
  })

  it('handles multiple inserts', () => {
    const tree = new PrioritySearchTree()
    tree.insert(1, 1, 'a')
    tree.insert(2, 2, 'b')
    tree.insert(3, 3, 'c')
    tree.insert(4, 4, 'd')
    tree.insert(5, 5, 'e')
    const results = tree.query(0, 10, 10)
    expect(results.length).toBe(5)
  })

  it('returns empty for empty tree', () => {
    const tree = new PrioritySearchTree()
    const results = tree.query(0, 10, 10)
    expect(results.length).toBe(0)
  })

  it('handles exact boundary matches', () => {
    const tree = new PrioritySearchTree()
    tree.insert(5, 10, 'boundary')
    const results = tree.query(5, 5, 10)
    expect(results.length).toBe(1)
    expect(results[0]!.data).toBe('boundary')
  })

  it('preserves x, y, data in results', () => {
    const tree = new PrioritySearchTree()
    tree.insert(3, 7, 'test-data')
    const results = tree.query(0, 10, 10)
    expect(results[0]).toEqual({ x: 3, y: 7, data: 'test-data' })
  })

  it('handles duplicate x values', () => {
    const tree = new PrioritySearchTree()
    tree.insert(5, 1, 'a')
    tree.insert(5, 2, 'b')
    const results = tree.query(0, 10, 10)
    expect(results.length).toBe(2)
  })

  it('handles negative coordinates', () => {
    const tree = new PrioritySearchTree()
    tree.insert(-5, -3, 'neg')
    tree.insert(0, 0, 'origin')
    const results = tree.query(-10, 0, 0)
    expect(results.length).toBe(2)
  })

  it('handles large dataset efficiently', () => {
    const tree = new PrioritySearchTree()
    for (let i = 0; i < 1000; i++) {
      tree.insert(i, i, `point-${i}`)
    }
    const results = tree.query(400, 600, 600)
    expect(results.length).toBe(201)
    for (const r of results) {
      expect(r.x).toBeGreaterThanOrEqual(400)
      expect(r.x).toBeLessThanOrEqual(600)
      expect(r.y).toBeLessThanOrEqual(600)
    }
  })

  it('handles duplicate y values', () => {
    const tree = new PrioritySearchTree()
    tree.insert(1, 5, 'a')
    tree.insert(2, 5, 'b')
    tree.insert(3, 5, 'c')
    const results = tree.query(0, 10, 5)
    expect(results.length).toBe(3)
  })

  it('handles identical x and y', () => {
    const tree = new PrioritySearchTree()
    tree.insert(5, 5, 'first')
    tree.insert(5, 5, 'second')
    const results = tree.query(0, 10, 10)
    expect(results.length).toBe(2)
  })

  it('query with narrow x range returns subset', () => {
    const tree = new PrioritySearchTree()
    for (let i = 0; i < 10; i++) {
      tree.insert(i * 10, 5, `p${i}`)
    }
    const results = tree.query(20, 40, 10)
    expect(results.length).toBe(3)
    expect(results.map((r) => r.data).sort()).toEqual(['p2', 'p3', 'p4'])
  })

  it('query outside all points returns empty', () => {
    const tree = new PrioritySearchTree()
    tree.insert(50, 50, 'a')
    expect(tree.query(0, 10, 100)).toEqual([])
  })

  it('handles many insertions', () => {
    const tree = new PrioritySearchTree()
    for (let i = 0; i < 100; i++) {
      tree.insert(i, i, `p${i}`)
    }
    const results = tree.query(0, 50, 50)
    expect(results.length).toBe(51)
  })

  it('query returns empty for no matching points', () => {
    const tree = new PrioritySearchTree<number>()
    tree.insert({ x: 10, y: 10, priority: 1, data: 42 })
    const results = tree.query(100, 200, 50)
    expect(results.length).toBe(0)
  })

  it('query finds inserted point', () => {
    const tree = new PrioritySearchTree<string>()
    tree.insert(5, 5, 'test')
    const results = tree.query(0, 10, 10)
    expect(results.length).toBeGreaterThanOrEqual(1)
  })
})
