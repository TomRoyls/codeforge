import { describe, expect, it } from 'vitest'

import { AhoCorasick } from '../../src/utils/aho-corasick.js'

// ─── No patterns ─────────────────────────────────────────
describe('AhoCorasick - no patterns', () => {
  it('returns empty results with no patterns', () => {
    const ac = new AhoCorasick([])
    expect(ac.search('hello world')).toEqual([])
  })

  it('containsAny returns false with no patterns', () => {
    const ac = new AhoCorasick([])
    expect(ac.containsAny('hello world')).toBe(false)
  })

  it('patternCount is 0 with no patterns', () => {
    const ac = new AhoCorasick([])
    expect(ac.patternCount).toBe(0)
  })

  it('patterns getter returns empty array', () => {
    const ac = new AhoCorasick([])
    expect(ac.patterns).toEqual([])
  })
})

// ─── Single pattern ──────────────────────────────────────
describe('AhoCorasick - single pattern', () => {
  it('finds a single occurrence', () => {
    const ac = new AhoCorasick(['abc'])
    const results = ac.search('xyzabcdef')
    expect(results).toEqual([{ pattern: 'abc', start: 3, end: 5 }])
  })

  it('finds multiple occurrences of same pattern', () => {
    const ac = new AhoCorasick(['ab'])
    const results = ac.search('ababab')
    expect(results).toEqual([
      { pattern: 'ab', start: 0, end: 1 },
      { pattern: 'ab', start: 2, end: 3 },
      { pattern: 'ab', start: 4, end: 5 },
    ])
  })

  it('returns empty when pattern not found', () => {
    const ac = new AhoCorasick(['xyz'])
    expect(ac.search('abcdefgh')).toEqual([])
  })
})

// ─── Multiple patterns ───────────────────────────────────
describe('AhoCorasick - multiple patterns', () => {
  it('finds multiple different patterns', () => {
    const ac = new AhoCorasick(['he', 'she', 'his', 'hers'])
    const results = ac.search('ahishers')
    expect(results).toEqual([
      { pattern: 'his', start: 1, end: 3 },
      { pattern: 'she', start: 3, end: 5 },
      { pattern: 'he', start: 4, end: 5 },
      { pattern: 'hers', start: 4, end: 7 },
    ])
  })

  it('patternCount returns correct count', () => {
    const ac = new AhoCorasick(['a', 'b', 'c'])
    expect(ac.patternCount).toBe(3)
  })

  it('patterns getter returns all patterns', () => {
    const patterns = ['cat', 'dog', 'bird']
    const ac = new AhoCorasick(patterns)
    expect(ac.patterns).toEqual(patterns)
  })
})

// ─── Overlapping matches ─────────────────────────────────
describe('AhoCorasick - overlapping matches', () => {
  it('finds overlapping patterns', () => {
    const ac = new AhoCorasick(['ab', 'bc'])
    const results = ac.search('abc')
    expect(results).toEqual([
      { pattern: 'ab', start: 0, end: 1 },
      { pattern: 'bc', start: 1, end: 2 },
    ])
  })

  it('finds all overlapping occurrences of same pattern', () => {
    const ac = new AhoCorasick(['aa'])
    const results = ac.search('aaaa')
    expect(results).toEqual([
      { pattern: 'aa', start: 0, end: 1 },
      { pattern: 'aa', start: 1, end: 2 },
      { pattern: 'aa', start: 2, end: 3 },
    ])
  })
})

// ─── Pattern is substring of another ─────────────────────
describe('AhoCorasick - substring patterns', () => {
  it('finds both short and long pattern when one contains the other', () => {
    const ac = new AhoCorasick(['he', 'here'])
    const results = ac.search('here')
    expect(results).toEqual([
      { pattern: 'he', start: 0, end: 1 },
      { pattern: 'here', start: 0, end: 3 },
    ])
  })

  it('finds pattern that is prefix of another', () => {
    const ac = new AhoCorasick(['a', 'ab', 'abc'])
    const results = ac.search('abc')
    expect(results).toEqual([
      { pattern: 'a', start: 0, end: 0 },
      { pattern: 'ab', start: 0, end: 1 },
      { pattern: 'abc', start: 0, end: 2 },
    ])
  })
})

