import { describe, it, expect } from 'vitest'
import { ConcTree } from '../../src/core/conc-tree/index.js'

describe('ConcTree', () => {
  describe('constructor', () => {
    it('creates empty tree', () => {
      const t = new ConcTree<number>()
      expect(t.size).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('creates empty tree for strings', () => {
      const t = new ConcTree<string>()
      expect(t.size).toBe(0)
      expect(t.toArray()).toEqual([])
    })

    it('creates empty tree for objects', () => {
      const t = new ConcTree<{ x: number }>()
      expect(t.isEmpty()).toBe(true)
    })
  })

  describe('append', () => {
    it('appends single element', () => {
      const t = new ConcTree<number>()
      t.append(1)
      expect(t.size).toBe(1)
      expect(t.isEmpty()).toBe(false)
    })

    it('appends multiple elements in order', () => {
      const t = new ConcTree<number>()
      t.append(1)
      t.append(2)
      t.append(3)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('appends to create correct size', () => {
      const t = new ConcTree<number>()
      for (let i = 0; i < 10; i++) t.append(i)
      expect(t.size).toBe(10)
    })

    it('appends strings', () => {
      const t = new ConcTree<string>()
      t.append('a')
      t.append('b')
      t.append('c')
      expect(t.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('maintains order after many appends', () => {
      const t = new ConcTree<number>()
      for (let i = 0; i < 50; i++) t.append(i)
      expect(t.toArray()).toEqual(Array.from({ length: 50 }, (_, i) => i))
    })

    it('returns undefined for out-of-bounds get', () => {
      const t = new ConcTree<number>()
      t.append(1)
      expect(t.get(-1)).toBeUndefined()
      expect(t.get(1)).toBeUndefined()
    })

    it('appends after clear', () => {
      const t = new ConcTree<number>()
      t.append(1)
      t.clear()
      t.append(2)
      expect(t.toArray()).toEqual([2])
    })

    it('appends duplicate values', () => {
      const t = new ConcTree<number>()
      t.append(5)
      t.append(5)
      t.append(5)
      expect(t.toArray()).toEqual([5, 5, 5])
    })
  })

  describe('prepend', () => {
    it('prepends single element', () => {
      const t = new ConcTree<number>()
      t.prepend(1)
      expect(t.size).toBe(1)
      expect(t.get(0)).toBe(1)
    })

    it('prepends multiple elements in reverse order', () => {
      const t = new ConcTree<number>()
      t.prepend(3)
      t.prepend(2)
      t.prepend(1)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('prepends and appends mixed', () => {
      const t = new ConcTree<number>()
      t.append(2)
      t.prepend(1)
      t.append(3)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('prepends to empty tree', () => {
      const t = new ConcTree<number>()
      t.prepend(42)
      expect(t.size).toBe(1)
      expect(t.get(0)).toBe(42)
    })

    it('prepends many elements', () => {
      const t = new ConcTree<number>()
      for (let i = 49; i >= 0; i--) t.prepend(i)
      expect(t.toArray()).toEqual(Array.from({ length: 50 }, (_, i) => i))
    })

    it('prepend preserves existing elements', () => {
      const t = new ConcTree<number>()
      t.append(2)
      t.append(3)
      t.prepend(1)
      expect(t.get(0)).toBe(1)
      expect(t.get(1)).toBe(2)
      expect(t.get(2)).toBe(3)
    })

    it('prepend after clear', () => {
      const t = new ConcTree<number>()
      t.append(1)
      t.clear()
      t.prepend(2)
      expect(t.toArray()).toEqual([2])
    })

    it('prepend strings', () => {
      const t = new ConcTree<string>()
      t.prepend('c')
      t.prepend('b')
      t.prepend('a')
      expect(t.toArray()).toEqual(['a', 'b', 'c'])
    })
  })

  describe('concat', () => {
    it('concats two non-empty trees', () => {
      const t1 = ConcTree.from([1, 2])
      const t2 = ConcTree.from([3, 4])
      t1.concat(t2)
      expect(t1.toArray()).toEqual([1, 2, 3, 4])
    })

    it('concats with empty tree on right', () => {
      const t1 = ConcTree.from([1, 2])
      const t2 = new ConcTree<number>()
      t1.concat(t2)
      expect(t1.toArray()).toEqual([1, 2])
    })

    it('concats with empty tree on left', () => {
      const t1 = new ConcTree<number>()
      const t2 = ConcTree.from([1, 2])
      t1.concat(t2)
      expect(t1.toArray()).toEqual([1, 2])
    })

    it('concats two empty trees', () => {
      const t1 = new ConcTree<number>()
      const t2 = new ConcTree<number>()
      t1.concat(t2)
      expect(t1.isEmpty()).toBe(true)
    })

    it('concats preserves order', () => {
      const t1 = ConcTree.from([1, 3, 5])
      const t2 = ConcTree.from([2, 4, 6])
      t1.concat(t2)
      expect(t1.toArray()).toEqual([1, 3, 5, 2, 4, 6])
    })

    it('concats updates size', () => {
      const t1 = ConcTree.from([1, 2])
      const t2 = ConcTree.from([3, 4])
      t1.concat(t2)
      expect(t1.size).toBe(4)
    })

    it('concats multiple times', () => {
      const t = ConcTree.from([1])
      t.concat(ConcTree.from([2]))
      t.concat(ConcTree.from([3]))
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('concats large trees', () => {
      const t1 = ConcTree.from(Array.from({ length: 50 }, (_, i) => i))
      const t2 = ConcTree.from(Array.from({ length: 50 }, (_, i) => i + 50))
      t1.concat(t2)
      expect(t1.size).toBe(100)
      expect(t1.toArray()).toEqual(Array.from({ length: 100 }, (_, i) => i))
    })
  })

  describe('get', () => {
    it('returns undefined on empty tree', () => {
      const t = new ConcTree<number>()
      expect(t.get(0)).toBeUndefined()
    })

    it('returns element at index', () => {
      const t = ConcTree.from([10, 20, 30])
      expect(t.get(0)).toBe(10)
      expect(t.get(1)).toBe(20)
      expect(t.get(2)).toBe(30)
    })

    it('returns undefined for negative index', () => {
      const t = ConcTree.from([1, 2, 3])
      expect(t.get(-1)).toBeUndefined()
    })

    it('returns undefined for out of bounds', () => {
      const t = ConcTree.from([1, 2, 3])
      expect(t.get(3)).toBeUndefined()
      expect(t.get(100)).toBeUndefined()
    })

    it('returns first element', () => {
      const t = ConcTree.from([42, 1, 2])
      expect(t.get(0)).toBe(42)
    })

    it('returns last element', () => {
      const t = ConcTree.from([1, 2, 99])
      expect(t.get(2)).toBe(99)
    })

    it('works with strings', () => {
      const t = ConcTree.from(['a', 'b', 'c'])
      expect(t.get(1)).toBe('b')
    })

    it('works after many appends', () => {
      const t = new ConcTree<number>()
      for (let i = 0; i < 100; i++) t.append(i)
      expect(t.get(0)).toBe(0)
      expect(t.get(50)).toBe(50)
      expect(t.get(99)).toBe(99)
    })
  })

  describe('update', () => {
    it('updates element at index', () => {
      const t = ConcTree.from([1, 2, 3])
      t.update(1, 99)
      expect(t.toArray()).toEqual([1, 99, 3])
    })

    it('updates first element', () => {
      const t = ConcTree.from([1, 2, 3])
      t.update(0, 42)
      expect(t.get(0)).toBe(42)
    })

    it('updates last element', () => {
      const t = ConcTree.from([1, 2, 3])
      t.update(2, 42)
      expect(t.get(2)).toBe(42)
    })

    it('does nothing on empty tree', () => {
      const t = new ConcTree<number>()
      t.update(0, 1)
      expect(t.isEmpty()).toBe(true)
    })

    it('does nothing for out of bounds', () => {
      const t = ConcTree.from([1, 2, 3])
      t.update(-1, 99)
      t.update(3, 99)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('preserves other elements', () => {
      const t = ConcTree.from([1, 2, 3, 4, 5])
      t.update(2, 99)
      expect(t.toArray()).toEqual([1, 2, 99, 4, 5])
    })

    it('updates same index twice', () => {
      const t = ConcTree.from([1, 2, 3])
      t.update(1, 10)
      t.update(1, 20)
      expect(t.get(1)).toBe(20)
    })

    it('updates with strings', () => {
      const t = ConcTree.from(['a', 'b', 'c'])
      t.update(1, 'x')
      expect(t.toArray()).toEqual(['a', 'x', 'c'])
    })
  })

  describe('split', () => {
    it('splits at beginning', () => {
      const t = ConcTree.from([1, 2, 3])
      const [left, right] = t.split(0)
      expect(left.toArray()).toEqual([])
      expect(right.toArray()).toEqual([1, 2, 3])
    })

    it('splits at end', () => {
      const t = ConcTree.from([1, 2, 3])
      const [left, right] = t.split(3)
      expect(left.toArray()).toEqual([1, 2, 3])
      expect(right.toArray()).toEqual([])
    })

    it('splits in middle', () => {
      const t = ConcTree.from([1, 2, 3, 4, 5])
      const [left, right] = t.split(2)
      expect(left.toArray()).toEqual([1, 2])
      expect(right.toArray()).toEqual([3, 4, 5])
    })

    it('splits at one', () => {
      const t = ConcTree.from([1, 2, 3])
      const [left, right] = t.split(1)
      expect(left.toArray()).toEqual([1])
      expect(right.toArray()).toEqual([2, 3])
    })

    it('splits empty tree', () => {
      const t = new ConcTree<number>()
      const [left, right] = t.split(0)
      expect(left.isEmpty()).toBe(true)
      expect(right.isEmpty()).toBe(true)
    })

    it('splits single element at zero', () => {
      const t = ConcTree.from([42])
      const [left, right] = t.split(0)
      expect(left.toArray()).toEqual([])
      expect(right.toArray()).toEqual([42])
    })

    it('splits single element at one', () => {
      const t = ConcTree.from([42])
      const [left, right] = t.split(1)
      expect(left.toArray()).toEqual([42])
      expect(right.toArray()).toEqual([])
    })

    it('splits does not modify original', () => {
      const t = ConcTree.from([1, 2, 3, 4, 5])
      t.split(2)
      expect(t.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('splits negative index returns empty and clone', () => {
      const t = ConcTree.from([1, 2, 3])
      const [left, right] = t.split(-1)
      expect(left.toArray()).toEqual([])
      expect(right.toArray()).toEqual([1, 2, 3])
    })

    it('splits beyond size returns clone and empty', () => {
      const t = ConcTree.from([1, 2, 3])
      const [left, right] = t.split(100)
      expect(left.toArray()).toEqual([1, 2, 3])
      expect(right.toArray()).toEqual([])
    })

    it('split then concat back', () => {
      const t = ConcTree.from([1, 2, 3, 4, 5])
      const [left, right] = t.split(2)
      const rejoined = new ConcTree<number>()
      rejoined.concat(left)
      rejoined.concat(right)
      expect(rejoined.toArray()).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('size', () => {
    it('returns 0 for new tree', () => {
      const t = new ConcTree<number>()
      expect(t.size).toBe(0)
    })

    it('increments on append', () => {
      const t = new ConcTree<number>()
      t.append(1)
      t.append(2)
      expect(t.size).toBe(2)
    })

    it('reflects concat', () => {
      const t1 = ConcTree.from([1, 2])
      const t2 = ConcTree.from([3, 4])
      t1.concat(t2)
      expect(t1.size).toBe(4)
    })

    it('resets on clear', () => {
      const t = ConcTree.from([1, 2, 3])
      t.clear()
      expect(t.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new tree', () => {
      expect(new ConcTree<number>().isEmpty()).toBe(true)
    })

    it('returns false after append', () => {
      const t = new ConcTree<number>()
      t.append(1)
      expect(t.isEmpty()).toBe(false)
    })

    it('returns true after clear', () => {
      const t = ConcTree.from([1, 2, 3])
      t.clear()
      expect(t.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears empty tree', () => {
      const t = new ConcTree<number>()
      t.clear()
      expect(t.size).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('clears populated tree', () => {
      const t = ConcTree.from([1, 2, 3])
      t.clear()
      expect(t.size).toBe(0)
      expect(t.toArray()).toEqual([])
    })

    it('allows reuse after clear', () => {
      const t = ConcTree.from([1, 2, 3])
      t.clear()
      t.append(42)
      expect(t.toArray()).toEqual([42])
      expect(t.size).toBe(1)
    })

    it('clear and rebuild multiple times', () => {
      const t = new ConcTree<number>()
      for (let round = 0; round < 3; round++) {
        for (let i = 0; i < 5; i++) t.append(i)
        expect(t.size).toBe(5)
        t.clear()
        expect(t.isEmpty()).toBe(true)
      }
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty tree', () => {
      const t = new ConcTree<number>()
      expect(t.toArray()).toEqual([])
    })

    it('returns elements in order', () => {
      const t = ConcTree.from([3, 1, 4, 1, 5])
      expect(t.toArray()).toEqual([3, 1, 4, 1, 5])
    })

    it('returns copy of elements', () => {
      const t = ConcTree.from([1, 2, 3])
      const arr = t.toArray()
      arr.push(999)
      expect(t.size).toBe(3)
    })

    it('reflects updates', () => {
      const t = ConcTree.from([1, 2, 3])
      t.update(1, 99)
      expect(t.toArray()).toEqual([1, 99, 3])
    })

    it('reflects prepends and appends', () => {
      const t = new ConcTree<number>()
      t.append(2)
      t.prepend(1)
      t.append(3)
      expect(t.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('forEach', () => {
    it('does nothing on empty tree', () => {
      const t = new ConcTree<number>()
      let count = 0
      t.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('iterates all elements with correct indices', () => {
      const t = ConcTree.from([10, 20, 30])
      const result: [number, number][] = []
      t.forEach((v, i) => result.push([v, i]))
      expect(result).toEqual([[10, 0], [20, 1], [30, 2]])
    })

    it('iterates in order', () => {
      const t = ConcTree.from([1, 2, 3, 4, 5])
      const result: number[] = []
      t.forEach(v => result.push(v))
      expect(result).toEqual([1, 2, 3, 4, 5])
    })

    it('works with strings', () => {
      const t = ConcTree.from(['a', 'b', 'c'])
      const result: string[] = []
      t.forEach(v => result.push(v))
      expect(result).toEqual(['a', 'b', 'c'])
    })

    it('provides correct indices after prepend and append', () => {
      const t = new ConcTree<number>()
      t.append(2)
      t.prepend(1)
      t.append(3)
      const indices: number[] = []
      t.forEach((_, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })
  })

  describe('map', () => {
    it('returns empty tree for empty input', () => {
      const t = new ConcTree<number>()
      const mapped = t.map(v => v * 2)
      expect(mapped.isEmpty()).toBe(true)
    })

    it('maps values', () => {
      const t = ConcTree.from([1, 2, 3])
      const mapped = t.map(v => v * 10)
      expect(mapped.toArray()).toEqual([10, 20, 30])
    })

    it('maps with index', () => {
      const t = ConcTree.from(['a', 'b', 'c'])
      const mapped = t.map((v, i) => `${v}${i}`)
      expect(mapped.toArray()).toEqual(['a0', 'b1', 'c2'])
    })

    it('does not modify original', () => {
      const t = ConcTree.from([1, 2, 3])
      t.map(v => v * 2)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('maps to different type', () => {
      const t = ConcTree.from([1, 2, 3])
      const mapped = t.map(v => v.toString())
      expect(mapped.toArray()).toEqual(['1', '2', '3'])
    })

    it('maps large tree', () => {
      const t = ConcTree.from(Array.from({ length: 50 }, (_, i) => i))
      const mapped = t.map(v => v + 1)
      expect(mapped.toArray()).toEqual(Array.from({ length: 50 }, (_, i) => i + 1))
    })
  })

  describe('filter', () => {
    it('returns empty tree for empty input', () => {
      const t = new ConcTree<number>()
      const filtered = t.filter(v => v > 0)
      expect(filtered.isEmpty()).toBe(true)
    })

    it('filters elements', () => {
      const t = ConcTree.from([1, 2, 3, 4, 5])
      const filtered = t.filter(v => v % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4])
    })

    it('filters with index', () => {
      const t = ConcTree.from([10, 20, 30, 40])
      const filtered = t.filter((_, i) => i % 2 === 0)
      expect(filtered.toArray()).toEqual([10, 30])
    })

    it('returns empty when nothing passes', () => {
      const t = ConcTree.from([1, 3, 5])
      const filtered = t.filter(v => v % 2 === 0)
      expect(filtered.isEmpty()).toBe(true)
    })

    it('returns all when everything passes', () => {
      const t = ConcTree.from([2, 4, 6])
      const filtered = t.filter(v => v % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4, 6])
    })

    it('does not modify original', () => {
      const t = ConcTree.from([1, 2, 3])
      t.filter(v => v > 1)
      expect(t.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates empty tree', () => {
      const t = new ConcTree<number>()
      const result: number[] = []
      for (const v of t) result.push(v)
      expect(result).toEqual([])
    })

    it('iterates all elements', () => {
      const t = ConcTree.from([3, 1, 2])
      const result: number[] = []
      for (const v of t) result.push(v)
      expect(result).toEqual([3, 1, 2])
    })

    it('works with spread operator', () => {
      const t = ConcTree.from([1, 2, 3])
      expect([...t]).toEqual([1, 2, 3])
    })

    it('works with destructuring', () => {
      const t = ConcTree.from([10, 20])
      const [a, b] = t
      expect(a).toBe(10)
      expect(b).toBe(20)
    })

    it('iterates large tree', () => {
      const t = ConcTree.from(Array.from({ length: 100 }, (_, i) => i))
      const result: number[] = []
      for (const v of t) result.push(v)
      expect(result).toEqual(Array.from({ length: 100 }, (_, i) => i))
    })
  })

  describe('static from', () => {
    it('creates tree from empty array', () => {
      const t = ConcTree.from([])
      expect(t.isEmpty()).toBe(true)
    })

    it('creates tree from array', () => {
      const t = ConcTree.from([1, 2, 3])
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('creates tree from single element', () => {
      const t = ConcTree.from([42])
      expect(t.size).toBe(1)
      expect(t.get(0)).toBe(42)
    })

    it('creates independent tree from array', () => {
      const arr = [1, 2, 3]
      const t = ConcTree.from(arr)
      arr.push(4)
      expect(t.size).toBe(3)
    })

    it('creates tree from string array', () => {
      const t = ConcTree.from(['x', 'y', 'z'])
      expect(t.toArray()).toEqual(['x', 'y', 'z'])
    })
  })

  describe('clone', () => {
    it('clones empty tree', () => {
      const t = new ConcTree<number>()
      const c = t.clone()
      expect(c.isEmpty()).toBe(true)
    })

    it('clones populated tree', () => {
      const t = ConcTree.from([1, 2, 3])
      const c = t.clone()
      expect(c.toArray()).toEqual([1, 2, 3])
    })

    it('clone is independent after update', () => {
      const t = ConcTree.from([1, 2, 3])
      const c = t.clone()
      t.update(0, 99)
      expect(c.toArray()).toEqual([1, 2, 3])
      expect(t.get(0)).toBe(99)
    })

    it('clone is independent after append', () => {
      const t = ConcTree.from([1, 2])
      const c = t.clone()
      t.append(3)
      expect(c.toArray()).toEqual([1, 2])
      expect(t.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('edge cases', () => {
    it('handles single element', () => {
      const t = ConcTree.from([42])
      expect(t.get(0)).toBe(42)
      expect(t.size).toBe(1)
      t.update(0, 99)
      expect(t.get(0)).toBe(99)
    })

    it('handles two elements', () => {
      const t = ConcTree.from([1, 2])
      expect(t.get(0)).toBe(1)
      expect(t.get(1)).toBe(2)
    })

    it('handles negative numbers', () => {
      const t = ConcTree.from([-5, -3, -7, -1])
      expect(t.toArray()).toEqual([-5, -3, -7, -1])
    })

    it('handles zero', () => {
      const t = ConcTree.from([0])
      expect(t.get(0)).toBe(0)
    })

    it('handles floating point', () => {
      const t = ConcTree.from([1.5, 2.7, 3.14])
      expect(t.toArray()).toEqual([1.5, 2.7, 3.14])
    })

    it('handles null as values', () => {
      const t = new ConcTree<number | null>()
      t.append(null)
      t.append(1)
      t.append(null)
      expect(t.toArray()).toEqual([null, 1, null])
    })

    it('handles duplicate values', () => {
      const t = ConcTree.from([5, 5, 5, 5, 5])
      expect(t.toArray()).toEqual([5, 5, 5, 5, 5])
      expect(t.size).toBe(5)
    })

    it('handles get on single element after split', () => {
      const t = ConcTree.from([1, 2, 3])
      const [, right] = t.split(2)
      expect(right.get(0)).toBe(3)
    })

    it('handles update on split result', () => {
      const t = ConcTree.from([1, 2, 3, 4])
      const [left] = t.split(2)
      left.update(0, 99)
      expect(left.toArray()).toEqual([99, 2])
    })

    it('handles mixed prepend append split', () => {
      const t = new ConcTree<number>()
      t.append(2)
      t.prepend(1)
      t.append(3)
      t.prepend(0)
      expect(t.toArray()).toEqual([0, 1, 2, 3])
      const [l, r] = t.split(2)
      expect(l.toArray()).toEqual([0, 1])
      expect(r.toArray()).toEqual([2, 3])
    })
  })

  describe('large batches', () => {
    it('handles 100 appends', () => {
      const t = new ConcTree<number>()
      for (let i = 0; i < 100; i++) t.append(i)
      expect(t.size).toBe(100)
      expect(t.get(0)).toBe(0)
      expect(t.get(99)).toBe(99)
    })

    it('handles 100 prepends', () => {
      const t = new ConcTree<number>()
      for (let i = 99; i >= 0; i--) t.prepend(i)
      expect(t.toArray()).toEqual(Array.from({ length: 100 }, (_, i) => i))
    })

    it('handles 500 elements with get', () => {
      const t = ConcTree.from(Array.from({ length: 500 }, (_, i) => i * 2))
      for (let i = 0; i < 500; i++) {
        expect(t.get(i)).toBe(i * 2)
      }
    })

    it('handles split on large tree', () => {
      const t = ConcTree.from(Array.from({ length: 100 }, (_, i) => i))
      const [left, right] = t.split(50)
      expect(left.size).toBe(50)
      expect(right.size).toBe(50)
      expect(left.get(0)).toBe(0)
      expect(left.get(49)).toBe(49)
      expect(right.get(0)).toBe(50)
      expect(right.get(49)).toBe(99)
    })

    it('handles update on large tree', () => {
      const t = ConcTree.from(Array.from({ length: 100 }, (_, i) => i))
      t.update(50, 999)
      expect(t.get(50)).toBe(999)
      expect(t.get(49)).toBe(49)
      expect(t.get(51)).toBe(51)
    })

    it('handles filter on large tree', () => {
      const t = ConcTree.from(Array.from({ length: 100 }, (_, i) => i))
      const evens = t.filter(v => v % 2 === 0)
      expect(evens.size).toBe(50)
      expect(evens.toArray()).toEqual(Array.from({ length: 50 }, (_, i) => i * 2))
    })

    it('handles map on large tree', () => {
      const t = ConcTree.from(Array.from({ length: 100 }, (_, i) => i))
      const mapped = t.map(v => v.toString())
      expect(mapped.get(0)).toBe('0')
      expect(mapped.get(99)).toBe('99')
    })
  })

  describe('interleaved operations', () => {
    it('append then update then get', () => {
      const t = new ConcTree<number>()
      t.append(1)
      t.append(2)
      t.append(3)
      t.update(1, 99)
      expect(t.get(0)).toBe(1)
      expect(t.get(1)).toBe(99)
      expect(t.get(2)).toBe(3)
    })

    it('prepend then split then append', () => {
      const t = new ConcTree<number>()
      t.append(1)
      t.append(3)
      const [left, right] = t.split(1)
      left.append(2)
      expect(left.toArray()).toEqual([1, 2])
      expect(right.toArray()).toEqual([3])
    })

    it('concat then split', () => {
      const t1 = ConcTree.from([1, 2])
      const t2 = ConcTree.from([3, 4])
      t1.concat(t2)
      const [left, right] = t1.split(2)
      expect(left.toArray()).toEqual([1, 2])
      expect(right.toArray()).toEqual([3, 4])
    })

    it('filter then map', () => {
      const t = ConcTree.from([1, 2, 3, 4, 5])
      const filtered = t.filter(v => v > 2)
      const mapped = filtered.map(v => v * 10)
      expect(mapped.toArray()).toEqual([30, 40, 50])
    })

    it('split and concat back', () => {
      const t = ConcTree.from([1, 2, 3, 4, 5])
      const [left, right] = t.split(2)
      const rejoined = new ConcTree<number>()
      rejoined.concat(left)
      rejoined.concat(right)
      expect(rejoined.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('clear and rebuild', () => {
      const t = ConcTree.from([1, 2, 3])
      t.clear()
      t.append(4)
      t.prepend(0)
      expect(t.toArray()).toEqual([0, 4])
    })
  })

  describe('string and object types', () => {
    it('works with string elements', () => {
      const t = ConcTree.from(['hello', 'world'])
      expect(t.get(0)).toBe('hello')
      expect(t.get(1)).toBe('world')
    })

    it('works with object elements', () => {
      const t = new ConcTree<{ id: number }>()
      t.append({ id: 1 })
      t.append({ id: 2 })
      expect(t.get(0)!.id).toBe(1)
      expect(t.get(1)!.id).toBe(2)
    })

    it('updates object elements', () => {
      const t = new ConcTree<{ id: number }>()
      t.append({ id: 1 })
      t.update(0, { id: 99 })
      expect(t.get(0)!.id).toBe(99)
    })

    it('filters objects', () => {
      const t = new ConcTree<{ id: number }>()
      t.append({ id: 1 })
      t.append({ id: 2 })
      t.append({ id: 3 })
      const filtered = t.filter(v => v.id > 1)
      expect(filtered.size).toBe(2)
    })
  })
})
