import { describe, it, expect, beforeEach } from 'vitest'
import { CircularDeque } from '../../src/core/circular-deque/circular-deque.js'
import { DEFAULT_CIRCULAR_DEQUE_OPTIONS } from '../../src/core/circular-deque/types.js'
import type { CircularDequeOptions } from '../../src/core/circular-deque/types.js'

describe('CircularDeque', () => {
  let deque: CircularDeque<number>

  beforeEach(() => {
    deque = new CircularDeque<number>()
  })

  describe('construction', () => {
    it('should create with default options', () => {
      const d = new CircularDeque<number>()
      expect(d.size()).toBe(0)
      expect(d.isEmpty()).toBe(true)
      expect(d.capacity()).toBe(DEFAULT_CIRCULAR_DEQUE_OPTIONS.initialCapacity)
    })

    it('should create with custom initial capacity', () => {
      const d = new CircularDeque<number>({ initialCapacity: 32 })
      expect(d.capacity()).toBe(32)
    })

    it('should clamp initial capacity to at least 1', () => {
      const d = new CircularDeque<number>({ initialCapacity: 0 })
      expect(d.capacity()).toBe(1)
    })

    it('should clamp negative initial capacity to 1', () => {
      const d = new CircularDeque<number>({ initialCapacity: -5 })
      expect(d.capacity()).toBe(1)
    })

    it('should accept empty options object', () => {
      const d = new CircularDeque<number>({})
      expect(d.capacity()).toBe(DEFAULT_CIRCULAR_DEQUE_OPTIONS.initialCapacity)
    })

    it('should accept undefined options', () => {
      const d = new CircularDeque<number>(undefined)
      expect(d.capacity()).toBe(DEFAULT_CIRCULAR_DEQUE_OPTIONS.initialCapacity)
    })

    it('should start empty', () => {
      expect(deque.size()).toBe(0)
      expect(deque.isEmpty()).toBe(true)
    })
  })

  describe('pushFront', () => {
    it('should add element to front', () => {
      deque.pushFront(1)
      expect(deque.peekFront()).toBe(1)
      expect(deque.size()).toBe(1)
    })

    it('should maintain order with multiple pushFront calls', () => {
      deque.pushFront(1)
      deque.pushFront(2)
      deque.pushFront(3)
      expect(deque.toArray()).toEqual([3, 2, 1])
    })

    it('should trigger resize when full', () => {
      const d = new CircularDeque<number>({ initialCapacity: 2 })
      d.pushFront(1)
      d.pushFront(2)
      expect(d.isFull()).toBe(true)
      d.pushFront(3)
      expect(d.size()).toBe(3)
      expect(d.capacity()).toBe(4)
      expect(d.toArray()).toEqual([3, 2, 1])
    })

    it('should handle pushFront after popBack wraps', () => {
      const d = new CircularDeque<number>({ initialCapacity: 4 })
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      d.pushBack(4)
      d.popFront()
      d.popFront()
      d.pushFront(5)
      d.pushFront(6)
      expect(d.toArray()).toEqual([6, 5, 3, 4])
    })

    it('should work with string type', () => {
      const d = new CircularDeque<string>()
      d.pushFront('a')
      d.pushFront('b')
      expect(d.toArray()).toEqual(['b', 'a'])
    })
  })

  describe('pushBack', () => {
    it('should add element to back', () => {
      deque.pushBack(1)
      expect(deque.peekBack()).toBe(1)
      expect(deque.size()).toBe(1)
    })

    it('should maintain order with multiple pushBack calls', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.toArray()).toEqual([1, 2, 3])
    })

    it('should trigger resize when full', () => {
      const d = new CircularDeque<number>({ initialCapacity: 2 })
      d.pushBack(1)
      d.pushBack(2)
      expect(d.isFull()).toBe(true)
      d.pushBack(3)
      expect(d.size()).toBe(3)
      expect(d.capacity()).toBe(4)
      expect(d.toArray()).toEqual([1, 2, 3])
    })

    it('should interleave pushFront and pushBack', () => {
      deque.pushBack(2)
      deque.pushFront(1)
      deque.pushBack(3)
      deque.pushFront(0)
      expect(deque.toArray()).toEqual([0, 1, 2, 3])
    })
  })

  describe('popFront', () => {
    it('should return undefined on empty deque', () => {
      expect(deque.popFront()).toBeUndefined()
    })

    it('should remove and return front element', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.popFront()).toBe(1)
      expect(deque.toArray()).toEqual([2, 3])
    })

    it('should drain the deque completely', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.popFront()).toBe(1)
      expect(deque.popFront()).toBe(2)
      expect(deque.popFront()).toBeUndefined()
      expect(deque.isEmpty()).toBe(true)
    })

    it('should update size correctly', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.popFront()
      expect(deque.size()).toBe(1)
    })
  })

  describe('popBack', () => {
    it('should return undefined on empty deque', () => {
      expect(deque.popBack()).toBeUndefined()
    })

    it('should remove and return back element', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.popBack()).toBe(3)
      expect(deque.toArray()).toEqual([1, 2])
    })

    it('should drain the deque completely', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.popBack()).toBe(2)
      expect(deque.popBack()).toBe(1)
      expect(deque.popBack()).toBeUndefined()
      expect(deque.isEmpty()).toBe(true)
    })
  })

  describe('peekFront', () => {
    it('should return undefined on empty deque', () => {
      expect(deque.peekFront()).toBeUndefined()
    })

    it('should return front element without removing', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.peekFront()).toBe(1)
      expect(deque.size()).toBe(2)
    })

    it('should reflect pushFront', () => {
      deque.pushBack(1)
      deque.pushFront(0)
      expect(deque.peekFront()).toBe(0)
    })
  })

  describe('peekBack', () => {
    it('should return undefined on empty deque', () => {
      expect(deque.peekBack()).toBeUndefined()
    })

    it('should return back element without removing', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.peekBack()).toBe(2)
      expect(deque.size()).toBe(2)
    })

    it('should reflect pushBack', () => {
      deque.pushFront(1)
      deque.pushBack(2)
      expect(deque.peekBack()).toBe(2)
    })
  })

  describe('get', () => {
    it('should return undefined for out-of-bounds index', () => {
      deque.pushBack(1)
      expect(deque.get(-1)).toBeUndefined()
      expect(deque.get(1)).toBeUndefined()
    })

    it('should return element at given index', () => {
      deque.pushBack(10)
      deque.pushBack(20)
      deque.pushBack(30)
      expect(deque.get(0)).toBe(10)
      expect(deque.get(1)).toBe(20)
      expect(deque.get(2)).toBe(30)
    })

    it('should work after wrapping', () => {
      const d = new CircularDeque<number>({ initialCapacity: 4 })
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      d.pushBack(4)
      d.popFront()
      d.popFront()
      d.pushBack(5)
      d.pushBack(6)
      expect(d.get(0)).toBe(3)
      expect(d.get(1)).toBe(4)
      expect(d.get(2)).toBe(5)
      expect(d.get(3)).toBe(6)
    })
  })

  describe('set', () => {
    it('should return false for out-of-bounds index', () => {
      deque.pushBack(1)
      expect(deque.set(-1, 99)).toBe(false)
      expect(deque.set(1, 99)).toBe(false)
    })

    it('should set value at given index', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.set(1, 99)).toBe(true)
      expect(deque.get(1)).toBe(99)
      expect(deque.toArray()).toEqual([1, 99, 3])
    })

    it('should return true for valid index', () => {
      deque.pushBack(1)
      expect(deque.set(0, 42)).toBe(true)
    })
  })

  describe('insertAt', () => {
    it('should insert at front when index <= 0', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.insertAt(0, 99)
      expect(deque.toArray()).toEqual([99, 1, 2])
    })

    it('should insert at front when index is negative', () => {
      deque.pushBack(1)
      deque.insertAt(-5, 99)
      expect(deque.toArray()).toEqual([99, 1])
    })

    it('should insert at back when index >= size', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.insertAt(5, 99)
      expect(deque.toArray()).toEqual([1, 2, 99])
    })

    it('should insert in the middle (closer to front)', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.insertAt(1, 99)
      expect(deque.toArray()).toEqual([1, 99, 2, 3])
    })

    it('should insert in the middle (closer to back)', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      deque.insertAt(3, 99)
      expect(deque.toArray()).toEqual([1, 2, 3, 99, 4])
    })

    it('should trigger resize when full', () => {
      const d = new CircularDeque<number>({ initialCapacity: 3 })
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      d.insertAt(1, 99)
      expect(d.size()).toBe(4)
      expect(d.capacity()).toBe(6)
      expect(d.toArray()).toEqual([1, 99, 2, 3])
    })
  })

  describe('removeAt', () => {
    it('should return undefined for out-of-bounds index', () => {
      deque.pushBack(1)
      expect(deque.removeAt(-1)).toBeUndefined()
      expect(deque.removeAt(1)).toBeUndefined()
    })

    it('should remove from front (index 0)', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.removeAt(0)).toBe(1)
      expect(deque.toArray()).toEqual([2, 3])
    })

    it('should remove from back (last index)', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.removeAt(2)).toBe(3)
      expect(deque.toArray()).toEqual([1, 2])
    })

    it('should remove from middle (closer to front)', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      expect(deque.removeAt(1)).toBe(2)
      expect(deque.toArray()).toEqual([1, 3, 4])
    })

    it('should remove from middle (closer to back)', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      expect(deque.removeAt(2)).toBe(3)
      expect(deque.toArray()).toEqual([1, 2, 4])
    })

    it('should update size after removal', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.removeAt(1)
      expect(deque.size()).toBe(1)
    })
  })

  describe('size / capacity / isEmpty / isFull', () => {
    it('should track size correctly', () => {
      expect(deque.size()).toBe(0)
      deque.pushBack(1)
      expect(deque.size()).toBe(1)
      deque.pushBack(2)
      expect(deque.size()).toBe(2)
      deque.popFront()
      expect(deque.size()).toBe(1)
    })

    it('should report capacity', () => {
      const d = new CircularDeque<number>({ initialCapacity: 8 })
      expect(d.capacity()).toBe(8)
    })

    it('should report isEmpty', () => {
      expect(deque.isEmpty()).toBe(true)
      deque.pushBack(1)
      expect(deque.isEmpty()).toBe(false)
      deque.popFront()
      expect(deque.isEmpty()).toBe(true)
    })

    it('should report isFull', () => {
      const d = new CircularDeque<number>({ initialCapacity: 2 })
      expect(d.isFull()).toBe(false)
      d.pushBack(1)
      expect(d.isFull()).toBe(false)
      d.pushBack(2)
      expect(d.isFull()).toBe(true)
    })

    it('should no longer be full after resize', () => {
      const d = new CircularDeque<number>({ initialCapacity: 2 })
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      expect(d.isFull()).toBe(false)
      expect(d.capacity()).toBe(4)
    })
  })

  describe('clear', () => {
    it('should clear an empty deque', () => {
      deque.clear()
      expect(deque.size()).toBe(0)
      expect(deque.isEmpty()).toBe(true)
    })

    it('should clear a non-empty deque', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.clear()
      expect(deque.size()).toBe(0)
      expect(deque.isEmpty()).toBe(true)
      expect(deque.toArray()).toEqual([])
    })

    it('should preserve capacity after clear', () => {
      const d = new CircularDeque<number>({ initialCapacity: 8 })
      d.pushBack(1)
      d.pushBack(2)
      d.clear()
      expect(d.capacity()).toBe(8)
    })

    it('should allow operations after clear', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.clear()
      deque.pushBack(3)
      expect(deque.size()).toBe(1)
      expect(deque.peekFront()).toBe(3)
    })
  })

  describe('clone', () => {
    it('should clone an empty deque', () => {
      const cloned = deque.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should clone a non-empty deque', () => {
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
      cloned.pushBack(3)
      expect(deque.size()).toBe(2)
      expect(cloned.size()).toBe(3)
    })

    it('should reflect mutations independently', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      const cloned = deque.clone()
      cloned.set(0, 99)
      expect(deque.get(0)).toBe(1)
      expect(cloned.get(0)).toBe(99)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty deque', () => {
      expect(deque.toArray()).toEqual([])
    })

    it('should return elements in order', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.toArray()).toEqual([1, 2, 3])
    })

    it('should reflect wrapping', () => {
      const d = new CircularDeque<number>({ initialCapacity: 4 })
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      d.popFront()
      d.pushBack(4)
      expect(d.toArray()).toEqual([2, 3, 4])
    })

    it('should not modify the deque', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      const arr = deque.toArray()
      arr.push(999)
      expect(deque.size()).toBe(2)
    })
  })

  describe('from factory', () => {
    it('should create from array', () => {
      const d = CircularDeque.from([1, 2, 3])
      expect(d.toArray()).toEqual([1, 2, 3])
      expect(d.size()).toBe(3)
    })

    it('should create from empty array', () => {
      const d = CircularDeque.from([])
      expect(d.size()).toBe(0)
      expect(d.isEmpty()).toBe(true)
    })

    it('should create from iterable (Set)', () => {
      const d = CircularDeque.from(new Set([1, 2, 3]))
      expect(d.size()).toBe(3)
    })

    it('should create from generator', () => {
      function* gen() {
        yield 1
        yield 2
        yield 3
      }
      const d = CircularDeque.from(gen())
      expect(d.toArray()).toEqual([1, 2, 3])
    })

    it('should create from string iterable', () => {
      const d = CircularDeque.from('abc')
      expect(d.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('should set capacity to at least the input size', () => {
      const d = CircularDeque.from([1, 2, 3, 4, 5])
      expect(d.capacity()).toBeGreaterThanOrEqual(5)
    })
  })

  describe('contains', () => {
    it('should return false for empty deque', () => {
      expect(deque.contains(1)).toBe(false)
    })

    it('should return true when element exists', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.contains(2)).toBe(true)
    })

    it('should return false when element does not exist', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.contains(99)).toBe(false)
    })

    it('should use strict equality', () => {
      const d = new CircularDeque<number>()
      d.pushBack(1)
      expect(d.contains(1)).toBe(true)
      expect(d.contains('1' as unknown as number)).toBe(false)
    })

    it('should work with object references', () => {
      const obj = { x: 1 }
      const d = new CircularDeque<{ x: number }>()
      d.pushBack(obj)
      expect(d.contains(obj)).toBe(true)
      expect(d.contains({ x: 1 })).toBe(false)
    })
  })

  describe('indexOf / lastIndexOf', () => {
    it('should return -1 for element not found', () => {
      deque.pushBack(1)
      expect(deque.indexOf(99)).toBe(-1)
    })

    it('should return first occurrence index', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(2)
      expect(deque.indexOf(2)).toBe(1)
    })

    it('should return last occurrence index', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(2)
      expect(deque.lastIndexOf(2)).toBe(3)
    })

    it('should return -1 for empty deque', () => {
      expect(deque.indexOf(1)).toBe(-1)
      expect(deque.lastIndexOf(1)).toBe(-1)
    })

    it('should return same index for unique element', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.indexOf(2)).toBe(1)
      expect(deque.lastIndexOf(2)).toBe(1)
    })

    it('should find first and last of multiple duplicates', () => {
      deque.pushBack(5)
      deque.pushBack(5)
      deque.pushBack(5)
      expect(deque.indexOf(5)).toBe(0)
      expect(deque.lastIndexOf(5)).toBe(2)
    })

    it('should work after wrapping', () => {
      const d = new CircularDeque<number>({ initialCapacity: 4 })
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      d.pushBack(4)
      d.popFront()
      d.pushBack(5)
      expect(d.indexOf(3)).toBe(1)
      expect(d.indexOf(5)).toBe(3)
    })
  })

  describe('rotate', () => {
    it('should do nothing on empty deque', () => {
      deque.rotate(3)
      expect(deque.size()).toBe(0)
    })

    it('should do nothing on single element', () => {
      deque.pushBack(1)
      deque.rotate(1)
      expect(deque.toArray()).toEqual([1])
    })

    it('should rotate right by positive n', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      deque.rotate(1)
      expect(deque.toArray()).toEqual([2, 3, 4, 1])
    })

    it('should rotate left by negative n', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      deque.rotate(-1)
      expect(deque.toArray()).toEqual([4, 1, 2, 3])
    })

    it('should handle rotation larger than size', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.rotate(4)
      expect(deque.toArray()).toEqual([2, 3, 1])
    })

    it('should handle negative rotation larger than size', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.rotate(-4)
      expect(deque.toArray()).toEqual([3, 1, 2])
    })

    it('should handle zero rotation', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.rotate(0)
      expect(deque.toArray()).toEqual([1, 2, 3])
    })

    it('should handle rotation equal to size (no-op)', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.rotate(3)
      expect(deque.toArray()).toEqual([1, 2, 3])
    })

    it('should preserve size after rotation', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.rotate(2)
      expect(deque.size()).toBe(3)
    })

    it('should work with multiple rotations', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      deque.rotate(1)
      deque.rotate(1)
      expect(deque.toArray()).toEqual([3, 4, 1, 2])
    })

    it('should handle rotate right by 2', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      deque.pushBack(5)
      deque.rotate(2)
      expect(deque.toArray()).toEqual([3, 4, 5, 1, 2])
    })
  })

  describe('edge cases', () => {
    it('should handle empty deque operations', () => {
      expect(deque.popFront()).toBeUndefined()
      expect(deque.popBack()).toBeUndefined()
      expect(deque.peekFront()).toBeUndefined()
      expect(deque.peekBack()).toBeUndefined()
      expect(deque.get(0)).toBeUndefined()
      expect(deque.set(0, 1)).toBe(false)
      expect(deque.removeAt(0)).toBeUndefined()
      expect(deque.indexOf(1)).toBe(-1)
      expect(deque.lastIndexOf(1)).toBe(-1)
      expect(deque.contains(1)).toBe(false)
      expect(deque.toArray()).toEqual([])
    })

    it('should handle single element', () => {
      deque.pushBack(42)
      expect(deque.peekFront()).toBe(42)
      expect(deque.peekBack()).toBe(42)
      expect(deque.get(0)).toBe(42)
      expect(deque.indexOf(42)).toBe(0)
      expect(deque.lastIndexOf(42)).toBe(0)
      expect(deque.contains(42)).toBe(true)
      deque.rotate(1)
      expect(deque.toArray()).toEqual([42])
    })

    it('should handle full capacity triggers resize', () => {
      const d = new CircularDeque<number>({ initialCapacity: 4 })
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      d.pushBack(4)
      expect(d.isFull()).toBe(true)
      d.pushBack(5)
      expect(d.size()).toBe(5)
      expect(d.capacity()).toBe(8)
      expect(d.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle pushFront triggering resize', () => {
      const d = new CircularDeque<number>({ initialCapacity: 2 })
      d.pushFront(2)
      d.pushFront(1)
      d.pushFront(0)
      expect(d.toArray()).toEqual([0, 1, 2])
      expect(d.capacity()).toBe(4)
    })

    it('should handle mixed push/pop operations', () => {
      deque.pushBack(1)
      deque.pushFront(0)
      deque.pushBack(2)
      deque.popFront()
      deque.pushBack(3)
      deque.popBack()
      expect(deque.toArray()).toEqual([1, 2])
    })

    it('should handle alternating push and pop', () => {
      deque.pushBack(1)
      expect(deque.popFront()).toBe(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.popFront()).toBe(2)
      expect(deque.toArray()).toEqual([3])
    })

    it('should handle wrap-around correctly', () => {
      const d = new CircularDeque<number>({ initialCapacity: 4 })
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      d.pushBack(4)
      d.popFront()
      d.popFront()
      d.pushBack(5)
      d.pushBack(6)
      expect(d.toArray()).toEqual([3, 4, 5, 6])
      expect(d.size()).toBe(4)
    })

    it('should handle pushFront with wrap-around', () => {
      const d = new CircularDeque<number>({ initialCapacity: 4 })
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      d.popBack()
      d.popBack()
      d.pushFront(0)
      expect(d.toArray()).toEqual([0, 1])
    })

    it('should handle insertAt on single element deque', () => {
      deque.pushBack(1)
      deque.insertAt(0, 0)
      expect(deque.toArray()).toEqual([0, 1])
    })

    it('should handle removeAt to empty', () => {
      deque.pushBack(1)
      expect(deque.removeAt(0)).toBe(1)
      expect(deque.isEmpty()).toBe(true)
    })

    it('should handle null/undefined values', () => {
      const d = new CircularDeque<number | null>()
      d.pushBack(null)
      expect(d.peekFront()).toBe(null)
      expect(d.contains(null)).toBe(true)
      expect(d.indexOf(null)).toBe(0)
    })

    it('should handle capacity of 1', () => {
      const d = new CircularDeque<number>({ initialCapacity: 1 })
      d.pushBack(1)
      expect(d.isFull()).toBe(true)
      d.pushBack(2)
      expect(d.size()).toBe(2)
      expect(d.capacity()).toBe(2)
      expect(d.toArray()).toEqual([1, 2])
    })
  })

  describe('large deques', () => {
    it('should handle 10000 pushBack operations', () => {
      for (let i = 0; i < 10000; i++) {
        deque.pushBack(i)
      }
      expect(deque.size()).toBe(10000)
      expect(deque.peekFront()).toBe(0)
      expect(deque.peekBack()).toBe(9999)
    })

    it('should handle 10000 pushFront operations', () => {
      for (let i = 0; i < 10000; i++) {
        deque.pushFront(i)
      }
      expect(deque.size()).toBe(10000)
      expect(deque.peekFront()).toBe(9999)
      expect(deque.peekBack()).toBe(0)
    })

    it('should handle 10000 mixed operations', () => {
      for (let i = 0; i < 5000; i++) {
        deque.pushBack(i)
      }
      for (let i = 0; i < 2500; i++) {
        deque.popFront()
      }
      for (let i = 0; i < 5000; i++) {
        deque.pushFront(i)
      }
      expect(deque.size()).toBe(7500)
    })

    it('should handle large clone', () => {
      for (let i = 0; i < 5000; i++) {
        deque.pushBack(i)
      }
      const cloned = deque.clone()
      expect(cloned.size()).toBe(5000)
      expect(cloned.peekFront()).toBe(0)
      expect(cloned.peekBack()).toBe(4999)
    })

    it('should handle large toArray', () => {
      for (let i = 0; i < 5000; i++) {
        deque.pushBack(i)
      }
      const arr = deque.toArray()
      expect(arr.length).toBe(5000)
      expect(arr[0]).toBe(0)
      expect(arr[4999]).toBe(4999)
    })

    it('should handle large indexOf/lastIndexOf', () => {
      for (let i = 0; i < 5000; i++) {
        deque.pushBack(i % 100)
      }
      expect(deque.indexOf(0)).toBe(0)
      expect(deque.lastIndexOf(0)).toBe(4900)
    })

    it('should handle large rotate', () => {
      for (let i = 0; i < 1000; i++) {
        deque.pushBack(i)
      }
      deque.rotate(500)
      expect(deque.size()).toBe(1000)
      expect(deque.peekFront()).toBe(500)
      expect(deque.peekBack()).toBe(499)
    })
  })

  describe('stats', () => {
    it('should return correct stats for empty deque', () => {
      const s = deque.stats()
      expect(s.capacity).toBe(DEFAULT_CIRCULAR_DEQUE_OPTIONS.initialCapacity)
      expect(s.size).toBe(0)
      expect(s.isEmpty).toBe(true)
      expect(s.isFull).toBe(false)
      expect(s.utilization).toBe(0)
    })

    it('should return correct stats for partially filled deque', () => {
      const d = new CircularDeque<number>({ initialCapacity: 8 })
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      const s = d.stats()
      expect(s.capacity).toBe(8)
      expect(s.size).toBe(3)
      expect(s.isEmpty).toBe(false)
      expect(s.isFull).toBe(false)
      expect(s.utilization).toBe(3 / 8)
    })

    it('should return correct stats for full deque', () => {
      const d = new CircularDeque<number>({ initialCapacity: 3 })
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      const s = d.stats()
      expect(s.capacity).toBe(3)
      expect(s.size).toBe(3)
      expect(s.isEmpty).toBe(false)
      expect(s.isFull).toBe(true)
      expect(s.utilization).toBe(1)
    })

    it('should reflect capacity after resize', () => {
      const d = new CircularDeque<number>({ initialCapacity: 2 })
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      const s = d.stats()
      expect(s.capacity).toBe(4)
      expect(s.size).toBe(3)
      expect(s.isFull).toBe(false)
    })
  })

  describe('mixed push/pop operations', () => {
    it('should handle pushBack then popFront (FIFO queue)', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.popFront()).toBe(1)
      expect(deque.popFront()).toBe(2)
      expect(deque.popFront()).toBe(3)
    })

    it('should handle pushFront then popBack (FIFO queue reversed)', () => {
      deque.pushFront(1)
      deque.pushFront(2)
      deque.pushFront(3)
      expect(deque.popBack()).toBe(1)
      expect(deque.popBack()).toBe(2)
      expect(deque.popBack()).toBe(3)
    })

    it('should handle pushBack then popBack (stack)', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.popBack()).toBe(3)
      expect(deque.popBack()).toBe(2)
      expect(deque.popBack()).toBe(1)
    })

    it('should handle pushFront then popFront (stack reversed)', () => {
      deque.pushFront(1)
      deque.pushFront(2)
      deque.pushFront(3)
      expect(deque.popFront()).toBe(3)
      expect(deque.popFront()).toBe(2)
      expect(deque.popFront()).toBe(1)
    })

    it('should handle mixed direction operations', () => {
      deque.pushBack(1)
      deque.pushFront(0)
      deque.pushBack(2)
      deque.pushFront(-1)
      expect(deque.toArray()).toEqual([-1, 0, 1, 2])
      expect(deque.popFront()).toBe(-1)
      expect(deque.popBack()).toBe(2)
      expect(deque.toArray()).toEqual([0, 1])
    })

    it('should handle many interleaved operations', () => {
      const d = new CircularDeque<number>({ initialCapacity: 4 })
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      d.popFront()
      d.pushBack(4)
      d.popFront()
      d.pushFront(0)
      d.pushBack(5)
      expect(d.toArray()).toEqual([0, 3, 4, 5])
    })

    it('should handle operations after clear and refill', () => {
      deque.pushBack(1)
      deque.pushBack(2)
      deque.clear()
      deque.pushBack(3)
      deque.pushBack(4)
      expect(deque.toArray()).toEqual([3, 4])
    })
  })
})
