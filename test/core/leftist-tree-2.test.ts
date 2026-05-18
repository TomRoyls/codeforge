import { describe, it, expect } from 'vitest'
import { LeftistTree2 } from '../../src/core/leftist-tree-2/index.js'

// ─── Constructor & Empty State ───

describe('LeftistTree2 - constructor & empty state', () => {
  it('creates an empty tree with default options', () => {
    const tree = new LeftistTree2<number>()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('creates a tree with a custom comparator (max-heap)', () => {
    const tree = new LeftistTree2<number>({ comparator: (a, b) => b - a })
    tree.insert(1)
    tree.insert(3)
    tree.insert(2)
    expect(tree.peek()).toBe(3)
  })

  it('peek throws on empty tree', () => {
    const tree = new LeftistTree2<number>()
    expect(() => tree.peek()).toThrow('peek called on empty tree')
  })

  it('extractMin throws on empty tree', () => {
    const tree = new LeftistTree2<number>()
    expect(() => tree.extractMin()).toThrow('extractMin called on empty tree')
  })
})

// ─── Insert & Peek ───

describe('LeftistTree2 - insert & peek', () => {
  it('inserts a single element', () => {
    const tree = new LeftistTree2<number>()
    tree.insert(42)
    expect(tree.size).toBe(1)
    expect(tree.isEmpty()).toBe(false)
    expect(tree.peek()).toBe(42)
  })

  it('peek returns the smallest element after multiple inserts', () => {
    const tree = new LeftistTree2<number>()
    tree.insert(5)
    tree.insert(2)
    tree.insert(8)
    tree.insert(1)
    expect(tree.peek()).toBe(1)
  })

  it('maintains correct size after many inserts', () => {
    const tree = new LeftistTree2<number>()
    for (let i = 0; i < 15; i++) {
      tree.insert(i)
    }
    expect(tree.size).toBe(15)
  })
})

// ─── ExtractMin ───

describe('LeftistTree2 - extractMin', () => {
  it('extracts the only element', () => {
    const tree = new LeftistTree2<number>()
    tree.insert(7)
    expect(tree.extractMin()).toBe(7)
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('extracts elements in sorted order', () => {
    const tree = new LeftistTree2<number>()
    const values = [5, 3, 8, 1, 9, 2, 7, 4, 6]
    for (const v of values) {
      tree.insert(v)
    }
    const result: number[] = []
    while (!tree.isEmpty()) {
      result.push(tree.extractMin())
    }
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('handles duplicate values', () => {
    const tree = new LeftistTree2<number>()
    tree.insert(3)
    tree.insert(3)
    tree.insert(1)
    tree.insert(3)
    expect(tree.extractMin()).toBe(1)
    expect(tree.extractMin()).toBe(3)
    expect(tree.extractMin()).toBe(3)
    expect(tree.extractMin()).toBe(3)
  })

  it('interleaved insert and extractMin', () => {
    const tree = new LeftistTree2<number>()
    tree.insert(5)
    tree.insert(2)
    expect(tree.extractMin()).toBe(2)
    tree.insert(1)
    tree.insert(8)
    expect(tree.extractMin()).toBe(1)
    expect(tree.extractMin()).toBe(5)
    expect(tree.extractMin()).toBe(8)
  })
})

// ─── Merge ───

describe('LeftistTree2 - merge', () => {
  it('merges two non-empty trees into a new tree', () => {
    const t1 = new LeftistTree2<number>()
    t1.insert(3)
    t1.insert(1)
    const t2 = new LeftistTree2<number>()
    t2.insert(4)
    t2.insert(2)
    const merged = t1.merge(t2)
    expect(merged.size).toBe(4)
    expect(merged.peek()).toBe(1)
  })

  it('merge does not modify original trees', () => {
    const t1 = new LeftistTree2<number>()
    t1.insert(5)
    const t2 = new LeftistTree2<number>()
    t2.insert(3)
    const merged = t1.merge(t2)
    expect(t1.size).toBe(1)
    expect(t2.size).toBe(1)
    expect(merged.size).toBe(2)
  })

  it('merging with an empty tree returns a clone', () => {
    const t1 = new LeftistTree2<number>()
    t1.insert(10)
    const t2 = new LeftistTree2<number>()
    const merged = t1.merge(t2)
    expect(merged.size).toBe(1)
    expect(merged.peek()).toBe(10)
  })
})

// ─── Clear ───

describe('LeftistTree2 - clear', () => {
  it('clears all elements', () => {
    const tree = new LeftistTree2<number>()
    tree.insert(1)
    tree.insert(2)
    tree.insert(3)
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
    expect(() => tree.peek()).toThrow()
  })
})

// ─── ToArray ───

describe('LeftistTree2 - toArray', () => {
  it('returns sorted array', () => {
    const tree = new LeftistTree2<number>()
    tree.insert(3)
    tree.insert(1)
    tree.insert(2)
    expect(tree.toArray()).toEqual([1, 2, 3])
  })

  it('does not modify the original tree', () => {
    const tree = new LeftistTree2<number>()
    tree.insert(3)
    tree.insert(1)
    tree.toArray()
    expect(tree.size).toBe(2)
    expect(tree.peek()).toBe(1)
  })

  it('returns empty array for empty tree', () => {
    const tree = new LeftistTree2<number>()
    expect(tree.toArray()).toEqual([])
  })
})

// ─── String values ───

describe('LeftistTree2 - string values', () => {
  it('works with string values', () => {
    const tree = new LeftistTree2<string>()
    tree.insert('cherry')
    tree.insert('apple')
    tree.insert('banana')
    expect(tree.peek()).toBe('apple')
    expect(tree.extractMin()).toBe('apple')
    expect(tree.extractMin()).toBe('banana')
    expect(tree.extractMin()).toBe('cherry')
  })
})

// ─── Object values with custom comparator ───

describe('LeftistTree2 - object values', () => {
  it('works with objects using custom comparator', () => {
    interface Task { priority: number; label: string }
    const tree = new LeftistTree2<Task>({ comparator: (a, b) => a.priority - b.priority })
    tree.insert({ priority: 3, label: 'low' })
    tree.insert({ priority: 1, label: 'high' })
    tree.insert({ priority: 2, label: 'medium' })
    expect(tree.peek()!.label).toBe('high')
    expect(tree.extractMin().priority).toBe(1)
  })
})

// ─── Large dataset ───

describe('LeftistTree2 - large dataset', () => {
  it('handles 100 elements in correct order', () => {
    const tree = new LeftistTree2<number>()
    for (let i = 99; i >= 0; i--) {
      tree.insert(i)
    }
    for (let i = 0; i < 100; i++) {
      expect(tree.extractMin()).toBe(i)
    }
    expect(tree.isEmpty()).toBe(true)
  })
})
