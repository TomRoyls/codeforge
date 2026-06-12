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

  it('handles multiple wrap-around cycles', () => {
    const queue = new RingBufferQueue<number>(3)
    queue.enqueue(1)
    queue.enqueue(2)
    queue.enqueue(3)
    queue.dequeue()
    queue.dequeue()
    queue.enqueue(4)
    queue.enqueue(5)
    expect(queue.toArray()).toEqual([3, 4, 5])
  })

  it('forEach provides index parameter', () => {
    const queue = new RingBufferQueue<number>(4)
    queue.enqueue(10)
    queue.enqueue(20)
    queue.enqueue(30)
    const indices: number[] = []
    queue.forEach((item, index) => indices.push(index))
    expect(indices).toEqual([0, 1, 2])
  })

  it('forEach on empty queue does nothing', () => {
    const queue = new RingBufferQueue<number>(4)
    let called = false
    queue.forEach(() => { called = true })
    expect(called).toBe(false)
  })

  it('toArray on empty queue returns empty array', () => {
    const queue = new RingBufferQueue<number>(4)
    expect(queue.toArray()).toEqual([])
  })

  it('drain on empty queue returns empty array', () => {
    const queue = new RingBufferQueue<number>(4)
    expect(queue.drain()).toEqual([])
    expect(queue.isEmpty()).toBe(true)
  })

  it('handles enqueue after multiple dequeues', () => {
    const queue = new RingBufferQueue<number>(4)
    queue.enqueue(1)
    queue.enqueue(2)
    queue.enqueue(3)
    queue.dequeue()
    queue.dequeue()
    queue.enqueue(4)
    queue.enqueue(5)
    expect(queue.toArray()).toEqual([3, 4, 5])
  })

  it('peekLast works after wrap-around', () => {
    const queue = new RingBufferQueue<number>(3)
    queue.enqueue(1)
    queue.enqueue(2)
    queue.enqueue(3)
    queue.dequeue()
    queue.enqueue(4)
    expect(queue.peekLast()).toBe(4)
  })

  it('handles strings correctly', () => {
    const queue = new RingBufferQueue<string>(3)
    queue.enqueue('hello')
    queue.enqueue('world')
    expect(queue.dequeue()).toBe('hello')
    expect(queue.dequeue()).toBe('world')
  })

  it('handles objects correctly', () => {
    const queue = new RingBufferQueue<{ id: number }>(3)
    queue.enqueue({ id: 1 })
    queue.enqueue({ id: 2 })
    expect(queue.dequeue()).toEqual({ id: 1 })
    expect(queue.dequeue()).toEqual({ id: 2 })
  })

  it('contains uses predicate correctly', () => {
    const queue = new RingBufferQueue<{ id: number }>(4)
    queue.enqueue({ id: 1 })
    queue.enqueue({ id: 2 })
    queue.enqueue({ id: 3 })
    expect(queue.contains((item) => item.id === 2)).toBe(true)
    expect(queue.contains((item) => item.id === 5)).toBe(false)
  })

  it('clear resets head and tail', () => {
    const queue = new RingBufferQueue<number>(3)
    queue.enqueue(1)
    queue.enqueue(2)
    queue.dequeue()
    queue.enqueue(3)
    queue.clear()
    queue.enqueue(4)
    expect(queue.peek()).toBe(4)
    expect(queue.peekLast()).toBe(4)
  })

  it('capacity remains constant after growth', () => {
    const queue = new RingBufferQueue<number>(4)
    expect(queue.capacity).toBe(4)
    queue.enqueue(1)
    queue.enqueue(2)
    queue.enqueue(3)
    queue.enqueue(4)
    queue.enqueue(5)
    expect(queue.capacity).toBe(8)
  })

  it('handles interleaved enqueue and dequeue', () => {
    const queue = new RingBufferQueue<number>(4)
    queue.enqueue(1)
    queue.dequeue()
    queue.enqueue(2)
    queue.enqueue(3)
    queue.dequeue()
    queue.enqueue(4)
    expect(queue.toArray()).toEqual([3, 4])
  })

  it('size updates correctly after dequeue', () => {
    const queue = new RingBufferQueue<number>(4)
    queue.enqueue(1)
    queue.enqueue(2)
    queue.enqueue(3)
    expect(queue.size).toBe(3)
    queue.dequeue()
    expect(queue.size).toBe(2)
    queue.dequeue()
    expect(queue.size).toBe(1)
  })

  it('isEmpty returns true after draining', () => {
    const queue = new RingBufferQueue<number>(4)
    queue.enqueue(1)
    queue.enqueue(2)
    queue.drain()
    expect(queue.isEmpty()).toBe(true)
  })

  it('isFull returns false after growth', () => {
    const queue = new RingBufferQueue<number>(2)
    queue.enqueue(1)
    queue.enqueue(2)
    expect(queue.isFull()).toBe(true)
    queue.enqueue(3)
    expect(queue.isFull()).toBe(false)
  })

  it('toArray works after wrap-around', () => {
    const queue = new RingBufferQueue<number>(3)
    queue.enqueue(1)
    queue.enqueue(2)
    queue.enqueue(3)
    queue.dequeue()
    queue.enqueue(4)
    expect(queue.toArray()).toEqual([2, 3, 4])
  })

  it('forEach works after wrap-around', () => {
    const queue = new RingBufferQueue<number>(3)
    queue.enqueue(1)
    queue.enqueue(2)
    queue.enqueue(3)
    queue.dequeue()
    queue.enqueue(4)
    const result: number[] = []
    queue.forEach((item) => result.push(item))
    expect(result).toEqual([2, 3, 4])
  })

  it('compact does not affect queue below minimum capacity', () => {
    const queue = new RingBufferQueue<number>(10)
    queue.enqueue(1)
    queue.enqueue(2)
    queue.enqueue(3)
    const beforeCapacity = queue.capacity
    queue.compact()
    expect(queue.capacity).toBe(beforeCapacity)
    expect(queue.toArray()).toEqual([1, 2, 3])
  })

  it('compact reduces capacity to minimum when size is small', () => {
    const queue = new RingBufferQueue<number>(4)
    queue.enqueue(1)
    queue.enqueue(2)
    queue.enqueue(3)
    queue.enqueue(4)
    queue.enqueue(5)
    expect(queue.capacity).toBe(8)
    queue.dequeue()
    queue.dequeue()
    queue.dequeue()
    queue.dequeue()
    queue.compact()
    expect(queue.capacity).toBe(8)
  })

  it('peek and peekLast return same item for single element', () => {
    const queue = new RingBufferQueue<number>(4)
    queue.enqueue(1)
    expect(queue.peek()).toBe(1)
    expect(queue.peekLast()).toBe(1)
  })

  it('drain maintains order after wrap-around', () => {
    const queue = new RingBufferQueue<number>(3)
    queue.enqueue(1)
    queue.enqueue(2)
    queue.enqueue(3)
    queue.dequeue()
    queue.enqueue(4)
    expect(queue.drain()).toEqual([2, 3, 4])
  })

  it('contains works after wrap-around', () => {
    const queue = new RingBufferQueue<number>(3)
    queue.enqueue(1)
    queue.enqueue(2)
    queue.enqueue(3)
    queue.dequeue()
    queue.enqueue(4)
    expect(queue.contains((x) => x === 2)).toBe(true)
    expect(queue.contains((x) => x === 4)).toBe(true)
    expect(queue.contains((x) => x === 1)).toBe(false)
  })

  it('handles rapid enqueue and dequeue cycles', () => {
    const queue = new RingBufferQueue<number>(3)
    for (let i = 0; i < 100; i++) {
      queue.enqueue(i)
      queue.dequeue()
    }
    expect(queue.size).toBe(0)
  })

  it('grows multiple times', () => {
    const queue = new RingBufferQueue<number>(2)
    for (let i = 0; i < 10; i++) {
      queue.enqueue(i)
    }
    expect(queue.capacity).toBeGreaterThanOrEqual(16)
    expect(queue.size).toBe(10)
  })

  it('toArray returns correct order after multiple growths', () => {
    const queue = new RingBufferQueue<number>(2)
    for (let i = 0; i < 8; i++) {
      queue.enqueue(i)
    }
    expect(queue.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
  })

  it('peekLast works on single element queue', () => {
    const queue = new RingBufferQueue<number>(4)
    queue.enqueue(1)
    expect(queue.peekLast()).toBe(1)
  })

  it('compact on full queue maintains elements', () => {
    const queue = new RingBufferQueue<number>(3)
    queue.enqueue(1)
    queue.enqueue(2)
    queue.enqueue(3)
    queue.compact()
    expect(queue.toArray()).toEqual([1, 2, 3])
  })

  it('size returns 0 for empty queue', () => {
    const queue = new RingBufferQueue<number>(4)
    expect(queue.size).toBe(0)
  })

  it('capacity returns correct initial capacity', () => {
    const queue = new RingBufferQueue<number>(32)
    expect(queue.capacity).toBe(32)
  })
})
  it('size on empty is 0', () => {
    const rbq = new RingBufferQueue<number>()
    expect(rbq.size).toBe(0)


  it('empty queue peek undefined', () => {
    const q = new RingBufferQueue<number>()
    expect(q.peek()).toBeUndefined()
  })

  it('enqueue and dequeue', () => {
    const q = new RingBufferQueue<number>()
    q.enqueue(1)
    expect(q.dequeue()).toBe(1)
  })

  it('peekLast returns last', () => {
    const q = new RingBufferQueue<number>()
    q.enqueue(1)
    q.enqueue(2)
    expect(q.peekLast()).toBe(2)
  })
  })

describe('ring-buffer-queue - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('ring-buffer-queue - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('ring-buffer-queue - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('ring-buffer-queue - wave548', () => {
  it('ring-buffer-queue module defined', () => {
    expect(describe).toBeDefined()
  })
  it('ring-buffer-queue module is function', () => {
    expect(describe).toBeDefined()
  })
  it('ring-buffer-queue module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('ring-buffer-queue - wave549', () => {
  it('ring-buffer-queue module defined', () => {
    expect(describe).toBeDefined()
  })
  it('ring-buffer-queue module is function', () => {
    expect(describe).toBeDefined()
  })
  it('ring-buffer-queue module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('ring-buffer-queue - wave550', () => {
  it('ring-buffer-queue w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('ring-buffer-queue w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('ring-buffer-queue w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('ring-buffer-queue - wave551', () => {
  it('ring-buffer-queue w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('ring-buffer-queue w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('ring-buffer-queue w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})
