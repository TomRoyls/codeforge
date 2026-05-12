import { describe, it, expect } from 'vitest'
import { CircularBuffer } from '../../src/core/circular-buffer-2/index.js'

describe('CircularBuffer', () => {
  describe('constructor', () => {
    it('creates buffer with specified capacity', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      expect(buf.size).toBe(0)
      expect(buf.capacity).toBe(5)
      expect(buf.isEmpty()).toBe(true)
      expect(buf.isFull()).toBe(false)
    })

    it('creates buffer with capacity 1', () => {
      const buf = new CircularBuffer<number>({ capacity: 1 })
      expect(buf.capacity).toBe(1)
      buf.push(42)
      expect(buf.isFull()).toBe(true)
    })

    it('clamps capacity of 0 to 1', () => {
      const buf = new CircularBuffer<number>({ capacity: 0 })
      expect(buf.capacity).toBe(1)
    })

    it('clamps negative capacity to 1', () => {
      const buf = new CircularBuffer<number>({ capacity: -5 })
      expect(buf.capacity).toBe(1)
    })

    it('defaults overwrite to false', () => {
      const buf = new CircularBuffer<number>({ capacity: 2 })
      buf.push(1)
      buf.push(2)
      expect(() => buf.push(3)).toThrow('CircularBuffer is full')
    })

    it('accepts overwrite option as true', () => {
      const buf = new CircularBuffer<number>({ capacity: 2, overwrite: true })
      buf.push(1)
      buf.push(2)
      expect(() => buf.push(3)).not.toThrow()
    })

    it('floors fractional capacity', () => {
      const buf = new CircularBuffer<number>({ capacity: 3.7 })
      expect(buf.capacity).toBe(3)
    })
  })

  describe('push', () => {
    it('adds element to empty buffer', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      expect(buf.size).toBe(1)
      expect(buf.peek()).toBe(1)
      expect(buf.peekLast()).toBe(1)
    })

    it('adds multiple elements', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.toArray()).toEqual([1, 2, 3])
    })

    it('fills buffer to capacity', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.size).toBe(3)
      expect(buf.isFull()).toBe(true)
    })

    it('throws when full in error mode', () => {
      const buf = new CircularBuffer<number>({ capacity: 2 })
      buf.push(1)
      buf.push(2)
      expect(() => buf.push(3)).toThrow('CircularBuffer is full')
    })

    it('overwrites oldest when full in overwrite mode', () => {
      const buf = new CircularBuffer<number>({ capacity: 3, overwrite: true })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.push(4)
      expect(buf.toArray()).toEqual([2, 3, 4])
      expect(buf.size).toBe(3)
    })

    it('overwrites multiple times', () => {
      const buf = new CircularBuffer<number>({ capacity: 2, overwrite: true })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.push(4)
      buf.push(5)
      expect(buf.toArray()).toEqual([4, 5])
    })

    it('maintains correct order after overwrite', () => {
      const buf = new CircularBuffer<number>({ capacity: 3, overwrite: true })
      buf.push(10)
      buf.push(20)
      buf.push(30)
      buf.push(40)
      expect(buf.peek()).toBe(20)
      expect(buf.peekLast()).toBe(40)
    })

    it('handles push after pop', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.shift()
      buf.push(4)
      expect(buf.toArray()).toEqual([2, 3, 4])
    })
  })

  describe('pop', () => {
    it('returns undefined on empty buffer', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      expect(buf.pop()).toBeUndefined()
    })

    it('removes and returns last element', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.pop()).toBe(3)
      expect(buf.toArray()).toEqual([1, 2])
    })

    it('drains buffer completely', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      buf.push(2)
      expect(buf.pop()).toBe(2)
      expect(buf.pop()).toBe(1)
      expect(buf.pop()).toBeUndefined()
      expect(buf.size).toBe(0)
    })

    it('handles pop after wraparound', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      buf.push(2)
      buf.shift()
      buf.push(3)
      buf.push(4)
      expect(buf.pop()).toBe(4)
      expect(buf.toArray()).toEqual([2, 3])
    })

    it('handles pop on single element', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(42)
      expect(buf.pop()).toBe(42)
      expect(buf.isEmpty()).toBe(true)
    })
  })

  describe('shift', () => {
    it('returns undefined on empty buffer', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      expect(buf.shift()).toBeUndefined()
    })

    it('removes and returns first element', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.shift()).toBe(1)
      expect(buf.toArray()).toEqual([2, 3])
    })

    it('drains buffer completely', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      buf.push(2)
      expect(buf.shift()).toBe(1)
      expect(buf.shift()).toBe(2)
      expect(buf.shift()).toBeUndefined()
      expect(buf.size).toBe(0)
    })

    it('handles shift after wraparound', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      buf.push(2)
      buf.shift()
      buf.push(3)
      buf.push(4)
      expect(buf.shift()).toBe(2)
      expect(buf.toArray()).toEqual([3, 4])
    })

    it('handles shift on single element', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(42)
      expect(buf.shift()).toBe(42)
      expect(buf.isEmpty()).toBe(true)
    })
  })

  describe('unshift', () => {
    it('adds element to front of empty buffer', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.unshift(1)
      expect(buf.size).toBe(1)
      expect(buf.peek()).toBe(1)
    })

    it('adds multiple elements to front', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      buf.unshift(3)
      buf.unshift(2)
      buf.unshift(1)
      expect(buf.toArray()).toEqual([1, 2, 3])
    })

    it('throws when full in error mode', () => {
      const buf = new CircularBuffer<number>({ capacity: 2 })
      buf.push(1)
      buf.push(2)
      expect(() => buf.unshift(0)).toThrow('CircularBuffer is full')
    })

    it('overwrites last element when full in overwrite mode', () => {
      const buf = new CircularBuffer<number>({ capacity: 3, overwrite: true })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.unshift(0)
      expect(buf.toArray()).toEqual([0, 1, 2])
      expect(buf.size).toBe(3)
    })

    it('overwrites multiple times', () => {
      const buf = new CircularBuffer<number>({ capacity: 2, overwrite: true })
      buf.push(1)
      buf.push(2)
      buf.unshift(3)
      buf.unshift(4)
      expect(buf.toArray()).toEqual([4, 3])
    })

    it('interleaves push and unshift', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      buf.push(2)
      buf.unshift(1)
      buf.push(4)
      buf.unshift(0)
      expect(buf.toArray()).toEqual([0, 1, 2, 4])
    })

    it('handles unshift after shift', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.shift()
      buf.unshift(0)
      expect(buf.toArray()).toEqual([0, 2, 3])
    })

    it('handles unshift on single capacity buffer', () => {
      const buf = new CircularBuffer<number>({ capacity: 1, overwrite: true })
      buf.push(1)
      buf.unshift(2)
      expect(buf.toArray()).toEqual([2])
    })
  })

  describe('overwrite mode', () => {
    it('push overwrites oldest when full', () => {
      const buf = new CircularBuffer<number>({ capacity: 3, overwrite: true })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.push(4)
      expect(buf.toArray()).toEqual([2, 3, 4])
    })

    it('unshift overwrites newest when full', () => {
      const buf = new CircularBuffer<number>({ capacity: 3, overwrite: true })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.unshift(0)
      expect(buf.toArray()).toEqual([0, 1, 2])
    })

    it('alternating push and shift in overwrite mode', () => {
      const buf = new CircularBuffer<number>({ capacity: 3, overwrite: true })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.shift()).toBe(1)
      buf.push(4)
      expect(buf.toArray()).toEqual([2, 3, 4])
    })

    it('continuous overwrite cycling', () => {
      const buf = new CircularBuffer<number>({ capacity: 3, overwrite: true })
      for (let i = 0; i < 10; i++) {
        buf.push(i)
      }
      expect(buf.toArray()).toEqual([7, 8, 9])
      expect(buf.size).toBe(3)
    })

    it('overwrite preserves correct size', () => {
      const buf = new CircularBuffer<number>({ capacity: 2, overwrite: true })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.size).toBe(2)
      expect(buf.capacity).toBe(2)
    })
  })

  describe('error-on-full mode', () => {
    it('push throws when full', () => {
      const buf = new CircularBuffer<number>({ capacity: 2 })
      buf.push(1)
      buf.push(2)
      expect(() => buf.push(3)).toThrow('CircularBuffer is full')
    })

    it('unshift throws when full', () => {
      const buf = new CircularBuffer<number>({ capacity: 2 })
      buf.push(1)
      buf.push(2)
      expect(() => buf.unshift(0)).toThrow('CircularBuffer is full')
    })

    it('buffer state unchanged after throw on push', () => {
      const buf = new CircularBuffer<number>({ capacity: 2 })
      buf.push(1)
      buf.push(2)
      try { buf.push(3) } catch { /* empty */ }
      expect(buf.toArray()).toEqual([1, 2])
      expect(buf.size).toBe(2)
    })

    it('buffer state unchanged after throw on unshift', () => {
      const buf = new CircularBuffer<number>({ capacity: 2 })
      buf.push(1)
      buf.push(2)
      try { buf.unshift(0) } catch { /* empty */ }
      expect(buf.toArray()).toEqual([1, 2])
    })
  })

  describe('get', () => {
    it('returns undefined for out of bounds index', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      expect(buf.get(-1)).toBeUndefined()
      expect(buf.get(1)).toBeUndefined()
    })

    it('returns element at valid index', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      buf.push(10)
      buf.push(20)
      buf.push(30)
      expect(buf.get(0)).toBe(10)
      expect(buf.get(1)).toBe(20)
      expect(buf.get(2)).toBe(30)
    })

    it('returns correct values after wraparound', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.shift()
      buf.push(4)
      expect(buf.get(0)).toBe(2)
      expect(buf.get(1)).toBe(3)
      expect(buf.get(2)).toBe(4)
    })

    it('returns undefined on empty buffer', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      expect(buf.get(0)).toBeUndefined()
    })

    it('returns correct values after overwrite', () => {
      const buf = new CircularBuffer<number>({ capacity: 3, overwrite: true })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.push(4)
      expect(buf.get(0)).toBe(2)
      expect(buf.get(1)).toBe(3)
      expect(buf.get(2)).toBe(4)
    })
  })

  describe('set', () => {
    it('returns undefined for out of bounds index', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      expect(buf.set(0, 99)).toBeUndefined()
    })

    it('replaces value and returns old value', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.set(1, 99)).toBe(2)
      expect(buf.get(1)).toBe(99)
      expect(buf.toArray()).toEqual([1, 99, 3])
    })

    it('sets value at first index', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      buf.push(2)
      expect(buf.set(0, 10)).toBe(1)
      expect(buf.toArray()).toEqual([10, 2])
    })

    it('sets value at last index', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      buf.push(2)
      expect(buf.set(1, 20)).toBe(2)
      expect(buf.toArray()).toEqual([1, 20])
    })

    it('sets value after wraparound', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.shift()
      buf.push(4)
      expect(buf.set(1, 99)).toBe(3)
      expect(buf.toArray()).toEqual([2, 99, 4])
    })
  })

  describe('size, capacity, isEmpty, isFull', () => {
    it('tracks size correctly', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      expect(buf.size).toBe(0)
      buf.push(1)
      expect(buf.size).toBe(1)
      buf.push(2)
      expect(buf.size).toBe(2)
      buf.pop()
      expect(buf.size).toBe(1)
    })

    it('capacity remains constant', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      expect(buf.capacity).toBe(5)
      buf.pop()
      expect(buf.capacity).toBe(5)
    })

    it('isEmpty returns true only when size is 0', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      expect(buf.isEmpty()).toBe(true)
      buf.push(1)
      expect(buf.isEmpty()).toBe(false)
      buf.pop()
      expect(buf.isEmpty()).toBe(true)
    })

    it('isFull returns true when size equals capacity', () => {
      const buf = new CircularBuffer<number>({ capacity: 2 })
      expect(buf.isFull()).toBe(false)
      buf.push(1)
      expect(buf.isFull()).toBe(false)
      buf.push(2)
      expect(buf.isFull()).toBe(true)
      buf.pop()
      expect(buf.isFull()).toBe(false)
    })

    it('isFull returns true in overwrite mode', () => {
      const buf = new CircularBuffer<number>({ capacity: 2, overwrite: true })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.isFull()).toBe(true)
    })

    it('size stays at capacity in overwrite mode', () => {
      const buf = new CircularBuffer<number>({ capacity: 3, overwrite: true })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.push(4)
      expect(buf.size).toBe(3)
    })
  })

  describe('clear', () => {
    it('clears empty buffer', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.clear()
      expect(buf.size).toBe(0)
      expect(buf.isEmpty()).toBe(true)
    })

    it('clears populated buffer', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.clear()
      expect(buf.size).toBe(0)
      expect(buf.isEmpty()).toBe(true)
      expect(buf.toArray()).toEqual([])
    })

    it('allows reuse after clear', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      buf.clear()
      buf.push(2)
      expect(buf.toArray()).toEqual([2])
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty buffer', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      expect(buf.toArray()).toEqual([])
    })

    it('returns all elements in order', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.toArray()).toEqual([1, 2, 3])
    })

    it('returns correct order after wraparound', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.shift()
      buf.push(4)
      expect(buf.toArray()).toEqual([2, 3, 4])
    })

    it('returns correct order after overwrite', () => {
      const buf = new CircularBuffer<number>({ capacity: 3, overwrite: true })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.push(4)
      buf.push(5)
      expect(buf.toArray()).toEqual([3, 4, 5])
    })
  })

  describe('fromArray', () => {
    it('populates from an array', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      buf.fromArray([1, 2, 3])
      expect(buf.toArray()).toEqual([1, 2, 3])
    })

    it('replaces existing contents', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      buf.push(99)
      buf.fromArray([1, 2])
      expect(buf.toArray()).toEqual([1, 2])
    })

    it('handles empty array', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.fromArray([])
      expect(buf.size).toBe(0)
    })

    it('overwrites when array exceeds capacity in overwrite mode', () => {
      const buf = new CircularBuffer<number>({ capacity: 3, overwrite: true })
      buf.fromArray([1, 2, 3, 4, 5])
      expect(buf.toArray()).toEqual([3, 4, 5])
    })

    it('throws when array exceeds capacity in error mode', () => {
      const buf = new CircularBuffer<number>({ capacity: 2 })
      expect(() => buf.fromArray([1, 2, 3])).toThrow('CircularBuffer is full')
    })
  })

  describe('forEach', () => {
    it('does nothing on empty buffer', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      const result: number[] = []
      buf.forEach((v) => result.push(v))
      expect(result).toEqual([])
    })

    it('iterates all elements with index', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      buf.push(10)
      buf.push(20)
      buf.push(30)
      const result: Array<{ v: number; i: number }> = []
      buf.forEach((v, i) => result.push({ v, i }))
      expect(result).toEqual([{ v: 10, i: 0 }, { v: 20, i: 1 }, { v: 30, i: 2 }])
    })

    it('iterates after wraparound', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.shift()
      buf.push(4)
      const result: number[] = []
      buf.forEach((v) => result.push(v))
      expect(result).toEqual([2, 3, 4])
    })
  })

  describe('map', () => {
    it('maps to new buffer with transformed values', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      const mapped = buf.map((v) => v * 10)
      expect(mapped.toArray()).toEqual([10, 20, 30])
    })

    it('returns empty buffer from empty input', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      const mapped = buf.map((v) => v)
      expect(mapped.size).toBe(0)
    })

    it('maps to different type', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      buf.push(2)
      const mapped = buf.map((v) => v.toString())
      expect(mapped.toArray()).toEqual(['1', '2'])
    })

    it('preserves capacity in mapped buffer', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      const mapped = buf.map((v) => v)
      expect(mapped.capacity).toBe(5)
    })
  })

  describe('filter', () => {
    it('filters elements based on predicate', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.push(4)
      const filtered = buf.filter((v) => v % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4])
    })

    it('returns empty when no elements match', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(3)
      const filtered = buf.filter((v) => v % 2 === 0)
      expect(filtered.size).toBe(0)
    })

    it('returns all elements when all match', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      buf.push(2)
      buf.push(4)
      const filtered = buf.filter((v) => v % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4])
    })

    it('preserves capacity in filtered buffer', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      const filtered = buf.filter(() => true)
      expect(filtered.capacity).toBe(5)
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates over all elements', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      const result: number[] = []
      for (const v of buf) {
        result.push(v)
      }
      expect(result).toEqual([1, 2, 3])
    })

    it('works with spread operator', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect([...buf]).toEqual([1, 2, 3])
    })

    it('iterates empty buffer', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      const result: number[] = []
      for (const v of buf) {
        result.push(v)
      }
      expect(result).toEqual([])
    })
  })

  describe('peek and peekLast', () => {
    it('peek returns undefined on empty buffer', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      expect(buf.peek()).toBeUndefined()
    })

    it('peekLast returns undefined on empty buffer', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      expect(buf.peekLast()).toBeUndefined()
    })

    it('peek returns first element without removing', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      buf.push(2)
      expect(buf.peek()).toBe(1)
      expect(buf.size).toBe(2)
    })

    it('peekLast returns last element without removing', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      buf.push(2)
      expect(buf.peekLast()).toBe(2)
      expect(buf.size).toBe(2)
    })

    it('peek and peekLast match after wraparound', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.shift()
      buf.push(4)
      expect(buf.peek()).toBe(2)
      expect(buf.peekLast()).toBe(4)
    })

    it('peek and peekLast same on single element', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(42)
      expect(buf.peek()).toBe(42)
      expect(buf.peekLast()).toBe(42)
    })

    it('peek after unshift', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      buf.push(2)
      buf.unshift(1)
      expect(buf.peek()).toBe(1)
      expect(buf.peekLast()).toBe(2)
    })
  })

  describe('write', () => {
    it('writes multiple values', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      expect(buf.write([1, 2, 3])).toBe(3)
      expect(buf.toArray()).toEqual([1, 2, 3])
    })

    it('writes to empty buffer', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      buf.write([10, 20])
      expect(buf.toArray()).toEqual([10, 20])
    })

    it('overwrites in overwrite mode', () => {
      const buf = new CircularBuffer<number>({ capacity: 3, overwrite: true })
      buf.write([1, 2, 3, 4, 5])
      expect(buf.toArray()).toEqual([3, 4, 5])
    })

    it('stops at capacity in error mode', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      expect(buf.write([2, 3, 4])).toBe(2)
      expect(buf.toArray()).toEqual([1, 2, 3])
    })

    it('handles empty array', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      expect(buf.write([])).toBe(0)
      expect(buf.size).toBe(0)
    })

    it('returns count of items written', () => {
      const buf = new CircularBuffer<number>({ capacity: 2 })
      expect(buf.write([1, 2, 3])).toBe(2)
    })
  })

  describe('read', () => {
    it('reads requested number of items', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.read(2)).toEqual([1, 2])
      expect(buf.toArray()).toEqual([3])
    })

    it('reads all items if count exceeds size', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      expect(buf.read(10)).toEqual([1, 2])
      expect(buf.isEmpty()).toBe(true)
    })

    it('reads from empty buffer', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      expect(buf.read(5)).toEqual([])
    })

    it('reads zero items', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      expect(buf.read(0)).toEqual([])
      expect(buf.size).toBe(1)
    })

    it('reads after wraparound', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.shift()
      buf.push(4)
      expect(buf.read(2)).toEqual([2, 3])
      expect(buf.toArray()).toEqual([4])
    })
  })

  describe('available and remaining', () => {
    it('available equals size', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      expect(buf.available).toBe(0)
      buf.push(1)
      buf.push(2)
      expect(buf.available).toBe(2)
    })

    it('remaining equals capacity minus size', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      expect(buf.remaining).toBe(5)
      buf.push(1)
      buf.push(2)
      expect(buf.remaining).toBe(3)
    })

    it('available and remaining update after operations', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      buf.push(2)
      expect(buf.available).toBe(2)
      expect(buf.remaining).toBe(1)
      buf.push(3)
      expect(buf.available).toBe(3)
      expect(buf.remaining).toBe(0)
    })

    it('remaining is 0 when full', () => {
      const buf = new CircularBuffer<number>({ capacity: 2 })
      buf.push(1)
      buf.push(2)
      expect(buf.remaining).toBe(0)
    })
  })

  describe('resize', () => {
    it('increases capacity', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.resize(6)
      expect(buf.capacity).toBe(6)
      expect(buf.toArray()).toEqual([1, 2, 3])
    })

    it('decreases capacity truncating elements', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.push(4)
      buf.resize(2)
      expect(buf.capacity).toBe(2)
      expect(buf.toArray()).toEqual([1, 2])
    })

    it('handles resize to same capacity', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      buf.push(2)
      buf.resize(3)
      expect(buf.capacity).toBe(3)
      expect(buf.toArray()).toEqual([1, 2])
    })

    it('handles resize to 1', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      buf.resize(1)
      expect(buf.capacity).toBe(1)
      expect(buf.toArray()).toEqual([1])
    })

    it('clamps negative resize to 1', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.resize(-1)
      expect(buf.capacity).toBe(1)
    })

    it('floors fractional capacity', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.resize(4.9)
      expect(buf.capacity).toBe(4)
    })

    it('preserves elements after wraparound resize', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.shift()
      buf.push(4)
      buf.resize(5)
      expect(buf.toArray()).toEqual([2, 3, 4])
    })
  })

  describe('clone', () => {
    it('creates an independent copy', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      const c = buf.clone()
      expect(c.toArray()).toEqual([1, 2, 3])
      buf.set(0, 99)
      expect(c.get(0)).toBe(1)
    })

    it('clones empty buffer', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      const c = buf.clone()
      expect(c.size).toBe(0)
      expect(c.capacity).toBe(3)
    })

    it('clones preserve overwrite mode', () => {
      const buf = new CircularBuffer<number>({ capacity: 2, overwrite: true })
      buf.push(1)
      buf.push(2)
      const c = buf.clone()
      c.push(3)
      expect(c.toArray()).toEqual([2, 3])
    })
  })

  describe('equals', () => {
    it('returns true for equal buffers', () => {
      const a = CircularBuffer.from([1, 2, 3])
      const b = CircularBuffer.from([1, 2, 3])
      expect(a.equals(b)).toBe(true)
    })

    it('returns false for different contents', () => {
      const a = CircularBuffer.from([1, 2, 3])
      const b = CircularBuffer.from([1, 2, 4])
      expect(a.equals(b)).toBe(false)
    })

    it('returns false for different sizes', () => {
      const a = CircularBuffer.from([1, 2])
      const b = CircularBuffer.from([1, 2, 3])
      expect(a.equals(b)).toBe(false)
    })

    it('returns true for two empty buffers', () => {
      const a = new CircularBuffer<number>({ capacity: 3 })
      const b = new CircularBuffer<number>({ capacity: 5 })
      expect(a.equals(b)).toBe(true)
    })
  })

  describe('contains', () => {
    it('returns true when element exists', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.contains(2)).toBe(true)
    })

    it('returns false when element does not exist', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      expect(buf.contains(5)).toBe(false)
    })

    it('returns false on empty buffer', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      expect(buf.contains(1)).toBe(false)
    })

    it('uses strict equality', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      expect(buf.contains(1)).toBe(true)
      expect(buf.contains('1' as unknown as number)).toBe(false)
    })
  })

  describe('indexOf', () => {
    it('returns index of element', () => {
      const buf = new CircularBuffer<string>({ capacity: 5 })
      buf.push('a')
      buf.push('b')
      buf.push('c')
      expect(buf.indexOf('b')).toBe(1)
    })

    it('returns -1 when element not found', () => {
      const buf = new CircularBuffer<string>({ capacity: 5 })
      buf.push('a')
      buf.push('b')
      expect(buf.indexOf('z')).toBe(-1)
    })

    it('returns -1 on empty buffer', () => {
      const buf = new CircularBuffer<string>({ capacity: 3 })
      expect(buf.indexOf('a')).toBe(-1)
    })

    it('finds first occurrence with duplicates', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      buf.push(1)
      expect(buf.indexOf(1)).toBe(0)
    })

    it('works after wraparound', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.shift()
      buf.push(4)
      expect(buf.indexOf(4)).toBe(2)
    })
  })

  describe('lastIndexOf', () => {
    it('returns last index of element', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.push(2)
      expect(buf.lastIndexOf(2)).toBe(3)
    })

    it('returns -1 when element not found', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      expect(buf.lastIndexOf(5)).toBe(-1)
    })

    it('returns -1 on empty buffer', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      expect(buf.lastIndexOf(1)).toBe(-1)
    })

    it('returns same as indexOf for unique element', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.lastIndexOf(2)).toBe(buf.indexOf(2))
    })

    it('works with single element', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      buf.push(42)
      expect(buf.lastIndexOf(42)).toBe(0)
    })
  })

  describe('reverse', () => {
    it('reverses populated buffer', () => {
      const buf = CircularBuffer.from([1, 2, 3, 4])
      buf.reverse()
      expect(buf.toArray()).toEqual([4, 3, 2, 1])
    })

    it('reverses odd-length buffer', () => {
      const buf = CircularBuffer.from([1, 2, 3])
      buf.reverse()
      expect(buf.toArray()).toEqual([3, 2, 1])
    })

    it('reverses empty buffer', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.reverse()
      expect(buf.toArray()).toEqual([])
    })

    it('reverses single element buffer', () => {
      const buf = CircularBuffer.from([42])
      buf.reverse()
      expect(buf.toArray()).toEqual([42])
    })

    it('returns this for chaining', () => {
      const buf = CircularBuffer.from([1, 2, 3])
      const result = buf.reverse()
      expect(result).toBe(buf)
    })
  })

  describe('rotate', () => {
    it('rotates forward by 1', () => {
      const buf = CircularBuffer.from([1, 2, 3, 4])
      buf.rotate(1)
      expect(buf.toArray()).toEqual([2, 3, 4, 1])
    })

    it('rotates forward by 2', () => {
      const buf = CircularBuffer.from([1, 2, 3, 4])
      buf.rotate(2)
      expect(buf.toArray()).toEqual([3, 4, 1, 2])
    })

    it('rotates backward by 1', () => {
      const buf = CircularBuffer.from([1, 2, 3, 4])
      buf.rotate(-1)
      expect(buf.toArray()).toEqual([4, 1, 2, 3])
    })

    it('no-op rotation by 0', () => {
      const buf = CircularBuffer.from([1, 2, 3])
      buf.rotate(0)
      expect(buf.toArray()).toEqual([1, 2, 3])
    })

    it('full rotation is no-op', () => {
      const buf = CircularBuffer.from([1, 2, 3])
      buf.rotate(3)
      expect(buf.toArray()).toEqual([1, 2, 3])
    })

    it('handles rotation larger than size', () => {
      const buf = CircularBuffer.from([1, 2, 3])
      buf.rotate(5)
      expect(buf.toArray()).toEqual([3, 1, 2])
    })

    it('handles empty buffer', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      buf.rotate(5)
      expect(buf.size).toBe(0)
    })

    it('handles single element buffer', () => {
      const buf = CircularBuffer.from([42])
      buf.rotate(1)
      expect(buf.toArray()).toEqual([42])
    })
  })

  describe('toString', () => {
    it('returns string representation of empty buffer', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      expect(buf.toString()).toBe('CircularBuffer(0/5) []')
    })

    it('returns string representation with elements', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.toString()).toBe('CircularBuffer(3/5) [1, 2, 3]')
    })

    it('handles string elements', () => {
      const buf = new CircularBuffer<string>({ capacity: 3 })
      buf.push('a')
      buf.push('b')
      expect(buf.toString()).toBe('CircularBuffer(2/3) [a, b]')
    })
  })

  describe('static from', () => {
    it('creates buffer from array', () => {
      const buf = CircularBuffer.from([1, 2, 3])
      expect(buf.toArray()).toEqual([1, 2, 3])
    })

    it('creates buffer from empty array', () => {
      const buf = CircularBuffer.from([])
      expect(buf.size).toBe(0)
    })

    it('creates buffer with capacity option', () => {
      const buf = CircularBuffer.from([1, 2, 3], { capacity: 10 })
      expect(buf.capacity).toBe(10)
      expect(buf.toArray()).toEqual([1, 2, 3])
    })

    it('creates buffer with overwrite option', () => {
      const buf = CircularBuffer.from([1, 2], { capacity: 2, overwrite: true })
      expect(buf.toArray()).toEqual([1, 2])
      buf.push(3)
      expect(buf.toArray()).toEqual([2, 3])
    })
  })

  describe('wrapping behavior', () => {
    it('handles push/shift cycling', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      for (let i = 0; i < 100; i++) {
        buf.push(i)
        expect(buf.shift()).toBe(i)
      }
      expect(buf.size).toBe(0)
    })

    it('handles unshift/pop cycling', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      for (let i = 0; i < 100; i++) {
        buf.unshift(i)
        expect(buf.pop()).toBe(i)
      }
      expect(buf.size).toBe(0)
    })

    it('handles mixed push/pop/shift/unshift', () => {
      const buf = new CircularBuffer<number>({ capacity: 4 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.shift()
      buf.push(4)
      buf.pop()
      buf.unshift(0)
      expect(buf.toArray()).toEqual([0, 2, 3])
    })

    it('handles get after many operations', () => {
      const buf = new CircularBuffer<number>({ capacity: 5 })
      for (let i = 0; i < 20; i++) {
        buf.push(i)
        if (buf.size > 3) buf.shift()
      }
      expect(buf.size).toBe(3)
      const arr = buf.toArray()
      for (let i = 0; i < buf.size; i++) {
        expect(buf.get(i)).toBe(arr[i])
      }
    })

    it('handles overwrite wraparound', () => {
      const buf = new CircularBuffer<number>({ capacity: 3, overwrite: true })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.shift()
      buf.push(4)
      buf.push(5)
      expect(buf.toArray()).toEqual([3, 4, 5])
    })
  })

  describe('string elements', () => {
    it('works with string values', () => {
      const buf = new CircularBuffer<string>({ capacity: 3 })
      buf.push('hello')
      buf.push('world')
      expect(buf.toArray()).toEqual(['hello', 'world'])
      expect(buf.shift()).toBe('hello')
    })
  })

  describe('object elements', () => {
    it('works with object references', () => {
      const obj1 = { id: 1 }
      const obj2 = { id: 2 }
      const buf = new CircularBuffer<typeof obj1>({ capacity: 3 })
      buf.push(obj1)
      buf.push(obj2)
      expect(buf.get(0)).toBe(obj1)
      expect(buf.get(1)).toBe(obj2)
    })
  })

  describe('null and undefined values', () => {
    it('stores null values', () => {
      const buf = new CircularBuffer<number | null>({ capacity: 3 })
      buf.push(1)
      buf.push(null)
      buf.push(3)
      expect(buf.toArray()).toEqual([1, null, 3])
    })

    it('stores undefined values', () => {
      const buf = new CircularBuffer<number | undefined>({ capacity: 3 })
      buf.push(1)
      buf.push(undefined)
      buf.push(3)
      expect(buf.toArray()).toEqual([1, undefined, 3])
    })
  })

  describe('filter then map', () => {
    it('chains filter and map', () => {
      const buf = CircularBuffer.from([1, 2, 3, 4, 5])
      const result = buf.filter((v) => v % 2 !== 0).map((v) => v * 10)
      expect(result.toArray()).toEqual([10, 30, 50])
    })
  })

  describe('stress test', () => {
    it('handles many push operations in overwrite mode', () => {
      const buf = new CircularBuffer<number>({ capacity: 100, overwrite: true })
      for (let i = 0; i < 10000; i++) {
        buf.push(i)
      }
      expect(buf.size).toBe(100)
      expect(buf.peek()).toBe(9900)
      expect(buf.peekLast()).toBe(9999)
    })

    it('handles many write/read cycles', () => {
      const buf = new CircularBuffer<number>({ capacity: 10, overwrite: true })
      for (let i = 0; i < 100; i++) {
        buf.write([i * 2, i * 2 + 1])
        buf.read(2)
      }
      expect(buf.size).toBe(0)
    })
  })
})
