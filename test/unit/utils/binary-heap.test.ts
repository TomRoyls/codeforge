import { describe, expect, it } from 'vitest'
import { BinaryHeap } from '../../../src/utils/binary-heap.js'

describe('BinaryHeap', () => {
  it('should create empty min-heap by default', () => {
    const heap = new BinaryHeap<number>()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
  })

  it('should peek at smallest element in min-heap', () => {
    const heap = new BinaryHeap<number>()
    heap.push(5)
    heap.push(3)
    heap.push(7)
    expect(heap.peek()).toBe(3)
  })

  it('should peek at largest element in max-heap', () => {
    const heap = new BinaryHeap<number>({ type: 'max' })
    heap.push(5)
    heap.push(3)
    heap.push(7)
    expect(heap.peek()).toBe(7)
  })

  it('should return undefined when peeking empty heap', () => {
    const heap = new BinaryHeap<number>()
    expect(heap.peek()).toBe(undefined)
  })

  it('should push and pop elements in min-heap order', () => {
    const heap = new BinaryHeap<number>()
    heap.push(5)
    heap.push(3)
    heap.push(7)
    heap.push(1)
    heap.push(9)
    expect(heap.pop()).toBe(1)
    expect(heap.pop()).toBe(3)
    expect(heap.pop()).toBe(5)
    expect(heap.pop()).toBe(7)
    expect(heap.pop()).toBe(9)
  })

  it('should push and pop elements in max-heap order', () => {
    const heap = new BinaryHeap<number>({ type: 'max' })
    heap.push(5)
    heap.push(3)
    heap.push(7)
    heap.push(1)
    heap.push(9)
    expect(heap.pop()).toBe(9)
    expect(heap.pop()).toBe(7)
    expect(heap.pop()).toBe(5)
    expect(heap.pop()).toBe(3)
    expect(heap.pop()).toBe(1)
  })

  it('should return undefined when popping empty heap', () => {
    const heap = new BinaryHeap<number>()
    expect(heap.pop()).toBe(undefined)
  })

  it('should track size correctly', () => {
    const heap = new BinaryHeap<number>()
    expect(heap.size).toBe(0)
    heap.push(1)
    expect(heap.size).toBe(1)
    heap.push(2)
    expect(heap.size).toBe(2)
    heap.push(3)
    expect(heap.size).toBe(3)
  })

  it('should report isEmpty correctly', () => {
    const heap = new BinaryHeap<number>()
    expect(heap.isEmpty()).toBe(true)
    heap.push(1)
    expect(heap.isEmpty()).toBe(false)
    heap.pop()
    expect(heap.isEmpty()).toBe(true)
  })

  it('should clear all elements', () => {
    const heap = new BinaryHeap<number>()
    heap.push(1)
    heap.push(2)
    heap.push(3)
    heap.clear()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
  })

  it('should convert to array', () => {
    const heap = new BinaryHeap<number>()
    heap.push(3)
    heap.push(1)
    heap.push(2)
    const arr = heap.toArray()
    expect(arr.length).toBe(3)
    expect(arr).toContain(1)
    expect(arr).toContain(2)
    expect(arr).toContain(3)
  })

  it('should create from array with min-heap', () => {
    const heap = BinaryHeap.fromArray([5, 3, 7, 1, 9])
    expect(heap.pop()).toBe(1)
    expect(heap.pop()).toBe(3)
    expect(heap.pop()).toBe(5)
    expect(heap.pop()).toBe(7)
    expect(heap.pop()).toBe(9)
  })

  it('should create from array with max-heap', () => {
    const heap = BinaryHeap.fromArray([5, 3, 7, 1, 9], { type: 'max' })
    expect(heap.pop()).toBe(9)
    expect(heap.pop()).toBe(7)
    expect(heap.pop()).toBe(5)
    expect(heap.pop()).toBe(3)
    expect(heap.pop()).toBe(1)
  })

  it('should handle duplicate values in min-heap', () => {
    const heap = new BinaryHeap<number>()
    heap.push(3)
    heap.push(3)
    heap.push(1)
    heap.push(1)
    heap.push(5)
    const result = []
    while (!heap.isEmpty()) {
      result.push(heap.pop()!)
    }
    expect(result).toEqual([1, 1, 3, 3, 5])
  })

  it('should handle duplicate values in max-heap', () => {
    const heap = new BinaryHeap<number>({ type: 'max' })
    heap.push(3)
    heap.push(3)
    heap.push(5)
    heap.push(5)
    heap.push(1)
    const result = []
    while (!heap.isEmpty()) {
      result.push(heap.pop()!)
    }
    expect(result).toEqual([5, 5, 3, 3, 1])
  })

  it('should handle single element', () => {
    const heap = new BinaryHeap<number>()
    heap.push(42)
    expect(heap.size).toBe(1)
    expect(heap.peek()).toBe(42)
    expect(heap.isEmpty()).toBe(false)
    expect(heap.pop()).toBe(42)
    expect(heap.isEmpty()).toBe(true)
  })

  it('should use custom comparator', () => {
    const heap = new BinaryHeap<{ value: number }>({
      comparator: (a, b) => a.value - b.value
    })
    heap.push({ value: 5 })
    heap.push({ value: 3 })
    heap.push({ value: 7 })
    expect(heap.pop()?.value).toBe(3)
    expect(heap.pop()?.value).toBe(5)
    expect(heap.pop()?.value).toBe(7)
  })

  it('should maintain heap property with multiple pushes', () => {
    const heap = new BinaryHeap<number>()
    for (let i = 100; i >= 1; i--) {
      heap.push(i)
    }
    expect(heap.peek()).toBe(1)
  })

  it('should maintain heap property with multiple pops', () => {
    const heap = new BinaryHeap<number>()
    for (let i = 1; i <= 100; i++) {
      heap.push(i)
    }
    let prev = 0
    while (!heap.isEmpty()) {
      const current = heap.pop()!
      expect(current).toBeGreaterThanOrEqual(prev)
      prev = current
    }
  })

  it('should stress test with large number of elements', () => {
    const heap = new BinaryHeap<number>()
    const elements = 10000
    for (let i = 0; i < elements; i++) {
      heap.push(Math.floor(Math.random() * elements))
    }
    let prev = -Infinity
    while (!heap.isEmpty()) {
      const current = heap.pop()!
      expect(current).toBeGreaterThanOrEqual(prev)
      prev = current
    }
    expect(heap.isEmpty()).toBe(true)
  })

  it('should handle negative numbers in min-heap', () => {
    const heap = new BinaryHeap<number>()
    heap.push(-5)
    heap.push(3)
    heap.push(-1)
    heap.push(7)
    heap.push(-3)
    expect(heap.pop()).toBe(-5)
    expect(heap.pop()).toBe(-3)
    expect(heap.pop()).toBe(-1)
    expect(heap.pop()).toBe(3)
    expect(heap.pop()).toBe(7)
  })

  it('should handle negative numbers in max-heap', () => {
    const heap = new BinaryHeap<number>({ type: 'max' })
    heap.push(-5)
    heap.push(3)
    heap.push(-1)
    heap.push(7)
    heap.push(-3)
    expect(heap.pop()).toBe(7)
    expect(heap.pop()).toBe(3)
    expect(heap.pop()).toBe(-1)
    expect(heap.pop()).toBe(-3)
    expect(heap.pop()).toBe(-5)
  })

  it('should handle floating point numbers', () => {
    const heap = new BinaryHeap<number>()
    heap.push(3.14)
    heap.push(1.41)
    heap.push(2.71)
    heap.push(0.5)
    expect(heap.pop()).toBe(0.5)
    expect(heap.pop()).toBe(1.41)
    expect(heap.pop()).toBe(2.71)
    expect(heap.pop()).toBe(3.14)
  })

  it('should work with strings using custom comparator', () => {
    const heap = new BinaryHeap<string>({
      comparator: (a, b) => a.localeCompare(b)
    })
    heap.push('banana')
    heap.push('apple')
    heap.push('cherry')
    expect(heap.pop()).toBe('apple')
    expect(heap.pop()).toBe('banana')
    expect(heap.pop()).toBe('cherry')
  })

  it('should work with reverse comparator', () => {
    const heap = new BinaryHeap<number>({
      comparator: (a, b) => b - a
    })
    heap.push(3)
    heap.push(1)
    heap.push(2)
    expect(heap.pop()).toBe(3)
    expect(heap.pop()).toBe(2)
    expect(heap.pop()).toBe(1)
  })

  it('should create from empty array', () => {
    const heap = BinaryHeap.fromArray<number>([])
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
  })

  it('should handle mixed operations', () => {
    const heap = new BinaryHeap<number>()
    heap.push(5)
    heap.push(3)
    expect(heap.pop()).toBe(3)
    heap.push(1)
    expect(heap.pop()).toBe(1)
    heap.push(7)
    expect(heap.pop()).toBe(5)
    expect(heap.pop()).toBe(7)
  })

  it('should handle extreme values', () => {
    const heap = new BinaryHeap<number>()
    heap.push(Number.MAX_SAFE_INTEGER)
    heap.push(Number.MIN_SAFE_INTEGER)
    heap.push(0)
    expect(heap.pop()).toBe(Number.MIN_SAFE_INTEGER)
    expect(heap.pop()).toBe(0)
    expect(heap.pop()).toBe(Number.MAX_SAFE_INTEGER)
  })
})