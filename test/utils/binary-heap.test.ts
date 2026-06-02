import { describe, expect, it } from 'vitest'
import { BinaryHeap } from '../../src/utils/binary-heap.js'

// ─── Min Heap ───

describe('BinaryHeap min heap', () => {
  it('starts empty', () => {
    const heap = new BinaryHeap<number>()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
  })

  it('pushes and peeks', () => {
    const heap = new BinaryHeap<number>()
    heap.push(5)
    expect(heap.peek()).toBe(5)
    expect(heap.size).toBe(1)
  })

  it('pops in ascending order', () => {
    const heap = new BinaryHeap<number>()
    heap.push(3)
    heap.push(1)
    heap.push(2)
    expect(heap.pop()).toBe(1)
    expect(heap.pop()).toBe(2)
    expect(heap.pop()).toBe(3)
  })

  it('handles duplicate values', () => {
    const heap = new BinaryHeap<number>()
    heap.push(2)
    heap.push(2)
    heap.push(1)
    expect(heap.pop()).toBe(1)
    expect(heap.pop()).toBe(2)
    expect(heap.pop()).toBe(2)
  })

  it('pops undefined on empty', () => {
    const heap = new BinaryHeap<number>()
    expect(heap.pop()).toBeUndefined()
  })

  it('peeks undefined on empty', () => {
    const heap = new BinaryHeap<number>()
    expect(heap.peek()).toBeUndefined()
  })

  it('handles single element', () => {
    const heap = new BinaryHeap<number>()
    heap.push(42)
    expect(heap.pop()).toBe(42)
    expect(heap.isEmpty()).toBe(true)
  })
})

// ─── Max Heap ───

describe('BinaryHeap max heap', () => {
  it('pops in descending order', () => {
    const heap = new BinaryHeap<number>({ type: 'max' })
    heap.push(1)
    heap.push(3)
    heap.push(2)
    expect(heap.pop()).toBe(3)
    expect(heap.pop()).toBe(2)
    expect(heap.pop()).toBe(1)
  })

  it('peeks max value', () => {
    const heap = new BinaryHeap<number>({ type: 'max' })
    heap.push(1)
    heap.push(5)
    heap.push(3)
    expect(heap.peek()).toBe(5)
  })
})

// ─── Custom Comparator ───

describe('BinaryHeap custom comparator', () => {
  it('sorts objects by property', () => {
    const heap = new BinaryHeap<{ name: string; priority: number }>({
      comparator: (a, b) => a.priority - b.priority,
    })
    heap.push({ name: 'low', priority: 10 })
    heap.push({ name: 'high', priority: 1 })
    heap.push({ name: 'mid', priority: 5 })
    expect(heap.pop()!.name).toBe('high')
    expect(heap.pop()!.name).toBe('mid')
    expect(heap.pop()!.name).toBe('low')
  })
})

// ─── fromArray ───

describe('BinaryHeap fromArray', () => {
  it('builds min heap from array', () => {
    const heap = BinaryHeap.fromArray([5, 3, 1, 4, 2])
    expect(heap.pop()).toBe(1)
    expect(heap.pop()).toBe(2)
    expect(heap.pop()).toBe(3)
    expect(heap.pop()).toBe(4)
    expect(heap.pop()).toBe(5)
  })

  it('builds max heap from array', () => {
    const heap = BinaryHeap.fromArray([1, 3, 5, 2, 4], { type: 'max' })
    expect(heap.pop()).toBe(5)
    expect(heap.pop()).toBe(4)
    expect(heap.pop()).toBe(3)
  })

  it('handles empty array', () => {
    const heap = BinaryHeap.fromArray<number>([])
    expect(heap.isEmpty()).toBe(true)
  })

  it('handles single element', () => {
    const heap = BinaryHeap.fromArray([42])
    expect(heap.pop()).toBe(42)
  })
})

// ─── toArray & Clear ───

describe('BinaryHeap toArray & clear', () => {
  it('toArray returns internal array copy', () => {
    const heap = new BinaryHeap<number>()
    heap.push(1)
    heap.push(2)
    const arr = heap.toArray()
    expect(arr.length).toBe(2)
    expect(arr).toContain(1)
    expect(arr).toContain(2)
  })

  it('clear empties the heap', () => {
    const heap = new BinaryHeap<number>()
    heap.push(1)
    heap.push(2)
    heap.push(3)
    heap.clear()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
    expect(heap.pop()).toBeUndefined()
  })
})

// ─── Stress ───

describe('BinaryHeap stress', () => {
  it('handles many elements sorted', () => {
    const heap = new BinaryHeap<number>()
    const n = 200
    for (let i = 0; i < n; i++) heap.push(i)
    for (let i = 0; i < n; i++) {
      expect(heap.pop()).toBe(i)
    }
    expect(heap.isEmpty()).toBe(true)
  })

  it('handles many elements in reverse', () => {
    const heap = new BinaryHeap<number>()
    const n = 200
    for (let i = n; i >= 0; i--) heap.push(i)
    for (let i = 0; i <= n; i++) {
      expect(heap.pop()).toBe(i)
    }
  })

  it('peek returns minimum without removing', () => {
    const heap = new BinaryHeap<number>()
    heap.push(5)
    heap.push(3)
    heap.push(7)
    expect(heap.peek()).toBe(3)
    expect(heap.size).toBe(3)
  })

  it('pop returns elements in order', () => {
    const heap = new BinaryHeap<number>()
    heap.push(5)
    heap.push(1)
    heap.push(3)
    expect(heap.pop()).toBe(1)
    expect(heap.pop()).toBe(3)
    expect(heap.pop()).toBe(5)
  })
})
