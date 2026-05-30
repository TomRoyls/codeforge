import { describe, expect, it } from 'vitest'
import { FibonacciHeap } from '../../../src/core/fibonacci-heap/fibonacci-heap.js'

describe('FibonacciHeap', () => {
  it('should create empty heap', () => {
    const heap = new FibonacciHeap()
    expect(heap.isEmpty()).toBe(true)
    expect(heap.size).toBe(0)
  })

  it('should insert single element', () => {
    const heap = new FibonacciHeap()
    heap.insert(5)
    expect(heap.isEmpty()).toBe(false)
    expect(heap.size).toBe(1)
    expect(heap.peek()).toBe(5)
  })

  it('should insert multiple elements', () => {
    const heap = new FibonacciHeap()
    heap.insert(3)
    heap.insert(1)
    heap.insert(4)
    heap.insert(2)
    expect(heap.size).toBe(4)
  })

  it('should peek minimum element', () => {
    const heap = new FibonacciHeap()
    heap.insert(5)
    heap.insert(2)
    heap.insert(8)
    heap.insert(1)
    expect(heap.peek()).toBe(1)
  })

  it('should return undefined for peek on empty heap', () => {
    const heap = new FibonacciHeap()
    expect(heap.peek()).toBe(undefined)
  })

  it('should extract minimum element', () => {
    const heap = new FibonacciHeap()
    heap.insert(5)
    heap.insert(2)
    heap.insert(8)
    heap.insert(1)
    const min = heap.extractMin()
    expect(min).toBe(1)
    expect(heap.size).toBe(3)
    expect(heap.peek()).toBe(2)
  })

  it('should return undefined for extractMin on empty heap', () => {
    const heap = new FibonacciHeap()
    expect(heap.extractMin()).toBe(undefined)
  })

  it('should extract elements in sorted order', () => {
    const heap = new FibonacciHeap()
    heap.insert(5)
    heap.insert(3)
    heap.insert(1)
    heap.insert(4)
    heap.insert(2)
    const result = []
    while (!heap.isEmpty()) {
      result.push(heap.extractMin())
    }
    expect(result).toEqual([1, 2, 3, 4, 5])
  })

  it('should handle duplicate values', () => {
    const heap = new FibonacciHeap()
    heap.insert(3)
    heap.insert(1)
    heap.insert(3)
    heap.insert(2)
    heap.insert(1)
    const result = []
    while (!heap.isEmpty()) {
      result.push(heap.extractMin())
    }
    expect(result).toEqual([1, 1, 2, 3, 3])
  })

  it('should decrease key of a node', () => {
    const heap = new FibonacciHeap()
    heap.insert(5)
    const node = heap.insert(10)
    heap.insert(15)
    heap.decreaseKey(node, 3)
    expect(heap.peek()).toBe(3)
  })

  it('should throw error when decreasing key to larger value', () => {
    const heap = new FibonacciHeap()
    const node = heap.insert(5)
    expect(() => heap.decreaseKey(node, 10)).toThrow('New value is greater than current value')
  })

  it('should delete a node', () => {
    const heap = new FibonacciHeap()
    const node1 = heap.insert(10)
    heap.insert(5)
    heap.insert(15)
    heap.delete(node1)
    expect(heap.size).toBe(2)
    expect(heap.peek()).toBe(5)
  })

  it('should merge two heaps', () => {
    const heap1 = new FibonacciHeap()
    heap1.insert(3)
    heap1.insert(1)
    const heap2 = new FibonacciHeap()
    heap2.insert(4)
    heap2.insert(2)
    heap1.merge(heap2)
    expect(heap1.size).toBe(4)
    expect(heap1.extractMin()).toBe(1)
  })

  it('should merge with empty heap', () => {
    const heap1 = new FibonacciHeap()
    heap1.insert(1)
    heap1.insert(2)
    const heap2 = new FibonacciHeap()
    heap1.merge(heap2)
    expect(heap1.size).toBe(2)
    expect(heap1.peek()).toBe(1)
  })

  it('should clear heap', () => {
    const heap = new FibonacciHeap()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    heap.clear()
    expect(heap.isEmpty()).toBe(true)
    expect(heap.size).toBe(0)
  })

  it('should convert to array in sorted order', () => {
    const heap = new FibonacciHeap()
    heap.insert(5)
    heap.insert(3)
    heap.insert(1)
    heap.insert(4)
    heap.insert(2)
    const arr = heap.toArray()
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('should clone heap', () => {
    const heap = new FibonacciHeap()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    const cloned = heap.clone()
    expect(cloned.size).toBe(3)
    expect(cloned.extractMin()).toBe(1)
    expect(cloned.extractMin()).toBe(2)
    expect(cloned.extractMin()).toBe(3)
  })

  it('should iterate over elements', () => {
    const heap = new FibonacciHeap()
    heap.insert(3)
    heap.insert(1)
    heap.insert(2)
    const result = []
    for (const val of heap) {
      result.push(val)
    }
    expect(result).toEqual([1, 2, 3])
  })

  it('should create heap from array', () => {
    const heap = FibonacciHeap.fromArray([3, 1, 4, 2, 5])
    expect(heap.size).toBe(5)
    expect(heap.extractMin()).toBe(1)
  })

  it('should handle single element extraction', () => {
    const heap = new FibonacciHeap()
    heap.insert(42)
    const extracted = heap.extractMin()
    expect(extracted).toBe(42)
    expect(heap.isEmpty()).toBe(true)
  })

  it('should maintain min after insertions', () => {
    const heap = new FibonacciHeap()
    heap.insert(10)
    expect(heap.peek()).toBe(10)
    heap.insert(5)
    expect(heap.peek()).toBe(5)
    heap.insert(7)
    expect(heap.peek()).toBe(5)
    heap.insert(3)
    expect(heap.peek()).toBe(3)
  })

  it('should work with custom comparator', () => {
    const heap = new FibonacciHeap<{ value: number }>((a, b) => a.value - b.value)
    heap.insert({ value: 3 })
    heap.insert({ value: 1 })
    heap.insert({ value: 2 })
    expect(heap.peek()).toEqual({ value: 1 })
  })

  it('should handle large dataset', () => {
    const heap = new FibonacciHeap()
    const values = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 1000))
    values.forEach(v => heap.insert(v))
    const sorted = [...values].sort((a, b) => a - b)
    const extracted = []
    while (!heap.isEmpty()) {
      extracted.push(heap.extractMin())
    }
    expect(extracted).toEqual(sorted)
  })

  it('should handle reverse order insertion', () => {
    const heap = new FibonacciHeap()
    for (let i = 100; i >= 1; i--) {
      heap.insert(i)
    }
    const result = []
    while (!heap.isEmpty()) {
      result.push(heap.extractMin())
    }
    expect(result).toEqual(Array.from({ length: 100 }, (_, i) => i + 1))
  })

  it('should decrease key to same value', () => {
    const heap = new FibonacciHeap()
    const node = heap.insert(5)
    heap.decreaseKey(node, 5)
    expect(heap.peek()).toBe(5)
  })
})