import { describe, it, expect, beforeEach } from 'vitest'
import { RandomizedQueue, DEFAULT_RANDOMIZED_QUEUE_OPTIONS } from '../src/core/randomized-queue/index.js'
import type { RandomizedQueueStats } from '../src/core/randomized-queue/types.js'

// ─── DEFAULT_RANDOMIZED_QUEUE_OPTIONS ─────────────────
describe('DEFAULT_RANDOMIZED_QUEUE_OPTIONS', () => {
  it('has correct defaults', () => {
    expect(DEFAULT_RANDOMIZED_QUEUE_OPTIONS).toEqual({ initialCapacity: 16 })
  })
})

// ─── Constructor ──────────────────────────────────────
describe('RandomizedQueue constructor', () => {
  it('creates empty queue', () => {
    const q = new RandomizedQueue<number>()
    expect(q.size).toBe(0)
    expect(q.isEmpty).toBe(true)
  })

  it('creates queue from array', () => {
    const q = new RandomizedQueue([1, 2, 3])
    expect(q.size).toBe(3)
  })

  it('creates queue from empty array', () => {
    const q = new RandomizedQueue([])
    expect(q.size).toBe(0)
  })

  it('accepts options', () => {
    const q = new RandomizedQueue<number>([], { initialCapacity: 32 })
    expect(q.size).toBe(0)
  })
})

// ─── enqueue / push ───────────────────────────────────
describe('RandomizedQueue.enqueue / push', () => {
  let q: RandomizedQueue<number>

  beforeEach(() => {
    q = new RandomizedQueue<number>()
  })

  it('enqueue adds element', () => {
    q.enqueue(1)
    expect(q.size).toBe(1)
    expect(q.isEmpty).toBe(false)
  })

  it('push adds element', () => {
    q.push(2)
    expect(q.size).toBe(1)
  })

  it('push is alias for enqueue', () => {
    q.push(42)
    expect(q.toArray()).toEqual([42])
  })

  it('can add multiple elements', () => {
    q.enqueue(1)
    q.enqueue(2)
    q.enqueue(3)
    expect(q.size).toBe(3)
  })
})

// ─── dequeue ──────────────────────────────────────────
describe('RandomizedQueue.dequeue', () => {
  it('throws on empty queue', () => {
    const q = new RandomizedQueue<number>()
    expect(() => q.dequeue()).toThrow('Cannot dequeue from empty queue')
  })

  it('returns the only element', () => {
    const q = new RandomizedQueue([42])
    expect(q.dequeue()).toBe(42)
    expect(q.size).toBe(0)
  })

  it('removes an element from the queue', () => {
    const q = new RandomizedQueue([1, 2, 3])
    q.dequeue()
    expect(q.size).toBe(2)
  })

  it('eventually returns all elements', () => {
    const items = [1, 2, 3, 4, 5]
    const q = new RandomizedQueue(items)
    const dequeued: number[] = []
    while (!q.isEmpty) {
      dequeued.push(q.dequeue())
    }
    expect(dequeued.sort()).toEqual(items)
  })
})

// ─── sample ───────────────────────────────────────────
describe('RandomizedQueue.sample', () => {
  it('throws on empty queue', () => {
    const q = new RandomizedQueue<number>()
    expect(() => q.sample()).toThrow('Cannot sample from empty queue')
  })

  it('returns an element from the queue', () => {
    const q = new RandomizedQueue([1, 2, 3])
    const sample = q.sample()
    expect([1, 2, 3]).toContain(sample)
  })

  it('does not remove the element', () => {
    const q = new RandomizedQueue([1, 2, 3])
    q.sample()
    expect(q.size).toBe(3)
  })
})

// ─── peek / peekBack ──────────────────────────────────
describe('RandomizedQueue.peek / peekBack', () => {
  it('peek throws on empty queue', () => {
    const q = new RandomizedQueue<number>()
    expect(() => q.peek()).toThrow('Cannot peek from empty queue')
  })

  it('peek returns first element', () => {
    const q = new RandomizedQueue([10, 20, 30])
    expect(q.peek()).toBe(10)
  })

  it('peek does not remove element', () => {
    const q = new RandomizedQueue([10, 20])
    q.peek()
    expect(q.size).toBe(2)
  })

  it('peekBack throws on empty queue', () => {
    const q = new RandomizedQueue<number>()
    expect(() => q.peekBack()).toThrow('Cannot peekBack from empty queue')
  })

  it('peekBack returns last element', () => {
    const q = new RandomizedQueue([10, 20, 30])
    expect(q.peekBack()).toBe(30)
  })
})

