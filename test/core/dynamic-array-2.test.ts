import { describe, it, expect } from 'vitest'
import { DynamicArray } from '../../src/core/dynamic-array-2/index.js'

describe('DynamicArray', () => {
  describe('constructor', () => {
    it('creates empty array with default capacity', () => {
      const arr = new DynamicArray<number>()
      expect(arr.size).toBe(0)
      expect(arr.capacity).toBe(8)
      expect(arr.isEmpty()).toBe(true)
    })

    it('creates array with custom initial capacity', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 16 })
      expect(arr.capacity).toBe(16)
      expect(arr.size).toBe(0)
    })

    it('creates array with zero initial capacity', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 0 })
      expect(arr.capacity).toBe(0)
      expect(arr.size).toBe(0)
    })

    it('creates array with negative initial capacity clamped to 0', () => {
      const arr = new DynamicArray<number>({ initialCapacity: -5 })
      expect(arr.capacity).toBe(0)
    })

    it('creates array with custom growth factor', () => {
      const arr = new DynamicArray<number>({ growthFactor: 1.5 })
      expect(arr.growthFactor).toBe(1.5)
    })

    it('creates array with geometric strategy by default', () => {
      const arr = new DynamicArray<number>()
      expect(arr.capacity).toBe(8)
    })

    it('creates array with fixed growth strategy', () => {
      const arr = new DynamicArray<number>({ growthStrategy: 'fixed', growthFactor: 5 })
      expect(arr.size).toBe(0)
    })

    it('creates array with linear growth strategy', () => {
      const arr = new DynamicArray<number>({ growthStrategy: 'linear', growthFactor: 10 })
      expect(arr.size).toBe(0)
    })

    it('creates array with fibonacci growth strategy', () => {
      const arr = new DynamicArray<number>({ growthStrategy: 'fibonacci' })
      expect(arr.size).toBe(0)
    })

    it('creates array with custom equals comparator', () => {
      const arr = new DynamicArray<{ id: number }>({
        equals: (a, b) => a.id === b.id,
      })
      arr.push({ id: 1 })
      arr.push({ id: 2 })
      expect(arr.includes({ id: 1 })).toBe(true)
      expect(arr.includes({ id: 3 })).toBe(false)
    })
  })

  describe('push', () => {
    it('pushes single element', () => {
      const arr = new DynamicArray<number>()
      arr.push(42)
      expect(arr.size).toBe(1)
      expect(arr.get(0)).toBe(42)
    })

    it('pushes multiple elements', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.size).toBe(3)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('grows when capacity is exceeded', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 2, growthStrategy: 'geometric', growthFactor: 2 })
      arr.push(1)
      arr.push(2)
      expect(arr.isFull()).toBe(true)
      arr.push(3)
      expect(arr.capacity).toBe(4)
      expect(arr.get(2)).toBe(3)
    })

    it('grows from zero capacity', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 0, growthStrategy: 'geometric', growthFactor: 2 })
      arr.push(1)
      expect(arr.size).toBe(1)
      expect(arr.get(0)).toBe(1)
    })

    it('pushes many elements with geometric growth', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 2, growthFactor: 2 })
      for (let i = 0; i < 100; i++) {
        arr.push(i)
      }
      expect(arr.size).toBe(100)
      expect(arr.get(99)).toBe(99)
    })

    it('pushes strings', () => {
      const arr = new DynamicArray<string>()
      arr.push('hello')
      arr.push('world')
      expect(arr.toArray()).toEqual(['hello', 'world'])
    })

    it('pushes null and undefined values', () => {
      const arr = new DynamicArray<number | null | undefined>()
      arr.push(null)
      arr.push(undefined)
      arr.push(42)
      expect(arr.size).toBe(3)
    })

    it('pushes objects', () => {
      const arr = new DynamicArray<{ x: number }>()
      arr.push({ x: 1 })
      arr.push({ x: 2 })
      expect(arr.size).toBe(2)
    })
  })

  describe('pop', () => {
    it('returns undefined on empty array', () => {
      const arr = new DynamicArray<number>()
      expect(arr.pop()).toBeUndefined()
    })

    it('pops last element', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.pop()).toBe(3)
      expect(arr.size).toBe(2)
    })

    it('pops all elements', () => {
      const arr = new DynamicArray<number>()
      arr.push(10)
      expect(arr.pop()).toBe(10)
      expect(arr.size).toBe(0)
      expect(arr.pop()).toBeUndefined()
    })

    it('pops in LIFO order', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.pop()).toBe(3)
      expect(arr.pop()).toBe(2)
      expect(arr.pop()).toBe(1)
      expect(arr.pop()).toBeUndefined()
    })
  })

  describe('shift', () => {
    it('returns undefined on empty array', () => {
      const arr = new DynamicArray<number>()
      expect(arr.shift()).toBeUndefined()
    })

    it('shifts first element', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.shift()).toBe(1)
      expect(arr.size).toBe(2)
      expect(arr.toArray()).toEqual([2, 3])
    })

    it('shifts all elements', () => {
      const arr = new DynamicArray<number>()
      arr.push(42)
      expect(arr.shift()).toBe(42)
      expect(arr.size).toBe(0)
      expect(arr.shift()).toBeUndefined()
    })

    it('shifts and pushes alternately', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.shift()
      arr.push(3)
      expect(arr.toArray()).toEqual([2, 3])
    })
  })

  describe('unshift', () => {
    it('unshifts element to empty array', () => {
      const arr = new DynamicArray<number>()
      arr.unshift(5)
      expect(arr.size).toBe(1)
      expect(arr.get(0)).toBe(5)
    })

    it('unshifts multiple elements', () => {
      const arr = new DynamicArray<number>()
      arr.unshift(3)
      arr.unshift(2)
      arr.unshift(1)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('unshifts triggers growth when full', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 2, growthFactor: 2 })
      arr.push(2)
      arr.push(3)
      arr.unshift(1)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('get', () => {
    it('returns undefined for out of bounds', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      expect(arr.get(-1)).toBeUndefined()
      expect(arr.get(1)).toBeUndefined()
    })

    it('returns element at index', () => {
      const arr = new DynamicArray<number>()
      arr.push(10)
      arr.push(20)
      arr.push(30)
      expect(arr.get(0)).toBe(10)
      expect(arr.get(1)).toBe(20)
      expect(arr.get(2)).toBe(30)
    })

    it('returns undefined for negative index', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      expect(arr.get(-1)).toBeUndefined()
    })
  })

  describe('set', () => {
    it('sets value at valid index', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.set(1, 99)
      expect(arr.get(1)).toBe(99)
    })

    it('does nothing for out of bounds index', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.set(5, 99)
      expect(arr.size).toBe(1)
      expect(arr.get(0)).toBe(1)
    })

    it('does nothing for negative index', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.set(-1, 99)
      expect(arr.get(0)).toBe(1)
    })
  })

  describe('insert', () => {
    it('inserts at beginning', () => {
      const arr = new DynamicArray<number>()
      arr.push(2)
      arr.push(3)
      arr.insert(0, 1)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('inserts at end', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.insert(2, 3)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('inserts in middle', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(3)
      arr.insert(1, 2)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('does nothing for negative index', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.insert(-1, 99)
      expect(arr.size).toBe(1)
    })

    it('does nothing for index beyond size', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.insert(5, 99)
      expect(arr.size).toBe(1)
    })

    it('inserts at index equal to size (append)', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.insert(1, 2)
      expect(arr.toArray()).toEqual([1, 2])
    })
  })

  describe('removeAt', () => {
    it('returns undefined for invalid index', () => {
      const arr = new DynamicArray<number>()
      expect(arr.removeAt(0)).toBeUndefined()
      expect(arr.removeAt(-1)).toBeUndefined()
    })

    it('removes from beginning', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.removeAt(0)).toBe(1)
      expect(arr.toArray()).toEqual([2, 3])
    })

    it('removes from end', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.removeAt(2)).toBe(3)
      expect(arr.toArray()).toEqual([1, 2])
    })

    it('removes from middle', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.removeAt(1)).toBe(2)
      expect(arr.toArray()).toEqual([1, 3])
    })
  })

  describe('size and capacity', () => {
    it('tracks size correctly', () => {
      const arr = new DynamicArray<number>()
      expect(arr.size).toBe(0)
      arr.push(1)
      expect(arr.size).toBe(1)
      arr.push(2)
      expect(arr.size).toBe(2)
      arr.pop()
      expect(arr.size).toBe(1)
    })

    it('tracks capacity correctly', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 4 })
      expect(arr.capacity).toBe(4)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new array', () => {
      const arr = new DynamicArray<number>()
      expect(arr.isEmpty()).toBe(true)
    })

    it('returns false after push', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      expect(arr.isEmpty()).toBe(false)
    })

    it('returns true after clearing all elements', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.pop()
      expect(arr.isEmpty()).toBe(true)
    })
  })

  describe('isFull', () => {
    it('returns false when not full', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 4 })
      arr.push(1)
      expect(arr.isFull()).toBe(false)
    })

    it('returns true when full', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 2 })
      arr.push(1)
      arr.push(2)
      expect(arr.isFull()).toBe(true)
    })

    it('returns false after growth', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.isFull()).toBe(false)
    })
  })

  describe('clear', () => {
    it('clears all elements', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.clear()
      expect(arr.size).toBe(0)
      expect(arr.isEmpty()).toBe(true)
    })

    it('clear does not reset capacity', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.push(5)
      const capBefore = arr.capacity
      arr.clear()
      expect(arr.capacity).toBe(capBefore)
    })

    it('clear on empty array does nothing', () => {
      const arr = new DynamicArray<number>()
      arr.clear()
      expect(arr.size).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns empty array', () => {
      const arr = new DynamicArray<number>()
      expect(arr.toArray()).toEqual([])
    })

    it('returns copy of elements', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      const result = arr.toArray()
      expect(result).toEqual([1, 2])
      result[0] = 99
      expect(arr.get(0)).toBe(1)
    })
  })

  describe('fromArray', () => {
    it('loads from array', () => {
      const arr = new DynamicArray<number>()
      arr.fromArray([10, 20, 30])
      expect(arr.toArray()).toEqual([10, 20, 30])
    })

    it('replaces existing elements', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.fromArray([5, 6])
      expect(arr.toArray()).toEqual([5, 6])
    })

    it('handles empty array', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.fromArray([])
      expect(arr.size).toBe(0)
    })
  })

  describe('forEach', () => {
    it('iterates over all elements', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      const collected: number[] = []
      arr.forEach((v) => collected.push(v))
      expect(collected).toEqual([1, 2, 3])
    })

    it('provides correct indices', () => {
      const arr = new DynamicArray<string>()
      arr.push('a')
      arr.push('b')
      const indices: number[] = []
      arr.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1])
    })

    it('does nothing on empty array', () => {
      const arr = new DynamicArray<number>()
      let called = false
      arr.forEach(() => { called = true })
      expect(called).toBe(false)
    })
  })

  describe('map', () => {
    it('maps elements', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      const mapped = arr.map((v) => v * 2)
      expect(mapped.toArray()).toEqual([2, 4, 6])
    })

    it('returns new DynamicArray', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      const mapped = arr.map((v) => String(v))
      expect(mapped.toArray()).toEqual(['1'])
    })

    it('handles empty array', () => {
      const arr = new DynamicArray<number>()
      const mapped = arr.map((v) => v * 2)
      expect(mapped.size).toBe(0)
    })
  })

  describe('filter', () => {
    it('filters elements', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      const filtered = arr.filter((v) => v % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4])
    })

    it('returns empty when nothing matches', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(3)
      const filtered = arr.filter((v) => v % 2 === 0)
      expect(filtered.size).toBe(0)
    })

    it('returns all when everything matches', () => {
      const arr = new DynamicArray<number>()
      arr.push(2)
      arr.push(4)
      const filtered = arr.filter((v) => v % 2 === 0)
      expect(filtered.size).toBe(2)
    })
  })

  describe('reduce', () => {
    it('sums elements', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      const sum = arr.reduce((acc, v) => acc + v, 0)
      expect(sum).toBe(6)
    })

    it('returns initial value for empty array', () => {
      const arr = new DynamicArray<number>()
      expect(arr.reduce((acc, v) => acc + v, 42)).toBe(42)
    })

    it('builds a string', () => {
      const arr = new DynamicArray<string>()
      arr.push('a')
      arr.push('b')
      arr.push('c')
      const result = arr.reduce((acc, v) => acc + v, '')
      expect(result).toBe('abc')
    })
  })

  describe('find', () => {
    it('finds matching element', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.find((v) => v > 1)).toBe(2)
    })

    it('returns undefined when not found', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      expect(arr.find((v) => v > 10)).toBeUndefined()
    })

    it('returns undefined on empty array', () => {
      const arr = new DynamicArray<number>()
      expect(arr.find((v) => v > 0)).toBeUndefined()
    })
  })

  describe('findIndex', () => {
    it('finds index of matching element', () => {
      const arr = new DynamicArray<number>()
      arr.push(10)
      arr.push(20)
      arr.push(30)
      expect(arr.findIndex((v) => v === 20)).toBe(1)
    })

    it('returns -1 when not found', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      expect(arr.findIndex((v) => v === 99)).toBe(-1)
    })

    it('returns -1 on empty array', () => {
      const arr = new DynamicArray<number>()
      expect(arr.findIndex((v) => v === 1)).toBe(-1)
    })
  })

  describe('indexOf', () => {
    it('finds index of element', () => {
      const arr = new DynamicArray<number>()
      arr.push(10)
      arr.push(20)
      arr.push(30)
      expect(arr.indexOf(20)).toBe(1)
    })

    it('returns -1 when not found', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      expect(arr.indexOf(99)).toBe(-1)
    })

    it('finds first occurrence', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(1)
      expect(arr.indexOf(1)).toBe(0)
    })
  })

  describe('includes', () => {
    it('returns true when present', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.includes(2)).toBe(true)
    })

    it('returns false when absent', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      expect(arr.includes(99)).toBe(false)
    })

    it('returns false on empty array', () => {
      const arr = new DynamicArray<number>()
      expect(arr.includes(1)).toBe(false)
    })
  })

  describe('slice', () => {
    it('slices entire array', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.slice().toArray()).toEqual([1, 2, 3])
    })

    it('slices from start index', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.slice(1).toArray()).toEqual([2, 3])
    })

    it('slices with start and end', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      expect(arr.slice(1, 3).toArray()).toEqual([2, 3])
    })

    it('handles negative indices', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.slice(-2).toArray()).toEqual([2, 3])
    })

    it('handles negative end index', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      expect(arr.slice(1, -1).toArray()).toEqual([2, 3])
    })

    it('returns empty for invalid range', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      expect(arr.slice(5, 10).toArray()).toEqual([])
    })
  })

  describe('concat', () => {
    it('concatenates two arrays', () => {
      const a = new DynamicArray<number>()
      a.push(1)
      a.push(2)
      const b = new DynamicArray<number>()
      b.push(3)
      b.push(4)
      const result = a.concat(b)
      expect(result.toArray()).toEqual([1, 2, 3, 4])
    })

    it('concatenates with empty array', () => {
      const a = new DynamicArray<number>()
      a.push(1)
      const b = new DynamicArray<number>()
      expect(a.concat(b).toArray()).toEqual([1])
    })

    it('does not modify originals', () => {
      const a = new DynamicArray<number>()
      a.push(1)
      const b = new DynamicArray<number>()
      b.push(2)
      a.concat(b)
      expect(a.toArray()).toEqual([1])
      expect(b.toArray()).toEqual([2])
    })
  })

  describe('splice', () => {
    it('removes elements', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      const removed = arr.splice(1, 1)
      expect(removed.toArray()).toEqual([2])
      expect(arr.toArray()).toEqual([1, 3])
    })

    it('removes and inserts elements', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.splice(1, 1, 20, 30)
      expect(arr.toArray()).toEqual([1, 20, 30, 3])
    })

    it('inserts without removing', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(3)
      arr.splice(1, 0, 2)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('handles negative start index', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.splice(-1, 1)
      expect(arr.toArray()).toEqual([1, 2])
    })

    it('handles start beyond size', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.splice(10, 0, 2)
      expect(arr.toArray()).toEqual([1, 2])
    })

    it('clamps deleteCount', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      const removed = arr.splice(1, 100)
      expect(removed.toArray()).toEqual([2])
      expect(arr.toArray()).toEqual([1])
    })

    it('defaults deleteCount to remaining elements', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      const removed = arr.splice(1)
      expect(removed.toArray()).toEqual([2, 3])
      expect(arr.toArray()).toEqual([1])
    })
  })

  describe('join', () => {
    it('joins with comma by default', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.join()).toBe('1,2,3')
    })

    it('joins with custom separator', () => {
      const arr = new DynamicArray<string>()
      arr.push('a')
      arr.push('b')
      arr.push('c')
      expect(arr.join('-')).toBe('a-b-c')
    })

    it('returns empty string for empty array', () => {
      const arr = new DynamicArray<number>()
      expect(arr.join()).toBe('')
    })

    it('joins single element', () => {
      const arr = new DynamicArray<number>()
      arr.push(42)
      expect(arr.join('-')).toBe('42')
    })
  })

  describe('toString', () => {
    it('returns comma-separated string', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      expect(arr.toString()).toBe('1,2')
    })

    it('returns empty string for empty array', () => {
      const arr = new DynamicArray<number>()
      expect(arr.toString()).toBe('')
    })
  })

  describe('reverse', () => {
    it('reverses elements', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.reverse()
      expect(arr.toArray()).toEqual([3, 2, 1])
    })

    it('reverses in place', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.reverse()
      expect(arr.get(0)).toBe(2)
    })

    it('handles empty array', () => {
      const arr = new DynamicArray<number>()
      arr.reverse()
      expect(arr.size).toBe(0)
    })

    it('handles single element', () => {
      const arr = new DynamicArray<number>()
      arr.push(42)
      arr.reverse()
      expect(arr.get(0)).toBe(42)
    })

    it('handles two elements', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.reverse()
      expect(arr.toArray()).toEqual([2, 1])
    })
  })

  describe('sort', () => {
    it('sorts numbers', () => {
      const arr = new DynamicArray<number>()
      arr.push(3)
      arr.push(1)
      arr.push(2)
      arr.sort((a, b) => a - b)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('sorts with default comparator', () => {
      const arr = new DynamicArray<number>()
      arr.push(3)
      arr.push(1)
      arr.push(2)
      arr.sort()
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('sorts in reverse', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.sort((a, b) => b - a)
      expect(arr.toArray()).toEqual([3, 2, 1])
    })

    it('handles empty array', () => {
      const arr = new DynamicArray<number>()
      arr.sort()
      expect(arr.size).toBe(0)
    })

    it('handles single element', () => {
      const arr = new DynamicArray<number>()
      arr.push(42)
      arr.sort()
      expect(arr.get(0)).toBe(42)
    })
  })

  describe('clone', () => {
    it('clones array', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      const cloned = arr.clone()
      expect(cloned.toArray()).toEqual([1, 2])
      expect(cloned.size).toBe(2)
    })

    it('clone is independent', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      const cloned = arr.clone()
      cloned.push(3)
      expect(arr.size).toBe(2)
      expect(cloned.size).toBe(3)
    })

    it('preserves growth settings', () => {
      const arr = new DynamicArray<number>({ growthFactor: 1.5, growthStrategy: 'linear' })
      arr.push(1)
      const cloned = arr.clone()
      expect(cloned.growthFactor).toBe(1.5)
    })
  })

  describe('equals', () => {
    it('returns true for equal arrays', () => {
      const a = new DynamicArray<number>()
      a.push(1)
      a.push(2)
      const b = new DynamicArray<number>()
      b.push(1)
      b.push(2)
      expect(a.equals(b)).toBe(true)
    })

    it('returns false for different sizes', () => {
      const a = new DynamicArray<number>()
      a.push(1)
      const b = new DynamicArray<number>()
      b.push(1)
      b.push(2)
      expect(a.equals(b)).toBe(false)
    })

    it('returns false for different elements', () => {
      const a = new DynamicArray<number>()
      a.push(1)
      a.push(2)
      const b = new DynamicArray<number>()
      b.push(1)
      b.push(3)
      expect(a.equals(b)).toBe(false)
    })

    it('returns true for empty arrays', () => {
      const a = new DynamicArray<number>()
      const b = new DynamicArray<number>()
      expect(a.equals(b)).toBe(true)
    })

    it('uses custom equals comparator', () => {
      const a = new DynamicArray<{ id: number }>({
        equals: (x, y) => x.id === y.id,
      })
      a.push({ id: 1 })
      const b = new DynamicArray<{ id: number }>({
        equals: (x, y) => x.id === y.id,
      })
      b.push({ id: 1 })
      expect(a.equals(b)).toBe(true)
    })
  })

  describe('contains', () => {
    it('returns true when value present', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.contains(2)).toBe(true)
    })

    it('returns false when value absent', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      expect(arr.contains(99)).toBe(false)
    })
  })

  describe('first and last', () => {
    it('first returns undefined on empty', () => {
      const arr = new DynamicArray<number>()
      expect(arr.first).toBeUndefined()
    })

    it('last returns undefined on empty', () => {
      const arr = new DynamicArray<number>()
      expect(arr.last).toBeUndefined()
    })

    it('first returns first element', () => {
      const arr = new DynamicArray<number>()
      arr.push(10)
      arr.push(20)
      expect(arr.first).toBe(10)
    })

    it('last returns last element', () => {
      const arr = new DynamicArray<number>()
      arr.push(10)
      arr.push(20)
      expect(arr.last).toBe(20)
    })

    it('first and last same for single element', () => {
      const arr = new DynamicArray<number>()
      arr.push(42)
      expect(arr.first).toBe(42)
      expect(arr.last).toBe(42)
    })
  })

  describe('resize', () => {
    it('increases capacity', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 4 })
      arr.push(1)
      arr.resize(16)
      expect(arr.capacity).toBe(16)
      expect(arr.get(0)).toBe(1)
    })

    it('decreases capacity truncating elements', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.resize(1)
      expect(arr.size).toBe(1)
      expect(arr.capacity).toBe(1)
      expect(arr.get(0)).toBe(1)
    })

    it('handles negative capacity', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.resize(-1)
      expect(arr.size).toBe(1)
    })

    it('handles resize to same capacity', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 4 })
      arr.push(1)
      arr.resize(4)
      expect(arr.size).toBe(1)
      expect(arr.capacity).toBe(4)
    })
  })

  describe('trimToSize', () => {
    it('trims to exact size', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 16 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.trimToSize()
      expect(arr.capacity).toBe(3)
      expect(arr.size).toBe(3)
    })

    it('does nothing on empty array', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 8 })
      arr.trimToSize()
      expect(arr.capacity).toBe(0)
    })
  })

  describe('ensureCapacity', () => {
    it('does nothing if already sufficient', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 16 })
      arr.ensureCapacity(8)
      expect(arr.capacity).toBe(16)
    })

    it('increases capacity if needed', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 4 })
      arr.ensureCapacity(32)
      expect(arr.capacity).toBe(32)
    })
  })

  describe('compact', () => {
    it('compacts unused capacity', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 100 })
      arr.push(1)
      arr.push(2)
      arr.compact()
      expect(arr.capacity).toBe(2)
    })
  })

  describe('growthFactor', () => {
    it('returns configured growth factor', () => {
      const arr = new DynamicArray<number>({ growthFactor: 3 })
      expect(arr.growthFactor).toBe(3)
    })

    it('returns default growth factor', () => {
      const arr = new DynamicArray<number>()
      expect(arr.growthFactor).toBe(2)
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates over elements', () => {
      const arr = new DynamicArray<number>()
      arr.push(10)
      arr.push(20)
      arr.push(30)
      const collected: number[] = []
      for (const v of arr) {
        collected.push(v)
      }
      expect(collected).toEqual([10, 20, 30])
    })

    it('handles empty array', () => {
      const arr = new DynamicArray<number>()
      const collected: number[] = []
      for (const v of arr) {
        collected.push(v)
      }
      expect(collected).toEqual([])
    })

    it('works with spread operator', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      expect([...arr]).toEqual([1, 2])
    })
  })

  describe('static from', () => {
    it('creates from array', () => {
      const arr = DynamicArray.from([1, 2, 3])
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('creates from iterable', () => {
      const set = new Set([10, 20, 30])
      const arr = DynamicArray.from(set)
      expect(arr.size).toBe(3)
    })

    it('creates with options', () => {
      const arr = DynamicArray.from([1, 2], { initialCapacity: 32, growthFactor: 1.5 })
      expect(arr.toArray()).toEqual([1, 2])
      expect(arr.growthFactor).toBe(1.5)
    })

    it('creates from generator', () => {
      function* gen() {
        yield 1
        yield 2
        yield 3
      }
      const arr = DynamicArray.from(gen())
      expect(arr.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('static of', () => {
    it('creates from arguments', () => {
      const arr = DynamicArray.of(1, 2, 3)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('creates empty with no arguments', () => {
      const arr = DynamicArray.of<number>()
      expect(arr.size).toBe(0)
    })

    it('creates with strings', () => {
      const arr = DynamicArray.of('a', 'b', 'c')
      expect(arr.toArray()).toEqual(['a', 'b', 'c'])
    })
  })

  describe('growth strategies', () => {
    it('geometric growth doubles capacity', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 4, growthStrategy: 'geometric', growthFactor: 2 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.push(5)
      expect(arr.capacity).toBe(8)
    })

    it('fixed growth adds constant', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 2, growthStrategy: 'fixed', growthFactor: 3 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.capacity).toBe(5)
    })

    it('linear growth adds constant', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 2, growthStrategy: 'linear', growthFactor: 4 })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.capacity).toBe(6)
    })

    it('fibonacci growth increases progressively', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 2, growthStrategy: 'fibonacci' })
      arr.push(1)
      arr.push(2)
      arr.push(3)
      expect(arr.capacity).toBeGreaterThan(2)
    })

    it('geometric growth with factor 1.5', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 4, growthStrategy: 'geometric', growthFactor: 1.5 })
      for (let i = 0; i < 10; i++) arr.push(i)
      expect(arr.size).toBe(10)
      expect(arr.get(9)).toBe(9)
    })

    it('multiple growth cycles', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 1, growthStrategy: 'geometric', growthFactor: 2 })
      for (let i = 0; i < 100; i++) arr.push(i)
      expect(arr.size).toBe(100)
    })
  })

  describe('stress tests', () => {
    it('handles 1000 pushes and pops', () => {
      const arr = new DynamicArray<number>()
      for (let i = 0; i < 1000; i++) {
        arr.push(i)
      }
      expect(arr.size).toBe(1000)
      for (let i = 999; i >= 0; i--) {
        expect(arr.pop()).toBe(i)
      }
      expect(arr.size).toBe(0)
    })

    it('handles mixed operations', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.shift()
      arr.unshift(0)
      arr.insert(2, 10)
      arr.removeAt(1)
      expect(arr.toArray()).toEqual([0, 10, 3])
    })

    it('handles alternating push/shift', () => {
      const arr = new DynamicArray<number>()
      for (let i = 0; i < 100; i++) {
        arr.push(i)
        arr.shift()
      }
      expect(arr.size).toBe(0)
    })
  })

  describe('type safety', () => {
    it('works with generic objects', () => {
      const arr = new DynamicArray<{ name: string; age: number }>()
      arr.push({ name: 'Alice', age: 30 })
      arr.push({ name: 'Bob', age: 25 })
      const found = arr.find((p) => p.age > 26)
      expect(found?.name).toBe('Alice')
    })

    it('works with nullable types', () => {
      const arr = new DynamicArray<number | null>()
      arr.push(null)
      arr.push(42)
      arr.push(null)
      const nonNull = arr.filter((v) => v !== null)
      expect(nonNull.size).toBe(1)
      expect(nonNull.get(0)).toBe(42)
    })
  })

  describe('edge cases', () => {
    it('splice at index 0 with no delete', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.splice(0, 0, 0)
      expect(arr.toArray()).toEqual([0, 1, 2])
    })

    it('splice removes everything', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      const removed = arr.splice(0)
      expect(removed.toArray()).toEqual([1, 2, 3])
      expect(arr.size).toBe(0)
    })

    it('map transforms types', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      const strs = arr.map((v) => `item-${v}`)
      expect(strs.toArray()).toEqual(['item-1', 'item-2', 'item-3'])
    })

    it('reduce with object accumulator', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      const grouped = arr.reduce(
        (acc, v) => {
          if (v % 2 === 0) acc.even.push(v)
          else acc.odd.push(v)
          return acc
        },
        { even: [] as number[], odd: [] as number[] },
      )
      expect(grouped.even).toEqual([2])
      expect(grouped.odd).toEqual([1, 3])
    })

    it('multiple slices produce independent arrays', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.push(5)
      const s1 = arr.slice(0, 2)
      const s2 = arr.slice(3)
      s1.push(99)
      expect(arr.get(2)).toBe(3)
      expect(s2.get(0)).toBe(4)
    })

    it('reverse does not affect size', () => {
      const arr = new DynamicArray<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.reverse()
      expect(arr.size).toBe(3)
    })

    it('equals with different capacities but same elements', () => {
      const a = new DynamicArray<number>({ initialCapacity: 4 })
      a.push(1)
      a.push(2)
      const b = new DynamicArray<number>({ initialCapacity: 100 })
      b.push(1)
      b.push(2)
      expect(a.equals(b)).toBe(true)
    })

    it('clone preserves all elements after many operations', () => {
      const arr = new DynamicArray<number>()
      for (let i = 0; i < 50; i++) arr.push(i)
      for (let i = 0; i < 25; i++) arr.pop()
      arr.unshift(-1)
      const cloned = arr.clone()
      expect(cloned.toArray()).toEqual(arr.toArray())
    })
  })
})
