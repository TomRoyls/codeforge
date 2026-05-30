import { describe, it, expect } from 'vitest'
import { SimilarityIndex } from '../src/utils/similarity-index.js'

describe('SimilarityIndex', () => {
  describe('add and query', () => {
    it('finds similar items', () => {
      const idx = new SimilarityIndex<{ name: string }>(128, 0)
      idx.add('a', { name: 'alpha' }, ['x', 'y', 'z'])
      idx.add('b', { name: 'beta' }, ['x', 'y', 'w'])
      idx.add('c', { name: 'gamma' }, ['p', 'q', 'r'])

      const results = idx.query(['x', 'y', 'z'], 0.3)
      expect(results.length).toBeGreaterThan(0)
      expect(results[0]!.similarity).toBeGreaterThan(0.3)
    })

    it('excludes items below threshold', () => {
      const idx = new SimilarityIndex<string>(128, 0)
      idx.add('a', 'alpha', Array.from({ length: 100 }, (_, i) => `feat-a-${i}`))
      idx.add('b', 'beta', Array.from({ length: 100 }, (_, i) => `feat-b-${i}`))
      const results = idx.query(Array.from({ length: 100 }, (_, i) => `feat-a-${i}`), 0.8)
      expect(results.every(r => r.similarity >= 0.8)).toBe(true)
    })

    it('returns empty for no matches', () => {
      const idx = new SimilarityIndex<string>(64, 0)
      idx.add('a', 'alpha', ['x', 'y'])
      expect(idx.query(['p', 'q'], 0.9)).toEqual([])
    })
  })

  describe('findSimilar', () => {
    it('finds similar items by id', () => {
      const idx = new SimilarityIndex<string>(128, 0)
      idx.add('a', 'alpha', ['x', 'y', 'z'])
      idx.add('b', 'beta', ['x', 'y', 'z'])
      idx.add('c', 'gamma', ['p', 'q'])

      const results = idx.findSimilar('a', 0.3)
      expect(results.some(r => r.item === 'beta')).toBe(true)
    })

    it('returns empty for missing id', () => {
      expect(new SimilarityIndex<string>().findSimilar('missing')).toEqual([])
    })

    it('excludes self from results', () => {
      const idx = new SimilarityIndex<string>(64, 0)
      idx.add('a', 'alpha', ['x', 'y'])
      const results = idx.findSimilar('a', 0.0)
      expect(results.every(r => r.item !== 'alpha')).toBe(true)
    })
  })

  describe('addAutoKey', () => {
    it('generates unique keys', () => {
      const idx = new SimilarityIndex<string>(64, 0)
      const k1 = idx.addAutoKey('alpha', ['x'])
      const k2 = idx.addAutoKey('beta', ['y'])
      expect(k1).not.toBe(k2)
      expect(idx.size).toBe(2)
    })
  })

  describe('contains', () => {
    it('returns true for existing id', () => {
      const idx = new SimilarityIndex<string>(64, 0)
      idx.add('a', 'alpha', ['x'])
      expect(idx.contains('a')).toBe(true)
    })

    it('returns false for missing id', () => {
      expect(new SimilarityIndex<string>().contains('a')).toBe(false)
    })
  })

  describe('remove', () => {
    it('removes entry', () => {
      const idx = new SimilarityIndex<string>(64, 0)
      idx.add('a', 'alpha', ['x'])
      expect(idx.remove('a')).toBe(true)
      expect(idx.size).toBe(0)
    })

    it('returns false for missing', () => {
      expect(new SimilarityIndex<string>().remove('a')).toBe(false)
    })
  })

  describe('clear', () => {
    it('clears all entries', () => {
      const idx = new SimilarityIndex<string>(64, 0)
      idx.add('a', 'alpha', ['x'])
      idx.add('b', 'beta', ['y'])
      idx.clear()
      expect(idx.size).toBe(0)
    })
  })

  describe('size', () => {
    it('tracks number of entries', () => {
      const idx = new SimilarityIndex<string>(64, 0)
      expect(idx.size).toBe(0)
      idx.add('a', 'alpha', ['x'])
      expect(idx.size).toBe(1)
    })
  })
})
