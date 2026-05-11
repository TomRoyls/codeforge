import { describe, it, expect, beforeEach } from 'vitest'
import { PlayTree } from '../../src/core/play-tree/index.js'
import type { CompareFunction, PlayTreeOptions } from '../../src/core/play-tree/index.js'

describe('PlayTree', () => {
  let tree: PlayTree<number>

  beforeEach(() => {
    tree = new PlayTree<number>()
  })

  describe('constructor', () => {
    it('creates empty tree with no arguments', () => {
      const t = new PlayTree<number>()
      expect(t.size).toBe(0)
      expect(t.isEmpty).toBe(true)
    })

    it('creates tree with empty options', () => {
      const t = new PlayTree<number>({})
      expect(t.size).toBe(0)
      expect(t.isEmpty).toBe(true)
    })

    it('accepts custom comparator', () => {
      const reverseComp: CompareFunction<number> = (a, b) => b - a
      const t = new PlayTree<number>({ comparator: reverseComp })
      t.insert(1)
      t.insert(2)
      t.insert(3)
      expect(t.toArray()).toEqual([3, 2, 1])
    })

    it('uses default comparator when none provided', () => {
      const t = new PlayTree<number>()
      t.insert(3)
      t.insert(1)
      t.insert(2)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('default comparator works with strings', () => {
      const t = new PlayTree<string>()
      t.insert('c')
      t.insert('a')
      t.insert('b')
      expect(t.toArray()).toEqual(['a', 'b', 'c'])
    })
  })

  describe('insert', () => {
    it('inserts a single value', () => {
      tree.insert(1)
      expect(tree.size).toBe(1)
      expect(tree.has(1)).toBe(true)
    })

    it('inserts multiple values', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.size).toBe(3)
      expect(tree.has(1)).toBe(true)
      expect(tree.has(2)).toBe(true)
      expect(tree.has(3)).toBe(true)
    })

    it('ignores duplicate values', () => {
      tree.insert(1)
      tree.insert(1)
      tree.insert(1)
      expect(tree.size).toBe(1)
    })

    it('inserts in reverse order', () => {
      tree.insert(3)
      tree.insert(2)
      tree.insert(1)
      expect(tree.toArray()).toEqual([1, 2, 3])
    })

    it('inserts in sorted order', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.toArray()).toEqual([1, 2, 3])
    })

    it('handles many random insertions', () => {
      const values = [5, 3, 7, 1, 4, 6, 8, 2]
      for (const v of values) {
        tree.insert(v)
      }
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    })
  })

  describe('delete', () => {
    beforeEach(() => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(4)
      tree.insert(6)
      tree.insert(8)
    })

    it('deletes a leaf node', () => {
      expect(tree.delete(1)).toBe(true)
      expect(tree.has(1)).toBe(false)
      expect(tree.size).toBe(6)
    })

    it('deletes the root node', () => {
      expect(tree.delete(5)).toBe(true)
      expect(tree.has(5)).toBe(false)
      expect(tree.size).toBe(6)
    })

    it('deletes an internal node', () => {
      expect(tree.delete(3)).toBe(true)
      expect(tree.has(3)).toBe(false)
      expect(tree.size).toBe(6)
    })

    it('returns false for non-existent value', () => {
      expect(tree.delete(99)).toBe(false)
      expect(tree.size).toBe(7)
    })

    it('returns false when tree is empty', () => {
      const t = new PlayTree<number>()
      expect(t.delete(1)).toBe(false)
    })

    it('deletes all values', () => {
      const values = [5, 3, 7, 1, 4, 6, 8]
      for (const v of values) {
        expect(tree.delete(v)).toBe(true)
      }
      expect(tree.isEmpty).toBe(true)
      expect(tree.size).toBe(0)
    })

    it('maintains order after deletions', () => {
      tree.delete(3)
      tree.delete(7)
      expect(tree.toArray()).toEqual([1, 4, 5, 6, 8])
    })
  })

  describe('has / contains', () => {
    beforeEach(() => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
    })

    it('returns true for existing value', () => {
      expect(tree.has(1)).toBe(true)
      expect(tree.has(2)).toBe(true)
      expect(tree.has(3)).toBe(true)
    })

    it('returns false for non-existent value', () => {
      expect(tree.has(99)).toBe(false)
    })

    it('returns false when tree is empty', () => {
      const t = new PlayTree<number>()
      expect(t.has(1)).toBe(false)
    })

    it('contains is alias for has', () => {
      expect(tree.contains(1)).toBe(true)
      expect(tree.contains(99)).toBe(false)
    })

    it('splays on access', () => {
      tree.has(1)
      expect(tree.has(1)).toBe(true)
      tree.has(3)
      expect(tree.has(3)).toBe(true)
    })
  })

  describe('size / isEmpty', () => {
    it('size is 0 on empty tree', () => {
      expect(tree.size).toBe(0)
    })

    it('isEmpty is true on empty tree', () => {
      expect(tree.isEmpty).toBe(true)
    })

    it('isEmpty is false after insert', () => {
      tree.insert(1)
      expect(tree.isEmpty).toBe(false)
    })

    it('size increments on insert', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.size).toBe(3)
    })

    it('size decrements on delete', () => {
      tree.insert(1)
      tree.insert(2)
      tree.delete(1)
      expect(tree.size).toBe(1)
    })

    it('size does not decrement on failed delete', () => {
      tree.insert(1)
      tree.delete(99)
      expect(tree.size).toBe(1)
    })
  })

  describe('clear', () => {
    it('clears all values', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
      expect(tree.has(1)).toBe(false)
    })

    it('clear on empty tree is no-op', () => {
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty tree', () => {
      expect(tree.toArray()).toEqual([])
    })

    it('returns sorted array', () => {
      tree.insert(3)
      tree.insert(1)
      tree.insert(2)
      expect(tree.toArray()).toEqual([1, 2, 3])
    })

    it('returns single element array', () => {
      tree.insert(42)
      expect(tree.toArray()).toEqual([42])
    })
  })

  describe('toArraySorted', () => {
    it('returns sorted array', () => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(1)
      tree.insert(4)
      expect(tree.toArraySorted()).toEqual([1, 3, 4, 5])
    })

    it('returns empty array for empty tree', () => {
      expect(tree.toArraySorted()).toEqual([])
    })
  })

  describe('clone', () => {
    it('clones an empty tree', () => {
      const cloned = tree.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty).toBe(true)
    })

    it('clones a non-empty tree', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      const cloned = tree.clone()
      expect(cloned.size).toBe(3)
      expect(cloned.toArray()).toEqual([1, 2, 3])
    })

    it('clone is independent of original', () => {
      tree.insert(1)
      tree.insert(2)
      const cloned = tree.clone()
      cloned.delete(1)
      expect(tree.has(1)).toBe(true)
      expect(cloned.has(1)).toBe(false)
    })

    it('clone preserves comparator', () => {
      const reverseComp: CompareFunction<number> = (a, b) => b - a
      const t = new PlayTree<number>({ comparator: reverseComp })
      t.insert(1)
      t.insert(2)
      t.insert(3)
      const cloned = t.clone()
      expect(cloned.toArray()).toEqual([3, 2, 1])
    })
  })

  describe('fromArray', () => {
    it('creates tree from array', () => {
      const t = PlayTree.fromArray([3, 1, 2])
      expect(t.size).toBe(3)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('creates tree from empty array', () => {
      const t = PlayTree.fromArray<number>([])
      expect(t.size).toBe(0)
    })

    it('creates tree with options', () => {
      const reverseComp: CompareFunction<number> = (a, b) => b - a
      const t = PlayTree.fromArray([1, 2, 3], { comparator: reverseComp })
      expect(t.toArray()).toEqual([3, 2, 1])
    })

    it('handles duplicate values', () => {
      const t = PlayTree.fromArray([1, 1, 2, 2, 3])
      expect(t.size).toBe(3)
    })
  })

  describe('min / max', () => {
    it('min returns undefined on empty tree', () => {
      expect(tree.min()).toBeUndefined()
    })

    it('max returns undefined on empty tree', () => {
      expect(tree.max()).toBeUndefined()
    })

    it('min returns smallest value', () => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      expect(tree.min()).toBe(1)
    })

    it('max returns largest value', () => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(9)
      expect(tree.max()).toBe(9)
    })

    it('min and max on single element', () => {
      tree.insert(42)
      expect(tree.min()).toBe(42)
      expect(tree.max()).toBe(42)
    })
  })

  describe('first / last', () => {
    it('first returns undefined on empty tree', () => {
      expect(tree.first()).toBeUndefined()
    })

    it('last returns undefined on empty tree', () => {
      expect(tree.last()).toBeUndefined()
    })

    it('first returns min', () => {
      tree.insert(3)
      tree.insert(1)
      tree.insert(2)
      expect(tree.first()).toBe(1)
    })

    it('last returns max', () => {
      tree.insert(3)
      tree.insert(1)
      tree.insert(2)
      expect(tree.last()).toBe(3)
    })
  })

  describe('count', () => {
    it('returns 0 for empty tree', () => {
      expect(tree.count()).toBe(0)
    })

    it('returns size', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.count()).toBe(3)
    })
  })

  describe('depth', () => {
    it('returns 0 for empty tree', () => {
      expect(tree.depth()).toBe(0)
    })

    it('returns 1 for single node', () => {
      tree.insert(1)
      expect(tree.depth()).toBe(1)
    })

    it('returns correct depth for balanced tree', () => {
      tree.insert(2)
      tree.insert(1)
      tree.insert(3)
      expect(tree.depth()).toBeGreaterThanOrEqual(2)
    })

    it('returns correct depth for skewed tree', () => {
      for (let i = 1; i <= 5; i++) {
        tree.insert(i)
      }
      expect(tree.depth()).toBeGreaterThanOrEqual(1)
      expect(tree.depth()).toBeLessThanOrEqual(5)
    })
  })

  describe('forEach', () => {
    it('iterates over all values in order', () => {
      tree.insert(3)
      tree.insert(1)
      tree.insert(2)
      const result: number[] = []
      tree.forEach((v) => result.push(v))
      expect(result).toEqual([1, 2, 3])
    })

    it('does not call callback on empty tree', () => {
      let called = false
      tree.forEach(() => { called = true })
      expect(called).toBe(false)
    })

    it('passes tree as second argument', () => {
      tree.insert(1)
      let received: PlayTree<number> | undefined
      tree.forEach((_v, t) => { received = t })
      expect(received).toBe(tree)
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates in-order', () => {
      tree.insert(3)
      tree.insert(1)
      tree.insert(2)
      const result = [...tree]
      expect(result).toEqual([1, 2, 3])
    })

    it('returns empty iterator for empty tree', () => {
      const result = [...tree]
      expect(result).toEqual([])
    })

    it('works with for-of', () => {
      tree.insert(2)
      tree.insert(1)
      tree.insert(3)
      const result: number[] = []
      for (const v of tree) {
        result.push(v)
      }
      expect(result).toEqual([1, 2, 3])
    })
  })

  describe('lowerBound', () => {
    beforeEach(() => {
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      tree.insert(7)
    })

    it('returns exact value when present', () => {
      expect(tree.lowerBound(3)).toBe(3)
    })

    it('returns next greater when value not present', () => {
      expect(tree.lowerBound(4)).toBe(5)
    })

    it('returns exact value at lower bound', () => {
      expect(tree.lowerBound(1)).toBe(1)
    })

    it('returns undefined when all values are smaller', () => {
      expect(tree.lowerBound(8)).toBeUndefined()
    })

    it('returns smallest value for very low input', () => {
      expect(tree.lowerBound(0)).toBe(1)
    })

    it('returns undefined on empty tree', () => {
      const t = new PlayTree<number>()
      expect(t.lowerBound(1)).toBeUndefined()
    })
  })

  describe('upperBound', () => {
    beforeEach(() => {
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      tree.insert(7)
    })

    it('returns next greater value', () => {
      expect(tree.upperBound(3)).toBe(5)
    })

    it('returns undefined when all values are smaller or equal', () => {
      expect(tree.upperBound(7)).toBeUndefined()
    })

    it('returns first element greater than value', () => {
      expect(tree.upperBound(4)).toBe(5)
    })

    it('returns undefined on empty tree', () => {
      const t = new PlayTree<number>()
      expect(t.upperBound(1)).toBeUndefined()
    })

    it('returns first value for very low input', () => {
      expect(tree.upperBound(0)).toBe(1)
    })
  })

  describe('predecessor', () => {
    beforeEach(() => {
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      tree.insert(7)
    })

    it('returns largest value smaller than input', () => {
      expect(tree.predecessor(5)).toBe(3)
    })

    it('returns predecessor for non-existent value', () => {
      expect(tree.predecessor(4)).toBe(3)
    })

    it('returns undefined when no smaller value', () => {
      expect(tree.predecessor(1)).toBeUndefined()
    })

    it('returns undefined on empty tree', () => {
      const t = new PlayTree<number>()
      expect(t.predecessor(1)).toBeUndefined()
    })

    it('returns predecessor for value greater than max', () => {
      expect(tree.predecessor(10)).toBe(7)
    })
  })

  describe('successor', () => {
    beforeEach(() => {
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      tree.insert(7)
    })

    it('returns smallest value greater than input', () => {
      expect(tree.successor(3)).toBe(5)
    })

    it('returns successor for non-existent value', () => {
      expect(tree.successor(4)).toBe(5)
    })

    it('returns undefined when no greater value', () => {
      expect(tree.successor(7)).toBeUndefined()
    })

    it('returns undefined on empty tree', () => {
      const t = new PlayTree<number>()
      expect(t.successor(1)).toBeUndefined()
    })

    it('returns successor for value smaller than min', () => {
      expect(tree.successor(0)).toBe(1)
    })
  })

  describe('rank', () => {
    beforeEach(() => {
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      tree.insert(40)
      tree.insert(50)
    })

    it('returns 0 for smallest value', () => {
      expect(tree.rank(10)).toBe(0)
    })

    it('returns correct rank for middle value', () => {
      expect(tree.rank(30)).toBe(2)
    })

    it('returns correct rank for largest value', () => {
      expect(tree.rank(50)).toBe(4)
    })

    it('returns rank for non-existent value', () => {
      expect(tree.rank(25)).toBe(2)
    })

    it('returns 0 for value smaller than min', () => {
      expect(tree.rank(5)).toBe(0)
    })

    it('returns size for value greater than max', () => {
      expect(tree.rank(100)).toBe(5)
    })

    it('returns 0 on empty tree', () => {
      const t = new PlayTree<number>()
      expect(t.rank(1)).toBe(0)
    })
  })

  describe('select', () => {
    beforeEach(() => {
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      tree.insert(40)
      tree.insert(50)
    })

    it('returns kth smallest value', () => {
      expect(tree.select(0)).toBe(10)
      expect(tree.select(1)).toBe(20)
      expect(tree.select(2)).toBe(30)
      expect(tree.select(3)).toBe(40)
      expect(tree.select(4)).toBe(50)
    })

    it('returns undefined for negative index', () => {
      expect(tree.select(-1)).toBeUndefined()
    })

    it('returns undefined for out-of-bounds index', () => {
      expect(tree.select(5)).toBeUndefined()
    })

    it('returns undefined on empty tree', () => {
      const t = new PlayTree<number>()
      expect(t.select(0)).toBeUndefined()
    })
  })

  describe('split', () => {
    beforeEach(() => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.insert(4)
      tree.insert(5)
    })

    it('splits tree at value', () => {
      const [left, right] = tree.split(3)
      expect(left.toArray()).toEqual([1, 2, 3])
      expect(right.toArray()).toEqual([4, 5])
    })

    it('splits at smaller than all values', () => {
      const [left, right] = tree.split(0)
      expect(left.toArray()).toEqual([])
      expect(right.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('splits at larger than all values', () => {
      const [left, right] = tree.split(10)
      expect(left.toArray()).toEqual([1, 2, 3, 4, 5])
      expect(right.toArray()).toEqual([])
    })

    it('splits empty tree', () => {
      const t = new PlayTree<number>()
      const [left, right] = t.split(5)
      expect(left.isEmpty).toBe(true)
      expect(right.isEmpty).toBe(true)
    })

    it('original tree is unchanged', () => {
      tree.split(3)
      expect(tree.size).toBe(5)
    })
  })

  describe('merge', () => {
    it('merges two trees', () => {
      tree.insert(1)
      tree.insert(3)
      const other = new PlayTree<number>()
      other.insert(2)
      other.insert(4)
      tree.merge(other)
      expect(tree.toArray()).toEqual([1, 2, 3, 4])
    })

    it('merges with empty tree', () => {
      tree.insert(1)
      tree.insert(2)
      const other = new PlayTree<number>()
      tree.merge(other)
      expect(tree.size).toBe(2)
    })

    it('merge into empty tree', () => {
      const other = new PlayTree<number>()
      other.insert(1)
      other.insert(2)
      tree.merge(other)
      expect(tree.toArray()).toEqual([1, 2])
    })

    it('handles overlapping values', () => {
      tree.insert(1)
      tree.insert(2)
      const other = new PlayTree<number>()
      other.insert(2)
      other.insert(3)
      tree.merge(other)
      expect(tree.toArray()).toEqual([1, 2, 3])
      expect(tree.size).toBe(3)
    })

    it('merge two empty trees', () => {
      const other = new PlayTree<number>()
      tree.merge(other)
      expect(tree.isEmpty).toBe(true)
    })
  })

  describe('rangeQuery', () => {
    beforeEach(() => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.insert(4)
      tree.insert(5)
      tree.insert(6)
      tree.insert(7)
    })

    it('returns values in range', () => {
      expect(tree.rangeQuery(2, 5)).toEqual([2, 3, 4, 5])
    })

    it('returns single value range', () => {
      expect(tree.rangeQuery(3, 3)).toEqual([3])
    })

    it('returns empty for range with no values', () => {
      expect(tree.rangeQuery(10, 20)).toEqual([])
    })

    it('returns all values for full range', () => {
      expect(tree.rangeQuery(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
    })

    it('returns partial range from start', () => {
      expect(tree.rangeQuery(1, 3)).toEqual([1, 2, 3])
    })

    it('returns partial range to end', () => {
      expect(tree.rangeQuery(5, 7)).toEqual([5, 6, 7])
    })

    it('returns empty on empty tree', () => {
      const t = new PlayTree<number>()
      expect(t.rangeQuery(1, 10)).toEqual([])
    })
  })

  describe('string values', () => {
    it('works with string values', () => {
      const t = new PlayTree<string>()
      t.insert('cherry')
      t.insert('apple')
      t.insert('banana')
      expect(t.toArray()).toEqual(['apple', 'banana', 'cherry'])
      expect(t.has('banana')).toBe(true)
      expect(t.has('grape')).toBe(false)
    })

    it('min/max with strings', () => {
      const t = new PlayTree<string>()
      t.insert('cherry')
      t.insert('apple')
      t.insert('banana')
      expect(t.min()).toBe('apple')
      expect(t.max()).toBe('cherry')
    })

    it('delete with strings', () => {
      const t = new PlayTree<string>()
      t.insert('a')
      t.insert('b')
      t.insert('c')
      expect(t.delete('b')).toBe(true)
      expect(t.toArray()).toEqual(['a', 'c'])
    })
  })

  describe('object values with custom comparator', () => {
    interface Point {
      x: number
      y: number
    }

    it('works with custom objects', () => {
      const comp: CompareFunction<Point> = (a, b) => a.x - b.x || a.y - b.y
      const t = new PlayTree<Point>({ comparator: comp })
      t.insert({ x: 3, y: 1 })
      t.insert({ x: 1, y: 2 })
      t.insert({ x: 2, y: 0 })
      const arr = t.toArray()
      expect(arr[0].x).toBe(1)
      expect(arr[1].x).toBe(2)
      expect(arr[2].x).toBe(3)
    })
  })

  describe('stress tests', () => {
    it('inserts and deletes many values', () => {
      const n = 100
      for (let i = 0; i < n; i++) {
        tree.insert(i)
      }
      expect(tree.size).toBe(n)
      expect(tree.min()).toBe(0)
      expect(tree.max()).toBe(n - 1)
      for (let i = 0; i < n; i += 2) {
        tree.delete(i)
      }
      expect(tree.size).toBe(n / 2)
      expect(tree.has(1)).toBe(true)
      expect(tree.has(0)).toBe(false)
    })

    it('handles repeated insert and delete', () => {
      for (let i = 0; i < 50; i++) {
        tree.insert(i)
      }
      for (let i = 0; i < 50; i++) {
        expect(tree.delete(i)).toBe(true)
      }
      expect(tree.isEmpty).toBe(true)
    })

    it('handles large sequential insertions', () => {
      for (let i = 0; i < 200; i++) {
        tree.insert(i)
      }
      expect(tree.size).toBe(200)
      const arr = tree.toArray()
      for (let i = 0; i < 200; i++) {
        expect(arr[i]).toBe(i)
      }
    })

    it('handles large reverse insertions', () => {
      for (let i = 199; i >= 0; i--) {
        tree.insert(i)
      }
      expect(tree.size).toBe(200)
      expect(tree.toArray()[0]).toBe(0)
      expect(tree.toArray()[199]).toBe(199)
    })
  })

  describe('edge cases', () => {
    it('handles negative numbers', () => {
      tree.insert(-5)
      tree.insert(-1)
      tree.insert(0)
      tree.insert(3)
      expect(tree.toArray()).toEqual([-5, -1, 0, 3])
    })

    it('handles floating point values', () => {
      tree.insert(1.5)
      tree.insert(0.5)
      tree.insert(2.5)
      expect(tree.toArray()).toEqual([0.5, 1.5, 2.5])
    })

    it('handles single element operations', () => {
      tree.insert(42)
      expect(tree.has(42)).toBe(true)
      expect(tree.min()).toBe(42)
      expect(tree.max()).toBe(42)
      expect(tree.first()).toBe(42)
      expect(tree.last()).toBe(42)
      expect(tree.rank(42)).toBe(0)
      expect(tree.select(0)).toBe(42)
      expect(tree.delete(42)).toBe(true)
      expect(tree.isEmpty).toBe(true)
    })

    it('insert after clear', () => {
      tree.insert(1)
      tree.insert(2)
      tree.clear()
      tree.insert(3)
      expect(tree.size).toBe(1)
      expect(tree.has(3)).toBe(true)
    })

    it('re-insert after delete', () => {
      tree.insert(1)
      tree.delete(1)
      tree.insert(1)
      expect(tree.size).toBe(1)
      expect(tree.has(1)).toBe(true)
    })
  })

  describe('type exports', () => {
    it('exports PlayTreeOptions type', () => {
      const opts: PlayTreeOptions<number> = {
        comparator: (a, b) => a - b,
      }
      const t = new PlayTree<number>(opts)
      t.insert(1)
      expect(t.size).toBe(1)
    })

    it('exports CompareFunction type', () => {
      const comp: CompareFunction<number> = (a, b) => a - b
      const t = new PlayTree<number>({ comparator: comp })
      t.insert(1)
      expect(t.size).toBe(1)
    })
  })

  describe('clone with operations', () => {
    it('clone supports further operations', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      const cloned = tree.clone()
      cloned.insert(4)
      expect(cloned.size).toBe(4)
      expect(tree.size).toBe(3)
      expect(cloned.has(4)).toBe(true)
      expect(tree.has(4)).toBe(false)
    })

    it('fromArray clone equivalence', () => {
      tree.insert(3)
      tree.insert(1)
      tree.insert(2)
      const fromArr = PlayTree.fromArray(tree.toArray())
      expect(fromArr.toArray()).toEqual(tree.toArray())
    })
  })

  describe('predecessor/successor edge cases', () => {
    beforeEach(() => {
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
    })

    it('predecessor of min is undefined', () => {
      expect(tree.predecessor(10)).toBeUndefined()
    })

    it('successor of max is undefined', () => {
      expect(tree.successor(30)).toBeUndefined()
    })

    it('predecessor between two nodes', () => {
      expect(tree.predecessor(25)).toBe(20)
    })

    it('successor between two nodes', () => {
      expect(tree.successor(15)).toBe(20)
    })

    it('predecessor larger than max returns max', () => {
      expect(tree.predecessor(100)).toBe(30)
    })

    it('successor smaller than min returns min', () => {
      expect(tree.successor(0)).toBe(10)
    })
  })

  describe('rank/select consistency', () => {
    beforeEach(() => {
      for (let i = 1; i <= 10; i++) {
        tree.insert(i * 10)
      }
    })

    it('select(rank(x)) returns x for existing values', () => {
      for (let i = 1; i <= 10; i++) {
        const r = tree.rank(i * 10)
        expect(tree.select(r)).toBe(i * 10)
      }
    })

    it('rank and select are inverse for all elements', () => {
      for (let k = 0; k < tree.size; k++) {
        const val = tree.select(k)
        expect(tree.rank(val!)).toBe(k)
      }
    })
  })

  describe('split/merge roundtrip', () => {
    it('split then merge reconstructs original', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.insert(4)
      tree.insert(5)
      const [left, right] = tree.split(3)
      const merged = new PlayTree<number>()
      merged.merge(left)
      merged.merge(right)
      expect(merged.toArray()).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('iterator and forEach consistency', () => {
    it('iterator and forEach produce same order', () => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(9)
      const iterResult = [...tree]
      const forEachResult: number[] = []
      tree.forEach((v) => forEachResult.push(v))
      expect(iterResult).toEqual(forEachResult)
    })
  })

  describe('lowerBound/upperBound consistency', () => {
    beforeEach(() => {
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      tree.insert(40)
    })

    it('lowerBound(x) <= upperBound(x) when both exist', () => {
      const lb = tree.lowerBound(20)
      const ub = tree.upperBound(20)
      expect(lb).toBe(20)
      expect(ub).toBe(30)
    })

    it('lowerBound and upperBound differ for exact match', () => {
      expect(tree.lowerBound(30)).toBe(30)
      expect(tree.upperBound(30)).toBe(40)
    })

    it('lowerBound and upperBound same for non-match', () => {
      expect(tree.lowerBound(25)).toBe(30)
      expect(tree.upperBound(25)).toBe(30)
    })
  })
})
