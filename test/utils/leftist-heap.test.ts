import { beforeEach, describe, expect, it } from 'vitest'

import { LeftistHeap } from '../../src/utils/leftist-heap.js'

// ─── Empty heap operations ───────────────────────────────
describe('LeftistHeap - empty heap', () => {
  it('peek returns undefined on empty heap', () => {
    const heap = new LeftistHeap<number>()
    expect(heap.peek()).toBeUndefined()
  })

  it('extractMin returns undefined on empty heap', () => {
    const heap = new LeftistHeap<number>()
    expect(heap.extractMin()).toBeUndefined()
  })

  it('isEmpty returns true on empty heap', () => {
    const heap = new LeftistHeap<number>()
    expect(heap.isEmpty()).toBe(true)
  })

  it('size is 0 on empty heap', () => {
    const heap = new LeftistHeap<number>()
    expect(heap.size).toBe(0)
  })

  it('toArray returns empty array on empty heap', () => {
    const heap = new LeftistHeap<number>()
    expect(heap.toArray()).toEqual([])
  })
})

// ─── Single element ──────────────────────────────────────
describe('LeftistHeap - single element', () => {
  it('insert and peek', () => {
    const heap = new LeftistHeap<number>()
    heap.insert(42)
    expect(heap.peek()).toBe(42)
    expect(heap.size).toBe(1)
    expect(heap.isEmpty()).toBe(false)
  })

  it('insert and extractMin', () => {
    const heap = new LeftistHeap<number>()
    heap.insert(42)
    expect(heap.extractMin()).toBe(42)
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
  })
})

