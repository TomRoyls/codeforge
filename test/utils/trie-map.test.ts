import { describe, it, expect } from 'vitest'
import { TrieMap } from '../../src/utils/trie-map.js'

describe('TrieMap', () => {
  it('sets and gets values', () => {
    const trie = new TrieMap<number>()
    trie.set('abc', 1)
    expect(trie.get('abc')).toBe(1)
  })

  it('returns undefined for missing key', () => {
    const trie = new TrieMap<number>()
    expect(trie.get('abc')).toBeUndefined()
  })

  it('checks has correctly', () => {
    const trie = new TrieMap<number>()
    trie.set('abc', 1)
    expect(trie.has('abc')).toBe(true)
    expect(trie.has('ab')).toBe(false)
    expect(trie.has('abcd')).toBe(false)
  })

  it('tracks size', () => {
    const trie = new TrieMap<number>()
    expect(trie.size).toBe(0)
    trie.set('a', 1)
    trie.set('b', 2)
    trie.set('c', 3)
    expect(trie.size).toBe(3)
  })

  it('overwrites existing value without incrementing size', () => {
    const trie = new TrieMap<number>()
    trie.set('abc', 1)
    trie.set('abc', 2)
    expect(trie.size).toBe(1)
    expect(trie.get('abc')).toBe(2)
  })

  it('deletes keys', () => {
    const trie = new TrieMap<number>()
    trie.set('abc', 1)
    expect(trie.delete('abc')).toBe(true)
    expect(trie.has('abc')).toBe(false)
    expect(trie.size).toBe(0)
  })

  it('returns false when deleting missing key', () => {
    const trie = new TrieMap<number>()
    expect(trie.delete('abc')).toBe(false)
  })

  it('hasPrefix checks for prefix existence', () => {
    const trie = new TrieMap<number>()
    trie.set('hello', 1)
    expect(trie.hasPrefix('h')).toBe(true)
    expect(trie.hasPrefix('he')).toBe(true)
    expect(trie.hasPrefix('hello')).toBe(true)
    expect(trie.hasPrefix('helloo')).toBe(false)
  })

  it('keysWithPrefix returns matching keys', () => {
    const trie = new TrieMap<number>()
    trie.set('apple', 1)
    trie.set('application', 2)
    trie.set('banana', 3)
    expect(trie.keysWithPrefix('app')).toEqual(['apple', 'application'])
    expect(trie.keysWithPrefix('ban')).toEqual(['banana'])
    expect(trie.keysWithPrefix('xyz')).toEqual([])
  })

  it('valuesWithPrefix returns matching values', () => {
    const trie = new TrieMap<number>()
    trie.set('apple', 1)
    trie.set('application', 2)
    trie.set('banana', 3)
    expect(trie.valuesWithPrefix('app')).toEqual([1, 2])
  })

  it('entriesWithPrefix returns matching entries', () => {
    const trie = new TrieMap<number>()
    trie.set('car', 1)
    trie.set('cat', 2)
    trie.set('dog', 3)
    const entries = trie.entriesWithPrefix('ca')
    expect(entries).toEqual([['car', 1], ['cat', 2]])
  })

  it('longestPrefixOf returns longest matching prefix', () => {
    const trie = new TrieMap<number>()
    trie.set('a', 1)
    trie.set('ab', 2)
    trie.set('abc', 3)
    expect(trie.longestPrefixOf('abcd')).toBe('abc')
    expect(trie.longestPrefixOf('ab')).toBe('ab')
    expect(trie.longestPrefixOf('xyz')).toBe('')
  })

  it('clears all entries', () => {
    const trie = new TrieMap<number>()
    trie.set('a', 1)
    trie.set('b', 2)
    trie.clear()
    expect(trie.size).toBe(0)
    expect(trie.has('a')).toBe(false)
  })

  it('handles empty string key', () => {
    const trie = new TrieMap<number>()
    trie.set('', 42)
    expect(trie.get('')).toBe(42)
    expect(trie.has('')).toBe(true)
    expect(trie.size).toBe(1)
  })

  it('delete cleans up internal nodes', () => {
    const trie = new TrieMap<number>()
    trie.set('abc', 1)
    trie.set('abd', 2)
    trie.delete('abc')
    expect(trie.has('abc')).toBe(false)
    expect(trie.has('abd')).toBe(true)
    expect(trie.hasPrefix('ab')).toBe(true)
  })

  it('keysWithPrefix returns empty for empty trie', () => {
    const trie = new TrieMap<number>()
    expect(trie.keysWithPrefix('a')).toEqual([])
  })

  it('set and get basic', () => {
    const trie = new TrieMap<number>()
    trie.set('key', 42)
    expect(trie.get('key')).toBe(42)
    expect(trie.get('missing')).toBeUndefined()
  })

  it('has returns true for existing key', () => {
    const trie = new TrieMap<number>()
    trie.set('abc', 1)
    expect(trie.has('abc')).toBe(true)
    expect(trie.has('ab')).toBe(false)
  })

  it('get returns value for existing key', () => {
    const trie = new TrieMap<number>()
    trie.set('hello', 42)
    expect(trie.get('hello')).toBe(42)
  })

  it('get missing key returns undefined', () => {
    const trie = new TrieMap<number>()
    expect(trie.get('missing')).toBeUndefined()
  })

  it('has returns true for existing key', () => {
    const trie = new TrieMap<number>()
    trie.set('abc', 42)
    expect(trie.has('abc')).toBe(true)
  })

  it('has returns false for missing key', () => {
    const trie = new TrieMap<number>()
    expect(trie.has('xyz')).toBe(false)
  })

  it('set and get roundtrip', () => {
    const trie = new TrieMap<number>()
    trie.set('abc', 42)
    expect(trie.get('abc')).toBe(42)
  })
})
