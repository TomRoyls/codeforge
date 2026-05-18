import { describe, expect, it } from 'vitest'

import { TernarySearchTrie } from '../src/core/ternary-search-trie/index.js'

// ─── Construction ──────────────────────────────────────
describe('TernarySearchTrie construction', () => {
  it('creates empty trie', () => {
    const trie = new TernarySearchTrie<number>()
    expect(trie.size()).toBe(0)
    expect(trie.isEmpty()).toBe(true)
  })
})

// ─── Insert ────────────────────────────────────────────
describe('TernarySearchTrie insert', () => {
  it('inserts key-value pairs', () => {
    const trie = new TernarySearchTrie<number>()
    trie.insert('hello', 1)
    trie.insert('world', 2)
    expect(trie.size()).toBe(2)
  })

  it('overwrites duplicate key', () => {
    const trie = new TernarySearchTrie<number>()
    trie.insert('key', 1)
    trie.insert('key', 2)
    expect(trie.size()).toBe(1)
    expect(trie.get('key')).toBe(2)
  })

  it('ignores empty string key', () => {
    const trie = new TernarySearchTrie<number>()
    trie.insert('', 1)
    expect(trie.size()).toBe(0)
  })
})

// ─── Has & Get ─────────────────────────────────────────
describe('TernarySearchTrie has and get', () => {
  it('has checks membership', () => {
    const trie = new TernarySearchTrie<number>()
    trie.insert('apple', 1)
    expect(trie.has('apple')).toBe(true)
    expect(trie.has('banana')).toBe(false)
  })

  it('get returns value', () => {
    const trie = new TernarySearchTrie<string>()
    trie.insert('key', 'value')
    expect(trie.get('key')).toBe('value')
  })

  it('get returns undefined for missing', () => {
    const trie = new TernarySearchTrie<number>()
    expect(trie.get('missing')).toBeUndefined()
  })

  it('has returns false for empty string', () => {
    const trie = new TernarySearchTrie<number>()
    expect(trie.has('')).toBe(false)
  })
})

// ─── Delete ────────────────────────────────────────────
describe('TernarySearchTrie delete', () => {
  it('deletes existing key', () => {
    const trie = new TernarySearchTrie<number>()
    trie.insert('apple', 1)
    trie.insert('banana', 2)
    expect(trie.delete('apple')).toBe(true)
    expect(trie.has('apple')).toBe(false)
    expect(trie.size()).toBe(1)
  })

  it('returns false for missing key', () => {
    const trie = new TernarySearchTrie<number>()
    expect(trie.delete('missing')).toBe(false)
  })

  it('returns false for empty string', () => {
    const trie = new TernarySearchTrie<number>()
    expect(trie.delete('')).toBe(false)
  })
})

// ─── Prefix Operations ─────────────────────────────────
describe('TernarySearchTrie prefix operations', () => {
  let trie: TernarySearchTrie<number>

  beforeEach(() => {
    trie = new TernarySearchTrie<number>()
    trie.insert('apple', 1)
    trie.insert('app', 2)
    trie.insert('application', 3)
    trie.insert('banana', 4)
  })

  it('keysWithPrefix returns matching keys', () => {
    const keys = trie.keysWithPrefix('app')
    expect(keys.sort()).toEqual(['app', 'apple', 'application'])
  })

  it('valuesWithPrefix returns matching values', () => {
    const vals = trie.valuesWithPrefix('app')
    expect(vals.sort()).toEqual([1, 2, 3])
  })

  it('entriesWithPrefix returns matching entries', () => {
    const entries = trie.entriesWithPrefix('app')
    expect(entries.length).toBe(3)
  })

  it('startsWith checks prefix existence', () => {
    expect(trie.startsWith('app')).toBe(true)
    expect(trie.startsWith('xyz')).toBe(false)
    expect(trie.startsWith('')).toBe(true)
  })
})

// ─── LongestPrefixOf ──────────────────────────────────
describe('TernarySearchTrie longestPrefixOf', () => {
  it('returns longest matching prefix key', () => {
    const trie = new TernarySearchTrie<number>()
    trie.insert('app', 1)
    trie.insert('apple', 2)
    expect(trie.longestPrefixOf('application')).toBe('app')
  })

  it('returns exact key when matched', () => {
    const trie = new TernarySearchTrie<number>()
    trie.insert('apple', 1)
    expect(trie.longestPrefixOf('apple')).toBe('apple')
  })

  it('returns empty when no match', () => {
    const trie = new TernarySearchTrie<number>()
    trie.insert('banana', 1)
    expect(trie.longestPrefixOf('cherry')).toBe('')
  })

  it('returns empty for empty query', () => {
    const trie = new TernarySearchTrie<number>()
    expect(trie.longestPrefixOf('')).toBe('')
  })
})

// ─── Keys, Values, Entries ─────────────────────────────
describe('TernarySearchTrie keys values entries', () => {
  it('keys returns all keys', () => {
    const trie = new TernarySearchTrie<number>()
    trie.insert('b', 2)
    trie.insert('a', 1)
    trie.insert('c', 3)
    expect(trie.keys().sort()).toEqual(['a', 'b', 'c'])
  })

  it('values returns all values', () => {
    const trie = new TernarySearchTrie<number>()
    trie.insert('a', 1)
    trie.insert('b', 2)
    expect(trie.values().sort()).toEqual([1, 2])
  })

  it('entries returns all entries', () => {
    const trie = new TernarySearchTrie<number>()
    trie.insert('x', 10)
    const entries = trie.entries()
    expect(entries).toEqual([['x', 10]])
  })
})

// ─── ForEach ───────────────────────────────────────────
describe('TernarySearchTrie forEach', () => {
  it('iterates all entries', () => {
    const trie = new TernarySearchTrie<number>()
    trie.insert('a', 1)
    trie.insert('b', 2)
    const result: Array<[string, number]> = []
    trie.forEach((v, k) => result.push([k, v]))
    expect(result.length).toBe(2)
  })
})

// ─── Clear ─────────────────────────────────────────────
describe('TernarySearchTrie clear', () => {
  it('clears the trie', () => {
    const trie = new TernarySearchTrie<number>()
    trie.insert('a', 1)
    trie.clear()
    expect(trie.size()).toBe(0)
    expect(trie.isEmpty()).toBe(true)
  })
})