// ─── Multiple inserts ────────────────────────────────────
describe('LeftistHeap - multiple inserts', () => {
  it('maintains heap property with multiple inserts', () => {
    const heap = new LeftistHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.insert(1)
    heap.insert(9)
    expect(heap.peek()).toBe(1)
    expect(heap.size).toBe(5)
  })

  it('extracts elements in ascending order', () => {
    const heap = new LeftistHeap<number>()
    const values = [42, 17, 8, 99, 3, 23, 56, 1, 71, 34]
    for (const v of values) {
      heap.insert(v)
    }
    const sorted = [...values].sort((a, b) => a - b)
    for (const expected of sorted) {
      expect(heap.extractMin()).toBe(expected)
    }
    expect(heap.isEmpty()).toBe(true)
  })

  it('handles duplicate values', () => {
    const heap = new LeftistHeap<number>()
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

// ─── Merge ───────────────────────────────────────────────
describe('LeftistHeap - merge', () => {
  it('merges two non-empty heaps', () => {
    const heap1 = new LeftistHeap<number>()
    heap1.insert(5)
    heap1.insert(10)
    heap1.insert(3)

    const heap2 = new LeftistHeap<number>()
    heap2.insert(2)
    heap2.insert(8)
    heap2.insert(1)

    heap1.merge(heap2)
    expect(heap1.size).toBe(6)
    expect(heap1.peek()).toBe(1)
    expect(heap2.size).toBe(0)
    expect(heap2.isEmpty()).toBe(true)
  })

  it('merge empty with non-empty', () => {
    const heap1 = new LeftistHeap<number>()
    const heap2 = new LeftistHeap<number>()
    heap2.insert(1)
    heap2.insert(2)

    heap1.merge(heap2)
    expect(heap1.size).toBe(2)
    expect(heap1.peek()).toBe(1)
    expect(heap2.size).toBe(0)
  })

  it('merge non-empty with empty', () => {
    const heap1 = new LeftistHeap<number>()
    heap1.insert(5)
    heap1.insert(10)
    const heap2 = new LeftistHeap<number>()

    heap1.merge(heap2)
    expect(heap1.size).toBe(2)
    expect(heap1.peek()).toBe(5)
  })

  it('merge two empty heaps', () => {
    const heap1 = new LeftistHeap<number>()
    const heap2 = new LeftistHeap<number>()

    heap1.merge(heap2)
    expect(heap1.size).toBe(0)
    expect(heap1.isEmpty()).toBe(true)
  })

  it('merge after extracts', () => {
    const heap1 = new LeftistHeap<number>()
    heap1.insert(10)
    heap1.insert(20)
    heap1.extractMin()

    const heap2 = new LeftistHeap<number>()
    heap2.insert(5)
    heap2.insert(15)

    heap1.merge(heap2)
    expect(heap1.size).toBe(3)
    expect(heap1.peek()).toBe(5)
  })

  it('merged heap extracts all in order', () => {
    const heap1 = new LeftistHeap<number>()
    heap1.insert(1)
    heap1.insert(4)
    heap1.insert(7)

    const heap2 = new LeftistHeap<number>()
    heap2.insert(2)
    heap2.insert(5)
    heap2.insert(8)

    heap1.merge(heap2)
    const result: number[] = []
    while (!heap1.isEmpty()) {
      result.push(heap1.extractMin()!)
    }
    expect(result).toEqual([1, 2, 4, 5, 7, 8])
  })
})

// ─── Clear ───────────────────────────────────────────────
describe('LeftistHeap - clear', () => {
  it('clears the heap', () => {
    const heap = new LeftistHeap<number>()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    heap.clear()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
    expect(heap.peek()).toBeUndefined()
    expect(heap.extractMin()).toBeUndefined()
  })
})

// ─── Size tracking ───────────────────────────────────────
describe('LeftistHeap - size tracking', () => {
  it('tracks size through inserts and extracts', () => {
    const heap = new LeftistHeap<number>()
    expect(heap.size).toBe(0)
    heap.insert(1)
    expect(heap.size).toBe(1)
    heap.insert(2)
    expect(heap.size).toBe(2)
    heap.extractMin()
    expect(heap.size).toBe(1)
    heap.extractMin()
    expect(heap.size).toBe(0)
  })
})

// ─── toArray ─────────────────────────────────────────────
describe('LeftistHeap - toArray', () => {
  it('returns sorted elements', () => {
    const heap = new LeftistHeap<number>()
    heap.insert(5)
    heap.insert(1)
    heap.insert(3)
    heap.insert(2)
    heap.insert(4)
    expect(heap.toArray()).toEqual([1, 2, 3, 4, 5])
  })

  it('toArray empties the heap', () => {
    const heap = new LeftistHeap<number>()
    heap.insert(3)
    heap.insert(1)
    heap.insert(2)
    heap.toArray()
    expect(heap.isEmpty()).toBe(true)
    expect(heap.size).toBe(0)
  })
})

// ─── Custom comparator (max heap) ────────────────────────
describe('LeftistHeap - custom comparator (max heap)', () => {
  it('behaves as max heap with reverse comparator', () => {
    const heap = new LeftistHeap<number>({ comparator: (a, b) => b - a })
    heap.insert(5)
    heap.insert(1)
    heap.insert(3)
    heap.insert(2)
    heap.insert(4)
    expect(heap.peek()).toBe(5)
    expect(heap.extractMin()).toBe(5)
    expect(heap.extractMin()).toBe(4)
    expect(heap.extractMin()).toBe(3)
  })

  it('max heap merge works correctly', () => {
    const heap1 = new LeftistHeap<number>({ comparator: (a, b) => b - a })
    heap1.insert(10)
    heap1.insert(30)

    const heap2 = new LeftistHeap<number>({ comparator: (a, b) => b - a })
    heap2.insert(20)
    heap2.insert(5)

    heap1.merge(heap2)
    expect(heap1.peek()).toBe(30)
    expect(heap1.size).toBe(4)
  })
})

// ─── Large number of elements ────────────────────────────
describe('LeftistHeap - large scale', () => {
  it('handles 100+ elements', () => {
    const heap = new LeftistHeap<number>()
    const items = Array.from({ length: 200 }, (_, i) => i + 1)
    const shuffled = [...items]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    for (const item of shuffled) {
      heap.insert(item)
    }
    for (let i = 1; i <= 200; i++) {
      expect(heap.extractMin()).toBe(i)
    }
    expect(heap.isEmpty()).toBe(true)
  })
})

// ─── NPL and leftist property ────────────────────────────
describe('LeftistHeap - leftist property', () => {
  it('maintains NPL property after inserts', () => {
    const heap = new LeftistHeap<number>()
    for (let i = 20; i >= 1; i--) {
      heap.insert(i)
    }
    for (let i = 1; i <= 20; i++) {
      expect(heap.extractMin()).toBe(i)
    }
  })

  it('maintains heap order after merge', () => {
    const heap1 = new LeftistHeap<number>()
    heap1.insert(1)
    heap1.insert(5)
    heap1.insert(9)

    const heap2 = new LeftistHeap<number>()
    heap2.insert(2)
    heap2.insert(6)
    heap2.insert(10)

    heap1.merge(heap2)

    const result: number[] = []
    while (!heap1.isEmpty()) {
      result.push(heap1.extractMin()!)
    }
    expect(result).toEqual([1, 2, 5, 6, 9, 10])
  })
})

// ─── Generic types ───────────────────────────────────────
describe('LeftistHeap - generic types', () => {
  it('works with strings', () => {
    const heap = new LeftistHeap<string>({ comparator: (a, b) => a.localeCompare(b) })
    heap.insert('cherry')
    heap.insert('apple')
    heap.insert('banana')
    expect(heap.extractMin()).toBe('apple')
    expect(heap.extractMin()).toBe('banana')
    expect(heap.extractMin()).toBe('cherry')
  })

  it('works with objects using custom comparator', () => {
    interface Item {
      priority: number
      name: string
    }
    const heap = new LeftistHeap<Item>({
      comparator: (a, b) => a.priority - b.priority,
    })
    heap.insert({ priority: 3, name: 'c' })
    heap.insert({ priority: 1, name: 'a' })
    heap.insert({ priority: 2, name: 'b' })
    expect(heap.extractMin()?.name).toBe('a')
    expect(heap.extractMin()?.name).toBe('b')
    expect(heap.extractMin()?.name).toBe('c')
  })
})

// ─── fromArray ───────────────────────────────────────────
describe('LeftistHeap - fromArray', () => {
  it('creates heap from array', () => {
    const heap = LeftistHeap.fromArray([5, 3, 1, 4, 2])
    expect(heap.size).toBe(5)
    expect(heap.peek()).toBe(1)
    expect(heap.toArray()).toEqual([1, 2, 3, 4, 5])
  })

  it('creates empty heap from empty array', () => {
    const heap = LeftistHeap.fromArray<number>([])
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
  })
})
