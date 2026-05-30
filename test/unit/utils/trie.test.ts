import { describe, expect, it } from 'vitest'

import { Trie } from '../../../src/utils/trie.js'

describe('Trie', () => {
  it('inserts and retrieves a value', () => {
    const trie = new Trie<string>()
    trie.insert('hello', 'world')
    expect(trie.get('hello')).toBe('world')
  })

  it('returns undefined for missing key', () => {
    const trie = new Trie<string>()
    expect(trie.get('missing')).toBeUndefined()
  })

  it('has returns true for existing key', () => {
    const trie = new Trie<string>()
    trie.insert('test', 'value')
    expect(trie.has('test')).toBe(true)
  })

  it('has returns false for missing key', () => {
    const trie = new Trie<string>()
    expect(trie.has('test')).toBe(false)
  })

  it('has returns false for prefix that is not a key', () => {
    const trie = new Trie<string>()
    trie.insert('testing', 'value')
    expect(trie.has('test')).toBe(false)
  })

  it('overwrites existing key', () => {
    const trie = new Trie<string>()
    trie.insert('key', 'old')
    trie.insert('key', 'new')
    expect(trie.get('key')).toBe('new')
    expect(trie.size).toBe(1)
  })

  it('deletes a key', () => {
    const trie = new Trie<string>()
    trie.insert('hello', 'world')
    expect(trie.delete('hello')).toBe(true)
    expect(trie.get('hello')).toBeUndefined()
    expect(trie.size).toBe(0)
  })

  it('delete returns false for missing key', () => {
    const trie = new Trie<string>()
    expect(trie.delete('missing')).toBe(false)
  })

  it('tracks size correctly', () => {
    const trie = new Trie<number>()
    trie.insert('a', 1)
    trie.insert('ab', 2)
    trie.insert('abc', 3)
    expect(trie.size).toBe(3)
  })

  it('isEmpty returns true when empty', () => {
    const trie = new Trie<string>()
    expect(trie.isEmpty()).toBe(true)
    trie.insert('a', 'v')
    expect(trie.isEmpty()).toBe(false)
  })

  it('clear removes all entries', () => {
    const trie = new Trie<string>()
    trie.insert('a', '1')
    trie.insert('b', '2')
    trie.clear()
    expect(trie.size).toBe(0)
    expect(trie.isEmpty()).toBe(true)
  })

  it('startsWith returns all entries with prefix', () => {
    const trie = new Trie<number>()
    trie.insert('apple', 1)
    trie.insert('app', 2)
    trie.insert('application', 3)
    trie.insert('banana', 4)
    const results = trie.startsWith('app')
    expect(results).toHaveLength(3)
    const keys = results.map(([k]) => k)
    expect(keys).toContain('app')
    expect(keys).toContain('apple')
    expect(keys).toContain('application')
  })

  it('startsWith returns empty for missing prefix', () => {
    const trie = new Trie<string>()
    trie.insert('hello', 'world')
    expect(trie.startsWith('xyz')).toEqual([])
  })

  it('containsPrefix returns true for existing prefix', () => {
    const trie = new Trie<string>()
    trie.insert('testing', 'value')
    expect(trie.containsPrefix('test')).toBe(true)
    expect(trie.containsPrefix('t')).toBe(true)
  })

  it('containsPrefix returns false for missing prefix', () => {
    const trie = new Trie<string>()
    expect(trie.containsPrefix('abc')).toBe(false)
  })

  it('longestCommonPrefix returns common prefix', () => {
    const trie = new Trie<number>()
    trie.insert('abc', 1)
    trie.insert('abd', 2)
    trie.insert('abe', 3)
    expect(trie.longestCommonPrefix()).toBe('ab')
  })

  it('longestCommonPrefix returns empty for divergent roots', () => {
    const trie = new Trie<number>()
    trie.insert('abc', 1)
    trie.insert('xyz', 2)
    expect(trie.longestCommonPrefix()).toBe('')
  })

  it('keys returns all keys', () => {
    const trie = new Trie<number>()
    trie.insert('b', 2)
    trie.insert('a', 1)
    trie.insert('c', 3)
    const keys = trie.keys()
    expect(keys.sort()).toEqual(['a', 'b', 'c'])
  })

  it('values returns all values', () => {
    const trie = new Trie<number>()
    trie.insert('x', 10)
    trie.insert('y', 20)
    trie.insert('z', 30)
    const vals = trie.values()
    expect(vals.sort()).toEqual([10, 20, 30])
  })

  it('entries returns all key-value pairs', () => {
    const trie = new Trie<string>()
    trie.insert('a', '1')
    trie.insert('b', '2')
    const entries = trie.entries()
    expect(entries).toHaveLength(2)
  })

  it('autocomplete returns matching entries', () => {
    const trie = new Trie<string>()
    trie.insert('car', 'v1')
    trie.insert('card', 'v2')
    trie.insert('care', 'v3')
    trie.insert('careful', 'v4')
    const results = trie.autocomplete('car', 2)
    expect(results.length).toBeLessThanOrEqual(2)
  })

  it('autocomplete returns empty for no matches', () => {
    const trie = new Trie<string>()
    trie.insert('hello', 'world')
    expect(trie.autocomplete('xyz')).toEqual([])
  })

  it('handles empty string key', () => {
    const trie = new Trie<string>()
    trie.insert('', 'empty')
    expect(trie.get('')).toBe('empty')
    expect(trie.has('')).toBe(true)
  })

  it('handles single character keys', () => {
    const trie = new Trie<number>()
    trie.insert('a', 1)
    trie.insert('b', 2)
    trie.insert('c', 3)
    expect(trie.get('a')).toBe(1)
    expect(trie.get('b')).toBe(2)
  })

  it('delete cleans up orphaned nodes', () => {
    const trie = new Trie<string>()
    trie.insert('abc', 'value')
    trie.delete('abc')
    expect(trie.containsPrefix('a')).toBe(false)
    expect(trie.containsPrefix('ab')).toBe(false)
  })
})
