import { describe, it, expect } from 'vitest'
import { PathCompressionTrie } from '../src/core/path-compression-trie/index.js'

describe('PathCompressionTrie', () => {
  // ─── Construction & Empty State ───
  describe('construction and empty state', () => {
    it('creates an empty trie', () => {
      const trie = new PathCompressionTrie()
      expect(trie.size).toBe(0)
      expect(trie.isEmpty).toBe(true)
    })

    it('isEmpty returns false after insert', () => {
      const trie = new PathCompressionTrie()
      trie.insert('hello')
      expect(trie.isEmpty).toBe(false)
      expect(trie.size).toBe(1)
    })
  })

  // ─── Insert & Search ───
  describe('insert and search', () => {
    it('inserts and searches a key', () => {
      const trie = new PathCompressionTrie<string>()
      trie.insert('hello', 'world')
      expect(trie.search('hello')).toBe('world')
    })

    it('returns undefined for missing key', () => {
      const trie = new PathCompressionTrie()
      trie.insert('hello')
      expect(trie.search('world')).toBeUndefined()
    })

    it('has returns true for existing key', () => {
      const trie = new PathCompressionTrie()
      trie.insert('test')
      expect(trie.has('test')).toBe(true)
    })

    it('has returns false for missing key', () => {
      const trie = new PathCompressionTrie()
      expect(trie.has('test')).toBe(false)
    })

    it('inserts empty string key', () => {
      const trie = new PathCompressionTrie()
      trie.insert('', 'root')
      expect(trie.has('')).toBe(true)
      expect(trie.search('')).toBe('root')
    })

    it('overwrites existing key value', () => {
      const trie = new PathCompressionTrie<string>()
      trie.insert('key', 'old')
      trie.insert('key', 'new')
      expect(trie.search('key')).toBe('new')
      expect(trie.size).toBe(1)
    })

    it('inserts keys with common prefix', () => {
      const trie = new PathCompressionTrie()
      trie.insert('abc')
      trie.insert('abd')
      expect(trie.has('abc')).toBe(true)
      expect(trie.has('abd')).toBe(true)
    })

    it('insert returns this for chaining', () => {
      const trie = new PathCompressionTrie()
      const result = trie.insert('a')
      expect(result).toBe(trie)
    })
  })

  // ─── Delete ───
  describe('delete', () => {
    it('deletes an existing key', () => {
      const trie = new PathCompressionTrie()
      trie.insert('hello')
      expect(trie.delete('hello')).toBe(true)
      expect(trie.has('hello')).toBe(false)
      expect(trie.size).toBe(0)
    })

    it('returns false for non-existing key', () => {
      const trie = new PathCompressionTrie()
      expect(trie.delete('hello')).toBe(false)
    })

    it('deletes empty string key', () => {
      const trie = new PathCompressionTrie()
      trie.insert('')
      expect(trie.delete('')).toBe(true)
      expect(trie.has('')).toBe(false)
    })

    it('compresses path after delete', () => {
      const trie = new PathCompressionTrie()
      trie.insert('ab')
      trie.insert('ac')
      trie.delete('ac')
      expect(trie.has('ab')).toBe(true)
      expect(trie.has('ac')).toBe(false)
    })
  })

  // ─── Prefix Operations ───
  describe('prefix operations', () => {
    it('startsWith returns true for matching prefix', () => {
      const trie = new PathCompressionTrie()
      trie.insert('hello')
      expect(trie.startsWith('hel')).toBe(true)
    })

    it('startsWith returns false for non-matching prefix', () => {
      const trie = new PathCompressionTrie()
      trie.insert('hello')
      expect(trie.startsWith('xyz')).toBe(false)
    })

    it('startsWith with empty prefix returns true when trie non-empty', () => {
      const trie = new PathCompressionTrie()
      trie.insert('a')
      expect(trie.startsWith('')).toBe(true)
    })

    it('startsWith with empty prefix returns false when trie empty', () => {
      const trie = new PathCompressionTrie()
      expect(trie.startsWith('')).toBe(false)
    })

    it('keysWithPrefix returns matching keys', () => {
      const trie = new PathCompressionTrie()
      trie.insert('hello')
      trie.insert('help')
      trie.insert('world')
      const keys = trie.keysWithPrefix('hel')
      expect(keys).toContain('hello')
      expect(keys).toContain('help')
      expect(keys).not.toContain('world')
    })

    it('keysWithPrefix with empty prefix returns all keys', () => {
      const trie = new PathCompressionTrie()
      trie.insert('a')
      trie.insert('b')
      const keys = trie.keysWithPrefix('')
      expect(keys).toHaveLength(2)
    })
  })

  // ─── Iteration & Clear ───
  describe('iteration and clear', () => {
    it('keys returns all keys', () => {
      const trie = new PathCompressionTrie()
      trie.insert('a')
      trie.insert('b')
      const keys = [...trie.keys()]
      expect(keys).toHaveLength(2)
      expect(keys).toContain('a')
    })

    it('values returns all values', () => {
      const trie = new PathCompressionTrie<string>()
      trie.insert('a', '1')
      trie.insert('b', '2')
      const values = [...trie.values()]
      expect(values).toHaveLength(2)
    })

    it('entries returns key-value pairs', () => {
      const trie = new PathCompressionTrie<string>()
      trie.insert('a', '1')
      const entries = [...trie.entries()]
      expect(entries).toHaveLength(1)
      expect(entries[0]!.key).toBe('a')
      expect(entries[0]!.value).toBe('1')
    })

    it('forEach iterates all entries', () => {
      const trie = new PathCompressionTrie<string>()
      trie.insert('a', '1')
      trie.insert('b', '2')
      const collected: string[] = []
      trie.forEach((v, k) => collected.push(k))
      expect(collected).toHaveLength(2)
    })

    it('Symbol.iterator returns entries', () => {
      const trie = new PathCompressionTrie()
      trie.insert('x')
      const entries = [...trie]
      expect(entries).toHaveLength(1)
    })

    it('clear removes all entries', () => {
      const trie = new PathCompressionTrie()
      trie.insert('a')
      trie.insert('b')
      trie.clear()
      expect(trie.size).toBe(0)
      expect(trie.isEmpty).toBe(true)
    })
  })
})
