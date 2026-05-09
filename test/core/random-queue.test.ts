import { describe, it, expect, beforeEach } from 'vitest'
import { RandomQueue } from '../../src/core/random-queue/random-queue.js'
import { DEFAULT_RANDOM_QUEUE_OPTIONS } from '../../src/core/random-queue/types.js'
import type { RandomQueueOptions } from '../../src/core/random-queue/types.js'

describe('RandomQueue', () => {
  let queue: RandomQueue<number>

  beforeEach(() => {
    queue = new RandomQueue<number>({ seed: 42 })
  })

  describe('constructor', () => {
    it('should create an empty queue with default options', () => {
      const q = new RandomQueue()
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('should accept a seed option', () => {
      const q = new RandomQueue<number>({ seed: 123 })
      expect(q.size()).toBe(0)
    })

    it('should accept no options', () => {
      const q = new RandomQueue<number>()
      expect(q.size()).toBe(0)
    })

    it('should use default seed when not provided', () => {
      const q1 = new RandomQueue<number>()
      const q2 = new RandomQueue<number>()
      q1.enqueue(1)
      q1.enqueue(2)
      q1.enqueue(3)
      q2.enqueue(1)
      q2.enqueue(2)
      q2.enqueue(3)
      expect(q1.dequeue()).toBe(q2.dequeue())
    })
  })

  describe('enqueue', () => {
    it('should add a single element', () => {
      queue.enqueue(10)
      expect(queue.size()).toBe(1)
      expect(queue.isEmpty()).toBe(false)
    })

    it('should add multiple elements', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.size()).toBe(3)
    })

    it('should handle enqueuing the same value multiple times', () => {
      queue.enqueue(5)
      queue.enqueue(5)
      queue.enqueue(5)
      expect(queue.size()).toBe(3)
    })

    it('should handle enqueuing undefined values', () => {
      const q = new RandomQueue<number | undefined>({ seed: 1 })
      q.enqueue(undefined)
      expect(q.size()).toBe(1)
    })

    it('should handle enqueuing null values', () => {
      const q = new RandomQueue<number | null>({ seed: 1 })
      q.enqueue(null)
      expect(q.size()).toBe(1)
    })

    it('should handle enqueuing zero', () => {
      queue.enqueue(0)
      expect(queue.size()).toBe(1)
      expect(queue.contains(0)).toBe(true)
    })
  })

  describe('dequeue', () => {
    it('should return undefined from empty queue', () => {
      expect(queue.dequeue()).toBeUndefined()
    })

    it('should return the only element', () => {
      queue.enqueue(42)
      expect(queue.dequeue()).toBe(42)
      expect(queue.size()).toBe(0)
    })

    it('should remove an element from the queue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      expect(queue.size()).toBe(2)
    })

    it('should drain all elements with repeated dequeue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      const results: number[] = []
      while (!queue.isEmpty()) {
        results.push(queue.dequeue()!)
      }
      expect(results.length).toBe(3)
      expect(queue.isEmpty()).toBe(true)
    })

    it('should produce deterministic results with same seed', () => {
      const q1 = new RandomQueue<number>({ seed: 99 })
      const q2 = new RandomQueue<number>({ seed: 99 })
      for (let i = 0; i < 10; i++) {
        q1.enqueue(i)
        q2.enqueue(i)
      }
      const r1: number[] = []
      const r2: number[] = []
      while (!q1.isEmpty()) r1.push(q1.dequeue()!)
      while (!q2.isEmpty()) r2.push(q2.dequeue()!)
      expect(r1).toEqual(r2)
    })

    it('should produce different results with different seeds', () => {
      const q1 = new RandomQueue<number>({ seed: 1 })
      const q2 = new RandomQueue<number>({ seed: 2 })
      for (let i = 0; i < 20; i++) {
        q1.enqueue(i)
        q2.enqueue(i)
      }
      const r1: number[] = []
      const r2: number[] = []
      while (!q1.isEmpty()) r1.push(q1.dequeue()!)
      while (!q2.isEmpty()) r2.push(q2.dequeue()!)
      expect(r1).not.toEqual(r2)
    })

    it('should return all enqueued elements exactly once', () => {
      const elements = [10, 20, 30, 40, 50]
      for (const e of elements) queue.enqueue(e)
      const results: number[] = []
      while (!queue.isEmpty()) results.push(queue.dequeue()!)
      expect(results.sort()).toEqual(elements.sort())
    })

    it('should handle dequeue on single element queue repeatedly', () => {
      queue.enqueue(1)
      expect(queue.dequeue()).toBe(1)
      expect(queue.dequeue()).toBeUndefined()
      expect(queue.dequeue()).toBeUndefined()
    })
  })

  describe('peek', () => {
    it('should return undefined from empty queue', () => {
      expect(queue.peek()).toBeUndefined()
    })

    it('should return an element without removing it', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      const sizeBefore = queue.size()
      queue.peek()
      expect(queue.size()).toBe(sizeBefore)
    })

    it('should return a valid element from the queue', () => {
      queue.enqueue(10)
      queue.enqueue(20)
      queue.enqueue(30)
      const val = queue.peek()
      expect([10, 20, 30]).toContain(val)
    })

    it('should not modify the queue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      const arr1 = queue.toArray()
      queue.peek()
      const arr2 = queue.toArray()
      expect(arr1.sort()).toEqual(arr2.sort())
    })

    it('should be deterministic with same seed', () => {
      const q1 = new RandomQueue<number>({ seed: 7 })
      const q2 = new RandomQueue<number>({ seed: 7 })
      q1.enqueue(1)
      q1.enqueue(2)
      q2.enqueue(1)
      q2.enqueue(2)
      expect(q1.peek()).toBe(q2.peek())
    })
  })

  describe('sample', () => {
    it('should return empty array from empty queue', () => {
      expect(queue.sample(5)).toEqual([])
    })

    it('should return empty array when count is 0', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.sample(0)).toEqual([])
    })

    it('should return empty array when count is negative', () => {
      queue.enqueue(1)
      expect(queue.sample(-1)).toEqual([])
    })

    it('should return all elements when count exceeds size', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      const result = queue.sample(10)
      expect(result.sort()).toEqual([1, 2])
    })

    it('should return requested number of elements', () => {
      for (let i = 0; i < 10; i++) queue.enqueue(i)
      const result = queue.sample(5)
      expect(result.length).toBe(5)
    })

    it('should not modify the queue', () => {
      for (let i = 0; i < 5; i++) queue.enqueue(i)
      const sizeBefore = queue.size()
      queue.sample(3)
      expect(queue.size()).toBe(sizeBefore)
    })

    it('should return unique elements (no replacement)', () => {
      for (let i = 0; i < 10; i++) queue.enqueue(i)
      const result = queue.sample(5)
      const unique = new Set(result)
      expect(unique.size).toBe(5)
    })

    it('should only contain elements from the queue', () => {
      const elements = [10, 20, 30]
      for (const e of elements) queue.enqueue(e)
      const result = queue.sample(3)
      for (const r of result) {
        expect(elements).toContain(r)
      }
    })

    it('should handle sample of 1', () => {
      queue.enqueue(42)
      expect(queue.sample(1)).toEqual([42])
    })

    it('should handle sample of all elements', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      const result = queue.sample(3)
      expect(result.sort()).toEqual([1, 2, 3])
    })
  })

  describe('sampleWithReplacement', () => {
    it('should return empty array from empty queue', () => {
      expect(queue.sampleWithReplacement(5)).toEqual([])
    })

    it('should return empty array when count is 0', () => {
      queue.enqueue(1)
      expect(queue.sampleWithReplacement(0)).toEqual([])
    })

    it('should return requested number of samples', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      const result = queue.sampleWithReplacement(10)
      expect(result.length).toBe(10)
    })

    it('should only contain elements from the queue', () => {
      queue.enqueue(10)
      queue.enqueue(20)
      const result = queue.sampleWithReplacement(20)
      for (const r of result) {
        expect([10, 20]).toContain(r)
      }
    })

    it('should allow duplicates', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      const result = queue.sampleWithReplacement(100)
      const unique = new Set(result)
      expect(unique.size).toBeLessThanOrEqual(2)
    })

    it('should not modify the queue', () => {
      for (let i = 0; i < 5; i++) queue.enqueue(i)
      const sizeBefore = queue.size()
      queue.sampleWithReplacement(3)
      expect(queue.size()).toBe(sizeBefore)
    })

    it('should handle single element queue', () => {
      queue.enqueue(42)
      const result = queue.sampleWithReplacement(5)
      expect(result).toEqual([42, 42, 42, 42, 42])
    })
  })

  describe('shuffle', () => {
    it('should return empty array from empty queue', () => {
      expect(queue.shuffle()).toEqual([])
    })

    it('should return single element array for single element queue', () => {
      queue.enqueue(1)
      expect(queue.shuffle()).toEqual([1])
    })

    it('should return all elements', () => {
      const elements = [1, 2, 3, 4, 5]
      for (const e of elements) queue.enqueue(e)
      const result = queue.shuffle()
      expect(result.sort()).toEqual(elements.sort())
    })

    it('should not modify the queue', () => {
      for (let i = 0; i < 5; i++) queue.enqueue(i)
      const sizeBefore = queue.size()
      queue.shuffle()
      expect(queue.size()).toBe(sizeBefore)
    })

    it('should be deterministic with same seed', () => {
      const q1 = new RandomQueue<number>({ seed: 55 })
      const q2 = new RandomQueue<number>({ seed: 55 })
      for (let i = 0; i < 10; i++) {
        q1.enqueue(i)
        q2.enqueue(i)
      }
      expect(q1.shuffle()).toEqual(q2.shuffle())
    })

    it('should return a new array', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      const shuffled = queue.shuffle()
      shuffled.push(999)
      expect(queue.size()).toBe(2)
    })
  })

  describe('contains', () => {
    it('should return false for empty queue', () => {
      expect(queue.contains(1)).toBe(false)
    })

    it('should return true when element exists', () => {
      queue.enqueue(42)
      expect(queue.contains(42)).toBe(true)
    })

    it('should return false when element does not exist', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.contains(99)).toBe(false)
    })

    it('should find elements at any position', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.contains(1)).toBe(true)
      expect(queue.contains(2)).toBe(true)
      expect(queue.contains(3)).toBe(true)
    })

    it('should work with reference types', () => {
      const obj = { x: 1 }
      const q = new RandomQueue<{ x: number }>({ seed: 1 })
      q.enqueue(obj)
      expect(q.contains(obj)).toBe(true)
    })

    it('should not find objects by value equality', () => {
      const q = new RandomQueue<{ x: number }>({ seed: 1 })
      q.enqueue({ x: 1 })
      expect(q.contains({ x: 1 })).toBe(false)
    })

    it('should find strings', () => {
      const q = new RandomQueue<string>({ seed: 1 })
      q.enqueue('hello')
      q.enqueue('world')
      expect(q.contains('hello')).toBe(true)
      expect(q.contains('world')).toBe(true)
      expect(q.contains('missing')).toBe(false)
    })
  })

  describe('remove', () => {
    it('should return 0 when nothing is removed', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.remove((x) => x > 10)).toBe(0)
      expect(queue.size()).toBe(2)
    })

    it('should remove a single matching element', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      const removed = queue.remove((x) => x === 2)
      expect(removed).toBe(1)
      expect(queue.size()).toBe(2)
      expect(queue.contains(2)).toBe(false)
    })

    it('should remove multiple matching elements', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.enqueue(2)
      const removed = queue.remove((x) => x === 2)
      expect(removed).toBe(3)
      expect(queue.size()).toBe(2)
      expect(queue.contains(2)).toBe(false)
    })

    it('should remove all elements if all match', () => {
      queue.enqueue(5)
      queue.enqueue(5)
      queue.enqueue(5)
      const removed = queue.remove((x) => x === 5)
      expect(removed).toBe(3)
      expect(queue.isEmpty()).toBe(true)
    })

    it('should return 0 for empty queue', () => {
      expect(queue.remove(() => true)).toBe(0)
    })

    it('should work with complex predicates', () => {
      for (let i = 0; i < 10; i++) queue.enqueue(i)
      const removed = queue.remove((x) => x % 2 === 0)
      expect(removed).toBe(5)
      expect(queue.size()).toBe(5)
      const remaining = queue.toArray()
      for (const r of remaining) {
        expect(r % 2).toBe(1)
      }
    })
  })

  describe('size', () => {
    it('should return 0 for empty queue', () => {
      expect(queue.size()).toBe(0)
    })

    it('should reflect number of enqueued elements', () => {
      queue.enqueue(1)
      expect(queue.size()).toBe(1)
      queue.enqueue(2)
      expect(queue.size()).toBe(2)
      queue.enqueue(3)
      expect(queue.size()).toBe(3)
    })

    it('should decrease after dequeue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      expect(queue.size()).toBe(1)
    })

    it('should be 0 after clear', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.clear()
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

    it('should return true after dequeuing all elements', () => {
      queue.enqueue(1)
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

  describe('clear', () => {
    it('should clear an empty queue without error', () => {
      queue.clear()
      expect(queue.isEmpty()).toBe(true)
    })

    it('should remove all elements', () => {
      for (let i = 0; i < 10; i++) queue.enqueue(i)
      queue.clear()
      expect(queue.size()).toBe(0)
      expect(queue.isEmpty()).toBe(true)
    })

    it('should allow enqueue after clear', () => {
      queue.enqueue(1)
      queue.clear()
      queue.enqueue(2)
      expect(queue.size()).toBe(1)
      expect(queue.contains(2)).toBe(true)
    })

    it('should allow dequeue after clear returning undefined', () => {
      queue.enqueue(1)
      queue.clear()
      expect(queue.dequeue()).toBeUndefined()
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty queue', () => {
      expect(queue.toArray()).toEqual([])
    })

    it('should return all elements', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.toArray().sort()).toEqual([1, 2, 3])
    })

    it('should return a new array (not a reference)', () => {
      queue.enqueue(1)
      const arr = queue.toArray()
      arr.push(999)
      expect(queue.size()).toBe(1)
    })

    it('should preserve elements after dequeue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      expect(queue.toArray().length).toBe(2)
    })
  })

  describe('clone', () => {
    it('should produce an independent copy', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      const cloned = queue.clone()
      expect(cloned.size()).toBe(queue.size())
      cloned.enqueue(3)
      expect(queue.size()).toBe(2)
      expect(cloned.size()).toBe(3)
    })

    it('should have the same elements', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      const cloned = queue.clone()
      expect(cloned.toArray().sort()).toEqual(queue.toArray().sort())
    })

    it('should not affect original when dequeued from clone', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      const cloned = queue.clone()
      cloned.dequeue()
      expect(queue.size()).toBe(2)
      expect(cloned.size()).toBe(1)
    })

    it('should clone an empty queue', () => {
      const cloned = queue.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should preserve the seed', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      const cloned = queue.clone()
      expect(cloned.dequeue()).toEqual(queue.dequeue())
    })

    it('should return a RandomQueue instance', () => {
      queue.enqueue(1)
      const cloned = queue.clone()
      expect(cloned).toBeInstanceOf(RandomQueue)
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty queue', () => {
      let calls = 0
      queue.forEach(() => { calls++ })
      expect(calls).toBe(0)
    })

    it('should call callback for each element', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      let calls = 0
      queue.forEach(() => { calls++ })
      expect(calls).toBe(3)
    })

    it('should provide correct indices', () => {
      queue.enqueue(10)
      queue.enqueue(20)
      queue.enqueue(30)
      const indices: number[] = []
      queue.forEach((_item, idx) => { indices.push(idx) })
      expect(indices).toEqual([0, 1, 2])
    })

    it('should provide correct elements', () => {
      queue.enqueue(10)
      queue.enqueue(20)
      queue.enqueue(30)
      const items: number[] = []
      queue.forEach((item) => { items.push(item) })
      expect(items.sort()).toEqual([10, 20, 30])
    })

    it('should iterate in storage order', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      const items: number[] = []
      queue.forEach((item) => { items.push(item) })
      expect(items).toEqual([1, 2, 3])
    })
  })

  describe('drain', () => {
    it('should return empty array for empty queue', () => {
      expect(queue.drain()).toEqual([])
    })

    it('should return all elements and empty the queue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      const drained = queue.drain()
      expect(drained.sort()).toEqual([1, 2, 3])
      expect(queue.isEmpty()).toBe(true)
      expect(queue.size()).toBe(0)
    })

    it('should allow reuse after drain', () => {
      queue.enqueue(1)
      queue.drain()
      queue.enqueue(2)
      expect(queue.size()).toBe(1)
      expect(queue.contains(2)).toBe(true)
    })

    it('should not affect subsequent drain calls', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.drain()
      expect(queue.drain()).toEqual([])
    })
  })

  describe('Symbol.iterator', () => {
    it('should produce no elements for empty queue', () => {
      const result = [...queue]
      expect(result).toEqual([])
    })

    it('should produce all elements', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      const result = [...queue]
      expect(result.sort()).toEqual([1, 2, 3])
    })

    it('should not modify the queue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      const sizeBefore = queue.size()
      const _ = [...queue]
      expect(queue.size()).toBe(sizeBefore)
    })

    it('should be usable in for...of', () => {
      queue.enqueue(10)
      queue.enqueue(20)
      const items: number[] = []
      for (const item of queue) {
        items.push(item)
      }
      expect(items.length).toBe(2)
      expect(items.sort()).toEqual([10, 20])
    })

    it('should be deterministic with same seed', () => {
      const q1 = new RandomQueue<number>({ seed: 88 })
      const q2 = new RandomQueue<number>({ seed: 88 })
      for (let i = 0; i < 5; i++) {
        q1.enqueue(i)
        q2.enqueue(i)
      }
      expect([...q1]).toEqual([...q2])
    })
  })

  describe('fromArray', () => {
    it('should create a queue from an array', () => {
      const q = RandomQueue.fromArray([1, 2, 3], { seed: 42 })
      expect(q.size()).toBe(3)
    })

    it('should create a queue from an empty array', () => {
      const q = RandomQueue.fromArray([], { seed: 42 })
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('should preserve all elements', () => {
      const arr = [10, 20, 30, 40, 50]
      const q = RandomQueue.fromArray(arr, { seed: 1 })
      expect(q.toArray().sort()).toEqual(arr.sort())
    })

    it('should accept options', () => {
      const q = RandomQueue.fromArray([1, 2, 3], { seed: 999 })
      expect(q).toBeInstanceOf(RandomQueue)
      expect(q.size()).toBe(3)
    })

    it('should work without options', () => {
      const q = RandomQueue.fromArray([1, 2, 3])
      expect(q.size()).toBe(3)
    })

    it('should be usable after creation', () => {
      const q = RandomQueue.fromArray([1, 2, 3], { seed: 1 })
      q.enqueue(4)
      expect(q.size()).toBe(4)
      const val = q.dequeue()
      expect(val).toBeDefined()
    })

    it('should work with string arrays', () => {
      const q = RandomQueue.fromArray(['a', 'b', 'c'], { seed: 1 })
      expect(q.size()).toBe(3)
      expect(q.contains('a')).toBe(true)
    })

    it('should not share state with other fromArray calls', () => {
      const q1 = RandomQueue.fromArray([1, 2], { seed: 1 })
      const q2 = RandomQueue.fromArray([3, 4], { seed: 1 })
      q1.dequeue()
      expect(q2.size()).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('should handle large number of elements', () => {
      for (let i = 0; i < 1000; i++) queue.enqueue(i)
      expect(queue.size()).toBe(1000)
      const results: number[] = []
      while (!queue.isEmpty()) results.push(queue.dequeue()!)
      expect(results.length).toBe(1000)
      const sorted = [...results].sort((a, b) => a - b)
      for (let i = 0; i < 1000; i++) {
        expect(sorted[i]).toBe(i)
      }
    })

    it('should handle enqueue after partial dequeue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      queue.enqueue(3)
      expect(queue.size()).toBe(2)
    })

    it('should handle mixed operations', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      const removed = queue.dequeue()!
      expect([1, 2, 3]).toContain(removed)
      queue.enqueue(4)
      expect(queue.size()).toBe(3)
      const removedCount = queue.remove((x) => x % 2 === 0)
      expect(removedCount).toBeGreaterThanOrEqual(0)
      expect(queue.size()).toBe(3 - removedCount)
    })

    it('should handle objects as elements', () => {
      const q = new RandomQueue<{ id: number; name: string }>({ seed: 1 })
      q.enqueue({ id: 1, name: 'a' })
      q.enqueue({ id: 2, name: 'b' })
      expect(q.size()).toBe(2)
      const item = q.dequeue()
      expect(item).toBeDefined()
      expect(item!.id).toBeGreaterThanOrEqual(1)
    })

    it('should handle boolean values', () => {
      const q = new RandomQueue<boolean>({ seed: 1 })
      q.enqueue(true)
      q.enqueue(false)
      expect(q.size()).toBe(2)
    })

    it('should handle NaN values', () => {
      queue.enqueue(NaN)
      expect(queue.size()).toBe(1)
    })

    it('should handle string elements', () => {
      const q = new RandomQueue<string>({ seed: 1 })
      q.enqueue('hello')
      q.enqueue('world')
      const val = q.dequeue()
      expect(['hello', 'world']).toContain(val)
    })

    it('should produce uniform-ish distribution over many dequeues', () => {
      const q = new RandomQueue<number>({ seed: 123 })
      const counts = { 0: 0, 1: 0, 2: 0 }
      for (let trial = 0; trial < 300; trial++) {
        q.clear()
        q.enqueue(0)
        q.enqueue(1)
        q.enqueue(2)
        const first = q.dequeue()!
        counts[first as 0 | 1 | 2]++
      }
      expect(counts[0]).toBeGreaterThan(50)
      expect(counts[1]).toBeGreaterThan(50)
      expect(counts[2]).toBeGreaterThan(50)
    })

    it('should maintain data integrity after many operations', () => {
      const added: number[] = []
      for (let i = 0; i < 50; i++) {
        queue.enqueue(i)
        added.push(i)
      }
      const removed: number[] = []
      for (let i = 0; i < 25; i++) {
        const val = queue.dequeue()!
        removed.push(val)
      }
      for (let i = 50; i < 75; i++) {
        queue.enqueue(i)
        added.push(i)
      }
      while (!queue.isEmpty()) removed.push(queue.dequeue()!)
      expect(removed.sort((a, b) => a - b)).toEqual(added.sort((a, b) => a - b))
    })
  })

  describe('DEFAULT_RANDOM_QUEUE_OPTIONS', () => {
    it('should have seed property', () => {
      expect(DEFAULT_RANDOM_QUEUE_OPTIONS.seed).toBeDefined()
      expect(typeof DEFAULT_RANDOM_QUEUE_OPTIONS.seed).toBe('number')
    })
  })

  describe('type safety', () => {
    it('should work with generic type parameter', () => {
      const q = new RandomQueue<string>({ seed: 1 })
      q.enqueue('hello')
      const val = q.dequeue()
      expect(typeof val === 'string' || val === undefined).toBe(true)
    })

    it('should work with union types', () => {
      const q = new RandomQueue<number | string>({ seed: 1 })
      q.enqueue(1)
      q.enqueue('two')
      expect(q.size()).toBe(2)
    })

    it('should work with array elements', () => {
      const q = new RandomQueue<number[]>({ seed: 1 })
      q.enqueue([1, 2])
      q.enqueue([3, 4])
      const val = q.dequeue()
      expect(Array.isArray(val)).toBe(true)
    })
  })

  describe('remove edge cases', () => {
    it('should handle removing from single-element queue', () => {
      queue.enqueue(1)
      expect(queue.remove((x) => x === 1)).toBe(1)
      expect(queue.isEmpty()).toBe(true)
    })

    it('should handle remove where nothing matches', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.remove((x) => x === 99)).toBe(0)
      expect(queue.size()).toBe(2)
    })

    it('should handle remove on queue with duplicates at boundaries', () => {
      queue.enqueue(1)
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(2)
      queue.enqueue(1)
      expect(queue.remove((x) => x === 1)).toBe(3)
      expect(queue.size()).toBe(2)
    })

    it('should preserve remaining elements after remove', () => {
      for (let i = 0; i < 10; i++) queue.enqueue(i)
      queue.remove((x) => x < 5)
      const remaining = queue.toArray()
      for (const r of remaining) {
        expect(r).toBeGreaterThanOrEqual(5)
      }
    })
  })

  describe('sample edge cases', () => {
    it('should return all elements when count equals size', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      const result = queue.sample(3)
      expect(result.sort()).toEqual([1, 2, 3])
    })

    it('should handle large count on small queue', () => {
      queue.enqueue(1)
      const result = queue.sample(1000)
      expect(result).toEqual([1])
    })

    it('should be deterministic with same seed for sample', () => {
      const q1 = new RandomQueue<number>({ seed: 77 })
      const q2 = new RandomQueue<number>({ seed: 77 })
      for (let i = 0; i < 20; i++) {
        q1.enqueue(i)
        q2.enqueue(i)
      }
      expect(q1.sample(10)).toEqual(q2.sample(10))
    })
  })

  describe('sampleWithReplacement edge cases', () => {
    it('should be deterministic with same seed', () => {
      const q1 = new RandomQueue<number>({ seed: 44 })
      const q2 = new RandomQueue<number>({ seed: 44 })
      q1.enqueue(1)
      q1.enqueue(2)
      q2.enqueue(1)
      q2.enqueue(2)
      expect(q1.sampleWithReplacement(10)).toEqual(q2.sampleWithReplacement(10))
    })

    it('should handle large count', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      const result = queue.sampleWithReplacement(1000)
      expect(result.length).toBe(1000)
    })
  })

  describe('interoperability', () => {
    it('clone then dequeue should be independent', () => {
      for (let i = 0; i < 5; i++) queue.enqueue(i)
      const cloned = queue.clone()
      const fromOriginal: number[] = []
      const fromClone: number[] = []
      while (!queue.isEmpty()) fromOriginal.push(queue.dequeue()!)
      while (!cloned.isEmpty()) fromClone.push(cloned.dequeue()!)
      expect(fromOriginal.sort()).toEqual(fromClone.sort())
    })

    it('fromArray + drain should recover original elements', () => {
      const original = [5, 4, 3, 2, 1]
      const q = RandomQueue.fromArray(original, { seed: 42 })
      const drained = q.drain()
      expect(drained.sort()).toEqual(original.sort())
    })

    it('toArray + fromArray round trip', () => {
      const original = [10, 20, 30]
      const q1 = RandomQueue.fromArray(original, { seed: 1 })
      const arr = q1.toArray()
      const q2 = RandomQueue.fromArray(arr, { seed: 1 })
      expect(q2.toArray().sort()).toEqual(original.sort())
    })

    it('forEach + fromArray preserves elements', () => {
      const q = RandomQueue.fromArray([1, 2, 3], { seed: 1 })
      const collected: number[] = []
      q.forEach((item) => collected.push(item))
      const q2 = RandomQueue.fromArray(collected, { seed: 1 })
      expect(q2.toArray().sort()).toEqual([1, 2, 3])
    })

    it('iterator spread into new queue', () => {
      for (let i = 0; i < 5; i++) queue.enqueue(i)
      const iterated = [...queue]
      const q2 = RandomQueue.fromArray(iterated, { seed: 1 })
      expect(q2.size()).toBe(5)
    })
  })
})
