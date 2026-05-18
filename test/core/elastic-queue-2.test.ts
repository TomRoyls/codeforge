import { describe, it, expect } from 'vitest'
import { ElasticQueue2 } from '../../src/core/elastic-queue-2/index.js'

describe('ElasticQueue2', () => {
  // ─── Constructor ───

  describe('constructor', () => {
    it('creates an empty queue with no options', () => {
      const q = new ElasticQueue2<number>()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('creates a queue with undefined options', () => {
      const q = new ElasticQueue2<number>(undefined)
      expect(q.size).toBe(0)
    })

    it('creates a queue with maxSize option', () => {
      const q = new ElasticQueue2<number>({ maxSize: 5 })
      expect(q.capacity()).toBe(5)
    })

    it('creates a queue with only minSize option', () => {
      const q = new ElasticQueue2<number>({ minSize: 2 })
      expect(q.capacity()).toBeUndefined()
    })

    it('creates a queue with both minSize and maxSize', () => {
      const q = new ElasticQueue2<number>({ minSize: 2, maxSize: 10 })
      expect(q.capacity()).toBe(10)
    })
  })

  // ─── Enqueue ───

  describe('enqueue', () => {
    it('adds an item to an unbounded queue', () => {
      const q = new ElasticQueue2<number>()
      q.enqueue(1)
      expect(q.size).toBe(1)
    })

    it('adds multiple items preserving order', () => {
      const q = new ElasticQueue2<number>()
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      expect(q.size).toBe(3)
      expect(q.peek()).toBe(10)
    })

    it('adds items up to maxSize boundary', () => {
      const q = new ElasticQueue2<number>({ maxSize: 3 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.size).toBe(3)
      expect(q.isFull()).toBe(true)
    })

    it('throws when exceeding maxSize', () => {
      const q = new ElasticQueue2<number>({ maxSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      expect(() => q.enqueue(3)).toThrow('Queue is full')
    })

    it('handles string items', () => {
      const q = new ElasticQueue2<string>()
      q.enqueue('a')
      q.enqueue('b')
      expect(q.size).toBe(2)
      expect(q.peek()).toBe('a')
    })

    it('handles object items', () => {
      const q = new ElasticQueue2<{ id: number }>()
      q.enqueue({ id: 1 })
      q.enqueue({ id: 2 })
      expect(q.size).toBe(2)
    })

    it('allows enqueue after dequeue frees space in bounded queue', () => {
      const q = new ElasticQueue2<number>({ maxSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(() => q.enqueue(3)).not.toThrow()
      expect(q.size).toBe(2)
    })
  })

  // ─── Dequeue ───

  describe('dequeue', () => {
    it('returns undefined from empty queue', () => {
      const q = new ElasticQueue2<number>()
      expect(q.dequeue()).toBeUndefined()
    })

    it('returns first enqueued item (FIFO)', () => {
      const q = new ElasticQueue2<number>()
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      expect(q.dequeue()).toBe(10)
      expect(q.dequeue()).toBe(20)
      expect(q.dequeue()).toBe(30)
    })

    it('decreases size after dequeue', () => {
      const q = new ElasticQueue2<number>()
      q.enqueue(1)
      q.enqueue(2)
      expect(q.size).toBe(2)
      q.dequeue()
      expect(q.size).toBe(1)
      q.dequeue()
      expect(q.size).toBe(0)
    })

    it('returns undefined after all items dequeued', () => {
      const q = new ElasticQueue2<number>()
      q.enqueue(1)
      q.dequeue()
      expect(q.dequeue()).toBeUndefined()
    })

    it('maintains FIFO order with single element', () => {
      const q = new ElasticQueue2<number>()
      q.enqueue(42)
      expect(q.dequeue()).toBe(42)
    })
  })

  // ─── Peek ───

  describe('peek', () => {
    it('returns undefined on empty queue', () => {
      const q = new ElasticQueue2<number>()
      expect(q.peek()).toBeUndefined()
    })

    it('returns front item without removing it', () => {
      const q = new ElasticQueue2<number>()
      q.enqueue(1)
      q.enqueue(2)
      expect(q.peek()).toBe(1)
      expect(q.size).toBe(2)
    })

    it('returns new front after dequeue', () => {
      const q = new ElasticQueue2<number>()
      q.enqueue(10)
      q.enqueue(20)
      q.dequeue()
      expect(q.peek()).toBe(20)
    })
  })

  // ─── Size and Empty ───

  describe('size and isEmpty', () => {
    it('size returns 0 for new queue', () => {
      const q = new ElasticQueue2<number>()
      expect(q.size).toBe(0)
    })

    it('isEmpty returns true for new queue', () => {
      const q = new ElasticQueue2<number>()
      expect(q.isEmpty()).toBe(true)
    })

    it('isEmpty returns false after enqueue', () => {
      const q = new ElasticQueue2<number>()
      q.enqueue(1)
      expect(q.isEmpty()).toBe(false)
    })

    it('isEmpty returns true after clearing all items', () => {
      const q = new ElasticQueue2<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      q.dequeue()
      expect(q.isEmpty()).toBe(true)
    })
  })

  // ─── IsFull and Capacity ───

  describe('isFull and capacity', () => {
    it('isFull returns false for unbounded queue', () => {
      const q = new ElasticQueue2<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.isFull()).toBe(false)
    })

    it('isFull returns false when under maxSize', () => {
      const q = new ElasticQueue2<number>({ maxSize: 5 })
      q.enqueue(1)
      expect(q.isFull()).toBe(false)
    })

    it('isFull returns true when at maxSize', () => {
      const q = new ElasticQueue2<number>({ maxSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.isFull()).toBe(true)
    })

    it('capacity returns undefined for unbounded queue', () => {
      const q = new ElasticQueue2<number>()
      expect(q.capacity()).toBeUndefined()
    })

    it('capacity returns maxSize for bounded queue', () => {
      const q = new ElasticQueue2<number>({ maxSize: 10 })
      expect(q.capacity()).toBe(10)
    })

    it('isFull becomes false after dequeue from full queue', () => {
      const q = new ElasticQueue2<number>({ maxSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.isFull()).toBe(false)
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('removes all items', () => {
      const q = new ElasticQueue2<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.clear()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('clear on empty queue is a no-op', () => {
      const q = new ElasticQueue2<number>()
      q.clear()
      expect(q.size).toBe(0)
    })

    it('allows enqueue after clear', () => {
      const q = new ElasticQueue2<number>()
      q.enqueue(1)
      q.clear()
      q.enqueue(2)
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(2)
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles maxSize of 1', () => {
      const q = new ElasticQueue2<number>({ maxSize: 1 })
      q.enqueue(1)
      expect(q.isFull()).toBe(true)
      expect(() => q.enqueue(2)).toThrow('Queue is full')
    })

    it('handles enqueue/dequeue interleaving', () => {
      const q = new ElasticQueue2<number>({ maxSize: 2 })
      q.enqueue(1)
      expect(q.dequeue()).toBe(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
      expect(q.isEmpty()).toBe(true)
    })

    it('handles large number of items in unbounded queue', () => {
      const q = new ElasticQueue2<number>()
      for (let i = 0; i < 1000; i++) {
        q.enqueue(i)
      }
      expect(q.size).toBe(1000)
      expect(q.peek()).toBe(0)
    })

    it('handles null and undefined values', () => {
      const q = new ElasticQueue2<number | null | undefined>()
      q.enqueue(null)
      q.enqueue(undefined)
      expect(q.size).toBe(2)
      expect(q.dequeue()).toBeNull()
      expect(q.dequeue()).toBeUndefined()
    })
  })
})
