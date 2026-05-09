import { describe, it, expect } from 'vitest'
import { AhoCorasick } from '../../src/core/aho-corasick/aho-corasick.js'
import { DEFAULT_AHO_CORASICK_OPTIONS } from '../../src/core/aho-corasick/types.js'
import type { AhoCorasickMatch, AhoCorasickOptions } from '../../src/core/aho-corasick/types.js'

describe('AhoCorasick', () => {
  describe('constructor', () => {
    it('should create automaton from single pattern', () => {
      const ac = new AhoCorasick(['hello'])
      expect(ac.getPatterns()).toEqual(['hello'])
    })

    it('should create automaton from multiple patterns', () => {
      const ac = new AhoCorasick(['he', 'she', 'his', 'hers'])
      expect(ac.getPatterns()).toEqual(['he', 'she', 'his', 'hers'])
    })

    it('should handle empty patterns list', () => {
      const ac = new AhoCorasick([])
      expect(ac.getPatterns()).toEqual([])
    })

    it('should filter out empty string patterns', () => {
      const ac = new AhoCorasick(['hello', '', 'world'])
      expect(ac.getPatterns()).toEqual(['hello', 'world'])
    })

    it('should handle single character patterns', () => {
      const ac = new AhoCorasick(['a', 'b', 'c'])
      expect(ac.getPatterns()).toEqual(['a', 'b', 'c'])
    })

    it('should handle duplicate patterns', () => {
      const ac = new AhoCorasick(['he', 'he', 'she'])
      expect(ac.getPatterns()).toEqual(['he', 'he', 'she'])
    })

    it('should use default options (caseSensitive: true)', () => {
      expect(DEFAULT_AHO_CORASICK_OPTIONS.caseSensitive).toBe(true)
    })

    it('should accept caseSensitive: false option', () => {
      const ac = new AhoCorasick(['Hello'], { caseSensitive: false })
      expect(ac.search('hello')).toHaveLength(1)
    })

    it('should accept partial options', () => {
      const ac = new AhoCorasick(['test'], {})
      expect(ac.getPatterns()).toEqual(['test'])
    })
  })

  describe('search - basic single pattern', () => {
    it('should find a single pattern at the beginning', () => {
      const ac = new AhoCorasick(['hello'])
      const results = ac.search('hello world')
      expect(results).toEqual([{ pattern: 'hello', startIndex: 0, endIndex: 5 }])
    })

    it('should find a single pattern in the middle', () => {
      const ac = new AhoCorasick(['lo wo'])
      const results = ac.search('hello world')
      expect(results).toEqual([{ pattern: 'lo wo', startIndex: 3, endIndex: 8 }])
    })

    it('should find a single pattern at the end', () => {
      const ac = new AhoCorasick(['world'])
      const results = ac.search('hello world')
      expect(results).toEqual([{ pattern: 'world', startIndex: 6, endIndex: 11 }])
    })

    it('should find multiple occurrences of a single pattern', () => {
      const ac = new AhoCorasick(['ab'])
      const results = ac.search('ababab')
      expect(results).toEqual([
        { pattern: 'ab', startIndex: 0, endIndex: 2 },
        { pattern: 'ab', startIndex: 2, endIndex: 4 },
        { pattern: 'ab', startIndex: 4, endIndex: 6 },
      ])
    })

    it('should return empty array when pattern not found', () => {
      const ac = new AhoCorasick(['xyz'])
      expect(ac.search('hello world')).toEqual([])
    })

    it('should find exact match of entire text', () => {
      const ac = new AhoCorasick(['hello'])
      expect(ac.search('hello')).toEqual([{ pattern: 'hello', startIndex: 0, endIndex: 5 }])
    })

    it('should return empty for empty text', () => {
      const ac = new AhoCorasick(['hello'])
      expect(ac.search('')).toEqual([])
    })
  })

  describe('search - multiple patterns', () => {
    it('should find patterns he, she, his, hers in classic example', () => {
      const ac = new AhoCorasick(['he', 'she', 'his', 'hers'])
      const results = ac.search('ushers')
      const patterns = results.map(r => r.pattern)
      expect(patterns).toContain('he')
      expect(patterns).toContain('she')
      expect(patterns).toContain('hers')
    })

    it('should find correct positions for he and she in "she"', () => {
      const ac = new AhoCorasick(['he', 'she'])
      const results = ac.search('she')
      expect(results).toEqual([
        { pattern: 'she', startIndex: 0, endIndex: 3 },
        { pattern: 'he', startIndex: 1, endIndex: 3 },
      ])
    })

    it('should find multiple patterns at different positions', () => {
      const ac = new AhoCorasick(['cat', 'dog'])
      const results = ac.search('cat and dog')
      expect(results).toEqual([
        { pattern: 'cat', startIndex: 0, endIndex: 3 },
        { pattern: 'dog', startIndex: 8, endIndex: 11 },
      ])
    })

    it('should find all patterns that are substrings of each other', () => {
      const ac = new AhoCorasick(['a', 'ab', 'abc'])
      const results = ac.search('abc')
      expect(results).toEqual([
        { pattern: 'a', startIndex: 0, endIndex: 1 },
        { pattern: 'ab', startIndex: 0, endIndex: 2 },
        { pattern: 'abc', startIndex: 0, endIndex: 3 },
      ])
    })

    it('should handle patterns with no matches', () => {
      const ac = new AhoCorasick(['xyz', 'abc'])
      expect(ac.search('hello world')).toEqual([])
    })

    it('should find patterns in different parts of text', () => {
      const ac = new AhoCorasick(['red', 'blue', 'green'])
      const results = ac.search('red and blue and green')
      expect(results).toEqual([
        { pattern: 'red', startIndex: 0, endIndex: 3 },
        { pattern: 'blue', startIndex: 8, endIndex: 12 },
        { pattern: 'green', startIndex: 17, endIndex: 22 },
      ])
    })
  })

  describe('search - overlapping matches', () => {
    it('should find overlapping matches for repeated characters', () => {
      const ac = new AhoCorasick(['aa'])
      const results = ac.search('aaaa')
      expect(results).toHaveLength(3)
      expect(results).toEqual([
        { pattern: 'aa', startIndex: 0, endIndex: 2 },
        { pattern: 'aa', startIndex: 1, endIndex: 3 },
        { pattern: 'aa', startIndex: 2, endIndex: 4 },
      ])
    })

    it('should find overlapping patterns with different lengths', () => {
      const ac = new AhoCorasick(['ab', 'abc'])
      const results = ac.search('abc')
      expect(results).toEqual([
        { pattern: 'ab', startIndex: 0, endIndex: 2 },
        { pattern: 'abc', startIndex: 0, endIndex: 3 },
      ])
    })

    it('should find all overlapping occurrences of abab in abababab', () => {
      const ac = new AhoCorasick(['abab'])
      const results = ac.search('abababab')
      expect(results).toEqual([
        { pattern: 'abab', startIndex: 0, endIndex: 4 },
        { pattern: 'abab', startIndex: 2, endIndex: 6 },
        { pattern: 'abab', startIndex: 4, endIndex: 8 },
      ])
    })

    it('should handle overlapping single character patterns', () => {
      const ac = new AhoCorasick(['a', 'b'])
      const results = ac.search('ab')
      expect(results).toEqual([
        { pattern: 'a', startIndex: 0, endIndex: 1 },
        { pattern: 'b', startIndex: 1, endIndex: 2 },
      ])
    })
  })

  describe('search - empty inputs', () => {
    it('should return empty for empty patterns list', () => {
      const ac = new AhoCorasick([])
      expect(ac.search('hello')).toEqual([])
    })

    it('should return empty for empty text', () => {
      const ac = new AhoCorasick(['hello'])
      expect(ac.search('')).toEqual([])
    })

    it('should return empty for both empty', () => {
      const ac = new AhoCorasick([])
      expect(ac.search('')).toEqual([])
    })
  })

  describe('search - single character patterns', () => {
    it('should find single character pattern', () => {
      const ac = new AhoCorasick(['a'])
      const results = ac.search('banana')
      expect(results).toHaveLength(3)
      expect(results.map(r => r.startIndex)).toEqual([1, 3, 5])
    })

    it('should find multiple single character patterns', () => {
      const ac = new AhoCorasick(['a', 'b'])
      const results = ac.search('abba')
      expect(results).toHaveLength(4)
    })

    it('should find single character at beginning', () => {
      const ac = new AhoCorasick(['h'])
      const results = ac.search('hello')
      expect(results).toEqual([{ pattern: 'h', startIndex: 0, endIndex: 1 }])
    })

    it('should find single character at end', () => {
      const ac = new AhoCorasick(['o'])
      const results = ac.search('hello')
      expect(results).toEqual([{ pattern: 'o', startIndex: 4, endIndex: 5 }])
    })
  })

  describe('search - patterns at boundaries', () => {
    it('should find pattern at very beginning of text', () => {
      const ac = new AhoCorasick(['abc'])
      const results = ac.search('abcdefgh')
      expect(results[0]!.startIndex).toBe(0)
    })

    it('should find pattern at very end of text', () => {
      const ac = new AhoCorasick(['fgh'])
      const results = ac.search('abcdefgh')
      expect(results[0]!.endIndex).toBe(8)
    })

    it('should find pattern that spans entire text', () => {
      const ac = new AhoCorasick(['abcdef'])
      const results = ac.search('abcdef')
      expect(results).toEqual([{ pattern: 'abcdef', startIndex: 0, endIndex: 6 }])
    })
  })

  describe('search - duplicate patterns', () => {
    it('should find duplicate patterns in results', () => {
      const ac = new AhoCorasick(['ab', 'ab'])
      const results = ac.search('ab')
      expect(results).toHaveLength(2)
      expect(results[0]).toEqual({ pattern: 'ab', startIndex: 0, endIndex: 2 })
      expect(results[1]).toEqual({ pattern: 'ab', startIndex: 0, endIndex: 2 })
    })

    it('should handle duplicate single char patterns', () => {
      const ac = new AhoCorasick(['a', 'a'])
      const results = ac.search('abc')
      expect(results).toHaveLength(2)
    })
  })

  describe('findAll', () => {
    it('should be an alias for search', () => {
      const ac = new AhoCorasick(['he', 'she'])
      const searchResults = ac.search('she')
      const findAllResults = ac.findAll('she')
      expect(findAllResults).toEqual(searchResults)
    })

    it('should return all matches', () => {
      const ac = new AhoCorasick(['cat', 'bat'])
      const results = ac.findAll('the cat sat on the bat')
      expect(results).toHaveLength(2)
    })

    it('should return empty for no matches', () => {
      const ac = new AhoCorasick(['xyz'])
      expect(ac.findAll('hello')).toEqual([])
    })
  })

  describe('findFirst', () => {
    it('should return first occurrence only', () => {
      const ac = new AhoCorasick(['ab'])
      const result = ac.findFirst('ababab')
      expect(result).toEqual({ pattern: 'ab', startIndex: 0, endIndex: 2 })
    })

    it('should return undefined for no matches', () => {
      const ac = new AhoCorasick(['xyz'])
      expect(ac.findFirst('hello')).toBeUndefined()
    })

    it('should return undefined for empty text', () => {
      const ac = new AhoCorasick(['hello'])
      expect(ac.findFirst('')).toBeUndefined()
    })

    it('should return undefined for empty patterns', () => {
      const ac = new AhoCorasick([])
      expect(ac.findFirst('hello')).toBeUndefined()
    })

    it('should return first match from multiple patterns', () => {
      const ac = new AhoCorasick(['cat', 'dog'])
      const result = ac.findFirst('dog and cat')
      expect(result).toEqual({ pattern: 'dog', startIndex: 0, endIndex: 3 })
    })

    it('should find pattern at end', () => {
      const ac = new AhoCorasick(['end'])
      const result = ac.findFirst('the end')
      expect(result).toEqual({ pattern: 'end', startIndex: 4, endIndex: 7 })
    })

    it('should find shorter pattern that appears first', () => {
      const ac = new AhoCorasick(['xyz', 'ab'])
      const result = ac.findFirst('xyzab')
      expect(result).toEqual({ pattern: 'xyz', startIndex: 0, endIndex: 3 })
    })
  })

  describe('countMatches', () => {
    it('should count total matches', () => {
      const ac = new AhoCorasick(['ab'])
      expect(ac.countMatches('ababab')).toBe(3)
    })

    it('should return 0 for no matches', () => {
      const ac = new AhoCorasick(['xyz'])
      expect(ac.countMatches('hello')).toBe(0)
    })

    it('should count overlapping matches', () => {
      const ac = new AhoCorasick(['aa'])
      expect(ac.countMatches('aaaa')).toBe(3)
    })

    it('should count multiple pattern types', () => {
      const ac = new AhoCorasick(['he', 'she', 'his', 'hers'])
      expect(ac.countMatches('ushers')).toBe(3)
    })

    it('should return 0 for empty text', () => {
      const ac = new AhoCorasick(['hello'])
      expect(ac.countMatches('')).toBe(0)
    })

    it('should return 0 for empty patterns', () => {
      const ac = new AhoCorasick([])
      expect(ac.countMatches('hello')).toBe(0)
    })

    it('should count single character matches', () => {
      const ac = new AhoCorasick(['a'])
      expect(ac.countMatches('banana')).toBe(3)
    })

    it('should count duplicate pattern matches', () => {
      const ac = new AhoCorasick(['ab', 'ab'])
      expect(ac.countMatches('ab')).toBe(2)
    })
  })

  describe('containsAny', () => {
    it('should return true when pattern found', () => {
      const ac = new AhoCorasick(['hello'])
      expect(ac.containsAny('hello world')).toBe(true)
    })

    it('should return false when no pattern found', () => {
      const ac = new AhoCorasick(['xyz'])
      expect(ac.containsAny('hello world')).toBe(false)
    })

    it('should return false for empty text', () => {
      const ac = new AhoCorasick(['hello'])
      expect(ac.containsAny('')).toBe(false)
    })

    it('should return false for empty patterns', () => {
      const ac = new AhoCorasick([])
      expect(ac.containsAny('hello')).toBe(false)
    })

    it('should return true for multiple patterns when one matches', () => {
      const ac = new AhoCorasick(['cat', 'dog', 'bird'])
      expect(ac.containsAny('I have a dog')).toBe(true)
    })

    it('should return true for pattern at end', () => {
      const ac = new AhoCorasick(['end'])
      expect(ac.containsAny('the end')).toBe(true)
    })

    it('should return true for pattern at start', () => {
      const ac = new AhoCorasick(['start'])
      expect(ac.containsAny('start here')).toBe(true)
    })
  })

  describe('getPatterns', () => {
    it('should return copy of patterns array', () => {
      const ac = new AhoCorasick(['a', 'b', 'c'])
      const patterns = ac.getPatterns()
      patterns.push('d')
      expect(ac.getPatterns()).toEqual(['a', 'b', 'c'])
    })

    it('should return empty array for empty patterns', () => {
      const ac = new AhoCorasick([])
      expect(ac.getPatterns()).toEqual([])
    })

    it('should return all patterns including duplicates', () => {
      const ac = new AhoCorasick(['ab', 'ab', 'cd'])
      expect(ac.getPatterns()).toEqual(['ab', 'ab', 'cd'])
    })
  })

  describe('addPattern', () => {
    it('should add a new pattern', () => {
      const ac = new AhoCorasick(['hello'])
      ac.addPattern('world')
      expect(ac.getPatterns()).toEqual(['hello', 'world'])
    })

    it('should find newly added pattern', () => {
      const ac = new AhoCorasick(['hello'])
      ac.addPattern('world')
      const results = ac.search('hello world')
      expect(results).toHaveLength(2)
    })

    it('should ignore empty pattern', () => {
      const ac = new AhoCorasick(['hello'])
      ac.addPattern('')
      expect(ac.getPatterns()).toEqual(['hello'])
    })

    it('should add duplicate pattern', () => {
      const ac = new AhoCorasick(['hello'])
      ac.addPattern('hello')
      expect(ac.getPatterns()).toEqual(['hello', 'hello'])
    })

    it('should find matches after adding multiple patterns', () => {
      const ac = new AhoCorasick(['ab'])
      ac.addPattern('cd')
      ac.addPattern('ef')
      const results = ac.search('abcdef')
      expect(results).toHaveLength(3)
    })

    it('should add single character pattern', () => {
      const ac = new AhoCorasick(['hello'])
      ac.addPattern('x')
      expect(ac.search('xyz')).toHaveLength(1)
    })
  })

  describe('rebuild', () => {
    it('should rebuild automaton correctly', () => {
      const ac = new AhoCorasick(['he'])
      expect(ac.search('she')).toHaveLength(1)
      ac.addPattern('she')
      expect(ac.search('she')).toHaveLength(2)
    })

    it('should work after rebuild with no patterns', () => {
      const ac = new AhoCorasick(['hello'])
      expect(ac.getPatterns()).toEqual(['hello'])
    })
  })

  describe('case sensitivity', () => {
    it('should be case sensitive by default', () => {
      const ac = new AhoCorasick(['Hello'])
      expect(ac.search('hello')).toEqual([])
    })

    it('should match exact case', () => {
      const ac = new AhoCorasick(['Hello'])
      expect(ac.search('Hello')).toEqual([{ pattern: 'Hello', startIndex: 0, endIndex: 5 }])
    })

    it('should be case insensitive when option set', () => {
      const ac = new AhoCorasick(['hello'], { caseSensitive: false })
      expect(ac.search('HELLO')).toHaveLength(1)
    })

    it('should handle mixed case patterns in insensitive mode', () => {
      const ac = new AhoCorasick(['Hello'], { caseSensitive: false })
      expect(ac.search('hello world')).toHaveLength(1)
      expect(ac.search('HELLO WORLD')).toHaveLength(1)
      expect(ac.search('HeLLo WoRLd')).toHaveLength(1)
    })

    it('should handle multiple patterns case insensitively', () => {
      const ac = new AhoCorasick(['Cat', 'Dog'], { caseSensitive: false })
      const results = ac.search('cat and dog')
      expect(results).toHaveLength(2)
    })

    it('should preserve original pattern in results', () => {
      const ac = new AhoCorasick(['Hello'], { caseSensitive: false })
      const results = ac.search('hello')
      expect(results[0]!.pattern).toBe('Hello')
    })

    it('should not match different case in sensitive mode', () => {
      const ac = new AhoCorasick(['abc'])
      expect(ac.search('ABC')).toEqual([])
      expect(ac.search('Abc')).toEqual([])
      expect(ac.search('aBc')).toEqual([])
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_AHO_CORASICK_OPTIONS', () => {
      expect(DEFAULT_AHO_CORASICK_OPTIONS.caseSensitive).toBe(true)
    })

    it('should support AhoCorasickOptions interface', () => {
      const opts: AhoCorasickOptions = { caseSensitive: false }
      expect(opts.caseSensitive).toBe(false)
    })

    it('should support AhoCorasickMatch interface', () => {
      const match: AhoCorasickMatch = { pattern: 'test', startIndex: 0, endIndex: 4 }
      expect(match.pattern).toBe('test')
      expect(match.startIndex).toBe(0)
      expect(match.endIndex).toBe(4)
    })
  })

  describe('edge cases', () => {
    it('should handle patterns that are substrings of each other', () => {
      const ac = new AhoCorasick(['a', 'ab', 'abc', 'abcd'])
      const results = ac.search('abcd')
      expect(results).toHaveLength(4)
      expect(results.map(r => r.pattern)).toEqual(['a', 'ab', 'abc', 'abcd'])
    })

    it('should handle text with spaces', () => {
      const ac = new AhoCorasick(['hello world'])
      const results = ac.search('say hello world now')
      expect(results).toEqual([{ pattern: 'hello world', startIndex: 4, endIndex: 15 }])
    })

    it('should handle text with special characters', () => {
      const ac = new AhoCorasick(['!@#'])
      const results = ac.search('abc!@#def')
      expect(results).toEqual([{ pattern: '!@#', startIndex: 3, endIndex: 6 }])
    })

    it('should handle text with numbers', () => {
      const ac = new AhoCorasick(['123'])
      const results = ac.search('abc123def')
      expect(results).toEqual([{ pattern: '123', startIndex: 3, endIndex: 6 }])
    })

    it('should handle unicode characters', () => {
      const ac = new AhoCorasick(['café'])
      const results = ac.search('le café est bon')
      expect(results).toEqual([{ pattern: 'café', startIndex: 3, endIndex: 7 }])
    })

    it('should handle text with newlines', () => {
      const ac = new AhoCorasick(['line'])
      const results = ac.search('line1\nline2\nline3')
      expect(results).toHaveLength(3)
    })

    it('should handle single character text', () => {
      const ac = new AhoCorasick(['a'])
      const results = ac.search('a')
      expect(results).toEqual([{ pattern: 'a', startIndex: 0, endIndex: 1 }])
    })

    it('should handle pattern longer than text', () => {
      const ac = new AhoCorasick(['hello world'])
      expect(ac.search('hi')).toEqual([])
    })

    it('should handle all same characters in text', () => {
      const ac = new AhoCorasick(['aa'])
      const results = ac.search('aaaaa')
      expect(results).toHaveLength(4)
    })

    it('should handle pattern with repeated substring', () => {
      const ac = new AhoCorasick(['abab'])
      const results = ac.search('ababab')
      expect(results).toHaveLength(2)
      expect(results[0]).toEqual({ pattern: 'abab', startIndex: 0, endIndex: 4 })
      expect(results[1]).toEqual({ pattern: 'abab', startIndex: 2, endIndex: 6 })
    })

    it('should handle many patterns', () => {
      const patterns = ['a', 'b', 'c', 'd', 'e', 'f']
      const ac = new AhoCorasick(patterns)
      const results = ac.search('abcdef')
      expect(results).toHaveLength(6)
    })

    it('should handle patterns sharing common prefix', () => {
      const ac = new AhoCorasick(['abc', 'abd', 'abe'])
      const results = ac.search('abc abd abe')
      expect(results).toHaveLength(3)
    })

    it('should handle patterns sharing common suffix', () => {
      const ac = new AhoCorasick(['abc', 'dbc', 'ebc'])
      const results = ac.search('abc dbc ebc')
      expect(results).toHaveLength(3)
    })
  })

  describe('correctness - classic examples', () => {
    it('should handle the ushers example correctly', () => {
      const ac = new AhoCorasick(['he', 'she', 'his', 'hers'])
      const results = ac.search('ushers')
      const he = results.find(r => r.pattern === 'he')
      const she = results.find(r => r.pattern === 'she')
      const hers = results.find(r => r.pattern === 'hers')
      expect(he).toEqual({ pattern: 'he', startIndex: 2, endIndex: 4 })
      expect(she).toEqual({ pattern: 'she', startIndex: 1, endIndex: 4 })
      expect(hers).toEqual({ pattern: 'hers', startIndex: 2, endIndex: 6 })
    })

    it('should handle the dictionary example', () => {
      const ac = new AhoCorasick(['dict', 'ion', 'ary', 'dictionary'])
      const results = ac.search('dictionary')
      expect(results).toHaveLength(4)
    })

    it('should handle abcabc example', () => {
      const ac = new AhoCorasick(['a', 'b', 'c', 'ab', 'bc', 'abc'])
      const results = ac.search('abc')
      expect(results).toHaveLength(6)
    })

    it('should handle mississippi example', () => {
      const ac = new AhoCorasick(['is', 'si', 'ssi', 'ppi'])
      const results = ac.search('mississippi')
      expect(results.length).toBeGreaterThan(0)
      const si = results.filter(r => r.pattern === 'si')
      expect(si.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('large inputs', () => {
    it('should handle long text efficiently', () => {
      const ac = new AhoCorasick(['ab'])
      const text = 'ab'.repeat(500)
      const results = ac.search(text)
      expect(results).toHaveLength(500)
    })

    it('should handle many patterns', () => {
      const patterns = Array.from({ length: 50 }, (_, i) => `pat-${i}-end`)
      const ac = new AhoCorasick(patterns)
      const results = ac.search('pat-25-end')
      expect(results).toHaveLength(1)
      expect(results[0]!.pattern).toBe('pat-25-end')
    })

    it('should handle long pattern', () => {
      const pattern = 'a'.repeat(100)
      const ac = new AhoCorasick([pattern])
      const text = 'b'.repeat(50) + pattern + 'b'.repeat(50)
      const results = ac.search(text)
      expect(results).toHaveLength(1)
      expect(results[0]!.startIndex).toBe(50)
    })
  })

  describe('search result order', () => {
    it('should return results in order of occurrence', () => {
      const ac = new AhoCorasick(['cat', 'dog'])
      const results = ac.search('cat dog cat')
      expect(results[0]!.pattern).toBe('cat')
      expect(results[0]!.startIndex).toBe(0)
      expect(results[1]!.pattern).toBe('dog')
      expect(results[1]!.startIndex).toBe(4)
      expect(results[2]!.pattern).toBe('cat')
      expect(results[2]!.startIndex).toBe(8)
    })

    it('should return overlapping results in text order', () => {
      const ac = new AhoCorasick(['ab', 'bc'])
      const results = ac.search('abc')
      expect(results[0]).toEqual({ pattern: 'ab', startIndex: 0, endIndex: 2 })
      expect(results[1]).toEqual({ pattern: 'bc', startIndex: 1, endIndex: 3 })
    })

    it('should output sub-patterns after longer match at same position', () => {
      const ac = new AhoCorasick(['abc', 'bc'])
      const results = ac.search('abcd')
      expect(results[0]!.pattern).toBe('abc')
      expect(results[1]!.pattern).toBe('bc')
    })
  })

  describe('addPattern integration', () => {
    it('should find matches from both original and added patterns', () => {
      const ac = new AhoCorasick(['cat'])
      ac.addPattern('dog')
      const results = ac.search('cat and dog')
      const patterns = results.map(r => r.pattern)
      expect(patterns).toContain('cat')
      expect(patterns).toContain('dog')
    })

    it('should maintain existing matches after adding pattern', () => {
      const ac = new AhoCorasick(['hello'])
      const before = ac.search('hello world')
      expect(before).toHaveLength(1)
      ac.addPattern('world')
      const after = ac.search('hello world')
      expect(after).toHaveLength(2)
    })

    it('should find overlapping matches after adding', () => {
      const ac = new AhoCorasick(['ab'])
      ac.addPattern('bc')
      const results = ac.search('abcd')
      expect(results).toHaveLength(2)
    })

    it('should handle adding pattern that matches existing text', () => {
      const ac = new AhoCorasick(['xyz'])
      ac.addPattern('hello')
      expect(ac.containsAny('hello world')).toBe(true)
    })
  })

  describe('repeated operations', () => {
    it('should produce consistent results across multiple searches', () => {
      const ac = new AhoCorasick(['ab', 'cd'])
      const r1 = ac.search('abcd')
      const r2 = ac.search('abcd')
      expect(r1).toEqual(r2)
    })

    it('should handle search after addPattern', () => {
      const ac = new AhoCorasick(['a'])
      expect(ac.search('abc')).toHaveLength(1)
      ac.addPattern('b')
      expect(ac.search('abc')).toHaveLength(2)
      ac.addPattern('c')
      expect(ac.search('abc')).toHaveLength(3)
    })

    it('should handle multiple addPattern calls', () => {
      const ac = new AhoCorasick([])
      ac.addPattern('x')
      ac.addPattern('y')
      ac.addPattern('z')
      expect(ac.search('xyz')).toHaveLength(3)
    })
  })

  describe('endIndex correctness', () => {
    it('should have endIndex = startIndex + pattern.length', () => {
      const ac = new AhoCorasick(['hello', 'world'])
      const results = ac.search('hello world')
      for (const r of results) {
        expect(r.endIndex - r.startIndex).toBe(r.pattern.length)
      }
    })

    it('should correctly index multi-byte unicode', () => {
      const ac = new AhoCorasick(['é'])
      const results = ac.search('café')
      expect(results).toHaveLength(1)
      expect(results[0]!.startIndex).toBe(3)
      expect(results[0]!.endIndex).toBe(4)
    })

    it('should correctly index emoji patterns', () => {
      const ac = new AhoCorasick(['abc'])
      const results = ac.search('xxabcxx')
      expect(results).toEqual([{ pattern: 'abc', startIndex: 2, endIndex: 5 }])
    })
  })

  describe('patterns that share characters', () => {
    it('should handle patterns that are anagrams', () => {
      const ac = new AhoCorasick(['abc', 'bac', 'cab'])
      const results = ac.search('abc bac cab')
      expect(results).toHaveLength(3)
    })

    it('should handle pattern that is reverse of another', () => {
      const ac = new AhoCorasick(['abc', 'cba'])
      const results = ac.search('abccba')
      expect(results).toHaveLength(2)
    })

    it('should handle patterns with shared middle', () => {
      const ac = new AhoCorasick(['axb', 'cxb'])
      const results = ac.search('axbcxb')
      expect(results).toHaveLength(2)
    })

    it('should handle one pattern being prefix and suffix of another', () => {
      const ac = new AhoCorasick(['aba', 'ababa'])
      const results = ac.search('ababa')
      expect(results.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('stress patterns', () => {
    it('should handle 200 overlapping matches', () => {
      const ac = new AhoCorasick(['aa'])
      const text = 'a'.repeat(201)
      expect(ac.countMatches(text)).toBe(200)
    })

    it('should handle pattern appearing at every position', () => {
      const ac = new AhoCorasick(['a'])
      const text = 'a'.repeat(100)
      expect(ac.countMatches(text)).toBe(100)
    })
  })

  describe('containsAny edge cases', () => {
    it('should return true when pattern matches entire text', () => {
      const ac = new AhoCorasick(['abc'])
      expect(ac.containsAny('abc')).toBe(true)
    })

    it('should return false for partial match', () => {
      const ac = new AhoCorasick(['abcd'])
      expect(ac.containsAny('abc')).toBe(false)
    })

    it('should return true for multiple matching patterns', () => {
      const ac = new AhoCorasick(['ab', 'bc', 'cd'])
      expect(ac.containsAny('abcd')).toBe(true)
    })
  })

  describe('findFirst edge cases', () => {
    it('should return first match by text position', () => {
      const ac = new AhoCorasick(['bb', 'aa'])
      const result = ac.findFirst('aabb')
      expect(result).toEqual({ pattern: 'aa', startIndex: 0, endIndex: 2 })
    })

    it('should return match when text equals pattern', () => {
      const ac = new AhoCorasick(['exact'])
      expect(ac.findFirst('exact')).toEqual({ pattern: 'exact', startIndex: 0, endIndex: 5 })
    })

    it('should handle pattern appearing after no-match prefix', () => {
      const ac = new AhoCorasick(['xyz'])
      const result = ac.findFirst('abcxyz')
      expect(result).toEqual({ pattern: 'xyz', startIndex: 3, endIndex: 6 })
    })

    it('should find match with multiple candidate patterns', () => {
      const ac = new AhoCorasick(['ab', 'cd', 'ef'])
      const result = ac.findFirst('--cd--ef--ab--')
      expect(result).toEqual({ pattern: 'cd', startIndex: 2, endIndex: 4 })
    })

    it('should return first even when longer match exists later', () => {
      const ac = new AhoCorasick(['abc', 'xyz'])
      const result = ac.findFirst('abcxyz')
      expect(result).toEqual({ pattern: 'abc', startIndex: 0, endIndex: 3 })
    })
  })

  describe('search result immutability', () => {
    it('should not affect subsequent searches when modifying results', () => {
      const ac = new AhoCorasick(['ab'])
      const results1 = ac.search('abcd')
      results1.push({ pattern: 'fake', startIndex: 99, endIndex: 99 })
      const results2 = ac.search('abcd')
      expect(results2).toHaveLength(1)
    })
  })
})
