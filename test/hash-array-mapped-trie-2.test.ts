import { describe, it, expect } from 'vitest'
import { HashArrayMappedTrie2 } from '../src/core/hash-array-mapped-trie-2/index.js'

// ─── Construction ───

describe('HashArrayMappedTrie2 - Construction', () => {
  it('creates empty trie', () => {
    const trie = new HashArrayMappedTrie2<string, number>()
    expect(trie.size()).toBe(0)
    expect(trie.isEmpty()).toBe(true)
  })

  it('creates from entries', () => {
    const trie = new HashArrayMappedTrie2([['a', 1], ['b', 2]])
    expect(trie.size()).toBe(2)
  })

  it('empty() static creates empty trie', () => {
    const trie = HashArrayMappedTrie2.empty<string, number>()
    expect(trie.size()).toBe(0)
  })

  it('from() static creates from entries', () => {
    const trie = HashArrayMappedTrie2.from([['x', 10]])
    expect(trie.size()).toBe(1)
  })
})

// ─── Set and Get ───

describe('HashArrayMappedTrie2 - Set and Get', () => {
  it('sets and gets a value', () => {
    const trie = new HashArrayMappedTrie2<string, number>()
    const updated = trie.set('key', 42)
    expect(updated.get('key')).toBe(42)
  })

  it('returns undefined for missing key', () => {
    const trie = new HashArrayMappedTrie2<string, number>()
    expect(trie.get('missing')).toBeUndefined()
  })

  it('overwrites existing value', () => {
    const trie = new HashArrayMappedTrie2<string, number>()
    const t1 = trie.set('k', 1)
    const t2 = t1.set('k', 2)
    expect(t2.get('k')).toBe(2)
    expect(t1.get('k')).toBe(1)
  })

  it('handles multiple keys', () => {
    let trie = new HashArrayMappedTrie2<string, number>()
    trie = trie.set('a', 1).set('b', 2).set('c', 3)
    expect(trie.get('a')).toBe(1)
    expect(trie.get('b')).toBe(2)
    expect(trie.get('c')).toBe(3)
    expect(trie.size()).toBe(3)
  })
})

// ─── Has ───

describe('HashArrayMappedTrie2 - Has', () => {
  it('returns true for existing key', () => {
    const trie = new HashArrayMappedTrie2<string, number>().set('k', 1)
    expect(trie.has('k')).toBe(true)
  })

  it('returns false for missing key', () => {
    const trie = new HashArrayMappedTrie2<string, number>()
    expect(trie.has('missing')).toBe(false)
  })
})

// ─── Delete ───

describe('HashArrayMappedTrie2 - Delete', () => {
  it('deletes existing key', () => {
    const trie = new HashArrayMappedTrie2<string, number>().set('k', 1)
    const deleted = trie.delete('k')
    expect(deleted.has('k')).toBe(false)
    expect(deleted.size()).toBe(0)
  })

  it('returns same trie for missing key', () => {
    const trie = new HashArrayMappedTrie2<string, number>().set('k', 1)
    const deleted = trie.delete('missing')
    expect(deleted).toBe(trie)
  })

  it('handles deletion of all entries', () => {
    let trie = new HashArrayMappedTrie2<string, number>()
    trie = trie.set('a', 1).set('b', 2)
    trie = trie.delete('a').delete('b')
    expect(trie.isEmpty()).toBe(true)
  })
})

// ─── Keys, Values, Entries ───

describe('HashArrayMappedTrie2 - Keys, Values, Entries', () => {
  it('keys returns all keys', () => {
    const trie = new HashArrayMappedTrie2([['a', 1], ['b', 2]])
    const keys = trie.keys()
    expect(keys.sort()).toEqual(['a', 'b'])
  })

  it('values returns all values', () => {
    const trie = new HashArrayMappedTrie2([['a', 1], ['b', 2]])
    const values = trie.values()
    expect(values.sort()).toEqual([1, 2])
  })

  it('entries returns all pairs', () => {
    const trie = new HashArrayMappedTrie2([['a', 1], ['b', 2]])
    const entries = trie.entries()
    expect(entries.length).toBe(2)
  })

  it('empty trie returns empty arrays', () => {
    const trie = HashArrayMappedTrie2.empty<string, number>()
    expect(trie.keys()).toEqual([])
    expect(trie.values()).toEqual([])
    expect(trie.entries()).toEqual([])
  })
})

// ─── Iteration ───

describe('HashArrayMappedTrie2 - Iteration', () => {
  it('iterates with for-of', () => {
    const trie = new HashArrayMappedTrie2([['a', 1], ['b', 2]])
    const pairs: [string, number][] = []
    for (const entry of trie) {
      pairs.push(entry)
    }
    expect(pairs.length).toBe(2)
  })

  it('forEach calls callback', () => {
    const trie = new HashArrayMappedTrie2([['x', 10]])
    let called = false
    trie.forEach((v, k) => {
      called = true
      expect(k).toBe('x')
      expect(v).toBe(10)
    })
    expect(called).toBe(true)
  })
})

// ─── Map, Filter, Reduce ───

describe('HashArrayMappedTrie2 - Map, Filter, Reduce', () => {
  it('map transforms values', () => {
    const trie = new HashArrayMappedTrie2([['a', 1], ['b', 2]])
    const mapped = trie.map((v) => v * 10)
    expect(mapped.get('a')).toBe(10)
    expect(mapped.get('b')).toBe(20)
  })

  it('filter keeps matching entries', () => {
    const trie = new HashArrayMappedTrie2([['a', 1], ['b', 2], ['c', 3]])
    const filtered = trie.filter((v) => v > 1)
    expect(filtered.size()).toBe(2)
    expect(filtered.has('a')).toBe(false)
  })

  it('reduce aggregates', () => {
    const trie = new HashArrayMappedTrie2([['a', 1], ['b', 2], ['c', 3]])
    const sum = trie.reduce((acc, v) => acc + v, 0)
    expect(sum).toBe(6)
  })
})

// ─── Merge ───

describe('HashArrayMappedTrie2 - Merge', () => {
  it('merges two tries', () => {
    const a = new HashArrayMappedTrie2([['a', 1]])
    const b = new HashArrayMappedTrie2([['b', 2]])
    const merged = a.merge(b)
    expect(merged.size()).toBe(2)
    expect(merged.get('a')).toBe(1)
    expect(merged.get('b')).toBe(2)
  })

  it('overwrites with right bias', () => {
    const a = new HashArrayMappedTrie2([['k', 1]])
    const b = new HashArrayMappedTrie2([['k', 2]])
    const merged = a.merge(b)
    expect(merged.get('k')).toBe(2)
  })
})

// ─── Clone ───

describe('HashArrayMappedTrie2 - Clone', () => {
  it('clones trie', () => {
    const trie = new HashArrayMappedTrie2([['a', 1]])
    const cloned = trie.clone()
    expect(cloned.size()).toBe(trie.size())
    expect(cloned.get('a')).toBe(1)
  })
})

// ─── Persistence ───

describe('HashArrayMappedTrie2 - Persistence', () => {
  it('set returns new trie, original unchanged', () => {
    const original = new HashArrayMappedTrie2<string, number>()
    const modified = original.set('k', 1)
    expect(original.get('k')).toBeUndefined()
    expect(modified.get('k')).toBe(1)
  })

  it('delete returns new trie, original unchanged', () => {
    const original = new HashArrayMappedTrie2<string, number>().set('k', 1)
    const deleted = original.delete('k')
    expect(original.get('k')).toBe(1)
    expect(deleted.get('k')).toBeUndefined()
  })
})
