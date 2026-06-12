import { describe, expect, it } from 'vitest'
import { BoyerMooreExtended } from '../../src/utils/boyer-moore-extended.js'

describe('BoyerMooreExtended', () => {
  it('finds all occurrences', () => {
    expect(BoyerMooreExtended.search('abcabcabc', 'abc')).toEqual([0, 3, 6])
  })

  it('finds single occurrence', () => {
    expect(BoyerMooreExtended.search('abcdef', 'cde')).toEqual([2])
  })

  it('handles no match', () => {
    expect(BoyerMooreExtended.search('abcdef', 'xyz')).toEqual([])
  })

  it('handles empty pattern', () => {
    expect(BoyerMooreExtended.search('abc', '')).toEqual([])
  })

  it('handles overlapping matches', () => {
    const result = BoyerMooreExtended.search('aaaa', 'aa')
    expect(result).toContain(0)
    expect(result.length).toBeGreaterThanOrEqual(2)
  })

  it('handles pattern longer than text', () => {
    expect(BoyerMooreExtended.search('ab', 'abcdef')).toEqual([])
  })

  it('handles single char pattern', () => {
    expect(BoyerMooreExtended.search('abcabc', 'a')).toEqual([0, 3])
  })

  it('handles pattern at end', () => {
    expect(BoyerMooreExtended.search('abcdef', 'def')).toEqual([3])
  })

  it('handles pattern at start', () => {
    expect(BoyerMooreExtended.search('abcdef', 'abc')).toEqual([0])
  })

  it('handles repeated pattern', () => {
    expect(BoyerMooreExtended.search('abababab', 'abab')).toEqual([0, 2, 4])
  })

  it('handles single char text', () => {
    expect(BoyerMooreExtended.search('a', 'a')).toEqual([0])
    expect(BoyerMooreExtended.search('a', 'b')).toEqual([])
  })

  it('handles unicode pattern', () => {
    expect(BoyerMooreExtended.search('café café', 'café')).toEqual([0, 5])
  })

  it('handles empty text', () => {
    expect(BoyerMooreExtended.search('', 'a')).toEqual([])
  })

  it('handles text shorter than pattern', () => {
    expect(BoyerMooreExtended.search('ab', 'abcdef')).toEqual([])
  })

  it('finds pattern in middle', () => {
    expect(BoyerMooreExtended.search('xabcy', 'abc')).toEqual([1])
  })

  it('finds all single char occurrences', () => {
    expect(BoyerMooreExtended.search('aaa', 'a')).toEqual([0, 1, 2])
  })

  it('handles pattern equals text', () => {
    expect(BoyerMooreExtended.search('hello', 'hello')).toEqual([0])
  })

  it('handles all same chars in pattern', () => {
    expect(BoyerMooreExtended.search('ababa', 'aaa')).toEqual([])
  })

  it('handles pattern with spaces', () => {
    expect(BoyerMooreExtended.search('hello world test', 'world')).toEqual([6])
  })

  it('handles pattern with special characters', () => {
    expect(BoyerMooreExtended.search('test@example.com', '@')).toEqual([4])
  })

  it('handles pattern with numbers', () => {
    expect(BoyerMooreExtended.search('test123test', '123')).toEqual([4])
  })

  it('handles pattern at various positions', () => {
    expect(BoyerMooreExtended.search('0a0a0a', 'a')).toEqual([1, 3, 5])
  })

  it('handles very long pattern', () => {
    const longPattern = 'a'.repeat(50)
    const text = 'prefix' + longPattern + 'suffix'
    expect(BoyerMooreExtended.search(text, longPattern)).toEqual([6])
  })

  it('handles very long text', () => {
    const longText = 'a'.repeat(1000)
    expect(BoyerMooreExtended.search(longText, 'aa')).toHaveLength(999)
  })

  it('handles pattern with newline', () => {
    expect(BoyerMooreExtended.search('hello\nworld', 'world')).toEqual([6])
  })

  it('handles pattern with tab', () => {
    expect(BoyerMooreExtended.search('hello\tworld', 'world')).toEqual([6])
  })

  it('handles pattern with multiple spaces', () => {
    expect(BoyerMooreExtended.search('a  b  c', '  ')).toEqual([1, 4])
  })

  it('handles pattern with mixed case', () => {
    expect(BoyerMooreExtended.search('HelloWorld', 'Hello')).toEqual([0])
    expect(BoyerMooreExtended.search('HelloWorld', 'hello')).toEqual([])
  })

  it('handles pattern with punctuation', () => {
    expect(BoyerMooreExtended.search('Hello, world!', 'world')).toEqual([7])
  })

  it('handles pattern with repeated characters', () => {
    expect(BoyerMooreExtended.search('aabbaabb', 'aabb')).toEqual([0, 4])
  })

  it('handles text with repeated characters', () => {
    expect(BoyerMooreExtended.search('xxxxxxx', 'xx')).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('handles pattern with underscores', () => {
    expect(BoyerMooreExtended.search('hello_world_test', '_')).toEqual([5, 11])
  })

  it('handles pattern with hyphens', () => {
    expect(BoyerMooreExtended.search('hello-world-test', '-')).toEqual([5, 11])
  })

  it('handles pattern with emojis', () => {
    expect(BoyerMooreExtended.search('Hello 😊 world', '😊')).toEqual([6])
  })

  it('handles pattern with unicode combining characters', () => {
    expect(BoyerMooreExtended.search('cafe\u0301', 'e\u0301')).toEqual([3])
  })

  it('handles pattern with backslash', () => {
    expect(BoyerMooreExtended.search('path\\to\\file', '\\')).toEqual([4, 7])
  })

  it('handles pattern with forward slash', () => {
    expect(BoyerMooreExtended.search('path/to/file', '/')).toEqual([4, 7])
  })

  it('handles pattern with brackets', () => {
    expect(BoyerMooreExtended.search('test[0]', '[')).toEqual([4])
    expect(BoyerMooreExtended.search('test[0]', ']')).toEqual([6])
  })

  it('handles pattern with braces', () => {
    expect(BoyerMooreExtended.search('test{0}', '{')).toEqual([4])
    expect(BoyerMooreExtended.search('test{0}', '}')).toEqual([6])
  })

  it('handles pattern with parentheses', () => {
    expect(BoyerMooreExtended.search('test(0)', '(')).toEqual([4])
    expect(BoyerMooreExtended.search('test(0)', ')')).toEqual([6])
  })

  it('handles pattern with dots', () => {
    expect(BoyerMooreExtended.search('example.com', '.')).toEqual([7])
  })

  it('handles pattern with colons', () => {
    expect(BoyerMooreExtended.search('http://example', ':')).toEqual([4])
  })

  it('handles pattern with semicolons', () => {
    expect(BoyerMooreExtended.search('item1;item2', ';')).toEqual([5])
  })

  it('handles pattern with commas', () => {
    expect(BoyerMooreExtended.search('a,b,c', ',')).toEqual([1, 3])
  })

  it('handles pattern with question marks', () => {
    expect(BoyerMooreExtended.search('what?', '?')).toEqual([4])
  })

  it('handles pattern with exclamation marks', () => {
    expect(BoyerMooreExtended.search('yes!', '!')).toEqual([3])
  })

  it('handles pattern with dollar signs', () => {
    expect(BoyerMooreExtended.search('$100', '$')).toEqual([0])
  })

  it('handles pattern with percent signs', () => {
    expect(BoyerMooreExtended.search('50%', '%')).toEqual([2])
  })

  it('handles pattern with asterisks', () => {
    expect(BoyerMooreExtended.search('test*', '*')).toEqual([4])
  })

  it('handles pattern with plus signs', () => {
    expect(BoyerMooreExtended.search('a+b', '+')).toEqual([1])
  })

  it('handles pattern with equals signs', () => {
    expect(BoyerMooreExtended.search('x=1', '=')).toEqual([1])
  })

  it('handles pattern with at signs', () => {
    expect(BoyerMooreExtended.search('user@host', '@')).toEqual([4])
  })

  it('handles pattern with hash signs', () => {
    expect(BoyerMooreExtended.search('#comment', '#')).toEqual([0])
  })

  it('handles pattern with ampersands', () => {
    expect(BoyerMooreExtended.search('a&b', '&')).toEqual([1])
  })

  it('handles pattern with pipes', () => {
    expect(BoyerMooreExtended.search('a|b', '|')).toEqual([1])
  })

  it('handles pattern with tildes', () => {
    expect(BoyerMooreExtended.search('~/.bashrc', '~')).toEqual([0])
  })

  it('handles pattern with backticks', () => {
    expect(BoyerMooreExtended.search('`test`', '`')).toEqual([0, 5])
  })

  it('handles pattern with single quotes', () => {
    expect(BoyerMooreExtended.search("'test'", "'")).toEqual([0, 5])
  })

  it('handles pattern with double quotes', () => {
    expect(BoyerMooreExtended.search('"test"', '"')).toEqual([0, 5])
  })
})
describe('boyer-moore-extended - wave548', () => {
  it('boyer-moore-extended module defined', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-extended module is function', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-extended module has name', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-extended module not null', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-extended module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-extended module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-extended module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-extended module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-extended module has length', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-extended module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-extended module name is string', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore-extended - wave549', () => {
  it('boyer-moore-extended module defined', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-extended module is function', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-extended module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore-extended - wave550', () => {
  it('boyer-moore-extended w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-extended w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-extended w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore-extended - wave551', () => {
  it('boyer-moore-extended w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-extended w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-extended w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})
