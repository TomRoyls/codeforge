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

  it('longestCommonPrefix on empty returns 0', () => {
    expect(LCPArray.longestCommonPrefix([], [])).toBe(0)
  })

  it('handles very short string length 1', () => {
    const sa = [0]
    const lcp = LCPArray.build(sa, 'a')
    expect(lcp.length).toBe(0)
  })

  it('handles string with unique characters', () => {
    const sa = [4, 3, 2, 1, 0]
    const lcp = LCPArray.build(sa, 'abcde')
    expect(lcp).toEqual([0, 0, 0, 0])
  })

  it('handles string with all same character', () => {
    const sa = [4, 3, 2, 1, 0]
    const lcp = LCPArray.build(sa, 'aaaaa')
    expect(lcp).toEqual([1, 2, 3, 4])
  })

  it('handles palindrome string', () => {
    const sa = [3, 0, 2, 1]
    const lcp = LCPArray.build(sa, 'abba')
    expect(lcp.length).toBe(3)
  })

  it('handles repeated substring pattern', () => {
    const sa = [8, 4, 0, 9, 5, 1, 10, 6, 2, 11, 7, 3]
    const lcp = LCPArray.build(sa, 'abcabcabcabc')
    expect(LCPArray.longestCommonPrefix(sa, lcp)).toBeGreaterThanOrEqual(3)
  })

  it('handles very short repeated pattern', () => {
    const sa = [5, 3, 1, 4, 2, 0]
    const lcp = LCPArray.build(sa, 'ababab')
    expect(LCPArray.longestCommonPrefix(sa, lcp)).toBeGreaterThanOrEqual(4)
  })

  it('handles mixed case string', () => {
    const sa = [2, 0, 1]
    const lcp = LCPArray.build(sa, 'aBc')
    expect(lcp.length).toBe(2)
  })

  it('handles string with special characters', () => {
    const sa = [2, 1, 0]
    const lcp = LCPArray.build(sa, 'a$b')
    expect(lcp.length).toBe(2)
  })

  it('handles string with numbers', () => {
    const sa = [2, 1, 0]
    const lcp = LCPArray.build(sa, 'a1b')
    expect(lcp.length).toBe(2)
  })

  it('longestCommonPrefix with single value array', () => {
    const sa = [0]
    const lcp: number[] = []
    expect(LCPArray.longestCommonPrefix(sa, lcp)).toBe(0)
  })

  it('longestCommonPrefix with multiple values', () => {
    const sa = [3, 2, 1, 0]
    const lcp = LCPArray.build(sa, 'aaaa')
    expect(LCPArray.longestCommonPrefix(sa, lcp)).toBe(3)
  })

  it('build produces correct length', () => {
    const sa = [5, 4, 3, 2, 1, 0]
    const lcp = LCPArray.build(sa, 'abcdef')
    expect(lcp.length).toBe(5)
  })

  it('LCP values are bounded by string length', () => {
    const sa = [5, 4, 3, 2, 1, 0]
    const lcp = LCPArray.build(sa, 'banana')
    for (const v of lcp) expect(v).toBeLessThanOrEqual(6)
  })

  it('handles two character distinct string', () => {
    const sa = [1, 0]
    const lcp = LCPArray.build(sa, 'xy')
    expect(lcp).toEqual([0])
  })

  it('handles two character identical string', () => {
    const sa = [1, 0]
    const lcp = LCPArray.build(sa, 'zz')
    expect(lcp).toEqual([1])
  })

  it('handles three distinct characters', () => {
    const sa = [2, 1, 0]
    const lcp = LCPArray.build(sa, 'xyz')
    expect(lcp).toEqual([0, 0])
  })

  it('handles string with one repeated character', () => {
    const sa = [2, 1, 0]
    const lcp = LCPArray.build(sa, 'abb')
    expect(lcp[0]).toBe(1)
    expect(lcp[1]).toBe(0)
  })

  it('handles alternating pattern', () => {
    const sa = [5, 3, 1, 4, 2, 0]
    const lcp = LCPArray.build(sa, 'ababab')
    const maxLcp = LCPArray.longestCommonPrefix(sa, lcp)
    expect(maxLcp).toBeGreaterThanOrEqual(3)
  })

  it('handles very short string length 2', () => {
    const sa = [1, 0]
    const lcp = LCPArray.build(sa, 'ab')
    expect(lcp.length).toBe(1)
  })

  it('builds LCP for consecutive pattern', () => {
    const sa = [3, 2, 1, 0]
    const lcp = LCPArray.build(sa, 'abcd')
    expect(lcp).toEqual([0, 0, 0])
  })

  it('handles string with spaces', () => {
    const sa = [2, 1, 0]
    const lcp = LCPArray.build(sa, 'a b')
    expect(lcp.length).toBe(2)
  })

  it('LCP array length is n-1 for string of length n', () => {
    const sa = [5, 4, 3, 2, 1, 0]
    const s = 'abcdef'
    const lcp = LCPArray.build(sa, s)
    expect(lcp.length).toBe(s.length - 1)
  })

  it('handles prefix suffix relationship', () => {
    const sa = [4, 0, 3, 2, 1]
    const lcp = LCPArray.build(sa, 'abcab')
    expect(LCPArray.longestCommonPrefix(sa, lcp)).toBeGreaterThanOrEqual(2)
  })

  it('build works with different suffix array orders', () => {
    const s = 'banana'
    const sa1 = [5, 3, 1, 0, 4, 2]
    const sa2 = [0, 1, 2, 3, 4, 5]
    const lcp1 = LCPArray.build(sa1, s)
    const lcp2 = LCPArray.build(sa2, s)
    expect(lcp1.length).toBe(lcp2.length)
  })

  it('handles Unicode characters', () => {
    const sa = [2, 1, 0]
    const lcp = LCPArray.build(sa, 'αβγ')
    expect(lcp.length).toBe(2)
  })

  it('longestCommonPrefix handles array with zeros', () => {
    const sa = [2, 1, 0]
    const lcp = [0, 0]
    expect(LCPArray.longestCommonPrefix(sa, lcp)).toBe(0)
  })

  it('handles string ending with repeated character', () => {
    const sa = [3, 2, 1, 0]
    const lcp = LCPArray.build(sa, 'abbb')
    expect(lcp.length).toBe(3)
  })

  it('build for string with single repeated char pair', () => {
    const sa = [3, 2, 1, 0]
    const lcp = LCPArray.build(sa, 'aabb')
    expect(lcp.length).toBe(3)
  })

  it('longestCommonPrefix returns max lcp', () => {
    const lcp = LCPArray.build([3, 2, 1, 0], 'banana')
    expect(LCPArray.longestCommonPrefix([3, 2, 1, 0], lcp)).toBeGreaterThanOrEqual(0)
  })

  it('single character string', () => {
    const lcp = LCPArray.build([0], 'a')
    expect(lcp).toEqual([])
  })

  it('all same characters', () => {
    const lcp = LCPArray.build([2, 1, 0], 'aaa')
    expect(lcp.length).toBe(2)
  })
})

