import { describe, it, expect } from 'vitest'
import { ThreadedTree } from '../src/core/threaded-tree/index.js'

// ─── Construction and Insertion ───

describe('ThreadedTree: construction and insertion', () => {
  it('creates an empty tree', () => {
    const tree = new ThreadedTree<number>()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('creates tree with custom comparator', () => {
    const tree = new ThreadedTree<string>({
      comparator: (a, b) => a.localeCompare(b),
    })
    tree.insert('banana')
    tree.insert('apple')
    expect(tree.toArray()).toEqual(['apple', 'banana'])
  })

  it('inserts a single value', () => {
    const tree = new ThreadedTree<number>()
    tree.insert(5)
    expect(tree.size).toBe(1)
    expect(tree.isEmpty()).toBe(false)
    expect(tree.contains(5)).toBe(true)
  })

  it('inserts multiple values maintaining BST order', () => {
    const tree = new ThreadedTree<number>()
    tree.insert(5)
    tree.insert(3)
    tree.insert(7)
    tree.insert(1)
    tree.insert(4)
    tree.insert(6)
    tree.insert(8)
    expect(tree.toArray()).toEqual([1, 3, 4, 5, 6, 7, 8])
  })

  it('ignores duplicate insertions', () => {
    const tree = new ThreadedTree<number>()
    tree.insert(5)
    tree.insert(5)
    expect(tree.size).toBe(1)
  })

  it('fromArray creates tree from array', () => {
    const tree = ThreadedTree.fromArray([5, 3, 7, 1, 4])
    expect(tree.toArray()).toEqual([1, 3, 4, 5, 7])
    expect(tree.size).toBe(5)
  })

  it('fromArray with custom comparator', () => {
    const tree = ThreadedTree.fromArray([5, 3, 7], (a, b) => b - a)
    expect(tree.toArray()).toEqual([7, 5, 3])
  })
})

// ─── Contains and Search ───

describe('ThreadedTree: contains and search', () => {
  it('contains returns true for existing values', () => {
    const tree = ThreadedTree.fromArray([5, 3, 7])
    expect(tree.contains(5)).toBe(true)
    expect(tree.contains(3)).toBe(true)
    expect(tree.contains(7)).toBe(true)
  })

  it('contains returns false for missing values', () => {
    const tree = ThreadedTree.fromArray([5, 3, 7])
    expect(tree.contains(4)).toBe(false)
    expect(tree.contains(0)).toBe(false)
    expect(tree.contains(10)).toBe(false)
  })

  it('min returns smallest value', () => {
    const tree = ThreadedTree.fromArray([5, 3, 7, 1, 4])
    expect(tree.min()).toBe(1)
  })

  it('max returns largest value', () => {
    const tree = ThreadedTree.fromArray([5, 3, 7, 1, 4])
    expect(tree.max()).toBe(7)
  })

  it('min and max return undefined for empty tree', () => {
    const tree = new ThreadedTree<number>()
    expect(tree.min()).toBeUndefined()
    expect(tree.max()).toBeUndefined()
  })

  it('first returns min, last returns max', () => {
    const tree = ThreadedTree.fromArray([10, 5, 15])
    expect(tree.first()).toBe(5)
    expect(tree.last()).toBe(15)
  })
})

// ─── Predecessor and Successor ───

describe('ThreadedTree: predecessor and successor', () => {
  const tree = ThreadedTree.fromArray([1, 3, 5, 7, 9])

  it('predecessor returns the in-order predecessor', () => {
    expect(tree.predecessor(5)).toBe(3)
    expect(tree.predecessor(3)).toBe(1)
    expect(tree.predecessor(1)).toBeUndefined()
  })

  it('successor returns the in-order successor', () => {
    expect(tree.successor(5)).toBe(7)
    expect(tree.successor(7)).toBe(9)
    expect(tree.successor(9)).toBeUndefined()
  })

  it('predecessor and successor return undefined for missing keys', () => {
    expect(tree.predecessor(4)).toBeUndefined()
    expect(tree.successor(4)).toBeUndefined()
  })
})

// ─── Removal ───

describe('ThreadedTree: removal', () => {
  it('removes a leaf node', () => {
    const tree = ThreadedTree.fromArray([5, 3, 7])
    expect(tree.remove(3)).toBe(true)
    expect(tree.contains(3)).toBe(false)
    expect(tree.size).toBe(2)
    expect(tree.toArray()).toEqual([5, 7])
  })

  it('removes a node with one child', () => {
    const tree = ThreadedTree.fromArray([5, 3, 7, 6])
    expect(tree.remove(7)).toBe(true)
    expect(tree.toArray()).toEqual([3, 5, 6])
  })

  it('removes a node with two children', () => {
    const tree = ThreadedTree.fromArray([5, 3, 7, 1, 4, 6, 8])
    expect(tree.remove(5)).toBe(true)
    expect(tree.contains(5)).toBe(false)
    expect(tree.size).toBe(6)
  })

  it('removes root when it is the only node', () => {
    const tree = ThreadedTree.fromArray([5])
    expect(tree.remove(5)).toBe(true)
    expect(tree.isEmpty()).toBe(true)
    expect(tree.size).toBe(0)
  })

  it('returns false when removing nonexistent value', () => {
    const tree = ThreadedTree.fromArray([5, 3, 7])
    expect(tree.remove(4)).toBe(false)
    expect(tree.size).toBe(3)
  })

  it('maintains correct order after multiple removals', () => {
    const tree = ThreadedTree.fromArray([5, 3, 7, 1, 4, 6, 8])
    tree.remove(1)
    tree.remove(8)
    tree.remove(5)
    const arr = tree.toArray()
    expect(arr).toEqual([3, 4, 6, 7])
  })
})

// ─── Traversal ───

describe('ThreadedTree: traversal', () => {
  it('toArray returns sorted values', () => {
    const tree = ThreadedTree.fromArray([5, 3, 7, 1, 4])
    expect(tree.toArraySorted()).toEqual([1, 3, 4, 5, 7])
  })

  it('forEach iterates in order', () => {
    const tree = ThreadedTree.fromArray([5, 3, 7])
    const collected: number[] = []
    tree.forEach(v => collected.push(v))
    expect(collected).toEqual([3, 5, 7])
  })

  it('inOrderTraversal is alias for forEach', () => {
    const tree = ThreadedTree.fromArray([3, 1, 2])
    const collected: number[] = []
    tree.inOrderTraversal(v => collected.push(v))
    expect(collected).toEqual([1, 2, 3])
  })

  it('reverseTraversal iterates in reverse order', () => {
    const tree = ThreadedTree.fromArray([5, 3, 7])
    const collected: number[] = []
    tree.reverseTraversal(v => collected.push(v))
    expect(collected).toEqual([7, 5, 3])
  })

  it('is iterable with for-of', () => {
    const tree = ThreadedTree.fromArray([3, 1, 2])
    const collected: number[] = []
    for (const v of tree) collected.push(v)
    expect(collected).toEqual([1, 2, 3])
  })

  it('forEach and reverseTraversal on empty tree do nothing', () => {
    const tree = new ThreadedTree<number>()
    const collected: number[] = []
    tree.forEach(v => collected.push(v))
    tree.reverseTraversal(v => collected.push(v))
    expect(collected).toEqual([])
  })
})

// ─── Bounds and Count ───

describe('ThreadedTree: bounds and count', () => {
  const tree = ThreadedTree.fromArray([1, 3, 5, 7, 9])

  it('lowerBound returns first element >= value', () => {
    expect(tree.lowerBound(4)).toBe(5)
    expect(tree.lowerBound(5)).toBe(5)
    expect(tree.lowerBound(0)).toBe(1)
  })

  it('lowerBound returns undefined when no element >= value', () => {
    expect(tree.lowerBound(10)).toBeUndefined()
  })

  it('upperBound returns first element > value', () => {
    expect(tree.upperBound(5)).toBe(7)
    expect(tree.upperBound(4)).toBe(5)
  })

  it('upperBound returns undefined when no element > value', () => {
    expect(tree.upperBound(9)).toBeUndefined()
  })

  it('count returns number of elements in range', () => {
    expect(tree.count(1, 9)).toBe(5)
    expect(tree.count(3, 7)).toBe(3)
    expect(tree.count(4, 6)).toBe(1)
    expect(tree.count(10, 20)).toBe(0)
  })

  it('count returns 0 for empty tree', () => {
    const empty = new ThreadedTree<number>()
    expect(empty.count(1, 10)).toBe(0)
  })
})

// ─── Clone and Clear ───

describe('ThreadedTree: clone and clear', () => {
  it('clone creates independent copy', () => {
    const tree = ThreadedTree.fromArray([5, 3, 7])
    const cloned = tree.clone()
    tree.insert(10)
    expect(cloned.contains(10)).toBe(false)
    expect(tree.contains(10)).toBe(true)
  })

  it('clear empties the tree', () => {
    const tree = ThreadedTree.fromArray([5, 3, 7])
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
    expect(tree.toArray()).toEqual([])
  })
})
