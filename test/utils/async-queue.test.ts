import { describe, expect, it } from 'vitest'

import { AsyncQueue } from '../../src/utils/async-queue.js'

// ─── Empty queue state ──────────────────────────────────
describe('AsyncQueue - empty queue', () => {
  it('starts with size 0', () => {
    const q = new AsyncQueue<number>()
    expect(q.size).toBe(0)
  })

  it('starts with 0 pending', () => {
    const q = new AsyncQueue<number>()
    expect(q.pending).toBe(0)
  })

  it('starts as not closed', () => {
    const q = new AsyncQueue<number>()
    expect(q.closed).toBe(false)
  })

  it('peek returns undefined when empty', () => {
    const q = new AsyncQueue<number>()
    expect(q.peek()).toBeUndefined()
  })

  it('getStats reflects empty state', () => {
    const q = new AsyncQueue<number>()
    expect(q.getStats()).toEqual({
      size: 0,
      pending: 0,
      enqueued: 0,
      dequeued: 0,
      closed: false,
    })
  })
})

// ─── Enqueue ────────────────────────────────────────────
describe('AsyncQueue - enqueue', () => {
  it('increases size after enqueue', () => {
    const q = new AsyncQueue<number>()
    q.enqueue(1)
    expect(q.size).toBe(1)
  })

  it('enqueue multiple items increases size', () => {
    const q = new AsyncQueue<number>()
    q.enqueue(1)
    q.enqueue(2)
    q.enqueue(3)
    expect(q.size).toBe(3)
  })

  it('throws when enqueuing to a closed queue', () => {
    const q = new AsyncQueue<number>()
    q.close()
    expect(() => q.enqueue(1)).toThrow('AsyncQueue is closed')
  })

  it('tracks enqueued count in getStats', () => {
    const q = new AsyncQueue<string>()
    q.enqueue('a')
    q.enqueue('b')
    expect(q.getStats().enqueued).toBe(2)
  })

  it('peek returns the first enqueued item', () => {
    const q = new AsyncQueue<number>()
    q.enqueue(10)
    q.enqueue(20)
    expect(q.peek()).toBe(10)
  })
})

// ─── Dequeue ────────────────────────────────────────────
describe('AsyncQueue - dequeue', () => {
  it('dequeue resolves immediately when items are queued', async () => {
    const q = new AsyncQueue<number>()
    q.enqueue(42)
    const value = await q.dequeue()
    expect(value).toBe(42)
  })

  it('dequeue reduces size', async () => {
    const q = new AsyncQueue<number>()
    q.enqueue(1)
    q.enqueue(2)
    await q.dequeue()
    expect(q.size).toBe(1)
  })

  it('dequeue returns items in FIFO order', async () => {
    const q = new AsyncQueue<string>()
    q.enqueue('first')
    q.enqueue('second')
    q.enqueue('third')
    expect(await q.dequeue()).toBe('first')
    expect(await q.dequeue()).toBe('second')
    expect(await q.dequeue()).toBe('third')
  })

  it('dequeue tracks dequeued count in getStats', async () => {
    const q = new AsyncQueue<number>()
    q.enqueue(1)
    q.enqueue(2)
    await q.dequeue()
    await q.dequeue()
    expect(q.getStats().dequeued).toBe(2)
  })

  it('dequeue on closed empty queue rejects', async () => {
    const q = new AsyncQueue<number>()
    q.close()
    await expect(q.dequeue()).rejects.toThrow('AsyncQueue is closed and empty')
  })

  it('dequeue still resolves queued items after close', async () => {
    const q = new AsyncQueue<number>()
    q.enqueue(10)
    q.close()
    expect(await q.dequeue()).toBe(10)
  })

  it('dequeue resolves when item arrives later', async () => {
    const q = new AsyncQueue<number>()
    const promise = q.dequeue()
    expect(q.pending).toBe(1)
    q.enqueue(99)
    expect(await promise).toBe(99)
    expect(q.pending).toBe(0)
  })
})

