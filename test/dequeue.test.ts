import { describe, it, expect } from 'vitest'
import { Deque } from '../src/utils/dequeue.js'

describe('Deque', () => {
  describe('constructor', () => {
    it('creates empty deque', () => {
      const d = new Deque<number>()
      expect(d.size).toBe(0)
      expect(d.isEmpty()).toBe(true)
    })

    it('respects initial capacity', () => {
      const d = new Deque<number>(2)
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      expect(d.size).toBe(3)
    })

    it('handles capacity of 1', () => {
      const d = new Deque<number>(1)
      d.pushBack(1)
      d.pushBack(2)
      expect(d.size).toBe(2)
    })
  })

  describe('pushBack / peekFront / peekBack', () => {
    it('pushes to back', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      expect(d.peekFront()).toBe(1)
      expect(d.peekBack()).toBe(3)
      expect(d.size).toBe(3)
    })
  })

  describe('pushFront', () => {
    it('pushes to front', () => {
      const d = new Deque<number>()
      d.pushFront(1)
      d.pushFront(2)
      d.pushFront(3)
      expect(d.peekFront()).toBe(3)
      expect(d.peekBack()).toBe(1)
    })
  })

  describe('popFront', () => {
    it('pops from front', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      expect(d.popFront()).toBe(1)
      expect(d.popFront()).toBe(2)
      expect(d.popFront()).toBe(3)
      expect(d.isEmpty()).toBe(true)
    })

    it('returns undefined when empty', () => {
      expect(new Deque<number>().popFront()).toBeUndefined()
    })
  })

  describe('popBack', () => {
    it('pops from back', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      expect(d.popBack()).toBe(3)
      expect(d.popBack()).toBe(2)
      expect(d.popBack()).toBe(1)
      expect(d.isEmpty()).toBe(true)
    })

    it('returns undefined when empty', () => {
      expect(new Deque<number>().popBack()).toBeUndefined()
    })
  })

  describe('mixed push/pop', () => {
    it('alternating front and back', () => {
      const d = new Deque<number>()
      d.pushFront(2)
      d.pushBack(3)
      d.pushFront(1)
      expect(d.toArray()).toEqual([1, 2, 3])
    })

    it('works as a queue (FIFO)', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      expect(d.popFront()).toBe(1)
      expect(d.popFront()).toBe(2)
      expect(d.popFront()).toBe(3)
    })

    it('works as a stack (LIFO)', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      expect(d.popBack()).toBe(3)
      expect(d.popBack()).toBe(2)
      expect(d.popBack()).toBe(1)
    })
  })

  describe('peekFront / peekBack', () => {
    it('returns undefined for empty deque', () => {
      const d = new Deque<number>()
      expect(d.peekFront()).toBeUndefined()
      expect(d.peekBack()).toBeUndefined()
    })

    it('does not remove elements', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.peekFront()
      d.peekBack()
      expect(d.size).toBe(1)
    })
  })

  describe('clear', () => {
    it('removes all elements', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      d.clear()
      expect(d.isEmpty()).toBe(true)
      expect(d.size).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns elements in order', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      expect(d.toArray()).toEqual([1, 2, 3])
    })

    it('returns empty array for empty deque', () => {
      expect(new Deque<number>().toArray()).toEqual([])
    })

    it('handles wrap-around correctly', () => {
      const d = new Deque<number>(4)
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      d.popFront()
      d.pushBack(4)
      d.pushBack(5)
      expect(d.toArray()).toEqual([2, 3, 4, 5])
    })
  })

  describe('fromArray', () => {
    it('creates deque from array', () => {
      const d = Deque.fromArray([1, 2, 3])
      expect(d.toArray()).toEqual([1, 2, 3])
      expect(d.size).toBe(3)
    })

    it('handles empty array', () => {
      const d = Deque.fromArray([])
      expect(d.isEmpty()).toBe(true)
    })
  })

  describe('growth', () => {
    it('grows beyond initial capacity', () => {
      const d = new Deque<number>(2)
      for (let i = 0; i < 100; i++) d.pushBack(i)
      expect(d.size).toBe(100)
      expect(d.popFront()).toBe(0)
      expect(d.popBack()).toBe(99)
    })

    it('grows with pushFront', () => {
      const d = new Deque<number>(2)
      for (let i = 0; i < 50; i++) d.pushFront(i)
      expect(d.size).toBe(50)
      expect(d.peekFront()).toBe(49)
      expect(d.peekBack()).toBe(0)
    })
  })

  describe('clear and reuse', () => {
    it('can be used after clear', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.clear()
      d.pushBack(2)
      d.pushBack(3)
      expect(d.toArray()).toEqual([2, 3])
    })
  })
})
