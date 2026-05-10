import { describe, it, expect } from 'vitest'
import { HashStack } from '../../src/core/hash-stack/hash-stack.js'

describe('HashStack', () => {
  describe('construction', () => {
    it('creates an empty stack', () => {
      const stack = new HashStack()
      expect(stack.size).toBe(0)
      expect(stack.isEmpty()).toBe(true)
    })

    it('creates a typed stack', () => {
      const stack = new HashStack<number>()
      expect(stack.size).toBe(0)
    })

    it('creates a stack with string type', () => {
      const stack = new HashStack<string>()
      expect(stack.size).toBe(0)
    })

    it('default generic is unknown', () => {
      const stack = new HashStack()
      stack.push('hello')
      stack.push(42)
      expect(stack.size).toBe(2)
    })
  })

  describe('push', () => {
    it('pushes an item and returns new size', () => {
      const stack = new HashStack<number>()
      expect(stack.push(1)).toBe(1)
      expect(stack.push(2)).toBe(2)
      expect(stack.push(3)).toBe(3)
    })

    it('maintains size after multiple pushes', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      stack.push(3)
      expect(stack.size).toBe(3)
    })

    it('pushes duplicate items', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(1)
      stack.push(1)
      expect(stack.size).toBe(3)
    })

    it('pushes undefined values', () => {
      const stack = new HashStack<number | undefined>()
      expect(stack.push(undefined)).toBe(1)
      expect(stack.size).toBe(1)
    })

    it('pushes null values', () => {
      const stack = new HashStack<string | null>()
      expect(stack.push(null)).toBe(1)
      expect(stack.size).toBe(1)
    })

    it('pushes objects', () => {
      const stack = new HashStack<{ id: number }>()
      const obj = { id: 1 }
      stack.push(obj)
      expect(stack.size).toBe(1)
      expect(stack.has(obj)).toBe(true)
    })

    it('pushes strings', () => {
      const stack = new HashStack<string>()
      stack.push('a')
      stack.push('b')
      stack.push('c')
      expect(stack.size).toBe(3)
    })
  })

  describe('pop', () => {
    it('returns undefined on empty stack', () => {
      const stack = new HashStack<number>()
      expect(stack.pop()).toBeUndefined()
    })

    it('pops the last pushed item (LIFO)', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      stack.push(3)
      expect(stack.pop()).toBe(3)
      expect(stack.pop()).toBe(2)
      expect(stack.pop()).toBe(1)
    })

    it('returns undefined after all items are popped', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.pop()
      expect(stack.pop()).toBeUndefined()
    })

    it('decrements size on pop', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      stack.pop()
      expect(stack.size).toBe(1)
    })

    it('updates has() after popping the only instance of an item', () => {
      const stack = new HashStack<string>()
      stack.push('a')
      expect(stack.has('a')).toBe(true)
      stack.pop()
      expect(stack.has('a')).toBe(false)
    })

    it('has() stays true if duplicates remain after pop', () => {
      const stack = new HashStack<string>()
      stack.push('a')
      stack.push('a')
      stack.pop()
      expect(stack.has('a')).toBe(true)
    })

    it('handles pop of undefined values', () => {
      const stack = new HashStack<number | undefined>()
      stack.push(undefined)
      expect(stack.pop()).toBeUndefined()
      expect(stack.size).toBe(0)
    })
  })

  describe('peek', () => {
    it('returns undefined on empty stack', () => {
      const stack = new HashStack<number>()
      expect(stack.peek()).toBeUndefined()
    })

    it('returns the top item without removing it', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      expect(stack.peek()).toBe(2)
      expect(stack.size).toBe(2)
    })

    it('returns the only item', () => {
      const stack = new HashStack<number>()
      stack.push(42)
      expect(stack.peek()).toBe(42)
    })

    it('does not modify the stack', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      stack.peek()
      stack.peek()
      expect(stack.size).toBe(2)
      expect(stack.peek()).toBe(2)
    })
  })

  describe('has', () => {
    it('returns false for item not in empty stack', () => {
      const stack = new HashStack<number>()
      expect(stack.has(1)).toBe(false)
    })

    it('returns true for item in stack', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      stack.push(3)
      expect(stack.has(1)).toBe(true)
      expect(stack.has(2)).toBe(true)
      expect(stack.has(3)).toBe(true)
    })

    it('returns false for item not in non-empty stack', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      expect(stack.has(99)).toBe(false)
    })

    it('returns true for duplicate items', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(1)
      expect(stack.has(1)).toBe(true)
    })

    it('uses reference equality for objects', () => {
      const stack = new HashStack<{ id: number }>()
      const obj = { id: 1 }
      stack.push(obj)
      expect(stack.has(obj)).toBe(true)
      expect(stack.has({ id: 1 })).toBe(false)
    })

    it('works with string values', () => {
      const stack = new HashStack<string>()
      stack.push('hello')
      expect(stack.has('hello')).toBe(true)
      expect(stack.has('world')).toBe(false)
    })
  })

  describe('size', () => {
    it('returns 0 for empty stack', () => {
      const stack = new HashStack()
      expect(stack.size).toBe(0)
    })

    it('returns correct size after pushes', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      expect(stack.size).toBe(1)
      stack.push(2)
      expect(stack.size).toBe(2)
      stack.push(3)
      expect(stack.size).toBe(3)
    })

    it('returns correct size after pops', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      stack.push(3)
      stack.pop()
      expect(stack.size).toBe(2)
      stack.pop()
      expect(stack.size).toBe(1)
    })

    it('counts duplicates', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(1)
      stack.push(1)
      expect(stack.size).toBe(3)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new stack', () => {
      const stack = new HashStack()
      expect(stack.isEmpty()).toBe(true)
    })

    it('returns false after push', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      expect(stack.isEmpty()).toBe(false)
    })

    it('returns true after popping all items', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.pop()
      expect(stack.isEmpty()).toBe(true)
    })

    it('returns false with multiple items', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      expect(stack.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('clears an empty stack without error', () => {
      const stack = new HashStack()
      stack.clear()
      expect(stack.size).toBe(0)
      expect(stack.isEmpty()).toBe(true)
    })

    it('clears all items', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      stack.push(3)
      stack.clear()
      expect(stack.size).toBe(0)
      expect(stack.isEmpty()).toBe(true)
    })

    it('clears has() results', () => {
      const stack = new HashStack<string>()
      stack.push('a')
      stack.push('b')
      stack.clear()
      expect(stack.has('a')).toBe(false)
      expect(stack.has('b')).toBe(false)
    })

    it('allows pushing after clear', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.clear()
      stack.push(2)
      expect(stack.size).toBe(1)
      expect(stack.peek()).toBe(2)
    })
  })

  describe('clone', () => {
    it('clones an empty stack', () => {
      const stack = new HashStack<number>()
      const cloned = stack.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('clones all items', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      stack.push(3)
      const cloned = stack.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3])
    })

    it('produces independent copy', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      const cloned = stack.clone()
      cloned.pop()
      expect(stack.size).toBe(2)
      expect(cloned.size).toBe(1)
    })

    it('preserves has() behavior', () => {
      const stack = new HashStack<string>()
      stack.push('a')
      stack.push('b')
      const cloned = stack.clone()
      expect(cloned.has('a')).toBe(true)
      expect(cloned.has('b')).toBe(true)
      expect(cloned.has('c')).toBe(false)
    })

    it('modifying clone does not affect original', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      const cloned = stack.clone()
      cloned.push(2)
      expect(stack.size).toBe(1)
      expect(cloned.size).toBe(2)
    })

    it('clear on clone does not affect original', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      const cloned = stack.clone()
      cloned.clear()
      expect(stack.size).toBe(2)
      expect(cloned.size).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty stack', () => {
      const stack = new HashStack<number>()
      expect(stack.toArray()).toEqual([])
    })

    it('returns items in push order', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      stack.push(3)
      expect(stack.toArray()).toEqual([1, 2, 3])
    })

    it('returns a copy', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      const arr = stack.toArray()
      arr.push(99)
      expect(stack.size).toBe(2)
    })

    it('includes duplicates', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(1)
      stack.push(2)
      expect(stack.toArray()).toEqual([1, 1, 2])
    })
  })

  describe('forEach', () => {
    it('does nothing on empty stack', () => {
      const stack = new HashStack<number>()
      const items: number[] = []
      stack.forEach((item) => items.push(item))
      expect(items).toEqual([])
    })

    it('iterates all items in order', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      stack.push(3)
      const items: number[] = []
      stack.forEach((item) => items.push(item))
      expect(items).toEqual([1, 2, 3])
    })

    it('provides correct index', () => {
      const stack = new HashStack<string>()
      stack.push('a')
      stack.push('b')
      stack.push('c')
      const indices: number[] = []
      stack.forEach((_item, index) => indices.push(index))
      expect(indices).toEqual([0, 1, 2])
    })

    it('provides both item and index', () => {
      const stack = new HashStack<string>()
      stack.push('x')
      stack.push('y')
      const pairs: [string, number][] = []
      stack.forEach((item, index) => pairs.push([item, index]))
      expect(pairs).toEqual([['x', 0], ['y', 1]])
    })

    it('iterates over duplicates', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(1)
      stack.push(2)
      const items: number[] = []
      stack.forEach((item) => items.push(item))
      expect(items).toEqual([1, 1, 2])
    })
  })

  describe('static from', () => {
    it('creates stack from array', () => {
      const stack = HashStack.from([1, 2, 3])
      expect(stack.size).toBe(3)
      expect(stack.toArray()).toEqual([1, 2, 3])
    })

    it('creates stack from empty array', () => {
      const stack = HashStack.from([])
      expect(stack.size).toBe(0)
      expect(stack.isEmpty()).toBe(true)
    })

    it('creates stack from single item', () => {
      const stack = HashStack.from([42])
      expect(stack.size).toBe(1)
      expect(stack.peek()).toBe(42)
    })

    it('creates stack from set', () => {
      const stack = HashStack.from(new Set([1, 2, 3]))
      expect(stack.size).toBe(3)
    })

    it('creates stack from generator', () => {
      function* gen() {
        yield 1
        yield 2
        yield 3
      }
      const stack = HashStack.from(gen())
      expect(stack.size).toBe(3)
      expect(stack.toArray()).toEqual([1, 2, 3])
    })

    it('creates typed stack', () => {
      const stack = HashStack.from(['a', 'b', 'c'])
      expect(stack.has('a')).toBe(true)
      expect(stack.has('b')).toBe(true)
      expect(stack.has('c')).toBe(true)
    })
  })

  describe('reverse', () => {
    it('reverses empty stack without error', () => {
      const stack = new HashStack<number>()
      stack.reverse()
      expect(stack.size).toBe(0)
    })

    it('reverses single item stack', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.reverse()
      expect(stack.toArray()).toEqual([1])
    })

    it('reverses multiple items', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      stack.push(3)
      stack.reverse()
      expect(stack.toArray()).toEqual([3, 2, 1])
    })

    it('reverse makes top the old bottom', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      stack.push(3)
      stack.reverse()
      expect(stack.peek()).toBe(1)
    })

    it('double reverse restores order', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      stack.push(3)
      stack.reverse()
      stack.reverse()
      expect(stack.toArray()).toEqual([1, 2, 3])
    })

    it('preserves has() after reverse', () => {
      const stack = new HashStack<string>()
      stack.push('a')
      stack.push('b')
      stack.push('c')
      stack.reverse()
      expect(stack.has('a')).toBe(true)
      expect(stack.has('b')).toBe(true)
      expect(stack.has('c')).toBe(true)
      expect(stack.has('d')).toBe(false)
    })
  })

  describe('containsAll', () => {
    it('returns true for empty items list on empty stack', () => {
      const stack = new HashStack<number>()
      expect(stack.containsAll([])).toBe(true)
    })

    it('returns true for empty items list on non-empty stack', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      expect(stack.containsAll([])).toBe(true)
    })

    it('returns true when all items are present', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      stack.push(3)
      expect(stack.containsAll([1, 2, 3])).toBe(true)
    })

    it('returns true for subset of items', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      stack.push(3)
      expect(stack.containsAll([1, 3])).toBe(true)
    })

    it('returns false when some items are missing', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      expect(stack.containsAll([1, 2, 3])).toBe(false)
    })

    it('returns false when no items match', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      expect(stack.containsAll([4, 5])).toBe(false)
    })

    it('works with strings', () => {
      const stack = new HashStack<string>()
      stack.push('a')
      stack.push('b')
      expect(stack.containsAll(['a', 'b'])).toBe(true)
      expect(stack.containsAll(['a', 'c'])).toBe(false)
    })

    it('works with a set argument', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      expect(stack.containsAll(new Set([1, 2]))).toBe(true)
    })
  })

  describe('removeAll', () => {
    it('returns empty array when removing from empty stack', () => {
      const stack = new HashStack<number>()
      const removed = stack.removeAll(() => true)
      expect(removed).toEqual([])
    })

    it('removes items matching predicate', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      stack.push(3)
      stack.push(4)
      const removed = stack.removeAll((item) => item % 2 === 0)
      expect(removed).toEqual([2, 4])
      expect(stack.toArray()).toEqual([1, 3])
    })

    it('removes nothing when nothing matches', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      const removed = stack.removeAll((item) => item > 100)
      expect(removed).toEqual([])
      expect(stack.size).toBe(2)
    })

    it('removes all items when all match', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      stack.push(3)
      const removed = stack.removeAll(() => true)
      expect(removed).toEqual([1, 2, 3])
      expect(stack.isEmpty()).toBe(true)
    })

    it('updates has() after removal', () => {
      const stack = new HashStack<string>()
      stack.push('a')
      stack.push('b')
      stack.push('c')
      stack.removeAll((item) => item === 'b')
      expect(stack.has('a')).toBe(true)
      expect(stack.has('b')).toBe(false)
      expect(stack.has('c')).toBe(true)
    })

    it('preserves order of remaining items', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      stack.push(3)
      stack.push(4)
      stack.push(5)
      stack.removeAll((item) => item === 3)
      expect(stack.toArray()).toEqual([1, 2, 4, 5])
    })

    it('removes duplicates matching predicate', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      stack.push(1)
      stack.push(2)
      const removed = stack.removeAll((item) => item === 1)
      expect(removed).toEqual([1, 1])
      expect(stack.toArray()).toEqual([2, 2])
    })

    it('returns removed items in order', () => {
      const stack = new HashStack<number>()
      stack.push(10)
      stack.push(20)
      stack.push(30)
      stack.push(40)
      const removed = stack.removeAll((item) => item >= 20)
      expect(removed).toEqual([20, 30, 40])
    })
  })

  describe('stats', () => {
    it('returns correct stats for empty stack', () => {
      const stack = new HashStack<number>()
      const s = stack.stats()
      expect(s.size).toBe(0)
      expect(s.isEmpty).toBe(true)
      expect(s.uniqueCount).toBe(0)
      expect(s.totalPushed).toBe(0)
      expect(s.totalPopped).toBe(0)
    })

    it('tracks totalPushed', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      stack.push(3)
      expect(stack.stats().totalPushed).toBe(3)
    })

    it('tracks totalPopped', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      stack.pop()
      stack.pop()
      expect(stack.stats().totalPopped).toBe(2)
    })

    it('tracks uniqueCount with no duplicates', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      stack.push(3)
      expect(stack.stats().uniqueCount).toBe(3)
    })

    it('tracks uniqueCount with duplicates', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(1)
      stack.push(2)
      expect(stack.stats().uniqueCount).toBe(2)
    })

    it('tracks isEmpty correctly', () => {
      const stack = new HashStack<number>()
      expect(stack.stats().isEmpty).toBe(true)
      stack.push(1)
      expect(stack.stats().isEmpty).toBe(false)
    })

    it('stats persist across push/pop cycles', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      stack.pop()
      stack.push(3)
      stack.push(4)
      stack.pop()
      const s = stack.stats()
      expect(s.totalPushed).toBe(4)
      expect(s.totalPopped).toBe(2)
      expect(s.size).toBe(2)
    })

    it('stats after clear reset size but keep counters', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      stack.clear()
      const s = stack.stats()
      expect(s.size).toBe(0)
      expect(s.isEmpty).toBe(true)
    })
  })

  describe('LIFO order verification', () => {
    it('maintains LIFO order for integers', () => {
      const stack = new HashStack<number>()
      for (let i = 0; i < 10; i++) {
        stack.push(i)
      }
      for (let i = 9; i >= 0; i--) {
        expect(stack.pop()).toBe(i)
      }
    })

    it('maintains LIFO order for strings', () => {
      const stack = new HashStack<string>()
      stack.push('first')
      stack.push('second')
      stack.push('third')
      expect(stack.pop()).toBe('third')
      expect(stack.pop()).toBe('second')
      expect(stack.pop()).toBe('first')
    })

    it('maintains LIFO after interleaved push/pop', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      expect(stack.pop()).toBe(2)
      stack.push(3)
      stack.push(4)
      expect(stack.pop()).toBe(4)
      expect(stack.pop()).toBe(3)
      expect(stack.pop()).toBe(1)
    })

    it('toArray reflects current LIFO state', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      stack.push(3)
      stack.pop()
      expect(stack.toArray()).toEqual([1, 2])
    })
  })

  describe('edge cases', () => {
    it('single item: push, peek, pop cycle', () => {
      const stack = new HashStack<number>()
      stack.push(42)
      expect(stack.peek()).toBe(42)
      expect(stack.has(42)).toBe(true)
      expect(stack.isEmpty()).toBe(false)
      expect(stack.size).toBe(1)
      expect(stack.pop()).toBe(42)
      expect(stack.isEmpty()).toBe(true)
      expect(stack.has(42)).toBe(false)
    })

    it('push-pop interleaved', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      expect(stack.pop()).toBe(1)
      stack.push(2)
      stack.push(3)
      expect(stack.pop()).toBe(3)
      stack.push(4)
      expect(stack.toArray()).toEqual([2, 4])
    })

    it('large stack 10000+ items', () => {
      const stack = new HashStack<number>()
      for (let i = 0; i < 10000; i++) {
        stack.push(i)
      }
      expect(stack.size).toBe(10000)
      expect(stack.has(0)).toBe(true)
      expect(stack.has(9999)).toBe(true)
      expect(stack.has(5000)).toBe(true)
      expect(stack.has(10000)).toBe(false)
      expect(stack.peek()).toBe(9999)
    })

    it('large stack LIFO order', () => {
      const stack = new HashStack<number>()
      for (let i = 0; i < 1000; i++) {
        stack.push(i)
      }
      for (let i = 999; i >= 0; i--) {
        expect(stack.pop()).toBe(i)
      }
      expect(stack.isEmpty()).toBe(true)
    })

    it('push after popping all items', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.pop()
      stack.push(2)
      expect(stack.size).toBe(1)
      expect(stack.peek()).toBe(2)
      expect(stack.has(1)).toBe(false)
      expect(stack.has(2)).toBe(true)
    })

    it('duplicate items throughout stack lifecycle', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      stack.push(1)
      stack.push(3)
      stack.push(1)
      expect(stack.has(1)).toBe(true)
      expect(stack.size).toBe(5)
      stack.removeAll((item) => item === 1)
      expect(stack.size).toBe(2)
      expect(stack.has(1)).toBe(false)
    })

    it('boolean values', () => {
      const stack = new HashStack<boolean>()
      stack.push(true)
      stack.push(false)
      stack.push(true)
      expect(stack.has(true)).toBe(true)
      expect(stack.has(false)).toBe(true)
      expect(stack.size).toBe(3)
    })

    it('zero and negative numbers', () => {
      const stack = new HashStack<number>()
      stack.push(0)
      stack.push(-1)
      stack.push(-42)
      expect(stack.has(0)).toBe(true)
      expect(stack.has(-1)).toBe(true)
      expect(stack.has(-42)).toBe(true)
      expect(stack.pop()).toBe(-42)
    })

    it('empty string', () => {
      const stack = new HashStack<string>()
      stack.push('')
      expect(stack.has('')).toBe(true)
      expect(stack.size).toBe(1)
      expect(stack.pop()).toBe('')
    })

    it('NaN handling', () => {
      const stack = new HashStack<number>()
      stack.push(NaN)
      expect(stack.has(NaN)).toBe(true)
      expect(stack.size).toBe(1)
    })

    it('clone preserves stats counters', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      stack.pop()
      const cloned = stack.clone()
      expect(cloned.stats().totalPushed).toBe(2)
      expect(cloned.stats().totalPopped).toBe(1)
    })

    it('forEach on single item stack', () => {
      const stack = new HashStack<number>()
      stack.push(99)
      const items: number[] = []
      stack.forEach((item) => items.push(item))
      expect(items).toEqual([99])
    })

    it('reverse on two-item stack', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      stack.reverse()
      expect(stack.toArray()).toEqual([2, 1])
      expect(stack.peek()).toBe(1)
    })

    it('removeAll single item', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      stack.push(3)
      const removed = stack.removeAll((item) => item === 2)
      expect(removed).toEqual([2])
      expect(stack.toArray()).toEqual([1, 3])
    })

    it('static from with duplicate items', () => {
      const stack = HashStack.from([1, 2, 1, 3, 2])
      expect(stack.size).toBe(5)
      expect(stack.has(1)).toBe(true)
      expect(stack.has(2)).toBe(true)
      expect(stack.has(3)).toBe(true)
    })

    it('containsAll with single item', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      expect(stack.containsAll([1])).toBe(true)
      expect(stack.containsAll([2])).toBe(false)
    })

    it('multiple pop on empty stack returns undefined consistently', () => {
      const stack = new HashStack<number>()
      expect(stack.pop()).toBeUndefined()
      expect(stack.pop()).toBeUndefined()
      expect(stack.pop()).toBeUndefined()
    })

    it('multiple peek on empty stack returns undefined consistently', () => {
      const stack = new HashStack<number>()
      expect(stack.peek()).toBeUndefined()
      expect(stack.peek()).toBeUndefined()
    })

    it('clear then push-pop cycle', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      stack.clear()
      expect(stack.isEmpty()).toBe(true)
      stack.push(3)
      expect(stack.peek()).toBe(3)
      expect(stack.pop()).toBe(3)
      expect(stack.isEmpty()).toBe(true)
    })

    it('clone after removeAll preserves state', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      stack.push(3)
      stack.removeAll((item) => item === 2)
      const cloned = stack.clone()
      expect(cloned.toArray()).toEqual([1, 3])
      expect(cloned.has(1)).toBe(true)
      expect(cloned.has(2)).toBe(false)
    })

    it('reverse then pop maintains correct order', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      stack.push(3)
      stack.reverse()
      expect(stack.pop()).toBe(1)
      expect(stack.pop()).toBe(2)
      expect(stack.pop()).toBe(3)
    })

    it('large stack with duplicates', () => {
      const stack = new HashStack<number>()
      for (let i = 0; i < 5000; i++) {
        stack.push(i % 100)
      }
      expect(stack.size).toBe(5000)
      expect(stack.stats().uniqueCount).toBe(100)
      expect(stack.has(0)).toBe(true)
      expect(stack.has(99)).toBe(true)
    })

    it('forEach does not modify stack', () => {
      const stack = new HashStack<number>()
      stack.push(1)
      stack.push(2)
      stack.push(3)
      stack.forEach(() => {})
      expect(stack.size).toBe(3)
      expect(stack.toArray()).toEqual([1, 2, 3])
    })

    it('removeAll first item preserves order of rest', () => {
      const stack = new HashStack<string>()
      stack.push('a')
      stack.push('b')
      stack.push('c')
      stack.removeAll((item) => item === 'a')
      expect(stack.toArray()).toEqual(['b', 'c'])
      expect(stack.peek()).toBe('c')
    })

    it('removeAll last item preserves order of rest', () => {
      const stack = new HashStack<string>()
      stack.push('a')
      stack.push('b')
      stack.push('c')
      stack.removeAll((item) => item === 'c')
      expect(stack.toArray()).toEqual(['a', 'b'])
      expect(stack.peek()).toBe('b')
    })
  })
})
