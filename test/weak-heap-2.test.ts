import { describe, expect, it } from 'vitest'

import { WeakHeap2 } from '../src/core/weak-heap-2/index.js'

// ─── Construction ────────────────────────────────────────
describe('WeakHeap2 construction', () => {
  it('creates empty heap', () => {
    const heap = new WeakHeap2<number>()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
  })

  it('creates with custom comparator', () => {
    const heap = new WeakHeap2<number>((a, b) => b - a)
    expect(heap.size).toBe(0)
  })

  it('creates with custom capacity', () => {
    const heap = new WeakHeap2<number>(undefined, { capacity: 4 })
    expect(heap.isEmpty()).toBe(true)
  })
})

// ─── Insert ──────────────────────────────────────────────
describe('WeakHeap2 insert', () => {
  it('inserts and maintains heap property', () => {
    const heap = new WeakHeap2<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    expect(heap.peek()).toBe(3)
    expect(heap.size).toBe(3)
  })

  it('returns a node with id', () => {
    const heap = new WeakHeap2<number>()
    const node = heap.insert(5)
    expect(node.value).toBe(5)
    expect(node.id).toBe(0)
  })

  it('auto-resizes when exceeding capacity', () => {
    const heap = new WeakHeap2<number>(undefined, { capacity: 2 })
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    expect(heap.size).toBe(3)
    expect(heap.peek()).toBe(1)
  })
})

// ─── ExtractMin ──────────────────────────────────────────
describe('WeakHeap2 extractMin', () => {
  it('extracts in sorted order', () => {
    const heap = new WeakHeap2<number>()
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
    const heap = new WeakHeap2<number>()
    expect(heap.extractMin()).toBeUndefined()
  })

  it('handles single element', () => {
    const heap = new WeakHeap2<number>()
    heap.insert(42)
    expect(heap.extractMin()).toBe(42)
    expect(heap.isEmpty()).toBe(true)
  })
})

// ─── Peek ────────────────────────────────────────────────
describe('WeakHeap2 peek', () => {
  it('returns min without removing', () => {
    const heap = new WeakHeap2<number>()
    heap.insert(5)
    heap.insert(3)
    expect(heap.peek()).toBe(3)
    expect(heap.size).toBe(2)
  })

  it('returns undefined for empty heap', () => {
    const heap = new WeakHeap2<number>()
    expect(heap.peek()).toBeUndefined()
  })
})

// ─── DecreaseKey ─────────────────────────────────────────
describe('WeakHeap2 decreaseKey', () => {
  it('decreases key and re-heapifies', () => {
    const heap = new WeakHeap2<number>()
    const node5 = heap.insert(5)
    heap.insert(3)
    heap.decreaseKey(node5, 1)
    expect(heap.peek()).toBe(1)
  })

  it('does nothing if new value is not smaller', () => {
    const heap = new WeakHeap2<number>()
    const node = heap.insert(3)
    heap.insert(5)
    heap.decreaseKey(node, 10)
    expect(heap.peek()).toBe(3)
  })
})

// ─── Merge ───────────────────────────────────────────────
describe('WeakHeap2 merge', () => {
  it('merges two heaps', () => {
    const heap1 = new WeakHeap2<number>()
    heap1.insert(3)
    heap1.insert(7)

    const heap2 = new WeakHeap2<number>()
    heap2.insert(1)
    heap2.insert(5)

    heap1.merge(heap2)
    expect(heap1.size).toBe(4)
    expect(heap1.extractMin()).toBe(1)
    expect(heap1.extractMin()).toBe(3)
    expect(heap1.extractMin()).toBe(5)
    expect(heap1.extractMin()).toBe(7)
  })
})

// ─── Clear ───────────────────────────────────────────────
describe('WeakHeap2 clear', () => {
  it('clears the heap', () => {
    const heap = new WeakHeap2<number>()
    heap.insert(1)
    heap.insert(2)
    heap.clear()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
  })
})

// ─── toArray ─────────────────────────────────────────────
describe('WeakHeap2 toArray', () => {
  it('returns all elements', () => {
    const heap = new WeakHeap2<number>()
    heap.insert(3)
    heap.insert(1)
    heap.insert(2)
    const arr = heap.toArray()
    expect(arr).toHaveLength(3)
    expect(arr.sort((a, b) => a - b)).toEqual([1, 2, 3])
  })
})

// ─── forEach ─────────────────────────────────────────────
describe('WeakHeap2 forEach', () => {
  it('iterates all elements', () => {
    const heap = new WeakHeap2<number>()
    heap.insert(10)
    heap.insert(20)
    heap.insert(30)
    const result: number[] = []
    heap.forEach((v) => result.push(v))
    expect(result).toHaveLength(3)
    expect(result.sort((a, b) => a - b)).toEqual([10, 20, 30])
  })
})

// ─── Custom comparator ──────────────────────────────────
describe('WeakHeap2 custom comparator (max-heap)', () => {
  it('behaves as max-heap with reverse comparator', () => {
    const heap = new WeakHeap2<number>((a, b) => b - a)
    heap.insert(3)
    heap.insert(1)
    heap.insert(5)
    expect(heap.peek()).toBe(5)
    expect(heap.extractMin()).toBe(5)
    expect(heap.extractMin()).toBe(3)
    expect(heap.extractMin()).toBe(1)
  })
})
