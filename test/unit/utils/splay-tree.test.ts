import { describe, expect, it } from 'vitest'
import { SplayTree, SplayNode } from '../../../src/utils/splay-tree.js'

describe('SplayTree', () => {
  it('insert and get value', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(5, 'five')
    expect(tree.find(5)).toBe('five')
  })

  it('insert overwrites existing value', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(5, 'five')
    tree.insert(5, 'FIVE')
    expect(tree.find(5)).toBe('FIVE')
  })

  it('has returns true for existing key', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(5, 'five')
    expect(tree.contains(5)).toBe(true)
  })

  it('has returns false for non-existing key', () => {
    const tree = new SplayTree<number, string>()
    expect(tree.contains(5)).toBe(false)
  })

  it('get returns undefined for non-existing key', () => {
    const tree = new SplayTree<number, string>()
    expect(tree.find(5)).toBe(undefined)
  })

  it('delete returns true when key exists', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(5, 'five')
    expect(tree.delete(5)).toBe(true)
  })

  it('delete returns false when key does not exist', () => {
    const tree = new SplayTree<number, string>()
    expect(tree.delete(5)).toBe(false)
  })

  it('delete removes value from tree', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(5, 'five')
    tree.delete(5)
    expect(tree.contains(5)).toBe(false)
  })

  it('size returns zero for empty tree', () => {
    const tree = new SplayTree<number, string>()
    expect(tree.size).toBe(0)
  })

  it('size increments on insert', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(1, 'one')
    tree.insert(2, 'two')
    tree.insert(3, 'three')
    expect(tree.size).toBe(3)
  })

  it('size does not increment on duplicate insert', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(1, 'one')
    tree.insert(1, 'ONE')
    expect(tree.size).toBe(1)
  })

  it('size decrements on delete', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(1, 'one')
    tree.insert(2, 'two')
    tree.delete(1)
    expect(tree.size).toBe(1)
  })

  it('size does not decrement on delete of non-existing key', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(1, 'one')
    tree.delete(2)
    expect(tree.size).toBe(1)
  })

  it('isEmpty returns true for empty tree', () => {
    const tree = new SplayTree<number, string>()
    expect(tree.isEmpty()).toBe(true)
  })

  it('isEmpty returns false for non-empty tree', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(1, 'one')
    expect(tree.isEmpty()).toBe(false)
  })

  it('isEmpty returns true after clearing', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(1, 'one')
    tree.clear()
    expect(tree.isEmpty()).toBe(true)
  })

  it('min returns undefined for empty tree', () => {
    const tree = new SplayTree<number, string>()
    expect(tree.min).toBe(undefined)
  })

  it('min returns smallest key', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(5, 'five')
    tree.insert(3, 'three')
    tree.insert(7, 'seven')
    expect(tree.min).toBe(3)
  })

  it('max returns undefined for empty tree', () => {
    const tree = new SplayTree<number, string>()
    expect(tree.max).toBe(undefined)
  })

  it('max returns largest key', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(5, 'five')
    tree.insert(3, 'three')
    tree.insert(7, 'seven')
    expect(tree.max).toBe(7)
  })

  it('custom comparator for string keys', () => {
    const tree = new SplayTree<string, number>((a, b) => a.localeCompare(b))
    tree.insert('banana', 1)
    tree.insert('apple', 2)
    tree.insert('cherry', 3)
    expect(tree.min).toBe('apple')
    expect(tree.max).toBe('cherry')
  })

  it('forEach iterates over all entries', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(3, 'three')
    tree.insert(1, 'one')
    tree.insert(2, 'two')
    const entries: Array<{ key: number; value: string }> = []
    tree.inOrder().forEach((entry) => entries.push(entry))
    expect(entries).toEqual([
      { key: 1, value: 'one' },
      { key: 2, value: 'two' },
      { key: 3, value: 'three' }
    ])
  })

  it('inOrder returns entries in sorted order', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(3, 'three')
    tree.insert(1, 'one')
    tree.insert(2, 'two')
    expect(tree.inOrder()).toEqual([
      { key: 1, value: 'one' },
      { key: 2, value: 'two' },
      { key: 3, value: 'three' }
    ])
  })

  it('inOrder returns empty array for empty tree', () => {
    const tree = new SplayTree<number, string>()
    expect(tree.inOrder()).toEqual([])
  })

  it('clear removes all entries', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(1, 'one')
    tree.insert(2, 'two')
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.contains(1)).toBe(false)
  })

  it('getRoot returns root node', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(1, 'one')
    const root = tree.getRoot()
    expect(root).not.toBeNull()
    expect(root!.key).toBe(1)
    expect(root!.value).toBe('one')
  })

  it('getRoot returns null for empty tree', () => {
    const tree = new SplayTree<number, string>()
    expect(tree.getRoot()).toBeNull()
  })

  it('height returns zero for empty tree', () => {
    const tree = new SplayTree<number, string>()
    expect(tree.height).toBe(0)
  })

  it('height returns one for single node', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(1, 'one')
    expect(tree.height).toBe(1)
  })

  it('stress test with many inserts', () => {
    const tree = new SplayTree<number, number>()
    for (let i = 0; i < 100; i++) {
      tree.insert(i, i * 2)
    }
    expect(tree.size).toBe(100)
    expect(tree.find(50)).toBe(100)
    expect(tree.min).toBe(0)
    expect(tree.max).toBe(99)
  })

  it('stress test with many inserts and deletes', () => {
    const tree = new SplayTree<number, number>()
    for (let i = 0; i < 100; i++) {
      tree.insert(i, i)
    }
    for (let i = 0; i < 50; i++) {
      tree.delete(i * 2)
    }
    expect(tree.size).toBe(50)
  })

  it('find operation splays accessed node to root', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(1, 'one')
    tree.insert(2, 'two')
    tree.insert(3, 'three')
    tree.find(2)
    const root = tree.getRoot()
    expect(root!.key).toBe(2)
  })
})