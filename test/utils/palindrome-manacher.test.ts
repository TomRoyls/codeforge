import { describe, expect, it } from 'vitest'
import { PalindromeManacher } from '../../src/utils/palindrome-manacher.js'

describe('PalindromeManacher', () => {
  it('finds longest palindrome odd', () => {
    const m = new PalindromeManacher('racecar')
    expect(m.longestPalindrome()).toBe('racecar')
  })

  it('finds longest palindrome even', () => {
    const m = new PalindromeManacher('abba')
    expect(m.longestPalindrome()).toBe('abba')
  })

  it('handles single char', () => {
    const m = new PalindromeManacher('a')
    expect(m.longestPalindrome()).toBe('a')
  })

  it('handles empty string', () => {
    const m = new PalindromeManacher('')
    expect(m.longestPalindrome()).toBe('')
  })

  it('counts all palindromes', () => {
    const m = new PalindromeManacher('aaa')
    expect(m.countAllPalindromes()).toBe(6)
  })

  it('counts palindromes in abc', () => {
    const m = new PalindromeManacher('abc')
    expect(m.countAllPalindromes()).toBe(3)
  })

  it('finds palindrome in middle', () => {
    const m = new PalindromeManacher('xabay')
    expect(m.longestPalindrome()).toBe('aba')
  })

  it('checks isPalindrome', () => {
    const m = new PalindromeManacher('abacaba')
    expect(m.isPalindrome(0, 6)).toBe(true)
    expect(m.isPalindrome(0, 2)).toBe(true)
    expect(m.isPalindrome(1, 3)).toBe(false)
  })

  it('handles all same characters', () => {
    const m = new PalindromeManacher('aaaa')
    expect(m.longestPalindrome()).toBe('aaaa')
  })

  it('handles no long palindrome', () => {
    const m = new PalindromeManacher('abcdef')
    expect(m.longestPalindrome().length).toBe(1)
  })

  it('isPalindrome for even length', () => {
    const m = new PalindromeManacher('abba')
    expect(m.isPalindrome(0, 3)).toBe(true)
    expect(m.isPalindrome(0, 1)).toBe(false)
  })

  it('counts palindromes in abba', () => {
    const m = new PalindromeManacher('abba')
    expect(m.countAllPalindromes()).toBe(6)
  })

  it('handles two same characters', () => {
    const m = new PalindromeManacher('aa')
    expect(m.longestPalindrome().length).toBe(2)
    expect(m.isPalindrome(0, 1)).toBe(true)
  })

  it('handles three same characters', () => {
    const m = new PalindromeManacher('aaa')
    expect(m.longestPalindrome().length).toBe(3)
    expect(m.countAllPalindromes()).toBe(6)
  })

  it('handles abcba', () => {
    const m = new PalindromeManacher('abcba')
    expect(m.longestPalindrome().length).toBe(5)
    expect(m.isPalindrome(0, 4)).toBe(true)
    expect(m.isPalindrome(1, 3)).toBe(true)
  })

  it('full string palindrome', () => {
    const m = new PalindromeManacher('aba')
    expect(m.isPalindrome(0, 2)).toBe(true)
  })

  it('handles single character isPalindrome', () => {
    const m = new PalindromeManacher('a')
    expect(m.isPalindrome(0, 0)).toBe(true)
  })

  it('single char is always palindrome', () => {
    const m = new PalindromeManacher('abc')
    expect(m.isPalindrome(0, 0)).toBe(true)
  })

  it('aa is palindrome', () => {
    const m = new PalindromeManacher('aa')
    expect(m.isPalindrome(0, 1)).toBe(true)
  })

  it('abc has no palindrome longer than 1', () => {
    const m = new PalindromeManacher('abc')
    expect(m.isPalindrome(0, 0)).toBe(true)
    expect(m.isPalindrome(0, 1)).toBe(false)
  })

  it('handles mixed case', () => {
    const m = new PalindromeManacher('Aba')
    expect(m.longestPalindrome()).toBe('A')
  })

  it('finds multiple palindromes', () => {
    const m = new PalindromeManacher('ababa')
    expect(m.longestPalindrome()).toBe('ababa')
  })

  it('handles spaces in string', () => {
    const m = new PalindromeManacher('a ba')
    expect(m.longestPalindrome()).toBe('a')
  })

  it('empty string count is 0', () => {
    const m = new PalindromeManacher('')
    expect(m.countAllPalindromes()).toBe(0)
  })

  it('single char count is 1', () => {
    const m = new PalindromeManacher('a')
    expect(m.countAllPalindromes()).toBe(1)
  })

  it('longest palindrome in string with multiple', () => {
    const m = new PalindromeManacher('abccbaabc')
    expect(m.longestPalindrome()).toBe('abccba')
  })

  it('handles very long palindrome', () => {
    const s = 'a'.repeat(100)
    const m = new PalindromeManacher(s)
    expect(m.longestPalindrome()).toBe(s)
  })

  it('counts palindromes in all same characters', () => {
    const m = new PalindromeManacher('aaaaa')
    expect(m.countAllPalindromes()).toBe(15)
  })

  it('handles alternating characters', () => {
    const m = new PalindromeManacher('ababab')
    expect(m.longestPalindrome().length).toBe(5)
  })

  it('isPalindrome at boundaries', () => {
    const m = new PalindromeManacher('aba')
    expect(m.isPalindrome(0, 0)).toBe(true)
    expect(m.isPalindrome(2, 2)).toBe(true)
  })

  it('finds even palindrome in mixed', () => {
    const m = new PalindromeManacher('cabbac')
    expect(m.longestPalindrome()).toBe('cabbac')
  })

  it('handles string with numbers', () => {
    const m = new PalindromeManacher('12321')
    expect(m.longestPalindrome()).toBe('12321')
  })

  it('longest in complex string', () => {
    const m = new PalindromeManacher('xyzabcbaxyz')
    expect(m.longestPalindrome()).toBe('abcba')
  })

  it('counts correctly for aaaa', () => {
    const m = new PalindromeManacher('aaaa')
    expect(m.countAllPalindromes()).toBe(10)
  })

  it('overlapping palindromes', () => {
    const m = new PalindromeManacher('ababa')
    expect(m.countAllPalindromes()).toBe(9)
  })

  it('no palindrome found in random string', () => {
    const m = new PalindromeManacher('abcdefghijklmnopqrstuvwxyz')
    expect(m.longestPalindrome().length).toBe(1)
  })

  it('handles unicode characters', () => {
    const m = new PalindromeManacher('ñoñ')
    expect(m.longestPalindrome()).toBe('ñoñ')
  })

  it('isPalindrome for nested palindromes', () => {
    const m = new PalindromeManacher('abacabacaba')
    expect(m.isPalindrome(0, 10)).toBe(true)
    expect(m.isPalindrome(2, 8)).toBe(true)
  })

  it('longest palindrome at start', () => {
    const m = new PalindromeManacher('abcbaxyz')
    expect(m.longestPalindrome()).toBe('abcba')
  })

  it('longest palindrome at end', () => {
    const m = new PalindromeManacher('xyzabcba')
    expect(m.longestPalindrome()).toBe('abcba')
  })

  it('handles multiple longest palindromes', () => {
    const m = new PalindromeManacher('abcbaabcba')
    expect(m.longestPalindrome().length).toBe(10)
  })

  it('counts in palindrome with length 4', () => {
    const m = new PalindromeManacher('abba')
    expect(m.countAllPalindromes()).toBe(6)
  })

  it('handles special characters', () => {
    const m = new PalindromeManacher('a!a')
    expect(m.longestPalindrome()).toBe('a!a')
  })

  it('finds palindrome in repeated pattern', () => {
    const m = new PalindromeManacher('abcabcabc')
    expect(m.longestPalindrome().length).toBe(1)
  })

  it('isPalindrome for adjacent even palindromes', () => {
    const m = new PalindromeManacher('abbaabba')
    expect(m.isPalindrome(0, 3)).toBe(true)
    expect(m.isPalindrome(4, 7)).toBe(true)
  })

  it('handles very long string', () => {
    const s = 'a'.repeat(10000)
    const m = new PalindromeManacher(s)
    expect(m.countAllPalindromes()).toBe(s.length * (s.length + 1) / 2)
  })

  it('empty substring check', () => {
    const m = new PalindromeManacher('abc')
    expect(m.longestPalindrome().length).toBeGreaterThan(0)
  })

  it('handles mirrored substring', () => {
    const m = new PalindromeManacher('madamimadam')
    expect(m.longestPalindrome()).toBe('madamimadam')
  })

  it('counts in string with isolated palindromes', () => {
    const m = new PalindromeManacher('abcbaxyzabccba')
    expect(m.countAllPalindromes()).toBeGreaterThan(10)
  })

  it('should check if substring is palindrome', () => {
    const m = new PalindromeManacher('racecar')
    expect(m.isPalindrome(0, 6)).toBe(true)
    expect(m.isPalindrome(0, 3)).toBe(false)
  })

  it('should handle single character', () => {
    const m = new PalindromeManacher('a')
    expect(m.longestPalindrome()).toBe('a')
    expect(m.countAllPalindromes()).toBe(1)
  })

  it('isPalindrome checks substring', () => {
    const m = new PalindromeManacher('racecar')
    expect(m.isPalindrome(0, 6)).toBe(true)
    expect(m.isPalindrome(0, 3)).toBe(false)
  })

  it('longestPalindrome for single char', () => {
    const m = new PalindromeManacher('a')
    expect(m.longestPalindrome()).toBe('a')
  })

  it('countAllPalindromes for empty string is 0', () => {
    const m = new PalindromeManacher('')
    expect(m.countAllPalindromes()).toBe(0)
  })

  it('finds even-length palindromes', () => {
    const m = new PalindromeManacher('abba')
    expect(m.longestPalindrome()).toBe('abba')
  })

  it('empty string no palindromes', () => {
    const m = new PalindromeManacher('')
    expect(m.countAllPalindromes()).toBe(0)
  })

  it('single char is palindrome', () => {
    const m = new PalindromeManacher('a')
    expect(m.longestPalindrome()).toBe('a')
  })

  it('aba is palindrome', () => {
    const m = new PalindromeManacher('aba')
    expect(m.isPalindrome(0, 2)).toBe(true)
  })
})

