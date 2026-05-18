import { describe, it, expect } from 'vitest'
import { Trie3 } from '../../src/core/trie-3/index.js'

describe('Trie3', () => {
  describe('constructor', () => {
    it('should create an empty trie', () => {
      const trie = new Trie3()
      expect(trie.size).toBe(0)
      expect(trie.isEmpty).toBe(true)
    })
  })

  // ─── Insert ───

  describe('insert', () => {
    it('should insert a single word', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.size).toBe(1)
      expect(trie.isEmpty).toBe(false)
    })

    it('should insert multiple words', () => {
      const trie = new Trie3()
      trie.insert('apple')
      trie.insert('banana')
      trie.insert('cherry')
      expect(trie.size).toBe(3)
    })

    it('should handle duplicate insert gracefully', () => {
      const trie = new Trie3()
      trie.insert('hello')
      trie.insert('hello')
      expect(trie.size).toBe(1)
    })

    it('should ignore empty string insert', () => {
      const trie = new Trie3()
      trie.insert('')
      expect(trie.size).toBe(0)
      expect(trie.isEmpty).toBe(true)
    })

    it('should insert words that are prefixes of each other', () => {
      const trie = new Trie3()
      trie.insert('a')
      trie.insert('ab')
      trie.insert('abc')
      expect(trie.size).toBe(3)
    })

    it('should insert single character words', () => {
      const trie = new Trie3()
      trie.insert('a')
      trie.insert('b')
      trie.insert('c')
      expect(trie.size).toBe(3)
    })
  })

  // ─── Search ───

  describe('search', () => {
    it('should find an inserted word', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.search('hello')).toBe(true)
    })

    it('should return false for non-existent word', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.search('world')).toBe(false)
    })

    it('should return false for prefix that is not a word', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.search('hel')).toBe(false)
    })

    it('should return false for empty string', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.search('')).toBe(false)
    })

    it('should return false for empty trie', () => {
      const trie = new Trie3()
      expect(trie.search('anything')).toBe(false)
    })

    it('should find words after multiple inserts', () => {
      const trie = new Trie3()
      trie.insert('apple')
      trie.insert('app')
      trie.insert('application')
      expect(trie.search('app')).toBe(true)
      expect(trie.search('apple')).toBe(true)
      expect(trie.search('application')).toBe(true)
      expect(trie.search('ap')).toBe(false)
    })
  })

  // ─── Contains / HasWord ───

  describe('contains', () => {
    it('should behave the same as search', () => {
      const trie = new Trie3()
      trie.insert('test')
      expect(trie.contains('test')).toBe(true)
      expect(trie.contains('tes')).toBe(false)
      expect(trie.contains('')).toBe(false)
    })
  })

  describe('hasWord', () => {
    it('should behave the same as search', () => {
      const trie = new Trie3()
      trie.insert('word')
      expect(trie.hasWord('word')).toBe(true)
      expect(trie.hasWord('wor')).toBe(false)
    })
  })

  // ─── Remove ───

  describe('remove', () => {
    it('should remove an existing word', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.remove('hello')).toBe(true)
      expect(trie.size).toBe(0)
      expect(trie.search('hello')).toBe(false)
    })

    it('should return false for non-existent word', () => {
      const trie = new Trie3()
      expect(trie.remove('hello')).toBe(false)
    })

    it('should return false for empty string', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.remove('')).toBe(false)
    })

    it('should return false for prefix that is not a word', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.remove('hel')).toBe(false)
    })

    it('should not affect other words when removing', () => {
      const trie = new Trie3()
      trie.insert('apple')
      trie.insert('app')
      expect(trie.remove('apple')).toBe(true)
      expect(trie.search('app')).toBe(true)
      expect(trie.size).toBe(1)
    })

    it('should handle removing then re-inserting', () => {
      const trie = new Trie3()
      trie.insert('hello')
      trie.remove('hello')
      trie.insert('hello')
      expect(trie.size).toBe(1)
      expect(trie.search('hello')).toBe(true)
    })

    it('should remove word that is a prefix of another without affecting the longer', () => {
      const trie = new Trie3()
      trie.insert('app')
      trie.insert('apple')
      expect(trie.remove('app')).toBe(true)
      expect(trie.search('app')).toBe(false)
      expect(trie.search('apple')).toBe(true)
    })
  })

  // ─── StartsWith ───

  describe('startsWith', () => {
    it('should return true for existing prefix', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.startsWith('hel')).toBe(true)
    })

    it('should return true for exact word as prefix', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.startsWith('hello')).toBe(true)
    })

    it('should return false for non-existent prefix', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.startsWith('xyz')).toBe(false)
    })

    it('should return true for empty prefix', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.startsWith('')).toBe(true)
    })

    it('should return true for empty trie with empty prefix', () => {
      const trie = new Trie3()
      expect(trie.startsWith('')).toBe(true)
    })
  })

  // ─── CountWordsStartingWith ───

  describe('countWordsStartingWith', () => {
    it('should count words starting with a prefix', () => {
      const trie = new Trie3()
      trie.insert('apple')
      trie.insert('app')
      trie.insert('application')
      trie.insert('banana')
      expect(trie.countWordsStartingWith('app')).toBe(3)
    })

    it('should return 0 for non-existent prefix', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.countWordsStartingWith('xyz')).toBe(0)
    })

    it('should return total size for empty prefix', () => {
      const trie = new Trie3()
      trie.insert('apple')
      trie.insert('banana')
      expect(trie.countWordsStartingWith('')).toBe(2)
    })

    it('should return 0 for empty trie', () => {
      const trie = new Trie3()
      expect(trie.countWordsStartingWith('a')).toBe(0)
    })

    it('should count single word with exact prefix match', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.countWordsStartingWith('hello')).toBe(1)
    })
  })

  // ─── GetAllWords ───

  describe('getAllWords', () => {
    it('should return all words', () => {
      const trie = new Trie3()
      trie.insert('apple')
      trie.insert('banana')
      trie.insert('cherry')
      const words = trie.getAllWords()
      expect(words).toContain('apple')
      expect(words).toContain('banana')
      expect(words).toContain('cherry')
      expect(words.length).toBe(3)
    })

    it('should return words with given prefix', () => {
      const trie = new Trie3()
      trie.insert('apple')
      trie.insert('app')
      trie.insert('application')
      trie.insert('banana')
      const words = trie.getAllWords('app')
      expect(words.length).toBe(3)
      expect(words).toContain('apple')
      expect(words).toContain('app')
      expect(words).toContain('application')
      expect(words).not.toContain('banana')
    })

    it('should return empty array for non-existent prefix', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.getAllWords('xyz')).toEqual([])
    })

    it('should return all words for empty prefix', () => {
      const trie = new Trie3()
      trie.insert('a')
      trie.insert('b')
      expect(trie.getAllWords('')).toEqual(['a', 'b'])
    })

    it('should return empty array for empty trie', () => {
      const trie = new Trie3()
      expect(trie.getAllWords()).toEqual([])
    })
  })

  // ─── LongestCommonPrefix ───

  describe('longestCommonPrefix', () => {
    it('should return common prefix for words with shared start', () => {
      const trie = new Trie3()
      trie.insert('apple')
      trie.insert('app')
      trie.insert('application')
      expect(trie.longestCommonPrefix()).toBe('app')
    })

    it('should return empty string when no common prefix', () => {
      const trie = new Trie3()
      trie.insert('apple')
      trie.insert('banana')
      expect(trie.longestCommonPrefix()).toBe('')
    })

    it('should return empty string for empty trie', () => {
      const trie = new Trie3()
      expect(trie.longestCommonPrefix()).toBe('')
    })

    it('should return the word itself when only one word', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.longestCommonPrefix()).toBe('hello')
    })

    it('should return empty when one word is prefix of another', () => {
      const trie = new Trie3()
      trie.insert('a')
      trie.insert('ab')
      expect(trie.longestCommonPrefix()).toBe('a')
    })
  })

  // ─── LongestPrefixOf ───

  describe('longestPrefixOf', () => {
    it('should return longest word that is a prefix of the input', () => {
      const trie = new Trie3()
      trie.insert('app')
      trie.insert('appl')
      expect(trie.longestPrefixOf('application')).toBe('appl')
    })

    it('should return exact match word', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.longestPrefixOf('hello')).toBe('hello')
    })

    it('should return empty string when no prefix matches', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.longestPrefixOf('world')).toBe('')
    })

    it('should return empty string for empty input', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.longestPrefixOf('')).toBe('')
    })

    it('should return the longest matching prefix among candidates', () => {
      const trie = new Trie3()
      trie.insert('a')
      trie.insert('ab')
      trie.insert('abc')
      expect(trie.longestPrefixOf('abcdef')).toBe('abc')
    })
  })

  // ─── ForEach ───

  describe('forEach', () => {
    it('should iterate over all words', () => {
      const trie = new Trie3()
      trie.insert('apple')
      trie.insert('banana')
      trie.insert('cherry')
      const collected: string[] = []
      trie.forEach((word) => collected.push(word))
      expect(collected.length).toBe(3)
      expect(collected).toContain('apple')
      expect(collected).toContain('banana')
      expect(collected).toContain('cherry')
    })

    it('should not call callback for empty trie', () => {
      const trie = new Trie3()
      let callCount = 0
      trie.forEach(() => { callCount++ })
      expect(callCount).toBe(0)
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('should clear all words', () => {
      const trie = new Trie3()
      trie.insert('hello')
      trie.insert('world')
      trie.clear()
      expect(trie.size).toBe(0)
      expect(trie.isEmpty).toBe(true)
      expect(trie.search('hello')).toBe(false)
      expect(trie.search('world')).toBe(false)
    })

    it('should allow inserts after clear', () => {
      const trie = new Trie3()
      trie.insert('old')
      trie.clear()
      trie.insert('new')
      expect(trie.size).toBe(1)
      expect(trie.search('new')).toBe(true)
      expect(trie.search('old')).toBe(false)
    })
  })

  // ─── Size / IsEmpty ───

  describe('size and isEmpty', () => {
    it('should track size correctly through inserts and removes', () => {
      const trie = new Trie3()
      expect(trie.size).toBe(0)
      expect(trie.isEmpty).toBe(true)
      trie.insert('a')
      expect(trie.size).toBe(1)
      expect(trie.isEmpty).toBe(false)
      trie.insert('b')
      expect(trie.size).toBe(2)
      trie.remove('a')
      expect(trie.size).toBe(1)
      trie.remove('b')
      expect(trie.size).toBe(0)
      expect(trie.isEmpty).toBe(true)
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('should handle unicode characters', () => {
      const trie = new Trie3()
      trie.insert('こんにちは')
      trie.insert('你好')
      expect(trie.search('こんにちは')).toBe(true)
      expect(trie.search('你好')).toBe(true)
      expect(trie.search('你好世界')).toBe(false)
    })

    it('should handle numeric strings', () => {
      const trie = new Trie3()
      trie.insert('123')
      trie.insert('12345')
      expect(trie.search('123')).toBe(true)
      expect(trie.startsWith('12')).toBe(true)
    })

    it('should handle single character operations', () => {
      const trie = new Trie3()
      trie.insert('x')
      expect(trie.search('x')).toBe(true)
      expect(trie.remove('x')).toBe(true)
      expect(trie.search('x')).toBe(false)
      expect(trie.size).toBe(0)
    })

    it('should handle remove from empty trie', () => {
      const trie = new Trie3()
      expect(trie.remove('anything')).toBe(false)
    })
  })
})
