import { describe, it, expect, beforeEach } from 'vitest'
import { LRUQueue } from '../../src/core/lru-queue/lru-queue.js'
import type { LRUQueueOptions } from '../../src/core/lru-queue/lru-queue.js'

describe('LRUQueue', () => {
  describe('constructor', () => {
    it('creates queue with given maxSize', () => {
      const queue = new LRUQueue<string, number>(10)
      expect(queue.capacity).toBe(10)
      expect(queue.size).toBe(0)
    })

    it('creates queue with capacity 1', () => {
      const queue = new LRUQueue<string, number>(1)
      expect(queue.capacity).toBe(1)
    })

    it('creates queue with large capacity', () => {
      const queue = new LRUQueue<string, number>(1000000)
      expect(queue.capacity).toBe(1000000)
    })

    it('creates empty queue', () => {
      const queue = new LRUQueue<string, number>(5)
      expect(queue.isEmpty()).toBe(true)
    })

    it('creates queue with capacity 0', () => {
      const queue = new LRUQueue<string, number>(0)
      expect(queue.capacity).toBe(0)
      expect(queue.size).toBe(0)
    })

    it('initializes size to 0', () => {
      const queue = new LRUQueue<string, number>(5)
      expect(queue.size).toBe(0)
    })

    it('isEmpty returns true for new queue', () => {
      const queue = new LRUQueue<string, number>(5)
      expect(queue.isEmpty()).toBe(true)
    })

    it('accepts LRUQueueOptions via static factory', () => {
      const options: LRUQueueOptions = { maxSize: 5 }
      const queue = LRUQueue.fromOptions<string, number>(options)
      expect(queue.capacity).toBe(5)
    })
  })

  describe('enqueue', () => {
    it('adds item to queue', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      expect(queue.size).toBe(1)
      expect(queue.has('a')).toBe(true)
    })

    it('increases size after enqueue', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      expect(queue.size).toBe(2)
    })

    it('returns undefined when not at capacity', () => {
      const queue = new LRUQueue<string, number>(5)
      const result = queue.enqueue('a', 1)
      expect(result).toBeUndefined()
    })

    it('returns evicted item when at capacity', () => {
      const queue = new LRUQueue<string, number>(2)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      const evicted = queue.enqueue('c', 3)
      expect(evicted).toEqual({ key: 'a', value: 1 })
    })

    it('auto-evicts LRU when over capacity', () => {
      const queue = new LRUQueue<string, number>(2)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      expect(queue.size).toBe(2)
      expect(queue.has('a')).toBe(false)
      expect(queue.has('b')).toBe(true)
      expect(queue.has('c')).toBe(true)
    })

    it('updates existing key value', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('a', 10)
      expect(queue.size).toBe(1)
      expect(queue.get('a')).toBe(10)
    })

    it('promotes existing key to MRU on update', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('a', 10)
      expect(queue.keys()).toEqual(['a', 'b'])
    })

    it('returns undefined when updating existing key', () => {
      const queue = new LRUQueue<string, number>(2)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      const result = queue.enqueue('a', 10)
      expect(result).toBeUndefined()
    })

    it('handles enqueue to capacity 0 queue', () => {
      const queue = new LRUQueue<string, number>(0)
      const result = queue.enqueue('a', 1)
      expect(result).toBeUndefined()
      expect(queue.size).toBe(0)
    })

    it('maintains correct order after multiple enqueues', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      expect(queue.keys()).toEqual(['c', 'b', 'a'])
    })

    it('handles enqueue after dequeue', () => {
      const queue = new LRUQueue<string, number>(3)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.dequeue()
      queue.enqueue('c', 3)
      expect(queue.keys()).toEqual(['c', 'b'])
    })

    it('handles multiple auto-evictions', () => {
      const queue = new LRUQueue<string, number>(2)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.enqueue('d', 4)
      expect(queue.size).toBe(2)
      expect(queue.has('a')).toBe(false)
      expect(queue.has('b')).toBe(false)
      expect(queue.has('c')).toBe(true)
      expect(queue.has('d')).toBe(true)
    })

    it('newly enqueued item is most recently used', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      const arr = queue.toArray()
      expect(arr[0]).toEqual({ key: 'c', value: 3 })
    })

    it('does not evict when updating existing key at capacity', () => {
      const queue = new LRUQueue<string, number>(2)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('a', 10)
      expect(queue.size).toBe(2)
      expect(queue.has('b')).toBe(true)
    })

    it('returns correct evicted item after get reorder', () => {
      const queue = new LRUQueue<string, number>(2)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.get('a')
      const evicted = queue.enqueue('c', 3)
      expect(evicted).toEqual({ key: 'b', value: 2 })
    })
  })

  describe('dequeue', () => {
    it('returns undefined from empty queue', () => {
      const queue = new LRUQueue<string, number>(5)
      expect(queue.dequeue()).toBeUndefined()
    })

    it('removes and returns LRU item', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      expect(queue.dequeue()).toEqual({ key: 'a', value: 1 })
    })

    it('decreases size after dequeue', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.dequeue()
      expect(queue.size).toBe(1)
    })

    it('returns items in LRU order', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      expect(queue.dequeue()).toEqual({ key: 'a', value: 1 })
      expect(queue.dequeue()).toEqual({ key: 'b', value: 2 })
      expect(queue.dequeue()).toEqual({ key: 'c', value: 3 })
    })

    it('returns undefined after queue becomes empty', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.dequeue()
      expect(queue.dequeue()).toBeUndefined()
    })

    it('handles dequeue with single item', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      expect(queue.dequeue()).toEqual({ key: 'a', value: 1 })
      expect(queue.isEmpty()).toBe(true)
    })

    it('removes item from internal map', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.dequeue()
      expect(queue.has('a')).toBe(false)
    })

    it('does not affect MRU items', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.dequeue()
      expect(queue.has('c')).toBe(true)
      expect(queue.get('c')).toBe(3)
    })

    it('returns { key, value } object', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('x', 42)
      const result = queue.dequeue()
      expect(result).toEqual({ key: 'x', value: 42 })
    })

    it('dequeue respects get reorder', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.get('a')
      expect(queue.dequeue()).toEqual({ key: 'b', value: 2 })
    })

    it('dequeue from capacity 0 queue returns undefined', () => {
      const queue = new LRUQueue<string, number>(0)
      expect(queue.dequeue()).toBeUndefined()
    })

    it('multiple dequeues drain the queue', () => {
      const queue = new LRUQueue<string, number>(3)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.dequeue()
      queue.dequeue()
      expect(queue.isEmpty()).toBe(true)
    })
  })

  describe('peek', () => {
    it('returns undefined from empty queue', () => {
      const queue = new LRUQueue<string, number>(5)
      expect(queue.peek()).toBeUndefined()
    })

    it('returns LRU item without removing', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      expect(queue.peek()).toEqual({ key: 'a', value: 1 })
      expect(queue.size).toBe(2)
    })

    it('does not change size', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.peek()
      expect(queue.size).toBe(2)
    })

    it('returns same item on multiple calls', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      expect(queue.peek()).toEqual({ key: 'a', value: 1 })
      expect(queue.peek()).toEqual({ key: 'a', value: 1 })
    })

    it('returns correct item after enqueue', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      expect(queue.peek()).toEqual({ key: 'a', value: 1 })
      queue.enqueue('b', 2)
      expect(queue.peek()).toEqual({ key: 'a', value: 1 })
    })

    it('returns correct item after get reorder', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.get('a')
      expect(queue.peek()).toEqual({ key: 'b', value: 2 })
    })

    it('returns new LRU after dequeue', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.dequeue()
      expect(queue.peek()).toEqual({ key: 'b', value: 2 })
    })

    it('returns undefined for capacity 0 queue', () => {
      const queue = new LRUQueue<string, number>(0)
      expect(queue.peek()).toBeUndefined()
    })
  })

  describe('get', () => {
    it('returns undefined for missing key', () => {
      const queue = new LRUQueue<string, number>(5)
      expect(queue.get('missing')).toBeUndefined()
    })

    it('returns value for existing key', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 42)
      expect(queue.get('a')).toBe(42)
    })

    it('marks item as recently used', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.get('a')
      expect(queue.keys()).toEqual(['a', 'b'])
    })

    it('get on MRU item does not change order', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.get('b')
      expect(queue.keys()).toEqual(['b', 'a'])
    })

    it('get on LRU item promotes to MRU', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.get('a')
      expect(queue.keys()).toEqual(['a', 'c', 'b'])
    })

    it('get on middle item promotes to MRU', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.get('b')
      expect(queue.keys()).toEqual(['b', 'c', 'a'])
    })

    it('preserves other items relative order', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.enqueue('d', 4)
      queue.get('b')
      expect(queue.keys()).toEqual(['b', 'd', 'c', 'a'])
    })

    it('does not change size', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.get('a')
      expect(queue.size).toBe(2)
    })

    it('returns undefined after item evicted', () => {
      const queue = new LRUQueue<string, number>(2)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      expect(queue.get('a')).toBeUndefined()
    })

    it('multiple gets maintain correct order', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.get('a')
      queue.get('b')
      expect(queue.keys()).toEqual(['b', 'a', 'c'])
    })

    it('returns updated value after enqueue update', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('a', 99)
      expect(queue.get('a')).toBe(99)
    })

    it('get from empty queue returns undefined', () => {
      const queue = new LRUQueue<string, number>(5)
      expect(queue.get('a')).toBeUndefined()
    })
  })

  describe('has', () => {
    it('returns false for missing key', () => {
      const queue = new LRUQueue<string, number>(5)
      expect(queue.has('missing')).toBe(false)
    })

    it('returns true for existing key', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      expect(queue.has('a')).toBe(true)
    })

    it('returns false after dequeue', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.dequeue()
      expect(queue.has('a')).toBe(false)
    })

    it('returns false after evict', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.evict()
      expect(queue.has('a')).toBe(false)
    })

    it('returns false after clear', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.clear()
      expect(queue.has('a')).toBe(false)
    })

    it('returns true after get', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.get('a')
      expect(queue.has('a')).toBe(true)
    })

    it('returns false after auto-eviction', () => {
      const queue = new LRUQueue<string, number>(2)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      expect(queue.has('a')).toBe(false)
    })
  })

  describe('size', () => {
    it('returns 0 for empty queue', () => {
      const queue = new LRUQueue<string, number>(5)
      expect(queue.size).toBe(0)
    })

    it('increases with enqueue', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      expect(queue.size).toBe(2)
    })

    it('decreases with dequeue', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.dequeue()
      expect(queue.size).toBe(1)
    })

    it('reflects auto-eviction', () => {
      const queue = new LRUQueue<string, number>(2)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      expect(queue.size).toBe(2)
    })

    it('does not increase when updating existing key', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('a', 2)
      expect(queue.size).toBe(1)
    })
  })

  describe('capacity', () => {
    it('returns constructor maxSize', () => {
      const queue = new LRUQueue<string, number>(42)
      expect(queue.capacity).toBe(42)
    })

    it('returns new capacity after resize', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.resize(10)
      expect(queue.capacity).toBe(10)
    })

    it('does not change with enqueue or dequeue', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.dequeue()
      expect(queue.capacity).toBe(5)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new queue', () => {
      const queue = new LRUQueue<string, number>(5)
      expect(queue.isEmpty()).toBe(true)
    })

    it('returns false after enqueue', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      expect(queue.isEmpty()).toBe(false)
    })

    it('returns true after clearing all items', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.clear()
      expect(queue.isEmpty()).toBe(true)
    })

    it('returns true after dequeueing all items', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.dequeue()
      expect(queue.isEmpty()).toBe(true)
    })

    it('returns false when partially drained', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.dequeue()
      expect(queue.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('removes all items', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.clear()
      expect(queue.size).toBe(0)
    })

    it('makes isEmpty true', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.clear()
      expect(queue.isEmpty()).toBe(true)
    })

    it('preserves capacity', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.clear()
      expect(queue.capacity).toBe(5)
    })

    it('allows enqueue after clear', () => {
      const queue = new LRUQueue<string, number>(2)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.clear()
      queue.enqueue('c', 3)
      expect(queue.size).toBe(1)
      expect(queue.has('c')).toBe(true)
    })

    it('toArray returns empty after clear', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.clear()
      expect(queue.toArray()).toEqual([])
    })

    it('clear on empty queue is no-op', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.clear()
      expect(queue.size).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty queue', () => {
      const queue = new LRUQueue<string, number>(5)
      expect(queue.toArray()).toEqual([])
    })

    it('returns items in MRU to LRU order', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      expect(queue.toArray()).toEqual([
        { key: 'c', value: 3 },
        { key: 'b', value: 2 },
        { key: 'a', value: 1 },
      ])
    })

    it('returns correct count', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      expect(queue.toArray()).toHaveLength(2)
    })

    it('reflects order after get', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.get('a')
      expect(queue.toArray()).toEqual([
        { key: 'a', value: 1 },
        { key: 'c', value: 3 },
        { key: 'b', value: 2 },
      ])
    })

    it('returns new array each call', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      const arr1 = queue.toArray()
      const arr2 = queue.toArray()
      expect(arr1).not.toBe(arr2)
      expect(arr1).toEqual(arr2)
    })

    it('handles single item', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      expect(queue.toArray()).toEqual([{ key: 'a', value: 1 }])
    })

    it('reflects auto-eviction', () => {
      const queue = new LRUQueue<string, number>(2)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      expect(queue.toArray()).toEqual([
        { key: 'c', value: 3 },
        { key: 'b', value: 2 },
      ])
    })
  })

  describe('keys', () => {
    it('returns empty array for empty queue', () => {
      const queue = new LRUQueue<string, number>(5)
      expect(queue.keys()).toEqual([])
    })

    it('returns keys in MRU order', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      expect(queue.keys()).toEqual(['c', 'b', 'a'])
    })

    it('reflects changes after dequeue', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.dequeue()
      expect(queue.keys()).toEqual(['b'])
    })

    it('returns correct count', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      expect(queue.keys()).toHaveLength(2)
    })

    it('handles single item', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      expect(queue.keys()).toEqual(['a'])
    })

    it('reflects reorder after get', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.get('a')
      expect(queue.keys()).toEqual(['a', 'b'])
    })
  })

  describe('values', () => {
    it('returns empty array for empty queue', () => {
      const queue = new LRUQueue<string, number>(5)
      expect(queue.values()).toEqual([])
    })

    it('returns values in MRU order', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      expect(queue.values()).toEqual([3, 2, 1])
    })

    it('reflects changes after dequeue', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.dequeue()
      expect(queue.values()).toEqual([2])
    })

    it('returns correct count', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      expect(queue.values()).toHaveLength(2)
    })

    it('handles single item', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      expect(queue.values()).toEqual([1])
    })

    it('reflects reorder after get', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.get('a')
      expect(queue.values()).toEqual([1, 2])
    })
  })

  describe('forEach', () => {
    it('does not call callback on empty queue', () => {
      const queue = new LRUQueue<string, number>(5)
      const items: Array<{ key: string; value: number }> = []
      queue.forEach((value, key) => {
        items.push({ key, value })
      })
      expect(items).toEqual([])
    })

    it('calls callback for each item', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      const keys: string[] = []
      queue.forEach((_value, key) => {
        keys.push(key)
      })
      expect(keys).toEqual(['b', 'a'])
    })

    it('passes correct value and key', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('x', 42)
      let receivedKey = ''
      let receivedValue = 0
      queue.forEach((value, key) => {
        receivedKey = key
        receivedValue = value
      })
      expect(receivedKey).toBe('x')
      expect(receivedValue).toBe(42)
    })

    it('iterates in MRU to LRU order', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      const result: string[] = []
      queue.forEach((_value, key) => {
        result.push(key)
      })
      expect(result).toEqual(['c', 'b', 'a'])
    })

    it('handles single item', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      let count = 0
      queue.forEach(() => {
        count++
      })
      expect(count).toBe(1)
    })

    it('reflects current state', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.get('a')
      const result: string[] = []
      queue.forEach((_value, key) => {
        result.push(key)
      })
      expect(result).toEqual(['a', 'c', 'b'])
    })
  })

  describe('Symbol.iterator', () => {
    it('produces empty iterator for empty queue', () => {
      const queue = new LRUQueue<string, number>(5)
      const result = [...queue]
      expect(result).toEqual([])
    })

    it('iterates in MRU to LRU order', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      const result = [...queue]
      expect(result).toEqual([
        { key: 'c', value: 3 },
        { key: 'b', value: 2 },
        { key: 'a', value: 1 },
      ])
    })

    it('works with for-of loop', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      const keys: string[] = []
      for (const entry of queue) {
        keys.push(entry.key)
      }
      expect(keys).toEqual(['b', 'a'])
    })

    it('produces correct entries', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('x', 42)
      const entries = [...queue]
      expect(entries[0]).toEqual({ key: 'x', value: 42 })
    })

    it('reflects current state', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.get('a')
      const result = [...queue]
      expect(result).toEqual([
        { key: 'a', value: 1 },
        { key: 'b', value: 2 },
      ])
    })

    it('handles single item', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      const result = [...queue]
      expect(result).toHaveLength(1)
    })
  })

  describe('evict', () => {
    it('returns undefined from empty queue', () => {
      const queue = new LRUQueue<string, number>(5)
      expect(queue.evict()).toBeUndefined()
    })

    it('removes and returns LRU item', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      expect(queue.evict()).toEqual({ key: 'a', value: 1 })
    })

    it('decreases size', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.evict()
      expect(queue.size).toBe(1)
    })

    it('removes from internal map', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.evict()
      expect(queue.has('a')).toBe(false)
    })

    it('evicts correct item after reorder', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.get('a')
      expect(queue.evict()).toEqual({ key: 'b', value: 2 })
    })

    it('evicts items in LRU order', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      expect(queue.evict()).toEqual({ key: 'a', value: 1 })
      expect(queue.evict()).toEqual({ key: 'b', value: 2 })
      expect(queue.evict()).toEqual({ key: 'c', value: 3 })
    })

    it('evict on single item queue', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      expect(queue.evict()).toEqual({ key: 'a', value: 1 })
      expect(queue.isEmpty()).toBe(true)
    })

    it('evict until empty returns undefined', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.evict()
      expect(queue.evict()).toBeUndefined()
    })

    it('does not affect capacity', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.evict()
      expect(queue.capacity).toBe(5)
    })

    it('consecutive evicts maintain correct order', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.enqueue('d', 4)
      expect(queue.evict()).toEqual({ key: 'a', value: 1 })
      expect(queue.evict()).toEqual({ key: 'b', value: 2 })
      expect(queue.size).toBe(2)
    })
  })

  describe('resize', () => {
    it('changes capacity', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.resize(10)
      expect(queue.capacity).toBe(10)
    })

    it('evicts items when shrinking below current size', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.resize(1)
      expect(queue.size).toBe(1)
      expect(queue.has('c')).toBe(true)
    })

    it('does not evict when expanding', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.resize(10)
      expect(queue.size).toBe(2)
      expect(queue.has('a')).toBe(true)
      expect(queue.has('b')).toBe(true)
    })

    it('resize to 0 evicts all items', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.resize(0)
      expect(queue.size).toBe(0)
      expect(queue.isEmpty()).toBe(true)
    })

    it('resize to same capacity is no-op', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.resize(5)
      expect(queue.size).toBe(2)
    })

    it('allows more enqueues after resize up', () => {
      const queue = new LRUQueue<string, number>(2)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.resize(4)
      queue.enqueue('c', 3)
      queue.enqueue('d', 4)
      expect(queue.size).toBe(4)
    })

    it('evicts LRU items when shrinking', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.enqueue('d', 4)
      queue.resize(2)
      expect(queue.has('a')).toBe(false)
      expect(queue.has('b')).toBe(false)
      expect(queue.has('c')).toBe(true)
      expect(queue.has('d')).toBe(true)
    })

    it('preserves MRU items when shrinking', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.resize(1)
      expect(queue.keys()).toEqual(['c'])
    })

    it('resize to larger capacity does not change size', () => {
      const queue = new LRUQueue<string, number>(3)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.resize(10)
      expect(queue.size).toBe(2)
    })

    it('resize to 1 keeps only MRU', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.resize(1)
      expect(queue.size).toBe(1)
      expect(queue.toArray()).toEqual([{ key: 'c', value: 3 }])
    })

    it('resize respects get reorder', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.get('a')
      queue.resize(1)
      expect(queue.toArray()).toEqual([{ key: 'a', value: 1 }])
    })

    it('can resize multiple times', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.resize(10)
      queue.enqueue('c', 3)
      queue.resize(2)
      expect(queue.size).toBe(2)
      expect(queue.has('a')).toBe(false)
    })
  })

  describe('auto-eviction', () => {
    it('auto-evicts on enqueue over capacity', () => {
      const queue = new LRUQueue<string, number>(2)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      expect(queue.size).toBe(2)
    })

    it('auto-evicts correct LRU item', () => {
      const queue = new LRUQueue<string, number>(2)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      expect(queue.has('a')).toBe(false)
      expect(queue.has('b')).toBe(true)
      expect(queue.has('c')).toBe(true)
    })

    it('auto-evicts after get reorders', () => {
      const queue = new LRUQueue<string, number>(2)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.get('a')
      queue.enqueue('c', 3)
      expect(queue.has('a')).toBe(true)
      expect(queue.has('b')).toBe(false)
      expect(queue.has('c')).toBe(true)
    })

    it('returns evicted item from auto-eviction', () => {
      const queue = new LRUQueue<string, number>(2)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      const result = queue.enqueue('c', 3)
      expect(result).toEqual({ key: 'a', value: 1 })
    })

    it('multiple consecutive auto-evictions', () => {
      const queue = new LRUQueue<string, number>(1)
      const evicted1 = queue.enqueue('a', 1)
      const evicted2 = queue.enqueue('b', 2)
      const evicted3 = queue.enqueue('c', 3)
      expect(evicted1).toBeUndefined()
      expect(evicted2).toEqual({ key: 'a', value: 1 })
      expect(evicted3).toEqual({ key: 'b', value: 2 })
      expect(queue.size).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('works with number keys', () => {
      const queue = new LRUQueue<number, string>(3)
      queue.enqueue(1, 'one')
      queue.enqueue(2, 'two')
      expect(queue.get(1)).toBe('one')
      expect(queue.keys()).toEqual([1, 2])
    })

    it('works with object values', () => {
      const queue = new LRUQueue<string, { name: string }>(3)
      queue.enqueue('a', { name: 'alice' })
      queue.enqueue('b', { name: 'bob' })
      expect(queue.get('a')).toEqual({ name: 'alice' })
    })

    it('handles capacity 1', () => {
      const queue = new LRUQueue<string, number>(1)
      queue.enqueue('a', 1)
      expect(queue.size).toBe(1)
      const evicted = queue.enqueue('b', 2)
      expect(evicted).toEqual({ key: 'a', value: 1 })
      expect(queue.size).toBe(1)
      expect(queue.has('b')).toBe(true)
    })

    it('handles enqueue dequeue cycle', () => {
      const queue = new LRUQueue<string, number>(3)
      queue.enqueue('a', 1)
      queue.dequeue()
      queue.enqueue('b', 2)
      queue.dequeue()
      queue.enqueue('c', 3)
      expect(queue.size).toBe(1)
      expect(queue.has('c')).toBe(true)
    })

    it('handles mixed operations', () => {
      const queue = new LRUQueue<string, number>(3)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.get('a')
      queue.dequeue()
      queue.enqueue('d', 4)
      expect(queue.size).toBe(3)
      expect(queue.keys()).toEqual(['d', 'a', 'c'])
    })

    it('handles large number of operations', () => {
      const queue = new LRUQueue<number, number>(10)
      for (let i = 0; i < 100; i++) {
        queue.enqueue(i, i * 10)
      }
      expect(queue.size).toBe(10)
      expect(queue.has(90)).toBe(true)
      expect(queue.has(0)).toBe(false)
    })

    it('get then evict chain', () => {
      const queue = new LRUQueue<string, number>(3)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.get('a')
      const e1 = queue.evict()
      expect(e1).toEqual({ key: 'b', value: 2 })
      const e2 = queue.evict()
      expect(e2).toEqual({ key: 'c', value: 3 })
      const e3 = queue.evict()
      expect(e3).toEqual({ key: 'a', value: 1 })
    })

    it('enqueue after resize to 0', () => {
      const queue = new LRUQueue<string, number>(5)
      queue.enqueue('a', 1)
      queue.resize(0)
      const result = queue.enqueue('b', 2)
      expect(result).toBeUndefined()
      expect(queue.size).toBe(0)
    })

    it('resize from 0 to non-zero allows enqueue', () => {
      const queue = new LRUQueue<string, number>(0)
      queue.resize(3)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      expect(queue.size).toBe(2)
    })
  })
})