// ─── size / isEmpty ───────────────────────────────────
describe('RandomizedQueue.size / isEmpty', () => {
  it('size is 0 for empty queue', () => {
    const q = new RandomizedQueue()
    expect(q.size).toBe(0)
  })

  it('isEmpty is true for empty queue', () => {
    const q = new RandomizedQueue()
    expect(q.isEmpty).toBe(true)
  })

  it('isEmpty is false after enqueue', () => {
    const q = new RandomizedQueue<number>()
    q.enqueue(1)
    expect(q.isEmpty).toBe(false)
  })
})

// ─── clear ────────────────────────────────────────────
describe('RandomizedQueue.clear', () => {
  it('removes all elements', () => {
    const q = new RandomizedQueue([1, 2, 3])
    q.clear()
    expect(q.size).toBe(0)
    expect(q.isEmpty).toBe(true)
  })

  it('clear on empty queue is no-op', () => {
    const q = new RandomizedQueue()
    expect(() => q.clear()).not.toThrow()
  })
})

// ─── toArray ──────────────────────────────────────────
describe('RandomizedQueue.toArray', () => {
  it('returns empty array for empty queue', () => {
    const q = new RandomizedQueue()
    expect(q.toArray()).toEqual([])
  })

  it('returns copy of elements', () => {
    const q = new RandomizedQueue([1, 2, 3])
    const arr = q.toArray()
    expect(arr).toEqual([1, 2, 3])
    arr.push(4)
    expect(q.size).toBe(3)
  })
})

// ─── clone ────────────────────────────────────────────
describe('RandomizedQueue.clone', () => {
  it('creates independent copy', () => {
    const q = new RandomizedQueue([1, 2, 3])
    const cloned = q.clone()
    expect(cloned.size).toBe(3)
    expect(cloned.toArray()).toEqual([1, 2, 3])
    cloned.enqueue(4)
    expect(q.size).toBe(3)
    expect(cloned.size).toBe(4)
  })

  it('clone of empty queue is empty', () => {
    const q = new RandomizedQueue<number>()
    const cloned = q.clone()
    expect(cloned.isEmpty).toBe(true)
  })
})

// ─── fromArray ────────────────────────────────────────
describe('RandomizedQueue.fromArray', () => {
  it('creates queue from array', () => {
    const q = RandomizedQueue.fromArray([1, 2, 3])
    expect(q.size).toBe(3)
  })

  it('creates empty queue from empty array', () => {
    const q = RandomizedQueue.fromArray([])
    expect(q.isEmpty).toBe(true)
  })
})

// ─── forEach ──────────────────────────────────────────
describe('RandomizedQueue.forEach', () => {
  it('iterates over all elements', () => {
    const q = new RandomizedQueue([10, 20, 30])
    const result: number[] = []
    q.forEach((v) => result.push(v))
    expect(result).toEqual([10, 20, 30])
  })

  it('provides index', () => {
    const q = new RandomizedQueue(['a', 'b'])
    const indices: number[] = []
    q.forEach((_v, i) => indices.push(i))
    expect(indices).toEqual([0, 1])
  })

  it('does not iterate empty queue', () => {
    const q = new RandomizedQueue()
    let count = 0
    q.forEach(() => count++)
    expect(count).toBe(0)
  })
})

// ─── Symbol.iterator ──────────────────────────────────
describe('RandomizedQueue[Symbol.iterator]', () => {
  it('is iterable', () => {
    const q = new RandomizedQueue([1, 2, 3])
    const result: number[] = []
    for (const item of q) {
      result.push(item)
    }
    expect(result).toEqual([1, 2, 3])
  })

  it('spreads into array', () => {
    const q = new RandomizedQueue([1, 2, 3])
    expect([...q]).toEqual([1, 2, 3])
  })
})

