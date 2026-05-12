import { describe, it, expect } from 'vitest'
import { RunLengthQueue2 } from './src/core/run-length-queue-2/index.js'

describe('RunLengthQueue2', () => {
  describe('constructor', () => {
    it('creates empty queue', () => {
      const queue = new RunLengthQueue2<number>()
      expect(queue.isEmpty).toBe(true)
      expect(queue.size).toBe(0)
      expect(queue.peek).toBe(undefined)
    })

    it('creates queue with generic type', () => {
      const queue = new RunLengthQueue2<string>()
      expect(queue.isEmpty).toBe(true)
    })
  })

  describe('enqueue', () => {
    it('adds single element', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      expect(queue.size).toBe(1)
      expect(queue.peek).toBe(1)
    })

    it('adds multiple different values', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.size).toBe(3)
      expect(queue.peek).toBe(1)
    })

    it('merges consecutive identical values', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueue(1)
      queue.enqueue(1)
      expect(queue.size).toBe(3)
      expect(queue.totalRuns).toBe(1)
      expect(queue.peek).toBe(1)
    })

    it('merges when value matches previous run', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(2)
      expect(queue.size).toBe(3)
      expect(queue.totalRuns).toBe(2)
      expect(queue.uniqueValues).toEqual([1, 2])
    })

    it('handles string values', () => {
      const queue = new RunLengthQueue2<string>()
      queue.enqueue('a')
      queue.enqueue('b')
      queue.enqueue('b')
      expect(queue.size).toBe(3)
    })

    it('handles null values', () => {
      const queue = new RunLengthQueue2<null>()
      queue.enqueue(null)
      queue.enqueue(null)
      expect(queue.size).toBe(2)
    })

    it('handles undefined values', () => {
      const queue = new RunLengthQueue2<undefined>()
      queue.enqueue(undefined)
      queue.enqueue(undefined)
      expect(queue.size).toBe(2)
    })

    it('handles object values', () => {
      const queue = new RunLengthQueue2<{ id: number }>()
      const obj1 = { id: 1 }
      queue.enqueue(obj1)
      queue.enqueue({ id: 1 })
      expect(queue.size).toBe(2)
    })

    it('handles boolean values', () => {
      const queue = new RunLengthQueue2<boolean>()
      queue.enqueue(true)
      queue.enqueue(true)
      queue.enqueue(false)
      expect(queue.size).toBe(3)
    })
  })

  describe('dequeue', () => {
    it('returns undefined from empty queue', () => {
      const queue = new RunLengthQueue2<number>()
      expect(queue.dequeue()).toBe(undefined)
    })

    it('removes single element', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      const result = queue.dequeue()
      expect(result).toBe(1)
      expect(queue.isEmpty).toBe(true)
    })

    it('removes from front run', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.dequeue()).toBe(1)
      expect(queue.size).toBe(2)
      expect(queue.peek).toBe(1)
    })

    it('removes entire run one by one', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueue(1)
      queue.enqueue(1)
      expect(queue.dequeue()).toBe(1)
      expect(queue.dequeue()).toBe(1)
      expect(queue.dequeue()).toBe(1)
      expect(queue.isEmpty).toBe(true)
    })

    it('removes across multiple runs', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(2)
      expect(queue.dequeue()).toBe(1)
      expect(queue.dequeue()).toBe(1)
      expect(queue.dequeue()).toBe(2)
      expect(queue.size).toBe(1)
      expect(queue.peek).toBe(2)
    })

    it('reduces run count', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueue(1)
      queue.enqueue(1)
      expect(queue.totalRuns).toBe(1)
      queue.dequeue()
      queue.dequeue()
      expect(queue.totalRuns).toBe(1)
      queue.dequeue()
      expect(queue.totalRuns).toBe(0)
    })

    it('handles interleaved values', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(1)
      expect(queue.dequeue()).toBe(1)
      expect(queue.dequeue()).toBe(2)
      expect(queue.dequeue()).toBe(1)
    })

    it('removes from queue with many runs', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.enqueue(4)
      queue.enqueue(5)
      expect(queue.dequeue()).toBe(1)
      expect(queue.peek).toBe(2)
    })

    it('handles negative numbers', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(-1)
      queue.enqueue(-1)
      queue.enqueue(-2)
      expect(queue.dequeue()).toBe(-1)
      expect(queue.peek).toBe(-1)
    })

    it('handles zero', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(0)
      queue.enqueue(0)
      expect(queue.dequeue()).toBe(0)
    })
  })

  describe('peek', () => {
    it('returns undefined from empty queue', () => {
      const queue = new RunLengthQueue2<number>()
      expect(queue.peek).toBe(undefined)
    })

    it('returns first element', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.peek).toBe(1)
    })

    it('does not remove element', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      expect(queue.peek).toBe(1)
      expect(queue.peek).toBe(1)
      expect(queue.size).toBe(1)
    })

    it('returns first of run', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueue(1)
      queue.enqueue(1)
      expect(queue.peek).toBe(1)
      expect(queue.totalRuns).toBe(1)
    })

    it('returns first value after dequeue', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      expect(queue.peek).toBe(1)
    })

    it('returns next value after run exhaustion', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      expect(queue.peek).toBe(2)
    })
  })

  describe('size', () => {
    it('returns 0 for empty queue', () => {
      const queue = new RunLengthQueue2<number>()
      expect(queue.size).toBe(0)
    })

    it('returns count of all elements', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(2)
      queue.enqueue(2)
      expect(queue.size).toBe(5)
    })

    it('updates after enqueue', () => {
      const queue = new RunLengthQueue2<number>()
      expect(queue.size).toBe(0)
      queue.enqueue(1)
      expect(queue.size).toBe(1)
      queue.enqueue(1)
      expect(queue.size).toBe(2)
    })

    it('updates after dequeue', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueue(1)
      queue.enqueue(1)
      expect(queue.size).toBe(3)
      queue.dequeue()
      expect(queue.size).toBe(2)
      queue.dequeue()
      expect(queue.size).toBe(1)
    })

    it('updates after enqueueRun', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueueRun(1, 5)
      expect(queue.size).toBe(5)
    })

    it('updates after dequeueRun', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueueRun(1, 5)
      queue.enqueueRun(2, 3)
      queue.dequeueRun()
      expect(queue.size).toBe(3)
    })

    it('updates after clear', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.clear()
      expect(queue.size).toBe(0)
    })

    it('handles large counts', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueueRun(1, 1000000)
      expect(queue.size).toBe(1000000)
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty queue', () => {
      const queue = new RunLengthQueue2<number>()
      expect(queue.isEmpty).toBe(true)
    })

    it('returns false with elements', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      expect(queue.isEmpty).toBe(false)
    })

    it('returns true after removing all', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.dequeue()
      expect(queue.isEmpty).toBe(true)
    })

    it('returns false after enqueue', () => {
      const queue = new RunLengthQueue2<number>()
      expect(queue.isEmpty).toBe(true)
      queue.enqueue(1)
      expect(queue.isEmpty).toBe(false)
    })

    it('returns true after clear', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.clear()
      expect(queue.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('empties queue with elements', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.clear()
      expect(queue.isEmpty).toBe(true)
      expect(queue.size).toBe(0)
      expect(queue.peek).toBe(undefined)
    })

    it('clears empty queue', () => {
      const queue = new RunLengthQueue2<number>()
      queue.clear()
      expect(queue.isEmpty).toBe(true)
    })

    it('clears queue with many runs', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.clear()
      expect(queue.totalRuns).toBe(0)
    })

    it('allows reuse after clear', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.clear()
      queue.enqueue(2)
      expect(queue.size).toBe(1)
      expect(queue.peek).toBe(2)
    })

    it('resets unique values', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.clear()
      expect(queue.uniqueValues).toEqual([])
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty queue', () => {
      const queue = new RunLengthQueue2<number>()
      expect(queue.toArray()).toEqual([])
    })

    it('returns single element', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      expect(queue.toArray()).toEqual([1])
    })

    it('expands runs correctly', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueue(1)
      queue.enqueue(1)
      expect(queue.toArray()).toEqual([1, 1, 1])
    })

    it('handles multiple runs', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(2)
      expect(queue.toArray()).toEqual([1, 1, 2, 2])
    })

    it('preserves order', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.toArray()).toEqual([1, 2, 3])
    })

    it('handles interleaved values', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.toArray()).toEqual([1, 2, 1, 2])
    })

    it('handles large runs', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueueRun(1, 100)
      const arr = queue.toArray()
      expect(arr.length).toBe(100)
      expect(arr.every(v => v === 1)).toBe(true)
    })

    it('does not modify queue', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.toArray()
      expect(queue.size).toBe(2)
      expect(queue.peek).toBe(1)
    })
  })

  describe('enqueueRun', () => {
    it('adds single run', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueueRun(1, 5)
      expect(queue.size).toBe(5)
      expect(queue.totalRuns).toBe(1)
    })

    it('merges with same value', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueueRun(1, 3)
      expect(queue.size).toBe(4)
      expect(queue.totalRuns).toBe(1)
    })

    it('creates new run for different value', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueueRun(2, 3)
      expect(queue.size).toBe(4)
      expect(queue.totalRuns).toBe(2)
      expect(queue.peek).toBe(1)
    })

    it('adds multiple runs', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueueRun(1, 2)
      queue.enqueueRun(2, 3)
      queue.enqueueRun(3, 4)
      expect(queue.size).toBe(9)
      expect(queue.totalRuns).toBe(3)
    })

    it('ignores zero count', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueueRun(1, 0)
      expect(queue.isEmpty).toBe(true)
    })

    it('ignores negative count', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueueRun(1, -5)
      expect(queue.isEmpty).toBe(true)
    })

    it('handles count of 1', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueueRun(1, 1)
      expect(queue.size).toBe(1)
      expect(queue.totalRuns).toBe(1)
    })

    it('handles large counts', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueueRun(1, 10000)
      expect(queue.size).toBe(10000)
      expect(queue.totalRuns).toBe(1)
    })

    it('works with strings', () => {
      const queue = new RunLengthQueue2<string>()
      queue.enqueueRun('a', 5)
      expect(queue.size).toBe(5)
      expect(queue.toArray()).toEqual(['a', 'a', 'a', 'a', 'a'])
    })

    it('merges with multiple enqueues', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueue(1)
      queue.enqueueRun(1, 3)
      expect(queue.size).toBe(5)
      expect(queue.totalRuns).toBe(1)
    })
  })

  describe('dequeueRun', () => {
    it('returns undefined from empty queue', () => {
      const queue = new RunLengthQueue2<number>()
      expect(queue.dequeueRun()).toBe(undefined)
    })

    it('removes entire run', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueueRun(1, 5)
      const result = queue.dequeueRun()
      expect(result).toEqual({ value: 1, count: 5 })
      expect(queue.isEmpty).toBe(true)
    })

    it('removes front run from multiple runs', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueueRun(1, 3)
      queue.enqueueRun(2, 4)
      queue.enqueueRun(3, 5)
      const result = queue.dequeueRun()
      expect(result).toEqual({ value: 1, count: 3 })
      expect(queue.size).toBe(9)
      expect(queue.peek).toBe(2)
    })

    it('reduces run count', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueueRun(1, 3)
      queue.enqueueRun(2, 3)
      expect(queue.totalRuns).toBe(2)
      queue.dequeueRun()
      expect(queue.totalRuns).toBe(1)
    })

    it('returns correct value and count', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueueRun(42, 7)
      const result = queue.dequeueRun()
      expect(result).toEqual({ value: 42, count: 7 })
    })

    it('handles single element run', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      const result = queue.dequeueRun()
      expect(result).toEqual({ value: 1, count: 1 })
    })

    it('removes run after partial dequeue', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueueRun(1, 5)
      queue.dequeue()
      queue.dequeue()
      const result = queue.dequeueRun()
      expect(result).toEqual({ value: 1, count: 3 })
      expect(queue.isEmpty).toBe(true)
    })

    it('works with string values', () => {
      const queue = new RunLengthQueue2<string>()
      queue.enqueueRun('a', 3)
      const result = queue.dequeueRun()
      expect(result).toEqual({ value: 'a', count: 3 })
    })

    it('handles consecutive dequeueRun calls', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueueRun(1, 2)
      queue.enqueueRun(2, 3)
      queue.enqueueRun(3, 4)
      const r1 = queue.dequeueRun()
      const r2 = queue.dequeueRun()
      const r3 = queue.dequeueRun()
      expect(r1).toEqual({ value: 1, count: 2 })
      expect(r2).toEqual({ value: 2, count: 3 })
      expect(r3).toEqual({ value: 3, count: 4 })
    })
  })

  describe('uniqueValues', () => {
    it('returns empty array for empty queue', () => {
      const queue = new RunLengthQueue2<number>()
      expect(queue.uniqueValues).toEqual([])
    })

    it('returns single value', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      expect(queue.uniqueValues).toEqual([1])
    })

    it('returns unique values in order', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.uniqueValues).toEqual([1, 2, 3])
    })

    it('does not duplicate values', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(1)
      expect(queue.uniqueValues).toEqual([1, 2, 1])
    })
  })

  describe('totalRuns', () => {
    it('returns 0 for empty queue', () => {
      const queue = new RunLengthQueue2<number>()
      expect(queue.totalRuns).toBe(0)
    })

    it('returns 1 for single value', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      expect(queue.totalRuns).toBe(1)
    })

    it('returns count of runs', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.totalRuns).toBe(3)
    })

    it('increases with enqueue', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      expect(queue.totalRuns).toBe(1)
      queue.enqueue(2)
      expect(queue.totalRuns).toBe(2)
    })

    it('decreases with dequeue', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.totalRuns).toBe(2)
      queue.dequeue()
      queue.dequeue()
      expect(queue.totalRuns).toBe(0)
    })
  })

  describe('complex scenarios', () => {
    it('handles mix of enqueue and enqueueRun', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueueRun(2, 3)
      queue.enqueue(2)
      queue.enqueueRun(3, 2)
      expect(queue.size).toBe(7)
      expect(queue.totalRuns).toBe(3)
      expect(queue.toArray()).toEqual([1, 2, 2, 2, 2, 3, 3])
    })

    it('handles mix of dequeue and dequeueRun', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueueRun(1, 5)
      queue.enqueueRun(2, 3)
      queue.dequeue()
      queue.dequeueRun()
      expect(queue.size).toBe(3)
      expect(queue.peek).toBe(2)
    })

    it('handles many small runs', () => {
      const queue = new RunLengthQueue2<number>()
      for (let i = 0; i < 10; i++) {
        queue.enqueue(i)
      }
      expect(queue.size).toBe(10)
      expect(queue.totalRuns).toBe(10)
    })

    it('handles alternating pattern', () => {
      const queue = new RunLengthQueue2<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(1)
      expect(queue.size).toBe(5)
      expect(queue.totalRuns).toBe(5)
      expect(queue.toArray()).toEqual([1, 2, 1, 2, 1])
    })

    it('clears and reuses efficiently', () => {
      const queue = new RunLengthQueue2<number>()
      for (let i = 0; i < 1000; i++) {
        queue.enqueue(i)
      }
      queue.clear()
      for (let i = 0; i < 1000; i++) {
        queue.enqueue(i)
      }
      expect(queue.size).toBe(1000)
    })

    it('handles large number of operations', () => {
      const queue = new RunLengthQueue2<number>()
      for (let i = 0; i < 10000; i++) {
        queue.enqueue(i % 100)
      }
      expect(queue.size).toBe(10000)
      while (!queue.isEmpty) {
        queue.dequeue()
      }
      expect(queue.isEmpty).toBe(true)
    })
  })
})
