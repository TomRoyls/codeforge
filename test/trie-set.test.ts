import { describe, it, expect } from 'vitest'
import { TrieSet } from '../src/core/trie-set/index.js'

// ─── Construction and Basic Operations ───

describe('TrieSet: construction and basic operations', () => {
  it('creates an empty trie', () => {
    const trie = new TrieSet()
    expect(trie.size).toBe(0)
    expect(trie.isEmpty).toBe(true)
  })

  it('adds a word and reports correct size', () => {
    const trie = new TrieSet()
    expect(trie.add('hello')).toBe(true)
    expect(trie.size).toBe(1)
    expect(trie.isEmpty).toBe(false)
  })

  it('add returns false for duplicate words', () => {
    const trie = new TrieSet()
    trie.add('hello')
    expect(trie.add('hello')).toBe(false)
    expect(trie.size).toBe(1)
  })

  it('has returns true for existing words', () => {
    const trie = new TrieSet()
    trie.add('hello')
    trie.add('world')
    expect(trie.has('hello')).toBe(true)
    expect(trie.has('world')).toBe(true)
  })

  it('has returns false for missing words', () => {
    const trie = new TrieSet()
    trie.add('hello')
    expect(trie.has('hell')).toBe(false)
    expect(trie.has('helloo')).toBe(false)
    expect(trie.has('')).toBe(false)
  })

  it('has returns false for empty string', () => {
    const trie = new TrieSet()
    expect(trie.has('')).toBe(false)
    trie.add('')
    expect(trie.has('')).toBe(true)
  })
})

// ─── Deletion ───

describe('TrieSet: deletion', () => {
  it('deletes an existing word', () => {
    const trie = new TrieSet()
    trie.add('hello')
    expect(trie.delete('hello')).toBe(true)
    expect(trie.has('hello')).toBe(false)
    expect(trie.size).toBe(0)
  })

  it('returns false for deleting missing word', () => {
    const trie = new TrieSet()
    expect(trie.delete('hello')).toBe(false)
  })

  it('does not affect other words on deletion', () => {
    const trie = new TrieSet()
    trie.add('hello')
    trie.add('help')
    trie.delete('help')
    expect(trie.has('hello')).toBe(true)
    expect(trie.has('help')).toBe(false)
  })

  it('cleans up unused nodes after deletion', () => {
    const trie = new TrieSet()
    trie.add('abc')
    trie.add('ab')
    trie.delete('abc')
    expect(trie.has('ab')).toBe(true)
    expect(trie.startsWith('ab')).toBe(true)
  })
})

// ─── Prefix Operations ───

describe('TrieSet: prefix operations', () => {
  const trie = new TrieSet()
  trie.add('hello')
  trie.add('help')
  trie.add('world')

  it('startsWith returns true for existing prefix', () => {
    expect(trie.startsWith('hel')).toBe(true)
    expect(trie.startsWith('wor')).toBe(true)
  })

  it('startsWith returns false for non-existing prefix', () => {
    expect(trie.startsWith('xyz')).toBe(false)
  })

  it('startsWith returns false for empty trie', () => {
    const empty = new TrieSet()
    expect(empty.startsWith('a')).toBe(false)
  })

  it('containsPrefix is alias for startsWith', () => {
    expect(trie.containsPrefix('hel')).toBe(true)
    expect(trie.containsPrefix('xyz')).toBe(false)
  })

  it('wordsWithPrefix returns all words with given prefix', () => {
    const result = trie.wordsWithPrefix('hel')
    expect(result).toEqual(expect.arrayContaining(['hello', 'help']))
    expect(result).toHaveLength(2)
  })

  it('wordsWithPrefix returns empty for non-existing prefix', () => {
    expect(trie.wordsWithPrefix('xyz')).toEqual([])
  })

  it('countWordsWithPrefix returns count', () => {
    expect(trie.countWordsWithPrefix('hel')).toBe(2)
    expect(trie.countWordsWithPrefix('wor')).toBe(1)
    expect(trie.countWordsWithPrefix('xyz')).toBe(0)
  })

  it('forEachPrefix iterates over prefixed words', () => {
    const collected: string[] = []
    trie.forEachPrefix('hel', word => collected.push(word))
    expect(collected).toEqual(expect.arrayContaining(['hello', 'help']))
  })
})

// ─── Autocomplete ───

describe('TrieSet: autocomplete', () => {
  const trie = new TrieSet()
  trie.add('apple')
  trie.add('application')
  trie.add('apply')
  trie.add('banana')

  it('returns all matching words', () => {
    const results = trie.autocomplete('app')
    expect(results).toEqual(expect.arrayContaining(['apple', 'application', 'apply']))
  })

  it('respects limit parameter', () => {
    const results = trie.autocomplete('app', 2)
    expect(results.length).toBeLessThanOrEqual(2)
  })

  it('returns empty for no matches', () => {
    expect(trie.autocomplete('xyz')).toEqual([])
  })
})

