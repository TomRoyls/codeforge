import { describe, expect, it } from 'vitest'
import { SlidingWindow } from '../src/core/sliding-window/sliding-window.js'

describe('SlidingWindow', () => {
  describe('constructor', () => {
    it('should create with default maxSize of 100', () => {
      const sw = new SlidingWindow<number>()
      expect(sw.maxSize).toBe(100)
      expect(sw.size()).toBe(0)
      expect(sw.isEmpty()).toBe(true)
    })

    it('should create with custom maxSize', () => {
      const sw = new SlidingWindow<number>({ maxSize: 5 })
      expect(sw.maxSize).toBe(5)
    })
  })

  describe('push', () => {
    it('should add values', () => {
      const sw = new SlidingWindow<number>({ maxSize: 5 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.size()).toBe(3)
    })

    it('should evict oldest when full', () => {
      const sw = new SlidingWindow<number>({ maxSize: 3 })
      expect(sw.push(1)).toBeUndefined()
      expect(sw.push(2)).toBeUndefined()
      expect(sw.push(3)).toBeUndefined()
      expect(sw.push(4)).toBe(1)
      expect(sw.toArray()).toEqual([2, 3, 4])
    })

    it('should maintain sliding window of maxSize', () => {
      const sw = new SlidingWindow<number>({ maxSize: 3 })
      for (let i = 0; i < 10; i++) sw.push(i)
      expect(sw.toArray()).toEqual([7, 8, 9])
      expect(sw.size()).toBe(3)
    })

    it('should return undefined when not full', () => {
      const sw = new SlidingWindow<number>({ maxSize: 5 })
      expect(sw.push(1)).toBeUndefined()
    })
  })

  describe('peek and peekBack', () => {
    it('should return undefined for empty window', () => {
      const sw = new SlidingWindow<number>({ maxSize: 5 })
      expect(sw.peek()).toBeUndefined()
      expect(sw.peekBack()).toBeUndefined()
    })

    it('should return front and back elements', () => {
      const sw = new SlidingWindow<number>({ maxSize: 5 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.peek()).toBe(1)
      expect(sw.peekBack()).toBe(3)
    })
  })

  describe('get', () => {
    it('should return element at index', () => {
      const sw = new SlidingWindow<number>({ maxSize: 5 })
      sw.push(10)
      sw.push(20)
      sw.push(30)
      expect(sw.get(0)).toBe(10)
      expect(sw.get(1)).toBe(20)
      expect(sw.get(2)).toBe(30)
    })

    it('should return undefined for out of bounds', () => {
      const sw = new SlidingWindow<number>({ maxSize: 5 })
      sw.push(1)
      expect(sw.get(-1)).toBeUndefined()
      expect(sw.get(5)).toBeUndefined()
    })
  })

  describe('size and isEmpty', () => {
    it('should track size', () => {
      const sw = new SlidingWindow<number>({ maxSize: 5 })
      expect(sw.size()).toBe(0)
      sw.push(1)
      expect(sw.size()).toBe(1)
    })

    it('should track isEmpty', () => {
      const sw = new SlidingWindow<number>({ maxSize: 5 })
      expect(sw.isEmpty()).toBe(true)
      sw.push(1)
      expect(sw.isEmpty()).toBe(false)
    })

    it('should track isFull', () => {
      const sw = new SlidingWindow<number>({ maxSize: 2 })
      expect(sw.isFull()).toBe(false)
      sw.push(1)
      expect(sw.isFull()).toBe(false)
      sw.push(2)
      expect(sw.isFull()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all elements', () => {
      const sw = new SlidingWindow<number>({ maxSize: 5 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      sw.clear()
      expect(sw.size()).toBe(0)
      expect(sw.isEmpty()).toBe(true)
      expect(sw.sum).toBe(0)
    })

    it('should allow pushes after clear', () => {
      const sw = new SlidingWindow<number>({ maxSize: 5 })
      sw.push(1)
      sw.clear()
      sw.push(2)
      expect(sw.size()).toBe(1)
      expect(sw.peek()).toBe(2)
    })
  })

  describe('toArray', () => {
    it('should return copy of buffer', () => {
      const sw = new SlidingWindow<number>({ maxSize: 5 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      const arr = sw.toArray()
      expect(arr).toEqual([1, 2, 3])
      arr.push(99)
      expect(sw.size()).toBe(3)
    })
  })

  describe('forEach', () => {
    it('should iterate with index', () => {
      const sw = new SlidingWindow<number>({ maxSize: 5 })
      sw.push(10)
      sw.push(20)
      sw.push(30)
      const result: Array<[number, number]> = []
      sw.forEach((v, i) => result.push([v, i]))
      expect(result).toEqual([[10, 0], [20, 1], [30, 2]])
    })
  })

  describe('iterator', () => {
    it('should be iterable', () => {
      const sw = new SlidingWindow<number>({ maxSize: 5 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect([...sw]).toEqual([1, 2, 3])
    })
  })

  describe('filter', () => {
    it('should filter elements', () => {
      const sw = new SlidingWindow<number>({ maxSize: 5 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      sw.push(4)
      expect(sw.filter((v) => v % 2 === 0)).toEqual([2, 4])
    })
  })

  describe('map', () => {
    it('should map elements', () => {
      const sw = new SlidingWindow<number>({ maxSize: 5 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.map((v) => v * 10)).toEqual([10, 20, 30])
    })
  })

  describe('reduce', () => {
    it('should reduce elements', () => {
      const sw = new SlidingWindow<number>({ maxSize: 5 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.reduce((acc, v) => acc + v, 0)).toBe(6)
    })
  })

  describe('numeric statistics', () => {
    it('should track sum', () => {
      const sw = new SlidingWindow<number>({ maxSize: 5 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.sum).toBe(6)
    })

    it('should track avg', () => {
      const sw = new SlidingWindow<number>({ maxSize: 5 })
      sw.push(10)
      sw.push(20)
      sw.push(30)
      expect(sw.avg).toBeCloseTo(20)
    })

    it('should track min and max', () => {
      const sw = new SlidingWindow<number>({ maxSize: 5 })
      sw.push(5)
      sw.push(1)
      sw.push(10)
      sw.push(3)
      expect(sw.min).toBe(1)
      expect(sw.max).toBe(10)
    })

    it('should return undefined for stats on empty window', () => {
      const sw = new SlidingWindow<number>({ maxSize: 5 })
      expect(sw.sum).toBe(0)
      expect(sw.avg).toBeUndefined()
      expect(sw.min).toBeUndefined()
      expect(sw.max).toBeUndefined()
    })

    it('should update sum when evicting', () => {
      const sw = new SlidingWindow<number>({ maxSize: 3 })
      sw.push(10)
      sw.push(20)
      sw.push(30)
      expect(sw.sum).toBe(60)
      sw.push(40)
      expect(sw.sum).toBe(90)
      expect(sw.avg).toBeCloseTo(30)
    })

    it('should recompute min/max when evicted value was min/max', () => {
      const sw = new SlidingWindow<number>({ maxSize: 3 })
      sw.push(1)
      sw.push(5)
      sw.push(10)
      expect(sw.min).toBe(1)
      expect(sw.max).toBe(10)
      sw.push(7)
      expect(sw.min).toBe(5)
      sw.push(3)
      expect(sw.toArray()).toEqual([10, 7, 3])
      expect(sw.min).toBe(3)
      expect(sw.max).toBe(10)
    })
  })

  describe('getStatistics', () => {
    it('should return comprehensive statistics', () => {
      const sw = new SlidingWindow<number>({ maxSize: 5 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      const stats = sw.getStatistics()
      expect(stats.size).toBe(3)
      expect(stats.sum).toBe(6)
      expect(stats.min).toBe(1)
      expect(stats.max).toBe(3)
      expect(stats.avg).toBeCloseTo(2)
    })
  })

  describe('contains', () => {
    it('should find existing value', () => {
      const sw = new SlidingWindow<number>({ maxSize: 5 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.contains(2)).toBe(true)
      expect(sw.contains(5)).toBe(false)
    })

    it('should not find evicted value', () => {
      const sw = new SlidingWindow<number>({ maxSize: 2 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      expect(sw.contains(1)).toBe(false)
    })
  })

  describe('indexOf / lastIndexOf', () => {
    it('should find index of value', () => {
      const sw = new SlidingWindow<number>({ maxSize: 5 })
      sw.push(10)
      sw.push(20)
      sw.push(30)
      expect(sw.indexOf(20)).toBe(1)
      expect(sw.indexOf(99)).toBe(-1)
    })

    it('should find last index of duplicates', () => {
      const sw = new SlidingWindow<number>({ maxSize: 5 })
      sw.push(10)
      sw.push(20)
      sw.push(10)
      expect(sw.indexOf(10)).toBe(0)
      expect(sw.lastIndexOf(10)).toBe(2)
    })
  })

  describe('count', () => {
    it('should count occurrences', () => {
      const sw = new SlidingWindow<number>({ maxSize: 5 })
      sw.push(1)
      sw.push(2)
      sw.push(1)
      sw.push(1)
      expect(sw.count(1)).toBe(3)
      expect(sw.count(2)).toBe(1)
      expect(sw.count(99)).toBe(0)
    })
  })

  describe('resize', () => {
    it('should increase maxSize', () => {
      const sw = new SlidingWindow<number>({ maxSize: 3 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      sw.resize(5)
      expect(sw.maxSize).toBe(5)
      expect(sw.size()).toBe(3)
    })

    it('should shrink and evict excess elements', () => {
      const sw = new SlidingWindow<number>({ maxSize: 5 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      sw.push(4)
      sw.push(5)
      sw.resize(2)
      expect(sw.maxSize).toBe(2)
      expect(sw.size()).toBe(2)
      expect(sw.toArray()).toEqual([4, 5])
    })

    it('should update stats after shrink', () => {
      const sw = new SlidingWindow<number>({ maxSize: 5 })
      sw.push(1)
      sw.push(2)
      sw.push(3)
      sw.push(4)
      sw.push(5)
      sw.resize(2)
      expect(sw.sum).toBe(9)
      expect(sw.min).toBe(4)
      expect(sw.max).toBe(5)
    })
  })

  describe('string values', () => {
    it('should work with string values', () => {
      const sw = new SlidingWindow<string>({ maxSize: 3 })
      sw.push('a')
      sw.push('b')
      sw.push('c')
      expect(sw.toArray()).toEqual(['a', 'b', 'c'])
      sw.push('d')
      expect(sw.peek()).toBe('b')
    })

    it('should track min/max for strings', () => {
      const sw = new SlidingWindow<string>({ maxSize: 5 })
      sw.push('cherry')
      sw.push('apple')
      sw.push('banana')
      expect(sw.min).toBe('apple')
      expect(sw.max).toBe('cherry')
    })
  })

  describe('edge cases', () => {
    it('should handle maxSize of 1', () => {
      const sw = new SlidingWindow<number>({ maxSize: 1 })
      sw.push(1)
      expect(sw.isFull()).toBe(true)
      expect(sw.push(2)).toBe(1)
      expect(sw.toArray()).toEqual([2])
    })

    it('should handle negative numbers', () => {
      const sw = new SlidingWindow<number>({ maxSize: 5 })
      sw.push(-5)
      sw.push(-1)
      sw.push(0)
      sw.push(3)
      expect(sw.min).toBe(-5)
      expect(sw.max).toBe(3)
      expect(sw.sum).toBe(-3)
    })

    it('should handle zeros', () => {
      const sw = new SlidingWindow<number>({ maxSize: 5 })
      sw.push(0)
      sw.push(0)
      sw.push(0)
      expect(sw.sum).toBe(0)
      expect(sw.avg).toBe(0)
      expect(sw.min).toBe(0)
      expect(sw.max).toBe(0)
    })

    it('should handle large number of pushes', () => {
      const sw = new SlidingWindow<number>({ maxSize: 10 })
      for (let i = 0; i < 1000; i++) sw.push(i)
      expect(sw.size()).toBe(10)
      expect(sw.toArray()).toEqual([990, 991, 992, 993, 994, 995, 996, 997, 998, 999])
    })
  })
})
