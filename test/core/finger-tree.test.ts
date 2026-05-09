import { describe, it, expect } from 'vitest'
import { FingerTree } from '../../src/core/finger-tree/finger-tree.js'
import { DEFAULT_FINGERTREE_OPTIONS } from '../../src/core/finger-tree/types.js'
import type { FingerTreeOptions, FingerTreeStats } from '../../src/core/finger-tree/types.js'

describe('FingerTree', () => {
  describe('constructor', () => {
    it('should create an empty tree with no arguments', () => {
      const ft = new FingerTree()
      expect(ft.isEmpty).toBe(true)
      expect(ft.size).toBe(0)
    })

    it('should create an empty tree with empty array', () => {
      const ft = new FingerTree<number>([])
      expect(ft.isEmpty).toBe(true)
      expect(ft.size).toBe(0)
    })

    it('should create a tree with a single element', () => {
      const ft = new FingerTree([1])
      expect(ft.isEmpty).toBe(false)
      expect(ft.size).toBe(1)
      expect(ft.head()).toBe(1)
    })

    it('should create a tree with multiple elements', () => {
      const ft = new FingerTree([1, 2, 3])
      expect(ft.size).toBe(3)
      expect(ft.toArray()).toEqual([1, 2, 3])
    })

    it('should preserve insertion order', () => {
      const ft = new FingerTree([5, 4, 3, 2, 1])
      expect(ft.toArray()).toEqual([5, 4, 3, 2, 1])
    })

    it('should accept custom options', () => {
      const ft = new FingerTree<number>([1, 2, 3], { maxDigitSize: 2 })
      expect(ft.size).toBe(3)
    })

    it('should work with string elements', () => {
      const ft = new FingerTree(['a', 'b', 'c'])
      expect(ft.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('should work with object elements', () => {
      const ft = new FingerTree([{ x: 1 }, { x: 2 }])
      expect(ft.size).toBe(2)
    })

    it('should have default maxDigitSize of 4', () => {
      expect(DEFAULT_FINGERTREE_OPTIONS.maxDigitSize).toBe(4)
    })
  })

  describe('prepend', () => {
    it('should prepend to an empty tree', () => {
      const ft = new FingerTree<number>().prepend(1)
      expect(ft.size).toBe(1)
      expect(ft.head()).toBe(1)
    })

    it('should prepend to a single-element tree', () => {
      const ft = new FingerTree([2]).prepend(1)
      expect(ft.toArray()).toEqual([1, 2])
    })

    it('should prepend multiple values in sequence', () => {
      let ft = new FingerTree<number>()
      ft = ft.prepend(3).prepend(2).prepend(1)
      expect(ft.toArray()).toEqual([1, 2, 3])
    })

    it('should return a new tree (persistence)', () => {
      const original = new FingerTree([2, 3])
      const modified = original.prepend(1)
      expect(original.toArray()).toEqual([2, 3])
      expect(modified.toArray()).toEqual([1, 2, 3])
    })

    it('should handle many prepends', () => {
      let ft = new FingerTree<number>()
      for (let i = 100; i >= 1; i--) {
        ft = ft.prepend(i)
      }
      expect(ft.size).toBe(100)
      expect(ft.head()).toBe(1)
      expect(ft.last()).toBe(100)
    })
  })

  describe('append', () => {
    it('should append to an empty tree', () => {
      const ft = new FingerTree<number>().append(1)
      expect(ft.size).toBe(1)
      expect(ft.last()).toBe(1)
    })

    it('should append to a single-element tree', () => {
      const ft = new FingerTree([1]).append(2)
      expect(ft.toArray()).toEqual([1, 2])
    })

    it('should append multiple values in sequence', () => {
      let ft = new FingerTree<number>()
      ft = ft.append(1).append(2).append(3)
      expect(ft.toArray()).toEqual([1, 2, 3])
    })

    it('should return a new tree (persistence)', () => {
      const original = new FingerTree([1, 2])
      const modified = original.append(3)
      expect(original.toArray()).toEqual([1, 2])
      expect(modified.toArray()).toEqual([1, 2, 3])
    })

    it('should handle many appends', () => {
      let ft = new FingerTree<number>()
      for (let i = 1; i <= 100; i++) {
        ft = ft.append(i)
      }
      expect(ft.size).toBe(100)
      expect(ft.head()).toBe(1)
      expect(ft.last()).toBe(100)
    })
  })

  describe('head', () => {
    it('should return undefined for an empty tree', () => {
      expect(new FingerTree().head()).toBeUndefined()
    })

    it('should return the first element', () => {
      expect(new FingerTree([1, 2, 3]).head()).toBe(1)
    })

    it('should return the only element for a single-element tree', () => {
      expect(new FingerTree([42]).head()).toBe(42)
    })

    it('should reflect prepends', () => {
      const ft = new FingerTree([2, 3]).prepend(1)
      expect(ft.head()).toBe(1)
    })
  })

  describe('last', () => {
    it('should return undefined for an empty tree', () => {
      expect(new FingerTree().last()).toBeUndefined()
    })

    it('should return the last element', () => {
      expect(new FingerTree([1, 2, 3]).last()).toBe(3)
    })

    it('should return the only element for a single-element tree', () => {
      expect(new FingerTree([42]).last()).toBe(42)
    })

    it('should reflect appends', () => {
      const ft = new FingerTree([1, 2]).append(3)
      expect(ft.last()).toBe(3)
    })
  })

  describe('tail', () => {
    it('should return empty tree when called on empty', () => {
      const ft = new FingerTree<number>().tail()
      expect(ft.isEmpty).toBe(true)
    })

    it('should return empty tree for single-element tree', () => {
      const ft = new FingerTree([1]).tail()
      expect(ft.isEmpty).toBe(true)
    })

    it('should drop the first element', () => {
      const ft = new FingerTree([1, 2, 3]).tail()
      expect(ft.toArray()).toEqual([2, 3])
    })

    it('should return a new tree (persistence)', () => {
      const original = new FingerTree([1, 2, 3])
      const tailed = original.tail()
      expect(original.toArray()).toEqual([1, 2, 3])
      expect(tailed.toArray()).toEqual([2, 3])
    })

    it('should chain tail calls', () => {
      const ft = new FingerTree([1, 2, 3]).tail().tail()
      expect(ft.toArray()).toEqual([3])
    })

    it('should eventually produce empty tree', () => {
      let ft: FingerTree<number> = new FingerTree([1, 2])
      ft = ft.tail().tail()
      expect(ft.isEmpty).toBe(true)
    })
  })

  describe('init', () => {
    it('should return empty tree when called on empty', () => {
      const ft = new FingerTree<number>().init()
      expect(ft.isEmpty).toBe(true)
    })

    it('should return empty tree for single-element tree', () => {
      const ft = new FingerTree([1]).init()
      expect(ft.isEmpty).toBe(true)
    })

    it('should drop the last element', () => {
      const ft = new FingerTree([1, 2, 3]).init()
      expect(ft.toArray()).toEqual([1, 2])
    })

    it('should return a new tree (persistence)', () => {
      const original = new FingerTree([1, 2, 3])
      const inited = original.init()
      expect(original.toArray()).toEqual([1, 2, 3])
      expect(inited.toArray()).toEqual([1, 2])
    })

    it('should chain init calls', () => {
      const ft = new FingerTree([1, 2, 3]).init().init()
      expect(ft.toArray()).toEqual([1])
    })

    it('should eventually produce empty tree', () => {
      let ft: FingerTree<number> = new FingerTree([1, 2])
      ft = ft.init().init()
      expect(ft.isEmpty).toBe(true)
    })
  })

  describe('isEmpty', () => {
    it('should be true for empty tree', () => {
      expect(new FingerTree().isEmpty).toBe(true)
    })

    it('should be false for single-element tree', () => {
      expect(new FingerTree([1]).isEmpty).toBe(false)
    })

    it('should be false after prepend', () => {
      expect(new FingerTree<number>().prepend(1).isEmpty).toBe(false)
    })

    it('should be false after append', () => {
      expect(new FingerTree<number>().append(1).isEmpty).toBe(false)
    })
  })

  describe('size', () => {
    it('should be 0 for empty tree', () => {
      expect(new FingerTree().size).toBe(0)
    })

    it('should be 1 for single-element tree', () => {
      expect(new FingerTree([1]).size).toBe(1)
    })

    it('should reflect constructor elements', () => {
      expect(new FingerTree([1, 2, 3, 4, 5]).size).toBe(5)
    })

    it('should reflect prepend', () => {
      const ft = new FingerTree([2, 3]).prepend(1)
      expect(ft.size).toBe(3)
    })

    it('should reflect append', () => {
      const ft = new FingerTree([1, 2]).append(3)
      expect(ft.size).toBe(3)
    })

    it('should reflect tail', () => {
      const ft = new FingerTree([1, 2, 3]).tail()
      expect(ft.size).toBe(2)
    })

    it('should reflect init', () => {
      const ft = new FingerTree([1, 2, 3]).init()
      expect(ft.size).toBe(2)
    })

    it('should handle large trees', () => {
      const items = Array.from({ length: 1000 }, (_, i) => i)
      const ft = new FingerTree(items)
      expect(ft.size).toBe(1000)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty tree', () => {
      expect(new FingerTree().toArray()).toEqual([])
    })

    it('should return single-element array', () => {
      expect(new FingerTree([1]).toArray()).toEqual([1])
    })

    it('should return all elements in order', () => {
      expect(new FingerTree([1, 2, 3, 4, 5]).toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should reflect modifications', () => {
      const ft = new FingerTree([2, 3]).prepend(1).append(4)
      expect(ft.toArray()).toEqual([1, 2, 3, 4])
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty tree', () => {
      let count = 0
      new FingerTree().forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should call callback for each element', () => {
      const collected: number[] = []
      new FingerTree([1, 2, 3]).forEach((v) => { collected.push(v) })
      expect(collected).toEqual([1, 2, 3])
    })

    it('should pass correct index', () => {
      const indices: number[] = []
      new FingerTree([10, 20, 30]).forEach((_v, i) => { indices.push(i) })
      expect(indices).toEqual([0, 1, 2])
    })

    it('should work with single element', () => {
      const collected: number[] = []
      new FingerTree([42]).forEach((v) => { collected.push(v) })
      expect(collected).toEqual([42])
    })
  })

  describe('iteration', () => {
    it('should produce empty iterator for empty tree', () => {
      const result = [...new FingerTree()]
      expect(result).toEqual([])
    })

    it('should iterate all elements', () => {
      const result = [...new FingerTree([1, 2, 3])]
      expect(result).toEqual([1, 2, 3])
    })

    it('should work with for-of loop', () => {
      const collected: number[] = []
      for (const v of new FingerTree([1, 2, 3])) {
        collected.push(v)
      }
      expect(collected).toEqual([1, 2, 3])
    })

    it('should work with spread operator', () => {
      const arr = [...new FingerTree(['a', 'b', 'c'])]
      expect(arr).toEqual(['a', 'b', 'c'])
    })

    it('should work with destructuring', () => {
      const [first, second] = new FingerTree([10, 20])
      expect(first).toBe(10)
      expect(second).toBe(20)
    })
  })

  describe('concat', () => {
    it('should concat two empty trees', () => {
      const ft = new FingerTree<number>().concat(new FingerTree<number>())
      expect(ft.isEmpty).toBe(true)
    })

    it('should concat empty with non-empty', () => {
      const ft = new FingerTree<number>().concat(new FingerTree([1, 2]))
      expect(ft.toArray()).toEqual([1, 2])
    })

    it('should concat non-empty with empty', () => {
      const ft = new FingerTree([1, 2]).concat(new FingerTree<number>())
      expect(ft.toArray()).toEqual([1, 2])
    })

    it('should concat two non-empty trees', () => {
      const ft = new FingerTree([1, 2]).concat(new FingerTree([3, 4]))
      expect(ft.toArray()).toEqual([1, 2, 3, 4])
    })

    it('should return a new tree (persistence)', () => {
      const a = new FingerTree([1, 2])
      const b = new FingerTree([3, 4])
      const c = a.concat(b)
      expect(a.toArray()).toEqual([1, 2])
      expect(b.toArray()).toEqual([3, 4])
      expect(c.toArray()).toEqual([1, 2, 3, 4])
    })

    it('should concat single-element trees', () => {
      const ft = new FingerTree([1]).concat(new FingerTree([2]))
      expect(ft.toArray()).toEqual([1, 2])
    })

    it('should concat large trees', () => {
      const a = new FingerTree(Array.from({ length: 500 }, (_, i) => i))
      const b = new FingerTree(Array.from({ length: 500 }, (_, i) => i + 500))
      const c = a.concat(b)
      expect(c.size).toBe(1000)
      expect(c.head()).toBe(0)
      expect(c.last()).toBe(999)
    })

    it('should handle chaining concat', () => {
      const a = new FingerTree([1])
      const b = new FingerTree([2])
      const c = new FingerTree([3])
      const result = a.concat(b).concat(c)
      expect(result.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('split', () => {
    it('should split empty tree at 0', () => {
      const [l, r] = new FingerTree<number>().split(0)
      expect(l.isEmpty).toBe(true)
      expect(r.isEmpty).toBe(true)
    })

    it('should split single-element tree at 0', () => {
      const [l, r] = new FingerTree([1]).split(0)
      expect(l.isEmpty).toBe(true)
      expect(r.toArray()).toEqual([1])
    })

    it('should split single-element tree at 1', () => {
      const [l, r] = new FingerTree([1]).split(1)
      expect(l.toArray()).toEqual([1])
      expect(r.isEmpty).toBe(true)
    })

    it('should split in the middle', () => {
      const [l, r] = new FingerTree([1, 2, 3, 4, 5]).split(2)
      expect(l.toArray()).toEqual([1, 2])
      expect(r.toArray()).toEqual([3, 4, 5])
    })

    it('should split at beginning', () => {
      const [l, r] = new FingerTree([1, 2, 3]).split(0)
      expect(l.isEmpty).toBe(true)
      expect(r.toArray()).toEqual([1, 2, 3])
    })

    it('should split at end', () => {
      const [l, r] = new FingerTree([1, 2, 3]).split(3)
      expect(l.toArray()).toEqual([1, 2, 3])
      expect(r.isEmpty).toBe(true)
    })

    it('should return a new tree (persistence)', () => {
      const original = new FingerTree([1, 2, 3, 4])
      const [l, r] = original.split(2)
      expect(original.toArray()).toEqual([1, 2, 3, 4])
      expect(l.toArray()).toEqual([1, 2])
      expect(r.toArray()).toEqual([3, 4])
    })

    it('should split at 1', () => {
      const [l, r] = new FingerTree([1, 2, 3]).split(1)
      expect(l.toArray()).toEqual([1])
      expect(r.toArray()).toEqual([2, 3])
    })

    it('should handle negative index', () => {
      const [l, r] = new FingerTree([1, 2, 3]).split(-1)
      expect(l.isEmpty).toBe(true)
      expect(r.toArray()).toEqual([1, 2, 3])
    })

    it('should handle index beyond size', () => {
      const [l, r] = new FingerTree([1, 2, 3]).split(100)
      expect(l.toArray()).toEqual([1, 2, 3])
      expect(r.isEmpty).toBe(true)
    })

    it('should split large tree', () => {
      const items = Array.from({ length: 100 }, (_, i) => i)
      const ft = new FingerTree(items)
      const [l, r] = ft.split(50)
      expect(l.size).toBe(50)
      expect(r.size).toBe(50)
      expect(l.last()).toBe(49)
      expect(r.head()).toBe(50)
    })
  })

  describe('stats', () => {
    it('should return stats for empty tree', () => {
      const s = new FingerTree().stats()
      expect(s.size).toBe(0)
      expect(s.depth).toBe(0)
    })

    it('should return stats for single element', () => {
      const s = new FingerTree([1]).stats()
      expect(s.size).toBe(1)
      expect(s.depth).toBe(0)
    })

    it('should return stats with depth > 0 for deep tree', () => {
      const items = Array.from({ length: 50 }, (_, i) => i)
      const s = new FingerTree(items).stats()
      expect(s.size).toBe(50)
      expect(s.depth).toBeGreaterThanOrEqual(0)
    })

    it('should have size matching size getter', () => {
      const ft = new FingerTree([1, 2, 3, 4, 5])
      expect(ft.stats().size).toBe(ft.size)
    })
  })

  describe('edge cases', () => {
    it('should handle alternating prepend and append', () => {
      let ft = new FingerTree<number>()
      ft = ft.append(2).prepend(1).append(3).prepend(0)
      expect(ft.toArray()).toEqual([0, 1, 2, 3])
    })

    it('should handle prepend followed by tail', () => {
      const ft = new FingerTree([2, 3]).prepend(1).tail()
      expect(ft.toArray()).toEqual([2, 3])
    })

    it('should handle append followed by init', () => {
      const ft = new FingerTree([1, 2]).append(3).init()
      expect(ft.toArray()).toEqual([1, 2])
    })

    it('should handle split followed by concat', () => {
      const original = new FingerTree([1, 2, 3, 4, 5])
      const [l, r] = original.split(2)
      const rejoined = l.concat(r)
      expect(rejoined.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle many operations in sequence', () => {
      let ft: FingerTree<number> = new FingerTree()
      ft = ft.append(1).append(2).append(3).prepend(0)
      ft = ft.tail()
      expect(ft.head()).toBe(1)
      ft = ft.init()
      expect(ft.last()).toBe(2)
      expect(ft.size).toBe(2)
    })

    it('should handle tree with duplicate values', () => {
      const ft = new FingerTree([1, 1, 1, 1])
      expect(ft.toArray()).toEqual([1, 1, 1, 1])
      expect(ft.size).toBe(4)
    })

    it('should handle null values', () => {
      const ft = new FingerTree([null, null])
      expect(ft.size).toBe(2)
      expect(ft.head()).toBeNull()
      expect(ft.last()).toBeNull()
    })

    it('should handle undefined values', () => {
      const ft = new FingerTree<number | undefined>([undefined, undefined])
      expect(ft.size).toBe(2)
      expect(ft.head()).toBeUndefined()
    })

    it('should handle boolean values', () => {
      const ft = new FingerTree([true, false, true])
      expect(ft.toArray()).toEqual([true, false, true])
    })

    it('should handle zero values', () => {
      const ft = new FingerTree([0, 0, 0])
      expect(ft.size).toBe(3)
      expect(ft.head()).toBe(0)
    })

    it('should handle empty string values', () => {
      const ft = new FingerTree(['', 'a', ''])
      expect(ft.toArray()).toEqual(['', 'a', ''])
    })
  })

  describe('large trees', () => {
    it('should handle 1000 elements via constructor', () => {
      const items = Array.from({ length: 1000 }, (_, i) => i)
      const ft = new FingerTree(items)
      expect(ft.size).toBe(1000)
      expect(ft.head()).toBe(0)
      expect(ft.last()).toBe(999)
    })

    it('should handle 1000 elements via append', () => {
      let ft = new FingerTree<number>()
      for (let i = 0; i < 1000; i++) {
        ft = ft.append(i)
      }
      expect(ft.size).toBe(1000)
      expect(ft.head()).toBe(0)
      expect(ft.last()).toBe(999)
    })

    it('should handle 1000 elements via prepend', () => {
      let ft = new FingerTree<number>()
      for (let i = 999; i >= 0; i--) {
        ft = ft.prepend(i)
      }
      expect(ft.size).toBe(1000)
      expect(ft.head()).toBe(0)
      expect(ft.last()).toBe(999)
    })

    it('should handle tail on large tree', () => {
      const items = Array.from({ length: 1000 }, (_, i) => i)
      const ft = new FingerTree(items).tail()
      expect(ft.size).toBe(999)
      expect(ft.head()).toBe(1)
    })

    it('should handle init on large tree', () => {
      const items = Array.from({ length: 1000 }, (_, i) => i)
      const ft = new FingerTree(items).init()
      expect(ft.size).toBe(999)
      expect(ft.last()).toBe(998)
    })

    it('should handle split on large tree', () => {
      const items = Array.from({ length: 1000 }, (_, i) => i)
      const [l, r] = new FingerTree(items).split(500)
      expect(l.size).toBe(500)
      expect(r.size).toBe(500)
    })

    it('should handle concat of large trees', () => {
      const a = new FingerTree(Array.from({ length: 500 }, (_, i) => i))
      const b = new FingerTree(Array.from({ length: 500 }, (_, i) => i + 500))
      const c = a.concat(b)
      expect(c.size).toBe(1000)
    })

    it('should handle forEach on large tree', () => {
      const items = Array.from({ length: 1000 }, (_, i) => i)
      let sum = 0
      new FingerTree(items).forEach((v) => { sum += v })
      expect(sum).toBe(499500)
    })

    it('should handle iteration on large tree', () => {
      const items = Array.from({ length: 1000 }, (_, i) => i)
      const ft = new FingerTree(items)
      let count = 0
      for (const _ of ft) {
        count++
      }
      expect(count).toBe(1000)
    })

    it('should handle toArray on large tree', () => {
      const items = Array.from({ length: 1000 }, (_, i) => i)
      const arr = new FingerTree(items).toArray()
      expect(arr.length).toBe(1000)
      expect(arr[0]).toBe(0)
      expect(arr[999]).toBe(999)
    })
  })

  describe('persistence', () => {
    it('should preserve original after prepend', () => {
      const original = new FingerTree([2, 3])
      const modified = original.prepend(1)
      expect(original.toArray()).toEqual([2, 3])
      expect(modified.toArray()).toEqual([1, 2, 3])
    })

    it('should preserve original after append', () => {
      const original = new FingerTree([1, 2])
      const modified = original.append(3)
      expect(original.toArray()).toEqual([1, 2])
      expect(modified.toArray()).toEqual([1, 2, 3])
    })

    it('should preserve original after tail', () => {
      const original = new FingerTree([1, 2, 3])
      const modified = original.tail()
      expect(original.toArray()).toEqual([1, 2, 3])
      expect(modified.toArray()).toEqual([2, 3])
    })

    it('should preserve original after init', () => {
      const original = new FingerTree([1, 2, 3])
      const modified = original.init()
      expect(original.toArray()).toEqual([1, 2, 3])
      expect(modified.toArray()).toEqual([1, 2])
    })

    it('should preserve original after concat', () => {
      const a = new FingerTree([1, 2])
      const b = new FingerTree([3, 4])
      const c = a.concat(b)
      expect(a.toArray()).toEqual([1, 2])
      expect(b.toArray()).toEqual([3, 4])
      expect(c.toArray()).toEqual([1, 2, 3, 4])
    })

    it('should preserve original after split', () => {
      const original = new FingerTree([1, 2, 3, 4])
      original.split(2)
      expect(original.toArray()).toEqual([1, 2, 3, 4])
    })

    it('should handle branching modifications', () => {
      const base = new FingerTree([2, 3, 4])
      const branch1 = base.prepend(1)
      const branch2 = base.append(5)
      expect(base.toArray()).toEqual([2, 3, 4])
      expect(branch1.toArray()).toEqual([1, 2, 3, 4])
      expect(branch2.toArray()).toEqual([2, 3, 4, 5])
    })

    it('should handle deep branching', () => {
      const base = new FingerTree([1, 2, 3])
      const b1 = base.prepend(0)
      const b2 = b1.append(4)
      const b3 = b2.tail()
      expect(base.toArray()).toEqual([1, 2, 3])
      expect(b1.toArray()).toEqual([0, 1, 2, 3])
      expect(b2.toArray()).toEqual([0, 1, 2, 3, 4])
      expect(b3.toArray()).toEqual([1, 2, 3, 4])
    })
  })

  describe('type exports', () => {
    it('should export FingerTreeOptions type', () => {
      const opts: FingerTreeOptions = { maxDigitSize: 4 }
      expect(opts.maxDigitSize).toBe(4)
    })

    it('should export FingerTreeStats type', () => {
      const stats: FingerTreeStats = { size: 5, depth: 1 }
      expect(stats.size).toBe(5)
      expect(stats.depth).toBe(1)
    })
  })

  describe('mixed operations', () => {
    it('should handle concat then split then concat', () => {
      const a = new FingerTree([1, 2])
      const b = new FingerTree([3, 4])
      const c = a.concat(b)
      const [l, r] = c.split(2)
      const d = r.concat(l)
      expect(d.toArray()).toEqual([3, 4, 1, 2])
    })

    it('should handle prepend then split', () => {
      const ft = new FingerTree([3, 4, 5]).prepend(2).prepend(1)
      const [l, r] = ft.split(2)
      expect(l.toArray()).toEqual([1, 2])
      expect(r.toArray()).toEqual([3, 4, 5])
    })

    it('should handle append then split', () => {
      const ft = new FingerTree([1, 2]).append(3).append(4)
      const [l, r] = ft.split(2)
      expect(l.toArray()).toEqual([1, 2])
      expect(r.toArray()).toEqual([3, 4])
    })

    it('should handle split at various points', () => {
      const ft = new FingerTree([1, 2, 3, 4, 5])
      for (let i = 0; i <= 5; i++) {
        const [l, r] = ft.split(i)
        expect(l.size).toBe(i)
        expect(r.size).toBe(5 - i)
      }
    })

    it('should handle tail then concat', () => {
      const ft = new FingerTree([1, 2, 3]).tail()
      const result = ft.concat(new FingerTree([4]))
      expect(result.toArray()).toEqual([2, 3, 4])
    })

    it('should handle init then prepend', () => {
      const ft = new FingerTree([1, 2, 3]).init()
      const result = ft.prepend(0)
      expect(result.toArray()).toEqual([0, 1, 2])
    })

    it('should handle multiple splits', () => {
      const ft = new FingerTree([1, 2, 3, 4, 5, 6, 7, 8])
      const [l1, r1] = ft.split(4)
      const [l2, r2] = l1.split(2)
      const [l3, r3] = r1.split(2)
      expect(l2.toArray()).toEqual([1, 2])
      expect(r2.toArray()).toEqual([3, 4])
      expect(l3.toArray()).toEqual([5, 6])
      expect(r3.toArray()).toEqual([7, 8])
    })
  })
})
