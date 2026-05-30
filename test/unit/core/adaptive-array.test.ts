import { describe, expect, it } from 'vitest'
import { AdaptiveArray } from '../../../src/core/adaptive-array/adaptive-array.js'

describe('AdaptiveArray', () => {
  describe('Constructor', () => {
    it('creates array with default options', () => {
      const arr = new AdaptiveArray<number>()
      expect(arr.size()).toBe(0)
      expect(arr.capacity()).toBe(16)
      expect(arr.isEmpty()).toBe(true)
    })

    it('creates array with custom initial capacity', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 32 })
      expect(arr.capacity()).toBe(32)
    })

    it('creates array with initial capacity of 1', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 1 })
      expect(arr.capacity()).toBe(1)
    })

    it('creates array with exponential strategy', () => {
      const arr = new AdaptiveArray<number>({ strategy: 'exponential', initialCapacity: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.capacity()).toBe(4)
      expect(arr.getStrategy()).toBe('exponential')
    })

    it('creates array with linear strategy', () => {
      const arr = new AdaptiveArray<number>({ strategy: 'linear', growthFactor: 4, initialCapacity: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.push(5)
      expect(arr.capacity()).toBe(8)
      expect(arr.getStrategy()).toBe('linear')
    })

    it('creates array with fibonacci strategy', () => {
      const arr = new AdaptiveArray<number>({ strategy: 'fibonacci', initialCapacity: 1 })
      expect(arr.getStrategy()).toBe('fibonacci')
      arr.push(1)
      arr.push(2)
      expect(arr.size()).toBe(2)
    })

    it('creates array with fixed strategy', () => {
      const arr = new AdaptiveArray<number>({ strategy: 'fixed', growthFactor: 5, initialCapacity: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.capacity()).toBe(7)
      expect(arr.getStrategy()).toBe('fixed')
    })

    it('merges partial options with defaults', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
      expect(arr.capacity()).toBe(8)
      expect(arr.getStrategy()).toBe('exponential')
    })
  })

  describe('push', () => {
    it('pushes values to array', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(10)
      arr.push(20)
      arr.push(30)
      expect(arr.size()).toBe(3)
      expect(arr.toArray()).toEqual([10, 20, 30])
    })

    it('triggers growth when exceeding capacity', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 2, strategy: 'exponential', growthFactor: 2 })
      arr.push(1)
      arr.push(2)
      expect(arr.capacity()).toBe(2)
      arr.push(3)
      expect(arr.capacity()).toBe(4)
      expect(arr.size()).toBe(3)
    })

    it('pushes multiple values sequentially', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 1 })
      for (let i = 0; i < 100; i++) {
        arr.push(i)
      }
      expect(arr.size()).toBe(100)
      expect(arr.get(0)).toBe(0)
      expect(arr.get(99)).toBe(99)
    })
  })

  describe('pop', () => {
    it('pops value from array', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(10)
      arr.push(20)
      expect(arr.pop()).toBe(20)
      expect(arr.size()).toBe(1)
    })

    it('returns undefined when popping empty array', () => {
      const arr = new AdaptiveArray<number>()
      expect(arr.pop()).toBeUndefined()
    })

    it('pops all values in LIFO order', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.pop()).toBe(3)
      expect(arr.pop()).toBe(2)
      expect(arr.pop()).toBe(1)
      expect(arr.pop()).toBeUndefined()
    })

    it('triggers shrink when popping below threshold', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4, strategy: 'exponential', growthFactor: 2, shrinkThreshold: 0.25 })
      for (let i = 0; i < 4; i++) arr.push(i)
      expect(arr.capacity()).toBe(4)
      arr.push(4)
      expect(arr.capacity()).toBe(8)
      arr.pop()
      arr.pop()
      arr.pop()
      arr.pop()
      arr.pop()
      expect(arr.size()).toBe(0)
      expect(arr.capacity()).toBeLessThan(8)
    })
  })

  describe('get', () => {
    it('gets value at valid index', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(10)
      arr.push(20)
      arr.push(30)
      expect(arr.get(0)).toBe(10)
      expect(arr.get(1)).toBe(20)
      expect(arr.get(2)).toBe(30)
    })

    it('returns undefined for negative index', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(10)
      expect(arr.get(-1)).toBeUndefined()
    })

    it('returns undefined for out of bounds index', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(10)
      expect(arr.get(5)).toBeUndefined()
    })

    it('returns undefined on empty array', () => {
      const arr = new AdaptiveArray<number>()
      expect(arr.get(0)).toBeUndefined()
    })
  })

  describe('set', () => {
    it('sets value at valid index', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(10)
      arr.push(20)
      expect(arr.set(1, 99)).toBe(true)
      expect(arr.get(1)).toBe(99)
    })

    it('returns false for negative index', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(10)
      expect(arr.set(-1, 99)).toBe(false)
    })

    it('returns false for out of bounds index', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(10)
      expect(arr.set(5, 99)).toBe(false)
    })

    it('returns false on empty array', () => {
      const arr = new AdaptiveArray<number>()
      expect(arr.set(0, 1)).toBe(false)
    })
  })

  describe('insert', () => {
    it('inserts value at beginning', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(10)
      arr.push(20)
      expect(arr.insert(0, 5)).toBe(true)
      expect(arr.toArray()).toEqual([5, 10, 20])
    })

    it('inserts value at end', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(10)
      arr.push(20)
      expect(arr.insert(2, 30)).toBe(true)
      expect(arr.toArray()).toEqual([10, 20, 30])
    })

    it('inserts value in middle', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(10)
      arr.push(30)
      expect(arr.insert(1, 20)).toBe(true)
      expect(arr.toArray()).toEqual([10, 20, 30])
    })

    it('returns false for negative index', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(10)
      expect(arr.insert(-1, 5)).toBe(false)
    })

    it('returns false for index beyond size', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(10)
      expect(arr.insert(3, 5)).toBe(false)
    })

    it('allows insert at size index', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(10)
      expect(arr.insert(1, 20)).toBe(true)
      expect(arr.toArray()).toEqual([10, 20])
    })

    it('triggers growth when needed', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 2, strategy: 'exponential', growthFactor: 2 })
      arr.push(1)
      arr.push(2)
      expect(arr.insert(1, 99)).toBe(true)
      expect(arr.capacity()).toBe(4)
      expect(arr.toArray()).toEqual([1, 99, 2])
    })
  })

  describe('delete', () => {
    it('deletes value at beginning', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(10)
      arr.push(20)
      arr.push(30)
      expect(arr.delete(0)).toBe(10)
      expect(arr.toArray()).toEqual([20, 30])
    })

    it('deletes value at end', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(10)
      arr.push(20)
      arr.push(30)
      expect(arr.delete(2)).toBe(30)
      expect(arr.toArray()).toEqual([10, 20])
    })

    it('deletes value in middle', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(10)
      arr.push(20)
      arr.push(30)
      expect(arr.delete(1)).toBe(20)
      expect(arr.toArray()).toEqual([10, 30])
    })

    it('returns undefined for negative index', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(10)
      expect(arr.delete(-1)).toBeUndefined()
    })

    it('returns undefined for out of bounds index', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(10)
      expect(arr.delete(5)).toBeUndefined()
    })

    it('returns undefined on empty array', () => {
      const arr = new AdaptiveArray<number>()
      expect(arr.delete(0)).toBeUndefined()
    })
  })

  describe('size, capacity, isEmpty, clear', () => {
    it('size returns correct count', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      expect(arr.size()).toBe(0)
      arr.push(1)
      expect(arr.size()).toBe(1)
      arr.push(2)
      expect(arr.size()).toBe(2)
    })

    it('capacity returns allocated size', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
      expect(arr.capacity()).toBe(8)
    })

    it('isEmpty returns true when empty', () => {
      const arr = new AdaptiveArray<number>()
      expect(arr.isEmpty()).toBe(true)
    })

    it('isEmpty returns false when not empty', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(1)
      expect(arr.isEmpty()).toBe(false)
    })

    it('clear removes all elements', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.clear()
      expect(arr.size()).toBe(0)
      expect(arr.isEmpty()).toBe(true)
      expect(arr.capacity()).toBe(4)
    })

    it('clear on empty array is no-op', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.clear()
      expect(arr.size()).toBe(0)
      expect(arr.capacity()).toBe(4)
    })
  })

  describe('toArray, forEach, Symbol.iterator', () => {
    it('toArray returns elements as native array', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('toArray on empty array returns empty', () => {
      const arr = new AdaptiveArray<number>()
      expect(arr.toArray()).toEqual([])
    })

    it('forEach iterates all elements with indices', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(10)
      arr.push(20)
      arr.push(30)
      const result: Array<{ value: number; index: number }> = []
      arr.forEach((value, index) => result.push({ value, index }))
      expect(result).toEqual([
        { value: 10, index: 0 },
        { value: 20, index: 1 },
        { value: 30, index: 2 },
      ])
    })

    it('forEach on empty array does nothing', () => {
      const arr = new AdaptiveArray<number>()
      let count = 0
      arr.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('Symbol.iterator allows for-of loop', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      const result: number[] = []
      for (const val of arr) {
        result.push(val)
      }
      expect(result).toEqual([1, 2, 3])
    })

    it('Symbol.iterator on empty array yields nothing', () => {
      const arr = new AdaptiveArray<number>()
      const result: number[] = []
      for (const val of arr) {
        result.push(val)
      }
      expect(result).toEqual([])
    })

    it('spread operator works via Symbol.iterator', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(1)
      arr.push(2)
      expect([...arr]).toEqual([1, 2])
    })
  })

  describe('map, filter, reduce', () => {
    it('map transforms elements', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      const mapped = arr.map((v) => v * 2)
      expect(mapped.toArray()).toEqual([2, 4, 6])
      expect(mapped).toBeInstanceOf(AdaptiveArray)
    })

    it('map with index', () => {
      const arr = new AdaptiveArray<string>({ initialCapacity: 4 })
      arr.push('a')
      arr.push('b')
      const mapped = arr.map((v, i) => `${v}-${i}`)
      expect(mapped.toArray()).toEqual(['a-0', 'b-1'])
    })

    it('map on empty returns empty AdaptiveArray', () => {
      const arr = new AdaptiveArray<number>()
      const mapped = arr.map((v) => v * 2)
      expect(mapped.size()).toBe(0)
    })

    it('filter returns matching elements', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      const filtered = arr.filter((v) => v % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4])
      expect(filtered).toBeInstanceOf(AdaptiveArray)
    })

    it('filter with index', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(10)
      arr.push(20)
      arr.push(30)
      const filtered = arr.filter((_v, i) => i > 0)
      expect(filtered.toArray()).toEqual([20, 30])
    })

    it('filter with no matches returns empty', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(1)
      arr.push(3)
      const filtered = arr.filter((v) => v % 2 === 0)
      expect(filtered.size()).toBe(0)
    })

    it('reduce accumulates values', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.reduce((acc, v) => acc + v, 0)).toBe(6)
    })

    it('reduce with index', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(10)
      arr.push(20)
      expect(arr.reduce((acc, v, i) => acc + v + i, 0)).toBe(31)
    })

    it('reduce on empty returns initial value', () => {
      const arr = new AdaptiveArray<number>()
      expect(arr.reduce((acc, v) => acc + v, 42)).toBe(42)
    })
  })

  describe('find, findIndex, indexOf, includes, lastIndexOf', () => {
    it('find returns first matching element', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.find((v) => v > 1)).toBe(2)
    })

    it('find returns undefined when no match', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(1)
      arr.push(2)
      expect(arr.find((v) => v > 10)).toBeUndefined()
    })

    it('find with index', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(10)
      arr.push(20)
      arr.push(30)
      expect(arr.find((_v, i) => i === 2)).toBe(30)
    })

    it('findIndex returns first matching index', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.findIndex((v) => v > 1)).toBe(1)
    })

    it('findIndex returns -1 when no match', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(1)
      expect(arr.findIndex((v) => v > 100)).toBe(-1)
    })

    it('indexOf finds element', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(10)
      arr.push(20)
      arr.push(30)
      expect(arr.indexOf(20)).toBe(1)
    })

    it('indexOf returns -1 when not found', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(10)
      expect(arr.indexOf(99)).toBe(-1)
    })

    it('includes returns true when found', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(10)
      arr.push(20)
      expect(arr.includes(20)).toBe(true)
    })

    it('includes returns false when not found', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(10)
      expect(arr.includes(99)).toBe(false)
    })

    it('lastIndexOf finds last occurrence', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(10)
      arr.push(20)
      arr.push(10)
      expect(arr.lastIndexOf(10)).toBe(2)
    })

    it('lastIndexOf returns -1 when not found', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(10)
      expect(arr.lastIndexOf(99)).toBe(-1)
    })

    it('lastIndexOf on empty returns -1', () => {
      const arr = new AdaptiveArray<number>()
      expect(arr.lastIndexOf(1)).toBe(-1)
    })

    it('indexOf on empty returns -1', () => {
      const arr = new AdaptiveArray<number>()
      expect(arr.indexOf(1)).toBe(-1)
    })

    it('includes on empty returns false', () => {
      const arr = new AdaptiveArray<number>()
      expect(arr.includes(1)).toBe(false)
    })
  })

  describe('slice', () => {
    it('slices with start and end', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.push(5)
      expect(arr.slice(1, 4).toArray()).toEqual([2, 3, 4])
    })

    it('slices with only start', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.slice(1).toArray()).toEqual([2, 3])
    })

    it('slices with no args returns copy', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(1)
      arr.push(2)
      expect(arr.slice().toArray()).toEqual([1, 2])
    })

    it('handles negative start index', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.push(5)
      expect(arr.slice(-2).toArray()).toEqual([4, 5])
    })

    it('handles negative end index', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      expect(arr.slice(1, -1).toArray()).toEqual([2, 3])
    })

    it('clamps start beyond size', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(1)
      arr.push(2)
      expect(arr.slice(10).toArray()).toEqual([])
    })

    it('returns empty when start >= end', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(1)
      arr.push(2)
      expect(arr.slice(2, 1).toArray()).toEqual([])
    })
  })

  describe('concat', () => {
    it('concats two arrays', () => {
      const a = new AdaptiveArray<number>({ initialCapacity: 4 })
      a.push(1)
      a.push(2)
      const b = new AdaptiveArray<number>({ initialCapacity: 4 })
      b.push(3)
      b.push(4)
      const result = a.concat(b)
      expect(result.toArray()).toEqual([1, 2, 3, 4])
    })

    it('concats multiple arrays', () => {
      const a = new AdaptiveArray<number>({ initialCapacity: 2 })
      a.push(1)
      const b = new AdaptiveArray<number>({ initialCapacity: 2 })
      b.push(2)
      const c = new AdaptiveArray<number>({ initialCapacity: 2 })
      c.push(3)
      expect(a.concat(b, c).toArray()).toEqual([1, 2, 3])
    })

    it('concats with empty array', () => {
      const a = new AdaptiveArray<number>({ initialCapacity: 4 })
      a.push(1)
      a.push(2)
      const b = new AdaptiveArray<number>()
      expect(a.concat(b).toArray()).toEqual([1, 2])
    })

    it('concat on empty array', () => {
      const a = new AdaptiveArray<number>()
      const b = new AdaptiveArray<number>({ initialCapacity: 4 })
      b.push(1)
      expect(a.concat(b).toArray()).toEqual([1])
    })

    it('concat returns new AdaptiveArray', () => {
      const a = new AdaptiveArray<number>({ initialCapacity: 4 })
      a.push(1)
      const b = new AdaptiveArray<number>({ initialCapacity: 4 })
      b.push(2)
      const result = a.concat(b)
      expect(result).toBeInstanceOf(AdaptiveArray)
      expect(result).not.toBe(a)
    })
  })

  describe('splice', () => {
    it('removes elements from middle', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      const removed = arr.splice(1, 2)
      expect(removed.toArray()).toEqual([2, 3])
      expect(arr.toArray()).toEqual([1, 4])
    })

    it('removes elements from beginning', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      const removed = arr.splice(0, 1)
      expect(removed.toArray()).toEqual([1])
      expect(arr.toArray()).toEqual([2, 3])
    })

    it('removes elements from end', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      const removed = arr.splice(2, 1)
      expect(removed.toArray()).toEqual([3])
      expect(arr.toArray()).toEqual([1, 2])
    })

    it('inserts without deleting', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
      arr.push(1)
      arr.push(3)
      arr.splice(1, 0, 2)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('replaces elements', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.splice(1, 1, 20, 30)
      expect(arr.toArray()).toEqual([1, 20, 30, 3])
    })

    it('handles negative start index', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      const removed = arr.splice(-2, 1)
      expect(removed.toArray()).toEqual([2])
      expect(arr.toArray()).toEqual([1, 3])
    })

    it('defaults deleteCount to remaining elements', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      const removed = arr.splice(1)
      expect(removed.toArray()).toEqual([2, 3])
      expect(arr.toArray()).toEqual([1])
    })

    it('clamps deleteCount to available elements', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
      arr.push(1)
      arr.push(2)
      const removed = arr.splice(1, 100)
      expect(removed.toArray()).toEqual([2])
      expect(arr.toArray()).toEqual([1])
    })

    it('clamps start beyond size to size', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
      arr.push(1)
      arr.push(2)
      arr.splice(10, 0, 3)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('inserts multiple elements at position', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
      arr.push(1)
      arr.push(4)
      arr.splice(1, 0, 2, 3)
      expect(arr.toArray()).toEqual([1, 2, 3, 4])
    })
  })

  describe('reverse', () => {
    it('reverses array in place', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      const result = arr.reverse()
      expect(result.toArray()).toEqual([3, 2, 1])
      expect(result).toBe(arr)
    })

    it('reverse single element', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(1)
      arr.reverse()
      expect(arr.toArray()).toEqual([1])
    })

    it('reverse empty array', () => {
      const arr = new AdaptiveArray<number>()
      arr.reverse()
      expect(arr.size()).toBe(0)
    })

    it('reverse two elements', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(1)
      arr.push(2)
      arr.reverse()
      expect(arr.toArray()).toEqual([2, 1])
    })
  })

  describe('sort', () => {
    it('sorts with default comparator', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
      arr.push(3)
      arr.push(1)
      arr.push(2)
      arr.sort()
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('sorts with custom comparator', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.sort((a, b) => b - a)
      expect(arr.toArray()).toEqual([3, 2, 1])
    })

    it('sorts empty array', () => {
      const arr = new AdaptiveArray<number>()
      arr.sort()
      expect(arr.size()).toBe(0)
    })

    it('sorts single element', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(1)
      arr.sort()
      expect(arr.toArray()).toEqual([1])
    })

    it('returns same instance', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(2)
      arr.push(1)
      expect(arr.sort()).toBe(arr)
    })

    it('sorts strings', () => {
      const arr = new AdaptiveArray<string>({ initialCapacity: 8 })
      arr.push('banana')
      arr.push('apple')
      arr.push('cherry')
      arr.sort()
      expect(arr.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  describe('compact', () => {
    it('compacts capacity to match size', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 16 })
      arr.push(1)
      arr.push(2)
      arr.compact()
      expect(arr.capacity()).toBe(2)
      expect(arr.toArray()).toEqual([1, 2])
    })

    it('compact when already compact is no-op', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 2 })
      arr.push(1)
      arr.push(2)
      arr.compact()
      expect(arr.capacity()).toBe(2)
    })
  })

  describe('shrinkToFit', () => {
    it('shrinks to fit current size', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 16 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.shrinkToFit()
      expect(arr.capacity()).toBe(3)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('shrinkToFit on empty sets capacity to 1', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 16 })
      arr.shrinkToFit()
      expect(arr.capacity()).toBe(1)
    })

    it('shrinkToFit when already fit is no-op', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 2 })
      arr.push(1)
      arr.push(2)
      arr.shrinkToFit()
      expect(arr.capacity()).toBe(2)
    })
  })

  describe('reserve', () => {
    it('reserves more capacity', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(1)
      arr.reserve(32)
      expect(arr.capacity()).toBe(32)
      expect(arr.toArray()).toEqual([1])
    })

    it('reserve does not shrink', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 16 })
      arr.reserve(4)
      expect(arr.capacity()).toBe(16)
    })

    it('reserve with same capacity is no-op', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
      arr.reserve(8)
      expect(arr.capacity()).toBe(8)
    })
  })

  describe('resize', () => {
    it('resizes to larger size', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(1)
      arr.resize(5)
      expect(arr.size()).toBe(5)
      expect(arr.capacity()).toBeGreaterThanOrEqual(5)
    })

    it('resizes to smaller size truncating', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.resize(2)
      expect(arr.size()).toBe(2)
      expect(arr.toArray()).toEqual([1, 2])
    })

    it('resize with negative number is no-op', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(1)
      arr.push(2)
      arr.resize(-5)
      expect(arr.size()).toBe(2)
    })

    it('resize to zero empties array', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(1)
      arr.push(2)
      arr.resize(0)
      expect(arr.size()).toBe(0)
      expect(arr.isEmpty()).toBe(true)
    })

    it('resize to same size is no-op', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 })
      arr.push(1)
      arr.push(2)
      arr.resize(2)
      expect(arr.size()).toBe(2)
      expect(arr.toArray()).toEqual([1, 2])
    })
  })

  describe('getStatistics', () => {
    it('returns initial statistics', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 8 })
      const stats = arr.getStatistics()
      expect(stats.resizeCount).toBe(0)
      expect(stats.copyCount).toBe(0)
      expect(stats.totalElementsMoved).toBe(0)
      expect(stats.currentCapacity).toBe(8)
      expect(stats.currentSize).toBe(0)
      expect(stats.strategy).toBe('exponential')
      expect(stats.growthCount).toBe(0)
      expect(stats.shrinkCount).toBe(0)
    })

    it('tracks growth count after push beyond capacity', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 2, strategy: 'exponential', growthFactor: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      const stats = arr.getStatistics()
      expect(stats.growthCount).toBe(1)
      expect(stats.resizeCount).toBe(1)
      expect(stats.copyCount).toBe(1)
      expect(stats.totalElementsMoved).toBe(2)
    })

    it('tracks shrink count after pop below threshold', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4, strategy: 'exponential', growthFactor: 2, shrinkThreshold: 0.25 })
      for (let i = 0; i < 5; i++) arr.push(i)
      arr.pop()
      arr.pop()
      arr.pop()
      arr.pop()
      arr.pop()
      const stats = arr.getStatistics()
      expect(stats.shrinkCount).toBeGreaterThan(0)
    })

    it('tracks statistics accurately through multiple operations', () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 1, strategy: 'exponential', growthFactor: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      const stats = arr.getStatistics()
      expect(stats.currentSize).toBe(4)
      expect(stats.growthCount).toBe(2)
    })

    it('reflects strategy in statistics', () => {
      const arr = new AdaptiveArray<number>({ strategy: 'linear', initialCapacity: 4 })
      const stats = arr.getStatistics()
      expect(stats.strategy).toBe('linear')
    })
  })

  describe('setStrategy, getStrategy', () => {
    it('getStrategy returns current strategy', () => {
      const arr = new AdaptiveArray<number>({ strategy: 'fibonacci', initialCapacity: 4 })
      expect(arr.getStrategy()).toBe('fibonacci')
    })

    it('setStrategy changes strategy', () => {
      const arr = new AdaptiveArray<number>({ strategy: 'exponential', initialCapacity: 4 })
      arr.setStrategy('linear')
      expect(arr.getStrategy()).toBe('linear')
    })

    it('setStrategy resets fibonacci state', () => {
      const arr = new AdaptiveArray<number>({ strategy: 'fibonacci', initialCapacity: 1 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.setStrategy('fibonacci')
      arr.push(4)
      arr.push(5)
      expect(arr.size()).toBe(5)
    })
  })

  describe('Growth strategies produce different capacities', () => {
    it('exponential doubles capacity', () => {
      const arr = new AdaptiveArray<number>({ strategy: 'exponential', growthFactor: 2, initialCapacity: 4 })
      for (let i = 0; i < 5; i++) arr.push(i)
      expect(arr.capacity()).toBe(8)
    })

    it('linear adds fixed amount', () => {
      const arr = new AdaptiveArray<number>({ strategy: 'linear', growthFactor: 3, initialCapacity: 4 })
      for (let i = 0; i < 5; i++) arr.push(i)
      expect(arr.capacity()).toBe(7)
    })

    it('fibonacci grows with fibonacci sequence', () => {
      const arr = new AdaptiveArray<number>({ strategy: 'fibonacci', initialCapacity: 1 })
      arr.push(1)
      expect(arr.capacity()).toBe(1)
      arr.push(2)
      expect(arr.capacity()).toBeGreaterThanOrEqual(2)
    })

    it('fixed adds fixed amount same as linear', () => {
      const arr = new AdaptiveArray<number>({ strategy: 'fixed', growthFactor: 4, initialCapacity: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.capacity()).toBe(6)
    })
  })

  describe('works with string type', () => {
    it('stores and retrieves strings', () => {
      const arr = new AdaptiveArray<string>({ initialCapacity: 4 })
      arr.push('hello')
      arr.push('world')
      expect(arr.get(0)).toBe('hello')
      expect(arr.get(1)).toBe('world')
    })

    it('sorts strings correctly', () => {
      const arr = new AdaptiveArray<string>({ initialCapacity: 4 })
      arr.push('cherry')
      arr.push('apple')
      arr.push('banana')
      arr.sort()
      expect(arr.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  describe('works with object type', () => {
    it('stores and retrieves objects', () => {
      const arr = new AdaptiveArray<{ id: number }>({ initialCapacity: 4 })
      arr.push({ id: 1 })
      arr.push({ id: 2 })
      expect(arr.get(0)?.id).toBe(1)
      expect(arr.get(1)?.id).toBe(2)
    })

    it('find works with objects', () => {
      const arr = new AdaptiveArray<{ id: number }>({ initialCapacity: 4 })
      arr.push({ id: 1 })
      arr.push({ id: 2 })
      arr.push({ id: 3 })
      const found = arr.find((v) => v.id === 2)
      expect(found?.id).toBe(2)
    })
  })
})
