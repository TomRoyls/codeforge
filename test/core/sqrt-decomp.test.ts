import { describe, it, expect } from 'vitest'
import { SqrtDecomposition } from '../../src/core/sqrt-decomp/index.js'
import type { SqrtDecompositionOptions } from '../../src/core/sqrt-decomp/types.js'

describe('SqrtDecomposition', () => {
  describe('constructor', () => {
    it('creates instance with empty array', () => {
      const sq = new SqrtDecomposition([])
      expect(sq.size).toBe(0)
      expect(sq.isEmpty).toBe(true)
    })

    it('creates instance with single element', () => {
      const sq = new SqrtDecomposition([42])
      expect(sq.size).toBe(1)
      expect(sq.isEmpty).toBe(false)
      expect(sq.get(0)).toBe(42)
    })

    it('creates instance with multiple elements', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4, 5])
      expect(sq.size).toBe(5)
    })

    it('creates instance with default SUM operation', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4, 5])
      expect(sq.rangeQuery(0, 4)).toBe(15)
    })

    it('creates instance with custom MIN operation', () => {
      const sq = new SqrtDecomposition([5, 3, 7, 1, 4], {
        operation: (a, b) => Math.min(a, b),
        identity: Infinity,
      })
      expect(sq.rangeQuery(0, 4)).toBe(1)
    })

    it('creates instance with custom MAX operation', () => {
      const sq = new SqrtDecomposition([5, 3, 7, 1, 4], {
        operation: (a, b) => Math.max(a, b),
        identity: -Infinity,
      })
      expect(sq.rangeQuery(0, 4)).toBe(7)
    })

    it('creates instance with GCD operation', () => {
      const sq = new SqrtDecomposition([12, 18, 24, 9, 15], {
        operation: (a, b) => {
          let x = a
          let y = b
          while (y !== 0) {
            const temp = y
            y = x % y
            x = temp
          }
          return x
        },
        identity: 0,
      })
      expect(sq.rangeQuery(0, 4)).toBe(3)
    })

    it('creates instance with string concatenation', () => {
      const sq = new SqrtDecomposition(['a', 'b', 'c'], {
        operation: (a, b) => a + b,
        identity: '',
      })
      expect(sq.rangeQuery(0, 2)).toBe('abc')
    })

    it('preserves original array (does not mutate)', () => {
      const arr = [1, 2, 3]
      new SqrtDecomposition(arr)
      expect(arr).toEqual([1, 2, 3])
    })
  })

  describe('blockSize and blockCount', () => {
    it('computes correct blockSize for 0 elements', () => {
      const sq = new SqrtDecomposition([])
      expect(sq.blockSize).toBe(1)
      expect(sq.blockCount).toBe(0)
    })

    it('computes correct blockSize for 1 element', () => {
      const sq = new SqrtDecomposition([1])
      expect(sq.blockSize).toBe(1)
      expect(sq.blockCount).toBe(1)
    })

    it('computes correct blockSize for 4 elements', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4])
      expect(sq.blockSize).toBe(2)
      expect(sq.blockCount).toBe(2)
    })

    it('computes correct blockSize for 9 elements', () => {
      const sq = new SqrtDecomposition(Array.from({ length: 9 }, (_, i) => i))
      expect(sq.blockSize).toBe(3)
      expect(sq.blockCount).toBe(3)
    })

    it('computes correct blockSize for 10 elements', () => {
      const sq = new SqrtDecomposition(Array.from({ length: 10 }, (_, i) => i))
      expect(sq.blockSize).toBe(4)
      expect(sq.blockCount).toBe(3)
    })

    it('computes correct blockSize for 16 elements', () => {
      const sq = new SqrtDecomposition(Array.from({ length: 16 }, (_, i) => i))
      expect(sq.blockSize).toBe(4)
      expect(sq.blockCount).toBe(4)
    })

    it('computes correct blockSize for 17 elements', () => {
      const sq = new SqrtDecomposition(Array.from({ length: 17 }, (_, i) => i))
      expect(sq.blockSize).toBe(5)
      expect(sq.blockCount).toBe(4)
    })

    it('computes correct blockSize for 100 elements', () => {
      const sq = new SqrtDecomposition(Array.from({ length: 100 }, (_, i) => i))
      expect(sq.blockSize).toBe(10)
      expect(sq.blockCount).toBe(10)
    })
  })

  describe('rangeQuery', () => {
    it('queries single element', () => {
      const sq = new SqrtDecomposition([10, 20, 30, 40, 50])
      expect(sq.rangeQuery(2, 2)).toBe(30)
    })

    it('queries entire range', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4, 5])
      expect(sq.rangeQuery(0, 4)).toBe(15)
    })

    it('queries partial range within one block', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4, 5, 6, 7, 8, 9])
      expect(sq.rangeQuery(1, 2)).toBe(5)
    })

    it('queries range spanning multiple blocks', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4, 5, 6, 7, 8, 9])
      expect(sq.rangeQuery(2, 6)).toBe(25)
    })

    it('queries first element', () => {
      const sq = new SqrtDecomposition([10, 20, 30])
      expect(sq.rangeQuery(0, 0)).toBe(10)
    })

    it('queries last element', () => {
      const sq = new SqrtDecomposition([10, 20, 30])
      expect(sq.rangeQuery(2, 2)).toBe(30)
    })

    it('throws on from > to', () => {
      const sq = new SqrtDecomposition([1, 2, 3])
      expect(() => sq.rangeQuery(2, 1)).toThrow(RangeError)
    })

    it('throws on negative from', () => {
      const sq = new SqrtDecomposition([1, 2, 3])
      expect(() => sq.rangeQuery(-1, 2)).toThrow(RangeError)
    })

    it('throws on to >= size', () => {
      const sq = new SqrtDecomposition([1, 2, 3])
      expect(() => sq.rangeQuery(0, 3)).toThrow(RangeError)
    })

    it('works with negative numbers', () => {
      const sq = new SqrtDecomposition([-1, -2, -3, -4, -5])
      expect(sq.rangeQuery(0, 4)).toBe(-15)
    })

    it('works with zeros', () => {
      const sq = new SqrtDecomposition([0, 0, 0, 0])
      expect(sq.rangeQuery(0, 3)).toBe(0)
    })

    it('handles large array correctly', () => {
      const arr = Array.from({ length: 1000 }, (_, i) => i + 1)
      const sq = new SqrtDecomposition(arr)
      expect(sq.rangeQuery(0, 999)).toBe(500500)
    })

    it('handles query across all blocks with gaps', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
      const sq = new SqrtDecomposition(arr)
      expect(sq.rangeQuery(3, 12)).toBe(85)
    })
  })

  describe('pointUpdate', () => {
    it('updates single element', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4, 5])
      sq.pointUpdate(2, 10)
      expect(sq.get(2)).toBe(10)
    })

    it('updates affect range queries', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4, 5])
      sq.pointUpdate(2, 10)
      expect(sq.rangeQuery(0, 4)).toBe(22)
    })

    it('updates first element', () => {
      const sq = new SqrtDecomposition([1, 2, 3])
      sq.pointUpdate(0, 100)
      expect(sq.get(0)).toBe(100)
    })

    it('updates last element', () => {
      const sq = new SqrtDecomposition([1, 2, 3])
      sq.pointUpdate(2, 100)
      expect(sq.get(2)).toBe(100)
    })

    it('throws on negative index', () => {
      const sq = new SqrtDecomposition([1, 2, 3])
      expect(() => sq.pointUpdate(-1, 10)).toThrow(RangeError)
    })

    it('throws on out of bounds index', () => {
      const sq = new SqrtDecomposition([1, 2, 3])
      expect(() => sq.pointUpdate(3, 10)).toThrow(RangeError)
    })

    it('updates with zero', () => {
      const sq = new SqrtDecomposition([1, 2, 3])
      sq.pointUpdate(1, 0)
      expect(sq.get(1)).toBe(0)
      expect(sq.rangeQuery(0, 2)).toBe(4)
    })

    it('updates with negative value', () => {
      const sq = new SqrtDecomposition([1, 2, 3])
      sq.pointUpdate(1, -10)
      expect(sq.get(1)).toBe(-10)
      expect(sq.rangeQuery(0, 2)).toBe(-6)
    })

    it('multiple updates on same element', () => {
      const sq = new SqrtDecomposition([1, 2, 3])
      sq.pointUpdate(1, 10)
      sq.pointUpdate(1, 20)
      expect(sq.get(1)).toBe(20)
      expect(sq.rangeQuery(0, 2)).toBe(24)
    })

    it('updates across multiple blocks', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4, 5, 6, 7, 8, 9])
      sq.pointUpdate(0, 100)
      sq.pointUpdate(4, 200)
      sq.pointUpdate(8, 300)
      expect(sq.rangeQuery(0, 8)).toBe(630)
    })
  })

  describe('rangeUpdate', () => {
    it('adds delta to all elements in range', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4, 5])
      sq.rangeUpdate(1, 3, 10)
      expect(sq.get(1)).toBe(12)
      expect(sq.get(2)).toBe(13)
      expect(sq.get(3)).toBe(14)
    })

    it('does not affect elements outside range', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4, 5])
      sq.rangeUpdate(1, 3, 10)
      expect(sq.get(0)).toBe(1)
      expect(sq.get(4)).toBe(5)
    })

    it('affects range queries after update', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4, 5])
      sq.rangeUpdate(0, 4, 1)
      expect(sq.rangeQuery(0, 4)).toBe(20)
    })

    it('handles single element range update', () => {
      const sq = new SqrtDecomposition([1, 2, 3])
      sq.rangeUpdate(1, 1, 5)
      expect(sq.get(1)).toBe(7)
    })

    it('handles full range update', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4, 5])
      sq.rangeUpdate(0, 4, 10)
      expect(sq.rangeQuery(0, 4)).toBe(65)
    })

    it('handles update within single block', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4, 5, 6, 7, 8, 9])
      sq.rangeUpdate(1, 2, 10)
      expect(sq.get(1)).toBe(12)
      expect(sq.get(2)).toBe(13)
      expect(sq.get(3)).toBe(4)
    })

    it('handles update spanning multiple blocks', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4, 5, 6, 7, 8, 9])
      sq.rangeUpdate(1, 7, 1)
      expect(sq.toArray()).toEqual([1, 3, 4, 5, 6, 7, 8, 9, 9])
    })

    it('throws on invalid range', () => {
      const sq = new SqrtDecomposition([1, 2, 3])
      expect(() => sq.rangeUpdate(2, 1, 5)).toThrow(RangeError)
    })

    it('throws on out of bounds', () => {
      const sq = new SqrtDecomposition([1, 2, 3])
      expect(() => sq.rangeUpdate(0, 3, 5)).toThrow(RangeError)
    })

    it('handles negative delta', () => {
      const sq = new SqrtDecomposition([10, 20, 30, 40, 50])
      sq.rangeUpdate(1, 3, -5)
      expect(sq.get(1)).toBe(15)
      expect(sq.get(2)).toBe(25)
      expect(sq.get(3)).toBe(35)
    })

    it('handles zero delta', () => {
      const sq = new SqrtDecomposition([1, 2, 3])
      sq.rangeUpdate(0, 2, 0)
      expect(sq.toArray()).toEqual([1, 2, 3])
    })

    it('multiple range updates stack correctly', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4, 5])
      sq.rangeUpdate(0, 4, 1)
      sq.rangeUpdate(2, 4, 2)
      expect(sq.get(2)).toBe(6)
      expect(sq.get(3)).toBe(7)
      expect(sq.get(4)).toBe(8)
      expect(sq.rangeQuery(0, 4)).toBe(26)
    })
  })

  describe('get', () => {
    it('returns element at index', () => {
      const sq = new SqrtDecomposition([10, 20, 30])
      expect(sq.get(0)).toBe(10)
      expect(sq.get(1)).toBe(20)
      expect(sq.get(2)).toBe(30)
    })

    it('reflects lazy updates', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4, 5])
      sq.rangeUpdate(0, 4, 10)
      expect(sq.get(0)).toBe(11)
      expect(sq.get(4)).toBe(15)
    })

    it('throws on negative index', () => {
      const sq = new SqrtDecomposition([1])
      expect(() => sq.get(-1)).toThrow(RangeError)
    })

    it('throws on out of bounds', () => {
      const sq = new SqrtDecomposition([1])
      expect(() => sq.get(1)).toThrow(RangeError)
    })

    it('throws on empty structure', () => {
      const sq = new SqrtDecomposition([])
      expect(() => sq.get(0)).toThrow(RangeError)
    })
  })

  describe('set', () => {
    it('sets element at index (alias for pointUpdate)', () => {
      const sq = new SqrtDecomposition([1, 2, 3])
      sq.set(1, 100)
      expect(sq.get(1)).toBe(100)
    })

    it('throws on invalid index', () => {
      const sq = new SqrtDecomposition([1, 2, 3])
      expect(() => sq.set(3, 10)).toThrow(RangeError)
    })
  })

  describe('size and isEmpty', () => {
    it('returns correct size', () => {
      const sq = new SqrtDecomposition([1, 2, 3])
      expect(sq.size).toBe(3)
    })

    it('returns 0 for empty', () => {
      const sq = new SqrtDecomposition([])
      expect(sq.size).toBe(0)
    })

    it('isEmpty returns true for empty', () => {
      const sq = new SqrtDecomposition([])
      expect(sq.isEmpty).toBe(true)
    })

    it('isEmpty returns false for non-empty', () => {
      const sq = new SqrtDecomposition([1])
      expect(sq.isEmpty).toBe(false)
    })
  })

  describe('clear', () => {
    it('clears the structure', () => {
      const sq = new SqrtDecomposition([1, 2, 3])
      sq.clear()
      expect(sq.size).toBe(0)
      expect(sq.isEmpty).toBe(true)
      expect(sq.blockCount).toBe(0)
    })

    it('clear already empty structure', () => {
      const sq = new SqrtDecomposition([])
      sq.clear()
      expect(sq.size).toBe(0)
    })

    it('allows operations after clear', () => {
      const sq = new SqrtDecomposition([1, 2, 3])
      sq.clear()
      sq.push(10)
      expect(sq.size).toBe(1)
      expect(sq.get(0)).toBe(10)
    })
  })

  describe('toArray', () => {
    it('returns copy of elements', () => {
      const sq = new SqrtDecomposition([1, 2, 3])
      expect(sq.toArray()).toEqual([1, 2, 3])
    })

    it('reflects lazy updates', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4, 5])
      sq.rangeUpdate(1, 3, 10)
      expect(sq.toArray()).toEqual([1, 12, 13, 14, 5])
    })

    it('returns empty array for empty structure', () => {
      const sq = new SqrtDecomposition([])
      expect(sq.toArray()).toEqual([])
    })

    it('returns new array each time', () => {
      const sq = new SqrtDecomposition([1, 2, 3])
      const a = sq.toArray()
      const b = sq.toArray()
      expect(a).not.toBe(b)
      expect(a).toEqual(b)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4, 5])
      const cl = sq.clone()
      expect(cl.toArray()).toEqual([1, 2, 3, 4, 5])
      expect(cl.size).toBe(sq.size)
    })

    it('modifications to clone do not affect original', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4, 5])
      const cl = sq.clone()
      cl.pointUpdate(0, 100)
      expect(sq.get(0)).toBe(1)
      expect(cl.get(0)).toBe(100)
    })

    it('modifications to original do not affect clone', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4, 5])
      const cl = sq.clone()
      sq.pointUpdate(0, 100)
      expect(cl.get(0)).toBe(1)
      expect(sq.get(0)).toBe(100)
    })

    it('clone preserves custom operation', () => {
      const sq = new SqrtDecomposition([5, 3, 7, 1, 4], {
        operation: (a, b) => Math.min(a, b),
        identity: Infinity,
      })
      const cl = sq.clone()
      expect(cl.rangeQuery(0, 4)).toBe(1)
    })

    it('clone with lazy updates', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4, 5])
      sq.rangeUpdate(0, 4, 10)
      const cl = sq.clone()
      expect(cl.toArray()).toEqual([11, 12, 13, 14, 15])
    })
  })

  describe('push', () => {
    it('adds element to end', () => {
      const sq = new SqrtDecomposition([1, 2])
      sq.push(3)
      expect(sq.size).toBe(3)
      expect(sq.get(2)).toBe(3)
    })

    it('push to empty structure', () => {
      const sq = new SqrtDecomposition([])
      sq.push(42)
      expect(sq.size).toBe(1)
      expect(sq.get(0)).toBe(42)
    })

    it('push multiple elements', () => {
      const sq = new SqrtDecomposition([])
      for (let i = 0; i < 10; i++) {
        sq.push(i)
      }
      expect(sq.size).toBe(10)
      expect(sq.rangeQuery(0, 9)).toBe(45)
    })

    it('push updates block count when crossing block boundary', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4])
      const bc1 = sq.blockCount
      sq.push(5)
      const bc2 = sq.blockCount
      expect(bc2).toBeGreaterThanOrEqual(bc1)
    })

    it('push preserves range queries', () => {
      const sq = new SqrtDecomposition([1, 2, 3])
      expect(sq.rangeQuery(0, 2)).toBe(6)
      sq.push(4)
      expect(sq.rangeQuery(0, 3)).toBe(10)
    })
  })

  describe('pop', () => {
    it('removes and returns last element', () => {
      const sq = new SqrtDecomposition([1, 2, 3])
      expect(sq.pop()).toBe(3)
      expect(sq.size).toBe(2)
    })

    it('pop to empty', () => {
      const sq = new SqrtDecomposition([1])
      expect(sq.pop()).toBe(1)
      expect(sq.isEmpty).toBe(true)
    })

    it('throws on empty structure', () => {
      const sq = new SqrtDecomposition([])
      expect(() => sq.pop()).toThrow(RangeError)
    })

    it('pop multiple elements', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4, 5])
      expect(sq.pop()).toBe(5)
      expect(sq.pop()).toBe(4)
      expect(sq.pop()).toBe(3)
      expect(sq.size).toBe(2)
    })

    it('pop updates range query', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4, 5])
      sq.pop()
      expect(sq.rangeQuery(0, 3)).toBe(10)
    })
  })

  describe('static fromArray', () => {
    it('creates instance from array', () => {
      const sq = SqrtDecomposition.fromArray([1, 2, 3, 4, 5])
      expect(sq.size).toBe(5)
      expect(sq.rangeQuery(0, 4)).toBe(15)
    })

    it('creates instance with options', () => {
      const sq = SqrtDecomposition.fromArray([5, 3, 7, 1, 4], {
        operation: (a, b) => Math.max(a, b),
        identity: -Infinity,
      })
      expect(sq.rangeQuery(0, 4)).toBe(7)
    })

    it('creates instance from empty array', () => {
      const sq = SqrtDecomposition.fromArray([])
      expect(sq.isEmpty).toBe(true)
    })
  })

  describe('forEach', () => {
    it('iterates all elements', () => {
      const sq = new SqrtDecomposition([1, 2, 3])
      const result: number[] = []
      sq.forEach((v) => result.push(v))
      expect(result).toEqual([1, 2, 3])
    })

    it('provides correct indices', () => {
      const sq = new SqrtDecomposition([10, 20, 30])
      const indices: number[] = []
      sq.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('iterates empty structure', () => {
      const sq = new SqrtDecomposition([])
      let count = 0
      sq.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('reflects lazy updates', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4, 5])
      sq.rangeUpdate(0, 4, 10)
      const result: number[] = []
      sq.forEach((v) => result.push(v))
      expect(result).toEqual([11, 12, 13, 14, 15])
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable', () => {
      const sq = new SqrtDecomposition([1, 2, 3])
      const result = [...sq]
      expect(result).toEqual([1, 2, 3])
    })

    it('works with for-of', () => {
      const sq = new SqrtDecomposition([10, 20, 30])
      const result: number[] = []
      for (const v of sq) {
        result.push(v)
      }
      expect(result).toEqual([10, 20, 30])
    })

    it('works with empty structure', () => {
      const sq = new SqrtDecomposition([])
      const result = [...sq]
      expect(result).toEqual([])
    })

    it('reflects lazy updates', () => {
      const sq = new SqrtDecomposition([1, 2, 3])
      sq.rangeUpdate(0, 2, 5)
      expect([...sq]).toEqual([6, 7, 8])
    })
  })

  describe('rebuild', () => {
    it('rebuilds after many pushes', () => {
      const sq = new SqrtDecomposition([1])
      for (let i = 0; i < 100; i++) {
        sq.push(i)
      }
      sq.rebuild()
      const expected = Array.from({ length: 101 }, (_, i) => i === 0 ? 1 : i - 1)
      expected[0] = 1
      expect(sq.rangeQuery(0, sq.size - 1)).toBe(expected.reduce((a, b) => a + b, 0))
    })

    it('rebuild optimizes blockSize', () => {
      const sq = new SqrtDecomposition([1])
      for (let i = 0; i < 15; i++) {
        sq.push(i)
      }
      const oldSize = sq.blockSize
      sq.rebuild()
      expect(sq.blockSize).toBeGreaterThanOrEqual(oldSize)
    })

    it('rebuild on empty', () => {
      const sq = new SqrtDecomposition([])
      sq.rebuild()
      expect(sq.isEmpty).toBe(true)
    })

    it('preserves data after rebuild', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4, 5])
      sq.rangeUpdate(1, 3, 10)
      sq.rebuild()
      expect(sq.toArray()).toEqual([1, 12, 13, 14, 5])
    })
  })

  describe('custom operations', () => {
    it('MIN operation with range queries', () => {
      const sq = new SqrtDecomposition([5, 3, 8, 1, 9, 2, 7, 4, 6], {
        operation: (a, b) => Math.min(a, b),
        identity: Infinity,
      })
      expect(sq.rangeQuery(0, 8)).toBe(1)
      expect(sq.rangeQuery(2, 4)).toBe(1)
      expect(sq.rangeQuery(5, 7)).toBe(2)
    })

    it('MAX operation with range queries', () => {
      const sq = new SqrtDecomposition([5, 3, 8, 1, 9, 2, 7, 4, 6], {
        operation: (a, b) => Math.max(a, b),
        identity: -Infinity,
      })
      expect(sq.rangeQuery(0, 8)).toBe(9)
      expect(sq.rangeQuery(2, 4)).toBe(9)
      expect(sq.rangeQuery(5, 7)).toBe(7)
    })

    it('product operation', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4, 5], {
        operation: (a, b) => a * b,
        identity: 1,
      })
      expect(sq.rangeQuery(0, 4)).toBe(120)
      expect(sq.rangeQuery(1, 3)).toBe(24)
    })

    it('XOR operation', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4, 5], {
        operation: (a, b) => a ^ b,
        identity: 0,
      })
      expect(sq.rangeQuery(0, 4)).toBe(1)
      expect(sq.rangeQuery(1, 3)).toBe(5)
    })

    it('MIN operation with pointUpdate', () => {
      const sq = new SqrtDecomposition([5, 3, 8, 1, 9], {
        operation: (a, b) => Math.min(a, b),
        identity: Infinity,
      })
      sq.pointUpdate(2, 0)
      expect(sq.rangeQuery(0, 4)).toBe(0)
    })

    it('MAX operation with rangeUpdate', () => {
      const sq = new SqrtDecomposition([5, 3, 8, 1, 9], {
        operation: (a, b) => Math.max(a, b),
        identity: -Infinity,
      })
      expect(() => sq.rangeUpdate(0, 4, 10)).not.toThrow()
    })
  })

  describe('complex scenarios', () => {
    it('alternating push and pointUpdate', () => {
      const sq = new SqrtDecomposition([1, 2, 3])
      sq.push(4)
      sq.pointUpdate(0, 10)
      sq.push(5)
      expect(sq.toArray()).toEqual([10, 2, 3, 4, 5])
      expect(sq.rangeQuery(0, 4)).toBe(24)
    })

    it('rangeUpdate then pointUpdate', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4, 5])
      sq.rangeUpdate(0, 4, 10)
      sq.pointUpdate(2, 0)
      expect(sq.get(2)).toBe(0)
      expect(sq.rangeQuery(0, 4)).toBe(52)
    })

    it('pointUpdate then rangeUpdate', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4, 5])
      sq.pointUpdate(2, 100)
      sq.rangeUpdate(1, 3, 10)
      expect(sq.get(1)).toBe(12)
      expect(sq.get(2)).toBe(110)
      expect(sq.get(3)).toBe(14)
    })

    it('clone after rangeUpdate', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4, 5])
      sq.rangeUpdate(0, 4, 10)
      const cl = sq.clone()
      cl.pointUpdate(0, 0)
      expect(sq.get(0)).toBe(11)
      expect(cl.get(0)).toBe(0)
    })

    it('clear and reuse', () => {
      const sq = new SqrtDecomposition([1, 2, 3])
      sq.clear()
      sq.push(10)
      sq.push(20)
      sq.push(30)
      expect(sq.rangeQuery(0, 2)).toBe(60)
    })

    it('large dataset operations', () => {
      const n = 10000
      const arr = Array.from({ length: n }, (_, i) => i + 1)
      const sq = new SqrtDecomposition(arr)
      expect(sq.rangeQuery(0, n - 1)).toBe((n * (n + 1)) / 2)
      sq.rangeUpdate(0, n - 1, 1)
      expect(sq.rangeQuery(0, n - 1)).toBe((n * (n + 1)) / 2 + n)
      sq.pointUpdate(0, 0)
      expect(sq.get(0)).toBe(0)
    })

    it('rangeUpdate on boundary elements', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4, 5, 6, 7, 8, 9])
      const bs = sq.blockSize
      sq.rangeUpdate(bs - 1, bs, 10)
      expect(sq.get(bs - 1)).toBe(bs + 10 - 1 + 1)
      expect(sq.get(bs)).toBe(bs + 1 + 10)
    })
  })

  describe('edge cases', () => {
    it('handles array of all same values', () => {
      const sq = new SqrtDecomposition([5, 5, 5, 5, 5])
      expect(sq.rangeQuery(0, 4)).toBe(25)
      sq.rangeUpdate(1, 3, 5)
      expect(sq.get(1)).toBe(10)
      expect(sq.rangeQuery(0, 4)).toBe(40)
    })

    it('handles single element array', () => {
      const sq = new SqrtDecomposition([42])
      expect(sq.rangeQuery(0, 0)).toBe(42)
      sq.pointUpdate(0, 100)
      expect(sq.get(0)).toBe(100)
      sq.rangeUpdate(0, 0, 5)
      expect(sq.get(0)).toBe(105)
    })

    it('handles two element array', () => {
      const sq = new SqrtDecomposition([1, 2])
      expect(sq.rangeQuery(0, 1)).toBe(3)
      expect(sq.rangeQuery(0, 0)).toBe(1)
      expect(sq.rangeQuery(1, 1)).toBe(2)
    })

    it('handles large values', () => {
      const sq = new SqrtDecomposition([Number.MAX_SAFE_INTEGER, 0])
      expect(sq.rangeQuery(0, 1)).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('handles sequential push and pop', () => {
      const sq = new SqrtDecomposition<number>([])
      sq.push(1)
      sq.push(2)
      sq.push(3)
      expect(sq.pop()).toBe(3)
      expect(sq.pop()).toBe(2)
      expect(sq.pop()).toBe(1)
      expect(sq.isEmpty).toBe(true)
    })

    it('handles push after pop', () => {
      const sq = new SqrtDecomposition([1, 2, 3])
      sq.pop()
      sq.push(4)
      expect(sq.toArray()).toEqual([1, 2, 4])
    })

    it('rangeUpdate then get at boundary', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4, 5, 6, 7, 8, 9])
      const bs = sq.blockSize
      sq.rangeUpdate(0, 2 * bs - 1, 100)
      expect(sq.get(bs - 1)).toBe(bs + 100)
      expect(sq.get(bs)).toBe(bs + 1 + 100)
    })

    it('multiple lazy propagation flushes', () => {
      const sq = new SqrtDecomposition([1, 2, 3, 4, 5, 6, 7, 8, 9])
      sq.rangeUpdate(0, 8, 1)
      sq.rangeUpdate(3, 5, 2)
      sq.rangeUpdate(0, 2, 3)
      expect(sq.rangeQuery(0, 8)).toBe(69)
    })
  })

  describe('type safety', () => {
    it('works with number type', () => {
      const sq = new SqrtDecomposition<number>([1, 2, 3])
      expect(sq.get(0)).toBeTypeOf('number')
    })

    it('works with string type and custom operation', () => {
      const sq = new SqrtDecomposition<string>(['x', 'y', 'z'], {
        operation: (a, b) => a + b,
        identity: '',
      })
      expect(sq.rangeQuery(0, 2)).toBe('xyz')
    })

    it('works with boolean product', () => {
      const sq = new SqrtDecomposition<boolean>([true, true, false, true], {
        operation: (a, b) => a && b,
        identity: true,
      })
      expect(sq.rangeQuery(0, 3)).toBe(false)
      expect(sq.rangeQuery(0, 1)).toBe(true)
    })
  })
})
