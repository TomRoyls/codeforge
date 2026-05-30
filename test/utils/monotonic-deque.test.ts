import { describe, it, expect } from 'vitest'
import { MonotonicDeque } from '../../src/utils/monotonic-deque.js'

describe('MonotonicDeque', () => {
  it('creates min mode deque by default', () => {
    const deque = new MonotonicDeque<number>()
    deque.push(3)
    deque.push(1)
    deque.push(2)
    expect(deque.front()).toBe(1)
    expect(deque.back()).toBe(2)
  })

  it('creates max mode deque', () => {
    const deque = new MonotonicDeque<number>('max')
    deque.push(1)
    deque.push(3)
    deque.push(2)
    expect(deque.front()).toBe(3)
    expect(deque.back()).toBe(2)
  })

  it('maintains min property after multiple pushes', () => {
    const deque = new MonotonicDeque<number>('min')
    deque.push(5)
    deque.push(3)
    deque.push(7)
    deque.push(1)
    deque.push(4)
    expect(deque.front()).toBe(1)
    expect(deque.size).toBe(2)
  })

  it('maintains max property after multiple pushes', () => {
    const deque = new MonotonicDeque<number>('max')
    deque.push(1)
    deque.push(5)
    deque.push(2)
    deque.push(8)
    deque.push(3)
    expect(deque.front()).toBe(8)
    expect(deque.size).toBe(2)
  })

  it('returns undefined for front on empty deque', () => {
    const deque = new MonotonicDeque<number>()
    expect(deque.front()).toBeUndefined()
  })

  it('returns undefined for back on empty deque', () => {
    const deque = new MonotonicDeque<number>()
    expect(deque.back()).toBeUndefined()
  })

  it('shifts and removes front element', () => {
    const deque = new MonotonicDeque<number>()
    deque.push(3)
    deque.push(1)
    deque.push(2)
    const shifted = deque.shift()
    expect(shifted).toBe(1)
    expect(deque.front()).toBe(2)
    expect(deque.size).toBe(1)
  })

  it('shift returns undefined on empty deque', () => {
    const deque = new MonotonicDeque<number>()
    expect(deque.shift()).toBeUndefined()
  })

  it('pops and removes back element', () => {
    const deque = new MonotonicDeque<number>()
    deque.push(1)
    deque.push(2)
    deque.push(4)
    const popped = deque.pop()
    expect(popped).toBe(4)
    expect(deque.back()).toBe(2)
    expect(deque.size).toBe(2)
  })

  it('pop returns undefined on empty deque', () => {
    const deque = new MonotonicDeque<number>()
    expect(deque.pop()).toBeUndefined()
  })

  it('expires elements before given index', () => {
    const deque = new MonotonicDeque<number>()
    const idx1 = deque.push(5)
    const idx2 = deque.push(3)
    const idx3 = deque.push(7)
    deque.expireBefore(idx2)
    expect(deque.size).toBe(2)
    expect(deque.front()).toBe(3)
  })

  it('expireBefore with index beyond deque does nothing', () => {
    const deque = new MonotonicDeque<number>()
    deque.push(5)
    deque.push(3)
    deque.push(7)
    deque.expireBefore(0)
    expect(deque.size).toBe(2)
    expect(deque.front()).toBe(3)
  })

  it('correctly reports size', () => {
    const deque = new MonotonicDeque<number>()
    expect(deque.size).toBe(0)
    deque.push(1)
    expect(deque.size).toBe(1)
    deque.push(2)
    expect(deque.size).toBe(2)
    deque.shift()
    expect(deque.size).toBe(1)
  })

  it('converts to array', () => {
    const deque = new MonotonicDeque<number>('max')
    deque.push(1)
    deque.push(5)
    deque.push(2)
    deque.push(8)
    deque.push(3)
    const arr = deque.toArray()
    expect(arr).toEqual([8, 3])
  })

  it('handles negative numbers in min mode', () => {
    const deque = new MonotonicDeque<number>('min')
    deque.push(-1)
    deque.push(-5)
    deque.push(-3)
    expect(deque.front()).toBe(-5)
  })

  it('handles negative numbers in max mode', () => {
    const deque = new MonotonicDeque<number>('max')
    deque.push(-1)
    deque.push(-5)
    deque.push(-3)
    expect(deque.front()).toBe(-1)
  })

  it('handles zero values', () => {
    const deque = new MonotonicDeque<number>('min')
    deque.push(1)
    deque.push(0)
    deque.push(-1)
    expect(deque.front()).toBe(-1)
  })

  it('handles equal values', () => {
    const deque = new MonotonicDeque<number>('min')
    deque.push(5)
    deque.push(5)
    deque.push(5)
    expect(deque.front()).toBe(5)
    expect(deque.size).toBe(3)
  })

  it('compacts internal array after many shifts', () => {
    const deque = new MonotonicDeque<number>()
    for (let i = 0; i < 20; i++) {
      deque.push(i)
      deque.shift()
    }
    deque.push(100)
    expect(deque.size).toBe(1)
  })

  it('compacts internal array after many expirations', () => {
    const deque = new MonotonicDeque<number>()
    for (let i = 0; i < 20; i++) {
      deque.push(i)
    }
    deque.expireBefore(10)
    expect(deque.size).toBe(10)
  })

  it('returns increasing indices from push', () => {
    const deque = new MonotonicDeque<number>()
    const idx1 = deque.push(1)
    const idx2 = deque.push(2)
    const idx3 = deque.push(3)
    expect(idx2).toBe(idx1 + 1)
    expect(idx3).toBe(idx2 + 1)
  })

  it('handles string values', () => {
    const deque = new MonotonicDeque<string>('min')
    deque.push('zebra')
    deque.push('apple')
    deque.push('banana')
    expect(deque.front()).toBe('apple')
  })

  it('handles repeated push and shift operations', () => {
    const deque = new MonotonicDeque<number>('min')
    deque.push(3)
    deque.push(1)
    deque.push(4)
    deque.shift()
    deque.shift()
    deque.push(2)
    expect(deque.front()).toBe(2)
  })

  it('handles mixed operations correctly', () => {
    const deque = new MonotonicDeque<number>('max')
    deque.push(1)
    deque.push(3)
    deque.push(2)
    deque.shift()
    deque.push(5)
    deque.push(4)
    expect(deque.front()).toBe(5)
    expect(deque.back()).toBe(4)
  })
})