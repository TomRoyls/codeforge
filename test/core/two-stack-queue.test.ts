import { describe, it, expect, beforeEach } from 'vitest'
import { TwoStackQueue } from '../../src/core/two-stack-queue/two-stack-queue.js'
import { DEFAULT_TWO_STACK_QUEUE_OPTIONS } from '../../src/core/two-stack-queue/types.js'
import type { TwoStackQueueOptions, TwoStackQueueStatistics } from '../../src/core/two-stack-queue/types.js'

describe('TwoStackQueue', () => {
  let queue: TwoStackQueue<number>

  beforeEach(() => {
    queue = new TwoStackQueue<number>()
  })

  describe('constructor', () => {
    it('should create an empty queue with default options', () => {
      const q = new TwoStackQueue<number>()
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('should accept custom options', () => {
      const q = new TwoStackQueue<number>({ trackStatistics: false })
      expect(q.size()).toBe(0)
    })

    it('should accept empty options', () => {
      const q = new TwoStackQueue<number>({})
      expect(q.size()).toBe(0)
    })

    it('should have default trackStatistics true', () => {
      expect(DEFAULT_TWO_STACK_QUEUE_OPTIONS.trackStatistics).toBe(true)
    })

    it('should work with string type', () => {
      const q = new TwoStackQueue<string>()
      expect(q.size()).toBe(0)
    })

    it('should work with object type', () => {
      const q = new TwoStackQueue<{ x: number }>()
      expect(q.size()).toBe(0)
    })

    it('should work with default generic type', () => {
      const q = new TwoStackQueue()
      expect(q.size()).toBe(0)
    })
  })

  describe('enqueue', () => {
    it('should add a single item', () => {
      queue.enqueue(1)
      expect(queue.size()).toBe(1)
      expect(queue.isEmpty()).toBe(false)
    })

    it('should add multiple items in order', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.toArray()).toEqual([1, 2, 3])
    })

    it('should preserve FIFO order', () => {
      queue.enqueue(10)
      queue.enqueue(20)
      queue.enqueue(30)
      expect(queue.dequeue()).toBe(10)
      expect(queue.dequeue()).toBe(20)
      expect(queue.dequeue()).toBe(30)
    })

    it('should handle undefined values', () => {
      const q = new TwoStackQueue<number | undefined>()
      q.enqueue(undefined)
      expect(q.size()).toBe(1)
    })

    it('should handle null values', () => {
      const q = new TwoStackQueue<number | null>()
      q.enqueue(null)
      expect(q.size()).toBe(1)
    })

    it('should handle enqueue after dequeue triggers transfer', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      queue.enqueue(3)
      expect(queue.toArray()).toEqual([2, 3])
    })

    it('should handle enqueue on a queue that was emptied and refilled', () => {
      queue.enqueue(1)
      queue.dequeue()
      expect(queue.isEmpty()).toBe(true)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.toArray()).toEqual([2, 3])
    })

    it('should track enqueue statistics', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.getStatistics().enqueues).toBe(2)
    })

    it('should not track statistics when disabled', () => {
      const q = new TwoStackQueue<number>({ trackStatistics: false })
      q.enqueue(1)
      expect(q.getStatistics().enqueues).toBe(0)
    })
  })

  describe('dequeue', () => {
    it('should return undefined for empty queue', () => {
      expect(queue.dequeue()).toBeUndefined()
    })

    it('should remove and return the first item', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.dequeue()).toBe(1)
      expect(queue.dequeue()).toBe(2)
    })

    it('should maintain correct size after dequeue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      expect(queue.size()).toBe(2)
    })

    it('should handle dequeue all items', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.dequeue()).toBe(1)
      expect(queue.dequeue()).toBe(2)
      expect(queue.size()).toBe(0)
      expect(queue.isEmpty()).toBe(true)
    })

    it('should handle dequeue on single item queue', () => {
      queue.enqueue(42)
      expect(queue.dequeue()).toBe(42)
      expect(queue.isEmpty()).toBe(true)
    })

    it('should return undefined after all items dequeued', () => {
      queue.enqueue(1)
      queue.dequeue()
      expect(queue.dequeue()).toBeUndefined()
    })

    it('should handle alternating enqueue/dequeue', () => {
      queue.enqueue(1)
      expect(queue.dequeue()).toBe(1)
      queue.enqueue(2)
      expect(queue.dequeue()).toBe(2)
      queue.enqueue(3)
      expect(queue.dequeue()).toBe(3)
      expect(queue.isEmpty()).toBe(true)
    })

    it('should trigger transfer when dequeue stack is empty', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.dequeue()).toBe(1)
      expect(queue.dequeue()).toBe(2)
      expect(queue.dequeue()).toBe(3)
    })

    it('should track dequeue statistics', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      expect(queue.getStatistics().dequeues).toBe(1)
    })

    it('should not track dequeue stats when statistics disabled', () => {
      const q = new TwoStackQueue<number>({ trackStatistics: false })
      q.enqueue(1)
      q.dequeue()
      expect(q.getStatistics().dequeues).toBe(0)
    })
  })

  describe('peek', () => {
    it('should return undefined for empty queue', () => {
      expect(queue.peek()).toBeUndefined()
    })

    it('should return the first item without removing it', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.peek()).toBe(1)
      expect(queue.size()).toBe(2)
    })

    it('should return same item on multiple calls', () => {
      queue.enqueue(42)
      expect(queue.peek()).toBe(42)
      expect(queue.peek()).toBe(42)
      expect(queue.peek()).toBe(42)
    })

    it('should update after dequeue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      expect(queue.peek()).toBe(2)
    })

    it('should work after transfer', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      expect(queue.peek()).toBe(2)
    })

    it('should trigger transfer when dequeue stack is empty', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.peek()).toBe(1)
      expect(queue.dequeueStackSize()).toBe(2)
    })
  })

  describe('size', () => {
    it('should return 0 for empty queue', () => {
      expect(queue.size()).toBe(0)
    })

    it('should increase with each enqueue', () => {
      queue.enqueue(1)
      expect(queue.size()).toBe(1)
      queue.enqueue(2)
      expect(queue.size()).toBe(2)
      queue.enqueue(3)
      expect(queue.size()).toBe(3)
    })

    it('should decrease with each dequeue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      expect(queue.size()).toBe(2)
      queue.dequeue()
      expect(queue.size()).toBe(1)
    })

    it('should never go negative', () => {
      queue.dequeue()
      expect(queue.size()).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new queue', () => {
      expect(queue.isEmpty()).toBe(true)
    })

    it('should return false after enqueue', () => {
      queue.enqueue(1)
      expect(queue.isEmpty()).toBe(false)
    })

    it('should return true after all items dequeued', () => {
      queue.enqueue(1)
      queue.dequeue()
      expect(queue.isEmpty()).toBe(true)
    })

    it('should return false with items remaining', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      expect(queue.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('should empty the queue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.clear()
      expect(queue.size()).toBe(0)
      expect(queue.isEmpty()).toBe(true)
    })

    it('should work on already empty queue', () => {
      queue.clear()
      expect(queue.size()).toBe(0)
    })

    it('should allow enqueue after clear', () => {
      queue.enqueue(1)
      queue.clear()
      queue.enqueue(2)
      expect(queue.size()).toBe(1)
      expect(queue.peek()).toBe(2)
    })

    it('should reset both stacks', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      queue.enqueue(3)
      queue.clear()
      expect(queue.enqueueStackSize()).toBe(0)
      expect(queue.dequeueStackSize()).toBe(0)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty queue', () => {
      expect(queue.toArray()).toEqual([])
    })

    it('should return all items in FIFO order', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.toArray()).toEqual([1, 2, 3])
    })

    it('should reflect current state after dequeue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      expect(queue.toArray()).toEqual([2, 3])
    })

    it('should return a copy not a reference', () => {
      queue.enqueue(1)
      const arr = queue.toArray()
      arr.push(2)
      expect(queue.toArray()).toEqual([1])
    })

    it('should work after multiple transfers', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      queue.enqueue(3)
      queue.enqueue(4)
      queue.dequeue()
      expect(queue.toArray()).toEqual([3, 4])
    })
  })

  describe('forEach', () => {
    it('should iterate over all items in order', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      const items: number[] = []
      queue.forEach((v) => items.push(v))
      expect(items).toEqual([1, 2, 3])
    })

    it('should provide correct indices', () => {
      queue.enqueue(10)
      queue.enqueue(20)
      queue.enqueue(30)
      const indices: number[] = []
      queue.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should not iterate on empty queue', () => {
      let count = 0
      queue.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should handle single item', () => {
      queue.enqueue(1)
      const items: number[] = []
      queue.forEach((v) => items.push(v))
      expect(items).toEqual([1])
    })

    it('should work after partial dequeue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      const items: number[] = []
      queue.forEach((v) => items.push(v))
      expect(items).toEqual([2, 3])
    })
  })

  describe('Symbol.iterator', () => {
    it('should be iterable', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      const items: number[] = []
      for (const item of queue) {
        items.push(item)
      }
      expect(items).toEqual([1, 2, 3])
    })

    it('should work with spread operator', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      expect([...queue]).toEqual([1, 2])
    })

    it('should work with Array.from', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(Array.from(queue)).toEqual([1, 2, 3])
    })

    it('should work on empty queue', () => {
      expect([...queue]).toEqual([])
    })

    it('should work after partial dequeue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      expect([...queue]).toEqual([2, 3])
    })

    it('should work with for...of after transfer', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      queue.enqueue(3)
      const items: number[] = []
      for (const item of queue) {
        items.push(item)
      }
      expect(items).toEqual([2, 3])
    })
  })

  describe('peekBack', () => {
    it('should return undefined for empty queue', () => {
      expect(queue.peekBack()).toBeUndefined()
    })

    it('should return the last enqueued item', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.peekBack()).toBe(3)
    })

    it('should return item without removing it', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.peekBack()).toBe(2)
      expect(queue.size()).toBe(2)
    })

    it('should return the only item for single-item queue', () => {
      queue.enqueue(42)
      expect(queue.peekBack()).toBe(42)
    })

    it('should return same as last enqueued when enqueue stack has items', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.peekBack()).toBe(3)
    })

    it('should work when all items are in dequeue stack', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      queue.dequeue()
      expect(queue.peekBack()).toBe(3)
    })

    it('should work after transfer empties enqueue stack', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.peek()
      expect(queue.peekBack()).toBe(2)
    })
  })

  describe('enqueueStackSize', () => {
    it('should return 0 for new queue', () => {
      expect(queue.enqueueStackSize()).toBe(0)
    })

    it('should increase with enqueue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.enqueueStackSize()).toBe(2)
    })

    it('should decrease after transfer', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.peek()
      expect(queue.enqueueStackSize()).toBe(0)
    })

    it('should increase after enqueue following transfer', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      queue.enqueue(3)
      expect(queue.enqueueStackSize()).toBe(1)
    })

    it('should reset after clear', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.clear()
      expect(queue.enqueueStackSize()).toBe(0)
    })
  })

  describe('dequeueStackSize', () => {
    it('should return 0 for new queue', () => {
      expect(queue.dequeueStackSize()).toBe(0)
    })

    it('should increase after transfer', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.peek()
      expect(queue.dequeueStackSize()).toBe(3)
    })

    it('should decrease after dequeue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      expect(queue.dequeueStackSize()).toBe(1)
    })

    it('should reset after clear', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.clear()
      expect(queue.dequeueStackSize()).toBe(0)
    })

    it('should be 0 before any transfer', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.dequeueStackSize()).toBe(0)
    })
  })

  describe('transferCount', () => {
    it('should return 0 for new queue', () => {
      expect(queue.transferCount()).toBe(0)
    })

    it('should increment when dequeue triggers transfer', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      expect(queue.transferCount()).toBe(1)
    })

    it('should increment when peek triggers transfer', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.peek()
      expect(queue.transferCount()).toBe(1)
    })

    it('should track multiple transfers', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      queue.dequeue()
      expect(queue.transferCount()).toBe(1)
      queue.enqueue(3)
      queue.enqueue(4)
      queue.dequeue()
      expect(queue.transferCount()).toBe(2)
    })

    it('should not increment for empty queue dequeue', () => {
      queue.dequeue()
      expect(queue.transferCount()).toBe(0)
    })
  })

  describe('getStatistics', () => {
    it('should return initial statistics', () => {
      const stats = queue.getStatistics()
      expect(stats.enqueues).toBe(0)
      expect(stats.dequeues).toBe(0)
      expect(stats.transfers).toBe(0)
      expect(stats.maxEnqueueStackSize).toBe(0)
      expect(stats.maxDequeueStackSize).toBe(0)
      expect(stats.totalTransferCount).toBe(0)
    })

    it('should track enqueues', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.getStatistics().enqueues).toBe(3)
    })

    it('should track dequeues', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      queue.dequeue()
      expect(queue.getStatistics().dequeues).toBe(2)
    })

    it('should track transfers', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      expect(queue.getStatistics().transfers).toBe(1)
    })

    it('should track maxEnqueueStackSize', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.getStatistics().maxEnqueueStackSize).toBe(3)
    })

    it('should track maxDequeueStackSize', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      expect(queue.getStatistics().maxDequeueStackSize).toBe(3)
    })

    it('should track totalTransferCount', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      expect(queue.getStatistics().totalTransferCount).toBe(3)
    })

    it('should return a copy of statistics', () => {
      queue.enqueue(1)
      const stats = queue.getStatistics()
      stats.enqueues = 999
      expect(queue.getStatistics().enqueues).toBe(1)
    })

    it('should accumulate statistics over multiple operations', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      queue.enqueue(4)
      queue.enqueue(5)
      queue.dequeue()
      queue.dequeue()
      const stats = queue.getStatistics()
      expect(stats.enqueues).toBe(5)
      expect(stats.dequeues).toBe(3)
      expect(stats.transfers).toBeGreaterThanOrEqual(1)
    })

    it('should not update stats when trackStatistics is false', () => {
      const q = new TwoStackQueue<number>({ trackStatistics: false })
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      const stats = q.getStatistics()
      expect(stats.enqueues).toBe(0)
      expect(stats.dequeues).toBe(0)
      expect(stats.transfers).toBe(0)
    })
  })

  describe('two-stack behavior', () => {
    it('should correctly transfer elements between stacks', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.enqueueStackSize()).toBe(3)
      expect(queue.dequeueStackSize()).toBe(0)
      queue.dequeue()
      expect(queue.enqueueStackSize()).toBe(0)
      expect(queue.dequeueStackSize()).toBe(2)
    })

    it('should maintain FIFO through transfer', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.dequeue()).toBe(1)
      expect(queue.dequeue()).toBe(2)
      expect(queue.dequeue()).toBe(3)
    })

    it('should handle enqueue after full drain', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      queue.dequeue()
      expect(queue.isEmpty()).toBe(true)
      queue.enqueue(3)
      queue.enqueue(4)
      expect(queue.dequeue()).toBe(3)
      expect(queue.dequeue()).toBe(4)
    })

    it('should handle interleaved enqueue/dequeue with transfers', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.dequeue()).toBe(1)
      queue.enqueue(4)
      expect(queue.dequeue()).toBe(2)
      expect(queue.dequeue()).toBe(3)
      expect(queue.dequeue()).toBe(4)
    })

    it('should handle single element transfer', () => {
      queue.enqueue(1)
      expect(queue.dequeue()).toBe(1)
    })

    it('should handle large transfer', () => {
      for (let i = 0; i < 100; i++) {
        queue.enqueue(i)
      }
      expect(queue.transferCount()).toBe(0)
      expect(queue.dequeue()).toBe(0)
      expect(queue.transferCount()).toBe(1)
      for (let i = 1; i < 100; i++) {
        expect(queue.dequeue()).toBe(i)
      }
    })
  })

  describe('type variations', () => {
    it('should handle string queue', () => {
      const q = new TwoStackQueue<string>()
      q.enqueue('a')
      q.enqueue('b')
      q.enqueue('c')
      expect(q.toArray()).toEqual(['a', 'b', 'c'])
      expect(q.dequeue()).toBe('a')
    })

    it('should handle object queue', () => {
      const q = new TwoStackQueue<{ id: number }>()
      q.enqueue({ id: 1 })
      q.enqueue({ id: 2 })
      const item = q.dequeue()
      expect(item!.id).toBe(1)
    })

    it('should handle boolean queue', () => {
      const q = new TwoStackQueue<boolean>()
      q.enqueue(true)
      q.enqueue(false)
      expect(q.dequeue()).toBe(true)
      expect(q.dequeue()).toBe(false)
    })

    it('should handle array queue', () => {
      const q = new TwoStackQueue<number[]>()
      q.enqueue([1, 2])
      q.enqueue([3, 4])
      expect(q.dequeue()).toEqual([1, 2])
    })

    it('should handle mixed union type', () => {
      const q = new TwoStackQueue<string | number>()
      q.enqueue('a')
      q.enqueue(1)
      q.enqueue('b')
      expect(q.dequeue()).toBe('a')
      expect(q.dequeue()).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('should handle enqueue dequeue cycle many times', () => {
      for (let i = 0; i < 100; i++) {
        queue.enqueue(i)
        expect(queue.dequeue()).toBe(i)
      }
      expect(queue.isEmpty()).toBe(true)
    })

    it('should handle bulk enqueue then bulk dequeue', () => {
      for (let i = 0; i < 1000; i++) {
        queue.enqueue(i)
      }
      for (let i = 0; i < 1000; i++) {
        expect(queue.dequeue()).toBe(i)
      }
      expect(queue.isEmpty()).toBe(true)
    })

    it('should handle mixed operations', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.dequeue()).toBe(1)
      queue.enqueue(3)
      queue.enqueue(4)
      expect(queue.dequeue()).toBe(2)
      expect(queue.dequeue()).toBe(3)
      queue.enqueue(5)
      expect(queue.toArray()).toEqual([4, 5])
    })

    it('should handle peek on empty queue after operations', () => {
      queue.enqueue(1)
      queue.dequeue()
      expect(queue.peek()).toBeUndefined()
      expect(queue.peekBack()).toBeUndefined()
    })

    it('should handle toArray on empty queue', () => {
      expect(queue.toArray()).toEqual([])
    })

    it('should handle clear after partial dequeue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      queue.clear()
      expect(queue.size()).toBe(0)
      expect(queue.isEmpty()).toBe(true)
      expect(queue.enqueueStackSize()).toBe(0)
      expect(queue.dequeueStackSize()).toBe(0)
    })

    it('should handle multiple clears', () => {
      queue.enqueue(1)
      queue.clear()
      queue.clear()
      expect(queue.size()).toBe(0)
    })

    it('should handle dequeue on empty after clear', () => {
      queue.enqueue(1)
      queue.clear()
      expect(queue.dequeue()).toBeUndefined()
    })

    it('should handle peek triggering transfer correctly', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.peek()).toBe(1)
      expect(queue.dequeueStackSize()).toBe(3)
      expect(queue.enqueueStackSize()).toBe(0)
      expect(queue.dequeue()).toBe(1)
    })

    it('should handle peekBack with items split across stacks', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      queue.enqueue(4)
      expect(queue.peekBack()).toBe(4)
    })
  })

  describe('stress tests', () => {
    it('should handle 10,000 enqueue/dequeue operations', () => {
      const n = 10_000
      for (let i = 0; i < n; i++) {
        queue.enqueue(i)
      }
      for (let i = 0; i < n; i++) {
        expect(queue.dequeue()).toBe(i)
      }
      expect(queue.isEmpty()).toBe(true)
    })

    it('should handle interleaved enqueue/dequeue', () => {
      const n = 1000
      for (let i = 0; i < n; i++) {
        queue.enqueue(i)
      }
      for (let i = 0; i < n; i++) {
        queue.enqueue(n + i)
        expect(queue.dequeue()).toBe(i)
      }
      for (let i = 0; i < n; i++) {
        expect(queue.dequeue()).toBe(n + i)
      }
      expect(queue.isEmpty()).toBe(true)
    })

    it('should handle large batch enqueue then toArray', () => {
      const items = Array.from({ length: 5000 }, (_, i) => i)
      for (const item of items) {
        queue.enqueue(item)
      }
      expect(queue.size()).toBe(5000)
      expect(queue.toArray()).toEqual(items)
    })

    it('should handle alternating batch operations', () => {
      for (let batch = 0; batch < 100; batch++) {
        queue.enqueue(batch * 3)
        queue.enqueue(batch * 3 + 1)
        queue.enqueue(batch * 3 + 2)
        if (batch % 2 === 0) {
          queue.dequeue()
        }
      }
      expect(queue.size()).toBeGreaterThan(0)
    })

    it('should handle repeated fill and drain cycles', () => {
      for (let cycle = 0; cycle < 50; cycle++) {
        for (let i = 0; i < 20; i++) {
          queue.enqueue(cycle * 20 + i)
        }
        for (let i = 0; i < 20; i++) {
          expect(queue.dequeue()).toBe(cycle * 20 + i)
        }
      }
      expect(queue.isEmpty()).toBe(true)
    })

    it('should handle statistics under stress', () => {
      const q = new TwoStackQueue<number>({ trackStatistics: true })
      for (let i = 0; i < 5000; i++) {
        q.enqueue(i)
      }
      for (let i = 0; i < 2500; i++) {
        q.dequeue()
      }
      const stats = q.getStatistics()
      expect(stats.enqueues).toBe(5000)
      expect(stats.dequeues).toBe(2500)
      expect(stats.maxEnqueueStackSize).toBe(5000)
      expect(stats.transfers).toBeGreaterThanOrEqual(1)
    })
  })

  describe('type exports', () => {
    it('should export TwoStackQueueOptions type', () => {
      const opts: TwoStackQueueOptions = { trackStatistics: false }
      const q = new TwoStackQueue<number>(opts)
      expect(q.size()).toBe(0)
    })

    it('should export TwoStackQueueStatistics type', () => {
      queue.enqueue(1)
      const stats: TwoStackQueueStatistics = queue.getStatistics()
      expect(stats.enqueues).toBe(1)
    })

    it('should export DEFAULT_TWO_STACK_QUEUE_OPTIONS', () => {
      expect(DEFAULT_TWO_STACK_QUEUE_OPTIONS.trackStatistics).toBe(true)
    })
  })

  describe('statistics edge cases', () => {
    it('should track maxEnqueueStackSize across multiple enqueues', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      queue.dequeue()
      queue.dequeue()
      queue.enqueue(4)
      const stats = queue.getStatistics()
      expect(stats.maxEnqueueStackSize).toBe(3)
    })

    it('should track maxDequeueStackSize correctly', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      const stats = queue.getStatistics()
      expect(stats.maxDequeueStackSize).toBe(3)
    })

    it('should accumulate totalTransferCount across multiple transfers', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      expect(queue.getStatistics().totalTransferCount).toBe(3)
      queue.dequeue()
      queue.dequeue()
      queue.enqueue(4)
      queue.enqueue(5)
      queue.dequeue()
      expect(queue.getStatistics().totalTransferCount).toBe(5)
    })

    it('should track statistics after clear', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.clear()
      const stats = queue.getStatistics()
      expect(stats.enqueues).toBe(2)
      expect(stats.maxEnqueueStackSize).toBe(2)
    })

    it('should not reset max sizes after clear', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.clear()
      queue.enqueue(4)
      const stats = queue.getStatistics()
      expect(stats.maxEnqueueStackSize).toBe(3)
    })

    it('should handle statistics disabled then operations', () => {
      const q = new TwoStackQueue<number>({ trackStatistics: false })
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      const stats = q.getStatistics()
      expect(stats.enqueues).toBe(0)
      expect(stats.dequeues).toBe(0)
      expect(stats.transfers).toBe(0)
      expect(stats.maxEnqueueStackSize).toBe(0)
      expect(stats.maxDequeueStackSize).toBe(0)
      expect(stats.totalTransferCount).toBe(0)
    })
  })

  describe('stack size consistency', () => {
    it('should maintain sum of stack sizes equal to total size', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.enqueueStackSize() + queue.dequeueStackSize()).toBe(queue.size())
      queue.dequeue()
      expect(queue.enqueueStackSize() + queue.dequeueStackSize()).toBe(queue.size())
      queue.enqueue(4)
      expect(queue.enqueueStackSize() + queue.dequeueStackSize()).toBe(queue.size())
      queue.dequeue()
      expect(queue.enqueueStackSize() + queue.dequeueStackSize()).toBe(queue.size())
    })

    it('should maintain consistency through clear', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      queue.clear()
      expect(queue.enqueueStackSize() + queue.dequeueStackSize()).toBe(0)
      expect(queue.size()).toBe(0)
    })

    it('should maintain consistency for single element', () => {
      queue.enqueue(1)
      expect(queue.enqueueStackSize() + queue.dequeueStackSize()).toBe(1)
      queue.dequeue()
      expect(queue.enqueueStackSize() + queue.dequeueStackSize()).toBe(0)
    })

    it('should maintain consistency through many operations', () => {
      for (let i = 0; i < 100; i++) {
        queue.enqueue(i)
        expect(queue.enqueueStackSize() + queue.dequeueStackSize()).toBe(queue.size())
      }
      for (let i = 0; i < 50; i++) {
        queue.dequeue()
        expect(queue.enqueueStackSize() + queue.dequeueStackSize()).toBe(queue.size())
      }
      for (let i = 100; i < 200; i++) {
        queue.enqueue(i)
        expect(queue.enqueueStackSize() + queue.dequeueStackSize()).toBe(queue.size())
      }
    })
  })

  describe('forEach after operations', () => {
    it('should iterate correctly after transfer', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      queue.enqueue(4)
      const items: number[] = []
      queue.forEach((v) => items.push(v))
      expect(items).toEqual([2, 3, 4])
    })

    it('should iterate correctly after full drain and refill', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      queue.dequeue()
      queue.enqueue(3)
      queue.enqueue(4)
      const items: number[] = []
      queue.forEach((v) => items.push(v))
      expect(items).toEqual([3, 4])
    })
  })

  describe('peekBack after operations', () => {
    it('should return last enqueued after dequeue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      expect(queue.peekBack()).toBe(3)
    })

    it('should return new last after additional enqueue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      queue.enqueue(3)
      expect(queue.peekBack()).toBe(3)
    })

    it('should return undefined after clearing', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.clear()
      expect(queue.peekBack()).toBeUndefined()
    })

    it('should return only remaining item after draining', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      queue.dequeue()
      expect(queue.peekBack()).toBe(3)
    })
  })

  describe('iterator independence', () => {
    it('should not be affected by modifications after creation', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      const iter = queue[Symbol.iterator]()
      queue.dequeue()
      const items: number[] = []
      let result = iter.next()
      while (!result.done) {
        items.push(result.value)
        result = iter.next()
      }
      expect(items).toEqual([1, 2, 3])
    })

    it('should create independent iterators', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      const iter1 = queue[Symbol.iterator]()
      const iter2 = queue[Symbol.iterator]()
      expect(iter1.next().value).toBe(1)
      expect(iter2.next().value).toBe(1)
      expect(iter1.next().value).toBe(2)
      expect(iter2.next().value).toBe(2)
    })
  })
})
