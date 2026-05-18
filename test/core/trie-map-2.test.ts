import { describe, it, expect } from 'vitest'
import { TrieMap2 } from '../../src/core/trie-map-2/index.js'

describe('TrieMap2', () => {
  describe('constructor', () => {
    it('should create an empty trie map', () => {
      const map = new TrieMap2<string>()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })
  })

  // ─── Set ───

  describe('set', () => {
    it('should set a key-value pair', () => {
      const map = new TrieMap2<number>()
      map.set('hello', 1)
      expect(map.size).toBe(1)
      expect(map.isEmpty()).toBe(false)
    })

    it('should set multiple key-value pairs', () => {
      const map = new TrieMap2<number>()
      map.set('apple', 1)
      map.set('banana', 2)
      map.set('cherry', 3)
      expect(map.size).toBe(3)
    })

    it('should overwrite existing key without increasing size', () => {
      const map = new TrieMap2<number>()
      map.set('hello', 1)
      map.set('hello', 2)
      expect(map.size).toBe(1)
      expect(map.get('hello')).toBe(2)
    })

    it('should handle empty string key', () => {
      const map = new TrieMap2<number>()
      map.set('', 42)
      expect(map.size).toBe(1)
      expect(map.get('')).toBe(42)
    })

    it('should handle keys that are prefixes of each other', () => {
      const map = new TrieMap2<number>()
      map.set('a', 1)
      map.set('ab', 2)
      map.set('abc', 3)
      expect(map.size).toBe(3)
      expect(map.get('a')).toBe(1)
      expect(map.get('ab')).toBe(2)
      expect(map.get('abc')).toBe(3)
    })
  })

  // ─── Get ───

  describe('get', () => {
    it('should get value for existing key', () => {
      const map = new TrieMap2<string>()
      map.set('hello', 'world')
      expect(map.get('hello')).toBe('world')
    })

    it('should return undefined for non-existent key', () => {
      const map = new TrieMap2<string>()
      map.set('hello', 'world')
      expect(map.get('world')).toBeUndefined()
    })

    it('should return undefined for empty trie', () => {
      const map = new TrieMap2<string>()
      expect(map.get('anything')).toBeUndefined()
    })

    it('should return updated value after overwrite', () => {
      const map = new TrieMap2<number>()
      map.set('key', 10)
      map.set('key', 20)
      expect(map.get('key')).toBe(20)
    })
  })

  // ─── Has ───

  describe('has', () => {
    it('should return true for existing key', () => {
      const map = new TrieMap2<number>()
      map.set('hello', 1)
      expect(map.has('hello')).toBe(true)
    })

    it('should return false for non-existent key', () => {
      const map = new TrieMap2<number>()
      map.set('hello', 1)
      expect(map.has('world')).toBe(false)
    })

    it('should return false for prefix that is not a key', () => {
      const map = new TrieMap2<number>()
      map.set('hello', 1)
      expect(map.has('hel')).toBe(false)
    })

    it('should return false for empty trie', () => {
      const map = new TrieMap2<number>()
      expect(map.has('anything')).toBe(false)
    })
  })

  // ─── Delete ───

  describe('delete', () => {
    it('should delete an existing key', () => {
      const map = new TrieMap2<number>()
      map.set('hello', 1)
      expect(map.delete('hello')).toBe(true)
      expect(map.size).toBe(0)
      expect(map.get('hello')).toBeUndefined()
      expect(map.has('hello')).toBe(false)
    })

    it('should return false for non-existent key', () => {
      const map = new TrieMap2<number>()
      expect(map.delete('hello')).toBe(false)
    })

    it('should not affect other keys when deleting', () => {
      const map = new TrieMap2<number>()
      map.set('apple', 1)
      map.set('app', 2)
      expect(map.delete('apple')).toBe(true)
      expect(map.has('app')).toBe(true)
      expect(map.get('app')).toBe(2)
      expect(map.size).toBe(1)
    })

    it('should handle deleting then re-setting', () => {
      const map = new TrieMap2<number>()
      map.set('hello', 1)
      map.delete('hello')
      map.set('hello', 2)
      expect(map.size).toBe(1)
      expect(map.get('hello')).toBe(2)
    })

    it('should prune empty branches after delete', () => {
      const map = new TrieMap2<number>()
      map.set('xyz', 1)
      map.delete('xyz')
      expect(map.hasPrefix('x')).toBe(false)
    })

    it('should delete key that is a prefix of another', () => {
      const map = new TrieMap2<number>()
      map.set('app', 1)
      map.set('apple', 2)
      expect(map.delete('app')).toBe(true)
      expect(map.has('app')).toBe(false)
      expect(map.has('apple')).toBe(true)
    })

    it('should return false for key that was never set but path exists', () => {
      const map = new TrieMap2<number>()
      map.set('apple', 1)
      expect(map.delete('app')).toBe(false)
    })
  })

  // ─── HasPrefix ───

  describe('hasPrefix', () => {
    it('should return true for existing prefix', () => {
      const map = new TrieMap2<number>()
      map.set('hello', 1)
      expect(map.hasPrefix('hel')).toBe(true)
    })

    it('should return true for exact key as prefix', () => {
      const map = new TrieMap2<number>()
      map.set('hello', 1)
      expect(map.hasPrefix('hello')).toBe(true)
    })

    it('should return false for non-existent prefix', () => {
      const map = new TrieMap2<number>()
      map.set('hello', 1)
      expect(map.hasPrefix('xyz')).toBe(false)
    })

    it('should return true for empty string prefix', () => {
      const map = new TrieMap2<number>()
      map.set('hello', 1)
      expect(map.hasPrefix('')).toBe(true)
    })

    it('should return true for empty trie with empty prefix', () => {
      const map = new TrieMap2<number>()
      expect(map.hasPrefix('')).toBe(true)
    })

    it('should return false for empty trie with non-empty prefix', () => {
      const map = new TrieMap2<number>()
      expect(map.hasPrefix('a')).toBe(false)
    })
  })

  // ─── KeysWithPrefix ───

  describe('keysWithPrefix', () => {
    it('should return all keys with given prefix', () => {
      const map = new TrieMap2<number>()
      map.set('apple', 1)
      map.set('app', 2)
      map.set('application', 3)
      map.set('banana', 4)
      const keys = map.keysWithPrefix('app')
      expect(keys.length).toBe(3)
      expect(keys).toContain('apple')
      expect(keys).toContain('app')
      expect(keys).toContain('application')
      expect(keys).not.toContain('banana')
    })

    it('should return empty array for non-existent prefix', () => {
      const map = new TrieMap2<number>()
      map.set('hello', 1)
      expect(map.keysWithPrefix('xyz')).toEqual([])
    })

    it('should return all keys for empty prefix', () => {
      const map = new TrieMap2<number>()
      map.set('a', 1)
      map.set('b', 2)
      const keys = map.keysWithPrefix('')
      expect(keys.length).toBe(2)
      expect(keys).toContain('a')
      expect(keys).toContain('b')
    })

    it('should return empty array for empty trie', () => {
      const map = new TrieMap2<number>()
      expect(map.keysWithPrefix('a')).toEqual([])
    })
  })

  // ─── StartsWith ───

  describe('startsWith', () => {
    it('should behave the same as keysWithPrefix', () => {
      const map = new TrieMap2<number>()
      map.set('apple', 1)
      map.set('app', 2)
      map.set('application', 3)
      const keys = map.startsWith('app')
      expect(keys).toEqual(map.keysWithPrefix('app'))
    })
  })

  // ─── Size / IsEmpty ───

  describe('size and isEmpty', () => {
    it('should track size through operations', () => {
      const map = new TrieMap2<number>()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
      map.set('a', 1)
      expect(map.size).toBe(1)
      expect(map.isEmpty()).toBe(false)
      map.set('b', 2)
      expect(map.size).toBe(2)
      map.delete('a')
      expect(map.size).toBe(1)
      map.delete('b')
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('should clear all entries', () => {
      const map = new TrieMap2<number>()
      map.set('hello', 1)
      map.set('world', 2)
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
      expect(map.has('hello')).toBe(false)
      expect(map.has('world')).toBe(false)
    })

    it('should allow set after clear', () => {
      const map = new TrieMap2<number>()
      map.set('old', 1)
      map.clear()
      map.set('new', 2)
      expect(map.size).toBe(1)
      expect(map.get('new')).toBe(2)
      expect(map.get('old')).toBeUndefined()
    })
  })

  // ─── Generic Value Types ───

  describe('generic value types', () => {
    it('should work with string values', () => {
      const map = new TrieMap2<string>()
      map.set('key', 'value')
      expect(map.get('key')).toBe('value')
    })

    it('should work with number values', () => {
      const map = new TrieMap2<number>()
      map.set('key', 42)
      expect(map.get('key')).toBe(42)
    })

    it('should work with object values', () => {
      const map = new TrieMap2<{ name: string }>()
      map.set('user', { name: 'Alice' })
      expect(map.get('user')?.name).toBe('Alice')
    })

    it('should work with boolean values', () => {
      const map = new TrieMap2<boolean>()
      map.set('flag', true)
      expect(map.get('flag')).toBe(true)
    })

    it('should work with null values stored as sentinel', () => {
      const map = new TrieMap2<number | null>()
      map.set('zero', 0)
      expect(map.get('zero')).toBe(0)
      expect(map.has('zero')).toBe(true)
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('should handle unicode keys', () => {
      const map = new TrieMap2<number>()
      map.set('こんにちは', 1)
      map.set('你好', 2)
      expect(map.get('こんにちは')).toBe(1)
      expect(map.get('你好')).toBe(2)
      expect(map.get('你好世界')).toBeUndefined()
    })

    it('should handle numeric string keys', () => {
      const map = new TrieMap2<number>()
      map.set('123', 1)
      map.set('12345', 2)
      expect(map.get('123')).toBe(1)
      expect(map.hasPrefix('12')).toBe(true)
    })

    it('should handle single character keys', () => {
      const map = new TrieMap2<number>()
      map.set('x', 1)
      expect(map.get('x')).toBe(1)
      expect(map.delete('x')).toBe(true)
      expect(map.get('x')).toBeUndefined()
      expect(map.size).toBe(0)
    })

    it('should handle delete from empty map', () => {
      const map = new TrieMap2<number>()
      expect(map.delete('anything')).toBe(false)
    })

    it('should handle overwriting value many times', () => {
      const map = new TrieMap2<number>()
      for (let i = 0; i < 100; i++) {
        map.set('key', i)
      }
      expect(map.size).toBe(1)
      expect(map.get('key')).toBe(99)
    })
  })
})
