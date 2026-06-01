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

  it('handles empty stack', () => {
    const ms = new MonotonicStack<number>()
    expect(ms.size).toBe(0)
    expect(ms.isEmpty).toBe(true)
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
})
