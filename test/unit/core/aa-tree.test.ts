import { describe, expect, it } from 'vitest'

import { AATree } from '../../../src/core/aa-tree/aa-tree.js'

describe('AATree', () => {
  it('inserts and searches for a value', () => {
    const tree = new AATree<number, string>()
    tree.insert(5, 'five')
    expect(tree.search(5)).toBe('five')
  })

  it('returns undefined for missing key', () => {
    const tree = new AATree<number, string>()
    expect(tree.search(99)).toBeUndefined()
  })

  it('contains returns true for existing key', () => {
    const tree = new AATree<number, string>()
    tree.insert(10, 'ten')
    expect(tree.contains(10)).toBe(true)
  })

  it('contains returns false for missing key', () => {
    const tree = new AATree<number, string>()
    expect(tree.contains(10)).toBe(false)
  })

  it('updates existing key', () => {
    const tree = new AATree<number, string>()
    tree.insert(5, 'old')
    tree.insert(5, 'new')
    expect(tree.search(5)).toBe('new')
    expect(tree.size()).toBe(1)
  })

  it('deletes a key', () => {
    const tree = new AATree<number, string>()
    tree.insert(5, 'five')
    expect(tree.delete(5)).toBe(true)
    expect(tree.search(5)).toBeUndefined()
    expect(tree.size()).toBe(0)
  })

  it('delete returns false for missing key', () => {
    const tree = new AATree<number, string>()
    expect(tree.delete(99)).toBe(false)
  })

  it('min returns smallest key-value pair', () => {
    const tree = new AATree<number, string>()
    tree.insert(10, 'ten')
    tree.insert(5, 'five')
    tree.insert(15, 'fifteen')
    expect(tree.min()).toEqual([5, 'five'])
  })

  it('min returns undefined for empty tree', () => {
    const tree = new AATree<number, string>()
    expect(tree.min()).toBeUndefined()
  })

  it('max returns largest key-value pair', () => {
    const tree = new AATree<number, string>()
    tree.insert(10, 'ten')
    tree.insert(5, 'five')
    tree.insert(15, 'fifteen')
    expect(tree.max()).toEqual([15, 'fifteen'])
  })

  it('max returns undefined for empty tree', () => {
    const tree = new AATree<number, string>()
    expect(tree.max()).toBeUndefined()
  })

  it('successor returns next larger key', () => {
    const tree = new AATree<number, string>()
    tree.insert(5, 'a')
    tree.insert(10, 'b')
    tree.insert(15, 'c')
    expect(tree.successor(5)).toEqual([10, 'b'])
  })

  it('successor returns undefined for largest key', () => {
    const tree = new AATree<number, string>()
    tree.insert(5, 'a')
    expect(tree.successor(5)).toBeUndefined()
  })

  it('predecessor returns next smaller key', () => {
    const tree = new AATree<number, string>()
    tree.insert(5, 'a')
    tree.insert(10, 'b')
    tree.insert(15, 'c')
    expect(tree.predecessor(15)).toEqual([10, 'b'])
  })

  it('range returns entries in range', () => {
    const tree = new AATree<number, string>()
    for (let i = 1; i <= 10; i++) {
      tree.insert(i, `v${i}`)
    }
    const range = tree.range(3, 7)
    expect(range).toHaveLength(5)
    expect(range[0]![0]).toBe(3)
    expect(range[4]![0]).toBe(7)
  })

  it('range returns empty for inverted bounds', () => {
    const tree = new AATree<number, string>()
    tree.insert(1, 'a')
    expect(tree.range(10, 5)).toEqual([])
  })

  it('forEach iterates in order', () => {
    const tree = new AATree<number, string>()
    tree.insert(3, 'c')
    tree.insert(1, 'a')
    tree.insert(2, 'b')
    const entries: Array<[number, string]> = []
    tree.forEach((v, k) => entries.push([k, v]))
    expect(entries).toEqual([
      [1, 'a'],
      [2, 'b'],
      [3, 'c'],
    ])
  })

  it('toArray returns sorted entries', () => {
    const tree = new AATree<number, string>()
    tree.insert(3, 'c')
    tree.insert(1, 'a')
    tree.insert(2, 'b')
    expect(tree.toArray()).toEqual([
      [1, 'a'],
      [2, 'b'],
      [3, 'c'],
    ])
  })

  it('size tracks count', () => {
    const tree = new AATree<number, string>()
    expect(tree.size()).toBe(0)
    tree.insert(1, 'a')
    tree.insert(2, 'b')
    expect(tree.size()).toBe(2)
  })

  it('isEmpty returns correct state', () => {
    const tree = new AATree<number, string>()
    expect(tree.isEmpty()).toBe(true)
    tree.insert(1, 'a')
    expect(tree.isEmpty()).toBe(false)
  })

  it('clear removes all entries', () => {
    const tree = new AATree<number, string>()
    tree.insert(1, 'a')
    tree.insert(2, 'b')
    tree.clear()
    expect(tree.size()).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('clone creates independent copy', () => {
    const tree = new AATree<number, string>()
    tree.insert(1, 'a')
    tree.insert(2, 'b')
    const cloned = tree.clone()
    cloned.insert(3, 'c')
    expect(tree.size()).toBe(2)
    expect(cloned.size()).toBe(3)
  })

  it('from creates tree from entries', () => {
    const tree = AATree.from([
      [3, 'c'],
      [1, 'a'],
      [2, 'b'],
    ] as [number, string][])
    expect(tree.size()).toBe(3)
    expect(tree.search(2)).toBe('b')
  })

  it('validate returns true for valid tree', () => {
    const tree = new AATree<number, string>()
    for (let i = 0; i < 100; i++) {
      tree.insert(i, `v${i}`)
    }
    expect(tree.validate()).toBe(true)
  })

  it('stats returns correct info', () => {
    const tree = new AATree<number, string>()
    tree.insert(1, 'a')
    tree.insert(5, 'b')
    tree.insert(10, 'c')
    const stats = tree.stats()
    expect(stats.nodeCount).toBe(3)
    expect(stats.isBalanced).toBe(true)
    expect(stats.minKey).toBe(1)
    expect(stats.maxKey).toBe(10)
  })

  it('handles sequential insertions', () => {
    const tree = new AATree<number, number>()
    for (let i = 0; i < 50; i++) {
      tree.insert(i, i * 10)
    }
    expect(tree.size()).toBe(50)
    expect(tree.validate()).toBe(true)
    for (let i = 0; i < 50; i++) {
      expect(tree.search(i)).toBe(i * 10)
    }
  })

  it('handles reverse sequential insertions', () => {
    const tree = new AATree<number, number>()
    for (let i = 50; i >= 0; i--) {
      tree.insert(i, i * 10)
    }
    expect(tree.validate()).toBe(true)
    expect(tree.min()![0]).toBe(0)
    expect(tree.max()![0]).toBe(50)
  })

  it('handles deletions and remains balanced', () => {
    const tree = new AATree<number, string>()
    for (let i = 0; i < 20; i++) {
      tree.insert(i, `v${i}`)
    }
    for (let i = 0; i < 10; i++) {
      tree.delete(i)
    }
    expect(tree.size()).toBe(10)
    expect(tree.validate()).toBe(true)
    expect(tree.min()![0]).toBe(10)
  })

  it('supports custom comparator', () => {
    const tree = new AATree<string, number>(
      {},
      (a, b) => a.localeCompare(b),
    )
    tree.insert('banana', 2)
    tree.insert('apple', 1)
    tree.insert('cherry', 3)
    expect(tree.min()).toEqual(['apple', 1])
    expect(tree.max()).toEqual(['cherry', 3])
  })
})
