import { describe, it, expect } from 'vitest'
import { PriorityQueue } from '../../src/utils/priority-queue.js'

// ─── Constructor ──────────────────────────────────────────
describe('PriorityQueue - constructor', () => {
  it('creates with default comparator (min-heap)', () => {
    const pq = new PriorityQueue<number>()
    expect(pq.size).toBe(0)
    expect(pq.isEmpty()).toBe(true)
  })

  it('creates with custom comparator (max-heap)', () => {
    const pq = new PriorityQueue<number>({ comparator: (a, b) => b - a })
    pq.enqueue(1)
    pq.enqueue(3)
    pq.enqueue(2)
    expect(pq.peek()).toBe(3)
  })
})

// ─── Enqueue and Dequeue ──────────────────────────────────
describe('PriorityQueue - enqueue and dequeue', () => {
  it('returns items in priority order', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(5)
    pq.enqueue(1)
    pq.enqueue(3)
    expect(pq.dequeue()).toBe(1)
    expect(pq.dequeue()).toBe(3)
    expect(pq.dequeue()).toBe(5)
  })

  it('returns undefined for empty dequeue', () => {
    const pq = new PriorityQueue<number>()
    expect(pq.dequeue()).toBeUndefined()
  })

  it('handles single element', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(42)
    expect(pq.peek()).toBe(42)
    expect(pq.dequeue()).toBe(42)
    expect(pq.isEmpty()).toBe(true)
  })

  it('handles duplicates', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(1)
    pq.enqueue(1)
    pq.enqueue(1)
    expect(pq.dequeue()).toBe(1)
    expect(pq.dequeue()).toBe(1)
    expect(pq.dequeue()).toBe(1)
  })
})

// ─── Peek ─────────────────────────────────────────────────
describe('PriorityQueue - peek', () => {
  it('returns highest priority without removing', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(5)
    pq.enqueue(1)
    expect(pq.peek()).toBe(1)
    expect(pq.size).toBe(2)
  })

  it('returns undefined when empty', () => {
    const pq = new PriorityQueue<number>()
    expect(pq.peek()).toBeUndefined()
  })
})

// ─── Size tracking ────────────────────────────────────────
describe('PriorityQueue - size', () => {
  it('tracks size correctly', () => {
    const pq = new PriorityQueue<number>()
    expect(pq.size).toBe(0)
    pq.enqueue(1)
    expect(pq.size).toBe(1)
    pq.enqueue(2)
    expect(pq.size).toBe(2)
    pq.dequeue()
    expect(pq.size).toBe(1)
  })
})

// ─── Clear ────────────────────────────────────────────────
describe('PriorityQueue - clear', () => {
  it('removes all elements', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(1)
    pq.enqueue(2)
    pq.enqueue(3)
    pq.clear()
    expect(pq.size).toBe(0)
    expect(pq.isEmpty()).toBe(true)
  })
})

// ─── toArray ───────────────────────────────────────────────
describe('PriorityQueue - toArray', () => {
  it('returns heap contents', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(3)
    pq.enqueue(1)
    pq.enqueue(2)
    expect(pq.toArray()).toHaveLength(3)
    expect(pq.toArray()).toContain(1)
    expect(pq.toArray()).toContain(2)
    expect(pq.toArray()).toContain(3)
  })
})

// ─── Large scale ──────────────────────────────────────────
describe('PriorityQueue - large scale', () => {
  it('handles 1000 elements in sorted order', () => {
    const pq = new PriorityQueue<number>()
    for (let i = 1000; i >= 0; i--) {
      pq.enqueue(i)
    }
    const results: number[] = []
    while (!pq.isEmpty()) {
      results.push(pq.dequeue()!)
    }
    for (let i = 0; i <= 1000; i++) {
      expect(results[i]).toBe(i)
    }
  })
})

// ─── Custom comparator ────────────────────────────────────
describe('PriorityQueue - custom comparator', () => {
  it('works with string comparator', () => {
    const pq = new PriorityQueue<string>({ comparator: (a, b) => a.localeCompare(b) })
    pq.enqueue('cherry')
    pq.enqueue('apple')
    pq.enqueue('banana')
    expect(pq.dequeue()).toBe('apple')
    expect(pq.dequeue()).toBe('banana')
    expect(pq.dequeue()).toBe('cherry')
  })

  it('works with object comparator', () => {
    const pq = new PriorityQueue<{ priority: number; name: string }>({
      comparator: (a, b) => a.priority - b.priority,
    })
    pq.enqueue({ priority: 3, name: 'low' })
    pq.enqueue({ priority: 1, name: 'high' })
    pq.enqueue({ priority: 2, name: 'medium' })
    expect(pq.dequeue()!.name).toBe('high')
    expect(pq.dequeue()!.name).toBe('medium')
    expect(pq.dequeue()!.name).toBe('low')
  })
})
