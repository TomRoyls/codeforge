import { describe, it, expect, beforeEach } from 'vitest'
import { Deque } from '../../src/core/deque/deque.js'
import { DEFAULT_DEQUE_OPTIONS } from '../../src/core/deque/types.js'
import type { DequeNode, DequeOptions } from '../../src/core/deque/types.js'

describe('Deque', () => {
  let deque: Deque<number>

  beforeEach(() => {
    deque = new Deque<number>()
  })

  describe('constructor', () => {
    it('should create an empty deque with default options', () => {
      const d = new Deque<number>()
      expect(d.size()).toBe(0)
      expect(d.isEmpty()).toBe(true)
    })

    it('should accept custom maxSize option', () => {
      const d = new Deque<number>({ maxSize: 5 })
      expect(d.size()).toBe(0)
    })

    it('should accept empty options', () => {
      const d = new Deque<number>({})
      expect(d.size()).toBe(0)
    })

    it('should have default maxSize of 0', () => {
      expect(DEFAULT_DEQUE_OPTIONS.maxSize).toBe(0)
    })
  })

  describe('pushFront', () => {
    it('should add a value to the front of an empty deque', () => {
      deque.pushFront(1)
      expect(deque.size()).toBe(1)
      expect(deque.peekFront()).toBe(1)
      expect(deque.peekBack()).toBe(1)
    })

    it('should add multiple values to the front', () => {
      deque.pushFront(1)
      deque.pushFront(2)
      deque.pushFront(3)
      expect(deque.toArray()).toEqual([3, 2, 1])
    })

    it('should update head and tail correctly', () => {
      deque.pushFront(1)
      deque.pushFront(2)
      expect(deque.peekFront()).toBe(2)
      expect(deque.peekBack()).toBe(1)
    })

    it('should respect maxSize limit by evicting from back', () => {
      const d = new Deque<number>({ maxSize: 2 })
      d.pushFront(1)
      d.pushFront(2)
      d.pushFront(3)
      expect(d.toArray()).toEqual([3, 2])
      expect(d.size()).toBe(2)
    })
  })

  describe('pushBack', () => {
    it('should add a value to the back of an empty deque', () => {
      deque.pushBack(1)
      expect(deque.size()).toBe(1)
      expect(deque.peekFront()).toBe(1)
      expect(deque.peekBack()).toBe(1)
    })

    it('should add multiple values to the back', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.toArray()).toEqual([1, 2, 3])
    })

    it('should update head and tail correctly', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.peekFront()).toBe(1)
      expect(deque.peekBack()).toBe(2)
    })

    it('should respect maxSize limit by evicting from front', () => {
      const d = new Deque<number>({ maxSize: 2 })
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      expect(d.toArray()).toEqual([2, 3])
      expect(d.size()).toBe(2)
    })
  })

  describe('popFront', () => {
    it('should return undefined when deque is empty', () => {
      expect(deque.popFront()).toBeUndefined()
    })

    it('should remove and return the front value', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.popFront()).toBe(1)
      expect(deque.toArray()).toEqual([2])
    })

    it('should handle popping the last element', () => {
      deque.pushBack(42)
      expect(deque.popFront()).toBe(42)
      expect(deque.isEmpty()).toBe(true)
      expect(deque.peekFront()).toBeUndefined()
      expect(deque.peekBack()).toBeUndefined()
    })

    it('should decrement size', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.popFront()
      expect(deque.size()).toBe(1)
    })
  })

  describe('popBack', () => {
    it('should return undefined when deque is empty', () => {
      expect(deque.popBack()).toBeUndefined()
    })

    it('should remove and return the back value', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.popBack()).toBe(2)
      expect(deque.toArray()).toEqual([1])
    })

    it('should handle popping the last element', () => {
      deque.pushBack(42)
      expect(deque.popBack()).toBe(42)
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
    it('should return undefined when deque is empty', () => {
      expect(deque.peekFront()).toBeUndefined()
    })

    it('should return the front value without removing it', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.peekFront()).toBe(1)
      expect(deque.size()).toBe(2)
    })

    it('should reflect pushFront changes', () => {
      deque.pushBack(1)
      deque.pushFront(0)
      expect(deque.peekFront()).toBe(0)
    })
  })

  describe('peekBack', () => {
    it('should return undefined when deque is empty', () => {
      expect(deque.peekBack()).toBeUndefined()
    })

    it('should return the back value without removing it', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.peekBack()).toBe(2)
      expect(deque.size()).toBe(2)
    })

    it('should reflect pushBack changes', () => {
      deque.pushBack(1)
      deque.pushBack(99)
      expect(deque.peekBack()).toBe(99)
    })
  })

  describe('get', () => {
    it('should return undefined for negative index', () => {
      deque.pushBack(1)
      expect(deque.get(-1)).toBeUndefined()
    })

    it('should return undefined for out of bounds index', () => {
      deque.pushBack(1)
      expect(deque.get(5)).toBeUndefined()
    })

    it('should return value at valid index', () => {
      deque.pushBack(10)
      deque.pushBack(20)
      deque.pushBack(30)
      expect(deque.get(0)).toBe(10)
      expect(deque.get(1)).toBe(20)
      expect(deque.get(2)).toBe(30)
    })

    it('should return undefined for empty deque', () => {
      expect(deque.get(0)).toBeUndefined()
    })

    it('should use efficient traversal for back-half indices', () => {
      for (let i = 0; i < 10; i++) deque.pushBack(i)
      expect(deque.get(9)).toBe(9)
      expect(deque.get(8)).toBe(8)
    })
  })

  describe('set', () => {
    it('should return false for invalid index', () => {
      expect(deque.set(0, 1)).toBe(false)
      expect(deque.set(-1, 1)).toBe(false)
    })

    it('should update value at valid index and return true', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.set(1, 99)).toBe(true)
      expect(deque.get(1)).toBe(99)
    })

    it('should not change size', () => {
      deque.pushBack(1)
      deque.set(0, 10)
      expect(deque.size()).toBe(1)
    })

    it('should return false for out of bounds index', () => {
      deque.pushBack(1)
      expect(deque.set(1, 2)).toBe(false)
    })
  })

  describe('insertAt', () => {
    it('should insert at front when index is 0', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.insertAt(0, 99)
      expect(deque.toArray()).toEqual([99, 1, 2])
    })

    it('should insert at back when index equals size', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.insertAt(2, 99)
      expect(deque.toArray()).toEqual([1, 2, 99])
    })

    it('should insert at back when index exceeds size', () => {
      deque.pushBack(1)
      deque.insertAt(10, 99)
      expect(deque.toArray()).toEqual([1, 99])
    })

    it('should insert at front when index is negative', () => {
      deque.pushBack(1)
      deque.insertAt(-5, 99)
      expect(deque.toArray()).toEqual([99, 1])
    })

    it('should insert in the middle', () => {
      deque.pushBack(1)
      deque.pushBack(3)
      deque.insertAt(1, 2)
      expect(deque.toArray()).toEqual([1, 2, 3])
    })

    it('should respect maxSize when inserting in middle', () => {
      const d = new Deque<number>({ maxSize: 3 })
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      d.insertAt(1, 99)
      expect(d.toArray()).toEqual([1, 99, 2])
      expect(d.size()).toBe(3)
    })
  })

  describe('removeAt', () => {
    it('should return undefined for negative index', () => {
      deque.pushBack(1)
      expect(deque.removeAt(-1)).toBeUndefined()
    })

    it('should return undefined for out of bounds index', () => {
      deque.pushBack(1)
      expect(deque.removeAt(5)).toBeUndefined()
    })

    it('should remove from front when index is 0', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.removeAt(0)).toBe(1)
      expect(deque.toArray()).toEqual([2])
    })

    it('should remove from back when index is last', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.removeAt(1)).toBe(2)
      expect(deque.toArray()).toEqual([1])
    })

    it('should remove from middle', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.removeAt(1)).toBe(2)
      expect(deque.toArray()).toEqual([1, 3])
    })

    it('should return undefined for empty deque', () => {
      expect(deque.removeAt(0)).toBeUndefined()
    })
  })

  describe('indexOf', () => {
    it('should return -1 when value is not found', () => {
      deque.pushBack(1)
      expect(deque.indexOf(99)).toBe(-1)
    })

    it('should return index of first occurrence', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.indexOf(2)).toBe(1)
    })

    it('should return -1 for empty deque', () => {
      expect(deque.indexOf(1)).toBe(-1)
    })

    it('should handle duplicate values', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(1)
      expect(deque.indexOf(1)).toBe(0)
    })

    it('should use strict equality', () => {
      const d = new Deque<string>()
      d.pushBack('hello')
      expect(d.indexOf('hello')).toBe(0)
    })
  })

  describe('contains', () => {
    it('should return true when value exists', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.contains(2)).toBe(true)
    })

    it('should return false when value does not exist', () => {
      deque.pushBack(1)
      expect(deque.contains(99)).toBe(false)
    })

    it('should return false for empty deque', () => {
      expect(deque.contains(1)).toBe(false)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty deque', () => {
      expect(deque.toArray()).toEqual([])
    })

    it('should return all values in order', () => {
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
  })

  describe('fromArray', () => {
    it('should add all items to the back of an empty deque', () => {
      deque.fromArray([1, 2, 3])
      expect(deque.toArray()).toEqual([1, 2, 3])
    })

    it('should append to existing items', () => {
      deque.pushBack(0)
      deque.fromArray([1, 2])
      expect(deque.toArray()).toEqual([0, 1, 2])
    })

    it('should handle empty array', () => {
      deque.pushBack(1)
      deque.fromArray([])
      expect(deque.size()).toBe(1)
    })
  })

  describe('size', () => {
    it('should return 0 for empty deque', () => {
      expect(deque.size()).toBe(0)
    })

    it('should return correct size after operations', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.size()).toBe(2)
      deque.popFront()
      expect(deque.size()).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty deque', () => {
      expect(deque.isEmpty()).toBe(true)
    })

    it('should return false after adding items', () => {
      deque.pushBack(1)
      expect(deque.isEmpty()).toBe(false)
    })

    it('should return true after clearing all items', () => {
      deque.pushBack(1)
      deque.popFront()
      expect(deque.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear an empty deque without error', () => {
      deque.clear()
      expect(deque.isEmpty()).toBe(true)
    })

    it('should remove all items', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.clear()
      expect(deque.isEmpty()).toBe(true)
      expect(deque.size()).toBe(0)
      expect(deque.toArray()).toEqual([])
    })

    it('should allow operations after clear', () => {
      deque.pushBack(1)
      deque.clear()
      deque.pushBack(2)
      expect(deque.peekFront()).toBe(2)
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty deque', () => {
      const values: number[] = []
      deque.forEach((v) => values.push(v))
      expect(values).toEqual([])
    })

    it('should iterate all values in order', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      const values: number[] = []
      deque.forEach((v) => values.push(v))
      expect(values).toEqual([1, 2, 3])
    })

    it('should provide correct indices', () => {
      deque.pushBack(10)
      deque.pushBack(20)
      const indices: number[] = []
      deque.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1])
    })
  })

  describe('reverse', () => {
    it('should handle empty deque', () => {
      deque.reverse()
      expect(deque.toArray()).toEqual([])
    })

    it('should handle single element', () => {
      deque.pushBack(1)
      deque.reverse()
      expect(deque.toArray()).toEqual([1])
    })

    it('should reverse two elements', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.reverse()
      expect(deque.toArray()).toEqual([2, 1])
    })

    it('should reverse multiple elements', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      deque.reverse()
      expect(deque.toArray()).toEqual([4, 3, 2, 1])
    })

    it('should update head and tail after reverse', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.reverse()
      expect(deque.peekFront()).toBe(3)
      expect(deque.peekBack()).toBe(1)
    })

    it('should allow operations after reverse', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.reverse()
      deque.pushBack(0)
      expect(deque.toArray()).toEqual([2, 1, 0])
    })
  })

  describe('rotate', () => {
    it('should handle empty deque', () => {
      deque.rotate(1)
      expect(deque.toArray()).toEqual([])
    })

    it('should handle single element', () => {
      deque.pushBack(1)
      deque.rotate(1)
      expect(deque.toArray()).toEqual([1])
    })

    it('should rotate right by 1', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.rotate(1)
      expect(deque.toArray()).toEqual([2, 3, 1])
    })

    it('should rotate right by 2', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      deque.rotate(2)
      expect(deque.toArray()).toEqual([3, 4, 1, 2])
    })

    it('should rotate left with negative n', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.rotate(-1)
      expect(deque.toArray()).toEqual([3, 1, 2])
    })

    it('should handle n equal to size (no-op)', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.rotate(3)
      expect(deque.toArray()).toEqual([1, 2, 3])
    })

    it('should handle n = 0 (no-op)', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.rotate(0)
      expect(deque.toArray()).toEqual([1, 2])
    })

    it('should handle n larger than size', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.rotate(7)
      expect(deque.toArray()).toEqual([2, 3, 1])
    })

    it('should handle negative n larger than size', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.rotate(-5)
      expect(deque.toArray()).toEqual([2, 3, 1])
    })
  })

  describe('mixed operations', () => {
    it('should handle alternating pushFront and pushBack', () => {
      deque.pushFront(2)
      deque.pushBack(3)
      deque.pushFront(1)
      deque.pushBack(4)
      expect(deque.toArray()).toEqual([1, 2, 3, 4])
    })

    it('should handle alternating push and pop', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.popFront()
      deque.pushBack(3)
      deque.popBack()
      expect(deque.toArray()).toEqual([2])
    })

    it('should work with string values', () => {
      const d = new Deque<string>()
      d.pushBack('a')
      d.pushBack('b')
      d.pushFront('c')
      expect(d.toArray()).toEqual(['c', 'a', 'b'])
    })

    it('should work with object values', () => {
      const d = new Deque<{ id: number }>()
      d.pushBack({ id: 1 })
      d.pushBack({ id: 2 })
      const arr = d.toArray()
      expect(arr[0]!.id).toBe(1)
      expect(arr[1]!.id).toBe(2)
    })

    it('should handle large number of operations', () => {
      for (let i = 0; i < 100; i++) {
        deque.pushBack(i)
      }
      expect(deque.size()).toBe(100)
      expect(deque.peekFront()).toBe(0)
      expect(deque.peekBack()).toBe(99)
    })

    it('should handle pushFront after popBack to empty', () => {
      deque.pushBack(1)
      deque.popBack()
      deque.pushFront(2)
      expect(deque.toArray()).toEqual([2])
    })

    it('should handle pushBack after popFront to empty', () => {
      deque.pushBack(1)
      deque.popFront()
      deque.pushBack(2)
      expect(deque.toArray()).toEqual([2])
    })
  })

  describe('maxSize behavior', () => {
    it('should not limit when maxSize is 0', () => {
      const d = new Deque<number>({ maxSize: 0 })
      for (let i = 0; i < 100; i++) d.pushBack(i)
      expect(d.size()).toBe(100)
    })

    it('should evict from back on pushFront overflow', () => {
      const d = new Deque<number>({ maxSize: 3 })
      d.pushFront(1)
      d.pushFront(2)
      d.pushFront(3)
      d.pushFront(4)
      expect(d.toArray()).toEqual([4, 3, 2])
    })

    it('should evict from front on pushBack overflow', () => {
      const d = new Deque<number>({ maxSize: 3 })
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      d.pushBack(4)
      expect(d.toArray()).toEqual([2, 3, 4])
    })

    it('should evict from back on insertAt overflow in middle', () => {
      const d = new Deque<number>({ maxSize: 3 })
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      d.insertAt(1, 99)
      expect(d.toArray()).toEqual([1, 99, 2])
      expect(d.size()).toBe(3)
    })
  })

  describe('re-exports', () => {
    it('should export DEFAULT_DEQUE_OPTIONS', () => {
      expect(DEFAULT_DEQUE_OPTIONS).toBeDefined()
      expect(DEFAULT_DEQUE_OPTIONS.maxSize).toBe(0)
    })
  })
})
