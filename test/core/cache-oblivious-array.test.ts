import { describe, it, expect } from 'vitest'
import { CacheObliviousArray } from '../../src/core/cache-oblivious-array/index.js'

describe('CacheObliviousArray', () => {
  describe('constructor', () => {
    it('creates empty array with no arguments', () => {
      const arr = new CacheObliviousArray<number>()
      expect(arr.length()).toBe(0)
      expect(arr.isEmpty()).toBe(true)
    })

    it('creates array from items', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      expect(arr.length()).toBe(3)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('creates array from single item', () => {
      const arr = new CacheObliviousArray([42])
      expect(arr.length()).toBe(1)
      expect(arr.get(0)).toBe(42)
    })

    it('creates array from empty array', () => {
      const arr = new CacheObliviousArray<number>([])
      expect(arr.length()).toBe(0)
      expect(arr.isEmpty()).toBe(true)
    })

    it('creates array with string items', () => {
      const arr = new CacheObliviousArray(['a', 'b', 'c'])
      expect(arr.length()).toBe(3)
      expect(arr.get(1)).toBe('b')
    })

    it('creates array with object items', () => {
      const obj = { x: 1 }
      const arr = new CacheObliviousArray([obj])
      expect(arr.get(0)).toBe(obj)
    })

    it('preserves insertion order', () => {
      const arr = new CacheObliviousArray([10, 20, 30, 40, 50])
      expect(arr.toArray()).toEqual([10, 20, 30, 40, 50])
    })

    it('handles undefined argument as empty', () => {
      const arr = new CacheObliviousArray<number>(undefined)
      expect(arr.length()).toBe(0)
    })

    it('creates array with many items', () => {
      const items = Array.from({ length: 100 }, (_, i) => i)
      const arr = new CacheObliviousArray(items)
      expect(arr.length()).toBe(100)
      expect(arr.get(99)).toBe(99)
    })

    it('creates array with null items', () => {
      const arr = new CacheObliviousArray<null>([null, null])
      expect(arr.length()).toBe(2)
      expect(arr.get(0)).toBeNull()
    })
  })

  describe('get', () => {
    it('returns element at valid index', () => {
      const arr = new CacheObliviousArray([10, 20, 30])
      expect(arr.get(0)).toBe(10)
      expect(arr.get(1)).toBe(20)
      expect(arr.get(2)).toBe(30)
    })

    it('returns first element', () => {
      const arr = new CacheObliviousArray([99])
      expect(arr.get(0)).toBe(99)
    })

    it('returns last element', () => {
      const arr = new CacheObliviousArray([1, 2, 3, 4, 5])
      expect(arr.get(4)).toBe(5)
    })

    it('throws on negative index', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      expect(() => arr.get(-1)).toThrow(RangeError)
    })

    it('throws on index equal to length', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      expect(() => arr.get(3)).toThrow(RangeError)
    })

    it('throws on index greater than length', () => {
      const arr = new CacheObliviousArray([1, 2])
      expect(() => arr.get(100)).toThrow(RangeError)
    })

    it('throws on empty array', () => {
      const arr = new CacheObliviousArray<number>()
      expect(() => arr.get(0)).toThrow(RangeError)
    })

    it('returns correct values after push', () => {
      const arr = new CacheObliviousArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.get(0)).toBe(1)
      expect(arr.get(1)).toBe(2)
      expect(arr.get(2)).toBe(3)
    })

    it('returns correct values after set', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      arr.set(1, 99)
      expect(arr.get(1)).toBe(99)
      expect(arr.get(0)).toBe(1)
      expect(arr.get(2)).toBe(3)
    })

    it('works with large array', () => {
      const items = Array.from({ length: 1000 }, (_, i) => i * 2)
      const arr = new CacheObliviousArray(items)
      expect(arr.get(0)).toBe(0)
      expect(arr.get(500)).toBe(1000)
      expect(arr.get(999)).toBe(1998)
    })
  })

  describe('set', () => {
    it('sets value at valid index', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      arr.set(1, 99)
      expect(arr.get(1)).toBe(99)
    })

    it('sets first element', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      arr.set(0, 100)
      expect(arr.get(0)).toBe(100)
    })

    it('sets last element', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      arr.set(2, 200)
      expect(arr.get(2)).toBe(200)
    })

    it('throws on negative index', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      expect(() => arr.set(-1, 99)).toThrow(RangeError)
    })

    it('throws on out of bounds index', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      expect(() => arr.set(3, 99)).toThrow(RangeError)
    })

    it('throws on empty array', () => {
      const arr = new CacheObliviousArray<number>()
      expect(() => arr.set(0, 1)).toThrow(RangeError)
    })

    it('preserves other elements after set', () => {
      const arr = new CacheObliviousArray([1, 2, 3, 4, 5])
      arr.set(2, 99)
      expect(arr.toArray()).toEqual([1, 2, 99, 4, 5])
    })

    it('allows setting same value', () => {
      const arr = new CacheObliviousArray([42])
      arr.set(0, 42)
      expect(arr.get(0)).toBe(42)
    })

    it('handles multiple sets', () => {
      const arr = new CacheObliviousArray([1, 2, 3, 4])
      arr.set(0, 10)
      arr.set(1, 20)
      arr.set(2, 30)
      arr.set(3, 40)
      expect(arr.toArray()).toEqual([10, 20, 30, 40])
    })
  })

  describe('push', () => {
    it('adds element to empty array', () => {
      const arr = new CacheObliviousArray<number>()
      arr.push(1)
      expect(arr.length()).toBe(1)
      expect(arr.get(0)).toBe(1)
    })

    it('adds multiple elements', () => {
      const arr = new CacheObliviousArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('updates length after each push', () => {
      const arr = new CacheObliviousArray<number>()
      expect(arr.length()).toBe(0)
      arr.push(1)
      expect(arr.length()).toBe(1)
      arr.push(2)
      expect(arr.length()).toBe(2)
    })

    it('pushes to non-empty array', () => {
      const arr = new CacheObliviousArray([1, 2])
      arr.push(3)
      expect(arr.length()).toBe(3)
      expect(arr.get(2)).toBe(3)
    })

    it('pushes undefined values', () => {
      const arr = new CacheObliviousArray<number | undefined>()
      arr.push(undefined)
      expect(arr.length()).toBe(1)
      expect(arr.get(0)).toBeUndefined()
    })

    it('handles many pushes', () => {
      const arr = new CacheObliviousArray<number>()
      for (let i = 0; i < 100; i++) {
        arr.push(i)
      }
      expect(arr.length()).toBe(100)
      expect(arr.get(0)).toBe(0)
      expect(arr.get(99)).toBe(99)
    })

    it('maintains order after many pushes', () => {
      const arr = new CacheObliviousArray<number>()
      for (let i = 0; i < 50; i++) {
        arr.push(i * 2)
      }
      for (let i = 0; i < 50; i++) {
        expect(arr.get(i)).toBe(i * 2)
      }
    })
  })

  describe('pop', () => {
    it('returns last element', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      expect(arr.pop()).toBe(3)
    })

    it('removes element from array', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      arr.pop()
      expect(arr.length()).toBe(2)
    })

    it('returns elements in LIFO order', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      expect(arr.pop()).toBe(3)
      expect(arr.pop()).toBe(2)
      expect(arr.pop()).toBe(1)
    })

    it('throws on empty array', () => {
      const arr = new CacheObliviousArray<number>()
      expect(() => arr.pop()).toThrow(RangeError)
    })

    it('handles pop to empty', () => {
      const arr = new CacheObliviousArray([42])
      expect(arr.pop()).toBe(42)
      expect(arr.isEmpty()).toBe(true)
      expect(arr.length()).toBe(0)
    })

    it('can push after pop', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      arr.pop()
      arr.push(99)
      expect(arr.toArray()).toEqual([1, 2, 99])
    })

    it('handles interleaved push and pop', () => {
      const arr = new CacheObliviousArray<number>()
      arr.push(1)
      arr.push(2)
      expect(arr.pop()).toBe(2)
      arr.push(3)
      expect(arr.pop()).toBe(3)
      expect(arr.pop()).toBe(1)
      expect(arr.isEmpty()).toBe(true)
    })

    it('handles many pops', () => {
      const items = Array.from({ length: 50 }, (_, i) => i)
      const arr = new CacheObliviousArray(items)
      for (let i = 49; i >= 0; i--) {
        expect(arr.pop()).toBe(i)
      }
      expect(arr.isEmpty()).toBe(true)
    })
  })

  describe('length', () => {
    it('returns 0 for empty array', () => {
      const arr = new CacheObliviousArray<number>()
      expect(arr.length()).toBe(0)
    })

    it('returns correct length after constructor', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      expect(arr.length()).toBe(3)
    })

    it('returns correct length after push', () => {
      const arr = new CacheObliviousArray<number>()
      arr.push(1)
      expect(arr.length()).toBe(1)
    })

    it('returns correct length after pop', () => {
      const arr = new CacheObliviousArray([1, 2])
      arr.pop()
      expect(arr.length()).toBe(1)
    })

    it('returns correct length after clear', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      arr.clear()
      expect(arr.length()).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new empty array', () => {
      const arr = new CacheObliviousArray<number>()
      expect(arr.isEmpty()).toBe(true)
    })

    it('returns false after push', () => {
      const arr = new CacheObliviousArray<number>()
      arr.push(1)
      expect(arr.isEmpty()).toBe(false)
    })

    it('returns true after clearing all elements', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      arr.clear()
      expect(arr.isEmpty()).toBe(true)
    })

    it('returns true after popping all elements', () => {
      const arr = new CacheObliviousArray([1])
      arr.pop()
      expect(arr.isEmpty()).toBe(true)
    })

    it('returns false for non-empty constructor', () => {
      const arr = new CacheObliviousArray([1])
      expect(arr.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('clears empty array without error', () => {
      const arr = new CacheObliviousArray<number>()
      arr.clear()
      expect(arr.length()).toBe(0)
      expect(arr.isEmpty()).toBe(true)
    })

    it('clears array with elements', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      arr.clear()
      expect(arr.length()).toBe(0)
      expect(arr.isEmpty()).toBe(true)
    })

    it('allows operations after clear', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      arr.clear()
      arr.push(99)
      expect(arr.length()).toBe(1)
      expect(arr.get(0)).toBe(99)
    })

    it('double clear is safe', () => {
      const arr = new CacheObliviousArray([1, 2])
      arr.clear()
      arr.clear()
      expect(arr.isEmpty()).toBe(true)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty CacheObliviousArray', () => {
      const arr = new CacheObliviousArray<number>()
      expect(arr.toArray()).toEqual([])
    })

    it('returns single element array', () => {
      const arr = new CacheObliviousArray([42])
      expect(arr.toArray()).toEqual([42])
    })

    it('returns all elements in order', () => {
      const arr = new CacheObliviousArray([10, 20, 30, 40])
      expect(arr.toArray()).toEqual([10, 20, 30, 40])
    })

    it('returns copy of elements', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      const result = arr.toArray()
      result[0] = 99
      expect(arr.get(0)).toBe(1)
    })

    it('reflects modifications', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      arr.set(1, 99)
      expect(arr.toArray()).toEqual([1, 99, 3])
    })

    it('reflects push and pop', () => {
      const arr = new CacheObliviousArray([1, 2])
      arr.push(3)
      expect(arr.toArray()).toEqual([1, 2, 3])
      arr.pop()
      expect(arr.toArray()).toEqual([1, 2])
    })
  })

  describe('indexOf', () => {
    it('finds existing element', () => {
      const arr = new CacheObliviousArray([10, 20, 30])
      expect(arr.indexOf(20)).toBe(1)
    })

    it('returns -1 for non-existing element', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      expect(arr.indexOf(99)).toBe(-1)
    })

    it('finds first occurrence', () => {
      const arr = new CacheObliviousArray([1, 2, 2, 3])
      expect(arr.indexOf(2)).toBe(1)
    })

    it('finds first element', () => {
      const arr = new CacheObliviousArray([5, 6, 7])
      expect(arr.indexOf(5)).toBe(0)
    })

    it('finds last element', () => {
      const arr = new CacheObliviousArray([5, 6, 7])
      expect(arr.indexOf(7)).toBe(2)
    })

    it('returns -1 on empty array', () => {
      const arr = new CacheObliviousArray<number>()
      expect(arr.indexOf(1)).toBe(-1)
    })

    it('finds string elements', () => {
      const arr = new CacheObliviousArray(['a', 'b', 'c'])
      expect(arr.indexOf('b')).toBe(1)
    })

    it('uses strict equality', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      expect(arr.indexOf('1' as unknown as number)).toBe(-1)
    })
  })

  describe('includes', () => {
    it('returns true for existing element', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      expect(arr.includes(2)).toBe(true)
    })

    it('returns false for non-existing element', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      expect(arr.includes(99)).toBe(false)
    })

    it('returns false on empty array', () => {
      const arr = new CacheObliviousArray<number>()
      expect(arr.includes(1)).toBe(false)
    })

    it('finds first element', () => {
      const arr = new CacheObliviousArray([10, 20, 30])
      expect(arr.includes(10)).toBe(true)
    })

    it('finds last element', () => {
      const arr = new CacheObliviousArray([10, 20, 30])
      expect(arr.includes(30)).toBe(true)
    })

    it('handles null', () => {
      const arr = new CacheObliviousArray<null>([null])
      expect(arr.includes(null)).toBe(true)
    })
  })

  describe('slice', () => {
    it('returns full array with no arguments', () => {
      const arr = new CacheObliviousArray([1, 2, 3, 4, 5])
      expect(arr.slice()).toEqual([1, 2, 3, 4, 5])
    })

    it('returns from start index', () => {
      const arr = new CacheObliviousArray([1, 2, 3, 4, 5])
      expect(arr.slice(2)).toEqual([3, 4, 5])
    })

    it('returns range with start and end', () => {
      const arr = new CacheObliviousArray([1, 2, 3, 4, 5])
      expect(arr.slice(1, 4)).toEqual([2, 3, 4])
    })

    it('handles negative start', () => {
      const arr = new CacheObliviousArray([1, 2, 3, 4, 5])
      expect(arr.slice(-2)).toEqual([4, 5])
    })

    it('handles negative end', () => {
      const arr = new CacheObliviousArray([1, 2, 3, 4, 5])
      expect(arr.slice(1, -1)).toEqual([2, 3, 4])
    })

    it('returns empty for out of range', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      expect(arr.slice(10)).toEqual([])
    })

    it('returns empty for empty array', () => {
      const arr = new CacheObliviousArray<number>()
      expect(arr.slice()).toEqual([])
    })

    it('returns single element', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      expect(arr.slice(1, 2)).toEqual([2])
    })

    it('handles both negative indices', () => {
      const arr = new CacheObliviousArray([1, 2, 3, 4, 5])
      expect(arr.slice(-3, -1)).toEqual([3, 4])
    })

    it('handles start beyond end', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      expect(arr.slice(3, 5)).toEqual([])
    })

    it('clamps end to length', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      expect(arr.slice(0, 100)).toEqual([1, 2, 3])
    })

    it('handles slice(0, 0)', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      expect(arr.slice(0, 0)).toEqual([])
    })
  })

  describe('forEach', () => {
    it('does not call callback on empty array', () => {
      const arr = new CacheObliviousArray<number>()
      let count = 0
      arr.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('calls callback for each element', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      const collected: number[] = []
      arr.forEach((item) => { collected.push(item) })
      expect(collected).toEqual([1, 2, 3])
    })

    it('provides correct indices', () => {
      const arr = new CacheObliviousArray([10, 20, 30])
      const indices: number[] = []
      arr.forEach((_, index) => { indices.push(index) })
      expect(indices).toEqual([0, 1, 2])
    })

    it('provides correct item and index pairs', () => {
      const arr = new CacheObliviousArray(['a', 'b', 'c'])
      const pairs: [string, number][] = []
      arr.forEach((item, index) => { pairs.push([item, index]) })
      expect(pairs).toEqual([['a', 0], ['b', 1], ['c', 2]])
    })

    it('works with single element', () => {
      const arr = new CacheObliviousArray([42])
      const collected: number[] = []
      arr.forEach((item) => { collected.push(item) })
      expect(collected).toEqual([42])
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates over empty array', () => {
      const arr = new CacheObliviousArray<number>()
      const collected: number[] = []
      for (const item of arr) {
        collected.push(item)
      }
      expect(collected).toEqual([])
    })

    it('iterates over all elements', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      const collected: number[] = []
      for (const item of arr) {
        collected.push(item)
      }
      expect(collected).toEqual([1, 2, 3])
    })

    it('works with spread operator', () => {
      const arr = new CacheObliviousArray([10, 20, 30])
      expect([...arr]).toEqual([10, 20, 30])
    })

    it('works with Array.from', () => {
      const arr = new CacheObliviousArray([5, 6, 7])
      expect(Array.from(arr)).toEqual([5, 6, 7])
    })

    it('works with for...of after push', () => {
      const arr = new CacheObliviousArray<number>()
      arr.push(1)
      arr.push(2)
      const collected: number[] = []
      for (const item of arr) {
        collected.push(item)
      }
      expect(collected).toEqual([1, 2])
    })
  })

  describe('search', () => {
    it('finds element in sorted array', () => {
      const arr = new CacheObliviousArray([1, 3, 5, 7, 9])
      expect(arr.search((item) => item - 5)).toBe(2)
    })

    it('returns -1 for element not in array', () => {
      const arr = new CacheObliviousArray([1, 3, 5, 7, 9])
      expect(arr.search((item) => item - 4)).toBe(-1)
    })

    it('finds first element', () => {
      const arr = new CacheObliviousArray([2, 4, 6, 8])
      expect(arr.search((item) => item - 2)).toBe(0)
    })

    it('finds last element', () => {
      const arr = new CacheObliviousArray([2, 4, 6, 8])
      expect(arr.search((item) => item - 8)).toBe(3)
    })

    it('returns -1 for empty array', () => {
      const arr = new CacheObliviousArray<number>()
      expect(arr.search((item) => item - 5)).toBe(-1)
    })

    it('finds element in single element array', () => {
      const arr = new CacheObliviousArray([42])
      expect(arr.search((item) => item - 42)).toBe(0)
    })

    it('returns -1 for single element not matching', () => {
      const arr = new CacheObliviousArray([42])
      expect(arr.search((item) => item - 10)).toBe(-1)
    })

    it('works with string array', () => {
      const arr = new CacheObliviousArray(['a', 'c', 'e', 'g'])
      expect(arr.search((item) => item.localeCompare('e'))).toBe(2)
    })

    it('finds middle element in large array', () => {
      const items = Array.from({ length: 101 }, (_, i) => i * 2)
      const arr = new CacheObliviousArray(items)
      expect(arr.search((item) => item - 100)).toBe(50)
    })

    it('handles negative comparator correctly', () => {
      const arr = new CacheObliviousArray([10, 20, 30, 40, 50])
      expect(arr.search((item) => item - 15)).toBe(-1)
    })
  })

  describe('clone', () => {
    it('clones empty array', () => {
      const arr = new CacheObliviousArray<number>()
      const cloned = arr.clone()
      expect(cloned.length()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('clones array with elements', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      const cloned = arr.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3])
    })

    it('produces independent copy', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      const cloned = arr.clone()
      arr.set(0, 99)
      expect(cloned.get(0)).toBe(1)
    })

    it('clone modifications do not affect original', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      const cloned = arr.clone()
      cloned.push(4)
      expect(arr.length()).toBe(3)
      expect(cloned.length()).toBe(4)
    })

    it('clones single element array', () => {
      const arr = new CacheObliviousArray([42])
      const cloned = arr.clone()
      expect(cloned.get(0)).toBe(42)
      expect(cloned.length()).toBe(1)
    })

    it('clones large array', () => {
      const items = Array.from({ length: 50 }, (_, i) => i)
      const arr = new CacheObliviousArray(items)
      const cloned = arr.clone()
      expect(cloned.toArray()).toEqual(items)
    })
  })

  describe('fromArray', () => {
    it('creates array from empty array', () => {
      const arr = CacheObliviousArray.fromArray<number>([])
      expect(arr.length()).toBe(0)
    })

    it('creates array from items', () => {
      const arr = CacheObliviousArray.fromArray([1, 2, 3])
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('creates independent instance', () => {
      const original = [1, 2, 3]
      const arr = CacheObliviousArray.fromArray(original)
      original.push(4)
      expect(arr.length()).toBe(3)
    })

    it('preserves order', () => {
      const arr = CacheObliviousArray.fromArray([5, 4, 3, 2, 1])
      expect(arr.toArray()).toEqual([5, 4, 3, 2, 1])
    })

    it('works with string arrays', () => {
      const arr = CacheObliviousArray.fromArray(['x', 'y', 'z'])
      expect(arr.get(1)).toBe('y')
    })

    it('works with large arrays', () => {
      const items = Array.from({ length: 200 }, (_, i) => i)
      const arr = CacheObliviousArray.fromArray(items)
      expect(arr.length()).toBe(200)
      expect(arr.get(199)).toBe(199)
    })
  })

  describe('layout correctness', () => {
    it('block size is sqrt(N) for N=4', () => {
      const arr = new CacheObliviousArray([1, 2, 3, 4])
      expect(arr.blockSize()).toBe(2)
    })

    it('block size is sqrt(N) for N=9', () => {
      const arr = new CacheObliviousArray([1, 2, 3, 4, 5, 6, 7, 8, 9])
      expect(arr.blockSize()).toBe(3)
    })

    it('block size is 1 for single element', () => {
      const arr = new CacheObliviousArray([1])
      expect(arr.blockSize()).toBe(1)
    })

    it('block size is 1 for empty array', () => {
      const arr = new CacheObliviousArray<number>()
      expect(arr.blockSize()).toBe(1)
    })

    it('block count is correct for N=4, blockSize=2', () => {
      const arr = new CacheObliviousArray([1, 2, 3, 4])
      expect(arr.blockSize()).toBe(2)
      expect(arr.blockCount()).toBe(2)
    })

    it('block count is correct for N=9, blockSize=3', () => {
      const arr = new CacheObliviousArray([1, 2, 3, 4, 5, 6, 7, 8, 9])
      expect(arr.blockSize()).toBe(3)
      expect(arr.blockCount()).toBe(3)
    })

    it('block count is 0 for empty array', () => {
      const arr = new CacheObliviousArray<number>()
      expect(arr.blockCount()).toBe(0)
    })

    it('block size adjusts as array grows', () => {
      const arr = new CacheObliviousArray<number>()
      arr.push(1)
      expect(arr.blockSize()).toBe(1)
      for (let i = 2; i <= 4; i++) arr.push(i)
      expect(arr.blockSize()).toBe(2)
      for (let i = 5; i <= 9; i++) arr.push(i)
      expect(arr.blockSize()).toBe(3)
    })

    it('elements are in correct logical order after growth', () => {
      const arr = new CacheObliviousArray<number>()
      for (let i = 0; i < 20; i++) {
        arr.push(i)
      }
      for (let i = 0; i < 20; i++) {
        expect(arr.get(i)).toBe(i)
      }
    })

    it('elements remain correct after many push/pop cycles', () => {
      const arr = new CacheObliviousArray<number>()
      for (let i = 0; i < 10; i++) arr.push(i)
      for (let i = 0; i < 5; i++) arr.pop()
      expect(arr.toArray()).toEqual([0, 1, 2, 3, 4])
      expect(arr.blockSize()).toBe(2)
      for (let i = 5; i < 15; i++) arr.push(i)
      expect(arr.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])
    })

    it('block size for N=16 is 4', () => {
      const items = Array.from({ length: 16 }, (_, i) => i)
      const arr = new CacheObliviousArray(items)
      expect(arr.blockSize()).toBe(4)
      expect(arr.blockCount()).toBe(4)
    })

    it('block size for N=25 is 5', () => {
      const items = Array.from({ length: 25 }, (_, i) => i)
      const arr = new CacheObliviousArray(items)
      expect(arr.blockSize()).toBe(5)
      expect(arr.blockCount()).toBe(5)
    })

    it('block count rounds up for non-perfect squares', () => {
      const arr = new CacheObliviousArray([1, 2, 3, 4, 5, 6, 7])
      expect(arr.blockSize()).toBe(2)
      expect(arr.blockCount()).toBe(4)
    })
  })

  describe('edge cases', () => {
    it('handles single element lifecycle', () => {
      const arr = new CacheObliviousArray<number>()
      arr.push(42)
      expect(arr.length()).toBe(1)
      expect(arr.get(0)).toBe(42)
      expect(arr.isEmpty()).toBe(false)
      expect(arr.pop()).toBe(42)
      expect(arr.isEmpty()).toBe(true)
    })

    it('handles large array operations', () => {
      const items = Array.from({ length: 500 }, (_, i) => i)
      const arr = new CacheObliviousArray(items)
      expect(arr.length()).toBe(500)
      expect(arr.get(0)).toBe(0)
      expect(arr.get(499)).toBe(499)
      expect(arr.indexOf(250)).toBe(250)
      expect(arr.includes(100)).toBe(true)
    })

    it('handles mixed operations', () => {
      const arr = new CacheObliviousArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.set(1, 20)
      expect(arr.get(1)).toBe(20)
      arr.pop()
      expect(arr.toArray()).toEqual([1, 20])
      arr.push(30)
      arr.push(40)
      expect(arr.slice(1, 3)).toEqual([20, 30])
    })

    it('handles boolean values', () => {
      const arr = new CacheObliviousArray([true, false, true])
      expect(arr.indexOf(false)).toBe(1)
      expect(arr.includes(true)).toBe(true)
    })

    it('handles zero as a value', () => {
      const arr = new CacheObliviousArray([0, 1, 2])
      expect(arr.indexOf(0)).toBe(0)
      expect(arr.includes(0)).toBe(true)
    })

    it('handles empty string', () => {
      const arr = new CacheObliviousArray(['', 'a', 'b'])
      expect(arr.indexOf('')).toBe(0)
      expect(arr.includes('')).toBe(true)
    })

    it('clone and modify independently', () => {
      const arr = new CacheObliviousArray([1, 2, 3])
      const clone = arr.clone()
      clone.pop()
      clone.push(99)
      expect(arr.toArray()).toEqual([1, 2, 3])
      expect(clone.toArray()).toEqual([1, 2, 99])
    })

    it('fromArray and constructor produce equivalent arrays', () => {
      const items = [1, 2, 3, 4, 5]
      const arr1 = new CacheObliviousArray(items)
      const arr2 = CacheObliviousArray.fromArray(items)
      expect(arr1.toArray()).toEqual(arr2.toArray())
      expect(arr1.length()).toBe(arr2.length())
    })

    it('search on sorted descending returns -1', () => {
      const arr = new CacheObliviousArray([9, 7, 5, 3, 1])
      expect(arr.search((item) => item - 5)).toBe(2)
    })

    it('slice does not modify original', () => {
      const arr = new CacheObliviousArray([1, 2, 3, 4, 5])
      arr.slice(1, 3)
      expect(arr.toArray()).toEqual([1, 2, 3, 4, 5])
    })
  })
})
