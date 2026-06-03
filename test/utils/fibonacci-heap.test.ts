import { describe, it, expect } from 'vitest'
import { FibonacciHeap } from '../../src/utils/fibonacci-heap.js'

describe('FibonacciHeap', () => {
  it('empty heap', () => {
    const heap = new FibonacciHeap<number>()
    expect(heap.isEmpty()).toBe(true)
    expect(heap.size).toBe(0)
    expect(heap.peek()).toBeUndefined()
    expect(heap.extractMin()).toBeUndefined()
    expect(heap.toArray()).toEqual([])
  })

  it('insert and peek', () => {
    const heap = new FibonacciHeap<number>()
    heap.insert(5)
    expect(heap.isEmpty()).toBe(false)
    expect(heap.size).toBe(1)
    expect(heap.peek()).toBe(5)
  })

  it('insert and extractMin', () => {
    const heap = new FibonacciHeap<number>()
    heap.insert(5)
    const result = heap.extractMin()
    expect(result).toBe(5)
    expect(heap.isEmpty()).toBe(true)
    expect(heap.size).toBe(0)
  })

  it('multiple inserts, correct extraction order', () => {
    const heap = new FibonacciHeap<number>()
    heap.insert(5)
    heap.insert(2)
    heap.insert(8)
    heap.insert(1)
    heap.insert(7)
    expect(heap.size).toBe(5)
    expect(heap.extractMin()).toBe(1)
    expect(heap.extractMin()).toBe(2)
    expect(heap.extractMin()).toBe(5)
    expect(heap.extractMin()).toBe(7)
    expect(heap.extractMin()).toBe(8)
    expect(heap.isEmpty()).toBe(true)
  })

  it('DecreaseKey moves element up', () => {
    const heap = new FibonacciHeap<number>()
    heap.insert(5)
    heap.insert(2)
    heap.insert(8)
    const handle = heap.insert(10)
    heap.insert(7)
    heap.decreaseKey(handle, 1)
    expect(heap.extractMin()).toBe(1)
    expect(heap.extractMin()).toBe(2)
    expect(heap.extractMin()).toBe(5)
    expect(heap.extractMin()).toBe(7)
    expect(heap.extractMin()).toBe(8)
  })

  it('Delete removes element', () => {
    const heap = new FibonacciHeap<number>()
    heap.insert(5)
    const handle = heap.insert(2)
    heap.insert(8)
    heap.insert(1)
    heap.insert(7)
    heap.delete(handle)
    expect(heap.size).toBe(4)
    expect(heap.extractMin()).toBe(1)
    expect(heap.extractMin()).toBe(5)
    expect(heap.extractMin()).toBe(7)
    expect(heap.extractMin()).toBe(8)
    expect(heap.isEmpty()).toBe(true)
  })

  it('Merge combines two heaps', () => {
    const heap1 = new FibonacciHeap<number>()
    heap1.insert(5)
    heap1.insert(2)
    heap1.insert(8)
    const heap2 = new FibonacciHeap<number>()
    heap2.insert(1)
    heap2.insert(7)
    heap1.merge(heap2)
    expect(heap1.size).toBe(5)
    expect(heap2.isEmpty()).toBe(true)
    expect(heap1.extractMin()).toBe(1)
    expect(heap1.extractMin()).toBe(2)
    expect(heap1.extractMin()).toBe(5)
    expect(heap1.extractMin()).toBe(7)
    expect(heap1.extractMin()).toBe(8)
  })

  it('Size tracking', () => {
    const heap = new FibonacciHeap<number>()
    expect(heap.size).toBe(0)
    heap.insert(1)
    expect(heap.size).toBe(1)
    heap.insert(2)
    expect(heap.size).toBe(2)
    heap.insert(3)
    expect(heap.size).toBe(3)
    heap.extractMin()
    expect(heap.size).toBe(2)
    heap.extractMin()
    expect(heap.size).toBe(1)
    heap.extractMin()
    expect(heap.size).toBe(0)
  })

  it('Clear resets', () => {
    const heap = new FibonacciHeap<number>()
    heap.insert(5)
    heap.insert(2)
    heap.insert(8)
    heap.insert(1)
    heap.insert(7)
    heap.clear()
    expect(heap.isEmpty()).toBe(true)
    expect(heap.size).toBe(0)
    expect(heap.peek()).toBeUndefined()
    expect(heap.extractMin()).toBeUndefined()
  })

  it('isEmpty', () => {
    const heap = new FibonacciHeap<number>()
    expect(heap.isEmpty()).toBe(true)
    heap.insert(1)
    expect(heap.isEmpty()).toBe(false)
    heap.extractMin()
    expect(heap.isEmpty()).toBe(true)
  })

  it('toArray returns all elements', () => {
    const heap = new FibonacciHeap<number>()
    heap.insert(5)
    heap.insert(2)
    heap.insert(8)
    heap.insert(1)
    heap.insert(7)
    const arr = heap.toArray()
    expect(arr).toHaveLength(5)
    expect(arr).toContain(1)
    expect(arr).toContain(2)
    expect(arr).toContain(5)
    expect(arr).toContain(7)
    expect(arr).toContain(8)
  })

  it('Large number of operations (1000+ inserts + extracts)', () => {
    const heap = new FibonacciHeap<number>()
    const values: number[] = []
    for (let i = 0; i < 1000; i++) {
      values.push(i)
      heap.insert(i)
    }
    expect(heap.size).toBe(1000)
    const extracted: number[] = []
    for (let i = 0; i < 1000; i++) {
      extracted.push(heap.extractMin()!)
    }
    expect(extracted).toEqual(values)
    expect(heap.isEmpty()).toBe(true)
  })

  it('Handles duplicate values', () => {
    const heap = new FibonacciHeap<number>()
    heap.insert(5)
    heap.insert(2)
    heap.insert(5)
    heap.insert(1)
    heap.insert(5)
    heap.insert(2)
    expect(heap.size).toBe(6)
    expect(heap.extractMin()).toBe(1)
    expect(heap.extractMin()).toBe(2)
    expect(heap.extractMin()).toBe(2)
    expect(heap.extractMin()).toBe(5)
    expect(heap.extractMin()).toBe(5)
    expect(heap.extractMin()).toBe(5)
    expect(heap.isEmpty()).toBe(true)
  })

  it('custom comparator for max-heap', () => {
    const heap = new FibonacciHeap<number>((a, b) => b - a)
    heap.insert(5)
    heap.insert(2)
    heap.insert(8)
    heap.insert(1)
    heap.insert(7)
    expect(heap.peek()).toBe(8)
    expect(heap.extractMin()).toBe(8)
    expect(heap.extractMin()).toBe(7)
    expect(heap.extractMin()).toBe(5)
    expect(heap.extractMin()).toBe(2)
    expect(heap.extractMin()).toBe(1)
  })

  it('decreaseKey with same value', () => {
    const heap = new FibonacciHeap<number>()
    const handle = heap.insert(5)
    heap.decreaseKey(handle, 5)
    expect(heap.peek()).toBe(5)
  })

  it('decreaseKey throws for invalid handle', () => {
    const heap = new FibonacciHeap<number>()
    heap.insert(5)
    expect(() => heap.decreaseKey(999, 1)).toThrow('Invalid handle: 999')
  })

  it('decreaseKey throws for higher value', () => {
    const heap = new FibonacciHeap<number>()
    const handle = heap.insert(5)
    expect(() => heap.decreaseKey(handle, 10)).toThrow('New value must be less than or equal to current value')
  })

  it('delete throws for invalid handle', () => {
    const heap = new FibonacciHeap<number>()
    heap.insert(5)
    expect(() => heap.delete(999)).toThrow('Invalid handle: 999')
  })

  it('insert returns unique handles', () => {
    const heap = new FibonacciHeap<number>()
    const handles = new Set<number>()
    for (let i = 0; i < 100; i++) {
      const handle = heap.insert(i)
      handles.add(handle)
    }
    expect(handles.size).toBe(100)
  })

  it('works with strings', () => {
    const heap = new FibonacciHeap<string>()
    heap.insert('banana')
    heap.insert('apple')
    heap.insert('cherry')
    heap.insert('date')
    expect(heap.extractMin()).toBe('apple')
    expect(heap.extractMin()).toBe('banana')
    expect(heap.extractMin()).toBe('cherry')
    expect(heap.extractMin()).toBe('date')
  })

  it('merge empty heap into non-empty heap', () => {
    const heap1 = new FibonacciHeap<number>()
    heap1.insert(5)
    heap1.insert(2)
    const heap2 = new FibonacciHeap<number>()
    heap1.merge(heap2)
    expect(heap1.size).toBe(2)
    expect(heap2.isEmpty()).toBe(true)
  })

  it('merge non-empty heap into empty heap', () => {
    const heap1 = new FibonacciHeap<number>()
    const heap2 = new FibonacciHeap<number>()
    heap2.insert(5)
    heap2.insert(2)
    heap1.merge(heap2)
    expect(heap1.size).toBe(2)
    expect(heap2.isEmpty()).toBe(true)
    expect(heap1.extractMin()).toBe(2)
    expect(heap1.extractMin()).toBe(5)
  })

  it('insert and extractMin returns minimum', () => {
    const heap = new FibonacciHeap<number>()
    heap.insert(10)
    heap.insert(3)
    heap.insert(7)
    expect(heap.extractMin()).toBe(3)
  })
})