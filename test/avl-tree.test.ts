import { beforeEach, describe, expect, it } from 'vitest'

import { AVLTree } from '../src/utils/avl-tree.js'

// ─── constructor ────────────────────────────────────────
describe('constructor', () => {
  it('creates a tree with default comparator (numbers)', () => {
    const tree = new AVLTree<number, string>()
    tree.insert(1, 'a')
    expect(tree.size).toBe(1)
    expect(tree.find(1)).toBe('a')
  })

  it('creates a tree with custom comparator (strings)', () => {
    const tree = new AVLTree<string, number>((a, b) => a.localeCompare(b))
    tree.insert('banana', 2)
    tree.insert('apple', 1)
    expect(tree.inOrder().map((e) => e.key)).toEqual(['apple', 'banana'])
  })
})

// ─── insert ─────────────────────────────────────────────
describe('insert', () => {
  let tree: AVLTree<number, string>

  beforeEach(() => {
    tree = new AVLTree<number, string>()
  })

  it('adds nodes and increments size', () => {
    tree.insert(10, 'ten')
    tree.insert(5, 'five')
    tree.insert(15, 'fifteen')
    expect(tree.size).toBe(3)
  })

  it('updates height after inserts', () => {
    tree.insert(10, 'ten')
    expect(tree.height).toBe(1)
    tree.insert(5, 'five')
    expect(tree.height).toBe(2)
    tree.insert(15, 'fifteen')
    expect(tree.height).toBe(2)
  })
})

// ─── find ───────────────────────────────────────────────
describe('find', () => {
  let tree: AVLTree<number, string>

  beforeEach(() => {
    tree = new AVLTree<number, string>()
    tree.insert(10, 'ten')
    tree.insert(5, 'five')
    tree.insert(15, 'fifteen')
  })

  it('returns value for existing key', () => {
    expect(tree.find(10)).toBe('ten')
    expect(tree.find(5)).toBe('five')
    expect(tree.find(15)).toBe('fifteen')
  })

  it('returns undefined for missing key', () => {
    expect(tree.find(99)).toBeUndefined()
  })
})

// ─── contains ───────────────────────────────────────────
describe('contains', () => {
  let tree: AVLTree<number, string>

  beforeEach(() => {
    tree = new AVLTree<number, string>()
    tree.insert(10, 'ten')
  })

  it('returns true for existing key', () => {
    expect(tree.contains(10)).toBe(true)
  })

  it('returns false for missing key', () => {
    expect(tree.contains(99)).toBe(false)
  })
})

// ─── delete ─────────────────────────────────────────────
describe('delete', () => {
  let tree: AVLTree<number, string>

  beforeEach(() => {
    tree = new AVLTree<number, string>()
    tree.insert(10, 'ten')
    tree.insert(5, 'five')
    tree.insert(15, 'fifteen')
  })

  it('removes a node and returns true', () => {
    expect(tree.delete(5)).toBe(true)
    expect(tree.size).toBe(2)
    expect(tree.find(5)).toBeUndefined()
  })

  it('returns false for missing key', () => {
    expect(tree.delete(99)).toBe(false)
    expect(tree.size).toBe(3)
  })
})

// ─── min/max ────────────────────────────────────────────
describe('min/max', () => {
  it('returns correct min and max', () => {
    const tree = new AVLTree<number, string>()
    tree.insert(10, 'ten')
    tree.insert(5, 'five')
    tree.insert(20, 'twenty')
    tree.insert(1, 'one')
    tree.insert(15, 'fifteen')
    expect(tree.min).toBe(1)
    expect(tree.max).toBe(20)
  })

  it('returns undefined on empty tree', () => {
    const tree = new AVLTree<number, string>()
    expect(tree.min).toBeUndefined()
    expect(tree.max).toBeUndefined()
  })
})

