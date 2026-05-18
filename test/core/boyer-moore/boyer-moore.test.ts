import { describe, expect, it } from 'vitest'

import { BoyerMoore } from '../../../src/core/boyer-moore/boyer-moore.js'

// ─── Constructor ───

describe('BoyerMoore constructor', () => {
  it('creates instance with default case-sensitive option', () => {
    const bm = new BoyerMoore('hello')
    expect(bm.getPattern()).toBe('hello')
  })

  it('creates instance with case-insensitive option', () => {
    const bm = new BoyerMoore('Hello', { caseSensitive: false })
    expect(bm.getPattern()).toBe('Hello')
  })

  it('creates instance with empty pattern', () => {
    const bm = new BoyerMoore('')
    expect(bm.getPattern()).toBe('')
  })

  it('creates instance with single character pattern', () => {
    const bm = new BoyerMoore('a')
    expect(bm.getPattern()).toBe('a')
  })
})

// ─── search ───

describe('BoyerMoore.search', () => {
  it('finds pattern at the beginning of text', () => {
    const bm = new BoyerMoore('hello')
    expect(bm.search('hello world')).toBe(0)
  })

  it('finds pattern in the middle of text', () => {
    const bm = new BoyerMoore('world')
    expect(bm.search('hello world')).toBe(6)
  })

  it('finds pattern at the end of text', () => {
    const bm = new BoyerMoore('world')
    expect(bm.search('hello world')).toBe(6)
  })

  it('finds pattern that equals the entire text', () => {
    const bm = new BoyerMoore('exact')
    expect(bm.search('exact')).toBe(0)
  })

  it('returns -1 when pattern not found', () => {
    const bm = new BoyerMoore('xyz')
    expect(bm.search('hello world')).toBe(-1)
  })

  it('returns 0 for empty pattern', () => {
    const bm = new BoyerMoore('')
    expect(bm.search('anything')).toBe(0)
  })

  it('returns -1 for empty text with non-empty pattern', () => {
    const bm = new BoyerMoore('test')
    expect(bm.search('')).toBe(-1)
  })

  it('returns -1 when pattern is longer than text', () => {
    const bm = new BoyerMoore('a very long pattern')
    expect(bm.search('short')).toBe(-1)
  })

  it('finds single character pattern', () => {
    const bm = new BoyerMoore('z')
    expect(bm.search('abczdef')).toBe(3)
  })

  it('is case-sensitive by default', () => {
    const bm = new BoyerMoore('Hello')
    expect(bm.search('hello world')).toBe(-1)
  })

  it('is case-insensitive when option is set', () => {
    const bm = new BoyerMoore('Hello', { caseSensitive: false })
    expect(bm.search('hello world')).toBe(0)
  })

  it('handles repeated characters in pattern', () => {
    const bm = new BoyerMoore('aaa')
    expect(bm.search('baaab')).toBe(1)
  })

  it('finds pattern with special characters', () => {
    const bm = new BoyerMoore('$#@!')
    expect(bm.search('abc$#@!def')).toBe(3)
  })
})

// ─── searchAll ───

describe('BoyerMoore.searchAll', () => {
  it('finds all occurrences of pattern', () => {
    const bm = new BoyerMoore('ab')
    expect(bm.searchAll('ababab')).toEqual([0, 2, 4])
  })

  it('finds single occurrence', () => {
    const bm = new BoyerMoore('test')
    expect(bm.searchAll('this is a test')).toEqual([10])
  })

  it('returns empty array when no match', () => {
    const bm = new BoyerMoore('xyz')
    expect(bm.searchAll('hello world')).toEqual([])
  })

  it('returns all positions for empty pattern', () => {
    const bm = new BoyerMoore('')
    expect(bm.searchAll('abc')).toEqual([0, 1, 2, 3])
  })

  it('returns empty array for empty text', () => {
    const bm = new BoyerMoore('test')
    expect(bm.searchAll('')).toEqual([])
  })

  it('returns empty array when pattern longer than text', () => {
    const bm = new BoyerMoore('longer')
    expect(bm.searchAll('hi')).toEqual([])
  })

  it('does not overlap matches (non-overlapping)', () => {
    const bm = new BoyerMoore('aaa')
    expect(bm.searchAll('aaaaaa')).toEqual([0, 3])
  })

  it('finds occurrences with case-insensitive option', () => {
    const bm = new BoyerMoore('ab', { caseSensitive: false })
    expect(bm.searchAll('Ab aB AB')).toEqual([0, 3, 6])
  })

  it('handles pattern equal to text', () => {
    const bm = new BoyerMoore('exact')
    expect(bm.searchAll('exact')).toEqual([0])
  })
})