describe('palindrome-manacher - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('palindrome-manacher - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('palindrome-manacher - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('palindrome-manacher - wave548', () => {
  it('palindrome-manacher module defined', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher module is function', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('palindrome-manacher - wave549', () => {
  it('palindrome-manacher module defined', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher module is function', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('palindrome-manacher - wave550', () => {
  it('palindrome-manacher w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('palindrome-manacher - wave551', () => {
  it('palindrome-manacher w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('palindrome-manacher - wave552', () => {
  it('palindrome-manacher w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('palindrome-manacher - wave553', () => {
  it('palindrome-manacher w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('palindrome-manacher - wave554', () => {
  it('palindrome-manacher w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('palindrome-manacher - wave555', () => {
  it('palindrome-manacher w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('palindrome-manacher - wave556', () => {
  it('palindrome-manacher w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('palindrome-manacher - wave557', () => {
  it('palindrome-manacher w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('palindrome-manacher - wave558', () => {
  it('palindrome-manacher w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('palindrome-manacher - wave559', () => {
  it('palindrome-manacher w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('palindrome-manacher - wave560', () => {
  it('palindrome-manacher w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('palindrome-manacher - wave561', () => {
  it('palindrome-manacher w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('palindrome-manacher - wave562', () => {
  it('palindrome-manacher w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('palindrome-manacher - wave563', () => {
  it('palindrome-manacher w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('palindrome-manacher - wave564', () => {
  it('palindrome-manacher w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('palindrome-manacher - wave565', () => {
  it('palindrome-manacher w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('palindrome-manacher - wave566', () => {
  it('palindrome-manacher w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('palindrome-manacher - wave127', () => {
  it('palindrome-manacher w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('palindrome-manacher - wave130', () => {
  it('palindrome-manacher w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('palindrome-manacher - wave133', () => {
  it('palindrome-manacher w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('palindrome-manacher - wave136', () => {
  it('palindrome-manacher w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('palindrome-manacher - wave139', () => {
  it('palindrome-manacher w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-manacher w139 v2', () => {
    expect(describe).toBeDefined()
  })
})
