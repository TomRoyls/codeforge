import { describe, it, expect } from 'vitest'
import { MergeQueue } from '../../src/core/merge-queue/merge-queue.js'

function createMinQueue(): MergeQueue<number> {
  return new MergeQueue<number>()
}

function createMaxQueue(): MergeQueue<number> {
  return new MergeQueue<number>({
    comparator: (a, b) => b - a,
  })
}

describe('MergeQueue', () => {
  describe('constructor', () => {
    it('creates an empty queue with default comparator', () => {
      const q = new MergeQueue<number>()
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('creates a queue with custom comparator (max)', () => {
      const q = createMaxQueue()
      q.enqueue(1)
      q.enqueue(5)
      q.enqueue(3)
      expect(q.peek()).toBe(5)
    })

    it('creates a queue with string comparator', () => {
      const q = new MergeQueue<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      q.enqueue('cherry')
      q.enqueue('apple')
      q.enqueue('banana')
      expect(q.peek()).toBe('apple')
    })

    it('handles no options argument', () => {
      const q = new MergeQueue<number>(undefined)
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })
  })

  describe('enqueue', () => {
    it('enqueues a single element', () => {
      const q = createMinQueue()
      q.enqueue(5)
      expect(q.size()).toBe(1)
      expect(q.isEmpty()).toBe(false)
      expect(q.peek()).toBe(5)
    })

    it('enqueues multiple elements in order', () => {
      const q = createMinQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.peek()).toBe(1)
      expect(q.size()).toBe(3)
    })

    it('enqueues multiple elements in reverse order', () => {
      const q = createMinQueue()
      q.enqueue(3)
      q.enqueue(2)
      q.enqueue(1)
      expect(q.peek()).toBe(1)
      expect(q.size()).toBe(3)
    })

    it('enqueues duplicate values', () => {
      const q = createMinQueue()
      q.enqueue(5)
      q.enqueue(5)
      q.enqueue(5)
      expect(q.size()).toBe(3)
      expect(q.peek()).toBe(5)
    })

    it('enqueues negative numbers', () => {
      const q = createMinQueue()
      q.enqueue(-3)
      q.enqueue(-1)
      q.enqueue(-5)
      expect(q.peek()).toBe(-5)
    })

    it('enqueues zero', () => {
      const q = createMinQueue()
      q.enqueue(0)
      expect(q.peek()).toBe(0)
    })

    it('enqueues floating point numbers', () => {
      const q = createMinQueue()
      q.enqueue(3.14)
      q.enqueue(2.71)
      q.enqueue(1.41)
      expect(q.peek()).toBeCloseTo(1.41)
    })

    it('maintains valid leftist property after many enqueues', () => {
      const q = createMinQueue()
      for (let i = 20; i >= 1; i--) {
        q.enqueue(i)
      }
      expect(q.isValid()).toBe(true)
    })

    it('enqueues many equal elements', () => {
      const q = createMinQueue()
      for (let i = 0; i < 50; i++) {
        q.enqueue(42)
      }
      expect(q.size()).toBe(50)
      expect(q.peek()).toBe(42)
      expect(q.isValid()).toBe(true)
    })
  })

  describe('dequeue', () => {
    it('returns undefined on empty queue', () => {
      const q = createMinQueue()
      expect(q.dequeue()).toBeUndefined()
    })

    it('dequeues the only element', () => {
      const q = createMinQueue()
      q.enqueue(5)
      expect(q.dequeue()).toBe(5)
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('dequeues elements in sorted order', () => {
      const q = createMinQueue()
      q.enqueue(3)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
      expect(q.dequeue()).toBeUndefined()
    })

    it('dequeues from max queue in reverse sorted order', () => {
      const q = createMaxQueue()
      q.enqueue(1)
      q.enqueue(5)
      q.enqueue(3)
      expect(q.dequeue()).toBe(5)
      expect(q.dequeue()).toBe(3)
      expect(q.dequeue()).toBe(1)
    })

    it('handles duplicate values during dequeue', () => {
      const q = createMinQueue()
      q.enqueue(2)
      q.enqueue(2)
      q.enqueue(1)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(2)
    })

    it('dequeues negative numbers correctly', () => {
      const q = createMinQueue()
      q.enqueue(-5)
      q.enqueue(-1)
      q.enqueue(-3)
      expect(q.dequeue()).toBe(-5)
      expect(q.dequeue()).toBe(-3)
      expect(q.dequeue()).toBe(-1)
    })

    it('maintains valid property after dequeues', () => {
      const q = createMinQueue()
      for (let i = 1; i <= 10; i++) {
        q.enqueue(i)
      }
      for (let i = 1; i <= 5; i++) {
        q.dequeue()
      }
      expect(q.isValid()).toBe(true)
    })

    it('interleaved enqueue and dequeue', () => {
      const q = createMinQueue()
      q.enqueue(5)
      q.enqueue(3)
      expect(q.dequeue()).toBe(3)
      q.enqueue(1)
      q.enqueue(4)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(4)
      expect(q.dequeue()).toBe(5)
    })

    it('dequeues all elements leaving empty queue', () => {
      const q = createMinQueue()
      for (let i = 0; i < 10; i++) {
        q.enqueue(i)
      }
      for (let i = 0; i < 10; i++) {
        expect(q.dequeue()).toBe(i)
      }
      expect(q.isEmpty()).toBe(true)
      expect(q.isValid()).toBe(true)
    })
  })

  describe('peek', () => {
    it('returns undefined on empty queue', () => {
      const q = createMinQueue()
      expect(q.peek()).toBeUndefined()
    })

    it('returns the minimum element', () => {
      const q = createMinQueue()
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(7)
      expect(q.peek()).toBe(3)
    })

    it('does not remove the element', () => {
      const q = createMinQueue()
      q.enqueue(5)
      expect(q.peek()).toBe(5)
      expect(q.peek()).toBe(5)
      expect(q.size()).toBe(1)
    })

    it('updates after dequeue', () => {
      const q = createMinQueue()
      q.enqueue(3)
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.peek()).toBe(2)
    })

    it('returns maximum element in max queue', () => {
      const q = createMaxQueue()
      q.enqueue(3)
      q.enqueue(7)
      q.enqueue(1)
      expect(q.peek()).toBe(7)
    })
  })

  describe('merge', () => {
    it('merges two empty queues', () => {
      const q1 = createMinQueue()
      const q2 = createMinQueue()
      const merged = q1.merge(q2)
      expect(merged.size()).toBe(0)
      expect(merged.isEmpty()).toBe(true)
    })

    it('merges empty queue with non-empty queue', () => {
      const q1 = createMinQueue()
      const q2 = createMinQueue()
      q2.enqueue(1)
      q2.enqueue(2)
      const merged = q1.merge(q2)
      expect(merged.size()).toBe(2)
      expect(merged.peek()).toBe(1)
    })

    it('merges non-empty queue with empty queue', () => {
      const q1 = createMinQueue()
      q1.enqueue(1)
      q1.enqueue(2)
      const q2 = createMinQueue()
      const merged = q1.merge(q2)
      expect(merged.size()).toBe(2)
      expect(merged.peek()).toBe(1)
    })

    it('merges two non-empty queues', () => {
      const q1 = createMinQueue()
      q1.enqueue(1)
      q1.enqueue(3)
      q1.enqueue(5)
      const q2 = createMinQueue()
      q2.enqueue(2)
      q2.enqueue(4)
      q2.enqueue(6)
      const merged = q1.merge(q2)
      expect(merged.size()).toBe(6)
      expect(merged.toArray()).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('does not modify original queues', () => {
      const q1 = createMinQueue()
      q1.enqueue(1)
      q1.enqueue(3)
      const q2 = createMinQueue()
      q2.enqueue(2)
      q2.enqueue(4)
      const merged = q1.merge(q2)
      expect(merged.size()).toBe(4)
      expect(q1.size()).toBe(2)
      expect(q2.size()).toBe(2)
      expect(q1.peek()).toBe(1)
      expect(q2.peek()).toBe(2)
    })

    it('merged queue has valid leftist property', () => {
      const q1 = createMinQueue()
      for (let i = 1; i <= 10; i++) q1.enqueue(i * 2)
      const q2 = createMinQueue()
      for (let i = 0; i < 10; i++) q2.enqueue(i * 2 + 1)
      const merged = q1.merge(q2)
      expect(merged.isValid()).toBe(true)
    })

    it('merges queues with overlapping values', () => {
      const q1 = createMinQueue()
      q1.enqueue(1)
      q1.enqueue(3)
      q1.enqueue(5)
      const q2 = createMinQueue()
      q2.enqueue(1)
      q2.enqueue(3)
      q2.enqueue(5)
      const merged = q1.merge(q2)
      expect(merged.toArray()).toEqual([1, 1, 3, 3, 5, 5])
    })

    it('merges max queues correctly', () => {
      const q1 = createMaxQueue()
      q1.enqueue(1)
      q1.enqueue(3)
      const q2 = createMaxQueue()
      q2.enqueue(2)
      q2.enqueue(4)
      const merged = q1.merge(q2)
      expect(merged.size()).toBe(4)
      expect(merged.peek()).toBe(4)
    })

    it('merged queue elements dequeue in order', () => {
      const q1 = createMinQueue()
      q1.enqueue(10)
      q1.enqueue(30)
      q1.enqueue(50)
      const q2 = createMinQueue()
      q2.enqueue(20)
      q2.enqueue(40)
      q2.enqueue(60)
      const merged = q1.merge(q2)
      for (let i = 10; i <= 60; i += 10) {
        expect(merged.dequeue()).toBe(i)
      }
    })

    it('merging single-element queues', () => {
      const q1 = createMinQueue()
      q1.enqueue(2)
      const q2 = createMinQueue()
      q2.enqueue(1)
      const merged = q1.merge(q2)
      expect(merged.dequeue()).toBe(1)
      expect(merged.dequeue()).toBe(2)
    })

    it('merging queue with itself produces double', () => {
      const q1 = createMinQueue()
      q1.enqueue(1)
      q1.enqueue(2)
      q1.enqueue(3)
      const merged = q1.merge(q1)
      expect(merged.size()).toBe(6)
      expect(merged.toArray()).toEqual([1, 1, 2, 2, 3, 3])
      expect(q1.size()).toBe(3)
    })

    it('merge chain of three queues', () => {
      const q1 = createMinQueue()
      q1.enqueue(1)
      q1.enqueue(4)
      const q2 = createMinQueue()
      q2.enqueue(2)
      q2.enqueue(5)
      const q3 = createMinQueue()
      q3.enqueue(3)
      q3.enqueue(6)
      const merged = q1.merge(q2).merge(q3)
      expect(merged.toArray()).toEqual([1, 2, 3, 4, 5, 6])
      expect(q1.size()).toBe(2)
    })
  })

  describe('size', () => {
    it('returns 0 for empty queue', () => {
      const q = createMinQueue()
      expect(q.size()).toBe(0)
    })

    it('returns correct size after enqueues', () => {
      const q = createMinQueue()
      q.enqueue(1)
      expect(q.size()).toBe(1)
      q.enqueue(2)
      expect(q.size()).toBe(2)
      q.enqueue(3)
      expect(q.size()).toBe(3)
    })

    it('returns correct size after dequeues', () => {
      const q = createMinQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect(q.size()).toBe(2)
      q.dequeue()
      expect(q.size()).toBe(1)
      q.dequeue()
      expect(q.size()).toBe(0)
    })

    it('returns correct size after clear', () => {
      const q = createMinQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      expect(q.size()).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new queue', () => {
      const q = createMinQueue()
      expect(q.isEmpty()).toBe(true)
    })

    it('returns false after enqueue', () => {
      const q = createMinQueue()
      q.enqueue(1)
      expect(q.isEmpty()).toBe(false)
    })

    it('returns true after dequeuing all elements', () => {
      const q = createMinQueue()
      q.enqueue(1)
      q.dequeue()
      expect(q.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const q = createMinQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      expect(q.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears an empty queue', () => {
      const q = createMinQueue()
      q.clear()
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('clears a non-empty queue', () => {
      const q = createMinQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.clear()
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
      expect(q.peek()).toBeUndefined()
    })

    it('queue is usable after clear', () => {
      const q = createMinQueue()
      q.enqueue(5)
      q.clear()
      q.enqueue(3)
      expect(q.peek()).toBe(3)
      expect(q.size()).toBe(1)
    })
  })

  describe('enqueueMany', () => {
    it('enqueues multiple items from array', () => {
      const q = createMinQueue()
      q.enqueueMany([3, 1, 4, 1, 5])
      expect(q.size()).toBe(5)
      expect(q.peek()).toBe(1)
    })

    it('enqueues from empty array', () => {
      const q = createMinQueue()
      q.enqueueMany([])
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('enqueues from generator', () => {
      function* gen() {
        yield 5
        yield 3
        yield 1
      }
      const q = createMinQueue()
      q.enqueueMany(gen())
      expect(q.size()).toBe(3)
      expect(q.peek()).toBe(1)
    })

    it('enqueues onto existing queue', () => {
      const q = createMinQueue()
      q.enqueue(10)
      q.enqueueMany([1, 2, 3])
      expect(q.size()).toBe(4)
      expect(q.peek()).toBe(1)
    })

    it('dequeue order is sorted after enqueueMany', () => {
      const q = createMinQueue()
      q.enqueueMany([5, 3, 1, 4, 2])
      expect(q.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('enqueueMany with single item', () => {
      const q = createMinQueue()
      q.enqueueMany([42])
      expect(q.size()).toBe(1)
      expect(q.peek()).toBe(42)
    })
  })

  describe('dequeueMany', () => {
    it('dequeues requested number of items', () => {
      const q = createMinQueue()
      q.enqueueMany([1, 2, 3, 4, 5])
      const items = q.dequeueMany(3)
      expect(items).toEqual([1, 2, 3])
      expect(q.size()).toBe(2)
    })

    it('dequeues all items if count exceeds size', () => {
      const q = createMinQueue()
      q.enqueueMany([1, 2, 3])
      const items = q.dequeueMany(10)
      expect(items).toEqual([1, 2, 3])
      expect(q.isEmpty()).toBe(true)
    })

    it('returns empty array for empty queue', () => {
      const q = createMinQueue()
      const items = q.dequeueMany(5)
      expect(items).toEqual([])
    })

    it('dequeueMany with zero count', () => {
      const q = createMinQueue()
      q.enqueueMany([1, 2, 3])
      const items = q.dequeueMany(0)
      expect(items).toEqual([])
      expect(q.size()).toBe(3)
    })

    it('dequeueMany preserves sorted order', () => {
      const q = createMinQueue()
      q.enqueueMany([5, 2, 8, 1, 9])
      const items = q.dequeueMany(5)
      expect(items).toEqual([1, 2, 5, 8, 9])
    })

    it('dequeueMany partial extraction', () => {
      const q = createMinQueue()
      q.enqueueMany([3, 1, 4, 1, 5])
      const first = q.dequeueMany(2)
      expect(first).toEqual([1, 1])
      const second = q.dequeueMany(2)
      expect(second).toEqual([3, 4])
      expect(q.size()).toBe(1)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty queue', () => {
      const q = createMinQueue()
      expect(q.toArray()).toEqual([])
    })

    it('returns single element array', () => {
      const q = createMinQueue()
      q.enqueue(5)
      expect(q.toArray()).toEqual([5])
    })

    it('returns sorted array', () => {
      const q = createMinQueue()
      q.enqueue(3)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('returns sorted array for max queue', () => {
      const q = createMaxQueue()
      q.enqueue(1)
      q.enqueue(3)
      q.enqueue(2)
      expect(q.toArray()).toEqual([3, 2, 1])
    })

    it('does not modify the queue', () => {
      const q = createMinQueue()
      q.enqueue(3)
      q.enqueue(1)
      q.enqueue(2)
      const arr = q.toArray()
      expect(arr).toEqual([1, 2, 3])
      expect(q.size()).toBe(3)
      expect(q.peek()).toBe(1)
    })

    it('handles duplicates', () => {
      const q = createMinQueue()
      q.enqueue(2)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(1)
      expect(q.toArray()).toEqual([1, 1, 2, 2])
    })

    it('handles negative numbers', () => {
      const q = createMinQueue()
      q.enqueue(-3)
      q.enqueue(0)
      q.enqueue(-1)
      q.enqueue(2)
      expect(q.toArray()).toEqual([-3, -1, 0, 2])
    })

    it('multiple toArray calls return same result', () => {
      const q = createMinQueue()
      for (let i = 5; i >= 1; i--) q.enqueue(i)
      expect(q.toArray()).toEqual([1, 2, 3, 4, 5])
      expect(q.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('toArray after partial dequeue', () => {
      const q = createMinQueue()
      for (let i = 5; i >= 1; i--) q.enqueue(i)
      q.dequeue()
      q.dequeue()
      expect(q.toArray()).toEqual([3, 4, 5])
    })
  })

  describe('fromArray', () => {
    it('creates queue from array', () => {
      const q = MergeQueue.fromArray([3, 1, 2])
      expect(q.size()).toBe(3)
      expect(q.peek()).toBe(1)
    })

    it('creates queue from empty array', () => {
      const q = MergeQueue.fromArray<number>([])
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('creates queue with custom comparator', () => {
      const q = MergeQueue.fromArray([1, 3, 2], {
        comparator: (a, b) => b - a,
      })
      expect(q.peek()).toBe(3)
    })

    it('fromArray with single item', () => {
      const q = MergeQueue.fromArray([42])
      expect(q.size()).toBe(1)
      expect(q.peek()).toBe(42)
    })

    it('fromArray produces valid queue', () => {
      const q = MergeQueue.fromArray([5, 3, 1, 4, 2])
      expect(q.isValid()).toBe(true)
      expect(q.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('fromArray with strings', () => {
      const q = MergeQueue.fromArray(['cherry', 'apple', 'banana'])
      expect(q.peek()).toBe('apple')
      expect(q.size()).toBe(3)
    })
  })

  describe('contains', () => {
    it('returns false for empty queue', () => {
      const q = createMinQueue()
      expect(q.contains(1)).toBe(false)
    })

    it('returns true for existing element', () => {
      const q = createMinQueue()
      q.enqueue(5)
      expect(q.contains(5)).toBe(true)
    })

    it('returns false for non-existing element', () => {
      const q = createMinQueue()
      q.enqueue(5)
      expect(q.contains(3)).toBe(false)
    })

    it('finds elements in larger queue', () => {
      const q = createMinQueue()
      for (let i = 0; i < 20; i++) {
        q.enqueue(i)
      }
      expect(q.contains(0)).toBe(true)
      expect(q.contains(10)).toBe(true)
      expect(q.contains(19)).toBe(true)
      expect(q.contains(20)).toBe(false)
      expect(q.contains(-1)).toBe(false)
    })

    it('returns false after element is dequeued', () => {
      const q = createMinQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect(q.contains(1)).toBe(false)
      expect(q.contains(2)).toBe(true)
    })

    it('handles duplicate values', () => {
      const q = createMinQueue()
      q.enqueue(5)
      q.enqueue(5)
      q.dequeue()
      expect(q.contains(5)).toBe(true)
    })

    it('works with strings', () => {
      const q = new MergeQueue<string>()
      q.enqueue('hello')
      q.enqueue('world')
      expect(q.contains('hello')).toBe(true)
      expect(q.contains('world')).toBe(true)
      expect(q.contains('foo')).toBe(false)
    })

    it('works with custom objects using comparator', () => {
      type Item = { id: number; name: string }
      const q = new MergeQueue<Item>({
        comparator: (a, b) => a.id - b.id,
      })
      const item1: Item = { id: 1, name: 'a' }
      const item2: Item = { id: 2, name: 'b' }
      q.enqueue(item1)
      q.enqueue(item2)
      expect(q.contains(item1)).toBe(true)
      expect(q.contains(item2)).toBe(true)
    })

    it('contains after clear', () => {
      const q = createMinQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      expect(q.contains(1)).toBe(false)
      expect(q.contains(2)).toBe(false)
    })

    it('contains on cloned queue', () => {
      const q = createMinQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const cloned = q.clone()
      expect(cloned.contains(1)).toBe(true)
      expect(cloned.contains(2)).toBe(true)
      expect(cloned.contains(3)).toBe(true)
      expect(cloned.contains(4)).toBe(false)
    })

    it('contains on merged queue', () => {
      const q1 = createMinQueue()
      q1.enqueue(1)
      q1.enqueue(3)
      const q2 = createMinQueue()
      q2.enqueue(2)
      q2.enqueue(4)
      const merged = q1.merge(q2)
      expect(merged.contains(1)).toBe(true)
      expect(merged.contains(2)).toBe(true)
      expect(merged.contains(3)).toBe(true)
      expect(merged.contains(4)).toBe(true)
      expect(merged.contains(5)).toBe(false)
    })
  })

  describe('remove', () => {
    it('returns false for empty queue', () => {
      const q = createMinQueue()
      expect(q.remove(1)).toBe(false)
    })

    it('removes the only element', () => {
      const q = createMinQueue()
      q.enqueue(5)
      expect(q.remove(5)).toBe(true)
      expect(q.isEmpty()).toBe(true)
    })

    it('removes root element', () => {
      const q = createMinQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.remove(1)).toBe(true)
      expect(q.peek()).toBe(2)
      expect(q.size()).toBe(2)
    })

    it('removes non-root element', () => {
      const q = createMinQueue()
      q.enqueue(1)
      q.enqueue(3)
      q.enqueue(2)
      expect(q.remove(3)).toBe(true)
      expect(q.size()).toBe(2)
      expect(q.toArray()).toEqual([1, 2])
    })

    it('returns false for non-existing element', () => {
      const q = createMinQueue()
      q.enqueue(1)
      q.enqueue(2)
      expect(q.remove(5)).toBe(false)
      expect(q.size()).toBe(2)
    })

    it('removes one of duplicate values', () => {
      const q = createMinQueue()
      q.enqueue(5)
      q.enqueue(5)
      expect(q.remove(5)).toBe(true)
      expect(q.size()).toBe(1)
      expect(q.contains(5)).toBe(true)
    })

    it('queue remains valid after remove', () => {
      const q = createMinQueue()
      for (let i = 1; i <= 10; i++) q.enqueue(i)
      q.remove(5)
      expect(q.isValid()).toBe(true)
      expect(q.size()).toBe(9)
    })

    it('removes from max queue', () => {
      const q = createMaxQueue()
      q.enqueue(1)
      q.enqueue(3)
      q.enqueue(5)
      expect(q.remove(3)).toBe(true)
      expect(q.toArray()).toEqual([5, 1])
    })

    it('remove all elements one by one', () => {
      const q = createMinQueue()
      q.enqueueMany([3, 1, 2])
      expect(q.remove(1)).toBe(true)
      expect(q.remove(2)).toBe(true)
      expect(q.remove(3)).toBe(true)
      expect(q.isEmpty()).toBe(true)
    })

    it('remove preserves heap ordering', () => {
      const q = createMinQueue()
      q.enqueueMany([5, 3, 1, 4, 2])
      q.remove(3)
      const arr = q.toArray()
      expect(arr).toEqual([1, 2, 4, 5])
    })
  })

  describe('decreaseKey', () => {
    it('returns false for empty queue', () => {
      const q = createMinQueue()
      expect(q.decreaseKey(1, 0)).toBe(false)
    })

    it('decreases key of root element', () => {
      const q = createMinQueue()
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(7)
      expect(q.decreaseKey(5, 1)).toBe(true)
      expect(q.peek()).toBe(1)
    })

    it('decreases key of non-root element', () => {
      const q = createMinQueue()
      q.enqueue(1)
      q.enqueue(5)
      q.enqueue(3)
      expect(q.decreaseKey(5, 0)).toBe(true)
      expect(q.peek()).toBe(0)
    })

    it('returns false for non-existing value', () => {
      const q = createMinQueue()
      q.enqueue(1)
      q.enqueue(2)
      expect(q.decreaseKey(5, 0)).toBe(false)
    })

    it('maintains valid heap after decreaseKey', () => {
      const q = createMinQueue()
      q.enqueueMany([1, 3, 5, 7, 9])
      q.decreaseKey(9, 0)
      expect(q.isValid()).toBe(true)
      expect(q.peek()).toBe(0)
    })

    it('decreaseKey to same value', () => {
      const q = createMinQueue()
      q.enqueue(5)
      expect(q.decreaseKey(5, 5)).toBe(true)
      expect(q.peek()).toBe(5)
      expect(q.size()).toBe(1)
    })

    it('decreaseKey with objects using comparator', () => {
      type Item = { priority: number; label: string }
      const q = new MergeQueue<Item>({
        comparator: (a, b) => a.priority - b.priority,
      })
      q.enqueue({ priority: 5, label: 'low' })
      q.enqueue({ priority: 3, label: 'medium' })
      expect(q.decreaseKey({ priority: 5, label: 'low' }, { priority: 1, label: 'high' })).toBe(true)
      const first = q.dequeue()
      expect(first?.priority).toBe(1)
      expect(first?.label).toBe('high')
    })

    it('decreaseKey does not change size', () => {
      const q = createMinQueue()
      q.enqueueMany([5, 3, 1])
      q.decreaseKey(5, 0)
      expect(q.size()).toBe(3)
    })

    it('decreaseKey preserves all other elements', () => {
      const q = createMinQueue()
      q.enqueueMany([5, 3, 1, 7, 9])
      q.decreaseKey(7, 2)
      expect(q.toArray()).toEqual([1, 2, 3, 5, 9])
    })
  })

  describe('clone', () => {
    it('clones an empty queue', () => {
      const q = createMinQueue()
      const cloned = q.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('clones a non-empty queue', () => {
      const q = createMinQueue()
      q.enqueue(3)
      q.enqueue(1)
      q.enqueue(2)
      const cloned = q.clone()
      expect(cloned.size()).toBe(3)
      expect(cloned.peek()).toBe(1)
    })

    it('clone is independent of original', () => {
      const q = createMinQueue()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const cloned = q.clone()
      cloned.dequeue()
      expect(q.size()).toBe(3)
      expect(cloned.size()).toBe(2)
    })

    it('modifying original does not affect clone', () => {
      const q = createMinQueue()
      q.enqueue(1)
      q.enqueue(2)
      const cloned = q.clone()
      q.clear()
      expect(cloned.size()).toBe(2)
      expect(cloned.peek()).toBe(1)
    })

    it('clone produces valid leftist heap', () => {
      const q = createMinQueue()
      for (let i = 10; i >= 1; i--) q.enqueue(i)
      const cloned = q.clone()
      expect(cloned.isValid()).toBe(true)
    })

    it('clone preserves comparator', () => {
      const q = createMaxQueue()
      q.enqueue(1)
      q.enqueue(5)
      q.enqueue(3)
      const cloned = q.clone()
      expect(cloned.peek()).toBe(5)
      expect(cloned.dequeue()).toBe(5)
      expect(cloned.dequeue()).toBe(3)
      expect(cloned.dequeue()).toBe(1)
    })

    it('clone toArray matches original toArray', () => {
      const q = createMinQueue()
      for (let i = 0; i < 15; i++) {
        q.enqueue(Math.floor(Math.random() * 100))
      }
      const cloned = q.clone()
      expect(cloned.toArray()).toEqual(q.toArray())
    })

    it('double clone', () => {
      const q = createMinQueue()
      for (let i = 0; i < 5; i++) q.enqueue(i)
      const cloned = q.clone().clone()
      expect(cloned.toArray()).toEqual([0, 1, 2, 3, 4])
    })

    it('clone of empty queue is usable', () => {
      const q = createMinQueue()
      const cloned = q.clone()
      cloned.enqueue(1)
      expect(cloned.peek()).toBe(1)
      expect(q.isEmpty()).toBe(true)
    })
  })

  describe('isValid', () => {
    it('empty queue is valid', () => {
      const q = createMinQueue()
      expect(q.isValid()).toBe(true)
    })

    it('single element queue is valid', () => {
      const q = createMinQueue()
      q.enqueue(1)
      expect(q.isValid()).toBe(true)
    })

    it('queue remains valid after enqueues', () => {
      const q = createMinQueue()
      for (let i = 0; i < 20; i++) {
        q.enqueue(Math.floor(Math.random() * 100))
        expect(q.isValid()).toBe(true)
      }
    })

    it('queue remains valid after dequeues', () => {
      const q = createMinQueue()
      for (let i = 0; i < 20; i++) {
        q.enqueue(i)
      }
      for (let i = 0; i < 20; i++) {
        q.dequeue()
        expect(q.isValid()).toBe(true)
      }
    })

    it('queue remains valid after merge', () => {
      const q1 = createMinQueue()
      const q2 = createMinQueue()
      for (let i = 0; i < 10; i++) {
        q1.enqueue(i)
        q2.enqueue(i + 10)
      }
      const merged = q1.merge(q2)
      expect(merged.isValid()).toBe(true)
    })

    it('queue with all equal elements is valid', () => {
      const q = createMinQueue()
      for (let i = 0; i < 10; i++) q.enqueue(42)
      expect(q.isValid()).toBe(true)
    })
  })

  describe('stress tests', () => {
    it('handles 1000 sequential enqueues and dequeues', () => {
      const q = createMinQueue()
      for (let i = 1000; i >= 1; i--) {
        q.enqueue(i)
      }
      expect(q.size()).toBe(1000)
      expect(q.isValid()).toBe(true)
      for (let i = 1; i <= 1000; i++) {
        expect(q.dequeue()).toBe(i)
      }
      expect(q.isEmpty()).toBe(true)
    })

    it('handles 1000 random enqueues and sorted dequeue', () => {
      const q = createMinQueue()
      const values: number[] = []
      for (let i = 0; i < 1000; i++) {
        const v = Math.floor(Math.random() * 10000)
        values.push(v)
        q.enqueue(v)
      }
      values.sort((a, b) => a - b)
      for (let i = 0; i < 1000; i++) {
        expect(q.dequeue()).toBe(values[i])
      }
    })

    it('handles 1000 elements in merge', () => {
      const q1 = createMinQueue()
      const q2 = createMinQueue()
      for (let i = 0; i < 500; i++) {
        q1.enqueue(i * 2)
        q2.enqueue(i * 2 + 1)
      }
      const merged = q1.merge(q2)
      expect(merged.size()).toBe(1000)
      expect(merged.isValid()).toBe(true)
      for (let i = 0; i < 1000; i++) {
        expect(merged.dequeue()).toBe(i)
      }
    })

    it('handles interleaved operations on 1000 elements', () => {
      const q = createMinQueue()
      let expectedSize = 0
      for (let i = 0; i < 1000; i++) {
        q.enqueue(Math.floor(Math.random() * 5000))
        expectedSize++
        if (i % 3 === 0 && expectedSize > 0) {
          const val = q.dequeue()
          expect(val).not.toBeUndefined()
          expectedSize--
        }
      }
      expect(q.size()).toBe(expectedSize)
      expect(q.isValid()).toBe(true)
      const remaining = q.toArray()
      for (let i = 1; i < remaining.length; i++) {
        expect(remaining[i]).toBeGreaterThanOrEqual(remaining[i - 1]!)
      }
    })

    it('handles cloning 1000 element queue', () => {
      const q = createMinQueue()
      for (let i = 0; i < 1000; i++) {
        q.enqueue(i)
      }
      const cloned = q.clone()
      expect(cloned.size()).toBe(1000)
      expect(cloned.isValid()).toBe(true)
      expect(cloned.toArray()).toEqual(q.toArray())
    })

    it('handles toArray on 1000 elements', () => {
      const q = createMinQueue()
      for (let i = 999; i >= 0; i--) {
        q.enqueue(i)
      }
      const arr = q.toArray()
      expect(arr.length).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(arr[i]).toBe(i)
      }
    })

    it('handles contains on large queue', () => {
      const q = createMinQueue()
      for (let i = 0; i < 1000; i++) {
        q.enqueue(i)
      }
      for (let i = 0; i < 1000; i++) {
        expect(q.contains(i)).toBe(true)
      }
      expect(q.contains(-1)).toBe(false)
      expect(q.contains(1000)).toBe(false)
    })

    it('handles repeated merge operations', () => {
      let queue = createMinQueue()
      for (let batch = 0; batch < 10; batch++) {
        const other = createMinQueue()
        for (let i = 0; i < 100; i++) {
          other.enqueue(batch * 100 + i)
        }
        queue = queue.merge(other)
      }
      expect(queue.size()).toBe(1000)
      expect(queue.isValid()).toBe(true)
      for (let i = 0; i < 1000; i++) {
        expect(queue.dequeue()).toBe(i)
      }
    })

    it('handles enqueueMany with 1000 items', () => {
      const q = createMinQueue()
      const items = Array.from({ length: 1000 }, (_, i) => 1000 - i)
      q.enqueueMany(items)
      expect(q.size()).toBe(1000)
      expect(q.peek()).toBe(1)
      expect(q.isValid()).toBe(true)
    })

    it('handles dequeueMany on large queue', () => {
      const q = createMinQueue()
      q.enqueueMany(Array.from({ length: 1000 }, (_, i) => i))
      const items = q.dequeueMany(500)
      expect(items.length).toBe(500)
      for (let i = 0; i < 500; i++) {
        expect(items[i]).toBe(i)
      }
      expect(q.size()).toBe(500)
    })

    it('handles fromArray with 1000 items', () => {
      const items = Array.from({ length: 1000 }, (_, i) => 1000 - i)
      const q = MergeQueue.fromArray(items)
      expect(q.size()).toBe(1000)
      expect(q.isValid()).toBe(true)
      expect(q.peek()).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('works with strings', () => {
      const q = new MergeQueue<string>()
      q.enqueue('delta')
      q.enqueue('alpha')
      q.enqueue('charlie')
      q.enqueue('bravo')
      expect(q.dequeue()).toBe('alpha')
      expect(q.dequeue()).toBe('bravo')
      expect(q.dequeue()).toBe('charlie')
      expect(q.dequeue()).toBe('delta')
    })

    it('works with objects using custom comparator', () => {
      type Point = { x: number; y: number }
      const q = new MergeQueue<Point>({
        comparator: (a, b) => a.x - b.x || a.y - b.y,
      })
      q.enqueue({ x: 3, y: 1 })
      q.enqueue({ x: 1, y: 2 })
      q.enqueue({ x: 1, y: 1 })
      const first = q.dequeue()
      expect(first?.x).toBe(1)
      expect(first?.y).toBe(1)
      const second = q.dequeue()
      expect(second?.x).toBe(1)
      expect(second?.y).toBe(2)
    })

    it('handles insertion of already sorted sequence', () => {
      const q = createMinQueue()
      for (let i = 1; i <= 50; i++) {
        q.enqueue(i)
      }
      expect(q.isValid()).toBe(true)
      expect(q.peek()).toBe(1)
      for (let i = 1; i <= 50; i++) {
        expect(q.dequeue()).toBe(i)
      }
    })

    it('handles insertion of reverse sorted sequence', () => {
      const q = createMinQueue()
      for (let i = 50; i >= 1; i--) {
        q.enqueue(i)
      }
      expect(q.isValid()).toBe(true)
      for (let i = 1; i <= 50; i++) {
        expect(q.dequeue()).toBe(i)
      }
    })

    it('handles single element edge case', () => {
      const q = createMinQueue()
      q.enqueue(42)
      expect(q.size()).toBe(1)
      expect(q.peek()).toBe(42)
      expect(q.dequeue()).toBe(42)
      expect(q.isEmpty()).toBe(true)
      expect(q.peek()).toBeUndefined()
      expect(q.dequeue()).toBeUndefined()
    })

    it('handles two elements', () => {
      const q = createMinQueue()
      q.enqueue(2)
      q.enqueue(1)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
    })

    it('handles clearing and reusing', () => {
      const q = createMinQueue()
      for (let i = 0; i < 5; i++) q.enqueue(i)
      q.clear()
      expect(q.isValid()).toBe(true)
      for (let i = 10; i < 20; i++) q.enqueue(i)
      expect(q.size()).toBe(10)
      expect(q.peek()).toBe(10)
      expect(q.isValid()).toBe(true)
    })

    it('dequeue on empty queue returns undefined repeatedly', () => {
      const q = createMinQueue()
      expect(q.dequeue()).toBeUndefined()
      expect(q.dequeue()).toBeUndefined()
      expect(q.dequeue()).toBeUndefined()
      expect(q.size()).toBe(0)
    })

    it('large values', () => {
      const q = createMinQueue()
      q.enqueue(Number.MAX_SAFE_INTEGER)
      q.enqueue(Number.MIN_SAFE_INTEGER)
      q.enqueue(0)
      expect(q.dequeue()).toBe(Number.MIN_SAFE_INTEGER)
      expect(q.dequeue()).toBe(0)
      expect(q.dequeue()).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('NaN handling with custom comparator', () => {
      const q = new MergeQueue<number>({
        comparator: (a, b) => {
          if (Number.isNaN(a) && Number.isNaN(b)) return 0
          if (Number.isNaN(a)) return 1
          if (Number.isNaN(b)) return -1
          return a - b
        },
      })
      q.enqueue(3)
      q.enqueue(NaN)
      q.enqueue(1)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(3)
      expect(q.dequeue()).toBeNaN()
    })
  })

  describe('type safety', () => {
    it('works with number type', () => {
      const q = new MergeQueue<number>()
      q.enqueue(1)
      const val: number | undefined = q.dequeue()
      expect(typeof val).toBe('number')
    })

    it('works with string type', () => {
      const q = new MergeQueue<string>()
      q.enqueue('test')
      const val: string | undefined = q.dequeue()
      expect(typeof val).toBe('string')
    })

    it('works with custom type', () => {
      type PriorityItem = { priority: number; label: string }
      const q = new MergeQueue<PriorityItem>({
        comparator: (a, b) => a.priority - b.priority,
      })
      q.enqueue({ priority: 3, label: 'low' })
      q.enqueue({ priority: 1, label: 'high' })
      q.enqueue({ priority: 2, label: 'medium' })
      const first = q.dequeue()
      expect(first?.label).toBe('high')
      expect(first?.priority).toBe(1)
    })
  })

  describe('complex merge scenarios', () => {
    it('merge preserves ordering for alternating insert queues', () => {
      const q1 = createMinQueue()
      const q2 = createMinQueue()
      for (let i = 0; i < 50; i++) {
        if (i % 2 === 0) q1.enqueue(i)
        else q2.enqueue(i)
      }
      const merged = q1.merge(q2)
      for (let i = 0; i < 50; i++) {
        expect(merged.dequeue()).toBe(i)
      }
    })

    it('multiple merges maintain validity', () => {
      let queue = createMinQueue()
      for (let round = 0; round < 5; round++) {
        const other = createMinQueue()
        for (let i = 0; i < 20; i++) {
          other.enqueue(round * 20 + i)
        }
        queue = queue.merge(other)
        expect(queue.isValid()).toBe(true)
      }
      expect(queue.size()).toBe(100)
    })

    it('merge and dequeue interleaved', () => {
      const q1 = createMinQueue()
      q1.enqueue(1)
      q1.enqueue(5)
      const q2 = createMinQueue()
      q2.enqueue(2)
      q2.enqueue(4)
      const merged = q1.merge(q2)
      expect(merged.dequeue()).toBe(1)
      expect(merged.dequeue()).toBe(2)
      const q3 = createMinQueue()
      q3.enqueue(0)
      q3.enqueue(3)
      const merged2 = merged.merge(q3)
      expect(merged2.dequeue()).toBe(0)
      expect(merged2.dequeue()).toBe(3)
      expect(merged2.dequeue()).toBe(4)
      expect(merged2.dequeue()).toBe(5)
    })

    it('merge then remove', () => {
      const q1 = createMinQueue()
      q1.enqueueMany([1, 3, 5])
      const q2 = createMinQueue()
      q2.enqueueMany([2, 4, 6])
      const merged = q1.merge(q2)
      merged.remove(3)
      expect(merged.toArray()).toEqual([1, 2, 4, 5, 6])
      expect(merged.isValid()).toBe(true)
    })

    it('merge then decreaseKey', () => {
      const q1 = createMinQueue()
      q1.enqueueMany([10, 30, 50])
      const q2 = createMinQueue()
      q2.enqueueMany([20, 40, 60])
      const merged = q1.merge(q2)
      merged.decreaseKey(60, 0)
      expect(merged.peek()).toBe(0)
      expect(merged.isValid()).toBe(true)
    })

    it('merge then clone', () => {
      const q1 = createMinQueue()
      q1.enqueueMany([1, 3])
      const q2 = createMinQueue()
      q2.enqueueMany([2, 4])
      const merged = q1.merge(q2)
      const cloned = merged.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3, 4])
      cloned.dequeue()
      expect(merged.size()).toBe(4)
    })
  })

  describe('remove edge cases', () => {
    it('remove from queue with single element', () => {
      const q = createMinQueue()
      q.enqueue(1)
      expect(q.remove(1)).toBe(true)
      expect(q.isEmpty()).toBe(true)
      expect(q.isValid()).toBe(true)
    })

    it('remove element not in heap order', () => {
      const q = createMinQueue()
      q.enqueueMany([1, 5, 3, 7, 2])
      expect(q.remove(7)).toBe(true)
      expect(q.toArray()).toEqual([1, 2, 3, 5])
      expect(q.isValid()).toBe(true)
    })

    it('remove last element', () => {
      const q = createMinQueue()
      q.enqueueMany([1, 2, 3])
      expect(q.remove(3)).toBe(true)
      expect(q.toArray()).toEqual([1, 2])
    })
  })

  describe('decreaseKey edge cases', () => {
    it('decreaseKey on single element queue', () => {
      const q = createMinQueue()
      q.enqueue(5)
      expect(q.decreaseKey(5, 1)).toBe(true)
      expect(q.peek()).toBe(1)
      expect(q.size()).toBe(1)
    })

    it('decreaseKey when new value is still greater than root', () => {
      const q = createMinQueue()
      q.enqueueMany([1, 5, 10])
      expect(q.decreaseKey(10, 3)).toBe(true)
      expect(q.peek()).toBe(1)
      expect(q.toArray()).toEqual([1, 3, 5])
    })

    it('decreaseKey validates heap after operation', () => {
      const q = createMinQueue()
      q.enqueueMany([1, 3, 5, 7, 9])
      q.decreaseKey(9, 0)
      expect(q.isValid()).toBe(true)
      expect(q.toArray()).toEqual([0, 1, 3, 5, 7])
    })
  })
})
