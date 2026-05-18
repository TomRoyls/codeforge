import { describe, it, expect } from 'vitest'
import { TernarySearchTree, TSTNode } from '../src/utils/ternary-search-tree.js'

describe('TernarySearchTree', () => {
  // ─── insert ───
  it('should insert words and increment size', () => {
    const tst = new TernarySearchTree()
    tst.insert('apple')
    expect(tst.size).toBe(1)
    tst.insert('app')
    expect(tst.size).toBe(2)
    tst.insert('banana')
    expect(tst.size).toBe(3)
  })

  // ─── contains ───
  it('should return true for inserted words', () => {
    const tst = new TernarySearchTree()
    tst.insert('apple')
    tst.insert('app')
    tst.insert('banana')
    expect(tst.contains('apple')).toBe(true)
    expect(tst.contains('app')).toBe(true)
    expect(tst.contains('banana')).toBe(true)
  })

  it('should return false for missing words', () => {
    const tst = new TernarySearchTree()
    tst.insert('apple')
    expect(tst.contains('apricot')).toBe(false)
    expect(tst.contains('app')).toBe(false)
    expect(tst.contains('')).toBe(false)
  })

  // ─── startsWith ───
  it('should return all words with given prefix', () => {
    const tst = new TernarySearchTree()
    tst.insert('apple')
    tst.insert('app')
    tst.insert('application')
    tst.insert('banana')
    const results = tst.startsWith('app')
    expect(results.sort()).toEqual(['app', 'apple', 'application'])
  })

  // ─── startsWith no results ───
  it('should return empty array when no words match prefix', () => {
    const tst = new TernarySearchTree()
    tst.insert('apple')
    expect(tst.startsWith('ban')).toEqual([])
  })

  it('should return all words for empty prefix', () => {
    const tst = new TernarySearchTree()
    tst.insert('cat')
    tst.insert('dog')
    const results = tst.startsWith('')
    expect(results.sort()).toEqual(['cat', 'dog'])
  })

  // ─── delete ───
  it('should delete a word and return true', () => {
    const tst = new TernarySearchTree()
    tst.insert('apple')
    tst.insert('app')
    expect(tst.delete('apple')).toBe(true)
    expect(tst.contains('apple')).toBe(false)
    expect(tst.size).toBe(1)
    expect(tst.contains('app')).toBe(true)
  })

  it('should return false when deleting missing word', () => {
    const tst = new TernarySearchTree()
    tst.insert('apple')
    expect(tst.delete('banana')).toBe(false)
    expect(tst.size).toBe(1)
  })

  // ─── size ───
  it('should report correct size', () => {
    const tst = new TernarySearchTree()
    expect(tst.size).toBe(0)
    tst.insert('a')
    tst.insert('b')
    tst.insert('c')
    expect(tst.size).toBe(3)
    tst.delete('b')
    expect(tst.size).toBe(2)
  })

  // ─── isEmpty ───
  it('should report correct empty state', () => {
    const tst = new TernarySearchTree()
    expect(tst.isEmpty()).toBe(true)
    tst.insert('hello')
    expect(tst.isEmpty()).toBe(false)
    tst.delete('hello')
    expect(tst.isEmpty()).toBe(true)
  })

  // ─── clear ───
  it('should clear the tree', () => {
    const tst = new TernarySearchTree()
    tst.insert('apple')
    tst.insert('banana')
    tst.clear()
    expect(tst.size).toBe(0)
    expect(tst.isEmpty()).toBe(true)
    expect(tst.contains('apple')).toBe(false)
    expect(tst.toList()).toEqual([])
  })

  // ─── toList ───
  it('should return all words in sorted order', () => {
    const tst = new TernarySearchTree()
    tst.insert('cherry')
    tst.insert('apple')
    tst.insert('banana')
    tst.insert('apricot')
    expect(tst.toList()).toEqual(['apple', 'apricot', 'banana', 'cherry'])
  })

  // ─── empty string ───
  it('should handle empty string gracefully', () => {
    const tst = new TernarySearchTree()
    tst.insert('')
    expect(tst.contains('')).toBe(true)
    expect(tst.size).toBe(1)
    tst.insert('hello')
    expect(tst.contains('')).toBe(true)
    expect(tst.startsWith('').sort()).toEqual(['', 'hello'].sort())
  })

  it('should return false for empty string when not inserted', () => {
    const tst = new TernarySearchTree()
    expect(tst.contains('')).toBe(false)
  })

  // ─── duplicate insert ───
  it('should not increase size on duplicate insert', () => {
    const tst = new TernarySearchTree()
    tst.insert('apple')
    tst.insert('apple')
    tst.insert('apple')
    expect(tst.size).toBe(1)
    expect(tst.contains('apple')).toBe(true)
  })

  // ─── prefix search large set ───
  it('should find all matches in a large set', () => {
    const tst = new TernarySearchTree()
    const words = [
      'abandon', 'abdomen', 'abide', 'ability', 'able',
      'about', 'above', 'abroad', 'absence', 'absent',
      'absolute', 'absorb', 'abstract', 'absurd', 'abuse',
      'accelerate', 'accept', 'access', 'accident', 'account',
      'banana', 'band', 'bank', 'bar',
    ]
    for (const w of words) tst.insert(w)

    const abWords = tst.startsWith('ab')
    expect(abWords.length).toBe(15)
    for (const w of words) {
      if (w.startsWith('ab')) {
        expect(abWords).toContain(w)
      }
    }

    const accWords = tst.startsWith('acc')
    expect(accWords.sort()).toEqual(['accelerate', 'accept', 'access', 'accident', 'account'])

    const banWords = tst.startsWith('ban')
    expect(banWords.sort()).toEqual(['banana', 'band', 'bank'])
  })
})
