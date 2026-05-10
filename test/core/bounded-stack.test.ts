import { describe, it, expect, beforeEach } from 'vitest'
import { BoundedStack } from '../../src/core/bounded-stack/bounded-stack.js'
import { DEFAULT_BOUNDED_STACK_OPTIONS } from '../../src/core/bounded-stack/types.js'
import type { BoundedStackOptions, BoundedStackStats } from '../../src/core/bounded-stack/types.js'

describe('BoundedStack', () => {
  describe('construction', () => {
    it('should create stack with default options', () => {
      const s = new BoundedStack<number>()
      expect(s.capacity).toBe(DEFAULT_BOUNDED_STACK_OPTIONS.capacity)
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
      expect(s.isFull()).toBe(false)
    })

    it('should create stack with custom capacity', () => {
      const s = new BoundedStack<number>({ capacity: 10 })
      expect(s.capacity).toBe(10)
    })

    it('should clamp capacity to minimum 1', () => {
      const s = new BoundedStack<number>({ capacity: 0 })
      expect(s.capacity).toBe(1)
    })

    it('should clamp negative capacity to 1', () => {
      const s = new BoundedStack<number>({ capacity: -5 })
      expect(s.capacity).toBe(1)
    })

    it('should start with zero stats', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      const st = s.stats()
      expect(st.totalPushed).toBe(0)
      expect(st.totalPopped).toBe(0)
      expect(st.totalEvicted).toBe(0)
    })

    it('should start with empty toArray', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      expect(s.toArray()).toEqual([])
    })

    it('should accept no options argument', () => {
      const s = new BoundedStack<string>()
      expect(s.capacity).toBe(DEFAULT_BOUNDED_STACK_OPTIONS.capacity)
      expect(s.size).toBe(0)
    })
  })

  describe('push', () => {
    let s: BoundedStack<number>

    beforeEach(() => {
      s = new BoundedStack<number>({ capacity: 3 })
    })

    it('should push a single item', () => {
      s.push(1)
      expect(s.size).toBe(1)
    })

    it('should push multiple items', () => {
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.size).toBe(3)
    })

    it('should return undefined when not full', () => {
      expect(s.push(1)).toBeUndefined()
    })

    it('should evict bottom element when full', () => {
      s.push(1)
      s.push(2)
      s.push(3)
      const evicted = s.push(4)
      expect(evicted).toBe(1)
    })

    it('should evict in FIFO order from bottom', () => {
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.push(4)).toBe(1)
      expect(s.push(5)).toBe(2)
    })

    it('should maintain correct size after eviction', () => {
      s.push(1)
      s.push(2)
      s.push(3)
      s.push(4)
      expect(s.size).toBe(3)
    })

    it('should update totalPushed', () => {
      s.push(1)
      s.push(2)
      expect(s.stats().totalPushed).toBe(2)
    })

    it('should update totalEvicted', () => {
      s.push(1)
      s.push(2)
      s.push(3)
      s.push(4)
      expect(s.stats().totalEvicted).toBe(1)
    })

    it('should handle rapid push cycle', () => {
      for (let i = 0; i < 100; i++) {
        s.push(i)
      }
      expect(s.size).toBe(3)
      expect(s.toArray()).toEqual([97, 98, 99])
    })

    it('should maintain correct top after eviction', () => {
      s.push(1)
      s.push(2)
      s.push(3)
      s.push(4)
      expect(s.peek()).toBe(4)
    })

    it('should maintain correct bottom after eviction', () => {
      s.push(1)
      s.push(2)
      s.push(3)
      s.push(4)
      expect(s.peekBottom()).toBe(2)
    })

    it('should handle pushing after pop', () => {
      s.push(1)
      s.push(2)
      s.push(3)
      s.pop()
      s.push(4)
      expect(s.toArray()).toEqual([1, 2, 4])
      expect(s.size).toBe(3)
    })
  })

  describe('pop', () => {
    let s: BoundedStack<number>

    beforeEach(() => {
      s = new BoundedStack<number>({ capacity: 5 })
    })

    it('should return undefined on empty stack', () => {
      expect(s.pop()).toBeUndefined()
    })

    it('should pop the top element', () => {
      s.push(1)
      s.push(2)
      expect(s.pop()).toBe(2)
    })

    it('should pop in LIFO order', () => {
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.pop()).toBe(3)
      expect(s.pop()).toBe(2)
      expect(s.pop()).toBe(1)
    })

    it('should decrease size', () => {
      s.push(1)
      s.push(2)
      s.pop()
      expect(s.size).toBe(1)
    })

    it('should update totalPopped', () => {
      s.push(1)
      s.push(2)
      s.pop()
      expect(s.stats().totalPopped).toBe(1)
    })

    it('should return undefined on multiple pops past empty', () => {
      s.push(1)
      s.pop()
      expect(s.pop()).toBeUndefined()
      expect(s.pop()).toBeUndefined()
    })

    it('should allow push after popping all', () => {
      s.push(1)
      s.push(2)
      s.pop()
      s.pop()
      expect(s.isEmpty()).toBe(true)
      s.push(3)
      expect(s.size).toBe(1)
      expect(s.peek()).toBe(3)
    })
  })

  describe('peek', () => {
    it('should return undefined on empty stack', () => {
      const s = new BoundedStack<number>({ capacity: 3 })
      expect(s.peek()).toBeUndefined()
    })

    it('should return top of stack', () => {
      const s = new BoundedStack<number>({ capacity: 3 })
      s.push(1)
      s.push(2)
      expect(s.peek()).toBe(2)
    })

    it('should not remove element on peek', () => {
      const s = new BoundedStack<number>({ capacity: 3 })
      s.push(1)
      s.peek()
      expect(s.size).toBe(1)
    })

    it('should return the last pushed element', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(10)
      s.push(20)
      s.push(30)
      expect(s.peek()).toBe(30)
    })

    it('should update after pop', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.push(3)
      s.pop()
      expect(s.peek()).toBe(2)
    })

    it('should return undefined after clearing', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.clear()
      expect(s.peek()).toBeUndefined()
    })
  })

  describe('peekBottom', () => {
    it('should return undefined on empty stack', () => {
      const s = new BoundedStack<number>({ capacity: 3 })
      expect(s.peekBottom()).toBeUndefined()
    })

    it('should return bottom of stack', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.peekBottom()).toBe(1)
    })

    it('should not remove element on peekBottom', () => {
      const s = new BoundedStack<number>({ capacity: 3 })
      s.push(1)
      s.peekBottom()
      expect(s.size).toBe(1)
    })

    it('should update after eviction', () => {
      const s = new BoundedStack<number>({ capacity: 3 })
      s.push(1)
      s.push(2)
      s.push(3)
      s.push(4)
      expect(s.peekBottom()).toBe(2)
    })

    it('should return same as peek when size is 1', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(42)
      expect(s.peek()).toBe(42)
      expect(s.peekBottom()).toBe(42)
    })
  })

  describe('size', () => {
    it('should track size through operations', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      expect(s.size).toBe(0)
      s.push(1)
      expect(s.size).toBe(1)
      s.push(2)
      expect(s.size).toBe(2)
      s.pop()
      expect(s.size).toBe(1)
    })

    it('should stay at capacity when pushing past full', () => {
      const s = new BoundedStack<number>({ capacity: 2 })
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.size).toBe(2)
    })

    it('should be 0 after clearing', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.clear()
      expect(s.size).toBe(0)
    })
  })

  describe('capacity', () => {
    it('should return configured capacity', () => {
      const s = new BoundedStack<number>({ capacity: 10 })
      expect(s.capacity).toBe(10)
    })

    it('should return default capacity', () => {
      const s = new BoundedStack<number>()
      expect(s.capacity).toBe(DEFAULT_BOUNDED_STACK_OPTIONS.capacity)
    })

    it('should remain constant through operations', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.push(3)
      s.pop()
      expect(s.capacity).toBe(5)
    })
  })

  describe('isEmpty', () => {
    it('should be true on new stack', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      expect(s.isEmpty()).toBe(true)
    })

    it('should be false after push', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      expect(s.isEmpty()).toBe(false)
    })

    it('should be true after popping all', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.pop()
      expect(s.isEmpty()).toBe(true)
    })

    it('should be true after clear', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.clear()
      expect(s.isEmpty()).toBe(true)
    })
  })

  describe('isFull', () => {
    it('should be false when empty', () => {
      const s = new BoundedStack<number>({ capacity: 2 })
      expect(s.isFull()).toBe(false)
    })

    it('should be true when full', () => {
      const s = new BoundedStack<number>({ capacity: 2 })
      s.push(1)
      s.push(2)
      expect(s.isFull()).toBe(true)
    })

    it('should be false after pop from full', () => {
      const s = new BoundedStack<number>({ capacity: 2 })
      s.push(1)
      s.push(2)
      s.pop()
      expect(s.isFull()).toBe(false)
    })

    it('should remain full when pushing past capacity', () => {
      const s = new BoundedStack<number>({ capacity: 2 })
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.isFull()).toBe(true)
    })

    it('should be false after clear', () => {
      const s = new BoundedStack<number>({ capacity: 2 })
      s.push(1)
      s.push(2)
      s.clear()
      expect(s.isFull()).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear the stack', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.push(3)
      s.clear()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should allow push after clear', () => {
      const s = new BoundedStack<number>({ capacity: 2 })
      s.push(1)
      s.push(2)
      s.clear()
      s.push(3)
      expect(s.size).toBe(1)
      expect(s.peek()).toBe(3)
    })

    it('should clear empty stack without error', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.clear()
      expect(s.size).toBe(0)
    })

    it('should not affect capacity', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.clear()
      expect(s.capacity).toBe(5)
    })

    it('should result in empty toArray', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.clear()
      expect(s.toArray()).toEqual([])
    })
  })

  describe('clone', () => {
    it('should clone the stack', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.push(3)
      const c = s.clone()
      expect(c.toArray()).toEqual([1, 2, 3])
      expect(c.capacity).toBe(5)
    })

    it('should not affect original on clone modification', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      const c = s.clone()
      c.push(3)
      expect(s.size).toBe(2)
      expect(c.size).toBe(3)
    })

    it('should clone empty stack', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      const c = s.clone()
      expect(c.size).toBe(0)
      expect(c.isEmpty()).toBe(true)
    })

    it('should preserve capacity in clone', () => {
      const s = new BoundedStack<number>({ capacity: 10 })
      s.push(1)
      const c = s.clone()
      expect(c.capacity).toBe(10)
    })

    it('should clone stack with evicted items', () => {
      const s = new BoundedStack<number>({ capacity: 3 })
      s.push(1)
      s.push(2)
      s.push(3)
      s.push(4)
      const c = s.clone()
      expect(c.toArray()).toEqual([2, 3, 4])
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty stack', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      expect(s.toArray()).toEqual([])
    })

    it('should return items in stack order (bottom to top)', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('should return a copy', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      const arr = s.toArray()
      arr.push(99)
      expect(s.size).toBe(1)
    })

    it('should reflect state after eviction', () => {
      const s = new BoundedStack<number>({ capacity: 3 })
      s.push(1)
      s.push(2)
      s.push(3)
      s.push(4)
      expect(s.toArray()).toEqual([2, 3, 4])
    })

    it('should reflect state after pop', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.push(3)
      s.pop()
      expect(s.toArray()).toEqual([1, 2])
    })
  })

  describe('from factory', () => {
    it('should create from array', () => {
      const s = BoundedStack.from([1, 2, 3], { capacity: 10 })
      expect(s.size).toBe(3)
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('should evict when items exceed capacity', () => {
      const s = BoundedStack.from([1, 2, 3, 4, 5], { capacity: 3 })
      expect(s.size).toBe(3)
      expect(s.toArray()).toEqual([3, 4, 5])
    })

    it('should create from empty array', () => {
      const s = BoundedStack.from([], { capacity: 5 })
      expect(s.size).toBe(0)
    })

    it('should use default options when none provided', () => {
      const s = BoundedStack.from([1, 2, 3])
      expect(s.capacity).toBe(DEFAULT_BOUNDED_STACK_OPTIONS.capacity)
    })

    it('should accept a set as iterable', () => {
      const s = BoundedStack.from(new Set([1, 2, 3]), { capacity: 10 })
      expect(s.size).toBe(3)
    })

    it('should accept a generator', () => {
      function* gen() {
        yield 1
        yield 2
        yield 3
      }
      const s = BoundedStack.from(gen(), { capacity: 10 })
      expect(s.size).toBe(3)
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('should handle single item iterable', () => {
      const s = BoundedStack.from([42], { capacity: 5 })
      expect(s.size).toBe(1)
      expect(s.peek()).toBe(42)
    })
  })

  describe('contains', () => {
    it('should return false for empty stack', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      expect(s.contains(1)).toBe(false)
    })

    it('should return true if element exists', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      expect(s.contains(1)).toBe(true)
      expect(s.contains(2)).toBe(true)
    })

    it('should return false if element does not exist', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      expect(s.contains(99)).toBe(false)
    })

    it('should not find evicted elements', () => {
      const s = new BoundedStack<number>({ capacity: 2 })
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.contains(1)).toBe(false)
      expect(s.contains(2)).toBe(true)
      expect(s.contains(3)).toBe(true)
    })

    it('should work with object references', () => {
      const s = new BoundedStack<{ id: number }>({ capacity: 5 })
      const obj = { id: 1 }
      s.push(obj)
      expect(s.contains(obj)).toBe(true)
      expect(s.contains({ id: 1 })).toBe(false)
    })

    it('should work with string values', () => {
      const s = new BoundedStack<string>({ capacity: 5 })
      s.push('a')
      s.push('b')
      expect(s.contains('a')).toBe(true)
      expect(s.contains('c')).toBe(false)
    })
  })

  describe('indexOf', () => {
    it('should return -1 for empty stack', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      expect(s.indexOf(1)).toBe(-1)
    })

    it('should return 0 for top element', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.indexOf(3)).toBe(0)
    })

    it('should return correct index for middle element', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.indexOf(2)).toBe(1)
    })

    it('should return correct index for bottom element', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.indexOf(1)).toBe(2)
    })

    it('should return -1 for non-existent element', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      expect(s.indexOf(99)).toBe(-1)
    })

    it('should return 0 for single element stack', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(42)
      expect(s.indexOf(42)).toBe(0)
    })

    it('should find index after eviction', () => {
      const s = new BoundedStack<number>({ capacity: 3 })
      s.push(1)
      s.push(2)
      s.push(3)
      s.push(4)
      expect(s.indexOf(2)).toBe(2)
      expect(s.indexOf(3)).toBe(1)
      expect(s.indexOf(4)).toBe(0)
    })

    it('should work with duplicate values', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.push(1)
      expect(s.indexOf(1)).toBe(0)
    })

    it('should work with object references', () => {
      const s = new BoundedStack<{ id: number }>({ capacity: 5 })
      const obj = { id: 1 }
      s.push(obj)
      expect(s.indexOf(obj)).toBe(0)
    })

    it('should return -1 for equal but not same reference', () => {
      const s = new BoundedStack<{ id: number }>({ capacity: 5 })
      s.push({ id: 1 })
      expect(s.indexOf({ id: 1 })).toBe(-1)
    })
  })

  describe('edge cases - capacity 1', () => {
    it('should hold single element', () => {
      const s = new BoundedStack<number>({ capacity: 1 })
      expect(s.push(1)).toBeUndefined()
      expect(s.isFull()).toBe(true)
    })

    it('should evict on second push', () => {
      const s = new BoundedStack<number>({ capacity: 1 })
      s.push(1)
      expect(s.push(2)).toBe(1)
      expect(s.size).toBe(1)
      expect(s.peek()).toBe(2)
    })

    it('should pop single element', () => {
      const s = new BoundedStack<number>({ capacity: 1 })
      s.push(1)
      expect(s.pop()).toBe(1)
      expect(s.isEmpty()).toBe(true)
    })

    it('should handle push after pop on capacity 1', () => {
      const s = new BoundedStack<number>({ capacity: 1 })
      s.push(1)
      s.pop()
      s.push(2)
      expect(s.peek()).toBe(2)
      expect(s.size).toBe(1)
    })

    it('peek and peekBottom should be same on capacity 1', () => {
      const s = new BoundedStack<number>({ capacity: 1 })
      s.push(42)
      expect(s.peek()).toBe(42)
      expect(s.peekBottom()).toBe(42)
    })

    it('should handle rapid push/eviction cycle on capacity 1', () => {
      const s = new BoundedStack<number>({ capacity: 1 })
      for (let i = 0; i < 100; i++) {
        s.push(i)
      }
      expect(s.size).toBe(1)
      expect(s.peek()).toBe(99)
    })
  })

  describe('edge cases - empty stack pop', () => {
    it('should return undefined on empty pop', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      expect(s.pop()).toBeUndefined()
    })

    it('should return undefined after clearing and popping', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.clear()
      expect(s.pop()).toBeUndefined()
    })

    it('should not change size on empty pop', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.pop()
      expect(s.size).toBe(0)
    })

    it('should not update totalPopped on empty pop', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.pop()
      expect(s.stats().totalPopped).toBe(0)
    })
  })

  describe('edge cases - fill and overflow cycle', () => {
    it('should handle fill-evict-fill cycle', () => {
      const s = new BoundedStack<number>({ capacity: 3 })
      s.push(1)
      s.push(2)
      s.push(3)
      s.push(4)
      s.push(5)
      s.push(6)
      expect(s.toArray()).toEqual([4, 5, 6])
      expect(s.size).toBe(3)
    })

    it('should handle alternating push/pop', () => {
      const s = new BoundedStack<number>({ capacity: 3 })
      s.push(1)
      s.push(2)
      s.pop()
      s.push(3)
      s.push(4)
      s.pop()
      s.push(5)
      expect(s.toArray()).toEqual([1, 3, 5])
    })

    it('should handle double overflow', () => {
      const s = new BoundedStack<number>({ capacity: 2 })
      s.push(1)
      s.push(2)
      s.push(3)
      s.push(4)
      expect(s.toArray()).toEqual([3, 4])
      expect(s.stats().totalEvicted).toBe(2)
    })

    it('should handle push-pop-push to fill', () => {
      const s = new BoundedStack<number>({ capacity: 2 })
      s.push(1)
      s.push(2)
      s.pop()
      s.pop()
      s.push(3)
      s.push(4)
      expect(s.isFull()).toBe(true)
      expect(s.toArray()).toEqual([3, 4])
    })
  })

  describe('large stacks', () => {
    it('should handle 10000 items', () => {
      const s = new BoundedStack<number>({ capacity: 10000 })
      for (let i = 0; i < 10000; i++) {
        s.push(i)
      }
      expect(s.size).toBe(10000)
      expect(s.isFull()).toBe(true)
      expect(s.peek()).toBe(9999)
      expect(s.peekBottom()).toBe(0)
    })

    it('should evict from 10000 capacity', () => {
      const s = new BoundedStack<number>({ capacity: 10000 })
      for (let i = 0; i < 10000; i++) {
        s.push(i)
      }
      const evicted = s.push(10000)
      expect(evicted).toBe(0)
      expect(s.size).toBe(10000)
    })

    it('should handle overflow on 10000 capacity', () => {
      const s = new BoundedStack<number>({ capacity: 10000 })
      for (let i = 0; i < 20000; i++) {
        s.push(i)
      }
      expect(s.size).toBe(10000)
      expect(s.peek()).toBe(19999)
      expect(s.peekBottom()).toBe(10000)
    })

    it('should handle large dequeue', () => {
      const s = new BoundedStack<number>({ capacity: 10000 })
      for (let i = 0; i < 5000; i++) {
        s.push(i)
      }
      for (let i = 4999; i >= 0; i--) {
        expect(s.pop()).toBe(i)
      }
      expect(s.isEmpty()).toBe(true)
    })

    it('should handle large clone', () => {
      const s = new BoundedStack<number>({ capacity: 10000 })
      for (let i = 0; i < 10000; i++) {
        s.push(i)
      }
      const c = s.clone()
      expect(c.size).toBe(10000)
      expect(c.peek()).toBe(9999)
    })

    it('should handle large contains', () => {
      const s = new BoundedStack<number>({ capacity: 10000 })
      for (let i = 0; i < 10000; i++) {
        s.push(i)
      }
      expect(s.contains(5000)).toBe(true)
      expect(s.contains(10000)).toBe(false)
    })

    it('should handle large indexOf', () => {
      const s = new BoundedStack<number>({ capacity: 10000 })
      for (let i = 0; i < 10000; i++) {
        s.push(i)
      }
      expect(s.indexOf(0)).toBe(9999)
      expect(s.indexOf(9999)).toBe(0)
      expect(s.indexOf(5000)).toBe(4999)
    })
  })

  describe('stats', () => {
    it('should return correct stats for empty stack', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      const st = s.stats()
      expect(st.capacity).toBe(5)
      expect(st.size).toBe(0)
      expect(st.isEmpty).toBe(true)
      expect(st.isFull).toBe(false)
      expect(st.totalPushed).toBe(0)
      expect(st.totalPopped).toBe(0)
      expect(st.totalEvicted).toBe(0)
      expect(st.utilization).toBe(0)
    })

    it('should return correct stats after operations', () => {
      const s = new BoundedStack<number>({ capacity: 2 })
      s.push(1)
      s.push(2)
      s.push(3)
      s.pop()
      const st = s.stats()
      expect(st.size).toBe(1)
      expect(st.isEmpty).toBe(false)
      expect(st.isFull).toBe(false)
      expect(st.totalPushed).toBe(3)
      expect(st.totalPopped).toBe(1)
      expect(st.totalEvicted).toBe(1)
    })

    it('should calculate utilization correctly', () => {
      const s = new BoundedStack<number>({ capacity: 4 })
      s.push(1)
      s.push(2)
      const st = s.stats()
      expect(st.utilization).toBe(0.5)
    })

    it('should show full utilization', () => {
      const s = new BoundedStack<number>({ capacity: 3 })
      s.push(1)
      s.push(2)
      s.push(3)
      const st = s.stats()
      expect(st.utilization).toBe(1)
    })

    it('should show zero utilization when empty', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      expect(s.stats().utilization).toBe(0)
    })

    it('should track evictions in stats', () => {
      const s = new BoundedStack<number>({ capacity: 2 })
      s.push(1)
      s.push(2)
      s.push(3)
      s.push(4)
      s.push(5)
      expect(s.stats().totalEvicted).toBe(3)
    })
  })

  describe('string values', () => {
    it('should work with strings', () => {
      const s = new BoundedStack<string>({ capacity: 3 })
      s.push('a')
      s.push('b')
      s.push('c')
      expect(s.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('should evict strings correctly', () => {
      const s = new BoundedStack<string>({ capacity: 3 })
      s.push('a')
      s.push('b')
      s.push('c')
      expect(s.push('d')).toBe('a')
    })

    it('should contains strings', () => {
      const s = new BoundedStack<string>({ capacity: 5 })
      s.push('hello')
      s.push('world')
      expect(s.contains('hello')).toBe(true)
      expect(s.contains('foo')).toBe(false)
    })

    it('should indexOf strings', () => {
      const s = new BoundedStack<string>({ capacity: 5 })
      s.push('a')
      s.push('b')
      s.push('c')
      expect(s.indexOf('b')).toBe(1)
    })
  })

  describe('object values', () => {
    it('should work with object references', () => {
      const s = new BoundedStack<{ id: number }>({ capacity: 3 })
      const a = { id: 1 }
      const b = { id: 2 }
      const c = { id: 3 }
      s.push(a)
      s.push(b)
      s.push(c)
      expect(s.contains(a)).toBe(true)
      expect(s.pop()).toBe(c)
    })

    it('should evict objects correctly', () => {
      const s = new BoundedStack<{ id: number }>({ capacity: 2 })
      const a = { id: 1 }
      const b = { id: 2 }
      s.push(a)
      s.push(b)
      const evicted = s.push({ id: 3 })
      expect(evicted).toBe(a)
    })

    it('should clone with objects', () => {
      const s = new BoundedStack<{ id: number }>({ capacity: 5 })
      const obj = { id: 1 }
      s.push(obj)
      const c = s.clone()
      expect(c.pop()).toBe(obj)
    })
  })

  describe('mixed operations', () => {
    it('should handle push-pop interleaved', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.pop()
      s.push(3)
      s.push(4)
      s.pop()
      s.push(5)
      expect(s.toArray()).toEqual([1, 3, 5])
    })

    it('should handle clear and reuse', () => {
      const s = new BoundedStack<number>({ capacity: 3 })
      s.push(1)
      s.push(2)
      s.clear()
      expect(s.isEmpty()).toBe(true)
      s.push(10)
      s.push(20)
      s.push(30)
      expect(s.isFull()).toBe(true)
      expect(s.peek()).toBe(30)
    })

    it('should handle clone after eviction', () => {
      const s = new BoundedStack<number>({ capacity: 3 })
      s.push(1)
      s.push(2)
      s.push(3)
      s.push(4)
      const c = s.clone()
      expect(c.toArray()).toEqual([2, 3, 4])
      c.push(5)
      expect(c.peek()).toBe(5)
      expect(s.peek()).toBe(4)
    })

    it('should handle from factory with eviction', () => {
      const s = BoundedStack.from([1, 2, 3, 4, 5], { capacity: 2 })
      expect(s.size).toBe(2)
      expect(s.toArray()).toEqual([4, 5])
      expect(s.peek()).toBe(5)
      expect(s.peekBottom()).toBe(4)
    })

    it('should handle rapid push/pop cycles', () => {
      const s = new BoundedStack<number>({ capacity: 3 })
      for (let i = 0; i < 50; i++) {
        s.push(i)
        s.pop()
      }
      expect(s.size).toBe(0)
    })
  })

  describe('type parameter inference', () => {
    it('should default to unknown', () => {
      const s = new BoundedStack()
      s.push(1)
      s.push('hello')
      expect(s.size).toBe(2)
    })

    it('should work with nullable types', () => {
      const s = new BoundedStack<number | null>({ capacity: 3 })
      s.push(1)
      s.push(null)
      s.push(3)
      expect(s.contains(null)).toBe(true)
      expect(s.indexOf(null)).toBe(1)
    })
  })
})
