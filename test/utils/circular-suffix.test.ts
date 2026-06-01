import { describe, expect, it } from 'vitest'
import { CircularSuffix } from '../../src/utils/circular-suffix.js'

describe('CircularSuffix', () => {
  it('builds suffix array for abab', () => {
    const cs = CircularSuffix.build('abab')
    expect(cs.suffixArray()).toEqual([0, 2, 1, 3])
  })

  it('returns correct rank', () => {
    const cs = CircularSuffix.build('abab')
    expect(cs.rank(0)).toBe(0)
    expect(cs.rank(1)).toBe(2)
  })

  it('returns correct index', () => {
    const cs = CircularSuffix.build('abab')
    expect(cs.index(0)).toBe(0)
    expect(cs.index(2)).toBe(1)
  })

  it('handles single char', () => {
    const cs = CircularSuffix.build('a')
    expect(cs.suffixArray()).toEqual([0])
    expect(cs.length).toBe(1)
  })

  it('handles all same chars', () => {
    const cs = CircularSuffix.build('aaa')
    expect(cs.suffixArray()).toEqual([0, 1, 2])
  })

  it('handles reverse sorted', () => {
    const cs = CircularSuffix.build('cba')
    expect(cs.suffixArray()).toEqual([2, 1, 0])
  })

  it('returns length', () => {
    const cs = CircularSuffix.build('hello')
    expect(cs.length).toBe(5)
  })

  it('handles two chars', () => {
    const cs = CircularSuffix.build('ba')
    expect(cs.suffixArray()).toEqual([1, 0])
  })

  it('rank and index are inverses', () => {
    const cs = CircularSuffix.build('banana')
    for (let i = 0; i < 6; i++) {
      expect(cs.index(cs.rank(i))).toBe(i)
    }
  })

  it('handles empty string', () => {
    const cs = CircularSuffix.build('')
    expect(cs.length).toBe(0)
    expect(cs.suffixArray()).toEqual([])
  })

  it('abc circular order', () => {
    const cs = CircularSuffix.build('abc')
    expect(cs.suffixArray()).toEqual([0, 1, 2])
  })

  it('cab circular order', () => {
    const cs = CircularSuffix.build('cab')
    expect(cs.suffixArray()).toEqual([1, 2, 0])
  })

  it('aaaa all same', () => {
    const cs = CircularSuffix.build('aaaa')
    const sa = cs.suffixArray()
    expect(sa.length).toBe(4)
  })

  it('single character', () => {
    const cs = CircularSuffix.build('a')
    expect(cs.suffixArray()).toEqual([0])
  })

  it('ab circular order', () => {
    const cs = CircularSuffix.build('ab')
    expect(cs.suffixArray()).toEqual([0, 1])
  })

  it('suffix array for banana', () => {
    const cs = CircularSuffix.build('banana')
    expect(cs.suffixArray().length).toBe(6)
  })

  it('empty string suffix array', () => {
    const cs = CircularSuffix.build('')
    expect(cs.suffixArray()).toEqual([])
  })
})
