import { describe, it, expect } from 'vitest'
import { PathCompressionTrie } from '../../src/core/path-compression-trie/index.js'
import type { TrieNode, TrieEntry } from '../../src/core/path-compression-trie/index.js'

describe('PathCompressionTrie', () => {
  describe('constructor', () => {
    it('should create an empty trie', () => {
      const trie = new PathCompressionTrie()
      expect(trie.size).toBe(0)
    })

    it('should be empty after construction', () => {
      const trie = new PathCompressionTrie()
      expect(trie.isEmpty).toBe(true)
    })

    it('should create a typed trie', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('a', 1)
      expect(trie.search('a')).toBe(1)
    })

    it('should create a trie with string values', () => {
      const trie = new PathCompressionTrie<string>()
      trie.insert('key', 'value')
      expect(trie.search('key')).toBe('value')
    })

    it('should create a trie with object values', () => {
      const trie = new PathCompressionTrie<{ id: number }>()
      trie.insert('a', { id: 1 })
      expect(trie.search('a')).toEqual({ id: 1 })
    })
  })

  describe('insert', () => {
    it('should insert a single key', () => {
      const trie = new PathCompressionTrie()
      trie.insert('hello')
      expect(trie.size).toBe(1)
    })

    it('should return this for chaining', () => {
      const trie = new PathCompressionTrie()
      const result = trie.insert('a')
      expect(result).toBe(trie)
    })

    it('should insert multiple keys', () => {
      const trie = new PathCompressionTrie()
      trie.insert('a')
      trie.insert('b')
      trie.insert('c')
      expect(trie.size).toBe(3)
    })

    it('should insert key with value', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('key', 42)
      expect(trie.search('key')).toBe(42)
    })

    it('should overwrite existing key', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('key', 1)
      trie.insert('key', 2)
      expect(trie.size).toBe(1)
      expect(trie.search('key')).toBe(2)
    })

    it('should insert empty string key', () => {
      const trie = new PathCompressionTrie()
      trie.insert('')
      expect(trie.has('')).toBe(true)
      expect(trie.size).toBe(1)
    })

    it('should insert single character key', () => {
      const trie = new PathCompressionTrie()
      trie.insert('a')
      expect(trie.has('a')).toBe(true)
    })

    it('should insert key that is prefix of existing key', () => {
      const trie = new PathCompressionTrie()
      trie.insert('abc')
      trie.insert('ab')
      expect(trie.has('abc')).toBe(true)
      expect(trie.has('ab')).toBe(true)
      expect(trie.size).toBe(2)
    })

    it('should insert key that extends existing key', () => {
      const trie = new PathCompressionTrie()
      trie.insert('ab')
      trie.insert('abc')
      expect(trie.has('ab')).toBe(true)
      expect(trie.has('abc')).toBe(true)
    })

    it('should insert keys with common prefix', () => {
      const trie = new PathCompressionTrie()
      trie.insert('abc')
      trie.insert('abd')
      trie.insert('abe')
      expect(trie.size).toBe(3)
      expect(trie.has('abc')).toBe(true)
      expect(trie.has('abd')).toBe(true)
      expect(trie.has('abe')).toBe(true)
    })

    it('should insert keys with no common prefix', () => {
      const trie = new PathCompressionTrie()
      trie.insert('abc')
      trie.insert('xyz')
      expect(trie.size).toBe(2)
    })

    it('should insert long key', () => {
      const trie = new PathCompressionTrie()
      const longKey = 'a'.repeat(1000)
      trie.insert(longKey)
      expect(trie.has(longKey)).toBe(true)
    })

    it('should handle chaining multiple inserts', () => {
      const trie = new PathCompressionTrie()
      trie.insert('a').insert('b').insert('c')
      expect(trie.size).toBe(3)
    })

    it('should insert with undefined value', () => {
      const trie = new PathCompressionTrie()
      trie.insert('key', undefined)
      expect(trie.has('key')).toBe(true)
      expect(trie.search('key')).toBeUndefined()
    })

    it('should insert with null value', () => {
      const trie = new PathCompressionTrie<null>()
      trie.insert('key', null)
      expect(trie.search('key')).toBeNull()
    })

    it('should insert with zero value', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('key', 0)
      expect(trie.search('key')).toBe(0)
    })

    it('should insert with false value', () => {
      const trie = new PathCompressionTrie<boolean>()
      trie.insert('key', false)
      expect(trie.search('key')).toBe(false)
    })

    it('should insert with empty string value', () => {
      const trie = new PathCompressionTrie<string>()
      trie.insert('key', '')
      expect(trie.search('key')).toBe('')
    })
  })

  describe('search', () => {
    it('should return undefined for non-existent key', () => {
      const trie = new PathCompressionTrie()
      expect(trie.search('missing')).toBeUndefined()
    })

    it('should return value for existing key', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('key', 42)
      expect(trie.search('key')).toBe(42)
    })

    it('should return undefined for partial key match', () => {
      const trie = new PathCompressionTrie()
      trie.insert('abcdef')
      expect(trie.search('abc')).toBeUndefined()
    })

    it('should return undefined for key longer than stored', () => {
      const trie = new PathCompressionTrie()
      trie.insert('abc')
      expect(trie.search('abcdef')).toBeUndefined()
    })

    it('should return value for exact match', () => {
      const trie = new PathCompressionTrie<string>()
      trie.insert('hello', 'world')
      expect(trie.search('hello')).toBe('world')
    })

    it('should search empty string', () => {
      const trie = new PathCompressionTrie()
      trie.insert('', 'empty')
      expect(trie.search('')).toBe('empty')
    })

    it('should search after multiple inserts', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('c', 3)
      expect(trie.search('a')).toBe(1)
      expect(trie.search('b')).toBe(2)
      expect(trie.search('c')).toBe(3)
    })

    it('should return updated value after overwrite', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('key', 1)
      trie.insert('key', 2)
      expect(trie.search('key')).toBe(2)
    })

    it('should return undefined in empty trie', () => {
      const trie = new PathCompressionTrie()
      expect(trie.search('anything')).toBeUndefined()
    })

    it('should handle search for key sharing prefix', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('ab', 1)
      trie.insert('abc', 2)
      trie.insert('abcd', 3)
      expect(trie.search('ab')).toBe(1)
      expect(trie.search('abc')).toBe(2)
      expect(trie.search('abcd')).toBe(3)
      expect(trie.search('a')).toBeUndefined()
      expect(trie.search('abcde')).toBeUndefined()
    })
  })

  describe('has', () => {
    it('should return false for non-existent key', () => {
      const trie = new PathCompressionTrie()
      expect(trie.has('missing')).toBe(false)
    })

    it('should return true for existing key', () => {
      const trie = new PathCompressionTrie()
      trie.insert('key')
      expect(trie.has('key')).toBe(true)
    })

    it('should return false for partial match', () => {
      const trie = new PathCompressionTrie()
      trie.insert('abcdef')
      expect(trie.has('abc')).toBe(false)
    })

    it('should return false in empty trie', () => {
      const trie = new PathCompressionTrie()
      expect(trie.has('anything')).toBe(false)
    })

    it('should return true for empty string key', () => {
      const trie = new PathCompressionTrie()
      trie.insert('')
      expect(trie.has('')).toBe(true)
    })

    it('should return false for empty string when not inserted', () => {
      const trie = new PathCompressionTrie()
      trie.insert('a')
      expect(trie.has('')).toBe(false)
    })
  })

  describe('delete', () => {
    it('should delete existing key', () => {
      const trie = new PathCompressionTrie()
      trie.insert('key')
      expect(trie.delete('key')).toBe(true)
      expect(trie.has('key')).toBe(false)
    })

    it('should return false for non-existent key', () => {
      const trie = new PathCompressionTrie()
      expect(trie.delete('missing')).toBe(false)
    })

    it('should decrease size', () => {
      const trie = new PathCompressionTrie()
      trie.insert('a')
      trie.insert('b')
      trie.delete('a')
      expect(trie.size).toBe(1)
    })

    it('should not affect other keys', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.delete('a')
      expect(trie.has('b')).toBe(true)
      expect(trie.search('b')).toBe(2)
    })

    it('should delete empty string key', () => {
      const trie = new PathCompressionTrie()
      trie.insert('')
      expect(trie.delete('')).toBe(true)
      expect(trie.has('')).toBe(false)
    })

    it('should allow re-insertion after delete', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('key', 1)
      trie.delete('key')
      trie.insert('key', 2)
      expect(trie.search('key')).toBe(2)
    })

    it('should handle deleting prefix key', () => {
      const trie = new PathCompressionTrie()
      trie.insert('ab')
      trie.insert('abc')
      trie.delete('ab')
      expect(trie.has('ab')).toBe(false)
      expect(trie.has('abc')).toBe(true)
    })

    it('should handle deleting extension key', () => {
      const trie = new PathCompressionTrie()
      trie.insert('ab')
      trie.insert('abc')
      trie.delete('abc')
      expect(trie.has('ab')).toBe(true)
      expect(trie.has('abc')).toBe(false)
    })

    it('should handle delete with path compression', () => {
      const trie = new PathCompressionTrie()
      trie.insert('abc')
      trie.insert('abd')
      trie.delete('abc')
      expect(trie.has('abd')).toBe(true)
      expect(trie.has('abc')).toBe(false)
    })

    it('should delete all keys one by one', () => {
      const trie = new PathCompressionTrie()
      trie.insert('a')
      trie.insert('b')
      trie.insert('c')
      trie.delete('a')
      trie.delete('b')
      trie.delete('c')
      expect(trie.isEmpty).toBe(true)
    })

    it('should return false for second delete of same key', () => {
      const trie = new PathCompressionTrie()
      trie.insert('key')
      expect(trie.delete('key')).toBe(true)
      expect(trie.delete('key')).toBe(false)
    })

    it('should handle delete in empty trie', () => {
      const trie = new PathCompressionTrie()
      expect(trie.delete('anything')).toBe(false)
    })

    it('should compress path after delete of leaf', () => {
      const trie = new PathCompressionTrie()
      trie.insert('abc')
      trie.insert('abd')
      trie.delete('abc')
      expect(trie.has('abd')).toBe(true)
      expect(trie.size).toBe(1)
    })

    it('should handle deleting middle key in chain', () => {
      const trie = new PathCompressionTrie()
      trie.insert('a')
      trie.insert('ab')
      trie.insert('abc')
      trie.delete('ab')
      expect(trie.has('a')).toBe(true)
      expect(trie.has('abc')).toBe(true)
      expect(trie.has('ab')).toBe(false)
    })
  })

  describe('startsWith', () => {
    it('should return true for existing prefix', () => {
      const trie = new PathCompressionTrie()
      trie.insert('abcdef')
      expect(trie.startsWith('abc')).toBe(true)
    })

    it('should return true for exact match prefix', () => {
      const trie = new PathCompressionTrie()
      trie.insert('abc')
      expect(trie.startsWith('abc')).toBe(true)
    })

    it('should return false for non-existent prefix', () => {
      const trie = new PathCompressionTrie()
      trie.insert('abc')
      expect(trie.startsWith('xyz')).toBe(false)
    })

    it('should return true for empty prefix in non-empty trie', () => {
      const trie = new PathCompressionTrie()
      trie.insert('key')
      expect(trie.startsWith('')).toBe(true)
    })

    it('should return false for empty prefix in empty trie', () => {
      const trie = new PathCompressionTrie()
      expect(trie.startsWith('')).toBe(false)
    })

    it('should return true for single char prefix', () => {
      const trie = new PathCompressionTrie()
      trie.insert('abc')
      expect(trie.startsWith('a')).toBe(true)
    })

    it('should return true for prefix across multiple keys', () => {
      const trie = new PathCompressionTrie()
      trie.insert('abc')
      trie.insert('abd')
      trie.insert('abz')
      expect(trie.startsWith('ab')).toBe(true)
      expect(trie.startsWith('abc')).toBe(true)
      expect(trie.startsWith('aby')).toBe(false)
    })

    it('should return false for prefix longer than any key', () => {
      const trie = new PathCompressionTrie()
      trie.insert('ab')
      expect(trie.startsWith('abc')).toBe(false)
    })
  })

  describe('keysWithPrefix', () => {
    it('should return all keys with given prefix', () => {
      const trie = new PathCompressionTrie()
      trie.insert('abc')
      trie.insert('abd')
      trie.insert('abe')
      trie.insert('xyz')
      const keys = trie.keysWithPrefix('ab')
      expect(keys.sort()).toEqual(['abc', 'abd', 'abe'])
    })

    it('should return empty array for non-existent prefix', () => {
      const trie = new PathCompressionTrie()
      trie.insert('abc')
      expect(trie.keysWithPrefix('xyz')).toEqual([])
    })

    it('should return all keys for empty prefix', () => {
      const trie = new PathCompressionTrie()
      trie.insert('a')
      trie.insert('b')
      trie.insert('c')
      const keys = trie.keysWithPrefix('')
      expect(keys.sort()).toEqual(['a', 'b', 'c'])
    })

    it('should return empty array for empty trie', () => {
      const trie = new PathCompressionTrie()
      expect(trie.keysWithPrefix('')).toEqual([])
    })

    it('should return single key for unique prefix', () => {
      const trie = new PathCompressionTrie()
      trie.insert('abc')
      trie.insert('xyz')
      expect(trie.keysWithPrefix('abc')).toEqual(['abc'])
    })

    it('should include exact match in results', () => {
      const trie = new PathCompressionTrie()
      trie.insert('ab')
      trie.insert('abc')
      const keys = trie.keysWithPrefix('ab')
      expect(keys.sort()).toEqual(['ab', 'abc'])
    })

    it('should handle prefix matching compressed path', () => {
      const trie = new PathCompressionTrie()
      trie.insert('abcdefgh')
      trie.insert('abcdefij')
      const keys = trie.keysWithPrefix('abcdef')
      expect(keys.sort()).toEqual(['abcdefgh', 'abcdefij'])
    })

    it('should return empty string key for empty prefix', () => {
      const trie = new PathCompressionTrie()
      trie.insert('')
      trie.insert('a')
      const keys = trie.keysWithPrefix('')
      expect(keys.sort()).toEqual(['', 'a'])
    })

    it('should handle single character prefix', () => {
      const trie = new PathCompressionTrie()
      trie.insert('abc')
      trie.insert('ade')
      trie.insert('afg')
      trie.insert('xyz')
      const keys = trie.keysWithPrefix('a')
      expect(keys.sort()).toEqual(['abc', 'ade', 'afg'])
    })
  })

  describe('size', () => {
    it('should be 0 for empty trie', () => {
      const trie = new PathCompressionTrie()
      expect(trie.size).toBe(0)
    })

    it('should increase on insert', () => {
      const trie = new PathCompressionTrie()
      trie.insert('a')
      expect(trie.size).toBe(1)
      trie.insert('b')
      expect(trie.size).toBe(2)
    })

    it('should not increase on overwrite', () => {
      const trie = new PathCompressionTrie()
      trie.insert('a')
      trie.insert('a')
      expect(trie.size).toBe(1)
    })

    it('should decrease on delete', () => {
      const trie = new PathCompressionTrie()
      trie.insert('a')
      trie.insert('b')
      trie.delete('a')
      expect(trie.size).toBe(1)
    })

    it('should reset on clear', () => {
      const trie = new PathCompressionTrie()
      trie.insert('a')
      trie.insert('b')
      trie.clear()
      expect(trie.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should be true for new trie', () => {
      const trie = new PathCompressionTrie()
      expect(trie.isEmpty).toBe(true)
    })

    it('should be false after insert', () => {
      const trie = new PathCompressionTrie()
      trie.insert('key')
      expect(trie.isEmpty).toBe(false)
    })

    it('should be true after deleting all', () => {
      const trie = new PathCompressionTrie()
      trie.insert('key')
      trie.delete('key')
      expect(trie.isEmpty).toBe(true)
    })

    it('should be true after clear', () => {
      const trie = new PathCompressionTrie()
      trie.insert('key')
      trie.clear()
      expect(trie.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all entries', () => {
      const trie = new PathCompressionTrie()
      trie.insert('a')
      trie.insert('b')
      trie.insert('c')
      trie.clear()
      expect(trie.size).toBe(0)
      expect(trie.has('a')).toBe(false)
      expect(trie.has('b')).toBe(false)
      expect(trie.has('c')).toBe(false)
    })

    it('should allow re-insertion after clear', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('a', 1)
      trie.clear()
      trie.insert('a', 2)
      expect(trie.search('a')).toBe(2)
    })

    it('should clear empty string key', () => {
      const trie = new PathCompressionTrie()
      trie.insert('')
      trie.clear()
      expect(trie.has('')).toBe(false)
    })

    it('should work on already empty trie', () => {
      const trie = new PathCompressionTrie()
      trie.clear()
      expect(trie.size).toBe(0)
    })
  })

  describe('keys', () => {
    it('should return empty iterator for empty trie', () => {
      const trie = new PathCompressionTrie()
      expect([...trie.keys()]).toEqual([])
    })

    it('should return all keys', () => {
      const trie = new PathCompressionTrie()
      trie.insert('a')
      trie.insert('b')
      trie.insert('c')
      expect([...trie.keys()].sort()).toEqual(['a', 'b', 'c'])
    })

    it('should include empty string key', () => {
      const trie = new PathCompressionTrie()
      trie.insert('')
      trie.insert('a')
      expect([...trie.keys()].sort()).toEqual(['', 'a'])
    })

    it('should reflect deletions', () => {
      const trie = new PathCompressionTrie()
      trie.insert('a')
      trie.insert('b')
      trie.delete('a')
      expect([...trie.keys()]).toEqual(['b'])
    })
  })

  describe('values', () => {
    it('should return empty iterator for empty trie', () => {
      const trie = new PathCompressionTrie()
      expect([...trie.values()]).toEqual([])
    })

    it('should return all values', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('c', 3)
      const vals = [...trie.values()].sort()
      expect(vals).toEqual([1, 2, 3])
    })

    it('should return updated values after overwrite', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('a', 1)
      trie.insert('a', 2)
      expect([...trie.values()]).toEqual([2])
    })
  })

  describe('entries', () => {
    it('should return empty iterator for empty trie', () => {
      const trie = new PathCompressionTrie()
      expect([...trie.entries()]).toEqual([])
    })

    it('should return all entries', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      const entries = [...trie.entries()].sort((a, b) => a.key.localeCompare(b.key))
      expect(entries).toEqual([{ key: 'a', value: 1 }, { key: 'b', value: 2 }])
    })

    it('should include empty string key entry', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('', 0)
      trie.insert('a', 1)
      const entries = [...trie.entries()].sort((a, b) => a.key.localeCompare(b.key))
      expect(entries).toEqual([{ key: '', value: 0 }, { key: 'a', value: 1 }])
    })
  })

  describe('forEach', () => {
    it('should iterate over all entries', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      const result: Array<[number, string]> = []
      trie.forEach((v, k) => result.push([v, k]))
      result.sort((a, b) => a[1].localeCompare(b[1]))
      expect(result).toEqual([[1, 'a'], [2, 'b']])
    })

    it('should pass trie as third argument', () => {
      const trie = new PathCompressionTrie()
      trie.insert('a')
      let received: PathCompressionTrie | undefined
      trie.forEach((_v, _k, t) => { received = t })
      expect(received).toBe(trie)
    })

    it('should not iterate on empty trie', () => {
      const trie = new PathCompressionTrie()
      let count = 0
      trie.forEach(() => { count++ })
      expect(count).toBe(0)
    })
  })

  describe('Symbol.iterator', () => {
    it('should be iterable', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('a', 1)
      const entries = [...trie]
      expect(entries).toHaveLength(1)
      expect(entries[0]!.key).toBe('a')
      expect(entries[0]!.value).toBe(1)
    })

    it('should work with for-of', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      const keys: string[] = []
      for (const entry of trie) {
        keys.push(entry.key)
      }
      expect(keys.sort()).toEqual(['a', 'b'])
    })
  })

  describe('path compression verification', () => {
    it('should compress single chain into single node', () => {
      const trie = new PathCompressionTrie()
      trie.insert('abcdef')
      expect(trie.size).toBe(1)
      expect(trie.has('abcdef')).toBe(true)
    })

    it('should split compressed node on divergent insert', () => {
      const trie = new PathCompressionTrie()
      trie.insert('abcdef')
      trie.insert('abcxyz')
      expect(trie.has('abcdef')).toBe(true)
      expect(trie.has('abcxyz')).toBe(true)
      expect(trie.has('abc')).toBe(false)
    })

    it('should handle splitting at beginning of label', () => {
      const trie = new PathCompressionTrie()
      trie.insert('abc')
      trie.insert('xyz')
      expect(trie.has('abc')).toBe(true)
      expect(trie.has('xyz')).toBe(true)
    })

    it('should handle splitting at end of label', () => {
      const trie = new PathCompressionTrie()
      trie.insert('abc')
      trie.insert('abcd')
      expect(trie.has('abc')).toBe(true)
      expect(trie.has('abcd')).toBe(true)
    })

    it('should handle splitting at middle of label', () => {
      const trie = new PathCompressionTrie()
      trie.insert('abcdef')
      trie.insert('abcxyz')
      expect(trie.has('abcdef')).toBe(true)
      expect(trie.has('abcxyz')).toBe(true)
    })

    it('should handle three-way split', () => {
      const trie = new PathCompressionTrie()
      trie.insert('abc1')
      trie.insert('abc2')
      trie.insert('abc3')
      expect(trie.has('abc1')).toBe(true)
      expect(trie.has('abc2')).toBe(true)
      expect(trie.has('abc3')).toBe(true)
      expect(trie.size).toBe(3)
    })

    it('should compress after delete leaves single child', () => {
      const trie = new PathCompressionTrie()
      trie.insert('abc1')
      trie.insert('abc2')
      trie.delete('abc1')
      expect(trie.has('abc2')).toBe(true)
      expect(trie.size).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('should handle single character keys', () => {
      const trie = new PathCompressionTrie()
      trie.insert('a')
      trie.insert('b')
      trie.insert('c')
      expect(trie.has('a')).toBe(true)
      expect(trie.has('b')).toBe(true)
      expect(trie.has('c')).toBe(true)
    })

    it('should handle long keys', () => {
      const trie = new PathCompressionTrie()
      const key = 'abcdefghij' .repeat(100)
      trie.insert(key)
      expect(trie.has(key)).toBe(true)
    })

    it('should handle overlapping prefixes', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('a', 1)
      trie.insert('ab', 2)
      trie.insert('abc', 3)
      trie.insert('abcd', 4)
      expect(trie.search('a')).toBe(1)
      expect(trie.search('ab')).toBe(2)
      expect(trie.search('abc')).toBe(3)
      expect(trie.search('abcd')).toBe(4)
    })

    it('should handle keys that are prefixes of other keys', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('abc', 1)
      trie.insert('a', 2)
      expect(trie.search('a')).toBe(2)
      expect(trie.search('abc')).toBe(1)
    })

    it('should handle identical inserts', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('key', 1)
      trie.insert('key', 1)
      expect(trie.size).toBe(1)
    })

    it('should handle empty trie operations', () => {
      const trie = new PathCompressionTrie()
      expect(trie.search('a')).toBeUndefined()
      expect(trie.has('a')).toBe(false)
      expect(trie.delete('a')).toBe(false)
      expect(trie.startsWith('a')).toBe(false)
      expect(trie.keysWithPrefix('a')).toEqual([])
      expect([...trie.keys()]).toEqual([])
      expect([...trie.values()]).toEqual([])
      expect([...trie.entries()]).toEqual([])
    })

    it('should handle numeric characters in keys', () => {
      const trie = new PathCompressionTrie()
      trie.insert('123')
      trie.insert('124')
      trie.insert('125')
      expect(trie.has('123')).toBe(true)
      expect(trie.has('124')).toBe(true)
      expect(trie.has('125')).toBe(true)
      expect(trie.has('126')).toBe(false)
    })

    it('should handle special characters in keys', () => {
      const trie = new PathCompressionTrie()
      trie.insert('hello world')
      trie.insert('hello-world')
      trie.insert('hello_world')
      expect(trie.has('hello world')).toBe(true)
      expect(trie.has('hello-world')).toBe(true)
      expect(trie.has('hello_world')).toBe(true)
    })

    it('should handle unicode characters', () => {
      const trie = new PathCompressionTrie()
      trie.insert('café')
      trie.insert('naïve')
      expect(trie.has('café')).toBe(true)
      expect(trie.has('naïve')).toBe(true)
    })

    it('should handle very deep branching', () => {
      const trie = new PathCompressionTrie()
      for (let i = 0; i < 26; i++) {
        trie.insert(String.fromCharCode(97 + i))
      }
      expect(trie.size).toBe(26)
      for (let i = 0; i < 26; i++) {
        expect(trie.has(String.fromCharCode(97 + i))).toBe(true)
      }
    })
  })

  describe('large datasets', () => {
    it('should handle 1000 keys', () => {
      const trie = new PathCompressionTrie<number>()
      for (let i = 0; i < 1000; i++) {
        trie.insert(`key${i}`, i)
      }
      expect(trie.size).toBe(1000)
      expect(trie.search('key0')).toBe(0)
      expect(trie.search('key999')).toBe(999)
      expect(trie.search('key500')).toBe(500)
    })

    it('should handle sequential prefix keys', () => {
      const trie = new PathCompressionTrie()
      for (let i = 0; i < 100; i++) {
        trie.insert('a'.repeat(i + 1))
      }
      expect(trie.size).toBe(100)
      expect(trie.has('a')).toBe(true)
      expect(trie.has('aa')).toBe(true)
      expect(trie.has('a'.repeat(100))).toBe(true)
    })

    it('should handle delete from large set', () => {
      const trie = new PathCompressionTrie<number>()
      for (let i = 0; i < 100; i++) {
        trie.insert(`key${i}`, i)
      }
      trie.delete('key50')
      expect(trie.has('key50')).toBe(false)
      expect(trie.has('key49')).toBe(true)
      expect(trie.has('key51')).toBe(true)
      expect(trie.size).toBe(99)
    })

    it('should handle keysWithPrefix on large set', () => {
      const trie = new PathCompressionTrie()
      for (let i = 0; i < 50; i++) {
        trie.insert(`abc${i}`)
        trie.insert(`xyz${i}`)
      }
      const abcKeys = trie.keysWithPrefix('abc')
      const xyzKeys = trie.keysWithPrefix('xyz')
      expect(abcKeys).toHaveLength(50)
      expect(xyzKeys).toHaveLength(50)
    })

    it('should handle forEach on large set', () => {
      const trie = new PathCompressionTrie<number>()
      for (let i = 0; i < 100; i++) {
        trie.insert(`k${i}`, i)
      }
      let count = 0
      trie.forEach(() => { count++ })
      expect(count).toBe(100)
    })
  })

  describe('type exports', () => {
    it('should export TrieNode type', () => {
      const node: TrieNode<number> = {
        label: 'test',
        value: 1,
        hasValue: true,
        children: new Map(),
      }
      expect(node.label).toBe('test')
      expect(node.value).toBe(1)
    })

    it('should export TrieEntry type', () => {
      const entry: TrieEntry<string> = {
        key: 'test',
        value: 'val',
      }
      expect(entry.key).toBe('test')
      expect(entry.value).toBe('val')
    })
  })

  describe('complex scenarios', () => {
    it('should handle insert-delete-reinsert cycle', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('abc', 1)
      trie.delete('abc')
      expect(trie.isEmpty).toBe(true)
      trie.insert('abc', 2)
      expect(trie.search('abc')).toBe(2)
    })

    it('should handle many operations in sequence', () => {
      const trie = new PathCompressionTrie<number>()
      for (let i = 0; i < 50; i++) {
        trie.insert(`key${i}`, i)
      }
      for (let i = 0; i < 25; i++) {
        trie.delete(`key${i}`)
      }
      expect(trie.size).toBe(25)
      for (let i = 25; i < 50; i++) {
        expect(trie.search(`key${i}`)).toBe(i)
      }
    })

    it('should handle dictionary-like usage', () => {
      const trie = new PathCompressionTrie<string>()
      trie.insert('apple', 'fruit')
      trie.insert('application', 'software')
      trie.insert('apply', 'verb')
      trie.insert('app', 'prefix')
      expect(trie.search('apple')).toBe('fruit')
      expect(trie.search('application')).toBe('software')
      expect(trie.search('apply')).toBe('verb')
      expect(trie.search('app')).toBe('prefix')
      const appKeys = trie.keysWithPrefix('app')
      expect(appKeys).toHaveLength(4)
    })

    it('should handle clearing and rebuilding', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.clear()
      expect(trie.isEmpty).toBe(true)
      trie.insert('c', 3)
      trie.insert('d', 4)
      expect(trie.size).toBe(2)
      expect(trie.has('a')).toBe(false)
      expect(trie.has('c')).toBe(true)
    })

    it('should handle keys with same character repeated', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('aa', 1)
      trie.insert('aaa', 2)
      trie.insert('aaaa', 3)
      expect(trie.search('aa')).toBe(1)
      expect(trie.search('aaa')).toBe(2)
      expect(trie.search('aaaa')).toBe(3)
      expect(trie.search('a')).toBeUndefined()
    })

    it('should handle binary strings', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('0', 0)
      trie.insert('1', 1)
      trie.insert('00', 2)
      trie.insert('01', 3)
      trie.insert('10', 4)
      trie.insert('11', 5)
      expect(trie.size).toBe(6)
      for (const key of ['0', '1', '00', '01', '10', '11']) {
        expect(trie.has(key)).toBe(true)
      }
    })

    it('should handle alternating insert and delete', () => {
      const trie = new PathCompressionTrie<number>()
      for (let round = 0; round < 5; round++) {
        for (let i = 0; i < 10; i++) {
          trie.insert(`k${i}`, round * 10 + i)
        }
        for (let i = 0; i < 10; i++) {
          expect(trie.has(`k${i}`)).toBe(true)
        }
        for (let i = 0; i < 10; i++) {
          trie.delete(`k${i}`)
        }
        expect(trie.isEmpty).toBe(true)
      }
    })

    it('should handle overwrite preserving structure', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('abc', 1)
      trie.insert('abd', 2)
      trie.insert('abc', 10)
      expect(trie.search('abc')).toBe(10)
      expect(trie.search('abd')).toBe(2)
      expect(trie.size).toBe(2)
    })

    it('should handle mixed operations', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('a', 1)
      trie.insert('ab', 2)
      trie.insert('abc', 3)
      trie.insert('b', 4)
      trie.delete('ab')
      expect(trie.search('a')).toBe(1)
      expect(trie.search('abc')).toBe(3)
      expect(trie.search('b')).toBe(4)
      expect(trie.has('ab')).toBe(false)
      trie.insert('ab', 20)
      expect(trie.search('ab')).toBe(20)
      expect(trie.size).toBe(4)
    })

    it('should handle startsWith after delete', () => {
      const trie = new PathCompressionTrie()
      trie.insert('abc')
      trie.insert('abd')
      trie.delete('abc')
      expect(trie.startsWith('ab')).toBe(true)
      expect(trie.startsWith('abc')).toBe(false)
    })

    it('should handle keysWithPrefix after clear', () => {
      const trie = new PathCompressionTrie()
      trie.insert('abc')
      trie.insert('abd')
      trie.clear()
      expect(trie.keysWithPrefix('ab')).toEqual([])
    })

    it('should handle deeply nested prefix tree', () => {
      const trie = new PathCompressionTrie<number>()
      let key = ''
      for (let i = 0; i < 50; i++) {
        key += String.fromCharCode(97 + (i % 26))
        trie.insert(key, i)
      }
      expect(trie.size).toBe(50)
      key = ''
      for (let i = 0; i < 50; i++) {
        key += String.fromCharCode(97 + (i % 26))
        expect(trie.search(key)).toBe(i)
      }
    })

    it('should handle delete and reinsert with different value', () => {
      const trie = new PathCompressionTrie<string>()
      trie.insert('key', 'old')
      trie.delete('key')
      trie.insert('key', 'new')
      expect(trie.search('key')).toBe('new')
    })

    it('should handle many keys with same prefix', () => {
      const trie = new PathCompressionTrie<number>()
      const prefix = 'abcdefghij'
      for (let i = 0; i < 100; i++) {
        trie.insert(`${prefix}${i}`, i)
      }
      expect(trie.size).toBe(100)
      const keys = trie.keysWithPrefix(prefix)
      expect(keys).toHaveLength(100)
    })

    it('should handle case sensitivity', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('ABC', 1)
      trie.insert('abc', 2)
      trie.insert('Abc', 3)
      expect(trie.search('ABC')).toBe(1)
      expect(trie.search('abc')).toBe(2)
      expect(trie.search('Abc')).toBe(3)
    })

    it('should handle single key lifecycle', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('only', 1)
      expect(trie.has('only')).toBe(true)
      expect(trie.search('only')).toBe(1)
      trie.delete('only')
      expect(trie.has('only')).toBe(false)
      expect(trie.isEmpty).toBe(true)
    })
  })

  describe('additional coverage', () => {
    it('should handle insert after delete of different key', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('abc', 1)
      trie.insert('xyz', 2)
      trie.delete('abc')
      trie.insert('abdef', 3)
      expect(trie.has('xyz')).toBe(true)
      expect(trie.has('abdef')).toBe(true)
      expect(trie.has('abc')).toBe(false)
    })

    it('should handle overlapping key deletes in reverse order', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('a', 1)
      trie.insert('ab', 2)
      trie.insert('abc', 3)
      trie.delete('abc')
      expect(trie.has('ab')).toBe(true)
      trie.delete('ab')
      expect(trie.has('a')).toBe(true)
      trie.delete('a')
      expect(trie.isEmpty).toBe(true)
    })

    it('should handle delete of key that splits a compressed node', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('test1', 1)
      trie.insert('test2', 2)
      trie.delete('test1')
      expect(trie.has('test2')).toBe(true)
      expect(trie.has('test1')).toBe(false)
      expect(trie.size).toBe(1)
    })

    it('should handle multiple keys with completely different starts', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('alpha', 1)
      trie.insert('beta', 2)
      trie.insert('gamma', 3)
      trie.insert('delta', 4)
      expect(trie.size).toBe(4)
      expect(trie.search('alpha')).toBe(1)
      expect(trie.search('beta')).toBe(2)
      expect(trie.search('gamma')).toBe(3)
      expect(trie.search('delta')).toBe(4)
    })

    it('should handle keysWithPrefix returning no results', () => {
      const trie = new PathCompressionTrie()
      trie.insert('abc')
      expect(trie.keysWithPrefix('xyz')).toEqual([])
    })

    it('should handle startsWith on exact key match', () => {
      const trie = new PathCompressionTrie()
      trie.insert('hello')
      expect(trie.startsWith('hello')).toBe(true)
      expect(trie.startsWith('helloo')).toBe(false)
    })

    it('should handle keys after complex insert pattern', () => {
      const trie = new PathCompressionTrie()
      trie.insert('car')
      trie.insert('carpet')
      trie.insert('carpets')
      trie.insert('cart')
      trie.insert('carbon')
      const keys = [...trie.keys()].sort()
      expect(keys).toEqual(['car', 'carbon', 'carpet', 'carpets', 'cart'])
    })

    it('should handle values iteration order', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('b', 2)
      trie.insert('a', 1)
      trie.insert('c', 3)
      const values = [...trie.values()]
      expect(values.sort()).toEqual([1, 2, 3])
    })

    it('should handle entries iteration', () => {
      const trie = new PathCompressionTrie<string>()
      trie.insert('x', 'X')
      trie.insert('y', 'Y')
      const entries = [...trie.entries()]
      expect(entries).toHaveLength(2)
      const map = new Map(entries.map(e => [e.key, e.value]))
      expect(map.get('x')).toBe('X')
      expect(map.get('y')).toBe('Y')
    })

    it('should handle forEach with all entries', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('a', 10)
      trie.insert('b', 20)
      trie.insert('c', 30)
      const sum = { total: 0 }
      trie.forEach((v) => { sum.total += v })
      expect(sum.total).toBe(60)
    })

    it('should handle insert-delete-insert of same key', () => {
      const trie = new PathCompressionTrie<string>()
      trie.insert('test', 'first')
      trie.delete('test')
      trie.insert('test', 'second')
      expect(trie.search('test')).toBe('second')
      expect(trie.size).toBe(1)
    })

    it('should handle size after clear and reinsert', () => {
      const trie = new PathCompressionTrie<number>()
      for (let i = 0; i < 20; i++) {
        trie.insert(`k${i}`, i)
      }
      expect(trie.size).toBe(20)
      trie.clear()
      expect(trie.size).toBe(0)
      trie.insert('new', 99)
      expect(trie.size).toBe(1)
    })

    it('should handle keysWithPrefix with partial label match', () => {
      const trie = new PathCompressionTrie()
      trie.insert('abcdef')
      const keys = trie.keysWithPrefix('abc')
      expect(keys).toEqual(['abcdef'])
    })

    it('should handle empty trie iterator', () => {
      const trie = new PathCompressionTrie()
      expect([...trie]).toEqual([])
      expect([...trie.keys()]).toEqual([])
      expect([...trie.values()]).toEqual([])
    })

    it('should handle insert with empty string then other keys', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('', 0)
      trie.insert('a', 1)
      trie.insert('ab', 2)
      expect(trie.search('')).toBe(0)
      expect(trie.search('a')).toBe(1)
      expect(trie.search('ab')).toBe(2)
      expect(trie.size).toBe(3)
    })

    it('should handle delete of empty string with other keys present', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('', 0)
      trie.insert('a', 1)
      trie.delete('')
      expect(trie.has('')).toBe(false)
      expect(trie.search('a')).toBe(1)
      expect(trie.size).toBe(1)
    })

    it('should handle keysWithPrefix on empty string with multiple keys', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('', 0)
      trie.insert('a', 1)
      trie.insert('ab', 2)
      const keys = trie.keysWithPrefix('')
      expect(keys.sort()).toEqual(['', 'a', 'ab'])
    })

    it('should handle delete then startsWith check', () => {
      const trie = new PathCompressionTrie()
      trie.insert('abc')
      trie.insert('abd')
      trie.delete('abc')
      expect(trie.startsWith('a')).toBe(true)
      expect(trie.startsWith('ab')).toBe(true)
      expect(trie.startsWith('abd')).toBe(true)
    })

    it('should handle multiple splits at same level', () => {
      const trie = new PathCompressionTrie<number>()
      trie.insert('abc', 1)
      trie.insert('ade', 2)
      trie.insert('afg', 3)
      expect(trie.search('abc')).toBe(1)
      expect(trie.search('ade')).toBe(2)
      expect(trie.search('afg')).toBe(3)
      expect(trie.search('a')).toBeUndefined()
    })
  })
})
