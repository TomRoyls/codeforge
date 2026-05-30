import { describe, expect, it } from 'vitest'
import { BinomialHeap } from '../../../src/core/binomial-heap/binomial-heap.js'

describe('BinomialHeap', () => {
  it('should create empty heap', () => {
    const heap = new BinomialHeap()
    expect(heap.isEmpty()).toBe(true)
    expect(heap.size()).toBe(0)
  })

  it('should insert single element', () => {
    const heap = new BinomialHeap()
    heap.insert(5)
    expect(heap.isEmpty()).toBe(false)
    expect(heap.size()).toBe(1)
    expect(heap.peek()).toBe(5)
  })

  it('should insert multiple elements', () => {
    const heap = new BinomialHeap()
    heap.insert(3)
    heap.insert(1)
    heap.insert(4)
    heap.insert(2)
    expect(heap.size()).toBe(4)
  })

  it('should peek minimum element', () => {
    const heap = new BinomialHeap()
    heap.insert(5)
    heap.insert(2)
    heap.insert(8)
    heap.insert(1)
    expect(heap.peek()).toBe(1)
  })

  it('should return undefined for peek on empty heap', () => {
    const heap = new BinomialHeap()
    expect(heap.peek()).toBe(undefined)
  })

  it('should extract minimum element', () => {
    const heap = new BinomialHeap()
    heap.insert(5)
    heap.insert(2)
    heap.insert(8)
    heap.insert(1)
    const min = heap.extractMin()
    expect(min).toBe(1)
    expect(heap.size()).toBe(3)
    expect(heap.peek()).toBe(2)
  })

  it('should return undefined for extractMin on empty heap', () => {
    const heap = new BinomialHeap()
    expect(heap.extractMin()).toBe(undefined)
  })

  it('should extract elements in sorted order', () => {
    const heap = new BinomialHeap()
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
    const heap = new BinomialHeap()
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

  it('should decrease key of a value', () => {
    const heap = new BinomialHeap()
    heap.insert(5)
    heap.insert(10)
    heap.insert(15)
    const decreased = heap.decreaseKey(10, 3)
    expect(decreased).toBe(true)
    expect(heap.peek()).toBe(3)
  })

  it('should return false when decreasing non-existent value', () => {
    const heap = new BinomialHeap()
    heap.insert(5)
    const decreased = heap.decreaseKey(10, 3)
    expect(decreased).toBe(false)
  })

  it('should return false when decreasing to larger value', () => {
    const heap = new BinomialHeap()
    heap.insert(5)
    const decreased = heap.decreaseKey(5, 10)
    expect(decreased).toBe(false)
  })

  it('should merge two heaps', () => {
    const heap1 = new BinomialHeap()
    heap1.insert(3)
    heap1.insert(1)
    const heap2 = new BinomialHeap()
    heap2.insert(4)
    heap2.insert(2)
    heap1.merge(heap2)
    expect(heap1.size()).toBe(4)
    expect(heap1.extractMin()).toBe(1)
  })

  it('should merge with empty heap', () => {
    const heap1 = new BinomialHeap()
    heap1.insert(1)
    heap1.insert(2)
    const heap2 = new BinomialHeap()
    heap1.merge(heap2)
    expect(heap1.size()).toBe(2)
    expect(heap1.peek()).toBe(1)
  })

  it('should clear heap', () => {
    const heap = new BinomialHeap()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    heap.clear()
    expect(heap.isEmpty()).toBe(true)
    expect(heap.size()).toBe(0)
  })

  it('should check if contains value', () => {
    const heap = new BinomialHeap()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    expect(heap.contains(2)).toBe(true)
    expect(heap.contains(5)).toBe(false)
  })

  it('should clone heap', () => {
    const heap = new BinomialHeap()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    const cloned = heap.clone()
    expect(cloned.size()).toBe(3)
    expect(cloned.extractMin()).toBe(1)
    expect(cloned.extractMin()).toBe(2)
    expect(cloned.extractMin()).toBe(3)
  })

  it('should validate heap structure', () => {
    const heap = new BinomialHeap()
    heap.insert(3)
    heap.insert(1)
    heap.insert(4)
    heap.insert(2)
    expect(heap.isValid()).toBe(true)
  })

  it('should validate empty heap', () => {
    const heap = new BinomialHeap()
    expect(heap.isValid()).toBe(true)
  })

  it('should handle single element extraction', () => {
    const heap = new BinomialHeap()
    heap.insert(42)
    const extracted = heap.extractMin()
    expect(extracted).toBe(42)
    expect(heap.isEmpty()).toBe(true)
  })

  it('should maintain min after insertions', () => {
    const heap = new BinomialHeap()
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
    const heap = new BinomialHeap({
      comparator: (a: { value: number }, b: { value: number }) => {
        if (a.value < b.value) return -1
        if (a.value > b.value) return 1
        return 0
      }
    })
    heap.insert({ value: 3 })
    heap.insert({ value: 1 })
    heap.insert({ value: 2 })
    expect(heap.peek()).toEqual({ value: 1 })
  })

  it('should handle large dataset', () => {
    const heap = new BinomialHeap()
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
    const heap = new BinomialHeap()
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
    const heap = new BinomialHeap()
    heap.insert(5)
    heap.insert(10)
    const decreased = heap.decreaseKey(10, 10)
    expect(decreased).toBe(true)
    expect(heap.peek()).toBe(5)
  })

  it('should convert to array', () => {
    const heap = new BinomialHeap()
    heap.insert(3)
    heap.insert(1)
    heap.insert(4)
    heap.insert(2)
    const arr = heap.toArray()
    expect(arr).toHaveLength(4)
    expect(arr).toContain(1)
    expect(arr).toContain(2)
    expect(arr).toContain(3)
    expect(arr).toContain(4)
  })
})