import { describe, it, expect } from 'vitest'
import { ShuffleBuffer, DEFAULT_SHUFFLE_BUFFER_OPTIONS } from '../../src/core/shuffle-buffer/shuffle-buffer.js'
import type { ShuffleBufferOptions, ShuffleBufferStatistics } from '../../src/core/shuffle-buffer/shuffle-buffer.js'

describe('ShuffleBuffer', () => {
  describe('constructor', () => {
    it('creates buffer with default capacity', () => {
      const buf = new ShuffleBuffer<number>()
      expect(buf.capacity).toBe(DEFAULT_SHUFFLE_BUFFER_OPTIONS.capacity)
      expect(buf.size).toBe(0)
      expect(buf.isEmpty()).toBe(true)
    })

    it('creates buffer with custom capacity', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 10 })
      expect(buf.capacity).toBe(10)
    })

    it('throws on zero capacity', () => {
      expect(() => new ShuffleBuffer({ capacity: 0 })).toThrow('Capacity must be at least 1')
    })

    it('throws on negative capacity', () => {
      expect(() => new ShuffleBuffer({ capacity: -5 })).toThrow('Capacity must be at least 1')
    })

    it('throws on non-integer capacity', () => {
      expect(() => new ShuffleBuffer({ capacity: 3.5 })).toThrow('Capacity must be an integer')
    })

    it('accepts capacity of 1', () => {
      const buf = new ShuffleBuffer({ capacity: 1 })
      expect(buf.capacity).toBe(1)
    })

    it('starts with zero statistics', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      const stats = buf.getStatistics()
      expect(stats.pushes).toBe(0)
      expect(stats.pops).toBe(0)
      expect(stats.shuffles).toBe(0)
      expect(stats.samples).toBe(0)
      expect(stats.swaps).toBe(0)
      expect(stats.reverses).toBe(0)
    })
  })

  describe('push', () => {
    it('pushes items into buffer', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 3 })
      expect(buf.push(1)).toBe(true)
      expect(buf.push(2)).toBe(true)
      expect(buf.size).toBe(2)
    })

    it('returns false when buffer is full', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 2 })
      expect(buf.push(1)).toBe(true)
      expect(buf.push(2)).toBe(true)
      expect(buf.push(3)).toBe(false)
    })

    it('tracks push statistics', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      expect(buf.getStatistics().pushes).toBe(2)
    })

    it('does not increment pushes on failed push', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 1 })
      buf.push(1)
      buf.push(2)
      expect(buf.getStatistics().pushes).toBe(1)
    })

    it('handles string items', () => {
      const buf = new ShuffleBuffer<string>({ capacity: 3 })
      expect(buf.push('a')).toBe(true)
      expect(buf.push('b')).toBe(true)
      expect(buf.toArray()).toEqual(['a', 'b'])
    })

    it('handles null items', () => {
      const buf = new ShuffleBuffer<null>({ capacity: 3 })
      expect(buf.push(null)).toBe(true)
      expect(buf.contains(null)).toBe(true)
    })

    it('handles undefined items', () => {
      const buf = new ShuffleBuffer<undefined>({ capacity: 3 })
      expect(buf.push(undefined)).toBe(true)
    })

    it('handles object items', () => {
      const buf = new ShuffleBuffer<{ x: number }>({ capacity: 3 })
      const obj = { x: 1 }
      expect(buf.push(obj)).toBe(true)
      expect(buf.contains(obj)).toBe(true)
    })

    it('fills buffer to exact capacity', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      for (let i = 0; i < 5; i++) {
        expect(buf.push(i)).toBe(true)
      }
      expect(buf.isFull).toBe(true)
    })
  })

  describe('shuffle', () => {
    it('shuffles buffer contents', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 100 })
      for (let i = 0; i < 50; i++) {
        buf.push(i)
      }
      const before = buf.toArray()
      buf.shuffle()
      const after = buf.toArray()
      expect(after.length).toBe(before.length)
      expect(after.sort((a, b) => a - b)).toEqual(before)
    })

    it('tracks shuffle statistics', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.shuffle()
      expect(buf.getStatistics().shuffles).toBe(1)
    })

    it('handles shuffling empty buffer', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      expect(() => buf.shuffle()).not.toThrow()
    })

    it('handles shuffling single element', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(42)
      buf.shuffle()
      expect(buf.toArray()).toEqual([42])
    })

    it('handles shuffling two elements', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      buf.shuffle()
      expect(buf.toArray().sort((a, b) => a - b)).toEqual([1, 2])
    })

    it('preserves size after shuffle', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 10 })
      for (let i = 0; i < 7; i++) buf.push(i)
      buf.shuffle()
      expect(buf.size).toBe(7)
    })

    it('increments shuffle count on each call', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.shuffle()
      buf.shuffle()
      buf.shuffle()
      expect(buf.getStatistics().shuffles).toBe(3)
    })
  })

  describe('sample', () => {
    it('returns correct number of samples', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 10 })
      for (let i = 0; i < 10; i++) buf.push(i)
      const sample = buf.sample(5)
      expect(sample.length).toBe(5)
    })

    it('returns all elements when sample size exceeds buffer size', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      for (let i = 0; i < 3; i++) buf.push(i)
      const sample = buf.sample(10)
      expect(sample.length).toBe(3)
    })

    it('returns empty array for sample size 0', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      expect(buf.sample(0)).toEqual([])
    })

    it('returns empty array for empty buffer', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      expect(buf.sample(3)).toEqual([])
    })

    it('throws on negative sample size', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      expect(() => buf.sample(-1)).toThrow('Sample size must be non-negative')
    })

    it('throws on non-integer sample size', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      expect(() => buf.sample(2.5)).toThrow('Sample size must be an integer')
    })

    it('tracks sample statistics', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 10 })
      buf.push(1)
      buf.sample(1)
      expect(buf.getStatistics().samples).toBe(1)
    })

    it('returns elements that exist in buffer', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 10 })
      for (let i = 0; i < 10; i++) buf.push(i)
      const sample = buf.sample(5)
      for (const item of sample) {
        expect(buf.contains(item)).toBe(true)
      }
    })

    it('does not modify buffer contents', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 10 })
      for (let i = 0; i < 5; i++) buf.push(i)
      const before = buf.toArray()
      buf.sample(3)
      expect(buf.toArray()).toEqual(before)
    })

    it('increments sample count on each call', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 10 })
      buf.push(1)
      buf.sample(1)
      buf.sample(1)
      expect(buf.getStatistics().samples).toBe(2)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty buffer', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      expect(buf.toArray()).toEqual([])
    })

    it('returns all elements in order', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(10)
      buf.push(20)
      buf.push(30)
      expect(buf.toArray()).toEqual([10, 20, 30])
    })

    it('returns copy of elements', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      const arr = buf.toArray()
      arr.push(999)
      expect(buf.size).toBe(1)
    })
  })

  describe('clear', () => {
    it('clears all elements', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      buf.clear()
      expect(buf.size).toBe(0)
      expect(buf.isEmpty()).toBe(true)
    })

    it('allows pushing after clear', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 2 })
      buf.push(1)
      buf.push(2)
      buf.clear()
      expect(buf.push(3)).toBe(true)
      expect(buf.toArray()).toEqual([3])
    })

    it('does not reset statistics', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.clear()
      expect(buf.getStatistics().pushes).toBe(1)
    })

    it('handles clearing already empty buffer', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      expect(() => buf.clear()).not.toThrow()
    })
  })

  describe('peek', () => {
    it('returns last pushed element', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.peek()).toBe(3)
    })

    it('returns undefined for empty buffer', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      expect(buf.peek()).toBeUndefined()
    })

    it('does not remove element', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(42)
      buf.peek()
      expect(buf.size).toBe(1)
    })
  })

  describe('pop', () => {
    it('removes and returns last element', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.pop()).toBe(3)
      expect(buf.size).toBe(2)
    })

    it('returns undefined for empty buffer', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      expect(buf.pop()).toBeUndefined()
    })

    it('tracks pop statistics', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.pop()
      expect(buf.getStatistics().pops).toBe(1)
    })

    it('does not increment pops on empty pop', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.pop()
      expect(buf.getStatistics().pops).toBe(0)
    })

    it('pops all elements in LIFO order', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.pop()).toBe(3)
      expect(buf.pop()).toBe(2)
      expect(buf.pop()).toBe(1)
      expect(buf.isEmpty()).toBe(true)
    })

    it('allows push after pop', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 2 })
      buf.push(1)
      buf.push(2)
      buf.pop()
      expect(buf.push(3)).toBe(true)
      expect(buf.toArray()).toEqual([1, 3])
    })
  })

  describe('size and isEmpty', () => {
    it('reports correct size', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      expect(buf.size).toBe(0)
      buf.push(1)
      expect(buf.size).toBe(1)
      buf.push(2)
      expect(buf.size).toBe(2)
    })

    it('isEmpty returns true when empty', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      expect(buf.isEmpty()).toBe(true)
    })

    it('isEmpty returns false when not empty', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      expect(buf.isEmpty()).toBe(false)
    })
  })

  describe('at', () => {
    it('returns element at valid index', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(10)
      buf.push(20)
      buf.push(30)
      expect(buf.at(0)).toBe(10)
      expect(buf.at(1)).toBe(20)
      expect(buf.at(2)).toBe(30)
    })

    it('returns undefined for negative index', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      expect(buf.at(-1)).toBeUndefined()
    })

    it('returns undefined for out-of-bounds index', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      expect(buf.at(5)).toBeUndefined()
    })

    it('returns undefined for empty buffer', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      expect(buf.at(0)).toBeUndefined()
    })
  })

  describe('swap', () => {
    it('swaps two elements', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.swap(0, 2)
      expect(buf.toArray()).toEqual([3, 2, 1])
    })

    it('returns true for valid swap', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      expect(buf.swap(0, 1)).toBe(true)
    })

    it('returns false for out-of-bounds indices', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      expect(buf.swap(0, 5)).toBe(false)
    })

    it('returns false for negative indices', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      expect(buf.swap(-1, 0)).toBe(false)
    })

    it('tracks swap statistics', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      buf.swap(0, 1)
      expect(buf.getStatistics().swaps).toBe(1)
    })

    it('does not increment stats on failed swap', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.swap(0, 1)
      expect(buf.getStatistics().swaps).toBe(0)
    })

    it('handles swapping element with itself', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(42)
      buf.swap(0, 0)
      expect(buf.at(0)).toBe(42)
    })
  })

  describe('reverse', () => {
    it('reverses buffer contents', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.reverse()
      expect(buf.toArray()).toEqual([3, 2, 1])
    })

    it('tracks reverse statistics', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.reverse()
      expect(buf.getStatistics().reverses).toBe(1)
    })

    it('handles reversing empty buffer', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      expect(() => buf.reverse()).not.toThrow()
    })

    it('handles reversing single element', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(42)
      buf.reverse()
      expect(buf.toArray()).toEqual([42])
    })

    it('handles reversing two elements', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      buf.reverse()
      expect(buf.toArray()).toEqual([2, 1])
    })

    it('double reverse restores original order', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.reverse()
      buf.reverse()
      expect(buf.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('sort', () => {
    it('sorts in ascending order by default', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(3)
      buf.push(1)
      buf.push(2)
      buf.sort()
      expect(buf.toArray()).toEqual([1, 2, 3])
    })

    it('sorts with custom comparator', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.sort((a, b) => b - a)
      expect(buf.toArray()).toEqual([3, 2, 1])
    })

    it('handles sorting empty buffer', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      expect(() => buf.sort()).not.toThrow()
    })

    it('handles sorting single element', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(42)
      buf.sort()
      expect(buf.toArray()).toEqual([42])
    })

    it('handles sorting strings', () => {
      const buf = new ShuffleBuffer<string>({ capacity: 5 })
      buf.push('c')
      buf.push('a')
      buf.push('b')
      buf.sort()
      expect(buf.toArray()).toEqual(['a', 'b', 'c'])
    })
  })

  describe('capacity, remaining, isFull', () => {
    it('reports correct capacity', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 42 })
      expect(buf.capacity).toBe(42)
    })

    it('reports remaining space', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      expect(buf.remaining()).toBe(5)
      buf.push(1)
      expect(buf.remaining()).toBe(4)
      buf.push(2)
      buf.push(3)
      expect(buf.remaining()).toBe(2)
    })

    it('reports isFull correctly', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 2 })
      expect(buf.isFull).toBe(false)
      buf.push(1)
      expect(buf.isFull).toBe(false)
      buf.push(2)
      expect(buf.isFull).toBe(true)
    })

    it('isFull becomes false after pop', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 2 })
      buf.push(1)
      buf.push(2)
      buf.pop()
      expect(buf.isFull).toBe(false)
    })

    it('remaining is 0 when full', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 3 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.remaining()).toBe(0)
    })
  })

  describe('reset', () => {
    it('clears elements and resets statistics', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      buf.shuffle()
      buf.pop()
      buf.reset()
      expect(buf.size).toBe(0)
      expect(buf.isEmpty()).toBe(true)
      const stats = buf.getStatistics()
      expect(stats.pushes).toBe(0)
      expect(stats.pops).toBe(0)
      expect(stats.shuffles).toBe(0)
    })

    it('allows reuse after reset', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 2 })
      buf.push(1)
      buf.push(2)
      buf.reset()
      expect(buf.push(3)).toBe(true)
      expect(buf.toArray()).toEqual([3])
    })

    it('handles resetting empty buffer', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      expect(() => buf.reset()).not.toThrow()
    })
  })

  describe('contains', () => {
    it('returns true for existing element', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.contains(2)).toBe(true)
    })

    it('returns false for missing element', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      expect(buf.contains(99)).toBe(false)
    })

    it('returns false for empty buffer', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      expect(buf.contains(1)).toBe(false)
    })

    it('uses strict equality', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      expect(buf.contains(1)).toBe(true)
      expect(buf.contains('1' as unknown as number)).toBe(false)
    })

    it('finds objects by reference', () => {
      const buf = new ShuffleBuffer<object>({ capacity: 5 })
      const obj = { x: 1 }
      buf.push(obj)
      expect(buf.contains(obj)).toBe(true)
      expect(buf.contains({ x: 1 })).toBe(false)
    })
  })

  describe('indexOf', () => {
    it('returns correct index', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(10)
      buf.push(20)
      buf.push(30)
      expect(buf.indexOf(20)).toBe(1)
    })

    it('returns -1 for missing element', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      expect(buf.indexOf(99)).toBe(-1)
    })

    it('returns -1 for empty buffer', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      expect(buf.indexOf(1)).toBe(-1)
    })

    it('returns first occurrence', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      buf.push(1)
      expect(buf.indexOf(1)).toBe(0)
    })
  })

  describe('forEach', () => {
    it('iterates all elements', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      const collected: number[] = []
      buf.forEach((v) => collected.push(v))
      expect(collected).toEqual([1, 2, 3])
    })

    it('provides correct indices', () => {
      const buf = new ShuffleBuffer<string>({ capacity: 5 })
      buf.push('a')
      buf.push('b')
      const indices: number[] = []
      buf.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1])
    })

    it('does not iterate empty buffer', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      let count = 0
      buf.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates elements with for-of', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(10)
      buf.push(20)
      buf.push(30)
      const result: number[] = []
      for (const item of buf) {
        result.push(item)
      }
      expect(result).toEqual([10, 20, 30])
    })

    it('works with spread operator', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      expect([...buf]).toEqual([1, 2])
    })

    it('handles empty buffer iteration', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      const result = [...buf]
      expect(result).toEqual([])
    })

    it('works with Array.from', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      expect(Array.from(buf)).toEqual([1, 2])
    })
  })

  describe('getStatistics', () => {
    it('returns a snapshot', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      const stats = buf.getStatistics()
      stats.pushes = 999
      expect(buf.getStatistics().pushes).toBe(1)
    })

    it('tracks all operation types', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 10 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.push(4)
      buf.pop()
      buf.shuffle()
      buf.sample(2)
      buf.swap(0, 1)
      buf.reverse()
      const stats = buf.getStatistics()
      expect(stats.pushes).toBe(4)
      expect(stats.pops).toBe(1)
      expect(stats.shuffles).toBe(1)
      expect(stats.samples).toBe(1)
      expect(stats.swaps).toBe(1)
      expect(stats.reverses).toBe(1)
    })
  })

  describe('DEFAULT_SHUFFLE_BUFFER_OPTIONS', () => {
    it('has capacity of 1024', () => {
      expect(DEFAULT_SHUFFLE_BUFFER_OPTIONS.capacity).toBe(1024)
    })
  })

  describe('integration scenarios', () => {
    it('push-pop-shuffle cycle', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 10 })
      for (let i = 0; i < 10; i++) buf.push(i)
      buf.shuffle()
      buf.pop()
      buf.pop()
      expect(buf.size).toBe(8)
      expect(buf.isFull).toBe(false)
    })

    it('fill-clear-refill', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 3 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.isFull).toBe(true)
      buf.clear()
      expect(buf.isEmpty()).toBe(true)
      buf.push(4)
      buf.push(5)
      expect(buf.toArray()).toEqual([4, 5])
    })

    it('sort after shuffle restores order', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 20 })
      for (let i = 0; i < 20; i++) buf.push(i)
      buf.shuffle()
      buf.sort((a, b) => a - b)
      expect(buf.toArray()).toEqual(Array.from({ length: 20 }, (_, i) => i))
    })

    it('sample after shuffle', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 10 })
      for (let i = 0; i < 10; i++) buf.push(i)
      buf.shuffle()
      const sample = buf.sample(5)
      expect(sample.length).toBe(5)
      for (const item of sample) {
        expect(item).toBeGreaterThanOrEqual(0)
        expect(item).toBeLessThan(10)
      }
    })

    it('swap and reverse interaction', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.swap(0, 2)
      buf.reverse()
      expect(buf.toArray()).toEqual([1, 2, 3])
    })

    it('reset clears all stats for fresh start', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.shuffle()
      buf.pop()
      buf.reset()
      const stats = buf.getStatistics()
      expect(stats.pushes).toBe(0)
      expect(stats.shuffles).toBe(0)
      expect(stats.pops).toBe(0)
      buf.push(42)
      expect(buf.getStatistics().pushes).toBe(1)
    })

    it('at reflects changes after swap', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(10)
      buf.push(20)
      buf.swap(0, 1)
      expect(buf.at(0)).toBe(20)
      expect(buf.at(1)).toBe(10)
    })

    it('indexOf reflects changes after reverse', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.reverse()
      expect(buf.indexOf(1)).toBe(2)
      expect(buf.indexOf(3)).toBe(0)
    })

    it('forEach with early push/pop does not corrupt', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      const collected: number[] = []
      buf.forEach((v) => collected.push(v))
      expect(collected).toEqual([1, 2, 3])
      expect(buf.size).toBe(3)
    })

    it('multiple operations maintain consistency', () => {
      const buf = new ShuffleBuffer<number>({ capacity: 5 })
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.contains(2)).toBe(true)
      expect(buf.indexOf(2)).toBe(1)
      expect(buf.at(1)).toBe(2)
      buf.pop()
      expect(buf.size).toBe(2)
      expect(buf.remaining()).toBe(3)
      expect(buf.isFull).toBe(false)
    })
  })
})
