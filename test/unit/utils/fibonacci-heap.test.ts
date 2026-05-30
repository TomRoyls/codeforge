import { describe, expect, it } from 'vitest'
import { FibonacciHeap } from '../../../src/utils/fibonacci-heap.js'

describe('FibonacciHeap', () => {
  it('insert returns a node', () => {
    const heap = new FibonacciHeap<string>()
    const node = heap.insert(5, 'test')
    expect(node).toBeDefined()
    expect(node.key).toBe(5)
    expect(node.value).toBe('test')
    expect(node.degree).toBe(0)
    expect(node.marked).toBe(false)
  })

  it('insert single element and getMin returns it', () => {
    const heap = new FibonacciHeap<number>()
    heap.insert(10, 100)
    const min = heap.min
    expect(min).toBeDefined()
    expect(min!.key).toBe(10)
    expect(min!.value).toBe(100)
  })

  it('insert multiple elements maintains size', () => {
    const heap = new FibonacciHeap<number>()
    heap.insert(5, 1)
    heap.insert(3, 2)
    heap.insert(7, 3)
    expect(heap.size).toBe(3)
  })

  it('extractMin returns minimum element', () => {
    const heap = new FibonacciHeap<number>()
    heap.insert(5, 5)
    heap.insert(3, 3)
    heap.insert(7, 7)
    const extracted = heap.extractMin()
    expect(extracted).toBeDefined()
    expect(extracted!.key).toBe(3)
    expect(extracted!.value).toBe(3)
  })

  it('extractMin reduces size', () => {
    const heap = new FibonacciHeap<number>()
    heap.insert(5, 1)
    heap.insert(3, 2)
    heap.insert(7, 3)
    heap.extractMin()
    expect(heap.size).toBe(2)
  })

  it('extractMin returns elements in ascending order', () => {
    const heap = new FibonacciHeap<number>()
    heap.insert(5, 5)
    heap.insert(3, 3)
    heap.insert(7, 7)
    heap.insert(1, 1)
    heap.insert(9, 9)
    const results = []
    let extracted
    while ((extracted = heap.extractMin())) {
      results.push(extracted.key)
    }
    expect(results).toEqual([1, 3, 5, 7, 9])
  })

  it('extractMin on empty heap returns undefined', () => {
    const heap = new FibonacciHeap<number>()
    expect(heap.extractMin()).toBeUndefined()
  })

  it('getMin on empty heap returns undefined', () => {
    const heap = new FibonacciHeap<number>()
    expect(heap.min).toBeUndefined()
  })

  it('getMin returns minimum without removing', () => {
    const heap = new FibonacciHeap<number>()
    heap.insert(5, 5)
    heap.insert(3, 3)
    heap.insert(7, 7)
    const min1 = heap.min
    const min2 = heap.min
    expect(min1).toEqual(min2)
    expect(heap.size).toBe(3)
  })

  it('decreaseKey changes node key', () => {
    const heap = new FibonacciHeap<number>()
    const node = heap.insert(10, 100)
    heap.decreaseKey(node, 5)
    const min = heap.min
    expect(min!.key).toBe(5)
    expect(min!.value).toBe(100)
  })

  it('decreaseKey throws when new key is greater', () => {
    const heap = new FibonacciHeap<number>()
    const node = heap.insert(5, 100)
    expect(() => heap.decreaseKey(node, 10)).toThrow('New key is greater than current key')
  })

  it('decreaseKey throws when new key is equal', () => {
    const heap = new FibonacciHeap<number>()
    const node = heap.insert(5, 100)
    expect(() => heap.decreaseKey(node, 5)).toThrow('New key is greater than current key')
  })

  it('decreaseKey to minimum updates min', () => {
    const heap = new FibonacciHeap<number>()
    heap.insert(10, 10)
    const node = heap.insert(20, 20)
    heap.decreaseKey(node, 5)
    const min = heap.min
    expect(min!.key).toBe(5)
    expect(min!.value).toBe(20)
  })

  it('merge two non-empty heaps', () => {
    const heap1 = new FibonacciHeap<number>()
    heap1.insert(5, 5)
    heap1.insert(3, 3)
    const heap2 = new FibonacciHeap<number>()
    heap2.insert(7, 7)
    heap2.insert(1, 1)
    heap1.merge(heap2)
    expect(heap1.size).toBe(4)
    expect(heap2.size).toBe(0)
    const min = heap1.min
    expect(min!.key).toBe(1)
  })

  it('merge with empty heap', () => {
    const heap1 = new FibonacciHeap<number>()
    heap1.insert(5, 5)
    heap1.insert(3, 3)
    const heap2 = new FibonacciHeap<number>()
    heap1.merge(heap2)
    expect(heap1.size).toBe(2)
    expect(heap2.size).toBe(0)
  })

  it('merge empty heap with non-empty', () => {
    const heap1 = new FibonacciHeap<number>()
    const heap2 = new FibonacciHeap<number>()
    heap2.insert(5, 5)
    heap2.insert(3, 3)
    heap1.merge(heap2)
    expect(heap1.size).toBe(2)
    expect(heap2.size).toBe(0)
    expect(heap1.min!.key).toBe(3)
  })

  it('merge two empty heaps', () => {
    const heap1 = new FibonacciHeap<number>()
    const heap2 = new FibonacciHeap<number>()
    heap1.merge(heap2)
    expect(heap1.size).toBe(0)
    expect(heap2.size).toBe(0)
  })

  it('merge updates min to lowest key', () => {
    const heap1 = new FibonacciHeap<number>()
    heap1.insert(10, 10)
    heap1.insert(15, 15)
    const heap2 = new FibonacciHeap<number>()
    heap2.insert(5, 5)
    heap2.insert(20, 20)
    heap1.merge(heap2)
    expect(heap1.min!.key).toBe(5)
  })

  it('isEmpty returns true for empty heap', () => {
    const heap = new FibonacciHeap<number>()
    expect(heap.isEmpty()).toBe(true)
  })

  it('isEmpty returns false for non-empty heap', () => {
    const heap = new FibonacciHeap<number>()
    heap.insert(5, 5)
    expect(heap.isEmpty()).toBe(false)
  })

  it('isEmpty returns true after extracting all elements', () => {
    const heap = new FibonacciHeap<number>()
    heap.insert(5, 5)
    heap.insert(3, 3)
    heap.extractMin()
    heap.extractMin()
    expect(heap.isEmpty()).toBe(true)
  })

  it('clear removes all elements', () => {
    const heap = new FibonacciHeap<number>()
    heap.insert(5, 5)
    heap.insert(3, 3)
    heap.insert(7, 7)
    heap.clear()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
    expect(heap.min).toBeUndefined()
  })

  it('clear on empty heap does nothing', () => {
    const heap = new FibonacciHeap<number>()
    heap.clear()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
  })

  it('handle duplicate keys correctly', () => {
    const heap = new FibonacciHeap<number>()
    heap.insert(5, 1)
    heap.insert(5, 2)
    heap.insert(5, 3)
    expect(heap.size).toBe(3)
    const min = heap.min
    expect(min!.key).toBe(5)
  })

  it('extractMin with duplicate keys', () => {
    const heap = new FibonacciHeap<number>()
    heap.insert(5, 1)
    heap.insert(5, 2)
    heap.insert(3, 3)
    const extracted = heap.extractMin()
    expect(extracted!.key).toBe(3)
    expect(heap.size).toBe(2)
  })

  it('stress test with many inserts and extracts', () => {
    const heap = new FibonacciHeap<number>()
    const count = 1000
    for (let i = 0; i < count; i++) {
      heap.insert(Math.random() * 1000, i)
    }
    expect(heap.size).toBe(count)
    while (!heap.isEmpty()) {
      const extracted = heap.extractMin()
      expect(extracted).toBeDefined()
    }
    expect(heap.size).toBe(0)
  })

  it('stress test with ordered inserts', () => {
    const heap = new FibonacciHeap<number>()
    const count = 1000
    for (let i = 0; i < count; i++) {
      heap.insert(i, i)
    }
    const results = []
    let extracted
    while ((extracted = heap.extractMin())) {
      results.push(extracted.key)
    }
    expect(results).toHaveLength(count)
    expect(results[0]).toBe(0)
    expect(results[count - 1]).toBe(count - 1)
  })

  it('stress test with reverse ordered inserts', () => {
    const heap = new FibonacciHeap<number>()
    const count = 1000
    for (let i = count; i > 0; i--) {
      heap.insert(i, i)
    }
    const results = []
    let extracted
    while ((extracted = heap.extractMin())) {
      results.push(extracted.key)
    }
    expect(results).toHaveLength(count)
    expect(results[0]).toBe(1)
    expect(results[count - 1]).toBe(count)
  })

  it('delete removes node', () => {
    const heap = new FibonacciHeap<number>()
    const node = heap.insert(5, 5)
    heap.insert(3, 3)
    heap.insert(7, 7)
    heap.delete(node)
    expect(heap.size).toBe(2)
  })

  it('delete on only element', () => {
    const heap = new FibonacciHeap<number>()
    const node = heap.insert(5, 5)
    heap.delete(node)
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
  })

  it('delete min node updates min', () => {
    const heap = new FibonacciHeap<number>()
    const minNode = heap.insert(1, 1)
    heap.insert(5, 5)
    heap.insert(10, 10)
    heap.delete(minNode)
    expect(heap.min!.key).toBe(5)
    expect(heap.size).toBe(2)
  })

  it('size getter returns correct size', () => {
    const heap = new FibonacciHeap<number>()
    expect(heap.size).toBe(0)
    heap.insert(5, 5)
    expect(heap.size).toBe(1)
    heap.insert(3, 3)
    expect(heap.size).toBe(2)
    heap.insert(7, 7)
    expect(heap.size).toBe(3)
  })
})