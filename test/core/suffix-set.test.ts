import { describe, it, expect, beforeEach } from 'vitest'
import { SuffixSet } from '../../src/core/suffix-set/suffix-set.js'
import type { SuffixSetStats } from '../../src/core/suffix-set/types.js'

describe('SuffixSet', () => {
  let ss: SuffixSet

  beforeEach(() => {
    ss = new SuffixSet()
  })

  describe('constructor', () => {
    it('should create an empty set', () => {
      const s = new SuffixSet()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should accept an iterable of words', () => {
      const s = new SuffixSet(['apple', 'banana', 'cherry'])
      expect(s.size).toBe(3)
      expect(s.has('apple')).toBe(true)
      expect(s.has('banana')).toBe(true)
      expect(s.has('cherry')).toBe(true)
    })

    it('should accept an array', () => {
      const s = new SuffixSet(['a', 'b', 'c'])
      expect(s.size).toBe(3)
    })

    it('should accept a set', () => {
      const s = new SuffixSet(new Set(['x', 'y', 'z']))
      expect(s.size).toBe(3)
    })

    it('should deduplicate words from iterable', () => {
      const s = new SuffixSet(['hello', 'hello', 'world'])
      expect(s.size).toBe(2)
    })

    it('should accept an empty iterable', () => {
      const s = new SuffixSet([])
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should handle single word iterable', () => {
      const s = new SuffixSet(['lonely'])
      expect(s.size).toBe(1)
      expect(s.has('lonely')).toBe(true)
    })
  })

  describe('add', () => {
    it('should add a word to the set', () => {
      expect(ss.add('hello')).toBe(true)
      expect(ss.size).toBe(1)
      expect(ss.has('hello')).toBe(true)
    })

    it('should return true when adding a new word', () => {
      expect(ss.add('foo')).toBe(true)
    })

    it('should return false when adding a duplicate', () => {
      ss.add('foo')
      expect(ss.add('foo')).toBe(false)
      expect(ss.size).toBe(1)
    })

    it('should add multiple different words', () => {
      ss.add('alpha')
      ss.add('beta')
      ss.add('gamma')
      expect(ss.size).toBe(3)
    })

    it('should handle empty string', () => {
      expect(ss.add('')).toBe(true)
      expect(ss.has('')).toBe(true)
      expect(ss.size).toBe(1)
    })

    it('should handle empty string duplicate', () => {
      ss.add('')
      expect(ss.add('')).toBe(false)
    })

    it('should handle single character words', () => {
      ss.add('a')
      ss.add('b')
      ss.add('c')
      expect(ss.size).toBe(3)
    })

    it('should handle unicode words', () => {
      expect(ss.add('café')).toBe(true)
      expect(ss.has('café')).toBe(true)
    })

    it('should handle emoji words', () => {
      expect(ss.add('hello🎉')).toBe(true)
      expect(ss.has('hello🎉')).toBe(true)
    })

    it('should handle special characters', () => {
      expect(ss.add('hello world')).toBe(true)
      expect(ss.add('hello\tworld')).toBe(true)
      expect(ss.add('hello\nworld')).toBe(true)
      expect(ss.size).toBe(3)
    })

    it('should handle very long words', () => {
      const longWord = 'a'.repeat(10000)
      expect(ss.add(longWord)).toBe(true)
      expect(ss.has(longWord)).toBe(true)
    })
  })

  describe('delete', () => {
    it('should delete an existing word', () => {
      ss.add('hello')
      expect(ss.delete('hello')).toBe(true)
      expect(ss.has('hello')).toBe(false)
      expect(ss.size).toBe(0)
    })

    it('should return false for non-existent word', () => {
      expect(ss.delete('nope')).toBe(false)
    })

    it('should delete from set with multiple words', () => {
      ss.add('alpha')
      ss.add('beta')
      ss.add('gamma')
      expect(ss.delete('beta')).toBe(true)
      expect(ss.size).toBe(2)
      expect(ss.has('beta')).toBe(false)
      expect(ss.has('alpha')).toBe(true)
      expect(ss.has('gamma')).toBe(true)
    })

    it('should handle deleting then re-adding', () => {
      ss.add('hello')
      ss.delete('hello')
      expect(ss.add('hello')).toBe(true)
      expect(ss.has('hello')).toBe(true)
    })

    it('should handle deleting empty string', () => {
      ss.add('')
      expect(ss.delete('')).toBe(true)
      expect(ss.has('')).toBe(false)
    })

    it('should not affect other words when deleting', () => {
      ss.add('abc')
      ss.add('abd')
      ss.add('ab')
      ss.delete('abc')
      expect(ss.has('abc')).toBe(false)
      expect(ss.has('abd')).toBe(true)
      expect(ss.has('ab')).toBe(true)
    })

    it('should handle deleting all words', () => {
      ss.add('a')
      ss.add('b')
      ss.add('c')
      ss.delete('a')
      ss.delete('b')
      ss.delete('c')
      expect(ss.isEmpty()).toBe(true)
      expect(ss.size).toBe(0)
    })
  })

  describe('has', () => {
    it('should return true for existing word', () => {
      ss.add('test')
      expect(ss.has('test')).toBe(true)
    })

    it('should return false for non-existent word', () => {
      expect(ss.has('test')).toBe(false)
    })

    it('should return false for partial match', () => {
      ss.add('testing')
      expect(ss.has('test')).toBe(false)
    })

    it('should return false for superstring', () => {
      ss.add('test')
      expect(ss.has('testing')).toBe(false)
    })

    it('should be case sensitive', () => {
      ss.add('Hello')
      expect(ss.has('Hello')).toBe(true)
      expect(ss.has('hello')).toBe(false)
    })
  })

  describe('hasPrefix', () => {
    it('should return true when prefix matches an existing word', () => {
      ss.add('hello')
      expect(ss.hasPrefix('hel')).toBe(true)
    })

    it('should return true when prefix is an exact word', () => {
      ss.add('hello')
      expect(ss.hasPrefix('hello')).toBe(true)
    })

    it('should return false when no word starts with prefix', () => {
      ss.add('hello')
      expect(ss.hasPrefix('xyz')).toBe(false)
    })

    it('should return true for empty prefix when set is non-empty', () => {
      ss.add('hello')
      expect(ss.hasPrefix('')).toBe(true)
    })

    it('should return false for empty prefix when set is empty', () => {
      expect(ss.hasPrefix('')).toBe(false)
    })

    it('should handle single character prefix', () => {
      ss.add('apple')
      ss.add('avocado')
      expect(ss.hasPrefix('a')).toBe(true)
      expect(ss.hasPrefix('b')).toBe(false)
    })

    it('should handle prefix longer than all words', () => {
      ss.add('hi')
      expect(ss.hasPrefix('hii')).toBe(false)
    })

    it('should work with multiple words sharing prefix', () => {
      ss.add('abc')
      ss.add('abd')
      ss.add('abe')
      expect(ss.hasPrefix('ab')).toBe(true)
      expect(ss.hasPrefix('abc')).toBe(true)
      expect(ss.hasPrefix('abd')).toBe(true)
      expect(ss.hasPrefix('abe')).toBe(true)
      expect(ss.hasPrefix('abf')).toBe(false)
    })
  })

  describe('hasSuffix', () => {
    it('should return true when suffix matches', () => {
      ss.add('hello')
      expect(ss.hasSuffix('llo')).toBe(true)
    })

    it('should return true when suffix is an exact word', () => {
      ss.add('hello')
      expect(ss.hasSuffix('hello')).toBe(true)
    })

    it('should return false when no word ends with suffix', () => {
      ss.add('hello')
      expect(ss.hasSuffix('xyz')).toBe(false)
    })

    it('should return true for empty suffix when set is non-empty', () => {
      ss.add('hello')
      expect(ss.hasSuffix('')).toBe(true)
    })

    it('should return false for empty suffix when set is empty', () => {
      expect(ss.hasSuffix('')).toBe(false)
    })

    it('should handle single character suffix', () => {
      ss.add('hello')
      ss.add('world')
      expect(ss.hasSuffix('o')).toBe(true)
      expect(ss.hasSuffix('d')).toBe(true)
      expect(ss.hasSuffix('x')).toBe(false)
    })

    it('should handle suffix longer than all words', () => {
      ss.add('hi')
      expect(ss.hasSuffix('hii')).toBe(false)
    })

    it('should work with multiple words sharing suffix', () => {
      ss.add('ing')
      ss.add('ring')
      ss.add('sing')
      expect(ss.hasSuffix('ing')).toBe(true)
      expect(ss.hasSuffix('ring')).toBe(true)
      expect(ss.hasSuffix('sing')).toBe(true)
      expect(ss.hasSuffix('king')).toBe(false)
    })
  })

  describe('hasSubstring', () => {
    it('should return true when substring is found', () => {
      ss.add('hello')
      expect(ss.hasSubstring('ell')).toBe(true)
    })

    it('should return true when substring is an exact word', () => {
      ss.add('hello')
      expect(ss.hasSubstring('hello')).toBe(true)
    })

    it('should return false when substring is not found', () => {
      ss.add('hello')
      expect(ss.hasSubstring('xyz')).toBe(false)
    })

    it('should return true for empty substring when non-empty', () => {
      ss.add('hello')
      expect(ss.hasSubstring('')).toBe(true)
    })

    it('should return false for empty substring when empty', () => {
      expect(ss.hasSubstring('')).toBe(false)
    })

    it('should find single character substrings', () => {
      ss.add('hello')
      expect(ss.hasSubstring('h')).toBe(true)
      expect(ss.hasSubstring('e')).toBe(true)
      expect(ss.hasSubstring('l')).toBe(true)
      expect(ss.hasSubstring('o')).toBe(true)
      expect(ss.hasSubstring('x')).toBe(false)
    })

    it('should search across all words', () => {
      ss.add('alpha')
      ss.add('beta')
      ss.add('gamma')
      expect(ss.hasSubstring('lph')).toBe(true)
      expect(ss.hasSubstring('et')).toBe(true)
      expect(ss.hasSubstring('amm')).toBe(true)
      expect(ss.hasSubstring('xyz')).toBe(false)
    })

    it('should find substring in middle of word', () => {
      ss.add('programming')
      expect(ss.hasSubstring('ogra')).toBe(true)
      expect(ss.hasSubstring('mmin')).toBe(true)
    })
  })

  describe('wordsWithPrefix', () => {
    it('should return all words with given prefix', () => {
      ss.add('apple')
      ss.add('application')
      ss.add('apply')
      ss.add('banana')
      const result = ss.wordsWithPrefix('app')
      expect(result.sort()).toEqual(['apple', 'application', 'apply'])
    })

    it('should return empty array when no words match', () => {
      ss.add('hello')
      expect(ss.wordsWithPrefix('xyz')).toEqual([])
    })

    it('should return all words for empty prefix', () => {
      ss.add('a')
      ss.add('b')
      ss.add('c')
      const result = ss.wordsWithPrefix('')
      expect(result.sort()).toEqual(['a', 'b', 'c'])
    })

    it('should return exact match word', () => {
      ss.add('hello')
      ss.add('hello world')
      const result = ss.wordsWithPrefix('hello')
      expect(result.sort()).toEqual(['hello', 'hello world'])
    })

    it('should return empty array for empty set', () => {
      expect(ss.wordsWithPrefix('a')).toEqual([])
    })

    it('should handle prefix that is longer than any word', () => {
      ss.add('hi')
      expect(ss.wordsWithPrefix('hiiii')).toEqual([])
    })

    it('should handle single character prefix', () => {
      ss.add('abc')
      ss.add('abd')
      ss.add('xyz')
      const result = ss.wordsWithPrefix('a')
      expect(result.sort()).toEqual(['abc', 'abd'])
    })
  })

  describe('wordsWithSuffix', () => {
    it('should return all words with given suffix', () => {
      ss.add('running')
      ss.add('swimming')
      ss.add('walking')
      ss.add('run')
      const result = ss.wordsWithSuffix('ing')
      expect(result.sort()).toEqual(['running', 'swimming', 'walking'])
    })

    it('should return empty array when no words match', () => {
      ss.add('hello')
      expect(ss.wordsWithSuffix('xyz')).toEqual([])
    })

    it('should return all words for empty suffix', () => {
      ss.add('a')
      ss.add('b')
      const result = ss.wordsWithSuffix('')
      expect(result.sort()).toEqual(['a', 'b'])
    })

    it('should return exact match word', () => {
      ss.add('test')
      ss.add('best')
      const result = ss.wordsWithSuffix('est')
      expect(result.sort()).toEqual(['best', 'test'])
    })

    it('should return empty array for empty set', () => {
      expect(ss.wordsWithSuffix('a')).toEqual([])
    })

    it('should handle single character suffix', () => {
      ss.add('abc')
      ss.add('adc')
      ss.add('xyz')
      const result = ss.wordsWithSuffix('c')
      expect(result.sort()).toEqual(['abc', 'adc'])
    })
  })

  describe('wordsContaining', () => {
    it('should return all words containing the substring', () => {
      ss.add('hello')
      ss.add('world')
      ss.add('jelly')
      const result = ss.wordsContaining('ell')
      expect(result.sort()).toEqual(['hello', 'jelly'])
    })

    it('should return empty array when no words match', () => {
      ss.add('hello')
      expect(ss.wordsContaining('xyz')).toEqual([])
    })

    it('should return all words for empty substring', () => {
      ss.add('a')
      ss.add('b')
      const result = ss.wordsContaining('')
      expect(result.sort()).toEqual(['a', 'b'])
    })

    it('should return empty array for empty set', () => {
      expect(ss.wordsContaining('a')).toEqual([])
    })

    it('should find substring at start of word', () => {
      ss.add('starting')
      ss.add('end')
      const result = ss.wordsContaining('start')
      expect(result).toEqual(['starting'])
    })

    it('should find substring at end of word', () => {
      ss.add('begin')
      ss.add('ending')
      const result = ss.wordsContaining('ing')
      expect(result).toEqual(['ending'])
    })
  })

  describe('size', () => {
    it('should return 0 for empty set', () => {
      expect(ss.size).toBe(0)
    })

    it('should return correct size after additions', () => {
      ss.add('a')
      ss.add('b')
      ss.add('c')
      expect(ss.size).toBe(3)
    })

    it('should not change on duplicate add', () => {
      ss.add('a')
      ss.add('a')
      expect(ss.size).toBe(1)
    })

    it('should decrease on delete', () => {
      ss.add('a')
      ss.add('b')
      ss.delete('a')
      expect(ss.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty set', () => {
      expect(ss.isEmpty()).toBe(true)
    })

    it('should return false after adding a word', () => {
      ss.add('word')
      expect(ss.isEmpty()).toBe(false)
    })

    it('should return true after clearing', () => {
      ss.add('word')
      ss.clear()
      expect(ss.isEmpty()).toBe(true)
    })

    it('should return true after deleting all words', () => {
      ss.add('a')
      ss.delete('a')
      expect(ss.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all words', () => {
      ss.add('a')
      ss.add('b')
      ss.add('c')
      ss.clear()
      expect(ss.size).toBe(0)
      expect(ss.isEmpty()).toBe(true)
    })

    it('should be safe to clear an empty set', () => {
      ss.clear()
      expect(ss.size).toBe(0)
    })

    it('should allow adding after clearing', () => {
      ss.add('old')
      ss.clear()
      ss.add('new')
      expect(ss.size).toBe(1)
      expect(ss.has('new')).toBe(true)
      expect(ss.has('old')).toBe(false)
    })

    it('should reset queries after clearing', () => {
      ss.add('hello')
      ss.clear()
      expect(ss.hasPrefix('h')).toBe(false)
      expect(ss.hasSuffix('o')).toBe(false)
      expect(ss.hasSubstring('ell')).toBe(false)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty set', () => {
      expect(ss.toArray()).toEqual([])
    })

    it('should return all words', () => {
      ss.add('a')
      ss.add('b')
      ss.add('c')
      const arr = ss.toArray()
      expect(arr.sort()).toEqual(['a', 'b', 'c'])
    })

    it('should return a new array each time', () => {
      ss.add('a')
      const arr1 = ss.toArray()
      const arr2 = ss.toArray()
      expect(arr1).not.toBe(arr2)
    })
  })

  describe('forEach', () => {
    it('should iterate over all words', () => {
      ss.add('x')
      ss.add('y')
      ss.add('z')
      const collected: string[] = []
      ss.forEach((word) => collected.push(word))
      expect(collected.sort()).toEqual(['x', 'y', 'z'])
    })

    it('should provide correct index', () => {
      ss.add('a')
      ss.add('b')
      const indices: number[] = []
      ss.forEach((_word, index) => indices.push(index))
      expect(indices).toEqual([0, 1])
    })

    it('should not iterate on empty set', () => {
      let count = 0
      ss.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should iterate over single word', () => {
      ss.add('only')
      const collected: string[] = []
      ss.forEach((word) => collected.push(word))
      expect(collected).toEqual(['only'])
    })
  })

  describe('clone', () => {
    it('should create an independent copy', () => {
      ss.add('a')
      ss.add('b')
      const cloned = ss.clone()
      expect(cloned.size).toBe(2)
      expect(cloned.has('a')).toBe(true)
      expect(cloned.has('b')).toBe(true)
    })

    it('should not affect original when modified', () => {
      ss.add('shared')
      const cloned = ss.clone()
      cloned.add('new')
      expect(ss.has('new')).toBe(false)
      expect(cloned.has('new')).toBe(true)
    })

    it('should not affect clone when original is modified', () => {
      ss.add('shared')
      const cloned = ss.clone()
      ss.add('original_only')
      expect(cloned.has('original_only')).toBe(false)
    })

    it('should clone an empty set', () => {
      const cloned = ss.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should clone with same query capabilities', () => {
      ss.add('apple')
      ss.add('application')
      const cloned = ss.clone()
      expect(cloned.hasPrefix('app')).toBe(true)
      expect(cloned.hasSuffix('tion')).toBe(true)
      expect(cloned.hasSubstring('ppl')).toBe(true)
    })
  })

  describe('static from', () => {
    it('should create a set from an array', () => {
      const s = SuffixSet.from(['a', 'b', 'c'])
      expect(s.size).toBe(3)
    })

    it('should create a set from a set', () => {
      const s = SuffixSet.from(new Set(['x', 'y']))
      expect(s.size).toBe(2)
    })

    it('should create a set from a generator', () => {
      function* gen() {
        yield 'one'
        yield 'two'
      }
      const s = SuffixSet.from(gen())
      expect(s.size).toBe(2)
    })

    it('should create an empty set from empty iterable', () => {
      const s = SuffixSet.from([])
      expect(s.size).toBe(0)
    })
  })

  describe('longestCommonPrefix', () => {
    it('should return empty string for empty set', () => {
      expect(ss.longestCommonPrefix()).toBe('')
    })

    it('should return the word itself for single word', () => {
      ss.add('hello')
      expect(ss.longestCommonPrefix()).toBe('hello')
    })

    it('should find common prefix among words', () => {
      ss.add('abc')
      ss.add('abd')
      ss.add('abe')
      expect(ss.longestCommonPrefix()).toBe('ab')
    })

    it('should return empty string when no common prefix', () => {
      ss.add('abc')
      ss.add('xyz')
      expect(ss.longestCommonPrefix()).toBe('')
    })

    it('should handle full common prefix', () => {
      ss.add('abc')
      ss.add('abc')
      expect(ss.longestCommonPrefix()).toBe('abc')
    })

    it('should handle words of different lengths', () => {
      ss.add('a')
      ss.add('ab')
      ss.add('abc')
      expect(ss.longestCommonPrefix()).toBe('a')
    })

    it('should handle prefix with single char common', () => {
      ss.add('alpha')
      ss.add('avocado')
      expect(ss.longestCommonPrefix()).toBe('a')
    })

    it('should handle empty string in set', () => {
      ss.add('')
      ss.add('hello')
      expect(ss.longestCommonPrefix()).toBe('')
    })
  })

  describe('stats', () => {
    it('should return stats for empty set', () => {
      const s = ss.stats()
      expect(s.size).toBe(0)
      expect(s.avgWordLength).toBe(0)
      expect(s.maxWordLength).toBe(0)
      expect(s.minWordLength).toBe(0)
    })

    it('should return correct stats for single word', () => {
      ss.add('hello')
      const s = ss.stats()
      expect(s.size).toBe(1)
      expect(s.avgWordLength).toBe(5)
      expect(s.maxWordLength).toBe(5)
      expect(s.minWordLength).toBe(5)
    })

    it('should return correct stats for multiple words', () => {
      ss.add('hi')
      ss.add('hello')
      ss.add('programming')
      const s = ss.stats()
      expect(s.size).toBe(3)
      expect(s.maxWordLength).toBe(11)
      expect(s.minWordLength).toBe(2)
    })

    it('should compute avgWordLength correctly', () => {
      ss.add('ab')
      ss.add('abcd')
      ss.add('abcdef')
      const s = ss.stats()
      expect(s.avgWordLength).toBe(4)
    })

    it('should count total nodes', () => {
      ss.add('a')
      ss.add('b')
      const s = ss.stats()
      expect(s.totalNodes).toBeGreaterThan(0)
    })

    it('should update stats after delete', () => {
      ss.add('hello')
      ss.add('hi')
      ss.delete('hello')
      const s = ss.stats()
      expect(s.size).toBe(1)
      expect(s.maxWordLength).toBe(2)
      expect(s.minWordLength).toBe(2)
    })

    it('should update stats after clear', () => {
      ss.add('hello')
      ss.clear()
      const s = ss.stats()
      expect(s.size).toBe(0)
      expect(s.avgWordLength).toBe(0)
      expect(s.maxWordLength).toBe(0)
      expect(s.minWordLength).toBe(0)
    })

    it('should return a valid SuffixSetStats object', () => {
      ss.add('test')
      const s: SuffixSetStats = ss.stats()
      expect(typeof s.size).toBe('number')
      expect(typeof s.totalNodes).toBe('number')
      expect(typeof s.avgWordLength).toBe('number')
      expect(typeof s.maxWordLength).toBe('number')
      expect(typeof s.minWordLength).toBe('number')
    })
  })

  describe('edge cases - words sharing prefix/suffix', () => {
    it('should handle words that are prefixes of each other', () => {
      ss.add('a')
      ss.add('ab')
      ss.add('abc')
      ss.add('abcd')
      expect(ss.has('a')).toBe(true)
      expect(ss.has('ab')).toBe(true)
      expect(ss.has('abc')).toBe(true)
      expect(ss.has('abcd')).toBe(true)
      expect(ss.hasPrefix('a')).toBe(true)
      expect(ss.hasPrefix('ab')).toBe(true)
      expect(ss.hasPrefix('abc')).toBe(true)
      expect(ss.hasPrefix('abcd')).toBe(true)
      expect(ss.hasPrefix('abcde')).toBe(false)
    })

    it('should handle words that are suffixes of each other', () => {
      ss.add('ing')
      ss.add('ring')
      ss.add('tring')
      ss.add('string')
      expect(ss.hasSuffix('ing')).toBe(true)
      expect(ss.hasSuffix('ring')).toBe(true)
      expect(ss.hasSuffix('tring')).toBe(true)
      expect(ss.wordsWithSuffix('ing').sort()).toEqual(['ing', 'ring', 'string', 'tring'])
    })

    it('should delete correctly when words share prefix', () => {
      ss.add('abc')
      ss.add('abd')
      ss.delete('abc')
      expect(ss.has('abc')).toBe(false)
      expect(ss.has('abd')).toBe(true)
      expect(ss.hasPrefix('ab')).toBe(true)
      expect(ss.hasPrefix('abc')).toBe(false)
    })

    it('should delete correctly when words share suffix', () => {
      ss.add('ring')
      ss.add('sing')
      ss.delete('ring')
      expect(ss.hasSuffix('ing')).toBe(true)
      expect(ss.hasSuffix('ring')).toBe(false)
    })
  })

  describe('edge cases - special characters', () => {
    it('should handle strings with spaces', () => {
      ss.add('hello world')
      ss.add('hello moon')
      expect(ss.has('hello world')).toBe(true)
      expect(ss.hasPrefix('hello ')).toBe(true)
      expect(ss.wordsWithPrefix('hello ').sort()).toEqual(['hello moon', 'hello world'])
    })

    it('should handle strings with tabs', () => {
      ss.add('hello\tworld')
      expect(ss.has('hello\tworld')).toBe(true)
      expect(ss.hasSubstring('\t')).toBe(true)
    })

    it('should handle strings with newlines', () => {
      ss.add('line1\nline2')
      expect(ss.has('line1\nline2')).toBe(true)
      expect(ss.hasSubstring('\n')).toBe(true)
    })

    it('should handle strings with punctuation', () => {
      ss.add('hello!')
      ss.add('hello.')
      ss.add('hello?')
      expect(ss.wordsWithPrefix('hello').sort()).toEqual(['hello!', 'hello.', 'hello?'])
    })

    it('should handle mixed case', () => {
      ss.add('Hello')
      ss.add('HELLO')
      ss.add('hello')
      expect(ss.size).toBe(3)
      expect(ss.has('Hello')).toBe(true)
      expect(ss.has('HELLO')).toBe(true)
      expect(ss.has('hello')).toBe(true)
    })

    it('should handle numeric strings', () => {
      ss.add('123')
      ss.add('1234')
      ss.add('0123')
      expect(ss.hasPrefix('12')).toBe(true)
      expect(ss.hasSuffix('23')).toBe(true)
    })
  })

  describe('edge cases - unicode', () => {
    it('should handle accented characters', () => {
      ss.add('café')
      ss.add('naïve')
      ss.add('résumé')
      expect(ss.has('café')).toBe(true)
      expect(ss.hasPrefix('caf')).toBe(true)
      expect(ss.hasSuffix('sumé')).toBe(true)
    })

    it('should handle CJK characters', () => {
      ss.add('你好')
      ss.add('你好世界')
      expect(ss.has('你好')).toBe(true)
      expect(ss.hasPrefix('你好')).toBe(true)
      expect(ss.wordsWithPrefix('你好').sort()).toEqual(['你好', '你好世界'])
    })

    it('should handle emoji', () => {
      ss.add('🎉party')
      ss.add('🎉celebration')
      expect(ss.hasPrefix('🎉')).toBe(true)
      expect(ss.wordsWithPrefix('🎉').sort()).toEqual(['🎉celebration', '🎉party'])
    })

    it('should handle mixed unicode', () => {
      ss.add('hello世界')
      ss.add('world🎉')
      expect(ss.hasSubstring('世界')).toBe(true)
      expect(ss.hasSubstring('🎉')).toBe(true)
    })
  })

  describe('large sets', () => {
    it('should handle 10000+ words', () => {
      const words: string[] = []
      for (let i = 0; i < 10000; i++) {
        words.push(`word_${i.toString().padStart(5, '0')}`)
      }
      const s = SuffixSet.from(words)
      expect(s.size).toBe(10000)
      expect(s.has('word_00000')).toBe(true)
      expect(s.has('word_09999')).toBe(true)
      expect(s.has('word_05000')).toBe(true)
      expect(s.has('word_10000')).toBe(false)
    })

    it('should handle prefix queries on large sets', () => {
      const words: string[] = []
      for (let i = 0; i < 5000; i++) {
        words.push(`prefix_${i}`)
      }
      for (let i = 0; i < 5000; i++) {
        words.push(`other_${i}`)
      }
      const s = SuffixSet.from(words)
      const result = s.wordsWithPrefix('prefix_')
      expect(result.length).toBe(5000)
      const otherResult = s.wordsWithPrefix('other_')
      expect(otherResult.length).toBe(5000)
    })

    it('should handle suffix queries on large sets', () => {
      const words: string[] = []
      for (let i = 0; i < 10000; i++) {
        words.push(`item_${i}_suffix`)
      }
      const s = SuffixSet.from(words)
      const result = s.wordsWithSuffix('_suffix')
      expect(result.length).toBe(10000)
    })

    it('should handle substring queries on large sets', () => {
      const words: string[] = []
      for (let i = 0; i < 1000; i++) {
        words.push(`needle_in_haystack_${i}`)
      }
      for (let i = 0; i < 9000; i++) {
        words.push(`other_${i}`)
      }
      const s = SuffixSet.from(words)
      const result = s.wordsContaining('needle')
      expect(result.length).toBe(1000)
    })

    it('should handle delete on large sets', () => {
      const words: string[] = []
      for (let i = 0; i < 10000; i++) {
        words.push(`word${i}`)
      }
      const s = SuffixSet.from(words)
      expect(s.delete('word5000')).toBe(true)
      expect(s.size).toBe(9999)
      expect(s.has('word5000')).toBe(false)
      expect(s.has('word4999')).toBe(true)
      expect(s.has('word5001')).toBe(true)
    })

    it('should handle stats on large sets', () => {
      const words: string[] = []
      for (let i = 0; i < 10000; i++) {
        words.push(`word_${i.toString().padStart(5, '0')}`)
      }
      const s = SuffixSet.from(words)
      const stats = s.stats()
      expect(stats.size).toBe(10000)
      expect(stats.maxWordLength).toBe(10)
      expect(stats.minWordLength).toBe(10)
      expect(stats.avgWordLength).toBe(10)
    })

    it('should handle clone of large sets', () => {
      const words: string[] = []
      for (let i = 0; i < 5000; i++) {
        words.push(`word${i}`)
      }
      const s = SuffixSet.from(words)
      const c = s.clone()
      expect(c.size).toBe(5000)
      expect(c.has('word0')).toBe(true)
      expect(c.has('word4999')).toBe(true)
    })
  })

  describe('integration', () => {
    it('should support full lifecycle', () => {
      ss.add('hello')
      ss.add('help')
      ss.add('held')
      expect(ss.size).toBe(3)
      expect(ss.hasPrefix('hel')).toBe(true)
      expect(ss.wordsWithPrefix('hel').sort()).toEqual(['held', 'hello', 'help'])
      expect(ss.hasSuffix('lp')).toBe(true)
      expect(ss.wordsWithSuffix('lo')).toEqual(['hello'])
      expect(ss.hasSubstring('ell')).toBe(true)
      ss.delete('help')
      expect(ss.size).toBe(2)
      expect(ss.has('help')).toBe(false)
      const cloned = ss.clone()
      ss.clear()
      expect(ss.isEmpty()).toBe(true)
      expect(cloned.size).toBe(2)
    })

    it('should work with from + queries + delete', () => {
      const s = SuffixSet.from(['apple', 'application', 'banana', 'bandana'])
      expect(s.wordsWithPrefix('app').sort()).toEqual(['apple', 'application'])
      expect(s.wordsWithSuffix('ana').sort()).toEqual(['banana', 'bandana'])
      s.delete('banana')
      expect(s.wordsWithSuffix('ana')).toEqual(['bandana'])
      expect(s.size).toBe(3)
    })

    it('should maintain consistency across operations', () => {
      ss.add('testing')
      expect(ss.has('testing')).toBe(true)
      expect(ss.hasPrefix('test')).toBe(true)
      expect(ss.hasSuffix('ing')).toBe(true)
      expect(ss.hasSubstring('sti')).toBe(true)
      ss.delete('testing')
      expect(ss.has('testing')).toBe(false)
      expect(ss.hasPrefix('test')).toBe(false)
      expect(ss.hasSuffix('ing')).toBe(false)
      expect(ss.hasSubstring('sti')).toBe(false)
    })

    it('should handle forEach with index correctly', () => {
      ss.add('c')
      ss.add('a')
      ss.add('b')
      const pairs: Array<[string, number]> = []
      ss.forEach((word, idx) => pairs.push([word, idx]))
      expect(pairs.length).toBe(3)
      expect(pairs[0]![1]).toBe(0)
      expect(pairs[1]![1]).toBe(1)
      expect(pairs[2]![1]).toBe(2)
    })

    it('should handle empty string prefix/suffix queries correctly', () => {
      ss.add('word')
      const prefixAll = ss.wordsWithPrefix('')
      expect(prefixAll).toEqual(['word'])
      const suffixAll = ss.wordsWithSuffix('')
      expect(suffixAll).toEqual(['word'])
      const containingAll = ss.wordsContaining('')
      expect(containingAll).toEqual(['word'])
    })

    it('should handle stats with varying word lengths', () => {
      ss.add('')
      ss.add('a')
      ss.add('ab')
      ss.add('abcdef')
      const s = ss.stats()
      expect(s.size).toBe(4)
      expect(s.minWordLength).toBe(0)
      expect(s.maxWordLength).toBe(6)
    })
  })
})
