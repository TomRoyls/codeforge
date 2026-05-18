import { describe, expect, it } from 'vitest'
import { FibonacciHeap } from '../../src/utils/fibonacci-heap.js'

// ─── Basics ───

describe('FibonacciHeap basics', () => {
  it('starts empty', () => {
    const heap = new FibonacciHeap<string>()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
    expect(heap.min).toBeUndefined()
  })

  it('inserts a single element', () => {
    const heap = new FibonacciHeap<string>()
    heap.insert(5, 'a')
    expect(heap.size).toBe(1)
    expect(heap.min).toEqual({ key: 5, value: 'a' })
  })

  it('inserts multiple elements and tracks min', () => {
    const heap = new FibonacciHeap<string>()
    heap.insert(5, 'e')
    heap.insert(3, 'c')
    heap.insert(7, 'g')
    heap.insert(1, 'a')
    expect(heap.size).toBe(4)
    expect(heap.min).toEqual({ key: 1, value: 'a' })
  })
})

// ─── ExtractMin ───

describe('FibonacciHeap extractMin', () => {
  it('extracts minimum', () => {
    const heap = new FibonacciHeap<string>()
    heap.insert(3, 'c')
    heap.insert(1, 'a')
    heap.insert(2, 'b')
    expect(heap.extractMin()).toEqual({ key: 1, value: 'a' })
    expect(heap.extractMin()).toEqual({ key: 2, value: 'b' })
    expect(heap.extractMin()).toEqual({ key: 3, value: 'c' })
  })

  it('returns undefined on empty', () => {
    const heap = new FibonacciHeap<string>()
    expect(heap.extractMin()).toBeUndefined()
  })

  it('updates min after extract', () => {
    const heap = new FibonacciHeap<string>()
    heap.insert(5, 'e')
    heap.insert(1, 'a')
    heap.insert(3, 'c')
    heap.extractMin()
    expect(heap.min).toEqual({ key: 3, value: 'c' })
  })

  it('extracts all elements sorted', () => {
    const heap = new FibonacciHeap<number>()
    const values = [5, 3, 7, 1, 4, 6, 2]
    for (const v of values) heap.insert(v, v)
    const sorted: number[] = []
    while (!heap.isEmpty()) {
      sorted.push(heap.extractMin()!.value)
    }
    expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(heap.size).toBe(0)
  })
})

// ─── DecreaseKey ───

describe('FibonacciHeap decreaseKey', () => {
  it('decreases key of a node', () => {
    const heap = new FibonacciHeap<string>()
    heap.insert(10, 'x')
    const node = heap.insert(20, 'y')
    heap.insert(15, 'z')
    heap.decreaseKey(node, 5)
    expect(heap.min).toEqual({ key: 5, value: 'y' })
  })

  it('throws when new key is not smaller', () => {
    const heap = new FibonacciHeap<string>()
    const node = heap.insert(5, 'a')
    expect(() => heap.decreaseKey(node, 5)).toThrow()
    expect(() => heap.decreaseKey(node, 10)).toThrow()
  })
})

// ─── Delete ───

describe('FibonacciHeap delete', () => {
  it('deletes a specific node', () => {
    const heap = new FibonacciHeap<string>()
    heap.insert(1, 'a')
    const node = heap.insert(5, 'b')
    heap.insert(3, 'c')
    heap.delete(node)
    expect(heap.size).toBe(2)
    const extracted: string[] = []
    while (!heap.isEmpty()) extracted.push(heap.extractMin()!.value)
    expect(extracted).toEqual(['a', 'c'])
  })
})

// ─── Merge ───

describe('FibonacciHeap merge', () => {
  it('merges two heaps', () => {
    const h1 = new FibonacciHeap<string>()
    h1.insert(5, 'e')
    h1.insert(1, 'a')

    const h2 = new FibonacciHeap<string>()
    h2.insert(3, 'c')
    h2.insert(7, 'g')

    h1.merge(h2)
    expect(h1.size).toBe(4)
    expect(h2.size).toBe(0)
    expect(h2.isEmpty()).toBe(true)

    expect(h1.extractMin()!.value).toBe('a')
    expect(h1.extractMin()!.value).toBe('c')
    expect(h1.extractMin()!.value).toBe('e')
    expect(h1.extractMin()!.value).toBe('g')
  })

  it('merging empty heap is no-op', () => {
    const h1 = new FibonacciHeap<string>()
    h1.insert(1, 'a')
    const h2 = new FibonacciHeap<string>()
    h1.merge(h2)
    expect(h1.size).toBe(1)
  })

  it('merging into empty heap takes other', () => {
    const h1 = new FibonacciHeap<string>()
    const h2 = new FibonacciHeap<string>()
    h2.insert(1, 'a')
    h1.merge(h2)
    expect(h1.size).toBe(1)
    expect(h1.min!.value).toBe('a')
  })
})

// ─── Clear ───

describe('FibonacciHeap clear', () => {
  it('clears the heap', () => {
    const heap = new FibonacciHeap<string>()
    heap.insert(1, 'a')
    heap.insert(2, 'b')
    heap.clear()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
    expect(heap.min).toBeUndefined()
  })
})

// ─── Stress ───

describe('FibonacciHeap stress', () => {
  it('handles sequential inserts and extracts', () => {
    const heap = new FibonacciHeap<number>()
    const n = 100
    for (let i = n; i >= 0; i--) heap.insert(i, i)
    for (let i = 0; i <= n; i++) {
      expect(heap.extractMin()!.key).toBe(i)
    }
    expect(heap.isEmpty()).toBe(true)
  })

  it('handles random order inserts', () => {
    const heap = new FibonacciHeap<number>()
    const values = [42, 17, 99, 3, 55, 1, 88, 23, 7, 66]
    for (const v of values) heap.insert(v, v)
    const sorted = [...values].sort((a, b) => a - b)
    for (const expected of sorted) {
      expect(heap.extractMin()!.value).toBe(expected)
    }
  })
})
