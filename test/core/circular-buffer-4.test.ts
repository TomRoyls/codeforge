import { describe, it, expect } from 'vitest'
import { CircularBuffer4 } from '../../src/core/circular-buffer-4/index.js'

describe('CircularBuffer4', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates buffer with specified capacity', () => {
      const buf = new CircularBuffer4<number>(5)
      expect(buf.capacity).toBe(5)
      expect(buf.size).toBe(0)
      expect(buf.isEmpty).toBe(true)
      expect(buf.isFull).toBe(false)
    })

    it('creates buffer with capacity 1', () => {
      const buf = new CircularBuffer4<number>(1)
      expect(buf.capacity).toBe(1)
    })

    it('throws for capacity 0', () => {
      expect(() => new CircularBuffer4<number>(0)).toThrow('Capacity must be greater than 0')
    })

    it('throws for negative capacity', () => {
      expect(() => new CircularBuffer4<number>(-5)).toThrow('Capacity must be greater than 0')
    })
  })

  // ─── Properties ───
  describe('properties', () => {
    it('capacity is immutable', () => {
      const buf = new CircularBuffer4<number>(3)
      expect(buf.capacity).toBe(3)
    })

    it('available decreases as items are written', () => {
      const buf = new CircularBuffer4<number>(3)
      expect(buf.available).toBe(3)
      buf.write(1)
      expect(buf.available).toBe(2)
      buf.write(2)
      expect(buf.available).toBe(1)
      buf.write(3)
      expect(buf.available).toBe(0)
    })

    it('isFull is true when capacity is reached', () => {
      const buf = new CircularBuffer4<number>(2)
      buf.write(1)
      buf.write(2)
      expect(buf.isFull).toBe(true)
    })

    it('isEmpty is true when no items', () => {
      const buf = new CircularBuffer4<number>(5)
      expect(buf.isEmpty).toBe(true)
    })
  })

  // ─── write() ───
  describe('write', () => {
    it('writes items to buffer', () => {
      const buf = new CircularBuffer4<number>(3)
      buf.write(1)
      buf.write(2)
      buf.write(3)
      expect(buf.size).toBe(3)
      expect(buf.toArray()).toEqual([1, 2, 3])
    })

    it('overwrites oldest when full', () => {
      const buf = new CircularBuffer4<number>(3)
      buf.write(1)
      buf.write(2)
      buf.write(3)
      buf.write(4)
      expect(buf.size).toBe(3)
      expect(buf.toArray()).toEqual([2, 3, 4])
    })

    it('handles wrapping multiple times', () => {
      const buf = new CircularBuffer4<number>(2)
      buf.write(1)
      buf.write(2)
      buf.write(3)
      buf.write(4)
      buf.write(5)
      expect(buf.toArray()).toEqual([4, 5])
    })
  })

  // ─── overwrite() ───
  describe('overwrite', () => {
    it('writes to tail when not full', () => {
      const buf = new CircularBuffer4<number>(3)
      buf.overwrite(1)
      buf.overwrite(2)
      expect(buf.size).toBe(2)
      expect(buf.toArray()).toEqual([1, 2])
    })

    it('overwrites oldest when full', () => {
      const buf = new CircularBuffer4<number>(2)
      buf.overwrite(1)
      buf.overwrite(2)
      buf.overwrite(3)
      expect(buf.toArray()).toEqual([2, 3])
    })
  })

  // ─── read() ───
  describe('read', () => {
    it('reads and removes the oldest element', () => {
      const buf = new CircularBuffer4<number>(3)
      buf.write(1)
      buf.write(2)
      expect(buf.read()).toBe(1)
      expect(buf.read()).toBe(2)
    })

    it('returns undefined when buffer is empty', () => {
      const buf = new CircularBuffer4<number>(3)
      expect(buf.read()).toBeUndefined()
    })

    it('maintains correct state after reads', () => {
      const buf = new CircularBuffer4<number>(3)
      buf.write(10)
      buf.write(20)
      buf.read()
      expect(buf.size).toBe(1)
      expect(buf.peek()).toBe(20)
    })
  })

  // ─── peek() ───
  describe('peek', () => {
    it('returns the oldest element without removing', () => {
      const buf = new CircularBuffer4<number>(3)
      buf.write(1)
      buf.write(2)
      expect(buf.peek()).toBe(1)
      expect(buf.size).toBe(2)
    })

    it('returns undefined when buffer is empty', () => {
      const buf = new CircularBuffer4<number>(3)
      expect(buf.peek()).toBeUndefined()
    })
  })

  // ─── peekAt() ───
  describe('peekAt', () => {
    it('returns element at given index', () => {
      const buf = new CircularBuffer4<number>(5)
      buf.write(10)
      buf.write(20)
      buf.write(30)
      expect(buf.peekAt(0)).toBe(10)
      expect(buf.peekAt(1)).toBe(20)
      expect(buf.peekAt(2)).toBe(30)
    })

    it('returns undefined for negative index', () => {
      const buf = new CircularBuffer4<number>(3)
      buf.write(1)
      expect(buf.peekAt(-1)).toBeUndefined()
    })

    it('returns undefined for index >= size', () => {
      const buf = new CircularBuffer4<number>(3)
      buf.write(1)
      expect(buf.peekAt(1)).toBeUndefined()
    })

    it('works correctly after wrap-around', () => {
      const buf = new CircularBuffer4<number>(3)
      buf.write(1)
      buf.write(2)
      buf.write(3)
      buf.write(4)
      expect(buf.peekAt(0)).toBe(2)
      expect(buf.peekAt(1)).toBe(3)
      expect(buf.peekAt(2)).toBe(4)
    })
  })

  // ─── slice() ───
  describe('slice', () => {
    it('returns elements from start to end', () => {
      const buf = new CircularBuffer4<number>(5)
      buf.write(1)
      buf.write(2)
      buf.write(3)
      buf.write(4)
      expect(buf.slice(1, 3)).toEqual([2, 3])
    })

    it('returns elements from start to end of buffer when end omitted', () => {
      const buf = new CircularBuffer4<number>(5)
      buf.write(1)
      buf.write(2)
      buf.write(3)
      expect(buf.slice(1)).toEqual([2, 3])
    })

    it('returns empty for out-of-range start', () => {
      const buf = new CircularBuffer4<number>(5)
      buf.write(1)
      expect(buf.slice(5)).toEqual([])
    })

    it('returns empty for negative start', () => {
      const buf = new CircularBuffer4<number>(5)
      buf.write(1)
      expect(buf.slice(-1)).toEqual([])
    })

    it('returns empty when end <= start', () => {
      const buf = new CircularBuffer4<number>(5)
      buf.write(1)
      buf.write(2)
      expect(buf.slice(1, 1)).toEqual([])
      expect(buf.slice(1, 0)).toEqual([])
    })

    it('clamps end to size', () => {
      const buf = new CircularBuffer4<number>(3)
      buf.write(1)
      buf.write(2)
      expect(buf.slice(0, 100)).toEqual([1, 2])
    })
  })

  // ─── clear() ───
  describe('clear', () => {
    it('removes all elements', () => {
      const buf = new CircularBuffer4<number>(3)
      buf.write(1)
      buf.write(2)
      buf.clear()
      expect(buf.size).toBe(0)
      expect(buf.isEmpty).toBe(true)
      expect(buf.available).toBe(3)
    })

    it('is safe to call on empty buffer', () => {
      const buf = new CircularBuffer4<number>(3)
      buf.clear()
      expect(buf.size).toBe(0)
    })
  })

  // ─── toArray() ───
  describe('toArray', () => {
    it('returns elements in FIFO order', () => {
      const buf = new CircularBuffer4<number>(5)
      buf.write(1)
      buf.write(2)
      buf.write(3)
      expect(buf.toArray()).toEqual([1, 2, 3])
    })

    it('returns empty array for empty buffer', () => {
      const buf = new CircularBuffer4<number>(5)
      expect(buf.toArray()).toEqual([])
    })

    it('handles wrap-around correctly', () => {
      const buf = new CircularBuffer4<number>(3)
      buf.write(1)
      buf.write(2)
      buf.write(3)
      buf.read()
      buf.write(4)
      expect(buf.toArray()).toEqual([2, 3, 4])
    })
  })

  // ─── forEach() ───
  describe('forEach', () => {
    it('iterates over all elements with indices', () => {
      const buf = new CircularBuffer4<number>(5)
      buf.write(10)
      buf.write(20)
      buf.write(30)
      const results: number[] = []
      buf.forEach((v, i) => { results.push(v + i) })
      expect(results).toEqual([10, 21, 32])
    })

    it('does not call callback for empty buffer', () => {
      const buf = new CircularBuffer4<number>(5)
      let count = 0
      buf.forEach(() => { count++ })
      expect(count).toBe(0)
    })
  })

  // ─── filter() ───
  describe('filter', () => {
    it('returns filtered elements', () => {
      const buf = new CircularBuffer4<number>(5)
      buf.write(1)
      buf.write(2)
      buf.write(3)
      buf.write(4)
      expect(buf.filter((v) => v % 2 === 0)).toEqual([2, 4])
    })

    it('returns empty array when nothing matches', () => {
      const buf = new CircularBuffer4<number>(3)
      buf.write(1)
      buf.write(3)
      expect(buf.filter((v) => v % 2 === 0)).toEqual([])
    })

    it('returns empty array for empty buffer', () => {
      const buf = new CircularBuffer4<number>(3)
      expect(buf.filter(() => true)).toEqual([])
    })
  })

  // ─── map() ───
  describe('map', () => {
    it('transforms elements', () => {
      const buf = new CircularBuffer4<number>(3)
      buf.write(1)
      buf.write(2)
      buf.write(3)
      expect(buf.map((v) => v * 10)).toEqual([10, 20, 30])
    })

    it('returns empty array for empty buffer', () => {
      const buf = new CircularBuffer4<number>(3)
      expect(buf.map((v) => v)).toEqual([])
    })
  })

  // ─── reduce() ───
  describe('reduce', () => {
    it('reuces elements with initial value', () => {
      const buf = new CircularBuffer4<number>(3)
      buf.write(1)
      buf.write(2)
      buf.write(3)
      expect(buf.reduce((acc, v) => acc + v, 0)).toBe(6)
    })

    it('returns initial value for empty buffer', () => {
      const buf = new CircularBuffer4<number>(3)
      expect(buf.reduce((acc, v) => acc + v, 42)).toBe(42)
    })
  })

  // ─── getTimeComplexity() ───
  describe('getTimeComplexity', () => {
    it('returns O(1) for write', () => {
      const buf = new CircularBuffer4<number>(3)
      expect(buf.getTimeComplexity('write')).toBe('O(1)')
    })

    it('returns O(n) for toArray', () => {
      const buf = new CircularBuffer4<number>(3)
      expect(buf.getTimeComplexity('toArray')).toBe('O(n)')
    })

    it('returns unknown for unrecognized operation', () => {
      const buf = new CircularBuffer4<number>(3)
      expect(buf.getTimeComplexity('unknown')).toBe('Unknown operation')
    })
  })
})
