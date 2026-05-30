import { describe, expect, it } from 'vitest'
import { SkewHeap } from '../../../src/core/skew-heap/skew-heap.js'

describe('SkewHeap', () => {
  it('should create empty heap', () => {
    const heap = new SkewHeap<number>()
    expect(heap.isEmpty()).toBe(true)
    expect(heap.size()).toBe(0)
  })

  it('should insert single element', () => {
    const heap = new SkewHeap<number>()
    heap.insert(5)
    expect(heap.isEmpty()).toBe(false)
    expect(heap.size()).toBe(1)
  })

  it('should insert multiple elements', () => {
    const heap = new SkewHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.insert(1)
    expect(heap.size()).toBe(4)
  })

  it('should extractMin from empty heap', () => {
    const heap = new SkewHeap<number>()
    expect(heap.extractMin()).toBe(undefined)
  })

  it('should extractMin from single element', () => {
    const heap = new SkewHeap<number>()
    heap.insert(5)
    expect(heap.extractMin()).toBe(5)
    expect(heap.isEmpty()).toBe(true)
  })

  it('should extractMin in ascending order', () => {
    const heap = new SkewHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.insert(1)
    heap.insert(9)
    expect(heap.extractMin()).toBe(1)
    expect(heap.extractMin()).toBe(3)
    expect(heap.extractMin()).toBe(5)
    expect(heap.extractMin()).toBe(7)
    expect(heap.extractMin()).toBe(9)
    expect(heap.isEmpty()).toBe(true)
  })

  it('should peek at minimum without removing', () => {
    const heap = new SkewHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    expect(heap.peek()).toBe(3)
    expect(heap.size()).toBe(3)
    expect(heap.peek()).toBe(3)
  })

  it('should peek from empty heap', () => {
    const heap = new SkewHeap<number>()
    expect(heap.peek()).toBe(undefined)
  })

  it('should merge two empty heaps', () => {
    const heap1 = new SkewHeap<number>()
    const heap2 = new SkewHeap<number>()
    const merged = heap1.merge(heap2)
    expect(merged.isEmpty()).toBe(true)
  })

  it('should merge empty heap with non-empty heap', () => {
    const heap1 = new SkewHeap<number>()
    const heap2 = new SkewHeap<number>()
    heap2.insert(5)
    const merged = heap1.merge(heap2)
    expect(merged.size()).toBe(1)
    expect(merged.peek()).toBe(5)
  })

  it('should merge two non-empty heaps', () => {
    const heap1 = new SkewHeap<number>()
    heap1.insert(5)
    heap1.insert(3)
    const heap2 = new SkewHeap<number>()
    heap2.insert(7)
    heap2.insert(1)
    const merged = heap1.merge(heap2)
    expect(merged.size()).toBe(4)
    expect(merged.extractMin()).toBe(1)
    expect(merged.extractMin()).toBe(3)
    expect(merged.extractMin()).toBe(5)
    expect(merged.extractMin()).toBe(7)
  })

  it('should handle duplicate values', () => {
    const heap = new SkewHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(5)
    heap.insert(3)
    expect(heap.size()).toBe(4)
    expect(heap.extractMin()).toBe(3)
    expect(heap.extractMin()).toBe(3)
    expect(heap.extractMin()).toBe(5)
    expect(heap.extractMin()).toBe(5)
  })

  it('should handle large dataset', () => {
    const heap = new SkewHeap<number>()
    const values = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 10000))
    values.forEach(v => heap.insert(v))
    expect(heap.size()).toBe(1000)
    let last = -Infinity
    while (!heap.isEmpty()) {
      const current = heap.extractMin()
      expect(current).toBeGreaterThanOrEqual(last)
      if (current !== undefined) {
        last = current
      }
    }
  })

  it('should clear heap', () => {
    const heap = new SkewHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.clear()
    expect(heap.isEmpty()).toBe(true)
    expect(heap.size()).toBe(0)
  })

  it('should convert to array in sorted order', () => {
    const heap = new SkewHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.insert(1)
    heap.insert(9)
    const arr = heap.toArray()
    expect(arr).toEqual([1, 3, 5, 7, 9])
    expect(heap.size()).toBe(5)
  })

  it('should check contains for existing value', () => {
    const heap = new SkewHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    expect(heap.contains(5)).toBe(true)
  })

  it('should check contains for non-existing value', () => {
    const heap = new SkewHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    expect(heap.contains(10)).toBe(false)
  })

  it('should clone heap', () => {
    const heap = new SkewHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    const cloned = heap.clone()
    expect(cloned.size()).toBe(3)
    expect(cloned.peek()).toBe(3)
    cloned.insert(1)
    expect(cloned.size()).toBe(4)
    expect(heap.size()).toBe(3)
  })

  it('should check if heap is valid', () => {
    const heap = new SkewHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.insert(1)
    expect(heap.isValid()).toBe(true)
  })

  it('should be valid after insert and extract', () => {
    const heap = new SkewHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.extractMin()
    expect(heap.isValid()).toBe(true)
  })

  it('should work with strings', () => {
    const heap = new SkewHeap<string>()
    heap.insert('zebra')
    heap.insert('apple')
    heap.insert('mango')
    expect(heap.extractMin()).toBe('apple')
    expect(heap.extractMin()).toBe('mango')
    expect(heap.extractMin()).toBe('zebra')
  })

  it('should work with custom comparator', () => {
    const heap = new SkewHeap<{ value: number }>({
      comparator: (a, b) => a.value - b.value
    })
    heap.insert({ value: 5 })
    heap.insert({ value: 3 })
    heap.insert({ value: 7 })
    expect(heap.extractMin()?.value).toBe(3)
    expect(heap.extractMin()?.value).toBe(5)
    expect(heap.extractMin()?.value).toBe(7)
  })

  it('should handle reverse comparator', () => {
    const heap = new SkewHeap<number>({
      comparator: (a, b) => b - a
    })
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    expect(heap.extractMin()).toBe(7)
    expect(heap.extractMin()).toBe(5)
    expect(heap.extractMin()).toBe(3)
  })

  it('should not modify original heaps after merge', () => {
    const heap1 = new SkewHeap<number>()
    heap1.insert(5)
    heap1.insert(3)
    const heap2 = new SkewHeap<number>()
    heap2.insert(7)
    heap2.insert(1)
    const merged = heap1.merge(heap2)
    merged.extractMin()
    expect(heap1.size()).toBe(2)
    expect(heap2.size()).toBe(2)
    expect(heap1.peek()).toBe(3)
    expect(heap2.peek()).toBe(1)
  })

  it('should handle zero values', () => {
    const heap = new SkewHeap<number>()
    heap.insert(0)
    heap.insert(5)
    heap.insert(-3)
    heap.insert(0)
    expect(heap.size()).toBe(4)
    expect(heap.extractMin()).toBe(-3)
    expect(heap.extractMin()).toBe(0)
    expect(heap.extractMin()).toBe(0)
    expect(heap.extractMin()).toBe(5)
  })

  it('should handle negative values', () => {
    const heap = new SkewHeap<number>()
    heap.insert(-5)
    heap.insert(-3)
    heap.insert(-7)
    heap.insert(-1)
    expect(heap.extractMin()).toBe(-7)
    expect(heap.extractMin()).toBe(-5)
    expect(heap.extractMin()).toBe(-3)
    expect(heap.extractMin()).toBe(-1)
  })

  it('should maintain heap property after multiple operations', () => {
    const heap = new SkewHeap<number>()
    heap.insert(10)
    heap.insert(5)
    heap.insert(15)
    heap.insert(3)
    heap.insert(7)
    heap.extractMin()
    heap.insert(2)
    heap.insert(12)
    expect(heap.isValid()).toBe(true)
    const arr = heap.toArray()
    expect(arr).toEqual([2, 5, 7, 10, 12, 15])
  })

  it('should handle alternating insert and extract', () => {
    const heap = new SkewHeap<number>()
    heap.insert(5)
    expect(heap.extractMin()).toBe(5)
    heap.insert(3)
    heap.insert(7)
    expect(heap.extractMin()).toBe(3)
    heap.insert(1)
    expect(heap.extractMin()).toBe(1)
    expect(heap.extractMin()).toBe(7)
    expect(heap.isEmpty()).toBe(true)
  })
})