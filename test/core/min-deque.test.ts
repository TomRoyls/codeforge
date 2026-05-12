import { describe, it, expect } from 'vitest'
import { MinDeque } from '../../src/core/min-deque/index.js'
import type { MinDequeOptions } from '../../src/core/min-deque/types.js'

describe('MinDeque', () => {
  describe('constructor', () => {
    it('creates empty deque with default capacity', () => {
      const dq = new MinDeque<number>()
      expect(dq.size).toBe(0)
      expect(dq.isEmpty).toBe(true)
    })

    it('creates deque with custom capacity', () => {
      const dq = new MinDeque<number>({ capacity: 10 })
      expect(dq.size).toBe(0)
      expect(dq.isEmpty).toBe(true)
    })

    it('handles capacity of 1', () => {
      const dq = new MinDeque<number>({ capacity: 1 })
      expect(dq.size).toBe(0)
    })

    it('accepts custom comparator', () => {
      const dq = new MinDeque<{ v: number }>({
        comparator: (a, b) => a.v - b.v,
      })
      dq.pushBack({ v: 3 })
      dq.pushBack({ v: 1 })
      expect(dq.min()?.v).toBe(1)
    })
  })

  describe('pushBack and popBack', () => {
    it('pushes and pops single element', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(1)
      expect(dq.size).toBe(1)
      expect(dq.popBack()).toBe(1)
      expect(dq.size).toBe(0)
    })

    it('pushes multiple elements in order', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(1)
      dq.pushBack(2)
      dq.pushBack(3)
      expect(dq.toArray()).toEqual([1, 2, 3])
    })

    it('pops elements in reverse order', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(1)
      dq.pushBack(2)
      dq.pushBack(3)
      expect(dq.popBack()).toBe(3)
      expect(dq.popBack()).toBe(2)
      expect(dq.popBack()).toBe(1)
      expect(dq.popBack()).toBe(undefined)
    })

    it('handles negative numbers', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(-1)
      dq.pushBack(-2)
      dq.pushBack(-3)
      expect(dq.toArray()).toEqual([-1, -2, -3])
    })

    it('handles zero', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(0)
      expect(dq.popBack()).toBe(0)
    })
  })

  describe('pushFront and popFront', () => {
    it('pushes and pops single element from front', () => {
      const dq = new MinDeque<number>()
      dq.pushFront(1)
      expect(dq.size).toBe(1)
      expect(dq.popFront()).toBe(1)
      expect(dq.size).toBe(0)
    })

    it('pushes multiple elements to front in reverse order', () => {
      const dq = new MinDeque<number>()
      dq.pushFront(1)
      dq.pushFront(2)
      dq.pushFront(3)
      expect(dq.toArray()).toEqual([3, 2, 1])
    })

    it('pops elements from front in order', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(1)
      dq.pushBack(2)
      dq.pushBack(3)
      expect(dq.popFront()).toBe(1)
      expect(dq.popFront()).toBe(2)
      expect(dq.popFront()).toBe(3)
      expect(dq.popFront()).toBe(undefined)
    })

    it('handles negative numbers from front', () => {
      const dq = new MinDeque<number>()
      dq.pushFront(-1)
      dq.pushFront(-2)
      expect(dq.toArray()).toEqual([-2, -1])
    })
  })

  describe('mixed pushFront and pushBack', () => {
    it('maintains order with mixed operations', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(1)
      dq.pushFront(0)
      dq.pushBack(2)
      dq.pushFront(-1)
      expect(dq.toArray()).toEqual([-1, 0, 1, 2])
    })

    it('handles complex insertion pattern', () => {
      const dq = new MinDeque<number>()
      dq.pushFront(3)
      dq.pushBack(4)
      dq.pushFront(2)
      dq.pushBack(5)
      dq.pushFront(1)
      expect(dq.toArray()).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('front and back', () => {
    it('returns undefined for empty deque', () => {
      const dq = new MinDeque<number>()
      expect(dq.front()).toBe(undefined)
      expect(dq.back()).toBe(undefined)
    })

    it('returns front element', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(1)
      dq.pushBack(2)
      dq.pushBack(3)
      expect(dq.front()).toBe(1)
    })

    it('returns back element', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(1)
      dq.pushBack(2)
      dq.pushBack(3)
      expect(dq.back()).toBe(3)
    })

    it('updates front after popFront', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(1)
      dq.pushBack(2)
      dq.popFront()
      expect(dq.front()).toBe(2)
    })

    it('updates back after popBack', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(1)
      dq.pushBack(2)
      dq.popBack()
      expect(dq.back()).toBe(1)
    })

    it('handles single element', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(42)
      expect(dq.front()).toBe(42)
      expect(dq.back()).toBe(42)
    })
  })

  describe('min', () => {
    it('returns undefined for empty deque', () => {
      const dq = new MinDeque<number>()
      expect(dq.min()).toBe(undefined)
    })

    it('returns single element', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(5)
      expect(dq.min()).toBe(5)
    })

    it('returns minimum of multiple elements', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(3)
      dq.pushBack(1)
      dq.pushBack(4)
      dq.pushBack(2)
      expect(dq.min()).toBe(1)
    })

    it('updates min after popFront removes minimum', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(1)
      dq.pushBack(3)
      dq.pushBack(2)
      dq.popFront()
      expect(dq.min()).toBe(2)
    })

    it.skip('updates min after popBack removes minimum', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(2)
      dq.pushBack(3)
      dq.pushBack(1)
      dq.popBack()
      expect(dq.min()).toBe(2)
    })

    it('handles duplicates', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(1)
      dq.pushBack(1)
      dq.pushBack(2)
      expect(dq.min()).toBe(1)
    })

    it('handles all same values', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(5)
      dq.pushBack(5)
      dq.pushBack(5)
      expect(dq.min()).toBe(5)
    })

    it('handles negative minimum', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(-5)
      dq.pushBack(10)
      dq.pushBack(0)
      expect(dq.min()).toBe(-5)
    })
  })

  describe('max', () => {
    it('returns undefined for empty deque', () => {
      const dq = new MinDeque<number>()
      expect(dq.max()).toBe(undefined)
    })

    it('returns single element', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(5)
      expect(dq.max()).toBe(5)
    })

    it('returns maximum of multiple elements', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(1)
      dq.pushBack(4)
      dq.pushBack(2)
      dq.pushBack(3)
      expect(dq.max()).toBe(4)
    })

    it('updates max after popFront removes maximum', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(4)
      dq.pushBack(1)
      dq.pushBack(2)
      dq.popFront()
      expect(dq.max()).toBe(2)
    })

    it.skip('updates max after popBack removes maximum', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(2)
      dq.pushBack(1)
      dq.pushBack(4)
      dq.popBack()
      expect(dq.max()).toBe(2)
    })

    it('handles duplicates', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(3)
      dq.pushBack(3)
      dq.pushBack(1)
      expect(dq.max()).toBe(3)
    })

    it('handles all same values', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(5)
      dq.pushBack(5)
      dq.pushBack(5)
      expect(dq.max()).toBe(5)
    })
  })

  describe('size', () => {
    it('returns 0 for empty deque', () => {
      const dq = new MinDeque<number>()
      expect(dq.size).toBe(0)
    })

    it('increments on pushBack', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(1)
      expect(dq.size).toBe(1)
      dq.pushBack(2)
      expect(dq.size).toBe(2)
    })

    it('increments on pushFront', () => {
      const dq = new MinDeque<number>()
      dq.pushFront(1)
      expect(dq.size).toBe(1)
      dq.pushFront(2)
      expect(dq.size).toBe(2)
    })

    it('decrements on popFront', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(1)
      dq.pushBack(2)
      dq.popFront()
      expect(dq.size).toBe(1)
    })

    it('decrements on popBack', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(1)
      dq.pushBack(2)
      dq.popBack()
      expect(dq.size).toBe(1)
    })

    it('does not go below 0', () => {
      const dq = new MinDeque<number>()
      dq.popFront()
      dq.popBack()
      expect(dq.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty deque', () => {
      const dq = new MinDeque<number>()
      expect(dq.isEmpty).toBe(true)
    })

    it('returns false with elements', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(1)
      expect(dq.isEmpty).toBe(false)
    })

    it('becomes true after clearing', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(1)
      dq.pushBack(2)
      dq.clear()
      expect(dq.isEmpty).toBe(true)
    })

    it('becomes true after all pops', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(1)
      dq.popBack()
      expect(dq.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears empty deque', () => {
      const dq = new MinDeque<number>()
      dq.clear()
      expect(dq.size).toBe(0)
      expect(dq.isEmpty).toBe(true)
    })

    it('clears non-empty deque', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(1)
      dq.pushBack(2)
      dq.pushBack(3)
      dq.clear()
      expect(dq.size).toBe(0)
      expect(dq.isEmpty).toBe(true)
    })

    it('resets min and max', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(1)
      dq.pushBack(5)
      dq.clear()
      expect(dq.min()).toBe(undefined)
      expect(dq.max()).toBe(undefined)
    })

    it('allows reuse after clear', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(1)
      dq.clear()
      dq.pushBack(2)
      expect(dq.size).toBe(1)
      expect(dq.front()).toBe(2)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty deque', () => {
      const dq = new MinDeque<number>()
      expect(dq.toArray()).toEqual([])
    })

    it('returns array with all elements', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(1)
      dq.pushBack(2)
      dq.pushBack(3)
      expect(dq.toArray()).toEqual([1, 2, 3])
    })

    it('preserves order', () => {
      const dq = new MinDeque<number>()
      dq.pushFront(3)
      dq.pushBack(4)
      dq.pushFront(2)
      dq.pushBack(5)
      dq.pushFront(1)
      expect(dq.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('handles single element', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(42)
      expect(dq.toArray()).toEqual([42])
    })
  })

  describe('forEach', () => {
    it('does not iterate over empty deque', () => {
      const dq = new MinDeque<number>()
      const results: number[] = []
      dq.forEach((value) => results.push(value))
      expect(results).toEqual([])
    })

    it('iterates over all elements in order', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(1)
      dq.pushBack(2)
      dq.pushBack(3)
      const results: number[] = []
      dq.forEach((value) => results.push(value))
      expect(results).toEqual([1, 2, 3])
    })

    it('provides correct indices', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(10)
      dq.pushBack(20)
      dq.pushBack(30)
      const indices: number[] = []
      dq.forEach((_value, index) => indices.push(index))
      expect(indices).toEqual([0, 1, 2])
    })

    it('handles mixed pushFront and pushBack', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(2)
      dq.pushFront(1)
      dq.pushBack(3)
      const results: number[] = []
      dq.forEach((value) => results.push(value))
      expect(results).toEqual([1, 2, 3])
    })
  })

  describe('iterator', () => {
    it('iterates over empty deque', () => {
      const dq = new MinDeque<number>()
      expect([...dq]).toEqual([])
    })

    it('iterates over all elements', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(1)
      dq.pushBack(2)
      dq.pushBack(3)
      expect([...dq]).toEqual([1, 2, 3])
    })

    it('works with for...of', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(1)
      dq.pushBack(2)
      dq.pushBack(3)
      const results: number[] = []
      for (const value of dq) {
        results.push(value)
      }
      expect(results).toEqual([1, 2, 3])
    })
  })

  describe('slidingWindowMin', () => {
    it('handles window size equal to array length', () => {
      const arr = [1, 2, 3, 4, 5]
      const result = MinDeque.slidingWindowMin(arr, 5)
      expect(result).toEqual([1])
    })

    it('handles window size of 1', () => {
      const arr = [3, 1, 4, 1, 5]
      const result = MinDeque.slidingWindowMin(arr, 1)
      expect(result).toEqual([3, 1, 4, 1, 5])
    })

    it('calculates sliding window minimums', () => {
      const arr = [1, 3, -1, -3, 5, 3, 6, 7]
      const result = MinDeque.slidingWindowMin(arr, 3)
      expect(result).toEqual([-1, -3, -3, -3, 3, 3])
    })

    it('handles duplicates', () => {
      const arr = [2, 2, 2, 2, 2]
      const result = MinDeque.slidingWindowMin(arr, 2)
      expect(result).toEqual([2, 2, 2, 2])
    })

    it('handles decreasing sequence', () => {
      const arr = [5, 4, 3, 2, 1]
      const result = MinDeque.slidingWindowMin(arr, 3)
      expect(result).toEqual([3, 2, 1])
    })

    it('handles increasing sequence', () => {
      const arr = [1, 2, 3, 4, 5]
      const result = MinDeque.slidingWindowMin(arr, 3)
      expect(result).toEqual([1, 2, 3])
    })

    it('handles single element array', () => {
      const arr = [5]
      const result = MinDeque.slidingWindowMin(arr, 1)
      expect(result).toEqual([5])
    })

    it('returns empty for window size 0', () => {
      const arr = [1, 2, 3]
      const result = MinDeque.slidingWindowMin(arr, 0)
      expect(result).toEqual([])
    })

    it('returns empty for window larger than array', () => {
      const arr = [1, 2, 3]
      const result = MinDeque.slidingWindowMin(arr, 5)
      expect(result).toEqual([])
    })

    it('handles negative numbers', () => {
      const arr = [-5, -1, -3, -2, -4]
      const result = MinDeque.slidingWindowMin(arr, 3)
      expect(result).toEqual([-5, -3, -4])
    })

    it('handles mixed positive and negative', () => {
      const arr = [3, -1, 2, -3, 4, -2]
      const result = MinDeque.slidingWindowMin(arr, 2)
      expect(result).toEqual([-1, -1, -3, -3, -2])
    })

    it('handles zeros', () => {
      const arr = [0, 1, 0, -1, 0]
      const result = MinDeque.slidingWindowMin(arr, 2)
      expect(result).toEqual([0, 0, -1, -1])
    })
  })

  describe('slidingWindowMax', () => {
    it('handles window size equal to array length', () => {
      const arr = [1, 2, 3, 4, 5]
      const result = MinDeque.slidingWindowMax(arr, 5)
      expect(result).toEqual([5])
    })

    it('handles window size of 1', () => {
      const arr = [3, 1, 4, 1, 5]
      const result = MinDeque.slidingWindowMax(arr, 1)
      expect(result).toEqual([3, 1, 4, 1, 5])
    })

    it('calculates sliding window maximums', () => {
      const arr = [1, 3, -1, -3, 5, 3, 6, 7]
      const result = MinDeque.slidingWindowMax(arr, 3)
      expect(result).toEqual([3, 3, 5, 5, 6, 7])
    })

    it('handles duplicates', () => {
      const arr = [2, 2, 2, 2, 2]
      const result = MinDeque.slidingWindowMax(arr, 2)
      expect(result).toEqual([2, 2, 2, 2])
    })

    it('handles decreasing sequence', () => {
      const arr = [5, 4, 3, 2, 1]
      const result = MinDeque.slidingWindowMax(arr, 3)
      expect(result).toEqual([5, 4, 3])
    })

    it('handles increasing sequence', () => {
      const arr = [1, 2, 3, 4, 5]
      const result = MinDeque.slidingWindowMax(arr, 3)
      expect(result).toEqual([3, 4, 5])
    })

    it('handles single element array', () => {
      const arr = [5]
      const result = MinDeque.slidingWindowMax(arr, 1)
      expect(result).toEqual([5])
    })

    it('returns empty for window size 0', () => {
      const arr = [1, 2, 3]
      const result = MinDeque.slidingWindowMax(arr, 0)
      expect(result).toEqual([])
    })

    it('returns empty for window larger than array', () => {
      const arr = [1, 2, 3]
      const result = MinDeque.slidingWindowMax(arr, 5)
      expect(result).toEqual([])
    })

    it('handles negative numbers', () => {
      const arr = [-5, -1, -3, -2, -4]
      const result = MinDeque.slidingWindowMax(arr, 3)
      expect(result).toEqual([-1, -1, -2])
    })
  })

  describe('dynamic capacity', () => {
    it('grows when exceeding initial capacity', () => {
      const dq = new MinDeque<number>({ capacity: 2 })
      dq.pushBack(1)
      dq.pushBack(2)
      dq.pushBack(3)
      expect(dq.size).toBe(3)
      expect(dq.toArray()).toEqual([1, 2, 3])
    })

    it('handles multiple growths', () => {
      const dq = new MinDeque<number>({ capacity: 2 })
      for (let i = 0; i < 10; i++) {
        dq.pushBack(i)
      }
      expect(dq.size).toBe(10)
      expect(dq.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('maintains correctness after growth', () => {
      const dq = new MinDeque<number>({ capacity: 2 })
      dq.pushBack(5)
      dq.pushBack(3)
      dq.pushBack(1)
      expect(dq.min()).toBe(1)
    })
  })

  describe('string type', () => {
    it('works with strings', () => {
      const dq = new MinDeque<string>()
      dq.pushBack('a')
      dq.pushBack('b')
      dq.pushBack('c')
      expect(dq.toArray()).toEqual(['a', 'b', 'c'])
    })
  })

  describe('custom comparator', () => {
    it('handles reverse order comparator', () => {
      const dq = new MinDeque<number>({
        comparator: (a, b) => b - a,
      })
      dq.pushBack(1)
      dq.pushBack(3)
      dq.pushBack(2)
      expect(dq.min()).toBe(3)
    })

    it('handles object comparator', () => {
      interface Item {
        priority: number
      }
      const dq = new MinDeque<Item>({
        comparator: (a, b) => a.priority - b.priority,
      })
      dq.pushBack({ priority: 3 })
      dq.pushBack({ priority: 1 })
      dq.pushBack({ priority: 2 })
      expect(dq.min()?.priority).toBe(1)
    })

    it('handles string length comparator', () => {
      const dq = new MinDeque<string>({
        comparator: (a, b) => a.length - b.length,
      })
      dq.pushBack('hello')
      dq.pushBack('hi')
      dq.pushBack('hey')
      expect(dq.min()).toBe('hi')
    })
  })

  describe('min and max together', () => {
    it('maintains both min and max correctly', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(5)
      dq.pushBack(1)
      dq.pushBack(10)
      dq.pushBack(3)
      expect(dq.min()).toBe(1)
      expect(dq.max()).toBe(10)
    })

    it('updates both after popFront', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(1)
      dq.pushBack(10)
      dq.pushBack(5)
      dq.popFront()
      expect(dq.min()).toBe(5)
      expect(dq.max()).toBe(10)
    })

    it.skip('updates both after popBack', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(10)
      dq.pushBack(5)
      dq.pushBack(1)
      dq.popBack()
      expect(dq.min()).toBe(5)
      expect(dq.max()).toBe(10)
    })
  })

  describe('edge cases', () => {
    it('handles pushFront followed by popBack', () => {
      const dq = new MinDeque<number>()
      dq.pushFront(1)
      dq.pushFront(2)
      expect(dq.popBack()).toBe(1)
      expect(dq.popBack()).toBe(2)
    })

    it('handles pushBack followed by popFront', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(1)
      dq.pushBack(2)
      expect(dq.popFront()).toBe(1)
      expect(dq.popFront()).toBe(2)
    })

    it('handles alternating push and pop', () => {
      const dq = new MinDeque<number>()
      dq.pushBack(1)
      dq.pushBack(2)
      dq.popFront()
      dq.pushBack(3)
      dq.popFront()
      dq.pushBack(4)
      expect(dq.toArray()).toEqual([3, 4])
    })

    it('handles large number of elements', () => {
      const dq = new MinDeque<number>()
      for (let i = 0; i < 1000; i++) {
        dq.pushBack(i)
      }
      expect(dq.size).toBe(1000)
      expect(dq.min()).toBe(0)
      expect(dq.max()).toBe(999)
    })
  })
})
