import { describe, expect, it } from 'vitest'
import { Deque } from '../../../src/utils/dequeue.js'

describe('Deque', () => {
  describe('constructor', () => {
    it('creates empty deque with default capacity', () => {
      const deque = new Deque<number>()
      expect(deque.size).toBe(0)
      expect(deque.isEmpty()).toBe(true)
    })

    it('creates empty deque with custom capacity', () => {
      const deque = new Deque<number>(16)
      expect(deque.size).toBe(0)
      expect(deque.isEmpty()).toBe(true)
    })

    it('handles zero capacity by using minimum of 1', () => {
      const deque = new Deque<number>(0)
      expect(deque.size).toBe(0)
    })
  })

  describe('pushBack', () => {
    it('adds element to back of empty deque', () => {
      const deque = new Deque<number>()
      deque.pushBack(1)
      expect(deque.size).toBe(1)
      expect(deque.isEmpty()).toBe(false)
    })

    it('adds multiple elements to back', () => {
      const deque = new Deque<number>()
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.size).toBe(3)
      expect(deque.toArray()).toEqual([1, 2, 3])
    })

    it('adds elements after growing capacity', () => {
      const deque = new Deque<number>(2)
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      expect(deque.size).toBe(4)
      expect(deque.toArray()).toEqual([1, 2, 3, 4])
    })

    it('handles many elements', () => {
      const deque = new Deque<number>()
      for (let i = 0; i < 1000; i++) {
        deque.pushBack(i)
      }
      expect(deque.size).toBe(1000)
    })

    it('handles zero values', () => {
      const deque = new Deque<number>()
      deque.pushBack(0)
      expect(deque.size).toBe(1)
      expect(deque.peekFront()).toBe(0)
    })

    it('handles negative values', () => {
      const deque = new Deque<number>()
      deque.pushBack(-1)
      expect(deque.size).toBe(1)
      expect(deque.peekFront()).toBe(-1)
    })

    it('handles undefined values', () => {
      const deque = new Deque<number | undefined>()
      deque.pushBack(undefined)
      expect(deque.size).toBe(1)
      expect(deque.peekFront()).toBeUndefined()
    })
  })

  describe('pushFront', () => {
    it('adds element to front of empty deque', () => {
      const deque = new Deque<number>()
      deque.pushFront(1)
      expect(deque.size).toBe(1)
      expect(deque.peekFront()).toBe(1)
    })

    it('adds multiple elements to front', () => {
      const deque = new Deque<number>()
      deque.pushFront(3)
      deque.pushFront(2)
      deque.pushFront(1)
      expect(deque.size).toBe(3)
      expect(deque.toArray()).toEqual([1, 2, 3])
    })

    it('interleaves pushFront and pushBack correctly', () => {
      const deque = new Deque<number>()
      deque.pushBack(2)
      deque.pushFront(1)
      deque.pushBack(3)
      deque.pushFront(0)
      expect(deque.toArray()).toEqual([0, 1, 2, 3])
    })

    it('handles wrapping around buffer', () => {
      const deque = new Deque<number>(4)
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushFront(0)
      deque.pushBack(3)
      expect(deque.toArray()).toEqual([0, 1, 2, 3])
    })
  })

  describe('popFront', () => {
    it('returns undefined for empty deque', () => {
      const deque = new Deque<number>()
      expect(deque.popFront()).toBeUndefined()
    })

    it('removes and returns element from front', () => {
      const deque = new Deque<number>()
      deque.pushBack(1)
      deque.pushBack(2)
      const value = deque.popFront()
      expect(value).toBe(1)
      expect(deque.size).toBe(1)
      expect(deque.peekFront()).toBe(2)
    })

    it('removes all elements sequentially', () => {
      const deque = new Deque<number>()
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.popFront()).toBe(1)
      expect(deque.popFront()).toBe(2)
      expect(deque.popFront()).toBe(3)
      expect(deque.size).toBe(0)
      expect(deque.isEmpty()).toBe(true)
    })

    it('returns undefined after removing all elements', () => {
      const deque = new Deque<number>()
      deque.pushBack(1)
      deque.popFront()
      expect(deque.popFront()).toBeUndefined()
    })

    it('handles wraparound correctly', () => {
      const deque = new Deque<number>(4)
      deque.pushBack(1)
      deque.pushBack(2)
      deque.popFront()
      deque.pushBack(3)
      deque.pushBack(4)
      expect(deque.toArray()).toEqual([2, 3, 4])
    })
  })

  describe('popBack', () => {
    it('returns undefined for empty deque', () => {
      const deque = new Deque<number>()
      expect(deque.popBack()).toBeUndefined()
    })

    it('removes and returns element from back', () => {
      const deque = new Deque<number>()
      deque.pushBack(1)
      deque.pushBack(2)
      const value = deque.popBack()
      expect(value).toBe(2)
      expect(deque.size).toBe(1)
      expect(deque.peekBack()).toBe(1)
    })

    it('removes all elements sequentially from back', () => {
      const deque = new Deque<number>()
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.popBack()).toBe(3)
      expect(deque.popBack()).toBe(2)
      expect(deque.popBack()).toBe(1)
      expect(deque.size).toBe(0)
    })

    it('returns undefined after removing all elements', () => {
      const deque = new Deque<number>()
      deque.pushBack(1)
      deque.popBack()
      expect(deque.popBack()).toBeUndefined()
    })
  })

  describe('peekFront', () => {
    it('returns undefined for empty deque', () => {
      const deque = new Deque<number>()
      expect(deque.peekFront()).toBeUndefined()
    })

    it('returns element without removing it', () => {
      const deque = new Deque<number>()
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.peekFront()).toBe(1)
      expect(deque.size).toBe(2)
      expect(deque.peekFront()).toBe(1)
    })

    it('returns correct element after pushFront', () => {
      const deque = new Deque<number>()
      deque.pushBack(1)
      deque.pushFront(0)
      expect(deque.peekFront()).toBe(0)
    })

    it('returns undefined after popping all elements', () => {
      const deque = new Deque<number>()
      deque.pushBack(1)
      deque.popFront()
      expect(deque.peekFront()).toBeUndefined()
    })
  })

  describe('peekBack', () => {
    it('returns undefined for empty deque', () => {
      const deque = new Deque<number>()
      expect(deque.peekBack()).toBeUndefined()
    })

    it('returns element without removing it', () => {
      const deque = new Deque<number>()
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.peekBack()).toBe(2)
      expect(deque.size).toBe(2)
      expect(deque.peekBack()).toBe(2)
    })

    it('returns correct element after pushBack', () => {
      const deque = new Deque<number>()
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.peekBack()).toBe(2)
    })

    it('returns undefined after popping all elements', () => {
      const deque = new Deque<number>()
      deque.pushBack(1)
      deque.popBack()
      expect(deque.peekBack()).toBeUndefined()
    })
  })

  describe('size', () => {
    it('returns 0 for empty deque', () => {
      const deque = new Deque<number>()
      expect(deque.size).toBe(0)
    })

    it('increments with push operations', () => {
      const deque = new Deque<number>()
      deque.pushBack(1)
      expect(deque.size).toBe(1)
      deque.pushFront(0)
      expect(deque.size).toBe(2)
    })

    it('decrements with pop operations', () => {
      const deque = new Deque<number>()
      deque.pushBack(1)
      deque.pushBack(2)
      deque.popFront()
      expect(deque.size).toBe(1)
      deque.popBack()
      expect(deque.size).toBe(0)
    })

    it('handles many operations correctly', () => {
      const deque = new Deque<number>()
      for (let i = 0; i < 100; i++) {
        deque.pushBack(i)
      }
      expect(deque.size).toBe(100)
      for (let i = 0; i < 50; i++) {
        deque.popFront()
      }
      expect(deque.size).toBe(50)
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty deque', () => {
      const deque = new Deque<number>()
      expect(deque.isEmpty()).toBe(true)
    })

    it('returns false after adding element', () => {
      const deque = new Deque<number>()
      deque.pushBack(1)
      expect(deque.isEmpty()).toBe(false)
    })

    it('returns true after removing all elements', () => {
      const deque = new Deque<number>()
      deque.pushBack(1)
      deque.popFront()
      expect(deque.isEmpty()).toBe(true)
    })

    it('returns false for deque with many elements', () => {
      const deque = new Deque<number>()
      for (let i = 0; i < 100; i++) {
        deque.pushBack(i)
      }
      expect(deque.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('clears empty deque', () => {
      const deque = new Deque<number>()
      deque.clear()
      expect(deque.size).toBe(0)
      expect(deque.isEmpty()).toBe(true)
    })

    it('clears deque with elements', () => {
      const deque = new Deque<number>()
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.clear()
      expect(deque.size).toBe(0)
      expect(deque.isEmpty()).toBe(true)
      expect(deque.peekFront()).toBeUndefined()
      expect(deque.peekBack()).toBeUndefined()
    })

    it('allows adding elements after clear', () => {
      const deque = new Deque<number>()
      deque.pushBack(1)
      deque.clear()
      deque.pushBack(2)
      expect(deque.size).toBe(1)
      expect(deque.peekFront()).toBe(2)
    })

    it('clears deque after many operations', () => {
      const deque = new Deque<number>()
      for (let i = 0; i < 100; i++) {
        deque.pushBack(i)
      }
      for (let i = 0; i < 50; i++) {
        deque.popFront()
      }
      deque.clear()
      expect(deque.size).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty deque', () => {
      const deque = new Deque<number>()
      expect(deque.toArray()).toEqual([])
    })

    it('returns array with single element', () => {
      const deque = new Deque<number>()
      deque.pushBack(1)
      expect(deque.toArray()).toEqual([1])
    })

    it('returns array with multiple elements in order', () => {
      const deque = new Deque<number>()
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.toArray()).toEqual([1, 2, 3])
    })

    it('handles interleaved pushFront and pushBack', () => {
      const deque = new Deque<number>()
      deque.pushBack(2)
      deque.pushFront(1)
      deque.pushBack(3)
      deque.pushFront(0)
      expect(deque.toArray()).toEqual([0, 1, 2, 3])
    })

    it('handles wraparound correctly', () => {
      const deque = new Deque<number>(4)
      deque.pushBack(1)
      deque.pushBack(2)
      deque.popFront()
      deque.pushBack(3)
      deque.pushBack(4)
      expect(deque.toArray()).toEqual([2, 3, 4])
    })

    it('does not modify deque', () => {
      const deque = new Deque<number>()
      deque.pushBack(1)
      deque.pushBack(2)
      const arr1 = deque.toArray()
      const arr2 = deque.toArray()
      expect(arr1).toEqual(arr2)
      expect(deque.size).toBe(2)
    })
  })

  describe('fromArray', () => {
    it('creates deque from empty array', () => {
      const deque = Deque.fromArray<number>([])
      expect(deque.size).toBe(0)
      expect(deque.isEmpty()).toBe(true)
    })

    it('creates deque from single element array', () => {
      const deque = Deque.fromArray([1])
      expect(deque.size).toBe(1)
      expect(deque.toArray()).toEqual([1])
    })

    it('creates deque from multiple elements', () => {
      const deque = Deque.fromArray([1, 2, 3, 4, 5])
      expect(deque.size).toBe(5)
      expect(deque.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('preserves array order', () => {
      const arr = [10, 20, 30, 40, 50]
      const deque = Deque.fromArray(arr)
      expect(deque.toArray()).toEqual(arr)
    })

    it('handles large arrays', () => {
      const arr = Array.from({ length: 1000 }, (_, i) => i)
      const deque = Deque.fromArray(arr)
      expect(deque.size).toBe(1000)
      expect(deque.toArray()).toEqual(arr)
    })
  })

  describe('interleaved operations', () => {
    it('handles push and pop from same end', () => {
      const deque = new Deque<number>()
      deque.pushBack(1)
      deque.pushBack(2)
      deque.popFront()
      deque.pushBack(3)
      expect(deque.toArray()).toEqual([2, 3])
    })

    it('handles push and pop from opposite ends', () => {
      const deque = new Deque<number>()
      deque.pushBack(1)
      deque.pushFront(0)
      deque.popBack()
      deque.pushBack(2)
      expect(deque.toArray()).toEqual([0, 2])
    })

    it('handles complex sequence of operations', () => {
      const deque = new Deque<number>()
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushFront(0)
      deque.popFront()
      deque.pushBack(3)
      deque.popBack()
      deque.pushFront(-1)
      expect(deque.toArray()).toEqual([-1, 1, 2])
    })

    it('handles many alternating operations', () => {
      const deque = new Deque<number>()
      for (let i = 0; i < 100; i++) {
        deque.pushBack(i)
      }
      for (let i = 0; i < 50; i++) {
        deque.popFront()
      }
      for (let i = 0; i < 25; i++) {
        deque.pushFront(-i - 1)
      }
      expect(deque.size).toBe(75)
    })
  })
})