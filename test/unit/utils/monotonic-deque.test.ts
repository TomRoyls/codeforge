import { describe, it, expect } from 'vitest'
import { MonotonicDeque } from '../../../src/utils/monotonic-deque.js'

describe('MonotonicDeque', () => {
  describe('min mode', () => {
    it('maintains increasing order', () => {
      const dq = new MonotonicDeque<number>('min')
      dq.push(5)
      dq.push(3)
      dq.push(7)
      dq.push(1)
      expect(dq.toArray()).toEqual([1])
    })

    it('front returns minimum', () => {
      const dq = new MonotonicDeque<number>('min')
      dq.push(5)
      expect(dq.front()).toBe(5)
      dq.push(3)
      expect(dq.front()).toBe(3)
      dq.push(7)
      expect(dq.front()).toBe(3)
      dq.push(1)
      expect(dq.front()).toBe(1)
    })

    it('sliding window minimum', () => {
      const data = [3, 1, 4, 1, 5, 9, 2, 6]
      const windowSize = 3
      const mins: number[] = []
      const dq = new MonotonicDeque<number>('min')
      for (let i = 0; i < data.length; i++) {
        dq.push(data[i]!)
        dq.expireBefore(i - windowSize + 1)
        if (i >= windowSize - 1) {
          mins.push(dq.front()!)
        }
      }
      expect(mins).toEqual([1, 1, 1, 1, 2, 2])
    })
  })

  describe('max mode', () => {
    it('front returns maximum', () => {
      const dq = new MonotonicDeque<number>('max')
      dq.push(3)
      expect(dq.front()).toBe(3)
      dq.push(5)
      expect(dq.front()).toBe(5)
      dq.push(2)
      expect(dq.front()).toBe(5)
    })

    it('sliding window maximum', () => {
      const data = [3, 1, 4, 1, 5, 9, 2, 6]
      const windowSize = 3
      const maxes: number[] = []
      const dq = new MonotonicDeque<number>('max')
      for (let i = 0; i < data.length; i++) {
        dq.push(data[i]!)
        dq.expireBefore(i - windowSize + 1)
        if (i >= windowSize - 1) {
          maxes.push(dq.front()!)
        }
      }
      expect(maxes).toEqual([4, 4, 5, 9, 9, 9])
    })
  })

  describe('basic operations', () => {
    it('push returns index', () => {
      const dq = new MonotonicDeque<number>('min')
      expect(dq.push(1)).toBe(0)
      expect(dq.push(2)).toBe(1)
      expect(dq.push(3)).toBe(2)
    })

    it('back returns last element', () => {
      const dq = new MonotonicDeque<number>('min')
      dq.push(5)
      dq.push(3)
      expect(dq.back()).toBe(3)
    })

    it('shift removes from front', () => {
      const dq = new MonotonicDeque<number>('min')
      dq.push(5)
      dq.push(3)
      expect(dq.shift()).toBe(3)
      expect(dq.size).toBe(0)
    })

    it('pop removes from back', () => {
      const dq = new MonotonicDeque<number>('min')
      dq.push(5)
      dq.push(7)
      expect(dq.pop()).toBe(7)
      expect(dq.front()).toBe(5)
    })

    it('size tracks correctly', () => {
      const dq = new MonotonicDeque<number>('min')
      expect(dq.size).toBe(0)
      dq.push(5)
      expect(dq.size).toBe(1)
      dq.push(3)
      expect(dq.size).toBe(1)
    })
  })

  describe('expireBefore', () => {
    it('removes elements before index', () => {
      const dq = new MonotonicDeque<number>('min')
      const i0 = dq.push(5)
      dq.push(3)
      dq.push(7)
      dq.expireBefore(i0 + 1)
      expect(dq.front()).toBe(3)
    })

    it('handles empty deque', () => {
      const dq = new MonotonicDeque<number>('min')
      dq.expireBefore(10)
      expect(dq.size).toBe(0)
    })
  })

  describe('stress', () => {
    it('handles many pushes', () => {
      const dq = new MonotonicDeque<number>('min')
      for (let i = 100; i >= 0; i--) {
        dq.push(i)
      }
      expect(dq.front()).toBe(0)
      expect(dq.size).toBe(1)
    })
  })
})
