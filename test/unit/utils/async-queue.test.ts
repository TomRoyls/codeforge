import { describe, expect, it } from 'vitest'
import { AsyncQueue } from '../../../src/utils/async-queue.js'

describe('AsyncQueue', () => {
  describe('enqueue', () => {
    it('should enqueue element', () => {
      const queue = new AsyncQueue<number>()
      queue.enqueue(1)
      expect(queue.size).toBe(1)
      expect(queue.peek()).toBe(1)
    })

    it('should enqueue multiple elements', () => {
      const queue = new AsyncQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.size).toBe(3)
      expect(queue.peek()).toBe(1)
    })

    it('should throw error when enqueuing to closed queue', () => {
      const queue = new AsyncQueue<number>()
      queue.close()
      expect(() => queue.enqueue(1)).toThrow('AsyncQueue is closed')
    })

    it('should enqueue different types', () => {
      const queue = new AsyncQueue<string>()
      queue.enqueue('a')
      queue.enqueue('b')
      expect(queue.size).toBe(2)
    })

    it('should enqueue objects', () => {
      const queue = new AsyncQueue<{ id: number }>()
      queue.enqueue({ id: 1 })
      expect(queue.size).toBe(1)
    })
  })

  describe('dequeue', () => {
    it('should dequeue from non-empty queue', async () => {
      const queue = new AsyncQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      const result = await queue.dequeue()
      expect(result).toBe(1)
      expect(queue.size).toBe(1)
    })

    it('should wait for element in empty queue', async () => {
      const queue = new AsyncQueue<number>()
      const dequeuePromise = queue.dequeue()
      queue.enqueue(1)
      const result = await dequeuePromise
      expect(result).toBe(1)
    })

    it('should throw error when dequeuing from closed empty queue', async () => {
      const queue = new AsyncQueue<number>()
      queue.close()
      await expect(queue.dequeue()).rejects.toThrow('AsyncQueue is closed and empty')
    })

    it('should resolve multiple waiters in order', async () => {
      const queue = new AsyncQueue<number>()
      const p1 = queue.dequeue()
      const p2 = queue.dequeue()
      queue.enqueue(1)
      queue.enqueue(2)
      const [r1, r2] = await Promise.all([p1, p2])
      expect(r1).toBe(1)
      expect(r2).toBe(2)
    })

    it('should dequeue all elements', async () => {
      const queue = new AsyncQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      const r1 = await queue.dequeue()
      const r2 = await queue.dequeue()
      const r3 = await queue.dequeue()
      expect([r1, r2, r3]).toEqual([1, 2, 3])
      expect(queue.size).toBe(0)
    })
  })

  describe('peek', () => {
    it('should peek at first element', () => {
      const queue = new AsyncQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.peek()).toBe(1)
    })

    it('should return undefined for empty queue', () => {
      const queue = new AsyncQueue<number>()
      expect(queue.peek()).toBeUndefined()
    })

    it('should not remove element', () => {
      const queue = new AsyncQueue<number>()
      queue.enqueue(1)
      const peeked = queue.peek()
      expect(peeked).toBe(1)
      expect(queue.size).toBe(1)
    })
  })

  describe('size getter', () => {
    it('should return 0 for empty queue', () => {
      const queue = new AsyncQueue<number>()
      expect(queue.size).toBe(0)
    })

    it('should return correct size after enqueues', () => {
      const queue = new AsyncQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.size).toBe(3)
    })

    it('should return correct size after dequeues', async () => {
      const queue = new AsyncQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      await queue.dequeue()
      await queue.dequeue()
      expect(queue.size).toBe(1)
    })
  })

  describe('pending getter', () => {
    it('should return 0 when no waiters', () => {
      const queue = new AsyncQueue<number>()
      expect(queue.pending).toBe(0)
    })

    it('should return number of waiting consumers', async () => {
      const queue = new AsyncQueue<number>()
      queue.dequeue()
      queue.dequeue()
      queue.dequeue()
      expect(queue.pending).toBe(3)
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(queue.pending).toBe(0)
    })
  })

  describe('closed getter', () => {
    it('should return false for open queue', () => {
      const queue = new AsyncQueue<number>()
      expect(queue.closed).toBe(false)
    })

    it('should return true after close', () => {
      const queue = new AsyncQueue<number>()
      queue.close()
      expect(queue.closed).toBe(true)
    })
  })

  describe('close', () => {
    it('should close the queue', () => {
      const queue = new AsyncQueue<number>()
      queue.close()
      expect(queue.closed).toBe(true)
    })

    it('should clear pending waiters on close', () => {
      const queue = new AsyncQueue<number>()
      queue.dequeue()
      queue.dequeue()
      expect(queue.pending).toBe(2)
      queue.close()
      expect(queue.pending).toBe(0)
    })

    it('should not affect existing queue elements on close', () => {
      const queue = new AsyncQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.close()
      expect(queue.size).toBe(2)
      expect(queue.peek()).toBe(1)
    })

    it('should still allow dequeue of existing elements after close', async () => {
      const queue = new AsyncQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.close()
      const result = await queue.dequeue()
      expect(result).toBe(1)
    })

    it('should handle multiple close calls', () => {
      const queue = new AsyncQueue<number>()
      queue.close()
      queue.close()
      queue.close()
      expect(queue.closed).toBe(true)
    })
  })

  describe('getStats', () => {
    it('should return correct stats for empty queue', () => {
      const queue = new AsyncQueue<number>()
      const stats = queue.getStats()
      expect(stats.size).toBe(0)
      expect(stats.pending).toBe(0)
      expect(stats.enqueued).toBe(0)
      expect(stats.dequeued).toBe(0)
      expect(stats.closed).toBe(false)
    })

    it('should track enqueued count', () => {
      const queue = new AsyncQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      const stats = queue.getStats()
      expect(stats.enqueued).toBe(3)
    })

    it('should track dequeued count', async () => {
      const queue = new AsyncQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      await queue.dequeue()
      await queue.dequeue()
      const stats = queue.getStats()
      expect(stats.dequeued).toBe(2)
    })

    it('should return comprehensive stats', async () => {
      const queue = new AsyncQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      await queue.dequeue()
      await queue.dequeue()
      const stats = queue.getStats()
      expect(stats.size).toBe(1)
      expect(stats.pending).toBe(0)
      expect(stats.enqueued).toBe(3)
      expect(stats.dequeued).toBe(2)
      expect(stats.closed).toBe(false)
    })

    it('should include closed status', () => {
      const queue = new AsyncQueue<number>()
      queue.enqueue(1)
      queue.close()
      const stats = queue.getStats()
      expect(stats.closed).toBe(true)
    })
  })

  describe('iterator', () => {
    it('should iterate over queue elements', () => {
      const queue = new AsyncQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      const result: number[] = []
      for (const item of queue) {
        result.push(item)
      }
      expect(result).toEqual([1, 2, 3])
    })

    it('should spread to array', () => {
      const queue = new AsyncQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      expect([...queue]).toEqual([1, 2])
    })

    it('should not iterate over empty queue', () => {
      const queue = new AsyncQueue<number>()
      const result: number[] = []
      for (const item of queue) {
        result.push(item)
      }
      expect(result).toEqual([])
    })

    it('should iterate only over queued elements not waiters', async () => {
      const queue = new AsyncQueue<number>()
      queue.enqueue(1)
      queue.dequeue()
      await new Promise(resolve => setTimeout(resolve, 10))
      const result: number[] = []
      for (const item of queue) {
        result.push(item)
      }
      expect(result).toEqual([])
    })
  })

  describe('concurrent operations', () => {
    it('should handle concurrent enqueues', async () => {
      const queue = new AsyncQueue<number>()
      await Promise.all([
        queue.enqueue(1),
        queue.enqueue(2),
        queue.enqueue(3),
      ])
      expect(queue.size).toBe(3)
    })

    it('should handle concurrent dequeues', async () => {
      const queue = new AsyncQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      const results = await Promise.all([
        queue.dequeue(),
        queue.dequeue(),
        queue.dequeue(),
      ])
      expect(results).toContain(1)
      expect(results).toContain(2)
      expect(results).toContain(3)
      expect(queue.size).toBe(0)
    })

    it('should handle enqueue-dequeue interleaving', async () => {
      const queue = new AsyncQueue<number>()
      const results: number[] = []
      const producer = async () => {
        queue.enqueue(1)
        queue.enqueue(2)
        queue.enqueue(3)
      }
      const consumer = async () => {
        results.push(await queue.dequeue())
        results.push(await queue.dequeue())
        results.push(await queue.dequeue())
      }
      await Promise.all([producer(), consumer()])
      expect(results).toEqual([1, 2, 3])
    })
  })

  describe('single element operations', () => {
    it('should handle single element enqueue-dequeue', async () => {
      const queue = new AsyncQueue<number>()
      queue.enqueue(1)
      const result = await queue.dequeue()
      expect(result).toBe(1)
      expect(queue.size).toBe(0)
    })

    it('should handle single element peek', () => {
      const queue = new AsyncQueue<number>()
      queue.enqueue(1)
      expect(queue.peek()).toBe(1)
      expect(queue.size).toBe(1)
    })

    it('should handle single element stats', () => {
      const queue = new AsyncQueue<number>()
      queue.enqueue(1)
      const stats = queue.getStats()
      expect(stats.size).toBe(1)
      expect(stats.enqueued).toBe(1)
      expect(stats.dequeued).toBe(0)
    })
  })

  describe('empty queue operations', () => {
    it('should return zero size for empty queue', () => {
      const queue = new AsyncQueue<number>()
      expect(queue.size).toBe(0)
    })

    it('should return undefined peek for empty queue', () => {
      const queue = new AsyncQueue<number>()
      expect(queue.peek()).toBeUndefined()
    })

    it('should return zero pending for empty queue', () => {
      const queue = new AsyncQueue<number>()
      expect(queue.pending).toBe(0)
    })

    it('should return correct stats for empty queue', () => {
      const queue = new AsyncQueue<number>()
      const stats = queue.getStats()
      expect(stats.size).toBe(0)
      expect(stats.pending).toBe(0)
      expect(stats.enqueued).toBe(0)
      expect(stats.dequeued).toBe(0)
    })
  })

  describe('string types', () => {
    it('should enqueue and dequeue strings', async () => {
      const queue = new AsyncQueue<string>()
      queue.enqueue('hello')
      queue.enqueue('world')
      const r1 = await queue.dequeue()
      const r2 = await queue.dequeue()
      expect(r1).toBe('hello')
      expect(r2).toBe('world')
    })
  })

  describe('object types', () => {
    it('should enqueue and dequeue objects', async () => {
      const queue = new AsyncQueue<{ id: number }>()
      queue.enqueue({ id: 1 })
      queue.enqueue({ id: 2 })
      const r1 = await queue.dequeue()
      const r2 = await queue.dequeue()
      expect(r1).toEqual({ id: 1 })
      expect(r2).toEqual({ id: 2 })
    })
  })
})