import { describe, it, expect } from 'vitest'
import { ShuffleTree } from '../src/core/shuffle-tree/index.js'

// ─── Insert and Has ───
describe('ShuffleTree insert and has', () => {
  it('inserts and finds elements', () => {
    const tree = new ShuffleTree<number>()
    tree.insert(5)
    tree.insert(3)
    tree.insert(7)
    expect(tree.has(5)).toBe(true)
    expect(tree.has(3)).toBe(true)
    expect(tree.has(10)).toBe(false)
  })

  it('ignores duplicate insert', () => {
    const tree = new ShuffleTree<number>()
    tree.insert(5)
    tree.insert(5)
    expect(tree.size()).toBe(1)
  })

  it('handles string values', () => {
    const tree = new ShuffleTree<string>()
    tree.insert('b')
    tree.insert('a')
    tree.insert('c')
    expect(tree.has('a')).toBe(true)
    expect(tree.toArray()).toEqual(['a', 'b', 'c'])
  })
})

// ─── Delete ───
describe('ShuffleTree delete', () => {
  it('deletes existing element', () => {
    const tree = new ShuffleTree<number>()
    tree.insert(1)
    tree.insert(2)
    tree.insert(3)
    expect(tree.delete(2)).toBe(true)
    expect(tree.has(2)).toBe(false)
    expect(tree.size()).toBe(2)
  })

  it('returns false for missing element', () => {
    const tree = new ShuffleTree<number>()
    expect(tree.delete(1)).toBe(false)
  })
})

// ─── Search / Min / Max ───
describe('ShuffleTree search, min, max', () => {
  it('search returns value', () => {
    const tree = new ShuffleTree<number>()
    tree.insert(42)
    expect(tree.search(42)).toBe(42)
    expect(tree.search(99)).toBeUndefined()
  })

  it('min and max', () => {
    const tree = new ShuffleTree<number>()
    tree.insert(5)
    tree.insert(1)
    tree.insert(10)
    expect(tree.min()).toBe(1)
    expect(tree.max()).toBe(10)
  })

  it('min and max on empty', () => {
    const tree = new ShuffleTree<number>()
    expect(tree.min()).toBeUndefined()
    expect(tree.max()).toBeUndefined()
  })
})

// ─── Size / Empty / Clear ───
describe('ShuffleTree size, empty, clear', () => {
  it('tracks size', () => {
    const tree = new ShuffleTree<number>()
    expect(tree.size()).toBe(0)
    expect(tree.isEmpty()).toBe(true)
    tree.insert(1)
    expect(tree.size()).toBe(1)
    expect(tree.isEmpty()).toBe(false)
  })

  it('clear resets tree', () => {
    const tree = new ShuffleTree<number>()
    tree.insert(1)
    tree.insert(2)
    tree.clear()
    expect(tree.size()).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })
})

// ─── toArray / forEach / Iterator ───
describe('ShuffleTree iteration', () => {
  it('toArray returns sorted', () => {
    const tree = new ShuffleTree<number>()
    tree.insert(3)
    tree.insert(1)
    tree.insert(2)
    expect(tree.toArray()).toEqual([1, 2, 3])
  })

  it('forEach iterates in order', () => {
    const tree = new ShuffleTree<number>()
    tree.insert(2)
    tree.insert(1)
    const items: number[] = []
    tree.forEach((v) => items.push(v))
    expect(items).toEqual([1, 2])
  })

  it('Symbol.iterator works', () => {
    const tree = new ShuffleTree<number>()
    tree.insert(1)
    tree.insert(2)
    expect([...tree]).toEqual([1, 2])
  })
})

// ─── Height / Clone ───
describe('ShuffleTree height and clone', () => {
  it('height returns tree height', () => {
    const tree = new ShuffleTree<number>()
    expect(tree.height()).toBe(0)
    tree.insert(1)
    expect(tree.height()).toBe(1)
  })

  it('clone produces independent copy', () => {
    const tree = new ShuffleTree<number>()
    tree.insert(1)
    tree.insert(2)
    const c = tree.clone()
    c.insert(3)
    expect(tree.size()).toBe(2)
    expect(c.size()).toBe(3)
  })
})
