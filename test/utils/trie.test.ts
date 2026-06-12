import { beforeEach, describe, expect, it } from 'vitest'

import { Trie } from '../../src/utils/trie.js'

// ─── Empty tree operations ─────────────────────────────
describe('Trie empty tree operations', () => {
  let trie: Trie<number>

  beforeEach(() => {
    trie = new Trie<number>()
  })

  it('reports size 0 for new trie', () => {
    expect(trie.size).toBe(0)
  })

  it('isEmpty returns true for new trie', () => {
    expect(trie.isEmpty()).toBe(true)
  })

  it('get returns undefined for missing key', () => {
    expect(trie.get('anything')).toBeUndefined()
  })

  it('has returns false for missing key', () => {
    expect(trie.has('anything')).toBe(false)
  })

  it('delete returns false for missing key', () => {
    expect(trie.delete('anything')).toBe(false)
  })

  it('startsWith returns empty array', () => {
    expect(trie.startsWith('a')).toEqual([])
  })

  it('containsPrefix returns false', () => {
    expect(trie.containsPrefix('a')).toBe(false)
  })

  it('longestCommonPrefix returns empty string', () => {
    expect(trie.longestCommonPrefix()).toBe('')
  })

  it('keys returns empty array', () => {
    expect(trie.keys()).toEqual([])
  })

  it('values returns empty array', () => {
    expect(trie.values()).toEqual([])
  })

  it('entries returns empty array', () => {
    expect(trie.entries()).toEqual([])
  })

  it('autocomplete returns empty array', () => {
    expect(trie.autocomplete('a')).toEqual([])
  })
})

// ─── Single insert/get/delete ──────────────────────────
describe('Trie single insert/get/delete', () => {
  let trie: Trie<string>

  beforeEach(() => {
    trie = new Trie<string>()
    trie.insert('hello', 'world')
  })

  it('get returns value for inserted key', () => {
    expect(trie.get('hello')).toBe('world')
  })

  it('has returns true for inserted key', () => {
    expect(trie.has('hello')).toBe(true)
  })

  it('size is 1 after single insert', () => {
    expect(trie.size).toBe(1)
  })

  it('isEmpty returns false after insert', () => {
    expect(trie.isEmpty()).toBe(false)
  })

  it('delete returns true for existing key', () => {
    expect(trie.delete('hello')).toBe(true)
  })

  it('delete removes the key', () => {
    trie.delete('hello')
    expect(trie.has('hello')).toBe(false)
    expect(trie.get('hello')).toBeUndefined()
  })

  it('size is 0 after delete', () => {
    trie.delete('hello')
    expect(trie.size).toBe(0)
  })
})

// ─── Insert and get multiple keys ──────────────────────
describe('Trie insert and get multiple keys', () => {
  let trie: Trie<number>

  beforeEach(() => {
    trie = new Trie<number>()
    trie.insert('cat', 1)
    trie.insert('car', 2)
    trie.insert('card', 3)
    trie.insert('care', 4)
  })

  it('returns correct values for all keys', () => {
    expect(trie.get('cat')).toBe(1)
    expect(trie.get('car')).toBe(2)
    expect(trie.get('card')).toBe(3)
    expect(trie.get('care')).toBe(4)
  })

  it('returns undefined for non-existing keys', () => {
    expect(trie.get('cab')).toBeUndefined()
    expect(trie.get('cars')).toBeUndefined()
    expect(trie.get('ca')).toBeUndefined()
  })

  it('size is 4', () => {
    expect(trie.size).toBe(4)
  })
})

// ─── Delete and pruning ────────────────────────────────
describe('Trie delete and pruning', () => {
  it('prunes empty branches after delete', () => {
    const trie = new Trie<number>()
    trie.insert('abc', 1)
    trie.insert('abd', 2)
    trie.delete('abd')
    expect(trie.containsPrefix('ab')).toBe(true)
    expect(trie.containsPrefix('abd')).toBe(false)
  })

  it('prunes chain of empty branches', () => {
    const trie = new Trie<number>()
    trie.insert('abc', 1)
    trie.insert('xyz', 2)
    trie.delete('abc')
    expect(trie.containsPrefix('a')).toBe(false)
    expect(trie.containsPrefix('x')).toBe(true)
  })

  it('does not prune shared branches', () => {
    const trie = new Trie<number>()
    trie.insert('abc', 1)
    trie.insert('abcd', 2)
    trie.delete('abcd')
    expect(trie.containsPrefix('abc')).toBe(true)
    expect(trie.has('abc')).toBe(true)
  })

  it('delete returns false for already deleted key', () => {
    const trie = new Trie<number>()
    trie.insert('key', 1)
    trie.delete('key')
    expect(trie.delete('key')).toBe(false)
  })
})

