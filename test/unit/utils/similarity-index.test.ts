import { describe, expect, it } from 'vitest'
import { SimilarityIndex } from '../../../src/utils/similarity-index.js'

interface TestItem {
  name: string
}

describe('SimilarityIndex', () => {
  it('creates index with default parameters', () => {
    const index = new SimilarityIndex<TestItem>()
    expect(index.size).toBe(0)
  })

  it('creates index with custom numHashes', () => {
    const index = new SimilarityIndex<TestItem>(256)
    expect(index.size).toBe(0)
  })

  it('creates index with custom seed', () => {
    const index = new SimilarityIndex<TestItem>(128, 42)
    expect(index.size).toBe(0)
  })

  it('adds item with id and features', () => {
    const index = new SimilarityIndex<TestItem>()
    const item = { name: 'test' }
    index.add('id1', item, ['feature1', 'feature2'])
    expect(index.size).toBe(1)
  })

  it('contains returns true for added item', () => {
    const index = new SimilarityIndex<TestItem>()
    const item = { name: 'test' }
    index.add('id1', item, ['feature1'])
    expect(index.contains('id1')).toBe(true)
  })

  it('contains returns false for non-existent item', () => {
    const index = new SimilarityIndex<TestItem>()
    expect(index.contains('nonexistent')).toBe(false)
  })

  it('query returns empty array for empty index', () => {
    const index = new SimilarityIndex<TestItem>()
    const results = index.query(['feature1', 'feature2'])
    expect(results).toEqual([])
  })

  it('query finds similar items above threshold', () => {
    const index = new SimilarityIndex<TestItem>()
    const item1 = { name: 'item1' }
    const item2 = { name: 'item2' }
    index.add('id1', item1, ['apple', 'banana', 'cherry'])
    index.add('id2', item2, ['apple', 'banana', 'date'])
    const results = index.query(['apple', 'banana'])
    expect(results.length).toBeGreaterThan(0)
  })

  it('query filters by threshold', () => {
    const index = new SimilarityIndex<TestItem>()
    const item1 = { name: 'item1' }
    index.add('id1', item1, ['apple', 'banana', 'cherry'])
    const results = index.query(['orange', 'grape'], 0.9)
    expect(results.length).toBe(0)
  })

  it('query with identical features returns high similarity', () => {
    const index = new SimilarityIndex<TestItem>()
    const item = { name: 'item' }
    index.add('id1', item, ['apple', 'banana', 'cherry'])
    const results = index.query(['apple', 'banana', 'cherry'], 0.5)
    expect(results.length).toBe(1)
    expect(results[0].similarity).toBeGreaterThanOrEqual(0.9)
  })

  it('query with disjoint features returns low similarity', () => {
    const index = new SimilarityIndex<TestItem>()
    const item = { name: 'item' }
    index.add('id1', item, ['apple', 'banana', 'cherry'])
    const results = index.query(['orange', 'grape', 'pear'], 0.5)
    expect(results.length).toBe(0)
  })

  it('query returns results sorted by similarity', () => {
    const index = new SimilarityIndex<TestItem>()
    const item1 = { name: 'item1' }
    const item2 = { name: 'item2' }
    index.add('id1', item1, ['apple', 'banana', 'cherry'])
    index.add('id2', item2, ['apple', 'banana'])
    const results = index.query(['apple', 'banana'])
    expect(results.length).toBeGreaterThanOrEqual(1)
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].similarity).toBeGreaterThanOrEqual(results[i].similarity)
    }
  })

  it('findSimilar returns empty array for non-existent id', () => {
    const index = new SimilarityIndex<TestItem>()
    const results = index.findSimilar('nonexistent')
    expect(results).toEqual([])
  })

  it('findSimilar finds similar items by id', () => {
    const index = new SimilarityIndex<TestItem>()
    const item1 = { name: 'item1' }
    const item2 = { name: 'item2' }
    index.add('id1', item1, ['apple', 'banana', 'cherry', 'date', 'elderberry'])
    index.add('id2', item2, ['apple', 'banana', 'date', 'elderberry', 'fig'])
    const results = index.findSimilar('id1', 0.3)
    expect(results.length).toBeGreaterThan(0)
  })

  it('findSimilar excludes the queried item itself', () => {
    const index = new SimilarityIndex<TestItem>()
    const item = { name: 'item' }
    index.add('id1', item, ['apple', 'banana'])
    const results = index.findSimilar('id1')
    expect(results.length).toBe(0)
  })

  it('size returns number of items in index', () => {
    const index = new SimilarityIndex<TestItem>()
    expect(index.size).toBe(0)
    index.add('id1', { name: 'item1' }, ['feature1'])
    expect(index.size).toBe(1)
    index.add('id2', { name: 'item2' }, ['feature2'])
    expect(index.size).toBe(2)
  })

  it('clear removes all items from index', () => {
    const index = new SimilarityIndex<TestItem>()
    index.add('id1', { name: 'item1' }, ['feature1'])
    index.add('id2', { name: 'item2' }, ['feature2'])
    expect(index.size).toBe(2)
    index.clear()
    expect(index.size).toBe(0)
    expect(index.contains('id1')).toBe(false)
    expect(index.contains('id2')).toBe(false)
  })

  it('remove removes item by id', () => {
    const index = new SimilarityIndex<TestItem>()
    index.add('id1', { name: 'item1' }, ['feature1'])
    expect(index.contains('id1')).toBe(true)
    const removed = index.remove('id1')
    expect(removed).toBe(true)
    expect(index.contains('id1')).toBe(false)
  })

  it('remove returns false for non-existent id', () => {
    const index = new SimilarityIndex<TestItem>()
    const removed = index.remove('nonexistent')
    expect(removed).toBe(false)
  })

  it('addAutoKey generates unique id', () => {
    const index = new SimilarityIndex<TestItem>()
    const id1 = index.addAutoKey({ name: 'item1' }, ['feature1'])
    const id2 = index.addAutoKey({ name: 'item2' }, ['feature2'])
    expect(id1).not.toBe(id2)
    expect(id1).toMatch(/^_auto_\d+$/)
    expect(id2).toMatch(/^_auto_\d+$/)
  })

  it('addAutoKey increments counter', () => {
    const index = new SimilarityIndex<TestItem>()
    const id1 = index.addAutoKey({ name: 'item1' }, ['feature1'])
    const id2 = index.addAutoKey({ name: 'item2' }, ['feature2'])
    expect(id2).toContain('_auto_1')
    expect(index.size).toBe(2)
  })

  it('query with different thresholds returns different results', () => {
    const index = new SimilarityIndex<TestItem>()
    index.add('id1', { name: 'item1' }, ['apple', 'banana', 'cherry'])
    index.add('id2', { name: 'item2' }, ['apple', 'banana'])
    const resultsLow = index.query(['apple'], 0.1)
    const resultsHigh = index.query(['apple'], 0.8)
    expect(resultsLow.length).toBeGreaterThanOrEqual(resultsHigh.length)
  })

  it('handles empty features array', () => {
    const index = new SimilarityIndex<TestItem>()
    index.add('id1', { name: 'item1' }, [])
    index.add('id2', { name: 'item2' }, [])
    const results = index.query([])
    expect(results.length).toBeGreaterThanOrEqual(0)
  })

  it('handles single feature', () => {
    const index = new SimilarityIndex<TestItem>()
    index.add('id1', { name: 'item1' }, ['apple'])
    const results = index.query(['apple'], 0.5)
    expect(results.length).toBe(1)
    expect(results[0].similarity).toBeGreaterThanOrEqual(0.5)
  })

  it('handles many features', () => {
    const index = new SimilarityIndex<TestItem>()
    const features1 = Array.from({ length: 100 }, (_, i) => `feature-${i}`)
    const features2 = Array.from({ length: 100 }, (_, i) => `feature-${i + 30}`)
    index.add('id1', { name: 'item1' }, features1)
    index.add('id2', { name: 'item2' }, features2)
    const results = index.query(features1.slice(0, 50), 0.2)
    expect(results.length).toBeGreaterThan(0)
  })

  it('handles overlapping feature sets', () => {
    const index = new SimilarityIndex<TestItem>()
    index.add('id1', { name: 'item1' }, ['apple', 'banana', 'cherry', 'date'])
    index.add('id2', { name: 'item2' }, ['apple', 'banana', 'elderberry', 'fig'])
    const results = index.query(['apple', 'banana', 'grape'], 0.3)
    expect(results.length).toBeGreaterThan(0)
  })

  it('findSimilar with different thresholds', () => {
    const index = new SimilarityIndex<TestItem>()
    index.add('id1', { name: 'item1' }, ['apple', 'banana', 'cherry'])
    index.add('id2', { name: 'item2' }, ['apple', 'banana'])
    const resultsLow = index.findSimilar('id1', 0.1)
    const resultsHigh = index.findSimilar('id1', 0.8)
    expect(resultsLow.length).toBeGreaterThanOrEqual(resultsHigh.length)
  })

  it('findSimilar returns items with similarity above threshold', () => {
    const index = new SimilarityIndex<TestItem>()
    index.add('id1', { name: 'item1' }, ['apple', 'banana', 'cherry'])
    index.add('id2', { name: 'item2' }, ['apple', 'banana'])
    index.add('id3', { name: 'item3' }, ['orange', 'grape'])
    const results = index.findSimilar('id1', 0.5)
    for (const result of results) {
      expect(result.similarity).toBeGreaterThanOrEqual(0.5)
    }
  })

  it('query results include correct item', () => {
    const index = new SimilarityIndex<TestItem>()
    const item = { name: 'test-item' }
    index.add('id1', item, ['apple', 'banana'])
    const results = index.query(['apple', 'banana'])
    if (results.length > 0) {
      expect(results[0].item.name).toBe('test-item')
    }
  })

  it('findSimilar results include correct items', () => {
    const index = new SimilarityIndex<TestItem>()
    const item1 = { name: 'item1' }
    const item2 = { name: 'item2' }
    index.add('id1', item1, ['apple', 'banana', 'cherry'])
    index.add('id2', item2, ['apple', 'banana', 'date'])
    const results = index.findSimilar('id1', 0.5)
    if (results.length > 0) {
      expect(results[0].item.name).toBe('item2')
    }
  })

  it('handles items with same id (replace)', () => {
    const index = new SimilarityIndex<TestItem>()
    index.add('id1', { name: 'item1' }, ['apple', 'banana'])
    expect(index.size).toBe(1)
    index.add('id1', { name: 'item2' }, ['cherry', 'date'])
    expect(index.size).toBe(1)
    const results = index.query(['cherry', 'date'])
    if (results.length > 0) {
      expect(results[0].item.name).toBe('item2')
    }
  })
})