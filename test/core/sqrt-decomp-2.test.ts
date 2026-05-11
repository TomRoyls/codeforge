import { describe, it, expect } from 'vitest'
import { SqrtDecomp2 } from '../../src/core/sqrt-decomp-2/index.js'
import type { SqrtDecomp2Options } from '../../src/core/sqrt-decomp-2/types.js'

describe('SqrtDecomp2', () => {
  describe('constructor', () => {
    it('creates instance with empty array', () => {
      const sq = new SqrtDecomp2([])
      expect(sq.size).toBe(0)
      expect(sq.isEmpty).toBe(true)
    })

    it('creates instance with single element', () => {
      const sq = new SqrtDecomp2([42])
      expect(sq.size).toBe(1)
      expect(sq.isEmpty).toBe(false)
      expect(sq.get(0)).toBe(42)
    })

    it('creates instance with multiple elements', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5])
      expect(sq.size).toBe(5)
    })

    it('uses default sum operation for numbers', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5])
      expect(sq.query(0, 5)).toBe(15)
    })

    it('creates instance with custom merge (min)', () => {
      const sq = new SqrtDecomp2([5, 3, 7, 1, 4], {
        merge: (a, b) => Math.min(a, b),
        identity: Infinity,
      })
      expect(sq.query(0, 5)).toBe(1)
    })

    it('creates instance with custom merge (max)', () => {
      const sq = new SqrtDecomp2([5, 3, 7, 1, 4], {
        merge: (a, b) => Math.max(a, b),
        identity: -Infinity,
      })
      expect(sq.query(0, 5)).toBe(7)
    })

    it('creates instance with custom blockSize', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5, 6, 7, 8, 9], { blockSize: 3 })
      expect(sq.blockSize).toBe(3)
    })

    it('preserves original array', () => {
      const arr = [1, 2, 3]
      new SqrtDecomp2(arr)
      expect(arr).toEqual([1, 2, 3])
    })

    it('works with string type and custom merge', () => {
      const sq = new SqrtDecomp2(['a', 'b', 'c'], {
        merge: (a, b) => a + b,
        identity: '',
      })
      expect(sq.query(0, 3)).toBe('abc')
    })

    it('works with XOR operation', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5], {
        merge: (a, b) => a ^ b,
        identity: 0,
      })
      expect(sq.query(0, 5)).toBe(1)
    })

    it('computes auto blockSize for large array', () => {
      const sq = new SqrtDecomp2(Array.from({ length: 100 }, (_, i) => i))
      expect(sq.blockSize).toBe(10)
    })
  })

  describe('blockSize', () => {
    it('returns auto-computed blockSize for empty', () => {
      const sq = new SqrtDecomp2([])
      expect(sq.blockSize).toBe(1)
    })

    it('returns auto-computed blockSize for 1 element', () => {
      const sq = new SqrtDecomp2([1])
      expect(sq.blockSize).toBe(1)
    })

    it('returns auto-computed blockSize for 9 elements', () => {
      const sq = new SqrtDecomp2(Array.from({ length: 9 }, (_, i) => i))
      expect(sq.blockSize).toBe(3)
    })

    it('returns custom blockSize when provided', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5], { blockSize: 2 })
      expect(sq.blockSize).toBe(2)
    })

    it('blockSize 1 works correctly', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5], { blockSize: 1 })
      expect(sq.query(0, 5)).toBe(15)
      expect(sq.blockSize).toBe(1)
    })
  })

  describe('query', () => {
    it('queries entire range', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5])
      expect(sq.query(0, 5)).toBe(15)
    })

    it('queries single element', () => {
      const sq = new SqrtDecomp2([10, 20, 30, 40, 50])
      expect(sq.query(2, 3)).toBe(30)
    })

    it('queries partial range within one block', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5, 6, 7, 8, 9])
      expect(sq.query(1, 3)).toBe(5)
    })

    it('queries range spanning multiple blocks', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5, 6, 7, 8, 9])
      expect(sq.query(2, 7)).toBe(25)
    })

    it('queries first element', () => {
      const sq = new SqrtDecomp2([10, 20, 30])
      expect(sq.query(0, 1)).toBe(10)
    })

    it('queries last element', () => {
      const sq = new SqrtDecomp2([10, 20, 30])
      expect(sq.query(2, 3)).toBe(30)
    })

    it('returns identity for empty range', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      expect(sq.query(1, 1)).toBe(0)
    })

    it('throws on l > r', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      expect(() => sq.query(2, 1)).toThrow(RangeError)
    })

    it('throws on negative l', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      expect(() => sq.query(-1, 2)).toThrow(RangeError)
    })

    it('throws on r > size', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      expect(() => sq.query(0, 4)).toThrow(RangeError)
    })

    it('works with negative numbers', () => {
      const sq = new SqrtDecomp2([-1, -2, -3, -4, -5])
      expect(sq.query(0, 5)).toBe(-15)
    })

    it('works with zeros', () => {
      const sq = new SqrtDecomp2([0, 0, 0, 0])
      expect(sq.query(0, 4)).toBe(0)
    })

    it('handles large array', () => {
      const arr = Array.from({ length: 1000 }, (_, i) => i + 1)
      const sq = new SqrtDecomp2(arr)
      expect(sq.query(0, 1000)).toBe(500500)
    })

    it('handles query across block boundaries', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
      const sq = new SqrtDecomp2(arr)
      expect(sq.query(3, 13)).toBe(85)
    })
  })

  describe('update', () => {
    it('updates single element', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5])
      sq.update(2, 10)
      expect(sq.get(2)).toBe(10)
    })

    it('updates affect range queries', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5])
      sq.update(2, 10)
      expect(sq.query(0, 5)).toBe(22)
    })

    it('updates first element', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      sq.update(0, 100)
      expect(sq.get(0)).toBe(100)
    })

    it('updates last element', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      sq.update(2, 100)
      expect(sq.get(2)).toBe(100)
    })

    it('throws on negative index', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      expect(() => sq.update(-1, 10)).toThrow(RangeError)
    })

    it('throws on out of bounds index', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      expect(() => sq.update(3, 10)).toThrow(RangeError)
    })

    it('multiple updates on same element', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      sq.update(1, 10)
      sq.update(1, 20)
      expect(sq.get(1)).toBe(20)
    })

    it('updates across multiple blocks', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5, 6, 7, 8, 9])
      sq.update(0, 100)
      sq.update(4, 200)
      sq.update(8, 300)
      expect(sq.query(0, 9)).toBe(630)
    })

    it('update with zero', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      sq.update(1, 0)
      expect(sq.get(1)).toBe(0)
    })

    it('update with negative value', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      sq.update(1, -10)
      expect(sq.get(1)).toBe(-10)
    })
  })

  describe('rangeAdd', () => {
    it('adds value to all elements in range', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5])
      sq.rangeAdd(1, 4, 10)
      expect(sq.get(1)).toBe(12)
      expect(sq.get(2)).toBe(13)
      expect(sq.get(3)).toBe(14)
    })

    it('does not affect elements outside range', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5])
      sq.rangeAdd(1, 4, 10)
      expect(sq.get(0)).toBe(1)
      expect(sq.get(4)).toBe(5)
    })

    it('affects queries after update', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5])
      sq.rangeAdd(0, 5, 1)
      expect(sq.query(0, 5)).toBe(20)
    })

    it('handles single element range', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      sq.rangeAdd(1, 2, 5)
      expect(sq.get(1)).toBe(7)
    })

    it('handles full range update', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5])
      sq.rangeAdd(0, 5, 10)
      expect(sq.query(0, 5)).toBe(65)
    })

    it('handles empty range', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      sq.rangeAdd(1, 1, 10)
      expect(sq.toArray()).toEqual([1, 2, 3])
    })

    it('handles update spanning multiple blocks', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5, 6, 7, 8, 9])
      sq.rangeAdd(1, 8, 1)
      expect(sq.toArray()).toEqual([1, 3, 4, 5, 6, 7, 8, 9, 9])
    })

    it('throws on l > r', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      expect(() => sq.rangeAdd(2, 1, 5)).toThrow(RangeError)
    })

    it('throws on out of bounds', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      expect(() => sq.rangeAdd(0, 4, 5)).toThrow(RangeError)
    })

    it('handles negative delta', () => {
      const sq = new SqrtDecomp2([10, 20, 30, 40, 50])
      sq.rangeAdd(1, 4, -5)
      expect(sq.get(1)).toBe(15)
      expect(sq.get(2)).toBe(25)
      expect(sq.get(3)).toBe(35)
    })

    it('handles zero delta', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      sq.rangeAdd(0, 3, 0)
      expect(sq.toArray()).toEqual([1, 2, 3])
    })

    it('multiple range adds stack correctly', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5])
      sq.rangeAdd(0, 5, 1)
      sq.rangeAdd(2, 5, 2)
      expect(sq.get(2)).toBe(6)
      expect(sq.get(3)).toBe(7)
      expect(sq.get(4)).toBe(8)
      expect(sq.query(0, 5)).toBe(26)
    })
  })

  describe('get', () => {
    it('returns element at index', () => {
      const sq = new SqrtDecomp2([10, 20, 30])
      expect(sq.get(0)).toBe(10)
      expect(sq.get(1)).toBe(20)
      expect(sq.get(2)).toBe(30)
    })

    it('reflects lazy updates', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5])
      sq.rangeAdd(0, 5, 10)
      expect(sq.get(0)).toBe(11)
      expect(sq.get(4)).toBe(15)
    })

    it('throws on negative index', () => {
      const sq = new SqrtDecomp2([1])
      expect(() => sq.get(-1)).toThrow(RangeError)
    })

    it('throws on out of bounds', () => {
      const sq = new SqrtDecomp2([1])
      expect(() => sq.get(1)).toThrow(RangeError)
    })

    it('throws on empty structure', () => {
      const sq = new SqrtDecomp2([])
      expect(() => sq.get(0)).toThrow(RangeError)
    })
  })

  describe('set', () => {
    it('sets element at index', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      sq.set(1, 100)
      expect(sq.get(1)).toBe(100)
    })

    it('throws on invalid index', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      expect(() => sq.set(3, 10)).toThrow(RangeError)
    })
  })

  describe('size and isEmpty', () => {
    it('returns correct size', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      expect(sq.size).toBe(3)
    })

    it('returns 0 for empty', () => {
      const sq = new SqrtDecomp2([])
      expect(sq.size).toBe(0)
    })

    it('isEmpty returns true for empty', () => {
      const sq = new SqrtDecomp2([])
      expect(sq.isEmpty).toBe(true)
    })

    it('isEmpty returns false for non-empty', () => {
      const sq = new SqrtDecomp2([1])
      expect(sq.isEmpty).toBe(false)
    })
  })

  describe('clear', () => {
    it('clears the structure', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      sq.clear()
      expect(sq.size).toBe(0)
      expect(sq.isEmpty).toBe(true)
    })

    it('clear already empty structure', () => {
      const sq = new SqrtDecomp2([])
      sq.clear()
      expect(sq.size).toBe(0)
    })

    it('allows operations after clear', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      sq.clear()
      sq.push(10)
      expect(sq.size).toBe(1)
      expect(sq.get(0)).toBe(10)
    })
  })

  describe('toArray', () => {
    it('returns copy of elements', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      expect(sq.toArray()).toEqual([1, 2, 3])
    })

    it('reflects lazy updates', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5])
      sq.rangeAdd(1, 4, 10)
      expect(sq.toArray()).toEqual([1, 12, 13, 14, 5])
    })

    it('returns empty array for empty structure', () => {
      const sq = new SqrtDecomp2([])
      expect(sq.toArray()).toEqual([])
    })

    it('returns new array each time', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      const a = sq.toArray()
      const b = sq.toArray()
      expect(a).not.toBe(b)
      expect(a).toEqual(b)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5])
      const cl = sq.clone()
      expect(cl.toArray()).toEqual([1, 2, 3, 4, 5])
      expect(cl.size).toBe(sq.size)
    })

    it('modifications to clone do not affect original', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5])
      const cl = sq.clone()
      cl.update(0, 100)
      expect(sq.get(0)).toBe(1)
      expect(cl.get(0)).toBe(100)
    })

    it('modifications to original do not affect clone', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5])
      const cl = sq.clone()
      sq.update(0, 100)
      expect(cl.get(0)).toBe(1)
      expect(sq.get(0)).toBe(100)
    })

    it('clone preserves custom merge', () => {
      const sq = new SqrtDecomp2([5, 3, 7, 1, 4], {
        merge: (a, b) => Math.min(a, b),
        identity: Infinity,
      })
      const cl = sq.clone()
      expect(cl.query(0, 5)).toBe(1)
    })

    it('clone with lazy updates', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5])
      sq.rangeAdd(0, 5, 10)
      const cl = sq.clone()
      expect(cl.toArray()).toEqual([11, 12, 13, 14, 15])
    })
  })

  describe('static fromArray', () => {
    it('creates instance from array', () => {
      const sq = SqrtDecomp2.fromArray([1, 2, 3, 4, 5])
      expect(sq.size).toBe(5)
      expect(sq.query(0, 5)).toBe(15)
    })

    it('creates instance with options', () => {
      const sq = SqrtDecomp2.fromArray([5, 3, 7, 1, 4], {
        merge: (a, b) => Math.max(a, b),
        identity: -Infinity,
      })
      expect(sq.query(0, 5)).toBe(7)
    })

    it('creates instance from empty array', () => {
      const sq = SqrtDecomp2.fromArray([])
      expect(sq.isEmpty).toBe(true)
    })
  })

  describe('forEach', () => {
    it('iterates all elements', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      const result: number[] = []
      sq.forEach((v) => result.push(v))
      expect(result).toEqual([1, 2, 3])
    })

    it('provides correct indices', () => {
      const sq = new SqrtDecomp2([10, 20, 30])
      const indices: number[] = []
      sq.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('iterates empty structure', () => {
      const sq = new SqrtDecomp2([])
      let count = 0
      sq.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('reflects lazy updates', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5])
      sq.rangeAdd(0, 5, 10)
      const result: number[] = []
      sq.forEach((v) => result.push(v))
      expect(result).toEqual([11, 12, 13, 14, 15])
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      const result = [...sq]
      expect(result).toEqual([1, 2, 3])
    })

    it('works with for-of', () => {
      const sq = new SqrtDecomp2([10, 20, 30])
      const result: number[] = []
      for (const v of sq) {
        result.push(v)
      }
      expect(result).toEqual([10, 20, 30])
    })

    it('works with empty structure', () => {
      const sq = new SqrtDecomp2([])
      expect([...sq]).toEqual([])
    })

    it('reflects lazy updates', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      sq.rangeAdd(0, 3, 5)
      expect([...sq]).toEqual([6, 7, 8])
    })
  })

  describe('first', () => {
    it('returns first element', () => {
      const sq = new SqrtDecomp2([10, 20, 30])
      expect(sq.first()).toBe(10)
    })

    it('throws on empty structure', () => {
      const sq = new SqrtDecomp2([])
      expect(() => sq.first()).toThrow(RangeError)
    })

    it('returns first after rangeAdd', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      sq.rangeAdd(0, 3, 5)
      expect(sq.first()).toBe(6)
    })
  })

  describe('last', () => {
    it('returns last element', () => {
      const sq = new SqrtDecomp2([10, 20, 30])
      expect(sq.last()).toBe(30)
    })

    it('throws on empty structure', () => {
      const sq = new SqrtDecomp2([])
      expect(() => sq.last()).toThrow(RangeError)
    })

    it('returns last after rangeAdd', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      sq.rangeAdd(0, 3, 5)
      expect(sq.last()).toBe(8)
    })
  })

  describe('indexOf', () => {
    it('finds first occurrence', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 2, 1])
      expect(sq.indexOf(2)).toBe(1)
    })

    it('returns -1 when not found', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      expect(sq.indexOf(99)).toBe(-1)
    })

    it('finds element at first position', () => {
      const sq = new SqrtDecomp2([10, 20, 30])
      expect(sq.indexOf(10)).toBe(0)
    })

    it('finds element at last position', () => {
      const sq = new SqrtDecomp2([10, 20, 30])
      expect(sq.indexOf(30)).toBe(2)
    })

    it('works on empty structure', () => {
      const sq = new SqrtDecomp2([])
      expect(sq.indexOf(1)).toBe(-1)
    })

    it('finds value after rangeAdd', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      sq.rangeAdd(0, 3, 5)
      expect(sq.indexOf(7)).toBe(1)
    })
  })

  describe('min', () => {
    it('returns minimum element', () => {
      const sq = new SqrtDecomp2([5, 3, 7, 1, 9])
      expect(sq.min()).toBe(1)
    })

    it('throws on empty structure', () => {
      const sq = new SqrtDecomp2([])
      expect(() => sq.min()).toThrow(RangeError)
    })

    it('works with single element', () => {
      const sq = new SqrtDecomp2([42])
      expect(sq.min()).toBe(42)
    })

    it('works with negative numbers', () => {
      const sq = new SqrtDecomp2([-5, -3, -7, -1, -9])
      expect(sq.min()).toBe(-9)
    })

    it('reflects updates', () => {
      const sq = new SqrtDecomp2([5, 3, 7])
      sq.update(1, -10)
      expect(sq.min()).toBe(-10)
    })
  })

  describe('max', () => {
    it('returns maximum element', () => {
      const sq = new SqrtDecomp2([5, 3, 7, 1, 9])
      expect(sq.max()).toBe(9)
    })

    it('throws on empty structure', () => {
      const sq = new SqrtDecomp2([])
      expect(() => sq.max()).toThrow(RangeError)
    })

    it('works with single element', () => {
      const sq = new SqrtDecomp2([42])
      expect(sq.max()).toBe(42)
    })

    it('works with negative numbers', () => {
      const sq = new SqrtDecomp2([-5, -3, -7, -1, -9])
      expect(sq.max()).toBe(-1)
    })

    it('reflects updates', () => {
      const sq = new SqrtDecomp2([5, 3, 7])
      sq.update(1, 100)
      expect(sq.max()).toBe(100)
    })
  })

  describe('sum', () => {
    it('returns sum of all elements', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5])
      expect(sq.sum()).toBe(15)
    })

    it('returns identity for empty', () => {
      const sq = new SqrtDecomp2([])
      expect(sq.sum()).toBe(0)
    })

    it('reflects updates', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      sq.update(1, 10)
      expect(sq.sum()).toBe(14)
    })

    it('reflects rangeAdd', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5])
      sq.rangeAdd(0, 5, 1)
      expect(sq.sum()).toBe(20)
    })
  })

  describe('push', () => {
    it('adds element to end', () => {
      const sq = new SqrtDecomp2([1, 2])
      sq.push(3)
      expect(sq.size).toBe(3)
      expect(sq.get(2)).toBe(3)
    })

    it('push to empty structure', () => {
      const sq = new SqrtDecomp2([])
      sq.push(42)
      expect(sq.size).toBe(1)
      expect(sq.get(0)).toBe(42)
    })

    it('push multiple elements', () => {
      const sq = new SqrtDecomp2([])
      for (let i = 0; i < 10; i++) {
        sq.push(i)
      }
      expect(sq.size).toBe(10)
      expect(sq.query(0, 10)).toBe(45)
    })

    it('push preserves queries', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      expect(sq.query(0, 3)).toBe(6)
      sq.push(4)
      expect(sq.query(0, 4)).toBe(10)
    })

    it('push after rangeAdd', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      sq.rangeAdd(0, 3, 10)
      sq.push(4)
      expect(sq.get(3)).toBe(4)
      expect(sq.get(0)).toBe(11)
    })
  })

  describe('pop', () => {
    it('removes and returns last element', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      expect(sq.pop()).toBe(3)
      expect(sq.size).toBe(2)
    })

    it('pop to empty', () => {
      const sq = new SqrtDecomp2([1])
      expect(sq.pop()).toBe(1)
      expect(sq.isEmpty).toBe(true)
    })

    it('throws on empty structure', () => {
      const sq = new SqrtDecomp2([])
      expect(() => sq.pop()).toThrow(RangeError)
    })

    it('pop multiple elements', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5])
      expect(sq.pop()).toBe(5)
      expect(sq.pop()).toBe(4)
      expect(sq.pop()).toBe(3)
      expect(sq.size).toBe(2)
    })

    it('pop updates queries', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5])
      sq.pop()
      expect(sq.query(0, 4)).toBe(10)
    })

    it('pop after rangeAdd', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      sq.rangeAdd(0, 3, 10)
      expect(sq.pop()).toBe(13)
      expect(sq.toArray()).toEqual([11, 12])
    })
  })

  describe('custom operations', () => {
    it('min operation with queries', () => {
      const sq = new SqrtDecomp2([5, 3, 8, 1, 9, 2, 7, 4, 6], {
        merge: (a, b) => Math.min(a, b),
        identity: Infinity,
      })
      expect(sq.query(0, 9)).toBe(1)
      expect(sq.query(2, 5)).toBe(1)
      expect(sq.query(5, 8)).toBe(2)
    })

    it('max operation with queries', () => {
      const sq = new SqrtDecomp2([5, 3, 8, 1, 9, 2, 7, 4, 6], {
        merge: (a, b) => Math.max(a, b),
        identity: -Infinity,
      })
      expect(sq.query(0, 9)).toBe(9)
      expect(sq.query(2, 5)).toBe(9)
      expect(sq.query(5, 8)).toBe(7)
    })

    it('product operation', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5], {
        merge: (a, b) => a * b,
        identity: 1,
      })
      expect(sq.query(0, 5)).toBe(120)
      expect(sq.query(1, 4)).toBe(24)
    })

    it('min operation with update', () => {
      const sq = new SqrtDecomp2([5, 3, 8, 1, 9], {
        merge: (a, b) => Math.min(a, b),
        identity: Infinity,
      })
      sq.update(2, 0)
      expect(sq.query(0, 5)).toBe(0)
    })
  })

  describe('custom blockSize', () => {
    it('blockSize 2 works correctly', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5, 6], { blockSize: 2 })
      expect(sq.query(0, 6)).toBe(21)
      expect(sq.query(1, 4)).toBe(9)
    })

    it('blockSize larger than array', () => {
      const sq = new SqrtDecomp2([1, 2, 3], { blockSize: 10 })
      expect(sq.query(0, 3)).toBe(6)
    })

    it('blockSize equal to array length', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5], { blockSize: 5 })
      expect(sq.query(0, 5)).toBe(15)
    })

    it('rangeAdd with custom blockSize', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5, 6, 7, 8, 9], { blockSize: 3 })
      sq.rangeAdd(1, 8, 10)
      expect(sq.get(0)).toBe(1)
      expect(sq.get(1)).toBe(12)
      expect(sq.get(7)).toBe(18)
      expect(sq.get(8)).toBe(9)
    })

    it('update with custom blockSize', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5, 6], { blockSize: 2 })
      sq.update(3, 100)
      expect(sq.get(3)).toBe(100)
      expect(sq.query(0, 6)).toBe(117)
    })
  })

  describe('complex scenarios', () => {
    it('alternating push and update', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      sq.push(4)
      sq.update(0, 10)
      sq.push(5)
      expect(sq.toArray()).toEqual([10, 2, 3, 4, 5])
      expect(sq.query(0, 5)).toBe(24)
    })

    it('rangeAdd then update', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5])
      sq.rangeAdd(0, 5, 10)
      sq.update(2, 0)
      expect(sq.get(2)).toBe(0)
      expect(sq.query(0, 5)).toBe(52)
    })

    it('update then rangeAdd', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5])
      sq.update(2, 100)
      sq.rangeAdd(1, 4, 10)
      expect(sq.get(1)).toBe(12)
      expect(sq.get(2)).toBe(110)
      expect(sq.get(3)).toBe(14)
    })

    it('clone after rangeAdd', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5])
      sq.rangeAdd(0, 5, 10)
      const cl = sq.clone()
      cl.update(0, 0)
      expect(sq.get(0)).toBe(11)
      expect(cl.get(0)).toBe(0)
    })

    it('clear and reuse', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      sq.clear()
      sq.push(10)
      sq.push(20)
      sq.push(30)
      expect(sq.query(0, 3)).toBe(60)
    })

    it('large dataset operations', () => {
      const n = 10000
      const arr = Array.from({ length: n }, (_, i) => i + 1)
      const sq = new SqrtDecomp2(arr)
      expect(sq.query(0, n)).toBe((n * (n + 1)) / 2)
      sq.rangeAdd(0, n, 1)
      expect(sq.query(0, n)).toBe((n * (n + 1)) / 2 + n)
      sq.update(0, 0)
      expect(sq.get(0)).toBe(0)
    })

    it('multiple lazy propagation flushes', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5, 6, 7, 8, 9])
      sq.rangeAdd(0, 9, 1)
      sq.rangeAdd(3, 6, 2)
      sq.rangeAdd(0, 3, 3)
      expect(sq.query(0, 9)).toBe(69)
    })

    it('sequential push and pop', () => {
      const sq = new SqrtDecomp2<number>([])
      sq.push(1)
      sq.push(2)
      sq.push(3)
      expect(sq.pop()).toBe(3)
      expect(sq.pop()).toBe(2)
      expect(sq.pop()).toBe(1)
      expect(sq.isEmpty).toBe(true)
    })

    it('push after pop', () => {
      const sq = new SqrtDecomp2([1, 2, 3])
      sq.pop()
      sq.push(4)
      expect(sq.toArray()).toEqual([1, 2, 4])
    })

    it('indexOf after multiple operations', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5])
      sq.rangeAdd(0, 5, 10)
      sq.update(2, 100)
      expect(sq.indexOf(100)).toBe(2)
      expect(sq.indexOf(11)).toBe(0)
      expect(sq.indexOf(3)).toBe(-1)
    })
  })

  describe('edge cases', () => {
    it('handles array of all same values', () => {
      const sq = new SqrtDecomp2([5, 5, 5, 5, 5])
      expect(sq.query(0, 5)).toBe(25)
      sq.rangeAdd(1, 4, 5)
      expect(sq.get(1)).toBe(10)
      expect(sq.query(0, 5)).toBe(40)
    })

    it('handles single element array', () => {
      const sq = new SqrtDecomp2([42])
      expect(sq.query(0, 1)).toBe(42)
      sq.update(0, 100)
      expect(sq.get(0)).toBe(100)
      sq.rangeAdd(0, 1, 5)
      expect(sq.get(0)).toBe(105)
    })

    it('handles two element array', () => {
      const sq = new SqrtDecomp2([1, 2])
      expect(sq.query(0, 2)).toBe(3)
      expect(sq.query(0, 1)).toBe(1)
      expect(sq.query(1, 2)).toBe(2)
    })

    it('handles large values', () => {
      const sq = new SqrtDecomp2([Number.MAX_SAFE_INTEGER, 0])
      expect(sq.query(0, 2)).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('min/max on same-valued array', () => {
      const sq = new SqrtDecomp2([5, 5, 5])
      expect(sq.min()).toBe(5)
      expect(sq.max()).toBe(5)
    })

    it('first/last on single element', () => {
      const sq = new SqrtDecomp2([42])
      expect(sq.first()).toBe(42)
      expect(sq.last()).toBe(42)
    })

    it('sum with identity for single element', () => {
      const sq = new SqrtDecomp2([10])
      expect(sq.sum()).toBe(10)
    })

    it('handles all zeros', () => {
      const sq = new SqrtDecomp2([0, 0, 0, 0])
      expect(sq.sum()).toBe(0)
      expect(sq.min()).toBe(0)
      expect(sq.max()).toBe(0)
    })

    it('handles negative array', () => {
      const sq = new SqrtDecomp2([-1, -2, -3])
      expect(sq.sum()).toBe(-6)
      expect(sq.min()).toBe(-3)
      expect(sq.max()).toBe(-1)
    })
  })

  describe('type safety', () => {
    it('works with number type', () => {
      const sq = new SqrtDecomp2<number>([1, 2, 3])
      expect(sq.get(0)).toBeTypeOf('number')
    })

    it('works with string type and custom merge', () => {
      const sq = new SqrtDecomp2<string>(['x', 'y', 'z'], {
        merge: (a, b) => a + b,
        identity: '',
      })
      expect(sq.query(0, 3)).toBe('xyz')
    })
  })

  describe('rangeAdd edge cases', () => {
    it('rangeAdd at exact block boundary', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5, 6, 7, 8, 9], { blockSize: 3 })
      sq.rangeAdd(3, 6, 10)
      expect(sq.get(2)).toBe(3)
      expect(sq.get(3)).toBe(14)
      expect(sq.get(5)).toBe(16)
      expect(sq.get(6)).toBe(7)
    })

    it('rangeAdd covering all blocks fully', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5, 6, 7, 8, 9], { blockSize: 3 })
      sq.rangeAdd(0, 9, 10)
      expect(sq.toArray()).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19])
    })

    it('rangeAdd then query on updated range', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5, 6, 7, 8, 9])
      sq.rangeAdd(2, 7, 5)
      expect(sq.query(2, 7)).toBe(50)
    })

    it('rangeAdd with negative on block boundary', () => {
      const sq = new SqrtDecomp2([10, 20, 30, 40, 50, 60], { blockSize: 2 })
      sq.rangeAdd(2, 4, -5)
      expect(sq.get(2)).toBe(25)
      expect(sq.get(3)).toBe(35)
      expect(sq.get(4)).toBe(50)
    })
  })

  describe('query edge cases', () => {
    it('query at block boundary start', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5, 6, 7, 8, 9], { blockSize: 3 })
      expect(sq.query(3, 6)).toBe(15)
    })

    it('query single element at block boundary', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5, 6, 7, 8, 9], { blockSize: 3 })
      expect(sq.query(3, 4)).toBe(4)
      expect(sq.query(6, 7)).toBe(7)
    })

    it('query full range equals sum', () => {
      const sq = new SqrtDecomp2([1, 2, 3, 4, 5])
      expect(sq.query(0, 5)).toBe(sq.sum())
    })
  })
})
