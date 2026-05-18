import { describe, expect, it } from 'vitest'
import { AmortizedPriorityQueue } from '../src/core/amortized-priority-queue/amortized-priority-queue.js'

describe('AmortizedPriorityQueue', () => {
  describe('constructor and initialization', () => {
    it('should create an empty queue with default options', () => {
      const pq = new AmortizedPriorityQueue<number>()
      expect(pq.size).toBe(0)
      expect(pq.isEmpty).toBe(true)
    })

    it('should accept custom bufferSize', () => {
      const pq = new AmortizedPriorityQueue<number>({ bufferSize: 4 })
      expect(pq.size).toBe(0)
      expect(pq.isEmpty).toBe(true)
    })

    it('should accept custom comparator for max-heap behavior', () => {
      const pq = new AmortizedPriorityQueue<number>({
        comparator: (a, b) => b - a,
      })
      pq.enqueue(1)
      pq.enqueue(5)
      pq.enqueue(3)
      expect(pq.dequeue()).toBe(5)
    })

    it('should accept both bufferSize and comparator', () => {
      const pq = new AmortizedPriorityQueue<string>({
        bufferSize: 8,
        comparator: (a, b) => b.localeCompare(a),
      })
      pq.enqueue('a')
      pq.enqueue('z')
      pq.enqueue('m')
      expect(pq.dequeue()).toBe('z')
    })

    it('should accept empty options object', () => {
      const pq = new AmortizedPriorityQueue<number>({})
      expect(pq.size).toBe(0)
      expect(pq.isEmpty).toBe(true)
    })
  })

  describe('enqueue / dequeue basic operations', () => {
    it('should enqueue and dequeue a single item', () => {
      const pq = new AmortizedPriorityQueue<number>()
      pq.enqueue(42)
      expect(pq.dequeue()).toBe(42)
    })

    it('should dequeue items in ascending order by default', () => {
      const pq = new AmortizedPriorityQueue<number>()
      pq.enqueue(5)
      pq.enqueue(1)
      pq.enqueue(3)
      pq.enqueue(2)
      pq.enqueue(4)

      expect(pq.dequeue()).toBe(1)
      expect(pq.dequeue()).toBe(2)
      expect(pq.dequeue()).toBe(3)
      expect(pq.dequeue()).toBe(4)
      expect(pq.dequeue()).toBe(5)
    })

    it('should return undefined when dequeueing from empty queue', () => {
      const pq = new AmortizedPriorityQueue<number>()
      expect(pq.dequeue()).toBeUndefined()
    })

    it('should handle enqueue after all items have been dequeued', () => {
      const pq = new AmortizedPriorityQueue<number>()
      pq.enqueue(10)
      expect(pq.dequeue()).toBe(10)
      expect(pq.isEmpty).toBe(true)

      pq.enqueue(20)
      expect(pq.dequeue()).toBe(20)
    })

    it('should handle duplicate values', () => {
      const pq = new AmortizedPriorityQueue<number>()
      pq.enqueue(5)
      pq.enqueue(5)
      pq.enqueue(5)
      expect(pq.dequeue()).toBe(5)
      expect(pq.dequeue()).toBe(5)
      expect(pq.dequeue()).toBe(5)
      expect(pq.isEmpty).toBe(true)
    })
  })

  describe('priority ordering', () => {
    it('should always return the minimum element', () => {
      const pq = new AmortizedPriorityQueue<number>()
      const values = [10, 2, 8, 1, 9, 3, 7, 4, 6, 5]
      for (const v of values) pq.enqueue(v)

      const result: number[] = []
      while (!pq.isEmpty) result.push(pq.dequeue()!)
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('should handle negative numbers', () => {
      const pq = new AmortizedPriorityQueue<number>()
      pq.enqueue(-5)
      pq.enqueue(-1)
      pq.enqueue(-10)
      pq.enqueue(0)

      expect(pq.dequeue()).toBe(-10)
      expect(pq.dequeue()).toBe(-5)
      expect(pq.dequeue()).toBe(-1)
      expect(pq.dequeue()).toBe(0)
    })

    it('should handle string ordering with default comparator', () => {
      const pq = new AmortizedPriorityQueue<string>()
      pq.enqueue('cherry')
      pq.enqueue('apple')
      pq.enqueue('banana')
      expect(pq.dequeue()).toBe('apple')
      expect(pq.dequeue()).toBe('banana')
      expect(pq.dequeue()).toBe('cherry')
    })
  })

  describe('buffer flushing behavior', () => {
    it('should auto-flush when buffer reaches bufferSize', () => {
      const pq = new AmortizedPriorityQueue<number>({ bufferSize: 4 })
      pq.enqueue(1)
      pq.enqueue(2)
      pq.enqueue(3)
      // buffer has 3 items, not yet flushed
      expect(pq.bufferSize).toBe(3)
      expect(pq.heapSize).toBe(0)

      pq.enqueue(4)
      // buffer reached 4 (>= bufferSize), should flush
      expect(pq.heapSize).toBe(4)
      expect(pq.bufferSize).toBe(0)
    })

    it('should auto-flush exactly at bufferSize boundary', () => {
      const pq = new AmortizedPriorityQueue<number>({ bufferSize: 3 })
      pq.enqueue(10)
      pq.enqueue(20)
      expect(pq.bufferSize).toBe(2)
      expect(pq.heapSize).toBe(0)

      pq.enqueue(30)
      expect(pq.bufferSize).toBe(0)
      expect(pq.heapSize).toBe(3)
    })

    it('should still dequeue correctly after flush', () => {
      const pq = new AmortizedPriorityQueue<number>({ bufferSize: 3 })
      pq.enqueue(30)
      pq.enqueue(10)
      pq.enqueue(20)
      // flushed at 3
      expect(pq.dequeue()).toBe(10)
      expect(pq.dequeue()).toBe(20)
      expect(pq.dequeue()).toBe(30)
    })

    it('should handle multiple flush cycles', () => {
      const pq = new AmortizedPriorityQueue<number>({ bufferSize: 3 })
      // First batch
      pq.enqueue(5)
      pq.enqueue(3)
      pq.enqueue(1) // flush -> heap has [1,3,5]
      expect(pq.heapSize).toBe(3)

      // Second batch - goes to buffer
      pq.enqueue(4)
      pq.enqueue(2)
      expect(pq.bufferSize).toBe(2)

      pq.enqueue(6) // flush -> heap gets merged with buffer
      expect(pq.bufferSize).toBe(0)

      // Dequeue all in order
      const result: number[] = []
      while (!pq.isEmpty) result.push(pq.dequeue()!)
      expect(result).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('should use default bufferSize of 64', () => {
      const pq = new AmortizedPriorityQueue<number>()
      // Fill 63 items - buffer only
      for (let i = 0; i < 63; i++) pq.enqueue(i)
      expect(pq.heapSize).toBe(0)
      expect(pq.bufferSize).toBe(63)

      // 64th item triggers flush
      pq.enqueue(100)
      expect(pq.bufferSize).toBe(0)
      expect(pq.heapSize).toBe(64)
    })
  })

  describe('custom comparator', () => {
    it('should support max-heap (descending order)', () => {
      const pq = new AmortizedPriorityQueue<number>({
        comparator: (a, b) => b - a,
      })
      pq.enqueue(1)
      pq.enqueue(5)
      pq.enqueue(3)
      pq.enqueue(2)
      pq.enqueue(4)

      expect(pq.dequeue()).toBe(5)
      expect(pq.dequeue()).toBe(4)
      expect(pq.dequeue()).toBe(3)
      expect(pq.dequeue()).toBe(2)
      expect(pq.dequeue()).toBe(1)
    })

    it('should support string reverse ordering', () => {
      const pq = new AmortizedPriorityQueue<string>({
        comparator: (a, b) => b.localeCompare(a),
      })
      pq.enqueue('alpha')
      pq.enqueue('zulu')
      pq.enqueue('mike')
      expect(pq.dequeue()).toBe('zulu')
      expect(pq.dequeue()).toBe('mike')
      expect(pq.dequeue()).toBe('alpha')
    })

    it('should support object comparison by a property', () => {
      interface Task {
        priority: number
        name: string
      }
      const pq = new AmortizedPriorityQueue<Task>({
        comparator: (a, b) => a.priority - b.priority,
      })
      pq.enqueue({ priority: 3, name: 'low' })
      pq.enqueue({ priority: 1, name: 'high' })
      pq.enqueue({ priority: 2, name: 'medium' })

      expect(pq.dequeue()?.name).toBe('high')
      expect(pq.dequeue()?.name).toBe('medium')
      expect(pq.dequeue()?.name).toBe('low')
    })
  })

  describe('peek', () => {
    it('should return the minimum element without removing it', () => {
      const pq = new AmortizedPriorityQueue<number>()
      pq.enqueue(5)
      pq.enqueue(1)
      pq.enqueue(3)
      expect(pq.peek()).toBe(1)
      expect(pq.size).toBe(3)
    })

    it('should return undefined when peeking empty queue', () => {
      const pq = new AmortizedPriorityQueue<number>()
      expect(pq.peek()).toBeUndefined()
    })

    it('should reflect new min after dequeue', () => {
      const pq = new AmortizedPriorityQueue<number>()
      pq.enqueue(1)
      pq.enqueue(2)
      pq.enqueue(3)
      expect(pq.peek()).toBe(1)
      pq.dequeue()
      expect(pq.peek()).toBe(2)
      pq.dequeue()
      expect(pq.peek()).toBe(3)
    })

    it('should peek correctly when data is in buffer only', () => {
      const pq = new AmortizedPriorityQueue<number>()
      pq.enqueue(10)
      pq.enqueue(2)
      pq.enqueue(7)
      // all in buffer, no flush yet
      expect(pq.heapSize).toBe(0)
      expect(pq.peek()).toBe(2)
    })

    it('should peek correctly when data spans heap and buffer', () => {
      const pq = new AmortizedPriorityQueue<number>({ bufferSize: 3 })
      pq.enqueue(10)
      pq.enqueue(20)
      pq.enqueue(30) // flush -> heap
      expect(pq.heapSize).toBe(3)

      pq.enqueue(5) // buffer - smaller than heap top
      expect(pq.peek()).toBe(5)
    })
  })

  describe('size and isEmpty', () => {
    it('should track size correctly across operations', () => {
      const pq = new AmortizedPriorityQueue<number>()
      expect(pq.size).toBe(0)

      pq.enqueue(1)
      expect(pq.size).toBe(1)

      pq.enqueue(2)
      expect(pq.size).toBe(2)

      pq.dequeue()
      expect(pq.size).toBe(1)

      pq.dequeue()
      expect(pq.size).toBe(0)
    })

    it('should report isEmpty correctly', () => {
      const pq = new AmortizedPriorityQueue<number>()
      expect(pq.isEmpty).toBe(true)

      pq.enqueue(1)
      expect(pq.isEmpty).toBe(false)

      pq.dequeue()
      expect(pq.isEmpty).toBe(true)
    })

    it('should reflect size after clear', () => {
      const pq = new AmortizedPriorityQueue<number>()
      pq.enqueue(1)
      pq.enqueue(2)
      pq.enqueue(3)
      expect(pq.size).toBe(3)
      pq.clear()
      expect(pq.size).toBe(0)
      expect(pq.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all elements', () => {
      const pq = new AmortizedPriorityQueue<number>()
      pq.enqueue(1)
      pq.enqueue(2)
      pq.enqueue(3)
      pq.clear()
      expect(pq.size).toBe(0)
      expect(pq.isEmpty).toBe(true)
    })

    it('should allow enqueue after clear', () => {
      const pq = new AmortizedPriorityQueue<number>()
      pq.enqueue(1)
      pq.clear()
      pq.enqueue(2)
      expect(pq.size).toBe(1)
      expect(pq.dequeue()).toBe(2)
    })

    it('should clear both heap and buffer', () => {
      const pq = new AmortizedPriorityQueue<number>({ bufferSize: 3 })
      pq.enqueue(1)
      pq.enqueue(2)
      pq.enqueue(3) // flush -> heap
      pq.enqueue(4) // buffer
      expect(pq.heapSize).toBe(3)
      expect(pq.bufferSize).toBe(1)

      pq.clear()
      expect(pq.heapSize).toBe(0)
      expect(pq.bufferSize).toBe(0)
    })

    it('should be safe to clear an empty queue', () => {
      const pq = new AmortizedPriorityQueue<number>()
      pq.clear()
      expect(pq.size).toBe(0)
      expect(pq.isEmpty).toBe(true)
    })
  })

  describe('toArray', () => {
    it('should return sorted array', () => {
      const pq = new AmortizedPriorityQueue<number>()
      pq.enqueue(3)
      pq.enqueue(1)
      pq.enqueue(2)
      expect(pq.toArray()).toEqual([1, 2, 3])
    })

    it('should not modify the queue', () => {
      const pq = new AmortizedPriorityQueue<number>()
      pq.enqueue(3)
      pq.enqueue(1)
      pq.enqueue(2)
      pq.toArray()
      expect(pq.size).toBe(3)
    })

    it('should return empty array for empty queue', () => {
      const pq = new AmortizedPriorityQueue<number>()
      expect(pq.toArray()).toEqual([])
    })

    it('should merge heap and buffer into sorted result', () => {
      const pq = new AmortizedPriorityQueue<number>({ bufferSize: 3 })
      pq.enqueue(10)
      pq.enqueue(20)
      pq.enqueue(30) // flush -> heap
      pq.enqueue(5)
      pq.enqueue(15) // buffer
      expect(pq.toArray()).toEqual([5, 10, 15, 20, 30])
    })
  })

  describe('contains', () => {
    it('should find an item in the buffer', () => {
      const pq = new AmortizedPriorityQueue<number>()
      pq.enqueue(1)
      pq.enqueue(2)
      expect(pq.contains(1)).toBe(true)
      expect(pq.contains(2)).toBe(true)
    })

    it('should find an item in the heap', () => {
      const pq = new AmortizedPriorityQueue<number>({ bufferSize: 2 })
      pq.enqueue(1)
      pq.enqueue(2) // flush at 2
      expect(pq.contains(1)).toBe(true)
      expect(pq.contains(2)).toBe(true)
    })

    it('should return false for missing item', () => {
      const pq = new AmortizedPriorityQueue<number>()
      pq.enqueue(1)
      pq.enqueue(2)
      expect(pq.contains(99)).toBe(false)
    })

    it('should return false for empty queue', () => {
      const pq = new AmortizedPriorityQueue<number>()
      expect(pq.contains(1)).toBe(false)
    })

    it('should use identity comparison (===)', () => {
      const pq = new AmortizedPriorityQueue<string>()
      pq.enqueue('hello')
      expect(pq.contains('hello')).toBe(true)
      expect(pq.contains('world')).toBe(false)
    })
  })

  describe('remove', () => {
    it('should remove an item from the buffer', () => {
      const pq = new AmortizedPriorityQueue<number>()
      pq.enqueue(1)
      pq.enqueue(2)
      pq.enqueue(3)
      expect(pq.remove(2)).toBe(true)
      expect(pq.contains(2)).toBe(false)
      expect(pq.size).toBe(2)
    })

    it('should remove an item from the heap', () => {
      const pq = new AmortizedPriorityQueue<number>({ bufferSize: 3 })
      pq.enqueue(1)
      pq.enqueue(2)
      pq.enqueue(3) // flush -> heap
      expect(pq.remove(2)).toBe(true)
      expect(pq.contains(2)).toBe(false)
      expect(pq.size).toBe(2)
    })

    it('should return false if item not found', () => {
      const pq = new AmortizedPriorityQueue<number>()
      pq.enqueue(1)
      expect(pq.remove(99)).toBe(false)
    })

    it('should maintain correct ordering after remove from heap', () => {
      const pq = new AmortizedPriorityQueue<number>({ bufferSize: 3 })
      pq.enqueue(1)
      pq.enqueue(2)
      pq.enqueue(3) // flush -> heap
      pq.remove(2)
      expect(pq.toArray()).toEqual([1, 3])
    })

    it('should return false when removing from empty queue', () => {
      const pq = new AmortizedPriorityQueue<number>()
      expect(pq.remove(1)).toBe(false)
    })

    it('should remove the only item in the heap', () => {
      const pq = new AmortizedPriorityQueue<number>({ bufferSize: 1 })
      pq.enqueue(42) // flush -> heap has [42]
      expect(pq.remove(42)).toBe(true)
      expect(pq.isEmpty).toBe(true)
    })

    it('should handle removing then dequeuing', () => {
      const pq = new AmortizedPriorityQueue<number>()
      pq.enqueue(1)
      pq.enqueue(2)
      pq.enqueue(3)
      pq.remove(1)
      expect(pq.dequeue()).toBe(2)
      expect(pq.dequeue()).toBe(3)
      expect(pq.isEmpty).toBe(true)
    })
  })

  describe('drain', () => {
    it('should return sorted array and clear the queue', () => {
      const pq = new AmortizedPriorityQueue<number>()
      pq.enqueue(3)
      pq.enqueue(1)
      pq.enqueue(2)
      const result = pq.drain()
      expect(result).toEqual([1, 2, 3])
      expect(pq.isEmpty).toBe(true)
      expect(pq.size).toBe(0)
    })

    it('should return empty array for empty queue', () => {
      const pq = new AmortizedPriorityQueue<number>()
      expect(pq.drain()).toEqual([])
    })

    it('should allow reuse after drain', () => {
      const pq = new AmortizedPriorityQueue<number>()
      pq.enqueue(1)
      pq.drain()
      pq.enqueue(2)
      expect(pq.size).toBe(1)
      expect(pq.dequeue()).toBe(2)
    })

    it('should drain items from both heap and buffer', () => {
      const pq = new AmortizedPriorityQueue<number>({ bufferSize: 3 })
      pq.enqueue(10)
      pq.enqueue(20)
      pq.enqueue(30) // flush -> heap
      pq.enqueue(5)
      pq.enqueue(15) // buffer
      const result = pq.drain()
      expect(result).toEqual([5, 10, 15, 20, 30])
      expect(pq.heapSize).toBe(0)
      expect(pq.bufferSize).toBe(0)
    })
  })

  describe('flush', () => {
    it('should move buffer contents to heap', () => {
      const pq = new AmortizedPriorityQueue<number>()
      pq.enqueue(1)
      pq.enqueue(2)
      pq.enqueue(3)
      expect(pq.bufferSize).toBe(3)
      expect(pq.heapSize).toBe(0)

      pq.flush()
      expect(pq.bufferSize).toBe(0)
      expect(pq.heapSize).toBe(3)
    })

    it('should do nothing when buffer is empty', () => {
      const pq = new AmortizedPriorityQueue<number>()
      pq.flush()
      expect(pq.size).toBe(0)
    })

    it('should merge buffer into existing heap', () => {
      const pq = new AmortizedPriorityQueue<number>({ bufferSize: 3 })
      pq.enqueue(10)
      pq.enqueue(20)
      pq.enqueue(30) // flush -> heap has [10,20,30]

      pq.enqueue(5)
      pq.enqueue(25) // buffer has [5,25]
      expect(pq.heapSize).toBe(3)
      expect(pq.bufferSize).toBe(2)

      pq.flush()
      expect(pq.bufferSize).toBe(0)
      expect(pq.heapSize).toBe(5)
      expect(pq.toArray()).toEqual([5, 10, 20, 25, 30])
    })

    it('should maintain correct dequeue order after flush', () => {
      const pq = new AmortizedPriorityQueue<number>()
      pq.enqueue(5)
      pq.enqueue(3)
      pq.enqueue(1)
      pq.enqueue(4)
      pq.enqueue(2)
      pq.flush()
      expect(pq.dequeue()).toBe(1)
      expect(pq.dequeue()).toBe(2)
      expect(pq.dequeue()).toBe(3)
      expect(pq.dequeue()).toBe(4)
      expect(pq.dequeue()).toBe(5)
    })
  })

  describe('bufferSize and heapSize getters', () => {
    it('should report correct buffer size', () => {
      const pq = new AmortizedPriorityQueue<number>()
      expect(pq.bufferSize).toBe(0)
      pq.enqueue(1)
      expect(pq.bufferSize).toBe(1)
      pq.enqueue(2)
      expect(pq.bufferSize).toBe(2)
    })

    it('should report correct heap size', () => {
      const pq = new AmortizedPriorityQueue<number>({ bufferSize: 2 })
      expect(pq.heapSize).toBe(0)
      pq.enqueue(1)
      expect(pq.heapSize).toBe(0)
      pq.enqueue(2) // triggers flush
      expect(pq.heapSize).toBe(2)
    })

    it('size should equal bufferSize + heapSize', () => {
      const pq = new AmortizedPriorityQueue<number>({ bufferSize: 4 })
      pq.enqueue(1)
      pq.enqueue(2)
      pq.enqueue(3)
      pq.enqueue(4) // flush
      pq.enqueue(5) // buffer
      expect(pq.size).toBe(pq.bufferSize + pq.heapSize)
    })
  })

  describe('merge', () => {
    it('should merge two queues', () => {
      const pq1 = new AmortizedPriorityQueue<number>()
      const pq2 = new AmortizedPriorityQueue<number>()
      pq1.enqueue(1)
      pq1.enqueue(3)
      pq2.enqueue(2)
      pq2.enqueue(4)

      pq1.merge(pq2)
      expect(pq1.size).toBe(4)
      expect(pq2.isEmpty).toBe(true)

      expect(pq1.dequeue()).toBe(1)
      expect(pq1.dequeue()).toBe(2)
      expect(pq1.dequeue()).toBe(3)
      expect(pq1.dequeue()).toBe(4)
    })

    it('should clear the source queue after merge', () => {
      const pq1 = new AmortizedPriorityQueue<number>()
      const pq2 = new AmortizedPriorityQueue<number>()
      pq2.enqueue(10)
      pq2.enqueue(20)
      pq1.merge(pq2)
      expect(pq2.size).toBe(0)
      expect(pq2.isEmpty).toBe(true)
    })

    it('should merge into empty queue', () => {
      const pq1 = new AmortizedPriorityQueue<number>()
      const pq2 = new AmortizedPriorityQueue<number>()
      pq2.enqueue(1)
      pq2.enqueue(2)
      pq1.merge(pq2)
      expect(pq1.size).toBe(2)
      expect(pq1.dequeue()).toBe(1)
      expect(pq1.dequeue()).toBe(2)
    })

    it('should merge empty queue into non-empty', () => {
      const pq1 = new AmortizedPriorityQueue<number>()
      const pq2 = new AmortizedPriorityQueue<number>()
      pq1.enqueue(1)
      pq1.merge(pq2)
      expect(pq1.size).toBe(1)
      expect(pq1.dequeue()).toBe(1)
    })

    it('should merge queues with items in both heap and buffer', () => {
      const pq1 = new AmortizedPriorityQueue<number>({ bufferSize: 2 })
      const pq2 = new AmortizedPriorityQueue<number>({ bufferSize: 2 })
      pq1.enqueue(10)
      pq1.enqueue(20) // flush -> heap
      pq1.enqueue(5) // buffer

      pq2.enqueue(30)
      pq2.enqueue(40) // flush -> heap
      pq2.enqueue(15) // buffer

      pq1.merge(pq2)
      const result = pq1.toArray()
      expect(result).toEqual([5, 10, 15, 20, 30, 40])
    })
  })

  describe('edge cases', () => {
    it('should handle single element lifecycle', () => {
      const pq = new AmortizedPriorityQueue<number>()
      pq.enqueue(42)
      expect(pq.size).toBe(1)
      expect(pq.isEmpty).toBe(false)
      expect(pq.peek()).toBe(42)
      expect(pq.dequeue()).toBe(42)
      expect(pq.isEmpty).toBe(true)
      expect(pq.size).toBe(0)
    })

    it('should handle many elements with small buffer', () => {
      const pq = new AmortizedPriorityQueue<number>({ bufferSize: 2 })
      const count = 100
      for (let i = count; i >= 1; i--) pq.enqueue(i)

      for (let i = 1; i <= count; i++) {
        expect(pq.dequeue()).toBe(i)
      }
      expect(pq.isEmpty).toBe(true)
    })

    it('should handle many elements with default buffer', () => {
      const pq = new AmortizedPriorityQueue<number>()
      const count = 200
      for (let i = 0; i < count; i++) pq.enqueue(count - i)

      for (let i = 1; i <= count; i++) {
        expect(pq.dequeue()).toBe(i)
      }
      expect(pq.isEmpty).toBe(true)
    })

    it('should handle interleaved enqueue and dequeue', () => {
      const pq = new AmortizedPriorityQueue<number>()
      pq.enqueue(5)
      pq.enqueue(3)
      expect(pq.dequeue()).toBe(3)

      pq.enqueue(1)
      pq.enqueue(4)
      expect(pq.dequeue()).toBe(1)

      pq.enqueue(2)
      expect(pq.dequeue()).toBe(2)
      expect(pq.dequeue()).toBe(4)
      expect(pq.dequeue()).toBe(5)
      expect(pq.isEmpty).toBe(true)
    })

    it('should handle dequeue triggering flush when heap is empty', () => {
      const pq = new AmortizedPriorityQueue<number>()
      // Add items to buffer only (no flush)
      pq.enqueue(3)
      pq.enqueue(1)
      pq.enqueue(2)
      expect(pq.heapSize).toBe(0)

      // Dequeue should flush buffer to heap first, then dequeue
      expect(pq.dequeue()).toBe(1)
    })

    it('should handle bufferSize of 1', () => {
      const pq = new AmortizedPriorityQueue<number>({ bufferSize: 1 })
      pq.enqueue(5) // immediate flush
      pq.enqueue(3) // immediate flush
      pq.enqueue(1) // immediate flush
      expect(pq.dequeue()).toBe(1)
      expect(pq.dequeue()).toBe(3)
      expect(pq.dequeue()).toBe(5)
    })

    it('should handle zero and negative values', () => {
      const pq = new AmortizedPriorityQueue<number>()
      pq.enqueue(0)
      pq.enqueue(-1)
      pq.enqueue(1)
      expect(pq.dequeue()).toBe(-1)
      expect(pq.dequeue()).toBe(0)
      expect(pq.dequeue()).toBe(1)
    })

    it('should handle floating point numbers', () => {
      const pq = new AmortizedPriorityQueue<number>()
      pq.enqueue(1.5)
      pq.enqueue(0.3)
      pq.enqueue(2.7)
      pq.enqueue(0.3)
      expect(pq.dequeue()).toBe(0.3)
      expect(pq.dequeue()).toBe(0.3)
      expect(pq.dequeue()).toBe(1.5)
      expect(pq.dequeue()).toBe(2.7)
    })

    it('should work with boolean values via default comparator', () => {
      const pq = new AmortizedPriorityQueue<boolean>()
      pq.enqueue(true)
      pq.enqueue(false)
      // false < true in JS
      expect(pq.dequeue()).toBe(false)
      expect(pq.dequeue()).toBe(true)
    })

    it('should handle drain on queue with data only in buffer', () => {
      const pq = new AmortizedPriorityQueue<number>()
      pq.enqueue(3)
      pq.enqueue(1)
      pq.enqueue(2)
      const result = pq.drain()
      expect(result).toEqual([1, 2, 3])
      expect(pq.isEmpty).toBe(true)
    })
  })
})
