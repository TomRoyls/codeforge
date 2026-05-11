import { describe, it, expect } from 'vitest'
import { ConcurrentQueue } from '../../src/core/concurrent-queue-2/index.js'

describe('ConcurrentQueue', () => {
  describe('constructor', () => {
    it('creates an unbounded queue by default', () => {
      const q = new ConcurrentQueue<number>()
      expect(q.size).toBe(0)
      expect(q.isEmpty).toBe(true)
      expect(q.capacity).toBeUndefined()
    })

    it('creates a bounded queue with capacity option', () => {
      const q = new ConcurrentQueue<number>({ capacity: 5 })
      expect(q.capacity).toBe(5)
    })

    it('creates queue with capacity 1', () => {
      const q = new ConcurrentQueue<string>({ capacity: 1 })
      expect(q.capacity).toBe(1)
    })

    it('creates queue with no options', () => {
      const q = new ConcurrentQueue()
      expect(q.size).toBe(0)
    })
  })

  describe('enqueue', () => {
    it('adds an item to the queue', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      expect(q.size).toBe(1)
    })

    it('adds multiple items maintaining order', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('works with strings', () => {
      const q = new ConcurrentQueue<string>()
      q.enqueue('a')
      q.enqueue('b')
      expect(q.toArray()).toEqual(['a', 'b'])
    })

    it('works with objects', () => {
      const q = new ConcurrentQueue<{ x: number }>()
      q.enqueue({ x: 1 })
      q.enqueue({ x: 2 })
      expect(q.size).toBe(2)
    })

    it('works with null values', () => {
      const q = new ConcurrentQueue<null>()
      q.enqueue(null)
      expect(q.size).toBe(1)
      expect(q.peek()).toBeNull()
    })

    it('works with undefined values', () => {
      const q = new ConcurrentQueue<undefined>()
      q.enqueue(undefined)
      expect(q.size).toBe(1)
    })

    it('throws when enqueuing to a full bounded queue', () => {
      const q = new ConcurrentQueue<number>({ capacity: 2 })
      q.enqueue(1)
      q.enqueue(2)
      expect(() => q.enqueue(3)).toThrow('Queue is full')
    })

    it('throws when enqueuing to a closed queue', () => {
      const q = new ConcurrentQueue<number>()
      q.close()
      expect(() => q.enqueue(1)).toThrow('Queue is closed')
    })

    it('allows filling to exact capacity', () => {
      const q = new ConcurrentQueue<number>({ capacity: 3 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.size).toBe(3)
      expect(q.isFull).toBe(true)
    })
  })

  describe('dequeue', () => {
    it('removes and returns the front item', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
    })

    it('maintains FIFO order', () => {
      const q = new ConcurrentQueue<string>()
      q.enqueue('first')
      q.enqueue('second')
      q.enqueue('third')
      expect(q.dequeue()).toBe('first')
      expect(q.dequeue()).toBe('second')
      expect(q.dequeue()).toBe('third')
    })

    it('throws on empty queue', () => {
      const q = new ConcurrentQueue<number>()
      expect(() => q.dequeue()).toThrow('Queue is empty')
    })

    it('updates size after dequeue', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.size).toBe(1)
    })

    it('dequeued item is removed from queue', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(42)
      q.dequeue()
      expect(q.toArray()).toEqual([])
    })
  })

  describe('peek', () => {
    it('returns the front item without removing it', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      expect(q.peek()).toBe(1)
      expect(q.size).toBe(2)
    })

    it('returns undefined for empty queue', () => {
      const q = new ConcurrentQueue<number>()
      expect(q.peek()).toBeUndefined()
    })

    it('returns the same item on multiple calls', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(99)
      expect(q.peek()).toBe(99)
      expect(q.peek()).toBe(99)
      expect(q.peek()).toBe(99)
    })

    it('updates after dequeue', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.peek()).toBe(2)
    })
  })

  describe('size', () => {
    it('returns 0 for new queue', () => {
      const q = new ConcurrentQueue()
      expect(q.size).toBe(0)
    })

    it('increases with enqueue', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      expect(q.size).toBe(1)
      q.enqueue(2)
      expect(q.size).toBe(2)
    })

    it('decreases with dequeue', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.size).toBe(1)
    })

    it('is 0 after clear', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      expect(q.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('is true for new queue', () => {
      const q = new ConcurrentQueue()
      expect(q.isEmpty).toBe(true)
    })

    it('is false after enqueue', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      expect(q.isEmpty).toBe(false)
    })

    it('is true after dequeuing all items', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.dequeue()
      expect(q.isEmpty).toBe(true)
    })

    it('is true after clear', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      expect(q.isEmpty).toBe(true)
    })
  })

  describe('capacity', () => {
    it('returns undefined for unbounded queue', () => {
      const q = new ConcurrentQueue<number>()
      expect(q.capacity).toBeUndefined()
    })

    it('returns the capacity for bounded queue', () => {
      const q = new ConcurrentQueue<number>({ capacity: 10 })
      expect(q.capacity).toBe(10)
    })

    it('isFull is false for unbounded queue', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      expect(q.isFull).toBe(false)
    })

    it('isFull is true when capacity reached', () => {
      const q = new ConcurrentQueue<number>({ capacity: 2 })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.isFull).toBe(true)
    })

    it('isFull is false when not at capacity', () => {
      const q = new ConcurrentQueue<number>({ capacity: 5 })
      q.enqueue(1)
      expect(q.isFull).toBe(false)
    })

    it('remainingCapacity returns undefined for unbounded', () => {
      const q = new ConcurrentQueue<number>()
      expect(q.remainingCapacity).toBeUndefined()
    })

    it('remainingCapacity returns correct value', () => {
      const q = new ConcurrentQueue<number>({ capacity: 5 })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.remainingCapacity).toBe(3)
    })

    it('remainingCapacity is 0 when full', () => {
      const q = new ConcurrentQueue<number>({ capacity: 2 })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.remainingCapacity).toBe(0)
    })
  })

  describe('clear', () => {
    it('removes all items', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.clear()
      expect(q.size).toBe(0)
      expect(q.isEmpty).toBe(true)
    })

    it('works on already empty queue', () => {
      const q = new ConcurrentQueue<number>()
      q.clear()
      expect(q.size).toBe(0)
    })

    it('allows enqueue after clear', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.clear()
      q.enqueue(2)
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(2)
    })

    it('allows enqueue after clear on bounded queue', () => {
      const q = new ConcurrentQueue<number>({ capacity: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      q.enqueue(3)
      expect(q.size).toBe(1)
      expect(q.isFull).toBe(false)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty queue', () => {
      const q = new ConcurrentQueue<number>()
      expect(q.toArray()).toEqual([])
    })

    it('returns items in order', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('returns a copy of the items', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      const arr = q.toArray()
      arr.push(2)
      expect(q.size).toBe(1)
    })

    it('reflects current state', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.toArray()).toEqual([2])
    })
  })

  describe('forEach', () => {
    it('iterates over all items in order', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const result: number[] = []
      q.forEach((v) => result.push(v))
      expect(result).toEqual([1, 2, 3])
    })

    it('provides correct index', () => {
      const q = new ConcurrentQueue<string>()
      q.enqueue('a')
      q.enqueue('b')
      const indices: number[] = []
      q.forEach((_, i) => indices.push(i))
      expect(indices).toEqual([0, 1])
    })

    it('does nothing for empty queue', () => {
      const q = new ConcurrentQueue<number>()
      let count = 0
      q.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('provides value and index together', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(10)
      q.enqueue(20)
      const pairs: [number, number][] = []
      q.forEach((v, i) => pairs.push([v, i]))
      expect(pairs).toEqual([[10, 0], [20, 1]])
    })
  })

  describe('drain', () => {
    it('drains all items when no count given', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const drained = q.drain()
      expect(drained).toEqual([1, 2, 3])
      expect(q.size).toBe(0)
    })

    it('drains specified number of items', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const drained = q.drain(2)
      expect(drained).toEqual([1, 2])
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(3)
    })

    it('drains fewer items if count exceeds size', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      const drained = q.drain(10)
      expect(drained).toEqual([1, 2])
      expect(q.size).toBe(0)
    })

    it('returns empty array for empty queue', () => {
      const q = new ConcurrentQueue<number>()
      expect(q.drain()).toEqual([])
    })

    it('drain(0) returns empty array', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      expect(q.drain(0)).toEqual([])
      expect(q.size).toBe(1)
    })

    it('drain with count 1 returns single element array', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      expect(q.drain(1)).toEqual([1])
      expect(q.size).toBe(1)
    })
  })

  describe('offer', () => {
    it('adds item and returns true for unbounded queue', () => {
      const q = new ConcurrentQueue<number>()
      expect(q.offer(1)).toBe(true)
      expect(q.size).toBe(1)
    })

    it('returns false when bounded queue is full', () => {
      const q = new ConcurrentQueue<number>({ capacity: 1 })
      q.offer(1)
      expect(q.offer(2)).toBe(false)
    })

    it('returns false when queue is closed', () => {
      const q = new ConcurrentQueue<number>()
      q.close()
      expect(q.offer(1)).toBe(false)
    })

    it('successfully adds to non-full bounded queue', () => {
      const q = new ConcurrentQueue<number>({ capacity: 3 })
      expect(q.offer(1)).toBe(true)
      expect(q.offer(2)).toBe(true)
      expect(q.offer(3)).toBe(true)
      expect(q.offer(4)).toBe(false)
    })

    it('offered items are dequeued in FIFO order', () => {
      const q = new ConcurrentQueue<number>()
      q.offer(10)
      q.offer(20)
      expect(q.dequeue()).toBe(10)
      expect(q.dequeue()).toBe(20)
    })

    it('offer after dequeue from full queue succeeds', () => {
      const q = new ConcurrentQueue<number>({ capacity: 1 })
      q.offer(1)
      q.dequeue()
      expect(q.offer(2)).toBe(true)
    })
  })

  describe('poll', () => {
    it('returns undefined for empty queue', () => {
      const q = new ConcurrentQueue<number>()
      expect(q.poll()).toBeUndefined()
    })

    it('removes and returns the front item', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      expect(q.poll()).toBe(1)
      expect(q.poll()).toBe(2)
    })

    it('returns undefined after all items polled', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.poll()
      expect(q.poll()).toBeUndefined()
    })

    it('updates size correctly', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.poll()
      expect(q.size).toBe(1)
    })

    it('maintains FIFO order with mixed offer/poll', () => {
      const q = new ConcurrentQueue<string>()
      q.offer('a')
      q.offer('b')
      q.offer('c')
      expect(q.poll()).toBe('a')
      expect(q.poll()).toBe('b')
      expect(q.poll()).toBe('c')
    })
  })

  describe('put (blocking enqueue)', () => {
    it('immediately resolves when queue is not full', async () => {
      const q = new ConcurrentQueue<number>()
      await q.put(1)
      expect(q.size).toBe(1)
    })

    it('immediately resolves for unbounded queue', async () => {
      const q = new ConcurrentQueue<number>()
      await q.put(1)
      await q.put(2)
      await q.put(3)
      expect(q.size).toBe(3)
    })

    it('blocks when queue is full and resolves after dequeue', async () => {
      const q = new ConcurrentQueue<number>({ capacity: 1 })
      await q.put(1)
      let resolved = false
      const putPromise = q.put(2).then(() => { resolved = true })
      await new Promise((r) => setTimeout(r, 10))
      expect(resolved).toBe(false)
      expect(q.size).toBe(1)
      q.dequeue()
      await putPromise
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(2)
    })

    it('resolves multiple waiting puts as space becomes available', async () => {
      const q = new ConcurrentQueue<number>({ capacity: 1 })
      await q.put(1)
      const p1 = q.put(2)
      const p2 = q.put(3)
      await new Promise((r) => setTimeout(r, 10))
      q.dequeue()
      await p1
      q.dequeue()
      await p2
      expect(q.size).toBe(1)
    })

    it('rejects when queue is closed', async () => {
      const q = new ConcurrentQueue<number>()
      q.close()
      await expect(q.put(1)).rejects.toThrow('Queue is closed')
    })

    it('works with bounded queue at capacity boundary', async () => {
      const q = new ConcurrentQueue<number>({ capacity: 2 })
      await q.put(1)
      await q.put(2)
      expect(q.isFull).toBe(true)
    })
  })

  describe('take (blocking dequeue)', () => {
    it('immediately resolves when queue has items', async () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(42)
      const value = await q.take()
      expect(value).toBe(42)
      expect(q.size).toBe(0)
    })

    it('blocks when queue is empty and resolves after enqueue', async () => {
      const q = new ConcurrentQueue<number>()
      let result: number | undefined
      const takePromise = q.take().then((v) => { result = v })
      await new Promise((r) => setTimeout(r, 10))
      expect(result).toBeUndefined()
      q.enqueue(99)
      await takePromise
      expect(result).toBe(99)
    })

    it('resolves multiple waiting takes as items arrive', async () => {
      const q = new ConcurrentQueue<number>()
      const results: (number | undefined)[] = []
      const t1 = q.take().then((v) => results.push(v))
      const t2 = q.take().then((v) => results.push(v))
      await new Promise((r) => setTimeout(r, 10))
      q.enqueue(1)
      q.enqueue(2)
      await t1
      await t2
      expect(results.sort()).toEqual([1, 2])
    })

    it('resolves undefined when queue is closed', async () => {
      const q = new ConcurrentQueue<number>()
      const takePromise = q.take()
      q.close()
      const value = await takePromise
      expect(value).toBeUndefined()
    })

    it('FIFO order for waiting consumers', async () => {
      const q = new ConcurrentQueue<number>()
      const results: number[] = []
      const t1 = q.take().then((v) => results.push(v))
      const t2 = q.take().then((v) => results.push(v))
      await new Promise((r) => setTimeout(r, 10))
      q.enqueue(10)
      q.enqueue(20)
      await t1
      await t2
      expect(results).toEqual([10, 20])
    })
  })

  describe('close', () => {
    it('marks queue as closed', () => {
      const q = new ConcurrentQueue<number>()
      q.close()
      expect(q.isClosed).toBe(true)
    })

    it('prevents enqueue after close', () => {
      const q = new ConcurrentQueue<number>()
      q.close()
      expect(() => q.enqueue(1)).toThrow('Queue is closed')
    })

    it('prevents offer after close', () => {
      const q = new ConcurrentQueue<number>()
      q.close()
      expect(q.offer(1)).toBe(false)
    })

    it('allows dequeue after close if items remain', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.close()
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
    })

    it('allows poll after close if items remain', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.close()
      expect(q.poll()).toBe(1)
    })

    it('isClosed is false before close', () => {
      const q = new ConcurrentQueue<number>()
      expect(q.isClosed).toBe(false)
    })

    it('resolves waiting takes with undefined on close', async () => {
      const q = new ConcurrentQueue<number>()
      const result = q.take()
      q.close()
      expect(await result).toBeUndefined()
    })

    it('resolves waiting puts on close', async () => {
      const q = new ConcurrentQueue<number>({ capacity: 1 })
      await q.put(1)
      const putResult = q.put(2)
      q.close()
      await putResult
    })

    it('double close is idempotent', () => {
      const q = new ConcurrentQueue<number>()
      q.close()
      q.close()
      expect(q.isClosed).toBe(true)
    })
  })

  describe('contains', () => {
    it('returns true if item is in queue', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.contains(2)).toBe(true)
    })

    it('returns false if item is not in queue', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      expect(q.contains(99)).toBe(false)
    })

    it('returns false for empty queue', () => {
      const q = new ConcurrentQueue<number>()
      expect(q.contains(1)).toBe(false)
    })

    it('finds items after partial drain', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect(q.contains(2)).toBe(true)
      expect(q.contains(1)).toBe(false)
    })

    it('works with string values', () => {
      const q = new ConcurrentQueue<string>()
      q.enqueue('hello')
      expect(q.contains('hello')).toBe(true)
      expect(q.contains('world')).toBe(false)
    })
  })

  describe('remove', () => {
    it('removes item and returns true', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.remove(2)).toBe(true)
      expect(q.toArray()).toEqual([1, 3])
    })

    it('returns false if item not found', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      expect(q.remove(99)).toBe(false)
    })

    it('removes first occurrence', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(1)
      expect(q.remove(1)).toBe(true)
      expect(q.toArray()).toEqual([2, 1])
    })

    it('returns false for empty queue', () => {
      const q = new ConcurrentQueue<number>()
      expect(q.remove(1)).toBe(false)
    })

    it('updates size correctly', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.remove(1)
      expect(q.size).toBe(1)
    })

    it('remove from bounded queue frees capacity', () => {
      const q = new ConcurrentQueue<number>({ capacity: 2 })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.isFull).toBe(true)
      q.remove(1)
      expect(q.isFull).toBe(false)
      expect(q.offer(3)).toBe(true)
    })
  })

  describe('concurrent operations', () => {
    it('multiple concurrent takes resolve correctly', async () => {
      const q = new ConcurrentQueue<number>()
      const takes = [q.take(), q.take(), q.take()]
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      const results = await Promise.all(takes)
      expect(results.sort()).toEqual([10, 20, 30])
    })

    it('put and take work together', async () => {
      const q = new ConcurrentQueue<number>({ capacity: 1 })
      const results: number[] = []
      const produce = (async () => {
        for (let i = 0; i < 5; i++) {
          await q.put(i)
        }
      })()
      const consume = (async () => {
        for (let i = 0; i < 5; i++) {
          results.push(await q.take())
        }
      })()
      await Promise.all([produce, consume])
      expect(results).toEqual([0, 1, 2, 3, 4])
    })

    it('handles interleaved enqueue and dequeue', () => {
      const q = new ConcurrentQueue<number>()
      for (let i = 0; i < 100; i++) {
        q.enqueue(i)
        if (i % 2 === 0) {
          q.dequeue()
        }
      }
      expect(q.size).toBe(50)
    })

    it('offer/poll cycle', () => {
      const q = new ConcurrentQueue<number>()
      for (let i = 0; i < 100; i++) {
        expect(q.offer(i)).toBe(true)
        expect(q.poll()).toBe(i)
      }
      expect(q.isEmpty).toBe(true)
    })

    it('drain after multiple operations', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      q.enqueue(3)
      q.enqueue(4)
      expect(q.drain()).toEqual([2, 3, 4])
    })
  })

  describe('generics', () => {
    it('works with number type', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(42)
      expect(q.dequeue()).toBe(42)
    })

    it('works with string type', () => {
      const q = new ConcurrentQueue<string>()
      q.enqueue('hello')
      expect(q.dequeue()).toBe('hello')
    })

    it('works with boolean type', () => {
      const q = new ConcurrentQueue<boolean>()
      q.enqueue(true)
      q.enqueue(false)
      expect(q.drain()).toEqual([true, false])
    })

    it('works with object type', () => {
      const q = new ConcurrentQueue<{ id: number; name: string }>()
      q.enqueue({ id: 1, name: 'a' })
      const item = q.dequeue()
      expect(item.id).toBe(1)
      expect(item.name).toBe('a')
    })

    it('works with array type', () => {
      const q = new ConcurrentQueue<number[]>()
      q.enqueue([1, 2, 3])
      expect(q.dequeue()).toEqual([1, 2, 3])
    })

    it('works with Map type', () => {
      const q = new ConcurrentQueue<Map<string, number>>()
      const m = new Map([['a', 1]])
      q.enqueue(m)
      expect(q.dequeue()).toBe(m)
    })

    it('works with Set type', () => {
      const q = new ConcurrentQueue<Set<number>>()
      const s = new Set([1, 2, 3])
      q.enqueue(s)
      expect(q.dequeue()).toBe(s)
    })

    it('works with union types', () => {
      const q = new ConcurrentQueue<string | number>()
      q.enqueue('hello')
      q.enqueue(42)
      expect(q.drain()).toEqual(['hello', 42])
    })

    it('works with default unknown type', () => {
      const q = new ConcurrentQueue()
      q.enqueue(1)
      q.enqueue('test')
      expect(q.size).toBe(2)
    })
  })

  describe('static fromArray', () => {
    it('creates queue from array', () => {
      const q = ConcurrentQueue.fromArray([1, 2, 3])
      expect(q.size).toBe(3)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('creates empty queue from empty array', () => {
      const q = ConcurrentQueue.fromArray([])
      expect(q.isEmpty).toBe(true)
    })

    it('creates bounded queue from array', () => {
      const q = ConcurrentQueue.fromArray([1, 2], { capacity: 5 })
      expect(q.capacity).toBe(5)
      expect(q.size).toBe(2)
    })

    it('preserves order', () => {
      const q = ConcurrentQueue.fromArray(['x', 'y', 'z'])
      expect(q.dequeue()).toBe('x')
      expect(q.dequeue()).toBe('y')
      expect(q.dequeue()).toBe('z')
    })

    it('returns correct generic type', () => {
      const q = ConcurrentQueue.fromArray<number>([1, 2, 3])
      const val: number = q.dequeue()
      expect(val).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('handles large number of items', () => {
      const q = new ConcurrentQueue<number>()
      for (let i = 0; i < 10000; i++) {
        q.enqueue(i)
      }
      expect(q.size).toBe(10000)
      expect(q.peek()).toBe(0)
    })

    it('handles enqueue dequeue cycle', () => {
      const q = new ConcurrentQueue<number>()
      for (let i = 0; i < 100; i++) {
        q.enqueue(i)
        expect(q.dequeue()).toBe(i)
      }
      expect(q.isEmpty).toBe(true)
    })

    it('clear during blocking put resolves the put', async () => {
      const q = new ConcurrentQueue<number>({ capacity: 1 })
      await q.put(1)
      const putPromise = q.put(2)
      q.clear()
      await putPromise
      expect(q.size).toBe(1)
    })

    it('drain with exact count', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.drain(3)).toEqual([1, 2, 3])
      expect(q.size).toBe(0)
    })

    it('peek after drain returns undefined', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.drain()
      expect(q.peek()).toBeUndefined()
    })

    it('forEach after partial dequeue', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      const items: number[] = []
      q.forEach((v) => items.push(v))
      expect(items).toEqual([2, 3])
    })

    it('toArray does not mutate queue', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      const arr = q.toArray()
      arr.reverse()
      expect(q.toArray()).toEqual([1, 2])
    })

    it('remove last element', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      expect(q.remove(2)).toBe(true)
      expect(q.toArray()).toEqual([1])
    })

    it('remove first element', () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      expect(q.remove(1)).toBe(true)
      expect(q.toArray()).toEqual([2])
    })

    it('put on unbounded queue never blocks', async () => {
      const q = new ConcurrentQueue<number>()
      const promises = []
      for (let i = 0; i < 100; i++) {
        promises.push(q.put(i))
      }
      await Promise.all(promises)
      expect(q.size).toBe(100)
    })

    it('take resolves immediately with available items', async () => {
      const q = new ConcurrentQueue<number>()
      q.enqueue(42)
      const value = await q.take()
      expect(value).toBe(42)
    })

    it('capacity 1 queue works correctly', async () => {
      const q = new ConcurrentQueue<number>({ capacity: 1 })
      q.enqueue(1)
      expect(q.isFull).toBe(true)
      q.dequeue()
      expect(q.isFull).toBe(false)
      q.enqueue(2)
      expect(q.dequeue()).toBe(2)
    })
  })
})
