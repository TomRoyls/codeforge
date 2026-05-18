import { AhoCorasick } from '../src/core/aho-corasick/aho-corasick.js'
import type { AhoCorasickMatch } from '../src/core/aho-corasick/aho-corasick.js'

// ============================================================
// 1. Constructor and pattern handling
// ============================================================
describe('AhoCorasick - Constructor and pattern handling', () => {
  it('should accept a single pattern', () => {
    const ac = new AhoCorasick(['hello'])
    expect(ac.getPatterns()).toEqual(['hello'])
  })

  it('should accept multiple patterns', () => {
    const ac = new AhoCorasick(['he', 'she', 'his', 'hers'])
    expect(ac.getPatterns()).toEqual(['he', 'she', 'his', 'hers'])
  })

  it('should filter out empty string patterns', () => {
    const ac = new AhoCorasick(['', 'abc', '', 'de', ''])
    expect(ac.getPatterns()).toEqual(['abc', 'de'])
  })

  it('should handle all empty patterns gracefully', () => {
    const ac = new AhoCorasick(['', '', ''])
    expect(ac.getPatterns()).toEqual([])
    expect(ac.search('anything')).toEqual([])
  })

  it('should handle duplicate patterns', () => {
    const ac = new AhoCorasick(['abc', 'abc'])
    const results = ac.search('abc')
    // duplicate pattern means 2 outputs at same position
    expect(results).toHaveLength(2)
    expect(results[0]!.pattern).toBe('abc')
    expect(results[1]!.pattern).toBe('abc')
  })

  it('should default to caseSensitive true', () => {
    const ac = new AhoCorasick(['Hello'])
    // With caseSensitive=true (default), 'hello' won't match 'Hello'
    expect(ac.search('hello')).toEqual([])
    expect(ac.search('Hello')).toHaveLength(1)
  })

  it('should accept caseSensitive: false option', () => {
    const ac = new AhoCorasick(['Hello'], { caseSensitive: false })
    expect(ac.search('hello')).toHaveLength(1)
    expect(ac.search('HELLO')).toHaveLength(1)
  })
})

// ============================================================
// 2. Basic search with single pattern
// ============================================================
describe('AhoCorasick - Basic single pattern search', () => {
  it('should find a single occurrence', () => {
    const ac = new AhoCorasick(['abc'])
    const results = ac.search('xabcx')
    expect(results).toHaveLength(1)
    expect(results[0]).toEqual({ pattern: 'abc', startIndex: 1, endIndex: 4 })
  })

  it('should find multiple occurrences of same pattern', () => {
    const ac = new AhoCorasick(['ab'])
    const results = ac.search('abab')
    expect(results).toHaveLength(2)
    expect(results[0]).toEqual({ pattern: 'ab', startIndex: 0, endIndex: 2 })
    expect(results[1]).toEqual({ pattern: 'ab', startIndex: 2, endIndex: 4 })
  })

  it('should return correct indices for match at start', () => {
    const ac = new AhoCorasick(['abc'])
    const results = ac.search('abcdef')
    expect(results[0]).toEqual({ pattern: 'abc', startIndex: 0, endIndex: 3 })
  })

  it('should return correct indices for match at end', () => {
    const ac = new AhoCorasick(['def'])
    const results = ac.search('abcdef')
    expect(results[0]).toEqual({ pattern: 'def', startIndex: 3, endIndex: 6 })
  })
})

// ============================================================
// 3. Multiple pattern matching
// ============================================================
describe('AhoCorasick - Multiple pattern matching', () => {
  it('should find matches from different patterns', () => {
    const ac = new AhoCorasick(['he', 'she', 'his', 'hers'])
    const results = ac.search('ahishers')
    const patterns = results.map(m => m.pattern)
    // 'his' at 1-4, 'she' at 3-6, 'he' at 4-6, 'hers' at 4-8, 'he' at 4-6
    expect(patterns).toContain('his')
    expect(patterns).toContain('she')
    expect(patterns).toContain('he')
    expect(patterns).toContain('hers')
  })

  it('should return all matches sorted by position', () => {
    const ac = new AhoCorasick(['cat', 'dog'])
    const results = ac.search('catdog')
    expect(results).toHaveLength(2)
    expect(results[0]).toEqual({ pattern: 'cat', startIndex: 0, endIndex: 3 })
    expect(results[1]).toEqual({ pattern: 'dog', startIndex: 3, endIndex: 6 })
  })
})

