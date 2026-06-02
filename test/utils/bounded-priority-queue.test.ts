import { describe, it, expect } from 'vitest'
import { BoundedPriorityQueue } from '../../src/utils/bounded-priority-queue.js'

const minCmp = (a: number, b: number) => a - b
const maxCmp = (a: number, b: number) => b - a

describe('BoundedPriorityQueue', () => {
  it('throws on maxSize < 1', () => {
    expect(() => new BoundedPriorityQueue(0, minCmp)).toThrow(RangeError)
    expect(() => new BoundedPriorityQueue(-1, minCmp)).toThrow(RangeError)
  })

  it('starts empty', () => {
    const q = new BoundedPriorityQueue(5, minCmp)
    expect(q.isEmpty).toBe(true)
    expect(q.size).toBe(0)
    expect(q.isFull).toBe(false)
    expect(q.peek()).toBeUndefined()
    expect(q.pop()).toBeUndefined()
  })

  it('accepts items up to maxSize', () => {
    const q = new BoundedPriorityQueue(3, minCmp)
    q.push(10)
    q.push(20)
    q.push(30)
    expect(q.size).toBe(3)
    expect(q.isFull).toBe(true)
  })

  it('keeps top-K smallest items (min-heap)', () => {
    const q = new BoundedPriorityQueue<number>(3, minCmp)
    for (const v of [50, 30, 70, 10, 90, 20, 80]) {
      q.push(v)
    }
    const result = q.toArray()
    expect(result).toEqual([10, 20, 30])
  })

  it('keeps top-K largest items (max-heap)', () => {
    const q = new BoundedPriorityQueue<number>(3, maxCmp)
    for (const v of [50, 30, 70, 10, 90, 20, 80]) {
      q.push(v)
    }
    const result = q.toArray()
    expect(result).toEqual([90, 80, 70])
  })

  it('works with objects via comparator', () => {
    const q = new BoundedPriorityQueue<{ priority: number; name: string }>(
      2,
      (a, b) => a.priority - b.priority,
    )
    q.push({ priority: 5, name: 'low' })
    q.push({ priority: 1, name: 'high' })
    q.push({ priority: 10, name: 'lowest' })
    q.push({ priority: 3, name: 'mid' })
    const result = q.toArray()
    expect(result.map((r) => r.name)).toEqual(['high', 'mid'])
  })

  it('pop returns items in order', () => {
    const q = new BoundedPriorityQueue<number>(4, minCmp)
    q.push(40)
    q.push(10)
    q.push(30)
    q.push(20)
    expect(q.pop()).toBe(40)
    expect(q.pop()).toBe(30)
    expect(q.pop()).toBe(20)
    expect(q.pop()).toBe(10)
    expect(q.pop()).toBeUndefined()
  })

  it('drain returns sorted array and empties queue', () => {
    const q = new BoundedPriorityQueue<number>(3, minCmp)
    q.push(30)
    q.push(10)
    q.push(20)
    const drained = q.drain()
    expect(drained).toEqual([30, 20, 10])
    expect(q.isEmpty).toBe(true)
  })

  it('clear empties the queue', () => {
    const q = new BoundedPriorityQueue(5, minCmp)
    q.push(1)
    q.push(2)
    q.push(3)
    q.clear()
    expect(q.isEmpty).toBe(true)
    expect(q.size).toBe(0)
  })

  it('maxSize getter returns constructor value', () => {
    const q = new BoundedPriorityQueue(7, minCmp)
    expect(q.maxSize).toBe(7)
  })

  it('handles duplicate values', () => {
    const q = new BoundedPriorityQueue<number>(3, minCmp)
    q.push(5)
    q.push(5)
    q.push(5)
    q.push(1)
    q.push(1)
    expect(q.toArray()).toEqual([1, 1, 5])
  })

  it('handles single-element queue', () => {
    const q = new BoundedPriorityQueue<number>(1, minCmp)
    q.push(100)
    expect(q.peek()).toBe(100)
    q.push(50)
    expect(q.peek()).toBe(50)
    q.push(200)
    expect(q.peek()).toBe(50)
    expect(q.toArray()).toEqual([50])
  })

  it('does not replace when new item is not better', () => {
    const q = new BoundedPriorityQueue<number>(3, minCmp)
    q.push(1)
    q.push(2)
    q.push(3)
    q.push(99)
    expect(q.toArray()).toEqual([1, 2, 3])
  })

  it('toArray does not mutate internal state', () => {
    const q = new BoundedPriorityQueue<number>(3, minCmp)
    q.push(3)
    q.push(1)
    q.push(2)
    const arr1 = q.toArray()
    const arr2 = q.toArray()
    expect(arr1).toEqual(arr2)
    expect(q.size).toBe(3)
  })

  it('handles large stream efficiently', () => {
    const q = new BoundedPriorityQueue<number>(10, minCmp)
    for (let i = 10000; i >= 0; i--) {
      q.push(i)
    }
    const result = q.toArray()
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('works with negative numbers', () => {
    const q = new BoundedPriorityQueue<number>(3, minCmp)
    q.push(-5)
    q.push(-10)
    q.push(0)
    q.push(3)
    q.push(-1)
    expect(q.toArray()).toEqual([-10, -5, -1])
  })

  it('handles strings via comparator', () => {
    const q = new BoundedPriorityQueue<string>(3, (a, b) => a.localeCompare(b))
    for (const w of ['zebra', 'apple', 'mango', 'banana', 'cherry']) {
      q.push(w)
    }
    expect(q.toArray()).toEqual(['apple', 'banana', 'cherry'])
  })

  it('peek returns front without removing', () => {
    const q = new BoundedPriorityQueue<string>(3, (a, b) => a.localeCompare(b))
    q.push('cherry')
    q.push('apple')
    expect(q.peek()).toBe('cherry')
    expect(q.size).toBe(2)
  })

  it('maxSize returns capacity', () => {
    const q = new BoundedPriorityQueue<string>(10)
    expect(q.maxSize).toBe(10)
  })
})
