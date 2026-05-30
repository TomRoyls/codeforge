import { describe, expect, it } from 'vitest'

import { AhoCorasick } from '../../../src/core/aho-corasick/aho-corasick.js'

describe('AhoCorasick', () => {
  it('finds a single pattern', () => {
    const ac = new AhoCorasick(['hello'])
    const matches = ac.search('say hello world')
    expect(matches).toHaveLength(1)
    expect(matches[0]!.pattern).toBe('hello')
    expect(matches[0]!.startIndex).toBe(4)
    expect(matches[0]!.endIndex).toBe(9)
  })

  it('finds multiple patterns', () => {
    const ac = new AhoCorasick(['he', 'she', 'his', 'hers'])
    const matches = ac.search('ahishers')
    const patterns = matches.map((m) => m.pattern)
    expect(patterns).toContain('his')
    expect(patterns).toContain('she')
    expect(patterns).toContain('he')
    expect(patterns).toContain('hers')
  })

  it('finds overlapping patterns', () => {
    const ac = new AhoCorasick(['abc', 'bc', 'c'])
    const matches = ac.search('abc')
    expect(matches).toHaveLength(3)
    const patterns = matches.map((m) => m.pattern)
    expect(patterns).toContain('abc')
    expect(patterns).toContain('bc')
    expect(patterns).toContain('c')
  })

  it('returns empty for no matches', () => {
    const ac = new AhoCorasick(['xyz'])
    expect(ac.search('abcdef')).toHaveLength(0)
  })

  it('returns empty for empty text', () => {
    const ac = new AhoCorasick(['test'])
    expect(ac.search('')).toHaveLength(0)
  })

  it('returns empty for empty patterns', () => {
    const ac = new AhoCorasick([])
    expect(ac.search('anything')).toHaveLength(0)
  })

  it('filters out empty patterns', () => {
    const ac = new AhoCorasick(['', 'abc', ''])
    expect(ac.getPatterns()).toEqual(['abc'])
  })

  it('is case-insensitive by default (caseSensitive: true)', () => {
    const ac = new AhoCorasick(['Hello'])
    const matches = ac.search('Hello world')
    expect(matches).toHaveLength(1)
    expect(ac.search('hello world')).toHaveLength(0)
  })

  it('supports case-insensitive mode', () => {
    const ac = new AhoCorasick(['hello'], { caseSensitive: false })
    expect(ac.search('HELLO')).toHaveLength(1)
    expect(ac.search('Hello')).toHaveLength(1)
    expect(ac.search('hello')).toHaveLength(1)
  })

  it('findFirst returns first match', () => {
    const ac = new AhoCorasick(['cat', 'dog'])
    const first = ac.findFirst('the dog chased the cat')
    expect(first).toBeDefined()
    expect(first!.pattern).toBe('dog')
  })

  it('findFirst returns undefined for no match', () => {
    const ac = new AhoCorasick(['xyz'])
    expect(ac.findFirst('abc')).toBeUndefined()
  })

  it('findFirst returns undefined for empty text', () => {
    const ac = new AhoCorasick(['test'])
    expect(ac.findFirst('')).toBeUndefined()
  })

  it('containsAny returns true when pattern found', () => {
    const ac = new AhoCorasick(['needle'])
    expect(ac.containsAny('find the needle here')).toBe(true)
  })

  it('containsAny returns false when no pattern found', () => {
    const ac = new AhoCorasick(['needle'])
    expect(ac.containsAny('no match here')).toBe(false)
  })

  it('countMatches returns correct count', () => {
    const ac = new AhoCorasick(['ab'])
    expect(ac.countMatches('ababab')).toBe(3)
  })

  it('countMatches returns 0 for no matches', () => {
    const ac = new AhoCorasick(['xyz'])
    expect(ac.countMatches('abcdef')).toBe(0)
  })

  it('findAll is alias for search', () => {
    const ac = new AhoCorasick(['test'])
    expect(ac.findAll('test test')).toEqual(ac.search('test test'))
  })

  it('getPatterns returns copy of patterns', () => {
    const ac = new AhoCorasick(['a', 'b'])
    const patterns = ac.getPatterns()
    expect(patterns).toEqual(['a', 'b'])
    patterns.push('c')
    expect(ac.getPatterns()).toEqual(['a', 'b'])
  })

  it('addPattern adds a new pattern', () => {
    const ac = new AhoCorasick(['hello'])
    ac.addPattern('world')
    expect(ac.getPatterns()).toEqual(['hello', 'world'])
    const matches = ac.search('hello world')
    expect(matches).toHaveLength(2)
  })

  it('addPattern ignores empty string', () => {
    const ac = new AhoCorasick(['a'])
    ac.addPattern('')
    expect(ac.getPatterns()).toEqual(['a'])
  })

  it('rebuild rebuilds the automaton', () => {
    const ac = new AhoCorasick(['abc'])
    ac.addPattern('def')
    ac.rebuild()
    expect(ac.search('def')).toHaveLength(1)
    expect(ac.search('abc')).toHaveLength(1)
  })

  it('handles duplicate patterns', () => {
    const ac = new AhoCorasick(['ab', 'ab'])
    const matches = ac.search('ab')
    expect(matches).toHaveLength(2)
  })

  it('finds pattern at start of text', () => {
    const ac = new AhoCorasick(['start'])
    const matches = ac.search('start here')
    expect(matches).toHaveLength(1)
    expect(matches[0]!.startIndex).toBe(0)
  })

  it('finds pattern at end of text', () => {
    const ac = new AhoCorasick(['end'])
    const matches = ac.search('the end')
    expect(matches).toHaveLength(1)
    expect(matches[0]!.endIndex).toBe(7)
  })

  it('handles single character patterns', () => {
    const ac = new AhoCorasick(['a', 'b', 'c'])
    const matches = ac.search('abc')
    expect(matches).toHaveLength(3)
  })

  it('handles long text efficiently', () => {
    const ac = new AhoCorasick(['pattern'])
    const text = 'x'.repeat(10000) + 'pattern' + 'y'.repeat(10000)
    const matches = ac.search(text)
    expect(matches).toHaveLength(1)
    expect(matches[0]!.startIndex).toBe(10000)
  })
})
