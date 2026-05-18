import { describe, it, expect } from 'vitest'
import { RandomizedQueue } from '../../src/core/randomized-queue/index.js'

describe('RandomizedQueue', () => {
  describe('constructor', () => {
    it('creates empty queue', () => {
      const rq = new RandomizedQueue<number>()
      expect(rq.size).toBe(0)
      expect(rq.isEmpty).toBe(true)
    })

    it('creates queue from array', () => {
      const rq = new RandomizedQueue<number>([1, 2, 3])
      expect(rq.size).toBe(3)
      expect(rq.isEmpty).toBe(false)
    })

    it('creates queue from empty array', () => {
      const rq = new RandomizedQueue<number>([])
      expect(rq.size).toBe(0)
      expect(rq.isEmpty).toBe(true)
    })
  })

  // ─── enqueue / push ───

  describe('enqueue / push', () => {
    it('enqueues an element', () => {
      const rq = new RandomizedQueue<number>()
      rq.enqueue(42)
      expect(rq.size).toBe(1)
    })

    it('push is alias for enqueue', () => {
      const rq = new RandomizedQueue<number>()
      rq.push(10)
      expect(rq.size).toBe(1)
      expect(rq.contains(10)).toBe(true)
    })

    it('enqueues multiple elements', () => {
      const rq = new RandomizedQueue<number>()
      rq.enqueue(1)
      rq.enqueue(2)
      rq.enqueue(3)
      expect(rq.size).toBe(3)
    })
  })

  // ─── dequeue ───

  describe('dequeue', () => {
    it('throws on empty queue', () => {
      const rq = new RandomizedQueue<number>()
      expect(() => rq.dequeue()).toThrow('Cannot dequeue from empty queue')
    })

    it('returns and removes an element', () => {
      const rq = new RandomizedQueue<number>([1])
      const val = rq.dequeue()
      expect(val).toBe(1)
      expect(rq.size).toBe(0)
    })

    it('dequeues all elements eventually', () => {
      const rq = new RandomizedQueue<number>([1, 2, 3])
      const dequeued: number[] = []
      while (rq.size > 0) {
        dequeued.push(rq.dequeue())
      }
      expect(dequeued.sort()).toEqual([1, 2, 3])
      expect(rq.isEmpty).toBe(true)
    })

    it('dequeued element was in the queue', () => {
      const rq = new RandomizedQueue<number>([10, 20, 30])
      for (let i = 0; i < 3; i++) {
        const val = rq.dequeue()
        expect([10, 20, 30]).toContain(val)
      }
    })
  })

  // ─── sample ───

  describe('sample', () => {
    it('throws on empty queue', () => {
      const rq = new RandomizedQueue<number>()
      expect(() => rq.sample()).toThrow('Cannot sample from empty queue')
    })

    it('returns an element without removing', () => {
      const rq = new RandomizedQueue<number>([42])
      expect(rq.sample()).toBe(42)
      expect(rq.size).toBe(1)
    })

    it('returns an element from the queue', () => {
      const rq = new RandomizedQueue<number>([10, 20, 30])
      const val = rq.sample()
      expect([10, 20, 30]).toContain(val)
      expect(rq.size).toBe(3)
    })
  })

  // ─── peek / peekBack ───

  describe('peek / peekBack', () => {
    it('peek throws on empty queue', () => {
      const rq = new RandomizedQueue<number>()
      expect(() => rq.peek()).toThrow('Cannot peek from empty queue')
    })

    it('peekBack throws on empty queue', () => {
      const rq = new RandomizedQueue<number>()
      expect(() => rq.peekBack()).toThrow('Cannot peekBack from empty queue')
    })

    it('peek returns first element', () => {
      const rq = new RandomizedQueue<number>([10, 20, 30])
      expect(rq.peek()).toBe(10)
    })

    it('peekBack returns last element', () => {
      const rq = new RandomizedQueue<number>([10, 20, 30])
      expect(rq.peekBack()).toBe(30)
    })
  })

  // ─── contains / indexOf ───

  describe('contains / indexOf', () => {
    it('contains returns true for present element', () => {
      const rq = new RandomizedQueue<number>([1, 2, 3])
      expect(rq.contains(2)).toBe(true)
    })

    it('contains returns false for missing element', () => {
      const rq = new RandomizedQueue<number>([1, 2, 3])
      expect(rq.contains(99)).toBe(false)
    })

    it('indexOf returns index of element', () => {
      const rq = new RandomizedQueue<number>([10, 20, 30])
      const idx = rq.indexOf(20)
      expect(idx).toBeGreaterThanOrEqual(0)
      expect(idx).toBeLessThan(3)
    })

    it('indexOf returns -1 for missing element', () => {
      const rq = new RandomizedQueue<number>([1, 2, 3])
      expect(rq.indexOf(99)).toBe(-1)
    })
  })

  // ─── remove / removeAt ───

  describe('remove / removeAt', () => {
    it('remove returns false for missing element', () => {
      const rq = new RandomizedQueue<number>([1, 2, 3])
      expect(rq.remove(99)).toBe(false)
    })

    it('remove removes the element', () => {
      const rq = new RandomizedQueue<number>([1, 2, 3])
      expect(rq.remove(2)).toBe(true)
      expect(rq.size).toBe(2)
      expect(rq.contains(2)).toBe(false)
    })

    it('removeAt throws for out of bounds', () => {
      const rq = new RandomizedQueue<number>([1, 2])
      expect(() => rq.removeAt(-1)).toThrow(RangeError)
      expect(() => rq.removeAt(5)).toThrow(RangeError)
    })

    it('removeAt removes and returns element at index', () => {
      const rq = new RandomizedQueue<number>([10, 20, 30])
      const val = rq.removeAt(1)
      expect(rq.toArray()).not.toContain(val)
      expect(rq.size).toBe(2)
    })
  })

  // ─── toArray / clone / fromArray ───

  describe('toArray / clone / fromArray', () => {
    it('toArray returns a copy', () => {
      const rq = new RandomizedQueue<number>([1, 2, 3])
      const arr = rq.toArray()
      expect(arr.sort()).toEqual([1, 2, 3])
      arr.push(99)
      expect(rq.size).toBe(3)
    })

    it('clone creates independent copy', () => {
      const rq = new RandomizedQueue<number>([1, 2, 3])
      const cl = rq.clone()
      expect(cl.size).toBe(3)
      rq.dequeue()
      expect(cl.size).toBe(3)
    })

    it('fromArray creates queue', () => {
      const rq = RandomizedQueue.fromArray([1, 2, 3])
      expect(rq.size).toBe(3)
      expect(rq.contains(2)).toBe(true)
    })
  })

  // ─── forEach / iterator ───

  describe('forEach / iterator', () => {
    it('forEach iterates all elements', () => {
      const rq = new RandomizedQueue<number>([1, 2, 3])
      const collected: number[] = []
      rq.forEach((v) => collected.push(v))
      expect(collected.sort()).toEqual([1, 2, 3])
    })

    it('forEach provides index', () => {
      const rq = new RandomizedQueue<number>([10, 20])
      const indices: number[] = []
      rq.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1])
    })

    it('is iterable with for-of', () => {
      const rq = new RandomizedQueue<number>([1, 2, 3])
      const collected: number[] = []
      for (const v of rq) {
        collected.push(v)
      }
      expect(collected.sort()).toEqual([1, 2, 3])
    })
  })

  // ─── shuffle / random ───

  describe('shuffle / random', () => {
    it('shuffle keeps same elements', () => {
      const rq = new RandomizedQueue<number>([1, 2, 3, 4, 5])
      rq.shuffle()
      expect(rq.size).toBe(5)
      expect(rq.toArray().sort()).toEqual([1, 2, 3, 4, 5])
    })

    it('random returns empty for empty queue', () => {
      const rq = new RandomizedQueue<number>()
      expect(rq.random()).toEqual([])
    })

    it('random(n) returns up to n elements', () => {
      const rq = new RandomizedQueue<number>([1, 2, 3, 4, 5])
      const result = rq.random(3)
      expect(result.length).toBe(3)
      for (const v of result) {
        expect([1, 2, 3, 4, 5]).toContain(v)
      }
    })

    it('random(n) caps at size', () => {
      const rq = new RandomizedQueue<number>([1, 2])
      const result = rq.random(100)
      expect(result.length).toBe(2)
    })

    it('random() with no arg returns single element in array', () => {
      const rq = new RandomizedQueue<number>([42])
      const result = rq.random()
      expect(result).toEqual([42])
    })
  })

  // ─── at / first / last ───

  describe('at / first / last', () => {
    it('at throws for out of bounds', () => {
      const rq = new RandomizedQueue<number>([1, 2])
      expect(() => rq.at(-1)).toThrow(RangeError)
      expect(() => rq.at(5)).toThrow(RangeError)
    })

    it('at returns element at index', () => {
      const rq = new RandomizedQueue<number>([10, 20, 30])
      expect(rq.at(0)).toBe(10)
      expect(rq.at(2)).toBe(30)
    })

    it('first throws on empty', () => {
      const rq = new RandomizedQueue<number>()
      expect(() => rq.first()).toThrow('Cannot get first element from empty queue')
    })

    it('last throws on empty', () => {
      const rq = new RandomizedQueue<number>()
      expect(() => rq.last()).toThrow('Cannot get last element from empty queue')
    })

    it('first and last return correct elements', () => {
      const rq = new RandomizedQueue<number>([10, 20, 30])
      expect(rq.first()).toBe(10)
      expect(rq.last()).toBe(30)
    })
  })

  // ─── count / toString / join ───

  describe('count / toString / join', () => {
    it('count returns size', () => {
      const rq = new RandomizedQueue<number>([1, 2, 3])
      expect(rq.count()).toBe(3)
    })

    it('toString returns readable format', () => {
      const rq = new RandomizedQueue<number>([1, 2])
      const str = rq.toString()
      expect(str).toContain('RandomizedQueue')
      expect(str).toContain('2')
    })

    it('join with default separator', () => {
      const rq = new RandomizedQueue<number>([1, 2, 3])
      expect(rq.join()).toBe('1,2,3')
    })

    it('join with custom separator', () => {
      const rq = new RandomizedQueue<number>([1, 2, 3])
      expect(rq.join(' | ')).toBe('1 | 2 | 3')
    })
  })

  // ─── getStats ───

  describe('getStats', () => {
    it('returns stats object', () => {
      const rq = new RandomizedQueue<number>([1, 2, 3])
      const stats = rq.getStats()
      expect(stats.size).toBe(3)
      expect(stats.capacity).toBe(3)
    })

    it('returns 0 for empty queue', () => {
      const rq = new RandomizedQueue<number>()
      const stats = rq.getStats()
      expect(stats.size).toBe(0)
      expect(stats.capacity).toBe(0)
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('clears all elements', () => {
      const rq = new RandomizedQueue<number>([1, 2, 3])
      rq.clear()
      expect(rq.size).toBe(0)
      expect(rq.isEmpty).toBe(true)
    })
  })

  // ─── edge cases ───

  describe('edge cases', () => {
    it('handles single element operations', () => {
      const rq = new RandomizedQueue<string>()
      rq.enqueue('only')
      expect(rq.peek()).toBe('only')
      expect(rq.peekBack()).toBe('only')
      expect(rq.sample()).toBe('only')
      expect(rq.first()).toBe('only')
      expect(rq.last()).toBe('only')
      expect(rq.dequeue()).toBe('only')
      expect(rq.isEmpty).toBe(true)
    })

    it('handles string elements', () => {
      const rq = new RandomizedQueue<string>(['a', 'b', 'c'])
      expect(rq.size).toBe(3)
      expect(rq.contains('b')).toBe(true)
    })

    it('handles object elements', () => {
      const obj = { x: 1 }
      const rq = new RandomizedQueue<object>([obj])
      expect(rq.contains(obj)).toBe(true)
    })

    it('handles duplicate values', () => {
      const rq = new RandomizedQueue<number>([1, 1, 1])
      expect(rq.size).toBe(3)
      rq.remove(1)
      expect(rq.size).toBe(2)
    })
  })
})
