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

  it('handles negative priorities', () => {
    const pq = new StablePriorityQueue<number>()
    pq.enqueue(-5)
    pq.enqueue(-3)
    pq.enqueue(-1)
    expect(pq.dequeue()).toBe(-5)
    expect(pq.dequeue()).toBe(-3)
    expect(pq.dequeue()).toBe(-1)
  })

  it('handles mixed positive and negative', () => {
    const pq = new StablePriorityQueue<number>()
    pq.enqueue(5)
    pq.enqueue(-3)
    pq.enqueue(0)
    pq.enqueue(-1)
    expect(pq.dequeue()).toBe(-3)
    expect(pq.dequeue()).toBe(-1)
    expect(pq.dequeue()).toBe(0)
    expect(pq.dequeue()).toBe(5)
  })

  it('peek on empty queue', () => {
    const pq = new StablePriorityQueue<number>()
    expect(pq.peek()).toBeUndefined()
  })

  it('peek after clear', () => {
    const pq = new StablePriorityQueue<number>()
    pq.enqueue(5)
    pq.enqueue(3)
    pq.clear()
    expect(pq.peek()).toBeUndefined()
  })

  it('enqueue after dequeue', () => {
    const pq = new StablePriorityQueue<number>()
    pq.enqueue(5)
    pq.enqueue(3)
    expect(pq.dequeue()).toBe(3)
    pq.enqueue(1)
    expect(pq.dequeue()).toBe(1)
    expect(pq.dequeue()).toBe(5)
  })

  it('dequeue all elements', () => {
    const pq = new StablePriorityQueue<number>()
    pq.enqueue(3)
    pq.enqueue(1)
    pq.enqueue(2)
    expect(pq.dequeue()).toBe(1)
    expect(pq.dequeue()).toBe(2)
    expect(pq.dequeue()).toBe(3)
    expect(pq.dequeue()).toBeUndefined()
  })

  it('dequeue until empty then enqueue', () => {
    const pq = new StablePriorityQueue<number>()
    pq.enqueue(1)
    expect(pq.dequeue()).toBe(1)
    expect(pq.dequeue()).toBeUndefined()
    pq.enqueue(5)
    expect(pq.dequeue()).toBe(5)
  })

  it('multiple peeks without dequeue', () => {
    const pq = new StablePriorityQueue<number>()
    pq.enqueue(5)
    pq.enqueue(3)
    expect(pq.peek()).toBe(3)
    expect(pq.peek()).toBe(3)
    expect(pq.size).toBe(2)
  })

  it('toArray on empty queue', () => {
    const pq = new StablePriorityQueue<number>()
    expect(pq.toArray()).toEqual([])
  })

  it('toArray with single element', () => {
    const pq = new StablePriorityQueue<number>()
    pq.enqueue(5)
    expect(pq.toArray()).toEqual([5])
  })

  it('clear in middle of operations', () => {
    const pq = new StablePriorityQueue<number>()
    pq.enqueue(5)
    pq.enqueue(3)
    expect(pq.dequeue()).toBe(3)
    pq.clear()
    expect(pq.isEmpty()).toBe(true)
    pq.enqueue(1)
    expect(pq.dequeue()).toBe(1)
  })

  it('size after many operations', () => {
    const pq = new StablePriorityQueue<number>()
    for (let i = 0; i < 10; i++) pq.enqueue(i)
    expect(pq.size).toBe(10)
    for (let i = 0; i < 5; i++) pq.dequeue()
    expect(pq.size).toBe(5)
  })

  it('isEmpty after partial operations', () => {
    const pq = new StablePriorityQueue<number>()
    pq.enqueue(5)
    pq.enqueue(3)
    pq.dequeue()
    expect(pq.isEmpty()).toBe(false)
    pq.dequeue()
    expect(pq.isEmpty()).toBe(true)
  })

  it('stability with many equal elements', () => {
    const pq = new StablePriorityQueue<{ p: number; id: number }>((a, b) => a.p - b.p)
    for (let i = 0; i < 10; i++) {
      pq.enqueue({ p: 1, id: i })
    }
    for (let i = 0; i < 10; i++) {
      expect(pq.dequeue()!.id).toBe(i)
    }
  })

  it('max queue behavior', () => {
    const pq = new StablePriorityQueue<number>((a, b) => b - a)
    pq.enqueue(1)
    pq.enqueue(5)
    pq.enqueue(3)
    expect(pq.peek()).toBe(5)
    expect(pq.dequeue()).toBe(5)
    expect(pq.peek()).toBe(3)
  })

  it('random order enqueue', () => {
    const pq = new StablePriorityQueue<number>()
    const values = [5, 2, 8, 1, 9, 3, 7, 4, 6]
    values.forEach(v => pq.enqueue(v))
    expect(pq.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('enqueues same value multiple times', () => {
    const pq = new StablePriorityQueue<number>()
    pq.enqueue(5)
    pq.enqueue(5)
    pq.enqueue(5)
    expect(pq.size).toBe(3)
    expect(pq.dequeue()).toBe(5)
    expect(pq.dequeue()).toBe(5)
    expect(pq.dequeue()).toBe(5)
  })

  it('custom comparator with complex object', () => {
    const pq = new StablePriorityQueue<{ priority: number; name: string }>((a, b) => a.priority - b.priority)
    pq.enqueue({ priority: 2, name: 'second' })
    pq.enqueue({ priority: 1, name: 'first' })
    pq.enqueue({ priority: 3, name: 'third' })
    expect(pq.dequeue()!.name).toBe('first')
    expect(pq.dequeue()!.name).toBe('second')
    expect(pq.dequeue()!.name).toBe('third')
  })

  it('very large values', () => {
    const pq = new StablePriorityQueue<number>()
    pq.enqueue(Number.MAX_SAFE_INTEGER)
    pq.enqueue(0)
    pq.enqueue(Number.MIN_SAFE_INTEGER)
    expect(pq.dequeue()).toBe(Number.MIN_SAFE_INTEGER)
    expect(pq.dequeue()).toBe(0)
    expect(pq.dequeue()).toBe(Number.MAX_SAFE_INTEGER)
  })

  it('stability after clear and reuse', () => {
    const pq = new StablePriorityQueue<{ p: number; id: number }>((a, b) => a.p - b.p)
    pq.enqueue({ p: 1, id: 1 })
    pq.enqueue({ p: 1, id: 2 })
    pq.clear()
    pq.enqueue({ p: 1, id: 3 })
    pq.enqueue({ p: 1, id: 4 })
    expect(pq.dequeue()!.id).toBe(3)
    expect(pq.dequeue()!.id).toBe(4)
  })

  it('interleaved enqueue dequeue with same priorities', () => {
    const pq = new StablePriorityQueue<{ p: number; id: number }>((a, b) => a.p - b.p)
    pq.enqueue({ p: 1, id: 1 })
    pq.enqueue({ p: 1, id: 2 })
    expect(pq.dequeue()!.id).toBe(1)
    pq.enqueue({ p: 1, id: 3 })
    expect(pq.dequeue()!.id).toBe(2)
    expect(pq.dequeue()!.id).toBe(3)
  })

  it('dequeue returns undefined after all removed', () => {
    const pq = new StablePriorityQueue<number>()
    pq.enqueue(5)
    pq.enqueue(3)
    pq.enqueue(1)
    pq.dequeue()
    pq.dequeue()
    pq.dequeue()
    expect(pq.dequeue()).toBeUndefined()
  })

  it('peek after multiple dequeues', () => {
    const pq = new StablePriorityQueue<number>()
    pq.enqueue(5)
    pq.enqueue(3)
    pq.enqueue(1)
    pq.enqueue(2)
    pq.dequeue()
    expect(pq.peek()).toBe(2)
    pq.dequeue()
    expect(pq.peek()).toBe(3)
  })

  it('toArray after partial dequeues', () => {
    const pq = new StablePriorityQueue<number>()
    pq.enqueue(5)
    pq.enqueue(3)
    pq.enqueue(1)
    pq.enqueue(4)
    pq.dequeue()
    pq.dequeue()
    expect(pq.toArray()).toEqual([4, 5])
  })

  it('multiple clears', () => {
    const pq = new StablePriorityQueue<number>()
    pq.enqueue(1)
    pq.clear()
    expect(pq.isEmpty()).toBe(true)
    pq.enqueue(2)
    pq.clear()
    expect(pq.isEmpty()).toBe(true)
    pq.enqueue(3)
    expect(pq.dequeue()).toBe(3)
  })

  it('size changes with dequeue', () => {
    const pq = new StablePriorityQueue<number>()
    pq.enqueue(1)
    pq.enqueue(2)
    pq.enqueue(3)
    expect(pq.size).toBe(3)
    pq.dequeue()
    expect(pq.size).toBe(2)
    pq.dequeue()
    expect(pq.size).toBe(1)
    pq.dequeue()
    expect(pq.size).toBe(0)
  })

  it('enqueue dequeue pattern maintains stability', () => {
    const pq = new StablePriorityQueue<{ p: number; id: number }>((a, b) => a.p - b.p)
    pq.enqueue({ p: 1, id: 1 })
    pq.enqueue({ p: 2, id: 2 })
    pq.enqueue({ p: 1, id: 3 })
    expect(pq.dequeue()!.id).toBe(1)
    pq.enqueue({ p: 1, id: 4 })
    expect(pq.dequeue()!.id).toBe(3)
    expect(pq.dequeue()!.id).toBe(4)
    expect(pq.dequeue()!.id).toBe(2)
  })

  it('complex custom comparator with ties', () => {
    const pq = new StablePriorityQueue<{ a: number; b: number }>((x, y) => {
      if (x.a !== y.a) return x.a - y.a
      return x.b - y.b
    })
    pq.enqueue({ a: 1, b: 2 })
    pq.enqueue({ a: 1, b: 1 })
    pq.enqueue({ a: 2, b: 1 })
    expect(pq.dequeue()!.b).toBe(1)
    expect(pq.dequeue()!.b).toBe(2)
    expect(pq.dequeue()!.b).toBe(1)
  })

  it('toArray stability with mixed priorities', () => {
    const pq = new StablePriorityQueue<{ p: number; id: number }>((a, b) => a.p - b.p)
    pq.enqueue({ p: 1, id: 1 })
    pq.enqueue({ p: 2, id: 2 })
    pq.enqueue({ p: 1, id: 3 })
    pq.enqueue({ p: 1, id: 4 })
    const arr = pq.toArray()
    expect(arr.map(x => x.id)).toEqual([1, 3, 4, 2])
  })

  it('peek stability with equals', () => {
    const pq = new StablePriorityQueue<{ p: number; id: number }>((a, b) => a.p - b.p)
    pq.enqueue({ p: 1, id: 1 })
    pq.enqueue({ p: 1, id: 2 })
    expect(pq.peek()!.id).toBe(1)
    expect(pq.peek()!.id).toBe(1)
  })
})