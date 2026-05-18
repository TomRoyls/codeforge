import { ChunkedQueue } from '../src/core/chunked-queue/chunked-queue.js'
import type { ChunkedQueueStatistics } from '../src/core/chunked-queue/types.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('ChunkedQueue', () => {
  describe('constructor', () => {
    it('creates an empty queue with default chunk size', () => {
      const q = new ChunkedQueue<number>()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('creates a queue with custom chunk size', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 4 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      expect(q.chunkCount()).toBe(2)
    })

    it('creates a queue with chunk size 1', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 1 })
      q.enqueue(10)
      q.enqueue(20)
      expect(q.size).toBe(2)
      expect(q.chunkCount()).toBe(2)
    })

    it('clamps negative chunk size to 1', () => {
      const q = new ChunkedQueue<number>({ chunkSize: -5 })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.size).toBe(2)
      expect(q.chunkCount()).toBe(2)
    })

    it('clamps zero chunk size to 1', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 0 })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.size).toBe(2)
      expect(q.chunkCount()).toBe(2)
    })

    it('floors fractional chunk size', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2.7 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.chunkCount()).toBe(2)
    })
  })

  // ─── enqueue ──────────────────────────────────────────────────────────

  describe('enqueue', () => {
    it('adds a single element', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(42)
      expect(q.size).toBe(1)
      expect(q.isEmpty()).toBe(false)
    })

    it('adds multiple elements', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.size).toBe(3)
    })

    it('stores values in FIFO order', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      expect(q.toArray()).toEqual([10, 20, 30])
    })

    it('handles enqueue across chunk boundaries', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      expect(q.size).toBe(5)
      expect(q.toArray()).toEqual([1, 2, 3, 4, 5])
      expect(q.chunkCount()).toBe(3)
    })

    it('handles enqueue of undefined values', () => {
      const q = new ChunkedQueue<number | undefined>()
      q.enqueue(undefined)
      q.enqueue(42)
      expect(q.size).toBe(2)
      expect(q.peek()).toBeUndefined()
    })

    it('handles string elements', () => {
      const q = new ChunkedQueue<string>()
      q.enqueue('a')
      q.enqueue('b')
      q.enqueue('c')
      expect(q.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('handles object elements', () => {
      const q = new ChunkedQueue<{ id: number }>()
      q.enqueue({ id: 1 })
      q.enqueue({ id: 2 })
      expect(q.size).toBe(2)
      expect(q.dequeue()?.id).toBe(1)
    })

    it('updates statistics on enqueue', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const stats = q.getStatistics()
      expect(stats.enqueues).toBe(3)
      expect(stats.chunksCreated).toBe(1)
    })
  })

  // ─── dequeue ──────────────────────────────────────────────────────────

  describe('dequeue', () => {
    it('returns undefined on empty queue', () => {
      const q = new ChunkedQueue<number>()
      expect(q.dequeue()).toBeUndefined()
    })

    it('returns the first enqueued element', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(10)
      q.enqueue(20)
      expect(q.dequeue()).toBe(10)
    })

    it('removes elements in FIFO order', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
      expect(q.dequeue()).toBeUndefined()
    })

    it('decreases size after dequeue', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect(q.size).toBe(2)
    })

    it('empties queue after dequeuing all elements', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      q.dequeue()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('releases chunks when fully dequeued across boundaries', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.chunkCount()).toBe(2)
      q.dequeue()
      q.dequeue()
      expect(q.chunkCount()).toBe(1)
      q.dequeue()
      expect(q.chunkCount()).toBe(0)
    })

    it('updates statistics on dequeue', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      const stats = q.getStatistics()
      expect(stats.dequeues).toBe(1)
    })

    it('updates statistics chunksReleased when queue empties', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      q.dequeue()
      const stats = q.getStatistics()
      expect(stats.chunksReleased).toBe(1)
    })

    it('allows enqueue after full dequeue', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      q.dequeue()
      expect(q.size).toBe(0)
      q.enqueue(99)
      expect(q.size).toBe(1)
      expect(q.dequeue()).toBe(99)
    })
  })

  // ─── peek ─────────────────────────────────────────────────────────────

  describe('peek', () => {
    it('returns undefined on empty queue', () => {
      const q = new ChunkedQueue<number>()
      expect(q.peek()).toBeUndefined()
    })

    it('returns the front element without removing it', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(10)
      q.enqueue(20)
      expect(q.peek()).toBe(10)
      expect(q.size).toBe(2)
    })

    it('returns the new front after dequeue', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect(q.peek()).toBe(2)
    })

    it('returns undefined after all elements are dequeued', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      q.dequeue()
      expect(q.peek()).toBeUndefined()
    })
  })

  // ─── size ─────────────────────────────────────────────────────────────

  describe('size', () => {
    it('returns 0 for new queue', () => {
      const q = new ChunkedQueue<number>()
      expect(q.size).toBe(0)
    })

    it('tracks size after enqueue', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      expect(q.size).toBe(1)
      q.enqueue(2)
      expect(q.size).toBe(2)
    })

    it('tracks size after dequeue', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.size).toBe(1)
    })

    it('tracks size after mixed operations', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.enqueue(4)
      q.dequeue()
      expect(q.size).toBe(2)
    })
  })

  // ─── isEmpty ──────────────────────────────────────────────────────────

  describe('isEmpty', () => {
    it('returns true for new queue', () => {
      const q = new ChunkedQueue<number>()
      expect(q.isEmpty()).toBe(true)
    })

    it('returns false after enqueue', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      expect(q.isEmpty()).toBe(false)
    })

    it('returns true after dequeuing all elements', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      q.dequeue()
      expect(q.isEmpty()).toBe(true)
    })
  })

  // ─── clear ────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('clears an empty queue without error', () => {
      const q = new ChunkedQueue<number>()
      q.clear()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('clears a non-empty queue', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.clear()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('allows operations after clear', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      q.clear()
      q.enqueue(42)
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(42)
    })

    it('resets chunk count', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.chunkCount()).toBe(2)
      q.clear()
      expect(q.chunkCount()).toBe(0)
    })

    it('allows iteration after clear and re-fill', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      q.clear()
      q.enqueue(10)
      q.enqueue(20)
      expect(q.toArray()).toEqual([10, 20])
    })
  })

  // ─── toArray ──────────────────────────────────────────────────────────

  describe('toArray', () => {
    it('returns empty array for empty queue', () => {
      const q = new ChunkedQueue<number>()
      expect(q.toArray()).toEqual([])
    })

    it('returns all elements in order', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('returns remaining elements after partial dequeue', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect(q.toArray()).toEqual([2, 3])
    })

    it('returns a new array each time', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      const a1 = q.toArray()
      const a2 = q.toArray()
      expect(a1).toEqual(a2)
      expect(a1).not.toBe(a2)
    })

    it('handles elements across chunk boundaries', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.toArray()).toEqual([1, 2, 3, 4])
    })
  })

  // ─── forEach ──────────────────────────────────────────────────────────

  describe('forEach', () => {
    it('iterates over all elements with correct indices', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      const results: Array<{ value: number; index: number }> = []
      q.forEach((value, index) => {
        results.push({ value, index })
      })
      expect(results).toEqual([
        { value: 10, index: 0 },
        { value: 20, index: 1 },
        { value: 30, index: 2 },
      ])
    })

    it('does not call callback on empty queue', () => {
      const q = new ChunkedQueue<number>()
      let callCount = 0
      q.forEach(() => {
        callCount++
      })
      expect(callCount).toBe(0)
    })

    it('iterates correctly after partial dequeue', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      const values: number[] = []
      q.forEach((v) => values.push(v))
      expect(values).toEqual([2, 3])
    })

    it('iterates across chunk boundaries', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      const values: number[] = []
      q.forEach((v) => values.push(v))
      expect(values).toEqual([1, 2, 3, 4])
    })
  })

  // ─── iterator ─────────────────────────────────────────────────────────

  describe('Symbol.iterator', () => {
    it('iterates over all elements', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const result: number[] = []
      for (const v of q) {
        result.push(v)
      }
      expect(result).toEqual([1, 2, 3])
    })

    it('yields nothing for empty queue', () => {
      const q = new ChunkedQueue<number>()
      const result: number[] = []
      for (const v of q) {
        result.push(v)
      }
      expect(result).toEqual([])
    })

    it('works with spread operator', () => {
      const q = new ChunkedQueue<string>()
      q.enqueue('a')
      q.enqueue('b')
      expect([...q]).toEqual(['a', 'b'])
    })

    it('works after partial dequeue', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect([...q]).toEqual([2, 3])
    })

    it('works across chunk boundaries', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      expect([...q]).toEqual([10, 20, 30])
    })
  })

  // ─── at ───────────────────────────────────────────────────────────────

  describe('at', () => {
    it('returns element at valid index', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      expect(q.at(0)).toBe(10)
      expect(q.at(1)).toBe(20)
      expect(q.at(2)).toBe(30)
    })

    it('returns undefined for out-of-bounds positive index', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      expect(q.at(1)).toBeUndefined()
      expect(q.at(100)).toBeUndefined()
    })

    it('returns undefined for negative index', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      expect(q.at(-1)).toBeUndefined()
    })

    it('returns undefined on empty queue', () => {
      const q = new ChunkedQueue<number>()
      expect(q.at(0)).toBeUndefined()
    })

    it('returns correct element after partial dequeue', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect(q.at(0)).toBe(2)
      expect(q.at(1)).toBe(3)
    })

    it('returns correct element across chunk boundaries', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      expect(q.at(0)).toBe(1)
      expect(q.at(2)).toBe(3)
      expect(q.at(4)).toBe(5)
    })
  })

  // ─── chunkCount ───────────────────────────────────────────────────────

  describe('chunkCount', () => {
    it('returns 0 for empty queue', () => {
      const q = new ChunkedQueue<number>()
      expect(q.chunkCount()).toBe(0)
    })

    it('returns 1 for single chunk', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 4 })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.chunkCount()).toBe(1)
    })

    it('increases when chunks are allocated', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.chunkCount()).toBe(1)
      q.enqueue(3)
      expect(q.chunkCount()).toBe(2)
      q.enqueue(4)
      q.enqueue(5)
      expect(q.chunkCount()).toBe(3)
    })

    it('decreases as chunks are fully dequeued', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.chunkCount()).toBe(2)
      q.dequeue()
      q.dequeue()
      expect(q.chunkCount()).toBe(1)
    })
  })

  // ─── capacity ─────────────────────────────────────────────────────────

  describe('capacity', () => {
    it('returns 0 for empty queue', () => {
      const q = new ChunkedQueue<number>()
      expect(q.capacity()).toBe(0)
    })

    it('returns chunk count times chunk size', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 4 })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.capacity()).toBe(4)
    })

    it('returns correct capacity across multiple chunks', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.capacity()).toBe(4)
    })

    it('returns 0 after clear', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 4 })
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      expect(q.capacity()).toBe(0)
    })
  })

  // ─── compact ──────────────────────────────────────────────────────────

  describe('compact', () => {
    it('does nothing on empty queue', () => {
      const q = new ChunkedQueue<number>()
      q.compact()
      expect(q.size).toBe(0)
    })

    it('does nothing when queue is already compact', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.compact()
      expect(q.toArray()).toEqual([1, 2])
    })

    it('compacts after partial dequeue', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.dequeue()
      q.dequeue()
      q.compact()
      expect(q.toArray()).toEqual([3, 4])
      expect(q.chunkCount()).toBe(1)
    })

    it('preserves element order after compact', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      q.dequeue()
      q.dequeue()
      q.dequeue()
      q.compact()
      expect(q.toArray()).toEqual([4, 5])
    })

    it('updates compaction statistic', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 3 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      q.dequeue()
      q.compact()
      expect(q.getStatistics().compactions).toBe(1)
    })

    it('does not increment compaction statistic when already compact', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.compact()
      expect(q.getStatistics().compactions).toBe(0)
    })
  })

  // ─── getStatistics ────────────────────────────────────────────────────

  describe('getStatistics', () => {
    it('returns initial statistics', () => {
      const q = new ChunkedQueue<number>()
      const stats = q.getStatistics()
      expect(stats).toEqual({
        enqueues: 0,
        dequeues: 0,
        chunksCreated: 0,
        chunksReleased: 0,
        compactions: 0,
      })
    })

    it('tracks enqueues and chunksCreated', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const stats = q.getStatistics()
      expect(stats.enqueues).toBe(3)
      expect(stats.chunksCreated).toBe(2)
    })

    it('tracks dequeues and chunksReleased', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.dequeue()
      const stats = q.getStatistics()
      expect(stats.dequeues).toBe(2)
      expect(stats.chunksReleased).toBe(1)
    })

    it('returns a copy of statistics', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      const s1 = q.getStatistics()
      const s2 = q.getStatistics()
      expect(s1).toEqual(s2)
      expect(s1).not.toBe(s2)
    })

    it('tracks full lifecycle', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.dequeue()
      q.dequeue()
      const stats = q.getStatistics()
      expect(stats.enqueues).toBe(3)
      expect(stats.dequeues).toBe(3)
      expect(stats.chunksCreated).toBe(2)
      expect(stats.chunksReleased).toBe(2)
    })
  })

  // ─── Edge Cases ───────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles single element with chunk size 1', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 1 })
      q.enqueue(42)
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(42)
      expect(q.chunkCount()).toBe(1)
    })

    it('handles many elements with chunk size 1', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 1 })
      for (let i = 0; i < 5; i++) q.enqueue(i)
      expect(q.size).toBe(5)
      expect(q.chunkCount()).toBe(5)
      for (let i = 0; i < 5; i++) {
        expect(q.at(i)).toBe(i)
      }
    })

    it('handles large number of elements', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 64 })
      for (let i = 0; i < 1000; i++) q.enqueue(i)
      expect(q.size).toBe(1000)
      expect(q.at(0)).toBe(0)
      expect(q.at(500)).toBe(500)
      expect(q.at(999)).toBe(999)
      expect(q.chunkCount()).toBe(Math.ceil(1000 / 64))
    })

    it('handles interleaved enqueue and dequeue', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.enqueue(4)
      q.dequeue()
      expect(q.toArray()).toEqual([3, 4])
    })

    it('handles enqueue after dequeue to empty', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      q.dequeue()
      expect(q.isEmpty()).toBe(true)
      q.enqueue(99)
      expect(q.size).toBe(1)
      expect(q.dequeue()).toBe(99)
    })

    it('handles multiple enqueue-dequeue cycles', () => {
      const q = new ChunkedQueue<number>()
      for (let cycle = 0; cycle < 3; cycle++) {
        q.enqueue(cycle * 10)
        q.enqueue(cycle * 10 + 1)
        expect(q.dequeue()).toBe(cycle * 10)
        expect(q.dequeue()).toBe(cycle * 10 + 1)
      }
      expect(q.isEmpty()).toBe(true)
    })

    it('handles forEach after compact', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.dequeue()
      q.dequeue()
      q.compact()
      const values: number[] = []
      q.forEach((v) => values.push(v))
      expect(values).toEqual([3, 4])
    })

    it('handles at after compact', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      q.dequeue()
      q.dequeue()
      q.compact()
      expect(q.at(0)).toBe(30)
    })

    it('handles iterator after compact', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.compact()
      expect([...q]).toEqual([2, 3])
    })

    it('compact preserves all remaining elements', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.compact()
      expect(q.size).toBe(2)
      expect(q.toArray()).toEqual([2, 3])
    })

    it('handles peek after multiple dequeues across chunks', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.dequeue()
      q.dequeue()
      expect(q.peek()).toBe(3)
    })

    it('handles at index 0 on single element queue', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(7)
      expect(q.at(0)).toBe(7)
    })

    it('handles chunkCount with chunk size 1 after partial dequeue', () => {
      const q = new ChunkedQueue<number>({ chunkSize: 1 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect(q.chunkCount()).toBe(2)
    })

    it('toArray after full dequeue cycle returns empty', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      q.dequeue()
      expect(q.toArray()).toEqual([])
    })

    it('statistics survive clear', () => {
      const q = new ChunkedQueue<number>()
      q.enqueue(1)
      q.clear()
      const stats = q.getStatistics()
      expect(stats.enqueues).toBe(1)
    })
  })
})
