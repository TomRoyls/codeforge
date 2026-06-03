import { describe, expect, it } from 'vitest'
import { BTree } from '../../src/utils/b-tree.js'

// ─── Basics ───

describe('BTree basics', () => {
  it('starts empty', () => {
    const tree = new BTree<number, string>()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('inserts a single key', () => {
    const tree = new BTree<number, string>()
    tree.insert(1, 'a')
    expect(tree.size).toBe(1)
    expect(tree.find(1)).toBe('a')
    expect(tree.contains(1)).toBe(true)
  })

  it('inserts multiple keys', () => {
    const tree = new BTree<number, string>()
    tree.insert(5, 'e')
    tree.insert(3, 'c')
    tree.insert(7, 'g')
    expect(tree.size).toBe(3)
    expect(tree.find(3)).toBe('c')
    expect(tree.find(7)).toBe('g')
  })

  it('updates value on duplicate key', () => {
    const tree = new BTree<number, string>()
    tree.insert(1, 'old')
    tree.insert(1, 'new')
    expect(tree.size).toBe(1)
    expect(tree.find(1)).toBe('new')
  })

  it('returns undefined for missing key', () => {
    const tree = new BTree<number, string>()
    expect(tree.find(99)).toBeUndefined()
    expect(tree.contains(99)).toBe(false)
  })
})

// ─── Min & Max ───

describe('BTree min/max', () => {
  it('returns undefined on empty tree', () => {
    const tree = new BTree<number, string>()
    expect(tree.min).toBeUndefined()
    expect(tree.max).toBeUndefined()
  })

  it('tracks min and max', () => {
    const tree = new BTree<number, string>()
    tree.insert(5, 'e')
    tree.insert(2, 'b')
    tree.insert(8, 'h')
    tree.insert(1, 'a')
    tree.insert(9, 'i')
    expect(tree.min).toBe(1)
    expect(tree.max).toBe(9)
  })
})

// ─── ForEach ───

describe('BTree forEach', () => {
  it('iterates in sorted order', () => {
    const tree = new BTree<number, string>()
    tree.insert(5, 'e')
    tree.insert(3, 'c')
    tree.insert(7, 'g')
    tree.insert(1, 'a')
    const keys: number[] = []
    tree.forEach((k) => keys.push(k))
    expect(keys).toEqual([1, 3, 5, 7])
  })

  it('does not call on empty tree', () => {
    const tree = new BTree<number, string>()
    let called = false
    tree.forEach(() => { called = true })
    expect(called).toBe(false)
  })
})

// ─── Delete ───

describe('BTree delete', () => {
  it('deletes an existing key', () => {
    const tree = new BTree<number, string>()
    tree.insert(1, 'a')
    tree.insert(2, 'b')
    expect(tree.delete(1)).toBe(true)
    expect(tree.size).toBe(1)
    expect(tree.find(1)).toBeUndefined()
  })

  it('returns false for missing key', () => {
    const tree = new BTree<number, string>()
    tree.insert(1, 'a')
    expect(tree.delete(99)).toBe(false)
    expect(tree.size).toBe(1)
  })

  it('deletes all keys', () => {
    const tree = new BTree<number, string>(2)
    for (let i = 0; i < 10; i++) tree.insert(i, `v${i}`)
    for (let i = 0; i < 10; i++) {
      expect(tree.delete(i)).toBe(true)
    }
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('maintains order after deletions', () => {
    const tree = new BTree<number, string>()
    for (let i = 0; i < 10; i++) tree.insert(i, `v${i}`)
    tree.delete(3)
    tree.delete(7)
    const keys: number[] = []
    tree.forEach((k) => keys.push(k))
    expect(keys).toEqual([0, 1, 2, 4, 5, 6, 8, 9])
  })
})

// ─── Order Parameter ───

describe('BTree order parameter', () => {
  it('works with order 3', () => {
    const tree = new BTree<number, string>(3)
    for (let i = 0; i < 20; i++) tree.insert(i, `v${i}`)
    expect(tree.size).toBe(20)
    for (let i = 0; i < 20; i++) {
      expect(tree.find(i)).toBe(`v${i}`)
    }
  })

  it('maintains sorted iteration with small order', () => {
    const tree = new BTree<number, string>(2)
    for (let i = 20; i >= 0; i--) tree.insert(i, `v${i}`)
    const keys: number[] = []
    tree.forEach((k) => keys.push(k))
    for (let i = 0; i <= 20; i++) {
      expect(keys[i]).toBe(i)
    }
  })
})

// ─── Custom Comparator ───

describe('BTree custom comparator', () => {
  it('works with string keys', () => {
    const tree = new BTree<string, number>(3, (a, b) => a.localeCompare(b))
    tree.insert('banana', 2)
    tree.insert('apple', 1)
    tree.insert('cherry', 3)
    expect(tree.min).toBe('apple')
    expect(tree.max).toBe('cherry')
  })
})

// ─── Clear ───

describe('BTree clear', () => {
  it('clears the tree', () => {
    const tree = new BTree<number, string>()
    for (let i = 0; i < 10; i++) tree.insert(i, `v${i}`)
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })
})

// ─── Height ───

describe('BTree height', () => {
  it('has height 0 for empty tree', () => {
    const tree = new BTree<number, string>()
    expect(tree.height).toBe(0)
  })

  it('grows slowly with many elements', () => {
    const tree = new BTree<number, number>(2)
    for (let i = 0; i < 100; i++) tree.insert(i, i)
    expect(tree.height).toBeLessThanOrEqual(8)
  })

  it('find returns inserted value', () => {
    const tree = new BTree<number, number>(2)
    tree.insert(42, 99)
    expect(tree.find(42)).toBe(99)
  })

  it('find returns undefined for missing key', () => {
    const tree = new BTree<number, number>(2)
    expect(tree.find(99)).toBeUndefined()
  })

  it('size tracks insertions', () => {
    const tree = new BTree<number, number>(2)
    tree.insert(1, 10)
    tree.insert(2, 20)
    expect(tree.size).toBe(2)
  })

  it('find returns value for existing key', () => {
    const tree = new BTree<number, number>()
    tree.insert(5, 50)
    expect(tree.find(5)).toBe(50)
  })
})
