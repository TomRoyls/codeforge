import { describe, it, expect } from 'vitest'
import { CircularBuffer3 } from '../../src/core/circular-buffer-3/index.js'

// ─── Constructor ───

describe('CircularBuffer3', () => {
  describe('constructor', () => {
    it('should create a buffer with the given capacity', () => {
      const buf = new CircularBuffer3<number>(5)
      expect(buf.capacity).toBe(5)
    })

    it('should throw for zero capacity', () => {
      expect(() => new CircularBuffer3(0)).toThrow('Capacity must be greater than 0')
    })

    it('should throw for negative capacity', () => {
      expect(() => new CircularBuffer3(-3)).toThrow('Capacity must be greater than 0')
    })

    it('should create a buffer with capacity 1', () => {
      const buf = new CircularBuffer3<string>(1)
      expect(buf.capacity).toBe(1)
    })
  })

  // ─── Properties ───

  describe('properties', () => {
    it('size should be 0 on empty buffer', () => {
      const buf = new CircularBuffer3<number>(4)
      expect(buf.size).toBe(0)
    })

    it('isEmpty should be true on empty buffer', () => {
      const buf = new CircularBuffer3<number>(4)
      expect(buf.isEmpty).toBe(true)
    })

    it('isFull should be false on empty buffer', () => {
      const buf = new CircularBuffer3<number>(4)
      expect(buf.isFull).toBe(false)
    })

    it('isFull should be true when buffer is at capacity', () => {
      const buf = new CircularBuffer3<number>(2)
      buf.write(1)
      buf.write(2)
      expect(buf.isFull).toBe(true)
    })
  })

  // ─── write / read ───

  describe('write and read', () => {
    it('should write and read values in FIFO order', () => {
      const buf = new CircularBuffer3<number>(3)
      buf.write(10)
      buf.write(20)
      buf.write(30)
      expect(buf.read()).toBe(10)
      expect(buf.read()).toBe(20)
      expect(buf.read()).toBe(30)
    })

    it('should overwrite oldest when buffer is full', () => {
      const buf = new CircularBuffer3<number>(3)
      buf.write(1)
      buf.write(2)
      buf.write(3)
      buf.write(4) // overwrites 1
      expect(buf.size).toBe(3)
      expect(buf.read()).toBe(2)
      expect(buf.read()).toBe(3)
      expect(buf.read()).toBe(4)
    })

    it('should return undefined when reading from empty buffer', () => {
      const buf = new CircularBuffer3<number>(3)
      expect(buf.read()).toBeUndefined()
    })

    it('should handle single-element buffer', () => {
      const buf = new CircularBuffer3<number>(1)
      buf.write(42)
      expect(buf.read()).toBe(42)
      expect(buf.isEmpty).toBe(true)
    })

    it('should handle overwriting on single-element buffer', () => {
      const buf = new CircularBuffer3<number>(1)
      buf.write(1)
      buf.write(2)
      expect(buf.read()).toBe(2)
    })

    it('should track size correctly after mixed operations', () => {
      const buf = new CircularBuffer3<number>(4)
      buf.write(1)
      buf.write(2)
      expect(buf.size).toBe(2)
      buf.read()
      expect(buf.size).toBe(1)
      buf.write(3)
      buf.write(4)
      buf.write(5)
      expect(buf.size).toBe(4)
    })
  })

  // ─── peek ───

  describe('peek', () => {
    it('should return the front element without removing it', () => {
      const buf = new CircularBuffer3<number>(3)
      buf.write(10)
      buf.write(20)
      expect(buf.peek()).toBe(10)
      expect(buf.size).toBe(2)
    })

    it('should return undefined on empty buffer', () => {
      const buf = new CircularBuffer3<number>(3)
      expect(buf.peek()).toBeUndefined()
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('should reset the buffer to empty state', () => {
      const buf = new CircularBuffer3<number>(3)
      buf.write(1)
      buf.write(2)
      buf.clear()
      expect(buf.isEmpty).toBe(true)
      expect(buf.size).toBe(0)
    })

    it('should allow writing after clear', () => {
      const buf = new CircularBuffer3<number>(3)
      buf.write(1)
      buf.clear()
      buf.write(99)
      expect(buf.read()).toBe(99)
    })
  })

  // ─── toArray ───

  describe('toArray', () => {
    it('should return empty array for empty buffer', () => {
      const buf = new CircularBuffer3<number>(3)
      expect(buf.toArray()).toEqual([])
    })

    it('should return elements in FIFO order', () => {
      const buf = new CircularBuffer3<number>(5)
      buf.write(1)
      buf.write(2)
      buf.write(3)
      expect(buf.toArray()).toEqual([1, 2, 3])
    })

    it('should handle wrap-around correctly', () => {
      const buf = new CircularBuffer3<number>(3)
      buf.write(1)
      buf.write(2)
      buf.write(3)
      buf.read() // removes 1
      buf.write(4)
      expect(buf.toArray()).toEqual([2, 3, 4])
    })
  })

  // ─── forEach ───

  describe('forEach', () => {
    it('should iterate over all elements in order', () => {
      const buf = new CircularBuffer3<number>(4)
      buf.write(10)
      buf.write(20)
      buf.write(30)
      const collected: number[] = []
      buf.forEach((v) => collected.push(v))
      expect(collected).toEqual([10, 20, 30])
    })

    it('should provide correct index', () => {
      const buf = new CircularBuffer3<string>(3)
      buf.write('a')
      buf.write('b')
      const indices: number[] = []
      buf.forEach((_, i) => indices.push(i))
      expect(indices).toEqual([0, 1])
    })

    it('should not iterate on empty buffer', () => {
      const buf = new CircularBuffer3<number>(3)
      let count = 0
      buf.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  // ─── writeMany ───

  describe('writeMany', () => {
    it('should write multiple values', () => {
      const buf = new CircularBuffer3<number>(5)
      buf.writeMany([1, 2, 3])
      expect(buf.toArray()).toEqual([1, 2, 3])
    })

    it('should overwrite oldest when exceeding capacity', () => {
      const buf = new CircularBuffer3<number>(3)
      buf.writeMany([1, 2, 3, 4, 5])
      expect(buf.toArray()).toEqual([3, 4, 5])
    })

    it('should handle empty array', () => {
      const buf = new CircularBuffer3<number>(3)
      buf.writeMany([])
      expect(buf.isEmpty).toBe(true)
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('should handle string values', () => {
      const buf = new CircularBuffer3<string>(3)
      buf.write('hello')
      buf.write('world')
      expect(buf.read()).toBe('hello')
      expect(buf.read()).toBe('world')
    })

    it('should handle null-like values', () => {
      const buf = new CircularBuffer3<number | null>(3)
      buf.write(null)
      buf.write(0)
      expect(buf.read()).toBe(null)
      expect(buf.read()).toBe(0)
    })

    it('should handle many wrap-around cycles', () => {
      const buf = new CircularBuffer3<number>(3)
      for (let i = 0; i < 20; i++) {
        buf.write(i)
      }
      expect(buf.size).toBe(3)
      expect(buf.toArray()).toEqual([17, 18, 19])
    })
  })
})
