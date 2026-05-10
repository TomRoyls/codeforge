import { describe, it, expect } from 'vitest'
import { DoubleEndedPriorityQueue } from '../../src/core/double-ended-priority-queue/double-ended-priority-queue.js'

describe('DoubleEndedPriorityQueue', () => {
  describe('construction', () => {
    it('creates empty queue with defaults', () => {
      const q = new DoubleEndedPriorityQueue()
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('creates queue with custom comparator', () => {
      const q = new DoubleEndedPriorityQueue<number>({
        comparator: (a, b) => b - a,
      })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.peekMin()).toBe(2)
      expect(q.peekMax()).toBe(1)
    })

    it('creates queue with initialCapacity option', () => {
      const q = new DoubleEndedPriorityQueue<number>({
        initialCapacity: 64,
      })
      expect(q.size()).toBe(0)
    })
  })

  describe('enqueue / dequeueMin basic', () => {
    it('enqueues a single element', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(5)
      expect(q.size()).toBe(1)
      expect(q.isEmpty()).toBe(false)
    })

    it('dequeues min from single element', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(42)
      expect(q.dequeueMin()).toBe(42)
      expect(q.isEmpty()).toBe(true)
    })

    it('dequeues min from two elements', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(3)
      q.enqueue(1)
      expect(q.dequeueMin()).toBe(1)
      expect(q.dequeueMin()).toBe(3)
    })

    it('returns undefined on dequeueMin from empty', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      expect(q.dequeueMin()).toBeUndefined()
    })
  })

  describe('dequeueMax basic', () => {
    it('returns undefined on dequeueMax from empty', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      expect(q.dequeueMax()).toBeUndefined()
    })

    it('dequeues max from single element', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(42)
      expect(q.dequeueMax()).toBe(42)
    })

    it('dequeues max from two elements', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(1)
      q.enqueue(10)
      expect(q.dequeueMax()).toBe(10)
      expect(q.dequeueMax()).toBe(1)
    })

    it('dequeues max from three elements', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(1)
      q.enqueue(5)
      q.enqueue(10)
      expect(q.dequeueMax()).toBe(10)
      expect(q.dequeueMax()).toBe(5)
      expect(q.dequeueMax()).toBe(1)
    })
  })

  describe('peekMin / peekMax', () => {
    it('returns undefined peekMin on empty', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      expect(q.peekMin()).toBeUndefined()
    })

    it('returns undefined peekMax on empty', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      expect(q.peekMax()).toBeUndefined()
    })

    it('peeks min without removing', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(7)
      expect(q.peekMin()).toBe(3)
      expect(q.size()).toBe(3)
    })

    it('peeks max without removing', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(7)
      expect(q.peekMax()).toBe(7)
      expect(q.size()).toBe(3)
    })

    it('peekMin and peekMax same for single element', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(99)
      expect(q.peekMin()).toBe(99)
      expect(q.peekMax()).toBe(99)
    })

    it('peekMin and peekMax same for two equal elements', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(5)
      q.enqueue(5)
      expect(q.peekMin()).toBe(5)
      expect(q.peekMax()).toBe(5)
    })
  })

  describe('ordering correctness', () => {
    it('extracts in sorted ascending order via dequeueMin', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      const values = [5, 3, 8, 1, 9, 2, 7, 4, 6]
      for (const v of values) q.enqueue(v)
      const result: number[] = []
      while (!q.isEmpty()) result.push(q.dequeueMin()!)
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('extracts in sorted descending order via dequeueMax', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      const values = [5, 3, 8, 1, 9, 2, 7, 4, 6]
      for (const v of values) q.enqueue(v)
      const result: number[] = []
      while (!q.isEmpty()) result.push(q.dequeueMax()!)
      expect(result).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1])
    })

    it('maintains min at front after multiple enqueues', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(10)
      q.enqueue(5)
      q.enqueue(15)
      q.enqueue(1)
      q.enqueue(20)
      expect(q.peekMin()).toBe(1)
    })

    it('maintains max after multiple enqueues', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(10)
      q.enqueue(5)
      q.enqueue(15)
      q.enqueue(1)
      q.enqueue(20)
      expect(q.peekMax()).toBe(20)
    })
  })

  describe('custom comparators', () => {
    it('reverse order comparator', () => {
      const q = new DoubleEndedPriorityQueue<number>({
        comparator: (a, b) => b - a,
      })
      q.enqueue(1)
      q.enqueue(5)
      q.enqueue(3)
      expect(q.peekMin()).toBe(5)
      expect(q.peekMax()).toBe(1)
    })

    it('objects with priority field', () => {
      interface Task {
        priority: number
        name: string
      }
      const q = new DoubleEndedPriorityQueue<Task>({
        comparator: (a, b) => a.priority - b.priority,
      })
      q.enqueue({ priority: 3, name: 'low' })
      q.enqueue({ priority: 1, name: 'high' })
      q.enqueue({ priority: 2, name: 'mid' })
      expect(q.peekMin()!.name).toBe('high')
      expect(q.peekMax()!.name).toBe('low')
    })

    it('string comparator', () => {
      const q = new DoubleEndedPriorityQueue<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      q.enqueue('cherry')
      q.enqueue('apple')
      q.enqueue('banana')
      expect(q.peekMin()).toBe('apple')
      expect(q.peekMax()).toBe('cherry')
    })
  })

  describe('mixed enqueue / dequeue patterns', () => {
    it('interleaved enqueue and dequeueMin', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(5)
      q.enqueue(3)
      expect(q.dequeueMin()).toBe(3)
      q.enqueue(1)
      q.enqueue(7)
      expect(q.dequeueMin()).toBe(1)
      expect(q.dequeueMin()).toBe(5)
      expect(q.dequeueMin()).toBe(7)
    })

    it('interleaved enqueue and dequeueMax', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(5)
      q.enqueue(3)
      expect(q.dequeueMax()).toBe(5)
      q.enqueue(10)
      q.enqueue(1)
      expect(q.dequeueMax()).toBe(10)
      expect(q.dequeueMax()).toBe(3)
    })

    it('alternating min and max extractions', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      for (const v of [5, 3, 8, 1, 9, 2, 7]) q.enqueue(v)
      expect(q.dequeueMin()).toBe(1)
      expect(q.dequeueMax()).toBe(9)
      expect(q.dequeueMin()).toBe(2)
      expect(q.dequeueMax()).toBe(8)
      expect(q.dequeueMin()).toBe(3)
      expect(q.dequeueMax()).toBe(7)
      expect(q.dequeueMin()).toBe(5)
    })
  })

  describe('contains', () => {
    it('returns false on empty queue', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      expect(q.contains(1)).toBe(false)
    })

    it('finds existing element', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(7)
      expect(q.contains(5)).toBe(true)
      expect(q.contains(3)).toBe(true)
      expect(q.contains(7)).toBe(true)
    })

    it('returns false for missing element', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(5)
      q.enqueue(3)
      expect(q.contains(99)).toBe(false)
    })

    it('finds duplicates', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(5)
      q.enqueue(5)
      expect(q.contains(5)).toBe(true)
    })
  })

  describe('remove', () => {
    it('returns false on empty queue', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      expect(q.remove(1)).toBe(false)
    })

    it('removes existing element', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(7)
      expect(q.remove(3)).toBe(true)
      expect(q.contains(3)).toBe(false)
      expect(q.size()).toBe(2)
    })

    it('returns false for missing element', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(5)
      expect(q.remove(99)).toBe(false)
    })

    it('removes min and heap remains valid', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(1)
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(7)
      expect(q.remove(1)).toBe(true)
      expect(q.peekMin()).toBe(3)
      expect(q.peekMax()).toBe(7)
    })

    it('removes max and heap remains valid', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(1)
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(7)
      expect(q.remove(7)).toBe(true)
      expect(q.peekMin()).toBe(1)
      expect(q.peekMax()).toBe(5)
    })

    it('removes middle element and heap remains valid', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(1)
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(7)
      q.enqueue(2)
      expect(q.remove(5)).toBe(true)
      const sorted: number[] = []
      while (!q.isEmpty()) sorted.push(q.dequeueMin()!)
      expect(sorted).toEqual([1, 2, 3, 7])
    })
  })

  describe('merge', () => {
    it('merges two non-empty queues', () => {
      const q1 = new DoubleEndedPriorityQueue<number>()
      q1.enqueue(1)
      q1.enqueue(5)
      const q2 = new DoubleEndedPriorityQueue<number>()
      q2.enqueue(3)
      q2.enqueue(7)
      q1.merge(q2)
      expect(q1.size()).toBe(4)
      expect(q1.peekMin()).toBe(1)
      expect(q1.peekMax()).toBe(7)
    })

    it('merges into empty queue', () => {
      const q1 = new DoubleEndedPriorityQueue<number>()
      const q2 = new DoubleEndedPriorityQueue<number>()
      q2.enqueue(1)
      q2.enqueue(2)
      q1.merge(q2)
      expect(q1.size()).toBe(2)
      expect(q1.peekMin()).toBe(1)
    })

    it('merge empty into non-empty', () => {
      const q1 = new DoubleEndedPriorityQueue<number>()
      q1.enqueue(1)
      const q2 = new DoubleEndedPriorityQueue<number>()
      q1.merge(q2)
      expect(q1.size()).toBe(1)
    })

    it('merge preserves ordering', () => {
      const q1 = new DoubleEndedPriorityQueue<number>()
      q1.enqueue(5)
      q1.enqueue(1)
      const q2 = new DoubleEndedPriorityQueue<number>()
      q2.enqueue(3)
      q2.enqueue(9)
      q1.merge(q2)
      const result: number[] = []
      while (!q1.isEmpty()) result.push(q1.dequeueMin()!)
      expect(result).toEqual([1, 3, 5, 9])
    })
  })

  describe('decreaseKey', () => {
    it('decreases key and maintains heap', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(5)
      q.enqueue(10)
      q.enqueue(3)
      expect(q.decreaseKey(10, 1)).toBe(true)
      expect(q.peekMin()).toBe(1)
    })

    it('returns false for missing key', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(5)
      expect(q.decreaseKey(99, 1)).toBe(false)
    })

    it('decreaseKey on empty queue', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      expect(q.decreaseKey(1, 0)).toBe(false)
    })

    it('decreaseKey preserves full ordering', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      q.enqueue(40)
      q.decreaseKey(40, 5)
      const result: number[] = []
      while (!q.isEmpty()) result.push(q.dequeueMin()!)
      expect(result).toEqual([5, 10, 20, 30])
    })
  })

  describe('increaseKey', () => {
    it('increases key and maintains heap', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(5)
      q.enqueue(1)
      q.enqueue(10)
      expect(q.increaseKey(1, 20)).toBe(true)
      expect(q.peekMax()).toBe(20)
    })

    it('returns false for missing key', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(5)
      expect(q.increaseKey(99, 100)).toBe(false)
    })

    it('increaseKey on empty queue', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      expect(q.increaseKey(1, 10)).toBe(false)
    })

    it('increaseKey preserves full ordering', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      q.enqueue(5)
      q.increaseKey(5, 50)
      const result: number[] = []
      while (!q.isEmpty()) result.push(q.dequeueMax()!)
      expect(result).toEqual([50, 30, 20, 10])
    })
  })

  describe('iterator and forEach', () => {
    it('iterates with for-of', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(3)
      q.enqueue(1)
      q.enqueue(2)
      const result: number[] = []
      for (const v of q) result.push(v)
      expect(result.length).toBe(3)
      expect(result.sort()).toEqual([1, 2, 3])
    })

    it('forEach iterates all elements', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      const result: number[] = []
      q.forEach((v) => result.push(v))
      expect(result.length).toBe(3)
    })

    it('forEach provides correct index', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(10)
      q.enqueue(20)
      const indices: number[] = []
      q.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1])
    })

    it('iterator on empty queue yields nothing', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      const result: number[] = []
      for (const v of q) result.push(v)
      expect(result).toEqual([])
    })

    it('forEach on empty queue does nothing', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      let count = 0
      q.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('empty queue operations', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      expect(q.dequeueMin()).toBeUndefined()
      expect(q.dequeueMax()).toBeUndefined()
      expect(q.peekMin()).toBeUndefined()
      expect(q.peekMax()).toBeUndefined()
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('single element', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(42)
      expect(q.peekMin()).toBe(42)
      expect(q.peekMax()).toBe(42)
      expect(q.dequeueMin()).toBe(42)
      expect(q.isEmpty()).toBe(true)
    })

    it('duplicate priorities', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(5)
      q.enqueue(5)
      q.enqueue(5)
      expect(q.dequeueMin()).toBe(5)
      expect(q.dequeueMin()).toBe(5)
      expect(q.dequeueMin()).toBe(5)
      expect(q.isEmpty()).toBe(true)
    })

    it('clear empties the queue', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.clear()
      expect(q.isEmpty()).toBe(true)
      expect(q.size()).toBe(0)
    })

    it('toArray returns all elements', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(3)
      q.enqueue(1)
      q.enqueue(2)
      const arr = q.toArray()
      expect(arr.length).toBe(3)
      expect(arr.sort()).toEqual([1, 2, 3])
    })

    it('toArray on empty returns empty array', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      expect(q.toArray()).toEqual([])
    })

    it('operations after clear work correctly', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      q.enqueue(10)
      expect(q.peekMin()).toBe(10)
      expect(q.size()).toBe(1)
    })
  })

  describe('large-scale operations', () => {
    it('handles 100 elements sorted extraction via dequeueMin', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      for (let i = 100; i >= 1; i--) q.enqueue(i)
      const result: number[] = []
      while (!q.isEmpty()) result.push(q.dequeueMin()!)
      for (let i = 0; i < 100; i++) {
        expect(result[i]).toBe(i + 1)
      }
    })

    it('handles 100 elements sorted extraction via dequeueMax', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      for (let i = 1; i <= 100; i++) q.enqueue(i)
      const result: number[] = []
      while (!q.isEmpty()) result.push(q.dequeueMax()!)
      for (let i = 0; i < 100; i++) {
        expect(result[i]).toBe(100 - i)
      }
    })

    it('handles random insertions', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      const values: number[] = []
      for (let i = 0; i < 50; i++) {
        const v = Math.floor(Math.random() * 1000)
        values.push(v)
        q.enqueue(v)
      }
      values.sort((a, b) => a - b)
      for (const v of values) {
        expect(q.dequeueMin()).toBe(v)
      }
    })

    it('interleaved min/max extractions on large set', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      for (let i = 1; i <= 20; i++) q.enqueue(i)
      const mins: number[] = []
      const maxes: number[] = []
      for (let i = 0; i < 10; i++) {
        mins.push(q.dequeueMin()!)
        maxes.push(q.dequeueMax()!)
      }
      expect(mins).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      expect(maxes).toEqual([20, 19, 18, 17, 16, 15, 14, 13, 12, 11])
    })

    it('handles 200 elements merge', () => {
      const q1 = new DoubleEndedPriorityQueue<number>()
      const q2 = new DoubleEndedPriorityQueue<number>()
      for (let i = 0; i < 100; i++) {
        q1.enqueue(i * 2)
        q2.enqueue(i * 2 + 1)
      }
      q1.merge(q2)
      expect(q1.size()).toBe(200)
      for (let i = 0; i < 200; i++) {
        expect(q1.dequeueMin()).toBe(i)
      }
    })
  })

  describe('negative numbers', () => {
    it('handles negative values', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(-5)
      q.enqueue(3)
      q.enqueue(-10)
      q.enqueue(7)
      expect(q.peekMin()).toBe(-10)
      expect(q.peekMax()).toBe(7)
    })
  })

  describe('zero values', () => {
    it('handles zero correctly', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(0)
      q.enqueue(-1)
      q.enqueue(1)
      expect(q.dequeueMin()).toBe(-1)
      expect(q.dequeueMin()).toBe(0)
      expect(q.dequeueMin()).toBe(1)
    })
  })

  describe('string values', () => {
    it('handles string values with custom comparator', () => {
      const q = new DoubleEndedPriorityQueue<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      q.enqueue('delta')
      q.enqueue('alpha')
      q.enqueue('charlie')
      q.enqueue('bravo')
      expect(q.peekMin()).toBe('alpha')
      expect(q.peekMax()).toBe('delta')
    })
  })

  describe('remove and re-extract', () => {
    it('remove then extract remaining in order', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      for (const v of [4, 2, 6, 1, 3, 5, 7]) q.enqueue(v)
      q.remove(4)
      const mins: number[] = []
      while (!q.isEmpty()) mins.push(q.dequeueMin()!)
      expect(mins).toEqual([1, 2, 3, 5, 6, 7])
    })
  })

  describe('decreaseKey and increaseKey combined', () => {
    it('alternating key updates', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      q.decreaseKey(30, 5)
      expect(q.peekMin()).toBe(5)
      q.increaseKey(5, 50)
      expect(q.peekMax()).toBe(50)
      q.decreaseKey(50, 1)
      expect(q.peekMin()).toBe(1)
    })
  })

  describe('enqueue many then drain', () => {
    it('enqueues 50 then drains alternating', () => {
      const q = new DoubleEndedPriorityQueue<number>()
      for (let i = 1; i <= 50; i++) q.enqueue(i)
      let min = 1
      let max = 50
      while (!q.isEmpty()) {
        expect(q.dequeueMin()).toBe(min)
        min++
        if (!q.isEmpty()) {
          expect(q.dequeueMax()).toBe(max)
          max--
        }
      }
    })
  })
})
