import { describe, it, expect } from 'vitest'
import { SuffixTree } from '../../src/core/suffix-tree/suffix-tree.js'
import { DEFAULT_SUFFIXTREE_OPTIONS } from '../../src/core/suffix-tree/types.js'
import type { SuffixTreeNode, SuffixTreeOptions } from '../../src/core/suffix-tree/types.js'

describe('SuffixTree', () => {
  describe('constructor', () => {
    it('should create a suffix tree with default options', () => {
      const tree = new SuffixTree('abc')
      expect(tree.getNodeCount()).toBeGreaterThan(0)
    })

    it('should create a suffix tree for empty string', () => {
      const tree = new SuffixTree('')
      expect(tree.getNodeCount()).toBeGreaterThan(0)
    })

    it('should create a suffix tree for single character', () => {
      const tree = new SuffixTree('a')
      expect(tree.getNodeCount()).toBeGreaterThan(0)
    })

    it('should accept custom terminator', () => {
      const tree = new SuffixTree('abc', { terminator: '#' })
      expect(tree.search('abc')).toBe(true)
      expect(tree.search('ab')).toBe(true)
      expect(tree.search('xyz')).toBe(false)
    })

    it('should use default terminator $', () => {
      expect(DEFAULT_SUFFIXTREE_OPTIONS.terminator).toBe('$')
    })

    it('should create a tree for repeated characters', () => {
      const tree = new SuffixTree('aaaa')
      expect(tree.getNodeCount()).toBeGreaterThan(0)
    })

    it('should create a tree with all same characters', () => {
      const tree = new SuffixTree('aaa')
      expect(tree.search('a')).toBe(true)
      expect(tree.search('aa')).toBe(true)
      expect(tree.search('aaa')).toBe(true)
    })

    it('should handle long strings', () => {
      const text = 'abcdefghijklmnopqrstuvwxyz'
      const tree = new SuffixTree(text)
      expect(tree.search(text)).toBe(true)
    })
  })

  describe('search', () => {
    it('should find existing substring', () => {
      const tree = new SuffixTree('banana')
      expect(tree.search('banana')).toBe(true)
      expect(tree.search('banana')).toBe(true)
    })

    it('should find single character', () => {
      const tree = new SuffixTree('banana')
      expect(tree.search('b')).toBe(true)
      expect(tree.search('a')).toBe(true)
      expect(tree.search('n')).toBe(true)
    })

    it('should not find missing substring', () => {
      const tree = new SuffixTree('banana')
      expect(tree.search('xyz')).toBe(false)
    })

    it('should not find missing single character', () => {
      const tree = new SuffixTree('banana')
      expect(tree.search('z')).toBe(false)
    })

    it('should find prefix', () => {
      const tree = new SuffixTree('banana')
      expect(tree.search('ban')).toBe(true)
      expect(tree.search('bana')).toBe(true)
    })

    it('should find suffix', () => {
      const tree = new SuffixTree('banana')
      expect(tree.search('nana')).toBe(true)
      expect(tree.search('ana')).toBe(true)
    })

    it('should find middle substring', () => {
      const tree = new SuffixTree('banana')
      expect(tree.search('nan')).toBe(true)
      expect(tree.search('an')).toBe(true)
    })

    it('should return false for empty pattern', () => {
      const tree = new SuffixTree('banana')
      expect(tree.search('')).toBe(false)
    })

    it('should find full string', () => {
      const tree = new SuffixTree('hello')
      expect(tree.search('hello')).toBe(true)
    })

    it('should not find pattern longer than text', () => {
      const tree = new SuffixTree('abc')
      expect(tree.search('abcd')).toBe(false)
    })

    it('should handle single character string', () => {
      const tree = new SuffixTree('x')
      expect(tree.search('x')).toBe(true)
      expect(tree.search('y')).toBe(false)
    })
  })

  describe('findAll', () => {
    it('should find all occurrences of single character', () => {
      const tree = new SuffixTree('banana')
      expect(tree.findAll('a')).toEqual([1, 3, 5])
      expect(tree.findAll('n')).toEqual([2, 4])
      expect(tree.findAll('b')).toEqual([0])
    })

    it('should find all occurrences of substring', () => {
      const tree = new SuffixTree('banana')
      expect(tree.findAll('ana')).toEqual([1, 3])
      expect(tree.findAll('an')).toEqual([1, 3])
    })

    it('should find single occurrence', () => {
      const tree = new SuffixTree('banana')
      expect(tree.findAll('ban')).toEqual([0])
      expect(tree.findAll('banana')).toEqual([0])
    })

    it('should return empty array for missing pattern', () => {
      const tree = new SuffixTree('banana')
      expect(tree.findAll('xyz')).toEqual([])
    })

    it('should return empty array for empty pattern', () => {
      const tree = new SuffixTree('banana')
      expect(tree.findAll('')).toEqual([])
    })

    it('should find all occurrences in repeated string', () => {
      const tree = new SuffixTree('aaaa')
      expect(tree.findAll('a')).toEqual([0, 1, 2, 3])
      expect(tree.findAll('aa')).toEqual([0, 1, 2])
      expect(tree.findAll('aaa')).toEqual([0, 1])
      expect(tree.findAll('aaaa')).toEqual([0])
    })

    it('should find all occurrences with no repeats', () => {
      const tree = new SuffixTree('abcdef')
      expect(tree.findAll('a')).toEqual([0])
      expect(tree.findAll('f')).toEqual([5])
      expect(tree.findAll('abc')).toEqual([0])
      expect(tree.findAll('def')).toEqual([3])
    })

    it('should return sorted positions', () => {
      const tree = new SuffixTree('ababab')
      const positions = tree.findAll('ab')
      expect(positions).toEqual([0, 2, 4])
    })

    it('should find overlapping occurrences', () => {
      const tree = new SuffixTree('aaa')
      expect(tree.findAll('aa')).toEqual([0, 1])
    })

    it('should handle single character text', () => {
      const tree = new SuffixTree('a')
      expect(tree.findAll('a')).toEqual([0])
    })

    it('should handle pattern equal to text', () => {
      const tree = new SuffixTree('abc')
      expect(tree.findAll('abc')).toEqual([0])
    })
  })

  describe('countOccurrences', () => {
    it('should count single character occurrences', () => {
      const tree = new SuffixTree('banana')
      expect(tree.countOccurrences('a')).toBe(3)
      expect(tree.countOccurrences('n')).toBe(2)
      expect(tree.countOccurrences('b')).toBe(1)
    })

    it('should count substring occurrences', () => {
      const tree = new SuffixTree('banana')
      expect(tree.countOccurrences('ana')).toBe(2)
      expect(tree.countOccurrences('ban')).toBe(1)
    })

    it('should return 0 for missing pattern', () => {
      const tree = new SuffixTree('banana')
      expect(tree.countOccurrences('xyz')).toBe(0)
    })

    it('should return 0 for empty pattern', () => {
      const tree = new SuffixTree('banana')
      expect(tree.countOccurrences('')).toBe(0)
    })

    it('should count in repeated strings', () => {
      const tree = new SuffixTree('aaaa')
      expect(tree.countOccurrences('a')).toBe(4)
      expect(tree.countOccurrences('aa')).toBe(3)
      expect(tree.countOccurrences('aaa')).toBe(2)
      expect(tree.countOccurrences('aaaa')).toBe(1)
    })

    it('should count in string with no repeats', () => {
      const tree = new SuffixTree('abcdef')
      expect(tree.countOccurrences('abc')).toBe(1)
      expect(tree.countOccurrences('xyz')).toBe(0)
    })

    it('should count overlapping occurrences', () => {
      const tree = new SuffixTree('aaa')
      expect(tree.countOccurrences('aa')).toBe(2)
    })

    it('should count single occurrence of full text', () => {
      const tree = new SuffixTree('hello')
      expect(tree.countOccurrences('hello')).toBe(1)
    })
  })

  describe('longestRepeat', () => {
    it('should find longest repeated substring', () => {
      const tree = new SuffixTree('banana')
      const result = tree.longestRepeat()
      expect(result.length).toBeGreaterThan(0)
      expect(['ana', 'an', 'na']).toContain(result.length === 3 ? result : '')
    })

    it('should return empty string for unique characters', () => {
      const tree = new SuffixTree('abcdef')
      expect(tree.longestRepeat()).toBe('')
    })

    it('should find repeat in repeated characters', () => {
      const tree = new SuffixTree('aaaa')
      expect(tree.longestRepeat()).toBe('aaa')
    })

    it('should find repeat in string with one repeat', () => {
      const tree = new SuffixTree('abcabc')
      expect(tree.longestRepeat()).toBe('abc')
    })

    it('should return empty for single character', () => {
      const tree = new SuffixTree('a')
      expect(tree.longestRepeat()).toBe('')
    })

    it('should return empty for two different characters', () => {
      const tree = new SuffixTree('ab')
      expect(tree.longestRepeat()).toBe('')
    })

    it('should find repeat in two same characters', () => {
      const tree = new SuffixTree('aa')
      expect(tree.longestRepeat()).toBe('a')
    })

    it('should handle complex repeated patterns', () => {
      const tree = new SuffixTree('mississippi')
      const result = tree.longestRepeat()
      expect(result.length).toBeGreaterThan(0)
      expect(['issi', 'ssi', 'iss', 'si', 'is', 'ss', 'i', 's']).toContain(
        result.length >= 2 ? result : ''
      )
    })
  })

  describe('longestCommonPrefix', () => {
    it('should find longest proper prefix that is also suffix', () => {
      const tree = new SuffixTree('abab')
      expect(tree.longestCommonPrefix()).toBe('ab')
    })

    it('should return empty for unique characters', () => {
      const tree = new SuffixTree('abcdef')
      expect(tree.longestCommonPrefix()).toBe('')
    })

    it('should return empty for single character', () => {
      const tree = new SuffixTree('a')
      expect(tree.longestCommonPrefix()).toBe('')
    })

    it('should handle all same characters', () => {
      const tree = new SuffixTree('aaaa')
      expect(tree.longestCommonPrefix()).toBe('aaa')
    })

    it('should return empty when prefix does not match suffix', () => {
      const tree = new SuffixTree('abcd')
      expect(tree.longestCommonPrefix()).toBe('')
    })

    it('should handle abcabc', () => {
      const tree = new SuffixTree('abcabc')
      expect(tree.longestCommonPrefix()).toBe('abc')
    })

    it('should handle empty string', () => {
      const tree = new SuffixTree('')
      expect(tree.longestCommonPrefix()).toBe('')
    })

    it('should handle two characters no match', () => {
      const tree = new SuffixTree('ab')
      expect(tree.longestCommonPrefix()).toBe('')
    })

    it('should handle two same characters', () => {
      const tree = new SuffixTree('aa')
      expect(tree.longestCommonPrefix()).toBe('a')
    })

    it('should handle partial prefix match', () => {
      const tree = new SuffixTree('abac')
      expect(tree.longestCommonPrefix()).toBe('')
    })
  })

  describe('hasSubstring', () => {
    it('should return true for existing substring', () => {
      const tree = new SuffixTree('banana')
      expect(tree.hasSubstring('ban')).toBe(true)
      expect(tree.hasSubstring('nan')).toBe(true)
      expect(tree.hasSubstring('ana')).toBe(true)
    })

    it('should return false for missing substring', () => {
      const tree = new SuffixTree('banana')
      expect(tree.hasSubstring('xyz')).toBe(false)
      expect(tree.hasSubstring('bananx')).toBe(false)
    })

    it('should return true for full string', () => {
      const tree = new SuffixTree('hello')
      expect(tree.hasSubstring('hello')).toBe(true)
    })

    it('should return false for empty pattern', () => {
      const tree = new SuffixTree('hello')
      expect(tree.hasSubstring('')).toBe(false)
    })

    it('should return true for single character', () => {
      const tree = new SuffixTree('hello')
      expect(tree.hasSubstring('h')).toBe(true)
      expect(tree.hasSubstring('o')).toBe(true)
    })
  })

  describe('isSuffix', () => {
    it('should return true for valid suffixes', () => {
      const tree = new SuffixTree('banana')
      expect(tree.isSuffix('banana')).toBe(true)
      expect(tree.isSuffix('anana')).toBe(true)
      expect(tree.isSuffix('nana')).toBe(true)
      expect(tree.isSuffix('ana')).toBe(true)
      expect(tree.isSuffix('na')).toBe(true)
      expect(tree.isSuffix('a')).toBe(true)
    })

    it('should return false for non-suffixes', () => {
      const tree = new SuffixTree('banana')
      expect(tree.isSuffix('ban')).toBe(false)
      expect(tree.isSuffix('xyz')).toBe(false)
      expect(tree.isSuffix('nan')).toBe(false)
    })

    it('should return true for empty pattern', () => {
      const tree = new SuffixTree('banana')
      expect(tree.isSuffix('')).toBe(true)
    })

    it('should return false for pattern longer than text', () => {
      const tree = new SuffixTree('abc')
      expect(tree.isSuffix('abcd')).toBe(false)
    })

    it('should handle single character', () => {
      const tree = new SuffixTree('a')
      expect(tree.isSuffix('a')).toBe(true)
      expect(tree.isSuffix('b')).toBe(false)
    })

    it('should handle repeated characters', () => {
      const tree = new SuffixTree('aaa')
      expect(tree.isSuffix('a')).toBe(true)
      expect(tree.isSuffix('aa')).toBe(true)
      expect(tree.isSuffix('aaa')).toBe(true)
    })

    it('should handle all suffixes of abc', () => {
      const tree = new SuffixTree('abc')
      expect(tree.isSuffix('abc')).toBe(true)
      expect(tree.isSuffix('bc')).toBe(true)
      expect(tree.isSuffix('c')).toBe(true)
      expect(tree.isSuffix('ab')).toBe(false)
    })

    it('should return false for pattern not matching suffix', () => {
      const tree = new SuffixTree('hello')
      expect(tree.isSuffix('world')).toBe(false)
      expect(tree.isSuffix('hell')).toBe(false)
      expect(tree.isSuffix('ello')).toBe(true)
    })
  })

  describe('toString', () => {
    it('should produce a non-empty string', () => {
      const tree = new SuffixTree('abc')
      const str = tree.toString()
      expect(str.length).toBeGreaterThan(0)
    })

    it('should contain root', () => {
      const tree = new SuffixTree('abc')
      const str = tree.toString()
      expect(str).toContain('root')
    })

    it('should show edge labels', () => {
      const tree = new SuffixTree('ab')
      const str = tree.toString()
      expect(str).toContain('"a')
      expect(str).toContain('"b')
    })

    it('should show leaf indices', () => {
      const tree = new SuffixTree('ab')
      const str = tree.toString()
      expect(str).toContain('@')
    })

    it('should handle empty string', () => {
      const tree = new SuffixTree('')
      const str = tree.toString()
      expect(str).toContain('root')
    })
  })

  describe('getNodeCount', () => {
    it('should return at least 1 for root', () => {
      const tree = new SuffixTree('')
      expect(tree.getNodeCount()).toBeGreaterThanOrEqual(1)
    })

    it('should increase with longer strings', () => {
      const tree1 = new SuffixTree('a')
      const tree2 = new SuffixTree('ab')
      const tree3 = new SuffixTree('abc')
      expect(tree2.getNodeCount()).toBeGreaterThanOrEqual(tree1.getNodeCount())
      expect(tree3.getNodeCount()).toBeGreaterThanOrEqual(tree2.getNodeCount())
    })

    it('should count all nodes in simple tree', () => {
      const tree = new SuffixTree('abc')
      expect(tree.getNodeCount()).toBeGreaterThan(3)
    })

    it('should have more nodes with repeats', () => {
      const tree1 = new SuffixTree('abcdef')
      const tree2 = new SuffixTree('aaaaaa')
      expect(tree2.getNodeCount()).toBeGreaterThan(tree1.getNodeCount())
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_SUFFIXTREE_OPTIONS', () => {
      expect(DEFAULT_SUFFIXTREE_OPTIONS).toBeDefined()
      expect(DEFAULT_SUFFIXTREE_OPTIONS.terminator).toBe('$')
    })

    it('should allow creating nodes with interface shape', () => {
      const node: SuffixTreeNode = {
        children: new Map<string, SuffixTreeNode>(),
        start: 0,
        end: 5,
        suffixLink: null,
        isLeaf: true,
        suffixIndex: 0,
      }
      expect(node.children).toBeInstanceOf(Map)
      expect(node.isLeaf).toBe(true)
    })

    it('should allow creating options with interface shape', () => {
      const options: SuffixTreeOptions = {
        terminator: '#',
      }
      expect(options.terminator).toBe('#')
    })
  })

  describe('edge cases', () => {
    it('should handle palindrome', () => {
      const tree = new SuffixTree('racecar')
      expect(tree.search('racecar')).toBe(true)
      expect(tree.search('ace')).toBe(true)
      expect(tree.search('cec')).toBe(true)
      expect(tree.isSuffix('racecar')).toBe(true)
      expect(tree.isSuffix('car')).toBe(true)
    })

    it('should handle string with all same character', () => {
      const tree = new SuffixTree('zzzzz')
      expect(tree.countOccurrences('z')).toBe(5)
      expect(tree.countOccurrences('zz')).toBe(4)
      expect(tree.countOccurrences('zzz')).toBe(3)
      expect(tree.longestRepeat()).toBe('zzzz')
    })

    it('should handle string with two alternating characters', () => {
      const tree = new SuffixTree('ababab')
      expect(tree.findAll('ab')).toEqual([0, 2, 4])
      expect(tree.findAll('ba')).toEqual([1, 3])
      expect(tree.countOccurrences('aba')).toBe(2)
    })

    it('should handle unicode characters', () => {
      const tree = new SuffixTree('café')
      expect(tree.search('café')).toBe(true)
      expect(tree.search('caf')).toBe(true)
      expect(tree.isSuffix('é')).toBe(true)
    })

    it('should handle string where every character is unique', () => {
      const tree = new SuffixTree('abcdefg')
      for (let i = 0; i < 7; i++) {
        const ch = 'abcdefg'[i]!
        expect(tree.search(ch)).toBe(true)
      }
      expect(tree.longestRepeat()).toBe('')
    })

    it('should correctly identify suffix vs substring', () => {
      const tree = new SuffixTree('foobar')
      expect(tree.isSuffix('bar')).toBe(true)
      expect(tree.isSuffix('foo')).toBe(false)
      expect(tree.hasSubstring('foo')).toBe(true)
      expect(tree.hasSubstring('bar')).toBe(true)
      expect(tree.hasSubstring('oba')).toBe(true)
    })

    it('should handle pattern at various positions', () => {
      const tree = new SuffixTree('abcabcabc')
      expect(tree.findAll('abc')).toEqual([0, 3, 6])
      expect(tree.findAll('bca')).toEqual([1, 4])
      expect(tree.findAll('cab')).toEqual([2, 5])
    })

    it('should handle single repeated character with terminator', () => {
      const tree = new SuffixTree('aa', { terminator: '#' })
      expect(tree.search('a')).toBe(true)
      expect(tree.search('aa')).toBe(true)
      expect(tree.countOccurrences('a')).toBe(2)
      expect(tree.isSuffix('a')).toBe(true)
      expect(tree.isSuffix('aa')).toBe(true)
    })
  })
})
