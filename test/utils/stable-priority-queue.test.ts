import { describe, expect, it } from 'vitest'
import { StablePriorityQueue } from '../../src/utils/stable-priority-queue.js'

describe('StablePriorityQueue', () => {
  it('enqueues and dequeues in order', () => {
    const pq = new StablePriorityQueue<number>()
    pq.enqueue(3)
    pq.enqueue(1)
    pq.enqueue(2)
    expect(pq.dequeue()).toBe(1)
    expect(pq.dequeue()).toBe(2)
    expect(pq.dequeue()).toBe(3)
  })

  it('maintains FIFO order for equal priorities', () => {
    const pq = new StablePriorityQueue<number>()
    pq.enqueue(1)
    pq.enqueue(1)
    pq.enqueue(1)
    expect(pq.dequeue()).toBe(1)
    expect(pq.dequeue()).toBe(1)
    expect(pq.dequeue()).toBe(1)
  })

  it('maintains FIFO with mixed priorities', () => {
    const pq = new StablePriorityQueue<{ p: number; id: number }>((a, b) => a.p - b.p)
    pq.enqueue({ p: 1, id: 1 })
    pq.enqueue({ p: 1, id: 2 })
    pq.enqueue({ p: 2, id: 3 })
    pq.enqueue({ p: 1, id: 4 })
    expect(pq.dequeue()!.id).toBe(1)
    expect(pq.dequeue()!.id).toBe(2)
    expect(pq.dequeue()!.id).toBe(4)
    expect(pq.dequeue()!.id).toBe(3)
  })

  it('peek returns min without removing', () => {
    const pq = new StablePriorityQueue<number>()
    pq.enqueue(5)
    pq.enqueue(3)
    expect(pq.peek()).toBe(3)
    expect(pq.size).toBe(2)
  })

  it('size tracks correctly', () => {
    const pq = new StablePriorityQueue<number>()
    expect(pq.size).toBe(0)
    expect(pq.isEmpty()).toBe(true)
    pq.enqueue(1)
    expect(pq.size).toBe(1)
    expect(pq.isEmpty()).toBe(false)
  })

  it('dequeue on empty returns undefined', () => {
    const pq = new StablePriorityQueue<number>()
    expect(pq.dequeue()).toBeUndefined()
    expect(pq.peek()).toBeUndefined()
  })

  it('clear empties queue', () => {
    const pq = new StablePriorityQueue<number>()
    pq.enqueue(1)
    pq.enqueue(2)
    pq.clear()
    expect(pq.size).toBe(0)
    expect(pq.isEmpty()).toBe(true)
  })

  it('toArray returns sorted values', () => {
    const pq = new StablePriorityQueue<number>()
    pq.enqueue(3)
    pq.enqueue(1)
    pq.enqueue(2)
    expect(pq.toArray()).toEqual([1, 2, 3])
  })

  it('works with custom max comparator', () => {
    const pq = new StablePriorityQueue<number>((a, b) => b - a)
    pq.enqueue(1)
    pq.enqueue(3)
    pq.enqueue(2)
    expect(pq.dequeue()).toBe(3)
    expect(pq.dequeue()).toBe(2)
    expect(pq.dequeue()).toBe(1)
  })

  it('handles large number of elements', () => {
    const pq = new StablePriorityQueue<number>()
    for (let i = 100; i >= 0; i--) pq.enqueue(i)
    for (let i = 0; i <= 100; i++) {
      expect(pq.dequeue()).toBe(i)
    }
    expect(pq.isEmpty()).toBe(true)
  })

  it('clear allows reuse', () => {
    const pq = new StablePriorityQueue<number>()
    pq.enqueue(5)
    pq.clear()
    pq.enqueue(1)
    pq.enqueue(2)
    expect(pq.dequeue()).toBe(1)
  })

  it('stability with strings', () => {
    const pq = new StablePriorityQueue<string>((a, b) => a.localeCompare(b))
    pq.enqueue('cherry')
    pq.enqueue('apple')
    pq.enqueue('banana')
    expect(pq.dequeue()).toBe('apple')
    expect(pq.dequeue()).toBe('banana')
    expect(pq.dequeue()).toBe('cherry')
  })

  it('stability: equal elements dequeued in insertion order', () => {
    const pq = new StablePriorityQueue<{ p: number; label: string }>((a, b) => a.p - b.p)
    pq.enqueue({ p: 1, label: 'first' })
    pq.enqueue({ p: 1, label: 'second' })
    pq.enqueue({ p: 1, label: 'third' })
    expect(pq.dequeue()!.label).toBe('first')
    expect(pq.dequeue()!.label).toBe('second')
    expect(pq.dequeue()!.label).toBe('third')
  })

  it('interleaved enqueue dequeue', () => {
    const pq = new StablePriorityQueue<number>()
    pq.enqueue(5)
    pq.enqueue(3)
    expect(pq.dequeue()).toBe(3)
    pq.enqueue(1)
    pq.enqueue(4)
    expect(pq.dequeue()).toBe(1)
    expect(pq.dequeue()).toBe(4)
    expect(pq.dequeue()).toBe(5)
    expect(pq.isEmpty()).toBe(true)
  })

  it('toArray preserves insertion order for equals', () => {
    const pq = new StablePriorityQueue<{ p: number; id: number }>((a, b) => a.p - b.p)
    pq.enqueue({ p: 1, id: 1 })
    pq.enqueue({ p: 1, id: 2 })
    pq.enqueue({ p: 1, id: 3 })
    const arr = pq.toArray()
    expect(arr.map(x => x.id)).toEqual([1, 2, 3])
  })

  it('size tracks correctly', () => {
    const pq = new StablePriorityQueue<number>()
    expect(pq.size).toBe(0)
    pq.enqueue(1)
    pq.enqueue(2)
    expect(pq.size).toBe(2)
    pq.dequeue()
    expect(pq.size).toBe(1)
  })
})
