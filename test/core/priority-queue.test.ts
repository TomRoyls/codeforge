import { describe, it, expect, beforeEach } from 'vitest'
import { PriorityQueue } from '../../src/core/priority-queue/priority-queue.js'
import { DEFAULT_QUEUE_OPTIONS } from '../../src/core/priority-queue/types.js'
import type { PriorityItem, QueueOptions, QueueStats } from '../../src/core/priority-queue/types.js'

describe('PriorityQueue', () => {
  let queue: PriorityQueue<string>

  beforeEach(() => {
    queue = new PriorityQueue<string>()
  })

  describe('constructor', () => {
    it('should create a queue with default options', () => {
      const q = new PriorityQueue<number>()
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('should accept custom order option', () => {
      const q = new PriorityQueue<number>({ order: 'max' })
      q.enqueue('a', 1)
      q.enqueue('b', 5)
      expect(q.peek()).toBe('b')
    })

    it('should accept custom maxSize option', () => {
      const q = new PriorityQueue<number>({ maxSize: 3 })
      q.enqueue('a', 1)
      q.enqueue('b', 2)
      q.enqueue('c', 3)
      expect(q.enqueue('d', 4)).toBe(false)
    })

    it('should accept partial options', () => {
      const q = new PriorityQueue<number>({ order: 'max' })
      expect(q.isFull()).toBe(false)
    })

    it('should accept all options combined', () => {
      const q = new PriorityQueue<number>({ order: 'min', maxSize: 10 })
      expect(q.size()).toBe(0)
    })
  })

  describe('enqueue', () => {
    it('should add an item to the queue', () => {
      queue.enqueue('item', 1)
      expect(queue.size()).toBe(1)
    })

    it('should return true on successful enqueue', () => {
      expect(queue.enqueue('item', 1)).toBe(true)
    })

    it('should return false when queue is full', () => {
      const q = new PriorityQueue<string>({ maxSize: 2 })
      q.enqueue('a', 1)
      q.enqueue('b', 2)
      expect(q.enqueue('c', 3)).toBe(false)
    })

    it('should maintain min-heap order by default', () => {
      queue.enqueue('c', 3)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      expect(queue.peek()).toBe('a')
    })

    it('should maintain max-heap order', () => {
      const q = new PriorityQueue<string>({ order: 'max' })
      q.enqueue('a', 1)
      q.enqueue('c', 3)
      q.enqueue('b', 2)
      expect(q.peek()).toBe('c')
    })

    it('should handle duplicate priorities with FIFO tiebreaker', () => {
      queue.enqueue('first', 1)
      queue.enqueue('second', 1)
      expect(queue.dequeue()).toBe('first')
      expect(queue.dequeue()).toBe('second')
    })

    it('should handle negative priorities', () => {
      queue.enqueue('a', -5)
      queue.enqueue('b', 10)
      expect(queue.peek()).toBe('a')
    })

    it('should handle zero priority', () => {
      queue.enqueue('a', 0)
      queue.enqueue('b', 1)
      expect(queue.peek()).toBe('a')
    })

    it('should handle many elements', () => {
      for (let i = 100; i >= 1; i--) {
        queue.enqueue(`item-${i}`, i)
      }
      expect(queue.size()).toBe(100)
      expect(queue.peek()).toBe('item-1')
    })
  })

  describe('dequeue', () => {
    it('should return undefined for empty queue', () => {
      expect(queue.dequeue()).toBeUndefined()
    })

    it('should return the highest priority item (min-heap)', () => {
      queue.enqueue('b', 2)
      queue.enqueue('a', 1)
      queue.enqueue('c', 3)
      expect(queue.dequeue()).toBe('a')
    })

    it('should remove the item from the queue', () => {
      queue.enqueue('a', 1)
      queue.dequeue()
      expect(queue.size()).toBe(0)
    })

    it('should maintain heap order after dequeue', () => {
      queue.enqueue('d', 4)
      queue.enqueue('b', 2)
      queue.enqueue('a', 1)
      queue.enqueue('c', 3)
      expect(queue.dequeue()).toBe('a')
      expect(queue.dequeue()).toBe('b')
      expect(queue.dequeue()).toBe('c')
      expect(queue.dequeue()).toBe('d')
    })

    it('should handle single element dequeue', () => {
      queue.enqueue('only', 5)
      expect(queue.dequeue()).toBe('only')
      expect(queue.isEmpty()).toBe(true)
    })

    it('should handle dequeue on max-heap', () => {
      const q = new PriorityQueue<string>({ order: 'max' })
      q.enqueue('a', 1)
      q.enqueue('c', 3)
      q.enqueue('b', 2)
      expect(q.dequeue()).toBe('c')
      expect(q.dequeue()).toBe('b')
      expect(q.dequeue()).toBe('a')
    })

    it('should return items in correct order for duplicate priorities', () => {
      queue.enqueue('first', 5)
      queue.enqueue('second', 5)
      queue.enqueue('third', 5)
      expect(queue.dequeue()).toBe('first')
      expect(queue.dequeue()).toBe('second')
      expect(queue.dequeue()).toBe('third')
    })
  })

  describe('peek', () => {
    it('should return undefined for empty queue', () => {
      expect(queue.peek()).toBeUndefined()
    })

    it('should return the top item without removing it', () => {
      queue.enqueue('top', 1)
      queue.enqueue('bottom', 5)
      expect(queue.peek()).toBe('top')
      expect(queue.size()).toBe(2)
    })

    it('should return the max priority item for max-heap', () => {
      const q = new PriorityQueue<string>({ order: 'max' })
      q.enqueue('a', 1)
      q.enqueue('b', 5)
      expect(q.peek()).toBe('b')
    })

    it('should track peek count', () => {
      queue.enqueue('a', 1)
      queue.peek()
      queue.peek()
      expect(queue.getStats().peekCount).toBe(2)
    })

    it('should track peek count even on empty queue', () => {
      queue.peek()
      expect(queue.getStats().peekCount).toBe(1)
    })
  })

  describe('peekPriority', () => {
    it('should return undefined for empty queue', () => {
      expect(queue.peekPriority()).toBeUndefined()
    })

    it('should return the priority of the top item', () => {
      queue.enqueue('a', 42)
      expect(queue.peekPriority()).toBe(42)
    })

    it('should not remove the item', () => {
      queue.enqueue('a', 5)
      queue.peekPriority()
      expect(queue.size()).toBe(1)
    })
  })

  describe('size', () => {
    it('should return 0 for empty queue', () => {
      expect(queue.size()).toBe(0)
    })

    it('should return correct size after enqueues', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      expect(queue.size()).toBe(2)
    })

    it('should return correct size after dequeues', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.dequeue()
      expect(queue.size()).toBe(1)
    })

    it('should return 0 after clear', () => {
      queue.enqueue('a', 1)
      queue.clear()
      expect(queue.size()).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new queue', () => {
      expect(queue.isEmpty()).toBe(true)
    })

    it('should return false after enqueue', () => {
      queue.enqueue('a', 1)
      expect(queue.isEmpty()).toBe(false)
    })

    it('should return true after dequeueing all items', () => {
      queue.enqueue('a', 1)
      queue.dequeue()
      expect(queue.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      queue.enqueue('a', 1)
      queue.clear()
      expect(queue.isEmpty()).toBe(true)
    })
  })

  describe('isFull', () => {
    it('should return false for unbounded queue', () => {
      const q = new PriorityQueue<string>()
      q.enqueue('a', 1)
      expect(q.isFull()).toBe(false)
    })

    it('should return false when not at capacity', () => {
      const q = new PriorityQueue<string>({ maxSize: 5 })
      q.enqueue('a', 1)
      expect(q.isFull()).toBe(false)
    })

    it('should return true when at capacity', () => {
      const q = new PriorityQueue<string>({ maxSize: 2 })
      q.enqueue('a', 1)
      q.enqueue('b', 2)
      expect(q.isFull()).toBe(true)
    })

    it('should return false after dequeue from full queue', () => {
      const q = new PriorityQueue<string>({ maxSize: 2 })
      q.enqueue('a', 1)
      q.enqueue('b', 2)
      q.dequeue()
      expect(q.isFull()).toBe(false)
    })
  })

  describe('clear', () => {
    it('should remove all items', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.clear()
      expect(queue.size()).toBe(0)
    })

    it('should allow enqueue after clear', () => {
      queue.enqueue('a', 1)
      queue.clear()
      queue.enqueue('b', 2)
      expect(queue.size()).toBe(1)
      expect(queue.peek()).toBe('b')
    })

    it('should handle clearing empty queue', () => {
      queue.clear()
      expect(queue.size()).toBe(0)
    })
  })

  describe('contains', () => {
    it('should return false for empty queue', () => {
      expect(queue.contains('a')).toBe(false)
    })

    it('should return true for existing value', () => {
      queue.enqueue('a', 1)
      expect(queue.contains('a')).toBe(true)
    })

    it('should return false for missing value', () => {
      queue.enqueue('a', 1)
      expect(queue.contains('b')).toBe(false)
    })

    it('should return false after dequeue', () => {
      queue.enqueue('a', 1)
      queue.dequeue()
      expect(queue.contains('a')).toBe(false)
    })

    it('should work with object values by reference', () => {
      const obj = { id: 1 }
      const q = new PriorityQueue<{ id: number }>()
      q.enqueue(obj, 1)
      expect(q.contains(obj)).toBe(true)
    })

    it('should find values regardless of priority', () => {
      queue.enqueue('a', 100)
      expect(queue.contains('a')).toBe(true)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty queue', () => {
      expect(queue.toArray()).toEqual([])
    })

    it('should return items in priority order', () => {
      queue.enqueue('c', 3)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      const arr = queue.toArray()
      expect(arr[0]?.value).toBe('a')
      expect(arr[1]?.value).toBe('b')
      expect(arr[2]?.value).toBe('c')
    })

    it('should return items with correct structure', () => {
      queue.enqueue('item', 5)
      const arr = queue.toArray()
      expect(arr[0]).toHaveProperty('value')
      expect(arr[0]).toHaveProperty('priority')
      expect(arr[0]).toHaveProperty('insertedAt')
    })

    it('should not modify the original queue', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.toArray()
      expect(queue.size()).toBe(2)
    })

    it('should return items in max order for max-heap', () => {
      const q = new PriorityQueue<string>({ order: 'max' })
      q.enqueue('a', 1)
      q.enqueue('c', 3)
      q.enqueue('b', 2)
      const arr = q.toArray()
      expect(arr[0]?.value).toBe('c')
      expect(arr[1]?.value).toBe('b')
      expect(arr[2]?.value).toBe('a')
    })
  })

  describe('updatePriority', () => {
    it('should return false for missing value', () => {
      expect(queue.updatePriority('missing', 5)).toBe(false)
    })

    it('should return true for existing value', () => {
      queue.enqueue('a', 1)
      expect(queue.updatePriority('a', 10)).toBe(true)
    })

    it('should update the priority and reorder', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 5)
      queue.updatePriority('a', 10)
      expect(queue.peek()).toBe('b')
    })

    it('should bubble up when priority decreases in min-heap', () => {
      queue.enqueue('a', 5)
      queue.enqueue('b', 1)
      queue.enqueue('c', 3)
      queue.updatePriority('a', 0)
      expect(queue.peek()).toBe('a')
    })

    it('should sink down when priority increases in min-heap', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 5)
      queue.updatePriority('a', 10)
      expect(queue.peek()).toBe('b')
    })

    it('should handle update in max-heap', () => {
      const q = new PriorityQueue<string>({ order: 'max' })
      q.enqueue('a', 1)
      q.enqueue('b', 5)
      q.updatePriority('a', 10)
      expect(q.peek()).toBe('a')
    })

    it('should handle update to same priority', () => {
      queue.enqueue('a', 5)
      queue.updatePriority('a', 5)
      expect(queue.size()).toBe(1)
      expect(queue.peek()).toBe('a')
    })
  })

  describe('remove', () => {
    it('should return false for missing value', () => {
      expect(queue.remove('missing')).toBe(false)
    })

    it('should return true for existing value', () => {
      queue.enqueue('a', 1)
      expect(queue.remove('a')).toBe(true)
    })

    it('should decrease the size', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.remove('a')
      expect(queue.size()).toBe(1)
    })

    it('should maintain heap order after removal', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.remove('a')
      expect(queue.peek()).toBe('b')
    })

    it('should handle removing the only element', () => {
      queue.enqueue('only', 5)
      queue.remove('only')
      expect(queue.isEmpty()).toBe(true)
    })

    it('should handle removing middle element', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.remove('b')
      expect(queue.size()).toBe(2)
      expect(queue.dequeue()).toBe('a')
      expect(queue.dequeue()).toBe('c')
    })

    it('should handle removing from max-heap', () => {
      const q = new PriorityQueue<string>({ order: 'max' })
      q.enqueue('a', 1)
      q.enqueue('b', 5)
      q.enqueue('c', 3)
      q.remove('b')
      expect(q.peek()).toBe('c')
    })
  })

  describe('getStats', () => {
    it('should return correct stats for empty queue', () => {
      const stats = queue.getStats()
      expect(stats.size).toBe(0)
      expect(stats.maxSize).toBe(Infinity)
      expect(stats.peekCount).toBe(0)
      expect(stats.dequeueCount).toBe(0)
      expect(stats.enqueueCount).toBe(0)
    })

    it('should track enqueue count', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      expect(queue.getStats().enqueueCount).toBe(2)
    })

    it('should track dequeue count', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.dequeue()
      expect(queue.getStats().dequeueCount).toBe(1)
    })

    it('should track peek count', () => {
      queue.enqueue('a', 1)
      queue.peek()
      queue.peek()
      expect(queue.getStats().peekCount).toBe(2)
    })

    it('should reflect current size', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.dequeue()
      expect(queue.getStats().size).toBe(1)
    })

    it('should reflect custom maxSize', () => {
      const q = new PriorityQueue<string>({ maxSize: 10 })
      expect(q.getStats().maxSize).toBe(10)
    })
  })

  describe('drain', () => {
    it('should return empty array for empty queue', () => {
      expect(queue.drain()).toEqual([])
    })

    it('should return all items in priority order', () => {
      queue.enqueue('c', 3)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      const drained = queue.drain()
      expect(drained).toEqual(['a', 'b', 'c'])
    })

    it('should empty the queue', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.drain()
      expect(queue.isEmpty()).toBe(true)
    })

    it('should return values only, not PriorityItems', () => {
      queue.enqueue('a', 1)
      const drained = queue.drain()
      expect(typeof drained[0]).toBe('string')
    })

    it('should drain max-heap in correct order', () => {
      const q = new PriorityQueue<string>({ order: 'max' })
      q.enqueue('a', 1)
      q.enqueue('c', 3)
      q.enqueue('b', 2)
      expect(q.drain()).toEqual(['c', 'b', 'a'])
    })
  })

  describe('merge', () => {
    it('should return a new queue with items from both', () => {
      queue.enqueue('a', 1)
      const other = new PriorityQueue<string>()
      other.enqueue('b', 2)
      const merged = queue.merge(other)
      expect(merged.size()).toBe(2)
    })

    it('should not modify the original queues', () => {
      queue.enqueue('a', 1)
      const other = new PriorityQueue<string>()
      other.enqueue('b', 2)
      queue.merge(other)
      expect(queue.size()).toBe(1)
      expect(other.size()).toBe(1)
    })

    it('should produce correct ordering in merged queue', () => {
      queue.enqueue('b', 2)
      const other = new PriorityQueue<string>()
      other.enqueue('a', 1)
      other.enqueue('c', 3)
      const merged = queue.merge(other)
      expect(merged.dequeue()).toBe('a')
      expect(merged.dequeue()).toBe('b')
      expect(merged.dequeue()).toBe('c')
    })

    it('should handle merging empty queues', () => {
      const other = new PriorityQueue<string>()
      const merged = queue.merge(other)
      expect(merged.size()).toBe(0)
    })

    it('should handle merging with one empty queue', () => {
      queue.enqueue('a', 1)
      const other = new PriorityQueue<string>()
      const merged = queue.merge(other)
      expect(merged.size()).toBe(1)
      expect(merged.peek()).toBe('a')
    })

    it('should respect maxSize of merged queue', () => {
      const q1 = new PriorityQueue<string>({ maxSize: 5 })
      q1.enqueue('a', 1)
      const q2 = new PriorityQueue<string>({ maxSize: 3 })
      q2.enqueue('b', 2)
      const merged = q1.merge(q2)
      expect(merged.getStats().maxSize).toBe(5)
    })

    it('should handle merging max-heap queues', () => {
      const q1 = new PriorityQueue<string>({ order: 'max' })
      q1.enqueue('a', 1)
      const q2 = new PriorityQueue<string>({ order: 'max' })
      q2.enqueue('b', 5)
      const merged = q1.merge(q2)
      expect(merged.peek()).toBe('b')
    })
  })

  describe('min-heap ordering', () => {
    it('should dequeue in ascending priority order', () => {
      queue.enqueue('d', 4)
      queue.enqueue('b', 2)
      queue.enqueue('a', 1)
      queue.enqueue('c', 3)
      expect(queue.dequeue()).toBe('a')
      expect(queue.dequeue()).toBe('b')
      expect(queue.dequeue()).toBe('c')
      expect(queue.dequeue()).toBe('d')
    })

    it('should handle large dataset correctly', () => {
      const items = []
      for (let i = 50; i >= 1; i--) {
        queue.enqueue(`item-${i}`, i)
        items.push(i)
      }
      items.sort((a, b) => a - b)
      for (const _priority of items) {
        const val = queue.dequeue()
        expect(val).toBeDefined()
      }
    })

    it('should handle equal priorities with FIFO', () => {
      queue.enqueue('x', 5)
      queue.enqueue('y', 5)
      queue.enqueue('z', 5)
      expect(queue.dequeue()).toBe('x')
      expect(queue.dequeue()).toBe('y')
      expect(queue.dequeue()).toBe('z')
    })
  })

  describe('max-heap ordering', () => {
    it('should dequeue in descending priority order', () => {
      const q = new PriorityQueue<string>({ order: 'max' })
      q.enqueue('a', 1)
      q.enqueue('c', 3)
      q.enqueue('b', 2)
      expect(q.dequeue()).toBe('c')
      expect(q.dequeue()).toBe('b')
      expect(q.dequeue()).toBe('a')
    })

    it('should handle equal priorities with FIFO in max-heap', () => {
      const q = new PriorityQueue<string>({ order: 'max' })
      q.enqueue('x', 5)
      q.enqueue('y', 5)
      q.enqueue('z', 5)
      expect(q.dequeue()).toBe('x')
      expect(q.dequeue()).toBe('y')
      expect(q.dequeue()).toBe('z')
    })
  })

  describe('edge cases', () => {
    it('should handle enqueue after dequeue', () => {
      queue.enqueue('a', 1)
      queue.dequeue()
      queue.enqueue('b', 2)
      expect(queue.size()).toBe(1)
      expect(queue.peek()).toBe('b')
    })

    it('should handle alternating enqueue and dequeue', () => {
      queue.enqueue('a', 1)
      expect(queue.dequeue()).toBe('a')
      queue.enqueue('b', 2)
      expect(queue.dequeue()).toBe('b')
      expect(queue.isEmpty()).toBe(true)
    })

    it('should handle enqueue dequeue cycle repeatedly', () => {
      for (let i = 0; i < 10; i++) {
        queue.enqueue(`item-${i}`, i)
        queue.dequeue()
      }
      expect(queue.isEmpty()).toBe(true)
    })

    it('should handle floating point priorities', () => {
      queue.enqueue('a', 1.5)
      queue.enqueue('b', 1.1)
      queue.enqueue('c', 1.9)
      expect(queue.dequeue()).toBe('b')
      expect(queue.dequeue()).toBe('a')
      expect(queue.dequeue()).toBe('c')
    })

    it('should handle negative priorities', () => {
      queue.enqueue('a', -10)
      queue.enqueue('b', -5)
      queue.enqueue('c', -1)
      expect(queue.dequeue()).toBe('a')
      expect(queue.dequeue()).toBe('b')
      expect(queue.dequeue()).toBe('c')
    })

    it('should handle object values', () => {
      const q = new PriorityQueue<{ id: number }>()
      q.enqueue({ id: 1 }, 3)
      q.enqueue({ id: 2 }, 1)
      expect(q.peek()?.id).toBe(2)
    })

    it('should handle null values', () => {
      const q = new PriorityQueue<string | null>()
      q.enqueue(null, 1)
      q.enqueue('a', 2)
      expect(q.peek()).toBeNull()
    })

    it('should handle undefined values', () => {
      const q = new PriorityQueue<string | undefined>()
      q.enqueue(undefined, 1)
      q.enqueue('a', 2)
      expect(q.peek()).toBeUndefined()
    })

    it('should handle single element operations', () => {
      queue.enqueue('only', 42)
      expect(queue.peek()).toBe('only')
      expect(queue.peekPriority()).toBe(42)
      expect(queue.contains('only')).toBe(true)
      expect(queue.updatePriority('only', 10)).toBe(true)
      expect(queue.peekPriority()).toBe(10)
      expect(queue.remove('only')).toBe(true)
      expect(queue.isEmpty()).toBe(true)
    })

    it('should handle maxSize of 1', () => {
      const q = new PriorityQueue<string>({ maxSize: 1 })
      expect(q.enqueue('a', 1)).toBe(true)
      expect(q.enqueue('b', 2)).toBe(false)
      expect(q.size()).toBe(1)
    })

    it('should handle dequeue on empty queue multiple times', () => {
      expect(queue.dequeue()).toBeUndefined()
      expect(queue.dequeue()).toBeUndefined()
      expect(queue.dequeue()).toBeUndefined()
    })

    it('should handle peek on empty queue multiple times', () => {
      expect(queue.peek()).toBeUndefined()
      expect(queue.peek()).toBeUndefined()
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_QUEUE_OPTIONS', () => {
      expect(DEFAULT_QUEUE_OPTIONS.order).toBe('min')
      expect(DEFAULT_QUEUE_OPTIONS.maxSize).toBe(Infinity)
    })

    it('should re-export types from priority-queue module', () => {
      const item: PriorityItem<string> = {
        value: 'test',
        priority: 1,
        insertedAt: Date.now(),
      }
      expect(item.value).toBe('test')

      const opts: QueueOptions = {
        order: 'min',
        maxSize: 100,
      }
      expect(opts.order).toBe('min')

      const stats: QueueStats = {
        size: 0,
        maxSize: 100,
        peekCount: 0,
        dequeueCount: 0,
        enqueueCount: 0,
      }
      expect(stats.size).toBe(0)
    })

    it('should allow creating PriorityItem with different types', () => {
      const numItem: PriorityItem<number> = {
        value: 42,
        priority: 1,
        insertedAt: Date.now(),
      }
      expect(numItem.value).toBe(42)
    })

    it('should support QueueOrder type values', () => {
      const min: QueueOptions['order'] = 'min'
      const max: QueueOptions['order'] = 'max'
      expect(min).toBe('min')
      expect(max).toBe('max')
    })
  })

  describe('statistics tracking', () => {
    it('should track multiple operations in stats', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.peek()
      queue.dequeue()
      const stats = queue.getStats()
      expect(stats.enqueueCount).toBe(2)
      expect(stats.peekCount).toBe(1)
      expect(stats.dequeueCount).toBe(1)
      expect(stats.size).toBe(1)
    })

    it('should track drain operations via dequeue', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.drain()
      const stats = queue.getStats()
      expect(stats.dequeueCount).toBe(2)
    })

    it('should persist stats across clear', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.clear()
      const stats = queue.getStats()
      expect(stats.enqueueCount).toBe(2)
      expect(stats.size).toBe(0)
    })

    it('should track stats for failed enqueue', () => {
      const q = new PriorityQueue<string>({ maxSize: 1 })
      q.enqueue('a', 1)
      q.enqueue('b', 2)
      expect(q.getStats().enqueueCount).toBe(1)
    })
  })
})
