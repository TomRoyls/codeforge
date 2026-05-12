import { describe, it, expect } from 'vitest'
import { BucketQueue } from '../../src/core/bucket-queue/index.js'

describe('BucketQueue', () => {
  describe('constructor', () => {
    it('creates empty queue with default maxPriority', () => {
      const q = new BucketQueue<string>()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('creates empty queue with custom maxPriority', () => {
      const q = new BucketQueue<string>({ maxPriority: 50 })
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('creates queue without options', () => {
      const q = new BucketQueue<number>()
      expect(q.size).toBe(0)
    })
  })

  describe('enqueue', () => {
    it('adds single element', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 0)
      expect(q.size).toBe(1)
      expect(q.isEmpty()).toBe(false)
    })

    it('adds multiple elements with different priorities', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 0)
      q.enqueue('b', 1)
      q.enqueue('c', 2)
      expect(q.size).toBe(3)
    })

    it('adds multiple elements with same priority', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 5)
      q.enqueue('b', 5)
      q.enqueue('c', 5)
      expect(q.size).toBe(3)
    })

    it('throws on negative priority', () => {
      const q = new BucketQueue<string>()
      expect(() => q.enqueue('a', -1)).toThrow(RangeError)
    })

    it('throws on non-integer priority', () => {
      const q = new BucketQueue<string>()
      expect(() => q.enqueue('a', 1.5)).toThrow(RangeError)
    })

    it('throws on priority exceeding maxPriority', () => {
      const q = new BucketQueue<string>({ maxPriority: 10 })
      expect(() => q.enqueue('a', 11)).toThrow(RangeError)
    })

    it('accepts priority at maxPriority boundary', () => {
      const q = new BucketQueue<string>({ maxPriority: 10 })
      q.enqueue('a', 10)
      expect(q.size).toBe(1)
    })

    it('accepts priority 0', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 0)
      expect(q.size).toBe(1)
    })

    it('tracks min priority after enqueue', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 5)
      q.enqueue('b', 2)
      expect(q.getMinPriority()).toBe(2)
    })

    it('tracks max priority after enqueue', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 5)
      q.enqueue('b', 8)
      expect(q.getMaxPriority()).toBe(8)
    })

    it('allows duplicate values at different priorities', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 1)
      q.enqueue('a', 3)
      expect(q.size).toBe(2)
    })
  })

  describe('dequeue', () => {
    it('returns undefined on empty queue', () => {
      const q = new BucketQueue<string>()
      expect(q.dequeue()).toBeUndefined()
    })

    it('returns single element', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 0)
      expect(q.dequeue()).toBe('a')
      expect(q.size).toBe(0)
    })

    it('returns elements in priority order', () => {
      const q = new BucketQueue<string>()
      q.enqueue('c', 2)
      q.enqueue('a', 0)
      q.enqueue('b', 1)
      expect(q.dequeue()).toBe('a')
      expect(q.dequeue()).toBe('b')
      expect(q.dequeue()).toBe('c')
    })

    it('returns FIFO order for same priority', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 0)
      q.enqueue('b', 0)
      q.enqueue('c', 0)
      expect(q.dequeue()).toBe('a')
      expect(q.dequeue()).toBe('b')
      expect(q.dequeue()).toBe('c')
    })

    it('decrements size', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 0)
      q.enqueue('b', 1)
      q.dequeue()
      expect(q.size).toBe(1)
    })

    it('drains queue completely', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 0)
      q.enqueue('b', 1)
      q.enqueue('c', 2)
      while (!q.isEmpty()) q.dequeue()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })
  })

  describe('peek', () => {
    it('returns undefined on empty queue', () => {
      const q = new BucketQueue<string>()
      expect(q.peek()).toBeUndefined()
    })

    it('returns first element without removing', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 0)
      expect(q.peek()).toBe('a')
      expect(q.size).toBe(1)
    })

    it('returns lowest priority element', () => {
      const q = new BucketQueue<string>()
      q.enqueue('b', 5)
      q.enqueue('a', 1)
      expect(q.peek()).toBe('a')
    })

    it('does not modify queue', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 0)
      q.enqueue('b', 1)
      const sizeBefore = q.size
      q.peek()
      expect(q.size).toBe(sizeBefore)
    })

    it('returns same element on multiple peeks', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 0)
      expect(q.peek()).toBe('a')
      expect(q.peek()).toBe('a')
    })
  })

  describe('peekPriority', () => {
    it('returns undefined on empty queue', () => {
      const q = new BucketQueue<string>()
      expect(q.peekPriority()).toBeUndefined()
    })

    it('returns lowest priority', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 3)
      q.enqueue('b', 1)
      expect(q.peekPriority()).toBe(1)
    })

    it('returns 0 for priority 0', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 0)
      expect(q.peekPriority()).toBe(0)
    })
  })

  describe('size', () => {
    it('returns 0 for new queue', () => {
      const q = new BucketQueue<number>()
      expect(q.size).toBe(0)
    })

    it('increments on enqueue', () => {
      const q = new BucketQueue<number>()
      q.enqueue(1, 0)
      q.enqueue(2, 1)
      q.enqueue(3, 2)
      expect(q.size).toBe(3)
    })

    it('decrements on dequeue', () => {
      const q = new BucketQueue<number>()
      q.enqueue(1, 0)
      q.enqueue(2, 1)
      q.dequeue()
      expect(q.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new queue', () => {
      const q = new BucketQueue<number>()
      expect(q.isEmpty()).toBe(true)
    })

    it('returns false after enqueue', () => {
      const q = new BucketQueue<number>()
      q.enqueue(1, 0)
      expect(q.isEmpty()).toBe(false)
    })

    it('returns true after draining', () => {
      const q = new BucketQueue<number>()
      q.enqueue(1, 0)
      q.dequeue()
      expect(q.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const q = new BucketQueue<number>()
      q.enqueue(1, 0)
      q.enqueue(2, 1)
      q.clear()
      expect(q.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears empty queue', () => {
      const q = new BucketQueue<number>()
      q.clear()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('clears populated queue', () => {
      const q = new BucketQueue<number>()
      q.enqueue(1, 0)
      q.enqueue(2, 1)
      q.enqueue(3, 2)
      q.clear()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('allows reuse after clear', () => {
      const q = new BucketQueue<number>()
      q.enqueue(1, 5)
      q.clear()
      q.enqueue(2, 0)
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(2)
    })

    it('resets priorities after clear', () => {
      const q = new BucketQueue<number>()
      q.enqueue(1, 5)
      q.enqueue(2, 10)
      q.clear()
      expect(q.getMinPriority()).toBeUndefined()
      expect(q.getMaxPriority()).toBeUndefined()
    })

    it('clear and fill repeatedly', () => {
      const q = new BucketQueue<number>()
      for (let round = 0; round < 5; round++) {
        for (let i = 0; i < 10; i++) q.enqueue(i, i)
        expect(q.size).toBe(10)
        q.clear()
        expect(q.isEmpty()).toBe(true)
      }
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty queue', () => {
      const q = new BucketQueue<number>()
      expect(q.toArray()).toEqual([])
    })

    it('returns entries with priorities', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 1)
      q.enqueue('b', 0)
      q.enqueue('c', 2)
      const arr = q.toArray()
      expect(arr).toEqual([
        { value: 'b', priority: 0 },
        { value: 'a', priority: 1 },
        { value: 'c', priority: 2 },
      ])
    })

    it('returns copy that does not affect queue', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 0)
      const arr = q.toArray()
      arr.push({ value: 'b', priority: 1 })
      expect(q.size).toBe(1)
    })
  })

  describe('updatePriority', () => {
    it('returns false for non-existent value', () => {
      const q = new BucketQueue<string>()
      expect(q.updatePriority('a', 5)).toBe(false)
    })

    it('updates priority of existing element', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 5)
      expect(q.updatePriority('a', 2)).toBe(true)
      expect(q.getPriority('a')).toBe(2)
    })

    it('returns true when updating to same priority', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 5)
      expect(q.updatePriority('a', 5)).toBe(true)
    })

    it('changes dequeue order after update', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 5)
      q.enqueue('b', 1)
      q.updatePriority('a', 0)
      expect(q.dequeue()).toBe('a')
      expect(q.dequeue()).toBe('b')
    })

    it('moves element to higher priority bucket', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 0)
      q.enqueue('b', 5)
      q.updatePriority('a', 10)
      expect(q.dequeue()).toBe('b')
      expect(q.dequeue()).toBe('a')
    })

    it('throws on invalid priority', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 0)
      expect(() => q.updatePriority('a', -1)).toThrow(RangeError)
    })

    it('throws on priority exceeding max', () => {
      const q = new BucketQueue<string>({ maxPriority: 5 })
      q.enqueue('a', 0)
      expect(() => q.updatePriority('a', 6)).toThrow(RangeError)
    })

    it('updates min/max priority bounds', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 5)
      q.updatePriority('a', 0)
      expect(q.getMinPriority()).toBe(0)
      expect(q.getMaxPriority()).toBe(0)
    })

    it('handles update that empties a bucket', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 0)
      q.enqueue('b', 5)
      q.updatePriority('a', 5)
      expect(q.getMinPriority()).toBe(5)
    })
  })

  describe('getMinPriority', () => {
    it('returns undefined on empty queue', () => {
      const q = new BucketQueue<number>()
      expect(q.getMinPriority()).toBeUndefined()
    })

    it('returns lowest priority', () => {
      const q = new BucketQueue<number>()
      q.enqueue(1, 5)
      q.enqueue(2, 2)
      q.enqueue(3, 8)
      expect(q.getMinPriority()).toBe(2)
    })
  })

  describe('getMaxPriority', () => {
    it('returns undefined on empty queue', () => {
      const q = new BucketQueue<number>()
      expect(q.getMaxPriority()).toBeUndefined()
    })

    it('returns highest priority', () => {
      const q = new BucketQueue<number>()
      q.enqueue(1, 5)
      q.enqueue(2, 2)
      q.enqueue(3, 8)
      expect(q.getMaxPriority()).toBe(8)
    })
  })

  describe('priorities', () => {
    it('returns empty array for empty queue', () => {
      const q = new BucketQueue<number>()
      expect(q.priorities()).toEqual([])
    })

    it('returns list of active priorities', () => {
      const q = new BucketQueue<number>()
      q.enqueue(1, 0)
      q.enqueue(2, 5)
      q.enqueue(3, 10)
      expect(q.priorities()).toEqual([0, 5, 10])
    })

    it('deduplicates same priorities', () => {
      const q = new BucketQueue<number>()
      q.enqueue(1, 3)
      q.enqueue(2, 3)
      q.enqueue(3, 3)
      expect(q.priorities()).toEqual([3])
    })

    it('returns sorted priorities', () => {
      const q = new BucketQueue<number>()
      q.enqueue(1, 7)
      q.enqueue(2, 2)
      q.enqueue(3, 5)
      expect(q.priorities()).toEqual([2, 5, 7])
    })
  })

  describe('contains', () => {
    it('returns false on empty queue', () => {
      const q = new BucketQueue<string>()
      expect(q.contains('a')).toBe(false)
    })

    it('returns true when element exists', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 0)
      expect(q.contains('a')).toBe(true)
    })

    it('returns false when element does not exist', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 0)
      expect(q.contains('b')).toBe(false)
    })
  })

  describe('getPriority', () => {
    it('returns undefined for non-existent value', () => {
      const q = new BucketQueue<string>()
      expect(q.getPriority('a')).toBeUndefined()
    })

    it('returns priority of existing value', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 5)
      expect(q.getPriority('a')).toBe(5)
    })
  })

  describe('remove', () => {
    it('returns false on empty queue', () => {
      const q = new BucketQueue<string>()
      expect(q.remove('a')).toBe(false)
    })

    it('removes existing element', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 0)
      expect(q.remove('a')).toBe(true)
      expect(q.size).toBe(0)
    })

    it('returns false for non-existent element', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 0)
      expect(q.remove('b')).toBe(false)
      expect(q.size).toBe(1)
    })

    it('maintains order after removal', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 0)
      q.enqueue('b', 1)
      q.enqueue('c', 2)
      q.remove('b')
      expect(q.dequeue()).toBe('a')
      expect(q.dequeue()).toBe('c')
    })

    it('updates bounds after removing min', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 0)
      q.enqueue('b', 5)
      q.remove('a')
      expect(q.getMinPriority()).toBe(5)
    })

    it('updates bounds after removing max', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 0)
      q.enqueue('b', 5)
      q.remove('b')
      expect(q.getMaxPriority()).toBe(0)
    })

    it('removes from middle of bucket', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 0)
      q.enqueue('b', 0)
      q.enqueue('c', 0)
      q.remove('b')
      expect(q.dequeue()).toBe('a')
      expect(q.dequeue()).toBe('c')
    })
  })

  describe('stats', () => {
    it('returns correct stats for empty queue', () => {
      const q = new BucketQueue<number>()
      expect(q.stats()).toEqual({
        size: 0,
        bucketCount: 0,
        minPriority: undefined,
        maxPriority: undefined,
      })
    })

    it('returns correct stats for populated queue', () => {
      const q = new BucketQueue<number>()
      q.enqueue(1, 0)
      q.enqueue(2, 5)
      q.enqueue(3, 10)
      expect(q.stats()).toEqual({
        size: 3,
        bucketCount: 3,
        minPriority: 0,
        maxPriority: 10,
      })
    })

    it('returns correct bucket count with same priorities', () => {
      const q = new BucketQueue<number>()
      q.enqueue(1, 3)
      q.enqueue(2, 3)
      q.enqueue(3, 3)
      const s = q.stats()
      expect(s.bucketCount).toBe(1)
    })
  })

  describe('static from', () => {
    it('creates queue from entries', () => {
      const q = BucketQueue.from([
        { value: 'a', priority: 2 },
        { value: 'b', priority: 0 },
        { value: 'c', priority: 1 },
      ])
      expect(q.size).toBe(3)
      expect(q.dequeue()).toBe('b')
      expect(q.dequeue()).toBe('c')
      expect(q.dequeue()).toBe('a')
    })

    it('creates empty queue from empty array', () => {
      const q = BucketQueue.from([])
      expect(q.isEmpty()).toBe(true)
    })

    it('creates queue with options', () => {
      const q = BucketQueue.from([{ value: 'a', priority: 5 }], { maxPriority: 10 })
      expect(q.size).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('single element lifecycle', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 5)
      expect(q.size).toBe(1)
      expect(q.isEmpty()).toBe(false)
      expect(q.peek()).toBe('a')
      expect(q.peekPriority()).toBe(5)
      expect(q.getMinPriority()).toBe(5)
      expect(q.getMaxPriority()).toBe(5)
      expect(q.dequeue()).toBe('a')
      expect(q.isEmpty()).toBe(true)
      expect(q.getMinPriority()).toBeUndefined()
      expect(q.getMaxPriority()).toBeUndefined()
    })

    it('same priority FIFO order', () => {
      const q = new BucketQueue<number>()
      q.enqueue(1, 0)
      q.enqueue(2, 0)
      q.enqueue(3, 0)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
    })

    it('gap priorities', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 0)
      q.enqueue('b', 100)
      q.enqueue('c', 500)
      expect(q.dequeue()).toBe('a')
      expect(q.dequeue()).toBe('b')
      expect(q.dequeue()).toBe('c')
    })

    it('priority 0', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 0)
      expect(q.peekPriority()).toBe(0)
      expect(q.dequeue()).toBe('a')
    })

    it('large batch enqueue and dequeue', () => {
      const q = new BucketQueue<number>()
      for (let i = 0; i < 500; i++) {
        q.enqueue(i, i)
      }
      expect(q.size).toBe(500)
      for (let i = 0; i < 500; i++) {
        expect(q.dequeue()).toBe(i)
      }
      expect(q.isEmpty()).toBe(true)
    })

    it('large batch same priority', () => {
      const q = new BucketQueue<number>()
      for (let i = 0; i < 200; i++) {
        q.enqueue(i, 5)
      }
      expect(q.size).toBe(200)
      for (let i = 0; i < 200; i++) {
        expect(q.dequeue()).toBe(i)
      }
    })

    it('interleaved enqueue and dequeue', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 5)
      q.enqueue('b', 1)
      expect(q.dequeue()).toBe('b')
      q.enqueue('c', 0)
      expect(q.dequeue()).toBe('c')
      expect(q.dequeue()).toBe('a')
      expect(q.isEmpty()).toBe(true)
    })

    it('dequeue updates min priority correctly', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 0)
      q.enqueue('b', 1)
      q.enqueue('c', 2)
      q.dequeue()
      expect(q.getMinPriority()).toBe(1)
      q.dequeue()
      expect(q.getMinPriority()).toBe(2)
      q.dequeue()
      expect(q.getMinPriority()).toBeUndefined()
    })

    it('reversed priority enqueue', () => {
      const q = new BucketQueue<number>()
      for (let i = 100; i >= 0; i--) {
        q.enqueue(i, i)
      }
      for (let i = 0; i <= 100; i++) {
        expect(q.dequeue()).toBe(i)
      }
    })

    it('mixed priority spread', () => {
      const q = new BucketQueue<string>()
      q.enqueue('x', 100)
      q.enqueue('y', 0)
      q.enqueue('z', 50)
      expect(q.dequeue()).toBe('y')
      expect(q.dequeue()).toBe('z')
      expect(q.dequeue()).toBe('x')
    })
  })

  describe('number values', () => {
    it('works with number values', () => {
      const q = new BucketQueue<number>()
      q.enqueue(10, 2)
      q.enqueue(20, 0)
      q.enqueue(30, 1)
      expect(q.dequeue()).toBe(20)
      expect(q.dequeue()).toBe(30)
      expect(q.dequeue()).toBe(10)
    })
  })

  describe('object values', () => {
    it('works with object values', () => {
      const q = new BucketQueue<{ id: number }>()
      const obj1 = { id: 1 }
      const obj2 = { id: 2 }
      q.enqueue(obj1, 5)
      q.enqueue(obj2, 1)
      expect(q.dequeue()).toBe(obj2)
      expect(q.dequeue()).toBe(obj1)
    })
  })

  describe('boundary maxPriority', () => {
    it('enqueues at exact maxPriority', () => {
      const q = new BucketQueue<string>({ maxPriority: 100 })
      q.enqueue('a', 100)
      expect(q.size).toBe(1)
      expect(q.dequeue()).toBe('a')
    })

    it('rejects priority above maxPriority', () => {
      const q = new BucketQueue<string>({ maxPriority: 5 })
      expect(() => q.enqueue('a', 6)).toThrow(RangeError)
    })

    it('works with maxPriority 0', () => {
      const q = new BucketQueue<string>({ maxPriority: 0 })
      q.enqueue('a', 0)
      expect(q.size).toBe(1)
      expect(() => q.enqueue('b', 1)).toThrow(RangeError)
    })
  })

  describe('updatePriority edge cases', () => {
    it('update to lower priority', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 5)
      q.enqueue('b', 2)
      q.updatePriority('a', 0)
      expect(q.dequeue()).toBe('a')
    })

    it('update to higher priority', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 0)
      q.enqueue('b', 5)
      q.updatePriority('a', 10)
      expect(q.dequeue()).toBe('b')
    })

    it('update only element adjusts bounds', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 5)
      q.updatePriority('a', 10)
      expect(q.getMinPriority()).toBe(10)
      expect(q.getMaxPriority()).toBe(10)
    })

    it('update that removes a bucket recalculates', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 0)
      q.enqueue('b', 5)
      q.updatePriority('a', 5)
      expect(q.priorities()).toEqual([5])
    })
  })

  describe('toArray ordering', () => {
    it('returns elements in priority order', () => {
      const q = new BucketQueue<number>()
      q.enqueue(3, 2)
      q.enqueue(1, 0)
      q.enqueue(2, 1)
      expect(q.toArray()).toEqual([
        { value: 1, priority: 0 },
        { value: 2, priority: 1 },
        { value: 3, priority: 2 },
      ])
    })

    it('includes multiple elements per priority', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 0)
      q.enqueue('b', 0)
      q.enqueue('c', 1)
      const arr = q.toArray()
      expect(arr).toEqual([
        { value: 'a', priority: 0 },
        { value: 'b', priority: 0 },
        { value: 'c', priority: 1 },
      ])
    })
  })

  describe('drain and verify order', () => {
    it('drains 50 elements in correct order', () => {
      const q = new BucketQueue<number>()
      for (let i = 49; i >= 0; i--) q.enqueue(i, i)
      const result: number[] = []
      while (!q.isEmpty()) result.push(q.dequeue()!)
      for (let i = 0; i < 50; i++) {
        expect(result[i]).toBe(i)
      }
    })

    it('handles gap priorities in drain', () => {
      const q = new BucketQueue<number>()
      const priorities = [0, 10, 20, 30, 40]
      for (const p of priorities) q.enqueue(p, p)
      const result: number[] = []
      while (!q.isEmpty()) result.push(q.dequeue()!)
      expect(result).toEqual([0, 10, 20, 30, 40])
    })
  })

  describe('remove edge cases', () => {
    it('removing all elements leaves empty queue', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 0)
      q.enqueue('b', 1)
      q.enqueue('c', 2)
      q.remove('a')
      q.remove('b')
      q.remove('c')
      expect(q.isEmpty()).toBe(true)
      expect(q.getMinPriority()).toBeUndefined()
      expect(q.getMaxPriority()).toBeUndefined()
    })

    it('removing element updates size', () => {
      const q = new BucketQueue<string>()
      q.enqueue('a', 0)
      q.enqueue('b', 1)
      q.remove('a')
      expect(q.size).toBe(1)
    })
  })

  describe('stress test', () => {
    it('handles 1000 elements with spread priorities', () => {
      const q = new BucketQueue<number>({ maxPriority: 999 })
      for (let i = 0; i < 1000; i++) {
        q.enqueue(i, i)
      }
      expect(q.size).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(q.dequeue()).toBe(i)
      }
      expect(q.isEmpty()).toBe(true)
    })

    it('handles repeated enqueue-dequeue cycles', () => {
      const q = new BucketQueue<number>()
      for (let cycle = 0; cycle < 10; cycle++) {
        for (let i = 0; i < 50; i++) q.enqueue(i, i)
        for (let i = 0; i < 50; i++) expect(q.dequeue()).toBe(i)
        expect(q.isEmpty()).toBe(true)
      }
    })
  })
})
