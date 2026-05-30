import { describe, expect, it } from 'vitest'

import { AmortizedQueue } from '../../../src/core/amortized-queue/amortized-queue.js'

describe('AmortizedQueue', () => {
  it('enqueues and dequeues items in FIFO order', () => {
    const q = new AmortizedQueue<number>()
    q.enqueue(1)
    q.enqueue(2)
    q.enqueue(3)
    expect(q.dequeue()).toBe(1)
    expect(q.dequeue()).toBe(2)
    expect(q.dequeue()).toBe(3)
  })

  it('dequeue returns undefined when empty', () => {
    const q = new AmortizedQueue<number>()
    expect(q.dequeue()).toBeUndefined()
  })

  it('peek returns front item without removing', () => {
    const q = new AmortizedQueue<number>()
    q.enqueue(10)
    q.enqueue(20)
    expect(q.peek()).toBe(10)
    expect(q.size()).toBe(2)
  })

  it('peek returns undefined when empty', () => {
    const q = new AmortizedQueue<number>()
    expect(q.peek()).toBeUndefined()
  })

  it('front_ is alias for peek', () => {
    const q = new AmortizedQueue<number>()
    q.enqueue(42)
    expect(q.front_()).toBe(q.peek())
  })

  it('back returns last item', () => {
    const q = new AmortizedQueue<number>()
    q.enqueue(1)
    q.enqueue(2)
    q.enqueue(3)
    expect(q.back()).toBe(3)
  })

  it('back returns undefined when empty', () => {
    const q = new AmortizedQueue<number>()
    expect(q.back()).toBeUndefined()
  })

  it('size tracks count correctly', () => {
    const q = new AmortizedQueue<number>()
    expect(q.size()).toBe(0)
    q.enqueue(1)
    expect(q.size()).toBe(1)
    q.enqueue(2)
    expect(q.size()).toBe(2)
    q.dequeue()
    expect(q.size()).toBe(1)
  })

  it('isEmpty returns correct state', () => {
    const q = new AmortizedQueue<number>()
    expect(q.isEmpty()).toBe(true)
    q.enqueue(1)
    expect(q.isEmpty()).toBe(false)
    q.dequeue()
    expect(q.isEmpty()).toBe(true)
  })

  it('clear empties the queue', () => {
    const q = new AmortizedQueue<number>()
    q.enqueue(1)
    q.enqueue(2)
    q.clear()
    expect(q.size()).toBe(0)
    expect(q.isEmpty()).toBe(true)
  })

  it('toArray returns all items in order', () => {
    const q = new AmortizedQueue<number>()
    q.enqueue(1)
    q.enqueue(2)
    q.enqueue(3)
    expect(q.toArray()).toEqual([1, 2, 3])
  })

  it('fromArray adds items from array', () => {
    const q = new AmortizedQueue<number>()
    q.fromArray([10, 20, 30])
    expect(q.size()).toBe(3)
    expect(q.dequeue()).toBe(10)
  })

  it('forEach iterates all items', () => {
    const q = new AmortizedQueue<number>()
    q.enqueue(1)
    q.enqueue(2)
    q.enqueue(3)
    const items: number[] = []
    q.forEach((v) => items.push(v))
    expect(items).toEqual([1, 2, 3])
  })

  it('is iterable', () => {
    const q = new AmortizedQueue<number>()
    q.enqueue(1)
    q.enqueue(2)
    const items = [...q]
    expect(items).toEqual([1, 2])
  })

  it('enqueueMany adds multiple items', () => {
    const q = new AmortizedQueue<number>()
    q.enqueueMany([1, 2, 3])
    expect(q.size()).toBe(3)
    expect(q.toArray()).toEqual([1, 2, 3])
  })

  it('dequeueMany removes multiple items', () => {
    const q = new AmortizedQueue<number>()
    q.enqueueMany([1, 2, 3, 4, 5])
    const items = q.dequeueMany(3)
    expect(items).toEqual([1, 2, 3])
    expect(q.size()).toBe(2)
  })

  it('dequeueMany caps at queue size', () => {
    const q = new AmortizedQueue<number>()
    q.enqueue(1)
    q.enqueue(2)
    const items = q.dequeueMany(10)
    expect(items).toEqual([1, 2])
  })

  it('reverse returns reversed queue', () => {
    const q = new AmortizedQueue<number>()
    q.enqueueMany([1, 2, 3])
    const reversed = q.reverse()
    expect(reversed.toArray()).toEqual([3, 2, 1])
  })

  it('map transforms items', () => {
    const q = new AmortizedQueue<number>()
    q.enqueueMany([1, 2, 3])
    const mapped = q.map((v) => v * 2)
    expect(mapped.toArray()).toEqual([2, 4, 6])
  })

  it('filter returns matching items', () => {
    const q = new AmortizedQueue<number>()
    q.enqueueMany([1, 2, 3, 4, 5])
    const filtered = q.filter((v) => v % 2 === 0)
    expect(filtered.toArray()).toEqual([2, 4])
  })

  it('clone creates independent copy', () => {
    const q = new AmortizedQueue<number>()
    q.enqueue(1)
    q.enqueue(2)
    const cloned = q.clone()
    expect(cloned.toArray()).toEqual([1, 2])
    cloned.enqueue(3)
    expect(q.size()).toBe(2)
    expect(cloned.size()).toBe(3)
  })

  it('persist creates frozen snapshot', () => {
    const q = new AmortizedQueue<number>()
    q.enqueue(1)
    q.enqueue(2)
    const snapshot = q.persist()
    expect(snapshot.isFrozen()).toBe(true)
    expect(snapshot.toArray()).toEqual([1, 2])
  })

  it('frozen queue throws on enqueue', () => {
    const q = new AmortizedQueue<number>()
    q.enqueue(1)
    const frozen = q.persist()
    expect(() => frozen.enqueue(2)).toThrow('Cannot modify a frozen queue')
  })

  it('frozen queue throws on dequeue', () => {
    const q = new AmortizedQueue<number>()
    q.enqueue(1)
    const frozen = q.persist()
    expect(() => frozen.dequeue()).toThrow('Cannot modify a frozen queue')
  })

  it('frozen queue throws on clear', () => {
    const q = new AmortizedQueue<number>()
    q.enqueue(1)
    const frozen = q.persist()
    expect(() => frozen.clear()).toThrow('Cannot modify a frozen queue')
  })

  it('respects maxSize option', () => {
    const q = new AmortizedQueue<number>({ maxSize: 3 })
    q.enqueue(1)
    q.enqueue(2)
    q.enqueue(3)
    q.enqueue(4)
    expect(q.size()).toBe(3)
    expect(q.peek()).toBe(2)
  })

  it('maxSize of 0 means unlimited', () => {
    const q = new AmortizedQueue<number>({ maxSize: 0 })
    for (let i = 0; i < 100; i++) {
      q.enqueue(i)
    }
    expect(q.size()).toBe(100)
  })
})
