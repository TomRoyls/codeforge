import { describe, expect, it } from 'vitest'
import { MonotonicStack } from '../../src/utils/monotonic-stack.js'

describe('MonotonicStack', () => {
  it('pushes and peeks (increasing default)', () => {
    const ms = new MonotonicStack<number>()
    ms.push(3)
    ms.push(2)
    ms.push(1)
    expect(ms.peek()).toBe(1)
    expect(ms.size).toBe(3)
  })

  it('pops smaller elements on push (default monotonic increasing)', () => {
    const ms = new MonotonicStack<number>()
    ms.push(1)
    const popped = ms.push(3)
    expect(popped).toEqual([1])
    expect(ms.toArray()).toEqual([3])
  })

  it('pops when new element is strictly greater', () => {
    const ms = new MonotonicStack<number>((a, b) => a < b)
    ms.push(1)
    ms.push(2)
    ms.push(3)
    expect(ms.toArray()).toEqual([3])
  })

  it('handles empty stack', () => {
    const ms = new MonotonicStack<number>()
    expect(ms.isEmpty).toBe(true)
    expect(ms.peek()).toBeUndefined()
    expect(ms.pop()).toBeUndefined()
  })

  it('nextGreaterElements', () => {
    expect(MonotonicStack.nextGreaterElements([4, 5, 2, 25])).toEqual([5, 25, 25, -1])
  })

  it('nextGreaterElements no greater', () => {
    expect(MonotonicStack.nextGreaterElements([5, 4, 3, 2])).toEqual([-1, -1, -1, -1])
  })

  it('previousSmallerElements', () => {
    expect(MonotonicStack.previousSmallerElements([2, 5, 3, 7, 8])).toEqual([-1, 2, 2, 3, 7])
  })

  it('nextGreaterElements single element', () => {
    expect(MonotonicStack.nextGreaterElements([42])).toEqual([-1])
  })

  it('nextGreaterElements all same', () => {
    expect(MonotonicStack.nextGreaterElements([3, 3, 3])).toEqual([-1, -1, -1])
  })

  it('maintains increasing stack', () => {
    const ms = new MonotonicStack<number>((a, b) => a > b)
    ms.push(5)
    ms.push(3)
    ms.push(1)
    ms.push(4)
    expect(ms.toArray()).toEqual([1, 4])
  })

  it('toArray returns copy', () => {
    const ms = new MonotonicStack<number>()
    ms.push(1)
    const arr = ms.toArray()
    arr.push(99)
    expect(ms.size).toBe(1)
  })

  it('handles decreasing sequence', () => {
    const ms = new MonotonicStack<number>()
    ms.push(3)
    ms.push(2)
    ms.push(1)
    expect(ms.size).toBe(3)
    expect(ms.peek()).toBe(1)
  })

  it('handles size on empty stack', () => {
    const ms = new MonotonicStack<number>()
    expect(ms.size).toBe(0)
  })

  it('previousSmallerElements basic', () => {
    expect(MonotonicStack.previousSmallerElements([4, 3, 2, 5])).toEqual([-1, -1, -1, 2])
  })

  it('nextGreaterElements increasing', () => {
    expect(MonotonicStack.nextGreaterElements([1, 2, 3])).toEqual([2, 3, -1])
  })

  it('previousSmallerElements all same', () => {
    expect(MonotonicStack.previousSmallerElements([3, 3, 3])).toEqual([-1, -1, -1])
  })

  it('nextGreaterElements handles empty', () => {
    expect(MonotonicStack.nextGreaterElements([])).toEqual([])
  })

  it('previousSmallerElements handles empty', () => {
    expect(MonotonicStack.previousSmallerElements([])).toEqual([])
  })

  it('nextGreaterElements for decreasing array', () => {
    expect(MonotonicStack.nextGreaterElements([3, 2, 1])).toEqual([-1, -1, -1])
  })

  it('previousSmallerElements for sorted array', () => {
    expect(MonotonicStack.previousSmallerElements([1, 2, 3])).toEqual([-1, 1, 2])
  })

  it('handles large numbers', () => {
    const ms = new MonotonicStack<number>()
    ms.push(Number.MAX_SAFE_INTEGER)
    ms.push(Number.MAX_SAFE_INTEGER - 1)
    expect(ms.peek()).toBe(Number.MAX_SAFE_INTEGER - 1)
  })

  it('handles negative numbers', () => {
    const ms = new MonotonicStack<number>()
    ms.push(-5)
    ms.push(-3)
    ms.push(-1)
    expect(ms.peek()).toBe(-1)
  })

  it('handles zero values', () => {
    const ms = new MonotonicStack<number>()
    ms.push(0)
    ms.push(-1)
    ms.push(1)
    expect(ms.toArray()).toEqual([1])
  })

  it('handles string values with lexicographic order', () => {
    const ms = new MonotonicStack<string>()
    ms.push('zebra')
    ms.push('apple')
    ms.push('banana')
    expect(ms.peek()).toBe('banana')
  })

  it('returns empty array from push on empty stack', () => {
    const ms = new MonotonicStack<number>()
    const popped = ms.push(1)
    expect(popped).toEqual([])
  })

  it('pops all elements when pushing smallest', () => {
    const ms = new MonotonicStack<number>()
    ms.push(5)
    ms.push(4)
    ms.push(3)
    const popped = ms.push(1)
    expect(popped).toEqual([])
    expect(ms.toArray()).toEqual([5, 4, 3, 1])
  })

  it('preserves stack after multiple pops', () => {
    const ms = new MonotonicStack<number>()
    ms.push(1)
    ms.push(2)
    ms.push(3)
    ms.pop()
    ms.pop()
    expect(ms.peek()).toBeUndefined()
    expect(ms.size).toBe(0)
  })

  it('toArray returns copy of stack', () => {
    const ms = new MonotonicStack<number>()
    ms.push(1)
    ms.push(2)
    ms.push(3)
    const arr1 = ms.toArray()
    const arr2 = ms.toArray()
    arr1.push(99)
    expect(arr1).not.toEqual(arr2)
    expect(ms.size).toBe(1)
  })

  it('handles duplicate values', () => {
    const ms = new MonotonicStack<number>()
    ms.push(5)
    ms.push(5)
    ms.push(5)
    expect(ms.size).toBe(1)
    expect(ms.peek()).toBe(5)
  })

  it('custom compare function for monotonic decreasing', () => {
    const ms = new MonotonicStack<number>((a, b) => a <= b)
    ms.push(1)
    ms.push(2)
    ms.push(3)
    expect(ms.toArray()).toEqual([3])
  })

  it('handles alternating sequence', () => {
    const ms = new MonotonicStack<number>()
    ms.push(1)
    ms.push(3)
    ms.push(2)
    ms.push(4)
    expect(ms.toArray()).toEqual([4])
  })

  it('isEmpty updates correctly', () => {
    const ms = new MonotonicStack<number>()
    expect(ms.isEmpty).toBe(true)
    ms.push(1)
    expect(ms.isEmpty).toBe(false)
    ms.pop()
    expect(ms.isEmpty).toBe(true)
  })

  it('previousSmallerElements with duplicates', () => {
    expect(MonotonicStack.previousSmallerElements([2, 2, 1, 3])).toEqual([-1, -1, -1, 1])
  })

  it('previousSmallerElements single element', () => {
    expect(MonotonicStack.previousSmallerElements([42])).toEqual([-1])
  })

  it('previousSmallerElements decreasing sequence', () => {
    expect(MonotonicStack.previousSmallerElements([5, 4, 3, 2])).toEqual([-1, -1, -1, -1])
  })

  it('nextGreaterElements with negative numbers', () => {
    expect(MonotonicStack.nextGreaterElements([-3, -2, -1])).toEqual([-2, -1, -1])
  })

  it('previousSmallerElements with negative numbers', () => {
    expect(MonotonicStack.previousSmallerElements([-1, -2, -3])).toEqual([-1, -1, -1])
  })

  it('nextGreaterElements large array performance', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i)
    const result = MonotonicStack.nextGreaterElements(arr)
    expect(result[0]).toBe(1)
    expect(result[998]).toBe(999)
    expect(result[999]).toBe(-1)
  })

  it('previousSmallerElements large array', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i)
    const result = MonotonicStack.previousSmallerElements(arr)
    expect(result[0]).toBe(-1)
    expect(result[1]).toBe(0)
    expect(result[999]).toBe(998)
  })

  it('handles floating point numbers', () => {
    const ms = new MonotonicStack<number>()
    ms.push(1.5)
    ms.push(2.7)
    ms.push(0.3)
    expect(ms.peek()).toBe(0.3)
  })

  it('nextGreaterElements with floating point', () => {
    expect(MonotonicStack.nextGreaterElements([1.5, 2.7, 0.3])).toEqual([2.7, -1, -1])
  })

  it('previousSmallerElements with floating point', () => {
    expect(MonotonicStack.previousSmallerElements([2.7, 1.5, 3.2])).toEqual([-1, -1, 1.5])
  })

  it('maintains monotonic property after complex operations', () => {
    const ms = new MonotonicStack<number>()
    ms.push(5)
    ms.push(3)
    ms.push(7)
    ms.push(2)
    ms.push(6)
    expect(ms.toArray()).toEqual([7, 6])
  })

  it('handles mix of increasing and decreasing', () => {
    const ms = new MonotonicStack<number>()
    ms.push(1)
    ms.push(5)
    ms.push(3)
    ms.push(7)
    ms.push(2)
    expect(ms.toArray()).toEqual([7, 2])
  })

  it('previousSmallerElements with mixed values', () => {
    expect(MonotonicStack.previousSmallerElements([5, 1, 4, 2, 3])).toEqual([-1, -1, 1, 1, 2])
  })
})
