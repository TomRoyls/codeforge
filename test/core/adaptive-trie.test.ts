import { describe, it, expect } from 'vitest'
import { AdaptiveTrie } from '../../src/core/adaptive-trie/adaptive-trie.js'

describe('AdaptiveTrie', () => {
  describe('constructor', () => {
    it('creates an empty trie', () => {
      const trie = new AdaptiveTrie<string>()
      expect(trie.size).toBe(0)
    })

    it('creates a trie with options', () => {
      const trie = new AdaptiveTrie<string>({ pathCompression: true })
      expect(trie.size).toBe(0)
    })

    it('creates a trie without options', () => {
      const trie = new AdaptiveTrie<number>()
      expect(trie.size).toBe(0)
      expect(trie.height()).toBe(0)
      expect(trie.nodeCount()).toBe(0)
    })
  })

  describe('insert and get', () => {
    it('inserts a single key and retrieves it', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('hello', 1)
      expect(trie.get('hello')).toBe(1)
    })

    it('returns undefined for missing key', () => {
      const trie = new AdaptiveTrie<number>()
      expect(trie.get('missing')).toBeUndefined()
    })

    it('inserts multiple keys', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('c', 3)
      expect(trie.get('a')).toBe(1)
      expect(trie.get('b')).toBe(2)
      expect(trie.get('c')).toBe(3)
    })

    it('overwrites existing key', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('key', 1)
      trie.insert('key', 2)
      expect(trie.get('key')).toBe(2)
      expect(trie.size).toBe(1)
    })

    it('inserts key with empty string', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('', 42)
      expect(trie.get('')).toBe(42)
    })

    it('inserts single character keys', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('z', 26)
      expect(trie.get('a')).toBe(1)
      expect(trie.get('b')).toBe(2)
      expect(trie.get('z')).toBe(26)
    })

    it('inserts keys with shared prefix', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('abc', 1)
      trie.insert('abd', 2)
      trie.insert('ab', 3)
      expect(trie.get('abc')).toBe(1)
      expect(trie.get('abd')).toBe(2)
      expect(trie.get('ab')).toBe(3)
    })

    it('inserts sequential character keys', () => {
      const trie = new AdaptiveTrie<number>()
      for (let i = 0; i < 26; i++) {
        trie.insert(String.fromCharCode(97 + i), i)
      }
      for (let i = 0; i < 26; i++) {
        expect(trie.get(String.fromCharCode(97 + i))).toBe(i)
      }
    })

    it('inserts long keys', () => {
      const trie = new AdaptiveTrie<number>()
      const longKey = 'a'.repeat(1000)
      trie.insert(longKey, 99)
      expect(trie.get(longKey)).toBe(99)
    })

    it('inserts keys that are prefixes of each other', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('ab', 2)
      trie.insert('abc', 3)
      trie.insert('abcd', 4)
      expect(trie.get('a')).toBe(1)
      expect(trie.get('ab')).toBe(2)
      expect(trie.get('abc')).toBe(3)
      expect(trie.get('abcd')).toBe(4)
    })

    it('inserts keys with unicode characters', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('café', 1)
      trie.insert('naïve', 2)
      expect(trie.get('café')).toBe(1)
      expect(trie.get('naïve')).toBe(2)
    })

    it('inserts keys differing at first character', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('apple', 1)
      trie.insert('banana', 2)
      trie.insert('cherry', 3)
      expect(trie.get('apple')).toBe(1)
      expect(trie.get('banana')).toBe(2)
      expect(trie.get('cherry')).toBe(3)
    })

    it('handles numeric-like string keys', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('1', 1)
      trie.insert('10', 10)
      trie.insert('100', 100)
      trie.insert('2', 2)
      trie.insert('20', 20)
      expect(trie.get('1')).toBe(1)
      expect(trie.get('10')).toBe(10)
      expect(trie.get('100')).toBe(100)
      expect(trie.get('2')).toBe(2)
      expect(trie.get('20')).toBe(20)
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('key', 1)
      expect(trie.has('key')).toBe(true)
    })

    it('returns false for missing key', () => {
      const trie = new AdaptiveTrie<number>()
      expect(trie.has('key')).toBe(false)
    })

    it('returns false for partial key match', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('hello', 1)
      expect(trie.has('hell')).toBe(false)
      expect(trie.has('helloo')).toBe(false)
    })

    it('returns true for empty string key', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('', 0)
      expect(trie.has('')).toBe(true)
    })

    it('returns true after overwrite', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('k', 1)
      trie.insert('k', 2)
      expect(trie.has('k')).toBe(true)
    })
  })

  describe('delete', () => {
    it('deletes an existing key', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('key', 1)
      expect(trie.delete('key')).toBe(true)
      expect(trie.get('key')).toBeUndefined()
      expect(trie.size).toBe(0)
    })

    it('returns false for missing key', () => {
      const trie = new AdaptiveTrie<number>()
      expect(trie.delete('missing')).toBe(false)
    })

    it('returns false on empty trie', () => {
      const trie = new AdaptiveTrie<number>()
      expect(trie.delete('anything')).toBe(false)
    })

    it('deletes one key without affecting others', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('c', 3)
      expect(trie.delete('b')).toBe(true)
      expect(trie.get('a')).toBe(1)
      expect(trie.get('b')).toBeUndefined()
      expect(trie.get('c')).toBe(3)
      expect(trie.size).toBe(2)
    })

    it('deletes all keys one by one', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('c', 3)
      expect(trie.delete('a')).toBe(true)
      expect(trie.delete('b')).toBe(true)
      expect(trie.delete('c')).toBe(true)
      expect(trie.size).toBe(0)
    })

    it('deletes a key that is a prefix of another', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('ab', 1)
      trie.insert('abc', 2)
      expect(trie.delete('ab')).toBe(true)
      expect(trie.get('ab')).toBeUndefined()
      expect(trie.get('abc')).toBe(2)
    })

    it('deletes a key that has a prefix key', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('ab', 1)
      trie.insert('abc', 2)
      expect(trie.delete('abc')).toBe(true)
      expect(trie.get('ab')).toBe(1)
      expect(trie.get('abc')).toBeUndefined()
    })

    it('deletes empty string key', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('', 42)
      expect(trie.delete('')).toBe(true)
      expect(trie.get('')).toBeUndefined()
      expect(trie.size).toBe(0)
    })

    it('deletes and reinserts', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('key', 1)
      trie.delete('key')
      trie.insert('key', 2)
      expect(trie.get('key')).toBe(2)
      expect(trie.size).toBe(1)
    })

    it('handles deletion with path compression', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('abcd', 1)
      trie.insert('abce', 2)
      trie.delete('abce')
      expect(trie.get('abcd')).toBe(1)
      expect(trie.get('abce')).toBeUndefined()
    })
  })

  describe('size', () => {
    it('returns 0 for empty trie', () => {
      const trie = new AdaptiveTrie<number>()
      expect(trie.size).toBe(0)
    })

    it('returns 1 after single insert', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      expect(trie.size).toBe(1)
    })

    it('increments on new insert', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      expect(trie.size).toBe(2)
    })

    it('does not increment on overwrite', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('a', 2)
      expect(trie.size).toBe(1)
    })

    it('decrements on delete', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.delete('a')
      expect(trie.size).toBe(1)
    })

    it('resets on clear', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.clear()
      expect(trie.size).toBe(0)
    })
  })

  describe('clear', () => {
    it('clears an empty trie', () => {
      const trie = new AdaptiveTrie<number>()
      trie.clear()
      expect(trie.size).toBe(0)
    })

    it('clears all entries', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('c', 3)
      trie.clear()
      expect(trie.size).toBe(0)
      expect(trie.get('a')).toBeUndefined()
      expect(trie.get('b')).toBeUndefined()
      expect(trie.get('c')).toBeUndefined()
    })

    it('allows inserts after clear', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.clear()
      trie.insert('b', 2)
      expect(trie.size).toBe(1)
      expect(trie.get('b')).toBe(2)
    })
  })

  describe('keys', () => {
    it('returns empty array for empty trie', () => {
      const trie = new AdaptiveTrie<number>()
      expect(trie.keys()).toEqual([])
    })

    it('returns single key', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('hello', 1)
      expect(trie.keys()).toEqual(['hello'])
    })

    it('returns all keys', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('c', 3)
      const k = trie.keys()
      expect(k.sort()).toEqual(['a', 'b', 'c'])
    })

    it('returns keys with shared prefixes', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('ab', 1)
      trie.insert('abc', 2)
      trie.insert('abd', 3)
      const k = trie.keys().sort()
      expect(k).toEqual(['ab', 'abc', 'abd'])
    })
  })

  describe('values', () => {
    it('returns empty array for empty trie', () => {
      const trie = new AdaptiveTrie<number>()
      expect(trie.values()).toEqual([])
    })

    it('returns single value', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('key', 42)
      expect(trie.values()).toEqual([42])
    })

    it('returns all values', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('c', 3)
      const v = trie.values().sort()
      expect(v).toEqual([1, 2, 3])
    })
  })

  describe('entries', () => {
    it('returns empty array for empty trie', () => {
      const trie = new AdaptiveTrie<number>()
      expect(trie.entries()).toEqual([])
    })

    it('returns single entry', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('key', 42)
      expect(trie.entries()).toEqual([['key', 42]])
    })

    it('returns all entries', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      const e = trie.entries().sort((x, y) => x[0].localeCompare(y[0]))
      expect(e).toEqual([['a', 1], ['b', 2]])
    })
  })

  describe('forEach', () => {
    it('does nothing on empty trie', () => {
      const trie = new AdaptiveTrie<number>()
      let count = 0
      trie.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('iterates over single entry', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('key', 42)
      const collected: Array<[string, number]> = []
      trie.forEach((v, k) => collected.push([k, v]))
      expect(collected).toEqual([['key', 42]])
    })

    it('iterates over all entries', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('c', 3)
      const collected: Array<[string, number]> = []
      trie.forEach((v, k) => collected.push([k, v]))
      expect(collected.length).toBe(3)
      const sorted = collected.sort((x, y) => x[0].localeCompare(y[0]))
      expect(sorted).toEqual([['a', 1], ['b', 2], ['c', 3]])
    })
  })

  describe('startsWith', () => {
    it('returns empty for empty trie', () => {
      const trie = new AdaptiveTrie<number>()
      expect(trie.startsWith('a')).toEqual([])
    })

    it('returns all keys for empty prefix', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      const r = trie.startsWith('').sort()
      expect(r).toEqual(['a', 'b'])
    })

    it('finds keys with given prefix', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('apple', 1)
      trie.insert('application', 2)
      trie.insert('banana', 3)
      const r = trie.startsWith('app').sort()
      expect(r).toEqual(['apple', 'application'])
    })

    it('returns empty when no matches', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('apple', 1)
      expect(trie.startsWith('banana')).toEqual([])
    })

    it('finds exact match as prefix', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('abc', 1)
      trie.insert('abcd', 2)
      const r = trie.startsWith('abc').sort()
      expect(r).toEqual(['abc', 'abcd'])
    })

    it('handles single char prefix', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('ab', 1)
      trie.insert('ac', 2)
      trie.insert('bd', 3)
      const r = trie.startsWith('a').sort()
      expect(r).toEqual(['ab', 'ac'])
    })

    it('handles prefix longer than any key', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('ab', 1)
      expect(trie.startsWith('abcdef')).toEqual([])
    })

    it('finds prefix at shared node', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('test', 1)
      trie.insert('testing', 2)
      trie.insert('tester', 3)
      trie.insert('tea', 4)
      const r = trie.startsWith('te').sort()
      expect(r).toEqual(['tea', 'test', 'tester', 'testing'])
    })

    it('finds prefix matching full key', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('hello', 1)
      expect(trie.startsWith('hello')).toEqual(['hello'])
    })
  })

  describe('longestPrefixOf', () => {
    it('returns undefined for empty trie', () => {
      const trie = new AdaptiveTrie<number>()
      expect(trie.longestPrefixOf('anything')).toBeUndefined()
    })

    it('returns the key itself when exact match exists', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('hello', 1)
      expect(trie.longestPrefixOf('hello')).toBe('hello')
    })

    it('returns the longest matching prefix', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('he', 1)
      trie.insert('hello', 2)
      expect(trie.longestPrefixOf('hello')).toBe('hello')
    })

    it('returns shorter prefix when longer not in trie', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('he', 1)
      trie.insert('hel', 2)
      expect(trie.longestPrefixOf('hello')).toBe('hel')
    })

    it('returns undefined when no prefix matches', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('abc', 1)
      expect(trie.longestPrefixOf('xyz')).toBeUndefined()
    })

    it('handles empty string key', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('', 0)
      trie.insert('a', 1)
      expect(trie.longestPrefixOf('ab')).toBe('a')
    })

    it('handles single character prefixes', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('ab', 2)
      trie.insert('abc', 3)
      expect(trie.longestPrefixOf('abcd')).toBe('abc')
    })

    it('returns empty string for empty string key match', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('', 0)
      expect(trie.longestPrefixOf('abc')).toBe('')
    })
  })

  describe('nodeCount', () => {
    it('returns 0 for empty trie', () => {
      const trie = new AdaptiveTrie<number>()
      expect(trie.nodeCount()).toBe(0)
    })

    it('returns 1 for single key', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      expect(trie.nodeCount()).toBe(1)
    })

    it('returns correct count with multiple keys', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      expect(trie.nodeCount()).toBeGreaterThanOrEqual(1)
    })

    it('returns correct count with shared prefix', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('ab', 1)
      trie.insert('ac', 2)
      expect(trie.nodeCount()).toBeGreaterThanOrEqual(2)
    })

    it('updates after deletion', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      const before = trie.nodeCount()
      trie.delete('a')
      expect(trie.nodeCount()).toBeLessThanOrEqual(before)
    })
  })

  describe('height', () => {
    it('returns 0 for empty trie', () => {
      const trie = new AdaptiveTrie<number>()
      expect(trie.height()).toBe(0)
    })

    it('returns 1 for single key', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      expect(trie.height()).toBe(1)
    })

    it('returns correct height for branching', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('ab', 1)
      trie.insert('ac', 2)
      expect(trie.height()).toBeGreaterThanOrEqual(2)
    })

    it('height increases with deeper keys', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      const h1 = trie.height()
      trie.insert('ab', 2)
      const h2 = trie.height()
      expect(h2).toBeGreaterThanOrEqual(h1)
    })
  })

  describe('node type transitions', () => {
    it('stays as Node4 with up to 4 children', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('c', 3)
      trie.insert('d', 4)
      expect(trie.size).toBe(4)
      for (let i = 0; i < 4; i++) {
        expect(trie.get(String.fromCharCode(97 + i))).toBe(i + 1)
      }
    })

    it('transitions to Node16 at 5 children', () => {
      const trie = new AdaptiveTrie<number>()
      for (let i = 0; i < 5; i++) {
        trie.insert(String.fromCharCode(97 + i), i)
      }
      expect(trie.size).toBe(5)
      for (let i = 0; i < 5; i++) {
        expect(trie.get(String.fromCharCode(97 + i))).toBe(i)
      }
    })

    it('handles Node16 with up to 16 children', () => {
      const trie = new AdaptiveTrie<number>()
      for (let i = 0; i < 16; i++) {
        trie.insert(String.fromCharCode(97 + i), i)
      }
      expect(trie.size).toBe(16)
      for (let i = 0; i < 16; i++) {
        expect(trie.get(String.fromCharCode(97 + i))).toBe(i)
      }
    })

    it('transitions to Node48 at 17 children', () => {
      const trie = new AdaptiveTrie<number>()
      for (let i = 0; i < 17; i++) {
        trie.insert(String.fromCharCode(97 + i), i)
      }
      expect(trie.size).toBe(17)
      for (let i = 0; i < 17; i++) {
        expect(trie.get(String.fromCharCode(97 + i))).toBe(i)
      }
    })

    it('handles Node48 with up to 48 children', () => {
      const trie = new AdaptiveTrie<number>()
      for (let i = 0; i < 48; i++) {
        trie.insert(String.fromCharCode(32 + i), i)
      }
      expect(trie.size).toBe(48)
      for (let i = 0; i < 48; i++) {
        expect(trie.get(String.fromCharCode(32 + i))).toBe(i)
      }
    })

    it('transitions to Node256 at 49 children', () => {
      const trie = new AdaptiveTrie<number>()
      for (let i = 0; i < 49; i++) {
        trie.insert(String.fromCharCode(32 + i), i)
      }
      expect(trie.size).toBe(49)
      for (let i = 0; i < 49; i++) {
        expect(trie.get(String.fromCharCode(32 + i))).toBe(i)
      }
    })

    it('handles Node256 with many children', () => {
      const trie = new AdaptiveTrie<number>()
      for (let i = 0; i < 128; i++) {
        trie.insert(String.fromCharCode(i), i)
      }
      expect(trie.size).toBe(128)
      for (let i = 0; i < 128; i++) {
        expect(trie.get(String.fromCharCode(i))).toBe(i)
      }
    })

    it('shrinks back when children removed', () => {
      const trie = new AdaptiveTrie<number>()
      for (let i = 0; i < 20; i++) {
        trie.insert(String.fromCharCode(97 + i), i)
      }
      expect(trie.size).toBe(20)
      for (let i = 5; i < 20; i++) {
        trie.delete(String.fromCharCode(97 + i))
      }
      expect(trie.size).toBe(5)
      for (let i = 0; i < 5; i++) {
        expect(trie.get(String.fromCharCode(97 + i))).toBe(i)
      }
    })
  })

  describe('path compression', () => {
    it('compresses single-child path', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('abcdef', 1)
      expect(trie.nodeCount()).toBe(1)
    })

    it('compresses after deletion leaves single child', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('abc', 1)
      trie.insert('abd', 2)
      trie.delete('abd')
      expect(trie.nodeCount()).toBe(1)
      expect(trie.get('abc')).toBe(1)
    })

    it('splits compressed path on divergent insert', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('abcdef', 1)
      trie.insert('abcxyz', 2)
      expect(trie.get('abcdef')).toBe(1)
      expect(trie.get('abcxyz')).toBe(2)
    })

    it('handles insert at compressed node value', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('abcd', 1)
      trie.insert('ab', 2)
      expect(trie.get('abcd')).toBe(1)
      expect(trie.get('ab')).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('handles empty string key operations', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('', 42)
      expect(trie.get('')).toBe(42)
      expect(trie.has('')).toBe(true)
      expect(trie.delete('')).toBe(true)
      expect(trie.get('')).toBeUndefined()
    })

    it('handles single char keys', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('x', 1)
      expect(trie.get('x')).toBe(1)
      expect(trie.delete('x')).toBe(true)
      expect(trie.get('x')).toBeUndefined()
    })

    it('handles very long keys', () => {
      const trie = new AdaptiveTrie<number>()
      const long1 = 'a'.repeat(500) + 'b'
      const long2 = 'a'.repeat(500) + 'c'
      trie.insert(long1, 1)
      trie.insert(long2, 2)
      expect(trie.get(long1)).toBe(1)
      expect(trie.get(long2)).toBe(2)
    })

    it('handles keys that differ only at end', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('prefix_a', 1)
      trie.insert('prefix_b', 2)
      expect(trie.get('prefix_a')).toBe(1)
      expect(trie.get('prefix_b')).toBe(2)
    })

    it('handles keys that differ at start', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a_suffix', 1)
      trie.insert('b_suffix', 2)
      expect(trie.get('a_suffix')).toBe(1)
      expect(trie.get('b_suffix')).toBe(2)
    })

    it('handles insertion order independence', () => {
      const trie1 = new AdaptiveTrie<number>()
      trie1.insert('c', 3)
      trie1.insert('a', 1)
      trie1.insert('b', 2)

      const trie2 = new AdaptiveTrie<number>()
      trie2.insert('a', 1)
      trie2.insert('b', 2)
      trie2.insert('c', 3)

      expect(trie1.keys().sort()).toEqual(trie2.keys().sort())
    })

    it('handles overwriting with different value types', () => {
      const trie = new AdaptiveTrie<string | number>()
      trie.insert('key', 'string')
      expect(trie.get('key')).toBe('string')
      trie.insert('key', 42)
      expect(trie.get('key')).toBe(42)
    })

    it('handles undefined value', () => {
      const trie = new AdaptiveTrie<number | undefined>()
      trie.insert('key', undefined)
      expect(trie.has('key')).toBe(true)
      expect(trie.get('key')).toBeUndefined()
    })

    it('handles object values', () => {
      const trie = new AdaptiveTrie<{ id: number }>()
      trie.insert('a', { id: 1 })
      trie.insert('b', { id: 2 })
      expect(trie.get('a')!.id).toBe(1)
      expect(trie.get('b')!.id).toBe(2)
    })
  })

  describe('many keys', () => {
    it('handles 10000 keys', () => {
      const trie = new AdaptiveTrie<number>()
      const n = 10000
      for (let i = 0; i < n; i++) {
        trie.insert(`key_${i}`, i)
      }
      expect(trie.size).toBe(n)
      for (let i = 0; i < n; i += 100) {
        expect(trie.get(`key_${i}`)).toBe(i)
      }
    })

    it('handles 10000 sequential single chars', () => {
      const trie = new AdaptiveTrie<number>()
      const keys: string[] = []
      for (let i = 0; i < 1000; i++) {
        const key = `k${i}`
        trie.insert(key, i)
        keys.push(key)
      }
      expect(trie.size).toBe(1000)
      for (const key of keys) {
        expect(trie.has(key)).toBe(true)
      }
    })

    it('handles bulk insert and delete', () => {
      const trie = new AdaptiveTrie<number>()
      for (let i = 0; i < 500; i++) {
        trie.insert(`k${i}`, i)
      }
      expect(trie.size).toBe(500)
      for (let i = 0; i < 500; i++) {
        expect(trie.delete(`k${i}`)).toBe(true)
      }
      expect(trie.size).toBe(0)
    })

    it('handles 10000 random-style keys', () => {
      const trie = new AdaptiveTrie<number>()
      const keys = new Set<string>()
      for (let i = 0; i < 5000; i++) {
        const key = `user_${i}_data`
        keys.add(key)
        trie.insert(key, i)
      }
      expect(trie.size).toBe(5000)
      let found = 0
      keys.forEach(k => {
        if (trie.has(k)) found++
      })
      expect(found).toBe(5000)
    })
  })

  describe('iteration consistency', () => {
    it('keys and values have same length', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('ab', 2)
      trie.insert('abc', 3)
      expect(trie.keys().length).toBe(trie.values().length)
      expect(trie.keys().length).toBe(trie.entries().length)
    })

    it('forEach matches entries count', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('x', 1)
      trie.insert('xy', 2)
      trie.insert('xyz', 3)
      let count = 0
      trie.forEach(() => count++)
      expect(count).toBe(3)
    })

    it('entries are consistent with get', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('hello', 1)
      trie.insert('world', 2)
      const entries = trie.entries()
      for (const [key, value] of entries) {
        expect(trie.get(key)).toBe(value)
      }
    })
  })

  describe('prefix operations after modifications', () => {
    it('startsWith after deletion', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('test1', 1)
      trie.insert('test2', 2)
      trie.insert('test3', 3)
      trie.delete('test2')
      const r = trie.startsWith('test').sort()
      expect(r).toEqual(['test1', 'test3'])
    })

    it('longestPrefixOf after deletion', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('abc', 1)
      trie.insert('abcd', 2)
      trie.delete('abcd')
      expect(trie.longestPrefixOf('abcde')).toBe('abc')
    })

    it('startsWith after clear and reinsert', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('alpha', 1)
      trie.insert('beta', 2)
      trie.clear()
      trie.insert('alpha_new', 3)
      expect(trie.startsWith('alpha')).toEqual(['alpha_new'])
    })
  })

  describe('mixed operations', () => {
    it('insert, get, delete, insert cycle', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('key', 1)
      expect(trie.get('key')).toBe(1)
      trie.delete('key')
      expect(trie.get('key')).toBeUndefined()
      trie.insert('key', 2)
      expect(trie.get('key')).toBe(2)
      expect(trie.size).toBe(1)
    })

    it('multiple overwrites preserve size', () => {
      const trie = new AdaptiveTrie<number>()
      for (let i = 0; i < 10; i++) {
        trie.insert('key', i)
      }
      expect(trie.size).toBe(1)
      expect(trie.get('key')).toBe(9)
    })

    it('interleaved insert and delete', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.delete('a')
      trie.insert('c', 3)
      trie.insert('d', 4)
      trie.delete('b')
      expect(trie.size).toBe(2)
      expect(trie.get('c')).toBe(3)
      expect(trie.get('d')).toBe(4)
      expect(trie.get('a')).toBeUndefined()
      expect(trie.get('b')).toBeUndefined()
    })

    it('stress test with varied operations', () => {
      const trie = new AdaptiveTrie<number>()
      const reference = new Map<string, number>()

      for (let i = 0; i < 200; i++) {
        const key = `k${i % 50}`
        if (i % 3 === 0) {
          trie.delete(key)
          reference.delete(key)
        } else {
          trie.insert(key, i)
          reference.set(key, i)
        }
      }

      expect(trie.size).toBe(reference.size)
      reference.forEach((v, k) => {
        expect(trie.get(k)).toBe(v)
      })
    })
  })

  describe('startsWith edge cases', () => {
    it('prefix equals full key', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('abc', 1)
      expect(trie.startsWith('abc')).toEqual(['abc'])
    })

    it('prefix is empty string returns all', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      expect(trie.startsWith('').sort()).toEqual(['a', 'b'])
    })

    it('prefix longer than any key returns empty', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      expect(trie.startsWith('abcdef')).toEqual([])
    })

    it('single result for prefix search', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('abc', 1)
      trie.insert('xyz', 2)
      expect(trie.startsWith('ab')).toEqual(['abc'])
    })
  })

  describe('longestPrefixOf edge cases', () => {
    it('returns undefined for no match at all', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('xyz', 1)
      expect(trie.longestPrefixOf('abc')).toBeUndefined()
    })

    it('returns full key when query is exact match', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('hello', 1)
      expect(trie.longestPrefixOf('hello')).toBe('hello')
    })

    it('handles query shorter than any key', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('helloworld', 1)
      expect(trie.longestPrefixOf('he')).toBeUndefined()
    })
  })

  describe('generic value types', () => {
    it('works with string values', () => {
      const trie = new AdaptiveTrie<string>()
      trie.insert('a', 'hello')
      expect(trie.get('a')).toBe('hello')
    })

    it('works with boolean values', () => {
      const trie = new AdaptiveTrie<boolean>()
      trie.insert('true', true)
      trie.insert('false', false)
      expect(trie.get('true')).toBe(true)
      expect(trie.get('false')).toBe(false)
    })

    it('works with null values', () => {
      const trie = new AdaptiveTrie<string | null>()
      trie.insert('null', null)
      expect(trie.get('null')).toBeNull()
      expect(trie.has('null')).toBe(true)
    })

    it('works with array values', () => {
      const trie = new AdaptiveTrie<number[]>()
      trie.insert('list', [1, 2, 3])
      expect(trie.get('list')).toEqual([1, 2, 3])
    })
  })

  describe('deletion and node merging', () => {
    it('merges nodes after deletion leaves single child', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('abc', 1)
      trie.insert('abd', 2)
      trie.delete('abd')
      expect(trie.get('abc')).toBe(1)
      expect(trie.nodeCount()).toBe(1)
    })

    it('handles deletion that causes multiple shrinks', () => {
      const trie = new AdaptiveTrie<number>()
      for (let i = 0; i < 30; i++) {
        trie.insert(String.fromCharCode(97 + i), i)
      }
      for (let i = 10; i < 30; i++) {
        trie.delete(String.fromCharCode(97 + i))
      }
      expect(trie.size).toBe(10)
      for (let i = 0; i < 10; i++) {
        expect(trie.get(String.fromCharCode(97 + i))).toBe(i)
      }
    })

    it('handles deletion of all keys', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('c', 3)
      trie.delete('a')
      trie.delete('b')
      trie.delete('c')
      expect(trie.size).toBe(0)
      expect(trie.nodeCount()).toBe(0)
      expect(trie.height()).toBe(0)
    })
  })

  describe('complex tree structures', () => {
    it('handles deeply nested prefix tree', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('ab', 2)
      trie.insert('abc', 3)
      trie.insert('abcd', 4)
      trie.insert('abcde', 5)
      expect(trie.size).toBe(5)
      expect(trie.get('a')).toBe(1)
      expect(trie.get('ab')).toBe(2)
      expect(trie.get('abc')).toBe(3)
      expect(trie.get('abcd')).toBe(4)
      expect(trie.get('abcde')).toBe(5)
    })

    it('handles wide tree with many branches', () => {
      const trie = new AdaptiveTrie<number>()
      for (let i = 0; i < 100; i++) {
        trie.insert(`branch_${i}`, i)
      }
      expect(trie.size).toBe(100)
      expect(trie.startsWith('branch_').length).toBe(100)
    })

    it('handles mixed wide and deep', () => {
      const trie = new AdaptiveTrie<number>()
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          trie.insert(`${i}_${j}`, i * 10 + j)
        }
      }
      expect(trie.size).toBe(100)
      for (let i = 0; i < 10; i++) {
        expect(trie.startsWith(`${i}_`).length).toBe(10)
      }
    })
  })
})