// ─── Longest Prefix Operations ───

describe('TrieSet: longest prefix operations', () => {
  it('longestCommonPrefix returns common prefix', () => {
    const trie = new TrieSet()
    trie.add('apple')
    trie.add('application')
    trie.add('apply')
    expect(trie.longestCommonPrefix()).toBe('appl')
  })

  it('longestCommonPrefix returns empty for empty trie', () => {
    const trie = new TrieSet()
    expect(trie.longestCommonPrefix()).toBe('')
  })

  it('longestCommonPrefix stops at word boundary', () => {
    const trie = new TrieSet()
    trie.add('a')
    trie.add('ab')
    expect(trie.longestCommonPrefix()).toBe('a')
  })

  it('longestPrefixOf returns longest matching word prefix', () => {
    const trie = new TrieSet()
    trie.add('app')
    trie.add('apple')
    expect(trie.longestPrefixOf('application')).toBe('app')
  })

  it('longestPrefixOf returns empty when no match', () => {
    const trie = new TrieSet()
    trie.add('hello')
    expect(trie.longestPrefixOf('world')).toBe('')
  })
})

// ─── RemovePrefix ───

describe('TrieSet: removePrefix', () => {
  it('removes all words with given prefix', () => {
    const trie = new TrieSet()
    trie.add('apple')
    trie.add('application')
    trie.add('banana')
    const removed = trie.removePrefix('app')
    expect(removed).toBe(2)
    expect(trie.has('banana')).toBe(true)
    expect(trie.has('apple')).toBe(false)
    expect(trie.size).toBe(1)
  })

  it('returns 0 for non-existing prefix', () => {
    const trie = new TrieSet()
    trie.add('hello')
    expect(trie.removePrefix('xyz')).toBe(0)
  })
})

// ─── Iteration and Conversion ───

describe('TrieSet: iteration and conversion', () => {
  it('toArray returns all words', () => {
    const trie = new TrieSet()
    trie.add('banana')
    trie.add('apple')
    trie.add('cherry')
    const arr = trie.toArray()
    expect(arr).toEqual(expect.arrayContaining(['apple', 'banana', 'cherry']))
    expect(arr).toHaveLength(3)
  })

  it('forEach iterates all words', () => {
    const trie = new TrieSet()
    trie.add('a')
    trie.add('b')
    const collected: string[] = []
    trie.forEach(w => collected.push(w))
    expect(collected).toEqual(expect.arrayContaining(['a', 'b']))
  })

  it('is iterable with for-of', () => {
    const trie = new TrieSet()
    trie.add('x')
    trie.add('y')
    const collected: string[] = []
    for (const w of trie) collected.push(w)
    expect(collected).toEqual(expect.arrayContaining(['x', 'y']))
  })

  it('words generator yields all words', () => {
    const trie = new TrieSet()
    trie.add('hello')
    trie.add('world')
    const collected: string[] = []
    for (const w of trie.words()) collected.push(w)
    expect(collected).toEqual(expect.arrayContaining(['hello', 'world']))
  })
})

// ─── Clone and Static Methods ───

describe('TrieSet: clone and static methods', () => {
  it('clone creates independent copy', () => {
    const trie = new TrieSet()
    trie.add('hello')
    const cloned = trie.clone()
    trie.add('world')
    expect(cloned.has('world')).toBe(false)
    expect(cloned.size).toBe(1)
  })

  it('fromArray creates trie from array', () => {
    const trie = TrieSet.fromArray(['apple', 'banana', 'cherry'])
    expect(trie.size).toBe(3)
    expect(trie.has('banana')).toBe(true)
  })

  it('fromArray deduplicates', () => {
    const trie = TrieSet.fromArray(['a', 'a', 'b'])
    expect(trie.size).toBe(2)
  })
})

// ─── Clear ───

describe('TrieSet: clear', () => {
  it('clear empties the trie', () => {
    const trie = new TrieSet()
    trie.add('hello')
    trie.add('world')
    trie.clear()
    expect(trie.size).toBe(0)
    expect(trie.isEmpty).toBe(true)
    expect(trie.has('hello')).toBe(false)
  })
})

// ─── SizeBytes ───

describe('TrieSet: sizeBytes', () => {
  it('sizeBytes returns positive number', () => {
    const trie = new TrieSet()
    trie.add('hello')
    expect(trie.sizeBytes).toBeGreaterThan(0)
  })

  it('empty trie has base size', () => {
    const trie = new TrieSet()
    expect(trie.sizeBytes).toBeGreaterThan(0)
  })
})
