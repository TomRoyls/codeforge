import { describe, it, expect } from 'vitest'
import { DynamicFenwick } from '../../src/core/dynamic-fenwick/index.js'

describe('DynamicFenwick', () => {
  describe('constructor', () => {
    it('creates empty tree with no arguments', () => {
      const ft = new DynamicFenwick()
      expect(ft.size()).toBe(0)
      expect(ft.isEmpty()).toBe(true)
    })

    it('creates empty tree with empty options', () => {
      const ft = new DynamicFenwick({})
      expect(ft.size()).toBe(0)
    })

    it('accepts custom combiner for non-numeric types', () => {
      const ft = new DynamicFenwick<string>({
        combiner: (a, b) => a + b,
        subtractor: (a, b) => a.slice(0, a.length - b.length),
        identity: '',
      })
      expect(ft.size()).toBe(0)
      expect(ft.isEmpty()).toBe(true)
    })
  })

  describe('insert', () => {
    it('inserts a single value', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 5)
      expect(ft.size()).toBe(1)
      expect(ft.isEmpty()).toBe(false)
    })

    it('inserts at beginning of non-empty tree', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 10)
      ft.insert(0, 5)
      expect(ft.toArray()).toEqual([5, 10])
    })

    it('inserts at end of non-empty tree', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 5)
      ft.insert(1, 10)
      expect(ft.toArray()).toEqual([5, 10])
    })

    it('inserts in middle of tree', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1)
      ft.insert(1, 3)
      ft.insert(1, 2)
      expect(ft.toArray()).toEqual([1, 2, 3])
    })

    it('inserts multiple values sequentially', () => {
      const ft = new DynamicFenwick()
      for (let i = 0; i < 10; i++) {
        ft.insert(i, i + 1)
      }
      expect(ft.size()).toBe(10)
      expect(ft.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('throws on negative index', () => {
      const ft = new DynamicFenwick()
      expect(() => ft.insert(-1, 5)).toThrow(RangeError)
    })

    it('throws on index beyond size + 1', () => {
      const ft = new DynamicFenwick()
      expect(() => ft.insert(1, 5)).toThrow(RangeError)
    })

    it('allows inserting at exact size boundary', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1)
      ft.insert(1, 2)
      ft.insert(2, 3)
      expect(ft.size()).toBe(3)
    })

    it('inserts zero values', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 0)
      expect(ft.get(0)).toBe(0)
    })

    it('inserts negative values', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, -5)
      ft.insert(1, 3)
      expect(ft.toArray()).toEqual([-5, 3])
    })
  })

  describe('remove', () => {
    it('removes the only element', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 5)
      const removed = ft.remove(0)
      expect(removed).toBe(5)
      expect(ft.size()).toBe(0)
      expect(ft.isEmpty()).toBe(true)
    })

    it('removes from beginning', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1)
      ft.insert(1, 2)
      ft.insert(2, 3)
      ft.remove(0)
      expect(ft.toArray()).toEqual([2, 3])
    })

    it('removes from end', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1)
      ft.insert(1, 2)
      ft.insert(2, 3)
      ft.remove(2)
      expect(ft.toArray()).toEqual([1, 2])
    })

    it('removes from middle', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1)
      ft.insert(1, 2)
      ft.insert(2, 3)
      ft.remove(1)
      expect(ft.toArray()).toEqual([1, 3])
    })

    it('returns the removed value', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 42)
      expect(ft.remove(0)).toBe(42)
    })

    it('throws on negative index', () => {
      const ft = new DynamicFenwick()
      expect(() => ft.remove(-1)).toThrow(RangeError)
    })

    it('throws on index >= size', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1)
      expect(() => ft.remove(1)).toThrow(RangeError)
    })

    it('throws when removing from empty tree', () => {
      const ft = new DynamicFenwick()
      expect(() => ft.remove(0)).toThrow(RangeError)
    })

    it('removes all elements one by one', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1)
      ft.insert(1, 2)
      ft.insert(2, 3)
      ft.remove(0)
      ft.remove(0)
      ft.remove(0)
      expect(ft.isEmpty()).toBe(true)
      expect(ft.size()).toBe(0)
    })

    it('maintains correct prefix sums after removal', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 10)
      ft.insert(1, 20)
      ft.insert(2, 30)
      ft.remove(1)
      expect(ft.prefixSum(0)).toBe(10)
      expect(ft.prefixSum(1)).toBe(40)
    })
  })

  describe('update', () => {
    it('updates a value by delta', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 5)
      ft.update(0, 3)
      expect(ft.get(0)).toBe(8)
    })

    it('updates with negative delta', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 10)
      ft.update(0, -3)
      expect(ft.get(0)).toBe(7)
    })

    it('updates middle element', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1)
      ft.insert(1, 2)
      ft.insert(2, 3)
      ft.update(1, 10)
      expect(ft.get(1)).toBe(12)
    })

    it('updates last element', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1)
      ft.insert(1, 2)
      ft.update(1, 5)
      expect(ft.get(1)).toBe(7)
    })

    it('throws on empty tree', () => {
      const ft = new DynamicFenwick()
      expect(() => ft.update(0, 5)).toThrow(RangeError)
    })

    it('throws on negative index', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1)
      expect(() => ft.update(-1, 5)).toThrow(RangeError)
    })

    it('throws on out of bounds index', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1)
      expect(() => ft.update(1, 5)).toThrow(RangeError)
    })

    it('multiple updates on same index', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 0)
      ft.update(0, 5)
      ft.update(0, 3)
      ft.update(0, -2)
      expect(ft.get(0)).toBe(6)
    })
  })

  describe('prefixSum / query', () => {
    it('returns 0 for empty tree', () => {
      const ft = new DynamicFenwick()
      expect(ft.prefixSum(0)).toBe(0)
      expect(ft.query(0)).toBe(0)
    })

    it('returns 0 for negative index', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 5)
      expect(ft.prefixSum(-1)).toBe(0)
    })

    it('returns single element prefix sum', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 5)
      expect(ft.prefixSum(0)).toBe(5)
    })

    it('returns sum of first two elements', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 3)
      ft.insert(1, 7)
      expect(ft.prefixSum(1)).toBe(10)
    })

    it('clamps index beyond size', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 5)
      ft.insert(1, 10)
      expect(ft.prefixSum(100)).toBe(15)
    })

    it('computes prefix sum after insertions', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1)
      ft.insert(1, 2)
      ft.insert(2, 3)
      ft.insert(3, 4)
      expect(ft.prefixSum(0)).toBe(1)
      expect(ft.prefixSum(1)).toBe(3)
      expect(ft.prefixSum(2)).toBe(6)
      expect(ft.prefixSum(3)).toBe(10)
    })

    it('computes prefix sum after removal', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 10)
      ft.insert(1, 20)
      ft.insert(2, 30)
      ft.remove(0)
      expect(ft.prefixSum(0)).toBe(20)
      expect(ft.prefixSum(1)).toBe(50)
    })

    it('query is alias for prefixSum', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1)
      ft.insert(1, 2)
      ft.insert(2, 3)
      expect(ft.query(0)).toBe(ft.prefixSum(0))
      expect(ft.query(1)).toBe(ft.prefixSum(1))
      expect(ft.query(2)).toBe(ft.prefixSum(2))
    })
  })

  describe('rangeQuery', () => {
    it('returns 0 for lo > hi', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 5)
      expect(ft.rangeQuery(2, 1)).toBe(0)
    })

    it('returns full range sum', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1)
      ft.insert(1, 2)
      ft.insert(2, 3)
      expect(ft.rangeQuery(0, 2)).toBe(6)
    })

    it('returns partial range sum', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1)
      ft.insert(1, 2)
      ft.insert(2, 3)
      ft.insert(3, 4)
      expect(ft.rangeQuery(1, 3)).toBe(9)
    })

    it('returns single element range', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 5)
      ft.insert(1, 10)
      expect(ft.rangeQuery(0, 0)).toBe(5)
      expect(ft.rangeQuery(1, 1)).toBe(10)
    })

    it('works with lo = 0', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 3)
      ft.insert(1, 7)
      expect(ft.rangeQuery(0, 1)).toBe(10)
    })

    it('works with negative lo', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 3)
      ft.insert(1, 7)
      expect(ft.rangeQuery(-5, 1)).toBe(10)
    })

    it('returns correct range after updates', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1)
      ft.insert(1, 2)
      ft.insert(2, 3)
      ft.update(1, 5)
      expect(ft.rangeQuery(0, 2)).toBe(11)
    })

    it('returns correct range after insert and remove', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 10)
      ft.insert(1, 20)
      ft.insert(2, 30)
      ft.remove(1)
      expect(ft.rangeQuery(0, 1)).toBe(40)
    })
  })

  describe('get', () => {
    it('gets a value at index', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 42)
      expect(ft.get(0)).toBe(42)
    })

    it('gets values after multiple inserts', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 10)
      ft.insert(1, 20)
      ft.insert(2, 30)
      expect(ft.get(0)).toBe(10)
      expect(ft.get(1)).toBe(20)
      expect(ft.get(2)).toBe(30)
    })

    it('throws on empty tree', () => {
      const ft = new DynamicFenwick()
      expect(() => ft.get(0)).toThrow(RangeError)
    })

    it('throws on out of bounds', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1)
      expect(() => ft.get(1)).toThrow(RangeError)
    })

    it('reflects updates', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 5)
      ft.update(0, 3)
      expect(ft.get(0)).toBe(8)
    })
  })

  describe('set', () => {
    it('sets a value at index', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 5)
      ft.set(0, 10)
      expect(ft.get(0)).toBe(10)
    })

    it('sets value and updates prefix sums', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1)
      ft.insert(1, 2)
      ft.insert(2, 3)
      ft.set(1, 10)
      expect(ft.prefixSum(0)).toBe(1)
      expect(ft.prefixSum(1)).toBe(11)
      expect(ft.prefixSum(2)).toBe(14)
    })

    it('throws on empty tree', () => {
      const ft = new DynamicFenwick()
      expect(() => ft.set(0, 5)).toThrow(RangeError)
    })

    it('throws on out of bounds', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1)
      expect(() => ft.set(1, 5)).toThrow(RangeError)
    })

    it('set to same value is no-op semantically', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 5)
      ft.set(0, 5)
      expect(ft.get(0)).toBe(5)
    })
  })

  describe('total', () => {
    it('returns identity for empty tree', () => {
      const ft = new DynamicFenwick()
      expect(ft.total()).toBe(0)
    })

    it('returns sum of all elements', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1)
      ft.insert(1, 2)
      ft.insert(2, 3)
      expect(ft.total()).toBe(6)
    })

    it('updates after insert', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 5)
      expect(ft.total()).toBe(5)
      ft.insert(1, 10)
      expect(ft.total()).toBe(15)
    })

    it('updates after remove', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 5)
      ft.insert(1, 10)
      ft.remove(0)
      expect(ft.total()).toBe(10)
    })

    it('updates after update', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 5)
      ft.update(0, 3)
      expect(ft.total()).toBe(8)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty tree', () => {
      const ft = new DynamicFenwick()
      expect(ft.toArray()).toEqual([])
    })

    it('returns copy of values', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1)
      ft.insert(1, 2)
      const arr = ft.toArray()
      expect(arr).toEqual([1, 2])
      expect(arr).not.toBe(ft.toArray())
    })

    it('reflects updates', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1)
      ft.insert(1, 2)
      ft.update(0, 5)
      expect(ft.toArray()).toEqual([6, 2])
    })

    it('reflects insertions and removals', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1)
      ft.insert(1, 2)
      ft.insert(2, 3)
      ft.remove(1)
      expect(ft.toArray()).toEqual([1, 3])
    })
  })

  describe('clear', () => {
    it('clears a non-empty tree', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1)
      ft.insert(1, 2)
      ft.clear()
      expect(ft.size()).toBe(0)
      expect(ft.isEmpty()).toBe(true)
      expect(ft.toArray()).toEqual([])
    })

    it('clear on empty tree is no-op', () => {
      const ft = new DynamicFenwick()
      ft.clear()
      expect(ft.size()).toBe(0)
      expect(ft.isEmpty()).toBe(true)
    })

    it('allows reuse after clear', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1)
      ft.clear()
      ft.insert(0, 10)
      expect(ft.size()).toBe(1)
      expect(ft.get(0)).toBe(10)
    })
  })

  describe('size and isEmpty', () => {
    it('size returns 0 initially', () => {
      const ft = new DynamicFenwick()
      expect(ft.size()).toBe(0)
    })

    it('isEmpty returns true initially', () => {
      const ft = new DynamicFenwick()
      expect(ft.isEmpty()).toBe(true)
    })

    it('size increments on insert', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1)
      expect(ft.size()).toBe(1)
      ft.insert(1, 2)
      expect(ft.size()).toBe(2)
    })

    it('size decrements on remove', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1)
      ft.insert(1, 2)
      ft.remove(0)
      expect(ft.size()).toBe(1)
    })

    it('isEmpty toggles correctly', () => {
      const ft = new DynamicFenwick()
      expect(ft.isEmpty()).toBe(true)
      ft.insert(0, 1)
      expect(ft.isEmpty()).toBe(false)
      ft.remove(0)
      expect(ft.isEmpty()).toBe(true)
    })
  })

  describe('integration - mixed operations', () => {
    it('insert, update, query, remove sequence', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 10)
      ft.insert(1, 20)
      ft.insert(2, 30)
      expect(ft.total()).toBe(60)
      ft.update(1, 5)
      expect(ft.total()).toBe(65)
      ft.remove(0)
      expect(ft.total()).toBe(55)
      expect(ft.rangeQuery(0, 1)).toBe(55)
    })

    it('alternating insert and remove at beginning', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1)
      ft.insert(0, 2)
      ft.insert(0, 3)
      expect(ft.toArray()).toEqual([3, 2, 1])
      ft.remove(0)
      expect(ft.toArray()).toEqual([2, 1])
      ft.insert(0, 4)
      expect(ft.toArray()).toEqual([4, 2, 1])
    })

    it('build up and tear down', () => {
      const ft = new DynamicFenwick()
      for (let i = 0; i < 5; i++) {
        ft.insert(i, (i + 1) * 10)
      }
      expect(ft.total()).toBe(150)
      while (!ft.isEmpty()) {
        ft.remove(0)
      }
      expect(ft.size()).toBe(0)
    })

    it('insert update then range query', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 5)
      ft.insert(1, 10)
      ft.insert(2, 15)
      ft.update(1, -3)
      expect(ft.rangeQuery(0, 2)).toBe(27)
      expect(ft.rangeQuery(1, 2)).toBe(22)
    })

    it('set then remove then insert', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1)
      ft.insert(1, 2)
      ft.insert(2, 3)
      ft.set(1, 20)
      ft.remove(1)
      ft.insert(1, 100)
      expect(ft.toArray()).toEqual([1, 100, 3])
      expect(ft.total()).toBe(104)
    })

    it('handles large number of operations', () => {
      const ft = new DynamicFenwick()
      for (let i = 0; i < 100; i++) {
        ft.insert(i, 1)
      }
      expect(ft.total()).toBe(100)
      for (let i = 0; i < 50; i++) {
        ft.remove(0)
      }
      expect(ft.size()).toBe(50)
      expect(ft.total()).toBe(50)
    })

    it('clear and rebuild', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1)
      ft.insert(1, 2)
      ft.clear()
      ft.insert(0, 100)
      ft.insert(1, 200)
      expect(ft.total()).toBe(300)
      expect(ft.prefixSum(0)).toBe(100)
    })
  })

  describe('generics with custom combiner', () => {
    it('works with string concatenation for storage', () => {
      const ft = new DynamicFenwick<string>({
        combiner: (a, b) => a + b,
        subtractor: (a, b) => a.slice(0, a.length - b.length),
        identity: '',
      })
      ft.insert(0, 'a')
      ft.insert(1, 'b')
      ft.insert(2, 'c')
      expect(ft.get(0)).toBe('a')
      expect(ft.get(1)).toBe('b')
      expect(ft.get(2)).toBe('c')
      expect(ft.toArray()).toEqual(['a', 'b', 'c'])
      expect(ft.size()).toBe(3)
    })

    it('works with multiplication', () => {
      const ft = new DynamicFenwick<number>({
        combiner: (a, b) => a * b,
        subtractor: (a, b) => a / b,
        identity: 1,
      })
      ft.insert(0, 2)
      ft.insert(1, 3)
      ft.insert(2, 4)
      expect(ft.prefixSum(2)).toBe(24)
      expect(ft.prefixSum(1)).toBe(6)
    })

    it('works with max operation', () => {
      const ft = new DynamicFenwick<number>({
        combiner: (a, b) => Math.max(a, b),
        subtractor: (_a, _b) => 0,
        identity: -Infinity,
      })
      ft.insert(0, 3)
      ft.insert(1, 7)
      ft.insert(2, 1)
      ft.insert(3, 9)
      expect(ft.prefixSum(1)).toBe(7)
      expect(ft.prefixSum(3)).toBe(9)
    })
  })

  describe('edge cases', () => {
    it('insert and immediately remove', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 42)
      expect(ft.remove(0)).toBe(42)
      expect(ft.isEmpty()).toBe(true)
    })

    it('all zeros', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 0)
      ft.insert(1, 0)
      ft.insert(2, 0)
      expect(ft.total()).toBe(0)
      expect(ft.prefixSum(1)).toBe(0)
      expect(ft.rangeQuery(0, 2)).toBe(0)
    })

    it('single element operations', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 5)
      expect(ft.prefixSum(0)).toBe(5)
      expect(ft.rangeQuery(0, 0)).toBe(5)
      expect(ft.total()).toBe(5)
      ft.update(0, 3)
      expect(ft.get(0)).toBe(8)
      ft.set(0, 100)
      expect(ft.get(0)).toBe(100)
    })

    it('negative values throughout', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, -5)
      ft.insert(1, -3)
      ft.insert(2, -2)
      expect(ft.total()).toBe(-10)
      expect(ft.prefixSum(1)).toBe(-8)
      expect(ft.rangeQuery(1, 2)).toBe(-5)
    })

    it('floating point values', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1.5)
      ft.insert(1, 2.5)
      ft.insert(2, 3.5)
      expect(ft.total()).toBeCloseTo(7.5)
      expect(ft.prefixSum(1)).toBeCloseTo(4.0)
    })

    it('large values', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, Number.MAX_SAFE_INTEGER)
      expect(ft.total()).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('insert at same index twice shifts values', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1)
      ft.insert(0, 2)
      ft.insert(0, 3)
      expect(ft.toArray()).toEqual([3, 2, 1])
    })

    it('remove then insert at same index', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1)
      ft.insert(1, 2)
      ft.remove(1)
      ft.insert(1, 99)
      expect(ft.toArray()).toEqual([1, 99])
    })

    it('sequential remove from front', () => {
      const ft = new DynamicFenwick()
      for (let i = 0; i < 5; i++) ft.insert(i, i)
      expect(ft.remove(0)).toBe(0)
      expect(ft.remove(0)).toBe(1)
      expect(ft.remove(0)).toBe(2)
      expect(ft.toArray()).toEqual([3, 4])
    })

    it('sequential remove from back', () => {
      const ft = new DynamicFenwick()
      for (let i = 0; i < 5; i++) ft.insert(i, i)
      expect(ft.remove(4)).toBe(4)
      expect(ft.remove(3)).toBe(3)
      expect(ft.toArray()).toEqual([0, 1, 2])
    })

    it('prefix sum after many interleaved operations', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 10)
      ft.insert(1, 20)
      ft.update(0, 5)
      ft.insert(2, 30)
      ft.remove(0)
      ft.insert(0, 100)
      ft.update(1, -10)
      expect(ft.prefixSum(0)).toBe(100)
      expect(ft.prefixSum(1)).toBe(110)
      expect(ft.prefixSum(2)).toBe(140)
    })

    it('rebuild correctness after many insertions', () => {
      const ft = new DynamicFenwick()
      const values = [5, 3, 8, 1, 9, 2, 7, 4, 6, 0]
      for (let i = 0; i < values.length; i++) {
        ft.insert(i, values[i]!)
      }
      let sum = 0
      for (let i = 0; i < values.length; i++) {
        sum += values[i]!
        expect(ft.prefixSum(i)).toBe(sum)
      }
      expect(ft.total()).toBe(sum)
    })

    it('range query on single element tree', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 42)
      expect(ft.rangeQuery(0, 0)).toBe(42)
    })

    it('multiple clears and reuses', () => {
      const ft = new DynamicFenwick()
      for (let round = 0; round < 3; round++) {
        ft.insert(0, round + 1)
        ft.insert(1, round + 2)
        expect(ft.size()).toBe(2)
        ft.clear()
        expect(ft.size()).toBe(0)
      }
    })

    it('insert at front preserves existing prefix sums', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 10)
      ft.insert(1, 20)
      ft.insert(0, 5)
      expect(ft.prefixSum(0)).toBe(5)
      expect(ft.prefixSum(1)).toBe(15)
      expect(ft.prefixSum(2)).toBe(35)
    })

    it('insert at end preserves existing prefix sums', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 10)
      ft.insert(1, 20)
      ft.insert(2, 30)
      expect(ft.prefixSum(0)).toBe(10)
      expect(ft.prefixSum(1)).toBe(30)
      expect(ft.prefixSum(2)).toBe(60)
    })

    it('alternating updates and queries', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 0)
      for (let i = 0; i < 10; i++) {
        ft.update(0, 1)
        expect(ft.get(0)).toBe(i + 1)
        expect(ft.prefixSum(0)).toBe(i + 1)
      }
    })

    it('set value then verify all methods', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 1)
      ft.insert(1, 2)
      ft.insert(2, 3)
      ft.set(0, 100)
      expect(ft.get(0)).toBe(100)
      expect(ft.toArray()).toEqual([100, 2, 3])
      expect(ft.total()).toBe(105)
      expect(ft.prefixSum(0)).toBe(100)
      expect(ft.rangeQuery(0, 1)).toBe(102)
    })

    it('prefixSum on index 0 of multi-element tree', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 7)
      ft.insert(1, 14)
      ft.insert(2, 21)
      expect(ft.prefixSum(0)).toBe(7)
    })

    it('total after removing all but one', () => {
      const ft = new DynamicFenwick()
      ft.insert(0, 10)
      ft.insert(1, 20)
      ft.insert(2, 30)
      ft.remove(0)
      ft.remove(1)
      expect(ft.size()).toBe(1)
      expect(ft.total()).toBe(20)
    })
  })
})
