import { describe, expect, it } from 'vitest'
import { AugmentedQueue } from '../../../src/core/augmented-queue/index.js'

describe('AugmentedQueue', () => {
  it('should create empty queue with no options', () => {
    const queue = new AugmentedQueue()
    expect(queue.size()).toBe(0)
    expect(queue.isEmpty()).toBe(true)
  })

  it('should create queue with initial elements via options', () => {
    const queue = new AugmentedQueue({ elements: [1, 2, 3] })
    expect(queue.size()).toBe(3)
    expect(queue.isEmpty()).toBe(false)
    expect(queue.peek()).toBe(1)
  })

  it('should enqueue single element', () => {
    const queue = new AugmentedQueue()
    queue.enqueue(5)
    expect(queue.size()).toBe(1)
    expect(queue.peek()).toBe(5)
  })

  it('should enqueue multiple elements', () => {
    const queue = new AugmentedQueue()
    queue.enqueue(1)
    queue.enqueue(2)
    queue.enqueue(3)
    expect(queue.size()).toBe(3)
  })

  it('should dequeue single element', () => {
    const queue = new AugmentedQueue()
    queue.enqueue(1)
    const value = queue.dequeue()
    expect(value).toBe(1)
    expect(queue.size()).toBe(0)
  })

  it('should dequeue elements in FIFO order', () => {
    const queue = new AugmentedQueue()
    queue.enqueue(1)
    queue.enqueue(2)
    queue.enqueue(3)
    expect(queue.dequeue()).toBe(1)
    expect(queue.dequeue()).toBe(2)
    expect(queue.dequeue()).toBe(3)
  })

  it('should throw when dequeuing from empty queue', () => {
    const queue = new AugmentedQueue()
    expect(() => queue.dequeue()).toThrow('AugmentedQueue is empty')
  })

  it('should peek at front element', () => {
    const queue = new AugmentedQueue({ elements: [1, 2, 3] })
    expect(queue.peek()).toBe(1)
    expect(queue.size()).toBe(3)
  })

  it('should peek at back element', () => {
    const queue = new AugmentedQueue({ elements: [1, 2, 3] })
    expect(queue.peekBack()).toBe(3)
    expect(queue.size()).toBe(3)
  })

  it('should throw when peeking at empty queue', () => {
    const queue = new AugmentedQueue()
    expect(() => queue.peek()).toThrow('AugmentedQueue is empty')
  })

  it('should throw when peeking back at empty queue', () => {
    const queue = new AugmentedQueue()
    expect(() => queue.peekBack()).toThrow('AugmentedQueue is empty')
  })

  it('should return correct size', () => {
    const queue = new AugmentedQueue()
    expect(queue.size()).toBe(0)
    queue.enqueue(1)
    expect(queue.size()).toBe(1)
    queue.enqueue(2)
    expect(queue.size()).toBe(2)
  })

  it('should return true when queue is empty', () => {
    const queue = new AugmentedQueue()
    expect(queue.isEmpty()).toBe(true)
  })

  it('should return false when queue is not empty', () => {
    const queue = new AugmentedQueue({ elements: [1] })
    expect(queue.isEmpty()).toBe(false)
  })

  it('should clear queue', () => {
    const queue = new AugmentedQueue({ elements: [1, 2, 3] })
    queue.clear()
    expect(queue.size()).toBe(0)
    expect(queue.isEmpty()).toBe(true)
  })

  it('should convert to array in FIFO order', () => {
    const queue = new AugmentedQueue({ elements: [1, 2, 3, 4, 5] })
    const arr = queue.toArray()
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('should return empty array for empty queue', () => {
    const queue = new AugmentedQueue()
    expect(queue.toArray()).toEqual([])
  })

  it('should return min value', () => {
    const queue = new AugmentedQueue({ elements: [3, 1, 4, 1, 5, 9, 2, 6] })
    expect(queue.min()).toBe(1)
  })

  it('should throw when getting min from empty queue', () => {
    const queue = new AugmentedQueue()
    expect(() => queue.min()).toThrow('AugmentedQueue is empty')
  })

  it('should return max value', () => {
    const queue = new AugmentedQueue({ elements: [3, 1, 4, 1, 5, 9, 2, 6] })
    expect(queue.max()).toBe(9)
  })

  it('should throw when getting max from empty queue', () => {
    const queue = new AugmentedQueue()
    expect(() => queue.max()).toThrow('AugmentedQueue is empty')
  })

  it('should return sum of all elements', () => {
    const queue = new AugmentedQueue({ elements: [1, 2, 3, 4, 5] })
    expect(queue.sum()).toBe(15)
  })

  it('should throw when getting sum from empty queue', () => {
    const queue = new AugmentedQueue()
    expect(() => queue.sum()).toThrow('AugmentedQueue is empty')
  })

  it('should return average of elements', () => {
    const queue = new AugmentedQueue({ elements: [1, 2, 3, 4, 5] })
    expect(queue.average()).toBe(3)
  })

  it('should return average with decimals', () => {
    const queue = new AugmentedQueue({ elements: [1, 2] })
    expect(queue.average()).toBe(1.5)
  })

  it('should throw when getting average from empty queue', () => {
    const queue = new AugmentedQueue()
    expect(() => queue.average()).toThrow('AugmentedQueue is empty')
  })

  it('should clone queue with same elements', () => {
    const queue = new AugmentedQueue({ elements: [1, 2, 3] })
    const cloned = queue.clone()
    expect(cloned.toArray()).toEqual([1, 2, 3])
    expect(cloned.size()).toBe(3)
  })

  it('should produce independent clone', () => {
    const queue = new AugmentedQueue({ elements: [1, 2, 3] })
    const cloned = queue.clone()
    cloned.enqueue(4)
    cloned.dequeue()
    expect(queue.toArray()).toEqual([1, 2, 3])
    expect(cloned.toArray()).toEqual([2, 3, 4])
  })

  it('should iterate with forEach in FIFO order', () => {
    const queue = new AugmentedQueue({ elements: [1, 2, 3] })
    const results: number[] = []
    queue.forEach((item) => results.push(item))
    expect(results).toEqual([1, 2, 3])
  })

  it('should provide correct index in forEach', () => {
    const queue = new AugmentedQueue({ elements: [10, 20, 30] })
    const indices: number[] = []
    queue.forEach((_, index) => indices.push(index))
    expect(indices).toEqual([0, 1, 2])
  })

  it('should iterate with for...of in FIFO order', () => {
    const queue = new AugmentedQueue({ elements: [1, 2, 3] })
    const results: number[] = []
    for (const item of queue) {
      results.push(item)
    }
    expect(results).toEqual([1, 2, 3])
  })

  it('should create queue from array using static method', () => {
    const queue = AugmentedQueue.fromArray([1, 2, 3, 4, 5])
    expect(queue.toArray()).toEqual([1, 2, 3, 4, 5])
  })

  it('should create empty queue from empty array', () => {
    const queue = AugmentedQueue.fromArray([])
    expect(queue.size()).toBe(0)
    expect(queue.isEmpty()).toBe(true)
  })

  it('should handle single element queue', () => {
    const queue = new AugmentedQueue({ elements: [42] })
    expect(queue.peek()).toBe(42)
    expect(queue.peekBack()).toBe(42)
    expect(queue.min()).toBe(42)
    expect(queue.max()).toBe(42)
    expect(queue.sum()).toBe(42)
    expect(queue.average()).toBe(42)
  })

  it('should maintain min after mixed enqueue and dequeue', () => {
    const queue = new AugmentedQueue()
    queue.enqueue(5)
    queue.enqueue(3)
    queue.enqueue(7)
    queue.enqueue(2)
    expect(queue.min()).toBe(2)
    queue.dequeue()
    expect(queue.min()).toBe(2)
    queue.dequeue()
    expect(queue.min()).toBe(2)
  })

  it('should maintain max after mixed enqueue and dequeue', () => {
    const queue = new AugmentedQueue()
    queue.enqueue(5)
    queue.enqueue(10)
    queue.enqueue(7)
    queue.enqueue(3)
    expect(queue.max()).toBe(10)
    queue.dequeue()
    expect(queue.max()).toBe(10)
    queue.dequeue()
    expect(queue.max()).toBe(7)
  })

  it('should maintain sum after mixed enqueue and dequeue', () => {
    const queue = new AugmentedQueue()
    queue.enqueue(1)
    queue.enqueue(2)
    queue.enqueue(3)
    expect(queue.sum()).toBe(6)
    queue.dequeue()
    expect(queue.sum()).toBe(5)
    queue.enqueue(4)
    expect(queue.sum()).toBe(9)
  })

  it('should maintain average after mixed enqueue and dequeue', () => {
    const queue = new AugmentedQueue()
    queue.enqueue(1)
    queue.enqueue(2)
    queue.enqueue(3)
    expect(queue.average()).toBe(2)
    queue.dequeue()
    expect(queue.average()).toBe(2.5)
    queue.enqueue(3)
    expect(queue.average()).toBe(8/3)
  })

  it('should handle negative numbers', () => {
    const queue = new AugmentedQueue({ elements: [-3, -1, -4, -1, -5, -9, -2, -6] })
    expect(queue.min()).toBe(-9)
    expect(queue.max()).toBe(-1)
    expect(queue.sum()).toBe(-31)
    expect(queue.average()).toBe(-3.875)
  })

  it('should handle mixed positive and negative numbers', () => {
    const queue = new AugmentedQueue({ elements: [-5, 10, -3, 8, -2] })
    expect(queue.min()).toBe(-5)
    expect(queue.max()).toBe(10)
    expect(queue.sum()).toBe(8)
  })

  it('should handle interleaved enqueue and dequeue operations', () => {
    const queue = new AugmentedQueue()
    queue.enqueue(1)
    queue.enqueue(2)
    expect(queue.dequeue()).toBe(1)
    queue.enqueue(3)
    expect(queue.dequeue()).toBe(2)
    expect(queue.dequeue()).toBe(3)
    expect(queue.isEmpty()).toBe(true)
  })

  it('should handle large number of enqueue operations', () => {
    const queue = new AugmentedQueue()
    for (let i = 1; i <= 1000; i++) {
      queue.enqueue(i)
    }
    expect(queue.size()).toBe(1000)
    expect(queue.min()).toBe(1)
    expect(queue.max()).toBe(1000)
  })

  it('should handle large number of dequeue operations', () => {
    const queue = new AugmentedQueue()
    for (let i = 1; i <= 1000; i++) {
      queue.enqueue(i)
    }
    for (let i = 1; i <= 500; i++) {
      expect(queue.dequeue()).toBe(i)
    }
    expect(queue.size()).toBe(500)
    expect(queue.peek()).toBe(501)
  })

  it('should maintain correctness after alternating operations', () => {
    const queue = new AugmentedQueue()
    for (let i = 1; i <= 10; i++) {
      queue.enqueue(i)
      queue.dequeue()
    }
    expect(queue.isEmpty()).toBe(true)
    queue.enqueue(100)
    expect(queue.peek()).toBe(100)
  })
})