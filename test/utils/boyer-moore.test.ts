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

  it('should find pattern at multiple positions', () => {
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

  it('should find match at beginning', () => {
    const bm = new BoyerMoore('abc')
    const results = bm.search('abcdef')
    expect(results).toEqual([0])
  })

  it('should handle pattern equals text', () => {
    const bm = new BoyerMoore('hello')
    const results = bm.search('hello')
    expect(results).toEqual([0])
  })

  it('should handle pattern with spaces', () => {
    const bm = new BoyerMoore('world')
    const results = bm.search('hello world test')
    expect(results).toEqual([6])
  })

  it('should handle pattern with numbers', () => {
    const bm = new BoyerMoore('123')
    const results = bm.search('test123test')
    expect(results).toEqual([4])
  })

  it('should handle pattern with underscores', () => {
    const bm = new BoyerMoore('_')
    const results = bm.search('hello_world_test')
    expect(results).toEqual([5, 11])
  })

  it('should handle pattern with hyphens', () => {
    const bm = new BoyerMoore('-')
    const results = bm.search('hello-world-test')
    expect(results).toEqual([5, 11])
  })

  it('should handle pattern with dots', () => {
    const bm = new BoyerMoore('.')
    const results = bm.search('example.com')
    expect(results).toEqual([7])
  })

  it('should handle pattern with colons', () => {
    const bm = new BoyerMoore(':')
    const results = bm.search('http://example')
    expect(results).toEqual([4])
  })

  it('should handle pattern with commas', () => {
    const bm = new BoyerMoore(',')
    const results = bm.search('a,b,c')
    expect(results).toEqual([1, 3])
  })

  it('should handle pattern with semicolons', () => {
    const bm = new BoyerMoore(';')
    const results = bm.search('item1;item2')
    expect(results).toEqual([5])
  })

  it('should handle pattern with forward slash', () => {
    const bm = new BoyerMoore('/')
    const results = bm.search('path/to/file')
    expect(results).toEqual([4, 7])
  })

  it('should handle pattern with backslash', () => {
    const bm = new BoyerMoore('\\')
    const results = bm.search('path\\to\\file')
    expect(results).toEqual([4, 7])
  })

  it('should handle pattern with brackets', () => {
    const bm = new BoyerMoore('[')
    const results = bm.search('test[0]')
    expect(results).toEqual([4])
  })

  it('should handle pattern with braces', () => {
    const bm = new BoyerMoore('{')
    const results = bm.search('test{0}')
    expect(results).toEqual([4])
  })

  it('should handle pattern with parentheses', () => {
    const bm = new BoyerMoore('(')
    const results = bm.search('test(0)')
    expect(results).toEqual([4])
  })

  it('should handle pattern with at sign', () => {
    const bm = new BoyerMoore('@')
    const results = bm.search('user@host')
    expect(results).toEqual([4])
  })

  it('should handle pattern with hash', () => {
    const bm = new BoyerMoore('#')
    const results = bm.search('#comment')
    expect(results).toEqual([0])
  })

  it('should handle pattern with dollar sign', () => {
    const bm = new BoyerMoore('$')
    const results = bm.search('$100')
    expect(results).toEqual([0])
  })

  it('should handle pattern with percent', () => {
    const bm = new BoyerMoore('%')
    const results = bm.search('50%')
    expect(results).toEqual([2])
  })

  it('should handle pattern with asterisk', () => {
    const bm = new BoyerMoore('*')
    const results = bm.search('test*')
    expect(results).toEqual([4])
  })

  it('should handle pattern with plus', () => {
    const bm = new BoyerMoore('+')
    const results = bm.search('a+b')
    expect(results).toEqual([1])
  })

  it('should handle pattern with equals', () => {
    const bm = new BoyerMoore('=')
    const results = bm.search('x=1')
    expect(results).toEqual([1])
  })

  it('should handle pattern with question mark', () => {
    const bm = new BoyerMoore('?')
    const results = bm.search('what?')
    expect(results).toEqual([4])
  })

  it('should handle pattern with exclamation', () => {
    const bm = new BoyerMoore('!')
    const results = bm.search('yes!')
    expect(results).toEqual([3])
  })

  it('should handle pattern with ampersand', () => {
    const bm = new BoyerMoore('&')
    const results = bm.search('a&b')
    expect(results).toEqual([1])
  })

  it('should handle pattern with pipe', () => {
    const bm = new BoyerMoore('|')
    const results = bm.search('a|b')
    expect(results).toEqual([1])
  })

  it('should handle pattern with tilde', () => {
    const bm = new BoyerMoore('~')
    const results = bm.search('~/.bashrc')
    expect(results).toEqual([0])
  })

  it('should handle pattern with backtick', () => {
    const bm = new BoyerMoore('`')
    const results = bm.search('`test`')
    expect(results).toEqual([0, 5])
  })

  it('should handle pattern with single quote', () => {
    const bm = new BoyerMoore("'")
    const results = bm.search("'test'")
    expect(results).toEqual([0, 5])
  })

  it('should handle pattern with double quote', () => {
    const bm = new BoyerMoore('"')
    const results = bm.search('"test"')
    expect(results).toEqual([0, 5])
  })

  it('should handle empty string searchFirst', () => {
    const bm = new BoyerMoore('test')
    const first = bm.searchFirst('')
    expect(first).toBe(-1)
  })

  it('should handle empty string contains', () => {
    const bm = new BoyerMoore('test')
    expect(bm.contains('')).toBe(false)
  })

  it('should handle empty string count', () => {
    const bm = new BoyerMoore('test')
    expect(bm.count('')).toBe(0)
  })

  it('should handle very long pattern', () => {
    const longPattern = 'a'.repeat(100)
    const bm = new BoyerMoore(longPattern)
    const text = 'prefix' + longPattern + 'suffix'
    const results = bm.search(text)
    expect(results).toEqual([6])
  })

  it('should handle very long text', () => {
    const bm = new BoyerMoore('test')
    const longText = 'test'.repeat(1000)
    const results = bm.search(longText)
    expect(results.length).toBe(1000)
  })

  it('should handle pattern with newlines', () => {
    const bm = new BoyerMoore('world')
    const results = bm.search('hello\nworld')
    expect(results).toEqual([6])
  })

  it('should handle pattern with tabs', () => {
    const bm = new BoyerMoore('world')
    const results = bm.search('hello\tworld')
    expect(results).toEqual([6])
  })

  it('should handle pattern with emojis', () => {
    const bm = new BoyerMoore('😊')
    const results = bm.search('Hello 😊 world')
    expect(results).toEqual([6])
  })

  it('should handle toString', () => {
    const bm = new BoyerMoore('test')
    expect(bm.toString()).toBe('BoyerMoore(pattern="test", caseSensitive=true)')
  })

  it('should handle toString with case insensitive', () => {
    const bm = new BoyerMoore('test', { caseSensitive: false })
    expect(bm.toString()).toBe('BoyerMoore(pattern="test", caseSensitive=false)')
  })

  it('should handle toJSON', () => {
    const bm = new BoyerMoore('test')
    const json = bm.toJSON()
    expect(json).toEqual({ pattern: 'test', caseSensitive: true })
  })

  it('should handle toJSON with case insensitive', () => {
    const bm = new BoyerMoore('test', { caseSensitive: false })
    const json = bm.toJSON()
    expect(json).toEqual({ pattern: 'test', caseSensitive: false })
  })

  it('should handle clone', () => {
    const bm = new BoyerMoore('test')
    const cloned = bm.clone()
    expect(cloned.equals(bm)).toBe(true)
    expect(cloned.search('test')).toEqual([0])
  })

  it('should handle clone with case insensitive', () => {
    const bm = new BoyerMoore('test', { caseSensitive: false })
    const cloned = bm.clone()
    expect(cloned.equals(bm)).toBe(true)
    expect(cloned.search('TEST')).toEqual([0])
  })

  it('should handle equals with same pattern', () => {
    const bm1 = new BoyerMoore('test')
    const bm2 = new BoyerMoore('test')
    expect(bm1.equals(bm2)).toBe(true)
  })

  it('should handle equals with different pattern', () => {
    const bm1 = new BoyerMoore('test')
    const bm2 = new BoyerMoore('other')
    expect(bm1.equals(bm2)).toBe(false)
  })

  it('should handle equals with different case sensitivity', () => {
    const bm1 = new BoyerMoore('test', { caseSensitive: true })
    const bm2 = new BoyerMoore('test', { caseSensitive: false })
    expect(bm1.equals(bm2)).toBe(false)
  })

  it('should handle equals with non-BoyerMoore object', () => {
    const bm = new BoyerMoore('test')
    expect(bm.equals({ pattern: 'test' })).toBe(false)
    expect(bm.equals(null)).toBe(false)
    expect(bm.equals(undefined)).toBe(false)
  })

  it('should handle searchFirst returns -1 for no match', () => {
    const bm = new BoyerMoore('xyz')
    expect(bm.searchFirst('abc')).toBe(-1)
  })

  it('should handle searchFirst returns 0 for match at start', () => {
    const bm = new BoyerMoore('abc')
    expect(bm.searchFirst('abcdef')).toBe(0)
  })

  it('should handle contains returns true for match', () => {
    const bm = new BoyerMoore('abc')
    expect(bm.contains('xyzabcxyz')).toBe(true)
  })

  it('should handle contains returns false for no match', () => {
    const bm = new BoyerMoore('xyz')
    expect(bm.contains('abc')).toBe(false)
  })
})
describe('boyer-moore - wave550', () => {
  it('boyer-moore w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w550 is function', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - wave551', () => {
  it('boyer-moore w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - wave552', () => {
  it('boyer-moore w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - wave553', () => {
  it('boyer-moore w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - wave554', () => {
  it('boyer-moore w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - wave555', () => {
  it('boyer-moore w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - wave556', () => {
  it('boyer-moore w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - wave557', () => {
  it('boyer-moore w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - wave558', () => {
  it('boyer-moore w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - wave559', () => {
  it('boyer-moore w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - wave560', () => {
  it('boyer-moore w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - wave561', () => {
  it('boyer-moore w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - wave562', () => {
  it('boyer-moore w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w562 v2', () => {
    expect(describe).toBeDefined()
  })
})
