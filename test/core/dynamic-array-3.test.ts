import { describe, it, expect, beforeEach } from 'vitest'
import { DynamicArray3 } from '../../src/core/dynamic-array-3/index.js'

describe('DynamicArray3', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates array with default capacity 8', () => {
      const arr = new DynamicArray3<number>()
      expect(arr.length).toBe(0)
      expect(arr.capacity).toBe(8)
    })

    it('creates array with custom initial capacity', () => {
      const arr = new DynamicArray3<number>(16)
      expect(arr.capacity).toBe(16)
      expect(arr.length).toBe(0)
    })
  })

  // ─── push / pop ───
  describe('push and pop', () => {
    let arr: DynamicArray3<number>

    beforeEach(() => {
      arr = new DynamicArray3<number>(4)
    })

    it('pushes values and tracks length', () => {
      arr.push(10)
      arr.push(20)
      expect(arr.length).toBe(2)
      expect(arr.get(0)).toBe(10)
      expect(arr.get(1)).toBe(20)
    })

    it('pops values in LIFO order', () => {
      arr.push(10)
      arr.push(20)
      expect(arr.pop()).toBe(20)
      expect(arr.pop()).toBe(10)
      expect(arr.length).toBe(0)
    })

    it('pop returns undefined on empty array', () => {
      expect(arr.pop()).toBeUndefined()
    })

    it('doubles capacity when full', () => {
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      expect(arr.capacity).toBe(4)
      arr.push(5)
      expect(arr.capacity).toBe(8)
      expect(arr.length).toBe(5)
    })
  })

  // ─── get / set ───
  describe('get and set', () => {
    let arr: DynamicArray3<string>

    beforeEach(() => {
      arr = new DynamicArray3<string>()
      arr.push('a')
      arr.push('b')
      arr.push('c')
    })

    it('gets element at valid index', () => {
      expect(arr.get(0)).toBe('a')
      expect(arr.get(2)).toBe('c')
    })

    it('returns undefined for out-of-bounds index', () => {
      expect(arr.get(3)).toBeUndefined()
      expect(arr.get(-1)).toBeUndefined()
    })

    it('sets element at valid index', () => {
      expect(arr.set(1, 'x')).toBe(true)
      expect(arr.get(1)).toBe('x')
    })

    it('set returns false for out-of-bounds index', () => {
      expect(arr.set(5, 'y')).toBe(false)
      expect(arr.set(-1, 'y')).toBe(false)
    })
  })

  // ─── insert ───
  describe('insert', () => {
    let arr: DynamicArray3<number>

    beforeEach(() => {
      arr = new DynamicArray3<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
    })

    it('inserts at beginning', () => {
      arr.insert(0, 99)
      expect(arr.toArray()).toEqual([99, 1, 2, 3])
    })

    it('inserts at end', () => {
      arr.insert(3, 99)
      expect(arr.toArray()).toEqual([1, 2, 3, 99])
    })

    it('inserts in middle', () => {
      arr.insert(1, 99)
      expect(arr.toArray()).toEqual([1, 99, 2, 3])
    })

    it('ignores invalid negative index', () => {
      arr.insert(-1, 99)
      expect(arr.length).toBe(3)
    })

    it('ignores index beyond length', () => {
      arr.insert(10, 99)
      expect(arr.length).toBe(3)
    })
  })

  // ─── removeAt ───
  describe('removeAt', () => {
    let arr: DynamicArray3<string>

    beforeEach(() => {
      arr = new DynamicArray3<string>()
      arr.push('a')
      arr.push('b')
      arr.push('c')
    })

    it('removes from beginning', () => {
      expect(arr.removeAt(0)).toBe('a')
      expect(arr.toArray()).toEqual(['b', 'c'])
    })

    it('removes from end', () => {
      expect(arr.removeAt(2)).toBe('c')
      expect(arr.toArray()).toEqual(['a', 'b'])
    })

    it('removes from middle', () => {
      expect(arr.removeAt(1)).toBe('b')
      expect(arr.toArray()).toEqual(['a', 'c'])
    })

    it('returns undefined for out-of-bounds', () => {
      expect(arr.removeAt(5)).toBeUndefined()
      expect(arr.removeAt(-1)).toBeUndefined()
    })
  })

  // ─── isEmpty / clear ───
  describe('isEmpty and clear', () => {
    it('isEmpty returns true for new array', () => {
      const arr = new DynamicArray3<number>()
      expect(arr.isEmpty()).toBe(true)
    })

    it('isEmpty returns false after push', () => {
      const arr = new DynamicArray3<number>()
      arr.push(1)
      expect(arr.isEmpty()).toBe(false)
    })

    it('clear empties the array', () => {
      const arr = new DynamicArray3<number>()
      arr.push(1)
      arr.push(2)
      arr.clear()
      expect(arr.length).toBe(0)
      expect(arr.isEmpty()).toBe(true)
    })
  })

  // ─── indexOf / contains ───
  describe('indexOf and contains', () => {
    let arr: DynamicArray3<string>

    beforeEach(() => {
      arr = new DynamicArray3<string>()
      arr.push('x')
      arr.push('y')
      arr.push('z')
    })

    it('indexOf finds existing element', () => {
      expect(arr.indexOf('y')).toBe(1)
    })

    it('indexOf returns -1 for missing element', () => {
      expect(arr.indexOf('w')).toBe(-1)
    })

    it('contains returns true for existing element', () => {
      expect(arr.contains('x')).toBe(true)
    })

    it('contains returns false for missing element', () => {
      expect(arr.contains('w')).toBe(false)
    })
  })

  // ─── forEach / map / filter ───
  describe('forEach, map, filter', () => {
    let arr: DynamicArray3<number>

    beforeEach(() => {
      arr = new DynamicArray3<number>()
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
    })

    it('forEach iterates all elements with indices', () => {
      const collected: number[] = []
      arr.forEach((v, i) => collected.push(v + i))
      expect(collected).toEqual([1, 3, 5, 7])
    })

    it('map transforms elements', () => {
      const result = arr.map((v) => v * 10)
      expect(result.toArray()).toEqual([10, 20, 30, 40])
    })

    it('map preserves original array', () => {
      arr.map((v) => v * 2)
      expect(arr.toArray()).toEqual([1, 2, 3, 4])
    })

    it('filter returns matching elements', () => {
      const result = arr.filter((v) => v % 2 === 0)
      expect(result.toArray()).toEqual([2, 4])
    })

    it('filter returns empty when nothing matches', () => {
      const result = arr.filter((v) => v > 100)
      expect(result.length).toBe(0)
    })
  })

  // ─── resize ───
  describe('resize', () => {
    it('increases capacity', () => {
      const arr = new DynamicArray3<number>(4)
      arr.push(1)
      arr.resize(16)
      expect(arr.capacity).toBe(16)
      expect(arr.get(0)).toBe(1)
    })

    it('does not shrink below length', () => {
      const arr = new DynamicArray3<number>()
      arr.push(1)
      arr.push(2)
      arr.resize(1)
      expect(arr.capacity).toBe(2)
    })
  })

  // ─── toArray ───
  describe('toArray', () => {
    it('returns plain array of elements', () => {
      const arr = new DynamicArray3<number>()
      arr.push(10)
      arr.push(20)
      expect(arr.toArray()).toEqual([10, 20])
    })

    it('returns empty array for empty DynamicArray', () => {
      const arr = new DynamicArray3<number>()
      expect(arr.toArray()).toEqual([])
    })
  })
})
