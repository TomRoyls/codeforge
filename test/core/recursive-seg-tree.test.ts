import { describe, it, expect } from 'vitest'
import { RecursiveSegTree } from '../../src/core/recursive-seg-tree/index.js'
import type { RecursiveSegTreeOptions } from '../../src/core/recursive-seg-tree/types.js'

describe('RecursiveSegTree', () => {
  describe('constructor', () => {
    it('creates instance with empty array', () => {
      const st = new RecursiveSegTree([])
      expect(st.size).toBe(0)
      expect(st.isEmpty).toBe(true)
    })

    it('creates instance with single element', () => {
      const st = new RecursiveSegTree([42])
      expect(st.size).toBe(1)
      expect(st.isEmpty).toBe(false)
    })

    it('creates instance with multiple elements', () => {
      const st = new RecursiveSegTree([1, 2, 3, 4, 5])
      expect(st.size).toBe(5)
    })

    it('creates instance with default sum merge', () => {
      const st = new RecursiveSegTree([1, 2, 3, 4, 5])
      expect(st.query(0, 5)).toBe(15)
    })

    it('creates instance with custom merge for max', () => {
      const st = new RecursiveSegTree([5, 3, 7, 1, 4], {
        merge: (a, b) => Math.max(a, b),
        identity: -Infinity,
      })
      expect(st.query(0, 5)).toBe(7)
    })

    it('creates instance with custom merge for min', () => {
      const st = new RecursiveSegTree([5, 3, 7, 1, 4], {
        merge: (a, b) => Math.min(a, b),
        identity: Infinity,
      })
      expect(st.query(0, 5)).toBe(1)
    })

    it('creates instance with identity only', () => {
      const st = new RecursiveSegTree([10, 20, 30], { identity: 0 })
      expect(st.query(0, 3)).toBe(60)
    })

    it('preserves original array (does not mutate)', () => {
      const arr = [1, 2, 3]
      new RecursiveSegTree(arr)
      expect(arr).toEqual([1, 2, 3])
    })

    it('handles two elements', () => {
      const st = new RecursiveSegTree([3, 7])
      expect(st.query(0, 2)).toBe(10)
    })

    it('handles large array', () => {
      const arr = Array.from({ length: 1000 }, (_, i) => i + 1)
      const st = new RecursiveSegTree(arr)
      expect(st.query(0, 1000)).toBe(500500)
    })

    it('handles no options', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      expect(st.query(0, 3)).toBe(6)
    })

    it('handles empty options object', () => {
      const st = new RecursiveSegTree([5, 5, 5], {})
      expect(st.query(0, 3)).toBe(15)
    })
  })

  describe('query', () => {
    it('queries full range', () => {
      const st = new RecursiveSegTree([1, 2, 3, 4, 5])
      expect(st.query(0, 5)).toBe(15)
    })

    it('queries single element', () => {
      const st = new RecursiveSegTree([1, 2, 3, 4, 5])
      expect(st.query(2, 3)).toBe(3)
    })

    it('queries sub-range at start', () => {
      const st = new RecursiveSegTree([1, 2, 3, 4, 5])
      expect(st.query(0, 2)).toBe(3)
    })

    it('queries sub-range at end', () => {
      const st = new RecursiveSegTree([1, 2, 3, 4, 5])
      expect(st.query(3, 5)).toBe(9)
    })

    it('queries middle range', () => {
      const st = new RecursiveSegTree([1, 2, 3, 4, 5])
      expect(st.query(1, 4)).toBe(9)
    })

    it('queries two elements', () => {
      const st = new RecursiveSegTree([10, 20, 30])
      expect(st.query(0, 2)).toBe(30)
    })

    it('throws on empty tree', () => {
      const st = new RecursiveSegTree([])
      expect(() => st.query(0, 1)).toThrow(RangeError)
    })

    it('throws on negative left bound', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      expect(() => st.query(-1, 2)).toThrow(RangeError)
    })

    it('throws on right bound exceeding size', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      expect(() => st.query(0, 4)).toThrow(RangeError)
    })

    it('throws when left >= right', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      expect(() => st.query(2, 2)).toThrow(RangeError)
    })

    it('returns correct result after updates', () => {
      const st = new RecursiveSegTree([1, 2, 3, 4, 5])
      st.update(2, 10)
      expect(st.query(0, 5)).toBe(22)
    })

    it('handles single element array query', () => {
      const st = new RecursiveSegTree([42])
      expect(st.query(0, 1)).toBe(42)
    })

    it('handles power of 2 sized array', () => {
      const st = new RecursiveSegTree([1, 2, 3, 4])
      expect(st.query(0, 4)).toBe(10)
      expect(st.query(1, 3)).toBe(5)
    })

    it('handles non-power of 2 sized array', () => {
      const st = new RecursiveSegTree([1, 2, 3, 4, 5, 6, 7])
      expect(st.query(0, 7)).toBe(28)
      expect(st.query(2, 5)).toBe(12)
    })
  })

  describe('update', () => {
    it('updates a single element', () => {
      const st = new RecursiveSegTree([1, 2, 3, 4, 5])
      st.update(2, 10)
      expect(st.get(2)).toBe(10)
    })

    it('updates and reflects in query', () => {
      const st = new RecursiveSegTree([1, 2, 3, 4, 5])
      st.update(0, 10)
      expect(st.query(0, 5)).toBe(24)
    })

    it('updates first element', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      st.update(0, 100)
      expect(st.get(0)).toBe(100)
      expect(st.query(0, 3)).toBe(105)
    })

    it('updates last element', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      st.update(2, 100)
      expect(st.get(2)).toBe(100)
      expect(st.query(0, 3)).toBe(103)
    })

    it('updates multiple elements', () => {
      const st = new RecursiveSegTree([1, 2, 3, 4, 5])
      st.update(0, 10)
      st.update(1, 20)
      st.update(4, 50)
      expect(st.query(0, 5)).toBe(87)
    })

    it('throws on negative index', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      expect(() => st.update(-1, 5)).toThrow(RangeError)
    })

    it('throws on index equal to size', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      expect(() => st.update(3, 5)).toThrow(RangeError)
    })

    it('throws on index exceeding size', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      expect(() => st.update(10, 5)).toThrow(RangeError)
    })

    it('handles updating to zero', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      st.update(1, 0)
      expect(st.query(0, 3)).toBe(4)
    })

    it('handles updating to negative value', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      st.update(1, -5)
      expect(st.query(0, 3)).toBe(-1)
    })
  })

  describe('get', () => {
    it('gets element at index', () => {
      const st = new RecursiveSegTree([10, 20, 30])
      expect(st.get(0)).toBe(10)
      expect(st.get(1)).toBe(20)
      expect(st.get(2)).toBe(30)
    })

    it('throws on negative index', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      expect(() => st.get(-1)).toThrow(RangeError)
    })

    it('throws on index equal to size', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      expect(() => st.get(3)).toThrow(RangeError)
    })

    it('throws on index exceeding size', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      expect(() => st.get(100)).toThrow(RangeError)
    })

    it('reflects updates', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      st.update(1, 50)
      expect(st.get(1)).toBe(50)
    })
  })

  describe('set', () => {
    it('sets element at index', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      st.set(1, 50)
      expect(st.get(1)).toBe(50)
    })

    it('set is alias for update', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      st.set(0, 100)
      expect(st.query(0, 3)).toBe(105)
    })
  })

  describe('size and isEmpty', () => {
    it('returns correct size', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      expect(st.size).toBe(3)
    })

    it('returns 0 for empty tree', () => {
      const st = new RecursiveSegTree([])
      expect(st.size).toBe(0)
    })

    it('isEmpty is true for empty tree', () => {
      const st = new RecursiveSegTree([])
      expect(st.isEmpty).toBe(true)
    })

    it('isEmpty is false for non-empty tree', () => {
      const st = new RecursiveSegTree([1])
      expect(st.isEmpty).toBe(false)
    })

    it('size updates after push', () => {
      const st = new RecursiveSegTree([1, 2])
      st.push(3)
      expect(st.size).toBe(3)
    })

    it('size updates after pop', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      st.pop()
      expect(st.size).toBe(2)
    })

    it('isEmpty updates after clear', () => {
      const st = new RecursiveSegTree([1, 2])
      st.clear()
      expect(st.isEmpty).toBe(true)
    })
  })

  describe('toArray', () => {
    it('returns copy of data', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      expect(st.toArray()).toEqual([1, 2, 3])
    })

    it('returns empty array for empty tree', () => {
      const st = new RecursiveSegTree([])
      expect(st.toArray()).toEqual([])
    })

    it('does not return internal reference', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      const arr = st.toArray()
      arr.push(4)
      expect(st.size).toBe(3)
    })

    it('reflects updates', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      st.update(1, 50)
      expect(st.toArray()).toEqual([1, 50, 3])
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      const cloned = st.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3])
      expect(cloned.size).toBe(3)
    })

    it('clone is independent of original', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      const cloned = st.clone()
      st.update(0, 100)
      expect(st.get(0)).toBe(100)
      expect(cloned.get(0)).toBe(1)
    })

    it('preserves custom merge', () => {
      const st = new RecursiveSegTree([5, 3, 7, 1], {
        merge: (a, b) => Math.max(a, b),
        identity: -Infinity,
      })
      const cloned = st.clone()
      expect(cloned.query(0, 4)).toBe(7)
    })

    it('clones empty tree', () => {
      const st = new RecursiveSegTree([])
      const cloned = st.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty).toBe(true)
    })
  })

  describe('fromArray', () => {
    it('creates instance from array', () => {
      const st = RecursiveSegTree.fromArray([1, 2, 3])
      expect(st.query(0, 3)).toBe(6)
    })

    it('creates instance with options', () => {
      const st = RecursiveSegTree.fromArray([5, 3, 7], {
        merge: (a, b) => Math.max(a, b),
        identity: -Infinity,
      })
      expect(st.query(0, 3)).toBe(7)
    })

    it('creates empty instance', () => {
      const st = RecursiveSegTree.fromArray([])
      expect(st.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears tree', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      st.clear()
      expect(st.size).toBe(0)
      expect(st.isEmpty).toBe(true)
    })

    it('clear already empty tree', () => {
      const st = new RecursiveSegTree([])
      st.clear()
      expect(st.size).toBe(0)
    })

    it('cleared tree returns empty toArray', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      st.clear()
      expect(st.toArray()).toEqual([])
    })

    it('cleared tree can be rebuilt', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      st.clear()
      st.build([4, 5, 6])
      expect(st.query(0, 3)).toBe(15)
    })
  })

  describe('forEach', () => {
    it('iterates all elements', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      const collected: number[] = []
      st.forEach((v) => collected.push(v))
      expect(collected).toEqual([1, 2, 3])
    })

    it('provides correct indices', () => {
      const st = new RecursiveSegTree([10, 20, 30])
      const indices: number[] = []
      st.forEach((_, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('does not iterate empty tree', () => {
      const st = new RecursiveSegTree([])
      let count = 0
      st.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('reflects updates', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      st.update(1, 50)
      const collected: number[] = []
      st.forEach((v) => collected.push(v))
      expect(collected).toEqual([1, 50, 3])
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      const result = [...st]
      expect(result).toEqual([1, 2, 3])
    })

    it('works with for...of', () => {
      const st = new RecursiveSegTree([10, 20, 30])
      const collected: number[] = []
      for (const v of st) {
        collected.push(v)
      }
      expect(collected).toEqual([10, 20, 30])
    })

    it('empty tree yields nothing', () => {
      const st = new RecursiveSegTree([])
      const result = [...st]
      expect(result).toEqual([])
    })
  })

  describe('first', () => {
    it('returns first element', () => {
      const st = new RecursiveSegTree([5, 3, 7])
      expect(st.first()).toBe(5)
    })

    it('throws on empty tree', () => {
      const st = new RecursiveSegTree([])
      expect(() => st.first()).toThrow(RangeError)
    })

    it('returns first after update', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      st.update(0, 99)
      expect(st.first()).toBe(99)
    })
  })

  describe('last', () => {
    it('returns last element', () => {
      const st = new RecursiveSegTree([5, 3, 7])
      expect(st.last()).toBe(7)
    })

    it('throws on empty tree', () => {
      const st = new RecursiveSegTree([])
      expect(() => st.last()).toThrow(RangeError)
    })

    it('returns last after update', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      st.update(2, 99)
      expect(st.last()).toBe(99)
    })
  })

  describe('indexOf', () => {
    it('finds existing element', () => {
      const st = new RecursiveSegTree([10, 20, 30])
      expect(st.indexOf(20)).toBe(1)
    })

    it('returns -1 for non-existing', () => {
      const st = new RecursiveSegTree([10, 20, 30])
      expect(st.indexOf(99)).toBe(-1)
    })

    it('returns first occurrence', () => {
      const st = new RecursiveSegTree([5, 5, 5])
      expect(st.indexOf(5)).toBe(0)
    })

    it('returns -1 on empty tree', () => {
      const st = new RecursiveSegTree([])
      expect(st.indexOf(1)).toBe(-1)
    })

    it('finds first element', () => {
      const st = new RecursiveSegTree([10, 20, 30])
      expect(st.indexOf(10)).toBe(0)
    })

    it('finds last element', () => {
      const st = new RecursiveSegTree([10, 20, 30])
      expect(st.indexOf(30)).toBe(2)
    })
  })

  describe('min', () => {
    it('returns minimum element', () => {
      const st = new RecursiveSegTree([5, 3, 7, 1, 4])
      expect(st.min()).toBe(1)
    })

    it('throws on empty tree', () => {
      const st = new RecursiveSegTree([])
      expect(() => st.min()).toThrow(RangeError)
    })

    it('returns single element', () => {
      const st = new RecursiveSegTree([42])
      expect(st.min()).toBe(42)
    })

    it('handles negative values', () => {
      const st = new RecursiveSegTree([-5, -3, -10, -1])
      expect(st.min()).toBe(-10)
    })

    it('handles all equal values', () => {
      const st = new RecursiveSegTree([3, 3, 3])
      expect(st.min()).toBe(3)
    })
  })

  describe('max', () => {
    it('returns maximum element', () => {
      const st = new RecursiveSegTree([5, 3, 7, 1, 4])
      expect(st.max()).toBe(7)
    })

    it('throws on empty tree', () => {
      const st = new RecursiveSegTree([])
      expect(() => st.max()).toThrow(RangeError)
    })

    it('returns single element', () => {
      const st = new RecursiveSegTree([42])
      expect(st.max()).toBe(42)
    })

    it('handles negative values', () => {
      const st = new RecursiveSegTree([-5, -3, -10, -1])
      expect(st.max()).toBe(-1)
    })

    it('handles all equal values', () => {
      const st = new RecursiveSegTree([3, 3, 3])
      expect(st.max()).toBe(3)
    })
  })

  describe('sum', () => {
    it('returns sum of all elements', () => {
      const st = new RecursiveSegTree([1, 2, 3, 4, 5])
      expect(st.sum()).toBe(15)
    })

    it('returns identity for empty tree', () => {
      const st = new RecursiveSegTree([])
      expect(st.sum()).toBe(0)
    })

    it('returns single element', () => {
      const st = new RecursiveSegTree([42])
      expect(st.sum()).toBe(42)
    })

    it('handles negative values', () => {
      const st = new RecursiveSegTree([-1, -2, 3])
      expect(st.sum()).toBe(0)
    })

    it('reflects updates', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      st.update(1, 10)
      expect(st.sum()).toBe(14)
    })
  })

  describe('prefixSum', () => {
    it('returns sum of first n elements', () => {
      const st = new RecursiveSegTree([1, 2, 3, 4, 5])
      expect(st.prefixSum(3)).toBe(6)
    })

    it('returns 0 for prefix 0', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      expect(st.prefixSum(0)).toBe(0)
    })

    it('returns sum for full prefix', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      expect(st.prefixSum(3)).toBe(6)
    })

    it('throws on negative n', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      expect(() => st.prefixSum(-1)).toThrow(RangeError)
    })

    it('throws on n exceeding size', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      expect(() => st.prefixSum(4)).toThrow(RangeError)
    })

    it('returns correct result after updates', () => {
      const st = new RecursiveSegTree([1, 2, 3, 4, 5])
      st.update(1, 10)
      expect(st.prefixSum(3)).toBe(14)
    })
  })

  describe('rangeMin', () => {
    it('returns minimum in range', () => {
      const st = new RecursiveSegTree([5, 3, 7, 1, 4])
      expect(st.rangeMin(1, 4)).toBe(1)
    })

    it('returns single element range', () => {
      const st = new RecursiveSegTree([5, 3, 7, 1, 4])
      expect(st.rangeMin(2, 3)).toBe(7)
    })

    it('throws on empty tree', () => {
      const st = new RecursiveSegTree([])
      expect(() => st.rangeMin(0, 1)).toThrow(RangeError)
    })

    it('throws on invalid range', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      expect(() => st.rangeMin(2, 2)).toThrow(RangeError)
    })

    it('handles full range', () => {
      const st = new RecursiveSegTree([5, 3, 7, 1, 4])
      expect(st.rangeMin(0, 5)).toBe(1)
    })
  })

  describe('rangeMax', () => {
    it('returns maximum in range', () => {
      const st = new RecursiveSegTree([5, 3, 7, 1, 4])
      expect(st.rangeMax(1, 4)).toBe(7)
    })

    it('returns single element range', () => {
      const st = new RecursiveSegTree([5, 3, 7, 1, 4])
      expect(st.rangeMax(2, 3)).toBe(7)
    })

    it('throws on empty tree', () => {
      const st = new RecursiveSegTree([])
      expect(() => st.rangeMax(0, 1)).toThrow(RangeError)
    })

    it('handles full range', () => {
      const st = new RecursiveSegTree([5, 3, 7, 1, 4])
      expect(st.rangeMax(0, 5)).toBe(7)
    })
  })

  describe('rangeSum', () => {
    it('returns sum in range', () => {
      const st = new RecursiveSegTree([1, 2, 3, 4, 5])
      expect(st.rangeSum(1, 4)).toBe(9)
    })

    it('returns sum of full range', () => {
      const st = new RecursiveSegTree([1, 2, 3, 4, 5])
      expect(st.rangeSum(0, 5)).toBe(15)
    })

    it('returns single element', () => {
      const st = new RecursiveSegTree([1, 2, 3, 4, 5])
      expect(st.rangeSum(2, 3)).toBe(3)
    })

    it('throws on empty tree', () => {
      const st = new RecursiveSegTree([])
      expect(() => st.rangeSum(0, 1)).toThrow(RangeError)
    })
  })

  describe('build', () => {
    it('rebuilds from new array', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      st.build([10, 20, 30, 40])
      expect(st.query(0, 4)).toBe(100)
      expect(st.size).toBe(4)
    })

    it('rebuilds from empty array', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      st.build([])
      expect(st.size).toBe(0)
      expect(st.isEmpty).toBe(true)
    })

    it('rebuilds preserves options', () => {
      const st = new RecursiveSegTree([1], {
        merge: (a, b) => Math.max(a, b),
        identity: -Infinity,
      })
      st.build([5, 3, 7, 1])
      expect(st.query(0, 4)).toBe(7)
    })

    it('can be called multiple times', () => {
      const st = new RecursiveSegTree([1, 2])
      st.build([10, 20, 30])
      expect(st.sum()).toBe(60)
      st.build([100, 200])
      expect(st.sum()).toBe(300)
    })
  })

  describe('push', () => {
    it('appends element', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      st.push(4)
      expect(st.size).toBe(4)
      expect(st.toArray()).toEqual([1, 2, 3, 4])
    })

    it('appends to empty tree', () => {
      const st = new RecursiveSegTree([])
      st.push(42)
      expect(st.size).toBe(1)
      expect(st.get(0)).toBe(42)
    })

    it('query works after push', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      st.push(4)
      expect(st.query(0, 4)).toBe(10)
    })

    it('multiple pushes', () => {
      const st = new RecursiveSegTree([])
      st.push(1)
      st.push(2)
      st.push(3)
      expect(st.query(0, 3)).toBe(6)
    })

    it('push then update', () => {
      const st = new RecursiveSegTree([1, 2])
      st.push(3)
      st.update(1, 20)
      expect(st.query(0, 3)).toBe(24)
    })
  })

  describe('pop', () => {
    it('removes last element', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      const val = st.pop()
      expect(val).toBe(3)
      expect(st.size).toBe(2)
    })

    it('returns undefined on empty tree', () => {
      const st = new RecursiveSegTree([])
      expect(st.pop()).toBeUndefined()
    })

    it('query works after pop', () => {
      const st = new RecursiveSegTree([1, 2, 3, 4])
      st.pop()
      expect(st.query(0, 3)).toBe(6)
    })

    it('pop to empty', () => {
      const st = new RecursiveSegTree([1])
      st.pop()
      expect(st.size).toBe(0)
      expect(st.isEmpty).toBe(true)
    })

    it('pop then push', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      st.pop()
      st.push(10)
      expect(st.query(0, 3)).toBe(13)
    })

    it('multiple pops', () => {
      const st = new RecursiveSegTree([1, 2, 3, 4])
      st.pop()
      st.pop()
      expect(st.size).toBe(2)
      expect(st.query(0, 2)).toBe(3)
    })
  })

  describe('custom merge operations', () => {
    it('product merge', () => {
      const st = new RecursiveSegTree([2, 3, 4], {
        merge: (a, b) => a * b,
        identity: 1,
      })
      expect(st.query(0, 3)).toBe(24)
    })

    it('gcd merge', () => {
      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
      const st = new RecursiveSegTree([12, 18, 24], {
        merge: gcd,
        identity: 0,
      })
      expect(st.query(0, 3)).toBe(6)
    })

    it('bitwise AND merge', () => {
      const st = new RecursiveSegTree([7, 3, 5], {
        merge: (a, b) => a & b,
        identity: 0xFFFFFFFF,
      })
      expect(st.query(0, 3)).toBe(1)
    })

    it('bitwise OR merge', () => {
      const st = new RecursiveSegTree([1, 2, 4], {
        merge: (a, b) => a | b,
        identity: 0,
      })
      expect(st.query(0, 3)).toBe(7)
    })

    it('custom merge with updates', () => {
      const st = new RecursiveSegTree([2, 3, 4], {
        merge: (a, b) => a * b,
        identity: 1,
      })
      st.update(1, 5)
      expect(st.query(0, 3)).toBe(40)
    })
  })

  describe('integration scenarios', () => {
    it('push, update, query cycle', () => {
      const st = new RecursiveSegTree([1, 2])
      st.push(3)
      st.update(0, 10)
      expect(st.query(0, 3)).toBe(15)
      st.pop()
      expect(st.query(0, 2)).toBe(12)
    })

    it('build after operations', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      st.push(4)
      st.update(0, 10)
      st.build([100, 200, 300])
      expect(st.sum()).toBe(600)
    })

    it('clone after modifications', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      st.update(0, 10)
      const cloned = st.clone()
      st.update(1, 20)
      expect(cloned.toArray()).toEqual([10, 2, 3])
      expect(st.toArray()).toEqual([10, 20, 3])
    })

    it('iterator after push and pop', () => {
      const st = new RecursiveSegTree([1, 2])
      st.push(3)
      st.pop()
      expect([...st]).toEqual([1, 2])
    })

    it('clear then rebuild', () => {
      const st = new RecursiveSegTree([1, 2, 3])
      st.clear()
      st.build([10, 20, 30, 40, 50])
      expect(st.rangeMin(1, 4)).toBe(20)
      expect(st.rangeMax(1, 4)).toBe(40)
      expect(st.rangeSum(1, 4)).toBe(90)
    })

    it('fromArray then forEach', () => {
      const st = RecursiveSegTree.fromArray([10, 20, 30])
      const doubled: number[] = []
      st.forEach((v) => doubled.push(v * 2))
      expect(doubled).toEqual([20, 40, 60])
    })

    it('sum after multiple pushes', () => {
      const st = new RecursiveSegTree<number>([])
      for (let i = 1; i <= 10; i++) {
        st.push(i)
      }
      expect(st.sum()).toBe(55)
    })

    it('prefixSum consistency', () => {
      const st = new RecursiveSegTree([1, 2, 3, 4, 5])
      for (let i = 1; i <= 5; i++) {
        expect(st.prefixSum(i)).toBe(st.query(0, i))
      }
    })

    it('handles large number of operations', () => {
      const arr = Array.from({ length: 100 }, (_, i) => i + 1)
      const st = new RecursiveSegTree(arr)
      expect(st.sum()).toBe(5050)
      st.update(0, 100)
      expect(st.sum()).toBe(5149)
      expect(st.query(0, 100)).toBe(5149)
    })

    it('min/max/sum consistency', () => {
      const st = new RecursiveSegTree([3, 1, 4, 1, 5, 9, 2, 6])
      expect(st.min()).toBe(1)
      expect(st.max()).toBe(9)
      expect(st.sum()).toBe(31)
    })
  })
})
