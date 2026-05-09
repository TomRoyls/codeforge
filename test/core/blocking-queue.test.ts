import { describe, it, expect, beforeEach } from 'vitest'
import { BlockingQueue } from '../../src/core/blocking-queue/blocking-queue.js'
import { DEFAULT_BLOCKING_QUEUE_CAPACITY } from '../../src/core/blocking-queue/types.js'
import type { BlockingQueueOptions } from '../../src/core/blocking-queue/types.js'

describe('BlockingQueue', () => {
  let q: BlockingQueue<number>

  beforeEach(() => {
    q = new BlockingQueue<number>(16)
  })

  describe('constructor', () => {
    it('should create queue with number capacity', () => {
      const queue = new BlockingQueue<number>(10)
      expect(queue.capacity).toBe(10)
      expect(queue.size).toBe(0)
      expect(queue.isEmpty()).toBe(true)
    })

    it('should create queue with options object', () => {
      const queue = new BlockingQueue<number>({ capacity: 5 })
      expect(queue.capacity).toBe(5)
    })

    it('should create queue with default capacity', () => {
      const queue = new BlockingQueue<number>()
      expect(queue.capacity).toBe(DEFAULT_BLOCKING_QUEUE_CAPACITY)
    })

    it('should create queue with empty options', () => {
      const queue = new BlockingQueue<number>({})
      expect(queue.capacity).toBe(DEFAULT_BLOCKING_QUEUE_CAPACITY)
    })

    it('should clamp capacity to minimum 1', () => {
      const queue = new BlockingQueue<number>(0)
      expect(queue.capacity).toBe(1)
    })

    it('should clamp negative capacity to 1', () => {
      const queue = new BlockingQueue<number>(-5)
      expect(queue.capacity).toBe(1)
    })

    it('should clamp capacity 0 in options to 1', () => {
      const queue = new BlockingQueue<number>({ capacity: 0 })
      expect(queue.capacity).toBe(1)
    })

    it('should create queue with capacity 1', () => {
      const queue = new BlockingQueue<number>(1)
      expect(queue.capacity).toBe(1)
      expect(queue.size).toBe(0)
    })

    it('should be empty on creation', () => {
      expect(q.isEmpty()).toBe(true)
      expect(q.size).toBe(0)
    })

    it('should not be full on creation', () => {
      expect(q.isFull()).toBe(false)
    })
  })

  describe('enqueue', () => {
    it('should add an item to the queue', () => {
      q.enqueue(1)
      expect(q.size).toBe(1)
    })

    it('should return true on successful enqueue', () => {
      expect(q.enqueue(1)).toBe(true)
    })

    it('should return false when queue is full', () => {
      const queue = new BlockingQueue<number>(2)
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.enqueue(3)).toBe(false)
    })

    it('should not increment size when full', () => {
      const queue = new BlockingQueue<number>(2)
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.size).toBe(2)
    })

    it('should maintain FIFO order', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
    })

    it('should allow enqueue after dequeue from full queue', () => {
      const queue = new BlockingQueue<number>(2)
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      expect(queue.enqueue(3)).toBe(true)
    })

    it('should handle enqueue with undefined values', () => {
      const queue = new BlockingQueue<number | undefined>(4)
      expect(queue.enqueue(undefined)).toBe(true)
      expect(queue.dequeue()).toBeUndefined()
    })

    it('should handle enqueue with null values', () => {
      const queue = new BlockingQueue<number | null>(4)
      expect(queue.enqueue(null)).toBe(true)
      expect(queue.dequeue()).toBeNull()
    })

    it('should handle enqueue with object values', () => {
      const queue = new BlockingQueue<{ id: number }>(4)
      queue.enqueue({ id: 1 })
      expect(queue.dequeue()?.id).toBe(1)
    })

    it('should handle enqueue with string values', () => {
      const queue = new BlockingQueue<string>(4)
      queue.enqueue('hello')
      expect(queue.dequeue()).toBe('hello')
    })

    it('should handle boolean values', () => {
      const queue = new BlockingQueue<boolean>(4)
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
      const queue = new BlockingQueue<string>(4)
      queue.enqueue('')
      expect(queue.contains('')).toBe(true)
      expect(queue.dequeue()).toBe('')
    })

    it('should handle NaN values', () => {
      q.enqueue(NaN)
      expect(q.size).toBe(1)
      const dequeued = q.dequeue()
      expect(Number.isNaN(dequeued)).toBe(true)
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
      expect(q.size).toBe(0)
    })

    it('should return items in FIFO order', () => {
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      expect(q.dequeue()).toBe(10)
      expect(q.dequeue()).toBe(20)
      expect(q.dequeue()).toBe(30)
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

    it('should handle dequeue on capacity-1 queue', () => {
      const queue = new BlockingQueue<number>(1)
      queue.enqueue(42)
      expect(queue.dequeue()).toBe(42)
      expect(queue.isEmpty()).toBe(true)
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
      expect(q.size).toBe(2)
    })

    it('should return the next item after dequeue', () => {
      q.enqueue(10)
      q.enqueue(20)
      q.dequeue()
      expect(q.peek()).toBe(20)
    })

    it('should return undefined after all items dequeued', () => {
      q.enqueue(1)
      q.dequeue()
      expect(q.peek()).toBeUndefined()
    })

    it('should not modify the queue', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.peek()
      expect(q.size).toBe(2)
    })

    it('should show first item after wrap-around', () => {
      const queue = new BlockingQueue<number>(3)
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      queue.enqueue(4)
      expect(queue.peek()).toBe(2)
    })
  })

  describe('peekBack', () => {
    it('should return undefined for empty queue', () => {
      expect(q.peekBack()).toBeUndefined()
    })

    it('should return the last item without removing it', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.peekBack()).toBe(3)
      expect(q.size).toBe(3)
    })

    it('should return the only item', () => {
      q.enqueue(42)
      expect(q.peekBack()).toBe(42)
    })

    it('should update after enqueue', () => {
      q.enqueue(1)
      expect(q.peekBack()).toBe(1)
      q.enqueue(2)
      expect(q.peekBack()).toBe(2)
    })

    it('should update after dequeue', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect(q.peekBack()).toBe(3)
    })

    it('should not modify the queue', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.peekBack()
      expect(q.size).toBe(2)
    })

    it('should show last item after wrap-around', () => {
      const queue = new BlockingQueue<number>(3)
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      queue.enqueue(4)
      expect(queue.peekBack()).toBe(4)
    })
  })

  describe('isFull', () => {
    it('should return false when not at capacity', () => {
      expect(q.isFull()).toBe(false)
    })

    it('should return true when at capacity', () => {
      const queue = new BlockingQueue<number>(2)
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.isFull()).toBe(true)
    })

    it('should return false after dequeue from full queue', () => {
      const queue = new BlockingQueue<number>(2)
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      expect(queue.isFull()).toBe(false)
    })

    it('should return false for empty queue', () => {
      expect(q.isFull()).toBe(false)
    })

    it('should be full with capacity 1 after one enqueue', () => {
      const queue = new BlockingQueue<number>(1)
      queue.enqueue(1)
      expect(queue.isFull()).toBe(true)
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
  })

  describe('size (getter)', () => {
    it('should return 0 for new queue', () => {
      expect(q.size).toBe(0)
    })

    it('should return correct size after enqueues', () => {
      q.enqueue(1)
      q.enqueue(2)
      expect(q.size).toBe(2)
    })

    it('should return correct size after dequeues', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.size).toBe(1)
    })

    it('should return 0 after clear', () => {
      q.enqueue(1)
      q.clear()
      expect(q.size).toBe(0)
    })
  })

  describe('capacity (getter)', () => {
    it('should return the configured capacity', () => {
      const queue = new BlockingQueue<number>(10)
      expect(queue.capacity).toBe(10)
    })

    it('should return 1 for minimum capacity', () => {
      const queue = new BlockingQueue<number>(1)
      expect(queue.capacity).toBe(1)
    })
  })

  describe('remainingCapacity', () => {
    it('should return full capacity for empty queue', () => {
      const queue = new BlockingQueue<number>(5)
      expect(queue.remainingCapacity()).toBe(5)
    })

    it('should return 0 for full queue', () => {
      const queue = new BlockingQueue<number>(2)
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.remainingCapacity()).toBe(0)
    })

    it('should return correct partial capacity', () => {
      const queue = new BlockingQueue<number>(5)
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.remainingCapacity()).toBe(3)
    })

    it('should update after dequeue', () => {
      const queue = new BlockingQueue<number>(3)
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      expect(queue.remainingCapacity()).toBe(1)
    })

    it('should update after drain', () => {
      const queue = new BlockingQueue<number>(5)
      queue.enqueue(1)
      queue.enqueue(2)
      queue.drain()
      expect(queue.remainingCapacity()).toBe(5)
    })

    it('should update after clear', () => {
      const queue = new BlockingQueue<number>(4)
      queue.enqueue(1)
      queue.clear()
      expect(queue.remainingCapacity()).toBe(4)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty queue', () => {
      expect(q.toArray()).toEqual([])
    })

    it('should return items in FIFO order', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('should not modify the queue', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.toArray()
      expect(q.size).toBe(2)
    })

    it('should return correct order after wrap-around', () => {
      const queue = new BlockingQueue<number>(3)
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      queue.enqueue(4)
      expect(queue.toArray()).toEqual([2, 3, 4])
    })
  })

  describe('clear', () => {
    it('should remove all items', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.clear()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('should allow enqueue after clear', () => {
      q.enqueue(1)
      q.clear()
      q.enqueue(2)
      expect(q.size).toBe(1)
      expect(q.dequeue()).toBe(2)
    })

    it('should handle clearing empty queue', () => {
      q.clear()
      expect(q.size).toBe(0)
    })

    it('should produce empty toArray after clear', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      expect(q.toArray()).toEqual([])
    })

    it('should handle double clear', () => {
      q.enqueue(1)
      q.clear()
      q.clear()
      expect(q.size).toBe(0)
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

    it('should not find removed items', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.contains(1)).toBe(false)
    })

    it('should find items after dequeue operations', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect(q.contains(2)).toBe(true)
      expect(q.contains(3)).toBe(true)
    })

    it('should return false after clear', () => {
      q.enqueue(1)
      q.clear()
      expect(q.contains(1)).toBe(false)
    })

    it('should find items after wrap-around', () => {
      const queue = new BlockingQueue<number>(3)
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      queue.enqueue(4)
      expect(queue.contains(2)).toBe(true)
      expect(queue.contains(3)).toBe(true)
      expect(queue.contains(4)).toBe(true)
      expect(queue.contains(1)).toBe(false)
    })
  })

  describe('remove', () => {
    it('should remove first occurrence of item', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.remove(2)).toBe(true)
      expect(q.toArray()).toEqual([1, 3])
    })

    it('should return false when item not found', () => {
      q.enqueue(1)
      q.enqueue(2)
      expect(q.remove(3)).toBe(false)
    })

    it('should return false for empty queue', () => {
      expect(q.remove(1)).toBe(false)
    })

    it('should remove head element', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.remove(1)).toBe(true)
      expect(q.toArray()).toEqual([2, 3])
      expect(q.peek()).toBe(2)
    })

    it('should remove tail element', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.remove(3)).toBe(true)
      expect(q.toArray()).toEqual([1, 2])
      expect(q.peekBack()).toBe(2)
    })

    it('should remove only element', () => {
      q.enqueue(42)
      expect(q.remove(42)).toBe(true)
      expect(q.isEmpty()).toBe(true)
    })

    it('should remove first occurrence when duplicates exist', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.remove(2)).toBe(true)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('should decrement size', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.remove(2)
      expect(q.size).toBe(2)
    })

    it('should maintain order after removal', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.remove(2)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(3)
      expect(q.dequeue()).toBe(4)
    })

    it('should work after wrap-around', () => {
      const queue = new BlockingQueue<number>(3)
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      queue.enqueue(4)
      expect(queue.remove(3)).toBe(true)
      expect(queue.toArray()).toEqual([2, 4])
    })

    it('should handle remove on single-element queue', () => {
      const queue = new BlockingQueue<number>(1)
      queue.enqueue(99)
      expect(queue.remove(99)).toBe(true)
      expect(queue.isEmpty()).toBe(true)
    })
  })

  describe('drain', () => {
    it('should return all items', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.drain()).toEqual([1, 2, 3])
    })

    it('should empty the queue', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.drain()
      expect(q.isEmpty()).toBe(true)
      expect(q.size).toBe(0)
    })

    it('should return empty array for empty queue', () => {
      expect(q.drain()).toEqual([])
    })

    it('should allow operations after drain', () => {
      q.enqueue(1)
      q.drain()
      q.enqueue(2)
      expect(q.dequeue()).toBe(2)
    })

    it('should return correct items after wrap-around', () => {
      const queue = new BlockingQueue<number>(3)
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      queue.enqueue(4)
      expect(queue.drain()).toEqual([2, 3, 4])
    })
  })

  describe('forEach', () => {
    it('should iterate over all items', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const items: number[] = []
      q.forEach((item) => items.push(item))
      expect(items).toEqual([1, 2, 3])
    })

    it('should provide correct indices', () => {
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      const indices: number[] = []
      q.forEach((_item, index) => indices.push(index))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should handle empty queue', () => {
      let calls = 0
      q.forEach(() => calls++)
      expect(calls).toBe(0)
    })

    it('should not modify the queue', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.forEach(() => {})
      expect(q.size).toBe(2)
    })

    it('should handle single item', () => {
      q.enqueue(42)
      const items: number[] = []
      q.forEach((item) => items.push(item))
      expect(items).toEqual([42])
    })

    it('should iterate in FIFO order after wrap-around', () => {
      const queue = new BlockingQueue<number>(3)
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      queue.enqueue(4)
      const items: number[] = []
      queue.forEach((item) => items.push(item))
      expect(items).toEqual([2, 3, 4])
    })
  })

  describe('clone', () => {
    it('should create an independent copy', () => {
      q.enqueue(1)
      q.enqueue(2)
      const cloned = q.clone()
      expect(cloned.size).toBe(2)
      expect(cloned.dequeue()).toBe(1)
      expect(q.size).toBe(2)
    })

    it('should preserve item order', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const cloned = q.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3])
    })

    it('should preserve capacity', () => {
      const queue = new BlockingQueue<number>(5)
      queue.enqueue(1)
      const cloned = queue.clone()
      expect(cloned.capacity).toBe(5)
    })

    it('should clone empty queue', () => {
      const cloned = q.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('modifications to clone should not affect original', () => {
      q.enqueue(1)
      const cloned = q.clone()
      cloned.enqueue(2)
      expect(q.size).toBe(1)
      expect(cloned.size).toBe(2)
    })

    it('modifications to original should not affect clone', () => {
      q.enqueue(1)
      const cloned = q.clone()
      q.enqueue(2)
      expect(cloned.size).toBe(1)
    })

    it('should clone full queue', () => {
      const queue = new BlockingQueue<number>(3)
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      const cloned = queue.clone()
      expect(cloned.isFull()).toBe(true)
      expect(cloned.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('Symbol.iterator', () => {
    it('should be iterable', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
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

    it('should work with spread operator', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect([...q]).toEqual([1, 2, 3])
    })

    it('should work with Array.from', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(Array.from(q)).toEqual([1, 2, 3])
    })

    it('should not modify the queue', () => {
      q.enqueue(1)
      q.enqueue(2)
      for (const _item of q) {
        void _item
      }
      expect(q.size).toBe(2)
    })

    it('should iterate correctly after wrap-around', () => {
      const queue = new BlockingQueue<number>(3)
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      queue.enqueue(4)
      expect([...queue]).toEqual([2, 3, 4])
    })
  })

  describe('enqueueMany', () => {
    it('should add multiple items', () => {
      expect(q.enqueueMany([1, 2, 3])).toBe(3)
      expect(q.size).toBe(3)
    })

    it('should return 0 for empty array', () => {
      expect(q.enqueueMany([])).toBe(0)
    })

    it('should respect capacity limit', () => {
      const queue = new BlockingQueue<number>(2)
      expect(queue.enqueueMany([1, 2, 3, 4])).toBe(2)
      expect(queue.size).toBe(2)
    })

    it('should add items in order', () => {
      q.enqueueMany([10, 20, 30])
      expect(q.dequeue()).toBe(10)
      expect(q.dequeue()).toBe(20)
      expect(q.dequeue()).toBe(30)
    })

    it('should partially add when near capacity', () => {
      const queue = new BlockingQueue<number>(3)
      queue.enqueue(1)
      expect(queue.enqueueMany([2, 3, 4, 5])).toBe(2)
      expect(queue.size).toBe(3)
    })

    it('should return 0 when queue is full', () => {
      const queue = new BlockingQueue<number>(2)
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.enqueueMany([3, 4])).toBe(0)
    })

    it('should work after dequeue frees space', () => {
      const queue = new BlockingQueue<number>(3)
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      expect(queue.enqueueMany([4, 5])).toBe(1)
    })
  })

  describe('dequeueMany', () => {
    it('should return empty array for empty queue', () => {
      expect(q.dequeueMany(5)).toEqual([])
    })

    it('should return the requested number of items', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      expect(q.dequeueMany(3)).toEqual([1, 2, 3])
    })

    it('should return fewer items if count exceeds size', () => {
      q.enqueue(1)
      q.enqueue(2)
      expect(q.dequeueMany(5)).toEqual([1, 2])
    })

    it('should remove items from queue', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeueMany(2)
      expect(q.size).toBe(1)
    })

    it('should return empty array for count 0', () => {
      q.enqueue(1)
      expect(q.dequeueMany(0)).toEqual([])
    })

    it('should drain entire queue', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.dequeueMany(3)).toEqual([1, 2, 3])
      expect(q.isEmpty()).toBe(true)
    })

    it('should maintain FIFO order', () => {
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      const items = q.dequeueMany(2)
      expect(items).toEqual([10, 20])
      expect(q.peek()).toBe(30)
    })
  })

  describe('circular buffer wrap-around', () => {
    it('should handle full wrap-around cycle', () => {
      const queue = new BlockingQueue<number>(3)
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.dequeue()).toBe(1)
      expect(queue.dequeue()).toBe(2)
      queue.enqueue(4)
      queue.enqueue(5)
      expect(queue.toArray()).toEqual([3, 4, 5])
    })

    it('should handle multiple wrap-arounds', () => {
      const queue = new BlockingQueue<number>(3)
      for (let round = 0; round < 5; round++) {
        queue.enqueue(round * 3)
        queue.enqueue(round * 3 + 1)
        queue.enqueue(round * 3 + 2)
        expect(queue.dequeue()).toBe(round * 3)
        expect(queue.dequeue()).toBe(round * 3 + 1)
        expect(queue.dequeue()).toBe(round * 3 + 2)
      }
    })

    it('should handle enqueue-dequeue alternating with wrap-around', () => {
      const queue = new BlockingQueue<number>(2)
      for (let i = 0; i < 20; i++) {
        expect(queue.enqueue(i)).toBe(true)
        expect(queue.dequeue()).toBe(i)
      }
    })

    it('should handle wrap-around with peek', () => {
      const queue = new BlockingQueue<number>(3)
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      queue.enqueue(4)
      expect(queue.peek()).toBe(2)
      expect(queue.peekBack()).toBe(4)
    })

    it('should handle wrap-around with contains', () => {
      const queue = new BlockingQueue<number>(3)
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      queue.enqueue(4)
      expect(queue.contains(2)).toBe(true)
      expect(queue.contains(3)).toBe(true)
      expect(queue.contains(4)).toBe(true)
      expect(queue.contains(1)).toBe(false)
    })

    it('should handle wrap-around with remove', () => {
      const queue = new BlockingQueue<number>(3)
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      queue.enqueue(4)
      expect(queue.remove(3)).toBe(true)
      expect(queue.toArray()).toEqual([2, 4])
    })

    it('should handle wrap-around with forEach', () => {
      const queue = new BlockingQueue<number>(3)
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      queue.enqueue(4)
      const items: number[] = []
      queue.forEach((item) => items.push(item))
      expect(items).toEqual([2, 3, 4])
    })

    it('should handle wrap-around with clone', () => {
      const queue = new BlockingQueue<number>(3)
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      queue.enqueue(4)
      const cloned = queue.clone()
      expect(cloned.toArray()).toEqual([2, 3, 4])
    })
  })

  describe('boundary conditions', () => {
    it('should handle capacity of 1', () => {
      const queue = new BlockingQueue<number>(1)
      expect(queue.enqueue(1)).toBe(true)
      expect(queue.enqueue(2)).toBe(false)
      expect(queue.dequeue()).toBe(1)
      expect(queue.enqueue(2)).toBe(true)
      expect(queue.dequeue()).toBe(2)
    })

    it('should handle enqueue-dequeue on capacity 1 repeatedly', () => {
      const queue = new BlockingQueue<number>(1)
      for (let i = 0; i < 10; i++) {
        expect(queue.enqueue(i)).toBe(true)
        expect(queue.dequeue()).toBe(i)
      }
    })

    it('should handle single item lifecycle', () => {
      q.enqueue(42)
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(42)
      expect(q.peekBack()).toBe(42)
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

    it('should handle clone after clear', () => {
      q.enqueue(1)
      q.clear()
      const cloned = q.clone()
      expect(cloned.size).toBe(0)
    })

    it('should handle toArray after drain', () => {
      q.enqueue(1)
      q.drain()
      expect(q.toArray()).toEqual([])
    })

    it('should handle large number of items', () => {
      const queue = new BlockingQueue<number>(1000)
      for (let i = 0; i < 1000; i++) {
        queue.enqueue(i)
      }
      expect(queue.size).toBe(1000)
      expect(queue.isFull()).toBe(true)
      for (let i = 0; i < 1000; i++) {
        expect(queue.dequeue()).toBe(i)
      }
      expect(queue.isEmpty()).toBe(true)
    })

    it('should handle fill-drain-repeat pattern', () => {
      const queue = new BlockingQueue<number>(5)
      for (let round = 0; round < 10; round++) {
        queue.enqueueMany([1, 2, 3, 4, 5])
        expect(queue.drain()).toEqual([1, 2, 3, 4, 5])
      }
    })

    it('should handle interleaved enqueue and dequeue', () => {
      q.enqueue(1)
      expect(q.dequeue()).toBe(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
    })
  })

  describe('generic types', () => {
    it('should work with number type', () => {
      const queue = new BlockingQueue<number>(4)
      queue.enqueue(42)
      expect(queue.dequeue()).toBe(42)
    })

    it('should work with string type', () => {
      const queue = new BlockingQueue<string>(4)
      queue.enqueue('test')
      expect(queue.dequeue()).toBe('test')
    })

    it('should work with object type', () => {
      const queue = new BlockingQueue<{ x: number; y: number }>(4)
      queue.enqueue({ x: 1, y: 2 })
      const item = queue.dequeue()
      expect(item?.x).toBe(1)
      expect(item?.y).toBe(2)
    })

    it('should work with array type', () => {
      const queue = new BlockingQueue<number[]>(4)
      queue.enqueue([1, 2, 3])
      expect(queue.dequeue()).toEqual([1, 2, 3])
    })

    it('should work with Map type', () => {
      const queue = new BlockingQueue<Map<string, number>>(4)
      const m = new Map([['a', 1]])
      queue.enqueue(m)
      expect(queue.dequeue()?.get('a')).toBe(1)
    })

    it('should work with Set type', () => {
      const queue = new BlockingQueue<Set<number>>(4)
      const s = new Set([1, 2, 3])
      queue.enqueue(s)
      expect(queue.dequeue()?.has(2)).toBe(true)
    })

    it('should work with union type', () => {
      const queue = new BlockingQueue<number | string>(4)
      queue.enqueue(1)
      queue.enqueue('two')
      expect(queue.dequeue()).toBe(1)
      expect(queue.dequeue()).toBe('two')
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_BLOCKING_QUEUE_CAPACITY', () => {
      expect(DEFAULT_BLOCKING_QUEUE_CAPACITY).toBe(16)
    })

    it('should support BlockingQueueOptions type', () => {
      const opts: BlockingQueueOptions = { capacity: 10 }
      expect(opts.capacity).toBe(10)
    })
  })
})
