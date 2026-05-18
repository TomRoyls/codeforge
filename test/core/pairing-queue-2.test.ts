import { describe, expect, it } from 'vitest'
import { PairingQueue2 } from '../../src/core/pairing-queue-2/index.js'

// ─── Constructor ───

describe('PairingQueue2 constructor', () => {
  it('creates an empty queue with default comparator', () => {
    const queue = new PairingQueue2<number>()
    expect(queue.size).toBe(0)
    expect(queue.isEmpty()).toBe(true)
    expect(queue.peek()).toBeUndefined()
  })

  it('creates a queue with a custom comparator (max-priority)', () => {
    const queue = new PairingQueue2<number>((a, b) => b - a)
    queue.enqueue(1)
    queue.enqueue(3)
    queue.enqueue(2)
    expect(queue.peek()).toBe(3)
  })
})

// ─── Enqueue ───

describe('PairingQueue2 enqueue', () => {
  it('enqueues a single element', () => {
    const queue = new PairingQueue2<number>()
    queue.enqueue(5)
    expect(queue.size).toBe(1)
    expect(queue.isEmpty()).toBe(false)
    expect(queue.peek()).toBe(5)
  })

  it('enqueues multiple elements and maintains min at front', () => {
    const queue = new PairingQueue2<number>()
    queue.enqueue(5)
    queue.enqueue(3)
    queue.enqueue(7)
    queue.enqueue(1)
    expect(queue.size).toBe(4)
    expect(queue.peek()).toBe(1)
  })

  it('handles duplicate values', () => {
    const queue = new PairingQueue2<number>()
    queue.enqueue(3)
    queue.enqueue(3)
    queue.enqueue(3)
    expect(queue.size).toBe(3)
    expect(queue.peek()).toBe(3)
  })

  it('handles negative values', () => {
    const queue = new PairingQueue2<number>()
    queue.enqueue(-5)
    queue.enqueue(3)
    queue.enqueue(-10)
    expect(queue.peek()).toBe(-10)
  })
})

// ─── Dequeue ───

describe('PairingQueue2 dequeue', () => {
  it('dequeues elements in sorted order', () => {
    const queue = new PairingQueue2<number>()
    queue.enqueue(5)
    queue.enqueue(3)
    queue.enqueue(1)
    queue.enqueue(4)
    queue.enqueue(2)
    expect(queue.dequeue()).toBe(1)
    expect(queue.dequeue()).toBe(2)
    expect(queue.dequeue()).toBe(3)
    expect(queue.dequeue()).toBe(4)
    expect(queue.dequeue()).toBe(5)
    expect(queue.dequeue()).toBeUndefined()
  })

  it('returns undefined on empty queue', () => {
    const queue = new PairingQueue2<number>()
    expect(queue.dequeue()).toBeUndefined()
  })

  it('updates size after dequeue', () => {
    const queue = new PairingQueue2<number>()
    queue.enqueue(1)
    queue.enqueue(2)
    queue.dequeue()
    expect(queue.size).toBe(1)
    queue.dequeue()
    expect(queue.size).toBe(0)
    expect(queue.isEmpty()).toBe(true)
  })

  it('handles single element dequeue', () => {
    const queue = new PairingQueue2<number>()
    queue.enqueue(42)
    expect(queue.dequeue()).toBe(42)
    expect(queue.isEmpty()).toBe(true)
    expect(queue.peek()).toBeUndefined()
  })
})

// ─── Peek ───

describe('PairingQueue2 peek', () => {
  it('returns min without removing', () => {
    const queue = new PairingQueue2<number>()
    queue.enqueue(3)
    queue.enqueue(1)
    queue.enqueue(2)
    expect(queue.peek()).toBe(1)
    expect(queue.peek()).toBe(1)
    expect(queue.size).toBe(3)
  })

  it('returns undefined on empty queue', () => {
    const queue = new PairingQueue2<number>()
    expect(queue.peek()).toBeUndefined()
  })
})

// ─── Merge ───

