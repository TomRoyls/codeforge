import { beforeEach, describe, expect, it } from 'vitest'

import { MinMaxStack } from '../../src/utils/min-max-stack.js'

// ─── Empty stack operations ──────────────────────────────
describe('MinMaxStack - empty stack', () => {
  it('isEmpty returns true on empty stack', () => {
    const stack = new MinMaxStack<number>()
    expect(stack.isEmpty()).toBe(true)
  })

  it('size is 0 on empty stack', () => {
    const stack = new MinMaxStack<number>()
    expect(stack.size).toBe(0)
  })

  it('pop throws RangeError on empty stack', () => {
    const stack = new MinMaxStack<number>()
    expect(() => stack.pop()).toThrow(RangeError)
    expect(() => stack.pop()).toThrow('Cannot pop from empty MinMaxStack')
  })

  it('peek throws RangeError on empty stack', () => {
    const stack = new MinMaxStack<number>()
    expect(() => stack.peek()).toThrow(RangeError)
    expect(() => stack.peek()).toThrow('Cannot peek empty MinMaxStack')
  })

  it('min throws RangeError on empty stack', () => {
    const stack = new MinMaxStack<number>()
    expect(() => stack.min()).toThrow(RangeError)
    expect(() => stack.min()).toThrow('Cannot get min of empty MinMaxStack')
  })

  it('max throws RangeError on empty stack', () => {
    const stack = new MinMaxStack<number>()
    expect(() => stack.max()).toThrow(RangeError)
    expect(() => stack.max()).toThrow('Cannot get max of empty MinMaxStack')
  })

  it('toArray returns empty array on empty stack', () => {
    const stack = new MinMaxStack<number>()
    expect(stack.toArray()).toEqual([])
  })
})

// ─── Push and peek ───────────────────────────────────────
describe('MinMaxStack - push and peek', () => {
  it('pushes a single value and peeks it', () => {
    const stack = new MinMaxStack<number>()
    stack.push(42)
    expect(stack.peek()).toBe(42)
    expect(stack.size).toBe(1)
    expect(stack.isEmpty()).toBe(false)
  })

  it('peek does not remove the element', () => {
    const stack = new MinMaxStack<number>()
    stack.push(10)
    expect(stack.peek()).toBe(10)
    expect(stack.peek()).toBe(10)
    expect(stack.size).toBe(1)
  })

  it('peek returns the most recently pushed value', () => {
    const stack = new MinMaxStack<number>()
    stack.push(1)
    stack.push(2)
    stack.push(3)
    expect(stack.peek()).toBe(3)
  })
})

// ─── Pop ─────────────────────────────────────────────────
describe('MinMaxStack - pop', () => {
  it('pops values in LIFO order', () => {
    const stack = new MinMaxStack<number>()
    stack.push(1)
    stack.push(2)
    stack.push(3)
    expect(stack.pop()).toBe(3)
    expect(stack.pop()).toBe(2)
    expect(stack.pop()).toBe(1)
  })

  it('updates size after pop', () => {
    const stack = new MinMaxStack<number>()
    stack.push(1)
    stack.push(2)
    expect(stack.size).toBe(2)
    stack.pop()
    expect(stack.size).toBe(1)
    stack.pop()
    expect(stack.size).toBe(0)
  })

  it('stack is empty after popping all elements', () => {
    const stack = new MinMaxStack<number>()
    stack.push(10)
    stack.pop()
    expect(stack.isEmpty()).toBe(true)
  })
})

// ─── Min tracking ────────────────────────────────────────
describe('MinMaxStack - min tracking', () => {
  it('returns the minimum value', () => {
    const stack = new MinMaxStack<number>()
    stack.push(5)
    stack.push(3)
    stack.push(7)
    expect(stack.min()).toBe(3)
  })

  it('updates min after popping the minimum', () => {
    const stack = new MinMaxStack<number>()
    stack.push(5)
    stack.push(3)
    stack.push(7)
    stack.pop()
    expect(stack.min()).toBe(3)
    stack.pop()
    expect(stack.min()).toBe(5)
  })

  it('handles duplicate minimum values', () => {
    const stack = new MinMaxStack<number>()
    stack.push(3)
    stack.push(3)
    stack.push(5)
    expect(stack.min()).toBe(3)
    stack.pop()
    expect(stack.min()).toBe(3)
    stack.pop()
    expect(stack.min()).toBe(3)
  })

  it('tracks min with decreasing sequence', () => {
    const stack = new MinMaxStack<number>()
    stack.push(10)
    expect(stack.min()).toBe(10)
    stack.push(5)
    expect(stack.min()).toBe(5)
    stack.push(1)
    expect(stack.min()).toBe(1)
  })
})

