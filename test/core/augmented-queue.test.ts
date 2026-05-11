import { describe, it, expect } from 'vitest'
import { AugmentedQueue } from '../../src/core/augmented-queue/index.js'

describe('AugmentedQueue', () => {
  describe('constructor', () => {
    it('creates an empty queue', () => {
      const q = new AugmentedQueue()
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('creates a queue with initial elements via options', () => {
      const q = new AugmentedQueue({ elements: [1, 2, 3] })
      expect(q.size()).toBe(3)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('creates a queue with empty elements array', () => {
      const q = new AugmentedQueue({ elements: [] })
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })
  })

  describe('enqueue', () => {
    it('adds a single element', () => {
      const q = new AugmentedQueue()
      q.enqueue(5)
      expect(q.size()).toBe(1)
      expect(q.isEmpty()).toBe(false)
    })

    it('adds multiple elements in order', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('handles negative numbers', () => {
      const q = new AugmentedQueue()
      q.enqueue(-5)
      q.enqueue(-10)
      q.enqueue(-1)
      expect(q.toArray()).toEqual([-5, -10, -1])
    })

    it('handles zero', () => {
      const q = new AugmentedQueue()
      q.enqueue(0)
      expect(q.peek()).toBe(0)
      expect(q.peekBack()).toBe(0)
    })

    it('handles decimal numbers', () => {
      const q = new AugmentedQueue()
      q.enqueue(1.5)
      q.enqueue(2.7)
      q.enqueue(3.14)
      expect(q.toArray()).toEqual([1.5, 2.7, 3.14])
    })

    it('handles very large numbers', () => {
      const q = new AugmentedQueue()
      q.enqueue(Number.MAX_SAFE_INTEGER)
      q.enqueue(Number.MIN_SAFE_INTEGER)
      expect(q.peek()).toBe(Number.MAX_SAFE_INTEGER)
      expect(q.peekBack()).toBe(Number.MIN_SAFE_INTEGER)
    })
  })

  describe('dequeue', () => {
    it('removes and returns the front element', () => {
      const q = new AugmentedQueue()
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      expect(q.dequeue()).toBe(10)
      expect(q.dequeue()).toBe(20)
      expect(q.dequeue()).toBe(30)
    })

    it('maintains FIFO order', () => {
      const q = new AugmentedQueue()
      for (let i = 0; i < 10; i++) {
        q.enqueue(i)
      }
      for (let i = 0; i < 10; i++) {
        expect(q.dequeue()).toBe(i)
      }
    })

    it('throws when dequeuing from empty queue', () => {
      const q = new AugmentedQueue()
      expect(() => q.dequeue()).toThrow('AugmentedQueue is empty')
    })

    it('handles enqueue after dequeue', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      q.enqueue(3)
      expect(q.toArray()).toEqual([2, 3])
    })

    it('handles alternating enqueue and dequeue', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      expect(q.dequeue()).toBe(1)
      q.enqueue(2)
      expect(q.dequeue()).toBe(2)
      q.enqueue(3)
      expect(q.dequeue()).toBe(3)
      expect(q.isEmpty()).toBe(true)
    })

    it('transfers back stack to front stack on dequeue', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
    })
  })

  describe('peek', () => {
    it('returns the front element without removing it', () => {
      const q = new AugmentedQueue()
      q.enqueue(42)
      expect(q.peek()).toBe(42)
      expect(q.size()).toBe(1)
    })

    it('returns the first enqueued element', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.peek()).toBe(1)
    })

    it('updates after dequeue', () => {
      const q = new AugmentedQueue()
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      q.dequeue()
      expect(q.peek()).toBe(20)
    })

    it('works after back-to-front transfer', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.dequeue()
      expect(q.peek()).toBe(3)
    })

    it('throws when peeking empty queue', () => {
      const q = new AugmentedQueue()
      expect(() => q.peek()).toThrow('AugmentedQueue is empty')
    })

    it('returns front stack top when front stack has elements', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.enqueue(4)
      expect(q.peek()).toBe(2)
    })
  })

  describe('peekBack', () => {
    it('returns the last enqueued element', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.peekBack()).toBe(3)
    })

    it('does not remove the element', () => {
      const q = new AugmentedQueue()
      q.enqueue(99)
      expect(q.peekBack()).toBe(99)
      expect(q.size()).toBe(1)
    })

    it('works with single element', () => {
      const q = new AugmentedQueue()
      q.enqueue(7)
      expect(q.peekBack()).toBe(7)
    })

    it('throws when peeking back of empty queue', () => {
      const q = new AugmentedQueue()
      expect(() => q.peekBack()).toThrow('AugmentedQueue is empty')
    })

    it('returns front stack bottom when back stack is empty', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      q.dequeue()
      q.enqueue(3)
      q.enqueue(4)
      q.dequeue()
      expect(q.peekBack()).toBe(4)
    })
  })

  describe('size', () => {
    it('returns 0 for empty queue', () => {
      const q = new AugmentedQueue()
      expect(q.size()).toBe(0)
    })

    it('returns correct size after enqueue', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      expect(q.size()).toBe(1)
      q.enqueue(2)
      expect(q.size()).toBe(2)
      q.enqueue(3)
      expect(q.size()).toBe(3)
    })

    it('returns correct size after dequeue', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.size()).toBe(1)
    })

    it('returns correct size after clear', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      expect(q.size()).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new queue', () => {
      const q = new AugmentedQueue()
      expect(q.isEmpty()).toBe(true)
    })

    it('returns false after enqueue', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      expect(q.isEmpty()).toBe(false)
    })

    it('returns true after dequeuing all elements', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.dequeue()
      expect(q.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.clear()
      expect(q.isEmpty()).toBe(true)
    })

    it('returns false after enqueue followed by dequeue then enqueue', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.dequeue()
      q.enqueue(2)
      expect(q.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('removes all elements', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.clear()
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('works on already empty queue', () => {
      const q = new AugmentedQueue()
      q.clear()
      expect(q.size()).toBe(0)
    })

    it('allows enqueue after clear', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.clear()
      q.enqueue(2)
      expect(q.size()).toBe(1)
      expect(q.peek()).toBe(2)
    })

    it('allows dequeue after clear and enqueue', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      q.enqueue(3)
      expect(q.dequeue()).toBe(3)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty queue', () => {
      const q = new AugmentedQueue()
      expect(q.toArray()).toEqual([])
    })

    it('returns elements in FIFO order', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('returns correct array after dequeue', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect(q.toArray()).toEqual([2, 3])
    })

    it('does not modify the queue', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.toArray()
      expect(q.size()).toBe(2)
      expect(q.peek()).toBe(1)
    })

    it('returns correct order after multiple enqueue/dequeue cycles', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      q.enqueue(3)
      q.enqueue(4)
      expect(q.toArray()).toEqual([2, 3, 4])
    })
  })

  describe('min', () => {
    it('returns the single element', () => {
      const q = new AugmentedQueue()
      q.enqueue(5)
      expect(q.min()).toBe(5)
    })

    it('returns the minimum of multiple elements', () => {
      const q = new AugmentedQueue()
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(7)
      expect(q.min()).toBe(3)
    })

    it('throws on empty queue', () => {
      const q = new AugmentedQueue()
      expect(() => q.min()).toThrow('AugmentedQueue is empty')
    })

    it('handles negative numbers', () => {
      const q = new AugmentedQueue()
      q.enqueue(-5)
      q.enqueue(3)
      q.enqueue(-10)
      expect(q.min()).toBe(-10)
    })

    it('updates after dequeue', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(5)
      q.enqueue(3)
      q.dequeue()
      expect(q.min()).toBe(3)
    })

    it('handles all same values', () => {
      const q = new AugmentedQueue()
      q.enqueue(7)
      q.enqueue(7)
      q.enqueue(7)
      expect(q.min()).toBe(7)
    })

    it('handles zero', () => {
      const q = new AugmentedQueue()
      q.enqueue(0)
      q.enqueue(-1)
      q.enqueue(1)
      expect(q.min()).toBe(-1)
    })

    it('works after back-to-front transfer', () => {
      const q = new AugmentedQueue()
      q.enqueue(10)
      q.enqueue(2)
      q.enqueue(5)
      q.dequeue()
      expect(q.min()).toBe(2)
    })
  })

  describe('max', () => {
    it('returns the single element', () => {
      const q = new AugmentedQueue()
      q.enqueue(5)
      expect(q.max()).toBe(5)
    })

    it('returns the maximum of multiple elements', () => {
      const q = new AugmentedQueue()
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(7)
      expect(q.max()).toBe(7)
    })

    it('throws on empty queue', () => {
      const q = new AugmentedQueue()
      expect(() => q.max()).toThrow('AugmentedQueue is empty')
    })

    it('handles negative numbers', () => {
      const q = new AugmentedQueue()
      q.enqueue(-5)
      q.enqueue(-3)
      q.enqueue(-10)
      expect(q.max()).toBe(-3)
    })

    it('updates after dequeue', () => {
      const q = new AugmentedQueue()
      q.enqueue(9)
      q.enqueue(5)
      q.enqueue(3)
      q.dequeue()
      expect(q.max()).toBe(5)
    })

    it('handles all same values', () => {
      const q = new AugmentedQueue()
      q.enqueue(4)
      q.enqueue(4)
      q.enqueue(4)
      expect(q.max()).toBe(4)
    })

    it('works after back-to-front transfer', () => {
      const q = new AugmentedQueue()
      q.enqueue(2)
      q.enqueue(10)
      q.enqueue(5)
      q.dequeue()
      expect(q.max()).toBe(10)
    })
  })

  describe('sum', () => {
    it('returns the single element', () => {
      const q = new AugmentedQueue()
      q.enqueue(5)
      expect(q.sum()).toBe(5)
    })

    it('returns the sum of multiple elements', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.sum()).toBe(6)
    })

    it('throws on empty queue', () => {
      const q = new AugmentedQueue()
      expect(() => q.sum()).toThrow('AugmentedQueue is empty')
    })

    it('handles negative numbers', () => {
      const q = new AugmentedQueue()
      q.enqueue(-5)
      q.enqueue(3)
      q.enqueue(-2)
      expect(q.sum()).toBe(-4)
    })

    it('updates after dequeue', () => {
      const q = new AugmentedQueue()
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      q.dequeue()
      expect(q.sum()).toBe(50)
    })

    it('handles zeros', () => {
      const q = new AugmentedQueue()
      q.enqueue(0)
      q.enqueue(0)
      q.enqueue(5)
      expect(q.sum()).toBe(5)
    })

    it('works after back-to-front transfer', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect(q.sum()).toBe(5)
    })

    it('handles sum of all same values', () => {
      const q = new AugmentedQueue()
      q.enqueue(3)
      q.enqueue(3)
      q.enqueue(3)
      expect(q.sum()).toBe(9)
    })
  })

  describe('average', () => {
    it('returns the single element', () => {
      const q = new AugmentedQueue()
      q.enqueue(5)
      expect(q.average()).toBe(5)
    })

    it('returns correct average of multiple elements', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.average()).toBe(2)
    })

    it('throws on empty queue', () => {
      const q = new AugmentedQueue()
      expect(() => q.average()).toThrow('AugmentedQueue is empty')
    })

    it('handles fractional averages', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      expect(q.average()).toBe(1.5)
    })

    it('handles negative numbers', () => {
      const q = new AugmentedQueue()
      q.enqueue(-4)
      q.enqueue(4)
      expect(q.average()).toBe(0)
    })

    it('updates after dequeue', () => {
      const q = new AugmentedQueue()
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      q.dequeue()
      expect(q.average()).toBe(25)
    })

    it('handles large number of elements', () => {
      const q = new AugmentedQueue()
      for (let i = 1; i <= 100; i++) {
        q.enqueue(i)
      }
      expect(q.average()).toBe(50.5)
    })
  })

  describe('clone', () => {
    it('creates an independent copy', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const cloned = q.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3])
      expect(cloned.size()).toBe(3)
    })

    it('modifications to clone do not affect original', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      const cloned = q.clone()
      cloned.enqueue(3)
      expect(q.size()).toBe(2)
      expect(cloned.size()).toBe(3)
    })

    it('modifications to original do not affect clone', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      const cloned = q.clone()
      q.dequeue()
      expect(q.size()).toBe(1)
      expect(cloned.size()).toBe(2)
    })

    it('clones an empty queue', () => {
      const q = new AugmentedQueue()
      const cloned = q.clone()
      expect(cloned.isEmpty()).toBe(true)
      expect(cloned.size()).toBe(0)
    })

    it('clones aggregate stats correctly', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(5)
      q.enqueue(3)
      const cloned = q.clone()
      expect(cloned.min()).toBe(1)
      expect(cloned.max()).toBe(5)
      expect(cloned.sum()).toBe(9)
      expect(cloned.average()).toBe(3)
    })

    it('clone of clone works', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      const cloned = q.clone()
      const cloned2 = cloned.clone()
      expect(cloned2.toArray()).toEqual([1, 2])
    })

    it('clone after dequeue preserves state', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      const cloned = q.clone()
      expect(cloned.toArray()).toEqual([2, 3])
      expect(cloned.min()).toBe(2)
      expect(cloned.sum()).toBe(5)
    })
  })

  describe('forEach', () => {
    it('iterates over all elements in order', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const result: number[] = []
      q.forEach((item) => result.push(item))
      expect(result).toEqual([1, 2, 3])
    })

    it('provides correct indices', () => {
      const q = new AugmentedQueue()
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      const indices: number[] = []
      q.forEach((_item, index) => indices.push(index))
      expect(indices).toEqual([0, 1, 2])
    })

    it('does nothing on empty queue', () => {
      const q = new AugmentedQueue()
      let count = 0
      q.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('works after dequeue', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      const result: number[] = []
      q.forEach((item) => result.push(item))
      expect(result).toEqual([2, 3])
    })

    it('works with single element', () => {
      const q = new AugmentedQueue()
      q.enqueue(42)
      const result: number[] = []
      q.forEach((item) => result.push(item))
      expect(result).toEqual([42])
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates over all elements in FIFO order', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect([...q]).toEqual([1, 2, 3])
    })

    it('returns empty array for empty queue', () => {
      const q = new AugmentedQueue()
      expect([...q]).toEqual([])
    })

    it('works with for...of loop', () => {
      const q = new AugmentedQueue()
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      const result: number[] = []
      for (const item of q) {
        result.push(item)
      }
      expect(result).toEqual([10, 20, 30])
    })

    it('works with Array.from', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(Array.from(q)).toEqual([1, 2, 3])
    })

    it('works after dequeue', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect([...q]).toEqual([2, 3])
    })
  })

  describe('fromArray', () => {
    it('creates a queue from an array', () => {
      const q = AugmentedQueue.fromArray([1, 2, 3])
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('creates an empty queue from empty array', () => {
      const q = AugmentedQueue.fromArray([])
      expect(q.isEmpty()).toBe(true)
    })

    it('preserves order', () => {
      const q = AugmentedQueue.fromArray([5, 4, 3, 2, 1])
      expect(q.dequeue()).toBe(5)
      expect(q.dequeue()).toBe(4)
    })

    it('aggregate stats are correct', () => {
      const q = AugmentedQueue.fromArray([3, 1, 4, 1, 5])
      expect(q.min()).toBe(1)
      expect(q.max()).toBe(5)
      expect(q.sum()).toBe(14)
      expect(q.average()).toBe(2.8)
    })

    it('single element array', () => {
      const q = AugmentedQueue.fromArray([42])
      expect(q.size()).toBe(1)
      expect(q.peek()).toBe(42)
      expect(q.peekBack()).toBe(42)
    })

    it('supports further enqueue after creation', () => {
      const q = AugmentedQueue.fromArray([1, 2])
      q.enqueue(3)
      expect(q.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('edge cases', () => {
    it('handles single element lifecycle', () => {
      const q = new AugmentedQueue()
      q.enqueue(42)
      expect(q.peek()).toBe(42)
      expect(q.peekBack()).toBe(42)
      expect(q.size()).toBe(1)
      expect(q.isEmpty()).toBe(false)
      expect(q.min()).toBe(42)
      expect(q.max()).toBe(42)
      expect(q.sum()).toBe(42)
      expect(q.average()).toBe(42)
      expect(q.dequeue()).toBe(42)
      expect(q.isEmpty()).toBe(true)
    })

    it('handles all same values', () => {
      const q = new AugmentedQueue()
      for (let i = 0; i < 5; i++) {
        q.enqueue(7)
      }
      expect(q.min()).toBe(7)
      expect(q.max()).toBe(7)
      expect(q.sum()).toBe(35)
      expect(q.average()).toBe(7)
    })

    it('handles all negative numbers', () => {
      const q = new AugmentedQueue()
      q.enqueue(-1)
      q.enqueue(-5)
      q.enqueue(-3)
      expect(q.min()).toBe(-5)
      expect(q.max()).toBe(-1)
      expect(q.sum()).toBe(-9)
      expect(q.average()).toBe(-3)
    })

    it('handles large queue operations', () => {
      const q = new AugmentedQueue()
      for (let i = 0; i < 1000; i++) {
        q.enqueue(i)
      }
      expect(q.size()).toBe(1000)
      expect(q.min()).toBe(0)
      expect(q.max()).toBe(999)
      for (let i = 0; i < 500; i++) {
        expect(q.dequeue()).toBe(i)
      }
      expect(q.size()).toBe(500)
      expect(q.min()).toBe(500)
      expect(q.max()).toBe(999)
    })

    it('aggregate stats correct after many enqueue/dequeue cycles', () => {
      const q = new AugmentedQueue()
      for (let i = 1; i <= 100; i++) {
        q.enqueue(i)
      }
      for (let i = 1; i <= 50; i++) {
        q.dequeue()
      }
      expect(q.toArray()).toEqual(
        Array.from({ length: 50 }, (_, i) => i + 51),
      )
      expect(q.min()).toBe(51)
      expect(q.max()).toBe(100)
      expect(q.sum()).toBe(51 + 52 + 53 + 54 + 55 + 56 + 57 + 58 + 59 + 60 + 61 + 62 + 63 + 64 + 65 + 66 + 67 + 68 + 69 + 70 + 71 + 72 + 73 + 74 + 75 + 76 + 77 + 78 + 79 + 80 + 81 + 82 + 83 + 84 + 85 + 86 + 87 + 88 + 89 + 90 + 91 + 92 + 93 + 94 + 95 + 96 + 97 + 98 + 99 + 100)
    })

    it('handles mixed positive and negative numbers', () => {
      const q = new AugmentedQueue()
      q.enqueue(-10)
      q.enqueue(20)
      q.enqueue(-30)
      q.enqueue(40)
      expect(q.min()).toBe(-30)
      expect(q.max()).toBe(40)
      expect(q.sum()).toBe(20)
    })

    it('aggregate correctness with interleaved operations', () => {
      const q = new AugmentedQueue()
      q.enqueue(5)
      q.enqueue(3)
      expect(q.min()).toBe(3)
      expect(q.max()).toBe(5)
      expect(q.sum()).toBe(8)

      q.dequeue()
      expect(q.min()).toBe(3)
      expect(q.max()).toBe(3)
      expect(q.sum()).toBe(3)

      q.enqueue(7)
      q.enqueue(1)
      expect(q.min()).toBe(1)
      expect(q.max()).toBe(7)
      expect(q.sum()).toBe(11)

      q.dequeue()
      expect(q.min()).toBe(1)
      expect(q.max()).toBe(7)
      expect(q.sum()).toBe(8)
    })

    it('handles enqueue after full drain', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      q.dequeue()
      expect(q.isEmpty()).toBe(true)
      q.enqueue(3)
      expect(q.size()).toBe(1)
      expect(q.peek()).toBe(3)
      expect(q.min()).toBe(3)
      expect(q.max()).toBe(3)
    })

    it('handles clear and reuse', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.clear()
      q.enqueue(10)
      q.enqueue(20)
      expect(q.toArray()).toEqual([10, 20])
      expect(q.min()).toBe(10)
      expect(q.max()).toBe(20)
      expect(q.sum()).toBe(30)
    })

    it('handles floating point numbers', () => {
      const q = new AugmentedQueue()
      q.enqueue(0.1)
      q.enqueue(0.2)
      q.enqueue(0.3)
      expect(q.sum()).toBeCloseTo(0.6)
      expect(q.average()).toBeCloseTo(0.2)
    })

    it('min and max update correctly when min/max is dequeued', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(5)
      q.enqueue(3)
      expect(q.min()).toBe(1)
      q.dequeue()
      expect(q.min()).toBe(3)
      expect(q.max()).toBe(5)
    })

    it('handles descending sequence', () => {
      const q = new AugmentedQueue()
      for (let i = 10; i >= 1; i--) {
        q.enqueue(i)
      }
      expect(q.peek()).toBe(10)
      expect(q.peekBack()).toBe(1)
      expect(q.min()).toBe(1)
      expect(q.max()).toBe(10)
      expect(q.sum()).toBe(55)
    })

    it('handles ascending sequence', () => {
      const q = new AugmentedQueue()
      for (let i = 1; i <= 10; i++) {
        q.enqueue(i)
      }
      expect(q.peek()).toBe(1)
      expect(q.peekBack()).toBe(10)
      expect(q.min()).toBe(1)
      expect(q.max()).toBe(10)
      expect(q.sum()).toBe(55)
    })

    it('clone after partial dequeue preserves correct aggregates', () => {
      const q = new AugmentedQueue()
      q.enqueue(10)
      q.enqueue(2)
      q.enqueue(8)
      q.enqueue(4)
      q.enqueue(6)
      q.dequeue()
      q.dequeue()
      const cloned = q.clone()
      expect(cloned.toArray()).toEqual([8, 4, 6])
      expect(cloned.min()).toBe(4)
      expect(cloned.max()).toBe(8)
      expect(cloned.sum()).toBe(18)
      expect(cloned.average()).toBe(6)
    })

    it('forEach after dequeue visits correct elements', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.dequeue()
      const collected: Array<{ item: number; index: number }> = []
      q.forEach((item, index) => collected.push({ item, index }))
      expect(collected).toEqual([
        { item: 2, index: 0 },
        { item: 3, index: 1 },
        { item: 4, index: 2 },
      ])
    })

    it('iterator after dequeue yields correct elements', () => {
      const q = new AugmentedQueue()
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      q.dequeue()
      q.enqueue(40)
      expect([...q]).toEqual([20, 30, 40])
    })

    it('toArray after complex operations', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      q.dequeue()
      q.dequeue()
      q.enqueue(6)
      q.enqueue(7)
      expect(q.toArray()).toEqual([3, 4, 5, 6, 7])
    })

    it('aggregate stats after complex enqueue/dequeue pattern', () => {
      const q = new AugmentedQueue()
      q.enqueue(5)
      q.enqueue(10)
      q.enqueue(3)
      q.enqueue(8)
      q.dequeue()
      q.enqueue(1)
      q.enqueue(12)
      q.dequeue()
      q.enqueue(7)
      expect(q.toArray()).toEqual([3, 8, 1, 12, 7])
      expect(q.min()).toBe(1)
      expect(q.max()).toBe(12)
      expect(q.sum()).toBe(31)
    })

    it('fromArray with negative numbers', () => {
      const q = AugmentedQueue.fromArray([-5, -3, -8, -1])
      expect(q.min()).toBe(-8)
      expect(q.max()).toBe(-1)
      expect(q.sum()).toBe(-17)
    })

    it('fromArray with large array', () => {
      const arr = Array.from({ length: 500 }, (_, i) => i + 1)
      const q = AugmentedQueue.fromArray(arr)
      expect(q.size()).toBe(500)
      expect(q.min()).toBe(1)
      expect(q.max()).toBe(500)
      expect(q.sum()).toBe((500 * 501) / 2)
    })

    it('constructor with options preserves order', () => {
      const q = new AugmentedQueue({ elements: [3, 1, 4, 1, 5, 9] })
      expect(q.toArray()).toEqual([3, 1, 4, 1, 5, 9])
      expect(q.peek()).toBe(3)
      expect(q.peekBack()).toBe(9)
    })

    it('throws on all aggregate operations on empty queue', () => {
      const q = new AugmentedQueue()
      expect(() => q.min()).toThrow('AugmentedQueue is empty')
      expect(() => q.max()).toThrow('AugmentedQueue is empty')
      expect(() => q.sum()).toThrow('AugmentedQueue is empty')
      expect(() => q.average()).toThrow('AugmentedQueue is empty')
      expect(() => q.peek()).toThrow('AugmentedQueue is empty')
      expect(() => q.peekBack()).toThrow('AugmentedQueue is empty')
      expect(() => q.dequeue()).toThrow('AugmentedQueue is empty')
    })

    it('handles repeated clear and fill', () => {
      const q = new AugmentedQueue()
      for (let round = 0; round < 5; round++) {
        q.clear()
        for (let i = 1; i <= 10; i++) {
          q.enqueue(i * (round + 1))
        }
        expect(q.size()).toBe(10)
        expect(q.sum()).toBe(55 * (round + 1))
      }
    })

    it('min/max after removing all but one element', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.dequeue()
      expect(q.size()).toBe(1)
      expect(q.min()).toBe(3)
      expect(q.max()).toBe(3)
      expect(q.sum()).toBe(3)
    })

    it('multiple dequeues trigger multiple transfers', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.dequeue()).toBe(1)
      q.enqueue(5)
      q.enqueue(6)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
      expect(q.toArray()).toEqual([4, 5, 6])
      expect(q.min()).toBe(4)
      expect(q.max()).toBe(6)
      expect(q.sum()).toBe(15)
    })

    it('average of two elements', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(99)
      expect(q.average()).toBe(50)
    })

    it('average updates correctly after dequeue', () => {
      const q = new AugmentedQueue()
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      q.dequeue()
      expect(q.average()).toBe(25)
    })

    it('sum of empty after clear throws', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.clear()
      expect(() => q.sum()).toThrow('AugmentedQueue is empty')
    })

    it('clone after clear is empty', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      const cloned = q.clone()
      expect(cloned.isEmpty()).toBe(true)
      expect(cloned.size()).toBe(0)
    })

    it('dequeue all then fromArray reuses queue', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      q.dequeue()
      const q2 = AugmentedQueue.fromArray([10, 20, 30])
      expect(q2.size()).toBe(3)
      expect(q2.dequeue()).toBe(10)
      expect(q2.sum()).toBe(50)
    })

    it('fromArray with duplicates', () => {
      const q = AugmentedQueue.fromArray([5, 5, 5, 5])
      expect(q.min()).toBe(5)
      expect(q.max()).toBe(5)
      expect(q.sum()).toBe(20)
      expect(q.average()).toBe(5)
    })

    it('handles very small floating point', () => {
      const q = new AugmentedQueue()
      q.enqueue(0.0001)
      q.enqueue(0.0002)
      q.enqueue(0.0003)
      expect(q.sum()).toBeCloseTo(0.0006)
    })

    it('toArray returns new array each time', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      const arr1 = q.toArray()
      const arr2 = q.toArray()
      expect(arr1).toEqual(arr2)
      expect(arr1).not.toBe(arr2)
    })

    it('forEach with early mutation does not affect iteration', () => {
      const q = new AugmentedQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const result: number[] = []
      q.forEach((item) => {
        result.push(item)
      })
      expect(result).toEqual([1, 2, 3])
    })

    it('handles enqueue dequeue round trip preserving order', () => {
      const q = new AugmentedQueue()
      for (let i = 0; i < 50; i++) {
        q.enqueue(i)
      }
      const result: number[] = []
      while (!q.isEmpty()) {
        result.push(q.dequeue())
      }
      expect(result).toEqual(Array.from({ length: 50 }, (_, i) => i))
    })
  })
})
