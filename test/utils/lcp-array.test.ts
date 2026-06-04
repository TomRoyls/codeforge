import { describe, expect, it } from 'vitest'
import { LCPArray } from '../../src/utils/lcp-array.js'

describe('LCPArray', () => {
  it('builds LCP from suffix array', () => {
    const sa = [5, 3, 1, 0, 4, 2]
    const lcp = LCPArray.build(sa, 'banana')
    expect(lcp.length).toBe(5)
  })

  it('finds longest common prefix', () => {
    const sa = [5, 3, 1, 0, 4, 2]
    const lcp = LCPArray.build(sa, 'banana')
    expect(LCPArray.longestCommonPrefix(sa, lcp)).toBeGreaterThanOrEqual(1)
  })

  it('handles single char string', () => {
    const sa = [0]
    const lcp = LCPArray.build(sa, 'a')
    expect(lcp).toEqual([])
  })

  it('handles all same chars', () => {
    const sa = [2, 1, 0]
    const lcp = LCPArray.build(sa, 'aaa')
    expect(lcp).toEqual([1, 2])
  })

  it('handles no common prefix', () => {
    const sa = [0, 1, 2]
    const lcp = LCPArray.build(sa, 'abc')
    expect(lcp).toEqual([0, 0])
  })

  it('handles two chars', () => {
    const sa = [1, 0]
    const lcp = LCPArray.build(sa, 'ba')
    expect(lcp).toEqual([0])
  })

  it('longestCommonPrefix handles empty', () => {
    expect(LCPArray.longestCommonPrefix([], [])).toBe(0)
  })

  it('builds correct LCP for abab', () => {
    const sa = [2, 0, 3, 1]
    const lcp = LCPArray.build(sa, 'abab')
    expect(lcp.length).toBe(3)
  })

  it('handles repeated pattern', () => {
    const sa = [0, 3, 1, 4, 2, 5]
    const lcp = LCPArray.build(sa, 'abcabc')
    expect(LCPArray.longestCommonPrefix(sa, lcp)).toBe(3)
  })

  it('LCP values are non-negative', () => {
    const sa = [5, 3, 1, 0, 4, 2]
    const lcp = LCPArray.build(sa, 'banana')
    for (const v of lcp) expect(v).toBeGreaterThanOrEqual(0)
  })

  it('handles two identical strings', () => {
    const sa = [2, 0, 3, 1]
    const lcp = LCPArray.build(sa, 'abab')
    expect(Math.max(...lcp)).toBeGreaterThanOrEqual(1)
  })

  it('handles single character repeated', () => {
    const sa = [3, 2, 1, 0]
    const lcp = LCPArray.build(sa, 'aaaa')
    expect(lcp.reduce((a, b) => a + b, 0)).toBeGreaterThan(0)
  })

  it('handles single character string', () => {
    const sa = [0]
    const lcp = LCPArray.build(sa, 'a')
    expect(lcp.length).toBe(0)
  })

  it('handles two character string', () => {
    const sa = [1, 0]
    const lcp = LCPArray.build(sa, 'ab')
    expect(lcp.length).toBe(1)
    expect(lcp[0]).toBe(0)
  })

  it('handles three character string', () => {
    const sa = [2, 1, 0]
    const lcp = LCPArray.build(sa, 'cba')
    expect(lcp.length).toBe(2)
  })

  it('handles repeated characters', () => {
    const sa = [2, 1, 0]
    const lcp = LCPArray.build(sa, 'aaa')
    expect(lcp[0]).toBe(1)
  })

  it('handles single character string', () => {
    const sa = [0]
    const lcp = LCPArray.build(sa, 'a')
    expect(lcp.length).toBe(0)
  })

  it('two identical chars have lcp of 1', () => {
    const sa = [1, 0]
    const lcp = LCPArray.build(sa, 'aa')
    expect(lcp).toEqual([1])
  })

  it('distinct characters have zero lcp', () => {
    const sa = [1, 0]
    const lcp = LCPArray.build(sa, 'ab')
    expect(lcp).toEqual([0])
  })

  it('identical chars have lcp 1', () => {
    const sa = [1, 0]
    const lcp = LCPArray.build(sa, 'aa')
    expect(lcp).toEqual([1])
  })

  it('distinct characters have lcp 0', () => {
    const sa = [1, 0]
    const lcp = LCPArray.build(sa, 'ab')
    expect(lcp).toEqual([0])
  })

  it('single character has empty LCP', () => {
    const sa = [0]
    const lcp = LCPArray.build(sa, 'a')
    expect(lcp).toEqual([])
  })

  it('build for repeated chars', () => {
    const sa = [2, 1, 0]
    const lcp = LCPArray.build(sa, 'aaa')
    expect(lcp.length).toBe(2)
  })

  it('single char LCP is empty', () => {
    const sa = [0]
    const lcp = LCPArray.build(sa, 'a')
    expect(lcp.length).toBe(0)
  })
})
