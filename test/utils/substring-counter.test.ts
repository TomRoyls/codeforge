import { describe, expect, it } from 'vitest'
import { SubstringCounter } from '../../src/utils/substring-counter.js'

describe('SubstringCounter', () => {
  it('counts overlapping occurrences', () => {
    const sc = new SubstringCounter('aaa')
    expect(sc.countNaive('aa')).toBe(2)
  })

  it('counts non-overlapping occurrences', () => {
    const sc = new SubstringCounter('aaa')
    expect(sc.countNonOverlapping('aa')).toBe(1)
  })

  it('returns 0 for empty substring', () => {
    const sc = new SubstringCounter('abc')
    expect(sc.countNaive('')).toBe(0)
    expect(sc.countNonOverlapping('')).toBe(0)
  })

  it('returns 0 for missing substring', () => {
    const sc = new SubstringCounter('abcdef')
    expect(sc.countNaive('xyz')).toBe(0)
  })

  it('counts single char occurrences', () => {
    const sc = new SubstringCounter('banana')
    expect(sc.countNaive('a')).toBe(3)
    expect(sc.countNaive('n')).toBe(2)
  })

  it('contains works', () => {
    const sc = new SubstringCounter('hello world')
    expect(sc.contains('world')).toBe(true)
    expect(sc.contains('xyz')).toBe(false)
  })

  it('countAllOf returns map', () => {
    const sc = new SubstringCounter('abcabc')
    const counts = sc.countAllOf(['ab', 'bc', 'xyz'])
    expect(counts.get('ab')).toBe(2)
    expect(counts.get('bc')).toBe(2)
    expect(counts.get('xyz')).toBe(0)
  })

  it('countChar works', () => {
    const sc = new SubstringCounter('aabccc')
    expect(sc.countChar('a')).toBe(2)
    expect(sc.countChar('c')).toBe(3)
    expect(sc.countChar('z')).toBe(0)
  })

  it('countChar returns 0 for multi-char', () => {
    const sc = new SubstringCounter('abc')
    expect(sc.countChar('ab')).toBe(0)
  })

  it('length and getText work', () => {
    const sc = new SubstringCounter('hello')
    expect(sc.length).toBe(5)
    expect(sc.getText()).toBe('hello')
  })

  it('handles repeated pattern', () => {
    const sc = new SubstringCounter('abababab')
    expect(sc.countNaive('abab')).toBe(3)
    expect(sc.countNonOverlapping('abab')).toBe(2)
  })

  it('handles whole string match', () => {
    const sc = new SubstringCounter('hello')
    expect(sc.countNaive('hello')).toBe(1)
  })

  it('handles empty text', () => {
    const sc = new SubstringCounter('')
    expect(sc.countNaive('a')).toBe(0)
    expect(sc.contains('a')).toBe(false)
  })

  it('countAllOf with empty array', () => {
    const sc = new SubstringCounter('abc')
    expect(sc.countAllOf([]).size).toBe(0)
  })

  it('case sensitive matching', () => {
    const sc = new SubstringCounter('Hello hello')
    expect(sc.countNaive('hello')).toBe(1)
    expect(sc.countNaive('Hello')).toBe(1)
  })

  it('overlapping substrings', () => {
    const sc = new SubstringCounter('aaa')
    expect(sc.countNaive('aa')).toBe(2)
  })

  it('count single char', () => {
    const sc = new SubstringCounter('abcabc')
    expect(sc.countNaive('a')).toBe(2)
  })

  it('count non-existent substring', () => {
    const sc = new SubstringCounter('hello')
    expect(sc.countNaive('xyz')).toBe(0)
  })

  it('count single char occurrences', () => {
    const sc = new SubstringCounter('aaa')
    expect(sc.countNaive('a')).toBe(3)
  })

  it('count in empty string', () => {
    const sc = new SubstringCounter('')
    expect(sc.countNaive('a')).toBe(0)
  })

  it('count exact match returns 1', () => {
    const sc = new SubstringCounter('abc')
    expect(sc.countNaive('abc')).toBe(1)
  })

  it('count no match returns 0', () => {
    const sc = new SubstringCounter('xyz')
    expect(sc.countNaive('abcdef')).toBe(0)
  })

  it('count exact match returns 1', () => {
    const sc = new SubstringCounter('abc')
    expect(sc.countNaive('abc')).toBeGreaterThanOrEqual(1)
  })

  it('count no match returns 0', () => {
    const sc = new SubstringCounter('xyz')
    expect(sc.countNaive('abc')).toBe(0)
  })
})
