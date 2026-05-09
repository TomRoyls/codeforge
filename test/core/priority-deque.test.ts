import { describe, it, expect, beforeEach } from 'vitest'
import { PriorityDeque } from '../../src/core/priority-deque/priority-deque.js'
import { DEFAULT_COMPARE } from '../../src/core/priority-deque/types.js'
import type { CompareFn, PriorityDequeOptions } from '../../src/core/priority-deque/types.js'

describe('PriorityDeque', () => {
  let deque: PriorityDeque<number>

  beforeEach(() => {
    deque = new PriorityDeque<number>()
  })

  describe('constructor', () => {
    it('should create a deque with default comparator', () => {
      const d = new PriorityDeque<number>()
      expect(d.size()).toBe(0)
      expect(d.isEmpty()).toBe(true)
    })

    it('should accept a custom comparator', () => {
      const d = new PriorityDeque<number>((a, b) => b - a)
      d.push(3)
      d.push(1)
      d.push(2)
      expect(d.peekMin()).toBe(3)
      expect(d.peekMax()).toBe(1)
    })

    it('should create a deque with no arguments', () => {
      const d = new PriorityDeque()
      expect(d.size()).toBe(0)
    })
  })

  describe('push', () => {
    it('should add a single element', () => {
      deque.push(5)
      expect(deque.size()).toBe(1)
    })

    it('should add multiple elements', () => {
      deque.push(3)
      deque.push(1)
      deque.push(4)
      expect(deque.size()).toBe(3)
    })

    it('should maintain min element at root', () => {
      deque.push(5)
      deque.push(3)
      deque.push(7)
      deque.push(1)
      expect(deque.peekMin()).toBe(1)
    })

    it('should track max element correctly', () => {
      deque.push(5)
      deque.push(3)
      deque.push(7)
      deque.push(1)
      expect(deque.peekMax()).toBe(7)
    })

    it('should handle duplicate values', () => {
      deque.push(5)
      deque.push(5)
      deque.push(5)
      expect(deque.size()).toBe(3)
      expect(deque.peekMin()).toBe(5)
      expect(deque.peekMax()).toBe(5)
    })

    it('should handle zero', () => {
      deque.push(0)
      expect(deque.peekMin()).toBe(0)
      expect(deque.peekMax()).toBe(0)
    })

    it('should handle negative numbers', () => {
      deque.push(-3)
      deque.push(-1)
      deque.push(-5)
      expect(deque.peekMin()).toBe(-5)
      expect(deque.peekMax()).toBe(-1)
    })

    it('should maintain both min and max with many inserts', () => {
      for (let i = 100; i >= 1; i--) {
        deque.push(i)
      }
      expect(deque.peekMin()).toBe(1)
      expect(deque.peekMax()).toBe(100)
    })

    it('should maintain heap property with two elements', () => {
      deque.push(5)
      deque.push(3)
      expect(deque.peekMin()).toBe(3)
      expect(deque.peekMax()).toBe(5)
    })
  })

  describe('popMin', () => {
    it('should return undefined on empty deque', () => {
      expect(deque.popMin()).toBeUndefined()
    })

    it('should pop the only element', () => {
      deque.push(5)
      expect(deque.popMin()).toBe(5)
      expect(deque.size()).toBe(0)
    })

    it('should pop elements in ascending order', () => {
      deque.push(3)
      deque.push(1)
      deque.push(2)
      expect(deque.popMin()).toBe(1)
      expect(deque.popMin()).toBe(2)
      expect(deque.popMin()).toBe(3)
    })

    it('should maintain max after popping min', () => {
      deque.push(5)
      deque.push(3)
      deque.push(7)
      deque.push(1)
      deque.popMin()
      expect(deque.peekMax()).toBe(7)
    })

    it('should handle popping all elements', () => {
      deque.push(1)
      deque.push(2)
      deque.push(3)
      deque.popMin()
      deque.popMin()
      deque.popMin()
      expect(deque.isEmpty()).toBe(true)
    })

    it('should handle duplicate values', () => {
      deque.push(3)
      deque.push(3)
      deque.push(1)
      expect(deque.popMin()).toBe(1)
      expect(deque.popMin()).toBe(3)
      expect(deque.popMin()).toBe(3)
    })

    it('should sort correctly with many elements', () => {
      const values = [9, 4, 7, 1, 3, 8, 5, 2, 6]
      for (const v of values) {
        deque.push(v)
      }
      const sorted: number[] = []
      while (!deque.isEmpty()) {
        sorted.push(deque.popMin()!)
      }
      expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should update min after pop', () => {
      deque.push(5)
      deque.push(3)
      deque.push(7)
      deque.push(1)
      deque.push(4)
      deque.popMin()
      expect(deque.peekMin()).toBe(3)
    })
  })

  describe('popMax', () => {
    it('should return undefined on empty deque', () => {
      expect(deque.popMax()).toBeUndefined()
    })

    it('should pop the only element', () => {
      deque.push(5)
      expect(deque.popMax()).toBe(5)
      expect(deque.size()).toBe(0)
    })

    it('should pop elements in descending order', () => {
      deque.push(3)
      deque.push(1)
      deque.push(2)
      expect(deque.popMax()).toBe(3)
      expect(deque.popMax()).toBe(2)
      expect(deque.popMax()).toBe(1)
    })

    it('should maintain min after popping max', () => {
      deque.push(5)
      deque.push(3)
      deque.push(7)
      deque.push(1)
      deque.popMax()
      expect(deque.peekMin()).toBe(1)
    })

    it('should handle popping all elements via popMax', () => {
      deque.push(1)
      deque.push(2)
      deque.push(3)
      deque.popMax()
      deque.popMax()
      deque.popMax()
      expect(deque.isEmpty()).toBe(true)
    })

    it('should handle duplicate values on popMax', () => {
      deque.push(3)
      deque.push(3)
      deque.push(1)
      expect(deque.popMax()).toBe(3)
      expect(deque.popMax()).toBe(3)
      expect(deque.popMax()).toBe(1)
    })

    it('should sort descending correctly with many elements', () => {
      const values = [9, 4, 7, 1, 3, 8, 5, 2, 6]
      for (const v of values) {
        deque.push(v)
      }
      const sorted: number[] = []
      while (!deque.isEmpty()) {
        sorted.push(deque.popMax()!)
      }
      expect(sorted).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1])
    })

    it('should update max after pop', () => {
      deque.push(5)
      deque.push(3)
      deque.push(7)
      deque.push(1)
      deque.push(4)
      deque.popMax()
      expect(deque.peekMax()).toBe(5)
    })
  })

  describe('peekMin', () => {
    it('should return undefined on empty deque', () => {
      expect(deque.peekMin()).toBeUndefined()
    })

    it('should return the minimum element', () => {
      deque.push(5)
      deque.push(3)
      deque.push(7)
      expect(deque.peekMin()).toBe(3)
    })

    it('should not remove the element', () => {
      deque.push(5)
      deque.peekMin()
      expect(deque.size()).toBe(1)
    })

    it('should return the same element on repeated peeks', () => {
      deque.push(5)
      expect(deque.peekMin()).toBe(5)
      expect(deque.peekMin()).toBe(5)
      expect(deque.peekMin()).toBe(5)
    })

    it('should return single element as both min and max', () => {
      deque.push(42)
      expect(deque.peekMin()).toBe(42)
      expect(deque.peekMax()).toBe(42)
    })
  })

  describe('peekMax', () => {
    it('should return undefined on empty deque', () => {
      expect(deque.peekMax()).toBeUndefined()
    })

    it('should return the maximum element', () => {
      deque.push(5)
      deque.push(3)
      deque.push(7)
      expect(deque.peekMax()).toBe(7)
    })

    it('should not remove the element', () => {
      deque.push(5)
      deque.peekMax()
      expect(deque.size()).toBe(1)
    })

    it('should return the same element on repeated peeks', () => {
      deque.push(5)
      expect(deque.peekMax()).toBe(5)
      expect(deque.peekMax()).toBe(5)
    })

    it('should return second element when two elements', () => {
      deque.push(3)
      deque.push(7)
      expect(deque.peekMax()).toBe(7)
    })

    it('should return larger child with three elements', () => {
      deque.push(1)
      deque.push(5)
      deque.push(3)
      expect(deque.peekMax()).toBe(5)
    })
  })

  describe('size', () => {
    it('should return 0 for empty deque', () => {
      expect(deque.size()).toBe(0)
    })

    it('should return correct size after pushes', () => {
      deque.push(1)
      deque.push(2)
      deque.push(3)
      expect(deque.size()).toBe(3)
    })

    it('should return correct size after popMin', () => {
      deque.push(1)
      deque.push(2)
      deque.popMin()
      expect(deque.size()).toBe(1)
    })

    it('should return correct size after popMax', () => {
      deque.push(1)
      deque.push(2)
      deque.popMax()
      expect(deque.size()).toBe(1)
    })

    it('should return correct size after clear', () => {
      deque.push(1)
      deque.push(2)
      deque.clear()
      expect(deque.size()).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new deque', () => {
      expect(deque.isEmpty()).toBe(true)
    })

    it('should return false after push', () => {
      deque.push(1)
      expect(deque.isEmpty()).toBe(false)
    })

    it('should return true after popping all elements', () => {
      deque.push(1)
      deque.popMin()
      expect(deque.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      deque.push(1)
      deque.push(2)
      deque.clear()
      expect(deque.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all elements', () => {
      deque.push(1)
      deque.push(2)
      deque.push(3)
      deque.clear()
      expect(deque.size()).toBe(0)
      expect(deque.isEmpty()).toBe(true)
    })

    it('should work on empty deque', () => {
      deque.clear()
      expect(deque.size()).toBe(0)
    })

    it('should allow pushes after clear', () => {
      deque.push(1)
      deque.clear()
      deque.push(2)
      expect(deque.size()).toBe(1)
      expect(deque.peekMin()).toBe(2)
    })

    it('should allow operations after clear', () => {
      deque.push(10)
      deque.push(20)
      deque.clear()
      deque.push(5)
      expect(deque.peekMin()).toBe(5)
      expect(deque.peekMax()).toBe(5)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty deque', () => {
      expect(deque.toArray()).toEqual([])
    })

    it('should return sorted array', () => {
      deque.push(3)
      deque.push(1)
      deque.push(2)
      expect(deque.toArray()).toEqual([1, 2, 3])
    })

    it('should not modify the original deque', () => {
      deque.push(3)
      deque.push(1)
      deque.push(2)
      deque.toArray()
      expect(deque.size()).toBe(3)
      expect(deque.peekMin()).toBe(1)
    })

    it('should handle single element', () => {
      deque.push(5)
      expect(deque.toArray()).toEqual([5])
    })

    it('should return descending with reverse comparator', () => {
      const d = new PriorityDeque<number>((a, b) => b - a)
      d.push(1)
      d.push(3)
      d.push(2)
      expect(d.toArray()).toEqual([3, 2, 1])
    })

    it('should handle many elements', () => {
      for (let i = 10; i >= 1; i--) {
        deque.push(i)
      }
      expect(deque.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })
  })

  describe('contains', () => {
    it('should return false on empty deque', () => {
      expect(deque.contains(1)).toBe(false)
    })

    it('should return true if value exists', () => {
      deque.push(5)
      expect(deque.contains(5)).toBe(true)
    })

    it('should return false if value does not exist', () => {
      deque.push(5)
      expect(deque.contains(3)).toBe(false)
    })

    it('should find values after multiple pushes', () => {
      deque.push(1)
      deque.push(2)
      deque.push(3)
      expect(deque.contains(2)).toBe(true)
    })

    it('should not find values after popMin', () => {
      deque.push(1)
      deque.push(2)
      deque.popMin()
      expect(deque.contains(1)).toBe(false)
    })

    it('should not find values after popMax', () => {
      deque.push(1)
      deque.push(3)
      deque.push(2)
      deque.popMax()
      expect(deque.contains(3)).toBe(false)
    })
  })

  describe('remove', () => {
    it('should remove a value from the deque', () => {
      deque.push(1)
      deque.push(2)
      deque.push(3)
      expect(deque.remove(2)).toBe(true)
      expect(deque.size()).toBe(2)
    })

    it('should return false if value not found', () => {
      deque.push(1)
      deque.push(2)
      expect(deque.remove(99)).toBe(false)
    })

    it('should handle remove on empty deque', () => {
      expect(deque.remove(1)).toBe(false)
    })

    it('should maintain heap property after remove', () => {
      deque.push(5)
      deque.push(3)
      deque.push(7)
      deque.push(1)
      deque.push(4)
      deque.remove(1)
      expect(deque.peekMin()).toBe(3)
    })

    it('should handle removing the minimum', () => {
      deque.push(1)
      deque.push(2)
      deque.push(3)
      deque.remove(1)
      expect(deque.peekMin()).toBe(2)
    })

    it('should handle removing the maximum', () => {
      deque.push(1)
      deque.push(2)
      deque.push(3)
      deque.remove(3)
      expect(deque.peekMax()).toBe(2)
    })

    it('should handle removing the only element', () => {
      deque.push(1)
      deque.remove(1)
      expect(deque.isEmpty()).toBe(true)
    })

    it('should maintain correct order after multiple removes', () => {
      for (let i = 1; i <= 7; i++) deque.push(i)
      deque.remove(7)
      deque.remove(6)
      const sorted: number[] = []
      while (!deque.isEmpty()) {
        sorted.push(deque.popMin()!)
      }
      expect(sorted).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle removing last element in array', () => {
      deque.push(1)
      deque.push(2)
      deque.push(3)
      const last = deque.toArray()[2]!
      expect(deque.remove(last)).toBe(true)
    })
  })

  describe('update', () => {
    it('should update a value and maintain heap property', () => {
      deque.push(5)
      deque.push(3)
      deque.push(7)
      expect(deque.update(5, 1)).toBe(true)
      expect(deque.peekMin()).toBe(1)
    })

    it('should return false if value not found', () => {
      deque.push(1)
      deque.push(2)
      expect(deque.update(99, 0)).toBe(false)
    })

    it('should handle update on empty deque', () => {
      expect(deque.update(1, 2)).toBe(false)
    })

    it('should update max correctly', () => {
      deque.push(1)
      deque.push(3)
      deque.push(5)
      deque.update(1, 10)
      expect(deque.peekMax()).toBe(10)
    })

    it('should update min correctly', () => {
      deque.push(1)
      deque.push(3)
      deque.push(5)
      deque.update(5, 0)
      expect(deque.peekMin()).toBe(0)
    })

    it('should update the correct element', () => {
      deque.push(1)
      deque.push(5)
      deque.push(3)
      deque.update(5, 0)
      expect(deque.peekMin()).toBe(0)
      expect(deque.size()).toBe(3)
    })

    it('should handle update to same value', () => {
      deque.push(1)
      deque.push(2)
      deque.push(3)
      expect(deque.update(2, 2)).toBe(true)
      expect(deque.size()).toBe(3)
    })

    it('should handle update with custom comparator', () => {
      const d = new PriorityDeque<number>((a, b) => b - a)
      d.push(1)
      d.push(3)
      d.push(5)
      d.update(1, 10)
      expect(d.peekMin()).toBe(10)
    })
  })

  describe('merge', () => {
    it('should merge two deques into a new one', () => {
      deque.push(1)
      deque.push(3)
      const other = new PriorityDeque<number>()
      other.push(2)
      other.push(4)
      const merged = deque.merge(other)
      expect(merged.size()).toBe(4)
      expect(merged.peekMin()).toBe(1)
      expect(merged.peekMax()).toBe(4)
    })

    it('should merge with empty deque', () => {
      deque.push(1)
      deque.push(2)
      const other = new PriorityDeque<number>()
      const merged = deque.merge(other)
      expect(merged.size()).toBe(2)
    })

    it('should merge into empty deque', () => {
      const other = new PriorityDeque<number>()
      other.push(1)
      other.push(2)
      const merged = deque.merge(other)
      expect(merged.size()).toBe(2)
    })

    it('should merge two empty deques', () => {
      const other = new PriorityDeque<number>()
      const merged = deque.merge(other)
      expect(merged.size()).toBe(0)
    })

    it('should not modify original deques', () => {
      deque.push(1)
      const other = new PriorityDeque<number>()
      other.push(2)
      deque.merge(other)
      expect(deque.size()).toBe(1)
      expect(other.size()).toBe(1)
    })

    it('should maintain heap property after merge', () => {
      deque.push(5)
      deque.push(1)
      const other = new PriorityDeque<number>()
      other.push(3)
      other.push(2)
      other.push(4)
      const merged = deque.merge(other)
      const sorted: number[] = []
      while (!merged.isEmpty()) {
        sorted.push(merged.popMin()!)
      }
      expect(sorted).toEqual([1, 2, 3, 4, 5])
    })

    it('should return a new PriorityDeque instance', () => {
      deque.push(1)
      const other = new PriorityDeque<number>()
      other.push(2)
      const merged = deque.merge(other)
      expect(merged).not.toBe(deque)
      expect(merged).not.toBe(other)
    })
  })

  describe('clone', () => {
    it('should create an independent copy', () => {
      deque.push(1)
      deque.push(2)
      deque.push(3)
      const cloned = deque.clone()
      expect(cloned.size()).toBe(3)
      expect(cloned.peekMin()).toBe(1)
      expect(cloned.peekMax()).toBe(3)
    })

    it('should not affect original when modified', () => {
      deque.push(1)
      deque.push(2)
      const cloned = deque.clone()
      cloned.popMin()
      expect(deque.size()).toBe(2)
      expect(cloned.size()).toBe(1)
    })

    it('should clone an empty deque', () => {
      const cloned = deque.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should preserve comparator', () => {
      const d = new PriorityDeque<number>((a, b) => b - a)
      d.push(1)
      d.push(2)
      d.push(3)
      const cloned = d.clone()
      expect(cloned.peekMin()).toBe(3)
      expect(cloned.peekMax()).toBe(1)
    })
  })

  describe('drain', () => {
    it('should return all elements in sorted order', () => {
      deque.push(3)
      deque.push(1)
      deque.push(2)
      expect(deque.drain()).toEqual([1, 2, 3])
    })

    it('should empty the deque', () => {
      deque.push(1)
      deque.push(2)
      deque.push(3)
      deque.drain()
      expect(deque.isEmpty()).toBe(true)
    })

    it('should return empty array for empty deque', () => {
      expect(deque.drain()).toEqual([])
    })

    it('should handle single element', () => {
      expect(deque.drain()).toEqual([])
      deque.push(42)
      expect(deque.drain()).toEqual([42])
    })
  })

  describe('forEach', () => {
    it('should iterate over all elements', () => {
      deque.push(1)
      deque.push(2)
      deque.push(3)
      const values: number[] = []
      deque.forEach((v) => values.push(v))
      expect(values.length).toBe(3)
    })

    it('should provide correct index', () => {
      deque.push(10)
      deque.push(20)
      deque.push(30)
      const indices: number[] = []
      deque.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should work on empty deque', () => {
      let count = 0
      deque.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should iterate over all pushed values', () => {
      deque.push(1)
      deque.push(2)
      deque.push(3)
      const values: number[] = []
      deque.forEach((v) => values.push(v))
      expect(values).toContain(1)
      expect(values).toContain(2)
      expect(values).toContain(3)
    })
  })

  describe('Symbol.iterator', () => {
    it('should be iterable', () => {
      deque.push(1)
      deque.push(2)
      deque.push(3)
      const values: number[] = []
      for (const v of deque) {
        values.push(v)
      }
      expect(values.length).toBe(3)
    })

    it('should work with spread operator', () => {
      deque.push(1)
      deque.push(2)
      const values = [...deque]
      expect(values.length).toBe(2)
    })

    it('should work on empty deque', () => {
      const values = [...deque]
      expect(values).toEqual([])
    })

    it('should not modify the deque', () => {
      deque.push(1)
      deque.push(2)
      for (const _v of deque) {
        void _v
      }
      expect(deque.size()).toBe(2)
    })
  })

  describe('static fromArray', () => {
    it('should create a deque from an array', () => {
      const d = PriorityDeque.fromArray([3, 1, 4, 1, 5, 9, 2, 6])
      expect(d.size()).toBe(8)
      expect(d.peekMin()).toBe(1)
      expect(d.peekMax()).toBe(9)
    })

    it('should handle empty array', () => {
      const d = PriorityDeque.fromArray([])
      expect(d.size()).toBe(0)
      expect(d.isEmpty()).toBe(true)
    })

    it('should handle single element array', () => {
      const d = PriorityDeque.fromArray([42])
      expect(d.size()).toBe(1)
      expect(d.peekMin()).toBe(42)
    })

    it('should accept a custom comparator', () => {
      const d = PriorityDeque.fromArray([3, 1, 4, 1, 5], (a, b) => b - a)
      expect(d.peekMin()).toBe(5)
      expect(d.peekMax()).toBe(1)
    })

    it('should produce valid sorted output', () => {
      const d = PriorityDeque.fromArray([9, 4, 7, 1, 3, 8, 5, 2, 6])
      const sorted: number[] = []
      while (!d.isEmpty()) {
        sorted.push(d.popMin()!)
      }
      expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should handle array with all equal elements', () => {
      const d = PriorityDeque.fromArray([5, 5, 5, 5])
      expect(d.size()).toBe(4)
      expect(d.peekMin()).toBe(5)
      expect(d.peekMax()).toBe(5)
    })

    it('should handle already sorted array', () => {
      const d = PriorityDeque.fromArray([1, 2, 3, 4, 5])
      expect(d.peekMin()).toBe(1)
      expect(d.peekMax()).toBe(5)
    })

    it('should handle reverse sorted array', () => {
      const d = PriorityDeque.fromArray([5, 4, 3, 2, 1])
      expect(d.peekMin()).toBe(1)
      expect(d.peekMax()).toBe(5)
    })
  })

  describe('mixed popMin and popMax', () => {
    it('should correctly alternate popMin and popMax', () => {
      deque.push(1)
      deque.push(2)
      deque.push(3)
      deque.push(4)
      deque.push(5)
      expect(deque.popMin()).toBe(1)
      expect(deque.popMax()).toBe(5)
      expect(deque.popMin()).toBe(2)
      expect(deque.popMax()).toBe(4)
      expect(deque.popMin()).toBe(3)
      expect(deque.isEmpty()).toBe(true)
    })

    it('should handle interleaved operations', () => {
      deque.push(10)
      deque.push(20)
      deque.push(30)
      expect(deque.popMin()).toBe(10)
      deque.push(5)
      expect(deque.popMin()).toBe(5)
      expect(deque.popMax()).toBe(30)
      expect(deque.peekMin()).toBe(20)
      expect(deque.peekMax()).toBe(20)
    })

    it('should handle push after pops', () => {
      deque.push(3)
      deque.push(1)
      deque.push(2)
      deque.popMin()
      deque.push(0)
      expect(deque.peekMin()).toBe(0)
      expect(deque.peekMax()).toBe(3)
    })
  })

  describe('string values', () => {
    it('should work with string values', () => {
      const d = new PriorityDeque<string>((a, b) => a.localeCompare(b))
      d.push('cherry')
      d.push('apple')
      d.push('banana')
      expect(d.peekMin()).toBe('apple')
      expect(d.peekMax()).toBe('cherry')
    })

    it('should pop strings in order', () => {
      const d = new PriorityDeque<string>((a, b) => a.localeCompare(b))
      d.push('cherry')
      d.push('apple')
      d.push('banana')
      expect(d.popMin()).toBe('apple')
      expect(d.popMin()).toBe('banana')
      expect(d.popMin()).toBe('cherry')
    })
  })

  describe('object values', () => {
    it('should work with object values using custom comparator', () => {
      interface Item {
        priority: number
        name: string
      }
      const d = new PriorityDeque<Item>((a, b) => a.priority - b.priority)
      d.push({ priority: 3, name: 'low' })
      d.push({ priority: 1, name: 'high' })
      d.push({ priority: 2, name: 'medium' })
      expect(d.peekMin()!.name).toBe('high')
      expect(d.peekMax()!.name).toBe('low')
    })
  })

  describe('edge cases', () => {
    it('should handle large number of elements', () => {
      const n = 1000
      for (let i = n; i >= 1; i--) {
        deque.push(i)
      }
      expect(deque.peekMin()).toBe(1)
      expect(deque.peekMax()).toBe(n)
      for (let i = 1; i <= n; i++) {
        expect(deque.popMin()).toBe(i)
      }
      expect(deque.isEmpty()).toBe(true)
    })

    it('should handle large number of elements with popMax', () => {
      const n = 1000
      for (let i = 1; i <= n; i++) {
        deque.push(i)
      }
      for (let i = n; i >= 1; i--) {
        expect(deque.popMax()).toBe(i)
      }
      expect(deque.isEmpty()).toBe(true)
    })

    it('should handle alternating push and popMin', () => {
      deque.push(5)
      expect(deque.popMin()).toBe(5)
      deque.push(3)
      deque.push(7)
      expect(deque.popMin()).toBe(3)
      expect(deque.popMin()).toBe(7)
      expect(deque.isEmpty()).toBe(true)
    })

    it('should handle fromArray then popMin all', () => {
      const d = PriorityDeque.fromArray([5, 3, 1, 4, 2])
      const sorted: number[] = []
      while (!d.isEmpty()) {
        sorted.push(d.popMin()!)
      }
      expect(sorted).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle fromArray then popMax all', () => {
      const d = PriorityDeque.fromArray([5, 3, 1, 4, 2])
      const sorted: number[] = []
      while (!d.isEmpty()) {
        sorted.push(d.popMax()!)
      }
      expect(sorted).toEqual([5, 4, 3, 2, 1])
    })

    it('should handle merge then extract all', () => {
      deque.push(5)
      deque.push(1)
      const other = new PriorityDeque<number>()
      other.push(3)
      other.push(2)
      other.push(4)
      const merged = deque.merge(other)
      const sorted: number[] = []
      while (!merged.isEmpty()) {
        sorted.push(merged.popMin()!)
      }
      expect(sorted).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle remove after fromArray', () => {
      const d = PriorityDeque.fromArray([5, 3, 1, 4, 2])
      d.remove(1)
      expect(d.peekMin()).toBe(2)
    })

    it('should handle update after fromArray', () => {
      const d = PriorityDeque.fromArray([5, 3, 7])
      d.update(7, 0)
      expect(d.peekMin()).toBe(0)
    })

    it('should handle contains after fromArray', () => {
      const d = PriorityDeque.fromArray([5, 3, 1, 4, 2])
      expect(d.contains(3)).toBe(true)
      expect(d.contains(99)).toBe(false)
    })

    it('should handle forEach after clear and re-push', () => {
      deque.push(1)
      deque.clear()
      deque.push(2)
      deque.push(3)
      const values: number[] = []
      deque.forEach((v) => values.push(v))
      expect(values.length).toBe(2)
    })

    it('should handle two elements correctly', () => {
      deque.push(1)
      deque.push(2)
      expect(deque.peekMin()).toBe(1)
      expect(deque.peekMax()).toBe(2)
      expect(deque.popMin()).toBe(1)
      expect(deque.popMax()).toBe(2)
    })

    it('should handle two elements in reverse order', () => {
      deque.push(2)
      deque.push(1)
      expect(deque.peekMin()).toBe(1)
      expect(deque.peekMax()).toBe(2)
    })
  })

  describe('DEFAULT_COMPARE', () => {
    it('should have a default compare function', () => {
      expect(typeof DEFAULT_COMPARE).toBe('function')
      expect(DEFAULT_COMPARE(1, 2)).toBe(-1)
      expect(DEFAULT_COMPARE(2, 1)).toBe(1)
      expect(DEFAULT_COMPARE(1, 1)).toBe(0)
    })
  })

  describe('type exports', () => {
    it('should export CompareFn type', () => {
      const fn: CompareFn<number> = (a, b) => a - b
      expect(fn(1, 2)).toBe(-1)
    })

    it('should export PriorityDequeOptions type', () => {
      const opts: PriorityDequeOptions<number> = { compare: (a, b) => a - b }
      expect(typeof opts.compare).toBe('function')
    })
  })

  describe('min-max heap correctness', () => {
    it('should correctly handle a known tricky sequence', () => {
      const values = [8, 3, 10, 1, 6, 14, 4, 2, 7, 9, 5, 11, 12, 13]
      for (const v of values) {
        deque.push(v)
      }
      expect(deque.peekMin()).toBe(1)
      expect(deque.peekMax()).toBe(14)
      const sortedAsc: number[] = []
      while (!deque.isEmpty()) {
        sortedAsc.push(deque.popMin()!)
      }
      expect(sortedAsc).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])
    })

    it('should correctly handle alternating min max pops', () => {
      for (let i = 1; i <= 10; i++) {
        deque.push(i)
      }
      expect(deque.popMin()).toBe(1)
      expect(deque.popMax()).toBe(10)
      expect(deque.popMin()).toBe(2)
      expect(deque.popMax()).toBe(9)
      expect(deque.popMin()).toBe(3)
      expect(deque.popMax()).toBe(8)
      expect(deque.popMin()).toBe(4)
      expect(deque.popMax()).toBe(7)
      expect(deque.popMin()).toBe(5)
      expect(deque.popMax()).toBe(6)
      expect(deque.isEmpty()).toBe(true)
    })

    it('should handle repeated fromArray and operations', () => {
      const d = PriorityDeque.fromArray([10, 20, 30, 40, 50])
      expect(d.popMin()).toBe(10)
      d.push(5)
      expect(d.peekMin()).toBe(5)
      expect(d.popMax()).toBe(50)
      d.push(100)
      expect(d.peekMax()).toBe(100)
    })

    it('should handle delete then push cycles', () => {
      for (let i = 1; i <= 5; i++) deque.push(i)
      deque.remove(3)
      deque.push(0)
      expect(deque.peekMin()).toBe(0)
      expect(deque.peekMax()).toBe(5)
    })

    it('should handle removing all elements one by one', () => {
      for (let i = 1; i <= 5; i++) deque.push(i)
      deque.remove(3)
      deque.remove(1)
      deque.remove(5)
      deque.remove(2)
      deque.remove(4)
      expect(deque.isEmpty()).toBe(true)
    })

    it('should handle push after removing all', () => {
      deque.push(1)
      deque.push(2)
      deque.remove(1)
      deque.remove(2)
      expect(deque.isEmpty()).toBe(true)
      deque.push(3)
      expect(deque.peekMin()).toBe(3)
      expect(deque.peekMax()).toBe(3)
    })

    it('should handle large dataset with mixed min-max operations', () => {
      for (let i = 1; i <= 50; i++) deque.push(i)
      for (let i = 1; i <= 25; i++) {
        expect(deque.popMin()).toBe(i)
      }
      for (let i = 50; i >= 26; i--) {
        expect(deque.popMax()).toBe(i)
      }
      expect(deque.isEmpty()).toBe(true)
    })
  })
})
