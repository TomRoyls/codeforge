import { describe, it, expect } from 'vitest'
import { BitmapIndex } from '../../../src/utils/bitmap-index.js'

describe('BitmapIndex', () => {
  describe('add and query', () => {
    it('adds documents and queries by tag', () => {
      const idx = new BitmapIndex<string>()
      idx.add('doc1', ['typescript', 'frontend'])
      idx.add('doc2', ['typescript', 'backend'])
      idx.add('doc3', ['python', 'backend'])
      expect(idx.query('typescript')).toEqual(['doc1', 'doc2'])
      expect(idx.query('backend')).toEqual(['doc2', 'doc3'])
      expect(idx.query('frontend')).toEqual(['doc1'])
    })

    it('returns empty for unknown tag', () => {
      const idx = new BitmapIndex<string>()
      expect(idx.query('missing')).toEqual([])
    })

    it('handles document with no tags', () => {
      const idx = new BitmapIndex<string>()
      idx.add('doc1', [])
      expect(idx.documentCount).toBe(1)
    })
  })

  describe('queryAnd', () => {
    it('returns documents with all tags', () => {
      const idx = new BitmapIndex<string>()
      idx.add('doc1', ['a', 'b', 'c'])
      idx.add('doc2', ['a', 'b'])
      idx.add('doc3', ['a', 'c'])
      const result = idx.queryAnd(['a', 'b'])
      expect(result.sort()).toEqual(['doc1', 'doc2'])
    })

    it('returns empty when no intersection', () => {
      const idx = new BitmapIndex<string>()
      idx.add('doc1', ['a'])
      idx.add('doc2', ['b'])
      expect(idx.queryAnd(['a', 'b'])).toEqual([])
    })

    it('handles empty tags array', () => {
      const idx = new BitmapIndex<string>()
      idx.add('doc1', ['a'])
      expect(idx.queryAnd([])).toEqual([])
    })
  })

  describe('queryOr', () => {
    it('returns documents with any tag', () => {
      const idx = new BitmapIndex<string>()
      idx.add('doc1', ['a'])
      idx.add('doc2', ['b'])
      idx.add('doc3', ['c'])
      const result = idx.queryOr(['a', 'c'])
      expect(result.sort()).toEqual(['doc1', 'doc3'])
    })

    it('deduplicates', () => {
      const idx = new BitmapIndex<string>()
      idx.add('doc1', ['a', 'b'])
      const result = idx.queryOr(['a', 'b'])
      expect(result).toEqual(['doc1'])
    })

    it('handles empty tags', () => {
      const idx = new BitmapIndex<string>()
      idx.add('doc1', ['a'])
      expect(idx.queryOr([])).toEqual([])
    })
  })

  describe('queryNot', () => {
    it('returns documents without tag', () => {
      const idx = new BitmapIndex<string>()
      idx.add('doc1', ['a'])
      idx.add('doc2', ['b'])
      idx.add('doc3', ['a', 'b'])
      const result = idx.queryNot('a')
      expect(result).toEqual(['doc2'])
    })
  })

  describe('queryAndNot', () => {
    it('includes with some tags, excludes with others', () => {
      const idx = new BitmapIndex<string>()
      idx.add('doc1', ['a', 'b'])
      idx.add('doc2', ['a', 'c'])
      idx.add('doc3', ['b', 'c'])
      const result = idx.queryAndNot(['a'], ['b'])
      expect(result).toEqual(['doc2'])
    })
  })

  describe('remove', () => {
    it('removes a document', () => {
      const idx = new BitmapIndex<string>()
      idx.add('doc1', ['a', 'b'])
      idx.add('doc2', ['a'])
      expect(idx.remove('doc1')).toBe(true)
      expect(idx.query('a')).toEqual(['doc2'])
      expect(idx.query('b')).toEqual([])
    })

    it('returns false for unknown document', () => {
      const idx = new BitmapIndex<string>()
      expect(idx.remove('missing')).toBe(false)
    })
  })

  describe('metadata', () => {
    it('reports tags', () => {
      const idx = new BitmapIndex<string>()
      idx.add('doc1', ['x', 'y'])
      expect(idx.tags.sort()).toEqual(['x', 'y'])
    })

    it('reports document count', () => {
      const idx = new BitmapIndex<string>()
      idx.add('doc1', ['a'])
      idx.add('doc2', ['b'])
      expect(idx.documentCount).toBe(2)
    })

    it('reports tag count', () => {
      const idx = new BitmapIndex<string>()
      idx.add('doc1', ['a'])
      idx.add('doc2', ['a'])
      idx.add('doc3', ['b'])
      expect(idx.getTagCount('a')).toBe(2)
      expect(idx.getTagCount('b')).toBe(1)
      expect(idx.getTagCount('c')).toBe(0)
    })

    it('hasTag', () => {
      const idx = new BitmapIndex<string>()
      idx.add('doc1', ['a'])
      expect(idx.hasTag('a')).toBe(true)
      expect(idx.hasTag('b')).toBe(false)
    })
  })

  describe('clear', () => {
    it('clears everything', () => {
      const idx = new BitmapIndex<string>()
      idx.add('doc1', ['a', 'b'])
      idx.clear()
      expect(idx.documentCount).toBe(0)
      expect(idx.tags).toEqual([])
      expect(idx.query('a')).toEqual([])
    })
  })

  describe('numeric keys', () => {
    it('works with numeric document IDs', () => {
      const idx = new BitmapIndex<number>()
      idx.add(1, ['x'])
      idx.add(2, ['x', 'y'])
      idx.add(3, ['y'])
      expect(idx.query('x').sort()).toEqual([1, 2])
      expect(idx.queryAnd(['x', 'y'])).toEqual([2])
    })
  })

  describe('stress test', () => {
    it('handles many documents and tags', () => {
      const idx = new BitmapIndex<number>()
      for (let i = 0; i < 200; i++) {
        const tags = [`tag${i % 5}`, `tag${i % 10}`]
        idx.add(i, tags)
      }
      expect(idx.documentCount).toBe(200)
      expect(idx.getTagCount('tag0')).toBe(40)
      const andResult = idx.queryAnd(['tag0', 'tag5'])
      expect(andResult.length).toBeGreaterThan(0)
    })
  })
})
