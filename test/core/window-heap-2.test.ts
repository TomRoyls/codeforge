import { describe, it, expect } from 'vitest'
import { WindowHeap2 } from '../../src/core/window-heap-2/index.js'

// ─── Constructor ───

describe('WindowHeap2', () => {
  describe('constructor', () => {
    it('creates an empty window', () => {
      const wh = new WindowHeap2(5)
      expect(wh.size).toBe(0)
      expect(wh.isEmpty()).toBe(true)
    })

    it('creates window with size 1', () => {
      const wh = new WindowHeap2(1)
      wh.push(42)
      expect(wh.size).toBe(1)
      expect(wh.getMedian()).toBe(42)
    })
  })

  // ─── Push ───

  describe('push', () => {
    it('pushes values up to window size', () => {
      const wh = new WindowHeap2(3)
      wh.push(1)
      wh.push(2)
      wh.push(3)
      expect(wh.size).toBe(3)
      expect(wh.getWindow()).toEqual([1, 2, 3])
    })

    it('slides window when exceeding capacity', () => {
      const wh = new WindowHeap2(3)
      wh.push(1)
      wh.push(2)
      wh.push(3)
      wh.push(4)
      expect(wh.size).toBe(3)
      expect(wh.getWindow()).toEqual([2, 3, 4])
    })

    it('slides window multiple times', () => {
      const wh = new WindowHeap2(2)
      wh.push(1)
      wh.push(2)
      wh.push(3)
      wh.push(4)
      wh.push(5)
      expect(wh.getWindow()).toEqual([4, 5])
    })
  })

  // ─── getMedian ───

  describe('getMedian', () => {
    it('throws on empty window', () => {
      const wh = new WindowHeap2(5)
      expect(() => wh.getMedian()).toThrow('Window is empty')
    })

    it('returns single value as median', () => {
      const wh = new WindowHeap2(5)
      wh.push(7)
      expect(wh.getMedian()).toBe(7)
    })

    it('returns median for odd count', () => {
      const wh = new WindowHeap2(5)
      wh.push(1)
      wh.push(3)
      wh.push(5)
      expect(wh.getMedian()).toBe(3)
    })

    it('returns average for even count', () => {
      const wh = new WindowHeap2(5)
      wh.push(1)
      wh.push(2)
      wh.push(3)
      wh.push(4)
      expect(wh.getMedian()).toBe(2.5)
    })

    it('returns median after window slides', () => {
      const wh = new WindowHeap2(3)
      wh.push(10)
      wh.push(20)
      wh.push(30)
      wh.push(40)
      expect(wh.getMedian()).toBe(30)
    })
  })

  // ─── pushAndGetMedian ───

  describe('pushAndGetMedian', () => {
    it('pushes and returns median in one step', () => {
      const wh = new WindowHeap2(3)
      expect(wh.pushAndGetMedian(5)).toBe(5)
      expect(wh.pushAndGetMedian(3)).toBe(4)
      expect(wh.pushAndGetMedian(7)).toBe(5)
    })
  })

  // ─── getMin ───

  describe('getMin', () => {
    it('throws on empty window', () => {
      const wh = new WindowHeap2(5)
      expect(() => wh.getMin()).toThrow('Window is empty')
    })

    it('returns minimum value', () => {
      const wh = new WindowHeap2(5)
      wh.push(5)
      wh.push(3)
      wh.push(7)
      expect(wh.getMin()).toBe(3)
    })

    it('updates after sliding', () => {
      const wh = new WindowHeap2(2)
      wh.push(10)
      wh.push(20)
      wh.push(5)
      expect(wh.getMin()).toBe(5)
    })
  })

  // ─── getMax ───

  describe('getMax', () => {
    it('throws on empty window', () => {
      const wh = new WindowHeap2(5)
      expect(() => wh.getMax()).toThrow('Window is empty')
    })

    it('returns maximum value', () => {
      const wh = new WindowHeap2(5)
      wh.push(5)
      wh.push(3)
      wh.push(7)
      expect(wh.getMax()).toBe(7)
    })
  })

  // ─── getSum ───

  describe('getSum', () => {
    it('returns 0 for empty window', () => {
      const wh = new WindowHeap2(5)
      expect(wh.getSum()).toBe(0)
    })

    it('returns sum of values', () => {
      const wh = new WindowHeap2(5)
      wh.push(1)
      wh.push(2)
      wh.push(3)
      expect(wh.getSum()).toBe(6)
    })

    it('updates sum after sliding', () => {
      const wh = new WindowHeap2(3)
      wh.push(10)
      wh.push(20)
      wh.push(30)
      wh.push(40)
      expect(wh.getSum()).toBe(90)
    })
  })

  // ─── getAverage ───

  describe('getAverage', () => {
    it('throws on empty window', () => {
      const wh = new WindowHeap2(5)
      expect(() => wh.getAverage()).toThrow('Window is empty')
    })

    it('returns average of values', () => {
      const wh = new WindowHeap2(5)
      wh.push(2)
      wh.push(4)
      wh.push(6)
      expect(wh.getAverage()).toBe(4)
    })
  })

  // ─── getWindow ───

  describe('getWindow', () => {
    it('returns copy of window values', () => {
      const wh = new WindowHeap2(5)
      wh.push(1)
      wh.push(2)
      const win = wh.getWindow()
      expect(win).toEqual([1, 2])
      win.push(99)
      expect(wh.getWindow()).toEqual([1, 2])
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('clears the window', () => {
      const wh = new WindowHeap2(5)
      wh.push(1)
      wh.push(2)
      wh.clear()
      expect(wh.size).toBe(0)
      expect(wh.isEmpty()).toBe(true)
    })

    it('window is reusable after clear', () => {
      const wh = new WindowHeap2(3)
      wh.push(1)
      wh.clear()
      wh.push(10)
      expect(wh.getMedian()).toBe(10)
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles negative numbers', () => {
      const wh = new WindowHeap2(5)
      wh.push(-5)
      wh.push(-3)
      wh.push(-1)
      expect(wh.getMin()).toBe(-5)
      expect(wh.getMax()).toBe(-1)
      expect(wh.getMedian()).toBe(-3)
    })

    it('handles all same values', () => {
      const wh = new WindowHeap2(5)
      wh.push(7)
      wh.push(7)
      wh.push(7)
      expect(wh.getMedian()).toBe(7)
      expect(wh.getMin()).toBe(7)
      expect(wh.getMax()).toBe(7)
      expect(wh.getAverage()).toBe(7)
    })

    it('handles floating point values', () => {
      const wh = new WindowHeap2(5)
      wh.push(1.5)
      wh.push(2.5)
      expect(wh.getMedian()).toBe(2)
      expect(wh.getAverage()).toBe(2)
    })

    it('window of size 1 always has latest value', () => {
      const wh = new WindowHeap2(1)
      wh.push(10)
      expect(wh.getMedian()).toBe(10)
      wh.push(20)
      expect(wh.getMedian()).toBe(20)
      wh.push(30)
      expect(wh.getMedian()).toBe(30)
    })

    it('handles many pushes with sliding', () => {
      const wh = new WindowHeap2(3)
      for (let i = 1; i <= 100; i++) wh.push(i)
      expect(wh.getWindow()).toEqual([98, 99, 100])
      expect(wh.getMedian()).toBe(99)
      expect(wh.getSum()).toBe(297)
    })
  })
})
