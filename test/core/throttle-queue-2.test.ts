import { describe, it, expect } from 'vitest'
import { ThrottleQueue2 } from '../../src/core/throttle-queue-2/index.js'

describe('ThrottleQueue2', () => {
  // ─── Constructor ───

  describe('constructor', () => {
    it('creates queue with maxConcurrent only', () => {
      const q = new ThrottleQueue2<number>({ maxConcurrent: 3 })
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('creates queue with maxConcurrent and delayMs', () => {
      const q = new ThrottleQueue2<number>({ maxConcurrent: 2, delayMs: 10 })
      expect(q.size).toBe(0)
    })

    it('creates queue with delayMs of 0', () => {
      const q = new ThrottleQueue2<number>({ maxConcurrent: 1, delayMs: 0 })
      expect(q.size).toBe(0)
    })
  })

  // ─── Enqueue ───

  describe('enqueue', () => {
    it('adds item to queue', () => {
      const q = new ThrottleQueue2<number>({ maxConcurrent: 2 })
      q.enqueue(1)
      expect(q.size).toBe(1)
    })

    it('adds multiple items preserving order', () => {
      const q = new ThrottleQueue2<string>({ maxConcurrent: 2 })
      q.enqueue('a')
      q.enqueue('b')
      q.enqueue('c')
      expect(q.size).toBe(3)
      expect(q.dequeue()).toBe('a')
    })

    it('handles object items', () => {
      const q = new ThrottleQueue2<{ id: number }>({ maxConcurrent: 1 })
      q.enqueue({ id: 1 })
      expect(q.size).toBe(1)
    })
  })

  // ─── Dequeue ───

  describe('dequeue', () => {
    it('returns undefined from empty queue', () => {
      const q = new ThrottleQueue2<number>({ maxConcurrent: 2 })
      expect(q.dequeue()).toBeUndefined()
    })

    it('returns first enqueued item', () => {
      const q = new ThrottleQueue2<number>({ maxConcurrent: 2 })
      q.enqueue(10)
      q.enqueue(20)
      expect(q.dequeue()).toBe(10)
    })

    it('decreases size', () => {
      const q = new ThrottleQueue2<number>({ maxConcurrent: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.size).toBe(1)
    })
  })

  // ─── Size and isEmpty ───

  describe('size and isEmpty', () => {
    it('returns 0 for new queue', () => {
      const q = new ThrottleQueue2<number>({ maxConcurrent: 1 })
      expect(q.size).toBe(0)
    })

    it('isEmpty returns true for new queue', () => {
      const q = new ThrottleQueue2<number>({ maxConcurrent: 1 })
      expect(q.isEmpty()).toBe(true)
    })

    it('isEmpty returns false after enqueue', () => {
      const q = new ThrottleQueue2<number>({ maxConcurrent: 1 })
      q.enqueue(1)
      expect(q.isEmpty()).toBe(false)
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('removes all items', () => {
      const q = new ThrottleQueue2<number>({ maxConcurrent: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('resets active count so processNext works after clear', async () => {
      const q = new ThrottleQueue2<number>({ maxConcurrent: 1 })
      q.enqueue(1)
      q.enqueue(2)
      await q.processNext()
      expect(q.size).toBe(1)
      q.clear()
      q.enqueue(3)
      const result = await q.processNext()
      expect(result).toBe(3)
    })
  })

  // ─── ProcessNext (no delay) ───

  describe('processNext without delay', () => {
    it('returns undefined when queue is empty', async () => {
      const q = new ThrottleQueue2<number>({ maxConcurrent: 2 })
      const result = await q.processNext()
      expect(result).toBeUndefined()
    })

    it('returns item from queue', async () => {
      const q = new ThrottleQueue2<number>({ maxConcurrent: 2 })
      q.enqueue(42)
      const result = await q.processNext()
      expect(result).toBe(42)
    })

    it('removes item from queue', async () => {
      const q = new ThrottleQueue2<number>({ maxConcurrent: 2 })
      q.enqueue(1)
      await q.processNext()
      expect(q.size).toBe(0)
    })

    it('returns items in FIFO order', async () => {
      const q = new ThrottleQueue2<number>({ maxConcurrent: 2 })
      q.enqueue(10)
      q.enqueue(20)
      expect(await q.processNext()).toBe(10)
      expect(await q.processNext()).toBe(20)
    })

    it('allows up to maxConcurrent items simultaneously', async () => {
      const q = new ThrottleQueue2<number>({ maxConcurrent: 3 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(await q.processNext()).toBe(1)
      expect(await q.processNext()).toBe(2)
      expect(await q.processNext()).toBe(3)
      expect(q.size).toBe(1)
    })
  })

  // ─── ProcessNext with delay ───

  describe('processNext with delay', () => {
    it('respects delayMs before returning item', async () => {
      const q = new ThrottleQueue2<number>({ maxConcurrent: 1, delayMs: 50 })
      q.enqueue(1)
      const start = Date.now()
      await q.processNext()
      const elapsed = Date.now() - start
      expect(elapsed).toBeGreaterThanOrEqual(40)
    })

    it('returns item after delay', async () => {
      const q = new ThrottleQueue2<number>({ maxConcurrent: 1, delayMs: 10 })
      q.enqueue(99)
      const result = await q.processNext()
      expect(result).toBe(99)
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('maxConcurrent of 1 processes one at a time', async () => {
      const q = new ThrottleQueue2<number>({ maxConcurrent: 1 })
      q.enqueue(1)
      q.enqueue(2)
      expect(await q.processNext()).toBe(1)
      expect(await q.processNext()).toBe(2)
      expect(await q.processNext()).toBeUndefined()
    })

    it('handles enqueue after processNext empties queue', async () => {
      const q = new ThrottleQueue2<number>({ maxConcurrent: 2 })
      q.enqueue(1)
      await q.processNext()
      expect(q.isEmpty()).toBe(true)
      q.enqueue(2)
      expect(q.size).toBe(1)
      expect(await q.processNext()).toBe(2)
    })

    it('clear resets both queue and active count', async () => {
      const q = new ThrottleQueue2<number>({ maxConcurrent: 1 })
      q.enqueue(1)
      q.enqueue(2)
      await q.processNext()
      q.clear()
      expect(q.isEmpty()).toBe(true)
      q.enqueue(3)
      const result = await q.processNext()
      expect(result).toBe(3)
    })

    it('handles large number of sequential processNext calls', async () => {
      const q = new ThrottleQueue2<number>({ maxConcurrent: 5 })
      for (let i = 0; i < 100; i++) {
        q.enqueue(i)
      }
      for (let i = 0; i < 100; i++) {
        const result = await q.processNext()
        expect(result).toBe(i)
      }
      expect(await q.processNext()).toBeUndefined()
    })
  })
})