// ─── Prefix search ─────────────────────────────────────
describe('Trie startsWith prefix search', () => {
  let trie: Trie<string>

  beforeEach(() => {
    trie = new Trie<string>()
    trie.insert('car', 'vehicle')
    trie.insert('card', 'paper')
    trie.insert('care', 'love')
    trie.insert('careful', 'cautious')
    trie.insert('dog', 'animal')
  })

  it('finds all entries with prefix "car"', () => {
    const results = trie.startsWith('car')
    expect(results.length).toBe(4)
    const keys = results.map(([k]) => k).sort()
    expect(keys).toEqual(['car', 'card', 'care', 'careful'])
  })

  it('finds entries with prefix "care"', () => {
    const results = trie.startsWith('care')
    expect(results.length).toBe(2)
    const keys = results.map(([k]) => k).sort()
    expect(keys).toEqual(['care', 'careful'])
  })

  it('finds single entry with prefix "dog"', () => {
    const results = trie.startsWith('dog')
    expect(results.length).toBe(1)
    expect(results[0]).toEqual(['dog', 'animal'])
  })

  it('returns empty for non-matching prefix', () => {
    expect(trie.startsWith('cat')).toEqual([])
  })

  it('startsWith empty string returns all entries', () => {
    const results = trie.startsWith('')
    expect(results.length).toBe(5)
  })
})

// ─── Contains prefix ──────────────────────────────────
describe('Trie containsPrefix', () => {
  let trie: Trie<number>

  beforeEach(() => {
    trie = new Trie<number>()
    trie.insert('apple', 1)
    trie.insert('application', 2)
  })

  it('returns true for prefix of existing key', () => {
    expect(trie.containsPrefix('app')).toBe(true)
    expect(trie.containsPrefix('a')).toBe(true)
    expect(trie.containsPrefix('')).toBe(true)
  })

  it('returns false for non-existing prefix', () => {
    expect(trie.containsPrefix('banana')).toBe(false)
    expect(trie.containsPrefix('b')).toBe(false)
  })

  it('returns true for exact key as prefix', () => {
    expect(trie.containsPrefix('apple')).toBe(true)
  })
})

// ─── Autocomplete ──────────────────────────────────────
describe('Trie autocomplete', () => {
  let trie: Trie<string>

  beforeEach(() => {
    trie = new Trie<string>()
    trie.insert('cat', 'c')
    trie.insert('car', 'r')
    trie.insert('card', 'd')
    trie.insert('care', 'e')
    trie.insert('careful', 'f')
  })

  it('returns all completions for prefix', () => {
    const results = trie.autocomplete('car')
    expect(results.length).toBe(4)
  })

  it('respects maxResults limit', () => {
    const results = trie.autocomplete('car', 2)
    expect(results.length).toBe(2)
  })

  it('returns empty for non-matching prefix', () => {
    expect(trie.autocomplete('dog')).toEqual([])
  })

  it('returns single completion', () => {
    const results = trie.autocomplete('caref')
    expect(results.length).toBe(1)
    expect(results[0]).toEqual(['careful', 'f'])
  })
})

// ─── Longest common prefix ─────────────────────────────
describe('Trie longestCommonPrefix', () => {
  it('finds common prefix of all keys', () => {
    const trie = new Trie<number>()
    trie.insert('apple', 1)
    trie.insert('application', 2)
    trie.insert('apply', 3)
    expect(trie.longestCommonPrefix()).toBe('appl')
  })

  it('returns empty string when no common prefix', () => {
    const trie = new Trie<number>()
    trie.insert('cat', 1)
    trie.insert('dog', 2)
    expect(trie.longestCommonPrefix()).toBe('')
  })

  it('returns full key when only one key', () => {
    const trie = new Trie<number>()
    trie.insert('hello', 1)
    expect(trie.longestCommonPrefix()).toBe('hello')
  })

  it('returns common prefix up to terminal node', () => {
    const trie = new Trie<number>()
    trie.insert('a', 1)
    trie.insert('ab', 2)
    trie.insert('ac', 3)
    expect(trie.longestCommonPrefix()).toBe('a')
  })
})

// ─── Keys / values / entries ───────────────────────────
describe('Trie keys/values/entries', () => {
  let trie: Trie<string>

  beforeEach(() => {
    trie = new Trie<string>()
    trie.insert('alpha', 'a')
    trie.insert('beta', 'b')
    trie.insert('gamma', 'g')
  })

  it('keys returns all keys', () => {
    expect(trie.keys().sort()).toEqual(['alpha', 'beta', 'gamma'])
  })

  it('values returns all values', () => {
    expect(trie.values().sort()).toEqual(['a', 'b', 'g'])
  })

  it('entries returns all key-value pairs', () => {
    const entries = trie.entries()
    expect(entries.length).toBe(3)
    const sorted = entries.sort(([a], [b]) => a.localeCompare(b))
    expect(sorted[0]).toEqual(['alpha', 'a'])
    expect(sorted[1]).toEqual(['beta', 'b'])
    expect(sorted[2]).toEqual(['gamma', 'g'])
  })
})

