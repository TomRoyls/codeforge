import { BitmapTrie, DEFAULT_BITMAP_TRIE_OPTIONS } from '../src/core/bitmap-trie/bitmap-trie.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('BitmapTrie', () => {
  describe('constructor', () => {
    it('creates an empty trie with no arguments', () => {
      const trie = new BitmapTrie()
      expect(trie.size).toBe(0)
      expect(trie.isEmpty).toBe(true)
    })

    it('creates an empty trie with an empty options object', () => {
      const trie = new BitmapTrie({})
      expect(trie.size).toBe(0)
      expect(trie.isEmpty).toBe(true)
    })

    it('creates a trie with the default options', () => {
      const trie = new BitmapTrie(DEFAULT_BITMAP_TRIE_OPTIONS)
      expect(trie.size).toBe(0)
    })
  })

  // ─── insert / get ─────────────────────────────────────────────────────

  describe('insert and get', () => {
    it('inserts a single key and retrieves its value', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('abc', 42)
      expect(trie.get('abc')).toBe(42)
    })

    it('returns undefined for a key that was never inserted', () => {
      const trie = new BitmapTrie<number>()
      expect(trie.get('missing')).toBeUndefined()
    })

    it('stores string values', () => {
      const trie = new BitmapTrie<string>()
      trie.insert('hello', 'world')
      expect(trie.get('hello')).toBe('world')
    })

    it('stores object values', () => {
      const trie = new BitmapTrie<{ id: number }>()
      const obj = { id: 99 }
      trie.insert('key', obj)
      expect(trie.get('key')).toBe(obj)
    })

    it('stores null values', () => {
      const trie = new BitmapTrie<null>()
      trie.insert('nullkey', null)
      expect(trie.get('nullkey')).toBeNull()
    })

    it('stores undefined values', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('ukey', undefined)
      // value is explicitly set to undefined, isEnd is true
      expect(trie.has('ukey')).toBe(true)
      expect(trie.get('ukey')).toBeUndefined()
    })

    it('overwrites a value on duplicate insert without increasing size', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('dup', 1)
      expect(trie.size).toBe(1)
      trie.insert('dup', 2)
      expect(trie.size).toBe(1)
      expect(trie.get('dup')).toBe(2)
    })

    it('inserts multiple distinct keys', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('apple', 1)
      trie.insert('apricot', 2)
      trie.insert('banana', 3)
      expect(trie.size).toBe(3)
      expect(trie.get('apple')).toBe(1)
      expect(trie.get('apricot')).toBe(2)
      expect(trie.get('banana')).toBe(3)
    })

    it('inserts keys with shared prefixes', () => {
      const trie = new BitmapTrie<string>()
      trie.insert('car', 'vehicle')
      trie.insert('cart', 'shopping')
      trie.insert('care', 'concern')
      expect(trie.get('car')).toBe('vehicle')
      expect(trie.get('cart')).toBe('shopping')
      expect(trie.get('care')).toBe('concern')
    })

    it('inserts a single character key', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('a', 1)
      expect(trie.get('a')).toBe(1)
      expect(trie.size).toBe(1)
    })

    it('inserts a long key', () => {
      const trie = new BitmapTrie<number>()
      const longKey = 'abcdefghijklmnopqrstuvwxyz'
      trie.insert(longKey, 999)
      expect(trie.get(longKey)).toBe(999)
    })

    it('correctly distinguishes keys that are prefixes of each other', () => {
      const trie = new BitmapTrie<string>()
      trie.insert('a', 'single')
      trie.insert('ab', 'double')
      trie.insert('abc', 'triple')
      expect(trie.get('a')).toBe('single')
      expect(trie.get('ab')).toBe('double')
      expect(trie.get('abc')).toBe('triple')
      expect(trie.get('abcd')).toBeUndefined()
    })
  })

  // ─── has ──────────────────────────────────────────────────────────────

  describe('has', () => {
    it('returns true for an inserted key', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('test', 1)
      expect(trie.has('test')).toBe(true)
    })

    it('returns false for a key that was never inserted', () => {
      const trie = new BitmapTrie<number>()
      expect(trie.has('nope')).toBe(false)
    })

    it('returns false for a prefix of an inserted key that was not itself inserted', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('hello', 1)
      expect(trie.has('hell')).toBe(false)
      expect(trie.has('he')).toBe(false)
      expect(trie.has('h')).toBe(false)
    })

    it('returns false for a key that extends past an inserted key', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('hi', 1)
      expect(trie.has('hii')).toBe(false)
    })

    it('returns true after reinserting a deleted key', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('x', 1)
      trie.delete('x')
      expect(trie.has('x')).toBe(false)
      trie.insert('x', 2)
      expect(trie.has('x')).toBe(true)
    })
  })

  // ─── delete ───────────────────────────────────────────────────────────

  describe('delete', () => {
    it('removes an inserted key and returns true', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('del', 1)
      expect(trie.delete('del')).toBe(true)
      expect(trie.get('del')).toBeUndefined()
      expect(trie.size).toBe(0)
    })

    it('returns false when deleting a key that does not exist', () => {
      const trie = new BitmapTrie<number>()
      expect(trie.delete('nope')).toBe(false)
    })

    it('returns false when deleting a prefix of an existing key', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('abc', 1)
      expect(trie.delete('ab')).toBe(false)
      expect(trie.get('abc')).toBe(1)
    })

    it('returns false when deleting a key that extends past an existing key', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('ab', 1)
      expect(trie.delete('abc')).toBe(false)
      expect(trie.get('ab')).toBe(1)
    })

    it('decrements size on successful deletion', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('c', 3)
      expect(trie.size).toBe(3)
      trie.delete('b')
      expect(trie.size).toBe(2)
    })

    it('does not decrement size on failed deletion', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('a', 1)
      trie.delete('nonexistent')
      expect(trie.size).toBe(1)
    })

    it('allows reinsertion after deletion', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('z', 10)
      trie.delete('z')
      trie.insert('z', 20)
      expect(trie.get('z')).toBe(20)
      expect(trie.size).toBe(1)
    })

    it('prunes empty branches after deletion', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('xyz', 1)
      trie.delete('xyz')
      expect(trie.has('xyz')).toBe(false)
      expect(trie.has('xy')).toBe(false)
      expect(trie.isEmpty).toBe(true)
    })

    it('does not prune shared branches when deleting one key', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('abc', 1)
      trie.insert('abd', 2)
      trie.delete('abc')
      expect(trie.has('abc')).toBe(false)
      expect(trie.has('abd')).toBe(true)
      expect(trie.size).toBe(1)
    })

    it('deletes all keys and results in an empty trie', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('c', 3)
      trie.delete('a')
      trie.delete('b')
      trie.delete('c')
      expect(trie.size).toBe(0)
      expect(trie.isEmpty).toBe(true)
    })
  })

  // ─── size / isEmpty ───────────────────────────────────────────────────

  describe('size and isEmpty', () => {
    it('size is 0 for a new trie', () => {
      const trie = new BitmapTrie()
      expect(trie.size).toBe(0)
    })

    it('isEmpty is true for a new trie', () => {
      const trie = new BitmapTrie()
      expect(trie.isEmpty).toBe(true)
    })

    it('size increments with each unique insert', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('one', 1)
      expect(trie.size).toBe(1)
      trie.insert('two', 2)
      expect(trie.size).toBe(2)
      trie.insert('three', 3)
      expect(trie.size).toBe(3)
    })

    it('isEmpty becomes false after insert', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('key', 1)
      expect(trie.isEmpty).toBe(false)
    })

    it('size does not change when overwriting an existing key', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('same', 1)
      trie.insert('same', 2)
      expect(trie.size).toBe(1)
    })
  })

  // ─── clear ────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all entries', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('c', 3)
      trie.clear()
      expect(trie.size).toBe(0)
      expect(trie.isEmpty).toBe(true)
    })

    it('causes has to return false for previously inserted keys', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('hello', 1)
      trie.clear()
      expect(trie.has('hello')).toBe(false)
    })

    it('causes get to return undefined for previously inserted keys', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('hello', 42)
      trie.clear()
      expect(trie.get('hello')).toBeUndefined()
    })

    it('allows reuse after clearing', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('old', 1)
      trie.clear()
      trie.insert('new', 2)
      expect(trie.has('old')).toBe(false)
      expect(trie.get('new')).toBe(2)
      expect(trie.size).toBe(1)
    })
  })

  // ─── keys / values / entries ──────────────────────────────────────────

  describe('keys', () => {
    it('returns an empty array for an empty trie', () => {
      const trie = new BitmapTrie()
      expect(trie.keys()).toEqual([])
    })

    it('returns all inserted keys', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('cat', 1)
      trie.insert('car', 2)
      trie.insert('dog', 3)
      const k = trie.keys().sort()
      expect(k).toEqual(['car', 'cat', 'dog'])
    })

    it('returns keys in alphabetical order (depth-first, a-z)', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('z', 1)
      trie.insert('a', 2)
      trie.insert('m', 3)
      expect(trie.keys()).toEqual(['a', 'm', 'z'])
    })

    it('does not return keys after they are deleted', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.delete('a')
      expect(trie.keys()).toEqual(['b'])
    })
  })

  describe('values', () => {
    it('returns an empty array for an empty trie', () => {
      const trie = new BitmapTrie()
      expect(trie.values()).toEqual([])
    })

    it('returns all inserted values', () => {
      const trie = new BitmapTrie<string>()
      trie.insert('a', 'alpha')
      trie.insert('b', 'beta')
      const v = trie.values()
      expect(v).toContain('alpha')
      expect(v).toContain('beta')
    })

    it('returns values in key alphabetical order', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('c', 3)
      trie.insert('a', 1)
      trie.insert('b', 2)
      expect(trie.values()).toEqual([1, 2, 3])
    })
  })

  describe('entries', () => {
    it('returns an empty array for an empty trie', () => {
      const trie = new BitmapTrie()
      expect(trie.entries()).toEqual([])
    })

    it('returns all key-value pairs', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('c', 3)
      expect(trie.entries()).toEqual([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
    })

    it('reflects the latest value after overwrite', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('x', 10)
      trie.insert('x', 20)
      expect(trie.entries()).toEqual([['x', 20]])
    })
  })

  // ─── forEach ──────────────────────────────────────────────────────────

  describe('forEach', () => {
    it('does not call the callback for an empty trie', () => {
      const trie = new BitmapTrie()
      const fn = vi.fn()
      trie.forEach(fn)
      expect(fn).not.toHaveBeenCalled()
    })

    it('calls the callback for each entry', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('c', 3)
      const results: Array<[string, number]> = []
      trie.forEach((key, value) => {
        results.push([key, value])
      })
      expect(results).toEqual([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
    })
  })

  // ─── startsWith / keysWithPrefix ──────────────────────────────────────

  describe('startsWith', () => {
    it('returns an empty array when no keys match the prefix', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('abc', 1)
      expect(trie.startsWith('xyz')).toEqual([])
    })

    it('returns all keys starting with the given prefix', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('car', 1)
      trie.insert('cart', 2)
      trie.insert('care', 3)
      trie.insert('dog', 4)
      const result = trie.startsWith('car').sort()
      expect(result).toEqual(['car', 'care', 'cart'])
    })

    it('returns a single key when only one matches', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('hello', 1)
      trie.insert('world', 2)
      expect(trie.startsWith('he')).toEqual(['hello'])
    })

    it('returns all keys when prefix is empty string', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('c', 3)
      const result = trie.startsWith('')
      expect(result.sort()).toEqual(['a', 'b', 'c'])
    })

    it('returns the exact key if the prefix is the key itself', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('exact', 1)
      expect(trie.startsWith('exact')).toEqual(['exact'])
    })

    it('does not return keys from a different branch', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('ab', 1)
      trie.insert('ac', 2)
      trie.insert('bd', 3)
      expect(trie.startsWith('a').sort()).toEqual(['ab', 'ac'])
    })

    it('returns empty array for prefix that does not exist in trie', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('abc', 1)
      expect(trie.startsWith('d')).toEqual([])
    })
  })

  describe('keysWithPrefix', () => {
    it('is an alias for startsWith', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('apple', 1)
      trie.insert('application', 2)
      trie.insert('banana', 3)
      expect(trie.keysWithPrefix('app').sort()).toEqual(
        trie.startsWith('app').sort(),
      )
    })
  })

  // ─── longestPrefixOf ──────────────────────────────────────────────────

  describe('longestPrefixOf', () => {
    it('returns empty string when no prefix matches', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('abc', 1)
      expect(trie.longestPrefixOf('xyz')).toBe('')
    })

    it('returns the longest matching prefix key', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('a', 1)
      trie.insert('ab', 2)
      trie.insert('abc', 3)
      expect(trie.longestPrefixOf('abcdef')).toBe('abc')
    })

    it('returns the single matching prefix when only one exists', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('ab', 1)
      expect(trie.longestPrefixOf('abcd')).toBe('ab')
    })

    it('returns empty string for an empty trie', () => {
      const trie = new BitmapTrie<number>()
      expect(trie.longestPrefixOf('anything')).toBe('')
    })

    it('returns the exact key if the query equals a key', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('hello', 1)
      expect(trie.longestPrefixOf('hello')).toBe('hello')
    })

    it('skips non-terminal intermediate nodes', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('abc', 1)
      // 'a' and 'ab' are not inserted, so longestPrefixOf('abcd') is 'abc'
      expect(trie.longestPrefixOf('abcd')).toBe('abc')
    })
  })

  // ─── shortestPrefixOf ─────────────────────────────────────────────────

  describe('shortestPrefixOf', () => {
    it('returns empty string when no prefix matches', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('abc', 1)
      expect(trie.shortestPrefixOf('xyz')).toBe('')
    })

    it('returns the shortest matching prefix key', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('a', 1)
      trie.insert('ab', 2)
      trie.insert('abc', 3)
      expect(trie.shortestPrefixOf('abcdef')).toBe('a')
    })

    it('returns empty string for an empty trie', () => {
      const trie = new BitmapTrie<number>()
      expect(trie.shortestPrefixOf('anything')).toBe('')
    })

    it('returns the exact key if the query equals a key and it is the only one', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('hello', 1)
      expect(trie.shortestPrefixOf('hello')).toBe('hello')
    })

    it('returns empty string when only a non-matching longer key exists', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('abc', 1)
      expect(trie.shortestPrefixOf('ab')).toBe('')
    })
  })

  // ─── containsPrefix ───────────────────────────────────────────────────

  describe('containsPrefix', () => {
    it('returns true when the prefix is an inserted key', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('hello', 1)
      expect(trie.containsPrefix('hello')).toBe(true)
    })

    it('returns true when the prefix leads to children (partial path)', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('hello', 1)
      expect(trie.containsPrefix('he')).toBe(true)
      expect(trie.containsPrefix('hel')).toBe(true)
    })

    it('returns false when the prefix does not exist in the trie', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('abc', 1)
      expect(trie.containsPrefix('xyz')).toBe(false)
    })

    it('returns true for empty string prefix when trie is non-empty', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('a', 1)
      // root has children, so containsPrefix('') is true
      expect(trie.containsPrefix('')).toBe(true)
    })

    it('returns false for empty string prefix when trie is empty', () => {
      const trie = new BitmapTrie<number>()
      // root has no children and isEnd is false
      expect(trie.containsPrefix('')).toBe(false)
    })

    it('returns true for a prefix that is longer than any key', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('ab', 1)
      expect(trie.containsPrefix('abc')).toBe(false)
    })
  })

  // ─── Edge cases ───────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles empty string key insert', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('', 99)
      expect(trie.has('')).toBe(true)
      expect(trie.get('')).toBe(99)
      expect(trie.size).toBe(1)
    })

    it('handles deleting the empty string key', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('', 1)
      expect(trie.delete('')).toBe(true)
      expect(trie.has('')).toBe(false)
      expect(trie.size).toBe(0)
    })

    it('handles inserting many keys', () => {
      const trie = new BitmapTrie<number>()
      for (let i = 0; i < 100; i++) {
        trie.insert(`key${String(i).padStart(3, '0')}`, i)
      }
      expect(trie.size).toBe(100)
      expect(trie.get('key000')).toBe(0)
      expect(trie.get('key050')).toBe(50)
      expect(trie.get('key099')).toBe(99)
    })

    it('handles keys that share long common prefixes', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('abcdefghijklmnopqrstuvwxyz', 1)
      trie.insert('abcdefghijklmnopqrstuvwxzz', 2)
      expect(trie.get('abcdefghijklmnopqrstuvwxyz')).toBe(1)
      expect(trie.get('abcdefghijklmnopqrstuvwxzz')).toBe(2)
    })

    it('handles insertion after deletion of all keys', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('a', 1)
      trie.delete('a')
      expect(trie.isEmpty).toBe(true)
      trie.insert('b', 2)
      expect(trie.isEmpty).toBe(false)
      expect(trie.get('b')).toBe(2)
    })

    it('handles clear then reinsertion', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('x', 10)
      trie.insert('y', 20)
      trie.clear()
      expect(trie.size).toBe(0)
      trie.insert('z', 30)
      expect(trie.size).toBe(1)
      expect(trie.get('z')).toBe(30)
      expect(trie.get('x')).toBeUndefined()
    })

    it('handles startsWith after partial deletions', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('abc', 1)
      trie.insert('abd', 2)
      trie.insert('abe', 3)
      trie.delete('abd')
      const result = trie.startsWith('ab').sort()
      expect(result).toEqual(['abc', 'abe'])
    })

    it('handles longestPrefixOf with mixed insertions', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('a', 1)
      trie.insert('abc', 3)
      // 'ab' is not inserted, so longest prefix of 'abcdef' is 'abc'
      expect(trie.longestPrefixOf('abcdef')).toBe('abc')
    })

    it('handles entries after overwriting values', () => {
      const trie = new BitmapTrie<number>()
      trie.insert('k', 10)
      trie.insert('k', 20)
      trie.insert('k', 30)
      expect(trie.entries()).toEqual([['k', 30]])
      expect(trie.size).toBe(1)
    })

    it('handles all 26 single-character keys', () => {
      const trie = new BitmapTrie<number>()
      for (let i = 0; i < 26; i++) {
        trie.insert(String.fromCharCode(97 + i), i)
      }
      expect(trie.size).toBe(26)
      for (let i = 0; i < 26; i++) {
        const ch = String.fromCharCode(97 + i)
        expect(trie.get(ch)).toBe(i)
      }
    })

    it('handles keys that branch at different depths', () => {
      const trie = new BitmapTrie<string>()
      trie.insert('a', 'a')
      trie.insert('ab', 'ab')
      trie.insert('abc', 'abc')
      trie.insert('abcd', 'abcd')
      trie.insert('abcde', 'abcde')
      expect(trie.size).toBe(5)
      expect(trie.keys()).toEqual(['a', 'ab', 'abc', 'abcd', 'abcde'])
    })
  })
})
