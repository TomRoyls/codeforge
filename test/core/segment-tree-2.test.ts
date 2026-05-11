import { describe, it, expect } from 'vitest'
import { SegmentTree2 } from '../../src/core/segment-tree-2/index.js'
import type { SegmentTree2Options } from '../../src/core/segment-tree-2/types.js'

describe('SegmentTree2', () => {
  describe('constructor', () => {
    it('creates instance with empty array', () => {
      const st = new SegmentTree2([])
      expect(st.size).toBe(0)
      expect(st.isEmpty).toBe(true)
    })

    it('creates instance with single element', () => {
      const st = new SegmentTree2([42])
      expect(st.size).toBe(1)
      expect(st.isEmpty).toBe(false)
      expect(st.get(0)).toBe(42)
    })

    it('creates instance with multiple elements', () => {
      const st = new SegmentTree2([1, 2, 3, 4, 5])
      expect(st.size).toBe(5)
    })

    it('creates instance with default sum merge', () => {
      const st = new SegmentTree2([1, 2, 3, 4, 5])
      expect(st.query(0, 5)).toBe(15)
    })

    it('creates instance with custom merge for max', () => {
      const st = new SegmentTree2([5, 3, 7, 1, 4], {
        merge: (a, b) => Math.max(a, b),
        identity: -Infinity,
      })
      expect(st.query(0, 5)).toBe(7)
    })

    it('creates instance with custom merge for min', () => {
      const st = new SegmentTree2([5, 3, 7, 1, 4], {
        merge: (a, b) => Math.min(a, b),
        identity: Infinity,
      })
      expect(st.query(0, 5)).toBe(1)
    })

    it('creates instance with identity only', () => {
      const st = new SegmentTree2([10, 20, 30], { identity: 0 })
      expect(st.query(0, 3)).toBe(60)
    })

    it('preserves original array (does not mutate)', () => {
      const arr = [1, 2, 3]
      new SegmentTree2(arr)
      expect(arr).toEqual([1, 2, 3])
    })

    it('handles two elements', () => {
      const st = new SegmentTree2([3, 7])
      expect(st.query(0, 2)).toBe(10)
    })

    it('handles large array', () => {
      const arr = Array.from({ length: 1000 }, (_, i) => i + 1)
      const st = new SegmentTree2(arr)
      expect(st.query(0, 1000)).toBe(500500)
    })
  })

  describe('query', () => {
    it('queries full range', () => {
      const st = new SegmentTree2([1, 2, 3, 4, 5])
      expect(st.query(0, 5)).toBe(15)
    })

    it('queries single element', () => {
      const st = new SegmentTree2([1, 2, 3, 4, 5])
      expect(st.query(2, 3)).toBe(3)
    })

    it('queries sub-range at start', () => {
      const st = new SegmentTree2([1, 2, 3, 4, 5])
      expect(st.query(0, 3)).toBe(6)
    })

    it('queries sub-range at end', () => {
      const st = new SegmentTree2([1, 2, 3, 4, 5])
      expect(st.query(3, 5)).toBe(9)
    })

    it('queries middle range', () => {
      const st = new SegmentTree2([1, 2, 3, 4, 5])
      expect(st.query(1, 4)).toBe(9)
    })

    it('throws on empty tree', () => {
      const st = new SegmentTree2([])
      expect(() => st.query(0, 0)).toThrow(RangeError)
    })

    it('throws on invalid range l >= r', () => {
      const st = new SegmentTree2([1, 2, 3])
      expect(() => st.query(2, 2)).toThrow(RangeError)
    })

    it('throws on negative l', () => {
      const st = new SegmentTree2([1, 2, 3])
      expect(() => st.query(-1, 2)).toThrow(RangeError)
    })

    it('throws on r > size', () => {
      const st = new SegmentTree2([1, 2, 3])
      expect(() => st.query(0, 4)).toThrow(RangeError)
    })

    it('queries adjacent elements', () => {
      const st = new SegmentTree2([10, 20, 30, 40, 50])
      expect(st.query(1, 3)).toBe(50)
    })
  })

  describe('update (point)', () => {
    it('updates a single element', () => {
      const st = new SegmentTree2([1, 2, 3, 4, 5])
      st.update(2, 10)
      expect(st.get(2)).toBe(10)
    })

    it('updates and reflects in query', () => {
      const st = new SegmentTree2([1, 2, 3, 4, 5])
      st.update(2, 10)
      expect(st.query(0, 5)).toBe(22)
    })

    it('updates first element', () => {
      const st = new SegmentTree2([1, 2, 3])
      st.update(0, 100)
      expect(st.get(0)).toBe(100)
      expect(st.query(0, 3)).toBe(105)
    })

    it('updates last element', () => {
      const st = new SegmentTree2([1, 2, 3])
      st.update(2, 100)
      expect(st.get(2)).toBe(100)
      expect(st.query(0, 3)).toBe(103)
    })

    it('throws on out of bounds index', () => {
      const st = new SegmentTree2([1, 2, 3])
      expect(() => st.update(-1, 5)).toThrow(RangeError)
      expect(() => st.update(3, 5)).toThrow(RangeError)
    })

    it('multiple updates', () => {
      const st = new SegmentTree2([1, 2, 3, 4, 5])
      st.update(0, 10)
      st.update(4, 50)
      expect(st.query(0, 5)).toBe(69)
    })
  })

  describe('rangeUpdate', () => {
    it('adds value to entire range', () => {
      const st = new SegmentTree2([1, 2, 3, 4, 5])
      st.rangeUpdate(0, 5, 10)
      expect(st.toArray()).toEqual([11, 12, 13, 14, 15])
    })

    it('adds value to partial range at start', () => {
      const st = new SegmentTree2([1, 2, 3, 4, 5])
      st.rangeUpdate(0, 3, 5)
      expect(st.get(0)).toBe(6)
      expect(st.get(1)).toBe(7)
      expect(st.get(2)).toBe(8)
      expect(st.get(3)).toBe(4)
      expect(st.get(4)).toBe(5)
    })

    it('adds value to partial range at end', () => {
      const st = new SegmentTree2([1, 2, 3, 4, 5])
      st.rangeUpdate(3, 5, 10)
      expect(st.get(2)).toBe(3)
      expect(st.get(3)).toBe(14)
      expect(st.get(4)).toBe(15)
    })

    it('adds value to middle range', () => {
      const st = new SegmentTree2([1, 2, 3, 4, 5])
      st.rangeUpdate(1, 4, 1)
      expect(st.get(0)).toBe(1)
      expect(st.get(1)).toBe(3)
      expect(st.get(2)).toBe(4)
      expect(st.get(3)).toBe(5)
      expect(st.get(4)).toBe(5)
    })

    it('adds value to single element range', () => {
      const st = new SegmentTree2([1, 2, 3])
      st.rangeUpdate(1, 2, 10)
      expect(st.get(1)).toBe(12)
      expect(st.get(0)).toBe(1)
      expect(st.get(2)).toBe(3)
    })

    it('multiple range updates stack', () => {
      const st = new SegmentTree2([0, 0, 0, 0, 0])
      st.rangeUpdate(0, 5, 1)
      st.rangeUpdate(2, 5, 1)
      expect(st.toArray()).toEqual([1, 1, 2, 2, 2])
    })

    it('query after range update', () => {
      const st = new SegmentTree2([1, 2, 3, 4, 5])
      st.rangeUpdate(1, 4, 5)
      expect(st.query(1, 4)).toBe(9 + 15)
    })

    it('throws on invalid range', () => {
      const st = new SegmentTree2([1, 2, 3])
      expect(() => st.rangeUpdate(-1, 2, 1)).toThrow(RangeError)
      expect(() => st.rangeUpdate(0, 4, 1)).toThrow(RangeError)
    })

    it('no-op on empty range', () => {
      const st = new SegmentTree2([1, 2, 3])
      st.rangeUpdate(1, 1, 10)
      expect(st.toArray()).toEqual([1, 2, 3])
    })

    it('works on large array', () => {
      const arr = new Array(100).fill(0)
      const st = new SegmentTree2(arr)
      st.rangeUpdate(10, 50, 1)
      expect(st.get(9)).toBe(0)
      expect(st.get(10)).toBe(1)
      expect(st.get(49)).toBe(1)
      expect(st.get(50)).toBe(0)
    })
  })

  describe('get', () => {
    it('gets element at index', () => {
      const st = new SegmentTree2([10, 20, 30])
      expect(st.get(0)).toBe(10)
      expect(st.get(1)).toBe(20)
      expect(st.get(2)).toBe(30)
    })

    it('throws on negative index', () => {
      const st = new SegmentTree2([1, 2, 3])
      expect(() => st.get(-1)).toThrow(RangeError)
    })

    it('throws on out of bounds index', () => {
      const st = new SegmentTree2([1, 2, 3])
      expect(() => st.get(3)).toThrow(RangeError)
    })
  })

  describe('set', () => {
    it('sets element at index', () => {
      const st = new SegmentTree2([1, 2, 3])
      st.set(1, 20)
      expect(st.get(1)).toBe(20)
    })

    it('set is alias for update', () => {
      const st = new SegmentTree2([1, 2, 3])
      st.set(0, 100)
      expect(st.query(0, 3)).toBe(105)
    })
  })

  describe('size and isEmpty', () => {
    it('size returns correct count', () => {
      expect(new SegmentTree2([1, 2, 3]).size).toBe(3)
      expect(new SegmentTree2([]).size).toBe(0)
      expect(new SegmentTree2([1]).size).toBe(1)
    })

    it('isEmpty returns true for empty', () => {
      expect(new SegmentTree2([]).isEmpty).toBe(true)
      expect(new SegmentTree2([1]).isEmpty).toBe(false)
    })
  })

  describe('toArray', () => {
    it('returns copy of underlying array', () => {
      const st = new SegmentTree2([1, 2, 3])
      expect(st.toArray()).toEqual([1, 2, 3])
    })

    it('returns empty array for empty tree', () => {
      const st = new SegmentTree2([])
      expect(st.toArray()).toEqual([])
    })

    it('reflects updates', () => {
      const st = new SegmentTree2([1, 2, 3])
      st.update(1, 20)
      expect(st.toArray()).toEqual([1, 20, 3])
    })

    it('reflects range updates', () => {
      const st = new SegmentTree2([1, 2, 3])
      st.rangeUpdate(0, 3, 5)
      expect(st.toArray()).toEqual([6, 7, 8])
    })

    it('returns a copy', () => {
      const st = new SegmentTree2([1, 2, 3])
      const arr = st.toArray()
      arr[0] = 999
      expect(st.get(0)).toBe(1)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const st = new SegmentTree2([1, 2, 3])
      const cl = st.clone()
      expect(cl.toArray()).toEqual([1, 2, 3])
      expect(cl.size).toBe(3)
    })

    it('clone modifications do not affect original', () => {
      const st = new SegmentTree2([1, 2, 3])
      const cl = st.clone()
      cl.update(0, 100)
      expect(st.get(0)).toBe(1)
      expect(cl.get(0)).toBe(100)
    })

    it('clone with range updates independent', () => {
      const st = new SegmentTree2([1, 2, 3, 4, 5])
      const cl = st.clone()
      cl.rangeUpdate(0, 5, 10)
      expect(st.toArray()).toEqual([1, 2, 3, 4, 5])
      expect(cl.toArray()).toEqual([11, 12, 13, 14, 15])
    })

    it('clones empty tree', () => {
      const st = new SegmentTree2([])
      const cl = st.clone()
      expect(cl.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears the tree', () => {
      const st = new SegmentTree2([1, 2, 3])
      st.clear()
      expect(st.size).toBe(0)
      expect(st.isEmpty).toBe(true)
      expect(st.toArray()).toEqual([])
    })

    it('clear already empty tree', () => {
      const st = new SegmentTree2([])
      st.clear()
      expect(st.isEmpty).toBe(true)
    })
  })

  describe('static fromArray', () => {
    it('creates tree from array', () => {
      const st = SegmentTree2.fromArray([1, 2, 3])
      expect(st.query(0, 3)).toBe(6)
    })

    it('creates tree with options', () => {
      const st = SegmentTree2.fromArray([5, 3, 7, 1], {
        merge: (a, b) => Math.max(a, b),
        identity: -Infinity,
      })
      expect(st.query(0, 4)).toBe(7)
    })

    it('creates empty tree', () => {
      const st = SegmentTree2.fromArray([])
      expect(st.isEmpty).toBe(true)
    })
  })

  describe('forEach', () => {
    it('iterates over all elements', () => {
      const st = new SegmentTree2([1, 2, 3])
      const collected: number[] = []
      st.forEach((v) => collected.push(v))
      expect(collected).toEqual([1, 2, 3])
    })

    it('provides correct indices', () => {
      const st = new SegmentTree2([10, 20, 30])
      const indices: number[] = []
      st.forEach((_, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('does not iterate on empty tree', () => {
      const st = new SegmentTree2([])
      let count = 0
      st.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('reflects range updates', () => {
      const st = new SegmentTree2([1, 2, 3])
      st.rangeUpdate(0, 3, 1)
      const collected: number[] = []
      st.forEach((v) => collected.push(v))
      expect(collected).toEqual([2, 3, 4])
    })
  })

  describe('[Symbol.iterator]', () => {
    it('is iterable', () => {
      const st = new SegmentTree2([1, 2, 3])
      const collected: number[] = []
      for (const v of st) {
        collected.push(v)
      }
      expect(collected).toEqual([1, 2, 3])
    })

    it('works with spread', () => {
      const st = new SegmentTree2([1, 2, 3])
      expect([...st]).toEqual([1, 2, 3])
    })

    it('works with empty tree', () => {
      const st = new SegmentTree2([])
      expect([...st]).toEqual([])
    })
  })

  describe('first and last', () => {
    it('first returns first element', () => {
      const st = new SegmentTree2([10, 20, 30])
      expect(st.first()).toBe(10)
    })

    it('last returns last element', () => {
      const st = new SegmentTree2([10, 20, 30])
      expect(st.last()).toBe(30)
    })

    it('first throws on empty', () => {
      const st = new SegmentTree2([])
      expect(() => st.first()).toThrow(RangeError)
    })

    it('last throws on empty', () => {
      const st = new SegmentTree2([])
      expect(() => st.last()).toThrow(RangeError)
    })

    it('first and last same for single element', () => {
      const st = new SegmentTree2([42])
      expect(st.first()).toBe(42)
      expect(st.last()).toBe(42)
    })
  })

  describe('indexOf', () => {
    it('finds existing element', () => {
      const st = new SegmentTree2([10, 20, 30])
      expect(st.indexOf(20)).toBe(1)
    })

    it('returns -1 for non-existing', () => {
      const st = new SegmentTree2([10, 20, 30])
      expect(st.indexOf(99)).toBe(-1)
    })

    it('finds first occurrence', () => {
      const st = new SegmentTree2([10, 20, 20, 30])
      expect(st.indexOf(20)).toBe(1)
    })

    it('returns -1 on empty tree', () => {
      const st = new SegmentTree2([])
      expect(st.indexOf(1)).toBe(-1)
    })

    it('finds element at boundaries', () => {
      const st = new SegmentTree2([10, 20, 30])
      expect(st.indexOf(10)).toBe(0)
      expect(st.indexOf(30)).toBe(2)
    })
  })

  describe('indexOfRange', () => {
    it('finds value in range', () => {
      const st = new SegmentTree2([10, 20, 30, 40, 50])
      expect(st.indexOfRange(1, 4, 30)).toBe(2)
    })

    it('returns -1 if not in range', () => {
      const st = new SegmentTree2([10, 20, 30, 40, 50])
      expect(st.indexOfRange(0, 2, 30)).toBe(-1)
    })

    it('throws on invalid range', () => {
      const st = new SegmentTree2([1, 2, 3])
      expect(() => st.indexOfRange(-1, 2, 1)).toThrow(RangeError)
      expect(() => st.indexOfRange(0, 4, 1)).toThrow(RangeError)
    })

    it('finds first occurrence in range', () => {
      const st = new SegmentTree2([10, 20, 20, 30])
      expect(st.indexOfRange(1, 4, 20)).toBe(1)
    })
  })

  describe('min', () => {
    it('returns minimum element', () => {
      const st = new SegmentTree2([5, 3, 7, 1, 4])
      expect(st.min()).toBe(1)
    })

    it('works with all same values', () => {
      const st = new SegmentTree2([5, 5, 5])
      expect(st.min()).toBe(5)
    })

    it('works with single element', () => {
      const st = new SegmentTree2([42])
      expect(st.min()).toBe(42)
    })

    it('throws on empty', () => {
      const st = new SegmentTree2([])
      expect(() => st.min()).toThrow(RangeError)
    })

    it('works with negative numbers', () => {
      const st = new SegmentTree2([-5, -3, -10, -1])
      expect(st.min()).toBe(-10)
    })
  })

  describe('max', () => {
    it('returns maximum element', () => {
      const st = new SegmentTree2([5, 3, 7, 1, 4])
      expect(st.max()).toBe(7)
    })

    it('works with all same values', () => {
      const st = new SegmentTree2([5, 5, 5])
      expect(st.max()).toBe(5)
    })

    it('works with single element', () => {
      const st = new SegmentTree2([42])
      expect(st.max()).toBe(42)
    })

    it('throws on empty', () => {
      const st = new SegmentTree2([])
      expect(() => st.max()).toThrow(RangeError)
    })

    it('works with negative numbers', () => {
      const st = new SegmentTree2([-5, -3, -10, -1])
      expect(st.max()).toBe(-1)
    })
  })

  describe('sum', () => {
    it('returns sum of all elements', () => {
      const st = new SegmentTree2([1, 2, 3, 4, 5])
      expect(st.sum()).toBe(15)
    })

    it('returns identity for empty tree', () => {
      const st = new SegmentTree2([])
      expect(st.sum()).toBe(0)
    })

    it('works with single element', () => {
      const st = new SegmentTree2([42])
      expect(st.sum()).toBe(42)
    })

    it('reflects updates', () => {
      const st = new SegmentTree2([1, 2, 3])
      st.update(1, 10)
      expect(st.sum()).toBe(14)
    })

    it('reflects range updates', () => {
      const st = new SegmentTree2([1, 2, 3])
      st.rangeUpdate(0, 3, 5)
      expect(st.sum()).toBe(6 + 15)
    })
  })

  describe('prefixSum', () => {
    it('returns sum of first n elements', () => {
      const st = new SegmentTree2([1, 2, 3, 4, 5])
      expect(st.prefixSum(3)).toBe(6)
    })

    it('returns 0 for prefix 0', () => {
      const st = new SegmentTree2([1, 2, 3])
      expect(st.prefixSum(0)).toBe(0)
    })

    it('returns full sum for prefix size', () => {
      const st = new SegmentTree2([1, 2, 3])
      expect(st.prefixSum(3)).toBe(6)
    })

    it('throws on negative n', () => {
      const st = new SegmentTree2([1, 2, 3])
      expect(() => st.prefixSum(-1)).toThrow(RangeError)
    })

    it('throws on n > size', () => {
      const st = new SegmentTree2([1, 2, 3])
      expect(() => st.prefixSum(4)).toThrow(RangeError)
    })

    it('works after updates', () => {
      const st = new SegmentTree2([1, 2, 3, 4, 5])
      st.update(0, 10)
      expect(st.prefixSum(2)).toBe(12)
    })
  })

  describe('build', () => {
    it('rebuilds from new array', () => {
      const st = new SegmentTree2([1, 2, 3])
      st.build([10, 20, 30, 40])
      expect(st.size).toBe(4)
      expect(st.query(0, 4)).toBe(100)
    })

    it('rebuilds from empty array', () => {
      const st = new SegmentTree2([1, 2, 3])
      st.build([])
      expect(st.isEmpty).toBe(true)
    })

    it('replaces previous data', () => {
      const st = new SegmentTree2([1, 2, 3])
      st.update(0, 100)
      st.build([5, 5, 5, 5, 5])
      expect(st.query(0, 5)).toBe(25)
      expect(st.get(0)).toBe(5)
    })

    it('rebuild smaller array', () => {
      const st = new SegmentTree2([1, 2, 3, 4, 5, 6, 7, 8])
      st.build([10, 20])
      expect(st.size).toBe(2)
      expect(st.query(0, 2)).toBe(30)
    })
  })

  describe('integration: complex scenarios', () => {
    it('range update then point update then query', () => {
      const st = new SegmentTree2([1, 2, 3, 4, 5])
      st.rangeUpdate(0, 5, 10)
      st.update(2, 0)
      expect(st.get(2)).toBe(0)
      expect(st.query(0, 3)).toBe(11 + 12 + 0)
    })

    it('multiple overlapping range updates', () => {
      const st = new SegmentTree2([0, 0, 0, 0, 0])
      st.rangeUpdate(0, 3, 1)
      st.rangeUpdate(2, 5, 1)
      expect(st.toArray()).toEqual([1, 1, 2, 1, 1])
    })

    it('range update then clone preserves state', () => {
      const st = new SegmentTree2([1, 2, 3])
      st.rangeUpdate(0, 3, 10)
      const cl = st.clone()
      expect(cl.toArray()).toEqual([11, 12, 13])
    })

    it('point update after range update', () => {
      const st = new SegmentTree2([0, 0, 0, 0])
      st.rangeUpdate(1, 3, 5)
      st.update(2, 100)
      expect(st.get(2)).toBe(100)
    })

    it('alternating updates and queries', () => {
      const st = new SegmentTree2([0, 0, 0, 0])
      st.rangeUpdate(0, 4, 1)
      expect(st.query(0, 4)).toBe(4)
      st.rangeUpdate(0, 4, 1)
      expect(st.query(0, 4)).toBe(8)
      st.update(0, 0)
      expect(st.query(0, 4)).toBe(6)
    })

    it('range update on single element tree', () => {
      const st = new SegmentTree2([5])
      st.rangeUpdate(0, 1, 10)
      expect(st.get(0)).toBe(15)
    })

    it('build then operations', () => {
      const st = new SegmentTree2([1, 2, 3])
      st.build([10, 20, 30, 40, 50])
      expect(st.sum()).toBe(150)
      expect(st.min()).toBe(10)
      expect(st.max()).toBe(50)
    })

    it('forEach after range update', () => {
      const st = new SegmentTree2([1, 2, 3])
      st.rangeUpdate(1, 3, 5)
      const vals: number[] = []
      st.forEach((v) => vals.push(v))
      expect(vals).toEqual([1, 7, 8])
    })

    it('iterator after range update', () => {
      const st = new SegmentTree2([1, 2, 3])
      st.rangeUpdate(0, 2, 10)
      expect([...st]).toEqual([11, 12, 3])
    })

    it('indexOf after update', () => {
      const st = new SegmentTree2([1, 2, 3])
      st.update(1, 99)
      expect(st.indexOf(99)).toBe(1)
      expect(st.indexOf(2)).toBe(-1)
    })

    it('indexOfRange after range update', () => {
      const st = new SegmentTree2([1, 2, 3, 4, 5])
      st.rangeUpdate(1, 4, 10)
      expect(st.indexOfRange(1, 4, 13)).toBe(2)
    })

    it('clear then build', () => {
      const st = new SegmentTree2([1, 2, 3])
      st.clear()
      st.build([10, 20])
      expect(st.size).toBe(2)
      expect(st.query(0, 2)).toBe(30)
    })

    it('large number of point updates', () => {
      const st = new SegmentTree2(new Array(50).fill(0))
      for (let i = 0; i < 50; i++) {
        st.update(i, i + 1)
      }
      expect(st.sum()).toBe(1275)
    })

    it('large range updates', () => {
      const st = new SegmentTree2(new Array(100).fill(0))
      st.rangeUpdate(0, 50, 1)
      st.rangeUpdate(50, 100, 2)
      expect(st.query(0, 50)).toBe(50)
      expect(st.query(50, 100)).toBe(100)
      expect(st.sum()).toBe(150)
    })

    it('min/max after updates', () => {
      const st = new SegmentTree2([5, 3, 7, 1, 4])
      st.update(3, 10)
      expect(st.min()).toBe(3)
      expect(st.max()).toBe(10)
    })

    it('prefixSum after range update', () => {
      const st = new SegmentTree2([1, 2, 3, 4, 5])
      st.rangeUpdate(0, 3, 1)
      expect(st.prefixSum(3)).toBe(2 + 3 + 4)
    })

    it('custom merge with string concat', () => {
      const st = new SegmentTree2(['a', 'b', 'c'], {
        merge: (a, b) => a + b,
        identity: '',
      })
      expect(st.query(0, 3)).toBe('abc')
      expect(st.query(1, 3)).toBe('bc')
    })

    it('custom merge with max after range update', () => {
      const st = new SegmentTree2([1, 3, 2, 5, 4], {
        merge: (a, b) => Math.max(a, b),
        identity: -Infinity,
      })
      expect(st.query(0, 5)).toBe(5)
      st.update(2, 10)
      expect(st.query(0, 5)).toBe(10)
    })
  })
})
