import { describe, it, expect } from 'vitest'
import { ResizableArray } from '../../src/core/resizable-array/index.js'

describe('ResizableArray', () => {
  describe('constructor', () => {
    it('creates array with default capacity', () => {
      const arr = new ResizableArray<number>()
      expect(arr.capacity).toBe(8)
      expect(arr.length).toBe(0)
    })

    it('creates array with custom capacity', () => {
      const arr = new ResizableArray<number>(16)
      expect(arr.capacity).toBe(16)
    })

    it('creates array with minimum capacity of 1', () => {
      const arr = new ResizableArray<number>(0)
      expect(arr.capacity).toBe(1)
    })

    it('creates array with negative capacity clamped to 1', () => {
      const arr = new ResizableArray<number>(-5)
      expect(arr.capacity).toBe(1)
    })

    it('creates array with fractional capacity floored', () => {
      const arr = new ResizableArray<number>(10.7)
      expect(arr.capacity).toBe(10)
    })

    it('accepts growthFactor option', () => {
      const arr = new ResizableArray<number>(8, { growthFactor: 1.5 })
      expect(arr.capacity).toBe(8)
    })

    it('accepts shrinkThreshold option', () => {
      const arr = new ResizableArray<number>(8, { shrinkThreshold: 0.5 })
      expect(arr.capacity).toBe(8)
    })

    it('accepts both options', () => {
      const arr = new ResizableArray<number>(8, { growthFactor: 3, shrinkThreshold: 0.1 })
      expect(arr.capacity).toBe(8)
    })
  })

  describe('push', () => {
    it('pushes a single element', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      expect(arr.length).toBe(1)
      expect(arr.get(0)).toBe(1)
    })

    it('pushes multiple elements', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.length).toBe(3)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('grows when capacity is exceeded', () => {
      const arr = new ResizableArray<number>(2)
      expect(arr.capacity).toBe(2)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.capacity).toBeGreaterThan(2)
      expect(arr.length).toBe(3)
    })

    it('grows by growthFactor', () => {
      const arr = new ResizableArray<number>(4, { growthFactor: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.push(5)
      expect(arr.capacity).toBe(8)
    })

    it('pushes strings', () => {
      const arr = new ResizableArray<string>(4)
      arr.push('a')
      arr.push('b')
      expect(arr.toArray()).toEqual(['a', 'b'])
    })

    it('pushes objects', () => {
      const arr = new ResizableArray<{ x: number }>(4)
      arr.push({ x: 1 })
      arr.push({ x: 2 })
      expect(arr.get(0).x).toBe(1)
      expect(arr.get(1).x).toBe(2)
    })

    it('pushes null values', () => {
      const arr = new ResizableArray<number | null>(4)
      arr.push(null)
      expect(arr.get(0)).toBe(null)
    })

    it('pushes undefined values', () => {
      const arr = new ResizableArray<number | undefined>(4)
      arr.push(undefined)
      expect(arr.get(0)).toBe(undefined)
    })

    it('handles many pushes', () => {
      const arr = new ResizableArray<number>(4)
      for (let i = 0; i < 1000; i++) {
        arr.push(i)
      }
      expect(arr.length).toBe(1000)
      expect(arr.get(999)).toBe(999)
    })
  })

  describe('pop', () => {
    it('pops the last element', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.pop()).toBe(3)
      expect(arr.length).toBe(2)
    })

    it('pops all elements', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(10)
      arr.push(20)
      expect(arr.pop()).toBe(20)
      expect(arr.pop()).toBe(10)
      expect(arr.length).toBe(0)
    })

    it('throws on empty array', () => {
      const arr = new ResizableArray<number>(4)
      expect(() => arr.pop()).toThrow(RangeError)
    })

    it('shrinks when utilization drops below threshold', () => {
      const arr = new ResizableArray<number>(4, { growthFactor: 2, shrinkThreshold: 0.25 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.push(5)
      arr.push(6)
      arr.push(7)
      arr.push(8)
      arr.push(9)
      const capBeforePop = arr.capacity
      arr.pop()
      arr.pop()
      arr.pop()
      arr.pop()
      arr.pop()
      arr.pop()
      arr.pop()
      arr.pop()
      expect(arr.capacity).toBeLessThan(capBeforePop)
    })

    it('returns correct values in LIFO order', () => {
      const arr = new ResizableArray<number>(8)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.pop()).toBe(3)
      expect(arr.pop()).toBe(2)
      expect(arr.pop()).toBe(1)
    })

    it('allows push after pop empties array', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(42)
      arr.pop()
      arr.push(99)
      expect(arr.get(0)).toBe(99)
      expect(arr.length).toBe(1)
    })
  })

  describe('get', () => {
    it('gets element at index', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(10)
      arr.push(20)
      arr.push(30)
      expect(arr.get(0)).toBe(10)
      expect(arr.get(1)).toBe(20)
      expect(arr.get(2)).toBe(30)
    })

    it('throws on negative index', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      expect(() => arr.get(-1)).toThrow(RangeError)
    })

    it('throws on index equal to length', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      expect(() => arr.get(1)).toThrow(RangeError)
    })

    it('throws on index greater than length', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      expect(() => arr.get(5)).toThrow(RangeError)
    })

    it('throws on empty array', () => {
      const arr = new ResizableArray<number>(4)
      expect(() => arr.get(0)).toThrow(RangeError)
    })
  })

  describe('set', () => {
    it('sets element at index', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.set(0, 99)
      expect(arr.get(0)).toBe(99)
    })

    it('overwrites existing value', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.set(1, 88)
      expect(arr.get(1)).toBe(88)
      expect(arr.length).toBe(2)
    })

    it('throws on negative index', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      expect(() => arr.set(-1, 99)).toThrow(RangeError)
    })

    it('throws on out of bounds index', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      expect(() => arr.set(5, 99)).toThrow(RangeError)
    })

    it('throws on empty array', () => {
      const arr = new ResizableArray<number>(4)
      expect(() => arr.set(0, 99)).toThrow(RangeError)
    })
  })

  describe('insertAt', () => {
    it('inserts at beginning', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.insertAt(0, 99)
      expect(arr.toArray()).toEqual([99, 1, 2])
    })

    it('inserts at middle', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(3)
      arr.insertAt(1, 2)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('inserts at end', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.insertAt(2, 3)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('inserts into empty array at index 0', () => {
      const arr = new ResizableArray<number>(4)
      arr.insertAt(0, 42)
      expect(arr.toArray()).toEqual([42])
    })

    it('throws on negative index', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      expect(() => arr.insertAt(-1, 99)).toThrow(RangeError)
    })

    it('throws on index past end', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      expect(() => arr.insertAt(2, 99)).toThrow(RangeError)
    })

    it('grows when needed', () => {
      const arr = new ResizableArray<number>(2)
      arr.push(1)
      arr.push(2)
      arr.insertAt(1, 99)
      expect(arr.toArray()).toEqual([1, 99, 2])
      expect(arr.capacity).toBeGreaterThanOrEqual(3)
    })
  })

  describe('removeAt', () => {
    it('removes from beginning', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.removeAt(0)).toBe(1)
      expect(arr.toArray()).toEqual([2, 3])
    })

    it('removes from middle', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.removeAt(1)).toBe(2)
      expect(arr.toArray()).toEqual([1, 3])
    })

    it('removes from end', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.removeAt(2)).toBe(3)
      expect(arr.toArray()).toEqual([1, 2])
    })

    it('removes single element', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(42)
      expect(arr.removeAt(0)).toBe(42)
      expect(arr.length).toBe(0)
    })

    it('throws on negative index', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      expect(() => arr.removeAt(-1)).toThrow(RangeError)
    })

    it('throws on out of bounds', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      expect(() => arr.removeAt(1)).toThrow(RangeError)
    })

    it('throws on empty array', () => {
      const arr = new ResizableArray<number>(4)
      expect(() => arr.removeAt(0)).toThrow(RangeError)
    })

    it('shrinks when utilization drops', () => {
      const arr = new ResizableArray<number>(4, { growthFactor: 2, shrinkThreshold: 0.25 })
      for (let i = 0; i < 10; i++) arr.push(i)
      const capAfterGrow = arr.capacity
      for (let i = arr.length - 1; i >= 1; i--) arr.removeAt(i)
      expect(arr.capacity).toBeLessThan(capAfterGrow)
    })
  })

  describe('first', () => {
    it('returns first element', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(10)
      arr.push(20)
      expect(arr.first()).toBe(10)
    })

    it('throws on empty array', () => {
      const arr = new ResizableArray<number>(4)
      expect(() => arr.first()).toThrow(RangeError)
    })
  })

  describe('last', () => {
    it('returns last element', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(10)
      arr.push(20)
      expect(arr.last()).toBe(20)
    })

    it('returns only element for single-element array', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(42)
      expect(arr.last()).toBe(42)
    })

    it('throws on empty array', () => {
      const arr = new ResizableArray<number>(4)
      expect(() => arr.last()).toThrow(RangeError)
    })
  })

  describe('indexOf', () => {
    it('finds existing element', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(10)
      arr.push(20)
      arr.push(30)
      expect(arr.indexOf(20)).toBe(1)
    })

    it('returns -1 for non-existent element', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      expect(arr.indexOf(99)).toBe(-1)
    })

    it('returns first occurrence', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(1)
      expect(arr.indexOf(1)).toBe(0)
    })

    it('returns -1 on empty array', () => {
      const arr = new ResizableArray<number>(4)
      expect(arr.indexOf(1)).toBe(-1)
    })
  })

  describe('lastIndexOf', () => {
    it('finds last occurrence', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(1)
      expect(arr.lastIndexOf(1)).toBe(2)
    })

    it('returns -1 for non-existent element', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      expect(arr.lastIndexOf(99)).toBe(-1)
    })

    it('returns -1 on empty array', () => {
      const arr = new ResizableArray<number>(4)
      expect(arr.lastIndexOf(1)).toBe(-1)
    })
  })

  describe('includes', () => {
    it('returns true for existing element', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.includes(2)).toBe(true)
    })

    it('returns false for non-existent element', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      expect(arr.includes(99)).toBe(false)
    })

    it('returns false on empty array', () => {
      const arr = new ResizableArray<number>(4)
      expect(arr.includes(1)).toBe(false)
    })

    it('finds null', () => {
      const arr = new ResizableArray<number | null>(4)
      arr.push(null)
      expect(arr.includes(null)).toBe(true)
    })
  })

  describe('slice', () => {
    it('slices with no args returns copy', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      const sliced = arr.slice()
      expect(sliced.toArray()).toEqual([1, 2, 3])
    })

    it('slices with start', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.slice(1).toArray()).toEqual([2, 3])
    })

    it('slices with start and end', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      expect(arr.slice(1, 3).toArray()).toEqual([2, 3])
    })

    it('handles negative start', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.slice(-2).toArray()).toEqual([2, 3])
    })

    it('handles negative end', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.slice(0, -1).toArray()).toEqual([1, 2])
    })

    it('handles start beyond length', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      expect(arr.slice(10).toArray()).toEqual([])
    })

    it('handles end beyond length', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      expect(arr.slice(0, 100).toArray()).toEqual([1, 2])
    })

    it('handles empty result', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      expect(arr.slice(1, 1).toArray()).toEqual([])
    })

    it('does not modify original', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.slice(0, 1)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('splice', () => {
    it('removes elements', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      const removed = arr.splice(1, 1)
      expect(removed).toEqual([2])
      expect(arr.toArray()).toEqual([1, 3])
    })

    it('removes from beginning', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.splice(0, 1)
      expect(arr.toArray()).toEqual([2, 3])
    })

    it('removes from end', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.splice(2, 1)
      expect(arr.toArray()).toEqual([1, 2])
    })

    it('removes all elements from start', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      const removed = arr.splice(0)
      expect(removed).toEqual([1, 2, 3])
      expect(arr.length).toBe(0)
    })

    it('inserts without removing', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(3)
      arr.splice(1, 0, 2)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('replaces elements', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      const removed = arr.splice(1, 1, 20)
      expect(removed).toEqual([2])
      expect(arr.toArray()).toEqual([1, 20, 3])
    })

    it('handles negative start', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.splice(-1, 1)
      expect(arr.toArray()).toEqual([1, 2])
    })

    it('handles start beyond length', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.splice(10, 0, 99)
      expect(arr.toArray()).toEqual([1, 2, 99])
    })

    it('handles deleteCount exceeding remaining', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.splice(1, 100)
      expect(arr.toArray()).toEqual([1])
    })

    it('inserts multiple items', () => {
      const arr = new ResizableArray<number>(8)
      arr.push(1)
      arr.push(5)
      arr.splice(1, 1, 2, 3, 4)
      expect(arr.toArray()).toEqual([1, 2, 3, 4])
    })

    it('handles empty splice', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      const removed = arr.splice(1, 0)
      expect(removed).toEqual([])
      expect(arr.toArray()).toEqual([1, 2])
    })
  })

  describe('reverse', () => {
    it('reverses array in place', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.reverse()
      expect(arr.toArray()).toEqual([3, 2, 1])
    })

    it('reverses two elements', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.reverse()
      expect(arr.toArray()).toEqual([2, 1])
    })

    it('reverses single element', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(42)
      arr.reverse()
      expect(arr.toArray()).toEqual([42])
    })

    it('handles empty array', () => {
      const arr = new ResizableArray<number>(4)
      arr.reverse()
      expect(arr.length).toBe(0)
    })

    it('reverses even-length array', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.reverse()
      expect(arr.toArray()).toEqual([4, 3, 2, 1])
    })
  })

  describe('sort', () => {
    it('sorts numbers ascending with comparator', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(3)
      arr.push(1)
      arr.push(2)
      arr.sort((a, b) => a - b)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('sorts numbers descending', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(3)
      arr.push(2)
      arr.sort((a, b) => b - a)
      expect(arr.toArray()).toEqual([3, 2, 1])
    })

    it('sorts strings', () => {
      const arr = new ResizableArray<string>(4)
      arr.push('banana')
      arr.push('apple')
      arr.push('cherry')
      arr.sort((a, b) => a.localeCompare(b))
      expect(arr.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('sorts empty array', () => {
      const arr = new ResizableArray<number>(4)
      arr.sort((a, b) => a - b)
      expect(arr.length).toBe(0)
    })

    it('sorts single element', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(42)
      arr.sort((a, b) => a - b)
      expect(arr.toArray()).toEqual([42])
    })

    it('handles already sorted array', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.sort((a, b) => a - b)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('fill', () => {
    it('fills entire array', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.fill(0)
      expect(arr.toArray()).toEqual([0, 0, 0])
    })

    it('fills from start index', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.fill(0, 1)
      expect(arr.toArray()).toEqual([1, 0, 0])
    })

    it('fills with start and end', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.fill(0, 1, 3)
      expect(arr.toArray()).toEqual([1, 0, 0, 4])
    })

    it('handles negative start', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.fill(0, -2)
      expect(arr.toArray()).toEqual([1, 0, 0])
    })

    it('handles negative end', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.fill(0, 0, -1)
      expect(arr.toArray()).toEqual([0, 0, 3])
    })

    it('handles empty array', () => {
      const arr = new ResizableArray<number>(4)
      arr.fill(0)
      expect(arr.length).toBe(0)
    })
  })

  describe('map', () => {
    it('maps to new values', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      const mapped = arr.map(x => x * 2)
      expect(mapped.toArray()).toEqual([2, 4, 6])
    })

    it('maps to different type', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      const mapped = arr.map(x => `item-${x}`)
      expect(mapped.toArray()).toEqual(['item-1', 'item-2', 'item-3'])
    })

    it('provides index to callback', () => {
      const arr = new ResizableArray<string>(4)
      arr.push('a')
      arr.push('b')
      const mapped = arr.map((item, i) => `${i}:${item}`)
      expect(mapped.toArray()).toEqual(['0:a', '1:b'])
    })

    it('handles empty array', () => {
      const arr = new ResizableArray<number>(4)
      const mapped = arr.map(x => x * 2)
      expect(mapped.length).toBe(0)
    })

    it('does not modify original', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.map(x => x * 2)
      expect(arr.toArray()).toEqual([1, 2])
    })
  })

  describe('filter', () => {
    it('filters elements', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      const filtered = arr.filter(x => x % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4])
    })

    it('filters all elements', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(3)
      const filtered = arr.filter(x => x % 2 === 0)
      expect(filtered.toArray()).toEqual([])
    })

    it('keeps all elements', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(2)
      arr.push(4)
      const filtered = arr.filter(x => x % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4])
    })

    it('provides index to callback', () => {
      const arr = new ResizableArray<string>(4)
      arr.push('a')
      arr.push('b')
      arr.push('c')
      const filtered = arr.filter((_item, i) => i > 0)
      expect(filtered.toArray()).toEqual(['b', 'c'])
    })

    it('handles empty array', () => {
      const arr = new ResizableArray<number>(4)
      const filtered = arr.filter(x => x > 0)
      expect(filtered.length).toBe(0)
    })
  })

  describe('reduce', () => {
    it('sums numbers', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.reduce((sum, x) => sum + x, 0)).toBe(6)
    })

    it('concatenates strings', () => {
      const arr = new ResizableArray<string>(4)
      arr.push('a')
      arr.push('b')
      arr.push('c')
      expect(arr.reduce((acc, s) => acc + s, '')).toBe('abc')
    })

    it('returns initial on empty array', () => {
      const arr = new ResizableArray<number>(4)
      expect(arr.reduce((sum, x) => sum + x, 0)).toBe(0)
    })

    it('provides index to callback', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(10)
      arr.push(20)
      const result = arr.reduce((acc, _item, i) => acc + i, 0)
      expect(result).toBe(1)
    })

    it('builds an object', () => {
      const arr = new ResizableArray<string>(4)
      arr.push('a')
      arr.push('bb')
      arr.push('ccc')
      const result = arr.reduce<Record<string, number>>((acc, s) => {
        acc[s] = s.length
        return acc
      }, {})
      expect(result).toEqual({ a: 1, bb: 2, ccc: 3 })
    })
  })

  describe('forEach', () => {
    it('iterates over all elements', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      const collected: number[] = []
      arr.forEach(x => collected.push(x))
      expect(collected).toEqual([1, 2, 3])
    })

    it('provides index', () => {
      const arr = new ResizableArray<string>(4)
      arr.push('a')
      arr.push('b')
      const indices: number[] = []
      arr.forEach((_item, i) => indices.push(i))
      expect(indices).toEqual([0, 1])
    })

    it('handles empty array', () => {
      const arr = new ResizableArray<number>(4)
      let count = 0
      arr.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('find', () => {
    it('finds matching element', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.find(x => x > 1)).toBe(2)
    })

    it('returns undefined when not found', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      expect(arr.find(x => x > 10)).toBeUndefined()
    })

    it('returns undefined on empty array', () => {
      const arr = new ResizableArray<number>(4)
      expect(arr.find(x => x > 0)).toBeUndefined()
    })

    it('provides index to callback', () => {
      const arr = new ResizableArray<string>(4)
      arr.push('a')
      arr.push('bb')
      arr.push('ccc')
      expect(arr.find((_item, i) => i === 2)).toBe('ccc')
    })
  })

  describe('findIndex', () => {
    it('finds index of matching element', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.findIndex(x => x > 1)).toBe(1)
    })

    it('returns -1 when not found', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      expect(arr.findIndex(x => x > 10)).toBe(-1)
    })

    it('returns -1 on empty array', () => {
      const arr = new ResizableArray<number>(4)
      expect(arr.findIndex(x => x > 0)).toBe(-1)
    })
  })

  describe('every', () => {
    it('returns true when all match', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(2)
      arr.push(4)
      arr.push(6)
      expect(arr.every(x => x % 2 === 0)).toBe(true)
    })

    it('returns false when some dont match', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      expect(arr.every(x => x % 2 === 0)).toBe(false)
    })

    it('returns true on empty array', () => {
      const arr = new ResizableArray<number>(4)
      expect(arr.every(x => x > 0)).toBe(true)
    })

    it('provides index to callback', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(0)
      arr.push(1)
      arr.push(2)
      expect(arr.every((x, i) => x === i)).toBe(true)
    })
  })

  describe('some', () => {
    it('returns true when at least one matches', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.some(x => x > 2)).toBe(true)
    })

    it('returns false when none match', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      expect(arr.some(x => x > 10)).toBe(false)
    })

    it('returns false on empty array', () => {
      const arr = new ResizableArray<number>(4)
      expect(arr.some(x => x > 0)).toBe(false)
    })
  })

  describe('join', () => {
    it('joins with default separator', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.join()).toBe('1,2,3')
    })

    it('joins with custom separator', () => {
      const arr = new ResizableArray<string>(4)
      arr.push('a')
      arr.push('b')
      arr.push('c')
      expect(arr.join('-')).toBe('a-b-c')
    })

    it('returns empty string for empty array', () => {
      const arr = new ResizableArray<number>(4)
      expect(arr.join()).toBe('')
    })

    it('returns single element without separator', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(42)
      expect(arr.join('-')).toBe('42')
    })

    it('handles empty string separator', () => {
      const arr = new ResizableArray<string>(4)
      arr.push('a')
      arr.push('b')
      expect(arr.join('')).toBe('ab')
    })
  })

  describe('concat', () => {
    it('concatenates two arrays', () => {
      const arr1 = new ResizableArray<number>(4)
      arr1.push(1)
      arr1.push(2)
      const arr2 = new ResizableArray<number>(4)
      arr2.push(3)
      arr2.push(4)
      const result = arr1.concat(arr2)
      expect(result.toArray()).toEqual([1, 2, 3, 4])
    })

    it('concatenates multiple arrays', () => {
      const arr1 = new ResizableArray<number>(2)
      arr1.push(1)
      const arr2 = new ResizableArray<number>(2)
      arr2.push(2)
      const arr3 = new ResizableArray<number>(2)
      arr3.push(3)
      const result = arr1.concat(arr2, arr3)
      expect(result.toArray()).toEqual([1, 2, 3])
    })

    it('concatenates with no args returns copy', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      const result = arr.concat()
      expect(result.toArray()).toEqual([1, 2])
    })

    it('does not modify originals', () => {
      const arr1 = new ResizableArray<number>(4)
      arr1.push(1)
      const arr2 = new ResizableArray<number>(4)
      arr2.push(2)
      arr1.concat(arr2)
      expect(arr1.toArray()).toEqual([1])
      expect(arr2.toArray()).toEqual([2])
    })

    it('handles empty arrays', () => {
      const arr1 = new ResizableArray<number>(4)
      arr1.push(1)
      const arr2 = new ResizableArray<number>(4)
      const result = arr1.concat(arr2)
      expect(result.toArray()).toEqual([1])
    })
  })

  describe('toArray', () => {
    it('converts to native array', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('returns empty array for empty ResizableArray', () => {
      const arr = new ResizableArray<number>(4)
      expect(arr.toArray()).toEqual([])
    })
  })

  describe('fromArray', () => {
    it('creates from array', () => {
      const arr = ResizableArray.fromArray([1, 2, 3])
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('creates from empty array', () => {
      const arr = ResizableArray.fromArray([])
      expect(arr.length).toBe(0)
    })

    it('creates from single-element array', () => {
      const arr = ResizableArray.fromArray([42])
      expect(arr.toArray()).toEqual([42])
    })

    it('capacity is at least the array length', () => {
      const arr = ResizableArray.fromArray([1, 2, 3, 4, 5])
      expect(arr.capacity).toBeGreaterThanOrEqual(5)
    })
  })

  describe('capacity management', () => {
    it('length tracks elements', () => {
      const arr = new ResizableArray<number>(4)
      expect(arr.length).toBe(0)
      arr.push(1)
      expect(arr.length).toBe(1)
      arr.pop()
      expect(arr.length).toBe(0)
    })

    it('capacity tracks buffer size', () => {
      const arr = new ResizableArray<number>(4)
      expect(arr.capacity).toBe(4)
      arr.push(1)
      expect(arr.capacity).toBe(4)
    })

    it('utilization is length/capacity', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      expect(arr.utilization).toBeCloseTo(0.5)
    })

    it('utilization is 0 for empty array', () => {
      const arr = new ResizableArray<number>(4)
      expect(arr.utilization).toBe(0)
    })

    it('utilization is 1 when full', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      expect(arr.utilization).toBe(1)
    })
  })

  describe('trimToSize', () => {
    it('trims capacity to length', () => {
      const arr = new ResizableArray<number>(16)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.trimToSize()
      expect(arr.capacity).toBe(3)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('trims empty array to 1', () => {
      const arr = new ResizableArray<number>(16)
      arr.trimToSize()
      expect(arr.capacity).toBe(1)
    })

    it('no-op when already trimmed', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.trimToSize()
      expect(arr.capacity).toBe(4)
    })
  })

  describe('ensureCapacity', () => {
    it('expands capacity when needed', () => {
      const arr = new ResizableArray<number>(4)
      arr.ensureCapacity(32)
      expect(arr.capacity).toBe(32)
    })

    it('no-op when already sufficient', () => {
      const arr = new ResizableArray<number>(16)
      arr.ensureCapacity(8)
      expect(arr.capacity).toBe(16)
    })

    it('ensures capacity before push', () => {
      const arr = new ResizableArray<number>(4)
      arr.ensureCapacity(10)
      for (let i = 0; i < 10; i++) arr.push(i)
      expect(arr.capacity).toBe(10)
    })
  })

  describe('clear', () => {
    it('clears all elements', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.clear()
      expect(arr.length).toBe(0)
      expect(arr.isEmpty()).toBe(true)
    })

    it('preserves capacity', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.push(5)
      const capBeforeClear = arr.capacity
      arr.clear()
      expect(arr.capacity).toBe(capBeforeClear)
    })

    it('allows push after clear', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.clear()
      arr.push(99)
      expect(arr.get(0)).toBe(99)
      expect(arr.length).toBe(1)
    })

    it('clears empty array', () => {
      const arr = new ResizableArray<number>(4)
      arr.clear()
      expect(arr.length).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new array', () => {
      const arr = new ResizableArray<number>(4)
      expect(arr.isEmpty()).toBe(true)
    })

    it('returns false with elements', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      expect(arr.isEmpty()).toBe(false)
    })

    it('returns true after clear', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.clear()
      expect(arr.isEmpty()).toBe(true)
    })

    it('returns true after popping all', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.pop()
      expect(arr.isEmpty()).toBe(true)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      const cloned = arr.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3])
      cloned.set(0, 99)
      expect(arr.get(0)).toBe(1)
    })

    it('clones empty array', () => {
      const arr = new ResizableArray<number>(4)
      const cloned = arr.clone()
      expect(cloned.length).toBe(0)
    })

    it('preserves capacity', () => {
      const arr = new ResizableArray<number>(16)
      arr.push(1)
      const cloned = arr.clone()
      expect(cloned.capacity).toBe(16)
    })

    it('preserves growth options', () => {
      const arr = new ResizableArray<number>(4, { growthFactor: 1.5, shrinkThreshold: 0.1 })
      arr.push(1)
      arr.push(2)
      const cloned = arr.clone()
      cloned.push(3)
      cloned.push(4)
      cloned.push(5)
      expect(cloned.length).toBe(5)
      expect(cloned.toArray()).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('iteration', () => {
    it('iterates with for-of', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      const collected: number[] = []
      for (const item of arr) {
        collected.push(item)
      }
      expect(collected).toEqual([1, 2, 3])
    })

    it('iterates empty array', () => {
      const arr = new ResizableArray<number>(4)
      const collected: number[] = []
      for (const item of arr) {
        collected.push(item)
      }
      expect(collected).toEqual([])
    })

    it('works with spread operator', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect([...arr]).toEqual([1, 2, 3])
    })

    it('works with Array.from', () => {
      const arr = new ResizableArray<string>(4)
      arr.push('a')
      arr.push('b')
      expect(Array.from(arr)).toEqual(['a', 'b'])
    })

    it('works with destructuring', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(10)
      arr.push(20)
      const [a, b] = arr
      expect(a).toBe(10)
      expect(b).toBe(20)
    })
  })

  describe('growth behavior', () => {
    it('doubles capacity by default', () => {
      const arr = new ResizableArray<number>(4, { growthFactor: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      expect(arr.capacity).toBe(4)
      arr.push(5)
      expect(arr.capacity).toBe(8)
    })

    it('uses custom growth factor', () => {
      const arr = new ResizableArray<number>(4, { growthFactor: 1.5 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.push(5)
      expect(arr.capacity).toBeGreaterThanOrEqual(5)
    })

    it('growth factor of 3 triples capacity', () => {
      const arr = new ResizableArray<number>(3, { growthFactor: 3 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.capacity).toBe(3)
      arr.push(4)
      expect(arr.capacity).toBe(9)
    })

    it('handles growth factor less than 2', () => {
      const arr = new ResizableArray<number>(10, { growthFactor: 1.1 })
      for (let i = 0; i < 15; i++) arr.push(i)
      expect(arr.length).toBe(15)
      expect(arr.capacity).toBeGreaterThanOrEqual(15)
    })
  })

  describe('shrink behavior', () => {
    it('shrinks when below default threshold', () => {
      const arr = new ResizableArray<number>(4, { growthFactor: 2, shrinkThreshold: 0.25 })
      for (let i = 0; i < 20; i++) arr.push(i)
      expect(arr.capacity).toBeGreaterThan(20)
      while (arr.length > 2) arr.pop()
      expect(arr.capacity).toBeLessThan(32)
    })

    it('respects custom shrink threshold', () => {
      const arr = new ResizableArray<number>(4, { growthFactor: 2, shrinkThreshold: 0.5 })
      for (let i = 0; i < 10; i++) arr.push(i)
      while (arr.length > 4) arr.pop()
      expect(arr.capacity).toBeLessThan(16)
    })

    it('does not shrink below capacity of 1', () => {
      const arr = new ResizableArray<number>(2, { growthFactor: 2, shrinkThreshold: 0.25 })
      arr.push(1)
      arr.pop()
      expect(arr.capacity).toBeGreaterThanOrEqual(1)
    })
  })

  describe('edge cases', () => {
    it('handles alternating push/pop', () => {
      const arr = new ResizableArray<number>(4)
      for (let i = 0; i < 100; i++) {
        arr.push(i)
        if (i % 3 === 0) arr.pop()
      }
      expect(arr.length).toBeGreaterThan(0)
    })

    it('handles push after clear', () => {
      const arr = new ResizableArray<number>(4)
      for (let i = 0; i < 10; i++) arr.push(i)
      arr.clear()
      arr.push(99)
      expect(arr.get(0)).toBe(99)
    })

    it('handles boolean values', () => {
      const arr = new ResizableArray<boolean>(4)
      arr.push(true)
      arr.push(false)
      expect(arr.get(0)).toBe(true)
      expect(arr.get(1)).toBe(false)
    })

    it('handles zero values', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(0)
      expect(arr.get(0)).toBe(0)
      expect(arr.includes(0)).toBe(true)
    })

    it('handles empty string', () => {
      const arr = new ResizableArray<string>(4)
      arr.push('')
      expect(arr.get(0)).toBe('')
      expect(arr.includes('')).toBe(true)
    })

    it('handles false values', () => {
      const arr = new ResizableArray<boolean>(4)
      arr.push(false)
      expect(arr.get(0)).toBe(false)
      expect(arr.indexOf(false)).toBe(0)
    })
  })

  describe('large arrays', () => {
    it('handles 10000 elements', () => {
      const arr = new ResizableArray<number>(16)
      for (let i = 0; i < 10000; i++) {
        arr.push(i)
      }
      expect(arr.length).toBe(10000)
      expect(arr.get(0)).toBe(0)
      expect(arr.get(9999)).toBe(9999)
    })

    it('handles map on large array', () => {
      const arr = new ResizableArray<number>(16)
      for (let i = 0; i < 1000; i++) arr.push(i)
      const doubled = arr.map(x => x * 2)
      expect(doubled.length).toBe(1000)
      expect(doubled.get(500)).toBe(1000)
    })

    it('handles filter on large array', () => {
      const arr = new ResizableArray<number>(16)
      for (let i = 0; i < 1000; i++) arr.push(i)
      const evens = arr.filter(x => x % 2 === 0)
      expect(evens.length).toBe(500)
    })

    it('handles reduce on large array', () => {
      const arr = new ResizableArray<number>(16)
      for (let i = 0; i < 1000; i++) arr.push(i)
      const sum = arr.reduce((acc, x) => acc + x, 0)
      expect(sum).toBe(499500)
    })

    it('handles iteration on large array', () => {
      const arr = new ResizableArray<number>(16)
      for (let i = 0; i < 1000; i++) arr.push(i)
      let count = 0
      for (const _ of arr) count++
      expect(count).toBe(1000)
    })

    it('handles sort on large array', () => {
      const arr = new ResizableArray<number>(16)
      for (let i = 1000; i > 0; i--) arr.push(i)
      arr.sort((a, b) => a - b)
      expect(arr.get(0)).toBe(1)
      expect(arr.get(999)).toBe(1000)
    })

    it('handles reverse on large array', () => {
      const arr = new ResizableArray<number>(16)
      for (let i = 0; i < 1000; i++) arr.push(i)
      arr.reverse()
      expect(arr.get(0)).toBe(999)
      expect(arr.get(999)).toBe(0)
    })

    it('handles splice on large array', () => {
      const arr = new ResizableArray<number>(16)
      for (let i = 0; i < 1000; i++) arr.push(i)
      arr.splice(500, 100)
      expect(arr.length).toBe(900)
      expect(arr.get(499)).toBe(499)
      expect(arr.get(500)).toBe(600)
    })
  })

  describe('chaining and composition', () => {
    it('map then filter', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      const result = arr.map(x => x * 2).filter(x => x > 4)
      expect(result.toArray()).toEqual([6, 8])
    })

    it('filter then map', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      const result = arr.filter(x => x % 2 === 0).map(x => x * 10)
      expect(result.toArray()).toEqual([20, 40])
    })

    it('slice then reduce', () => {
      const arr = new ResizableArray<number>(4)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.push(5)
      const sum = arr.slice(1, 4).reduce((acc, x) => acc + x, 0)
      expect(sum).toBe(9)
    })

    it('concat then forEach', () => {
      const arr1 = new ResizableArray<number>(4)
      arr1.push(1)
      const arr2 = new ResizableArray<number>(4)
      arr2.push(2)
      const collected: number[] = []
      arr1.concat(arr2).forEach(x => collected.push(x))
      expect(collected).toEqual([1, 2])
    })
  })

  describe('object and reference types', () => {
    it('stores object references', () => {
      const arr = new ResizableArray<{ id: number }>(4)
      const obj = { id: 1 }
      arr.push(obj)
      expect(arr.get(0)).toBe(obj)
    })

    it('stores arrays as elements', () => {
      const arr = new ResizableArray<number[]>(4)
      arr.push([1, 2])
      arr.push([3, 4])
      expect(arr.get(0)).toEqual([1, 2])
    })

    it('cloned objects are same references', () => {
      const arr = new ResizableArray<{ x: number }>(4)
      const obj = { x: 1 }
      arr.push(obj)
      const cloned = arr.clone()
      expect(cloned.get(0)).toBe(obj)
    })
  })
})
