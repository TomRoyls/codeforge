import { describe, it, expect } from 'vitest'
import { TernaryHeap3 } from '../../src/core/ternary-heap-3/index.js'

// ─── Constructor ───

describe('TernaryHeap3 constructor', () => {
  it('creates an empty heap with default comparator', () => {
    const heap = new TernaryHeap3<number>()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
  })

  it('creates a heap with a custom comparator (max-heap)', () => {
    const heap = new TernaryHeap3<number>((a, b) => b - a)
    heap.insert(1)
    heap.insert(3)
    heap.insert(2)
    expect(heap.peek()).toBe(3)
  })

  it('works with string values using default comparator', () => {
    const heap = new TernaryHeap3<string>()
    heap.insert('c')
    heap.insert('a')
    heap.insert('b')
    expect(heap.peek()).toBe('a')
  })
})

// ─── insert ───

describe('TernaryHeap3 insert', () => {
  it('inserts a single element', () => {
    const heap = new TernaryHeap3<number>()
    heap.insert(5)
    expect(heap.size).toBe(1)
    expect(heap.peek()).toBe(5)
  })

  it('maintains min-heap property across multiple inserts', () => {
    const heap = new TernaryHeap3<number>()
    heap.insert(10)
    heap.insert(5)
    heap.insert(15)
    heap.insert(3)
    heap.insert(7)
    expect(heap.peek()).toBe(3)
  })

  it('handles duplicate values', () => {
    const heap = new TernaryHeap3<number>()
    heap.insert(5)
    heap.insert(5)
    heap.insert(5)
    expect(heap.size).toBe(3)
    expect(heap.extractMin()).toBe(5)
    expect(heap.extractMin()).toBe(5)
    expect(heap.extractMin()).toBe(5)
  })

  it('handles negative numbers', () => {
    const heap = new TernaryHeap3<number>()
    heap.insert(-1)
    heap.insert(-5)
    heap.insert(3)
    heap.insert(0)
    expect(heap.peek()).toBe(-5)
  })
})

// ─── extractMin ───