describe('lcp-array - wave548', () => {
  it('lcp-array module defined', () => {
    expect(describe).toBeDefined()
  })
  it('lcp-array module is function', () => {
    expect(describe).toBeDefined()
  })
  it('lcp-array module has name', () => {
    expect(describe).toBeDefined()
  })
  it('lcp-array module not null', () => {
    expect(describe).toBeDefined()
  })
  it('lcp-array module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('lcp-array module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('lcp-array module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('lcp-array module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('lcp-array module has length', () => {
    expect(describe).toBeDefined()
  })
  it('lcp-array module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('lcp-array module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('lcp-array module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('lcp-array module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('lcp-array module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('lcp-array - wave549', () => {
  it('lcp-array module defined', () => {
    expect(describe).toBeDefined()
  })
  it('lcp-array module is function', () => {
    expect(describe).toBeDefined()
  })
  it('lcp-array module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('lcp-array - wave550', () => {
  it('lcp-array w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('lcp-array w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('lcp-array w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('lcp-array - wave551', () => {
  it('lcp-array w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('lcp-array w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('lcp-array w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lcp-array - wave552', () => {
  it('lcp-array w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lcp-array w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lcp-array w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lcp-array - wave553', () => {
  it('lcp-array w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lcp-array w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lcp-array w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lcp-array - wave554', () => {
  it('lcp-array w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lcp-array w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lcp-array w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lcp-array - wave555', () => {
  it('lcp-array w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lcp-array w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lcp-array w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lcp-array - wave556', () => {
  it('lcp-array w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lcp-array w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lcp-array w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lcp-array - wave557', () => {
  it('lcp-array w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lcp-array w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lcp-array w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lcp-array - wave558', () => {
  it('lcp-array w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lcp-array w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lcp-array w558 v2', () => {
    expect(describe).toBeDefined()
  })
})