// ─── Pattern at boundaries ───────────────────────────────
describe('AhoCorasick - boundary positions', () => {
  it('finds pattern at the beginning of text', () => {
    const ac = new AhoCorasick(['hello'])
    const results = ac.search('hello world')
    expect(results).toEqual([{ pattern: 'hello', start: 0, end: 4 }])
  })

  it('finds pattern at the end of text', () => {
    const ac = new AhoCorasick(['world'])
    const results = ac.search('hello world')
    expect(results).toEqual([{ pattern: 'world', start: 6, end: 10 }])
  })

  it('finds pattern that is the entire text', () => {
    const ac = new AhoCorasick(['exact'])
    const results = ac.search('exact')
    expect(results).toEqual([{ pattern: 'exact', start: 0, end: 4 }])
  })
})

// ─── No matches ──────────────────────────────────────────
describe('AhoCorasick - no matches', () => {
  it('returns empty when no patterns match', () => {
    const ac = new AhoCorasick(['xyz', 'abc'])
    expect(ac.search('hello world')).toEqual([])
  })
})

// ─── containsAny ─────────────────────────────────────────
describe('AhoCorasick - containsAny', () => {
  it('returns true when a pattern is found', () => {
    const ac = new AhoCorasick(['cat', 'dog'])
    expect(ac.containsAny('the cat sat')).toBe(true)
  })

  it('returns false when no pattern is found', () => {
    const ac = new AhoCorasick(['cat', 'dog'])
    expect(ac.containsAny('the bird flew')).toBe(false)
  })

  it('returns true at first match and stops early', () => {
    const ac = new AhoCorasick(['a', 'b', 'c', 'd'])
    expect(ac.containsAny('zzzzzazzzz')).toBe(true)
  })
})

// ─── Empty text ──────────────────────────────────────────
describe('AhoCorasick - empty text', () => {
  it('returns empty results on empty text', () => {
    const ac = new AhoCorasick(['abc'])
    expect(ac.search('')).toEqual([])
  })

  it('containsAny returns false on empty text', () => {
    const ac = new AhoCorasick(['abc'])
    expect(ac.containsAny('')).toBe(false)
  })
})

// ─── Duplicate patterns ──────────────────────────────────
describe('AhoCorasick - duplicate patterns', () => {
  it('handles duplicate patterns by reporting each occurrence once', () => {
    const ac = new AhoCorasick(['ab', 'ab'])
    const results = ac.search('ab')
    expect(results.length).toBe(2)
    expect(results).toEqual([
      { pattern: 'ab', start: 0, end: 1 },
      { pattern: 'ab', start: 0, end: 1 },
    ])
  })

  it('patternCount includes duplicates', () => {
    const ac = new AhoCorasick(['a', 'a', 'b'])
    expect(ac.patternCount).toBe(3)
  })
})

// ─── Case sensitivity ────────────────────────────────────
describe('AhoCorasick - case sensitivity', () => {
  it('is case sensitive by default', () => {
    const ac = new AhoCorasick(['Hello'])
    expect(ac.search('hello HELLO Hello')).toEqual([
      { pattern: 'Hello', start: 12, end: 16 },
    ])
  })

  it('finds exact case matches only', () => {
    const ac = new AhoCorasick(['ABC'])
    expect(ac.search('abcABC')).toEqual([
      { pattern: 'ABC', start: 3, end: 5 },
    ])
  })
})