// ============================================================
// 4. Overlapping matches
// ============================================================
describe('AhoCorasick - Overlapping matches', () => {
  it('should find overlapping patterns', () => {
    const ac = new AhoCorasick(['abc', 'bc'])
    const results = ac.search('abc')
    expect(results).toHaveLength(2)
    expect(results[0]).toEqual({ pattern: 'abc', startIndex: 0, endIndex: 3 })
    expect(results[1]).toEqual({ pattern: 'bc', startIndex: 1, endIndex: 3 })
  })

  it('should find patterns that share suffixes', () => {
    const ac = new AhoCorasick(['he', 'she'])
    const results = ac.search('she')
    expect(results).toHaveLength(2)
    expect(results[0]).toEqual({ pattern: 'she', startIndex: 0, endIndex: 3 })
    expect(results[1]).toEqual({ pattern: 'he', startIndex: 1, endIndex: 3 })
  })

  it('should find all overlapping occurrences in repeated text', () => {
    const ac = new AhoCorasick(['aa'])
    const results = ac.search('aaa')
    expect(results).toHaveLength(2)
    expect(results[0]).toEqual({ pattern: 'aa', startIndex: 0, endIndex: 2 })
    expect(results[1]).toEqual({ pattern: 'aa', startIndex: 1, endIndex: 3 })
  })
})

// ============================================================
// 5. Case sensitivity
// ============================================================
describe('AhoCorasick - Case sensitivity', () => {
  it('should be case-sensitive by default', () => {
    const ac = new AhoCorasick(['Hello'])
    expect(ac.search('hello')).toEqual([])
    expect(ac.search('HELLO')).toEqual([])
    expect(ac.search('Hello')).toHaveLength(1)
  })

  it('should be case-insensitive when option is set', () => {
    const ac = new AhoCorasick(['hello'], { caseSensitive: false })
    expect(ac.search('Hello')).toHaveLength(1)
    expect(ac.search('HELLO')).toHaveLength(1)
    expect(ac.search('hello')).toHaveLength(1)
    expect(ac.search('hElLo')).toHaveLength(1)
  })

  it('should preserve original pattern casing in results regardless of case mode', () => {
    const ac = new AhoCorasick(['Hello'], { caseSensitive: false })
    const results = ac.search('hello world')
    expect(results[0]!.pattern).toBe('Hello')
  })

  it('should handle case-sensitive with multiple patterns of different casing', () => {
    const ac = new AhoCorasick(['Hello', 'hello'])
    const results = ac.search('Hello hello')
    expect(results).toHaveLength(2)
  })
})

// ============================================================
// 6. findFirst
// ============================================================
describe('AhoCorasick - findFirst', () => {
  it('should return first match', () => {
    const ac = new AhoCorasick(['cat', 'dog'])
    const result = ac.findFirst('the dog and the cat')
    expect(result).toEqual({ pattern: 'dog', startIndex: 4, endIndex: 7 })
  })

  it('should return undefined when no match', () => {
    const ac = new AhoCorasick(['xyz'])
    expect(ac.findFirst('abc')).toBeUndefined()
  })

  it('should return undefined for empty patterns', () => {
    const ac = new AhoCorasick(['', ''])
    expect(ac.findFirst('anything')).toBeUndefined()
  })

  it('should return undefined for empty text', () => {
    const ac = new AhoCorasick(['abc'])
    expect(ac.findFirst('')).toBeUndefined()
  })
})

// ============================================================
// 7. containsAny
// ============================================================
describe('AhoCorasick - containsAny', () => {
  it('should return true when a pattern is found', () => {
    const ac = new AhoCorasick(['hello'])
    expect(ac.containsAny('say hello world')).toBe(true)
  })

  it('should return false when no pattern matches', () => {
    const ac = new AhoCorasick(['xyz'])
    expect(ac.containsAny('abc')).toBe(false)
  })

  it('should return false for empty text', () => {
    const ac = new AhoCorasick(['abc'])
    expect(ac.containsAny('')).toBe(false)
  })

  it('should return false for empty patterns', () => {
    const ac = new AhoCorasick(['', ''])
    expect(ac.containsAny('anything')).toBe(false)
  })

  it('should short-circuit on first match', () => {
    const ac = new AhoCorasick(['a', 'b', 'c'])
    expect(ac.containsAny('xyzc')).toBe(true)
  })
})

