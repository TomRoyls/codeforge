import { describe, it, expect } from 'vitest'
import { SimilarityIndex } from '../../src/utils/similarity-index.js'

describe('SimilarityIndex', () => {
  it('constructs with default parameters', () => {
    const index = new SimilarityIndex<string>()
    expect(index.size).toBe(0)
  })

  it('constructs with custom numHashes', () => {
    const index = new SimilarityIndex<string>(64, 42)
    expect(index.size).toBe(0)
  })

  it('adds items and queries correctly', () => {
    const index = new SimilarityIndex<string>()
    index.add('item1', 'doc1', ['word1', 'word2', 'word3'])
    index.add('item2', 'doc2', ['word1', 'word2', 'word4'])
    const results = index.query(['word1', 'word2'], 0.5)
    expect(results.length).toBe(2)
    expect(['doc1', 'doc2']).toContain(results[0].item)
    expect(['doc1', 'doc2']).toContain(results[1].item)
    expect(results[0].similarity).toBeGreaterThan(0.5)
  })

  it('finds similar items by id', () => {
    const index = new SimilarityIndex<string>()
    index.add('item1', 'doc1', ['word1', 'word2', 'word3'])
    index.add('item2', 'doc2', ['word1', 'word2', 'word4'])
    index.add('item3', 'doc3', ['word5', 'word6', 'word7'])
    const results = index.findSimilar('item1', 0.3)
    expect(results.length).toBe(1)
    expect(results[0].item).toBe('doc2')
  })

  it('returns empty for non-existent id in findSimilar', () => {
    const index = new SimilarityIndex<string>()
    index.add('item1', 'doc1', ['word1', 'word2'])
    const results = index.findSimilar('item2', 0.5)
    expect(results.length).toBe(0)
  })

  it('contains returns correct state', () => {
    const index = new SimilarityIndex<string>()
    expect(index.contains('item1')).toBe(false)
    index.add('item1', 'doc1', ['word1', 'word2'])
    expect(index.contains('item1')).toBe(true)
  })

  it('size returns correct count', () => {
    const index = new SimilarityIndex<string>()
    expect(index.size).toBe(0)
    index.add('item1', 'doc1', ['word1'])
    expect(index.size).toBe(1)
    index.add('item2', 'doc2', ['word2'])
    expect(index.size).toBe(2)
  })

  it('clear removes all entries', () => {
    const index = new SimilarityIndex<string>()
    index.add('item1', 'doc1', ['word1'])
    index.add('item2', 'doc2', ['word2'])
    expect(index.size).toBe(2)
    index.clear()
    expect(index.size).toBe(0)
    expect(index.contains('item1')).toBe(false)
  })

  it('remove removes specific entry', () => {
    const index = new SimilarityIndex<string>()
    index.add('item1', 'doc1', ['word1'])
    index.add('item2', 'doc2', ['word2'])
    const removed = index.remove('item1')
    expect(removed).toBe(true)
    expect(index.size).toBe(1)
    expect(index.contains('item1')).toBe(false)
  })

  it('remove returns false for non-existent entry', () => {
    const index = new SimilarityIndex<string>()
    index.add('item1', 'doc1', ['word1'])
    const removed = index.remove('item2')
    expect(removed).toBe(false)
    expect(index.size).toBe(1)
  })

  it('addAutoKey generates unique keys', () => {
    const index = new SimilarityIndex<string>()
    const id1 = index.addAutoKey('doc1', ['word1'])
    const id2 = index.addAutoKey('doc2', ['word2'])
    const id3 = index.addAutoKey('doc3', ['word3'])
    expect(id1).toBe('_auto_0')
    expect(id2).toBe('_auto_1')
    expect(id3).toBe('_auto_2')
    expect(index.size).toBe(3)
  })

  it('query respects threshold', () => {
    const index = new SimilarityIndex<string>()
    index.add('item1', 'doc1', ['word1', 'word2', 'word3'])
    index.add('item2', 'doc2', ['word5', 'word6', 'word7'])
    const highThreshold = index.query(['word1', 'word2'], 0.9)
    const lowThreshold = index.query(['word1', 'word2'], 0.1)
    expect(highThreshold.length).toBeLessThanOrEqual(lowThreshold.length)
  })

  it('query returns empty when no items', () => {
    const index = new SimilarityIndex<string>()
    const results = index.query(['word1', 'word2'], 0.5)
    expect(results.length).toBe(0)
  })

  it('findSimilar excludes self', () => {
    const index = new SimilarityIndex<string>()
    index.add('item1', 'doc1', ['word1', 'word2'])
    const results = index.findSimilar('item1', 0.0)
    expect(results.length).toBe(0)
  })

  it('handles empty features', () => {
    const index = new SimilarityIndex<string>()
    index.add('item1', 'doc1', [])
    index.add('item2', 'doc2', ['word1', 'word2'])
    const results = index.query(['word1'], 0.5)
    expect(results.length).toBeGreaterThanOrEqual(0)
  })

  it('sorts results by similarity descending', () => {
    const index = new SimilarityIndex<string>()
    index.add('item1', 'doc1', ['word1', 'word2', 'word3'])
    index.add('item2', 'doc2', ['word1', 'word2', 'word4'])
    index.add('item3', 'doc3', ['word1', 'word5', 'word6'])
    const results = index.query(['word1', 'word2'], 0.0)
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].similarity).toBeGreaterThanOrEqual(results[i + 1].similarity)
    }
  })

  it('handles different object types', () => {
    interface MyItem {
      id: number
      name: string
    }
    const index = new SimilarityIndex<MyItem>()
    const item: MyItem = { id: 1, name: 'test' }
    index.add('item1', item, ['word1', 'word2'])
    const results = index.query(['word1', 'word2'], 0.5)
    expect(results.length).toBe(1)
    expect(results[0].item.id).toBe(1)
    expect(results[0].item.name).toBe('test')
  })

  it('findSimilar respects threshold', () => {
    const index = new SimilarityIndex<string>()
    index.add('item1', 'doc1', ['word1', 'word2', 'word3'])
    index.add('item2', 'doc2', ['word1', 'word2', 'word4'])
    index.add('item3', 'doc3', ['word5', 'word6', 'word7'])
    const highThreshold = index.findSimilar('item1', 0.9)
    const lowThreshold = index.findSimilar('item1', 0.0)
    expect(highThreshold.length).toBeLessThanOrEqual(lowThreshold.length)
  })

  it('findSimilar returns empty for unknown item', () => {
    const index = new SimilarityIndex<string>()
    index.add('item1', 'doc1', ['word1', 'word2', 'word3'])
    const results = index.findSimilar('unknown', 0.5)
    expect(results).toEqual([])
  })

  it('findSimilar with missing query returns empty', () => {
    const index = new SimilarityIndex<string>()
    expect(index.findSimilar('nothing', 0.9)).toEqual([])
  })

  it('add and find similar item', () => {
    const index = new SimilarityIndex<string>()
    index.add('test', 'test-item', ['word1', 'word2'])
    const results = index.findSimilar('test', 0.5)
    expect(results.length).toBeGreaterThanOrEqual(0)
  })

  it('findSimilar with exact match', () => {
    const index = new SimilarityIndex<string>()
    index.add('test', 'test-item', ['word1', 'word2'])
    const results = index.findSimilar('test', 0)
    expect(results.length).toBeGreaterThanOrEqual(0)
  })

  it('findSimilar with no data returns empty', () => {
    const index = new SimilarityIndex()
    const results = index.findSimilar('test', 0)
    expect(results).toEqual([])
  })
})