describe('PairingQueue2 merge', () => {
  it('merges two queues', () => {
    const queue1 = new PairingQueue2<number>()
    queue1.enqueue(1)
    queue1.enqueue(4)
    const queue2 = new PairingQueue2<number>()
    queue2.enqueue(2)
    queue2.enqueue(3)
    queue1.merge(queue2)
    expect(queue1.size).toBe(4)
    expect(queue2.size).toBe(0)
    expect(queue2.isEmpty()).toBe(true)
    expect(queue1.dequeue()).toBe(1)
    expect(queue1.dequeue()).toBe(2)
    expect(queue1.dequeue()).toBe(3)
    expect(queue1.dequeue()).toBe(4)
  })

  it('merges into empty queue', () => {
    const queue1 = new PairingQueue2<number>()
    const queue2 = new PairingQueue2<number>()
    queue2.enqueue(5)
    queue2.enqueue(3)
    queue1.merge(queue2)
    expect(queue1.size).toBe(2)
    expect(queue1.dequeue()).toBe(3)
    expect(queue1.dequeue()).toBe(5)
  })

  it('merges empty queue into non-empty', () => {
    const queue1 = new PairingQueue2<number>()
    queue1.enqueue(1)
    const queue2 = new PairingQueue2<number>()
    queue1.merge(queue2)
    expect(queue1.size).toBe(1)
    expect(queue1.peek()).toBe(1)
  })

  it('merges two empty queues', () => {
    const queue1 = new PairingQueue2<number>()
    const queue2 = new PairingQueue2<number>()
    queue1.merge(queue2)
    expect(queue1.size).toBe(0)
    expect(queue1.isEmpty()).toBe(true)
  })

  it('no-op when merging with itself', () => {
    const queue = new PairingQueue2<number>()
    queue.enqueue(1)
    queue.enqueue(2)
    queue.merge(queue)
    expect(queue.size).toBe(2)
  })
})

// ─── Clear ───

describe('PairingQueue2 clear', () => {
  it('clears the queue', () => {
    const queue = new PairingQueue2<number>()
    queue.enqueue(1)
    queue.enqueue(2)
    queue.enqueue(3)
    queue.clear()
    expect(queue.size).toBe(0)
    expect(queue.isEmpty()).toBe(true)
    expect(queue.peek()).toBeUndefined()
  })
})

// ─── ToArray ───

describe('PairingQueue2 toArray', () => {
  it('returns sorted array without modifying queue', () => {
    const queue = new PairingQueue2<number>()
    queue.enqueue(5)
    queue.enqueue(3)
    queue.enqueue(1)
    queue.enqueue(4)
    queue.enqueue(2)
    expect(queue.toArray()).toEqual([1, 2, 3, 4, 5])
    expect(queue.size).toBe(5)
    expect(queue.peek()).toBe(1)
  })

  it('returns empty array for empty queue', () => {
    const queue = new PairingQueue2<number>()
    expect(queue.toArray()).toEqual([])
  })
})

// ─── FromArray ───

describe('PairingQueue2 fromArray', () => {
  it('creates queue from array', () => {
    const queue = PairingQueue2.fromArray([5, 3, 1, 4, 2])
    expect(queue.size).toBe(5)
    expect(queue.dequeue()).toBe(1)
    expect(queue.dequeue()).toBe(2)
    expect(queue.dequeue()).toBe(3)
    expect(queue.dequeue()).toBe(4)
    expect(queue.dequeue()).toBe(5)
  })

  it('creates queue from empty array', () => {
    const queue = PairingQueue2.fromArray([])
    expect(queue.size).toBe(0)
    expect(queue.isEmpty()).toBe(true)
  })

  it('creates queue with custom comparator', () => {
    const queue = PairingQueue2.fromArray([1, 2, 3], (a, b) => b - a)
    expect(queue.peek()).toBe(3)
  })
})

// ─── String values ───

describe('PairingQueue2 with strings', () => {
  it('works with string values', () => {
    const queue = new PairingQueue2<string>()
    queue.enqueue('cherry')
    queue.enqueue('apple')
    queue.enqueue('banana')
    expect(queue.dequeue()).toBe('apple')
    expect(queue.dequeue()).toBe('banana')
    expect(queue.dequeue()).toBe('cherry')
  })
})
