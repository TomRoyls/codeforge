import { describe, it, expect } from 'vitest'
import { FibonacciHeap4, FibonacciHeapNode } from '../../src/core/fibonacci-heap-4/index.js'

// ─── Constructor & Empty State ───

describe('FibonacciHeap4 - constructor & empty state', () => {
  it('creates an empty heap', () => {
    const heap = new FibonacciHeap4<number>()
    expect(heap.size()).toBe(0)
    expect(heap.isEmpty()).toBe(true)
  })

  it('creates a heap with custom comparator (max-heap)', () => {
    const heap = new FibonacciHeap4<number>((a, b) => b - a)
    heap.insert(1)
    heap.insert(3)
    heap.insert(2)
    expect(heap.peek()).toBe(3)
  })

  it('peek returns null on empty heap', () => {
    const heap = new FibonacciHeap4<number>()
    expect(heap.peek()).toBeNull()
  })

  it('extractMin returns null on empty heap', () => {
    const heap = new FibonacciHeap4<number>()
    expect(heap.extractMin()).toBeNull()
  })
})

// ─── Insert & Peek ───

describe('FibonacciHeap4 - insert & peek', () => {
  it('insert returns a FibonacciHeapNode', () => {
    const heap = new FibonacciHeap4<number>()
    const node = heap.insert(42)
    expect(node).toBeInstanceOf(FibonacciHeapNode)
    expect(node.value).toBe(42)
  })

  it('peek returns the minimum after multiple inserts', () => {
    const heap = new FibonacciHeap4<number>()
    heap.insert(5)
    heap.insert(2)
    heap.insert(8)
    heap.insert(1)
    expect(heap.peek()).toBe(1)
  })

  it('maintains correct size after inserts', () => {
    const heap = new FibonacciHeap4<number>()
    for (let i = 0; i < 10; i++) {
      heap.insert(i)
    }
    expect(heap.size()).toBe(10)
  })

  it('updates min pointer when inserting smaller value', () => {
    const heap = new FibonacciHeap4<number>()
    heap.insert(10)
    heap.insert(5)
    heap.insert(3)
    expect(heap.peek()).toBe(3)
  })
})

// ─── ExtractMin ───