// ============================================================
// 8. countMatches
// ============================================================
describe('AhoCorasick - countMatches', () => {
  it('should count all matches', () => {
    const ac = new AhoCorasick(['ab', 'bc'])
    expect(ac.countMatches('abc')).toBe(2)
  })

  it('should return 0 when no matches', () => {
    const ac = new AhoCorasick(['xyz'])
    expect(ac.countMatches('abc')).toBe(0)
  })

  it('should count overlapping matches', () => {
    const ac = new AhoCorasick(['aa'])
    expect(ac.countMatches('aaa')).toBe(2)
  })

  it('should return 0 for empty text', () => {
    const ac = new AhoCorasick(['abc'])
    expect(ac.countMatches('')).toBe(0)
  })
})

// ============================================================
// 9. Empty text / empty patterns edge cases
// ============================================================
describe('AhoCorasick - Edge cases', () => {
  it('should return empty array for empty text', () => {
    const ac = new AhoCorasick(['abc'])
    expect(ac.search('')).toEqual([])
  })

  it('should return empty array when no patterns provided', () => {
    const ac = new AhoCorasick([])
    expect(ac.search('anything')).toEqual([])
    expect(ac.findFirst('anything')).toBeUndefined()
    expect(ac.containsAny('anything')).toBe(false)
    expect(ac.countMatches('anything')).toBe(0)
  })

  it('should handle pattern equal to text', () => {
    const ac = new AhoCorasick(['abc'])
    const results = ac.search('abc')
    expect(results).toHaveLength(1)
    expect(results[0]).toEqual({ pattern: 'abc', startIndex: 0, endIndex: 3 })
  })

  it('should handle pattern longer than text', () => {
    const ac = new AhoCorasick(['abcdefgh'])
    expect(ac.search('abc')).toEqual([])
  })

  it('should handle single character patterns', () => {
    const ac = new AhoCorasick(['a', 'b', 'c'])
    const results = ac.search('abc')
    expect(results).toHaveLength(3)
  })
})

// ============================================================
// 10. addPattern and rebuild
// ============================================================
describe('AhoCorasick - addPattern and rebuild', () => {
  it('should add a new pattern and find it', () => {
    const ac = new AhoCorasick(['abc'])
    ac.addPattern('de')
    expect(ac.getPatterns()).toEqual(['abc', 'de'])
    const results = ac.search('de')
    expect(results).toHaveLength(1)
    expect(results[0]!.pattern).toBe('de')
  })

  it('should ignore empty string when adding pattern', () => {
    const ac = new AhoCorasick(['abc'])
    ac.addPattern('')
    expect(ac.getPatterns()).toEqual(['abc'])
  })

  it('should find both old and new patterns after addPattern', () => {
    const ac = new AhoCorasick(['cat'])
    expect(ac.search('catdog')).toHaveLength(1)
    ac.addPattern('dog')
    const results = ac.search('catdog')
    expect(results).toHaveLength(2)
  })

  it('should rebuild automaton correctly', () => {
    const ac = new AhoCorasick(['abc'])
    ac.addPattern('bcd')
    const results = ac.search('abcd')
    expect(results).toHaveLength(2)
    expect(results[0]).toEqual({ pattern: 'abc', startIndex: 0, endIndex: 3 })
    expect(results[1]).toEqual({ pattern: 'bcd', startIndex: 1, endIndex: 4 })
  })

  it('rebuild should refresh the automaton', () => {
    const ac = new AhoCorasick(['xyz'])
    // Calling rebuild directly should not change behavior
    ac.rebuild()
    const results = ac.search('xyz')
    expect(results).toHaveLength(1)
    expect(results[0]!.pattern).toBe('xyz')
  })
})

// ============================================================
// 11. Patterns with common prefixes/suffixes
// ============================================================
describe('AhoCorasick - Common prefixes and suffixes', () => {
  it('should find patterns with common prefix', () => {
    const ac = new AhoCorasick(['ab', 'abc', 'abcd'])
    const results = ac.search('abcd')
    expect(results).toHaveLength(3)
    const patterns = results.map(r => r.pattern)
    expect(patterns).toContain('ab')
    expect(patterns).toContain('abc')
    expect(patterns).toContain('abcd')
  })

  it('should find patterns with common suffix', () => {
    const ac = new AhoCorasick(['abc', 'bc', 'c'])
    const results = ac.search('abc')
    expect(results).toHaveLength(3)
  })

  it('should handle one pattern being prefix of another', () => {
    const ac = new AhoCorasick(['a', 'ab'])
    const results = ac.search('ab')
    expect(results).toHaveLength(2)
    expect(results[0]).toEqual({ pattern: 'a', startIndex: 0, endIndex: 1 })
    expect(results[1]).toEqual({ pattern: 'ab', startIndex: 0, endIndex: 2 })
  })
})

