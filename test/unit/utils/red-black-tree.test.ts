import { describe, expect, it } from 'vitest'
import { RedBlackTree } from '../../../src/utils/red-black-tree.js'

describe('RedBlackTree', () => {
  it('starts empty', () => {
    const rbt = new RedBlackTree<number, string>()
    expect(rbt.size).toBe(0)
    expect(rbt.isEmpty()).toBe(true)
  })

  it('inserts and finds a value', () => {
    const rbt = new RedBlackTree<number, string>()
    rbt.insert(5, 'five')
    expect(rbt.find(5)).toBe('five')
  })

  it('returns undefined for missing key', () => {
    const rbt = new RedBlackTree<number, string>()
    expect(rbt.find(5)).toBeUndefined()
  })

  it('contains returns boolean', () => {
    const rbt = new RedBlackTree<number, string>()
    rbt.insert(5, 'five')
    expect(rbt.contains(5)).toBe(true)
    expect(rbt.contains(10)).toBe(false)
  })

  it('overwrites value for same key', () => {
    const rbt = new RedBlackTree<number, string>()
    rbt.insert(5, 'old')
    rbt.insert(5, 'new')
    expect(rbt.find(5)).toBe('new')
    expect(rbt.size).toBe(1)
  })

  it('tracks size correctly', () => {
    const rbt = new RedBlackTree<number, string>()
    rbt.insert(1, 'a')
    rbt.insert(2, 'b')
    rbt.insert(3, 'c')
    expect(rbt.size).toBe(3)
  })

  it('min returns smallest key', () => {
    const rbt = new RedBlackTree<number, string>()
    rbt.insert(10, 'a')
    rbt.insert(5, 'b')
    rbt.insert(15, 'c')
    expect(rbt.min).toBe(5)
  })

  it('max returns largest key', () => {
    const rbt = new RedBlackTree<number, string>()
    rbt.insert(10, 'a')
    rbt.insert(5, 'b')
    rbt.insert(15, 'c')
    expect(rbt.max).toBe(15)
  })

  it('min/max undefined when empty', () => {
    const rbt = new RedBlackTree<number, string>()
    expect(rbt.min).toBeUndefined()
    expect(rbt.max).toBeUndefined()
  })

  it('deletes a key', () => {
    const rbt = new RedBlackTree<number, string>()
    rbt.insert(5, 'five')
    expect(rbt.delete(5)).toBe(true)
    expect(rbt.find(5)).toBeUndefined()
    expect(rbt.size).toBe(0)
  })

  it('delete returns false for missing key', () => {
    const rbt = new RedBlackTree<number, string>()
    expect(rbt.delete(5)).toBe(false)
  })

  it('inOrder returns sorted entries', () => {
    const rbt = new RedBlackTree<number, string>()
    rbt.insert(3, 'c')
    rbt.insert(1, 'a')
    rbt.insert(2, 'b')
    const entries = rbt.inOrder()
    expect(entries.map((e) => e.key)).toEqual([1, 2, 3])
  })

  it('clears all entries', () => {
    const rbt = new RedBlackTree<number, string>()
    rbt.insert(1, 'a')
    rbt.insert(2, 'b')
    rbt.clear()
    expect(rbt.isEmpty()).toBe(true)
    expect(rbt.size).toBe(0)
  })

  it('height is bounded by O(log n)', () => {
    const rbt = new RedBlackTree<number, number>()
    for (let i = 0; i < 100; i++) rbt.insert(i, i)
    const maxH = 2 * Math.log2(101)
    expect(rbt.height).toBeLessThanOrEqual(maxH)
  })

  it('root is always black', () => {
    const rbt = new RedBlackTree<number, string>()
    for (let i = 0; i < 20; i++) rbt.insert(i, `v${i}`)
    const root = rbt.getRoot()
    expect(root).not.toBeNull()
    expect(root!.color).toBe('black')
  })

  it('custom comparator works', () => {
    const rbt = new RedBlackTree<string, number>((a, b) => b.localeCompare(a))
    rbt.insert('a', 1)
    rbt.insert('b', 2)
    rbt.insert('c', 3)
    const entries = rbt.inOrder()
    expect(entries[0]!.key).toBe('c')
    expect(entries[2]!.key).toBe('a')
  })

  it('handles sequential inserts', () => {
    const rbt = new RedBlackTree<number, number>()
    for (let i = 0; i < 50; i++) rbt.insert(i, i * 10)
    for (let i = 0; i < 50; i++) {
      expect(rbt.find(i)).toBe(i * 10)
    }
    expect(rbt.size).toBe(50)
  })

  it('handles reverse sequential inserts', () => {
    const rbt = new RedBlackTree<number, number>()
    for (let i = 49; i >= 0; i--) rbt.insert(i, i * 10)
    for (let i = 0; i < 50; i++) {
      expect(rbt.find(i)).toBe(i * 10)
    }
  })

  it('delete maintains BST property', () => {
    const rbt = new RedBlackTree<number, string>()
    rbt.insert(5, 'a')
    rbt.insert(3, 'b')
    rbt.insert(7, 'c')
    rbt.insert(1, 'd')
    rbt.insert(9, 'e')
    rbt.delete(3)
    const entries = rbt.inOrder()
    const keys = entries.map((e) => e.key)
    for (let i = 1; i < keys.length; i++) {
      expect(keys[i]!).toBeGreaterThan(keys[i - 1]!)
    }
  })

  it('handles delete of root', () => {
    const rbt = new RedBlackTree<number, string>()
    rbt.insert(5, 'root')
    rbt.insert(3, 'left')
    rbt.insert(7, 'right')
    rbt.delete(5)
    expect(rbt.find(5)).toBeUndefined()
    expect(rbt.size).toBe(2)
    expect(rbt.contains(3)).toBe(true)
    expect(rbt.contains(7)).toBe(true)
  })

  it('handles many deletions', () => {
    const rbt = new RedBlackTree<number, number>()
    for (let i = 0; i < 20; i++) rbt.insert(i, i)
    for (let i = 0; i < 20; i += 2) rbt.delete(i)
    expect(rbt.size).toBe(10)
    for (let i = 0; i < 20; i += 2) {
      expect(rbt.contains(i)).toBe(false)
      expect(rbt.contains(i + 1)).toBe(true)
    }
  })

  it('getRoot returns null when empty', () => {
    const rbt = new RedBlackTree<number, string>()
    expect(rbt.getRoot()).toBeNull()
  })

  it('handles negative keys', () => {
    const rbt = new RedBlackTree<number, string>()
    rbt.insert(-5, 'neg')
    rbt.insert(5, 'pos')
    expect(rbt.min).toBe(-5)
    expect(rbt.max).toBe(5)
  })
})
