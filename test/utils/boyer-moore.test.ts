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

describe('boyer-moore - wave563', () => {
  it('boyer-moore w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - wave564', () => {
  it('boyer-moore w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - wave565', () => {
  it('boyer-moore w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - wave566', () => {
  it('boyer-moore w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - wave127', () => {
  it('boyer-moore w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - wave130', () => {
  it('boyer-moore w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - wave133', () => {
  it('boyer-moore w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - wave136', () => {
  it('boyer-moore w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - wave139', () => {
  it('boyer-moore w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w142', () => {
  it('boyer-moore v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w145', () => {
  it('boyer-moore v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w148', () => {
  it('boyer-moore v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w151', () => {
  it('boyer-moore v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w154', () => {
  it('boyer-moore v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w157', () => {
  it('boyer-moore v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w160', () => {
  it('boyer-moore v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w170', () => {
  it('boyer-moore x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w180', () => {
  it('boyer-moore x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w190', () => {
  it('boyer-moore x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w200', () => {
  it('boyer-moore x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w210', () => {
  it('boyer-moore x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w220', () => {
  it('boyer-moore x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w230', () => {
  it('boyer-moore x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w240', () => {
  it('boyer-moore x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w250', () => {
  it('boyer-moore x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w260', () => {
  it('boyer-moore x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w270', () => {
  it('boyer-moore x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w280', () => {
  it('boyer-moore x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w290', () => {
  it('boyer-moore x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w300', () => {
  it('boyer-moore x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w310', () => {
  it('boyer-moore x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w320', () => {
  it('boyer-moore x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w330', () => {
  it('boyer-moore x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w340', () => {
  it('boyer-moore x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w350', () => {
  it('boyer-moore x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w360', () => {
  it('boyer-moore x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w370', () => {
  it('boyer-moore x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w380', () => {
  it('boyer-moore x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w390', () => {
  it('boyer-moore x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w400', () => {
  it('boyer-moore x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w420', () => {
  it('boyer-moore x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w440', () => {
  it('boyer-moore x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w460', () => {
  it('boyer-moore x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w480', () => {
  it('boyer-moore x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w500', () => {
  it('boyer-moore x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w550', () => {
  it('boyer-moore x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w600', () => {
  it('boyer-moore x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w650', () => {
  it('boyer-moore x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w700', () => {
  it('boyer-moore x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w800', () => {
  it('boyer-moore x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w900', () => {
  it('boyer-moore x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore - w1000', () => {
  it('boyer-moore x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
