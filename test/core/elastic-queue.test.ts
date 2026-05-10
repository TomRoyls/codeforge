import { describe, it, expect, beforeEach } from 'vitest'
import { ElasticQueue } from '../../src/core/elastic-queue/elastic-queue.js'
import { DEFAULT_ELASTIC_QUEUE_OPTIONS } from '../../src/core/elastic-queue/types.js'
import type { ElasticQueueOptions } from '../../src/core/elastic-queue/types.js'

describe('ElasticQueue', () => {
  describe('construction', () => {
    it('should create queue with default options', () => {
      const q = new ElasticQueue<number>()
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
      expect(q.capacity()).toBe(DEFAULT_ELASTIC_QUEUE_OPTIONS.initialCapacity)
    })

    it('should create queue with custom initialCapacity', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 8 })
      expect(q.capacity()).toBe(8)
    })

    it('should create queue with custom growthFactor', () => {
      const q = new ElasticQueue<number>({ growthFactor: 3 })
      expect(q.growthFactor).toBe(3)
    })

    it('should clamp initialCapacity to minimum 4', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 1 })
      expect(q.capacity()).toBe(4)
    })

    it('should clamp negative initialCapacity to 4', () => {
      const q = new ElasticQueue<number>({ initialCapacity: -10 })
      expect(q.capacity()).toBe(4)
    })

    it('should clamp growthFactor to minimum 1.5', () => {
      const q = new ElasticQueue<number>({ growthFactor: 1 })
      expect(q.growthFactor).toBe(1.5)
    })

    it('should accept both options', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 10, growthFactor: 2.5 })
      expect(q.capacity()).toBe(10)
      expect(q.growthFactor).toBe(2.5)
    })

    it('should start empty', () => {
      const q = new ElasticQueue<number>()
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
      expect(q.isFull()).toBe(false)
    })

    it('should not be full when empty', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      expect(q.isFull()).toBe(false)
    })
  })

  describe('enqueue', () => {
    let q: ElasticQueue<number>

    beforeEach(() => {
      q = new ElasticQueue<number>({ initialCapacity: 4 })
    })

    it('should enqueue a single item', () => {
      q.enqueue(1)
      expect(q.size()).toBe(1)
    })

    it('should enqueue multiple items', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.size()).toBe(3)
    })

    it('should fill to capacity', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.isFull()).toBe(true)
      expect(q.size()).toBe(4)
    })

    it('should enqueue without errors', () => {
      for (let i = 0; i < 20; i++) {
        q.enqueue(i)
      }
      expect(q.size()).toBe(20)
    })
  })

  describe('dequeue', () => {
    let q: ElasticQueue<number>

    beforeEach(() => {
      q = new ElasticQueue<number>({ initialCapacity: 4 })
    })

    it('should return undefined when empty', () => {
      expect(q.dequeue()).toBeUndefined()
    })

    it('should dequeue the first item', () => {
      q.enqueue(1)
      q.enqueue(2)
      expect(q.dequeue()).toBe(1)
    })

    it('should dequeue items in FIFO order', () => {
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      expect(q.dequeue()).toBe(10)
      expect(q.dequeue()).toBe(20)
      expect(q.dequeue()).toBe(30)
    })

    it('should decrease size after dequeue', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.size()).toBe(1)
    })

    it('should return undefined after all items dequeued', () => {
      q.enqueue(1)
      q.dequeue()
      expect(q.dequeue()).toBeUndefined()
    })

    it('should handle dequeue on empty multiple times', () => {
      expect(q.dequeue()).toBeUndefined()
      expect(q.dequeue()).toBeUndefined()
      expect(q.dequeue()).toBeUndefined()
    })
  })

  describe('peek', () => {
    let q: ElasticQueue<number>

    beforeEach(() => {
      q = new ElasticQueue<number>({ initialCapacity: 4 })
    })

    it('should return undefined on empty queue', () => {
      expect(q.peek()).toBeUndefined()
    })

    it('should return the front item without removing it', () => {
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

    it('should return undefined after all items dequeued', () => {
      q.enqueue(1)
      q.dequeue()
      expect(q.peek()).toBeUndefined()
    })

    it('should not modify the queue', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.peek()
      expect(q.size()).toBe(2)
      expect(q.toArray()).toEqual([1, 2])
    })
  })

  describe('auto-grow', () => {
    it('should grow when full', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4, growthFactor: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.capacity()).toBe(4)
      q.enqueue(5)
      expect(q.capacity()).toBe(8)
      expect(q.size()).toBe(5)
    })

    it('should preserve items after growth', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4, growthFactor: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      expect(q.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should grow multiple times', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4, growthFactor: 2 })
      for (let i = 0; i < 20; i++) {
        q.enqueue(i)
      }
      expect(q.size()).toBe(20)
      expect(q.capacity()).toBeGreaterThanOrEqual(20)
    })

    it('should respect custom growthFactor', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4, growthFactor: 3 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      expect(q.capacity()).toBe(12)
    })

    it('should grow and maintain FIFO order', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4, growthFactor: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
      expect(q.dequeue()).toBe(4)
      expect(q.dequeue()).toBe(5)
    })

    it('should grow with fractional growthFactor', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4, growthFactor: 1.5 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      expect(q.capacity()).toBe(6)
    })

    it('should grow when enqueueing many items at once', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4, growthFactor: 2 })
      q.enqueueMany([1, 2, 3, 4, 5, 6, 7, 8, 9])
      expect(q.size()).toBe(9)
      expect(q.capacity()).toBeGreaterThanOrEqual(9)
    })
  })

  describe('auto-shrink', () => {
    it('should shrink when usage drops below 25%', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4, growthFactor: 2 })
      for (let i = 0; i < 16; i++) {
        q.enqueue(i)
      }
      const capAfterGrow = q.capacity()
      while (q.size() > 0 && q.size() >= Math.floor(capAfterGrow / 4)) {
        q.dequeue()
      }
      expect(q.capacity()).toBeLessThan(capAfterGrow)
    })

    it('should shrink by halving', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4, growthFactor: 2 })
      for (let i = 0; i < 8; i++) {
        q.enqueue(i)
      }
      expect(q.capacity()).toBe(8)
      for (let i = 0; i < 7; i++) {
        q.dequeue()
      }
      expect(q.capacity()).toBe(4)
      expect(q.size()).toBe(1)
    })

    it('should not shrink below initialCapacity', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 8, growthFactor: 2 })
      for (let i = 0; i < 32; i++) {
        q.enqueue(i)
      }
      while (q.size() > 0) {
        q.dequeue()
      }
      expect(q.capacity()).toBe(8)
    })

    it('should preserve remaining items after shrink', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4, growthFactor: 2 })
      for (let i = 0; i < 8; i++) {
        q.enqueue(i)
      }
      for (let i = 0; i < 7; i++) {
        q.dequeue()
      }
      expect(q.peek()).toBe(7)
      expect(q.toArray()).toEqual([7])
    })

    it('should handle multiple shrink cycles', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4, growthFactor: 2 })
      for (let i = 0; i < 32; i++) {
        q.enqueue(i)
      }
      expect(q.capacity()).toBe(32)
      for (let i = 0; i < 30; i++) {
        q.dequeue()
      }
      expect(q.capacity()).toBeLessThan(32)
    })

    it('should shrink correctly with dequeueMany', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4, growthFactor: 2 })
      for (let i = 0; i < 8; i++) {
        q.enqueue(i)
      }
      q.dequeueMany(7)
      expect(q.size()).toBe(1)
      expect(q.capacity()).toBe(4)
    })

    it('should not trigger shrink when usage is exactly 25%', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4, growthFactor: 2 })
      for (let i = 0; i < 8; i++) {
        q.enqueue(i)
      }
      q.dequeueMany(6)
      expect(q.size()).toBe(2)
      expect(q.capacity()).toBe(8)
    })
  })

  describe('enqueueMany', () => {
    let q: ElasticQueue<number>

    beforeEach(() => {
      q = new ElasticQueue<number>({ initialCapacity: 4, growthFactor: 2 })
    })

    it('should enqueue multiple items', () => {
      q.enqueueMany([1, 2, 3])
      expect(q.size()).toBe(3)
    })

    it('should return the number of items enqueued', () => {
      expect(q.enqueueMany([1, 2, 3])).toBe(3)
    })

    it('should handle empty array', () => {
      expect(q.enqueueMany([])).toBe(0)
      expect(q.size()).toBe(0)
    })

    it('should trigger growth when needed', () => {
      q.enqueueMany([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      expect(q.size()).toBe(10)
      expect(q.capacity()).toBeGreaterThanOrEqual(10)
    })

    it('should maintain FIFO order', () => {
      q.enqueueMany([10, 20, 30])
      expect(q.dequeue()).toBe(10)
      expect(q.dequeue()).toBe(20)
      expect(q.dequeue()).toBe(30)
    })

    it('should append to existing items', () => {
      q.enqueue(0)
      q.enqueueMany([1, 2, 3])
      expect(q.toArray()).toEqual([0, 1, 2, 3])
    })
  })

  describe('dequeueMany', () => {
    let q: ElasticQueue<number>

    beforeEach(() => {
      q = new ElasticQueue<number>({ initialCapacity: 4, growthFactor: 2 })
    })

    it('should dequeue requested number of items', () => {
      q.enqueueMany([1, 2, 3, 4, 5])
      expect(q.dequeueMany(3)).toEqual([1, 2, 3])
    })

    it('should return empty array for empty queue', () => {
      expect(q.dequeueMany(5)).toEqual([])
    })

    it('should return all available if count exceeds size', () => {
      q.enqueueMany([1, 2])
      expect(q.dequeueMany(10)).toEqual([1, 2])
    })

    it('should return empty array for count 0', () => {
      q.enqueue(1)
      expect(q.dequeueMany(0)).toEqual([])
    })

    it('should remove items from queue', () => {
      q.enqueueMany([1, 2, 3, 4, 5])
      q.dequeueMany(3)
      expect(q.size()).toBe(2)
    })

    it('should dequeue all items', () => {
      q.enqueueMany([1, 2, 3])
      expect(q.dequeueMany(3)).toEqual([1, 2, 3])
      expect(q.isEmpty()).toBe(true)
    })
  })

  describe('resize', () => {
    it('should resize to a larger capacity', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueue(1)
      q.enqueue(2)
      q.resize(16)
      expect(q.capacity()).toBe(16)
      expect(q.toArray()).toEqual([1, 2])
    })

    it('should resize to a smaller capacity', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueueMany([1, 2, 3, 4])
      q.resize(8)
      q.resize(4)
      expect(q.capacity()).toBe(4)
      expect(q.toArray()).toEqual([1, 2, 3, 4])
    })

    it('should drop excess items when shrinking below size', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueueMany([1, 2, 3, 4, 5, 6])
      q.resize(4)
      expect(q.size()).toBe(4)
      expect(q.toArray()).toEqual([3, 4, 5, 6])
    })

    it('should not resize below initialCapacity', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 8 })
      q.resize(2)
      expect(q.capacity()).toBe(8)
    })

    it('should handle resize to same capacity', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueueMany([1, 2])
      q.resize(4)
      expect(q.capacity()).toBe(4)
      expect(q.toArray()).toEqual([1, 2])
    })

    it('should handle resize on empty queue', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.resize(32)
      expect(q.capacity()).toBe(32)
      expect(q.size()).toBe(0)
    })

    it('should maintain FIFO order after resize', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueueMany([1, 2, 3])
      q.resize(16)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
    })
  })

  describe('contains', () => {
    let q: ElasticQueue<number>

    beforeEach(() => {
      q = new ElasticQueue<number>({ initialCapacity: 4 })
    })

    it('should return false for empty queue', () => {
      expect(q.contains(1)).toBe(false)
    })

    it('should return true if item exists', () => {
      q.enqueue(1)
      q.enqueue(2)
      expect(q.contains(1)).toBe(true)
      expect(q.contains(2)).toBe(true)
    })

    it('should return false if item does not exist', () => {
      q.enqueue(1)
      expect(q.contains(99)).toBe(false)
    })

    it('should work after growth', () => {
      q.enqueueMany([1, 2, 3, 4, 5, 6, 7, 8, 9])
      expect(q.contains(5)).toBe(true)
      expect(q.contains(10)).toBe(false)
    })

    it('should use reference equality for objects', () => {
      const obj = { id: 1 }
      const q = new ElasticQueue<{ id: number }>()
      q.enqueue(obj)
      expect(q.contains(obj)).toBe(true)
      expect(q.contains({ id: 1 })).toBe(false)
    })
  })

  describe('indexOf', () => {
    let q: ElasticQueue<number>

    beforeEach(() => {
      q = new ElasticQueue<number>({ initialCapacity: 4 })
    })

    it('should return -1 for empty queue', () => {
      expect(q.indexOf(1)).toBe(-1)
    })

    it('should return index of item', () => {
      q.enqueueMany([10, 20, 30])
      expect(q.indexOf(10)).toBe(0)
      expect(q.indexOf(20)).toBe(1)
      expect(q.indexOf(30)).toBe(2)
    })

    it('should return -1 if item not found', () => {
      q.enqueueMany([1, 2, 3])
      expect(q.indexOf(99)).toBe(-1)
    })

    it('should return first occurrence', () => {
      q.enqueueMany([1, 2, 1])
      expect(q.indexOf(1)).toBe(0)
    })

    it('should work after dequeue', () => {
      q.enqueueMany([10, 20, 30])
      q.dequeue()
      expect(q.indexOf(10)).toBe(-1)
      expect(q.indexOf(20)).toBe(0)
      expect(q.indexOf(30)).toBe(1)
    })

    it('should work after growth', () => {
      q.enqueueMany([1, 2, 3, 4, 5, 6, 7, 8, 9])
      expect(q.indexOf(5)).toBe(4)
    })
  })

  describe('forEach', () => {
    it('should iterate over all items', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueueMany([1, 2, 3])
      const collected: number[] = []
      q.forEach((item) => collected.push(item))
      expect(collected).toEqual([1, 2, 3])
    })

    it('should provide correct indices', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueueMany([10, 20, 30])
      const indices: number[] = []
      q.forEach((_item, idx) => indices.push(idx))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should handle empty queue', () => {
      const q = new ElasticQueue<number>()
      let count = 0
      q.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should iterate in FIFO order after growth', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueueMany([1, 2, 3, 4, 5, 6, 7, 8, 9])
      const collected: number[] = []
      q.forEach((item) => collected.push(item))
      expect(collected).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should work after partial dequeue', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueueMany([1, 2, 3, 4, 5])
      q.dequeue()
      q.dequeue()
      const collected: number[] = []
      q.forEach((item) => collected.push(item))
      expect(collected).toEqual([3, 4, 5])
    })
  })

  describe('Symbol.iterator', () => {
    it('should be iterable', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueueMany([1, 2, 3])
      const result = [...q]
      expect(result).toEqual([1, 2, 3])
    })

    it('should work with for...of', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueueMany([10, 20, 30])
      const collected: number[] = []
      for (const item of q) {
        collected.push(item)
      }
      expect(collected).toEqual([10, 20, 30])
    })

    it('should iterate empty queue', () => {
      const q = new ElasticQueue<number>()
      expect([...q]).toEqual([])
    })

    it('should iterate after growth', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueueMany([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      expect([...q]).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })
  })

  describe('drain', () => {
    it('should drain all items when no count given', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueueMany([1, 2, 3])
      expect(q.drain()).toEqual([1, 2, 3])
      expect(q.isEmpty()).toBe(true)
    })

    it('should drain specified count', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueueMany([1, 2, 3, 4, 5])
      expect(q.drain(3)).toEqual([1, 2, 3])
      expect(q.size()).toBe(2)
    })

    it('should drain empty queue', () => {
      const q = new ElasticQueue<number>()
      expect(q.drain()).toEqual([])
    })

    it('should drain more than available', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueueMany([1, 2])
      expect(q.drain(10)).toEqual([1, 2])
      expect(q.isEmpty()).toBe(true)
    })

    it('should drain 0 items', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueueMany([1, 2, 3])
      expect(q.drain(0)).toEqual([])
      expect(q.size()).toBe(3)
    })
  })

  describe('compact', () => {
    it('should shrink capacity to current size', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4, growthFactor: 2 })
      q.enqueueMany([1, 2, 3, 4, 5, 6, 7, 8])
      q.dequeueMany(6)
      q.compact()
      expect(q.capacity()).toBeLessThanOrEqual(q.size() + 4)
    })

    it('should not shrink below initialCapacity', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 8, growthFactor: 2 })
      q.enqueue(1)
      q.compact()
      expect(q.capacity()).toBe(8)
    })

    it('should preserve items after compact', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4, growthFactor: 2 })
      q.enqueueMany([1, 2, 3, 4, 5, 6, 7, 8])
      q.dequeueMany(6)
      const items = q.toArray()
      q.compact()
      expect(q.toArray()).toEqual(items)
    })

    it('should work on empty queue', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4, growthFactor: 2 })
      q.compact()
      expect(q.capacity()).toBe(4)
      expect(q.size()).toBe(0)
    })

    it('should compact to fit exactly', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4, growthFactor: 2 })
      for (let i = 0; i < 20; i++) {
        q.enqueue(i)
      }
      q.dequeueMany(15)
      q.compact()
      expect(q.capacity()).toBe(Math.max(5, 4))
      expect(q.size()).toBe(5)
    })
  })

  describe('growthFactor getter', () => {
    it('should return default growthFactor', () => {
      const q = new ElasticQueue<number>()
      expect(q.growthFactor).toBe(2)
    })

    it('should return custom growthFactor', () => {
      const q = new ElasticQueue<number>({ growthFactor: 3 })
      expect(q.growthFactor).toBe(3)
    })

    it('should return clamped growthFactor', () => {
      const q = new ElasticQueue<number>({ growthFactor: 0.5 })
      expect(q.growthFactor).toBe(1.5)
    })
  })

  describe('size', () => {
    it('should return 0 for empty queue', () => {
      const q = new ElasticQueue<number>()
      expect(q.size()).toBe(0)
    })

    it('should return correct size after enqueue', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.size()).toBe(2)
    })

    it('should return correct size after dequeue', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.size()).toBe(1)
    })

    it('should return 0 after clear', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueueMany([1, 2, 3])
      q.clear()
      expect(q.size()).toBe(0)
    })
  })

  describe('capacity', () => {
    it('should return initial capacity', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 10 })
      expect(q.capacity()).toBe(10)
    })

    it('should reflect growth', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4, growthFactor: 2 })
      q.enqueueMany([1, 2, 3, 4, 5])
      expect(q.capacity()).toBeGreaterThan(4)
    })

    it('should reflect shrink', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4, growthFactor: 2 })
      q.enqueueMany([1, 2, 3, 4, 5, 6, 7, 8])
      q.dequeueMany(7)
      expect(q.capacity()).toBeLessThan(8)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new queue', () => {
      const q = new ElasticQueue<number>()
      expect(q.isEmpty()).toBe(true)
    })

    it('should return false after enqueue', () => {
      const q = new ElasticQueue<number>()
      q.enqueue(1)
      expect(q.isEmpty()).toBe(false)
    })

    it('should return true after dequeue all', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueue(1)
      q.dequeue()
      expect(q.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueue(1)
      q.clear()
      expect(q.isEmpty()).toBe(true)
    })
  })

  describe('isFull', () => {
    it('should return false when empty', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      expect(q.isFull()).toBe(false)
    })

    it('should return true when at capacity', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueueMany([1, 2, 3, 4])
      expect(q.isFull()).toBe(true)
    })

    it('should return false after growth', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueueMany([1, 2, 3, 4, 5])
      expect(q.isFull()).toBe(false)
    })

    it('should return false after dequeue from full', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueueMany([1, 2, 3, 4])
      q.dequeue()
      expect(q.isFull()).toBe(false)
    })
  })

  describe('clear', () => {
    it('should remove all items', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueueMany([1, 2, 3])
      q.clear()
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('should preserve capacity', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueueMany([1, 2, 3, 4, 5])
      const cap = q.capacity()
      q.clear()
      expect(q.capacity()).toBe(cap)
    })

    it('should allow enqueue after clear', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueueMany([1, 2, 3])
      q.clear()
      q.enqueue(4)
      expect(q.size()).toBe(1)
      expect(q.peek()).toBe(4)
    })

    it('should handle clearing empty queue', () => {
      const q = new ElasticQueue<number>()
      q.clear()
      expect(q.size()).toBe(0)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty queue', () => {
      const q = new ElasticQueue<number>()
      expect(q.toArray()).toEqual([])
    })

    it('should return items in FIFO order', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueueMany([3, 1, 2])
      expect(q.toArray()).toEqual([3, 1, 2])
    })

    it('should not modify the queue', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueueMany([1, 2])
      q.toArray()
      expect(q.size()).toBe(2)
    })

    it('should work after growth', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4, growthFactor: 2 })
      q.enqueueMany([1, 2, 3, 4, 5])
      expect(q.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should work after partial dequeue', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueueMany([1, 2, 3, 4])
      q.dequeue()
      q.dequeue()
      expect(q.toArray()).toEqual([3, 4])
    })
  })

  describe('fromArray', () => {
    it('should create queue from array', () => {
      const q = ElasticQueue.fromArray([1, 2, 3])
      expect(q.size()).toBe(3)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('should create queue from empty array', () => {
      const q = ElasticQueue.fromArray([])
      expect(q.size()).toBe(0)
    })

    it('should accept options', () => {
      const q = ElasticQueue.fromArray([1, 2, 3], { initialCapacity: 8, growthFactor: 3 })
      expect(q.capacity()).toBeGreaterThanOrEqual(3)
      expect(q.growthFactor).toBe(3)
    })

    it('should grow to accommodate array', () => {
      const q = ElasticQueue.fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], { initialCapacity: 4 })
      expect(q.size()).toBe(10)
      expect(q.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_ELASTIC_QUEUE_OPTIONS', () => {
      expect(DEFAULT_ELASTIC_QUEUE_OPTIONS.initialCapacity).toBe(16)
      expect(DEFAULT_ELASTIC_QUEUE_OPTIONS.growthFactor).toBe(2)
    })

    it('should support ElasticQueueOptions type', () => {
      const opts: ElasticQueueOptions = {
        initialCapacity: 10,
        growthFactor: 2,
      }
      expect(opts.initialCapacity).toBe(10)
    })

    it('should work with different generic types', () => {
      const numQ = new ElasticQueue<number>()
      numQ.enqueue(42)
      expect(numQ.dequeue()).toBe(42)

      const strQ = new ElasticQueue<string>()
      strQ.enqueue('hello')
      expect(strQ.dequeue()).toBe('hello')
    })
  })

  describe('edge cases', () => {
    it('should handle single item lifecycle', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueue(42)
      expect(q.peek()).toBe(42)
      expect(q.dequeue()).toBe(42)
      expect(q.isEmpty()).toBe(true)
    })

    it('should handle object values', () => {
      const q = new ElasticQueue<{ id: number }>()
      q.enqueue({ id: 1 })
      q.enqueue({ id: 2 })
      expect(q.dequeue()?.id).toBe(1)
      expect(q.dequeue()?.id).toBe(2)
    })

    it('should handle string values', () => {
      const q = new ElasticQueue<string>()
      q.enqueue('hello')
      q.enqueue('world')
      expect(q.dequeue()).toBe('hello')
      expect(q.dequeue()).toBe('world')
    })

    it('should handle null values', () => {
      const q = new ElasticQueue<number | null>()
      q.enqueue(null)
      q.enqueue(1)
      expect(q.dequeue()).toBeNull()
      expect(q.dequeue()).toBe(1)
    })

    it('should handle undefined values', () => {
      const q = new ElasticQueue<number | undefined>()
      q.enqueue(undefined)
      q.enqueue(1)
      expect(q.dequeue()).toBeUndefined()
      expect(q.size()).toBe(1)
    })

    it('should handle enqueue-dequeue-peek cycle', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueue(1)
      expect(q.peek()).toBe(1)
      q.dequeue()
      expect(q.peek()).toBeUndefined()
      q.enqueue(2)
      expect(q.peek()).toBe(2)
    })

    it('should handle initialCapacity of 4 with many items', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4, growthFactor: 2 })
      for (let i = 0; i < 100; i++) {
        q.enqueue(i)
      }
      expect(q.size()).toBe(100)
      expect(q.dequeue()).toBe(0)
      expect(q.dequeue()).toBe(99 - 0 + 1 - 100 + 100 - 99)
    })

    it('should handle alternating enqueue and dequeue', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      for (let i = 0; i < 50; i++) {
        q.enqueue(i)
        expect(q.dequeue()).toBe(i)
      }
      expect(q.isEmpty()).toBe(true)
    })

    it('should handle enqueueMany followed by dequeueMany', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueueMany([1, 2, 3, 4, 5])
      expect(q.dequeueMany(3)).toEqual([1, 2, 3])
      expect(q.dequeueMany(3)).toEqual([4, 5])
    })

    it('should handle large number of items', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      for (let i = 0; i < 10000; i++) {
        q.enqueue(i)
      }
      expect(q.size()).toBe(10000)
      expect(q.dequeue()).toBe(0)
    })

    it('should handle drain on large queue', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      for (let i = 0; i < 100; i++) {
        q.enqueue(i)
      }
      const drained = q.drain()
      expect(drained.length).toBe(100)
      expect(drained[0]).toBe(0)
      expect(drained[99]).toBe(99)
      expect(q.isEmpty()).toBe(true)
    })

    it('should handle compact on large queue', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4, growthFactor: 2 })
      for (let i = 0; i < 100; i++) {
        q.enqueue(i)
      }
      for (let i = 0; i < 95; i++) {
        q.dequeue()
      }
      q.compact()
      expect(q.capacity()).toBe(Math.max(5, 4))
      expect(q.size()).toBe(5)
    })

    it('should handle wraparound in circular buffer', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.dequeue()
      q.enqueue(4)
      q.enqueue(5)
      expect(q.toArray()).toEqual([3, 4, 5])
    })

    it('should handle wraparound after growth', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4, growthFactor: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.dequeue()
      q.enqueue(4)
      q.enqueue(5)
      q.enqueue(6)
      q.enqueue(7)
      q.enqueue(8)
      expect(q.toArray()).toEqual([3, 4, 5, 6, 7, 8])
    })
  })

  describe('stress', () => {
    it('should handle rapid enqueue/dequeue cycle', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4, growthFactor: 2 })
      for (let i = 0; i < 1000; i++) {
        q.enqueue(i)
        q.dequeue()
      }
      expect(q.isEmpty()).toBe(true)
    })

    it('should handle bulk operations', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4, growthFactor: 2 })
      const items = Array.from({ length: 500 }, (_, i) => i)
      q.enqueueMany(items)
      expect(q.size()).toBe(500)
      const drained = q.drain()
      expect(drained.length).toBe(500)
      expect(q.isEmpty()).toBe(true)
    })

    it('should handle interleaved bulk operations', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4, growthFactor: 2 })
      for (let batch = 0; batch < 20; batch++) {
        q.enqueueMany(Array.from({ length: 50 }, (_, i) => batch * 50 + i))
        q.dequeueMany(25)
      }
      expect(q.size()).toBe(500)
    })

    it('should handle growth and shrink cycles', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4, growthFactor: 2 })
      for (let cycle = 0; cycle < 10; cycle++) {
        for (let i = 0; i < 50; i++) {
          q.enqueue(cycle * 50 + i)
        }
        for (let i = 0; i < 50; i++) {
          q.dequeue()
        }
      }
      expect(q.isEmpty()).toBe(true)
      expect(q.capacity()).toBe(4)
    })

    it('should handle forEach on large queue', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      for (let i = 0; i < 1000; i++) {
        q.enqueue(i)
      }
      let sum = 0
      q.forEach((item) => { sum += item })
      expect(sum).toBe(499500)
    })

    it('should handle iterator on large queue', () => {
      const q = new ElasticQueue<number>({ initialCapacity: 4 })
      for (let i = 0; i < 500; i++) {
        q.enqueue(i)
      }
      const arr = [...q]
      expect(arr.length).toBe(500)
      expect(arr[0]).toBe(0)
      expect(arr[499]).toBe(499)
    })
  })
})
