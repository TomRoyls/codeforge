import { describe, it, expect } from 'vitest'
import { CountedQueue } from '../../src/core/counted-queue/index.js'

describe('CountedQueue', () => {
  describe('constructor', () => {
    it('should create empty queue', () => {
      const q = new CountedQueue<number>()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('should create queue with custom capacity', () => {
      const q = new CountedQueue<number>({ initialCapacity: 8 })
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('should throw on invalid capacity', () => {
      expect(() => new CountedQueue({ initialCapacity: 0 })).toThrow(RangeError)
      expect(() => new CountedQueue({ initialCapacity: -5 })).toThrow(RangeError)
    })
  })

  describe('enqueue', () => {
    it('should enqueue single element', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      expect(q.size).toBe(1)
      expect(q.isEmpty()).toBe(false)
    })

    it('should enqueue multiple elements', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.size).toBe(3)
    })

    it('should track frequencies correctly', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(1)
      q.enqueue(3)
      q.enqueue(1)
      expect(q.frequency(1)).toBe(3)
      expect(q.frequency(2)).toBe(1)
      expect(q.frequency(3)).toBe(1)
    })

    it('should handle string elements', () => {
      const q = new CountedQueue<string>()
      q.enqueue('a')
      q.enqueue('b')
      q.enqueue('a')
      expect(q.frequency('a')).toBe(2)
      expect(q.frequency('b')).toBe(1)
    })

    it('should handle object elements', () => {
      const q = new CountedQueue<{ id: number }>()
      const obj1 = { id: 1 }
      const obj2 = { id: 2 }
      q.enqueue(obj1)
      q.enqueue(obj2)
      q.enqueue(obj1)
      expect(q.frequency(obj1)).toBe(2)
      expect(q.frequency(obj2)).toBe(1)
    })
  })

  describe('dequeue', () => {
    it('should dequeue from empty queue', () => {
      const q = new CountedQueue<number>()
      expect(q.dequeue()).toBe(undefined)
    })

    it('should dequeue single element', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      const element = q.dequeue()
      expect(element).toBe(1)
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('should dequeue in FIFO order', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
    })

    it('should update frequencies on dequeue', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(1)
      expect(q.frequency(1)).toBe(3)
      q.dequeue()
      expect(q.frequency(1)).toBe(2)
      q.dequeue()
      expect(q.frequency(1)).toBe(1)
    })

    it('should remove from frequencies when count reaches 0', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      expect(q.frequency(1)).toBe(1)
      expect(q.contains(1)).toBe(true)
      q.dequeue()
      expect(q.frequency(1)).toBe(0)
      expect(q.contains(1)).toBe(false)
    })
  })

  describe('peek', () => {
    it('should peek empty queue', () => {
      const q = new CountedQueue<number>()
      expect(q.peek()).toBe(undefined)
    })

    it('should peek without removing', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      expect(q.peek()).toBe(1)
      expect(q.size).toBe(2)
    })

    it('should peek after dequeue', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect(q.peek()).toBe(2)
    })
  })

  describe('peekBack', () => {
    it('should peek back empty queue', () => {
      const q = new CountedQueue<number>()
      expect(q.peekBack()).toBe(undefined)
    })

    it('should peek back element', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.peekBack()).toBe(3)
    })

    it('should peek back without removing', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      expect(q.peekBack()).toBe(2)
      expect(q.size).toBe(2)
    })

    it('should peek back after enqueue', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      expect(q.peekBack()).toBe(2)
      q.enqueue(3)
      expect(q.peekBack()).toBe(3)
    })
  })

  describe('size', () => {
    it('should return 0 for empty queue', () => {
      const q = new CountedQueue<number>()
      expect(q.size).toBe(0)
    })

    it('should track size correctly', () => {
      const q = new CountedQueue<number>()
      expect(q.size).toBe(0)
      q.enqueue(1)
      expect(q.size).toBe(1)
      q.enqueue(2)
      expect(q.size).toBe(2)
      q.enqueue(3)
      expect(q.size).toBe(3)
    })

    it('should decrease on dequeue', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.size).toBe(3)
      q.dequeue()
      expect(q.size).toBe(2)
      q.dequeue()
      expect(q.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty queue', () => {
      const q = new CountedQueue<number>()
      expect(q.isEmpty()).toBe(true)
    })

    it('should return false after enqueue', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      expect(q.isEmpty()).toBe(false)
    })

    it('should return true after dequeueing all', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.dequeue()
      expect(q.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear empty queue', () => {
      const q = new CountedQueue<number>()
      q.clear()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('should clear non-empty queue', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.clear()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('should clear frequencies', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(1)
      expect(q.uniqueCount).toBe(2)
      q.clear()
      expect(q.uniqueCount).toBe(0)
      expect(q.frequency(1)).toBe(0)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty queue', () => {
      const q = new CountedQueue<number>()
      expect(q.toArray()).toEqual([])
    })

    it('should return array with correct order', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('should maintain order after dequeues', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.dequeue()
      expect(q.toArray()).toEqual([2, 3, 4])
    })

    it('should not modify original queue', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      const arr = q.toArray()
      arr.push(3)
      expect(q.toArray()).toEqual([1, 2])
    })
  })

  describe('contains', () => {
    it('should return false for empty queue', () => {
      const q = new CountedQueue<number>()
      expect(q.contains(1)).toBe(false)
    })

    it('should return true for existing element', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      expect(q.contains(1)).toBe(true)
      expect(q.contains(2)).toBe(true)
    })

    it('should return false for non-existent element', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      expect(q.contains(3)).toBe(false)
    })

    it('should return false after dequeue', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      expect(q.contains(1)).toBe(true)
      q.dequeue()
      expect(q.contains(1)).toBe(false)
    })

    it('should handle string elements', () => {
      const q = new CountedQueue<string>()
      q.enqueue('hello')
      expect(q.contains('hello')).toBe(true)
      expect(q.contains('world')).toBe(false)
    })
  })

  describe('frequency', () => {
    it('should return 0 for non-existent element', () => {
      const q = new CountedQueue<number>()
      expect(q.frequency(1)).toBe(0)
    })

    it('should return correct frequency', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(1)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(1)
      expect(q.frequency(1)).toBe(4)
      expect(q.frequency(2)).toBe(1)
    })

    it('should update frequency on dequeue', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(1)
      q.enqueue(1)
      expect(q.frequency(1)).toBe(3)
      q.dequeue()
      expect(q.frequency(1)).toBe(2)
    })

    it('should return 0 after element removed', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(1)
      q.dequeue()
      q.dequeue()
      expect(q.frequency(1)).toBe(0)
    })
  })

  describe('uniqueCount', () => {
    it('should return 0 for empty queue', () => {
      const q = new CountedQueue<number>()
      expect(q.uniqueCount).toBe(0)
    })

    it('should count unique elements', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.uniqueCount).toBe(3)
    })

    it('should count correctly with duplicates', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(1)
      q.enqueue(3)
      q.enqueue(2)
      expect(q.uniqueCount).toBe(3)
    })

    it('should update on dequeue', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(1)
      expect(q.uniqueCount).toBe(2)
      q.dequeue()
      q.dequeue()
      expect(q.uniqueCount).toBe(1)
    })

    it('should update on clear', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.uniqueCount).toBe(3)
      q.clear()
      expect(q.uniqueCount).toBe(0)
    })
  })

  describe('mostFrequent', () => {
    it('should return empty array for empty queue', () => {
      const q = new CountedQueue<number>()
      expect(q.mostFrequent()).toEqual([])
    })

    it('should return single most frequent element', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(1)
      q.enqueue(3)
      expect(q.mostFrequent()).toEqual([1])
    })

    it('should return multiple elements with same frequency', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.mostFrequent()).toEqual([1, 2])
    })

    it('should sort by first occurrence', () => {
      const q = new CountedQueue<number>()
      q.enqueue(3)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(1)
      q.enqueue(2)
      expect(q.mostFrequent()).toEqual([3, 1, 2])
    })

    it.skip('should update after dequeue', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(1)
      q.enqueue(1)
      expect(q.mostFrequent()).toEqual([1])
      q.dequeue()
      q.dequeue()
      expect(q.mostFrequent()).toEqual([1])
    })

    it('should handle all elements with same frequency', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.mostFrequent()).toEqual([1, 2, 3])
    })
  })

  describe('leastFrequent', () => {
    it('should return empty array for empty queue', () => {
      const q = new CountedQueue<number>()
      expect(q.leastFrequent()).toEqual([])
    })

    it('should return single least frequent element', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(1)
      expect(q.leastFrequent()).toEqual([2])
    })

    it('should return multiple elements with same frequency', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(1)
      expect(q.leastFrequent()).toEqual([2, 3])
    })

    it('should sort by first occurrence', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(1)
      q.enqueue(3)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.leastFrequent()).toEqual([1, 2, 3])
    })

    it('should update after dequeue', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(2)
      q.dequeue()
      expect(q.leastFrequent()).toEqual([1])
    })

    it('should handle all elements with same frequency', () => {
      const q = new CountedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.leastFrequent()).toEqual([1, 2, 3])
    })
  })

  describe('static from', () => {
    it('should create queue from array', () => {
      const q = CountedQueue.from([1, 2, 3])
      expect(q.toArray()).toEqual([1, 2, 3])
      expect(q.size).toBe(3)
    })

    it('should create empty queue from empty array', () => {
      const q = CountedQueue.from([])
      expect(q.toArray()).toEqual([])
      expect(q.isEmpty()).toBe(true)
    })

    it('should track frequencies from array', () => {
      const q = CountedQueue.from([1, 2, 1, 3, 1])
      expect(q.frequency(1)).toBe(3)
      expect(q.frequency(2)).toBe(1)
      expect(q.frequency(3)).toBe(1)
    })

    it('should use custom capacity', () => {
      const q = CountedQueue.from([1, 2, 3], { initialCapacity: 4 })
      expect(q.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('circular buffer behavior', () => {
    it('should handle wrap-around correctly', () => {
      const q = new CountedQueue<number>({ initialCapacity: 4 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.dequeue()
      q.enqueue(5)
      expect(q.toArray()).toEqual([2, 3, 4, 5])
    })

    it('should maintain order through wrap-around', () => {
      const q = new CountedQueue<number>({ initialCapacity: 3 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.enqueue(4)
      q.dequeue()
      q.enqueue(5)
      expect(q.toArray()).toEqual([3, 4, 5])
    })

    it('should track frequencies through wrap-around', () => {
      const q = new CountedQueue<number>({ initialCapacity: 4 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.dequeue()
      q.enqueue(1)
      expect(q.frequency(1)).toBe(1)
    })
  })

  describe('stress tests', () => {
    it('should handle large number of elements', () => {
      const q = new CountedQueue<number>()
      for (let i = 0; i < 1000; i++) {
        q.enqueue(i)
      }
      expect(q.size).toBe(1000)
      expect(q.uniqueCount).toBe(1000)
    })

    it('should handle many duplicate elements', () => {
      const q = new CountedQueue<number>()
      for (let i = 0; i < 100; i++) {
        q.enqueue(5)
      }
      expect(q.size).toBe(100)
      expect(q.frequency(5)).toBe(100)
      expect(q.uniqueCount).toBe(1)
    })

    it('should handle mixed enqueue/dequeue operations', () => {
      const q = new CountedQueue<number>()
      for (let i = 0; i < 1000; i++) {
        q.enqueue(i)
        if (i % 3 === 0) {
          q.dequeue()
        }
      }
      expect(q.size).toBe(666)
    })

    it('should handle circular buffer with many operations', () => {
      const q = new CountedQueue<number>({ initialCapacity: 8 })
      for (let i = 0; i < 100; i++) {
        q.enqueue(i)
        q.dequeue()
      }
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('should resize when capacity reached', () => {
      const q = new CountedQueue<number>({ initialCapacity: 4 })
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.enqueue(4)
      q.enqueue(5)
      expect(q.size).toBe(5)
      expect(q.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should maintain data integrity through multiple resizes', () => {
      const q = new CountedQueue<number>({ initialCapacity: 2 })
      for (let i = 0; i < 20; i++) {
        q.enqueue(i)
      }
      expect(q.toArray()).toEqual(Array.from({ length: 20 }, (_, i) => i))
      expect(q.size).toBe(20)
    })
  })

  describe('edge cases', () => {
    it('should handle null and undefined values', () => {
      const q = new CountedQueue<number | null>()
      q.enqueue(null)
      q.enqueue(1)
      q.enqueue(null)
      expect(q.size).toBe(3)
      expect(q.frequency(null)).toBe(2)
      expect(q.contains(null)).toBe(true)
    })

    it('should handle NaN values', () => {
      const q = new CountedQueue<number>()
      q.enqueue(NaN)
      q.enqueue(1)
      q.enqueue(NaN)
      expect(q.size).toBe(3)
      expect(q.frequency(NaN)).toBe(2)
    })

    it('should handle negative numbers', () => {
      const q = new CountedQueue<number>()
      q.enqueue(-1)
      q.enqueue(-2)
      q.enqueue(-1)
      expect(q.frequency(-1)).toBe(2)
      expect(q.mostFrequent()).toEqual([-1])
    })

    it('should handle large numbers', () => {
      const q = new CountedQueue<number>()
      q.enqueue(Number.MAX_SAFE_INTEGER)
      q.enqueue(1)
      q.enqueue(Number.MAX_SAFE_INTEGER)
      expect(q.frequency(Number.MAX_SAFE_INTEGER)).toBe(2)
    })
  })
})
