import { describe, it, expect, beforeEach } from 'vitest'
import { DequeArray } from '../../src/core/deque-array/deque-array.js'
import { DEFAULT_DEQUE_CAPACITY } from '../../src/core/deque-array/types.js'
import type { DequeArrayOptions } from '../../src/core/deque-array/types.js'

describe('DequeArray', () => {
  let deque: DequeArray<number>

  beforeEach(() => {
    deque = new DequeArray<number>(4)
  })

  describe('constructor', () => {
    it('should create a deque with default capacity', () => {
      const d = new DequeArray<number>()
      expect(d.size()).toBe(0)
      expect(d.isEmpty()).toBe(true)
      expect(d.capacity()).toBe(DEFAULT_DEQUE_CAPACITY)
    })

    it('should create a deque with custom initial capacity', () => {
      const d = new DequeArray<number>(8)
      expect(d.capacity()).toBe(8)
    })

    it('should create a deque with options object', () => {
      const d = new DequeArray<number>({ initialCapacity: 32 })
      expect(d.capacity()).toBe(32)
    })

    it('should create a deque with empty options', () => {
      const d = new DequeArray<number>({})
      expect(d.capacity()).toBe(DEFAULT_DEQUE_CAPACITY)
    })

    it('should clamp capacity to at least 1', () => {
      const d = new DequeArray<number>(0)
      expect(d.capacity()).toBe(1)
    })

    it('should clamp negative capacity to 1', () => {
      const d = new DequeArray<number>(-5)
      expect(d.capacity()).toBe(1)
    })

    it('should create with options and use default capacity', () => {
      const d = new DequeArray<number>({ initialCapacity: DEFAULT_DEQUE_CAPACITY })
      expect(d.capacity()).toBe(DEFAULT_DEQUE_CAPACITY)
    })

    it('should work with no arguments', () => {
      const d = new DequeArray()
      expect(d.size()).toBe(0)
    })
  })

  describe('pushFront', () => {
    it('should add an item to the front', () => {
      deque.pushFront(1)
      expect(deque.peekFront()).toBe(1)
      expect(deque.size()).toBe(1)
    })

    it('should maintain order when pushing multiple items', () => {
      deque.pushFront(1)
      deque.pushFront(2)
      deque.pushFront(3)
      expect(deque.toArray()).toEqual([3, 2, 1])
    })

    it('should grow the buffer when full', () => {
      deque.pushFront(1)
      deque.pushFront(2)
      deque.pushFront(3)
      deque.pushFront(4)
      deque.pushFront(5)
      expect(deque.size()).toBe(5)
      expect(deque.capacity()).toBe(8)
    })

    it('should work on an empty deque', () => {
      deque.pushFront(42)
      expect(deque.peekFront()).toBe(42)
      expect(deque.peekBack()).toBe(42)
    })
  })

  describe('pushBack', () => {
    it('should add an item to the back', () => {
      deque.pushBack(1)
      expect(deque.peekBack()).toBe(1)
      expect(deque.size()).toBe(1)
    })

    it('should maintain order when pushing multiple items', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.toArray()).toEqual([1, 2, 3])
    })

    it('should grow the buffer when full', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      deque.pushBack(5)
      expect(deque.size()).toBe(5)
      expect(deque.capacity()).toBe(8)
    })

    it('should work on an empty deque', () => {
      deque.pushBack(42)
      expect(deque.peekFront()).toBe(42)
      expect(deque.peekBack()).toBe(42)
    })
  })

  describe('mixed pushFront and pushBack', () => {
    it('should handle interleaved pushes', () => {
      deque.pushBack(2)
      deque.pushFront(1)
      deque.pushBack(3)
      deque.pushFront(0)
      expect(deque.toArray()).toEqual([0, 1, 2, 3])
    })

    it('should handle alternating pushes', () => {
      deque.pushFront(3)
      deque.pushBack(4)
      deque.pushFront(2)
      deque.pushBack(5)
      deque.pushFront(1)
      expect(deque.toArray()).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('popFront', () => {
    it('should return undefined for empty deque', () => {
      expect(deque.popFront()).toBeUndefined()
    })

    it('should remove and return the front item', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.popFront()).toBe(1)
      expect(deque.toArray()).toEqual([2, 3])
    })

    it('should handle popping all items', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.popFront()).toBe(1)
      expect(deque.popFront()).toBe(2)
      expect(deque.popFront()).toBeUndefined()
      expect(deque.isEmpty()).toBe(true)
    })

    it('should decrement size', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.popFront()
      expect(deque.size()).toBe(1)
    })
  })

  describe('popBack', () => {
    it('should return undefined for empty deque', () => {
      expect(deque.popBack()).toBeUndefined()
    })

    it('should remove and return the back item', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.popBack()).toBe(3)
      expect(deque.toArray()).toEqual([1, 2])
    })

    it('should handle popping all items', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.popBack()).toBe(2)
      expect(deque.popBack()).toBe(1)
      expect(deque.popBack()).toBeUndefined()
      expect(deque.isEmpty()).toBe(true)
    })

    it('should decrement size', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.popBack()
      expect(deque.size()).toBe(1)
    })
  })

  describe('peekFront', () => {
    it('should return undefined for empty deque', () => {
      expect(deque.peekFront()).toBeUndefined()
    })

    it('should return the front item without removing it', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.peekFront()).toBe(1)
      expect(deque.size()).toBe(2)
    })

    it('should reflect changes after popFront', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.popFront()
      expect(deque.peekFront()).toBe(2)
    })

    it('should reflect changes after pushFront', () => {
      deque.pushBack(1)
      deque.pushFront(0)
      expect(deque.peekFront()).toBe(0)
    })
  })

  describe('peekBack', () => {
    it('should return undefined for empty deque', () => {
      expect(deque.peekBack()).toBeUndefined()
    })

    it('should return the back item without removing it', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.peekBack()).toBe(2)
      expect(deque.size()).toBe(2)
    })

    it('should reflect changes after popBack', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.popBack()
      expect(deque.peekBack()).toBe(1)
    })

    it('should reflect changes after pushBack', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.peekBack()).toBe(2)
    })
  })

  describe('get', () => {
    it('should return undefined for negative index', () => {
      deque.pushBack(1)
      expect(deque.get(-1)).toBeUndefined()
    })

    it('should return undefined for index >= size', () => {
      deque.pushBack(1)
      expect(deque.get(1)).toBeUndefined()
    })

    it('should return undefined for empty deque', () => {
      expect(deque.get(0)).toBeUndefined()
    })

    it('should return item at given index', () => {
      deque.pushBack(10)
      deque.pushBack(20)
      deque.pushBack(30)
      expect(deque.get(0)).toBe(10)
      expect(deque.get(1)).toBe(20)
      expect(deque.get(2)).toBe(30)
    })

    it('should work after wraparound', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.popFront()
      deque.pushBack(3)
      deque.pushBack(4)
      deque.pushBack(5)
      expect(deque.get(0)).toBe(2)
      expect(deque.get(1)).toBe(3)
      expect(deque.get(2)).toBe(4)
      expect(deque.get(3)).toBe(5)
    })

    it('should not modify the deque', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.get(0)
      expect(deque.size()).toBe(2)
    })
  })

  describe('set', () => {
    it('should set item at given index', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.set(1, 99)
      expect(deque.get(1)).toBe(99)
    })

    it('should throw RangeError for negative index', () => {
      deque.pushBack(1)
      expect(() => deque.set(-1, 99)).toThrow(RangeError)
    })

    it('should throw RangeError for index >= size', () => {
      deque.pushBack(1)
      expect(() => deque.set(1, 99)).toThrow(RangeError)
    })

    it('should throw RangeError for empty deque', () => {
      expect(() => deque.set(0, 99)).toThrow(RangeError)
    })

    it('should set at first index', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.set(0, 10)
      expect(deque.peekFront()).toBe(10)
    })

    it('should set at last index', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.set(1, 20)
      expect(deque.peekBack()).toBe(20)
    })
  })

  describe('insert', () => {
    it('should insert at the beginning', () => {
      deque.pushBack(2)
      deque.pushBack(3)
      deque.insert(0, 1)
      expect(deque.toArray()).toEqual([1, 2, 3])
    })

    it('should insert at the end', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.insert(2, 3)
      expect(deque.toArray()).toEqual([1, 2, 3])
    })

    it('should insert in the middle', () => {
      deque.pushBack(1)
      deque.pushBack(3)
      deque.insert(1, 2)
      expect(deque.toArray()).toEqual([1, 2, 3])
    })

    it('should insert into empty deque', () => {
      deque.insert(0, 1)
      expect(deque.toArray()).toEqual([1])
    })

    it('should throw RangeError for negative index', () => {
      expect(() => deque.insert(-1, 1)).toThrow(RangeError)
    })

    it('should throw RangeError for index > size', () => {
      deque.pushBack(1)
      expect(() => deque.insert(2, 1)).toThrow(RangeError)
    })

    it('should grow buffer when needed', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      deque.insert(2, 99)
      expect(deque.size()).toBe(5)
      expect(deque.capacity()).toBe(8)
      expect(deque.get(2)).toBe(99)
    })

    it('should insert closer to back efficiently', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      deque.insert(3, 99)
      expect(deque.toArray()).toEqual([1, 2, 3, 99, 4])
    })

    it('should insert closer to front efficiently', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      deque.insert(1, 99)
      expect(deque.toArray()).toEqual([1, 99, 2, 3, 4])
    })
  })

  describe('removeAt', () => {
    it('should return undefined for negative index', () => {
      deque.pushBack(1)
      expect(deque.removeAt(-1)).toBeUndefined()
    })

    it('should return undefined for index >= size', () => {
      deque.pushBack(1)
      expect(deque.removeAt(1)).toBeUndefined()
    })

    it('should return undefined for empty deque', () => {
      expect(deque.removeAt(0)).toBeUndefined()
    })

    it('should remove from front', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.removeAt(0)).toBe(1)
      expect(deque.toArray()).toEqual([2, 3])
    })

    it('should remove from back', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.removeAt(2)).toBe(3)
      expect(deque.toArray()).toEqual([1, 2])
    })

    it('should remove from middle', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.removeAt(1)).toBe(2)
      expect(deque.toArray()).toEqual([1, 3])
    })

    it('should remove closer to front efficiently', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      deque.pushBack(5)
      expect(deque.removeAt(1)).toBe(2)
      expect(deque.toArray()).toEqual([1, 3, 4, 5])
    })

    it('should remove closer to back efficiently', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      deque.pushBack(5)
      expect(deque.removeAt(3)).toBe(4)
      expect(deque.toArray()).toEqual([1, 2, 3, 5])
    })

    it('should decrement size', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.removeAt(0)
      expect(deque.size()).toBe(1)
    })
  })

  describe('indexOf', () => {
    it('should return -1 for empty deque', () => {
      expect(deque.indexOf(1)).toBe(-1)
    })

    it('should return index of found item', () => {
      deque.pushBack(10)
      deque.pushBack(20)
      deque.pushBack(30)
      expect(deque.indexOf(20)).toBe(1)
    })

    it('should return -1 for item not found', () => {
      deque.pushBack(10)
      deque.pushBack(20)
      expect(deque.indexOf(99)).toBe(-1)
    })

    it('should return first index of duplicate item', () => {
      deque.pushBack(10)
      deque.pushBack(20)
      deque.pushBack(10)
      expect(deque.indexOf(10)).toBe(0)
    })

    it('should find item at front', () => {
      deque.pushBack(10)
      deque.pushBack(20)
      expect(deque.indexOf(10)).toBe(0)
    })

    it('should find item at back', () => {
      deque.pushBack(10)
      deque.pushBack(20)
      expect(deque.indexOf(20)).toBe(1)
    })

    it('should use strict equality', () => {
      const d = new DequeArray<string>()
      d.pushBack('hello')
      expect(d.indexOf('hello')).toBe(0)
      expect(d.indexOf('world')).toBe(-1)
    })
  })

  describe('includes', () => {
    it('should return false for empty deque', () => {
      expect(deque.includes(1)).toBe(false)
    })

    it('should return true for existing item', () => {
      deque.pushBack(10)
      deque.pushBack(20)
      expect(deque.includes(20)).toBe(true)
    })

    it('should return false for missing item', () => {
      deque.pushBack(10)
      expect(deque.includes(99)).toBe(false)
    })

    it('should find items after pushFront', () => {
      deque.pushBack(2)
      deque.pushFront(1)
      expect(deque.includes(1)).toBe(true)
      expect(deque.includes(2)).toBe(true)
    })
  })

  describe('size', () => {
    it('should return 0 for empty deque', () => {
      expect(deque.size()).toBe(0)
    })

    it('should return correct size after pushBack', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.size()).toBe(2)
    })

    it('should return correct size after pushFront', () => {
      deque.pushFront(1)
      deque.pushFront(2)
      expect(deque.size()).toBe(2)
    })

    it('should return correct size after popFront', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.popFront()
      expect(deque.size()).toBe(1)
    })

    it('should return correct size after popBack', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.popBack()
      expect(deque.size()).toBe(1)
    })

    it('should return 0 after clear', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.clear()
      expect(deque.size()).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new deque', () => {
      expect(deque.isEmpty()).toBe(true)
    })

    it('should return false after push', () => {
      deque.pushBack(1)
      expect(deque.isEmpty()).toBe(false)
    })

    it('should return true after removing all items', () => {
      deque.pushBack(1)
      deque.popFront()
      expect(deque.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      deque.pushBack(1)
      deque.clear()
      expect(deque.isEmpty()).toBe(true)
    })
  })

  describe('isFull', () => {
    it('should return false for empty deque', () => {
      expect(deque.isFull()).toBe(false)
    })

    it('should return false when partially filled', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.isFull()).toBe(false)
    })

    it('should return true when at capacity', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      expect(deque.isFull()).toBe(true)
    })

    it('should return false after grow', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      deque.pushBack(5)
      expect(deque.isFull()).toBe(false)
    })
  })

  describe('clear', () => {
    it('should remove all items', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.clear()
      expect(deque.size()).toBe(0)
      expect(deque.isEmpty()).toBe(true)
    })

    it('should allow push after clear', () => {
      deque.pushBack(1)
      deque.clear()
      deque.pushBack(2)
      expect(deque.size()).toBe(1)
      expect(deque.peekFront()).toBe(2)
    })

    it('should handle clearing empty deque', () => {
      deque.clear()
      expect(deque.size()).toBe(0)
    })

    it('should not change capacity', () => {
      const cap = deque.capacity()
      deque.pushBack(1)
      deque.clear()
      expect(deque.capacity()).toBe(cap)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty deque', () => {
      expect(deque.toArray()).toEqual([])
    })

    it('should return items in order', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.toArray()).toEqual([1, 2, 3])
    })

    it('should not modify the deque', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.toArray()
      expect(deque.size()).toBe(2)
    })

    it('should handle items pushed from front', () => {
      deque.pushFront(3)
      deque.pushFront(2)
      deque.pushFront(1)
      expect(deque.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty deque', () => {
      const items: number[] = []
      deque.forEach((item) => items.push(item))
      expect(items).toEqual([])
    })

    it('should iterate all items in order', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      const items: number[] = []
      deque.forEach((item) => items.push(item))
      expect(items).toEqual([1, 2, 3])
    })

    it('should provide correct indices', () => {
      deque.pushBack(10)
      deque.pushBack(20)
      deque.pushBack(30)
      const indices: number[] = []
      deque.forEach((_item, index) => indices.push(index))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should handle single item', () => {
      deque.pushBack(42)
      let count = 0
      deque.forEach((item) => {
        expect(item).toBe(42)
        count++
      })
      expect(count).toBe(1)
    })
  })

  describe('map', () => {
    it('should return empty deque for empty input', () => {
      const result = deque.map((item) => item * 2)
      expect(result.size()).toBe(0)
    })

    it('should transform all items', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      const result = deque.map((item) => item * 2)
      expect(result.toArray()).toEqual([2, 4, 6])
    })

    it('should return a DequeArray instance', () => {
      deque.pushBack(1)
      const result = deque.map((item) => item.toString())
      expect(result).toBeInstanceOf(DequeArray)
    })

    it('should not modify the original deque', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.map((item) => item * 2)
      expect(deque.toArray()).toEqual([1, 2])
    })

    it('should provide correct indices', () => {
      deque.pushBack(10)
      deque.pushBack(20)
      const indices: number[] = []
      deque.map((_item, index) => {
        indices.push(index)
        return 0
      })
      expect(indices).toEqual([0, 1])
    })

    it('should support type transformation', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      const result = deque.map((item) => `item-${item}`)
      expect(result.toArray()).toEqual(['item-1', 'item-2'])
    })
  })

  describe('filter', () => {
    it('should return empty deque when all items filtered out', () => {
      deque.pushBack(1)
      deque.pushBack(3)
      deque.pushBack(5)
      const result = deque.filter((item) => item % 2 === 0)
      expect(result.size()).toBe(0)
    })

    it('should filter items based on predicate', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      const result = deque.filter((item) => item % 2 === 0)
      expect(result.toArray()).toEqual([2, 4])
    })

    it('should return a DequeArray instance', () => {
      deque.pushBack(1)
      const result = deque.filter(() => true)
      expect(result).toBeInstanceOf(DequeArray)
    })

    it('should not modify the original deque', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.filter((item) => item > 1)
      expect(deque.toArray()).toEqual([1, 2])
    })

    it('should provide correct indices', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      const indices: number[] = []
      deque.filter((_item, index) => {
        indices.push(index)
        return true
      })
      expect(indices).toEqual([0, 1, 2])
    })

    it('should keep all items when all match', () => {
      deque.pushBack(2)
      deque.pushBack(4)
      deque.pushBack(6)
      const result = deque.filter((item) => item % 2 === 0)
      expect(result.toArray()).toEqual([2, 4, 6])
    })
  })

  describe('reverse', () => {
    it('should handle empty deque', () => {
      deque.reverse()
      expect(deque.toArray()).toEqual([])
    })

    it('should handle single item', () => {
      deque.pushBack(1)
      deque.reverse()
      expect(deque.toArray()).toEqual([1])
    })

    it('should reverse two items', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.reverse()
      expect(deque.toArray()).toEqual([2, 1])
    })

    it('should reverse multiple items', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      deque.reverse()
      expect(deque.toArray()).toEqual([4, 3, 2, 1])
    })

    it('should reverse odd number of items', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.reverse()
      expect(deque.toArray()).toEqual([3, 2, 1])
    })

    it('should reverse in place', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.reverse()
      expect(deque.size()).toBe(3)
    })

    it('should handle double reverse returning to original', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.reverse()
      deque.reverse()
      expect(deque.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('slice', () => {
    it('should return empty array for empty deque', () => {
      expect(deque.slice()).toEqual([])
    })

    it('should return all items with no arguments', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.slice()).toEqual([1, 2, 3])
    })

    it('should slice from start index', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.slice(1)).toEqual([2, 3])
    })

    it('should slice with start and end', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      expect(deque.slice(1, 3)).toEqual([2, 3])
    })

    it('should handle negative start', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.slice(-2)).toEqual([2, 3])
    })

    it('should handle negative end', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      expect(deque.slice(0, -1)).toEqual([1, 2, 3])
    })

    it('should handle both negative start and end', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      expect(deque.slice(-3, -1)).toEqual([2, 3])
    })

    it('should return empty for start >= end', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.slice(2, 1)).toEqual([])
    })

    it('should clamp start to 0 for large negative', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.slice(-10)).toEqual([1, 2])
    })

    it('should not modify the deque', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.slice(0, 1)
      expect(deque.size()).toBe(2)
    })
  })

  describe('concat', () => {
    it('should concat two non-empty deques', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      const other = new DequeArray<number>()
      other.pushBack(3)
      other.pushBack(4)
      const result = deque.concat(other)
      expect(result.toArray()).toEqual([1, 2, 3, 4])
    })

    it('should concat with empty deque', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      const other = new DequeArray<number>()
      const result = deque.concat(other)
      expect(result.toArray()).toEqual([1, 2])
    })

    it('should concat empty deque with non-empty', () => {
      const other = new DequeArray<number>()
      other.pushBack(3)
      other.pushBack(4)
      const result = deque.concat(other)
      expect(result.toArray()).toEqual([3, 4])
    })

    it('should return a new DequeArray', () => {
      deque.pushBack(1)
      const other = new DequeArray<number>()
      other.pushBack(2)
      const result = deque.concat(other)
      expect(result).not.toBe(deque)
      expect(result).not.toBe(other)
    })

    it('should not modify the original deques', () => {
      deque.pushBack(1)
      const other = new DequeArray<number>()
      other.pushBack(2)
      deque.concat(other)
      expect(deque.toArray()).toEqual([1])
      expect(other.toArray()).toEqual([2])
    })

    it('should concat two empty deques', () => {
      const other = new DequeArray<number>()
      const result = deque.concat(other)
      expect(result.size()).toBe(0)
    })
  })

  describe('clone', () => {
    it('should clone an empty deque', () => {
      const cloned = deque.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should clone all items', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      const cloned = deque.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3])
    })

    it('should return a new instance', () => {
      deque.pushBack(1)
      const cloned = deque.clone()
      expect(cloned).not.toBe(deque)
    })

    it('should not modify original when modifying clone', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      const cloned = deque.clone()
      cloned.pushBack(3)
      expect(deque.size()).toBe(2)
      expect(cloned.size()).toBe(3)
    })

    it('should preserve capacity', () => {
      deque.pushBack(1)
      const cloned = deque.clone()
      expect(cloned.capacity()).toBe(deque.capacity())
    })
  })

  describe('capacity', () => {
    it('should return the current capacity', () => {
      expect(deque.capacity()).toBe(4)
    })

    it('should increase after growth', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      deque.pushBack(5)
      expect(deque.capacity()).toBe(8)
    })

    it('should not change after clear', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      deque.pushBack(5)
      deque.clear()
      expect(deque.capacity()).toBe(8)
    })
  })

  describe('drain', () => {
    it('should return all items from empty deque', () => {
      expect(deque.drain()).toEqual([])
    })

    it('should return all items and clear the deque', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      const items = deque.drain()
      expect(items).toEqual([1, 2, 3])
      expect(deque.isEmpty()).toBe(true)
      expect(deque.size()).toBe(0)
    })

    it('should allow pushing after drain', () => {
      deque.pushBack(1)
      deque.drain()
      deque.pushBack(2)
      expect(deque.peekFront()).toBe(2)
    })
  })

  describe('Symbol.iterator', () => {
    it('should iterate over empty deque', () => {
      const items: number[] = []
      for (const item of deque) {
        items.push(item)
      }
      expect(items).toEqual([])
    })

    it('should iterate over all items in order', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      const items: number[] = []
      for (const item of deque) {
        items.push(item)
      }
      expect(items).toEqual([1, 2, 3])
    })

    it('should work with spread operator', () => {
      deque.pushBack(10)
      deque.pushBack(20)
      expect([...deque]).toEqual([10, 20])
    })

    it('should work with Array.from', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      expect(Array.from(deque)).toEqual([1, 2])
    })
  })

  describe('static fromArray', () => {
    it('should create a deque from an empty array', () => {
      const d = DequeArray.fromArray([])
      expect(d.size()).toBe(0)
      expect(d.isEmpty()).toBe(true)
    })

    it('should create a deque from an array', () => {
      const d = DequeArray.fromArray([1, 2, 3])
      expect(d.toArray()).toEqual([1, 2, 3])
    })

    it('should create a deque with sufficient capacity', () => {
      const d = DequeArray.fromArray([1, 2, 3, 4, 5])
      expect(d.capacity()).toBeGreaterThanOrEqual(5)
    })

    it('should preserve item order', () => {
      const d = DequeArray.fromArray([10, 20, 30])
      expect(d.get(0)).toBe(10)
      expect(d.get(1)).toBe(20)
      expect(d.get(2)).toBe(30)
    })

    it('should work with string arrays', () => {
      const d = DequeArray.fromArray(['a', 'b', 'c'])
      expect(d.toArray()).toEqual(['a', 'b', 'c'])
    })
  })

  describe('dynamic resizing', () => {
    it('should grow by factor of 2', () => {
      const d = new DequeArray<number>(4)
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      d.pushBack(4)
      expect(d.capacity()).toBe(4)
      d.pushBack(5)
      expect(d.capacity()).toBe(8)
    })

    it('should preserve items after growth', () => {
      const d = new DequeArray<number>(2)
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      d.pushBack(4)
      d.pushBack(5)
      expect(d.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle growth from pushFront', () => {
      const d = new DequeArray<number>(2)
      d.pushFront(1)
      d.pushFront(2)
      d.pushFront(3)
      expect(d.toArray()).toEqual([3, 2, 1])
    })

    it('should handle growth after mixed operations', () => {
      const d = new DequeArray<number>(2)
      d.pushBack(1)
      d.pushBack(2)
      d.popFront()
      d.pushBack(3)
      d.pushBack(4)
      expect(d.toArray()).toEqual([2, 3, 4])
    })

    it('should handle multiple growths', () => {
      const d = new DequeArray<number>(2)
      for (let i = 0; i < 20; i++) {
        d.pushBack(i)
      }
      expect(d.size()).toBe(20)
      expect(d.toArray()).toEqual(Array.from({ length: 20 }, (_, i) => i))
    })
  })

  describe('circular buffer wraparound', () => {
    it('should handle head wrapping around', () => {
      deque.pushFront(1)
      deque.pushFront(2)
      deque.pushFront(3)
      deque.pushFront(4)
      expect(deque.toArray()).toEqual([4, 3, 2, 1])
    })

    it('should handle tail wrapping around', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      deque.popFront()
      deque.pushBack(5)
      expect(deque.toArray()).toEqual([2, 3, 4, 5])
    })

    it('should handle multiple wraparound cycles', () => {
      const d = new DequeArray<number>(3)
      for (let cycle = 0; cycle < 5; cycle++) {
        d.pushBack(cycle * 2)
        d.pushBack(cycle * 2 + 1)
        d.popFront()
        d.popFront()
      }
      expect(d.size()).toBe(0)
    })

    it('should handle alternating push and pop from both ends', () => {
      const d = new DequeArray<number>(4)
      d.pushBack(1)
      d.pushFront(0)
      d.popBack()
      d.pushBack(2)
      d.popFront()
      d.pushFront(3)
      expect(d.toArray()).toEqual([3, 2])
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_DEQUE_CAPACITY', () => {
      expect(DEFAULT_DEQUE_CAPACITY).toBe(16)
    })

    it('should support DequeArrayOptions type', () => {
      const opts: DequeArrayOptions = { initialCapacity: 10 }
      expect(opts.initialCapacity).toBe(10)
    })

    it('should support different generic types', () => {
      const numDeque = new DequeArray<number>()
      numDeque.pushBack(42)
      expect(numDeque.popFront()).toBe(42)

      const strDeque = new DequeArray<string>()
      strDeque.pushBack('hello')
      expect(strDeque.popFront()).toBe('hello')
    })
  })

  describe('edge cases', () => {
    it('should handle capacity of 1', () => {
      const d = new DequeArray<number>(1)
      d.pushBack(1)
      expect(d.isFull()).toBe(true)
      d.pushBack(2)
      expect(d.size()).toBe(2)
      expect(d.capacity()).toBe(2)
    })

    it('should handle pushFront on capacity 1', () => {
      const d = new DequeArray<number>(1)
      d.pushFront(1)
      d.pushFront(2)
      expect(d.toArray()).toEqual([2, 1])
    })

    it('should handle null values', () => {
      const d = new DequeArray<number | null>()
      d.pushBack(null)
      d.pushBack(1)
      expect(d.get(0)).toBeNull()
      expect(d.get(1)).toBe(1)
    })

    it('should handle undefined values', () => {
      const d = new DequeArray<number | undefined>()
      d.pushBack(undefined)
      d.pushBack(1)
      expect(d.get(0)).toBeUndefined()
      expect(d.size()).toBe(2)
    })

    it('should handle object values', () => {
      const d = new DequeArray<{ id: number }>()
      d.pushBack({ id: 1 })
      d.pushBack({ id: 2 })
      expect(d.popFront()?.id).toBe(1)
      expect(d.popFront()?.id).toBe(2)
    })

    it('should handle large number of operations', () => {
      const d = new DequeArray<number>(4)
      for (let i = 0; i < 1000; i++) {
        d.pushBack(i)
      }
      expect(d.size()).toBe(1000)
      for (let i = 0; i < 500; i++) {
        expect(d.popFront()).toBe(i)
      }
      expect(d.size()).toBe(500)
    })

    it('should handle popFront on empty deque multiple times', () => {
      expect(deque.popFront()).toBeUndefined()
      expect(deque.popFront()).toBeUndefined()
      expect(deque.popFront()).toBeUndefined()
    })

    it('should handle popBack on empty deque multiple times', () => {
      expect(deque.popBack()).toBeUndefined()
      expect(deque.popBack()).toBeUndefined()
      expect(deque.popBack()).toBeUndefined()
    })

    it('should handle peekFront on empty deque multiple times', () => {
      expect(deque.peekFront()).toBeUndefined()
      expect(deque.peekFront()).toBeUndefined()
    })

    it('should handle peekBack on empty deque multiple times', () => {
      expect(deque.peekBack()).toBeUndefined()
      expect(deque.peekBack()).toBeUndefined()
    })

    it('should handle string values', () => {
      const d = new DequeArray<string>()
      d.pushBack('hello')
      d.pushBack('world')
      expect(d.popFront()).toBe('hello')
      expect(d.popFront()).toBe('world')
    })

    it('should handle boolean values', () => {
      const d = new DequeArray<boolean>()
      d.pushBack(true)
      d.pushBack(false)
      expect(d.toArray()).toEqual([true, false])
    })

    it('should handle set at index 0 of single item deque', () => {
      deque.pushBack(1)
      deque.set(0, 99)
      expect(deque.get(0)).toBe(99)
    })

    it('should handle removeAt on single item deque', () => {
      deque.pushBack(1)
      expect(deque.removeAt(0)).toBe(1)
      expect(deque.isEmpty()).toBe(true)
    })

    it('should handle insert at end of deque via pushBack then insert', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.insert(2, 3)
      expect(deque.toArray()).toEqual([1, 2, 3])
    })

    it('should handle indexOf with reference types', () => {
      const obj = { id: 1 }
      const d = new DequeArray<{ id: number }>()
      d.pushBack(obj)
      expect(d.indexOf(obj)).toBe(0)
    })

    it('should handle includes with reference types', () => {
      const obj = { id: 1 }
      const d = new DequeArray<{ id: number }>()
      d.pushBack(obj)
      expect(d.includes(obj)).toBe(true)
      expect(d.includes({ id: 1 })).toBe(false)
    })

    it('should handle reverse on deque that has wrapped', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.popFront()
      deque.pushBack(3)
      deque.pushBack(4)
      deque.pushBack(5)
      deque.reverse()
      expect(deque.toArray()).toEqual([5, 4, 3, 2])
    })

    it('should handle slice on wrapped deque', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.popFront()
      deque.pushBack(3)
      deque.pushBack(4)
      deque.pushBack(5)
      expect(deque.slice(1, 3)).toEqual([3, 4])
    })

    it('should handle forEach on wrapped deque', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.popFront()
      deque.pushBack(3)
      deque.pushBack(4)
      deque.pushBack(5)
      const items: number[] = []
      deque.forEach((item) => items.push(item))
      expect(items).toEqual([2, 3, 4, 5])
    })

    it('should handle get on wrapped deque', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.popFront()
      deque.pushBack(3)
      deque.pushBack(4)
      expect(deque.get(0)).toBe(2)
      expect(deque.get(2)).toBe(4)
    })

    it('should handle drain clearing state correctly', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.drain()
      deque.pushBack(3)
      expect(deque.peekFront()).toBe(3)
      expect(deque.peekBack()).toBe(3)
    })

    it('should handle map on deque producing different type', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      const result = deque.map((item) => ({ value: item }))
      expect(result.toArray()).toEqual([{ value: 1 }, { value: 2 }])
    })

    it('should handle clone of deque with wrapped buffer', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.popFront()
      deque.pushBack(3)
      deque.pushBack(4)
      deque.pushBack(5)
      const cloned = deque.clone()
      expect(cloned.toArray()).toEqual([2, 3, 4, 5])
    })

    it('should handle concat with wrapped deque', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.popFront()
      deque.pushBack(3)
      const other = new DequeArray<number>()
      other.pushBack(4)
      other.pushBack(5)
      const result = deque.concat(other)
      expect(result.toArray()).toEqual([2, 3, 4, 5])
    })

    it('should handle filter returning empty from wrapped deque', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.popFront()
      deque.pushBack(3)
      const result = deque.filter(() => false)
      expect(result.size()).toBe(0)
    })

    it('should handle fromArray with single item', () => {
      const d = DequeArray.fromArray([42])
      expect(d.size()).toBe(1)
      expect(d.peekFront()).toBe(42)
      expect(d.peekBack()).toBe(42)
    })

    it('should handle fromArray with large array', () => {
      const arr = Array.from({ length: 100 }, (_, i) => i)
      const d = DequeArray.fromArray(arr)
      expect(d.size()).toBe(100)
      expect(d.toArray()).toEqual(arr)
    })

    it('should handle insert at index 0 of empty deque', () => {
      deque.insert(0, 1)
      expect(deque.toArray()).toEqual([1])
    })

    it('should handle insert growing the buffer', () => {
      const d = new DequeArray<number>(2)
      d.pushBack(1)
      d.pushBack(2)
      d.insert(1, 99)
      expect(d.toArray()).toEqual([1, 99, 2])
      expect(d.capacity()).toBe(4)
    })

    it('should handle removeAt on wrapped buffer middle', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      deque.popFront()
      deque.pushBack(5)
      expect(deque.removeAt(2)).toBe(4)
      expect(deque.toArray()).toEqual([2, 3, 5])
    })
  })
})
