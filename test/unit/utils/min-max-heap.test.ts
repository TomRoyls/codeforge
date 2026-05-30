import { describe, expect, it } from 'vitest'
import { MinMaxHeap } from '../../../src/utils/min-max-heap.js'

describe('MinMaxHeap', () => {
  it('should create empty heap', () => {
    const heap = new MinMaxHeap<number>()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
  })

  it('should peek min on empty heap', () => {
    const heap = new MinMaxHeap<number>()
    expect(heap.peekMin()).toBe(undefined)
  })

  it('should peek max on empty heap', () => {
    const heap = new MinMaxHeap<number>()
    expect(heap.peekMax()).toBe(undefined)
  })

  it('should extract min from empty heap', () => {
    const heap = new MinMaxHeap<number>()
    expect(heap.extractMin()).toBe(undefined)
  })

  it('should extract max from empty heap', () => {
    const heap = new MinMaxHeap<number>()
    expect(heap.extractMax()).toBe(undefined)
  })

  it('should replace min on empty heap', () => {
    const heap = new MinMaxHeap<number>()
    expect(heap.replaceMin(5)).toBe(undefined)
  })

  it('should replace max on empty heap', () => {
    const heap = new MinMaxHeap<number>()
    expect(heap.replaceMax(5)).toBe(undefined)
  })

  it('should insert single element', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    expect(heap.size).toBe(1)
    expect(heap.isEmpty()).toBe(false)
    expect(heap.peekMin()).toBe(5)
    expect(heap.peekMax()).toBe(5)
  })

  it('should insert multiple elements', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(3)
    heap.insert(1)
    heap.insert(4)
    heap.insert(1)
    heap.insert(5)
    expect(heap.size).toBe(5)
    expect(heap.peekMin()).toBe(1)
    expect(heap.peekMax()).toBe(5)
  })

  it('should peek min correctly', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.insert(1)
    expect(heap.peekMin()).toBe(1)
    heap.insert(0)
    expect(heap.peekMin()).toBe(0)
  })

  it('should peek max correctly', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.insert(1)
    expect(heap.peekMax()).toBe(7)
    heap.insert(10)
    expect(heap.peekMax()).toBe(10)
  })

  it('should peek max with two elements', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(1)
    heap.insert(2)
    expect(heap.peekMin()).toBe(1)
    expect(heap.peekMax()).toBe(2)
  })

  it('should peek max with three elements', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    expect(heap.peekMin()).toBe(1)
    expect(heap.peekMax()).toBe(3)
  })

  it('should extract min correctly', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.insert(1)
    const min = heap.extractMin()
    expect(min).toBe(1)
    expect(heap.size).toBe(3)
    expect(heap.peekMin()).toBe(3)
  })

  it('should extract max correctly', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.insert(1)
    const max = heap.extractMax()
    expect(max).toBe(7)
    expect(heap.size).toBe(3)
    expect(heap.peekMax()).toBe(5)
  })

  it('should extract all elements in min order', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.insert(1)
    heap.insert(9)
    heap.insert(2)
    const results: number[] = []
    while (!heap.isEmpty()) {
      results.push(heap.extractMin()!)
    }
    expect(results).toEqual([1, 2, 3, 5, 7, 9])
  })

  it('should extract all elements in max order', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.insert(1)
    heap.insert(9)
    heap.insert(2)
    const results: number[] = []
    while (!heap.isEmpty()) {
      results.push(heap.extractMax()!)
    }
    expect(results).toEqual([9, 7, 5, 3, 2, 1])
  })

  it('should handle duplicate values', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(5)
    heap.insert(3)
    heap.insert(5)
    expect(heap.peekMin()).toBe(3)
    expect(heap.peekMax()).toBe(5)
    expect(heap.extractMin()).toBe(3)
    expect(heap.extractMin()).toBe(3)
  })

  it('should handle interleaved min and max extracts', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.insert(1)
    heap.insert(9)
    const results: number[] = []
    results.push(heap.extractMin()!)
    results.push(heap.extractMax()!)
    results.push(heap.extractMin()!)
    results.push(heap.extractMax()!)
    results.push(heap.extractMin()!)
    results.push(heap.extractMax()!)
    expect(results).toEqual([1, 9, 3, 7, 5, undefined])
  })

  it('should clear heap', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.clear()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
    expect(heap.peekMin()).toBe(undefined)
    expect(heap.peekMax()).toBe(undefined)
  })

  it('should convert to array', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.insert(1)
    const arr = heap.toArray()
    expect(arr.length).toBe(4)
    expect(arr).toContain(1)
    expect(arr).toContain(3)
    expect(arr).toContain(5)
    expect(arr).toContain(7)
  })

  it('should replace min correctly', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.insert(1)
    const oldMin = heap.replaceMin(0)
    expect(oldMin).toBe(1)
    expect(heap.peekMin()).toBe(0)
    expect(heap.size).toBe(4)
  })

  it('should replace max correctly', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.insert(1)
    const oldMax = heap.replaceMax(10)
    expect(oldMax).toBe(7)
    expect(heap.peekMax()).toBe(10)
    expect(heap.size).toBe(4)
  })

  it('should work with custom comparator', () => {
    const heap = new MinMaxHeap<string>({ comparator: (a, b) => a.localeCompare(b) })
    heap.insert('banana')
    heap.insert('apple')
    heap.insert('cherry')
    expect(heap.peekMin()).toBe('apple')
    expect(heap.peekMax()).toBe('cherry')
  })

  it('should maintain heap property after multiple inserts', () => {
    const heap = new MinMaxHeap<number>()
    for (let i = 0; i < 100; i++) {
      heap.insert(Math.random() * 1000)
    }
    const prevMin = heap.extractMin()
    while (!heap.isEmpty()) {
      const currentMin = heap.extractMin()!
      expect(currentMin).toBeGreaterThanOrEqual(prevMin!)
    }
  })

  it('should work with negative numbers', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(-5)
    heap.insert(3)
    heap.insert(-7)
    heap.insert(1)
    expect(heap.peekMin()).toBe(-7)
    expect(heap.peekMax()).toBe(3)
  })

  it('should work with objects', () => {
    const heap = new MinMaxHeap<{ value: number }>({ comparator: (a, b) => a.value - b.value })
    heap.insert({ value: 5 })
    heap.insert({ value: 3 })
    heap.insert({ value: 7 })
    expect(heap.peekMin()?.value).toBe(3)
    expect(heap.peekMax()?.value).toBe(7)
  })

  it('should handle extract from single element heap', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    expect(heap.extractMin()).toBe(5)
    expect(heap.isEmpty()).toBe(true)
  })

  it('should handle extract max from single element heap', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    expect(heap.extractMax()).toBe(5)
    expect(heap.isEmpty()).toBe(true)
  })

  it('should maintain size after extract', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    expect(heap.size).toBe(3)
    heap.extractMin()
    expect(heap.size).toBe(2)
    heap.extractMax()
    expect(heap.size).toBe(1)
  })

  it('should work with already sorted input', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    heap.insert(4)
    heap.insert(5)
    expect(heap.peekMin()).toBe(1)
    expect(heap.peekMax()).toBe(5)
  })

  it('should work with reverse sorted input', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(4)
    heap.insert(3)
    heap.insert(2)
    heap.insert(1)
    expect(heap.peekMin()).toBe(1)
    expect(heap.peekMax()).toBe(5)
  })
})