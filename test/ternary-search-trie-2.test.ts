import { describe, it, expect, beforeEach } from 'vitest'
import { TernarySearchTrie2 } from '../src/core/ternary-search-trie-2/index.js'

describe('TernarySearchTrie2', () => {
  let trie: TernarySearchTrie2<number>

  beforeEach(() => {
    trie = new TernarySearchTrie2<number>()
  })

  describe('empty trie', () => {
    it('should have size 0', () => {
      expect(trie.size).toBe(0)
    })

    it('should return undefined for get on empty trie', () => {
      expect(trie.get('test')).toBeUndefined()
    })

    it('should return false for has on empty trie', () => {
      expect(trie.has('test')).toBe(false)
    })

    it('should return empty array for keys on empty trie', () => {
      expect(trie.keys()).toEqual([])
    })

    it('should return empty array for keysWithPrefix on empty trie', () => {
      expect(trie.keysWithPrefix('test')).toEqual([])
    })

    it('should return false for delete on empty trie', () => {
      expect(trie.delete('test')).toBe(false)
    })
  })

  describe('set and get', () => {
    it('should set and get a simple key', () => {
      trie.set('hello', 1)
      expect(trie.get('hello')).toBe(1)
    })

    it('should set and get multiple keys', () => {
      trie.set('hello', 1)
      trie.set('world', 2)
      trie.set('test', 3)

      expect(trie.get('hello')).toBe(1)
      expect(trie.get('world')).toBe(2)
      expect(trie.get('test')).toBe(3)
    })

    it('should update value for existing key', () => {
      trie.set('hello', 1)
      trie.set('hello', 2)

      expect(trie.get('hello')).toBe(2)
      expect(trie.size).toBe(1)
    })

    it('should handle single character keys', () => {
      trie.set('a', 1)
      trie.set('b', 2)
      trie.set('c', 3)

      expect(trie.get('a')).toBe(1)
      expect(trie.get('b')).toBe(2)
      expect(trie.get('c')).toBe(3)
      expect(trie.size).toBe(3)
    })

    it('should handle empty string key (no-op)', () => {
      trie.set('', 1)
      expect(trie.size).toBe(0)
      expect(trie.get('')).toBeUndefined()
    })
  })

  describe('has', () => {
    it('should return true for existing key', () => {
      trie.set('hello', 1)
      expect(trie.has('hello')).toBe(true)
    })

    it('should return false for non-existing key', () => {
      trie.set('hello', 1)
      expect(trie.has('world')).toBe(false)
    })

    it('should return false for prefix only', () => {
      trie.set('hello', 1)
      expect(trie.has('hel')).toBe(false)
    })
  })

  describe('delete', () => {
    it('should delete existing key and return true', () => {
      trie.set('hello', 1)
      expect(trie.delete('hello')).toBe(true)
      expect(trie.has('hello')).toBe(false)
      expect(trie.get('hello')).toBeUndefined()
      expect(trie.size).toBe(0)
    })

    it('should return false for non-existing key', () => {
      trie.set('hello', 1)
      expect(trie.delete('world')).toBe(false)
      expect(trie.size).toBe(1)
    })

    it('should delete multiple keys', () => {
      trie.set('a', 1)
      trie.set('b', 2)
      trie.set('c', 3)

      expect(trie.delete('a')).toBe(true)
      expect(trie.delete('b')).toBe(true)
      expect(trie.delete('c')).toBe(true)

      expect(trie.size).toBe(0)
    })

    it('should handle deleting single character keys', () => {
      trie.set('a', 1)
      trie.set('b', 2)

      expect(trie.delete('a')).toBe(true)
      expect(trie.has('a')).toBe(false)
      expect(trie.has('b')).toBe(true)
    })

    it('should return false for empty string', () => {
      expect(trie.delete('')).toBe(false)
    })
  })

  describe('size', () => {
    it('should track size correctly', () => {
      expect(trie.size).toBe(0)

      trie.set('a', 1)
      expect(trie.size).toBe(1)

      trie.set('b', 2)
      expect(trie.size).toBe(2)

      trie.set('c', 3)
      expect(trie.size).toBe(3)
    })

    it('should not increase size on update', () => {
      trie.set('a', 1)
      trie.set('a', 2)

      expect(trie.size).toBe(1)
    })

    it('should decrease size on delete', () => {
      trie.set('a', 1)
      trie.set('b', 2)

      trie.delete('a')
      expect(trie.size).toBe(1)

      trie.delete('b')
      expect(trie.size).toBe(0)
    })
  })

  describe('clear', () => {
    it('should clear all entries', () => {
      trie.set('a', 1)
      trie.set('b', 2)
      trie.set('c', 3)

      trie.clear()

      expect(trie.size).toBe(0)
      expect(trie.get('a')).toBeUndefined()
      expect(trie.get('b')).toBeUndefined()
      expect(trie.get('c')).toBeUndefined()
    })

    it('should work on empty trie', () => {
      trie.clear()
      expect(trie.size).toBe(0)
    })
  })

  describe('keysWithPrefix', () => {
    it('should return all keys with given prefix', () => {
      trie.set('apple', 1)
      trie.set('app', 2)
      trie.set('application', 3)
      trie.set('banana', 4)

      const result = trie.keysWithPrefix('app')
      expect(result.length).toBe(3)
      expect(result).toContain('app')
      expect(result).toContain('apple')
      expect(result).toContain('application')
    })

    it('should return empty array for non-existing prefix', () => {
      trie.set('apple', 1)
      trie.set('banana', 2)

      const result = trie.keysWithPrefix('orange')
      expect(result).toEqual([])
    })

    it('should return array with single matching key', () => {
      trie.set('apple', 1)
      trie.set('banana', 2)

      const result = trie.keysWithPrefix('apple')
      expect(result).toEqual(['apple'])
    })

    it('should handle empty prefix', () => {
      trie.set('a', 1)
      trie.set('b', 2)
      trie.set('c', 3)

      const result = trie.keysWithPrefix('')
      expect(result.length).toBe(3)
      expect(result).toContain('a')
      expect(result).toContain('b')
      expect(result).toContain('c')
    })

    it('should handle common prefixes correctly', () => {
      trie.set('cat', 1)
      trie.set('car', 2)
      trie.set('cab', 3)
      trie.set('dog', 4)

      const result = trie.keysWithPrefix('ca')
      expect(result.length).toBe(3)
      expect(result).toContain('cat')
      expect(result).toContain('car')
      expect(result).toContain('cab')
    })
  })

  describe('keys', () => {
    it('should return all keys', () => {
      trie.set('apple', 1)
      trie.set('banana', 2)
      trie.set('cherry', 3)

      const result = trie.keys()
      expect(result.length).toBe(3)
      expect(result).toContain('apple')
      expect(result).toContain('banana')
      expect(result).toContain('cherry')
    })

    it('should return empty array for empty trie', () => {
      const result = trie.keys()
      expect(result).toEqual([])
    })

    it('should return keys in sorted order', () => {
      trie.set('z', 1)
      trie.set('a', 2)
      trie.set('m', 3)

      const result = trie.keys()
      expect(result).toEqual(['a', 'm', 'z'])
    })
  })

  describe('case sensitivity', () => {
    it('should treat different cases as different keys', () => {
      trie.set('Hello', 1)
      trie.set('hello', 2)
      trie.set('HELLO', 3)

      expect(trie.get('Hello')).toBe(1)
      expect(trie.get('hello')).toBe(2)
      expect(trie.get('HELLO')).toBe(3)
      expect(trie.size).toBe(3)
    })

    it('should handle mixed case keys', () => {
      trie.set('AbC', 1)
      trie.set('aBc', 2)

      expect(trie.get('AbC')).toBe(1)
      expect(trie.get('aBc')).toBe(2)
      expect(trie.get('abc')).toBeUndefined()
    })
  })

  describe('large dataset', () => {
    it('should handle 100+ entries', () => {
      const count = 100

      for (let i = 0; i < count; i++) {
        trie.set(`key${i}`, i)
      }

      expect(trie.size).toBe(count)

      for (let i = 0; i < count; i++) {
        expect(trie.get(`key${i}`)).toBe(i)
      }

      const keys = trie.keys()
      expect(keys.length).toBe(count)
    })

    it('should handle common prefixes in large dataset', () => {
      const prefixes = ['test', 'demo', 'sample']
      const count = 50

      prefixes.forEach(prefix => {
        for (let i = 0; i < count; i++) {
          trie.set(`${prefix}${i}`, i)
        }
      })

      expect(trie.size).toBe(count * prefixes.length)

      prefixes.forEach(prefix => {
        const result = trie.keysWithPrefix(prefix)
        expect(result.length).toBe(count)
      })
    })
  })

  describe('edge cases', () => {
    it('should handle special characters', () => {
      trie.set('hello-world', 1)
      trie.set('test_key', 2)
      trie.set('key.value', 3)

      expect(trie.get('hello-world')).toBe(1)
      expect(trie.get('test_key')).toBe(2)
      expect(trie.get('key.value')).toBe(3)
    })

    it('should handle very long keys', () => {
      const longKey = 'a'.repeat(1000)
      trie.set(longKey, 1)

      expect(trie.get(longKey)).toBe(1)
      expect(trie.size).toBe(1)
    })

    it('should handle prefix that is a complete key', () => {
      trie.set('app', 1)
      trie.set('apple', 2)
      trie.set('application', 3)

      const result = trie.keysWithPrefix('app')
      expect(result).toContain('app')
      expect(result).toContain('apple')
      expect(result).toContain('application')
      expect(result.length).toBe(3)
    })

    it('should handle delete', () => {
      trie.set('hello', 1)
      trie.set('world', 2)
      expect(trie.delete('hello')).toBe(true)
      expect(trie.get('hello')).toBeUndefined()
      expect(trie.has('world')).toBe(true)
    })

    it('should handle clear', () => {
      trie.set('apple', 1)
      trie.set('banana', 2)
      trie.clear()
      expect(trie.size).toBe(0)
    })
  })
})
