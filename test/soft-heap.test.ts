import { describe, expect, it } from 'vitest'

import { SoftHeap } from '../src/core/soft-heap/index.js'

// ─── Construction ──────────────────────────────────────
describe('SoftHeap construction', () => {
  it('creates empty heap with defaults', () => {
    const heap = new SoftHeap<number>()
    expect(heap.size()).toBe(0)
    expect(heap.isEmpty()).toBe(true)
  })

  it('creates heap with custom error rate', () => {
    const heap = new SoftHeap<number>({ errorRate: 0.1 })
    expect(heap.errorRate).toBe(0.1)
  })

  it('creates heap with custom comparator', () => {
    const heap = new SoftHeap<string>({
      comparator: (a, b) => a.localeCompare(b),
    })
    heap.insert('banana')
    heap.insert('apple')
    expect(heap.peek()).toBe('apple')
  })
})

// ─── Insert & Size ─────────────────────────────────────
describe('SoftHeap insert and size', () => {
  it('inserts elements and increases size', () => {
    const heap = new SoftHeap<number>()
    heap.insert(5)
    expect(heap.size()).toBe(1)
    heap.insert(3)
    expect(heap.size()).toBe(2)
  })

  it('reports isEmpty correctly', () => {
    const heap = new SoftHeap<number>()
    expect(heap.isEmpty()).toBe(true)
    heap.insert(1)
    expect(heap.isEmpty()).toBe(false)
  })
})

// ─── Peek ──────────────────────────────────────────────
describe('SoftHeap peek', () => {
  it('returns undefined on empty heap', () => {
    const heap = new SoftHeap<number>()
    expect(heap.peek()).toBeUndefined()
  })

  it('returns a valid element after inserts', () => {
    const heap = new SoftHeap<number>()
    heap.insert(10)
    heap.insert(20)
    const val = heap.peek()
    expect(typeof val).toBe('number')
    expect([10, 20]).toContain(val)
  })
})

// ─── ExtractMin ────────────────────────────────────────
describe('SoftHeap extractMin', () => {
  it('returns undefined on empty heap', () => {
    const heap = new SoftHeap<number>()
    expect(heap.extractMin()).toBeUndefined()
  })

  it('extracts all inserted elements', () => {
    const heap = new SoftHeap<number>()
    const items = [5, 3, 7, 1, 9]
    for (const n of items) heap.insert(n)

    const extracted: number[] = []
    while (!heap.isEmpty()) {
      extracted.push(heap.extractMin()!)
    }
    expect(extracted.sort((a, b) => a - b)).toEqual([1, 3, 5, 7, 9])
    expect(extracted.length).toBe(5)
  })

  it('decreases size on extract', () => {
    const heap = new SoftHeap<number>()
    heap.insert(1)
    heap.insert(2)
    heap.extractMin()
    expect(heap.size()).toBe(1)
  })
})

// ─── Meld ──────────────────────────────────────────────
describe('SoftHeap meld', () => {
  it('melds two heaps', () => {
    const h1 = new SoftHeap<number>()
    const h2 = new SoftHeap<number>()
    h1.insert(1)
    h1.insert(3)
    h2.insert(2)
    h2.insert(4)
    h1.meld(h2)
    expect(h1.size()).toBe(4)
    expect(h2.size()).toBe(0)
  })

  it('melding with empty heap is no-op', () => {
    const h1 = new SoftHeap<number>()
    h1.insert(1)
    const h2 = new SoftHeap<number>()
    h1.meld(h2)
    expect(h1.size()).toBe(1)
  })
})

// ─── Clear ─────────────────────────────────────────────
describe('SoftHeap clear', () => {
  it('clears the heap', () => {
    const heap = new SoftHeap<number>()
    heap.insert(1)
    heap.insert(2)
    heap.clear()
    expect(heap.size()).toBe(0)
    expect(heap.isEmpty()).toBe(true)
  })
})

// ─── Clone ─────────────────────────────────────────────
describe('SoftHeap clone', () => {
  it('clones the heap', () => {
    const heap = new SoftHeap<number>()
    heap.insert(1)
    heap.insert(2)
    const cloned = heap.clone()
    expect(cloned.size()).toBe(2)
    expect(cloned.errorRate).toBe(heap.errorRate)
    heap.clear()
    expect(cloned.size()).toBe(2)
  })
})

// ─── ToArray ───────────────────────────────────────────
describe('SoftHeap toArray', () => {
  it('returns all elements from empty heap', () => {
    const heap = new SoftHeap<number>()
    expect(heap.toArray()).toEqual([])
  })

  it('returns all inserted elements', () => {
    const heap = new SoftHeap<number>()
    heap.insert(3)
    heap.insert(1)
    heap.insert(2)
    const arr = heap.toArray()
    expect(arr.sort((a, b) => a - b)).toEqual([1, 2, 3])
  })
})

// ─── Error Rate Property ──────────────────────────────
describe('SoftHeap errorRate', () => {
  it('returns the configured error rate', () => {
    const heap = new SoftHeap<number>({ errorRate: 0.05 })
    expect(heap.errorRate).toBe(0.05)
  })
})
