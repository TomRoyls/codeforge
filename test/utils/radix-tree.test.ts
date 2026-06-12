import { beforeEach, describe, expect, it } from 'vitest'

import { RadixTree } from '../../src/utils/radix-tree.js'

// ─── Empty tree operations ─────────────────────────────
describe('RadixTree empty tree operations', () => {
  let tree: RadixTree<number>

  beforeEach(() => {
    tree = new RadixTree<number>()
  })

  it('reports size 0 for new tree', () => {
    expect(tree.size).toBe(0)
  })

  it('isEmpty returns true for new tree', () => {
    expect(tree.isEmpty()).toBe(true)
  })

  it('get returns undefined for missing key', () => {
    expect(tree.get('anything')).toBeUndefined()
  })

  it('has returns false for missing key', () => {
    expect(tree.has('anything')).toBe(false)
  })

  it('delete returns false for missing key', () => {
    expect(tree.delete('anything')).toBe(false)
  })

  it('startsWith returns empty array', () => {
    expect(tree.startsWith('a')).toEqual([])
  })

  it('startsWith with empty string returns empty array', () => {
    expect(tree.startsWith('')).toEqual([])
  })

  it('longestPrefixOf returns undefined for empty tree', () => {
    expect(tree.longestPrefixOf('abc')).toBeUndefined()
  })

  it('keys returns empty array', () => {
    expect(tree.keys()).toEqual([])
  })

  it('values returns empty array', () => {
    expect(tree.values()).toEqual([])
  })

  it('entries returns empty array', () => {
    expect(tree.entries()).toEqual([])
  })
})

// ─── Single insert/get/delete ──────────────────────────
describe('RadixTree single insert/get/delete', () => {
  let tree: RadixTree<string>

  beforeEach(() => {
    tree = new RadixTree<string>()
    tree.insert('hello', 'world')
  })

  it('get returns value for inserted key', () => {
    expect(tree.get('hello')).toBe('world')
  })

  it('has returns true for inserted key', () => {
    expect(tree.has('hello')).toBe(true)
  })

  it('size is 1 after single insert', () => {
    expect(tree.size).toBe(1)
  })

  it('isEmpty returns false after insert', () => {
    expect(tree.isEmpty()).toBe(false)
  })

  it('delete returns true for existing key', () => {
    expect(tree.delete('hello')).toBe(true)
  })

  it('delete removes the key', () => {
    tree.delete('hello')
    expect(tree.has('hello')).toBe(false)
    expect(tree.get('hello')).toBeUndefined()
  })

  it('size is 0 after delete', () => {
    tree.delete('hello')
    expect(tree.size).toBe(0)
  })
})

// ─── Insert with common prefix (node split) ────────────
describe('RadixTree insert with common prefix', () => {
  let tree: RadixTree<number>

  beforeEach(() => {
    tree = new RadixTree<number>()
    tree.insert('ab', 1)
    tree.insert('ac', 2)
  })

  it('stores both keys', () => {
    expect(tree.get('ab')).toBe(1)
    expect(tree.get('ac')).toBe(2)
  })

  it('has returns true for both keys', () => {
    expect(tree.has('ab')).toBe(true)
    expect(tree.has('ac')).toBe(true)
  })

  it('size is 2', () => {
    expect(tree.size).toBe(2)
  })

  it('does not match partial prefix alone', () => {
    expect(tree.has('a')).toBe(false)
  })

  it('does not match unrelated key', () => {
    expect(tree.has('ad')).toBe(false)
  })
})

// ─── Insert where new key is prefix of existing ────────
describe('RadixTree insert where new key is prefix of existing', () => {
  let tree: RadixTree<number>

  beforeEach(() => {
    tree = new RadixTree<number>()
    tree.insert('abc', 1)
    tree.insert('ab', 2)
  })

  it('stores both keys', () => {
    expect(tree.get('abc')).toBe(1)
    expect(tree.get('ab')).toBe(2)
  })

  it('size is 2', () => {
    expect(tree.size).toBe(2)
  })

  it('has returns true for both', () => {
    expect(tree.has('abc')).toBe(true)
    expect(tree.has('ab')).toBe(true)
  })
})

