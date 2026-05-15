import { describe, it, expect } from 'vitest'
import { ThreadSafeStack2 } from '../src/core/thread-safe-stack-2/index.js'

describe('ThreadSafeStack2', () => {
  describe('push/pop LIFO order', () => {
    it('maintains LIFO order', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.push(1)
      stack.push(2)
      stack.push(3)
      expect(stack.pop()).toBe(3)
      expect(stack.pop()).toBe(2)
      expect(stack.pop()).toBe(1)
    })

    it('returns undefined when popping empty stack', () => {
      const stack = new ThreadSafeStack2<number>()
      expect(stack.pop()).toBeUndefined()
    })

    it('handles multiple push/pop cycles', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.push(1)
      expect(stack.pop()).toBe(1)
      stack.push(2)
      stack.push(3)
      expect(stack.pop()).toBe(3)
      expect(stack.pop()).toBe(2)
      expect(stack.pop()).toBeUndefined()
    })
  })

  describe('peek', () => {
    it('returns top element without removing it', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.push(1)
      stack.push(2)
      expect(stack.peek()).toBe(2)
      expect(stack.size).toBe(2)
      expect(stack.peek()).toBe(2)
    })

    it('returns undefined for empty stack', () => {
      const stack = new ThreadSafeStack2<number>()
      expect(stack.peek()).toBeUndefined()
    })

    it('peeks after pops', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.push(1)
      stack.push(2)
      stack.push(3)
      stack.pop()
      expect(stack.peek()).toBe(2)
      stack.pop()
      expect(stack.peek()).toBe(1)
    })
  })

  describe('size', () => {
    it('returns correct size', () => {
      const stack = new ThreadSafeStack2<number>()
      expect(stack.size).toBe(0)
      stack.push(1)
      expect(stack.size).toBe(1)
      stack.push(2)
      expect(stack.size).toBe(2)
      stack.push(3)
      expect(stack.size).toBe(3)
      stack.pop()
      expect(stack.size).toBe(2)
      stack.pop()
      expect(stack.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty stack', () => {
      const stack = new ThreadSafeStack2<number>()
      expect(stack.isEmpty()).toBe(true)
    })

    it('returns false for non-empty stack', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.push(1)
      expect(stack.isEmpty()).toBe(false)
    })

    it('returns true after clearing', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.push(1)
      stack.push(2)
      stack.clear()
      expect(stack.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears all elements', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.push(1)
      stack.push(2)
      stack.push(3)
      stack.clear()
      expect(stack.size).toBe(0)
      expect(stack.isEmpty()).toBe(true)
      expect(stack.pop()).toBeUndefined()
      expect(stack.peek()).toBeUndefined()
    })

    it('can be called multiple times', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.clear()
      stack.clear()
      stack.push(1)
      stack.clear()
      stack.clear()
      expect(stack.size).toBe(0)
    })
  })

  describe('lock/unlock', () => {
    it('allows operations when unlocked', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.push(1)
      expect(stack.pop()).toBe(1)
    })

    it('prevents operations when locked', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.lock()
      expect(() => stack.push(1)).toThrow('Stack is locked by another thread')
      expect(() => stack.pop()).toThrow('Stack is locked by another thread')
      expect(() => stack.peek()).toThrow('Stack is locked by another thread')
      expect(() => stack.size).toThrow('Stack is locked by another thread')
      expect(() => stack.isEmpty()).toThrow('Stack is locked by another thread')
      expect(() => stack.clear()).toThrow('Stack is locked by another thread')
    })

    it('allows operations after unlock', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.push(1)
      stack.lock()
      stack.unlock()
      stack.push(2)
      expect(stack.pop()).toBe(2)
      expect(stack.pop()).toBe(1)
    })

    it('throws when locking already locked stack', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.lock()
      expect(() => stack.lock()).toThrow('Stack is already locked')
    })

    it('throws when unlocking unlocked stack', () => {
      const stack = new ThreadSafeStack2<number>()
      expect(() => stack.unlock()).toThrow('Stack is not locked')
    })

    it('can be locked/unlocked multiple times', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.push(1)
      stack.lock()
      stack.unlock()
      stack.push(2)
      stack.lock()
      stack.unlock()
      expect(stack.size).toBe(2)
      expect(stack.pop()).toBe(2)
      expect(stack.pop()).toBe(1)
    })

    it('maintains state through lock/unlock', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.push(1)
      stack.push(2)
      stack.lock()
      stack.unlock()
      expect(stack.size).toBe(2)
      expect(stack.peek()).toBe(2)
      expect(stack.pop()).toBe(2)
      expect(stack.pop()).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('handles string items', () => {
      const stack = new ThreadSafeStack2<string>()
      stack.push('hello')
      stack.push('world')
      expect(stack.pop()).toBe('world')
      expect(stack.pop()).toBe('hello')
    })

    it('handles object items', () => {
      const stack = new ThreadSafeStack2<{ id: number }>()
      stack.push({ id: 1 })
      stack.push({ id: 2 })
      const popped = stack.pop()
      expect(popped?.id).toBe(2)
    })

    it('handles null and undefined items', () => {
      const stack = new ThreadSafeStack2<number | null | undefined>()
      stack.push(null)
      stack.push(undefined)
      stack.push(1)
      expect(stack.pop()).toBe(1)
      expect(stack.pop()).toBeUndefined()
      expect(stack.pop()).toBeNull()
    })

    it('handles many operations', () => {
      const stack = new ThreadSafeStack2<number>()
      for (let i = 0; i < 1000; i++) {
        stack.push(i)
      }
      expect(stack.size).toBe(1000)
      for (let i = 999; i >= 0; i--) {
        expect(stack.pop()).toBe(i)
      }
      expect(stack.size).toBe(0)
      expect(stack.isEmpty()).toBe(true)
    })

    it('peek does not remove item', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.push(42)
      expect(stack.peek()).toBe(42)
      expect(stack.size).toBe(1)
      expect(stack.peek()).toBe(42)
    })

    it('peek returns undefined on empty stack', () => {
      const stack = new ThreadSafeStack2<number>()
      expect(stack.peek()).toBeUndefined()
    })

    it('clear empties the stack', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.push(1)
      stack.push(2)
      stack.push(3)
      stack.clear()
      expect(stack.size).toBe(0)
      expect(stack.isEmpty()).toBe(true)
    })

    it('lock prevents push', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.lock()
      expect(() => stack.push(1)).toThrow()
    })

    it('lock prevents pop', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.push(1)
      stack.lock()
      expect(() => stack.pop()).toThrow()
    })

    it('unlock allows operations again', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.lock()
      stack.unlock()
      stack.push(1)
      expect(stack.pop()).toBe(1)
    })

    it('double lock throws', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.lock()
      expect(() => stack.lock()).toThrow()
    })

    it('unlock on unlocked throws', () => {
      const stack = new ThreadSafeStack2<number>()
      expect(() => stack.unlock()).toThrow()
    })
  })

  describe('peek', () => {
    it('returns top without removing', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.push(1)
      stack.push(2)
      expect(stack.peek()).toBe(2)
      expect(stack.size).toBe(2)
    })
  })

  describe('clear', () => {
    it('clears the stack', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.push(1)
      stack.push(2)
      stack.clear()
      expect(stack.size).toBe(0)
      expect(stack.isEmpty()).toBe(true)
    })

    it('handles size tracking', () => {
      const stack = new ThreadSafeStack2<number>()
      expect(stack.size).toBe(0)
      stack.push(1)
      expect(stack.size).toBe(1)
      stack.pop()
      expect(stack.size).toBe(0)
    })

    it('handles peek on populated stack', () => {
      const stack = new ThreadSafeStack2<number>()
      stack.push(10)
      stack.push(20)
      expect(stack.peek()).toBe(20)
      expect(stack.size).toBe(2)
    })

    it('handles pop returning undefined on empty', () => {
      const stack = new ThreadSafeStack2<number>()
      expect(stack.pop()).toBeUndefined()
    })
  })
})
