import { beforeEach, describe, expect, it } from 'vitest'

import { MinMaxHeap } from '../../src/utils/min-max-heap.js'

// ─── Empty heap operations ───────────────────────────────
describe('MinMaxHeap - empty heap', () => {
  it('peekMin returns undefined on empty heap', () => {
    const heap = new MinMaxHeap<number>()
    expect(heap.peekMin()).toBeUndefined()
  })

  it('peekMax returns undefined on empty heap', () => {
    const heap = new MinMaxHeap<number>()
    expect(heap.peekMax()).toBeUndefined()
  })

  it('extractMin returns undefined on empty heap', () => {
    const heap = new MinMaxHeap<number>()
    expect(heap.extractMin()).toBeUndefined()
  })

  it('extractMax returns undefined on empty heap', () => {
    const heap = new MinMaxHeap<number>()
    expect(heap.extractMax()).toBeUndefined()
  })

  it('isEmpty returns true on empty heap', () => {
    const heap = new MinMaxHeap<number>()
    expect(heap.isEmpty()).toBe(true)
  })

  it('size is 0 on empty heap', () => {
    const heap = new MinMaxHeap<number>()
    expect(heap.size).toBe(0)
  })

  it('toArray returns empty array on empty heap', () => {
    const heap = new MinMaxHeap<number>()
    expect(heap.toArray()).toEqual([])
  })
})

// ─── Insert and peek ─────────────────────────────────────
describe('MinMaxHeap - insert and peek', () => {
  it('insert and peekMin single element', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(42)
    expect(heap.peekMin()).toBe(42)
    expect(heap.peekMax()).toBe(42)
    expect(heap.size).toBe(1)
    expect(heap.isEmpty()).toBe(false)
  })

  it('peekMin returns smallest after multiple inserts', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.insert(1)
    heap.insert(9)
    expect(heap.peekMin()).toBe(1)
  })

  it('peekMax returns largest after multiple inserts', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.insert(1)
    heap.insert(9)
    expect(heap.peekMax()).toBe(9)
  })

  it('peekMin and peekMax do not remove elements', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(10)
    heap.insert(20)
    heap.insert(30)
    expect(heap.peekMin()).toBe(10)
    expect(heap.peekMax()).toBe(30)
    expect(heap.size).toBe(3)
  })
})

// ─── ExtractMin and ExtractMax ───────────────────────────
describe('MinMaxHeap - extractMin and extractMax', () => {
  it('extractMin removes and returns minimum', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    expect(heap.extractMin()).toBe(3)
    expect(heap.size).toBe(2)
    expect(heap.peekMin()).toBe(5)
  })

  it('extractMax removes and returns maximum', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    expect(heap.extractMax()).toBe(7)
    expect(heap.size).toBe(2)
    expect(heap.peekMax()).toBe(5)
  })

  it('extracts all elements in sorted order via extractMin', () => {
    const heap = new MinMaxHeap<number>()
    const values = [42, 17, 8, 99, 3, 23, 56, 1, 71, 34]
    for (const v of values) heap.insert(v)
    const sorted = [...values].sort((a, b) => a - b)
    for (const expected of sorted) {
      expect(heap.extractMin()).toBe(expected)
    }
    expect(heap.isEmpty()).toBe(true)
  })

  it('extracts all elements in reverse sorted order via extractMax', () => {
    const heap = new MinMaxHeap<number>()
    const values = [42, 17, 8, 99, 3, 23, 56, 1, 71, 34]
    for (const v of values) heap.insert(v)
    const sorted = [...values].sort((a, b) => b - a)
    for (const expected of sorted) {
      expect(heap.extractMax()).toBe(expected)
    }
    expect(heap.isEmpty()).toBe(true)
  })
})

// ─── Interleaved min/max extracts ────────────────────────
describe('MinMaxHeap - interleaved min/max extracts', () => {
  it('alternating extractMin and extractMax', () => {
    const heap = new MinMaxHeap<number>()
    const values = [10, 20, 30, 40, 50, 60, 70, 80, 90]
    for (const v of values) heap.insert(v)
    expect(heap.extractMin()).toBe(10)
    expect(heap.extractMax()).toBe(90)
    expect(heap.extractMin()).toBe(20)
    expect(heap.extractMax()).toBe(80)
    expect(heap.extractMin()).toBe(30)
    expect(heap.extractMax()).toBe(70)
    expect(heap.extractMin()).toBe(40)
    expect(heap.extractMax()).toBe(60)
    expect(heap.extractMin()).toBe(50)
    expect(heap.isEmpty()).toBe(true)
  })

  it('mixed inserts and extracts', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(10)
    heap.insert(3)
    expect(heap.extractMin()).toBe(3)
    heap.insert(1)
    expect(heap.extractMin()).toBe(1)
    expect(heap.extractMax()).toBe(10)
    heap.insert(7)
    expect(heap.peekMin()).toBe(5)
    expect(heap.peekMax()).toBe(7)
    expect(heap.size).toBe(2)
  })
})

// ─── Size tracking ───────────────────────────────────────
describe('MinMaxHeap - size tracking', () => {
  it('tracks size through inserts and extracts', () => {
    const heap = new MinMaxHeap<number>()
    expect(heap.size).toBe(0)
    heap.insert(1)
    expect(heap.size).toBe(1)
    heap.insert(2)
    expect(heap.size).toBe(2)
    heap.insert(3)
    expect(heap.size).toBe(3)
    heap.extractMin()
    expect(heap.size).toBe(2)
    heap.extractMax()
    expect(heap.size).toBe(1)
    heap.extractMin()
    expect(heap.size).toBe(0)
  })
})

