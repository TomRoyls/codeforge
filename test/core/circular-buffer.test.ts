import { describe, it, expect, beforeEach } from 'vitest'
import { CircularBuffer } from '../../src/core/circular-buffer/circular-buffer.js'
import { DEFAULT_CIRCULAR_BUFFER_CAPACITY } from '../../src/core/circular-buffer/types.js'

describe('CircularBuffer', () => {
  let cb: CircularBuffer<number>

  beforeEach(() => {
    cb = new CircularBuffer<number>(5)
  })

  describe('constructor', () => {
    it('should create buffer with specified capacity', () => {
      const buf = new CircularBuffer<number>(10)
      expect(buf.capacity).toBe(10)
      expect(buf.size).toBe(0)
      expect(buf.isEmpty()).toBe(true)
    })

    it('should clamp capacity to at least 1', () => {
      const buf = new CircularBuffer<number>(0)
      expect(buf.capacity).toBe(1)
    })

    it('should clamp negative capacity to 1', () => {
      const buf = new CircularBuffer<number>(-5)
      expect(buf.capacity).toBe(1)
    })

    it('should create buffer with capacity 1', () => {
      const buf = new CircularBuffer<number>(1)
      expect(buf.capacity).toBe(1)
      expect(buf.size).toBe(0)
    })

    it('should work with no generic type parameter', () => {
      const buf = new CircularBuffer(3)
      expect(buf.capacity).toBe(3)
    })

    it('should export DEFAULT_CIRCULAR_BUFFER_CAPACITY constant', () => {
      expect(DEFAULT_CIRCULAR_BUFFER_CAPACITY).toBe(8)
    })

    it('should create buffer with default exported capacity', () => {
      const buf = new CircularBuffer<number>(DEFAULT_CIRCULAR_BUFFER_CAPACITY)
      expect(buf.capacity).toBe(8)
    })
  })

  describe('push', () => {
    it('should add an item to the back', () => {
      cb.push(1)
      expect(cb.size).toBe(1)
      expect(cb.peekBack()).toBe(1)
    })

    it('should return undefined when not full', () => {
      expect(cb.push(1)).toBeUndefined()
    })

    it('should return evicted item when full', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      cb.push(4)
      cb.push(5)
      expect(cb.isFull()).toBe(true)
      expect(cb.push(6)).toBe(1)
    })

    it('should evict oldest item when overwriting', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      cb.push(4)
      cb.push(5)
      cb.push(6)
      cb.push(7)
      expect(cb.toArray()).toEqual([3, 4, 5, 6, 7])
    })

    it('should maintain correct size when overwriting', () => {
      for (let i = 0; i < 10; i++) cb.push(i)
      expect(cb.size).toBe(5)
    })

    it('should handle multiple items pushed in order', () => {
      cb.push(10)
      cb.push(20)
      cb.push(30)
      expect(cb.toArray()).toEqual([10, 20, 30])
    })

    it('should handle push on empty buffer', () => {
      cb.push(42)
      expect(cb.peekFront()).toBe(42)
      expect(cb.peekBack()).toBe(42)
    })

    it('should handle push on capacity 1 buffer', () => {
      const buf = new CircularBuffer<number>(1)
      expect(buf.push(1)).toBeUndefined()
      expect(buf.push(2)).toBe(1)
      expect(buf.toArray()).toEqual([2])
    })

    it('should correctly update front after eviction', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      cb.push(4)
      cb.push(5)
      cb.push(6)
      expect(cb.peekFront()).toBe(2)
    })

    it('should correctly update back after push', () => {
      cb.push(1)
      cb.push(2)
      expect(cb.peekBack()).toBe(2)
    })

    it('should handle sequential overwrites', () => {
      const buf = new CircularBuffer<number>(2)
      buf.push(1)
      buf.push(2)
      expect(buf.push(3)).toBe(1)
      expect(buf.push(4)).toBe(2)
      expect(buf.toArray()).toEqual([3, 4])
    })

    it('should keep size equal to capacity during overwrites', () => {
      for (let i = 0; i < 100; i++) cb.push(i)
      expect(cb.size).toBe(5)
      expect(cb.isFull()).toBe(true)
    })
  })

  describe('pop', () => {
    it('should return undefined for empty buffer', () => {
      expect(cb.pop()).toBeUndefined()
    })

    it('should remove and return the back item', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      expect(cb.pop()).toBe(3)
      expect(cb.toArray()).toEqual([1, 2])
    })

    it('should decrement size', () => {
      cb.push(1)
      cb.push(2)
      cb.pop()
      expect(cb.size).toBe(1)
    })

    it('should handle popping all items', () => {
      cb.push(1)
      cb.push(2)
      expect(cb.pop()).toBe(2)
      expect(cb.pop()).toBe(1)
      expect(cb.pop()).toBeUndefined()
      expect(cb.isEmpty()).toBe(true)
    })

    it('should handle pop on single item buffer', () => {
      const buf = new CircularBuffer<number>(1)
      buf.push(42)
      expect(buf.pop()).toBe(42)
      expect(buf.isEmpty()).toBe(true)
    })

    it('should handle multiple pops on empty buffer', () => {
      expect(cb.pop()).toBeUndefined()
      expect(cb.pop()).toBeUndefined()
      expect(cb.pop()).toBeUndefined()
    })

    it('should update peekBack after pop', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      cb.pop()
      expect(cb.peekBack()).toBe(2)
    })

    it('should not affect front item', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      cb.pop()
      expect(cb.peekFront()).toBe(1)
    })
  })

  describe('shift', () => {
    it('should return undefined for empty buffer', () => {
      expect(cb.shift()).toBeUndefined()
    })

    it('should remove and return the front item', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      expect(cb.shift()).toBe(1)
      expect(cb.toArray()).toEqual([2, 3])
    })

    it('should decrement size', () => {
      cb.push(1)
      cb.push(2)
      cb.shift()
      expect(cb.size).toBe(1)
    })

    it('should handle shifting all items', () => {
      cb.push(1)
      cb.push(2)
      expect(cb.shift()).toBe(1)
      expect(cb.shift()).toBe(2)
      expect(cb.shift()).toBeUndefined()
      expect(cb.isEmpty()).toBe(true)
    })

    it('should update peekFront after shift', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      cb.shift()
      expect(cb.peekFront()).toBe(2)
    })

    it('should not affect back item', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      cb.shift()
      expect(cb.peekBack()).toBe(3)
    })

    it('should handle multiple shifts on empty buffer', () => {
      expect(cb.shift()).toBeUndefined()
      expect(cb.shift()).toBeUndefined()
    })

    it('should handle shift on single item', () => {
      cb.push(42)
      expect(cb.shift()).toBe(42)
      expect(cb.isEmpty()).toBe(true)
    })
  })

  describe('unshift', () => {
    it('should add an item to the front', () => {
      cb.unshift(1)
      expect(cb.peekFront()).toBe(1)
      expect(cb.size).toBe(1)
    })

    it('should return undefined when not full', () => {
      expect(cb.unshift(1)).toBeUndefined()
    })

    it('should return evicted item when full', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      cb.push(4)
      cb.push(5)
      expect(cb.isFull()).toBe(true)
      expect(cb.unshift(0)).toBe(5)
    })

    it('should maintain correct order after multiple unshifts', () => {
      cb.unshift(3)
      cb.unshift(2)
      cb.unshift(1)
      expect(cb.toArray()).toEqual([1, 2, 3])
    })

    it('should evict back item when overwriting', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      cb.push(4)
      cb.push(5)
      cb.unshift(0)
      expect(cb.toArray()).toEqual([0, 1, 2, 3, 4])
    })

    it('should handle unshift on empty buffer', () => {
      cb.unshift(42)
      expect(cb.peekFront()).toBe(42)
      expect(cb.peekBack()).toBe(42)
    })

    it('should handle unshift on capacity 1 buffer', () => {
      const buf = new CircularBuffer<number>(1)
      expect(buf.unshift(1)).toBeUndefined()
      expect(buf.unshift(2)).toBe(1)
      expect(buf.toArray()).toEqual([2])
    })

    it('should handle mixed push and unshift', () => {
      cb.push(2)
      cb.unshift(1)
      cb.push(3)
      cb.unshift(0)
      expect(cb.toArray()).toEqual([0, 1, 2, 3])
    })

    it('should keep size equal to capacity during overwrites', () => {
      for (let i = 0; i < 10; i++) cb.unshift(i)
      expect(cb.size).toBe(5)
      expect(cb.isFull()).toBe(true)
    })

    it('should handle sequential overwrites via unshift', () => {
      const buf = new CircularBuffer<number>(2)
      buf.unshift(1)
      buf.unshift(2)
      expect(buf.unshift(3)).toBe(1)
      expect(buf.toArray()).toEqual([3, 2])
    })

    it('should handle unshift after shift creates space', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      cb.shift()
      cb.unshift(0)
      expect(cb.toArray()).toEqual([0, 2, 3])
    })

    it('should handle unshift after pop creates space', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      cb.pop()
      cb.unshift(0)
      expect(cb.toArray()).toEqual([0, 1, 2])
    })
  })

  describe('get', () => {
    it('should return undefined for empty buffer', () => {
      expect(cb.get(0)).toBeUndefined()
    })

    it('should return undefined for negative index', () => {
      cb.push(1)
      expect(cb.get(-1)).toBeUndefined()
    })

    it('should return undefined for index >= size', () => {
      cb.push(1)
      expect(cb.get(1)).toBeUndefined()
    })

    it('should return item at given index', () => {
      cb.push(10)
      cb.push(20)
      cb.push(30)
      expect(cb.get(0)).toBe(10)
      expect(cb.get(1)).toBe(20)
      expect(cb.get(2)).toBe(30)
    })

    it('should not modify the buffer', () => {
      cb.push(1)
      cb.push(2)
      cb.get(0)
      expect(cb.size).toBe(2)
    })

    it('should work after wraparound', () => {
      cb.push(1)
      cb.push(2)
      cb.shift()
      cb.push(3)
      cb.push(4)
      cb.push(5)
      expect(cb.get(0)).toBe(2)
      expect(cb.get(1)).toBe(3)
      expect(cb.get(2)).toBe(4)
      expect(cb.get(3)).toBe(5)
    })

    it('should handle large index near boundary', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      expect(cb.get(2)).toBe(3)
      expect(cb.get(3)).toBeUndefined()
    })

    it('should return correct values after mixed operations', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      cb.pop()
      cb.unshift(0)
      expect(cb.get(0)).toBe(0)
      expect(cb.get(1)).toBe(1)
      expect(cb.get(2)).toBe(2)
    })
  })

  describe('set', () => {
    it('should set item at given index', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      cb.set(1, 99)
      expect(cb.get(1)).toBe(99)
    })

    it('should throw RangeError for negative index', () => {
      cb.push(1)
      expect(() => cb.set(-1, 99)).toThrow(RangeError)
    })

    it('should throw RangeError for index >= size', () => {
      cb.push(1)
      expect(() => cb.set(1, 99)).toThrow(RangeError)
    })

    it('should throw RangeError for empty buffer', () => {
      expect(() => cb.set(0, 99)).toThrow(RangeError)
    })

    it('should set at first index', () => {
      cb.push(1)
      cb.push(2)
      cb.set(0, 10)
      expect(cb.peekFront()).toBe(10)
    })

    it('should set at last index', () => {
      cb.push(1)
      cb.push(2)
      cb.set(1, 20)
      expect(cb.peekBack()).toBe(20)
    })

    it('should work after wraparound', () => {
      cb.push(1)
      cb.push(2)
      cb.shift()
      cb.push(3)
      cb.push(4)
      cb.push(5)
      cb.set(1, 99)
      expect(cb.get(1)).toBe(99)
    })

    it('should preserve other elements', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      cb.set(1, 99)
      expect(cb.get(0)).toBe(1)
      expect(cb.get(2)).toBe(3)
    })
  })

  describe('peekFront', () => {
    it('should return undefined for empty buffer', () => {
      expect(cb.peekFront()).toBeUndefined()
    })

    it('should return the front item without removing it', () => {
      cb.push(1)
      cb.push(2)
      expect(cb.peekFront()).toBe(1)
      expect(cb.size).toBe(2)
    })

    it('should reflect changes after shift', () => {
      cb.push(1)
      cb.push(2)
      cb.shift()
      expect(cb.peekFront()).toBe(2)
    })

    it('should reflect changes after unshift', () => {
      cb.push(1)
      cb.unshift(0)
      expect(cb.peekFront()).toBe(0)
    })

    it('should return undefined after all items removed', () => {
      cb.push(1)
      cb.shift()
      expect(cb.peekFront()).toBeUndefined()
    })

    it('should handle multiple peeks without side effects', () => {
      cb.push(42)
      expect(cb.peekFront()).toBe(42)
      expect(cb.peekFront()).toBe(42)
      expect(cb.size).toBe(1)
    })
  })

  describe('peekBack', () => {
    it('should return undefined for empty buffer', () => {
      expect(cb.peekBack()).toBeUndefined()
    })

    it('should return the back item without removing it', () => {
      cb.push(1)
      cb.push(2)
      expect(cb.peekBack()).toBe(2)
      expect(cb.size).toBe(2)
    })

    it('should reflect changes after pop', () => {
      cb.push(1)
      cb.push(2)
      cb.pop()
      expect(cb.peekBack()).toBe(1)
    })

    it('should reflect changes after push', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      expect(cb.peekBack()).toBe(3)
    })

    it('should return undefined after all items removed', () => {
      cb.push(1)
      cb.pop()
      expect(cb.peekBack()).toBeUndefined()
    })

    it('should handle multiple peeks without side effects', () => {
      cb.push(42)
      expect(cb.peekBack()).toBe(42)
      expect(cb.peekBack()).toBe(42)
      expect(cb.size).toBe(1)
    })
  })

  describe('isFull', () => {
    it('should return false for empty buffer', () => {
      expect(cb.isFull()).toBe(false)
    })

    it('should return false when partially filled', () => {
      cb.push(1)
      cb.push(2)
      expect(cb.isFull()).toBe(false)
    })

    it('should return true when at capacity', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      cb.push(4)
      cb.push(5)
      expect(cb.isFull()).toBe(true)
    })

    it('should return false after shift from full buffer', () => {
      for (let i = 0; i < 5; i++) cb.push(i)
      cb.shift()
      expect(cb.isFull()).toBe(false)
    })

    it('should return true during continuous overwriting', () => {
      for (let i = 0; i < 10; i++) cb.push(i)
      expect(cb.isFull()).toBe(true)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new buffer', () => {
      expect(cb.isEmpty()).toBe(true)
    })

    it('should return false after push', () => {
      cb.push(1)
      expect(cb.isEmpty()).toBe(false)
    })

    it('should return true after removing all items', () => {
      cb.push(1)
      cb.shift()
      expect(cb.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      cb.push(1)
      cb.push(2)
      cb.clear()
      expect(cb.isEmpty()).toBe(true)
    })

    it('should return false after unshift', () => {
      cb.unshift(1)
      expect(cb.isEmpty()).toBe(false)
    })
  })

  describe('size', () => {
    it('should return 0 for empty buffer', () => {
      expect(cb.size).toBe(0)
    })

    it('should return correct size after pushes', () => {
      cb.push(1)
      cb.push(2)
      expect(cb.size).toBe(2)
    })

    it('should return correct size after pop', () => {
      cb.push(1)
      cb.push(2)
      cb.pop()
      expect(cb.size).toBe(1)
    })

    it('should return correct size after shift', () => {
      cb.push(1)
      cb.push(2)
      cb.shift()
      expect(cb.size).toBe(1)
    })

    it('should return 0 after clear', () => {
      cb.push(1)
      cb.push(2)
      cb.clear()
      expect(cb.size).toBe(0)
    })

    it('should not exceed capacity', () => {
      for (let i = 0; i < 10; i++) cb.push(i)
      expect(cb.size).toBe(5)
    })
  })

  describe('capacity', () => {
    it('should return the configured capacity', () => {
      expect(cb.capacity).toBe(5)
    })

    it('should return 1 for minimum capacity buffer', () => {
      const buf = new CircularBuffer<number>(1)
      expect(buf.capacity).toBe(1)
    })

    it('should not change after operations', () => {
      cb.push(1)
      cb.push(2)
      cb.pop()
      expect(cb.capacity).toBe(5)
    })

    it('should not change after clear', () => {
      cb.push(1)
      cb.clear()
      expect(cb.capacity).toBe(5)
    })
  })

  describe('available', () => {
    it('should return full capacity when empty', () => {
      expect(cb.available()).toBe(5)
    })

    it('should return remaining capacity after pushes', () => {
      cb.push(1)
      cb.push(2)
      expect(cb.available()).toBe(3)
    })

    it('should return 0 when full', () => {
      for (let i = 0; i < 5; i++) cb.push(i)
      expect(cb.available()).toBe(0)
    })

    it('should increase after shift', () => {
      for (let i = 0; i < 5; i++) cb.push(i)
      cb.shift()
      expect(cb.available()).toBe(1)
    })

    it('should increase after pop', () => {
      for (let i = 0; i < 5; i++) cb.push(i)
      cb.pop()
      expect(cb.available()).toBe(1)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty buffer', () => {
      expect(cb.toArray()).toEqual([])
    })

    it('should return items in order', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      expect(cb.toArray()).toEqual([1, 2, 3])
    })

    it('should not modify the buffer', () => {
      cb.push(1)
      cb.push(2)
      cb.toArray()
      expect(cb.size).toBe(2)
    })

    it('should handle items after wraparound', () => {
      cb.push(1)
      cb.push(2)
      cb.shift()
      cb.push(3)
      cb.push(4)
      cb.push(5)
      expect(cb.toArray()).toEqual([2, 3, 4, 5])
    })

    it('should handle single item', () => {
      cb.push(42)
      expect(cb.toArray()).toEqual([42])
    })

    it('should reflect overwrites correctly', () => {
      for (let i = 0; i < 7; i++) cb.push(i)
      expect(cb.toArray()).toEqual([2, 3, 4, 5, 6])
    })
  })

  describe('clear', () => {
    it('should remove all items', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      cb.clear()
      expect(cb.size).toBe(0)
      expect(cb.isEmpty()).toBe(true)
    })

    it('should allow push after clear', () => {
      cb.push(1)
      cb.clear()
      cb.push(2)
      expect(cb.size).toBe(1)
      expect(cb.peekFront()).toBe(2)
    })

    it('should handle clearing empty buffer', () => {
      cb.clear()
      expect(cb.size).toBe(0)
    })

    it('should not change capacity', () => {
      const cap = cb.capacity
      cb.push(1)
      cb.clear()
      expect(cb.capacity).toBe(cap)
    })

    it('should reset available to full capacity', () => {
      cb.push(1)
      cb.push(2)
      cb.clear()
      expect(cb.available()).toBe(5)
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty buffer', () => {
      const items: number[] = []
      cb.forEach((item) => items.push(item))
      expect(items).toEqual([])
    })

    it('should iterate all items in order', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      const items: number[] = []
      cb.forEach((item) => items.push(item))
      expect(items).toEqual([1, 2, 3])
    })

    it('should provide correct indices', () => {
      cb.push(10)
      cb.push(20)
      cb.push(30)
      const indices: number[] = []
      cb.forEach((_item, index) => indices.push(index))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should handle single item', () => {
      cb.push(42)
      let count = 0
      cb.forEach((item) => {
        expect(item).toBe(42)
        count++
      })
      expect(count).toBe(1)
    })

    it('should work after wraparound', () => {
      cb.push(1)
      cb.push(2)
      cb.shift()
      cb.push(3)
      cb.push(4)
      const items: number[] = []
      cb.forEach((item) => items.push(item))
      expect(items).toEqual([2, 3, 4])
    })

    it('should not modify the buffer', () => {
      cb.push(1)
      cb.push(2)
      cb.forEach(() => {})
      expect(cb.size).toBe(2)
    })
  })

  describe('indexOf', () => {
    it('should return -1 for empty buffer', () => {
      expect(cb.indexOf(1)).toBe(-1)
    })

    it('should return index of found item', () => {
      cb.push(10)
      cb.push(20)
      cb.push(30)
      expect(cb.indexOf(20)).toBe(1)
    })

    it('should return -1 for item not found', () => {
      cb.push(10)
      cb.push(20)
      expect(cb.indexOf(99)).toBe(-1)
    })

    it('should return first occurrence for duplicates', () => {
      cb.push(10)
      cb.push(20)
      cb.push(10)
      expect(cb.indexOf(10)).toBe(0)
    })

    it('should find item at front', () => {
      cb.push(10)
      cb.push(20)
      expect(cb.indexOf(10)).toBe(0)
    })

    it('should find item at back', () => {
      cb.push(10)
      cb.push(20)
      expect(cb.indexOf(20)).toBe(1)
    })

    it('should use strict equality', () => {
      const buf = new CircularBuffer<string>(3)
      buf.push('hello')
      expect(buf.indexOf('hello')).toBe(0)
      expect(buf.indexOf('world')).toBe(-1)
    })

    it('should work after wraparound', () => {
      cb.push(1)
      cb.push(2)
      cb.shift()
      cb.push(3)
      cb.push(4)
      expect(cb.indexOf(2)).toBe(0)
      expect(cb.indexOf(3)).toBe(1)
      expect(cb.indexOf(4)).toBe(2)
    })
  })

  describe('contains', () => {
    it('should return false for empty buffer', () => {
      expect(cb.contains(1)).toBe(false)
    })

    it('should return true for existing item', () => {
      cb.push(10)
      cb.push(20)
      expect(cb.contains(20)).toBe(true)
    })

    it('should return false for missing item', () => {
      cb.push(10)
      expect(cb.contains(99)).toBe(false)
    })

    it('should find items after unshift', () => {
      cb.push(2)
      cb.unshift(1)
      expect(cb.contains(1)).toBe(true)
      expect(cb.contains(2)).toBe(true)
    })

    it('should use strict equality', () => {
      const buf = new CircularBuffer<string>(3)
      buf.push('hello')
      expect(buf.contains('hello')).toBe(true)
      expect(buf.contains('world')).toBe(false)
    })

    it('should not find evicted items', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      cb.push(4)
      cb.push(5)
      cb.push(6)
      expect(cb.contains(1)).toBe(false)
      expect(cb.contains(2)).toBe(false)
      expect(cb.contains(6)).toBe(true)
    })
  })

  describe('rotate', () => {
    it('should rotate left by 1', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      cb.rotate(1)
      expect(cb.toArray()).toEqual([2, 3, 1])
    })

    it('should rotate left by 2', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      cb.push(4)
      cb.rotate(2)
      expect(cb.toArray()).toEqual([3, 4, 1, 2])
    })

    it('should rotate right by negative value', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      cb.rotate(-1)
      expect(cb.toArray()).toEqual([3, 1, 2])
    })

    it('should handle rotation equal to size', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      cb.rotate(3)
      expect(cb.toArray()).toEqual([1, 2, 3])
    })

    it('should handle rotation greater than size', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      cb.rotate(5)
      expect(cb.toArray()).toEqual([3, 1, 2])
    })

    it('should handle negative rotation greater than size', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      cb.rotate(-5)
      expect(cb.toArray()).toEqual([2, 3, 1])
    })

    it('should handle rotation of 0', () => {
      cb.push(1)
      cb.push(2)
      cb.rotate(0)
      expect(cb.toArray()).toEqual([1, 2])
    })

    it('should handle empty buffer', () => {
      cb.rotate(3)
      expect(cb.size).toBe(0)
    })

    it('should preserve size after rotation', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      cb.rotate(1)
      expect(cb.size).toBe(3)
    })

    it('should allow shift after rotation', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      cb.rotate(1)
      expect(cb.shift()).toBe(2)
      expect(cb.shift()).toBe(3)
      expect(cb.shift()).toBe(1)
    })

    it('should handle rotate then rotate back', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      cb.rotate(1)
      cb.rotate(-1)
      expect(cb.toArray()).toEqual([1, 2, 3])
    })

    it('should handle full buffer rotation', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      cb.push(4)
      cb.push(5)
      cb.rotate(2)
      expect(cb.toArray()).toEqual([3, 4, 5, 1, 2])
      expect(cb.size).toBe(5)
      expect(cb.isFull()).toBe(true)
    })
  })

  describe('clone', () => {
    it('should clone an empty buffer', () => {
      const cloned = cb.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should clone all items', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      const cloned = cb.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3])
    })

    it('should return a new instance', () => {
      cb.push(1)
      const cloned = cb.clone()
      expect(cloned).not.toBe(cb)
    })

    it('should not affect original when modifying clone', () => {
      cb.push(1)
      cb.push(2)
      const cloned = cb.clone()
      cloned.push(3)
      expect(cb.size).toBe(2)
      expect(cloned.size).toBe(3)
    })

    it('should preserve capacity', () => {
      cb.push(1)
      const cloned = cb.clone()
      expect(cloned.capacity).toBe(cb.capacity)
    })

    it('should handle full buffer clone', () => {
      for (let i = 0; i < 5; i++) cb.push(i)
      const cloned = cb.clone()
      expect(cloned.toArray()).toEqual([0, 1, 2, 3, 4])
      expect(cloned.isFull()).toBe(true)
    })

    it('should handle wrapped buffer clone', () => {
      cb.push(1)
      cb.push(2)
      cb.shift()
      cb.push(3)
      cb.push(4)
      const cloned = cb.clone()
      expect(cloned.toArray()).toEqual([2, 3, 4])
    })
  })

  describe('Symbol.iterator', () => {
    it('should iterate over empty buffer', () => {
      const items: number[] = []
      for (const item of cb) {
        items.push(item)
      }
      expect(items).toEqual([])
    })

    it('should iterate over all items in order', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      const items: number[] = []
      for (const item of cb) {
        items.push(item)
      }
      expect(items).toEqual([1, 2, 3])
    })

    it('should work with spread operator', () => {
      cb.push(10)
      cb.push(20)
      expect([...cb]).toEqual([10, 20])
    })

    it('should work with Array.from', () => {
      cb.push(1)
      cb.push(2)
      expect(Array.from(cb)).toEqual([1, 2])
    })

    it('should work after wraparound', () => {
      cb.push(1)
      cb.push(2)
      cb.shift()
      cb.push(3)
      cb.push(4)
      expect([...cb]).toEqual([2, 3, 4])
    })

    it('should not modify the buffer', () => {
      cb.push(1)
      cb.push(2)
      for (const _item of cb) {
        break
      }
      expect(cb.size).toBe(2)
    })
  })

  describe('static fromArray', () => {
    it('should create buffer from an empty array', () => {
      const buf = CircularBuffer.fromArray([])
      expect(buf.size).toBe(0)
      expect(buf.isEmpty()).toBe(true)
    })

    it('should create buffer from an array', () => {
      const buf = CircularBuffer.fromArray([1, 2, 3])
      expect(buf.toArray()).toEqual([1, 2, 3])
    })

    it('should use array length as capacity by default', () => {
      const buf = CircularBuffer.fromArray([1, 2, 3])
      expect(buf.capacity).toBe(3)
    })

    it('should use specified capacity', () => {
      const buf = CircularBuffer.fromArray([1, 2, 3], 10)
      expect(buf.capacity).toBe(10)
    })

    it('should evict items when capacity is smaller than array', () => {
      const buf = CircularBuffer.fromArray([1, 2, 3, 4, 5], 3)
      expect(buf.toArray()).toEqual([3, 4, 5])
      expect(buf.capacity).toBe(3)
    })

    it('should preserve item order', () => {
      const buf = CircularBuffer.fromArray([10, 20, 30])
      expect(buf.get(0)).toBe(10)
      expect(buf.get(1)).toBe(20)
      expect(buf.get(2)).toBe(30)
    })

    it('should work with string arrays', () => {
      const buf = CircularBuffer.fromArray(['a', 'b', 'c'])
      expect(buf.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('should create buffer with capacity 1 from empty array', () => {
      const buf = CircularBuffer.fromArray([])
      expect(buf.capacity).toBe(1)
    })
  })

  describe('mixed operations', () => {
    it('should handle push then shift', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      expect(cb.shift()).toBe(1)
      expect(cb.toArray()).toEqual([2, 3])
    })

    it('should handle push then pop', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      expect(cb.pop()).toBe(3)
      expect(cb.toArray()).toEqual([1, 2])
    })

    it('should handle unshift then shift', () => {
      cb.unshift(3)
      cb.unshift(2)
      cb.unshift(1)
      expect(cb.shift()).toBe(1)
      expect(cb.toArray()).toEqual([2, 3])
    })

    it('should handle unshift then pop', () => {
      cb.unshift(3)
      cb.unshift(2)
      cb.unshift(1)
      expect(cb.pop()).toBe(3)
      expect(cb.toArray()).toEqual([1, 2])
    })

    it('should handle interleaved push and unshift', () => {
      cb.push(2)
      cb.unshift(1)
      cb.push(3)
      cb.unshift(0)
      expect(cb.toArray()).toEqual([0, 1, 2, 3])
    })

    it('should handle alternating push and pop', () => {
      cb.push(1)
      expect(cb.pop()).toBe(1)
      cb.push(2)
      expect(cb.pop()).toBe(2)
      expect(cb.isEmpty()).toBe(true)
    })

    it('should handle alternating unshift and shift', () => {
      cb.unshift(1)
      expect(cb.shift()).toBe(1)
      cb.unshift(2)
      expect(cb.shift()).toBe(2)
      expect(cb.isEmpty()).toBe(true)
    })

    it('should handle complex sequence', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      cb.shift()
      cb.unshift(0)
      cb.pop()
      expect(cb.toArray()).toEqual([0, 1, 2])
    })
  })

  describe('wraparound behavior', () => {
    it('should handle head wrapping around', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      cb.shift()
      cb.shift()
      cb.shift()
      cb.push(4)
      cb.push(5)
      expect(cb.toArray()).toEqual([4, 5])
    })

    it('should handle tail wrapping around', () => {
      cb.push(1)
      cb.push(2)
      cb.shift()
      cb.push(3)
      cb.shift()
      cb.push(4)
      expect(cb.toArray()).toEqual([3, 4])
    })

    it('should handle multiple wraparound cycles', () => {
      const buf = new CircularBuffer<number>(3)
      for (let cycle = 0; cycle < 5; cycle++) {
        buf.push(cycle * 2)
        buf.push(cycle * 2 + 1)
        buf.shift()
        buf.shift()
      }
      expect(buf.size).toBe(0)
    })

    it('should maintain correct indices during wraparound', () => {
      cb.push(1)
      cb.push(2)
      cb.shift()
      cb.push(3)
      cb.shift()
      cb.push(4)
      cb.shift()
      cb.push(5)
      expect(cb.get(0)).toBe(4)
      expect(cb.get(1)).toBe(5)
    })

    it('should handle get after wraparound', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      cb.shift()
      cb.push(4)
      cb.shift()
      cb.push(5)
      expect(cb.get(0)).toBe(3)
      expect(cb.get(1)).toBe(4)
      expect(cb.get(2)).toBe(5)
    })

    it('should handle indexOf after wraparound', () => {
      cb.push(1)
      cb.push(2)
      cb.shift()
      cb.push(3)
      cb.shift()
      cb.push(4)
      expect(cb.indexOf(3)).toBe(0)
      expect(cb.indexOf(4)).toBe(1)
    })

    it('should handle contains after wraparound', () => {
      cb.push(1)
      cb.push(2)
      cb.shift()
      cb.push(3)
      expect(cb.contains(1)).toBe(false)
      expect(cb.contains(2)).toBe(true)
      expect(cb.contains(3)).toBe(true)
    })

    it('should handle toArray after wraparound', () => {
      cb.push(1)
      cb.push(2)
      cb.shift()
      cb.push(3)
      cb.shift()
      cb.push(4)
      expect(cb.toArray()).toEqual([3, 4])
    })
  })

  describe('edge cases', () => {
    it('should handle capacity of 1 with push', () => {
      const buf = new CircularBuffer<number>(1)
      buf.push(1)
      expect(buf.isFull()).toBe(true)
      expect(buf.push(2)).toBe(1)
      expect(buf.toArray()).toEqual([2])
    })

    it('should handle capacity of 1 with unshift', () => {
      const buf = new CircularBuffer<number>(1)
      buf.unshift(1)
      expect(buf.unshift(2)).toBe(1)
      expect(buf.toArray()).toEqual([2])
    })

    it('should handle capacity of 1 with shift', () => {
      const buf = new CircularBuffer<number>(1)
      buf.push(1)
      expect(buf.shift()).toBe(1)
      expect(buf.isEmpty()).toBe(true)
    })

    it('should handle capacity of 1 with pop', () => {
      const buf = new CircularBuffer<number>(1)
      buf.push(1)
      expect(buf.pop()).toBe(1)
      expect(buf.isEmpty()).toBe(true)
    })

    it('should handle object values', () => {
      const buf = new CircularBuffer<{ id: number }>(3)
      buf.push({ id: 1 })
      buf.push({ id: 2 })
      expect(buf.shift()?.id).toBe(1)
      expect(buf.shift()?.id).toBe(2)
    })

    it('should handle string values', () => {
      const buf = new CircularBuffer<string>(3)
      buf.push('hello')
      buf.push('world')
      expect(buf.shift()).toBe('hello')
      expect(buf.shift()).toBe('world')
    })

    it('should handle null values', () => {
      const buf = new CircularBuffer<number | null>(3)
      buf.push(null)
      buf.push(1)
      expect(buf.get(0)).toBeNull()
      expect(buf.get(1)).toBe(1)
    })

    it('should handle boolean values', () => {
      const buf = new CircularBuffer<boolean>(3)
      buf.push(true)
      buf.push(false)
      expect(buf.toArray()).toEqual([true, false])
    })

    it('should handle indexOf with reference types', () => {
      const obj = { id: 1 }
      const buf = new CircularBuffer<{ id: number }>(3)
      buf.push(obj)
      expect(buf.indexOf(obj)).toBe(0)
    })

    it('should handle contains with reference types', () => {
      const obj = { id: 1 }
      const buf = new CircularBuffer<{ id: number }>(3)
      buf.push(obj)
      expect(buf.contains(obj)).toBe(true)
      expect(buf.contains({ id: 1 })).toBe(false)
    })

    it('should handle large number of operations', () => {
      const buf = new CircularBuffer<number>(10)
      for (let i = 0; i < 1000; i++) {
        buf.push(i)
      }
      expect(buf.size).toBe(10)
      expect(buf.toArray()).toEqual([990, 991, 992, 993, 994, 995, 996, 997, 998, 999])
    })

    it('should handle set at index 0 of single item buffer', () => {
      const buf = new CircularBuffer<number>(1)
      buf.push(1)
      buf.set(0, 99)
      expect(buf.get(0)).toBe(99)
    })

    it('should handle rotate on single item', () => {
      const buf = new CircularBuffer<number>(1)
      buf.push(42)
      buf.rotate(1)
      expect(buf.toArray()).toEqual([42])
    })

    it('should handle clone of empty buffer preserving capacity', () => {
      const buf = new CircularBuffer<number>(10)
      const cloned = buf.clone()
      expect(cloned.capacity).toBe(10)
    })

    it('should handle fromArray with single item', () => {
      const buf = CircularBuffer.fromArray([42])
      expect(buf.size).toBe(1)
      expect(buf.peekFront()).toBe(42)
      expect(buf.peekBack()).toBe(42)
    })

    it('should handle forEach on wrapped buffer', () => {
      cb.push(1)
      cb.push(2)
      cb.shift()
      cb.push(3)
      cb.push(4)
      const items: number[] = []
      cb.forEach((item) => items.push(item))
      expect(items).toEqual([2, 3, 4])
    })

    it('should handle set on wrapped buffer', () => {
      cb.push(1)
      cb.push(2)
      cb.shift()
      cb.push(3)
      cb.push(4)
      cb.set(1, 99)
      expect(cb.get(1)).toBe(99)
      expect(cb.toArray()).toEqual([2, 99, 4])
    })

    it('should handle clone of wrapped buffer', () => {
      cb.push(1)
      cb.push(2)
      cb.shift()
      cb.push(3)
      cb.push(4)
      cb.push(5)
      const cloned = cb.clone()
      expect(cloned.toArray()).toEqual([2, 3, 4, 5])
    })

    it('should support different generic types', () => {
      const numBuf = new CircularBuffer<number>(3)
      numBuf.push(42)
      expect(numBuf.shift()).toBe(42)

      const strBuf = new CircularBuffer<string>(3)
      strBuf.push('hello')
      expect(strBuf.shift()).toBe('hello')
    })

    it('should handle rotate on full buffer', () => {
      cb.push(1)
      cb.push(2)
      cb.push(3)
      cb.push(4)
      cb.push(5)
      cb.rotate(2)
      expect(cb.toArray()).toEqual([3, 4, 5, 1, 2])
      expect(cb.isFull()).toBe(true)
      expect(cb.size).toBe(5)
    })
  })
})
