import { BoyerMoore } from '../src/core/boyer-moore/boyer-moore.js'
import type { BoyerMooreOptions } from '../src/core/boyer-moore/boyer-moore.js'
import { DEFAULT_BOYER_MOORE_OPTIONS } from '../src/core/boyer-moore/boyer-moore.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('BoyerMoore', () => {
  describe('constructor', () => {
    it('creates instance with default case-sensitive option', () => {
      const bm = new BoyerMoore('hello')
      expect(bm.getPattern()).toBe('hello')
    })

    it('creates instance with case-insensitive option', () => {
      const bm = new BoyerMoore('Hello', { caseSensitive: false })
      expect(bm.getPattern()).toBe('Hello')
    })

    it('creates instance with empty pattern', () => {
      const bm = new BoyerMoore('')
      expect(bm.getPattern()).toBe('')
    })

    it('creates instance with single character pattern', () => {
      const bm = new BoyerMoore('x')
      expect(bm.getPattern()).toBe('x')
    })

    it('creates instance with long pattern', () => {
      const pattern = 'a'.repeat(1000)
      const bm = new BoyerMoore(pattern)
      expect(bm.getPattern()).toBe(pattern)
    })
  })

  // ─── search (instance) ───────────────────────────────────────────────

  describe('search', () => {
    it('finds pattern at beginning of text', () => {
      const bm = new BoyerMoore('hello')
      expect(bm.search('hello world')).toBe(0)
    })

    it('finds pattern in middle of text', () => {
      const bm = new BoyerMoore('world')
      expect(bm.search('hello world')).toBe(6)
    })

    it('finds pattern at end of text', () => {
      const bm = new BoyerMoore('world')
      expect(bm.search('hello world')).toBe(6)
    })

    it('finds single character', () => {
      const bm = new BoyerMoore('a')
      expect(bm.search('abc')).toBe(0)
    })

    it('returns -1 when pattern is not found', () => {
      const bm = new BoyerMoore('xyz')
      expect(bm.search('hello world')).toBe(-1)
    })

    it('returns 0 for empty pattern', () => {
      const bm = new BoyerMoore('')
      expect(bm.search('anything')).toBe(0)
    })

    it('returns 0 for empty pattern in empty text', () => {
      const bm = new BoyerMoore('')
      expect(bm.search('')).toBe(0)
    })

    it('returns -1 for empty text with non-empty pattern', () => {
      const bm = new BoyerMoore('abc')
      expect(bm.search('')).toBe(-1)
    })

    it('returns -1 when pattern is longer than text', () => {
      const bm = new BoyerMoore('hello world')
      expect(bm.search('hi')).toBe(-1)
    })

    it('finds exact match when pattern equals text', () => {
      const bm = new BoyerMoore('exact')
      expect(bm.search('exact')).toBe(0)
    })

    it('finds pattern with repeated characters', () => {
      const bm = new BoyerMoore('aa')
      expect(bm.search('baab')).toBe(1)
    })

    it('finds the first occurrence when multiple exist', () => {
      const bm = new BoyerMoore('ab')
      expect(bm.search('abab')).toBe(0)
    })

    it('is case-sensitive by default', () => {
      const bm = new BoyerMoore('Hello')
      expect(bm.search('hello World')).toBe(-1)
    })

    it('is case-insensitive when configured', () => {
      const bm = new BoyerMoore('Hello', { caseSensitive: false })
      expect(bm.search('hello world')).toBe(0)
    })

    it('case-insensitive finds match with different casing', () => {
      const bm = new BoyerMoore('WORLD', { caseSensitive: false })
      expect(bm.search('hello world')).toBe(6)
    })

    it('finds pattern after many mismatches', () => {
      const bm = new BoyerMoore('xyz')
      expect(bm.search('aaaaaaaaaaaaaaaaaaaxyz')).toBe(19)
    })

    it('handles special regex characters literally', () => {
      const bm = new BoyerMoore('[a-z]+')
      expect(bm.search('test [a-z]+ pattern')).toBe(5)
    })

    it('handles newline characters', () => {
      const bm = new BoyerMoore('\n')
      expect(bm.search('line1\nline2')).toBe(5)
    })

    it('handles tab characters', () => {
      const bm = new BoyerMoore('\t')
      expect(bm.search('col1\tcol2')).toBe(4)
    })

    it('handles patterns with spaces', () => {
      const bm = new BoyerMoore('hello world')
      expect(bm.search('say hello world now')).toBe(4)
    })

    it('handles unicode characters', () => {
      const bm = new BoyerMoore('café')
      expect(bm.search('go to café now')).toBe(6)
    })

    it('handles emoji characters', () => {
      const bm = new BoyerMoore('😀')
      expect(bm.search('hello 😀 world')).toBe(6)
    })

    it('handles multi-byte unicode patterns', () => {
      const bm = new BoyerMoore('日本語')
      expect(bm.search('これは日本語です')).toBe(3)
    })

    it('handles pattern of repeated single character', () => {
      const bm = new BoyerMoore('aaa')
      expect(bm.search('baaaab')).toBe(1)
    })

    it('handles overlapping potential matches', () => {
      const bm = new BoyerMoore('aba')
      expect(bm.search('ababa')).toBe(0)
    })
  })

  // ─── searchAll (instance) ────────────────────────────────────────────

  describe('searchAll', () => {
    it('finds all non-overlapping occurrences', () => {
      const bm = new BoyerMoore('ab')
      expect(bm.searchAll('ababab')).toEqual([0, 2, 4])
    })

    it('returns empty array when no matches', () => {
      const bm = new BoyerMoore('xyz')
      expect(bm.searchAll('hello world')).toEqual([])
    })

    it('returns single match', () => {
      const bm = new BoyerMoore('hello')
      expect(bm.searchAll('say hello world')).toEqual([4])
    })

    it('returns empty array for empty text', () => {
      const bm = new BoyerMoore('abc')
      expect(bm.searchAll('')).toEqual([])
    })

    it('returns all positions for empty pattern', () => {
      const bm = new BoyerMoore('')
      expect(bm.searchAll('abc')).toEqual([0, 1, 2, 3])
    })

    it('returns [0] for empty pattern in empty text', () => {
      const bm = new BoyerMoore('')
      expect(bm.searchAll('')).toEqual([0])
    })

    it('returns empty array when pattern longer than text', () => {
      const bm = new BoyerMoore('abcdef')
      expect(bm.searchAll('abc')).toEqual([])
    })

    it('finds repeated single-character pattern', () => {
      const bm = new BoyerMoore('a')
      expect(bm.searchAll('banana')).toEqual([1, 3, 5])
    })

    it('skips past matched region (non-overlapping)', () => {
      const bm = new BoyerMoore('aa')
      expect(bm.searchAll('aaaa')).toEqual([0, 2])
    })

    it('handles adjacent non-overlapping matches', () => {
      const bm = new BoyerMoore('ab')
      expect(bm.searchAll('abab')).toEqual([0, 2])
    })

    it('finds matches in longer text', () => {
      const bm = new BoyerMoore('ana')
      expect(bm.searchAll('banana')).toEqual([1])
    })

    it('is case-sensitive by default', () => {
      const bm = new BoyerMoore('a')
      expect(bm.searchAll('AaA')).toEqual([1])
    })

    it('is case-insensitive when configured', () => {
      const bm = new BoyerMoore('a', { caseSensitive: false })
      expect(bm.searchAll('AaA')).toEqual([0, 1, 2])
    })
  })

  // ─── count (instance) ────────────────────────────────────────────────

  describe('count', () => {
    it('counts zero occurrences', () => {
      const bm = new BoyerMoore('xyz')
      expect(bm.count('hello world')).toBe(0)
    })

    it('counts single occurrence', () => {
      const bm = new BoyerMoore('hello')
      expect(bm.count('say hello world')).toBe(1)
    })

    it('counts multiple occurrences', () => {
      const bm = new BoyerMoore('ab')
      expect(bm.count('ababab')).toBe(3)
    })

    it('counts zero for empty text', () => {
      const bm = new BoyerMoore('abc')
      expect(bm.count('')).toBe(0)
    })

    it('counts all positions for empty pattern', () => {
      const bm = new BoyerMoore('')
      expect(bm.count('abc')).toBe(4)
    })

    it('counts 1 for empty pattern in empty text', () => {
      const bm = new BoyerMoore('')
      expect(bm.count('')).toBe(1)
    })

    it('counts repeated characters', () => {
      const bm = new BoyerMoore('a')
      expect(bm.count('aaa')).toBe(3)
    })
  })

  // ─── contains (instance) ─────────────────────────────────────────────

  describe('contains', () => {
    it('returns true when pattern is found', () => {
      const bm = new BoyerMoore('world')
      expect(bm.contains('hello world')).toBe(true)
    })

    it('returns false when pattern is not found', () => {
      const bm = new BoyerMoore('xyz')
      expect(bm.contains('hello world')).toBe(false)
    })

    it('returns true for empty pattern', () => {
      const bm = new BoyerMoore('')
      expect(bm.contains('anything')).toBe(true)
    })

    it('returns false for empty text with non-empty pattern', () => {
      const bm = new BoyerMoore('abc')
      expect(bm.contains('')).toBe(false)
    })

    it('returns true for exact match', () => {
      const bm = new BoyerMoore('exact')
      expect(bm.contains('exact')).toBe(true)
    })
  })

  // ─── getPattern / setPattern ─────────────────────────────────────────

  describe('getPattern and setPattern', () => {
    it('getPattern returns the original pattern', () => {
      const bm = new BoyerMoore('Hello')
      expect(bm.getPattern()).toBe('Hello')
    })

    it('getPattern preserves original casing even in case-insensitive mode', () => {
      const bm = new BoyerMoore('HeLLo', { caseSensitive: false })
      expect(bm.getPattern()).toBe('HeLLo')
    })

    it('setPattern updates the pattern', () => {
      const bm = new BoyerMoore('hello')
      bm.setPattern('world')
      expect(bm.getPattern()).toBe('world')
    })

    it('setPattern rebuilds tables correctly', () => {
      const bm = new BoyerMoore('hello')
      expect(bm.search('hello world')).toBe(0)
      bm.setPattern('world')
      expect(bm.search('hello world')).toBe(6)
      expect(bm.search('hello there')).toBe(-1)
    })

    it('setPattern with empty string works', () => {
      const bm = new BoyerMoore('abc')
      bm.setPattern('')
      expect(bm.getPattern()).toBe('')
      expect(bm.search('anything')).toBe(0)
    })

    it('setPattern respects case sensitivity from constructor', () => {
      const bm = new BoyerMoore('A', { caseSensitive: false })
      bm.setPattern('B')
      expect(bm.search('bbb')).toBe(0)
    })

    it('setPattern multiple times works', () => {
      const bm = new BoyerMoore('a')
      expect(bm.search('abc')).toBe(0)
      bm.setPattern('b')
      expect(bm.search('abc')).toBe(1)
      bm.setPattern('c')
      expect(bm.search('abc')).toBe(2)
    })
  })

  // ─── static methods ──────────────────────────────────────────────────

  describe('static search', () => {
    it('finds pattern in text', () => {
      expect(BoyerMoore.search('hello world', 'world')).toBe(6)
    })

    it('returns -1 when not found', () => {
      expect(BoyerMoore.search('hello world', 'xyz')).toBe(-1)
    })

    it('returns 0 for empty pattern', () => {
      expect(BoyerMoore.search('anything', '')).toBe(0)
    })

    it('finds pattern at start', () => {
      expect(BoyerMoore.search('hello world', 'hello')).toBe(0)
    })
  })

  describe('static searchAll', () => {
    it('finds all occurrences', () => {
      expect(BoyerMoore.searchAll('ababab', 'ab')).toEqual([0, 2, 4])
    })

    it('returns empty when not found', () => {
      expect(BoyerMoore.searchAll('hello', 'xyz')).toEqual([])
    })

    it('returns all positions for empty pattern', () => {
      expect(BoyerMoore.searchAll('ab', '')).toEqual([0, 1, 2])
    })
  })

  describe('static count', () => {
    it('counts occurrences', () => {
      expect(BoyerMoore.count('ababab', 'ab')).toBe(3)
    })

    it('returns 0 when not found', () => {
      expect(BoyerMoore.count('hello', 'xyz')).toBe(0)
    })

    it('counts single occurrence', () => {
      expect(BoyerMoore.count('hello world', 'world')).toBe(1)
    })
  })

  describe('static contains', () => {
    it('returns true when found', () => {
      expect(BoyerMoore.contains('hello world', 'world')).toBe(true)
    })

    it('returns false when not found', () => {
      expect(BoyerMoore.contains('hello world', 'xyz')).toBe(false)
    })

    it('returns true for empty pattern', () => {
      expect(BoyerMoore.contains('anything', '')).toBe(true)
    })
  })

  // ─── exports ──────────────────────────────────────────────────────────

  describe('exports', () => {
    it('exports BoyerMooreOptions type', () => {
      const opts: BoyerMooreOptions = { caseSensitive: true }
      expect(opts.caseSensitive).toBe(true)
    })

    it('exports DEFAULT_BOYER_MOORE_OPTIONS', () => {
      expect(DEFAULT_BOYER_MOORE_OPTIONS.caseSensitive).toBe(true)
    })
  })

  // ─── Edge Cases ───────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles pattern with all same characters', () => {
      const bm = new BoyerMoore('aaaa')
      expect(bm.search('baaaa')).toBe(1)
      expect(bm.searchAll('aaaaaa')).toEqual([0])
    })

    it('handles text with all same characters', () => {
      const bm = new BoyerMoore('b')
      expect(bm.search('aaaaa')).toBe(-1)
      expect(bm.searchAll('aaaaa')).toEqual([])
    })

    it('handles pattern longer than any reasonable text', () => {
      const bm = new BoyerMoore('a very long pattern that will not match')
      expect(bm.search('short')).toBe(-1)
    })

    it('handles whitespace-only pattern', () => {
      const bm = new BoyerMoore('   ')
      expect(bm.search('a   b')).toBe(1)
    })

    it('handles pattern with mixed special characters', () => {
      const bm = new BoyerMoore('$100.00')
      expect(bm.search('price is $100.00 today')).toBe(9)
    })

    it('handles carriage return characters', () => {
      const bm = new BoyerMoore('\r\n')
      expect(bm.search('line1\r\nline2')).toBe(5)
    })

    it('handles null byte characters', () => {
      const bm = new BoyerMoore('\0')
      expect(bm.search('before\0after')).toBe(6)
    })

    it('handles repeated setPattern calls', () => {
      const bm = new BoyerMoore('a')
      for (let i = 0; i < 10; i++) {
        bm.setPattern(String(i))
        expect(bm.getPattern()).toBe(String(i))
      }
    })

    it('handles searching same text with different patterns', () => {
      const text = 'the quick brown fox'
      expect(new BoyerMoore('quick').search(text)).toBe(4)
      expect(new BoyerMoore('brown').search(text)).toBe(10)
      expect(new BoyerMoore('fox').search(text)).toBe(16)
      expect(new BoyerMoore('lazy').search(text)).toBe(-1)
    })

    it('handles unicode combining characters', () => {
      const bm = new BoyerMoore('é')
      expect(bm.search('café')).toBe(3)
    })

    it('handles very long text', () => {
      const text = 'ab'.repeat(5000) + 'XYZ'
      const bm = new BoyerMoore('XYZ')
      expect(bm.search(text)).toBe(10000)
    })

    it('handles pattern that is suffix of another pattern', () => {
      const bm = new BoyerMoore('abc')
      expect(bm.search('xabcabc')).toBe(1)
      expect(bm.searchAll('xabcabc')).toEqual([1, 4])
    })

    it('handles case-insensitive searchAll', () => {
      const bm = new BoyerMoore('Ab', { caseSensitive: false })
      expect(bm.searchAll('aBAbabAB')).toEqual([0, 2, 4, 6])
    })

    it('searchAll does not overlap matches', () => {
      const bm = new BoyerMoore('aaa')
      expect(bm.searchAll('aaaaaa')).toEqual([0, 3])
    })

    it('handles single-char text and single-char pattern match', () => {
      const bm = new BoyerMoore('a')
      expect(bm.search('a')).toBe(0)
      expect(bm.searchAll('a')).toEqual([0])
      expect(bm.count('a')).toBe(1)
      expect(bm.contains('a')).toBe(true)
    })

    it('handles single-char text and single-char pattern mismatch', () => {
      const bm = new BoyerMoore('b')
      expect(bm.search('a')).toBe(-1)
      expect(bm.searchAll('a')).toEqual([])
      expect(bm.count('a')).toBe(0)
      expect(bm.contains('a')).toBe(false)
    })

    it('handles two-char pattern with one mismatching', () => {
      const bm = new BoyerMoore('ab')
      expect(bm.search('ac')).toBe(-1)
      expect(bm.search('ab')).toBe(0)
    })
  })
})
