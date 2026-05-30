import { describe, it, expect } from 'vitest'
import { TrieMap } from '../../../src/utils/trie-map.js'

describe('TrieMap', () => {
  describe('set and get', () => {
    it('stores and retrieves values', () => {
      const t = new TrieMap<number>()
      t.set('abc', 1)
      expect(t.get('abc')).toBe(1)
    })

    it('returns undefined for missing key', () => {
      const t = new TrieMap<number>()
      expect(t.get('abc')).toBeUndefined()
    })

    it('overwrites existing value', () => {
      const t = new TrieMap<number>()
      t.set('abc', 1)
      t.set('abc', 2)
      expect(t.get('abc')).toBe(2)
      expect(t.size).toBe(1)
    })

    it('stores empty string key', () => {
      const t = new TrieMap<number>()
      t.set('', 42)
      expect(t.get('')).toBe(42)
    })

    it('stores different length keys', () => {
      const t = new TrieMap<string>()
      t.set('a', 'short')
      t.set('ab', 'medium')
      t.set('abc', 'longer')
      t.set('abcdefghijklmnop', 'very long')
      expect(t.get('a')).toBe('short')
      expect(t.get('ab')).toBe('medium')
      expect(t.get('abc')).toBe('longer')
      expect(t.get('abcdefghijklmnop')).toBe('very long')
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      const t = new TrieMap<number>()
      t.set('key', 1)
      expect(t.has('key')).toBe(true)
    })

    it('returns false for missing key', () => {
      const t = new TrieMap<number>()
      expect(t.has('key')).toBe(false)
    })

    it('returns false for prefix that is not a key', () => {
      const t = new TrieMap<number>()
      t.set('abc', 1)
      expect(t.has('ab')).toBe(false)
    })
  })

  describe('delete', () => {
    it('removes a key', () => {
      const t = new TrieMap<number>()
      t.set('abc', 1)
      expect(t.delete('abc')).toBe(true)
      expect(t.has('abc')).toBe(false)
      expect(t.size).toBe(0)
    })

    it('returns false for missing key', () => {
      const t = new TrieMap<number>()
      expect(t.delete('abc')).toBe(false)
    })

    it('cleans up unused nodes', () => {
      const t = new TrieMap<number>()
      t.set('abc', 1)
      t.set('ab', 2)
      t.delete('abc')
      expect(t.hasPrefix('abc')).toBe(false)
      expect(t.has('ab')).toBe(true)
    })
  })

  describe('hasPrefix', () => {
    it('returns true for existing prefix', () => {
      const t = new TrieMap<number>()
      t.set('abcdef', 1)
      expect(t.hasPrefix('abc')).toBe(true)
    })

    it('returns true for empty prefix', () => {
      const t = new TrieMap<number>()
      t.set('abc', 1)
      expect(t.hasPrefix('')).toBe(true)
    })

    it('returns false for non-existent prefix', () => {
      const t = new TrieMap<number>()
      t.set('abc', 1)
      expect(t.hasPrefix('xyz')).toBe(false)
    })
  })

  describe('keysWithPrefix', () => {
    it('finds all keys with prefix', () => {
      const t = new TrieMap<number>()
      t.set('apple', 1)
      t.set('application', 2)
      t.set('banana', 3)
      t.set('apply', 4)
      expect(t.keysWithPrefix('app').sort()).toEqual(['apple', 'application', 'apply'])
    })

    it('returns empty for non-matching prefix', () => {
      const t = new TrieMap<number>()
      t.set('abc', 1)
      expect(t.keysWithPrefix('xyz')).toEqual([])
    })

    it('returns all keys for empty prefix', () => {
      const t = new TrieMap<number>()
      t.set('a', 1)
      t.set('b', 2)
      expect(t.keysWithPrefix('').sort()).toEqual(['a', 'b'])
    })
  })

  describe('valuesWithPrefix', () => {
    it('returns values matching prefix', () => {
      const t = new TrieMap<number>()
      t.set('car', 1)
      t.set('cat', 2)
      t.set('dog', 3)
      const vals = t.valuesWithPrefix('ca').sort()
      expect(vals).toEqual([1, 2])
    })
  })

  describe('entriesWithPrefix', () => {
    it('returns entries matching prefix', () => {
      const t = new TrieMap<number>()
      t.set('car', 1)
      t.set('cat', 2)
      t.set('dog', 3)
      const entries = t.entriesWithPrefix('ca').sort((a, b) => a[0].localeCompare(b[0]))
      expect(entries).toEqual([['car', 1], ['cat', 2]])
    })
  })

  describe('longestPrefixOf', () => {
    it('finds longest key that is prefix of query', () => {
      const t = new TrieMap<number>()
      t.set('a', 1)
      t.set('ab', 2)
      t.set('abc', 3)
      expect(t.longestPrefixOf('abcd')).toBe('abc')
    })

    it('returns empty when no prefix matches', () => {
      const t = new TrieMap<number>()
      t.set('xyz', 1)
      expect(t.longestPrefixOf('abc')).toBe('')
    })

    it('returns exact match', () => {
      const t = new TrieMap<number>()
      t.set('abc', 1)
      expect(t.longestPrefixOf('abc')).toBe('abc')
    })
  })

  describe('clear', () => {
    it('removes all entries', () => {
      const t = new TrieMap<number>()
      t.set('a', 1)
      t.set('b', 2)
      t.clear()
      expect(t.size).toBe(0)
      expect(t.get('a')).toBeUndefined()
    })
  })

  describe('size', () => {
    it('tracks size correctly', () => {
      const t = new TrieMap<number>()
      expect(t.size).toBe(0)
      t.set('a', 1)
      expect(t.size).toBe(1)
      t.set('b', 2)
      expect(t.size).toBe(2)
      t.delete('a')
      expect(t.size).toBe(1)
    })
  })

  describe('autocomplete simulation', () => {
    it('provides autocomplete suggestions', () => {
      const t = new TrieMap<string>()
      const words = ['function', 'functional', 'functions', 'fun', 'functor', 'furniture']
      for (const w of words) t.set(w, w.toUpperCase())
      const suggestions = t.keysWithPrefix('func')
      expect(suggestions.sort()).toEqual(['function', 'functional', 'functions', 'functor'])
    })
  })
})
