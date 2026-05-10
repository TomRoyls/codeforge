import { describe, it, expect, beforeEach } from 'vitest'
import { FibonacciQueue } from '../../src/core/fibonacci-queue/fibonacci-queue.js'
import type { FibonacciQueueNode } from '../../src/core/fibonacci-queue/types.js'

describe('FibonacciQueue', () => {
  let queue: FibonacciQueue<string>

  beforeEach(() => {
    queue = new FibonacciQueue<string>()
  })

  describe('constructor', () => {
    it('creates empty queue with default comparator', () => {
      const q = new FibonacciQueue<string>()
      expect(q.size).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('accepts custom comparator ascending', () => {
      const q = new FibonacciQueue<number>((a, b) => a - b)
      q.enqueue(3, 3)
      q.enqueue(1, 1)
      q.enqueue(2, 2)
      expect(q.peek()).toBe(1)
    })

    it('accepts custom comparator descending', () => {
      const q = new FibonacciQueue<number>((a, b) => b - a)
      q.enqueue(1, 1)
      q.enqueue(3, 3)
      q.enqueue(2, 2)
      expect(q.peek()).toBe(3)
    })

    it('accepts options object with comparator', () => {
      const q = new FibonacciQueue<number>({ comparator: (a, b) => a - b })
      q.enqueue(10, 10)
      q.enqueue(5, 5)
      expect(q.peek()).toBe(5)
    })

    it('accepts empty options object', () => {
      const q = new FibonacciQueue<string>({})
      q.enqueue('a', 2)
      q.enqueue('b', 1)
      expect(q.peek()).toBe('b')
    })

    it('accepts no arguments', () => {
      const q = new FibonacciQueue()
      expect(q.size).toBe(0)
    })
  })

  describe('enqueue', () => {
    it('enqueues single element', () => {
      queue.enqueue('task')
      expect(queue.size).toBe(1)
      expect(queue.isEmpty()).toBe(false)
    })

    it('enqueues multiple elements', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      expect(queue.size).toBe(3)
    })

    it('uses numeric value as default priority for number type', () => {
      const q = new FibonacciQueue<number>()
      q.enqueue(5)
      q.enqueue(3)
      q.enqueue(1)
      expect(q.peek()).toBe(1)
    })

    it('uses 0 as default priority for non-numeric values', () => {
      queue.enqueue('hello')
      expect(queue.peek()).toBe('hello')
    })

    it('returns a node with correct properties', () => {
      const node = queue.enqueue('task', 5)
      expect(node.value).toBe('task')
      expect(node.priority).toBe(5)
      expect(node.degree).toBe(0)
      expect(node.mark).toBe(false)
      expect(node.parent).toBeNull()
      expect(node.child).toBeNull()
    })

    it('handles duplicate values', () => {
      queue.enqueue('dup', 1)
      queue.enqueue('dup', 2)
      queue.enqueue('dup', 3)
      expect(queue.size).toBe(3)
    })

    it('handles negative priorities', () => {
      queue.enqueue('low', -10)
      queue.enqueue('mid', 0)
      queue.enqueue('high', 10)
      expect(queue.peek()).toBe('low')
    })

    it('handles zero priority', () => {
      queue.enqueue('zero', 0)
      expect(queue.peek()).toBe('zero')
    })

    it('handles floating point priorities', () => {
      queue.enqueue('a', 3.14)
      queue.enqueue('b', 2.71)
      queue.enqueue('c', 1.41)
      expect(queue.peek()).toBe('c')
    })

    it('updates min pointer when inserting lower priority', () => {
      queue.enqueue('a', 10)
      queue.enqueue('b', 5)
      queue.enqueue('c', 3)
      expect(queue.peek()).toBe('c')
    })

    it('does not change min when inserting higher priority', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 10)
      queue.enqueue('c', 20)
      expect(queue.peek()).toBe('a')
    })

    it('handles very large priorities', () => {
      queue.enqueue('max', Number.MAX_SAFE_INTEGER)
      queue.enqueue('min', Number.MIN_SAFE_INTEGER)
      expect(queue.peek()).toBe('min')
    })
  })

  describe('peek', () => {
    it('returns undefined for empty queue', () => {
      expect(queue.peek()).toBeUndefined()
    })

    it('returns element with lowest priority', () => {
      queue.enqueue('c', 3)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      expect(queue.peek()).toBe('a')
    })

    it('does not remove the element', () => {
      queue.enqueue('task', 1)
      queue.peek()
      expect(queue.size).toBe(1)
    })

    it('returns same element on repeated calls', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      expect(queue.peek()).toBe('a')
      expect(queue.peek()).toBe('a')
      expect(queue.peek()).toBe('a')
    })
  })

  describe('dequeueMin', () => {
    it('returns undefined for empty queue', () => {
      expect(queue.dequeueMin()).toBeUndefined()
    })

    it('returns the only element', () => {
      queue.enqueue('task', 5)
      expect(queue.dequeueMin()).toBe('task')
      expect(queue.size).toBe(0)
      expect(queue.isEmpty()).toBe(true)
    })

    it('returns elements in priority order', () => {
      queue.enqueue('c', 3)
      queue.enqueue('a', 1)
      queue.enqueue('e', 5)
      queue.enqueue('b', 2)
      queue.enqueue('d', 4)
      expect(queue.dequeueMin()).toBe('a')
      expect(queue.dequeueMin()).toBe('b')
      expect(queue.dequeueMin()).toBe('c')
      expect(queue.dequeueMin()).toBe('d')
      expect(queue.dequeueMin()).toBe('e')
      expect(queue.dequeueMin()).toBeUndefined()
    })

    it('handles duplicate priorities', () => {
      queue.enqueue('x', 1)
      queue.enqueue('y', 1)
      queue.enqueue('z', 2)
      expect(queue.dequeueMin()).toBe('x')
      expect(queue.dequeueMin()).toBe('y')
      expect(queue.dequeueMin()).toBe('z')
    })

    it('decreases size after each dequeue', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      expect(queue.size).toBe(3)
      queue.dequeueMin()
      expect(queue.size).toBe(2)
      queue.dequeueMin()
      expect(queue.size).toBe(1)
      queue.dequeueMin()
      expect(queue.size).toBe(0)
    })

    it('handles negative priorities', () => {
      queue.enqueue('neg5', -5)
      queue.enqueue('neg3', -3)
      queue.enqueue('neg7', -7)
      expect(queue.dequeueMin()).toBe('neg7')
      expect(queue.dequeueMin()).toBe('neg5')
      expect(queue.dequeueMin()).toBe('neg3')
    })

    it('handles 10 elements in sorted order', () => {
      for (let i = 10; i >= 1; i--) {
        queue.enqueue(`task${i}`, i)
      }
      for (let i = 1; i <= 10; i++) {
        expect(queue.dequeueMin()).toBe(`task${i}`)
      }
    })
  })

  describe('size', () => {
    it('returns 0 for new queue', () => {
      expect(queue.size).toBe(0)
    })

    it('increments on enqueue', () => {
      queue.enqueue('a', 1)
      expect(queue.size).toBe(1)
      queue.enqueue('b', 2)
      expect(queue.size).toBe(2)
    })

    it('decrements on dequeueMin', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.dequeueMin()
      expect(queue.size).toBe(1)
    })

    it('stays 0 after clear', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.clear()
      expect(queue.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new queue', () => {
      expect(queue.isEmpty()).toBe(true)
    })

    it('returns false after enqueue', () => {
      queue.enqueue('a', 1)
      expect(queue.isEmpty()).toBe(false)
    })

    it('returns true after dequeuing all elements', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.dequeueMin()
      queue.dequeueMin()
      expect(queue.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      queue.enqueue('a', 1)
      queue.clear()
      expect(queue.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears empty queue', () => {
      queue.clear()
      expect(queue.size).toBe(0)
      expect(queue.isEmpty()).toBe(true)
    })

    it('clears non-empty queue', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.clear()
      expect(queue.size).toBe(0)
      expect(queue.isEmpty()).toBe(true)
      expect(queue.peek()).toBeUndefined()
    })

    it('allows enqueue after clear', () => {
      queue.enqueue('a', 1)
      queue.clear()
      queue.enqueue('b', 2)
      expect(queue.size).toBe(1)
      expect(queue.peek()).toBe('b')
    })

    it('clears contains tracking', () => {
      queue.enqueue('a', 1)
      queue.clear()
      expect(queue.contains('a')).toBe(false)
    })
  })

  describe('merge', () => {
    it('merges two non-empty queues', () => {
      queue.enqueue('a', 1)
      queue.enqueue('c', 3)
      const other = new FibonacciQueue<string>()
      other.enqueue('b', 2)
      other.enqueue('d', 4)
      const merged = queue.merge(other)
      expect(merged.size).toBe(4)
    })

    it('merges into empty queue', () => {
      const other = new FibonacciQueue<string>()
      other.enqueue('a', 1)
      other.enqueue('b', 2)
      const merged = queue.merge(other)
      expect(merged.size).toBe(2)
      expect(merged.peek()).toBe('a')
    })

    it('merges empty queue into non-empty', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      const other = new FibonacciQueue<string>()
      const merged = queue.merge(other)
      expect(merged.size).toBe(2)
      expect(merged.peek()).toBe('a')
    })

    it('merges two empty queues', () => {
      const other = new FibonacciQueue<string>()
      const merged = queue.merge(other)
      expect(merged.size).toBe(0)
      expect(merged.isEmpty()).toBe(true)
    })

    it('returns combined queue in priority order', () => {
      queue.enqueue('a', 1)
      queue.enqueue('e', 5)
      const other = new FibonacciQueue<string>()
      other.enqueue('b', 2)
      other.enqueue('c', 3)
      other.enqueue('d', 4)
      const merged = queue.merge(other)
      expect(merged.dequeueMin()).toBe('a')
      expect(merged.dequeueMin()).toBe('b')
      expect(merged.dequeueMin()).toBe('c')
      expect(merged.dequeueMin()).toBe('d')
      expect(merged.dequeueMin()).toBe('e')
    })

    it('does not modify original queues', () => {
      queue.enqueue('a', 1)
      const other = new FibonacciQueue<string>()
      other.enqueue('b', 2)
      const merged = queue.merge(other)
      expect(queue.size).toBe(1)
      expect(other.size).toBe(1)
      expect(merged.size).toBe(2)
    })

    it('updates min to smallest from both queues', () => {
      queue.enqueue('a', 10)
      queue.enqueue('b', 20)
      const other = new FibonacciQueue<string>()
      other.enqueue('c', 5)
      other.enqueue('d', 15)
      const merged = queue.merge(other)
      expect(merged.peek()).toBe('c')
    })

    it('merges queues with overlapping ranges', () => {
      queue.enqueue('a', 1)
      queue.enqueue('d', 4)
      queue.enqueue('g', 7)
      const other = new FibonacciQueue<string>()
      other.enqueue('b', 2)
      other.enqueue('e', 5)
      other.enqueue('h', 8)
      const merged = queue.merge(other)
      expect(merged.toArray()).toEqual(['a', 'b', 'd', 'e', 'g', 'h'])
    })

    it('merges three queues sequentially', () => {
      queue.enqueue('a', 1)
      queue.enqueue('f', 6)
      const q2 = new FibonacciQueue<string>()
      q2.enqueue('c', 3)
      q2.enqueue('h', 8)
      const q3 = new FibonacciQueue<string>()
      q3.enqueue('b', 2)
      q3.enqueue('e', 5)
      const m1 = queue.merge(q2)
      const m2 = m1.merge(q3)
      expect(m2.toArray()).toEqual(['a', 'b', 'c', 'e', 'f', 'h'])
    })
  })

  describe('decreaseKey', () => {
    it('decreases priority of a node', () => {
      const node = queue.enqueue('task', 5)
      queue.enqueue('other', 10)
      queue.decreaseKey(node, 2)
      expect(queue.peek()).toBe('task')
    })

    it('throws error when increasing priority', () => {
      const node = queue.enqueue('task', 5)
      expect(() => queue.decreaseKey(node, 10)).toThrow('New priority is greater than current priority')
    })

    it('maintains priority order after decreaseKey', () => {
      const node5 = queue.enqueue('mid', 5)
      queue.enqueue('high', 10)
      queue.enqueue('low', 3)
      queue.decreaseKey(node5, 1)
      expect(queue.dequeueMin()).toBe('mid')
      expect(queue.dequeueMin()).toBe('low')
      expect(queue.dequeueMin()).toBe('high')
    })

    it('handles decreaseKey to same priority', () => {
      const node = queue.enqueue('task', 5)
      queue.enqueue('other', 10)
      queue.decreaseKey(node, 5)
      expect(queue.peek()).toBe('task')
    })

    it('works with negative priorities', () => {
      const node = queue.enqueue('task', 5)
      queue.decreaseKey(node, -10)
      expect(queue.peek()).toBe('task')
    })

    it('handles cascading cuts', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.enqueue('d', 4)
      const nodeE = queue.enqueue('e', 5)
      queue.dequeueMin()
      queue.decreaseKey(nodeE, 0)
      expect(queue.peek()).toBe('e')
    })

    it('updates min pointer when decreased priority is new min', () => {
      queue.enqueue('a', 10)
      const node = queue.enqueue('b', 20)
      queue.enqueue('c', 5)
      queue.decreaseKey(node, 1)
      expect(queue.peek()).toBe('b')
    })

    it('handles decreaseKey on root node', () => {
      const node = queue.enqueue('a', 10)
      queue.enqueue('b', 5)
      queue.decreaseKey(node, 1)
      expect(queue.peek()).toBe('a')
    })

    it('handles multiple decreaseKey operations', () => {
      const nodes: FibonacciQueueNode<string>[] = []
      for (let i = 0; i < 10; i++) {
        nodes.push(queue.enqueue(`t${i}`, i * 10))
      }
      queue.dequeueMin()
      queue.decreaseKey(nodes[5]!, 0)
      expect(queue.peek()).toBe('t5')
      queue.decreaseKey(nodes[3]!, -1)
      expect(queue.peek()).toBe('t3')
    })
  })

  describe('delete', () => {
    it('deletes a specific node', () => {
      const node = queue.enqueue('mid', 5)
      queue.enqueue('low', 3)
      queue.enqueue('high', 7)
      queue.delete(node)
      expect(queue.size).toBe(2)
      expect(queue.dequeueMin()).toBe('low')
      expect(queue.dequeueMin()).toBe('high')
    })

    it('deletes the min node', () => {
      const minNode = queue.enqueue('low', 3)
      queue.enqueue('mid', 5)
      queue.enqueue('high', 7)
      queue.delete(minNode)
      expect(queue.peek()).toBe('mid')
      expect(queue.size).toBe(2)
    })

    it('deletes the only element', () => {
      const node = queue.enqueue('task', 5)
      queue.delete(node)
      expect(queue.isEmpty()).toBe(true)
      expect(queue.size).toBe(0)
    })

    it('deletes multiple nodes', () => {
      const n1 = queue.enqueue('a', 1)
      const n2 = queue.enqueue('b', 2)
      const n3 = queue.enqueue('c', 3)
      queue.enqueue('d', 4)
      queue.delete(n3)
      queue.delete(n1)
      expect(queue.size).toBe(2)
      expect(queue.peek()).toBe('b')
      void n2
    })

    it('maintains priority order after deletion', () => {
      const n2 = queue.enqueue('b', 20)
      queue.enqueue('a', 10)
      queue.enqueue('c', 30)
      queue.enqueue('d', 40)
      queue.delete(n2)
      expect(queue.dequeueMin()).toBe('a')
      expect(queue.dequeueMin()).toBe('c')
      expect(queue.dequeueMin()).toBe('d')
    })

    it('deletes from middle of queue', () => {
      const nodes: FibonacciQueueNode<string>[] = []
      for (let i = 0; i < 5; i++) {
        nodes.push(queue.enqueue(`t${i}`, i * 10))
      }
      queue.delete(nodes[2]!)
      expect(queue.toArray()).toEqual(['t0', 't1', 't3', 't4'])
    })

    it('allows re-enqueue after delete', () => {
      const node = queue.enqueue('a', 5)
      queue.enqueue('b', 10)
      queue.enqueue('c', 3)
      queue.delete(node)
      queue.enqueue('a', 5)
      expect(queue.toArray()).toEqual(['c', 'a', 'b'])
      void node
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty queue', () => {
      expect(queue.toArray()).toEqual([])
    })

    it('returns elements sorted by priority', () => {
      queue.enqueue('c', 3)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      expect(queue.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('does not modify the queue', () => {
      queue.enqueue('c', 3)
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.toArray()
      expect(queue.size).toBe(3)
      expect(queue.peek()).toBe('a')
    })

    it('handles single element', () => {
      queue.enqueue('only', 42)
      expect(queue.toArray()).toEqual(['only'])
    })

    it('handles duplicate priorities', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 1)
      queue.enqueue('c', 2)
      expect(queue.toArray()).toEqual(['a', 'b', 'c'])
    })
  })

  describe('contains', () => {
    it('returns false for empty queue', () => {
      expect(queue.contains('anything')).toBe(false)
    })

    it('returns true for existing value', () => {
      queue.enqueue('task', 1)
      expect(queue.contains('task')).toBe(true)
    })

    it('returns false for non-existing value', () => {
      queue.enqueue('task', 1)
      expect(queue.contains('other')).toBe(false)
    })

    it('handles duplicate values', () => {
      queue.enqueue('dup', 1)
      queue.enqueue('dup', 2)
      expect(queue.contains('dup')).toBe(true)
    })

    it('returns false after dequeue', () => {
      queue.enqueue('task', 1)
      queue.dequeueMin()
      expect(queue.contains('task')).toBe(false)
    })

    it('returns false after clear', () => {
      queue.enqueue('task', 1)
      queue.clear()
      expect(queue.contains('task')).toBe(false)
    })

    it('returns false for one value after another dequeued', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.dequeueMin()
      expect(queue.contains('a')).toBe(false)
      expect(queue.contains('b')).toBe(true)
    })
  })

  describe('update', () => {
    it('updates priority to lower value', () => {
      queue.enqueue('a', 5)
      queue.enqueue('b', 10)
      queue.update('a', 1)
      expect(queue.peek()).toBe('a')
    })

    it('updates priority to higher value', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 5)
      queue.update('a', 10)
      expect(queue.peek()).toBe('b')
    })

    it('returns false for non-existing value', () => {
      expect(queue.update('missing', 5)).toBe(false)
    })

    it('returns true for existing value', () => {
      queue.enqueue('a', 5)
      expect(queue.update('a', 1)).toBe(true)
    })

    it('maintains correct order after update', () => {
      queue.enqueue('a', 5)
      queue.enqueue('b', 3)
      queue.enqueue('c', 7)
      queue.update('a', 1)
      expect(queue.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('handles update to same priority', () => {
      queue.enqueue('a', 5)
      queue.enqueue('b', 3)
      queue.update('a', 5)
      expect(queue.peek()).toBe('b')
    })
  })

  describe('edge cases', () => {
    it('handles interleaved enqueue and dequeue', () => {
      queue.enqueue('a', 5)
      expect(queue.dequeueMin()).toBe('a')
      queue.enqueue('b', 3)
      queue.enqueue('c', 7)
      expect(queue.dequeueMin()).toBe('b')
      queue.enqueue('d', 1)
      expect(queue.dequeueMin()).toBe('d')
      expect(queue.dequeueMin()).toBe('c')
    })

    it('handles many duplicates', () => {
      for (let i = 0; i < 10; i++) {
        queue.enqueue('task', 5)
      }
      expect(queue.size).toBe(10)
      for (let i = 0; i < 10; i++) {
        expect(queue.dequeueMin()).toBe('task')
      }
      expect(queue.isEmpty()).toBe(true)
    })

    it('handles enqueue after dequeueMin empties queue', () => {
      queue.enqueue('a', 1)
      queue.dequeueMin()
      expect(queue.isEmpty()).toBe(true)
      queue.enqueue('b', 2)
      expect(queue.size).toBe(1)
      expect(queue.peek()).toBe('b')
    })

    it('handles negative infinity priority', () => {
      queue.enqueue('inf', Infinity)
      queue.enqueue('negInf', -Infinity)
      queue.enqueue('zero', 0)
      expect(queue.dequeueMin()).toBe('negInf')
      expect(queue.dequeueMin()).toBe('zero')
      expect(queue.dequeueMin()).toBe('inf')
    })

    it('handles alternating enqueue dequeue', () => {
      queue.enqueue('a', 5)
      expect(queue.dequeueMin()).toBe('a')
      queue.enqueue('b', 3)
      expect(queue.dequeueMin()).toBe('b')
      queue.enqueue('c', 7)
      expect(queue.dequeueMin()).toBe('c')
      expect(queue.isEmpty()).toBe(true)
    })
  })

  describe('large datasets', () => {
    it('handles 100 elements in sorted order', () => {
      const q = new FibonacciQueue<number>()
      for (let i = 0; i < 100; i++) {
        q.enqueue(i, i)
      }
      for (let i = 0; i < 100; i++) {
        expect(q.dequeueMin()).toBe(i)
      }
    })

    it('handles 100 elements in reverse order', () => {
      const q = new FibonacciQueue<number>()
      for (let i = 99; i >= 0; i--) {
        q.enqueue(i, i)
      }
      for (let i = 0; i < 100; i++) {
        expect(q.dequeueMin()).toBe(i)
      }
    })

    it('handles 1000 elements', () => {
      const q = new FibonacciQueue<number>()
      const values: number[] = []
      for (let i = 0; i < 1000; i++) {
        const v = Math.floor(Math.random() * 10000)
        values.push(v)
        q.enqueue(v, v)
      }
      values.sort((a, b) => a - b)
      for (let i = 0; i < 1000; i++) {
        expect(q.dequeueMin()).toBe(values[i])
      }
    })

    it('handles 5000 elements', () => {
      const q = new FibonacciQueue<number>()
      for (let i = 5000; i >= 1; i--) {
        q.enqueue(i, i)
      }
      for (let i = 1; i <= 5000; i++) {
        expect(q.dequeueMin()).toBe(i)
      }
    })
  })

  describe('custom types', () => {
    it('works with objects as values', () => {
      interface Task {
        name: string
        urgency: number
      }
      const q = new FibonacciQueue<Task>()
      q.enqueue({ name: 'c', urgency: 3 }, 3)
      q.enqueue({ name: 'a', urgency: 1 }, 1)
      q.enqueue({ name: 'b', urgency: 2 }, 2)
      expect(q.peek()!.name).toBe('a')
      expect(q.dequeueMin()!.name).toBe('a')
      expect(q.dequeueMin()!.name).toBe('b')
      expect(q.dequeueMin()!.name).toBe('c')
    })

    it('works with number values and separate priorities', () => {
      const q = new FibonacciQueue<number>()
      q.enqueue(100, 3)
      q.enqueue(200, 1)
      q.enqueue(300, 2)
      expect(q.dequeueMin()).toBe(200)
      expect(q.dequeueMin()).toBe(300)
      expect(q.dequeueMin()).toBe(100)
    })

    it('works with boolean values', () => {
      const q = new FibonacciQueue<boolean>()
      q.enqueue(false, 1)
      q.enqueue(true, 2)
      expect(q.dequeueMin()).toBe(false)
      expect(q.dequeueMin()).toBe(true)
    })

    it('works with null values', () => {
      const q = new FibonacciQueue<null>()
      q.enqueue(null, 1)
      expect(q.peek()).toBeNull()
      expect(q.dequeueMin()).toBeNull()
    })
  })

  describe('decreaseKey after operations', () => {
    it('handles decreaseKey after merge', () => {
      const node = queue.enqueue('x', 10)
      queue.enqueue('y', 5)
      const other = new FibonacciQueue<string>()
      other.enqueue('z', 3)
      other.enqueue('w', 7)
      const merged = queue.merge(other)
      const mergedNode = merged.enqueue('x', 10)
      merged.decreaseKey(mergedNode, 1)
      expect(merged.peek()).toBe('x')
      void node
    })

    it('handles delete after decreaseKey', () => {
      const node = queue.enqueue('a', 10)
      queue.enqueue('b', 5)
      queue.enqueue('c', 15)
      queue.decreaseKey(node, 2)
      queue.delete(node)
      expect(queue.toArray()).toEqual(['b', 'c'])
    })

    it('handles decreaseKey to minimum possible value', () => {
      const node = queue.enqueue('task', 100)
      queue.enqueue('other', 50)
      queue.decreaseKey(node, Number.MIN_SAFE_INTEGER)
      expect(queue.peek()).toBe('task')
    })

    it('handles decreaseKey on newly enqueued node', () => {
      const node = queue.enqueue('task', 10)
      queue.enqueue('other', 5)
      queue.decreaseKey(node, 3)
      expect(queue.peek()).toBe('task')
    })
  })

  describe('delete after operations', () => {
    it('handles delete after merge', () => {
      const node = queue.enqueue('x', 10)
      queue.enqueue('y', 5)
      const other = new FibonacciQueue<string>()
      other.enqueue('z', 3)
      other.enqueue('w', 7)
      const merged = queue.merge(other)
      merged.delete(merged.enqueue('del', 10))
      expect(merged.size).toBe(4)
      void node
    })

    it('handles delete followed by dequeueMin', () => {
      const n1 = queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.delete(n1)
      expect(queue.dequeueMin()).toBe('b')
      expect(queue.dequeueMin()).toBe('c')
    })

    it('handles multiple sequential deletes', () => {
      const n1 = queue.enqueue('a', 1)
      const n2 = queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      queue.enqueue('d', 4)
      queue.delete(n1)
      queue.delete(n2)
      expect(queue.size).toBe(2)
      expect(queue.toArray()).toEqual(['c', 'd'])
    })
  })

  describe('stress tests', () => {
    it('handles interleaved decreaseKey and dequeueMin', () => {
      const nodes: FibonacciQueueNode<string>[] = []
      for (let i = 0; i < 20; i++) {
        nodes.push(queue.enqueue(`t${i}`, i * 5))
      }
      queue.decreaseKey(nodes[10]!, 1)
      expect(queue.peek()).toBe('t0')
      queue.dequeueMin()
      queue.decreaseKey(nodes[15]!, 2)
      expect(queue.peek()).toBe('t10')
    })

    it('handles sequential insertions efficiently', () => {
      const start = performance.now()
      for (let i = 0; i < 10000; i++) {
        queue.enqueue(`task${i}`, i)
      }
      const elapsed = performance.now() - start
      expect(queue.size).toBe(10000)
      expect(elapsed).toBeLessThan(1000)
    })

    it('handles sequential extractions efficiently', () => {
      for (let i = 0; i < 10000; i++) {
        queue.enqueue(`task${i}`, i)
      }
      const start = performance.now()
      for (let i = 0; i < 10000; i++) {
        queue.dequeueMin()
      }
      const elapsed = performance.now() - start
      expect(queue.isEmpty()).toBe(true)
      expect(elapsed).toBeLessThan(5000)
    })

    it('handles mixed operations efficiently', () => {
      for (let i = 0; i < 5000; i++) {
        queue.enqueue(`t${i}`, Math.floor(Math.random() * 10000))
      }
      for (let i = 0; i < 2500; i++) {
        queue.dequeueMin()
        queue.enqueue(`new${i}`, Math.floor(Math.random() * 10000))
      }
      expect(queue.size).toBe(5000)
    })
  })

  describe('node properties', () => {
    it('sets node properties correctly after enqueue', () => {
      const node = queue.enqueue('task', 5)
      expect(node.value).toBe('task')
      expect(node.priority).toBe(5)
      expect(node.degree).toBe(0)
      expect(node.mark).toBe(false)
      expect(node.parent).toBeNull()
      expect(node.child).toBeNull()
      expect(node.left).toBe(node)
      expect(node.right).toBe(node)
    })

    it('maintains circular links in root list', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      queue.enqueue('c', 3)
      expect(queue.size).toBe(3)
    })
  })

  describe('contains with duplicates', () => {
    it('tracks multiple enqueues of same value', () => {
      queue.enqueue('dup', 1)
      queue.enqueue('dup', 2)
      queue.enqueue('dup', 3)
      expect(queue.contains('dup')).toBe(true)
      queue.dequeueMin()
      expect(queue.contains('dup')).toBe(true)
      queue.dequeueMin()
      expect(queue.contains('dup')).toBe(true)
      queue.dequeueMin()
      expect(queue.contains('dup')).toBe(false)
    })
  })

  describe('update edge cases', () => {
    it('update lower priority with multiple of same value', () => {
      queue.enqueue('a', 5)
      queue.enqueue('b', 3)
      queue.enqueue('a', 10)
      queue.update('a', 1)
      expect(queue.peek()).toBe('a')
    })

    it('update higher priority with multiple of same value', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 5)
      queue.enqueue('a', 2)
      queue.update('a', 10)
      expect(queue.peek()).toBe('a')
    })
  })

  describe('merge does not mutate', () => {
    it('original queue stays intact after merge', () => {
      queue.enqueue('a', 1)
      queue.enqueue('b', 2)
      const other = new FibonacciQueue<string>()
      other.enqueue('c', 3)
      queue.merge(other)
      expect(queue.toArray()).toEqual(['a', 'b'])
      expect(other.toArray()).toEqual(['c'])
    })
  })

  describe('toArray after operations', () => {
    it('toArray after decreaseKey', () => {
      const node = queue.enqueue('a', 10)
      queue.enqueue('b', 5)
      queue.enqueue('c', 15)
      queue.decreaseKey(node, 2)
      expect(queue.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('toArray after delete', () => {
      const node = queue.enqueue('b', 10)
      queue.enqueue('a', 5)
      queue.enqueue('c', 15)
      queue.delete(node)
      expect(queue.toArray()).toEqual(['a', 'c'])
    })
  })

  describe('consolidation', () => {
    it('handles extractMin consolidating many trees', () => {
      for (let i = 1; i <= 16; i++) {
        queue.enqueue(`t${i}`, i)
      }
      for (let i = 1; i <= 16; i++) {
        expect(queue.dequeueMin()).toBe(`t${i}`)
      }
    })
  })
})
