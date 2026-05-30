import { describe, test, expect, beforeEach } from 'vitest'
import { PriorityQueue } from '../../../src/utils/priority-queue.js'

describe('PriorityQueue', () => {
  describe('constructor with default comparator', () => {
    test('creates empty queue with default number comparator', () => {
      const pq = new PriorityQueue<number>()
      expect(pq.size).toBe(0)
      expect(pq.isEmpty()).toBe(true)
    })

    test('default comparator creates min-heap for numbers', () => {
      const pq = new PriorityQueue<number>()
      pq.enqueue(5)
      pq.enqueue(3)
      pq.enqueue(7)
      expect(pq.dequeue()).toBe(3)
      expect(pq.dequeue()).toBe(5)
      expect(pq.dequeue()).toBe(7)
    })

    test('default comparator handles negative numbers', () => {
      const pq = new PriorityQueue<number>()
      pq.enqueue(-5)
      pq.enqueue(3)
      pq.enqueue(-1)
      expect(pq.dequeue()).toBe(-5)
      expect(pq.dequeue()).toBe(-1)
      expect(pq.dequeue()).toBe(3)
    })

    test('default comparator handles zero', () => {
      const pq = new PriorityQueue<number>()
      pq.enqueue(0)
      pq.enqueue(-1)
      pq.enqueue(1)
      expect(pq.dequeue()).toBe(-1)
      expect(pq.dequeue()).toBe(0)
      expect(pq.dequeue()).toBe(1)
    })
  })

  describe('constructor with custom comparator', () => {
    test('max-heap with custom comparator', () => {
      const pq = new PriorityQueue<number>({
        comparator: (a, b) => b - a
      })
      pq.enqueue(3)
      pq.enqueue(7)
      pq.enqueue(5)
      expect(pq.dequeue()).toBe(7)
      expect(pq.dequeue()).toBe(5)
      expect(pq.dequeue()).toBe(3)
    })

    test('object-based comparator by property', () => {
      interface Task {
        id: string
        priority: number
      }
      const pq = new PriorityQueue<Task>({
        comparator: (a, b) => a.priority - b.priority
      })
      pq.enqueue({ id: 'a', priority: 3 })
      pq.enqueue({ id: 'b', priority: 1 })
      pq.enqueue({ id: 'c', priority: 2 })
      expect(pq.dequeue()?.id).toBe('b')
      expect(pq.dequeue()?.id).toBe('c')
      expect(pq.dequeue()?.id).toBe('a')
    })

    test('string-based comparator', () => {
      const pq = new PriorityQueue<string>({
        comparator: (a, b) => a.localeCompare(b)
      })
      pq.enqueue('zebra')
      pq.enqueue('apple')
      pq.enqueue('banana')
      expect(pq.dequeue()).toBe('apple')
      expect(pq.dequeue()).toBe('banana')
      expect(pq.dequeue()).toBe('zebra')
    })

    test('reverse string comparator', () => {
      const pq = new PriorityQueue<string>({
        comparator: (a, b) => b.localeCompare(a)
      })
      pq.enqueue('zebra')
      pq.enqueue('apple')
      pq.enqueue('banana')
      expect(pq.dequeue()).toBe('zebra')
      expect(pq.dequeue()).toBe('banana')
      expect(pq.dequeue()).toBe('apple')
    })
  })

  describe('enqueue', () => {
    test('adds single item', () => {
      const pq = new PriorityQueue<number>()
      pq.enqueue(5)
      expect(pq.size).toBe(1)
      expect(pq.isEmpty()).toBe(false)
    })

    test('adds multiple items', () => {
      const pq = new PriorityQueue<number>()
      pq.enqueue(5)
      pq.enqueue(3)
      pq.enqueue(7)
      expect(pq.size).toBe(3)
    })

    test('handles duplicate values', () => {
      const pq = new PriorityQueue<number>()
      pq.enqueue(5)
      pq.enqueue(5)
      pq.enqueue(5)
      expect(pq.size).toBe(3)
      expect(pq.dequeue()).toBe(5)
      expect(pq.dequeue()).toBe(5)
      expect(pq.dequeue()).toBe(5)
    })

    test('handles floating point numbers', () => {
      const pq = new PriorityQueue<number>()
      pq.enqueue(3.14)
      pq.enqueue(1.41)
      pq.enqueue(2.72)
      expect(pq.dequeue()).toBe(1.41)
      expect(pq.dequeue()).toBe(2.72)
      expect(pq.dequeue()).toBe(3.14)
    })

    test('handles very large numbers', () => {
      const pq = new PriorityQueue<number>()
      pq.enqueue(Number.MAX_SAFE_INTEGER)
      pq.enqueue(0)
      pq.enqueue(Number.MIN_SAFE_INTEGER)
      expect(pq.dequeue()).toBe(Number.MIN_SAFE_INTEGER)
      expect(pq.dequeue()).toBe(0)
      expect(pq.dequeue()).toBe(Number.MAX_SAFE_INTEGER)
    })
  })

  describe('dequeue', () => {
    test('returns smallest item from min-heap', () => {
      const pq = new PriorityQueue<number>()
      pq.enqueue(5)
      pq.enqueue(3)
      pq.enqueue(7)
      expect(pq.dequeue()).toBe(3)
    })

    test('returns items in ascending order with default comparator', () => {
      const pq = new PriorityQueue<number>()
      const items = [5, 3, 7, 1, 9, 2, 8]
      items.forEach((item) => pq.enqueue(item))
      const sorted = items.slice().sort((a, b) => a - b)
      for (const expected of sorted) {
        expect(pq.dequeue()).toBe(expected)
      }
    })

    test('returns undefined from empty queue', () => {
      const pq = new PriorityQueue<number>()
      expect(pq.dequeue()).toBeUndefined()
    })

    test('dequeue reduces size', () => {
      const pq = new PriorityQueue<number>()
      pq.enqueue(5)
      pq.enqueue(3)
      pq.enqueue(7)
      expect(pq.size).toBe(3)
      pq.dequeue()
      expect(pq.size).toBe(2)
      pq.dequeue()
      expect(pq.size).toBe(1)
      pq.dequeue()
      expect(pq.size).toBe(0)
    })

    test('single element enqueue and dequeue', () => {
      const pq = new PriorityQueue<number>()
      pq.enqueue(42)
      expect(pq.dequeue()).toBe(42)
      expect(pq.isEmpty()).toBe(true)
    })
  })

  describe('peek', () => {
    test('returns smallest without removing it', () => {
      const pq = new PriorityQueue<number>()
      pq.enqueue(5)
      pq.enqueue(3)
      pq.enqueue(7)
      expect(pq.peek()).toBe(3)
      expect(pq.size).toBe(3)
      expect(pq.peek()).toBe(3)
      expect(pq.size).toBe(3)
    })

    test('peek on empty queue returns undefined', () => {
      const pq = new PriorityQueue<number>()
      expect(pq.peek()).toBeUndefined()
    })

    test('peek returns correct item after dequeue', () => {
      const pq = new PriorityQueue<number>()
      pq.enqueue(5)
      pq.enqueue(3)
      pq.enqueue(7)
      pq.enqueue(1)
      expect(pq.peek()).toBe(1)
      pq.dequeue()
      expect(pq.peek()).toBe(3)
      pq.dequeue()
      expect(pq.peek()).toBe(5)
    })

    test('peek with max-heap returns largest', () => {
      const pq = new PriorityQueue<number>({
        comparator: (a, b) => b - a
      })
      pq.enqueue(3)
      pq.enqueue(7)
      pq.enqueue(5)
      expect(pq.peek()).toBe(7)
      expect(pq.size).toBe(3)
    })
  })

  describe('size', () => {
    test('returns 0 for empty queue', () => {
      const pq = new PriorityQueue<number>()
      expect(pq.size).toBe(0)
    })

    test('tracks count correctly after enqueues', () => {
      const pq = new PriorityQueue<number>()
      expect(pq.size).toBe(0)
      pq.enqueue(1)
      expect(pq.size).toBe(1)
      pq.enqueue(2)
      expect(pq.size).toBe(2)
      pq.enqueue(3)
      expect(pq.size).toBe(3)
    })

    test('tracks count correctly after dequeues', () => {
      const pq = new PriorityQueue<number>()
      pq.enqueue(1)
      pq.enqueue(2)
      pq.enqueue(3)
      expect(pq.size).toBe(3)
      pq.dequeue()
      expect(pq.size).toBe(2)
      pq.dequeue()
      expect(pq.size).toBe(1)
    })

    test('size remains correct after mixed operations', () => {
      const pq = new PriorityQueue<number>()
      pq.enqueue(5)
      pq.enqueue(3)
      pq.enqueue(7)
      expect(pq.size).toBe(3)
      pq.dequeue()
      expect(pq.size).toBe(2)
      pq.enqueue(1)
      expect(pq.size).toBe(3)
      pq.dequeue()
      pq.dequeue()
      expect(pq.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    test('returns true for empty queue', () => {
      const pq = new PriorityQueue<number>()
      expect(pq.isEmpty()).toBe(true)
    })

    test('returns false after enqueue', () => {
      const pq = new PriorityQueue<number>()
      pq.enqueue(5)
      expect(pq.isEmpty()).toBe(false)
    })

    test('returns true after dequeueing all items', () => {
      const pq = new PriorityQueue<number>()
      pq.enqueue(5)
      pq.enqueue(3)
      pq.dequeue()
      pq.dequeue()
      expect(pq.isEmpty()).toBe(true)
    })

    test('returns false when items remain', () => {
      const pq = new PriorityQueue<number>()
      pq.enqueue(5)
      pq.enqueue(3)
      pq.enqueue(7)
      pq.dequeue()
      expect(pq.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    test('empties the queue', () => {
      const pq = new PriorityQueue<number>()
      pq.enqueue(5)
      pq.enqueue(3)
      pq.enqueue(7)
      pq.clear()
      expect(pq.size).toBe(0)
      expect(pq.isEmpty()).toBe(true)
      expect(pq.dequeue()).toBeUndefined()
      expect(pq.peek()).toBeUndefined()
    })

    test('clear works on empty queue', () => {
      const pq = new PriorityQueue<number>()
      pq.clear()
      expect(pq.size).toBe(0)
      expect(pq.isEmpty()).toBe(true)
    })

    test('can enqueue after clear', () => {
      const pq = new PriorityQueue<number>()
      pq.enqueue(5)
      pq.enqueue(3)
      pq.clear()
      pq.enqueue(7)
      pq.enqueue(1)
      expect(pq.size).toBe(2)
      expect(pq.dequeue()).toBe(1)
      expect(pq.dequeue()).toBe(7)
    })
  })

  describe('toArray', () => {
    test('returns heap array', () => {
      const pq = new PriorityQueue<number>()
      pq.enqueue(5)
      pq.enqueue(3)
      pq.enqueue(7)
      const arr = pq.toArray()
      expect(arr.length).toBe(3)
      expect(arr).toContain(5)
      expect(arr).toContain(3)
      expect(arr).toContain(7)
    })

    test('toArray returns empty array for empty queue', () => {
      const pq = new PriorityQueue<number>()
      expect(pq.toArray()).toEqual([])
    })

    test('toArray does not modify queue', () => {
      const pq = new PriorityQueue<number>()
      pq.enqueue(5)
      pq.enqueue(3)
      pq.enqueue(7)
      const arr1 = pq.toArray()
      const arr2 = pq.toArray()
      expect(arr1).toEqual(arr2)
      expect(pq.size).toBe(3)
    })

    test('toArray returns copy not reference', () => {
      const pq = new PriorityQueue<number>()
      pq.enqueue(5)
      pq.enqueue(3)
      const arr = pq.toArray()
      arr.push(100)
      expect(pq.size).toBe(2)
      expect(pq.toArray()).not.toContain(100)
    })
  })

  describe('enqueue many items and dequeue all', () => {
    test('verify sorted order with many items', () => {
      const pq = new PriorityQueue<number>()
      const items = [9, 3, 7, 1, 5, 8, 2, 6, 4, 0]
      items.forEach((item) => pq.enqueue(item))
      const sorted = items.slice().sort((a, b) => a - b)
      for (const expected of sorted) {
        expect(pq.dequeue()).toBe(expected)
      }
      expect(pq.isEmpty()).toBe(true)
    })

    test('verify sorted order with 100 items', () => {
      const pq = new PriorityQueue<number>()
      const items = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000))
      items.forEach((item) => pq.enqueue(item))
      const sorted = items.slice().sort((a, b) => a - b)
      for (const expected of sorted) {
        expect(pq.dequeue()).toBe(expected)
      }
      expect(pq.isEmpty()).toBe(true)
    })

    test('verify sorted order after interleaved enqueue and dequeue', () => {
      const pq = new PriorityQueue<number>()
      pq.enqueue(5)
      pq.enqueue(3)
      expect(pq.dequeue()).toBe(3)
      pq.enqueue(7)
      pq.enqueue(1)
      expect(pq.dequeue()).toBe(1)
      expect(pq.dequeue()).toBe(5)
      expect(pq.dequeue()).toBe(7)
      expect(pq.isEmpty()).toBe(true)
    })
  })

  describe('max-heap behavior', () => {
    test('custom comparator for max-heap (largest first)', () => {
      const pq = new PriorityQueue<number>({
        comparator: (a, b) => b - a
      })
      const items = [5, 3, 7, 1, 9, 2, 8]
      items.forEach((item) => pq.enqueue(item))
      const sorted = items.slice().sort((a, b) => b - a)
      for (const expected of sorted) {
        expect(pq.dequeue()).toBe(expected)
      }
    })

    test('max-heap peek returns largest', () => {
      const pq = new PriorityQueue<number>({
        comparator: (a, b) => b - a
      })
      pq.enqueue(5)
      pq.enqueue(3)
      pq.enqueue(7)
      pq.enqueue(9)
      expect(pq.peek()).toBe(9)
      pq.dequeue()
      expect(pq.peek()).toBe(7)
    })
  })

  describe('object comparator by property', () => {
    test('custom comparator for objects by priority property', () => {
      interface Task {
        id: string
        priority: number
      }
      const pq = new PriorityQueue<Task>({
        comparator: (a, b) => a.priority - b.priority
      })
      const tasks = [
        { id: 'a', priority: 5 },
        { id: 'b', priority: 3 },
        { id: 'c', priority: 7 },
        { id: 'd', priority: 1 }
      ]
      tasks.forEach((task) => pq.enqueue(task))
      const sorted = tasks.slice().sort((a, b) => a.priority - b.priority)
      for (const expected of sorted) {
        const result = pq.dequeue()
        expect(result?.id).toBe(expected.id)
        expect(result?.priority).toBe(expected.priority)
      }
    })

    test('object comparator handles equal priorities', () => {
      interface Item {
        name: string
        value: number
      }
      const pq = new PriorityQueue<Item>({
        comparator: (a, b) => a.value - b.value
      })
      pq.enqueue({ name: 'a', value: 5 })
      pq.enqueue({ name: 'b', value: 5 })
      pq.enqueue({ name: 'c', value: 5 })
      const results = [pq.dequeue(), pq.dequeue(), pq.dequeue()]
      expect(results).toHaveLength(3)
      expect(results.every((r) => r?.value === 5)).toBe(true)
    })

    test('object comparator with string property', () => {
      interface Person {
        name: string
      }
      const pq = new PriorityQueue<Person>({
        comparator: (a, b) => a.name.localeCompare(b.name)
      })
      pq.enqueue({ name: 'zebra' })
      pq.enqueue({ name: 'apple' })
      pq.enqueue({ name: 'banana' })
      expect(pq.dequeue()?.name).toBe('apple')
      expect(pq.dequeue()?.name).toBe('banana')
      expect(pq.dequeue()?.name).toBe('zebra')
    })
  })

  describe('duplicate values', () => {
    test('duplicate values handled correctly', () => {
      const pq = new PriorityQueue<number>()
      pq.enqueue(5)
      pq.enqueue(3)
      pq.enqueue(5)
      pq.enqueue(1)
      pq.enqueue(3)
      pq.enqueue(5)
      expect(pq.dequeue()).toBe(1)
      expect(pq.dequeue()).toBe(3)
      expect(pq.dequeue()).toBe(3)
      expect(pq.dequeue()).toBe(5)
      expect(pq.dequeue()).toBe(5)
      expect(pq.dequeue()).toBe(5)
      expect(pq.isEmpty()).toBe(true)
    })

    test('all identical values', () => {
      const pq = new PriorityQueue<number>()
      pq.enqueue(42)
      pq.enqueue(42)
      pq.enqueue(42)
      pq.enqueue(42)
      expect(pq.size).toBe(4)
      expect(pq.dequeue()).toBe(42)
      expect(pq.dequeue()).toBe(42)
      expect(pq.dequeue()).toBe(42)
      expect(pq.dequeue()).toBe(42)
    })
  })

  describe('edge cases', () => {
    test('handles enqueue and dequeue of same value repeatedly', () => {
      const pq = new PriorityQueue<number>()
      for (let i = 0; i < 10; i++) {
        pq.enqueue(42)
        expect(pq.dequeue()).toBe(42)
      }
      expect(pq.isEmpty()).toBe(true)
    })

    test('handles alternating enqueue and dequeue', () => {
      const pq = new PriorityQueue<number>()
      pq.enqueue(5)
      expect(pq.dequeue()).toBe(5)
      pq.enqueue(3)
      expect(pq.dequeue()).toBe(3)
      pq.enqueue(7)
      expect(pq.dequeue()).toBe(7)
      expect(pq.isEmpty()).toBe(true)
    })

    test('peek after all dequeues returns undefined', () => {
      const pq = new PriorityQueue<number>()
      pq.enqueue(5)
      pq.enqueue(3)
      pq.dequeue()
      pq.dequeue()
      expect(pq.peek()).toBeUndefined()
    })

    test('size returns 0 after all dequeues', () => {
      const pq = new PriorityQueue<number>()
      pq.enqueue(5)
      pq.enqueue(3)
      pq.dequeue()
      pq.dequeue()
      expect(pq.size).toBe(0)
    })

    test('isEmpty returns true after all dequeues', () => {
      const pq = new PriorityQueue<number>()
      pq.enqueue(5)
      pq.enqueue(3)
      pq.dequeue()
      pq.dequeue()
      expect(pq.isEmpty()).toBe(true)
    })
  })

  describe('comparator edge cases', () => {
    test('comparator returns 0 for equal values', () => {
      const pq = new PriorityQueue<number>({
        comparator: (a, b) => {
          if (a === b) return 0
          return a < b ? -1 : 1
        }
      })
      pq.enqueue(5)
      pq.enqueue(5)
      pq.enqueue(3)
      expect(pq.size).toBe(3)
      expect(pq.dequeue()).toBe(3)
      expect(pq.dequeue()).toBe(5)
      expect(pq.dequeue()).toBe(5)
    })

    test('comparator handles complex objects', () => {
      interface Complex {
        a: number
        b: number
      }
      const pq = new PriorityQueue<Complex>({
        comparator: (x, y) => x.a + x.b - (y.a + y.b)
      })
      pq.enqueue({ a: 1, b: 2 })
      pq.enqueue({ a: 3, b: 0 })
      pq.enqueue({ a: 0, b: 4 })
      expect(pq.dequeue()).toEqual({ a: 1, b: 2 })
      expect(pq.dequeue()).toEqual({ a: 3, b: 0 })
      expect(pq.dequeue()).toEqual({ a: 0, b: 4 })
    })
  })

  describe('type safety', () => {
    test('works with string values', () => {
      const pq = new PriorityQueue<string>({
        comparator: (a, b) => a.localeCompare(b)
      })
      pq.enqueue('zebra')
      pq.enqueue('apple')
      pq.enqueue('banana')
      expect(pq.dequeue()).toBe('apple')
      expect(pq.dequeue()).toBe('banana')
      expect(pq.dequeue()).toBe('zebra')
    })

    test('works with object values', () => {
      interface Item {
        value: number
      }
      const pq = new PriorityQueue<Item>({
        comparator: (a, b) => a.value - b.value
      })
      pq.enqueue({ value: 5 })
      pq.enqueue({ value: 3 })
      expect(pq.dequeue()?.value).toBe(3)
      expect(pq.dequeue()?.value).toBe(5)
    })

    test('multiple instances are independent', () => {
      const pq1 = new PriorityQueue<number>()
      const pq2 = new PriorityQueue<number>()
      pq1.enqueue(5)
      pq2.enqueue(3)
      expect(pq1.dequeue()).toBe(5)
      expect(pq2.dequeue()).toBe(3)
    })
  })

  describe('performance tests', () => {
    test('handles large number of items', () => {
      const pq = new PriorityQueue<number>()
      const count = 1000
      for (let i = 0; i < count; i++) {
        pq.enqueue(Math.floor(Math.random() * count))
      }
      expect(pq.size).toBe(count)
      let prev = -Infinity
      while (!pq.isEmpty()) {
        const curr = pq.dequeue()!
        expect(curr).toBeGreaterThanOrEqual(prev)
        prev = curr
      }
    })

    test('handles enqueue then dequeue pattern', () => {
      const pq = new PriorityQueue<number>()
      for (let i = 0; i < 100; i++) {
        pq.enqueue(i)
      }
      for (let i = 0; i < 100; i++) {
        expect(pq.dequeue()).toBe(i)
      }
      expect(pq.isEmpty()).toBe(true)
    })
  })
})