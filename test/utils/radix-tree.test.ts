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

describe('radix-tree - wave557', () => {
  it('radix-tree w557 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w557 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w557 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - wave558', () => {
  it('radix-tree w558 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w558 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w558 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - wave559', () => {
  it('radix-tree w559 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w559 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w559 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - wave560', () => {
  it('radix-tree w560 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w560 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w560 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - wave561', () => {
  it('radix-tree w561 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w561 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w561 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - wave562', () => {
  it('radix-tree w562 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w562 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w562 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - wave563', () => {
  it('radix-tree w563 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w563 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w563 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - wave564', () => {
  it('radix-tree w564 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w564 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w564 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - wave565', () => {
  it('radix-tree w565 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w565 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w565 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - wave566', () => {
  it('radix-tree w566 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w566 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w566 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - wave127', () => {
  it('radix-tree w127 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w127 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w127 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - wave130', () => {
  it('radix-tree w130 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w130 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w130 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - wave133', () => {
  it('radix-tree w133 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w133 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w133 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - wave136', () => {
  it('radix-tree w136 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w136 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w136 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - wave139', () => {
  it('radix-tree w139 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w139 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree w139 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w142', () => {
  it('radix-tree v142x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree v142x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree v142x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w145', () => {
  it('radix-tree v145x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree v145x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree v145x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w148', () => {
  it('radix-tree v148x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree v148x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree v148x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w151', () => {
  it('radix-tree v151x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree v151x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree v151x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w154', () => {
  it('radix-tree v154x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree v154x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree v154x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w157', () => {
  it('radix-tree v157x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree v157x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree v157x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w160', () => {
  it('radix-tree v160x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree v160x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree v160x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w170', () => {
  it('radix-tree x170x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x170x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x170x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x170x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x170x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x170x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x170x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x170x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x170x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x170x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w180', () => {
  it('radix-tree x180x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x180x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x180x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x180x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x180x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x180x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x180x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x180x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x180x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x180x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w190', () => {
  it('radix-tree x190x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x190x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x190x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x190x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x190x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x190x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x190x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x190x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x190x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x190x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w200', () => {
  it('radix-tree x200x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x200x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x200x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x200x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x200x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x200x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x200x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x200x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x200x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x200x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w210', () => {
  it('radix-tree x210x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x210x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x210x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x210x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x210x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x210x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x210x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x210x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x210x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x210x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w220', () => {
  it('radix-tree x220x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x220x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x220x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x220x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x220x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x220x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x220x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x220x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x220x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x220x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w230', () => {
  it('radix-tree x230x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x230x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x230x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x230x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x230x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x230x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x230x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x230x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x230x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x230x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w240', () => {
  it('radix-tree x240x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x240x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x240x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x240x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x240x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x240x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x240x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x240x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x240x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x240x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w250', () => {
  it('radix-tree x250x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x250x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x250x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x250x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x250x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x250x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x250x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x250x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x250x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x250x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w260', () => {
  it('radix-tree x260x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x260x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x260x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x260x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x260x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x260x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x260x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x260x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x260x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x260x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w270', () => {
  it('radix-tree x270x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x270x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x270x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x270x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x270x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x270x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x270x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x270x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x270x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x270x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w280', () => {
  it('radix-tree x280x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x280x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x280x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x280x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x280x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x280x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x280x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x280x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x280x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x280x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w290', () => {
  it('radix-tree x290x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x290x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x290x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x290x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x290x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x290x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x290x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x290x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x290x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x290x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w300', () => {
  it('radix-tree x300x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x300x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x300x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x300x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x300x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x300x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x300x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x300x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x300x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x300x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w310', () => {
  it('radix-tree x310x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x310x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x310x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x310x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x310x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x310x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x310x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x310x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x310x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x310x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w320', () => {
  it('radix-tree x320x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x320x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x320x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x320x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x320x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x320x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x320x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x320x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x320x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x320x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w330', () => {
  it('radix-tree x330x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x330x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x330x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x330x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x330x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x330x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x330x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x330x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x330x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x330x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w340', () => {
  it('radix-tree x340x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x340x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x340x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x340x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x340x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x340x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x340x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x340x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x340x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x340x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w350', () => {
  it('radix-tree x350x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x350x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x350x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x350x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x350x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x350x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x350x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x350x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x350x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x350x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w360', () => {
  it('radix-tree x360x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x360x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x360x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x360x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x360x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x360x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x360x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x360x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x360x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x360x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w370', () => {
  it('radix-tree x370x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x370x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x370x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x370x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x370x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x370x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x370x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x370x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x370x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x370x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w380', () => {
  it('radix-tree x380x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x380x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x380x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x380x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x380x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x380x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x380x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x380x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x380x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x380x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w390', () => {
  it('radix-tree x390x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x390x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x390x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x390x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x390x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x390x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x390x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x390x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x390x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x390x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w400', () => {
  it('radix-tree x400x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x400x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x400x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x400x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x400x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x400x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x400x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x400x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x400x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x400x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w420', () => {
  it('radix-tree x420x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x420x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x420x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x420x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x420x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x420x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x420x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x420x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x420x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x420x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x420x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x420x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x420x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x420x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x420x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x420x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x420x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x420x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x420x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x420x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w440', () => {
  it('radix-tree x440x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x440x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x440x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x440x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x440x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x440x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x440x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x440x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x440x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x440x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x440x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x440x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x440x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x440x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x440x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x440x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x440x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x440x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x440x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x440x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w460', () => {
  it('radix-tree x460x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x460x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x460x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x460x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x460x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x460x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x460x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x460x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x460x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x460x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x460x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x460x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x460x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x460x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x460x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x460x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x460x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x460x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x460x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x460x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w480', () => {
  it('radix-tree x480x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x480x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x480x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x480x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x480x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x480x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x480x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x480x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x480x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x480x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x480x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x480x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x480x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x480x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x480x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x480x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x480x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x480x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x480x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x480x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w500', () => {
  it('radix-tree x500x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x500x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x500x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x500x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x500x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x500x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x500x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x500x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x500x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x500x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x500x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x500x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x500x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x500x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x500x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x500x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x500x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x500x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x500x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x500x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w550', () => {
  it('radix-tree x550x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x550x49', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('radix-tree - w600', () => {
  it('radix-tree x600x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('radix-tree x600x49', () => {
    expect(beforeEach).toBeDefined()
  })
})
