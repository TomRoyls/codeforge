import {
  BlockingQueue,
  DEFAULT_BLOCKING_QUEUE_CAPACITY,
} from '../src/core/blocking-queue/blocking-queue.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('BlockingQueue', () => {
  describe('constructor', () => {
    it('creates a queue with default capacity', () => {
      const q = new BlockingQueue()
      expect(q.capacity).toBe(DEFAULT_BLOCKING_QUEUE_CAPACITY)
      expect(q.size).toBe(0)
    })

    it('creates a queue with a number argument for capacity', () => {
      const q = new BlockingQueue(5)
      expect(q.capacity).toBe(5)
      expect(q.size).toBe(0)
    })

    it('creates a queue from an options object', () => {
      const q = new BlockingQueue({ capacity: 32 })
      expect(q.capacity).toBe(32)
      expect(q.size).toBe(0)
    })

    it('creates a queue from an empty options object (uses default)', () => {
      const q = new BlockingQueue({})
      expect(q.capacity).toBe(DEFAULT_BLOCKING_QUEUE_CAPACITY)
    })

    it('clamps capacity to minimum of 1 when passed 0', () => {
      const q = new BlockingQueue(0)
      expect(q.capacity).toBe(1)
    })

    it('clamps capacity to minimum of 1 when passed negative number', () => {
      const q = new BlockingQueue(-10)
      expect(q.capacity).toBe(1)
    })

    it('clamps capacity to 1 via options object with capacity 0', () => {
      const q = new BlockingQueue({ capacity: 0 })
      expect(q.capacity).toBe(1)
    })

    it('creates a queue with capacity 1', () => {
      const q = new BlockingQueue(1)
      expect(q.capacity).toBe(1)
    })
  })

  // ─── DEFAULT_BLOCKING_QUEUE_CAPACITY export ────────────────────────────

  describe('DEFAULT_BLOCKING_QUEUE_CAPACITY', () => {
    it('is 16', () => {
      expect(DEFAULT_BLOCKING_QUEUE_CAPACITY).toBe(16)
    })
  })

  // ─── enqueue ──────────────────────────────────────────────────────────

  describe('enqueue', () => {
    it('returns true on successful enqueue', () => {
      const q = new BlockingQueue<number>(5)
      expect(q.enqueue(1)).toBe(true)
    })

    it('increments size after enqueue', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      expect(q.size).toBe(1)
      q.enqueue(2)
      expect(q.size).toBe(2)
    })

    it('returns false when queue is full', () => {
      const q = new BlockingQueue<number>(2)
      expect(q.enqueue(1)).toBe(true)
      expect(q.enqueue(2)).toBe(true)
      expect(q.enqueue(3)).toBe(false)
    })

    it('preserves size when enqueue fails on full queue', () => {
      const q = new BlockingQueue<number>(2)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.size).toBe(2)
    })

    it('handles string items', () => {
      const q = new BlockingQueue<string>(3)
      expect(q.enqueue('a')).toBe(true)
      expect(q.enqueue('b')).toBe(true)
      expect(q.size).toBe(2)
    })

    it('handles object items', () => {
      const q = new BlockingQueue<{ id: number }>(3)
      const obj = { id: 1 }
      expect(q.enqueue(obj)).toBe(true)
      expect(q.size).toBe(1)
    })

    it('handles null and undefined items', () => {
      const q = new BlockingQueue<number | null | undefined>(4)
      expect(q.enqueue(null)).toBe(true)
      expect(q.enqueue(undefined)).toBe(true)
      expect(q.size).toBe(2)
    })

    it('allows enqueue after dequeue frees space', () => {
      const q = new BlockingQueue<number>(2)
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.enqueue(3)).toBe(true)
      expect(q.size).toBe(2)
    })

    it('works with capacity 1', () => {
      const q = new BlockingQueue<number>(1)
      expect(q.enqueue(42)).toBe(true)
      expect(q.enqueue(99)).toBe(false)
    })
  })

  // ─── dequeue ──────────────────────────────────────────────────────────

  describe('dequeue', () => {
    it('returns the first enqueued item (FIFO)', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      expect(q.dequeue()).toBe(10)
      expect(q.dequeue()).toBe(20)
      expect(q.dequeue()).toBe(30)
    })

    it('returns undefined when queue is empty', () => {
      const q = new BlockingQueue<number>(5)
      expect(q.dequeue()).toBeUndefined()
    })

    it('decrements size after dequeue', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.size).toBe(2)
      q.dequeue()
      expect(q.size).toBe(1)
      q.dequeue()
      expect(q.size).toBe(0)
    })

    it('size stays at 0 when dequeueing from empty queue', () => {
      const q = new BlockingQueue<number>(5)
      q.dequeue()
      expect(q.size).toBe(0)
    })

    it('handles dequeue after wrap-around', () => {
      const q = new BlockingQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.enqueue(4)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
      expect(q.dequeue()).toBe(4)
    })

    it('returns undefined for repeated dequeues on empty queue', () => {
      const q = new BlockingQueue<number>(3)
      expect(q.dequeue()).toBeUndefined()
      expect(q.dequeue()).toBeUndefined()
      expect(q.dequeue()).toBeUndefined()
    })

    it('works with capacity 1', () => {
      const q = new BlockingQueue<number>(1)
      q.enqueue(42)
      expect(q.dequeue()).toBe(42)
      expect(q.dequeue()).toBeUndefined()
    })
  })

  // ─── peek ─────────────────────────────────────────────────────────────

  describe('peek', () => {
    it('returns the front item without removing it', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.peek()).toBe(1)
      expect(q.size).toBe(2)
    })

    it('returns undefined when queue is empty', () => {
      const q = new BlockingQueue<number>(5)
      expect(q.peek()).toBeUndefined()
    })

    it('updates after dequeue', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      q.dequeue()
      expect(q.peek()).toBe(20)
    })

    it('does not modify the queue', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.peek()
      q.peek()
      q.peek()
      expect(q.size).toBe(2)
      expect(q.peek()).toBe(1)
    })
  })

  // ─── peekBack ─────────────────────────────────────────────────────────

  describe('peekBack', () => {
    it('returns the last enqueued item', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.peekBack()).toBe(3)
    })

    it('returns the only item when size is 1', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(42)
      expect(q.peekBack()).toBe(42)
    })

    it('returns undefined when queue is empty', () => {
      const q = new BlockingQueue<number>(5)
      expect(q.peekBack()).toBeUndefined()
    })

    it('does not modify the queue', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.peekBack()
      expect(q.size).toBe(2)
      expect(q.peekBack()).toBe(2)
    })

    it('updates after enqueue', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      expect(q.peekBack()).toBe(1)
      q.enqueue(2)
      expect(q.peekBack()).toBe(2)
    })

    it('works correctly after wrap-around', () => {
      const q = new BlockingQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.enqueue(4)
      expect(q.peekBack()).toBe(4)
    })
  })

  // ─── size ─────────────────────────────────────────────────────────────

  describe('size', () => {
    it('returns 0 for new queue', () => {
      const q = new BlockingQueue<number>(5)
      expect(q.size).toBe(0)
    })

    it('reflects number of enqueued items', () => {
      const q = new BlockingQueue<number>(10)
      for (let i = 0; i < 5; i++) q.enqueue(i)
      expect(q.size).toBe(5)
    })

    it('reflects after enqueue and dequeue', () => {
      const q = new BlockingQueue<number>(10)
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.size).toBe(1)
    })

    it('returns to 0 after clearing all items', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      q.dequeue()
      expect(q.size).toBe(0)
    })
  })

  // ─── isEmpty ──────────────────────────────────────────────────────────

  describe('isEmpty', () => {
    it('returns true for new queue', () => {
      const q = new BlockingQueue<number>(5)
      expect(q.isEmpty()).toBe(true)
    })

    it('returns false after enqueue', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      expect(q.isEmpty()).toBe(false)
    })

    it('returns true after all items dequeued', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.dequeue()
      expect(q.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      expect(q.isEmpty()).toBe(true)
    })
  })

  // ─── isFull ───────────────────────────────────────────────────────────

  describe('isFull', () => {
    it('returns false for empty queue', () => {
      const q = new BlockingQueue<number>(5)
      expect(q.isFull()).toBe(false)
    })

    it('returns false when partially full', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.isFull()).toBe(false)
    })

    it('returns true when full', () => {
      const q = new BlockingQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.isFull()).toBe(true)
    })

    it('returns false after dequeue from full queue', () => {
      const q = new BlockingQueue<number>(2)
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.isFull()).toBe(false)
    })

    it('returns true for capacity 1 with one item', () => {
      const q = new BlockingQueue<number>(1)
      q.enqueue(1)
      expect(q.isFull()).toBe(true)
    })
  })

  // ─── capacity ─────────────────────────────────────────────────────────

  describe('capacity', () => {
    it('returns the configured capacity', () => {
      const q = new BlockingQueue<number>(10)
      expect(q.capacity).toBe(10)
    })

    it('returns default capacity when none specified', () => {
      const q = new BlockingQueue()
      expect(q.capacity).toBe(DEFAULT_BLOCKING_QUEUE_CAPACITY)
    })

    it('does not change after enqueue/dequeue operations', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.dequeue()
      expect(q.capacity).toBe(5)
    })
  })

  // ─── remainingCapacity ────────────────────────────────────────────────

  describe('remainingCapacity', () => {
    it('equals capacity for empty queue', () => {
      const q = new BlockingQueue<number>(5)
      expect(q.remainingCapacity()).toBe(5)
    })

    it('decreases after enqueue', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      expect(q.remainingCapacity()).toBe(4)
      q.enqueue(2)
      expect(q.remainingCapacity()).toBe(3)
    })

    it('is 0 when queue is full', () => {
      const q = new BlockingQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.remainingCapacity()).toBe(0)
    })

    it('increases after dequeue', () => {
      const q = new BlockingQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect(q.remainingCapacity()).toBe(1)
    })

    it('returns to full after clear', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      expect(q.remainingCapacity()).toBe(5)
    })
  })

  // ─── clear ────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all items', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.clear()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('allows reuse after clearing', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      q.enqueue(3)
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(3)
    })

    it('works on an already empty queue', () => {
      const q = new BlockingQueue<number>(5)
      q.clear()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('preserves capacity', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.clear()
      expect(q.capacity).toBe(5)
    })

    it('resets remaining capacity to full', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      expect(q.remainingCapacity()).toBe(5)
    })

    it('dequeued items after clear are undefined', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.clear()
      expect(q.dequeue()).toBeUndefined()
    })
  })

  // ─── toArray ──────────────────────────────────────────────────────────

  describe('toArray', () => {
    it('returns empty array for empty queue', () => {
      const q = new BlockingQueue<number>(5)
      expect(q.toArray()).toEqual([])
    })

    it('returns items in FIFO order', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('returns a snapshot — modifications do not affect the array', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      const arr = q.toArray()
      q.dequeue()
      expect(arr).toEqual([1, 2])
    })

    it('reflects state after partial dequeue', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect(q.toArray()).toEqual([2, 3])
    })

    it('returns correct order after wrap-around', () => {
      const q = new BlockingQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.enqueue(4)
      expect(q.toArray()).toEqual([2, 3, 4])
    })
  })

  // ─── forEach ──────────────────────────────────────────────────────────

  describe('forEach', () => {
    it('iterates over all items in order', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      const items: number[] = []
      q.forEach((item) => items.push(item))
      expect(items).toEqual([10, 20, 30])
    })

    it('provides correct index', () => {
      const q = new BlockingQueue<string>(5)
      q.enqueue('a')
      q.enqueue('b')
      q.enqueue('c')
      const indices: number[] = []
      q.forEach((_item, index) => indices.push(index))
      expect(indices).toEqual([0, 1, 2])
    })

    it('does not iterate on empty queue', () => {
      const q = new BlockingQueue<number>(5)
      let count = 0
      q.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('works after wrap-around', () => {
      const q = new BlockingQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.enqueue(4)
      const items: number[] = []
      q.forEach((item) => items.push(item))
      expect(items).toEqual([2, 3, 4])
    })
  })

  // ─── contains ─────────────────────────────────────────────────────────

  describe('contains', () => {
    it('returns true for an item in the queue', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.contains(2)).toBe(true)
    })

    it('returns false for an item not in the queue', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.contains(99)).toBe(false)
    })

    it('returns false for empty queue', () => {
      const q = new BlockingQueue<number>(5)
      expect(q.contains(1)).toBe(false)
    })

    it('finds items after wrap-around', () => {
      const q = new BlockingQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.enqueue(4)
      expect(q.contains(4)).toBe(true)
      expect(q.contains(1)).toBe(false)
    })

    it('uses strict equality', () => {
      const q = new BlockingQueue<string>(5)
      q.enqueue('hello')
      expect(q.contains('hello')).toBe(true)
      expect(q.contains('HELLO')).toBe(false)
    })

    it('works with object references', () => {
      const obj = { id: 1 }
      const q = new BlockingQueue<{ id: number }>(5)
      q.enqueue(obj)
      expect(q.contains(obj)).toBe(true)
      expect(q.contains({ id: 1 })).toBe(false)
    })

    it('returns false after item is dequeued', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.contains(1)).toBe(false)
      expect(q.contains(2)).toBe(true)
    })
  })

  // ─── remove ───────────────────────────────────────────────────────────

  describe('remove', () => {
    it('removes an item from the queue', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.remove(2)).toBe(true)
      expect(q.toArray()).toEqual([1, 3])
    })

    it('returns false for item not in queue', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.remove(99)).toBe(false)
    })

    it('decrements size after removal', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.remove(2)
      expect(q.size).toBe(2)
    })

    it('removes the first occurrence', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(1)
      expect(q.remove(1)).toBe(true)
      expect(q.toArray()).toEqual([2, 1])
    })

    it('removes from front of queue', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.remove(1)).toBe(true)
      expect(q.toArray()).toEqual([2, 3])
    })

    it('removes from back of queue', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.remove(3)).toBe(true)
      expect(q.toArray()).toEqual([1, 2])
    })

    it('removes the only item', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(42)
      expect(q.remove(42)).toBe(true)
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('returns false for empty queue', () => {
      const q = new BlockingQueue<number>(5)
      expect(q.remove(1)).toBe(false)
    })

    it('frees capacity after removal', () => {
      const q = new BlockingQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.isFull()).toBe(true)
      q.remove(2)
      expect(q.isFull()).toBe(false)
      expect(q.remainingCapacity()).toBe(1)
    })
  })

  // ─── drain ────────────────────────────────────────────────────────────

  describe('drain', () => {
    it('returns all items and clears the queue', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const items = q.drain()
      expect(items).toEqual([1, 2, 3])
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('returns empty array for empty queue', () => {
      const q = new BlockingQueue<number>(5)
      expect(q.drain()).toEqual([])
    })

    it('allows reuse after drain', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.drain()
      q.enqueue(2)
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(2)
    })

    it('returns items in FIFO order', () => {
      const q = new BlockingQueue<string>(5)
      q.enqueue('a')
      q.enqueue('b')
      q.enqueue('c')
      expect(q.drain()).toEqual(['a', 'b', 'c'])
    })
  })

  // ─── clone ────────────────────────────────────────────────────────────

  describe('clone', () => {
    it('creates an independent copy with same items', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const cloned = q.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3])
      expect(cloned.size).toBe(3)
    })

    it('has the same capacity', () => {
      const q = new BlockingQueue<number>(10)
      q.enqueue(1)
      const cloned = q.clone()
      expect(cloned.capacity).toBe(10)
    })

    it('modifications to clone do not affect original', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      const cloned = q.clone()
      cloned.dequeue()
      cloned.enqueue(99)
      expect(q.toArray()).toEqual([1, 2])
      expect(cloned.toArray()).toEqual([2, 99])
    })

    it('modifications to original do not affect clone', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      const cloned = q.clone()
      q.clear()
      expect(cloned.toArray()).toEqual([1, 2])
    })

    it('cloning an empty queue works', () => {
      const q = new BlockingQueue<number>(5)
      const cloned = q.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
      expect(cloned.capacity).toBe(5)
    })

    it('clones correctly after wrap-around', () => {
      const q = new BlockingQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.enqueue(4)
      const cloned = q.clone()
      expect(cloned.toArray()).toEqual([2, 3, 4])
    })
  })

  // ─── Symbol.iterator ─────────────────────────────────────────────────

  describe('Symbol.iterator', () => {
    it('iterates over items in FIFO order', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const items: number[] = []
      for (const item of q) {
        items.push(item)
      }
      expect(items).toEqual([1, 2, 3])
    })

    it('works with spread operator', () => {
      const q = new BlockingQueue<string>(5)
      q.enqueue('x')
      q.enqueue('y')
      expect([...q]).toEqual(['x', 'y'])
    })

    it('yields nothing for empty queue', () => {
      const q = new BlockingQueue<number>(5)
      const items: number[] = []
      for (const item of q) {
        items.push(item)
      }
      expect(items).toEqual([])
    })

    it('works after wrap-around', () => {
      const q = new BlockingQueue<number>(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.enqueue(4)
      expect([...q]).toEqual([2, 3, 4])
    })
  })

  // ─── enqueueMany ─────────────────────────────────────────────────────

  describe('enqueueMany', () => {
    it('enqueues multiple items and returns count', () => {
      const q = new BlockingQueue<number>(5)
      expect(q.enqueueMany([1, 2, 3])).toBe(3)
      expect(q.size).toBe(3)
    })

    it('stops enqueuing when full and returns partial count', () => {
      const q = new BlockingQueue<number>(3)
      expect(q.enqueueMany([1, 2, 3, 4, 5])).toBe(3)
      expect(q.size).toBe(3)
      expect(q.isFull()).toBe(true)
    })

    it('returns 0 for empty array', () => {
      const q = new BlockingQueue<number>(5)
      expect(q.enqueueMany([])).toBe(0)
      expect(q.size).toBe(0)
    })

    it('enqueues into an already partially full queue', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      expect(q.enqueueMany([2, 3])).toBe(2)
      expect(q.size).toBe(3)
    })

    it('respects remaining capacity', () => {
      const q = new BlockingQueue<number>(3)
      q.enqueue(1)
      expect(q.enqueueMany([2, 3, 4])).toBe(2)
      expect(q.toArray()).toEqual([1, 2, 3])
    })
  })

  // ─── dequeueMany ─────────────────────────────────────────────────────

  describe('dequeueMany', () => {
    it('dequeues requested number of items', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.dequeueMany(2)).toEqual([1, 2])
      expect(q.size).toBe(1)
    })

    it('dequeues all available if count exceeds size', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.dequeueMany(10)).toEqual([1, 2])
      expect(q.size).toBe(0)
    })

    it('returns empty array for empty queue', () => {
      const q = new BlockingQueue<number>(5)
      expect(q.dequeueMany(3)).toEqual([])
    })

    it('returns empty array when count is 0', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      expect(q.dequeueMany(0)).toEqual([])
      expect(q.size).toBe(1)
    })

    it('returns items in FIFO order', () => {
      const q = new BlockingQueue<string>(5)
      q.enqueue('a')
      q.enqueue('b')
      q.enqueue('c')
      expect(q.dequeueMany(2)).toEqual(['a', 'b'])
    })
  })

  // ─── Wrap-around behavior ─────────────────────────────────────────────

  describe('circular buffer wrap-around', () => {
    it('handles multiple wrap-around cycles', () => {
      const q = new BlockingQueue<number>(3)
      // Cycle 1
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.dequeue()
      q.dequeue()
      // Cycle 2
      q.enqueue(4)
      q.enqueue(5)
      q.enqueue(6)
      q.dequeue()
      // Cycle 3
      q.enqueue(7)
      expect(q.toArray()).toEqual([5, 6, 7])
    })

    it('handles alternating enqueue/dequeue', () => {
      const q = new BlockingQueue<number>(2)
      q.enqueue(1)
      q.dequeue()
      q.enqueue(2)
      q.dequeue()
      q.enqueue(3)
      expect(q.peek()).toBe(3)
      expect(q.size).toBe(1)
    })

    it('maintains FIFO order through wrap-around', () => {
      const q = new BlockingQueue<number>(4)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.dequeue()
      q.dequeue()
      q.enqueue(5)
      q.enqueue(6)
      expect(q.toArray()).toEqual([3, 4, 5, 6])
      expect(q.dequeue()).toBe(3)
      expect(q.dequeue()).toBe(4)
      expect(q.dequeue()).toBe(5)
      expect(q.dequeue()).toBe(6)
    })
  })

  // ─── Edge cases ───────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('single element lifecycle', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(42)
      expect(q.size).toBe(1)
      expect(q.isEmpty()).toBe(false)
      expect(q.isFull()).toBe(false)
      expect(q.peek()).toBe(42)
      expect(q.peekBack()).toBe(42)
      expect(q.contains(42)).toBe(true)
      expect(q.dequeue()).toBe(42)
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('capacity 1 full lifecycle', () => {
      const q = new BlockingQueue<number>(1)
      expect(q.enqueue(1)).toBe(true)
      expect(q.isFull()).toBe(true)
      expect(q.enqueue(2)).toBe(false)
      expect(q.dequeue()).toBe(1)
      expect(q.isEmpty()).toBe(true)
      expect(q.enqueue(3)).toBe(true)
      expect(q.peek()).toBe(3)
    })

    it('fill and drain completely', () => {
      const q = new BlockingQueue<number>(5)
      for (let i = 0; i < 5; i++) q.enqueue(i + 1)
      expect(q.isFull()).toBe(true)
      const items = q.drain()
      expect(items).toEqual([1, 2, 3, 4, 5])
      expect(q.isEmpty()).toBe(true)
      expect(q.remainingCapacity()).toBe(5)
    })

    it('repeated fill and drain cycles', () => {
      const q = new BlockingQueue<number>(3)
      for (let cycle = 0; cycle < 5; cycle++) {
        for (let i = 0; i < 3; i++) q.enqueue(cycle * 3 + i)
        expect(q.isFull()).toBe(true)
        q.clear()
        expect(q.isEmpty()).toBe(true)
      }
      expect(q.capacity).toBe(3)
    })

    it('enqueue after multiple clear cycles', () => {
      const q = new BlockingQueue<number>(3)
      q.enqueue(1)
      q.clear()
      q.enqueue(2)
      q.clear()
      q.enqueue(3)
      expect(q.peek()).toBe(3)
      expect(q.size).toBe(1)
    })

    it('works with various types', () => {
      const strQ = new BlockingQueue<string>(3)
      strQ.enqueue('hello')
      expect(strQ.dequeue()).toBe('hello')

      const boolQ = new BlockingQueue<boolean>(3)
      boolQ.enqueue(true)
      boolQ.enqueue(false)
      expect(boolQ.toArray()).toEqual([true, false])

      const nullQ = new BlockingQueue<null>(2)
      nullQ.enqueue(null)
      expect(nullQ.dequeue()).toBeNull()
    })

    it('large number of operations', () => {
      const q = new BlockingQueue<number>(100)
      for (let i = 0; i < 100; i++) q.enqueue(i)
      expect(q.isFull()).toBe(true)
      for (let i = 0; i < 100; i++) {
        expect(q.dequeue()).toBe(i)
      }
      expect(q.isEmpty()).toBe(true)
    })

    it('remove on wrapped-around queue', () => {
      const q = new BlockingQueue<number>(3)
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      q.dequeue()
      q.enqueue(40)
      // [20, 30, 40] in circular buffer
      expect(q.remove(30)).toBe(true)
      expect(q.toArray()).toEqual([20, 40])
    })

    it('forEach index is contiguous after dequeue', () => {
      const q = new BlockingQueue<number>(5)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      const entries: [number, number][] = []
      q.forEach((item, index) => entries.push([item, index]))
      expect(entries).toEqual([
        [2, 0],
        [3, 1],
      ])
    })
  })
})
