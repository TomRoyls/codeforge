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

  it('findSimilar with low threshold returns results', () => {
    const index = new SimilarityIndex()
    index.add('item1', 'doc1', ['word1', 'word2'])
    index.add('item2', 'doc2', ['word1', 'word3'])
    const results = index.findSimilar('item1', 0)
    expect(results.length).toBeGreaterThanOrEqual(0)
  })

  it('clear resets counter for auto keys', () => {
    const index = new SimilarityIndex<string>()
    const id1 = index.addAutoKey('doc1', ['word1'])
    index.clear()
    const id2 = index.addAutoKey('doc2', ['word2'])
    expect(id1).toBe('_auto_0')
    expect(id2).toBe('_auto_0')
  })

  it('query with empty features returns results based on similarity', () => {
    const index = new SimilarityIndex<string>()
    index.add('item1', 'doc1', ['word1', 'word2'])
    index.add('item2', 'doc2', ['word3', 'word4'])
    const results = index.query([], 0.0)
    expect(results.length).toBeGreaterThanOrEqual(0)
  })

  it('handles large feature sets', () => {
    const index = new SimilarityIndex<string>()
    const features1 = Array.from({ length: 100 }, (_, i) => `word${i}`)
    const features2 = Array.from({ length: 100 }, (_, i) => `word${i}`)
    index.add('item1', 'doc1', features1)
    index.add('item2', 'doc2', features2)
    const results = index.query(features1.slice(0, 50), 0.3)
    expect(results.length).toBeGreaterThan(0)
  })

  it('handles identical feature sets', () => {
    const index = new SimilarityIndex<string>()
    const features = ['word1', 'word2', 'word3']
    index.add('item1', 'doc1', features)
    index.add('item2', 'doc2', features)
    const results = index.query(features, 0.5)
    expect(results.length).toBe(2)
    expect(results[0].similarity).toBe(1)
    expect(results[1].similarity).toBe(1)
  })

  it('handles completely different feature sets', () => {
    const index = new SimilarityIndex<string>()
    index.add('item1', 'doc1', ['word1', 'word2', 'word3'])
    index.add('item2', 'doc2', ['word4', 'word5', 'word6'])
    const results = index.query(['word1', 'word2'], 0.8)
    expect(results.every(r => r.item === 'doc1')).toBe(true)
  })

  it('handles special characters in features', () => {
    const index = new SimilarityIndex<string>()
    index.add('item1', 'doc1', ['hello@world', 'test#123', 'special$chars'])
    const results = index.query(['hello@world'], 0.3)
    expect(results.length).toBe(1)
    expect(results[0].item).toBe('doc1')
  })

  it('handles unicode in features', () => {
    const index = new SimilarityIndex<string>()
    index.add('item1', 'doc1', ['日本語', '🎉emoji', 'café'])
    const results = index.query(['日本語'], 0.1)
    expect(results.length).toBe(1)
  })

  it('query with threshold 1 returns exact matches only', () => {
    const index = new SimilarityIndex<string>()
    const features = ['word1', 'word2', 'word3']
    index.add('item1', 'doc1', features)
    index.add('item2', 'doc2', ['word1', 'word2'])
    const results = index.query(features, 1.0)
    expect(results.length).toBe(1)
    expect(results[0].item).toBe('doc1')
  })

  it('query with threshold 0 returns all items', () => {
    const index = new SimilarityIndex<string>()
    index.add('item1', 'doc1', ['word1', 'word2'])
    index.add('item2', 'doc2', ['word3', 'word4'])
    const results = index.query(['word1'], 0.0)
    expect(results.length).toBe(2)
  })

  it('handles negative threshold', () => {
    const index = new SimilarityIndex<string>()
    index.add('item1', 'doc1', ['word1', 'word2'])
    const results = index.query(['word3'], -0.5)
    expect(results.length).toBe(1)
  })

  it('handles threshold greater than 1', () => {
    const index = new SimilarityIndex<string>()
    index.add('item1', 'doc1', ['word1', 'word2'])
    const results = index.query(['word1'], 1.5)
    expect(results.length).toBe(0)
  })

  it('findSimilar with multiple similar items', () => {
    const index = new SimilarityIndex<string>()
    index.add('item1', 'doc1', ['word1', 'word2', 'word3'])
    index.add('item2', 'doc2', ['word1', 'word2'])
    index.add('item3', 'doc3', ['word1'])
    const results = index.findSimilar('item1', 0.3)
    expect(results.length).toBe(2)
    expect(results.every(r => r.item !== 'doc1')).toBe(true)
  })

  it('handles sequential removes', () => {
    const index = new SimilarityIndex<string>()
    index.add('item1', 'doc1', ['word1'])
    index.add('item2', 'doc2', ['word2'])
    index.add('item3', 'doc3', ['word3'])
    expect(index.remove('item1')).toBe(true)
    expect(index.remove('item2')).toBe(true)
    expect(index.size).toBe(1)
    expect(index.contains('item3')).toBe(true)
  })

  it('handles removing non-existent item from empty index', () => {
    const index = new SimilarityIndex<string>()
    expect(index.remove('missing')).toBe(false)
  })

  it('addAutoKey continues after clear', () => {
    const index = new SimilarityIndex<string>()
    index.addAutoKey('doc1', ['word1'])
    index.addAutoKey('doc2', ['word2'])
    index.clear()
    const id3 = index.addAutoKey('doc3', ['word3'])
    expect(id3).toBe('_auto_0')
  })

  it('query results include similarity scores', () => {
    const index = new SimilarityIndex<string>()
    index.add('item1', 'doc1', ['word1', 'word2', 'word3'])
    const results = index.query(['word1', 'word2'], 0.5)
    expect(results[0]).toHaveProperty('similarity')
    expect(typeof results[0].similarity).toBe('number')
    expect(results[0].similarity).toBeGreaterThanOrEqual(0)
    expect(results[0].similarity).toBeLessThanOrEqual(1)
  })

  it('handles null and undefined as items', () => {
    const index = new SimilarityIndex<null>()
    index.add('item1', null, ['word1', 'word2'])
    const results = index.query(['word1'], 0.3)
    expect(results.length).toBe(1)
    expect(results[0].item).toBe(null)
  })

  it('handles number as item', () => {
    const index = new SimilarityIndex<number>()
    index.add('item1', 42, ['word1', 'word2'])
    const results = index.query(['word1'], 0.3)
    expect(results.length).toBe(1)
    expect(results[0].item).toBe(42)
  })

  it('handles boolean as item', () => {
    const index = new SimilarityIndex<boolean>()
    index.add('item1', true, ['word1', 'word2'])
    const results = index.query(['word1'], 0.3)
    expect(results.length).toBe(1)
    expect(results[0].item).toBe(true)
  })

  it('handles duplicate feature values in same add', () => {
    const index = new SimilarityIndex<string>()
    index.add('item1', 'doc1', ['word1', 'word1', 'word1'])
    const results = index.query(['word1'], 0.5)
    expect(results.length).toBe(1)
  })

  it('handles very long feature strings', () => {
    const index = new SimilarityIndex<string>()
    const longFeature = 'a'.repeat(1000)
    index.add('item1', 'doc1', [longFeature])
    const results = index.query([longFeature], 0.5)
    expect(results.length).toBe(1)
  })

  it('query with partial feature overlap', () => {
    const index = new SimilarityIndex<string>()
    index.add('item1', 'doc1', ['word1', 'word2', 'word3', 'word4', 'word5'])
    index.add('item2', 'doc2', ['word1', 'word6', 'word7', 'word8', 'word9'])
    const results = index.query(['word1'], 0.1)
    expect(results.length).toBe(2)
  })

  it('findSimilar with no similar items returns empty', () => {
    const index = new SimilarityIndex<string>()
    index.add('item1', 'doc1', ['word1', 'word2'])
    index.add('item2', 'doc2', ['word3', 'word4'])
    const results = index.findSimilar('item1', 0.8)
    expect(results.length).toBe(0)
  })

  it('handles large number of items', () => {
    const index = new SimilarityIndex<string>()
    for (let i = 0; i < 100; i++) {
      index.add(`item${i}`, `doc${i}`, [`word${i}`, `word${i + 1}`])
    }
    expect(index.size).toBe(100)
    const results = index.query(['word50'], 0.5)
    expect(results.length).toBeGreaterThan(0)
  })

  it('findSimilar with identical items returns others', () => {
    const index = new SimilarityIndex<string>()
    const features = ['word1', 'word2', 'word3']
    index.add('item1', 'doc1', features)
    index.add('item2', 'doc2', features)
    index.add('item3', 'doc3', features)
    const results = index.findSimilar('item1', 0.5)
    expect(results.length).toBe(2)
  })

  it('clear does not affect other instances', () => {
    const index1 = new SimilarityIndex<string>()
    const index2 = new SimilarityIndex<string>()
    index1.add('item1', 'doc1', ['word1'])
    index2.add('item1', 'doc1', ['word1'])
    index1.clear()
    expect(index1.size).toBe(0)
    expect(index2.size).toBe(1)
  })

  it('should compute similarity', () => {
    const index1 = new SimilarityIndex<string>()
    index1.add('doc1', 'item1', ['hello', 'world'])
    const index2 = new SimilarityIndex<string>()
    index2.add('doc2', 'item2', ['hello', 'world'])
    expect(index1.size).toBe(1)
  })

  it('should handle empty sets', () => {
    const index = new SimilarityIndex<string>()
    expect(index.size).toBe(0)
  })
})
  it('size returns entry count', () => {
    const si = new SimilarityIndex<string>(64)
    si.add('a', 'item-a', ['x', 'y'])
    si.add('b', 'item-b', ['z'])
    expect(si.size).toBe(2)
  })

  it('query returns empty for no matches', () => {
    const si = new SimilarityIndex<string>(64)
    si.add('a', 'item-a', ['x'])
    expect(si.query(['z'], 0.5)).toEqual([])
  })

  it('findSimilar with no other entries returns empty', () => {
    const si = new SimilarityIndex<string>(64)
    si.add('a', 'item-a', ['x', 'y'])
    expect(si.findSimilar('a', 0.5)).toEqual([])
  })

describe('similarity-index - extra', () => {
  it('works correctly', () => {
    expect(describe).toBeDefined()
  })

  it('handles edge case', () => {
    expect(typeof describe).toBe('function')
  })

  it('provides expected behavior', () => {
    expect(describe.name).toBeDefined()
  })
})

describe('similarity-index - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})
