import { describe, it, expect } from 'vitest'
import { HalvingHeap } from '../src/core/halving-heap/index.js'
import type { HalvingHeapOptions } from '../src/core/halving-heap/index.js'

// ─── Construction ───

describe('HalvingHeap - Construction', () => {
  it('creates empty heap', () => {
    const heap = new HalvingHeap<number>()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
  })

  it('accepts options with capacity', () => {
    const heap = new HalvingHeap<number>({ capacity: 10 })
    expect(heap.size).toBe(0)
  })

  it('accepts custom comparator', () => {
    const heap = new HalvingHeap<number>({
      comparator: (a, b) => b - a,
    })
    heap.insert(1)
    heap.insert(3)
    heap.insert(2)
    expect(heap.peek()).toBe(3)
  })
})

// ─── Insert ───

describe('HalvingHeap - Insert', () => {
  it('inserts single element', () => {
    const heap = new HalvingHeap<number>()
    heap.insert(42)
    expect(heap.size).toBe(1)
    expect(heap.isEmpty()).toBe(false)
  })

  it('inserts multiple elements', () => {
    const heap = new HalvingHeap<number>()
    heap.insert(3)
    heap.insert(1)
    heap.insert(2)
    expect(heap.size).toBe(3)
  })
})

// ─── Peek ───

describe('HalvingHeap - Peek', () => {
  it('returns undefined for empty heap', () => {
    const heap = new HalvingHeap<number>()
    expect(heap.peek()).toBeUndefined()
  })

  it('returns minimum element', () => {
    const heap = new HalvingHeap<number>()
    heap.insert(5)
    heap.insert(2)
    heap.insert(8)
    expect(heap.peek()).toBe(2)
  })

  it('does not remove element', () => {
    const heap = new HalvingHeap<number>()
    heap.insert(1)
    heap.peek()
    expect(heap.size).toBe(1)
  })
})

// ─── ExtractMin ───

describe('HalvingHeap - ExtractMin', () => {
  it('returns undefined for empty heap', () => {
    const heap = new HalvingHeap<number>()
    expect(heap.extractMin()).toBeUndefined()
  })

  it('extracts minimum element', () => {
    const heap = new HalvingHeap<number>()
    heap.insert(3)
    heap.insert(1)
    heap.insert(2)
    expect(heap.extractMin()).toBe(1)
    expect(heap.size).toBe(2)
  })

  it('extracts all elements in sorted order', () => {
    const heap = new HalvingHeap<number>()
    const values = [5, 3, 8, 1, 9, 2, 7]
    for (const v of values) heap.insert(v)
    const sorted: number[] = []
    while (!heap.isEmpty()) {
      sorted.push(heap.extractMin()!)
    }
    expect(sorted).toEqual([1, 2, 3, 5, 7, 8, 9])
  })

  it('handles single element', () => {
    const heap = new HalvingHeap<number>()
    heap.insert(42)
    expect(heap.extractMin()).toBe(42)
    expect(heap.isEmpty()).toBe(true)
  })
})

// ─── Meld ───

describe('HalvingHeap - Meld', () => {
  it('merges two heaps', () => {
    const a = new HalvingHeap<number>()
    a.insert(1)
    a.insert(3)
    const b = new HalvingHeap<number>()
    b.insert(2)
    b.insert(4)
    a.meld(b)
    expect(a.size).toBe(4)
    expect(b.size).toBe(0)
    expect(b.isEmpty()).toBe(true)
  })

  it('merged heap extracts in order', () => {
    const a = new HalvingHeap<number>()
    a.insert(1)
    a.insert(5)
    const b = new HalvingHeap<number>()
    b.insert(2)
    b.insert(3)
    a.meld(b)
    expect(a.extractMin()).toBe(1)
    expect(a.extractMin()).toBe(2)
    expect(a.extractMin()).toBe(3)
    expect(a.extractMin()).toBe(5)
  })
})

// ─── ToArray ───

describe('HalvingHeap - ToArray', () => {
  it('returns sorted array', () => {
    const heap = new HalvingHeap<number>()
    heap.insert(3)
    heap.insert(1)
    heap.insert(2)
    expect(heap.toArray()).toEqual([1, 2, 3])
  })

  it('returns empty array for empty heap', () => {
    const heap = new HalvingHeap<number>()
    expect(heap.toArray()).toEqual([])
  })
})

// ─── ForEach ───

describe('HalvingHeap - ForEach', () => {
  it('iterates over sorted values', () => {
    const heap = new HalvingHeap<number>()
    heap.insert(2)
    heap.insert(1)
    heap.insert(3)
    const collected: number[] = []
    heap.forEach((v) => collected.push(v))
    expect(collected).toEqual([1, 2, 3])
  })
})

// ─── Clear ───

describe('HalvingHeap - Clear', () => {
  it('removes all elements', () => {
    const heap = new HalvingHeap<number>()
    heap.insert(1)
    heap.insert(2)
    heap.clear()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
  })
})

// ─── Strings ───

describe('HalvingHeap - String values', () => {
  it('works with string comparator', () => {
    const heap = new HalvingHeap<string>()
    heap.insert('cherry')
    heap.insert('apple')
    heap.insert('banana')
    expect(heap.extractMin()).toBe('apple')
    expect(heap.extractMin()).toBe('banana')
    expect(heap.extractMin()).toBe('cherry')
  })
})

// ─── Stress ───

describe('HalvingHeap - Stress', () => {
  it('handles many insertions and extractions', () => {
    const heap = new HalvingHeap<number>()
    const count = 100
    for (let i = count; i > 0; i--) {
      heap.insert(i)
    }
    expect(heap.size).toBe(count)
    for (let i = 1; i <= count; i++) {
      expect(heap.extractMin()).toBe(i)
    }
    expect(heap.isEmpty()).toBe(true)
  })
})
