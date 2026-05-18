import { beforeEach, describe, expect, it } from 'vitest'

import { BinaryHeap } from '../src/utils/binary-heap.js'

// ─── constructor ───────────────────────────────────────
describe('constructor', () => {
  it('creates a min-heap by default', () => {
    const h = new BinaryHeap<number>()
    h.push(3)
    h.push(1)
    h.push(2)
    expect(h.pop()).toBe(1)
  })

  it('creates a max-heap when type is max', () => {
    const h = new BinaryHeap<number>({ type: 'max' })
    h.push(1)
    h.push(3)
    h.push(2)
    expect(h.pop()).toBe(3)
  })

  it('accepts a custom comparator', () => {
    const h = new BinaryHeap<{ name: string }>({
      comparator: (a, b) => a.name.localeCompare(b.name),
    })
    h.push({ name: 'charlie' })
    h.push({ name: 'alice' })
    expect(h.pop()?.name).toBe('alice')
  })
})

// ─── push ──────────────────────────────────────────────
describe('push', () => {
  it('adds elements and increments size', () => {
    const h = new BinaryHeap<number>()
    expect(h.size).toBe(0)
    h.push(10)
    expect(h.size).toBe(1)
    h.push(20)
    expect(h.size).toBe(2)
  })
})

// ─── pop ───────────────────────────────────────────────
describe('pop', () => {
  it('returns the minimum for a min-heap', () => {
    const h = new BinaryHeap<number>()
    h.push(5)
    h.push(1)
    h.push(3)
    expect(h.pop()).toBe(1)
  })

  it('returns the maximum for a max-heap', () => {
    const h = new BinaryHeap<number>({ type: 'max' })
    h.push(5)
    h.push(9)
    h.push(3)
    expect(h.pop()).toBe(9)
  })

  it('returns undefined when empty', () => {
    const h = new BinaryHeap<number>()
    expect(h.pop()).toBeUndefined()
  })
})

// ─── peek ──────────────────────────────────────────────
describe('peek', () => {
  it('returns the root without removing it', () => {
    const h = new BinaryHeap<number>()
    h.push(5)
    h.push(2)
    h.push(8)
    expect(h.peek()).toBe(2)
    expect(h.size).toBe(3)
  })

  it('returns undefined when empty', () => {
    const h = new BinaryHeap<number>()
    expect(h.peek()).toBeUndefined()
  })
})

// ─── heap property ─────────────────────────────────────
describe('heap property', () => {
  it('pops all elements in ascending order for min-heap', () => {
    const h = new BinaryHeap<number>()
    const values = Array.from({ length: 20 }, () => Math.floor(Math.random() * 1000))
    for (const v of values) h.push(v)
    const sorted: number[] = []
    while (!h.isEmpty()) sorted.push(h.pop()!)
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i]!).toBeGreaterThanOrEqual(sorted[i - 1]!)
    }
  })

  it('pops all elements in descending order for max-heap', () => {
    const h = new BinaryHeap<number>({ type: 'max' })
    const values = Array.from({ length: 20 }, () => Math.floor(Math.random() * 1000))
    for (const v of values) h.push(v)
    const sorted: number[] = []
    while (!h.isEmpty()) sorted.push(h.pop()!)
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i]!).toBeLessThanOrEqual(sorted[i - 1]!)
    }
  })
})

// ─── isEmpty ───────────────────────────────────────────
describe('isEmpty', () => {
  let h: BinaryHeap<number>
  beforeEach(() => {
    h = new BinaryHeap<number>()
  })

  it('is true on a new heap', () => {
    expect(h.isEmpty()).toBe(true)
  })

  it('is false after push', () => {
    h.push(1)
    expect(h.isEmpty()).toBe(false)
  })

  it('is true after popping the last element', () => {
    h.push(1)
    h.pop()
    expect(h.isEmpty()).toBe(true)
  })
})

