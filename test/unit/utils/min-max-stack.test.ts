import { describe, expect, it } from 'vitest'
import { MinMaxStack } from '../../../src/utils/min-max-stack.js'

describe('MinMaxStack', () => {
  it('should create empty stack', () => {
    const stack = new MinMaxStack<number>()
    expect(stack.size).toBe(0)
    expect(stack.isEmpty()).toBe(true)
  })

  it('should push single element', () => {
    const stack = new MinMaxStack<number>()
    stack.push(5)
    expect(stack.size).toBe(1)
    expect(stack.isEmpty()).toBe(false)
  })

  it('should pop single element', () => {
    const stack = new MinMaxStack<number>()
    stack.push(5)
    const popped = stack.pop()
    expect(popped).toBe(5)
    expect(stack.size).toBe(0)
    expect(stack.isEmpty()).toBe(true)
  })

  it('should peek at top element', () => {
    const stack = new MinMaxStack<number>()
    stack.push(5)
    expect(stack.peek()).toBe(5)
    stack.push(10)
    expect(stack.peek()).toBe(10)
  })

  it('should throw when peeking empty stack', () => {
    const stack = new MinMaxStack<number>()
    expect(() => stack.peek()).toThrow('Cannot peek empty MinMaxStack')
  })

  it('should throw when popping empty stack', () => {
    const stack = new MinMaxStack<number>()
    expect(() => stack.pop()).toThrow('Cannot pop from empty MinMaxStack')
  })

  it('should throw when getting min from empty stack', () => {
    const stack = new MinMaxStack<number>()
    expect(() => stack.min()).toThrow('Cannot get min of empty MinMaxStack')
  })

  it('should throw when getting max from empty stack', () => {
    const stack = new MinMaxStack<number>()
    expect(() => stack.max()).toThrow('Cannot get max of empty MinMaxStack')
  })

  it('should return min correctly', () => {
    const stack = new MinMaxStack<number>()
    stack.push(5)
    expect(stack.min()).toBe(5)
    stack.push(3)
    expect(stack.min()).toBe(3)
    stack.push(7)
    expect(stack.min()).toBe(3)
  })

  it('should return max correctly', () => {
    const stack = new MinMaxStack<number>()
    stack.push(5)
    expect(stack.max()).toBe(5)
    stack.push(3)
    expect(stack.max()).toBe(5)
    stack.push(7)
    expect(stack.max()).toBe(7)
  })

  it('should handle all same values', () => {
    const stack = new MinMaxStack<number>()
    stack.push(5)
    stack.push(5)
    stack.push(5)
    expect(stack.min()).toBe(5)
    expect(stack.max()).toBe(5)
    expect(stack.size).toBe(3)
  })

  it('should update min after pop', () => {
    const stack = new MinMaxStack<number>()
    stack.push(5)
    stack.push(3)
    stack.push(7)
    stack.pop()
    expect(stack.min()).toBe(3)
    expect(stack.max()).toBe(5)
  })

  it('should update max after pop', () => {
    const stack = new MinMaxStack<number>()
    stack.push(5)
    stack.push(7)
    stack.push(3)
    stack.pop()
    expect(stack.min()).toBe(5)
    expect(stack.max()).toBe(7)
  })

  it('should handle push pop interleaving', () => {
    const stack = new MinMaxStack<number>()
    stack.push(1)
    expect(stack.min()).toBe(1)
    expect(stack.max()).toBe(1)
    stack.push(5)
    expect(stack.min()).toBe(1)
    expect(stack.max()).toBe(5)
    stack.pop()
    expect(stack.min()).toBe(1)
    expect(stack.max()).toBe(1)
    stack.push(3)
    expect(stack.min()).toBe(1)
    expect(stack.max()).toBe(3)
  })

  it('should clear stack', () => {
    const stack = new MinMaxStack<number>()
    stack.push(5)
    stack.push(3)
    stack.push(7)
    stack.clear()
    expect(stack.size).toBe(0)
    expect(stack.isEmpty()).toBe(true)
  })

  it('should convert to array', () => {
    const stack = new MinMaxStack<number>()
    stack.push(1)
    stack.push(2)
    stack.push(3)
    const arr = stack.toArray()
    expect(arr).toEqual([1, 2, 3])
  })

  it('should handle descending values', () => {
    const stack = new MinMaxStack<number>()
    stack.push(10)
    stack.push(8)
    stack.push(6)
    stack.push(4)
    stack.push(2)
    expect(stack.min()).toBe(2)
    expect(stack.max()).toBe(10)
    expect(stack.peek()).toBe(2)
  })

  it('should handle ascending values', () => {
    const stack = new MinMaxStack<number>()
    stack.push(2)
    stack.push(4)
    stack.push(6)
    stack.push(8)
    stack.push(10)
    expect(stack.min()).toBe(2)
    expect(stack.max()).toBe(10)
    expect(stack.peek()).toBe(10)
  })

  it('should handle min then max order', () => {
    const stack = new MinMaxStack<number>()
    stack.push(1)
    stack.push(10)
    stack.push(2)
    stack.push(9)
    stack.push(3)
    expect(stack.min()).toBe(1)
    expect(stack.max()).toBe(10)
  })

  it('should handle max then min order', () => {
    const stack = new MinMaxStack<number>()
    stack.push(10)
    stack.push(1)
    stack.push(9)
    stack.push(2)
    stack.push(8)
    expect(stack.min()).toBe(1)
    expect(stack.max()).toBe(10)
  })

  it('should work with negative numbers', () => {
    const stack = new MinMaxStack<number>()
    stack.push(-5)
    stack.push(3)
    stack.push(-7)
    stack.push(1)
    expect(stack.min()).toBe(-7)
    expect(stack.max()).toBe(3)
  })

  it('should work with strings', () => {
    const stack = new MinMaxStack<string>((a, b) => a.localeCompare(b))
    stack.push('banana')
    stack.push('apple')
    stack.push('cherry')
    expect(stack.min()).toBe('apple')
    expect(stack.max()).toBe('cherry')
  })

  it('should work with objects', () => {
    const stack = new MinMaxStack<{ value: number }>((a, b) => a.value - b.value)
    stack.push({ value: 5 })
    stack.push({ value: 3 })
    stack.push({ value: 7 })
    expect(stack.min().value).toBe(3)
    expect(stack.max().value).toBe(7)
  })

  it('should track min correctly with multiple pops', () => {
    const stack = new MinMaxStack<number>()
    stack.push(10)
    stack.push(5)
    stack.push(15)
    stack.push(3)
    stack.push(20)
    stack.pop()
    expect(stack.min()).toBe(3)
    stack.pop()
    expect(stack.min()).toBe(5)
    stack.pop()
    expect(stack.min()).toBe(5)
  })

  it('should track max correctly with multiple pops', () => {
    const stack = new MinMaxStack<number>()
    stack.push(10)
    stack.push(20)
    stack.push(5)
    stack.push(15)
    stack.push(3)
    stack.pop()
    expect(stack.max()).toBe(20)
    stack.pop()
    expect(stack.max()).toBe(20)
    stack.pop()
    expect(stack.max()).toBe(20)
  })

  it('should handle large number of elements', () => {
    const stack = new MinMaxStack<number>()
    for (let i = 0; i < 1000; i++) {
      stack.push(i)
    }
    expect(stack.min()).toBe(0)
    expect(stack.max()).toBe(999)
    expect(stack.size).toBe(1000)
  })

  it('should maintain correct min after clearing and refilling', () => {
    const stack = new MinMaxStack<number>()
    stack.push(10)
    stack.push(5)
    stack.push(15)
    stack.clear()
    stack.push(1)
    stack.push(3)
    stack.push(2)
    expect(stack.min()).toBe(1)
    expect(stack.max()).toBe(3)
  })

  it('should return array in push order', () => {
    const stack = new MinMaxStack<number>()
    stack.push(1)
    stack.push(2)
    stack.push(3)
    stack.push(4)
    stack.push(5)
    const arr = stack.toArray()
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('should handle duplicate values correctly', () => {
    const stack = new MinMaxStack<number>()
    stack.push(5)
    stack.push(3)
    stack.push(5)
    stack.push(3)
    stack.push(5)
    expect(stack.min()).toBe(3)
    expect(stack.max()).toBe(5)
    stack.pop()
    expect(stack.min()).toBe(3)
    expect(stack.max()).toBe(5)
  })
})