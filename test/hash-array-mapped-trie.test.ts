import { describe, it, expect } from 'vitest'
import { HashArrayMappedTrie } from '../src/core/hash-array-mapped-trie/index.js'

// ─── Construction ───

describe('HashArrayMappedTrie - Construction', () => {
  it('creates empty trie', () => {
    const trie = new HashArrayMappedTrie<string, number>()
    expect(trie.size).toBe(0)
    expect(trie.isEmpty()).toBe(true)
  })

  it('creates from entries', () => {
    const trie = new HashArrayMappedTrie<string, number>([['a', 1], ['b', 2]])
    expect(trie.size).toBe(2)
  })

  it('creates from iterable', () => {
    const map = new Map([['x', 10], ['y', 20]])
    const trie = new HashArrayMappedTrie(map)
    expect(trie.size).toBe(2)
  })

  it('empty() static creates empty trie', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    expect(trie.size).toBe(0)
  })

  it('from() static creates from entries', () => {
    const trie = HashArrayMappedTrie.from([['k', 'v']])
    expect(trie.size).toBe(1)
  })

  it('accepts custom hash function', () => {
    const customHash: (key: unknown) => number = (_key) => 42
    const trie = new HashArrayMappedTrie<string, number>([['a', 1]], { hash: customHash })
    expect(trie.get('a')).toBe(1)
  })
})

// ─── Set and Get ───

describe('HashArrayMappedTrie - Set and Get', () => {
  it('sets and gets a value', () => {
    const trie = new HashArrayMappedTrie<string, number>().set('k', 42)
    expect(trie.get('k')).toBe(42)
  })

  it('returns undefined for missing key', () => {
    const trie = new HashArrayMappedTrie<string, number>()
    expect(trie.get('missing')).toBeUndefined()
  })

  it('overwrites existing value', () => {
    const trie = new HashArrayMappedTrie<string, number>()
    const t1 = trie.set('k', 1)
    const t2 = t1.set('k', 2)
    expect(t2.get('k')).toBe(2)
    expect(t1.get('k')).toBe(1)
  })

  it('handles multiple keys', () => {
    let trie = new HashArrayMappedTrie<string, number>()
    trie = trie.set('a', 1).set('b', 2).set('c', 3)
    expect(trie.get('a')).toBe(1)
    expect(trie.get('b')).toBe(2)
    expect(trie.get('c')).toBe(3)
    expect(trie.size).toBe(3)
  })

  it('handles numeric keys', () => {
    let trie = new HashArrayMappedTrie<number, string>()
    trie = trie.set(1, 'one').set(2, 'two')
    expect(trie.get(1)).toBe('one')
    expect(trie.get(2)).toBe('two')
  })
})

// ─── Has ───

describe('HashArrayMappedTrie - Has', () => {
  it('returns true for existing key', () => {
    const trie = new HashArrayMappedTrie<string, number>().set('k', 1)
    expect(trie.has('k')).toBe(true)
  })

  it('returns false for missing key', () => {
    const trie = new HashArrayMappedTrie<string, number>()
    expect(trie.has('missing')).toBe(false)
  })
})

// ─── Delete ───

describe('HashArrayMappedTrie - Delete', () => {
  it('deletes existing key', () => {
    const trie = new HashArrayMappedTrie<string, number>().set('k', 1)
    const deleted = trie.delete('k')
    expect(deleted.has('k')).toBe(false)
    expect(deleted.size).toBe(0)
  })

  it('returns same trie for missing key', () => {
    const trie = new HashArrayMappedTrie<string, number>().set('k', 1)
    const deleted = trie.delete('missing')
    expect(deleted).toBe(trie)
  })

  it('deletes all entries', () => {
    let trie = new HashArrayMappedTrie<string, number>()
    trie = trie.set('a', 1).set('b', 2)
    trie = trie.delete('a').delete('b')
    expect(trie.isEmpty()).toBe(true)
  })
})

// ─── Keys, Values, Entries ───

describe('HashArrayMappedTrie - Keys, Values, Entries', () => {
  it('keys returns all keys', () => {
    const trie = new HashArrayMappedTrie([['a', 1], ['b', 2]])
    const keys = trie.keys()
    expect(keys.sort()).toEqual(['a', 'b'])
  })

  it('values returns all values', () => {
    const trie = new HashArrayMappedTrie([['a', 1], ['b', 2]])
    const values = trie.values()
    expect(values.sort()).toEqual([1, 2])
  })

  it('entries returns all pairs', () => {
    const trie = new HashArrayMappedTrie([['a', 1], ['b', 2]])
    expect(trie.entries().length).toBe(2)
  })

  it('toArray returns entries', () => {
    const trie = new HashArrayMappedTrie([['a', 1]])
    expect(trie.toArray()).toEqual(trie.entries())
  })
})

// ─── Iteration ───

describe('HashArrayMappedTrie - Iteration', () => {
  it('iterates with for-of', () => {
    const trie = new HashArrayMappedTrie([['a', 1], ['b', 2]])
    const pairs: [string, number][] = []
    for (const entry of trie) {
      pairs.push(entry)
    }
    expect(pairs.length).toBe(2)
  })

  it('forEach calls callback', () => {
    const trie = new HashArrayMappedTrie([['x', 10]])
    let called = false
    trie.forEach((v, k, t) => {
      called = true
      expect(k).toBe('x')
      expect(v).toBe(10)
    })
    expect(called).toBe(true)
  })
})

// ─── Map, Filter ───

describe('HashArrayMappedTrie - Map, Filter', () => {
  it('map transforms values', () => {
    const trie = new HashArrayMappedTrie([['a', 1], ['b', 2]])
    const mapped = trie.map((v) => v * 10)
    expect(mapped.get('a')).toBe(10)
    expect(mapped.get('b')).toBe(20)
  })

  it('filter keeps matching entries', () => {
    const trie = new HashArrayMappedTrie([['a', 1], ['b', 2], ['c', 3]])
    const filtered = trie.filter((v) => v > 1)
    expect(filtered.size).toBe(2)
    expect(filtered.has('a')).toBe(false)
  })
})

// ─── Merge ───

describe('HashArrayMappedTrie - Merge', () => {
  it('merges two tries', () => {
    const a = new HashArrayMappedTrie([['a', 1]])
    const b = new HashArrayMappedTrie([['b', 2]])
    const merged = a.merge(b)
    expect(merged.size).toBe(2)
  })

  it('right bias on conflict', () => {
    const a = new HashArrayMappedTrie([['k', 1]])
    const b = new HashArrayMappedTrie([['k', 2]])
    const merged = a.merge(b)
    expect(merged.get('k')).toBe(2)
  })
})

// ─── Clone ───

describe('HashArrayMappedTrie - Clone', () => {
  it('clones trie', () => {
    const trie = new HashArrayMappedTrie([['a', 1]])
    const cloned = trie.clone()
    expect(cloned.size).toBe(trie.size)
    expect(cloned.get('a')).toBe(1)
  })
})

// ─── Persistence ───

describe('HashArrayMappedTrie - Persistence', () => {
  it('set is immutable', () => {
    const original = new HashArrayMappedTrie<string, number>()
    const modified = original.set('k', 1)
    expect(original.get('k')).toBeUndefined()
    expect(modified.get('k')).toBe(1)
  })

  it('delete is immutable', () => {
    const original = new HashArrayMappedTrie<string, number>().set('k', 1)
    const deleted = original.delete('k')
    expect(original.get('k')).toBe(1)
    expect(deleted.get('k')).toBeUndefined()
  })
})