// ─── Pending / waiting consumers ────────────────────────
describe('AsyncQueue - pending', () => {
  it('tracks multiple pending consumers', () => {
    const q = new AsyncQueue<number>()
    void q.dequeue()
    void q.dequeue()
    void q.dequeue()
    expect(q.pending).toBe(3)
  })

  it('pending decreases as items are enqueued', async () => {
    const q = new AsyncQueue<number>()
    const p1 = q.dequeue()
    const p2 = q.dequeue()
    expect(q.pending).toBe(2)
    q.enqueue(1)
    expect(q.pending).toBe(1)
    q.enqueue(2)
    expect(q.pending).toBe(0)
    await Promise.all([p1, p2])
  })

  it('enqueued item goes directly to waiter instead of queue', async () => {
    const q = new AsyncQueue<number>()
    const p = q.dequeue()
    q.enqueue(77)
    expect(q.size).toBe(0)
    expect(await p).toBe(77)
  })
})

// ─── Close ──────────────────────────────────────────────
describe('AsyncQueue - close', () => {
  it('sets closed to true', () => {
    const q = new AsyncQueue<number>()
    q.close()
    expect(q.closed).toBe(true)
  })

  it('getStats shows closed after close', () => {
    const q = new AsyncQueue<number>()
    q.close()
    expect(q.getStats().closed).toBe(true)
  })

  it('pending is 0 after close', () => {
    const q = new AsyncQueue<number>()
    void q.dequeue()
    void q.dequeue()
    expect(q.pending).toBe(2)
    q.close()
    expect(q.pending).toBe(0)
  })

  it('close does not remove queued items', () => {
    const q = new AsyncQueue<number>()
    q.enqueue(1)
    q.enqueue(2)
    q.close()
    expect(q.size).toBe(2)
  })

  it('pending promises never settle after close', async () => {
    const q = new AsyncQueue<number>()
    const p = q.dequeue()
    q.close()
    const result = await Promise.race([
      p.then(() => 'resolved'),
      new Promise<string>((r) => setTimeout(() => r('timeout'), 50)),
    ])
    expect(result).toBe('timeout')
  })
})

// ─── Iterator ───────────────────────────────────────────
describe('AsyncQueue - iterator', () => {
  it('iterates over queued items without modifying queue', () => {
    const q = new AsyncQueue<number>()
    q.enqueue(1)
    q.enqueue(2)
    q.enqueue(3)
    const items: number[] = []
    for (const item of q) {
      items.push(item)
    }
    expect(items).toEqual([1, 2, 3])
    expect(q.size).toBe(3)
  })

  it('iterator on empty queue yields nothing', () => {
    const q = new AsyncQueue<number>()
    const items: number[] = []
    for (const item of q) {
      items.push(item)
    }
    expect(items).toEqual([])
  })
})

// ─── Generic types ──────────────────────────────────────
describe('AsyncQueue - generic types', () => {
  it('works with string type', async () => {
    const q = new AsyncQueue<string>()
    q.enqueue('hello')
    expect(await q.dequeue()).toBe('hello')
  })

  it('works with object type', async () => {
    const q = new AsyncQueue<{ id: number; name: string }>()
    const obj = { id: 1, name: 'test' }
    q.enqueue(obj)
    expect(await q.dequeue()).toBe(obj)
  })
})

// ─── Concurrency patterns ───────────────────────────────
describe('AsyncQueue - concurrency patterns', () => {
  it('multiple concurrent dequeue then enqueue resolves all', async () => {
    const q = new AsyncQueue<number>()
    const p1 = q.dequeue()
    const p2 = q.dequeue()
    const p3 = q.dequeue()
    q.enqueue(1)
    q.enqueue(2)
    q.enqueue(3)
    const results = await Promise.all([p1, p2, p3])
    expect(results).toEqual([1, 2, 3])
  })

  it('interleaved enqueue and dequeue', async () => {
    const q = new AsyncQueue<number>()
    q.enqueue(1)
    const r1 = q.dequeue()
    const r2 = q.dequeue()
    q.enqueue(2)
    const r3 = q.dequeue()
    q.enqueue(3)
    expect(await r1).toBe(1)
    expect(await r2).toBe(2)
    expect(await r3).toBe(3)
    expect(q.size).toBe(0)
    expect(q.pending).toBe(0)
  })
})
