import { describe, it, expect } from 'vitest'
import { BinomialQueue2 } from '../../src/core/binomial-queue-2/index.js'

// ─── Constructor ───

describe('BinomialQueue2', () => {
  describe('constructor', () => {
    it('creates an empty queue with default comparator', () => {
      const queue = new BinomialQueue2<number>()
      expect(queue.isEmpty()).toBe(true)
      expect(queue.size).toBe(0)
    })

    it('creates a queue with custom comparator (max-heap)', () => {
      const queue = new BinomialQueue2<number>((a, b) => b - a)
      queue.insert(1)
      queue.insert(5)
      queue.insert(3)
      expect(queue.peek()).toBe(5)
    })
  })

  // ─── Insert ───

  describe('insert', () => {
    it('inserts a single element', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(10)
      expect(queue.isEmpty()).toBe(false)
      expect(queue.size).toBe(1)
    })

    it('inserts multiple elements', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(5)
      queue.insert(3)
      queue.insert(7)
      expect(queue.size).toBe(3)
      expect(queue.peek()).toBe(3)
    })

    it('handles negative numbers', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(-5)
      queue.insert(3)
      queue.insert(-10)
      expect(queue.peek()).toBe(-10)
    })

    it('handles duplicates', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(3)
      queue.insert(3)
      queue.insert(1)
      expect(queue.size).toBe(3)
      expect(queue.peek()).toBe(1)
    })
  })

  // ─── Peek ───

  describe('peek', () => {
    it('throws on empty queue', () => {
      const queue = new BinomialQueue2<number>()
      expect(() => queue.peek()).toThrow('Queue is empty')
    })

    it('returns the minimum element without removing it', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(5)
      queue.insert(3)
      queue.insert(7)
      expect(queue.peek()).toBe(3)
      expect(queue.size).toBe(3)
    })
  })

  // ─── ExtractMin ───

  describe('extractMin', () => {
    it('throws on empty queue', () => {
      const queue = new BinomialQueue2<number>()
      expect(() => queue.extractMin()).toThrow('Queue is empty')
    })

    it('extracts the minimum element', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(5)
      queue.insert(3)
      queue.insert(7)
      expect(queue.extractMin()).toBe(3)
      expect(queue.size).toBe(2)
    })

    it('extracts all elements in sorted order', () => {
      const queue = new BinomialQueue2<number>()
      const values = [5, 3, 7, 1, 9, 2, 8, 4, 6]
      for (const v of values) queue.insert(v)
      const sorted: number[] = []
      while (!queue.isEmpty()) {
        sorted.push(queue.extractMin())
      }
      expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('handles single element', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(42)
      expect(queue.extractMin()).toBe(42)
      expect(queue.isEmpty()).toBe(true)
    })

    it('handles duplicates correctly', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(3)
      queue.insert(1)
      queue.insert(1)
      queue.insert(3)
      const sorted: number[] = []
      while (!queue.isEmpty()) {
        sorted.push(queue.extractMin())
      }
      expect(sorted).toEqual([1, 1, 3, 3])
    })
  })

  // ─── Merge ───

  describe('merge', () => {
    it('merges two queues', () => {
      const q1 = new BinomialQueue2<number>()
      q1.insert(5)
      q1.insert(3)
      const q2 = new BinomialQueue2<number>()
      q2.insert(1)
      q2.insert(7)
      q1.merge(q2)
      expect(q1.size).toBe(4)
      expect(q1.peek()).toBe(1)
    })

    it('empties the merged queue', () => {
      const q1 = new BinomialQueue2<number>()
      q1.insert(5)
      const q2 = new BinomialQueue2<number>()
      q2.insert(1)
      q1.merge(q2)
      expect(q2.isEmpty()).toBe(true)
    })

    it('merges with empty queue', () => {
      const q1 = new BinomialQueue2<number>()
      q1.insert(3)
      const q2 = new BinomialQueue2<number>()
      q1.merge(q2)
      expect(q1.size).toBe(1)
      expect(q1.peek()).toBe(3)
    })
  })

  // ─── Size ───

  describe('size', () => {
    it('returns 0 for empty queue', () => {
      const queue = new BinomialQueue2<number>()
      expect(queue.size).toBe(0)
    })

    it('returns correct size after insertions', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(1)
      queue.insert(2)
      queue.insert(3)
      expect(queue.size).toBe(3)
    })

    it('returns correct size after extractions', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(1)
      queue.insert(2)
      queue.insert(3)
      queue.extractMin()
      expect(queue.size).toBe(2)
    })
  })

  // ─── IsEmpty ───

  describe('isEmpty', () => {
    it('returns true for empty queue', () => {
      const queue = new BinomialQueue2<number>()
      expect(queue.isEmpty()).toBe(true)
    })

    it('returns false after insertion', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(1)
      expect(queue.isEmpty()).toBe(false)
    })

    it('returns true after extracting all elements', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(1)
      queue.extractMin()
      expect(queue.isEmpty()).toBe(true)
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('clears the queue', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(1)
      queue.insert(2)
      queue.insert(3)
      queue.clear()
      expect(queue.isEmpty()).toBe(true)
      expect(queue.size).toBe(0)
    })
  })

  // ─── ToArray ───

  describe('toArray', () => {
    it('returns empty array for empty queue', () => {
      const queue = new BinomialQueue2<number>()
      expect(queue.toArray()).toEqual([])
    })

    it('returns sorted array', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(5)
      queue.insert(3)
      queue.insert(1)
      queue.insert(4)
      queue.insert(2)
      expect(queue.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('does not modify the queue', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(3)
      queue.insert(1)
      queue.toArray()
      expect(queue.size).toBe(2)
      expect(queue.peek()).toBe(1)
    })
  })
})
