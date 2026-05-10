import { describe, it, expect, beforeEach } from 'vitest'
import { SkipListQueue } from '../../src/core/skip-list-queue/skip-list-queue.js'
import { DEFAULT_SKIP_LIST_QUEUE_OPTIONS } from '../../src/core/skip-list-queue/skip-list-queue.js'
import type { SkipListQueueOptions, SkipListQueueStatistics } from '../../src/core/skip-list-queue/skip-list-queue.js'

describe('SkipListQueue', () => {
  let queue: SkipListQueue<string>

  beforeEach(() => {
    queue = new SkipListQueue<string>()
  })

  describe('constructor', () => {
    it('should create empty queue with defaults', () => {
      const q = new SkipListQueue<string>()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('should accept custom maxLevel', () => {
      const q = new SkipListQueue<string>({ maxLevel: 8 })
      expect(q.size).toBe(0)
    })

    it('should accept custom probability', () => {
      const q = new SkipListQueue<string>({ probability: 0.25 })
      expect(q.isEmpty()).toBe(true)
    })

    it('should accept custom comparator', () => {
      const q = new SkipListQueue<string>({ comparator: (a, b) => b - a })
      expect(q.isEmpty()).toBe(true)
    })

    it('should accept all options together', () => {
      const q = new SkipListQueue<string>({
        maxLevel: 10,
        probability: 0.3,
        comparator: (a, b) => b - a,
      })
      expect(q.size).toBe(0)
    })

    it('should accept empty options object', () => {
      const q = new SkipListQueue<string>({})
      expect(q.isEmpty()).toBe(true)
    })

    it('should use default options when none provided', () => {
      const q = new SkipListQueue<number>()
      q.enqueue(1, 5)
      q.enqueue(2, 3)
      q.enqueue(3, 7)
      expect(q.toArray()).toEqual([2, 1, 3])
    })
  })

  describe('DEFAULT_SKIP_LIST_QUEUE_OPTIONS', () => {
    it('should have maxLevel 16', () => {
      expect(DEFAULT_SKIP_LIST_QUEUE_OPTIONS.maxLevel).toBe(16)
    })

    it('should have probability 0.5', () => {
      expect(DEFAULT_SKIP_LIST_QUEUE_OPTIONS.probability).toBe(0.5)
    })

    it('should have a comparator that sorts ascending', () => {
      expect(DEFAULT_SKIP_LIST_QUEUE_OPTIONS.comparator(1, 2)).toBe(-1)
      expect(DEFAULT_SKIP_LIST_QUEUE_OPTIONS.comparator(2, 1)).toBe(1)
      expect(DEFAULT_SKIP_LIST_QUEUE_OPTIONS.comparator(1, 1)).toBe(0)
    })
  })

  describe('enqueue', () => {
    it('should enqueue a single item', () => {
      expect(queue.enqueue('a', 1)).toBe(true)
      expect(queue.size).toBe(1)
    })

    it('should enqueue multiple items', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      expect(queue.size).toBe(3)
    })

    it('should return false for duplicate value', () => {
      queue.enqueue('a', 1)
      expect(queue.enqueue('a', 2)).toBe(false)
      expect(queue.size).toBe(1)
    })

    it('should maintain sorted order by priority', () => {
      queue.enqueue('c', 3)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      expect(queue.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('should handle equal priorities', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 1)
      queue.enqueue('c', 1)
      expect(queue.size).toBe(3)
    })

    it('should handle negative priorities', () => {
      queue.enqueue('a', -5)
      queue.enqueue('b', 10)
      queue.enqueue('c', -1)
      expect(queue.toArray()).toEqual(['a', 'c', 'b'])
    })

    it('should handle zero priority', () => {
      queue.enqueue('a', 0)
      queue.enqueue('b', -1)
      queue.enqueue('c', 1)
      expect(queue.toArray()).toEqual(['b', 'a', 'c'])
    })

    it('should handle fractional priorities', () => {
      queue.enqueue('a', 1.5)
      queue.enqueue('b', 0.5)
      queue.enqueue('c', 2.5)
      expect(queue.toArray()).toEqual(['b', 'a', 'c'])
    })

    it('should update statistics', () => {
      queue.enqueue('a', 1)
      const stats = queue.getStatistics()
      expect(stats.enqueues).toBe(1)
      expect(stats.totalNodesCreated).toBe(1)
    })

    it('should update totalNodesCreated', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      expect(queue.getStatistics().totalNodesCreated).toBe(3)
    })

    it('should handle large number of items', () => {
      for (let i = 100; i >= 1; i--) {
        queue.enqueue(`item-${i}`, i)
      }
      expect(queue.size).toBe(100)
      expect(queue.peek()).toBe('item-1')
    })
  })

  describe('dequeue', () => {
    it('should return undefined for empty queue', () => {
      expect(queue.dequeue()).toBeUndefined()
    })

    it('should dequeue single item', () => {
      queue.enqueue('a', 1)
      expect(queue.dequeue()).toBe('a')
      expect(queue.size).toBe(0)
    })

    it('should dequeue items in priority order', () => {
      queue.enqueue('c', 3)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      expect(queue.dequeue()).toBe('a')
      expect(queue.dequeue()).toBe('b')
      expect(queue.dequeue()).toBe('c')
    })

    it('should update statistics', () => {
      queue.enqueue('a', 1)
      queue.dequeue()
      expect(queue.getStatistics().dequeues).toBe(1)
    })

    it('should handle dequeue all items', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.dequeue()
      queue.dequeue()
      expect(queue.isEmpty()).toBe(true)
    })

    it('should dequeue from queue with equal priorities', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 1)
      queue.enqueue('c', 1)
      const first = queue.dequeue()
      expect(first).toBeDefined()
      expect(queue.size).toBe(2)
    })

    it('should allow enqueue after dequeue all', () => {
      queue.enqueue('a', 1)
      queue.dequeue()
      queue.enqueue('b', 2)
      expect(queue.size).toBe(1)
      expect(queue.peek()).toBe('b')
    })

    it('should handle interleaved enqueue and dequeue', () => {
      queue.enqueue('a', 1)
      expect(queue.dequeue()).toBe('a')
      queue.enqueue('b', 2)
      expect(queue.dequeue()).toBe('b')
      queue.enqueue('c', 3)
      expect(queue.dequeue()).toBe('c')
      expect(queue.isEmpty()).toBe(true)
    })
  })

  describe('peek', () => {
    it('should return undefined for empty queue', () => {
      expect(queue.peek()).toBeUndefined()
    })

    it('should return first item without removing', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      expect(queue.peek()).toBe('a')
      expect(queue.size).toBe(2)
    })

    it('should return lowest priority item first', () => {
      queue.enqueue('c', 3)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      expect(queue.peek()).toBe('a')
    })

    it('should remain stable after multiple peeks', () => {
      queue.enqueue('a', 1)
      expect(queue.peek()).toBe('a')
      expect(queue.peek()).toBe('a')
      expect(queue.peek()).toBe('a')
      expect(queue.size).toBe(1)
    })
  })

  describe('size', () => {
    it('should return 0 for empty queue', () => {
      expect(queue.size).toBe(0)
    })

    it('should increment on enqueue', () => {
      queue.enqueue('a', 1)
      expect(queue.size).toBe(1)
      queue.enqueue('b', 2)
      expect(queue.size).toBe(2)
    })

    it('should decrement on dequeue', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.dequeue()
      expect(queue.size).toBe(1)
    })

    it('should not change on duplicate enqueue attempt', () => {
      queue.enqueue('a', 1)
      queue.enqueue('a', 2)
      expect(queue.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new queue', () => {
      expect(queue.isEmpty()).toBe(true)
    })

    it('should return false after enqueue', () => {
      queue.enqueue('a', 1)
      expect(queue.isEmpty()).toBe(false)
    })

    it('should return true after dequeue all', () => {
      queue.enqueue('a', 1)
      queue.dequeue()
      expect(queue.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.clear()
      expect(queue.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear empty queue', () => {
      queue.clear()
      expect(queue.size).toBe(0)
      expect(queue.isEmpty()).toBe(true)
    })

    it('should clear single item queue', () => {
      queue.enqueue('a', 1)
      queue.clear()
      expect(queue.size).toBe(0)
    })

    it('should clear multi-item queue', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.clear()
      expect(queue.size).toBe(0)
      expect(queue.peek()).toBeUndefined()
    })

    it('should allow operations after clear', () => {
      queue.enqueue('a', 1)
      queue.clear()
      queue.enqueue('b', 2)
      expect(queue.size).toBe(1)
      expect(queue.peek()).toBe('b')
    })

    it('should allow enqueue after clear with same value', () => {
      queue.enqueue('a', 1)
      queue.clear()
      expect(queue.enqueue('a', 5)).toBe(true)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty queue', () => {
      expect(queue.toArray()).toEqual([])
    })

    it('should return single item array', () => {
      queue.enqueue('a', 1)
      expect(queue.toArray()).toEqual(['a'])
    })

    it('should return items in priority order', () => {
      queue.enqueue('c', 3)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      expect(queue.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('should return new array each call', () => {
      queue.enqueue('a', 1)
      const arr1 = queue.toArray()
      const arr2 = queue.toArray()
      expect(arr1).not.toBe(arr2)
      expect(arr1).toEqual(arr2)
    })

    it('should not modify queue', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.toArray()
      expect(queue.size).toBe(2)
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty queue', () => {
      let count = 0
      queue.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should iterate over all items in order', () => {
      queue.enqueue('c', 3)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      const values: string[] = []
      queue.forEach((v) => { values.push(v) })
      expect(values).toEqual(['a', 'b', 'c'])
    })

    it('should provide correct priorities', () => {
      queue.enqueue('a', 10)
      queue.enqueue('b', 20)
      const priorities: number[] = []
      queue.forEach((_v, p) => { priorities.push(p) })
      expect(priorities).toEqual([10, 20])
    })

    it('should provide correct indices', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      const indices: number[] = []
      queue.forEach((_v, _p, i) => { indices.push(i) })
      expect(indices).toEqual([0, 1, 2])
    })

    it('should handle single item', () => {
      queue.enqueue('a', 1)
      let count = 0
      queue.forEach(() => { count++ })
      expect(count).toBe(1)
    })
  })

  describe('[Symbol.iterator]', () => {
    it('should return empty iterator for empty queue', () => {
      expect([...queue]).toEqual([])
    })

    it('should iterate in priority order', () => {
      queue.enqueue('c', 3)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      expect([...queue]).toEqual(['a', 'b', 'c'])
    })

    it('should work with for...of', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      const values: string[] = []
      for (const v of queue) {
        values.push(v)
      }
      expect(values).toEqual(['a', 'b'])
    })

    it('should work with spread operator', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      expect([...queue]).toEqual(['a', 'b'])
    })

    it('should work with Array.from', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      expect(Array.from(queue)).toEqual(['a', 'b'])
    })
  })

  describe('contains', () => {
    it('should return false for empty queue', () => {
      expect(queue.contains('a')).toBe(false)
    })

    it('should return true for existing value', () => {
      queue.enqueue('a', 1)
      expect(queue.contains('a')).toBe(true)
    })

    it('should return false for non-existing value', () => {
      queue.enqueue('a', 1)
      expect(queue.contains('b')).toBe(false)
    })

    it('should return false after dequeue', () => {
      queue.enqueue('a', 1)
      queue.dequeue()
      expect(queue.contains('a')).toBe(false)
    })

    it('should return false after remove', () => {
      queue.enqueue('a', 1)
      queue.remove('a')
      expect(queue.contains('a')).toBe(false)
    })

    it('should return false after clear', () => {
      queue.enqueue('a', 1)
      queue.clear()
      expect(queue.contains('a')).toBe(false)
    })

    it('should work with number values', () => {
      const q = new SkipListQueue<number>()
      q.enqueue(42, 1)
      expect(q.contains(42)).toBe(true)
      expect(q.contains(99)).toBe(false)
    })

    it('should work with object values', () => {
      const obj = { id: 1 }
      const q = new SkipListQueue<{ id: number }>()
      q.enqueue(obj, 1)
      expect(q.contains(obj)).toBe(true)
    })
  })

  describe('remove', () => {
    it('should return false for non-existing value', () => {
      expect(queue.remove('a')).toBe(false)
    })

    it('should return true for existing value', () => {
      queue.enqueue('a', 1)
      expect(queue.remove('a')).toBe(true)
    })

    it('should decrement size', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.remove('a')
      expect(queue.size).toBe(1)
    })

    it('should maintain order after removal', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.remove('b')
      expect(queue.toArray()).toEqual(['a', 'c'])
    })

    it('should handle removing first item', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.remove('a')
      expect(queue.toArray()).toEqual(['b', 'c'])
      expect(queue.peek()).toBe('b')
    })

    it('should handle removing last item', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.remove('c')
      expect(queue.toArray()).toEqual(['a', 'b'])
    })

    it('should handle removing single item', () => {
      queue.enqueue('a', 1)
      queue.remove('a')
      expect(queue.isEmpty()).toBe(true)
    })

    it('should update statistics', () => {
      queue.enqueue('a', 1)
      queue.remove('a')
      expect(queue.getStatistics().removals).toBe(1)
    })

    it('should allow re-enqueue after remove', () => {
      queue.enqueue('a', 1)
      queue.remove('a')
      expect(queue.enqueue('a', 5)).toBe(true)
      expect(queue.size).toBe(1)
    })

    it('should handle removing middle element', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.enqueue('d', 4)
      queue.remove('b')
      queue.remove('d')
      expect(queue.toArray()).toEqual(['a', 'c'])
    })
  })

  describe('updatePriority', () => {
    it('should return false for non-existing value', () => {
      expect(queue.updatePriority('a', 5)).toBe(false)
    })

    it('should return true for existing value', () => {
      queue.enqueue('a', 1)
      expect(queue.updatePriority('a', 5)).toBe(true)
    })

    it('should change priority of item', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.updatePriority('a', 10)
      expect(queue.toArray()).toEqual(['b', 'c', 'a'])
    })

    it('should update getPriority result', () => {
      queue.enqueue('a', 1)
      queue.updatePriority('a', 5)
      expect(queue.getPriority('a')).toBe(5)
    })

    it('should handle same priority update', () => {
      queue.enqueue('a', 1)
      expect(queue.updatePriority('a', 1)).toBe(true)
      expect(queue.size).toBe(1)
    })

    it('should maintain order after update', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.updatePriority('c', 0)
      expect(queue.toArray()).toEqual(['c', 'a', 'b'])
    })

    it('should update statistics', () => {
      queue.enqueue('a', 1)
      queue.updatePriority('a', 5)
      expect(queue.getStatistics().updates).toBe(1)
    })

    it('should handle multiple updates', () => {
      queue.enqueue('a', 1)
      queue.updatePriority('a', 5)
      queue.updatePriority('a', 3)
      queue.updatePriority('a', 0)
      expect(queue.getPriority('a')).toBe(0)
      expect(queue.peek()).toBe('a')
    })
  })

  describe('getPriority', () => {
    it('should return undefined for non-existing value', () => {
      expect(queue.getPriority('a')).toBeUndefined()
    })

    it('should return correct priority', () => {
      queue.enqueue('a', 42)
      expect(queue.getPriority('a')).toBe(42)
    })

    it('should reflect updates', () => {
      queue.enqueue('a', 1)
      queue.updatePriority('a', 99)
      expect(queue.getPriority('a')).toBe(99)
    })

    it('should return undefined after remove', () => {
      queue.enqueue('a', 1)
      queue.remove('a')
      expect(queue.getPriority('a')).toBeUndefined()
    })

    it('should return undefined after dequeue', () => {
      queue.enqueue('a', 1)
      queue.dequeue()
      expect(queue.getPriority('a')).toBeUndefined()
    })
  })

  describe('findByPriority', () => {
    it('should return empty array for empty queue', () => {
      expect(queue.findByPriority(1)).toEqual([])
    })

    it('should find single item by priority', () => {
      queue.enqueue('a', 5)
      expect(queue.findByPriority(5)).toEqual(['a'])
    })

    it('should return empty for non-existing priority', () => {
      queue.enqueue('a', 1)
      expect(queue.findByPriority(99)).toEqual([])
    })

    it('should find multiple items with same priority', () => {
      queue.enqueue('a', 5)
      queue.enqueue('b', 5)
      queue.enqueue('c', 5)
      const result = queue.findByPriority(5)
      expect(result.length).toBe(3)
      expect(result).toContain('a')
      expect(result).toContain('b')
      expect(result).toContain('c')
    })

    it('should only return items matching exact priority', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      expect(queue.findByPriority(2)).toEqual(['b'])
    })

    it('should handle negative priorities', () => {
      queue.enqueue('a', -5)
      queue.enqueue('b', -5)
      expect(queue.findByPriority(-5).length).toBe(2)
    })

    it('should handle fractional priorities', () => {
      queue.enqueue('a', 1.5)
      expect(queue.findByPriority(1.5)).toEqual(['a'])
      expect(queue.findByPriority(1.4)).toEqual([])
    })
  })

  describe('rangeByPriority', () => {
    it('should return empty for empty queue', () => {
      expect(queue.rangeByPriority(1, 5)).toEqual([])
    })

    it('should return items in range', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.enqueue('d', 4)
      queue.enqueue('e', 5)
      expect(queue.rangeByPriority(2, 4)).toEqual(['b', 'c', 'd'])
    })

    it('should return single item for exact range', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      expect(queue.rangeByPriority(2, 2)).toEqual(['b'])
    })

    it('should return empty for range with no matches', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 10)
      expect(queue.rangeByPriority(3, 7)).toEqual([])
    })

    it('should return all items for full range', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      expect(queue.rangeByPriority(0, 100)).toEqual(['a', 'b', 'c'])
    })

    it('should handle range with negative priorities', () => {
      queue.enqueue('a', -10)
      queue.enqueue('b', -5)
      queue.enqueue('c', 0)
      queue.enqueue('d', 5)
      expect(queue.rangeByPriority(-5, 0)).toEqual(['b', 'c'])
    })

    it('should handle range where min equals max', () => {
      queue.enqueue('a', 5)
      queue.enqueue('b', 5)
      const result = queue.rangeByPriority(5, 5)
      expect(result.length).toBe(2)
      expect(result).toContain('a')
      expect(result).toContain('b')
    })

    it('should return items in priority order', () => {
      queue.enqueue('c', 3)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      const result = queue.rangeByPriority(1, 3)
      expect(result).toEqual(['a', 'b', 'c'])
    })
  })

  describe('getStatistics', () => {
    it('should return initial statistics', () => {
      const stats = queue.getStatistics()
      expect(stats.enqueues).toBe(0)
      expect(stats.dequeues).toBe(0)
      expect(stats.removals).toBe(0)
      expect(stats.updates).toBe(0)
      expect(stats.totalNodesCreated).toBe(0)
    })

    it('should track enqueues', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      expect(queue.getStatistics().enqueues).toBe(2)
    })

    it('should not increment enqueues on duplicate', () => {
      queue.enqueue('a', 1)
      queue.enqueue('a', 2)
      expect(queue.getStatistics().enqueues).toBe(1)
    })

    it('should track dequeues', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.dequeue()
      queue.dequeue()
      expect(queue.getStatistics().dequeues).toBe(2)
    })

    it('should not increment dequeues on empty dequeue', () => {
      queue.dequeue()
      expect(queue.getStatistics().dequeues).toBe(0)
    })

    it('should track removals', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.remove('a')
      expect(queue.getStatistics().removals).toBe(1)
    })

    it('should not increment removals on non-existing', () => {
      queue.remove('nonexistent')
      expect(queue.getStatistics().removals).toBe(0)
    })

    it('should track updates', () => {
      queue.enqueue('a', 1)
      queue.updatePriority('a', 5)
      expect(queue.getStatistics().updates).toBe(1)
    })

    it('should track totalNodesCreated', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      expect(queue.getStatistics().totalNodesCreated).toBe(3)
    })

    it('should track maxLevel', () => {
      for (let i = 0; i < 100; i++) {
        queue.enqueue(`item-${i}`, i)
      }
      const stats = queue.getStatistics()
      expect(stats.maxLevel).toBeGreaterThanOrEqual(1)
    })

    it('should return a copy', () => {
      queue.enqueue('a', 1)
      const stats1 = queue.getStatistics()
      queue.enqueue('b', 2)
      expect(stats1.enqueues).toBe(1)
      expect(queue.getStatistics().enqueues).toBe(2)
    })
  })

  describe('custom comparator', () => {
    it('should work with descending comparator', () => {
      const q = new SkipListQueue<string>({ comparator: (a, b) => b - a })
      q.enqueue('a', 1)
      q.enqueue('b', 5)
      q.enqueue('c', 3)
      expect(q.toArray()).toEqual(['b', 'c', 'a'])
    })

    it('should dequeue highest priority first with descending comparator', () => {
      const q = new SkipListQueue<string>({ comparator: (a, b) => b - a })
      q.enqueue('a', 1)
      q.enqueue('b', 5)
      q.enqueue('c', 3)
      expect(q.dequeue()).toBe('b')
      expect(q.dequeue()).toBe('c')
      expect(q.dequeue()).toBe('a')
    })

    it('should work with rangeByPriority using descending comparator', () => {
      const q = new SkipListQueue<string>({ comparator: (a, b) => b - a })
      q.enqueue('a', 1)
      q.enqueue('b', 3)
      q.enqueue('c', 5)
      expect(q.rangeByPriority(3, 5)).toEqual(['c', 'b'])
    })

    it('should work with findByPriority using descending comparator', () => {
      const q = new SkipListQueue<string>({ comparator: (a, b) => b - a })
      q.enqueue('a', 3)
      expect(q.findByPriority(3)).toEqual(['a'])
    })
  })

  describe('stress tests', () => {
    it('should handle large number of enqueue/dequeue operations', () => {
      const q = new SkipListQueue<number>()
      for (let i = 0; i < 1000; i++) {
        q.enqueue(i, Math.random() * 1000)
      }
      expect(q.size).toBe(1000)
      const arr = q.toArray()
      for (let i = 1; i < arr.length; i++) {
        expect(q.getPriority(arr[i]!)).toBeGreaterThanOrEqual(q.getPriority(arr[i - 1]!)!)
      }
      for (let i = 0; i < 1000; i++) {
        q.dequeue()
      }
      expect(q.isEmpty()).toBe(true)
    })

    it('should handle mixed operations', () => {
      const q = new SkipListQueue<number>()
      for (let i = 0; i < 100; i++) {
        q.enqueue(i, i)
      }
      for (let i = 0; i < 50; i++) {
        q.dequeue()
      }
      expect(q.size).toBe(50)
      for (let i = 100; i < 200; i++) {
        q.enqueue(i, i)
      }
      expect(q.size).toBe(150)
    })

    it('should handle remove from large queue', () => {
      const q = new SkipListQueue<number>()
      for (let i = 0; i < 100; i++) {
        q.enqueue(i, i)
      }
      for (let i = 0; i < 100; i += 2) {
        q.remove(i)
      }
      expect(q.size).toBe(50)
    })

    it('should handle many updates', () => {
      const q = new SkipListQueue<number>()
      for (let i = 0; i < 50; i++) {
        q.enqueue(i, i)
      }
      for (let i = 0; i < 50; i++) {
        q.updatePriority(i, 100 - i)
      }
      expect(q.size).toBe(50)
      expect(q.peek()).toBe(49)
    })

    it('should handle clear and refill multiple times', () => {
      const q = new SkipListQueue<number>()
      for (let round = 0; round < 10; round++) {
        for (let i = 0; i < 50; i++) {
          q.enqueue(i, i)
        }
        expect(q.size).toBe(50)
        q.clear()
        expect(q.isEmpty()).toBe(true)
      }
    })
  })

  describe('edge cases', () => {
    it('should handle enqueue after full drain', () => {
      queue.enqueue('a', 1)
      queue.dequeue()
      expect(queue.enqueue('a', 5)).toBe(true)
    })

    it('should handle dequeue on empty between operations', () => {
      queue.enqueue('a', 1)
      queue.dequeue()
      expect(queue.dequeue()).toBeUndefined()
      queue.enqueue('b', 2)
      expect(queue.dequeue()).toBe('b')
    })

    it('should handle updatePriority to same position', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.updatePriority('b', 2)
      expect(queue.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('should handle very large priorities', () => {
      queue.enqueue('a', Number.MAX_SAFE_INTEGER)
      queue.enqueue('b', Number.MIN_SAFE_INTEGER)
      expect(queue.toArray()).toEqual(['b', 'a'])
    })

    it('should handle very small priorities', () => {
      queue.enqueue('a', -Number.MAX_SAFE_INTEGER)
      queue.enqueue('b', Number.MAX_SAFE_INTEGER)
      expect(queue.toArray()).toEqual(['a', 'b'])
    })

    it('should handle Infinity priority', () => {
      queue.enqueue('a', Infinity)
      queue.enqueue('b', -Infinity)
      queue.enqueue('c', 0)
      expect(queue.toArray()).toEqual(['b', 'c', 'a'])
    })

    it('should handle contains with different types', () => {
      const q = new SkipListQueue<number | string>()
      q.enqueue(1, 1)
      q.enqueue('hello', 2)
      expect(q.contains(1)).toBe(true)
      expect(q.contains('hello')).toBe(true)
      expect(q.contains(2)).toBe(false)
    })

    it('should handle forEach on single element', () => {
      queue.enqueue('only', 42)
      let sum = 0
      queue.forEach((_v, p) => { sum += p })
      expect(sum).toBe(42)
    })

    it('should handle toArray after partial dequeue', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.dequeue()
      expect(queue.toArray()).toEqual(['b', 'c'])
    })

    it('should handle remove and re-enqueue', () => {
      queue.enqueue('a', 1)
      queue.remove('a')
      queue.enqueue('a', 10)
      expect(queue.size).toBe(1)
      expect(queue.getPriority('a')).toBe(10)
    })

    it('should handle updatePriority and remove', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.updatePriority('a', 10)
      queue.remove('a')
      expect(queue.toArray()).toEqual(['b'])
    })

    it('should handle rangeByPriority with edge priorities', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 5)
      queue.enqueue('c', 10)
      expect(queue.rangeByPriority(1, 10)).toEqual(['a', 'b', 'c'])
      expect(queue.rangeByPriority(1, 1)).toEqual(['a'])
      expect(queue.rangeByPriority(10, 10)).toEqual(['c'])
    })

    it('should handle custom maxLevel', () => {
      const q = new SkipListQueue<number>({ maxLevel: 4 })
      for (let i = 0; i < 100; i++) {
        q.enqueue(i, i)
      }
      expect(q.size).toBe(100)
    })

    it('should handle custom probability', () => {
      const q = new SkipListQueue<number>({ probability: 0.1 })
      for (let i = 0; i < 100; i++) {
        q.enqueue(i, i)
      }
      expect(q.size).toBe(100)
    })

    it('should handle empty queue operations gracefully', () => {
      expect(queue.dequeue()).toBeUndefined()
      expect(queue.peek()).toBeUndefined()
      expect(queue.toArray()).toEqual([])
      expect(queue.contains('a')).toBe(false)
      expect(queue.remove('a')).toBe(false)
      expect(queue.getPriority('a')).toBeUndefined()
      expect(queue.findByPriority(1)).toEqual([])
      expect(queue.rangeByPriority(1, 5)).toEqual([])
    })
  })
})
