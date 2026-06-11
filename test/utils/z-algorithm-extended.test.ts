import { describe, expect, it } from 'vitest'
import { ZAlgorithmExtended } from '../../src/utils/z-algorithm-extended.js'

describe('ZAlgorithmExtended', () => {
  it('finds all occurrences', () => {
    expect(ZAlgorithmExtended.search('abcabcabc', 'abc')).toEqual([0, 3, 6])
  })

  it('finds single occurrence', () => {
    expect(ZAlgorithmExtended.search('abcdef', 'cde')).toEqual([2])
  })

  it('handles no match', () => {
    expect(ZAlgorithmExtended.search('abcdef', 'xyz')).toEqual([])
  })

  it('handles empty pattern', () => {
    expect(ZAlgorithmExtended.search('abc', '')).toEqual([])
  })

  it('handles overlapping matches', () => {
    expect(ZAlgorithmExtended.search('aaaa', 'aa')).toEqual([0, 1, 2])
  })

  it('computes z array', () => {
    const z = ZAlgorithmExtended.zArray('aabcaab')
    expect(z[0]).toBe(7)
    expect(z[1]).toBe(1)
    expect(z[4]).toBe(3)
  })

  it('computes longest prefix suffix', () => {
    expect(ZAlgorithmExtended.longestPrefixSuffix('abcabc')).toBe(3)
    expect(ZAlgorithmExtended.longestPrefixSuffix('aaaa')).toBe(3)
  })

  it('longest prefix suffix no overlap', () => {
    expect(ZAlgorithmExtended.longestPrefixSuffix('abc')).toBe(0)
  })

  it('handles single char pattern', () => {
    expect(ZAlgorithmExtended.search('aaa', 'a')).toEqual([0, 1, 2])
  })

  it('handles pattern at end', () => {
    expect(ZAlgorithmExtended.search('abcdef', 'def')).toEqual([3])
  })

  it('handles repeated pattern', () => {
    expect(ZAlgorithmExtended.search('abababab', 'abab')).toEqual([0, 2, 4])
  })

  it('handles DNA pattern', () => {
    expect(ZAlgorithmExtended.search('ATCGATCGATCG', 'ATCG')).toEqual([0, 4, 8])
  })

  it('handles empty text', () => {
    expect(ZAlgorithmExtended.search('', 'abc')).toEqual([])
  })

  it('handles pattern longer than text', () => {
    expect(ZAlgorithmExtended.search('ab', 'abcdef')).toEqual([])
  })

  it('handles repeated single character', () => {
    expect(ZAlgorithmExtended.search('aaaa', 'a')).toEqual([0, 1, 2, 3])
  })

  it('finds single match', () => {
    expect(ZAlgorithmExtended.search('hello world', 'world')).toEqual([6])
  })

  it('finds no match', () => {
    expect(ZAlgorithmExtended.search('hello', 'xyz')).toEqual([])
  })

  it('finds match at start', () => {
    expect(ZAlgorithmExtended.search('abcdef', 'abc')).toEqual([0])
  })

  it('finds multiple matches', () => {
    expect(ZAlgorithmExtended.search('abcabc', 'abc')).toEqual([0, 3])
  })

  it('handles unicode characters', () => {
    expect(ZAlgorithmExtended.search('cafécafé', 'café')).toEqual([0, 4])
  })

  it('handles numeric patterns', () => {
    expect(ZAlgorithmExtended.search('123123123', '123')).toEqual([0, 3, 6])
  })

  it('handles case sensitivity', () => {
    expect(ZAlgorithmExtended.search('AbCaBcAbC', 'AbC')).toEqual([0, 6])
    expect(ZAlgorithmExtended.search('AbCaBcAbC', 'abc')).toEqual([])
  })

  it('handles pattern with special characters', () => {
    expect(ZAlgorithmExtended.search('test@test@test', 'test@')).toEqual([0, 5])
  })

  it('handles very long text', () => {
    const text = 'a'.repeat(1000) + 'xyz' + 'a'.repeat(1000)
    expect(ZAlgorithmExtended.search(text, 'xyz')).toEqual([1000])
  })

  it('handles pattern spanning entire text', () => {
    expect(ZAlgorithmExtended.search('hello', 'hello')).toEqual([0])
  })

  it('handles multiple spaces in pattern', () => {
    expect(ZAlgorithmExtended.search('test  test  test', 'test  ')).toEqual([0, 6])
  })

  it('handles newlines in text', () => {
    expect(ZAlgorithmExtended.search('abc\nabc\nabc', 'abc')).toEqual([0, 4, 8])
  })

  it('handles tabs in text', () => {
    expect(ZAlgorithmExtended.search('abc\tabc\tabc', 'abc')).toEqual([0, 4, 8])
  })

  it('computes z array for single character', () => {
    const z = ZAlgorithmExtended.zArray('a')
    expect(z).toEqual([1])
  })

  it('computes z array for empty string', () => {
    const z = ZAlgorithmExtended.zArray('')
    expect(z).toEqual([0])
  })

  it('computes z array for repeating pattern', () => {
    const z = ZAlgorithmExtended.zArray('abcabc')
    expect(z[0]).toBe(6)
    expect(z[3]).toBe(3)
  })

  it('computes z array for all same', () => {
    const z = ZAlgorithmExtended.zArray('aaaa')
    expect(z).toEqual([4, 3, 2, 1])
  })

  it('computes z array for unique characters', () => {
    const z = ZAlgorithmExtended.zArray('abcd')
    expect(z).toEqual([4, 0, 0, 0])
  })

  it('computes z array length matches input', () => {
    const z = ZAlgorithmExtended.zArray('hello')
    expect(z.length).toBe(5)
  })

  it('computes longest prefix suffix for single char', () => {
    expect(ZAlgorithmExtended.longestPrefixSuffix('a')).toBe(0)
  })

  it('computes longest prefix suffix for empty string', () => {
    expect(ZAlgorithmExtended.longestPrefixSuffix('')).toBe(0)
  })

  it('computes longest prefix suffix for full overlap', () => {
    expect(ZAlgorithmExtended.longestPrefixSuffix('aaaaa')).toBe(4)
  })

  it('computes longest prefix suffix for partial overlap', () => {
    expect(ZAlgorithmExtended.longestPrefixSuffix('abcab')).toBe(2)
  })

  it('computes longest prefix suffix for multiple overlapping patterns', () => {
    expect(ZAlgorithmExtended.longestPrefixSuffix('abcabcab')).toBe(5)
  })

  it('handles pattern at very beginning of large text', () => {
    const text = 'xyz' + 'a'.repeat(1000)
    expect(ZAlgorithmExtended.search(text, 'xyz')).toEqual([0])
  })

  it('handles pattern at very end of large text', () => {
    const text = 'a'.repeat(1000) + 'xyz'
    expect(ZAlgorithmExtended.search(text, 'xyz')).toEqual([1000])
  })

  it('handles pattern in middle of large text', () => {
    const text = 'a'.repeat(500) + 'xyz' + 'a'.repeat(500)
    expect(ZAlgorithmExtended.search(text, 'xyz')).toEqual([500])
  })

  it('finds pattern with overlapping occurrences', () => {
    expect(ZAlgorithmExtended.search('abababa', 'aba')).toEqual([0, 2, 4])
  })

  it('handles adjacent non-overlapping matches', () => {
    expect(ZAlgorithmExtended.search('ababab', 'ab')).toEqual([0, 2, 4])
  })

  it('finds single character in random positions', () => {
    const text = 'xabaxabxax'
    expect(ZAlgorithmExtended.search(text, 'a')).toEqual([1, 3, 5, 8])
  })

  it('handles pattern that is prefix of text', () => {
    expect(ZAlgorithmExtended.search('abcdef', 'abc')).toEqual([0])
  })

  it('handles pattern that is suffix of text', () => {
    expect(ZAlgorithmExtended.search('abcdef', 'def')).toEqual([3])
  })

  it('handles pattern that is both prefix and suffix', () => {
    expect(ZAlgorithmExtended.search('abcabc', 'abc')).toEqual([0, 3])
  })

  it('computes z array for palindrome', () => {
    const z = ZAlgorithmExtended.zArray('ababa')
    expect(z[0]).toBe(5)
  })

  it('computes z array for repeated two-char pattern', () => {
    const z = ZAlgorithmExtended.zArray('ababab')
    expect(z[0]).toBe(6)
    expect(z[2]).toBe(4)
    expect(z[4]).toBe(2)
  })

  it('handles mixed case pattern in text', () => {
    expect(ZAlgorithmExtended.search('aBcDeFaBc', 'aBc')).toEqual([0, 6])
  })

  it('finds pattern with repeated single char at start', () => {
    expect(ZAlgorithmExtended.search('aaab', 'aa')).toEqual([0, 1])
  })

  it('finds pattern with repeated single char at end', () => {
    expect(ZAlgorithmExtended.search('baaa', 'aa')).toEqual([1, 2])
  })

  it('computes longest prefix suffix for abcabcabc', () => {
    expect(ZAlgorithmExtended.longestPrefixSuffix('abcabcabc')).toBe(6)
  })

  it('computes longest prefix suffix for aabaab', () => {
    expect(ZAlgorithmExtended.longestPrefixSuffix('aabaab')).toBe(3)
  })

  it('computes longest prefix suffix for abcde', () => {
    expect(ZAlgorithmExtended.longestPrefixSuffix('abcde')).toBe(0)
  })
})
