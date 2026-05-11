import { describe, it, expect } from 'vitest'
import { BoundedPriorityQueue } from '../../src/core/bounded-pq/index.js'
import type { Comparator } from '../../src/core/bounded-pq/types.js'

const reverseComparator: Comparator<number> = (a, b) => b - a
const stringComparator: Comparator<string> = (a, b) => a.localeCompare(b)
const absComparator: Comparator<number> = (a, b) => Math.abs(a) - Math.abs(b)

describe('BoundedPriorityQueue', () => {
  describe('constructor', () => {
    it('creates queue with capacity 1', () => {
      const pq = new BoundedPriorityQueue<number>(1)
      expect(pq.capacity).toBe(1)
      expect(pq.size).toBe(0)
      expect(pq.isEmpty).toBe(true)
    })

    it('creates queue with capacity 10', () => {
      const pq = new BoundedPriorityQueue<number>(10)
      expect(pq.capacity).toBe(10)
      expect(pq.size).toBe(0)
    })

    it('creates queue with capacity 100', () => {
      const pq = new BoundedPriorityQueue<number>(100)
      expect(pq.capacity).toBe(100)
    })

    it('creates queue with custom comparator', () => {
      const pq = new BoundedPriorityQueue<number>(5, { comparator: reverseComparator })
      expect(pq.capacity).toBe(5)
    })

    it('creates queue with empty options', () => {
      const pq = new BoundedPriorityQueue<number>(5, {})
      expect(pq.capacity).toBe(5)
    })

    it('throws on capacity 0', () => {
      expect(() => new BoundedPriorityQueue<number>(0)).toThrow('capacity must be a positive integer')
    })

    it('throws on negative capacity', () => {
      expect(() => new BoundedPriorityQueue<number>(-1)).toThrow('capacity must be a positive integer')
    })

    it('throws on non-integer capacity', () => {
      expect(() => new BoundedPriorityQueue<number>(1.5)).toThrow('capacity must be a positive integer')
    })

    it('throws on NaN capacity', () => {
      expect(() => new BoundedPriorityQueue<number>(NaN)).toThrow('capacity must be a positive integer')
    })

    it('creates queue with capacity 2', () => {
      const pq = new BoundedPriorityQueue<number>(2)
      expect(pq.capacity).toBe(2)
      expect(pq.isEmpty).toBe(true)
      expect(pq.isFull).toBe(false)
    })

    it('accepts undefined options', () => {
      const pq = new BoundedPriorityQueue<number>(3, undefined)
      expect(pq.capacity).toBe(3)
    })
  })

  describe('enqueue / push', () => {
    it('enqueue adds element to empty queue', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      const evicted = pq.enqueue(10)
      expect(evicted).toBeUndefined()
      expect(pq.size).toBe(1)
    })

    it('push adds element to empty queue', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      const evicted = pq.push(10)
      expect(evicted).toBeUndefined()
      expect(pq.size).toBe(1)
    })

    it('enqueue and push are aliases', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.enqueue(1)
      pq.push(2)
      expect(pq.size).toBe(2)
    })

    it('maintains min-heap property', () => {
      const pq = new BoundedPriorityQueue<number>(10)
      pq.push(5)
      pq.push(3)
      pq.push(7)
      pq.push(1)
      pq.push(4)
      expect(pq.peek()).toBe(1)
    })

    it('returns undefined when not full', () => {
      const pq = new BoundedPriorityQueue<number>(3)
      expect(pq.push(1)).toBeUndefined()
      expect(pq.push(2)).toBeUndefined()
      expect(pq.push(3)).toBeUndefined()
    })

    it('adds elements until full', () => {
      const pq = new BoundedPriorityQueue<number>(3)
      pq.push(1)
      pq.push(2)
      pq.push(3)
      expect(pq.isFull).toBe(true)
      expect(pq.size).toBe(3)
    })

    it('inserts duplicate values', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(1)
      pq.push(1)
      expect(pq.size).toBe(2)
    })

    it('inserts negative numbers', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(-5)
      pq.push(-10)
      pq.push(-1)
      expect(pq.peek()).toBe(-10)
    })

    it('inserts zero', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(0)
      pq.push(1)
      pq.push(-1)
      expect(pq.peek()).toBe(-1)
    })

    it('handles floating point numbers', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(3.14)
      pq.push(1.41)
      pq.push(2.72)
      expect(pq.peek()).toBeCloseTo(1.41)
    })

    it('handles string values', () => {
      const pq = new BoundedPriorityQueue<string>(5)
      pq.push('cherry')
      pq.push('apple')
      pq.push('banana')
      expect(pq.peek()).toBe('apple')
    })

    it('inserts many elements without exceeding capacity', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      for (let i = 0; i < 100; i++) {
        pq.push(i)
      }
      expect(pq.size).toBe(5)
    })
  })

  describe('eviction when full', () => {
    it('evicts lowest priority element when inserting higher priority', () => {
      const pq = new BoundedPriorityQueue<number>(3)
      pq.push(1)
      pq.push(2)
      pq.push(3)
      const evicted = pq.push(10)
      expect(evicted).toBe(1)
      expect(pq.size).toBe(3)
    })

    it('returns inserted value when it is not higher priority', () => {
      const pq = new BoundedPriorityQueue<number>(3)
      pq.push(5)
      pq.push(10)
      pq.push(15)
      const evicted = pq.push(1)
      expect(evicted).toBe(1)
      expect(pq.size).toBe(3)
    })

    it('returns inserted value equal to minimum', () => {
      const pq = new BoundedPriorityQueue<number>(3)
      pq.push(1)
      pq.push(5)
      pq.push(10)
      const evicted = pq.push(1)
      expect(evicted).toBe(1)
    })

    it('evicts and keeps higher priority elements', () => {
      const pq = new BoundedPriorityQueue<number>(3)
      pq.push(1)
      pq.push(2)
      pq.push(3)
      pq.push(10)
      expect(pq.toArray()).toEqual([2, 3, 10])
    })

    it('multiple evictions in sequence', () => {
      const pq = new BoundedPriorityQueue<number>(2)
      pq.push(1)
      pq.push(2)
      expect(pq.push(3)).toBe(1)
      expect(pq.push(4)).toBe(2)
      expect(pq.push(5)).toBe(3)
      expect(pq.toArray()).toEqual([4, 5])
    })

    it('eviction with capacity 1', () => {
      const pq = new BoundedPriorityQueue<number>(1)
      pq.push(5)
      expect(pq.push(10)).toBe(5)
      expect(pq.peek()).toBe(10)
      expect(pq.size).toBe(1)
    })

    it('capacity 1 keeps higher priority', () => {
      const pq = new BoundedPriorityQueue<number>(1)
      pq.push(10)
      expect(pq.push(5)).toBe(5)
      expect(pq.peek()).toBe(10)
    })

    it('eviction tracks top N elements from stream', () => {
      const pq = new BoundedPriorityQueue<number>(3)
      for (let i = 0; i < 100; i++) {
        pq.push(i)
      }
      expect(pq.toArray()).toEqual([97, 98, 99])
    })

    it('eviction with reverse comparator keeps bottom N', () => {
      const pq = new BoundedPriorityQueue<number>(3, { comparator: reverseComparator })
      for (let i = 0; i < 100; i++) {
        pq.push(i)
      }
      expect(pq.toArray()).toEqual([2, 1, 0])
    })

    it('evicts correctly with duplicate priorities', () => {
      const pq = new BoundedPriorityQueue<number>(2)
      pq.push(5)
      pq.push(5)
      expect(pq.push(10)).toBe(5)
      expect(pq.size).toBe(2)
    })

    it('keeps order stable with equal elements', () => {
      const pq = new BoundedPriorityQueue<number>(3)
      pq.push(5)
      pq.push(5)
      pq.push(5)
      expect(pq.push(6)).toBe(5)
      expect(pq.size).toBe(3)
    })
  })

  describe('dequeue / pop', () => {
    it('throws on empty queue', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      expect(() => pq.pop()).toThrow('pop called on empty queue')
    })

    it('dequeue throws on empty queue', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      expect(() => pq.dequeue()).toThrow('pop called on empty queue')
    })

    it('pops minimum element', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(5)
      pq.push(3)
      pq.push(1)
      expect(pq.pop()).toBe(1)
    })

    it('dequeue is alias for pop', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(5)
      pq.push(3)
      expect(pq.dequeue()).toBe(3)
    })

    it('pops elements in sorted order', () => {
      const pq = new BoundedPriorityQueue<number>(10)
      pq.push(5)
      pq.push(3)
      pq.push(1)
      pq.push(4)
      pq.push(2)
      const result: number[] = []
      while (!pq.isEmpty) {
        result.push(pq.pop())
      }
      expect(result).toEqual([1, 2, 3, 4, 5])
    })

    it('updates size after pop', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(1)
      pq.push(2)
      pq.push(3)
      expect(pq.size).toBe(3)
      pq.pop()
      expect(pq.size).toBe(2)
      pq.pop()
      expect(pq.size).toBe(1)
      pq.pop()
      expect(pq.size).toBe(0)
    })

    it('pops from single element queue', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(42)
      expect(pq.pop()).toBe(42)
      expect(pq.isEmpty).toBe(true)
    })

    it('pops duplicate values correctly', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(2)
      pq.push(1)
      pq.push(2)
      pq.push(1)
      expect(pq.pop()).toBe(1)
      expect(pq.pop()).toBe(1)
      expect(pq.pop()).toBe(2)
      expect(pq.pop()).toBe(2)
    })

    it('pops from large queue in order', () => {
      const pq = new BoundedPriorityQueue<number>(100)
      for (let i = 50; i >= 0; i--) {
        pq.push(i)
      }
      for (let i = 0; i <= 50; i++) {
        expect(pq.pop()).toBe(i)
      }
    })

    it('pop after eviction', () => {
      const pq = new BoundedPriorityQueue<number>(2)
      pq.push(1)
      pq.push(2)
      pq.push(3)
      expect(pq.pop()).toBe(2)
      expect(pq.pop()).toBe(3)
    })

    it('allows push after pop empties queue', () => {
      const pq = new BoundedPriorityQueue<number>(3)
      pq.push(1)
      pq.pop()
      expect(pq.isEmpty).toBe(true)
      pq.push(10)
      expect(pq.peek()).toBe(10)
    })
  })

  describe('peek', () => {
    it('throws on empty queue', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      expect(() => pq.peek()).toThrow('peek called on empty queue')
    })

    it('returns minimum element', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(5)
      pq.push(3)
      pq.push(1)
      expect(pq.peek()).toBe(1)
    })

    it('does not remove element', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(1)
      pq.push(2)
      pq.peek()
      expect(pq.size).toBe(2)
      expect(pq.peek()).toBe(1)
    })

    it('returns updated min after pop', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(1)
      pq.push(2)
      pq.push(3)
      pq.pop()
      expect(pq.peek()).toBe(2)
    })

    it('returns updated min after push of smaller element', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(5)
      pq.push(10)
      pq.push(1)
      expect(pq.peek()).toBe(1)
    })

    it('returns same min after push of larger element when not full', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(1)
      pq.push(100)
      expect(pq.peek()).toBe(1)
    })

    it('returns new min after eviction replaced old min', () => {
      const pq = new BoundedPriorityQueue<number>(2)
      pq.push(1)
      pq.push(2)
      pq.push(10)
      expect(pq.peek()).toBe(2)
    })
  })

  describe('size', () => {
    it('returns 0 for empty queue', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      expect(pq.size).toBe(0)
    })

    it('returns correct size after pushes', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(1)
      expect(pq.size).toBe(1)
      pq.push(2)
      expect(pq.size).toBe(2)
      pq.push(3)
      expect(pq.size).toBe(3)
    })

    it('returns correct size after pops', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(1)
      pq.push(2)
      pq.push(3)
      pq.pop()
      expect(pq.size).toBe(2)
      pq.pop()
      expect(pq.size).toBe(1)
    })

    it('returns 0 after clear', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(1)
      pq.push(2)
      pq.clear()
      expect(pq.size).toBe(0)
    })

    it('size never exceeds capacity', () => {
      const pq = new BoundedPriorityQueue<number>(3)
      pq.push(1)
      pq.push(2)
      pq.push(3)
      pq.push(4)
      pq.push(5)
      expect(pq.size).toBe(3)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new queue', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      expect(pq.isEmpty).toBe(true)
    })

    it('returns false after push', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(1)
      expect(pq.isEmpty).toBe(false)
    })

    it('returns true after popping all elements', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(1)
      pq.push(2)
      pq.pop()
      pq.pop()
      expect(pq.isEmpty).toBe(true)
    })

    it('returns true after clear', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(1)
      pq.clear()
      expect(pq.isEmpty).toBe(true)
    })

    it('returns false after clear and push', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(1)
      pq.clear()
      pq.push(1)
      expect(pq.isEmpty).toBe(false)
    })
  })

  describe('isFull', () => {
    it('returns false for empty queue', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      expect(pq.isFull).toBe(false)
    })

    it('returns false when partially full', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(1)
      pq.push(2)
      expect(pq.isFull).toBe(false)
    })

    it('returns true when full', () => {
      const pq = new BoundedPriorityQueue<number>(3)
      pq.push(1)
      pq.push(2)
      pq.push(3)
      expect(pq.isFull).toBe(true)
    })

    it('stays full after eviction push', () => {
      const pq = new BoundedPriorityQueue<number>(3)
      pq.push(1)
      pq.push(2)
      pq.push(3)
      pq.push(10)
      expect(pq.isFull).toBe(true)
    })

    it('returns false after pop from full queue', () => {
      const pq = new BoundedPriorityQueue<number>(3)
      pq.push(1)
      pq.push(2)
      pq.push(3)
      pq.pop()
      expect(pq.isFull).toBe(false)
    })

    it('returns false after clear', () => {
      const pq = new BoundedPriorityQueue<number>(3)
      pq.push(1)
      pq.push(2)
      pq.push(3)
      pq.clear()
      expect(pq.isFull).toBe(false)
    })

    it('capacity 1 is full after one push', () => {
      const pq = new BoundedPriorityQueue<number>(1)
      pq.push(1)
      expect(pq.isFull).toBe(true)
    })
  })

  describe('capacity', () => {
    it('returns the configured capacity', () => {
      const pq = new BoundedPriorityQueue<number>(42)
      expect(pq.capacity).toBe(42)
    })

    it('capacity is immutable', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(1)
      pq.push(2)
      pq.push(3)
      pq.push(4)
      pq.push(5)
      pq.push(6)
      expect(pq.capacity).toBe(5)
    })

    it('capacity 1', () => {
      const pq = new BoundedPriorityQueue<number>(1)
      expect(pq.capacity).toBe(1)
    })

    it('large capacity', () => {
      const pq = new BoundedPriorityQueue<number>(10000)
      expect(pq.capacity).toBe(10000)
    })
  })

  describe('clear', () => {
    it('clears empty queue without error', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.clear()
      expect(pq.size).toBe(0)
      expect(pq.isEmpty).toBe(true)
    })

    it('clears non-empty queue', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(1)
      pq.push(2)
      pq.push(3)
      pq.clear()
      expect(pq.size).toBe(0)
      expect(pq.isEmpty).toBe(true)
    })

    it('allows operations after clear', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(1)
      pq.clear()
      pq.push(10)
      expect(pq.size).toBe(1)
      expect(pq.peek()).toBe(10)
    })

    it('clears full queue', () => {
      const pq = new BoundedPriorityQueue<number>(3)
      pq.push(1)
      pq.push(2)
      pq.push(3)
      pq.clear()
      expect(pq.isFull).toBe(false)
      expect(pq.isEmpty).toBe(true)
    })

    it('double clear is safe', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(1)
      pq.clear()
      pq.clear()
      expect(pq.size).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty queue', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      expect(pq.toArray()).toEqual([])
    })

    it('returns single element', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(42)
      expect(pq.toArray()).toEqual([42])
    })

    it('returns elements in sorted order', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(5)
      pq.push(3)
      pq.push(1)
      pq.push(4)
      pq.push(2)
      expect(pq.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('does not modify the queue', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(3)
      pq.push(1)
      pq.push(2)
      pq.toArray()
      expect(pq.size).toBe(3)
      expect(pq.peek()).toBe(1)
    })

    it('handles duplicates', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(3)
      pq.push(1)
      pq.push(3)
      pq.push(1)
      pq.push(2)
      expect(pq.toArray()).toEqual([1, 1, 2, 3, 3])
    })

    it('returns at most capacity elements', () => {
      const pq = new BoundedPriorityQueue<number>(3)
      for (let i = 0; i < 100; i++) pq.push(i)
      expect(pq.toArray()).toEqual([97, 98, 99])
    })

    it('handles string elements', () => {
      const pq = new BoundedPriorityQueue<string>(5)
      pq.push('cherry')
      pq.push('apple')
      pq.push('banana')
      expect(pq.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  describe('contains', () => {
    it('returns false for empty queue', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      expect(pq.contains(1)).toBe(false)
    })

    it('returns true for element in queue', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(5)
      pq.push(3)
      pq.push(1)
      expect(pq.contains(3)).toBe(true)
    })

    it('returns true for peek element', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(1)
      expect(pq.contains(1)).toBe(true)
    })

    it('returns false for element not in queue', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(1)
      pq.push(3)
      pq.push(5)
      expect(pq.contains(4)).toBe(false)
    })

    it('returns false after eviction', () => {
      const pq = new BoundedPriorityQueue<number>(2)
      pq.push(1)
      pq.push(2)
      pq.push(10)
      expect(pq.contains(1)).toBe(false)
      expect(pq.contains(2)).toBe(true)
      expect(pq.contains(10)).toBe(true)
    })

    it('returns false after clear', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(5)
      pq.clear()
      expect(pq.contains(5)).toBe(false)
    })

    it('returns false after pop', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(1)
      pq.push(2)
      pq.pop()
      expect(pq.contains(1)).toBe(false)
    })

    it('handles duplicate values', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(1)
      pq.push(1)
      pq.pop()
      expect(pq.contains(1)).toBe(true)
    })

    it('works with string values', () => {
      const pq = new BoundedPriorityQueue<string>(5)
      pq.push('hello')
      expect(pq.contains('hello')).toBe(true)
      expect(pq.contains('world')).toBe(false)
    })
  })

  describe('merge', () => {
    it('merges into empty queue', () => {
      const a = new BoundedPriorityQueue<number>(10)
      const b = new BoundedPriorityQueue<number>(10)
      b.push(1)
      b.push(2)
      b.push(3)
      a.merge(b)
      expect(a.size).toBe(3)
      expect(a.peek()).toBe(1)
    })

    it('merges empty into non-empty', () => {
      const a = new BoundedPriorityQueue<number>(10)
      a.push(1)
      const b = new BoundedPriorityQueue<number>(10)
      a.merge(b)
      expect(a.size).toBe(1)
      expect(a.peek()).toBe(1)
    })

    it('merges two non-empty queues', () => {
      const a = new BoundedPriorityQueue<number>(10)
      a.push(1)
      a.push(3)
      a.push(5)
      const b = new BoundedPriorityQueue<number>(10)
      b.push(2)
      b.push(4)
      b.push(6)
      a.merge(b)
      expect(a.size).toBe(6)
      expect(a.toArray()).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('merge respects capacity of target', () => {
      const a = new BoundedPriorityQueue<number>(3)
      a.push(1)
      a.push(2)
      const b = new BoundedPriorityQueue<number>(10)
      b.push(5)
      b.push(10)
      b.push(15)
      a.merge(b)
      expect(a.size).toBe(3)
      expect(a.toArray()).toEqual([5, 10, 15])
    })

    it('is destructive for source queue', () => {
      const a = new BoundedPriorityQueue<number>(10)
      a.push(1)
      const b = new BoundedPriorityQueue<number>(10)
      b.push(2)
      a.merge(b)
      expect(b.size).toBe(0)
      expect(b.isEmpty).toBe(true)
    })

    it('handles merging with itself (no-op)', () => {
      const a = new BoundedPriorityQueue<number>(5)
      a.push(1)
      a.push(2)
      a.merge(a)
      expect(a.size).toBe(2)
    })

    it('merge followed by pop produces correct order', () => {
      const a = new BoundedPriorityQueue<number>(10)
      a.push(4)
      a.push(1)
      a.push(7)
      const b = new BoundedPriorityQueue<number>(10)
      b.push(3)
      b.push(6)
      b.push(2)
      a.merge(b)
      const result: number[] = []
      while (!a.isEmpty) result.push(a.pop())
      expect(result).toEqual([1, 2, 3, 4, 6, 7])
    })

    it('merges large queues', () => {
      const a = new BoundedPriorityQueue<number>(100)
      for (let i = 0; i < 50; i++) a.push(i * 2)
      const b = new BoundedPriorityQueue<number>(100)
      for (let i = 0; i < 50; i++) b.push(i * 2 + 1)
      a.merge(b)
      expect(a.size).toBe(100)
      expect(a.peek()).toBe(0)
      for (let i = 0; i < 100; i++) {
        expect(a.pop()).toBe(i)
      }
    })

    it('merges with two empty queues', () => {
      const a = new BoundedPriorityQueue<number>(5)
      const b = new BoundedPriorityQueue<number>(5)
      a.merge(b)
      expect(a.size).toBe(0)
      expect(a.isEmpty).toBe(true)
    })
  })

  describe('custom comparator', () => {
    it('works as max heap with reverse comparator', () => {
      const pq = new BoundedPriorityQueue<number>(5, { comparator: reverseComparator })
      pq.push(1)
      pq.push(5)
      pq.push(3)
      pq.push(2)
      pq.push(4)
      expect(pq.toArray()).toEqual([5, 4, 3, 2, 1])
    })

    it('evicts highest actual value with reverse comparator when inserting smaller', () => {
      const pq = new BoundedPriorityQueue<number>(3, { comparator: reverseComparator })
      pq.push(5)
      pq.push(3)
      pq.push(1)
      const evicted = pq.push(0)
      expect(evicted).toBe(5)
      expect(pq.toArray()).toEqual([3, 1, 0])
    })

    it('keeps lowest actual elements with reverse comparator when full', () => {
      const pq = new BoundedPriorityQueue<number>(3, { comparator: reverseComparator })
      pq.push(10)
      pq.push(5)
      pq.push(1)
      expect(pq.push(3)).toBe(10)
      expect(pq.toArray()).toEqual([5, 3, 1])
    })

    it('works with absolute value comparator', () => {
      const pq = new BoundedPriorityQueue<number>(5, { comparator: absComparator })
      pq.push(-5)
      pq.push(3)
      pq.push(-1)
      pq.push(4)
      pq.push(-2)
      expect(pq.pop()).toBe(-1)
      expect(pq.pop()).toBe(-2)
      expect(pq.pop()).toBe(3)
    })

    it('works with string comparator', () => {
      const pq = new BoundedPriorityQueue<string>(5, { comparator: stringComparator })
      pq.push('cherry')
      pq.push('apple')
      pq.push('banana')
      expect(pq.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('works with object comparator', () => {
      interface Item { priority: number; name: string }
      const cmp: Comparator<Item> = (a, b) => a.priority - b.priority
      const pq = new BoundedPriorityQueue<Item>(5, { comparator: cmp })
      pq.push({ priority: 3, name: 'low' })
      pq.push({ priority: 1, name: 'high' })
      pq.push({ priority: 2, name: 'medium' })
      expect(pq.pop().name).toBe('high')
      expect(pq.pop().name).toBe('medium')
      expect(pq.pop().name).toBe('low')
    })

    it('custom comparator eviction works correctly', () => {
      const pq = new BoundedPriorityQueue<number>(3, { comparator: reverseComparator })
      for (let i = 0; i < 100; i++) pq.push(i)
      expect(pq.toArray()).toEqual([2, 1, 0])
    })

    it('object comparator with bounded capacity', () => {
      interface Score { value: number; label: string }
      const cmp: Comparator<Score> = (a, b) => a.value - b.value
      const pq = new BoundedPriorityQueue<Score>(2, { comparator: cmp })
      pq.push({ value: 10, label: 'a' })
      pq.push({ value: 20, label: 'b' })
      const evicted = pq.push({ value: 30, label: 'c' })
      expect(evicted!.label).toBe('a')
      expect(pq.toArray().map(s => s.label)).toEqual(['b', 'c'])
    })
  })

  describe('edge cases', () => {
    it('capacity 1 full cycle', () => {
      const pq = new BoundedPriorityQueue<number>(1)
      expect(pq.push(1)).toBeUndefined()
      expect(pq.isFull).toBe(true)
      expect(pq.push(2)).toBe(1)
      expect(pq.peek()).toBe(2)
      expect(pq.pop()).toBe(2)
      expect(pq.isEmpty).toBe(true)
      expect(pq.push(3)).toBeUndefined()
      expect(pq.peek()).toBe(3)
    })

    it('capacity 1 rejects lower priority', () => {
      const pq = new BoundedPriorityQueue<number>(1)
      pq.push(10)
      expect(pq.push(5)).toBe(5)
      expect(pq.peek()).toBe(10)
    })

    it('empty queue operations', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      expect(pq.isEmpty).toBe(true)
      expect(pq.isFull).toBe(false)
      expect(pq.size).toBe(0)
      expect(pq.toArray()).toEqual([])
      expect(pq.contains(1)).toBe(false)
    })

    it('full queue with all same elements', () => {
      const pq = new BoundedPriorityQueue<number>(3)
      pq.push(5)
      pq.push(5)
      pq.push(5)
      expect(pq.isFull).toBe(true)
      expect(pq.peek()).toBe(5)
      expect(pq.push(6)).toBe(5)
      expect(pq.toArray()).toEqual([5, 5, 6])
    })

    it('alternating push and pop', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(5)
      pq.push(3)
      expect(pq.pop()).toBe(3)
      pq.push(1)
      pq.push(7)
      expect(pq.pop()).toBe(1)
      expect(pq.pop()).toBe(5)
      expect(pq.pop()).toBe(7)
      expect(pq.isEmpty).toBe(true)
    })

    it('handles negative numbers', () => {
      const pq = new BoundedPriorityQueue<number>(10)
      pq.push(-5)
      pq.push(-1)
      pq.push(-3)
      pq.push(-2)
      pq.push(-4)
      expect(pq.toArray()).toEqual([-5, -4, -3, -2, -1])
    })

    it('handles mixed positive and negative', () => {
      const pq = new BoundedPriorityQueue<number>(10)
      pq.push(-3)
      pq.push(5)
      pq.push(-1)
      pq.push(2)
      pq.push(0)
      pq.push(-4)
      pq.push(3)
      expect(pq.toArray()).toEqual([-4, -3, -1, 0, 2, 3, 5])
    })

    it('clear and rebuild', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(5)
      pq.push(3)
      pq.push(1)
      pq.clear()
      expect(pq.isEmpty).toBe(true)
      pq.push(10)
      pq.push(20)
      pq.push(30)
      expect(pq.toArray()).toEqual([10, 20, 30])
    })

    it('handles sorted input', () => {
      const pq = new BoundedPriorityQueue<number>(10)
      for (let i = 1; i <= 10; i++) pq.push(i)
      expect(pq.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('handles reverse sorted input', () => {
      const pq = new BoundedPriorityQueue<number>(10)
      for (let i = 10; i >= 1; i--) pq.push(i)
      expect(pq.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('handles same element repeated', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      for (let i = 0; i < 5; i++) pq.push(5)
      expect(pq.toArray()).toEqual([5, 5, 5, 5, 5])
    })

    it('handles large dataset within capacity', () => {
      const pq = new BoundedPriorityQueue<number>(501)
      for (let i = 500; i >= 0; i--) pq.push(i)
      expect(pq.size).toBe(501)
      expect(pq.peek()).toBe(0)
    })

    it('handles large dataset with eviction', () => {
      const pq = new BoundedPriorityQueue<number>(10)
      for (let i = 0; i < 1000; i++) pq.push(i)
      expect(pq.size).toBe(10)
      expect(pq.toArray()).toEqual([990, 991, 992, 993, 994, 995, 996, 997, 998, 999])
    })

    it('random input produces top N', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      const input = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000))
      for (const v of input) pq.push(v)
      const sorted = [...input].sort((a, b) => a - b)
      expect(pq.toArray()).toEqual(sorted.slice(-5))
    })

    it('handles chaining operations', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(5)
      pq.push(3)
      pq.push(7)
      const min1 = pq.pop()
      pq.push(1)
      pq.push(6)
      const min2 = pq.pop()
      expect(min1).toBe(3)
      expect(min2).toBe(1)
      expect(pq.toArray()).toEqual([5, 6, 7])
    })

    it('handles objects with same priority', () => {
      interface Item { id: number; val: number }
      const cmp: Comparator<Item> = (a, b) => a.val - b.val
      const pq = new BoundedPriorityQueue<Item>(3, { comparator: cmp })
      pq.push({ id: 1, val: 5 })
      pq.push({ id: 2, val: 5 })
      pq.push({ id: 3, val: 5 })
      const evicted = pq.push({ id: 4, val: 10 })
      expect(evicted!.val).toBe(5)
      expect(pq.size).toBe(3)
    })

    it('push after partial pop', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(1)
      pq.push(2)
      pq.push(3)
      pq.pop()
      pq.pop()
      expect(pq.size).toBe(1)
      pq.push(10)
      pq.push(20)
      expect(pq.toArray()).toEqual([3, 10, 20])
    })

    it('merge then evict', () => {
      const a = new BoundedPriorityQueue<number>(3)
      a.push(1)
      a.push(2)
      const b = new BoundedPriorityQueue<number>(10)
      b.push(10)
      b.push(20)
      b.push(30)
      a.merge(b)
      expect(a.toArray()).toEqual([10, 20, 30])
    })

    it('toArray returns new array each time', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(1)
      pq.push(2)
      const arr1 = pq.toArray()
      const arr2 = pq.toArray()
      expect(arr1).toEqual(arr2)
      expect(arr1).not.toBe(arr2)
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates over empty queue', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      expect([...pq]).toEqual([])
    })

    it('iterates in sorted order', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(5)
      pq.push(3)
      pq.push(1)
      pq.push(4)
      pq.push(2)
      expect([...pq]).toEqual([1, 2, 3, 4, 5])
    })

    it('does not modify queue', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(3)
      pq.push(1)
      pq.push(2)
      ;[...pq]
      expect(pq.size).toBe(3)
      expect(pq.peek()).toBe(1)
    })

    it('works with for...of', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(3)
      pq.push(1)
      pq.push(2)
      const result: number[] = []
      for (const val of pq) result.push(val)
      expect(result).toEqual([1, 2, 3])
    })

    it('can be used multiple times', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      pq.push(3)
      pq.push(1)
      pq.push(2)
      expect([...pq]).toEqual([1, 2, 3])
      expect([...pq]).toEqual([1, 2, 3])
    })

    it('iteration after eviction', () => {
      const pq = new BoundedPriorityQueue<number>(3)
      pq.push(1)
      pq.push(2)
      pq.push(3)
      pq.push(10)
      expect([...pq]).toEqual([2, 3, 10])
    })
  })

  describe('top-K use case', () => {
    it('tracks top 3 largest from stream', () => {
      const pq = new BoundedPriorityQueue<number>(3)
      const data = [1, 5, 3, 8, 2, 9, 4, 7, 6]
      for (const v of data) pq.push(v)
      expect(pq.toArray()).toEqual([7, 8, 9])
    })

    it('tracks top 5 largest from sorted input', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      for (let i = 1; i <= 100; i++) pq.push(i)
      expect(pq.toArray()).toEqual([96, 97, 98, 99, 100])
    })

    it('tracks top 5 smallest with reverse comparator', () => {
      const pq = new BoundedPriorityQueue<number>(5, { comparator: reverseComparator })
      for (let i = 100; i >= 1; i--) pq.push(i)
      expect(pq.toArray()).toEqual([5, 4, 3, 2, 1])
    })

    it('handles streaming with duplicates', () => {
      const pq = new BoundedPriorityQueue<number>(3)
      const data = [5, 3, 5, 1, 5, 3, 1, 9, 9, 9]
      for (const v of data) pq.push(v)
      expect(pq.toArray()).toEqual([9, 9, 9])
    })

    it('all elements same value', () => {
      const pq = new BoundedPriorityQueue<number>(3)
      for (let i = 0; i < 100; i++) pq.push(42)
      expect(pq.toArray()).toEqual([42, 42, 42])
    })
  })

  describe('additional eviction scenarios', () => {
    it('evicts correctly when all elements have same priority', () => {
      const pq = new BoundedPriorityQueue<number>(3)
      pq.push(5)
      pq.push(5)
      pq.push(5)
      expect(pq.push(6)).toBe(5)
      expect(pq.size).toBe(3)
    })

    it('repeated eviction maintains correct min', () => {
      const pq = new BoundedPriorityQueue<number>(3)
      pq.push(1)
      pq.push(2)
      pq.push(3)
      expect(pq.push(4)).toBe(1)
      expect(pq.peek()).toBe(2)
      expect(pq.push(5)).toBe(2)
      expect(pq.peek()).toBe(3)
      expect(pq.push(6)).toBe(3)
      expect(pq.peek()).toBe(4)
    })

    it('eviction with capacity 2 alternating', () => {
      const pq = new BoundedPriorityQueue<number>(2)
      pq.push(1)
      pq.push(2)
      expect(pq.push(3)).toBe(1)
      expect(pq.toArray()).toEqual([2, 3])
      expect(pq.push(4)).toBe(2)
      expect(pq.toArray()).toEqual([3, 4])
    })

    it('rejected element does not affect queue', () => {
      const pq = new BoundedPriorityQueue<number>(3)
      pq.push(5)
      pq.push(10)
      pq.push(15)
      const snapshot = pq.toArray()
      pq.push(1)
      expect(pq.toArray()).toEqual(snapshot)
    })

    it('eviction with floating point values', () => {
      const pq = new BoundedPriorityQueue<number>(2)
      pq.push(1.1)
      pq.push(2.2)
      expect(pq.push(3.3)).toBeCloseTo(1.1)
      expect(pq.toArray()).toEqual([2.2, 3.3])
    })

    it('push returns undefined for first N elements', () => {
      const pq = new BoundedPriorityQueue<number>(4)
      expect(pq.push(10)).toBeUndefined()
      expect(pq.push(20)).toBeUndefined()
      expect(pq.push(30)).toBeUndefined()
      expect(pq.push(40)).toBeUndefined()
      expect(pq.push(50)).toBe(10)
    })

    it('eviction after pop makes room', () => {
      const pq = new BoundedPriorityQueue<number>(3)
      pq.push(1)
      pq.push(2)
      pq.push(3)
      pq.pop()
      expect(pq.isFull).toBe(false)
      expect(pq.push(4)).toBeUndefined()
      expect(pq.size).toBe(3)
    })

    it('eviction with negative and positive mix', () => {
      const pq = new BoundedPriorityQueue<number>(3)
      pq.push(-5)
      pq.push(0)
      pq.push(5)
      expect(pq.push(10)).toBe(-5)
      expect(pq.toArray()).toEqual([0, 5, 10])
    })
  })

  describe('stress tests', () => {
    it('handles 10000 elements with small capacity', () => {
      const pq = new BoundedPriorityQueue<number>(10)
      for (let i = 0; i < 10000; i++) pq.push(i)
      expect(pq.size).toBe(10)
      expect(pq.toArray()).toEqual([9990, 9991, 9992, 9993, 9994, 9995, 9996, 9997, 9998, 9999])
    })

    it('handles 10000 elements with large capacity', () => {
      const pq = new BoundedPriorityQueue<number>(5000)
      for (let i = 10000; i >= 0; i--) pq.push(i)
      expect(pq.size).toBe(5000)
      expect(pq.peek()).toBe(5001)
    })

    it('pop all elements from large queue', () => {
      const pq = new BoundedPriorityQueue<number>(100)
      for (let i = 0; i < 100; i++) pq.push(i)
      for (let i = 0; i < 100; i++) {
        expect(pq.pop()).toBe(i)
      }
      expect(pq.isEmpty).toBe(true)
    })

    it('repeated push and pop', () => {
      const pq = new BoundedPriorityQueue<number>(5)
      for (let round = 0; round < 100; round++) {
        pq.push(round)
      }
      expect(pq.size).toBe(5)
      const result: number[] = []
      while (!pq.isEmpty) result.push(pq.pop())
      expect(result).toEqual([95, 96, 97, 98, 99])
    })
  })
})
