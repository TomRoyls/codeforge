import { describe, it, expect } from 'vitest'
import { RingBufferQueue } from '../../src/utils/ring-buffer-queue.js'

describe('RingBufferQueue', () => {
  it('creates queue with default capacity', () => {
    const queue = new RingBufferQueue<number>()
    expect(queue.capacity).toBe(16)
  })

  it('creates queue with custom capacity', () => {
    const queue = new RingBufferQueue<number>(8)
    expect(queue.capacity).toBe(8)
  })

  it('enqueues items', () => {
    const queue = new RingBufferQueue<number>(3)
    expect(queue.enqueue(1)).toBe(true)
    expect(queue.enqueue(2)).toBe(true)
    expect(queue.size).toBe(2)
  })

  it('dequeues items in FIFO order', () => {
    const queue = new RingBufferQueue<number>(3)
    queue.enqueue(1)
    queue.enqueue(2)
    queue.enqueue(3)
    expect(queue.dequeue()).toBe(1)
    expect(queue.dequeue()).toBe(2)
    expect(queue.dequeue()).toBe(3)
  })

  it('returns undefined when dequeuing empty queue', () => {
    const queue = new RingBufferQueue<number>(3)
    expect(queue.dequeue()).toBe(undefined)
  })

  it('peeks at front item without removing', () => {
    const queue = new RingBufferQueue<number>(3)
    queue.enqueue(1)
    queue.enqueue(2)
    expect(queue.peek()).toBe(1)
    expect(queue.size).toBe(2)
  })

  it('returns undefined when peeking empty queue', () => {
    const queue = new RingBufferQueue<number>(3)
    expect(queue.peek()).toBe(undefined)
  })

  it('peeks at last item', () => {
    const queue = new RingBufferQueue<number>(3)
    queue.enqueue(1)
    queue.enqueue(2)
    queue.enqueue(3)
    expect(queue.peekLast()).toBe(3)
  })

  it('returns undefined when peeking last on empty queue', () => {
    const queue = new RingBufferQueue<number>(3)
    expect(queue.peekLast()).toBe(undefined)
  })

  it('reports size correctly', () => {
    const queue = new RingBufferQueue<number>(3)
    expect(queue.size).toBe(0)
    queue.enqueue(1)
    expect(queue.size).toBe(1)
    queue.enqueue(2)
    expect(queue.size).toBe(2)
  })

  it('isEmpty returns true when empty', () => {
    const queue = new RingBufferQueue<number>(3)
    expect(queue.isEmpty()).toBe(true)
    queue.enqueue(1)
    expect(queue.isEmpty()).toBe(false)
  })

  it('isFull returns true when full', () => {
    const queue = new RingBufferQueue<number>(2)
    expect(queue.isFull()).toBe(false)
    queue.enqueue(1)
    expect(queue.isFull()).toBe(false)
    queue.enqueue(2)
    expect(queue.isFull()).toBe(true)
  })

  it('clears queue', () => {
    const queue = new RingBufferQueue<number>(3)
    queue.enqueue(1)
    queue.enqueue(2)
    queue.clear()
    expect(queue.size).toBe(0)
    expect(queue.isEmpty()).toBe(true)
    expect(queue.peek()).toBe(undefined)
  })

  it('converts to array', () => {
    const queue = new RingBufferQueue<number>(3)
    queue.enqueue(1)
    queue.enqueue(2)
    queue.enqueue(3)
    const arr = queue.toArray()
    expect(arr).toEqual([1, 2, 3])
  })

  it('handles wrap-around correctly', () => {
    const queue = new RingBufferQueue<number>(3)
    queue.enqueue(1)
    queue.enqueue(2)
    queue.enqueue(3)
    queue.dequeue()
    queue.enqueue(4)
    expect(queue.toArray()).toEqual([2, 3, 4])
  })

  it('grows when enqueuing beyond capacity', () => {
    const queue = new RingBufferQueue<number>(2)
    queue.enqueue(1)
    queue.enqueue(2)
    expect(queue.isFull()).toBe(true)
    queue.enqueue(3)
    expect(queue.capacity).toBe(4)
    expect(queue.isFull()).toBe(false)
  })

  it('handles wrap-around after growth', () => {
    const queue = new RingBufferQueue<number>(2)
    queue.enqueue(1)
    queue.enqueue(2)
    queue.dequeue()
    queue.enqueue(3)
    queue.enqueue(4)
    queue.enqueue(5)
    expect(queue.toArray()).toEqual([2, 3, 4, 5])
  })

  it('forEach iterates items in order', () => {
    const queue = new RingBufferQueue<number>(4)
    queue.enqueue(10)
    queue.enqueue(20)
    queue.enqueue(30)
    const collected: number[] = []
    queue.forEach((item) => collected.push(item))
    expect(collected).toEqual([10, 20, 30])
  })

  it('drain returns all items and clears queue', () => {
    const queue = new RingBufferQueue<number>(4)
    queue.enqueue(1)
    queue.enqueue(2)
    queue.enqueue(3)
    const items = queue.drain()
    expect(items).toEqual([1, 2, 3])
    expect(queue.isEmpty()).toBe(true)
    expect(queue.size).toBe(0)
  })

  it('contains finds matching item', () => {
    const queue = new RingBufferQueue<string>(4)
    queue.enqueue('a')
    queue.enqueue('b')
    queue.enqueue('c')
    expect(queue.contains((s) => s === 'b')).toBe(true)
    expect(queue.contains((s) => s === 'z')).toBe(false)
  })

  it('contains returns false on empty queue', () => {
    const queue = new RingBufferQueue<number>(4)
    expect(queue.contains(() => true)).toBe(false)
  })

  it('compact shrinks buffer after removals', () => {
    const queue = new RingBufferQueue<number>(4)
    for (let i = 0; i < 16; i++) queue.enqueue(i)
    expect(queue.capacity).toBeGreaterThanOrEqual(16)
    for (let i = 0; i < 15; i++) queue.dequeue()
    expect(queue.size).toBe(1)
    queue.compact()
    expect(queue.toArray()).toEqual([15])
  })

  it('compact resets empty queue to minimum capacity', () => {
    const queue = new RingBufferQueue<number>(64)
    queue.enqueue(1)
    queue.enqueue(2)
    queue.drain()
    queue.compact()
    expect(queue.capacity).toBe(16)
    expect(queue.isEmpty()).toBe(true)
  })

  it('enqueue and dequeue roundtrip', () => {
    const queue = new RingBufferQueue<number>(16)
    queue.enqueue(42)
    expect(queue.dequeue()).toBe(42)
  })
})