// ─── Unicode support ─────────────────────────────────────
describe('AhoCorasick - unicode', () => {
  it('handles unicode patterns correctly', () => {
    const ac = new AhoCorasick(['café'])
    const results = ac.search('un café français')
    expect(results).toEqual([{ pattern: 'café', start: 3, end: 6 }])
  })

  it('handles emoji patterns', () => {
    const ac = new AhoCorasick(['🎉🚀'])
    const results = ac.search('hello 🎉🚀 world')
    expect(results).toEqual([{ pattern: '🎉🚀', start: 6, end: 7 }])
  })

  it('handles CJK characters', () => {
    const ac = new AhoCorasick(['日本語'])
    const results = ac.search('これは日本語です')
    expect(results).toEqual([{ pattern: '日本語', start: 3, end: 5 }])
  })
})

// ─── Shared prefixes ─────────────────────────────────────
describe('AhoCorasick - shared prefixes', () => {
  it('handles patterns that share common prefixes', () => {
    const ac = new AhoCorasick(['car', 'cat', 'cap'])
    const results = ac.search('a cat in a car with a cap')
    expect(results).toEqual([
      { pattern: 'cat', start: 2, end: 4 },
      { pattern: 'car', start: 11, end: 13 },
      { pattern: 'cap', start: 22, end: 24 },
    ])
  })

  it('handles deeply shared prefixes', () => {
    const ac = new AhoCorasick(['ab', 'abc', 'abcd'])
    const results = ac.search('abcd')
    expect(results).toEqual([
      { pattern: 'ab', start: 0, end: 1 },
      { pattern: 'abc', start: 0, end: 2 },
      { pattern: 'abcd', start: 0, end: 3 },
    ])
  })
})

// ─── Long text with many patterns ────────────────────────
describe('AhoCorasick - long text performance', () => {
  it('handles long text efficiently', () => {
    const patterns = Array.from({ length: 100 }, (_, i) => `find${i}end`)
    const ac = new AhoCorasick(patterns)
    const text = 'x'.repeat(10000) + 'find42end' + 'y'.repeat(10000)
    const results = ac.search(text)
    expect(results).toEqual([{ pattern: 'find42end', start: 10000, end: 10008 }])
  })

  it('finds all patterns in dense text', () => {
    const ac = new AhoCorasick(['ab', 'cd', 'ef'])
    const text = 'abcdef'
    const results = ac.search(text)
    expect(results).toEqual([
      { pattern: 'ab', start: 0, end: 1 },
      { pattern: 'cd', start: 2, end: 3 },
      { pattern: 'ef', start: 4, end: 5 },
    ])
  })
})

// ─── findAll alias ───────────────────────────────────────
describe('AhoCorasick - findAll alias', () => {
  it('findAll returns same results as search', () => {
    const ac = new AhoCorasick(['he', 'she'])
    const text = 'ushers'
    expect(ac.findAll(text)).toEqual(ac.search(text))
  })
})

// ─── Single character patterns ───────────────────────────
describe('AhoCorasick - single character patterns', () => {
  it('finds single character patterns', () => {
    const ac = new AhoCorasick(['a', 'b'])
    const results = ac.search('abcba')
    expect(results).toEqual([
      { pattern: 'a', start: 0, end: 0 },
      { pattern: 'b', start: 1, end: 1 },
      { pattern: 'b', start: 3, end: 3 },
      { pattern: 'a', start: 4, end: 4 },
    ])
  })
})

// ─── Patterns with failure link traversal ────────────────
describe('AhoCorasick - failure link traversal', () => {
  it('correctly follows failure links for non-root transitions', () => {
    const ac = new AhoCorasick(['hi', 'hip', 'hippo'])
    const results = ac.search('hippo')
    expect(results).toEqual([
      { pattern: 'hi', start: 0, end: 1 },
      { pattern: 'hip', start: 0, end: 2 },
      { pattern: 'hippo', start: 0, end: 4 },
    ])
  })

  it('resets to root when no transition available', () => {
    const ac = new AhoCorasick(['abc'])
    const results = ac.search('abxyzabc')
    expect(results).toEqual([{ pattern: 'abc', start: 5, end: 7 }])
  })
})