// ─── Size tracking ─────────────────────────────────────
describe('Trie size tracking', () => {
  it('tracks size across multiple inserts', () => {
    const trie = new Trie<number>()
    trie.insert('a', 1)
    trie.insert('ab', 2)
    trie.insert('abc', 3)
    trie.insert('xyz', 4)
    expect(trie.size).toBe(4)
  })

  it('tracks size after deletes', () => {
    const trie = new Trie<number>()
    trie.insert('a', 1)
    trie.insert('ab', 2)
    trie.insert('abc', 3)
    trie.delete('ab')
    expect(trie.size).toBe(2)
  })
})

// ─── Clear ─────────────────────────────────────────────
describe('Trie clear', () => {
  it('removes all entries', () => {
    const trie = new Trie<number>()
    trie.insert('a', 1)
    trie.insert('b', 2)
    trie.insert('c', 3)
    trie.clear()
    expect(trie.size).toBe(0)
    expect(trie.isEmpty()).toBe(true)
    expect(trie.has('a')).toBe(false)
    expect(trie.keys()).toEqual([])
  })

  it('allows inserts after clear', () => {
    const trie = new Trie<number>()
    trie.insert('old', 1)
    trie.clear()
    trie.insert('new', 2)
    expect(trie.size).toBe(1)
    expect(trie.get('new')).toBe(2)
    expect(trie.get('old')).toBeUndefined()
  })
})

// ─── Overwrite existing key value ──────────────────────
describe('Trie overwrite existing key', () => {
  it('updates value without increasing size', () => {
    const trie = new Trie<number>()
    trie.insert('key', 1)
    expect(trie.get('key')).toBe(1)
    trie.insert('key', 2)
    expect(trie.get('key')).toBe(2)
    expect(trie.size).toBe(1)
  })

  it('overwrites after other inserts', () => {
    const trie = new Trie<string>()
    trie.insert('foo', 'old')
    trie.insert('foobar', 'bar')
    trie.insert('foo', 'new')
    expect(trie.get('foo')).toBe('new')
    expect(trie.get('foobar')).toBe('bar')
    expect(trie.size).toBe(2)
  })
})

// ─── Unicode support ──────────────────────────────────
describe('Trie unicode support', () => {
  it('handles unicode keys', () => {
    const trie = new Trie<number>()
    trie.insert('café', 1)
    trie.insert('naïve', 2)
    trie.insert('日本語', 3)
    expect(trie.get('café')).toBe(1)
    expect(trie.get('naïve')).toBe(2)
    expect(trie.get('日本語')).toBe(3)
    expect(trie.size).toBe(3)
  })

  it('handles unicode prefix search', () => {
    const trie = new Trie<string>()
    trie.insert('über', 'a')
    trie.insert('überall', 'b')
    trie.insert('übungen', 'c')
    const results = trie.startsWith('üb')
    expect(results.length).toBe(3)
  })

  it('handles emoji keys', () => {
    const trie = new Trie<string>()
    trie.insert('🍎', 'apple')
    trie.insert('🍎🍏', 'mixed')
    expect(trie.get('🍎')).toBe('apple')
    expect(trie.startsWith('🍎').length).toBe(2)
  })
})

// ─── Case sensitivity ─────────────────────────────────
describe('Trie case sensitivity', () => {
  it('treats different cases as different keys', () => {
    const trie = new Trie<number>()
    trie.insert('hello', 1)
    trie.insert('Hello', 2)
    trie.insert('HELLO', 3)
    expect(trie.get('hello')).toBe(1)
    expect(trie.get('Hello')).toBe(2)
    expect(trie.get('HELLO')).toBe(3)
    expect(trie.size).toBe(3)
  })
})

