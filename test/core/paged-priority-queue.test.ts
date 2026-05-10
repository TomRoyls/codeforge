import { describe, it, expect, beforeEach } from 'vitest'
import { PagedPriorityQueue } from '../../src/core/paged-priority-queue/paged-priority-queue.js'
import { DEFAULT_PAGE_SIZE, DEFAULT_COMPARATOR } from '../../src/core/paged-priority-queue/types.js'
import type { PagedPriorityQueueOptions, Page } from '../../src/core/paged-priority-queue/types.js'

describe('PagedPriorityQueue', () => {
  let pq: PagedPriorityQueue<number>

  beforeEach(() => {
    pq = new PagedPriorityQueue<number>()
  })

  describe('constructor', () => {
    it('should create with default options', () => {
      const q = new PagedPriorityQueue<number>()
      expect(q.isEmpty).toBe(true)
      expect(q.size).toBe(0)
    })

    it('should accept options object', () => {
      const q = new PagedPriorityQueue<number>({ pageSize: 16 })
      expect(q.isEmpty).toBe(true)
    })

    it('should accept custom comparator', () => {
      const q = new PagedPriorityQueue<number>({
        comparator: (a, b) => b - a,
      })
      expect(q.isEmpty).toBe(true)
    })

    it('should accept empty options', () => {
      const q = new PagedPriorityQueue<number>({})
      expect(q.isEmpty).toBe(true)
    })

    it('should accept both pageSize and comparator', () => {
      const q = new PagedPriorityQueue<number>({
        pageSize: 8,
        comparator: (a, b) => b - a,
      })
      expect(q.isEmpty).toBe(true)
    })

    it('should accept partial options with only pageSize', () => {
      const q = new PagedPriorityQueue<number>({ pageSize: 4 })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.dequeue()).toBe(1)
    })

    it('should accept partial options with only comparator', () => {
      const q = new PagedPriorityQueue<number>({
        comparator: (a, b) => b - a,
      })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.dequeue()).toBe(2)
    })

    it('should work with no arguments', () => {
      const q = new PagedPriorityQueue()
      expect(q.size).toBe(0)
    })
  })

  describe('DEFAULT_PAGE_SIZE', () => {
    it('should be 64', () => {
      expect(DEFAULT_PAGE_SIZE).toBe(64)
    })
  })

  describe('DEFAULT_COMPARATOR', () => {
    it('should return -1 when a < b', () => {
      expect(DEFAULT_COMPARATOR(1, 2)).toBe(-1)
    })

    it('should return 1 when a > b', () => {
      expect(DEFAULT_COMPARATOR(2, 1)).toBe(1)
    })

    it('should return 0 when a === b', () => {
      expect(DEFAULT_COMPARATOR(5, 5)).toBe(0)
    })

    it('should work with strings', () => {
      expect(DEFAULT_COMPARATOR('a', 'b')).toBe(-1)
    })
  })

  describe('Page interface', () => {
    it('should have elements and size', () => {
      const page: Page<number> = { elements: [1, 2, 3], size: 3 }
      expect(page.elements).toHaveLength(3)
      expect(page.size).toBe(3)
    })
  })

  describe('PagedPriorityQueueOptions interface', () => {
    it('should accept pageSize', () => {
      const opts: PagedPriorityQueueOptions<number> = { pageSize: 32 }
      expect(opts.pageSize).toBe(32)
    })

    it('should accept comparator', () => {
      const opts: PagedPriorityQueueOptions<number> = {
        comparator: (a, b) => a - b,
      }
      expect(typeof opts.comparator).toBe('function')
    })
  })

  describe('enqueue', () => {
    it('should add a single element', () => {
      pq.enqueue(5)
      expect(pq.size).toBe(1)
      expect(pq.isEmpty).toBe(false)
    })

    it('should add multiple elements', () => {
      pq.enqueue(3)
      pq.enqueue(1)
      pq.enqueue(2)
      expect(pq.size).toBe(3)
    })

    it('should maintain heap property after enqueues', () => {
      pq.enqueue(5)
      pq.enqueue(3)
      pq.enqueue(1)
      pq.enqueue(4)
      pq.enqueue(2)
      expect(pq.peek()).toBe(1)
    })

    it('should handle negative numbers', () => {
      pq.enqueue(-5)
      pq.enqueue(-1)
      pq.enqueue(-3)
      expect(pq.peek()).toBe(-5)
    })

    it('should handle zero', () => {
      pq.enqueue(0)
      pq.enqueue(1)
      pq.enqueue(-1)
      expect(pq.peek()).toBe(-1)
    })

    it('should handle floating point numbers', () => {
      pq.enqueue(1.5)
      pq.enqueue(0.3)
      pq.enqueue(2.7)
      expect(pq.peek()).toBe(0.3)
    })

    it('should handle duplicates', () => {
      pq.enqueue(5)
      pq.enqueue(5)
      pq.enqueue(5)
      expect(pq.size).toBe(3)
      expect(pq.peek()).toBe(5)
    })

    it('should handle many elements', () => {
      for (let i = 1000; i >= 0; i--) {
        pq.enqueue(i)
      }
      expect(pq.size).toBe(1001)
      expect(pq.peek()).toBe(0)
    })
  })

  describe('dequeue', () => {
    it('should return undefined from empty queue', () => {
      expect(pq.dequeue()).toBeUndefined()
    })

    it('should return the single element', () => {
      pq.enqueue(42)
      expect(pq.dequeue()).toBe(42)
      expect(pq.size).toBe(0)
    })

    it('should return elements in ascending order (min-heap)', () => {
      pq.enqueue(3)
      pq.enqueue(1)
      pq.enqueue(2)
      expect(pq.dequeue()).toBe(1)
      expect(pq.dequeue()).toBe(2)
      expect(pq.dequeue()).toBe(3)
    })

    it('should return undefined after draining all elements', () => {
      pq.enqueue(1)
      pq.dequeue()
      expect(pq.dequeue()).toBeUndefined()
    })

    it('should maintain heap property after dequeue', () => {
      const values = [5, 3, 7, 1, 4, 6, 2]
      for (const v of values) {
        pq.enqueue(v)
      }
      const sorted = [...values].sort((a, b) => a - b)
      for (const expected of sorted) {
        expect(pq.dequeue()).toBe(expected)
      }
    })

    it('should handle dequeue with many elements', () => {
      const count = 1000
      for (let i = count - 1; i >= 0; i--) {
        pq.enqueue(i)
      }
      for (let i = 0; i < count; i++) {
        expect(pq.dequeue()).toBe(i)
      }
      expect(pq.isEmpty).toBe(true)
    })

    it('should handle duplicate priorities', () => {
      pq.enqueue(3)
      pq.enqueue(1)
      pq.enqueue(1)
      pq.enqueue(2)
      expect(pq.dequeue()).toBe(1)
      expect(pq.dequeue()).toBe(1)
      expect(pq.dequeue()).toBe(2)
      expect(pq.dequeue()).toBe(3)
    })
  })

  describe('peek', () => {
    it('should return undefined from empty queue', () => {
      expect(pq.peek()).toBeUndefined()
    })

    it('should return the minimum element', () => {
      pq.enqueue(5)
      pq.enqueue(3)
      pq.enqueue(7)
      expect(pq.peek()).toBe(3)
    })

    it('should not remove the element', () => {
      pq.enqueue(5)
      pq.peek()
      expect(pq.size).toBe(1)
    })

    it('should return same element on repeated peeks', () => {
      pq.enqueue(5)
      pq.enqueue(3)
      expect(pq.peek()).toBe(3)
      expect(pq.peek()).toBe(3)
      expect(pq.peek()).toBe(3)
    })

    it('should update after dequeue', () => {
      pq.enqueue(5)
      pq.enqueue(3)
      pq.enqueue(7)
      pq.dequeue()
      expect(pq.peek()).toBe(5)
    })
  })

  describe('size', () => {
    it('should return 0 for empty queue', () => {
      expect(pq.size).toBe(0)
    })

    it('should increment on enqueue', () => {
      pq.enqueue(1)
      expect(pq.size).toBe(1)
      pq.enqueue(2)
      expect(pq.size).toBe(2)
    })

    it('should decrement on dequeue', () => {
      pq.enqueue(1)
      pq.enqueue(2)
      pq.dequeue()
      expect(pq.size).toBe(1)
    })

    it('should return 0 after clear', () => {
      pq.enqueue(1)
      pq.enqueue(2)
      pq.clear()
      expect(pq.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new queue', () => {
      expect(pq.isEmpty).toBe(true)
    })

    it('should return false after enqueue', () => {
      pq.enqueue(1)
      expect(pq.isEmpty).toBe(false)
    })

    it('should return true after dequeuing all elements', () => {
      pq.enqueue(1)
      pq.dequeue()
      expect(pq.isEmpty).toBe(true)
    })

    it('should return true after clear', () => {
      pq.enqueue(1)
      pq.clear()
      expect(pq.isEmpty).toBe(true)
    })

    it('should toggle correctly', () => {
      expect(pq.isEmpty).toBe(true)
      pq.enqueue(1)
      expect(pq.isEmpty).toBe(false)
      pq.dequeue()
      expect(pq.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear empty queue', () => {
      pq.clear()
      expect(pq.size).toBe(0)
      expect(pq.isEmpty).toBe(true)
    })

    it('should clear queue with elements', () => {
      pq.enqueue(1)
      pq.enqueue(2)
      pq.enqueue(3)
      pq.clear()
      expect(pq.size).toBe(0)
      expect(pq.isEmpty).toBe(true)
    })

    it('should allow operations after clear', () => {
      pq.enqueue(1)
      pq.clear()
      pq.enqueue(2)
      expect(pq.peek()).toBe(2)
      expect(pq.size).toBe(1)
    })

    it('should handle multiple clears', () => {
      pq.enqueue(1)
      pq.clear()
      pq.clear()
      pq.clear()
      expect(pq.size).toBe(0)
    })

    it('should reset pageCount', () => {
      pq.enqueue(1)
      pq.enqueue(2)
      pq.enqueue(3)
      pq.clear()
      expect(pq.pageCount()).toBe(0)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty queue', () => {
      expect(pq.toArray()).toEqual([])
    })

    it('should return single element', () => {
      pq.enqueue(5)
      expect(pq.toArray()).toEqual([5])
    })

    it('should return elements in sorted order', () => {
      pq.enqueue(3)
      pq.enqueue(1)
      pq.enqueue(2)
      expect(pq.toArray()).toEqual([1, 2, 3])
    })

    it('should not modify the queue', () => {
      pq.enqueue(3)
      pq.enqueue(1)
      pq.enqueue(2)
      pq.toArray()
      expect(pq.size).toBe(3)
      expect(pq.peek()).toBe(1)
    })

    it('should handle many elements', () => {
      for (let i = 100; i >= 0; i--) {
        pq.enqueue(i)
      }
      const arr = pq.toArray()
      expect(arr).toHaveLength(101)
      for (let i = 0; i <= 100; i++) {
        expect(arr[i]).toBe(i)
      }
    })

    it('should handle duplicates', () => {
      pq.enqueue(1)
      pq.enqueue(1)
      pq.enqueue(2)
      expect(pq.toArray()).toEqual([1, 1, 2])
    })
  })

  describe('contains', () => {
    it('should return false for empty queue', () => {
      expect(pq.contains(1)).toBe(false)
    })

    it('should return true for existing element', () => {
      pq.enqueue(5)
      expect(pq.contains(5)).toBe(true)
    })

    it('should return false for non-existing element', () => {
      pq.enqueue(5)
      expect(pq.contains(3)).toBe(false)
    })

    it('should find elements after multiple enqueues', () => {
      pq.enqueue(3)
      pq.enqueue(1)
      pq.enqueue(4)
      expect(pq.contains(1)).toBe(true)
      expect(pq.contains(3)).toBe(true)
      expect(pq.contains(4)).toBe(true)
      expect(pq.contains(2)).toBe(false)
    })

    it('should not find element after dequeue', () => {
      pq.enqueue(1)
      pq.enqueue(2)
      pq.dequeue()
      expect(pq.contains(1)).toBe(false)
    })

    it('should find duplicates', () => {
      pq.enqueue(5)
      pq.enqueue(5)
      expect(pq.contains(5)).toBe(true)
    })

    it('should handle many elements', () => {
      for (let i = 0; i < 100; i++) {
        pq.enqueue(i)
      }
      expect(pq.contains(0)).toBe(true)
      expect(pq.contains(50)).toBe(true)
      expect(pq.contains(99)).toBe(true)
      expect(pq.contains(100)).toBe(false)
    })
  })

  describe('remove', () => {
    it('should return false for empty queue', () => {
      expect(pq.remove(1)).toBe(false)
    })

    it('should return false for non-existing element', () => {
      pq.enqueue(1)
      expect(pq.remove(2)).toBe(false)
    })

    it('should remove and return true for existing element', () => {
      pq.enqueue(1)
      expect(pq.remove(1)).toBe(true)
      expect(pq.size).toBe(0)
    })

    it('should maintain heap property after removal', () => {
      pq.enqueue(5)
      pq.enqueue(3)
      pq.enqueue(7)
      pq.enqueue(1)
      pq.remove(3)
      expect(pq.dequeue()).toBe(1)
      expect(pq.dequeue()).toBe(5)
      expect(pq.dequeue()).toBe(7)
    })

    it('should remove root element', () => {
      pq.enqueue(1)
      pq.enqueue(2)
      pq.enqueue(3)
      expect(pq.remove(1)).toBe(true)
      expect(pq.peek()).toBe(2)
    })

    it('should remove last element', () => {
      pq.enqueue(1)
      pq.enqueue(2)
      pq.enqueue(3)
      expect(pq.remove(3)).toBe(true)
      expect(pq.size).toBe(2)
    })

    it('should remove middle element', () => {
      pq.enqueue(1)
      pq.enqueue(2)
      pq.enqueue(3)
      expect(pq.remove(2)).toBe(true)
      expect(pq.size).toBe(2)
    })

    it('should handle removing from single element queue', () => {
      pq.enqueue(42)
      expect(pq.remove(42)).toBe(true)
      expect(pq.isEmpty).toBe(true)
    })

    it('should only remove one duplicate', () => {
      pq.enqueue(5)
      pq.enqueue(5)
      pq.enqueue(3)
      expect(pq.remove(5)).toBe(true)
      expect(pq.size).toBe(2)
      expect(pq.contains(5)).toBe(true)
    })
  })

  describe('update', () => {
    it('should return false for empty queue', () => {
      expect(pq.update(1, 2)).toBe(false)
    })

    it('should return false for non-existing element', () => {
      pq.enqueue(1)
      expect(pq.update(2, 3)).toBe(false)
    })

    it('should update existing element', () => {
      pq.enqueue(5)
      expect(pq.update(5, 10)).toBe(true)
      expect(pq.peek()).toBe(10)
    })

    it('should maintain heap property after update to lower value', () => {
      pq.enqueue(5)
      pq.enqueue(3)
      pq.enqueue(7)
      pq.update(5, 1)
      expect(pq.peek()).toBe(1)
    })

    it('should maintain heap property after update to higher value', () => {
      pq.enqueue(1)
      pq.enqueue(3)
      pq.enqueue(5)
      pq.update(1, 10)
      expect(pq.peek()).toBe(3)
    })

    it('should update and allow further operations', () => {
      pq.enqueue(5)
      pq.enqueue(3)
      pq.update(5, 1)
      expect(pq.dequeue()).toBe(1)
      expect(pq.dequeue()).toBe(3)
    })

    it('should handle update with same value', () => {
      pq.enqueue(5)
      pq.enqueue(3)
      expect(pq.update(5, 5)).toBe(true)
      expect(pq.peek()).toBe(3)
    })

    it('should not modify size on update', () => {
      pq.enqueue(1)
      pq.enqueue(2)
      pq.enqueue(3)
      pq.update(2, 10)
      expect(pq.size).toBe(3)
    })
  })

  describe('merge', () => {
    it('should merge two empty queues', () => {
      const other = new PagedPriorityQueue<number>()
      pq.merge(other)
      expect(pq.size).toBe(0)
    })

    it('should merge empty into non-empty', () => {
      pq.enqueue(1)
      const other = new PagedPriorityQueue<number>()
      pq.merge(other)
      expect(pq.size).toBe(1)
    })

    it('should merge non-empty into empty', () => {
      const other = new PagedPriorityQueue<number>()
      other.enqueue(1)
      other.enqueue(2)
      pq.merge(other)
      expect(pq.size).toBe(2)
    })

    it('should merge two non-empty queues', () => {
      pq.enqueue(1)
      pq.enqueue(4)
      const other = new PagedPriorityQueue<number>()
      other.enqueue(2)
      other.enqueue(3)
      pq.merge(other)
      expect(pq.size).toBe(4)
      expect(pq.dequeue()).toBe(1)
      expect(pq.dequeue()).toBe(2)
      expect(pq.dequeue()).toBe(3)
      expect(pq.dequeue()).toBe(4)
    })

    it('should not modify source queue', () => {
      const other = new PagedPriorityQueue<number>()
      other.enqueue(1)
      other.enqueue(2)
      pq.merge(other)
      expect(other.size).toBe(2)
    })

    it('should handle merge with many elements', () => {
      for (let i = 0; i < 50; i++) {
        pq.enqueue(i * 2)
      }
      const other = new PagedPriorityQueue<number>()
      for (let i = 0; i < 50; i++) {
        other.enqueue(i * 2 + 1)
      }
      pq.merge(other)
      expect(pq.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(pq.dequeue()).toBe(i)
      }
    })
  })

  describe('pageCount', () => {
    it('should return 0 for empty queue', () => {
      expect(pq.pageCount()).toBe(0)
    })

    it('should return 1 for single element', () => {
      pq.enqueue(1)
      expect(pq.pageCount()).toBe(1)
    })

    it('should return correct count with pageSize 4', () => {
      const q = new PagedPriorityQueue<number>({ pageSize: 4 })
      q.enqueue(1)
      expect(q.pageCount()).toBe(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.pageCount()).toBe(1)
      q.enqueue(5)
      expect(q.pageCount()).toBe(2)
    })

    it('should decrease when elements are dequeued', () => {
      const q = new PagedPriorityQueue<number>({ pageSize: 4 })
      for (let i = 0; i < 8; i++) {
        q.enqueue(i)
      }
      expect(q.pageCount()).toBe(2)
      for (let i = 0; i < 4; i++) {
        q.dequeue()
      }
      expect(q.pageCount()).toBe(1)
    })

    it('should return 0 after clear', () => {
      pq.enqueue(1)
      pq.enqueue(2)
      pq.clear()
      expect(pq.pageCount()).toBe(0)
    })
  })

  describe('drain', () => {
    it('should return empty array for empty queue', () => {
      expect(pq.drain()).toEqual([])
    })

    it('should drain all elements in order', () => {
      pq.enqueue(3)
      pq.enqueue(1)
      pq.enqueue(2)
      expect(pq.drain()).toEqual([1, 2, 3])
    })

    it('should empty the queue after drain', () => {
      pq.enqueue(1)
      pq.enqueue(2)
      pq.drain()
      expect(pq.isEmpty).toBe(true)
      expect(pq.size).toBe(0)
    })

    it('should allow operations after drain', () => {
      pq.enqueue(1)
      pq.drain()
      pq.enqueue(2)
      expect(pq.peek()).toBe(2)
    })

    it('should handle many elements', () => {
      for (let i = 100; i >= 0; i--) {
        pq.enqueue(i)
      }
      const drained = pq.drain()
      expect(drained).toHaveLength(101)
      for (let i = 0; i <= 100; i++) {
        expect(drained[i]).toBe(i)
      }
    })
  })

  describe('pageSize variations', () => {
    it('should work with pageSize 1', () => {
      const q = new PagedPriorityQueue<number>({ pageSize: 1 })
      q.enqueue(3)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
      expect(q.pageCount()).toBe(0)
    })

    it('should work with pageSize 4', () => {
      const q = new PagedPriorityQueue<number>({ pageSize: 4 })
      for (let i = 10; i >= 0; i--) {
        q.enqueue(i)
      }
      for (let i = 0; i <= 10; i++) {
        expect(q.dequeue()).toBe(i)
      }
    })

    it('should work with pageSize 16', () => {
      const q = new PagedPriorityQueue<number>({ pageSize: 16 })
      for (let i = 50; i >= 0; i--) {
        q.enqueue(i)
      }
      expect(q.peek()).toBe(0)
    })

    it('should work with pageSize 64', () => {
      const q = new PagedPriorityQueue<number>({ pageSize: 64 })
      for (let i = 200; i >= 0; i--) {
        q.enqueue(i)
      }
      expect(q.dequeue()).toBe(0)
    })

    it('should work with pageSize 256', () => {
      const q = new PagedPriorityQueue<number>({ pageSize: 256 })
      for (let i = 500; i >= 0; i--) {
        q.enqueue(i)
      }
      for (let i = 0; i <= 500; i++) {
        expect(q.dequeue()).toBe(i)
      }
    })

    it('should handle page boundaries correctly with pageSize 4', () => {
      const q = new PagedPriorityQueue<number>({ pageSize: 4 })
      q.enqueue(8)
      q.enqueue(7)
      q.enqueue(6)
      q.enqueue(5)
      expect(q.pageCount()).toBe(1)
      q.enqueue(4)
      expect(q.pageCount()).toBe(2)
      expect(q.dequeue()).toBe(4)
    })

    it('should handle exact page fill with pageSize 4', () => {
      const q = new PagedPriorityQueue<number>({ pageSize: 4 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.pageCount()).toBe(1)
    })

    it('should handle dequeue across pages with pageSize 4', () => {
      const q = new PagedPriorityQueue<number>({ pageSize: 4 })
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(8)
      q.enqueue(1)
      q.enqueue(7)
      q.enqueue(2)
      q.enqueue(6)
      q.enqueue(4)
      expect(q.pageCount()).toBe(2)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
      expect(q.dequeue()).toBe(4)
      expect(q.dequeue()).toBe(5)
      expect(q.dequeue()).toBe(6)
      expect(q.dequeue()).toBe(7)
      expect(q.dequeue()).toBe(8)
    })
  })

  describe('custom comparator (max-heap)', () => {
    it('should create a max-heap', () => {
      const maxQ = new PagedPriorityQueue<number>({
        comparator: (a, b) => b - a,
      })
      maxQ.enqueue(1)
      maxQ.enqueue(3)
      maxQ.enqueue(2)
      expect(maxQ.peek()).toBe(3)
    })

    it('should dequeue in descending order', () => {
      const maxQ = new PagedPriorityQueue<number>({
        comparator: (a, b) => b - a,
      })
      maxQ.enqueue(1)
      maxQ.enqueue(3)
      maxQ.enqueue(2)
      expect(maxQ.dequeue()).toBe(3)
      expect(maxQ.dequeue()).toBe(2)
      expect(maxQ.dequeue()).toBe(1)
    })

    it('should work with many elements in max-heap', () => {
      const maxQ = new PagedPriorityQueue<number>({
        comparator: (a, b) => b - a,
      })
      for (let i = 0; i < 100; i++) {
        maxQ.enqueue(i)
      }
      for (let i = 99; i >= 0; i--) {
        expect(maxQ.dequeue()).toBe(i)
      }
    })

    it('should work with string comparator', () => {
      const strQ = new PagedPriorityQueue<string>({
        comparator: (a, b) => b.localeCompare(a),
      })
      strQ.enqueue('a')
      strQ.enqueue('c')
      strQ.enqueue('b')
      expect(strQ.dequeue()).toBe('c')
      expect(strQ.dequeue()).toBe('b')
      expect(strQ.dequeue()).toBe('a')
    })
  })

  describe('with string type', () => {
    it('should work with strings', () => {
      const strQ = new PagedPriorityQueue<string>()
      strQ.enqueue('cherry')
      strQ.enqueue('apple')
      strQ.enqueue('banana')
      expect(strQ.dequeue()).toBe('apple')
      expect(strQ.dequeue()).toBe('banana')
      expect(strQ.dequeue()).toBe('cherry')
    })
  })

  describe('with object type', () => {
    it('should work with objects using custom comparator', () => {
      const objQ = new PagedPriorityQueue<{ priority: number; name: string }>({
        comparator: (a, b) => a.priority - b.priority,
      })
      objQ.enqueue({ priority: 3, name: 'c' })
      objQ.enqueue({ priority: 1, name: 'a' })
      objQ.enqueue({ priority: 2, name: 'b' })
      expect(objQ.dequeue()?.name).toBe('a')
      expect(objQ.dequeue()?.name).toBe('b')
      expect(objQ.dequeue()?.name).toBe('c')
    })
  })

  describe('edge cases', () => {
    it('should handle dequeue from empty queue', () => {
      expect(pq.dequeue()).toBeUndefined()
    })

    it('should handle peek on empty queue', () => {
      expect(pq.peek()).toBeUndefined()
    })

    it('should handle toArray on empty queue', () => {
      expect(pq.toArray()).toEqual([])
    })

    it('should handle drain on empty queue', () => {
      expect(pq.drain()).toEqual([])
    })

    it('should handle remove on empty queue', () => {
      expect(pq.remove(1)).toBe(false)
    })

    it('should handle update on empty queue', () => {
      expect(pq.update(1, 2)).toBe(false)
    })

    it('should handle contains on empty queue', () => {
      expect(pq.contains(1)).toBe(false)
    })

    it('should handle merge of empty queues', () => {
      const other = new PagedPriorityQueue<number>()
      pq.merge(other)
      expect(pq.size).toBe(0)
    })

    it('should handle enqueue after dequeue all', () => {
      pq.enqueue(1)
      pq.dequeue()
      pq.enqueue(2)
      expect(pq.peek()).toBe(2)
    })

    it('should handle interleaved enqueue and dequeue', () => {
      pq.enqueue(5)
      expect(pq.dequeue()).toBe(5)
      pq.enqueue(3)
      pq.enqueue(1)
      expect(pq.dequeue()).toBe(1)
      pq.enqueue(2)
      expect(pq.dequeue()).toBe(2)
      expect(pq.dequeue()).toBe(3)
      expect(pq.isEmpty).toBe(true)
    })
  })

  describe('large scale operations', () => {
    it('should handle 10000 elements', () => {
      const count = 10000
      for (let i = count - 1; i >= 0; i--) {
        pq.enqueue(i)
      }
      expect(pq.size).toBe(count)
      expect(pq.peek()).toBe(0)
      for (let i = 0; i < count; i++) {
        expect(pq.dequeue()).toBe(i)
      }
      expect(pq.isEmpty).toBe(true)
    })

    it('should handle 10000 random elements', () => {
      const count = 10000
      const values: number[] = []
      for (let i = 0; i < count; i++) {
        const v = Math.floor(Math.random() * 100000)
        values.push(v)
        pq.enqueue(v)
      }
      values.sort((a, b) => a - b)
      for (const expected of values) {
        expect(pq.dequeue()).toBe(expected)
      }
    })

    it('should handle 10000 elements with small page size', () => {
      const q = new PagedPriorityQueue<number>({ pageSize: 4 })
      for (let i = 10000; i >= 0; i--) {
        q.enqueue(i)
      }
      expect(q.size).toBe(10001)
      for (let i = 0; i <= 10000; i++) {
        expect(q.dequeue()).toBe(i)
      }
    })

    it('should handle 10000 elements with large page size', () => {
      const q = new PagedPriorityQueue<number>({ pageSize: 256 })
      for (let i = 10000; i >= 0; i--) {
        q.enqueue(i)
      }
      for (let i = 0; i <= 10000; i++) {
        expect(q.dequeue()).toBe(i)
      }
    })
  })

  describe('duplicate priorities', () => {
    it('should handle all same elements', () => {
      for (let i = 0; i < 10; i++) {
        pq.enqueue(5)
      }
      for (let i = 0; i < 10; i++) {
        expect(pq.dequeue()).toBe(5)
      }
    })

    it('should handle mixed duplicates', () => {
      pq.enqueue(3)
      pq.enqueue(1)
      pq.enqueue(3)
      pq.enqueue(1)
      pq.enqueue(2)
      expect(pq.dequeue()).toBe(1)
      expect(pq.dequeue()).toBe(1)
      expect(pq.dequeue()).toBe(2)
      expect(pq.dequeue()).toBe(3)
      expect(pq.dequeue()).toBe(3)
    })

    it('should handle two values only', () => {
      for (let i = 0; i < 5; i++) {
        pq.enqueue(0)
        pq.enqueue(1)
      }
      for (let i = 0; i < 5; i++) {
        expect(pq.dequeue()).toBe(0)
      }
      for (let i = 0; i < 5; i++) {
        expect(pq.dequeue()).toBe(1)
      }
    })
  })

  describe('remove operations across pages', () => {
    it('should remove element from different pages with pageSize 4', () => {
      const q = new PagedPriorityQueue<number>({ pageSize: 4 })
      q.enqueue(10)
      q.enqueue(9)
      q.enqueue(8)
      q.enqueue(7)
      q.enqueue(6)
      q.enqueue(5)
      q.enqueue(4)
      q.enqueue(3)
      expect(q.remove(9)).toBe(true)
      expect(q.size).toBe(7)
      const drained = q.drain()
      expect(drained).toEqual([3, 4, 5, 6, 7, 8, 10])
    })

    it('should remove root across page boundary with pageSize 4', () => {
      const q = new PagedPriorityQueue<number>({ pageSize: 4 })
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(8)
      q.enqueue(1)
      q.enqueue(7)
      q.enqueue(2)
      q.enqueue(6)
      q.enqueue(4)
      expect(q.remove(1)).toBe(true)
      expect(q.peek()).toBe(2)
    })
  })

  describe('update operations across pages', () => {
    it('should update element across pages with pageSize 4', () => {
      const q = new PagedPriorityQueue<number>({ pageSize: 4 })
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(8)
      q.enqueue(1)
      q.enqueue(7)
      q.enqueue(2)
      q.enqueue(6)
      q.enqueue(4)
      expect(q.update(8, 0)).toBe(true)
      expect(q.peek()).toBe(0)
    })

    it('should update root to larger value', () => {
      const q = new PagedPriorityQueue<number>({ pageSize: 4 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      expect(q.update(1, 10)).toBe(true)
      expect(q.peek()).toBe(2)
    })
  })

  describe('merge operations', () => {
    it('should merge queues with different page sizes', () => {
      const q1 = new PagedPriorityQueue<number>({ pageSize: 4 })
      const q2 = new PagedPriorityQueue<number>({ pageSize: 8 })
      q1.enqueue(1)
      q1.enqueue(3)
      q2.enqueue(2)
      q2.enqueue(4)
      q1.merge(q2)
      expect(q1.dequeue()).toBe(1)
      expect(q1.dequeue()).toBe(2)
      expect(q1.dequeue()).toBe(3)
      expect(q1.dequeue()).toBe(4)
    })

    it('should merge max-heap queues', () => {
      const q1 = new PagedPriorityQueue<number>({
        comparator: (a, b) => b - a,
      })
      const q2 = new PagedPriorityQueue<number>({
        comparator: (a, b) => b - a,
      })
      q1.enqueue(1)
      q1.enqueue(3)
      q2.enqueue(2)
      q2.enqueue(4)
      q1.merge(q2)
      expect(q1.dequeue()).toBe(4)
      expect(q1.dequeue()).toBe(3)
      expect(q1.dequeue()).toBe(2)
      expect(q1.dequeue()).toBe(1)
    })
  })

  describe('integration', () => {
    it('should handle enqueue-dequeue-update cycle', () => {
      pq.enqueue(5)
      pq.enqueue(3)
      pq.enqueue(7)
      expect(pq.peek()).toBe(3)
      pq.update(3, 1)
      expect(pq.peek()).toBe(1)
      expect(pq.dequeue()).toBe(1)
      expect(pq.dequeue()).toBe(5)
      expect(pq.dequeue()).toBe(7)
    })

    it('should handle mixed operations', () => {
      pq.enqueue(10)
      pq.enqueue(20)
      pq.enqueue(30)
      pq.remove(20)
      pq.enqueue(5)
      pq.enqueue(15)
      expect(pq.toArray()).toEqual([5, 10, 15, 30])
    })

    it('should handle clear and reuse', () => {
      for (let i = 0; i < 50; i++) {
        pq.enqueue(i)
      }
      pq.clear()
      expect(pq.isEmpty).toBe(true)
      pq.enqueue(100)
      expect(pq.peek()).toBe(100)
    })

    it('should handle drain and refill', () => {
      pq.enqueue(5)
      pq.enqueue(3)
      const first = pq.drain()
      expect(first).toEqual([3, 5])
      pq.enqueue(1)
      pq.enqueue(2)
      expect(pq.drain()).toEqual([1, 2])
    })

    it('should handle contains after various operations', () => {
      pq.enqueue(1)
      pq.enqueue(2)
      pq.enqueue(3)
      pq.dequeue()
      expect(pq.contains(1)).toBe(false)
      expect(pq.contains(2)).toBe(true)
      expect(pq.contains(3)).toBe(true)
    })

    it('should handle pageCount after various operations', () => {
      const q = new PagedPriorityQueue<number>({ pageSize: 4 })
      for (let i = 0; i < 10; i++) {
        q.enqueue(i)
      }
      expect(q.pageCount()).toBe(3)
      q.dequeue()
      q.dequeue()
      q.dequeue()
      q.dequeue()
      expect(q.pageCount()).toBe(2)
      q.clear()
      expect(q.pageCount()).toBe(0)
    })

    it('should handle stress test with mixed operations', () => {
      const q = new PagedPriorityQueue<number>({ pageSize: 8 })
      const added: number[] = []
      for (let i = 0; i < 500; i++) {
        const op = Math.random()
        if (op < 0.5 || q.isEmpty) {
          const v = Math.floor(Math.random() * 1000)
          q.enqueue(v)
          added.push(v)
        } else if (op < 0.8) {
          const val = q.dequeue()
          if (val !== undefined) {
            const idx = added.indexOf(val)
            if (idx !== -1) added.splice(idx, 1)
          }
        } else {
          if (added.length > 0) {
            const target = added[Math.floor(Math.random() * added.length)]!
            q.remove(target)
            const idx = added.indexOf(target)
            if (idx !== -1) added.splice(idx, 1)
          }
        }
      }
      added.sort((a, b) => a - b)
      while (!q.isEmpty) {
        const val = q.dequeue()!
        const expected = added.shift()
        expect(val).toBe(expected)
      }
    })

    it('should handle merge followed by drain', () => {
      const q1 = new PagedPriorityQueue<number>({ pageSize: 4 })
      const q2 = new PagedPriorityQueue<number>({ pageSize: 4 })
      q1.enqueue(1)
      q1.enqueue(4)
      q2.enqueue(2)
      q2.enqueue(3)
      q1.merge(q2)
      expect(q1.drain()).toEqual([1, 2, 3, 4])
    })
  })
})
