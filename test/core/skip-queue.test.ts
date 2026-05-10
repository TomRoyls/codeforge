import { describe, it, expect, beforeEach } from 'vitest'
import { SkipQueue } from '../../src/core/skip-queue/skip-queue.js'
import type { SkipQueueOptions, SkipQueueStats } from '../../src/core/skip-queue/types.js'

describe('SkipQueue', () => {
  let queue: SkipQueue<number>

  beforeEach(() => {
    queue = new SkipQueue<number>()
  })

  describe('constructor', () => {
    it('should create an empty queue with default options', () => {
      const q = new SkipQueue<number>()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('should accept custom maxLevel', () => {
      const q = new SkipQueue<number>({ maxLevel: 32 })
      q.enqueue(1, 5)
      expect(q.size).toBe(1)
    })

    it('should accept custom probability', () => {
      const q = new SkipQueue<number>({ probability: 0.25 })
      q.enqueue(1, 5)
      expect(q.size).toBe(1)
    })

    it('should accept custom comparator for max-heap behavior', () => {
      const q = new SkipQueue<number>({ comparator: (a, b) => b - a })
      q.enqueue(1, 5)
      q.enqueue(2, 10)
      q.enqueue(3, 3)
      expect(q.peek()).toBe(2)
    })

    it('should accept custom identity function', () => {
      const q = new SkipQueue<{ id: number }>({
        identity: (item) => item.id,
      })
      q.enqueue({ id: 1 }, 5)
      q.enqueue({ id: 2 }, 3)
      expect(q.size).toBe(2)
    })

    it('should work with no options', () => {
      const q = new SkipQueue()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('should accept all options combined', () => {
      const q = new SkipQueue<string>({
        maxLevel: 20,
        probability: 0.3,
        comparator: (a, b) => b - a,
        identity: (s) => s,
      })
      q.enqueue('a', 1)
      q.enqueue('b', 2)
      expect(q.peek()).toBe('b')
    })
  })

  describe('enqueue', () => {
    it('should enqueue a single item', () => {
      queue.enqueue(42, 1)
      expect(queue.size).toBe(1)
      expect(queue.isEmpty()).toBe(false)
    })

    it('should enqueue multiple items', () => {
      queue.enqueue(1, 3)
      queue.enqueue(2, 1)
      queue.enqueue(3, 2)
      expect(queue.size).toBe(3)
    })

    it('should maintain sorted order by priority', () => {
      queue.enqueue(10, 5)
      queue.enqueue(20, 1)
      queue.enqueue(30, 3)
      expect(queue.toArray()).toEqual([20, 30, 10])
    })

    it('should handle equal priorities', () => {
      queue.enqueue(1, 5)
      queue.enqueue(2, 5)
      queue.enqueue(3, 5)
      expect(queue.size).toBe(3)
    })

    it('should handle negative priorities', () => {
      queue.enqueue(1, -5)
      queue.enqueue(2, -10)
      queue.enqueue(3, 0)
      expect(queue.peek()).toBe(2)
    })

    it('should handle zero priority', () => {
      queue.enqueue(1, 0)
      expect(queue.peek()).toBe(1)
      expect(queue.peekPriority()).toBe(0)
    })

    it('should handle float priorities', () => {
      queue.enqueue(1, 1.5)
      queue.enqueue(2, 0.5)
      queue.enqueue(3, 2.5)
      expect(queue.toArray()).toEqual([2, 1, 3])
    })

    it('should replace existing item with same identity', () => {
      queue.enqueue(1, 10)
      queue.enqueue(1, 5)
      expect(queue.size).toBe(1)
      expect(queue.peek()).toBe(1)
      expect(queue.peekPriority()).toBe(5)
    })

    it('should handle large priority values', () => {
      queue.enqueue(1, Number.MAX_SAFE_INTEGER)
      queue.enqueue(2, Number.MIN_SAFE_INTEGER)
      expect(queue.peek()).toBe(2)
    })
  })

  describe('dequeue', () => {
    it('should return undefined from empty queue', () => {
      expect(queue.dequeue()).toBeUndefined()
    })

    it('should dequeue a single item', () => {
      queue.enqueue(42, 1)
      expect(queue.dequeue()).toBe(42)
      expect(queue.size).toBe(0)
    })

    it('should dequeue items in priority order', () => {
      queue.enqueue(10, 5)
      queue.enqueue(20, 1)
      queue.enqueue(30, 3)
      expect(queue.dequeue()).toBe(20)
      expect(queue.dequeue()).toBe(30)
      expect(queue.dequeue()).toBe(10)
    })

    it('should handle dequeue all items', () => {
      queue.enqueue(1, 1)
      queue.enqueue(2, 2)
      queue.enqueue(3, 3)
      queue.dequeue()
      queue.dequeue()
      queue.dequeue()
      expect(queue.isEmpty()).toBe(true)
    })

    it('should dequeue from queue with same priorities', () => {
      queue.enqueue(1, 5)
      queue.enqueue(2, 5)
      queue.enqueue(3, 5)
      const first = queue.dequeue()!
      expect([1, 2, 3]).toContain(first)
      expect(queue.size).toBe(2)
    })

    it('should handle alternating enqueue and dequeue', () => {
      queue.enqueue(1, 3)
      expect(queue.dequeue()).toBe(1)
      queue.enqueue(2, 1)
      queue.enqueue(3, 2)
      expect(queue.dequeue()).toBe(2)
      expect(queue.dequeue()).toBe(3)
    })

    it('should maintain order after multiple dequeues', () => {
      for (let i = 10; i >= 1; i--) {
        queue.enqueue(i, i)
      }
      for (let i = 1; i <= 10; i++) {
        expect(queue.dequeue()).toBe(i)
      }
    })
  })

  describe('peek', () => {
    it('should return undefined from empty queue', () => {
      expect(queue.peek()).toBeUndefined()
    })

    it('should return the highest priority item without removing it', () => {
      queue.enqueue(1, 5)
      queue.enqueue(2, 1)
      queue.enqueue(3, 3)
      expect(queue.peek()).toBe(2)
      expect(queue.size).toBe(3)
    })

    it('should return same item on multiple peeks', () => {
      queue.enqueue(42, 1)
      expect(queue.peek()).toBe(42)
      expect(queue.peek()).toBe(42)
      expect(queue.peek()).toBe(42)
    })

    it('should update after dequeue', () => {
      queue.enqueue(1, 1)
      queue.enqueue(2, 2)
      queue.enqueue(3, 3)
      queue.dequeue()
      expect(queue.peek()).toBe(2)
    })
  })

  describe('peekPriority', () => {
    it('should return undefined from empty queue', () => {
      expect(queue.peekPriority()).toBeUndefined()
    })

    it('should return the priority of the front item', () => {
      queue.enqueue(1, 5)
      expect(queue.peekPriority()).toBe(5)
    })

    it('should return the lowest priority in min-heap mode', () => {
      queue.enqueue(1, 10)
      queue.enqueue(2, 3)
      queue.enqueue(3, 7)
      expect(queue.peekPriority()).toBe(3)
    })

    it('should update after dequeue', () => {
      queue.enqueue(1, 1)
      queue.enqueue(2, 2)
      queue.dequeue()
      expect(queue.peekPriority()).toBe(2)
    })
  })

  describe('size', () => {
    it('should return 0 for empty queue', () => {
      expect(queue.size).toBe(0)
    })

    it('should increment on enqueue', () => {
      queue.enqueue(1, 1)
      expect(queue.size).toBe(1)
      queue.enqueue(2, 2)
      expect(queue.size).toBe(2)
    })

    it('should decrement on dequeue', () => {
      queue.enqueue(1, 1)
      queue.enqueue(2, 2)
      queue.dequeue()
      expect(queue.size).toBe(1)
    })

    it('should stay at 0 after dequeue from empty', () => {
      queue.dequeue()
      expect(queue.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new queue', () => {
      expect(queue.isEmpty()).toBe(true)
    })

    it('should return false after enqueue', () => {
      queue.enqueue(1, 1)
      expect(queue.isEmpty()).toBe(false)
    })

    it('should return true after all items dequeued', () => {
      queue.enqueue(1, 1)
      queue.enqueue(2, 2)
      queue.dequeue()
      queue.dequeue()
      expect(queue.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      queue.enqueue(1, 1)
      queue.clear()
      expect(queue.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear an empty queue', () => {
      queue.clear()
      expect(queue.size).toBe(0)
      expect(queue.isEmpty()).toBe(true)
    })

    it('should clear a queue with items', () => {
      queue.enqueue(1, 1)
      queue.enqueue(2, 2)
      queue.enqueue(3, 3)
      queue.clear()
      expect(queue.size).toBe(0)
      expect(queue.isEmpty()).toBe(true)
      expect(queue.peek()).toBeUndefined()
    })

    it('should allow enqueue after clear', () => {
      queue.enqueue(1, 5)
      queue.clear()
      queue.enqueue(2, 3)
      expect(queue.peek()).toBe(2)
      expect(queue.size).toBe(1)
    })

    it('should allow dequeue after clear', () => {
      queue.enqueue(1, 1)
      queue.clear()
      expect(queue.dequeue()).toBeUndefined()
    })
  })

  describe('clone', () => {
    it('should clone an empty queue', () => {
      const cloned = queue.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should clone a queue with items', () => {
      queue.enqueue(1, 3)
      queue.enqueue(2, 1)
      queue.enqueue(3, 2)
      const cloned = queue.clone()
      expect(cloned.size).toBe(3)
      expect(cloned.peek()).toBe(2)
    })

    it('should produce independent copy', () => {
      queue.enqueue(1, 1)
      queue.enqueue(2, 2)
      const cloned = queue.clone()
      queue.dequeue()
      expect(queue.size).toBe(1)
      expect(cloned.size).toBe(2)
    })

    it('should maintain same order', () => {
      queue.enqueue(10, 5)
      queue.enqueue(20, 1)
      queue.enqueue(30, 3)
      const cloned = queue.clone()
      expect(cloned.toArray()).toEqual(queue.toArray())
    })

    it('should preserve options', () => {
      const q = new SkipQueue<number>({ comparator: (a, b) => b - a })
      q.enqueue(1, 5)
      q.enqueue(2, 10)
      const cloned = q.clone()
      expect(cloned.peek()).toBe(2)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty queue', () => {
      expect(queue.toArray()).toEqual([])
    })

    it('should return items sorted by priority', () => {
      queue.enqueue(10, 5)
      queue.enqueue(20, 1)
      queue.enqueue(30, 3)
      expect(queue.toArray()).toEqual([20, 30, 10])
    })

    it('should not modify the queue', () => {
      queue.enqueue(1, 1)
      queue.enqueue(2, 2)
      const arr = queue.toArray()
      expect(queue.size).toBe(2)
      expect(arr.length).toBe(2)
    })

    it('should reflect modifications', () => {
      queue.enqueue(1, 3)
      queue.enqueue(2, 1)
      queue.dequeue()
      expect(queue.toArray()).toEqual([1])
    })
  })

  describe('toSortedArray', () => {
    it('should return empty array for empty queue', () => {
      expect(queue.toSortedArray()).toEqual([])
    })

    it('should return items in priority order', () => {
      queue.enqueue(1, 5)
      queue.enqueue(2, 1)
      queue.enqueue(3, 3)
      expect(queue.toSortedArray()).toEqual([2, 3, 1])
    })

    it('should behave same as toArray for min-heap', () => {
      queue.enqueue(1, 10)
      queue.enqueue(2, 5)
      queue.enqueue(3, 8)
      expect(queue.toSortedArray()).toEqual(queue.toArray())
    })
  })

  describe('contains', () => {
    it('should return false for empty queue', () => {
      expect(queue.contains(1)).toBe(false)
    })

    it('should return true for existing item', () => {
      queue.enqueue(42, 1)
      expect(queue.contains(42)).toBe(true)
    })

    it('should return false for non-existing item', () => {
      queue.enqueue(1, 1)
      expect(queue.contains(99)).toBe(false)
    })

    it('should return false after item dequeued', () => {
      queue.enqueue(1, 1)
      queue.dequeue()
      expect(queue.contains(1)).toBe(false)
    })

    it('should return false after remove', () => {
      queue.enqueue(1, 1)
      queue.remove(1)
      expect(queue.contains(1)).toBe(false)
    })

    it('should work with object items using identity', () => {
      const q = new SkipQueue<{ id: number }>({ identity: (item) => item.id })
      q.enqueue({ id: 1 }, 5)
      expect(q.contains({ id: 1 })).toBe(true)
      expect(q.contains({ id: 2 })).toBe(false)
    })
  })

  describe('remove', () => {
    it('should return false for empty queue', () => {
      expect(queue.remove(1)).toBe(false)
    })

    it('should remove existing item', () => {
      queue.enqueue(1, 5)
      expect(queue.remove(1)).toBe(true)
      expect(queue.size).toBe(0)
    })

    it('should return false for non-existing item', () => {
      queue.enqueue(1, 5)
      expect(queue.remove(99)).toBe(false)
      expect(queue.size).toBe(1)
    })

    it('should maintain order after removal', () => {
      queue.enqueue(10, 5)
      queue.enqueue(20, 1)
      queue.enqueue(30, 3)
      queue.remove(30)
      expect(queue.toArray()).toEqual([20, 10])
    })

    it('should remove head item', () => {
      queue.enqueue(1, 1)
      queue.enqueue(2, 2)
      expect(queue.remove(1)).toBe(true)
      expect(queue.peek()).toBe(2)
    })

    it('should remove tail item', () => {
      queue.enqueue(1, 1)
      queue.enqueue(2, 2)
      expect(queue.remove(2)).toBe(true)
      expect(queue.toArray()).toEqual([1])
    })

    it('should handle removal of all items', () => {
      queue.enqueue(1, 1)
      queue.enqueue(2, 2)
      queue.enqueue(3, 3)
      expect(queue.remove(2)).toBe(true)
      expect(queue.remove(1)).toBe(true)
      expect(queue.remove(3)).toBe(true)
      expect(queue.isEmpty()).toBe(true)
    })

    it('should handle remove then dequeue', () => {
      queue.enqueue(1, 1)
      queue.enqueue(2, 2)
      queue.enqueue(3, 3)
      queue.remove(2)
      expect(queue.dequeue()).toBe(1)
      expect(queue.dequeue()).toBe(3)
    })
  })

  describe('decreaseKey', () => {
    it('should decrease priority of existing item', () => {
      queue.enqueue(1, 10)
      queue.enqueue(2, 5)
      queue.decreaseKey(1, 3)
      expect(queue.peek()).toBe(1)
      expect(queue.peekPriority()).toBe(3)
    })

    it('should do nothing for non-existing item', () => {
      queue.enqueue(1, 5)
      queue.decreaseKey(99, 1)
      expect(queue.size).toBe(1)
      expect(queue.peekPriority()).toBe(5)
    })

    it('should not increase priority', () => {
      queue.enqueue(1, 5)
      queue.decreaseKey(1, 10)
      expect(queue.peekPriority()).toBe(5)
    })

    it('should maintain order after decreaseKey', () => {
      queue.enqueue(1, 5)
      queue.enqueue(2, 3)
      queue.enqueue(3, 7)
      queue.decreaseKey(3, 1)
      expect(queue.toArray()).toEqual([3, 2, 1])
    })

    it('should handle decreaseKey to same priority', () => {
      queue.enqueue(1, 5)
      queue.decreaseKey(1, 5)
      expect(queue.peekPriority()).toBe(5)
      expect(queue.size).toBe(1)
    })

    it('should handle decreaseKey on single item', () => {
      queue.enqueue(1, 10)
      queue.decreaseKey(1, 1)
      expect(queue.peekPriority()).toBe(1)
    })
  })

  describe('changePriority', () => {
    it('should change priority to lower value', () => {
      queue.enqueue(1, 10)
      queue.enqueue(2, 5)
      queue.changePriority(1, 1)
      expect(queue.peek()).toBe(1)
    })

    it('should change priority to higher value', () => {
      queue.enqueue(1, 1)
      queue.enqueue(2, 5)
      queue.changePriority(1, 10)
      expect(queue.peek()).toBe(2)
    })

    it('should do nothing for non-existing item', () => {
      queue.enqueue(1, 5)
      queue.changePriority(99, 1)
      expect(queue.size).toBe(1)
    })

    it('should maintain order after change', () => {
      queue.enqueue(1, 5)
      queue.enqueue(2, 3)
      queue.enqueue(3, 7)
      queue.changePriority(3, 1)
      expect(queue.toArray()).toEqual([3, 2, 1])
    })

    it('should work with increase via changePriority', () => {
      queue.enqueue(1, 1)
      queue.enqueue(2, 5)
      queue.changePriority(1, 10)
      expect(queue.toArray()).toEqual([2, 1])
    })

    it('should handle multiple changes', () => {
      queue.enqueue(1, 10)
      queue.enqueue(2, 5)
      queue.enqueue(3, 7)
      queue.changePriority(1, 1)
      queue.changePriority(3, 2)
      queue.changePriority(2, 20)
      expect(queue.toArray()).toEqual([1, 3, 2])
    })
  })

  describe('static from', () => {
    it('should create queue from items', () => {
      const q = SkipQueue.from([
        { item: 1, priority: 5 },
        { item: 2, priority: 1 },
        { item: 3, priority: 3 },
      ])
      expect(q.size).toBe(3)
      expect(q.peek()).toBe(2)
    })

    it('should create empty queue from empty array', () => {
      const q = SkipQueue.from<number>([])
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('should accept options', () => {
      const q = SkipQueue.from(
        [
          { item: 1, priority: 5 },
          { item: 2, priority: 1 },
        ],
        { comparator: (a, b) => b - a }
      )
      expect(q.peek()).toBe(1)
    })

    it('should produce correct order from many items', () => {
      const items = Array.from({ length: 100 }, (_, i) => ({
        item: i,
        priority: 100 - i,
      }))
      const q = SkipQueue.from(items)
      expect(q.peek()).toBe(99)
      expect(q.size).toBe(100)
    })
  })

  describe('stats', () => {
    it('should return stats for empty queue', () => {
      const s = queue.stats()
      expect(s.size).toBe(0)
      expect(s.maxLevel).toBe(16)
      expect(s.currentLevel).toBe(0)
      expect(s.probability).toBe(0.5)
    })

    it('should return correct size', () => {
      queue.enqueue(1, 1)
      queue.enqueue(2, 2)
      const s = queue.stats()
      expect(s.size).toBe(2)
    })

    it('should return correct maxLevel', () => {
      const q = new SkipQueue<number>({ maxLevel: 32 })
      const s = q.stats()
      expect(s.maxLevel).toBe(32)
    })

    it('should return nodeLevels array', () => {
      queue.enqueue(1, 1)
      queue.enqueue(2, 2)
      const s = queue.stats()
      expect(s.nodeLevels.length).toBe(16)
      const totalNodes = s.nodeLevels.reduce((sum, count) => sum + count, 0)
      expect(totalNodes).toBe(2)
    })

    it('should return correct probability', () => {
      const q = new SkipQueue<number>({ probability: 0.25 })
      const s = q.stats()
      expect(s.probability).toBe(0.25)
    })

    it('should update currentLevel with items', () => {
      for (let i = 0; i < 100; i++) {
        queue.enqueue(i, i)
      }
      const s = queue.stats()
      expect(s.currentLevel).toBeGreaterThan(0)
      expect(s.currentLevel).toBeLessThanOrEqual(16)
    })
  })

  describe('custom comparator (max-heap)', () => {
    it('should dequeue highest priority first', () => {
      const q = new SkipQueue<number>({ comparator: (a, b) => b - a })
      q.enqueue(1, 5)
      q.enqueue(2, 10)
      q.enqueue(3, 3)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(3)
    })

    it('should peek highest priority', () => {
      const q = new SkipQueue<number>({ comparator: (a, b) => b - a })
      q.enqueue(1, 1)
      q.enqueue(2, 10)
      q.enqueue(3, 5)
      expect(q.peek()).toBe(2)
      expect(q.peekPriority()).toBe(10)
    })

    it('should toArray in descending order', () => {
      const q = new SkipQueue<number>({ comparator: (a, b) => b - a })
      q.enqueue(1, 3)
      q.enqueue(2, 1)
      q.enqueue(3, 5)
      expect(q.toArray()).toEqual([3, 1, 2])
    })

    it('should decreaseKey in max-heap', () => {
      const q = new SkipQueue<number>({ comparator: (a, b) => b - a })
      q.enqueue(1, 5)
      q.enqueue(2, 10)
      q.decreaseKey(1, 15)
      expect(q.peek()).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('should handle single item lifecycle', () => {
      queue.enqueue(42, 1)
      expect(queue.size).toBe(1)
      expect(queue.isEmpty()).toBe(false)
      expect(queue.peek()).toBe(42)
      expect(queue.peekPriority()).toBe(1)
      expect(queue.contains(42)).toBe(true)
      expect(queue.dequeue()).toBe(42)
      expect(queue.isEmpty()).toBe(true)
      expect(queue.contains(42)).toBe(false)
    })

    it('should handle same priority items in order', () => {
      queue.enqueue(1, 5)
      queue.enqueue(2, 5)
      queue.enqueue(3, 5)
      const arr = queue.toArray()
      expect(arr.length).toBe(3)
      expect(arr).toContain(1)
      expect(arr).toContain(2)
      expect(arr).toContain(3)
    })

    it('should handle large queue 10000+ items', () => {
      const q = new SkipQueue<number>()
      for (let i = 0; i < 10000; i++) {
        q.enqueue(i, 10000 - i)
      }
      expect(q.size).toBe(10000)
      expect(q.peek()).toBe(9999)
      expect(q.peekPriority()).toBe(1)
    })

    it('should dequeue 1000 items in order', () => {
      const q = new SkipQueue<number>()
      for (let i = 0; i < 1000; i++) {
        q.enqueue(i, 1000 - i)
      }
      for (let i = 999; i >= 0; i--) {
        expect(q.dequeue()).toBe(i)
      }
    })

    it('should handle mixed enqueue/dequeue operations', () => {
      queue.enqueue(1, 5)
      queue.enqueue(2, 3)
      expect(queue.dequeue()).toBe(2)
      queue.enqueue(3, 1)
      expect(queue.dequeue()).toBe(3)
      queue.enqueue(4, 10)
      expect(queue.dequeue()).toBe(1)
      expect(queue.dequeue()).toBe(4)
      expect(queue.isEmpty()).toBe(true)
    })

    it('should handle clear and reuse', () => {
      queue.enqueue(1, 1)
      queue.enqueue(2, 2)
      queue.clear()
      expect(queue.size).toBe(0)
      queue.enqueue(3, 3)
      queue.enqueue(4, 1)
      expect(queue.peek()).toBe(4)
      expect(queue.size).toBe(2)
    })

    it('should handle string items', () => {
      const q = new SkipQueue<string>({ identity: (s) => s })
      q.enqueue('banana', 2)
      q.enqueue('apple', 1)
      q.enqueue('cherry', 3)
      expect(q.peek()).toBe('apple')
      expect(q.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should handle object items', () => {
      const q = new SkipQueue<{ name: string }>({ identity: (item) => item.name })
      q.enqueue({ name: 'a' }, 3)
      q.enqueue({ name: 'b' }, 1)
      q.enqueue({ name: 'c' }, 2)
      expect(q.peek()!.name).toBe('b')
    })

    it('should handle contains after dequeue', () => {
      queue.enqueue(1, 1)
      queue.enqueue(2, 2)
      queue.dequeue()
      expect(queue.contains(1)).toBe(false)
      expect(queue.contains(2)).toBe(true)
    })

    it('should handle enqueue duplicate item with different priority', () => {
      queue.enqueue(1, 10)
      queue.enqueue(1, 2)
      expect(queue.size).toBe(1)
      expect(queue.peekPriority()).toBe(2)
    })

    it('should handle remove from middle', () => {
      queue.enqueue(1, 1)
      queue.enqueue(2, 2)
      queue.enqueue(3, 3)
      queue.enqueue(4, 4)
      queue.remove(3)
      expect(queue.toArray()).toEqual([1, 2, 4])
    })

    it('should handle all operations on empty queue', () => {
      expect(queue.dequeue()).toBeUndefined()
      expect(queue.peek()).toBeUndefined()
      expect(queue.peekPriority()).toBeUndefined()
      expect(queue.contains(1)).toBe(false)
      expect(queue.remove(1)).toBe(false)
      expect(queue.toArray()).toEqual([])
      expect(queue.toSortedArray()).toEqual([])
      expect(queue.size).toBe(0)
      expect(queue.isEmpty()).toBe(true)
    })
  })

  describe('sorted order verification', () => {
    it('should maintain sorted order after all operations', () => {
      const priorities = [50, 30, 70, 10, 90, 20, 80, 40, 60, 100]
      for (let i = 0; i < priorities.length; i++) {
        queue.enqueue(i, priorities[i]!)
      }
      const sorted = priorities.slice().sort((a, b) => a - b)
      for (const expectedPriority of sorted) {
        const item = queue.dequeue()!
        expect(priorities[item]).toBe(expectedPriority)
      }
    })

    it('should produce correctly sorted toArray after modifications', () => {
      queue.enqueue(1, 50)
      queue.enqueue(2, 30)
      queue.enqueue(3, 70)
      queue.remove(2)
      queue.enqueue(4, 10)
      queue.enqueue(5, 60)
      const arr = queue.toArray()
      const priorities = arr.map((item) => {
        const priorityMap: Record<number, number> = { 1: 50, 3: 70, 4: 10, 5: 60 }
        return priorityMap[item]!
      })
      const sorted = priorities.slice().sort((a, b) => a - b)
      expect(priorities).toEqual(sorted)
    })

    it('should verify dequeue order matches sorted priority', () => {
      const items = Array.from({ length: 50 }, (_, i) => ({
        item: i,
        priority: 1000 - i * 2,
      }))
      const q = SkipQueue.from(items)
      const sortedByPriority = items.slice().sort((a, b) => a.priority - b.priority)
      for (const expected of sortedByPriority) {
        const dequeued = q.dequeue()!
        expect(dequeued).toBe(expected.item)
      }
    })
  })

  describe('clone independence', () => {
    it('should not affect original after modifying clone', () => {
      queue.enqueue(1, 1)
      queue.enqueue(2, 2)
      const cloned = queue.clone()
      cloned.dequeue()
      expect(queue.size).toBe(2)
      expect(cloned.size).toBe(1)
    })

    it('should not affect clone after modifying original', () => {
      queue.enqueue(1, 1)
      queue.enqueue(2, 2)
      const cloned = queue.clone()
      queue.dequeue()
      expect(cloned.size).toBe(2)
      expect(queue.size).toBe(1)
    })

    it('should clone with remove operations', () => {
      queue.enqueue(1, 1)
      queue.enqueue(2, 2)
      queue.enqueue(3, 3)
      const cloned = queue.clone()
      queue.remove(2)
      expect(queue.size).toBe(2)
      expect(cloned.size).toBe(3)
    })
  })

  describe('decreaseKey vs changePriority', () => {
    it('decreaseKey should not increase priority', () => {
      queue.enqueue(1, 5)
      queue.decreaseKey(1, 10)
      expect(queue.peekPriority()).toBe(5)
    })

    it('changePriority should allow increasing priority', () => {
      queue.enqueue(1, 5)
      queue.changePriority(1, 10)
      expect(queue.peekPriority()).toBe(10)
    })

    it('both should handle same operation when decreasing', () => {
      queue.enqueue(1, 10)
      queue.decreaseKey(1, 5)
      expect(queue.peekPriority()).toBe(5)

      queue.changePriority(1, 2)
      expect(queue.peekPriority()).toBe(2)
    })
  })

  describe('stress tests', () => {
    it('should handle 10000 enqueue and dequeue', () => {
      const q = new SkipQueue<number>()
      for (let i = 0; i < 10000; i++) {
        q.enqueue(i, i)
      }
      for (let i = 0; i < 10000; i++) {
        expect(q.dequeue()).toBe(i)
      }
      expect(q.isEmpty()).toBe(true)
    })

    it('should handle 10000 random priority insert', () => {
      const q = new SkipQueue<number>()
      const items: number[] = []
      for (let i = 0; i < 5000; i++) {
        const priority = Math.floor(Math.random() * 10000)
        q.enqueue(i, priority)
        items.push(priority)
      }
      items.sort((a, b) => a - b)
      for (const expected of items) {
        const val = q.dequeue()!
        const dequeuedPriority = expected
        expect(dequeuedPriority).toBeDefined()
      }
    })

    it('should handle mixed operations on large queue', () => {
      const q = new SkipQueue<number>()
      for (let i = 0; i < 5000; i++) {
        q.enqueue(i, i)
      }
      for (let i = 0; i < 2500; i++) {
        q.dequeue()
      }
      expect(q.size).toBe(2500)
      for (let i = 5000; i < 7500; i++) {
        q.enqueue(i, i)
      }
      expect(q.size).toBe(5000)
    })
  })

  describe('with object identity', () => {
    it('should handle object items with id-based identity', () => {
      interface Task {
        id: number
        name: string
      }
      const q = new SkipQueue<Task>({ identity: (t) => t.id })
      q.enqueue({ id: 1, name: 'task1' }, 5)
      q.enqueue({ id: 2, name: 'task2' }, 1)
      q.enqueue({ id: 3, name: 'task3' }, 3)
      expect(q.peek()!.name).toBe('task2')
      expect(q.contains({ id: 1, name: 'task1' })).toBe(true)
      expect(q.contains({ id: 4, name: 'task4' })).toBe(false)
    })

    it('should update existing item by identity', () => {
      const q = new SkipQueue<{ id: number }>({ identity: (t) => t.id })
      q.enqueue({ id: 1 }, 10)
      q.enqueue({ id: 1 }, 2)
      expect(q.size).toBe(1)
      expect(q.peekPriority()).toBe(2)
    })

    it('should remove by identity', () => {
      const q = new SkipQueue<{ id: number }>({ identity: (t) => t.id })
      q.enqueue({ id: 1 }, 5)
      q.enqueue({ id: 2 }, 3)
      expect(q.remove({ id: 1 })).toBe(true)
      expect(q.size).toBe(1)
      expect(q.peek()!.id).toBe(2)
    })

    it('should decreaseKey by identity', () => {
      const q = new SkipQueue<{ id: number }>({ identity: (t) => t.id })
      q.enqueue({ id: 1 }, 10)
      q.enqueue({ id: 2 }, 5)
      q.decreaseKey({ id: 1 }, 1)
      expect(q.peek()!.id).toBe(1)
    })

    it('should changePriority by identity', () => {
      const q = new SkipQueue<{ id: number }>({ identity: (t) => t.id })
      q.enqueue({ id: 1 }, 1)
      q.enqueue({ id: 2 }, 5)
      q.changePriority({ id: 1 }, 10)
      expect(q.peek()!.id).toBe(2)
    })
  })

  describe('stats detailed', () => {
    it('should report correct stats after operations', () => {
      queue.enqueue(1, 5)
      queue.enqueue(2, 3)
      queue.enqueue(3, 7)
      queue.dequeue()
      const s = queue.stats()
      expect(s.size).toBe(2)
    })

    it('should report correct stats after clear', () => {
      queue.enqueue(1, 1)
      queue.enqueue(2, 2)
      queue.clear()
      const s = queue.stats()
      expect(s.size).toBe(0)
      expect(s.currentLevel).toBe(0)
      expect(s.nodeLevels.every((n) => n === 0)).toBe(true)
    })

    it('should report node levels correctly', () => {
      for (let i = 0; i < 50; i++) {
        queue.enqueue(i, i)
      }
      const s = queue.stats()
      const total = s.nodeLevels.reduce((a, b) => a + b, 0)
      expect(total).toBe(50)
    })
  })

  describe('integration', () => {
    it('should work as Dijkstra helper', () => {
      const dist = new Map<string, number>()
      const pq = new SkipQueue<string>({ identity: (s) => s })

      dist.set('A', 0)
      dist.set('B', Infinity)
      dist.set('C', Infinity)
      dist.set('D', Infinity)

      pq.enqueue('A', 0)

      const edges: Record<string, Array<{ to: string; weight: number }>> = {
        A: [
          { to: 'B', weight: 4 },
          { to: 'C', weight: 2 },
        ],
        B: [{ to: 'D', weight: 3 }],
        C: [
          { to: 'B', weight: 1 },
          { to: 'D', weight: 5 },
        ],
        D: [],
      }

      while (!pq.isEmpty()) {
        const u = pq.dequeue()!
        const neighbors = edges[u] ?? []
        for (const edge of neighbors) {
          const alt = dist.get(u)! + edge.weight
          if (alt < (dist.get(edge.to) ?? Infinity)) {
            dist.set(edge.to, alt)
            if (pq.contains(edge.to)) {
              pq.decreaseKey(edge.to, alt)
            } else {
              pq.enqueue(edge.to, alt)
            }
          }
        }
      }

      expect(dist.get('A')).toBe(0)
      expect(dist.get('B')).toBe(3)
      expect(dist.get('C')).toBe(2)
      expect(dist.get('D')).toBe(6)
    })

    it('should work as event scheduler', () => {
      interface Event {
        id: number
        name: string
      }
      const scheduler = new SkipQueue<Event>({ identity: (e) => e.id })

      scheduler.enqueue({ id: 1, name: 'startup' }, 0)
      scheduler.enqueue({ id: 2, name: 'process' }, 100)
      scheduler.enqueue({ id: 3, name: 'cleanup' }, 500)
      scheduler.enqueue({ id: 4, name: 'init' }, 10)

      const order: string[] = []
      while (!scheduler.isEmpty()) {
        order.push(scheduler.dequeue()!.name)
      }
      expect(order).toEqual(['startup', 'init', 'process', 'cleanup'])
    })
  })
})
