import { describe, it, expect } from 'vitest'
import { RingBuffer5 } from '../../src/core/ring-buffer-5/index.js'

describe('RingBuffer5', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates buffer with specified capacity', () => {
      const buf = new RingBuffer5<number>(5)
      expect(buf.capacity).toBe(5)
      expect(buf.size).toBe(0)
      expect(buf.isEmpty).toBe(true)
      expect(buf.isFull).toBe(false)
    })

    it('creates buffer with capacity 1', () => {
      const buf = new RingBuffer5<number>(1)
      expect(buf.capacity).toBe(1)
    })

    it('throws for capacity 0', () => {
      expect(() => new RingBuffer5<number>(0)).toThrow('Capacity must be a positive integer')
    })

    it('throws for negative capacity', () => {
      expect(() => new RingBuffer5<number>(-5)).toThrow('Capacity must be a positive integer')
    })

    it('throws for non-integer capacity', () => {
      expect(() => new RingBuffer5<number>(3.5)).toThrow('Capacity must be a positive integer')
    })
  })

  // ─── Properties ───
  describe('properties', () => {
    it('capacity is readonly', () => {
      const buf = new RingBuffer5<number>(3)
      expect(buf.capacity).toBe(3)
    })

    it('available decreases as items are pushed', () => {
      const buf = new RingBuffer5<number>(3)
      expect(buf.available).toBe(3)
      buf.push(1)
      expect(buf.available).toBe(2)
      buf.push(2)
      expect(buf.available).toBe(1)
      buf.push(3)
      expect(buf.available).toBe(0)
    })

    it('isFull is true when capacity is reached', () => {
      const buf = new RingBuffer5<number>(2)
      buf.push(1)
      buf.push(2)
      expect(buf.isFull).toBe(true)
    })

    it('isEmpty is true when no items', () => {
      const buf = new RingBuffer5<number>(5)
      expect(buf.isEmpty).toBe(true)
    })

    it('size tracks element count', () => {
      const buf = new RingBuffer5<number>(5)
      expect(buf.size).toBe(0)
      buf.push(1)
      expect(buf.size).toBe(1)
      buf.push(2)
      expect(buf.size).toBe(2)
    })
  })

  // ─── push() ───
  describe('push', () => {
    it('pushes items to buffer', () => {
      const buf = new RingBuffer5<number>(3)
      expect(buf.push(1)).toBe(true)
      expect(buf.push(2)).toBe(true)
      expect(buf.push(3)).toBe(true)
      expect(buf.size).toBe(3)
      expect(buf.toArray()).toEqual([1, 2, 3])
    })

    it('returns false when buffer is full', () => {
      const buf = new RingBuffer5<number>(2)
      buf.push(1)
      buf.push(2)
      expect(buf.push(3)).toBe(false)
      expect(buf.size).toBe(2)
    })

    it('handles single element buffer', () => {
      const buf = new RingBuffer5<number>(1)
      expect(buf.push(10)).toBe(true)
      expect(buf.isFull).toBe(true)
      expect(buf.push(20)).toBe(false)
    })
  })

  // ─── pop() ───
  describe('pop', () => {
    it('pops items in LIFO order', () => {
      const buf = new RingBuffer5<number>(5)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.pop()).toBe(3)
      expect(buf.pop()).toBe(2)
      expect(buf.pop()).toBe(1)
    })

    it('returns undefined when buffer is empty', () => {
      const buf = new RingBuffer5<number>(3)
      expect(buf.pop()).toBeUndefined()
    })

    it('maintains correct state after pops', () => {
      const buf = new RingBuffer5<number>(5)
      buf.push(10)
      buf.push(20)
      buf.pop()
      expect(buf.size).toBe(1)
      expect(buf.peek()).toBe(10)
    })

    it('allows pushing after popping', () => {
      const buf = new RingBuffer5<number>(2)
      buf.push(1)
      buf.push(2)
      buf.pop()
      expect(buf.push(3)).toBe(true)
      expect(buf.toArray()).toEqual([1, 3])
    })
  })

  // ─── enqueue() ───
  describe('enqueue', () => {
    it('aliases push', () => {
      const buf = new RingBuffer5<number>(3)
      expect(buf.enqueue(1)).toBe(true)
      expect(buf.enqueue(2)).toBe(true)
      expect(buf.size).toBe(2)
      expect(buf.toArray()).toEqual([1, 2])
    })

    it('returns false when full', () => {
      const buf = new RingBuffer5<number>(1)
      buf.enqueue(1)
      expect(buf.enqueue(2)).toBe(false)
    })
  })

  // ─── dequeue() ───
  describe('dequeue', () => {
    it('removes and returns the oldest element (FIFO)', () => {
      const buf = new RingBuffer5<number>(5)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.dequeue()).toBe(1)
      expect(buf.dequeue()).toBe(2)
    })

    it('returns undefined when buffer is empty', () => {
      const buf = new RingBuffer5<number>(3)
      expect(buf.dequeue()).toBeUndefined()
    })

    it('maintains correct state after dequeues', () => {
      const buf = new RingBuffer5<number>(5)
      buf.push(10)
      buf.push(20)
      buf.dequeue()
      expect(buf.size).toBe(1)
      expect(buf.peek()).toBe(20)
    })

    it('allows pushing after dequeue from full buffer', () => {
      const buf = new RingBuffer5<number>(2)
      buf.push(1)
      buf.push(2)
      buf.dequeue()
      expect(buf.push(3)).toBe(true)
      expect(buf.toArray()).toEqual([2, 3])
    })
  })

  // ─── peek() ───
  describe('peek', () => {
    it('returns the oldest element without removing', () => {
      const buf = new RingBuffer5<number>(5)
      buf.push(1)
      buf.push(2)
      expect(buf.peek()).toBe(1)
      expect(buf.size).toBe(2)
    })

    it('returns undefined when buffer is empty', () => {
      const buf = new RingBuffer5<number>(3)
      expect(buf.peek()).toBeUndefined()
    })

    it('reflects head after dequeue', () => {
      const buf = new RingBuffer5<number>(5)
      buf.push(1)
      buf.push(2)
      buf.dequeue()
      expect(buf.peek()).toBe(2)
    })
  })

  // ─── peekAt() ───
  describe('peekAt', () => {
    it('returns element at given index', () => {
      const buf = new RingBuffer5<number>(5)
      buf.push(10)
      buf.push(20)
      buf.push(30)
      expect(buf.peekAt(0)).toBe(10)
      expect(buf.peekAt(1)).toBe(20)
      expect(buf.peekAt(2)).toBe(30)
    })

    it('returns undefined for negative index', () => {
      const buf = new RingBuffer5<number>(3)
      buf.push(1)
      expect(buf.peekAt(-1)).toBeUndefined()
    })

    it('returns undefined for index >= size', () => {
      const buf = new RingBuffer5<number>(3)
      buf.push(1)
      expect(buf.peekAt(1)).toBeUndefined()
    })

    it('returns undefined for index equal to size', () => {
      const buf = new RingBuffer5<number>(3)
      buf.push(1)
      buf.push(2)
      expect(buf.peekAt(2)).toBeUndefined()
    })

    it('works correctly after wrap-around', () => {
      const buf = new RingBuffer5<number>(3)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.dequeue()
      buf.push(4)
      expect(buf.peekAt(0)).toBe(2)
      expect(buf.peekAt(1)).toBe(3)
      expect(buf.peekAt(2)).toBe(4)
    })
  })

  // ─── forEach() ───
  describe('forEach', () => {
    it('iterates over all elements with indices', () => {
      const buf = new RingBuffer5<number>(5)
      buf.push(10)
      buf.push(20)
      buf.push(30)
      const results: number[] = []
      buf.forEach((v, i) => { results.push(v + i) })
      expect(results).toEqual([10, 21, 32])
    })

    it('does not call callback for empty buffer', () => {
      const buf = new RingBuffer5<number>(5)
      let count = 0
      buf.forEach(() => { count++ })
      expect(count).toBe(0)
    })
  })

  // ─── filter() ───
  describe('filter', () => {
    it('returns filtered elements', () => {
      const buf = new RingBuffer5<number>(5)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.push(4)
      expect(buf.filter((v) => v % 2 === 0)).toEqual([2, 4])
    })

    it('returns empty array when nothing matches', () => {
      const buf = new RingBuffer5<number>(3)
      buf.push(1)
      buf.push(3)
      expect(buf.filter((v) => v % 2 === 0)).toEqual([])
    })

    it('returns empty array for empty buffer', () => {
      const buf = new RingBuffer5<number>(3)
      expect(buf.filter(() => true)).toEqual([])
    })
  })

  // ─── map() ───
  describe('map', () => {
    it('transforms elements', () => {
      const buf = new RingBuffer5<number>(3)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.map((v) => v * 10)).toEqual([10, 20, 30])
    })

    it('returns empty array for empty buffer', () => {
      const buf = new RingBuffer5<number>(3)
      expect(buf.map((v) => v)).toEqual([])
    })

    it('can map to different type', () => {
      const buf = new RingBuffer5<number>(3)
      buf.push(1)
      buf.push(2)
      expect(buf.map((v) => String(v))).toEqual(['1', '2'])
    })
  })

  // ─── reduce() ───
  describe('reduce', () => {
    it('reduces elements with initial value', () => {
      const buf = new RingBuffer5<number>(3)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.reduce((acc, v) => acc + v, 0)).toBe(6)
    })

    it('returns initial value for empty buffer', () => {
      const buf = new RingBuffer5<number>(3)
      expect(buf.reduce((acc, v) => acc + v, 42)).toBe(42)
    })
  })

  // ─── toArray() ───
  describe('toArray', () => {
    it('returns elements in FIFO order', () => {
      const buf = new RingBuffer5<number>(5)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.toArray()).toEqual([1, 2, 3])
    })

    it('returns empty array for empty buffer', () => {
      const buf = new RingBuffer5<number>(5)
      expect(buf.toArray()).toEqual([])
    })

    it('handles wrap-around correctly', () => {
      const buf = new RingBuffer5<number>(3)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.dequeue()
      buf.push(4)
      expect(buf.toArray()).toEqual([2, 3, 4])
    })
  })

  // ─── slice() ───
  describe('slice', () => {
    it('returns elements from start to end', () => {
      const buf = new RingBuffer5<number>(5)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.push(4)
      expect(buf.slice(1, 3)).toEqual([2, 3])
    })

    it('returns elements from start to end of buffer when end omitted', () => {
      const buf = new RingBuffer5<number>(5)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.slice(1)).toEqual([2, 3])
    })

    it('returns full array when start and end omitted', () => {
      const buf = new RingBuffer5<number>(5)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.slice()).toEqual([1, 2, 3])
    })

    it('returns empty for out-of-range start', () => {
      const buf = new RingBuffer5<number>(5)
      buf.push(1)
      expect(buf.slice(5)).toEqual([])
    })

    it('clamps negative start to 0', () => {
      const buf = new RingBuffer5<number>(5)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.slice(-1)).toEqual([1, 2, 3])
    })

    it('clamps end to size', () => {
      const buf = new RingBuffer5<number>(3)
      buf.push(1)
      buf.push(2)
      expect(buf.slice(0, 100)).toEqual([1, 2])
    })

    it('returns empty when end <= start', () => {
      const buf = new RingBuffer5<number>(5)
      buf.push(1)
      buf.push(2)
      expect(buf.slice(1, 1)).toEqual([])
      expect(buf.slice(2, 1)).toEqual([])
    })
  })

  // ─── clear() ───
  describe('clear', () => {
    it('removes all elements', () => {
      const buf = new RingBuffer5<number>(3)
      buf.push(1)
      buf.push(2)
      buf.clear()
      expect(buf.size).toBe(0)
      expect(buf.isEmpty).toBe(true)
      expect(buf.available).toBe(3)
    })

    it('is safe to call on empty buffer', () => {
      const buf = new RingBuffer5<number>(3)
      buf.clear()
      expect(buf.size).toBe(0)
    })

    it('allows pushing after clear', () => {
      const buf = new RingBuffer5<number>(2)
      buf.push(1)
      buf.push(2)
      buf.clear()
      expect(buf.push(3)).toBe(true)
      expect(buf.peek()).toBe(3)
    })
  })

  // ─── getTimeComplexity() ───
  describe('getTimeComplexity', () => {
    it('returns O(1) for push', () => {
      const buf = new RingBuffer5<number>(3)
      expect(buf.getTimeComplexity('push')).toBe('O(1)')
    })

    it('returns O(1) for pop', () => {
      const buf = new RingBuffer5<number>(3)
      expect(buf.getTimeComplexity('pop')).toBe('O(1)')
    })

    it('returns O(n) for toArray', () => {
      const buf = new RingBuffer5<number>(3)
      expect(buf.getTimeComplexity('toArray')).toBe('O(n)')
    })

    it('returns O(1) for peek', () => {
      const buf = new RingBuffer5<number>(3)
      expect(buf.getTimeComplexity('peek')).toBe('O(1)')
    })

    it('returns Unknown for unrecognized operation', () => {
      const buf = new RingBuffer5<number>(3)
      expect(buf.getTimeComplexity('nonexistent')).toBe('Unknown')
    })
  })

  // ─── Edge Cases ───
  describe('edge cases', () => {
    it('works with string elements', () => {
      const buf = new RingBuffer5<string>(3)
      buf.push('a')
      buf.push('b')
      buf.push('c')
      expect(buf.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('works with null elements', () => {
      const buf = new RingBuffer5<null>(2)
      buf.push(null)
      buf.push(null)
      expect(buf.size).toBe(2)
      expect(buf.pop()).toBeNull()
    })

    it('handles mixed push and pop operations', () => {
      const buf = new RingBuffer5<number>(3)
      buf.push(1)
      buf.push(2)
      buf.pop()
      buf.push(3)
      buf.push(4)
      expect(buf.toArray()).toEqual([1, 3, 4])
    })

    it('handles mixed push and dequeue operations', () => {
      const buf = new RingBuffer5<number>(3)
      buf.push(1)
      buf.push(2)
      buf.dequeue()
      buf.push(3)
      buf.push(4)
      expect(buf.toArray()).toEqual([2, 3, 4])
    })

    it('handles duplicate values', () => {
      const buf = new RingBuffer5<number>(5)
      buf.push(1)
      buf.push(1)
      buf.push(2)
      buf.push(1)
      expect(buf.toArray()).toEqual([1, 1, 2, 1])
    })

    it('handles negative numbers', () => {
      const buf = new RingBuffer5<number>(3)
      buf.push(-1)
      buf.push(-2)
      buf.push(-3)
      expect(buf.toArray()).toEqual([-1, -2, -3])
      expect(buf.reduce((acc, v) => acc + v, 0)).toBe(-6)
    })

    it('handles wrap-around with multiple cycles', () => {
      const buf = new RingBuffer5<number>(3)
      for (let cycle = 0; cycle < 5; cycle++) {
        buf.dequeue()
        buf.dequeue()
        buf.dequeue()
        buf.push(cycle * 3 + 7)
        buf.push(cycle * 3 + 8)
        buf.push(cycle * 3 + 9)
      }
      expect(buf.size).toBe(3)
      expect(buf.toArray()).toEqual([19, 20, 21])
    })
  })
})
