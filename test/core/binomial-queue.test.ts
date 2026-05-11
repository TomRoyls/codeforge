import { describe, it, expect } from 'vitest'
import { BinomialQueue } from '../../src/core/binomial-queue/index.js'

describe('BinomialQueue', () => {
  describe('constructor', () => {
    it('should create an empty queue with default comparator', () => {
      const q = new BinomialQueue<number>()
      expect(q.isEmpty()).toBe(true)
      expect(q.size()).toBe(0)
    })

    it('should create a queue with custom comparator', () => {
      const q = new BinomialQueue<number>({
        comparator: (a, b) => b - a,
      })
      expect(q.isEmpty()).toBe(true)
    })

    it('should accept options object with no comparator', () => {
      const q = new BinomialQueue<number>({})
      expect(q.isEmpty()).toBe(true)
    })
  })

  describe('push and pop', () => {
    it('should push a single item', () => {
      const q = new BinomialQueue<number>()
      q.push(5)
      expect(q.size()).toBe(1)
      expect(q.isEmpty()).toBe(false)
    })

    it('should pop the single item', () => {
      const q = new BinomialQueue<number>()
      q.push(5)
      expect(q.pop()).toBe(5)
      expect(q.isEmpty()).toBe(true)
    })

    it('should push multiple items and pop in order', () => {
      const q = new BinomialQueue<number>()
      q.push(3)
      q.push(1)
      q.push(2)
      expect(q.pop()).toBe(1)
      expect(q.pop()).toBe(2)
      expect(q.pop()).toBe(3)
    })

    it('should handle push and pop interleaved', () => {
      const q = new BinomialQueue<number>()
      q.push(5)
      q.push(3)
      expect(q.pop()).toBe(3)
      q.push(1)
      expect(q.pop()).toBe(1)
      expect(q.pop()).toBe(5)
    })

    it('should throw on pop when empty', () => {
      const q = new BinomialQueue<number>()
      expect(() => q.pop()).toThrow('Queue is empty')
    })

    it('should handle duplicate values', () => {
      const q = new BinomialQueue<number>()
      q.push(3)
      q.push(3)
      q.push(1)
      expect(q.pop()).toBe(1)
      expect(q.pop()).toBe(3)
      expect(q.pop()).toBe(3)
    })

    it('should handle negative numbers', () => {
      const q = new BinomialQueue<number>()
      q.push(-5)
      q.push(3)
      q.push(-10)
      expect(q.pop()).toBe(-10)
      expect(q.pop()).toBe(-5)
      expect(q.pop()).toBe(3)
    })

    it('should handle zero', () => {
      const q = new BinomialQueue<number>()
      q.push(0)
      q.push(-1)
      q.push(1)
      expect(q.pop()).toBe(-1)
      expect(q.pop()).toBe(0)
      expect(q.pop()).toBe(1)
    })

    it('should handle string values', () => {
      const q = new BinomialQueue<string>()
      q.push('banana')
      q.push('apple')
      q.push('cherry')
      expect(q.pop()).toBe('apple')
      expect(q.pop()).toBe('banana')
      expect(q.pop()).toBe('cherry')
    })

    it('should handle pushing many items to trigger tree linking', () => {
      const q = new BinomialQueue<number>()
      for (let i = 15; i >= 0; i--) {
        q.push(i)
      }
      expect(q.size()).toBe(16)
      for (let i = 0; i <= 15; i++) {
        expect(q.pop()).toBe(i)
      }
    })
  })

  describe('peek', () => {
    it('should peek at the minimum without removing', () => {
      const q = new BinomialQueue<number>()
      q.push(3)
      q.push(1)
      q.push(2)
      expect(q.peek()).toBe(1)
      expect(q.size()).toBe(3)
    })

    it('should throw on peek when empty', () => {
      const q = new BinomialQueue<number>()
      expect(() => q.peek()).toThrow('Queue is empty')
    })

    it('should peek correctly after pops', () => {
      const q = new BinomialQueue<number>()
      q.push(5)
      q.push(3)
      q.push(1)
      q.push(4)
      q.pop()
      expect(q.peek()).toBe(3)
    })

    it('should return same value on multiple peeks', () => {
      const q = new BinomialQueue<number>()
      q.push(42)
      expect(q.peek()).toBe(42)
      expect(q.peek()).toBe(42)
      expect(q.peek()).toBe(42)
    })
  })

  describe('size and isEmpty', () => {
    it('should return correct size after pushes', () => {
      const q = new BinomialQueue<number>()
      expect(q.size()).toBe(0)
      q.push(1)
      expect(q.size()).toBe(1)
      q.push(2)
      expect(q.size()).toBe(2)
      q.push(3)
      expect(q.size()).toBe(3)
    })

    it('should return correct size after pops', () => {
      const q = new BinomialQueue<number>()
      q.push(1)
      q.push(2)
      q.push(3)
      q.pop()
      expect(q.size()).toBe(2)
      q.pop()
      expect(q.size()).toBe(1)
      q.pop()
      expect(q.size()).toBe(0)
    })

    it('should track isEmpty correctly', () => {
      const q = new BinomialQueue<number>()
      expect(q.isEmpty()).toBe(true)
      q.push(1)
      expect(q.isEmpty()).toBe(false)
      q.pop()
      expect(q.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear all items', () => {
      const q = new BinomialQueue<number>()
      q.push(1)
      q.push(2)
      q.push(3)
      q.clear()
      expect(q.isEmpty()).toBe(true)
      expect(q.size()).toBe(0)
    })

    it('should be safe to clear an empty queue', () => {
      const q = new BinomialQueue<number>()
      q.clear()
      expect(q.isEmpty()).toBe(true)
    })

    it('should allow operations after clear', () => {
      const q = new BinomialQueue<number>()
      q.push(1)
      q.push(2)
      q.clear()
      q.push(3)
      expect(q.size()).toBe(1)
      expect(q.pop()).toBe(3)
    })
  })

  describe('merge', () => {
    it('should merge two non-empty queues', () => {
      const q1 = new BinomialQueue<number>()
      q1.push(1)
      q1.push(3)
      const q2 = new BinomialQueue<number>()
      q2.push(2)
      q2.push(4)
      q1.merge(q2)
      expect(q1.size()).toBe(4)
      expect(q2.size()).toBe(0)
      expect(q2.isEmpty()).toBe(true)
      expect(q1.pop()).toBe(1)
      expect(q1.pop()).toBe(2)
      expect(q1.pop()).toBe(3)
      expect(q1.pop()).toBe(4)
    })

    it('should merge with empty queue', () => {
      const q1 = new BinomialQueue<number>()
      q1.push(1)
      q1.push(2)
      const q2 = new BinomialQueue<number>()
      q1.merge(q2)
      expect(q1.size()).toBe(2)
      expect(q1.pop()).toBe(1)
      expect(q1.pop()).toBe(2)
    })

    it('should merge empty with non-empty queue', () => {
      const q1 = new BinomialQueue<number>()
      const q2 = new BinomialQueue<number>()
      q2.push(1)
      q2.push(2)
      q1.merge(q2)
      expect(q1.size()).toBe(2)
      expect(q1.pop()).toBe(1)
      expect(q1.pop()).toBe(2)
    })

    it('should merge two empty queues', () => {
      const q1 = new BinomialQueue<number>()
      const q2 = new BinomialQueue<number>()
      q1.merge(q2)
      expect(q1.isEmpty()).toBe(true)
    })

    it('should handle merge with self gracefully', () => {
      const q = new BinomialQueue<number>()
      q.push(1)
      q.push(2)
      const sizeBefore = q.size()
      q.merge(q)
      expect(q.size()).toBe(sizeBefore)
    })

    it('should be destructive for the other queue', () => {
      const q1 = new BinomialQueue<number>()
      q1.push(1)
      const q2 = new BinomialQueue<number>()
      q2.push(2)
      q2.push(3)
      q1.merge(q2)
      expect(q2.isEmpty()).toBe(true)
      expect(q2.size()).toBe(0)
    })

    it('should merge queues with overlapping values', () => {
      const q1 = new BinomialQueue<number>()
      q1.push(1)
      q1.push(4)
      const q2 = new BinomialQueue<number>()
      q2.push(2)
      q2.push(3)
      q1.merge(q2)
      expect(q1.toSortedArray()).toEqual([1, 2, 3, 4])
    })

    it('should merge large queues correctly', () => {
      const q1 = new BinomialQueue<number>()
      for (let i = 0; i < 100; i++) q1.push(i * 2)
      const q2 = new BinomialQueue<number>()
      for (let i = 0; i < 100; i++) q2.push(i * 2 + 1)
      q1.merge(q2)
      expect(q1.size()).toBe(200)
      const sorted = q1.toSortedArray()
      expect(sorted[0]).toBe(0)
      expect(sorted[199]).toBe(199)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty queue', () => {
      const q = new BinomialQueue<number>()
      expect(q.toArray()).toEqual([])
    })

    it('should return all items', () => {
      const q = new BinomialQueue<number>()
      q.push(3)
      q.push(1)
      q.push(2)
      const arr = q.toArray()
      expect(arr.length).toBe(3)
      expect(arr.sort((a, b) => a - b)).toEqual([1, 2, 3])
    })

    it('should not modify the queue', () => {
      const q = new BinomialQueue<number>()
      q.push(1)
      q.push(2)
      q.toArray()
      expect(q.size()).toBe(2)
    })

    it('should handle single element', () => {
      const q = new BinomialQueue<number>()
      q.push(42)
      expect(q.toArray()).toEqual([42])
    })
  })

  describe('toSortedArray', () => {
    it('should return sorted array', () => {
      const q = new BinomialQueue<number>()
      q.push(3)
      q.push(1)
      q.push(2)
      expect(q.toSortedArray()).toEqual([1, 2, 3])
    })

    it('should return empty array for empty queue', () => {
      const q = new BinomialQueue<number>()
      expect(q.toSortedArray()).toEqual([])
    })

    it('should not modify the original queue', () => {
      const q = new BinomialQueue<number>()
      q.push(3)
      q.push(1)
      q.push(2)
      q.toSortedArray()
      expect(q.size()).toBe(3)
      expect(q.peek()).toBe(1)
    })

    it('should handle many items', () => {
      const q = new BinomialQueue<number>()
      for (let i = 50; i >= 0; i--) q.push(i)
      const sorted = q.toSortedArray()
      for (let i = 0; i <= 50; i++) {
        expect(sorted[i]).toBe(i)
      }
    })
  })

  describe('contains', () => {
    it('should find existing item', () => {
      const q = new BinomialQueue<number>()
      q.push(1)
      q.push(2)
      q.push(3)
      expect(q.contains(2)).toBe(true)
    })

    it('should not find missing item', () => {
      const q = new BinomialQueue<number>()
      q.push(1)
      q.push(2)
      expect(q.contains(5)).toBe(false)
    })

    it('should return false for empty queue', () => {
      const q = new BinomialQueue<number>()
      expect(q.contains(1)).toBe(false)
    })

    it('should find item after pops', () => {
      const q = new BinomialQueue<number>()
      q.push(1)
      q.push(2)
      q.push(3)
      q.pop()
      expect(q.contains(2)).toBe(true)
      expect(q.contains(1)).toBe(false)
    })

    it('should work with strings', () => {
      const q = new BinomialQueue<string>()
      q.push('hello')
      q.push('world')
      expect(q.contains('hello')).toBe(true)
      expect(q.contains('foo')).toBe(false)
    })
  })

  describe('remove', () => {
    it('should remove existing item', () => {
      const q = new BinomialQueue<number>()
      q.push(1)
      q.push(2)
      q.push(3)
      expect(q.remove(2)).toBe(true)
      expect(q.size()).toBe(2)
      expect(q.contains(2)).toBe(false)
    })

    it('should return false for missing item', () => {
      const q = new BinomialQueue<number>()
      q.push(1)
      expect(q.remove(5)).toBe(false)
      expect(q.size()).toBe(1)
    })

    it('should return false for empty queue', () => {
      const q = new BinomialQueue<number>()
      expect(q.remove(1)).toBe(false)
    })

    it('should remove the minimum', () => {
      const q = new BinomialQueue<number>()
      q.push(1)
      q.push(2)
      q.push(3)
      expect(q.remove(1)).toBe(true)
      expect(q.peek()).toBe(2)
    })

    it('should maintain heap order after remove', () => {
      const q = new BinomialQueue<number>()
      for (let i = 0; i < 10; i++) q.push(i)
      q.remove(5)
      const sorted = q.toSortedArray()
      expect(sorted).toEqual([0, 1, 2, 3, 4, 6, 7, 8, 9])
    })

    it('should remove single element queue', () => {
      const q = new BinomialQueue<number>()
      q.push(42)
      expect(q.remove(42)).toBe(true)
      expect(q.isEmpty()).toBe(true)
    })
  })

  describe('decreaseKey', () => {
    it('should decrease key of existing item', () => {
      const q = new BinomialQueue<number>()
      q.push(5)
      q.push(3)
      q.push(10)
      expect(q.decreaseKey(10, 1)).toBe(true)
      expect(q.peek()).toBe(1)
    })

    it('should return false for missing item', () => {
      const q = new BinomialQueue<number>()
      q.push(1)
      expect(q.decreaseKey(5, 2)).toBe(false)
    })

    it('should return false when new key is greater', () => {
      const q = new BinomialQueue<number>()
      q.push(3)
      expect(q.decreaseKey(3, 10)).toBe(false)
    })

    it('should return false for empty queue', () => {
      const q = new BinomialQueue<number>()
      expect(q.decreaseKey(1, 0)).toBe(false)
    })

    it('should handle decreaseKey on min element', () => {
      const q = new BinomialQueue<number>()
      q.push(5)
      q.push(10)
      q.push(15)
      expect(q.decreaseKey(5, 1)).toBe(true)
      expect(q.peek()).toBe(1)
    })

    it('should handle decreaseKey with equal new key', () => {
      const q = new BinomialQueue<number>()
      q.push(5)
      expect(q.decreaseKey(5, 5)).toBe(true)
      expect(q.peek()).toBe(5)
    })

    it('should maintain correct order after decreaseKey', () => {
      const q = new BinomialQueue<number>()
      q.push(1)
      q.push(10)
      q.push(20)
      q.decreaseKey(20, 0)
      expect(q.toSortedArray()).toEqual([0, 1, 10])
    })
  })

  describe('clone', () => {
    it('should clone an empty queue', () => {
      const q = new BinomialQueue<number>()
      const c = q.clone()
      expect(c.isEmpty()).toBe(true)
      expect(c.size()).toBe(0)
    })

    it('should clone a non-empty queue', () => {
      const q = new BinomialQueue<number>()
      q.push(1)
      q.push(2)
      q.push(3)
      const c = q.clone()
      expect(c.size()).toBe(3)
      expect(c.toSortedArray()).toEqual([1, 2, 3])
    })

    it('should not affect original when modifying clone', () => {
      const q = new BinomialQueue<number>()
      q.push(1)
      q.push(2)
      q.push(3)
      const c = q.clone()
      c.pop()
      expect(q.size()).toBe(3)
      expect(c.size()).toBe(2)
    })

    it('should not affect clone when modifying original', () => {
      const q = new BinomialQueue<number>()
      q.push(1)
      q.push(2)
      q.push(3)
      const c = q.clone()
      q.pop()
      expect(c.size()).toBe(3)
      expect(q.size()).toBe(2)
    })

    it('should preserve comparator in clone', () => {
      const q = new BinomialQueue<number>({
        comparator: (a, b) => b - a,
      })
      q.push(1)
      q.push(5)
      q.push(3)
      const c = q.clone()
      expect(c.toSortedArray()).toEqual([5, 3, 1])
    })
  })

  describe('fromArray', () => {
    it('should create queue from array', () => {
      const q = BinomialQueue.fromArray([3, 1, 2])
      expect(q.size()).toBe(3)
      expect(q.toSortedArray()).toEqual([1, 2, 3])
    })

    it('should create queue from empty array', () => {
      const q = BinomialQueue.fromArray<number>([])
      expect(q.isEmpty()).toBe(true)
    })

    it('should create queue with custom comparator', () => {
      const q = BinomialQueue.fromArray([1, 2, 3], {
        comparator: (a, b) => b - a,
      })
      expect(q.toSortedArray()).toEqual([3, 2, 1])
    })

    it('should handle single element array', () => {
      const q = BinomialQueue.fromArray([42])
      expect(q.size()).toBe(1)
      expect(q.peek()).toBe(42)
    })

    it('should handle string arrays', () => {
      const q = BinomialQueue.fromArray(['cherry', 'apple', 'banana'])
      expect(q.toSortedArray()).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  describe('forEach', () => {
    it('should iterate over all items', () => {
      const q = new BinomialQueue<number>()
      q.push(1)
      q.push(2)
      q.push(3)
      const items: number[] = []
      q.forEach((item) => items.push(item))
      expect(items.sort((a, b) => a - b)).toEqual([1, 2, 3])
    })

    it('should not call callback for empty queue', () => {
      const q = new BinomialQueue<number>()
      let count = 0
      q.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should call callback for each item exactly once', () => {
      const q = new BinomialQueue<number>()
      q.push(1)
      q.push(2)
      q.push(3)
      let count = 0
      q.forEach(() => count++)
      expect(count).toBe(3)
    })
  })

  describe('Symbol.iterator', () => {
    it('should be iterable', () => {
      const q = new BinomialQueue<number>()
      q.push(1)
      q.push(2)
      q.push(3)
      const items = [...q]
      expect(items.sort((a, b) => a - b)).toEqual([1, 2, 3])
    })

    it('should work with empty queue', () => {
      const q = new BinomialQueue<number>()
      const items = [...q]
      expect(items).toEqual([])
    })

    it('should work in for-of loop', () => {
      const q = new BinomialQueue<number>()
      q.push(10)
      q.push(20)
      const items: number[] = []
      for (const item of q) {
        items.push(item)
      }
      expect(items.sort((a, b) => a - b)).toEqual([10, 20])
    })
  })

  describe('custom comparator (max-heap)', () => {
    it('should work as max-heap', () => {
      const q = new BinomialQueue<number>({
        comparator: (a, b) => b - a,
      })
      q.push(1)
      q.push(3)
      q.push(2)
      expect(q.pop()).toBe(3)
      expect(q.pop()).toBe(2)
      expect(q.pop()).toBe(1)
    })

    it('should peek max element', () => {
      const q = new BinomialQueue<number>({
        comparator: (a, b) => b - a,
      })
      q.push(1)
      q.push(5)
      q.push(3)
      expect(q.peek()).toBe(5)
    })

    it('should toSortedArray in descending order for max-heap', () => {
      const q = new BinomialQueue<number>({
        comparator: (a, b) => b - a,
      })
      q.push(1)
      q.push(3)
      q.push(2)
      expect(q.toSortedArray()).toEqual([3, 2, 1])
    })

    it('should merge with same comparator', () => {
      const q1 = new BinomialQueue<number>({
        comparator: (a, b) => b - a,
      })
      q1.push(1)
      q1.push(5)
      const q2 = new BinomialQueue<number>({
        comparator: (a, b) => b - a,
      })
      q2.push(3)
      q2.push(2)
      q1.merge(q2)
      expect(q1.size()).toBe(4)
      expect(q1.toSortedArray()).toEqual([5, 3, 2, 1])
    })

    it('should contains work with max-heap comparator', () => {
      const q = new BinomialQueue<number>({
        comparator: (a, b) => b - a,
      })
      q.push(1)
      q.push(2)
      q.push(3)
      expect(q.contains(2)).toBe(true)
      expect(q.contains(5)).toBe(false)
    })

    it('should remove work with max-heap comparator', () => {
      const q = new BinomialQueue<number>({
        comparator: (a, b) => b - a,
      })
      q.push(1)
      q.push(2)
      q.push(3)
      expect(q.remove(2)).toBe(true)
      expect(q.toSortedArray()).toEqual([3, 1])
    })

    it('should decreaseKey work with max-heap comparator', () => {
      const q = new BinomialQueue<number>({
        comparator: (a, b) => b - a,
      })
      q.push(1)
      q.push(3)
      q.push(5)
      expect(q.decreaseKey(1, 10)).toBe(true)
      expect(q.peek()).toBe(10)
    })
  })

  describe('edge cases', () => {
    it('should handle single element', () => {
      const q = new BinomialQueue<number>()
      q.push(42)
      expect(q.peek()).toBe(42)
      expect(q.pop()).toBe(42)
      expect(q.isEmpty()).toBe(true)
    })

    it('should handle merge empty with non-empty', () => {
      const q1 = new BinomialQueue<number>()
      const q2 = new BinomialQueue<number>()
      q2.push(1)
      q2.push(2)
      q1.merge(q2)
      expect(q1.size()).toBe(2)
    })

    it('should handle merge non-empty with empty', () => {
      const q1 = new BinomialQueue<number>()
      q1.push(1)
      const q2 = new BinomialQueue<number>()
      q1.merge(q2)
      expect(q1.size()).toBe(1)
    })

    it('should handle sequential pushes and pops', () => {
      const q = new BinomialQueue<number>()
      q.push(5)
      expect(q.pop()).toBe(5)
      q.push(3)
      q.push(1)
      expect(q.pop()).toBe(1)
      q.push(4)
      expect(q.pop()).toBe(3)
      expect(q.pop()).toBe(4)
      expect(q.isEmpty()).toBe(true)
    })

    it('should handle push after clear', () => {
      const q = new BinomialQueue<number>()
      q.push(1)
      q.push(2)
      q.clear()
      q.push(3)
      expect(q.size()).toBe(1)
      expect(q.pop()).toBe(3)
    })

    it('should handle objects with custom comparator', () => {
      interface Item {
        priority: number
        name: string
      }
      const q = new BinomialQueue<Item>({
        comparator: (a, b) => a.priority - b.priority,
      })
      q.push({ priority: 3, name: 'low' })
      q.push({ priority: 1, name: 'high' })
      q.push({ priority: 2, name: 'medium' })
      expect(q.pop()!.name).toBe('high')
      expect(q.pop()!.name).toBe('medium')
      expect(q.pop()!.name).toBe('low')
    })
  })

  describe('large datasets', () => {
    it('should handle 1000 items', () => {
      const q = new BinomialQueue<number>()
      for (let i = 999; i >= 0; i--) q.push(i)
      expect(q.size()).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(q.pop()).toBe(i)
      }
      expect(q.isEmpty()).toBe(true)
    })

    it('should handle 1000 items in random order', () => {
      const q = new BinomialQueue<number>()
      const items = Array.from({ length: 1000 }, (_, i) => i)
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[items[i]!, items[j]!] = [items[j]!, items[i]!]
      }
      for (const item of items) q.push(item)
      expect(q.size()).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(q.pop()).toBe(i)
      }
    })

    it('should merge two large queues', () => {
      const q1 = new BinomialQueue<number>()
      const q2 = new BinomialQueue<number>()
      for (let i = 0; i < 500; i++) q1.push(i * 2)
      for (let i = 0; i < 500; i++) q2.push(i * 2 + 1)
      q1.merge(q2)
      expect(q1.size()).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(q1.pop()).toBe(i)
      }
    })

    it('should handle fromArray with many items', () => {
      const items = Array.from({ length: 500 }, (_, i) => 500 - i)
      const q = BinomialQueue.fromArray(items)
      expect(q.size()).toBe(500)
      for (let i = 1; i <= 500; i++) {
        expect(q.pop()).toBe(i)
      }
    })

    it('should handle interleaved push/pop on large scale', () => {
      const q = new BinomialQueue<number>()
      let expected = 0
      for (let i = 0; i < 500; i++) {
        q.push(i)
        if (i % 3 === 0 && i > 0) {
          expect(q.pop()).toBe(expected++)
        }
      }
      while (!q.isEmpty()) {
        expect(q.pop()).toBe(expected++)
      }
      expect(expected).toBe(500)
    })
  })

  describe('interleaved operations', () => {
    it('should handle push, pop, merge, remove sequence', () => {
      const q1 = new BinomialQueue<number>()
      const q2 = new BinomialQueue<number>()
      q1.push(5)
      q1.push(3)
      q1.push(8)
      q2.push(1)
      q2.push(7)
      q1.merge(q2)
      q1.remove(7)
      expect(q1.toSortedArray()).toEqual([1, 3, 5, 8])
    })

    it('should handle clone after operations', () => {
      const q = new BinomialQueue<number>()
      q.push(5)
      q.push(3)
      q.push(1)
      q.pop()
      const c = q.clone()
      expect(c.toSortedArray()).toEqual([3, 5])
    })

    it('should handle contains after remove', () => {
      const q = new BinomialQueue<number>()
      q.push(1)
      q.push(2)
      q.push(3)
      q.remove(2)
      expect(q.contains(1)).toBe(true)
      expect(q.contains(2)).toBe(false)
      expect(q.contains(3)).toBe(true)
    })

    it('should handle decreaseKey then pop', () => {
      const q = new BinomialQueue<number>()
      q.push(10)
      q.push(5)
      q.push(15)
      q.decreaseKey(15, 1)
      expect(q.pop()).toBe(1)
      expect(q.pop()).toBe(5)
      expect(q.pop()).toBe(10)
    })

    it('should handle toArray after various operations', () => {
      const q = new BinomialQueue<number>()
      q.push(3)
      q.push(1)
      q.push(4)
      q.push(2)
      q.remove(3)
      const arr = q.toArray()
      expect(arr.sort((a, b) => a - b)).toEqual([1, 2, 4])
    })

    it('should handle merge after pops', () => {
      const q1 = new BinomialQueue<number>()
      q1.push(1)
      q1.push(5)
      q1.pop()
      const q2 = new BinomialQueue<number>()
      q2.push(2)
      q2.push(3)
      q1.merge(q2)
      expect(q1.toSortedArray()).toEqual([2, 3, 5])
    })

    it('should handle clear and reuse', () => {
      const q = new BinomialQueue<number>()
      q.push(1)
      q.push(2)
      q.push(3)
      q.clear()
      expect(q.isEmpty()).toBe(true)
      q.push(10)
      q.push(5)
      expect(q.pop()).toBe(5)
      expect(q.pop()).toBe(10)
    })

    it('should handle multiple merges', () => {
      const q1 = new BinomialQueue<number>()
      q1.push(5)
      const q2 = new BinomialQueue<number>()
      q2.push(3)
      const q3 = new BinomialQueue<number>()
      q3.push(7)
      const q4 = new BinomialQueue<number>()
      q4.push(1)
      q1.merge(q2)
      q1.merge(q3)
      q1.merge(q4)
      expect(q1.toSortedArray()).toEqual([1, 3, 5, 7])
    })
  })

  describe('binomial tree structure', () => {
    it('should handle powers of 2 for proper tree merging', () => {
      const q = new BinomialQueue<number>()
      for (let i = 0; i < 16; i++) q.push(i)
      expect(q.size()).toBe(16)
      for (let i = 0; i < 16; i++) {
        expect(q.pop()).toBe(i)
      }
    })

    it('should handle 7 elements (binary 111)', () => {
      const q = new BinomialQueue<number>()
      for (let i = 7; i >= 1; i--) q.push(i)
      expect(q.size()).toBe(7)
      for (let i = 1; i <= 7; i++) {
        expect(q.pop()).toBe(i)
      }
    })

    it('should handle 15 elements (binary 1111)', () => {
      const q = new BinomialQueue<number>()
      for (let i = 15; i >= 1; i--) q.push(i)
      expect(q.size()).toBe(15)
      for (let i = 1; i <= 15; i++) {
        expect(q.pop()).toBe(i)
      }
    })

    it('should handle 31 elements', () => {
      const q = new BinomialQueue<number>()
      for (let i = 31; i >= 1; i--) q.push(i)
      expect(q.size()).toBe(31)
      for (let i = 1; i <= 31; i++) {
        expect(q.pop()).toBe(i)
      }
    })
  })
})
