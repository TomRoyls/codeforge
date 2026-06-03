import { describe, it, expect } from 'vitest'
import { ZFunction } from '../../src/utils/z-function.js'

describe('ZFunction', () => {
  it('computes z-array for simple string', () => {
    const zf = new ZFunction('aabcaab')
    expect(zf.z).toEqual([7, 1, 0, 0, 3, 1, 0])
  })

  it('handles empty string', () => {
    const zf = new ZFunction('')
    expect(zf.z).toEqual([])
  })

  it('handles single character', () => {
    const zf = new ZFunction('a')
    expect(zf.z).toEqual([1])
  })

  it('handles all same characters', () => {
    const zf = new ZFunction('aaaa')
    expect(zf.z).toEqual([4, 3, 2, 1])
  })

  it('handles all different characters', () => {
    const zf = new ZFunction('abcd')
    expect(zf.z).toEqual([4, 0, 0, 0])
  })

  it('search finds pattern occurrences', () => {
    const result = ZFunction.search('abcabcabc', 'abc')
    expect(result).toEqual([0, 3, 6])
  })

  it('search returns empty for no matches', () => {
    const result = ZFunction.search('abcdef', 'xyz')
    expect(result).toEqual([])
  })

  it('search handles pattern at end', () => {
    const result = ZFunction.search('abcdef', 'def')
    expect(result).toEqual([3])
  })

  it('search handles pattern longer than text', () => {
    const result = ZFunction.search('ab', 'abcdef')
    expect(result).toEqual([])
  })

  it('findPeriod for repeating string', () => {
    expect(ZFunction.findPeriod('abcabc')).toBe(3)
    expect(ZFunction.findPeriod('aaaa')).toBe(1)
  })

  it('findPeriod for non-repeating string', () => {
    expect(ZFunction.findPeriod('abcd')).toBe(4)
  })

  it('findPeriod for single character', () => {
    expect(ZFunction.findPeriod('a')).toBe(1)
  })

  it('longestCommonPrefix works', () => {
    expect(ZFunction.longestCommonPrefix('abcdef', 'abcxyz')).toBe(3)
    expect(ZFunction.longestCommonPrefix('hello', 'world')).toBe(0)
  })

  it('isSubstring works', () => {
    expect(ZFunction.isSubstring('hello world', 'world')).toBe(true)
    expect(ZFunction.isSubstring('hello world', 'xyz')).toBe(false)
  })

  it('countOccurrences works', () => {
    expect(ZFunction.countOccurrences('aaa', 'a')).toBe(3)
    expect(ZFunction.countOccurrences('ababab', 'ab')).toBe(3)
    expect(ZFunction.countOccurrences('abcdef', 'xyz')).toBe(0)
  })

  it('handles palindrome string', () => {
    const zf = new ZFunction('abaaba')
    expect(zf.z[0]).toBe(6)
  })

  it('z array length matches string', () => {
    const zf = new ZFunction('abc')
    expect(zf.z.length).toBe(3)
  })

  it('z function for repeated chars', () => {
    const zf = new ZFunction('aaa')
    expect(zf.z[0]).toBe(3)
  })

  it('z function for non-repeating string', () => {
    const zf = new ZFunction('abc')
    expect(zf.z[0]).toBe(3)
    expect(zf.z[1]).toBe(0)
  })

  it('all zeros for unique characters', () => {
    const zf = new ZFunction('abcdef')
    expect(zf.z[0]).toBe(6)
    for (let i = 1; i < 6; i++) {
      expect(zf.z[i]).toBe(0)
    }
  })

  it('repeated pattern has large z values', () => {
    const zf = new ZFunction('aaaa')
    expect(zf.z[1]).toBe(3)
  })

  it('non-repeating string has z values of 0', () => {
    const zf = new ZFunction('abcd')
    expect(zf.z[1]).toBe(0)
  })

  it('repeating prefix has non-zero z value', () => {
    const zf = new ZFunction('abab')
    expect(zf.z[2]).toBe(2)
  })
})
