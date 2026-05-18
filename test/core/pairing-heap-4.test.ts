import { describe, it, expect } from 'vitest'
import { PairingHeap4 } from '../../src/core/pairing-heap-4/index.js'

// ─── Constructor & Empty State ───

describe('PairingHeap4 - constructor & empty state', () => {
  it('creates an empty heap with default comparator', () => {
    const heap = new PairingHeap4<number>()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
  })

  it('creates a heap with a custom comparator (max-heap)', () => {
    const heap = new PairingHeap4<number>((a, b) => b - a)
    heap.insert(1)
    heap.insert(3)
    heap.insert(2)
    expect(heap.findMin()).toBe(3)
  })

  it('findMin returns undefined on empty heap', () => {
    const heap = new PairingHeap4<number>()
    expect(heap.findMin()).toBeUndefined()
  })

  it('extractMin returns undefined on empty heap', () => {
    const heap = new PairingHeap4<number>()
    expect(heap.extractMin()).toBeUndefined()
  })
})

// ─── Insert & FindMin ───

describe('PairingHeap4 - insert & findMin', () => {
  it('inserts a single element', () => {
    const heap = new PairingHeap4<number>()
    heap.insert(42)
    expect(heap.size).toBe(1)
    expect(heap.isEmpty()).toBe(false)
    expect(heap.findMin()).toBe(42)
  })

  it('findMin returns the smallest element after multiple inserts', () => {
    const heap = new PairingHeap4<number>()
    heap.insert(5)
    heap.insert(2)
    heap.insert(8)
    heap.insert(1)
    expect(heap.findMin()).toBe(1)
  })

  it('maintains correct size after multiple inserts', () => {
    const heap = new PairingHeap4<number>()
    for (let i = 0; i < 10; i++) {
      heap.insert(i)
    }
    expect(heap.size).toBe(10)
  })
})

// ─── ExtractMin ───

describe('PairingHeap4 - extractMin', () => {
  it('extracts the only element', () => {
    const heap = new PairingHeap4<number>()
    heap.insert(7)
    expect(heap.extractMin()).toBe(7)
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
  })

  it('extracts elements in sorted order', () => {
    const heap = new PairingHeap4<number>()
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

  it('handles duplicate values correctly', () => {
    const heap = new PairingHeap4<number>()
    heap.insert(3)
    heap.insert(3)
    heap.insert(1)
    heap.insert(3)
    expect(heap.extractMin()).toBe(1)
    expect(heap.extractMin()).toBe(3)
    expect(heap.extractMin()).toBe(3)
    expect(heap.extractMin()).toBe(3)
    expect(heap.extractMin()).toBeUndefined()
  })

  it('interleaved insert and extractMin', () => {
    const heap = new PairingHeap4<number>()
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

describe('PairingHeap4 - merge', () => {
  it('merges two non-empty heaps', () => {
    const h1 = new PairingHeap4<number>()
    h1.insert(3)
    h1.insert(1)
    const h2 = new PairingHeap4<number>()
    h2.insert(4)
    h2.insert(2)
    h1.merge(h2)
    expect(h1.size).toBe(4)
    expect(h2.size).toBe(0)
    expect(h1.findMin()).toBe(1)
    expect(h1.extractMin()).toBe(1)
    expect(h1.extractMin()).toBe(2)
    expect(h1.extractMin()).toBe(3)
    expect(h1.extractMin()).toBe(4)
  })

  it('merging an empty heap is a no-op', () => {
    const h1 = new PairingHeap4<number>()
    h1.insert(5)
    const h2 = new PairingHeap4<number>()
    h1.merge(h2)
    expect(h1.size).toBe(1)
    expect(h1.findMin()).toBe(5)
  })

  it('merging into an empty heap takes all elements', () => {
    const h1 = new PairingHeap4<number>()
    const h2 = new PairingHeap4<number>()
    h2.insert(10)
    h2.insert(20)
    h1.merge(h2)
    expect(h1.size).toBe(2)
    expect(h1.findMin()).toBe(10)
    expect(h2.isEmpty()).toBe(true)
  })
})

// ─── Clear ───

describe('PairingHeap4 - clear', () => {
  it('clears all elements', () => {
    const heap = new PairingHeap4<number>()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    heap.clear()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
    expect(heap.findMin()).toBeUndefined()
  })
})

// ─── ToArray ───

describe('PairingHeap4 - toArray', () => {
  it('returns sorted array from heap', () => {
    const heap = new PairingHeap4<number>()
    heap.insert(3)
    heap.insert(1)
    heap.insert(2)
    expect(heap.toArray()).toEqual([1, 2, 3])
  })

  it('does not modify the original heap', () => {
    const heap = new PairingHeap4<number>()
    heap.insert(3)
    heap.insert(1)
    heap.toArray()
    expect(heap.size).toBe(2)
    expect(heap.findMin()).toBe(1)
  })

  it('returns empty array for empty heap', () => {
    const heap = new PairingHeap4<number>()
    expect(heap.toArray()).toEqual([])
  })
})

// ─── Static fromArray ───

describe('PairingHeap4 - static fromArray', () => {
  it('creates a heap from an array', () => {
    const heap = PairingHeap4.fromArray([5, 3, 1, 4, 2])
    expect(heap.size).toBe(5)
    expect(heap.findMin()).toBe(1)
  })

  it('creates a heap from an empty array', () => {
    const heap = PairingHeap4.fromArray<number>([])
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
  })

  it('accepts a custom comparator', () => {
    const heap = PairingHeap4.fromArray([1, 2, 3], (a, b) => b - a)
    expect(heap.findMin()).toBe(3)
  })
})

// ─── String values ───

describe('PairingHeap4 - string values', () => {
  it('works with string values', () => {
    const heap = new PairingHeap4<string>()
    heap.insert('cherry')
    heap.insert('apple')
    heap.insert('banana')
    expect(heap.findMin()).toBe('apple')
    expect(heap.extractMin()).toBe('apple')
    expect(heap.extractMin()).toBe('banana')
    expect(heap.extractMin()).toBe('cherry')
  })
})

// ─── Object values with custom comparator ───

describe('PairingHeap4 - object values', () => {
  it('works with objects using custom comparator', () => {
    interface Item { priority: number; name: string }
    const heap = new PairingHeap4<Item>((a, b) => a.priority - b.priority)
    heap.insert({ priority: 3, name: 'low' })
    heap.insert({ priority: 1, name: 'high' })
    heap.insert({ priority: 2, name: 'medium' })
    const min = heap.findMin()!
    expect(min.name).toBe('high')
    expect(min.priority).toBe(1)
  })
})
