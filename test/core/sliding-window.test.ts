import { describe, it, expect } from 'vitest'
import { SlidingWindow } from '../../src/core/sliding-window/sliding-window.js'

describe('SlidingWindow', () => {
  describe('constructor', () => {
    it('should create window with default maxSize of 100', () => {
      const sw = new SlidingWindow()
      expect(sw.maxSize).toBe(100)
      expect(sw.size()).toBe(0)
      expect(sw.isEmpty()).toBe(true)
    })

    it('should accept custom maxSize', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      expect(sw.maxSize).toBe(5)
    })
  })

  // ─── push ───

  describe('push', () => {
    it('should add element and return undefined when not full', () => {
      const sw = new SlidingWindow({ maxSize: 3 })
      expect(sw.push(1)).toBeUndefined()
      expect(sw.size()).toBe(1)
    })

    it('should evict oldest element when full', () => {
      const sw = new SlidingWindow({ maxSize: 2 })
      sw.push(1)
      sw.push(2)
      const evicted = sw.push(3)
      expect(evicted).toBe(1)
      expect(sw.size()).toBe(2)
    })

    it('should maintain at most maxSize elements', () => {
      const sw = new SlidingWindow({ maxSize: 3 })
      for (let i = 0; i < 10; i++) sw.push(i)
      expect(sw.size()).toBe(3)
      expect(sw.toArray()).toEqual([7, 8, 9])
    })
  })

  // ─── peek / peekBack ───

  describe('peek and peekBack', () => {
    it('should return undefined for empty window', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      expect(sw.peek()).toBeUndefined()
      expect(sw.peekBack()).toBeUndefined()
    })

    it('should return first element with peek', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.peek()).toBe(1)
    })

    it('should return last element with peekBack', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.peekBack()).toBe(3)
    })

    it('should update peek/peekBack after eviction', () => {
      const sw = new SlidingWindow({ maxSize: 2 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.peek()).toBe(2)
      expect(sw.peekBack()).toBe(3)
    })
  })

  // ─── get ───

  describe('get', () => {
    it('should return element at index', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      sw.push(10)
      sw.push(20)
      sw.push(30)
      expect(sw.get(0)).toBe(10)
      expect(sw.get(1)).toBe(20)
      expect(sw.get(2)).toBe(30)
    })

    it('should return undefined for out of bounds index', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      sw.push(1)
      expect(sw.get(-1)).toBeUndefined()
      expect(sw.get(5)).toBeUndefined()
    })

    it('should return undefined for empty window', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      expect(sw.get(0)).toBeUndefined()
    })
  })

  // ─── isEmpty / isFull ───

  describe('isEmpty and isFull', () => {
    it('should be empty initially', () => {
      const sw = new SlidingWindow({ maxSize: 3 })
      expect(sw.isEmpty()).toBe(true)
      expect(sw.isFull()).toBe(false)
    })

    it('should be full when at capacity', () => {
      const sw = new SlidingWindow({ maxSize: 2 })
      sw.push(1)
      sw.push(2)
      expect(sw.isEmpty()).toBe(false)
      expect(sw.isFull()).toBe(true)
    })

    it('should not be full after partial fill', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      sw.push(1)
      sw.push(2)
      expect(sw.isFull()).toBe(false)
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('should remove all elements', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      sw.push(1)
      sw.push(2)
      sw.clear()
      expect(sw.size()).toBe(0)
      expect(sw.isEmpty()).toBe(true)
      expect(sw.toArray()).toEqual([])
      expect(sw.sum).toBe(0)
      expect(sw.min).toBeUndefined()
      expect(sw.max).toBeUndefined()
    })
  })

  // ─── toArray ───

  describe('toArray', () => {
    it('should return a copy of the buffer', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      sw.push(1)
      sw.push(2)
      const arr = sw.toArray()
      arr.push(99)
      expect(sw.toArray()).toEqual([1, 2])
    })
  })

  // ─── forEach ───

  describe('forEach', () => {
    it('should iterate all elements with correct indices', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      sw.push(10)
      sw.push(20)
      sw.push(30)
      const collected: Array<{ value: number; index: number }> = []
      sw.forEach((value, index) => collected.push({ value, index }))
      expect(collected).toEqual([
        { value: 10, index: 0 },
        { value: 20, index: 1 },
        { value: 30, index: 2 },
      ])
    })

    it('should not iterate on empty window', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      let called = false
      sw.forEach(() => { called = true })
      expect(called).toBe(false)
    })
  })

  // ─── iterator ───

  describe('Symbol.iterator', () => {
    it('should be iterable', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect([...sw]).toEqual([1, 2, 3])
    })

    it('should yield nothing for empty window', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      expect([...sw]).toEqual([])
    })
  })

  // ─── filter / map / reduce ───

  describe('filter', () => {
    it('should filter elements', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      sw.push(4)
      expect(sw.filter((v) => v % 2 === 0)).toEqual([2, 4])
    })

    it('should return empty when nothing matches', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      sw.push(1)
      sw.push(3)
      expect(sw.filter((v) => v % 2 === 0)).toEqual([])
    })
  })

  describe('map', () => {
    it('should map elements to new values', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.map((v) => v * 10)).toEqual([10, 20, 30])
    })

    it('should map to different type', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      sw.push(1)
      sw.push(2)
      expect(sw.map((v) => String(v))).toEqual(['1', '2'])
    })
  })

  describe('reduce', () => {
    it('should reduce elements', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.reduce((acc, v) => acc + v, 0)).toBe(6)
    })

    it('should return initial value for empty window', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      expect(sw.reduce((acc, v) => acc + v, 0)).toBe(0)
    })
  })

  // ─── statistics (sum, min, max, avg) ───

  describe('statistics', () => {
    it('should compute sum', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.sum).toBe(6)
    })

    it('should compute min and max', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      sw.push(10)
      sw.push(5)
      sw.push(20)
      expect(sw.min).toBe(5)
      expect(sw.max).toBe(20)
    })

    it('should compute average', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      sw.push(2)
      sw.push(4)
      sw.push(6)
      expect(sw.avg).toBe(4)
    })

    it('should return undefined for avg on empty window', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      expect(sw.avg).toBeUndefined()
    })

    it('should return undefined for min/max on empty window', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      expect(sw.min).toBeUndefined()
      expect(sw.max).toBeUndefined()
    })

    it('should update sum after eviction', () => {
      const sw = new SlidingWindow({ maxSize: 2 })
      sw.push(10)
      sw.push(20)
      sw.push(30)
      expect(sw.sum).toBe(50)
    })

    it('should update min/max after eviction', () => {
      const sw = new SlidingWindow({ maxSize: 2 })
      sw.push(10)
      sw.push(5)
      sw.push(20)
      expect(sw.min).toBe(5)
      expect(sw.max).toBe(20)
    })

    it('should return 0 sum for empty window', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      expect(sw.sum).toBe(0)
    })
  })

  // ─── getStatistics ───

  describe('getStatistics', () => {
    it('should return full statistics object', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      sw.push(1)
      sw.push(3)
      sw.push(5)
      const stats = sw.getStatistics()
      expect(stats).toEqual({
        size: 3,
        sum: 9,
        min: 1,
        max: 5,
        avg: 3,
      })
    })

    it('should return empty stats for empty window', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      const stats = sw.getStatistics()
      expect(stats.size).toBe(0)
      expect(stats.sum).toBe(0)
      expect(stats.min).toBeUndefined()
      expect(stats.max).toBeUndefined()
      expect(stats.avg).toBeUndefined()
    })
  })

  // ─── contains / indexOf / lastIndexOf / count ───

  describe('contains', () => {
    it('should find existing element', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.contains(2)).toBe(true)
    })

    it('should not find missing element', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      sw.push(1)
      expect(sw.contains(99)).toBe(false)
    })

    it('should return false for empty window', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      expect(sw.contains(1)).toBe(false)
    })
  })

  describe('indexOf', () => {
    it('should return first index of value', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.indexOf(2)).toBe(1)
    })

    it('should return -1 for missing value', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      sw.push(1)
      expect(sw.indexOf(99)).toBe(-1)
    })
  })

  describe('lastIndexOf', () => {
    it('should return last index of duplicate value', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      sw.push(1)
      sw.push(2)
      sw.push(2)
      expect(sw.lastIndexOf(2)).toBe(2)
    })

    it('should return -1 for missing value', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      expect(sw.lastIndexOf(99)).toBe(-1)
    })
  })

  describe('count', () => {
    it('should count occurrences', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      sw.push(1)
      sw.push(2)
      sw.push(2)
      sw.push(3)
      expect(sw.count(2)).toBe(2)
    })

    it('should return 0 for missing value', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      expect(sw.count(99)).toBe(0)
    })
  })

  // ─── resize ───

  describe('resize', () => {
    it('should shrink and evict oldest elements', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      sw.push(4)
      sw.push(5)
      sw.resize(3)
      expect(sw.maxSize).toBe(3)
      expect(sw.size()).toBe(3)
      expect(sw.toArray()).toEqual([3, 4, 5])
    })

    it('should grow without losing data', () => {
      const sw = new SlidingWindow({ maxSize: 3 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      sw.resize(10)
      expect(sw.maxSize).toBe(10)
      expect(sw.toArray()).toEqual([1, 2, 3])
    })

    it('should update sum after shrink', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      sw.push(4)
      sw.push(5)
      sw.resize(2)
      expect(sw.sum).toBe(9)
    })
  })

  // ─── Edge cases ───

  describe('edge cases', () => {
    it('should handle negative numbers', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      sw.push(-5)
      sw.push(-1)
      sw.push(0)
      sw.push(3)
      expect(sw.min).toBe(-5)
      expect(sw.max).toBe(3)
      expect(sw.sum).toBe(-3)
    })

    it('should handle single element', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      sw.push(42)
      expect(sw.peek()).toBe(42)
      expect(sw.peekBack()).toBe(42)
      expect(sw.min).toBe(42)
      expect(sw.max).toBe(42)
      expect(sw.sum).toBe(42)
      expect(sw.avg).toBe(42)
    })

    it('should handle maxSize of 1', () => {
      const sw = new SlidingWindow({ maxSize: 1 })
      expect(sw.push(1)).toBeUndefined()
      expect(sw.push(2)).toBe(1)
      expect(sw.size()).toBe(1)
      expect(sw.peek()).toBe(2)
    })

    it('should handle duplicates', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      sw.push(5)
      sw.push(5)
      sw.push(5)
      expect(sw.count(5)).toBe(3)
      expect(sw.sum).toBe(15)
    })

    it('should handle string values', () => {
      const sw = new SlidingWindow<string>({ maxSize: 3 })
      sw.push('c')
      sw.push('a')
      sw.push('b')
      expect(sw.toArray()).toEqual(['c', 'a', 'b'])
      expect(sw.min).toBe('a')
      expect(sw.max).toBe('c')
      expect(sw.contains('a')).toBe(true)
    })

    it('should handle zeros', () => {
      const sw = new SlidingWindow({ maxSize: 5 })
      sw.push(0)
      sw.push(0)
      sw.push(0)
      expect(sw.sum).toBe(0)
      expect(sw.avg).toBe(0)
      expect(sw.min).toBe(0)
      expect(sw.max).toBe(0)
    })
  })
})
