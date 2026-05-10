import { describe, it, expect, beforeEach } from 'vitest'
import { AmortizedPriorityQueue } from '../../src/core/amortized-priority-queue/amortized-priority-queue.js'
import type { AmortizedPriorityQueueOptions } from '../../src/core/amortized-priority-queue/types.js'

describe('AmortizedPriorityQueue', () => {
  describe('constructor', () => {
    it('creates with default options', () => {
      const q = new AmortizedPriorityQueue<number>()
      expect(q.size).toBe(0)
      expect(q.isEmpty).toBe(true)
    })

    it('creates with default buffer size of 64', () => {
      const q = new AmortizedPriorityQueue<number>()
      for (let i = 0; i < 63; i++) q.enqueue(i)
      expect(q.bufferSize).toBe(63)
      expect(q.heapSize).toBe(0)
    })

    it('creates with custom buffer size', () => {
      const q = new AmortizedPriorityQueue<number>({ bufferSize: 4 })
      for (let i = 0; i < 3; i++) q.enqueue(i)
      expect(q.bufferSize).toBe(3)
      expect(q.heapSize).toBe(0)
    })

    it('creates with custom comparator', () => {
      const opts: AmortizedPriorityQueueOptions<number> = { comparator: (a, b) => b - a }
      const q = new AmortizedPriorityQueue<number>(opts)
      q.enqueue(1)
      q.enqueue(5)
      q.enqueue(3)
      q.flush()
      expect(q.peek()).toBe(5)
    })

    it('creates with both custom comparator and buffer size', () => {
      const opts: AmortizedPriorityQueueOptions<number> = { comparator: (a, b) => b - a, bufferSize: 2 }
      const q = new AmortizedPriorityQueue<number>(opts)
      q.enqueue(1)
      q.enqueue(5)
      q.enqueue(3)
      expect(q.heapSize).toBe(2)
      expect(q.bufferSize).toBe(1)
    })

    it('creates with empty options', () => {
      const q = new AmortizedPriorityQueue<number>({})
      expect(q.size).toBe(0)
    })

    it('works with string type', () => {
      const q = new AmortizedPriorityQueue<string>()
      q.enqueue('c')
      q.enqueue('a')
      q.enqueue('b')
      q.flush()
      expect(q.peek()).toBe('a')
    })

    it('works with object type using custom comparator', () => {
      interface Item { priority: number }
      const q = new AmortizedPriorityQueue<Item>({ comparator: (a, b) => a.priority - b.priority })
      q.enqueue({ priority: 3 })
      q.enqueue({ priority: 1 })
      q.enqueue({ priority: 2 })
      q.flush()
      expect(q.peek()?.priority).toBe(1)
    })
  })

  describe('enqueue and dequeue ordering', () => {
    it('enqueues and dequeues in sorted order', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(3)
      q.enqueue(1)
      q.enqueue(2)
      q.flush()
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
    })

    it('dequeues in order without explicit flush', () => {
      const q = new AmortizedPriorityQueue<number>({ bufferSize: 10 })
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(1)
      q.enqueue(4)
      q.enqueue(2)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
      expect(q.dequeue()).toBe(4)
      expect(q.dequeue()).toBe(5)
    })

    it('handles reverse order insertion', () => {
      const q = new AmortizedPriorityQueue<number>()
      for (let i = 10; i >= 1; i--) q.enqueue(i)
      q.flush()
      for (let i = 1; i <= 10; i++) {
        expect(q.dequeue()).toBe(i)
      }
    })

    it('handles already sorted insertion', () => {
      const q = new AmortizedPriorityQueue<number>()
      for (let i = 1; i <= 10; i++) q.enqueue(i)
      q.flush()
      for (let i = 1; i <= 10; i++) {
        expect(q.dequeue()).toBe(i)
      }
    })

    it('handles duplicate values', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(1)
      q.enqueue(1)
      q.enqueue(1)
      q.flush()
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBeUndefined()
    })

    it('handles negative numbers', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(-3)
      q.enqueue(-1)
      q.enqueue(-2)
      q.flush()
      expect(q.dequeue()).toBe(-3)
      expect(q.dequeue()).toBe(-2)
      expect(q.dequeue()).toBe(-1)
    })

    it('handles mixed positive and negative numbers', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(3)
      q.enqueue(-1)
      q.enqueue(0)
      q.enqueue(-2)
      q.enqueue(2)
      q.flush()
      expect(q.dequeue()).toBe(-2)
      expect(q.dequeue()).toBe(-1)
      expect(q.dequeue()).toBe(0)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
    })

    it('handles string ordering', () => {
      const q = new AmortizedPriorityQueue<string>()
      q.enqueue('cherry')
      q.enqueue('apple')
      q.enqueue('banana')
      q.flush()
      expect(q.dequeue()).toBe('apple')
      expect(q.dequeue()).toBe('banana')
      expect(q.dequeue()).toBe('cherry')
    })

    it('dequeues undefined from empty queue', () => {
      const q = new AmortizedPriorityQueue<number>()
      expect(q.dequeue()).toBeUndefined()
    })

    it('dequeues undefined after draining all elements', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(1)
      q.dequeue()
      expect(q.dequeue()).toBeUndefined()
    })
  })

  describe('buffer auto-flush when full', () => {
    it('auto-flushes when buffer reaches bufferSize', () => {
      const q = new AmortizedPriorityQueue<number>({ bufferSize: 3 })
      expect(q.heapSize).toBe(0)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.heapSize).toBe(0)
      expect(q.bufferSize).toBe(2)
      q.enqueue(3)
      expect(q.heapSize).toBe(3)
      expect(q.bufferSize).toBe(0)
    })

    it('auto-flushes with default buffer size', () => {
      const q = new AmortizedPriorityQueue<number>()
      for (let i = 0; i < 64; i++) q.enqueue(i)
      expect(q.heapSize).toBe(64)
      expect(q.bufferSize).toBe(0)
    })

    it('auto-flushes and maintains heap property', () => {
      const q = new AmortizedPriorityQueue<number>({ bufferSize: 4 })
      q.enqueue(10)
      q.enqueue(3)
      q.enqueue(7)
      q.enqueue(1)
      expect(q.heapSize).toBe(4)
      expect(q.bufferSize).toBe(0)
      expect(q.peek()).toBe(1)
    })

    it('multiple auto-flushes accumulate in heap', () => {
      const q = new AmortizedPriorityQueue<number>({ bufferSize: 3 })
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(1)
      expect(q.heapSize).toBe(3)
      q.enqueue(4)
      q.enqueue(2)
      q.enqueue(6)
      expect(q.heapSize).toBe(6)
      expect(q.bufferSize).toBe(0)
    })

    it('auto-flush with bufferSize 1', () => {
      const q = new AmortizedPriorityQueue<number>({ bufferSize: 1 })
      q.enqueue(5)
      expect(q.heapSize).toBe(1)
      expect(q.bufferSize).toBe(0)
      q.enqueue(3)
      expect(q.heapSize).toBe(2)
      expect(q.bufferSize).toBe(0)
    })

    it('buffer remains below threshold', () => {
      const q = new AmortizedPriorityQueue<number>({ bufferSize: 5 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.bufferSize).toBe(4)
      expect(q.heapSize).toBe(0)
    })
  })

  describe('custom comparator', () => {
    it('max-heap via comparator', () => {
      const q = new AmortizedPriorityQueue<number>({ comparator: (a, b) => b - a })
      q.enqueue(1)
      q.enqueue(5)
      q.enqueue(3)
      q.flush()
      expect(q.dequeue()).toBe(5)
      expect(q.dequeue()).toBe(3)
      expect(q.dequeue()).toBe(1)
    })

    it('sorts objects by property', () => {
      interface Task { name: string; priority: number }
      const q = new AmortizedPriorityQueue<Task>({ comparator: (a, b) => a.priority - b.priority })
      q.enqueue({ name: 'low', priority: 3 })
      q.enqueue({ name: 'high', priority: 1 })
      q.enqueue({ name: 'mid', priority: 2 })
      q.flush()
      expect(q.dequeue()?.name).toBe('high')
      expect(q.dequeue()?.name).toBe('mid')
      expect(q.dequeue()?.name).toBe('low')
    })

    it('sorts strings by length', () => {
      const q = new AmortizedPriorityQueue<string>({ comparator: (a, b) => a.length - b.length })
      q.enqueue('aaa')
      q.enqueue('bb')
      q.enqueue('cccc')
      q.flush()
      expect(q.dequeue()).toBe('bb')
      expect(q.dequeue()).toBe('aaa')
      expect(q.dequeue()).toBe('cccc')
    })

    it('custom comparator works with buffer operations', () => {
      const q = new AmortizedPriorityQueue<number>({ comparator: (a, b) => b - a, bufferSize: 2 })
      q.enqueue(1)
      q.enqueue(5)
      q.enqueue(3)
      expect(q.peek()).toBe(5)
    })

    it('absolute value comparator', () => {
      const q = new AmortizedPriorityQueue<number>({ comparator: (a, b) => Math.abs(a) - Math.abs(b) })
      q.enqueue(-5)
      q.enqueue(2)
      q.enqueue(-1)
      q.enqueue(4)
      q.flush()
      expect(q.dequeue()).toBe(-1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(4)
      expect(q.dequeue()).toBe(-5)
    })
  })

  describe('size and isEmpty', () => {
    it('size is 0 initially', () => {
      const q = new AmortizedPriorityQueue<number>()
      expect(q.size).toBe(0)
    })

    it('isEmpty is true initially', () => {
      const q = new AmortizedPriorityQueue<number>()
      expect(q.isEmpty).toBe(true)
    })

    it('size increases with enqueue', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(1)
      expect(q.size).toBe(1)
      q.enqueue(2)
      expect(q.size).toBe(2)
    })

    it('size decreases with dequeue', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.size).toBe(1)
    })

    it('isEmpty becomes false after enqueue', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(1)
      expect(q.isEmpty).toBe(false)
    })

    it('isEmpty becomes true after removing all elements', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      q.dequeue()
      expect(q.isEmpty).toBe(true)
    })

    it('size accounts for both heap and buffer', () => {
      const q = new AmortizedPriorityQueue<number>({ bufferSize: 10 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.size).toBe(3)
      expect(q.heapSize + q.bufferSize).toBe(3)
    })

    it('size is correct after flush', () => {
      const q = new AmortizedPriorityQueue<number>({ bufferSize: 10 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.flush()
      expect(q.size).toBe(3)
      expect(q.heapSize).toBe(3)
      expect(q.bufferSize).toBe(0)
    })

    it('size is correct after clear', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      expect(q.size).toBe(0)
      expect(q.isEmpty).toBe(true)
    })
  })

  describe('peek', () => {
    it('returns undefined for empty queue', () => {
      const q = new AmortizedPriorityQueue<number>()
      expect(q.peek()).toBeUndefined()
    })

    it('returns the minimum element', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(1)
      q.enqueue(4)
      q.flush()
      expect(q.peek()).toBe(1)
    })

    it('does not remove the element', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(1)
      q.flush()
      expect(q.peek()).toBe(1)
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(1)
    })

    it('peeks from buffer only', () => {
      const q = new AmortizedPriorityQueue<number>({ bufferSize: 10 })
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(1)
      expect(q.peek()).toBe(1)
    })

    it('peeks correctly when buffer has smaller element', () => {
      const q = new AmortizedPriorityQueue<number>({ bufferSize: 10 })
      q.enqueue(5)
      q.enqueue(3)
      q.flush()
      q.enqueue(1)
      expect(q.heapSize).toBe(2)
      expect(q.bufferSize).toBe(1)
      expect(q.peek()).toBe(1)
    })

    it('peeks correctly when heap has smaller element', () => {
      const q = new AmortizedPriorityQueue<number>({ bufferSize: 10 })
      q.enqueue(1)
      q.enqueue(2)
      q.flush()
      q.enqueue(5)
      expect(q.peek()).toBe(1)
    })

    it('peek after dequeue returns next element', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.flush()
      q.dequeue()
      expect(q.peek()).toBe(2)
    })

    it('peek returns undefined after draining all', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(1)
      q.dequeue()
      expect(q.peek()).toBeUndefined()
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty queue', () => {
      const q = new AmortizedPriorityQueue<number>()
      expect(q.toArray()).toEqual([])
    })

    it('returns sorted array', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(3)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('returns sorted array from heap only', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(3)
      q.enqueue(1)
      q.enqueue(2)
      q.flush()
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('returns sorted array from buffer only', () => {
      const q = new AmortizedPriorityQueue<number>({ bufferSize: 10 })
      q.enqueue(5)
      q.enqueue(2)
      q.enqueue(4)
      expect(q.toArray()).toEqual([2, 4, 5])
    })

    it('does not modify the queue', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(3)
      q.enqueue(1)
      q.enqueue(2)
      q.toArray()
      expect(q.size).toBe(3)
    })

    it('returns a new array each time', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      const a = q.toArray()
      const b = q.toArray()
      expect(a).toEqual(b)
      expect(a).not.toBe(b)
    })

    it('works with custom comparator', () => {
      const q = new AmortizedPriorityQueue<number>({ comparator: (a, b) => b - a })
      q.enqueue(1)
      q.enqueue(3)
      q.enqueue(2)
      expect(q.toArray()).toEqual([3, 2, 1])
    })
  })

  describe('contains', () => {
    it('returns false for empty queue', () => {
      const q = new AmortizedPriorityQueue<number>()
      expect(q.contains(1)).toBe(false)
    })

    it('returns true for element in heap', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.flush()
      expect(q.contains(2)).toBe(true)
    })

    it('returns true for element in buffer', () => {
      const q = new AmortizedPriorityQueue<number>({ bufferSize: 10 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.contains(2)).toBe(true)
    })

    it('returns false for missing element', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.flush()
      expect(q.contains(4)).toBe(false)
    })

    it('uses reference equality for objects', () => {
      const q = new AmortizedPriorityQueue<{ v: number }>()
      const obj = { v: 1 }
      q.enqueue(obj)
      q.flush()
      expect(q.contains(obj)).toBe(true)
      expect(q.contains({ v: 1 })).toBe(false)
    })

    it('finds element after dequeue', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.flush()
      q.dequeue()
      expect(q.contains(1)).toBe(false)
      expect(q.contains(2)).toBe(true)
    })
  })

  describe('remove', () => {
    it('returns false for empty queue', () => {
      const q = new AmortizedPriorityQueue<number>()
      expect(q.remove(1)).toBe(false)
    })

    it('removes element from heap', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.flush()
      expect(q.remove(2)).toBe(true)
      expect(q.size).toBe(2)
      expect(q.contains(2)).toBe(false)
    })

    it('removes element from buffer', () => {
      const q = new AmortizedPriorityQueue<number>({ bufferSize: 10 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.remove(2)).toBe(true)
      expect(q.size).toBe(2)
      expect(q.contains(2)).toBe(false)
    })

    it('returns false for missing element', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.flush()
      expect(q.remove(3)).toBe(false)
      expect(q.size).toBe(2)
    })

    it('maintains heap property after removal', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      q.flush()
      q.remove(1)
      expect(q.peek()).toBe(2)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
      expect(q.dequeue()).toBe(4)
      expect(q.dequeue()).toBe(5)
    })

    it('remove the minimum element', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.flush()
      expect(q.remove(1)).toBe(true)
      expect(q.peek()).toBe(2)
    })

    it('remove the last element', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.flush()
      expect(q.remove(3)).toBe(true)
      expect(q.toArray()).toEqual([1, 2])
    })

    it('remove all elements one by one', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.flush()
      expect(q.remove(2)).toBe(true)
      expect(q.remove(1)).toBe(true)
      expect(q.remove(3)).toBe(true)
      expect(q.isEmpty).toBe(true)
    })
  })

  describe('drain', () => {
    it('returns empty array for empty queue', () => {
      const q = new AmortizedPriorityQueue<number>()
      expect(q.drain()).toEqual([])
    })

    it('returns all elements sorted', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(3)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.drain()).toEqual([1, 2, 3])
    })

    it('empties the queue', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.drain()
      expect(q.isEmpty).toBe(true)
      expect(q.size).toBe(0)
    })

    it('drains from both heap and buffer', () => {
      const q = new AmortizedPriorityQueue<number>({ bufferSize: 10 })
      q.enqueue(1)
      q.enqueue(2)
      q.flush()
      q.enqueue(3)
      q.enqueue(0)
      expect(q.heapSize).toBe(2)
      expect(q.bufferSize).toBe(2)
      expect(q.drain()).toEqual([0, 1, 2, 3])
      expect(q.isEmpty).toBe(true)
    })

    it('drain after partial dequeue', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.flush()
      q.dequeue()
      expect(q.drain()).toEqual([2, 3, 4])
    })
  })

  describe('flush', () => {
    it('does nothing on empty queue', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.flush()
      expect(q.heapSize).toBe(0)
      expect(q.bufferSize).toBe(0)
    })

    it('merges buffer into heap', () => {
      const q = new AmortizedPriorityQueue<number>({ bufferSize: 10 })
      q.enqueue(3)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.bufferSize).toBe(3)
      expect(q.heapSize).toBe(0)
      q.flush()
      expect(q.bufferSize).toBe(0)
      expect(q.heapSize).toBe(3)
    })

    it('merge maintains correct ordering', () => {
      const q = new AmortizedPriorityQueue<number>({ bufferSize: 10 })
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(1)
      q.enqueue(4)
      q.enqueue(2)
      q.flush()
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
      expect(q.dequeue()).toBe(4)
      expect(q.dequeue()).toBe(5)
    })

    it('merge with existing heap', () => {
      const q = new AmortizedPriorityQueue<number>({ bufferSize: 3 })
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(1)
      expect(q.heapSize).toBe(3)
      q.enqueue(4)
      q.enqueue(2)
      expect(q.bufferSize).toBe(2)
      q.flush()
      expect(q.heapSize).toBe(5)
      expect(q.bufferSize).toBe(0)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
      expect(q.dequeue()).toBe(4)
      expect(q.dequeue()).toBe(5)
    })

    it('multiple flushes are idempotent', () => {
      const q = new AmortizedPriorityQueue<number>({ bufferSize: 10 })
      q.enqueue(1)
      q.enqueue(2)
      q.flush()
      q.flush()
      q.flush()
      expect(q.heapSize).toBe(2)
      expect(q.bufferSize).toBe(0)
    })

    it('flush after dequeue', () => {
      const q = new AmortizedPriorityQueue<number>({ bufferSize: 10 })
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(1)
      q.flush()
      q.enqueue(0)
      q.enqueue(4)
      q.dequeue()
      q.flush()
      expect(q.peek()).toBe(1)
    })
  })

  describe('bufferSize and heapSize tracking', () => {
    it('tracks bufferSize correctly', () => {
      const q = new AmortizedPriorityQueue<number>({ bufferSize: 10 })
      expect(q.bufferSize).toBe(0)
      q.enqueue(1)
      expect(q.bufferSize).toBe(1)
      q.enqueue(2)
      expect(q.bufferSize).toBe(2)
    })

    it('tracks heapSize correctly', () => {
      const q = new AmortizedPriorityQueue<number>({ bufferSize: 10 })
      expect(q.heapSize).toBe(0)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.flush()
      expect(q.heapSize).toBe(3)
    })

    it('heapSize decreases after dequeue', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.flush()
      expect(q.heapSize).toBe(2)
      q.dequeue()
      expect(q.heapSize).toBe(1)
    })

    it('both reset after clear', () => {
      const q = new AmortizedPriorityQueue<number>({ bufferSize: 10 })
      q.enqueue(1)
      q.enqueue(2)
      q.flush()
      q.enqueue(3)
      q.clear()
      expect(q.heapSize).toBe(0)
      expect(q.bufferSize).toBe(0)
    })

    it('size equals heapSize + bufferSize', () => {
      const q = new AmortizedPriorityQueue<number>({ bufferSize: 5 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.flush()
      q.enqueue(5)
      expect(q.size).toBe(q.heapSize + q.bufferSize)
    })
  })

  describe('merge two queues', () => {
    it('merges two queues', () => {
      const q1 = new AmortizedPriorityQueue<number>()
      q1.enqueue(1)
      q1.enqueue(3)
      q1.flush()
      const q2 = new AmortizedPriorityQueue<number>()
      q2.enqueue(2)
      q2.enqueue(4)
      q2.flush()
      q1.merge(q2)
      expect(q1.size).toBe(4)
      expect(q2.size).toBe(0)
      expect(q1.dequeue()).toBe(1)
      expect(q1.dequeue()).toBe(2)
      expect(q1.dequeue()).toBe(3)
      expect(q1.dequeue()).toBe(4)
    })

    it('merges empty into non-empty', () => {
      const q1 = new AmortizedPriorityQueue<number>()
      q1.enqueue(1)
      q1.enqueue(2)
      q1.flush()
      const q2 = new AmortizedPriorityQueue<number>()
      q1.merge(q2)
      expect(q1.size).toBe(2)
      expect(q2.size).toBe(0)
    })

    it('merges non-empty into empty', () => {
      const q1 = new AmortizedPriorityQueue<number>()
      const q2 = new AmortizedPriorityQueue<number>()
      q2.enqueue(1)
      q2.enqueue(2)
      q2.flush()
      q1.merge(q2)
      expect(q1.size).toBe(2)
      expect(q2.size).toBe(0)
    })

    it('merges two empty queues', () => {
      const q1 = new AmortizedPriorityQueue<number>()
      const q2 = new AmortizedPriorityQueue<number>()
      q1.merge(q2)
      expect(q1.size).toBe(0)
      expect(q2.size).toBe(0)
    })

    it('clears the merged queue', () => {
      const q1 = new AmortizedPriorityQueue<number>()
      const q2 = new AmortizedPriorityQueue<number>()
      q2.enqueue(1)
      q2.enqueue(2)
      q1.merge(q2)
      expect(q2.isEmpty).toBe(true)
    })

    it('merge with buffer elements', () => {
      const q1 = new AmortizedPriorityQueue<number>({ bufferSize: 10 })
      q1.enqueue(1)
      const q2 = new AmortizedPriorityQueue<number>({ bufferSize: 10 })
      q2.enqueue(2)
      q1.merge(q2)
      expect(q1.size).toBe(2)
      expect(q2.isEmpty).toBe(true)
      expect(q1.dequeue()).toBe(1)
      expect(q1.dequeue()).toBe(2)
    })

    it('merge queues with different comparators', () => {
      const q1 = new AmortizedPriorityQueue<number>()
      q1.enqueue(5)
      q1.enqueue(1)
      const q2 = new AmortizedPriorityQueue<number>()
      q2.enqueue(3)
      q2.enqueue(2)
      q1.merge(q2)
      expect(q1.size).toBe(4)
    })
  })

  describe('many enqueue then many dequeue (10000+)', () => {
    it('enqueues 10000 elements and dequeues in order', () => {
      const q = new AmortizedPriorityQueue<number>()
      for (let i = 10000; i >= 1; i--) q.enqueue(i)
      q.flush()
      for (let i = 1; i <= 10000; i++) {
        expect(q.dequeue()).toBe(i)
      }
      expect(q.isEmpty).toBe(true)
    })

    it('enqueues 10000 random elements and dequeues in order', () => {
      const q = new AmortizedPriorityQueue<number>()
      const values: number[] = []
      for (let i = 0; i < 10000; i++) {
        const v = Math.floor(Math.random() * 100000)
        values.push(v)
        q.enqueue(v)
      }
      q.flush()
      values.sort((a, b) => a - b)
      for (const v of values) {
        expect(q.dequeue()).toBe(v)
      }
    })

    it('handles 50000 elements', () => {
      const q = new AmortizedPriorityQueue<number>()
      for (let i = 50000; i >= 1; i--) q.enqueue(i)
      q.flush()
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.peek()).toBe(3)
    })

    it('large scale with small buffer', () => {
      const q = new AmortizedPriorityQueue<number>({ bufferSize: 4 })
      for (let i = 1000; i >= 1; i--) q.enqueue(i)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
    })
  })

  describe('interleaved operations', () => {
    it('interleaved enqueue and dequeue', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(1)
      q.flush()
      expect(q.dequeue()).toBe(1)
      q.enqueue(0)
      expect(q.dequeue()).toBe(0)
      expect(q.dequeue()).toBe(3)
      q.enqueue(2)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(5)
      expect(q.dequeue()).toBeUndefined()
    })

    it('interleaved with buffer auto-flush', () => {
      const q = new AmortizedPriorityQueue<number>({ bufferSize: 3 })
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(1)
      expect(q.heapSize).toBe(3)
      expect(q.dequeue()).toBe(1)
      q.enqueue(0)
      q.enqueue(4)
      expect(q.dequeue()).toBe(0)
      expect(q.dequeue()).toBe(3)
      q.enqueue(2)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(4)
      expect(q.dequeue()).toBe(5)
    })

    it('interleaved with peek', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(5)
      expect(q.peek()).toBe(5)
      q.enqueue(2)
      expect(q.peek()).toBe(2)
      q.enqueue(7)
      expect(q.peek()).toBe(2)
      q.flush()
      expect(q.peek()).toBe(2)
      expect(q.dequeue()).toBe(2)
      expect(q.peek()).toBe(5)
    })

    it('interleaved with remove', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(1)
      q.flush()
      q.remove(3)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(5)
      expect(q.isEmpty).toBe(true)
    })

    it('interleaved with contains', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(1)
      expect(q.contains(1)).toBe(true)
      q.enqueue(2)
      expect(q.contains(2)).toBe(true)
      q.dequeue()
      expect(q.contains(1)).toBe(false)
    })

    it('enqueue dequeue enqueue pattern', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(3)
      q.flush()
      expect(q.dequeue()).toBe(3)
      q.enqueue(1)
      q.enqueue(2)
      q.flush()
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
    })

    it('rapid enqueue dequeue cycles', () => {
      const q = new AmortizedPriorityQueue<number>({ bufferSize: 2 })
      for (let i = 0; i < 100; i++) {
        q.enqueue(i)
        q.flush()
        expect(q.dequeue()).toBe(i)
        expect(q.isEmpty).toBe(true)
      }
    })
  })

  describe('edge cases', () => {
    it('dequeue from empty queue returns undefined', () => {
      const q = new AmortizedPriorityQueue<number>()
      expect(q.dequeue()).toBeUndefined()
    })

    it('single element enqueue dequeue', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(42)
      expect(q.dequeue()).toBe(42)
      expect(q.dequeue()).toBeUndefined()
    })

    it('single element with flush', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(42)
      q.flush()
      expect(q.dequeue()).toBe(42)
    })

    it('buffer size 1', () => {
      const q = new AmortizedPriorityQueue<number>({ bufferSize: 1 })
      q.enqueue(1)
      expect(q.heapSize).toBe(1)
      expect(q.bufferSize).toBe(0)
      q.enqueue(2)
      expect(q.heapSize).toBe(2)
      expect(q.bufferSize).toBe(0)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
    })

    it('buffer size 1 with many elements', () => {
      const q = new AmortizedPriorityQueue<number>({ bufferSize: 1 })
      for (let i = 10; i >= 1; i--) q.enqueue(i)
      for (let i = 1; i <= 10; i++) {
        expect(q.dequeue()).toBe(i)
      }
    })

    it('clear then reuse', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      expect(q.isEmpty).toBe(true)
      q.enqueue(3)
      q.enqueue(4)
      q.flush()
      expect(q.dequeue()).toBe(3)
      expect(q.dequeue()).toBe(4)
    })

    it('dequeue all then enqueue again', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.flush()
      q.dequeue()
      q.dequeue()
      expect(q.isEmpty).toBe(true)
      q.enqueue(3)
      expect(q.dequeue()).toBe(3)
    })

    it('flush at various points', () => {
      const q = new AmortizedPriorityQueue<number>({ bufferSize: 10 })
      q.enqueue(5)
      q.flush()
      expect(q.heapSize).toBe(1)
      q.enqueue(3)
      q.enqueue(1)
      q.flush()
      expect(q.heapSize).toBe(3)
      q.enqueue(4)
      q.enqueue(2)
      q.flush()
      expect(q.heapSize).toBe(5)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
      expect(q.dequeue()).toBe(4)
      expect(q.dequeue()).toBe(5)
    })

    it('large buffer size', () => {
      const q = new AmortizedPriorityQueue<number>({ bufferSize: 1000 })
      for (let i = 100; i >= 1; i--) q.enqueue(i)
      expect(q.bufferSize).toBe(100)
      expect(q.heapSize).toBe(0)
      q.flush()
      expect(q.heapSize).toBe(100)
      expect(q.dequeue()).toBe(1)
    })

    it('enqueue zero', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(0)
      q.flush()
      expect(q.peek()).toBe(0)
      expect(q.dequeue()).toBe(0)
    })

    it('enqueue undefined-compatible values', () => {
      const q = new AmortizedPriorityQueue<number | undefined>()
      q.enqueue(1)
      q.enqueue(0)
      q.flush()
      expect(q.dequeue()).toBe(0)
      expect(q.dequeue()).toBe(1)
    })

    it('toArray on empty queue', () => {
      const q = new AmortizedPriorityQueue<number>()
      expect(q.toArray()).toEqual([])
    })

    it('remove from empty queue', () => {
      const q = new AmortizedPriorityQueue<number>()
      expect(q.remove(1)).toBe(false)
    })

    it('contains on empty queue', () => {
      const q = new AmortizedPriorityQueue<number>()
      expect(q.contains(1)).toBe(false)
    })

    it('peek on empty queue after clear', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(1)
      q.clear()
      expect(q.peek()).toBeUndefined()
    })

    it('dequeue after clear', () => {
      const q = new AmortizedPriorityQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      expect(q.dequeue()).toBeUndefined()
    })
  })
})
