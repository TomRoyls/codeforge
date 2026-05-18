import { describe, it, expect } from 'vitest'
import { RedBlackTree2 } from '../src/core/red-black-tree-2/index.js'

// ─── Construction and Basic Properties ───

describe('RedBlackTree2: construction and basic properties', () => {
  it('constructs an empty tree', () => {
    const tree = new RedBlackTree2<number>()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('constructs with a custom comparator', () => {
    const tree = new RedBlackTree2<string>((a, b) => b.localeCompare(a))
    tree.insert('a')
    tree.insert('b')
    tree.insert('c')
    expect(tree.toArray()).toEqual(['c', 'b', 'a'])
  })
})

// ─── Insert and Search ───

describe('RedBlackTree2: insert and search', () => {
  it('insert increases size', () => {
    const tree = new RedBlackTree2<number>()
    tree.insert(5)
    tree.insert(3)
    tree.insert(7)
    expect(tree.size).toBe(3)
    expect(tree.isEmpty()).toBe(false)
  })

  it('insert ignores duplicates', () => {
    const tree = new RedBlackTree2<number>()
    tree.insert(5)
    tree.insert(5)
    tree.insert(5)
    expect(tree.size).toBe(1)
  })

  it('search finds existing elements', () => {
    const tree = new RedBlackTree2<number>()
    tree.insert(10)
    tree.insert(20)
    tree.insert(30)
    expect(tree.search(10)).toBe(10)
    expect(tree.search(20)).toBe(20)
    expect(tree.search(30)).toBe(30)
  })

  it('search returns null for missing elements', () => {
    const tree = new RedBlackTree2<number>()
    tree.insert(1)
    expect(tree.search(99)).toBeNull()
  })

  it('contains returns correct boolean', () => {
    const tree = new RedBlackTree2<number>()
    tree.insert(42)
    expect(tree.contains(42)).toBe(true)
    expect(tree.contains(0)).toBe(false)
  })
})

// ─── Min and Max ───

describe('RedBlackTree2: min and max', () => {
  it('min returns smallest element', () => {
    const tree = new RedBlackTree2<number>()
    tree.insert(5)
    tree.insert(3)
    tree.insert(7)
    tree.insert(1)
    expect(tree.min()).toBe(1)
  })

  it('min returns null for empty tree', () => {
    expect(new RedBlackTree2<number>().min()).toBeNull()
  })

  it('max returns largest element', () => {
    const tree = new RedBlackTree2<number>()
    tree.insert(5)
    tree.insert(3)
    tree.insert(7)
    tree.insert(9)
    expect(tree.max()).toBe(9)
  })

  it('max returns null for empty tree', () => {
    expect(new RedBlackTree2<number>().max()).toBeNull()
  })
})

// ─── Delete ───

describe('RedBlackTree2: delete', () => {
  it('delete removes an existing element', () => {
    const tree = new RedBlackTree2<number>()
    tree.insert(1)
    tree.insert(2)
    tree.insert(3)
    expect(tree.delete(2)).toBe(true)
    expect(tree.size).toBe(2)
    expect(tree.search(2)).toBeNull()
  })

  it('delete returns false for non-existing element', () => {
    const tree = new RedBlackTree2<number>()
    tree.insert(1)
    expect(tree.delete(99)).toBe(false)
    expect(tree.size).toBe(1)
  })

  it('delete maintains tree balance with many deletions', () => {
    const tree = new RedBlackTree2<number>()
    for (let i = 1; i <= 20; i++) tree.insert(i)
    for (let i = 1; i <= 10; i++) tree.delete(i)
    expect(tree.size).toBe(10)
    expect(tree.min()).toBe(11)
    expect(tree.max()).toBe(20)
  })

  it('clear empties the tree', () => {
    const tree = new RedBlackTree2<number>()
    tree.insert(1)
    tree.insert(2)
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })
})

// ─── Traversals ───

describe('RedBlackTree2: traversals', () => {
  it('toArray returns sorted elements', () => {
    const tree = new RedBlackTree2<number>()
    tree.insert(3)
    tree.insert(1)
    tree.insert(2)
    expect(tree.toArray()).toEqual([1, 2, 3])
  })

  it('inOrderTraversal visits elements in order', () => {
    const tree = new RedBlackTree2<number>()
    tree.insert(5)
    tree.insert(3)
    tree.insert(7)
    tree.insert(1)
    tree.insert(4)
    const items: number[] = []
    tree.inOrderTraversal((v) => items.push(v))
    expect(items).toEqual([1, 3, 4, 5, 7])
  })

  it('rangeQuery returns elements in range inclusive', () => {
    const tree = new RedBlackTree2<number>()
    for (let i = 1; i <= 10; i++) tree.insert(i)
    expect(tree.rangeQuery(3, 7)).toEqual([3, 4, 5, 6, 7])
    expect(tree.rangeQuery(0, 2)).toEqual([1, 2])
    expect(tree.rangeQuery(8, 12)).toEqual([8, 9, 10])
  })

  it('rangeQuery returns empty for disjoint range', () => {
    const tree = new RedBlackTree2<number>()
    tree.insert(1)
    tree.insert(2)
    expect(tree.rangeQuery(5, 10)).toEqual([])
  })
})

// ─── Edge Cases ───

describe('RedBlackTree2: edge cases', () => {
  it('handles single element operations', () => {
    const tree = new RedBlackTree2<number>()
    tree.insert(42)
    expect(tree.min()).toBe(42)
    expect(tree.max()).toBe(42)
    expect(tree.search(42)).toBe(42)
    tree.delete(42)
    expect(tree.isEmpty()).toBe(true)
  })

  it('handles inserting in reverse order', () => {
    const tree = new RedBlackTree2<number>()
    for (let i = 10; i >= 1; i--) tree.insert(i)
    expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('handles inserting in sorted order', () => {
    const tree = new RedBlackTree2<number>()
    for (let i = 1; i <= 10; i++) tree.insert(i)
    expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(tree.min()).toBe(1)
    expect(tree.max()).toBe(10)
  })

  it('works with string keys', () => {
    const tree = new RedBlackTree2<string>()
    tree.insert('cherry')
    tree.insert('apple')
    tree.insert('banana')
    expect(tree.toArray()).toEqual(['apple', 'banana', 'cherry'])
    expect(tree.contains('banana')).toBe(true)
    expect(tree.contains('grape')).toBe(false)
  })
})
