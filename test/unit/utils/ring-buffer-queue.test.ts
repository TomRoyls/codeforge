import { describe, it, expect } from 'vitest'
import { RingBufferQueue } from '../../../src/utils/ring-buffer-queue.js'

describe('RingBufferQueue', () => {
  describe('enqueue and dequeue', () => {
    it('enqueues and dequeues in FIFO order', () => {
      const q = new RingBufferQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
    })

    it('returns undefined on empty dequeue', () => {
      const q = new RingBufferQueue<number>()
      expect(q.dequeue()).toBeUndefined()
    })
  })

  describe('peek', () => {
    it('peeks at front element', () => {
      const q = new RingBufferQueue<string>()
      q.enqueue('a')
      q.enqueue('b')
      expect(q.peek()).toBe('a')
      expect(q.size).toBe(2)
    })

    it('peeks at last element', () => {
      const q = new RingBufferQueue<string>()
      q.enqueue('a')
      q.enqueue('b')
      expect(q.peekLast()).toBe('b')
    })

    it('returns undefined for empty peek', () => {
      const q = new RingBufferQueue<number>()
      expect(q.peek()).toBeUndefined()
      expect(q.peekLast()).toBeUndefined()
    })
  })

  describe('growth', () => {
    it('grows when full', () => {
      const q = new RingBufferQueue<number>(4)
      for (let i = 0; i < 20; i++) {
        q.enqueue(i)
      }
      expect(q.size).toBe(20)
      expect(q.capacity).toBeGreaterThanOrEqual(20)
    })

    it('maintains order after growth', () => {
      const q = new RingBufferQueue<number>(4)
      for (let i = 0; i < 10; i++) q.enqueue(i)
      for (let i = 0; i < 10; i++) {
        expect(q.dequeue()).toBe(i)
      }
    })
  })

  describe('wrap-around', () => {
    it('handles circular wrap-around', () => {
      const q = new RingBufferQueue<number>(4)
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      expect(q.toArray()).toEqual([2, 3, 4, 5])
    })
  })

  describe('clear', () => {
    it('clears all elements', () => {
      const q = new RingBufferQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })
  })

  describe('toArray', () => {
    it('returns elements in order', () => {
      const q = new RingBufferQueue<number>()
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      expect(q.toArray()).toEqual([10, 20, 30])
    })
  })

  describe('isEmpty and isFull', () => {
    it('tracks empty state', () => {
      const q = new RingBufferQueue<number>(4)
      expect(q.isEmpty()).toBe(true)
      q.enqueue(1)
      expect(q.isEmpty()).toBe(false)
    })

    it('tracks full state', () => {
      const q = new RingBufferQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.isFull()).toBe(true)
    })
  })

  describe('capacity', () => {
    it('reports initial capacity', () => {
      const q = new RingBufferQueue<number>(32)
      expect(q.capacity).toBe(32)
    })
  })
})
