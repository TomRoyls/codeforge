import { describe, it, expect, beforeEach } from 'vitest'
import { AugmentedQueue } from '../src/core/augmented-queue/index.js'

describe('AugmentedQueue', () => {
  let queue: AugmentedQueue

  beforeEach(() => {
    queue = new AugmentedQueue()
  })

  // ─── Constructor ────────────────────────────────────────────────────────

  describe('constructor', () => {
    it('should create empty queue with no arguments', () => {
      expect(queue.size()).toBe(0)
      expect(queue.isEmpty()).toBe(true)
    })

    it('should initialize with elements from options', () => {
      const q = new AugmentedQueue({ elements: [1, 2, 3] })
      expect(q.size()).toBe(3)
      expect(q.isEmpty()).toBe(false)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('should handle empty options object', () => {
      const q = new AugmentedQueue({})
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('should handle empty elements array in options', () => {
      const q = new AugmentedQueue({ elements: [] })
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('should preserve insertion order from options', () => {
      const q = new AugmentedQueue({ elements: [5, 1, 9, 3, 7] })
      expect(q.peek()).toBe(5)
      expect(q.peekBack()).toBe(7)
    })
  })

  // ─── enqueue ──────────────────────────────────────────────────────────

  describe('enqueue', () => {
    it('should add a single element to an empty queue', () => {
      queue.enqueue(42)
      expect(queue.size()).toBe(1)
      expect(queue.isEmpty()).toBe(false)
    })

    it('should add multiple elements in FIFO order', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.size()).toBe(3)
      expect(queue.peek()).toBe(1)
      expect(queue.peekBack()).toBe(3)
    })

    it('should handle negative numbers', () => {
      queue.enqueue(-5)
      queue.enqueue(-10)
      queue.enqueue(-1)
      expect(queue.toArray()).toEqual([-5, -10, -1])
    })

    it('should handle zero', () => {
      queue.enqueue(0)
      expect(queue.size()).toBe(1)
      expect(queue.peek()).toBe(0)
    })

    it('should handle floating point numbers', () => {
      queue.enqueue(3.14)
      queue.enqueue(2.718)
      expect(queue.size()).toBe(2)
      expect(queue.peek()).toBeCloseTo(3.14)
    })

    it('should handle duplicate values', () => {
      queue.enqueue(5)
      queue.enqueue(5)
      queue.enqueue(5)
      expect(queue.size()).toBe(3)
      expect(queue.toArray()).toEqual([5, 5, 5])
    })
  })

  // ─── dequeue ──────────────────────────────────────────────────────────

  describe('dequeue', () => {
    it('should throw when dequeuing from an empty queue', () => {
      expect(() => queue.dequeue()).toThrow('AugmentedQueue is empty')
    })

    it('should dequeue single element', () => {
      queue.enqueue(10)
      expect(queue.dequeue()).toBe(10)
      expect(queue.isEmpty()).toBe(true)
    })

    it('should dequeue in FIFO order', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.dequeue()).toBe(1)
      expect(queue.dequeue()).toBe(2)
      expect(queue.dequeue()).toBe(3)
      expect(queue.isEmpty()).toBe(true)
    })

    it('should throw when dequeuing after all elements removed', () => {
      queue.enqueue(1)
      queue.dequeue()
      expect(() => queue.dequeue()).toThrow('AugmentedQueue is empty')
    })

    it('should handle interleaved enqueue and dequeue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.dequeue()).toBe(1)
      queue.enqueue(4)
      queue.enqueue(5)
      expect(queue.dequeue()).toBe(2)
      expect(queue.dequeue()).toBe(3)
      expect(queue.dequeue()).toBe(4)
      expect(queue.dequeue()).toBe(5)
      expect(queue.isEmpty()).toBe(true)
    })
  })

  // ─── peek ─────────────────────────────────────────────────────────────

  describe('peek', () => {
    it('should throw when peeking an empty queue', () => {
      expect(() => queue.peek()).toThrow('AugmentedQueue is empty')
    })

    it('should return the front element without removing it', () => {
      queue.enqueue(10)
      expect(queue.peek()).toBe(10)
      expect(queue.size()).toBe(1)
    })

    it('should return the same element on repeated calls', () => {
      queue.enqueue(5)
      queue.enqueue(6)
      expect(queue.peek()).toBe(5)
      expect(queue.peek()).toBe(5)
      expect(queue.size()).toBe(2)
    })

    it('should update after dequeue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      expect(queue.peek()).toBe(2)
    })

    it('should return first enqueued element when no dequeue has occurred', () => {
      queue.enqueue(99)
      queue.enqueue(100)
      expect(queue.peek()).toBe(99)
    })
  })

  // ─── peekBack ─────────────────────────────────────────────────────────

  describe('peekBack', () => {
    it('should throw when peeking back of an empty queue', () => {
      expect(() => queue.peekBack()).toThrow('AugmentedQueue is empty')
    })

    it('should return the back element without removing it', () => {
      queue.enqueue(10)
      queue.enqueue(20)
      queue.enqueue(30)
      expect(queue.peekBack()).toBe(30)
      expect(queue.size()).toBe(3)
    })

    it('should return the same element on repeated calls', () => {
      queue.enqueue(5)
      queue.enqueue(6)
      expect(queue.peekBack()).toBe(6)
      expect(queue.peekBack()).toBe(6)
    })

    it('should return the only element for a single-element queue', () => {
      queue.enqueue(42)
      expect(queue.peekBack()).toBe(42)
      expect(queue.peek()).toBe(42)
    })

    it('should update after enqueue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.peekBack()).toBe(2)
      queue.enqueue(3)
      expect(queue.peekBack()).toBe(3)
    })

    it('should differ from peek with multiple items', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.peek()).toBe(1)
      expect(queue.peekBack()).toBe(3)
    })
  })

  // ─── size ─────────────────────────────────────────────────────────────

  describe('size', () => {
    it('should return 0 for a new queue', () => {
      expect(queue.size()).toBe(0)
    })

    it('should increase after each enqueue', () => {
      queue.enqueue(1)
      expect(queue.size()).toBe(1)
      queue.enqueue(2)
      expect(queue.size()).toBe(2)
      queue.enqueue(3)
      expect(queue.size()).toBe(3)
    })

    it('should decrease after each dequeue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      expect(queue.size()).toBe(2)
      queue.dequeue()
      expect(queue.size()).toBe(1)
    })

    it('should return 0 after clearing', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.clear()
      expect(queue.size()).toBe(0)
    })
  })

  // ─── isEmpty ──────────────────────────────────────────────────────────

  describe('isEmpty', () => {
    it('should return true for a new queue', () => {
      expect(queue.isEmpty()).toBe(true)
    })

    it('should return false after enqueue', () => {
      queue.enqueue(1)
      expect(queue.isEmpty()).toBe(false)
    })

    it('should return true after dequeuing all elements', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      queue.dequeue()
      expect(queue.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.clear()
      expect(queue.isEmpty()).toBe(true)
    })
  })

  // ─── min ──────────────────────────────────────────────────────────────

  describe('min', () => {
    it('should throw when called on an empty queue', () => {
      expect(() => queue.min()).toThrow('AugmentedQueue is empty')
    })

    it('should return the single element for a single-element queue', () => {
      queue.enqueue(42)
      expect(queue.min()).toBe(42)
    })

    it('should return the minimum value in the queue', () => {
      queue.enqueue(5)
      queue.enqueue(1)
      queue.enqueue(10)
      queue.enqueue(3)
      expect(queue.min()).toBe(1)
    })

    it('should handle negative numbers', () => {
      queue.enqueue(-5)
      queue.enqueue(10)
      queue.enqueue(-20)
      queue.enqueue(3)
      expect(queue.min()).toBe(-20)
    })

    it('should update after enqueue adds a new minimum', () => {
      queue.enqueue(5)
      queue.enqueue(10)
      expect(queue.min()).toBe(5)
      queue.enqueue(1)
      expect(queue.min()).toBe(1)
    })

    it('should update after dequeue removes the minimum', () => {
      queue.enqueue(1)
      queue.enqueue(5)
      queue.enqueue(10)
      expect(queue.min()).toBe(1)
      queue.dequeue() // removes 1
      expect(queue.min()).toBe(5)
    })

    it('should not change after dequeue when minimum remains in queue', () => {
      queue.enqueue(1)
      queue.enqueue(5)
      queue.enqueue(10)
      expect(queue.min()).toBe(1)
      queue.dequeue() // removes 1
      expect(queue.min()).toBe(5)
      queue.enqueue(2) // new min candidate
      expect(queue.min()).toBe(2)
    })

    it('should handle all same values', () => {
      queue.enqueue(7)
      queue.enqueue(7)
      queue.enqueue(7)
      expect(queue.min()).toBe(7)
    })

    it('should work with interleaved operations', () => {
      queue.enqueue(10)
      queue.enqueue(5)
      expect(queue.min()).toBe(5)
      queue.enqueue(1)
      expect(queue.min()).toBe(1)
      queue.dequeue() // removes 10
      expect(queue.min()).toBe(1)
      queue.dequeue() // removes 5
      expect(queue.min()).toBe(1)
    })
  })

  // ─── max ──────────────────────────────────────────────────────────────

  describe('max', () => {
    it('should throw when called on an empty queue', () => {
      expect(() => queue.max()).toThrow('AugmentedQueue is empty')
    })

    it('should return the single element for a single-element queue', () => {
      queue.enqueue(42)
      expect(queue.max()).toBe(42)
    })

    it('should return the maximum value in the queue', () => {
      queue.enqueue(5)
      queue.enqueue(10)
      queue.enqueue(1)
      queue.enqueue(3)
      expect(queue.max()).toBe(10)
    })

    it('should handle negative numbers', () => {
      queue.enqueue(-5)
      queue.enqueue(-10)
      queue.enqueue(-1)
      queue.enqueue(-20)
      expect(queue.max()).toBe(-1)
    })

    it('should update after enqueue adds a new maximum', () => {
      queue.enqueue(5)
      queue.enqueue(1)
      expect(queue.max()).toBe(5)
      queue.enqueue(10)
      expect(queue.max()).toBe(10)
    })

    it('should update after dequeue removes the maximum', () => {
      queue.enqueue(10)
      queue.enqueue(5)
      queue.enqueue(1)
      expect(queue.max()).toBe(10)
      queue.dequeue() // removes 10
      expect(queue.max()).toBe(5)
    })

    it('should handle all same values', () => {
      queue.enqueue(7)
      queue.enqueue(7)
      queue.enqueue(7)
      expect(queue.max()).toBe(7)
    })

    it('should work with interleaved operations', () => {
      queue.enqueue(1)
      queue.enqueue(5)
      expect(queue.max()).toBe(5)
      queue.enqueue(10)
      expect(queue.max()).toBe(10)
      queue.dequeue() // removes 1
      expect(queue.max()).toBe(10)
      queue.dequeue() // removes 5
      expect(queue.max()).toBe(10)
    })
  })

  // ─── sum ──────────────────────────────────────────────────────────────

  describe('sum', () => {
    it('should throw when called on an empty queue', () => {
      expect(() => queue.sum()).toThrow('AugmentedQueue is empty')
    })

    it('should return the single element for a single-element queue', () => {
      queue.enqueue(10)
      expect(queue.sum()).toBe(10)
    })

    it('should return the sum of all elements', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.enqueue(4)
      queue.enqueue(5)
      expect(queue.sum()).toBe(15)
    })

    it('should handle negative numbers', () => {
      queue.enqueue(-5)
      queue.enqueue(10)
      queue.enqueue(-3)
      expect(queue.sum()).toBe(2)
    })

    it('should handle zeros', () => {
      queue.enqueue(0)
      queue.enqueue(0)
      queue.enqueue(5)
      queue.enqueue(0)
      expect(queue.sum()).toBe(5)
    })

    it('should update after enqueue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.sum()).toBe(3)
      queue.enqueue(3)
      expect(queue.sum()).toBe(6)
    })

    it('should update after dequeue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.sum()).toBe(6)
      queue.dequeue() // removes 1
      expect(queue.sum()).toBe(5)
      queue.dequeue() // removes 2
      expect(queue.sum()).toBe(3)
    })

    it('should handle large numbers', () => {
      queue.enqueue(1000000)
      queue.enqueue(2000000)
      queue.enqueue(3000000)
      expect(queue.sum()).toBe(6000000)
    })

    it('should work with interleaved operations', () => {
      queue.enqueue(10)
      queue.enqueue(20)
      expect(queue.sum()).toBe(30)
      queue.dequeue() // removes 10
      expect(queue.sum()).toBe(20)
      queue.enqueue(30)
      expect(queue.sum()).toBe(50)
      queue.dequeue() // removes 20
      expect(queue.sum()).toBe(30)
    })
  })

  // ─── average ──────────────────────────────────────────────────────────

  describe('average', () => {
    it('should throw when called on an empty queue', () => {
      expect(() => queue.average()).toThrow('AugmentedQueue is empty')
    })

    it('should return the single element for a single-element queue', () => {
      queue.enqueue(7)
      expect(queue.average()).toBe(7)
    })

    it('should calculate average of multiple elements', () => {
      queue.enqueue(2)
      queue.enqueue(4)
      queue.enqueue(6)
      expect(queue.average()).toBeCloseTo(4)
    })

    it('should handle non-integer average', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.average()).toBeCloseTo(1.5)
    })

    it('should handle negative numbers', () => {
      queue.enqueue(-4)
      queue.enqueue(2)
      queue.enqueue(8)
      expect(queue.average()).toBeCloseTo(2)
    })

    it('should handle zero sum', () => {
      queue.enqueue(-5)
      queue.enqueue(0)
      queue.enqueue(5)
      expect(queue.average()).toBeCloseTo(0)
    })

    it('should update after enqueue', () => {
      queue.enqueue(10)
      queue.enqueue(20)
      expect(queue.average()).toBe(15)
      queue.enqueue(30)
      expect(queue.average()).toBe(20)
    })

    it('should update after dequeue', () => {
      queue.enqueue(10)
      queue.enqueue(20)
      queue.enqueue(30)
      expect(queue.average()).toBe(20)
      queue.dequeue() // removes 10
      expect(queue.average()).toBe(25)
      queue.dequeue() // removes 20
      expect(queue.average()).toBe(30)
    })
  })

  // ─── clear ────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('should clear an empty queue without error', () => {
      queue.clear()
      expect(queue.size()).toBe(0)
      expect(queue.isEmpty()).toBe(true)
    })

    it('should remove all elements', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.clear()
      expect(queue.size()).toBe(0)
      expect(queue.isEmpty()).toBe(true)
    })

    it('should allow reuse after clearing', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.clear()
      queue.enqueue(99)
      expect(queue.size()).toBe(1)
      expect(queue.peek()).toBe(99)
      expect(queue.min()).toBe(99)
      expect(queue.max()).toBe(99)
    })

    it('should produce empty toArray after clear', () => {
      queue.enqueue(10)
      queue.enqueue(20)
      queue.enqueue(30)
      queue.clear()
      expect(queue.toArray()).toEqual([])
    })

    it('should throw on peek after clear', () => {
      queue.enqueue(1)
      queue.clear()
      expect(() => queue.peek()).toThrow('AugmentedQueue is empty')
    })

    it('should throw on dequeue after clear', () => {
      queue.enqueue(1)
      queue.clear()
      expect(() => queue.dequeue()).toThrow('AugmentedQueue is empty')
    })
  })

  // ─── toArray ──────────────────────────────────────────────────────────

  describe('toArray', () => {
    it('should return empty array for an empty queue', () => {
      expect(queue.toArray()).toEqual([])
    })

    it('should return elements in FIFO order', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.toArray()).toEqual([1, 2, 3])
    })

    it('should not modify the queue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.toArray()
      expect(queue.size()).toBe(3)
      expect(queue.peek()).toBe(1)
    })

    it('should return a snapshot unaffected by later mutations', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      const arr = queue.toArray()
      arr.push(99)
      expect(queue.toArray()).toEqual([1, 2])
      queue.enqueue(3)
      expect(arr).toEqual([1, 2, 99])
    })

    it('should reflect state after partial dequeue', () => {
      queue.enqueue(10)
      queue.enqueue(20)
      queue.enqueue(30)
      queue.dequeue()
      expect(queue.toArray()).toEqual([20, 30])
    })

    it('should handle negative numbers', () => {
      queue.enqueue(-1)
      queue.enqueue(0)
      queue.enqueue(1)
      expect(queue.toArray()).toEqual([-1, 0, 1])
    })

    it('should handle duplicates', () => {
      queue.enqueue(5)
      queue.enqueue(5)
      queue.enqueue(5)
      expect(queue.toArray()).toEqual([5, 5, 5])
    })
  })

  // ─── clone ────────────────────────────────────────────────────────────

  describe('clone', () => {
    it('should clone an empty queue', () => {
      const cloned = queue.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should clone queue with elements', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      const cloned = queue.clone()
      expect(cloned.size()).toBe(3)
      expect(cloned.toArray()).toEqual([1, 2, 3])
    })

    it('should create independent clone — enqueue into clone does not affect original', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      const cloned = queue.clone()
      cloned.enqueue(3)
      expect(queue.size()).toBe(2)
      expect(cloned.size()).toBe(3)
    })

    it('should create independent clone — dequeue from clone does not affect original', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      const cloned = queue.clone()
      cloned.dequeue()
      expect(queue.size()).toBe(2)
      expect(cloned.size()).toBe(1)
    })

    it('should create independent clone — clearing original does not affect clone', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      const cloned = queue.clone()
      queue.clear()
      expect(cloned.size()).toBe(3)
      expect(queue.size()).toBe(0)
    })

    it('should preserve min/max/sum values', () => {
      queue.enqueue(5)
      queue.enqueue(3)
      queue.enqueue(8)
      queue.enqueue(1)
      queue.enqueue(9)
      const cloned = queue.clone()
      expect(cloned.min()).toBe(queue.min())
      expect(cloned.max()).toBe(queue.max())
      expect(cloned.sum()).toBe(queue.sum())
    })

    it('should preserve average', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      const cloned = queue.clone()
      expect(cloned.average()).toBe(queue.average())
    })
  })

  // ─── forEach ──────────────────────────────────────────────────────────

  describe('forEach', () => {
    it('should not iterate on an empty queue', () => {
      let count = 0
      queue.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should iterate over all elements in FIFO order', () => {
      queue.enqueue(10)
      queue.enqueue(20)
      queue.enqueue(30)
      const collected: number[] = []
      queue.forEach((item) => collected.push(item))
      expect(collected).toEqual([10, 20, 30])
    })

    it('should provide correct indices', () => {
      queue.enqueue(5)
      queue.enqueue(6)
      queue.enqueue(7)
      const indices: number[] = []
      queue.forEach((_item, index) => indices.push(index))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should iterate correctly after partial dequeue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.enqueue(4)
      queue.dequeue()
      const collected: number[] = []
      queue.forEach((item) => collected.push(item))
      expect(collected).toEqual([2, 3, 4])
    })

    it('should iterate correctly after enqueue onto partially dequeued queue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      queue.enqueue(4)
      const collected: number[] = []
      queue.forEach((item) => collected.push(item))
      expect(collected).toEqual([2, 3, 4])
    })
  })

  // ─── Symbol.iterator ─────────────────────────────────────────────────

  describe('Symbol.iterator', () => {
    it('should return empty iterator for empty queue', () => {
      expect([...queue]).toEqual([])
    })

    it('should iterate over all elements in FIFO order', () => {
      queue.enqueue(10)
      queue.enqueue(20)
      queue.enqueue(30)
      expect([...queue]).toEqual([10, 20, 30])
    })

    it('should work in a for-of loop', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      const collected: number[] = []
      for (const item of queue) {
        collected.push(item)
      }
      expect(collected).toEqual([1, 2, 3])
    })

    it('should work after partial dequeue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      expect([...queue]).toEqual([2, 3])
    })

    it('should work with mixed enqueue/dequeue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      queue.enqueue(3)
      queue.enqueue(4)
      expect([...queue]).toEqual([2, 3, 4])
    })

    it('should handle negative numbers', () => {
      queue.enqueue(-5)
      queue.enqueue(0)
      queue.enqueue(5)
      expect([...queue]).toEqual([-5, 0, 5])
    })
  })

  // ─── static fromArray ─────────────────────────────────────────────────

  describe('static fromArray', () => {
    it('should create an empty queue from an empty array', () => {
      const q = AugmentedQueue.fromArray([])
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('should create a queue with correct order', () => {
      const q = AugmentedQueue.fromArray([10, 20, 30])
      expect(q.size()).toBe(3)
      expect(q.peek()).toBe(10)
      expect(q.peekBack()).toBe(30)
    })

    it('should preserve order from array', () => {
      const q = AugmentedQueue.fromArray([5, 1, 9, 3, 7])
      expect(q.toArray()).toEqual([5, 1, 9, 3, 7])
    })

    it('should return a queue independent of the source array', () => {
      const arr = [1, 2, 3]
      const q = AugmentedQueue.fromArray(arr)
      arr.push(4)
      expect(q.size()).toBe(3)
    })

    it('should calculate correct statistics', () => {
      const q = AugmentedQueue.fromArray([5, 1, 10, 3])
      expect(q.min()).toBe(1)
      expect(q.max()).toBe(10)
      expect(q.sum()).toBe(19)
      expect(q.average()).toBeCloseTo(4.75)
    })

    it('should handle negative numbers', () => {
      const q = AugmentedQueue.fromArray([-5, 0, 5])
      expect(q.toArray()).toEqual([-5, 0, 5])
    })

    it('should handle duplicates', () => {
      const q = AugmentedQueue.fromArray([5, 5, 5])
      expect(q.size()).toBe(3)
      expect(q.toArray()).toEqual([5, 5, 5])
    })
  })

  // ─── Combined statistics ──────────────────────────────────────────────

  describe('combined statistics', () => {
    it('should maintain all statistics together', () => {
      queue.enqueue(10)
      queue.enqueue(20)
      queue.enqueue(30)
      expect(queue.size()).toBe(3)
      expect(queue.min()).toBe(10)
      expect(queue.max()).toBe(30)
      expect(queue.sum()).toBe(60)
      expect(queue.average()).toBe(20)
    })

    it('should update all statistics after enqueue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.min()).toBe(1)
      expect(queue.max()).toBe(2)
      expect(queue.sum()).toBe(3)
      expect(queue.average()).toBe(1.5)
      queue.enqueue(3)
      expect(queue.min()).toBe(1)
      expect(queue.max()).toBe(3)
      expect(queue.sum()).toBe(6)
      expect(queue.average()).toBe(2)
    })

    it('should update all statistics after dequeue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.min()).toBe(1)
      expect(queue.max()).toBe(3)
      expect(queue.sum()).toBe(6)
      expect(queue.average()).toBe(2)
      queue.dequeue() // removes 1
      expect(queue.min()).toBe(2)
      expect(queue.max()).toBe(3)
      expect(queue.sum()).toBe(5)
      expect(queue.average()).toBe(2.5)
    })

    it('should handle all negative numbers', () => {
      queue.enqueue(-10)
      queue.enqueue(-20)
      queue.enqueue(-30)
      expect(queue.min()).toBe(-30)
      expect(queue.max()).toBe(-10)
      expect(queue.sum()).toBe(-60)
      expect(queue.average()).toBe(-20)
    })
  })

  // ─── Edge cases ───────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('should handle single element for all operations', () => {
      queue.enqueue(42)
      expect(queue.size()).toBe(1)
      expect(queue.isEmpty()).toBe(false)
      expect(queue.peek()).toBe(42)
      expect(queue.peekBack()).toBe(42)
      expect(queue.min()).toBe(42)
      expect(queue.max()).toBe(42)
      expect(queue.sum()).toBe(42)
      expect(queue.average()).toBe(42)
      expect(queue.toArray()).toEqual([42])
      expect([...queue]).toEqual([42])
    })

    it('should handle all same values', () => {
      for (let i = 0; i < 10; i++) {
        queue.enqueue(5)
      }
      expect(queue.size()).toBe(10)
      expect(queue.min()).toBe(5)
      expect(queue.max()).toBe(5)
      expect(queue.sum()).toBe(50)
      expect(queue.average()).toBe(5)
    })

    it('should handle strictly increasing sequence', () => {
      const q = AugmentedQueue.fromArray([1, 2, 3, 4, 5])
      expect(q.min()).toBe(1)
      expect(q.max()).toBe(5)
      expect(q.sum()).toBe(15)
    })

    it('should handle strictly decreasing sequence', () => {
      const q = AugmentedQueue.fromArray([5, 4, 3, 2, 1])
      expect(q.min()).toBe(1)
      expect(q.max()).toBe(5)
      expect(q.sum()).toBe(15)
    })

    it('should handle mixed positive and negative values', () => {
      const q = new AugmentedQueue({ elements: [-10, 20, -30, 40, -50] })
      expect(q.min()).toBe(-50)
      expect(q.max()).toBe(40)
      expect(q.sum()).toBe(-30)
      expect(q.average()).toBeCloseTo(-6)
    })

    it('should handle large batch of elements', () => {
      const elements: number[] = []
      for (let i = 0; i < 1000; i++) {
        elements.push(i)
      }
      const q = AugmentedQueue.fromArray(elements)
      expect(q.size()).toBe(1000)
      expect(q.min()).toBe(0)
      expect(q.max()).toBe(999)
      expect(q.sum()).toBe(499500)
    })

    it('should handle enqueue after dequeue triggers internal transfer', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue() // triggers transfer of backStack to frontStack
      queue.enqueue(4)
      queue.enqueue(5)
      expect(queue.toArray()).toEqual([2, 3, 4, 5])
      expect(queue.min()).toBe(2)
      expect(queue.max()).toBe(5)
      expect(queue.sum()).toBe(14)
    })

    it('should handle dequeue of all elements then re-fill', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      queue.dequeue()
      expect(queue.isEmpty()).toBe(true)
      queue.enqueue(100)
      queue.enqueue(200)
      expect(queue.size()).toBe(2)
      expect(queue.peek()).toBe(100)
      expect(queue.peekBack()).toBe(200)
    })

    it('should handle enqueue/dequeue removing min and max', () => {
      queue.enqueue(1)
      queue.enqueue(10)
      queue.enqueue(5)
      expect(queue.min()).toBe(1)
      expect(queue.max()).toBe(10)
      queue.dequeue() // removes 1 (the min)
      expect(queue.min()).toBe(5)
      expect(queue.max()).toBe(10)
      queue.dequeue() // removes 10 (the max)
      expect(queue.min()).toBe(5)
      expect(queue.max()).toBe(5)
    })

    it('should handle min and max being the same for identical elements after dequeue', () => {
      queue.enqueue(8)
      queue.enqueue(8)
      queue.enqueue(8)
      queue.dequeue()
      expect(queue.min()).toBe(8)
      expect(queue.max()).toBe(8)
    })

    it('should handle many enqueue operations', () => {
      const count = 10000
      for (let i = 0; i < count; i++) {
        queue.enqueue(i)
      }
      expect(queue.size()).toBe(count)
    })

    it('should handle many dequeue operations', () => {
      const count = 1000
      for (let i = 0; i < count; i++) {
        queue.enqueue(i)
      }
      for (let i = 0; i < count; i++) {
        expect(queue.dequeue()).toBe(i)
      }
      expect(queue.isEmpty()).toBe(true)
    })

    it('should maintain statistics with large dataset', () => {
      const values: number[] = []
      const count = 1000
      for (let i = 0; i < count; i++) {
        const value = Math.floor(Math.random() * 1000)
        values.push(value)
        queue.enqueue(value)
      }
      const expectedMin = Math.min(...values)
      const expectedMax = Math.max(...values)
      const expectedSum = values.reduce((a, b) => a + b, 0)
      expect(queue.min()).toBe(expectedMin)
      expect(queue.max()).toBe(expectedMax)
      expect(queue.sum()).toBe(expectedSum)
    })

    it('should handle alternating enqueue/dequeue', () => {
      for (let i = 0; i < 100; i++) {
        queue.enqueue(i)
        if (i % 2 === 0) {
          queue.dequeue()
        }
      }
      expect(queue.size()).toBe(50)
    })

    it('should maintain queue semantics with peek and dequeue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.peek()).toBe(1)
      expect(queue.peek()).toBe(1)
      expect(queue.dequeue()).toBe(1)
      expect(queue.peek()).toBe(2)
      expect(queue.peekBack()).toBe(3)
      expect(queue.peekBack()).toBe(3)
      expect(queue.dequeue()).toBe(2)
      expect(queue.peek()).toBe(3)
      expect(queue.peekBack()).toBe(3)
    })

    it('should clone after partial dequeue preserving correct state', () => {
      queue.enqueue(10)
      queue.enqueue(20)
      queue.enqueue(30)
      queue.enqueue(40)
      queue.dequeue()
      const cloned = queue.clone()
      expect(cloned.toArray()).toEqual([20, 30, 40])
      expect(cloned.min()).toBe(20)
      expect(cloned.max()).toBe(40)
      expect(cloned.sum()).toBe(90)
    })

    it('should work through a complex integration scenario', () => {
      queue.enqueue(10)
      queue.enqueue(20)
      expect(queue.size()).toBe(2)
      expect(queue.min()).toBe(10)
      expect(queue.max()).toBe(20)
      expect(queue.sum()).toBe(30)
      expect(queue.average()).toBe(15)

      queue.enqueue(5)
      expect(queue.min()).toBe(5)
      expect(queue.sum()).toBe(35)

      queue.dequeue() // removes 10
      expect(queue.peek()).toBe(20)
      expect(queue.min()).toBe(5)
      expect(queue.max()).toBe(20)
      expect(queue.sum()).toBe(25)

      queue.dequeue() // removes 20
      expect(queue.peek()).toBe(5)
      expect(queue.min()).toBe(5)
      expect(queue.max()).toBe(5)

      queue.enqueue(15)
      queue.enqueue(25)
      expect(queue.toArray()).toEqual([5, 15, 25])
      expect(queue.min()).toBe(5)
      expect(queue.max()).toBe(25)
      expect(queue.sum()).toBe(45)
      expect(queue.average()).toBe(15)
    })

    it('should handle cloning after various operations', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      queue.enqueue(4)

      const cloned = queue.clone()
      expect(cloned.toArray()).toEqual([2, 3, 4])
      expect(cloned.min()).toBe(2)
      expect(cloned.max()).toBe(4)
      expect(cloned.sum()).toBe(9)

      cloned.enqueue(5)
      cloned.dequeue()
      expect(cloned.toArray()).toEqual([3, 4, 5])
      expect(queue.toArray()).toEqual([2, 3, 4])
    })

    it('should iterate over large dataset with for-of', () => {
      const count = 1000
      for (let i = 0; i < count; i++) {
        queue.enqueue(i)
      }
      let iteratedCount = 0
      for (const _item of queue) {
        iteratedCount++
      }
      expect(iteratedCount).toBe(count)
    })

    it('should forEach over large dataset', () => {
      const count = 1000
      for (let i = 0; i < count; i++) {
        queue.enqueue(i)
      }
      let iteratedCount = 0
      queue.forEach(() => iteratedCount++)
      expect(iteratedCount).toBe(count)
    })
  })
})
