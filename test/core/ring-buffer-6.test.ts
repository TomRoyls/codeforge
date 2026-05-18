import { describe, it, expect } from 'vitest'
import { RingBuffer6 } from '../../src/core/ring-buffer-6/index.js'

describe('RingBuffer6', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates buffer with default capacity of 16', () => {
      const buf = new RingBuffer6<number>()
      expect(buf.capacity).toBe(16)
      expect(buf.size).toBe(0)
      expect(buf.isEmpty()).toBe(true)
      expect(buf.isFull()).toBe(false)
    })

    it('creates buffer with specified initial capacity', () => {
      const buf = new RingBuffer6<number>(32)
      expect(buf.capacity).toBe(32)
    })

    it('creates buffer with capacity 1', () => {
      const buf = new RingBuffer6<number>(1)
      expect(buf.capacity).toBe(1)
    })
  })

  // ─── Properties ───
  describe('properties', () => {
    it('size tracks element count', () => {
      const buf = new RingBuffer6<number>(4)
      expect(buf.size).toBe(0)
      buf.push(1)
      expect(buf.size).toBe(1)
      buf.push(2)
      expect(buf.size).toBe(2)
    })

    it('capacity reflects buffer length', () => {
      const buf = new RingBuffer6<number>(8)
      expect(buf.capacity).toBe(8)
    })

    it('isEmpty returns true when no items', () => {
      const buf = new RingBuffer6<number>(5)
      expect(buf.isEmpty()).toBe(true)
    })

    it('isEmpty returns false with items', () => {
      const buf = new RingBuffer6<number>(5)
      buf.push(1)
      expect(buf.isEmpty()).toBe(false)
    })

    it('isFull returns true when capacity is reached', () => {
      const buf = new RingBuffer6<number>(2)
      buf.push(1)
      buf.push(2)
      expect(buf.isFull()).toBe(true)
    })

    it('isFull returns false when not full', () => {
      const buf = new RingBuffer6<number>(5)
      buf.push(1)
      expect(buf.isFull()).toBe(false)
    })
  })

  // ─── push() ───
  describe('push', () => {
    it('pushes items to buffer', () => {
      const buf = new RingBuffer6<number>(8)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.size).toBe(3)
      expect(buf.toArray()).toEqual([1, 2, 3])
    })

    it('auto-resizes when full', () => {
      const buf = new RingBuffer6<number>(2)
      buf.push(1)
      buf.push(2)
      expect(buf.isFull()).toBe(true)
      buf.push(3)
      expect(buf.size).toBe(3)
      expect(buf.toArray()).toEqual([1, 2, 3])
      expect(buf.capacity).toBe(4)
    })

    it('auto-resizes multiple times', () => {
      const buf = new RingBuffer6<number>(2)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.push(4)
      buf.push(5)
      expect(buf.size).toBe(5)
      expect(buf.toArray()).toEqual([1, 2, 3, 4, 5])
    })
  })

  // ─── pop() ───
  describe('pop', () => {
    it('pops items in LIFO order', () => {
      const buf = new RingBuffer6<number>(8)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.pop()).toBe(3)
      expect(buf.pop()).toBe(2)
      expect(buf.pop()).toBe(1)
    })

    it('returns undefined when buffer is empty', () => {
      const buf = new RingBuffer6<number>(4)
      expect(buf.pop()).toBeUndefined()
    })

    it('maintains correct state after pops', () => {
      const buf = new RingBuffer6<number>(8)
      buf.push(10)
      buf.push(20)
      buf.pop()
      expect(buf.size).toBe(1)
      expect(buf.get(0)).toBe(10)
    })

    it('allows pushing after popping', () => {
      const buf = new RingBuffer6<number>(4)
      buf.push(1)
      buf.push(2)
      buf.pop()
      buf.push(3)
      expect(buf.toArray()).toEqual([1, 3])
    })
  })

  // ─── shift() ───
  describe('shift', () => {
    it('removes and returns the oldest element (FIFO)', () => {
      const buf = new RingBuffer6<number>(8)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.shift()).toBe(1)
      expect(buf.shift()).toBe(2)
    })

    it('returns undefined when buffer is empty', () => {
      const buf = new RingBuffer6<number>(4)
      expect(buf.shift()).toBeUndefined()
    })

    it('maintains correct state after shifts', () => {
      const buf = new RingBuffer6<number>(8)
      buf.push(10)
      buf.push(20)
      buf.shift()
      expect(buf.size).toBe(1)
      expect(buf.get(0)).toBe(20)
    })

    it('allows pushing after shifting from full buffer', () => {
      const buf = new RingBuffer6<number>(2)
      buf.push(1)
      buf.push(2)
      buf.shift()
      buf.push(3)
      expect(buf.toArray()).toEqual([2, 3])
    })
  })

  // ─── unshift() ───
  describe('unshift', () => {
    it('prepends items to buffer', () => {
      const buf = new RingBuffer6<number>(8)
      buf.push(2)
      buf.push(3)
      buf.unshift(1)
      expect(buf.toArray()).toEqual([1, 2, 3])
      expect(buf.size).toBe(3)
    })

    it('auto-resizes when full', () => {
      const buf = new RingBuffer6<number>(2)
      buf.push(1)
      buf.push(2)
      expect(buf.isFull()).toBe(true)
      buf.unshift(0)
      expect(buf.size).toBe(3)
      expect(buf.toArray()).toEqual([0, 1, 2])
    })

    it('unshift on empty buffer', () => {
      const buf = new RingBuffer6<number>(4)
      buf.unshift(42)
      expect(buf.size).toBe(1)
      expect(buf.get(0)).toBe(42)
    })
  })

  // ─── get() ───
  describe('get', () => {
    it('returns element at given index', () => {
      const buf = new RingBuffer6<number>(8)
      buf.push(10)
      buf.push(20)
      buf.push(30)
      expect(buf.get(0)).toBe(10)
      expect(buf.get(1)).toBe(20)
      expect(buf.get(2)).toBe(30)
    })

    it('returns undefined for negative index', () => {
      const buf = new RingBuffer6<number>(4)
      buf.push(1)
      expect(buf.get(-1)).toBeUndefined()
    })

    it('returns undefined for index >= size', () => {
      const buf = new RingBuffer6<number>(4)
      buf.push(1)
      expect(buf.get(1)).toBeUndefined()
    })

    it('works correctly after wrap-around', () => {
      const buf = new RingBuffer6<number>(2)
      buf.push(1)
      buf.push(2)
      buf.shift()
      buf.push(3)
      expect(buf.get(0)).toBe(2)
      expect(buf.get(1)).toBe(3)
    })
  })

  // ─── set() ───
  describe('set', () => {
    it('updates element at given index', () => {
      const buf = new RingBuffer6<number>(8)
      buf.push(10)
      buf.push(20)
      buf.push(30)
      buf.set(1, 99)
      expect(buf.get(1)).toBe(99)
      expect(buf.toArray()).toEqual([10, 99, 30])
    })

    it('does nothing for negative index', () => {
      const buf = new RingBuffer6<number>(4)
      buf.push(1)
      buf.set(-1, 99)
      expect(buf.get(0)).toBe(1)
    })

    it('does nothing for index >= size', () => {
      const buf = new RingBuffer6<number>(4)
      buf.push(1)
      buf.set(1, 99)
      expect(buf.size).toBe(1)
    })

    it('updates first element', () => {
      const buf = new RingBuffer6<number>(8)
      buf.push(1)
      buf.push(2)
      buf.set(0, 100)
      expect(buf.get(0)).toBe(100)
    })

    it('updates last element', () => {
      const buf = new RingBuffer6<number>(8)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.set(2, 200)
      expect(buf.get(2)).toBe(200)
    })
  })

  // ─── clear() ───
  describe('clear', () => {
    it('removes all elements', () => {
      const buf = new RingBuffer6<number>(8)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.clear()
      expect(buf.size).toBe(0)
      expect(buf.isEmpty()).toBe(true)
    })

    it('is safe to call on empty buffer', () => {
      const buf = new RingBuffer6<number>(4)
      buf.clear()
      expect(buf.size).toBe(0)
    })

    it('allows pushing after clear', () => {
      const buf = new RingBuffer6<number>(4)
      buf.push(1)
      buf.push(2)
      buf.clear()
      buf.push(3)
      expect(buf.size).toBe(1)
      expect(buf.get(0)).toBe(3)
    })
  })

  // ─── toArray() ───
  describe('toArray', () => {
    it('returns elements in FIFO order', () => {
      const buf = new RingBuffer6<number>(8)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.toArray()).toEqual([1, 2, 3])
    })

    it('returns empty array for empty buffer', () => {
      const buf = new RingBuffer6<number>(4)
      expect(buf.toArray()).toEqual([])
    })

    it('handles wrap-around correctly', () => {
      const buf = new RingBuffer6<number>(2)
      buf.push(1)
      buf.push(2)
      buf.shift()
      buf.push(3)
      expect(buf.toArray()).toEqual([2, 3])
    })
  })

  // ─── forEach() ───
  describe('forEach', () => {
    it('iterates over all elements with indices', () => {
      const buf = new RingBuffer6<number>(8)
      buf.push(10)
      buf.push(20)
      buf.push(30)
      const results: number[] = []
      buf.forEach((v, i) => { results.push(v + i) })
      expect(results).toEqual([10, 21, 32])
    })

    it('does not call callback for empty buffer', () => {
      const buf = new RingBuffer6<number>(4)
      let count = 0
      buf.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('iterates single element', () => {
      const buf = new RingBuffer6<number>(4)
      buf.push(42)
      const results: number[] = []
      buf.forEach((v) => { results.push(v) })
      expect(results).toEqual([42])
    })
  })

  // ─── Edge Cases ───
  describe('edge cases', () => {
    it('works with string elements', () => {
      const buf = new RingBuffer6<string>(4)
      buf.push('a')
      buf.push('b')
      buf.push('c')
      expect(buf.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('works with null elements', () => {
      const buf = new RingBuffer6<null>(2)
      buf.push(null)
      buf.push(null)
      expect(buf.size).toBe(2)
      expect(buf.pop()).toBeNull()
    })

    it('handles mixed push, pop, shift, unshift operations', () => {
      const buf = new RingBuffer6<number>(4)
      buf.push(1)
      buf.push(2)
      buf.unshift(0)
      buf.pop()
      expect(buf.toArray()).toEqual([0, 1])
    })

    it('handles duplicate values', () => {
      const buf = new RingBuffer6<number>(8)
      buf.push(1)
      buf.push(1)
      buf.push(2)
      buf.push(1)
      expect(buf.toArray()).toEqual([1, 1, 2, 1])
    })

    it('handles negative numbers', () => {
      const buf = new RingBuffer6<number>(4)
      buf.push(-1)
      buf.push(-2)
      buf.push(-3)
      expect(buf.toArray()).toEqual([-1, -2, -3])
    })

    it('resizes from capacity 1', () => {
      const buf = new RingBuffer6<number>(1)
      buf.push(1)
      buf.push(2)
      expect(buf.size).toBe(2)
      expect(buf.toArray()).toEqual([1, 2])
    })

    it('handles extensive push/shift cycle without degrading', () => {
      const buf = new RingBuffer6<number>(4)
      for (let i = 0; i < 100; i++) {
        buf.push(i)
      }
      expect(buf.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(buf.shift()).toBe(i)
      }
      expect(buf.isEmpty()).toBe(true)
    })
  })
})