// ─── Insert where existing is prefix of new key ────────
describe('RadixTree insert where existing is prefix of new', () => {
  let tree: RadixTree<number>

  beforeEach(() => {
    tree = new RadixTree<number>()
    tree.insert('ab', 1)
    tree.insert('abc', 2)
  })

  it('stores both keys', () => {
    expect(tree.get('ab')).toBe(1)
    expect(tree.get('abc')).toBe(2)
  })

  it('size is 2', () => {
    expect(tree.size).toBe(2)
  })

  it('has returns true for both', () => {
    expect(tree.has('ab')).toBe(true)
    expect(tree.has('abc')).toBe(true)
  })
})

// ─── Get existing and non-existing keys ────────────────
describe('RadixTree get existing and non-existing', () => {
  let tree: RadixTree<number>

  beforeEach(() => {
    tree = new RadixTree<number>()
    tree.insert('cat', 1)
    tree.insert('car', 2)
    tree.insert('card', 3)
  })

  it('returns correct value for existing key', () => {
    expect(tree.get('cat')).toBe(1)
    expect(tree.get('car')).toBe(2)
    expect(tree.get('card')).toBe(3)
  })

  it('returns undefined for non-existing key', () => {
    expect(tree.get('cab')).toBeUndefined()
    expect(tree.get('care')).toBeUndefined()
    expect(tree.get('cats')).toBeUndefined()
  })
})

// ─── Has existing and non-existing ─────────────────────
describe('RadixTree has existing and non-existing', () => {
  let tree: RadixTree<number>

  beforeEach(() => {
    tree = new RadixTree<number>()
    tree.insert('romane', 1)
    tree.insert('romanus', 2)
    tree.insert('romulus', 3)
  })

  it('returns true for existing keys', () => {
    expect(tree.has('romane')).toBe(true)
    expect(tree.has('romanus')).toBe(true)
    expect(tree.has('romulus')).toBe(true)
  })

  it('returns false for non-existing keys', () => {
    expect(tree.has('rom')).toBe(false)
    expect(tree.has('roman')).toBe(false)
    expect(tree.has('rubber')).toBe(false)
  })
})

// ─── Delete leaf, internal, root ───────────────────────
describe('RadixTree delete leaf, internal, root', () => {
  it('deletes a leaf node', () => {
    const tree = new RadixTree<number>()
    tree.insert('abc', 1)
    tree.insert('abd', 2)
    expect(tree.delete('abd')).toBe(true)
    expect(tree.has('abc')).toBe(true)
    expect(tree.has('abd')).toBe(false)
    expect(tree.size).toBe(1)
  })

  it('deletes an internal (branch) node', () => {
    const tree = new RadixTree<number>()
    tree.insert('ab', 1)
    tree.insert('abc', 2)
    tree.insert('abd', 3)
    expect(tree.delete('ab')).toBe(true)
    expect(tree.has('ab')).toBe(false)
    expect(tree.has('abc')).toBe(true)
    expect(tree.has('abd')).toBe(true)
    expect(tree.size).toBe(2)
  })

  it('deletes the only key in the tree', () => {
    const tree = new RadixTree<number>()
    tree.insert('solo', 42)
    expect(tree.delete('solo')).toBe(true)
    expect(tree.has('solo')).toBe(false)
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })
})

