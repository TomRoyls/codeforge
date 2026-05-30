import { describe, expect, it } from 'vitest'
import { AdaptiveTrie } from '../../../src/core/adaptive-trie/adaptive-trie.js'

describe('AdaptiveTrie', () => {
  it('creates empty trie', () => {
    const trie = new AdaptiveTrie()
    expect(trie.size).toBe(0)
  })

  it('creates empty trie with options', () => {
    const trie = new AdaptiveTrie({ pathCompression: true })
    expect(trie.size).toBe(0)
  })

  it('inserts single key', () => {
    const trie = new AdaptiveTrie()
    trie.insert('hello', 'world')
    expect(trie.size).toBe(1)
    expect(trie.get('hello')).toBe('world')
  })

  it('inserts and retrieves single key', () => {
    const trie = new AdaptiveTrie()
    trie.insert('test', 'value')
    expect(trie.get('test')).toBe('value')
  })

  it('returns undefined for non-existent key', () => {
    const trie = new AdaptiveTrie()
    expect(trie.get('missing')).toBeUndefined()
  })

  it('returns false for has on empty trie', () => {
    const trie = new AdaptiveTrie()
    expect(trie.has('missing')).toBe(false)
  })

  it('returns true for has on existing key', () => {
    const trie = new AdaptiveTrie()
    trie.insert('exists', 'value')
    expect(trie.has('exists')).toBe(true)
  })

  it('returns false for has on non-existent key', () => {
    const trie = new AdaptiveTrie()
    trie.insert('exists', 'value')
    expect(trie.has('missing')).toBe(false)
  })

  it('deletes non-existent key returns false', () => {
    const trie = new AdaptiveTrie()
    expect(trie.delete('missing')).toBe(false)
    expect(trie.size).toBe(0)
  })

  it('deletes existing key returns true', () => {
    const trie = new AdaptiveTrie()
    trie.insert('key', 'value')
    expect(trie.delete('key')).toBe(true)
    expect(trie.size).toBe(0)
  })

  it('deletes existing key reduces size', () => {
    const trie = new AdaptiveTrie()
    trie.insert('key1', 'value1')
    trie.insert('key2', 'value2')
    expect(trie.size).toBe(2)
    trie.delete('key1')
    expect(trie.size).toBe(1)
  })

  it('deletes and re-inserts key', () => {
    const trie = new AdaptiveTrie()
    trie.insert('key', 'value1')
    expect(trie.get('key')).toBe('value1')
    trie.delete('key')
    expect(trie.get('key')).toBeUndefined()
    trie.insert('key', 'value2')
    expect(trie.get('key')).toBe('value2')
  })

  it('overwrites existing key', () => {
    const trie = new AdaptiveTrie()
    trie.insert('key', 'value1')
    trie.insert('key', 'value2')
    expect(trie.size).toBe(1)
    expect(trie.get('key')).toBe('value2')
  })

  it('inserts multiple keys with common prefixes', () => {
    const trie = new AdaptiveTrie()
    trie.insert('hello', 'value1')
    trie.insert('helium', 'value2')
    trie.insert('help', 'value3')
    expect(trie.size).toBe(3)
    expect(trie.get('hello')).toBe('value1')
    expect(trie.get('helium')).toBe('value2')
    expect(trie.get('help')).toBe('value3')
  })

  it('inserts keys with no common prefix', () => {
    const trie = new AdaptiveTrie()
    trie.insert('apple', '1')
    trie.insert('banana', '2')
    trie.insert('cherry', '3')
    expect(trie.size).toBe(3)
    expect(trie.get('apple')).toBe('1')
    expect(trie.get('banana')).toBe('2')
    expect(trie.get('cherry')).toBe('3')
  })

  it('clear resets size', () => {
    const trie = new AdaptiveTrie()
    trie.insert('key1', 'value1')
    trie.insert('key2', 'value2')
    trie.clear()
    expect(trie.size).toBe(0)
  })

  it('clear resets all data', () => {
    const trie = new AdaptiveTrie()
    trie.insert('key1', 'value1')
    trie.insert('key2', 'value2')
    trie.clear()
    expect(trie.get('key1')).toBeUndefined()
    expect(trie.get('key2')).toBeUndefined()
  })

  it('keys returns empty array for empty trie', () => {
    const trie = new AdaptiveTrie()
    expect(trie.keys()).toEqual([])
  })

  it('keys returns all keys after inserts', () => {
    const trie = new AdaptiveTrie()
    trie.insert('a', '1')
    trie.insert('b', '2')
    trie.insert('c', '3')
    const keys = trie.keys()
    expect(keys).toContain('a')
    expect(keys).toContain('b')
    expect(keys).toContain('c')
  })

  it('values returns empty array for empty trie', () => {
    const trie = new AdaptiveTrie()
    expect(trie.values()).toEqual([])
  })

  it('values returns all values after inserts', () => {
    const trie = new AdaptiveTrie()
    trie.insert('a', '1')
    trie.insert('b', '2')
    trie.insert('c', '3')
    const values = trie.values()
    expect(values).toContain('1')
    expect(values).toContain('2')
    expect(values).toContain('3')
  })

  it('entries returns empty array for empty trie', () => {
    const trie = new AdaptiveTrie()
    expect(trie.entries()).toEqual([])
  })

  it('entries returns all entries after inserts', () => {
    const trie = new AdaptiveTrie()
    trie.insert('a', '1')
    trie.insert('b', '2')
    trie.insert('c', '3')
    const entries = trie.entries()
    expect(entries).toContainEqual(['a', '1'])
    expect(entries).toContainEqual(['b', '2'])
    expect(entries).toContainEqual(['c', '3'])
  })

  it('forEach iterates all entries', () => {
    const trie = new AdaptiveTrie()
    trie.insert('a', '1')
    trie.insert('b', '2')
    trie.insert('c', '3')
    const results: Array<[string, string]> = []
    trie.forEach((value, key) => {
      results.push([key, value])
    })
    expect(results.length).toBe(3)
    expect(results).toContainEqual(['a', '1'])
    expect(results).toContainEqual(['b', '2'])
    expect(results).toContainEqual(['c', '3'])
  })

  it('startsWith empty string returns all keys', () => {
    const trie = new AdaptiveTrie()
    trie.insert('a', '1')
    trie.insert('b', '2')
    trie.insert('c', '3')
    const keys = trie.startsWith('')
    expect(keys).toContain('a')
    expect(keys).toContain('b')
    expect(keys).toContain('c')
  })

  it('startsWith with matching prefix returns keys', () => {
    const trie = new AdaptiveTrie()
    trie.insert('hello', '1')
    trie.insert('help', '2')
    trie.insert('hi', '3')
    const keys = trie.startsWith('he')
    expect(keys).toContain('hello')
    expect(keys).toContain('help')
    expect(keys).not.toContain('hi')
  })

  it('startsWith with non-matching prefix returns empty', () => {
    const trie = new AdaptiveTrie()
    trie.insert('a', '1')
    trie.insert('b', '2')
    const keys = trie.startsWith('x')
    expect(keys).toEqual([])
  })

  it('startsWith with exact key match', () => {
    const trie = new AdaptiveTrie()
    trie.insert('hello', 'value')
    const keys = trie.startsWith('hello')
    expect(keys).toContain('hello')
  })

  it('longestPrefixOf returns longest matching prefix key', () => {
    const trie = new AdaptiveTrie()
    trie.insert('a', '1')
    trie.insert('ab', '2')
    trie.insert('abc', '3')
    expect(trie.longestPrefixOf('abcd')).toBe('abc')
  })

  it('longestPrefixOf with no match returns undefined', () => {
    const trie = new AdaptiveTrie()
    trie.insert('a', '1')
    expect(trie.longestPrefixOf('xyz')).toBeUndefined()
  })

  it('longestPrefixOf returns undefined for empty trie', () => {
    const trie = new AdaptiveTrie()
    expect(trie.longestPrefixOf('anything')).toBeUndefined()
  })

  it('nodeCount returns 0 for empty trie', () => {
    const trie = new AdaptiveTrie()
    expect(trie.nodeCount()).toBe(0)
  })

  it('nodeCount returns positive after inserts', () => {
    const trie = new AdaptiveTrie()
    trie.insert('a', '1')
    trie.insert('ab', '2')
    trie.insert('abc', '3')
    expect(trie.nodeCount()).toBeGreaterThan(0)
  })

  it('height returns 0 for empty trie', () => {
    const trie = new AdaptiveTrie()
    expect(trie.height()).toBe(0)
  })

  it('height returns positive after inserts', () => {
    const trie = new AdaptiveTrie()
    trie.insert('a', '1')
    trie.insert('ab', '2')
    trie.insert('abc', '3')
    expect(trie.height()).toBeGreaterThan(0)
  })

  it('handles large number of keys', () => {
    const trie = new AdaptiveTrie()
    for (let i = 0; i < 100; i++) {
      trie.insert(`key${i}`, `value${i}`)
    }
    expect(trie.size).toBe(100)
    expect(trie.get('key50')).toBe('value50')
  })

  it('handles keys with special characters', () => {
    const trie = new AdaptiveTrie()
    trie.insert('hello-world', '1')
    trie.insert('hello_world', '2')
    trie.insert('hello.world', '3')
    expect(trie.get('hello-world')).toBe('1')
    expect(trie.get('hello_world')).toBe('2')
    expect(trie.get('hello.world')).toBe('3')
  })

  it('handles unicode keys', () => {
    const trie = new AdaptiveTrie()
    trie.insert('café', '1')
    trie.insert('日本語', '2')
    trie.insert('😀', '3')
    expect(trie.get('café')).toBe('1')
    expect(trie.get('日本語')).toBe('2')
    expect(trie.get('😀')).toBe('3')
  })

  it('handles single character keys', () => {
    const trie = new AdaptiveTrie()
    trie.insert('a', '1')
    trie.insert('b', '2')
    trie.insert('c', '3')
    expect(trie.get('a')).toBe('1')
    expect(trie.get('b')).toBe('2')
    expect(trie.get('c')).toBe('3')
  })

  it('handles empty string key', () => {
    const trie = new AdaptiveTrie()
    trie.insert('', 'empty')
    expect(trie.get('')).toBe('empty')
    expect(trie.size).toBe(1)
  })

  it('deletes last key makes trie empty', () => {
    const trie = new AdaptiveTrie()
    trie.insert('only', 'value')
    trie.delete('only')
    expect(trie.size).toBe(0)
    expect(trie.keys()).toEqual([])
  })

  it('nodeCount and height change after operations', () => {
    const trie = new AdaptiveTrie()
    const initialNodes = trie.nodeCount()
    const initialHeight = trie.height()
    trie.insert('a', '1')
    trie.insert('ab', '2')
    expect(trie.nodeCount()).toBeGreaterThan(initialNodes)
    trie.delete('a')
    expect(trie.nodeCount()).toBeGreaterThan(0)
  })
})