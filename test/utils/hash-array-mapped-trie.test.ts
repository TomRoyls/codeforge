import { describe, it, expect } from 'vitest'
import { HashArrayMappedTrie } from '../../src/utils/hash-array-mapped-trie.js'

describe('HashArrayMappedTrie', () => {
  it('creates empty trie', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    expect(trie.isEmpty).toBe(true)
    expect(trie.size).toBe(0)
  })

  it('creates trie from entries', () => {
    const trie = HashArrayMappedTrie.from([['a', 1], ['b', 2]])
    expect(trie.size).toBe(2)
    expect(trie.get('a')).toBe(1)
    expect(trie.get('b')).toBe(2)
  })

  it('creates trie from of method', () => {
    const trie = HashArrayMappedTrie.of(['a', 1], ['b', 2])
    expect(trie.size).toBe(2)
    expect(trie.get('a')).toBe(1)
  })

  it('gets existing value', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    const updated = trie.set('key', 42)
    expect(updated.get('key')).toBe(42)
  })

  it('gets undefined for missing key', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    expect(trie.get('missing')).toBeUndefined()
  })

  it('checks has for existing key', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    const updated = trie.set('key', 42)
    expect(updated.has('key')).toBe(true)
  })

  it('checks has for missing key', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    expect(trie.has('missing')).toBe(false)
  })

  it('sets new key', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    const updated = trie.set('a', 1)
    expect(updated.size).toBe(1)
    expect(updated.get('a')).toBe(1)
  })

  it('updates existing key', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    const first = trie.set('a', 1)
    const second = first.set('a', 2)
    expect(second.size).toBe(1)
    expect(second.get('a')).toBe(2)
    expect(first.get('a')).toBe(1)
  })

  it('returns same instance when setting same value', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    const first = trie.set('a', 1)
    const second = first.set('a', 1)
    expect(second).toBe(first)
  })

  it('deletes existing key', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    const withEntry = trie.set('a', 1)
    const deleted = withEntry.delete('a')
    expect(deleted.size).toBe(0)
    expect(deleted.get('a')).toBeUndefined()
  })

  it('returns same instance when deleting missing key', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    const deleted = trie.delete('missing')
    expect(deleted).toBe(trie)
  })

  it('deletes and decrements size', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    const withEntries = trie.set('a', 1).set('b', 2).set('c', 3)
    const deleted = withEntries.delete('b')
    expect(deleted.size).toBe(2)
    expect(deleted.get('b')).toBeUndefined()
    expect(deleted.get('a')).toBe(1)
    expect(deleted.get('c')).toBe(3)
  })

  it('iterates with forEach', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    const updated = trie.set('a', 1).set('b', 2)
    const results: Array<[string, number]> = []
    updated.forEach((value, key) => {
      results.push([key, value])
    })
    expect(results.length).toBe(2)
    expect(results).toContainEqual(['a', 1])
    expect(results).toContainEqual(['b', 2])
  })

  it('returns all keys', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    const updated = trie.set('a', 1).set('b', 2).set('c', 3)
    const keys = updated.keys()
    expect(keys.length).toBe(3)
    expect(keys).toContain('a')
    expect(keys).toContain('b')
    expect(keys).toContain('c')
  })

  it('returns all values', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    const updated = trie.set('a', 1).set('b', 2).set('c', 3)
    const values = updated.values()
    expect(values.length).toBe(3)
    expect(values).toContain(1)
    expect(values).toContain(2)
    expect(values).toContain(3)
  })

  it('returns all entries', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    const updated = trie.set('a', 1).set('b', 2)
    const entries = updated.entries()
    expect(entries.length).toBe(2)
    expect(entries).toContainEqual(['a', 1])
    expect(entries).toContainEqual(['b', 2])
  })

  it('converts to Map', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    const updated = trie.set('a', 1).set('b', 2)
    const map = updated.toMap()
    expect(map.get('a')).toBe(1)
    expect(map.get('b')).toBe(2)
  })

  it('merges with another trie', () => {
    const trie1 = HashArrayMappedTrie.empty<string, number>().set('a', 1).set('b', 2)
    const trie2 = HashArrayMappedTrie.empty<string, number>().set('c', 3).set('d', 4)
    const merged = trie1.merge(trie2)
    expect(merged.size).toBe(4)
    expect(merged.get('a')).toBe(1)
    expect(merged.get('c')).toBe(3)
  })

  it('merge overwrites existing keys', () => {
    const trie1 = HashArrayMappedTrie.empty<string, number>().set('a', 1).set('b', 2)
    const trie2 = HashArrayMappedTrie.empty<string, number>().set('b', 20).set('c', 3)
    const merged = trie1.merge(trie2)
    expect(merged.size).toBe(3)
    expect(merged.get('b')).toBe(20)
  })

  it('works with number keys', () => {
    const trie = HashArrayMappedTrie.empty<number, string>()
    const updated = trie.set(1, 'a').set(2, 'b')
    expect(updated.size).toBe(2)
    expect(updated.get(1)).toBe('a')
    expect(updated.get(2)).toBe('b')
  })

  it('works with symbol keys', () => {
    const trie = HashArrayMappedTrie.empty<symbol, number>()
    const sym = Symbol('test')
    const updated = trie.set(sym, 42)
    expect(updated.get(sym)).toBe(42)
  })

  it('handles hash collisions', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    const entries: Array<[string, number]> = []
    for (let i = 0; i < 100; i++) {
      entries.push([`key${i}`, i])
    }
    const updated = HashArrayMappedTrie.from(entries)
    expect(updated.size).toBe(100)
    expect(updated.get('key50')).toBe(50)
  })

  it('iterates with for-of', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    const updated = trie.set('a', 1).set('b', 2).set('c', 3)
    const results: Array<[string, number]> = []
    for (const entry of updated) {
      results.push(entry)
    }
    expect(results.length).toBe(3)
  })
})