// ─── inOrder ────────────────────────────────────────────
describe('inOrder', () => {
  it('returns elements in sorted order', () => {
    const tree = new AVLTree<number, string>()
    tree.insert(30, 'c')
    tree.insert(10, 'a')
    tree.insert(20, 'b')
    tree.insert(50, 'e')
    tree.insert(40, 'd')
    const result = tree.inOrder()
    expect(result.map((e) => e.key)).toEqual([10, 20, 30, 40, 50])
    expect(result.map((e) => e.value)).toEqual(['a', 'b', 'c', 'd', 'e'])
  })
})

// ─── balance ────────────────────────────────────────────
describe('balance', () => {
  it('maintains O(log n) height for sequential inserts', () => {
    const tree = new AVLTree<number, number>()
    for (let i = 1; i <= 7; i++) {
      tree.insert(i, i)
    }
    expect(tree.size).toBe(7)
    expect(tree.height).toBeLessThanOrEqual(3)
    expect(tree.inOrder().map((e) => e.key)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('maintains balance after deletions', () => {
    const tree = new AVLTree<number, number>()
    for (let i = 1; i <= 15; i++) {
      tree.insert(i, i)
    }
    for (let i = 1; i <= 10; i++) {
      tree.delete(i)
    }
    expect(tree.height).toBeLessThanOrEqual(5)
    expect(tree.inOrder().map((e) => e.key)).toEqual([11, 12, 13, 14, 15])
  })
})

// ─── clear ──────────────────────────────────────────────
describe('clear', () => {
  it('empties the tree', () => {
    const tree = new AVLTree<number, string>()
    tree.insert(1, 'a')
    tree.insert(2, 'b')
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.height).toBe(0)
    expect(tree.isEmpty()).toBe(true)
    expect(tree.find(1)).toBeUndefined()
  })
})

// ─── isEmpty ────────────────────────────────────────────
describe('isEmpty', () => {
  it('returns true for new tree', () => {
    const tree = new AVLTree<number, string>()
    expect(tree.isEmpty()).toBe(true)
  })

  it('returns false after insert', () => {
    const tree = new AVLTree<number, string>()
    tree.insert(1, 'a')
    expect(tree.isEmpty()).toBe(false)
  })

  it('returns true after clearing all elements', () => {
    const tree = new AVLTree<number, string>()
    tree.insert(1, 'a')
    tree.clear()
    expect(tree.isEmpty()).toBe(true)
  })
})

// ─── duplicate key ──────────────────────────────────────
describe('duplicate key', () => {
  it('updates value and keeps same size', () => {
    const tree = new AVLTree<number, string>()
    tree.insert(1, 'original')
    tree.insert(1, 'updated')
    expect(tree.size).toBe(1)
    expect(tree.find(1)).toBe('updated')
  })
})

// ─── delete root ────────────────────────────────────────
describe('delete root', () => {
  it('deletes root and keeps tree valid', () => {
    const tree = new AVLTree<number, string>()
    tree.insert(10, 'root')
    tree.insert(5, 'left')
    tree.insert(15, 'right')
    expect(tree.delete(10)).toBe(true)
    expect(tree.size).toBe(2)
    expect(tree.find(10)).toBeUndefined()
    expect(tree.contains(5)).toBe(true)
    expect(tree.contains(15)).toBe(true)
    expect(tree.inOrder().map((e) => e.key)).toEqual([5, 15])
  })

  it('deletes the only node in tree', () => {
    const tree = new AVLTree<number, string>()
    tree.insert(1, 'only')
    expect(tree.delete(1)).toBe(true)
    expect(tree.isEmpty()).toBe(true)
    expect(tree.height).toBe(0)
  })
})

// ─── custom comparator ─────────────────────────────────
describe('custom comparator', () => {
  it('works with string keys', () => {
    const tree = new AVLTree<string, number>((a, b) => a.localeCompare(b))
    tree.insert('cherry', 3)
    tree.insert('apple', 1)
    tree.insert('banana', 2)
    tree.insert('date', 4)
    expect(tree.size).toBe(4)
    expect(tree.min).toBe('apple')
    expect(tree.max).toBe('date')
    expect(tree.find('banana')).toBe(2)
    expect(tree.inOrder().map((e) => e.key)).toEqual(['apple', 'banana', 'cherry', 'date'])
  })
})
