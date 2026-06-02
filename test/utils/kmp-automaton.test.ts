import { describe, expect, it } from 'vitest'
import { KMPAutomaton } from '../../src/utils/kmp-automaton.js'

describe('KMPAutomaton', () => {
  it('finds pattern in text', () => {
    const kmp = new KMPAutomaton('abc')
    expect(kmp.search('abcabc')).toEqual([0, 3])
  })

  it('returns empty for no match', () => {
    const kmp = new KMPAutomaton('xyz')
    expect(kmp.search('abcabc')).toEqual([])
  })

  it('handles empty pattern', () => {
    const kmp = new KMPAutomaton('')
    expect(kmp.search('abc')).toEqual([])
  })

  it('handles pattern longer than text', () => {
    const kmp = new KMPAutomaton('abcdef')
    expect(kmp.search('abc')).toEqual([])
  })

  it('finds overlapping matches', () => {
    const kmp = new KMPAutomaton('aa')
    expect(kmp.search('aaaa')).toEqual([0, 1, 2])
  })

  it('handles single char pattern', () => {
    const kmp = new KMPAutomaton('a')
    expect(kmp.search('ababa')).toEqual([0, 2, 4])
  })

  it('getFailure returns prefix function', () => {
    const kmp = new KMPAutomaton('aabaa')
    const fail = kmp.getFailure()
    expect(fail.length).toBe(6)
  })

  it('finds match at end', () => {
    const kmp = new KMPAutomaton('de')
    expect(kmp.search('abcde')).toEqual([3])
  })

  it('handles exact match', () => {
    const kmp = new KMPAutomaton('abc')
    expect(kmp.search('abc')).toEqual([0])
  })

  it('handles repeated pattern', () => {
    const kmp = new KMPAutomaton('ab')
    expect(kmp.search('ababab')).toEqual([0, 2, 4])
  })

  it('failure function for repeated prefix', () => {
    const kmp = new KMPAutomaton('aabaa')
    const fail = kmp.getFailure()
    expect(fail[0]).toBe(-1)
  })

  it('finds pattern in long text', () => {
    const kmp = new KMPAutomaton('abc')
    const text = 'xyzabcxyzabcxyz'
    expect(kmp.search(text)).toEqual([3, 9])
  })

  it('no match returns empty', () => {
    const kmp = new KMPAutomaton('xyz')
    expect(kmp.search('abcdef')).toEqual([])
  })

  it('pattern at start of text', () => {
    const kmp = new KMPAutomaton('abc')
    expect(kmp.search('abcdef')).toEqual([0])
  })

  it('pattern at end of text', () => {
    const kmp = new KMPAutomaton('xyz')
    expect(kmp.search('abcxyz')).toEqual([3])
  })

  it('handles overlapping matches', () => {
    const kmp = new KMPAutomaton('aa')
    expect(kmp.search('aaaa')).toEqual([0, 1, 2])
  })

  it('handles pattern not found', () => {
    const kmp = new KMPAutomaton('xyz')
    expect(kmp.search('abcabc')).toEqual([])
  })

  it('finds single occurrence', () => {
    const kmp = new KMPAutomaton('abc')
    expect(kmp.search('xyzabcdef')).toEqual([3])
  })

  it('finds pattern at start', () => {
    const kmp = new KMPAutomaton('ab')
    expect(kmp.search('abcd')).toEqual([0])
  })

  it('no match returns empty', () => {
    const kmp = new KMPAutomaton('xyz')
    expect(kmp.search('abcdef')).toEqual([])
  })
})
