import { describe, it, expect } from 'vitest'
import { BinomialQueue2 } from './src/core/binomial-queue-2/index.js'

describe('BinomialQueue2', () => {
  describe('constructor', () => {
    it('should create empty queue', () => {
      const queue = new BinomialQueue2<number>()
      expect(queue.isEmpty()).toBe(true)
      expect(queue.size).toBe(0)
    })

    it('should accept custom comparator for max-heap', () => {
      const queue = new BinomialQueue2<number>((a, b) => b - a)
      queue.insert(3)
      queue.insert(1)
      queue.insert(2)
      expect(queue.extractMin()).toBe(3)
      expect(queue.extractMin()).toBe(2)
      expect(queue.extractMin()).toBe(1)
    })
  })

  describe('insert', () => {
    it('should insert single element', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(5)
      expect(queue.size).toBe(1)
      expect(queue.isEmpty()).toBe(false)
    })

    it('should insert multiple elements', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(3)
      queue.insert(1)
      queue.insert(4)
      queue.insert(2)
      expect(queue.size).toBe(4)
    })

    it('should insert duplicate values', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(5)
      queue.insert(5)
      queue.insert(5)
      expect(queue.size).toBe(3)
    })

    it('should insert negative numbers', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(-5)
      queue.insert(3)
      queue.insert(-1)
      expect(queue.size).toBe(3)
    })

    it('should insert zero', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(0)
      expect(queue.size).toBe(1)
    })

    it('should insert strings', () => {
      const queue = new BinomialQueue2<string>()
      queue.insert('zebra')
      queue.insert('apple')
      queue.insert('mango')
      expect(queue.size).toBe(3)
    })

    it('should insert objects with custom comparator', () => {
      const queue = new BinomialQueue2<{ value: number }>((a, b) => a.value - b.value)
      queue.insert({ value: 3 })
      queue.insert({ value: 1 })
      queue.insert({ value: 2 })
      expect(queue.size).toBe(3)
    })
  })

  describe('extractMin', () => {
    it('should extract min from single element', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(5)
      expect(queue.extractMin()).toBe(5)
      expect(queue.isEmpty()).toBe(true)
    })

    it('should extract in ascending order', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(3)
      queue.insert(1)
      queue.insert(4)
      queue.insert(2)
      expect(queue.extractMin()).toBe(1)
      expect(queue.extractMin()).toBe(2)
      expect(queue.extractMin()).toBe(3)
      expect(queue.extractMin()).toBe(4)
    })

    it('should handle duplicates', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(3)
      queue.insert(1)
      queue.insert(1)
      queue.insert(2)
      expect(queue.extractMin()).toBe(1)
      expect(queue.extractMin()).toBe(1)
      expect(queue.extractMin()).toBe(2)
      expect(queue.extractMin()).toBe(3)
    })

    it('should handle negative numbers', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(-5)
      queue.insert(3)
      queue.insert(-1)
      expect(queue.extractMin()).toBe(-5)
      expect(queue.extractMin()).toBe(-1)
      expect(queue.extractMin()).toBe(3)
    })

    it('should throw on empty queue', () => {
      const queue = new BinomialQueue2<number>()
      expect(() => queue.extractMin()).toThrow('Queue is empty')
    })

    it('should throw after extracting all elements', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(1)
      queue.insert(2)
      queue.extractMin()
      queue.extractMin()
      expect(() => queue.extractMin()).toThrow('Queue is empty')
    })
  })

  describe('peek', () => {
    it('should return min without removing', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(3)
      queue.insert(1)
      queue.insert(4)
      expect(queue.peek()).toBe(1)
      expect(queue.size).toBe(3)
    })

    it('should return same value on multiple peeks', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(5)
      queue.insert(2)
      queue.insert(8)
      expect(queue.peek()).toBe(2)
      expect(queue.peek()).toBe(2)
      expect(queue.peek()).toBe(2)
    })

    it('should work with single element', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(7)
      expect(queue.peek()).toBe(7)
    })

    it('should throw on empty queue', () => {
      const queue = new BinomialQueue2<number>()
      expect(() => queue.peek()).toThrow('Queue is empty')
    })

    it('should update after extractMin', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(3)
      queue.insert(1)
      queue.insert(4)
      queue.insert(2)
      expect(queue.peek()).toBe(1)
      queue.extractMin()
      expect(queue.peek()).toBe(2)
      queue.extractMin()
      expect(queue.peek()).toBe(3)
    })
  })

  describe('merge', () => {
    it('should merge two empty queues', () => {
      const q1 = new BinomialQueue2<number>()
      const q2 = new BinomialQueue2<number>()
      q1.merge(q2)
      expect(q1.isEmpty()).toBe(true)
      expect(q2.isEmpty()).toBe(true)
    })

    it('should merge empty with non-empty', () => {
      const q1 = new BinomialQueue2<number>()
      const q2 = new BinomialQueue2<number>()
      q2.insert(1)
      q2.insert(2)
      q1.merge(q2)
      expect(q1.size).toBe(2)
      expect(q2.isEmpty()).toBe(true)
    })

    it('should merge two non-empty queues', () => {
      const q1 = new BinomialQueue2<number>()
      const q2 = new BinomialQueue2<number>()
      q1.insert(1)
      q1.insert(3)
      q2.insert(2)
      q2.insert(4)
      q1.merge(q2)
      expect(q1.size).toBe(4)
      expect(q1.extractMin()).toBe(1)
      expect(q1.extractMin()).toBe(2)
      expect(q1.extractMin()).toBe(3)
      expect(q1.extractMin()).toBe(4)
    })

    it('should merge queues with overlapping values', () => {
      const q1 = new BinomialQueue2<number>()
      const q2 = new BinomialQueue2<number>()
      q1.insert(1)
      q1.insert(3)
      q2.insert(2)
      q2.insert(3)
      q1.merge(q2)
      expect(q1.size).toBe(4)
      expect(q1.toArray()).toEqual([1, 2, 3, 3])
    })

    it('should merge queues with different sizes', () => {
      const q1 = new BinomialQueue2<number>()
      const q2 = new BinomialQueue2<number>()
      for (let i = 0; i < 10; i++) {
        q1.insert(i)
      }
      for (let i = 10; i < 13; i++) {
        q2.insert(i)
      }
      q1.merge(q2)
      expect(q1.size).toBe(13)
      expect(q1.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    })

    it('should preserve queue after merge', () => {
      const q1 = new BinomialQueue2<number>()
      const q2 = new BinomialQueue2<number>()
      q1.insert(1)
      q2.insert(2)
      q1.merge(q2)
      expect(q2.isEmpty()).toBe(true)
      q2.insert(3)
      expect(q2.extractMin()).toBe(3)
    })
  })

  describe('size', () => {
    it('should return 0 for empty queue', () => {
      const queue = new BinomialQueue2<number>()
      expect(queue.size).toBe(0)
    })

    it('should return 1 for single element', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(5)
      expect(queue.size).toBe(1)
    })

    it('should return count of all elements', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(1)
      queue.insert(2)
      queue.insert(3)
      queue.insert(4)
      queue.insert(5)
      expect(queue.size).toBe(5)
    })

    it('should update after extractMin', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(1)
      queue.insert(2)
      queue.insert(3)
      expect(queue.size).toBe(3)
      queue.extractMin()
      expect(queue.size).toBe(2)
      queue.extractMin()
      expect(queue.size).toBe(1)
    })

    it('should update after merge', () => {
      const q1 = new BinomialQueue2<number>()
      const q2 = new BinomialQueue2<number>()
      q1.insert(1)
      q1.insert(2)
      q2.insert(3)
      q2.insert(4)
      q1.merge(q2)
      expect(q1.size).toBe(4)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new queue', () => {
      const queue = new BinomialQueue2<number>()
      expect(queue.isEmpty()).toBe(true)
    })

    it('should return false after insert', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(1)
      expect(queue.isEmpty()).toBe(false)
    })

    it('should return true after extracting all', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(1)
      queue.insert(2)
      queue.extractMin()
      queue.extractMin()
      expect(queue.isEmpty()).toBe(true)
    })

    it('should return false after insert-extract-insert', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(1)
      queue.extractMin()
      queue.insert(2)
      expect(queue.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear empty queue', () => {
      const queue = new BinomialQueue2<number>()
      queue.clear()
      expect(queue.isEmpty()).toBe(true)
      expect(queue.size).toBe(0)
    })

    it('should clear non-empty queue', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(1)
      queue.insert(2)
      queue.insert(3)
      queue.clear()
      expect(queue.isEmpty()).toBe(true)
      expect(queue.size).toBe(0)
    })

    it('should allow operations after clear', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(1)
      queue.insert(2)
      queue.clear()
      queue.insert(3)
      expect(queue.size).toBe(1)
      expect(queue.extractMin()).toBe(3)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty queue', () => {
      const queue = new BinomialQueue2<number>()
      expect(queue.toArray()).toEqual([])
    })

    it('should return sorted array', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(3)
      queue.insert(1)
      queue.insert(4)
      queue.insert(2)
      expect(queue.toArray()).toEqual([1, 2, 3, 4])
    })

    it('should not modify queue', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(1)
      queue.insert(2)
      queue.insert(3)
      const arr = queue.toArray()
      expect(arr).toEqual([1, 2, 3])
      expect(queue.size).toBe(3)
      expect(queue.extractMin()).toBe(1)
    })

    it('should handle duplicates', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(2)
      queue.insert(1)
      queue.insert(2)
      queue.insert(3)
      queue.insert(1)
      expect(queue.toArray()).toEqual([1, 1, 2, 2, 3])
    })

    it('should work with strings', () => {
      const queue = new BinomialQueue2<string>()
      queue.insert('zebra')
      queue.insert('apple')
      queue.insert('mango')
      expect(queue.toArray()).toEqual(['apple', 'mango', 'zebra'])
    })
  })

  describe('interleaved operations', () => {
    it('should handle insert-extract-insert pattern', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(5)
      queue.insert(3)
      expect(queue.extractMin()).toBe(3)
      queue.insert(2)
      expect(queue.extractMin()).toBe(2)
      expect(queue.extractMin()).toBe(5)
    })

    it('should handle peek-extract pattern', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(3)
      queue.insert(1)
      expect(queue.peek()).toBe(1)
      queue.insert(2)
      expect(queue.peek()).toBe(1)
      expect(queue.extractMin()).toBe(1)
      expect(queue.peek()).toBe(2)
    })

    it('should handle merge-extract pattern', () => {
      const q1 = new BinomialQueue2<number>()
      const q2 = new BinomialQueue2<number>()
      q1.insert(1)
      q1.insert(3)
      q2.insert(2)
      q2.insert(4)
      q1.merge(q2)
      expect(q1.extractMin()).toBe(1)
      expect(q1.extractMin()).toBe(2)
    })

    it('should handle clear-insert-extract pattern', () => {
      const queue = new BinomialQueue2<number>()
      queue.insert(1)
      queue.insert(2)
      queue.clear()
      queue.insert(3)
      expect(queue.extractMin()).toBe(3)
    })
  })

  describe('stress tests', () => {
    it('should handle 1000 elements', () => {
      const queue = new BinomialQueue2<number>()
      for (let i = 0; i < 1000; i++) {
        queue.insert(i)
      }
      expect(queue.size).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(queue.extractMin()).toBe(i)
      }
      expect(queue.isEmpty()).toBe(true)
    })

    it('should handle 1000 elements in reverse order', () => {
      const queue = new BinomialQueue2<number>()
      for (let i = 999; i >= 0; i--) {
        queue.insert(i)
      }
      expect(queue.size).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(queue.extractMin()).toBe(i)
      }
    })

    it('should handle 1000 random elements', () => {
      const queue = new BinomialQueue2<number>()
      const values: number[] = []
      for (let i = 0; i < 1000; i++) {
        const val = Math.floor(Math.random() * 10000)
        values.push(val)
        queue.insert(val)
      }
      const sorted = [...values].sort((a, b) => a - b)
      for (const expected of sorted) {
        expect(queue.extractMin()).toBe(expected)
      }
    })

    it('should handle alternating insert and extract', () => {
      const queue = new BinomialQueue2<number>()
      for (let i = 0; i < 100; i++) {
        queue.insert(i)
        if (i % 3 === 0 && !queue.isEmpty()) {
          queue.extractMin()
        }
      }
      expect(queue.size).toBeGreaterThan(0)
    })

    it('should handle multiple merges', () => {
      const q1 = new BinomialQueue2<number>()
      const q2 = new BinomialQueue2<number>()
      const q3 = new BinomialQueue2<number>()
      for (let i = 0; i < 100; i++) {
        q1.insert(i)
      }
      for (let i = 100; i < 200; i++) {
        q2.insert(i)
      }
      for (let i = 200; i < 300; i++) {
        q3.insert(i)
      }
      q1.merge(q2)
      q1.merge(q3)
      expect(q1.size).toBe(300)
      for (let i = 0; i < 300; i++) {
        expect(q1.extractMin()).toBe(i)
      }
    })
  })
})
