import { describe, it, expect, beforeEach } from 'vitest'
import { MinMaxDeque } from '../../src/core/min-max-deque/index.js'
import type { MinMaxDequeOptions } from '../../src/core/min-max-deque/index.js'

describe('MinMaxDeque', () => {
  let deque: MinMaxDeque<number>

  beforeEach(() => {
    deque = new MinMaxDeque<number>()
  })

  describe('constructor', () => {
    it('should create an empty deque with no options', () => {
      const d = new MinMaxDeque<number>()
      expect(d.size()).toBe(0)
      expect(d.isEmpty()).toBe(true)
    })

    it('should create a deque with empty options', () => {
      const d = new MinMaxDeque<number>({})
      expect(d.size()).toBe(0)
      expect(d.isEmpty()).toBe(true)
    })

    it('should accept a custom comparator', () => {
      const d = new MinMaxDeque<number>({
        comparator: (a, b) => b - a,
      })
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      expect(d.min()).toBe(3)
      expect(d.max()).toBe(1)
    })

    it('should accept a string comparator', () => {
      const d = new MinMaxDeque<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      d.pushBack('cherry')
      d.pushBack('apple')
      d.pushBack('banana')
      expect(d.min()).toBe('apple')
      expect(d.max()).toBe('cherry')
    })

    it('should work with default comparator for numbers', () => {
      const d = new MinMaxDeque<number>()
      d.pushBack(5)
      d.pushBack(3)
      d.pushBack(7)
      expect(d.min()).toBe(3)
      expect(d.max()).toBe(7)
    })
  })

  describe('pushFront', () => {
    it('should add an element to the front of an empty deque', () => {
      deque.pushFront(1)
      expect(deque.size()).toBe(1)
      expect(deque.peekFront()).toBe(1)
      expect(deque.peekBack()).toBe(1)
    })

    it('should add elements to the front maintaining order', () => {
      deque.pushFront(1)
      deque.pushFront(2)
      deque.pushFront(3)
      expect(deque.toArray()).toEqual([3, 2, 1])
      expect(deque.peekFront()).toBe(3)
      expect(deque.peekBack()).toBe(1)
    })

    it('should update min correctly after pushFront', () => {
      deque.pushFront(5)
      expect(deque.min()).toBe(5)
      deque.pushFront(3)
      expect(deque.min()).toBe(3)
      deque.pushFront(7)
      expect(deque.min()).toBe(3)
    })

    it('should update max correctly after pushFront', () => {
      deque.pushFront(5)
      expect(deque.max()).toBe(5)
      deque.pushFront(3)
      expect(deque.max()).toBe(5)
      deque.pushFront(7)
      expect(deque.max()).toBe(7)
    })

    it('should handle pushFront with negative numbers', () => {
      deque.pushFront(-5)
      deque.pushFront(-10)
      deque.pushFront(-3)
      expect(deque.min()).toBe(-10)
      expect(deque.max()).toBe(-3)
      expect(deque.toArray()).toEqual([-3, -10, -5])
    })

    it('should handle pushFront with zero', () => {
      deque.pushFront(0)
      deque.pushFront(5)
      deque.pushFront(-3)
      expect(deque.min()).toBe(-3)
      expect(deque.max()).toBe(5)
    })

    it('should handle pushFront with duplicate values', () => {
      deque.pushFront(5)
      deque.pushFront(5)
      deque.pushFront(5)
      expect(deque.size()).toBe(3)
      expect(deque.min()).toBe(5)
      expect(deque.max()).toBe(5)
    })
  })

  describe('pushBack', () => {
    it('should add an element to the back of an empty deque', () => {
      deque.pushBack(1)
      expect(deque.size()).toBe(1)
      expect(deque.peekFront()).toBe(1)
      expect(deque.peekBack()).toBe(1)
    })

    it('should add elements to the back maintaining order', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.toArray()).toEqual([1, 2, 3])
      expect(deque.peekFront()).toBe(1)
      expect(deque.peekBack()).toBe(3)
    })

    it('should update min correctly after pushBack', () => {
      deque.pushBack(5)
      expect(deque.min()).toBe(5)
      deque.pushBack(3)
      expect(deque.min()).toBe(3)
      deque.pushBack(7)
      expect(deque.min()).toBe(3)
    })

    it('should update max correctly after pushBack', () => {
      deque.pushBack(5)
      expect(deque.max()).toBe(5)
      deque.pushBack(3)
      expect(deque.max()).toBe(5)
      deque.pushBack(7)
      expect(deque.max()).toBe(7)
    })

    it('should handle pushBack with negative numbers', () => {
      deque.pushBack(-5)
      deque.pushBack(-10)
      deque.pushBack(-3)
      expect(deque.min()).toBe(-10)
      expect(deque.max()).toBe(-3)
    })

    it('should handle pushBack with duplicate values', () => {
      deque.pushBack(3)
      deque.pushBack(3)
      deque.pushBack(3)
      expect(deque.size()).toBe(3)
      expect(deque.min()).toBe(3)
      expect(deque.max()).toBe(3)
    })
  })

  describe('popFront', () => {
    it('should throw on empty deque', () => {
      expect(() => deque.popFront()).toThrow('MinMaxDeque is empty')
    })

    it('should remove and return the front element', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.popFront()).toBe(1)
      expect(deque.toArray()).toEqual([2, 3])
    })

    it('should update min after popFront', () => {
      deque.pushBack(1)
      deque.pushBack(5)
      deque.pushBack(3)
      expect(deque.min()).toBe(1)
      deque.popFront()
      expect(deque.min()).toBe(3)
    })

    it('should update max after popFront', () => {
      deque.pushBack(5)
      deque.pushBack(3)
      deque.pushBack(7)
      expect(deque.max()).toBe(7)
      deque.popFront()
      expect(deque.max()).toBe(7)
      deque.popFront()
      expect(deque.max()).toBe(7)
      deque.popFront()
      expect(deque.isEmpty()).toBe(true)
    })

    it('should handle popping all elements', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.popFront()).toBe(1)
      expect(deque.popFront()).toBe(2)
      expect(deque.isEmpty()).toBe(true)
      expect(() => deque.popFront()).toThrow('MinMaxDeque is empty')
    })

    it('should handle popFront after pushFront', () => {
      deque.pushFront(1)
      deque.pushFront(2)
      expect(deque.popFront()).toBe(2)
      expect(deque.popFront()).toBe(1)
    })

    it('should correctly track min/max through multiple popFront operations', () => {
      deque.pushBack(3)
      deque.pushBack(1)
      deque.pushBack(4)
      deque.pushBack(1)
      deque.pushBack(5)
      expect(deque.min()).toBe(1)
      expect(deque.max()).toBe(5)
      deque.popFront()
      expect(deque.min()).toBe(1)
      expect(deque.max()).toBe(5)
      deque.popFront()
      expect(deque.min()).toBe(1)
      expect(deque.max()).toBe(5)
      deque.popFront()
      expect(deque.min()).toBe(1)
      expect(deque.max()).toBe(5)
      deque.popFront()
      expect(deque.min()).toBe(5)
      expect(deque.max()).toBe(5)
    })
  })

  describe('popBack', () => {
    it('should throw on empty deque', () => {
      expect(() => deque.popBack()).toThrow('MinMaxDeque is empty')
    })

    it('should remove and return the back element', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.popBack()).toBe(3)
      expect(deque.toArray()).toEqual([1, 2])
    })

    it('should update min after popBack', () => {
      deque.pushBack(5)
      deque.pushBack(1)
      deque.pushBack(3)
      expect(deque.min()).toBe(1)
      deque.popBack()
      expect(deque.min()).toBe(1)
    })

    it('should update max after popBack', () => {
      deque.pushBack(3)
      deque.pushBack(5)
      deque.pushBack(1)
      expect(deque.max()).toBe(5)
      deque.popBack()
      expect(deque.max()).toBe(5)
      deque.popBack()
      expect(deque.max()).toBe(3)
    })

    it('should handle popping all elements from back', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.popBack()).toBe(2)
      expect(deque.popBack()).toBe(1)
      expect(deque.isEmpty()).toBe(true)
    })

    it('should handle popBack after pushFront', () => {
      deque.pushFront(3)
      deque.pushFront(2)
      deque.pushFront(1)
      expect(deque.popBack()).toBe(3)
      expect(deque.popBack()).toBe(2)
      expect(deque.popBack()).toBe(1)
    })

    it('should correctly track min/max through multiple popBack operations', () => {
      deque.pushBack(5)
      deque.pushBack(3)
      deque.pushBack(1)
      deque.pushBack(4)
      expect(deque.min()).toBe(1)
      expect(deque.max()).toBe(5)
      deque.popBack()
      expect(deque.min()).toBe(1)
      expect(deque.max()).toBe(5)
      deque.popBack()
      expect(deque.min()).toBe(3)
      expect(deque.max()).toBe(5)
      deque.popBack()
      expect(deque.min()).toBe(5)
      expect(deque.max()).toBe(5)
    })
  })

  describe('peekFront', () => {
    it('should throw on empty deque', () => {
      expect(() => deque.peekFront()).toThrow('MinMaxDeque is empty')
    })

    it('should return the front element without removing it', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.peekFront()).toBe(1)
      expect(deque.size()).toBe(2)
    })

    it('should return the same element after pushFront', () => {
      deque.pushBack(1)
      deque.pushFront(2)
      expect(deque.peekFront()).toBe(2)
    })

    it('should reflect changes after popFront', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.popFront()
      expect(deque.peekFront()).toBe(2)
    })
  })

  describe('peekBack', () => {
    it('should throw on empty deque', () => {
      expect(() => deque.peekBack()).toThrow('MinMaxDeque is empty')
    })

    it('should return the back element without removing it', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.peekBack()).toBe(2)
      expect(deque.size()).toBe(2)
    })

    it('should return the same element after pushBack', () => {
      deque.pushFront(1)
      deque.pushBack(2)
      expect(deque.peekBack()).toBe(2)
    })

    it('should reflect changes after popBack', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.popBack()
      expect(deque.peekBack()).toBe(2)
    })
  })

  describe('min', () => {
    it('should throw on empty deque', () => {
      expect(() => deque.min()).toThrow('MinMaxDeque is empty')
    })

    it('should return the single element when deque has one element', () => {
      deque.pushBack(42)
      expect(deque.min()).toBe(42)
    })

    it('should track min through pushBack operations', () => {
      deque.pushBack(5)
      deque.pushBack(3)
      deque.pushBack(7)
      deque.pushBack(1)
      deque.pushBack(9)
      expect(deque.min()).toBe(1)
    })

    it('should track min through pushFront operations', () => {
      deque.pushFront(5)
      deque.pushFront(3)
      deque.pushFront(7)
      deque.pushFront(1)
      deque.pushFront(9)
      expect(deque.min()).toBe(1)
    })

    it('should update min when the current min is removed from front', () => {
      deque.pushBack(1)
      deque.pushBack(5)
      deque.pushBack(3)
      deque.popFront()
      expect(deque.min()).toBe(3)
    })

    it('should update min when the current min is removed from back', () => {
      deque.pushBack(5)
      deque.pushBack(3)
      deque.pushBack(1)
      deque.popBack()
      expect(deque.min()).toBe(3)
    })

    it('should handle all same values', () => {
      deque.pushBack(5)
      deque.pushBack(5)
      deque.pushBack(5)
      expect(deque.min()).toBe(5)
      deque.popFront()
      expect(deque.min()).toBe(5)
    })

    it('should handle min with floating point numbers', () => {
      deque.pushBack(1.5)
      deque.pushBack(0.3)
      deque.pushBack(2.7)
      expect(deque.min()).toBe(0.3)
    })
  })

  describe('max', () => {
    it('should throw on empty deque', () => {
      expect(() => deque.max()).toThrow('MinMaxDeque is empty')
    })

    it('should return the single element when deque has one element', () => {
      deque.pushBack(42)
      expect(deque.max()).toBe(42)
    })

    it('should track max through pushBack operations', () => {
      deque.pushBack(5)
      deque.pushBack(3)
      deque.pushBack(7)
      deque.pushBack(1)
      deque.pushBack(9)
      expect(deque.max()).toBe(9)
    })

    it('should track max through pushFront operations', () => {
      deque.pushFront(5)
      deque.pushFront(3)
      deque.pushFront(7)
      deque.pushFront(1)
      deque.pushFront(9)
      expect(deque.max()).toBe(9)
    })

    it('should update max when the current max is removed from front', () => {
      deque.pushBack(9)
      deque.pushBack(5)
      deque.pushBack(3)
      deque.popFront()
      expect(deque.max()).toBe(5)
    })

    it('should update max when the current max is removed from back', () => {
      deque.pushBack(3)
      deque.pushBack(5)
      deque.pushBack(9)
      deque.popBack()
      expect(deque.max()).toBe(5)
    })

    it('should handle all same values', () => {
      deque.pushBack(5)
      deque.pushBack(5)
      deque.pushBack(5)
      expect(deque.max()).toBe(5)
      deque.popBack()
      expect(deque.max()).toBe(5)
    })
  })

  describe('size', () => {
    it('should return 0 for empty deque', () => {
      expect(deque.size()).toBe(0)
    })

    it('should increase with pushFront', () => {
      deque.pushFront(1)
      expect(deque.size()).toBe(1)
      deque.pushFront(2)
      expect(deque.size()).toBe(2)
    })

    it('should increase with pushBack', () => {
      deque.pushBack(1)
      expect(deque.size()).toBe(1)
      deque.pushBack(2)
      expect(deque.size()).toBe(2)
    })

    it('should decrease with popFront', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.popFront()
      expect(deque.size()).toBe(1)
    })

    it('should decrease with popBack', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.popBack()
      expect(deque.size()).toBe(1)
    })

    it('should be 0 after clearing all elements', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.popFront()
      deque.popFront()
      deque.popFront()
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

    it('should return true after removing all elements', () => {
      deque.pushBack(1)
      deque.popFront()
      expect(deque.isEmpty()).toBe(true)
    })

    it('should toggle correctly with operations', () => {
      expect(deque.isEmpty()).toBe(true)
      deque.pushBack(1)
      expect(deque.isEmpty()).toBe(false)
      deque.popBack()
      expect(deque.isEmpty()).toBe(true)
      deque.pushFront(1)
      expect(deque.isEmpty()).toBe(false)
      deque.popFront()
      expect(deque.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear an empty deque without error', () => {
      deque.clear()
      expect(deque.isEmpty()).toBe(true)
      expect(deque.size()).toBe(0)
    })

    it('should clear a deque with elements', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.clear()
      expect(deque.isEmpty()).toBe(true)
      expect(deque.size()).toBe(0)
    })

    it('should allow operations after clear', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.clear()
      deque.pushBack(3)
      expect(deque.size()).toBe(1)
      expect(deque.peekFront()).toBe(3)
      expect(deque.min()).toBe(3)
      expect(deque.max()).toBe(3)
    })

    it('should throw on min/max after clear', () => {
      deque.pushBack(1)
      deque.clear()
      expect(() => deque.min()).toThrow('MinMaxDeque is empty')
      expect(() => deque.max()).toThrow('MinMaxDeque is empty')
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty deque', () => {
      expect(deque.toArray()).toEqual([])
    })

    it('should return elements in correct order after pushBack', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.toArray()).toEqual([1, 2, 3])
    })

    it('should return elements in correct order after pushFront', () => {
      deque.pushFront(1)
      deque.pushFront(2)
      deque.pushFront(3)
      expect(deque.toArray()).toEqual([3, 2, 1])
    })

    it('should return elements after mixed push operations', () => {
      deque.pushBack(2)
      deque.pushFront(1)
      deque.pushBack(3)
      expect(deque.toArray()).toEqual([1, 2, 3])
    })

    it('should reflect changes after pop operations', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      deque.popFront()
      deque.popBack()
      expect(deque.toArray()).toEqual([2, 3])
    })

    it('should not modify the deque', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      const arr = deque.toArray()
      expect(arr).toEqual([1, 2])
      expect(deque.size()).toBe(2)
      arr.push(999)
      expect(deque.size()).toBe(2)
    })
  })

  describe('clone', () => {
    it('should clone an empty deque', () => {
      const cloned = deque.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should clone a deque with elements', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      const cloned = deque.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3])
      expect(cloned.size()).toBe(3)
    })

    it('should produce an independent copy', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      const cloned = deque.clone()
      cloned.popFront()
      expect(deque.size()).toBe(2)
      expect(cloned.size()).toBe(1)
    })

    it('should preserve min/max in the clone', () => {
      deque.pushBack(5)
      deque.pushBack(3)
      deque.pushBack(7)
      const cloned = deque.clone()
      expect(cloned.min()).toBe(3)
      expect(cloned.max()).toBe(7)
    })

    it('should preserve the comparator', () => {
      const revDeque = new MinMaxDeque<number>({
        comparator: (a, b) => b - a,
      })
      revDeque.pushBack(1)
      revDeque.pushBack(2)
      revDeque.pushBack(3)
      const cloned = revDeque.clone()
      expect(cloned.min()).toBe(3)
      expect(cloned.max()).toBe(1)
    })

    it('should handle clone after mixed operations', () => {
      deque.pushFront(3)
      deque.pushBack(5)
      deque.pushFront(1)
      deque.popBack()
      const cloned = deque.clone()
      expect(cloned.toArray()).toEqual([1, 3])
      expect(cloned.min()).toBe(1)
      expect(cloned.max()).toBe(3)
    })
  })

  describe('forEach', () => {
    it('should not call callback on empty deque', () => {
      let count = 0
      deque.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should iterate all elements in order', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      const result: number[] = []
      deque.forEach((item) => result.push(item))
      expect(result).toEqual([1, 2, 3])
    })

    it('should provide correct indices', () => {
      deque.pushBack(10)
      deque.pushBack(20)
      deque.pushBack(30)
      const indices: number[] = []
      deque.forEach((_item, index) => indices.push(index))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should iterate in correct order after pushFront', () => {
      deque.pushFront(3)
      deque.pushFront(2)
      deque.pushFront(1)
      const result: number[] = []
      deque.forEach((item) => result.push(item))
      expect(result).toEqual([1, 2, 3])
    })

    it('should iterate in correct order after mixed operations', () => {
      deque.pushBack(2)
      deque.pushFront(1)
      deque.pushBack(3)
      const result: number[] = []
      deque.forEach((item) => result.push(item))
      expect(result).toEqual([1, 2, 3])
    })
  })

  describe('Symbol.iterator', () => {
    it('should produce no values for empty deque', () => {
      const result: number[] = []
      for (const item of deque) {
        result.push(item)
      }
      expect(result).toEqual([])
    })

    it('should iterate elements in correct order', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      const result: number[] = []
      for (const item of deque) {
        result.push(item)
      }
      expect(result).toEqual([1, 2, 3])
    })

    it('should work with spread operator', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect([...deque]).toEqual([1, 2, 3])
    })

    it('should work with Array.from', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      expect(Array.from(deque)).toEqual([1, 2])
    })

    it('should work after pushFront', () => {
      deque.pushFront(3)
      deque.pushFront(2)
      deque.pushFront(1)
      expect([...deque]).toEqual([1, 2, 3])
    })
  })

  describe('fromArray', () => {
    it('should create a deque from an empty array', () => {
      const d = MinMaxDeque.fromArray([])
      expect(d.size()).toBe(0)
      expect(d.isEmpty()).toBe(true)
    })

    it('should create a deque from a single-element array', () => {
      const d = MinMaxDeque.fromArray([42])
      expect(d.size()).toBe(1)
      expect(d.peekFront()).toBe(42)
      expect(d.peekBack()).toBe(42)
    })

    it('should create a deque from a multi-element array', () => {
      const d = MinMaxDeque.fromArray([1, 2, 3, 4, 5])
      expect(d.toArray()).toEqual([1, 2, 3, 4, 5])
      expect(d.min()).toBe(1)
      expect(d.max()).toBe(5)
    })

    it('should accept a custom comparator', () => {
      const d = MinMaxDeque.fromArray([1, 2, 3], {
        comparator: (a, b) => b - a,
      })
      expect(d.min()).toBe(3)
      expect(d.max()).toBe(1)
    })

    it('should create an independent deque', () => {
      const arr = [1, 2, 3]
      const d = MinMaxDeque.fromArray(arr)
      arr.push(4)
      expect(d.size()).toBe(3)
    })

    it('should work with string arrays', () => {
      const d = MinMaxDeque.fromArray(['banana', 'apple', 'cherry'])
      expect(d.min()).toBe('apple')
      expect(d.max()).toBe('cherry')
    })
  })

  describe('interleaved push/pop operations', () => {
    it('should handle pushBack then popFront (queue behavior)', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.popFront()).toBe(1)
      expect(deque.popFront()).toBe(2)
      expect(deque.popFront()).toBe(3)
    })

    it('should handle pushFront then popBack (queue behavior)', () => {
      deque.pushFront(1)
      deque.pushFront(2)
      deque.pushFront(3)
      expect(deque.popBack()).toBe(1)
      expect(deque.popBack()).toBe(2)
      expect(deque.popBack()).toBe(3)
    })

    it('should handle pushFront then popFront (stack behavior)', () => {
      deque.pushFront(1)
      deque.pushFront(2)
      deque.pushFront(3)
      expect(deque.popFront()).toBe(3)
      expect(deque.popFront()).toBe(2)
      expect(deque.popFront()).toBe(1)
    })

    it('should handle pushBack then popBack (stack behavior)', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.popBack()).toBe(3)
      expect(deque.popBack()).toBe(2)
      expect(deque.popBack()).toBe(1)
    })

    it('should handle alternating pushFront/pushBack with popFront', () => {
      deque.pushFront(2)
      deque.pushBack(3)
      deque.pushFront(1)
      deque.pushBack(4)
      expect(deque.toArray()).toEqual([1, 2, 3, 4])
      expect(deque.popFront()).toBe(1)
      expect(deque.popFront()).toBe(2)
      expect(deque.popFront()).toBe(3)
      expect(deque.popFront()).toBe(4)
    })

    it('should track min/max correctly through interleaved operations', () => {
      deque.pushBack(5)
      expect(deque.min()).toBe(5)
      expect(deque.max()).toBe(5)

      deque.pushFront(3)
      expect(deque.min()).toBe(3)
      expect(deque.max()).toBe(5)

      deque.pushBack(7)
      expect(deque.min()).toBe(3)
      expect(deque.max()).toBe(7)

      deque.pushFront(1)
      expect(deque.min()).toBe(1)
      expect(deque.max()).toBe(7)

      deque.popFront()
      expect(deque.min()).toBe(3)
      expect(deque.max()).toBe(7)

      deque.popBack()
      expect(deque.min()).toBe(3)
      expect(deque.max()).toBe(5)
    })

    it('should handle complex interleaved sequence', () => {
      deque.pushBack(10)
      deque.pushFront(5)
      deque.pushBack(15)
      deque.pushFront(2)
      deque.pushBack(20)
      expect(deque.toArray()).toEqual([2, 5, 10, 15, 20])
      expect(deque.min()).toBe(2)
      expect(deque.max()).toBe(20)

      expect(deque.popFront()).toBe(2)
      expect(deque.min()).toBe(5)
      expect(deque.max()).toBe(20)

      expect(deque.popBack()).toBe(20)
      expect(deque.min()).toBe(5)
      expect(deque.max()).toBe(15)

      deque.pushFront(1)
      expect(deque.min()).toBe(1)
      expect(deque.max()).toBe(15)

      deque.pushBack(25)
      expect(deque.min()).toBe(1)
      expect(deque.max()).toBe(25)
    })

    it('should handle repeated fill and drain', () => {
      for (let round = 0; round < 3; round++) {
        for (let i = 0; i < 10; i++) {
          deque.pushBack(i)
        }
        for (let i = 0; i < 10; i++) {
          expect(deque.popFront()).toBe(i)
        }
        expect(deque.isEmpty()).toBe(true)
      }
    })

    it('should handle pushFront heavy then popBack', () => {
      for (let i = 0; i < 5; i++) {
        deque.pushFront(i)
      }
      expect(deque.toArray()).toEqual([4, 3, 2, 1, 0])
      for (let i = 0; i < 5; i++) {
        expect(deque.popBack()).toBe(i)
      }
      expect(deque.isEmpty()).toBe(true)
    })
  })

  describe('custom comparator', () => {
    it('should work with reverse comparator', () => {
      const d = new MinMaxDeque<number>({
        comparator: (a, b) => b - a,
      })
      d.pushBack(1)
      d.pushBack(5)
      d.pushBack(3)
      expect(d.min()).toBe(5)
      expect(d.max()).toBe(1)
    })

    it('should work with absolute value comparator', () => {
      const d = new MinMaxDeque<number>({
        comparator: (a, b) => Math.abs(a) - Math.abs(b),
      })
      d.pushBack(-5)
      d.pushBack(3)
      d.pushBack(-1)
      d.pushBack(4)
      expect(d.min()).toBe(-1)
      expect(d.max()).toBe(-5)
    })

    it('should work with object comparator', () => {
      interface Item {
        priority: number
        name: string
      }
      const d = new MinMaxDeque<Item>({
        comparator: (a, b) => a.priority - b.priority,
      })
      d.pushBack({ priority: 3, name: 'c' })
      d.pushBack({ priority: 1, name: 'a' })
      d.pushBack({ priority: 2, name: 'b' })
      expect(d.min().name).toBe('a')
      expect(d.max().name).toBe('c')
    })

    it('should preserve comparator through fromArray', () => {
      const d = MinMaxDeque.fromArray([3, 1, 2], {
        comparator: (a, b) => b - a,
      })
      expect(d.min()).toBe(3)
      expect(d.max()).toBe(1)
    })

    it('should handle comparator with equal elements', () => {
      const d = new MinMaxDeque<number>({
        comparator: () => 0,
      })
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      expect(d.min()).toBe(3)
      expect(d.max()).toBe(3)
    })
  })

  describe('edge cases', () => {
    it('should handle single element operations', () => {
      deque.pushBack(42)
      expect(deque.peekFront()).toBe(42)
      expect(deque.peekBack()).toBe(42)
      expect(deque.min()).toBe(42)
      expect(deque.max()).toBe(42)
      expect(deque.popFront()).toBe(42)
      expect(deque.isEmpty()).toBe(true)
    })

    it('should handle single element with pushFront and popBack', () => {
      deque.pushFront(42)
      expect(deque.popBack()).toBe(42)
      expect(deque.isEmpty()).toBe(true)
    })

    it('should handle all same values', () => {
      for (let i = 0; i < 10; i++) {
        deque.pushBack(5)
      }
      expect(deque.min()).toBe(5)
      expect(deque.max()).toBe(5)
      for (let i = 0; i < 10; i++) {
        deque.popFront()
        if (!deque.isEmpty()) {
          expect(deque.min()).toBe(5)
          expect(deque.max()).toBe(5)
        }
      }
    })

    it('should handle sorted input (ascending)', () => {
      for (let i = 0; i < 10; i++) {
        deque.pushBack(i)
      }
      expect(deque.min()).toBe(0)
      expect(deque.max()).toBe(9)
      for (let i = 0; i < 10; i++) {
        expect(deque.popFront()).toBe(i)
        if (!deque.isEmpty()) {
          expect(deque.min()).toBe(i + 1)
          expect(deque.max()).toBe(9)
        }
      }
    })

    it('should handle sorted input (descending)', () => {
      for (let i = 9; i >= 0; i--) {
        deque.pushBack(i)
      }
      expect(deque.min()).toBe(0)
      expect(deque.max()).toBe(9)
    })

    it('should handle reverse sorted via pushFront', () => {
      for (let i = 0; i < 10; i++) {
        deque.pushFront(i)
      }
      expect(deque.toArray()).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1, 0])
      expect(deque.min()).toBe(0)
      expect(deque.max()).toBe(9)
    })

    it('should handle two elements', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.min()).toBe(1)
      expect(deque.max()).toBe(2)
      deque.popFront()
      expect(deque.min()).toBe(2)
      expect(deque.max()).toBe(2)
    })

    it('should handle two equal elements', () => {
      deque.pushBack(5)
      deque.pushBack(5)
      expect(deque.min()).toBe(5)
      expect(deque.max()).toBe(5)
      deque.popFront()
      expect(deque.min()).toBe(5)
      expect(deque.max()).toBe(5)
    })

    it('should handle negative numbers', () => {
      deque.pushBack(-3)
      deque.pushBack(-1)
      deque.pushBack(-7)
      deque.pushBack(-2)
      expect(deque.min()).toBe(-7)
      expect(deque.max()).toBe(-1)
    })

    it('should handle mixed positive and negative numbers', () => {
      deque.pushBack(-5)
      deque.pushBack(3)
      deque.pushBack(-1)
      deque.pushBack(7)
      deque.pushBack(0)
      expect(deque.min()).toBe(-5)
      expect(deque.max()).toBe(7)
    })

    it('should handle min and max at the same position (single element)', () => {
      deque.pushBack(5)
      expect(deque.min()).toBe(5)
      expect(deque.max()).toBe(5)
    })

    it('should handle large number of push/pop operations', () => {
      for (let i = 0; i < 1000; i++) {
        deque.pushBack(i)
      }
      expect(deque.size()).toBe(1000)
      expect(deque.min()).toBe(0)
      expect(deque.max()).toBe(999)
      for (let i = 0; i < 500; i++) {
        deque.popFront()
      }
      expect(deque.size()).toBe(500)
      expect(deque.min()).toBe(500)
      expect(deque.max()).toBe(999)
    })

    it('should handle pushFront heavy workload', () => {
      for (let i = 0; i < 500; i++) {
        deque.pushFront(i)
      }
      expect(deque.size()).toBe(500)
      expect(deque.min()).toBe(0)
      expect(deque.max()).toBe(499)
      for (let i = 499; i >= 0; i--) {
        expect(deque.popFront()).toBe(i)
      }
    })

    it('should handle alternating push and pop', () => {
      for (let i = 0; i < 100; i++) {
        deque.pushBack(i)
        if (i > 0) {
          deque.popFront()
        }
      }
      expect(deque.size()).toBe(1)
      expect(deque.peekFront()).toBe(99)
    })

    it('should handle alternating pushFront and popBack', () => {
      for (let i = 0; i < 100; i++) {
        deque.pushFront(i)
        if (i > 0) {
          deque.popBack()
        }
      }
      expect(deque.size()).toBe(1)
      expect(deque.peekFront()).toBe(99)
    })

    it('should handle pushFront and popBack min/max tracking', () => {
      deque.pushFront(5)
      deque.pushFront(3)
      deque.pushFront(7)
      expect(deque.toArray()).toEqual([7, 3, 5])
      expect(deque.min()).toBe(3)
      expect(deque.max()).toBe(7)
      deque.popBack()
      expect(deque.toArray()).toEqual([7, 3])
      expect(deque.min()).toBe(3)
      expect(deque.max()).toBe(7)
      deque.popBack()
      expect(deque.toArray()).toEqual([7])
      expect(deque.min()).toBe(7)
      expect(deque.max()).toBe(7)
    })

    it('should handle drain from both ends', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      deque.pushBack(5)
      expect(deque.popFront()).toBe(1)
      expect(deque.popBack()).toBe(5)
      expect(deque.popFront()).toBe(2)
      expect(deque.popBack()).toBe(4)
      expect(deque.popFront()).toBe(3)
      expect(deque.isEmpty()).toBe(true)
    })

    it('should track min/max correctly when draining from both ends', () => {
      deque.pushBack(1)
      deque.pushBack(5)
      deque.pushBack(3)
      deque.pushBack(2)
      deque.pushBack(4)
      expect(deque.popFront()).toBe(1)
      expect(deque.min()).toBe(2)
      expect(deque.max()).toBe(5)
      expect(deque.popBack()).toBe(4)
      expect(deque.min()).toBe(2)
      expect(deque.max()).toBe(5)
      expect(deque.popFront()).toBe(5)
      expect(deque.min()).toBe(2)
      expect(deque.max()).toBe(3)
      expect(deque.popBack()).toBe(2)
      expect(deque.min()).toBe(3)
      expect(deque.max()).toBe(3)
    })
  })

  describe('large datasets', () => {
    it('should handle 10000 pushBack operations', () => {
      for (let i = 0; i < 10000; i++) {
        deque.pushBack(i)
      }
      expect(deque.size()).toBe(10000)
      expect(deque.min()).toBe(0)
      expect(deque.max()).toBe(9999)
    })

    it('should handle 10000 pushFront operations', () => {
      for (let i = 0; i < 10000; i++) {
        deque.pushFront(i)
      }
      expect(deque.size()).toBe(10000)
      expect(deque.min()).toBe(0)
      expect(deque.max()).toBe(9999)
    })

    it('should handle 5000 pushBack then 5000 popFront', () => {
      for (let i = 0; i < 5000; i++) {
        deque.pushBack(i)
      }
      for (let i = 0; i < 5000; i++) {
        expect(deque.popFront()).toBe(i)
      }
      expect(deque.isEmpty()).toBe(true)
    })

    it('should handle 5000 pushFront then 5000 popBack', () => {
      for (let i = 0; i < 5000; i++) {
        deque.pushFront(i)
      }
      for (let i = 0; i < 5000; i++) {
        expect(deque.popBack()).toBe(i)
      }
      expect(deque.isEmpty()).toBe(true)
    })

    it('should handle fromArray with large dataset', () => {
      const arr = Array.from({ length: 10000 }, (_, i) => i)
      const d = MinMaxDeque.fromArray(arr)
      expect(d.size()).toBe(10000)
      expect(d.min()).toBe(0)
      expect(d.max()).toBe(9999)
    })

    it('should handle random order elements', () => {
      const arr = Array.from({ length: 1000 }, (_, i) => i)
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j]!, arr[i]!]
      }
      for (const val of arr) {
        deque.pushBack(val)
      }
      expect(deque.min()).toBe(0)
      expect(deque.max()).toBe(999)
      expect(deque.size()).toBe(1000)
    })

    it('should handle clone of large dataset', () => {
      for (let i = 0; i < 1000; i++) {
        deque.pushBack(i)
      }
      const cloned = deque.clone()
      expect(cloned.size()).toBe(1000)
      expect(cloned.min()).toBe(0)
      expect(cloned.max()).toBe(999)
    })

    it('should handle forEach on large dataset', () => {
      for (let i = 0; i < 1000; i++) {
        deque.pushBack(i)
      }
      let count = 0
      let lastVal = -1
      deque.forEach((item) => {
        expect(item).toBeGreaterThan(lastVal)
        lastVal = item
        count++
      })
      expect(count).toBe(1000)
    })

    it('should handle iterator on large dataset', () => {
      for (let i = 0; i < 1000; i++) {
        deque.pushBack(i)
      }
      let count = 0
      for (const item of deque) {
        expect(item).toBe(count)
        count++
      }
      expect(count).toBe(1000)
    })
  })

  describe('min/max tracking accuracy', () => {
    it('should track min when min is at front', () => {
      deque.pushBack(1)
      deque.pushBack(5)
      deque.pushBack(3)
      expect(deque.min()).toBe(1)
    })

    it('should track min when min is at back', () => {
      deque.pushBack(5)
      deque.pushBack(3)
      deque.pushBack(1)
      expect(deque.min()).toBe(1)
    })

    it('should track min when min is in the middle', () => {
      deque.pushBack(5)
      deque.pushBack(1)
      deque.pushBack(3)
      expect(deque.min()).toBe(1)
    })

    it('should track max when max is at front', () => {
      deque.pushBack(9)
      deque.pushBack(5)
      deque.pushBack(3)
      expect(deque.max()).toBe(9)
    })

    it('should track max when max is at back', () => {
      deque.pushBack(3)
      deque.pushBack(5)
      deque.pushBack(9)
      expect(deque.max()).toBe(9)
    })

    it('should track max when max is in the middle', () => {
      deque.pushBack(3)
      deque.pushBack(9)
      deque.pushBack(5)
      expect(deque.max()).toBe(9)
    })

    it('should update min/max after removing min from front via popFront', () => {
      deque.pushBack(1)
      deque.pushBack(5)
      deque.pushBack(3)
      deque.popFront()
      expect(deque.min()).toBe(3)
    })

    it('should update min/max after removing max from back via popBack', () => {
      deque.pushBack(3)
      deque.pushBack(5)
      deque.pushBack(9)
      deque.popBack()
      expect(deque.max()).toBe(5)
    })

    it('should update min/max after removing min from back via popBack', () => {
      deque.pushBack(5)
      deque.pushBack(3)
      deque.pushBack(1)
      deque.popBack()
      expect(deque.min()).toBe(3)
    })

    it('should update min/max after removing max from front via popFront', () => {
      deque.pushBack(9)
      deque.pushBack(5)
      deque.pushBack(3)
      deque.popFront()
      expect(deque.max()).toBe(5)
    })

    it('should handle min/max with duplicate minimum values', () => {
      deque.pushBack(1)
      deque.pushBack(5)
      deque.pushBack(1)
      deque.pushBack(3)
      expect(deque.min()).toBe(1)
      deque.popFront()
      expect(deque.min()).toBe(1)
      deque.popBack()
      expect(deque.min()).toBe(1)
      deque.popFront()
      expect(deque.min()).toBe(1)
    })

    it('should handle min/max with duplicate maximum values', () => {
      deque.pushBack(5)
      deque.pushBack(9)
      deque.pushBack(3)
      deque.pushBack(9)
      expect(deque.max()).toBe(9)
      deque.popFront()
      expect(deque.max()).toBe(9)
      deque.popBack()
      expect(deque.max()).toBe(9)
      deque.popFront()
      expect(deque.max()).toBe(3)
    })

    it('should handle sliding window simulation', () => {
      const data = [4, 3, 5, 2, 1, 6, 3, 2]
      const windowSize = 3
      const expectedMins = [3, 2, 1, 1, 1, 2]
      const expectedMaxs = [5, 5, 5, 6, 6, 6]
      for (let i = 0; i < windowSize; i++) {
        deque.pushBack(data[i]!)
      }
      for (let i = 0; i < expectedMins.length; i++) {
        expect(deque.min()).toBe(expectedMins[i])
        expect(deque.max()).toBe(expectedMaxs[i])
        if (i < expectedMins.length - 1) {
          deque.popFront()
          deque.pushBack(data[i + windowSize]!)
        }
      }
    })
  })

  describe('transfer behavior', () => {
    it('should handle popFront after only pushBack (triggers transfer)', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.popFront()).toBe(1)
      expect(deque.popFront()).toBe(2)
      expect(deque.popFront()).toBe(3)
    })

    it('should handle popBack after only pushFront (triggers transfer)', () => {
      deque.pushFront(1)
      deque.pushFront(2)
      deque.pushFront(3)
      expect(deque.popBack()).toBe(1)
      expect(deque.popBack()).toBe(2)
      expect(deque.popBack()).toBe(3)
    })

    it('should maintain correct min/max after transfer', () => {
      deque.pushBack(5)
      deque.pushBack(3)
      deque.pushBack(7)
      deque.pushBack(1)
      deque.pushBack(9)
      expect(deque.min()).toBe(1)
      expect(deque.max()).toBe(9)
      for (let i = 0; i < 5; i++) {
        deque.popFront()
        if (!deque.isEmpty()) {
          const remaining = deque.toArray()
          expect(deque.min()).toBe(Math.min(...remaining))
          expect(deque.max()).toBe(Math.max(...remaining))
        }
      }
    })

    it('should maintain correct min/max after reverse transfer', () => {
      deque.pushFront(5)
      deque.pushFront(3)
      deque.pushFront(7)
      deque.pushFront(1)
      deque.pushFront(9)
      expect(deque.min()).toBe(1)
      expect(deque.max()).toBe(9)
      for (let i = 0; i < 5; i++) {
        deque.popBack()
        if (!deque.isEmpty()) {
          const remaining = deque.toArray()
          expect(deque.min()).toBe(Math.min(...remaining))
          expect(deque.max()).toBe(Math.max(...remaining))
        }
      }
    })

    it('should handle mixed pushes then alternating pops', () => {
      deque.pushFront(3)
      deque.pushBack(7)
      deque.pushFront(1)
      deque.pushBack(9)
      expect(deque.toArray()).toEqual([1, 3, 7, 9])
      expect(deque.popFront()).toBe(1)
      expect(deque.min()).toBe(3)
      expect(deque.max()).toBe(9)
      expect(deque.popBack()).toBe(9)
      expect(deque.min()).toBe(3)
      expect(deque.max()).toBe(7)
      expect(deque.popFront()).toBe(3)
      expect(deque.min()).toBe(7)
      expect(deque.max()).toBe(7)
      expect(deque.popBack()).toBe(7)
      expect(deque.isEmpty()).toBe(true)
    })
  })

  describe('type safety', () => {
    it('should work with string type', () => {
      const d = new MinMaxDeque<string>()
      d.pushBack('hello')
      d.pushBack('world')
      d.pushBack('abc')
      expect(d.min()).toBe('abc')
      expect(d.max()).toBe('world')
    })

    it('should work with number type', () => {
      const d = new MinMaxDeque<number>()
      d.pushBack(42)
      d.pushBack(-5)
      d.pushBack(100)
      expect(d.min()).toBe(-5)
      expect(d.max()).toBe(100)
    })

    it('should export MinMaxDequeOptions type', () => {
      const opts: MinMaxDequeOptions<number> = {
        comparator: (a, b) => a - b,
      }
      const d = new MinMaxDeque<number>(opts)
      d.pushBack(1)
      expect(d.min()).toBe(1)
    })
  })

  describe('comprehensive min/max verification', () => {
    it('should verify min/max against brute force for random operations', () => {
      const elements: number[] = []
      const rng = (seed: number) => {
        let s = seed
        return () => {
          s = (s * 1664525 + 1013904223) & 0xffffffff
          return (s >>> 0) / 4294967296
        }
      }
      const rand = rng(42)
      for (let op = 0; op < 200; op++) {
        const action = rand()
        if (action < 0.25) {
          const val = Math.floor(rand() * 100)
          deque.pushFront(val)
          elements.unshift(val)
        } else if (action < 0.5) {
          const val = Math.floor(rand() * 100)
          deque.pushBack(val)
          elements.push(val)
        } else if (action < 0.75 && elements.length > 0) {
          deque.popFront()
          elements.shift()
        } else if (elements.length > 0) {
          deque.popBack()
          elements.pop()
        }
        if (elements.length > 0) {
          expect(deque.size()).toBe(elements.length)
          expect(deque.min()).toBe(Math.min(...elements))
          expect(deque.max()).toBe(Math.max(...elements))
          expect(deque.toArray()).toEqual(elements)
        } else {
          expect(deque.isEmpty()).toBe(true)
        }
      }
    })

    it('should verify min/max with specific tricky sequences', () => {
      deque.pushBack(3)
      deque.pushBack(1)
      deque.pushFront(4)
      deque.pushBack(1)
      deque.pushFront(5)
      expect(deque.toArray()).toEqual([5, 4, 3, 1, 1])
      expect(deque.min()).toBe(1)
      expect(deque.max()).toBe(5)
      deque.popFront()
      expect(deque.toArray()).toEqual([4, 3, 1, 1])
      expect(deque.min()).toBe(1)
      expect(deque.max()).toBe(4)
      deque.popBack()
      expect(deque.toArray()).toEqual([4, 3, 1])
      expect(deque.min()).toBe(1)
      expect(deque.max()).toBe(4)
      deque.popBack()
      expect(deque.toArray()).toEqual([4, 3])
      expect(deque.min()).toBe(3)
      expect(deque.max()).toBe(4)
      deque.popFront()
      expect(deque.toArray()).toEqual([3])
      expect(deque.min()).toBe(3)
      expect(deque.max()).toBe(3)
    })

    it('should verify transfer correctness with alternating operations', () => {
      deque.pushBack(10)
      deque.pushBack(20)
      deque.pushFront(5)
      expect(deque.peekFront()).toBe(5)
      expect(deque.peekBack()).toBe(20)
      expect(deque.min()).toBe(5)
      expect(deque.max()).toBe(20)
      deque.popFront()
      expect(deque.min()).toBe(10)
      expect(deque.max()).toBe(20)
      deque.popFront()
      expect(deque.min()).toBe(20)
      expect(deque.max()).toBe(20)
      deque.popFront()
      expect(deque.isEmpty()).toBe(true)
      deque.pushFront(100)
      deque.pushBack(200)
      expect(deque.min()).toBe(100)
      expect(deque.max()).toBe(200)
    })
  })
})
