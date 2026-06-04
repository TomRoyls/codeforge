import { describe, expect, it } from 'vitest'
import { DequeMin } from '../../src/utils/deque-min.js'

describe('DequeMin', () => {
  it('tracks minimum after pushBack', () => {
    const dq = new DequeMin()
    dq.pushBack(5)
    dq.pushBack(3)
    dq.pushBack(7)
    expect(dq.min).toBe(3)
  })

  it('updates min after popFront', () => {
    const dq = new DequeMin()
    dq.pushBack(2)
    dq.pushBack(5)
    dq.pushBack(1)
    dq.popFront()
    expect(dq.min).toBe(1)
  })

  it('handles popFront when min removed', () => {
    const dq = new DequeMin()
    dq.pushBack(4)
    dq.pushBack(2)
    dq.pushBack(6)
    dq.popFront()
    expect(dq.min).toBe(2)
    dq.popFront()
    expect(dq.min).toBe(6)
  })

  it('returns undefined min for empty', () => {
    const dq = new DequeMin()
    expect(dq.min).toBeUndefined()
  })

  it('popFront on empty returns undefined', () => {
    const dq = new DequeMin()
    expect(dq.popFront()).toBeUndefined()
  })

  it('tracks size', () => {
    const dq = new DequeMin()
    expect(dq.isEmpty).toBe(true)
    dq.pushBack(1)
    expect(dq.size).toBe(1)
    expect(dq.isEmpty).toBe(false)
  })

  it('toArray returns elements', () => {
    const dq = new DequeMin()
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    expect(dq.toArray()).toEqual([1, 2, 3])
  })

  it('handles equal values', () => {
    const dq = new DequeMin()
    dq.pushBack(3)
    dq.pushBack(3)
    dq.pushBack(3)
    expect(dq.min).toBe(3)
    dq.popFront()
    expect(dq.min).toBe(3)
  })

  it('sliding window min simulation', () => {
    const arr = [4, 2, 1, 3, 5]
    const windowSize = 3
    const dq = new DequeMin()
    const mins: number[] = []
    for (let i = 0; i < arr.length; i++) {
      dq.pushBack(arr[i]!)
      if (i >= windowSize) dq.popFront()
      if (i >= windowSize - 1) mins.push(dq.min!)
    }
    expect(mins).toEqual([1, 1, 1])
  })

  it('handles decreasing sequence', () => {
    const dq = new DequeMin()
    dq.pushBack(5)
    dq.pushBack(4)
    dq.pushBack(3)
    expect(dq.min).toBe(3)
  })

  it('handles increasing sequence', () => {
    const dq = new DequeMin()
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    expect(dq.min).toBe(1)
    dq.popFront()
    expect(dq.min).toBe(2)
  })

  it('handles single element lifecycle', () => {
    const dq = new DequeMin()
    dq.pushBack(42)
    expect(dq.min).toBe(42)
    expect(dq.popFront()).toBe(42)
    expect(dq.min).toBeUndefined()
  })

  it('handles negative values', () => {
    const dq = new DequeMin()
    dq.pushBack(-5)
    dq.pushBack(-3)
    dq.pushBack(-10)
    expect(dq.min).toBe(-10)
  })

  it('handles pop all elements', () => {
    const dq = new DequeMin()
    dq.pushBack(1)
    dq.pushBack(2)
    dq.popFront()
    dq.popFront()
    expect(dq.size).toBe(0)
  })

  it('handles zero values', () => {
    const dq = new DequeMin()
    dq.pushBack(0)
    dq.pushBack(0)
    expect(dq.min).toBe(0)
    dq.popFront()
    expect(dq.min).toBe(0)
  })

  it('handles decreasing then increasing', () => {
    const dq = new DequeMin()
    dq.pushBack(5)
    dq.pushBack(3)
    dq.pushBack(1)
    dq.pushBack(4)
    expect(dq.min).toBe(1)
  })

  it('handles empty deque min is undefined', () => {
    const dq = new DequeMin()
    expect(dq.min).toBeUndefined()
  })

  it('min tracks pushed values', () => {
    const dq = new DequeMin()
    dq.pushBack(5)
    dq.pushBack(3)
    dq.pushBack(7)
    expect(dq.min).toBe(3)
  })

  it('min updates after popFront', () => {
    const dq = new DequeMin()
    dq.pushBack(5)
    dq.pushBack(3)
    dq.pushBack(7)
    dq.popFront()
    expect(dq.min).toBe(3)
  })

  it('single element min is itself', () => {
    const dq = new DequeMin()
    dq.pushBack(42)
    expect(dq.min).toBe(42)
  })

  it('min updates after pushBack of smaller', () => {
    const dq = new DequeMin()
    dq.pushBack(5)
    dq.pushBack(3)
    expect(dq.min).toBe(3)
  })

  it('empty deque min is undefined', () => {
    const dq = new DequeMin<number>()
    expect(dq.min).toBeUndefined()
  })

  it('single element min is that element', () => {
    const dq = new DequeMin<number>()
    dq.pushBack(5)
    expect(dq.min).toBe(5)
  })

  it('min updates on push', () => {
    const dq = new DequeMin<number>()
    dq.pushBack(5)
    dq.pushBack(3)
    expect(dq.min).toBe(3)
  })
})
