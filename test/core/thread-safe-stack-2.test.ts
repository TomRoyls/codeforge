import { describe, it, expect } from 'vitest'
import { ThreadSafeStack2 } from '../../src/core/thread-safe-stack-2/index.js'

describe('ThreadSafeStack2', () => {
  // ─── Constructor ───

  describe('constructor', () => {
    it('creates an empty stack', () => {
      const stack = new ThreadSafeStack2<number>()
      expect(stack.size).toBe(0)
      expect(stack.isEmpty()).toBe(true)
    })

    it('creates stack with no arguments', () => {
      const stack = new ThreadSafeStack2<string>()
      expect(stack.size).toBe(0)
    })
  })

  // ─── Push ───

  describe('push', () => {
    it('adds item to stack', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.push(1)
      expect(stack.size).toBe(1)
    })

    it('adds multiple items', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.push(1)
      stack.push(2)
      stack.push(3)
      expect(stack.size).toBe(3)
    })

    it('handles string items', () => {
      const stack = new ThreadSafeStack2<string>()
      stack.push('a')
      stack.push('b')
      expect(stack.size).toBe(2)
    })

    it('handles object items', () => {
      const stack = new ThreadSafeStack2<{ id: number }>()
      stack.push({ id: 1 })
      expect(stack.size).toBe(1)
    })

    it('throws when stack is locked', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.lock()
      expect(() => stack.push(1)).toThrow('Stack is locked by another thread')
    })
  })

  // ─── Pop ───

  describe('pop', () => {
    it('returns undefined from empty stack', () => {
      const stack = new ThreadSafeStack2<number>()
      expect(stack.pop()).toBeUndefined()
    })

    it('returns last pushed item (LIFO)', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.push(1)
      stack.push(2)
      stack.push(3)
      expect(stack.pop()).toBe(3)
      expect(stack.pop()).toBe(2)
      expect(stack.pop()).toBe(1)
    })

    it('decreases size', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.push(1)
      stack.push(2)
      stack.pop()
      expect(stack.size).toBe(1)
    })

    it('returns undefined after all items popped', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.push(1)
      stack.pop()
      expect(stack.pop()).toBeUndefined()
    })

    it('throws when stack is locked', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.push(1)
      stack.lock()
      expect(() => stack.pop()).toThrow('Stack is locked by another thread')
    })
  })

  // ─── Peek ───

  describe('peek', () => {
    it('returns undefined on empty stack', () => {
      const stack = new ThreadSafeStack2<number>()
      expect(stack.peek()).toBeUndefined()
    })

    it('returns top item without removing it', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.push(1)
      stack.push(2)
      expect(stack.peek()).toBe(2)
      expect(stack.size).toBe(2)
    })

    it('returns new top after pop', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.push(10)
      stack.push(20)
      stack.pop()
      expect(stack.peek()).toBe(10)
    })

    it('throws when stack is locked', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.push(1)
      stack.lock()
      expect(() => stack.peek()).toThrow('Stack is locked by another thread')
    })
  })

  // ─── Size and isEmpty ───

  describe('size and isEmpty', () => {
    it('size returns 0 for empty stack', () => {
      const stack = new ThreadSafeStack2<number>()
      expect(stack.size).toBe(0)
    })

    it('isEmpty returns true for empty stack', () => {
      const stack = new ThreadSafeStack2<number>()
      expect(stack.isEmpty()).toBe(true)
    })

    it('isEmpty returns false after push', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.push(1)
      expect(stack.isEmpty()).toBe(false)
    })

    it('size throws when locked', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.lock()
      expect(() => stack.size).toThrow('Stack is locked by another thread')
    })

    it('isEmpty throws when locked', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.lock()
      expect(() => stack.isEmpty()).toThrow('Stack is locked by another thread')
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('removes all items', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.push(1)
      stack.push(2)
      stack.clear()
      expect(stack.size).toBe(0)
      expect(stack.isEmpty()).toBe(true)
    })

    it('clear on empty stack is a no-op', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.clear()
      expect(stack.size).toBe(0)
    })

    it('allows push after clear', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.push(1)
      stack.clear()
      stack.push(2)
      expect(stack.size).toBe(1)
      expect(stack.peek()).toBe(2)
    })

    it('throws when stack is locked', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.lock()
      expect(() => stack.clear()).toThrow('Stack is locked by another thread')
    })
  })

  // ─── Lock and Unlock ───

  describe('lock and unlock', () => {
    it('lock prevents all operations', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.push(1)
      stack.lock()
      expect(() => stack.push(2)).toThrow()
      expect(() => stack.pop()).toThrow()
      expect(() => stack.peek()).toThrow()
      expect(() => stack.size).toThrow()
      expect(() => stack.isEmpty()).toThrow()
      expect(() => stack.clear()).toThrow()
    })

    it('unlock restores all operations', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.push(1)
      stack.lock()
      stack.unlock()
      expect(stack.peek()).toBe(1)
      stack.push(2)
      expect(stack.size).toBe(2)
    })

    it('lock throws if already locked', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.lock()
      expect(() => stack.lock()).toThrow('Stack is already locked')
    })

    it('unlock throws if not locked', () => {
      const stack = new ThreadSafeStack2<number>()
      expect(() => stack.unlock()).toThrow('Stack is not locked')
    })

    it('supports lock-unlock cycle', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.push(1)
      stack.lock()
      stack.unlock()
      stack.lock()
      stack.unlock()
      expect(stack.size).toBe(1)
      expect(stack.peek()).toBe(1)
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles single element push-pop cycle', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.push(42)
      expect(stack.pop()).toBe(42)
      expect(stack.isEmpty()).toBe(true)
    })

    it('handles null and undefined values', () => {
      const stack = new ThreadSafeStack2<number | null | undefined>()
      stack.push(null)
      stack.push(undefined)
      expect(stack.pop()).toBeUndefined()
      expect(stack.pop()).toBeNull()
    })

    it('handles large number of pushes and pops', () => {
      const stack = new ThreadSafeStack2<number>()
      for (let i = 0; i < 1000; i++) {
        stack.push(i)
      }
      expect(stack.size).toBe(1000)
      for (let i = 999; i >= 0; i--) {
        expect(stack.pop()).toBe(i)
      }
      expect(stack.isEmpty()).toBe(true)
    })
  })
})
