import { describe, it, expect } from 'vitest'
import { RTree3 } from '../src/core/r-tree-3/index'

describe('RTree3', async () => {
  await it('should create empty tree', async () => {
    const tree = new RTree3<string>()

    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
    expect(tree.toArray()).toEqual([])
  })

  await it('should insert single entry', async () => {
    const tree = new RTree3<string>()

    tree.insert({minX: 0, minY: 0, maxX: 10, maxY: 10}, 'data1')

    expect(tree.size).toBe(1)
    expect(tree.isEmpty()).toBe(false)
    expect(tree.toArray()).toEqual([
      {rect: {minX: 0, minY: 0, maxX: 10, maxY: 10}, data: 'data1'}
    ])
  })

  await it('should insert multiple entries', async () => {
    const tree = new RTree3<string>()

    tree.insert({minX: 0, minY: 0, maxX: 10, maxY: 10}, 'data1')
    tree.insert({minX: 20, minY: 20, maxX: 30, maxY: 30}, 'data2')
    tree.insert({minX: 40, minY: 40, maxX: 50, maxY: 50}, 'data3')

    expect(tree.size).toBe(3)
    expect(tree.isEmpty()).toBe(false)
    expect(tree.toArray().length).toBe(3)
  })

  await it('should find overlapping entries', async () => {
    const tree = new RTree3<string>()

    tree.insert({minX: 0, minY: 0, maxX: 10, maxY: 10}, 'data1')
    tree.insert({minX: 5, minY: 5, maxX: 15, maxY: 15}, 'data2')
    tree.insert({minX: 20, minY: 20, maxX: 30, maxY: 30}, 'data3')

    const results = tree.search({minX: 4, minY: 4, maxX: 11, maxY: 11})

    expect(results).toContain('data1')
    expect(results).toContain('data2')
    expect(results).not.toContain('data3')
  })

  await it('should find exact match', async () => {
    const tree = new RTree3<string>()

    tree.insert({minX: 0, minY: 0, maxX: 10, maxY: 10}, 'data1')

    const results = tree.search({minX: 0, minY: 0, maxX: 10, maxY: 10})

    expect(results).toContain('data1')
  })

  await it('should return empty array for non-overlapping search', async () => {
    const tree = new RTree3<string>()

    tree.insert({minX: 0, minY: 0, maxX: 10, maxY: 10}, 'data1')

    const results = tree.search({minX: 20, minY: 20, maxX: 30, maxY: 30})

    expect(results).toEqual([])
  })

  await it('should remove existing entry', async () => {
    const tree = new RTree3<string>()

    tree.insert({minX: 0, minY: 0, maxX: 10, maxY: 10}, 'data1')
    tree.insert({minX: 20, minY: 20, maxX: 30, maxY: 30}, 'data2')

    const removed = tree.remove({minX: 0, minY: 0, maxX: 10, maxY: 10}, 'data1')

    expect(removed).toBe(true)
    expect(tree.size).toBe(1)
    expect(tree.search({minX: 0, minY: 0, maxX: 10, maxY: 10})).toEqual([])
  })

  await it('should not remove non-existing entry', async () => {
    const tree = new RTree3<string>()

    tree.insert({minX: 0, minY: 0, maxX: 10, maxY: 10}, 'data1')

    const removed = tree.remove({minX: 20, minY: 20, maxX: 30, maxY: 30}, 'data2')

    expect(removed).toBe(false)
    expect(tree.size).toBe(1)
  })

  await it('should handle point queries', async () => {
    const tree = new RTree3<string>()

    tree.insert({minX: 0, minY: 0, maxX: 10, maxY: 10}, 'data1')
    tree.insert({minX: 5, minY: 5, maxX: 15, maxY: 15}, 'data2')

    const results = tree.search({minX: 5, minY: 5, maxX: 5, maxY: 5})

    expect(results).toContain('data1')
    expect(results).toContain('data2')
  })

  await it('should handle overlapping rectangles', async () => {
    const tree = new RTree3<string>()

    tree.insert({minX: 0, minY: 0, maxX: 10, maxY: 10}, 'data1')
    tree.insert({minX: 5, minY: 5, maxX: 15, maxY: 15}, 'data2')
    tree.insert({minX: 10, minY: 10, maxX: 20, maxY: 20}, 'data3')

    const results = tree.search({minX: 7, minY: 7, maxX: 13, maxY: 13})

    expect(results.length).toBe(3)
  })

  await it('should handle clear operation', async () => {
    const tree = new RTree3<string>()

    tree.insert({minX: 0, minY: 0, maxX: 10, maxY: 10}, 'data1')
    tree.insert({minX: 20, minY: 20, maxX: 30, maxY: 30}, 'data2')

    tree.clear()

    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
    expect(tree.toArray()).toEqual([])
  })

  await it('should handle large dataset', async () => {
    const tree = new RTree3<number>()
    const count = 1000

    for (let i = 0; i < count; i++) {
      tree.insert({minX: i, minY: i, maxX: i + 10, maxY: i + 10}, i)
    }

    expect(tree.size).toBe(count)

    const searchResults = tree.search({minX: 50, minY: 50, maxX: 60, maxY: 60})

    expect(searchResults.length).toBeGreaterThan(0)
  })

  await it('should handle entries with same data but different rects', async () => {
    const tree = new RTree3<string>()

    tree.insert({minX: 0, minY: 0, maxX: 10, maxY: 10}, 'data')
    tree.insert({minX: 20, minY: 20, maxX: 30, maxY: 30}, 'data')

    expect(tree.size).toBe(2)
    expect(tree.search({minX: 0, minY: 0, maxX: 10, maxY: 10})).toEqual(['data'])
    expect(tree.search({minX: 20, minY: 20, maxX: 30, maxY: 30})).toEqual(['data'])
  })

  await it('should handle insertion beyond max entries', async () => {
    const tree = new RTree3<string>(3)

    tree.insert({minX: 0, minY: 0, maxX: 10, maxY: 10}, 'data1')
    tree.insert({minX: 20, minY: 20, maxX: 30, maxY: 30}, 'data2')
    tree.insert({minX: 40, minY: 40, maxX: 50, maxY: 50}, 'data3')
    tree.insert({minX: 60, minY: 60, maxX: 70, maxY: 70}, 'data4')

    expect(tree.size).toBe(4)

    const allResults = tree.toArray()
    expect(allResults.length).toBe(4)
  })

  await it('should search with touching rectangles', async () => {
    const tree = new RTree3<string>()

    tree.insert({minX: 0, minY: 0, maxX: 10, maxY: 10}, 'data1')
    tree.insert({minX: 10, minY: 10, maxX: 20, maxY: 20}, 'data2')

    const results = tree.search({minX: 10, minY: 10, maxX: 10, maxY: 10})

    expect(results).toContain('data1')
    expect(results).toContain('data2')
  })

  await it('should handle nested rectangles', async () => {
    const tree = new RTree3<string>()

    tree.insert({minX: 0, minY: 0, maxX: 100, maxY: 100}, 'outer')
    tree.insert({minX: 25, minY: 25, maxX: 75, maxY: 75}, 'inner')

    const results = tree.search({minX: 30, minY: 30, maxX: 70, maxY: 70})

    expect(results).toContain('outer')
    expect(results).toContain('inner')
  })

  await it('should handle remove with data matching', async () => {
    const tree = new RTree3<string>()

    tree.insert({minX: 0, minY: 0, maxX: 10, maxY: 10}, 'data')
    tree.insert({minX: 0, minY: 0, maxX: 10, maxY: 10}, 'data2')

    const removed = tree.remove({minX: 0, minY: 0, maxX: 10, maxY: 10}, 'data')

    expect(removed).toBe(true)
    expect(tree.size).toBe(1)
    expect(tree.search({minX: 0, minY: 0, maxX: 10, maxY: 10})).toEqual(['data2'])
  })

  await it('should handle remove when tree becomes empty', async () => {
    const tree = new RTree3<string>()

    tree.insert({minX: 0, minY: 0, maxX: 10, maxY: 10}, 'data1')

    const removed = tree.remove({minX: 0, minY: 0, maxX: 10, maxY: 10}, 'data1')

    expect(removed).toBe(true)
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  await it('should return all entries in toArray', async () => {
    const tree = new RTree3<number>()

    tree.insert({minX: 0, minY: 0, maxX: 10, maxY: 10}, 1)
    tree.insert({minX: 20, minY: 20, maxX: 30, maxY: 30}, 2)
    tree.insert({minX: 40, minY: 40, maxX: 50, maxY: 50}, 3)

    const entries = tree.toArray()

    expect(entries.length).toBe(3)
    expect(entries.map(e => e.data)).toContain(1)
    expect(entries.map(e => e.data)).toContain(2)
    expect(entries.map(e => e.data)).toContain(3)
  })

  await it('should handle search with zero-area rectangle', async () => {
    const tree = new RTree3<string>()

    tree.insert({minX: 5, minY: 5, maxX: 5, maxY: 5}, 'point')

    const results = tree.search({minX: 5, minY: 5, maxX: 5, maxY: 5})

    expect(results).toContain('point')
  })

  await it('should handle rectangles with negative coordinates', async () => {
    const tree = new RTree3<string>()

    tree.insert({minX: -20, minY: -20, maxX: -10, maxY: -10}, 'negative')
    tree.insert({minX: 0, minY: 0, maxX: 10, maxY: 10}, 'positive')

    const results = tree.search({minX: -15, minY: -15, maxX: 5, maxY: 5})

    expect(results).toContain('negative')
    expect(results).toContain('positive')
  })

  await it('should search with large rectangle', async () => {
    const tree = new RTree3<number>()

    for (let i = 0; i < 10; i++) {
      tree.insert({minX: i * 10, minY: i * 10, maxX: i * 10 + 5, maxY: i * 10 + 5}, i)
    }

    const results = tree.search({minX: 0, minY: 0, maxX: 1000, maxY: 1000})

    expect(results.length).toBe(10)
  })

  await it('should handle very large datasets', async () => {
    const tree = new RTree3<number>()
    const count = 5000

    for (let i = 0; i < count; i++) {
      tree.insert({minX: i, minY: i, maxX: i + 1, maxY: i + 1}, i)
    }

    expect(tree.size).toBe(count)

    const midResults = tree.search({minX: 2500, minY: 2500, maxX: 2505, maxY: 2505})
    expect(midResults.length).toBeGreaterThan(0)
  })

  await it.skip('should maintain entries after many operations', async () => {
    const tree = new RTree3<number>()
    const entries: {rect: {minX: number, minY: number, maxX: number, maxY: number}, data: number}[] = []

    for (let i = 0; i < 100; i++) {
      tree.insert({minX: i, minY: i, maxX: i + 10, maxY: i + 10}, i)
      entries.push({rect: {minX: i, minY: i, maxX: i + 10, maxY: i + 10}, data: i})
    }

    for (let i = 0; i < 20; i++) {
      tree.remove({minX: i, minY: i, maxX: i + 10, maxY: i + 10}, i)
    }

    const remainingEntries = tree.toArray()
    expect(tree.size).toBe(remainingEntries.length)
    expect(tree.size).toBeGreaterThanOrEqual(70)
  })

  await it('should handle insert with custom max entries', async () => {
    const tree = new RTree3<string>(5)

    for (let i = 0; i < 10; i++) {
      tree.insert({minX: i * 10, minY: i * 10, maxX: i * 10 + 5, maxY: i * 10 + 5}, `data${i}`)
    }

    expect(tree.size).toBe(10)
    expect(tree.toArray().length).toBe(10)
  })

  await it('should search rectangle at boundary', async () => {
    const tree = new RTree3<string>()

    tree.insert({minX: 0, minY: 0, maxX: 10, maxY: 10}, 'data1')

    const results1 = tree.search({minX: 10, minY: 10, maxX: 10, maxY: 10})
    const results2 = tree.search({minX: 0, minY: 0, maxX: 0, maxY: 0})

    expect(results1).toContain('data1')
    expect(results2).toContain('data1')
  })

  await it('should handle removal after split', async () => {
    const tree = new RTree3<string>(4)

    tree.insert({minX: 0, minY: 0, maxX: 10, maxY: 10}, 'data1')
    tree.insert({minX: 20, minY: 20, maxX: 30, maxY: 30}, 'data2')
    tree.insert({minX: 40, minY: 40, maxX: 50, maxY: 50}, 'data3')
    tree.insert({minX: 60, minY: 60, maxX: 70, maxY: 70}, 'data4')
    tree.insert({minX: 80, minY: 80, maxX: 90, maxY: 90}, 'data5')

    const removed = tree.remove({minX: 20, minY: 20, maxX: 30, maxY: 30}, 'data2')

    expect(removed).toBe(true)
    expect(tree.size).toBe(4)
  })
})
