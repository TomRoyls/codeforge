import { describe, it, expect } from 'vitest'
import { ConcurrentQueue3 } from '../../src/core/concurrent-queue-3/index.js'

describe('ConcurrentQueue3', () => {
  // ─── Constructor ───

  describe('constructor', () => {
    it('creates an unbounded queue with no args', () => {
      const q = new ConcurrentQueue3<number>()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('creates a bounded queue with maxSize', () => {
      const q = new ConcurrentQueue3<number>(5)
      expect(q.size).toBe(0)
    })
  })

  // ─── Enqueue ───

  describe('enqueue', () => {
    it('adds item to unbounded queue', async () => {
      const q = new ConcurrentQueue3<number>()
      await q.enqueue(1)
      expect(q.size).toBe(1)
    })

    it('adds multiple items preserving FIFO order', async () => {
      const q = new ConcurrentQueue3<number>()
      await q.enqueue(10)
      await q.enqueue(20)
      await q.enqueue(30)
      expect(q.size).toBe(3)
      expect(q.peek()).toBe(10)
    })

    it('handles string items', async () => {
      const q = new ConcurrentQueue3<string>()
      await q.enqueue('hello')
      await q.enqueue('world')
      expect(q.size).toBe(2)
      expect(q.peek()).toBe('hello')
    })

    it('handles object items', async () => {
      const q = new ConcurrentQueue3<{ id: number }>()
      await q.enqueue({ id: 1 })
      expect(q.size).toBe(1)
    })

    it('resolves waiting dequeuer immediately', async () => {
      const q = new ConcurrentQueue3<number>()
      const dequeuePromise = q.dequeue()
      await q.enqueue(42)
      const result = await dequeuePromise
      expect(result).toBe(42)
    })

    it('blocks when bounded queue is full then resumes after dequeue', async () => {
      const q = new ConcurrentQueue3<number>(2)
      await q.enqueue(1)
      await q.enqueue(2)
      expect(q.size).toBe(2)

      const enqueuePromise = q.enqueue(3)
      q.dequeue()
      await enqueuePromise
      expect(q.size).toBe(2)
    })

    it('resolves multiple waiting dequeuers in order', async () => {
      const q = new ConcurrentQueue3<number>()
      const p1 = q.dequeue()
      const p2 = q.dequeue()
      await q.enqueue(100)
      await q.enqueue(200)
      expect(await p1).toBe(100)
      expect(await p2).toBe(200)
    })
  })

  // ─── Dequeue ───

  describe('dequeue', () => {
    it('returns item from non-empty queue', async () => {
      const q = new ConcurrentQueue3<number>()
      await q.enqueue(1)
      const item = await q.dequeue()
      expect(item).toBe(1)
    })

    it('returns items in FIFO order', async () => {
      const q = new ConcurrentQueue3<number>()
      await q.enqueue(10)
      await q.enqueue(20)
      await q.enqueue(30)
      expect(await q.dequeue()).toBe(10)
      expect(await q.dequeue()).toBe(20)
      expect(await q.dequeue()).toBe(30)
    })

    it('decreases size after dequeue', async () => {
      const q = new ConcurrentQueue3<number>()
      await q.enqueue(1)
      await q.enqueue(2)
      await q.dequeue()
      expect(q.size).toBe(1)
    })

    it('waits when queue is empty then resolves on enqueue', async () => {
      const q = new ConcurrentQueue3<string>()
      const dequeuePromise = q.dequeue()
      await q.enqueue('test')
      expect(await dequeuePromise).toBe('test')
    })

    it('unblocks enqueue waiters when item is dequeued from full queue', async () => {
      const q = new ConcurrentQueue3<number>(1)
      await q.enqueue(1)

      const enqueuePromise = q.enqueue(2)
      const dequeuePromise = q.dequeue()

      const item = await dequeuePromise
      expect(item).toBe(1)

      await enqueuePromise
      expect(q.size).toBe(1)
    })
  })

  // ─── Peek ───

  describe('peek', () => {
    it('returns undefined on empty queue', () => {
      const q = new ConcurrentQueue3<number>()
      expect(q.peek()).toBeUndefined()
    })

    it('returns front item without removing it', async () => {
      const q = new ConcurrentQueue3<number>()
      await q.enqueue(1)
      await q.enqueue(2)
      expect(q.peek()).toBe(1)
      expect(q.size).toBe(2)
    })

    it('returns new front after dequeue', async () => {
      const q = new ConcurrentQueue3<number>()
      await q.enqueue(10)
      await q.enqueue(20)
      await q.dequeue()
      expect(q.peek()).toBe(20)
    })
  })

  // ─── Size and isEmpty ───

  describe('size and isEmpty', () => {
    it('reports size correctly after operations', async () => {
      const q = new ConcurrentQueue3<number>()
      expect(q.size).toBe(0)
      await q.enqueue(1)
      expect(q.size).toBe(1)
      await q.enqueue(2)
      expect(q.size).toBe(2)
      await q.dequeue()
      expect(q.size).toBe(1)
    })

    it('isEmpty reflects queue state', async () => {
      const q = new ConcurrentQueue3<number>()
      expect(q.isEmpty()).toBe(true)
      await q.enqueue(1)
      expect(q.isEmpty()).toBe(false)
      await q.dequeue()
      expect(q.isEmpty()).toBe(true)
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('removes all items', async () => {
      const q = new ConcurrentQueue3<number>()
      await q.enqueue(1)
      await q.enqueue(2)
      q.clear()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('clears empty queue without error', () => {
      const q = new ConcurrentQueue3<number>()
      q.clear()
      expect(q.size).toBe(0)
    })

    it('allows enqueue after clear', async () => {
      const q = new ConcurrentQueue3<number>()
      await q.enqueue(1)
      q.clear()
      await q.enqueue(2)
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(2)
    })
  })

  // ─── Concurrent Scenarios ───

  describe('concurrent scenarios', () => {
    it('handles multiple concurrent enqueues', async () => {
      const q = new ConcurrentQueue3<number>()
      await Promise.all([
        q.enqueue(1),
        q.enqueue(2),
        q.enqueue(3),
      ])
      expect(q.size).toBe(3)
    })

    it('handles interleaved enqueue and dequeue', async () => {
      const q = new ConcurrentQueue3<number>()
      await q.enqueue(1)
      const item = await q.dequeue()
      expect(item).toBe(1)
      await q.enqueue(2)
      expect(await q.dequeue()).toBe(2)
    })

    it('handles bounded queue with multiple blocked enqueuers', async () => {
      const q = new ConcurrentQueue3<number>(1)
      await q.enqueue(1)

      const p1 = q.enqueue(2)
      const p2 = q.enqueue(3)

      await q.dequeue()
      await p1
      await q.dequeue()
      await p2
      expect(q.size).toBe(1)
    })
  })
})
