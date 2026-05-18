import { describe, it, expect } from 'vitest'
import { MonotonicQueue } from '../src/utils/monotonic-queue.js'

// ─── Constructor ───

describe('MonotonicQueue', () => {
  it('creates with default min mode', () => {
    const q = new MonotonicQueue<number>()
    expect(q.getMode()).toBe('min')
    expect(q.getWindowSize()).toBeUndefined()
    expect(q.isEmpty()).toBe(true)
  })

  it('creates with max mode', () => {
    const q = new MonotonicQueue<number>({ mode: 'max' })
    expect(q.getMode()).toBe('max')
  })

  it('creates with window size', () => {
    const q = new MonotonicQueue<number>({ windowSize: 3 })
    expect(q.getWindowSize()).toBe(3)
  })

  // ─── push / current (min mode) ───

  it('tracks minimum in ascending sequence', () => {
    const q = new MonotonicQueue<number>({ mode: 'min' })
    q.push(1)
    q.push(2)
    q.push(3)
    expect(q.current()).toBe(1)
  })

  it('tracks minimum in descending sequence', () => {
    const q = new MonotonicQueue<number>({ mode: 'min' })
    q.push(3)
    q.push(2)
    q.push(1)
    expect(q.current()).toBe(1)
  })

  it('tracks minimum with mixed values', () => {
    const q = new MonotonicQueue<number>({ mode: 'min' })
    q.push(5)
    expect(q.current()).toBe(5)
    q.push(2)
    expect(q.current()).toBe(2)
    q.push(8)
    expect(q.current()).toBe(2)
    q.push(1)
    expect(q.current()).toBe(1)
    q.push(3)
    expect(q.current()).toBe(1)
  })

  // ─── push / current (max mode) ───

  it('tracks maximum in ascending sequence', () => {
    const q = new MonotonicQueue<number>({ mode: 'max' })
    q.push(1)
    q.push(2)
    q.push(3)
    expect(q.current()).toBe(3)
  })

  it('tracks maximum in descending sequence', () => {
    const q = new MonotonicQueue<number>({ mode: 'max' })
    q.push(3)
    q.push(2)
    q.push(1)
    expect(q.current()).toBe(3)
  })

  it('tracks maximum with mixed values', () => {
    const q = new MonotonicQueue<number>({ mode: 'max' })
    q.push(2)
    expect(q.current()).toBe(2)
    q.push(5)
    expect(q.current()).toBe(5)
    q.push(1)
    expect(q.current()).toBe(5)
    q.push(8)
    expect(q.current()).toBe(8)
    q.push(3)
    expect(q.current()).toBe(8)
  })

  // ─── size / isEmpty ───

  it('tracks size after pushes', () => {
    const q = new MonotonicQueue<number>()
    expect(q.size).toBe(0)
    q.push(1)
    expect(q.size).toBe(1)
    q.push(2)
    expect(q.size).toBe(2)
  })

  it('isEmpty toggles', () => {
    const q = new MonotonicQueue<number>()
    expect(q.isEmpty()).toBe(true)
    q.push(1)
    expect(q.isEmpty()).toBe(false)
  })

  // ─── clear ───

  it('clears all elements', () => {
    const q = new MonotonicQueue<number>()
    q.push(1)
    q.push(2)
    q.push(3)
    q.clear()
    expect(q.size).toBe(0)
    expect(q.isEmpty()).toBe(true)
  })

  it('works after clear', () => {
    const q = new MonotonicQueue<number>()
    q.push(100)
    q.clear()
    q.push(5)
    expect(q.current()).toBe(5)
    expect(q.size).toBe(1)
  })

  // ─── toArray ───

  it('returns elements in order', () => {
    const q = new MonotonicQueue<number>()
    q.push(1)
    q.push(2)
    q.push(3)
    expect(q.toArray()).toEqual([1, 2, 3])
  })

  it('returns empty array when empty', () => {
    const q = new MonotonicQueue<number>()
    expect(q.toArray()).toEqual([])
  })

  // ─── current throws on empty ───

  it('throws RangeError on current when empty', () => {
    const q = new MonotonicQueue<number>()
    expect(() => q.current()).toThrow(RangeError)
  })

  // ─── Sliding window (min mode) ───

  it('maintains sliding window of size 3 (min)', () => {
    const q = new MonotonicQueue<number>({ mode: 'min', windowSize: 3 })
    q.push(3)
    q.push(1)
    q.push(4)
    expect(q.size).toBe(3)
    expect(q.current()).toBe(1)

    q.push(2)
    expect(q.size).toBe(3)
    expect(q.toArray()).toEqual([1, 4, 2])
    expect(q.current()).toBe(1)

    q.push(0)
    expect(q.size).toBe(3)
    expect(q.toArray()).toEqual([4, 2, 0])
    expect(q.current()).toBe(0)
  })

  it('updates min after window slides past minimum', () => {
    const q = new MonotonicQueue<number>({ mode: 'min', windowSize: 2 })
    q.push(5)
    q.push(1)
    expect(q.current()).toBe(1)

    q.push(3)
    expect(q.toArray()).toEqual([1, 3])
    expect(q.current()).toBe(1)

    q.push(4)
    expect(q.toArray()).toEqual([3, 4])
    expect(q.current()).toBe(3)
  })

  // ─── Sliding window (max mode) ───

  it('maintains sliding window of size 3 (max)', () => {
    const q = new MonotonicQueue<number>({ mode: 'max', windowSize: 3 })
    q.push(1)
    q.push(5)
    q.push(2)
    expect(q.current()).toBe(5)

    q.push(3)
    expect(q.toArray()).toEqual([5, 2, 3])
    expect(q.current()).toBe(5)

    q.push(4)
    expect(q.toArray()).toEqual([2, 3, 4])
    expect(q.current()).toBe(4)
  })

  it('updates max after window slides past maximum', () => {
    const q = new MonotonicQueue<number>({ mode: 'max', windowSize: 2 })
    q.push(1)
    q.push(5)
    expect(q.current()).toBe(5)

    q.push(2)
    expect(q.toArray()).toEqual([5, 2])
    expect(q.current()).toBe(5)

    q.push(3)
    expect(q.toArray()).toEqual([2, 3])
    expect(q.current()).toBe(3)
  })

  // ─── Window size 1 ───

  it('window size 1 always returns current element (min)', () => {
    const q = new MonotonicQueue<number>({ mode: 'min', windowSize: 1 })
    q.push(5)
    expect(q.current()).toBe(5)
    q.push(3)
    expect(q.current()).toBe(3)
    q.push(7)
    expect(q.current()).toBe(7)
    expect(q.size).toBe(1)
  })

  it('window size 1 always returns current element (max)', () => {
    const q = new MonotonicQueue<number>({ mode: 'max', windowSize: 1 })
    q.push(5)
    expect(q.current()).toBe(5)
    q.push(3)
    expect(q.current()).toBe(3)
  })

  // ─── Custom comparator ───

  it('works with custom comparator', () => {
    const q = new MonotonicQueue<string>(
      { mode: 'min' },
      (a, b) => a.localeCompare(b)
    )
    q.push('cherry')
    q.push('apple')
    q.push('banana')
    expect(q.current()).toBe('apple')
  })

  // ─── Edge cases ───

  it('handles duplicates', () => {
    const q = new MonotonicQueue<number>({ mode: 'min' })
    q.push(5)
    q.push(5)
    q.push(5)
    expect(q.current()).toBe(5)
    expect(q.size).toBe(3)
  })

  it('handles negative numbers (min)', () => {
    const q = new MonotonicQueue<number>({ mode: 'min' })
    q.push(-1)
    q.push(-5)
    q.push(-3)
    expect(q.current()).toBe(-5)
  })

  it('handles negative numbers (max)', () => {
    const q = new MonotonicQueue<number>({ mode: 'max' })
    q.push(-1)
    q.push(-5)
    q.push(-3)
    expect(q.current()).toBe(-1)
  })

  it('handles floating point numbers', () => {
    const q = new MonotonicQueue<number>({ mode: 'min' })
    q.push(1.5)
    q.push(0.3)
    q.push(2.7)
    expect(q.current()).toBeCloseTo(0.3)
  })

  it('handles large dataset', () => {
    const q = new MonotonicQueue<number>({ mode: 'min' })
    for (let i = 0; i < 1000; i++) {
      q.push(1000 - i)
    }
    expect(q.size).toBe(1000)
    expect(q.current()).toBe(1)
  })

  it('sliding window with exact window fill', () => {
    const q = new MonotonicQueue<number>({ mode: 'min', windowSize: 3 })
    q.push(2)
    q.push(1)
    q.push(3)
    expect(q.size).toBe(3)
    expect(q.current()).toBe(1)
  })

  it('sliding window evicts old min correctly', () => {
    const q = new MonotonicQueue<number>({ mode: 'min', windowSize: 3 })
    q.push(1)
    q.push(5)
    q.push(3)
    expect(q.current()).toBe(1)

    q.push(4)
    expect(q.toArray()).toEqual([5, 3, 4])
    expect(q.current()).toBe(3)

    q.push(2)
    expect(q.toArray()).toEqual([3, 4, 2])
    expect(q.current()).toBe(2)
  })
})
