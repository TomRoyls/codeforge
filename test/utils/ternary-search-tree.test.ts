import { describe, expect, it } from 'vitest'
import { TernarySearchTree } from '../../src/utils/ternary-search-tree.js'

// ─── Basics ───

describe('TernarySearchTree basics', () => {
  it('starts empty', () => {
    const tst = new TernarySearchTree()
    expect(tst.size).toBe(0)
    expect(tst.isEmpty()).toBe(true)
  })

  it('inserts a word', () => {
    const tst = new TernarySearchTree()
    tst.insert('hello')
    expect(tst.size).toBe(1)
    expect(tst.contains('hello')).toBe(true)
  })

  it('inserts multiple words', () => {
    const tst = new TernarySearchTree()
    tst.insert('apple')
    tst.insert('banana')
    tst.insert('cherry')
    expect(tst.size).toBe(3)
    expect(tst.contains('apple')).toBe(true)
    expect(tst.contains('banana')).toBe(true)
    expect(tst.contains('cherry')).toBe(true)
  })

  it('does not duplicate inserts', () => {
    const tst = new TernarySearchTree()
    tst.insert('hello')
    tst.insert('hello')
    expect(tst.size).toBe(1)
  })

  it('returns false for missing word', () => {
    const tst = new TernarySearchTree()
    expect(tst.contains('missing')).toBe(false)
  })
})

// ─── StartsWith ───

describe('TernarySearchTree startsWith', () => {
  it('returns words with given prefix', () => {
    const tst = new TernarySearchTree()
    tst.insert('apple')
    tst.insert('application')
    tst.insert('apply')
    tst.insert('banana')
    const result = tst.startsWith('app')
    expect(result.sort()).toEqual(['apple', 'application', 'apply'])
  })

  it('returns empty for no matches', () => {
    const tst = new TernarySearchTree()
    tst.insert('hello')
    expect(tst.startsWith('xyz')).toEqual([])
  })

  it('empty prefix returns all words', () => {
    const tst = new TernarySearchTree()
    tst.insert('a')
    tst.insert('b')
    const result = tst.startsWith('')
    expect(result.sort()).toEqual(['a', 'b'])
  })
})

// ─── Delete ───

describe('TernarySearchTree delete', () => {
  it('deletes a word', () => {
    const tst = new TernarySearchTree()
    tst.insert('hello')
    expect(tst.delete('hello')).toBe(true)
    expect(tst.size).toBe(0)
    expect(tst.contains('hello')).toBe(false)
  })

  it('returns false for missing word', () => {
    const tst = new TernarySearchTree()
    expect(tst.delete('missing')).toBe(false)
  })

  it('only deletes specified word', () => {
    const tst = new TernarySearchTree()
    tst.insert('apple')
    tst.insert('application')
    tst.delete('apple')
    expect(tst.contains('apple')).toBe(false)
    expect(tst.contains('application')).toBe(true)
  })
})

// ─── Empty String ───

describe('TernarySearchTree empty string', () => {
  it('handles empty string insert', () => {
    const tst = new TernarySearchTree()
    tst.insert('')
    expect(tst.contains('')).toBe(true)
    expect(tst.size).toBe(1)
  })

  it('deletes empty string', () => {
    const tst = new TernarySearchTree()
    tst.insert('')
    expect(tst.delete('')).toBe(true)
    expect(tst.contains('')).toBe(false)
  })
})

// ─── ToList ───

describe('TernarySearchTree toList', () => {
  it('returns all inserted words', () => {
    const tst = new TernarySearchTree()
    tst.insert('cherry')
    tst.insert('apple')
    tst.insert('banana')
    const list = tst.toList().sort()
    expect(list).toEqual(['apple', 'banana', 'cherry'])
  })

  it('returns empty for empty tree', () => {
    const tst = new TernarySearchTree()
    expect(tst.toList()).toEqual([])
  })
})

// ─── Clear ───

describe('TernarySearchTree clear', () => {
  it('clears the tree', () => {
    const tst = new TernarySearchTree()
    tst.insert('a')
    tst.insert('b')
     tst.clear()
     expect(tst.size).toBe(0)
     expect(tst.isEmpty()).toBe(true)
     expect(tst.toList()).toEqual([])
   })

   it('insert and contains basic', () => {
     const tst = new TernarySearchTree<string>()
     tst.insert('cat')
     expect(tst.contains('cat')).toBe(true)
     expect(tst.contains('dog')).toBe(false)
  })

  it('empty tree contains nothing', () => {
    const tst = new TernarySearchTree<number>()
    expect(tst.contains('anything')).toBe(false)
  })

  it('insert and contains work', () => {
    const tst = new TernarySearchTree<number>()
    tst.insert('key')
    expect(tst.contains('key')).toBe(true)
    expect(tst.contains('notkey')).toBe(false)
  })
})
