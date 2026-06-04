import { describe, it, expect } from 'vitest'
import { BoyerMoore } from '../../src/utils/boyer-moore.js'

describe('BoyerMoore', () => {
  it('should find single occurrence', () => {
    const bm = new BoyerMoore('hello')
    const results = bm.search('hello world')
    expect(results).toEqual([0])
  })

  it('should find multiple occurrences', () => {
    const bm = new BoyerMoore('ab')
    const results = bm.search('ab ab ab')
    expect(results).toEqual([0, 3, 6])
  })

  it('should find first occurrence', () => {
    const bm = new BoyerMoore('test')
    const first = bm.searchFirst('this is a test string')
    expect(first).toBe(10)
  })

  it('should return -1 when pattern not found', () => {
    const bm = new BoyerMoore('xyz')
    const first = bm.searchFirst('hello world')
    expect(first).toBe(-1)
  })

  it('should check if text contains pattern', () => {
    const bm = new BoyerMoore('hello')
    expect(bm.contains('hello world')).toBe(true)
    expect(bm.contains('goodbye')).toBe(false)
  })

  it('should count occurrences', () => {
    const bm = new BoyerMoore('ab')
    const count = bm.count('ab ab ab')
    expect(count).toBe(3)
  })

  it('should handle empty pattern', () => {
    const bm = new BoyerMoore('')
    const results = bm.search('hello world')
    expect(results).toEqual([])
  })

  it('should handle text shorter than pattern', () => {
    const bm = new BoyerMoore('hello world')
    const results = bm.search('hello')
    expect(results).toEqual([])
  })

  it('should be case sensitive by default', () => {
    const bm = new BoyerMoore('Hello')
    const results = bm.search('hello world')
    expect(results).toEqual([])
  })

  it('should support case insensitive search', () => {
    const bm = new BoyerMoore('Hello', { caseSensitive: false })
    const results = bm.search('hello world HELLO')
    expect(results).toEqual([0, 12])
  })

  it('should handle overlapping patterns', () => {
    const bm = new BoyerMoore('aaa')
    const results = bm.search('aaaaa')
    expect(results).toEqual([0, 1, 2])
  })

  it('should search for single character pattern', () => {
    const bm = new BoyerMoore('a')
    const results = bm.search('banana')
    expect(results).toEqual([1, 3, 5])
  })

  it('should find pattern at beginning of text', () => {
    const bm = new BoyerMoore('start')
    const results = bm.search('start here')
    expect(results).toEqual([0])
  })

  it('should find pattern at end of text', () => {
    const bm = new BoyerMoore('end')
    const results = bm.search('find at end')
    expect(results).toEqual([8])
  })

  it('should handle special characters', () => {
    const bm = new BoyerMoore('test!@#')
    const results = bm.search('this is test!@# here')
    expect(results).toEqual([8])
  })

  it('should find pattern with repeated characters', () => {
    const bm = new BoyerMoore('aaab')
    const results = bm.search('aaabaaab')
    expect(results).toEqual([0, 4])
  })

  it('should handle unicode characters', () => {
    const bm = new BoyerMoore('café')
    const results = bm.search('this café is nice')
    expect(results).toEqual([5])
  })

  it('should count zero occurrences when pattern not found', () => {
    const bm = new BoyerMoore('xyz')
    const count = bm.count('hello world')
    expect(count).toBe(0)
  })

  it('should return empty array for no matches', () => {
    const bm = new BoyerMoore('pattern')
    const results = bm.search('no matches here')
    expect(results).toEqual([])
  })

  it('should handle pattern at multiple positions', () => {
    const bm = new BoyerMoore('ab')
    const results = bm.search('abababab')
    expect(results).toEqual([0, 2, 4, 6])
  })

  it('should find first occurrence with case insensitive', () => {
    const bm = new BoyerMoore('Test', { caseSensitive: false })
    const first = bm.searchFirst('this is a test')
    expect(first).toBe(10)
  })

  it('should count occurrences case insensitive', () => {
    const bm = new BoyerMoore('ab', { caseSensitive: false })
    const count = bm.count('AB ab Ab')
    expect(count).toBe(3)
  })

  it('search returns positions', () => {
    const bm = new BoyerMoore('ab')
    const results = bm.search('ababab')
    expect(results.length).toBe(3)
  })

  it('no match returns empty', () => {
    const bm = new BoyerMoore('xyz')
    const results = bm.search('abcdef')
    expect(results.length).toBe(0)
  })

  it('finds match at beginning', () => {
    const bm = new BoyerMoore('abc')
    const results = bm.search('abcdef')
    expect(results).toEqual([0])
  })
})