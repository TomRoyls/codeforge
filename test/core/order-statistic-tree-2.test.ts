import { describe, it, expect } from 'vitest'
import { OrderStatisticTree2 } from '../../src/core/order-statistic-tree-2/index.js'

// ─── Constructor ───

describe('OrderStatisticTree2: constructor', () => {
  it('creates an empty tree', () => {
    const tree = new OrderStatisticTree2<number>()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('accepts a custom comparator', () => {
    const tree = new OrderStatisticTree2<string>((a, b) => b.localeCompare(a))
    tree.insert('a')
    tree.insert('b')
    tree.insert('c')
    expect(tree.toArray()).toEqual(['c', 'b', 'a'])
  })
})

// ─── insert ───

describe('OrderStatisticTree2: insert', () => {
  it('inserts a single value', () => {
    const tree = new OrderStatisticTree2<number>()
    tree.insert(5)
    expect(tree.size).toBe(1)
    expect(tree.isEmpty()).toBe(false)
  })

  it('inserts multiple values', () => {
    const tree = new OrderStatisticTree2<number>()
    tree.insert(5)
    tree.insert(3)
    tree.insert(7)
    tree.insert(1)
    tree.insert(9)
    expect(tree.size).toBe(5)
  })

  it('ignores duplicate values', () => {
    const tree = new OrderStatisticTree2<number>()
    tree.insert(5)
    tree.insert(5)
    tree.insert(5)
    expect(tree.size).toBe(1)
  })

  it('handles negative numbers', () => {
    const tree = new OrderStatisticTree2<number>()
    tree.insert(-3)
    tree.insert(-1)
    tree.insert(-5)
    expect(tree.size).toBe(3)
    expect(tree.min()).toBe(-5)
    expect(tree.max()).toBe(-1)
  })
})

// ─── has ───

describe('OrderStatisticTree2: has', () => {
  it('returns false for empty tree', () => {
    const tree = new OrderStatisticTree2<number>()
    expect(tree.has(1)).toBe(false)
  })

  it('returns true for existing value', () => {
    const tree = new OrderStatisticTree2<number>()
    tree.insert(42)
    expect(tree.has(42)).toBe(true)
  })

  it('returns false for non-existing value', () => {
    const tree = new OrderStatisticTree2<number>()
    tree.insert(42)
    expect(tree.has(99)).toBe(false)
  })

  it('finds values in a populated tree', () => {
    const tree = new OrderStatisticTree2<number>()
    ;[5, 3, 7, 1, 9, 4, 6].forEach((v) => tree.insert(v))
    expect(tree.has(1)).toBe(true)
    expect(tree.has(9)).toBe(true)
    expect(tree.has(4)).toBe(true)
    expect(tree.has(8)).toBe(false)
  })
})

// ─── delete ───

describe('OrderStatisticTree2: delete', () => {
  it('deletes a leaf node', () => {
    const tree = new OrderStatisticTree2<number>()
    tree.insert(5)
    tree.insert(3)
    tree.insert(7)
    expect(tree.delete(3)).toBe(true)
    expect(tree.size).toBe(2)
    expect(tree.has(3)).toBe(false)
  })

  it('deletes the root', () => {
    const tree = new OrderStatisticTree2<number>()
    tree.insert(5)
    tree.insert(3)
    tree.insert(7)
    expect(tree.delete(5)).toBe(true)
    expect(tree.size).toBe(2)
    expect(tree.has(5)).toBe(false)
    expect(tree.has(3)).toBe(true)
    expect(tree.has(7)).toBe(true)
  })

  it('deletes a node with one child', () => {
    const tree = new OrderStatisticTree2<number>()
    tree.insert(5)
    tree.insert(3)
    tree.insert(2)
    expect(tree.delete(3)).toBe(true)
    expect(tree.has(2)).toBe(true)
    expect(tree.has(5)).toBe(true)
    expect(tree.size).toBe(2)
  })

  it('returns false for non-existing value', () => {
    const tree = new OrderStatisticTree2<number>()
    tree.insert(5)
    expect(tree.delete(99)).toBe(false)
    expect(tree.size).toBe(1)
  })

  it('returns false for empty tree', () => {
    const tree = new OrderStatisticTree2<number>()
    expect(tree.delete(1)).toBe(false)
  })

  it('deletes all elements leaving an empty tree', () => {
    const tree = new OrderStatisticTree2<number>()
    tree.insert(1)
    tree.insert(2)
    tree.insert(3)
    tree.delete(2)
    tree.delete(1)
    tree.delete(3)
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })
})

// ─── rank ───

describe('OrderStatisticTree2: rank', () => {
  it('returns 0 for non-existing value', () => {
    const tree = new OrderStatisticTree2<number>()
    expect(tree.rank(5)).toBe(0)
  })

  it('returns 0 for empty tree', () => {
    const tree = new OrderStatisticTree2<number>()
    expect(tree.rank(1)).toBe(0)
  })

  it('returns correct rank (1-based)', () => {
    const tree = new OrderStatisticTree2<number>()
    ;[5, 3, 7, 1, 9, 4, 6].forEach((v) => tree.insert(v))
    expect(tree.rank(1)).toBe(1)
    expect(tree.rank(3)).toBe(2)
    expect(tree.rank(4)).toBe(3)
    expect(tree.rank(5)).toBe(4)
    expect(tree.rank(6)).toBe(5)
    expect(tree.rank(7)).toBe(6)
    expect(tree.rank(9)).toBe(7)
  })
})

// ─── select ───

describe('OrderStatisticTree2: select', () => {
  it('returns undefined for k out of range', () => {
    const tree = new OrderStatisticTree2<number>()
    tree.insert(5)
    expect(tree.select(0)).toBeUndefined()
    expect(tree.select(2)).toBeUndefined()
  })

  it('returns undefined for empty tree', () => {
    const tree = new OrderStatisticTree2<number>()
    expect(tree.select(1)).toBeUndefined()
  })

  it('returns the k-th smallest element (1-based)', () => {
    const tree = new OrderStatisticTree2<number>()
    ;[5, 3, 7, 1, 9, 4, 6].forEach((v) => tree.insert(v))
    expect(tree.select(1)).toBe(1)
    expect(tree.select(2)).toBe(3)
    expect(tree.select(3)).toBe(4)
    expect(tree.select(4)).toBe(5)
    expect(tree.select(5)).toBe(6)
    expect(tree.select(6)).toBe(7)
    expect(tree.select(7)).toBe(9)
  })
})

// ─── min / max ───

describe('OrderStatisticTree2: min and max', () => {
  it('returns undefined for empty tree', () => {
    const tree = new OrderStatisticTree2<number>()
    expect(tree.min()).toBeUndefined()
    expect(tree.max()).toBeUndefined()
  })

  it('returns the same value for single-element tree', () => {
    const tree = new OrderStatisticTree2<number>()
    tree.insert(42)
    expect(tree.min()).toBe(42)
    expect(tree.max()).toBe(42)
  })

  it('returns min and max for populated tree', () => {
    const tree = new OrderStatisticTree2<number>()
    ;[5, 3, 7, 1, 9, 4, 6].forEach((v) => tree.insert(v))
    expect(tree.min()).toBe(1)
    expect(tree.max()).toBe(9)
  })
})

// ─── toArray ───

describe('OrderStatisticTree2: toArray', () => {
  it('returns empty array for empty tree', () => {
    const tree = new OrderStatisticTree2<number>()
    expect(tree.toArray()).toEqual([])
  })

  it('returns sorted array for populated tree', () => {
    const tree = new OrderStatisticTree2<number>()
    ;[5, 3, 7, 1, 9].forEach((v) => tree.insert(v))
    expect(tree.toArray()).toEqual([1, 3, 5, 7, 9])
  })
})

// ─── forEach ───

describe('OrderStatisticTree2: forEach', () => {
  it('does nothing on empty tree', () => {
    const tree = new OrderStatisticTree2<number>()
    let called = false
    tree.forEach(() => { called = true })
    expect(called).toBe(false)
  })

  it('iterates in sorted order', () => {
    const tree = new OrderStatisticTree2<number>()
    ;[5, 3, 7, 1].forEach((v) => tree.insert(v))
    const result: number[] = []
    tree.forEach((v) => result.push(v))
    expect(result).toEqual([1, 3, 5, 7])
  })
})

// ─── clear ───

describe('OrderStatisticTree2: clear', () => {
  it('clears the tree', () => {
    const tree = new OrderStatisticTree2<number>()
    ;[1, 2, 3].forEach((v) => tree.insert(v))
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
    expect(tree.toArray()).toEqual([])
  })

  it('allows reuse after clear', () => {
    const tree = new OrderStatisticTree2<number>()
    tree.insert(1)
    tree.clear()
    tree.insert(99)
    expect(tree.size).toBe(1)
    expect(tree.has(99)).toBe(true)
    expect(tree.min()).toBe(99)
    expect(tree.max()).toBe(99)
  })
})

// ─── rank/select consistency ───

describe('OrderStatisticTree2: rank/select consistency', () => {
  it('select(rank(x)) === x for all elements', () => {
    const tree = new OrderStatisticTree2<number>()
    ;[10, 20, 30, 40, 50, 25, 35].forEach((v) => tree.insert(v))
    ;[10, 20, 25, 30, 35, 40, 50].forEach((v) => {
      expect(tree.select(tree.rank(v))).toBe(v)
    })
  })

  it('rank(select(k)) === k for valid k', () => {
    const tree = new OrderStatisticTree2<number>()
    ;[10, 20, 30, 40, 50].forEach((v) => tree.insert(v))
    for (let k = 1; k <= 5; k++) {
      expect(tree.rank(tree.select(k)!)).toBe(k)
    }
  })
})

// ─── Delete and reinsert ───

describe('OrderStatisticTree2: delete and reinsert', () => {
  it('maintains correct rank after deletion', () => {
    const tree = new OrderStatisticTree2<number>()
    ;[5, 3, 7, 1, 9].forEach((v) => tree.insert(v))
    tree.delete(3)
    expect(tree.size).toBe(4)
    expect(tree.rank(1)).toBe(1)
    expect(tree.rank(5)).toBe(2)
    expect(tree.rank(7)).toBe(3)
    expect(tree.rank(9)).toBe(4)
  })

  it('allows reinsertion after deletion', () => {
    const tree = new OrderStatisticTree2<number>()
    tree.insert(5)
    tree.delete(5)
    expect(tree.size).toBe(0)
    tree.insert(5)
    expect(tree.size).toBe(1)
    expect(tree.has(5)).toBe(true)
  })

  it('handles many insertions and deletions', () => {
    const tree = new OrderStatisticTree2<number>()
    for (let i = 1; i <= 20; i++) tree.insert(i)
    expect(tree.size).toBe(20)
    for (let i = 1; i <= 10; i++) tree.delete(i)
    expect(tree.size).toBe(10)
    expect(tree.min()).toBe(11)
    expect(tree.max()).toBe(20)
  })
})
