import { describe, it, expect } from 'vitest'
import { WaveletQueue } from '../../src/core/wavelet-queue/wavelet-queue.js'
import type { WaveletQueueOptions } from '../../src/core/wavelet-queue/types.js'

describe('WaveletQueue', () => {
  describe('construction', () => {
    it('creates empty queue with no options', () => {
      const q = new WaveletQueue()
      expect(q.isEmpty()).toBe(true)
      expect(q.size()).toBe(0)
    })

    it('creates queue with undefined options', () => {
      const q = new WaveletQueue<number>(undefined)
      q.enqueue(1)
      expect(q.size()).toBe(1)
    })

    it('creates queue with empty options', () => {
      const q = new WaveletQueue({})
      expect(q.isEmpty()).toBe(true)
    })

    it('creates queue with alphabet option', () => {
      const q = new WaveletQueue<string>({ alphabet: ['a', 'b', 'c'] })
      expect(q.isEmpty()).toBe(true)
      q.enqueue('a')
      q.enqueue('b')
      expect(q.size()).toBe(2)
    })

    it('creates queue with alphabetSize option', () => {
      const q = new WaveletQueue<number>({ alphabetSize: 10 })
      q.enqueue(5)
      expect(q.size()).toBe(1)
    })

    it('creates queue with rebuildThreshold option', () => {
      const q = new WaveletQueue<number>({ rebuildThreshold: 4 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.size()).toBe(3)
    })

    it('creates queue with all options', () => {
      const q = new WaveletQueue<string>({
        alphabet: ['x', 'y', 'z'],
        rebuildThreshold: 8,
      })
      q.enqueue('x')
      q.enqueue('y')
      expect(q.toArray()).toEqual(['x', 'y'])
    })

    it('defaults to number type', () => {
      const q = new WaveletQueue()
      q.enqueue(42)
      expect(q.peek()).toBe(42)
    })

    it('supports string type', () => {
      const q = new WaveletQueue<string>()
      q.enqueue('hello')
      expect(q.peek()).toBe('hello')
    })
  })

  describe('enqueue', () => {
    it('enqueues a single item', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      expect(q.size()).toBe(1)
      expect(q.isEmpty()).toBe(false)
    })

    it('enqueues multiple items', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.size()).toBe(3)
    })

    it('enqueues duplicate items', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(5)
      q.enqueue(5)
      q.enqueue(5)
      expect(q.size()).toBe(3)
      expect(q.rank(5)).toBe(3)
    })

    it('enqueues string items', () => {
      const q = new WaveletQueue<string>()
      q.enqueue('a')
      q.enqueue('b')
      q.enqueue('a')
      expect(q.size()).toBe(3)
      expect(q.rank('a')).toBe(2)
    })

    it('handles zero values', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(0)
      q.enqueue(0)
      expect(q.size()).toBe(2)
      expect(q.rank(0)).toBe(2)
    })

    it('handles negative numbers', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(-1)
      q.enqueue(-5)
      q.enqueue(-1)
      expect(q.rank(-1)).toBe(2)
    })

    it('handles mixed number values', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      q.enqueue(100)
      q.enqueue(-50)
      q.enqueue(0)
      expect(q.size()).toBe(4)
    })
  })

  describe('dequeue', () => {
    it('dequeue from empty queue returns undefined', () => {
      const q = new WaveletQueue<number>()
      expect(q.dequeue()).toBeUndefined()
    })

    it('dequeue returns first enqueued item (FIFO)', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
    })

    it('dequeue decreases size', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.size()).toBe(1)
    })

    it('dequeue updates rank', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.rank(1)).toBe(1)
      expect(q.rank(2)).toBe(1)
    })

    it('dequeue makes queue empty', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      q.dequeue()
      expect(q.isEmpty()).toBe(true)
    })

    it('dequeue all items then enqueue again', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      q.dequeue()
      q.enqueue(3)
      expect(q.size()).toBe(1)
      expect(q.peek()).toBe(3)
    })

    it('interleaved enqueue and dequeue', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      expect(q.dequeue()).toBe(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.dequeue()).toBe(2)
      expect(q.toArray()).toEqual([3])
    })
  })

  describe('peek', () => {
    it('peek on empty queue returns undefined', () => {
      const q = new WaveletQueue<number>()
      expect(q.peek()).toBeUndefined()
    })

    it('peek returns front item without removing', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      expect(q.peek()).toBe(1)
      expect(q.size()).toBe(2)
    })

    it('peek after dequeue', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.peek()).toBe(2)
    })

    it('peek does not modify queue', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(42)
      q.peek()
      q.peek()
      q.peek()
      expect(q.size()).toBe(1)
      expect(q.peek()).toBe(42)
    })
  })

  describe('front', () => {
    it('front returns same as peek', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(10)
      expect(q.front()).toBe(q.peek())
    })

    it('front on empty queue', () => {
      const q = new WaveletQueue<number>()
      expect(q.front()).toBeUndefined()
    })
  })

  describe('back', () => {
    it('back on empty queue returns undefined', () => {
      const q = new WaveletQueue<number>()
      expect(q.back()).toBeUndefined()
    })

    it('back returns last enqueued item', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.back()).toBe(3)
    })

    it('back with single item', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(42)
      expect(q.back()).toBe(42)
    })

    it('back after dequeue', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect(q.back()).toBe(3)
    })

    it('back does not modify queue', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.back()
      expect(q.size()).toBe(2)
    })
  })

  describe('size and isEmpty', () => {
    it('size returns 0 for empty queue', () => {
      const q = new WaveletQueue<number>()
      expect(q.size()).toBe(0)
    })

    it('isEmpty returns true for empty queue', () => {
      const q = new WaveletQueue<number>()
      expect(q.isEmpty()).toBe(true)
    })

    it('isEmpty returns false after enqueue', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      expect(q.isEmpty()).toBe(false)
    })

    it('size tracks enqueue/dequeue correctly', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      expect(q.size()).toBe(2)
      q.dequeue()
      expect(q.size()).toBe(1)
      q.enqueue(3)
      expect(q.size()).toBe(2)
    })
  })

  describe('clear', () => {
    it('clears empty queue', () => {
      const q = new WaveletQueue<number>()
      q.clear()
      expect(q.isEmpty()).toBe(true)
    })

    it('clears non-empty queue', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.clear()
      expect(q.isEmpty()).toBe(true)
      expect(q.size()).toBe(0)
    })

    it('clear resets rank', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      q.enqueue(1)
      q.clear()
      expect(q.rank(1)).toBe(0)
    })

    it('clear then enqueue works', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      q.clear()
      q.enqueue(2)
      expect(q.size()).toBe(1)
      expect(q.peek()).toBe(2)
    })

    it('clear then dequeue returns undefined', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      q.clear()
      expect(q.dequeue()).toBeUndefined()
    })
  })

  describe('toArray', () => {
    it('toArray on empty queue returns empty array', () => {
      const q = new WaveletQueue<number>()
      expect(q.toArray()).toEqual([])
    })

    it('toArray returns items in order', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('toArray after dequeue', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect(q.toArray()).toEqual([2, 3])
    })

    it('toArray does not modify queue', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      const arr = q.toArray()
      arr.push(99)
      expect(q.size()).toBe(2)
      expect(q.toArray()).toEqual([1, 2])
    })

    it('toArray with string type', () => {
      const q = new WaveletQueue<string>()
      q.enqueue('x')
      q.enqueue('y')
      expect(q.toArray()).toEqual(['x', 'y'])
    })
  })

  describe('rank', () => {
    it('rank of non-existent item is 0', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      expect(q.rank(2)).toBe(0)
    })

    it('rank on empty queue is 0', () => {
      const q = new WaveletQueue<number>()
      expect(q.rank(1)).toBe(0)
    })

    it('rank counts occurrences', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(1)
      q.enqueue(1)
      q.enqueue(3)
      expect(q.rank(1)).toBe(3)
      expect(q.rank(2)).toBe(1)
      expect(q.rank(3)).toBe(1)
    })

    it('rank after dequeue', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.rank(1)).toBe(1)
      expect(q.rank(2)).toBe(1)
    })

    it('rank with strings', () => {
      const q = new WaveletQueue<string>()
      q.enqueue('a')
      q.enqueue('b')
      q.enqueue('a')
      expect(q.rank('a')).toBe(2)
      expect(q.rank('b')).toBe(1)
      expect(q.rank('c')).toBe(0)
    })
  })

  describe('rankRange', () => {
    it('rankRange on empty queue is 0', () => {
      const q = new WaveletQueue<number>()
      expect(q.rankRange(1, 0, 0)).toBe(0)
    })

    it('rankRange with non-existent item is 0', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      expect(q.rankRange(3, 0, 2)).toBe(0)
    })

    it('rankRange counts in specified range', () => {
      const q = new WaveletQueue<number>({ rebuildThreshold: 1 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(1)
      q.enqueue(3)
      q.enqueue(1)
      expect(q.rankRange(1, 1, 4)).toBe(1)
      expect(q.rankRange(1, 0, 5)).toBe(3)
    })

    it('rankRange with full range equals rank', () => {
      const q = new WaveletQueue<number>({ rebuildThreshold: 1 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(1)
      q.enqueue(3)
      expect(q.rankRange(1, 0, q.size())).toBe(q.rank(1))
    })

    it('rankRange with empty range is 0', () => {
      const q = new WaveletQueue<number>({ rebuildThreshold: 1 })
      q.enqueue(1)
      expect(q.rankRange(1, 2, 2)).toBe(0)
    })

    it('rankRange clamps negative from', () => {
      const q = new WaveletQueue<number>({ rebuildThreshold: 1 })
      q.enqueue(1)
      q.enqueue(1)
      expect(q.rankRange(1, -5, 2)).toBe(2)
    })

    it('rankRange clamps overflow to', () => {
      const q = new WaveletQueue<number>({ rebuildThreshold: 1 })
      q.enqueue(1)
      q.enqueue(1)
      expect(q.rankRange(1, 0, 100)).toBe(2)
    })

    it('rankRange with from >= to returns 0', () => {
      const q = new WaveletQueue<number>({ rebuildThreshold: 1 })
      q.enqueue(1)
      expect(q.rankRange(1, 1, 1)).toBe(0)
      expect(q.rankRange(1, 2, 1)).toBe(0)
    })

    it('rankRange with strings', () => {
      const q = new WaveletQueue<string>({ rebuildThreshold: 1 })
      q.enqueue('a')
      q.enqueue('b')
      q.enqueue('a')
      expect(q.rankRange('a', 1, 3)).toBe(1)
    })
  })

  describe('select', () => {
    it('select on empty queue returns -1', () => {
      const q = new WaveletQueue<number>()
      expect(q.select(1, 0)).toBe(-1)
    })

    it('select with negative k returns -1', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      expect(q.select(1, -1)).toBe(-1)
    })

    it('select with non-existent item returns -1', () => {
      const q = new WaveletQueue<number>({ rebuildThreshold: 1 })
      q.enqueue(1)
      expect(q.select(2, 0)).toBe(-1)
    })

    it('select returns position of k-th occurrence', () => {
      const q = new WaveletQueue<number>({ rebuildThreshold: 1 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(1)
      q.enqueue(3)
      q.enqueue(1)
      expect(q.select(1, 0)).toBe(0)
      expect(q.select(1, 1)).toBe(2)
      expect(q.select(1, 2)).toBe(4)
    })

    it('select returns -1 when k >= count', () => {
      const q = new WaveletQueue<number>({ rebuildThreshold: 1 })
      q.enqueue(1)
      q.enqueue(1)
      expect(q.select(1, 2)).toBe(-1)
      expect(q.select(1, 100)).toBe(-1)
    })

    it('select for unique item returns 0', () => {
      const q = new WaveletQueue<number>({ rebuildThreshold: 1 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.select(2, 0)).toBe(1)
    })

    it('select with strings', () => {
      const q = new WaveletQueue<string>({ rebuildThreshold: 1 })
      q.enqueue('a')
      q.enqueue('b')
      q.enqueue('a')
      expect(q.select('a', 0)).toBe(0)
      expect(q.select('a', 1)).toBe(2)
      expect(q.select('b', 0)).toBe(1)
    })
  })

  describe('contains', () => {
    it('contains on empty queue returns false', () => {
      const q = new WaveletQueue<number>()
      expect(q.contains(1)).toBe(false)
    })

    it('contains returns true for present item', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      expect(q.contains(1)).toBe(true)
    })

    it('contains returns false for absent item', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      expect(q.contains(2)).toBe(false)
    })

    it('contains after dequeue', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      q.dequeue()
      expect(q.contains(1)).toBe(false)
    })

    it('contains with duplicates', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      q.enqueue(1)
      q.dequeue()
      expect(q.contains(1)).toBe(true)
    })

    it('contains with strings', () => {
      const q = new WaveletQueue<string>()
      q.enqueue('hello')
      expect(q.contains('hello')).toBe(true)
      expect(q.contains('world')).toBe(false)
    })
  })

  describe('frequency', () => {
    it('frequency on empty queue returns 0', () => {
      const q = new WaveletQueue<number>()
      expect(q.frequency(1)).toBe(0)
    })

    it('frequency equals rank', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(1)
      expect(q.frequency(1)).toBe(q.rank(1))
      expect(q.frequency(2)).toBe(q.rank(2))
    })

    it('frequency after dequeue', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(5)
      q.enqueue(5)
      q.enqueue(5)
      q.dequeue()
      expect(q.frequency(5)).toBe(2)
    })
  })

  describe('frequencies', () => {
    it('frequencies on empty queue returns empty map', () => {
      const q = new WaveletQueue<number>()
      expect(q.frequencies.size).toBe(0)
    })

    it('frequencies returns correct counts', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(1)
      q.enqueue(3)
      q.enqueue(1)
      const freq = q.frequencies
      expect(freq.get(1)).toBe(3)
      expect(freq.get(2)).toBe(1)
      expect(freq.get(3)).toBe(1)
    })

    it('frequencies returns a copy', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      const freq = q.frequencies
      freq.set(1, 999)
      expect(q.frequency(1)).toBe(1)
    })

    it('frequencies after dequeue', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      const freq = q.frequencies
      expect(freq.get(1)).toBe(1)
      expect(freq.get(2)).toBe(1)
    })

    it('frequencies with strings', () => {
      const q = new WaveletQueue<string>()
      q.enqueue('a')
      q.enqueue('b')
      q.enqueue('a')
      const freq = q.frequencies
      expect(freq.get('a')).toBe(2)
      expect(freq.get('b')).toBe(1)
    })
  })

  describe('alphabet options', () => {
    it('works with predefined alphabet', () => {
      const q = new WaveletQueue<string>({ alphabet: ['a', 'b', 'c'] })
      q.enqueue('a')
      q.enqueue('b')
      q.enqueue('a')
      expect(q.rank('a')).toBe(2)
      expect(q.rank('b')).toBe(1)
    })

    it('works with alphabetSize', () => {
      const q = new WaveletQueue<number>({ alphabetSize: 5 })
      q.enqueue(0)
      q.enqueue(1)
      q.enqueue(0)
      expect(q.rank(0)).toBe(2)
    })
  })

  describe('rebuild behavior', () => {
    it('rebuilds after threshold exceeded', () => {
      const q = new WaveletQueue<number>({ rebuildThreshold: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(1)
      q.enqueue(3)
      expect(q.rankRange(1, 0, 4)).toBe(2)
    })

    it('works with rebuildThreshold of 1', () => {
      const q = new WaveletQueue<number>({ rebuildThreshold: 1 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(1)
      expect(q.select(1, 0)).toBe(0)
      expect(q.select(1, 1)).toBe(2)
    })

    it('works with high rebuildThreshold', () => {
      const q = new WaveletQueue<number>({ rebuildThreshold: 1000 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(1)
      expect(q.rankRange(1, 0, 3)).toBe(2)
    })

    it('rebuild after many operations', () => {
      const q = new WaveletQueue<number>({ rebuildThreshold: 4 })
      for (let i = 0; i < 20; i++) {
        q.enqueue(i % 5)
      }
      for (let i = 0; i < 10; i++) {
        q.dequeue()
      }
      expect(q.rankRange(0, 0, q.size())).toBe(q.rank(0))
    })
  })

  describe('edge cases', () => {
    it('single item queue', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(42)
      expect(q.peek()).toBe(42)
      expect(q.back()).toBe(42)
      expect(q.front()).toBe(42)
      expect(q.rank(42)).toBe(1)
      expect(q.contains(42)).toBe(true)
      expect(q.rankRange(42, 0, 1)).toBe(1)
      expect(q.select(42, 0)).toBe(0)
    })

    it('all same items', () => {
      const q = new WaveletQueue<number>({ rebuildThreshold: 1 })
      for (let i = 0; i < 10; i++) {
        q.enqueue(7)
      }
      expect(q.rank(7)).toBe(10)
      expect(q.rankRange(7, 3, 7)).toBe(4)
      expect(q.select(7, 5)).toBe(5)
    })

    it('enqueue dequeue single item repeatedly', () => {
      const q = new WaveletQueue<number>()
      for (let i = 0; i < 10; i++) {
        q.enqueue(i)
        expect(q.dequeue()).toBe(i)
      }
      expect(q.isEmpty()).toBe(true)
    })

    it('two items alternating', () => {
      const q = new WaveletQueue<number>({ rebuildThreshold: 1 })
      q.enqueue(0)
      q.enqueue(1)
      q.enqueue(0)
      q.enqueue(1)
      expect(q.rank(0)).toBe(2)
      expect(q.rank(1)).toBe(2)
      expect(q.select(0, 0)).toBe(0)
      expect(q.select(0, 1)).toBe(2)
      expect(q.select(1, 0)).toBe(1)
      expect(q.select(1, 1)).toBe(3)
    })

    it('large values', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1000000)
      q.enqueue(999999)
      expect(q.rank(1000000)).toBe(1)
    })

    it('clear and reuse', () => {
      const q = new WaveletQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      q.enqueue(3)
      q.enqueue(4)
      expect(q.toArray()).toEqual([3, 4])
      expect(q.rank(3)).toBe(1)
    })

    it('select after mixed operations', () => {
      const q = new WaveletQueue<number>({ rebuildThreshold: 1 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(1)
      q.enqueue(3)
      q.enqueue(1)
      q.dequeue()
      expect(q.select(1, 0)).toBe(1)
      expect(q.select(1, 1)).toBe(3)
    })

    it('rankRange after partial dequeue', () => {
      const q = new WaveletQueue<number>({ rebuildThreshold: 1 })
      q.enqueue(1)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(1)
      q.dequeue()
      expect(q.rankRange(1, 0, 3)).toBe(2)
    })
  })

  describe('string type', () => {
    it('full workflow with strings', () => {
      const q = new WaveletQueue<string>({ rebuildThreshold: 1 })
      q.enqueue('hello')
      q.enqueue('world')
      q.enqueue('hello')
      q.enqueue('foo')

      expect(q.size()).toBe(4)
      expect(q.peek()).toBe('hello')
      expect(q.back()).toBe('foo')
      expect(q.rank('hello')).toBe(2)
      expect(q.rankRange('hello', 1, 4)).toBe(1)
      expect(q.select('hello', 0)).toBe(0)
      expect(q.select('hello', 1)).toBe(2)
      expect(q.contains('world')).toBe(true)
      expect(q.contains('bar')).toBe(false)
      expect(q.frequency('hello')).toBe(2)

      q.dequeue()
      expect(q.peek()).toBe('world')
      expect(q.rank('hello')).toBe(1)
    })

    it('single character strings', () => {
      const q = new WaveletQueue<string>({ rebuildThreshold: 1 })
      q.enqueue('a')
      q.enqueue('b')
      q.enqueue('c')
      q.enqueue('a')
      expect(q.select('a', 0)).toBe(0)
      expect(q.select('a', 1)).toBe(3)
      expect(q.select('b', 0)).toBe(1)
    })

    it('empty string', () => {
      const q = new WaveletQueue<string>()
      q.enqueue('')
      q.enqueue('a')
      q.enqueue('')
      expect(q.rank('')).toBe(2)
    })
  })

  describe('internal growth', () => {
    it('grows beyond initial capacity', () => {
      const q = new WaveletQueue<number>()
      for (let i = 0; i < 2000; i++) {
        q.enqueue(i)
      }
      expect(q.size()).toBe(2000)
      expect(q.peek()).toBe(0)
      expect(q.back()).toBe(1999)
    })

    it('rankRange after growth', () => {
      const q = new WaveletQueue<number>({ rebuildThreshold: 1 })
      for (let i = 0; i < 2000; i++) {
        q.enqueue(i % 10)
      }
      expect(q.rank(0)).toBe(200)
      expect(q.rankRange(5, 0, 100)).toBe(10)
    })

    it('select after growth', () => {
      const q = new WaveletQueue<number>({ rebuildThreshold: 1 })
      for (let i = 0; i < 100; i++) {
        q.enqueue(i % 3)
      }
      expect(q.select(0, 0)).toBe(0)
      expect(q.select(1, 0)).toBe(1)
      expect(q.select(2, 0)).toBe(2)
    })
  })

  describe('stress', () => {
    it('many enqueue/dequeue cycles', () => {
      const q = new WaveletQueue<number>({ rebuildThreshold: 10 })
      for (let round = 0; round < 5; round++) {
        for (let i = 0; i < 100; i++) {
          q.enqueue(i % 7)
        }
        for (let i = 0; i < 50; i++) {
          q.dequeue()
        }
      }
      expect(q.size()).toBe(250)
    })

    it('random operations consistency', () => {
      const q = new WaveletQueue<number>({ rebuildThreshold: 5 })
      const reference: number[] = []
      const seed = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3, 2, 3, 8, 4, 6]

      for (let i = 0; i < 100; i++) {
        const val = seed[i % seed.length]!
        q.enqueue(val)
        reference.push(val)
      }

      for (let i = 0; i < 30; i++) {
        q.dequeue()
        reference.shift()
      }

      expect(q.size()).toBe(reference.length)
      expect(q.toArray()).toEqual(reference)

      for (let v = 0; v < 10; v++) {
        const expectedRank = reference.filter(x => x === v).length
        expect(q.rank(v)).toBe(expectedRank)
      }
    })

    it('rank select consistency', () => {
      const q = new WaveletQueue<number>({ rebuildThreshold: 1 })
      const items = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3]
      for (const item of items) {
        q.enqueue(item)
      }

      for (let v = 0; v <= 10; v++) {
        const count = q.rank(v)
        for (let k = 0; k < count; k++) {
          const pos = q.select(v, k)
          expect(pos).toBeGreaterThanOrEqual(0)
          expect(q.toArray()[pos]).toBe(v)
        }
        expect(q.select(v, count)).toBe(-1)
      }
    })

    it('rankRange consistency with rank', () => {
      const q = new WaveletQueue<number>({ rebuildThreshold: 1 })
      const items = [1, 2, 3, 1, 2, 3, 1, 2, 3]
      for (const item of items) {
        q.enqueue(item)
      }

      for (let v = 1; v <= 3; v++) {
        expect(q.rankRange(v, 0, q.size())).toBe(q.rank(v))
      }

      for (let v = 1; v <= 3; v++) {
        let running = 0
        for (let i = 0; i < q.size(); i++) {
          running += q.rankRange(v, i, i + 1)
        }
        expect(running).toBe(q.rank(v))
      }
    })

    it('frequencies consistency', () => {
      const q = new WaveletQueue<number>({ rebuildThreshold: 1 })
      for (let i = 0; i < 50; i++) {
        q.enqueue(i % 5)
      }
      const freq = q.frequencies
      for (let v = 0; v < 5; v++) {
        expect(freq.get(v)).toBe(q.rank(v))
        expect(freq.get(v)).toBe(q.frequency(v))
      }
    })

    it('large queue with limited alphabet', () => {
      const q = new WaveletQueue<number>({ alphabet: [0, 1, 2, 3, 4], rebuildThreshold: 50 })
      for (let i = 0; i < 1000; i++) {
        q.enqueue(i % 5)
      }
      expect(q.size()).toBe(1000)
      for (let v = 0; v < 5; v++) {
        expect(q.rank(v)).toBe(200)
      }
      expect(q.rankRange(0, 0, 100)).toBe(20)
      expect(q.select(0, 0)).toBe(0)
      expect(q.select(0, 1)).toBe(5)
    })

    it('wavelet operations after full drain and refill', () => {
      const q = new WaveletQueue<number>({ rebuildThreshold: 1 })
      for (let i = 0; i < 20; i++) q.enqueue(i % 4)
      while (!q.isEmpty()) q.dequeue()
      for (let i = 0; i < 10; i++) q.enqueue(i % 3)
      expect(q.size()).toBe(10)
      expect(q.rank(0)).toBe(4)
      expect(q.rank(1)).toBe(3)
      expect(q.rank(2)).toBe(3)
      expect(q.select(0, 0)).toBe(0)
    })
  })
})
