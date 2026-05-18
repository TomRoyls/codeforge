import { describe, expect, it } from 'vitest'
import { PagodaHeap2 } from '../../src/core/pagoda-heap-2/index.js'

// ─── Constructor ───

describe('PagodaHeap2 constructor', () => {
  it('creates an empty heap with default comparator', () => {
    const heap = new PagodaHeap2<number>()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
    expect(heap.peek()).toBeUndefined()
  })

  it('creates a heap with a custom comparator (max-heap)', () => {
    const heap = new PagodaHeap2<number>((a, b) => b - a)
    heap.insert(1)
    heap.insert(3)
    heap.insert(2)
    expect(heap.peek()).toBe(3)
  })
})

// ─── Insert ───

describe('PagodaHeap2 insert', () => {
  it('inserts a single element', () => {
    const heap = new PagodaHeap2<number>()
    heap.insert(5)
    expect(heap.size).toBe(1)
    expect(heap.isEmpty()).toBe(false)
    expect(heap.peek()).toBe(5)
  })

  it('inserts multiple elements and maintains min', () => {
    const heap = new PagodaHeap2<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.insert(1)
    expect(heap.size).toBe(4)
    expect(heap.peek()).toBe(1)
  })

  it('handles duplicate values', () => {
    const heap = new PagodaHeap2<number>()
    heap.insert(3)
    heap.insert(3)
    heap.insert(3)
    expect(heap.size).toBe(3)
    expect(heap.peek()).toBe(3)
  })

  it('handles negative values', () => {
    const heap = new PagodaHeap2<number>()
    heap.insert(-5)
    heap.insert(3)
    heap.insert(-10)
    expect(heap.peek()).toBe(-10)
  })
})

// ─── ExtractMin ───

describe('PagodaHeap2 extractMin', () => {
  it('extracts elements in sorted order', () => {
    const heap = new PagodaHeap2<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(1)
    heap.insert(4)
    heap.insert(2)
    expect(heap.extractMin()).toBe(1)
    expect(heap.extractMin()).toBe(2)
    expect(heap.extractMin()).toBe(3)
    expect(heap.extractMin()).toBe(4)
    expect(heap.extractMin()).toBe(5)
    expect(heap.extractMin()).toBeUndefined()
  })

  it('returns undefined on empty heap', () => {
    const heap = new PagodaHeap2<number>()
    expect(heap.extractMin()).toBeUndefined()
  })

  it('updates size after extraction', () => {
    const heap = new PagodaHeap2<number>()
    heap.insert(1)
    heap.insert(2)
    heap.extractMin()
    expect(heap.size).toBe(1)
    heap.extractMin()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
  })

  it('handles single element extraction', () => {
    const heap = new PagodaHeap2<number>()
    heap.insert(42)
    expect(heap.extractMin()).toBe(42)
    expect(heap.isEmpty()).toBe(true)
    expect(heap.peek()).toBeUndefined()
  })
})

// ─── Peek ───

describe('PagodaHeap2 peek', () => {
  it('returns min without removing', () => {
    const heap = new PagodaHeap2<number>()
    heap.insert(3)
    heap.insert(1)
    heap.insert(2)
    expect(heap.peek()).toBe(1)
    expect(heap.peek()).toBe(1)
    expect(heap.size).toBe(3)
  })

  it('returns undefined on empty heap', () => {
    const heap = new PagodaHeap2<number>()
    expect(heap.peek()).toBeUndefined()
  })
})

// ─── Merge ───

describe('PagodaHeap2 merge', () => {
  it('merges two heaps', () => {
    const heap1 = new PagodaHeap2<number>()
    heap1.insert(1)
    heap1.insert(4)
    const heap2 = new PagodaHeap2<number>()
    heap2.insert(2)
    heap2.insert(3)
    heap1.merge(heap2)
    expect(heap1.size).toBe(4)
    expect(heap2.size).toBe(0)
    expect(heap2.isEmpty()).toBe(true)
    expect(heap1.extractMin()).toBe(1)
    expect(heap1.extractMin()).toBe(2)
    expect(heap1.extractMin()).toBe(3)
    expect(heap1.extractMin()).toBe(4)
  })

  it('merges into empty heap', () => {
    const heap1 = new PagodaHeap2<number>()
    const heap2 = new PagodaHeap2<number>()
    heap2.insert(5)
    heap2.insert(3)
    heap1.merge(heap2)
    expect(heap1.size).toBe(2)
    expect(heap1.extractMin()).toBe(3)
    expect(heap1.extractMin()).toBe(5)
  })

  it('merges empty heap into non-empty', () => {
    const heap1 = new PagodaHeap2<number>()
    heap1.insert(1)
    const heap2 = new PagodaHeap2<number>()
    heap1.merge(heap2)
    expect(heap1.size).toBe(1)
    expect(heap1.peek()).toBe(1)
  })

  it('merges two empty heaps', () => {
    const heap1 = new PagodaHeap2<number>()
    const heap2 = new PagodaHeap2<number>()
    heap1.merge(heap2)
    expect(heap1.size).toBe(0)
    expect(heap1.isEmpty()).toBe(true)
  })

  it('no-op when merging with itself', () => {
    const heap = new PagodaHeap2<number>()
    heap.insert(1)
    heap.insert(2)
    heap.merge(heap)
    expect(heap.size).toBe(2)
  })
})

// ─── Clear ───

describe('PagodaHeap2 clear', () => {
  it('clears the heap', () => {
    const heap = new PagodaHeap2<number>()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    heap.clear()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
    expect(heap.peek()).toBeUndefined()
  })
})

// ─── ToArray ───

describe('PagodaHeap2 toArray', () => {
  it('returns all values from the heap', () => {
    const heap = new PagodaHeap2<number>()
    heap.insert(3)
    heap.insert(1)
    heap.insert(2)
    const arr = heap.toArray()
    expect(arr.length).toBe(3)
    expect(arr).toContain(1)
    expect(arr).toContain(2)
    expect(arr).toContain(3)
  })

  it('returns empty array for empty heap', () => {
    const heap = new PagodaHeap2<number>()
    expect(heap.toArray()).toEqual([])
  })
})

// ─── FromArray ───

describe('PagodaHeap2 fromArray', () => {
  it('creates heap from array', () => {
    const heap = PagodaHeap2.fromArray([5, 3, 1, 4, 2])
    expect(heap.size).toBe(5)
    expect(heap.extractMin()).toBe(1)
    expect(heap.extractMin()).toBe(2)
    expect(heap.extractMin()).toBe(3)
    expect(heap.extractMin()).toBe(4)
    expect(heap.extractMin()).toBe(5)
  })

  it('creates heap from empty array', () => {
    const heap = PagodaHeap2.fromArray([])
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
  })

  it('creates heap with custom comparator', () => {
    const heap = PagodaHeap2.fromArray([1, 2, 3], (a, b) => b - a)
    expect(heap.peek()).toBe(3)
  })
})

// ─── String values ───

describe('PagodaHeap2 with strings', () => {
  it('works with string values', () => {
    const heap = new PagodaHeap2<string>()
    heap.insert('cherry')
    heap.insert('apple')
    heap.insert('banana')
    expect(heap.extractMin()).toBe('apple')
    expect(heap.extractMin()).toBe('banana')
    expect(heap.extractMin()).toBe('cherry')
  })
})