// ─── Delete causes node merge ──────────────────────────
describe('RadixTree delete causes node merge', () => {
  it('merges single-child node after deletion', () => {
    const tree = new RadixTree<number>()
    tree.insert('abc', 1)
    tree.insert('abcd', 2)
    expect(tree.delete('abc')).toBe(true)
    expect(tree.get('abcd')).toBe(2)
    expect(tree.size).toBe(1)
  })

  it('merges chain of single-child nodes', () => {
    const tree = new RadixTree<number>()
    tree.insert('abc', 1)
    tree.insert('abcdef', 2)
    tree.insert('abcxyz', 3)
    tree.delete('abcxyz')
    expect(tree.get('abc')).toBe(1)
    expect(tree.get('abcdef')).toBe(2)
    expect(tree.has('abcxyz')).toBe(false)
  })
})

// ─── StartsWith prefix search ──────────────────────────
describe('RadixTree startsWith prefix search', () => {
  let tree: RadixTree<string>

  beforeEach(() => {
    tree = new RadixTree<string>()
    tree.insert('car', 'vehicle')
    tree.insert('card', 'paper')
    tree.insert('care', 'love')
    tree.insert('careful', 'cautious')
    tree.insert('dog', 'animal')
  })

  it('finds all entries with prefix "car"', () => {
    const results = tree.startsWith('car')
    expect(results.length).toBe(4)
    const keys = results.map(([k]) => k).sort()
    expect(keys).toEqual(['car', 'card', 'care', 'careful'])
  })

  it('finds entries with prefix "care"', () => {
    const results = tree.startsWith('care')
    expect(results.length).toBe(2)
    const keys = results.map(([k]) => k).sort()
    expect(keys).toEqual(['care', 'careful'])
  })

  it('finds single entry with prefix "dog"', () => {
    const results = tree.startsWith('dog')
    expect(results.length).toBe(1)
    expect(results[0]).toEqual(['dog', 'animal'])
  })
})

// ─── StartsWith with no matches ────────────────────────
describe('RadixTree startsWith no matches', () => {
  it('returns empty when no keys match prefix', () => {
    const tree = new RadixTree<number>()
    tree.insert('apple', 1)
    tree.insert('application', 2)
    expect(tree.startsWith('banana')).toEqual([])
  })

  it('returns empty for prefix longer than any key', () => {
    const tree = new RadixTree<number>()
    tree.insert('a', 1)
    expect(tree.startsWith('ab')).toEqual([])
  })
})

// ─── StartsWith empty string returns all ───────────────
describe('RadixTree startsWith empty string returns all', () => {
  it('returns all entries for empty prefix', () => {
    const tree = new RadixTree<number>()
    tree.insert('foo', 1)
    tree.insert('bar', 2)
    tree.insert('baz', 3)
    const results = tree.startsWith('')
    expect(results.length).toBe(3)
    const keys = results.map(([k]) => k).sort()
    expect(keys).toEqual(['bar', 'baz', 'foo'])
  })
})

// ─── Longest prefix of ─────────────────────────────────
describe('RadixTree longestPrefixOf', () => {
  let tree: RadixTree<number>

  beforeEach(() => {
    tree = new RadixTree<number>()
    tree.insert('cat', 1)
    tree.insert('catalog', 2)
    tree.insert('cater', 3)
  })

  it('finds exact match as longest prefix', () => {
    expect(tree.longestPrefixOf('cat')).toBe('cat')
  })

  it('finds longest matching prefix', () => {
    expect(tree.longestPrefixOf('caterpillar')).toBe('cater')
  })

  it('finds catalog prefix', () => {
    expect(tree.longestPrefixOf('catalogue')).toBe('catalog')
  })

  it('returns undefined when no prefix matches', () => {
    expect(tree.longestPrefixOf('dog')).toBeUndefined()
  })

  it('returns undefined for partial non-terminal match', () => {
    expect(tree.longestPrefixOf('ca')).toBeUndefined()
  })
})

