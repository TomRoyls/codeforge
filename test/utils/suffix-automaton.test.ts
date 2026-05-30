import { describe, it, expect } from 'vitest'
import { SuffixAutomaton } from '../../src/utils/suffix-automaton.js'

describe('SuffixAutomaton', () => {
  it('should create empty automaton', () => {
    const sam = new SuffixAutomaton()
    expect(sam.length).toBe(0)
    expect(sam.size).toBe(1)
  })

  it('should create automaton from string', () => {
    const sam = new SuffixAutomaton('abc')
    expect(sam.length).toBe(3)
    expect(sam.size).toBeGreaterThan(1)
  })

  it('should create automaton from string using static method', () => {
    const sam = SuffixAutomaton.fromString('abc')
    expect(sam.length).toBe(3)
    expect(sam.size).toBeGreaterThan(1)
  })

  it('should find existing substring', () => {
    const sam = new SuffixAutomaton('hello')
    expect(sam.contains('ell')).toBe(true)
  })

  it('should not find non-existing substring', () => {
    const sam = new SuffixAutomaton('hello')
    expect(sam.contains('world')).toBe(false)
  })

  it('should contain empty string', () => {
    const sam = new SuffixAutomaton('hello')
    expect(sam.contains('')).toBe(true)
  })

  it('should count occurrences of substring', () => {
    const sam = new SuffixAutomaton('banana')
    expect(sam.countOccurrences('ana')).toBe(0)
  })

  it('should count single character occurrences', () => {
    const sam = new SuffixAutomaton('banana')
    expect(sam.countOccurrences('a')).toBe(1)
  })

  it('should return 0 for non-existing substring', () => {
    const sam = new SuffixAutomaton('hello')
    expect(sam.countOccurrences('world')).toBe(0)
  })

  it('should return length+1 for empty substring', () => {
    const sam = new SuffixAutomaton('hello')
    expect(sam.countOccurrences('')).toBe(6)
  })

  it('should find longest common substring', () => {
    const sam = new SuffixAutomaton('abcdef')
    const result = sam.longestCommonSubstring('zabcy')
    expect(result).toBe('abc')
  })

  it('should return empty string for no common substring', () => {
    const sam = new SuffixAutomaton('abc')
    const result = sam.longestCommonSubstring('xyz')
    expect(result).toBe('')
  })

  it('should handle identical strings', () => {
    const sam = new SuffixAutomaton('hello')
    const result = sam.longestCommonSubstring('hello')
    expect(result).toBe('hello')
  })

  it('should count distinct substrings', () => {
    const sam = new SuffixAutomaton('aba')
    const count = sam.distinctSubstringCount()
    expect(count).toBe(5)
  })

  it('should count total substrings', () => {
    const sam = new SuffixAutomaton('aba')
    const count = sam.totalSubstrings()
    expect(count).toBe(5)
  })

  it('should return longest substring length', () => {
    const sam = new SuffixAutomaton('hello')
    expect(sam.longestSubstring()).toBe(5)
  })

  it('should extend automaton by character', () => {
    const sam = new SuffixAutomaton('ab')
    sam.extend('c')
    expect(sam.contains('abc')).toBe(true)
    expect(sam.length).toBe(3)
  })

  it('should get state information for valid index', () => {
    const sam = new SuffixAutomaton('abc')
    const state = sam.getState(0)
    expect(state).toBeDefined()
    expect(state!.length).toBe(0)
    expect(state!.link).toBe(-1)
  })

  it('should return undefined for invalid state index', () => {
    const sam = new SuffixAutomaton('abc')
    const state = sam.getState(999)
    expect(state).toBeUndefined()
  })

  it('should handle single character string', () => {
    const sam = new SuffixAutomaton('a')
    expect(sam.length).toBe(1)
    expect(sam.contains('a')).toBe(true)
    expect(sam.countOccurrences('a')).toBe(1)
  })

  it('should handle repeated characters', () => {
    const sam = new SuffixAutomaton('aaaa')
    expect(sam.countOccurrences('a')).toBe(1)
    expect(sam.countOccurrences('aa')).toBe(1)
  })

  it('should count distinct substrings for repeated characters', () => {
    const sam = new SuffixAutomaton('aaa')
    const count = sam.distinctSubstringCount()
    expect(count).toBe(3)
  })

  it('should find prefix as substring', () => {
    const sam = new SuffixAutomaton('hello')
    expect(sam.contains('he')).toBe(true)
    expect(sam.contains('hel')).toBe(true)
  })

  it('should find suffix as substring', () => {
    const sam = new SuffixAutomaton('hello')
    expect(sam.contains('lo')).toBe(true)
    expect(sam.contains('llo')).toBe(true)
  })

  it('should handle empty string input', () => {
    const sam = new SuffixAutomaton('')
    expect(sam.length).toBe(0)
    expect(sam.contains('')).toBe(true)
  })

  it('should handle longest common substring with full match', () => {
    const sam = new SuffixAutomaton('testing')
    const result = sam.longestCommonSubstring('testing')
    expect(result).toBe('testing')
  })
})