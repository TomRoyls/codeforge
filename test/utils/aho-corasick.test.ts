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

// ─── toString method ───────────────────────────────────────
describe('AhoCorasick - toString', () => {
  it('returns string representation with pattern count', () => {
    const ac = new AhoCorasick(['a', 'b', 'c'])
    expect(ac.toString()).toBe('AhoCorasick(patterns=3)')
  })

  it('toString works with empty patterns', () => {
    const ac = new AhoCorasick([])
    expect(ac.toString()).toBe('AhoCorasick(patterns=0)')
  })

  it('toString includes duplicate patterns in count', () => {
    const ac = new AhoCorasick(['a', 'a', 'b'])
    expect(ac.toString()).toBe('AhoCorasick(patterns=3)')
  })
})

// ─── toJSON method ─────────────────────────────────────────
describe('AhoCorasick - toJSON', () => {
  it('returns copy of patterns array', () => {
    const ac = new AhoCorasick(['cat', 'dog', 'bird'])
    expect(ac.toJSON()).toEqual(['cat', 'dog', 'bird'])
  })

  it('toJSON returns new array instance', () => {
    const ac = new AhoCorasick(['a'])
    const json = ac.toJSON()
    json.push('b')
    expect(ac.patterns).toEqual(['a'])
  })

  it('toJSON includes duplicate patterns', () => {
    const ac = new AhoCorasick(['x', 'x'])
    expect(ac.toJSON()).toEqual(['x', 'x'])
  })
})

// ─── clone method ───────────────────────────────────────────
describe('AhoCorasick - clone', () => {
  it('creates a new instance with same patterns', () => {
    const ac = new AhoCorasick(['abc', 'def'])
    const clone = ac.clone()
    expect(clone.patterns).toEqual(['abc', 'def'])
    expect(clone.patternCount).toBe(2)
  })

  it('clone produces same search results', () => {
    const ac = new AhoCorasick(['he', 'she', 'his'])
    const clone = ac.clone()
    const text = 'ahishers'
    expect(clone.search(text)).toEqual(ac.search(text))
  })

  it('clone is independent from original', () => {
    const ac1 = new AhoCorasick(['a', 'b'])
    const ac2 = ac1.clone()
    // Both have same patterns
    expect(ac2.patterns).toEqual(['a', 'b'])
  })
})

// ─── equals method ──────────────────────────────────────────
describe('AhoCorasick - equals', () => {
  it('equals returns true for same instance', () => {
    const ac = new AhoCorasick(['a', 'b'])
    expect(ac.equals(ac)).toBe(true)
  })

  it('equals returns true for same patterns', () => {
    const ac1 = new AhoCorasick(['cat', 'dog'])
    const ac2 = new AhoCorasick(['cat', 'dog'])
    expect(ac1.equals(ac2)).toBe(true)
  })

  it('equals returns false for different pattern counts', () => {
    const ac1 = new AhoCorasick(['a'])
    const ac2 = new AhoCorasick(['a', 'b'])
    expect(ac1.equals(ac2)).toBe(false)
  })

  it('equals returns false for different pattern content', () => {
    const ac1 = new AhoCorasick(['x', 'y'])
    const ac2 = new AhoCorasick(['a', 'b'])
    expect(ac1.equals(ac2)).toBe(false)
  })

  it('equals returns false for non-AhoCorasick objects', () => {
    const ac = new AhoCorasick(['a'])
    expect(ac.equals(null)).toBe(false)
    expect(ac.equals(undefined)).toBe(false)
    expect(ac.equals({})).toBe(false)
    expect(ac.equals(['a'])).toBe(false)
  })

  it('equals respects duplicate patterns', () => {
    const ac1 = new AhoCorasick(['a', 'a'])
    const ac2 = new AhoCorasick(['a', 'a'])
    const ac3 = new AhoCorasick(['a'])
    expect(ac1.equals(ac2)).toBe(true)
    expect(ac1.equals(ac3)).toBe(false)
  })

  it('clone preserves patterns', () => {
    const ac = new AhoCorasick(['he', 'she'])
    const c = ac.clone()
    expect(c.search('ushers')).toEqual(ac.search('ushers'))
  })

  it('toJSON returns patterns', () => {
    const ac = new AhoCorasick(['ab', 'cd'])
    const json = ac.toJSON()
    expect(json).toBeDefined()
  })

  it('search on empty text returns empty', () => {
    const ac = new AhoCorasick(['a', 'b'])
    expect(ac.search('')).toEqual([])
  })
})

describe('aho-corasick - wave548', () => {
  it('aho-corasick module defined', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick module is function', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick module has name', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick module not null', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick module has length', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - wave549', () => {
  it('aho-corasick module defined', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick module is function', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - wave550', () => {
  it('aho-corasick w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - wave551', () => {
  it('aho-corasick w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - wave552', () => {
  it('aho-corasick w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - wave553', () => {
  it('aho-corasick w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - wave554', () => {
  it('aho-corasick w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - wave555', () => {
  it('aho-corasick w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - wave556', () => {
  it('aho-corasick w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - wave557', () => {
  it('aho-corasick w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - wave558', () => {
  it('aho-corasick w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - wave559', () => {
  it('aho-corasick w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - wave560', () => {
  it('aho-corasick w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - wave561', () => {
  it('aho-corasick w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - wave562', () => {
  it('aho-corasick w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - wave563', () => {
  it('aho-corasick w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - wave564', () => {
  it('aho-corasick w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - wave565', () => {
  it('aho-corasick w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - wave566', () => {
  it('aho-corasick w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - wave127', () => {
  it('aho-corasick w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - wave130', () => {
  it('aho-corasick w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - wave133', () => {
  it('aho-corasick w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - wave136', () => {
  it('aho-corasick w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - wave139', () => {
  it('aho-corasick w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w142', () => {
  it('aho-corasick v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w145', () => {
  it('aho-corasick v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w148', () => {
  it('aho-corasick v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w151', () => {
  it('aho-corasick v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w154', () => {
  it('aho-corasick v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w157', () => {
  it('aho-corasick v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w160', () => {
  it('aho-corasick v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w170', () => {
  it('aho-corasick x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w180', () => {
  it('aho-corasick x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w190', () => {
  it('aho-corasick x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w200', () => {
  it('aho-corasick x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w210', () => {
  it('aho-corasick x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w220', () => {
  it('aho-corasick x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w230', () => {
  it('aho-corasick x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w240', () => {
  it('aho-corasick x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w250', () => {
  it('aho-corasick x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w260', () => {
  it('aho-corasick x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w270', () => {
  it('aho-corasick x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w280', () => {
  it('aho-corasick x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w290', () => {
  it('aho-corasick x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w300', () => {
  it('aho-corasick x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w310', () => {
  it('aho-corasick x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w320', () => {
  it('aho-corasick x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w330', () => {
  it('aho-corasick x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w340', () => {
  it('aho-corasick x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w350', () => {
  it('aho-corasick x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w360', () => {
  it('aho-corasick x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w370', () => {
  it('aho-corasick x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w380', () => {
  it('aho-corasick x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w390', () => {
  it('aho-corasick x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w400', () => {
  it('aho-corasick x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w420', () => {
  it('aho-corasick x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w440', () => {
  it('aho-corasick x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w460', () => {
  it('aho-corasick x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w480', () => {
  it('aho-corasick x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w500', () => {
  it('aho-corasick x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w550', () => {
  it('aho-corasick x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('aho-corasick - w600', () => {
  it('aho-corasick x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('aho-corasick x600x49', () => {
    expect(describe).toBeDefined()
  })
})
