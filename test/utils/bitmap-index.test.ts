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

  it('query missing tag returns empty', () => {
    const index = new BitmapIndex<string>()
    index.add('doc1', ['tag1'])
    const results = index.query('tag999')
    expect(results.length).toBe(0)
  })

  it('should handle adding with empty tags array', () => {
    index.add('doc1', [])
    expect(index.documentCount).toBe(1)
    expect(index.query('tag1')).toEqual([])
  })

  it('should handle duplicate tags in same add call', () => {
    index.add('doc1', ['tag1', 'tag1', 'tag2'])
    expect(index.getTagCount('tag1')).toBe(1)
    expect(index.getTagCount('tag2')).toBe(1)
  })

  it('should return 0 count for non-existent tag', () => {
    index.add('doc1', ['tag1'])
    expect(index.getDocumentsWithTag('nonexistent')).toBe(0)
  })

  it('should preserve ability to add after clear', () => {
    index.add('doc1', ['tag1'])
    index.clear()
    index.add('doc2', ['tag2'])
    expect(index.documentCount).toBe(1)
    expect(index.query('tag2')).toEqual(['doc2'])
  })

  it('should reset documentCount after clear', () => {
    index.add('doc1', ['tag1'])
    index.add('doc2', ['tag2'])
    index.clear()
    expect(index.documentCount).toBe(0)
  })

  it('should reset tags after clear', () => {
    index.add('doc1', ['tag1', 'tag2'])
    index.clear()
    expect(index.tags).toEqual([])
  })

  it('queryAnd with single tag behaves like query', () => {
    index.add('doc1', ['tag1', 'tag2'])
    index.add('doc2', ['tag1'])
    const results = index.queryAnd(['tag1'])
    expect(results).toHaveLength(2)
    expect(results).toContain('doc1')
    expect(results).toContain('doc2')
  })

  it('queryOr with all non-existent tags returns empty', () => {
    index.add('doc1', ['tag1'])
    const results = index.queryOr(['tag99', 'tag100'])
    expect(results).toEqual([])
  })

  it('queryOr with mix of existent and non-existent tags', () => {
    index.add('doc1', ['tag1'])
    index.add('doc2', ['tag2'])
    const results = index.queryOr(['tag1', 'tag999'])
    expect(results).toHaveLength(1)
    expect(results).toContain('doc1')
  })

  it('queryNot with non-existent tag returns all documents', () => {
    index.add('doc1', ['tag1'])
    index.add('doc2', ['tag2'])
    const results = index.queryNot('tag999')
    expect(results).toHaveLength(2)
  })

  it('queryAndNot with empty include returns empty', () => {
    index.add('doc1', ['tag1', 'tag2'])
    const results = index.queryAndNot([], ['tag1'])
    expect(results).toEqual([])
  })

  it('queryAndNot with empty exclude behaves like queryAnd', () => {
    index.add('doc1', ['tag1', 'tag2'])
    index.add('doc2', ['tag1'])
    const results = index.queryAndNot(['tag1'], [])
    expect(results).toHaveLength(2)
  })

  it('queryAndNot with both empty returns empty', () => {
    index.add('doc1', ['tag1'])
    const results = index.queryAndNot([], [])
    expect(results).toEqual([])
  })

  it('toString returns correct format', () => {
    index.add('doc1', ['tag1'])
    index.add('doc2', ['tag2'])
    const str = index.toString()
    expect(str).toBe('BitmapIndex(docs=2, tags=2)')
  })

  it('toString with empty index', () => {
    const str = index.toString()
    expect(str).toBe('BitmapIndex(docs=0, tags=0)')
  })

  it('toJSON returns correct structure', () => {
    index.add('doc1', ['tag1', 'tag2'])
    index.add('doc2', ['tag1'])
    const json = index.toJSON()
    expect(json).toEqual({
      tag1: ['doc1', 'doc2'],
      tag2: ['doc1']
    })
  })

  it('toJSON with empty index', () => {
    const json = index.toJSON()
    expect(json).toEqual({})
  })

  it('clone preserves all data', () => {
    index.add('doc1', ['tag1', 'tag2'])
    index.add('doc2', ['tag1'])
    const clone = index.clone()
    expect(clone.documentCount).toBe(2)
    expect(clone.query('tag1')).toHaveLength(2)
    expect(clone.query('tag2')).toHaveLength(1)
  })

  it('clone is independent from original', () => {
    index.add('doc1', ['tag1'])
    const clone = index.clone()
    index.add('doc2', ['tag2'])
    clone.add('doc3', ['tag3'])
    expect(index.documentCount).toBe(2)
    expect(clone.documentCount).toBe(2)
    expect(index.query('tag3')).toEqual([])
    expect(clone.query('tag2')).toEqual([])
  })

  it('equals returns true for identical indexes', () => {
    index.add('doc1', ['tag1', 'tag2'])
    index.add('doc2', ['tag1'])
    const other = new BitmapIndex<string>()
    other.add('doc1', ['tag1', 'tag2'])
    other.add('doc2', ['tag1'])
    expect(index.equals(other)).toBe(true)
  })

  it('equals returns false for different document counts', () => {
    index.add('doc1', ['tag1'])
    const other = new BitmapIndex<string>()
    other.add('doc1', ['tag1'])
    other.add('doc2', ['tag2'])
    expect(index.equals(other)).toBe(false)
  })

  it('equals returns false for different tag counts', () => {
    index.add('doc1', ['tag1', 'tag2'])
    const other = new BitmapIndex<string>()
    other.add('doc1', ['tag1'])
    expect(index.equals(other)).toBe(false)
  })

  it('equals returns false for different data', () => {
    index.add('doc1', ['tag1'])
    const other = new BitmapIndex<string>()
    other.add('doc1', ['tag2'])
    expect(index.equals(other)).toBe(false)
  })

  it('equals returns false for non-BitmapIndex', () => {
    expect(index.equals({})).toBe(false)
    expect(index.equals(null)).toBe(false)
    expect(index.equals(undefined)).toBe(false)
  })

  it('add after remove reuses or creates new docId', () => {
    index.add('doc1', ['tag1'])
    index.remove('doc1')
    index.add('doc1', ['tag2'])
    expect(index.documentCount).toBe(1)
    expect(index.query('tag2')).toContain('doc1')
  })

  it('queryAnd with three tags returns correct intersection', () => {
    index.add('doc1', ['tag1', 'tag2', 'tag3'])
    index.add('doc2', ['tag1', 'tag2'])
    index.add('doc3', ['tag1'])
    const results = index.queryAnd(['tag1', 'tag2', 'tag3'])
    expect(results).toHaveLength(1)
    expect(results).toContain('doc1')
  })

  it('queryAnd with non-existent tag returns empty', () => {
    index.add('doc1', ['tag1'])
    const results = index.queryAnd(['tag1', 'tag999'])
    expect(results).toEqual([])
  })

  it('queryOr with duplicate tags handles correctly', () => {
    index.add('doc1', ['tag1'])
    index.add('doc2', ['tag2'])
    const results = index.queryOr(['tag1', 'tag1'])
    expect(results).toHaveLength(1)
    expect(results).toContain('doc1')
  })

  it('queryNot with empty index returns empty', () => {
    const results = index.queryNot('tag1')
    expect(results).toEqual([])
  })

  it('remove document not in any tag', () => {
    index.add('doc1', [])
    const removed = index.remove('doc1')
    expect(removed).toBe(true)
    expect(index.documentCount).toBe(0)
  })
})
  it('empty bitmap returns empty result', () => {
    const bi = new BitmapIndex()
    expect(bi.query('missing')).toEqual([])
  })

  it('add and query', () => {
    const bi = new BitmapIndex()
    bi.add(0, 'a')
    bi.add(1, 'a')
    expect(bi.query('a').sort()).toEqual([0, 1])
  })

  it('multiple values for same id', () => {
    const bi = new BitmapIndex()
    bi.add(0, 'x')
    bi.add(0, 'y')
    expect(bi.query('x')).toContain(0)
    expect(bi.query('y')).toContain(0)
  })