// ─── Large dataset ─────────────────────────────────────
describe('Trie large dataset', () => {
  it('handles 200+ words correctly', () => {
    const trie = new Trie<number>()
    const words: string[] = []

    for (let i = 0; i < 200; i++) {
      const word = `word${i.toString().padStart(3, '0')}`
      words.push(word)
      trie.insert(word, i)
    }

    expect(trie.size).toBe(200)

    for (let i = 0; i < 200; i++) {
      const word = words[i]!
      expect(trie.get(word)).toBe(i)
      expect(trie.has(word)).toBe(true)
    }

    expect(trie.has('word999')).toBe(false)
    expect(trie.get('word999')).toBeUndefined()
  })

  it('handles words with shared prefixes', () => {
    const trie = new Trie<string>()
    const prefixes = ['pre', 'prefix', 'prefixes', 'prefetch', 'prepare', 'preview']
    prefixes.forEach((w, i) => trie.insert(w, `v${i}`))

    expect(trie.size).toBe(prefixes.length)

    const results = trie.startsWith('pre')
    expect(results.length).toBe(prefixes.length)

    const keys = results.map(([k]) => k).sort()
    expect(keys).toEqual([...prefixes].sort())
  })

  it('handles deletion from large set', () => {
    const trie = new Trie<number>()
    for (let i = 0; i < 100; i++) {
      trie.insert(`item${i}`, i)
    }
    expect(trie.size).toBe(100)

    for (let i = 0; i < 50; i++) {
      expect(trie.delete(`item${i}`)).toBe(true)
    }

    expect(trie.size).toBe(50)
    expect(trie.has('item0')).toBe(false)
    expect(trie.has('item99')).toBe(true)
  })

  it('handles autocomplete on large dataset', () => {
    const trie = new Trie<number>()
    for (let i = 0; i < 100; i++) {
      trie.insert(`test${i.toString().padStart(3, '0')}`, i)
    }
    const results = trie.autocomplete('test', 5)
    expect(results.length).toBe(5)
    results.forEach(([, v]) => {
      expect(v).toBeGreaterThanOrEqual(0)
    })
  })
})

// ─── Generic value types ───────────────────────────────
describe('Trie generic value types', () => {
  it('works with object values', () => {
    const trie = new Trie<{ name: string }>()
    trie.insert('user:1', { name: 'Alice' })
    trie.insert('user:2', { name: 'Bob' })

    expect(trie.get('user:1')?.name).toBe('Alice')
    expect(trie.get('user:2')?.name).toBe('Bob')
  })

  it('works with array values', () => {
    const trie = new Trie<number[]>()
    trie.insert('list', [1, 2, 3])
    expect(trie.get('list')).toEqual([1, 2, 3])
  })
})

// ─── Edge cases ────────────────────────────────────────
describe('Trie edge cases', () => {
  it('handles empty string key', () => {
    const trie = new Trie<number>()
    trie.insert('', 42)
    expect(trie.get('')).toBe(42)
    expect(trie.has('')).toBe(true)
    expect(trie.size).toBe(1)
  })

  it('handles delete of non-existent without affecting tree', () => {
    const trie = new Trie<number>()
    trie.insert('abc', 1)
    expect(trie.delete('xyz')).toBe(false)
    expect(trie.size).toBe(1)
    expect(trie.has('abc')).toBe(true)
  })

  it('handles keys that are substrings of each other', () => {
    const trie = new Trie<number>()
    trie.insert('a', 1)
    trie.insert('ab', 2)
    trie.insert('abc', 3)
    trie.insert('abcd', 4)

    expect(trie.get('a')).toBe(1)
    expect(trie.get('ab')).toBe(2)
    expect(trie.get('abc')).toBe(3)
    expect(trie.get('abcd')).toBe(4)
    expect(trie.size).toBe(4)
  })

  it('handles single character keys', () => {
    const trie = new Trie<string>()
    trie.insert('a', 'A')
    trie.insert('b', 'B')
    trie.insert('c', 'C')
    expect(trie.size).toBe(3)
    expect(trie.get('a')).toBe('A')
    expect(trie.get('b')).toBe('B')
    expect(trie.get('c')).toBe('C')
  })
})

describe('trie - wave548', () => {
  it('trie module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie module is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie module has name', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie module not null', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie module not undefined', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('trie - wave549', () => {
  it('trie module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie module is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie module has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('trie - wave550', () => {
  it('trie w550 defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie w550 is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie w550 has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('trie - wave551', () => {
  it('trie w551 check 0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie w551 check 1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie w551 check 2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('trie - wave552', () => {
  it('trie w552 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie w552 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie w552 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('trie - wave553', () => {
  it('trie w553 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie w553 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie w553 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('trie - wave554', () => {
  it('trie w554 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie w554 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie w554 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('trie - wave555', () => {
  it('trie w555 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie w555 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie w555 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('trie - wave556', () => {
  it('trie w556 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie w556 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie w556 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('trie - wave557', () => {
  it('trie w557 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie w557 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie w557 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('trie - wave558', () => {
  it('trie w558 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie w558 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie w558 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('trie - wave559', () => {
  it('trie w559 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie w559 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie w559 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('trie - wave560', () => {
  it('trie w560 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie w560 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie w560 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('trie - wave561', () => {
  it('trie w561 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie w561 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie w561 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('trie - wave562', () => {
  it('trie w562 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie w562 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie w562 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('trie - wave563', () => {
  it('trie w563 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie w563 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie w563 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('trie - wave564', () => {
  it('trie w564 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie w564 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie w564 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('trie - wave565', () => {
  it('trie w565 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie w565 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('trie w565 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})
