import { describe, it, expect, beforeEach } from 'vitest'
import { BitmapIndex } from '../../src/utils/bitmap-index.js'

describe('BitmapIndex', () => {
  let index: BitmapIndex<string>

  beforeEach(() => {
    index = new BitmapIndex<string>()
  })

  it('should add documents with tags', () => {
    index.add('doc1', ['tag1', 'tag2'])
    expect(index.documentCount).toBe(1)
  })

  it('should query documents by single tag', () => {
    index.add('doc1', ['tag1', 'tag2'])
    index.add('doc2', ['tag1', 'tag3'])
    const results = index.query('tag1')
    expect(results).toHaveLength(2)
    expect(results).toContain('doc1')
    expect(results).toContain('doc2')
  })

  it('should return empty array for non-existent tag', () => {
    index.add('doc1', ['tag1'])
    const results = index.query('nonexistent')
    expect(results).toEqual([])
  })

  it('should query documents with AND logic', () => {
    index.add('doc1', ['tag1', 'tag2', 'tag3'])
    index.add('doc2', ['tag1', 'tag2'])
    index.add('doc3', ['tag1'])
    const results = index.queryAnd(['tag1', 'tag2'])
    expect(results).toHaveLength(2)
    expect(results).toContain('doc1')
    expect(results).toContain('doc2')
  })

  it('should return empty for AND query with no results', () => {
    index.add('doc1', ['tag1'])
    index.add('doc2', ['tag2'])
    const results = index.queryAnd(['tag1', 'tag2'])
    expect(results).toEqual([])
  })

  it('should query documents with OR logic', () => {
    index.add('doc1', ['tag1'])
    index.add('doc2', ['tag2'])
    index.add('doc3', ['tag3'])
    const results = index.queryOr(['tag1', 'tag2'])
    expect(results).toHaveLength(2)
    expect(results).toContain('doc1')
    expect(results).toContain('doc2')
  })

  it('should query documents with NOT logic', () => {
    index.add('doc1', ['tag1'])
    index.add('doc2', ['tag2'])
    index.add('doc3', ['tag1', 'tag2'])
    const results = index.queryNot('tag1')
    expect(results).toHaveLength(1)
    expect(results).toContain('doc2')
  })

  it('should query with AND-NOT logic', () => {
    index.add('doc1', ['tag1', 'tag2', 'tag3'])
    index.add('doc2', ['tag1', 'tag2'])
    index.add('doc3', ['tag1', 'tag3'])
    const results = index.queryAndNot(['tag1'], ['tag2'])
    expect(results).toHaveLength(1)
    expect(results).toContain('doc3')
  })

  it('should get tag count', () => {
    index.add('doc1', ['tag1', 'tag2'])
    index.add('doc2', ['tag1'])
    expect(index.getTagCount('tag1')).toBe(2)
    expect(index.getTagCount('tag2')).toBe(1)
    expect(index.getTagCount('nonexistent')).toBe(0)
  })

  it('should get all tags', () => {
    index.add('doc1', ['tag1', 'tag2'])
    index.add('doc2', ['tag3'])
    const tags = index.tags
    expect(tags).toHaveLength(3)
    expect(tags).toContain('tag1')
    expect(tags).toContain('tag2')
    expect(tags).toContain('tag3')
  })

  it('should check if tag exists', () => {
    index.add('doc1', ['tag1'])
    expect(index.hasTag('tag1')).toBe(true)
    expect(index.hasTag('nonexistent')).toBe(false)
  })

  it('should get documents with tag count', () => {
    index.add('doc1', ['tag1', 'tag2'])
    index.add('doc2', ['tag1'])
    expect(index.getDocumentsWithTag('tag1')).toBe(2)
    expect(index.getDocumentsWithTag('tag2')).toBe(1)
  })

  it('should remove document', () => {
    index.add('doc1', ['tag1', 'tag2'])
    const removed = index.remove('doc1')
    expect(removed).toBe(true)
    expect(index.documentCount).toBe(0)
    expect(index.query('tag1')).toEqual([])
  })

  it('should return false when removing non-existent document', () => {
    const removed = index.remove('nonexistent')
    expect(removed).toBe(false)
  })

  it('should clear all data', () => {
    index.add('doc1', ['tag1'])
    index.add('doc2', ['tag2'])
    index.clear()
    expect(index.documentCount).toBe(0)
    expect(index.tags).toEqual([])
  })

  it('should handle adding same document with different tags', () => {
    index.add('doc1', ['tag1'])
    index.add('doc1', ['tag2', 'tag3'])
    expect(index.documentCount).toBe(1)
    expect(index.query('tag1')).toContain('doc1')
    expect(index.query('tag2')).toContain('doc1')
    expect(index.query('tag3')).toContain('doc1')
  })

  it('should handle numeric document IDs', () => {
    const numIndex = new BitmapIndex<number>()
    numIndex.add(1, ['tag1'])
    numIndex.add(2, ['tag1', 'tag2'])
    const results = numIndex.query('tag1')
    expect(results).toHaveLength(2)
    expect(results).toContain(1)
    expect(results).toContain(2)
  })

  it('should return empty for OR query with empty tags array', () => {
    const results = index.queryOr([])
    expect(results).toEqual([])
  })

  it('should return empty for AND query with empty tags array', () => {
    const results = index.queryAnd([])
    expect(results).toEqual([])
  })

  it('should handle multiple removes', () => {
    index.add('doc1', ['tag1'])
    index.add('doc2', ['tag1'])
    index.add('doc3', ['tag2'])
    index.remove('doc1')
    index.remove('doc2')
    expect(index.documentCount).toBe(1)
    expect(index.query('tag1')).toEqual([])
  })

  it('query for non-existent tag returns empty', () => {
    const index = new BitmapIndex()
    index.add('doc1', ['tag1'])
    expect(index.query('tag99')).toEqual([])
  })

  it('query existing tag returns results', () => {
    const index = new BitmapIndex()
    index.add('doc1', ['tag1'])
    const results = index.query('tag1')
    expect(results.length).toBeGreaterThan(0)
  })

  it('query returns empty for unknown tag', () => {
    const index = new BitmapIndex()
    index.add('doc1', ['tag1'])
    const results = index.query('unknown')
    expect(results.length).toBe(0)
  })

  it('query matching tag returns document', () => {
    const index = new BitmapIndex()
    index.add('doc1', ['tag1'])
    const results = index.query('tag1')
    expect(results).toContain('doc1')
  })
})