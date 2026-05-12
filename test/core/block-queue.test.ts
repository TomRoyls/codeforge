import { describe, it, expect } from 'vitest'
import { BlockQueue } from '../../src/core/block-queue/index.js'

describe('BlockQueue', () => {
  describe('constructor', () => {
    it('creates empty queue with default options', () => {
      const q = new BlockQueue<number>(3)
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('creates queue with capacity', () => {
      const q = new BlockQueue<number>(3, { capacity: 10 })
      expect(q.size).toBe(0)
      expect(q.remainingCapacity()).toBe(10)
    })

    it('throws on blockSize < 1', () => {
      expect(() => new BlockQueue<number>(0)).toThrow(RangeError)
    })

    it('throws on negative blockSize', () => {
      expect(() => new BlockQueue<number>(-1)).toThrow(RangeError)
    })

    it('throws on capacity < 1', () => {
      expect(() => new BlockQueue<number>(3, { capacity: 0 })).toThrow(RangeError)
    })

    it('throws on negative capacity', () => {
      expect(() => new BlockQueue<number>(3, { capacity: -5 })).toThrow(RangeError)
    })

    it('accepts blockSize of 1', () => {
      const q = new BlockQueue<number>(1)
      expect(q.size).toBe(0)
    })

    it('accepts large blockSize', () => {
      const q = new BlockQueue<number>(10000)
      expect(q.size).toBe(0)
    })

    it('accepts capacity equal to 1', () => {
      const q = new BlockQueue<number>(2, { capacity: 1 })
      expect(q.remainingCapacity()).toBe(1)
    })

    it('works with string type', () => {
      const q = new BlockQueue<string>(2)
      q.enqueue('a')
      expect(q.size).toBe(1)
    })

    it('works with object type', () => {
      const q = new BlockQueue<{ id: number }>(2)
      q.enqueue({ id: 1 })
      expect(q.size).toBe(1)
    })
  })

  describe('enqueue', () => {
    it('adds a single element', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(1)
      expect(q.size).toBe(1)
      expect(q.isEmpty()).toBe(false)
    })

    it('adds multiple elements', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.size).toBe(3)
    })

    it('adds beyond block size', () => {
      const q = new BlockQueue<number>(2)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.size).toBe(4)
    })

    it('throws when exceeding capacity', () => {
      const q = new BlockQueue<number>(2, { capacity: 3 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(() => q.enqueue(4)).toThrow(RangeError)
    })

    it('throws when capacity is 1 and already full', () => {
      const q = new BlockQueue<number>(2, { capacity: 1 })
      q.enqueue(1)
      expect(() => q.enqueue(2)).toThrow(RangeError)
    })

    it('allows enqueue after dequeueBlock frees space', () => {
      const q = new BlockQueue<number>(2, { capacity: 3 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeueBlock()
      expect(() => q.enqueue(4)).not.toThrow()
      expect(q.size).toBe(2)
    })

    it('preserves order', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      expect(q.toArray()).toEqual([10, 20, 30])
    })

    it('allows undefined values', () => {
      const q = new BlockQueue<number | undefined>(2)
      q.enqueue(undefined)
      q.enqueue(1)
      expect(q.size).toBe(2)
    })

    it('allows null values', () => {
      const q = new BlockQueue<string | null>(2)
      q.enqueue(null)
      q.enqueue('a')
      expect(q.size).toBe(2)
    })

    it('handles many enqueues', () => {
      const q = new BlockQueue<number>(10)
      for (let i = 0; i < 1000; i++) {
        q.enqueue(i)
      }
      expect(q.size).toBe(1000)
    })

    it('handles enqueue after clear', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      q.enqueue(3)
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(3)
    })

    it('handles enqueue with capacity exactly at limit', () => {
      const q = new BlockQueue<number>(2, { capacity: 4 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.isFull()).toBe(true)
      expect(() => q.enqueue(5)).toThrow(RangeError)
    })
  })

  describe('dequeueBlock', () => {
    it('returns empty array when queue is empty', () => {
      const q = new BlockQueue<number>(3)
      expect(q.dequeueBlock()).toEqual([])
    })

    it('returns full block when enough elements', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.dequeueBlock()).toEqual([1, 2, 3])
      expect(q.size).toBe(1)
    })

    it('returns partial block when fewer elements than blockSize', () => {
      const q = new BlockQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.dequeueBlock()).toEqual([1, 2])
      expect(q.size).toBe(0)
    })

    it('dequeues all elements in sequence', () => {
      const q = new BlockQueue<number>(2)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.dequeueBlock()).toEqual([1, 2])
      expect(q.dequeueBlock()).toEqual([3, 4])
      expect(q.dequeueBlock()).toEqual([])
    })

    it('handles blockSize of 1', () => {
      const q = new BlockQueue<number>(1)
      q.enqueue(10)
      q.enqueue(20)
      expect(q.dequeueBlock()).toEqual([10])
      expect(q.dequeueBlock()).toEqual([20])
      expect(q.dequeueBlock()).toEqual([])
    })

    it('handles single element with large block size', () => {
      const q = new BlockQueue<number>(100)
      q.enqueue(42)
      expect(q.dequeueBlock()).toEqual([42])
      expect(q.size).toBe(0)
    })

    it('dequeues multiple partial blocks', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.dequeueBlock()).toEqual([1, 2])
      q.enqueue(3)
      q.enqueue(4)
      expect(q.dequeueBlock()).toEqual([3, 4])
      expect(q.dequeueBlock()).toEqual([])
    })

    it('drains entire queue', () => {
      const q = new BlockQueue<number>(3)
      for (let i = 0; i < 10; i++) {
        q.enqueue(i)
      }
      q.dequeueBlock()
      q.dequeueBlock()
      q.dequeueBlock()
      const last = q.dequeueBlock()
      expect(last).toEqual([9])
      expect(q.size).toBe(0)
    })

    it('works with strings', () => {
      const q = new BlockQueue<string>(2)
      q.enqueue('a')
      q.enqueue('b')
      q.enqueue('c')
      expect(q.dequeueBlock()).toEqual(['a', 'b'])
    })

    it('works with objects', () => {
      const q = new BlockQueue<{ x: number }>(2)
      q.enqueue({ x: 1 })
      q.enqueue({ x: 2 })
      const block = q.dequeueBlock()
      expect(block).toEqual([{ x: 1 }, { x: 2 }])
    })

    it('does not affect peek after partial dequeue', () => {
      const q = new BlockQueue<number>(2)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeueBlock()
      expect(q.peek()).toBe(3)
    })

    it('handles enqueue after dequeueBlock with capacity', () => {
      const q = new BlockQueue<number>(2, { capacity: 4 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.dequeueBlock()
      q.enqueue(5)
      q.enqueue(6)
      expect(q.toArray()).toEqual([3, 4, 5, 6])
    })
  })

  describe('peek', () => {
    it('returns undefined on empty queue', () => {
      const q = new BlockQueue<number>(3)
      expect(q.peek()).toBeUndefined()
    })

    it('returns first element without removing', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.peek()).toBe(1)
      expect(q.size).toBe(2)
    })

    it('returns same element on multiple calls', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(42)
      expect(q.peek()).toBe(42)
      expect(q.peek()).toBe(42)
      expect(q.peek()).toBe(42)
    })

    it('returns undefined after dequeueBlock empties queue', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.dequeueBlock()
      expect(q.peek()).toBeUndefined()
    })

    it('updates after dequeueBlock', () => {
      const q = new BlockQueue<number>(2)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeueBlock()
      expect(q.peek()).toBe(3)
    })

    it('returns first after clear and re-enqueue', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(1)
      q.clear()
      q.enqueue(99)
      expect(q.peek()).toBe(99)
    })

    it('works with string type', () => {
      const q = new BlockQueue<string>(2)
      q.enqueue('hello')
      expect(q.peek()).toBe('hello')
    })
  })

  describe('peekBlock', () => {
    it('returns empty array on empty queue', () => {
      const q = new BlockQueue<number>(3)
      expect(q.peekBlock()).toEqual([])
    })

    it('returns full block without removing', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.peekBlock()).toEqual([1, 2, 3])
      expect(q.size).toBe(3)
    })

    it('returns partial block when fewer elements', () => {
      const q = new BlockQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.peekBlock()).toEqual([1, 2])
    })

    it('does not modify queue', () => {
      const q = new BlockQueue<number>(2)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const peeked = q.peekBlock()
      expect(peeked).toEqual([1, 2])
      expect(q.size).toBe(3)
      expect(q.peekBlock()).toEqual([1, 2])
    })

    it('returns only up to blockSize', () => {
      const q = new BlockQueue<number>(2)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.peekBlock()).toEqual([1, 2])
    })

    it('handles blockSize of 1', () => {
      const q = new BlockQueue<number>(1)
      q.enqueue(10)
      q.enqueue(20)
      expect(q.peekBlock()).toEqual([10])
    })

    it('returns single element', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(42)
      expect(q.peekBlock()).toEqual([42])
    })

    it('returns copy not reference', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      const peeked = q.peekBlock()
      peeked.push(999)
      expect(q.peekBlock()).toEqual([1, 2])
    })

    it('reflects changes after enqueue', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(1)
      expect(q.peekBlock()).toEqual([1])
      q.enqueue(2)
      expect(q.peekBlock()).toEqual([1, 2])
      q.enqueue(3)
      expect(q.peekBlock()).toEqual([1, 2, 3])
    })
  })

  describe('size', () => {
    it('returns 0 for empty queue', () => {
      const q = new BlockQueue<number>(3)
      expect(q.size).toBe(0)
    })

    it('returns correct size after enqueues', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.size).toBe(2)
    })

    it('decreases after dequeueBlock', () => {
      const q = new BlockQueue<number>(2)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeueBlock()
      expect(q.size).toBe(1)
    })

    it('resets to 0 after clear', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      expect(q.size).toBe(0)
    })

    it('reflects large number of elements', () => {
      const q = new BlockQueue<number>(10)
      for (let i = 0; i < 500; i++) {
        q.enqueue(i)
      }
      expect(q.size).toBe(500)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new queue', () => {
      const q = new BlockQueue<number>(3)
      expect(q.isEmpty()).toBe(true)
    })

    it('returns false after enqueue', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(1)
      expect(q.isEmpty()).toBe(false)
    })

    it('returns true after all elements dequeued', () => {
      const q = new BlockQueue<number>(2)
      q.enqueue(1)
      q.enqueue(2)
      q.dequeueBlock()
      expect(q.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.clear()
      expect(q.isEmpty()).toBe(true)
    })

    it('returns false with partial block remaining', () => {
      const q = new BlockQueue<number>(2)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeueBlock()
      expect(q.isEmpty()).toBe(false)
    })

    it('returns true after dequeueBlock on empty', () => {
      const q = new BlockQueue<number>(3)
      q.dequeueBlock()
      expect(q.isEmpty()).toBe(true)
    })
  })

  describe('isFull', () => {
    it('returns false when no capacity set', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.isFull()).toBe(false)
    })

    it('returns false when under capacity', () => {
      const q = new BlockQueue<number>(3, { capacity: 10 })
      q.enqueue(1)
      expect(q.isFull()).toBe(false)
    })

    it('returns true when at capacity', () => {
      const q = new BlockQueue<number>(2, { capacity: 3 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.isFull()).toBe(true)
    })

    it('returns false when empty with capacity', () => {
      const q = new BlockQueue<number>(2, { capacity: 5 })
      expect(q.isFull()).toBe(false)
    })

    it('updates after dequeueBlock', () => {
      const q = new BlockQueue<number>(2, { capacity: 4 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.isFull()).toBe(true)
      q.dequeueBlock()
      expect(q.isFull()).toBe(false)
    })

    it('updates after clear', () => {
      const q = new BlockQueue<number>(2, { capacity: 2 })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.isFull()).toBe(true)
      q.clear()
      expect(q.isFull()).toBe(false)
    })

    it('returns false for unbounded queue with many elements', () => {
      const q = new BlockQueue<number>(10)
      for (let i = 0; i < 1000; i++) {
        q.enqueue(i)
      }
      expect(q.isFull()).toBe(false)
    })

    it('works with capacity of 1', () => {
      const q = new BlockQueue<number>(2, { capacity: 1 })
      expect(q.isFull()).toBe(false)
      q.enqueue(1)
      expect(q.isFull()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears empty queue without error', () => {
      const q = new BlockQueue<number>(3)
      q.clear()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('clears queue with elements', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.clear()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('allows enqueue after clear', () => {
      const q = new BlockQueue<number>(3, { capacity: 5 })
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      q.enqueue(3)
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(3)
    })

    it('resets remainingCapacity with bounded queue', () => {
      const q = new BlockQueue<number>(2, { capacity: 4 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.clear()
      expect(q.remainingCapacity()).toBe(4)
    })

    it('clear allows re-fill to capacity', () => {
      const q = new BlockQueue<number>(2, { capacity: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      q.enqueue(3)
      q.enqueue(4)
      expect(q.isFull()).toBe(true)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty queue', () => {
      const q = new BlockQueue<number>(3)
      expect(q.toArray()).toEqual([])
    })

    it('returns all elements in order', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('returns a copy', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      const arr = q.toArray()
      arr.push(999)
      expect(q.size).toBe(2)
    })

    it('reflects state after dequeueBlock', () => {
      const q = new BlockQueue<number>(2)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.dequeueBlock()
      expect(q.toArray()).toEqual([3, 4])
    })

    it('reflects state after clear', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      expect(q.toArray()).toEqual([])
    })

    it('works with strings', () => {
      const q = new BlockQueue<string>(2)
      q.enqueue('x')
      q.enqueue('y')
      q.enqueue('z')
      expect(q.toArray()).toEqual(['x', 'y', 'z'])
    })

    it('works with mixed types', () => {
      const q = new BlockQueue<number | string>(3)
      q.enqueue(1)
      q.enqueue('two')
      q.enqueue(3)
      expect(q.toArray()).toEqual([1, 'two', 3])
    })
  })

  describe('blockCount', () => {
    it('returns 0 for empty queue', () => {
      const q = new BlockQueue<number>(3)
      expect(q.blockCount()).toBe(0)
    })

    it('returns 1 for partial block', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.blockCount()).toBe(1)
    })

    it('returns 1 for exactly full block', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.blockCount()).toBe(1)
    })

    it('returns 2 for one full and one partial', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.blockCount()).toBe(2)
    })

    it('returns correct count for many blocks', () => {
      const q = new BlockQueue<number>(3)
      for (let i = 0; i < 10; i++) {
        q.enqueue(i)
      }
      expect(q.blockCount()).toBe(4)
    })

    it('updates after dequeueBlock', () => {
      const q = new BlockQueue<number>(2)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.blockCount()).toBe(2)
      q.dequeueBlock()
      expect(q.blockCount()).toBe(1)
    })

    it('updates to 0 after clearing all', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeueBlock()
      expect(q.blockCount()).toBe(0)
    })

    it('handles blockSize of 1', () => {
      const q = new BlockQueue<number>(1)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.blockCount()).toBe(3)
    })

    it('handles large blockSize with few elements', () => {
      const q = new BlockQueue<number>(1000)
      q.enqueue(1)
      expect(q.blockCount()).toBe(1)
    })
  })

  describe('currentBlockSize', () => {
    it('returns 0 for empty queue', () => {
      const q = new BlockQueue<number>(3)
      expect(q.currentBlockSize()).toBe(0)
    })

    it('returns partial block size', () => {
      const q = new BlockQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.currentBlockSize()).toBe(2)
    })

    it('returns full blockSize for complete block', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.currentBlockSize()).toBe(3)
    })

    it('returns remainder for partial last block', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.currentBlockSize()).toBe(1)
    })

    it('returns full blockSize when exactly divisible', () => {
      const q = new BlockQueue<number>(2)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.currentBlockSize()).toBe(2)
    })

    it('returns 1 for single element with any blockSize', () => {
      const q = new BlockQueue<number>(10)
      q.enqueue(42)
      expect(q.currentBlockSize()).toBe(1)
    })

    it('updates after dequeueBlock', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.currentBlockSize()).toBe(1)
      q.dequeueBlock()
      expect(q.currentBlockSize()).toBe(1)
    })

    it('returns 0 after all dequeued', () => {
      const q = new BlockQueue<number>(2)
      q.enqueue(1)
      q.enqueue(2)
      q.dequeueBlock()
      expect(q.currentBlockSize()).toBe(0)
    })

    it('handles blockSize of 1', () => {
      const q = new BlockQueue<number>(1)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.currentBlockSize()).toBe(1)
    })
  })

  describe('remainingCapacity', () => {
    it('returns Infinity for unbounded queue', () => {
      const q = new BlockQueue<number>(3)
      expect(q.remainingCapacity()).toBe(Infinity)
    })

    it('returns full capacity when empty', () => {
      const q = new BlockQueue<number>(3, { capacity: 10 })
      expect(q.remainingCapacity()).toBe(10)
    })

    it('decreases after enqueue', () => {
      const q = new BlockQueue<number>(3, { capacity: 5 })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.remainingCapacity()).toBe(3)
    })

    it('returns 0 when full', () => {
      const q = new BlockQueue<number>(2, { capacity: 3 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.remainingCapacity()).toBe(0)
    })

    it('increases after dequeueBlock', () => {
      const q = new BlockQueue<number>(2, { capacity: 4 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.dequeueBlock()
      expect(q.remainingCapacity()).toBe(2)
    })

    it('resets after clear', () => {
      const q = new BlockQueue<number>(2, { capacity: 5 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.clear()
      expect(q.remainingCapacity()).toBe(5)
    })

    it('returns 0 when over-dequeued then refilled', () => {
      const q = new BlockQueue<number>(2, { capacity: 2 })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.remainingCapacity()).toBe(0)
    })

    it('stays Infinity for unbounded with many elements', () => {
      const q = new BlockQueue<number>(10)
      for (let i = 0; i < 100; i++) {
        q.enqueue(i)
      }
      expect(q.remainingCapacity()).toBe(Infinity)
    })
  })

  describe('iterator', () => {
    it('iterates over empty queue', () => {
      const q = new BlockQueue<number>(3)
      const result: number[] = []
      for (const item of q) {
        result.push(item)
      }
      expect(result).toEqual([])
    })

    it('iterates over elements in order', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const result: number[] = []
      for (const item of q) {
        result.push(item)
      }
      expect(result).toEqual([1, 2, 3])
    })

    it('spread into array', () => {
      const q = new BlockQueue<number>(2)
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      expect([...q]).toEqual([10, 20, 30])
    })
  })

  describe('static from', () => {
    it('creates queue from array', () => {
      const q = BlockQueue.from([1, 2, 3, 4, 5], 2)
      expect(q.size).toBe(5)
    })

    it('creates queue with capacity', () => {
      const q = BlockQueue.from([1, 2, 3], 2, { capacity: 5 })
      expect(q.size).toBe(3)
      expect(q.remainingCapacity()).toBe(2)
    })

    it('creates from empty array', () => {
      const q = BlockQueue.from([], 3)
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('preserves order', () => {
      const q = BlockQueue.from([10, 20, 30], 2)
      expect(q.toArray()).toEqual([10, 20, 30])
    })

    it('throws if array exceeds capacity', () => {
      expect(() => BlockQueue.from([1, 2, 3], 2, { capacity: 2 })).toThrow(RangeError)
    })

    it('works with strings', () => {
      const q = BlockQueue.from(['a', 'b', 'c'], 2)
      expect(q.dequeueBlock()).toEqual(['a', 'b'])
    })
  })

  describe('edge cases', () => {
    it('handles blockSize equals queue length', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.dequeueBlock()).toEqual([1, 2, 3])
      expect(q.isEmpty()).toBe(true)
    })

    it('handles blockSize larger than queue length', () => {
      const q = new BlockQueue<number>(100)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.dequeueBlock()).toEqual([1, 2])
    })

    it('handles interleaved enqueue and dequeueBlock', () => {
      const q = new BlockQueue<number>(2)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.dequeueBlock()).toEqual([1, 2])
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      expect(q.dequeueBlock()).toEqual([3, 4])
      expect(q.dequeueBlock()).toEqual([5])
    })

    it('handles capacity equals blockSize', () => {
      const q = new BlockQueue<number>(3, { capacity: 3 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.isFull()).toBe(true)
      expect(q.dequeueBlock()).toEqual([1, 2, 3])
      expect(q.isEmpty()).toBe(true)
      q.enqueue(4)
      expect(q.size).toBe(1)
    })

    it('handles large number of dequeueBlock calls', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeueBlock()
      q.dequeueBlock()
      q.dequeueBlock()
      q.dequeueBlock()
      expect(q.size).toBe(0)
    })

    it('handles enqueue dequeue cycle repeatedly', () => {
      const q = new BlockQueue<number>(2)
      for (let cycle = 0; cycle < 100; cycle++) {
        q.enqueue(cycle * 2)
        q.enqueue(cycle * 2 + 1)
        const block = q.dequeueBlock()
        expect(block).toEqual([cycle * 2, cycle * 2 + 1])
      }
      expect(q.isEmpty()).toBe(true)
    })

    it('handles boolean values', () => {
      const q = new BlockQueue<boolean>(2)
      q.enqueue(true)
      q.enqueue(false)
      q.enqueue(true)
      expect(q.dequeueBlock()).toEqual([true, false])
    })

    it('handles array elements', () => {
      const q = new BlockQueue<number[]>(2)
      q.enqueue([1, 2])
      q.enqueue([3, 4])
      expect(q.dequeueBlock()).toEqual([[1, 2], [3, 4]])
    })

    it('handles mixed operations', () => {
      const q = new BlockQueue<number>(3, { capacity: 9 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      expect(q.size).toBe(5)
      expect(q.blockCount()).toBe(2)
      expect(q.currentBlockSize()).toBe(2)
      expect(q.remainingCapacity()).toBe(4)
      expect(q.peek()).toBe(1)
      expect(q.peekBlock()).toEqual([1, 2, 3])
      expect(q.dequeueBlock()).toEqual([1, 2, 3])
      expect(q.size).toBe(2)
      expect(q.blockCount()).toBe(1)
      expect(q.currentBlockSize()).toBe(2)
    })

    it('handles enqueue after partial dequeueBlock', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.dequeueBlock()
      q.enqueue(5)
      q.enqueue(6)
      expect(q.toArray()).toEqual([4, 5, 6])
      expect(q.dequeueBlock()).toEqual([4, 5, 6])
    })

    it('snapshot consistency check', () => {
      const q = new BlockQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      expect(q.size).toBe(5)
      expect(q.blockCount()).toBe(2)
      expect(q.currentBlockSize()).toBe(2)
      expect(q.peek()).toBe(1)
      expect(q.peekBlock()).toEqual([1, 2, 3])
      expect(q.isFull()).toBe(false)
      expect(q.remainingCapacity()).toBe(Infinity)
      expect(q.isEmpty()).toBe(false)
      expect(q.toArray()).toEqual([1, 2, 3, 4, 5])
      const block = q.dequeueBlock()
      expect(block).toEqual([1, 2, 3])
      expect(q.size).toBe(2)
      expect(q.blockCount()).toBe(1)
      expect(q.currentBlockSize()).toBe(2)
      expect(q.peek()).toBe(4)
      expect(q.peekBlock()).toEqual([4, 5])
    })

    it('works with capacity and full cycle', () => {
      const q = new BlockQueue<number>(3, { capacity: 6 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      q.enqueue(6)
      expect(q.isFull()).toBe(true)
      expect(q.dequeueBlock()).toEqual([1, 2, 3])
      expect(q.isFull()).toBe(false)
      expect(q.remainingCapacity()).toBe(3)
      q.enqueue(7)
      q.enqueue(8)
      q.enqueue(9)
      expect(q.isFull()).toBe(true)
      expect(q.toArray()).toEqual([4, 5, 6, 7, 8, 9])
    })
  })
})
