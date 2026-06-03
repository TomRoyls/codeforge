import { describe, expect, it } from 'vitest'
import { AVLTree } from '../../src/utils/avl-tree.js'

// ─── Construction & Basics ───

describe('AVLTree basics', () => {
  it('starts empty', () => {
    const tree = new AVLTree<number, string>()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
    expect(tree.height).toBe(0)
  })

  it('inserts a single node', () => {
    const tree = new AVLTree<number, string>()
    tree.insert(1, 'a')
    expect(tree.size).toBe(1)
    expect(tree.isEmpty()).toBe(false)
    expect(tree.find(1)).toBe('a')
    expect(tree.contains(1)).toBe(true)
  })

  it('inserts multiple nodes', () => {
    const tree = new AVLTree<number, string>()
    tree.insert(5, 'e')
    tree.insert(3, 'c')
    tree.insert(7, 'g')
    expect(tree.size).toBe(3)
    expect(tree.find(3)).toBe('c')
    expect(tree.find(5)).toBe('e')
    expect(tree.find(7)).toBe('g')
  })

  it('updates value on duplicate key', () => {
    const tree = new AVLTree<number, string>()
    tree.insert(1, 'old')
    tree.insert(1, 'new')
    expect(tree.size).toBe(1)
    expect(tree.find(1)).toBe('new')
  })
})

// ─── Find & Contains ───

describe('AVLTree find', () => {
  it('returns undefined for missing key', () => {
    const tree = new AVLTree<number, string>()
    expect(tree.find(99)).toBeUndefined()
  })

  it('contains returns false for missing key', () => {
    const tree = new AVLTree<number, string>()
    expect(tree.contains(42)).toBe(false)
  })

  it('finds keys in balanced tree', () => {
    const tree = new AVLTree<number, string>()
    for (let i = 1; i <= 10; i++) tree.insert(i, `v${i}`)
    for (let i = 1; i <= 10; i++) {
      expect(tree.find(i)).toBe(`v${i}`)
    }
  })
})

// ─── Min & Max ───

describe('AVLTree min/max', () => {
  it('returns undefined min/max on empty tree', () => {
    const tree = new AVLTree<number, string>()
    expect(tree.min).toBeUndefined()
    expect(tree.max).toBeUndefined()
  })

  it('tracks min and max', () => {
    const tree = new AVLTree<number, string>()
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

describe('AVLTree traversal', () => {
  it('inOrder returns sorted entries', () => {
    const tree = new AVLTree<number, string>()
    tree.insert(5, 'e')
    tree.insert(3, 'c')
    tree.insert(7, 'g')
    tree.insert(1, 'a')
    tree.insert(9, 'i')
    const result = tree.inOrder()
    expect(result.map((e) => e.key)).toEqual([1, 3, 5, 7, 9])
    expect(result.map((e) => e.value)).toEqual(['a', 'c', 'e', 'g', 'i'])
  })

  it('inOrder returns empty for empty tree', () => {
    const tree = new AVLTree<number, string>()
    expect(tree.inOrder()).toEqual([])
  })

  it('preOrder returns root-first traversal', () => {
    const tree = new AVLTree<number, string>()
    tree.insert(2, 'b')
    tree.insert(1, 'a')
    tree.insert(3, 'c')
    const result = tree.preOrder()
    expect(result.length).toBe(3)
    expect(result[0]!.key).toBe(2)
  })
})

// ─── Delete ───

describe('AVLTree delete', () => {
  it('deletes a leaf node', () => {
    const tree = new AVLTree<number, string>()
    tree.insert(1, 'a')
    tree.insert(2, 'b')
    expect(tree.delete(2)).toBe(true)
    expect(tree.size).toBe(1)
    expect(tree.find(2)).toBeUndefined()
  })

  it('deletes root node', () => {
    const tree = new AVLTree<number, string>()
    tree.insert(5, 'e')
    expect(tree.delete(5)).toBe(true)
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('returns false for missing key', () => {
    const tree = new AVLTree<number, string>()
    tree.insert(1, 'a')
    expect(tree.delete(99)).toBe(false)
    expect(tree.size).toBe(1)
  })

  it('deletes all nodes one by one', () => {
    const tree = new AVLTree<number, string>()
    for (let i = 0; i < 10; i++) tree.insert(i, `v${i}`)
    for (let i = 0; i < 10; i++) {
      expect(tree.delete(i)).toBe(true)
    }
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('maintains order after deletions', () => {
    const tree = new AVLTree<number, string>()
    for (let i = 0; i < 10; i++) tree.insert(i, `v${i}`)
    tree.delete(3)
    tree.delete(7)
    const keys = tree.inOrder().map((e) => e.key)
    expect(keys).toEqual([0, 1, 2, 4, 5, 6, 8, 9])
  })
})

// ─── Balance ───

describe('AVLTree balance', () => {
  it('maintains height O(log n) for sequential inserts', () => {
    const tree = new AVLTree<number, number>()
    const n = 100
    for (let i = 0; i < n; i++) tree.insert(i, i)
    const maxExpected = Math.ceil(1.44 * Math.log2(n + 2))
    expect(tree.height).toBeLessThanOrEqual(maxExpected)
  })

  it('maintains height O(log n) for reverse inserts', () => {
    const tree = new AVLTree<number, number>()
    const n = 100
    for (let i = n; i >= 0; i--) tree.insert(i, i)
    const maxExpected = Math.ceil(1.44 * Math.log2(n + 2))
    expect(tree.height).toBeLessThanOrEqual(maxExpected)
  })
})

// ─── Custom Comparator ───

describe('AVLTree custom comparator', () => {
  it('works with string keys', () => {
    const tree = new AVLTree<string, number>((a, b) => a.localeCompare(b))
    tree.insert('banana', 2)
    tree.insert('apple', 1)
    tree.insert('cherry', 3)
    expect(tree.find('banana')).toBe(2)
    expect(tree.min).toBe('apple')
    expect(tree.max).toBe('cherry')
  })

  it('works with reverse comparator', () => {
    const tree = new AVLTree<number, string>((a, b) => b - a)
    tree.insert(1, 'a')
    tree.insert(2, 'b')
    tree.insert(3, 'c')
    expect(tree.min).toBe(3)
    expect(tree.max).toBe(1)
  })
})

// ─── Clear ───

describe('AVLTree clear', () => {
  it('clears the tree', () => {
    const tree = new AVLTree<number, string>()
    for (let i = 0; i < 10; i++) tree.insert(i, `v${i}`)
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
    expect(tree.height).toBe(0)
    expect(tree.inOrder()).toEqual([])
  })

  it('insert and find single value', () => {
    const tree = new AVLTree<number, number>()
    tree.insert(5, 50)
    expect(tree.find(5)).toBe(50)
  })
})