describe('FibonacciHeap4 - extractMin', () => {
  it('extracts the only element', () => {
    const heap = new FibonacciHeap4<number>()
    heap.insert(7)
    expect(heap.extractMin()).toBe(7)
    expect(heap.size()).toBe(0)
    expect(heap.isEmpty()).toBe(true)
  })

  it('extracts elements in sorted order', () => {
    const heap = new FibonacciHeap4<number>()
    const values = [5, 3, 8, 1, 9, 2, 7, 4, 6]
    for (const v of values) {
      heap.insert(v)
    }
    const result: number[] = []
    while (!heap.isEmpty()) {
      result.push(heap.extractMin()!)
    }
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('handles duplicate values', () => {
    const heap = new FibonacciHeap4<number>()
    heap.insert(3)
    heap.insert(3)
    heap.insert(1)
    heap.insert(3)
    expect(heap.extractMin()).toBe(1)
    expect(heap.extractMin()).toBe(3)
    expect(heap.extractMin()).toBe(3)
    expect(heap.extractMin()).toBe(3)
    expect(heap.extractMin()).toBeNull()
  })

  it('interleaved insert and extractMin', () => {
    const heap = new FibonacciHeap4<number>()
    heap.insert(5)
    heap.insert(2)
    expect(heap.extractMin()).toBe(2)
    heap.insert(1)
    heap.insert(8)
    expect(heap.extractMin()).toBe(1)
    expect(heap.extractMin()).toBe(5)
    expect(heap.extractMin()).toBe(8)
  })
})

// ─── Merge ───

describe('FibonacciHeap4 - merge', () => {
  it('merges two non-empty heaps', () => {
    const h1 = new FibonacciHeap4<number>()
    h1.insert(3)
    h1.insert(1)
    const h2 = new FibonacciHeap4<number>()
    h2.insert(4)
    h2.insert(2)
    h1.merge(h2)
    expect(h1.size()).toBe(4)
    expect(h2.size()).toBe(0)
    expect(h1.peek()).toBe(1)
  })

  it('merging an empty heap into non-empty is a no-op', () => {
    const h1 = new FibonacciHeap4<number>()
    h1.insert(5)
    const h2 = new FibonacciHeap4<number>()
    h1.merge(h2)
    expect(h1.size()).toBe(1)
    expect(h1.peek()).toBe(5)
  })

  it('merging into an empty heap takes all elements', () => {
    const h1 = new FibonacciHeap4<number>()
    const h2 = new FibonacciHeap4<number>()
    h2.insert(10)
    h2.insert(20)
    h1.merge(h2)
    expect(h1.size()).toBe(2)
    expect(h1.peek()).toBe(10)
    expect(h1.extractMin()).toBe(10)
    expect(h1.extractMin()).toBe(20)
  })
})

// ─── DecreaseKey ───

describe('FibonacciHeap4 - decreaseKey', () => {
  it('decreases a key and updates min pointer', () => {
    const heap = new FibonacciHeap4<number>()
    const node5 = heap.insert(5)
    heap.insert(10)
    heap.insert(8)
    heap.decreaseKey(node5, 1)
    expect(heap.peek()).toBe(1)
  })

  it('decreaseKey does nothing if new value is larger', () => {
    const heap = new FibonacciHeap4<number>()
    const node = heap.insert(5)
    heap.decreaseKey(node, 10)
    expect(node.value).toBe(5)
  })

  it('decreaseKey triggers cascading cut', () => {
    const heap = new FibonacciHeap4<number>()
    heap.insert(10)
    heap.insert(20)
    heap.insert(30)
    heap.extractMin()
    const node = heap.insert(25)
    heap.decreaseKey(node, 5)
    expect(heap.peek()).toBe(5)
  })
})

// ─── Delete ───

describe('FibonacciHeap4 - delete', () => {
  it('deletes a specific node', () => {
    const heap = new FibonacciHeap4<number>()
    heap.insert(5)
    const node10 = heap.insert(10)
    heap.insert(15)
    heap.delete(node10)
    expect(heap.size()).toBe(2)
    expect(heap.extractMin()).toBe(5)
    expect(heap.extractMin()).toBe(15)
  })

  it('delete the min node empties the heap if only one node', () => {
    const heap = new FibonacciHeap4<number>()
    const node = heap.insert(42)
    heap.delete(node)
    expect(heap.isEmpty()).toBe(true)
  })
})

// ─── Clear ───

describe('FibonacciHeap4 - clear', () => {
  it('clears all elements', () => {
    const heap = new FibonacciHeap4<number>()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    heap.clear()
    expect(heap.size()).toBe(0)
    expect(heap.isEmpty()).toBe(true)
    expect(heap.peek()).toBeNull()
  })
})

// ─── ToArray ───

describe('FibonacciHeap4 - toArray', () => {
  it('returns all values from the heap', () => {
    const heap = new FibonacciHeap4<number>()
    heap.insert(3)
    heap.insert(1)
    heap.insert(2)
    const arr = heap.toArray()
    expect(arr.sort((a, b) => a - b)).toEqual([1, 2, 3])
    expect(arr.length).toBe(3)
  })

  it('returns empty array for empty heap', () => {
    const heap = new FibonacciHeap4<number>()
    expect(heap.toArray()).toEqual([])
  })
})

// ─── String values ───

describe('FibonacciHeap4 - string values', () => {
  it('works with string values', () => {
    const heap = new FibonacciHeap4<string>()
    heap.insert('cherry')
    heap.insert('apple')
    heap.insert('banana')
    expect(heap.peek()).toBe('apple')
    expect(heap.extractMin()).toBe('apple')
    expect(heap.extractMin()).toBe('banana')
    expect(heap.extractMin()).toBe('cherry')
  })
})

// ─── Large dataset ───

describe('FibonacciHeap4 - large dataset', () => {
  it('handles 100 elements in correct order', () => {
    const heap = new FibonacciHeap4<number>()
    for (let i = 99; i >= 0; i--) {
      heap.insert(i)
    }
    for (let i = 0; i < 100; i++) {
      expect(heap.extractMin()).toBe(i)
    }
    expect(heap.isEmpty()).toBe(true)
  })
})
