import { describe, it, expect } from 'vitest'
import { IntervalHeap } from '../../src/core/interval-heap-2/index.js'

describe('IntervalHeap', () => {
  describe('constructor', () => {
    it('creates empty heap', () => {
      const h = new IntervalHeap<number>()
      expect(h.size).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('creates with custom comparator', () => {
      const h = new IntervalHeap<number>({ comparator: (a, b) => b - a })
      h.push(1)
      h.push(2)
      h.push(3)
      expect(h.peekMin()).toBe(3)
      expect(h.peekMax()).toBe(1)
    })

    it('creates with default comparator', () => {
      const h = new IntervalHeap<number>()
      h.push(3)
      h.push(1)
      h.push(2)
      expect(h.peekMin()).toBe(1)
      expect(h.peekMax()).toBe(3)
    })
  })

  describe('push', () => {
    it('pushes single element', () => {
      const h = new IntervalHeap<number>()
      h.push(5)
      expect(h.size).toBe(1)
      expect(h.peekMin()).toBe(5)
      expect(h.peekMax()).toBe(5)
    })

    it('pushes two elements', () => {
      const h = new IntervalHeap<number>()
      h.push(3)
      h.push(7)
      expect(h.size).toBe(2)
      expect(h.peekMin()).toBe(3)
      expect(h.peekMax()).toBe(7)
    })

    it('pushes two elements in reverse order', () => {
      const h = new IntervalHeap<number>()
      h.push(7)
      h.push(3)
      expect(h.size).toBe(2)
      expect(h.peekMin()).toBe(3)
      expect(h.peekMax()).toBe(7)
    })

    it('pushes three elements', () => {
      const h = new IntervalHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      expect(h.size).toBe(3)
      expect(h.peekMin()).toBe(3)
      expect(h.peekMax()).toBe(7)
    })

    it('pushes duplicate values', () => {
      const h = new IntervalHeap<number>()
      h.push(5)
      h.push(5)
      h.push(5)
      expect(h.size).toBe(3)
      expect(h.peekMin()).toBe(5)
      expect(h.peekMax()).toBe(5)
    })

    it('pushes many elements maintaining min/max invariants', () => {
      const h = new IntervalHeap<number>()
      const values = [42, 17, 83, 5, 99, 31, 67, 24, 88, 11]
      for (const v of values) {
        h.push(v)
      }
      expect(h.size).toBe(10)
      expect(h.peekMin()).toBe(5)
      expect(h.peekMax()).toBe(99)
    })

    it('pushes elements in sorted ascending order', () => {
      const h = new IntervalHeap<number>()
      for (let i = 0; i < 20; i++) h.push(i)
      expect(h.peekMin()).toBe(0)
      expect(h.peekMax()).toBe(19)
    })

    it('pushes elements in sorted descending order', () => {
      const h = new IntervalHeap<number>()
      for (let i = 19; i >= 0; i--) h.push(i)
      expect(h.peekMin()).toBe(0)
      expect(h.peekMax()).toBe(19)
    })
  })

  describe('popMin', () => {
    it('returns undefined on empty heap', () => {
      const h = new IntervalHeap<number>()
      expect(h.popMin()).toBeUndefined()
    })

    it('pops single element', () => {
      const h = new IntervalHeap<number>()
      h.push(42)
      expect(h.popMin()).toBe(42)
      expect(h.size).toBe(0)
    })

    it('pops elements in ascending order', () => {
      const h = new IntervalHeap<number>()
      const values = [5, 3, 8, 1, 9, 2, 7, 4, 6]
      for (const v of values) h.push(v)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.popMin()!)
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('maintains max after popping min', () => {
      const h = new IntervalHeap<number>()
      h.push(1)
      h.push(5)
      h.push(3)
      h.popMin()
      expect(h.peekMax()).toBe(5)
    })

    it('pops all elements leaving empty heap', () => {
      const h = new IntervalHeap<number>()
      h.push(1)
      h.push(2)
      h.push(3)
      h.popMin()
      h.popMin()
      h.popMin()
      expect(h.isEmpty()).toBe(true)
      expect(h.popMin()).toBeUndefined()
    })

    it('handles two elements', () => {
      const h = new IntervalHeap<number>()
      h.push(5)
      h.push(3)
      expect(h.popMin()).toBe(3)
      expect(h.popMin()).toBe(5)
    })

    it('handles duplicates', () => {
      const h = new IntervalHeap<number>()
      h.push(3)
      h.push(3)
      h.push(1)
      h.push(1)
      expect(h.popMin()).toBe(1)
      expect(h.popMin()).toBe(1)
      expect(h.popMin()).toBe(3)
      expect(h.popMin()).toBe(3)
    })
  })

  describe('popMax', () => {
    it('returns undefined on empty heap', () => {
      const h = new IntervalHeap<number>()
      expect(h.popMax()).toBeUndefined()
    })

    it('pops single element', () => {
      const h = new IntervalHeap<number>()
      h.push(42)
      expect(h.popMax()).toBe(42)
      expect(h.size).toBe(0)
    })

    it('pops elements in descending order', () => {
      const h = new IntervalHeap<number>()
      const values = [5, 3, 8, 1, 9, 2, 7, 4, 6]
      for (const v of values) h.push(v)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.popMax()!)
      expect(result).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1])
    })

    it('maintains min after popping max', () => {
      const h = new IntervalHeap<number>()
      h.push(1)
      h.push(5)
      h.push(3)
      h.popMax()
      expect(h.peekMin()).toBe(1)
    })

    it('pops all elements leaving empty heap', () => {
      const h = new IntervalHeap<number>()
      h.push(1)
      h.push(2)
      h.push(3)
      h.popMax()
      h.popMax()
      h.popMax()
      expect(h.isEmpty()).toBe(true)
      expect(h.popMax()).toBeUndefined()
    })

    it('handles two elements', () => {
      const h = new IntervalHeap<number>()
      h.push(5)
      h.push(3)
      expect(h.popMax()).toBe(5)
      expect(h.popMax()).toBe(3)
    })
  })

  describe('peekMin', () => {
    it('returns undefined on empty heap', () => {
      const h = new IntervalHeap<number>()
      expect(h.peekMin()).toBeUndefined()
    })

    it('returns smallest without removing', () => {
      const h = new IntervalHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      expect(h.peekMin()).toBe(3)
      expect(h.size).toBe(3)
    })

    it('returns same value on repeated calls', () => {
      const h = new IntervalHeap<number>()
      h.push(5)
      h.push(3)
      expect(h.peekMin()).toBe(3)
      expect(h.peekMin()).toBe(3)
      expect(h.peekMin()).toBe(3)
    })
  })

  describe('peekMax', () => {
    it('returns undefined on empty heap', () => {
      const h = new IntervalHeap<number>()
      expect(h.peekMax()).toBeUndefined()
    })

    it('returns largest without removing', () => {
      const h = new IntervalHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      expect(h.peekMax()).toBe(7)
      expect(h.size).toBe(3)
    })

    it('returns same value on repeated calls', () => {
      const h = new IntervalHeap<number>()
      h.push(5)
      h.push(3)
      expect(h.peekMax()).toBe(5)
      expect(h.peekMax()).toBe(5)
    })

    it('returns same as peekMin for single element', () => {
      const h = new IntervalHeap<number>()
      h.push(42)
      expect(h.peekMin()).toBe(42)
      expect(h.peekMax()).toBe(42)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new heap', () => {
      const h = new IntervalHeap<number>()
      expect(h.isEmpty()).toBe(true)
    })

    it('returns false after push', () => {
      const h = new IntervalHeap<number>()
      h.push(1)
      expect(h.isEmpty()).toBe(false)
    })

    it('returns true after popping all', () => {
      const h = new IntervalHeap<number>()
      h.push(1)
      h.push(2)
      h.popMin()
      h.popMin()
      expect(h.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const h = new IntervalHeap<number>()
      h.push(1)
      h.push(2)
      h.clear()
      expect(h.isEmpty()).toBe(true)
    })
  })

  describe('size', () => {
    it('returns 0 for new heap', () => {
      const h = new IntervalHeap<number>()
      expect(h.size).toBe(0)
    })

    it('increments on push', () => {
      const h = new IntervalHeap<number>()
      h.push(1)
      expect(h.size).toBe(1)
      h.push(2)
      expect(h.size).toBe(2)
      h.push(3)
      expect(h.size).toBe(3)
    })

    it('decrements on popMin', () => {
      const h = new IntervalHeap<number>()
      h.push(1)
      h.push(2)
      h.popMin()
      expect(h.size).toBe(1)
    })

    it('decrements on popMax', () => {
      const h = new IntervalHeap<number>()
      h.push(1)
      h.push(2)
      h.popMax()
      expect(h.size).toBe(1)
    })
  })

  describe('clear', () => {
    it('clears empty heap', () => {
      const h = new IntervalHeap<number>()
      h.clear()
      expect(h.size).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('clears populated heap', () => {
      const h = new IntervalHeap<number>()
      h.push(1)
      h.push(2)
      h.push(3)
      h.clear()
      expect(h.size).toBe(0)
      expect(h.isEmpty()).toBe(true)
      expect(h.peekMin()).toBeUndefined()
      expect(h.peekMax()).toBeUndefined()
    })

    it('allows reuse after clear', () => {
      const h = new IntervalHeap<number>()
      h.push(1)
      h.push(2)
      h.clear()
      h.push(10)
      h.push(20)
      expect(h.peekMin()).toBe(10)
      expect(h.peekMax()).toBe(20)
      expect(h.size).toBe(2)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty heap', () => {
      const h = new IntervalHeap<number>()
      expect(h.toArray()).toEqual([])
    })

    it('returns elements for single element', () => {
      const h = new IntervalHeap<number>()
      h.push(42)
      expect(h.toArray()).toEqual([42])
    })

    it('returns elements after multiple pushes', () => {
      const h = new IntervalHeap<number>()
      h.push(3)
      h.push(1)
      h.push(2)
      const arr = h.toArray()
      expect(arr.length).toBe(3)
      expect(arr).toContain(1)
      expect(arr).toContain(2)
      expect(arr).toContain(3)
    })

    it('does not modify heap', () => {
      const h = new IntervalHeap<number>()
      h.push(3)
      h.push(1)
      h.toArray()
      expect(h.size).toBe(2)
      expect(h.peekMin()).toBe(1)
    })
  })

  describe('contains', () => {
    it('returns false on empty heap', () => {
      const h = new IntervalHeap<number>()
      expect(h.contains(1)).toBe(false)
    })

    it('returns true when element exists', () => {
      const h = new IntervalHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      expect(h.contains(3)).toBe(true)
      expect(h.contains(5)).toBe(true)
      expect(h.contains(7)).toBe(true)
    })

    it('returns false when element does not exist', () => {
      const h = new IntervalHeap<number>()
      h.push(5)
      h.push(3)
      expect(h.contains(99)).toBe(false)
    })

    it('finds duplicates', () => {
      const h = new IntervalHeap<number>()
      h.push(5)
      h.push(5)
      expect(h.contains(5)).toBe(true)
    })

    it('works with custom comparator', () => {
      const h = new IntervalHeap<string>()
      h.push('hello')
      h.push('world')
      expect(h.contains('hello')).toBe(true)
      expect(h.contains('missing')).toBe(false)
    })
  })

  describe('remove', () => {
    it('returns false on empty heap', () => {
      const h = new IntervalHeap<number>()
      expect(h.remove(1)).toBe(false)
    })

    it('returns false when element not found', () => {
      const h = new IntervalHeap<number>()
      h.push(1)
      h.push(2)
      expect(h.remove(99)).toBe(false)
    })

    it('removes single element and empties heap', () => {
      const h = new IntervalHeap<number>()
      h.push(42)
      expect(h.remove(42)).toBe(true)
      expect(h.size).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('removes element and maintains invariants', () => {
      const h = new IntervalHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      h.push(1)
      h.push(9)
      expect(h.remove(5)).toBe(true)
      expect(h.size).toBe(4)
      expect(h.peekMin()).toBe(1)
      expect(h.peekMax()).toBe(9)
    })

    it('removes min element', () => {
      const h = new IntervalHeap<number>()
      h.push(3)
      h.push(1)
      h.push(5)
      expect(h.remove(1)).toBe(true)
      expect(h.peekMin()).toBe(3)
      expect(h.peekMax()).toBe(5)
    })

    it('removes max element', () => {
      const h = new IntervalHeap<number>()
      h.push(3)
      h.push(1)
      h.push(5)
      expect(h.remove(5)).toBe(true)
      expect(h.peekMin()).toBe(1)
      expect(h.peekMax()).toBe(3)
    })

    it('removes first occurrence of duplicate', () => {
      const h = new IntervalHeap<number>()
      h.push(3)
      h.push(3)
      expect(h.remove(3)).toBe(true)
      expect(h.size).toBe(1)
      expect(h.contains(3)).toBe(true)
    })

    it('heap remains valid after removals', () => {
      const h = new IntervalHeap<number>()
      for (let i = 0; i < 10; i++) h.push(i)
      h.remove(5)
      h.remove(3)
      h.remove(7)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.popMin()!)
      expect(result).toEqual([0, 1, 2, 4, 6, 8, 9])
    })
  })

  describe('replace', () => {
    it('returns false on empty heap', () => {
      const h = new IntervalHeap<number>()
      expect(h.replace(1, 2)).toBe(false)
    })

    it('returns false when old value not found', () => {
      const h = new IntervalHeap<number>()
      h.push(1)
      expect(h.replace(99, 2)).toBe(false)
    })

    it('replaces value', () => {
      const h = new IntervalHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      expect(h.replace(5, 10)).toBe(true)
      expect(h.peekMax()).toBe(10)
    })

    it('replaces with smaller value updating min', () => {
      const h = new IntervalHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      expect(h.replace(3, 1)).toBe(true)
      expect(h.peekMin()).toBe(1)
    })

    it('maintains size after replace', () => {
      const h = new IntervalHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      h.replace(5, 99)
      expect(h.size).toBe(3)
    })

    it('heap remains valid after replace', () => {
      const h = new IntervalHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      h.replace(5, 1)
      h.replace(3, 9)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.popMin()!)
      expect(result).toEqual([1, 7, 9])
    })
  })

  describe('getStats', () => {
    it('returns correct stats for empty heap', () => {
      const h = new IntervalHeap<number>()
      const stats = h.getStats()
      expect(stats.size).toBe(0)
      expect(stats.nodeCount).toBe(0)
      expect(stats.hasSingleElement).toBe(false)
    })

    it('returns correct stats for single element', () => {
      const h = new IntervalHeap<number>()
      h.push(1)
      const stats = h.getStats()
      expect(stats.size).toBe(1)
      expect(stats.nodeCount).toBe(1)
      expect(stats.hasSingleElement).toBe(true)
    })

    it('returns correct stats for even count', () => {
      const h = new IntervalHeap<number>()
      h.push(1)
      h.push(2)
      const stats = h.getStats()
      expect(stats.size).toBe(2)
      expect(stats.nodeCount).toBe(1)
      expect(stats.hasSingleElement).toBe(false)
    })

    it('returns correct stats for odd count', () => {
      const h = new IntervalHeap<number>()
      h.push(1)
      h.push(2)
      h.push(3)
      const stats = h.getStats()
      expect(stats.size).toBe(3)
      expect(stats.nodeCount).toBe(2)
      expect(stats.hasSingleElement).toBe(true)
    })
  })

  describe('static from', () => {
    it('creates heap from array', () => {
      const h = IntervalHeap.from([5, 3, 8, 1, 9])
      expect(h.size).toBe(5)
      expect(h.peekMin()).toBe(1)
      expect(h.peekMax()).toBe(9)
    })

    it('creates heap from empty array', () => {
      const h = IntervalHeap.from([])
      expect(h.size).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('creates heap from single-element array', () => {
      const h = IntervalHeap.from([42])
      expect(h.size).toBe(1)
      expect(h.peekMin()).toBe(42)
      expect(h.peekMax()).toBe(42)
    })

    it('creates heap with custom comparator', () => {
      const h = IntervalHeap.from([1, 2, 3], { comparator: (a, b) => b - a })
      expect(h.peekMin()).toBe(3)
      expect(h.peekMax()).toBe(1)
    })

    it('creates heap from large array', () => {
      const arr = Array.from({ length: 100 }, (_, i) => 100 - i)
      const h = IntervalHeap.from(arr)
      expect(h.size).toBe(100)
      expect(h.peekMin()).toBe(1)
      expect(h.peekMax()).toBe(100)
    })
  })

  describe('mixed operations', () => {
    it('alternating push and popMin', () => {
      const h = new IntervalHeap<number>()
      h.push(5)
      h.push(3)
      expect(h.popMin()).toBe(3)
      h.push(1)
      h.push(7)
      expect(h.popMin()).toBe(1)
      expect(h.popMin()).toBe(5)
      expect(h.popMin()).toBe(7)
    })

    it('alternating push and popMax', () => {
      const h = new IntervalHeap<number>()
      h.push(5)
      h.push(3)
      expect(h.popMax()).toBe(5)
      h.push(1)
      h.push(7)
      expect(h.popMax()).toBe(7)
      expect(h.popMax()).toBe(3)
      expect(h.popMax()).toBe(1)
    })

    it('mixed popMin and popMax', () => {
      const h = new IntervalHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      h.push(1)
      h.push(9)
      h.push(2)
      expect(h.popMin()).toBe(1)
      expect(h.popMax()).toBe(9)
      expect(h.popMin()).toBe(2)
      expect(h.popMax()).toBe(7)
      expect(h.popMin()).toBe(3)
      expect(h.popMax()).toBe(5)
      expect(h.isEmpty()).toBe(true)
    })

    it('push after pops maintains invariants', () => {
      const h = new IntervalHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      h.popMin()
      h.push(1)
      expect(h.peekMin()).toBe(1)
      expect(h.peekMax()).toBe(7)
    })
  })

  describe('edge cases', () => {
    it('handles single element operations', () => {
      const h = new IntervalHeap<number>()
      h.push(42)
      expect(h.peekMin()).toBe(42)
      expect(h.peekMax()).toBe(42)
      expect(h.popMin()).toBe(42)
      expect(h.isEmpty()).toBe(true)
    })

    it('handles single element popMax', () => {
      const h = new IntervalHeap<number>()
      h.push(42)
      expect(h.popMax()).toBe(42)
      expect(h.isEmpty()).toBe(true)
    })

    it('handles two elements', () => {
      const h = new IntervalHeap<number>()
      h.push(3)
      h.push(7)
      expect(h.popMin()).toBe(3)
      expect(h.popMax()).toBe(7)
    })

    it('handles two elements reversed', () => {
      const h = new IntervalHeap<number>()
      h.push(7)
      h.push(3)
      expect(h.popMax()).toBe(7)
      expect(h.popMin()).toBe(3)
    })

    it('handles many duplicates', () => {
      const h = new IntervalHeap<number>()
      for (let i = 0; i < 10; i++) h.push(5)
      expect(h.size).toBe(10)
      expect(h.peekMin()).toBe(5)
      expect(h.peekMax()).toBe(5)
      for (let i = 0; i < 10; i++) {
        expect(h.popMin()).toBe(5)
      }
      expect(h.isEmpty()).toBe(true)
    })

    it('handles negative numbers', () => {
      const h = new IntervalHeap<number>()
      h.push(-5)
      h.push(-3)
      h.push(-7)
      h.push(-1)
      expect(h.peekMin()).toBe(-7)
      expect(h.peekMax()).toBe(-1)
    })

    it('handles zero', () => {
      const h = new IntervalHeap<number>()
      h.push(0)
      h.push(-1)
      h.push(1)
      expect(h.peekMin()).toBe(-1)
      expect(h.peekMax()).toBe(1)
    })

    it('handles floating point numbers', () => {
      const h = new IntervalHeap<number>()
      h.push(1.5)
      h.push(2.7)
      h.push(0.3)
      expect(h.peekMin()).toBe(0.3)
      expect(h.peekMax()).toBe(2.7)
    })
  })

  describe('string elements', () => {
    it('works with string values', () => {
      const h = new IntervalHeap<string>()
      h.push('cherry')
      h.push('apple')
      h.push('banana')
      expect(h.peekMin()).toBe('apple')
      expect(h.peekMax()).toBe('cherry')
    })

    it('pops strings in correct order', () => {
      const h = new IntervalHeap<string>()
      h.push('cherry')
      h.push('apple')
      h.push('banana')
      expect(h.popMin()).toBe('apple')
      expect(h.popMin()).toBe('banana')
      expect(h.popMin()).toBe('cherry')
    })
  })

  describe('object elements', () => {
    it('works with custom comparator on objects', () => {
      interface Item {
        priority: number
        name: string
      }
      const h = new IntervalHeap<Item>({
        comparator: (a, b) => a.priority - b.priority,
      })
      h.push({ priority: 3, name: 'low' })
      h.push({ priority: 1, name: 'high' })
      h.push({ priority: 2, name: 'medium' })
      expect(h.peekMin()!.name).toBe('high')
      expect(h.peekMax()!.name).toBe('low')
    })
  })

  describe('large batches', () => {
    it('pushes and pops 1000 elements correctly via popMin', () => {
      const h = new IntervalHeap<number>()
      for (let i = 0; i < 1000; i++) {
        h.push(Math.floor(Math.random() * 10000))
      }
      let prev = h.popMin()!
      while (!h.isEmpty()) {
        const curr = h.popMin()!
        expect(curr).toBeGreaterThanOrEqual(prev)
        prev = curr
      }
    })

    it('pushes and pops 1000 elements correctly via popMax', () => {
      const h = new IntervalHeap<number>()
      for (let i = 0; i < 1000; i++) {
        h.push(Math.floor(Math.random() * 10000))
      }
      let prev = h.popMax()!
      while (!h.isEmpty()) {
        const curr = h.popMax()!
        expect(curr).toBeLessThanOrEqual(prev)
        prev = curr
      }
    })

    it('handles sequential 1-1000 via popMin', () => {
      const h = new IntervalHeap<number>()
      for (let i = 1000; i >= 1; i--) h.push(i)
      for (let i = 1; i <= 1000; i++) {
        expect(h.popMin()).toBe(i)
      }
    })

    it('handles sequential 1-1000 via popMax', () => {
      const h = new IntervalHeap<number>()
      for (let i = 1; i <= 1000; i++) h.push(i)
      for (let i = 1000; i >= 1; i--) {
        expect(h.popMax()).toBe(i)
      }
    })
  })

  describe('stress - remove during iteration pattern', () => {
    it('remove specific values then verify order', () => {
      const h = new IntervalHeap<number>()
      for (let i = 1; i <= 20; i++) h.push(i)
      for (let i = 2; i <= 20; i += 2) {
        h.remove(i)
      }
      const remaining: number[] = []
      while (!h.isEmpty()) remaining.push(h.popMin()!)
      expect(remaining).toEqual([1, 3, 5, 7, 9, 11, 13, 15, 17, 19])
    })
  })

  describe('clear and reuse', () => {
    it('clear then push new elements', () => {
      const h = new IntervalHeap<number>()
      h.push(1)
      h.push(2)
      h.push(3)
      h.clear()
      expect(h.size).toBe(0)
      h.push(10)
      h.push(20)
      expect(h.peekMin()).toBe(10)
      expect(h.peekMax()).toBe(20)
    })
  })

  describe('toArray snapshot', () => {
    it('toArray does not affect heap state', () => {
      const h = new IntervalHeap<number>()
      h.push(3)
      h.push(1)
      h.push(2)
      h.toArray()
      expect(h.size).toBe(3)
      expect(h.peekMin()).toBe(1)
      expect(h.peekMax()).toBe(3)
    })
  })

  describe('custom comparator - reverse order', () => {
    it('behaves as min-heap when comparator is reversed', () => {
      const h = new IntervalHeap<number>({ comparator: (a, b) => b - a })
      h.push(1)
      h.push(5)
      h.push(3)
      expect(h.peekMin()).toBe(5)
      expect(h.peekMax()).toBe(1)
      expect(h.popMin()).toBe(5)
      expect(h.popMin()).toBe(3)
      expect(h.popMin()).toBe(1)
    })
  })

  describe('invariant checks', () => {
    it('popMin and popMax drain to same sorted order from random input', () => {
      const h = new IntervalHeap<number>()
      const input = [42, 17, 83, 5, 99, 31, 67, 24, 88, 11, 56, 73, 2, 38, 61]
      for (const v of input) h.push(v)
      const sorted = [...input].sort((a, b) => a - b)
      const fromMin: number[] = []
      while (!h.isEmpty()) fromMin.push(h.popMin()!)
      expect(fromMin).toEqual(sorted)
      const h2 = IntervalHeap.from(input)
      const fromMax: number[] = []
      while (!h2.isEmpty()) fromMax.push(h2.popMax()!)
      expect(fromMax).toEqual([...sorted].reverse())
    })

    it('mixed popMin/popMax yields correct partial ordering', () => {
      const h = IntervalHeap.from([5, 3, 8, 1, 9, 2, 7, 4, 6])
      const mins: number[] = [h.popMin()!, h.popMin()!, h.popMin()!]
      const maxs: number[] = [h.popMax()!, h.popMax()!, h.popMax()!]
      expect(mins).toEqual([1, 2, 3])
      expect(maxs).toEqual([9, 8, 7])
      expect(h.toArray().sort((a, b) => a - b)).toEqual([4, 5, 6])
    })
  })

  describe('replace edge cases', () => {
    it('replaces with same value', () => {
      const h = new IntervalHeap<number>()
      h.push(5)
      h.push(3)
      h.push(7)
      expect(h.replace(5, 5)).toBe(true)
      expect(h.size).toBe(3)
    })

    it('replace then verify full sort', () => {
      const h = IntervalHeap.from([10, 20, 30, 40, 50])
      h.replace(30, 5)
      h.replace(10, 60)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.popMin()!)
      expect(result).toEqual([5, 20, 40, 50, 60])
    })
  })

  describe('contains after operations', () => {
    it('does not contain removed elements', () => {
      const h = IntervalHeap.from([1, 2, 3, 4, 5])
      h.popMin()
      expect(h.contains(1)).toBe(false)
      expect(h.contains(2)).toBe(true)
    })

    it('does not contain popped max', () => {
      const h = IntervalHeap.from([1, 2, 3, 4, 5])
      h.popMax()
      expect(h.contains(5)).toBe(false)
      expect(h.contains(4)).toBe(true)
    })
  })

  describe('repeated clear and push', () => {
    it('handles multiple clear/push cycles', () => {
      const h = new IntervalHeap<number>()
      for (let cycle = 0; cycle < 5; cycle++) {
        h.clear()
        expect(h.isEmpty()).toBe(true)
        for (let i = 0; i < 10; i++) h.push(i * 10)
        expect(h.size).toBe(10)
        expect(h.peekMin()).toBe(0)
        expect(h.peekMax()).toBe(90)
      }
    })
  })
})