// ─── clear ─────────────────────────────────────────────
describe('clear', () => {
  it('empties the heap', () => {
    const h = new BinaryHeap<number>()
    h.push(1)
    h.push(2)
    h.push(3)
    h.clear()
    expect(h.size).toBe(0)
    expect(h.isEmpty()).toBe(true)
    expect(h.pop()).toBeUndefined()
  })
})

// ─── toArray ───────────────────────────────────────────
describe('toArray', () => {
  it('returns all elements', () => {
    const h = new BinaryHeap<number>()
    h.push(10)
    h.push(20)
    h.push(30)
    const arr = h.toArray()
    expect(arr).toHaveLength(3)
    expect(arr.sort((a, b) => a - b)).toEqual([10, 20, 30])
  })

  it('does not mutate the heap', () => {
    const h = new BinaryHeap<number>()
    h.push(1)
    h.push(2)
    const arr = h.toArray()
    arr.length = 0
    expect(h.size).toBe(2)
  })
})

// ─── fromArray ─────────────────────────────────────────
describe('fromArray', () => {
  it('builds a min-heap from unsorted array', () => {
    const h = BinaryHeap.fromArray([7, 3, 9, 1, 5])
    expect(h.pop()).toBe(1)
    expect(h.pop()).toBe(3)
    expect(h.pop()).toBe(5)
    expect(h.pop()).toBe(7)
    expect(h.pop()).toBe(9)
  })

  it('builds a max-heap from unsorted array', () => {
    const h = BinaryHeap.fromArray([4, 8, 2, 6], { type: 'max' })
    const result: number[] = []
    while (!h.isEmpty()) result.push(h.pop()!)
    expect(result).toEqual([8, 6, 4, 2])
  })
})

// ─── duplicate values ──────────────────────────────────
describe('duplicate values', () => {
  it('handles duplicates correctly', () => {
    const h = new BinaryHeap<number>()
    h.push(5)
    h.push(5)
    h.push(5)
    expect(h.pop()).toBe(5)
    expect(h.pop()).toBe(5)
    expect(h.pop()).toBe(5)
    expect(h.isEmpty()).toBe(true)
  })
})

// ─── custom comparator ─────────────────────────────────
describe('custom comparator', () => {
  it('orders objects by priority field', () => {
    const h = new BinaryHeap<{ priority: number; label: string }>({
      comparator: (a, b) => a.priority - b.priority,
    })
    h.push({ priority: 3, label: 'low' })
    h.push({ priority: 1, label: 'high' })
    h.push({ priority: 2, label: 'medium' })
    expect(h.pop()?.label).toBe('high')
    expect(h.pop()?.label).toBe('medium')
    expect(h.pop()?.label).toBe('low')
  })

  it('supports max-heap via inverted comparator', () => {
    const h = new BinaryHeap<{ priority: number }>({
      comparator: (a, b) => b.priority - a.priority,
    })
    h.push({ priority: 1 })
    h.push({ priority: 5 })
    h.push({ priority: 3 })
    expect(h.pop()?.priority).toBe(5)
  })
})

// ─── single element ────────────────────────────────────
describe('single element', () => {
  it('handles push, peek, and pop', () => {
    const h = new BinaryHeap<number>()
    h.push(42)
    expect(h.peek()).toBe(42)
    expect(h.pop()).toBe(42)
    expect(h.isEmpty()).toBe(true)
    expect(h.pop()).toBeUndefined()
  })
})

// ─── large heap ────────────────────────────────────────
describe('large heap', () => {
  it('pushes 1000 elements and pops all in order', () => {
    const h = new BinaryHeap<number>()
    for (let i = 0; i < 1000; i++) h.push(Math.floor(Math.random() * 10000))
    let prev = h.pop()!
    while (!h.isEmpty()) {
      const curr = h.pop()!
      expect(curr).toBeGreaterThanOrEqual(prev)
      prev = curr
    }
  })
})
