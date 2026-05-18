import { describe, expect, it } from 'vitest'
import { AmortizedQueue } from '../src/core/amortized-queue/amortized-queue.js'

describe('AmortizedQueue', () => {
  describe('constructor and initialization', () => {
    it('should create an empty queue with default options', () => {
      const queue = new AmortizedQueue<number>()
      expect(queue.size()).toBe(0)
      expect(queue.isEmpty()).toBe(true)
    })

    it('should create an empty queue with maxSize option', () => {
      const queue = new AmortizedQueue<number>({ maxSize: 5 })
      expect(queue.size()).toBe(0)
      expect(queue.isEmpty()).toBe(true)
    })

    it('should not be frozen initially', () => {
      const queue = new AmortizedQueue<number>()
      expect(queue.isFrozen()).toBe(false)
    })
  })

  describe('enqueue / dequeue (basic FIFO behavior)', () => {
    it('should enqueue items and dequeue in FIFO order', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)

      expect(queue.dequeue()).toBe(1)
      expect(queue.dequeue()).toBe(2)
      expect(queue.dequeue()).toBe(3)
    })

    it('should return undefined when dequeueing from empty queue', () => {
      const queue = new AmortizedQueue<number>()
      expect(queue.dequeue()).toBe(undefined)
    })

    it('should maintain correct size after enqueue and dequeue', () => {
      const queue = new AmortizedQueue<number>()
      expect(queue.size()).toBe(0)

      queue.enqueue(1)
      expect(queue.size()).toBe(1)

      queue.enqueue(2)
      expect(queue.size()).toBe(2)

      queue.dequeue()
      expect(queue.size()).toBe(1)

      queue.dequeue()
      expect(queue.size()).toBe(0)
    })
  })

  describe('peek / front_ / back', () => {
    it('should peek at the front element without removing it', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)

      expect(queue.peek()).toBe(1)
      expect(queue.size()).toBe(2)
      expect(queue.peek()).toBe(1) // Should still be 1
    })

    it('should return undefined when peeking empty queue', () => {
      const queue = new AmortizedQueue<number>()
      expect(queue.peek()).toBe(undefined)
    })

    it('should front_() be an alias for peek()', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)

      expect(queue.front_()).toBe(1)
      expect(queue.front_()).toBe(queue.peek())
    })

    it('should return the back element', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)

      expect(queue.back()).toBe(3)
    })

    it('should return undefined when calling back() on empty queue', () => {
      const queue = new AmortizedQueue<number>()
      expect(queue.back()).toBe(undefined)
    })

    it('should back() return the only element in a single-element queue', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(42)

      expect(queue.back()).toBe(42)
    })
  })

  describe('size and isEmpty', () => {
    it('should report correct size', () => {
      const queue = new AmortizedQueue<number>()
      expect(queue.size()).toBe(0)

      queue.enqueue(1)
      expect(queue.size()).toBe(1)

      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.size()).toBe(3)

      queue.dequeue()
      expect(queue.size()).toBe(2)

      queue.dequeue()
      queue.dequeue()
      expect(queue.size()).toBe(0)
    })

    it('should report correct isEmpty state', () => {
      const queue = new AmortizedQueue<number>()
      expect(queue.isEmpty()).toBe(true)

      queue.enqueue(1)
      expect(queue.isEmpty()).toBe(false)

      queue.dequeue()
      expect(queue.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear all items from the queue', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)

      expect(queue.size()).toBe(3)

      queue.clear()
      expect(queue.size()).toBe(0)
      expect(queue.isEmpty()).toBe(true)
    })

    it('should be able to enqueue after clear', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.clear()

      queue.enqueue(2)
      expect(queue.dequeue()).toBe(2)
      expect(queue.size()).toBe(0)
    })

    it('should throw error when clearing a frozen queue', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)

      const frozen = queue.persist()
      expect(() => frozen.clear()).toThrow('Cannot modify a frozen queue')
    })
  })

  describe('toArray', () => {
    it('should convert queue to array in correct order', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)

      expect(queue.toArray()).toEqual([1, 2, 3])
    })

    it('should return empty array for empty queue', () => {
      const queue = new AmortizedQueue<number>()
      expect(queue.toArray()).toEqual([])
    })

    it('should not modify the queue when calling toArray', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)

      const array1 = queue.toArray()
      queue.dequeue()
      const array2 = queue.toArray()

      expect(array1).toEqual([1, 2])
      expect(array2).toEqual([2])
    })
  })

  describe('fromArray', () => {
    it('should populate queue from array', () => {
      const queue = new AmortizedQueue<number>()
      queue.fromArray([1, 2, 3])

      expect(queue.size()).toBe(3)
      expect(queue.dequeue()).toBe(1)
      expect(queue.dequeue()).toBe(2)
      expect(queue.dequeue()).toBe(3)
    })

    it('should handle empty array', () => {
      const queue = new AmortizedQueue<number>()
      queue.fromArray([])

      expect(queue.size()).toBe(0)
      expect(queue.isEmpty()).toBe(true)
    })

    it('should append to existing items', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.fromArray([2, 3])

      expect(queue.size()).toBe(3)
      expect(queue.toArray()).toEqual([1, 2, 3])
    })

    it('should throw error when calling fromArray on frozen queue', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      const frozen = queue.persist()

      expect(() => frozen.fromArray([2, 3])).toThrow('Cannot modify a frozen queue')
    })
  })

  describe('forEach', () => {
    it('should iterate over all items with correct indices', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)

      const items: Array<{ value: number; index: number }> = []
      queue.forEach((value, index) => {
        items.push({ value, index })
      })

      expect(items).toEqual([
        { value: 1, index: 0 },
        { value: 2, index: 1 },
        { value: 3, index: 2 },
      ])
    })

    it('should not iterate over empty queue', () => {
      const queue = new AmortizedQueue<number>()
      let count = 0

      queue.forEach(() => {
        count++
      })

      expect(count).toBe(0)
    })

    it('should handle mixed enqueue/dequeue operations', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue() // Remove 1
      queue.enqueue(4)

      const items: number[] = []
      queue.forEach((value) => {
        items.push(value)
      })

      expect(items).toEqual([2, 3, 4])
    })
  })

  describe('Symbol.iterator', () => {
    it('should support for...of loop', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)

      const items: number[] = []
      for (const item of queue) {
        items.push(item)
      }

      expect(items).toEqual([1, 2, 3])
    })

    it('should support spread operator', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)

      const arr = [...queue]
      expect(arr).toEqual([1, 2, 3])
    })

    it('should support array destructuring', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)

      const [first, second, third] = queue
      expect(first).toBe(1)
      expect(second).toBe(2)
      expect(third).toBe(3)
    })

    it('should return empty iterator for empty queue', () => {
      const queue = new AmortizedQueue<number>()
      const items = [...queue]
      expect(items).toEqual([])
    })

    it('should create independent iterator copy', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)

      const iterator = queue[Symbol.iterator]()
      const firstResult = iterator.next()
      queue.dequeue() // Modify queue after creating iterator

      const secondResult = iterator.next()
      const thirdResult = iterator.next()
      const fourthResult = iterator.next()

      expect(firstResult.value).toBe(1)
      expect(secondResult.value).toBe(2)
      expect(thirdResult.value).toBe(3)
      expect(fourthResult.done).toBe(true)
    })
  })

  describe('enqueueMany / dequeueMany', () => {
    it('should enqueue multiple items at once', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueueMany([1, 2, 3])

      expect(queue.size()).toBe(3)
      expect(queue.toArray()).toEqual([1, 2, 3])
    })

    it('should append enqueueMany to existing items', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(0)
      queue.enqueueMany([1, 2, 3])

      expect(queue.size()).toBe(4)
      expect(queue.toArray()).toEqual([0, 1, 2, 3])
    })

    it('should handle empty array in enqueueMany', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueueMany([])

      expect(queue.size()).toBe(0)
    })

    it('should dequeueMany items', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.enqueue(4)
      queue.enqueue(5)

      const dequeued = queue.dequeueMany(3)
      expect(dequeued).toEqual([1, 2, 3])
      expect(queue.size()).toBe(2)
      expect(queue.toArray()).toEqual([4, 5])
    })

    it('should dequeueMany more items than available', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)

      const dequeued = queue.dequeueMany(5)
      expect(dequeued).toEqual([1, 2])
      expect(queue.size()).toBe(0)
    })

    it('should dequeueMany zero items', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)

      const dequeued = queue.dequeueMany(0)
      expect(dequeued).toEqual([])
      expect(queue.size()).toBe(2)
    })

    it('should throw error when enqueueMany on frozen queue', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      const frozen = queue.persist()

      expect(() => frozen.enqueueMany([2, 3])).toThrow('Cannot modify a frozen queue')
    })

    it('should throw error when dequeueMany on frozen queue', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      const frozen = queue.persist()

      expect(() => frozen.dequeueMany(2)).toThrow('Cannot modify a frozen queue')
    })
  })

  describe('reverse', () => {
    it('should create a reversed copy of the queue', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)

      const reversed = queue.reverse()
      expect(reversed.toArray()).toEqual([3, 2, 1])
    })

    it('should not modify the original queue', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)

      const reversed = queue.reverse()
      expect(queue.toArray()).toEqual([1, 2, 3])
      expect(reversed.toArray()).toEqual([3, 2, 1])
    })

    it('should return independent queue', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)

      const reversed = queue.reverse()
      queue.enqueue(3)

      expect(queue.toArray()).toEqual([1, 2, 3])
      expect(reversed.toArray()).toEqual([2, 1])
    })

    it('should reverse empty queue', () => {
      const queue = new AmortizedQueue<number>()
      const reversed = queue.reverse()

      expect(reversed.toArray()).toEqual([])
    })

    it('should reverse single element', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(42)

      const reversed = queue.reverse()
      expect(reversed.toArray()).toEqual([42])
    })

    it('should preserve maxSize option', () => {
      const queue = new AmortizedQueue<number>({ maxSize: 5 })
      queue.enqueue(1)
      queue.enqueue(2)

      const reversed = queue.reverse()
      reversed.enqueue(3)
      reversed.enqueue(4)
      reversed.enqueue(5)
      reversed.enqueue(6)

      expect(reversed.toArray()).toEqual([1, 3, 4, 5, 6])
    })
  })

  describe('map', () => {
    it('should map values with index', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)

      const mapped = queue.map((value, index) => value * 2 + index)
      expect(mapped.toArray()).toEqual([2, 5, 8])
    })

    it('should not modify the original queue', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)

      const mapped = queue.map((v) => v * 2)
      expect(queue.toArray()).toEqual([1, 2])
      expect(mapped.toArray()).toEqual([2, 4])
    })

    it('should return independent queue', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)

      const mapped = queue.map((v) => v * 2)
      queue.enqueue(3)

      expect(queue.toArray()).toEqual([1, 2, 3])
      expect(mapped.toArray()).toEqual([2, 4])
    })

    it('should map to different type', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)

      const mapped = queue.map((value) => value.toString())
      expect(mapped.toArray()).toEqual(['1', '2', '3'])
    })

    it('should preserve maxSize option', () => {
      const queue = new AmortizedQueue<number>({ maxSize: 2 })
      queue.enqueue(1)
      queue.enqueue(2)

      const mapped = queue.map((v) => v * 10)
      mapped.enqueue(30)
      mapped.enqueue(40)

      expect(mapped.toArray()).toEqual([30, 40])
    })
  })

  describe('filter', () => {
    it('should filter values with index', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.enqueue(4)

      const filtered = queue.filter((value, index) => value % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4])
    })

    it('should not modify the original queue', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)

      const filtered = queue.filter((v) => v > 1)
      expect(queue.toArray()).toEqual([1, 2, 3])
      expect(filtered.toArray()).toEqual([2, 3])
    })

    it('should return independent queue', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)

      const filtered = queue.filter((v) => v > 1)
      queue.enqueue(4)

      expect(queue.toArray()).toEqual([1, 2, 3, 4])
      expect(filtered.toArray()).toEqual([2, 3])
    })

    it('should filter all items out', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)

      const filtered = queue.filter((v) => v > 10)
      expect(filtered.toArray()).toEqual([])
    })

    it('should filter no items out', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)

      const filtered = queue.filter((v) => v > 0)
      expect(filtered.toArray()).toEqual([1, 2, 3])
    })

    it('should filter with index', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(10)
      queue.enqueue(20)
      queue.enqueue(30)

      const filtered = queue.filter((_, index) => index % 2 === 0)
      expect(filtered.toArray()).toEqual([10, 30])
    })

    it('should preserve maxSize option', () => {
      const queue = new AmortizedQueue<number>({ maxSize: 2 })
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)

      const filtered = queue.filter((v) => v >= 2)
      filtered.enqueue(4) // Should evict oldest (2)

      expect(filtered.toArray()).toEqual([3, 4])
    })
  })

  describe('clone', () => {
    it('should create an independent copy', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)

      const clone = queue.clone()
      expect(clone.toArray()).toEqual([1, 2, 3])
    })

    it('should not share state with original', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)

      const clone = queue.clone()
      queue.enqueue(3)
      clone.enqueue(4)

      expect(queue.toArray()).toEqual([1, 2, 3])
      expect(clone.toArray()).toEqual([1, 2, 4])
    })

    it('should clone not be frozen', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)

      const clone = queue.clone()
      expect(clone.isFrozen()).toBe(false)
      expect(clone.isFrozen()).toBe(queue.isFrozen())
    })

    it('should preserve maxSize option', () => {
      const queue = new AmortizedQueue<number>({ maxSize: 2 })
      queue.enqueue(1)

      const clone = queue.clone()
      clone.enqueue(2)
      clone.enqueue(3) // Should evict oldest (1)

      expect(clone.toArray()).toEqual([2, 3])
    })
  })

  describe('persist and isFrozen', () => {
    it('should create a frozen snapshot', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)

      const frozen = queue.persist()
      expect(frozen.isFrozen()).toBe(true)
      expect(frozen.toArray()).toEqual([1, 2, 3])
    })

    it('should not freeze the original queue', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)

      const frozen = queue.persist()
      expect(queue.isFrozen()).toBe(false)
      expect(frozen.isFrozen()).toBe(true)
    })

    it('should throw error when enqueue on frozen queue', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      const frozen = queue.persist()

      expect(() => frozen.enqueue(2)).toThrow('Cannot modify a frozen queue')
    })

    it('should throw error when dequeue on frozen queue', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      const frozen = queue.persist()

      expect(() => frozen.dequeue()).toThrow('Cannot modify a frozen queue')
    })

    it('should throw error when clear on frozen queue', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      const frozen = queue.persist()

      expect(() => frozen.clear()).toThrow('Cannot modify a frozen queue')
    })

    it('should throw error when fromArray on frozen queue', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      const frozen = queue.persist()

      expect(() => frozen.fromArray([2, 3])).toThrow('Cannot modify a frozen queue')
    })

    it('should throw error when enqueueMany on frozen queue', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      const frozen = queue.persist()

      expect(() => frozen.enqueueMany([2, 3])).toThrow('Cannot modify a frozen queue')
    })

    it('should throw error when dequeueMany on frozen queue', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      const frozen = queue.persist()

      expect(() => frozen.dequeueMany(2)).toThrow('Cannot modify a frozen queue')
    })

    it('should allow read operations on frozen queue', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)

      const frozen = queue.persist()
      expect(frozen.size()).toBe(3)
      expect(frozen.isEmpty()).toBe(false)
      expect(frozen.peek()).toBe(1)
      expect(frozen.front_()).toBe(1)
      expect(frozen.back()).toBe(3)
      expect(frozen.toArray()).toEqual([1, 2, 3])

      const items: number[] = []
      frozen.forEach((v) => items.push(v))
      expect(items).toEqual([1, 2, 3])

      const spreadItems = [...frozen]
      expect(spreadItems).toEqual([1, 2, 3])

      const reversed = frozen.reverse()
      expect(reversed.toArray()).toEqual([3, 2, 1])

      const mapped = frozen.map((v) => v * 2)
      expect(mapped.toArray()).toEqual([2, 4, 6])

      const filtered = frozen.filter((v) => v > 1)
      expect(filtered.toArray()).toEqual([2, 3])

      const clone = frozen.clone()
      expect(clone.toArray()).toEqual([1, 2, 3])
      expect(clone.isFrozen()).toBe(false)
    })

    it('should preserve snapshot when original changes', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)

      const frozen = queue.persist()
      queue.enqueue(3)
      queue.dequeue()

      expect(frozen.toArray()).toEqual([1, 2])
      expect(queue.toArray()).toEqual([2, 3])
    })
  })

  describe('maxSize option', () => {
    it('should enforce maxSize limit (0 means unlimited)', () => {
      const queue = new AmortizedQueue<number>({ maxSize: 3 })
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.enqueue(4)

      expect(queue.size()).toBe(3)
      expect(queue.toArray()).toEqual([2, 3, 4])
    })

    it('should evict oldest item when maxSize exceeded', () => {
      const queue = new AmortizedQueue<number>({ maxSize: 2 })
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)

      expect(queue.size()).toBe(2)
      expect(queue.toArray()).toEqual([2, 3])
    })

    it('should default to unlimited when maxSize is 0', () => {
      const queue = new AmortizedQueue<number>()
      for (let i = 0; i < 1000; i++) {
        queue.enqueue(i)
      }

      expect(queue.size()).toBe(1000)
    })

    it('should enforce maxSize in enqueueMany', () => {
      const queue = new AmortizedQueue<number>({ maxSize: 3 })
      queue.enqueue(1)
      queue.enqueueMany([2, 3, 4, 5])

      expect(queue.size()).toBe(3)
      expect(queue.toArray()).toEqual([3, 4, 5])
    })

    it('should handle maxSize with alternating enqueue/dequeue', () => {
      const queue = new AmortizedQueue<number>({ maxSize: 2 })
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      queue.enqueue(4)

      expect(queue.size()).toBe(2)
      expect(queue.toArray()).toEqual([3, 4])
    })

    it('should preserve maxSize in clone', () => {
      const queue = new AmortizedQueue<number>({ maxSize: 2 })
      queue.enqueue(1)
      queue.enqueue(2)

      const clone = queue.clone()
      clone.enqueue(3) // Should evict 1

      expect(clone.toArray()).toEqual([2, 3])
    })

    it('should preserve maxSize in reverse', () => {
      const queue = new AmortizedQueue<number>({ maxSize: 2 })
      queue.enqueue(1)
      queue.enqueue(2)

      const reversed = queue.reverse()
      reversed.enqueue(3) // Should evict 2

      expect(reversed.toArray()).toEqual([1, 3])
    })

    it('should preserve maxSize in map', () => {
      const queue = new AmortizedQueue<number>({ maxSize: 2 })
      queue.enqueue(1)
      queue.enqueue(2)

      const mapped = queue.map((v) => v * 10)
      mapped.enqueue(30) // Should evict 10

      expect(mapped.toArray()).toEqual([20, 30])
    })

    it('should preserve maxSize in filter', () => {
      const queue = new AmortizedQueue<number>({ maxSize: 2 })
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3) // Should evict 1

      const filtered = queue.filter((v) => v >= 2)
      filtered.enqueue(4) // Should evict 2

      expect(filtered.toArray()).toEqual([3, 4])
    })

    it('should not affect original when cloned queue exceeds maxSize', () => {
      const queue = new AmortizedQueue<number>({ maxSize: 2 })
      queue.enqueue(1)
      queue.enqueue(2)

      const clone = queue.clone()
      clone.enqueue(3)
      clone.enqueue(4)

      expect(queue.toArray()).toEqual([1, 2])
      expect(clone.toArray()).toEqual([3, 4])
    })
  })

  describe('edge cases', () => {
    it('should handle alternating enqueue/dequeue operations', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.dequeue()).toBe(1)
      queue.enqueue(3)
      expect(queue.dequeue()).toBe(2)
      expect(queue.dequeue()).toBe(3)
      expect(queue.dequeue()).toBe(undefined)
      expect(queue.isEmpty()).toBe(true)
    })

    it('should handle single element queue', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(42)

      expect(queue.size()).toBe(1)
      expect(queue.isEmpty()).toBe(false)
      expect(queue.peek()).toBe(42)
      expect(queue.front_()).toBe(42)
      expect(queue.back()).toBe(42)
      expect(queue.dequeue()).toBe(42)
      expect(queue.isEmpty()).toBe(true)
    })

    it('should handle rapid enqueue/dequeue of same element', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.dequeue()
      queue.enqueue(1)
      queue.dequeue()
      queue.enqueue(1)

      expect(queue.size()).toBe(1)
      expect(queue.peek()).toBe(1)
    })

    it('should handle different types', () => {
      const strQueue = new AmortizedQueue<string>()
      strQueue.enqueue('a')
      strQueue.enqueue('b')
      expect(strQueue.toArray()).toEqual(['a', 'b'])

      const objQueue = new AmortizedQueue<{ id: number }>()
      objQueue.enqueue({ id: 1 })
      objQueue.enqueue({ id: 2 })
      expect(objQueue.toArray()).toEqual([{ id: 1 }, { id: 2 }])

      const boolQueue = new AmortizedQueue<boolean>()
      boolQueue.enqueue(true)
      boolQueue.enqueue(false)
      expect(boolQueue.toArray()).toEqual([true, false])
    })

    it('should handle null and undefined values', () => {
      const queue = new AmortizedQueue<number | null | undefined>()
      queue.enqueue(null)
      queue.enqueue(undefined)
      queue.enqueue(1)

      expect(queue.size()).toBe(3)
      expect(queue.toArray()).toEqual([null, undefined, 1])
    })

    it('should handle complex objects with references', () => {
      const obj1 = { id: 1 }
      const obj2 = { id: 2 }
      const queue = new AmortizedQueue<{ id: number }>()
      queue.enqueue(obj1)
      queue.enqueue(obj2)

      const items = queue.toArray()
      expect(items[0]).toBe(obj1)
      expect(items[1]).toBe(obj2)
    })

    it('should handle forEach with side effects', () => {
      const queue = new AmortizedQueue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)

      let sum = 0
      queue.forEach((v) => {
        sum += v
      })

      expect(sum).toBe(6)
    })

    it('should handle map with transformation', () => {
      const queue = new AmortizedQueue<string>()
      queue.enqueue('hello')
      queue.enqueue('world')

      const mapped = queue.map((s) => s.toUpperCase())
      expect(mapped.toArray()).toEqual(['HELLO', 'WORLD'])
    })

    it('should handle filter with complex predicate', () => {
      const queue = new AmortizedQueue<{ id: number; active: boolean }>()
      queue.enqueue({ id: 1, active: true })
      queue.enqueue({ id: 2, active: false })
      queue.enqueue({ id: 3, active: true })

      const filtered = queue.filter((item) => item.active)
      expect(filtered.toArray()).toEqual([
        { id: 1, active: true },
        { id: 3, active: true },
      ])
    })
  })
})