import { describe, expect, it } from 'vitest'
import { TrieRadix } from '../../src/utils/trie-radix.js'

describe('TrieRadix', () => {
  it('inserts and searches a word', () => {
    const trie = new TrieRadix()
    trie.insert('hello')
    expect(trie.search('hello')).toBe(true)
    expect(trie.search('hell')).toBe(false)
  })

  it('searches for non-existent word', () => {
    const trie = new TrieRadix()
    trie.insert('abc')
    expect(trie.search('abcd')).toBe(false)
    expect(trie.search('ab')).toBe(false)
  })

  it('handles shared prefixes', () => {
    const trie = new TrieRadix()
    trie.insert('car')
    trie.insert('card')
    trie.insert('care')
    expect(trie.search('car')).toBe(true)
    expect(trie.search('card')).toBe(true)
    expect(trie.search('care')).toBe(true)
    expect(trie.search('carb')).toBe(false)
  })

  it('startsWith detects prefixes', () => {
    const trie = new TrieRadix()
    trie.insert('hello')
    expect(trie.startsWith('hel')).toBe(true)
    expect(trie.startsWith('hex')).toBe(false)
  })

  it('startsWith with empty prefix returns true', () => {
    const trie = new TrieRadix()
    trie.insert('abc')
    expect(trie.startsWith('')).toBe(true)
  })

  it('collects all words', () => {
    const trie = new TrieRadix()
    trie.insert('car')
    trie.insert('card')
    trie.insert('care')
    const words = trie.collectWords()
    expect(words.sort()).toEqual(['car', 'card', 'care'].sort())
  })

  it('collects words with prefix', () => {
    const trie = new TrieRadix()
    trie.insert('car')
    trie.insert('card')
    trie.insert('care')
    trie.insert('dog')
    const words = trie.collectWords('car')
    expect(words.sort()).toEqual(['car', 'card', 'care'].sort())
  })

  it('handles empty trie', () => {
    const trie = new TrieRadix()
    expect(trie.search('a')).toBe(false)
    expect(trie.startsWith('a')).toBe(false)
    expect(trie.collectWords()).toEqual([])
  })

  it('handles single character words', () => {
    const trie = new TrieRadix()
    trie.insert('a')
    trie.insert('b')
    expect(trie.search('a')).toBe(true)
    expect(trie.search('b')).toBe(true)
    expect(trie.search('c')).toBe(false)
  })

  it('inserts duplicate word', () => {
    const trie = new TrieRadix()
    trie.insert('abc')
    trie.insert('abc')
    expect(trie.search('abc')).toBe(true)
    expect(trie.collectWords()).toEqual(['abc'])
  })

  it('collects words from empty prefix', () => {
    const trie = new TrieRadix()
    trie.insert('a')
    trie.insert('ab')
    expect(trie.collectWords('').sort()).toEqual(['a', 'ab'].sort())
  })

  it('handles long shared prefix split', () => {
    const trie = new TrieRadix()
    trie.insert('ab')
    trie.insert('abc')
    trie.insert('abd')
    expect(trie.search('ab')).toBe(true)
    expect(trie.search('abc')).toBe(true)
    expect(trie.search('abd')).toBe(true)
    expect(trie.search('abcd')).toBe(false)
  })

  it('collectWords returns empty for missing prefix', () => {
    const trie = new TrieRadix()
    trie.insert('abc')
    expect(trie.collectWords('xyz')).toEqual([])
  })

  it('startsWith checks prefix', () => {
    const trie = new TrieRadix()
    trie.insert('hello')
    expect(trie.startsWith('hel')).toBe(true)
    expect(trie.startsWith('xyz')).toBe(false)
  })

  it('handles empty string insert', () => {
    const trie = new TrieRadix()
    trie.insert('')
    expect(trie.search('')).toBe(true)
    expect(trie.startsWith('')).toBe(true)
  })

  it('collectWords returns all inserted words', () => {
    const trie = new TrieRadix()
    trie.insert('cat')
    trie.insert('car')
    trie.insert('dog')
    const words = trie.collectWords('').sort()
    expect(words).toEqual(['car', 'cat', 'dog'])
  })

  it('search checks word existence', () => {
    const trie = new TrieRadix()
    trie.insert('hello')
    expect(trie.search('hello')).toBe(true)
    expect(trie.search('hell')).toBe(false)
  })

  it('handles empty string', () => {
    const trie = new TrieRadix()
    trie.insert('')
    expect(trie.search('')).toBe(true)
  })

  it('startsWith checks prefix', () => {
    const trie = new TrieRadix()
    trie.insert('hello')
    expect(trie.startsWith('hel')).toBe(true)
    expect(trie.startsWith('xyz')).toBe(false)
  })

  it('search exact match', () => {
    const trie = new TrieRadix()
    trie.insert('hello')
    expect(trie.search('hello')).toBe(true)
    expect(trie.search('hell')).toBe(false)
  })
})