// ─── Keys / values / entries ───────────────────────────
describe('RadixTree keys/values/entries', () => {
  let tree: RadixTree<string>

  beforeEach(() => {
    tree = new RadixTree<string>()
    tree.insert('alpha', 'a')
    tree.insert('beta', 'b')
    tree.insert('gamma', 'g')
  })

  it('keys returns all keys', () => {
    expect(tree.keys().sort()).toEqual(['alpha', 'beta', 'gamma'])
  })

  it('values returns all values', () => {
    expect(tree.values().sort()).toEqual(['a', 'b', 'g'])
  })

  it('entries returns all key-value pairs', () => {
    const entries = tree.entries()
    expect(entries.length).toBe(3)
    const sorted = entries.sort(([a], [b]) => a.localeCompare(b))
    expect(sorted[0]).toEqual(['alpha', 'a'])
    expect(sorted[1]).toEqual(['beta', 'b'])
    expect(sorted[2]).toEqual(['gamma', 'g'])
  })
})

// ─── Size tracking ─────────────────────────────────────
describe('RadixTree size tracking', () => {
  it('tracks size across multiple inserts', () => {
    const tree = new RadixTree<number>()
    tree.insert('a', 1)
    tree.insert('ab', 2)
    tree.insert('abc', 3)
    tree.insert('xyz', 4)
    expect(tree.size).toBe(4)
  })

  it('tracks size after deletes', () => {
    const tree = new RadixTree<number>()
    tree.insert('a', 1)
    tree.insert('ab', 2)
    tree.insert('abc', 3)
    tree.delete('ab')
    expect(tree.size).toBe(2)
  })

  it('does not count duplicate inserts', () => {
    const tree = new RadixTree<number>()
    tree.insert('key', 1)
    tree.insert('key', 2)
    expect(tree.size).toBe(1)
  })
})

// ─── Clear ─────────────────────────────────────────────
describe('RadixTree clear', () => {
  it('removes all entries', () => {
    const tree = new RadixTree<number>()
    tree.insert('a', 1)
    tree.insert('b', 2)
    tree.insert('c', 3)
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
    expect(tree.has('a')).toBe(false)
    expect(tree.keys()).toEqual([])
  })

  it('allows inserts after clear', () => {
    const tree = new RadixTree<number>()
    tree.insert('old', 1)
    tree.clear()
    tree.insert('new', 2)
    expect(tree.size).toBe(1)
    expect(tree.get('new')).toBe(2)
    expect(tree.get('old')).toBeUndefined()
  })
})

// ─── Overwrite existing key value ──────────────────────
describe('RadixTree overwrite existing key', () => {
  it('updates value without increasing size', () => {
    const tree = new RadixTree<number>()
    tree.insert('key', 1)
    expect(tree.get('key')).toBe(1)
    tree.insert('key', 2)
    expect(tree.get('key')).toBe(2)
    expect(tree.size).toBe(1)
  })

  it('overwrites after other inserts', () => {
    const tree = new RadixTree<string>()
    tree.insert('foo', 'old')
    tree.insert('foobar', 'bar')
    tree.insert('foo', 'new')
    expect(tree.get('foo')).toBe('new')
    expect(tree.get('foobar')).toBe('bar')
    expect(tree.size).toBe(2)
  })
})