// ─── count ───

describe('BoyerMoore.count', () => {
  it('counts zero occurrences', () => {
    const bm = new BoyerMoore('xyz')
    expect(bm.count('hello')).toBe(0)
  })

  it('counts one occurrence', () => {
    const bm = new BoyerMoore('hello')
    expect(bm.count('say hello world')).toBe(1)
  })

  it('counts multiple occurrences', () => {
    const bm = new BoyerMoore('ab')
    expect(bm.count('ababab')).toBe(3)
  })

  it('counts correctly for empty pattern', () => {
    const bm = new BoyerMoore('')
    expect(bm.count('abc')).toBe(4)
  })
})

// ─── contains ───

describe('BoyerMoore.contains', () => {
  it('returns true when pattern exists', () => {
    const bm = new BoyerMoore('world')
    expect(bm.contains('hello world')).toBe(true)
  })

  it('returns false when pattern does not exist', () => {
    const bm = new BoyerMoore('xyz')
    expect(bm.contains('hello world')).toBe(false)
  })

  it('returns true for empty pattern', () => {
    const bm = new BoyerMoore('')
    expect(bm.contains('anything')).toBe(true)
  })

  it('returns false for empty text with non-empty pattern', () => {
    const bm = new BoyerMoore('test')
    expect(bm.contains('')).toBe(false)
  })
})

// ─── getPattern / setPattern ───

describe('BoyerMoore.getPattern / setPattern', () => {
  it('returns the original pattern', () => {
    const bm = new BoyerMoore('test')
    expect(bm.getPattern()).toBe('test')
  })

  it('preserves original pattern even when case-insensitive', () => {
    const bm = new BoyerMoore('Test', { caseSensitive: false })
    expect(bm.getPattern()).toBe('Test')
  })

  it('updates pattern and rebuilds tables', () => {
    const bm = new BoyerMoore('old')
    bm.setPattern('new')
    expect(bm.getPattern()).toBe('new')
    expect(bm.search('a new pattern')).toBe(2)
  })

  it('works with empty pattern after setPattern', () => {
    const bm = new BoyerMoore('test')
    bm.setPattern('')
    expect(bm.getPattern()).toBe('')
    expect(bm.search('anything')).toBe(0)
  })

  it('setPattern respects case-sensitivity setting', () => {
    const bm = new BoyerMoore('x', { caseSensitive: false })
    bm.setPattern('ABC')
    expect(bm.search('abc')).toBe(0)
  })
})

// ─── Static methods ───

describe('BoyerMoore static methods', () => {
  it('static search finds pattern', () => {
    expect(BoyerMoore.search('hello world', 'world')).toBe(6)
  })

  it('static search returns -1 when not found', () => {
    expect(BoyerMoore.search('hello world', 'xyz')).toBe(-1)
  })

  it('static searchAll returns all positions', () => {
    expect(BoyerMoore.searchAll('abcabc', 'abc')).toEqual([0, 3])
  })

  it('static count returns occurrence count', () => {
    expect(BoyerMoore.count('ababab', 'ab')).toBe(3)
  })

  it('static contains returns boolean', () => {
    expect(BoyerMoore.contains('hello world', 'world')).toBe(true)
    expect(BoyerMoore.contains('hello world', 'xyz')).toBe(false)
  })
})

// ─── Edge cases ───

describe('BoyerMoore edge cases', () => {
  it('handles unicode characters', () => {
    const bm = new BoyerMoore('café')
    expect(bm.search('un café')).toBe(3)
  })

  it('handles pattern with spaces', () => {
    const bm = new BoyerMoore('hello world')
    expect(bm.search('say hello world now')).toBe(4)
  })

  it('handles repeated search on different texts', () => {
    const bm = new BoyerMoore('test')
    expect(bm.search('test one')).toBe(0)
    expect(bm.search('no match here')).toBe(-1)
    expect(bm.search('another test')).toBe(8)
  })

  it('handles long pattern with repeated suffix', () => {
    const bm = new BoyerMoore('abab')
    expect(bm.search('xababx')).toBe(1)
  })

  it('handles case-insensitive with mixed case text', () => {
    const bm = new BoyerMoore('AbC', { caseSensitive: false })
    expect(bm.search('aBc DeF')).toBe(0)
  })
})
