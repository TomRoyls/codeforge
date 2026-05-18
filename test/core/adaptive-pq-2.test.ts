import { describe, it, expect, beforeEach } from 'vitest'
import { AdaptivePQ2 } from '../../src/core/adaptive-pq-2/index.js'

describe('AdaptivePQ2', () => {
  let pq: AdaptivePQ2<string>

  beforeEach(() => {
    pq = new AdaptivePQ2<string>()
  })

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create an empty priority queue', () => {
      const q = new AdaptivePQ2<number>()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('should accept custom threshold', () => {
      const q = new AdaptivePQ2<number>(10)
      expect(q.size).toBe(0)
    })
  })

  // ─── Push / Pop / Peek ───

  describe('push / pop / peek', () => {
    it('should push and pop a single element', () => {
      pq.push(1, 'a')
      expect(pq.pop()).toEqual({ priority: 1, value: 'a' })
    })

    it('should return undefined when popping from empty queue', () => {
      expect(pq.pop()).toBeUndefined()
    })

    it('should return undefined when peeking at empty queue', () => {
      expect(pq.peek()).toBeUndefined()
    })

    it('should peek without removing', () => {
      pq.push(1, 'a')
      pq.push(2, 'b')
      expect(pq.peek()).toEqual({ priority: 1, value: 'a' })
      expect(pq.size).toBe(2)
    })

    it('should pop in priority order (min-heap)', () => {
      pq.push(3, 'c')
      pq.push(1, 'a')
      pq.push(2, 'b')
      expect(pq.pop()).toEqual({ priority: 1, value: 'a' })
      expect(pq.pop()).toEqual({ priority: 2, value: 'b' })
      expect(pq.pop()).toEqual({ priority: 3, value: 'c' })
    })

    it('should handle equal priorities', () => {
      pq.push(1, 'a')
      pq.push(1, 'b')
      pq.push(1, 'c')
      const results = [pq.pop()!.value, pq.pop()!.value, pq.pop()!.value]
      expect(results.sort()).toEqual(['a', 'b', 'c'])
    })

    it('should handle negative priorities', () => {
      pq.push(5, 'mid')
      pq.push(-1, 'low')
      pq.push(10, 'high')
      expect(pq.pop()!).toEqual({ priority: -1, value: 'low' })
      expect(pq.pop()!).toEqual({ priority: 5, value: 'mid' })
      expect(pq.pop()!).toEqual({ priority: 10, value: 'high' })
    })

    it('should track size correctly', () => {
      expect(pq.size).toBe(0)
      pq.push(1, 'a')
      expect(pq.size).toBe(1)
      pq.push(2, 'b')
      expect(pq.size).toBe(2)
      pq.pop()
      expect(pq.size).toBe(1)
    })

    it('should handle many elements in sorted order', () => {
      for (let i = 10; i >= 1; i--) pq.push(i, `item${i}`)
      for (let i = 1; i <= 10; i++) {
        expect(pq.pop()).toEqual({ priority: i, value: `item${i}` })
      }
    })
  })

  // ─── Contains ───

  describe('contains', () => {
    it('should find existing value', () => {
      pq.push(1, 'a')
      pq.push(2, 'b')
      expect(pq.contains('a')).toBe(true)
      expect(pq.contains('b')).toBe(true)
    })

    it('should not find missing value', () => {
      expect(pq.contains('missing')).toBe(false)
    })

    it('should not find value after removal', () => {
      pq.push(1, 'a')
      pq.pop()
      expect(pq.contains('a')).toBe(false)
    })
  })

  // ─── Remove ───

  describe('remove', () => {
    it('should remove an existing value', () => {
      pq.push(1, 'a')
      pq.push(2, 'b')
      pq.push(3, 'c')
      expect(pq.remove('b')).toBe(true)
      expect(pq.size).toBe(2)
      expect(pq.contains('b')).toBe(false)
    })

    it('should return false for non-existing value', () => {
      expect(pq.remove('missing')).toBe(false)
    })

    it('should maintain priority order after remove', () => {
      pq.push(3, 'c')
      pq.push(1, 'a')
      pq.push(2, 'b')
      pq.remove('b')
      expect(pq.pop()).toEqual({ priority: 1, value: 'a' })
      expect(pq.pop()).toEqual({ priority: 3, value: 'c' })
    })
  })

  // ─── Update ───

  describe('update', () => {
    it('should update priority of existing value', () => {
      pq.push(1, 'a')
      pq.push(2, 'b')
      pq.push(3, 'c')
      expect(pq.update('c', 0)).toBe(true)
      expect(pq.pop()).toEqual({ priority: 0, value: 'c' })
    })

    it('should return false for non-existing value', () => {
      expect(pq.update('missing', 5)).toBe(false)
    })

    it('should maintain order after multiple updates', () => {
      pq.push(1, 'a')
      pq.push(2, 'b')
      pq.push(3, 'c')
      pq.update('c', 0)
      pq.update('a', 10)
      expect(pq.pop()).toEqual({ priority: 0, value: 'c' })
      expect(pq.pop()).toEqual({ priority: 2, value: 'b' })
      expect(pq.pop()).toEqual({ priority: 10, value: 'a' })
    })
  })

  // ─── ToArray ───

  describe('toArray', () => {
    it('should return empty array for empty queue', () => {
      expect(pq.toArray()).toEqual([])
    })

    it('should return sorted elements', () => {
      pq.push(3, 'c')
      pq.push(1, 'a')
      pq.push(2, 'b')
      const arr = pq.toArray()
      expect(arr[0]!.priority).toBeLessThanOrEqual(arr[1]!.priority)
      expect(arr[1]!.priority).toBeLessThanOrEqual(arr[2]!.priority)
    })

    it('should not modify the queue', () => {
      pq.push(1, 'a')
      pq.push(2, 'b')
      pq.toArray()
      expect(pq.size).toBe(2)
    })
  })

  // ─── isEmpty / Clear ───

  describe('isEmpty / clear', () => {
    it('should track isEmpty correctly', () => {
      expect(pq.isEmpty()).toBe(true)
      pq.push(1, 'a')
      expect(pq.isEmpty()).toBe(false)
      pq.pop()
      expect(pq.isEmpty()).toBe(true)
    })

    it('should clear all elements', () => {
      pq.push(1, 'a')
      pq.push(2, 'b')
      pq.push(3, 'c')
      pq.clear()
      expect(pq.size).toBe(0)
      expect(pq.isEmpty()).toBe(true)
    })
  })

  // ─── Heap Mode Transition ───

  describe('heap mode transition', () => {
    it('should pop all elements when crossing threshold upward', () => {
      const q = new AdaptivePQ2<number>(5)
      for (let i = 20; i >= 1; i--) q.push(i, i)
      const popped: number[] = []
      while (!q.isEmpty()) {
        popped.push(q.pop()!.priority)
      }
      expect(popped.length).toBe(20)
      expect([...popped].sort((a, b) => a - b)).toEqual([...Array(20)].map((_, i) => i + 1))
    })

    it('should handle update after crossing threshold', () => {
      const q = new AdaptivePQ2<number>(3)
      for (let i = 1; i <= 10; i++) q.push(i, i)
      expect(q.update(10, 0)).toBe(true)
      expect(q.pop()!.priority).toBe(0)
    })

    it('should handle remove after crossing threshold', () => {
      const q = new AdaptivePQ2<number>(3)
      for (let i = 1; i <= 10; i++) q.push(i, i)
      expect(q.remove(5)).toBe(true)
      expect(q.contains(5)).toBe(false)
      expect(q.size).toBe(9)
    })

    it('should maintain heap invariant for pure heap mode', () => {
      const q = new AdaptivePQ2<number>(2)
      for (let i = 10; i >= 1; i--) q.push(i, i)
      for (let i = 1; i <= 10; i++) {
        expect(q.pop()).toEqual({ priority: i, value: i })
      }
    })

    it('should maintain order for sorted mode under threshold', () => {
      const q = new AdaptivePQ2<number>(100)
      for (let i = 5; i >= 1; i--) q.push(i, i)
      for (let i = 1; i <= 5; i++) {
        expect(q.pop()).toEqual({ priority: i, value: i })
      }
    })
  })
})
