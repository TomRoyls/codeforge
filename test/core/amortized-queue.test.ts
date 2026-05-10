import { describe, it, expect, beforeEach } from 'vitest'
import { AmortizedQueue } from '../../src/core/amortized-queue/amortized-queue.js'
import { DEFAULT_AMORTIZED_QUEUE_OPTIONS } from '../../src/core/amortized-queue/types.js'
import type { AmortizedQueueOptions } from '../../src/core/amortized-queue/types.js'

describe('AmortizedQueue', () => {
  let queue: AmortizedQueue<number>

  beforeEach(() => {
    queue = new AmortizedQueue<number>()
  })

  describe('constructor', () => {
    it('should create an empty queue with default options', () => {
      const q = new AmortizedQueue<number>()
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('should accept custom maxSize option', () => {
      const q = new AmortizedQueue<number>({ maxSize: 5 })
      expect(q.size()).toBe(0)
    })

    it('should accept empty options', () => {
      const q = new AmortizedQueue<number>({})
      expect(q.size()).toBe(0)
    })

    it('should have default maxSize of 0', () => {
      expect(DEFAULT_AMORTIZED_QUEUE_OPTIONS.maxSize).toBe(0)
    })

    it('should work with string type', () => {
      const q = new AmortizedQueue<string>()
      expect(q.size()).toBe(0)
    })

    it('should work with object type', () => {
      const q = new AmortizedQueue<{ x: number }>()
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

    it('should add items preserving FIFO order', () => {
      queue.enqueue(10)
      queue.enqueue(20)
      queue.enqueue(30)
      expect(queue.dequeue()).toBe(10)
      expect(queue.dequeue()).toBe(20)
      expect(queue.dequeue()).toBe(30)
    })

    it('should handle undefined values', () => {
      const q = new AmortizedQueue<number | undefined>()
      q.enqueue(undefined)
      expect(q.size()).toBe(1)
    })

    it('should handle null values', () => {
      const q = new AmortizedQueue<number | null>()
      q.enqueue(null)
      expect(q.size()).toBe(1)
    })

    it('should handle enqueue after dequeue triggers invariant', () => {
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

    it('should trigger bank reversal when front is empty', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      queue.dequeue()
      expect(queue.dequeue()).toBe(3)
      expect(queue.isEmpty()).toBe(true)
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

    it('should work after bank reversal', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      expect(queue.peek()).toBe(2)
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
  })

  describe('fromArray', () => {
    it('should add all items from array', () => {
      queue.fromArray([1, 2, 3])
      expect(queue.size()).toBe(3)
      expect(queue.toArray()).toEqual([1, 2, 3])
    })

    it('should handle empty array', () => {
      queue.fromArray([])
      expect(queue.size()).toBe(0)
    })

    it('should append to existing items', () => {
      queue.enqueue(0)
      queue.fromArray([1, 2])
      expect(queue.toArray()).toEqual([0, 1, 2])
    })

    it('should handle single item array', () => {
      queue.fromArray([42])
      expect(queue.size()).toBe(1)
      expect(queue.peek()).toBe(42)
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
  })

  describe('front_', () => {
    it('should return same as peek', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.front_()).toBe(queue.peek())
    })

    it('should return undefined on empty', () => {
      expect(queue.front_()).toBeUndefined()
    })
  })

  describe('back', () => {
    it('should return undefined for empty queue', () => {
      expect(queue.back()).toBeUndefined()
    })

    it('should return the last enqueued item', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.back()).toBe(3)
    })

    it('should return item without removing it', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.back()).toBe(2)
      expect(queue.size()).toBe(2)
    })

    it('should return the only item for single-item queue', () => {
      queue.enqueue(42)
      expect(queue.back()).toBe(42)
    })

    it('should work after dequeue triggers reversal', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      queue.enqueue(4)
      expect(queue.back()).toBe(4)
    })

    it('should work when all items in front', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      expect(queue.back()).toBe(2)
    })
  })

  describe('enqueueMany', () => {
    it('should add multiple items', () => {
      queue.enqueueMany([1, 2, 3])
      expect(queue.size()).toBe(3)
      expect(queue.toArray()).toEqual([1, 2, 3])
    })

    it('should add items in order', () => {
      queue.enqueue(0)
      queue.enqueueMany([1, 2, 3])
      expect(queue.toArray()).toEqual([0, 1, 2, 3])
    })

    it('should handle empty array', () => {
      queue.enqueueMany([])
      expect(queue.size()).toBe(0)
    })

    it('should handle single item array', () => {
      queue.enqueueMany([42])
      expect(queue.size()).toBe(1)
      expect(queue.peek()).toBe(42)
    })

    it('should handle large batch', () => {
      const items = Array.from({ length: 1000 }, (_, i) => i)
      queue.enqueueMany(items)
      expect(queue.size()).toBe(1000)
      expect(queue.peek()).toBe(0)
      expect(queue.back()).toBe(999)
    })
  })

  describe('dequeueMany', () => {
    it('should remove and return multiple items', () => {
      queue.enqueueMany([1, 2, 3, 4, 5])
      const items = queue.dequeueMany(3)
      expect(items).toEqual([1, 2, 3])
      expect(queue.size()).toBe(2)
    })

    it('should handle requesting more than available', () => {
      queue.enqueueMany([1, 2])
      const items = queue.dequeueMany(5)
      expect(items).toEqual([1, 2])
      expect(queue.isEmpty()).toBe(true)
    })

    it('should handle requesting zero items', () => {
      queue.enqueue(1)
      const items = queue.dequeueMany(0)
      expect(items).toEqual([])
      expect(queue.size()).toBe(1)
    })

    it('should handle empty queue', () => {
      const items = queue.dequeueMany(3)
      expect(items).toEqual([])
    })

    it('should handle requesting exactly the queue size', () => {
      queue.enqueueMany([1, 2, 3])
      const items = queue.dequeueMany(3)
      expect(items).toEqual([1, 2, 3])
      expect(queue.isEmpty()).toBe(true)
    })

    it('should preserve FIFO order', () => {
      queue.enqueueMany([10, 20, 30])
      expect(queue.dequeueMany(2)).toEqual([10, 20])
      expect(queue.dequeueMany(1)).toEqual([30])
    })
  })

  describe('reverse', () => {
    it('should return a new reversed queue', () => {
      queue.enqueueMany([1, 2, 3])
      const reversed = queue.reverse()
      expect(reversed.toArray()).toEqual([3, 2, 1])
    })

    it('should not modify the original queue', () => {
      queue.enqueueMany([1, 2, 3])
      queue.reverse()
      expect(queue.toArray()).toEqual([1, 2, 3])
    })

    it('should handle empty queue', () => {
      const reversed = queue.reverse()
      expect(reversed.toArray()).toEqual([])
      expect(reversed.size()).toBe(0)
    })

    it('should handle single item queue', () => {
      queue.enqueue(1)
      const reversed = queue.reverse()
      expect(reversed.toArray()).toEqual([1])
    })

    it('should handle two items', () => {
      queue.enqueueMany([1, 2])
      const reversed = queue.reverse()
      expect(reversed.toArray()).toEqual([2, 1])
    })

    it('should have correct size', () => {
      queue.enqueueMany([1, 2, 3])
      const reversed = queue.reverse()
      expect(reversed.size()).toBe(3)
    })
  })

  describe('map', () => {
    it('should transform all items', () => {
      queue.enqueueMany([1, 2, 3])
      const mapped = queue.map((x) => x * 2)
      expect(mapped.toArray()).toEqual([2, 4, 6])
    })

    it('should not modify the original queue', () => {
      queue.enqueueMany([1, 2, 3])
      queue.map((x) => x * 2)
      expect(queue.toArray()).toEqual([1, 2, 3])
    })

    it('should provide correct indices', () => {
      queue.enqueueMany([10, 20, 30])
      const mapped = queue.map((_x, i) => i)
      expect(mapped.toArray()).toEqual([0, 1, 2])
    })

    it('should handle type transformation', () => {
      queue.enqueueMany([1, 2, 3])
      const mapped = queue.map((x) => x.toString())
      expect(mapped.toArray()).toEqual(['1', '2', '3'])
    })

    it('should handle empty queue', () => {
      const mapped = queue.map((x) => x)
      expect(mapped.toArray()).toEqual([])
    })

    it('should handle single item', () => {
      queue.enqueue(5)
      const mapped = queue.map((x) => x * 10)
      expect(mapped.toArray()).toEqual([50])
    })
  })

  describe('filter', () => {
    it('should filter items based on predicate', () => {
      queue.enqueueMany([1, 2, 3, 4, 5])
      const filtered = queue.filter((x) => x % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4])
    })

    it('should not modify the original queue', () => {
      queue.enqueueMany([1, 2, 3])
      queue.filter((x) => x > 1)
      expect(queue.toArray()).toEqual([1, 2, 3])
    })

    it('should provide correct indices', () => {
      queue.enqueueMany([10, 20, 30])
      const filtered = queue.filter((_x, i) => i !== 1)
      expect(filtered.toArray()).toEqual([10, 30])
    })

    it('should handle all items filtered out', () => {
      queue.enqueueMany([1, 3, 5])
      const filtered = queue.filter((x) => x % 2 === 0)
      expect(filtered.toArray()).toEqual([])
      expect(filtered.size()).toBe(0)
    })

    it('should handle no items filtered out', () => {
      queue.enqueueMany([2, 4, 6])
      const filtered = queue.filter((x) => x % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4, 6])
    })

    it('should handle empty queue', () => {
      const filtered = queue.filter((x) => x > 0)
      expect(filtered.toArray()).toEqual([])
    })
  })

  describe('clone', () => {
    it('should create an independent copy', () => {
      queue.enqueueMany([1, 2, 3])
      const cloned = queue.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3])
      expect(cloned.size()).toBe(3)
    })

    it('should not affect original when modified', () => {
      queue.enqueueMany([1, 2, 3])
      const cloned = queue.clone()
      cloned.enqueue(4)
      expect(queue.size()).toBe(3)
      expect(cloned.size()).toBe(4)
    })

    it('should not affect clone when original is modified', () => {
      queue.enqueueMany([1, 2, 3])
      const cloned = queue.clone()
      queue.enqueue(4)
      expect(cloned.size()).toBe(3)
    })

    it('should clone empty queue', () => {
      const cloned = queue.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should preserve maxSize option', () => {
      const q = new AmortizedQueue<number>({ maxSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      const cloned = q.clone()
      cloned.enqueue(3)
      expect(cloned.size()).toBe(2)
    })
  })

  describe('persist', () => {
    it('should return a frozen snapshot', () => {
      queue.enqueueMany([1, 2, 3])
      const snapshot = queue.persist()
      expect(snapshot.toArray()).toEqual([1, 2, 3])
      expect(snapshot.isFrozen()).toBe(true)
    })

    it('should not affect original when snapshot exists', () => {
      queue.enqueueMany([1, 2, 3])
      const snapshot = queue.persist()
      queue.enqueue(4)
      expect(snapshot.size()).toBe(3)
      expect(queue.size()).toBe(4)
    })

    it('should throw on enqueue to frozen queue', () => {
      queue.enqueue(1)
      const snapshot = queue.persist()
      expect(() => snapshot.enqueue(2)).toThrow('Cannot modify a frozen queue')
    })

    it('should throw on dequeue from frozen queue', () => {
      queue.enqueue(1)
      const snapshot = queue.persist()
      expect(() => snapshot.dequeue()).toThrow('Cannot modify a frozen queue')
    })

    it('should throw on clear on frozen queue', () => {
      queue.enqueue(1)
      const snapshot = queue.persist()
      expect(() => snapshot.clear()).toThrow('Cannot modify a frozen queue')
    })

    it('should throw on fromArray on frozen queue', () => {
      queue.enqueue(1)
      const snapshot = queue.persist()
      expect(() => snapshot.fromArray([2, 3])).toThrow('Cannot modify a frozen queue')
    })

    it('should throw on enqueueMany on frozen queue', () => {
      queue.enqueue(1)
      const snapshot = queue.persist()
      expect(() => snapshot.enqueueMany([2, 3])).toThrow('Cannot modify a frozen queue')
    })

    it('should throw on dequeueMany on frozen queue', () => {
      queue.enqueue(1)
      const snapshot = queue.persist()
      expect(() => snapshot.dequeueMany(1)).toThrow('Cannot modify a frozen queue')
    })

    it('should allow read operations on frozen queue', () => {
      queue.enqueueMany([1, 2, 3])
      const snapshot = queue.persist()
      expect(snapshot.peek()).toBe(1)
      expect(snapshot.size()).toBe(3)
      expect(snapshot.isEmpty()).toBe(false)
      expect(snapshot.toArray()).toEqual([1, 2, 3])
      expect(snapshot.back()).toBe(3)
    })

    it('should allow persist of frozen queue', () => {
      queue.enqueue(1)
      const snapshot = queue.persist()
      const snapshot2 = snapshot.persist()
      expect(snapshot2.toArray()).toEqual([1])
      expect(snapshot2.isFrozen()).toBe(true)
    })

    it('should allow clone of frozen queue', () => {
      queue.enqueueMany([1, 2])
      const snapshot = queue.persist()
      const cloned = snapshot.clone()
      expect(cloned.toArray()).toEqual([1, 2])
      expect(cloned.isFrozen()).toBe(false)
    })

    it('should allow map/filter/reverse on frozen queue', () => {
      queue.enqueueMany([1, 2, 3])
      const snapshot = queue.persist()
      const mapped = snapshot.map((x) => x * 2)
      expect(mapped.toArray()).toEqual([2, 4, 6])
      const filtered = snapshot.filter((x) => x > 1)
      expect(filtered.toArray()).toEqual([2, 3])
      const reversed = snapshot.reverse()
      expect(reversed.toArray()).toEqual([3, 2, 1])
    })

    it('should allow iteration on frozen queue', () => {
      queue.enqueueMany([1, 2, 3])
      const snapshot = queue.persist()
      expect([...snapshot]).toEqual([1, 2, 3])
    })

    it('should allow forEach on frozen queue', () => {
      queue.enqueueMany([1, 2, 3])
      const snapshot = queue.persist()
      const items: number[] = []
      snapshot.forEach((v) => items.push(v))
      expect(items).toEqual([1, 2, 3])
    })

    it('original queue should not be frozen', () => {
      queue.enqueue(1)
      queue.persist()
      expect(queue.isFrozen()).toBe(false)
    })
  })

  describe('isFrozen', () => {
    it('should return false for new queue', () => {
      expect(queue.isFrozen()).toBe(false)
    })

    it('should return true after persist', () => {
      queue.enqueue(1)
      const snapshot = queue.persist()
      expect(snapshot.isFrozen()).toBe(true)
    })

    it('should return false for clone', () => {
      queue.enqueue(1)
      const cloned = queue.clone()
      expect(cloned.isFrozen()).toBe(false)
    })
  })

  describe('maxSize option', () => {
    it('should limit queue to maxSize', () => {
      const q = new AmortizedQueue<number>({ maxSize: 3 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.size()).toBe(3)
    })

    it('should evict oldest items', () => {
      const q = new AmortizedQueue<number>({ maxSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.peek()).toBe(2)
      expect(q.toArray()).toEqual([2, 3])
    })

    it('should work with fromArray', () => {
      const q = new AmortizedQueue<number>({ maxSize: 2 })
      q.fromArray([1, 2, 3, 4])
      expect(q.size()).toBe(2)
      expect(q.toArray()).toEqual([3, 4])
    })

    it('should work with enqueueMany', () => {
      const q = new AmortizedQueue<number>({ maxSize: 2 })
      q.enqueueMany([1, 2, 3])
      expect(q.size()).toBe(2)
    })

    it('should not limit when maxSize is 0', () => {
      const q = new AmortizedQueue<number>({ maxSize: 0 })
      for (let i = 0; i < 100; i++) {
        q.enqueue(i)
      }
      expect(q.size()).toBe(100)
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
      expect(queue.back()).toBeUndefined()
    })

    it('should handle toArray on empty queue', () => {
      expect(queue.toArray()).toEqual([])
    })

    it('should handle string queue', () => {
      const q = new AmortizedQueue<string>()
      q.enqueue('a')
      q.enqueue('b')
      q.enqueue('c')
      expect(q.toArray()).toEqual(['a', 'b', 'c'])
      expect(q.dequeue()).toBe('a')
    })

    it('should handle object queue', () => {
      const q = new AmortizedQueue<{ id: number }>()
      q.enqueue({ id: 1 })
      q.enqueue({ id: 2 })
      const item = q.dequeue()
      expect(item!.id).toBe(1)
    })

    it('should handle boolean queue', () => {
      const q = new AmortizedQueue<boolean>()
      q.enqueue(true)
      q.enqueue(false)
      expect(q.dequeue()).toBe(true)
      expect(q.dequeue()).toBe(false)
    })

    it('should handle dequeueMany on partially drained queue', () => {
      queue.enqueueMany([1, 2, 3, 4, 5])
      queue.dequeue()
      queue.dequeue()
      const items = queue.dequeueMany(2)
      expect(items).toEqual([3, 4])
      expect(queue.size()).toBe(1)
    })

    it('should handle reverse on two-item queue', () => {
      queue.enqueueMany([1, 2])
      const r = queue.reverse()
      expect(r.dequeue()).toBe(2)
      expect(r.dequeue()).toBe(1)
    })

    it('should handle chained map operations', () => {
      queue.enqueueMany([1, 2, 3])
      const result = queue.map((x) => x * 2).map((x) => x + 1)
      expect(result.toArray()).toEqual([3, 5, 7])
    })

    it('should handle map to different type', () => {
      queue.enqueueMany([1, 2, 3])
      const mapped = queue.map((x) => ({ value: x }))
      expect(mapped.toArray()).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }])
    })

    it('should handle filter then map', () => {
      queue.enqueueMany([1, 2, 3, 4, 5])
      const result = queue.filter((x) => x % 2 !== 0).map((x) => x * 10)
      expect(result.toArray()).toEqual([10, 30, 50])
    })

    it('should handle clone after partial dequeue', () => {
      queue.enqueueMany([1, 2, 3, 4, 5])
      queue.dequeue()
      queue.dequeue()
      const cloned = queue.clone()
      expect(cloned.toArray()).toEqual([3, 4, 5])
    })

    it('should handle persist after partial dequeue', () => {
      queue.enqueueMany([1, 2, 3])
      queue.dequeue()
      const snapshot = queue.persist()
      expect(snapshot.toArray()).toEqual([2, 3])
    })

    it('should handle forEach on partially drained queue', () => {
      queue.enqueueMany([1, 2, 3])
      queue.dequeue()
      const items: number[] = []
      queue.forEach((v) => items.push(v))
      expect(items).toEqual([2, 3])
    })

    it('should handle iterator on partially drained queue', () => {
      queue.enqueueMany([1, 2, 3])
      queue.dequeue()
      expect([...queue]).toEqual([2, 3])
    })

    it('should handle fromArray after dequeue triggers reversal', () => {
      queue.enqueueMany([1, 2, 3])
      queue.dequeue()
      queue.dequeue()
      queue.fromArray([4, 5])
      expect(queue.toArray()).toEqual([3, 4, 5])
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

    it('should handle large enqueueMany', () => {
      const items = Array.from({ length: 5000 }, (_, i) => i)
      queue.enqueueMany(items)
      expect(queue.size()).toBe(5000)
      expect(queue.peek()).toBe(0)
      expect(queue.back()).toBe(4999)
    })

    it('should handle large dequeueMany', () => {
      const items = Array.from({ length: 5000 }, (_, i) => i)
      queue.enqueueMany(items)
      const dequeued = queue.dequeueMany(2500)
      expect(dequeued.length).toBe(2500)
      expect(dequeued[0]).toBe(0)
      expect(dequeued[2499]).toBe(2499)
    })

    it('should handle rapid clone/map/filter cycles', () => {
      queue.enqueueMany(Array.from({ length: 100 }, (_, i) => i))
      for (let round = 0; round < 10; round++) {
        const mapped = queue.map((x) => x + round)
        const filtered = mapped.filter((x) => x % 2 === 0)
        const cloned = filtered.clone()
        expect(cloned.size()).toBeGreaterThan(0)
      }
    })

    it('should handle many persist snapshots', () => {
      const snapshots: AmortizedQueue<number>[] = []
      for (let i = 0; i < 100; i++) {
        queue.enqueue(i)
        snapshots.push(queue.persist())
      }
      expect(snapshots.length).toBe(100)
      expect(snapshots[50]!.size()).toBe(51)
      expect(snapshots[99]!.size()).toBe(100)
    })

    it('should handle maxSize under stress', () => {
      const q = new AmortizedQueue<number>({ maxSize: 100 })
      for (let i = 0; i < 10000; i++) {
        q.enqueue(i)
      }
      expect(q.size()).toBe(100)
      expect(q.peek()).toBe(9900)
    })

    it('should handle mixed batch operations', () => {
      for (let batch = 0; batch < 100; batch++) {
        queue.enqueueMany([batch * 3, batch * 3 + 1, batch * 3 + 2])
        if (batch % 2 === 0) {
          queue.dequeueMany(1)
        }
      }
      expect(queue.size()).toBeGreaterThan(0)
    })
  })

  describe('banker invariant', () => {
    it('should maintain front non-empty when queue non-empty', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.peek()).toBe(1)
      queue.dequeue()
      expect(queue.peek()).toBe(2)
      queue.dequeue()
      expect(queue.peek()).toBe(3)
      queue.dequeue()
      expect(queue.peek()).toBeUndefined()
    })

    it('should correctly reverse rear into front', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.dequeue()).toBe(1)
      expect(queue.dequeue()).toBe(2)
      expect(queue.dequeue()).toBe(3)
    })

    it('should handle enqueue after full drain and reversal', () => {
      queue.enqueueMany([1, 2, 3])
      queue.dequeueMany(3)
      expect(queue.isEmpty()).toBe(true)
      queue.enqueueMany([4, 5])
      expect(queue.dequeue()).toBe(4)
      expect(queue.dequeue()).toBe(5)
    })

    it('should maintain FIFO through multiple reversals', () => {
      queue.enqueue(1)
      expect(queue.dequeue()).toBe(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.dequeue()).toBe(2)
      expect(queue.dequeue()).toBe(3)
      queue.enqueue(4)
      expect(queue.dequeue()).toBe(4)
    })
  })

  describe('type exports', () => {
    it('should export AmortizedQueueOptions type', () => {
      const opts: AmortizedQueueOptions = { maxSize: 10 }
      const q = new AmortizedQueue<number>(opts)
      expect(q.size()).toBe(0)
    })
  })
})