// ─── contains ─────────────────────────────────────────
describe('RandomizedQueue.contains', () => {
  it('returns true for existing element', () => {
    const q = new RandomizedQueue([1, 2, 3])
    expect(q.contains(2)).toBe(true)
  })

  it('returns false for missing element', () => {
    const q = new RandomizedQueue([1, 2, 3])
    expect(q.contains(99)).toBe(false)
  })

  it('returns false for empty queue', () => {
    const q = new RandomizedQueue<number>()
    expect(q.contains(1)).toBe(false)
  })
})

// ─── indexOf ──────────────────────────────────────────
describe('RandomizedQueue.indexOf', () => {
  it('returns index of existing element', () => {
    const q = new RandomizedQueue([10, 20, 30])
    expect(q.indexOf(20)).toBe(1)
  })

  it('returns -1 for missing element', () => {
    const q = new RandomizedQueue([10, 20, 30])
    expect(q.indexOf(99)).toBe(-1)
  })
})

// ─── remove ───────────────────────────────────────────
describe('RandomizedQueue.remove', () => {
  it('removes existing element and returns true', () => {
    const q = new RandomizedQueue([1, 2, 3])
    expect(q.remove(2)).toBe(true)
    expect(q.size).toBe(2)
    expect(q.contains(2)).toBe(false)
  })

  it('returns false for missing element', () => {
    const q = new RandomizedQueue([1, 2, 3])
    expect(q.remove(99)).toBe(false)
    expect(q.size).toBe(3)
  })
})

// ─── removeAt ─────────────────────────────────────────
describe('RandomizedQueue.removeAt', () => {
  it('removes element at index', () => {
    const q = new RandomizedQueue([10, 20, 30])
    const removed = q.removeAt(1)
    expect(removed).toBe(20)
    expect(q.size).toBe(2)
  })

  it('throws for negative index', () => {
    const q = new RandomizedQueue([1, 2, 3])
    expect(() => q.removeAt(-1)).toThrow(RangeError)
  })

  it('throws for out of bounds index', () => {
    const q = new RandomizedQueue([1, 2, 3])
    expect(() => q.removeAt(5)).toThrow(RangeError)
  })

  it('handles removing last element', () => {
    const q = new RandomizedQueue([10, 20])
    q.removeAt(1)
    expect(q.size).toBe(1)
  })
})

// ─── shuffle ──────────────────────────────────────────
describe('RandomizedQueue.shuffle', () => {
  it('preserves all elements after shuffle', () => {
    const q = new RandomizedQueue([1, 2, 3, 4, 5])
    q.shuffle()
    expect(q.size).toBe(5)
    const sorted = q.toArray().sort()
    expect(sorted).toEqual([1, 2, 3, 4, 5])
  })

  it('does not throw on empty queue', () => {
    const q = new RandomizedQueue()
    expect(() => q.shuffle()).not.toThrow()
  })

  it('does not throw on single-element queue', () => {
    const q = new RandomizedQueue([1])
    expect(() => q.shuffle()).not.toThrow()
    expect(q.size).toBe(1)
  })
})

// ─── random ───────────────────────────────────────────
describe('RandomizedQueue.random', () => {
  it('returns empty array for empty queue', () => {
    const q = new RandomizedQueue<number>()
    expect(q.random()).toEqual([])
  })

  it('returns single element when no count specified', () => {
    const q = new RandomizedQueue([1, 2, 3])
    const result = q.random()
    expect(result).toHaveLength(1)
    expect([1, 2, 3]).toContain(result[0])
  })

  it('returns requested number of elements', () => {
    const q = new RandomizedQueue([1, 2, 3, 4, 5])
    const result = q.random(3)
    expect(result).toHaveLength(3)
  })

  it('clamps to queue size', () => {
    const q = new RandomizedQueue([1, 2])
    const result = q.random(10)
    expect(result).toHaveLength(2)
  })
})

// ─── at ───────────────────────────────────────────────
describe('RandomizedQueue.at', () => {
  it('returns element at valid index', () => {
    const q = new RandomizedQueue([10, 20, 30])
    expect(q.at(0)).toBe(10)
    expect(q.at(1)).toBe(20)
    expect(q.at(2)).toBe(30)
  })

  it('throws for negative index', () => {
    const q = new RandomizedQueue([1, 2, 3])
    expect(() => q.at(-1)).toThrow(RangeError)
  })

  it('throws for out of bounds', () => {
    const q = new RandomizedQueue([1, 2, 3])
    expect(() => q.at(5)).toThrow(RangeError)
  })
})

