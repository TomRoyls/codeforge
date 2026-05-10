import { describe, it, expect } from 'vitest'
import { ChunkedQueue } from '../../src/core/chunked-queue/chunked-queue.js'
import { DEFAULT_CHUNKED_QUEUE_OPTIONS } from '../../src/core/chunked-queue/types.js'

describe('ChunkedQueue', () => {
  describe('constructor', () => {
    it('creates empty queue with default options', () => {
      const q = new ChunkedQueue<number>()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('accepts options object with chunkSize', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 4 })
      expect(q.size).toBe(0)
    })

    it('accepts empty options object', () => {
      const q = new ChunkedQueue<number>({})
      expect(q.size).toBe(0)
    })

    it('clamps chunkSize to 1 when given 0', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 0 })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.toArray()).toEqual([1, 2])
      expect(q.chunkCount()).toBe(2)
    })

    it('clamps chunkSize to 1 when given negative', () => {
      const q = new ChunkedQueue<number>({ chunkSize: -5 })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.chunkCount()).toBe(2)
    })

    it('floors fractional chunkSize', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 3.7 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.chunkCount()).toBe(1)
      q.enqueue(4)
      expect(q.chunkCount()).toBe(2)
    })

    it('uses DEFAULT_CHUNKED_QUEUE_OPTIONS constant', () => {
      expect(DEFAULT_CHUNKED_QUEUE_OPTIONS.chunkSize).toBe(64)
    })

    it('creates queue with default chunk size when no args', () => {
      const q = new ChunkedQueue<number>()
      for (let i = 0; i < 64; i++) q.enqueue(i)
      expect(q.chunkCount()).toBe(1)
      q.enqueue(64)
      expect(q.chunkCount()).toBe(2)
    })

    it('handles chunkSize of 1', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 1 })
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      expect(q.size).toBe(3)
      expect(q.toArray()).toEqual([10, 20, 30])
      expect(q.chunkCount()).toBe(3)
    })

    it('handles large chunkSize', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 1000 })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.chunkCount()).toBe(1)
      expect(q.capacity()).toBe(1000)
    })
  })

  describe('enqueue', () => {
    it('adds a single element', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 4 })
      q.enqueue(42)
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(42)
    })

    it('adds multiple elements within one chunk', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 4 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.size).toBe(3)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('spills to second chunk when first is full', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 3 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.chunkCount()).toBe(1)
      q.enqueue(4)
      expect(q.chunkCount()).toBe(2)
      expect(q.toArray()).toEqual([1, 2, 3, 4])
    })

    it('creates multiple chunks', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      for (let i = 0; i < 6; i++) q.enqueue(i)
      expect(q.chunkCount()).toBe(3)
      expect(q.toArray()).toEqual([0, 1, 2, 3, 4, 5])
    })

    it('enqueues strings', () => {
      const q = new ChunkedQueue<string>({ chunkSize: 2 })
      q.enqueue('a')
      q.enqueue('b')
      q.enqueue('c')
      expect(q.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('enqueues objects', () => {
      const q = new ChunkedQueue<{ x: number }>({ chunkSize: 2 })
      q.enqueue({ x: 1 })
      q.enqueue({ x: 2 })
      expect(q.size).toBe(2)
    })

    it('enqueues null and undefined values', () => {
      const q = new ChunkedQueue<null>({ chunkSize: 2 })
      q.enqueue(null)
      q.enqueue(null)
      expect(q.size).toBe(2)
    })

    it('enqueues after dequeue wraps correctly', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.dequeue()
      q.enqueue(4)
      expect(q.toArray()).toEqual([3, 4])
    })

    it('updates enqueues statistic', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 4 })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.getStatistics().enqueues).toBe(2)
    })

    it('updates chunksCreated statistic', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      expect(q.getStatistics().chunksCreated).toBe(1)
      q.enqueue(2)
      expect(q.getStatistics().chunksCreated).toBe(1)
      q.enqueue(3)
      expect(q.getStatistics().chunksCreated).toBe(2)
    })

    it('handles enqueue after full cycle of enqueue/dequeue', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      q.dequeue()
      expect(q.size).toBe(0)
      q.enqueue(10)
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(10)
    })
  })

  describe('dequeue', () => {
    it('returns undefined on empty queue', () => {
      const q = new ChunkedQueue<number>()
      expect(q.dequeue()).toBeUndefined()
    })

    it('returns the first element', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 4 })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.dequeue()).toBe(1)
    })

    it('decreases size', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 4 })
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.size).toBe(1)
    })

    it('maintains FIFO order', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 3 })
      for (let i = 0; i < 5; i++) q.enqueue(i)
      for (let i = 0; i < 5; i++) {
        expect(q.dequeue()).toBe(i)
      }
    })

    it('returns undefined after all elements dequeued', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.dequeue()
      expect(q.dequeue()).toBeUndefined()
    })

    it('releases chunks as they are depleted', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.chunkCount()).toBe(2)
      q.dequeue()
      q.dequeue()
      expect(q.chunkCount()).toBe(1)
    })

    it('updates dequeues statistic', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 4 })
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.getStatistics().dequeues).toBe(1)
    })

    it('updates chunksReleased statistic when chunk is depleted', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.dequeue()
      expect(q.getStatistics().chunksReleased).toBe(1)
    })

    it('handles single element dequeue', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 4 })
      q.enqueue(42)
      expect(q.dequeue()).toBe(42)
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('handles chunkSize 1 dequeue', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 1 })
      q.enqueue(10)
      q.enqueue(20)
      expect(q.dequeue()).toBe(10)
      expect(q.dequeue()).toBe(20)
      expect(q.dequeue()).toBeUndefined()
    })

    it('dequeues all elements leaves empty queue', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 3 })
      for (let i = 0; i < 7; i++) q.enqueue(i)
      for (let i = 0; i < 7; i++) q.dequeue()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
      expect(q.chunkCount()).toBe(0)
    })

    it('can enqueue after fully draining', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      q.dequeue()
      q.enqueue(99)
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(99)
    })

    it('interleaved enqueue and dequeue', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.dequeue()).toBe(1)
      q.enqueue(3)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
      expect(q.isEmpty()).toBe(true)
    })
  })

  describe('peek', () => {
    it('returns undefined on empty queue', () => {
      const q = new ChunkedQueue<number>()
      expect(q.peek()).toBeUndefined()
    })

    it('returns first element without removing', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 4 })
      q.enqueue(10)
      expect(q.peek()).toBe(10)
      expect(q.size).toBe(1)
    })

    it('returns same element on repeated calls', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 4 })
      q.enqueue(5)
      expect(q.peek()).toBe(5)
      expect(q.peek()).toBe(5)
      expect(q.peek()).toBe(5)
    })

    it('updates after dequeue', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 4 })
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.peek()).toBe(2)
    })

    it('returns undefined after full drain', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.dequeue()
      expect(q.peek()).toBeUndefined()
    })

    it('peeks across chunk boundary', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.dequeue()
      expect(q.peek()).toBe(3)
    })
  })

  describe('size', () => {
    it('returns 0 for empty queue', () => {
      const q = new ChunkedQueue<number>()
      expect(q.size).toBe(0)
    })

    it('increases with enqueue', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 4 })
      q.enqueue(1)
      expect(q.size).toBe(1)
      q.enqueue(2)
      expect(q.size).toBe(2)
    })

    it('decreases with dequeue', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 4 })
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.size).toBe(1)
    })

    it('stays 0 when dequeue on empty', () => {
      const q = new ChunkedQueue<number>()
      q.dequeue()
      expect(q.size).toBe(0)
    })

    it('resets to 0 after clear', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 4 })
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      expect(q.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new queue', () => {
      const q = new ChunkedQueue<number>()
      expect(q.isEmpty()).toBe(true)
    })

    it('returns false after enqueue', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      expect(q.isEmpty()).toBe(false)
    })

    it('returns true after draining', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.dequeue()
      expect(q.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      q.clear()
      expect(q.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears a non-empty queue', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.clear()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
      expect(q.chunkCount()).toBe(0)
    })

    it('clears an empty queue without error', () => {
      const q = new ChunkedQueue<number>()
      q.clear()
      expect(q.size).toBe(0)
    })

    it('allows enqueue after clear', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.clear()
      q.enqueue(2)
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(2)
    })

    it('allows operations after clear', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      q.enqueue(10)
      q.enqueue(20)
      expect(q.dequeue()).toBe(10)
      expect(q.toArray()).toEqual([20])
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty queue', () => {
      const q = new ChunkedQueue<number>()
      expect(q.toArray()).toEqual([])
    })

    it('returns all elements in order', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 3 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.toArray()).toEqual([1, 2, 3, 4])
    })

    it('returns correct array after partial dequeue', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect(q.toArray()).toEqual([2, 3])
    })

    it('returns correct array across chunk boundaries', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      q.dequeue()
      q.dequeue()
      q.dequeue()
      expect(q.toArray()).toEqual([4, 5])
    })

    it('returns copy not reference', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 4 })
      q.enqueue(1)
      const arr = q.toArray()
      arr.push(2)
      expect(q.size).toBe(1)
    })
  })

  describe('forEach', () => {
    it('does nothing on empty queue', () => {
      const q = new ChunkedQueue<number>()
      const items: number[] = []
      q.forEach((v) => items.push(v))
      expect(items).toEqual([])
    })

    it('iterates all elements in order', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      const items: number[] = []
      q.forEach((v) => items.push(v))
      expect(items).toEqual([10, 20, 30])
    })

    it('provides correct indices', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      const indices: number[] = []
      q.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('iterates correctly after partial dequeue', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      const items: number[] = []
      q.forEach((v) => items.push(v))
      expect(items).toEqual([2, 3])
    })

    it('iterates across multiple chunks', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      for (let i = 0; i < 10; i++) q.enqueue(i)
      const items: number[] = []
      q.forEach((v) => items.push(v))
      expect(items).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  describe('[Symbol.iterator]', () => {
    it('produces empty iterator for empty queue', () => {
      const q = new ChunkedQueue<number>()
      expect([...q]).toEqual([])
    })

    it('iterates all elements', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect([...q]).toEqual([1, 2, 3])
    })

    it('works with for...of', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(10)
      q.enqueue(20)
      const items: number[] = []
      for (const v of q) items.push(v)
      expect(items).toEqual([10, 20])
    })

    it('works with spread after partial dequeue', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect([...q]).toEqual([2, 3])
    })

    it('works with Array.from', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 3 })
      q.enqueue(1)
      q.enqueue(2)
      expect(Array.from(q)).toEqual([1, 2])
    })
  })

  describe('at', () => {
    it('returns undefined for empty queue', () => {
      const q = new ChunkedQueue<number>()
      expect(q.at(0)).toBeUndefined()
    })

    it('returns element at index 0', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 4 })
      q.enqueue(10)
      q.enqueue(20)
      expect(q.at(0)).toBe(10)
    })

    it('returns element at last valid index', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 4 })
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      expect(q.at(2)).toBe(30)
    })

    it('returns undefined for out of bounds index', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 4 })
      q.enqueue(10)
      expect(q.at(1)).toBeUndefined()
    })

    it('returns undefined for negative index', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 4 })
      q.enqueue(10)
      expect(q.at(-1)).toBeUndefined()
    })

    it('returns correct element across chunk boundaries', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.at(0)).toBe(1)
      expect(q.at(1)).toBe(2)
      expect(q.at(2)).toBe(3)
      expect(q.at(3)).toBe(4)
    })

    it('returns correct element after dequeue', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect(q.at(0)).toBe(2)
      expect(q.at(1)).toBe(3)
    })

    it('returns correct element with many chunks', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 3 })
      for (let i = 0; i < 10; i++) q.enqueue(i)
      for (let i = 0; i < 10; i++) {
        expect(q.at(i)).toBe(i)
      }
    })
  })

  describe('chunkCount', () => {
    it('returns 0 for empty queue', () => {
      const q = new ChunkedQueue<number>()
      expect(q.chunkCount()).toBe(0)
    })

    it('returns 1 after first enqueue', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 4 })
      q.enqueue(1)
      expect(q.chunkCount()).toBe(1)
    })

    it('increases when new chunk needed', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.chunkCount()).toBe(1)
      q.enqueue(3)
      expect(q.chunkCount()).toBe(2)
    })

    it('decreases when chunks released by dequeue', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.chunkCount()).toBe(2)
      q.dequeue()
      q.dequeue()
      expect(q.chunkCount()).toBe(1)
    })

    it('returns 0 after fully drained', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      q.dequeue()
      expect(q.chunkCount()).toBe(0)
    })
  })

  describe('capacity', () => {
    it('returns 0 for empty queue', () => {
      const q = new ChunkedQueue<number>()
      expect(q.capacity()).toBe(0)
    })

    it('returns chunkSize for single element', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 8 })
      q.enqueue(1)
      expect(q.capacity()).toBe(8)
    })

    it('returns 2 * chunkSize for two chunks', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 3 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.capacity()).toBe(6)
    })

    it('decreases when chunks released', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.dequeue()
      q.dequeue()
      expect(q.capacity()).toBe(2)
    })
  })

  describe('compact', () => {
    it('does nothing on empty queue', () => {
      const q = new ChunkedQueue<number>()
      q.compact()
      expect(q.size).toBe(0)
      expect(q.getStatistics().compactions).toBe(0)
    })

    it('compacts after partial dequeue', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.dequeue()
      q.dequeue()
      q.compact()
      expect(q.toArray()).toEqual([3, 4])
      expect(q.chunkCount()).toBe(1)
    })

    it('increments compactions statistic', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.compact()
      expect(q.getStatistics().compactions).toBe(1)
    })

    it('does not increment compactions when no-op', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 4 })
      q.enqueue(1)
      q.enqueue(2)
      q.compact()
      expect(q.getStatistics().compactions).toBe(0)
    })

    it('maintains correct iteration after compact', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.compact()
      expect([...q]).toEqual([2, 3])
    })

    it('maintains correct at after compact', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      q.dequeue()
      q.compact()
      expect(q.at(0)).toBe(20)
      expect(q.at(1)).toBe(30)
    })

    it('allows continued enqueue after compact', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.compact()
      q.enqueue(4)
      expect(q.toArray()).toEqual([2, 3, 4])
    })
  })

  describe('getStatistics', () => {
    it('returns initial statistics', () => {
      const q = new ChunkedQueue<number>()
      const stats = q.getStatistics()
      expect(stats.enqueues).toBe(0)
      expect(stats.dequeues).toBe(0)
      expect(stats.chunksCreated).toBe(0)
      expect(stats.chunksReleased).toBe(0)
      expect(stats.compactions).toBe(0)
    })

    it('tracks enqueues', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 4 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.getStatistics().enqueues).toBe(3)
    })

    it('tracks dequeues', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 4 })
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      q.dequeue()
      expect(q.getStatistics().dequeues).toBe(2)
    })

    it('tracks chunksCreated', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.getStatistics().chunksCreated).toBe(2)
    })

    it('tracks chunksReleased', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.dequeue()
      expect(q.getStatistics().chunksReleased).toBe(1)
    })

    it('tracks compactions', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.compact()
      expect(q.getStatistics().compactions).toBe(1)
    })

    it('returns a copy of statistics', () => {
      const q = new ChunkedQueue<number>()
      const stats1 = q.getStatistics()
      const stats2 = q.getStatistics()
      expect(stats1).not.toBe(stats2)
      expect(stats1).toEqual(stats2)
    })

    it('comprehensive statistics tracking', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      q.dequeue()
      q.dequeue()
      q.dequeue()
      q.compact()
      const stats = q.getStatistics()
      expect(stats.dequeues).toBe(3)
      expect(stats.chunksCreated).toBeGreaterThanOrEqual(3)
      expect(stats.chunksReleased).toBeGreaterThanOrEqual(1)
      expect(stats.compactions).toBe(1)
    })
  })

  describe('type generics', () => {
    it('works with string type', () => {
      const q = new ChunkedQueue<string>({ chunkSize: 2 })
      q.enqueue('hello')
      q.enqueue('world')
      expect(q.dequeue()).toBe('hello')
    })

    it('works with object type', () => {
      const q = new ChunkedQueue<{ id: number }>({ chunkSize: 2 })
      q.enqueue({ id: 1 })
      q.enqueue({ id: 2 })
      expect(q.dequeue()!.id).toBe(1)
    })

    it('works with array type', () => {
      const q = new ChunkedQueue<number[]>({ chunkSize: 2 })
      q.enqueue([1, 2])
      q.enqueue([3, 4])
      expect(q.dequeue()).toEqual([1, 2])
    })

    it('works with default unknown type', () => {
      const q = new ChunkedQueue()
      q.enqueue(42)
      q.enqueue('test')
      expect(q.size).toBe(2)
    })
  })

  describe('stress tests', () => {
    it('handles many enqueues and dequeues', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 8 })
      for (let i = 0; i < 1000; i++) q.enqueue(i)
      expect(q.size).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(q.dequeue()).toBe(i)
      }
      expect(q.isEmpty()).toBe(true)
    })

    it('handles interleaved enqueue/dequeue', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 4 })
      for (let i = 0; i < 100; i++) {
        q.enqueue(i)
        if (i % 2 === 0) q.dequeue()
      }
      expect(q.size).toBe(50)
    })

    it('handles enqueue after full drain repeatedly', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      for (let round = 0; round < 10; round++) {
        q.enqueue(round * 10)
        q.enqueue(round * 10 + 1)
        expect(q.dequeue()).toBe(round * 10)
        expect(q.dequeue()).toBe(round * 10 + 1)
        expect(q.isEmpty()).toBe(true)
      }
    })

    it('toArray is consistent after many operations', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 3 })
      const expected: number[] = []
      for (let i = 0; i < 20; i++) {
        q.enqueue(i)
        expected.push(i)
      }
      for (let i = 0; i < 5; i++) {
        q.dequeue()
        expected.shift()
      }
      expect(q.toArray()).toEqual(expected)
    })

    it('at is consistent with toArray', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 3 })
      for (let i = 0; i < 15; i++) q.enqueue(i)
      for (let i = 0; i < 3; i++) q.dequeue()
      const arr = q.toArray()
      for (let i = 0; i < arr.length; i++) {
        expect(q.at(i)).toBe(arr[i])
      }
    })

    it('forEach matches toArray', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 4 })
      for (let i = 0; i < 20; i++) q.enqueue(i)
      for (let i = 0; i < 10; i++) q.dequeue()
      const fromForEach: number[] = []
      q.forEach((v) => fromForEach.push(v))
      expect(fromForEach).toEqual(q.toArray())
    })

    it('iterator matches toArray', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 5 })
      for (let i = 0; i < 25; i++) q.enqueue(i)
      for (let i = 0; i < 12; i++) q.dequeue()
      expect([...q]).toEqual(q.toArray())
    })
  })

  describe('edge cases', () => {
    it('dequeue on empty does not corrupt state', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.dequeue()
      q.dequeue()
      q.enqueue(1)
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(1)
    })

    it('at on empty returns undefined', () => {
      const q = new ChunkedQueue<number>()
      expect(q.at(0)).toBeUndefined()
      expect(q.at(100)).toBeUndefined()
      expect(q.at(-1)).toBeUndefined()
    })

    it('clear does not affect statistics', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      const statsBefore = q.getStatistics()
      q.clear()
      const statsAfter = q.getStatistics()
      expect(statsAfter.enqueues).toBe(statsBefore.enqueues)
      expect(statsAfter.dequeues).toBe(statsBefore.dequeues)
    })

    it('chunkSize 1 stress', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 1 })
      for (let i = 0; i < 50; i++) q.enqueue(i)
      expect(q.chunkCount()).toBe(50)
      for (let i = 0; i < 50; i++) {
        expect(q.dequeue()).toBe(i)
      }
      expect(q.chunkCount()).toBe(0)
    })

    it('compaction with single element', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 4 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.dequeue()
      q.compact()
      expect(q.toArray()).toEqual([3])
      expect(q.chunkCount()).toBe(1)
    })

    it('capacity tracks correctly after operations', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 3 })
      expect(q.capacity()).toBe(0)
      q.enqueue(1)
      expect(q.capacity()).toBe(3)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.capacity()).toBe(6)
      q.dequeue()
      q.dequeue()
      q.dequeue()
      expect(q.capacity()).toBe(3)
    })

    it('compact when already compact', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 4 })
      q.enqueue(1)
      q.enqueue(2)
      q.compact()
      expect(q.getStatistics().compactions).toBe(0)
    })

    it('re-enqueue after full drain multiple times', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      for (let cycle = 0; cycle < 5; cycle++) {
        q.enqueue(cycle)
        q.dequeue()
      }
      q.enqueue(999)
      expect(q.peek()).toBe(999)
      expect(q.size).toBe(1)
    })

    it('peek does not affect iterator', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.peek()
      expect([...q]).toEqual([1, 2])
    })
  })
})