describe('TernaryHeap3 extractMin', () => {
  it('returns undefined on empty heap', () => {
    const heap = new TernaryHeap3<number>()
    expect(heap.extractMin()).toBeUndefined()
  })

  it('returns the single element when only one exists', () => {
    const heap = new TernaryHeap3<number>()
    heap.insert(42)
    expect(heap.extractMin()).toBe(42)
    expect(heap.isEmpty()).toBe(true)
  })

  it('extracts elements in ascending order', () => {
    const heap = new TernaryHeap3<number>()
    const values = [9, 4, 7, 1, 3, 8, 2, 6, 5]
    for (const v of values) heap.insert(v)

    const sorted: number[] = []
    while (!heap.isEmpty()) {
      sorted.push(heap.extractMin()!)
    }
    expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('handles extraction with negative values', () => {
    const heap = new TernaryHeap3<number>()
    heap.insert(-3)
    heap.insert(-1)
    heap.insert(-7)
    heap.insert(0)
    expect(heap.extractMin()).toBe(-7)
    expect(heap.extractMin()).toBe(-3)
    expect(heap.extractMin()).toBe(-1)
    expect(heap.extractMin()).toBe(0)
  })
})

// ─── peek ───

describe('TernaryHeap3 peek', () => {
  it('returns undefined on empty heap', () => {
    const heap = new TernaryHeap3<number>()
    expect(heap.peek()).toBeUndefined()
  })

  it('returns the minimum element without removing it', () => {
    const heap = new TernaryHeap3<number>()
    heap.insert(10)
    heap.insert(5)
    heap.insert(20)
    expect(heap.peek()).toBe(5)
    expect(heap.size).toBe(3)
  })

  it('updates after extraction', () => {
    const heap = new TernaryHeap3<number>()
    heap.insert(3)
    heap.insert(1)
    heap.insert(2)
    heap.extractMin()
    expect(heap.peek()).toBe(2)
  })
})

// ─── size and isEmpty ───

describe('TernaryHeap3 size and isEmpty', () => {
  it('size tracks element count correctly', () => {
    const heap = new TernaryHeap3<number>()
    expect(heap.size).toBe(0)
    heap.insert(1)
    expect(heap.size).toBe(1)
    heap.insert(2)
    expect(heap.size).toBe(2)
    heap.extractMin()
    expect(heap.size).toBe(1)
  })

  it('isEmpty returns correct state after operations', () => {
    const heap = new TernaryHeap3<number>()
    expect(heap.isEmpty()).toBe(true)
    heap.insert(1)
    expect(heap.isEmpty()).toBe(false)
    heap.extractMin()
    expect(heap.isEmpty()).toBe(true)
  })
})

// ─── clear ───

describe('TernaryHeap3 clear', () => {
  it('removes all elements', () => {
    const heap = new TernaryHeap3<number>()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    heap.clear()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
    expect(heap.peek()).toBeUndefined()
  })

  it('allows inserts after clearing', () => {
    const heap = new TernaryHeap3<number>()
    heap.insert(10)
    heap.clear()
    heap.insert(5)
    expect(heap.peek()).toBe(5)
    expect(heap.size).toBe(1)
  })
})

// ─── toArray ───

describe('TernaryHeap3 toArray', () => {
  it('returns empty array for empty heap', () => {
    const heap = new TernaryHeap3<number>()
    expect(heap.toArray()).toEqual([])
  })

  it('returns a copy of the internal array', () => {
    const heap = new TernaryHeap3<number>()
    heap.insert(1)
    heap.insert(2)
    const arr = heap.toArray()
    expect(arr.length).toBe(2)
    arr.push(999)
    expect(heap.size).toBe(2)
  })

  it('contains all inserted elements', () => {
    const heap = new TernaryHeap3<number>()
    const values = [5, 3, 8, 1, 4]
    for (const v of values) heap.insert(v)
    const arr = heap.toArray()
    expect(arr.sort((a, b) => a - b)).toEqual([1, 3, 4, 5, 8])
  })
})

// ─── fromArray ───

describe('TernaryHeap3 fromArray', () => {
  it('creates a heap from an unsorted array', () => {
    const heap = TernaryHeap3.fromArray([5, 3, 8, 1, 4])
    expect(heap.size).toBe(5)
    expect(heap.peek()).toBe(1)
  })

  it('creates a heap from an empty array', () => {
    const heap = TernaryHeap3.fromArray<number>([])
    expect(heap.isEmpty()).toBe(true)
  })

  it('creates a heap from a single-element array', () => {
    const heap = TernaryHeap3.fromArray([42])
    expect(heap.peek()).toBe(42)
    expect(heap.size).toBe(1)
  })

  it('preserves order when extracting all from fromArray', () => {
    const heap = TernaryHeap3.fromArray([9, 4, 7, 1, 3, 8, 2, 6, 5])
    const sorted: number[] = []
    while (!heap.isEmpty()) sorted.push(heap.extractMin()!)
    expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('uses custom comparator in fromArray', () => {
    const heap = TernaryHeap3.fromArray([1, 2, 3, 4, 5], (a, b) => b - a)
    expect(heap.peek()).toBe(5)
  })

  it('does not mutate the original array', () => {
    const original = [5, 3, 1, 4, 2]
    const copy = [...original]
    TernaryHeap3.fromArray(original)
    expect(original).toEqual(copy)
  })

  it('handles arrays with duplicate values', () => {
    const heap = TernaryHeap3.fromArray([3, 1, 3, 2, 1])
    expect(heap.extractMin()).toBe(1)
    expect(heap.extractMin()).toBe(1)
    expect(heap.extractMin()).toBe(2)
    expect(heap.extractMin()).toBe(3)
    expect(heap.extractMin()).toBe(3)
  })
})

// ─── Edge Cases ───

describe('TernaryHeap3 edge cases', () => {
  it('handles large number of elements', () => {
    const heap = new TernaryHeap3<number>()
    const n = 1000
    for (let i = n; i >= 1; i--) heap.insert(i)
    expect(heap.peek()).toBe(1)
    expect(heap.size).toBe(n)
  })

  it('maintains heap property after many insert-extract cycles', () => {
    const heap = new TernaryHeap3<number>()
    heap.insert(10)
    heap.insert(5)
    heap.insert(15)
    expect(heap.extractMin()).toBe(5)
    heap.insert(3)
    heap.insert(20)
    expect(heap.extractMin()).toBe(3)
    expect(heap.extractMin()).toBe(10)
    expect(heap.extractMin()).toBe(15)
    expect(heap.extractMin()).toBe(20)
    expect(heap.extractMin()).toBeUndefined()
  })

  it('handles objects with custom comparator', () => {
    const heap = new TernaryHeap3<{ priority: number }>((a, b) => a.priority - b.priority)
    heap.insert({ priority: 3 })
    heap.insert({ priority: 1 })
    heap.insert({ priority: 2 })
    expect(heap.extractMin()!.priority).toBe(1)
    expect(heap.extractMin()!.priority).toBe(2)
    expect(heap.extractMin()!.priority).toBe(3)
  })
})
