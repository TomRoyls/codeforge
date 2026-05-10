import { describe, it, expect, beforeEach } from 'vitest'
import { ModularQueue } from '../../src/core/modular-queue/modular-queue.js'
import type { ModularQueueOptions, ModularQueueStats } from '../../src/core/modular-queue/types.js'

describe('ModularQueue', () => {
  let queue: ModularQueue<number>

  beforeEach(() => {
    queue = new ModularQueue<number>({ capacity: 8 })
  })

  describe('construction', () => {
    it('should create with specified capacity', () => {
      const q = new ModularQueue<number>({ capacity: 16 })
      expect(q.capacity()).toBe(16)
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('should clamp capacity to at least 1 for zero', () => {
      const q = new ModularQueue<number>({ capacity: 0 })
      expect(q.capacity()).toBe(1)
    })

    it('should clamp capacity to at least 1 for negative', () => {
      const q = new ModularQueue<number>({ capacity: -5 })
      expect(q.capacity()).toBe(1)
    })

    it('should floor fractional capacity', () => {
      const q = new ModularQueue<number>({ capacity: 5.7 })
      expect(q.capacity()).toBe(5)
    })

    it('should default overwrite to false', () => {
      const q = new ModularQueue<number>({ capacity: 4 })
      const s = q.stats()
      expect(s.overwriteEnabled).toBe(false)
    })

    it('should accept overwrite: true', () => {
      const q = new ModularQueue<number>({ capacity: 4, overwrite: true })
      const s = q.stats()
      expect(s.overwriteEnabled).toBe(true)
    })

    it('should accept overwrite: false explicitly', () => {
      const q = new ModularQueue<number>({ capacity: 4, overwrite: false })
      const s = q.stats()
      expect(s.overwriteEnabled).toBe(false)
    })

    it('should start empty', () => {
      expect(queue.isEmpty()).toBe(true)
      expect(queue.size()).toBe(0)
    })

    it('should not be full when empty', () => {
      expect(queue.isFull()).toBe(false)
    })

    it('should handle capacity of 1', () => {
      const q = new ModularQueue<number>({ capacity: 1 })
      expect(q.capacity()).toBe(1)
    })

    it('should handle very large capacity', () => {
      const q = new ModularQueue<number>({ capacity: 100000 })
      expect(q.capacity()).toBe(100000)
      expect(q.isEmpty()).toBe(true)
    })
  })

  describe('enqueue', () => {
    it('should enqueue an item and return true', () => {
      expect(queue.enqueue(1)).toBe(true)
      expect(queue.size()).toBe(1)
    })

    it('should enqueue multiple items', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.size()).toBe(3)
      expect(queue.toArray()).toEqual([1, 2, 3])
    })

    it('should return true when not full', () => {
      for (let i = 0; i < 7; i++) {
        expect(queue.enqueue(i)).toBe(true)
      }
    })

    it('should return false when full and overwrite is false', () => {
      const q = new ModularQueue<number>({ capacity: 3, overwrite: false })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.isFull()).toBe(true)
      expect(q.enqueue(4)).toBe(false)
    })

    it('should not modify queue when rejecting full enqueue', () => {
      const q = new ModularQueue<number>({ capacity: 3, overwrite: false })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.toArray()).toEqual([1, 2, 3])
      expect(q.size()).toBe(3)
    })

    it('should overwrite oldest when overwrite mode enabled', () => {
      const q = new ModularQueue<number>({ capacity: 3, overwrite: true })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.enqueue(4)).toBe(true)
      expect(q.toArray()).toEqual([2, 3, 4])
      expect(q.size()).toBe(3)
    })

    it('should return true when overwriting', () => {
      const q = new ModularQueue<number>({ capacity: 2, overwrite: true })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.enqueue(3)).toBe(true)
    })

    it('should maintain size equal to capacity when overwriting', () => {
      const q = new ModularQueue<number>({ capacity: 3, overwrite: true })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      expect(q.size()).toBe(3)
      expect(q.capacity()).toBe(3)
    })

    it('should handle multiple overwrites', () => {
      const q = new ModularQueue<number>({ capacity: 2, overwrite: true })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      expect(q.toArray()).toEqual([4, 5])
    })

    it('should work with string type', () => {
      const q = new ModularQueue<string>({ capacity: 4 })
      q.enqueue('a')
      q.enqueue('b')
      expect(q.toArray()).toEqual(['a', 'b'])
    })

    it('should work with object type', () => {
      const q = new ModularQueue<{ x: number }>({ capacity: 4 })
      const obj = { x: 1 }
      q.enqueue(obj)
      expect(q.peek()).toBe(obj)
    })
  })

  describe('dequeue', () => {
    it('should return undefined on empty queue', () => {
      expect(queue.dequeue()).toBeUndefined()
    })

    it('should dequeue the first enqueued item (FIFO)', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.dequeue()).toBe(1)
      expect(queue.dequeue()).toBe(2)
      expect(queue.dequeue()).toBe(3)
    })

    it('should decrement size after dequeue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      expect(queue.size()).toBe(1)
    })

    it('should drain completely', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      queue.dequeue()
      expect(queue.isEmpty()).toBe(true)
      expect(queue.dequeue()).toBeUndefined()
    })

    it('should update peek after dequeue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      expect(queue.peek()).toBe(2)
    })

    it('should allow enqueue after draining', () => {
      queue.enqueue(1)
      queue.dequeue()
      queue.enqueue(2)
      expect(queue.peek()).toBe(2)
      expect(queue.size()).toBe(1)
    })

    it('should handle dequeue on capacity-1 queue', () => {
      const q = new ModularQueue<number>({ capacity: 1 })
      q.enqueue(42)
      expect(q.dequeue()).toBe(42)
      expect(q.isEmpty()).toBe(true)
    })
  })

  describe('peek', () => {
    it('should return undefined on empty queue', () => {
      expect(queue.peek()).toBeUndefined()
    })

    it('should return the front item without removing', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.peek()).toBe(1)
      expect(queue.size()).toBe(2)
    })

    it('should return same value on multiple calls', () => {
      queue.enqueue(42)
      expect(queue.peek()).toBe(42)
      expect(queue.peek()).toBe(42)
      expect(queue.peek()).toBe(42)
    })

    it('should reflect dequeue changes', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      expect(queue.peek()).toBe(2)
    })

    it('should reflect enqueue changes', () => {
      queue.enqueue(1)
      expect(queue.peek()).toBe(1)
      queue.enqueue(2)
      expect(queue.peek()).toBe(1)
    })
  })

  describe('peekLast', () => {
    it('should return undefined on empty queue', () => {
      expect(queue.peekLast()).toBeUndefined()
    })

    it('should return the last enqueued item', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.peekLast()).toBe(3)
    })

    it('should not remove the item', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.peekLast()).toBe(2)
      expect(queue.size()).toBe(2)
    })

    it('should match peek for single item', () => {
      queue.enqueue(42)
      expect(queue.peek()).toBe(42)
      expect(queue.peekLast()).toBe(42)
    })

    it('should update after dequeue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.dequeue()
      expect(queue.peekLast()).toBe(3)
    })

    it('should update after enqueue', () => {
      queue.enqueue(1)
      expect(queue.peekLast()).toBe(1)
      queue.enqueue(2)
      expect(queue.peekLast()).toBe(2)
    })
  })

  describe('size', () => {
    it('should return 0 for empty queue', () => {
      expect(queue.size()).toBe(0)
    })

    it('should increase with enqueue', () => {
      queue.enqueue(1)
      expect(queue.size()).toBe(1)
      queue.enqueue(2)
      expect(queue.size()).toBe(2)
    })

    it('should decrease with dequeue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      expect(queue.size()).toBe(1)
    })

    it('should not go below 0', () => {
      queue.dequeue()
      expect(queue.size()).toBe(0)
      queue.dequeue()
      expect(queue.size()).toBe(0)
    })
  })

  describe('capacity', () => {
    it('should return the configured capacity', () => {
      const q = new ModularQueue<number>({ capacity: 32 })
      expect(q.capacity()).toBe(32)
    })

    it('should remain constant after operations', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      expect(queue.capacity()).toBe(8)
    })
  })

  describe('isFull', () => {
    it('should be false when empty', () => {
      expect(queue.isFull()).toBe(false)
    })

    it('should be false when partially filled', () => {
      queue.enqueue(1)
      expect(queue.isFull()).toBe(false)
    })

    it('should be true when filled to capacity', () => {
      const q = new ModularQueue<number>({ capacity: 3 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.isFull()).toBe(true)
    })

    it('should become false after dequeue from full', () => {
      const q = new ModularQueue<number>({ capacity: 3 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect(q.isFull()).toBe(false)
    })

    it('should stay full in overwrite mode after enqueue', () => {
      const q = new ModularQueue<number>({ capacity: 3, overwrite: true })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.isFull()).toBe(true)
    })
  })

  describe('isEmpty', () => {
    it('should be true initially', () => {
      expect(queue.isEmpty()).toBe(true)
    })

    it('should be false after enqueue', () => {
      queue.enqueue(1)
      expect(queue.isEmpty()).toBe(false)
    })

    it('should be true after draining', () => {
      queue.enqueue(1)
      queue.dequeue()
      expect(queue.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear empty queue without error', () => {
      queue.clear()
      expect(queue.isEmpty()).toBe(true)
      expect(queue.size()).toBe(0)
    })

    it('should clear non-empty queue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.clear()
      expect(queue.isEmpty()).toBe(true)
      expect(queue.size()).toBe(0)
      expect(queue.toArray()).toEqual([])
    })

    it('should preserve capacity', () => {
      const q = new ModularQueue<number>({ capacity: 4 })
      q.enqueue(1)
      q.clear()
      expect(q.capacity()).toBe(4)
    })

    it('should allow operations after clear', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.clear()
      queue.enqueue(3)
      expect(queue.size()).toBe(1)
      expect(queue.peek()).toBe(3)
    })

    it('should allow filling again after clear', () => {
      const q = new ModularQueue<number>({ capacity: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.clear()
      q.enqueue(3)
      q.enqueue(4)
      expect(q.isFull()).toBe(true)
      expect(q.toArray()).toEqual([3, 4])
    })
  })

  describe('clone', () => {
    it('should clone an empty queue', () => {
      const cloned = queue.clone()
      expect(cloned.isEmpty()).toBe(true)
      expect(cloned.size()).toBe(0)
      expect(cloned.capacity()).toBe(queue.capacity())
    })

    it('should clone a non-empty queue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      const cloned = queue.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3])
      expect(cloned.size()).toBe(3)
    })

    it('should produce independent copy', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      const cloned = queue.clone()
      cloned.enqueue(3)
      expect(queue.size()).toBe(2)
      expect(cloned.size()).toBe(3)
    })

    it('should not affect original when modified', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      const cloned = queue.clone()
      cloned.dequeue()
      expect(queue.size()).toBe(2)
      expect(cloned.size()).toBe(1)
    })

    it('should preserve overwrite setting', () => {
      const q = new ModularQueue<number>({ capacity: 3, overwrite: true })
      q.enqueue(1)
      const cloned = q.clone()
      expect(cloned.stats().overwriteEnabled).toBe(true)
    })

    it('should preserve capacity', () => {
      const q = new ModularQueue<number>({ capacity: 5 })
      q.enqueue(1)
      const cloned = q.clone()
      expect(cloned.capacity()).toBe(5)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty queue', () => {
      expect(queue.toArray()).toEqual([])
    })

    it('should return elements in FIFO order', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      expect(queue.toArray()).toEqual([1, 2, 3])
    })

    it('should reflect wrap-around', () => {
      const q = new ModularQueue<number>({ capacity: 4 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.enqueue(4)
      expect(q.toArray()).toEqual([2, 3, 4])
    })

    it('should not modify the queue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      const arr = queue.toArray()
      arr.push(999)
      expect(queue.size()).toBe(2)
    })

    it('should return new array each time', () => {
      queue.enqueue(1)
      const a = queue.toArray()
      const b = queue.toArray()
      expect(a).not.toBe(b)
    })
  })

  describe('forEach', () => {
    it('should not call callback on empty queue', () => {
      let count = 0
      queue.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should iterate all elements in order', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      const items: number[] = []
      queue.forEach((item) => { items.push(item) })
      expect(items).toEqual([1, 2, 3])
    })

    it('should provide correct indices', () => {
      queue.enqueue(10)
      queue.enqueue(20)
      queue.enqueue(30)
      const indices: number[] = []
      queue.forEach((_item, index) => { indices.push(index) })
      expect(indices).toEqual([0, 1, 2])
    })

    it('should provide item and index together', () => {
      queue.enqueue(5)
      queue.enqueue(10)
      const pairs: string[] = []
      queue.forEach((item, index) => { pairs.push(`${index}:${item}`) })
      expect(pairs).toEqual(['0:5', '1:10'])
    })

    it('should work after wrap-around', () => {
      const q = new ModularQueue<number>({ capacity: 3 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.enqueue(4)
      const items: number[] = []
      q.forEach((item) => { items.push(item) })
      expect(items).toEqual([2, 3, 4])
    })
  })

  describe('from factory', () => {
    it('should create from array', () => {
      const q = ModularQueue.from([1, 2, 3], { capacity: 8 })
      expect(q.toArray()).toEqual([1, 2, 3])
      expect(q.size()).toBe(3)
    })

    it('should create from empty array', () => {
      const q = ModularQueue.from([], { capacity: 4 })
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('should create from iterable (Set)', () => {
      const q = ModularQueue.from(new Set([1, 2, 3]), { capacity: 8 })
      expect(q.size()).toBe(3)
    })

    it('should create from generator', () => {
      function* gen() {
        yield 1
        yield 2
        yield 3
      }
      const q = ModularQueue.from(gen(), { capacity: 8 })
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('should respect overwrite option', () => {
      const q = ModularQueue.from([1, 2, 3, 4, 5], { capacity: 3, overwrite: true })
      expect(q.toArray()).toEqual([3, 4, 5])
      expect(q.size()).toBe(3)
    })

    it('should reject items beyond capacity when no overwrite', () => {
      const q = ModularQueue.from([1, 2, 3, 4, 5], { capacity: 3, overwrite: false })
      expect(q.toArray()).toEqual([1, 2, 3])
      expect(q.size()).toBe(3)
    })

    it('should use specified capacity', () => {
      const q = ModularQueue.from([1, 2], { capacity: 16 })
      expect(q.capacity()).toBe(16)
    })
  })

  describe('indexOf', () => {
    it('should return -1 for empty queue', () => {
      expect(queue.indexOf(1)).toBe(-1)
    })

    it('should return index of found item', () => {
      queue.enqueue(10)
      queue.enqueue(20)
      queue.enqueue(30)
      expect(queue.indexOf(20)).toBe(1)
    })

    it('should return -1 for not found item', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.indexOf(99)).toBe(-1)
    })

    it('should return first occurrence of duplicates', () => {
      queue.enqueue(5)
      queue.enqueue(3)
      queue.enqueue(5)
      expect(queue.indexOf(5)).toBe(0)
    })

    it('should use strict equality', () => {
      const q = new ModularQueue<number>({ capacity: 4 })
      q.enqueue(1)
      expect(q.indexOf(1)).toBe(0)
      expect(q.indexOf('1' as unknown as number)).toBe(-1)
    })

    it('should work with object references', () => {
      const obj = { x: 1 }
      const q = new ModularQueue<{ x: number }>({ capacity: 4 })
      q.enqueue(obj)
      expect(q.indexOf(obj)).toBe(0)
      expect(q.indexOf({ x: 1 })).toBe(-1)
    })

    it('should work after wrap-around', () => {
      const q = new ModularQueue<number>({ capacity: 4 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.dequeue()
      q.enqueue(5)
      expect(q.indexOf(5)).toBe(3)
      expect(q.indexOf(2)).toBe(0)
    })
  })

  describe('contains', () => {
    it('should return false for empty queue', () => {
      expect(queue.contains(1)).toBe(false)
    })

    it('should return true when item exists', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.contains(2)).toBe(true)
    })

    it('should return false when item does not exist', () => {
      queue.enqueue(1)
      expect(queue.contains(99)).toBe(false)
    })

    it('should find item at front', () => {
      queue.enqueue(42)
      queue.enqueue(2)
      expect(queue.contains(42)).toBe(true)
    })

    it('should find item at back', () => {
      queue.enqueue(1)
      queue.enqueue(42)
      expect(queue.contains(42)).toBe(true)
    })
  })

  describe('stats', () => {
    it('should return correct stats for empty queue', () => {
      const s = queue.stats()
      expect(s.capacity).toBe(8)
      expect(s.size).toBe(0)
      expect(s.isEmpty).toBe(true)
      expect(s.isFull).toBe(false)
      expect(s.utilization).toBe(0)
      expect(s.overwriteEnabled).toBe(false)
    })

    it('should return correct stats for partially filled queue', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      const s = queue.stats()
      expect(s.capacity).toBe(8)
      expect(s.size).toBe(3)
      expect(s.isEmpty).toBe(false)
      expect(s.isFull).toBe(false)
      expect(s.utilization).toBe(3 / 8)
    })

    it('should return correct stats for full queue', () => {
      const q = new ModularQueue<number>({ capacity: 3 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const s = q.stats()
      expect(s.isFull).toBe(true)
      expect(s.utilization).toBe(1)
    })

    it('should show overwrite enabled', () => {
      const q = new ModularQueue<number>({ capacity: 4, overwrite: true })
      expect(q.stats().overwriteEnabled).toBe(true)
    })

    it('should reflect size changes', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      const s = queue.stats()
      expect(s.size).toBe(1)
      expect(s.utilization).toBe(1 / 8)
    })
  })

  describe('edge cases: capacity 1', () => {
    it('should enqueue and dequeue with capacity 1', () => {
      const q = new ModularQueue<number>({ capacity: 1 })
      q.enqueue(42)
      expect(q.isFull()).toBe(true)
      expect(q.peek()).toBe(42)
      expect(q.peekLast()).toBe(42)
      expect(q.dequeue()).toBe(42)
      expect(q.isEmpty()).toBe(true)
    })

    it('should reject enqueue when full with capacity 1', () => {
      const q = new ModularQueue<number>({ capacity: 1, overwrite: false })
      q.enqueue(1)
      expect(q.enqueue(2)).toBe(false)
      expect(q.toArray()).toEqual([1])
    })

    it('should overwrite when overwrite mode with capacity 1', () => {
      const q = new ModularQueue<number>({ capacity: 1, overwrite: true })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.toArray()).toEqual([2])
      expect(q.size()).toBe(1)
    })

    it('should handle clear on capacity 1', () => {
      const q = new ModularQueue<number>({ capacity: 1 })
      q.enqueue(1)
      q.clear()
      expect(q.isEmpty()).toBe(true)
      q.enqueue(2)
      expect(q.peek()).toBe(2)
    })

    it('should clone capacity 1 queue', () => {
      const q = new ModularQueue<number>({ capacity: 1 })
      q.enqueue(5)
      const c = q.clone()
      expect(c.toArray()).toEqual([5])
      expect(c.capacity()).toBe(1)
    })
  })

  describe('overwrite mode', () => {
    it('should overwrite oldest item', () => {
      const q = new ModularQueue<number>({ capacity: 3, overwrite: true })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.peek()).toBe(2)
      expect(q.peekLast()).toBe(4)
    })

    it('should keep size at capacity when overwriting', () => {
      const q = new ModularQueue<number>({ capacity: 3, overwrite: true })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      expect(q.size()).toBe(3)
    })

    it('should allow dequeue after overwrite', () => {
      const q = new ModularQueue<number>({ capacity: 3, overwrite: true })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
      expect(q.dequeue()).toBe(4)
    })

    it('should handle full overwrite cycle', () => {
      const q = new ModularQueue<number>({ capacity: 3, overwrite: true })
      for (let i = 0; i < 10; i++) {
        q.enqueue(i)
      }
      expect(q.toArray()).toEqual([7, 8, 9])
    })

    it('should work with interleaved enqueue/dequeue in overwrite mode', () => {
      const q = new ModularQueue<number>({ capacity: 3, overwrite: true })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.enqueue(4)
      q.enqueue(5)
      expect(q.toArray()).toEqual([3, 4, 5])
    })

    it('should return true when overwriting full queue', () => {
      const q = new ModularQueue<number>({ capacity: 2, overwrite: true })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.enqueue(3)).toBe(true)
    })
  })

  describe('full queue rejection', () => {
    it('should reject when full', () => {
      const q = new ModularQueue<number>({ capacity: 2 })
      q.enqueue(1)
      q.enqueue(2)
      expect(q.enqueue(3)).toBe(false)
    })

    it('should accept after dequeue from full', () => {
      const q = new ModularQueue<number>({ capacity: 2 })
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      expect(q.enqueue(3)).toBe(true)
      expect(q.toArray()).toEqual([2, 3])
    })

    it('should not corrupt data on rejection', () => {
      const q = new ModularQueue<number>({ capacity: 3 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      expect(q.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('wrap-around behavior', () => {
    it('should handle enqueue/dequeue wrap-around', () => {
      const q = new ModularQueue<number>({ capacity: 4 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.dequeue()
      q.dequeue()
      q.enqueue(5)
      q.enqueue(6)
      expect(q.toArray()).toEqual([3, 4, 5, 6])
    })

    it('should handle full wrap-around cycle', () => {
      const q = new ModularQueue<number>({ capacity: 3 })
      for (let cycle = 0; cycle < 5; cycle++) {
        q.enqueue(cycle * 3 + 1)
        q.enqueue(cycle * 3 + 2)
        q.enqueue(cycle * 3 + 3)
        q.dequeue()
        q.dequeue()
        q.dequeue()
      }
      expect(q.isEmpty()).toBe(true)
    })

    it('should maintain FIFO order through wrap-around', () => {
      const q = new ModularQueue<number>({ capacity: 3 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.dequeue()).toBe(1)
      q.enqueue(4)
      expect(q.dequeue()).toBe(2)
      q.enqueue(5)
      expect(q.toArray()).toEqual([3, 4, 5])
    })

    it('should handle peek/peekLast across wrap-around', () => {
      const q = new ModularQueue<number>({ capacity: 3 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.enqueue(4)
      expect(q.peek()).toBe(2)
      expect(q.peekLast()).toBe(4)
    })

    it('should handle indexOf across wrap-around', () => {
      const q = new ModularQueue<number>({ capacity: 3 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.enqueue(4)
      expect(q.indexOf(2)).toBe(0)
      expect(q.indexOf(3)).toBe(1)
      expect(q.indexOf(4)).toBe(2)
    })
  })

  describe('enqueue-dequeue interleaved', () => {
    it('should handle alternating enqueue/dequeue', () => {
      const q = new ModularQueue<number>({ capacity: 4 })
      q.enqueue(1)
      expect(q.dequeue()).toBe(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.dequeue()).toBe(2)
      expect(q.toArray()).toEqual([3])
    })

    it('should handle rapid fill and drain', () => {
      const q = new ModularQueue<number>({ capacity: 4 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
      expect(q.dequeue()).toBe(4)
      expect(q.isEmpty()).toBe(true)
    })

    it('should handle enqueue after partial drain', () => {
      const q = new ModularQueue<number>({ capacity: 4 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.enqueue(4)
      q.dequeue()
      q.enqueue(5)
      expect(q.toArray()).toEqual([3, 4, 5])
    })

    it('should work as a sliding window', () => {
      const q = new ModularQueue<number>({ capacity: 3, overwrite: true })
      for (let i = 0; i < 10; i++) {
        q.enqueue(i)
      }
      expect(q.toArray()).toEqual([7, 8, 9])
      expect(q.dequeue()).toBe(7)
      q.enqueue(10)
      expect(q.toArray()).toEqual([8, 9, 10])
    })
  })

  describe('FIFO order verification', () => {
    it('should maintain FIFO order for basic operations', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.enqueue(4)
      queue.enqueue(5)
      expect(queue.dequeue()).toBe(1)
      expect(queue.dequeue()).toBe(2)
      expect(queue.dequeue()).toBe(3)
      expect(queue.dequeue()).toBe(4)
      expect(queue.dequeue()).toBe(5)
    })

    it('should maintain FIFO order with interleaved operations', () => {
      queue.enqueue(1)
      queue.enqueue(2)
      queue.dequeue()
      queue.enqueue(3)
      queue.enqueue(4)
      queue.dequeue()
      queue.enqueue(5)
      expect(queue.toArray()).toEqual([3, 4, 5])
    })

    it('should maintain FIFO through many cycles', () => {
      const q = new ModularQueue<number>({ capacity: 5 })
      for (let i = 0; i < 100; i++) {
        q.enqueue(i)
        if (q.size() > 3) {
          q.dequeue()
        }
      }
      expect(q.size()).toBe(3)
      const arr = q.toArray()
      expect(arr[0]! < arr[1]!).toBe(true)
      expect(arr[1]! < arr[2]!).toBe(true)
    })
  })

  describe('large queues', () => {
    it('should handle 10000 enqueue operations', () => {
      const q = new ModularQueue<number>({ capacity: 10000 })
      for (let i = 0; i < 10000; i++) {
        q.enqueue(i)
      }
      expect(q.size()).toBe(10000)
      expect(q.peek()).toBe(0)
      expect(q.peekLast()).toBe(9999)
    })

    it('should handle large queue with overwrite', () => {
      const q = new ModularQueue<number>({ capacity: 100, overwrite: true })
      for (let i = 0; i < 10000; i++) {
        q.enqueue(i)
      }
      expect(q.size()).toBe(100)
      expect(q.peek()).toBe(9900)
      expect(q.peekLast()).toBe(9999)
    })

    it('should handle large dequeue operations', () => {
      const q = new ModularQueue<number>({ capacity: 5000 })
      for (let i = 0; i < 5000; i++) {
        q.enqueue(i)
      }
      for (let i = 0; i < 5000; i++) {
        expect(q.dequeue()).toBe(i)
      }
      expect(q.isEmpty()).toBe(true)
    })

    it('should handle large toArray', () => {
      const q = new ModularQueue<number>({ capacity: 5000 })
      for (let i = 0; i < 5000; i++) {
        q.enqueue(i)
      }
      const arr = q.toArray()
      expect(arr.length).toBe(5000)
      expect(arr[0]).toBe(0)
      expect(arr[4999]).toBe(4999)
    })

    it('should handle large clone', () => {
      const q = new ModularQueue<number>({ capacity: 5000 })
      for (let i = 0; i < 5000; i++) {
        q.enqueue(i)
      }
      const cloned = q.clone()
      expect(cloned.size()).toBe(5000)
      expect(cloned.peek()).toBe(0)
      expect(cloned.peekLast()).toBe(4999)
    })

    it('should handle large forEach', () => {
      const q = new ModularQueue<number>({ capacity: 5000 })
      for (let i = 0; i < 5000; i++) {
        q.enqueue(i)
      }
      let sum = 0
      q.forEach((item) => { sum += item })
      expect(sum).toBe((4999 * 5000) / 2)
    })

    it('should handle large indexOf', () => {
      const q = new ModularQueue<number>({ capacity: 5000 })
      for (let i = 0; i < 5000; i++) {
        q.enqueue(i)
      }
      expect(q.indexOf(4999)).toBe(4999)
      expect(q.indexOf(0)).toBe(0)
    })

    it('should handle interleaved enqueue/dequeue on large queue', () => {
      const q = new ModularQueue<number>({ capacity: 10000 })
      for (let i = 0; i < 10000; i++) {
        q.enqueue(i)
      }
      for (let i = 0; i < 5000; i++) {
        q.dequeue()
      }
      expect(q.size()).toBe(5000)
      expect(q.peek()).toBe(5000)
    })
  })
})
