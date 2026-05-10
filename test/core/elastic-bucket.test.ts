import { describe, it, expect, beforeEach } from 'vitest'
import { ElasticBucket } from '../../src/core/elastic-bucket/elastic-bucket.js'
import { DEFAULT_ELASTIC_BUCKET_OPTIONS } from '../../src/core/elastic-bucket/types.js'
import type { ElasticBucketOptions, ElasticBucketStatistics } from '../../src/core/elastic-bucket/types.js'

describe('ElasticBucket', () => {
  describe('constructor', () => {
    it('creates empty bucket with default options', () => {
      const bucket = new ElasticBucket<number>()
      expect(bucket.size).toBe(0)
      expect(bucket.isEmpty()).toBe(true)
    })

    it('creates bucket with custom chunk size via options', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      expect(bucket.size).toBe(0)
    })

    it('creates bucket with default chunk size constant', () => {
      expect(DEFAULT_ELASTIC_BUCKET_OPTIONS.chunkSize).toBe(64)
    })

    it('creates bucket with chunk size 1', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 1 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      expect(bucket.toArray()).toEqual([1, 2])
      expect(bucket.chunkCount()).toBe(2)
    })

    it('clamps chunk size to 1 for fractional values', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 0.5 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      expect(bucket.chunkCount()).toBe(2)
    })

    it('clamps chunk size to 1 for zero', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 0 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      expect(bucket.chunkCount()).toBe(2)
    })

    it('clamps chunk size to 1 for negative', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: -10 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      expect(bucket.chunkCount()).toBe(2)
    })

    it('accepts undefined options', () => {
      const bucket = new ElasticBucket<number>(undefined)
      expect(bucket.size).toBe(0)
    })

    it('accepts empty options object', () => {
      const bucket = new ElasticBucket<number>({})
      expect(bucket.size).toBe(0)
    })
  })

  describe('pushBack', () => {
    it('pushes a single value', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(10)
      expect(bucket.size).toBe(1)
      expect(bucket.peekFront()).toBe(10)
      expect(bucket.peekBack()).toBe(10)
    })

    it('pushes multiple values in order', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.pushBack(3)
      expect(bucket.toArray()).toEqual([1, 2, 3])
    })

    it('creates new chunk when current is full', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 2 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.pushBack(3)
      expect(bucket.chunkCount()).toBe(2)
      expect(bucket.toArray()).toEqual([1, 2, 3])
    })

    it('handles many pushes across multiple chunks', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 3 })
      for (let i = 0; i < 10; i++) {
        bucket.pushBack(i)
      }
      expect(bucket.size).toBe(10)
      expect(bucket.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('updates statistics on push', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      const stats = bucket.getStatistics()
      expect(stats.pushes).toBe(2)
    })

    it('handles string values', () => {
      const bucket = new ElasticBucket<string>({ chunkSize: 2 })
      bucket.pushBack('a')
      bucket.pushBack('b')
      bucket.pushBack('c')
      expect(bucket.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('handles null and undefined values stored as elements', () => {
      const bucket = new ElasticBucket<number | null>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushBack(null!)
      bucket.pushBack(3)
      expect(bucket.at(1)).toBe(null)
    })

    it('handles object values', () => {
      const bucket = new ElasticBucket<{ x: number }>({ chunkSize: 2 })
      bucket.pushBack({ x: 1 })
      bucket.pushBack({ x: 2 })
      expect(bucket.at(0)!.x).toBe(1)
      expect(bucket.at(1)!.x).toBe(2)
    })

    it('fills exactly one chunk', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 3 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.pushBack(3)
      expect(bucket.chunkCount()).toBe(1)
      expect(bucket.toArray()).toEqual([1, 2, 3])
    })

    it('overflows to second chunk correctly', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 2 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      expect(bucket.chunkCount()).toBe(1)
      bucket.pushBack(3)
      expect(bucket.chunkCount()).toBe(2)
    })
  })

  describe('pushFront', () => {
    it('pushes a single value to front', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushFront(10)
      expect(bucket.peekFront()).toBe(10)
    })

    it('pushes multiple values in reverse order to front', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushFront(1)
      bucket.pushFront(2)
      bucket.pushFront(3)
      expect(bucket.toArray()).toEqual([3, 2, 1])
    })

    it('creates new chunk when first chunk is full', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 2 })
      bucket.pushFront(1)
      bucket.pushFront(2)
      bucket.pushFront(3)
      expect(bucket.chunkCount()).toBe(2)
      expect(bucket.toArray()).toEqual([3, 2, 1])
    })

    it('handles many pushes to front', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 3 })
      for (let i = 0; i < 10; i++) {
        bucket.pushFront(i)
      }
      expect(bucket.size).toBe(10)
      expect(bucket.toArray()).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1, 0])
    })

    it('updates statistics on pushFront', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushFront(1)
      const stats = bucket.getStatistics()
      expect(stats.pushes).toBe(1)
    })

    it('alternating pushFront and pushBack', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushFront(2)
      bucket.pushBack(3)
      bucket.pushFront(1)
      bucket.pushBack(4)
      expect(bucket.toArray()).toEqual([1, 2, 3, 4])
    })
  })

  describe('popFront', () => {
    it('throws on empty bucket', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      expect(() => bucket.popFront()).toThrow(RangeError)
    })

    it('pops the only element', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(42)
      expect(bucket.popFront()).toBe(42)
      expect(bucket.size).toBe(0)
    })

    it('pops in FIFO order', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.pushBack(3)
      expect(bucket.popFront()).toBe(1)
      expect(bucket.popFront()).toBe(2)
      expect(bucket.popFront()).toBe(3)
    })

    it('removes empty chunk after pop', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 2 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.pushBack(3)
      expect(bucket.chunkCount()).toBe(2)
      bucket.popFront()
      bucket.popFront()
      expect(bucket.chunkCount()).toBe(1)
      expect(bucket.toArray()).toEqual([3])
    })

    it('updates statistics on pop', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.popFront()
      const stats = bucket.getStatistics()
      expect(stats.pops).toBe(1)
    })

    it('pop after pushFront returns correct order', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushFront(1)
      bucket.pushFront(2)
      expect(bucket.popFront()).toBe(2)
      expect(bucket.popFront()).toBe(1)
    })

    it('interleaved push and pop front', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      expect(bucket.popFront()).toBe(1)
      bucket.pushBack(3)
      expect(bucket.popFront()).toBe(2)
      expect(bucket.toArray()).toEqual([3])
    })
  })

  describe('popBack', () => {
    it('throws on empty bucket', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      expect(() => bucket.popBack()).toThrow(RangeError)
    })

    it('pops the only element', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(42)
      expect(bucket.popBack()).toBe(42)
      expect(bucket.size).toBe(0)
    })

    it('pops in LIFO order', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.pushBack(3)
      expect(bucket.popBack()).toBe(3)
      expect(bucket.popBack()).toBe(2)
      expect(bucket.popBack()).toBe(1)
    })

    it('removes empty chunk after popBack', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 2 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.pushBack(3)
      expect(bucket.chunkCount()).toBe(2)
      bucket.popBack()
      bucket.popBack()
      expect(bucket.chunkCount()).toBe(1)
    })

    it('updates statistics on popBack', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.popBack()
      const stats = bucket.getStatistics()
      expect(stats.pops).toBe(1)
    })

    it('popBack after pushFront', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushFront(1)
      bucket.pushFront(2)
      expect(bucket.popBack()).toBe(1)
      expect(bucket.popBack()).toBe(2)
    })
  })

  describe('peekFront', () => {
    it('throws on empty bucket', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      expect(() => bucket.peekFront()).toThrow(RangeError)
    })

    it('returns first element without removing', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      expect(bucket.peekFront()).toBe(1)
      expect(bucket.size).toBe(2)
    })

    it('reflects pushFront correctly', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushFront(0)
      expect(bucket.peekFront()).toBe(0)
    })

    it('reflects popFront correctly', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.popFront()
      expect(bucket.peekFront()).toBe(2)
    })
  })

  describe('peekBack', () => {
    it('throws on empty bucket', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      expect(() => bucket.peekBack()).toThrow(RangeError)
    })

    it('returns last element without removing', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      expect(bucket.peekBack()).toBe(2)
      expect(bucket.size).toBe(2)
    })

    it('reflects pushBack correctly', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushBack(99)
      expect(bucket.peekBack()).toBe(99)
    })

    it('reflects popBack correctly', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.popBack()
      expect(bucket.peekBack()).toBe(1)
    })
  })

  describe('at', () => {
    it('throws on negative index', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      expect(() => bucket.at(-1)).toThrow(RangeError)
    })

    it('throws on index >= size', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      expect(() => bucket.at(1)).toThrow(RangeError)
    })

    it('throws on empty bucket', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      expect(() => bucket.at(0)).toThrow(RangeError)
    })

    it('returns element at index 0', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(10)
      bucket.pushBack(20)
      expect(bucket.at(0)).toBe(10)
    })

    it('returns element at last index', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(10)
      bucket.pushBack(20)
      expect(bucket.at(1)).toBe(20)
    })

    it('returns elements across chunk boundaries', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 2 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.pushBack(3)
      bucket.pushBack(4)
      expect(bucket.at(0)).toBe(1)
      expect(bucket.at(1)).toBe(2)
      expect(bucket.at(2)).toBe(3)
      expect(bucket.at(3)).toBe(4)
    })

    it('returns elements with pushFront offset', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushFront(3)
      bucket.pushFront(2)
      bucket.pushFront(1)
      expect(bucket.at(0)).toBe(1)
      expect(bucket.at(1)).toBe(2)
      expect(bucket.at(2)).toBe(3)
    })

    it('works with large buckets', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 3 })
      for (let i = 0; i < 100; i++) {
        bucket.pushBack(i)
      }
      for (let i = 0; i < 100; i++) {
        expect(bucket.at(i)).toBe(i)
      }
    })
  })

  describe('setAt', () => {
    it('throws on out of bounds', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      expect(() => bucket.setAt(0, 1)).toThrow(RangeError)
    })

    it('sets value at index 0', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.setAt(0, 99)
      expect(bucket.at(0)).toBe(99)
    })

    it('sets value at middle index', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.pushBack(3)
      bucket.setAt(1, 99)
      expect(bucket.at(1)).toBe(99)
      expect(bucket.at(0)).toBe(1)
      expect(bucket.at(2)).toBe(3)
    })

    it('sets value at last index', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.setAt(1, 99)
      expect(bucket.at(1)).toBe(99)
    })

    it('sets value across chunk boundaries', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 2 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.pushBack(3)
      bucket.setAt(2, 99)
      expect(bucket.at(2)).toBe(99)
      expect(bucket.at(0)).toBe(1)
      expect(bucket.at(1)).toBe(2)
    })
  })

  describe('insertAt', () => {
    it('inserts at index 0 (delegates to pushFront)', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(2)
      bucket.pushBack(3)
      bucket.insertAt(0, 1)
      expect(bucket.toArray()).toEqual([1, 2, 3])
    })

    it('inserts at end (delegates to pushBack)', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.insertAt(2, 3)
      expect(bucket.toArray()).toEqual([1, 2, 3])
    })

    it('inserts in middle', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushBack(3)
      bucket.insertAt(1, 2)
      expect(bucket.toArray()).toEqual([1, 2, 3])
    })

    it('throws on out of bounds index', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      expect(() => bucket.insertAt(2, 2)).toThrow(RangeError)
    })

    it('throws on negative index', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      expect(() => bucket.insertAt(-1, 2)).toThrow(RangeError)
    })

    it('updates size correctly', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushBack(3)
      bucket.insertAt(1, 2)
      expect(bucket.size).toBe(3)
    })

    it('updates insertAts statistic', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.insertAt(1, 2)
      expect(bucket.getStatistics().insertAts).toBe(1)
    })

    it('inserts into a partially full chunk', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.pushBack(4)
      bucket.insertAt(2, 3)
      expect(bucket.toArray()).toEqual([1, 2, 3, 4])
    })

    it('inserts when bucket has single empty element', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(2)
      bucket.insertAt(0, 1)
      expect(bucket.toArray()).toEqual([1, 2])
    })
  })

  describe('removeAt', () => {
    it('throws on out of bounds', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      expect(() => bucket.removeAt(0)).toThrow(RangeError)
    })

    it('throws on negative index', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      expect(() => bucket.removeAt(-1)).toThrow(RangeError)
    })

    it('removes first element (delegates to popFront)', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.pushBack(3)
      expect(bucket.removeAt(0)).toBe(1)
      expect(bucket.toArray()).toEqual([2, 3])
    })

    it('removes last element (delegates to popBack)', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.pushBack(3)
      expect(bucket.removeAt(2)).toBe(3)
      expect(bucket.toArray()).toEqual([1, 2])
    })

    it('removes middle element', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.pushBack(3)
      expect(bucket.removeAt(1)).toBe(2)
      expect(bucket.toArray()).toEqual([1, 3])
    })

    it('updates size after remove', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.pushBack(3)
      bucket.removeAt(1)
      expect(bucket.size).toBe(2)
    })

    it('updates removeAts statistic', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.removeAt(0)
      expect(bucket.getStatistics().removeAts).toBe(1)
    })

    it('removes element across chunk boundaries', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 2 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.pushBack(3)
      bucket.pushBack(4)
      expect(bucket.removeAt(2)).toBe(3)
      expect(bucket.toArray()).toEqual([1, 2, 4])
    })
  })

  describe('size', () => {
    it('returns 0 for empty bucket', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      expect(bucket.size).toBe(0)
    })

    it('increases on pushBack', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      expect(bucket.size).toBe(1)
    })

    it('decreases on popFront', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.popFront()
      expect(bucket.size).toBe(1)
    })

    it('reflects total after many operations', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      for (let i = 0; i < 10; i++) bucket.pushBack(i)
      for (let i = 0; i < 3; i++) bucket.popFront()
      for (let i = 0; i < 2; i++) bucket.popBack()
      expect(bucket.size).toBe(5)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new bucket', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      expect(bucket.isEmpty()).toBe(true)
    })

    it('returns false after push', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      expect(bucket.isEmpty()).toBe(false)
    })

    it('returns true after all elements popped', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.popFront()
      expect(bucket.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.clear()
      expect(bucket.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears a non-empty bucket', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.clear()
      expect(bucket.size).toBe(0)
      expect(bucket.isEmpty()).toBe(true)
      expect(bucket.chunkCount()).toBe(0)
    })

    it('clears an already empty bucket', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.clear()
      expect(bucket.size).toBe(0)
    })

    it('resets statistics', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.popFront()
      bucket.clear()
      const stats = bucket.getStatistics()
      expect(stats.pushes).toBe(0)
      expect(stats.pops).toBe(0)
      expect(stats.resizes).toBe(0)
      expect(stats.chunks).toBe(0)
    })

    it('allows operations after clear', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.clear()
      bucket.pushBack(2)
      expect(bucket.size).toBe(1)
      expect(bucket.at(0)).toBe(2)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty bucket', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      expect(bucket.toArray()).toEqual([])
    })

    it('returns single element array', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(42)
      expect(bucket.toArray()).toEqual([42])
    })

    it('returns all elements in order', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 2 })
      for (let i = 0; i < 5; i++) bucket.pushBack(i)
      expect(bucket.toArray()).toEqual([0, 1, 2, 3, 4])
    })

    it('reflects pushFront order', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 2 })
      bucket.pushFront(3)
      bucket.pushFront(2)
      bucket.pushFront(1)
      expect(bucket.toArray()).toEqual([1, 2, 3])
    })

    it('does not modify the bucket', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      const arr = bucket.toArray()
      expect(arr).toEqual([1, 2])
      expect(bucket.size).toBe(2)
    })

    it('returns new array each call', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      const a = bucket.toArray()
      const b = bucket.toArray()
      expect(a).not.toBe(b)
    })
  })

  describe('forEach', () => {
    it('does nothing on empty bucket', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      const result: number[] = []
      bucket.forEach((v) => result.push(v))
      expect(result).toEqual([])
    })

    it('iterates all elements in order', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 2 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.pushBack(3)
      const result: number[] = []
      bucket.forEach((v) => result.push(v))
      expect(result).toEqual([1, 2, 3])
    })

    it('provides correct index', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(10)
      bucket.pushBack(20)
      bucket.pushBack(30)
      const indices: number[] = []
      bucket.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('provides value and index together', () => {
      const bucket = new ElasticBucket<string>({ chunkSize: 4 })
      bucket.pushBack('a')
      bucket.pushBack('b')
      const pairs: [string, number][] = []
      bucket.forEach((v, i) => pairs.push([v, i]))
      expect(pairs).toEqual([['a', 0], ['b', 1]])
    })

    it('works with many elements across chunks', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 3 })
      for (let i = 0; i < 10; i++) bucket.pushBack(i)
      let sum = 0
      bucket.forEach((v) => { sum += v })
      expect(sum).toBe(45)
    })
  })

  describe('Symbol.iterator', () => {
    it('returns empty iterator for empty bucket', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      const result = [...bucket]
      expect(result).toEqual([])
    })

    it('iterates all elements in order', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 2 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.pushBack(3)
      expect([...bucket]).toEqual([1, 2, 3])
    })

    it('works with for-of loop', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(10)
      bucket.pushBack(20)
      bucket.pushBack(30)
      const result: number[] = []
      for (const v of bucket) {
        result.push(v)
      }
      expect(result).toEqual([10, 20, 30])
    })

    it('works across chunk boundaries', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 2 })
      for (let i = 0; i < 7; i++) bucket.pushBack(i)
      expect([...bucket]).toEqual([0, 1, 2, 3, 4, 5, 6])
    })

    it('can be used with spread in array destructuring', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.pushBack(3)
      const [a, b, c] = bucket
      expect(a).toBe(1)
      expect(b).toBe(2)
      expect(c).toBe(3)
    })
  })

  describe('capacity', () => {
    it('returns 0 for empty bucket', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      expect(bucket.capacity()).toBe(0)
    })

    it('returns chunkSize after first push', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      expect(bucket.capacity()).toBe(4)
    })

    it('returns total capacity across chunks', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 3 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.pushBack(3)
      bucket.pushBack(4)
      expect(bucket.capacity()).toBe(6)
    })

    it('capacity increases when new chunks are allocated', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 2 })
      expect(bucket.capacity()).toBe(0)
      bucket.pushBack(1)
      expect(bucket.capacity()).toBe(2)
      bucket.pushBack(2)
      expect(bucket.capacity()).toBe(2)
      bucket.pushBack(3)
      expect(bucket.capacity()).toBe(4)
    })
  })

  describe('compact', () => {
    it('compacts empty bucket', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.compact()
      expect(bucket.chunkCount()).toBe(0)
      expect(bucket.size).toBe(0)
    })

    it('compacts into minimal chunks', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      for (let i = 0; i < 10; i++) bucket.pushBack(i)
      bucket.popFront()
      bucket.popFront()
      bucket.popBack()
      bucket.compact()
      expect(bucket.chunkCount()).toBe(2)
      expect(bucket.toArray()).toEqual([2, 3, 4, 5, 6, 7, 8])
    })

    it('preserves all elements', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 2 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.pushBack(3)
      bucket.compact()
      expect(bucket.toArray()).toEqual([1, 2, 3])
      expect(bucket.size).toBe(3)
    })

    it('updates compactions statistic', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.compact()
      expect(bucket.getStatistics().compactions).toBe(1)
    })

    it('works after many push/pop cycles', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 2 })
      for (let i = 0; i < 20; i++) bucket.pushBack(i)
      for (let i = 0; i < 10; i++) bucket.popFront()
      for (let i = 0; i < 5; i++) bucket.popBack()
      bucket.compact()
      expect(bucket.toArray()).toEqual([10, 11, 12, 13, 14])
    })

    it('compacts single element', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.pushBack(3)
      bucket.popFront()
      bucket.popBack()
      bucket.compact()
      expect(bucket.chunkCount()).toBe(1)
      expect(bucket.toArray()).toEqual([2])
    })
  })

  describe('chunkCount', () => {
    it('returns 0 for empty bucket', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      expect(bucket.chunkCount()).toBe(0)
    })

    it('returns 1 after first push', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      expect(bucket.chunkCount()).toBe(1)
    })

    it('increases as chunks are added', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 2 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.pushBack(3)
      expect(bucket.chunkCount()).toBe(2)
    })

    it('decreases as empty chunks removed', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 2 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.pushBack(3)
      bucket.popFront()
      bucket.popFront()
      expect(bucket.chunkCount()).toBe(1)
    })
  })

  describe('getStatistics', () => {
    it('returns fresh statistics object', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      const stats = bucket.getStatistics()
      expect(stats).toEqual({
        pushes: 0,
        pops: 0,
        insertAts: 0,
        removeAts: 0,
        resizes: 0,
        chunks: 0,
        compactions: 0,
      })
    })

    it('tracks pushes', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushFront(2)
      expect(bucket.getStatistics().pushes).toBe(2)
    })

    it('tracks pops', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.popFront()
      bucket.popBack()
      expect(bucket.getStatistics().pops).toBe(2)
    })

    it('tracks insertAts', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushBack(3)
      bucket.insertAt(1, 2)
      expect(bucket.getStatistics().insertAts).toBe(1)
    })

    it('tracks removeAts', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.removeAt(0)
      expect(bucket.getStatistics().removeAts).toBe(1)
    })

    it('tracks resizes', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 2 })
      bucket.pushBack(1)
      expect(bucket.getStatistics().resizes).toBe(1)
      bucket.pushBack(2)
      bucket.pushBack(3)
      expect(bucket.getStatistics().resizes).toBe(2)
    })

    it('tracks compactions', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.compact()
      bucket.compact()
      expect(bucket.getStatistics().compactions).toBe(2)
    })

    it('tracks current chunk count', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 2 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.pushBack(3)
      expect(bucket.getStatistics().chunks).toBe(2)
    })

    it('returns a copy (not a reference)', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(1)
      const s1 = bucket.getStatistics()
      const s2 = bucket.getStatistics()
      expect(s1).toEqual(s2)
      expect(s1).not.toBe(s2)
    })
  })

  describe('stress / integration', () => {
    it('alternating pushFront/popBack acts as a queue', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      for (let i = 0; i < 10; i++) {
        bucket.pushFront(i)
      }
      for (let i = 0; i < 10; i++) {
        expect(bucket.popBack()).toBe(i)
      }
      expect(bucket.isEmpty()).toBe(true)
    })

    it('alternating pushBack/popFront acts as a queue', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      for (let i = 0; i < 10; i++) {
        bucket.pushBack(i)
      }
      for (let i = 0; i < 10; i++) {
        expect(bucket.popFront()).toBe(i)
      }
      expect(bucket.isEmpty()).toBe(true)
    })

    it('pushBack then popBack acts as a stack', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      for (let i = 0; i < 10; i++) {
        bucket.pushBack(i)
      }
      for (let i = 9; i >= 0; i--) {
        expect(bucket.popBack()).toBe(i)
      }
    })

    it('handles large number of operations', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 8 })
      for (let i = 0; i < 1000; i++) {
        if (i % 3 === 0) {
          bucket.pushFront(i)
        } else {
          bucket.pushBack(i)
        }
      }
      expect(bucket.size).toBe(1000)
      const arr = bucket.toArray()
      expect(arr.length).toBe(1000)
    })

    it('mixed operations maintain consistency', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 3 })
      const reference: number[] = []
      for (let i = 0; i < 50; i++) {
        bucket.pushBack(i)
        reference.push(i)
      }
      for (let i = 0; i < 10; i++) {
        const f = bucket.popFront()
        expect(f).toBe(reference.shift())
      }
      for (let i = 100; i < 110; i++) {
        bucket.pushFront(i)
        reference.unshift(i)
      }
      for (let i = 0; i < 5; i++) {
        const b = bucket.popBack()
        expect(b).toBe(reference.pop())
      }
      expect(bucket.toArray()).toEqual(reference)
    })

    it('insertAt and removeAt maintain order', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushBack(0)
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.pushBack(3)
      bucket.insertAt(2, 99)
      expect(bucket.toArray()).toEqual([0, 1, 99, 2, 3])
      bucket.removeAt(2)
      expect(bucket.toArray()).toEqual([0, 1, 2, 3])
    })

    it('forEach after compact works correctly', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 2 })
      for (let i = 0; i < 10; i++) bucket.pushBack(i)
      for (let i = 0; i < 5; i++) bucket.popFront()
      bucket.compact()
      const result: number[] = []
      bucket.forEach((v) => result.push(v))
      expect(result).toEqual([5, 6, 7, 8, 9])
    })

    it('iterator after compact works correctly', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 2 })
      for (let i = 0; i < 8; i++) bucket.pushBack(i)
      bucket.compact()
      expect([...bucket]).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    })

    it('setAt after pushFront works correctly', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      bucket.pushFront(1)
      bucket.pushFront(2)
      bucket.pushFront(3)
      bucket.setAt(1, 99)
      expect(bucket.toArray()).toEqual([3, 99, 1])
    })

    it('at returns correct values after many pushFront', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 3 })
      for (let i = 0; i < 9; i++) {
        bucket.pushFront(i)
      }
      expect(bucket.toArray()).toEqual([8, 7, 6, 5, 4, 3, 2, 1, 0])
      expect(bucket.at(0)).toBe(8)
      expect(bucket.at(8)).toBe(0)
    })

    it('handles chunkSize 1 stress test', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 1 })
      for (let i = 0; i < 20; i++) bucket.pushBack(i)
      expect(bucket.chunkCount()).toBe(20)
      for (let i = 0; i < 20; i++) {
        expect(bucket.popFront()).toBe(i)
      }
      expect(bucket.isEmpty()).toBe(true)
    })

    it('handles pushFront chunkSize 1', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 1 })
      bucket.pushFront(1)
      bucket.pushFront(2)
      bucket.pushFront(3)
      expect(bucket.toArray()).toEqual([3, 2, 1])
    })

    it('clear then reuse preserves functionality', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      for (let i = 0; i < 20; i++) bucket.pushBack(i)
      bucket.clear()
      bucket.pushBack(100)
      bucket.pushBack(200)
      expect(bucket.toArray()).toEqual([100, 200])
      expect(bucket.size).toBe(2)
    })

    it('compact on single full chunk', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 3 })
      bucket.pushBack(1)
      bucket.pushBack(2)
      bucket.pushBack(3)
      bucket.compact()
      expect(bucket.chunkCount()).toBe(1)
      expect(bucket.toArray()).toEqual([1, 2, 3])
    })

    it('getStatistics tracks all operation types', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 2 })
      bucket.pushBack(1)
      bucket.pushFront(0)
      bucket.insertAt(1, 99)
      bucket.removeAt(1)
      bucket.popFront()
      bucket.compact()
      const stats = bucket.getStatistics()
      expect(stats.pushes).toBe(2)
      expect(stats.pops).toBe(1)
      expect(stats.insertAts).toBe(1)
      expect(stats.removeAts).toBe(1)
      expect(stats.compactions).toBe(1)
    })

    it('capacity after compact reflects tight packing', () => {
      const bucket = new ElasticBucket<number>({ chunkSize: 4 })
      for (let i = 0; i < 10; i++) bucket.pushBack(i)
      bucket.popFront()
      bucket.popFront()
      bucket.popBack()
      bucket.compact()
      expect(bucket.capacity()).toBe(8)
      expect(bucket.size).toBe(7)
    })

    it('works with generic object types', () => {
      interface Item { id: number; name: string }
      const bucket = new ElasticBucket<Item>({ chunkSize: 2 })
      bucket.pushBack({ id: 1, name: 'a' })
      bucket.pushBack({ id: 2, name: 'b' })
      bucket.pushBack({ id: 3, name: 'c' })
      expect(bucket.at(1)!.name).toBe('b')
      bucket.setAt(1, { id: 20, name: 'bb' })
      expect(bucket.at(1)!.name).toBe('bb')
    })
  })
})