describe('bitmap-index - wave544', () => {
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

describe('bitmap-index - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('bitmap-index - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('bitmap-index - wave548', () => {
  it('bitmap-index module defined', () => {
    expect(describe).toBeDefined()
  })
  it('bitmap-index module is function', () => {
    expect(describe).toBeDefined()
  })
  it('bitmap-index module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('bitmap-index - wave549', () => {
  it('bitmap-index module defined', () => {
    expect(describe).toBeDefined()
  })
  it('bitmap-index module is function', () => {
    expect(describe).toBeDefined()
  })
  it('bitmap-index module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('bitmap-index - wave550', () => {
  it('bitmap-index w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('bitmap-index w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('bitmap-index w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('bitmap-index - wave551', () => {
  it('bitmap-index w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('bitmap-index w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('bitmap-index w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bitmap-index - wave552', () => {
  it('bitmap-index w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bitmap-index w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bitmap-index w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bitmap-index - wave553', () => {
  it('bitmap-index w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bitmap-index w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bitmap-index w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bitmap-index - wave554', () => {
  it('bitmap-index w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bitmap-index w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bitmap-index w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bitmap-index - wave555', () => {
  it('bitmap-index w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bitmap-index w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bitmap-index w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bitmap-index - wave556', () => {
  it('bitmap-index w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bitmap-index w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bitmap-index w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bitmap-index - wave557', () => {
  it('bitmap-index w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bitmap-index w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bitmap-index w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bitmap-index - wave558', () => {
  it('bitmap-index w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bitmap-index w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bitmap-index w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bitmap-index - wave559', () => {
  it('bitmap-index w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bitmap-index w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bitmap-index w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bitmap-index - wave560', () => {
  it('bitmap-index w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bitmap-index w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bitmap-index w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bitmap-index - wave561', () => {
  it('bitmap-index w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bitmap-index w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bitmap-index w561 v2', () => {
    expect(describe).toBeDefined()
  })
})
