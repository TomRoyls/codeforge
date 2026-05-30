import { describe, expect, it } from 'vitest'

import { AmortizedPriorityQueue } from '../../../src/core/amortized-priority-queue/amortized-priority-queue.js'

describe('AmortizedPriorityQueue', () => {
  it('enqueues and dequeues in priority order', () => {
    const pq = new AmortizedPriorityQueue<number>()
    pq.enqueue(5)
    pq.enqueue(1)
    pq.enqueue(3)
    expect(pq.dequeue()).toBe(1)
    expect(pq.dequeue()).toBe(3)
    expect(pq.dequeue()).toBe(5)
  })

  it('dequeue returns undefined when empty', () => {
    const pq = new AmortizedPriorityQueue<number>()
    expect(pq.dequeue()).toBeUndefined()
  })

  it('peek returns smallest without removing', () => {
    const pq = new AmortizedPriorityQueue<number>()
    pq.enqueue(5)
    pq.enqueue(1)
    pq.enqueue(3)
    expect(pq.peek()).toBe(1)
    expect(pq.size).toBe(3)
  })

  it('peek returns undefined when empty', () => {
    const pq = new AmortizedPriorityQueue<number>()
    expect(pq.peek()).toBeUndefined()
  })

  it('size tracks count', () => {
    const pq = new AmortizedPriorityQueue<number>()
    expect(pq.size).toBe(0)
    pq.enqueue(1)
    expect(pq.size).toBe(1)
    pq.enqueue(2)
    expect(pq.size).toBe(2)
    pq.dequeue()
    expect(pq.size).toBe(1)
  })

  it('isEmpty returns correct state', () => {
    const pq = new AmortizedPriorityQueue<number>()
    expect(pq.isEmpty).toBe(true)
    pq.enqueue(1)
    expect(pq.isEmpty).toBe(false)
  })

  it('clear removes all items', () => {
    const pq = new AmortizedPriorityQueue<number>()
    pq.enqueue(1)
    pq.enqueue(2)
    pq.clear()
    expect(pq.size).toBe(0)
    expect(pq.isEmpty).toBe(true)
  })

  it('toArray returns sorted items', () => {
    const pq = new AmortizedPriorityQueue<number>()
    pq.enqueue(3)
    pq.enqueue(1)
    pq.enqueue(2)
    expect(pq.toArray()).toEqual([1, 2, 3])
  })

  it('contains checks for item presence', () => {
    const pq = new AmortizedPriorityQueue<number>()
    pq.enqueue(5)
    pq.enqueue(10)
    expect(pq.contains(5)).toBe(true)
    expect(pq.contains(10)).toBe(true)
    expect(pq.contains(99)).toBe(false)
  })

  it('remove removes item from queue', () => {
    const pq = new AmortizedPriorityQueue<number>()
    pq.enqueue(1)
    pq.enqueue(2)
    pq.enqueue(3)
    expect(pq.remove(2)).toBe(true)
    expect(pq.contains(2)).toBe(false)
    expect(pq.size).toBe(2)
  })

  it('remove returns false for missing item', () => {
    const pq = new AmortizedPriorityQueue<number>()
    pq.enqueue(1)
    expect(pq.remove(99)).toBe(false)
  })

  it('drain returns all items sorted and clears queue', () => {
    const pq = new AmortizedPriorityQueue<number>()
    pq.enqueue(3)
    pq.enqueue(1)
    pq.enqueue(2)
    const items = pq.drain()
    expect(items).toEqual([1, 2, 3])
    expect(pq.size).toBe(0)
  })

  it('flush forces buffer into heap', () => {
    const pq = new AmortizedPriorityQueue<number>({ bufferSize: 100 })
    pq.enqueue(5)
    pq.enqueue(1)
    pq.enqueue(3)
    expect(pq.bufferSize).toBe(3)
    pq.flush()
    expect(pq.bufferSize).toBe(0)
    expect(pq.heapSize).toBe(3)
  })

  it('works with custom comparator (max heap)', () => {
    const pq = new AmortizedPriorityQueue<number>({
      comparator: (a, b) => b - a,
    })
    pq.enqueue(1)
    pq.enqueue(5)
    pq.enqueue(3)
    expect(pq.dequeue()).toBe(5)
    expect(pq.dequeue()).toBe(3)
    expect(pq.dequeue()).toBe(1)
  })

  it('merge combines two queues', () => {
    const pq1 = new AmortizedPriorityQueue<number>()
    pq1.enqueue(1)
    pq1.enqueue(5)
    const pq2 = new AmortizedPriorityQueue<number>()
    pq2.enqueue(2)
    pq2.enqueue(3)
    pq1.merge(pq2)
    expect(pq1.size).toBe(4)
    expect(pq2.size).toBe(0)
    expect(pq1.dequeue()).toBe(1)
    expect(pq1.dequeue()).toBe(2)
    expect(pq1.dequeue()).toBe(3)
    expect(pq1.dequeue()).toBe(5)
  })

  it('handles many items', () => {
    const pq = new AmortizedPriorityQueue<number>()
    for (let i = 100; i >= 0; i--) {
      pq.enqueue(i)
    }
    for (let i = 0; i <= 100; i++) {
      expect(pq.dequeue()).toBe(i)
    }
  })

  it('auto-flushes when buffer exceeds bufferSize', () => {
    const pq = new AmortizedPriorityQueue<number>({ bufferSize: 3 })
    pq.enqueue(1)
    pq.enqueue(2)
    expect(pq.bufferSize).toBe(2)
    pq.enqueue(3)
    expect(pq.bufferSize).toBe(0)
    expect(pq.heapSize).toBe(3)
  })

  it('handles string items', () => {
    const pq = new AmortizedPriorityQueue<string>()
    pq.enqueue('cherry')
    pq.enqueue('apple')
    pq.enqueue('banana')
    expect(pq.dequeue()).toBe('apple')
    expect(pq.dequeue()).toBe('banana')
    expect(pq.dequeue()).toBe('cherry')
  })

  it('handles duplicate values', () => {
    const pq = new AmortizedPriorityQueue<number>()
    pq.enqueue(1)
    pq.enqueue(1)
    pq.enqueue(2)
    expect(pq.dequeue()).toBe(1)
    expect(pq.dequeue()).toBe(1)
    expect(pq.dequeue()).toBe(2)
  })
})
