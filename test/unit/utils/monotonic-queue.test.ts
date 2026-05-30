import { describe, expect, it } from 'vitest'
import { MonotonicQueue } from '../../../src/utils/monotonic-queue.js'

describe('MonotonicQueue', () => {
  it('constructs with default options', () => {
    const queue = new MonotonicQueue<number>()
    expect(queue.size).toBe(0)
    expect(queue.isEmpty()).toBe(true)
    expect(queue.getMode()).toBe('min')
    expect(queue.getWindowSize()).toBeUndefined()
  })

  it('constructs with min mode', () => {
    const queue = new MonotonicQueue<number>({ mode: 'min' })
    expect(queue.getMode()).toBe('min')
  })

  it('constructs with max mode', () => {
    const queue = new MonotonicQueue<number>({ mode: 'max' })
    expect(queue.getMode()).toBe('max')
  })

  it('constructs with windowSize', () => {
    const queue = new MonotonicQueue<number>({ windowSize: 5 })
    expect(queue.getWindowSize()).toBe(5)
  })

  it('constructs with both mode and windowSize', () => {
    const queue = new MonotonicQueue<number>({ mode: 'max', windowSize: 3 })
    expect(queue.getMode()).toBe('max')
    expect(queue.getWindowSize()).toBe(3)
  })

  it('pushes single value to empty queue', () => {
    const queue = new MonotonicQueue<number>()
    queue.push(5)
    expect(queue.size).toBe(1)
    expect(queue.isEmpty()).toBe(false)
  })

  it('pushes multiple values', () => {
    const queue = new MonotonicQueue<number>()
    queue.push(1)
    queue.push(2)
    queue.push(3)
    expect(queue.size).toBe(3)
  })

  it('throws error when getting current from empty queue', () => {
    const queue = new MonotonicQueue<number>()
    expect(() => queue.current()).toThrow(RangeError)
  })

  it('returns correct current for min queue', () => {
    const queue = new MonotonicQueue<number>({ mode: 'min' })
    queue.push(5)
    queue.push(2)
    queue.push(8)
    expect(queue.current()).toBe(2)
  })

  it('returns correct current for max queue', () => {
    const queue = new MonotonicQueue<number>({ mode: 'max' })
    queue.push(5)
    queue.push(2)
    queue.push(8)
    expect(queue.current()).toBe(8)
  })

  it('updates current after new push in min queue', () => {
    const queue = new MonotonicQueue<number>({ mode: 'min' })
    queue.push(5)
    queue.push(3)
    expect(queue.current()).toBe(3)
    queue.push(1)
    expect(queue.current()).toBe(1)
  })

  it('updates current after new push in max queue', () => {
    const queue = new MonotonicQueue<number>({ mode: 'max' })
    queue.push(5)
    queue.push(3)
    expect(queue.current()).toBe(5)
    queue.push(10)
    expect(queue.current()).toBe(10)
  })

  it('returns zero size for empty queue', () => {
    const queue = new MonotonicQueue<number>()
    expect(queue.size).toBe(0)
  })

  it('returns correct size after pushes', () => {
    const queue = new MonotonicQueue<number>()
    queue.push(1)
    queue.push(2)
    queue.push(3)
    expect(queue.size).toBe(3)
  })

  it('returns true for isEmpty on empty queue', () => {
    const queue = new MonotonicQueue<number>()
    expect(queue.isEmpty()).toBe(true)
  })

  it('returns false for isEmpty on non-empty queue', () => {
    const queue = new MonotonicQueue<number>()
    queue.push(1)
    expect(queue.isEmpty()).toBe(false)
  })

  it('clears queue', () => {
    const queue = new MonotonicQueue<number>()
    queue.push(1)
    queue.push(2)
    queue.push(3)
    queue.clear()
    expect(queue.size).toBe(0)
    expect(queue.isEmpty()).toBe(true)
  })

  it('toArray returns empty array for empty queue', () => {
    const queue = new MonotonicQueue<number>()
    expect(queue.toArray()).toEqual([])
  })

  it('toArray returns all elements in order', () => {
    const queue = new MonotonicQueue<number>()
    queue.push(1)
    queue.push(2)
    queue.push(3)
    expect(queue.toArray()).toEqual([1, 2, 3])
  })

  it('toArray works after clear', () => {
    const queue = new MonotonicQueue<number>()
    queue.push(1)
    queue.push(2)
    queue.clear()
    expect(queue.toArray()).toEqual([])
  })

  it('respects windowSize by removing old elements', () => {
    const queue = new MonotonicQueue<number>({ windowSize: 3 })
    queue.push(1)
    queue.push(2)
    queue.push(3)
    expect(queue.size).toBe(3)
    queue.push(4)
    expect(queue.size).toBe(3)
  })

  it('updates current correctly after window expiration in min queue', () => {
    const queue = new MonotonicQueue<number>({ mode: 'min', windowSize: 2 })
    queue.push(1)
    queue.push(2)
    expect(queue.current()).toBe(1)
    queue.push(3)
    expect(queue.size).toBe(2)
    expect(queue.current()).toBe(2)
  })

  it('updates current correctly after window expiration in max queue', () => {
    const queue = new MonotonicQueue<number>({ mode: 'max', windowSize: 2 })
    queue.push(1)
    queue.push(5)
    expect(queue.current()).toBe(5)
    queue.push(3)
    expect(queue.size).toBe(2)
    expect(queue.current()).toBe(5)
  })

  it('handles equal values in min queue', () => {
    const queue = new MonotonicQueue<number>({ mode: 'min' })
    queue.push(5)
    queue.push(5)
    queue.push(5)
    expect(queue.current()).toBe(5)
  })

  it('handles equal values in max queue', () => {
    const queue = new MonotonicQueue<number>({ mode: 'max' })
    queue.push(5)
    queue.push(5)
    queue.push(5)
    expect(queue.current()).toBe(5)
  })

  it('handles decreasing sequence in min queue', () => {
    const queue = new MonotonicQueue<number>({ mode: 'min' })
    queue.push(5)
    queue.push(4)
    queue.push(3)
    queue.push(2)
    queue.push(1)
    expect(queue.current()).toBe(1)
  })

  it('handles increasing sequence in max queue', () => {
    const queue = new MonotonicQueue<number>({ mode: 'max' })
    queue.push(1)
    queue.push(2)
    queue.push(3)
    queue.push(4)
    queue.push(5)
    expect(queue.current()).toBe(5)
  })

  it('works with string values and default comparison', () => {
    const queue = new MonotonicQueue<string>()
    queue.push('banana')
    queue.push('apple')
    queue.push('cherry')
    expect(queue.size).toBe(3)
  })

  it('works with custom comparison function', () => {
    const queue = new MonotonicQueue<number>(
      { mode: 'min' },
      (a, b) => Math.abs(a) - Math.abs(b)
    )
    queue.push(-5)
    queue.push(3)
    queue.push(-1)
    expect(queue.current()).toBe(-1)
  })

  it('handles windowSize of 1', () => {
    const queue = new MonotonicQueue<number>({ windowSize: 1 })
    queue.push(1)
    expect(queue.size).toBe(1)
    queue.push(2)
    expect(queue.size).toBe(1)
  })

  it('handles large number of pushes', () => {
    const queue = new MonotonicQueue<number>()
    for (let i = 0; i < 1000; i++) {
      queue.push(i)
    }
    expect(queue.size).toBe(1000)
  })

  it('handles mixed sequence in min queue', () => {
    const queue = new MonotonicQueue<number>({ mode: 'min' })
    queue.push(10)
    queue.push(3)
    queue.push(7)
    queue.push(1)
    queue.push(5)
    expect(queue.current()).toBe(1)
  })

  it('handles mixed sequence in max queue', () => {
    const queue = new MonotonicQueue<number>({ mode: 'max' })
    queue.push(1)
    queue.push(7)
    queue.push(3)
    queue.push(10)
    queue.push(5)
    expect(queue.current()).toBe(10)
  })

  it('toArray returns elements in insertion order after window expiration', () => {
    const queue = new MonotonicQueue<number>({ windowSize: 3 })
    queue.push(1)
    queue.push(2)
    queue.push(3)
    queue.push(4)
    queue.push(5)
    expect(queue.toArray()).toEqual([3, 4, 5])
  })

  it('handles negative values in min queue', () => {
    const queue = new MonotonicQueue<number>({ mode: 'min' })
    queue.push(-1)
    queue.push(-5)
    queue.push(-3)
    expect(queue.current()).toBe(-5)
  })

  it('handles negative values in max queue', () => {
    const queue = new MonotonicQueue<number>({ mode: 'max' })
    queue.push(-1)
    queue.push(-5)
    queue.push(-3)
    expect(queue.current()).toBe(-1)
  })

  it('handles zero values', () => {
    const queue = new MonotonicQueue<number>({ mode: 'min' })
    queue.push(0)
    queue.push(1)
    queue.push(-1)
    expect(queue.current()).toBe(-1)
  })

  it('preserves mode after clear', () => {
    const queue = new MonotonicQueue<number>({ mode: 'max' })
    queue.push(1)
    queue.clear()
    expect(queue.getMode()).toBe('max')
  })

  it('preserves windowSize after clear', () => {
    const queue = new MonotonicQueue<number>({ windowSize: 5 })
    queue.push(1)
    queue.clear()
    expect(queue.getWindowSize()).toBe(5)
  })

  it('handles duplicate minimum values in min queue', () => {
    const queue = new MonotonicQueue<number>({ mode: 'min' })
    queue.push(1)
    queue.push(1)
    queue.push(2)
    queue.push(1)
    expect(queue.current()).toBe(1)
  })

  it('handles duplicate maximum values in max queue', () => {
    const queue = new MonotonicQueue<number>({ mode: 'max' })
    queue.push(5)
    queue.push(5)
    queue.push(3)
    queue.push(5)
    expect(queue.current()).toBe(5)
  })
})