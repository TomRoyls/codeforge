import { describe, it, expect, beforeEach } from 'vitest'
import { ConcurrentQueue } from '../../src/core/concurrent-queue/concurrent-queue.js'
import { DEFAULT_CONCURRENT_QUEUE_OPTIONS } from '../../src/core/concurrent-queue/types.js'
import type { ConcurrentQueueOptions, ConcurrentQueueStats } from '../../src/core/concurrent-queue/types.js'

describe('ConcurrentQueue', () => {
  let q: ConcurrentQueue<number>

  beforeEach(() => {
    q = new ConcurrentQueue<number>()
  })

  describe('constructor', () => {
    it('should create a queue with default options', () => {
      const queue = new ConcurrentQueue<number>()
      expect(queue.size()).toBe(0)
      expect(queue.isEmpty()).toBe(true)
    })

    it('should accept custom maxSize', () => {
      const queue = new ConcurrentQueue<number>({ maxSize: 5 })
      expect(queue.getStats().maxSize).toBe(5)
    })

    it('should accept no options', () => {
      const queue = new ConcurrentQueue<number>()
      expect(queue.getStats().maxSize).toBe(Infinity)
    })

    it('should accept empty options object', () => {
      const queue = new ConcurrentQueue<number>({})
      expect(queue.size()).toBe(0)
    })
  })

  describe('enqueue', () => {
    it('should add an item to the queue', () => {
      q.enqueue(1)
      expect(q.size()).toBe(1)
    })

    it('should return true on successful enqueue', () => {
      expect(q.enqueue(1)).toBe(true)
    })

    it('should add multiple items maintaining order', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
    })

    it('should return false when queue is full', () => {
      const queue = new ConcurrentQueue<number>({ maxSize: 2 })
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.enqueue(3)).toBe(false)
    })

    it('should not increment size when full', () => {
      const queue = new ConcurrentQueue<number>({ maxSize: 2 })
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.size()).toBe(2)
    })

    it('should track totalEnqueued counter', () => {
      q.enqueue(1)
      q.enqueue(2)
      expect(q.getStats().totalEnqueued).toBe(2)
    })

    it('should track totalRejected counter', () => {
      const queue = new ConcurrentQueue<number>({ maxSize: 1 })
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.getStats().totalRejected).toBe(1)
    })

    it('should allow enqueue after dequeue from full queue', () => {
      const queue = new ConcurrentQueue<number>({ maxSize: 2 })
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      expect(queue.enqueue(3)).toBe(true)
    })

    it('should handle enqueue with undefined values', () => {
      const queue = new ConcurrentQueue<number | undefined>()
      expect(queue.enqueue(undefined)).toBe(true)
      expect(queue.dequeue()).toBeUndefined()
    })

    it('should handle enqueue with null values', () => {
      const queue = new ConcurrentQueue<number | null>()
      expect(queue.enqueue(null)).toBe(true)
      expect(queue.dequeue()).toBeNull()
    })

    it('should handle enqueue with object values', () => {
      const queue = new ConcurrentQueue<{ id: number }>()
      queue.enqueue({ id: 1 })
      expect(queue.dequeue()?.id).toBe(1)
    })

    it('should handle enqueue with string values', () => {
      const queue = new ConcurrentQueue<string>()
      queue.enqueue('hello')
      expect(queue.dequeue()).toBe('hello')
    })
  })

  describe('dequeue', () => {
    it('should return undefined for empty queue', () => {
      expect(q.dequeue()).toBeUndefined()
    })

    it('should return the first item', () => {
      q.enqueue(1)
      q.enqueue(2)
      expect(q.dequeue()).toBe(1)
    })

    it('should remove the item from the queue', () => {
      q.enqueue(1)
      q.dequeue()
      expect(q.size()).toBe(0)
    })

    it('should return items in FIFO order', () => {
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      expect(q.dequeue()).toBe(10)
      expect(q.dequeue()).toBe(20)
      expect(q.dequeue()).toBe(30)
    })

    it('should track totalDequeued counter', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.getStats().totalDequeued).toBe(1)
    })

    it('should not track failed dequeue in totalDequeued', () => {
      q.dequeue()
      expect(q.getStats().totalDequeued).toBe(0)
    })

    it('should return undefined after draining all items', () => {
      q.enqueue(1)
      q.dequeue()
      expect(q.dequeue()).toBeUndefined()
    })

    it('should handle multiple dequeue calls on empty queue', () => {
      expect(q.dequeue()).toBeUndefined()
      expect(q.dequeue()).toBeUndefined()
      expect(q.dequeue()).toBeUndefined()
    })
  })

  describe('peek', () => {
    it('should return undefined for empty queue', () => {
      expect(q.peek()).toBeUndefined()
    })

    it('should return the first item without removing it', () => {
      q.enqueue(1)
      q.enqueue(2)
      expect(q.peek()).toBe(1)
      expect(q.size()).toBe(2)
    })

    it('should return the next item after dequeue', () => {
      q.enqueue(10)
      q.enqueue(20)
      q.dequeue()
      expect(q.peek()).toBe(20)
    })

    it('should return undefined after all items are dequeued', () => {
      q.enqueue(1)
      q.dequeue()
      expect(q.peek()).toBeUndefined()
    })

    it('should not modify the queue', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.peek()
      expect(q.size()).toBe(2)
    })

    it('should return priority items first', () => {
      q.enqueue(1)
      q.enqueuePriority(99)
      q.enqueue(2)
      expect(q.peek()).toBe(99)
    })
  })

  describe('enqueuePriority', () => {
    it('should add item to front of queue', () => {
      q.enqueue(1)
      q.enqueuePriority(99)
      expect(q.dequeue()).toBe(99)
    })

    it('should be dequeued before regular items', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueuePriority(99)
      expect(q.dequeue()).toBe(99)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
    })

    it('should maintain LIFO order for multiple priority items', () => {
      q.enqueuePriority(10)
      q.enqueuePriority(20)
      q.enqueuePriority(30)
      expect(q.dequeue()).toBe(30)
      expect(q.dequeue()).toBe(20)
      expect(q.dequeue()).toBe(10)
    })

    it('should increment size', () => {
      q.enqueuePriority(1)
      expect(q.size()).toBe(1)
    })

    it('should increment totalEnqueued', () => {
      q.enqueuePriority(1)
      expect(q.getStats().totalEnqueued).toBe(1)
    })

    it('should work on empty queue', () => {
      q.enqueuePriority(1)
      expect(q.dequeue()).toBe(1)
    })

    it('should track priorityCount in stats', () => {
      q.enqueuePriority(1)
      q.enqueuePriority(2)
      expect(q.getStats().priorityCount).toBe(2)
    })

    it('should decrement priorityCount on dequeue', () => {
      q.enqueuePriority(1)
      q.enqueuePriority(2)
      q.dequeue()
      expect(q.getStats().priorityCount).toBe(1)
    })

    it('should mix priority and regular items correctly', () => {
      q.enqueue(1)
      q.enqueuePriority(10)
      q.enqueue(2)
      q.enqueuePriority(20)
      expect(q.dequeue()).toBe(20)
      expect(q.dequeue()).toBe(10)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
    })
  })

  describe('enqueueBatch', () => {
    it('should add multiple items', () => {
      q.enqueueBatch([1, 2, 3])
      expect(q.size()).toBe(3)
    })

    it('should return the number of items added', () => {
      expect(q.enqueueBatch([1, 2, 3])).toBe(3)
    })

    it('should return 0 for empty array', () => {
      expect(q.enqueueBatch([])).toBe(0)
    })

    it('should respect maxSize limit', () => {
      const queue = new ConcurrentQueue<number>({ maxSize: 2 })
      expect(queue.enqueueBatch([1, 2, 3, 4])).toBe(2)
    })

    it('should add items in order', () => {
      q.enqueueBatch([10, 20, 30])
      expect(q.dequeue()).toBe(10)
      expect(q.dequeue()).toBe(20)
      expect(q.dequeue()).toBe(30)
    })

    it('should partially add when near capacity', () => {
      const queue = new ConcurrentQueue<number>({ maxSize: 3 })
      queue.enqueue(1)
      expect(queue.enqueueBatch([2, 3, 4, 5])).toBe(2)
      expect(queue.size()).toBe(3)
    })

    it('should track totalRejected for rejected items', () => {
      const queue = new ConcurrentQueue<number>({ maxSize: 2 })
      queue.enqueueBatch([1, 2, 3, 4])
      expect(queue.getStats().totalRejected).toBe(2)
    })
  })

  describe('dequeueBatch', () => {
    it('should return empty array for empty queue', () => {
      expect(q.dequeueBatch(5)).toEqual([])
    })

    it('should return the requested number of items', () => {
      q.enqueueBatch([1, 2, 3, 4, 5])
      expect(q.dequeueBatch(3)).toEqual([1, 2, 3])
    })

    it('should return fewer items if count exceeds size', () => {
      q.enqueueBatch([1, 2])
      expect(q.dequeueBatch(5)).toEqual([1, 2])
    })

    it('should remove items from queue', () => {
      q.enqueueBatch([1, 2, 3])
      q.dequeueBatch(2)
      expect(q.size()).toBe(1)
    })

    it('should return empty array for count 0', () => {
      q.enqueue(1)
      expect(q.dequeueBatch(0)).toEqual([])
    })

    it('should dequeue priority items first', () => {
      q.enqueue(1)
      q.enqueuePriority(99)
      q.enqueue(2)
      expect(q.dequeueBatch(2)).toEqual([99, 1])
    })

    it('should drain entire queue', () => {
      q.enqueueBatch([1, 2, 3])
      expect(q.dequeueBatch(3)).toEqual([1, 2, 3])
      expect(q.isEmpty()).toBe(true)
    })
  })

  describe('size', () => {
    it('should return 0 for new queue', () => {
      expect(q.size()).toBe(0)
    })

    it('should return correct size after enqueues', () => {
      q.enqueue(1)
      q.enqueue(2)
      expect(q.size()).toBe(2)
    })

    it('should return correct size after dequeues', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.size()).toBe(1)
    })

    it('should return 0 after clear', () => {
      q.enqueue(1)
      q.clear()
      expect(q.size()).toBe(0)
    })

    it('should include priority items in size', () => {
      q.enqueue(1)
      q.enqueuePriority(2)
      expect(q.size()).toBe(2)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new queue', () => {
      expect(q.isEmpty()).toBe(true)
    })

    it('should return false after enqueue', () => {
      q.enqueue(1)
      expect(q.isEmpty()).toBe(false)
    })

    it('should return true after dequeueing all items', () => {
      q.enqueue(1)
      q.dequeue()
      expect(q.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      q.enqueue(1)
      q.clear()
      expect(q.isEmpty()).toBe(true)
    })

    it('should return false with priority items', () => {
      q.enqueuePriority(1)
      expect(q.isEmpty()).toBe(false)
    })
  })

  describe('isFull', () => {
    it('should return false for unbounded queue', () => {
      q.enqueue(1)
      expect(q.isFull()).toBe(false)
    })

    it('should return false when not at capacity', () => {
      const queue = new ConcurrentQueue<number>({ maxSize: 5 })
      queue.enqueue(1)
      expect(queue.isFull()).toBe(false)
    })

    it('should return true when at capacity', () => {
      const queue = new ConcurrentQueue<number>({ maxSize: 2 })
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.isFull()).toBe(true)
    })

    it('should return false after dequeue from full queue', () => {
      const queue = new ConcurrentQueue<number>({ maxSize: 2 })
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      expect(queue.isFull()).toBe(false)
    })

    it('should return false for empty bounded queue', () => {
      const queue = new ConcurrentQueue<number>({ maxSize: 5 })
      expect(queue.isFull()).toBe(false)
    })

    it('should consider priority items in capacity', () => {
      const queue = new ConcurrentQueue<number>({ maxSize: 2 })
      queue.enqueuePriority(1)
      queue.enqueue(2)
      expect(queue.isFull()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all items', () => {
      q.enqueueBatch([1, 2, 3])
      q.clear()
      expect(q.size()).toBe(0)
    })

    it('should allow enqueue after clear', () => {
      q.enqueue(1)
      q.clear()
      q.enqueue(2)
      expect(q.size()).toBe(1)
      expect(q.dequeue()).toBe(2)
    })

    it('should handle clearing empty queue', () => {
      q.clear()
      expect(q.size()).toBe(0)
    })

    it('should clear priority items too', () => {
      q.enqueuePriority(1)
      q.enqueue(2)
      q.clear()
      expect(q.size()).toBe(0)
      expect(q.dequeue()).toBeUndefined()
    })

    it('should reset priorityCount', () => {
      q.enqueuePriority(1)
      q.enqueuePriority(2)
      q.clear()
      expect(q.getStats().priorityCount).toBe(0)
    })

    it('should produce empty toArray after clear', () => {
      q.enqueueBatch([1, 2, 3])
      q.clear()
      expect(q.toArray()).toEqual([])
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty queue', () => {
      expect(q.toArray()).toEqual([])
    })

    it('should return items in dequeue order', () => {
      q.enqueueBatch([1, 2, 3])
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('should not modify the queue', () => {
      q.enqueueBatch([1, 2])
      q.toArray()
      expect(q.size()).toBe(2)
    })

    it('should include priority items first', () => {
      q.enqueue(1)
      q.enqueuePriority(99)
      q.enqueue(2)
      expect(q.toArray()).toEqual([99, 1, 2])
    })

    it('should handle queue with only priority items', () => {
      q.enqueuePriority(1)
      q.enqueuePriority(2)
      expect(q.toArray()).toEqual([2, 1])
    })
  })

  describe('clone', () => {
    it('should create an independent copy', () => {
      q.enqueue(1)
      q.enqueue(2)
      const cloned = q.clone()
      expect(cloned.size()).toBe(2)
      expect(cloned.dequeue()).toBe(1)
      expect(q.size()).toBe(2)
    })

    it('should preserve item order', () => {
      q.enqueueBatch([1, 2, 3])
      const cloned = q.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3])
    })

    it('should preserve priority items', () => {
      q.enqueue(1)
      q.enqueuePriority(99)
      const cloned = q.clone()
      expect(cloned.dequeue()).toBe(99)
      expect(cloned.dequeue()).toBe(1)
    })

    it('should preserve maxSize', () => {
      const queue = new ConcurrentQueue<number>({ maxSize: 5 })
      queue.enqueue(1)
      const cloned = queue.clone()
      expect(cloned.getStats().maxSize).toBe(5)
    })

    it('should clone empty queue', () => {
      const cloned = q.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should clone queue with mixed items', () => {
      q.enqueue(1)
      q.enqueuePriority(10)
      q.enqueue(2)
      q.enqueuePriority(20)
      const cloned = q.clone()
      expect(cloned.toArray()).toEqual([20, 10, 1, 2])
    })

    it('modifications to clone should not affect original', () => {
      q.enqueue(1)
      const cloned = q.clone()
      cloned.enqueue(2)
      expect(q.size()).toBe(1)
      expect(cloned.size()).toBe(2)
    })
  })

  describe('drain', () => {
    it('should return all items', () => {
      q.enqueueBatch([1, 2, 3])
      expect(q.drain()).toEqual([1, 2, 3])
    })

    it('should empty the queue', () => {
      q.enqueueBatch([1, 2, 3])
      q.drain()
      expect(q.isEmpty()).toBe(true)
    })

    it('should return empty array for empty queue', () => {
      expect(q.drain()).toEqual([])
    })

    it('should include priority items', () => {
      q.enqueue(1)
      q.enqueuePriority(99)
      expect(q.drain()).toEqual([99, 1])
    })

    it('should allow operations after drain', () => {
      q.enqueue(1)
      q.drain()
      q.enqueue(2)
      expect(q.dequeue()).toBe(2)
    })
  })

  describe('forEach', () => {
    it('should iterate over all items', () => {
      q.enqueueBatch([1, 2, 3])
      const items: number[] = []
      q.forEach((item) => items.push(item))
      expect(items).toEqual([1, 2, 3])
    })

    it('should provide correct indices', () => {
      q.enqueueBatch([10, 20, 30])
      const indices: number[] = []
      q.forEach((_item, index) => indices.push(index))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should iterate priority items first', () => {
      q.enqueue(1)
      q.enqueuePriority(99)
      q.enqueue(2)
      const items: number[] = []
      q.forEach((item) => items.push(item))
      expect(items).toEqual([99, 1, 2])
    })

    it('should handle empty queue', () => {
      let calls = 0
      q.forEach(() => calls++)
      expect(calls).toBe(0)
    })

    it('should not modify the queue', () => {
      q.enqueueBatch([1, 2])
      q.forEach(() => {})
      expect(q.size()).toBe(2)
    })

    it('should handle single item', () => {
      q.enqueue(42)
      const items: number[] = []
      q.forEach((item) => items.push(item))
      expect(items).toEqual([42])
    })
  })

  describe('filter', () => {
    it('should return matching items', () => {
      q.enqueueBatch([1, 2, 3, 4, 5])
      expect(q.filter((x) => x > 3)).toEqual([4, 5])
    })

    it('should return empty array when nothing matches', () => {
      q.enqueueBatch([1, 2, 3])
      expect(q.filter((x) => x > 10)).toEqual([])
    })

    it('should return all items when all match', () => {
      q.enqueueBatch([2, 4, 6])
      expect(q.filter((x) => x % 2 === 0)).toEqual([2, 4, 6])
    })

    it('should not modify the queue', () => {
      q.enqueueBatch([1, 2, 3])
      q.filter((x) => x > 1)
      expect(q.size()).toBe(3)
    })

    it('should return empty array for empty queue', () => {
      expect(q.filter(() => true)).toEqual([])
    })

    it('should include priority items in filtered results', () => {
      q.enqueue(1)
      q.enqueuePriority(5)
      q.enqueue(3)
      expect(q.filter((x) => x >= 3)).toEqual([5, 3])
    })
  })

  describe('remove', () => {
    it('should remove matching items', () => {
      q.enqueueBatch([1, 2, 3, 2, 4])
      expect(q.remove((x) => x === 2)).toBe(2)
      expect(q.toArray()).toEqual([1, 3, 4])
    })

    it('should return 0 when nothing matches', () => {
      q.enqueueBatch([1, 2, 3])
      expect(q.remove((x) => x > 10)).toBe(0)
    })

    it('should remove from priority items', () => {
      q.enqueuePriority(5)
      q.enqueue(1)
      q.enqueuePriority(10)
      expect(q.remove((x) => x === 5)).toBe(1)
      expect(q.toArray()).toEqual([10, 1])
    })

    it('should handle removing all items', () => {
      q.enqueueBatch([2, 4, 6])
      expect(q.remove(() => true)).toBe(3)
      expect(q.isEmpty()).toBe(true)
    })

    it('should handle removing from empty queue', () => {
      expect(q.remove(() => true)).toBe(0)
    })

    it('should update size correctly', () => {
      q.enqueueBatch([1, 2, 3, 4, 5])
      q.remove((x) => x % 2 === 0)
      expect(q.size()).toBe(3)
    })

    it('should update priorityCount correctly', () => {
      q.enqueuePriority(1)
      q.enqueuePriority(2)
      q.enqueue(3)
      q.remove((x) => x <= 2)
      expect(q.getStats().priorityCount).toBe(0)
    })

    it('should maintain order of remaining items', () => {
      q.enqueueBatch([1, 2, 3, 4, 5])
      q.remove((x) => x % 2 === 0)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(3)
      expect(q.dequeue()).toBe(5)
    })

    it('should remove head correctly', () => {
      q.enqueueBatch([1, 2, 3])
      q.remove((x) => x === 1)
      expect(q.dequeue()).toBe(2)
    })

    it('should remove tail correctly', () => {
      q.enqueueBatch([1, 2, 3])
      q.remove((x) => x === 3)
      expect(q.toArray()).toEqual([1, 2])
    })

    it('should remove priority head correctly', () => {
      q.enqueuePriority(1)
      q.enqueuePriority(2)
      q.remove((x) => x === 2)
      expect(q.toArray()).toEqual([1])
    })
  })

  describe('contains', () => {
    it('should return true when item exists', () => {
      q.enqueue(1)
      expect(q.contains(1)).toBe(true)
    })

    it('should return false when item does not exist', () => {
      q.enqueue(1)
      expect(q.contains(2)).toBe(false)
    })

    it('should return false for empty queue', () => {
      expect(q.contains(1)).toBe(false)
    })

    it('should find priority items', () => {
      q.enqueuePriority(99)
      expect(q.contains(99)).toBe(true)
    })

    it('should not find removed items', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.contains(1)).toBe(false)
    })

    it('should find items after dequeue operations', () => {
      q.enqueueBatch([1, 2, 3])
      q.dequeue()
      expect(q.contains(2)).toBe(true)
      expect(q.contains(3)).toBe(true)
    })
  })

  describe('Symbol.iterator', () => {
    it('should be iterable', () => {
      q.enqueueBatch([1, 2, 3])
      const items: number[] = []
      for (const item of q) {
        items.push(item)
      }
      expect(items).toEqual([1, 2, 3])
    })

    it('should handle empty queue iteration', () => {
      const items: number[] = []
      for (const item of q) {
        items.push(item)
      }
      expect(items).toEqual([])
    })

    it('should iterate priority items first', () => {
      q.enqueue(1)
      q.enqueuePriority(99)
      q.enqueue(2)
      const items: number[] = []
      for (const item of q) {
        items.push(item)
      }
      expect(items).toEqual([99, 1, 2])
    })

    it('should work with spread operator', () => {
      q.enqueueBatch([1, 2, 3])
      expect([...q]).toEqual([1, 2, 3])
    })

    it('should work with Array.from', () => {
      q.enqueueBatch([1, 2, 3])
      expect(Array.from(q)).toEqual([1, 2, 3])
    })

    it('should not modify the queue', () => {
      q.enqueueBatch([1, 2, 3])
      for (const _item of q) {
        void _item
      }
      expect(q.size()).toBe(3)
    })
  })

  describe('getStats', () => {
    it('should return correct stats for empty queue', () => {
      const stats = q.getStats()
      expect(stats.size).toBe(0)
      expect(stats.isEmpty).toBe(true)
      expect(stats.isFull).toBe(false)
      expect(stats.totalEnqueued).toBe(0)
      expect(stats.totalDequeued).toBe(0)
      expect(stats.totalRejected).toBe(0)
      expect(stats.priorityCount).toBe(0)
    })

    it('should track totalEnqueued', () => {
      q.enqueue(1)
      q.enqueue(2)
      expect(q.getStats().totalEnqueued).toBe(2)
    })

    it('should track totalDequeued', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.getStats().totalDequeued).toBe(1)
    })

    it('should track totalRejected', () => {
      const queue = new ConcurrentQueue<number>({ maxSize: 1 })
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.getStats().totalRejected).toBe(1)
    })

    it('should track priorityCount', () => {
      q.enqueuePriority(1)
      q.enqueuePriority(2)
      expect(q.getStats().priorityCount).toBe(2)
    })

    it('should reflect current size', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.getStats().size).toBe(1)
    })

    it('should reflect maxSize', () => {
      const queue = new ConcurrentQueue<number>({ maxSize: 10 })
      expect(queue.getStats().maxSize).toBe(10)
    })

    it('should reflect isFull correctly', () => {
      const queue = new ConcurrentQueue<number>({ maxSize: 2 })
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.getStats().isFull).toBe(true)
    })

    it('should persist stats across clear', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      q.clear()
      const stats = q.getStats()
      expect(stats.totalEnqueued).toBe(2)
      expect(stats.totalDequeued).toBe(1)
      expect(stats.size).toBe(0)
    })

    it('should track enqueuePriority in totalEnqueued', () => {
      q.enqueuePriority(1)
      expect(q.getStats().totalEnqueued).toBe(1)
    })
  })

  describe('concurrent-style operations', () => {
    it('should handle interleaved enqueue and dequeue', () => {
      q.enqueue(1)
      expect(q.dequeue()).toBe(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
    })

    it('should handle enqueue-dequeue with priority', () => {
      q.enqueue(1)
      q.enqueuePriority(10)
      expect(q.dequeue()).toBe(10)
      q.enqueue(2)
      q.enqueuePriority(20)
      expect(q.dequeue()).toBe(20)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
    })

    it('should handle batch operations interleaved with singles', () => {
      q.enqueue(1)
      q.enqueueBatch([2, 3])
      q.enqueue(4)
      expect(q.dequeueBatch(2)).toEqual([1, 2])
      expect(q.dequeue()).toBe(3)
      expect(q.dequeue()).toBe(4)
    })

    it('should handle stress pattern', () => {
      for (let i = 0; i < 100; i++) {
        q.enqueue(i)
      }
      for (let i = 0; i < 50; i++) {
        q.dequeue()
      }
      expect(q.size()).toBe(50)
      expect(q.peek()).toBe(50)
    })

    it('should handle fill-drain-repeat pattern', () => {
      for (let round = 0; round < 5; round++) {
        q.enqueueBatch([1, 2, 3])
        expect(q.drain()).toEqual([1, 2, 3])
      }
      expect(q.isEmpty()).toBe(true)
    })

    it('should handle mixed priority and regular operations', () => {
      q.enqueue(1)
      q.enqueuePriority(100)
      q.enqueue(2)
      q.enqueuePriority(200)
      q.enqueue(3)
      const drained = q.drain()
      expect(drained).toEqual([200, 100, 1, 2, 3])
    })
  })

  describe('edge cases', () => {
    it('should handle maxSize of 1', () => {
      const queue = new ConcurrentQueue<number>({ maxSize: 1 })
      expect(queue.enqueue(1)).toBe(true)
      expect(queue.enqueue(2)).toBe(false)
      expect(queue.dequeue()).toBe(1)
      expect(queue.isEmpty()).toBe(true)
    })

    it('should handle maxSize of 0', () => {
      const queue = new ConcurrentQueue<number>({ maxSize: 0 })
      expect(queue.enqueue(1)).toBe(false)
      expect(queue.isEmpty()).toBe(true)
    })

    it('should handle single item lifecycle', () => {
      q.enqueue(42)
      expect(q.size()).toBe(1)
      expect(q.peek()).toBe(42)
      expect(q.contains(42)).toBe(true)
      expect(q.dequeue()).toBe(42)
      expect(q.isEmpty()).toBe(true)
    })

    it('should handle enqueue after drain', () => {
      q.enqueue(1)
      q.drain()
      q.enqueue(2)
      expect(q.dequeue()).toBe(2)
    })

    it('should handle clear after clear', () => {
      q.clear()
      q.clear()
      expect(q.size()).toBe(0)
    })

    it('should handle clone after clear', () => {
      q.enqueue(1)
      q.clear()
      const cloned = q.clone()
      expect(cloned.size()).toBe(0)
    })

    it('should handle toArray after drain', () => {
      q.enqueue(1)
      q.drain()
      expect(q.toArray()).toEqual([])
    })

    it('should handle boolean values', () => {
      const queue = new ConcurrentQueue<boolean>()
      queue.enqueue(true)
      queue.enqueue(false)
      expect(queue.dequeue()).toBe(true)
      expect(queue.dequeue()).toBe(false)
    })

    it('should handle zero values', () => {
      q.enqueue(0)
      expect(q.contains(0)).toBe(true)
      expect(q.dequeue()).toBe(0)
    })

    it('should handle empty string values', () => {
      const queue = new ConcurrentQueue<string>()
      queue.enqueue('')
      expect(queue.contains('')).toBe(true)
      expect(queue.dequeue()).toBe('')
    })

    it('should handle NaN values', () => {
      q.enqueue(NaN)
      expect(q.size()).toBe(1)
      const dequeued = q.dequeue()
      expect(Number.isNaN(dequeued)).toBe(true)
    })

    it('should handle large number of items', () => {
      for (let i = 0; i < 1000; i++) {
        q.enqueue(i)
      }
      expect(q.size()).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(q.dequeue()).toBe(i)
      }
      expect(q.isEmpty()).toBe(true)
    })

    it('should handle enqueueBatch with maxSize 0', () => {
      const queue = new ConcurrentQueue<number>({ maxSize: 0 })
      expect(queue.enqueueBatch([1, 2, 3])).toBe(0)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_CONCURRENT_QUEUE_OPTIONS', () => {
      expect(DEFAULT_CONCURRENT_QUEUE_OPTIONS.maxSize).toBe(Infinity)
    })

    it('should support ConcurrentQueueOptions type', () => {
      const opts: ConcurrentQueueOptions = {
        maxSize: 10,
      }
      expect(opts.maxSize).toBe(10)
    })

    it('should support ConcurrentQueueStats type', () => {
      const stats: ConcurrentQueueStats = {
        size: 0,
        isEmpty: true,
        isFull: false,
        maxSize: 10,
        totalEnqueued: 0,
        totalDequeued: 0,
        totalRejected: 0,
        priorityCount: 0,
      }
      expect(stats.size).toBe(0)
    })

    it('should work with different generic types', () => {
      const numQ = new ConcurrentQueue<number>()
      numQ.enqueue(42)
      expect(numQ.dequeue()).toBe(42)

      const strQ = new ConcurrentQueue<string>()
      strQ.enqueue('test')
      expect(strQ.dequeue()).toBe('test')
    })
  })
})
