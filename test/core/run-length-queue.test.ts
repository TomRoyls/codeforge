import { describe, it, expect } from 'vitest'
import { RunLengthQueue } from '../../src/core/run-length-queue/run-length-queue.js'
import type { RunLengthPair, RunLengthQueueOptions } from '../../src/core/run-length-queue/types.js'

describe('RunLengthQueue', () => {
  describe('construction', () => {
    it('creates an empty queue with no options', () => {
      const q = new RunLengthQueue()
      expect(q.isEmpty()).toBe(true)
      expect(q.size()).toBe(0)
      expect(q.runCount()).toBe(0)
    })

    it('creates a queue with custom equals', () => {
      const q = new RunLengthQueue<{ id: number }>({
        equals: (a, b) => a.id === b.id,
      })
      q.enqueue({ id: 1 })
      q.enqueue({ id: 1 })
      expect(q.runCount()).toBe(1)
      expect(q.size()).toBe(2)
    })

    it('creates a queue with no options (undefined)', () => {
      const q = new RunLengthQueue<number>(undefined)
      q.enqueue(1)
      expect(q.size()).toBe(1)
    })

    it('defaults to Object.is for equality', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(42)
      q.enqueue(42)
      expect(q.runCount()).toBe(1)
      q.enqueue(43)
      expect(q.runCount()).toBe(2)
    })

    it('handles NaN correctly with default Object.is', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(NaN)
      q.enqueue(NaN)
      expect(q.runCount()).toBe(1)
      expect(q.size()).toBe(2)
    })

    it('creates a queue with string type', () => {
      const q = new RunLengthQueue<string>()
      q.enqueue('hello')
      expect(q.size()).toBe(1)
    })

    it('creates a queue with object type', () => {
      const q = new RunLengthQueue<{ x: number }>()
      const obj = { x: 1 }
      q.enqueue(obj)
      q.enqueue(obj)
      expect(q.runCount()).toBe(1)
    })
  })

  describe('enqueue', () => {
    it('enqueues a single element', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      expect(q.size()).toBe(1)
      expect(q.runCount()).toBe(1)
    })

    it('merges consecutive duplicate values into same run', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(5)
      q.enqueue(5)
      q.enqueue(5)
      expect(q.size()).toBe(3)
      expect(q.runCount()).toBe(1)
    })

    it('creates new run for different value', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.size()).toBe(3)
      expect(q.runCount()).toBe(3)
    })

    it('merges after alternating values', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(2)
      expect(q.runCount()).toBe(2)
    })

    it('handles strings', () => {
      const q = new RunLengthQueue<string>()
      q.enqueue('a')
      q.enqueue('a')
      q.enqueue('b')
      expect(q.size()).toBe(3)
      expect(q.runCount()).toBe(2)
    })

    it('handles null values', () => {
      const q = new RunLengthQueue<null>()
      q.enqueue(null)
      q.enqueue(null)
      expect(q.runCount()).toBe(1)
      expect(q.size()).toBe(2)
    })

    it('handles undefined values', () => {
      const q = new RunLengthQueue<undefined>()
      q.enqueue(undefined)
      q.enqueue(undefined)
      expect(q.runCount()).toBe(1)
    })

    it('handles boolean values', () => {
      const q = new RunLengthQueue<boolean>()
      q.enqueue(true)
      q.enqueue(true)
      q.enqueue(false)
      expect(q.runCount()).toBe(2)
    })

    it('handles 0 and -0 as different with Object.is', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(0)
      q.enqueue(-0)
      expect(q.runCount()).toBe(2)
    })

    it('does not merge different object references', () => {
      const q = new RunLengthQueue<object>()
      q.enqueue({ x: 1 })
      q.enqueue({ x: 1 })
      expect(q.runCount()).toBe(2)
    })

    it('merges same object references', () => {
      const q = new RunLengthQueue<object>()
      const obj = { x: 1 }
      q.enqueue(obj)
      q.enqueue(obj)
      expect(q.runCount()).toBe(1)
    })
  })

  describe('dequeue', () => {
    it('returns undefined on empty queue', () => {
      const q = new RunLengthQueue<number>()
      expect(q.dequeue()).toBeUndefined()
    })

    it('returns the first element', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      expect(q.dequeue()).toBe(1)
    })

    it('decrements size', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      q.dequeue()
      expect(q.size()).toBe(0)
    })

    it('removes run when count reaches 0', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      q.dequeue()
      expect(q.runCount()).toBe(0)
    })

    it('does not remove run when count > 0', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      q.enqueue(1)
      q.dequeue()
      expect(q.runCount()).toBe(1)
      expect(q.size()).toBe(1)
    })

    it('maintains FIFO order across runs', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
    })

    it('handles dequeue after mixed enqueue pattern', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(2)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(2)
      expect(q.isEmpty()).toBe(true)
    })

    it('removes runs in correct order', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.dequeue()
      q.dequeue()
      expect(q.runCount()).toBe(0)
    })

    it('returns undefined when dequeueing from exhausted queue', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      q.dequeue()
      expect(q.dequeue()).toBeUndefined()
    })

    it('handles repeated dequeue on empty queue', () => {
      const q = new RunLengthQueue<number>()
      expect(q.dequeue()).toBeUndefined()
      expect(q.dequeue()).toBeUndefined()
      expect(q.dequeue()).toBeUndefined()
    })
  })

  describe('peek', () => {
    it('returns undefined on empty queue', () => {
      const q = new RunLengthQueue<number>()
      expect(q.peek()).toBeUndefined()
    })

    it('returns first element without removing it', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(42)
      expect(q.peek()).toBe(42)
      expect(q.size()).toBe(1)
    })

    it('shows front of queue after enqueue', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      expect(q.peek()).toBe(1)
    })

    it('shows front of queue after partial dequeue', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.peek()).toBe(1)
      q.dequeue()
      expect(q.peek()).toBe(2)
    })

    it('returns undefined after all elements dequeued', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      q.dequeue()
      expect(q.peek()).toBeUndefined()
    })
  })

  describe('peekBack', () => {
    it('returns undefined on empty queue', () => {
      const q = new RunLengthQueue<number>()
      expect(q.peekBack()).toBeUndefined()
    })

    it('returns last enqueued value', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.peekBack()).toBe(3)
    })

    it('returns value from last run', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      q.enqueue(1)
      expect(q.peekBack()).toBe(1)
    })
  })

  describe('size and runCount', () => {
    it('tracks total size correctly', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(3)
      q.enqueue(3)
      expect(q.size()).toBe(6)
    })

    it('tracks run count correctly', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(3)
      q.enqueue(3)
      expect(q.runCount()).toBe(3)
    })

    it('updates size after dequeue', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.size()).toBe(2)
    })

    it('updates runCount after run fully dequeued', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.runCount()).toBe(1)
    })

    it('size is 0 for empty queue', () => {
      const q = new RunLengthQueue<number>()
      expect(q.size()).toBe(0)
    })

    it('runCount is 0 for empty queue', () => {
      const q = new RunLengthQueue<number>()
      expect(q.runCount()).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new queue', () => {
      const q = new RunLengthQueue<number>()
      expect(q.isEmpty()).toBe(true)
    })

    it('returns false after enqueue', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      expect(q.isEmpty()).toBe(false)
    })

    it('returns true after all elements dequeued', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      q.dequeue()
      expect(q.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      expect(q.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('removes all elements', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.clear()
      expect(q.size()).toBe(0)
      expect(q.runCount()).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('allows reuse after clear', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      q.clear()
      q.enqueue(2)
      expect(q.size()).toBe(1)
      expect(q.peek()).toBe(2)
    })

    it('clear on empty queue is no-op', () => {
      const q = new RunLengthQueue<number>()
      q.clear()
      expect(q.size()).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty queue', () => {
      const q = new RunLengthQueue<number>()
      expect(q.toArray()).toEqual([])
    })

    it('expands single run', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      q.enqueue(1)
      q.enqueue(1)
      expect(q.toArray()).toEqual([1, 1, 1])
    })

    it('expands multiple runs', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(3)
      expect(q.toArray()).toEqual([1, 1, 2, 3, 3])
    })

    it('returns snapshot (not affected by later mutations)', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      const arr = q.toArray()
      q.enqueue(2)
      expect(arr).toEqual([1])
    })

    it('handles string values', () => {
      const q = new RunLengthQueue<string>()
      q.enqueue('a')
      q.enqueue('b')
      q.enqueue('b')
      expect(q.toArray()).toEqual(['a', 'b', 'b'])
    })

    it('handles object references', () => {
      const q = new RunLengthQueue<number[]>()
      const arr = [1, 2]
      q.enqueue(arr)
      q.enqueue(arr)
      expect(q.toArray()).toEqual([arr, arr])
    })
  })

  describe('compress', () => {
    it('adds a compressed run', () => {
      const q = new RunLengthQueue<number>()
      q.compress(5, 3)
      expect(q.size()).toBe(3)
      expect(q.runCount()).toBe(1)
      expect(q.toArray()).toEqual([5, 5, 5])
    })

    it('merges with last run if same value', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      q.compress(1, 3)
      expect(q.runCount()).toBe(1)
      expect(q.size()).toBe(4)
    })

    it('creates new run if different value', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      q.compress(2, 3)
      expect(q.runCount()).toBe(2)
    })

    it('ignores count of 0', () => {
      const q = new RunLengthQueue<number>()
      q.compress(1, 0)
      expect(q.size()).toBe(0)
      expect(q.runCount()).toBe(0)
    })

    it('ignores negative count', () => {
      const q = new RunLengthQueue<number>()
      q.compress(1, -5)
      expect(q.size()).toBe(0)
    })

    it('compresses large counts', () => {
      const q = new RunLengthQueue<number>()
      q.compress(7, 100)
      expect(q.size()).toBe(100)
      expect(q.runCount()).toBe(1)
    })

    it('compress merges with custom equals', () => {
      const q = new RunLengthQueue<{ id: number }>({
        equals: (a, b) => a.id === b.id,
      })
      q.enqueue({ id: 1 })
      q.compress({ id: 1 }, 3)
      expect(q.runCount()).toBe(1)
      expect(q.size()).toBe(4)
    })

    it('compress on empty queue', () => {
      const q = new RunLengthQueue<number>()
      q.compress(42, 5)
      expect(q.toArray()).toEqual([42, 42, 42, 42, 42])
    })
  })

  describe('fromArray', () => {
    it('creates queue from empty array', () => {
      const q = RunLengthQueue.fromArray([])
      expect(q.isEmpty()).toBe(true)
    })

    it('creates queue from single-element array', () => {
      const q = RunLengthQueue.fromArray([1])
      expect(q.size()).toBe(1)
      expect(q.peek()).toBe(1)
    })

    it('auto-compresses consecutive duplicates', () => {
      const q = RunLengthQueue.fromArray([1, 1, 1, 2, 2, 3])
      expect(q.size()).toBe(6)
      expect(q.runCount()).toBe(3)
    })

    it('all different values', () => {
      const q = RunLengthQueue.fromArray([1, 2, 3, 4, 5])
      expect(q.runCount()).toBe(5)
    })

    it('all same values', () => {
      const q = RunLengthQueue.fromArray([7, 7, 7, 7, 7])
      expect(q.runCount()).toBe(1)
      expect(q.size()).toBe(5)
    })

    it('works with custom equals', () => {
      const q = RunLengthQueue.fromArray(
        [{ id: 1 }, { id: 1 }, { id: 2 }],
        { equals: (a, b) => a.id === b.id }
      )
      expect(q.runCount()).toBe(2)
    })

    it('preserves order', () => {
      const q = RunLengthQueue.fromArray([3, 1, 2])
      expect(q.toArray()).toEqual([3, 1, 2])
    })

    it('handles string array', () => {
      const q = RunLengthQueue.fromArray(['a', 'a', 'b', 'c', 'c', 'c'])
      expect(q.runCount()).toBe(3)
      expect(q.size()).toBe(6)
    })
  })

  describe('splitAt', () => {
    it('splits at beginning', () => {
      const q = RunLengthQueue.fromArray([1, 2, 3])
      const [left, right] = q.splitAt(0)
      expect(left.size()).toBe(0)
      expect(right.toArray()).toEqual([1, 2, 3])
    })

    it('splits at end', () => {
      const q = RunLengthQueue.fromArray([1, 2, 3])
      const [left, right] = q.splitAt(3)
      expect(left.toArray()).toEqual([1, 2, 3])
      expect(right.size()).toBe(0)
    })

    it('splits in middle of a run', () => {
      const q = RunLengthQueue.fromArray([1, 1, 1, 2, 2])
      const [left, right] = q.splitAt(2)
      expect(left.toArray()).toEqual([1, 1])
      expect(right.toArray()).toEqual([1, 2, 2])
    })

    it('splits at run boundary', () => {
      const q = RunLengthQueue.fromArray([1, 1, 2, 2])
      const [left, right] = q.splitAt(2)
      expect(left.toArray()).toEqual([1, 1])
      expect(right.toArray()).toEqual([2, 2])
    })

    it('splits empty queue', () => {
      const q = new RunLengthQueue<number>()
      const [left, right] = q.splitAt(0)
      expect(left.isEmpty()).toBe(true)
      expect(right.isEmpty()).toBe(true)
    })

    it('splits with negative position (clamped to 0)', () => {
      const q = RunLengthQueue.fromArray([1, 2, 3])
      const [left, right] = q.splitAt(-5)
      expect(left.size()).toBe(0)
      expect(right.toArray()).toEqual([1, 2, 3])
    })

    it('splits with position beyond size (clamped)', () => {
      const q = RunLengthQueue.fromArray([1, 2, 3])
      const [left, right] = q.splitAt(100)
      expect(left.toArray()).toEqual([1, 2, 3])
      expect(right.size()).toBe(0)
    })

    it('splits single-run queue', () => {
      const q = RunLengthQueue.fromArray([5, 5, 5, 5, 5])
      const [left, right] = q.splitAt(3)
      expect(left.toArray()).toEqual([5, 5, 5])
      expect(right.toArray()).toEqual([5, 5])
    })

    it('splits preserve compression in both halves', () => {
      const q = RunLengthQueue.fromArray([1, 1, 1, 2, 2, 2, 3, 3, 3])
      const [left, right] = q.splitAt(5)
      expect(left.runCount()).toBe(2)
      expect(right.runCount()).toBe(2)
    })

    it('left and right queues use same equals', () => {
      const q = new RunLengthQueue<{ id: number }>({
        equals: (a, b) => a.id === b.id,
      })
      q.enqueue({ id: 1 })
      q.enqueue({ id: 1 })
      q.enqueue({ id: 2 })
      const [left, right] = q.splitAt(1)
      left.enqueue({ id: 1 })
      expect(left.runCount()).toBe(1)
      right.enqueue({ id: 2 })
      expect(right.runCount()).toBe(2)
    })

    it('does not modify original queue', () => {
      const q = RunLengthQueue.fromArray([1, 1, 2, 3, 3])
      q.splitAt(3)
      expect(q.toArray()).toEqual([1, 1, 2, 3, 3])
    })
  })

  describe('clone', () => {
    it('clones an empty queue', () => {
      const q = new RunLengthQueue<number>()
      const c = q.clone()
      expect(c.isEmpty()).toBe(true)
    })

    it('clones all elements', () => {
      const q = RunLengthQueue.fromArray([1, 1, 2, 3, 3])
      const c = q.clone()
      expect(c.toArray()).toEqual([1, 1, 2, 3, 3])
    })

    it('clone is independent', () => {
      const q = RunLengthQueue.fromArray([1, 2, 3])
      const c = q.clone()
      c.enqueue(4)
      expect(q.size()).toBe(3)
      expect(c.size()).toBe(4)
    })

    it('preserves run compression', () => {
      const q = RunLengthQueue.fromArray([1, 1, 1, 2, 2])
      const c = q.clone()
      expect(c.runCount()).toBe(q.runCount())
    })

    it('preserves equals function', () => {
      const q = new RunLengthQueue<{ id: number }>({
        equals: (a, b) => a.id === b.id,
      })
      q.enqueue({ id: 1 })
      const c = q.clone()
      c.enqueue({ id: 1 })
      expect(c.runCount()).toBe(1)
    })
  })

  describe('contains', () => {
    it('returns false for empty queue', () => {
      const q = new RunLengthQueue<number>()
      expect(q.contains(1)).toBe(false)
    })

    it('returns true when value exists', () => {
      const q = RunLengthQueue.fromArray([1, 2, 3])
      expect(q.contains(2)).toBe(true)
    })

    it('returns false when value does not exist', () => {
      const q = RunLengthQueue.fromArray([1, 2, 3])
      expect(q.contains(4)).toBe(false)
    })

    it('uses custom equals', () => {
      const q = new RunLengthQueue<{ id: number }>({
        equals: (a, b) => a.id === b.id,
      })
      q.enqueue({ id: 1 })
      expect(q.contains({ id: 1 })).toBe(true)
      expect(q.contains({ id: 2 })).toBe(false)
    })
  })

  describe('getRuns', () => {
    it('returns empty array for empty queue', () => {
      const q = new RunLengthQueue<number>()
      expect(q.getRuns()).toEqual([])
    })

    it('returns internal run pairs', () => {
      const q = RunLengthQueue.fromArray([1, 1, 2, 3, 3, 3])
      const runs = q.getRuns()
      expect(runs).toEqual([
        { value: 1, count: 2 },
        { value: 2, count: 1 },
        { value: 3, count: 3 },
      ])
    })

    it('returns readonly view', () => {
      const q = RunLengthQueue.fromArray([1, 1])
      const runs = q.getRuns()
      expect(runs.length).toBe(1)
    })
  })

  describe('stats', () => {
    it('returns stats for empty queue', () => {
      const q = new RunLengthQueue<number>()
      const s = q.stats()
      expect(s).toEqual({
        size: 0,
        runCount: 0,
        isEmpty: true,
        compressionRatio: 1,
      })
    })

    it('returns stats for compressed queue', () => {
      const q = RunLengthQueue.fromArray([1, 1, 1, 2, 2, 3])
      const s = q.stats()
      expect(s.size).toBe(6)
      expect(s.runCount).toBe(3)
      expect(s.isEmpty).toBe(false)
      expect(s.compressionRatio).toBeCloseTo(0.5)
    })

    it('compression ratio is 1 for all different', () => {
      const q = RunLengthQueue.fromArray([1, 2, 3])
      expect(q.stats().compressionRatio).toBeCloseTo(1)
    })

    it('compression ratio is small for highly compressed', () => {
      const q = new RunLengthQueue<number>()
      q.compress(1, 1000)
      expect(q.stats().compressionRatio).toBeCloseTo(0.001)
    })
  })

  describe('edge cases', () => {
    it('enqueue dequeue enqueue same value', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      q.enqueue(1)
      q.dequeue()
      q.dequeue()
      q.enqueue(1)
      expect(q.size()).toBe(1)
      expect(q.runCount()).toBe(1)
    })

    it('enqueue after dequeue creates new run for different value', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      q.enqueue(1)
      expect(q.toArray()).toEqual([2, 1])
      expect(q.runCount()).toBe(2)
    })

    it('single element lifecycle', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(42)
      expect(q.peek()).toBe(42)
      expect(q.peekBack()).toBe(42)
      expect(q.dequeue()).toBe(42)
      expect(q.isEmpty()).toBe(true)
    })

    it('all same values', () => {
      const q = RunLengthQueue.fromArray([5, 5, 5, 5, 5, 5, 5, 5, 5, 5])
      expect(q.runCount()).toBe(1)
      expect(q.size()).toBe(10)
      expect(q.toArray()).toEqual([5, 5, 5, 5, 5, 5, 5, 5, 5, 5])
    })

    it('all different values', () => {
      const q = RunLengthQueue.fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      expect(q.runCount()).toBe(10)
    })

    it('alternating values', () => {
      const q = RunLengthQueue.fromArray([1, 2, 1, 2, 1, 2])
      expect(q.runCount()).toBe(6)
    })

    it('dequeue all from multi-run queue', () => {
      const q = RunLengthQueue.fromArray([1, 1, 2, 3, 3, 3])
      const results: number[] = []
      while (!q.isEmpty()) {
        results.push(q.dequeue()!)
      }
      expect(results).toEqual([1, 1, 2, 3, 3, 3])
      expect(q.runCount()).toBe(0)
    })

    it('interleaved enqueue and dequeue', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      q.enqueue(1)
      expect(q.dequeue()).toBe(1)
      q.enqueue(2)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.isEmpty()).toBe(true)
    })

    it('re-adding same value after full drain', () => {
      const q = new RunLengthQueue<number>()
      q.enqueue(1)
      q.dequeue()
      q.enqueue(1)
      expect(q.runCount()).toBe(1)
      expect(q.size()).toBe(1)
    })

    it('clear preserves equals function', () => {
      const q = new RunLengthQueue<{ id: number }>({
        equals: (a, b) => a.id === b.id,
      })
      q.enqueue({ id: 1 })
      q.clear()
      q.enqueue({ id: 1 })
      q.enqueue({ id: 1 })
      expect(q.runCount()).toBe(1)
    })
  })

  describe('stress', () => {
    it('handles large number of same-value enqueues', () => {
      const q = new RunLengthQueue<number>()
      for (let i = 0; i < 10000; i++) {
        q.enqueue(42)
      }
      expect(q.size()).toBe(10000)
      expect(q.runCount()).toBe(1)
    })

    it('handles large number of alternating enqueues', () => {
      const q = new RunLengthQueue<number>()
      for (let i = 0; i < 1000; i++) {
        q.enqueue(i)
      }
      expect(q.size()).toBe(1000)
      expect(q.runCount()).toBe(1000)
    })

    it('handles large compress and full dequeue', () => {
      const q = new RunLengthQueue<number>()
      q.compress(1, 5000)
      q.compress(2, 5000)
      expect(q.size()).toBe(10000)
      expect(q.runCount()).toBe(2)
      let count = 0
      while (!q.isEmpty()) {
        q.dequeue()
        count++
      }
      expect(count).toBe(10000)
      expect(q.runCount()).toBe(0)
    })

    it('handles large fromArray', () => {
      const arr: number[] = []
      for (let i = 0; i < 1000; i++) {
        arr.push(Math.floor(i / 100))
      }
      const q = RunLengthQueue.fromArray(arr)
      expect(q.size()).toBe(1000)
      expect(q.runCount()).toBe(10)
    })

    it('handles repeated split operations', () => {
      const q = RunLengthQueue.fromArray([1, 1, 2, 2, 3, 3, 4, 4])
      const [left, right] = q.splitAt(4)
      const [ll, lr] = left.splitAt(2)
      const [rl, rr] = right.splitAt(2)
      expect(ll.toArray()).toEqual([1, 1])
      expect(lr.toArray()).toEqual([2, 2])
      expect(rl.toArray()).toEqual([3, 3])
      expect(rr.toArray()).toEqual([4, 4])
    })

    it('handles enqueue-dequeue round-trip with many values', () => {
      const q = new RunLengthQueue<number>()
      for (let i = 0; i < 500; i++) {
        q.enqueue(i % 5)
      }
      for (let i = 0; i < 500; i++) {
        expect(q.dequeue()).toBe(i % 5)
      }
      expect(q.isEmpty()).toBe(true)
    })
  })
})
