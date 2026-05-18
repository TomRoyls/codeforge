import { describe, it, expect } from 'vitest'
import { PatriciaTrie } from '../src/core/patricia-trie/index.js'

describe('PatriciaTrie', () => {
  // ─── Construction & Empty State ───
  describe('construction and empty state', () => {
    it('creates empty trie', () => {
      const trie = new PatriciaTrie()
      expect(trie.size).toBe(0)
      expect(trie.isEmpty()).toBe(true)
      expect(trie.radix).toBe(256)
    })

    it('creates with alphabet option', () => {
      const trie = new PatriciaTrie({ alphabet: 'ab' })
      expect(trie.radix).toBe(2)
    })

    it('throws on invalid alphabet character', () => {
      const trie = new PatriciaTrie({ alphabet: 'ab' })
      expect(() => trie.insert('abc')).toThrow(RangeError)
    })
  })

  // ─── Insert & Lookup ───
  describe('insert and lookup', () => {
    it('inserts and retrieves value', () => {
      const trie = new PatriciaTrie<string>()
      trie.insert('hello', 'world')
      expect(trie.get('hello')).toBe('world')
    })

    it('has returns true for existing key', () => {
      const trie = new PatriciaTrie()
      trie.insert('test')
      expect(trie.has('test')).toBe(true)
      expect(trie.contains('test')).toBe(true)
    })

    it('has returns false for missing key', () => {
      const trie = new PatriciaTrie()
      expect(trie.has('test')).toBe(false)
    })

    it('insert increases size', () => {
      const trie = new PatriciaTrie()
      trie.insert('a')
      trie.insert('b')
      expect(trie.size).toBe(2)
    })

    it('duplicate insert updates value without increasing size', () => {
      const trie = new PatriciaTrie<string>()
      trie.insert('key', 'old')
      trie.insert('key', 'new')
      expect(trie.size).toBe(1)
      expect(trie.get('key')).toBe('new')
    })

    it('inserts keys with common prefix', () => {
      const trie = new PatriciaTrie()
      trie.insert('abc')
      trie.insert('abcd')
      trie.insert('abx')
      expect(trie.has('abc')).toBe(true)
      expect(trie.has('abcd')).toBe(true)
      expect(trie.has('abx')).toBe(true)
    })
  })

  // ─── Delete ───
  describe('delete', () => {
    it('deletes existing key', () => {
      const trie = new PatriciaTrie()
      trie.insert('hello')
      expect(trie.delete('hello')).toBe(true)
      expect(trie.has('hello')).toBe(false)
      expect(trie.size).toBe(0)
    })

    it('returns false for missing key', () => {
      const trie = new PatriciaTrie()
      expect(trie.delete('nope')).toBe(false)
    })

    it('cleans up after delete', () => {
      const trie = new PatriciaTrie()
      trie.insert('ab')
      trie.insert('ac')
      trie.delete('ac')
      expect(trie.has('ab')).toBe(true)
      expect(trie.has('ac')).toBe(false)
    })
  })

  // ─── Prefix Operations ───
  describe('prefix operations', () => {
    it('startsWith checks prefix existence', () => {
      const trie = new PatriciaTrie()
      trie.insert('hello')
      expect(trie.startsWith('hel')).toBe(true)
      expect(trie.startsWith('xyz')).toBe(false)
    })

    it('keysWithPrefix returns matching keys', () => {
      const trie = new PatriciaTrie()
      trie.insert('hello')
      trie.insert('help')
      trie.insert('world')
      const keys = trie.keysWithPrefix('hel')
      expect(keys).toContain('hello')
      expect(keys).toContain('help')
      expect(keys).not.toContain('world')
    })

    it('longestPrefixOf returns longest matching prefix', () => {
      const trie = new PatriciaTrie()
      trie.insert('hel')
      trie.insert('hello')
      expect(trie.longestPrefixOf('hello world')).toBe('hello')
    })

    it('longestPrefixOf returns empty when no match', () => {
      const trie = new PatriciaTrie()
      trie.insert('abc')
      expect(trie.longestPrefixOf('xyz')).toBe('')
    })
  })

  // ─── Iteration & Collection ───
  describe('iteration and collection', () => {
    it('keys returns all keys', () => {
      const trie = new PatriciaTrie()
      trie.insert('b')
      trie.insert('a')
      trie.insert('c')
      expect(trie.keys().sort()).toEqual(['a', 'b', 'c'])
    })

    it('values returns all values', () => {
      const trie = new PatriciaTrie<string>()
      trie.insert('a', '1')
      trie.insert('b', '2')
      expect(trie.values()).toHaveLength(2)
    })

    it('entries returns key-value pairs', () => {
      const trie = new PatriciaTrie<string>()
      trie.insert('a', '1')
      const entries = trie.entries()
      expect(entries).toHaveLength(1)
      expect(entries[0]!.key).toBe('a')
    })

    it('forEach iterates all entries', () => {
      const trie = new PatriciaTrie<string>()
      trie.insert('a', '1')
      trie.insert('b', '2')
      const collected: string[] = []
      trie.forEach((v, k) => collected.push(k))
      expect(collected).toHaveLength(2)
    })

    it('Symbol.iterator yields entries', () => {
      const trie = new PatriciaTrie()
      trie.insert('x')
      const entries = [...trie]
      expect(entries).toHaveLength(1)
    })

    it('toArray returns entries', () => {
      const trie = new PatriciaTrie()
      trie.insert('a')
      expect(trie.toArray()).toHaveLength(1)
    })
  })

  // ─── Clear ───
  describe('clear', () => {
    it('clear removes all entries', () => {
      const trie = new PatriciaTrie()
      trie.insert('a')
      trie.insert('b')
      trie.clear()
      expect(trie.size).toBe(0)
      expect(trie.isEmpty()).toBe(true)
    })
  })
})
