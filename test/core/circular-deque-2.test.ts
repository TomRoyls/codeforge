import { describe, it, expect } from 'vitest'
import { CircularDeque2 } from '../../src/core/circular-deque-2/index.js'

describe('CircularDeque2', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates deque with default capacity', () => {
      const deque = new CircularDeque2<number>()
      expect(deque.size()).toBe(0)
      expect(deque.isEmpty()).toBe(true)
    })

    it('creates deque with custom initial capacity', () => {
      const deque = new CircularDeque2<number>(4)
      expect(deque.size()).toBe(0)
    })

    it('clamps capacity of 0 to 1', () => {
      const deque = new CircularDeque2<number>(0)
      deque.pushBack(1)
      expect(deque.size()).toBe(1)
    })

    it('clamps negative capacity to 1', () => {
      const deque = new CircularDeque2<number>(-3)
      deque.pushBack(1)
      expect(deque.size()).toBe(1)
    })
  })

  // ─── pushFront() ───
  describe('pushFront', () => {
    it('adds elements to the front', () => {
      const deque = new CircularDeque2<number>()
      deque.pushFront(1)
      deque.pushFront(2)
      deque.pushFront(3)
      expect(deque.toArray()).toEqual([3, 2, 1])
    })

    it('grows buffer when full', () => {
      const deque = new CircularDeque2<number>(2)
      deque.pushFront(1)
      deque.pushFront(2)
      deque.pushFront(3)
      expect(deque.size()).toBe(3)
      expect(deque.toArray()).toEqual([3, 2, 1])
    })
  })

  // ─── pushBack() ───
  describe('pushBack', () => {
    it('adds elements to the back', () => {
      const deque = new CircularDeque2<number>()
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.toArray()).toEqual([1, 2, 3])
    })

    it('grows buffer when full', () => {
      const deque = new CircularDeque2<number>(2)
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.size()).toBe(3)
      expect(deque.toArray()).toEqual([1, 2, 3])
    })
  })

  // ─── popFront() ───
  describe('popFront', () => {
    it('removes and returns front element', () => {
      const deque = new CircularDeque2<number>()
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.popFront()).toBe(1)
      expect(deque.popFront()).toBe(2)
    })

    it('returns undefined for empty deque', () => {
      const deque = new CircularDeque2<number>()
      expect(deque.popFront()).toBeUndefined()
    })

    it('decreases size', () => {
      const deque = new CircularDeque2<number>()
      deque.pushBack(1)
      deque.pushBack(2)
      deque.popFront()
      expect(deque.size()).toBe(1)
    })
  })

  // ─── popBack() ───
  describe('popBack', () => {
    it('removes and returns back element', () => {
      const deque = new CircularDeque2<number>()
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.popBack()).toBe(2)
      expect(deque.popBack()).toBe(1)
    })

    it('returns undefined for empty deque', () => {
      const deque = new CircularDeque2<number>()
      expect(deque.popBack()).toBeUndefined()
    })

    it('decreases size', () => {
      const deque = new CircularDeque2<number>()
      deque.pushBack(1)
      deque.pushBack(2)
      deque.popBack()
      expect(deque.size()).toBe(1)
    })
  })

  // ─── peekFront() ───
  describe('peekFront', () => {
    it('returns front element without removing', () => {
      const deque = new CircularDeque2<number>()
      deque.pushBack(10)
      deque.pushBack(20)
      expect(deque.peekFront()).toBe(10)
      expect(deque.size()).toBe(2)
    })

    it('returns undefined for empty deque', () => {
      const deque = new CircularDeque2<number>()
      expect(deque.peekFront()).toBeUndefined()
    })
  })

  // ─── peekBack() ───
  describe('peekBack', () => {
    it('returns back element without removing', () => {
      const deque = new CircularDeque2<number>()
      deque.pushBack(10)
      deque.pushBack(20)
      expect(deque.peekBack()).toBe(20)
      expect(deque.size()).toBe(2)
    })

    it('returns undefined for empty deque', () => {
      const deque = new CircularDeque2<number>()
      expect(deque.peekBack()).toBeUndefined()
    })
  })

  // ─── at() ───
  describe('at', () => {
    it('returns element at given index', () => {
      const deque = new CircularDeque2<number>()
      deque.pushBack(10)
      deque.pushBack(20)
      deque.pushBack(30)
      expect(deque.at(0)).toBe(10)
      expect(deque.at(1)).toBe(20)
      expect(deque.at(2)).toBe(30)
    })

    it('returns undefined for negative index', () => {
      const deque = new CircularDeque2<number>()
      deque.pushBack(1)
      expect(deque.at(-1)).toBeUndefined()
    })

    it('returns undefined for out-of-bounds index', () => {
      const deque = new CircularDeque2<number>()
      deque.pushBack(1)
      expect(deque.at(1)).toBeUndefined()
    })

    it('works after mixed pushFront/pushBack', () => {
      const deque = new CircularDeque2<number>()
      deque.pushFront(2)
      deque.pushBack(3)
      deque.pushFront(1)
      expect(deque.at(0)).toBe(1)
      expect(deque.at(1)).toBe(2)
      expect(deque.at(2)).toBe(3)
    })
  })

  // ─── contains() ───
  describe('contains', () => {
    it('returns true for existing element', () => {
      const deque = new CircularDeque2<number>()
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.contains(2)).toBe(true)
    })

    it('returns false for missing element', () => {
      const deque = new CircularDeque2<number>()
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.contains(5)).toBe(false)
    })

    it('returns false for empty deque', () => {
      const deque = new CircularDeque2<number>()
      expect(deque.contains(1)).toBe(false)
    })

    it('uses strict equality', () => {
      const deque = new CircularDeque2<string>()
      deque.pushBack('hello')
      expect(deque.contains('hello')).toBe(true)
      expect(deque.contains('world')).toBe(false)
    })
  })

  // ─── toArray() ───
  describe('toArray', () => {
    it('returns elements front to back', () => {
      const deque = new CircularDeque2<number>()
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.toArray()).toEqual([1, 2, 3])
    })

    it('returns empty array for empty deque', () => {
      const deque = new CircularDeque2<number>()
      expect(deque.toArray()).toEqual([])
    })
  })

  // ─── clear() ───
  describe('clear', () => {
    it('removes all elements', () => {
      const deque = new CircularDeque2<number>()
      deque.pushBack(1)
      deque.pushBack(2)
      deque.clear()
      expect(deque.size()).toBe(0)
      expect(deque.isEmpty()).toBe(true)
    })

    it('is safe on empty deque', () => {
      const deque = new CircularDeque2<number>()
      deque.clear()
      expect(deque.size()).toBe(0)
    })
  })

  // ─── fromArray() ───
  describe('fromArray', () => {
    it('creates deque from array', () => {
      const deque = CircularDeque2.fromArray([1, 2, 3])
      expect(deque.size()).toBe(3)
      expect(deque.toArray()).toEqual([1, 2, 3])
    })

    it('creates deque from empty array', () => {
      const deque = CircularDeque2.fromArray([])
      expect(deque.size()).toBe(0)
      expect(deque.isEmpty()).toBe(true)
    })

    it('creates deque from single-element array', () => {
      const deque = CircularDeque2.fromArray([42])
      expect(deque.size()).toBe(1)
      expect(deque.peekFront()).toBe(42)
      expect(deque.peekBack()).toBe(42)
    })
  })

  // ─── Iterator ───
  describe('Symbol.iterator', () => {
    it('iterates from front to back', () => {
      const deque = new CircularDeque2<number>()
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      const result = [...deque]
      expect(result).toEqual([1, 2, 3])
    })

    it('yields nothing for empty deque', () => {
      const deque = new CircularDeque2<number>()
      const result = [...deque]
      expect(result).toEqual([])
    })

    it('supports destructuring', () => {
      const deque = CircularDeque2.fromArray([10, 20, 30])
      const [a, b, c] = deque
      expect(a).toBe(10)
      expect(b).toBe(20)
      expect(c).toBe(30)
    })
  })

  // ─── forEach() ───
  describe('forEach', () => {
    it('calls callback with value and index', () => {
      const deque = CircularDeque2.fromArray([10, 20, 30])
      const results: number[] = []
      deque.forEach((v, i) => results.push(v + i))
      expect(results).toEqual([10, 21, 32])
    })

    it('does not call callback on empty deque', () => {
      const deque = new CircularDeque2<number>()
      let count = 0
      deque.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  // ─── Mixed operations ───
  describe('mixed operations', () => {
    it('handles interleaved push/pop at both ends', () => {
      const deque = new CircularDeque2<number>()
      deque.pushBack(2)
      deque.pushFront(1)
      deque.pushBack(3)
      deque.popFront()
      deque.popBack()
      expect(deque.toArray()).toEqual([2])
    })

    it('handles negative numbers', () => {
      const deque = CircularDeque2.fromArray([-3, -1, -2])
      expect(deque.peekFront()).toBe(-3)
      expect(deque.peekBack()).toBe(-2)
    })

    it('handles string values', () => {
      const deque = new CircularDeque2<string>()
      deque.pushBack('a')
      deque.pushBack('b')
      expect(deque.toArray()).toEqual(['a', 'b'])
    })
  })
})
