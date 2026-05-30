import { describe, it, expect } from 'vitest'
import { RedBlackTree } from '../src/utils/red-black-tree.js'

describe('RedBlackTree', () => {
  it('creates empty tree', () => {
    const tree = new RedBlackTree<number, string>()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
    expect(tree.find(1)).toBeUndefined()
  })

  it('creates empty tree with custom comparator', () => {
    const tree = new RedBlackTree<string, number>((a, b) => a.localeCompare(b))
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('inserts single key-value pair', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(5, 'five')
    expect(tree.size).toBe(1)
    expect(tree.find(5)).toBe('five')
    expect(tree.isEmpty()).toBe(false)
  })

  it('inserts multiple key-value pairs', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(3, 'three')
    tree.insert(7, 'seven')
    tree.insert(1, 'one')
    expect(tree.size).toBe(3)
    expect(tree.find(3)).toBe('three')
    expect(tree.find(7)).toBe('seven')
    expect(tree.find(1)).toBe('one')
  })

  it('overwrites existing key', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(5, 'five')
    tree.insert(5, 'FIVE')
    expect(tree.size).toBe(1)
    expect(tree.find(5)).toBe('FIVE')
  })

  it('finds existing key', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(10, 'ten')
    expect(tree.find(10)).toBe('ten')
  })

  it('returns undefined for non-existent key', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(10, 'ten')
    expect(tree.find(99)).toBeUndefined()
  })

  it('contains returns true for existing key', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(5, 'five')
    expect(tree.contains(5)).toBe(true)
  })

  it('contains returns false for non-existent key', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(5, 'five')
    expect(tree.contains(99)).toBe(false)
  })

  it('returns min key', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(5, 'five')
    tree.insert(3, 'three')
    tree.insert(7, 'seven')
    expect(tree.min).toBe(3)
  })

  it('returns max key', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(5, 'five')
    tree.insert(3, 'three')
    tree.insert(7, 'seven')
    expect(tree.max).toBe(7)
  })

  it('returns undefined for min on empty tree', () => {
    const tree = new RedBlackTree<number, string>()
    expect(tree.min).toBeUndefined()
  })

  it('returns undefined for max on empty tree', () => {
    const tree = new RedBlackTree<number, string>()
    expect(tree.max).toBeUndefined()
  })

  it('inOrder returns sorted traversal', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(5, 'five')
    tree.insert(2, 'two')
    tree.insert(8, 'eight')
    tree.insert(1, 'one')
    const result = tree.inOrder()
    expect(result).toEqual([
      { key: 1, value: 'one' },
      { key: 2, value: 'two' },
      { key: 5, value: 'five' },
      { key: 8, value: 'eight' }
    ])
  })

  it('inOrder returns empty array for empty tree', () => {
    const tree = new RedBlackTree<number, string>()
    expect(tree.inOrder()).toEqual([])
  })

  it('clear resets the tree', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(5, 'five')
    tree.insert(10, 'ten')
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
    expect(tree.find(5)).toBeUndefined()
    expect(tree.min).toBeUndefined()
    expect(tree.max).toBeUndefined()
  })

  it('deletes existing key', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(5, 'five')
    tree.insert(10, 'ten')
    const result = tree.delete(5)
    expect(result).toBe(true)
    expect(tree.size).toBe(1)
    expect(tree.find(5)).toBeUndefined()
  })

  it('deletes non-existent key returns false', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(5, 'five')
    const result = tree.delete(99)
    expect(result).toBe(false)
    expect(tree.size).toBe(1)
  })

  it('custom comparator for strings', () => {
    const tree = new RedBlackTree<string, number>((a, b) => a.localeCompare(b))
    tree.insert('zebra', 3)
    tree.insert('apple', 1)
    tree.insert('banana', 2)
    expect(tree.min).toBe('apple')
    expect(tree.max).toBe('zebra')
    expect(tree.find('banana')).toBe(2)
  })

  it('custom comparator for reverse order', () => {
    const tree = new RedBlackTree<number, string>((a, b) => b - a)
    tree.insert(1, 'one')
    tree.insert(3, 'three')
    tree.insert(2, 'two')
    const result = tree.inOrder()
    expect(result).toEqual([
      { key: 3, value: 'three' },
      { key: 2, value: 'two' },
      { key: 1, value: 'one' }
    ])
  })

  it('size tracks correctly after multiple operations', () => {
    const tree = new RedBlackTree<number, string>()
    expect(tree.size).toBe(0)
    tree.insert(1, 'one')
    expect(tree.size).toBe(1)
    tree.insert(2, 'two')
    expect(tree.size).toBe(2)
    tree.insert(1, 'ONE')
    expect(tree.size).toBe(2)
    tree.delete(2)
    expect(tree.size).toBe(1)
    tree.clear()
    expect(tree.size).toBe(0)
  })

  it('getRoot returns null for empty tree', () => {
    const tree = new RedBlackTree<number, string>()
    expect(tree.getRoot()).toBe(null)
  })

  it('getRoot returns root node for non-empty tree', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(5, 'five')
    const root = tree.getRoot()
    expect(root).not.toBe(null)
    expect(root.key).toBe(5)
    expect(root.value).toBe('five')
  })

  it('sequential insertions maintain balance', () => {
    const tree = new RedBlackTree<number, string>()
    for (let i = 1; i <= 1000; i++) {
      tree.insert(i, `value${i}`)
    }
    expect(tree.size).toBe(1000)
    const height = tree.height
    const maxHeight = Math.floor(2 * Math.log2(1000 + 1))
    expect(height).toBeLessThanOrEqual(maxHeight)
  })

  it('reverse sequential insertions maintain balance', () => {
    const tree = new RedBlackTree<number, string>()
    for (let i = 1000; i >= 1; i--) {
      tree.insert(i, `value${i}`)
    }
    expect(tree.size).toBe(1000)
    const height = tree.height
    const maxHeight = Math.floor(2 * Math.log2(1000 + 1))
    expect(height).toBeLessThanOrEqual(maxHeight)
  })

  it('height remains logarithmic with random insertions', () => {
    const tree = new RedBlackTree<number, string>()
    const keys = Array.from({ length: 500 }, () => Math.floor(Math.random() * 10000))
    keys.forEach((key) => tree.insert(key, `value${key}`))
    expect(tree.size).toBeGreaterThan(0)
    const height = tree.height
    const maxHeight = Math.floor(2 * Math.log2(tree.size + 1))
    expect(height).toBeLessThanOrEqual(maxHeight)
  })

  it('handles negative numbers', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(-5, 'negative five')
    tree.insert(-1, 'negative one')
    tree.insert(0, 'zero')
    expect(tree.min).toBe(-5)
    expect(tree.max).toBe(0)
  })

  it('handles floating point numbers', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(1.5, 'one point five')
    tree.insert(0.5, 'zero point five')
    tree.insert(2.5, 'two point five')
    expect(tree.min).toBe(0.5)
    expect(tree.max).toBe(2.5)
  })

  it('delete maintains tree balance', () => {
    const tree = new RedBlackTree<number, string>()
    for (let i = 1; i <= 100; i++) {
      tree.insert(i, `value${i}`)
    }
    for (let i = 1; i <= 50; i++) {
      tree.delete(i)
    }
    expect(tree.size).toBe(50)
    const result = tree.inOrder()
    expect(result.length).toBe(50)
    for (let i = 0; i < result.length; i++) {
      expect(result[i].key).toBe(i + 51)
    }
  })

  it('insert and delete root node', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(5, 'five')
    tree.insert(3, 'three')
    tree.insert(7, 'seven')
    tree.delete(5)
    expect(tree.size).toBe(2)
    expect(tree.find(5)).toBeUndefined()
    expect(tree.find(3)).toBe('three')
    expect(tree.find(7)).toBe('seven')
  })
})