// ─── first / last ─────────────────────────────────────
describe('RandomizedQueue.first / last', () => {
  it('first throws on empty queue', () => {
    const q = new RandomizedQueue()
    expect(() => q.first()).toThrow('Cannot get first element from empty queue')
  })

  it('first returns first element', () => {
    const q = new RandomizedQueue([10, 20, 30])
    expect(q.first()).toBe(10)
  })

  it('last throws on empty queue', () => {
    const q = new RandomizedQueue()
    expect(() => q.last()).toThrow('Cannot get last element from empty queue')
  })

  it('last returns last element', () => {
    const q = new RandomizedQueue([10, 20, 30])
    expect(q.last()).toBe(30)
  })
})

// ─── count ────────────────────────────────────────────
describe('RandomizedQueue.count', () => {
  it('returns 0 for empty', () => {
    const q = new RandomizedQueue()
    expect(q.count()).toBe(0)
  })

  it('returns element count', () => {
    const q = new RandomizedQueue([1, 2, 3])
    expect(q.count()).toBe(3)
  })
})

// ─── toString ─────────────────────────────────────────
describe('RandomizedQueue.toString', () => {
  it('returns string representation', () => {
    const q = new RandomizedQueue([1, 2, 3])
    const str = q.toString()
    expect(str).toContain('RandomizedQueue(3)')
    expect(str).toContain('1')
    expect(str).toContain('2')
    expect(str).toContain('3')
  })

  it('handles empty queue', () => {
    const q = new RandomizedQueue()
    expect(q.toString()).toContain('RandomizedQueue(0)')
  })
})

// ─── join ─────────────────────────────────────────────
describe('RandomizedQueue.join', () => {
  it('joins with default separator', () => {
    const q = new RandomizedQueue([1, 2, 3])
    expect(q.join()).toBe('1,2,3')
  })

  it('joins with custom separator', () => {
    const q = new RandomizedQueue([1, 2, 3])
    expect(q.join(' | ')).toBe('1 | 2 | 3')
  })

  it('handles empty queue', () => {
    const q = new RandomizedQueue<number>()
    expect(q.join()).toBe('')
  })
})

// ─── getStats ─────────────────────────────────────────
describe('RandomizedQueue.getStats', () => {
  it('returns stats for empty queue', () => {
    const q = new RandomizedQueue()
    const stats = q.getStats()
    expect(stats).toEqual({ size: 0, capacity: 0 })
  })

  it('returns stats for non-empty queue', () => {
    const q = new RandomizedQueue([1, 2, 3])
    const stats = q.getStats()
    expect(stats.size).toBe(3)
    expect(stats.capacity).toBe(3)
  })
})

// ─── Edge Cases ───────────────────────────────────────
describe('RandomizedQueue edge cases', () => {
  it('handles string elements', () => {
    const q = new RandomizedQueue(['a', 'b', 'c'])
    expect(q.size).toBe(3)
    expect(q.contains('b')).toBe(true)
  })

  it('handles object elements', () => {
    const obj = { x: 1 }
    const q = new RandomizedQueue([obj])
    expect(q.contains(obj)).toBe(true)
  })

  it('handles null elements', () => {
    const q = new RandomizedQueue<null>([null, null])
    expect(q.size).toBe(2)
  })

  it('handles undefined elements', () => {
    const q = new RandomizedQueue<undefined>([undefined])
    expect(q.size).toBe(1)
  })

  it('dequeue all elements empties queue', () => {
    const q = new RandomizedQueue([1, 2])
    q.dequeue()
    q.dequeue()
    expect(q.isEmpty).toBe(true)
    expect(() => q.dequeue()).toThrow()
  })

  it('remove all via remove method', () => {
    const q = new RandomizedQueue([1, 2, 3])
    q.remove(1)
    q.remove(2)
    q.remove(3)
    expect(q.isEmpty).toBe(true)
  })
})
