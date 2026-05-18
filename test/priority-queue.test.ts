import { describe, expect, it } from 'vitest'

import { PriorityQueue } from '../src/utils/priority-queue.js'

// ─── min-heap (default) ───────────────────────────────
describe('PriorityQueue min-heap', () => {
  it('enqueues and dequeues in priority order', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(3)
    pq.enqueue(1)
    pq.enqueue(2)

    expect(pq.dequeue()).toBe(1)
    expect(pq.dequeue()).toBe(2)
    expect(pq.dequeue()).toBe(3)
  })

  it('returns undefined when empty', () => {
    const pq = new PriorityQueue<number>()
    expect(pq.dequeue()).toBeUndefined()
  })

  it('peek returns min without removing', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(5)
    pq.enqueue(3)
    expect(pq.peek()).toBe(3)
    expect(pq.size).toBe(2)
  })
})

// ─── max-heap ─────────────────────────────────────────
describe('PriorityQueue max-heap', () => {
  it('uses custom comparator for max-heap', () => {
    const pq = new PriorityQueue<number>({ comparator: (a, b) => b - a })
    pq.enqueue(1)
    pq.enqueue(3)
    pq.enqueue(2)

    expect(pq.dequeue()).toBe(3)
    expect(pq.dequeue()).toBe(2)
    expect(pq.dequeue()).toBe(1)
  })
})

// ─── object priority ──────────────────────────────────
describe('PriorityQueue with objects', () => {
  it('orders objects by comparator', () => {
    const pq = new PriorityQueue<{ name: string; priority: number }>({
      comparator: (a, b) => a.priority - b.priority,
    })
    pq.enqueue({ name: 'low', priority: 10 })
    pq.enqueue({ name: 'high', priority: 1 })
    pq.enqueue({ name: 'mid', priority: 5 })

    expect(pq.dequeue()!.name).toBe('high')
    expect(pq.dequeue()!.name).toBe('mid')
    expect(pq.dequeue()!.name).toBe('low')
  })
})

// ─── size and empty ───────────────────────────────────
describe('PriorityQueue size', () => {
  it('tracks size correctly', () => {
    const pq = new PriorityQueue<number>()
    expect(pq.isEmpty()).toBe(true)
    pq.enqueue(1)
    expect(pq.size).toBe(1)
    expect(pq.isEmpty()).toBe(false)
    pq.dequeue()
    expect(pq.isEmpty()).toBe(true)
  })
})

// ─── clear ────────────────────────────────────────────
describe('PriorityQueue clear', () => {
  it('clears all items', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(1)
    pq.enqueue(2)
    pq.clear()
    expect(pq.size).toBe(0)
    expect(pq.dequeue()).toBeUndefined()
  })
})

// ─── toArray ──────────────────────────────────────────
describe('PriorityQueue toArray', () => {
  it('returns copy of internal heap', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(1)
    pq.enqueue(2)
    const arr = pq.toArray()
    expect(arr.length).toBe(2)
    expect(pq.size).toBe(2)
  })
})

// ─── stress ───────────────────────────────────────────
describe('PriorityQueue stress', () => {
  it('handles many elements correctly', () => {
    const pq = new PriorityQueue<number>()
    const n = 100
    for (let i = n; i >= 1; i--) pq.enqueue(i)
    for (let i = 1; i <= n; i++) {
      expect(pq.dequeue()).toBe(i)
    }
    expect(pq.isEmpty()).toBe(true)
  })
})
