import { describe, expect, it } from 'vitest'
import { SplayTree } from '../../src/utils/splay-tree.js'

// ─── Basics ───

describe('SplayTree basics', () => {
  it('starts empty', () => {
    const tree = new SplayTree<number, string>()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('inserts a single node', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(1, 'a')
    expect(tree.size).toBe(1)
    expect(tree.find(1)).toBe('a')
    expect(tree.contains(1)).toBe(true)
  })

  it('inserts multiple nodes', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(5, 'e')
    tree.insert(3, 'c')
    tree.insert(7, 'g')
    expect(tree.size).toBe(3)
    expect(tree.find(3)).toBe('c')
    expect(tree.find(7)).toBe('g')
  })

  it('updates value on duplicate key', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(1, 'old')
    tree.insert(1, 'new')
    expect(tree.size).toBe(1)
    expect(tree.find(1)).toBe('new')
  })

  it('returns undefined for missing key', () => {
    const tree = new SplayTree<number, string>()
    expect(tree.find(99)).toBeUndefined()
    expect(tree.contains(99)).toBe(false)
  })
})

// ─── Min & Max ───

describe('SplayTree min/max', () => {
  it('returns undefined on empty', () => {
    const tree = new SplayTree<number, string>()
    expect(tree.min).toBeUndefined()
    expect(tree.max).toBeUndefined()
  })

  it('tracks min and max', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(5, 'e')
    tree.insert(2, 'b')
    tree.insert(8, 'h')
    tree.insert(1, 'a')
    tree.insert(9, 'i')
    expect(tree.min).toBe(1)
    expect(tree.max).toBe(9)
  })
})

// ─── Traversal ───

describe('SplayTree traversal', () => {
  it('inOrder returns sorted entries', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(5, 'e')
    tree.insert(3, 'c')
    tree.insert(7, 'g')
    tree.insert(1, 'a')
    expect(tree.inOrder().map((e) => e.key)).toEqual([1, 3, 5, 7])
  })

  it('inOrder empty returns []', () => {
    const tree = new SplayTree<number, string>()
    expect(tree.inOrder()).toEqual([])
  })
})

// ─── Delete ───

describe('SplayTree delete', () => {
  it('deletes an existing key', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(1, 'a')
    tree.insert(2, 'b')
    expect(tree.delete(1)).toBe(true)
    expect(tree.size).toBe(1)
    expect(tree.find(1)).toBeUndefined()
  })

  it('returns false for missing key', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(1, 'a')
    expect(tree.delete(99)).toBe(false)
    expect(tree.size).toBe(1)
  })

  it('deletes all nodes', () => {
    const tree = new SplayTree<number, string>()
    for (let i = 0; i < 10; i++) tree.insert(i, `v${i}`)
    for (let i = 0; i < 10; i++) {
      expect(tree.delete(i)).toBe(true)
    }
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('maintains order after deletions', () => {
    const tree = new SplayTree<number, string>()
    for (let i = 0; i < 10; i++) tree.insert(i, `v${i}`)
    tree.delete(3)
    tree.delete(7)
    expect(tree.inOrder().map((e) => e.key)).toEqual([0, 1, 2, 4, 5, 6, 8, 9])
  })
})

// ─── Splay Property ───

describe('SplayTree splay property', () => {
  it('find splays accessed key to root', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(1, 'a')
    tree.insert(2, 'b')
    tree.insert(3, 'c')
    tree.find(1)
    expect(tree.getRoot()!.key).toBe(1)
  })
})

// ─── Root & Clear ───

describe('SplayTree root & clear', () => {
  it('getRoot returns null on empty', () => {
    const tree = new SplayTree<number, string>()
    expect(tree.getRoot()).toBeNull()
  })

  it('clear empties the tree', () => {
    const tree = new SplayTree<number, string>()
    for (let i = 0; i < 10; i++) tree.insert(i, `v${i}`)
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })
})

// ─── Custom Comparator ───

describe('SplayTree custom comparator', () => {
  it('works with string keys', () => {
    const tree = new SplayTree<string, number>((a, b) => a.localeCompare(b))
    tree.insert('banana', 2)
    tree.insert('apple', 1)
    tree.insert('cherry', 3)
    expect(tree.min).toBe('apple')
    expect(tree.max).toBe('cherry')
  })
})
