import { describe, it, expect } from 'vitest'
import { PersistentStack } from '../../src/utils/persistent-stack.js'

describe('PersistentStack', () => {
  it('creates empty stack via empty()', () => {
    const stack = PersistentStack.empty<number>()
    expect(stack.size).toBe(0)
    expect(stack.isEmpty()).toBe(true)
  })

  it('creates stack from items via of()', () => {
    const stack = PersistentStack.of(1, 2, 3)
    expect(stack.size).toBe(3)
    expect(stack.isEmpty()).toBe(false)
  })

  it('creates stack from single item via of()', () => {
    const stack = PersistentStack.of('a')
    expect(stack.size).toBe(1)
    expect(stack.isEmpty()).toBe(false)
  })

  it('pushes values onto empty stack', () => {
    const stack1 = PersistentStack.empty<number>()
    const stack2 = stack1.push(1)
    expect(stack1.size).toBe(0)
    expect(stack2.size).toBe(1)
    expect(stack2.peek()).toBe(1)
  })

  it('pushes multiple values', () => {
    const stack = PersistentStack.empty<number>()
    const stack1 = stack.push(1)
    const stack2 = stack1.push(2)
    const stack3 = stack2.push(3)
    expect(stack3.size).toBe(3)
    expect(stack3.peek()).toBe(3)
  })

  it('pops from empty stack returns empty', () => {
    const stack = PersistentStack.empty<number>()
    const popped = stack.pop()
    expect(popped.size).toBe(0)
  })

  it('pops single element stack returns empty', () => {
    const stack = PersistentStack.of(1)
    const popped = stack.pop()
    expect(popped.size).toBe(0)
  })

  it('pops removes top element', () => {
    const stack = PersistentStack.of(1, 2, 3)
    const popped = stack.pop()
    expect(popped.size).toBe(2)
    expect(popped.peek()).toBe(2)
  })

  it('peek returns top element', () => {
    const stack = PersistentStack.of(1, 2, 3)
    expect(stack.peek()).toBe(3)
  })

  it('peek on empty stack returns undefined', () => {
    const stack = PersistentStack.empty<number>()
    expect(stack.peek()).toBeUndefined()
  })

  it('toArray converts stack to array', () => {
    const stack = PersistentStack.of(1, 2, 3)
    const arr = stack.toArray()
    expect(arr).toEqual([3, 2, 1])
  })

  it('toArray on empty stack returns empty array', () => {
    const stack = PersistentStack.empty<number>()
    const arr = stack.toArray()
    expect(arr).toEqual([])
  })

  it('reverse reverses stack order', () => {
    const stack = PersistentStack.of(1, 2, 3)
    const reversed = stack.reverse()
    expect(reversed.toArray()).toEqual([1, 2, 3])
  })

  it('concat combines two stacks', () => {
    const stack1 = PersistentStack.of(1, 2)
    const stack2 = PersistentStack.of(3, 4)
    const combined = stack1.concat(stack2)
    expect(combined.toArray()).toEqual([2, 1, 4, 3])
  })

  it('concat with empty stack', () => {
    const stack1 = PersistentStack.of(1, 2)
    const stack2 = PersistentStack.empty<number>()
    const combined = stack1.concat(stack2)
    expect(combined.toArray()).toEqual([2, 1])
  })

  it('concat empty with non-empty stack', () => {
    const stack1 = PersistentStack.empty<number>()
    const stack2 = PersistentStack.of(1, 2)
    const combined = stack1.concat(stack2)
    expect(combined.toArray()).toEqual([2, 1])
  })

  it('handles string type', () => {
    const stack = PersistentStack.of('a', 'b', 'c')
    expect(stack.size).toBe(3)
    expect(stack.peek()).toBe('c')
  })

  it('multiple pops work correctly', () => {
    const stack = PersistentStack.of(1, 2, 3)
    const popped1 = stack.pop()
    const popped2 = popped1.pop()
    const popped3 = popped2.pop()
    expect(popped1.size).toBe(2)
    expect(popped2.size).toBe(1)
    expect(popped3.size).toBe(0)
  })

  it('push and peek', () => {
    const s0 = new PersistentStack<number>()
    const s1 = s0.push(42)
    expect(s1.peek()).toBe(42)
  })

  it('empty stack via empty() factory', () => {
    const s = PersistentStack.empty<number>()
    expect(s.isEmpty()).toBe(true)
    expect(s.size).toBe(0)
  })

  it('push and peek round trip', () => {
    const s = PersistentStack.empty<number>().push(42).push(7)
    expect(s.peek()).toBe(7)
    const popped = s.pop()
    expect(popped.peek()).toBe(42)
  })

  it('empty stack pop returns same stack', () => {
    const s = PersistentStack.empty<number>()
    expect(s.pop()).toBe(s)
  })

  it('push and peek roundtrip', () => {
    const s = PersistentStack.empty<number>().push(42)
    expect(s.peek()).toBe(42)
  })

  it('empty stack peek returns undefined', () => {
    const s = PersistentStack.empty<number>()
    expect(s.peek()).toBeUndefined()
  })
})