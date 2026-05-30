import { describe, expect, it } from 'vitest'
import { PairingHeap } from '../../../src/utils/pairing-heap.js'

describe('PairingHeap', () => {
  it('should create empty heap', () => {
    const heap = new PairingHeap<number>()
    expect(heap.size).toBe(0)
  })

  it('should be empty initially', () => {
    const heap = new PairingHeap<number>()
    expect(heap.isEmpty()).toBe(true)
  })

  it('should not be empty after insert', () => {
    const heap = new PairingHeap<number>()
    heap.insert(5)
    expect(heap.isEmpty()).toBe(false)
  })

  it('should insert single element', () => {
    const heap = new PairingHeap<number>()
    heap.insert(5)
    expect(heap.size).toBe(1)
  })

  it('should insert multiple elements', () => {
    const heap = new PairingHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    expect(heap.size).toBe(3)
  })

  it('should find minimum element', () => {
    const heap = new PairingHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    expect(heap.findMin()).toBe(3)
  })

  it('should peek minimum element', () => {
    const heap = new PairingHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    expect(heap.peek()).toBe(3)
  })

  it('should return undefined for findMin on empty heap', () => {
    const heap = new PairingHeap<number>()
    expect(heap.findMin()).toBeUndefined()
  })

  it('should return undefined for peek on empty heap', () => {
    const heap = new PairingHeap<number>()
    expect(heap.peek()).toBeUndefined()
  })

  it('should extract minimum element', () => {
    const heap = new PairingHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    const min = heap.extractMin()
    expect(min).toBe(3)
    expect(heap.size).toBe(2)
  })

  it('should extract elements in ascending order', () => {
    const heap = new PairingHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.insert(1)
    heap.insert(9)
    const results = []
    while (!heap.isEmpty()) {
      results.push(heap.extractMin())
    }
    expect(results).toEqual([1, 3, 5, 7, 9])
  })

  it('should return undefined for extractMin on empty heap', () => {
    const heap = new PairingHeap<number>()
    expect(heap.extractMin()).toBeUndefined()
  })

  it('should clear all elements', () => {
    const heap = new PairingHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.clear()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
  })

  it('should handle custom comparator for max heap', () => {
    const heap = new PairingHeap<number>({ comparator: (a, b) => b - a })
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    expect(heap.findMin()).toBe(7)
  })

  it('should extract elements in descending order with max heap', () => {
    const heap = new PairingHeap<number>({ comparator: (a, b) => b - a })
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.insert(1)
    heap.insert(9)
    const results = []
    while (!heap.isEmpty()) {
      results.push(heap.extractMin())
    }
    expect(results).toEqual([9, 7, 5, 3, 1])
  })

  it('should handle duplicate values', () => {
    const heap = new PairingHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(3)
    heap.insert(7)
    const results = []
    while (!heap.isEmpty()) {
      results.push(heap.extractMin())
    }
    expect(results).toEqual([3, 3, 5, 7])
  })

  it('should merge two heaps', () => {
    const heap1 = new PairingHeap<number>()
    heap1.insert(5)
    heap1.insert(3)
    const heap2 = new PairingHeap<number>()
    heap2.insert(7)
    heap2.insert(1)
    heap1.merge(heap2)
    expect(heap1.size).toBe(4)
    expect(heap2.size).toBe(0)
    expect(heap2.isEmpty()).toBe(true)
  })

  it('should find min after merge', () => {
    const heap1 = new PairingHeap<number>()
    heap1.insert(5)
    heap1.insert(3)
    const heap2 = new PairingHeap<number>()
    heap2.insert(7)
    heap2.insert(1)
    heap1.merge(heap2)
    expect(heap1.findMin()).toBe(1)
  })

  it('should extract all elements after merge in order', () => {
    const heap1 = new PairingHeap<number>()
    heap1.insert(5)
    heap1.insert(3)
    const heap2 = new PairingHeap<number>()
    heap2.insert(7)
    heap2.insert(1)
    heap1.merge(heap2)
    const results = []
    while (!heap1.isEmpty()) {
      results.push(heap1.extractMin())
    }
    expect(results).toEqual([1, 3, 5, 7])
  })

  it('should handle merging empty heap', () => {
    const heap1 = new PairingHeap<number>()
    heap1.insert(5)
    heap1.insert(3)
    const heap2 = new PairingHeap<number>()
    heap1.merge(heap2)
    expect(heap1.size).toBe(2)
    expect(heap1.findMin()).toBe(3)
  })

  it('should decrease key of existing node', () => {
    const heap = new PairingHeap<number>()
    const node1 = heap.insert(5)
    const node2 = heap.insert(3)
    heap.insert(7)
    heap.decreaseKey(node1, 2)
    expect(heap.findMin()).toBe(2)
  })

  it('should throw error when decreasing key to larger value', () => {
    const heap = new PairingHeap<number>()
    const node1 = heap.insert(5)
    heap.insert(3)
    expect(() => heap.decreaseKey(node1, 6)).toThrow()
  })

  it('should throw error with message when decreasing key to larger value', () => {
    const heap = new PairingHeap<number>()
    const node1 = heap.insert(5)
    heap.insert(3)
    expect(() => heap.decreaseKey(node1, 6)).toThrow('New value is greater than current value')
  })

  it('should handle decreaseKey on root node', () => {
    const heap = new PairingHeap<number>()
    const node1 = heap.insert(5)
    heap.insert(7)
    heap.decreaseKey(node1, 2)
    expect(heap.findMin()).toBe(2)
  })

  it('should delete specific node', () => {
    const heap = new PairingHeap<number>()
    const node1 = heap.insert(5)
    const node2 = heap.insert(3)
    heap.insert(7)
    heap.delete(node2)
    expect(heap.size).toBe(2)
    expect(heap.findMin()).toBe(5)
  })

  it('should delete root node', () => {
    const heap = new PairingHeap<number>()
    const node1 = heap.insert(5)
    const node2 = heap.insert(3)
    heap.insert(7)
    heap.delete(node1)
    expect(heap.size).toBe(2)
    expect(heap.findMin()).toBe(3)
  })

  it('should extract elements in order after delete', () => {
    const heap = new PairingHeap<number>()
    heap.insert(5)
    const node2 = heap.insert(3)
    heap.insert(7)
    heap.insert(1)
    heap.insert(9)
    heap.delete(node2)
    const results = []
    while (!heap.isEmpty()) {
      results.push(heap.extractMin())
    }
    expect(results).toEqual([1, 5, 7, 9])
  })

  it('should handle decreaseKey and then extract', () => {
    const heap = new PairingHeap<number>()
    const node1 = heap.insert(5)
    const node2 = heap.insert(3)
    heap.insert(7)
    heap.decreaseKey(node1, 1)
    expect(heap.extractMin()).toBe(1)
    expect(heap.extractMin()).toBe(3)
    expect(heap.extractMin()).toBe(7)
  })

  it('should handle string values with custom comparator', () => {
    const heap = new PairingHeap<string>({ comparator: (a, b) => a.localeCompare(b) })
    heap.insert('zebra')
    heap.insert('apple')
    heap.insert('banana')
    expect(heap.findMin()).toBe('apple')
  })

  it('should extract strings in alphabetical order with custom comparator', () => {
    const heap = new PairingHeap<string>({ comparator: (a, b) => a.localeCompare(b) })
    heap.insert('zebra')
    heap.insert('apple')
    heap.insert('banana')
    heap.insert('cherry')
    const results = []
    while (!heap.isEmpty()) {
      results.push(heap.extractMin())
    }
    expect(results).toEqual(['apple', 'banana', 'cherry', 'zebra'])
  })

  it('should handle object values with custom comparator', () => {
    const heap = new PairingHeap<{ value: number }>({ comparator: (a, b) => a.value - b.value })
    heap.insert({ value: 5 })
    heap.insert({ value: 3 })
    heap.insert({ value: 7 })
    expect(heap.findMin()).toEqual({ value: 3 })
  })

  it('should handle stress test with many elements', () => {
    const heap = new PairingHeap<number>()
    const elements = []
    for (let i = 0; i < 100; i++) {
      const value = Math.floor(Math.random() * 1000)
      elements.push(value)
      heap.insert(value)
    }
    const results = []
    while (!heap.isEmpty()) {
      results.push(heap.extractMin())
    }
    elements.sort((a, b) => a - b)
    expect(results).toEqual(elements)
  })

  it('should maintain size after operations', () => {
    const heap = new PairingHeap<number>()
    expect(heap.size).toBe(0)
    heap.insert(5)
    expect(heap.size).toBe(1)
    heap.insert(3)
    expect(heap.size).toBe(2)
    heap.extractMin()
    expect(heap.size).toBe(1)
    heap.clear()
    expect(heap.size).toBe(0)
  })
})