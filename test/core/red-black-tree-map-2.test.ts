import { describe, expect, it } from 'vitest'
import { RedBlackTreeMap2 } from '../../src/core/red-black-tree-map-2/index.js'

// ─── Constructor ───

describe('RedBlackTreeMap2 – constructor', () => {
  it('creates an empty tree with default comparator', () => {
    const tree = new RedBlackTreeMap2<number, string>()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('creates a tree with a custom comparator', () => {
    const tree = new RedBlackTreeMap2<string, number>((a, b) => a.localeCompare(b))
    tree.set('b', 2)
    tree.set('a', 1)
    expect(tree.keys()).toEqual(['a', 'b'])
  })

  it('supports reverse-order comparator', () => {
    const tree = new RedBlackTreeMap2<number, string>((a, b) => b - a)
    tree.set(1, 'a')
    tree.set(3, 'c')
    tree.set(2, 'b')
    expect(tree.keys()).toEqual([3, 2, 1])
  })
})

// ─── set and get ───

describe('RedBlackTreeMap2 – set / get', () => {
  it('sets and gets a single entry', () => {
    const tree = new RedBlackTreeMap2<number, string>()
    tree.set(1, 'one')
    expect(tree.get(1)).toBe('one')
    expect(tree.size).toBe(1)
  })

  it('returns undefined for missing key', () => {
    const tree = new RedBlackTreeMap2<number, string>()
    expect(tree.get(99)).toBeUndefined()
  })

  it('updates value for existing key without increasing size', () => {
    const tree = new RedBlackTreeMap2<number, string>()
    tree.set(1, 'one')
    tree.set(1, 'uno')
    expect(tree.get(1)).toBe('uno')
    expect(tree.size).toBe(1)
  })

  it('handles multiple insertions in sorted order', () => {
    const tree = new RedBlackTreeMap2<number, string>()
    tree.set(1, 'a')
    tree.set(2, 'b')
    tree.set(3, 'c')
    expect(tree.size).toBe(3)
    expect(tree.get(1)).toBe('a')
    expect(tree.get(2)).toBe('b')
    expect(tree.get(3)).toBe('c')
  })

  it('handles reverse-order insertions', () => {
    const tree = new RedBlackTreeMap2<number, string>()
    tree.set(3, 'c')
    tree.set(2, 'b')
    tree.set(1, 'a')
    expect(tree.toArray()).toEqual([
      [1, 'a'],
      [2, 'b'],
      [3, 'c'],
    ])
  })

  it('handles negative keys', () => {
    const tree = new RedBlackTreeMap2<number, string>()
    tree.set(-3, 'c')
    tree.set(0, 'z')
    tree.set(5, 'a')
    expect(tree.keys()).toEqual([-3, 0, 5])
  })

  it('handles duplicate keys (overwrite)', () => {
    const tree = new RedBlackTreeMap2<number, number>()
    tree.set(1, 10)
    tree.set(1, 20)
    tree.set(1, 30)
    expect(tree.size).toBe(1)
    expect(tree.get(1)).toBe(30)
  })
})

// ─── has ───

describe('RedBlackTreeMap2 – has', () => {
  it('returns true for existing key', () => {
    const tree = new RedBlackTreeMap2<number, string>()
    tree.set(42, 'answer')
    expect(tree.has(42)).toBe(true)
  })

  it('returns false for missing key', () => {
    const tree = new RedBlackTreeMap2<number, string>()
    expect(tree.has(42)).toBe(false)
  })

  it('returns false after deletion', () => {
    const tree = new RedBlackTreeMap2<number, string>()
    tree.set(1, 'x')
    tree.delete(1)
    expect(tree.has(1)).toBe(false)
  })
})

// ─── delete ───

describe('RedBlackTreeMap2 – delete', () => {
  it('deletes a single entry', () => {
    const tree = new RedBlackTreeMap2<number, string>()
    tree.set(1, 'one')
    expect(tree.delete(1)).toBe(true)
    expect(tree.size).toBe(0)
    expect(tree.get(1)).toBeUndefined()
  })

  it('returns false for missing key', () => {
    const tree = new RedBlackTreeMap2<number, string>()
    expect(tree.delete(99)).toBe(false)
  })

  it('deletes from a tree with multiple entries preserving order', () => {
    const tree = new RedBlackTreeMap2<number, string>()
    tree.set(1, 'a')
    tree.set(2, 'b')
    tree.set(3, 'c')
    tree.delete(2)
    expect(tree.size).toBe(2)
    expect(tree.keys()).toEqual([1, 3])
  })

  it('deletes the root of a larger tree', () => {
    const tree = new RedBlackTreeMap2<number, string>()
    for (let i = 1; i <= 7; i++) tree.set(i, String(i))
    tree.delete(4)
    expect(tree.has(4)).toBe(false)
    expect(tree.size).toBe(6)
  })

  it('handles sequential deletions', () => {
    const tree = new RedBlackTreeMap2<number, number>()
    for (let i = 0; i < 10; i++) tree.set(i, i)
    for (let i = 0; i < 10; i++) {
      expect(tree.delete(i)).toBe(true)
    }
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('handles delete and re-insert', () => {
    const tree = new RedBlackTreeMap2<number, string>()
    tree.set(1, 'a')
    tree.delete(1)
    tree.set(1, 'b')
    expect(tree.get(1)).toBe('b')
    expect(tree.size).toBe(1)
  })
})

// ─── clear ───

describe('RedBlackTreeMap2 – clear', () => {
  it('clears all entries', () => {
    const tree = new RedBlackTreeMap2<number, string>()
    tree.set(1, 'a')
    tree.set(2, 'b')
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
    expect(tree.keys()).toEqual([])
  })

  it('clear on empty tree is a no-op', () => {
    const tree = new RedBlackTreeMap2<number, string>()
    tree.clear()
    expect(tree.size).toBe(0)
  })
})

// ─── min / max ───

describe('RedBlackTreeMap2 – min / max', () => {
  it('returns undefined on empty tree', () => {
    const tree = new RedBlackTreeMap2<number, string>()
    expect(tree.min()).toBeUndefined()
    expect(tree.max()).toBeUndefined()
  })

  it('returns the only key for single-entry tree', () => {
    const tree = new RedBlackTreeMap2<number, string>()
    tree.set(5, 'five')
    expect(tree.min()).toBe(5)
    expect(tree.max()).toBe(5)
  })

  it('returns correct min and max for multiple entries', () => {
    const tree = new RedBlackTreeMap2<number, string>()
    tree.set(10, 'ten')
    tree.set(1, 'one')
    tree.set(20, 'twenty')
    expect(tree.min()).toBe(1)
    expect(tree.max()).toBe(20)
  })

  it('updates min/max after deletion', () => {
    const tree = new RedBlackTreeMap2<number, string>()
    tree.set(1, 'a')
    tree.set(5, 'b')
    tree.set(10, 'c')
    tree.delete(1)
    expect(tree.min()).toBe(5)
    tree.delete(10)
    expect(tree.max()).toBe(5)
  })
})

// ─── keys / values / toArray ───

describe('RedBlackTreeMap2 – keys / values / toArray', () => {
  it('keys returns sorted keys', () => {
    const tree = new RedBlackTreeMap2<number, string>()
    tree.set(3, 'c')
    tree.set(1, 'a')
    tree.set(2, 'b')
    expect(tree.keys()).toEqual([1, 2, 3])
  })

  it('values returns values in key order', () => {
    const tree = new RedBlackTreeMap2<number, string>()
    tree.set(3, 'c')
    tree.set(1, 'a')
    tree.set(2, 'b')
    expect(tree.values()).toEqual(['a', 'b', 'c'])
  })

  it('toArray returns sorted key-value pairs', () => {
    const tree = new RedBlackTreeMap2<number, string>()
    tree.set(3, 'c')
    tree.set(1, 'a')
    tree.set(2, 'b')
    expect(tree.toArray()).toEqual([
      [1, 'a'],
      [2, 'b'],
      [3, 'c'],
    ])
  })

  it('returns empty arrays on empty tree', () => {
    const tree = new RedBlackTreeMap2<number, string>()
    expect(tree.keys()).toEqual([])
    expect(tree.values()).toEqual([])
    expect(tree.toArray()).toEqual([])
  })
})

// ─── forEach ───

describe('RedBlackTreeMap2 – forEach', () => {
  it('iterates in sorted order', () => {
    const tree = new RedBlackTreeMap2<number, string>()
    tree.set(3, 'c')
    tree.set(1, 'a')
    tree.set(2, 'b')
    const collected: [number, string][] = []
    tree.forEach((k, v) => collected.push([k, v]))
    expect(collected).toEqual([
      [1, 'a'],
      [2, 'b'],
      [3, 'c'],
    ])
  })

  it('does not call callback on empty tree', () => {
    const tree = new RedBlackTreeMap2<number, string>()
    let called = false
    tree.forEach(() => { called = true })
    expect(called).toBe(false)
  })
})

// ─── isEmpty ───

describe('RedBlackTreeMap2 – isEmpty', () => {
  it('returns true for new tree', () => {
    const tree = new RedBlackTreeMap2<number, string>()
    expect(tree.isEmpty()).toBe(true)
  })

  it('returns false after insertion', () => {
    const tree = new RedBlackTreeMap2<number, string>()
    tree.set(1, 'a')
    expect(tree.isEmpty()).toBe(false)
  })

  it('returns true after all entries deleted', () => {
    const tree = new RedBlackTreeMap2<number, string>()
    tree.set(1, 'a')
    tree.delete(1)
    expect(tree.isEmpty()).toBe(true)
  })
})

// ─── Stress: large-scale insertions ───

describe('RedBlackTreeMap2 – stress', () => {
  it('handles many insertions and maintains sorted order', () => {
    const tree = new RedBlackTreeMap2<number, number>()
    const count = 100
    for (let i = count; i >= 1; i--) {
      tree.set(i, i * 10)
    }
    expect(tree.size).toBe(count)
    expect(tree.min()).toBe(1)
    expect(tree.max()).toBe(count)
    const keys = tree.keys()
    for (let i = 0; i < keys.length - 1; i++) {
      expect(keys[i]! < keys[i + 1]!).toBe(true)
    }
  })

  it('handles interleaved insert and delete', () => {
    const tree = new RedBlackTreeMap2<number, string>()
    tree.set(5, 'five')
    tree.set(3, 'three')
    tree.set(7, 'seven')
    tree.delete(5)
    tree.set(1, 'one')
    tree.delete(7)
    expect(tree.size).toBe(2)
    expect(tree.keys()).toEqual([1, 3])
  })
})
