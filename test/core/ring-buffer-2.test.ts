import { describe, it, expect } from 'vitest'
import { RingBuffer } from '../../src/core/ring-buffer-2/index.js'

describe('RingBuffer', () => {
  describe('constructor', () => {
    it('should create a buffer with given capacity as number', () => {
      const rb = new RingBuffer<number>(5)
      expect(rb.capacity).toBe(5)
      expect(rb.size).toBe(0)
      expect(rb.isEmpty).toBe(true)
      expect(rb.isFull).toBe(false)
    })

    it('should create a buffer with options object', () => {
      const rb = new RingBuffer<number>({ capacity: 10 })
      expect(rb.capacity).toBe(10)
    })

    it('should throw on zero capacity', () => {
      expect(() => new RingBuffer(0)).toThrow(RangeError)
    })

    it('should throw on negative capacity', () => {
      expect(() => new RingBuffer(-1)).toThrow(RangeError)
    })

    it('should throw on non-integer capacity', () => {
      expect(() => new RingBuffer(3.5)).toThrow(RangeError)
    })

    it('should throw on capacity of 1 being valid', () => {
      const rb = new RingBuffer(1)
      expect(rb.capacity).toBe(1)
    })

    it('should work with large capacity', () => {
      const rb = new RingBuffer(10000)
      expect(rb.capacity).toBe(10000)
    })
  })

  describe('push', () => {
    it('should add element to empty buffer', () => {
      const rb = new RingBuffer<number>(3)
      rb.push(1)
      expect(rb.size).toBe(1)
      expect(rb.toArray()).toEqual([1])
    })

    it('should add multiple elements', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      expect(rb.size).toBe(3)
      expect(rb.toArray()).toEqual([1, 2, 3])
    })

    it('should fill buffer to capacity', () => {
      const rb = new RingBuffer<number>(3)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      expect(rb.isFull).toBe(true)
      expect(rb.toArray()).toEqual([1, 2, 3])
    })

    it('should overwrite oldest when full', () => {
      const rb = new RingBuffer<number>(3)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      rb.push(4)
      expect(rb.size).toBe(3)
      expect(rb.toArray()).toEqual([2, 3, 4])
    })

    it('should handle multiple overwrites', () => {
      const rb = new RingBuffer<number>(2)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      rb.push(4)
      rb.push(5)
      expect(rb.toArray()).toEqual([4, 5])
    })

    it('should overwrite on capacity 1', () => {
      const rb = new RingBuffer<number>(1)
      rb.push(10)
      expect(rb.toArray()).toEqual([10])
      rb.push(20)
      expect(rb.toArray()).toEqual([20])
      expect(rb.size).toBe(1)
    })

    it('should handle wrapping around', () => {
      const rb = new RingBuffer<number>(3)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      rb.shift()
      rb.shift()
      rb.push(4)
      rb.push(5)
      expect(rb.toArray()).toEqual([3, 4, 5])
    })
  })

  describe('pop', () => {
    it('should remove and return last element', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      expect(rb.pop()).toBe(3)
      expect(rb.size).toBe(2)
    })

    it('should pop all elements', () => {
      const rb = new RingBuffer<number>(3)
      rb.push(1)
      rb.push(2)
      expect(rb.pop()).toBe(2)
      expect(rb.pop()).toBe(1)
      expect(rb.isEmpty).toBe(true)
    })

    it('should throw on empty buffer', () => {
      const rb = new RingBuffer<number>(3)
      expect(() => rb.pop()).toThrow(RangeError)
    })

    it('should handle pop after overwrite', () => {
      const rb = new RingBuffer<number>(2)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      expect(rb.pop()).toBe(3)
      expect(rb.toArray()).toEqual([2])
    })

    it('should handle pop after wrap-around', () => {
      const rb = new RingBuffer<number>(3)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      rb.shift()
      rb.push(4)
      expect(rb.pop()).toBe(4)
      expect(rb.toArray()).toEqual([2, 3])
    })
  })

  describe('shift', () => {
    it('should remove and return first element', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      expect(rb.shift()).toBe(1)
      expect(rb.size).toBe(2)
    })

    it('should shift all elements', () => {
      const rb = new RingBuffer<number>(3)
      rb.push(10)
      rb.push(20)
      expect(rb.shift()).toBe(10)
      expect(rb.shift()).toBe(20)
      expect(rb.isEmpty).toBe(true)
    })

    it('should throw on empty buffer', () => {
      const rb = new RingBuffer<number>(3)
      expect(() => rb.shift()).toThrow(RangeError)
    })

    it('should handle shift after overwrite', () => {
      const rb = new RingBuffer<number>(2)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      expect(rb.shift()).toBe(2)
      expect(rb.toArray()).toEqual([3])
    })
  })

  describe('unshift', () => {
    it('should add element to front of buffer', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(2)
      rb.push(3)
      rb.unshift(1)
      expect(rb.toArray()).toEqual([1, 2, 3])
    })

    it('should handle unshift on empty buffer', () => {
      const rb = new RingBuffer<number>(3)
      rb.unshift(1)
      expect(rb.toArray()).toEqual([1])
    })

    it('should unshift multiple elements', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(3)
      rb.unshift(2)
      rb.unshift(1)
      expect(rb.toArray()).toEqual([1, 2, 3])
    })

    it('should overwrite newest when full', () => {
      const rb = new RingBuffer<number>(3)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      rb.unshift(0)
      expect(rb.size).toBe(3)
      expect(rb.toArray()).toEqual([0, 1, 2])
    })

    it('should handle unshift on capacity 1', () => {
      const rb = new RingBuffer<number>(1)
      rb.push(10)
      rb.unshift(20)
      expect(rb.toArray()).toEqual([20])
    })

    it('should handle multiple unshift overwrites', () => {
      const rb = new RingBuffer<number>(2)
      rb.push(1)
      rb.push(2)
      rb.unshift(3)
      rb.unshift(4)
      expect(rb.toArray()).toEqual([4, 3])
    })
  })

  describe('get', () => {
    it('should get element by index', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(10)
      rb.push(20)
      rb.push(30)
      expect(rb.get(0)).toBe(10)
      expect(rb.get(1)).toBe(20)
      expect(rb.get(2)).toBe(30)
    })

    it('should throw on negative index', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(1)
      expect(() => rb.get(-1)).toThrow(RangeError)
    })

    it('should throw on index >= size', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(1)
      expect(() => rb.get(1)).toThrow(RangeError)
    })

    it('should throw on empty buffer', () => {
      const rb = new RingBuffer<number>(5)
      expect(() => rb.get(0)).toThrow(RangeError)
    })

    it('should get correctly after wrap-around', () => {
      const rb = new RingBuffer<number>(3)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      rb.push(4)
      expect(rb.get(0)).toBe(2)
      expect(rb.get(1)).toBe(3)
      expect(rb.get(2)).toBe(4)
    })
  })

  describe('set', () => {
    it('should set element by index', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      rb.set(1, 99)
      expect(rb.get(1)).toBe(99)
    })

    it('should throw on invalid index', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(1)
      expect(() => rb.set(-1, 99)).toThrow(RangeError)
      expect(() => rb.set(1, 99)).toThrow(RangeError)
    })

    it('should set correctly after wrap-around', () => {
      const rb = new RingBuffer<number>(3)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      rb.push(4)
      rb.set(0, 10)
      expect(rb.toArray()).toEqual([10, 3, 4])
    })
  })

  describe('peek', () => {
    it('should return first element without removing', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(1)
      rb.push(2)
      expect(rb.peek()).toBe(1)
      expect(rb.size).toBe(2)
    })

    it('should throw on empty buffer', () => {
      const rb = new RingBuffer<number>(5)
      expect(() => rb.peek()).toThrow(RangeError)
    })

    it('should reflect changes after shift', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(1)
      rb.push(2)
      rb.shift()
      expect(rb.peek()).toBe(2)
    })
  })

  describe('peekBack', () => {
    it('should return last element without removing', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      expect(rb.peekBack()).toBe(3)
      expect(rb.size).toBe(3)
    })

    it('should throw on empty buffer', () => {
      const rb = new RingBuffer<number>(5)
      expect(() => rb.peekBack()).toThrow(RangeError)
    })

    it('should reflect changes after pop', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      rb.pop()
      expect(rb.peekBack()).toBe(2)
    })
  })

  describe('clear', () => {
    it('should empty the buffer', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      rb.clear()
      expect(rb.size).toBe(0)
      expect(rb.isEmpty).toBe(true)
      expect(rb.isFull).toBe(false)
    })

    it('should allow operations after clear', () => {
      const rb = new RingBuffer<number>(3)
      rb.push(1)
      rb.push(2)
      rb.clear()
      rb.push(3)
      expect(rb.toArray()).toEqual([3])
    })

    it('should work on already empty buffer', () => {
      const rb = new RingBuffer<number>(3)
      rb.clear()
      expect(rb.isEmpty).toBe(true)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty buffer', () => {
      const rb = new RingBuffer<number>(5)
      expect(rb.toArray()).toEqual([])
    })

    it('should return all elements in order', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      expect(rb.toArray()).toEqual([1, 2, 3])
    })

    it('should return correct order after overwrite', () => {
      const rb = new RingBuffer<number>(3)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      rb.push(4)
      expect(rb.toArray()).toEqual([2, 3, 4])
    })

    it('should return new array each call', () => {
      const rb = new RingBuffer<number>(3)
      rb.push(1)
      const a1 = rb.toArray()
      const a2 = rb.toArray()
      expect(a1).not.toBe(a2)
      expect(a1).toEqual(a2)
    })
  })

  describe('forEach', () => {
    it('should iterate all elements', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      const collected: number[] = []
      rb.forEach((v) => collected.push(v))
      expect(collected).toEqual([1, 2, 3])
    })

    it('should provide correct indices', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(10)
      rb.push(20)
      rb.push(30)
      const indices: number[] = []
      rb.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should provide buffer reference', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(1)
      rb.forEach((_v, _i, buf) => {
        expect(buf).toBe(rb)
      })
    })

    it('should not iterate empty buffer', () => {
      const rb = new RingBuffer<number>(5)
      let count = 0
      rb.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('map', () => {
    it('should map elements to new array', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      expect(rb.map((v) => v * 2)).toEqual([2, 4, 6])
    })

    it('should return empty array for empty buffer', () => {
      const rb = new RingBuffer<number>(5)
      expect(rb.map((v) => v)).toEqual([])
    })

    it('should provide correct indices', () => {
      const rb = new RingBuffer<string>(5)
      rb.push('a')
      rb.push('b')
      const result = rb.map((_v, i) => i)
      expect(result).toEqual([0, 1])
    })

    it('should map to different type', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(1)
      rb.push(2)
      const result = rb.map((v) => String(v))
      expect(result).toEqual(['1', '2'])
    })
  })

  describe('filter', () => {
    it('should filter elements', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      rb.push(4)
      expect(rb.filter((v) => v % 2 === 0)).toEqual([2, 4])
    })

    it('should return empty when no match', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(1)
      rb.push(3)
      expect(rb.filter((v) => v % 2 === 0)).toEqual([])
    })

    it('should return all when all match', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(2)
      rb.push(4)
      expect(rb.filter((v) => v % 2 === 0)).toEqual([2, 4])
    })

    it('should work on empty buffer', () => {
      const rb = new RingBuffer<number>(5)
      expect(rb.filter((v) => v > 0)).toEqual([])
    })
  })

  describe('reduce', () => {
    it('should reduce elements to sum', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      expect(rb.reduce((acc, v) => acc + v, 0)).toBe(6)
    })

    it('should return initial value for empty buffer', () => {
      const rb = new RingBuffer<number>(5)
      expect(rb.reduce((acc, v) => acc + v, 42)).toBe(42)
    })

    it('should reduce to string', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      expect(rb.reduce((acc, v) => acc + String(v), '')).toBe('123')
    })

    it('should reduce with index', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(10)
      rb.push(20)
      expect(rb.reduce((acc, _v, i) => acc + i, 0)).toBe(1)
    })
  })

  describe('iterator', () => {
    it('should iterate with for-of', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      const collected: number[] = []
      for (const v of rb) {
        collected.push(v)
      }
      expect(collected).toEqual([1, 2, 3])
    })

    it('should work with spread operator', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(1)
      rb.push(2)
      expect([...rb]).toEqual([1, 2])
    })

    it('should handle empty buffer iteration', () => {
      const rb = new RingBuffer<number>(5)
      const collected: number[] = []
      for (const v of rb) {
        collected.push(v)
      }
      expect(collected).toEqual([])
    })

    it('should work with Array.from', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(10)
      rb.push(20)
      expect(Array.from(rb)).toEqual([10, 20])
    })

    it('should iterate correctly after overwrite', () => {
      const rb = new RingBuffer<number>(3)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      rb.push(4)
      expect([...rb]).toEqual([2, 3, 4])
    })
  })

  describe('resize', () => {
    it('should increase capacity', () => {
      const rb = new RingBuffer<number>(3)
      rb.push(1)
      rb.push(2)
      rb.resize(6)
      expect(rb.capacity).toBe(6)
      expect(rb.toArray()).toEqual([1, 2])
    })

    it('should decrease capacity, keeping newest', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      rb.push(4)
      rb.resize(2)
      expect(rb.capacity).toBe(2)
      expect(rb.toArray()).toEqual([3, 4])
      expect(rb.size).toBe(2)
    })

    it('should throw on zero capacity', () => {
      const rb = new RingBuffer<number>(3)
      expect(() => rb.resize(0)).toThrow(RangeError)
    })

    it('should throw on negative capacity', () => {
      const rb = new RingBuffer<number>(3)
      expect(() => rb.resize(-1)).toThrow(RangeError)
    })

    it('should resize to 1', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      rb.resize(1)
      expect(rb.toArray()).toEqual([3])
      expect(rb.capacity).toBe(1)
    })

    it('should allow push after resize', () => {
      const rb = new RingBuffer<number>(2)
      rb.push(1)
      rb.resize(5)
      rb.push(2)
      rb.push(3)
      expect(rb.toArray()).toEqual([1, 2, 3])
    })

    it('should handle resize on empty buffer', () => {
      const rb = new RingBuffer<number>(3)
      rb.resize(10)
      expect(rb.capacity).toBe(10)
      expect(rb.isEmpty).toBe(true)
    })

    it('should keep same size if data fits', () => {
      const rb = new RingBuffer<number>(3)
      rb.push(1)
      rb.push(2)
      rb.resize(5)
      expect(rb.size).toBe(2)
      expect(rb.capacity).toBe(5)
    })
  })

  describe('write', () => {
    it('should write multiple values', () => {
      const rb = new RingBuffer<number>(5)
      const written = rb.write([1, 2, 3])
      expect(written).toBe(3)
      expect(rb.toArray()).toEqual([1, 2, 3])
    })

    it('should overwrite old values when writing exceeds capacity', () => {
      const rb = new RingBuffer<number>(3)
      rb.write([1, 2, 3, 4, 5])
      expect(rb.toArray()).toEqual([3, 4, 5])
      expect(rb.size).toBe(3)
    })

    it('should return 0 for empty array', () => {
      const rb = new RingBuffer<number>(5)
      expect(rb.write([])).toBe(0)
    })

    it('should write to partially filled buffer', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(1)
      rb.write([2, 3])
      expect(rb.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('read', () => {
    it('should read specified number of elements', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      const result = rb.read(2)
      expect(result).toEqual([1, 2])
      expect(rb.size).toBe(1)
    })

    it('should read all if count exceeds size', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(1)
      rb.push(2)
      const result = rb.read(10)
      expect(result).toEqual([1, 2])
      expect(rb.isEmpty).toBe(true)
    })

    it('should return empty array for count 0', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(1)
      expect(rb.read(0)).toEqual([])
      expect(rb.size).toBe(1)
    })

    it('should throw on negative count', () => {
      const rb = new RingBuffer<number>(5)
      expect(() => rb.read(-1)).toThrow(RangeError)
    })

    it('should return empty array for empty buffer', () => {
      const rb = new RingBuffer<number>(5)
      expect(rb.read(3)).toEqual([])
    })
  })

  describe('generics', () => {
    it('should work with strings', () => {
      const rb = new RingBuffer<string>(3)
      rb.push('a')
      rb.push('b')
      rb.push('c')
      expect(rb.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('should work with objects', () => {
      const rb = new RingBuffer<{ id: number }>(3)
      rb.push({ id: 1 })
      rb.push({ id: 2 })
      expect(rb.get(0)).toEqual({ id: 1 })
      expect(rb.get(1)).toEqual({ id: 2 })
    })

    it('should work with null values', () => {
      const rb = new RingBuffer<number | null>(3)
      rb.push(1)
      rb.push(null)
      rb.push(3)
      expect(rb.toArray()).toEqual([1, null, 3])
    })

    it('should work with undefined values', () => {
      const rb = new RingBuffer<number | undefined>(3)
      rb.push(1)
      rb.push(undefined)
      rb.push(3)
      expect(rb.toArray()).toEqual([1, undefined, 3])
    })
  })

  describe('complex scenarios', () => {
    it('should handle alternating push/shift', () => {
      const rb = new RingBuffer<number>(3)
      rb.push(1)
      rb.shift()
      rb.push(2)
      rb.shift()
      rb.push(3)
      rb.shift()
      rb.push(4)
      expect(rb.toArray()).toEqual([4])
    })

    it('should handle alternating push/pop', () => {
      const rb = new RingBuffer<number>(3)
      rb.push(1)
      rb.pop()
      rb.push(2)
      rb.pop()
      rb.push(3)
      expect(rb.toArray()).toEqual([3])
    })

    it('should handle mixed operations', () => {
      const rb = new RingBuffer<number>(4)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      rb.shift()
      rb.push(4)
      rb.unshift(0)
      expect(rb.toArray()).toEqual([0, 2, 3, 4])
    })

    it('should handle many wraps around the buffer', () => {
      const rb = new RingBuffer<number>(3)
      for (let i = 0; i < 100; i++) {
        rb.push(i)
      }
      expect(rb.toArray()).toEqual([97, 98, 99])
    })

    it('should handle clear then reuse with different data', () => {
      const rb = new RingBuffer<number>(3)
      rb.push(1)
      rb.push(2)
      rb.clear()
      rb.push(10)
      rb.push(20)
      rb.push(30)
      expect(rb.toArray()).toEqual([10, 20, 30])
    })

    it('should work as a sliding window', () => {
      const rb = new RingBuffer<number>(3)
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const windows: number[][] = []
      for (const v of data) {
        rb.push(v)
        if (rb.size === 3) {
          windows.push(rb.toArray())
        }
      }
      expect(windows).toEqual([
        [1, 2, 3],
        [2, 3, 4],
        [3, 4, 5],
        [4, 5, 6],
        [5, 6, 7],
        [6, 7, 8],
        [7, 8, 9],
        [8, 9, 10],
      ])
    })

    it('should handle write then read cycle', () => {
      const rb = new RingBuffer<number>(5)
      rb.write([1, 2, 3, 4, 5])
      expect(rb.read(3)).toEqual([1, 2, 3])
      rb.write([6, 7])
      expect(rb.toArray()).toEqual([4, 5, 6, 7])
    })

    it('should handle resize down then up', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      rb.push(4)
      rb.resize(2)
      expect(rb.toArray()).toEqual([3, 4])
      rb.resize(10)
      rb.push(5)
      rb.push(6)
      expect(rb.toArray()).toEqual([3, 4, 5, 6])
    })

    it('should handle map/filter/reduce chain after overwrite', () => {
      const rb = new RingBuffer<number>(3)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      rb.push(4)
      const result = rb
        .map((v) => v * 10)
        .filter((v) => v > 25)
        .reduce((acc, v) => acc + v, 0)
      expect(result).toBe(70)
    })

    it('should correctly track size through all operations', () => {
      const rb = new RingBuffer<number>(5)
      expect(rb.size).toBe(0)
      rb.push(1)
      expect(rb.size).toBe(1)
      rb.push(2)
      rb.push(3)
      expect(rb.size).toBe(3)
      rb.pop()
      expect(rb.size).toBe(2)
      rb.shift()
      expect(rb.size).toBe(1)
      rb.unshift(0)
      expect(rb.size).toBe(2)
      rb.clear()
      expect(rb.size).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('should handle single element operations', () => {
      const rb = new RingBuffer<number>(1)
      rb.push(42)
      expect(rb.peek()).toBe(42)
      expect(rb.peekBack()).toBe(42)
      expect(rb.get(0)).toBe(42)
      expect(rb.shift()).toBe(42)
      expect(rb.isEmpty).toBe(true)
    })

    it('should handle push after pop to empty', () => {
      const rb = new RingBuffer<number>(3)
      rb.push(1)
      rb.pop()
      rb.push(2)
      expect(rb.toArray()).toEqual([2])
    })

    it('should handle shift after shift to empty', () => {
      const rb = new RingBuffer<number>(3)
      rb.push(1)
      rb.shift()
      rb.push(2)
      expect(rb.toArray()).toEqual([2])
    })

    it('should handle unshift into empty then push', () => {
      const rb = new RingBuffer<number>(5)
      rb.unshift(2)
      rb.unshift(1)
      rb.push(3)
      expect(rb.toArray()).toEqual([1, 2, 3])
    })

    it('should handle setting value then reading via iteration', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      rb.set(1, 99)
      expect([...rb]).toEqual([1, 99, 3])
    })

    it('should handle forEach with mutation through set', () => {
      const rb = new RingBuffer<number>(5)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      rb.forEach((_v, i) => {
        if (i === 1) rb.set(i, 99)
      })
      expect(rb.toArray()).toEqual([1, 99, 3])
    })

    it('should handle capacity 2 circular operations', () => {
      const rb = new RingBuffer<number>(2)
      rb.push(1)
      rb.push(2)
      rb.push(3)
      rb.push(4)
      rb.push(5)
      expect(rb.toArray()).toEqual([4, 5])
      expect(rb.shift()).toBe(4)
      expect(rb.shift()).toBe(5)
      expect(rb.isEmpty).toBe(true)
    })
  })
})