// ─── Max tracking ────────────────────────────────────────
describe('MinMaxStack - max tracking', () => {
  it('returns the maximum value', () => {
    const stack = new MinMaxStack<number>()
    stack.push(5)
    stack.push(3)
    stack.push(7)
    expect(stack.max()).toBe(7)
  })

  it('updates max after popping the maximum', () => {
    const stack = new MinMaxStack<number>()
    stack.push(5)
    stack.push(7)
    stack.push(3)
    stack.pop()
    expect(stack.max()).toBe(7)
    stack.pop()
    expect(stack.max()).toBe(5)
  })

  it('handles duplicate maximum values', () => {
    const stack = new MinMaxStack<number>()
    stack.push(7)
    stack.push(7)
    stack.push(3)
    expect(stack.max()).toBe(7)
    stack.pop()
    expect(stack.max()).toBe(7)
  })

  it('tracks max with increasing sequence', () => {
    const stack = new MinMaxStack<number>()
    stack.push(1)
    expect(stack.max()).toBe(1)
    stack.push(5)
    expect(stack.max()).toBe(5)
    stack.push(10)
    expect(stack.max()).toBe(10)
  })
})

// ─── Clear ───────────────────────────────────────────────
describe('MinMaxStack - clear', () => {
  it('clears all elements', () => {
    const stack = new MinMaxStack<number>()
    stack.push(1)
    stack.push(2)
    stack.push(3)
    stack.clear()
    expect(stack.isEmpty()).toBe(true)
    expect(stack.size).toBe(0)
  })

  it('allows push after clear', () => {
    const stack = new MinMaxStack<number>()
    stack.push(1)
    stack.clear()
    stack.push(10)
    expect(stack.peek()).toBe(10)
    expect(stack.min()).toBe(10)
    expect(stack.max()).toBe(10)
  })

  it('throws on operations after clear', () => {
    const stack = new MinMaxStack<number>()
    stack.push(1)
    stack.clear()
    expect(() => stack.pop()).toThrow(RangeError)
    expect(() => stack.peek()).toThrow(RangeError)
    expect(() => stack.min()).toThrow(RangeError)
    expect(() => stack.max()).toThrow(RangeError)
  })
})

// ─── toArray ─────────────────────────────────────────────
describe('MinMaxStack - toArray', () => {
  it('returns elements from bottom to top', () => {
    const stack = new MinMaxStack<number>()
    stack.push(1)
    stack.push(2)
    stack.push(3)
    expect(stack.toArray()).toEqual([1, 2, 3])
  })

  it('does not modify the stack', () => {
    const stack = new MinMaxStack<number>()
    stack.push(1)
    stack.push(2)
    stack.toArray()
    expect(stack.size).toBe(2)
    expect(stack.peek()).toBe(2)
  })
})

// ─── Custom comparator ───────────────────────────────────
describe('MinMaxStack - custom comparator', () => {
  it('uses custom comparator for min/max with objects', () => {
    interface Item {
      priority: number
      name: string
    }
    const stack = new MinMaxStack<Item>((a, b) => a.priority - b.priority)
    stack.push({ priority: 5, name: 'c' })
    stack.push({ priority: 1, name: 'a' })
    stack.push({ priority: 3, name: 'b' })
    expect(stack.min().name).toBe('a')
    expect(stack.max().name).toBe('c')
  })

  it('uses custom comparator for string length', () => {
    const stack = new MinMaxStack<string>((a, b) => a.length - b.length)
    stack.push('hi')
    stack.push('hello')
    stack.push('hey')
    expect(stack.min()).toBe('hi')
    expect(stack.max()).toBe('hello')
  })
})

// ─── Mixed operations ────────────────────────────────────
describe('MinMaxStack - mixed operations', () => {
  it('interleaved push and pop maintain correct min/max', () => {
    const stack = new MinMaxStack<number>()
    stack.push(5)
    expect(stack.min()).toBe(5)
    expect(stack.max()).toBe(5)

    stack.push(2)
    expect(stack.min()).toBe(2)
    expect(stack.max()).toBe(5)

    stack.push(8)
    expect(stack.min()).toBe(2)
    expect(stack.max()).toBe(8)

    stack.pop()
    expect(stack.min()).toBe(2)
    expect(stack.max()).toBe(5)

    stack.push(1)
    expect(stack.min()).toBe(1)
    expect(stack.max()).toBe(5)

    stack.pop()
    expect(stack.min()).toBe(2)
    expect(stack.max()).toBe(5)
  })
})
