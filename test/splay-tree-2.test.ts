import { describe, expect, it } from 'vitest'

import { SplayTree2 } from '../src/core/splay-tree-2/index.js'

// ─── Construction ──────────────────────────────────────
describe('SplayTree2 construction', () => {
  it('creates empty tree', () => {
    const tree = new SplayTree2<number>()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('creates with custom comparator', () => {
    const tree = new SplayTree2<string>((a, b) => b.localeCompare(a))
    tree.insert('a')
    tree.insert('b')
    expect(tree.toArray()).toEqual(['b', 'a'])
  })
})

// ─── Insert ────────────────────────────────────────────
describe('SplayTree2 insert', () => {
  it('inserts elements', () => {
    const tree = new SplayTree2<number>()
    tree.insert(5)
    tree.insert(3)
    tree.insert(7)
    expect(tree.size).toBe(3)
  })

  it('ignores duplicates', () => {
    const tree = new SplayTree2<number>()
    tree.insert(5)
    tree.insert(5)
    expect(tree.size).toBe(1)
  })

  it('maintains sorted order', () => {
    const tree = new SplayTree2<number>()
    tree.insert(5)
    tree.insert(3)
    tree.insert(7)
    tree.insert(1)
    tree.insert(9)
    expect(tree.toArray()).toEqual([1, 3, 5, 7, 9])
  })
})

// ─── Search & Contains ─────────────────────────────────
describe('SplayTree2 search and contains', () => {
  it('search returns value if found', () => {
    const tree = new SplayTree2<number>()
    tree.insert(42)
    expect(tree.search(42)).toBe(42)
  })

  it('search returns null if not found', () => {
    const tree = new SplayTree2<number>()
    tree.insert(1)
    expect(tree.search(99)).toBeNull()
  })

  it('contains returns boolean', () => {
    const tree = new SplayTree2<number>()
    tree.insert(5)
    expect(tree.contains(5)).toBe(true)
    expect(tree.contains(6)).toBe(false)
  })

  it('search on empty tree returns null', () => {
    const tree = new SplayTree2<number>()
    expect(tree.search(1)).toBeNull()
  })
})

// ─── Delete ────────────────────────────────────────────
describe('SplayTree2 delete', () => {
  it('deletes existing element', () => {
    const tree = new SplayTree2<number>()
    tree.insert(5)
    tree.insert(3)
    tree.insert(7)
    tree.delete(5)
    expect(tree.contains(5)).toBe(false)
    expect(tree.size).toBe(2)
    expect(tree.toArray()).toEqual([3, 7])
  })

  it('delete non-existing element is no-op', () => {
    const tree = new SplayTree2<number>()
    tree.insert(1)
    tree.delete(99)
    expect(tree.size).toBe(1)
  })

  it('deletes root element', () => {
    const tree = new SplayTree2<number>()
    tree.insert(5)
    tree.delete(5)
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('deletes all elements', () => {
    const tree = new SplayTree2<number>()
    tree.insert(1)
    tree.insert(2)
    tree.insert(3)
    tree.delete(2)
    tree.delete(1)
    tree.delete(3)
    expect(tree.isEmpty()).toBe(true)
  })
})

// ─── Min & Max ─────────────────────────────────────────
describe('SplayTree2 min and max', () => {
  it('returns min value', () => {
    const tree = new SplayTree2<number>()
    tree.insert(5)
    tree.insert(3)
    tree.insert(7)
    expect(tree.min()).toBe(3)
  })

  it('returns max value', () => {
    const tree = new SplayTree2<number>()
    tree.insert(5)
    tree.insert(3)
    tree.insert(7)
    expect(tree.max()).toBe(7)
  })

  it('returns null for empty tree', () => {
    const tree = new SplayTree2<number>()
    expect(tree.min()).toBeNull()
    expect(tree.max()).toBeNull()
  })
})

// ─── Clear ─────────────────────────────────────────────
describe('SplayTree2 clear', () => {
  it('clears the tree', () => {
    const tree = new SplayTree2<number>()
    tree.insert(1)
    tree.insert(2)
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })
})

// ─── ToArray & Traversal ───────────────────────────────
describe('SplayTree2 traversal', () => {
  it('toArray returns sorted elements', () => {
    const tree = new SplayTree2<number>()
    tree.insert(5)
    tree.insert(1)
    tree.insert(3)
    expect(tree.toArray()).toEqual([1, 3, 5])
  })

  it('inOrderTraversal calls callback in order', () => {
    const tree = new SplayTree2<number>()
    tree.insert(3)
    tree.insert(1)
    tree.insert(2)
    const result: number[] = []
    tree.inOrderTraversal((v) => result.push(v))
    expect(result).toEqual([1, 2, 3])
  })

  it('toArray returns empty for empty tree', () => {
    const tree = new SplayTree2<number>()
    expect(tree.toArray()).toEqual([])
  })
})
