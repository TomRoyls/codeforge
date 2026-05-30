import { describe, expect, it } from 'vitest'
import { TernarySearchTree } from '../../../src/utils/ternary-search-tree.js'

describe('TernarySearchTree', () => {
  it('starts empty', () => {
    const tst = new TernarySearchTree()
    expect(tst.size).toBe(0)
    expect(tst.isEmpty()).toBe(true)
  })

  it('inserts a word', () => {
    const tst = new TernarySearchTree()
    tst.insert('hello')
    expect(tst.contains('hello')).toBe(true)
  })

  it('does not contain non-inserted word', () => {
    const tst = new TernarySearchTree()
    tst.insert('hello')
    expect(tst.contains('world')).toBe(false)
  })

  it('tracks size correctly', () => {
    const tst = new TernarySearchTree()
    tst.insert('a')
    tst.insert('b')
    tst.insert('c')
    expect(tst.size).toBe(3)
  })

  it('does not increment size on duplicate insert', () => {
    const tst = new TernarySearchTree()
    tst.insert('hello')
    tst.insert('hello')
    expect(tst.size).toBe(1)
  })

  it('handles empty string', () => {
    const tst = new TernarySearchTree()
    tst.insert('')
    expect(tst.contains('')).toBe(true)
    expect(tst.size).toBe(1)
  })

  it('does not contain empty string when not inserted', () => {
    const tst = new TernarySearchTree()
    expect(tst.contains('')).toBe(false)
  })

  it('deletes a word', () => {
    const tst = new TernarySearchTree()
    tst.insert('hello')
    expect(tst.delete('hello')).toBe(true)
    expect(tst.contains('hello')).toBe(false)
    expect(tst.size).toBe(0)
  })

  it('delete returns false for non-existing word', () => {
    const tst = new TernarySearchTree()
    expect(tst.delete('missing')).toBe(false)
  })

  it('startsWith returns words with prefix', () => {
    const tst = new TernarySearchTree()
    tst.insert('hello')
    tst.insert('help')
    tst.insert('helium')
    const results = tst.startsWith('hel')
    expect(results).toContain('hello')
    expect(results).toContain('help')
    expect(results).toContain('helium')
  })

  it('startsWith returns exact match and extensions', () => {
    const tst = new TernarySearchTree()
    tst.insert('he')
    tst.insert('hello')
    const results = tst.startsWith('he')
    expect(results).toContain('he')
    expect(results).toContain('hello')
  })

  it('startsWith returns empty for non-matching prefix', () => {
    const tst = new TernarySearchTree()
    tst.insert('hello')
    expect(tst.startsWith('xyz')).toEqual([])
  })

  it('startsWith with empty prefix returns all words', () => {
    const tst = new TernarySearchTree()
    tst.insert('a')
    tst.insert('b')
    tst.insert('c')
    const results = tst.startsWith('')
    expect(results.length).toBe(3)
  })

  it('clears all entries', () => {
    const tst = new TernarySearchTree()
    tst.insert('a')
    tst.insert('b')
    tst.clear()
    expect(tst.size).toBe(0)
    expect(tst.isEmpty()).toBe(true)
    expect(tst.contains('a')).toBe(false)
  })

  it('toList returns all words', () => {
    const tst = new TernarySearchTree()
    tst.insert('cat')
    tst.insert('car')
    tst.insert('dog')
    const list = tst.toList()
    expect(list.sort()).toEqual(['car', 'cat', 'dog'])
  })

  it('handles case sensitivity', () => {
    const tst = new TernarySearchTree()
    tst.insert('Hello')
    expect(tst.contains('Hello')).toBe(true)
    expect(tst.contains('hello')).toBe(false)
  })

  it('handles single character words', () => {
    const tst = new TernarySearchTree()
    tst.insert('a')
    tst.insert('b')
    expect(tst.contains('a')).toBe(true)
    expect(tst.contains('b')).toBe(true)
    expect(tst.contains('c')).toBe(false)
  })

  it('handles words with common prefixes', () => {
    const tst = new TernarySearchTree()
    tst.insert('application')
    tst.insert('apple')
    tst.insert('apply')
    tst.insert('app')
    expect(tst.contains('app')).toBe(true)
    expect(tst.contains('apple')).toBe(true)
    expect(tst.contains('application')).toBe(true)
    expect(tst.contains('apply')).toBe(true)
    expect(tst.startsWith('app').length).toBe(4)
  })

  it('handles many words', () => {
    const tst = new TernarySearchTree()
    const words = Array.from({ length: 100 }, (_, i) => `word${i}`)
    for (const w of words) tst.insert(w)
    expect(tst.size).toBe(100)
    for (const w of words) {
      expect(tst.contains(w)).toBe(true)
    }
  })

  it('delete and re-insert works', () => {
    const tst = new TernarySearchTree()
    tst.insert('test')
    tst.delete('test')
    expect(tst.contains('test')).toBe(false)
    tst.insert('test')
    expect(tst.contains('test')).toBe(true)
    expect(tst.size).toBe(1)
  })

  it('delete empty string', () => {
    const tst = new TernarySearchTree()
    tst.insert('')
    expect(tst.delete('')).toBe(true)
    expect(tst.contains('')).toBe(false)
  })

  it('handles reverse alphabetically ordered inserts', () => {
    const tst = new TernarySearchTree()
    tst.insert('zzz')
    tst.insert('yyy')
    tst.insert('xxx')
    expect(tst.contains('zzz')).toBe(true)
    expect(tst.contains('yyy')).toBe(true)
    expect(tst.contains('xxx')).toBe(true)
  })

  it('startsWith returns only matching words', () => {
    const tst = new TernarySearchTree()
    tst.insert('cat')
    tst.insert('car')
    tst.insert('dog')
    const results = tst.startsWith('ca')
    expect(results.length).toBe(2)
    expect(results).toContain('cat')
    expect(results).toContain('car')
  })

  it('handles unicode characters', () => {
    const tst = new TernarySearchTree()
    tst.insert('café')
    tst.insert('naïve')
    expect(tst.contains('café')).toBe(true)
    expect(tst.contains('naïve')).toBe(true)
  })
})
