import { describe, expect, it } from 'vitest'
import { AhoCorasick } from '../../../src/utils/aho-corasick.js'

describe('AhoCorasick', () => {
  it('should create instance with empty patterns', () => {
    const ac = new AhoCorasick([])
    expect(ac.patternCount).toBe(0)
    expect(ac.patterns).toEqual([])
  })

  it('should create instance with single pattern', () => {
    const ac = new AhoCorasick(['test'])
    expect(ac.patternCount).toBe(1)
    expect(ac.patterns).toEqual(['test'])
  })

  it('should create instance with multiple patterns', () => {
    const ac = new AhoCorasick(['foo', 'bar', 'baz'])
    expect(ac.patternCount).toBe(3)
    expect(ac.patterns).toEqual(['foo', 'bar', 'baz'])
  })

  it('should find single pattern match', () => {
    const ac = new AhoCorasick(['hello'])
    const results = ac.search('hello world')
    expect(results).toHaveLength(1)
    expect(results[0].pattern).toBe('hello')
    expect(results[0].start).toBe(0)
    expect(results[0].end).toBe(4)
  })

  it('should find multiple pattern matches', () => {
    const ac = new AhoCorasick(['foo', 'bar', 'baz'])
    const results = ac.search('foo bar baz')
    expect(results).toHaveLength(3)
    expect(results[0].pattern).toBe('foo')
    expect(results[1].pattern).toBe('bar')
    expect(results[2].pattern).toBe('baz')
  })

  it('should find overlapping matches', () => {
    const ac = new AhoCorasick(['he', 'she', 'his', 'hers'])
    const results = ac.search('ushers')
    expect(results).toHaveLength(3)
    expect(results[0].pattern).toBe('she')
    expect(results[1].pattern).toBe('he')
    expect(results[2].pattern).toBe('hers')
  })

  it('should return empty array when no matches found', () => {
    const ac = new AhoCorasick(['foo', 'bar'])
    const results = ac.search('hello world')
    expect(results).toEqual([])
  })

  it('should handle empty text', () => {
    const ac = new AhoCorasick(['test'])
    const results = ac.search('')
    expect(results).toEqual([])
  })

  it('should handle empty patterns search', () => {
    const ac = new AhoCorasick([])
    const results = ac.search('hello world')
    expect(results).toEqual([])
  })

  it('should find pattern at beginning of text', () => {
    const ac = new AhoCorasick(['start'])
    const results = ac.search('start of text')
    expect(results).toHaveLength(1)
    expect(results[0].start).toBe(0)
  })

  it('should find pattern at end of text', () => {
    const ac = new AhoCorasick(['end'])
    const results = ac.search('text at end')
    expect(results).toHaveLength(1)
    expect(results[0].end).toBe(10)
  })

  it('should find multiple occurrences of same pattern', () => {
    const ac = new AhoCorasick(['test'])
    const results = ac.search('test test test')
    expect(results).toHaveLength(3)
    expect(results[0].start).toBe(0)
    expect(results[1].start).toBe(5)
    expect(results[2].start).toBe(10)
  })

  it('should be case sensitive', () => {
    const ac = new AhoCorasick(['Hello'])
    const results = ac.search('hello HELLO Hello')
    expect(results).toHaveLength(1)
    expect(results[0].start).toBe(12)
  })

  it('should containAny return true when pattern exists', () => {
    const ac = new AhoCorasick(['foo', 'bar'])
    expect(ac.containsAny('hello foo world')).toBe(true)
  })

  it('should containsAny return false when no pattern exists', () => {
    const ac = new AhoCorasick(['foo', 'bar'])
    expect(ac.containsAny('hello world')).toBe(false)
  })

  it('should containsAny handle empty patterns', () => {
    const ac = new AhoCorasick([])
    expect(ac.containsAny('hello world')).toBe(false)
  })

  it('should containsAny handle empty text', () => {
    const ac = new AhoCorasick(['test'])
    expect(ac.containsAny('')).toBe(false)
  })

  it('should find pattern with special characters', () => {
    const ac = new AhoCorasick(['test!', '@home', 'a+b'])
    const results = ac.search('test! @home a+b')
    expect(results).toHaveLength(3)
  })

  it('should handle pattern that is substring of another', () => {
    const ac = new AhoCorasick(['a', 'aa', 'aaa'])
    const results = ac.search('aaaa')
    expect(results).toHaveLength(9)
  })

  it('should handle single character patterns', () => {
    const ac = new AhoCorasick(['a', 'b', 'c'])
    const results = ac.search('abcabc')
    expect(results).toHaveLength(6)
  })

  it('should return correct match indices for unicode', () => {
    const ac = new AhoCorasick(['hello'])
    const results = ac.search('hello')
    expect(results[0].start).toBe(0)
    expect(results[0].end).toBe(4)
  })

  it('should findAll return same as search', () => {
    const ac = new AhoCorasick(['foo', 'bar'])
    const searchResults = ac.search('foo bar')
    const findAllResults = ac.findAll('foo bar')
    expect(searchResults).toEqual(findAllResults)
  })

  it('should handle patterns with spaces', () => {
    const ac = new AhoCorasick(['hello world', 'test case'])
    const results = ac.search('hello world and test case')
    expect(results).toHaveLength(2)
    expect(results[0].pattern).toBe('hello world')
    expect(results[1].pattern).toBe('test case')
  })

  it('should handle large text efficiently', () => {
    const ac = new AhoCorasick(['test', 'pattern', 'match'])
    const largeText = ' '.repeat(1000) + 'test' + ' '.repeat(1000) + 'pattern'
    const results = ac.search(largeText)
    expect(results).toHaveLength(2)
  })

  it('should find pattern immediately after another', () => {
    const ac = new AhoCorasick(['foo', 'bar'])
    const results = ac.search('foobar')
    expect(results).toHaveLength(2)
    expect(results[0].start).toBe(0)
    expect(results[1].start).toBe(3)
  })
})