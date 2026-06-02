import { describe, expect, it } from 'vitest'
import { PersistentQueue } from '../../src/utils/persistent-queue.js'

describe('PersistentQueue', () => {
  it('enqueues and dequeues', () => {
    const q0 = PersistentQueue.create<number>()
    const q1 = q0.enqueue(1)
    const q2 = q1.enqueue(2)
    const r1 = q2.dequeue()
    expect(r1).not.toBeNull()
    expect(r1!.value).toBe(1)
    const r2 = r1!.queue.dequeue()
    expect(r2!.value).toBe(2)
  })

  it('preserves previous versions', () => {
    const q0 = PersistentQueue.create<number>()
    const q1 = q0.enqueue(1)
    const q2 = q1.enqueue(2)
    expect(q0.size).toBe(0)
    expect(q1.size).toBe(1)
    expect(q2.size).toBe(2)
  })

  it('handles empty dequeue', () => {
    const q = PersistentQueue.create<number>()
    expect(q.dequeue()).toBeNull()
  })

  it('size and isEmpty work', () => {
    const q = PersistentQueue.create<string>()
    expect(q.isEmpty).toBe(true)
    const q1 = q.enqueue('a')
    expect(q1.isEmpty).toBe(false)
    expect(q1.size).toBe(1)
  })

  it('peek returns front element', () => {
    const q = PersistentQueue.create<number>()
    const q1 = q.enqueue(1)
    const q2 = q1.enqueue(2)
    expect(q2.peek()).toBe(1)
  })

  it('toArray returns elements in order', () => {
    const q = PersistentQueue.create<number>()
      .enqueue(1).enqueue(2).enqueue(3)
    expect(q.toArray()).toEqual([1, 2, 3])
  })

  it('handles many operations', () => {
    let q = PersistentQueue.create<number>()
    for (let i = 0; i < 10; i++) q = q.enqueue(i)
    expect(q.size).toBe(10)
    const arr: number[] = []
    let cur = q
    while (!cur.isEmpty) {
      const r = cur.dequeue()!
      arr.push(r.value)
      cur = r.queue
    }
    expect(arr).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('peek on empty returns undefined', () => {
    expect(PersistentQueue.create<number>().peek()).toBeUndefined()
  })

  it('handles string elements', () => {
    const q = PersistentQueue.create<string>().enqueue('x').enqueue('y')
    expect(q.toArray()).toEqual(['x', 'y'])
  })

  it('interleaved enqueue dequeue preserves order', () => {
    const q0 = PersistentQueue.create<number>()
    const q1 = q0.enqueue(1)
    const r1 = q1.dequeue()!
    expect(r1.value).toBe(1)
    const q2 = r1.queue.enqueue(2)
    expect(q2.toArray()).toEqual([2])
  })

  it('dequeue all returns elements in FIFO order', () => {
    let q = PersistentQueue.create<number>()
    for (let i = 0; i < 5; i++) q = q.enqueue(i * 10)
    const result: number[] = []
    while (!q.isEmpty) {
      const r = q.dequeue()!
      result.push(r.value)
      q = r.queue
    }
    expect(result).toEqual([0, 10, 20, 30, 40])
  })

  it('persists old version after enqueue', () => {
    const q0 = PersistentQueue.create<number>()
    const q1 = q0.enqueue(1)
    const q2 = q1.enqueue(2)
    expect(q0.isEmpty).toBe(true)
    expect(q1.toArray()).toEqual([1])
    expect(q2.toArray()).toEqual([1, 2])
  })

  it('dequeue empty returns null', () => {
    const q = PersistentQueue.create<number>()
    expect(q.dequeue()).toBeNull()
  })

  it('size tracks correctly after dequeue', () => {
    const q = PersistentQueue.create<number>().enqueue(1).enqueue(2)
    const r = q.dequeue()!
    expect(r.queue.size).toBe(1)
  })

  it('toArray preserves FIFO order after many ops', () => {
    let q = PersistentQueue.create<number>()
    for (let i = 0; i < 5; i++) q = q.enqueue(i)
    expect(q.toArray()).toEqual([0, 1, 2, 3, 4])
    const r = q.dequeue()!
    expect(r.queue.toArray()).toEqual([1, 2, 3, 4])
  })

  it('handles enqueue dequeue single element', () => {
    const q = PersistentQueue.create<number>().enqueue(42)
    const r = q.dequeue()!
    expect(r.value).toBe(42)
    expect(r.queue.isEmpty).toBe(true)
  })

  it('handles multiple enqueues', () => {
    let q = PersistentQueue.create<number>()
    q = q.enqueue(1).enqueue(2).enqueue(3)
    expect(q.size).toBe(3)
  })

  it('dequeue returns first element', () => {
    let q = PersistentQueue.create<number>()
    q = q.enqueue(10).enqueue(20)
    const result = q.dequeue()
    expect(result).not.toBeNull()
    expect(result!.value).toBe(10)
    expect(result!.queue.size).toBe(1)
  })

  it('enqueue and dequeue roundtrip', () => {
    const q0 = new PersistentQueue<number>([], [])
    const q1 = q0.enqueue(10)
    const result = q1.dequeue()
    expect(result).not.toBeNull()
    expect(result!.value).toBe(10)
  })
})
