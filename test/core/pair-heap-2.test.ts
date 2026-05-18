import { describe, expect, it } from 'vitest'
import { PairHeap2 } from '../../src/core/pair-heap-2/index.js'

// ─── Constructor ───

describe('PairHeap2 constructor', () => {
  it('creates an empty heap with default comparator', () => {
    const heap = new PairHeap2<number>()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
    expect(heap.peek()).toBeNull()
  })

  it('creates a heap with a custom comparator (max-heap)', () => {
    const heap = new PairHeap2<number>((a, b) => b - a)
    heap.insert(1)
    heap.insert(3)
    heap.insert(2)
    expect(heap.peek()).toBe(3)
  })
})

// ─── Insert ───

describe('PairHeap2 insert', () => {
  it('inserts a single element', () => {
    const heap = new PairHeap2<number>()
    const node = heap.insert(5)
    expect(heap.size).toBe(1)
    expect(heap.isEmpty()).toBe(false)
    expect(heap.peek()).toBe(5)
    expect(node.value).toBe(5)
  })

  it('inserts multiple elements and maintains min', () => {
    const heap = new PairHeap2<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.insert(1)
    expect(heap.size).toBe(4)
    expect(heap.peek()).toBe(1)
  })

  it('handles duplicate values', () => {
    const heap = new PairHeap2<number>()
    heap.insert(3)
    heap.insert(3)
    heap.insert(3)
    expect(heap.size).toBe(3)
    expect(heap.peek()).toBe(3)
  })

  it('handles negative values', () => {
    const heap = new PairHeap2<number>()
    heap.insert(-5)
    heap.insert(3)
    heap.insert(-10)
    expect(heap.peek()).toBe(-10)
  })
})

// ─── ExtractMin ───

describe('PairHeap2 extractMin', () => {
  it('extracts elements in sorted order', () => {
    const heap = new PairHeap2<number>()
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
  })

  it('returns null on empty heap', () => {
    const heap = new PairHeap2<number>()
    expect(heap.extractMin()).toBeNull()
  })

  it('updates size after extraction', () => {
    const heap = new PairHeap2<number>()
    heap.insert(1)
    heap.insert(2)
    heap.extractMin()
    expect(heap.size).toBe(1)
    heap.extractMin()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
  })

  it('handles single element extraction', () => {
    const heap = new PairHeap2<number>()
    heap.insert(42)
    expect(heap.extractMin()).toBe(42)
    expect(heap.isEmpty()).toBe(true)
    expect(heap.peek()).toBeNull()
  })
})

// ─── Peek ───

describe('PairHeap2 peek', () => {
  it('returns min without removing', () => {
    const heap = new PairHeap2<number>()
    heap.insert(3)
    heap.insert(1)
    heap.insert(2)
    expect(heap.peek()).toBe(1)
    expect(heap.peek()).toBe(1)
    expect(heap.size).toBe(3)
  })

  it('returns null on empty heap', () => {
    const heap = new PairHeap2<number>()
    expect(heap.peek()).toBeNull()
  })
})

// ─── Merge ───

describe('PairHeap2 merge', () => {
  it('merges two heaps', () => {
    const heap1 = new PairHeap2<number>()
    heap1.insert(1)
    heap1.insert(4)
    const heap2 = new PairHeap2<number>()
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
    const heap1 = new PairHeap2<number>()
    const heap2 = new PairHeap2<number>()
    heap2.insert(5)
    heap2.insert(3)
    heap1.merge(heap2)
    expect(heap1.size).toBe(2)
    expect(heap1.extractMin()).toBe(3)
    expect(heap1.extractMin()).toBe(5)
  })

  it('merges empty heap into non-empty', () => {
    const heap1 = new PairHeap2<number>()
    heap1.insert(1)
    const heap2 = new PairHeap2<number>()
    heap1.merge(heap2)
    expect(heap1.size).toBe(1)
    expect(heap1.peek()).toBe(1)
  })
})

// ─── DecreaseKey ───

describe('PairHeap2 decreaseKey', () => {
  it('decreases key of a node', () => {
    const heap = new PairHeap2<number>()
    heap.insert(5)
    const node = heap.insert(10)
    heap.insert(3)
    heap.decreaseKey(node, 1)
    expect(heap.peek()).toBe(1)
  })

  it('throws when increasing value', () => {
    const heap = new PairHeap2<number>()
    const node = heap.insert(5)
    expect(() => heap.decreaseKey(node, 10)).toThrow(
      'New value must be less than or equal to current value'
    )
  })

  it('allows decreasing to same value', () => {
    const heap = new PairHeap2<number>()
    const node = heap.insert(5)
    heap.decreaseKey(node, 5)
    expect(heap.size).toBe(1)
    expect(heap.peek()).toBe(5)
  })
})

// ─── Delete ───

describe('PairHeap2 delete', () => {
  it('deletes the root node (same as extractMin)', () => {
    const heap = new PairHeap2<number>()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    const root = heap.peek()
    expect(root).toBe(1)
  })

  it('deletes a non-root node', () => {
    const heap = new PairHeap2<number>()
    heap.insert(5)
    const node = heap.insert(10)
    heap.insert(3)
    heap.delete(node)
    expect(heap.size).toBe(2)
    expect(heap.extractMin()).toBe(3)
    expect(heap.extractMin()).toBe(5)
  })
})

// ─── Clear ───

describe('PairHeap2 clear', () => {
  it('clears the heap', () => {
    const heap = new PairHeap2<number>()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    heap.clear()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
    expect(heap.peek()).toBeNull()
  })
})

// ─── ToArray ───

describe('PairHeap2 toArray', () => {
  it('returns sorted array', () => {
    const heap = new PairHeap2<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(1)
    heap.insert(4)
    heap.insert(2)
    expect(heap.toArray()).toEqual([1, 2, 3, 4, 5])
  })

  it('returns empty array for empty heap', () => {
    const heap = new PairHeap2<number>()
    expect(heap.toArray()).toEqual([])
  })

  it('preserves heap state after toArray', () => {
    const heap = new PairHeap2<number>()
    heap.insert(3)
    heap.insert(1)
    heap.insert(2)
    heap.toArray()
    expect(heap.size).toBe(3)
    expect(heap.peek()).toBe(1)
  })
})

// ─── String values ───

describe('PairHeap2 with strings', () => {
  it('works with string values', () => {
    const heap = new PairHeap2<string>()
    heap.insert('cherry')
    heap.insert('apple')
    heap.insert('banana')
    expect(heap.extractMin()).toBe('apple')
    expect(heap.extractMin()).toBe('banana')
    expect(heap.extractMin()).toBe('cherry')
  })
})
