import {
  BoundedStack,
  DEFAULT_BOUNDED_STACK_OPTIONS,
} from '../src/core/bounded-stack/bounded-stack.js'
import type { BoundedStackStats } from '../src/core/bounded-stack/bounded-stack.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('BoundedStack', () => {
  describe('constructor', () => {
    it('creates a stack with default capacity', () => {
      const s = new BoundedStack()
      expect(s.capacity).toBe(DEFAULT_BOUNDED_STACK_OPTIONS.capacity)
      expect(s.size).toBe(0)
    })

    it('creates a stack with a custom capacity via options', () => {
      const s = new BoundedStack({ capacity: 10 })
      expect(s.capacity).toBe(10)
      expect(s.size).toBe(0)
    })

    it('creates a stack with capacity 1', () => {
      const s = new BoundedStack({ capacity: 1 })
      expect(s.capacity).toBe(1)
    })

    it('clamps capacity to minimum of 1 when passed 0', () => {
      const s = new BoundedStack({ capacity: 0 })
      expect(s.capacity).toBe(1)
    })

    it('clamps capacity to minimum of 1 when passed negative number', () => {
      const s = new BoundedStack({ capacity: -10 })
      expect(s.capacity).toBe(1)
    })

    it('creates an empty stack', () => {
      const s = new BoundedStack({ capacity: 5 })
      expect(s.isEmpty()).toBe(true)
      expect(s.isFull()).toBe(false)
    })

    it('uses default options when no argument provided', () => {
      const s = new BoundedStack()
      expect(s.capacity).toBe(64)
    })

    it('uses default options when empty object provided', () => {
      const s = new BoundedStack({})
      expect(s.capacity).toBe(64)
    })
  })

  // ─── DEFAULT_BOUNDED_STACK_OPTIONS export ────────────────────────────

  describe('DEFAULT_BOUNDED_STACK_OPTIONS', () => {
    it('has capacity of 64', () => {
      expect(DEFAULT_BOUNDED_STACK_OPTIONS.capacity).toBe(64)
    })
  })

  // ─── push ────────────────────────────────────────────────────────────

  describe('push', () => {
    it('returns undefined when no eviction occurs', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      expect(s.push(1)).toBeUndefined()
    })

    it('increments size after push', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      expect(s.size).toBe(1)
      s.push(2)
      expect(s.size).toBe(2)
    })

    it('evicts the bottom element when full', () => {
      const s = new BoundedStack<number>({ capacity: 2 })
      s.push(1)
      s.push(2)
      const evicted = s.push(3)
      expect(evicted).toBe(1)
      expect(s.size).toBe(2)
    })

    it('maintains LIFO order: last pushed is on top', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.peek()).toBe(3)
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('handles successive evictions', () => {
      const s = new BoundedStack<number>({ capacity: 2 })
      s.push(1)
      s.push(2)
      expect(s.push(3)).toBe(1)
      expect(s.push(4)).toBe(2)
      expect(s.toArray()).toEqual([3, 4])
    })

    it('works with capacity 1', () => {
      const s = new BoundedStack<number>({ capacity: 1 })
      s.push(10)
      expect(s.isFull()).toBe(true)
      const evicted = s.push(20)
      expect(evicted).toBe(10)
      expect(s.peek()).toBe(20)
      expect(s.size).toBe(1)
    })

    it('handles string items', () => {
      const s = new BoundedStack<string>({ capacity: 3 })
      s.push('a')
      s.push('b')
      expect(s.size).toBe(2)
      expect(s.peek()).toBe('b')
    })

    it('handles object items', () => {
      const obj = { id: 1 }
      const s = new BoundedStack<{ id: number }>({ capacity: 3 })
      s.push(obj)
      expect(s.size).toBe(1)
      expect(s.peek()).toBe(obj)
    })

    it('handles null and undefined items', () => {
      const s = new BoundedStack<number | null | undefined>({ capacity: 4 })
      s.push(null)
      s.push(undefined)
      expect(s.size).toBe(2)
      expect(s.peek()).toBeUndefined()
    })

    it('allows push after pop frees space', () => {
      const s = new BoundedStack<number>({ capacity: 2 })
      s.push(1)
      s.push(2)
      s.pop()
      expect(s.push(3)).toBeUndefined()
      expect(s.toArray()).toEqual([1, 3])
    })

    it('tracks evicted items correctly through multiple cycles', () => {
      const s = new BoundedStack<number>({ capacity: 3 })
      s.push(1)
      s.push(2)
      s.push(3)
      // Stack: [1, 2, 3], full
      expect(s.push(4)).toBe(1)
      // Stack: [2, 3, 4]
      expect(s.push(5)).toBe(2)
      // Stack: [3, 4, 5]
      expect(s.toArray()).toEqual([3, 4, 5])
    })
  })

  // ─── pop ─────────────────────────────────────────────────────────────

  describe('pop', () => {
    it('returns the last pushed item (LIFO)', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(10)
      s.push(20)
      s.push(30)
      expect(s.pop()).toBe(30)
      expect(s.pop()).toBe(20)
      expect(s.pop()).toBe(10)
    })

    it('returns undefined when stack is empty', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      expect(s.pop()).toBeUndefined()
    })

    it('decrements size after pop', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      expect(s.size).toBe(2)
      s.pop()
      expect(s.size).toBe(1)
      s.pop()
      expect(s.size).toBe(0)
    })

    it('size stays at 0 when popping from empty stack', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.pop()
      expect(s.size).toBe(0)
    })

    it('returns undefined for repeated pops on empty stack', () => {
      const s = new BoundedStack<number>({ capacity: 3 })
      expect(s.pop()).toBeUndefined()
      expect(s.pop()).toBeUndefined()
      expect(s.pop()).toBeUndefined()
    })

    it('works with capacity 1', () => {
      const s = new BoundedStack<number>({ capacity: 1 })
      s.push(42)
      expect(s.pop()).toBe(42)
      expect(s.pop()).toBeUndefined()
    })

    it('handles mixed push/pop cycles', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      expect(s.pop()).toBe(2)
      s.push(3)
      expect(s.pop()).toBe(3)
      expect(s.pop()).toBe(1)
      expect(s.isEmpty()).toBe(true)
    })
  })

  // ─── peek ────────────────────────────────────────────────────────────

  describe('peek', () => {
    it('returns the top item without removing it', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      expect(s.peek()).toBe(2)
      expect(s.size).toBe(2)
    })

    it('returns undefined when stack is empty', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      expect(s.peek()).toBeUndefined()
    })

    it('updates after pop', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(10)
      s.push(20)
      s.push(30)
      s.pop()
      expect(s.peek()).toBe(20)
    })

    it('does not modify the stack', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.peek()
      s.peek()
      s.peek()
      expect(s.size).toBe(2)
      expect(s.peek()).toBe(2)
    })

    it('returns the only element', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(99)
      expect(s.peek()).toBe(99)
    })
  })

  // ─── peekBottom ──────────────────────────────────────────────────────

  describe('peekBottom', () => {
    it('returns the bottom item', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.peekBottom()).toBe(1)
    })

    it('returns undefined when stack is empty', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      expect(s.peekBottom()).toBeUndefined()
    })

    it('returns the only item when size is 1', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(42)
      expect(s.peekBottom()).toBe(42)
    })

    it('does not modify the stack', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.peekBottom()
      expect(s.size).toBe(2)
      expect(s.peekBottom()).toBe(1)
    })

    it('reflects eviction correctly', () => {
      const s = new BoundedStack<number>({ capacity: 2 })
      s.push(1)
      s.push(2)
      s.push(3) // evicts 1
      expect(s.peekBottom()).toBe(2)
    })

    it('updates after pop reduces stack to one element', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(10)
      s.push(20)
      s.pop()
      expect(s.peekBottom()).toBe(10)
      expect(s.peek()).toBe(10)
    })
  })

  // ─── size ────────────────────────────────────────────────────────────

  describe('size', () => {
    it('returns 0 for new stack', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      expect(s.size).toBe(0)
    })

    it('reflects number of pushed items', () => {
      const s = new BoundedStack<number>({ capacity: 10 })
      for (let i = 0; i < 5; i++) s.push(i)
      expect(s.size).toBe(5)
    })

    it('reflects after push and pop', () => {
      const s = new BoundedStack<number>({ capacity: 10 })
      s.push(1)
      s.push(2)
      s.pop()
      expect(s.size).toBe(1)
    })

    it('caps at capacity after eviction', () => {
      const s = new BoundedStack<number>({ capacity: 3 })
      s.push(1)
      s.push(2)
      s.push(3)
      s.push(4) // evicts 1
      expect(s.size).toBe(3)
    })

    it('returns to 0 after popping all items', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.pop()
      s.pop()
      expect(s.size).toBe(0)
    })
  })

  // ─── isEmpty ─────────────────────────────────────────────────────────

  describe('isEmpty', () => {
    it('returns true for new stack', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      expect(s.isEmpty()).toBe(true)
    })

    it('returns false after push', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      expect(s.isEmpty()).toBe(false)
    })

    it('returns true after all items popped', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.pop()
      expect(s.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.clear()
      expect(s.isEmpty()).toBe(true)
    })

    it('returns false when full', () => {
      const s = new BoundedStack<number>({ capacity: 2 })
      s.push(1)
      s.push(2)
      expect(s.isEmpty()).toBe(false)
    })
  })

  // ─── isFull ──────────────────────────────────────────────────────────

  describe('isFull', () => {
    it('returns false for empty stack', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      expect(s.isFull()).toBe(false)
    })

    it('returns false when partially full', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      expect(s.isFull()).toBe(false)
    })

    it('returns true when full', () => {
      const s = new BoundedStack<number>({ capacity: 3 })
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.isFull()).toBe(true)
    })

    it('remains true after eviction (push on full)', () => {
      const s = new BoundedStack<number>({ capacity: 2 })
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.isFull()).toBe(true)
    })

    it('returns false after pop from full stack', () => {
      const s = new BoundedStack<number>({ capacity: 2 })
      s.push(1)
      s.push(2)
      s.pop()
      expect(s.isFull()).toBe(false)
    })

    it('returns true for capacity 1 with one item', () => {
      const s = new BoundedStack<number>({ capacity: 1 })
      s.push(1)
      expect(s.isFull()).toBe(true)
    })
  })

  // ─── capacity ────────────────────────────────────────────────────────

  describe('capacity', () => {
    it('returns the configured capacity', () => {
      const s = new BoundedStack<number>({ capacity: 10 })
      expect(s.capacity).toBe(10)
    })

    it('returns default capacity when none specified', () => {
      const s = new BoundedStack()
      expect(s.capacity).toBe(64)
    })

    it('does not change after push/pop operations', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.pop()
      expect(s.capacity).toBe(5)
    })
  })

  // ─── clear ───────────────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all items', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.push(3)
      s.clear()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('allows reuse after clearing', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.clear()
      s.push(3)
      expect(s.size).toBe(1)
      expect(s.peek()).toBe(3)
    })

    it('works on an already empty stack', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.clear()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('preserves capacity', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.clear()
      expect(s.capacity).toBe(5)
    })

    it('popped items after clear are undefined', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.clear()
      expect(s.pop()).toBeUndefined()
    })
  })

  // ─── toArray ─────────────────────────────────────────────────────────

  describe('toArray', () => {
    it('returns empty array for empty stack', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      expect(s.toArray()).toEqual([])
    })

    it('returns items in push order (bottom to top)', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('returns a snapshot — modifications do not affect the array', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      const arr = s.toArray()
      s.pop()
      expect(arr).toEqual([1, 2])
    })

    it('reflects state after pop', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.push(3)
      s.pop()
      expect(s.toArray()).toEqual([1, 2])
    })

    it('reflects state after eviction', () => {
      const s = new BoundedStack<number>({ capacity: 2 })
      s.push(1)
      s.push(2)
      s.push(3) // evicts 1
      expect(s.toArray()).toEqual([2, 3])
    })
  })

  // ─── contains ────────────────────────────────────────────────────────

  describe('contains', () => {
    it('returns true for an item in the stack', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.contains(2)).toBe(true)
    })

    it('returns false for an item not in the stack', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      expect(s.contains(99)).toBe(false)
    })

    it('returns false for empty stack', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      expect(s.contains(1)).toBe(false)
    })

    it('uses strict equality', () => {
      const s = new BoundedStack<string>({ capacity: 5 })
      s.push('hello')
      expect(s.contains('hello')).toBe(true)
      expect(s.contains('HELLO')).toBe(false)
    })

    it('works with object references', () => {
      const obj = { id: 1 }
      const s = new BoundedStack<{ id: number }>({ capacity: 5 })
      s.push(obj)
      expect(s.contains(obj)).toBe(true)
      expect(s.contains({ id: 1 })).toBe(false)
    })

    it('returns false after item is evicted', () => {
      const s = new BoundedStack<number>({ capacity: 2 })
      s.push(1)
      s.push(2)
      s.push(3) // evicts 1
      expect(s.contains(1)).toBe(false)
      expect(s.contains(3)).toBe(true)
    })

    it('returns false after item is popped', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.pop()
      expect(s.contains(2)).toBe(false)
      expect(s.contains(1)).toBe(true)
    })
  })

  // ─── indexOf ─────────────────────────────────────────────────────────

  describe('indexOf', () => {
    it('returns 0 for the top element', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.indexOf(3)).toBe(0)
    })

    it('returns correct index for middle element', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.indexOf(2)).toBe(1)
    })

    it('returns correct index for bottom element', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.indexOf(1)).toBe(2)
    })

    it('returns -1 for item not in stack', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      expect(s.indexOf(99)).toBe(-1)
    })

    it('returns -1 for empty stack', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      expect(s.indexOf(1)).toBe(-1)
    })

    it('finds topmost occurrence of duplicate values', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.push(1) // duplicate, closer to top
      expect(s.indexOf(1)).toBe(0) // finds topmost (distance 0 from top)
    })

    it('uses strict equality', () => {
      const s = new BoundedStack<string>({ capacity: 5 })
      s.push('hello')
      expect(s.indexOf('hello')).toBe(0)
      expect(s.indexOf('HELLO')).toBe(-1)
    })

    it('returns correct index for single item', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(42)
      expect(s.indexOf(42)).toBe(0)
    })
  })

  // ─── clone ───────────────────────────────────────────────────────────

  describe('clone', () => {
    it('creates an independent copy with same items', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.push(3)
      const cloned = s.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3])
      expect(cloned.size).toBe(3)
    })

    it('has the same capacity', () => {
      const s = new BoundedStack<number>({ capacity: 10 })
      s.push(1)
      const cloned = s.clone()
      expect(cloned.capacity).toBe(10)
    })

    it('modifications to clone do not affect original', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      const cloned = s.clone()
      cloned.pop()
      cloned.push(99)
      expect(s.toArray()).toEqual([1, 2])
      expect(cloned.toArray()).toEqual([1, 99])
    })

    it('modifications to original do not affect clone', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      const cloned = s.clone()
      s.clear()
      expect(cloned.toArray()).toEqual([1, 2])
    })

    it('cloning an empty stack works', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      const cloned = s.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
      expect(cloned.capacity).toBe(5)
    })

    it('clone reflects eviction state correctly', () => {
      const s = new BoundedStack<number>({ capacity: 2 })
      s.push(1)
      s.push(2)
      s.push(3) // evicts 1
      const cloned = s.clone()
      expect(cloned.toArray()).toEqual([2, 3])
      expect(cloned.isFull()).toBe(true)
    })
  })

  // ─── static from ─────────────────────────────────────────────────────

  describe('BoundedStack.from', () => {
    it('creates a stack from an array', () => {
      const s = BoundedStack.from([1, 2, 3])
      expect(s.size).toBe(3)
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('creates a stack with custom capacity', () => {
      const s = BoundedStack.from([1, 2, 3], { capacity: 10 })
      expect(s.capacity).toBe(10)
    })

    it('evicts when items exceed capacity', () => {
      const s = BoundedStack.from([1, 2, 3, 4, 5], { capacity: 3 })
      expect(s.size).toBe(3)
      expect(s.toArray()).toEqual([3, 4, 5])
    })

    it('creates an empty stack from empty array', () => {
      const s = BoundedStack.from([])
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('works with string items', () => {
      const s = BoundedStack.from(['a', 'b', 'c'])
      expect(s.peek()).toBe('c')
      expect(s.size).toBe(3)
    })

    it('uses default capacity when no options provided', () => {
      const s = BoundedStack.from([1, 2, 3])
      expect(s.capacity).toBe(64)
    })

    it('works with iterable (Set)', () => {
      const s = BoundedStack.from(new Set([10, 20, 30]))
      expect(s.size).toBe(3)
      expect(s.toArray()).toEqual([10, 20, 30])
    })
  })

  // ─── stats ───────────────────────────────────────────────────────────

  describe('stats', () => {
    it('returns correct stats for empty stack', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      const stats = s.stats()
      expect(stats.capacity).toBe(5)
      expect(stats.size).toBe(0)
      expect(stats.isEmpty).toBe(true)
      expect(stats.isFull).toBe(false)
      expect(stats.totalPushed).toBe(0)
      expect(stats.totalPopped).toBe(0)
      expect(stats.totalEvicted).toBe(0)
      expect(stats.utilization).toBe(0)
    })

    it('tracks totalPushed', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.stats().totalPushed).toBe(3)
    })

    it('tracks totalPopped', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(1)
      s.push(2)
      s.pop()
      s.pop()
      expect(s.stats().totalPopped).toBe(2)
    })

    it('tracks totalEvicted', () => {
      const s = new BoundedStack<number>({ capacity: 2 })
      s.push(1)
      s.push(2)
      s.push(3)
      s.push(4)
      expect(s.stats().totalEvicted).toBe(2)
    })

    it('calculates utilization correctly', () => {
      const s = new BoundedStack<number>({ capacity: 10 })
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.stats().utilization).toBeCloseTo(0.3)
    })

    it('utilization is 1 when full', () => {
      const s = new BoundedStack<number>({ capacity: 3 })
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.stats().utilization).toBe(1)
    })

    it('stats persist after clear (push/pop/evicted counters)', () => {
      const s = new BoundedStack<number>({ capacity: 2 })
      s.push(1)
      s.push(2)
      s.push(3) // evicts 1
      s.clear()
      const stats = s.stats()
      expect(stats.totalPushed).toBe(3)
      expect(stats.totalEvicted).toBe(1)
      expect(stats.size).toBe(0)
    })

    it('stats reflect isEmpty and isFull correctly', () => {
      const s = new BoundedStack<number>({ capacity: 2 })
      s.push(1)
      s.push(2)
      const stats = s.stats()
      expect(stats.isEmpty).toBe(false)
      expect(stats.isFull).toBe(true)
    })
  })

  // ─── Edge cases ──────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('single element lifecycle', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(42)
      expect(s.size).toBe(1)
      expect(s.isEmpty()).toBe(false)
      expect(s.isFull()).toBe(false)
      expect(s.peek()).toBe(42)
      expect(s.peekBottom()).toBe(42)
      expect(s.contains(42)).toBe(true)
      expect(s.indexOf(42)).toBe(0)
      expect(s.pop()).toBe(42)
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('capacity 1 full lifecycle', () => {
      const s = new BoundedStack<number>({ capacity: 1 })
      expect(s.push(1)).toBeUndefined()
      expect(s.isFull()).toBe(true)
      expect(s.push(2)).toBe(1) // evicts 1
      expect(s.pop()).toBe(2)
      expect(s.isEmpty()).toBe(true)
      expect(s.push(3)).toBeUndefined()
      expect(s.peek()).toBe(3)
    })

    it('fill and clear completely', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      for (let i = 0; i < 5; i++) s.push(i + 1)
      expect(s.isFull()).toBe(true)
      s.clear()
      expect(s.isEmpty()).toBe(true)
    })

    it('repeated fill and clear cycles', () => {
      const s = new BoundedStack<number>({ capacity: 3 })
      for (let cycle = 0; cycle < 5; cycle++) {
        for (let i = 0; i < 3; i++) s.push(cycle * 3 + i)
        expect(s.isFull()).toBe(true)
        s.clear()
        expect(s.isEmpty()).toBe(true)
      }
      expect(s.capacity).toBe(3)
    })

    it('works with various types', () => {
      const strS = new BoundedStack<string>({ capacity: 3 })
      strS.push('hello')
      expect(strS.pop()).toBe('hello')

      const boolS = new BoundedStack<boolean>({ capacity: 3 })
      boolS.push(true)
      boolS.push(false)
      expect(boolS.toArray()).toEqual([true, false])

      const nullS = new BoundedStack<null>({ capacity: 2 })
      nullS.push(null)
      expect(nullS.pop()).toBeNull()
    })

    it('large number of operations', () => {
      const s = new BoundedStack<number>({ capacity: 100 })
      for (let i = 0; i < 100; i++) s.push(i)
      expect(s.isFull()).toBe(true)
      for (let i = 99; i >= 0; i--) {
        expect(s.pop()).toBe(i)
      }
      expect(s.isEmpty()).toBe(true)
    })

    it('large number of evictions', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      for (let i = 0; i < 1000; i++) s.push(i)
      expect(s.size).toBe(5)
      expect(s.stats().totalEvicted).toBe(995)
      expect(s.toArray()).toEqual([995, 996, 997, 998, 999])
    })

    it('interleaved push and pop', () => {
      const s = new BoundedStack<number>({ capacity: 3 })
      s.push(1)
      s.push(2)
      expect(s.pop()).toBe(2)
      s.push(3)
      s.push(4)
      expect(s.pop()).toBe(4)
      expect(s.toArray()).toEqual([1, 3])
    })

    it('clear then refill with eviction', () => {
      const s = new BoundedStack<number>({ capacity: 2 })
      s.push(1)
      s.clear()
      s.push(2)
      s.push(3)
      expect(s.push(4)).toBe(2) // evicts 2
      expect(s.toArray()).toEqual([3, 4])
    })

    it('peek and peekBottom on single element are the same', () => {
      const s = new BoundedStack<number>({ capacity: 5 })
      s.push(42)
      expect(s.peek()).toBe(s.peekBottom())
    })
  })
})