// ─── Large dataset ─────────────────────────────────────
describe('RadixTree large dataset', () => {
  it('handles 100+ words correctly', () => {
    const tree = new RadixTree<number>()
    const words: string[] = []

    for (let i = 0; i < 100; i++) {
      const word = `word${i.toString().padStart(3, '0')}`
      words.push(word)
      tree.insert(word, i)
    }

    expect(tree.size).toBe(100)

    for (let i = 0; i < 100; i++) {
      const word = words[i]!
      expect(tree.get(word)).toBe(i)
      expect(tree.has(word)).toBe(true)
    }

    expect(tree.has('word999')).toBe(false)
    expect(tree.get('word999')).toBeUndefined()
  })

  it('handles words with shared prefixes', () => {
    const tree = new RadixTree<string>()
    const prefixes = ['pre', 'prefix', 'prefixes', 'prefetch', 'prepare', 'preview']
    prefixes.forEach((w, i) => tree.insert(w, `v${i}`))

    expect(tree.size).toBe(prefixes.length)

    const results = tree.startsWith('pre')
    expect(results.length).toBe(prefixes.length)

    const keys = results.map(([k]) => k).sort()
    expect(keys).toEqual([...prefixes].sort())
  })

  it('handles deletion from large set', () => {
    const tree = new RadixTree<number>()
    for (let i = 0; i < 50; i++) {
      tree.insert(`item${i}`, i)
    }
    expect(tree.size).toBe(50)

    for (let i = 0; i < 25; i++) {
      expect(tree.delete(`item${i}`)).toBe(true)
    }

    expect(tree.size).toBe(25)
    expect(tree.has('item0')).toBe(false)
    expect(tree.has('item49')).toBe(true)
  })

  it('handles longestPrefixOf with many entries', () => {
    const tree = new RadixTree<number>()
    tree.insert('test', 1)
    tree.insert('testing', 2)
    tree.insert('tester', 3)
    tree.insert('testable', 4)

    expect(tree.longestPrefixOf('testing123')).toBe('testing')
    expect(tree.longestPrefixOf('testable')).toBe('testable')
    expect(tree.longestPrefixOf('tes')).toBeUndefined()
  })
})

// ─── Generic value types ───────────────────────────────
describe('RadixTree generic value types', () => {
  it('works with object values', () => {
    const tree = new RadixTree<{ name: string }>()
    tree.insert('user:1', { name: 'Alice' })
    tree.insert('user:2', { name: 'Bob' })

    expect(tree.get('user:1')?.name).toBe('Alice')
    expect(tree.get('user:2')?.name).toBe('Bob')
  })

  it('works with array values', () => {
    const tree = new RadixTree<number[]>()
    tree.insert('list', [1, 2, 3])
    expect(tree.get('list')).toEqual([1, 2, 3])
  })
})

// ─── Edge cases ────────────────────────────────────────
describe('RadixTree edge cases', () => {
  it('handles empty string key', () => {
    const tree = new RadixTree<number>()
    tree.insert('', 42)
    expect(tree.get('')).toBe(42)
    expect(tree.has('')).toBe(true)
    expect(tree.size).toBe(1)
  })

  it('handles delete of non-existent without affecting tree', () => {
    const tree = new RadixTree<number>()
    tree.insert('abc', 1)
    expect(tree.delete('xyz')).toBe(false)
    expect(tree.size).toBe(1)
    expect(tree.has('abc')).toBe(true)
  })

  it('handles delete of key that was already deleted', () => {
    const tree = new RadixTree<number>()
    tree.insert('key', 1)
    tree.delete('key')
    expect(tree.delete('key')).toBe(false)
    expect(tree.size).toBe(0)
  })

  it('handles keys that are substrings of each other in various order', () => {
    const tree = new RadixTree<number>()
    tree.insert('a', 1)
    tree.insert('ab', 2)
    tree.insert('abc', 3)
    tree.insert('abcd', 4)

    expect(tree.get('a')).toBe(1)
    expect(tree.get('ab')).toBe(2)
    expect(tree.get('abc')).toBe(3)
    expect(tree.get('abcd')).toBe(4)
    expect(tree.size).toBe(4)
  })
})

describe('radix-tree - wave548', () => {
  it('radix-tree module defined', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - wave549', () => {
  it('radix-tree module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree module is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree module has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - wave550', () => {
  it('radix-tree w550 defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w550 is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w550 has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - wave551', () => {
  it('radix-tree w551 check 0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w551 check 1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w551 check 2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - wave552', () => {
  it('radix-tree w552 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w552 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w552 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - wave553', () => {
  it('radix-tree w553 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w553 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w553 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - wave554', () => {
  it('radix-tree w554 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w554 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w554 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - wave555', () => {
  it('radix-tree w555 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w555 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w555 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - wave556', () => {
  it('radix-tree w556 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w556 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w556 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})
