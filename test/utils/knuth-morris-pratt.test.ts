import { describe, expect, it } from 'vitest'
import { KnuthMorrisPratt } from '../../src/utils/knuth-morris-pratt.js'

describe('KnuthMorrisPratt', () => {
  it('finds all occurrences of pattern', () => {
    expect(KnuthMorrisPratt.search('abababab', 'ab')).toEqual([0, 2, 4, 6])
  })

  it('finds single occurrence', () => {
    expect(KnuthMorrisPratt.search('hello world', 'world')).toEqual([6])
  })

  it('returns empty for no match', () => {
    expect(KnuthMorrisPratt.search('hello world', 'xyz')).toEqual([])
  })

  it('returns empty for empty pattern', () => {
    expect(KnuthMorrisPratt.search('hello', '')).toEqual([])
  })

  it('returns empty when text shorter than pattern', () => {
    expect(KnuthMorrisPratt.search('hi', 'hello')).toEqual([])
  })

  it('handles overlapping patterns', () => {
    expect(KnuthMorrisPratt.search('aaa', 'aa')).toEqual([0, 1])
  })

  it('handles pattern at end', () => {
    expect(KnuthMorrisPratt.search('abcdef', 'def')).toEqual([3])
  })

  it('handles pattern at start', () => {
    expect(KnuthMorrisPratt.search('abcdef', 'abc')).toEqual([0])
  })

  it('buildLPS computes correct table', () => {
    expect(KnuthMorrisPratt.buildLPS('ABABCABAB')).toEqual([0, 0, 1, 2, 0, 1, 2, 3, 4])
  })

  it('buildLPS for all same chars', () => {
    expect(KnuthMorrisPratt.buildLPS('aaaa')).toEqual([0, 1, 2, 3])
  })

  it('buildLPS for no repeats', () => {
    expect(KnuthMorrisPratt.buildLPS('abcd')).toEqual([0, 0, 0, 0])
  })

  it('contains returns true for match', () => {
    expect(KnuthMorrisPratt.contains('hello world', 'world')).toBe(true)
  })

  it('contains returns false for no match', () => {
    expect(KnuthMorrisPratt.contains('hello world', 'xyz')).toBe(false)
  })

  it('countOccurrences counts correctly', () => {
    expect(KnuthMorrisPratt.countOccurrences('ababab', 'ab')).toBe(3)
  })

  it('firstOccurrence returns index', () => {
    expect(KnuthMorrisPratt.firstOccurrence('hello world', 'world')).toBe(6)
  })

  it('firstOccurrence returns -1 for no match', () => {
    expect(KnuthMorrisPratt.firstOccurrence('hello', 'xyz')).toBe(-1)
  })
})
