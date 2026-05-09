import { describe, it, expect } from 'vitest'
import { Multisearch } from '../../src/core/multisearch/multisearch.js'
import type { MultisearchMatch } from '../../src/core/multisearch/types.js'

describe('Multisearch', () => {
  describe('constructor', () => {
    it('should create instance from single pattern', () => {
      const ms = new Multisearch(['hello'])
      expect(ms.getPatterns()).toEqual(['hello'])
    })

    it('should create instance from multiple patterns', () => {
      const ms = new Multisearch(['he', 'she', 'his', 'hers'])
      expect(ms.getPatterns()).toEqual(['he', 'she', 'his', 'hers'])
    })

    it('should handle empty patterns list', () => {
      const ms = new Multisearch([])
      expect(ms.getPatterns()).toEqual([])
    })

    it('should filter out empty string patterns', () => {
      const ms = new Multisearch(['hello', '', 'world'])
      expect(ms.getPatterns()).toEqual(['hello', 'world'])
    })

    it('should handle single character patterns', () => {
      const ms = new Multisearch(['a', 'b', 'c'])
      expect(ms.getPatterns()).toEqual(['a', 'b', 'c'])
    })

    it('should handle duplicate patterns', () => {
      const ms = new Multisearch(['he', 'he', 'she'])
      expect(ms.getPatterns()).toEqual(['he', 'he', 'she'])
    })

    it('should handle all empty patterns', () => {
      const ms = new Multisearch(['', '', ''])
      expect(ms.getPatterns()).toEqual([])
    })
  })

  describe('search - basic single pattern', () => {
    it('should find a single pattern at the beginning', () => {
      const ms = new Multisearch(['hello'])
      const results = ms.search('hello world')
      expect(results).toEqual([{ pattern: 'hello', index: 0 }])
    })

    it('should find a single pattern in the middle', () => {
      const ms = new Multisearch(['lo wo'])
      const results = ms.search('hello world')
      expect(results).toEqual([{ pattern: 'lo wo', index: 3 }])
    })

    it('should find a single pattern at the end', () => {
      const ms = new Multisearch(['world'])
      const results = ms.search('hello world')
      expect(results).toEqual([{ pattern: 'world', index: 6 }])
    })

    it('should find multiple occurrences of a single pattern', () => {
      const ms = new Multisearch(['ab'])
      const results = ms.search('ababab')
      expect(results).toEqual([
        { pattern: 'ab', index: 0 },
        { pattern: 'ab', index: 2 },
        { pattern: 'ab', index: 4 },
      ])
    })

    it('should return empty array when pattern not found', () => {
      const ms = new Multisearch(['xyz'])
      expect(ms.search('hello world')).toEqual([])
    })

    it('should find exact match of entire text', () => {
      const ms = new Multisearch(['hello'])
      expect(ms.search('hello')).toEqual([{ pattern: 'hello', index: 0 }])
    })

    it('should return empty for empty text', () => {
      const ms = new Multisearch(['hello'])
      expect(ms.search('')).toEqual([])
    })
  })

  describe('search - multiple patterns', () => {
    it('should find patterns he, she, his, hers in classic example', () => {
      const ms = new Multisearch(['he', 'she', 'his', 'hers'])
      const results = ms.search('ushers')
      const patterns = results.map(r => r.pattern)
      expect(patterns).toContain('he')
      expect(patterns).toContain('she')
      expect(patterns).toContain('hers')
    })

    it('should find correct positions for he and she in "she"', () => {
      const ms = new Multisearch(['he', 'she'])
      const results = ms.search('she')
      expect(results).toEqual([
        { pattern: 'she', index: 0 },
        { pattern: 'he', index: 1 },
      ])
    })

    it('should find multiple patterns at different positions', () => {
      const ms = new Multisearch(['cat', 'dog'])
      const results = ms.search('cat and dog')
      expect(results).toEqual([
        { pattern: 'cat', index: 0 },
        { pattern: 'dog', index: 8 },
      ])
    })

    it('should find all patterns that are substrings of each other', () => {
      const ms = new Multisearch(['a', 'ab', 'abc'])
      const results = ms.search('abc')
      expect(results).toEqual([
        { pattern: 'a', index: 0 },
        { pattern: 'ab', index: 0 },
        { pattern: 'abc', index: 0 },
      ])
    })

    it('should handle patterns with no matches', () => {
      const ms = new Multisearch(['xyz', 'abc'])
      expect(ms.search('hello world')).toEqual([])
    })

    it('should find patterns in different parts of text', () => {
      const ms = new Multisearch(['red', 'blue', 'green'])
      const results = ms.search('red and blue and green')
      expect(results).toEqual([
        { pattern: 'red', index: 0 },
        { pattern: 'blue', index: 8 },
        { pattern: 'green', index: 17 },
      ])
    })
  })

  describe('search - overlapping matches', () => {
    it('should find overlapping matches for repeated characters', () => {
      const ms = new Multisearch(['aa'])
      const results = ms.search('aaaa')
      expect(results).toHaveLength(3)
      expect(results).toEqual([
        { pattern: 'aa', index: 0 },
        { pattern: 'aa', index: 1 },
        { pattern: 'aa', index: 2 },
      ])
    })

    it('should find overlapping patterns with different lengths', () => {
      const ms = new Multisearch(['ab', 'abc'])
      const results = ms.search('abc')
      expect(results).toEqual([
        { pattern: 'ab', index: 0 },
        { pattern: 'abc', index: 0 },
      ])
    })

    it('should find all overlapping occurrences of abab in abababab', () => {
      const ms = new Multisearch(['abab'])
      const results = ms.search('abababab')
      expect(results).toEqual([
        { pattern: 'abab', index: 0 },
        { pattern: 'abab', index: 2 },
        { pattern: 'abab', index: 4 },
      ])
    })

    it('should handle overlapping single character patterns', () => {
      const ms = new Multisearch(['a', 'b'])
      const results = ms.search('ab')
      expect(results).toEqual([
        { pattern: 'a', index: 0 },
        { pattern: 'b', index: 1 },
      ])
    })
  })

  describe('search - empty inputs', () => {
    it('should return empty for empty patterns list', () => {
      const ms = new Multisearch([])
      expect(ms.search('hello')).toEqual([])
    })

    it('should return empty for both empty', () => {
      const ms = new Multisearch([])
      expect(ms.search('')).toEqual([])
    })
  })

  describe('search - single character patterns', () => {
    it('should find single character pattern', () => {
      const ms = new Multisearch(['a'])
      const results = ms.search('banana')
      expect(results).toHaveLength(3)
      expect(results.map(r => r.index)).toEqual([1, 3, 5])
    })

    it('should find multiple single character patterns', () => {
      const ms = new Multisearch(['a', 'b'])
      const results = ms.search('abba')
      expect(results).toHaveLength(4)
    })

    it('should find single character at beginning', () => {
      const ms = new Multisearch(['h'])
      expect(ms.search('hello')).toEqual([{ pattern: 'h', index: 0 }])
    })

    it('should find single character at end', () => {
      const ms = new Multisearch(['o'])
      expect(ms.search('hello')).toEqual([{ pattern: 'o', index: 4 }])
    })
  })

  describe('search - patterns at boundaries', () => {
    it('should find pattern at very beginning of text', () => {
      const ms = new Multisearch(['abc'])
      const results = ms.search('abcdefgh')
      expect(results[0]!.index).toBe(0)
    })

    it('should find pattern at very end of text', () => {
      const ms = new Multisearch(['fgh'])
      const results = ms.search('abcdefgh')
      expect(results[0]!.index).toBe(5)
    })

    it('should find pattern that spans entire text', () => {
      const ms = new Multisearch(['abcdef'])
      expect(ms.search('abcdef')).toEqual([{ pattern: 'abcdef', index: 0 }])
    })
  })

  describe('search - duplicate patterns', () => {
    it('should find duplicate patterns in results', () => {
      const ms = new Multisearch(['ab', 'ab'])
      const results = ms.search('ab')
      expect(results).toHaveLength(2)
      expect(results[0]).toEqual({ pattern: 'ab', index: 0 })
      expect(results[1]).toEqual({ pattern: 'ab', index: 0 })
    })

    it('should handle duplicate single char patterns', () => {
      const ms = new Multisearch(['a', 'a'])
      const results = ms.search('abc')
      expect(results).toHaveLength(2)
    })
  })

  describe('searchFirst', () => {
    it('should return first occurrence only', () => {
      const ms = new Multisearch(['ab'])
      const result = ms.searchFirst('ababab')
      expect(result).toEqual({ pattern: 'ab', index: 0 })
    })

    it('should return undefined for no matches', () => {
      const ms = new Multisearch(['xyz'])
      expect(ms.searchFirst('hello')).toBeUndefined()
    })

    it('should return undefined for empty text', () => {
      const ms = new Multisearch(['hello'])
      expect(ms.searchFirst('')).toBeUndefined()
    })

    it('should return undefined for empty patterns', () => {
      const ms = new Multisearch([])
      expect(ms.searchFirst('hello')).toBeUndefined()
    })

    it('should return first match from multiple patterns', () => {
      const ms = new Multisearch(['cat', 'dog'])
      const result = ms.searchFirst('dog and cat')
      expect(result).toEqual({ pattern: 'dog', index: 0 })
    })

    it('should find pattern at end', () => {
      const ms = new Multisearch(['end'])
      const result = ms.searchFirst('the end')
      expect(result).toEqual({ pattern: 'end', index: 4 })
    })

    it('should find shorter pattern that appears first', () => {
      const ms = new Multisearch(['xyz', 'ab'])
      const result = ms.searchFirst('xyzab')
      expect(result).toEqual({ pattern: 'xyz', index: 0 })
    })

    it('should return first match by text position', () => {
      const ms = new Multisearch(['bb', 'aa'])
      const result = ms.searchFirst('aabb')
      expect(result).toEqual({ pattern: 'aa', index: 0 })
    })

    it('should return match when text equals pattern', () => {
      const ms = new Multisearch(['exact'])
      expect(ms.searchFirst('exact')).toEqual({ pattern: 'exact', index: 0 })
    })

    it('should handle pattern appearing after no-match prefix', () => {
      const ms = new Multisearch(['xyz'])
      const result = ms.searchFirst('abcxyz')
      expect(result).toEqual({ pattern: 'xyz', index: 3 })
    })

    it('should find match with multiple candidate patterns', () => {
      const ms = new Multisearch(['ab', 'cd', 'ef'])
      const result = ms.searchFirst('--cd--ef--ab--')
      expect(result).toEqual({ pattern: 'cd', index: 2 })
    })

    it('should return first even when longer match exists later', () => {
      const ms = new Multisearch(['abc', 'xyz'])
      const result = ms.searchFirst('abcxyz')
      expect(result).toEqual({ pattern: 'abc', index: 0 })
    })
  })

  describe('countMatches', () => {
    it('should count total matches per pattern', () => {
      const ms = new Multisearch(['ab', 'cd'])
      const counts = ms.countMatches('abcdabcd')
      expect(counts.get('ab')).toBe(2)
      expect(counts.get('cd')).toBe(2)
    })

    it('should return empty map for no matches', () => {
      const ms = new Multisearch(['xyz'])
      const counts = ms.countMatches('hello')
      expect(counts.size).toBe(0)
    })

    it('should count overlapping matches', () => {
      const ms = new Multisearch(['aa'])
      const counts = ms.countMatches('aaaa')
      expect(counts.get('aa')).toBe(3)
    })

    it('should handle multiple pattern types', () => {
      const ms = new Multisearch(['he', 'she', 'his', 'hers'])
      const counts = ms.countMatches('ushers')
      expect(counts.get('he')).toBe(1)
      expect(counts.get('she')).toBe(1)
      expect(counts.get('hers')).toBe(1)
      expect(counts.get('his')).toBeUndefined()
    })

    it('should return empty map for empty text', () => {
      const ms = new Multisearch(['hello'])
      const counts = ms.countMatches('')
      expect(counts.size).toBe(0)
    })

    it('should return empty map for empty patterns', () => {
      const ms = new Multisearch([])
      const counts = ms.countMatches('hello')
      expect(counts.size).toBe(0)
    })

    it('should count single character matches', () => {
      const ms = new Multisearch(['a'])
      const counts = ms.countMatches('banana')
      expect(counts.get('a')).toBe(3)
    })

    it('should count duplicate pattern matches separately', () => {
      const ms = new Multisearch(['ab', 'ab'])
      const counts = ms.countMatches('ab')
      expect(counts.get('ab')).toBe(2)
    })

    it('should return Map instance', () => {
      const ms = new Multisearch(['a'])
      const counts = ms.countMatches('a')
      expect(counts).toBeInstanceOf(Map)
    })
  })

  describe('containsAny', () => {
    it('should return true when pattern found', () => {
      const ms = new Multisearch(['hello'])
      expect(ms.containsAny('hello world')).toBe(true)
    })

    it('should return false when no pattern found', () => {
      const ms = new Multisearch(['xyz'])
      expect(ms.containsAny('hello world')).toBe(false)
    })

    it('should return false for empty text', () => {
      const ms = new Multisearch(['hello'])
      expect(ms.containsAny('')).toBe(false)
    })

    it('should return false for empty patterns', () => {
      const ms = new Multisearch([])
      expect(ms.containsAny('hello')).toBe(false)
    })

    it('should return true for multiple patterns when one matches', () => {
      const ms = new Multisearch(['cat', 'dog', 'bird'])
      expect(ms.containsAny('I have a dog')).toBe(true)
    })

    it('should return true for pattern at end', () => {
      const ms = new Multisearch(['end'])
      expect(ms.containsAny('the end')).toBe(true)
    })

    it('should return true for pattern at start', () => {
      const ms = new Multisearch(['start'])
      expect(ms.containsAny('start here')).toBe(true)
    })

    it('should return true when pattern matches entire text', () => {
      const ms = new Multisearch(['abc'])
      expect(ms.containsAny('abc')).toBe(true)
    })

    it('should return false for partial match', () => {
      const ms = new Multisearch(['abcd'])
      expect(ms.containsAny('abc')).toBe(false)
    })

    it('should return true for multiple matching patterns', () => {
      const ms = new Multisearch(['ab', 'bc', 'cd'])
      expect(ms.containsAny('abcd')).toBe(true)
    })
  })

  describe('containsAll', () => {
    it('should return true when all patterns found', () => {
      const ms = new Multisearch(['cat', 'dog'])
      expect(ms.containsAll('cat and dog')).toBe(true)
    })

    it('should return false when one pattern missing', () => {
      const ms = new Multisearch(['cat', 'dog'])
      expect(ms.containsAll('cat and bird')).toBe(false)
    })

    it('should return true for empty patterns list', () => {
      const ms = new Multisearch([])
      expect(ms.containsAll('hello')).toBe(true)
    })

    it('should return false for empty text with patterns', () => {
      const ms = new Multisearch(['hello'])
      expect(ms.containsAll('')).toBe(false)
    })

    it('should return true when single pattern found', () => {
      const ms = new Multisearch(['hello'])
      expect(ms.containsAll('hello world')).toBe(true)
    })

    it('should return false when no patterns found', () => {
      const ms = new Multisearch(['xyz', 'abc'])
      expect(ms.containsAll('hello world')).toBe(false)
    })

    it('should handle patterns that overlap', () => {
      const ms = new Multisearch(['ab', 'bc'])
      expect(ms.containsAll('abcd')).toBe(true)
    })

    it('should handle duplicate patterns', () => {
      const ms = new Multisearch(['ab', 'ab'])
      expect(ms.containsAll('ab')).toBe(true)
    })

    it('should return true when all single char patterns present', () => {
      const ms = new Multisearch(['a', 'b', 'c'])
      expect(ms.containsAll('abc')).toBe(true)
    })

    it('should return false when one single char missing', () => {
      const ms = new Multisearch(['a', 'b', 'c', 'd'])
      expect(ms.containsAll('abc')).toBe(false)
    })
  })

  describe('getPatterns', () => {
    it('should return copy of patterns array', () => {
      const ms = new Multisearch(['a', 'b', 'c'])
      const patterns = ms.getPatterns()
      patterns.push('d')
      expect(ms.getPatterns()).toEqual(['a', 'b', 'c'])
    })

    it('should return empty array for empty patterns', () => {
      const ms = new Multisearch([])
      expect(ms.getPatterns()).toEqual([])
    })

    it('should return all patterns including duplicates', () => {
      const ms = new Multisearch(['ab', 'ab', 'cd'])
      expect(ms.getPatterns()).toEqual(['ab', 'ab', 'cd'])
    })
  })

  describe('addPattern', () => {
    it('should add a new pattern', () => {
      const ms = new Multisearch(['hello'])
      ms.addPattern('world')
      expect(ms.getPatterns()).toEqual(['hello', 'world'])
    })

    it('should find newly added pattern', () => {
      const ms = new Multisearch(['hello'])
      ms.addPattern('world')
      const results = ms.search('hello world')
      expect(results).toHaveLength(2)
    })

    it('should ignore empty pattern', () => {
      const ms = new Multisearch(['hello'])
      ms.addPattern('')
      expect(ms.getPatterns()).toEqual(['hello'])
    })

    it('should add duplicate pattern', () => {
      const ms = new Multisearch(['hello'])
      ms.addPattern('hello')
      expect(ms.getPatterns()).toEqual(['hello', 'hello'])
    })

    it('should find matches after adding multiple patterns', () => {
      const ms = new Multisearch(['ab'])
      ms.addPattern('cd')
      ms.addPattern('ef')
      const results = ms.search('abcdef')
      expect(results).toHaveLength(3)
    })

    it('should add single character pattern', () => {
      const ms = new Multisearch(['hello'])
      ms.addPattern('x')
      expect(ms.search('xyz')).toHaveLength(1)
    })

    it('should find matches from both original and added patterns', () => {
      const ms = new Multisearch(['cat'])
      ms.addPattern('dog')
      const results = ms.search('cat and dog')
      const patterns = results.map(r => r.pattern)
      expect(patterns).toContain('cat')
      expect(patterns).toContain('dog')
    })

    it('should maintain existing matches after adding pattern', () => {
      const ms = new Multisearch(['hello'])
      const before = ms.search('hello world')
      expect(before).toHaveLength(1)
      ms.addPattern('world')
      const after = ms.search('hello world')
      expect(after).toHaveLength(2)
    })

    it('should find overlapping matches after adding', () => {
      const ms = new Multisearch(['ab'])
      ms.addPattern('bc')
      const results = ms.search('abcd')
      expect(results).toHaveLength(2)
    })

    it('should handle adding pattern that matches existing text', () => {
      const ms = new Multisearch(['xyz'])
      ms.addPattern('hello')
      expect(ms.containsAny('hello world')).toBe(true)
    })
  })

  describe('removePattern', () => {
    it('should remove an existing pattern', () => {
      const ms = new Multisearch(['hello', 'world'])
      const result = ms.removePattern('hello')
      expect(result).toBe(true)
      expect(ms.getPatterns()).toEqual(['world'])
    })

    it('should return false for non-existent pattern', () => {
      const ms = new Multisearch(['hello'])
      const result = ms.removePattern('world')
      expect(result).toBe(false)
      expect(ms.getPatterns()).toEqual(['hello'])
    })

    it('should no longer find removed pattern', () => {
      const ms = new Multisearch(['cat', 'dog'])
      ms.removePattern('cat')
      const results = ms.search('cat and dog')
      expect(results).toHaveLength(1)
      expect(results[0]!.pattern).toBe('dog')
    })

    it('should remove only first occurrence of duplicate', () => {
      const ms = new Multisearch(['ab', 'ab', 'cd'])
      ms.removePattern('ab')
      expect(ms.getPatterns()).toEqual(['ab', 'cd'])
    })

    it('should handle removing from empty list', () => {
      const ms = new Multisearch([])
      expect(ms.removePattern('hello')).toBe(false)
    })

    it('should handle removing last pattern', () => {
      const ms = new Multisearch(['only'])
      ms.removePattern('only')
      expect(ms.getPatterns()).toEqual([])
      expect(ms.search('only')).toEqual([])
    })

    it('should rebuild automaton correctly after removal', () => {
      const ms = new Multisearch(['he', 'she', 'his'])
      ms.removePattern('his')
      const results = ms.search('she')
      expect(results).toHaveLength(2)
      expect(results.map(r => r.pattern)).toContain('she')
      expect(results.map(r => r.pattern)).toContain('he')
    })

    it('should handle multiple removals', () => {
      const ms = new Multisearch(['a', 'b', 'c', 'd'])
      ms.removePattern('b')
      ms.removePattern('d')
      expect(ms.getPatterns()).toEqual(['a', 'c'])
    })
  })

  describe('setPatterns', () => {
    it('should replace all patterns', () => {
      const ms = new Multisearch(['old'])
      ms.setPatterns(['new1', 'new2'])
      expect(ms.getPatterns()).toEqual(['new1', 'new2'])
    })

    it('should filter out empty strings when setting', () => {
      const ms = new Multisearch(['old'])
      ms.setPatterns(['a', '', 'b'])
      expect(ms.getPatterns()).toEqual(['a', 'b'])
    })

    it('should work with empty array', () => {
      const ms = new Multisearch(['hello'])
      ms.setPatterns([])
      expect(ms.getPatterns()).toEqual([])
      expect(ms.search('hello')).toEqual([])
    })

    it('should find new patterns after set', () => {
      const ms = new Multisearch(['cat'])
      ms.setPatterns(['dog', 'bird'])
      expect(ms.search('dog and bird')).toHaveLength(2)
    })

    it('should not find old patterns after set', () => {
      const ms = new Multisearch(['cat'])
      ms.setPatterns(['dog'])
      expect(ms.search('cat')).toEqual([])
      expect(ms.search('dog')).toHaveLength(1)
    })

    it('should handle setting duplicate patterns', () => {
      const ms = new Multisearch(['a'])
      ms.setPatterns(['b', 'b', 'c'])
      expect(ms.getPatterns()).toEqual(['b', 'b', 'c'])
    })
  })

  describe('clone', () => {
    it('should create independent copy', () => {
      const ms = new Multisearch(['hello'])
      const clone = ms.clone()
      clone.addPattern('world')
      expect(ms.getPatterns()).toEqual(['hello'])
      expect(clone.getPatterns()).toEqual(['hello', 'world'])
    })

    it('should produce same search results', () => {
      const ms = new Multisearch(['he', 'she', 'his'])
      const clone = ms.clone()
      expect(clone.search('ushers')).toEqual(ms.search('ushers'))
    })

    it('should have same patterns', () => {
      const ms = new Multisearch(['a', 'b', 'c'])
      const clone = ms.clone()
      expect(clone.getPatterns()).toEqual(ms.getPatterns())
    })

    it('should handle cloning empty instance', () => {
      const ms = new Multisearch([])
      const clone = ms.clone()
      expect(clone.getPatterns()).toEqual([])
      expect(clone.search('hello')).toEqual([])
    })

    it('should handle removal on clone without affecting original', () => {
      const ms = new Multisearch(['a', 'b'])
      const clone = ms.clone()
      clone.removePattern('a')
      expect(ms.getPatterns()).toEqual(['a', 'b'])
      expect(clone.getPatterns()).toEqual(['b'])
    })
  })

  describe('static search', () => {
    it('should find matches without creating instance', () => {
      const results = Multisearch.search('hello world', ['hello', 'world'])
      expect(results).toEqual([
        { pattern: 'hello', index: 0 },
        { pattern: 'world', index: 6 },
      ])
    })

    it('should return empty for no matches', () => {
      const results = Multisearch.search('hello', ['xyz'])
      expect(results).toEqual([])
    })

    it('should handle empty patterns', () => {
      const results = Multisearch.search('hello', [])
      expect(results).toEqual([])
    })

    it('should handle empty text', () => {
      const results = Multisearch.search('', ['hello'])
      expect(results).toEqual([])
    })

    it('should find multiple occurrences', () => {
      const results = Multisearch.search('ababab', ['ab'])
      expect(results).toHaveLength(3)
    })
  })

  describe('static searchFirst', () => {
    it('should find first match without creating instance', () => {
      const result = Multisearch.searchFirst('hello world', ['world', 'hello'])
      expect(result).toEqual({ pattern: 'hello', index: 0 })
    })

    it('should return undefined for no matches', () => {
      const result = Multisearch.searchFirst('hello', ['xyz'])
      expect(result).toBeUndefined()
    })

    it('should handle empty patterns', () => {
      const result = Multisearch.searchFirst('hello', [])
      expect(result).toBeUndefined()
    })

    it('should handle empty text', () => {
      const result = Multisearch.searchFirst('', ['hello'])
      expect(result).toBeUndefined()
    })
  })

  describe('static countMatches', () => {
    it('should count matches without creating instance', () => {
      const counts = Multisearch.countMatches('abcabc', ['ab', 'bc'])
      expect(counts.get('ab')).toBe(2)
      expect(counts.get('bc')).toBe(2)
    })

    it('should return empty map for no matches', () => {
      const counts = Multisearch.countMatches('hello', ['xyz'])
      expect(counts.size).toBe(0)
    })

    it('should handle empty patterns', () => {
      const counts = Multisearch.countMatches('hello', [])
      expect(counts.size).toBe(0)
    })
  })

  describe('static containsAny', () => {
    it('should return true when pattern found', () => {
      expect(Multisearch.containsAny('hello world', ['world'])).toBe(true)
    })

    it('should return false when no pattern found', () => {
      expect(Multisearch.containsAny('hello', ['xyz'])).toBe(false)
    })

    it('should handle empty patterns', () => {
      expect(Multisearch.containsAny('hello', [])).toBe(false)
    })

    it('should handle empty text', () => {
      expect(Multisearch.containsAny('', ['hello'])).toBe(false)
    })

    it('should return true when any of multiple patterns found', () => {
      expect(Multisearch.containsAny('hello', ['xyz', 'hello', 'abc'])).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle patterns that are substrings of each other', () => {
      const ms = new Multisearch(['a', 'ab', 'abc', 'abcd'])
      const results = ms.search('abcd')
      expect(results).toHaveLength(4)
      expect(results.map(r => r.pattern)).toEqual(['a', 'ab', 'abc', 'abcd'])
    })

    it('should handle text with spaces', () => {
      const ms = new Multisearch(['hello world'])
      const results = ms.search('say hello world now')
      expect(results).toEqual([{ pattern: 'hello world', index: 4 }])
    })

    it('should handle text with special characters', () => {
      const ms = new Multisearch(['!@#'])
      const results = ms.search('abc!@#def')
      expect(results).toEqual([{ pattern: '!@#', index: 3 }])
    })

    it('should handle text with numbers', () => {
      const ms = new Multisearch(['123'])
      const results = ms.search('abc123def')
      expect(results).toEqual([{ pattern: '123', index: 3 }])
    })

    it('should handle unicode characters', () => {
      const ms = new Multisearch(['café'])
      const results = ms.search('le café est bon')
      expect(results).toEqual([{ pattern: 'café', index: 3 }])
    })

    it('should handle text with newlines', () => {
      const ms = new Multisearch(['line'])
      const results = ms.search('line1\nline2\nline3')
      expect(results).toHaveLength(3)
    })

    it('should handle single character text', () => {
      const ms = new Multisearch(['a'])
      expect(ms.search('a')).toEqual([{ pattern: 'a', index: 0 }])
    })

    it('should handle pattern longer than text', () => {
      const ms = new Multisearch(['hello world'])
      expect(ms.search('hi')).toEqual([])
    })

    it('should handle all same characters in text', () => {
      const ms = new Multisearch(['aa'])
      const results = ms.search('aaaaa')
      expect(results).toHaveLength(4)
    })

    it('should handle pattern with repeated substring', () => {
      const ms = new Multisearch(['abab'])
      const results = ms.search('ababab')
      expect(results).toHaveLength(2)
      expect(results[0]).toEqual({ pattern: 'abab', index: 0 })
      expect(results[1]).toEqual({ pattern: 'abab', index: 2 })
    })

    it('should handle many patterns', () => {
      const patterns = ['a', 'b', 'c', 'd', 'e', 'f']
      const ms = new Multisearch(patterns)
      const results = ms.search('abcdef')
      expect(results).toHaveLength(6)
    })

    it('should handle patterns sharing common prefix', () => {
      const ms = new Multisearch(['abc', 'abd', 'abe'])
      const results = ms.search('abc abd abe')
      expect(results).toHaveLength(3)
    })

    it('should handle patterns sharing common suffix', () => {
      const ms = new Multisearch(['abc', 'dbc', 'ebc'])
      const results = ms.search('abc dbc ebc')
      expect(results).toHaveLength(3)
    })
  })

  describe('correctness - classic examples', () => {
    it('should handle the ushers example correctly', () => {
      const ms = new Multisearch(['he', 'she', 'his', 'hers'])
      const results = ms.search('ushers')
      const he = results.find(r => r.pattern === 'he')
      const she = results.find(r => r.pattern === 'she')
      const hers = results.find(r => r.pattern === 'hers')
      expect(he).toEqual({ pattern: 'he', index: 2 })
      expect(she).toEqual({ pattern: 'she', index: 1 })
      expect(hers).toEqual({ pattern: 'hers', index: 2 })
    })

    it('should handle the dictionary example', () => {
      const ms = new Multisearch(['dict', 'ion', 'ary', 'dictionary'])
      const results = ms.search('dictionary')
      expect(results).toHaveLength(4)
    })

    it('should handle abcabc example', () => {
      const ms = new Multisearch(['a', 'b', 'c', 'ab', 'bc', 'abc'])
      const results = ms.search('abc')
      expect(results).toHaveLength(6)
    })

    it('should handle mississippi example', () => {
      const ms = new Multisearch(['is', 'si', 'ssi', 'ppi'])
      const results = ms.search('mississippi')
      expect(results.length).toBeGreaterThan(0)
      const si = results.filter(r => r.pattern === 'si')
      expect(si.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('large inputs', () => {
    it('should handle long text efficiently', () => {
      const ms = new Multisearch(['ab'])
      const text = 'ab'.repeat(500)
      const results = ms.search(text)
      expect(results).toHaveLength(500)
    })

    it('should handle many patterns', () => {
      const patterns = Array.from({ length: 50 }, (_, i) => `pat-${i}-end`)
      const ms = new Multisearch(patterns)
      const results = ms.search('pat-25-end')
      expect(results).toHaveLength(1)
      expect(results[0]!.pattern).toBe('pat-25-end')
    })

    it('should handle long pattern', () => {
      const pattern = 'a'.repeat(100)
      const ms = new Multisearch([pattern])
      const text = 'b'.repeat(50) + pattern + 'b'.repeat(50)
      const results = ms.search(text)
      expect(results).toHaveLength(1)
      expect(results[0]!.index).toBe(50)
    })
  })

  describe('search result order', () => {
    it('should return results in order of occurrence', () => {
      const ms = new Multisearch(['cat', 'dog'])
      const results = ms.search('cat dog cat')
      expect(results[0]!.pattern).toBe('cat')
      expect(results[0]!.index).toBe(0)
      expect(results[1]!.pattern).toBe('dog')
      expect(results[1]!.index).toBe(4)
      expect(results[2]!.pattern).toBe('cat')
      expect(results[2]!.index).toBe(8)
    })

    it('should return overlapping results in text order', () => {
      const ms = new Multisearch(['ab', 'bc'])
      const results = ms.search('abc')
      expect(results[0]).toEqual({ pattern: 'ab', index: 0 })
      expect(results[1]).toEqual({ pattern: 'bc', index: 1 })
    })

    it('should output sub-patterns after longer match at same position', () => {
      const ms = new Multisearch(['abc', 'bc'])
      const results = ms.search('abcd')
      expect(results[0]!.pattern).toBe('abc')
      expect(results[1]!.pattern).toBe('bc')
    })
  })

  describe('repeated operations', () => {
    it('should produce consistent results across multiple searches', () => {
      const ms = new Multisearch(['ab', 'cd'])
      const r1 = ms.search('abcd')
      const r2 = ms.search('abcd')
      expect(r1).toEqual(r2)
    })

    it('should handle search after addPattern', () => {
      const ms = new Multisearch(['a'])
      expect(ms.search('abc')).toHaveLength(1)
      ms.addPattern('b')
      expect(ms.search('abc')).toHaveLength(2)
      ms.addPattern('c')
      expect(ms.search('abc')).toHaveLength(3)
    })

    it('should handle multiple addPattern calls', () => {
      const ms = new Multisearch([])
      ms.addPattern('x')
      ms.addPattern('y')
      ms.addPattern('z')
      expect(ms.search('xyz')).toHaveLength(3)
    })
  })

  describe('patterns that share characters', () => {
    it('should handle patterns that are anagrams', () => {
      const ms = new Multisearch(['abc', 'bac', 'cab'])
      const results = ms.search('abc bac cab')
      expect(results).toHaveLength(3)
    })

    it('should handle pattern that is reverse of another', () => {
      const ms = new Multisearch(['abc', 'cba'])
      const results = ms.search('abccba')
      expect(results).toHaveLength(2)
    })

    it('should handle patterns with shared middle', () => {
      const ms = new Multisearch(['axb', 'cxb'])
      const results = ms.search('axbcxb')
      expect(results).toHaveLength(2)
    })

    it('should handle one pattern being prefix and suffix of another', () => {
      const ms = new Multisearch(['aba', 'ababa'])
      const results = ms.search('ababa')
      expect(results.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('stress patterns', () => {
    it('should handle 200 overlapping matches', () => {
      const ms = new Multisearch(['aa'])
      const text = 'a'.repeat(201)
      const counts = ms.countMatches(text)
      expect(counts.get('aa')).toBe(200)
    })

    it('should handle pattern appearing at every position', () => {
      const ms = new Multisearch(['a'])
      const text = 'a'.repeat(100)
      const results = ms.search(text)
      expect(results).toHaveLength(100)
    })
  })

  describe('search result immutability', () => {
    it('should not affect subsequent searches when modifying results', () => {
      const ms = new Multisearch(['ab'])
      const results1 = ms.search('abcd')
      results1.push({ pattern: 'fake', index: 99 })
      const results2 = ms.search('abcd')
      expect(results2).toHaveLength(1)
    })
  })

  describe('type exports', () => {
    it('should support MultisearchMatch interface', () => {
      const match: MultisearchMatch = { pattern: 'test', index: 0 }
      expect(match.pattern).toBe('test')
      expect(match.index).toBe(0)
    })
  })
})
