import { describe, expect, it } from 'vitest'
import { PairingHeap } from '../../../src/core/pairing-heap/pairing-heap.js'

describe('PairingHeap', () => {
  it('should create empty heap', () => {
    const heap = new PairingHeap()
    expect(heap.isEmpty()).toBe(true)
    expect(heap.size()).toBe(0)
  })

  it('should insert single element', () => {
    const heap = new PairingHeap()
    heap.insert(5)
    expect(heap.isEmpty()).toBe(false)
    expect(heap.size()).toBe(1)
    expect(heap.peek()).toBe(5)
  })

  it('should insert multiple elements', () => {
    const heap = new PairingHeap()
    heap.insert(3)
    heap.insert(1)
    heap.insert(4)
    heap.insert(2)
    expect(heap.size()).toBe(4)
  })

  it('should peek minimum element', () => {
    const heap = new PairingHeap()
    heap.insert(5)
    heap.insert(2)
    heap.insert(8)
    heap.insert(1)
    expect(heap.peek()).toBe(1)
  })

  it('should return undefined for peek on empty heap', () => {
    const heap = new PairingHeap()
    expect(heap.peek()).toBe(undefined)
  })

  it('should extract minimum element', () => {
    const heap = new PairingHeap()
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
    const heap = new PairingHeap()
    expect(heap.extractMin()).toBe(undefined)
  })

  it('should extract elements in sorted order', () => {
    const heap = new PairingHeap()
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
    const heap = new PairingHeap()
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
    const heap = new PairingHeap()
    heap.insert(5)
    const node = heap.insert(10)
    heap.insert(15)
    heap.decreaseKey(node, 3)
    expect(heap.peek()).toBe(3)
  })

  it('should merge two heaps', () => {
    const heap1 = new PairingHeap()
    heap1.insert(3)
    heap1.insert(1)
    const heap2 = new PairingHeap()
    heap2.insert(4)
    heap2.insert(2)
    heap1.merge(heap2)
    expect(heap1.size()).toBe(4)
    expect(heap1.extractMin()).toBe(1)
  })

  it('should merge with empty heap', () => {
    const heap1 = new PairingHeap()
    heap1.insert(1)
    heap1.insert(2)
    const heap2 = new PairingHeap()
    heap1.merge(heap2)
    expect(heap1.size()).toBe(2)
    expect(heap1.peek()).toBe(1)
  })

  it('should clear heap', () => {
    const heap = new PairingHeap()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    heap.clear()
    expect(heap.isEmpty()).toBe(true)
    expect(heap.size()).toBe(0)
  })

  it('should check if contains value', () => {
    const heap = new PairingHeap()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    expect(heap.contains(2)).toBe(true)
    expect(heap.contains(5)).toBe(false)
  })

  it('should clone heap', () => {
    const heap = new PairingHeap()
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
    const heap = new PairingHeap()
    heap.insert(3)
    heap.insert(1)
    heap.insert(4)
    heap.insert(2)
    expect(heap.isValid()).toBe(true)
  })

  it('should validate empty heap', () => {
    const heap = new PairingHeap()
    expect(heap.isValid()).toBe(true)
  })

  it('should find minimum element', () => {
    const heap = new PairingHeap()
    heap.insert(5)
    heap.insert(2)
    heap.insert(8)
    heap.insert(1)
    expect(heap.findMin()).toBe(1)
  })

  it('should return undefined for findMin on empty heap', () => {
    const heap = new PairingHeap()
    expect(heap.findMin()).toBe(undefined)
  })

  it('should convert to sorted array', () => {
    const heap = new PairingHeap()
    heap.insert(5)
    heap.insert(3)
    heap.insert(1)
    heap.insert(4)
    heap.insert(2)
    const arr = heap.toSortedArray()
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('should handle single element extraction', () => {
    const heap = new PairingHeap()
    heap.insert(42)
    const extracted = heap.extractMin()
    expect(extracted).toBe(42)
    expect(heap.isEmpty()).toBe(true)
  })

  it('should maintain min after insertions', () => {
    const heap = new PairingHeap()
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
    const heap = new PairingHeap<{ value: number }>({
      comparator: (a, b) => a.value - b.value
    })
    heap.insert({ value: 3 })
    heap.insert({ value: 1 })
    heap.insert({ value: 2 })
    expect(heap.peek()).toEqual({ value: 1 })
  })

  it('should handle large dataset', () => {
    const heap = new PairingHeap()
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
    const heap = new PairingHeap()
    for (let i = 100; i >= 1; i--) {
      heap.insert(i)
    }
    const result = []
    while (!heap.isEmpty()) {
      result.push(heap.extractMin())
    }
    expect(result).toEqual(Array.from({ length: 100 }, (_, i) => i + 1))
  })

  it('should create heap from iterable', () => {
    const heap = PairingHeap.from([3, 1, 4, 2, 5])
    expect(heap.size()).toBe(5)
    expect(heap.extractMin()).toBe(1)
  })

  it('should compute stats', () => {
    const heap = new PairingHeap()
    heap.insert(3)
    heap.insert(1)
    heap.insert(4)
    heap.insert(2)
    const stats = heap.stats()
    expect(stats.size).toBe(4)
    expect(stats.isValid).toBe(true)
    expect(typeof stats.height).toBe('number')
  })

  it('should decrease key to same value', () => {
    const heap = new PairingHeap()
    const node = heap.insert(5)
    heap.decreaseKey(node, 5)
    expect(heap.peek()).toBe(5)
  })

  it('should not decrease key to larger value', () => {
    const heap = new PairingHeap()
    const node = heap.insert(5)
    heap.decreaseKey(node, 10)
    expect(heap.peek()).toBe(5)
  })

  it('should return itself when merging into empty heap', () => {
    const heap1 = new PairingHeap()
    heap1.insert(1)
    heap1.insert(2)
    const heap2 = new PairingHeap()
    const result = heap1.merge(heap2)
    expect(result).toBe(heap1)
  })

  it('should convert to array', () => {
    const heap = new PairingHeap()
    heap.insert(5)
    heap.insert(3)
    heap.insert(1)
    heap.insert(4)
    heap.insert(2)
    const arr = heap.toArray()
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })
})