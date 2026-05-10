import { describe, it, expect, beforeEach } from 'vitest'
import { SegmentQueue } from '../../src/core/segment-queue/segment-queue.js'
import { DEFAULT_SEGMENT_QUEUE_OPTIONS } from '../../src/core/segment-queue/types.js'
import type { SegmentQueueOptions, SegmentQueueStatistics } from '../../src/core/segment-queue/types.js'

describe('SegmentQueue', () => {
  describe('default options', () => {
    it('has default segment size of 64', () => {
      expect(DEFAULT_SEGMENT_QUEUE_OPTIONS.segmentSize).toBe(64)
    })
  })

  describe('constructor', () => {
    it('creates empty queue with default options', () => {
      const q = new SegmentQueue()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
      expect(q.segmentCount()).toBe(0)
    })

    it('creates queue with custom segment size', () => {
      const q = new SegmentQueue({ segmentSize: 3 })
      expect(q.size).toBe(0)
    })

    it('clamps segment size to minimum of 1', () => {
      const q = new SegmentQueue({ segmentSize: 0 })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.segmentCount()).toBe(2)
    })

    it('clamps negative segment size to 1', () => {
      const q = new SegmentQueue({ segmentSize: -5 })
      q.enqueue('a')
      expect(q.segmentCount()).toBe(1)
    })

    it('handles segment size of 1', () => {
      const q = new SegmentQueue({ segmentSize: 1 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.segmentCount()).toBe(3)
    })

    it('handles large segment size', () => {
      const q = new SegmentQueue({ segmentSize: 1000 })
      q.enqueue(1)
      expect(q.segmentCount()).toBe(1)
    })
  })

  describe('enqueue', () => {
    let q: SegmentQueue<number>

    beforeEach(() => {
      q = new SegmentQueue({ segmentSize: 3 })
    })

    it('adds element to empty queue', () => {
      q.enqueue(1)
      expect(q.size).toBe(1)
      expect(q.isEmpty()).toBe(false)
    })

    it('adds element to current segment', () => {
      q.enqueue(1)
      q.enqueue(2)
      expect(q.currentSegmentSize()).toBe(2)
      expect(q.segmentCount()).toBe(1)
    })

    it('creates new segment when current is full', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.segmentCount()).toBe(2)
    })

    it('maintains segment boundaries correctly', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.segmentCount()).toBe(1)
      q.enqueue(4)
      expect(q.segmentCount()).toBe(2)
    })

    it('tracks enqueued count', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.getStatistics().enqueued).toBe(3)
    })

    it('handles string values', () => {
      const sq = new SegmentQueue<string>({ segmentSize: 2 })
      sq.enqueue('a')
      sq.enqueue('b')
      sq.enqueue('c')
      expect(sq.size).toBe(3)
    })

    it('handles object values', () => {
      const sq = new SegmentQueue<{ id: number }>({ segmentSize: 2 })
      sq.enqueue({ id: 1 })
      sq.enqueue({ id: 2 })
      expect(sq.size).toBe(2)
    })

    it('handles null values', () => {
      const sq = new SegmentQueue<null>( { segmentSize: 2 })
      sq.enqueue(null)
      sq.enqueue(null)
      expect(sq.size).toBe(2)
    })

    it('handles undefined values', () => {
      const sq = new SegmentQueue<undefined>({ segmentSize: 2 })
      sq.enqueue(undefined)
      sq.enqueue(undefined)
      expect(sq.size).toBe(2)
    })

    it('fills multiple segments', () => {
      for (let i = 0; i < 9; i++) {
        q.enqueue(i)
      }
      expect(q.segmentCount()).toBe(3)
    })

    it('increments segmentsCreated for each new segment', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.getStatistics().segmentsCreated).toBe(1)
      q.enqueue(4)
      expect(q.getStatistics().segmentsCreated).toBe(2)
    })
  })

  describe('dequeue', () => {
    let q: SegmentQueue<number>

    beforeEach(() => {
      q = new SegmentQueue({ segmentSize: 3 })
    })

    it('returns undefined from empty queue', () => {
      expect(q.dequeue()).toBeUndefined()
    })

    it('removes and returns front element', () => {
      q.enqueue(1)
      q.enqueue(2)
      expect(q.dequeue()).toBe(1)
      expect(q.size).toBe(1)
    })

    it('removes segment when last element dequeued', () => {
      q.enqueue(1)
      q.dequeue()
      expect(q.segmentCount()).toBe(0)
    })

    it('does not remove segment when elements remain', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.segmentCount()).toBe(1)
    })

    it('maintains FIFO order across segments', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
      expect(q.dequeue()).toBe(4)
    })

    it('increments dequeued count', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.getStatistics().dequeued).toBe(1)
    })

    it('increments segmentsCompleted when segment emptied', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.dequeue()
      expect(q.getStatistics().segmentsCompleted).toBe(0)
      q.dequeue()
      expect(q.getStatistics().segmentsCompleted).toBe(1)
    })

    it('handles dequeue across segment boundaries', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.dequeue()
      q.dequeue()
      q.dequeue()
      expect(q.segmentCount()).toBe(1)
      expect(q.peek()).toBe(4)
    })

    it('dequeues all elements correctly', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
      expect(q.isEmpty()).toBe(true)
    })
  })

  describe('dequeueSegment', () => {
    let q: SegmentQueue<number>

    beforeEach(() => {
      q = new SegmentQueue({ segmentSize: 3 })
    })

    it('returns empty array from empty queue', () => {
      expect(q.dequeueSegment()).toEqual([])
    })

    it('removes and returns entire first segment', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.dequeueSegment()).toEqual([1, 2, 3])
    })

    it('removes partial segment', () => {
      q.enqueue(1)
      q.enqueue(2)
      expect(q.dequeueSegment()).toEqual([1, 2])
    })

    it('decrements segment count', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.dequeueSegment()
      expect(q.segmentCount()).toBe(1)
    })

    it('updates dequeued count by segment length', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeueSegment()
      expect(q.getStatistics().dequeued).toBe(3)
    })

    it('increments segmentsCompleted', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeueSegment()
      expect(q.getStatistics().segmentsCompleted).toBe(1)
    })

    it('handles multiple segment dequeues', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      q.enqueue(6)
      expect(q.dequeueSegment()).toEqual([1, 2, 3])
      expect(q.dequeueSegment()).toEqual([4, 5, 6])
      expect(q.isEmpty()).toBe(true)
    })

    it('returns remaining partial segment', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.dequeueSegment()).toEqual([1, 2, 3])
      expect(q.dequeueSegment()).toEqual([4])
    })
  })

  describe('peek', () => {
    let q: SegmentQueue<number>

    beforeEach(() => {
      q = new SegmentQueue({ segmentSize: 3 })
    })

    it('returns undefined from empty queue', () => {
      expect(q.peek()).toBeUndefined()
    })

    it('returns front element without removing', () => {
      q.enqueue(1)
      q.enqueue(2)
      expect(q.peek()).toBe(1)
      expect(q.size).toBe(2)
    })

    it('returns same element on repeated calls', () => {
      q.enqueue(42)
      expect(q.peek()).toBe(42)
      expect(q.peek()).toBe(42)
    })

    it('works across segment boundaries', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.dequeue()
      expect(q.peek()).toBe(2)
    })

    it('returns undefined after all elements dequeued', () => {
      q.enqueue(1)
      q.dequeue()
      expect(q.peek()).toBeUndefined()
    })
  })

  describe('peekSegment', () => {
    let q: SegmentQueue<number>

    beforeEach(() => {
      q = new SegmentQueue({ segmentSize: 3 })
    })

    it('returns empty array from empty queue', () => {
      expect(q.peekSegment()).toEqual([])
    })

    it('returns copy of first segment', () => {
      q.enqueue(1)
      q.enqueue(2)
      expect(q.peekSegment()).toEqual([1, 2])
    })

    it('does not modify the queue', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.peekSegment()
      expect(q.size).toBe(2)
      expect(q.segmentCount()).toBe(1)
    })

    it('returns full segment', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.peekSegment()).toEqual([1, 2, 3])
    })

    it('returns partial segment after dequeue', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect(q.peekSegment()).toEqual([2, 3])
    })

    it('returns new array each time', () => {
      q.enqueue(1)
      const a = q.peekSegment()
      const b = q.peekSegment()
      expect(a).not.toBe(b)
    })
  })

  describe('currentSegmentSize', () => {
    let q: SegmentQueue<number>

    beforeEach(() => {
      q = new SegmentQueue({ segmentSize: 3 })
    })

    it('returns 0 for empty queue', () => {
      expect(q.currentSegmentSize()).toBe(0)
    })

    it('returns size of current (last) segment', () => {
      q.enqueue(1)
      q.enqueue(2)
      expect(q.currentSegmentSize()).toBe(2)
    })

    it('resets when new segment starts', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.currentSegmentSize()).toBe(3)
      q.enqueue(4)
      expect(q.currentSegmentSize()).toBe(1)
    })

    it('updates correctly after dequeue', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.dequeue()
      expect(q.currentSegmentSize()).toBe(1)
    })
  })

  describe('segmentCount', () => {
    it('returns 0 for empty queue', () => {
      const q = new SegmentQueue({ segmentSize: 2 })
      expect(q.segmentCount()).toBe(0)
    })

    it('returns 1 after first enqueue', () => {
      const q = new SegmentQueue({ segmentSize: 2 })
      q.enqueue(1)
      expect(q.segmentCount()).toBe(1)
    })

    it('increments when new segment created', () => {
      const q = new SegmentQueue({ segmentSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.segmentCount()).toBe(2)
    })

    it('decrements when segment emptied by dequeue', () => {
      const q = new SegmentQueue({ segmentSize: 2 })
      q.enqueue(1)
      q.dequeue()
      expect(q.segmentCount()).toBe(0)
    })

    it('decrements when segment removed by dequeueSegment', () => {
      const q = new SegmentQueue({ segmentSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeueSegment()
      expect(q.segmentCount()).toBe(1)
    })
  })

  describe('size and isEmpty', () => {
    let q: SegmentQueue<number>

    beforeEach(() => {
      q = new SegmentQueue({ segmentSize: 2 })
    })

    it('size is 0 for empty queue', () => {
      expect(q.size).toBe(0)
    })

    it('size increments on enqueue', () => {
      q.enqueue(1)
      expect(q.size).toBe(1)
    })

    it('size decrements on dequeue', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.size).toBe(1)
    })

    it('size decreases by segment length on dequeueSegment', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeueSegment()
      expect(q.size).toBe(1)
    })

    it('isEmpty returns true initially', () => {
      expect(q.isEmpty()).toBe(true)
    })

    it('isEmpty returns false after enqueue', () => {
      q.enqueue(1)
      expect(q.isEmpty()).toBe(false)
    })

    it('isEmpty returns true after all dequeued', () => {
      q.enqueue(1)
      q.dequeue()
      expect(q.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('resets empty queue', () => {
      const q = new SegmentQueue({ segmentSize: 2 })
      q.clear()
      expect(q.size).toBe(0)
      expect(q.segmentCount()).toBe(0)
    })

    it('removes all elements', () => {
      const q = new SegmentQueue({ segmentSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.clear()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
      expect(q.segmentCount()).toBe(0)
    })

    it('resets statistics', () => {
      const q = new SegmentQueue({ segmentSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.clear()
      const stats = q.getStatistics()
      expect(stats.enqueued).toBe(0)
      expect(stats.dequeued).toBe(0)
      expect(stats.segmentsCreated).toBe(0)
      expect(stats.segmentsCompleted).toBe(0)
    })

    it('allows reuse after clear', () => {
      const q = new SegmentQueue({ segmentSize: 2 })
      q.enqueue(1)
      q.clear()
      q.enqueue(2)
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(2)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty queue', () => {
      const q = new SegmentQueue({ segmentSize: 2 })
      expect(q.toArray()).toEqual([])
    })

    it('returns all elements flat', () => {
      const q = new SegmentQueue({ segmentSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('maintains insertion order', () => {
      const q = new SegmentQueue({ segmentSize: 2 })
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      q.enqueue(40)
      expect(q.toArray()).toEqual([10, 20, 30, 40])
    })

    it('returns copy after partial dequeue', () => {
      const q = new SegmentQueue({ segmentSize: 3 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.dequeue()
      expect(q.toArray()).toEqual([2, 3, 4])
    })

    it('does not modify queue', () => {
      const q = new SegmentQueue({ segmentSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.toArray()
      expect(q.size).toBe(2)
    })
  })

  describe('toSegments', () => {
    it('returns empty array for empty queue', () => {
      const q = new SegmentQueue({ segmentSize: 2 })
      expect(q.toSegments()).toEqual([])
    })

    it('returns segments as array of arrays', () => {
      const q = new SegmentQueue({ segmentSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.toSegments()).toEqual([[1, 2], [3]])
    })

    it('returns multiple full segments', () => {
      const q = new SegmentQueue({ segmentSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.toSegments()).toEqual([[1, 2], [3, 4]])
    })

    it('returns new arrays each call', () => {
      const q = new SegmentQueue({ segmentSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      const a = q.toSegments()
      const b = q.toSegments()
      expect(a).not.toBe(b)
      expect(a[0]).not.toBe(b[0])
    })

    it('reflects partial dequeue', () => {
      const q = new SegmentQueue({ segmentSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect(q.toSegments()).toEqual([[2], [3]])
    })
  })

  describe('forEach', () => {
    it('does nothing on empty queue', () => {
      const q = new SegmentQueue({ segmentSize: 2 })
      const items: number[] = []
      q.forEach(v => items.push(v))
      expect(items).toEqual([])
    })

    it('iterates all elements in order', () => {
      const q = new SegmentQueue({ segmentSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const items: number[] = []
      q.forEach(v => items.push(v))
      expect(items).toEqual([1, 2, 3])
    })

    it('provides correct index', () => {
      const q = new SegmentQueue({ segmentSize: 2 })
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      const indices: number[] = []
      q.forEach((_, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('iterates across segment boundaries', () => {
      const q = new SegmentQueue({ segmentSize: 1 })
      q.enqueue('a')
      q.enqueue('b')
      q.enqueue('c')
      const items: string[] = []
      q.forEach(v => items.push(v))
      expect(items).toEqual(['a', 'b', 'c'])
    })
  })

  describe('Symbol.iterator', () => {
    it('yields nothing for empty queue', () => {
      const q = new SegmentQueue({ segmentSize: 2 })
      expect([...q]).toEqual([])
    })

    it('yields all elements in order', () => {
      const q = new SegmentQueue({ segmentSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect([...q]).toEqual([1, 2, 3])
    })

    it('works with for...of', () => {
      const q = new SegmentQueue<number>({ segmentSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const sum: number[] = []
      for (const item of q) {
        sum.push(item)
      }
      expect(sum).toEqual([1, 2, 3])
    })

    it('works with spread in Array.from', () => {
      const q = new SegmentQueue({ segmentSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      expect(Array.from(q)).toEqual([1, 2])
    })

    it('works with destructuring', () => {
      const q = new SegmentQueue({ segmentSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const [first, ...rest] = q
      expect(first).toBe(1)
      expect(rest).toEqual([2, 3])
    })
  })

  describe('flushSegment', () => {
    let q: SegmentQueue<number>

    beforeEach(() => {
      q = new SegmentQueue({ segmentSize: 5 })
    })

    it('returns empty array for empty queue', () => {
      expect(q.flushSegment()).toEqual([])
    })

    it('returns and removes current segment', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.flushSegment()).toEqual([1, 2, 3])
      expect(q.isEmpty()).toBe(true)
    })

    it('creates new empty segment after flush', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      q.flushSegment()
      q.enqueue(6)
      expect(q.size).toBe(1)
    })

    it('only flushes the last segment', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      q.enqueue(6)
      const flushed = q.flushSegment()
      expect(flushed).toEqual([6])
      expect(q.size).toBe(5)
    })

    it('returns empty array if last segment is already empty', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      q.flushSegment()
      expect(q.flushSegment()).toEqual([])
    })

    it('handles flush on partially filled segment', () => {
      q.enqueue(1)
      expect(q.flushSegment()).toEqual([1])
    })
  })

  describe('getStatistics', () => {
    it('returns zeroed stats for empty queue', () => {
      const q = new SegmentQueue({ segmentSize: 2 })
      const stats = q.getStatistics()
      expect(stats.enqueued).toBe(0)
      expect(stats.dequeued).toBe(0)
      expect(stats.segmentsCreated).toBe(0)
      expect(stats.segmentsCompleted).toBe(0)
    })

    it('tracks enqueued count', () => {
      const q = new SegmentQueue({ segmentSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.getStatistics().enqueued).toBe(3)
    })

    it('tracks dequeued count', () => {
      const q = new SegmentQueue({ segmentSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.getStatistics().dequeued).toBe(1)
    })

    it('tracks segmentsCreated', () => {
      const q = new SegmentQueue({ segmentSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.getStatistics().segmentsCreated).toBe(2)
    })

    it('tracks segmentsCompleted via dequeue', () => {
      const q = new SegmentQueue({ segmentSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.dequeue()
      expect(q.getStatistics().segmentsCompleted).toBe(1)
    })

    it('tracks segmentsCompleted via dequeueSegment', () => {
      const q = new SegmentQueue({ segmentSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeueSegment()
      expect(q.getStatistics().segmentsCompleted).toBe(1)
    })

    it('returns a snapshot', () => {
      const q = new SegmentQueue({ segmentSize: 2 })
      q.enqueue(1)
      const s1 = q.getStatistics()
      q.enqueue(2)
      const s2 = q.getStatistics()
      expect(s1.enqueued).toBe(1)
      expect(s2.enqueued).toBe(2)
    })
  })

  describe('integration scenarios', () => {
    it('handles enqueue and dequeue interleaved', () => {
      const q = new SegmentQueue<number>({ segmentSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.dequeue()).toBe(1)
      q.enqueue(3)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
      expect(q.isEmpty()).toBe(true)
    })

    it('handles batch processing with dequeueSegment', () => {
      const q = new SegmentQueue<number>({ segmentSize: 3 })
      for (let i = 1; i <= 9; i++) {
        q.enqueue(i)
      }
      const batch1 = q.dequeueSegment()
      const batch2 = q.dequeueSegment()
      const batch3 = q.dequeueSegment()
      expect(batch1).toEqual([1, 2, 3])
      expect(batch2).toEqual([4, 5, 6])
      expect(batch3).toEqual([7, 8, 9])
    })

    it('handles flush and continue', () => {
      const q = new SegmentQueue<number>({ segmentSize: 3 })
      q.enqueue(1)
      q.enqueue(2)
      const flushed = q.flushSegment()
      q.enqueue(3)
      q.enqueue(4)
      expect(flushed).toEqual([1, 2])
      expect(q.toArray()).toEqual([3, 4])
    })

    it('handles mixed operations', () => {
      const q = new SegmentQueue<number>({ segmentSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.dequeue()).toBe(1)
      expect(q.peekSegment()).toEqual([2])
      expect(q.peek()).toBe(2)
      q.enqueue(4)
      expect(q.toSegments()).toEqual([[2], [3, 4]])
      q.dequeueSegment()
      expect(q.toArray()).toEqual([3, 4])
    })

    it('handles large volume', () => {
      const q = new SegmentQueue<number>({ segmentSize: 100 })
      for (let i = 0; i < 1000; i++) {
        q.enqueue(i)
      }
      expect(q.size).toBe(1000)
      expect(q.segmentCount()).toBe(10)
      for (let i = 0; i < 1000; i++) {
        expect(q.dequeue()).toBe(i)
      }
      expect(q.isEmpty()).toBe(true)
    })

    it('handles string type', () => {
      const q = new SegmentQueue<string>({ segmentSize: 2 })
      q.enqueue('hello')
      q.enqueue('world')
      q.enqueue('foo')
      expect(q.dequeue()).toBe('hello')
      expect(q.peek()).toBe('world')
    })

    it('handles object type', () => {
      const q = new SegmentQueue<{ x: number; y: number }>({ segmentSize: 2 })
      q.enqueue({ x: 1, y: 2 })
      q.enqueue({ x: 3, y: 4 })
      const first = q.dequeue()!
      expect(first.x).toBe(1)
      expect(first.y).toBe(2)
    })

    it('statistics are consistent after full cycle', () => {
      const q = new SegmentQueue<number>({ segmentSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.dequeue()
      q.dequeue()
      q.dequeueSegment()
      const stats = q.getStatistics()
      expect(stats.enqueued).toBe(4)
      expect(stats.dequeued).toBe(4)
      expect(stats.segmentsCreated).toBe(2)
      expect(stats.segmentsCompleted).toBe(2)
    })

    it('clear and rebuild', () => {
      const q = new SegmentQueue<number>({ segmentSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.clear()
      expect(q.getStatistics().enqueued).toBe(0)
      q.enqueue(10)
      q.enqueue(20)
      expect(q.toArray()).toEqual([10, 20])
      expect(q.getStatistics().enqueued).toBe(2)
    })

    it('forEach after partial dequeue', () => {
      const q = new SegmentQueue<number>({ segmentSize: 3 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.dequeue()
      const items: number[] = []
      q.forEach(v => items.push(v))
      expect(items).toEqual([2, 3, 4])
    })

    it('iterator after partial dequeue', () => {
      const q = new SegmentQueue<number>({ segmentSize: 3 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.dequeue()
      expect([...q]).toEqual([2, 3, 4])
    })

    it('segment size 1 edge case', () => {
      const q = new SegmentQueue<number>({ segmentSize: 1 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.segmentCount()).toBe(3)
      expect(q.dequeueSegment()).toEqual([1])
      expect(q.segmentCount()).toBe(2)
    })

    it('reuses types correctly', () => {
      const options: SegmentQueueOptions = { segmentSize: 5 }
      const q = new SegmentQueue<number>(options)
      q.enqueue(1)
      const stats: SegmentQueueStatistics = q.getStatistics()
      expect(stats.enqueued).toBe(1)
    })

    it('flushSegment on queue with single partial segment', () => {
      const q = new SegmentQueue<number>({ segmentSize: 10 })
      q.enqueue(1)
      q.enqueue(2)
      const flushed = q.flushSegment()
      expect(flushed).toEqual([1, 2])
      expect(q.size).toBe(0)
    })

    it('multiple flushSegment calls', () => {
      const q = new SegmentQueue<number>({ segmentSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const f1 = q.flushSegment()
      expect(f1).toEqual([3])
      const f2 = q.flushSegment()
      expect(f2).toEqual([1, 2])
      expect(q.isEmpty()).toBe(true)
    })

    it('peek after flushSegment', () => {
      const q = new SegmentQueue<number>({ segmentSize: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.flushSegment()
      expect(q.peek()).toBe(1)
    })
  })
})
