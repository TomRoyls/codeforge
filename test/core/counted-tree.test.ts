import { describe, it, expect, beforeEach } from 'vitest'
import { CountedTree } from '../../src/core/counted-tree/index.js'
import type { Comparator } from '../../src/core/counted-tree/types.js'

describe('CountedTree', () => {
  let tree: CountedTree<number>

  beforeEach(() => {
    tree = new CountedTree<number>()
  })

  describe('constructor', () => {
    it('creates empty tree with no arguments', () => {
      const t = new CountedTree<number>()
      expect(t.size).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('creates tree from iterable', () => {
      const t = new CountedTree<number>([5, 3, 7, 1, 9])
      expect(t.size).toBe(5)
      expect(t.isEmpty()).toBe(false)
    })

    it('creates tree from empty iterable', () => {
      const t = new CountedTree<number>([])
      expect(t.size).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('ignores duplicate values in iterable', () => {
      const t = new CountedTree<number>([1, 1, 2, 2, 3])
      expect(t.size).toBe(3)
    })

    it('accepts custom comparator', () => {
      const reverseCmp: Comparator<number> = (a, b) => b - a
      const t = new CountedTree<number>([1, 2, 3], { comparator: reverseCmp })
      expect(t.size).toBe(3)
      expect(t.min()).toBe(3)
      expect(t.max()).toBe(1)
    })

    it('works with string values', () => {
      const t = new CountedTree<string>(['cherry', 'apple', 'banana'])
      expect(t.size).toBe(3)
      expect(t.min()).toBe('apple')
      expect(t.max()).toBe('cherry')
    })
  })

  describe('insert', () => {
    it('inserts a single value', () => {
      tree.insert(10)
      expect(tree.size).toBe(1)
      expect(tree.contains(10)).toBe(true)
    })

    it('inserts multiple values in ascending order', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.insert(4)
      tree.insert(5)
      expect(tree.size).toBe(5)
    })

    it('inserts multiple values in descending order', () => {
      tree.insert(5)
      tree.insert(4)
      tree.insert(3)
      tree.insert(2)
      tree.insert(1)
      expect(tree.size).toBe(5)
    })

    it('ignores duplicate insertions', () => {
      tree.insert(5)
      tree.insert(5)
      tree.insert(5)
      expect(tree.size).toBe(1)
    })

    it('inserts values in random order', () => {
      const values = [7, 3, 9, 1, 5, 8, 10, 2, 6, 4]
      for (const v of values) {
        tree.insert(v)
      }
      expect(tree.size).toBe(10)
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('maintains balance with many insertions', () => {
      for (let i = 0; i < 100; i++) {
        tree.insert(i)
      }
      expect(tree.size).toBe(100)
      expect(tree.min()).toBe(0)
      expect(tree.max()).toBe(99)
    })
  })

  describe('remove', () => {
    beforeEach(() => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(9)
    })

    it('removes a leaf node', () => {
      expect(tree.remove(1)).toBe(true)
      expect(tree.size).toBe(4)
      expect(tree.contains(1)).toBe(false)
    })

    it('removes a node with one child', () => {
      tree.insert(8)
      expect(tree.remove(9)).toBe(true)
      expect(tree.size).toBe(5)
      expect(tree.contains(9)).toBe(false)
      expect(tree.contains(8)).toBe(true)
    })

    it('removes the root', () => {
      expect(tree.remove(5)).toBe(true)
      expect(tree.size).toBe(4)
      expect(tree.contains(5)).toBe(false)
    })

    it('returns false for non-existent value', () => {
      expect(tree.remove(100)).toBe(false)
      expect(tree.size).toBe(5)
    })

    it('removes all elements one by one', () => {
      expect(tree.remove(5)).toBe(true)
      expect(tree.remove(3)).toBe(true)
      expect(tree.remove(7)).toBe(true)
      expect(tree.remove(1)).toBe(true)
      expect(tree.remove(9)).toBe(true)
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('does nothing when removing from empty tree', () => {
      const t = new CountedTree<number>()
      expect(t.remove(1)).toBe(false)
      expect(t.size).toBe(0)
    })
  })

  describe('contains', () => {
    beforeEach(() => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
    })

    it('returns true for existing values', () => {
      expect(tree.contains(5)).toBe(true)
      expect(tree.contains(3)).toBe(true)
      expect(tree.contains(7)).toBe(true)
    })

    it('returns false for non-existing values', () => {
      expect(tree.contains(1)).toBe(false)
      expect(tree.contains(10)).toBe(false)
      expect(tree.contains(-1)).toBe(false)
    })

    it('returns false for empty tree', () => {
      const t = new CountedTree<number>()
      expect(t.contains(1)).toBe(false)
    })
  })

  describe('rank', () => {
    beforeEach(() => {
      const values = [5, 3, 7, 1, 9, 4, 6, 8, 2, 10]
      for (const v of values) {
        tree.insert(v)
      }
    })

    it('returns 0 for the minimum element', () => {
      expect(tree.rank(1)).toBe(0)
    })

    it('returns size-1 for the maximum element', () => {
      expect(tree.rank(10)).toBe(9)
    })

    it('returns correct rank for middle element', () => {
      expect(tree.rank(5)).toBe(4)
    })

    it('returns correct rank for all elements', () => {
      for (let i = 1; i <= 10; i++) {
        expect(tree.rank(i)).toBe(i - 1)
      }
    })

    it('returns insertion point for non-existent value', () => {
      expect(tree.rank(0)).toBe(0)
      expect(tree.rank(11)).toBe(10)
      expect(tree.rank(5)).toBe(4)
    })

    it('returns 0 for empty tree', () => {
      const t = new CountedTree<number>()
      expect(t.rank(5)).toBe(0)
    })
  })

  describe('select', () => {
    beforeEach(() => {
      const values = [5, 3, 7, 1, 9, 4, 6, 8, 2, 10]
      for (const v of values) {
        tree.insert(v)
      }
    })

    it('returns the k-th smallest element', () => {
      expect(tree.select(0)).toBe(1)
      expect(tree.select(4)).toBe(5)
      expect(tree.select(9)).toBe(10)
    })

    it('returns undefined for out-of-range index', () => {
      expect(tree.select(-1)).toBeUndefined()
      expect(tree.select(10)).toBeUndefined()
      expect(tree.select(100)).toBeUndefined()
    })

    it('returns correct element for each index', () => {
      for (let i = 0; i < 10; i++) {
        expect(tree.select(i)).toBe(i + 1)
      }
    })

    it('returns undefined for empty tree', () => {
      const t = new CountedTree<number>()
      expect(t.select(0)).toBeUndefined()
    })
  })

  describe('min and max', () => {
    it('returns undefined for empty tree', () => {
      expect(tree.min()).toBeUndefined()
      expect(tree.max()).toBeUndefined()
    })

    it('returns same value for single element', () => {
      tree.insert(42)
      expect(tree.min()).toBe(42)
      expect(tree.max()).toBe(42)
    })

    it('returns correct min and max', () => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(9)
      expect(tree.min()).toBe(1)
      expect(tree.max()).toBe(9)
    })

    it('updates min and max after removal', () => {
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      tree.remove(1)
      expect(tree.min()).toBe(5)
      tree.remove(10)
      expect(tree.max()).toBe(5)
    })
  })

  describe('size and isEmpty', () => {
    it('empty tree has size 0', () => {
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('size increments on insert', () => {
      tree.insert(1)
      expect(tree.size).toBe(1)
      tree.insert(2)
      expect(tree.size).toBe(2)
    })

    it('size does not change on duplicate insert', () => {
      tree.insert(1)
      tree.insert(1)
      expect(tree.size).toBe(1)
    })

    it('size decrements on remove', () => {
      tree.insert(1)
      tree.insert(2)
      tree.remove(1)
      expect(tree.size).toBe(1)
    })

    it('size does not change on failed remove', () => {
      tree.insert(1)
      tree.remove(2)
      expect(tree.size).toBe(1)
    })
  })

  describe('clear', () => {
    it('clears the tree', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.contains(1)).toBe(false)
    })

    it('clear on already empty tree does nothing', () => {
      tree.clear()
      expect(tree.size).toBe(0)
    })

    it('tree is usable after clear', () => {
      tree.insert(1)
      tree.clear()
      tree.insert(2)
      expect(tree.size).toBe(1)
      expect(tree.contains(2)).toBe(true)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty tree', () => {
      expect(tree.toArray()).toEqual([])
    })

    it('returns sorted array for inserted values', () => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(9)
      expect(tree.toArray()).toEqual([1, 3, 5, 7, 9])
    })

    it('returns sorted array after removals', () => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.remove(3)
      expect(tree.toArray()).toEqual([5, 7])
    })
  })

  describe('toArraySorted', () => {
    it('returns same as toArray', () => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.toArraySorted()).toEqual(tree.toArray())
    })

    it('returns empty array for empty tree', () => {
      expect(tree.toArraySorted()).toEqual([])
    })
  })

  describe('predecessor', () => {
    beforeEach(() => {
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      tree.insert(7)
      tree.insert(9)
    })

    it('returns the greatest element less than value', () => {
      expect(tree.predecessor(5)).toBe(3)
      expect(tree.predecessor(9)).toBe(7)
      expect(tree.predecessor(3)).toBe(1)
    })

    it('returns undefined for minimum element', () => {
      expect(tree.predecessor(1)).toBeUndefined()
    })

    it('returns undefined for non-existent value', () => {
      expect(tree.predecessor(4)).toBeUndefined()
      expect(tree.predecessor(100)).toBeUndefined()
    })

    it('returns undefined for empty tree', () => {
      const t = new CountedTree<number>()
      expect(t.predecessor(1)).toBeUndefined()
    })
  })

  describe('successor', () => {
    beforeEach(() => {
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      tree.insert(7)
      tree.insert(9)
    })

    it('returns the smallest element greater than value', () => {
      expect(tree.successor(5)).toBe(7)
      expect(tree.successor(1)).toBe(3)
      expect(tree.successor(7)).toBe(9)
    })

    it('returns undefined for maximum element', () => {
      expect(tree.successor(9)).toBeUndefined()
    })

    it('returns undefined for non-existent value', () => {
      expect(tree.successor(4)).toBeUndefined()
      expect(tree.successor(100)).toBeUndefined()
    })

    it('returns undefined for empty tree', () => {
      const t = new CountedTree<number>()
      expect(t.successor(1)).toBeUndefined()
    })
  })

  describe('lowerBound', () => {
    beforeEach(() => {
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      tree.insert(7)
      tree.insert(9)
    })

    it('returns first element >= value when value exists', () => {
      expect(tree.lowerBound(5)).toBe(5)
      expect(tree.lowerBound(1)).toBe(1)
    })

    it('returns first element > value when value does not exist', () => {
      expect(tree.lowerBound(4)).toBe(5)
      expect(tree.lowerBound(0)).toBe(1)
    })

    it('returns undefined when all elements are less', () => {
      expect(tree.lowerBound(10)).toBeUndefined()
    })

    it('returns undefined for empty tree', () => {
      const t = new CountedTree<number>()
      expect(t.lowerBound(5)).toBeUndefined()
    })

    it('returns exact match when equal', () => {
      expect(tree.lowerBound(3)).toBe(3)
    })
  })

  describe('upperBound', () => {
    beforeEach(() => {
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      tree.insert(7)
      tree.insert(9)
    })

    it('returns first element strictly greater than value', () => {
      expect(tree.upperBound(5)).toBe(7)
      expect(tree.upperBound(1)).toBe(3)
    })

    it('returns first element when value is below minimum', () => {
      expect(tree.upperBound(0)).toBe(1)
    })

    it('returns undefined when all elements are <= value', () => {
      expect(tree.upperBound(9)).toBeUndefined()
      expect(tree.upperBound(10)).toBeUndefined()
    })

    it('returns undefined for empty tree', () => {
      const t = new CountedTree<number>()
      expect(t.upperBound(5)).toBeUndefined()
    })
  })

  describe('forEach', () => {
    it('iterates over all elements in order', () => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      const result: number[] = []
      tree.forEach((v) => result.push(v))
      expect(result).toEqual([3, 5, 7])
    })

    it('provides correct index', () => {
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      const indices: number[] = []
      tree.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('does nothing for empty tree', () => {
      let called = false
      tree.forEach(() => {
        called = true
      })
      expect(called).toBe(false)
    })

    it('iterates in sorted order after complex operations', () => {
      const values = [7, 3, 9, 1, 5, 8, 10, 2, 6, 4]
      for (const v of values) {
        tree.insert(v)
      }
      tree.remove(3)
      tree.remove(7)
      const result: number[] = []
      tree.forEach((v) => result.push(v))
      expect(result).toEqual([1, 2, 4, 5, 6, 8, 9, 10])
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      const result = [...tree]
      expect(result).toEqual([1, 2, 3])
    })

    it('works with for...of', () => {
      tree.insert(3)
      tree.insert(1)
      tree.insert(2)
      const result: number[] = []
      for (const v of tree) {
        result.push(v)
      }
      expect(result).toEqual([1, 2, 3])
    })

    it('returns empty iterator for empty tree', () => {
      const result = [...tree]
      expect(result).toEqual([])
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      const cloned = tree.clone()
      expect(cloned.size).toBe(3)
      expect(cloned.toArray()).toEqual([1, 2, 3])
    })

    it('modifications to clone do not affect original', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      const cloned = tree.clone()
      cloned.remove(2)
      expect(tree.size).toBe(3)
      expect(tree.contains(2)).toBe(true)
      expect(cloned.size).toBe(2)
      expect(cloned.contains(2)).toBe(false)
    })

    it('modifications to original do not affect clone', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      const cloned = tree.clone()
      tree.remove(1)
      expect(cloned.size).toBe(3)
      expect(cloned.contains(1)).toBe(true)
      expect(tree.size).toBe(2)
    })

    it('preserves custom comparator', () => {
      const reverseCmp: Comparator<number> = (a, b) => b - a
      const t = new CountedTree<number>([1, 2, 3], { comparator: reverseCmp })
      const cloned = t.clone()
      cloned.insert(4)
      expect(cloned.min()).toBe(4)
      expect(cloned.max()).toBe(1)
    })

    it('clone of empty tree is empty', () => {
      const cloned = tree.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })
  })

  describe('static fromArray', () => {
    it('creates tree from array', () => {
      const t = CountedTree.fromArray([5, 3, 7, 1, 9])
      expect(t.size).toBe(5)
      expect(t.toArray()).toEqual([1, 3, 5, 7, 9])
    })

    it('creates tree from empty array', () => {
      const t = CountedTree.fromArray([])
      expect(t.size).toBe(0)
    })

    it('creates tree with custom comparator', () => {
      const reverseCmp: Comparator<number> = (a, b) => b - a
      const t = CountedTree.fromArray([1, 2, 3], { comparator: reverseCmp })
      expect(t.min()).toBe(3)
    })

    it('handles duplicate values', () => {
      const t = CountedTree.fromArray([1, 2, 2, 3, 3, 3])
      expect(t.size).toBe(3)
    })
  })

  describe('count', () => {
    beforeEach(() => {
      const values = [1, 3, 5, 7, 9, 11, 13, 15]
      for (const v of values) {
        tree.insert(v)
      }
    })

    it('counts elements in a valid range', () => {
      expect(tree.count(1, 15)).toBe(8)
      expect(tree.count(3, 13)).toBe(6)
      expect(tree.count(5, 7)).toBe(2)
      expect(tree.count(3, 9)).toBe(4)
    })

    it('counts single element range', () => {
      expect(tree.count(5, 5)).toBe(1)
      expect(tree.count(1, 1)).toBe(1)
    })

    it('returns 0 for empty range (lo > hi)', () => {
      expect(tree.count(10, 5)).toBe(0)
    })

    it('counts range with non-existent boundaries', () => {
      expect(tree.count(2, 10)).toBe(4)
      expect(tree.count(0, 100)).toBe(8)
    })

    it('returns 0 for range outside tree', () => {
      expect(tree.count(20, 30)).toBe(0)
      expect(tree.count(-10, 0)).toBe(0)
    })

    it('returns 0 for empty tree', () => {
      const t = new CountedTree<number>()
      expect(t.count(1, 10)).toBe(0)
    })
  })

  describe('atIndex', () => {
    beforeEach(() => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(9)
    })

    it('returns element at given index', () => {
      expect(tree.atIndex(0)).toBe(1)
      expect(tree.atIndex(2)).toBe(5)
      expect(tree.atIndex(4)).toBe(9)
    })

    it('returns undefined for out-of-range index', () => {
      expect(tree.atIndex(-1)).toBeUndefined()
      expect(tree.atIndex(5)).toBeUndefined()
    })

    it('returns undefined for empty tree', () => {
      const t = new CountedTree<number>()
      expect(t.atIndex(0)).toBeUndefined()
    })
  })

  describe('indexOf', () => {
    beforeEach(() => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(9)
    })

    it('returns index of existing values', () => {
      expect(tree.indexOf(1)).toBe(0)
      expect(tree.indexOf(3)).toBe(1)
      expect(tree.indexOf(5)).toBe(2)
      expect(tree.indexOf(7)).toBe(3)
      expect(tree.indexOf(9)).toBe(4)
    })

    it('returns -1 for non-existent value', () => {
      expect(tree.indexOf(4)).toBe(-1)
      expect(tree.indexOf(0)).toBe(-1)
      expect(tree.indexOf(100)).toBe(-1)
    })

    it('returns -1 for empty tree', () => {
      const t = new CountedTree<number>()
      expect(t.indexOf(1)).toBe(-1)
    })
  })

  describe('custom comparator', () => {
    it('works with reverse comparator', () => {
      const reverseCmp: Comparator<number> = (a, b) => b - a
      const t = new CountedTree<number>([1, 2, 3, 4, 5], {
        comparator: reverseCmp,
      })
      expect(t.min()).toBe(5)
      expect(t.max()).toBe(1)
      expect(t.select(0)).toBe(5)
      expect(t.select(4)).toBe(1)
    })

    it('works with string comparator', () => {
      const t = new CountedTree<string>(['banana', 'apple', 'cherry'])
      expect(t.min()).toBe('apple')
      expect(t.max()).toBe('cherry')
      expect(t.rank('banana')).toBe(1)
    })

    it('works with case-insensitive string comparator', () => {
      const caseInsensitive: Comparator<string> = (a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
      const t = new CountedTree<string>(undefined, {
        comparator: caseInsensitive,
      })
      t.insert('Hello')
      t.insert('hello')
      t.insert('HELLO')
      expect(t.size).toBe(1)
    })

    it('works with object comparator', () => {
      interface Point {
        x: number
        y: number
      }
      const cmp: Comparator<Point> = (a, b) =>
        a.x !== b.x ? a.x - b.x : a.y - b.y
      const t = new CountedTree<Point>([{ x: 1, y: 2 }, { x: 0, y: 0 }, { x: 2, y: 1 }], { comparator: cmp })
      expect(t.size).toBe(3)
      expect(t.min()?.x).toBe(0)
      expect(t.max()?.x).toBe(2)
    })
  })

  describe('stress tests', () => {
    it('handles sequential insertions and maintains balance', () => {
      const t = new CountedTree<number>()
      for (let i = 0; i < 200; i++) {
        t.insert(i)
      }
      expect(t.size).toBe(200)
      expect(t.min()).toBe(0)
      expect(t.max()).toBe(199)
      for (let i = 0; i < 200; i++) {
        expect(t.contains(i)).toBe(true)
        expect(t.rank(i)).toBe(i)
        expect(t.select(i)).toBe(i)
      }
    })

    it('handles reverse sequential insertions', () => {
      const t = new CountedTree<number>()
      for (let i = 200; i >= 0; i--) {
        t.insert(i)
      }
      expect(t.size).toBe(201)
      expect(t.select(0)).toBe(0)
      expect(t.select(200)).toBe(200)
    })

    it('handles random insertions and deletions', () => {
      const t = new CountedTree<number>()
      const values = new Set<number>()
      const rng = (seed: number) => {
        let s = seed
        return () => {
          s = (s * 1103515245 + 12345) & 0x7fffffff
          return s
        }
      }
      const rand = rng(42)

      for (let i = 0; i < 100; i++) {
        const v = rand() % 500
        if (!values.has(v)) {
          values.add(v)
        }
        t.insert(v)
      }

      expect(t.size).toBe(values.size)

      const sorted = [...values].sort((a, b) => a - b)
      for (let i = 0; i < sorted.length; i++) {
        expect(t.select(i)).toBe(sorted[i])
        expect(t.indexOf(sorted[i]!)).toBe(i)
      }

      const toRemove = sorted.slice(0, Math.floor(sorted.length / 2))
      for (const v of toRemove) {
        t.remove(v)
        values.delete(v)
      }

      expect(t.size).toBe(values.size)
      const remaining = [...values].sort((a, b) => a - b)
      expect(t.toArray()).toEqual(remaining)
    })

    it('handles alternating insert and remove', () => {
      const t = new CountedTree<number>()
      for (let i = 0; i < 50; i++) {
        t.insert(i)
        expect(t.size).toBe(i + 1)
      }
      for (let i = 0; i < 50; i++) {
        t.remove(i)
        expect(t.size).toBe(49 - i)
      }
      expect(t.isEmpty()).toBe(true)
    })

    it('rank and select are inverse operations', () => {
      const t = new CountedTree<number>()
      for (let i = 0; i < 50; i++) {
        t.insert(i * 2)
      }
      for (let i = 0; i < 50; i++) {
        const val = t.select(i)
        expect(val).toBeDefined()
        expect(t.rank(val!)).toBe(i)
      }
    })

    it('count works on large tree', () => {
      const t = new CountedTree<number>()
      for (let i = 0; i < 100; i++) {
        t.insert(i)
      }
      expect(t.count(10, 20)).toBe(11)
      expect(t.count(0, 99)).toBe(100)
      expect(t.count(50, 60)).toBe(11)
    })
  })

  describe('edge cases', () => {
    it('handles negative numbers', () => {
      const t = new CountedTree<number>([-5, -3, -1, 0, 1, 3, 5])
      expect(t.size).toBe(7)
      expect(t.min()).toBe(-5)
      expect(t.max()).toBe(5)
      expect(t.rank(0)).toBe(3)
      expect(t.select(0)).toBe(-5)
    })

    it('handles floating point numbers', () => {
      const t = new CountedTree<number>([1.5, 2.7, 0.3, 3.1])
      expect(t.size).toBe(4)
      expect(t.min()).toBeCloseTo(0.3)
      expect(t.max()).toBeCloseTo(3.1)
    })

    it('handles single element', () => {
      const t = new CountedTree<number>([42])
      expect(t.size).toBe(1)
      expect(t.min()).toBe(42)
      expect(t.max()).toBe(42)
      expect(t.rank(42)).toBe(0)
      expect(t.select(0)).toBe(42)
      expect(t.contains(42)).toBe(true)
      expect(t.indexOf(42)).toBe(0)
      expect(t.predecessor(42)).toBeUndefined()
      expect(t.successor(42)).toBeUndefined()
    })

    it('handles two elements', () => {
      const t = new CountedTree<number>([1, 2])
      expect(t.predecessor(2)).toBe(1)
      expect(t.successor(1)).toBe(2)
      expect(t.count(1, 2)).toBe(2)
    })

    it('remove and re-insert same value', () => {
      tree.insert(5)
      tree.remove(5)
      expect(tree.contains(5)).toBe(false)
      tree.insert(5)
      expect(tree.contains(5)).toBe(true)
      expect(tree.size).toBe(1)
    })

    it('multiple clone chains', () => {
      tree.insert(1)
      const c1 = tree.clone()
      c1.insert(2)
      const c2 = c1.clone()
      c2.insert(3)
      expect(tree.size).toBe(1)
      expect(c1.size).toBe(2)
      expect(c2.size).toBe(3)
    })
  })

  describe('order statistic operations', () => {
    beforeEach(() => {
      for (let i = 1; i <= 20; i++) {
        tree.insert(i)
      }
    })

    it('rank and indexOf agree for all elements', () => {
      for (let i = 1; i <= 20; i++) {
        expect(tree.rank(i)).toBe(tree.indexOf(i))
      }
    })

    it('select and atIndex agree for all indices', () => {
      for (let i = 0; i < 20; i++) {
        expect(tree.select(i)).toBe(tree.atIndex(i))
      }
    })

    it('lowerBound agrees with rank', () => {
      const lb = tree.lowerBound(10)
      expect(lb).toBe(10)
      expect(tree.rank(10)).toBe(9)
    })

    it('upperBound finds next element', () => {
      const ub = tree.upperBound(10)
      expect(ub).toBe(11)
    })

    it('count with boundaries at elements', () => {
      expect(tree.count(5, 15)).toBe(11)
    })

    it('count with boundaries between elements', () => {
      expect(tree.count(5, 14)).toBe(10)
    })

    it('count with boundary outside tree', () => {
      expect(tree.count(-10, 25)).toBe(20)
    })

    it('predecessor and successor are consistent', () => {
      for (let i = 2; i < 20; i++) {
        const pred = tree.predecessor(i)
        const succ = tree.successor(pred!)
        expect(succ).toBe(i)
      }
    })
  })

  describe('additional coverage', () => {
    it('insert many then verify toArray matches sorted order', () => {
      const arr = Array.from({ length: 50 }, (_, i) => (i * 7 + 3) % 100)
      const t = new CountedTree<number>(arr)
      const unique = [...new Set(arr)].sort((a, b) => a - b)
      expect(t.toArray()).toEqual(unique)
    })

    it('forEach on single element tree', () => {
      const t = new CountedTree<number>([42])
      const result: Array<{ v: number; i: number }> = []
      t.forEach((v, i) => result.push({ v, i }))
      expect(result).toEqual([{ v: 42, i: 0 }])
    })

    it('iterator on single element tree', () => {
      const t = new CountedTree<number>([99])
      expect([...t]).toEqual([99])
    })

    it('lowerBound and upperBound on single element', () => {
      const t = new CountedTree<number>([10])
      expect(t.lowerBound(10)).toBe(10)
      expect(t.lowerBound(5)).toBe(10)
      expect(t.lowerBound(15)).toBeUndefined()
      expect(t.upperBound(10)).toBeUndefined()
      expect(t.upperBound(5)).toBe(10)
    })

    it('count on single element', () => {
      const t = new CountedTree<number>([10])
      expect(t.count(10, 10)).toBe(1)
      expect(t.count(5, 15)).toBe(1)
      expect(t.count(11, 15)).toBe(0)
    })

    it('rank of non-existent value gives insertion point', () => {
      const t = new CountedTree<number>([1, 3, 5, 7, 9])
      expect(t.rank(4)).toBe(2)
      expect(t.rank(6)).toBe(3)
      expect(t.rank(0)).toBe(0)
      expect(t.rank(10)).toBe(5)
    })

    it('select returns all elements in order for large tree', () => {
      const t = new CountedTree<number>()
      for (let i = 0; i < 50; i++) {
        t.insert(i * 3)
      }
      for (let i = 0; i < 50; i++) {
        expect(t.select(i)).toBe(i * 3)
      }
    })

    it('remove maintains AVL balance properties', () => {
      const t = new CountedTree<number>()
      for (let i = 0; i < 31; i++) {
        t.insert(i)
      }
      for (let i = 0; i < 15; i++) {
        t.remove(i)
      }
      expect(t.size).toBe(16)
      const arr = t.toArray()
      for (let i = 0; i < arr.length - 1; i++) {
        expect(arr[i]! < arr[i + 1]!).toBe(true)
      }
      for (let i = 15; i < 31; i++) {
        expect(t.contains(i)).toBe(true)
      }
    })
  })
})
