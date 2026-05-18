import { describe, expect, it } from 'vitest'

import { AsyncQueue } from '../src/utils/async-queue.js'

// ─── basic enqueue/dequeue ────────────────────────────
describe('AsyncQueue basic', () => {
  it('enqueues and dequeues items', async () => {
    const q = new AsyncQueue<number>()
    q.enqueue(1)
    q.enqueue(2)
    expect(await q.dequeue()).toBe(1)
    expect(await q.dequeue()).toBe(2)
  })

  it('returns undefined for peek on empty', () => {
    const q = new AsyncQueue<number>()
    expect(q.peek()).toBeUndefined()
  })

  it('peek returns first item without removing', () => {
    const q = new AsyncQueue<string>()
    q.enqueue('a')
    q.enqueue('b')
    expect(q.peek()).toBe('a')
    expect(q.size).toBe(2)
  })
})

// ─── async waiting ────────────────────────────────────
describe('AsyncQueue async waiting', () => {
  it('resolves waiting dequeue when item arrives', async () => {
    const q = new AsyncQueue<string>()
    const promise = q.dequeue()
    q.enqueue('hello')
    expect(await promise).toBe('hello')
  })

  it('tracks pending waiters', () => {
    const q = new AsyncQueue<number>()
    q.dequeue()
    q.dequeue()
    expect(q.pending).toBe(2)
  })
})

// ─── close ────────────────────────────────────────────
describe('AsyncQueue close', () => {
  it('prevents new enqueues after close', () => {
    const q = new AsyncQueue<number>()
    q.close()
    expect(() => q.enqueue(1)).toThrow('AsyncQueue is closed')
  })

  it('rejects dequeue on closed empty queue', async () => {
    const q = new AsyncQueue<number>()
    q.close()
    await expect(q.dequeue()).rejects.toThrow('AsyncQueue is closed and empty')
  })

  it('still allows dequeue of remaining items after close', async () => {
    const q = new AsyncQueue<number>()
    q.enqueue(42)
    q.close()
    expect(await q.dequeue()).toBe(42)
  })
})

// ─── stats ────────────────────────────────────────────
describe('AsyncQueue stats', () => {
  it('tracks enqueued and dequeued counts', async () => {
    const q = new AsyncQueue<number>()
    q.enqueue(1)
    q.enqueue(2)
    await q.dequeue()
    const stats = q.getStats()
    expect(stats.enqueued).toBe(2)
    expect(stats.dequeued).toBe(1)
    expect(stats.size).toBe(1)
  })
})

// ─── iteration ────────────────────────────────────────
describe('AsyncQueue iteration', () => {
  it('is iterable', () => {
    const q = new AsyncQueue<number>()
    q.enqueue(1)
    q.enqueue(2)
    q.enqueue(3)
    const items = [...q]
    expect(items).toEqual([1, 2, 3])
  })
})
