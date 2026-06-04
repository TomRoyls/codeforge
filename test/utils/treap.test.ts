import { describe, expect, it } from 'vitest'
import { Treap } from '../../src/utils/treap.js'

// ─── Basics ───

describe('Treap basics', () => {
  it('starts empty', () => {
    const t = new Treap<number, string>()
    expect(t.size).toBe(0)
    expect(t.isEmpty()).toBe(true)
    expect(t.height).toBe(0)
  })

  it('inserts a single node', () => {
    const t = new Treap<number, string>()
    t.insert(1, 'a')
    expect(t.size).toBe(1)
    expect(t.find(1)).toBe('a')
    expect(t.contains(1)).toBe(true)
  })

  it('inserts multiple nodes', () => {
    const t = new Treap<number, string>()
    t.insert(5, 'e')
    t.insert(3, 'c')
    t.insert(7, 'g')
    expect(t.size).toBe(3)
    expect(t.find(5)).toBe('e')
    expect(t.find(3)).toBe('c')
    expect(t.find(7)).toBe('g')
  })

  it('updates value on duplicate key', () => {
    const t = new Treap<number, string>()
    t.insert(1, 'old')
    t.insert(1, 'new')
    expect(t.size).toBe(1)
    expect(t.find(1)).toBe('new')
  })
})

// ─── Find & Contains ───

describe('Treap find', () => {
  it('returns undefined for missing key', () => {
    const t = new Treap<number, string>()
    expect(t.find(99)).toBeUndefined()
  })

  it('contains returns false for missing key', () => {
    const t = new Treap<number, string>()
    expect(t.contains(42)).toBe(false)
  })

  it('finds all inserted keys', () => {
    const t = new Treap<number, string>()
    for (let i = 0; i < 20; i++) t.insert(i, `v${i}`)
    for (let i = 0; i < 20; i++) {
      expect(t.find(i)).toBe(`v${i}`)
    }
  })
})

// ─── Min & Max ───

describe('Treap min/max', () => {
  it('returns undefined on empty treap', () => {
    const t = new Treap<number, string>()
    expect(t.min).toBeUndefined()
    expect(t.max).toBeUndefined()
  })

  it('tracks min and max', () => {
    const t = new Treap<number, string>()
    t.insert(5, 'e')
    t.insert(2, 'b')
    t.insert(8, 'h')
    t.insert(1, 'a')
    t.insert(9, 'i')
    expect(t.min).toBe(1)
    expect(t.max).toBe(9)
  })
})

// ─── Traversal ───

describe('Treap traversal', () => {
  it('inOrder returns sorted entries', () => {
    const t = new Treap<number, string>()
    t.insert(5, 'e')
    t.insert(3, 'c')
    t.insert(7, 'g')
    t.insert(1, 'a')
    t.insert(9, 'i')
    expect(t.inOrder().map((e) => e.key)).toEqual([1, 3, 5, 7, 9])
  })

  it('inOrder empty treap returns []', () => {
    const t = new Treap<number, string>()
    expect(t.inOrder()).toEqual([])
  })
})

// ─── Delete ───

describe('Treap delete', () => {
  it('deletes a leaf', () => {
    const t = new Treap<number, string>()
    t.insert(1, 'a')
    t.insert(2, 'b')
    expect(t.delete(2)).toBe(true)
    expect(t.size).toBe(1)
    expect(t.find(2)).toBeUndefined()
  })

  it('deletes root', () => {
    const t = new Treap<number, string>()
    t.insert(5, 'e')
    expect(t.delete(5)).toBe(true)
    expect(t.size).toBe(0)
    expect(t.isEmpty()).toBe(true)
  })

  it('returns false for missing key', () => {
    const t = new Treap<number, string>()
    t.insert(1, 'a')
    expect(t.delete(99)).toBe(false)
    expect(t.size).toBe(1)
  })

  it('deletes all nodes', () => {
    const t = new Treap<number, string>()
    for (let i = 0; i < 10; i++) t.insert(i, `v${i}`)
    for (let i = 0; i < 10; i++) {
      expect(t.delete(i)).toBe(true)
    }
    expect(t.size).toBe(0)
    expect(t.isEmpty()).toBe(true)
  })

  it('maintains order after deletions', () => {
    const t = new Treap<number, string>()
    for (let i = 0; i < 10; i++) t.insert(i, `v${i}`)
    t.delete(3)
    t.delete(7)
    expect(t.inOrder().map((e) => e.key)).toEqual([0, 1, 2, 4, 5, 6, 8, 9])
  })
})

// ─── Clear ───

describe('Treap clear', () => {
  it('clears the treap', () => {
    const t = new Treap<number, string>()
    for (let i = 0; i < 5; i++) t.insert(i, `v${i}`)
    t.clear()
    expect(t.size).toBe(0)
    expect(t.isEmpty()).toBe(true)
    expect(t.height).toBe(0)
  })
})

// ─── Custom Comparator ───

describe('Treap custom comparator', () => {
  it('works with string keys', () => {
    const t = new Treap<string, number>((a, b) => a.localeCompare(b))
    t.insert('banana', 2)
    t.insert('apple', 1)
    t.insert('cherry', 3)
    expect(t.min).toBe('apple')
    expect(t.max).toBe('cherry')
    expect(t.inOrder().map((e) => e.key)).toEqual(['apple', 'banana', 'cherry'])
  })
})

// ─── getRoot ───

describe('Treap getRoot', () => {
  it('returns null for empty treap', () => {
    const t = new Treap<number, string>()
    expect(t.getRoot()).toBeNull()
  })

  it('returns root node', () => {
    const t = new Treap<number, string>()
    t.insert(1, 'a')
    const root = t.getRoot()
    expect(root).not.toBeNull()
    expect(root!.key).toBe(1)
    expect(root!.value).toBe('a')
    expect(root!.priority).toBeGreaterThanOrEqual(0)
  })

  it('delete removes node', () => {
    const t = new Treap<number, string>()
    t.insert(5, 'x')
    t.insert(3, 'y')
    t.delete(5)
    expect(t.find(5)).toBeUndefined()
  })

  it('find returns value for existing key', () => {
    const t = new Treap<number, string>()
    t.insert(1, 'a')
    expect(t.find(1)).toBe('a')
  })

  it('find missing key returns undefined', () => {
    const t = new Treap<number, string>()
    t.insert(1, 'a')
    expect(t.find(99)).toBeUndefined()
  })

  it('insert and find roundtrip', () => {
    const t = new Treap<number, string>()
    t.insert(1, 'a')
    expect(t.find(1)).toBe('a')
  })
})