// ============================================================
// 12. No matches scenario
// ============================================================
describe('AhoCorasick - No matches', () => {
  it('should return empty array when no pattern matches', () => {
    const ac = new AhoCorasick(['xyz', 'qwe'])
    expect(ac.search('abcdef')).toEqual([])
  })

  it('should return false for containsAny when no match', () => {
    const ac = new AhoCorasick(['not', 'found'])
    expect(ac.containsAny('hello world')).toBe(false)
  })

  it('should return 0 for countMatches when no match', () => {
    const ac = new AhoCorasick(['missing'])
    expect(ac.countMatches('nope')).toBe(0)
  })

  it('should return undefined for findFirst when no match', () => {
    const ac = new AhoCorasick(['absent'])
    expect(ac.findFirst('present')).toBeUndefined()
  })
})

// ============================================================
// 13. Pattern at beginning/end of text
// ============================================================
describe('AhoCorasick - Pattern at text boundaries', () => {
  it('should find pattern at the very beginning', () => {
    const ac = new AhoCorasick(['start'])
    const results = ac.search('start of text')
    expect(results[0]).toEqual({ pattern: 'start', startIndex: 0, endIndex: 5 })
  })

  it('should find pattern at the very end', () => {
    const ac = new AhoCorasick(['end'])
    const results = ac.search('the end')
    expect(results[0]).toEqual({ pattern: 'end', startIndex: 4, endIndex: 7 })
  })

  it('should find pattern that is the entire text', () => {
    const ac = new AhoCorasick(['exact'])
    const results = ac.search('exact')
    expect(results).toHaveLength(1)
    expect(results[0]).toEqual({ pattern: 'exact', startIndex: 0, endIndex: 5 })
  })
})

// ============================================================
// 14. Special characters in patterns
// ============================================================
describe('AhoCorasick - Special characters', () => {
  it('should match patterns with digits', () => {
    const ac = new AhoCorasick(['abc123'])
    const results = ac.search('xabc123y')
    expect(results).toHaveLength(1)
    expect(results[0]).toEqual({ pattern: 'abc123', startIndex: 1, endIndex: 7 })
  })

  it('should match patterns with punctuation', () => {
    const ac = new AhoCorasick(['a.b'])
    const results = ac.search('xa.by')
    expect(results).toHaveLength(1)
    expect(results[0]).toEqual({ pattern: 'a.b', startIndex: 1, endIndex: 4 })
  })

  it('should match patterns with spaces', () => {
    const ac = new AhoCorasick(['hello world'])
    const results = ac.search('say hello world now')
    expect(results).toHaveLength(1)
    expect(results[0]).toEqual({ pattern: 'hello world', startIndex: 4, endIndex: 15 })
  })

  it('should match patterns with unicode characters', () => {
    const ac = new AhoCorasick(['café'])
    const results = ac.search('le café est bon')
    expect(results).toHaveLength(1)
    expect(results[0]!.pattern).toBe('café')
  })
})

// ============================================================
// 15. findAll alias
// ============================================================
describe('AhoCorasick - findAll alias', () => {
  it('should return same results as search', () => {
    const ac = new AhoCorasick(['abc', 'de'])
    const text = 'abcdef'
    expect(ac.findAll(text)).toEqual(ac.search(text))
  })
})

// ============================================================
// 16. getPatterns returns copy
// ============================================================
describe('AhoCorasick - getPatterns immutability', () => {
  it('should return a copy, not internal reference', () => {
    const ac = new AhoCorasick(['a', 'b'])
    const patterns = ac.getPatterns()
    patterns.push('c')
    expect(ac.getPatterns()).toEqual(['a', 'b'])
  })
})

// ============================================================
// 17. Case-insensitive with multiple patterns
// ============================================================
describe('AhoCorasick - Case-insensitive multi-pattern', () => {
  it('should find all patterns regardless of case', () => {
    const ac = new AhoCorasick(['He', 'She'], { caseSensitive: false })
    const results = ac.search('SHE has HE')
    // 'SHE' matches both 'She' and 'He' (suffix), 'HE' matches 'He'
    expect(results).toHaveLength(3)
  })

  it('should preserve original pattern case in output for case-insensitive', () => {
    const ac = new AhoCorasick(['Hello'], { caseSensitive: false })
    const results = ac.search('say HELLO now')
    expect(results[0]!.pattern).toBe('Hello')
  })
})