// ─── Clear ───────────────────────────────────────────────
describe('MinMaxHeap - clear', () => {
  it('clears the heap', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    heap.clear()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
    expect(heap.peekMin()).toBeUndefined()
    expect(heap.peekMax()).toBeUndefined()
    expect(heap.extractMin()).toBeUndefined()
    expect(heap.extractMax()).toBeUndefined()
  })
})

// ─── toArray ─────────────────────────────────────────────
describe('MinMaxHeap - toArray', () => {
  it('returns all elements without modifying the heap', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(1)
    heap.insert(3)
    const arr = heap.toArray()
    expect(arr.length).toBe(3)
    expect(heap.size).toBe(3)
    expect(heap.isEmpty()).toBe(false)
  })

  it('toArray returns a copy', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(1)
    heap.insert(2)
    const arr = heap.toArray()
    arr.push(999)
    expect(heap.size).toBe(2)
  })
})

// ─── replaceMin / replaceMax ─────────────────────────────
describe('MinMaxHeap - replaceMin and replaceMax', () => {
  it('replaceMin returns old min and inserts new value', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(10)
    heap.insert(20)
    heap.insert(30)
    const old = heap.replaceMin(5)
    expect(old).toBe(10)
    expect(heap.peekMin()).toBe(5)
    expect(heap.size).toBe(3)
  })

  it('replaceMax returns old max and inserts new value', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(10)
    heap.insert(20)
    heap.insert(30)
    const old = heap.replaceMax(50)
    expect(old).toBe(30)
    expect(heap.peekMax()).toBe(50)
    expect(heap.size).toBe(3)
  })

  it('replaceMin on empty heap returns undefined', () => {
    const heap = new MinMaxHeap<number>()
    expect(heap.replaceMin(5)).toBeUndefined()
    expect(heap.size).toBe(0)
  })

  it('replaceMax on empty heap returns undefined', () => {
    const heap = new MinMaxHeap<number>()
    expect(heap.replaceMax(5)).toBeUndefined()
    expect(heap.size).toBe(0)
  })

  it('replaceMin with larger value restructures correctly', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(1)
    heap.insert(10)
    heap.insert(20)
    heap.insert(30)
    heap.replaceMin(25)
    expect(heap.peekMin()).toBe(10)
    expect(heap.peekMax()).toBe(30)
  })

  it('replaceMax with smaller value restructures correctly', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(1)
    heap.insert(10)
    heap.insert(20)
    heap.insert(30)
    heap.replaceMax(5)
    expect(heap.peekMin()).toBe(1)
    expect(heap.peekMax()).toBe(20)
  })
})

// ─── Duplicate values ────────────────────────────────────
describe('MinMaxHeap - duplicate values', () => {
  it('handles duplicate values correctly', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(5)
    heap.insert(3)
    heap.insert(3)
    heap.insert(5)
    expect(heap.extractMin()).toBe(3)
    expect(heap.extractMin()).toBe(3)
    expect(heap.extractMin()).toBe(5)
    expect(heap.extractMin()).toBe(5)
    expect(heap.extractMin()).toBe(5)
    expect(heap.isEmpty()).toBe(true)
  })
})

// ─── Large scale ─────────────────────────────────────────
describe('MinMaxHeap - large scale', () => {
  it('handles 1000 elements with correct min and max', () => {
    const heap = new MinMaxHeap<number>()
    const items = Array.from({ length: 1000 }, (_, i) => i + 1)
    const shuffled = [...items]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    for (const item of shuffled) heap.insert(item)
    expect(heap.peekMin()).toBe(1)
    expect(heap.peekMax()).toBe(1000)
    expect(heap.size).toBe(1000)
    for (let i = 1; i <= 500; i++) {
      expect(heap.extractMin()).toBe(i)
    }
    for (let i = 1000; i > 500; i--) {
      expect(heap.extractMax()).toBe(i)
    }
    expect(heap.isEmpty()).toBe(true)
  })
})

// ─── Custom comparator (max-first) ───────────────────────
describe('MinMaxHeap - custom comparator', () => {
  it('reverse comparator inverts min and max', () => {
    const heap = new MinMaxHeap<number>({ comparator: (a, b) => b - a })
    heap.insert(5)
    heap.insert(1)
    heap.insert(3)
    heap.insert(2)
    heap.insert(4)
    expect(heap.peekMin()).toBe(5)
    expect(heap.peekMax()).toBe(1)
    expect(heap.extractMin()).toBe(5)
    expect(heap.extractMax()).toBe(1)
  })

  it('works with string comparator', () => {
    const heap = new MinMaxHeap<string>({ comparator: (a, b) => a.localeCompare(b) })
    heap.insert('cherry')
    heap.insert('apple')
    heap.insert('banana')
    expect(heap.peekMin()).toBe('apple')
    expect(heap.peekMax()).toBe('cherry')
    expect(heap.extractMin()).toBe('apple')
    expect(heap.extractMax()).toBe('cherry')
  })

  it('works with objects using custom comparator', () => {
    interface Item {
      priority: number
      name: string
    }
    const heap = new MinMaxHeap<Item>({
      comparator: (a, b) => a.priority - b.priority,
    })
    heap.insert({ priority: 3, name: 'c' })
    heap.insert({ priority: 1, name: 'a' })
    heap.insert({ priority: 2, name: 'b' })
    expect(heap.extractMin()?.name).toBe('a')
    expect(heap.extractMax()?.name).toBe('c')
  })
})
